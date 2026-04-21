/**
 * Division Lead Orchestrator v2.0 — service layer.
 *
 * Validates Division Status and Division Queue payloads, then writes to
 * Airtable via the shared service. Mirrors the contract in
 * DIVISION-LEAD-ORCHESTRATOR.md at the repo root.
 */

import { createRecord, listRecords, TABLES } from './airtable.js';

export const DIVISIONS = ['EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB', 'MCCO'];
export const STATUS_VALUES = ['green', 'yellow', 'red'];
export const QUEUE_STATUS_VALUES = ['backlog', 'in_flight', 'blocked', 'shipped', 'slipped'];

const REQUIRED_STATUS_FIELDS = [
  'division',
  'week_of',
  'status',
  'top_three_in_flight',
  'top_blocker',
  'eta_on_blocker',
  'metric_delta_vs_last_week',
];

const REQUIRED_QUEUE_FIELDS = ['division', 'item', 'owner_email', 'eta', 'definition_of_done', 'status'];

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Validate a Division Status payload. Returns null on success, error string
 * on failure. Strict: every required field must be present and typed.
 */
export function validateStatusPayload(payload) {
  if (!payload || typeof payload !== 'object') return 'payload must be an object';
  for (const f of REQUIRED_STATUS_FIELDS) {
    if (payload[f] === undefined || payload[f] === null || payload[f] === '') {
      return `missing required field: ${f}`;
    }
  }
  if (!DIVISIONS.includes(payload.division)) {
    return `division must be one of: ${DIVISIONS.join(', ')}`;
  }
  if (!STATUS_VALUES.includes(payload.status)) {
    return `status must be one of: ${STATUS_VALUES.join(', ')}`;
  }
  if (!isIsoDate(payload.week_of)) return 'week_of must be ISO date YYYY-MM-DD';
  if (!isIsoDate(payload.eta_on_blocker)) return 'eta_on_blocker must be ISO date YYYY-MM-DD';
  return null;
}

/**
 * Validate a Division Queue payload. Same contract.
 */
export function validateQueuePayload(payload) {
  if (!payload || typeof payload !== 'object') return 'payload must be an object';
  for (const f of REQUIRED_QUEUE_FIELDS) {
    if (payload[f] === undefined || payload[f] === null || payload[f] === '') {
      return `missing required field: ${f}`;
    }
  }
  if (!DIVISIONS.includes(payload.division)) {
    return `division must be one of: ${DIVISIONS.join(', ')}`;
  }
  if (!QUEUE_STATUS_VALUES.includes(payload.status)) {
    return `status must be one of: ${QUEUE_STATUS_VALUES.join(', ')}`;
  }
  if (!isIsoDate(payload.eta)) return 'eta must be ISO date YYYY-MM-DD';
  if (payload.shipped_at !== undefined && payload.shipped_at !== null && !isIsoDate(payload.shipped_at)) {
    return 'shipped_at must be ISO date YYYY-MM-DD when provided';
  }
  return null;
}

/**
 * Build the composite `week_key` used as the Division Status primary field.
 * Format: `<DIVISION>-<YYYY>-W<WW>`, e.g. `EXC-2026-W17`.
 */
export function buildWeekKey(division, weekOfIso) {
  const d = new Date(weekOfIso + 'T00:00:00Z');
  const year = d.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const daysSinceJan1 = Math.floor((d.getTime() - jan1.getTime()) / (24 * 3600 * 1000));
  const week = Math.ceil((daysSinceJan1 + jan1.getUTCDay() + 1) / 7);
  return `${division}-${year}-W${String(week).padStart(2, '0')}`;
}

export async function fileDivisionStatus(env, payload) {
  const fields = {
    week_key: buildWeekKey(payload.division, payload.week_of),
    division: payload.division,
    week_of: payload.week_of,
    status: payload.status,
    top_three_in_flight: payload.top_three_in_flight,
    top_blocker: payload.top_blocker,
    eta_on_blocker: payload.eta_on_blocker,
    metric_delta_vs_last_week: payload.metric_delta_vs_last_week,
  };
  if (payload.filed_by_email) {
    fields.filed_by = { email: payload.filed_by_email };
  }
  return createRecord(env, TABLES.DIVISION_STATUS, fields);
}

export async function fileDivisionQueueItem(env, payload) {
  const fields = {
    item: payload.item,
    division: payload.division,
    eta: payload.eta,
    definition_of_done: payload.definition_of_done,
    status: payload.status,
  };
  if (payload.owner_email) fields.owner = { email: payload.owner_email };
  if (payload.shipped_at) fields.shipped_at = payload.shipped_at;
  if (payload.announce_link) fields.announce_link = payload.announce_link;
  return createRecord(env, TABLES.DIVISION_QUEUE, fields);
}

export async function listQueueForDivision(env, division, options = {}) {
  if (!DIVISIONS.includes(division)) {
    throw new Error(`division must be one of: ${DIVISIONS.join(', ')}`);
  }
  return listRecords(env, TABLES.DIVISION_QUEUE, {
    filterByFormula: `{division} = '${division}'`,
    maxRecords: options.maxRecords || 100,
    sort: options.sort || 'eta',
  });
}
