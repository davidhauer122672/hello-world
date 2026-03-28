/**
 * CK API Gateway — Coastal Key Central Inference Router
 *
 * Routes:
 *   POST /v1/inference          — Claude inference with KV caching + audit logging
 *   POST /v1/leads              — Create lead in Airtable Leads table
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
 *   GET  /v1/health             — Health check
 *   GET  /v1/audit              — Retrieve recent audit log entries
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 */

import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rate-limit.js';
import { handleInference } from './routes/inference.js';
import { handleCreateLead, handleGetLead, handleEnrichLead } from './routes/leads.js';
import { handleRetellWebhook } from './routes/retell.js';
import { handleContentGenerate } from './routes/content.js';
import { handleAuditLog } from './routes/audit.js';
import { handleListAgents, handleGetAgent, handleAgentAction, handleAgentMetrics, handleDashboard } from './routes/agents.js';
import { handleScaa1BattlePlan, handleWf3InvestorEscalation, handleWf4LongTailNurture } from './routes/workflows.js';
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
      return jsonResponse({
        status: 'operational',
        service: 'ck-api-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
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
};
