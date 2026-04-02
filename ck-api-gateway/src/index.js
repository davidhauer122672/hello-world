/**
 * CK API Gateway — Coastal Key Central Inference Router
 *
 * Routes:
 *   POST /v1/inference          — Claude inference with KV caching + audit logging
 *   POST /v1/leads              — Create lead in Airtable Leads table
 *   POST /v1/leads/public       — Public website contact form → Lead (no auth)
 *   POST /v1/leads/enrich       — AI-enrich an existing lead (battle plan, segment analysis)
 *   GET  /v1/leads/:id          — Fetch lead by record ID
 *   POST /v1/webhook/retell     — Retell call_analyzed → Lead + Slack
 *   POST /v1/content/generate   — Generate content (social, email, script) via Claude
 *   GET  /v1/agents             — List/search agents with filtering
 *   GET  /v1/agents/metrics     — Aggregate agent metrics
 *   GET  /v1/agents/:id         — Get single agent details
 *   POST /v1/agents/:id/action  — Execute agent action (activate/pause/restart/train)
 *   GET  /v1/dashboard          — Combined dashboard data
 *   POST /v1/workflows/scaa1   — SCAA-1 Battle Plan Pipeline
 *   POST /v1/workflows/wf3     — WF-3 Investor Escalation
 *   POST /v1/workflows/wf4     — WF-4 Long-Tail Nurture
 *   POST /v1/pricing/recommend   — Dynamic pricing recommendation
 *   GET  /v1/pricing/zones      — Zone-level pricing benchmarks
 *   GET  /v1/health             — Health check
 *   GET  /v1/property-intel/search — Search ArcGIS for Saint Lucie commercial parcels
 *   POST /v1/property-intel/import — Fetch + import parcels to Airtable
 *   GET  /v1/property-intel/stats  — Property Intelligence summary stats
 *   GET  /v1/audit              — Retrieve recent audit log entries
 *   GET  /v1/campaign/calls     — TH Sentinel campaign call log
 *   GET  /v1/campaign/agents    — TH Sentinel agent performance
 *   GET  /v1/campaign/analytics — TH Sentinel campaign analytics
 *   GET  /v1/campaign/contacts  — TH Sentinel lead contacts
 *   GET  /v1/campaign/dashboard — TH Sentinel combined campaign dashboard
 *   GET  /v1/intel/officers    — List all 50 Intelligence Officers
 *   GET  /v1/intel/officers/:id — Get single Intelligence Officer
 *   POST /v1/intel/officers/:id/scan — Trigger officer scan
 *   GET  /v1/intel/dashboard   — Intelligence Officer fleet dashboard
 *   POST /v1/intel/fleet-scan  — Scan all critical-severity officers
 *   GET  /v1/email/agents      — List all 20 email agents
 *   GET  /v1/email/agents/:id  — Get single email agent
 *   POST /v1/email/compose     — AI-compose email via Claude
 *   POST /v1/email/classify    — Classify/score inbound email
 *   GET  /v1/email/dashboard   — Email operations dashboard
 *   POST /v1/workflows/wf2    — WF-2 Approved Content → Buffer Social Publish
 *   POST /v1/workflows/wf5    — WF-5 Missed Call → QA Alert + Auto-Retry
 *   POST /v1/workflows/wf6    — WF-6 Daily Campaign Digest
 *   POST /v1/workflows/wf7    — WF-7 Foundation Donation Pipeline
 *   POST /v1/webhooks/donation — Inbound donation webhook (public, no auth)
 *   GET  /v1/foundation/dashboard — Live fundraising dashboard (public, no auth)
 *   GET  /v1/fundraising/dashboard — Fundraising overview dashboard
 *   GET  /v1/fundraising/campaigns — List all campaigns
 *   GET  /v1/fundraising/campaigns/:id — Get campaign details
 *   POST /v1/fundraising/campaigns — Create new campaign
 *   GET  /v1/fundraising/agents   — List FND division agents
 *   GET  /v1/fundraising/agents/:id — Get single FND agent
 *   GET  /v1/fundraising/rise     — CEO RISE Campaign details
 *   POST /v1/social/publish       — Queue content to Buffer
 *   GET  /v1/social/profiles      — List connected social profiles
 *   GET  /v1/social/queue         — View scheduled posts
 *   POST /v1/social/generate      — AI-generate social content
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 */

import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rate-limit.js';
import { handleInference } from './routes/inference.js';
import { handleCreateLead, handleGetLead, handleEnrichLead, handlePublicLead } from './routes/leads.js';
import { handleRetellWebhook } from './routes/retell.js';
import { handleContentGenerate } from './routes/content.js';
import { handleAuditLog } from './routes/audit.js';
import { handleListAgents, handleGetAgent, handleAgentAction, handleAgentMetrics, handleDashboard } from './routes/agents.js';
import { handleScaa1BattlePlan, handleWf3InvestorEscalation, handleWf4LongTailNurture } from './routes/workflows.js';
import { handleWf2ContentPublish, handleWf5MissedCallRetry, handleWf6DailyDigest, handleWf7DonationPipeline, handleDonationWebhook, handleFoundationDashboard } from './routes/workflows-extended.js';
import { handleFundraisingDashboard, handleListCampaigns, handleGetCampaign, handleCreateCampaign, handleListFundraisingAgents, handleGetFundraisingAgent, handleRiseCampaign } from './routes/fundraising.js';
import { handleSocialPublish, handleSocialProfiles, handleSocialQueue, handleSocialGenerate } from './routes/social-media.js';
import { handlePropertySearch, handlePropertyImport, handlePropertyStats } from './routes/property-intel.js';
import { handleCampaignCallLog, handleCampaignAgentPerformance, handleCampaignAnalytics, handleCampaignLeadContacts, handleCampaignDashboard } from './routes/sentinel-campaign.js';
import { handlePricingRecommend, handlePricingZones } from './routes/pricing.js';
import { handleListOfficers, handleGetOfficer, handleOfficerScan, handleOfficerDashboard, handleFleetScan } from './routes/intelligence-officers.js';
import { handleListEmailAgents, handleGetEmailAgent, handleEmailCompose, handleEmailClassify, handleEmailDashboard } from './routes/email-agents.js';
import { jsonResponse, errorResponse, corsHeaders } from './utils/response.js';

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ── Health (no auth) ──
    if (path === '/v1/health' && method === 'GET') {
      const deep = url.searchParams.get('deep') === 'true';

      if (!deep) {
        return jsonResponse({
          status: 'operational',
          service: 'ck-api-gateway',
          version: '2.0.0',
          agents: 310,
          divisions: 10,
          timestamp: new Date().toISOString(),
        });
      }

      // Deep health check — verify external dependencies
      const checks = {};

      // Airtable connectivity
      try {
        const atRes = await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Leads?maxRecords=1&fields%5B%5D=Name`,
          { headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` } },
        );
        checks.airtable = { status: atRes.ok ? 'ok' : 'error', code: atRes.status };
      } catch (err) {
        checks.airtable = { status: 'error', message: err.message };
      }

      // Anthropic connectivity
      try {
        const anRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'ping' }],
          }),
        });
        checks.anthropic = { status: anRes.ok ? 'ok' : 'error', code: anRes.status };
      } catch (err) {
        checks.anthropic = { status: 'error', message: err.message };
      }

      // KV stores
      checks.kv = {
        cache: env.CACHE ? 'available' : 'missing',
        sessions: env.SESSIONS ? 'available' : 'missing',
        rateLimits: env.RATE_LIMITS ? 'available' : 'missing',
        auditLog: env.AUDIT_LOG ? 'available' : 'missing',
      };

      const allOk = checks.airtable?.status === 'ok' &&
                     checks.anthropic?.status === 'ok' &&
                     checks.kv.cache === 'available';

      return jsonResponse({
        status: allOk ? 'operational' : 'degraded',
        service: 'ck-api-gateway',
        version: '2.0.0',
        agents: 310,
        divisions: 10,
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    // ── Public routes (no auth) ──
    if (path === '/v1/leads/public' && method === 'POST') {
      return await handlePublicLead(request, env, ctx);
    }

    if (path === '/v1/webhooks/donation' && method === 'POST') {
      return await handleDonationWebhook(request, env, ctx);
    }

    if (path === '/v1/foundation/dashboard' && method === 'GET') {
      return await handleFoundationDashboard(request, env);
    }

    // ── Auth gate ──
    const authError = authenticate(request, env);
    if (authError) return authError;

    // ── Rate limit ──
    const rateLimitError = await rateLimit(request, env);
    if (rateLimitError) return rateLimitError;

    try {
      // ── Route dispatch ──
      if (path === '/v1/inference' && method === 'POST') {
        return await handleInference(request, env, ctx);
      }

      if (path === '/v1/leads' && method === 'POST') {
        return await handleCreateLead(request, env, ctx);
      }

      if (path === '/v1/leads/enrich' && method === 'POST') {
        return await handleEnrichLead(request, env, ctx);
      }

      if (path.startsWith('/v1/leads/') && method === 'GET') {
        const recordId = path.split('/v1/leads/')[1];
        return await handleGetLead(recordId, env);
      }

      if (path === '/v1/webhook/retell' && method === 'POST') {
        return await handleRetellWebhook(request, env, ctx);
      }

      if (path === '/v1/content/generate' && method === 'POST') {
        return await handleContentGenerate(request, env, ctx);
      }

      if (path === '/v1/agents' && method === 'GET') {
        return handleListAgents(url, env);
      }

      if (path === '/v1/agents/metrics' && method === 'GET') {
        return handleAgentMetrics(url, env);
      }

      if (path === '/v1/dashboard' && method === 'GET') {
        return await handleDashboard(env);
      }

      if (path.match(/^\/v1\/agents\/[^/]+\/action$/) && method === 'POST') {
        return await handleAgentAction(request, env, ctx);
      }

      if (path.match(/^\/v1\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/agents/')[1];
        return handleGetAgent(agentId, env);
      }

      // ── Workflow Pipelines ──
      if (path === '/v1/workflows/scaa1' && method === 'POST') {
        return await handleScaa1BattlePlan(request, env, ctx);
      }

      if (path === '/v1/workflows/wf3' && method === 'POST') {
        return await handleWf3InvestorEscalation(request, env, ctx);
      }

      if (path === '/v1/workflows/wf4' && method === 'POST') {
        return await handleWf4LongTailNurture(request, env, ctx);
      }

      // ── Property Intelligence ──
      if (path === '/v1/property-intel/search' && method === 'GET') {
        return await handlePropertySearch(url, env);
      }

      if (path === '/v1/property-intel/import' && method === 'POST') {
        return await handlePropertyImport(request, env, ctx);
      }

      if (path === '/v1/property-intel/stats' && method === 'GET') {
        return await handlePropertyStats(env);
      }

      // ── TH Sentinel Campaign ──
      if (path === '/v1/campaign/calls' && method === 'GET') {
        return await handleCampaignCallLog(url, env);
      }

      if (path === '/v1/campaign/agents' && method === 'GET') {
        return await handleCampaignAgentPerformance(url, env);
      }

      if (path === '/v1/campaign/analytics' && method === 'GET') {
        return await handleCampaignAnalytics(url, env);
      }

      if (path === '/v1/campaign/contacts' && method === 'GET') {
        return await handleCampaignLeadContacts(url, env);
      }

      if (path === '/v1/campaign/dashboard' && method === 'GET') {
        return await handleCampaignDashboard(env);
      }

      // ── Pricing Engine ──
      if (path === '/v1/pricing/recommend' && method === 'POST') {
        return await handlePricingRecommend(request, env, ctx);
      }

      if (path === '/v1/pricing/zones' && method === 'GET') {
        return handlePricingZones();
      }

      // ── Intelligence Officers ──
      if (path === '/v1/intel/officers' && method === 'GET') {
        return handleListOfficers(url);
      }

      if (path === '/v1/intel/dashboard' && method === 'GET') {
        return await handleOfficerDashboard(env);
      }

      if (path === '/v1/intel/fleet-scan' && method === 'POST') {
        return await handleFleetScan(env, ctx);
      }

      if (path.match(/^\/v1\/intel\/officers\/[^/]+\/scan$/) && method === 'POST') {
        return await handleOfficerScan(request, env, ctx);
      }

      if (path.match(/^\/v1\/intel\/officers\/[^/]+$/) && method === 'GET') {
        const officerId = path.split('/v1/intel/officers/')[1];
        return handleGetOfficer(officerId);
      }

      // ── Email Agents ──
      if (path === '/v1/email/agents' && method === 'GET') {
        return handleListEmailAgents(url);
      }

      if (path === '/v1/email/dashboard' && method === 'GET') {
        return handleEmailDashboard();
      }

      if (path === '/v1/email/compose' && method === 'POST') {
        return await handleEmailCompose(request, env, ctx);
      }

      if (path === '/v1/email/classify' && method === 'POST') {
        return await handleEmailClassify(request, env, ctx);
      }

      if (path.match(/^\/v1\/email\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/email/agents/')[1];
        return handleGetEmailAgent(agentId);
      }

      if (path === '/v1/audit' && method === 'GET') {
        return await handleAuditLog(url, env);
      }

      // ── Extended Workflows (WF-2, WF-5, WF-6, WF-7) ──
      if (path === '/v1/workflows/wf2' && method === 'POST') {
        return await handleWf2ContentPublish(request, env, ctx);
      }

      if (path === '/v1/workflows/wf5' && method === 'POST') {
        return await handleWf5MissedCallRetry(request, env, ctx);
      }

      if (path === '/v1/workflows/wf6' && method === 'POST') {
        return await handleWf6DailyDigest(request, env, ctx);
      }

      if (path === '/v1/workflows/wf7' && method === 'POST') {
        return await handleWf7DonationPipeline(request, env, ctx);
      }

      // ── Fundraising ──
      if (path === '/v1/fundraising/dashboard' && method === 'GET') {
        return await handleFundraisingDashboard(env);
      }

      if (path === '/v1/fundraising/campaigns' && method === 'GET') {
        return handleListCampaigns();
      }

      if (path === '/v1/fundraising/campaigns' && method === 'POST') {
        return await handleCreateCampaign(request, env, ctx);
      }

      if (path === '/v1/fundraising/agents' && method === 'GET') {
        return handleListFundraisingAgents(url);
      }

      if (path === '/v1/fundraising/rise' && method === 'GET') {
        return await handleRiseCampaign(env);
      }

      if (path.match(/^\/v1\/fundraising\/campaigns\/[^/]+$/) && method === 'GET') {
        const campaignId = path.split('/v1/fundraising/campaigns/')[1];
        return handleGetCampaign(campaignId);
      }

      if (path.match(/^\/v1\/fundraising\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/fundraising/agents/')[1];
        return handleGetFundraisingAgent(agentId);
      }

      // ── Social Media ──
      if (path === '/v1/social/publish' && method === 'POST') {
        return await handleSocialPublish(request, env, ctx);
      }

      if (path === '/v1/social/profiles' && method === 'GET') {
        return handleSocialProfiles();
      }

      if (path === '/v1/social/queue' && method === 'GET') {
        return await handleSocialQueue(url, env);
      }

      if (path === '/v1/social/generate' && method === 'POST') {
        return await handleSocialGenerate(request, env, ctx);
      }

      return errorResponse('Not found', 404);
    } catch (err) {
      console.error(`[CK Gateway Error] ${path}:`, err);

      // Log errors to audit KV
      if (env.AUDIT_LOG) {
        const key = `error:${Date.now()}`;
        ctx.waitUntil(
          env.AUDIT_LOG.put(key, JSON.stringify({
            path,
            method,
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
          }), { expirationTtl: 86400 * 30 })
        );
      }

      return errorResponse(`Internal error: ${err.message}`, 500);
    }
  },
};
