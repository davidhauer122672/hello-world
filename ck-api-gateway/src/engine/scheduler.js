/**
 * Scheduler — Routes Cloudflare Cron Trigger events to the correct workflows.
 *
 * Replaces Zapier's "Schedule by Zapier" trigger.
 *
 * Cron schedule → workflow mapping:
 *   - */5 * * * *    → Poll cycle (check Airtable for new records)
 *   - 0 13 * * 1-6   → WF-6 Daily Campaign Digest (8 AM EST)
 *   - 0 14 * * 1     → WF-7 Stale Lead Check (9 AM EST Monday)
 *   - 0 15 * * 1-5   → WF-9 Property Intel Update (10 AM EST weekdays)
 *   - * /30 * * * *   → WF-10 Health Monitor (every 30 min)
 */

import { getWorkflowsByTrigger, getWorkflow } from './registry.js';
import { executeWorkflow } from './executor.js';
import { runPollCycle } from './polling.js';

/**
 * Main entry point for Cloudflare's scheduled() handler.
 *
 * @param {object} event — Cron trigger event (has .cron and .scheduledTime)
 * @param {object} env — Worker env bindings
 * @param {object} ctx — Worker execution context
 */
export async function runScheduledWorkflows(event, env, ctx) {
  const cron = event.cron;

  console.log(`[Scheduler] Cron fired: ${cron} at ${new Date(event.scheduledTime).toISOString()}`);

  // ── Poll cycle (every 5 minutes) ──
  if (cron === '*/5 * * * *') {
    ctx.waitUntil(runPollCycle(env, ctx));
    return;
  }

  // ── Route scheduled workflows by matching cron expression ──
  const scheduledWorkflows = getWorkflowsByTrigger('schedule');
  const matched = scheduledWorkflows.filter(w => w.trigger.cron === cron);

  if (matched.length === 0) {
    console.log(`[Scheduler] No workflows matched cron: ${cron}`);
    return;
  }

  for (const workflow of matched) {
    console.log(`[Scheduler] Executing scheduled workflow: ${workflow.id}`);

    const triggerData = {
      source: 'schedule',
      cron,
      scheduledTime: new Date(event.scheduledTime).toISOString(),
      now: new Date().toISOString(),
      today: new Date().toISOString().split('T')[0],
      tomorrow: addDays(1),
      plus90days: addDays(90),
    };

    ctx.waitUntil(
      executeWorkflow(workflow, triggerData, env, ctx)
        .then(result => {
          console.log(`[Scheduler] ${workflow.id} completed: ${result.status} (${result.duration}ms)`);
        })
        .catch(err => {
          console.error(`[Scheduler] ${workflow.id} failed:`, err);
        })
    );
  }
}

function addDays(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}
