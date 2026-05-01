import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

async function parseResponse(res) {
  return res.json();
}

const ctx = { waitUntil: () => {} };
const env = {};

describe('CEO Directive Service', () => {
  it('getOperatingState returns fleet totals', async () => {
    const { getOperatingState } = await import('../services/ceo-directives.js');
    const state = getOperatingState();
    assert.equal(state.fleet.total, 404);
    assert.equal(Object.keys(state.fleet.divisions).length, 12);
    assert.equal(state.fleet.intelligenceOfficers, 50);
    assert.equal(state.fleet.emailAgents, 20);
  });

  it('getDirectiveTypes returns all 5 types', async () => {
    const { getDirectiveTypes } = await import('../services/ceo-directives.js');
    const types = getDirectiveTypes();
    assert.equal(types.length, 5);
    const typeNames = types.map(t => t.type);
    assert.ok(typeNames.includes('optimize'));
    assert.ok(typeNames.includes('architect'));
    assert.ok(typeNames.includes('execute'));
    assert.ok(typeNames.includes('diagnose'));
    assert.ok(typeNames.includes('integrate'));
  });

  it('each directive type has a protocol', async () => {
    const { getDirectiveTypes } = await import('../services/ceo-directives.js');
    const types = getDirectiveTypes();
    for (const t of types) {
      assert.ok(t.protocol, `${t.type} missing protocol`);
      assert.ok(t.protocol.includes('→'), `${t.type} protocol should contain step arrows`);
    }
  });

  it('operating state includes Ferrari standards', async () => {
    const { getOperatingState } = await import('../services/ceo-directives.js');
    const state = getOperatingState();
    assert.ok(state.ferrariStandards);
    assert.ok(state.ferrariStandards.maxResponseTime);
    assert.ok(state.ferrariStandards.maintenanceTriage);
    assert.ok(state.ferrariStandards.contentCadence);
  });

  it('operating state includes all infrastructure', async () => {
    const { getOperatingState } = await import('../services/ceo-directives.js');
    const state = getOperatingState();
    assert.equal(state.infrastructure.workers.length, 3);
    assert.equal(state.infrastructure.pages.length, 2);
    assert.equal(state.infrastructure.voiceCampaigns, 8);
    assert.equal(state.infrastructure.thinkingFrameworks, 7);
    assert.equal(state.serviceZones.length, 10);
  });
});

describe('CEO Directive Routes', () => {
  it('GET /v1/ceo/dashboard returns operational status', async () => {
    const { handleCeoDashboard } = await import('../routes/ceo-directives.js');
    const res = handleCeoDashboard();
    assert.equal(res.status, 200);
    const data = await parseResponse(res);
    assert.equal(data.authority, 'Coastal Key AI CEO');
    assert.equal(data.status, 'operational');
    assert.equal(data.governance, 'sovereign');
    assert.equal(data.executionStandard, 'ferrari');
    assert.equal(data.enterprise.fleet_total, 404);
    assert.equal(data.enterprise.divisions, 12);
    assert.equal(data.directive_capabilities.length, 5);
  });

  it('GET /v1/ceo/operating-state returns full state', async () => {
    const { handleOperatingState } = await import('../routes/ceo-directives.js');
    const res = handleOperatingState();
    assert.equal(res.status, 200);
    const data = await parseResponse(res);
    assert.equal(data.authority, 'Coastal Key AI CEO');
    assert.ok(data.state.fleet);
    assert.ok(data.state.infrastructure);
    assert.ok(data.state.ferrariStandards);
  });

  it('POST /v1/ceo/directive rejects missing type', async () => {
    const { handleCeoDirective } = await import('../routes/ceo-directives.js');
    const req = { json: async () => ({ target: 'sales pipeline' }) };
    const res = await handleCeoDirective(req, env, ctx);
    assert.equal(res.status, 400);
    const data = await parseResponse(res);
    assert.ok(data.error.includes('type'));
  });

  it('POST /v1/ceo/directive rejects invalid type', async () => {
    const { handleCeoDirective } = await import('../routes/ceo-directives.js');
    const req = { json: async () => ({ type: 'destroy', target: 'everything' }) };
    const res = await handleCeoDirective(req, env, ctx);
    assert.equal(res.status, 400);
  });

  it('POST /v1/ceo/directive rejects missing target', async () => {
    const { handleCeoDirective } = await import('../routes/ceo-directives.js');
    const req = { json: async () => ({ type: 'optimize' }) };
    const res = await handleCeoDirective(req, env, ctx);
    assert.equal(res.status, 400);
    const data = await parseResponse(res);
    assert.ok(data.error.includes('target'));
  });

  it('POST /v1/ceo/operations-review rejects missing target', async () => {
    const { handleOperationsReview } = await import('../routes/ceo-directives.js');
    const req = { json: async () => ({}) };
    const res = await handleOperationsReview(req, env, ctx);
    assert.equal(res.status, 400);
    const data = await parseResponse(res);
    assert.ok(data.error.includes('target'));
  });

  it('dashboard includes all CEO endpoint paths', async () => {
    const { handleCeoDashboard } = await import('../routes/ceo-directives.js');
    const res = handleCeoDashboard();
    const data = await parseResponse(res);
    assert.ok(data.endpoints.issue_directive.includes('/v1/ceo/directive'));
    assert.ok(data.endpoints.full_operations_review.includes('/v1/ceo/operations-review'));
    assert.ok(data.endpoints.operating_state.includes('/v1/ceo/operating-state'));
    assert.ok(data.endpoints.thinking_coach.includes('/v1/thinking/dashboard'));
    assert.ok(data.endpoints.mcco_command.includes('/v1/mcco/command'));
  });

  it('dashboard includes Ferrari standards', async () => {
    const { handleCeoDashboard } = await import('../routes/ceo-directives.js');
    const res = handleCeoDashboard();
    const data = await parseResponse(res);
    assert.ok(data.ferrari_standards);
    assert.ok(data.ferrari_standards.maxResponseTime);
  });
});
