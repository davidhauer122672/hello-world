const express = require('express');
const router = express.Router();
const visualGenerator = require('../lib/visual-generator');

const VALID_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'alignable'];

// POST /api/visuals/social-brief
router.post('/social-brief', (req, res) => {
  const { caption, platform, contentPillar, associatedPostId } = req.body;

  if (!caption) {
    return res.status(400).json({ error: 'caption is required' });
  }

  if (platform && !VALID_PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: `Invalid platform. Valid: ${VALID_PLATFORMS.join(', ')}` });
  }

  try {
    const brief = visualGenerator.generateSocialBrief(caption, platform, contentPillar, associatedPostId);
    res.status(201).json(brief);
  } catch (err) {
    console.error('[visuals] social-brief error:', err.message);
    res.status(500).json({ error: 'Failed to generate social brief' });
  }
});

// POST /api/visuals/thumbnail-brief
router.post('/thumbnail-brief', (req, res) => {
  const { videoTitle, targetSegment, contentType, associatedPostId } = req.body;

  if (!videoTitle) {
    return res.status(400).json({ error: 'videoTitle is required' });
  }

  try {
    const brief = visualGenerator.generateThumbnailBrief(videoTitle, targetSegment, contentType, associatedPostId);
    res.status(201).json(brief);
  } catch (err) {
    console.error('[visuals] thumbnail-brief error:', err.message);
    res.status(500).json({ error: 'Failed to generate thumbnail brief' });
  }
});

// POST /api/visuals/carousel-brief
router.post('/carousel-brief', (req, res) => {
  const { topic, slideCount, platform, associatedPostId } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'topic is required' });
  }

  if (platform && !VALID_PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: `Invalid platform. Valid: ${VALID_PLATFORMS.join(', ')}` });
  }

  try {
    const briefs = visualGenerator.generateCarouselBrief(topic, slideCount, platform, associatedPostId);
    res.status(201).json({ slideCount: briefs.length, slides: briefs });
  } catch (err) {
    console.error('[visuals] carousel-brief error:', err.message);
    res.status(500).json({ error: 'Failed to generate carousel brief' });
  }
});

// GET /api/visuals/pending
router.get('/pending', (_req, res) => {
  try {
    const pending = visualGenerator.getPendingBriefs();
    res.json({ count: pending.length, briefs: pending });
  } catch (err) {
    console.error('[visuals] pending error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve pending briefs' });
  }
});

// POST /api/visuals/mark-generated/:id
router.post('/mark-generated/:id', (req, res) => {
  const { id } = req.params;
  const { assetPath } = req.body;

  if (!assetPath) {
    return res.status(400).json({ error: 'assetPath is required' });
  }

  try {
    const updated = visualGenerator.markGenerated(id, assetPath);
    if (!updated) {
      return res.status(404).json({ error: 'Brief not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('[visuals] mark-generated error:', err.message);
    res.status(500).json({ error: 'Failed to mark brief as generated' });
  }
});

// GET /api/visuals/by-post/:postId
router.get('/by-post/:postId', (req, res) => {
  const { postId } = req.params;

  try {
    const briefs = visualGenerator.getBriefsByPost(postId);
    res.json({ count: briefs.length, briefs });
  } catch (err) {
    console.error('[visuals] by-post error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve briefs for post' });
  }
});

module.exports = router;
