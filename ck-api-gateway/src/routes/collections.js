/**
 * Collections Agent Routes
 *
 * Routes:
 *   GET  /v1/collections/config       - Voice agent configuration (bug-fixed)
 *   GET  /v1/collections/guardrails   - 7 compliance controls
 *   GET  /v1/collections/status       - Agent status and KPI baseline
 *   POST /v1/collections/eligibility  - Call eligibility pre-check
 *   POST /v1/collections/session      - Log call session outcome for audit
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  VOICE_CONFIG,
  COMPLIANCE_CONTROLS,
  getCollectionsAgentStatus,
  checkCallEligibility,
  validateSession,
} from '../engines/collections-agent.js';

export function handleCollectionsConfig() {
  return jsonResponse({ config: VOICE_CONFIG, agent: 'COLL-001' });
}

export function handleCollectionsGuardrails() {
  return jsonResponse({ controls: COMPLIANCE_CONTROLS, count: COMPLIANCE_CONTROLS.length });
}

export function handleCollectionsStatus() {
  return jsonResponse(getCollectionsAgentStatus());
}

export async function handleCollectionsEligibility(request, env, ctx) {
  const body = await request.json();
  const result = checkCallEligibility({
    localTimeHour: body.localTimeHour,
    attemptsLast7Days: body.attemptsLast7Days,
    onDoNotCallList: body.onDoNotCallList,
  });

  writeAudit(env, ctx, {
    route: '/v1/collections/eligibility',
    action: 'eligibility_checked',
    accountId: body.account_id || null,
    eligible: result.eligible,
    reason: result.reason || null,
  });

  return jsonResponse(result);
}

export async function handleCollectionsSession(request, env, ctx) {
  const body = await request.json();
  const validation = validateSession(body);
  if (!validation.valid) {
    return errorResponse(`Invalid session: ${validation.errors.join(', ')}`, 400);
  }

  writeAudit(env, ctx, {
    route: '/v1/collections/session',
    action: 'session_logged',
    accountId: body.account_id,
    outcome: body.outcome,
    promiseAmount: body.promise_amount || null,
    promiseDate: body.promise_date || null,
    disputeReason: body.dispute_reason || null,
  });

  return jsonResponse({
    logged: true,
    accountId: body.account_id,
    outcome: body.outcome,
    routing: routingForOutcome(body.outcome),
  });
}

function routingForOutcome(outcome) {
  switch (outcome) {
    case 'paid_in_full': return 'billing_portal_payment_confirmation';
    case 'payment_plan': return 'billing_team_plan_activation';
    case 'hardship_program': return 'billing_team_hardship_review';
    case 'disputed': return 'billing_team_dispute_resolution';
    case 'do_not_call': return 'dnc_list_add';
    case 'wrong_number': return 'contact_data_flag';
    case 'refused':
    case 'no_contact':
    default: return 'schedule_next_attempt';
  }
}
