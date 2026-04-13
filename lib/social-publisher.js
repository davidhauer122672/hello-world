const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cron = require('node-cron');

const DATA_FILE = path.join(__dirname, '..', 'data', 'content-calendar.json');

const VALID_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'threads', 'x'];
const VALID_PILLARS = ['brand', 'ceo_journey'];
const VALID_STATUSES = ['draft', 'approved', 'scheduled', 'published', 'failed'];

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
    publishId: null,
  };

  posts.push(post);
  savePosts(posts);
  console.log(`Social: Draft created – ${post.id} (${platform})`);
  return post;
}

/**
 * Approve a post. Content is prepared for publishing via the Claude AI platform.
 * Returns the post with publishing instructions for manual platform posting.
 */
async function approvePost(postId) {
  const post = getPostById(postId);
  if (!post) return { error: 'Post not found' };
  if (post.status !== 'draft') return { error: `Cannot approve post with status "${post.status}"` };

  const publishId = `PUB-${Date.now()}`;
  const updated = updatePost(postId, {
    status: 'approved',
    publishId,
  });

  console.log(`Social: Post ${postId} approved — Claude AI platform (${publishId})`);
  return {
    ...updated,
    publishInstructions: {
      message: 'Post approved. Content optimized by Claude AI. Post to the target platform at the scheduled time.',
      platform: updated.platform,
      caption: updated.caption,
      mediaPath: updated.mediaPath,
      scheduledFor: updated.scheduledFor,
      publishId,
    },
  };
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
 * Mark a post as published.
 */
function markPublished(postId) {
  const post = getPostById(postId);
  if (!post) return { error: 'Post not found' };

  const updated = updatePost(postId, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
  console.log(`Social: Post ${postId} marked as published`);
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
 * Start a cron job that checks for scheduled posts and logs reminders.
 * Publishes are managed through the Claude AI platform.
 */
function startPublishTracker() {
  console.log('Social: Publish tracker started (every 30 min) — Claude AI platform');

  const task = cron.schedule('*/30 * * * *', async () => {
    const pending = getPosts().filter(
      (p) => ['approved', 'scheduled'].includes(p.status)
    );

    if (pending.length === 0) return;

    console.log(`Social: ${pending.length} post(s) awaiting publish confirmation...`);

    for (const post of pending) {
      // Check if scheduled time has passed
      if (post.scheduledFor) {
        const scheduledTime = new Date(post.scheduledFor);
        if (scheduledTime <= new Date()) {
          console.log(`Social: Post ${post.id} (${post.platform}) is past scheduled time — awaiting manual publish confirmation`);
        }
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
