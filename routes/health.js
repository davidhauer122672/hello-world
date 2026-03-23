const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(__dirname, '..', 'data');

const REQUIRED_ENV = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
];

const DATA_FILES = [
  'appointments.json',
  'content-calendar.json',
  'drip-sequences.json',
  'visual-briefs.json',
  'call-logs.json',
];

router.get('/', (req, res) => {
  const checks = {};
  let overall = 'healthy';

  // Uptime
  checks.uptime = {
    status: 'healthy',
    seconds: Math.floor(process.uptime()),
    human: formatUptime(process.uptime()),
  };

  // Memory
  const mem = process.memoryUsage();
  const heapPercent = Math.round((mem.heapUsed / mem.heapTotal) * 100);
  checks.memory = {
    status: heapPercent > 90 ? 'degraded' : 'healthy',
    heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
    rssMB: Math.round(mem.rss / 1024 / 1024),
    heapPercent,
  };
  if (checks.memory.status !== 'healthy') overall = 'degraded';

  // Data directory
  try {
    const testFile = path.join(DATA_DIR, '.health-check');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    checks.dataDirectory = { status: 'healthy', writable: true };
  } catch {
    checks.dataDirectory = { status: 'unhealthy', writable: false };
    overall = 'unhealthy';
  }

  // Data files
  checks.dataFiles = {};
  for (const file of DATA_FILES) {
    const filePath = path.join(DATA_DIR, file);
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        checks.dataFiles[file] = {
          status: 'healthy',
          sizeKB: Math.round(stat.size / 1024),
          records: Array.isArray(records) ? records.length : 'N/A',
        };
      } else {
        checks.dataFiles[file] = { status: 'healthy', note: 'not yet created' };
      }
    } catch {
      checks.dataFiles[file] = { status: 'degraded', note: 'parse error or unreadable' };
      if (overall === 'healthy') overall = 'degraded';
    }
  }

  // Environment
  checks.environment = {};
  let missingEnv = 0;
  for (const key of REQUIRED_ENV) {
    const present = !!process.env[key];
    checks.environment[key] = present ? 'set' : 'MISSING';
    if (!present) missingEnv++;
  }
  if (missingEnv > 0 && overall === 'healthy') overall = 'degraded';

  // Runtime
  checks.runtime = {
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    pid: process.pid,
  };

  res.json({
    status: overall,
    timestamp: new Date().toISOString(),
    version: require('../package.json').version || '1.0.0',
    checks,
  });
});

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

module.exports = router;
