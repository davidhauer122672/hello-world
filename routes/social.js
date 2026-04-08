const express = require('express');
const router = express.Router();
const { asyncWrap } = require('../middleware/error-handler');
const {
  createDraft,
  approvePost,
  getCalendar,
  markPublished,
  getPostsByStatus,
} = require('../lib/social-publisher');

const VALID_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'alignable'];

// POST /api/social/draft – create a draft post
router.post('/draft', (req, res) => {
  const { platform, caption, mediaPath, contentPillar, scheduledFor } = req.body;

  if (!platform || !caption || !contentPillar) {
    return res.status(400).json({ error: 'platform, caption, and contentPillar are required' });
  }

  if (!VALID_PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: `Invalid platform. Valid: ${VALID_PLATFORMS.join(', ')}` });
  }

  const result = createDraft(platform, caption, mediaPath, contentPillar, scheduledFor);
  if (result.error) return res.status(400).json(result);

  res.status(201).json(result);
});

// POST /api/social/approve/:id – approve a post
router.post('/approve/:id', asyncWrap(async (req, res) => {
  const result = await approvePost(req.params.id);
  if (result.error) return res.status(400).json(result);
  res.json(result);
}));

// GET /api/social/calendar – list posts with optional filters
router.get('/calendar', (req, res) => {
  const { status, platform, date } = req.query;
  const posts = getCalendar({ status, platform, date });
  res.json(posts);
});

// POST /api/social/publish/:id – manually mark a post as published
router.post('/publish/:id', (req, res) => {
  const result = markPublished(req.params.id);
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

// GET /api/social/pending – get all posts pending manual publishing
router.get('/pending', (req, res) => {
  const posts = getPostsByStatus('approved_manual');
  if (posts.error) return res.status(400).json(posts);
  res.json(posts);
});

module.exports = router;
