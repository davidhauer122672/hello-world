/**
 * Buffer Integration Service — Schedule social media posts via Buffer API.
 *
 * Buffer API docs: https://publish.buffer.com/api
 *
 * Requires BUFFER_ACCESS_TOKEN secret (set via wrangler secret put).
 * Requires BUFFER_PROFILE_IDS environment variable mapping:
 *   { "Instagram": "id1", "Facebook": "id2", "LinkedIn": "id3" }
 */

const BUFFER_API = 'https://api.bufferapp.com/1';

/**
 * Platform name → Buffer profile ID mapping.
 * Loaded from env.BUFFER_PROFILE_IDS (JSON string) or defaults.
 */
function getProfileMap(env) {
  if (env.BUFFER_PROFILE_IDS) {
    try {
      return JSON.parse(env.BUFFER_PROFILE_IDS);
    } catch {
      console.error('Failed to parse BUFFER_PROFILE_IDS, using empty map');
    }
  }
  return {};
}

/**
 * Resolve a platform name to a Buffer profile ID.
 * @param {object} env
 * @param {string} platform — "Instagram", "Facebook", or "LinkedIn"
 * @returns {string|null}
 */
export function resolveProfileId(env, platform) {
  const map = getProfileMap(env);
  return map[platform] || map[platform.toLowerCase()] || null;
}

/**
 * Schedule a post to Buffer.
 *
 * @param {object} env — Worker environment (needs BUFFER_ACCESS_TOKEN)
 * @param {object} opts
 * @param {string[]} opts.profileIds — Buffer profile IDs to post to
 * @param {string} opts.text — Post text (caption + hashtags)
 * @param {string} [opts.mediaUrl] — Direct URL to image/video file
 * @param {string} [opts.scheduledAt] — ISO 8601 datetime for scheduling
 * @returns {object} — Buffer API response
 */
export async function createBufferPost(env, { profileIds, text, mediaUrl, scheduledAt }) {
  if (!env.BUFFER_ACCESS_TOKEN) {
    throw new Error('BUFFER_ACCESS_TOKEN secret is not configured.');
  }

  if (!profileIds || profileIds.length === 0) {
    throw new Error('At least one Buffer profile ID is required.');
  }

  const body = {
    profile_ids: profileIds,
    text,
    shorten: true,
  };

  if (mediaUrl) {
    body.media = { photo: mediaUrl };
  }

  if (scheduledAt) {
    // Buffer expects Unix timestamp or ISO string
    body.scheduled_at = scheduledAt;
  } else {
    // Queue immediately (Buffer's default "add to queue" behavior)
    body.now = false;
  }

  const response = await fetch(`${BUFFER_API}/updates/create.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${env.BUFFER_ACCESS_TOKEN}`,
    },
    body: encodeFormData(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Buffer API error (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Get all Buffer profiles for the authenticated user.
 * Useful for verifying profile IDs and connection status.
 */
export async function getBufferProfiles(env) {
  if (!env.BUFFER_ACCESS_TOKEN) {
    throw new Error('BUFFER_ACCESS_TOKEN secret is not configured.');
  }

  const response = await fetch(`${BUFFER_API}/profiles.json`, {
    headers: {
      'Authorization': `Bearer ${env.BUFFER_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Buffer profiles error (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Encode an object as application/x-www-form-urlencoded.
 * Handles nested objects and arrays for Buffer API compatibility.
 */
function encodeFormData(obj, prefix = '') {
  const parts = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (value === null || value === undefined) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      parts.push(encodeFormData(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        parts.push(`${encodeURIComponent(fullKey)}[]=${encodeURIComponent(v)}`);
      });
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }

  return parts.filter(Boolean).join('&');
}
