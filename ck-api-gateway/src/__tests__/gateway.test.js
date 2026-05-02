import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Mock environment ──
function createMockEnv() {
  const kvStore = new Map();
  const mockKV = {
    get: async (key, type) => {
      const val = kvStore.get(key);
      if (!val) return null;
      return type === 'json' ? JSON.parse(val) : val;
    },
    put: async (key, value) => { kvStore.set(key, typeof value === 'string' ? value : JSON.stringify(value)); },
    list: async ({ prefix, limit }) => ({
      keys: [...kvStore.keys()].filter(k => k.startsWith(prefix)).slice(0, limit).map(k => ({ name: k })),
      cursor: null,
    }),
  };

  return {
    WORKER_AUTH_TOKEN: 'test-token-abc123',
    AIRTABLE_BASE_ID: 'appUSnNgpDkcEOzhN',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    AIRTABLE_API_KEY: 'test-airtable-key',
    RATE_LIMIT_RPM: '60',
    CACHE: mockKV,
    SESSIONS: mockKV,
    RATE_LIMITS: { ...mockKV, get: async () => '0', put: async () => {} },
    AUDIT_LOG: mockKV,
  };
}

// ── Import middleware ──
import { authenticate } from '../middleware/auth.js';

describe('Auth Middleware', () => {
  it('rejects requests without Authorization header', () => {
    const request = { headers: new Map([]) };
    request.headers.get = (name) => null;
    const env = createMockEnv();
    const result = authenticate(request, env);
    assert.notEqual(result, null);
  });

  it('rejects requests with wrong token', () => {
    const request = { headers: new Map() };
    request.headers.get = (name) => name === 'Authorization' ? 'Bearer wrong-token' : null;
    const env = createMockEnv();
    const result = authenticate(request, env);
    assert.notEqual(result, null);
  });

  it('passes requests with correct token', () => {
    const request = { headers: new Map() };
    request.headers.get = (name) => name === 'Authorization' ? 'Bearer test-token-abc123' : null;
    const env = createMockEnv();
    const result = authenticate(request, env);
    assert.equal(result, null);
  });
});

// ── Import rate limiter ──
import { rateLimit } from '../middleware/rate-limit.js';

describe('Rate Limiter', () => {
  it('allows requests under the limit', async () => {
    const request = { headers: new Map() };
    request.headers.get = () => '127.0.0.1';
    const env = createMockEnv();
    const result = await rateLimit(request, env);
    assert.equal(result, null);
  });

  it('blocks requests over the limit', async () => {
    const request = { headers: new Map() };
    request.headers.get = () => '127.0.0.1';
    const env = createMockEnv();
    env.RATE_LIMITS = {
      get: async () => '60',
      put: async () => {},
    };
    const result = await rateLimit(request, env);
    assert.notEqual(result, null);
  });
});

// ── Import response utils ──
import { jsonResponse, errorResponse, corsHeaders } from '../utils/response.js';

describe('Response Utils', () => {
  it('creates a JSON response with correct headers', async () => {
    const res = jsonResponse({ test: true });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Content-Type'), 'application/json');
    const body = await res.json();
    assert.equal(body.test, true);
  });

  it('creates an error response with status code', async () => {
    const res = errorResponse('Not found', 404);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error, 'Not found');
  });

  it('includes CORS headers', () => {
    const headers = corsHeaders();
    assert.equal(headers['Access-Control-Allow-Origin'], '*');
  });
});

// ── Import audit utils ──
import { writeAudit } from '../utils/audit.js';

describe('Audit Writer', () => {
  it('writes an audit entry to KV', async () => {
    const env = createMockEnv();
    const waitUntilCalls = [];
    const ctx = { waitUntil: (p) => waitUntilCalls.push(p) };

    writeAudit(env, ctx, { route: '/test', action: 'test' });

    assert.equal(waitUntilCalls.length, 1);
    await waitUntilCalls[0];

    const keys = await env.AUDIT_LOG.list({ prefix: 'audit:', limit: 10 });
    assert.ok(keys.keys.length > 0);
  });
});

// ─�� Airtable Table Constants ──
import { TABLES } from '../services/airtable.js';

describe('Airtable Table Constants', () => {
  it('defines all core tables', () => {
    assert.ok(TABLES.LEADS, 'LEADS table required');
    assert.ok(TABLES.CONTENT_CALENDAR, 'CONTENT_CALENDAR table required');
    assert.ok(TABLES.PODCAST_PRODUCTION, 'PODCAST_PRODUCTION table required');
    assert.ok(TABLES.AI_LOG, 'AI_LOG table required');
    assert.ok(TABLES.TASKS, 'TASKS table required');
  });

  it('table IDs follow Airtable format', () => {
    for (const [name, id] of Object.entries(TABLES)) {
      assert.ok(id.startsWith('tbl'), `${name} should start with "tbl", got "${id}"`);
    }
  });
});

// ── Buffer Service Exports ──
import * as bufferService from '../services/buffer.js';

describe('Buffer Service', () => {
  it('exports resolveProfileId function', () => {
    assert.equal(typeof bufferService.resolveProfileId, 'function');
  });

  it('exports schedulePost function', () => {
    assert.equal(typeof bufferService.schedulePost, 'function');
  });

  it('exports crossPostSchedule function', () => {
    assert.equal(typeof bufferService.crossPostSchedule, 'function');
  });

  it('exports getProfiles function', () => {
    assert.equal(typeof bufferService.getProfiles, 'function');
  });

  it('exports syncAnalyticsToCalendar function', () => {
    assert.equal(typeof bufferService.syncAnalyticsToCalendar, 'function');
  });
});
