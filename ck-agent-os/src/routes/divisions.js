/**
 * Coastal Key Agent OS — Division Management Routes
 * GET /v1/divisions          — List all 8 divisions
 * GET /v1/divisions/:code    — Division detail with agents
 */

import agentRegistry from '../../config/agent-registry.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

const DIVISION_META = {
  EXC: {
    name: 'Executive Command', color: '#9B59B6', tier: 1,
    mission: 'Fleet-wide strategic coordination, governance enforcement, and capital allocation. The brain of the 40-agent operating system.',
    capabilities: ['Strategic planning', 'Governance enforcement', 'Risk assessment', 'Capital allocation', 'Performance analytics', 'CEO interface']
  },
  SEN: {
    name: 'Sentinel Operations', color: '#E74C3C', tier: 2,
    mission: 'High-volume lead generation, qualification, and deal acceleration for luxury real estate across the Treasure Coast and Palm Beach markets.',
    capabilities: ['Campaign management', 'Lead generation', 'Lead enrichment', 'Deal acceleration', 'Nurture campaigns', 'Lead qualification']
  },
  OPS: {
    name: 'Operations', color: '#3498DB', tier: 3,
    mission: 'Workflow orchestration, property management, quality assurance, and documentation for industrial-grade operational excellence.',
    capabilities: ['Workflow orchestration', 'Property management', 'Task dispatch', 'Quality assurance', 'Documentation', 'SLA monitoring']
  },
  INT: {
    name: 'Intelligence', color: '#1ABC9C', tier: 3,
    mission: 'Market research, competitive analysis, and predictive modeling to inform billion-dollar positioning decisions.',
    capabilities: ['Market research', 'Data analytics', 'Competitive intelligence', 'Predictive modeling', 'Trend forecasting']
  },
  MKT: {
    name: 'Marketing', color: '#2ECC71', tier: 2,
    mission: 'Luxury-grade content creation and multi-channel brand management positioning Coastal Key as the premier enterprise.',
    capabilities: ['Content creation', 'Video production', 'Podcast production', 'SEO optimization', 'Social media', 'Campaign strategy']
  },
  FIN: {
    name: 'Finance', color: '#F1C40F', tier: 2,
    mission: 'P&L reporting, revenue operations, investor relations, and treasury management for investor-ready financial governance.',
    capabilities: ['P&L reporting', 'Revenue operations', 'Investor relations', 'Financial compliance', 'Cash management']
  },
  VEN: {
    name: 'Vendor & Partnerships', color: '#ECF0F1', tier: 3,
    mission: 'Vendor ecosystem management, procurement, and strategic partnerships for luxury-grade service delivery.',
    capabilities: ['Vendor management', 'Procurement', 'Partnership development', 'Contractor management']
  },
  TEC: {
    name: 'Technology', color: '#2980B9', tier: 4,
    mission: 'Enterprise-grade platform architecture, CI/CD, security, and integration management for 99.9% uptime.',
    capabilities: ['Platform architecture', 'DevOps/CI-CD', 'Security', 'Integration management']
  }
};

export async function handleDivisionRoutes(request, env, systems, path) {
  // GET /v1/divisions
  if (path === '/v1/divisions' && request.method === 'GET') {
    const divisions = Object.entries(DIVISION_META).map(([code, meta]) => {
      const agents = agentRegistry.agents.filter(a => a.division === code);
      return {
        code,
        ...meta,
        agent_count: agents.length,
        agents: agents.map(a => ({ id: a.id, codename: a.codename, tier: a.tier, role: a.role })),
        status: 'operational',
        health_percent: 100
      };
    });

    return json({
      total_divisions: 8,
      hierarchy: {
        tier_1_executive: ['EXC'],
        tier_2_revenue: ['SEN', 'MKT', 'FIN'],
        tier_3_operations: ['OPS', 'INT', 'VEN'],
        tier_4_infrastructure: ['TEC']
      },
      divisions
    });
  }

  // GET /v1/divisions/:code
  const divMatch = path.match(/^\/v1\/divisions\/([A-Za-z]+)$/);
  if (divMatch && request.method === 'GET') {
    const code = divMatch[1].toUpperCase();
    const meta = DIVISION_META[code];

    if (!meta) return json({ error: `Division not found: ${code}` }, 404);

    const agents = agentRegistry.agents.filter(a => a.division === code);

    return json({
      code,
      ...meta,
      agent_count: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        codename: a.codename,
        name: a.name,
        tier: a.tier,
        role: a.role,
        status: 'active',
        risk_level: a.risk_level,
        capabilities: a.capabilities,
        kpis: a.kpis,
        integrations: a.integrations
      })),
      status: 'operational',
      health_percent: 100,
      governance: 'Sovereign Compendium Active',
      timestamp: new Date().toISOString()
    });
  }

  return json({ error: 'Division route not found', path }, 404);
}
