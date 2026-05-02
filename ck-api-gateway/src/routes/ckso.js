/**
 * CKSO Routes — Coastal Key Sovereign OS
 *
 *   GET  /v1/ckso/dashboard           — Full system dashboard
 *   GET  /v1/ckso/app/templates       — List app templates
 *   POST /v1/ckso/app/generate        — Generate application from spec
 *   GET  /v1/ckso/data/tables         — List wired data tables
 *   POST /v1/ckso/data/schema         — Generate database schema
 *   GET  /v1/ckso/workflow/triggers    — List available triggers
 *   GET  /v1/ckso/workflow/actions     — List available actions
 *   POST /v1/ckso/workflow/generate    — Generate automation workflow
 *   GET  /v1/ckso/analytics/metrics    — List all metric definitions
 *   POST /v1/ckso/analytics/report     — Generate analytics report
 *   POST /v1/ckso/ai/command           — Execute AI command
 *   GET  /v1/ckso/governance/status    — Governance enforcement status
 *   GET  /v1/ckso/governance/roles     — Role definitions
 */

import {
  getCKSODashboard,
  APP_TEMPLATES, generateApp,
  DATA_ENGINE_CONFIG, generateSchema,
  WORKFLOW_TRIGGERS, WORKFLOW_ACTIONS, generateWorkflow,
  ANALYTICS_METRICS, generateReport,
  AI_COMMAND_CONFIG, executeCommand,
  GOVERNANCE_CONFIG, getGovernanceStatus,
} from '../services/ckso.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Dashboard ──────────────────────────────────────────────────────────────

export function handleCKSODashboard() {
  return jsonResponse(getCKSODashboard());
}

// ── App Builder ────────────────────────────────────────────────────────────

export function handleAppTemplates() {
  return jsonResponse({ templates: APP_TEMPLATES, count: APP_TEMPLATES.length });
}

export async function handleGenerateApp(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  if (!body.name) return errorResponse('Missing required field: "name".', 400);

  try {
    const result = await generateApp(env, body);
    writeAudit(env, ctx, { route: '/v1/ckso/app/generate', action: 'app_generated', appName: body.name });
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`App generation failed: ${err.message}`, 500);
  }
}

// ── Data Engine ────────────────────────────────────────────────────────────

export function handleDataTables() {
  return jsonResponse({
    provider: DATA_ENGINE_CONFIG.provider,
    baseId: DATA_ENGINE_CONFIG.baseId,
    tables: DATA_ENGINE_CONFIG.tables,
    fieldTypes: DATA_ENGINE_CONFIG.fieldTypes,
    tableCount: Object.keys(DATA_ENGINE_CONFIG.tables).length,
  });
}

export async function handleGenerateSchema(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  if (!body.requirements) return errorResponse('Missing required field: "requirements".', 400);

  try {
    const result = await generateSchema(env, body.requirements);
    writeAudit(env, ctx, { route: '/v1/ckso/data/schema', action: 'schema_generated' });
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Schema generation failed: ${err.message}`, 500);
  }
}

// ── Workflow Core ──────────────────────────────────────────────────────────

export function handleWorkflowTriggers() {
  return jsonResponse({ triggers: WORKFLOW_TRIGGERS, count: WORKFLOW_TRIGGERS.length });
}

export function handleWorkflowActions() {
  return jsonResponse({ actions: WORKFLOW_ACTIONS, count: WORKFLOW_ACTIONS.length });
}

export async function handleGenerateWorkflow(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  if (!body.description) return errorResponse('Missing required field: "description".', 400);

  try {
    const result = await generateWorkflow(env, body.description);
    writeAudit(env, ctx, { route: '/v1/ckso/workflow/generate', action: 'workflow_generated' });
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Workflow generation failed: ${err.message}`, 500);
  }
}

// ── Analytics Engine ───────────────────────────────────────────────────────

export function handleAnalyticsMetrics() {
  const totalMetrics = Object.values(ANALYTICS_METRICS).reduce((s, a) => s + a.length, 0);
  return jsonResponse({ metrics: ANALYTICS_METRICS, categories: Object.keys(ANALYTICS_METRICS).length, totalMetrics });
}

export async function handleGenerateReport(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const validTypes = Object.keys(ANALYTICS_METRICS);
  if (!body.report_type || !validTypes.includes(body.report_type)) {
    return errorResponse(`Missing or invalid "report_type". Valid: ${validTypes.join(', ')}`, 400);
  }

  try {
    const result = await generateReport(env, body.report_type, body.params || {});
    writeAudit(env, ctx, { route: '/v1/ckso/analytics/report', action: 'report_generated', reportType: body.report_type });
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Report generation failed: ${err.message}`, 500);
  }
}

// ── AI Command Center ──────────────────────────────────────────────────────

export async function handleAICommand(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  if (!body.command) return errorResponse('Missing required field: "command".', 400);

  try {
    const result = await executeCommand(env, body.command, body.params || {});
    writeAudit(env, ctx, { route: '/v1/ckso/ai/command', action: 'command_executed', command: body.command });
    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Command execution failed: ${err.message}`, 500);
  }
}

// ── Governance Core ────────────────────────────────────────────────────────

export function handleGovernanceStatus() {
  return jsonResponse(getGovernanceStatus());
}

export function handleGovernanceRoles() {
  return jsonResponse({ roles: GOVERNANCE_CONFIG.roles, count: GOVERNANCE_CONFIG.roles.length });
}
