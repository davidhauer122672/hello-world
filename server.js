require('dotenv').config();
const express = require('express');
const path = require('path');

const { securityHeaders, rateLimiter, cors } = require('./middleware/security');
const { errorHandler, notFoundHandler, asyncWrap } = require('./middleware/error-handler');

const { router: authRouter, validateSession, extractBearerToken, safeCompare } = require('./routes/auth');

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
const orchestratorRouter = require('./routes/orchestrator');

const { startDailyReport, buildReport } = require('./lib/daily-report');
const { sendSMS } = require('./lib/sms');
const { startDripScheduler } = require('./lib/drip-engine');
const { startBackupScheduler, runBackup } = require('./lib/backup');
const { startCeoStandup } = require('./lib/ceo-standup');
const { startMasterOrchestrator } = require('./lib/master-orchestrator');

const app = express();
const PORT = process.env.PORT || 3000;

function requireAdminToken(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized — valid token required' });
  }
  const adminToken = process.env.ADMIN_TOKEN;
  const isAdmin = adminToken && safeCompare(token, adminToken);
  if (isAdmin || validateSession(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
}

app.use(securityHeaders());
app.use(cors());
app.use(rateLimiter(100));

app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/objections', objectionsRouter);

app.use('/api/dashboard', requireAdminToken, dashboardRouter);
app.use('/api/email', requireAdminToken, emailRouter);
app.use('/api/social', requireAdminToken, socialRouter);
app.use('/api/visuals', requireAdminToken, visualsRouter);
app.use('/api/drip', requireAdminToken, dripRouter);
app.use('/api/workflows', requireAdminToken, workflowsRouter);
app.use('/api/standup', requireAdminToken, standupRouter);
app.use('/api/strategy', requireAdminToken, strategyRouter);
app.use('/api/orchestrator', requireAdminToken, orchestratorRouter);

app.post('/api/report/send', requireAdminToken, asyncWrap(async (req, res) => {
  const report = buildReport();
  await sendSMS(report);
  res.json({ success: true, report });
}));

app.get('/api/report/preview', requireAdminToken, (req, res) => {
  const report = buildReport();
  res.json({ report });
});

app.post('/api/backup/run', requireAdminToken, (req, res) => {
  const result = runBackup();
  res.json({ success: true, ...result });
});

app.use(notFoundHandler);
app.use(errorHandler);

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
  startBackupScheduler();
  startCeoStandup();
  startMasterOrchestrator();
});
