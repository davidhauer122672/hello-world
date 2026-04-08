/**
 * CEO Directive Routes — Sovereign Command Interface
 *
 * Ferrari-Standard Execution | Sovereign Governance
 *
 *   POST /v1/ceo/directive         — Issue a CEO directive (optimize/architect/execute/diagnose/integrate)
 *   POST /v1/ceo/operations-review — Full operations review (all 5 directive types + synthesis)
 *   GET  /v1/ceo/operating-state   — Current enterprise operating state
 *   GET  /v1/ceo/dashboard         — CEO command dashboard
 */

import {
  issueCeoDirective,
  fullOperationsReview,
  getOperatingState,
  getDirectiveTypes,
} from '../services/ceo-directives.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

const VALID_TYPES = ['optimize', 'architect', 'execute', 'diagnose', 'integrate'];

// ── POST /v1/ceo/directive ────────────────────────────────────────────────

export async function handleCeoDirective(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { type, target, context } = body;

  if (!type || !VALID_TYPES.includes(type)) {
    return errorResponse(`Missing or invalid "type". Must be one of: ${VALID_TYPES.join(', ')}`, 400);
  }

  if (!target) {
    return errorResponse('Missing required field: "target" (the system, process, or area to address).', 400);
  }

  try {
    const result = await issueCeoDirective(env, type, target, context || '');

    writeAudit(env, ctx, {
      route: '/v1/ceo/directive',
      action: `ceo_directive_${type}`,
      target,
      cached: result.cached,
    });

    return jsonResponse({ success: true, ...result });
  } catch (err) {
    return errorResponse(`CEO directive failed: ${err.message}`, 500);
  }
}

// ── POST /v1/ceo/operations-review ────────────────────────────────────────

export async function handleOperationsReview(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { target } = body;

  if (!target) {
    return errorResponse('Missing required field: "target" (the system or area to review).', 400);
  }

  try {
    const result = await fullOperationsReview(env, target);

    writeAudit(env, ctx, {
      route: '/v1/ceo/operations-review',
      action: 'full_operations_review',
      target,
    });

    return jsonResponse({ success: true, ...result });
  } catch (err) {
    return errorResponse(`Operations review failed: ${err.message}`, 500);
  }
}

// ── GET /v1/ceo/operating-state ───────────────────────────────────────────

export function handleOperatingState() {
  return jsonResponse({
    authority: 'Coastal Key AI CEO',
    state: getOperatingState(),
    governance: 'sovereign',
    executionStandard: 'ferrari',
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/ceo/dashboard ─────────────────────────────────────────────────

export function handleCeoDashboard() {
  const state = getOperatingState();
  const directives = getDirectiveTypes();

  return jsonResponse({
    authority: 'Coastal Key AI CEO',
    status: 'operational',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    enterprise: {
      fleet_total: state.fleet.total,
      divisions: Object.keys(state.fleet.divisions).length,
      intelligence_officers: state.fleet.intelligenceOfficers,
      email_agents: state.fleet.emailAgents,
      api_endpoints: state.infrastructure.apiEndpoints,
      voice_campaigns: state.infrastructure.voiceCampaigns,
      airtable_tables: state.infrastructure.databases.airtable.tables,
      slack_channels: state.infrastructure.slackChannels,
      thinking_frameworks: state.infrastructure.thinkingFrameworks,
      service_zones: state.serviceZones.length,
    },
    directive_capabilities: directives,
    endpoints: {
      issue_directive: 'POST /v1/ceo/directive',
      full_operations_review: 'POST /v1/ceo/operations-review',
      operating_state: 'GET /v1/ceo/operating-state',
      thinking_coach: 'GET /v1/thinking/dashboard',
      mcco_command: 'GET /v1/mcco/command',
      agent_fleet: 'GET /v1/agents',
      intel_dashboard: 'GET /v1/intel/dashboard',
    },
    ferrari_standards: state.ferrariStandards,
    timestamp: new Date().toISOString(),
  });
}
