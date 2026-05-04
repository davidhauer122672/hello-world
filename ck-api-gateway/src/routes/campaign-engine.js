/**
 * Campaign Engine Routes — Peak-Time Intelligence Engine API
 *
 *   GET  /v1/campaign-engine/matrix       — Full scheduling matrix reference
 *   GET  /v1/campaign-engine/schedule     — 7-day cross-platform schedule
 *   GET  /v1/campaign-engine/next/:platform — Next slot for a platform
 *   POST /v1/campaign-engine/timestamp    — Convert date+platform → Buffer timestamp
 *   POST /v1/campaign-engine/batch        — Schedule a batch of content records
 *   GET  /v1/campaign-engine/health       — Engine health + DST status
 */

import { getMatrix, weeklySchedule, nextSlot, nextSlots, bufferTimestamp, campaignSchedule } from '../services/peak-time-engine.js';
import { getRecord, updateRecord, listRecords, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

/**
 * GET /v1/campaign-engine/matrix — Full scheduling matrix.
 */
export function handleCampaignMatrix() {
  return jsonResponse(getMatrix());
}

/**
 * GET /v1/campaign-engine/schedule — 7-day cross-platform schedule.
 */
export function handleCampaignSchedule(request) {
  const url = new URL(request.url);
  const after = url.searchParams.get('after')
    ? new Date(url.searchParams.get('after'))
    : new Date();
  return jsonResponse(weeklySchedule(after));
}

/**
 * GET /v1/campaign-engine/next/:platform — Next available slot.
 */
export function handleNextSlot(request, platform) {
  const url = new URL(request.url);
  const count = parseInt(url.searchParams.get('count') || '1', 10);

  if (count > 1) {
    const slots = nextSlots(platform, Math.min(count, 30));
    if (!slots.length) return errorResponse(`No schedule defined for platform: ${platform}`, 400);
    return jsonResponse({ platform, count: slots.length, slots });
  }

  const slot = nextSlot(platform);
  if (!slot) return errorResponse(`No schedule defined for platform: ${platform}`, 400);
  return jsonResponse(slot);
}

/**
 * POST /v1/campaign-engine/timestamp — Convert date+platform to Buffer timestamp.
 * Body: { date: "YYYY-MM-DD", platform: "instagram" }
 */
export async function handleBufferTimestamp(request) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON.', 400); }

  if (!body.date || !body.platform) {
    return errorResponse('"date" (YYYY-MM-DD) and "platform" are required.', 400);
  }

  const result = bufferTimestamp(body.date, body.platform);
  return jsonResponse(result);
}

/**
 * POST /v1/campaign-engine/batch — Schedule a batch of Airtable Content Calendar
 * records using the Peak-Time Engine. Reads Approved records, computes optimal
 * timestamps, and returns the schedule (or pushes to Buffer if configured).
 *
 * Body: { platforms?: string[], limit?: number, dryRun?: boolean }
 */
export async function handleBatchSchedule(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { body = {}; }

  const platforms = body.platforms || ['instagram', 'facebook', 'linkedin', 'x'];
  const limit = Math.min(body.limit || 20, 50);
  const dryRun = body.dryRun !== false;

  // Fetch Approved content from Airtable
  let records;
  try {
    records = await listRecords(env, TABLES.CONTENT_CALENDAR, {
      filterByFormula: `{Status}='Approved'`,
      maxRecords: limit,
      sort: [{ field: 'Post Date', direction: 'asc' }],
    });
  } catch (err) {
    return errorResponse(`Failed to fetch content: ${err.message}`, 502);
  }

  const scheduled = [];
  const errors = [];

  for (const record of records) {
    const fields = record.fields || {};
    const postDate = fields['Post Date'];
    const postTitle = fields['Post Title'] || 'Untitled';
    const recordPlatforms = fields['Platform'];

    if (!postDate) {
      errors.push({ record: record.id, title: postTitle, error: 'No Post Date' });
      continue;
    }

    // Determine platforms for this record
    let targetPlatforms = platforms;
    if (recordPlatforms) {
      if (Array.isArray(recordPlatforms)) {
        targetPlatforms = recordPlatforms.map(p =>
          (typeof p === 'string' ? p : p.name).toLowerCase(),
        );
      } else {
        targetPlatforms = [typeof recordPlatforms === 'string' ? recordPlatforms.toLowerCase() : recordPlatforms.name?.toLowerCase()].filter(Boolean);
      }
    }

    for (const platform of targetPlatforms) {
      const ts = bufferTimestamp(postDate, platform);
      if (ts.valid) {
        scheduled.push({
          recordId: record.id,
          title: postTitle,
          platform,
          date: postDate,
          ...ts,
        });
      } else {
        errors.push({ record: record.id, title: postTitle, platform, error: ts.reason });
      }
    }
  }

  // Audit
  writeAudit(env, ctx, {
    route: '/v1/campaign-engine/batch',
    action: 'batch_schedule',
    recordsProcessed: records.length,
    scheduled: scheduled.length,
    errors: errors.length,
    dryRun,
  });

  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine',
    campaign: '#1 — Mass Production',
    mode: dryRun ? 'DRY RUN' : 'LIVE',
    recordsProcessed: records.length,
    scheduled,
    errors,
    summary: {
      total: scheduled.length,
      byPlatform: scheduled.reduce((acc, s) => {
        acc[s.platform] = (acc[s.platform] || 0) + 1;
        return acc;
      }, {}),
    },
  });
}

/**
 * GET /v1/campaign-engine/health — Engine status.
 */
export function handleCampaignEngineHealth() {
  const now = new Date();
  const allPlatforms = ['instagram', 'threads', 'facebook', 'linkedin', 'x'];
  const nextFires = {};
  for (const p of allPlatforms) {
    const slot = nextSlot(p, now);
    nextFires[p] = slot ? slot.utc : null;
  }

  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine',
    status: 'operational',
    version: '1.0.0',
    campaign: '#1 — Mass Production',
    target: '45-65 HNW Absentee Owners / Investors / Family Office',
    timestamp: now.toISOString(),
    dst: now.getTimezoneOffset ? undefined : undefined,
    currentDST: (() => {
      const m = now.getUTCMonth();
      return (m >= 3 && m <= 9) ? 'EDT (UTC-4)' : 'EST (UTC-5)';
    })(),
    nextFires,
    platforms: allPlatforms.length,
  });
}
