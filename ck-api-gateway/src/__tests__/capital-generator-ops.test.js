import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getCapitalGeneratorOps, getCampaigns, getCampaign,
  getLeadPipeline, getOrchestrator, getRevenueProjections,
  getCampaignDashboard,
} from '../services/capital-generator-ops.js';

describe('Capital Generator Ops Service', () => {
  describe('getCapitalGeneratorOps()', () => {
    it('returns operational overview', () => {
      const ops = getCapitalGeneratorOps();
      assert.equal(ops.id, 'CK-CAPGEN-OPS');
      assert.equal(ops.status, 'operational');
      assert.equal(ops.campaigns, 5);
      assert.equal(ops.pipelineStages, 8);
    });

    it('includes both owners', () => {
      const ops = getCapitalGeneratorOps();
      assert.equal(ops.owners.length, 2);
      assert.ok(ops.owners.some(o => o.name === 'David Hauer'));
      assert.ok(ops.owners.some(o => o.name === 'Tracy Hunter'));
    });

    it('entity is Coastal Key Property Management LLC', () => {
      const ops = getCapitalGeneratorOps();
      assert.equal(ops.entity, 'Coastal Key Property Management LLC');
    });

    it('industry includes Home Watch and Property Management', () => {
      const ops = getCapitalGeneratorOps();
      assert.ok(ops.industry.includes('Home Watch'));
      assert.ok(ops.industry.includes('Property Management'));
    });
  });

  describe('getCampaigns()', () => {
    it('returns all 5 campaigns', () => {
      const result = getCampaigns();
      assert.equal(result.totalCampaigns, 5);
      assert.equal(result.campaigns.length, 5);
    });

    it('has 2 active and 3 planned campaigns', () => {
      const result = getCampaigns();
      assert.equal(result.active, 2);
      assert.equal(result.planned, 3);
    });

    it('every campaign has required fields', () => {
      const result = getCampaigns();
      for (const c of result.campaigns) {
        assert.ok(c.id, 'Missing id');
        assert.ok(c.name, 'Missing name');
        assert.ok(c.channel, 'Missing channel');
        assert.ok(c.status, 'Missing status');
        assert.ok(c.conversionTarget, `${c.id} missing conversionTarget`);
        assert.ok(c.leadRouting, `${c.id} missing leadRouting`);
      }
    });

    it('phone campaign is TCPA compliant', () => {
      const result = getCampaigns();
      const phone = result.campaigns.find(c => c.id === 'CAMP-01');
      assert.ok(phone.compliance.includes('TCPA'));
    });
  });

  describe('getCampaign()', () => {
    it('returns CAMP-01 by ID', () => {
      const c = getCampaign('CAMP-01');
      assert.ok(c);
      assert.equal(c.name, 'Seasonal Owner Direct Outreach');
    });

    it('returns null for invalid campaign', () => {
      assert.equal(getCampaign('CAMP-99'), null);
    });
  });

  describe('getLeadPipeline()', () => {
    it('returns 8 pipeline stages', () => {
      const pipeline = getLeadPipeline();
      assert.equal(pipeline.totalStages, 8);
      assert.equal(pipeline.stages.length, 8);
    });

    it('every stage has sla and owner', () => {
      const pipeline = getLeadPipeline();
      for (const s of pipeline.stages) {
        assert.ok(s.sla, `${s.id} missing sla`);
        assert.ok(s.owner, `${s.id} missing owner`);
      }
    });

    it('includes Slack and email notification config', () => {
      const pipeline = getLeadPipeline();
      assert.ok(pipeline.slackNotifications.newLead);
      assert.ok(pipeline.slackNotifications.closedWon);
      assert.ok(pipeline.emailNotifications.newLead);
    });

    it('Airtable sync configured', () => {
      const pipeline = getLeadPipeline();
      assert.equal(pipeline.airtableSync.table, 'Leads');
      assert.ok(pipeline.airtableSync.fields.length > 0);
    });
  });

  describe('getOrchestrator()', () => {
    it('returns Master Orchestrator with routing rules', () => {
      const orch = getOrchestrator();
      assert.equal(orch.id, 'CK-MASTER-ORCH');
      assert.ok(orch.totalRoutes >= 8);
      assert.ok(orch.escalationLevels >= 4);
    });

    it('includes contact methods for both owners', () => {
      const orch = getOrchestrator();
      assert.ok(orch.contactMethods.david);
      assert.ok(orch.contactMethods.tracy);
    });

    it('escalation matrix has 4 levels', () => {
      const orch = getOrchestrator();
      assert.equal(orch.escalationMatrix.length, 4);
      assert.equal(orch.escalationMatrix[0].handler, 'AI Fleet');
      assert.equal(orch.escalationMatrix[3].handler, 'Both Owners');
    });
  });

  describe('getRevenueProjections()', () => {
    it('returns projections for months 1, 3, 6, 12', () => {
      const rev = getRevenueProjections();
      assert.ok(rev.projections.month1);
      assert.ok(rev.projections.month3);
      assert.ok(rev.projections.month6);
      assert.ok(rev.projections.month12);
    });

    it('month 12 exceeds $50K MRR goal', () => {
      const rev = getRevenueProjections();
      const m12 = parseInt(rev.projections.month12.mrr.replace(/[$,]/g, ''));
      assert.ok(m12 >= 50000);
    });

    it('goal alignment shows both goals on track', () => {
      const rev = getRevenueProjections();
      assert.equal(rev.goalAlignment['GOAL-01'].onTrack, true);
      assert.equal(rev.goalAlignment['GOAL-02'].onTrack, true);
    });
  });

  describe('getCampaignDashboard()', () => {
    it('returns combined dashboard with all systems', () => {
      const dash = getCampaignDashboard();
      assert.equal(dash.status, 'operational');
      assert.equal(dash.campaigns.length, 5);
      assert.equal(dash.pipeline.length, 8);
      assert.ok(dash.orchestrator);
      assert.ok(dash.revenue);
    });
  });
});

// ── Route Handlers ──
import {
  handleCapGenOverview, handleCapGenCampaigns, handleCapGenCampaign,
  handleCapGenPipeline, handleCapGenOrchestrator, handleCapGenRevenue,
  handleCapGenDashboard,
} from '../routes/capital-generator-ops.js';

describe('Capital Generator Ops Routes', () => {
  it('GET /v1/capgen/overview returns 200', async () => {
    const res = handleCapGenOverview();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'operational');
    assert.equal(body.campaigns, 5);
  });

  it('GET /v1/capgen/campaigns returns all campaigns', async () => {
    const res = handleCapGenCampaigns();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalCampaigns, 5);
  });

  it('GET /v1/capgen/campaigns/CAMP-01 returns campaign', async () => {
    const res = handleCapGenCampaign('CAMP-01');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.campaign.name, 'Seasonal Owner Direct Outreach');
  });

  it('GET /v1/capgen/campaigns/CAMP-99 returns 404', async () => {
    const res = handleCapGenCampaign('CAMP-99');
    assert.equal(res.status, 404);
  });

  it('GET /v1/capgen/pipeline returns pipeline', async () => {
    const res = handleCapGenPipeline();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalStages, 8);
  });

  it('GET /v1/capgen/orchestrator returns routing', async () => {
    const res = handleCapGenOrchestrator();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.totalRoutes >= 8);
  });

  it('GET /v1/capgen/revenue returns projections', async () => {
    const res = handleCapGenRevenue();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.projections.month12);
  });

  it('GET /v1/capgen/dashboard returns combined view', async () => {
    const res = handleCapGenDashboard();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.campaigns.length, 5);
    assert.equal(body.pipeline.length, 8);
  });
});
