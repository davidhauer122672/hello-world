/**
 * Tests for new engine modules: Sales Acquisition, Token Maintenance,
 * Field Inspection, Eliza AI, Google Ads, CFO Revenue
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function makeURL(path) { return new URL('https://test.workers.dev' + path); }
async function body(res) { return JSON.parse(await res.text()); }

// ── Sales & Client Acquisition Engine ──────────────────────────────────────

describe('Sales Acquisition Engine', async () => {
  const { scoreLead, getSalesAcquisitionDashboard, PIPELINE_STAGES, ACQUISITION_CHANNELS } = await import('../engines/sales-acquisition.js');

  it('scores a hot investor lead correctly', () => {
    const result = scoreLead({ propertyValue: 1200000, segment: 'investor', source: 'referral', timeline: 'immediate', zone: 'vero_beach', multiProperty: true });
    assert.equal(result.grade, 'A');
    assert.equal(result.priority, 'HOT');
    assert.ok(result.totalScore >= 85);
    assert.ok(result.assignedAgent.includes('Investor Hawk'));
  });

  it('scores a cold exploring lead correctly', () => {
    const result = scoreLead({ propertyValue: 100000, segment: 'residential', source: 'cold_outbound', timeline: 'exploring', zone: 'unknown', multiProperty: false });
    assert.ok(result.totalScore < 55);
    assert.ok(['C', 'D', 'F'].includes(result.grade));
  });

  it('assigns luxury agent for luxury segment', () => {
    const result = scoreLead({ segment: 'luxury' });
    assert.ok(result.assignedAgent.includes('Luxury Liaison'));
  });

  it('defines 9 pipeline stages', () => {
    assert.equal(PIPELINE_STAGES.length, 9);
    assert.equal(PIPELINE_STAGES[0].id, 'new');
    assert.equal(PIPELINE_STAGES[6].id, 'closed_won');
  });

  it('defines 10 acquisition channels', () => {
    assert.equal(ACQUISITION_CHANNELS.length, 10);
    assert.ok(ACQUISITION_CHANNELS.find(c => c.id === 'google_ads'));
    assert.ok(ACQUISITION_CHANNELS.find(c => c.id === 'retell'));
  });

  it('generates dashboard with all sections', () => {
    const d = getSalesAcquisitionDashboard();
    assert.equal(d.engine, 'Sales & Client Acquisition Engine');
    assert.ok(d.pipeline);
    assert.ok(d.scoring);
    assert.ok(d.channels);
    assert.ok(d.playbooks);
    assert.ok(d.kpiTargets);
  });
});

describe('Sales Acquisition Routes', async () => {
  const { handleSalesDashboard, handleSalesPipeline, handleSalesChannels, handleSalesPlaybooks } = await import('../routes/sales-acquisition.js');

  it('GET /v1/sales/dashboard returns engine overview', async () => {
    const res = handleSalesDashboard();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.engine, 'Sales & Client Acquisition Engine');
  });

  it('GET /v1/sales/pipeline returns 9 stages', async () => {
    const res = handleSalesPipeline();
    const b = await body(res);
    assert.equal(b.count, 9);
  });

  it('GET /v1/sales/channels returns 10 channels', async () => {
    const res = handleSalesChannels();
    const b = await body(res);
    assert.equal(b.count, 10);
  });

  it('GET /v1/sales/playbooks returns SCAA-1, WF-3, WF-4', async () => {
    const res = handleSalesPlaybooks();
    const b = await body(res);
    assert.equal(b.count, 3);
    assert.ok(b.playbooks.scaa1);
    assert.ok(b.playbooks.wf3);
    assert.ok(b.playbooks.wf4);
  });
});

// ── Token Maintenance Agent ────────────────────────────────────────────────

describe('Token Maintenance Agent', async () => {
  const { CREDENTIAL_REGISTRY, getTokenAgentDashboard } = await import('../engines/token-maintenance.js');

  it('registers 13 credentials', () => {
    assert.equal(CREDENTIAL_REGISTRY.length, 13);
  });

  it('includes all critical credentials', () => {
    const names = CREDENTIAL_REGISTRY.map(c => c.name);
    assert.ok(names.includes('ANTHROPIC_API_KEY'));
    assert.ok(names.includes('AIRTABLE_API_KEY'));
    assert.ok(names.includes('CLOUDFLARE_API_TOKEN'));
    assert.ok(names.includes('SLACK_BOT_TOKEN'));
  });

  it('generates dashboard with empty env', () => {
    const d = getTokenAgentDashboard({});
    assert.equal(d.agent.id, 'TEC-026');
    assert.equal(d.agent.name, 'Token Sentinel');
    assert.equal(d.fleet.total, 13);
    assert.equal(d.fleet.configured, 0);
  });

  it('detects configured secrets in env', () => {
    const d = getTokenAgentDashboard({ ANTHROPIC_API_KEY: 'sk-test', AIRTABLE_API_KEY: 'pat-test' });
    assert.equal(d.fleet.configured, 2);
  });
});

describe('Token Maintenance Routes', async () => {
  const { handleTokenRegistry } = await import('../routes/token-maintenance.js');

  it('GET /v1/tokens/registry returns 13 credentials', async () => {
    const res = handleTokenRegistry();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.count, 13);
    assert.ok(b.rotationPolicy);
  });
});

// ── Field Inspection Engine ────────────────────────────────────────────────

describe('Field Inspection Engine', async () => {
  const { createInspection, completeInspection, getInspectionDashboard, INSPECTION_TYPES } = await import('../engines/field-inspection.js');

  it('defines 6 inspection types', () => {
    assert.equal(Object.keys(INSPECTION_TYPES).length, 6);
    assert.ok(INSPECTION_TYPES.homeWatch);
    assert.ok(INSPECTION_TYPES.hurricane);
  });

  it('creates a home watch inspection', () => {
    const insp = createInspection({ propertyAddress: '123 Ocean Dr, Vero Beach', type: 'homeWatch' });
    assert.ok(insp.inspectionId.startsWith('INSP-'));
    assert.equal(insp.type, 'homeWatch');
    assert.equal(insp.status, 'scheduled');
    assert.ok(insp.checklist.length > 0);
  });

  it('rejects unknown inspection type', () => {
    const result = createInspection({ propertyAddress: '123 Test', type: 'fake' });
    assert.ok(result.error);
  });

  it('completes an inspection with deficiencies', () => {
    const insp = createInspection({ propertyAddress: '456 Palm Ave', type: 'quarterly' });
    const completed = completeInspection(insp, {
      deficiencies: [{ area: 'roof', description: 'Missing shingles', severity: 'high', vendorRequired: true, estimatedCost: 500 }],
      overallCondition: 'fair',
    });
    assert.equal(completed.status, 'completed');
    assert.equal(completed.summary.deficiencyCount, 1);
    assert.equal(completed.summary.highCount, 1);
    assert.equal(completed.summary.estimatedRepairCost, 500);
  });

  it('generates dashboard with SOPs', () => {
    const d = getInspectionDashboard();
    assert.equal(d.status, 'OPERATIONAL');
    assert.ok(d.sops.homeWatch);
    assert.ok(d.integrations.airtable);
  });
});

// ── Eliza AI Engine ────────────────────────────────────────────────────────

describe('Eliza AI Engine', async () => {
  const { VOICE_CONFIG, AVATAR_CONFIG, RETELL_CONFIG, RETELL_CAMPAIGNS, getElizaDashboard, generateVideoBriefingRequest } = await import('../engines/eliza-ai.js');

  it('voice config is 482 characters', () => {
    assert.equal(VOICE_CONFIG.characterCount, 482);
    assert.ok(VOICE_CONFIG.voiceDescription.includes('baritone'));
  });

  it('retell config has system prompt', () => {
    assert.ok(RETELL_CONFIG.prompt.includes('Eliza'));
    assert.ok(RETELL_CONFIG.prompt.includes('SCAA-1'));
  });

  it('retell defines 3 campaigns', () => {
    assert.equal(Object.keys(RETELL_CAMPAIGNS.campaigns).length, 3);
  });

  it('generates dashboard with deployment sequence', () => {
    const d = getElizaDashboard();
    assert.equal(d.system, 'Eliza AI — Coastal Key Digital CEO Assistant');
    assert.ok(d.deploymentSequence.length >= 8);
    assert.ok(d.secretsRequired.length >= 6);
  });

  it('generates video briefing request', () => {
    const req = generateVideoBriefingRequest('Good morning, Treasure Coast.', { purpose: 'daily-standup' });
    assert.equal(req.type, 'video_briefing');
    assert.equal(req.content.text, 'Good morning, Treasure Coast.');
    assert.equal(req.metadata.purpose, 'daily-standup');
  });
});

// ── Google Ads Campaign ────────────────────────────────────────────────────

describe('Google Ads Campaign Engine', async () => {
  const { GOOGLE_ADS_CAMPAIGNS, ACTIVATION_CHECKLIST, getGoogleAdsDashboard } = await import('../engines/google-ads-campaign.js');

  it('defines 3 campaigns', () => {
    assert.equal(Object.keys(GOOGLE_ADS_CAMPAIGNS).length, 3);
    assert.ok(GOOGLE_ADS_CAMPAIGNS.homeWatch);
    assert.ok(GOOGLE_ADS_CAMPAIGNS.propertyManagement);
    assert.ok(GOOGLE_ADS_CAMPAIGNS.remarketing);
  });

  it('home watch campaign has Treasure Coast locations', () => {
    const hw = GOOGLE_ADS_CAMPAIGNS.homeWatch;
    assert.ok(hw.locations.find(l => l.name.includes('Vero Beach')));
    assert.ok(hw.locations.find(l => l.name.includes('Stuart')));
  });

  it('generates dashboard with budget totals', () => {
    const d = getGoogleAdsDashboard();
    assert.equal(d.totalMonthlyBudget, '$4,500');
    assert.equal(d.campaigns.length, 3);
  });

  it('activation checklist has prerequisites', () => {
    assert.ok(ACTIVATION_CHECKLIST.prerequisites.length >= 5);
    assert.ok(ACTIVATION_CHECKLIST.kpiTargets.clickThroughRate);
  });
});

// ── CFO Revenue Platform ───────────────────────────────────────────────────

describe('CFO Revenue Platform', async () => {
  const { handleCFODashboard, handleCFOChannels, handleCFOChecklist } = await import('../routes/cfo-revenue.js');

  it('GET /v1/cfo/dashboard returns revenue platform', async () => {
    const res = handleCFODashboard();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.ok(b.revenueChannels || b.dashboard || b.platform);
  });

  it('GET /v1/cfo/channels returns revenue channels', async () => {
    const res = handleCFOChannels();
    assert.equal(res.status, 200);
  });

  it('GET /v1/cfo/checklist returns checklist', async () => {
    const res = handleCFOChecklist();
    assert.equal(res.status, 200);
  });
});
