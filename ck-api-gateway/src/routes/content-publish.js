/**
 * Content Publish Route — POST /v1/content/publish
 *
 * Replaces Zapier WF-2: reads an Approved Content Calendar record from Airtable,
 * pushes to Buffer API for multi-platform scheduling, and updates Airtable with
 * Buffer status. Falls back to manual mode when BUFFER_ACCESS_TOKEN is not set.
 *
 * Request body:
 *   recordId   (string, required) — Airtable Content Calendar record ID (rec...)
 *
 * Secrets required:
 *   BUFFER_ACCESS_TOKEN          — Buffer API access token
 *   BUFFER_PROFILE_INSTAGRAM     — Buffer profile ID for Instagram
 *   BUFFER_PROFILE_FACEBOOK      — Buffer profile ID for Facebook
 *   BUFFER_PROFILE_LINKEDIN      — Buffer profile ID for LinkedIn
 *   BUFFER_PROFILE_X             — Buffer profile ID for X (Twitter)
 *   BUFFER_PROFILE_ALIGNABLE     — Buffer profile ID for Alignable
 */

import { getRecord, updateRecord, createRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// Airtable Content Calendar field names
const FIELDS = {
  POST_TITLE: 'Post Title',
  POST_DATE: 'Post Date',
  PLATFORM: 'Platform',
  CAPTION: 'Caption',
  ASSET: 'Asset',
  STATUS: 'Status',
  HASHTAGS: 'Hashtags',
  NOTES: 'Notes',
  BUFFER_STATUS: 'Buffer Status',
  BUFFER_POST_ID: 'Buffer Post ID',
  BUFFER_SCHEDULED: 'Buffer Scheduled',
  CONTENT_PILLAR: 'Content Pillar',
  POST_TYPE: 'Post Type',
};

/**
 * Push a content update to Buffer API.
 */
async function bufferCreateUpdate(token, profileId, text, mediaUrl, scheduledAt) {
  const params = new URLSearchParams();
  params.set('access_token', token);
  params.set('text', text);
  params.set('profile_ids[]', profileId);

  if (mediaUrl) {
    params.set('media[photo]', mediaUrl);
  }

  if (scheduledAt) {
    params.set('scheduled_at', scheduledAt);
  }

  const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  return response.json();
}

/**
 * Build the full post text from caption + hashtags.
 */
function buildPostText(caption, hashtags) {
  if (!caption) return '';
  if (!hashtags) return caption;
  return `${caption}\n\n${hashtags}`;
}

/**
 * Extract the first attachment URL from an Airtable attachment array.
 */
function getAssetUrl(assetField) {
  if (!assetField || !Array.isArray(assetField) || assetField.length === 0) return null;
  return assetField[0].url || null;
}

/**
 * Extract platform names from Airtable select field.
 */
function getPlatforms(platformField) {
  if (!platformField) return [];
  if (Array.isArray(platformField)) {
    return platformField.map(p => (typeof p === 'string' ? p : p.name).toLowerCase());
  }
  return [typeof platformField === 'string' ? platformField.toLowerCase() : platformField.name?.toLowerCase()].filter(Boolean);
}

export async function handleContentPublish(request, env, ctx) {
  const body = await request.json();

  if (!body.recordId) {
    return errorResponse('"recordId" is required.', 400);
  }

  // ── 1. Read the Content Calendar record ──
  let record;
  try {
    record = await getRecord(env, TABLES.CONTENT_CALENDAR, body.recordId);
  } catch (err) {
    return errorResponse(`Failed to read record: ${err.message}`, 404);
  }

  const fields = record.fields || {};
  const status = typeof fields[FIELDS.STATUS] === 'object' ? fields[FIELDS.STATUS]?.name : fields[FIELDS.STATUS];

  if (status !== 'Approved') {
    return errorResponse(`Record status is "${status}". Must be "Approved" to publish.`, 400);
  }

  const caption = fields[FIELDS.CAPTION] || '';
  const hashtags = fields[FIELDS.HASHTAGS] || '';
  const postText = buildPostText(caption, hashtags);
  const assetUrl = getAssetUrl(fields[FIELDS.ASSET]);
  const platforms = getPlatforms(fields[FIELDS.PLATFORM]);
  const postDate = fields[FIELDS.POST_DATE] || null;
  const postTitle = fields[FIELDS.POST_TITLE] || 'Untitled';

  if (!postText) {
    return errorResponse('Record has no caption. Cannot publish empty content.', 400);
  }

  if (platforms.length === 0) {
    return errorResponse('No platforms specified on this record.', 400);
  }

  // ── 2. Check Buffer configuration ──
  const bufferToken = env.BUFFER_ACCESS_TOKEN || null;
  const isManualMode = !bufferToken;

  // Convert post date to scheduled_at timestamp (noon EST)
  let scheduledAt = null;
  if (postDate) {
    const dateObj = new Date(`${postDate}T12:00:00-04:00`);
    if (dateObj > new Date()) {
      scheduledAt = Math.floor(dateObj.getTime() / 1000).toString();
    }
  }

  // ── 3a. Manual mode — return payload for human posting ──
  if (isManualMode) {
    const manualPayload = {
      mode: 'manual',
      record_id: body.recordId,
      title: postTitle,
      platforms,
      post_text: postText,
      asset_url: assetUrl,
      scheduled_for: postDate,
      instructions: 'BUFFER_ACCESS_TOKEN not configured. Copy the content below and post manually to each platform.',
    };

    // Update Airtable status
    ctx.waitUntil(
      updateRecord(env, TABLES.CONTENT_CALENDAR, body.recordId, {
        [FIELDS.BUFFER_STATUS]: 'Manual',
        [FIELDS.NOTES]: `${fields[FIELDS.NOTES] || ''}\n\nPUBLISH ATTEMPTED — ${new Date().toISOString()}\nMode: MANUAL (Buffer not configured)\nPlatforms: ${platforms.join(', ')}`,
      }).catch(err => console.error('Airtable update failed:', err))
    );

    writeAudit(env, ctx, {
      route: '/v1/content/publish',
      recordId: body.recordId,
      mode: 'manual',
      platforms,
    });

    return jsonResponse(manualPayload);
  }

  // ── 3b. Buffer mode — push to each platform ──
  const results = [];
  const errors = [];

  for (const platform of platforms) {
    const profileId = env[`BUFFER_PROFILE_${platform.toUpperCase()}`];
    if (!profileId) {
      errors.push({ platform, error: `No BUFFER_PROFILE_${platform.toUpperCase()} secret configured` });
      continue;
    }

    try {
      const result = await bufferCreateUpdate(bufferToken, profileId, postText, assetUrl, scheduledAt);

      if (result.success) {
        const updateId = result.updates?.[0]?.id || null;
        results.push({ platform, status: 'scheduled', buffer_update_id: updateId });
      } else {
        errors.push({ platform, error: result.message || 'Buffer API rejected the update' });
      }
    } catch (err) {
      errors.push({ platform, error: err.message });
    }
  }

  // ── 4. Update Airtable with results ──
  const allSucceeded = errors.length === 0 && results.length > 0;
  const bufferPostIds = results.map(r => r.buffer_update_id).filter(Boolean).join(', ');

  const airtableUpdate = {
    [FIELDS.BUFFER_STATUS]: allSucceeded ? 'Scheduled' : (results.length > 0 ? 'Partial' : 'Failed'),
    [FIELDS.BUFFER_SCHEDULED]: allSucceeded,
  };

  if (bufferPostIds) {
    airtableUpdate[FIELDS.BUFFER_POST_ID] = bufferPostIds;
  }

  const logLines = [
    `PUBLISH EXECUTED — ${new Date().toISOString()}`,
    `Mode: BUFFER API`,
    `Platforms attempted: ${platforms.join(', ')}`,
    `Succeeded: ${results.map(r => r.platform).join(', ') || 'none'}`,
    `Failed: ${errors.map(e => `${e.platform} (${e.error})`).join(', ') || 'none'}`,
    bufferPostIds ? `Buffer IDs: ${bufferPostIds}` : '',
  ].filter(Boolean).join('\n');

  airtableUpdate[FIELDS.NOTES] = `${fields[FIELDS.NOTES] || ''}\n\n${logLines}`;

  ctx.waitUntil(
    updateRecord(env, TABLES.CONTENT_CALENDAR, body.recordId, airtableUpdate)
      .catch(err => console.error('Airtable update failed:', err))
  );

  // ── 5. AI Log ──
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Content Publish: ${postTitle} — ${new Date().toISOString()}`,
      'Module': 'Social',
      'Request Type': 'content_publish',
      'Input Brief': `Record: ${body.recordId} | Platforms: ${platforms.join(', ')}`,
      'Output Text': logLines,
      'Status': allSucceeded ? 'Completed' : (results.length > 0 ? 'Partial' : 'Failed'),
      'Timestamp': new Date().toISOString(),
      'Content Calendar': [body.recordId],
    }).catch(err => console.error('AI Log write failed:', err))
  );

  writeAudit(env, ctx, {
    route: '/v1/content/publish',
    recordId: body.recordId,
    mode: 'buffer',
    platforms,
    succeeded: results.length,
    failed: errors.length,
  });

  return jsonResponse({
    mode: 'buffer',
    record_id: body.recordId,
    title: postTitle,
    scheduled_for: postDate,
    results,
    errors,
    buffer_status: allSucceeded ? 'scheduled' : (results.length > 0 ? 'partial' : 'failed'),
  });
}
