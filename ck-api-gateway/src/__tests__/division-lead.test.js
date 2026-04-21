/**
 * Division Lead Orchestrator v2.0 — route + service tests.
 *
 * No network calls. Airtable service is stubbed via an env-shaped object.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const {
  validateStatusPayload,
  validateQueuePayload,
  buildWeekKey,
  DIVISIONS,
  STATUS_VALUES,
  QUEUE_STATUS_VALUES,
} = await import('../services/division-lead.js');

const {
  handleDivisionStatus,
  handleDivisionQueueCreate,
  handleDivisionQueueList,
  handleDivisionList,
} = await import('../routes/division-lead.js');

function mockRequest(body) {
  return { json: async () => body };
}
function mockBadJsonRequest() {
  return { json: async () => { throw new Error('bad json'); } };
}
function mockEnv(overrides = {}) {
  return { AIRTABLE_BASE_ID: 'appTEST', AIRTABLE_API_KEY: 'test-key', ...overrides };
}
function mockCtx() {
  return { waitUntil: () => {} };
}
async function body(res) {
  return JSON.parse(await res.text());
}

function validStatus() {
  return {
    division: 'EXC',
    week_of: '2026-04-20',
    status: 'green',
    top_three_in_flight: 'A; B; C',
    top_blocker: 'none',
    eta_on_blocker: '2026-04-27',
    metric_delta_vs_last_week: '+12%',
  };
}
function validQueue() {
  return {
    division: 'TEC',
    item: 'Wire Division routes',
    owner_email: 'lead@coastalkey-pm.com',
    eta: '2026-04-25',
    definition_of_done: 'POST /v1/division/status returns 200 for valid payload.',
    status: 'in_flight',
  };
}

describe('division-lead service: constants', () => {
  it('exposes 10 division codes', () => {
    assert.equal(DIVISIONS.length, 10);
    for (const code of ['EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB', 'MCCO']) {
      assert.ok(DIVISIONS.includes(code));
    }
  });
  it('exposes 3 status values and 5 queue status values', () => {
    assert.deepEqual(STATUS_VALUES, ['green', 'yellow', 'red']);
    assert.equal(QUEUE_STATUS_VALUES.length, 5);
  });
});

describe('division-lead service: validateStatusPayload', () => {
  it('accepts a valid payload', () => {
    assert.equal(validateStatusPayload(validStatus()), null);
  });
  it('rejects missing fields', () => {
    const p = validStatus(); delete p.top_blocker;
    assert.match(validateStatusPayload(p), /top_blocker/);
  });
  it('rejects unknown division', () => {
    const p = { ...validStatus(), division: 'XXX' };
    assert.match(validateStatusPayload(p), /division must be one of/);
  });
  it('rejects unknown status', () => {
    const p = { ...validStatus(), status: 'blue' };
    assert.match(validateStatusPayload(p), /status must be one of/);
  });
  it('rejects non-ISO week_of', () => {
    const p = { ...validStatus(), week_of: '04/20/2026' };
    assert.match(validateStatusPayload(p), /week_of/);
  });
  it('rejects non-ISO eta_on_blocker', () => {
    const p = { ...validStatus(), eta_on_blocker: 'tomorrow' };
    assert.match(validateStatusPayload(p), /eta_on_blocker/);
  });
  it('rejects non-object payload', () => {
    assert.match(validateStatusPayload(null), /payload must be an object/);
    assert.match(validateStatusPayload('x'), /payload must be an object/);
  });
});

describe('division-lead service: validateQueuePayload', () => {
  it('accepts a valid payload', () => {
    assert.equal(validateQueuePayload(validQueue()), null);
  });
  it('rejects missing item', () => {
    const p = validQueue(); delete p.item;
    assert.match(validateQueuePayload(p), /item/);
  });
  it('rejects unknown queue status', () => {
    const p = { ...validQueue(), status: 'pending' };
    assert.match(validateQueuePayload(p), /status must be one of/);
  });
  it('rejects non-ISO eta', () => {
    const p = { ...validQueue(), eta: 'next week' };
    assert.match(validateQueuePayload(p), /eta/);
  });
  it('allows optional shipped_at when ISO', () => {
    const p = { ...validQueue(), shipped_at: '2026-04-22' };
    assert.equal(validateQueuePayload(p), null);
  });
  it('rejects non-ISO shipped_at', () => {
    const p = { ...validQueue(), shipped_at: 'done' };
    assert.match(validateQueuePayload(p), /shipped_at/);
  });
});

describe('division-lead service: buildWeekKey', () => {
  it('produces DIVISION-YYYY-Www format', () => {
    const k = buildWeekKey('EXC', '2026-04-20');
    assert.match(k, /^EXC-2026-W\d{2}$/);
  });
  it('zero-pads single-digit weeks', () => {
    const k = buildWeekKey('OPS', '2026-01-05');
    assert.match(k, /^OPS-2026-W0\d$/);
  });
});

describe('division-lead route: GET /v1/division/divisions', () => {
  it('returns the full division set', async () => {
    const res = handleDivisionList();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.success, true);
    assert.equal(b.divisions.length, 10);
  });
});

describe('division-lead route: POST /v1/division/status', () => {
  it('rejects invalid JSON body with 400', async () => {
    const res = await handleDivisionStatus(mockBadJsonRequest(), mockEnv(), mockCtx());
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.match(b.error, /Invalid JSON/);
  });
  it('rejects missing fields with 400', async () => {
    const payload = validStatus(); delete payload.status;
    const res = await handleDivisionStatus(mockRequest(payload), mockEnv(), mockCtx());
    assert.equal(res.status, 400);
  });
  it('rejects invalid division with 400', async () => {
    const payload = { ...validStatus(), division: 'ZZZ' };
    const res = await handleDivisionStatus(mockRequest(payload), mockEnv(), mockCtx());
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.match(b.error, /division must be one of/);
  });
  it('returns 500 when Airtable key is missing (valid payload reaches service)', async () => {
    const envNoKey = { AIRTABLE_BASE_ID: 'appTEST' };
    const res = await handleDivisionStatus(mockRequest(validStatus()), envNoKey, mockCtx());
    assert.equal(res.status, 500);
    const b = await body(res);
    assert.match(b.error, /AIRTABLE_API_KEY/);
  });
});

describe('division-lead route: POST /v1/division/queue', () => {
  it('rejects invalid JSON body with 400', async () => {
    const res = await handleDivisionQueueCreate(mockBadJsonRequest(), mockEnv(), mockCtx());
    assert.equal(res.status, 400);
  });
  it('rejects missing definition_of_done with 400', async () => {
    const payload = validQueue(); delete payload.definition_of_done;
    const res = await handleDivisionQueueCreate(mockRequest(payload), mockEnv(), mockCtx());
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.match(b.error, /definition_of_done/);
  });
  it('rejects unknown queue status with 400', async () => {
    const payload = { ...validQueue(), status: 'wip' };
    const res = await handleDivisionQueueCreate(mockRequest(payload), mockEnv(), mockCtx());
    assert.equal(res.status, 400);
  });
});

describe('division-lead route: GET /v1/division/queue/:code', () => {
  it('rejects unknown division with 400', async () => {
    const res = await handleDivisionQueueList({}, mockEnv(), mockCtx(), 'XYZ');
    assert.equal(res.status, 400);
    const b = await body(res);
    assert.match(b.error, /division must be one of/);
  });
  it('returns 500 when Airtable key missing for valid division', async () => {
    const envNoKey = { AIRTABLE_BASE_ID: 'appTEST' };
    const res = await handleDivisionQueueList({}, envNoKey, mockCtx(), 'TEC');
    assert.equal(res.status, 500);
  });
});
