/**
 * Coastal Key — Agent Operating System
 * Main Cloudflare Worker Entry Point
 *
 * 40 Autonomous AI Agents | 8 Divisions | Sovereign Governance Compendium
 * CEO David Hauer — 1% Decision Authority
 *
 * All agents are granted full autonomous operating authority within
 * governance guardrails. Terminal.app execution permissions granted.
 */

import { Orchestrator } from '../core/orchestrator.js';
import { GovernanceEngine } from '../core/governance-engine.js';
import { TaskDispatcher } from '../core/task-dispatcher.js';
import { MessageBus } from '../core/message-bus.js';
import { LifecycleManager } from '../core/lifecycle-manager.js';
import { InferenceEngine } from '../services/inference-engine.js';
import { AirtableSyncService } from '../services/airtable-sync.js';
import { SlackNotifier } from '../services/slack-notifier.js';

import { handleFleetRoutes } from './routes/fleet.js';
import { handleAgentRoutes } from './routes/agents.js';
import { handleWorkflowRoutes } from './routes/workflows.js';
import { handleGovernanceRoutes } from './routes/governance.js';
import { handleTaskRoutes } from './routes/tasks.js';
import { handleDivisionRoutes } from './routes/divisions.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Powered-By': 'Coastal Key Agent OS v1.0.0',
      'X-Agents-Active': '40',
      'X-Governance': 'Sovereign Compendium Enforced'
    }
  });
}

function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  return token === env.WORKER_AUTH_TOKEN;
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check (no auth required)
    if (path === '/health' || path === '/') {
      return jsonResponse({
        service: 'Coastal Key Agent OS',
        version: '1.0.0',
        status: 'operational',
        agents: 40,
        divisions: 8,
        governance: 'Sovereign Compendium Active',
        ceo: 'David Hauer (1% Decision Authority)',
        timestamp: new Date().toISOString()
      });
    }

    // Authenticate all other routes
    if (!authenticate(request, env)) {
      return jsonResponse({ error: 'Unauthorized', message: 'Valid Bearer token required' }, 401);
    }

    // Initialize core systems
    const orchestrator = new Orchestrator(env);
    const governance = new GovernanceEngine(env);
    const dispatcher = new TaskDispatcher(env);
    const messageBus = new MessageBus(env);
    const lifecycle = new LifecycleManager(env);
    const inference = new InferenceEngine(env);
    const airtable = new AirtableSyncService(env);
    const slack = new SlackNotifier(env);

    const systems = { orchestrator, governance, dispatcher, messageBus, lifecycle, inference, airtable, slack };

    try {
      // Route: Fleet Management
      if (path.startsWith('/v1/fleet')) {
        return await handleFleetRoutes(request, env, systems, path);
      }

      // Route: Agent Management
      if (path.startsWith('/v1/agents')) {
        return await handleAgentRoutes(request, env, systems, path);
      }

      // Route: Workflow Execution
      if (path.startsWith('/v1/workflows')) {
        return await handleWorkflowRoutes(request, env, systems, path);
      }

      // Route: Governance & Compliance
      if (path.startsWith('/v1/governance')) {
        return await handleGovernanceRoutes(request, env, systems, path);
      }

      // Route: Task Dispatch
      if (path.startsWith('/v1/tasks')) {
        return await handleTaskRoutes(request, env, systems, path);
      }

      // Route: Division Management
      if (path.startsWith('/v1/divisions')) {
        return await handleDivisionRoutes(request, env, systems, path);
      }

      // Route: System Dashboard
      if (path === '/v1/dashboard') {
        const fleet = orchestrator.getFleetStatus();
        const health = orchestrator.getSystemHealth();
        const compliance = governance.getComplianceReport();
        const taskMetrics = dispatcher.getMetrics();

        return jsonResponse({
          fleet,
          health,
          compliance,
          taskMetrics,
          timestamp: new Date().toISOString()
        });
      }

      // Route: Broadcast Directive
      if (path === '/v1/broadcast' && request.method === 'POST') {
        const body = await request.json();
        const result = orchestrator.broadcastDirective(body.directive);
        await slack.notifyWorkflowComplete({
          name: 'Governance Directive Broadcast',
          agents: ['ALL — 40 Agents'],
          durationMs: 0,
          result: body.directive
        });
        return jsonResponse({ broadcast: true, directive: body.directive, agents_notified: 40 });
      }

      // Route: CEO Escalation
      if (path === '/v1/escalate' && request.method === 'POST') {
        const body = await request.json();
        await slack.notifyCEOEscalation(body);
        return jsonResponse({
          escalated: true,
          level: 4,
          ceo: 'David Hauer',
          event: body,
          message: 'Level 4 Critical event escalated to CEO. Awaiting approval.'
        });
      }

      // Route: Inference (AI processing for any agent)
      if (path === '/v1/inference' && request.method === 'POST') {
        const body = await request.json();

        // Governance check
        const govResult = await governance.evaluateAction({
          agentId: body.agentId || 'CK-EXC-001',
          type: 'inference',
          riskLevel: body.riskLevel || 1,
          payload: body,
          capitalImpact: body.capitalImpact || 'Operational Efficiency'
        });

        if (!govResult.approved) {
          return jsonResponse({ error: 'Governance check failed', violations: govResult.violations }, 403);
        }

        const result = await inference.infer({
          agentId: body.agentId,
          division: body.division || 'EXC',
          prompt: body.prompt,
          tier: body.tier || 'standard',
          cacheKey: body.cacheKey,
          maxTokens: body.maxTokens || 4096
        });

        // Log to Airtable
        ctx.waitUntil(airtable.logAgentAction(
          body.agentId || 'CK-EXC-001',
          'inference',
          body.prompt?.slice(0, 200),
          result.response?.slice(0, 200),
          result.tokens?.input + result.tokens?.output
        ));

        return jsonResponse(result);
      }

      return jsonResponse({ error: 'Not Found', path }, 404);

    } catch (error) {
      console.error('Agent OS Error:', error);

      // Log error to audit
      if (env.AUDIT_LOG) {
        ctx.waitUntil(env.AUDIT_LOG.put(
          `error:${Date.now()}`,
          JSON.stringify({ error: error.message, path, timestamp: new Date().toISOString() }),
          { expirationTtl: 90 * 86400 }
        ));
      }

      return jsonResponse({ error: 'Internal Server Error', message: error.message }, 500);
    }
  }
};
