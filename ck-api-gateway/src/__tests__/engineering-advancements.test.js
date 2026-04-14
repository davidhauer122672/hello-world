import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getEngineeringFramework, getEngineeringPillars, getEngineeringPillar,
  getOrchestratorIntegration, getIndustryPositioning, getImplementationStatus,
} from '../services/engineering-advancements.js';

describe('Engineering Advancements Service', () => {
  describe('getEngineeringFramework()', () => {
    it('returns framework with 5 pillars', () => {
      const fw = getEngineeringFramework();
      assert.equal(fw.id, 'CK-ENR-ADV');
      assert.equal(fw.totalPillars, 5);
      assert.equal(fw.pillars.length, 5);
      assert.equal(fw.status, 'operational');
    });

    it('source references ENR FutureTech 2026', () => {
      const fw = getEngineeringFramework();
      assert.ok(fw.source.includes('ENR FutureTech 2026'));
    });

    it('entity is Coastal Key Property Management LLC', () => {
      const fw = getEngineeringFramework();
      assert.equal(fw.entity, 'Coastal Key Property Management LLC');
    });

    it('every pillar summary has required fields', () => {
      const fw = getEngineeringFramework();
      for (const p of fw.pillars) {
        assert.ok(p.id, 'Missing id');
        assert.ok(p.pillar, 'Missing pillar name');
        assert.ok(p.implementationName, `${p.id} missing implementationName`);
        assert.ok(p.componentCount >= 5, `${p.id} has fewer than 5 components`);
        assert.ok(p.impactMetric, `${p.id} missing impactMetric`);
        assert.ok(p.competitiveAdvantage, `${p.id} missing competitiveAdvantage`);
      }
    });
  });

  describe('getEngineeringPillars()', () => {
    it('returns all 5 pillars with full detail', () => {
      const result = getEngineeringPillars();
      assert.equal(result.totalPillars, 5);
      assert.equal(result.pillars.length, 5);
    });

    it('pillar IDs are ENR-P1 through ENR-P5', () => {
      const result = getEngineeringPillars();
      const ids = result.pillars.map(p => p.id);
      assert.deepEqual(ids, ['ENR-P1', 'ENR-P2', 'ENR-P3', 'ENR-P4', 'ENR-P5']);
    });

    it('every pillar has enrSource and enrInsight', () => {
      const result = getEngineeringPillars();
      for (const p of result.pillars) {
        assert.ok(p.enrSource, `${p.id} missing enrSource`);
        assert.ok(p.enrInsight, `${p.id} missing enrInsight`);
      }
    });

    it('every pillar has coastalKeyImplementation with components', () => {
      const result = getEngineeringPillars();
      for (const p of result.pillars) {
        assert.ok(p.coastalKeyImplementation, `${p.id} missing implementation`);
        assert.ok(p.coastalKeyImplementation.components.length >= 5, `${p.id} < 5 components`);
      }
    });
  });

  describe('getEngineeringPillar()', () => {
    it('returns AI Predictive Intelligence for ENR-P1', () => {
      const p = getEngineeringPillar('ENR-P1');
      assert.ok(p);
      assert.equal(p.pillar, 'AI-Powered Predictive Intelligence');
    });

    it('returns IoT/Digital Twins for ENR-P2', () => {
      const p = getEngineeringPillar('ENR-P2');
      assert.ok(p);
      assert.ok(p.pillar.includes('IoT'));
    });

    it('returns Data Automation for ENR-P3', () => {
      const p = getEngineeringPillar('ENR-P3');
      assert.ok(p);
      assert.ok(p.pillar.includes('Data Automation'));
    });

    it('returns Robotics/Automation for ENR-P4', () => {
      const p = getEngineeringPillar('ENR-P4');
      assert.ok(p);
      assert.ok(p.pillar.includes('Robotics'));
    });

    it('returns Compliance for ENR-P5', () => {
      const p = getEngineeringPillar('ENR-P5');
      assert.ok(p);
      assert.ok(p.pillar.includes('Compliance'));
    });

    it('returns null for invalid pillar', () => {
      assert.equal(getEngineeringPillar('ENR-P99'), null);
    });
  });

  describe('getOrchestratorIntegration()', () => {
    it('returns 5 orchestrator flows (one per pillar)', () => {
      const orch = getOrchestratorIntegration();
      assert.equal(orch.totalFlows, 5);
      assert.equal(orch.flows.length, 5);
    });

    it('every flow has pillar, event, and route', () => {
      const orch = getOrchestratorIntegration();
      for (const f of orch.flows) {
        assert.ok(f.pillar, 'Missing pillar');
        assert.ok(f.orchestratorEvent, 'Missing event');
        assert.ok(f.route, 'Missing route');
      }
    });

    it('mission alignment references Mission and GOAL-02', () => {
      const orch = getOrchestratorIntegration();
      assert.ok(orch.missionAlignment.includes('Mission'));
      assert.ok(orch.missionAlignment.includes('GOAL-02'));
    });
  });

  describe('getIndustryPositioning()', () => {
    it('returns positioning with 7 standards applied', () => {
      const pos = getIndustryPositioning();
      const standards = Object.keys(pos.standardsApplied);
      assert.equal(standards.length, 7);
      assert.ok(pos.standardsApplied.siemens);
      assert.ok(pos.standardsApplied.iqvia);
      assert.ok(pos.standardsApplied.uipath);
      assert.ok(pos.standardsApplied.lvmh);
      assert.ok(pos.standardsApplied.ferrari);
      assert.ok(pos.standardsApplied.redbull);
      assert.ok(pos.standardsApplied.spacex);
    });

    it('includes industry tags', () => {
      const pos = getIndustryPositioning();
      assert.ok(pos.industryTags.includes('Home Watch'));
      assert.ok(pos.industryTags.includes('Property Management'));
      assert.ok(pos.industryTags.includes('PropTech'));
    });
  });

  describe('getImplementationStatus()', () => {
    it('returns 25 total components', () => {
      const status = getImplementationStatus();
      assert.equal(status.totalComponents, 25);
    });

    it('deployed + deploying + planned = total', () => {
      const status = getImplementationStatus();
      assert.equal(status.deployed + status.deploying + status.planned, status.totalComponents);
    });

    it('majority of components are deployed', () => {
      const status = getImplementationStatus();
      assert.ok(status.deployed >= 13, `Only ${status.deployed} deployed`);
    });

    it('byPillar has 5 entries', () => {
      const status = getImplementationStatus();
      assert.equal(status.byPillar.length, 5);
    });
  });
});

// ── Route Handlers ──
import {
  handleEngineeringFramework, handleEngineeringPillars, handleEngineeringPillar,
  handleOrchestratorIntegration, handleIndustryPositioning, handleImplementationStatus,
} from '../routes/engineering-advancements.js';

describe('Engineering Advancements Routes', () => {
  it('GET /v1/engineering/framework returns 200', async () => {
    const res = handleEngineeringFramework();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalPillars, 5);
    assert.equal(body.status, 'operational');
  });

  it('GET /v1/engineering/pillars returns all pillars', async () => {
    const res = handleEngineeringPillars();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalPillars, 5);
  });

  it('GET /v1/engineering/pillars/ENR-P1 returns pillar', async () => {
    const res = handleEngineeringPillar('ENR-P1');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.pillar.pillar, 'AI-Powered Predictive Intelligence');
  });

  it('GET /v1/engineering/pillars/ENR-P99 returns 404', async () => {
    const res = handleEngineeringPillar('ENR-P99');
    assert.equal(res.status, 404);
  });

  it('GET /v1/engineering/orchestrator returns integration map', async () => {
    const res = handleOrchestratorIntegration();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalFlows, 5);
  });

  it('GET /v1/engineering/positioning returns industry positioning', async () => {
    const res = handleIndustryPositioning();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(Object.keys(body.standardsApplied).length, 7);
  });

  it('GET /v1/engineering/status returns implementation status', async () => {
    const res = handleImplementationStatus();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalComponents, 25);
  });
});
