/**
 * Coastal Key Agent OS — Fleet Management Routes
 * GET /v1/fleet/status — Full fleet status
 * GET /v1/fleet/health — System health dashboard
 * GET /v1/fleet/metrics — Fleet-wide performance metrics
 */

import agentRegistry from '../../config/agent-registry.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function handleFleetRoutes(request, env, systems, path) {
  const { orchestrator, lifecycle, governance } = systems;

  // GET /v1/fleet/status
  if (path === '/v1/fleet/status' && request.method === 'GET') {
    const agents = agentRegistry.agents.map(agent => ({
      id: agent.id,
      codename: agent.codename,
      division: agent.division,
      division_name: agent.division_name,
      tier: agent.tier,
      role: agent.role,
      status: 'active',
      risk_level: agent.risk_level
    }));

    const divisionSummary = {};
    agents.forEach(a => {
      if (!divisionSummary[a.division]) {
        divisionSummary[a.division] = { name: a.division_name, total: 0, active: 0 };
      }
      divisionSummary[a.division].total++;
      if (a.status === 'active') divisionSummary[a.division].active++;
    });

    return json({
      fleet: {
        total_agents: agentRegistry.total_agents,
        active: agents.filter(a => a.status === 'active').length,
        standby: agents.filter(a => a.status === 'standby').length,
        divisions: divisionSummary,
        governance: 'Sovereign Compendium Active',
        ceo_oversight: '1% — David Hauer'
      },
      agents
    });
  }

  // GET /v1/fleet/health
  if (path === '/v1/fleet/health' && request.method === 'GET') {
    const agents = agentRegistry.agents;
    const totalAgents = agents.length;
    const activeCount = totalAgents; // All initialized as active

    return json({
      system_health: {
        overall_percent: Math.round((activeCount / totalAgents) * 100),
        uptime_target: '99.9%',
        agents_total: totalAgents,
        agents_active: activeCount,
        agents_standby: 0,
        agents_error: 0,
        governance_status: 'enforced',
        quality_gate_status: 'active',
        risk_framework_status: 'enforced'
      },
      divisions: Object.entries(agentRegistry.divisions).map(([code, count]) => ({
        code,
        agent_count: count,
        health_percent: 100,
        status: 'operational'
      })),
      compliance: governance.getComplianceReport(),
      timestamp: new Date().toISOString()
    });
  }

  // GET /v1/fleet/metrics
  if (path === '/v1/fleet/metrics' && request.method === 'GET') {
    return json({
      metrics: {
        total_agents: 40,
        total_divisions: 8,
        tasks_dispatched: 0,
        tasks_completed: 0,
        tasks_failed: 0,
        avg_response_time_ms: 0,
        governance_violations: 0,
        quality_gates_passed: 0,
        api_tokens_used: 0,
        uptime_percent: 100,
        capital_impact: {
          direct_revenue: 0,
          cost_optimization: 0,
          market_expansion: 0,
          asset_appreciation: 0,
          risk_reduction: 0,
          operational_efficiency: 0
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  return json({ error: 'Fleet route not found', path }, 404);
}
