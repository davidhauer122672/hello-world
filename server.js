require('dotenv').config();
const express = require('express');
const path = require('path');

// Security & error handling middleware
const { securityHeaders, rateLimiter, cors } = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

// Route handlers
const { router: paymentsRouter, webhookHandler } = require('./routes/payments');
const appointmentsRouter = require('./routes/appointments');
const emailRouter = require('./routes/email');
const socialRouter = require('./routes/social');
const visualsRouter = require('./routes/visuals');
const dripRouter = require('./routes/drip');
const objectionsRouter = require('./routes/objections');
const healthRouter = require('./routes/health');
const dashboardRouter = require('./routes/dashboard');

// Services
const { startDailyReport, buildReport } = require('./lib/daily-report');
const { sendSMS } = require('./lib/sms');
const { startDripScheduler } = require('./lib/drip-engine');
const { startPublishTracker } = require('./lib/social-publisher');
const { startBackupScheduler, runBackup } = require('./lib/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Global security middleware
app.use(securityHeaders());
app.use(cors());
app.use(rateLimiter(100));

// Stripe webhook needs raw body — must come before express.json()
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// Parse JSON for all other routes (1MB limit)
app.use(express.json({ limit: '1mb' }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Health check (no rate limit)
app.use('/api/health', healthRouter);

// API routes
app.use('/api/dashboard', dashboardRouter);
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

// Manual backup trigger
app.post('/api/backup/run', (req, res) => {
  const result = runBackup();
  res.json({ success: true, ...result });
});

// Catch-all 404 and centralized error handler
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
let server;
function shutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('Server closed. Process exiting.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startDailyReport();
  startDripScheduler();
  startPublishTracker();
  startBackupScheduler();
});
