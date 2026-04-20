/**
 * Delivery Protocol Routes — Manus-to-Claude Pipeline
 *
 * Routes:
 *   GET  /v1/delivery/dashboard   — Protocol status and configuration
 *   POST /v1/delivery/execute     — Execute full delivery pipeline
 *   GET  /v1/delivery/template    — Claude Master Prompt JSON template
 *   GET  /v1/delivery/governance  — Governance validation matrix
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  TASK_CATEGORIES, GOVERNANCE_MATRIX, PIPELINE_STAGES,
  executePipeline, getDeliveryProtocolDashboard,
} from '../engines/delivery-protocol.js';

export function handleDeliveryDashboard() {
  return jsonResponse(getDeliveryProtocolDashboard());
}

export async function handleDeliveryExecute(request, env, ctx) {
  const body = await request.json();
  if (!body.taskId || !body.title || !body.category) {
    return errorResponse('taskId, title, and category are required', 400);
  }

  const result = executePipeline(body, body.governanceOverrides || {});

  writeAudit(env, ctx, '/v1/delivery/execute', {
    action: 'delivery_pipeline_executed',
    taskId: body.taskId,
    category: body.category,
    success: result.success,
    stages: result.pipelineLog?.length || 0,
  });

  return jsonResponse(result, result.success ? 200 : 400);
}

export function handleDeliveryTemplate() {
  return jsonResponse({
    template: {
      coastal_key_delivery: {
        version: '1.0',
        deliveryVersion: 'V[sequential]',
        generated_by: 'Manus AI / Coastal Key Delivery Protocol',
        generated_at: '[ISO 8601]',
        task_id: '[Manus task ID]',
        task_summary: { title: '[string]', category: '[' + TASK_CATEGORIES.join(' | ') + ']', description: '[2-3 sentences]', deliverables: ['[file1]', '[file2]'] },
        systems_modified: { website: false, database: false, cloudflare_workers: false, airtable: false, retell_ai: false, other: null },
        governance_validation: { missionAligned: true, goal1_automation: '[string]', goal2_risk: '[string]', goal3_financial: '[string]', goal4_market: '[string]', sovereignFrameworkCompliant: true },
        production_instructions: { action_required: '[DEPLOY | REVIEW | INTEGRATE | MONITOR | NONE]', steps: ['[step]'], dependencies: '[string]', rollback_plan: '[string]' },
        ceo_action_required: { required: false, action: null },
        next_orchestrator_directive: '[string]',
        checksum: 'CK-[hex]',
      },
    },
    taskCategories: TASK_CATEGORIES,
  });
}

export function handleDeliveryGovernance() {
  return jsonResponse({ governanceMatrix: GOVERNANCE_MATRIX, ruleId: 'SGR-001', enforcement: 'Self-enforcing. No manual trigger.' });
}
