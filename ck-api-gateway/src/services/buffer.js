/**
 * Buffer API Service — Publish and schedule social media posts via Buffer.
 *
 * Buffer API v1: https://buffer.com/developers/api
 * Requires BUFFER_ACCESS_TOKEN secret (set via wrangler secret put).
 *
 * Supported channels: Instagram Business, Facebook Page, LinkedIn Company Page, X (Twitter).
 */

const BUFFER_API = 'https://api.bufferapp.com/1';

/**
 * List all connected Buffer profiles (channels).
 * @param {object} env — Worker env with BUFFER_ACCESS_TOKEN
 * @returns {object[]} — Array of profile objects
 */
export async function listProfiles(env) {
  const res = await fetch(`${BUFFER_API}/profiles.json?access_token=${env.BUFFER_ACCESS_TOKEN}`);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Buffer profiles error (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Create a scheduled post on one or more Buffer profiles.
 *
 * @param {object} env — Worker env with BUFFER_ACCESS_TOKEN
 * @param {object} options
 * @param {string} options.text — Post caption / body text
 * @param {string[]} options.profileIds — Buffer profile IDs to post to
 * @param {string} [options.scheduledAt] — ISO 8601 datetime for scheduling (omit for immediate queue)
 * @param {string} [options.imageUrl] — URL of image attachment (must be publicly accessible)
 * @param {string} [options.link] — Link to include in the post
 * @returns {object} — Buffer API response with update IDs
 */
export async function createPost(env, { text, profileIds, scheduledAt, imageUrl, link }) {
  if (!env.BUFFER_ACCESS_TOKEN) {
    throw new Error('BUFFER_ACCESS_TOKEN secret is not configured.');
  }

  const body = new URLSearchParams();
  body.append('text', text);
  body.append('access_token', env.BUFFER_ACCESS_TOKEN);

  for (const id of profileIds) {
    body.append('profile_ids[]', id);
  }

  if (scheduledAt) {
    body.append('scheduled_at', scheduledAt);
  }

  if (imageUrl) {
    body.append('media[photo]', imageUrl);
  }

  if (link) {
    body.append('media[link]', link);
  }

  const res = await fetch(`${BUFFER_API}/updates/create.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Buffer create post error (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Get a specific Buffer update (post) by ID.
 * @param {object} env
 * @param {string} updateId — Buffer update ID
 * @returns {object} — Update object
 */
export async function getUpdate(env, updateId) {
  const res = await fetch(
    `${BUFFER_API}/updates/${updateId}.json?access_token=${env.BUFFER_ACCESS_TOKEN}`,
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Buffer get update error (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Resolve Buffer profile IDs from platform names.
 * Matches platform strings (instagram, facebook, linkedin, x/twitter) against connected profiles.
 *
 * @param {object} env
 * @param {string[]} platforms — e.g. ["Instagram", "Facebook", "LinkedIn", "X"]
 * @returns {object} — { profileIds: string[], unmatchedPlatforms: string[] }
 */
export async function resolveProfiles(env, platforms) {
  const profiles = await listProfiles(env);

  const platformMap = {
    instagram: 'instagram',
    facebook: 'facebook',
    linkedin: 'linkedin',
    twitter: 'twitter',
    x: 'twitter',
  };

  const profileIds = [];
  const unmatchedPlatforms = [];

  for (const platform of platforms) {
    const normalized = platform.toLowerCase().trim();
    const service = platformMap[normalized];

    if (!service) {
      unmatchedPlatforms.push(platform);
      continue;
    }

    const match = profiles.find(p => p.service === service);
    if (match) {
      profileIds.push(match.id);
    } else {
      unmatchedPlatforms.push(platform);
    }
  }

  return { profileIds, unmatchedPlatforms };
}
