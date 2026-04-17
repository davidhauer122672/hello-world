/**
 * Market Strategy Skill Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

async function body(res) { return JSON.parse(await res.text()); }

describe('Market Strategy Engine', async () => {
  const { STRATEGY_FRAMEWORK, GOVERNANCE_PILLARS, TARGETS, generateStrategy, getMarketStrategyDashboard } = await import('../engines/market-strategy.js');

  it('framework has 8 phases in order', () => {
    assert.equal(STRATEGY_FRAMEWORK.phases.length, 8);
    const orders = STRATEGY_FRAMEWORK.phases.map(p => p.order);
    assert.deepEqual(orders, [1,2,3,4,5,6,7,8]);
  });

  it('every phase has agents and exit criteria', () => {
    for (const phase of STRATEGY_FRAMEWORK.phases) {
      assert.ok(phase.agents.length > 0, phase.name + ' has no agents');
      assert.ok(phase.exitCriteria, phase.name + ' has no exit criteria');
    }
  });

  it('governance includes 8 excellence standards', () => {
    assert.equal(Object.keys(GOVERNANCE_PILLARS.standards).length, 8);
    assert.ok(GOVERNANCE_PILLARS.standards.research.includes('IQVIA'));
    assert.ok(GOVERNANCE_PILLARS.standards.design.includes('Chanel'));
    assert.ok(GOVERNANCE_PILLARS.standards.engineering.includes('SpaceX'));
  });

  it('targets align with sovereign governance', () => {
    assert.equal(TARGETS.grossMargin, 0.40);
    assert.equal(TARGETS.automationRate, 0.75);
    assert.equal(TARGETS.ltvCacRatio, 3.0);
    assert.equal(TARGETS.preventableIncidents, 0);
  });

  it('generateStrategy returns full artifact', () => {
    const s = generateStrategy({ lesson: 'Focus on one message for one customer.', focus: 'acquisition' });
    assert.ok(s.strategyId.startsWith('STR-'));
    assert.equal(s.focus, 'acquisition');
    assert.equal(s.executionArtifact.length, 8);
    assert.ok(s.firstWeekActions.length >= 5);
    assert.ok(s.qualityGates.length >= 5);
  });

  it('dashboard exposes skill metadata', () => {
    const d = getMarketStrategyDashboard();
    assert.equal(d.skill, 'Coastal Key Market Strategy Skill');
    assert.equal(d.status, 'OPERATIONAL');
    assert.equal(d.framework.phaseCount, 8);
    assert.ok(d.integrations.research.length > 0);
  });
});

describe('Market Strategy Routes', async () => {
  const { handleStrategyDashboard, handleStrategyFramework } = await import('../routes/market-strategy.js');

  it('GET /v1/strategy/dashboard returns skill', async () => {
    const res = handleStrategyDashboard();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.skill, 'Coastal Key Market Strategy Skill');
  });

  it('GET /v1/strategy/framework returns 8 phases', async () => {
    const res = handleStrategyFramework();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.phaseCount, 8);
  });
});
