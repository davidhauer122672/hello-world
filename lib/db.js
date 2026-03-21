const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'appointments.json');

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function getAppointments() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveAppointments(appointments) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));
}

function createAppointment({ name, email, date, timeSlot, service }) {
  const appointments = getAppointments();

  // Check for double-booking
  const conflict = appointments.find(
    (a) => a.date === date && a.timeSlot === timeSlot
  );
  if (conflict) return { error: 'Time slot already booked' };

  const appointment = {
    id: crypto.randomUUID(),
    name,
    email,
    date,
    timeSlot,
    service,
    paid: false,
    createdAt: new Date().toISOString(),
  };

  appointments.push(appointment);
  saveAppointments(appointments);
  return appointment;
}

function getAppointmentById(id) {
  return getAppointments().find((a) => a.id === id) || null;
}

function updateAppointment(id, updates) {
  const appointments = getAppointments();
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  Object.assign(appointments[idx], updates);
  saveAppointments(appointments);
  return appointments[idx];
}

function getBookedSlots(date) {
  return getAppointments()
    .filter((a) => a.date === date)
    .map((a) => a.timeSlot);
}

module.exports = {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  getBookedSlots,
};
