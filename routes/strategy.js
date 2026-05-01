const express = require('express');
const router = express.Router();
const {
  getBlueprint,
  getMaturityScore,
  getInitiatives,
  getRiskRegister,
  getKPICockpit,
  getOperatingCadence,
  getExecutionTracker,
  getBoardBriefing,
} = require('../lib/strategy-engine');

router.get('/', (_req, res) => {
  res.json(getBlueprint());
});

router.get('/maturity', (_req, res) => {
  res.json(getMaturityScore());
});

router.get('/initiatives', (req, res) => {
  const { horizon } = req.query;
  res.json({ initiatives: getInitiatives(horizon) });
});

router.get('/kpis', (req, res) => {
  const { category } = req.query;
  res.json({ kpis: getKPICockpit(category) });
});

router.get('/risks', (_req, res) => {
  res.json({ risks: getRiskRegister() });
});

router.get('/cadence', (req, res) => {
  const { frequency } = req.query;
  res.json({ cadence: getOperatingCadence(frequency) });
});

router.get('/execution', (_req, res) => {
  res.json({ commitments: getExecutionTracker() });
});

router.get('/board-briefing', (_req, res) => {
  res.json(getBoardBriefing());
});

module.exports = router;
