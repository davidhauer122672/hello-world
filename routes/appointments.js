const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Get booked slots for a date
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });
  const bookedSlots = db.getBookedSlots(date);
  res.json({ date, bookedSlots });
});

// Create a new appointment
router.post('/', (req, res) => {
  const { name, email, date, timeSlot, service } = req.body;

  if (!name || !email || !date || !timeSlot || !service) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const result = db.createAppointment({ name, email, date, timeSlot, service });
  if (result.error) return res.status(409).json(result);

  res.status(201).json(result);
});

// Get appointment by ID
router.get('/:id', (req, res) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Not found' });
  res.json(appointment);
});

module.exports = router;
