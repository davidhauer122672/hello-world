const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const sheets = require('../lib/sheets');
const { asyncWrap } = require('../middleware/error-handler');

const VALID_SERVICES = ['consultation', 'followup', 'premium'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Get booked slots for a date
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });
  const bookedSlots = db.getBookedSlots(date);
  res.json({ date, bookedSlots });
});

// Create a new appointment
router.post('/', asyncWrap(async (req, res) => {
  const { name, email, date, timeSlot, service } = req.body;

  if (!name || !email || !date || !timeSlot || !service) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!DATE_RE.test(date)) {
    return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD required)' });
  }

  if (!TIME_RE.test(timeSlot)) {
    return res.status(400).json({ error: 'Invalid time slot (HH:MM required)' });
  }

  if (!VALID_SERVICES.includes(service)) {
    return res.status(400).json({ error: `Invalid service. Valid: ${VALID_SERVICES.join(', ')}` });
  }

  if (typeof name !== 'string' || name.length > 200) {
    return res.status(400).json({ error: 'Name must be a string under 200 characters' });
  }

  const result = await db.createAppointment({ name: name.trim(), email: email.trim(), date, timeSlot, service });
  if (result.error) return res.status(409).json(result);

  // Sync to Google Sheets (non-blocking)
  sheets.appendAppointment(result).catch(() => {});

  res.status(201).json(result);
}));

// Get appointment by ID
router.get('/:id', (req, res) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Not found' });
  res.json(appointment);
});

module.exports = router;
