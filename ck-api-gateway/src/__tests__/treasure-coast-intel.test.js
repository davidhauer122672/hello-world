import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Treasure Coast Intel Service ──
import {
  getMarketOverview, getCompetitors, getCompetitor,
  getAutomationGaps, getMarketMetrics,
} from '../services/treasure-coast-intel.js';

describe('Treasure Coast Intel Service', () => {
  describe('getMarketOverview()', () => {
    it('returns market overview with correct ID', () => {
      const overview = getMarketOverview();
      assert.equal(overview.id, 'CK-TC-INTEL');
      assert.equal(overview.status, 'operational');
      assert.equal(overview.competitorCount, 7);
      assert.equal(overview.automationGapCount, 7);
    });

    it('includes market data for all 3 counties', () => {
      const overview = getMarketOverview();
      assert.ok(overview.market.totalProperties.martin);
      assert.ok(overview.market.totalProperties.stLucie);
      assert.ok(overview.market.totalProperties.indianRiver);
    });

    it('total seasonal properties is 13,500', () => {
      const overview = getMarketOverview();
      assert.equal(overview.market.totalSeasonalProperties, 13500);
    });
  });

  describe('getCompetitors()', () => {
    it('returns all 7 competitors', () => {
      const result = getCompetitors();
      assert.equal(result.totalAnalyzed, 7);
      assert.equal(result.competitors.length, 7);
    });

    it('threat breakdown is correct', () => {
      const result = getCompetitors();
      assert.ok(result.byThreat);
      assert.equal(result.byThreat.high, 0);
      assert.equal(result.byThreat.medium, 4);
      assert.equal(result.byThreat.low, 3);
    });

    it('every competitor has required fields', () => {
      const result = getCompetitors();
      for (const c of result.competitors) {
        assert.ok(c.id, 'Missing id');
        assert.ok(c.name, 'Missing name');
        assert.ok(c.location, 'Missing location');
        assert.ok(c.techStack, 'Missing techStack');
        assert.ok(c.automationLevel, 'Missing automationLevel');
        assert.ok(c.strengths.length > 0, `${c.id} missing strengths`);
        assert.ok(c.weaknesses.length > 0, `${c.id} missing weaknesses`);
        assert.ok(typeof c.automationGap === 'number', `${c.id} missing automationGap`);
      }
    });
  });

  describe('getCompetitor()', () => {
    it('returns COMP-001 by ID', () => {
      const c = getCompetitor('COMP-001');
      assert.ok(c);
      assert.equal(c.name, 'Treasure Coast Property Management LLC');
    });

    it('returns null for invalid competitor', () => {
      assert.equal(getCompetitor('COMP-999'), null);
      assert.equal(getCompetitor('invalid'), null);
    });
  });

  describe('getAutomationGaps()', () => {
    it('returns all 7 gaps', () => {
      const result = getAutomationGaps();
      assert.equal(result.totalGaps, 7);
      assert.equal(result.gaps.length, 7);
    });

    it('most gaps have zero competitors addressing them', () => {
      const result = getAutomationGaps();
      assert.ok(result.zeroCompetitorGaps >= 5);
    });

    it('every gap has required fields', () => {
      const result = getAutomationGaps();
      for (const g of result.gaps) {
        assert.ok(g.id, 'Missing id');
        assert.ok(g.category, 'Missing category');
        assert.ok(g.description, 'Missing description');
        assert.ok(g.coastalKeyStatus, 'Missing coastalKeyStatus');
        assert.ok(g.marketOpportunity, 'Missing marketOpportunity');
      }
    });
  });

  describe('getMarketMetrics()', () => {
    it('returns TAM/SAM/SOM', () => {
      const metrics = getMarketMetrics();
      assert.ok(metrics.tam);
      assert.ok(metrics.sam);
      assert.ok(metrics.som);
    });

    it('SOM year1 target is 120 properties', () => {
      const metrics = getMarketMetrics();
      assert.equal(metrics.som.year1Target, 120);
    });

    it('includes penetration strategy', () => {
      const metrics = getMarketMetrics();
      assert.equal(metrics.penetrationStrategy.length, 3);
    });
  });
});

// ── Treasure Coast Intel Route Handlers ──
import {
  handleTCIntelOverview, handleTCIntelCompetitors, handleTCIntelCompetitor,
  handleTCIntelAutomationGaps, handleTCIntelMetrics,
} from '../routes/treasure-coast-intel.js';

describe('Treasure Coast Intel Routes', () => {
  it('GET /v1/tc-intel/overview returns 200', async () => {
    const res = handleTCIntelOverview();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.competitorCount, 7);
    assert.equal(body.status, 'operational');
  });

  it('GET /v1/tc-intel/competitors returns all competitors', async () => {
    const res = handleTCIntelCompetitors();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalAnalyzed, 7);
  });

  it('GET /v1/tc-intel/competitors/COMP-001 returns competitor', async () => {
    const res = handleTCIntelCompetitor('COMP-001');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.competitor.name, 'Treasure Coast Property Management LLC');
  });

  it('GET /v1/tc-intel/competitors/COMP-999 returns 404', async () => {
    const res = handleTCIntelCompetitor('COMP-999');
    assert.equal(res.status, 404);
  });

  it('GET /v1/tc-intel/automation-gaps returns gaps', async () => {
    const res = handleTCIntelAutomationGaps();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalGaps, 7);
  });

  it('GET /v1/tc-intel/metrics returns TAM/SAM/SOM', async () => {
    const res = handleTCIntelMetrics();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.tam);
    assert.ok(body.sam);
    assert.ok(body.som);
  });
});
