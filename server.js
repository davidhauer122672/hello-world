require('dotenv').config();
const express = require('express');
const path = require('path');

// Security & error handling middleware
const { securityHeaders, rateLimiter, cors } = require('./middleware/security');
const { errorHandler, notFoundHandler, asyncWrap } = require('./middleware/error-handler');

// Auth
const { router: authRouter, validateSession, extractBearerToken, safeCompare } = require('./routes/auth');

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
const workflowsRouter = require('./routes/workflows');
const standupRouter = require('./routes/standup');
const strategyRouter = require('./routes/strategy');

// Services
const { startDailyReport, buildReport } = require('./lib/daily-report');
const { sendSMS } = require('./lib/sms');
const { startDripScheduler } = require('./lib/drip-engine');
const { startPublishTracker } = require('./lib/social-publisher');
const { startBackupScheduler, runBackup } = require('./lib/backup');
const { startCeoStandup } = require('./lib/ceo-standup');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Admin auth middleware ─────────────────────────────────────────────────
function requireAdminToken(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized — valid token required' });
  }

  // Accept admin token (timing-safe) OR valid session token
  const adminToken = process.env.ADMIN_TOKEN;
  const isAdmin = adminToken && safeCompare(token, adminToken);
  if (isAdmin || validateSession(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
}

// ── Global security middleware ────────────────────────────────────────────
app.use(securityHeaders());
app.use(cors());
app.use(rateLimiter(100));

// Stripe webhook needs raw body — must come before express.json()
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// Parse JSON for all other routes (50KB limit — sufficient for all API payloads)
app.use(express.json({ limit: '50kb' }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// ── Public routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/objections', objectionsRouter);

// ── Protected routes (admin token required) ───────────────────────────────
app.use('/api/dashboard', requireAdminToken, dashboardRouter);
app.use('/api/email', requireAdminToken, emailRouter);
app.use('/api/social', requireAdminToken, socialRouter);
app.use('/api/visuals', requireAdminToken, visualsRouter);
app.use('/api/drip', requireAdminToken, dripRouter);
app.use('/api/workflows', requireAdminToken, workflowsRouter);
app.use('/api/standup', requireAdminToken, standupRouter);
app.use('/api/strategy', requireAdminToken, strategyRouter);

// Manual report trigger (protected)
app.post('/api/report/send', requireAdminToken, asyncWrap(async (req, res) => {
  const report = buildReport();
  await sendSMS(report);
  res.json({ success: true, report });
}));

// Preview report without sending (protected)
app.get('/api/report/preview', requireAdminToken, (req, res) => {
  const report = buildReport();
  res.json({ report });
});

// Manual backup trigger (protected)
app.post('/api/backup/run', requireAdminToken, (req, res) => {
  const result = runBackup();
  res.json({ success: true, ...result });
});

// ── Error handling ────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Graceful shutdown ─────────────────────────────────────────────────────
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
  startCeoStandup();
});
