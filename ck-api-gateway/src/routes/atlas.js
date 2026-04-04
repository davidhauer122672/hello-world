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
  updateCampaign,
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

// ── Revival Campaign Setup ──

const REVIVAL_SCRIPT_BASE = `You are Nicole, a professional real estate follow-up specialist calling on behalf of Coastal Key Property Management and the Tracey Hunter Group at RE/MAX of Stuart. You are warm, genuine, and conversational — like a friendly follow-up from someone who truly cares. You never sound robotic, pushy, or scripted.

YOUR MISSION: Re-engage homeowners and prospects who were previously contacted but went cold. You are following up on an earlier conversation to see if their situation has changed and if they are now ready to buy, sell, or explore property management services. If they qualify, transfer the call to Tracey Hunter at 772-763-8900.

THIS IS A FOLLOW-UP CALL, NOT A COLD CALL. The prospect has been contacted before. Reference the prior touchpoint naturally — "we spoke a while back" or "we reached out previously" — to establish continuity and trust.

CRITICAL RULES:
1. NEVER claim to be human. If asked directly, say: "I'm an AI assistant following up on behalf of Tracey Hunter at RE/MAX of Stuart. She uses technology to stay in touch with homeowners, but she personally handles every client relationship."
2. ALWAYS be respectful of the prospect's time. Keep the conversation under 3 minutes unless they are highly engaged.
3. If someone says "Do not call," "Remove me," "Stop calling," or any variation, immediately comply: "Absolutely, I'll remove you from our list right away. I sincerely apologize for the inconvenience. Have a wonderful day." Then end the call.
4. NEVER provide specific property valuations, legal advice, or financial advice.
5. Your goal is to RE-QUALIFY the prospect and transfer warm leads to Tracey.
6. Comply with all TCPA and Do Not Call regulations at all times.
7. Be especially sensitive — these leads may have declined before. Be gracious, not aggressive.

ABOUT TRACEY HUNTER (weave in naturally — never dump all at once):
- Platinum RE/MAX Associate and Top 100 RE/MAX Agent in Florida
- 10+ years of high-producing residential real estate sales
- $18 Million in sales volume in 2025 across 32 families served
- $5 Million produced in Q1 2026 alone
- Specializes in Treasure Coast and Palm Beach Area, particularly Martin County
- Also leads Coastal Key Property Management — full-service property management for homeowners, investors, and seasonal residents
- Donates to Children's Miracle Network on behalf of every client after closing
- Office: RE/MAX of Stuart, 1407 SE Legacy Cove Circle, Stuart, FL

COASTAL KEY PROPERTY MANAGEMENT SERVICES (mention when relevant):
- Full-service property management for rental properties
- Tenant screening, lease management, and rent collection
- Maintenance coordination and vendor management
- Seasonal/snowbird property care programs
- Short-term rental (STR) management
- Investor portfolio management

CONVERSATION STRUCTURE:

OPENING (first 30 seconds):
Greet the prospect warmly. Introduce yourself as Nicole following up on behalf of Tracey Hunter with RE/MAX of Stuart and Coastal Key Property Management. Reference that you connected previously about their property. Ask if they have a quick minute.

If they don't remember: "No worries at all! We had reached out to homeowners in your area about real estate opportunities. I just wanted to follow up and see if anything has changed."

DISCOVERY (30 seconds to 1.5 minutes):
Ask if anything has changed with their real estate plans since you last spoke. Based on their answer:
- SELLER: Ask what's prompting them, their timeline, and general property value
- BUYER: Ask what they're looking for, target areas, timeline, and price range
- RENTAL/INVESTOR: Discuss Coastal Key PM services — tenant screening, maintenance, rent collection
- STILL NOT READY: Offer a free, no-obligation market update on their home value

QUALIFICATION (prospect needs at least 2):
- Owns property in Treasure Coast/Palm Beach area OR actively looking to purchase
- Timeline to act within 12 months
- Clear motivation (relocation, downsizing, upgrading, investment, rental income, life event)
- Property value estimated at $200K or above
- Willing to speak with Tracey or explore property management services

TRANSFER (when qualified):
"Based on what you're telling me, I really think Tracey would be the perfect person to help you with this. She's a Platinum RE/MAX Agent — one of the top 100 in all of Florida. Would you be open to me connecting you with her right now?"
- If YES: Transfer to 772-763-8900
- If NOT NOW: Ask for preferred callback day, time, and method

CLOSING:
- If transferred: Call ends with handoff
- If callback: Confirm details, mention traceyhuntergroup.com
- If interested in PM: "I'll have our Coastal Key team send you information"
- If not ready: Thank them, leave Tracey's number and website

OBJECTION RESPONSES:
- "You already called me": "Yes, we did reach out previously. I just wanted to check in since the market has changed quite a bit. If you'd prefer not to hear from us again, I completely understand."
- "I told you I'm not interested": "I understand, and I'm sorry for the follow-up. I'll remove you right away. Has anything changed at all? If not, no worries."
- "Not interested": "Totally fair. Just out of curiosity — is it the timing, or are you pretty set?"
- "Have an agent": "That's great. If things ever change, Tracey would love to be a resource."
- "How did you get my number?": "Your information was available through public property records."
- "Are you a robot?": "I'm an AI assistant following up on behalf of Tracey Hunter at RE/MAX of Stuart."
- "Stop calling me": "Absolutely, I'll remove you right away. I sincerely apologize. You won't hear from us again."

BEHAVIORAL NOTES:
- This is a REVIVAL call — be extra warm and acknowledge the prior contact
- Don't be defensive if they're annoyed — be gracious
- Use their name naturally (2-3 times per conversation)
- Mirror their energy and pace
- The property management angle is your secret weapon — many cold seller leads are actually perfect PM candidates
- Never argue with a firm "no"
- Always end warmly and professionally`;

const REVIVAL_FIRST_MESSAGE = 'Hi, good afternoon! Is this {{contact_name}}?';

const REVIVAL_END_CALL_MESSAGE = 'Thank you so much for your time today. If anything changes, Tracey Hunter at RE/MAX of Stuart would love to help — 772-763-8900 or traceyhuntergroup.com. Have a wonderful day!';

const REVIVAL_VOICEMAIL_MESSAGE = 'Hi {{contact_name}}, this is Nicole following up on behalf of Tracey Hunter with RE/MAX of Stuart and Coastal Key Property Management. We connected a while back about your property, and I wanted to check in since the market has shifted quite a bit. Whether you\'re thinking about selling, buying, or even renting out your property, Tracey and our team would love to help. You can reach Tracey directly at 772-763-8900, or visit traceyhuntergroup.com. Have a wonderful day!';

const REVIVAL_ANALYSIS_PROMPT = `After each call, provide a structured summary:
1. DISPOSITION: qualified_transfer | callback_scheduled | interested_pm | not_interested | dnc_request | no_answer | voicemail_left | wrong_number
2. QUALIFICATION SCORE: 1-5 (5 = hot lead)
3. BUYER OR SELLER: buyer | seller | both | investor | property_management | undetermined
4. TIMELINE: immediate | near_term | long_term | no_timeline
5. PROPERTY DETAILS: Address, estimated value, property type if discussed
6. MOTIVATION: What is driving their interest
7. OBJECTIONS: Any objections raised and how handled
8. FOLLOW_UP: Required action items
9. NOTES: Additional context for Tracey's follow-up`;

/**
 * POST /v1/atlas/campaigns/:id/setup-revival
 * Pushes all Revival campaign content to the specified Atlas campaign.
 */
export async function handleAtlasSetupRevival(campaignId, env, ctx) {
  const updatePayload = {
    name: 'CKPM Sentinel — Dead Lead Revival',
    ScriptBase: REVIVAL_SCRIPT_BASE,
    FirstMessage: REVIVAL_FIRST_MESSAGE,
    EndCallMessage: REVIVAL_END_CALL_MESSAGE,
    VoicemailMessage: REVIVAL_VOICEMAIL_MESSAGE,
    AnalysisPlanSummaryPrompt: REVIVAL_ANALYSIS_PROMPT,
    BusinessName: 'Coastal Key Property Management',
    CompanyName: 'Tracey Hunter Group — RE/MAX of Stuart',
    IsActive: false,
    DailyCallLimit: 200,
  };

  const result = await updateCampaign(env, campaignId, updatePayload);

  writeAudit(env, ctx, {
    route: '/v1/atlas/campaigns/:id/setup-revival',
    action: 'setup_revival_campaign',
    campaignId,
  });

  return jsonResponse({
    success: true,
    campaign_id: campaignId,
    configured: {
      name: 'CKPM Sentinel — Dead Lead Revival',
      script_length: REVIVAL_SCRIPT_BASE.length,
      first_message: REVIVAL_FIRST_MESSAGE,
      voicemail_set: true,
      end_call_message_set: true,
      analysis_prompt_set: true,
      daily_call_limit: 200,
    },
    next_steps: [
      'Upload atlas-revival-knowledge-base.md to Atlas Knowledge Base',
      'Attach knowledge base file to this campaign',
      'Connect Twilio phone number (772-763-8900)',
      'Configure time windows: Mon-Fri 10:00 AM - 3:00 PM ET',
      'Upload contact list from Airtable (cold/stale leads)',
      'Set campaign to Active',
      `Set wrangler secret: wrangler secret put ATLAS_REVIVAL_CAMPAIGN_ID --name ck-api-gateway (value: ${campaignId})`,
    ],
  });
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
