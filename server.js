require('dotenv').config();
const express = require('express');
const path = require('path');
const { router: paymentsRouter, webhookHandler } = require('./routes/payments');
const appointmentsRouter = require('./routes/appointments');
const emailRouter = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe webhook needs raw body — must come before express.json()
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// Parse JSON for all other routes
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/payments', paymentsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/email', emailRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
