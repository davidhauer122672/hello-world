const express = require('express');
const router = express.Router();
const {
  enrollContact,
  processScheduledDrips,
  unsubscribeContact,
  getDripStatus,
} = require('../lib/drip-engine');

// POST /api/drip/enroll
router.post('/enroll', (req, res) => {
  const { email, name, segment, source } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'email and name are required' });
  }

  try {
    const result = enrollContact(email, name, segment, source);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/drip/unsubscribe
router.post('/unsubscribe', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    const result = unsubscribeContact(email);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/drip/status/:email
router.get('/status/:email', (req, res) => {
  const { email } = req.params;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const status = getDripStatus(email);
    if (!status) {
      return res.status(404).json({ error: 'Contact not found in drip sequence' });
    }
    res.json({ success: true, status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/drip/process
router.post('/process', async (req, res) => {
  try {
    const result = await processScheduledDrips();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Drip processing failed: ' + err.message });
  }
});

module.exports = router;
