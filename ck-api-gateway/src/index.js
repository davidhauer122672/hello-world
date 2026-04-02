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
 *   GET  /v1/sentinel/deployment         — Project Sentinel deployment status + blockers
 *   POST /v1/sentinel/deployment/blocker  — Resolve a pre-launch blocker
 *   GET  /v1/sentinel/sequence           — 6-touch 14-day sequence config
 *   POST /v1/sentinel/sequence/advance    — Advance lead to next sequence step
 *   POST /v1/sentinel/investor-flag       — Evaluate and set investor flag
 *   GET  /v1/sentinel/kpis               — Live KPI snapshot vs targets
 *   POST /v1/sentinel/go-live            — Authorize Step 10 activation
 *   GET  /v1/security/dashboard        — Sovereign Shield security posture
 *   GET  /v1/security/events           — Recent security events
 *   POST /v1/security/scan             — On-demand payload/URL security scan
 *   GET  /v1/security/compliance       — Compliance status across all vectors
 *   POST /v1/security/incident         — Report a security incident
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 */

import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rate-limit.js';
import { securityInspect, hardenResponse } from './middleware/security.js';
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
import { handleSentinelDeployment, handleResolveBlocker, handleSentinelSequence, handleSequenceAdvance, handleInvestorFlagEvaluate, handleSentinelKpis, handleSentinelGoLive } from './routes/project-sentinel.js';
import { handleSecurityDashboard, handleSecurityEvents, handleSecurityScan, handleSecurityCompliance, handleSecurityIncident } from './routes/security-ops.js';
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
          agents: 250,
          divisions: 8,
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
        agents: 290,
        divisions: 9,
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

    // ── Sovereign Shield security inspection ──
    const securityError = await securityInspect(request, env, ctx);
    if (securityError) return hardenResponse(securityError);

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

      // ── Project Sentinel ──
      if (path === '/v1/sentinel/deployment' && method === 'GET') {
        return await handleSentinelDeployment(env);
      }

      if (path === '/v1/sentinel/deployment/blocker' && method === 'POST') {
        return await handleResolveBlocker(request, env, ctx);
      }

      if (path === '/v1/sentinel/sequence' && method === 'GET') {
        return await handleSentinelSequence();
      }

      if (path === '/v1/sentinel/sequence/advance' && method === 'POST') {
        return await handleSequenceAdvance(request, env, ctx);
      }

      if (path === '/v1/sentinel/investor-flag' && method === 'POST') {
        return await handleInvestorFlagEvaluate(request, env, ctx);
      }

      if (path === '/v1/sentinel/kpis' && method === 'GET') {
        return await handleSentinelKpis(env);
      }

      if (path === '/v1/sentinel/go-live' && method === 'POST') {
        return await handleSentinelGoLive(request, env, ctx);
      }

      if (path === '/v1/audit' && method === 'GET') {
        return await handleAuditLog(url, env);
      }

      // ── Sovereign Shield Security Operations ──
      if (path === '/v1/security/dashboard' && method === 'GET') {
        return await handleSecurityDashboard(env);
      }

      if (path === '/v1/security/events' && method === 'GET') {
        return await handleSecurityEvents(url, env);
      }

      if (path === '/v1/security/scan' && method === 'POST') {
        return await handleSecurityScan(request, env, ctx);
      }

      if (path === '/v1/security/compliance' && method === 'GET') {
        return handleSecurityCompliance();
      }

      if (path === '/v1/security/incident' && method === 'POST') {
        return await handleSecurityIncident(request, env, ctx);
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
