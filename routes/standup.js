const express = require('express');
const router = express.Router();
const { buildStandup, getStandupHistory } = require('../lib/ceo-standup');

// GET /api/standup — Generate and return today's CEO standup briefing
router.get('/', (_req, res) => {
  const standup = buildStandup();
  res.json(standup);
});

// GET /api/standup/text — Text-only summary (for SMS/Slack)
router.get('/text', (_req, res) => {
  const standup = buildStandup();
  res.type('text/plain').send(standup.summary);
});

// GET /api/standup/history — Previous standup entries
router.get('/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 90);
  const history = getStandupHistory(limit);
  res.json({ count: history.length, entries: history });
});

module.exports = router;
