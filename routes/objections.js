const express = require('express');
const router = express.Router();
const {
  classifyObjection,
  getReframe,
  generateReframe,
  handleRetellWebhook,
  getCallLog
} = require('../lib/objection-handler');

// POST /api/objections/classify
router.post('/classify', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }
    const result = await classifyObjection(transcript);

    // Attach scripted reframe if available
    const reframe = getReframe(result.objectionType);
    res.json({ ...result, reframe: reframe ? reframe.reframe : null });
  } catch (err) {
    console.error('[objections route] classify error:', err.message);
    res.status(500).json({ error: 'classification failed' });
  }
});

// POST /api/objections/reframe
router.post('/reframe', async (req, res) => {
  try {
    const { objectionType, transcript, context } = req.body;

    // If a known objection type is provided, return the scripted reframe
    if (objectionType) {
      const scripted = getReframe(objectionType);
      if (scripted) {
        return res.json(scripted);
      }
    }

    // Otherwise generate a custom reframe via Claude
    if (!transcript) {
      return res.status(400).json({ error: 'objectionType or transcript is required' });
    }

    const result = await generateReframe(transcript, context || {});
    res.json(result);
  } catch (err) {
    console.error('[objections route] reframe error:', err.message);
    res.status(500).json({ error: 'reframe generation failed' });
  }
});

// POST /api/objections/retell-webhook
router.post('/retell-webhook', async (req, res) => {
  try {
    const result = await handleRetellWebhook(req.body);
    res.json(result);
  } catch (err) {
    console.error('[objections route] webhook error:', err.message);
    res.status(500).json({ error: 'webhook processing failed' });
  }
});

// GET /api/objections/call-log
router.get('/call-log', (req, res) => {
  try {
    const logs = getCallLog();
    res.json(logs);
  } catch (err) {
    console.error('[objections route] call-log error:', err.message);
    res.status(500).json({ error: 'failed to retrieve call logs' });
  }
});

module.exports = router;
