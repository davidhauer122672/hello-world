import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Capital Engine Service ──
import {
  getCapitalEngine, getCapitalPillar, getDRIPMatrix,
  getBusinessModel, getCapitalMetrics,
} from '../services/capital-engine.js';

describe('Capital Engine Service', () => {
  describe('getCapitalEngine()', () => {
    it('returns all 3 revenue pillars', () => {
      const engine = getCapitalEngine();
      assert.equal(engine.totalPillars, 3);
      assert.equal(engine.pillars.length, 3);
      assert.equal(engine.status, 'operational');
    });

    it('includes business model and DRIP matrix', () => {
      const engine = getCapitalEngine();
      assert.ok(engine.businessModel);
      assert.ok(engine.dripMatrix);
      assert.ok(engine.businessModel.foundation);
      assert.ok(engine.businessModel.operations);
      assert.ok(engine.businessModel.marketing);
      assert.ok(engine.businessModel.leadership);
    });

    it('includes revenue range', () => {
      const engine = getCapitalEngine();
      assert.ok(engine.revenueRange.minimum);
      assert.ok(engine.revenueRange.maximum);
    });

    it('pillar IDs are CE-P1, CE-P2, CE-P3', () => {
      const engine = getCapitalEngine();
      const ids = engine.pillars.map(p => p.id);
      assert.deepEqual(ids, ['CE-P1', 'CE-P2', 'CE-P3']);
    });
  });

  describe('getCapitalPillar()', () => {
    it('returns Productized Retainers for CE-P1', () => {
      const p = getCapitalPillar('CE-P1');
      assert.ok(p);
      assert.equal(p.name, 'Productized Retainers');
      assert.equal(p.codename, 'Boring Niches');
      assert.equal(p.priceRange.min, 2500);
      assert.equal(p.priceRange.max, 5000);
      assert.equal(p.priceRange.period, 'month');
    });

    it('returns Enterprise AIOS for CE-P2', () => {
      const p = getCapitalPillar('CE-P2');
      assert.ok(p);
      assert.equal(p.name, 'Enterprise AIOS Implementation');
      assert.equal(p.priceRange.min, 50000);
      assert.equal(p.guaranteedOutcome, '40% reduction in operational overhead');
    });

    it('returns IP Licensing for CE-P3', () => {
      const p = getCapitalPillar('CE-P3');
      assert.ok(p);
      assert.equal(p.name, 'Proprietary IP Licensing');
      assert.equal(p.margin, '90-95%');
    });

    it('returns null for invalid pillar', () => {
      assert.equal(getCapitalPillar('CE-P4'), null);
      assert.equal(getCapitalPillar('invalid'), null);
    });

    it('every pillar has required fields', () => {
      for (const id of ['CE-P1', 'CE-P2', 'CE-P3']) {
        const p = getCapitalPillar(id);
        assert.ok(p.id, `${id} missing id`);
        assert.ok(p.name, `${id} missing name`);
        assert.ok(p.description, `${id} missing description`);
        assert.ok(p.priceRange, `${id} missing priceRange`);
        assert.ok(p.targetMarket, `${id} missing targetMarket`);
        assert.ok(p.deliverables.length > 0, `${id} missing deliverables`);
        assert.ok(p.margin, `${id} missing margin`);
        assert.ok(p.scalingModel, `${id} missing scalingModel`);
      }
    });
  });

  describe('getDRIPMatrix()', () => {
    it('returns all 4 quadrants', () => {
      const drip = getDRIPMatrix();
      assert.equal(drip.quadrants.length, 4);
      const ids = drip.quadrants.map(q => q.id);
      assert.deepEqual(ids, ['D', 'R', 'I', 'P']);
    });

    it('CEO quadrant is Produce', () => {
      const drip = getDRIPMatrix();
      assert.equal(drip.ceoQuadrant, 'Produce');
    });

    it('includes Replacement Ladder with verified steps', () => {
      const drip = getDRIPMatrix();
      assert.ok(drip.replacementLadder);
      assert.deepEqual(
        drip.replacementLadder.steps,
        ['Admin', 'Delivery', 'Marketing', 'Sales', 'Leadership'],
      );
    });

    it('each quadrant has agent assignment', () => {
      const drip = getDRIPMatrix();
      for (const q of drip.quadrants) {
        assert.ok(q.agentAssignment, `Quadrant ${q.id} missing agentAssignment`);
      }
    });

    it('automation coverage is defined for all quadrants', () => {
      const drip = getDRIPMatrix();
      assert.ok(drip.automationCoverage.delegate);
      assert.ok(drip.automationCoverage.replace);
      assert.ok(drip.automationCoverage.invest);
      assert.ok(drip.automationCoverage.produce);
    });
  });

  describe('getBusinessModel()', () => {
    it('returns all 4 model pillars', () => {
      const model = getBusinessModel();
      assert.ok(model.foundation);
      assert.ok(model.operations);
      assert.ok(model.marketing);
      assert.ok(model.leadership);
    });

    it('positioning is Enterprise AIOS', () => {
      const model = getBusinessModel();
      assert.ok(model.positioning.includes('Enterprise AI Operating System'));
    });

    it('includes competitive advantages', () => {
      const model = getBusinessModel();
      assert.ok(model.competitiveAdvantage.length >= 5);
      assert.ok(model.competitiveAdvantage.some(a => a.includes('404')));
    });

    it('each pillar has source attribution', () => {
      const model = getBusinessModel();
      assert.ok(model.foundation.source);
      assert.ok(model.operations.source);
      assert.ok(model.marketing.source);
      assert.ok(model.leadership.source);
    });
  });

  describe('getCapitalMetrics()', () => {
    it('returns projections for 3, 6, and 12 months', () => {
      const metrics = getCapitalMetrics();
      assert.ok(metrics.projections.month3);
      assert.ok(metrics.projections.month6);
      assert.ok(metrics.projections.month12);
    });

    it('month-12 MRR is highest', () => {
      const metrics = getCapitalMetrics();
      const m3 = parseInt(metrics.projections.month3.projectedMRR.replace(/[$,]/g, ''));
      const m12 = parseInt(metrics.projections.month12.projectedMRR.replace(/[$,]/g, ''));
      assert.ok(m12 > m3);
    });

    it('projections include disclaimer', () => {
      const metrics = getCapitalMetrics();
      assert.ok(metrics.note.includes('Not guaranteed'));
    });

    it('returns all 3 pillars in summary', () => {
      const metrics = getCapitalMetrics();
      assert.equal(metrics.pillars.length, 3);
    });
  });
});

// ── Capital Engine Route Handlers ──
import {
  handleCapitalEngine, handleCapitalPillar, handleDRIPMatrix,
  handleBusinessModel, handleCapitalMetrics,
} from '../routes/capital-engine.js';

describe('Capital Engine Routes', () => {
  it('GET /v1/capital/engine returns full engine', async () => {
    const res = handleCapitalEngine();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalPillars, 3);
    assert.equal(body.status, 'operational');
  });

  it('GET /v1/capital/pillars/CE-P1 returns Productized Retainers', async () => {
    const res = handleCapitalPillar('CE-P1');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.pillar.name, 'Productized Retainers');
  });

  it('GET /v1/capital/pillars/CE-P2 returns Enterprise AIOS', async () => {
    const res = handleCapitalPillar('CE-P2');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.pillar.name, 'Enterprise AIOS Implementation');
  });

  it('GET /v1/capital/pillars/CE-P3 returns IP Licensing', async () => {
    const res = handleCapitalPillar('CE-P3');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.pillar.name, 'Proprietary IP Licensing');
  });

  it('GET /v1/capital/pillars/CE-P4 returns 404', async () => {
    const res = handleCapitalPillar('CE-P4');
    assert.equal(res.status, 404);
  });

  it('GET /v1/capital/drip-matrix returns DRIP framework', async () => {
    const res = handleDRIPMatrix();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.quadrants.length, 4);
    assert.equal(body.ceoQuadrant, 'Produce');
  });

  it('GET /v1/capital/business-model returns model', async () => {
    const res = handleBusinessModel();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.positioning);
    assert.ok(body.competitiveAdvantage);
  });

  it('GET /v1/capital/metrics returns projections', async () => {
    const res = handleCapitalMetrics();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.projections);
    assert.ok(body.pillars);
  });
});
