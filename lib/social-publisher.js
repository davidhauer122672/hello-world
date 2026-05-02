const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const cron = require('node-cron');

const DATA_FILE = path.join(__dirname, '..', 'data', 'content-calendar.json');

const VALID_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'alignable'];
const VALID_PILLARS = ['brand', 'ceo_journey'];
const VALID_STATUSES = ['draft', 'approved', 'approved_manual', 'scheduled', 'published', 'failed'];

// ---------------------------------------------------------------------------
// JSON file helpers (mirrors lib/db.js pattern)
// ---------------------------------------------------------------------------

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function getPosts() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function savePosts(posts) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

function getPostById(id) {
  return getPosts().find((p) => p.id === id) || null;
}

function updatePost(id, updates) {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  Object.assign(posts[idx], updates);
  savePosts(posts);
  return posts[idx];
}

// ---------------------------------------------------------------------------
// Buffer API helpers
// ---------------------------------------------------------------------------

function getBufferToken() {
  return process.env.BUFFER_ACCESS_TOKEN || null;
}

function isManualMode() {
  return !getBufferToken();
}

/**
 * Make a POST request to the Buffer API.
 * Returns a Promise that resolves with the parsed JSON response.
 */
function bufferPost(endpoint, params) {
  return new Promise((resolve, reject) => {
    const token = getBufferToken();
    if (!token) return reject(new Error('BUFFER_ACCESS_TOKEN not set'));

    const body = querystring.stringify({ access_token: token, ...params });

    const options = {
      hostname: 'api.bufferapp.com',
      port: 443,
      path: `/1/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Buffer API: invalid JSON response – ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

/**
 * Fetch a single update from Buffer to check its status.
 */
function bufferGetUpdate(updateId) {
  return new Promise((resolve, reject) => {
    const token = getBufferToken();
    if (!token) return reject(new Error('BUFFER_ACCESS_TOKEN not set'));

    const reqPath = `/1/updates/${updateId}.json?access_token=${encodeURIComponent(token)}`;

    https.get({ hostname: 'api.bufferapp.com', port: 443, path: reqPath }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Buffer API: invalid JSON response – ${data}`));
        }
      });
    }).on('error', (err) => reject(err));
  });
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Create a draft post in the content calendar.
 */
function createDraft(platform, caption, mediaPath, contentPillar, scheduledFor) {
  if (!VALID_PLATFORMS.includes(platform)) {
    return { error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}` };
  }
  if (!VALID_PILLARS.includes(contentPillar)) {
    return { error: `Invalid contentPillar. Must be one of: ${VALID_PILLARS.join(', ')}` };
  }
  if (!caption) {
    return { error: 'caption is required' };
  }

  const posts = getPosts();
  const post = {
    id: crypto.randomUUID(),
    platform,
    caption,
    mediaPath: mediaPath || null,
    contentPillar,
    status: 'draft',
    createdAt: new Date().toISOString(),
    scheduledFor: scheduledFor || null,
    publishedAt: null,
    bufferPostId: null,
  };

  posts.push(post);
  savePosts(posts);
  console.log(`Social: Draft created – ${post.id} (${platform})`);
  return post;
}

/**
 * Approve a post. If Buffer is configured, push it to Buffer; otherwise mark
 * as approved_manual so the user can copy-paste and post manually.
 */
async function approvePost(postId) {
  const post = getPostById(postId);
  if (!post) return { error: 'Post not found' };
  if (post.status !== 'draft') return { error: `Cannot approve post with status "${post.status}"` };

  if (isManualMode()) {
    const updated = updatePost(postId, { status: 'approved_manual' });
    console.log(`Social: Post ${postId} approved (manual mode)`);
    return {
      ...updated,
      manualInstructions: {
        message: 'Buffer not configured. Copy the caption below and post manually.',
        platform: updated.platform,
        caption: updated.caption,
        mediaPath: updated.mediaPath,
      },
    };
  }

  // Push to Buffer
  try {
    const params = {
      text: post.caption,
      profile_ids: process.env[`BUFFER_PROFILE_${post.platform.toUpperCase()}`] || '',
    };

    if (post.mediaPath) {
      params['media[photo]'] = post.mediaPath;
    }

    if (post.scheduledFor) {
      params.scheduled_at = post.scheduledFor;
    }

    const result = await bufferPost('updates/create.json', params);

    if (!result.success) {
      const updated = updatePost(postId, { status: 'failed' });
      console.error(`Social: Buffer rejected post ${postId}:`, result.message || 'Unknown error');
      return { ...updated, bufferError: result.message || 'Unknown Buffer error' };
    }

    const bufferPostId = (result.updates && result.updates[0] && result.updates[0].id) || null;
    const newStatus = post.scheduledFor ? 'scheduled' : 'approved';
    const updated = updatePost(postId, { status: newStatus, bufferPostId });
    console.log(`Social: Post ${postId} pushed to Buffer (${newStatus}) – bufferPostId: ${bufferPostId}`);
    return updated;
  } catch (err) {
    console.error(`Social: Failed to push post ${postId} to Buffer:`, err.message);
    const updated = updatePost(postId, { status: 'failed' });
    return { ...updated, bufferError: err.message };
  }
}

/**
 * List posts with optional filters: status, platform, date (matches scheduledFor date).
 */
function getCalendar(filters = {}) {
  let posts = getPosts();

  if (filters.status) {
    posts = posts.filter((p) => p.status === filters.status);
  }
  if (filters.platform) {
    posts = posts.filter((p) => p.platform === filters.platform);
  }
  if (filters.date) {
    posts = posts.filter((p) => p.scheduledFor && p.scheduledFor.startsWith(filters.date));
  }

  return posts;
}

/**
 * Manually mark a post as published (for manual posting workflows).
 */
function markPublished(postId) {
  const post = getPostById(postId);
  if (!post) return { error: 'Post not found' };

  const updated = updatePost(postId, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
  console.log(`Social: Post ${postId} manually marked as published`);
  return updated;
}

/**
 * Get all posts with a given status.
 */
function getPostsByStatus(status) {
  if (!VALID_STATUSES.includes(status)) {
    return { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` };
  }
  return getPosts().filter((p) => p.status === status);
}

/**
 * Start a cron job that checks Buffer every 30 minutes for publish
 * confirmations and updates local post statuses accordingly.
 */
function startPublishTracker() {
  if (isManualMode()) {
    console.log('Social: Buffer not configured – publish tracker disabled (manual mode)');
    return null;
  }

  console.log('Social: Publish tracker started (every 30 min)');

  const task = cron.schedule('*/30 * * * *', async () => {
    const pending = getPosts().filter(
      (p) => p.bufferPostId && ['approved', 'scheduled'].includes(p.status)
    );

    if (pending.length === 0) return;

    console.log(`Social: Checking ${pending.length} post(s) for publish status...`);

    for (const post of pending) {
      try {
        const update = await bufferGetUpdate(post.bufferPostId);

        if (update.status === 'sent') {
          updatePost(post.id, {
            status: 'published',
            publishedAt: update.sent_at ? new Date(update.sent_at * 1000).toISOString() : new Date().toISOString(),
          });
          console.log(`Social: Post ${post.id} confirmed published via Buffer`);
        }
      } catch (err) {
        console.error(`Social: Failed to check Buffer status for post ${post.id}:`, err.message);
      }
    }
  });

  return task;
}

module.exports = {
  createDraft,
  approvePost,
  getCalendar,
  markPublished,
  getPostsByStatus,
  startPublishTracker,
};
