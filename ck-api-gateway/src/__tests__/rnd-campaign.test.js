import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Campaign Plan Service ──
import {
  getCampaignPlan, getCampaignDay, getCampaignStatus,
  getCompetitorMatrix, getUnincorporatedSystems,
} from '../services/campaign-plan.js';

describe('R&D Campaign Plan Service', () => {
  describe('getCampaignPlan()', () => {
    it('returns complete 7-day plan structure', () => {
      const plan = getCampaignPlan();
      assert.equal(plan.id, 'CK-CAMPAIGN-7DAY-2026Q2');
      assert.equal(plan.title, 'Coastal Key Enterprise 7-Day R&D Campaign');
      assert.equal(plan.totalDays, 7);
      assert.equal(plan.totalPhases, 4);
      assert.ok(Array.isArray(plan.dailyPlan));
      assert.equal(plan.dailyPlan.length, 7);
    });

    it('includes all required top-level keys', () => {
      const plan = getCampaignPlan();
      const requiredKeys = [
        'id', 'title', 'startDate', 'endDate', 'status', 'version',
        'dailyPlan', 'unincorporatedSystems', 'competitorMatrix',
        'expectedOutcomes', 'communicationsProtocol', 'divisionsEngaged',
      ];
      for (const key of requiredKeys) {
        assert.ok(key in plan, `Missing key: ${key}`);
      }
    });

    it('engages all 5 required divisions', () => {
      const plan = getCampaignPlan();
      const expected = ['CEO', 'TEC', 'MKT', 'OPS', 'SMA'];
      for (const div of expected) {
        assert.ok(plan.divisionsEngaged.includes(div), `Missing division: ${div}`);
      }
    });
  });

  describe('getCampaignDay()', () => {
    it('returns day 1 with correct phase', () => {
      const day = getCampaignDay(1);
      assert.ok(day);
      assert.equal(day.day.day, 1);
      assert.equal(day.day.phase, 'Strategic Alignment & Infrastructure Audit');
      assert.equal(day.progress, 'Day 1 of 7');
      assert.equal(day.percentComplete, 14);
    });

    it('returns day 7 with 100% progress', () => {
      const day = getCampaignDay(7);
      assert.ok(day);
      assert.equal(day.day.day, 7);
      assert.equal(day.day.phase, 'Integration Review & Capital Engine Assessment');
      assert.equal(day.percentComplete, 100);
    });

    it('returns null for invalid day', () => {
      assert.equal(getCampaignDay(0), null);
      assert.equal(getCampaignDay(8), null);
      assert.equal(getCampaignDay(99), null);
    });

    it('each day has at least 3 tasks', () => {
      for (let d = 1; d <= 7; d++) {
        const day = getCampaignDay(d);
        assert.ok(day.day.tasks.length >= 3, `Day ${d} has fewer than 3 tasks`);
      }
    });

    it('every task has division and action', () => {
      for (let d = 1; d <= 7; d++) {
        const day = getCampaignDay(d);
        for (const task of day.day.tasks) {
          assert.ok(task.division, `Day ${d} task missing division`);
          assert.ok(task.action, `Day ${d} task missing action`);
        }
      }
    });
  });

  describe('getCampaignStatus()', () => {
    it('returns structured status object', () => {
      const status = getCampaignStatus();
      assert.ok(status.campaignId);
      assert.ok(['active', 'scheduled', 'completed'].includes(status.status));
      assert.equal(status.outcomesTracked, 5);
      assert.equal(status.systemsToIntegrate, 8);
      assert.equal(status.competitorsAnalyzed, 7);
    });
  });

  describe('getCompetitorMatrix()', () => {
    it('returns all 7 competitors', () => {
      const matrix = getCompetitorMatrix();
      assert.equal(matrix.totalAnalyzed, 7);
      assert.equal(matrix.competitors.length, 7);
    });

    it('all subscriber counts are verified', () => {
      const matrix = getCompetitorMatrix();
      for (const comp of matrix.competitors) {
        assert.equal(comp.subscribersVerified, true, `${comp.influencer} subs not verified`);
      }
    });

    it('includes relevance breakdown', () => {
      const matrix = getCompetitorMatrix();
      assert.equal(matrix.byRelevance.critical, 1);
      assert.equal(matrix.byRelevance.high, 3);
      assert.equal(matrix.byRelevance.medium, 2);
      assert.equal(matrix.byRelevance.low, 1);
    });

    it('Ben AI is the only critical-relevance competitor', () => {
      const matrix = getCompetitorMatrix();
      const critical = matrix.competitors.filter(c => c.relevance === 'critical');
      assert.equal(critical.length, 1);
      assert.equal(critical[0].influencer, 'Ben AI');
    });

    it('corrections array present where claims were flagged', () => {
      const matrix = getCompetitorMatrix();
      const ottley = matrix.competitors.find(c => c.influencer === 'Liam Ottley');
      assert.ok(ottley.corrections);
      assert.ok(ottley.corrections.length >= 3);
    });
  });

  describe('getUnincorporatedSystems()', () => {
    it('returns all 8 systems', () => {
      const systems = getUnincorporatedSystems();
      assert.equal(systems.total, 8);
      assert.equal(systems.systems.length, 8);
    });

    it('systems have unique IDs', () => {
      const systems = getUnincorporatedSystems();
      const ids = systems.systems.map(s => s.id);
      assert.equal(new Set(ids).size, ids.length);
    });

    it('priority breakdown is correct', () => {
      const systems = getUnincorporatedSystems();
      assert.equal(systems.byPriority.critical, 2);
      assert.equal(systems.byPriority.high, 4);
      assert.equal(systems.byPriority.medium, 2);
    });

    it('each system has required fields', () => {
      const systems = getUnincorporatedSystems();
      for (const sys of systems.systems) {
        assert.ok(sys.id, 'Missing id');
        assert.ok(sys.name, 'Missing name');
        assert.ok(sys.priority, 'Missing priority');
        assert.ok(sys.description, 'Missing description');
        assert.ok(sys.source, 'Missing source');
      }
    });
  });
});

// ── Campaign Route Handlers ──
import {
  handleRndCampaignPlan, handleRndCampaignStatus,
  handleRndCampaignDay, handleRndCompetitors, handleRndSystems,
} from '../routes/rnd-campaign.js';

describe('R&D Campaign Routes', () => {
  it('GET /v1/rnd/campaign returns full plan', async () => {
    const res = handleRndCampaignPlan();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalDays, 7);
    assert.ok(body.dailyPlan);
    assert.ok(body.competitorMatrix);
  });

  it('GET /v1/rnd/campaign/status returns status', async () => {
    const res = handleRndCampaignStatus();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.campaignId);
    assert.equal(body.competitorsAnalyzed, 7);
  });

  it('GET /v1/rnd/campaign/day/1 returns day 1', async () => {
    const res = handleRndCampaignDay('1');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.day.day, 1);
  });

  it('GET /v1/rnd/campaign/day/7 returns day 7', async () => {
    const res = handleRndCampaignDay('7');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.day.day, 7);
    assert.equal(body.percentComplete, 100);
  });

  it('GET /v1/rnd/campaign/day/0 returns 400', async () => {
    const res = handleRndCampaignDay('0');
    assert.equal(res.status, 400);
  });

  it('GET /v1/rnd/campaign/day/8 returns 400', async () => {
    const res = handleRndCampaignDay('8');
    assert.equal(res.status, 400);
  });

  it('GET /v1/rnd/campaign/day/abc returns 400', async () => {
    const res = handleRndCampaignDay('abc');
    assert.equal(res.status, 400);
  });

  it('GET /v1/rnd/campaign/competitors returns matrix', async () => {
    const res = handleRndCompetitors();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalAnalyzed, 7);
    assert.ok(body.byRelevance);
  });

  it('GET /v1/rnd/campaign/systems returns systems', async () => {
    const res = handleRndSystems();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.total, 8);
    assert.ok(body.byPriority);
  });
});
