/**
 * Fundraising Routes — Coastal Key Foundation API
 *
 *   GET  /v1/fundraising/dashboard     — Live fundraising dashboard data
 *   GET  /v1/fundraising/campaigns     — List all campaigns
 *   GET  /v1/fundraising/campaigns/:id — Get campaign details
 *   GET  /v1/fundraising/donors        — List donors (paginated)
 *   POST /v1/fundraising/campaigns     — Create a new campaign
 *   GET  /v1/fundraising/agents        — List 20 FND agents
 *   GET  /v1/fundraising/agents/:id    — Get single FND agent
 *   GET  /v1/fundraising/rise          — CEO RISE Campaign details
 */

import { inference } from '../services/anthropic.js';
import { createRecord, listRecords, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { FND_AGENTS } from '../agents/agents-fnd.js';
import { CEO_RISE_CAMPAIGN, FOUNDATION, CAMPAIGN_TEMPLATES, DONATION_SOURCES } from '../config/foundation.js';

// ── GET /v1/fundraising/dashboard ──────────────────────────────────────────

export async function handleFundraisingDashboard(env) {
  const defaults = {
    foundation: {
      name: FOUNDATION.name,
      mission: FOUNDATION.mission,
      owner: FOUNDATION.owner,
    },
    stats: {
      totalRaised: 0,
      donorCount: 0,
      campaignCount: 1,
      activeCampaigns: 1,
    },
    campaigns: [
      {
        id: CEO_RISE_CAMPAIGN.id,
        name: CEO_RISE_CAMPAIGN.name,
        status: CEO_RISE_CAMPAIGN.status,
        targets: CEO_RISE_CAMPAIGN.targets,
        raised: 0,
        donorCount: 0,
        progressPercent: 0,
      },
    ],
    agents: {
      total: FND_AGENTS.length,
      active: FND_AGENTS.filter(a => a.status === 'active').length,
      divisions: 'FND',
    },
    donorTiers: CEO_RISE_CAMPAIGN.donorTiers,
    milestones: CEO_RISE_CAMPAIGN.milestones,
    lastUpdated: new Date().toISOString(),
  };

  // Hydrate from KV if available
  if (env.CACHE) {
    try {
      const stats = await env.CACHE.get('foundation:dashboard:stats', 'json');
      if (stats) {
        defaults.stats.totalRaised = stats.totalRaised || 0;
        defaults.stats.donorCount = stats.donorCount || 0;
        defaults.campaigns[0].raised = stats.campaignTotals?.['CEO RISE Campaign'] || 0;
        defaults.campaigns[0].donorCount = stats.donorCount || 0;
        const goal = CEO_RISE_CAMPAIGN.targets.phase3.goal;
        defaults.campaigns[0].progressPercent = goal > 0
          ? Math.min(100, ((defaults.campaigns[0].raised / goal) * 100)).toFixed(1)
          : 0;
        defaults.lastUpdated = stats.lastUpdated || defaults.lastUpdated;
      }
    } catch (err) {
      console.error('Dashboard KV read failed:', err);
    }
  }

  return jsonResponse(defaults);
}

// ── GET /v1/fundraising/campaigns ──────────────────────────────────────────

export async function handleListCampaigns() {
  const campaigns = CAMPAIGN_TEMPLATES.map(t => ({
    ...t,
    foundationName: FOUNDATION.name,
    status: t.id === 'ceo-rise' ? 'active' : 'planned',
  }));

  return jsonResponse({
    campaigns,
    count: campaigns.length,
    donationSources: DONATION_SOURCES,
  });
}

// ── GET /v1/fundraising/campaigns/:id ──────────────────────────────────────

export function handleGetCampaign(campaignId) {
  if (campaignId === 'rise' || campaignId === 'RISE-001' || campaignId === 'ceo-rise') {
    return jsonResponse({
      campaign: CEO_RISE_CAMPAIGN,
      foundation: FOUNDATION,
    });
  }

  const template = CAMPAIGN_TEMPLATES.find(t => t.id === campaignId);
  if (!template) {
    return errorResponse(`Campaign "${campaignId}" not found.`, 404);
  }

  return jsonResponse({ campaign: template, foundation: FOUNDATION });
}

// ── POST /v1/fundraising/campaigns ─────────────────────────────────────────

export async function handleCreateCampaign(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { name, type, goal, description } = body;
  if (!name) return errorResponse('"name" is required.', 400);

  const timestamp = new Date().toISOString();

  // Generate campaign narrative via AI
  let narrative = '';
  try {
    const aiResult = await inference(env, {
      system: 'You are the Coastal Key Foundation campaign strategist. Create compelling fundraising campaign narratives that inspire donors to contribute.',
      prompt: `Create a fundraising campaign narrative for:\nName: ${name}\nType: ${type || 'general'}\nGoal: $${goal || 'TBD'}\nDescription: ${description || 'New fundraising campaign for Coastal Key Foundation'}\n\nInclude:\n1. Campaign headline (under 100 chars)\n2. Campaign story (200-300 words)\n3. Three donor impact statements\n4. Call to action`,
      tier: 'standard',
      maxTokens: 1000,
    });
    narrative = aiResult.content;
  } catch (err) {
    console.error('Campaign narrative generation failed:', err);
    narrative = description || `Support the ${name} campaign at Coastal Key Foundation.`;
  }

  // Create campaign record
  let campaignRecord;
  try {
    campaignRecord = await createRecord(env, 'Foundation Campaigns', {
      'Campaign Name': name,
      'Type': type || 'general',
      'Goal': goal || 0,
      'Description': description || '',
      'Narrative': narrative.slice(0, 10000),
      'Status': { name: 'Draft' },
      'Created Date': timestamp,
    });
  } catch (err) {
    console.error('Campaign record creation failed:', err);
    campaignRecord = null;
  }

  writeAudit(env, ctx, {
    route: '/v1/fundraising/campaigns',
    action: 'campaign_created',
    name,
    type: type || 'general',
  });

  return jsonResponse({
    created: true,
    name,
    narrative,
    recordId: campaignRecord?.id || null,
  });
}

// ── GET /v1/fundraising/agents ─────────────────────────────────────────────

export function handleListFundraisingAgents(url) {
  const status = url.searchParams.get('status');
  const tier = url.searchParams.get('tier');

  let agents = FND_AGENTS;

  if (status) {
    agents = agents.filter(a => a.status === status);
  }
  if (tier) {
    agents = agents.filter(a => a.tier === tier);
  }

  return jsonResponse({
    agents,
    count: agents.length,
    total: FND_AGENTS.length,
    division: 'FND',
    divisionName: 'Fundraising',
  });
}

// ── GET /v1/fundraising/agents/:id ─────────────────────────────────────────

export function handleGetFundraisingAgent(agentId) {
  const normalizedId = agentId.toUpperCase();
  const agent = FND_AGENTS.find(a => a.id === normalizedId);

  if (!agent) {
    return errorResponse(`Agent "${agentId}" not found in FND division.`, 404);
  }

  return jsonResponse({ agent });
}

// ── GET /v1/fundraising/rise ───────────────────────────────────────────────

export async function handleRiseCampaign(env) {
  const campaign = {
    ...CEO_RISE_CAMPAIGN,
    foundation: FOUNDATION,
    agents: FND_AGENTS.filter(a =>
      a.id === 'FND-020' || // CEO Rise Strategist
      a.id === 'FND-001' || // Foundation Commander
      a.id === 'FND-003' || // Story Weaver
      a.id === 'FND-010' || // International Outreach
      a.id === 'FND-011'    // Angel Connector
    ),
    stats: {
      totalRaised: 0,
      donorCount: 0,
      progressPercent: 0,
    },
  };

  // Hydrate from KV
  if (env.CACHE) {
    try {
      const stats = await env.CACHE.get('foundation:dashboard:stats', 'json');
      if (stats) {
        campaign.stats.totalRaised = stats.campaignTotals?.['CEO RISE Campaign'] || 0;
        campaign.stats.donorCount = stats.donorCount || 0;
        const goal = CEO_RISE_CAMPAIGN.targets.phase3.goal;
        campaign.stats.progressPercent = goal > 0
          ? Math.min(100, ((campaign.stats.totalRaised / goal) * 100)).toFixed(1)
          : 0;
      }
    } catch (err) {
      console.error('RISE KV read failed:', err);
    }
  }

  return jsonResponse(campaign);
}
