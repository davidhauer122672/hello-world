/**
 * Coastal Key Agent OS — Task Dispatch Routes
 * POST /v1/tasks/dispatch  — Dispatch a task to the fleet
 * GET  /v1/tasks/queue     — View task queue
 * GET  /v1/tasks/:id       — Get task status
 * POST /v1/tasks/:id/complete — Mark task complete
 */

import agentRegistry from '../../config/agent-registry.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

const TASK_DIVISION_MAP = {
  'lead_generation': 'SEN', 'lead_enrichment': 'SEN', 'cold_outreach': 'SEN',
  'deal_acceleration': 'SEN', 'nurture_campaign': 'SEN', 'lead_qualification': 'SEN',
  'market_research': 'INT', 'competitive_analysis': 'INT', 'forecasting': 'INT',
  'data_analytics': 'INT', 'predictive_modeling': 'INT',
  'content_creation': 'MKT', 'video_production': 'MKT', 'podcast_production': 'MKT',
  'seo_optimization': 'MKT', 'social_media': 'MKT', 'campaign_strategy': 'MKT',
  'property_management': 'OPS', 'maintenance': 'OPS', 'task_dispatch': 'OPS',
  'quality_assurance': 'OPS', 'documentation': 'OPS', 'workflow_orchestration': 'OPS',
  'financial_report': 'FIN', 'investor_relations': 'FIN', 'revenue_ops': 'FIN',
  'expense_audit': 'FIN', 'cash_management': 'FIN',
  'vendor_management': 'VEN', 'procurement': 'VEN', 'partnership': 'VEN',
  'contractor_management': 'VEN',
  'deployment': 'TEC', 'security_scan': 'TEC', 'integration': 'TEC',
  'platform_architecture': 'TEC',
  'strategic_planning': 'EXC', 'governance': 'EXC', 'capital_allocation': 'EXC',
  'performance_review': 'EXC', 'risk_assessment': 'EXC'
};

export async function handleTaskRoutes(request, env, systems, path) {
  const { dispatcher, governance, airtable, slack } = systems;

  // POST /v1/tasks/dispatch
  if (path === '/v1/tasks/dispatch' && request.method === 'POST') {
    const body = await request.json();
    const taskId = `TASK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Find best agent
    const division = TASK_DIVISION_MAP[body.type] || 'EXC';
    const divAgents = agentRegistry.agents.filter(a => a.division === division);
    const assignedAgent = divAgents[0];

    if (!assignedAgent) {
      return json({ error: `No agent available for task type: ${body.type}` }, 400);
    }

    // Governance check
    const govResult = await governance.evaluateAction({
      agentId: assignedAgent.id,
      type: body.type,
      riskLevel: body.riskLevel || 1,
      payload: body,
      capitalImpact: body.capitalImpact || 'Operational Efficiency'
    });

    if (!govResult.approved) {
      return json({ error: 'Governance denied', violations: govResult.violations }, 403);
    }

    // Persist to KV
    const task = {
      id: taskId,
      type: body.type,
      title: body.title || body.type,
      description: body.description || '',
      priority: body.priority || 'standard',
      assignedAgent: assignedAgent.id,
      agentCodename: assignedAgent.codename,
      division,
      status: 'queued',
      riskLevel: body.riskLevel || 1,
      capitalImpact: body.capitalImpact || 'Operational Efficiency',
      governance: 'approved',
      createdAt: new Date().toISOString()
    };

    if (env.TASK_QUEUE) {
      await env.TASK_QUEUE.put(taskId, JSON.stringify(task), { expirationTtl: 7 * 86400 });
    }

    return json({
      dispatched: true,
      task,
      message: `Task ${taskId} assigned to ${assignedAgent.codename} (${assignedAgent.id})`
    });
  }

  // GET /v1/tasks/queue
  if (path === '/v1/tasks/queue' && request.method === 'GET') {
    const tasks = [];
    if (env.TASK_QUEUE) {
      const list = await env.TASK_QUEUE.list({ limit: 100 });
      for (const key of list.keys) {
        const value = await env.TASK_QUEUE.get(key.name);
        if (value) tasks.push(JSON.parse(value));
      }
    }
    return json({ total: tasks.length, tasks });
  }

  // GET /v1/tasks/:id
  const taskMatch = path.match(/^\/v1\/tasks\/([^/]+)$/);
  if (taskMatch && request.method === 'GET') {
    const taskId = taskMatch[1];
    if (env.TASK_QUEUE) {
      const value = await env.TASK_QUEUE.get(taskId);
      if (value) return json(JSON.parse(value));
    }
    return json({ error: `Task not found: ${taskId}` }, 404);
  }

  // POST /v1/tasks/:id/complete
  const completeMatch = path.match(/^\/v1\/tasks\/([^/]+)\/complete$/);
  if (completeMatch && request.method === 'POST') {
    const taskId = completeMatch[1];
    if (env.TASK_QUEUE) {
      const value = await env.TASK_QUEUE.get(taskId);
      if (value) {
        const task = JSON.parse(value);
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        await env.TASK_QUEUE.put(taskId, JSON.stringify(task));
        return json({ completed: true, task });
      }
    }
    return json({ error: `Task not found: ${taskId}` }, 404);
  }

  return json({ error: 'Task route not found', path }, 404);
}
