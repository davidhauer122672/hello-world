import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Project Sentinel Route Tests
 *
 * Tests the deployment management, sequence logic, investor flag evaluation,
 * and go-live authorization for the Atlas + Retell AI campaign.
 */

// ── Direct import of route handlers ──
// We test the exported functions directly with mock env/request/ctx objects.

import {
  handleSentinelDeployment,
  handleResolveBlocker,
  handleSentinelSequence,
  handleSequenceAdvance,
  handleInvestorFlagEvaluate,
  handleSentinelKpis,
  handleSentinelGoLive,
} from '../routes/project-sentinel.js';

// ── Mock helpers ──

function createMockEnv() {
  const kvStore = new Map();
  const mockKV = {
    get: async (key, type) => {
      const val = kvStore.get(key);
      if (!val) return null;
      return type === 'json' ? JSON.parse(val) : val;
    },
    put: async (key, value) => {
      kvStore.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    list: async ({ prefix, limit }) => ({
      keys: [...kvStore.keys()].filter(k => k.startsWith(prefix)).slice(0, limit).map(k => ({ name: k })),
      cursor: null,
    }),
  };

  return {
    WORKER_AUTH_TOKEN: 'test-token',
    AIRTABLE_BASE_ID: 'appUSnNgpDkcEOzhN',
    AIRTABLE_API_KEY: 'test-airtable-key',
    SLACK_WEBHOOK_URL: null,
    RATE_LIMITS: mockKV,
    AUDIT_LOG: mockKV,
    CACHE: mockKV,
    SESSIONS: mockKV,
  };
}

function createMockCtx() {
  return { waitUntil: () => {} };
}

function createMockRequest(body) {
  return {
    json: async () => body,
  };
}

// ── Tests ──

describe('Project Sentinel — Sequence Configuration', () => {
  it('returns the full 6-touch 14-day sequence', async () => {
    const res = await handleSentinelSequence();
    const body = await res.json();

    assert.equal(body.total_touches, 6);
    assert.equal(body.duration_days, 14);
    assert.equal(body.sequence.length, 6);
    assert.equal(body.sequence[0].day, 1);
    assert.equal(body.sequence[0].touch, 'Cold Open Call');
    assert.equal(body.sequence[5].day, 14);
    assert.equal(body.sequence[5].touch, 'Long-Tail Nurture');
    assert.equal(body.campaign, '[CK] Project Sentinel - Outbound');
  });

  it('includes calling hours with no Sunday', async () => {
    const res = await handleSentinelSequence();
    const body = await res.json();

    assert.equal(body.calling_hours.sunday, false);
    assert.equal(body.calling_hours.days.length, 6);
    assert.ok(!body.calling_hours.days.includes('Sunday'));
  });
});

describe('Project Sentinel — Sequence Advance', () => {
  it('rejects invalid recordId', async () => {
    const req = createMockRequest({ recordId: 'invalid', currentDay: 1 });
    const res = await handleSequenceAdvance(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects missing currentDay', async () => {
    const req = createMockRequest({ recordId: 'recABC123' });
    const res = await handleSequenceAdvance(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('returns not-advanced for Day 14 (end of sequence)', async () => {
    // Mock the Airtable updateRecord — since Day 14 has no next step,
    // it should return early without calling Airtable
    const req = createMockRequest({ recordId: 'recABC123', currentDay: 14 });
    const res = await handleSequenceAdvance(req, createMockEnv(), createMockCtx());
    const body = await res.json();

    assert.equal(body.advanced, false);
    assert.ok(body.reason.includes('completed'));
  });
});

describe('Project Sentinel — Blocker Resolution', () => {
  it('rejects invalid blockerId', async () => {
    const req = createMockRequest({ blockerId: 5, resolved: true });
    const res = await handleResolveBlocker(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects missing blockerId', async () => {
    const req = createMockRequest({ resolved: true });
    const res = await handleResolveBlocker(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects non-numeric blockerId', async () => {
    const req = createMockRequest({ blockerId: 'slack', resolved: true });
    const res = await handleResolveBlocker(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });
});

describe('Project Sentinel — Investor Flag', () => {
  it('rejects invalid recordId', async () => {
    const req = createMockRequest({ recordId: 'bad' });
    const res = await handleInvestorFlagEvaluate(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects missing recordId', async () => {
    const req = createMockRequest({});
    const res = await handleInvestorFlagEvaluate(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });
});

describe('Project Sentinel — Invalid JSON Handling', () => {
  it('rejects malformed JSON on blocker resolve', async () => {
    const req = { json: async () => { throw new Error('bad json'); } };
    const res = await handleResolveBlocker(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects malformed JSON on sequence advance', async () => {
    const req = { json: async () => { throw new Error('bad json'); } };
    const res = await handleSequenceAdvance(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects malformed JSON on investor flag', async () => {
    const req = { json: async () => { throw new Error('bad json'); } };
    const res = await handleInvestorFlagEvaluate(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });
});
