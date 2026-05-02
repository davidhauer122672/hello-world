const express = require('express');
const router = express.Router();
const {
  launchCycle,
  generateCycleSummary,
  getActiveCycle,
  getCycleHistory,
  TOTAL_FLEET,
} = require('../lib/master-orchestrator');

router.get('/status', (_req, res) => {
  const cycle = getActiveCycle();
  res.json({
    orchestrator: 'Coastal Key Master Orchestrator',
    fleet: TOTAL_FLEET,
    schedule: 'Weekdays 8:00 AM EST (13:00 UTC)',
    cycle,
  });
});

router.post('/launch', (_req, res) => {
  const cycle = launchCycle('manual');
  res.json({
    launched: true,
    cycleId: cycle.cycleId,
    fleet: cycle.fleet,
    execution: cycle.execution,
    systemHealth: cycle.systemHealth,
  });
});

router.get('/summary', (_req, res) => {
  const summary = generateCycleSummary();
  res.json(summary);
});

router.get('/summary/text', (_req, res) => {
  const summary = generateCycleSummary();
  if (summary.textSummary) {
    res.type('text/plain').send(summary.textSummary);
  } else {
    res.type('text/plain').send(summary.error || 'No active cycle');
  }
});

router.get('/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 90);
  const history = getCycleHistory(limit);
  res.json({ count: history.length, entries: history });
});

module.exports = router;
