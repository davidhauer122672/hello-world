/**
 * Airtable Polling Service — Detects new/changed records to trigger workflows.
 *
 * Replaces Zapier's "New or Updated Record" trigger for Airtable.
 *
 * How it works:
 *   1. On each poll cycle (via Cron Trigger), check each poll-triggered workflow
 *   2. Query Airtable with the workflow's filter formula
 *   3. Compare against the last-seen record IDs (stored in KV)
 *   4. For any new records found, execute the workflow
 *   5. Update the last-seen state in KV
 *
 * KV key format: poll-state:{workflowId}
 */

import { listRecords, TABLES } from '../services/airtable.js';
import { getWorkflowsByTrigger } from './registry.js';
import { executeWorkflow } from './executor.js';

/**
 * Run all poll-triggered workflows.
 * Called by the Cloudflare Cron Trigger handler.
 *
 * @param {object} env — Worker env bindings
 * @param {object} ctx — Worker execution context
 * @returns {object} — Summary of poll results
 */
export async function runPollCycle(env, ctx) {
  const pollWorkflows = getWorkflowsByTrigger('poll');
  const results = [];

  for (const workflow of pollWorkflows) {
    try {
      const result = await pollWorkflow(workflow, env, ctx);
      results.push({
        workflowId: workflow.id,
        ...result,
      });
    } catch (err) {
      console.error(`Poll failed for ${workflow.id}:`, err);
      results.push({
        workflowId: workflow.id,
        error: err.message,
        newRecords: 0,
        executed: 0,
      });
    }
  }

  return {
    polledAt: new Date().toISOString(),
    workflows: results,
    totalExecutions: results.reduce((sum, r) => sum + (r.executed || 0), 0),
  };
}

/**
 * Poll a single workflow for new records.
 */
async function pollWorkflow(workflow, env, ctx) {
  const { trigger } = workflow;
  const tableId = resolveTable(trigger.table);

  // Fetch records matching the workflow's filter
  const records = await listRecords(env, tableId, {
    filterByFormula: trigger.filter,
    maxRecords: 20, // Process up to 20 new records per cycle
  });

  if (records.length === 0) {
    return { newRecords: 0, executed: 0 };
  }

  // Load last-seen state from KV
  const stateKey = `poll-state:${workflow.id}`;
  let seenIds = [];
  if (env.CACHE) {
    const state = await env.CACHE.get(stateKey, 'json');
    seenIds = state?.seenIds || [];
  }

  // Find truly new records (not seen in previous poll)
  const newRecords = records.filter(r => !seenIds.includes(r.id));

  if (newRecords.length === 0) {
    return { newRecords: 0, executed: 0 };
  }

  // Execute the workflow for each new record
  let executed = 0;
  for (const record of newRecords) {
    try {
      const triggerData = {
        recordId: record.id,
        fields: record.fields,
        source: 'poll',
        workflowId: workflow.id,
      };

      // Execute non-blocking for all but the first
      if (executed === 0) {
        await executeWorkflow(workflow, triggerData, env, ctx);
      } else {
        ctx.waitUntil(executeWorkflow(workflow, triggerData, env, ctx));
      }
      executed++;
    } catch (err) {
      console.error(`Workflow execution failed for ${record.id}:`, err);
    }
  }

  // Update seen state — keep the current record IDs as the new baseline
  if (env.CACHE) {
    const newSeenIds = records.map(r => r.id);
    await env.CACHE.put(stateKey, JSON.stringify({
      seenIds: newSeenIds,
      lastPoll: new Date().toISOString(),
      lastNewCount: newRecords.length,
    }), { expirationTtl: 86400 }); // 24h TTL — re-processes if state expires
  }

  return { newRecords: newRecords.length, executed };
}

/**
 * Resolve table name to table ID.
 */
function resolveTable(name) {
  if (name.startsWith('tbl')) return name;
  return TABLES[name.toUpperCase()] || name;
}
