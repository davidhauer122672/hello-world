/**
 * Buffer Integration — Peak-Time Intelligence Engine
 *
 * Formats posts with DST-corrected UTC timestamps and dispatches
 * to the Buffer API.  Supports all 5 platforms in the scheduling matrix.
 *
 * Buffer API endpoint: POST https://api.bufferapp.com/1/updates/create.json
 * Required: access_token, profile_ids[], text, scheduled_at (ISO 8601 UTC)
 */

import { toBufferTimestamp, getTimezoneLabel } from './dst-handler.js';
import { PLATFORMS } from './scheduling-matrix.js';

// ── Buffer API ─────────────────────────────────────────────────────────────

const BUFFER_API_BASE = 'https://api.bufferapp.com/1';

/**
 * Send a scheduled post to Buffer.
 *
 * @param {Object} env          Worker env bindings
 * @param {Object} options
 * @param {string} options.platform      Platform ID (instagram, facebook, etc.)
 * @param {string} options.text          Post caption / body text
 * @param {Date}   options.scheduledAt   UTC Date object (from scheduling-matrix)
 * @param {string} [options.mediaUrl]    Optional media URL
 * @param {string} [options.link]        Optional link to attach
 * @returns {Promise<Object>} Buffer API response
 */
export async function schedulePost(env, options) {
  const { platform, text, scheduledAt, mediaUrl, link } = options;

  const token = env.BUFFER_ACCESS_TOKEN;
  if (!token) {
    return {
      success: false,
      mode: 'manual',
      reason: 'BUFFER_ACCESS_TOKEN not configured',
      manualInstructions: {
        platform,
        text,
        scheduledAt: scheduledAt.toISOString(),
        timezone: getTimezoneLabel(scheduledAt),
        action: 'Copy text and post manually at the scheduled time.',
      },
    };
  }

  const platformConfig = PLATFORMS[platform];
  if (!platformConfig) {
    return { success: false, reason: `Unknown platform: ${platform}` };
  }

  const profileId = env[platformConfig.bufferProfileEnv];
  if (!profileId) {
    return {
      success: false,
      mode: 'manual',
      reason: `${platformConfig.bufferProfileEnv} not configured`,
      manualInstructions: {
        platform,
        platformLabel: platformConfig.label,
        text,
        scheduledAt: scheduledAt.toISOString(),
        action: `Set ${platformConfig.bufferProfileEnv} in worker secrets, then retry.`,
      },
    };
  }

  const params = new URLSearchParams();
  params.set('access_token', token);
  params.set('profile_ids[]', profileId);
  params.set('text', text);
  params.set('scheduled_at', toBufferTimestamp(scheduledAt));

  if (mediaUrl) {
    params.set('media[photo]', mediaUrl);
  }
  if (link) {
    params.set('media[link]', link);
  }

  const response = await fetch(`${BUFFER_API_BASE}/updates/create.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const result = await response.json();

  if (!result.success) {
    return {
      success: false,
      mode: 'buffer_error',
      bufferMessage: result.message || 'Unknown Buffer API error',
      statusCode: response.status,
    };
  }

  const bufferId = result.updates?.[0]?.id || null;

  return {
    success: true,
    mode: 'scheduled',
    platform,
    platformLabel: platformConfig.label,
    bufferId,
    scheduledAt: toBufferTimestamp(scheduledAt),
    timezone: getTimezoneLabel(scheduledAt),
  };
}

/**
 * Schedule a batch of posts across multiple platforms.
 *
 * @param {Object} env
 * @param {Array<Object>} posts Each: { platform, text, scheduledAt, mediaUrl?, link? }
 * @returns {Promise<Object>} Batch result with per-post status
 */
export async function scheduleBatch(env, posts) {
  const results = [];
  let successCount = 0;
  let manualCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    const result = await schedulePost(env, post);
    results.push({ ...post, scheduledAt: post.scheduledAt.toISOString(), result });

    if (result.success) successCount++;
    else if (result.mode === 'manual') manualCount++;
    else errorCount++;
  }

  return {
    totalPosts: posts.length,
    scheduled: successCount,
    manual: manualCount,
    errors: errorCount,
    results,
  };
}

/**
 * Check the status of a Buffer update.
 *
 * @param {Object} env
 * @param {string} bufferId  Buffer update ID
 * @returns {Promise<Object>}
 */
export async function checkPostStatus(env, bufferId) {
  const token = env.BUFFER_ACCESS_TOKEN;
  if (!token) return { success: false, reason: 'BUFFER_ACCESS_TOKEN not configured' };

  const response = await fetch(
    `${BUFFER_API_BASE}/updates/${bufferId}.json?access_token=${encodeURIComponent(token)}`,
  );
  const data = await response.json();

  return {
    bufferId,
    status: data.status || 'unknown',
    sentAt: data.sent_at ? new Date(data.sent_at * 1000).toISOString() : null,
    text: data.text || null,
    platform: data.profile_service || null,
  };
}

/**
 * Get Buffer profile configuration status for all platforms.
 *
 * @param {Object} env
 * @returns {Object} Per-platform config status
 */
export function getBufferConfigStatus(env) {
  const hasToken = !!env.BUFFER_ACCESS_TOKEN;
  const profiles = {};

  for (const [id, platform] of Object.entries(PLATFORMS)) {
    profiles[id] = {
      label: platform.label,
      envVar: platform.bufferProfileEnv,
      configured: !!env[platform.bufferProfileEnv],
    };
  }

  const configuredCount = Object.values(profiles).filter(p => p.configured).length;

  return {
    bufferTokenConfigured: hasToken,
    profiles,
    configuredPlatforms: configuredCount,
    totalPlatforms: Object.keys(PLATFORMS).length,
    mode: hasToken && configuredCount > 0 ? 'automated' : 'manual',
  };
}
