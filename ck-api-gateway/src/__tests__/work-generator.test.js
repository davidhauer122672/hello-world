import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CORE_GOALS,
  FLEET_DIVISIONS,
  CURRENT_PHASE,
  getDashboard,
} from '../services/work-generator.js';

import {
  handleWorkgenDashboard,
  handleWorkgenGoals,
  handleWorkgenFleet,
  handleWorkgenBuild,
  handleWorkgenDiagnose,
} from '../routes/work-generator.js';

async function parseResponse(res) {
  return JSON.parse(await res.text());
}

// ── Service Tests ──────────────────────────────────────────────────────────

describe('Work Generator Service', () => {
  it('defines 4 core goals', () => {
    assert.equal(CORE_GOALS.length, 4);
    for (const g of CORE_GOALS) {
      assert.ok(g.id.startsWith('CG-'));
      assert.ok(g.target);
      assert.ok(g.metric);
      assert.ok(g.kpis.length >= 2);
    }
  });

  it('defines 4 fleet divisions totaling 383 agents', () => {
    const total = Object.values(FLEET_DIVISIONS).reduce((s, d) => s + d.agents, 0);
    assert.equal(total, 383);
    assert.equal(Object.keys(FLEET_DIVISIONS).length, 4);
  });

  it('each division has name, codes, and focus', () => {
    for (const [key, div] of Object.entries(FLEET_DIVISIONS)) {
      assert.ok(key.startsWith('D'));
      assert.ok(div.name);
      assert.ok(div.codes.length >= 2);
      assert.ok(div.focus);
    }
  });

  it('current phase is defined', () => {
    assert.ok(CURRENT_PHASE.name);
    assert.ok(CURRENT_PHASE.period);
    assert.ok(CURRENT_PHASE.priorities.length >= 3);
  });

  it('dashboard includes all capabilities', () => {
    const d = getDashboard();
    assert.equal(d.engine, 'Work Generator Orchestrator');
    assert.equal(d.status, 'online');
    assert.equal(d.governance, 'sovereign');
    assert.equal(d.fleet.total, 383);
    assert.ok(d.capabilities.run_cycle);
    assert.ok(d.capabilities.build_system);
    assert.ok(d.capabilities.diagnose_system);
    assert.ok(d.validSystemTypes.length >= 10);
  });
});

// ── Route Tests ────────────────────────────────────────────────────────────

describe('Work Generator Routes', () => {
  it('GET /v1/workgen/dashboard returns operational status', async () => {
    const res = handleWorkgenDashboard();
    assert.equal(res.status, 200);
    const data = await parseResponse(res);
    assert.equal(data.engine, 'Work Generator Orchestrator');
    assert.equal(data.status, 'online');
    assert.equal(data.fleet.total, 383);
    assert.ok(data.coreGoals);
    assert.ok(data.capabilities);
  });

  it('GET /v1/workgen/goals returns 4 core goals', async () => {
    const res = handleWorkgenGoals();
    const data = await parseResponse(res);
    assert.equal(data.count, 4);
    assert.equal(data.governance, 'sovereign');
    assert.equal(data.coreGoals[0].id, 'CG-1');
    assert.equal(data.coreGoals[3].id, 'CG-4');
  });

  it('GET /v1/workgen/fleet returns 383 agents in 4 divisions', async () => {
    const res = handleWorkgenFleet();
    const data = await parseResponse(res);
    assert.equal(data.total, 383);
    assert.equal(data.divisionCount, 4);
    assert.ok(data.divisions.D1);
    assert.ok(data.divisions.D4);
  });

  it('POST /v1/workgen/build rejects missing system_type', async () => {
    const res = await handleWorkgenBuild(
      { json: async () => ({}) },
      {},
      { waitUntil: () => {} },
    );
    assert.equal(res.status, 400);
    const data = await parseResponse(res);
    assert.ok(data.error.includes('system_type'));
  });

  it('POST /v1/workgen/build rejects invalid system_type', async () => {
    const res = await handleWorkgenBuild(
      { json: async () => ({ system_type: 'invalid_type' }) },
      {},
      { waitUntil: () => {} },
    );
    assert.equal(res.status, 400);
    const data = await parseResponse(res);
    assert.ok(data.error.includes('Invalid system type'));
  });

  it('POST /v1/workgen/build accepts valid system_type list', async () => {
    const validTypes = [
      'inspection', 'onboarding', 'billing', 'maintenance',
      'sensor-deployment', 'owner-reporting', 'marketing-automation',
      'lead-pipeline', 'vendor-management', 'compliance', 'outbound-campaign',
    ];
    for (const st of validTypes) {
      const res = await handleWorkgenBuild(
        { json: async () => ({ system_type: st }) },
        {},
        { waitUntil: () => {} },
      );
      // Without ANTHROPIC_API_KEY, expect 500 (not 400)
      assert.notEqual(res.status, 400, `${st} should not return 400`);
    }
  });

  it('POST /v1/workgen/diagnose rejects missing system_name', async () => {
    const res = await handleWorkgenDiagnose(
      { json: async () => ({}) },
      {},
      { waitUntil: () => {} },
    );
    assert.equal(res.status, 400);
    const data = await parseResponse(res);
    assert.ok(data.error.includes('system_name'));
  });

  it('POST /v1/workgen/diagnose rejects invalid JSON', async () => {
    const res = await handleWorkgenDiagnose(
      { json: async () => { throw new Error('bad'); } },
      {},
      { waitUntil: () => {} },
    );
    assert.equal(res.status, 400);
  });
});
