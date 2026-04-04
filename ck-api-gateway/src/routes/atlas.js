/**
 * Atlas Routes — youratlas.com AI Campaign Platform API proxy endpoints
 *
 * Routes:
 *   GET  /v1/atlas/campaigns              — List all Atlas campaigns
 *   GET  /v1/atlas/campaigns/:id          — Get single campaign
 *   PUT  /v1/atlas/campaigns/:id/status   — Set campaign status (active/paused)
 *   GET  /v1/atlas/statistics              — Overview stats across all campaigns
 *   GET  /v1/atlas/campaigns/:id/stats    — Stats for a specific campaign
 *   GET  /v1/atlas/campaigns/:id/calls    — Call records for a campaign
 *   GET  /v1/atlas/campaigns/:id/calls/:callId — Single call record detail
 *   POST /v1/atlas/campaigns/:id/schedule — Schedule a new call
 *   GET  /v1/atlas/campaigns/:id/bookings — Bookings for a campaign
 *   GET  /v1/atlas/kb/files               — List all knowledge base files
 *   POST /v1/atlas/speed-to-lead          — Trigger speed-to-lead call for new lead
 *   POST /v1/atlas/campaigns              — Create a new campaign
 *   GET  /v1/atlas/audit                  — Audit all campaigns and check for required CKPM campaigns
 *   GET  /v1/atlas/health                 — Atlas API connectivity check
 */

import {
  listCampaigns,
  getCampaign,
  createCampaign,
  setCampaignStatus,
  getCampaignsOverviewStats,
  getCampaignStats,
  getCallRecords,
  getCallRecordDetail,
  createScheduledCall,
  getCampaignBookings,
  listKnowledgeBaseFiles,
  triggerSpeedToLead,
  atlasRequest,
} from '../services/atlas.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

// ── Campaign Management ──

export async function handleAtlasCampaigns(env) {
  const result = await listCampaigns(env);
  return jsonResponse({ success: true, campaigns: result });
}

export async function handleAtlasCampaignById(campaignId, env) {
  const result = await getCampaign(env, campaignId);
  return jsonResponse({ success: true, campaign: result });
}

export async function handleAtlasCampaignStatus(request, campaignId, env, ctx) {
  const body = await request.json();
  if (!body.status) {
    return errorResponse('status is required (e.g. "active", "paused")', 400);
  }

  const result = await setCampaignStatus(env, campaignId, body.status);

  writeAudit(env, ctx, {
    route: '/v1/atlas/campaigns/:id/status',
    action: 'set_campaign_status',
    campaignId,
    status: body.status,
  });

  return jsonResponse({ success: true, result });
}

// ── Statistics ──

export async function handleAtlasOverviewStats(env) {
  const result = await getCampaignsOverviewStats(env);
  return jsonResponse({ success: true, statistics: result });
}

export async function handleAtlasCampaignStatsById(campaignId, env) {
  const result = await getCampaignStats(env, campaignId);
  return jsonResponse({ success: true, campaign_id: campaignId, statistics: result });
}

// ── Call Records ──

export async function handleAtlasCallRecords(campaignId, url, env) {
  const queryParams = {};
  if (url.searchParams.get('limit')) queryParams.limit = url.searchParams.get('limit');
  if (url.searchParams.get('offset')) queryParams.offset = url.searchParams.get('offset');

  const result = await getCallRecords(env, campaignId, Object.keys(queryParams).length ? queryParams : null);
  return jsonResponse({ success: true, campaign_id: campaignId, call_records: result });
}

export async function handleAtlasCallRecordDetail(campaignId, callId, env) {
  const result = await getCallRecordDetail(env, campaignId, callId);
  return jsonResponse({ success: true, campaign_id: campaignId, call_id: callId, record: result });
}

// ── Scheduled Calls ──

export async function handleAtlasScheduleCall(request, campaignId, env, ctx) {
  const body = await request.json();

  if (!body.phone_number) {
    return errorResponse('phone_number is required', 400);
  }

  const result = await createScheduledCall(env, campaignId, body);

  writeAudit(env, ctx, {
    route: '/v1/atlas/campaigns/:id/schedule',
    action: 'schedule_call',
    campaignId,
    phone: body.phone_number,
  });

  return jsonResponse({ success: true, scheduled: result });
}

// ── Bookings ──

export async function handleAtlasCampaignBookings(campaignId, env) {
  const result = await getCampaignBookings(env, campaignId);
  return jsonResponse({ success: true, campaign_id: campaignId, bookings: result });
}

// ── Knowledge Base ──

export async function handleAtlasKBFiles(env) {
  const result = await listKnowledgeBaseFiles(env);
  return jsonResponse({ success: true, files: result });
}

// ── Speed-to-Lead ──

export async function handleAtlasSpeedToLead(request, env, ctx) {
  const body = await request.json();

  if (!body.campaign_id || !body.phone_number) {
    return errorResponse('campaign_id and phone_number are required', 400);
  }

  const result = await triggerSpeedToLead(env, body.campaign_id, body);

  writeAudit(env, ctx, {
    route: '/v1/atlas/speed-to-lead',
    action: 'speed_to_lead_triggered',
    campaignId: body.campaign_id,
    phone: body.phone_number,
    lead_source: body.lead_source || 'api',
  });

  return jsonResponse({ success: true, triggered: result });
}

// ── Create Campaign ──

export async function handleAtlasCreateCampaign(request, env, ctx) {
  const body = await request.json();

  if (!body.name) {
    return errorResponse('name is required', 400);
  }

  const result = await createCampaign(env, body);

  writeAudit(env, ctx, {
    route: '/v1/atlas/campaigns',
    action: 'create_campaign',
    name: body.name,
  });

  return jsonResponse({ success: true, campaign: result });
}

// ── Campaign Audit ──

/**
 * Required CKPM campaigns that should exist in Atlas.
 * Names are matched case-insensitively as substrings.
 */
const REQUIRED_CAMPAIGNS = [
  { key: 'speed_to_lead', search: 'speed', label: 'Speed-to-Lead', env_var: null },
  { key: 'dead_lead_revival', search: 'revival', label: 'Dead Lead Revival', env_var: 'ATLAS_REVIVAL_CAMPAIGN_ID' },
  { key: 'appointment_confirmation', search: 'confirm', label: 'Appointment Confirmation', env_var: 'ATLAS_CONFIRMATION_CAMPAIGN_ID' },
  { key: 'inbound_receptionist', search: 'receptionist', label: 'AI Receptionist (Inbound)', env_var: null },
  { key: 'outbound_prospecting', search: 'sentinel', label: 'Outbound Prospecting (TH-SENTINEL)', env_var: null },
];

export async function handleAtlasAudit(env) {
  if (!env.ATLAS_API_KEY) {
    return jsonResponse({
      status: 'not_configured',
      message: 'ATLAS_API_KEY not set.',
    });
  }

  try {
    const campaignsResponse = await listCampaigns(env);
    const campaigns = Array.isArray(campaignsResponse)
      ? campaignsResponse
      : (campaignsResponse?.data || campaignsResponse?.campaigns || []);

    // Build inventory of all existing campaigns
    const inventory = campaigns.map(c => ({
      id: c.id || c._id,
      name: c.name || c.title,
      status: c.status,
      type: c.type || c.campaign_type,
      created: c.created_at || c.createdAt,
    }));

    // Check which required CKPM campaigns exist
    const audit = REQUIRED_CAMPAIGNS.map(req => {
      const match = inventory.find(c =>
        c.name && c.name.toLowerCase().includes(req.search.toLowerCase())
      );

      const envConfigured = req.env_var ? !!env[req.env_var] : null;

      return {
        key: req.key,
        label: req.label,
        found: !!match,
        campaign_id: match?.id || null,
        campaign_name: match?.name || null,
        campaign_status: match?.status || null,
        env_var: req.env_var,
        env_configured: envConfigured,
        action_needed: !match
          ? `CREATE campaign in Atlas dashboard → https://app.youratlas.com/dashboard/campaigns`
          : (req.env_var && !envConfigured)
            ? `SET secret: wrangler secret put ${req.env_var} --name ck-api-gateway (value: ${match.id})`
            : 'none',
      };
    });

    const missing = audit.filter(a => !a.found);
    const unconfigured = audit.filter(a => a.found && a.env_var && !a.env_configured);

    return jsonResponse({
      success: true,
      platform: 'Atlas AI (youratlas.com)',
      dashboard: 'https://app.youratlas.com/dashboard/campaigns',
      total_campaigns: inventory.length,
      all_campaigns: inventory,
      required_campaigns_audit: audit,
      summary: {
        total_required: REQUIRED_CAMPAIGNS.length,
        found: REQUIRED_CAMPAIGNS.length - missing.length,
        missing: missing.length,
        missing_campaigns: missing.map(m => m.label),
        unconfigured_secrets: unconfigured.map(u => u.env_var),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
    }, 503);
  }
}

// ── Health Check ──

export async function handleAtlasHealth(env) {
  if (!env.ATLAS_API_KEY) {
    return jsonResponse({
      status: 'not_configured',
      platform: 'Atlas AI (youratlas.com)',
      message: 'ATLAS_API_KEY not set. Configure via wrangler secret put ATLAS_API_KEY.',
    });
  }

  try {
    const campaigns = await listCampaigns(env);
    const campaignCount = Array.isArray(campaigns) ? campaigns.length : (campaigns?.data?.length || 0);

    return jsonResponse({
      status: 'operational',
      platform: 'Atlas AI (youratlas.com)',
      dashboard: 'https://app.youratlas.com/dashboard/campaigns',
      campaigns_found: campaignCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      platform: 'Atlas AI (youratlas.com)',
      message: err.message,
      timestamp: new Date().toISOString(),
    }, 503);
  }
}
