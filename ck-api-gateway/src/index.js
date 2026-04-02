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
 *   GET  /v1/delegation/fleet       — Delegation fleet status dashboard
 *   POST /v1/delegation/scan        — Run DEL agent scan
 *   POST /v1/delegation/dispatch    — Dispatch task to DEL agent
 *   POST /v1/delegation/handoff     — Inter-agent handoff
 *   POST /v1/delegation/briefing    — Process CEO briefing
 *   GET  /v1/delegation/agents      — List all 20 DEL agents
 *   GET  /v1/delegation/agents/:id  — Get single DEL agent
 *   GET  /v1/upgrade/sprint         — Systems Upgrade sprint dashboard
 *   GET  /v1/upgrade/agents         — List all 20 UPG agents
 *   GET  /v1/upgrade/agents/:id     — Get single UPG agent
 *   POST /v1/upgrade/execute        — Execute integration upgrade action
 *   POST /v1/upgrade/publish        — Cross-platform publish
 *   POST /v1/upgrade/content        — Auto-generate content for gaps
 *   POST /v1/upgrade/enroll         — Enroll contact in Constant Contact
 *   GET  /v1/upgrade/integrations   — Integration status for all platforms
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
import { handlePropertySearch, handlePropertyImport, handlePropertyStats } from './routes/property-intel.js';
import { handleCampaignCallLog, handleCampaignAgentPerformance, handleCampaignAnalytics, handleCampaignLeadContacts, handleCampaignDashboard } from './routes/sentinel-campaign.js';
import { handlePricingRecommend, handlePricingZones } from './routes/pricing.js';
import { handleListOfficers, handleGetOfficer, handleOfficerScan, handleOfficerDashboard, handleFleetScan } from './routes/intelligence-officers.js';
import { handleListEmailAgents, handleGetEmailAgent, handleEmailCompose, handleEmailClassify, handleEmailDashboard } from './routes/email-agents.js';
import { handleDelegationFleet, handleDelegationScan, handleDelegationDispatch, handleDelegationHandoff, handleDelegationBriefing, handleListDelegationAgents, handleGetDelegationAgent } from './routes/delegation.js';
import { handleUpgradeSprint, handleListUpgradeAgents, handleGetUpgradeAgent, handleUpgradeExecute, handleUpgradePublish, handleUpgradeContent, handleUpgradeEnroll, handleUpgradeIntegrations } from './routes/upgrade.js';
import { handleScheduledEvent } from './services/upgrade-engine.js';
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
          version: '3.0.0',
          agents: 330,
          divisions: 11,
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
        version: '3.0.0',
        agents: 330,
        divisions: 11,
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    // ── Public routes (no auth) ──
    if (path === '/v1/leads/public' && method === 'POST') {
      return await handlePublicLead(request, env, ctx);
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

      // ── AI Delegation Agents ──
      if (path === '/v1/delegation/fleet' && method === 'GET') {
        return await handleDelegationFleet(env);
      }

      if (path === '/v1/delegation/scan' && method === 'POST') {
        return await handleDelegationScan(request, env, ctx);
      }

      if (path === '/v1/delegation/dispatch' && method === 'POST') {
        return await handleDelegationDispatch(request, env, ctx);
      }

      if (path === '/v1/delegation/handoff' && method === 'POST') {
        return await handleDelegationHandoff(request, env, ctx);
      }

      if (path === '/v1/delegation/briefing' && method === 'POST') {
        return await handleDelegationBriefing(request, env, ctx);
      }

      if (path === '/v1/delegation/agents' && method === 'GET') {
        return handleListDelegationAgents(url);
      }

      if (path.match(/^\/v1\/delegation\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/delegation/agents/')[1];
        return handleGetDelegationAgent(agentId);
      }

      // ── Systems Upgrade Agents ──
      if (path === '/v1/upgrade/sprint' && method === 'GET') {
        return handleUpgradeSprint();
      }

      if (path === '/v1/upgrade/agents' && method === 'GET') {
        return handleListUpgradeAgents(url);
      }

      if (path === '/v1/upgrade/integrations' && method === 'GET') {
        return handleUpgradeIntegrations(env);
      }

      if (path === '/v1/upgrade/execute' && method === 'POST') {
        return await handleUpgradeExecute(request, env, ctx);
      }

      if (path === '/v1/upgrade/publish' && method === 'POST') {
        return await handleUpgradePublish(request, env, ctx);
      }

      if (path === '/v1/upgrade/content' && method === 'POST') {
        return await handleUpgradeContent(request, env, ctx);
      }

      if (path === '/v1/upgrade/enroll' && method === 'POST') {
        return await handleUpgradeEnroll(request, env, ctx);
      }

      if (path.match(/^\/v1\/upgrade\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/upgrade/agents/')[1];
        return handleGetUpgradeAgent(agentId);
      }

      if (path === '/v1/audit' && method === 'GET') {
        return await handleAuditLog(url, env);
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

  /**
   * Cloudflare Workers Cron Trigger Handler.
   *
   * Schedule (wrangler.toml [triggers]):
   *   - Hourly: content scans, gap alerts, pipeline tracking, cleanup
   *
   * Cron dispatch logic lives in upgrade-engine.js handleScheduledEvent().
   */
  async scheduled(event, env, ctx) {
    try {
      const results = await handleScheduledEvent(env, ctx, event.scheduledTime);
      console.log(`[CK Cron] Executed ${results.length} scheduled tasks at ${new Date(event.scheduledTime).toISOString()}`);
    } catch (err) {
      console.error(`[CK Cron Error] ${err.message}`);
    }
  },
};
