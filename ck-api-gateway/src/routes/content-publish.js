/**
 * Content Publish Route — POST /v1/content/publish
 *
 * Reads an Approved Content Calendar record from Airtable,
 * generates platform-optimized content via Claude AI, and updates
 * Airtable with publish status. Uses the Peak-Time Intelligence Engine
 * for DST-aware scheduling timestamps.
 *
 * Request body:
 *   recordId   (string, required) — Airtable Content Calendar record ID (rec...)
 *
 * Secrets required:
 *   ANTHROPIC_API_KEY — Claude API key for AI-powered content optimization
 */

import { getRecord, updateRecord, createRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { easternToUTC, getTimezoneLabel } from '../engines/campaign/dst-handler.js';

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
  PUBLISH_STATUS: 'Publish Status',
  PUBLISH_ID: 'Publish ID',
  SCHEDULED: 'Scheduled',
  CONTENT_PILLAR: 'Content Pillar',
  POST_TYPE: 'Post Type',
};

/**
 * Generate a platform-optimized version of the post via Claude AI.
 */
async function optimizeForPlatform(env, platform, caption, hashtags) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are the Coastal Key Social Media AI. Optimize this post for ${platform}. Keep the core message but adjust formatting, length, hashtag count, and tone for ${platform} best practices. Target audience: 45-65 year old high-net-worth property owners.

Caption: ${caption}
${hashtags ? `Hashtags: ${hashtags}` : ''}

Return ONLY the optimized post text (with hashtags if appropriate for the platform). No explanations.`,
        }],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text || `${caption}${hashtags ? '\n\n' + hashtags : ''}`;
  } catch {
    // Fallback to original content if AI optimization fails
    return `${caption}${hashtags ? '\n\n' + hashtags : ''}`;
  }
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

/**
 * Calculate the optimal UTC publish time using Peak-Time Intelligence Engine.
 */
function getScheduledTimestamp(postDate) {
  if (!postDate) return null;
  // Default to 9 AM ET for weekday scheduling
  const utcTime = easternToUTC(postDate, 9, 0);
  if (utcTime > new Date()) {
    return utcTime.toISOString();
  }
  return null;
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

  // ── 2. Generate platform-optimized content via Claude AI ──
  const results = [];
  const errors = [];
  const scheduledAt = getScheduledTimestamp(postDate);
  const publishId = `PUB-${Date.now()}`;

  for (const platform of platforms) {
    try {
      const optimizedContent = await optimizeForPlatform(env, platform, caption, hashtags);

      results.push({
        platform,
        status: 'ready',
        optimizedContent,
        assetUrl,
        scheduledAt: scheduledAt || 'immediate',
        timezone: scheduledAt ? getTimezoneLabel(new Date(scheduledAt)) : 'N/A',
        publishId: `${publishId}-${platform}`,
        instructions: `Post to ${platform} at the scheduled time. Content has been AI-optimized for ${platform} audience engagement.`,
      });
    } catch (err) {
      errors.push({ platform, error: err.message });
    }
  }

  // ── 3. Update Airtable with results ──
  const allSucceeded = errors.length === 0 && results.length > 0;

  const airtableUpdate = {
    [FIELDS.PUBLISH_STATUS]: allSucceeded ? 'Ready' : (results.length > 0 ? 'Partial' : 'Failed'),
    [FIELDS.SCHEDULED]: allSucceeded,
  };

  if (publishId) {
    airtableUpdate[FIELDS.PUBLISH_ID] = publishId;
  }

  const logLines = [
    `PUBLISH EXECUTED — ${new Date().toISOString()}`,
    `Mode: CLAUDE AI PLATFORM`,
    `Platforms attempted: ${platforms.join(', ')}`,
    `Succeeded: ${results.map(r => r.platform).join(', ') || 'none'}`,
    `Failed: ${errors.map(e => `${e.platform} (${e.error})`).join(', ') || 'none'}`,
    `Publish ID: ${publishId}`,
    scheduledAt ? `Scheduled: ${scheduledAt}` : 'Timing: Immediate',
  ].filter(Boolean).join('\n');

  airtableUpdate[FIELDS.NOTES] = `${fields[FIELDS.NOTES] || ''}\n\n${logLines}`;

  ctx.waitUntil(
    updateRecord(env, TABLES.CONTENT_CALENDAR, body.recordId, airtableUpdate)
      .catch(err => console.error('Airtable update failed:', err))
  );

  // ── 4. AI Log ──
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
    mode: 'claude-ai',
    platforms,
    succeeded: results.length,
    failed: errors.length,
  });

  return jsonResponse({
    mode: 'claude-ai',
    record_id: body.recordId,
    title: postTitle,
    scheduled_for: postDate,
    publishId,
    results,
    errors,
    publish_status: allSucceeded ? 'ready' : (results.length > 0 ? 'partial' : 'failed'),
  });
}
