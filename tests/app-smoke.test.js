const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const path = require('path');
const fs = require('fs');

// ── Ensure data directory exists before importing server ─────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Helper: lightweight HTTP request against the test server ─────────────
function request(port, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── App Smoke Tests ──────────────────────────────────────────────────────
// Verifies that the Express application boots, responds to core endpoints,
// returns correct status codes, and sets required security headers.

describe('App Smoke Tests', () => {
  let server;
  let port;

  before(async () => {
    // Dynamically import the Express app on port 0 (auto-assign)
    delete require.cache[require.resolve('../server')];
    // Override PORT so we don't collide with a running instance
    process.env.PORT = '0';
    // Suppress cron / scheduler logs during tests
    process.env.NODE_ENV = 'test';

    const app = require('../server');
    await new Promise((resolve) => {
      // server.js exports by side-effect — listen is already called,
      // but we grab the address from the running server.
      // If app is already listening, get the address directly.
      if (app && app.address) {
        port = app.address().port;
        server = app;
        resolve();
      } else {
        // Fallback: wait briefly for the server export
        setTimeout(() => {
          try {
            port = app.address().port;
          } catch {
            port = 3000;
          }
          server = app;
          resolve();
        }, 500);
      }
    });
  });

  after(() => {
    if (server && typeof server.close === 'function') {
      server.close();
    }
  });

  // ── Health endpoint ────────────────────────────────────────────────────
  describe('GET /api/health', () => {
    it('returns 200 with status field', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.equal(res.status, 200);
      assert.ok(res.body.status, 'Response should include a status field');
      assert.ok(['healthy', 'degraded', 'unhealthy'].includes(res.body.status));
    });

    it('includes version and timestamp', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.ok(res.body.version, 'Response should include version');
      assert.ok(res.body.timestamp, 'Response should include timestamp');
    });

    it('includes checks object', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.ok(res.body.checks, 'Response should include checks object');
      assert.ok(res.body.checks.uptime, 'Checks should include uptime');
      assert.ok(res.body.checks.memory, 'Checks should include memory');
      assert.ok(res.body.checks.runtime, 'Checks should include runtime');
    });
  });

  // ── Security headers ──────────────────────────────────────────────────
  describe('Security headers', () => {
    it('sets X-Content-Type-Options to nosniff', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.equal(res.headers['x-content-type-options'], 'nosniff');
    });

    it('sets X-Frame-Options to DENY', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.equal(res.headers['x-frame-options'], 'DENY');
    });

    it('sets Strict-Transport-Security', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.ok(res.headers['strict-transport-security']);
      assert.ok(res.headers['strict-transport-security'].includes('max-age='));
    });

    it('sets Content-Security-Policy with frame-ancestors none', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.ok(res.headers['content-security-policy']);
      assert.ok(res.headers['content-security-policy'].includes("frame-ancestors 'none'"));
    });

    it('removes X-Powered-By', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.equal(res.headers['x-powered-by'], undefined);
    });
  });

  // ── 404 handler ────────────────────────────────────────────────────────
  describe('Not-found handler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(port, 'GET', '/api/nonexistent-route-xyz');
      assert.equal(res.status, 404);
    });
  });

  // ── Protected routes require auth ──────────────────────────────────────
  describe('Protected routes reject unauthenticated requests', () => {
    const protectedPaths = [
      '/api/dashboard',
      '/api/standup',
      '/api/report/preview',
    ];

    for (const routePath of protectedPaths) {
      it(`GET ${routePath} returns 401 without token`, async () => {
        const res = await request(port, 'GET', routePath);
        assert.equal(res.status, 401);
        assert.ok(res.body.error, 'Should return error message');
      });
    }
  });

  // ── Appointments validation ────────────────────────────────────────────
  describe('POST /api/appointments', () => {
    it('returns 400 when fields are missing', async () => {
      const res = await request(port, 'POST', '/api/appointments', {});
      assert.equal(res.status, 400);
      assert.ok(res.body.error);
    });

    it('returns 400 for invalid email', async () => {
      const res = await request(port, 'POST', '/api/appointments', {
        name: 'Test User',
        email: 'not-an-email',
        date: '2026-06-01',
        timeSlot: '10:00',
        service: 'consultation',
      });
      assert.equal(res.status, 400);
      assert.ok(res.body.error.toLowerCase().includes('email'));
    });

    it('returns 400 for invalid date format', async () => {
      const res = await request(port, 'POST', '/api/appointments', {
        name: 'Test User',
        email: 'test@example.com',
        date: '06-01-2026',
        timeSlot: '10:00',
        service: 'consultation',
      });
      assert.equal(res.status, 400);
      assert.ok(res.body.error.toLowerCase().includes('date'));
    });

    it('returns 400 for invalid service type', async () => {
      const res = await request(port, 'POST', '/api/appointments', {
        name: 'Test User',
        email: 'test@example.com',
        date: '2026-06-01',
        timeSlot: '10:00',
        service: 'invalid-service',
      });
      assert.equal(res.status, 400);
      assert.ok(res.body.error.toLowerCase().includes('service'));
    });
  });

  // ── Objections classify requires transcript ────────────────────────────
  describe('POST /api/objections/classify', () => {
    it('returns 400 when transcript is missing', async () => {
      const res = await request(port, 'POST', '/api/objections/classify', {});
      assert.equal(res.status, 400);
      assert.ok(res.body.error.toLowerCase().includes('transcript'));
    });
  });

  // ── Rate limit headers present ─────────────────────────────────────────
  describe('Rate limiting', () => {
    it('includes X-RateLimit-Limit header', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.ok(res.headers['x-ratelimit-limit'], 'Should set X-RateLimit-Limit');
    });

    it('includes X-RateLimit-Remaining header', async () => {
      const res = await request(port, 'GET', '/api/health');
      assert.ok(res.headers['x-ratelimit-remaining'] !== undefined,
        'Should set X-RateLimit-Remaining');
    });
  });
});
