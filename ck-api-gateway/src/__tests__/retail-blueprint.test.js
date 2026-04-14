import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getRetailBlueprint, getRetailBrand, getRetailSKUStrategy, getRetailFinancials, getRetailLayout, getRetailOmnichannel, getRetailLaunchPlan, getRetailAcquisition } from '../services/retail-blueprint.js';

describe('Retail Blueprint Service', () => {
  describe('getRetailBlueprint()', () => {
    it('returns overview with key metrics', () => {
      const bp = getRetailBlueprint();
      assert.equal(bp.id, 'CK-RETAIL-V1');
      assert.equal(bp.storeSize, '1,200 sq ft');
      assert.equal(bp.skuCount, 800);
      assert.equal(bp.storeZones, 7);
      assert.equal(bp.status, 'production-ready');
    });
  });

  describe('getRetailBrand()', () => {
    it('returns brand identity with voice, visuals, differentiator', () => {
      const brand = getRetailBrand();
      assert.ok(brand.positioning);
      assert.ok(brand.voice.tone);
      assert.ok(brand.visualIdentity.palette.length >= 4);
      assert.ok(brand.differentiator);
      assert.ok(brand.tagline);
    });
  });

  describe('getRetailSKUStrategy()', () => {
    it('returns mix strategy summing to 100%', () => {
      const sku = getRetailSKUStrategy();
      const total = sku.mixStrategy.core.percentage + sku.mixStrategy.trend.percentage + sku.mixStrategy.impulse.percentage;
      assert.equal(total, 100);
    });

    it('includes vendor strategy with margin targets', () => {
      const sku = getRetailSKUStrategy();
      assert.ok(sku.vendorStrategy.marginTargets.footwear);
      assert.ok(sku.vendorStrategy.marginTargets.apparel);
      assert.ok(sku.vendorStrategy.marginTargets.accessories);
    });
  });

  describe('getRetailFinancials()', () => {
    it('returns startup costs with total range', () => {
      const fin = getRetailFinancials();
      assert.ok(fin.startupCosts.totalRange);
      assert.ok(fin.startupCosts.inventory);
    });

    it('returns breakeven analysis', () => {
      const fin = getRetailFinancials();
      assert.ok(fin.breakEvenAnalysis.breakEvenRevenue);
      assert.ok(fin.breakEvenAnalysis.timeToBreakeven);
    });

    it('returns 4 time-period projections', () => {
      const fin = getRetailFinancials();
      assert.ok(fin.projections.month1);
      assert.ok(fin.projections.month3);
      assert.ok(fin.projections.month6);
      assert.ok(fin.projections.month12);
    });
  });

  describe('getRetailLayout()', () => {
    it('returns 7 zones totaling 1200 sq ft', () => {
      const layout = getRetailLayout();
      assert.equal(layout.zones.length, 7);
      assert.equal(layout.totalSqFt, 1200);
      const total = layout.zones.reduce((sum, z) => sum + z.sqFt, 0);
      assert.equal(total, 1200);
    });

    it('every zone has purpose and psychology', () => {
      const layout = getRetailLayout();
      for (const z of layout.zones) {
        assert.ok(z.purpose, `${z.zone} missing purpose`);
        assert.ok(z.psychology, `${z.zone} missing psychology`);
      }
    });
  });

  describe('getRetailOmnichannel()', () => {
    it('returns POS, ecommerce, social, loyalty', () => {
      const oc = getRetailOmnichannel();
      assert.ok(oc.pos);
      assert.ok(oc.ecommerce);
      assert.ok(oc.socialCommerce);
      assert.ok(oc.loyaltyProgram);
    });
  });

  describe('getRetailLaunchPlan()', () => {
    it('returns 4 launch phases', () => {
      const lp = getRetailLaunchPlan();
      assert.equal(lp.phases.length, 4);
    });
  });

  describe('getRetailAcquisition()', () => {
    it('returns channels with LTV:CAC ratio', () => {
      const acq = getRetailAcquisition();
      assert.ok(acq.channels.length >= 5);
      assert.ok(acq.ltvCacRatio);
    });
  });
});

import { handleRetailBlueprint, handleRetailBrand, handleRetailSKUStrategy, handleRetailFinancials, handleRetailLayout, handleRetailOmnichannel, handleRetailLaunchPlan, handleRetailAcquisition } from '../routes/retail-blueprint.js';

describe('Retail Blueprint Routes', () => {
  it('GET /v1/retail/blueprint returns 200', async () => {
    const res = handleRetailBlueprint();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.storeZones, 7);
  });

  it('GET /v1/retail/brand returns brand', async () => {
    const res = handleRetailBrand();
    assert.equal(res.status, 200);
  });

  it('GET /v1/retail/sku-strategy returns SKU strategy', async () => {
    const res = handleRetailSKUStrategy();
    assert.equal(res.status, 200);
  });

  it('GET /v1/retail/financials returns financials', async () => {
    const res = handleRetailFinancials();
    assert.equal(res.status, 200);
  });

  it('GET /v1/retail/layout returns store layout', async () => {
    const res = handleRetailLayout();
    assert.equal(res.status, 200);
  });

  it('GET /v1/retail/omnichannel returns integration', async () => {
    const res = handleRetailOmnichannel();
    assert.equal(res.status, 200);
  });

  it('GET /v1/retail/launch-plan returns launch phases', async () => {
    const res = handleRetailLaunchPlan();
    assert.equal(res.status, 200);
  });

  it('GET /v1/retail/acquisition returns customer engine', async () => {
    const res = handleRetailAcquisition();
    assert.equal(res.status, 200);
  });
});
