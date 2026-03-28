/**
 * Coastal Key Agent OS — Governance & Compliance Routes
 * GET  /v1/governance/report     — Full compliance report
 * GET  /v1/governance/audit      — Recent audit log
 * POST /v1/governance/evaluate   — Evaluate an action against governance
 * POST /v1/governance/quality-gate — Submit quality gate review
 * GET  /v1/governance/policies   — View active policies
 */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function handleGovernanceRoutes(request, env, systems, path) {
  const { governance } = systems;

  // GET /v1/governance/report
  if (path === '/v1/governance/report' && request.method === 'GET') {
    const report = governance.getComplianceReport();
    return json({
      compendium: 'Sovereign Governance Compendium v1.0.0',
      ceo_oversight: {
        name: 'David Hauer',
        decision_authority: '1%',
        escalation_threshold: 'Level 4 Critical — Capital >$500K, Legal exposure, Brand-defining'
      },
      report,
      risk_framework: {
        level_1: { name: 'Routine', approval: 'Agent self-authorized' },
        level_2: { name: 'Elevated', approval: 'Division Controller' },
        level_3: { name: 'High', approval: 'Master Orchestrator' },
        level_4: { name: 'Critical', approval: 'CEO David Hauer' }
      },
      quality_gates: {
        stage_1: 'Self-Review (Originating Agent)',
        stage_2: 'Division Review (Division Controller)',
        stage_3: 'Final Approval (Master Orchestrator)',
        minimum_score: 8.5
      },
      compression_mandate: '5-year goals in 6 months (10:1 ratio)',
      timestamp: new Date().toISOString()
    });
  }

  // GET /v1/governance/audit
  if (path === '/v1/governance/audit' && request.method === 'GET') {
    const entries = [];

    if (env.AUDIT_LOG) {
      const url = new URL(request.url);
      const prefix = url.searchParams.get('prefix') || '';
      const limit = parseInt(url.searchParams.get('limit') || '50');

      const list = await env.AUDIT_LOG.list({ prefix, limit: Math.min(limit, 200) });

      for (const key of list.keys) {
        const value = await env.AUDIT_LOG.get(key.name);
        if (value) {
          try {
            entries.push({ key: key.name, ...JSON.parse(value) });
          } catch {
            entries.push({ key: key.name, raw: value });
          }
        }
      }
    }

    return json({
      audit_log: entries,
      total: entries.length,
      retention_days: 90,
      timestamp: new Date().toISOString()
    });
  }

  // POST /v1/governance/evaluate
  if (path === '/v1/governance/evaluate' && request.method === 'POST') {
    const body = await request.json();
    const result = await governance.evaluateAction(body);
    return json({
      evaluation: result,
      compendium: 'Sovereign Governance Compendium v1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // POST /v1/governance/quality-gate
  if (path === '/v1/governance/quality-gate' && request.method === 'POST') {
    const body = await request.json();
    const result = await governance.passQualityGate(
      body.gateId, body.stage, body.reviewer, body.score
    );
    return json({
      quality_gate: result,
      timestamp: new Date().toISOString()
    });
  }

  // GET /v1/governance/policies
  if (path === '/v1/governance/policies' && request.method === 'GET') {
    return json({
      policies: [
        { id: 'POL-001', name: 'CEO Decision Reduction Protocol', status: 'active', ceo_authority: '1%' },
        { id: 'POL-002', name: 'Capital Growth Priority', status: 'active' },
        { id: 'POL-003', name: 'International Expansion Protocol', status: 'active' },
        { id: 'POL-004', name: 'Autonomous Operations Charter', status: 'active', permissions: 'Full' },
        { id: 'POL-005', name: 'Quality Gate Protocol', status: 'active', stages: 3 },
        { id: 'POL-006', name: '5-Year Compression Timeline', status: 'active', ratio: '10:1' }
      ],
      governance_principles: [
        { id: 'SGC-001', name: 'Autonomous Execution with Accountability' },
        { id: 'SGC-002', name: 'Capital Growth Mandate' },
        { id: 'SGC-003', name: 'Industrial-Grade Reliability' },
        { id: 'SGC-004', name: 'Luxury-Grade Quality Standards' },
        { id: 'SGC-005', name: 'Risk Mitigation as Core Function' },
        { id: 'SGC-006', name: '5-Year Goals in 6-Month Execution' },
        { id: 'SGC-007', name: 'Inter-Agent Cooperation Protocol' },
        { id: 'SGC-008', name: 'Continuous Self-Improvement' }
      ]
    });
  }

  return json({ error: 'Governance route not found', path }, 404);
}
