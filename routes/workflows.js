const express = require('express');
const router = express.Router();
const { asyncWrap } = require('../middleware/error-handler');
const { executeWorkflow, getExecutionLog, getAILog, WORKFLOW_MAP } = require('../lib/workflows');

// POST /api/workflows/:name — Execute a workflow by name
// Airtable automations POST here to trigger workflows
router.post('/:name', asyncWrap(async (req, res) => {
  const { name } = req.params;

  if (!WORKFLOW_MAP[name]) {
    return res.status(400).json({
      error: `Unknown workflow: ${name}`,
      available: Object.keys(WORKFLOW_MAP),
    });
  }

  const result = await executeWorkflow(name, req.body);
  const status = result.status === 'error' ? 400 : 200;
  res.status(status).json(result);
}));

// GET /api/workflows — List available workflows
router.get('/', (_req, res) => {
  res.json({
    workflows: Object.keys(WORKFLOW_MAP).filter(k => k.startsWith('wf')),
    aliases: Object.keys(WORKFLOW_MAP).filter(k => !k.startsWith('wf')),
    usage: 'POST /api/workflows/:name with JSON payload',
  });
});

// GET /api/workflows/log — View execution log
router.get('/log', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({ entries: getExecutionLog(limit) });
});

// GET /api/workflows/ai-log — View AI inference log
router.get('/ai-log', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({ entries: getAILog(limit) });
});

module.exports = router;
