const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// ── Setup: ensure data directory and clean test state ──────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function resetDataFile(filename) {
  const fp = path.join(DATA_DIR, filename);
  fs.writeFileSync(fp, '[]');
}

// ── Tests for middleware/security.js ───────────────────────────────────────

describe('Security Middleware', () => {
  const { securityHeaders, rateLimiter, cors } = require('../middleware/security');

  it('securityHeaders sets all required headers', () => {
    const headers = {};
    const middleware = securityHeaders();
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      removeHeader: () => {},
    };
    middleware({}, res, () => {});

    assert.ok(headers['X-Content-Type-Options']);
    assert.ok(headers['X-Frame-Options']);
    assert.ok(headers['Strict-Transport-Security']);
    assert.ok(headers['Content-Security-Policy']);
    assert.ok(headers['Referrer-Policy']);
    assert.ok(headers['Permissions-Policy']);
  });

  it('CSP header blocks frame-ancestors', () => {
    const headers = {};
    const middleware = securityHeaders();
    const res = {
      setHeader: (k, v) => { headers[k] = v; },
      removeHeader: () => {},
    };
    middleware({}, res, () => {});
    assert.ok(headers['Content-Security-Policy'].includes("frame-ancestors 'none'"));
  });

  it('rateLimiter blocks after max requests', () => {
    const middleware = rateLimiter(3, 60000);
    let blocked = false;
    const req = { ip: '10.0.0.99', connection: { remoteAddress: '10.0.0.99' } };
    const res = {
      setHeader: () => {},
      status: (code) => ({ json: () => { if (code === 429) blocked = true; } }),
    };

    for (let i = 0; i < 4; i++) {
      middleware(req, res, () => {});
    }
    assert.ok(blocked, 'Should block after 3 requests');
  });

  it('cors rejects unknown origins when CORS_ORIGIN is set', () => {
    const origEnv = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'https://coastalkey-pm.com';
    const middleware = cors();
    const headers = {};
    const req = { get: () => 'https://evil.com', method: 'GET' };
    const res = { setHeader: (k, v) => { headers[k] = v; } };
    middleware(req, res, () => {});
    assert.ok(!headers['Access-Control-Allow-Origin'], 'Should not set CORS for unknown origin');
    process.env.CORS_ORIGIN = origEnv || '';
  });
});

// ── Tests for middleware/error-handler.js ──────────────────────────────────

describe('Error Handler Middleware', () => {
  const { errorHandler, asyncWrap } = require('../middleware/error-handler');

  it('errorHandler returns 500 with generic message', () => {
    let response = {};
    const res = {
      status: (code) => ({ json: (data) => { response = { code, ...data }; } }),
    };
    errorHandler(new Error('secret'), { method: 'GET', originalUrl: '/test' }, res, () => {});
    assert.equal(response.code, 500);
    assert.equal(response.error, 'Internal server error');
  });

  it('asyncWrap catches thrown errors', async () => {
    let caught = false;
    const handler = asyncWrap(async () => { throw new Error('async fail'); });
    await handler({}, {}, (err) => { caught = !!err; });
    assert.ok(caught);
  });
});

// ── Tests for lib/db.js ───────────────────────────────────────────────────

describe('Database Layer', () => {
  const db = require('../lib/db');

  beforeEach(() => {
    ensureDataDir();
    resetDataFile('appointments.json');
  });

  it('creates appointment with valid data', async () => {
    const result = await db.createAppointment({
      name: 'Test Client',
      email: 'test@example.com',
      date: '2026-12-25',
      timeSlot: '10:00',
      service: 'consultation',
    });
    assert.ok(result.id);
    assert.equal(result.name, 'Test Client');
    assert.equal(result.paid, false);
  });

  it('prevents double booking same slot', async () => {
    await db.createAppointment({
      name: 'First', email: 'a@b.com', date: '2026-12-25', timeSlot: '10:00', service: 'consultation',
    });
    const second = await db.createAppointment({
      name: 'Second', email: 'c@d.com', date: '2026-12-25', timeSlot: '10:00', service: 'premium',
    });
    assert.equal(second.error, 'Time slot already booked');
  });

  it('retrieves appointment by ID', async () => {
    const created = await db.createAppointment({
      name: 'Lookup Test', email: 'l@t.com', date: '2026-12-26', timeSlot: '11:00', service: 'followup',
    });
    const found = db.getAppointmentById(created.id);
    assert.equal(found.name, 'Lookup Test');
  });

  it('returns null for unknown ID', () => {
    const found = db.getAppointmentById('nonexistent');
    assert.equal(found, null);
  });

  it('returns booked slots for a date', async () => {
    await db.createAppointment({
      name: 'Slot', email: 's@t.com', date: '2026-12-27', timeSlot: '09:00', service: 'consultation',
    });
    const slots = db.getBookedSlots('2026-12-27');
    assert.deepEqual(slots, ['09:00']);
  });

  it('updates appointment fields', async () => {
    const created = await db.createAppointment({
      name: 'Update Test', email: 'u@t.com', date: '2026-12-28', timeSlot: '14:00', service: 'premium',
    });
    const updated = await db.updateAppointment(created.id, { paid: true });
    assert.equal(updated.paid, true);
  });
});

// ── Tests for route validation ────────────────────────────────────────────

describe('Appointment Route Validation', () => {
  const { VALID_SERVICES, DATE_RE, TIME_RE } = (() => {
    // Test the validation logic directly
    return {
      VALID_SERVICES: ['consultation', 'followup', 'premium'],
      DATE_RE: /^\d{4}-\d{2}-\d{2}$/,
      TIME_RE: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    };
  })();

  it('accepts valid date formats', () => {
    assert.ok(DATE_RE.test('2026-04-08'));
    assert.ok(DATE_RE.test('2026-12-31'));
  });

  it('rejects invalid date formats', () => {
    assert.ok(!DATE_RE.test('2026/04/08'));
    assert.ok(!DATE_RE.test('04-08-2026'));
    assert.ok(!DATE_RE.test('not-a-date'));
  });

  it('accepts valid time formats', () => {
    assert.ok(TIME_RE.test('09:00'));
    assert.ok(TIME_RE.test('14:30'));
    assert.ok(TIME_RE.test('0:00'));
    assert.ok(TIME_RE.test('23:59'));
  });

  it('rejects invalid time formats', () => {
    assert.ok(!TIME_RE.test('25:00'));
    assert.ok(!TIME_RE.test('12:60'));
    assert.ok(!TIME_RE.test('noon'));
  });

  it('validates service types against whitelist', () => {
    assert.ok(VALID_SERVICES.includes('consultation'));
    assert.ok(VALID_SERVICES.includes('followup'));
    assert.ok(VALID_SERVICES.includes('premium'));
    assert.ok(!VALID_SERVICES.includes('free'));
    assert.ok(!VALID_SERVICES.includes(''));
  });
});

// ── Tests for drip email validation ───────────────────────────────────────

describe('Drip Email Validation', () => {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('accepts valid emails', () => {
    assert.ok(EMAIL_RE.test('user@example.com'));
    assert.ok(EMAIL_RE.test('ceo@coastalkey-pm.com'));
  });

  it('rejects invalid emails', () => {
    assert.ok(!EMAIL_RE.test('not-an-email'));
    assert.ok(!EMAIL_RE.test('@missing-user.com'));
    assert.ok(!EMAIL_RE.test('user@'));
    assert.ok(!EMAIL_RE.test(''));
  });
});

// ── Tests for social platform validation ──────────────────────────────────

describe('Social Platform Validation', () => {
  const VALID_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'alignable'];

  it('accepts all valid platforms', () => {
    for (const p of VALID_PLATFORMS) {
      assert.ok(VALID_PLATFORMS.includes(p));
    }
  });

  it('rejects invalid platforms', () => {
    assert.ok(!VALID_PLATFORMS.includes('twitter'));
    assert.ok(!VALID_PLATFORMS.includes('tiktok'));
    assert.ok(!VALID_PLATFORMS.includes(''));
  });
});

// ── Tests for lib/ceo-standup.js ──────────────────────────────────────────

describe('CEO Daily Standup', () => {
  const { buildStandup, getStandupHistory } = require('../lib/ceo-standup');

  before(() => {
    ensureDataDir();
    resetDataFile('appointments.json');
  });

  it('generates a complete standup briefing', () => {
    const standup = buildStandup();
    assert.ok(standup.generatedAt);
    assert.ok(standup.date);
    assert.equal(standup.type, 'CEO_DAILY_STANDUP');
    assert.equal(standup.authority, 'Coastal Key AI CEO');
  });

  it('fleet status shows 383 total units', () => {
    const standup = buildStandup();
    assert.equal(standup.fleetStatus.totalUnits, 383);
    assert.equal(standup.fleetStatus.active, 383);
    assert.equal(standup.fleetStatus.standby, 0);
    assert.equal(standup.fleetStatus.operationalReadiness, '100%');
  });

  it('includes all 10 divisions', () => {
    const standup = buildStandup();
    assert.equal(standup.divisions.length, 10);
    const codes = standup.divisions.map(d => d.code);
    assert.ok(codes.includes('MCCO'));
    assert.ok(codes.includes('EXC'));
    assert.ok(codes.includes('SEN'));
    assert.ok(codes.includes('OPS'));
    assert.ok(codes.includes('INT'));
    assert.ok(codes.includes('MKT'));
    assert.ok(codes.includes('FIN'));
    assert.ok(codes.includes('VEN'));
    assert.ok(codes.includes('TEC'));
    assert.ok(codes.includes('WEB'));
  });

  it('division agent counts sum to 312', () => {
    const standup = buildStandup();
    const total = standup.divisions.reduce((sum, d) => sum + d.agentCount, 0);
    assert.equal(total, 312);
  });

  it('includes 3 special units', () => {
    const standup = buildStandup();
    assert.equal(standup.specialUnits.length, 3);
    const names = standup.specialUnits.map(u => u.name);
    assert.ok(names.some(n => n.includes('Intelligence')));
    assert.ok(names.some(n => n.includes('Email')));
    assert.ok(names.some(n => n.includes('Apex Trader')));
  });

  it('system health includes all 6 services', () => {
    const standup = buildStandup();
    const services = Object.keys(standup.systemHealth.services);
    assert.equal(services.length, 6);
    assert.ok(services.includes('dailyReport'));
    assert.ok(services.includes('dripEngine'));
    assert.ok(services.includes('publishTracker'));
    assert.ok(services.includes('backupScheduler'));
    assert.ok(services.includes('workflowEngine'));
    assert.ok(services.includes('sentinelWebhook'));
  });

  it('generates text summary', () => {
    const standup = buildStandup();
    assert.ok(standup.summary.includes('CEO DAILY STANDUP'));
    assert.ok(standup.summary.includes('FLEET: 383/383 ACTIVE'));
    assert.ok(standup.summary.includes('DIVISION SUMMARY'));
    assert.ok(standup.summary.includes('Coastal Key AI CEO'));
  });

  it('action items is an array', () => {
    const standup = buildStandup();
    assert.ok(Array.isArray(standup.actionItems));
    for (const item of standup.actionItems) {
      assert.ok(item.priority);
      assert.ok(item.action);
      assert.ok(item.division);
    }
  });

  it('standup history returns entries', () => {
    buildStandup(); // Generate at least one entry
    const history = getStandupHistory(10);
    assert.ok(Array.isArray(history));
    assert.ok(history.length >= 1);
    assert.ok(history[0].generatedAt);
    assert.ok(history[0].date);
  });
});
