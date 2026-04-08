const express = require('express');
const router = express.Router();
const {
  createDraft,
  approvePost,
  getCalendar,
  markPublished,
  getPostsByStatus,
} = require('../lib/social-publisher');

// POST /api/social/draft – create a draft post
router.post('/draft', (req, res) => {
  const { platform, caption, mediaPath, contentPillar, scheduledFor } = req.body;

  if (!platform || !caption || !contentPillar) {
    return res.status(400).json({ error: 'platform, caption, and contentPillar are required' });
  }

  const result = createDraft(platform, caption, mediaPath, contentPillar, scheduledFor);
  if (result.error) return res.status(400).json(result);

  res.status(201).json(result);
});

// POST /api/social/approve/:id – approve a post
router.post('/approve/:id', async (req, res) => {
  try {
    const result = await approvePost(req.params.id);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('Social route: approve failed:', err.message);
    res.status(500).json({ error: 'Failed to approve post' });
  }
});

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
