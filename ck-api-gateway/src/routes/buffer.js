/**
 * Buffer Integration Routes
 *
 *   GET  /v1/buffer/profiles     — List connected social profiles
 *   POST /v1/buffer/schedule     — Schedule a post
 *   POST /v1/buffer/cross-post   — Schedule across multiple platforms
 *   GET  /v1/buffer/queue/:id    — Get pending posts for a profile
 *   GET  /v1/buffer/sent/:id     — Get published posts for a profile
 *   POST /v1/buffer/sync         — Sync analytics to Airtable Content Calendar
 *   GET  /v1/buffer/health       — Buffer connection status
 */

import { getProfiles, schedulePost, crossPostSchedule, getPendingPosts, getSentPosts, syncAnalyticsToCalendar } from '../services/buffer.js';
import { listRecords, updateRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

/**
 * GET /v1/buffer/profiles — List all connected Buffer social profiles.
 */
export async function handleBufferProfiles(env) {
  const profiles = await getProfiles(env);
  return jsonResponse({
    profiles: profiles.map(p => ({
      id: p.id,
      service: p.formatted_service || p.service,
      avatar: p.avatar_https,
      schedules: p.schedules,
      counts: p.counts,
    })),
    count: profiles.length,
  });
}

/**
 * POST /v1/buffer/schedule — Schedule a single post.
 */
export async function handleBufferSchedule(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { text, profileIds, scheduledAt, media, now } = body;
  if (!text) return errorResponse('"text" is required.', 400);
  if (!profileIds) return errorResponse('"profileIds" is required.', 400);

  const result = await schedulePost(env, { text, profileIds, scheduledAt, media, now });

  writeAudit(env, ctx, { route: '/v1/buffer/schedule', action: 'schedule_post', immediate: !!now });

  return jsonResponse({ scheduled: true, update: result });
}

/**
 * POST /v1/buffer/cross-post — Schedule across multiple platforms.
 */
export async function handleBufferCrossPost(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { text, platforms, scheduledAt, media } = body;
  if (!text) return errorResponse('"text" is required.', 400);
  if (!platforms || !Array.isArray(platforms)) return errorResponse('"platforms" array is required.', 400);

  const result = await crossPostSchedule(env, { text, platforms, scheduledAt, media });

  writeAudit(env, ctx, { route: '/v1/buffer/cross-post', action: 'cross_post', platforms: platforms.join(',') });

  return jsonResponse({ scheduled: true, platforms, update: result });
}

/**
 * GET /v1/buffer/queue/:id — Get pending posts for a Buffer profile.
 */
export async function handleBufferQueue(profileId, env) {
  if (!profileId) return errorResponse('Profile ID is required.', 400);

  const result = await getPendingPosts(env, profileId);
  return jsonResponse({
    profileId,
    pending: result.updates || [],
    count: result.total || 0,
  });
}

/**
 * GET /v1/buffer/sent/:id — Get published posts for a Buffer profile.
 */
export async function handleBufferSent(profileId, env, url) {
  if (!profileId) return errorResponse('Profile ID is required.', 400);

  const count = parseInt(url.searchParams.get('count') || '20');
  const result = await getSentPosts(env, profileId, count);
  return jsonResponse({
    profileId,
    sent: result.updates || [],
    count: result.total || 0,
  });
}

/**
 * POST /v1/buffer/sync — Sync Buffer analytics to Airtable Content Calendar.
 */
export async function handleBufferSync(env, ctx) {
  const updateCalendarRecord = async (postText, analyticsData) => {
    // Find matching Content Calendar record by content snippet
    const snippet = postText.slice(0, 50);
    const records = await listRecords(env, TABLES.CONTENT_CALENDAR, {
      filterByFormula: `SEARCH("${snippet.replace(/"/g, '\\"')}", {Content Body})`,
      maxRecords: 1,
    });

    if (records.length > 0) {
      await updateRecord(env, TABLES.CONTENT_CALENDAR, records[0].id, {
        'Buffer Post ID': analyticsData['Buffer Post ID'],
        'Published At': analyticsData['Published At'],
        'Impressions': analyticsData['Impressions'],
        'Engagements': analyticsData['Engagements'],
        'Engagement Rate': analyticsData['Engagement Rate'],
        'Buffer Sync': analyticsData['Buffer Sync'],
      });
    }
  };

  const result = await syncAnalyticsToCalendar(env, updateCalendarRecord);

  writeAudit(env, ctx, { route: '/v1/buffer/sync', action: 'analytics_sync', synced: result.synced });

  return jsonResponse(result);
}

/**
 * GET /v1/buffer/health — Buffer connection health check.
 */
export async function handleBufferHealth(env) {
  const status = {
    service: 'buffer',
    configured: !!env.BUFFER_ACCESS_TOKEN,
    timestamp: new Date().toISOString(),
  };

  if (env.BUFFER_ACCESS_TOKEN) {
    try {
      const profiles = await getProfiles(env);
      status.connectivity = 'operational';
      status.profileCount = profiles.length;
      status.channels = profiles.map(p => p.formatted_service || p.service);
    } catch (err) {
      status.connectivity = 'error';
      status.error = err.message;
    }
  } else {
    status.connectivity = 'not_configured';
  }

  return jsonResponse(status);
}
