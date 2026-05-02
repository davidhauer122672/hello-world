/**
 * Buffer Application Integration Service
 *
 * Connects Buffer social media management to Coastal Key Enterprise.
 * Handles scheduling, publishing, and analytics for all social channels.
 *
 * Channels: Instagram, Facebook, LinkedIn, Twitter/X, Google Business Profile
 *
 * Integration flow:
 *  1. Content generated (Claude or Banana Pro AI)
 *  2. Queued to Buffer via this service
 *  3. Buffer publishes on schedule
 *  4. Analytics pulled back to Airtable Content Calendar
 */

const BUFFER_API = 'https://api.bufferapp.com/1';

/**
 * Get authenticated Buffer headers.
 * @param {object} env
 * @returns {object}
 */
function bufferHeaders(env) {
  if (!env.BUFFER_ACCESS_TOKEN) throw new Error('BUFFER_ACCESS_TOKEN secret is not configured.');
  return {
    'Authorization': `Bearer ${env.BUFFER_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get all connected Buffer profiles (social channels).
 * @param {object} env
 * @returns {Promise<object[]>}
 */
export async function getProfiles(env) {
  const cacheKey = 'buffer:profiles';
  if (env.CACHE) {
    const cached = await env.CACHE.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const response = await fetch(`${BUFFER_API}/profiles.json`, {
    headers: bufferHeaders(env),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Buffer profiles error (${response.status}): ${err}`);
  }

  const profiles = await response.json();

  if (env.CACHE) {
    await env.CACHE.put(cacheKey, JSON.stringify(profiles), { expirationTtl: 3600 });
  }

  return profiles;
}

/**
 * Resolve a platform name to its Buffer profile ID.
 * @param {object} env
 * @param {string} platform - e.g., 'instagram', 'facebook', 'linkedin', 'twitter'
 * @returns {Promise<string|null>}
 */
export async function resolveProfileId(env, platform) {
  const profiles = await getProfiles(env);
  const normalizedPlatform = platform.toLowerCase().replace('x', 'twitter');

  const match = profiles.find(p =>
    p.service?.toLowerCase() === normalizedPlatform ||
    p.formatted_service?.toLowerCase() === normalizedPlatform
  );

  return match?.id || null;
}

/**
 * Schedule a post to Buffer.
 * @param {object} env
 * @param {object} params
 * @param {string} params.text - Post content
 * @param {string|string[]} params.profileIds - Buffer profile ID(s)
 * @param {string} [params.scheduledAt] - ISO 8601 timestamp for scheduling
 * @param {object} [params.media] - Media attachment { link, photo, thumbnail }
 * @param {boolean} [params.now=false] - Publish immediately
 * @returns {Promise<object>}
 */
export async function schedulePost(env, { text, profileIds, scheduledAt, media, now }) {
  const ids = Array.isArray(profileIds) ? profileIds : [profileIds];

  const body = {
    text,
    profile_ids: ids,
    shorten: true,
  };

  if (now) {
    body.now = true;
  } else if (scheduledAt) {
    body.scheduled_at = scheduledAt;
  }

  if (media) {
    body.media = media;
  }

  const response = await fetch(`${BUFFER_API}/updates/create.json`, {
    method: 'POST',
    headers: bufferHeaders(env),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Buffer schedule error (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Schedule a post across multiple platforms simultaneously.
 * @param {object} env
 * @param {object} params
 * @param {string} params.text - Post content
 * @param {string[]} params.platforms - Platform names
 * @param {string} [params.scheduledAt] - ISO 8601 timestamp
 * @param {object} [params.media] - Media attachment
 * @returns {Promise<object>}
 */
export async function crossPostSchedule(env, { text, platforms, scheduledAt, media }) {
  const profileIds = [];
  for (const platform of platforms) {
    const id = await resolveProfileId(env, platform);
    if (id) profileIds.push(id);
  }

  if (profileIds.length === 0) {
    throw new Error(`No Buffer profiles found for platforms: ${platforms.join(', ')}`);
  }

  return schedulePost(env, { text, profileIds, scheduledAt, media });
}

/**
 * Get pending posts in queue for a profile.
 * @param {object} env
 * @param {string} profileId
 * @returns {Promise<object>}
 */
export async function getPendingPosts(env, profileId) {
  const response = await fetch(`${BUFFER_API}/profiles/${profileId}/updates/pending.json`, {
    headers: bufferHeaders(env),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Buffer pending error (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Get sent (published) posts for a profile.
 * @param {object} env
 * @param {string} profileId
 * @param {number} [count=20]
 * @returns {Promise<object>}
 */
export async function getSentPosts(env, profileId, count = 20) {
  const response = await fetch(
    `${BUFFER_API}/profiles/${profileId}/updates/sent.json?count=${count}`,
    { headers: bufferHeaders(env) }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Buffer sent error (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Get analytics for a specific post.
 * @param {object} env
 * @param {string} updateId - Buffer update/post ID
 * @returns {Promise<object>}
 */
export async function getPostAnalytics(env, updateId) {
  const response = await fetch(
    `${BUFFER_API}/updates/${updateId}/interactions.json`,
    { headers: bufferHeaders(env) }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Buffer analytics error (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Sync Buffer analytics back to Airtable Content Calendar.
 * Pulls recent published posts and updates matching calendar records.
 * @param {object} env
 * @param {Function} updateCalendarRecord - Callback to update Airtable record
 * @returns {Promise<object>} - { synced, errors }
 */
export async function syncAnalyticsToCalendar(env, updateCalendarRecord) {
  const profiles = await getProfiles(env);
  let synced = 0;
  const errors = [];

  for (const profile of profiles) {
    try {
      const sentData = await getSentPosts(env, profile.id, 10);
      const posts = sentData.updates || [];

      for (const post of posts) {
        const stats = post.statistics || {};
        const analyticsData = {
          'Buffer Post ID': post.id,
          'Platform': profile.formatted_service || profile.service,
          'Published At': post.sent_at ? new Date(post.sent_at * 1000).toISOString() : null,
          'Impressions': stats.impressions || 0,
          'Engagements': stats.engagements || (stats.clicks || 0) + (stats.likes || 0) + (stats.shares || 0),
          'Clicks': stats.clicks || 0,
          'Likes': stats.likes || 0,
          'Shares': stats.shares || 0,
          'Comments': stats.comments || 0,
          'Engagement Rate': stats.impressions > 0
            ? ((stats.engagements || 0) / stats.impressions * 100).toFixed(2) + '%'
            : '0%',
          'Buffer Sync': new Date().toISOString(),
        };

        try {
          await updateCalendarRecord(post.text, analyticsData);
          synced++;
        } catch (err) {
          errors.push({ postId: post.id, error: err.message });
        }
      }
    } catch (err) {
      errors.push({ profileId: profile.id, error: err.message });
    }
  }

  return { synced, errors };
}
