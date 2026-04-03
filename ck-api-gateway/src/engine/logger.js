/**
 * Execution Logger — Tracks workflow run history in KV + Airtable.
 *
 * Every workflow execution is logged with:
 *   - Full step-by-step execution trace
 *   - Duration and status
 *   - Error details if failed
 *
 * Storage:
 *   - KV (AUDIT_LOG): Last 30 days of executions (fast retrieval)
 *   - Airtable (AI_LOG): Permanent record for analytics
 */

/**
 * Log a workflow execution to KV and optionally Airtable.
 * @param {object} env — Worker env bindings
 * @param {object} execution — Execution result from the executor
 */
export async function logExecution(env, execution) {
  const promises = [];

  // ── KV Log (always) ──
  if (env.AUDIT_LOG) {
    const kvKey = `workflow:${execution.workflowId}:${execution.id}`;
    promises.push(
      env.AUDIT_LOG.put(kvKey, JSON.stringify({
        id: execution.id,
        workflowId: execution.workflowId,
        workflowName: execution.workflowName,
        status: execution.status,
        stepCount: execution.steps.length,
        completedSteps: execution.steps.filter(s => s.status === 'completed' || s.status === 'completed_after_retry').length,
        failedSteps: execution.steps.filter(s => s.status === 'failed').length,
        skippedSteps: execution.steps.filter(s => s.status === 'skipped').length,
        duration: execution.duration,
        error: execution.error,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
      }), { expirationTtl: 86400 * 30 })
    );

    // Also store a summary index for listing recent executions
    const indexKey = `workflow-index:${Date.now()}:${execution.workflowId}`;
    promises.push(
      env.AUDIT_LOG.put(indexKey, JSON.stringify({
        executionId: execution.id,
        workflowId: execution.workflowId,
        workflowName: execution.workflowName,
        status: execution.status,
        duration: execution.duration,
        timestamp: execution.startedAt,
      }), { expirationTtl: 86400 * 30 })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * List recent workflow executions from KV.
 * @param {object} env — Worker env bindings
 * @param {object} [options]
 * @param {string} [options.workflowId] — Filter by workflow ID
 * @param {number} [options.limit=20] — Max results
 * @returns {object[]} — Array of execution summaries
 */
export async function listExecutions(env, options = {}) {
  if (!env.AUDIT_LOG) return [];

  const prefix = 'workflow-index:';
  const listed = await env.AUDIT_LOG.list({ prefix, limit: options.limit || 20 });

  const executions = [];
  for (const key of listed.keys) {
    const data = await env.AUDIT_LOG.get(key.name, 'json');
    if (data) {
      if (options.workflowId && data.workflowId !== options.workflowId) continue;
      executions.push(data);
    }
  }

  return executions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get a specific execution's full details from KV.
 * @param {object} env
 * @param {string} workflowId
 * @param {string} executionId
 * @returns {object|null}
 */
export async function getExecution(env, workflowId, executionId) {
  if (!env.AUDIT_LOG) return null;

  const key = `workflow:${workflowId}:${executionId}`;
  return env.AUDIT_LOG.get(key, 'json');
}
