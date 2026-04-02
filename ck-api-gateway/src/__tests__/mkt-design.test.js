import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Design & Luxury Brand Division Tests
 * Validates the 20 Ford-methodology marketing agents (MKT-041 through MKT-060).
 */

import { MKT_DESIGN_AGENTS } from '../agents/agents-mkt-design.js';
import { MKT_AGENTS } from '../agents/agents-mkt.js';
import { AGENTS } from '../agents/registry.js';

describe('Design & Luxury Brand Division — Agent Roster', () => {
  it('has exactly 20 design agents', () => {
    assert.equal(MKT_DESIGN_AGENTS.length, 20);
  });

  it('all agents belong to MKT division', () => {
    for (const agent of MKT_DESIGN_AGENTS) {
      assert.equal(agent.division, 'MKT');
    }
  });

  it('IDs are sequential MKT-041 through MKT-060', () => {
    for (let i = 0; i < 20; i++) {
      assert.equal(MKT_DESIGN_AGENTS[i].id, `MKT-0${41 + i}`);
    }
  });

  it('has Brand Titan as chief strategist (MKT-041)', () => {
    const titan = MKT_DESIGN_AGENTS.find(a => a.id === 'MKT-041');
    assert.ok(titan);
    assert.ok(titan.role.includes('Chief Brand Strategist'));
  });

  it('has Campaign Commander (MKT-042)', () => {
    const commander = MKT_DESIGN_AGENTS.find(a => a.id === 'MKT-042');
    assert.ok(commander);
    assert.ok(commander.role.includes('Campaign Architect'));
  });

  it('has Creative Director (MKT-043)', () => {
    const cd = MKT_DESIGN_AGENTS.find(a => a.id === 'MKT-043');
    assert.ok(cd);
    assert.ok(cd.role.includes('Creative Excellence'));
  });

  it('all agents have required fields', () => {
    for (const agent of MKT_DESIGN_AGENTS) {
      assert.ok(agent.id, `Missing id on ${agent.name}`);
      assert.ok(agent.name, `Missing name on ${agent.id}`);
      assert.ok(agent.role, `Missing role on ${agent.id}`);
      assert.ok(agent.description, `Missing description on ${agent.id}`);
      assert.ok(agent.triggers.length > 0, `No triggers on ${agent.id}`);
      assert.ok(agent.outputs.length > 0, `No outputs on ${agent.id}`);
      assert.ok(agent.kpis.length > 0, `No kpis on ${agent.id}`);
    }
  });

  it('no duplicate IDs with core MKT agents', () => {
    const coreIds = new Set(MKT_AGENTS.map(a => a.id));
    for (const agent of MKT_DESIGN_AGENTS) {
      assert.ok(!coreIds.has(agent.id), `Duplicate ID: ${agent.id}`);
    }
  });
});

describe('Design & Luxury Brand Division — Strategic Coverage', () => {
  it('covers creative command (Brand Titan + Campaign Commander)', () => {
    const command = MKT_DESIGN_AGENTS.filter(a =>
      ['MKT-041', 'MKT-042'].includes(a.id)
    );
    assert.equal(command.length, 2);
  });

  it('covers luxury creative studio', () => {
    const studio = MKT_DESIGN_AGENTS.filter(a =>
      ['MKT-043', 'MKT-044', 'MKT-045'].includes(a.id)
    );
    assert.equal(studio.length, 3);
  });

  it('covers performance marketing engine', () => {
    const perf = MKT_DESIGN_AGENTS.filter(a =>
      ['MKT-046', 'MKT-047'].includes(a.id)
    );
    assert.equal(perf.length, 2);
  });

  it('covers category domination', () => {
    const cat = MKT_DESIGN_AGENTS.filter(a =>
      ['MKT-048', 'MKT-049'].includes(a.id)
    );
    assert.equal(cat.length, 2);
  });

  it('covers investor and premium client marketing', () => {
    const inv = MKT_DESIGN_AGENTS.filter(a =>
      ['MKT-054', 'MKT-055'].includes(a.id)
    );
    assert.equal(inv.length, 2);
  });

  it('covers measurement and intelligence', () => {
    const intel = MKT_DESIGN_AGENTS.filter(a =>
      ['MKT-058', 'MKT-059'].includes(a.id)
    );
    assert.equal(intel.length, 2);
  });

  it('has Innovation Lab for emerging channels (MKT-060)', () => {
    const lab = MKT_DESIGN_AGENTS.find(a => a.id === 'MKT-060');
    assert.ok(lab);
    assert.ok(lab.role.includes('Innovation'));
  });
});

describe('Design & Luxury Brand Division — Registry Integration', () => {
  it('total enterprise agent count is 335', () => {
    assert.equal(AGENTS.length, 335);
  });

  it('MKT division has 60 total agents (40 core + 20 design)', () => {
    const mktAgents = AGENTS.filter(a => a.division === 'MKT');
    assert.equal(mktAgents.length, 60);
  });

  it('design agents are findable in global registry', () => {
    const titan = AGENTS.find(a => a.id === 'MKT-041');
    assert.ok(titan);
    assert.equal(titan.name, 'Brand Titan');
  });
});
