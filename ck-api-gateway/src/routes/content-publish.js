/**
 * Content Publish Route — POST /v1/content/publish
 *
 * Reads an Approved Content Calendar record from Airtable,
 * prepares content for direct platform posting, and updates Airtable
 * with publish status.
 *
 * Request body:
 *   recordId   (string, required) — Airtable Content Calendar record ID (rec...)
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
  CONTENT_PILLAR: 'Content Pillar',
  POST_TYPE: 'Post Type',
};

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

  // ── 2. Prepare content for direct platform posting ──
  const publishPayload = {
    mode: 'direct',
    record_id: body.recordId,
    title: postTitle,
    platforms,
    post_text: postText,
    asset_url: assetUrl,
    scheduled_for: postDate,
    instructions: 'Copy the content below and post directly to each platform.',
  };

  // Update Airtable status
  ctx.waitUntil(
    updateRecord(env, TABLES.CONTENT_CALENDAR, body.recordId, {
      [FIELDS.NOTES]: `${fields[FIELDS.NOTES] || ''}\n\nPUBLISH PREPARED — ${new Date().toISOString()}\nMode: DIRECT PLATFORM POSTING\nPlatforms: ${platforms.join(', ')}`,
    }).catch(err => console.error('Airtable update failed:', err))
  );

  // ── 3. AI Log ──
  const logLines = [
    `PUBLISH PREPARED — ${new Date().toISOString()}`,
    `Mode: DIRECT PLATFORM POSTING`,
    `Platforms: ${platforms.join(', ')}`,
  ].join('\n');

  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Content Publish: ${postTitle} — ${new Date().toISOString()}`,
      'Module': 'Social',
      'Request Type': 'content_publish',
      'Input Brief': `Record: ${body.recordId} | Platforms: ${platforms.join(', ')}`,
      'Output Text': logLines,
      'Status': 'Completed',
      'Timestamp': new Date().toISOString(),
      'Content Calendar': [body.recordId],
    }).catch(err => console.error('AI Log write failed:', err))
  );

  writeAudit(env, ctx, {
    route: '/v1/content/publish',
    recordId: body.recordId,
    mode: 'direct',
    platforms,
  });

  return jsonResponse(publishPayload);
}
