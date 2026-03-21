const express = require('express');
const router = express.Router();
const visualGenerator = require('../lib/visual-generator');

// POST /api/visuals/social-brief
router.post('/social-brief', (req, res) => {
  const { caption, platform, contentPillar, associatedPostId } = req.body;

  if (!caption) {
    return res.status(400).json({ error: 'caption is required' });
  }

  try {
    const brief = visualGenerator.generateSocialBrief(
      caption,
      platform,
      contentPillar,
      associatedPostId
    );
    res.status(201).json(brief);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate social brief', details: err.message });
  }
});

// POST /api/visuals/thumbnail-brief
router.post('/thumbnail-brief', (req, res) => {
  const { videoTitle, targetSegment, contentType, associatedPostId } = req.body;

  if (!videoTitle) {
    return res.status(400).json({ error: 'videoTitle is required' });
  }

  try {
    const brief = visualGenerator.generateThumbnailBrief(
      videoTitle,
      targetSegment,
      contentType,
      associatedPostId
    );
    res.status(201).json(brief);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate thumbnail brief', details: err.message });
  }
});

// POST /api/visuals/carousel-brief
router.post('/carousel-brief', (req, res) => {
  const { topic, slideCount, platform, associatedPostId } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'topic is required' });
  }

  try {
    const briefs = visualGenerator.generateCarouselBrief(
      topic,
      slideCount,
      platform,
      associatedPostId
    );
    res.status(201).json({ slideCount: briefs.length, slides: briefs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate carousel brief', details: err.message });
  }
});

// GET /api/visuals/pending
router.get('/pending', (_req, res) => {
  try {
    const pending = visualGenerator.getPendingBriefs();
    res.json({ count: pending.length, briefs: pending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve pending briefs', details: err.message });
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
    res.status(500).json({ error: 'Failed to mark brief as generated', details: err.message });
  }
});

// GET /api/visuals/by-post/:postId
router.get('/by-post/:postId', (req, res) => {
  const { postId } = req.params;

  try {
    const briefs = visualGenerator.getBriefsByPost(postId);
    res.json({ count: briefs.length, briefs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve briefs for post', details: err.message });
  }
});

module.exports = router;
