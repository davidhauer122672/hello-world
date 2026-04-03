/**
 * Action Library — Reusable workflow step actions replacing Zapier's built-in apps.
 *
 * Each action is a function that receives params, env, and ctx,
 * and returns a result object. Actions are the building blocks of workflows.
 *
 * Supported actions:
 *   - airtable.create        — Create an Airtable record
 *   - airtable.update        — Update an Airtable record
 *   - airtable.get           — Get an Airtable record by ID
 *   - airtable.list          — List/query Airtable records
 *   - airtable.find          — Find first record matching a formula
 *   - slack.send             — Send Slack webhook message
 *   - claude.inference       — Run Claude AI inference
 *   - http.request           — Make an HTTP request
 *   - transform.map          — Transform data with field mapping
 *   - transform.extract      — Extract fields from an object
 *   - filter.check           — Check a condition and stop workflow if false
 *   - delay.wait             — Wait N milliseconds (for rate limiting)
 *   - kv.get                 — Read from KV store
 *   - kv.set                 — Write to KV store
 *   - audit.log              — Write to audit log
 *   - email.prepare          — Prepare email payload (returned, not sent)
 */

import { createRecord, getRecord, updateRecord, listRecords, TABLES } from '../services/airtable.js';
import { inference } from '../services/anthropic.js';

// ── Action Registry ──────────────────────────────────────────────────────────

const ACTION_REGISTRY = {
  'airtable.create': airtableCreate,
  'airtable.update': airtableUpdate,
  'airtable.get': airtableGet,
  'airtable.list': airtableList,
  'airtable.find': airtableFind,
  'slack.send': slackSend,
  'claude.inference': claudeInference,
  'http.request': httpRequest,
  'transform.map': transformMap,
  'transform.extract': transformExtract,
  'filter.check': filterCheck,
  'delay.wait': delayWait,
  'kv.get': kvGet,
  'kv.set': kvSet,
  'audit.log': auditLog,
  'email.prepare': emailPrepare,
};

/**
 * Run an action by name.
 * @param {string} actionName — Action identifier (e.g. "airtable.create")
 * @param {object} params — Action-specific parameters
 * @param {object} env — Cloudflare Worker env
 * @param {object} ctx — Cloudflare Worker context
 * @returns {object} — Action result
 */
export async function runAction(actionName, params, env, ctx) {
  const action = ACTION_REGISTRY[actionName];
  if (!action) {
    throw new Error(`Unknown action: "${actionName}". Available: ${Object.keys(ACTION_REGISTRY).join(', ')}`);
  }
  return action(params, env, ctx);
}

/**
 * Get all available action names.
 */
export function getAvailableActions() {
  return Object.keys(ACTION_REGISTRY);
}

// ── Airtable Actions ─────────────────────────────────────────────────────────

/**
 * Create an Airtable record.
 * @param {object} params
 * @param {string} params.table — Table name (key from TABLES) or table ID
 * @param {object} params.fields — Field name → value map
 */
async function airtableCreate(params, env) {
  const tableId = resolveTableId(params.table);
  const record = await createRecord(env, tableId, params.fields);
  return { recordId: record.id, fields: record.fields };
}

/**
 * Update an Airtable record.
 * @param {object} params
 * @param {string} params.table — Table name or ID
 * @param {string} params.recordId — Record ID
 * @param {object} params.fields — Fields to update
 */
async function airtableUpdate(params, env) {
  const tableId = resolveTableId(params.table);
  const record = await updateRecord(env, tableId, params.recordId, params.fields);
  return { recordId: record.id, fields: record.fields };
}

/**
 * Get a single Airtable record.
 * @param {object} params
 * @param {string} params.table — Table name or ID
 * @param {string} params.recordId — Record ID
 */
async function airtableGet(params, env) {
  const tableId = resolveTableId(params.table);
  const record = await getRecord(env, tableId, params.recordId);
  return { recordId: record.id, fields: record.fields };
}

/**
 * List Airtable records with optional filtering.
 * @param {object} params
 * @param {string} params.table — Table name or ID
 * @param {string} [params.filter] — Airtable filter formula
 * @param {string[]} [params.fields] — Field names to return
 * @param {number} [params.maxRecords] — Max records
 * @param {string} [params.sort] — Sort field
 */
async function airtableList(params, env) {
  const tableId = resolveTableId(params.table);
  const records = await listRecords(env, tableId, {
    filterByFormula: params.filter,
    fields: params.fields,
    maxRecords: params.maxRecords || 100,
    sort: params.sort,
  });
  return { records: records.map(r => ({ recordId: r.id, fields: r.fields })), count: records.length };
}

/**
 * Find the first record matching a filter formula.
 * @param {object} params
 * @param {string} params.table — Table name or ID
 * @param {string} params.filter — Airtable filter formula
 * @param {string[]} [params.fields] — Field names to return
 */
async function airtableFind(params, env) {
  const tableId = resolveTableId(params.table);
  const records = await listRecords(env, tableId, {
    filterByFormula: params.filter,
    fields: params.fields,
    maxRecords: 1,
  });
  if (records.length === 0) return { found: false, record: null };
  return { found: true, recordId: records[0].id, fields: records[0].fields };
}

/**
 * Resolve a table name (LEADS, TASKS, etc.) or pass through a table ID.
 */
function resolveTableId(table) {
  if (!table) throw new Error('Table name or ID is required');
  // If it looks like a table ID, use it directly
  if (table.startsWith('tbl')) return table;
  // Otherwise look up from TABLES constant
  const id = TABLES[table.toUpperCase()];
  if (!id) throw new Error(`Unknown table: "${table}". Available: ${Object.keys(TABLES).join(', ')}`);
  return id;
}

// ── Slack Actions ────────────────────────────────────────────────────────────

/**
 * Send a Slack webhook message.
 * @param {object} params
 * @param {string} params.channel — Channel name (e.g. "#sales-alerts")
 * @param {string} params.text — Message text (supports Slack mrkdwn)
 * @param {object[]} [params.blocks] — Optional Slack Block Kit blocks
 */
async function slackSend(params, env) {
  if (!env.SLACK_WEBHOOK_URL) {
    return { sent: false, reason: 'SLACK_WEBHOOK_URL not configured' };
  }

  const payload = { channel: params.channel, text: params.text };
  if (params.blocks) payload.blocks = params.blocks;

  const response = await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return { sent: response.ok, status: response.status };
}

// ── Claude AI Actions ────────────────────────────────────────────────────────

/**
 * Run Claude AI inference.
 * @param {object} params
 * @param {string} params.system — System prompt
 * @param {string} params.prompt — User message
 * @param {string} [params.tier] — Model tier: fast, standard, advanced
 * @param {number} [params.maxTokens] — Max response tokens
 * @param {string} [params.cacheKey] — KV cache key
 * @param {number} [params.cacheTtl] — Cache TTL in seconds
 */
async function claudeInference(params, env) {
  const result = await inference(env, {
    system: params.system,
    prompt: params.prompt,
    tier: params.tier || 'standard',
    maxTokens: params.maxTokens || 2048,
    cacheKey: params.cacheKey,
    cacheTtl: params.cacheTtl,
  });

  return {
    content: result.content,
    model: result.model,
    cached: result.cached,
    usage: result.usage,
  };
}

// ── HTTP Actions ─────────────────────────────────────────────────────────────

/**
 * Make an HTTP request (replaces Zapier's Webhooks by Zapier / HTTP actions).
 * @param {object} params
 * @param {string} params.url — Request URL
 * @param {string} [params.method=GET] — HTTP method
 * @param {object} [params.headers] — Request headers
 * @param {object|string} [params.body] — Request body
 * @param {number} [params.timeout=10000] — Timeout in ms
 */
async function httpRequest(params) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeout || 10000);

  try {
    const options = {
      method: params.method || 'GET',
      headers: params.headers || {},
      signal: controller.signal,
    };

    if (params.body && options.method !== 'GET') {
      options.body = typeof params.body === 'string' ? params.body : JSON.stringify(params.body);
      if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(params.url, options);
    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { status: response.status, ok: response.ok, data };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Transform Actions ────────────────────────────────────────────────────────

/**
 * Map/transform data fields (replaces Zapier's Formatter).
 * @param {object} params
 * @param {object} params.input — Source data object
 * @param {object} params.mapping — { outputField: "input.path.to.value" } or static values
 */
async function transformMap(params) {
  const { input, mapping } = params;
  const output = {};

  for (const [outputKey, sourcePath] of Object.entries(mapping)) {
    if (typeof sourcePath === 'string' && sourcePath.startsWith('input.')) {
      const path = sourcePath.slice(6); // remove "input."
      output[outputKey] = getNestedValue(input, path);
    } else {
      output[outputKey] = sourcePath; // static value
    }
  }

  return output;
}

/**
 * Extract specific fields from an object.
 * @param {object} params
 * @param {object} params.input — Source object
 * @param {string[]} params.fields — Field names to extract
 */
async function transformExtract(params) {
  const { input, fields } = params;
  const output = {};
  for (const field of fields) {
    output[field] = input?.[field];
  }
  return output;
}

// ── Filter Actions ───────────────────────────────────────────────────────────

/**
 * Check a condition. If false, throws to stop the workflow (or returns skip signal).
 * @param {object} params
 * @param {*} params.value — Value to check
 * @param {string} params.operator — Comparison: equals, notEquals, in, notIn, exists, contains, gt, gte, lt, lte
 * @param {*} params.compareTo — Value to compare against
 * @param {string} [params.message] — Custom error message
 */
async function filterCheck(params) {
  const { value, operator, compareTo, message } = params;
  let passes = false;

  switch (operator) {
    case 'equals':    passes = value === compareTo; break;
    case 'notEquals': passes = value !== compareTo; break;
    case 'in':        passes = Array.isArray(compareTo) && compareTo.includes(value); break;
    case 'notIn':     passes = !Array.isArray(compareTo) || !compareTo.includes(value); break;
    case 'exists':    passes = value != null && value !== ''; break;
    case 'notExists': passes = value == null || value === ''; break;
    case 'contains':  passes = typeof value === 'string' && value.includes(compareTo); break;
    case 'gt':        passes = value > compareTo; break;
    case 'gte':       passes = value >= compareTo; break;
    case 'lt':        passes = value < compareTo; break;
    case 'lte':       passes = value <= compareTo; break;
    default:          passes = Boolean(value); break;
  }

  if (!passes) {
    throw new Error(message || `Filter check failed: ${value} ${operator} ${compareTo}`);
  }

  return { passed: true };
}

// ── Delay Actions ────────────────────────────────────────────────────────────

/**
 * Wait for a specified duration (useful for rate limiting between API calls).
 * @param {object} params
 * @param {number} params.ms — Milliseconds to wait
 */
async function delayWait(params) {
  const ms = Math.min(params.ms || 1000, 5000); // Cap at 5s to avoid Worker timeout
  await new Promise(resolve => setTimeout(resolve, ms));
  return { waited: ms };
}

// ── KV Actions ───────────────────────────────────────────────────────────────

/**
 * Read a value from a KV namespace.
 * @param {object} params
 * @param {string} params.namespace — KV namespace binding name (CACHE, SESSIONS, etc.)
 * @param {string} params.key — Key to read
 * @param {string} [params.type=json] — Return type: json, text
 */
async function kvGet(params, env) {
  const ns = env[params.namespace];
  if (!ns) return { found: false, reason: `KV namespace "${params.namespace}" not bound` };

  const type = params.type || 'json';
  const value = await ns.get(params.key, type);
  return { found: value != null, value };
}

/**
 * Write a value to a KV namespace.
 * @param {object} params
 * @param {string} params.namespace — KV namespace binding name
 * @param {string} params.key — Key to write
 * @param {*} params.value — Value to store
 * @param {number} [params.ttl] — TTL in seconds
 */
async function kvSet(params, env) {
  const ns = env[params.namespace];
  if (!ns) return { written: false, reason: `KV namespace "${params.namespace}" not bound` };

  const serialized = typeof params.value === 'string' ? params.value : JSON.stringify(params.value);
  const options = params.ttl ? { expirationTtl: params.ttl } : {};
  await ns.put(params.key, serialized, options);
  return { written: true, key: params.key };
}

// ── Audit Actions ────────────────────────────────────────────────────────────

/**
 * Write to the audit log.
 * @param {object} params
 * @param {string} params.route — Route/action identifier
 * @param {object} params.data — Audit data
 */
async function auditLog(params, env, ctx) {
  if (!env.AUDIT_LOG) return { logged: false };

  const key = `audit:${params.route || 'workflow'}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    ...params.data,
    route: params.route,
    timestamp: new Date().toISOString(),
    service: 'ck-workflow-engine',
  };

  ctx.waitUntil(
    env.AUDIT_LOG.put(key, JSON.stringify(record), { expirationTtl: 86400 * 30 })
  );

  return { logged: true, key };
}

// ── Email Actions ────────────────────────────────────────────────────────────

/**
 * Prepare an email payload (returned, not sent directly).
 * @param {object} params
 * @param {string} params.to — Recipient email
 * @param {string} params.from — Sender email
 * @param {string} params.subject — Email subject
 * @param {string} params.body — Email body text
 * @param {string} [params.listName] — Constant Contact list name
 */
async function emailPrepare(params) {
  return {
    emailPayload: {
      to: params.to,
      from: params.from || 'david@coastalkey-pm.com',
      subject: params.subject,
      body: params.body,
    },
    constantContact: params.listName ? {
      email: params.to,
      listName: params.listName,
    } : null,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getNestedValue(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}
