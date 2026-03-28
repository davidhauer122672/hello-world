/**
 * @file task-dispatcher.js
 * @description Task Dispatcher for the Coastal Key Agent OS.
 *
 * Receives tasks from the Orchestrator, matches them to available agents based
 * on capabilities and current load, manages a priority-ordered queue, tracks
 * task lifecycle (queued → assigned → executing → completed / failed), handles
 * task dependencies, and implements retry logic with exponential backoff.
 *
 * Runtime target: Node.js / Cloudflare Workers.
 * KV namespaces expected on the env object:
 *   env.CACHE      — general-purpose cache (task queue persistence)
 *   env.SESSIONS   — agent session / state store
 *   env.AUDIT_LOG  — immutable audit trail
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Task priority levels.
 * Lower numeric value = higher urgency. Used for queue ordering.
 * @enum {number}
 */
export const PRIORITY = Object.freeze({
  CRITICAL: 1,
  HIGH:     2,
  STANDARD: 3,
  LOW:      4,
});

/** Maps string priority labels to their numeric counterparts. */
const PRIORITY_MAP = Object.freeze({
  critical: PRIORITY.CRITICAL,
  high:     PRIORITY.HIGH,
  standard: PRIORITY.STANDARD,
  low:      PRIORITY.LOW,
});

/** Task lifecycle states. */
export const TASK_STATUS = Object.freeze({
  QUEUED:    'queued',
  ASSIGNED:  'assigned',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED:    'failed',
  RETRYING:  'retrying',
  CANCELLED: 'cancelled',
});

/** Retry configuration. */
const RETRY = Object.freeze({
  MAX_ATTEMPTS:        3,
  BASE_DELAY_MS:       500,
  MAX_DELAY_MS:        30_000,
  BACKOFF_MULTIPLIER:  2,
});

/** Maximum tasks held in the in-memory queue at once. */
const MAX_QUEUE_SIZE = 1_000;

/** KV key prefixes. */
const KEY = Object.freeze({
  TASK_PREFIX:    'ck:task:',
  QUEUE_SNAPSHOT: 'ck:dispatch:queue',
  METRICS:        'ck:dispatch:metrics',
});

// ─── TaskDispatcher ───────────────────────────────────────────────────────────

/**
 * Dispatches tasks to agents, manages the priority queue, enforces task
 * dependencies, and provides complete lifecycle tracking with retry support.
 *
 * @example
 * const dispatcher = new TaskDispatcher(env, agentRegistry, agentStates);
 * const { taskId, agentId } = await dispatcher.dispatch({
 *   id: 'T-001', type: 'content-generation', division: 'MKT', priority: 'high'
 * });
 */
export class TaskDispatcher {
  /**
   * @param {object}                 env          - Cloudflare Worker env bindings.
   * @param {KVNamespace}            env.CACHE    - General-purpose KV cache.
   * @param {KVNamespace}            env.SESSIONS - Agent session-state KV.
   * @param {KVNamespace}            env.AUDIT_LOG - Audit trail KV.
   * @param {Map<string, object>}    agentRegistry - agentId → agent descriptor.
   * @param {Map<string, object>}    agentStates   - agentId → mutable runtime state.
   */
  constructor(env, agentRegistry, agentStates) {
    if (!env?.CACHE || !env?.SESSIONS || !env?.AUDIT_LOG) {
      throw new Error('TaskDispatcher requires env.CACHE, env.SESSIONS, and env.AUDIT_LOG bindings.');
    }

    this.env          = env;
    this.agentRegistry = agentRegistry ?? new Map();
    this.agentStates   = agentStates   ?? new Map();

    /**
     * In-memory priority queue.
     * Sorted ascending by numeric priority (1 = highest urgency).
     * @type {object[]}
     */
    this._queue = [];

    /**
     * Live task index: taskId → task state object.
     * @type {Map<string, object>}
     */
    this._tasks = new Map();

    /** Cumulative metrics counters. */
    this._metrics = {
      dispatched:   0,
      completed:    0,
      failed:       0,
      retried:      0,
      totalDurationMs: 0,
    };
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Assigns a task to the best available agent. If all matching agents are busy
   * the task is queued. Blocks on unresolved dependencies before dispatching.
   *
   * @param {object}   task
   * @param {string}   task.id             - Unique task identifier.
   * @param {string}   task.type           - Required capability (e.g. 'content-generation').
   * @param {string}   task.division       - Target division code (e.g. 'MKT').
   * @param {string}   [task.priority]     - 'critical' | 'high' | 'standard' | 'low'. Default: 'standard'.
   * @param {string[]} [task.dependsOn]    - Task IDs that must complete before this task runs.
   * @param {object}   [task.payload]      - Arbitrary data passed to the agent.
   * @param {number}   [task.timeoutMs]    - Execution timeout in ms. Default: 30 000.
   * @returns {Promise<{ taskId: string, agentId: string|null, status: string }>}
   */
  async dispatch(task) {
    if (!task?.id || !task?.type || !task?.division) {
      throw new Error('dispatch: task must include id, type, and division.');
    }

    if (this._tasks.has(task.id)) {
      return { taskId: task.id, agentId: null, status: 'duplicate' };
    }

    // ── 1. Build internal task record ─────────────────────────────────────────
    const numericPriority = PRIORITY_MAP[task.priority] ?? PRIORITY.STANDARD;
    const record = {
      id:           task.id,
      type:         task.type,
      division:     task.division,
      priority:     numericPriority,
      priorityLabel: task.priority ?? 'standard',
      dependsOn:    task.dependsOn ?? [],
      payload:      task.payload   ?? {},
      timeoutMs:    task.timeoutMs ?? 30_000,
      status:       TASK_STATUS.QUEUED,
      agentId:      null,
      attempts:     0,
      maxAttempts:  RETRY.MAX_ATTEMPTS,
      queuedAt:     Date.now(),
      assignedAt:   null,
      startedAt:    null,
      completedAt:  null,
      result:       null,
      error:        null,
    };

    this._tasks.set(task.id, record);

    // ── 2. Check queue capacity ───────────────────────────────────────────────
    if (this._queue.length >= MAX_QUEUE_SIZE) {
      record.status = TASK_STATUS.FAILED;
      record.error  = 'Queue capacity exceeded.';
      await this._persistTask(record);
      return { taskId: task.id, agentId: null, status: TASK_STATUS.FAILED };
    }

    // ── 3. Dependency check ───────────────────────────────────────────────────
    const depsReady = this._areDependenciesResolved(record);
    if (!depsReady) {
      // Task stays queued until dependencies resolve (see completeTask).
      this._enqueue(record);
      await this._persistTask(record);
      return { taskId: task.id, agentId: null, status: TASK_STATUS.QUEUED };
    }

    // ── 4. Find an agent and assign ───────────────────────────────────────────
    const agent = this._findBestAgent(record);
    if (!agent) {
      this._enqueue(record);
      await this._persistTask(record);
      return { taskId: task.id, agentId: null, status: TASK_STATUS.QUEUED };
    }

    await this._assignToAgent(record, agent);
    return { taskId: task.id, agentId: agent.id, status: TASK_STATUS.ASSIGNED };
  }

  /**
   * Returns the current priority-ordered task queue (queued tasks only).
   *
   * @returns {{ queue: object[], size: number }}
   */
  getQueue() {
    const queue = this._queue.map(t => ({
      id:            t.id,
      type:          t.type,
      division:      t.division,
      priority:      t.priority,
      priorityLabel: t.priorityLabel,
      dependsOn:     t.dependsOn,
      queuedAt:      t.queuedAt,
      attempts:      t.attempts,
    }));
    return { queue, size: queue.length };
  }

  /**
   * Returns the full status record for a specific task.
   *
   * @param {string} taskId - Task identifier.
   * @returns {Promise<object|null>} Task record, or null if not found.
   */
  async getTaskStatus(taskId) {
    // Check in-memory index first, then fall back to KV.
    if (this._tasks.has(taskId)) {
      return { ...this._tasks.get(taskId) };
    }

    const kvRecord = await this.env.CACHE.get(`${KEY.TASK_PREFIX}${taskId}`, { type: 'json' });
    return kvRecord ?? null;
  }

  /**
   * Marks a task as completed, records result data, and drains any queued tasks
   * that were waiting on this task's completion.
   *
   * @param {string} taskId  - Task identifier.
   * @param {object} result  - Output data returned by the agent.
   * @returns {Promise<{ taskId: string, drained: number }>}
   */
  async completeTask(taskId, result = {}) {
    const record = this._tasks.get(taskId);
    if (!record) throw new Error(`completeTask: task "${taskId}" not found.`);

    const now = Date.now();
    record.status      = TASK_STATUS.COMPLETED;
    record.result      = result;
    record.completedAt = now;

    if (record.startedAt) {
      this._metrics.totalDurationMs += now - record.startedAt;
    }
    this._metrics.completed++;

    // Release agent load.
    this._releaseAgent(record.agentId, taskId);

    await this._persistTask(record);
    this._tasks.delete(taskId);

    // Drain dependent tasks.
    const drained = await this._drainDependents(taskId);

    return { taskId, drained };
  }

  /**
   * Marks a task as failed. If retry attempts remain, re-queues it with
   * exponential backoff delay before the next attempt.
   *
   * @param {string} taskId  - Task identifier.
   * @param {string|Error} error - Error details.
   * @returns {Promise<{ taskId: string, willRetry: boolean, nextAttempt?: number }>}
   */
  async failTask(taskId, error) {
    const record = this._tasks.get(taskId);
    if (!record) throw new Error(`failTask: task "${taskId}" not found.`);

    const errorMessage = error instanceof Error ? error.message : String(error);
    record.attempts++;
    record.error = errorMessage;

    this._releaseAgent(record.agentId, taskId);

    if (record.attempts < record.maxAttempts) {
      // Exponential backoff.
      const delayMs = Math.min(
        RETRY.BASE_DELAY_MS * Math.pow(RETRY.BACKOFF_MULTIPLIER, record.attempts - 1),
        RETRY.MAX_DELAY_MS,
      );

      record.status        = TASK_STATUS.RETRYING;
      record.nextRetryAt   = Date.now() + delayMs;
      record.agentId       = null;
      this._metrics.retried++;

      // Schedule re-queue after the backoff delay.
      // In a Cloudflare Worker this would use a Durable Object alarm or DO queue.
      // Here we use setTimeout as a portable fallback.
      setTimeout(() => {
        record.status = TASK_STATUS.QUEUED;
        this._enqueue(record);
        this._drainQueue();
      }, delayMs);

      await this._persistTask(record);
      return { taskId, willRetry: true, nextAttempt: record.nextRetryAt };
    }

    // Exhausted retries.
    record.status      = TASK_STATUS.FAILED;
    record.completedAt = Date.now();
    this._metrics.failed++;

    await this._persistTask(record);
    this._tasks.delete(taskId);

    return { taskId, willRetry: false };
  }

  /**
   * Returns accumulated dispatch performance metrics.
   *
   * @returns {{
   *   dispatched:       number,
   *   completed:        number,
   *   failed:           number,
   *   retried:          number,
   *   queueSize:        number,
   *   completionRate:   number,
   *   failureRate:      number,
   *   avgDurationMs:    number,
   * }}
   */
  getMetrics() {
    const { dispatched, completed, failed, retried, totalDurationMs } = this._metrics;
    const base = dispatched || 1; // avoid division by zero

    return {
      dispatched,
      completed,
      failed,
      retried,
      queueSize:      this._queue.length,
      completionRate: parseFloat(((completed / base) * 100).toFixed(2)),
      failureRate:    parseFloat(((failed    / base) * 100).toFixed(2)),
      avgDurationMs:  completed > 0
        ? parseFloat((totalDurationMs / completed).toFixed(2))
        : 0,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Inserts a task into the in-memory queue, maintaining ascending priority order
   * (CRITICAL first, LOW last). Tasks at equal priority are FIFO.
   *
   * @private
   * @param {object} record - Internal task record.
   */
  _enqueue(record) {
    // Binary-search insertion to keep queue sorted.
    let lo = 0;
    let hi = this._queue.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this._queue[mid].priority <= record.priority) lo = mid + 1;
      else hi = mid;
    }
    this._queue.splice(lo, 0, record);
  }

  /**
   * Removes a task from the in-memory queue by ID.
   *
   * @private
   * @param {string} taskId
   */
  _dequeue(taskId) {
    const idx = this._queue.findIndex(t => t.id === taskId);
    if (idx !== -1) this._queue.splice(idx, 1);
  }

  /**
   * Finds the agent best suited to execute a given task record, based on
   * division match, capability match, and current load.
   *
   * @private
   * @param {object} record - Internal task record.
   * @returns {object|null} Agent descriptor, or null.
   */
  _findBestAgent(record) {
    let best      = null;
    let bestScore = -Infinity;

    for (const [agentId, descriptor] of this.agentRegistry) {
      if (!this._isAgentAvailable(agentId)) continue;

      const state = this.agentStates.get(agentId) ?? {};
      let score   = 0;

      if (descriptor.division === record.division) score  += 10;
      if (descriptor.capabilities?.includes(record.type)) score += 5;

      // Prefer agents with less accumulated work.
      score -= (state.tasksProcessed ?? 0) * 0.001;

      if (score > bestScore) {
        bestScore = score;
        best      = descriptor;
      }
    }

    return best;
  }

  /**
   * Transitions a task record to ASSIGNED / EXECUTING and updates agent state.
   *
   * @private
   * @param {object} record - Internal task record.
   * @param {object} agent  - Agent descriptor from the registry.
   * @returns {Promise<void>}
   */
  async _assignToAgent(record, agent) {
    const now = Date.now();

    record.status     = TASK_STATUS.ASSIGNED;
    record.agentId    = agent.id;
    record.assignedAt = now;
    record.startedAt  = now;
    record.attempts   = (record.attempts ?? 0) + 1;

    const agentState = this.agentStates.get(agent.id) ?? {};
    agentState.currentTask     = record.id;
    agentState.lastActive      = now;
    agentState.tasksProcessed  = (agentState.tasksProcessed ?? 0) + 1;

    this._dequeue(record.id);
    this._metrics.dispatched++;

    await this._persistTask(record);

    this.env.SESSIONS.put(
      `ck:agent:state:${agent.id}`,
      JSON.stringify(agentState),
      { expirationTtl: 86_400 },
    ).catch(() => {});
  }

  /**
   * Checks whether all tasks listed in record.dependsOn have completed.
   *
   * @private
   * @param {object} record - Internal task record.
   * @returns {boolean}
   */
  _areDependenciesResolved(record) {
    if (!record.dependsOn?.length) return true;
    return record.dependsOn.every(depId => {
      // A dependency is resolved if it no longer exists in the live index
      // (meaning it completed and was pruned) or is explicitly completed.
      const dep = this._tasks.get(depId);
      return !dep || dep.status === TASK_STATUS.COMPLETED;
    });
  }

  /**
   * After a task completes, re-evaluates queued tasks that depended on it
   * and dispatches any that are now unblocked.
   *
   * @private
   * @param {string} completedTaskId
   * @returns {Promise<number>} Number of tasks drained from the queue.
   */
  async _drainDependents(completedTaskId) {
    let drained = 0;

    const candidates = this._queue.filter(t =>
      t.dependsOn?.includes(completedTaskId) && this._areDependenciesResolved(t),
    );

    for (const record of candidates) {
      const agent = this._findBestAgent(record);
      if (agent) {
        await this._assignToAgent(record, agent);
        drained++;
      }
    }

    return drained;
  }

  /**
   * Iterates the queue and dispatches as many tasks as possible to available agents.
   * Called after a retry backoff or an agent becomes free.
   *
   * @private
   */
  async _drainQueue() {
    for (const record of [...this._queue]) {
      if (record.status !== TASK_STATUS.QUEUED) continue;
      if (!this._areDependenciesResolved(record)) continue;

      const agent = this._findBestAgent(record);
      if (agent) {
        await this._assignToAgent(record, agent);
      }
    }
  }

  /**
   * Returns true if the agent is able to accept new tasks.
   *
   * @private
   * @param {string} agentId
   * @returns {boolean}
   */
  _isAgentAvailable(agentId) {
    const state = this.agentStates.get(agentId);
    if (!state) return false;
    const UNAVAILABLE = ['paused', 'error', 'decommissioned', 'maintenance'];
    return !UNAVAILABLE.includes(state.lifecycleState);
  }

  /**
   * Clears the currentTask pointer from an agent's state when a task finishes.
   *
   * @private
   * @param {string|null} agentId
   * @param {string}      taskId
   */
  _releaseAgent(agentId, taskId) {
    if (!agentId) return;
    const state = this.agentStates.get(agentId);
    if (state && state.currentTask === taskId) {
      state.currentTask = null;
    }
  }

  /**
   * Persists a task record to KV with a 7-day retention window.
   *
   * @private
   * @param {object} record
   * @returns {Promise<void>}
   */
  async _persistTask(record) {
    await this.env.CACHE.put(
      `${KEY.TASK_PREFIX}${record.id}`,
      JSON.stringify(record),
      { expirationTtl: 604_800 },
    ).catch(() => {});
  }
}

export default TaskDispatcher;
