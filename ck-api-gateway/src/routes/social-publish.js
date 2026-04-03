/**
 * WF-2: Social Approval → Buffer Publish Route
 *
 * POST /v1/workflows/wf2 — Social Approval to Buffer Pipeline
 *
 * Fires when a Content Calendar record's Status changes to "Approved".
 * 1. Sends Slack preview to #content-calendar
 * 2. Schedules post via Buffer API (Caption → text, Asset → image, Post Date → scheduled_at)
 * 3. Updates Airtable: Status → "Scheduled", Buffer Post ID → Notes
 *
 * Supported platforms: Instagram, Facebook, LinkedIn, X (Twitter)
 *
 * Body: { recordId: "recXXX" }
 *
 * Deployment Tracker: recBDReVmJrH6dPHg
 * Content Calendar Table: tblEPr4f2lMz6ruxF
 *
 * Field IDs (verified from Deployment Tracker spec):
 *   Status:    fldD2rgOO9z1MTs9U
 *   Caption:   fldgJXI5IAaWcyw89
 *   Asset:     fldlbwkaiT9JBV18E
 *   Post Date: fldFESTOO3wxMT4u2
 *   Notes:     fld0hiWEXsL70GFpS
 */

import { getRecord, updateRecord, TABLES } from '../services/airtable.js';
import { createPost, resolveProfiles } from '../services/buffer.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Constants ────────────────────────────────────────────────────────────────

const SLACK_CHANNEL_CONTENT = '#content-calendar';

// ── Helpers ──────────────────────────────────────────────────────────────────

function validateRecordId(body) {
  if (!body || typeof body !== 'object') return '"recordId" is required.';
  if (!body.recordId || typeof body.recordId !== 'string') return '"recordId" is required.';
  if (!body.recordId.startsWith('rec')) return 'Invalid recordId. Must start with "rec".';
  return null;
}

function sendSlack(env, ctx, channel, text) {
  if (!env.SLACK_WEBHOOK_URL) return;

  ctx.waitUntil(
    fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text }),
    }).catch(err => console.error('Slack notification failed:', err))
  );
}

/**
 * Extract the first image URL from an Airtable attachment field.
 * @param {Array|undefined} attachments
 * @returns {string|null}
 */
function extractImageUrl(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) return null;
  return attachments[0].url || null;
}

/**
 * Normalize platform field value to an array of platform name strings.
 * Content Calendar Platform field may be a string, array of strings,
 * or array of { name } select objects.
 * @param {*} platformValue
 * @returns {string[]}
 */
function normalizePlatforms(platformValue) {
  if (!platformValue) return [];
  if (typeof platformValue === 'string') return [platformValue];
  if (Array.isArray(platformValue)) {
    return platformValue.map(p => (typeof p === 'object' && p !== null ? p.name || p : p));
  }
  if (typeof platformValue === 'object' && platformValue.name) return [platformValue.name];
  return [];
}

/**
 * Convert a date string to ISO 8601 format suitable for Buffer.
 * If the date has no time component, defaults to 10:00 AM EST (15:00 UTC).
 * @param {string} dateStr — YYYY-MM-DD or ISO string
 * @returns {string|null} — ISO 8601 datetime
 */
function toBufferScheduleTime(dateStr) {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return dateStr;
  return `${dateStr}T15:00:00Z`;
}

// ── WF-2 Handler ─────────────────────────────────────────────────────────────

/**
 * POST /v1/workflows/wf2 — WF-2 Social Approval → Buffer Publish.
 */
export async function handleWf2SocialPublish(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateRecordId(body);
  if (validationError) return errorResponse(validationError, 400);

  const { recordId } = body;

  // ── 1. Fetch Content Calendar record ──
  let record;
  try {
    record = await getRecord(env, TABLES.CONTENT_CALENDAR, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch Content Calendar record: ${err.message}`, 502);
  }

  const fields = record.fields;
  const postTitle = fields['Post Title'] || 'Untitled Post';
  const caption = fields['Caption'] || '';
  const postDate = fields['Post Date'] || null;
  const platforms = normalizePlatforms(fields['Platform']);
  const assetUrl = extractImageUrl(fields['Asset']);
  const status = typeof fields['Status'] === 'object' ? fields['Status']?.name : fields['Status'];

  // ── 2. Validate Status is Approved ──
  if (status !== 'Approved') {
    return jsonResponse({
      skipped: true,
      reason: `Status is "${status}", not "Approved". WF-2 only fires on Approved.`,
    });
  }

  if (!caption) {
    return errorResponse('Caption field is empty. Cannot publish without content.', 400);
  }

  // ── 3. Slack preview to #content-calendar ──
  const previewText = caption.length > 200 ? caption.slice(0, 200) + '...' : caption;
  sendSlack(env, ctx, SLACK_CHANNEL_CONTENT, [
    '*SOCIAL POST APPROVED*',
    `*Title:* ${postTitle}`,
    `*Platform:* ${platforms.join(', ') || 'Not specified'}`,
    `*Post Date:* ${postDate || 'Immediate'}`,
    `*Caption Preview:*\n${previewText}`,
  ].join('\n'));

  // ── 4. Buffer Create Post ──
  let bufferResult = null;
  let bufferPostId = null;

  if (platforms.length > 0) {
    try {
      const { profileIds, unmatchedPlatforms } = await resolveProfiles(env, platforms);

      if (unmatchedPlatforms.length > 0) {
        console.warn(`WF-2: Unmatched platforms: ${unmatchedPlatforms.join(', ')}`);
      }

      if (profileIds.length > 0) {
        bufferResult = await createPost(env, {
          text: caption,
          profileIds,
          scheduledAt: toBufferScheduleTime(postDate),
          imageUrl: assetUrl,
        });

        // Extract Buffer update ID from response
        if (bufferResult.updates) {
          const ids = bufferResult.updates.map(u => u.id).filter(Boolean);
          bufferPostId = ids.join(', ');
        } else if (bufferResult.update?.id) {
          bufferPostId = bufferResult.update.id;
        }
      } else {
        console.warn('WF-2: No matching Buffer profiles found for platforms:', platforms);
      }
    } catch (err) {
      console.error('WF-2 Buffer publish failed:', err);
      bufferPostId = `ERROR: ${err.message}`;
    }
  }

  // ── 5. Update Airtable: Status → Scheduled, Buffer Post ID → Notes ──
  const updateFields = {
    'Status': 'Scheduled',
  };

  if (bufferPostId) {
    const existingNotes = fields['Notes'] || '';
    const bufferNote = `[${new Date().toISOString()}] Buffer Post ID: ${bufferPostId}`;
    updateFields['Notes'] = existingNotes ? `${existingNotes}\n${bufferNote}` : bufferNote;
  }

  try {
    await updateRecord(env, TABLES.CONTENT_CALENDAR, recordId, updateFields);
  } catch (err) {
    console.error('WF-2 Airtable update failed:', err);
    return errorResponse(`Buffer post created but Airtable update failed: ${err.message}`, 502);
  }

  // ── 6. Audit log ──
  writeAudit(env, ctx, {
    route: '/v1/workflows/wf2',
    action: 'social_publish',
    recordId,
    postTitle,
    platforms: platforms.join(', '),
    bufferPostId: bufferPostId || 'none',
  });

  return jsonResponse({
    published: true,
    postTitle,
    platforms,
    bufferPostId: bufferPostId || null,
    bufferResult: bufferResult || null,
    airtableStatus: 'Scheduled',
  });
}
