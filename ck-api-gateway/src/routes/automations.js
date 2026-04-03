/**
 * Automation Routes — Management API for the workflow engine.
 *
 * Replaces the Zapier dashboard with native endpoints:
 *
 *   GET  /v1/automations                — List all workflows
 *   GET  /v1/automations/:id            — Get workflow details
 *   POST /v1/automations/run/:id        — Manually trigger a workflow
 *   GET  /v1/automations/executions     — List recent executions
 *   GET  /v1/automations/executions/:id — Get execution details
 *   GET  /v1/automations/dashboard      — Automation operations dashboard
 *   POST /v1/automations/poll           — Manually trigger a poll cycle
 */

import { getAllWorkflows, getWorkflow, getWorkflowSummary, getWorkflowCount } from '../engine/registry.js';
import { executeWorkflow } from '../engine/executor.js';
import { listExecutions, getExecution } from '../engine/logger.js';
import { runPollCycle } from '../engine/polling.js';
import { getAvailableActions } from '../engine/actions.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

/**
 * GET /v1/automations — List all registered workflows.
 */
export function handleListAutomations(url) {
  const triggerType = url.searchParams.get('trigger');
  let workflows = getWorkflowSummary();

  if (triggerType) {
    workflows = workflows.filter(w => w.trigger === triggerType);
  }

  return jsonResponse({
    workflows,
    total: workflows.length,
    availableActions: getAvailableActions(),
    triggerTypes: ['webhook', 'schedule', 'poll'],
  });
}

/**
 * GET /v1/automations/:id — Get full workflow definition.
 */
export function handleGetAutomation(workflowId) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    return errorResponse(`Workflow "${workflowId}" not found.`, 404);
  }

  return jsonResponse({
    ...workflow,
    stepCount: workflow.steps.length,
    actions: workflow.steps.map(s => s.action),
  });
}

/**
 * POST /v1/automations/run/:id — Manually trigger a workflow.
 *
 * Body: trigger data (e.g. { recordId: "recXXX" })
 * This replaces Zapier's "Test" button and manual trigger feature.
 */
export async function handleRunAutomation(request, env, ctx, workflowId) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    return errorResponse(`Workflow "${workflowId}" not found.`, 404);
  }

  let triggerData;
  try {
    triggerData = await request.json();
  } catch {
    return errorResponse('Invalid JSON body. Provide trigger data (e.g. { "recordId": "recXXX" }).', 400);
  }

  // Add timestamp helpers to trigger data
  triggerData.now = new Date().toISOString();
  triggerData.today = new Date().toISOString().split('T')[0];
  triggerData.tomorrow = addDays(1);
  triggerData.plus90days = addDays(90);

  const execution = await executeWorkflow(workflow, triggerData, env, ctx);

  return jsonResponse({
    execution: {
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflowName,
      status: execution.status,
      steps: execution.steps,
      duration: execution.duration,
      error: execution.error,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
    },
  });
}

/**
 * GET /v1/automations/executions — List recent workflow executions.
 */
export async function handleListExecutions(url, env) {
  const workflowId = url.searchParams.get('workflowId');
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  const executions = await listExecutions(env, { workflowId, limit });

  return jsonResponse({
    executions,
    total: executions.length,
  });
}

/**
 * GET /v1/automations/executions/:id — Get full execution details.
 */
export async function handleGetExecution(env, workflowId, executionId) {
  const execution = await getExecution(env, workflowId, executionId);
  if (!execution) {
    return errorResponse('Execution not found.', 404);
  }

  return jsonResponse(execution);
}

/**
 * GET /v1/automations/dashboard — Automation operations dashboard.
 * Provides a combined view of all workflows, recent executions, and system health.
 */
export async function handleAutomationDashboard(env) {
  const workflows = getWorkflowSummary();
  const recentExecutions = await listExecutions(env, { limit: 10 });

  const byTrigger = { webhook: 0, schedule: 0, poll: 0 };
  const byStatus = { enabled: 0, disabled: 0 };
  for (const w of workflows) {
    byTrigger[w.trigger] = (byTrigger[w.trigger] || 0) + 1;
    if (w.enabled) byStatus.enabled++;
    else byStatus.disabled++;
  }

  const executionStats = {
    total: recentExecutions.length,
    completed: recentExecutions.filter(e => e.status === 'completed').length,
    failed: recentExecutions.filter(e => e.status === 'failed').length,
    avgDuration: recentExecutions.length > 0
      ? Math.round(recentExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / recentExecutions.length)
      : 0,
  };

  return jsonResponse({
    engine: {
      status: 'operational',
      version: '1.0.0',
      totalWorkflows: getWorkflowCount(),
      byTrigger,
      byStatus,
      availableActions: getAvailableActions().length,
    },
    workflows,
    recentExecutions,
    executionStats,
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /v1/automations/poll — Manually trigger a poll cycle.
 * Useful for testing and debugging poll-triggered workflows.
 */
export async function handleManualPoll(env, ctx) {
  const result = await runPollCycle(env, ctx);
  return jsonResponse(result);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function addDays(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}
