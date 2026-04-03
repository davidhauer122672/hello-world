import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Internal Building Division Tests
 * Validates the 5 IB agents and their integration into the enterprise registry.
 */

import { IB_AGENTS } from '../agents/agents-ib.js';
import { AGENTS, DIVISIONS } from '../agents/registry.js';

describe('Internal Building Division — Agent Roster', () => {
  it('has exactly 5 agents', () => {
    assert.equal(IB_AGENTS.length, 5);
  });

  it('all agents belong to IB division', () => {
    for (const agent of IB_AGENTS) {
      assert.equal(agent.division, 'IB');
    }
  });

  it('IDs are IB-001 through IB-005', () => {
    const expectedIds = ['IB-001', 'IB-002', 'IB-003', 'IB-004', 'IB-005'];
    for (let i = 0; i < 5; i++) {
      assert.equal(IB_AGENTS[i].id, expectedIds[i]);
    }
  });

  it('all agents have required fields', () => {
    for (const agent of IB_AGENTS) {
      assert.ok(agent.id);
      assert.ok(agent.name);
      assert.ok(agent.role);
      assert.ok(agent.description.length > 50, `${agent.id} description too short`);
      assert.ok(agent.triggers.length >= 3, `${agent.id} needs at least 3 triggers`);
      assert.ok(agent.outputs.length >= 3, `${agent.id} needs at least 3 outputs`);
      assert.ok(agent.kpis.length >= 3, `${agent.id} needs at least 3 KPIs`);
      assert.equal(agent.tier, 'advanced');
      assert.equal(agent.status, 'active');
    }
  });
});

describe('Internal Building Division — Workflow Engine Coverage', () => {
  it('IB-001 Zoning Authority handles architectural compliance', () => {
    const agent = IB_AGENTS.find(a => a.id === 'IB-001');
    assert.ok(agent.role.includes('Zoning'));
    assert.ok(agent.outputs.includes('zoning-approval'));
    assert.ok(agent.outputs.includes('development-permit'));
  });

  it('IB-002 Strategic Planner handles integration roadmaps', () => {
    const agent = IB_AGENTS.find(a => a.id === 'IB-002');
    assert.ok(agent.role.includes('Planning'));
    assert.ok(agent.outputs.includes('integration-roadmap'));
    assert.ok(agent.outputs.includes('dependency-map'));
  });

  it('IB-003 System Builder handles development and deployment', () => {
    const agent = IB_AGENTS.find(a => a.id === 'IB-003');
    assert.ok(agent.role.includes('Development'));
    assert.ok(agent.outputs.includes('deployed-system'));
    assert.ok(agent.outputs.includes('api-endpoint'));
  });

  it('IB-004 Inquiry Generator drives continuous improvement', () => {
    const agent = IB_AGENTS.find(a => a.id === 'IB-004');
    assert.ok(agent.role.includes('Inquiry'));
    assert.ok(agent.outputs.includes('manager-inquiry'));
    assert.ok(agent.kpis.includes('inquiry-response-rate'));
  });

  it('IB-005 Knowledge Router transfers cross-divisional intelligence', () => {
    const agent = IB_AGENTS.find(a => a.id === 'IB-005');
    assert.ok(agent.role.includes('Knowledge Transfer'));
    assert.ok(agent.outputs.includes('intelligence-routing'));
    assert.ok(agent.kpis.includes('routing-accuracy'));
  });
});

describe('Internal Building Division — Registry Integration', () => {
  it('IB division exists in DIVISIONS', () => {
    const ibDiv = DIVISIONS.find(d => d.id === 'IB');
    assert.ok(ibDiv);
    assert.equal(ibDiv.name, 'Internal Building');
    assert.ok(ibDiv.description.toLowerCase().includes('enterprise brain'));
  });

  it('total divisions is 11', () => {
    assert.equal(DIVISIONS.length, 11);
  });

  it('total enterprise agents is 340', () => {
    assert.equal(AGENTS.length, 340);
  });

  it('IB agents findable in global registry', () => {
    for (const agent of IB_AGENTS) {
      const found = AGENTS.find(a => a.id === agent.id);
      assert.ok(found, `${agent.id} not found in registry`);
    }
  });
});
