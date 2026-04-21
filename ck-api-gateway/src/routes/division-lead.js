/**
 * Division Lead Orchestrator v2.0 — route handlers.
 *
 *   POST /v1/division/status        — File weekly Division Status record
 *   POST /v1/division/queue         — Add a Division Queue item
 *   GET  /v1/division/queue/:code   — List queue for a specific division
 *   GET  /v1/division/divisions     — List the 10 division codes
 */

import {
  validateStatusPayload,
  validateQueuePayload,
  fileDivisionStatus,
  fileDivisionQueueItem,
  listQueueForDivision,
  DIVISIONS,
  STATUS_VALUES,
  QUEUE_STATUS_VALUES,
} from '../services/division-lead.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export async function handleDivisionStatus(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateStatusPayload(body);
  if (validationError) return errorResponse(validationError, 400);

  try {
    const record = await fileDivisionStatus(env, body);
    writeAudit(env, ctx, {
      route: '/v1/division/status',
      action: 'division_status_filed',
      division: body.division,
      status: body.status,
      week_of: body.week_of,
      record_id: record.id,
    });
    return jsonResponse({ success: true, record_id: record.id, fields: record.fields });
  } catch (err) {
    return errorResponse(`Division status filing failed: ${err.message}`, 500);
  }
}

export async function handleDivisionQueueCreate(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateQueuePayload(body);
  if (validationError) return errorResponse(validationError, 400);

  try {
    const record = await fileDivisionQueueItem(env, body);
    writeAudit(env, ctx, {
      route: '/v1/division/queue',
      action: 'division_queue_item_added',
      division: body.division,
      item: body.item,
      status: body.status,
      record_id: record.id,
    });
    return jsonResponse({ success: true, record_id: record.id, fields: record.fields });
  } catch (err) {
    return errorResponse(`Division queue create failed: ${err.message}`, 500);
  }
}

export async function handleDivisionQueueList(request, env, ctx, division) {
  if (!DIVISIONS.includes(division)) {
    return errorResponse(`division must be one of: ${DIVISIONS.join(', ')}`, 400);
  }
  try {
    const records = await listQueueForDivision(env, division);
    writeAudit(env, ctx, {
      route: `/v1/division/queue/${division}`,
      action: 'division_queue_listed',
      division,
      count: records.length,
    });
    return jsonResponse({ success: true, division, count: records.length, records });
  } catch (err) {
    return errorResponse(`Division queue list failed: ${err.message}`, 500);
  }
}

export function handleDivisionList() {
  return jsonResponse({
    success: true,
    divisions: DIVISIONS,
    status_values: STATUS_VALUES,
    queue_status_values: QUEUE_STATUS_VALUES,
  });
}
