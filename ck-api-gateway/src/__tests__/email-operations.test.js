/**
 * Email Operations Route Tests — Gmail OAuth Integration
 *
 * Tests: handleEmailSend, handleEmailDraft, handleEmailOAuthHealth
 * Validates input validation, error responses, and response structure.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

async function body(res) {
  return JSON.parse(await res.text());
}

function makeRequest(bodyObj) {
  return {
    json: async () => bodyObj,
    headers: new Map(),
  };
}

function makeBadJsonRequest() {
  return {
    json: async () => { throw new SyntaxError('Unexpected token'); },
    headers: new Map(),
  };
}

function createMockEnv(overrides = {}) {
  const kvStore = new Map();
  const mockKV = {
    get: async () => null,
    put: async () => {},
    list: async () => ({ keys: [], cursor: null }),
  };
  return {
    WORKER_AUTH_TOKEN: 'test-token',
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    GMAIL_REFRESH_TOKEN: 'test-refresh-token',
    GMAIL_FROM_ADDRESS: 'ceo@coastalkey-pm.com',
    CACHE: mockKV,
    AUDIT_LOG: mockKV,
    ...overrides,
  };
}

const mockCtx = { waitUntil: () => {} };

// ── Email Send Route ────────────────────────────────────────────────────────

describe('Email Operations — handleEmailSend', async () => {
  const { handleEmailSend } = await import('../routes/email-operations.js');

  it('rejects invalid JSON body', async () => {
    const res = await handleEmailSend(makeBadJsonRequest(), createMockEnv(), mockCtx);
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.ok(b.error.includes('valid JSON'));
  });

  it('rejects missing "to" field', async () => {
    const res = await handleEmailSend(
      makeRequest({ subject: 'Test', body: 'Hello' }),
      createMockEnv(),
      mockCtx,
    );
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.ok(b.error.includes('"to"'));
  });

  it('rejects missing "subject" field', async () => {
    const res = await handleEmailSend(
      makeRequest({ to: 'a@b.com', body: 'Hello' }),
      createMockEnv(),
      mockCtx,
    );
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.ok(b.error.includes('"subject"'));
  });

  it('rejects missing "body" field', async () => {
    const res = await handleEmailSend(
      makeRequest({ to: 'a@b.com', subject: 'Test' }),
      createMockEnv(),
      mockCtx,
    );
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.ok(b.error.includes('"body"'));
  });

  it('rejects invalid email format', async () => {
    const res = await handleEmailSend(
      makeRequest({ to: 'not-an-email', subject: 'Test', body: 'Hello' }),
      createMockEnv(),
      mockCtx,
    );
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.ok(b.error.includes('email address'));
  });

  it('accepts valid email format for "to"', async () => {
    // Will fail at the OAuth step (no real token), but should pass validation
    const res = await handleEmailSend(
      makeRequest({ to: 'test@example.com', subject: 'Test', body: 'Hello World' }),
      createMockEnv(),
      mockCtx,
    );
    // Should get 500 (OAuth network call fails) — NOT 400 (validation)
    assert.equal(res.status, 500);
    const b = await body(res);
    assert.ok(b.error.includes('failed'));
  });
});

// ── Email Draft Route ───────────────────────────────────────────────────────

describe('Email Operations — handleEmailDraft', async () => {
  const { handleEmailDraft } = await import('../routes/email-operations.js');

  it('rejects invalid JSON body', async () => {
    const res = await handleEmailDraft(makeBadJsonRequest(), createMockEnv(), mockCtx);
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.ok(b.error.includes('valid JSON'));
  });

  it('rejects missing required fields', async () => {
    const res = await handleEmailDraft(
      makeRequest({ to: 'a@b.com' }),
      createMockEnv(),
      mockCtx,
    );
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.ok(b.error.includes('"subject"') || b.error.includes('"body"'));
  });

  it('rejects when all required fields missing', async () => {
    const res = await handleEmailDraft(
      makeRequest({}),
      createMockEnv(),
      mockCtx,
    );
    assert.equal(res.status, 400);
  });
});

// ── OAuth Health Route ──────────────────────────────────────────────────────

describe('Email Operations — handleEmailOAuthHealth', async () => {
  const { handleEmailOAuthHealth } = await import('../routes/email-operations.js');

  it('reports configured secrets when present', async () => {
    const env = createMockEnv();
    const res = await handleEmailOAuthHealth(env);
    // Will return 503 because OAuth network fails in test, but should still include secrets info
    const b = await body(res);
    assert.equal(b.service, 'Gmail OAuth 2.0');
    assert.ok(b.secrets);
    assert.equal(b.secrets.GOOGLE_CLIENT_ID, true);
    assert.equal(b.secrets.GOOGLE_CLIENT_SECRET, true);
    assert.equal(b.secrets.GMAIL_REFRESH_TOKEN, true);
    assert.equal(b.secrets.GMAIL_FROM_ADDRESS, 'ceo@coastalkey-pm.com');
  });

  it('reports unconfigured secrets when missing', async () => {
    const env = createMockEnv({
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      GMAIL_REFRESH_TOKEN: undefined,
      GMAIL_FROM_ADDRESS: undefined,
    });
    const res = await handleEmailOAuthHealth(env);
    const b = await body(res);
    assert.equal(b.service, 'Gmail OAuth 2.0');
    assert.equal(b.secrets.GOOGLE_CLIENT_ID, false);
    assert.equal(b.secrets.GOOGLE_CLIENT_SECRET, false);
    assert.equal(b.secrets.GMAIL_REFRESH_TOKEN, false);
    assert.equal(b.secrets.GMAIL_FROM_ADDRESS, 'not configured');
  });

  it('returns timestamp in response', async () => {
    const env = createMockEnv();
    const res = await handleEmailOAuthHealth(env);
    const b = await body(res);
    assert.ok(b.timestamp);
    assert.ok(new Date(b.timestamp).getTime() > 0);
  });
});
