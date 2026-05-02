const express = require('express');
const router = express.Router();
const { asyncWrap } = require('../middleware/error-handler');
const {
  classifyObjection,
  getReframe,
  generateReframe,
  handleRetellWebhook,
  getCallLog
} = require('../lib/objection-handler');

// POST /api/objections/classify
router.post('/classify', asyncWrap(async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'transcript is required' });
  }
  const result = await classifyObjection(transcript);
  const reframe = getReframe(result.objectionType);
  res.json({ ...result, reframe: reframe ? reframe.reframe : null });
}));

// POST /api/objections/reframe
router.post('/reframe', asyncWrap(async (req, res) => {
  const { objectionType, transcript, context } = req.body;

  if (objectionType) {
    const scripted = getReframe(objectionType);
    if (scripted) return res.json(scripted);
  }

  if (!transcript) {
    return res.status(400).json({ error: 'objectionType or transcript is required' });
  }

  const result = await generateReframe(transcript, context || {});
  res.json(result);
}));

// POST /api/objections/retell-webhook
router.post('/retell-webhook', asyncWrap(async (req, res) => {
  const result = await handleRetellWebhook(req.body);
  res.json(result);
}));

// GET /api/objections/call-log
router.get('/call-log', (req, res) => {
  const logs = getCallLog();
  res.json(logs);
});

module.exports = router;
