import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── AI Backend Tier Service ──
import {
  getServiceTiers, getServiceTier, getAIReportTemplates,
  getCostStructure, getAIBackendMetrics,
} from '../services/ai-backend-tier.js';

describe('AI Backend Tier Service', () => {
  describe('getServiceTiers()', () => {
    it('returns all 4 tiers', () => {
      const result = getServiceTiers();
      assert.equal(result.totalTiers, 4);
      assert.equal(result.tiers.length, 4);
    });

    it('entry point is $3.99/month', () => {
      const result = getServiceTiers();
      assert.equal(result.entryPoint, '$3.99/month');
    });

    it('conversion funnel is defined', () => {
      const result = getServiceTiers();
      assert.ok(result.conversionFunnel.includes('$3.99'));
    });

    it('tier IDs are correct', () => {
      const result = getServiceTiers();
      const ids = result.tiers.map(t => t.id);
      assert.deepEqual(ids, ['TIER-FREE', 'TIER-AI-399', 'TIER-MONITOR-2999', 'TIER-MANAGED-199']);
    });

    it('every tier has required fields', () => {
      const result = getServiceTiers();
      for (const t of result.tiers) {
        assert.ok(t.id, 'Missing id');
        assert.ok(t.name, 'Missing name');
        assert.ok(t.price, 'Missing price');
        assert.ok(t.features.length > 0, `${t.id} missing features`);
        assert.ok(t.purpose, `${t.id} missing purpose`);
      }
    });
  });

  describe('getServiceTier()', () => {
    it('returns Free tier', () => {
      const t = getServiceTier('TIER-FREE');
      assert.ok(t);
      assert.equal(t.name, 'Coastal Key Free');
      assert.equal(t.price, '$0/month');
    });

    it('returns AI-399 tier with $3.99 price', () => {
      const t = getServiceTier('TIER-AI-399');
      assert.ok(t);
      assert.equal(t.name, 'Coastal Key AI Assistant');
      assert.equal(t.price, '$3.99/month');
      assert.ok(t.features.length >= 8);
    });

    it('returns Monitor tier', () => {
      const t = getServiceTier('TIER-MONITOR-2999');
      assert.ok(t);
      assert.equal(t.price, '$29.99/month');
    });

    it('returns Managed tier', () => {
      const t = getServiceTier('TIER-MANAGED-199');
      assert.ok(t);
      assert.ok(t.price.includes('$199'));
    });

    it('returns null for invalid tier', () => {
      assert.equal(getServiceTier('TIER-INVALID'), null);
      assert.equal(getServiceTier('invalid'), null);
    });
  });

  describe('getAIReportTemplates()', () => {
    it('returns all 5 report templates', () => {
      const result = getAIReportTemplates();
      assert.equal(result.totalTemplates, 5);
      assert.equal(result.templates.length, 5);
    });

    it('every template has required fields', () => {
      const result = getAIReportTemplates();
      for (const t of result.templates) {
        assert.ok(t.id, 'Missing id');
        assert.ok(t.name, 'Missing name');
        assert.ok(t.frequency, 'Missing frequency');
        assert.ok(t.sections.length > 0, `${t.id} missing sections`);
        assert.ok(t.aiModel, `${t.id} missing aiModel`);
        assert.ok(t.costPerReport, `${t.id} missing costPerReport`);
      }
    });

    it('margin at $3.99 is over 90%', () => {
      const result = getAIReportTemplates();
      assert.ok(result.marginAt399.includes('92') || result.marginAt399.includes('96'));
    });
  });

  describe('getCostStructure()', () => {
    it('returns infrastructure cost breakdown', () => {
      const cost = getCostStructure();
      assert.ok(cost.priceToOwner);
      assert.equal(cost.priceToOwner.amount, 3.99);
      assert.ok(cost.costToDeliver);
      assert.ok(cost.integrations.length > 0);
    });

    it('includes scaling costs', () => {
      const cost = getCostStructure();
      assert.ok(cost.totalMonthlyInfra.at50Subscribers);
      assert.ok(cost.totalMonthlyInfra.at500Subscribers);
      assert.ok(cost.totalMonthlyInfra.at5000Subscribers);
    });

    it('breakeven is 4 subscribers', () => {
      const cost = getCostStructure();
      assert.ok(cost.breakeven.includes('4 subscribers'));
    });
  });

  describe('getAIBackendMetrics()', () => {
    it('returns projections for 3, 6, and 12 months', () => {
      const metrics = getAIBackendMetrics();
      assert.ok(metrics.projections.month3);
      assert.ok(metrics.projections.month6);
      assert.ok(metrics.projections.month12);
    });

    it('returns unit economics', () => {
      const metrics = getAIBackendMetrics();
      assert.ok(metrics.unitEconomics.aiTierLTV);
      assert.ok(metrics.unitEconomics.blendedCAC);
      assert.ok(metrics.unitEconomics.ltcRatio);
    });

    it('includes all 5 report templates count', () => {
      const metrics = getAIBackendMetrics();
      assert.equal(metrics.reportTemplates, 5);
    });
  });
});

// ── AI Backend Tier Route Handlers ──
import {
  handleAITierPlans, handleAITierPlan, handleAITierReports,
  handleAITierCostStructure, handleAITierMetrics,
} from '../routes/ai-backend-tier.js';

describe('AI Backend Tier Routes', () => {
  it('GET /v1/ai-tier/plans returns all tiers', async () => {
    const res = handleAITierPlans();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalTiers, 4);
  });

  it('GET /v1/ai-tier/plans/TIER-AI-399 returns $3.99 tier', async () => {
    const res = handleAITierPlan('TIER-AI-399');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.tier.price, '$3.99/month');
  });

  it('GET /v1/ai-tier/plans/TIER-INVALID returns 404', async () => {
    const res = handleAITierPlan('TIER-INVALID');
    assert.equal(res.status, 404);
  });

  it('GET /v1/ai-tier/reports returns templates', async () => {
    const res = handleAITierReports();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalTemplates, 5);
  });

  it('GET /v1/ai-tier/cost-structure returns costs', async () => {
    const res = handleAITierCostStructure();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.priceToOwner.amount, 3.99);
  });

  it('GET /v1/ai-tier/metrics returns projections', async () => {
    const res = handleAITierMetrics();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.projections);
    assert.ok(body.unitEconomics);
  });
});
