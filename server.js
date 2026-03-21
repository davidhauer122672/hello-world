require('dotenv').config();
const express = require('express');
const path = require('path');
const { router: paymentsRouter, webhookHandler } = require('./routes/payments');
const appointmentsRouter = require('./routes/appointments');
const emailRouter = require('./routes/email');
const socialRouter = require('./routes/social');
const visualsRouter = require('./routes/visuals');
const dripRouter = require('./routes/drip');
const objectionsRouter = require('./routes/objections');
const { startDailyReport, buildReport } = require('./lib/daily-report');
const { sendSMS } = require('./lib/sms');
const { startDripScheduler } = require('./lib/drip-engine');
const { startPublishTracker } = require('./lib/social-publisher');

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
app.use('/api/social', socialRouter);
app.use('/api/visuals', visualsRouter);
app.use('/api/drip', dripRouter);
app.use('/api/objections', objectionsRouter);

// Manual report trigger
app.post('/api/report/send', async (req, res) => {
  const report = buildReport();
  await sendSMS(report);
  res.json({ success: true, report });
});

// Preview report without sending
app.get('/api/report/preview', (req, res) => {
  const report = buildReport();
  res.json({ report });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startDailyReport();
  startDripScheduler();
  startPublishTracker();
});
