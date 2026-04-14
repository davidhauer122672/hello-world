import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getOpsFlowchart, getOpsStages, getOpsStage, getOpsRACI, getOpsKPIs } from '../services/operations-flowchart.js';

describe('Operations Flowchart Service', () => {
  describe('getOpsFlowchart()', () => {
    it('returns 7 stages with RACI and scale tiers', () => {
      const fc = getOpsFlowchart();
      assert.equal(fc.totalStages, 7);
      assert.equal(fc.stages.length, 7);
      assert.ok(fc.raci);
      assert.equal(fc.scaleTiers.length, 3);
      assert.equal(fc.status, 'production-ready');
    });
  });

  describe('getOpsStages()', () => {
    it('returns all 7 stages in sequence', () => {
      const result = getOpsStages();
      assert.equal(result.totalStages, 7);
      for (let i = 0; i < 7; i++) {
        assert.equal(result.stages[i].sequence, i + 1);
      }
    });

    it('every stage has steps, decision node, bottleneck flag, KPI', () => {
      const result = getOpsStages();
      for (const s of result.stages) {
        assert.ok(s.steps.length > 0, `${s.id} missing steps`);
        assert.ok(s.decisionNode, `${s.id} missing decisionNode`);
        assert.ok(s.bottleneckFlag, `${s.id} missing bottleneckFlag`);
        assert.ok(s.kpi, `${s.id} missing kpi`);
      }
    });
  });

  describe('getOpsStage()', () => {
    it('returns Lead Intake for STAGE-01', () => {
      const s = getOpsStage('STAGE-01');
      assert.ok(s);
      assert.equal(s.name, 'Lead Intake & Qualification');
    });

    it('returns Review for STAGE-07', () => {
      const s = getOpsStage('STAGE-07');
      assert.ok(s);
      assert.equal(s.name, 'Review & Optimization');
    });

    it('returns null for invalid stage', () => {
      assert.equal(getOpsStage('STAGE-99'), null);
    });
  });

  describe('getOpsRACI()', () => {
    it('returns RACI matrix with 7 assignments', () => {
      const raci = getOpsRACI();
      assert.equal(raci.assignments.length, 7);
      assert.ok(raci.legend);
    });
  });

  describe('getOpsKPIs()', () => {
    it('returns KPIs for all 7 stages', () => {
      const kpis = getOpsKPIs();
      assert.equal(kpis.kpis.length, 7);
      for (const k of kpis.kpis) {
        assert.ok(k.kpi.name, 'Missing KPI name');
        assert.ok(k.kpi.target, 'Missing KPI target');
      }
    });
  });
});

import { handleOpsFlowchart, handleOpsStages, handleOpsStage, handleOpsRACI, handleOpsKPIs } from '../routes/operations-flowchart.js';

describe('Operations Flowchart Routes', () => {
  it('GET /v1/ops/flowchart returns 200', async () => {
    const res = handleOpsFlowchart();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalStages, 7);
  });

  it('GET /v1/ops/stages returns all stages', async () => {
    const res = handleOpsStages();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalStages, 7);
  });

  it('GET /v1/ops/stages/STAGE-01 returns stage', async () => {
    const res = handleOpsStage('STAGE-01');
    assert.equal(res.status, 200);
  });

  it('GET /v1/ops/stages/STAGE-99 returns 404', async () => {
    const res = handleOpsStage('STAGE-99');
    assert.equal(res.status, 404);
  });

  it('GET /v1/ops/raci returns RACI', async () => {
    const res = handleOpsRACI();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.assignments.length, 7);
  });

  it('GET /v1/ops/kpis returns KPIs', async () => {
    const res = handleOpsKPIs();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.kpis.length, 7);
  });
});
