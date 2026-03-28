/**
 * Coastal Key Agent OS — Agent Management Routes
 * GET    /v1/agents           — List all agents (filterable)
 * GET    /v1/agents/:id       — Get agent detail
 * POST   /v1/agents/:id/action — Execute agent action
 * GET    /v1/agents/:id/kpis  — Get agent KPIs
 */

import agentRegistry from '../../config/agent-registry.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function handleAgentRoutes(request, env, systems, path) {
  const { governance, lifecycle, slack } = systems;
  const url = new URL(request.url);

  // GET /v1/agents — List all agents with optional filters
  if (path === '/v1/agents' && request.method === 'GET') {
    let agents = agentRegistry.agents;

    const division = url.searchParams.get('division');
    const tier = url.searchParams.get('tier');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    if (division) agents = agents.filter(a => a.division === division.toUpperCase());
    if (tier) agents = agents.filter(a => a.tier === tier.toUpperCase());
    if (search) {
      const q = search.toLowerCase();
      agents = agents.filter(a =>
        a.codename.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }

    return json({
      total: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        codename: a.codename,
        name: a.name,
        division: a.division,
        division_name: a.division_name,
        tier: a.tier,
        role: a.role,
        status: status || 'active',
        risk_level: a.risk_level
      }))
    });
  }

  // Match /v1/agents/:id patterns
  const agentMatch = path.match(/^\/v1\/agents\/([^/]+)$/);
  const actionMatch = path.match(/^\/v1\/agents\/([^/]+)\/action$/);
  const kpiMatch = path.match(/^\/v1\/agents\/([^/]+)\/kpis$/);

  // GET /v1/agents/:id — Agent detail
  if (agentMatch && request.method === 'GET') {
    const agentId = agentMatch[1];
    const agent = agentRegistry.agents.find(a =>
      a.id === agentId || a.codename.toLowerCase() === agentId.toLowerCase()
    );

    if (!agent) return json({ error: `Agent not found: ${agentId}` }, 404);

    return json({
      ...agent,
      status: 'active',
      health: { score: 100, uptime_percent: 99.9, last_check: new Date().toISOString() },
      governance: {
        compendium: 'Sovereign Governance Compendium v1.0.0',
        rules_applied: agent.governance_rules,
        risk_level: agent.risk_level,
        ceo_oversight: agent.risk_level >= 4 ? 'Required' : 'Not Required'
      }
    });
  }

  // POST /v1/agents/:id/action — Execute action on agent
  if (actionMatch && request.method === 'POST') {
    const agentId = actionMatch[1];
    const agent = agentRegistry.agents.find(a => a.id === agentId);

    if (!agent) return json({ error: `Agent not found: ${agentId}` }, 404);

    const body = await request.json();
    const action = body.action;

    // Governance check for agent actions
    const govResult = await governance.evaluateAction({
      agentId: agentId,
      type: `agent_${action}`,
      riskLevel: 1,
      payload: body,
      capitalImpact: 'Operational Efficiency'
    });

    if (!govResult.approved) {
      return json({ error: 'Governance check failed', violations: govResult.violations }, 403);
    }

    const validActions = ['activate', 'pause', 'restart', 'train', 'decommission'];
    if (!validActions.includes(action)) {
      return json({ error: `Invalid action: ${action}. Valid: ${validActions.join(', ')}` }, 400);
    }

    // Persist state change to KV
    if (env.AGENT_STATE) {
      await env.AGENT_STATE.put(agentId, JSON.stringify({
        status: action === 'activate' ? 'active' : action === 'pause' ? 'paused' : action,
        updatedAt: new Date().toISOString(),
        updatedBy: body.updatedBy || 'api'
      }));
    }

    // Notify Slack
    await slack.notifyAgentStatusChange(agent, 'active', action === 'activate' ? 'active' : action);

    return json({
      agent: agentId,
      codename: agent.codename,
      action,
      result: 'success',
      governance: 'approved',
      timestamp: new Date().toISOString()
    });
  }

  // GET /v1/agents/:id/kpis — Agent KPIs
  if (kpiMatch && request.method === 'GET') {
    const agentId = kpiMatch[1];
    const agent = agentRegistry.agents.find(a => a.id === agentId);

    if (!agent) return json({ error: `Agent not found: ${agentId}` }, 404);

    return json({
      agent: agentId,
      codename: agent.codename,
      kpis: agent.kpis,
      performance: {
        tasks_completed: 0,
        success_rate: 100,
        avg_response_time_ms: 0,
        quality_score: 10,
        uptime_percent: 99.9
      },
      period: 'current_session',
      timestamp: new Date().toISOString()
    });
  }

  return json({ error: 'Agent route not found', path }, 404);
}
