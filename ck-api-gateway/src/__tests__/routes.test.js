/**
 * Route handler tests for CK API Gateway
 *
 * Tests core route handlers: response structure, filtering, error handling.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function makeURL(path, params = {}) {
  const url = new URL(`https://test.workers.dev${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url;
}

async function body(res) {
  return JSON.parse(await res.text());
}

// ── Agent Routes ────────────────────────────────────────────────────────────

describe('Agent Routes', async () => {
  const { handleListAgents, handleGetAgent, handleAgentMetrics } = await import('../routes/agents.js');

  it('lists agents returning count and array', async () => {
    const res = handleListAgents(makeURL('/v1/agents'));
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.ok(Array.isArray(b.agents));
    assert.ok(b.agents.length > 100, 'Should have 312 agents');
    assert.ok(b.count > 0);
  });

  it('filters agents by division MKT', async () => {
    const res = handleListAgents(makeURL('/v1/agents', { division: 'MKT' }));
    const b = await body(res);
    assert.ok(b.agents.every(a => a.division === 'MKT'));
    assert.equal(b.agents.length, 48);
  });

  it('filters agents by status active', async () => {
    const res = handleListAgents(makeURL('/v1/agents', { status: 'active' }));
    const b = await body(res);
    assert.ok(b.agents.every(a => a.status === 'active'));
  });

  it('filters agents by tier advanced', async () => {
    const res = handleListAgents(makeURL('/v1/agents', { tier: 'advanced' }));
    const b = await body(res);
    assert.ok(b.agents.every(a => a.tier === 'advanced'));
  });

  it('searches agents by keyword', async () => {
    const res = handleListAgents(makeURL('/v1/agents', { search: 'SEO' }));
    const b = await body(res);
    assert.ok(b.agents.length > 0);
  });

  it('returns 404 for unknown agent', async () => {
    assert.equal(handleGetAgent('FAKE-999').status, 404);
  });

  it('returns agent wrapped in agent key', async () => {
    const res = handleGetAgent('MKT-001');
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.agent.id, 'MKT-001');
    assert.equal(b.agent.name, 'Content Architect');
  });

  it('returns metrics with byDivision and byStatus', async () => {
    const res = handleAgentMetrics();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.ok(b.byDivision);
    assert.ok(b.byStatus);
  });
});

// ── Intelligence Officer Routes ─────────────────────────────────────────────

describe('Intelligence Officer Routes', async () => {
  const { handleListOfficers, handleGetOfficer, handleOfficerDashboard } = await import('../routes/intelligence-officers.js');
  const mockEnv = { AUDIT_LOG: { put: async () => {}, list: async () => ({ keys: [] }) } };

  it('lists all 50 officers with 5 squads', async () => {
    const b = await body(handleListOfficers(makeURL('/v1/intel/officers')));
    assert.equal(b.totalOfficers, 50);
    assert.equal(b.squads.length, 5);
  });

  it('filters by squad ALPHA (10 officers)', async () => {
    const b = await body(handleListOfficers(makeURL('/v1/intel/officers', { squad: 'ALPHA' })));
    assert.equal(b.filtered, 10);
    assert.ok(b.officers.every(o => o.squad === 'ALPHA'));
  });

  it('filters by severity critical', async () => {
    const b = await body(handleListOfficers(makeURL('/v1/intel/officers', { severity: 'critical' })));
    assert.ok(b.officers.every(o => o.severity === 'critical'));
    assert.ok(b.filtered > 0);
  });

  it('returns 404 for unknown officer', async () => {
    assert.equal(handleGetOfficer('IO-Z99').status, 404);
  });

  it('returns IO-A01 with squad metadata', async () => {
    const b = await body(handleGetOfficer('IO-A01'));
    assert.equal(b.id, 'IO-A01');
    assert.equal(b.name, 'Sentinel Prime');
    assert.equal(b.squad.id, 'ALPHA');
  });

  it('returns IO-C01 in CHARLIE squad', async () => {
    const b = await body(handleGetOfficer('IO-C01'));
    assert.equal(b.squad.id, 'CHARLIE');
    assert.equal(b.severity, 'critical');
  });

  it('returns dashboard with fleet size 50', async () => {
    const b = await body(await handleOfficerDashboard(mockEnv));
    assert.equal(b.fleetSize, 50);
    assert.ok(b.bySeverity);
    assert.ok(b.timestamp);
  });
});

// ── Email Agent Routes ──────────────────────────────────────────────────────

describe('Email Agent Routes', async () => {
  const { handleListEmailAgents, handleGetEmailAgent, handleEmailDashboard } = await import('../routes/email-agents.js');

  it('lists all 20 email agents across 4 squads', async () => {
    const b = await body(handleListEmailAgents(makeURL('/v1/email/agents')));
    assert.equal(b.totalAgents, 20);
    assert.equal(b.squads.length, 4);
  });

  it('filters by COMPOSE squad (5 agents)', async () => {
    const b = await body(handleListEmailAgents(makeURL('/v1/email/agents', { squad: 'COMPOSE' })));
    assert.equal(b.filtered, 5);
    assert.ok(b.agents.every(a => a.squad === 'COMPOSE'));
  });

  it('filters by MONITOR squad', async () => {
    const b = await body(handleListEmailAgents(makeURL('/v1/email/agents', { squad: 'MONITOR' })));
    assert.equal(b.filtered, 5);
  });

  it('returns 404 for unknown email agent', async () => {
    assert.equal(handleGetEmailAgent('EM-Z99').status, 404);
  });

  it('returns EM-I01 Classifier with INTAKE squad', async () => {
    const b = await body(handleGetEmailAgent('EM-I01'));
    assert.equal(b.id, 'EM-I01');
    assert.equal(b.name, 'Classifier');
    assert.equal(b.squad.id, 'INTAKE');
  });

  it('returns dashboard with capabilities', async () => {
    const b = await body(handleEmailDashboard());
    assert.equal(b.fleetSize, 20);
    assert.ok(b.capabilities.length >= 5);
  });
});

// ── MCCO Routes ─────────────────────────────────────────────────────────────

describe('MCCO Routes', async () => {
  const { handleMCCOCommand, handleListMCCOAgents, handleGetMCCOAgent, handleMCCOFleetStatus } = await import('../routes/mcco.js');

  it('returns sovereign command with commander data', async () => {
    const b = await body(handleMCCOCommand());
    assert.ok(b.commander);
    assert.ok(b.mccoFleet || b.hierarchy);
  });

  it('lists 15 MCCO agents', async () => {
    const b = await body(handleListMCCOAgents(makeURL('/v1/mcco/agents')));
    assert.equal(b.count, 15);
    assert.equal(b.agents.length, 15);
    assert.equal(b.governance, 'sovereign');
  });

  it('returns 404 for unknown MCCO agent', async () => {
    assert.equal(handleGetMCCOAgent('MCCO-999').status, 404);
  });

  it('returns MCCO-000 sovereign', async () => {
    const b = await body(handleGetMCCOAgent('MCCO-000'));
    assert.equal(b.agent.name, 'MCCO Sovereign');
    assert.equal(b.agent.governance, 'sovereign');
  });

  it('returns MCCO-005 Scroll Breaker', async () => {
    const b = await body(handleGetMCCOAgent('MCCO-005'));
    assert.equal(b.agent.name, 'Scroll Breaker');
  });

  it('returns fleet inspection data', async () => {
    const b = await body(handleMCCOFleetStatus());
    assert.ok(b.fleetInspection);
    assert.ok(b.totalAgentsGoverned > 0);
  });
});

// ── Pricing Routes ──────────────────────────────────────────────────────────

describe('Pricing Routes', async () => {
  const { handlePricingZones } = await import('../routes/pricing.js');

  it('returns zone-level pricing benchmarks', async () => {
    const b = await body(handlePricingZones());
    assert.ok(b.zones);
    assert.ok(b.zones.length > 0);
  });
});

// ── Framework Routes ────────────────────────────────────────────────────────

describe('Framework Routes', async () => {
  const { handleListFrameworks, handleGetFrameworksByCategory } = await import('../routes/frameworks.js');

  it('lists frameworks (requires url param)', async () => {
    const res = handleListFrameworks(makeURL('/v1/frameworks'));
    assert.equal(res.status, 200);
  });

  it('filters frameworks by sales category', async () => {
    const res = handleGetFrameworksByCategory('sales');
    assert.equal(res.status, 200);
  });
});

// ── Engine Routes ───────────────────────────────────────────────────────────

describe('Engine Routes — Agent Hierarchy', async () => {
  const { handleCommandChain, handleFleetStatusEndpoint, handleDivisionHierarchyEndpoint } = await import('../routes/engines.js');

  it('returns command chain with escalation matrix', async () => {
    const b = await body(handleCommandChain());
    assert.ok(b.commandChain);
    assert.ok(b.escalationMatrix);
  });

  it('returns fleet status', async () => {
    assert.equal(handleFleetStatusEndpoint().status, 200);
  });

  it('returns EXC division hierarchy', async () => {
    assert.equal(handleDivisionHierarchyEndpoint('EXC').status, 200);
  });

  it('returns MKT division hierarchy', async () => {
    assert.equal(handleDivisionHierarchyEndpoint('MKT').status, 200);
  });
});
