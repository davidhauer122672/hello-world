import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getRetellFramework, getRetellFunctions, getRetellFunction, getRetellTests, getRetellPipeline } from '../services/retell-config.js';

describe('ReTell Config Service', () => {
  describe('getRetellFramework()', () => {
    it('returns framework with 8 functions and 12 test scenarios', () => {
      const fw = getRetellFramework();
      assert.equal(fw.totalFunctions, 8);
      assert.equal(fw.testScenarios, 12);
      assert.equal(fw.status, 'production-ready');
    });
  });

  describe('getRetellFunctions()', () => {
    it('returns all 8 functions', () => {
      const result = getRetellFunctions();
      assert.equal(result.totalFunctions, 8);
      assert.equal(result.functions.length, 8);
    });

    it('every function has id, name, parameters, webhookUrl', () => {
      const result = getRetellFunctions();
      for (const fn of result.functions) {
        assert.ok(fn.id, 'Missing id');
        assert.ok(fn.name, 'Missing name');
        assert.ok(fn.parameters, `${fn.id} missing parameters`);
        assert.ok(fn.webhookUrl, `${fn.id} missing webhookUrl`);
      }
    });
  });

  describe('getRetellFunction()', () => {
    it('returns check_property_availability for FN-001', () => {
      const fn = getRetellFunction('FN-001');
      assert.ok(fn);
      assert.equal(fn.name, 'check_property_availability');
    });

    it('returns schedule_seasonal_activation for FN-008', () => {
      const fn = getRetellFunction('FN-008');
      assert.ok(fn);
      assert.equal(fn.name, 'schedule_seasonal_activation');
    });

    it('returns null for invalid function', () => {
      assert.equal(getRetellFunction('FN-999'), null);
    });
  });

  describe('getRetellTests()', () => {
    it('returns all 12 test scenarios', () => {
      const tests = getRetellTests();
      assert.equal(tests.totalScenarios, 12);
      assert.equal(tests.scenarios.length, 12);
    });

    it('every scenario has id, function, input, expectedOutcome', () => {
      const tests = getRetellTests();
      for (const t of tests.scenarios) {
        assert.ok(t.id, 'Missing id');
        assert.ok(t.function, `${t.id} missing function ref`);
        assert.ok(t.input, `${t.id} missing input`);
        assert.ok(t.expectedOutcome, `${t.id} missing expectedOutcome`);
      }
    });

    it('covers at least 8 unique functions', () => {
      const tests = getRetellTests();
      const covered = new Set(tests.scenarios.map(t => t.function));
      assert.ok(covered.size >= 7);
    });
  });

  describe('getRetellPipeline()', () => {
    it('returns 4-stage deployment pipeline', () => {
      const p = getRetellPipeline();
      assert.equal(p.pipeline.stages.length, 4);
      assert.ok(p.pipeline.rollbackPlan);
      assert.ok(p.pipeline.monitoringKPIs.length >= 3);
    });
  });
});

import { handleRetellFramework, handleRetellFunctions, handleRetellFunction, handleRetellTests, handleRetellPipeline } from '../routes/retell-config.js';

describe('ReTell Config Routes', () => {
  it('GET /v1/retell/framework returns 200', async () => {
    const res = handleRetellFramework();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalFunctions, 8);
  });

  it('GET /v1/retell/functions returns all functions', async () => {
    const res = handleRetellFunctions();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalFunctions, 8);
  });

  it('GET /v1/retell/functions/FN-001 returns function', async () => {
    const res = handleRetellFunction('FN-001');
    assert.equal(res.status, 200);
  });

  it('GET /v1/retell/functions/FN-999 returns 404', async () => {
    const res = handleRetellFunction('FN-999');
    assert.equal(res.status, 404);
  });

  it('GET /v1/retell/tests returns test scenarios', async () => {
    const res = handleRetellTests();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalScenarios, 12);
  });

  it('GET /v1/retell/pipeline returns deployment pipeline', async () => {
    const res = handleRetellPipeline();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.pipeline.stages.length, 4);
  });
});
