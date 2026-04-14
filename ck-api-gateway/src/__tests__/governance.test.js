import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getGovernanceFramework, getMission, getGoals, getGoal, getDecisionFilter, getAlignmentMap } from '../services/governance.js';

describe('Governance Service', () => {
  describe('getGovernanceFramework()', () => {
    it('returns full framework with mission, goals, governance, alignment', () => {
      const fw = getGovernanceFramework();
      assert.ok(fw.mission);
      assert.ok(fw.goals);
      assert.ok(fw.governance);
      assert.ok(fw.alignment);
      assert.equal(fw.status, 'active');
      assert.equal(fw.totalGoals, 5);
    });
  });

  describe('getMission()', () => {
    it('returns mission with statement, filter, and northStar', () => {
      const m = getMission();
      assert.ok(m.statement);
      assert.ok(m.filter);
      assert.ok(m.northStar);
      assert.equal(m.status, 'active');
    });
  });

  describe('getGoals()', () => {
    it('returns all 5 goals', () => {
      const g = getGoals();
      assert.equal(g.totalGoals, 5);
      assert.equal(g.goals.length, 5);
    });

    it('every goal has id, metric, target, timeframe, killCondition', () => {
      const g = getGoals();
      for (const goal of g.goals) {
        assert.ok(goal.id, 'Missing id');
        assert.ok(goal.metric, 'Missing metric');
        assert.ok(goal.target !== undefined, `${goal.id} missing target`);
        assert.ok(goal.timeframe, `${goal.id} missing timeframe`);
        assert.ok(goal.killCondition, `${goal.id} missing killCondition`);
      }
    });
  });

  describe('getGoal()', () => {
    it('returns GOAL-01', () => {
      const g = getGoal('GOAL-01');
      assert.ok(g);
      assert.equal(g.target, 120);
    });

    it('returns null for invalid goal', () => {
      assert.equal(getGoal('GOAL-99'), null);
    });
  });

  describe('getDecisionFilter()', () => {
    it('returns filter with steps and principles', () => {
      const df = getDecisionFilter();
      assert.ok(df.steps.length >= 5);
      assert.ok(df.principles.length >= 6);
      assert.equal(df.status, 'active');
    });
  });

  describe('getAlignmentMap()', () => {
    it('returns alignment with system connections and feedback loops', () => {
      const am = getAlignmentMap();
      assert.ok(am.systemIntegration.connections.length >= 7);
      assert.ok(am.feedbackLoops.length >= 5);
      assert.ok(am.iterationEngine);
    });
  });
});

import { handleGovernanceFramework, handleMission, handleGoals, handleGoal, handleDecisionFilter, handleAlignmentMap } from '../routes/governance.js';

describe('Governance Routes', () => {
  it('GET /v1/governance/framework returns 200', async () => {
    const res = handleGovernanceFramework();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalGoals, 5);
  });

  it('GET /v1/governance/mission returns mission', async () => {
    const res = handleMission();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.statement);
  });

  it('GET /v1/governance/goals returns all goals', async () => {
    const res = handleGoals();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalGoals, 5);
  });

  it('GET /v1/governance/goals/GOAL-01 returns goal', async () => {
    const res = handleGoal('GOAL-01');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.goal.target, 120);
  });

  it('GET /v1/governance/goals/GOAL-99 returns 404', async () => {
    const res = handleGoal('GOAL-99');
    assert.equal(res.status, 404);
  });

  it('GET /v1/governance/decision-filter returns filter', async () => {
    const res = handleDecisionFilter();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.steps);
    assert.ok(body.principles);
  });

  it('GET /v1/governance/alignment returns alignment map', async () => {
    const res = handleAlignmentMap();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.systemIntegration);
    assert.ok(body.feedbackLoops);
  });
});
