/**
 * @file lifecycle-manager.js
 * @description Agent lifecycle manager for the Coastal Key Agent OS.
 *
 * Manages the full lifecycle state machine for all 40 agents:
 *   initializing → active ↔ standby ↔ executing
 *                       ↓
 *                  paused | training | maintenance | error → decommissioned
 *
 * Responsibilities:
 *   - Validates all state transitions against the permitted transition graph.
 *   - Tracks per-agent uptime, error counts, and last-active timestamps.
 *   - Runs periodic health checks across the full fleet.
 *   - Auto-recovers agents stuck in error state (after a configurable grace period).
 *   - Triggers training transitions for underperforming agents.
 *
 * Runtime target: Node.js / Cloudflare Workers.
 * KV namespaces expected on the env object:
 *   env.CACHE      — general-purpose cache
 *   env.SESSIONS   — agent session / state store  (primary agent state KV)
 *   env.AUDIT_LOG  — immutable audit trail
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * All valid lifecycle states.
 * @enum {string}
 */
export const LIFECYCLE_STATE = Object.freeze({
  INITIALIZING:  'initializing',
  ACTIVE:        'active',
  STANDBY:       'standby',
  EXECUTING:     'executing',
  PAUSED:        'paused',
  TRAINING:      'training',
  MAINTENANCE:   'maintenance',
  ERROR:         'error',
  DECOMMISSIONED:'decommissioned',
});

/**
 * Permitted state transitions: fromState → Set<toState>.
 *
 * Any transition not listed here is illegal and will be rejected.
 *
 * @type {Object.<string, ReadonlySet<string>>}
 */
export const STATE_TRANSITIONS = Object.freeze(
  Object.fromEntries(
    Object.entries({
      initializing:   ['active', 'error'],
      active:         ['standby', 'executing', 'paused', 'training', 'maintenance', 'error', 'decommissioned'],
      standby:        ['active', 'executing', 'paused', 'maintenance', 'error', 'decommissioned'],
      executing:      ['active', 'standby', 'error'],
      paused:         ['active', 'standby', 'maintenance', 'error', 'decommissioned'],
      training:       ['active', 'standby', 'error'],
      maintenance:    ['active', 'standby', 'error', 'decommissioned'],
      error:          ['initializing', 'active', 'maintenance', 'decommissioned'],
      decommissioned: ['initializing'],  // Re-initialization path only.
    }).map(([k, v]) => [k, new Set(v)]),
  ),
);

/**
 * Base health scores (0–100) associated with each lifecycle state.
 * Error penalty and recovery bonuses are applied on top of these.
 */
const STATE_HEALTH_BASE = Object.freeze({
  active:         100,
  executing:       95,
  standby:         90,
  initializing:    80,
  training:        70,
  paused:          50,
  maintenance:     40,
  error:           10,
  decommissioned:   0,
});

/** Health score deducted per recorded error. Capped at MAX_ERROR_PENALTY. */
const ERROR_HEALTH_PENALTY = 5;

/** Maximum total health penalty from errors (capped at 50 points). */
const MAX_ERROR_PENALTY = 50;

/** Health score increment each time an agent returns to 'active'. */
const RECOVERY_HEALTH_BONUS = 5;

/** Milliseconds an agent must be in 'error' before auto-recovery is attempted. */
const AUTO_RECOVERY_GRACE_MS = 30_000;

/** Maximum consecutive errors before auto-recovery is disabled and agent goes to maintenance. */
const MAX_AUTO_RECOVERY_ATTEMPTS = 5;

/** Health score threshold below which an active agent is sent to training. */
const TRAINING_THRESHOLD = 50;

/** Maximum entries in the per-agent state-history ring buffer. */
const STATE_HISTORY_MAX = 100;

/** KV key prefix for agent lifecycle records. */
const KEY_PREFIX = 'ck:lifecycle:';

// ─── LifecycleManager ─────────────────────────────────────────────────────────

/**
 * Manages the lifecycle state machine for every agent in the fleet.
 *
 * @example
 * const lm = new LifecycleManager(env);
 * await lm.initialize('CKA-001');
 * await lm.activate('CKA-001');
 * const health = lm.getHealth('CKA-001');
 * const fleet  = await lm.checkAll();
 */
export class LifecycleManager {
  /**
   * @param {object}      env            - Cloudflare Worker environment bindings.
   * @param {KVNamespace} env.CACHE      - General-purpose KV cache.
   * @param {KVNamespace} env.SESSIONS   - Agent session-state KV namespace.
   * @param {KVNamespace} env.AUDIT_LOG  - Immutable audit trail KV namespace.
   */
  constructor(env) {
    if (!env?.CACHE || !env?.SESSIONS || !env?.AUDIT_LOG) {
      throw new Error('LifecycleManager requires env.CACHE, env.SESSIONS, and env.AUDIT_LOG KV bindings.');
    }

    this.env = env;

    /**
     * In-memory agent lifecycle records.
     * agentId → lifecycle record
     * @type {Map<string, object>}
     */
    this._agents = new Map();
  }

  // ─── Core Lifecycle Operations ─────────────────────────────────────────────

  /**
   * Registers an agent in the lifecycle manager and sets its initial state to
   * 'initializing'. Persists the record to KV and auto-transitions to 'active'
   * on success.
   *
   * @param {string} agentId - Unique agent identifier (e.g. 'CKA-001').
   * @returns {Promise<object>} The initial lifecycle record.
   */
  async initialize(agentId) {
    this._requireId(agentId);

    const now    = Date.now();
    const record = {
      agentId,
      state:           LIFECYCLE_STATE.INITIALIZING,
      previousState:   null,
      initializedAt:   now,
      lastStateChange: now,
      lastActive:      null,
      uptimeMs:        0,
      errorCount:      0,
      recoveryAttempts:0,
      lastError:       null,
      tasksExecuted:   0,
      healthScore:     STATE_HEALTH_BASE.initializing,
      stateHistory:    [{ state: LIFECYCLE_STATE.INITIALIZING, at: now, from: null }],
    };

    this._agents.set(agentId, record);
    await this._persist(record);
    await this._audit('AGENT_INITIALIZED', { agentId });

    // Auto-transition to active after successful initialization.
    await this.activate(agentId);

    return this._agents.get(agentId);
  }

  /**
   * Transitions the specified agent to the 'active' state.
   *
   * @param {string} agentId - Agent identifier.
   * @returns {Promise<object>} Updated lifecycle record.
   */
  async activate(agentId) {
    return this.transition(agentId, LIFECYCLE_STATE.ACTIVE);
  }

  /**
   * Transitions the specified agent to the 'standby' state.
   *
   * @param {string} agentId - Agent identifier.
   * @returns {Promise<object>} Updated lifecycle record.
   */
  async standby(agentId) {
    return this.transition(agentId, LIFECYCLE_STATE.STANDBY);
  }

  /**
   * Transitions the specified agent to the 'paused' state.
   *
   * @param {string} agentId - Agent identifier.
   * @returns {Promise<object>} Updated lifecycle record.
   */
  async pause(agentId) {
    return this.transition(agentId, LIFECYCLE_STATE.PAUSED);
  }

  /**
   * Transitions the specified agent to the 'decommissioned' state.
   * Decommissioned agents cannot accept new tasks and are excluded from routing.
   *
   * @param {string} agentId - Agent identifier.
   * @returns {Promise<object>} Updated lifecycle record.
   */
  async decommission(agentId) {
    return this.transition(agentId, LIFECYCLE_STATE.DECOMMISSIONED);
  }

  /**
   * Executes a validated lifecycle state transition for an agent.
   *
   * @param {string} agentId  - Agent identifier.
   * @param {string} newState - Target state (one of {@link LIFECYCLE_STATE}).
   * @param {object} [meta]   - Optional metadata stored alongside the transition record.
   * @returns {Promise<object>} Updated lifecycle record after the transition.
   * @throws {Error} If the transition is not permitted or the agent is not tracked.
   */
  async transition(agentId, newState, meta = {}) {
    this._requireId(agentId);

    const record = this._agents.get(agentId);
    if (!record) {
      throw new Error(`LifecycleManager: agent "${agentId}" is not tracked. Call initialize() first.`);
    }

    if (!Object.values(LIFECYCLE_STATE).includes(newState)) {
      throw new Error(`LifecycleManager: "${newState}" is not a valid lifecycle state.`);
    }

    const allowed = STATE_TRANSITIONS[record.state];
    if (!allowed?.has(newState)) {
      throw new Error(
        `LifecycleManager: transition "${record.state}" → "${newState}" is not permitted for agent "${agentId}". ` +
        `Allowed targets: ${[...(allowed ?? [])].join(', ') || 'none'}.`,
      );
    }

    const oldState = record.state;
    const now      = Date.now();

    // ── Apply state ────────────────────────────────────────────────────────
    record.previousState   = oldState;
    record.state           = newState;
    record.lastStateChange = now;

    if (newState === LIFECYCLE_STATE.ACTIVE || newState === LIFECYCLE_STATE.EXECUTING) {
      record.lastActive = now;
    }

    // ── Health score adjustments ───────────────────────────────────────────
    if (newState === LIFECYCLE_STATE.ERROR) {
      record.errorCount++;
      record.lastError    = meta.error ?? null;
      record.healthScore  = this._calcHealthScore(record);
    } else if (newState === LIFECYCLE_STATE.ACTIVE) {
      // Recovery bonus: health nudges up each time an agent returns to active.
      record.healthScore = Math.min(
        STATE_HEALTH_BASE.active,
        record.healthScore + RECOVERY_HEALTH_BONUS,
      );
    } else {
      record.healthScore = this._calcHealthScore(record);
    }

    // ── State history ──────────────────────────────────────────────────────
    const historyEntry = { state: newState, from: oldState, at: now, ...meta };
    record.stateHistory.push(historyEntry);
    if (record.stateHistory.length > STATE_HISTORY_MAX) {
      record.stateHistory.splice(0, record.stateHistory.length - STATE_HISTORY_MAX);
    }

    this._agents.set(agentId, record);
    await this._persist(record);

    await this._audit('STATE_TRANSITION', {
      agentId, from: oldState, to: newState, healthScore: record.healthScore,
    });

    return { ...record };
  }

  // ─── State & Health Queries ────────────────────────────────────────────────

  /**
   * Returns the current lifecycle state string for an agent.
   *
   * @param {string} agentId
   * @returns {string|null} Current state, or null if agent is not tracked.
   */
  getState(agentId) {
    return this._agents.get(agentId)?.state ?? null;
  }

  /**
   * Returns detailed health metrics for an agent.
   *
   * @param {string} agentId
   * @returns {{
   *   agentId:         string,
   *   state:           string,
   *   healthScore:     number,
   *   uptimeMs:        number,
   *   uptimeHours:     number,
   *   errorCount:      number,
   *   lastError:       string|null,
   *   tasksExecuted:   number,
   *   lastActive:      number|null,
   *   lastStateChange: number,
   * }|null}
   */
  getHealth(agentId) {
    const record = this._agents.get(agentId);
    if (!record) return null;

    const uptimeMs = record.state !== LIFECYCLE_STATE.DECOMMISSIONED
      ? Date.now() - record.initializedAt
      : 0;

    return {
      agentId:         agentId,
      state:           record.state,
      healthScore:     record.healthScore,
      uptimeMs,
      uptimeHours:     parseFloat((uptimeMs / 3_600_000).toFixed(4)),
      errorCount:      record.errorCount,
      lastError:       record.lastError,
      tasksExecuted:   record.tasksExecuted,
      lastActive:      record.lastActive,
      lastStateChange: record.lastStateChange,
    };
  }

  /**
   * Returns uptime breakdown for an agent — total tracked time vs. time spent
   * in 'active' or 'executing' states.
   *
   * @param {string} agentId
   * @returns {{
   *   agentId:        string,
   *   totalMs:        number,
   *   activeMs:       number,
   *   uptimePercent:  number,
   *   stateChanges:   number,
   * }|null}
   */
  getUptime(agentId) {
    const record = this._agents.get(agentId);
    if (!record) return null;

    const totalMs  = Date.now() - record.initializedAt;
    const ACTIVE_STATES = new Set([LIFECYCLE_STATE.ACTIVE, LIFECYCLE_STATE.EXECUTING]);

    let activeMs = 0;
    const history = record.stateHistory;
    for (let i = 0; i < history.length; i++) {
      if (ACTIVE_STATES.has(history[i].state)) {
        const end    = history[i + 1]?.at ?? Date.now();
        activeMs    += end - history[i].at;
      }
    }

    return {
      agentId,
      totalMs,
      activeMs,
      uptimePercent: totalMs > 0 ? parseFloat(((activeMs / totalMs) * 100).toFixed(2)) : 100,
      stateChanges:  history.length,
    };
  }

  // ─── Fleet-Wide Operations ─────────────────────────────────────────────────

  /**
   * Runs a health check across all tracked agents. Applies two automatic
   * governance rules:
   *
   * 1. Auto-recovery: agents in 'error' state for more than
   *    {@link AUTO_RECOVERY_GRACE_MS} ms are transitioned back to 'initializing'
   *    and then 'active', up to {@link MAX_AUTO_RECOVERY_ATTEMPTS} times.
   *    If the limit is reached the agent is moved to 'maintenance' instead.
   *
   * 2. Performance-based training: 'active' agents whose health score falls
   *    below {@link TRAINING_THRESHOLD} are transitioned to 'training'.
   *
   * @returns {Promise<{
   *   checked:     number,
   *   healthy:     number,
   *   degraded:    number,
   *   critical:    number,
   *   agents:      object[],
   * }>}
   */
  async checkAll() {
    const results = [];

    for (const [agentId, record] of this._agents) {
      let health = this.getHealth(agentId);

      // ── Rule 1: Auto-recovery ────────────────────────────────────────────
      if (record.state === LIFECYCLE_STATE.ERROR) {
        const errorDuration = Date.now() - record.lastStateChange;

        if (errorDuration >= AUTO_RECOVERY_GRACE_MS) {
          if (record.recoveryAttempts < MAX_AUTO_RECOVERY_ATTEMPTS) {
            record.recoveryAttempts++;
            try {
              await this.transition(agentId, LIFECYCLE_STATE.INITIALIZING, { reason: 'auto-recovery' });
              await this.transition(agentId, LIFECYCLE_STATE.ACTIVE,       { reason: 'auto-recovery' });
              health = this.getHealth(agentId);
              health.autoRecovered = true;
            } catch (_err) {
              // If the recovery transition fails, leave agent in error state.
            }
          } else {
            // Too many failed recoveries — send to maintenance.
            try {
              await this.transition(agentId, LIFECYCLE_STATE.MAINTENANCE, {
                reason: `Auto-recovery limit (${MAX_AUTO_RECOVERY_ATTEMPTS}) reached.`,
              });
              health = this.getHealth(agentId);
              health.sentToMaintenance = true;
            } catch (_err) { /* noop */ }
          }
        }
      }

      // ── Rule 2: Performance-based training ─────────────────────────────
      if (record.state === LIFECYCLE_STATE.ACTIVE && record.healthScore < TRAINING_THRESHOLD) {
        try {
          await this.transition(agentId, LIFECYCLE_STATE.TRAINING, {
            reason: `Health score ${record.healthScore} below training threshold ${TRAINING_THRESHOLD}.`,
          });
          health = this.getHealth(agentId);
          health.sentToTraining = true;
        } catch (_err) { /* noop */ }
      }

      results.push(health);
    }

    return {
      checked:  results.length,
      healthy:  results.filter(r => r.healthScore >= 80).length,
      degraded: results.filter(r => r.healthScore >= 50 && r.healthScore < 80).length,
      critical: results.filter(r => r.healthScore  < 50).length,
      agents:   results,
    };
  }

  /**
   * Returns a fleet-wide summary of state distribution and average health.
   *
   * @returns {{
   *   total:          number,
   *   byState:        Object.<string, number>,
   *   avgHealthScore: number,
   * }}
   */
  getFleetSummary() {
    const byState = Object.fromEntries(
      Object.values(LIFECYCLE_STATE).map(s => [s, 0]),
    );

    let totalHealth = 0;

    for (const record of this._agents.values()) {
      byState[record.state] = (byState[record.state] ?? 0) + 1;
      totalHealth += record.healthScore;
    }

    const total = this._agents.size;

    return {
      total,
      byState,
      avgHealthScore: total > 0 ? parseFloat((totalHealth / total).toFixed(2)) : 0,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Computes the current health score for an agent record.
   * Base score from lifecycle state, minus an error penalty.
   *
   * @private
   * @param {object} record - Agent lifecycle record.
   * @returns {number} Health score in [0, 100].
   */
  _calcHealthScore(record) {
    const base         = STATE_HEALTH_BASE[record.state] ?? 50;
    const errorPenalty = Math.min(MAX_ERROR_PENALTY, record.errorCount * ERROR_HEALTH_PENALTY);
    return Math.max(0, base - errorPenalty);
  }

  /**
   * Persists an agent lifecycle record to the SESSIONS KV namespace.
   *
   * @private
   * @param {object} record
   * @returns {Promise<void>}
   */
  async _persist(record) {
    this.env.SESSIONS.put(
      `${KEY_PREFIX}${record.agentId}`,
      JSON.stringify(record),
      { expirationTtl: 86_400 * 30 }, // 30-day retention
    ).catch(() => {});
  }

  /**
   * Writes an audit entry to the AUDIT_LOG KV namespace. Fire-and-forget.
   *
   * @private
   * @param {string} event   - Event code.
   * @param {object} details - Context fields.
   * @returns {Promise<void>}
   */
  async _audit(event, details) {
    const key    = `ck:lifecycle:audit:${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record = { event, ...details, timestamp: Date.now() };
    this.env.AUDIT_LOG.put(key, JSON.stringify(record), { expirationTtl: 86_400 * 90 }).catch(() => {});
  }

  /**
   * Validates that the provided value is a non-empty string.
   *
   * @private
   * @param {*} value - Value to validate.
   */
  _requireId(value) {
    if (!value || typeof value !== 'string') {
      throw new TypeError('LifecycleManager: agentId must be a non-empty string.');
    }
  }
}

export default LifecycleManager;
