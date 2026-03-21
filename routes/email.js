const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { sendConfirmation } = require('../lib/mailer');

// Manual re-send confirmation email
router.post('/send-confirmation', async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) return res.status(400).json({ error: 'appointmentId required' });

  const appointment = db.getAppointmentById(appointmentId);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  await sendConfirmation(appointment);
  res.json({ success: true, message: 'Confirmation email sent' });
});

module.exports = router;
