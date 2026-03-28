/**
 * @file orchestrator.js
 * @description Master Orchestrator — the central brain of the Coastal Key Agent OS.
 *
 * Coordinates all 40 agents across divisions, enforces Sovereign Governance
 * Compendium rules (risk levels, quality gates, approval chains), manages agent
 * lifecycle events, and implements the CEO 1% Decision Reduction Protocol by
 * restricting escalations strictly to Level 4 Critical events.
 *
 * Runtime target: Node.js / Cloudflare Workers.
 * KV namespaces expected on the env object:
 *   env.CACHE      — general-purpose cache
 *   env.SESSIONS   — agent session / state store
 *   env.AUDIT_LOG  — immutable audit trail
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Risk level constants aligned with the Sovereign Governance Compendium.
 * @enum {number}
 */
export const RISK_LEVELS = Object.freeze({
  LOW:      1,
  MODERATE: 2,
  HIGH:     3,
  CRITICAL: 4,
});

/**
 * Canonical division codes used throughout the fleet.
 * @enum {string}
 */
export const DIVISIONS = Object.freeze({
  EXECUTIVE:   'EXEC',
  OPERATIONS:  'OPS',
  MARKETING:   'MKT',
  SALES:       'SLS',
  FINANCE:     'FIN',
  TECHNOLOGY:  'TECH',
  LEGAL:       'LGL',
  HR:          'HR',
});

/**
 * Ordered approval chains required for each risk level.
 * Each entry lists roles that must sign off in sequence.
 * @type {Object.<number, string[]>}
 */
const APPROVAL_CHAINS = Object.freeze({
  [RISK_LEVELS.LOW]:      [],
  [RISK_LEVELS.MODERATE]: ['division_lead'],
  [RISK_LEVELS.HIGH]:     ['division_lead', 'coo'],
  [RISK_LEVELS.CRITICAL]: ['division_lead', 'coo', 'ceo'],
});

/**
 * Quality gate thresholds used during governance checks.
 * Agents that fall below these values are blocked from high-stakes actions.
 */
const QUALITY_GATES = Object.freeze({
  /** Minimum agent confidence score (0–100) for moderate/high/critical tasks. */
  MIN_CONFIDENCE:       70,
  /** Minimum compliance score (0–100). */
  MIN_COMPLIANCE_SCORE: 80,
  /** Maximum tolerated error rate (%). */
  MAX_ERROR_RATE:       5,
  /** Minimum required uptime (%). */
  MIN_UPTIME:           95,
  /**
   * Per-risk-level minimum health score (0–1).
   * Agents below the threshold for a given risk level are blocked.
   */
  MIN_HEALTH: {
    [RISK_LEVELS.LOW]:      0.50,
    [RISK_LEVELS.MODERATE]: 0.70,
    [RISK_LEVELS.HIGH]:     0.85,
    [RISK_LEVELS.CRITICAL]: 0.95,
  },
});

/** KV namespace key prefixes. */
const KEY = Object.freeze({
  AGENT_REGISTRY:   'ck:registry:agents',
  AGENT_STATE:      'ck:agent:state:',
  FLEET_STATUS:     'ck:fleet:status',
  SYSTEM_HEALTH:    'ck:system:health',
  DIRECTIVE_PREFIX: 'ck:directive:',
  AUDIT_PREFIX:     'ck:audit:',
  WORKFLOW_DEF:     'ck:workflow:def:',
  WORKFLOW_RUN:     'ck:workflow:run:',
  CEO_ESCALATION:   'ck:escalation:ceo:',
});

/** Total capacity of the in-memory audit ring buffer. */
const AUDIT_RING_SIZE = 500;

/** System-health cache TTL in milliseconds (30 s). */
const HEALTH_CACHE_TTL_MS = 30_000;

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Master Orchestrator for the Coastal Key 40-agent fleet.
 *
 * @example
 * const orch = new Orchestrator(env);
 * await orch.init();
 * const { agentId } = await orch.routeTask({
 *   id: 'T-001', type: 'content-generation', division: 'MKT', priority: 'high'
 * });
 */
export class Orchestrator {
  /**
   * @param {object}       env           - Cloudflare Worker environment bindings.
   * @param {KVNamespace}  env.CACHE     - General-purpose KV cache.
   * @param {KVNamespace}  env.SESSIONS  - Agent session-state KV namespace.
   * @param {KVNamespace}  env.AUDIT_LOG - Persistent, append-only audit trail KV.
   */
  constructor(env) {
    if (!env?.CACHE || !env?.SESSIONS || !env?.AUDIT_LOG) {
      throw new Error('Orchestrator requires env.CACHE, env.SESSIONS, and env.AUDIT_LOG KV bindings.');
    }

    this.env = env;

    /** @type {Map<string, object>} agentId → static agent descriptor (from registry). */
    this.agentRegistry = new Map();

    /** @type {Map<string, object>} agentId → mutable runtime state. */
    this.agentStates = new Map();

    /** @type {Map<string, object>} runId → active workflow state. */
    this.activeWorkflows = new Map();

    /** @type {object[]} Rolling in-memory audit ring buffer. */
    this._auditRing = [];

    /** @type {object|null} Cached result of getSystemHealth(). */
    this._healthCache = null;

    /** @type {number} Timestamp at which the health cache expires. */
    this._healthCacheExpiry = 0;

    /** @type {boolean} Set to true after init() resolves. */
    this._initialized = false;
  }

  // ─── Initialization ────────────────────────────────────────────────────────

  /**
   * Loads the agent registry from KV and seeds runtime state for each agent.
   * Must be awaited before calling any other method.
   *
   * @returns {Promise<void>}
   */
  async init() {
    const raw = await this.env.CACHE.get(KEY.AGENT_REGISTRY, { type: 'json' });
    const agents = Array.isArray(raw) ? raw : this._buildDefaultRegistry();

    for (const agent of agents) {
      this.agentRegistry.set(agent.id, agent);

      // Attempt to restore persisted session state from KV.
      const savedState = await this.env.SESSIONS.get(`${KEY.AGENT_STATE}${agent.id}`, { type: 'json' });
      this.agentStates.set(agent.id, savedState ?? this._buildInitialState(agent));
    }

    this._initialized = true;

    await this.auditLog({
      type:       'ORCHESTRATOR_INITIALIZED',
      agentCount: this.agentRegistry.size,
    });
  }

  // ─── Task Routing ──────────────────────────────────────────────────────────

  /**
   * Routes an incoming task to the most appropriate available agent based on
   * task type, division, and priority. Governance rules are enforced before
   * any agent is selected.
   *
   * @param {object}  task
   * @param {string}  task.id              - Unique task identifier.
   * @param {string}  task.type            - Capability type required (e.g. 'content-generation').
   * @param {string}  task.division        - Target division code (e.g. 'MKT').
   * @param {string}  [task.priority]      - 'critical' | 'high' | 'standard' | 'low'. Default: 'standard'.
   * @param {number}  [task.riskLevel]     - {@link RISK_LEVELS} constant. Default: LOW.
   * @param {object}  [task.payload]       - Arbitrary task data passed to the agent.
   * @returns {Promise<{ accepted: boolean, agentId: string|null, reason?: string }>}
   */
  async routeTask(task) {
    this._assertInitialized();

    const riskLevel = task.riskLevel ?? RISK_LEVELS.LOW;

    // ── 1. Governance pre-flight ──────────────────────────────────────────────
    const govResult = await this.enforceGovernance('ROUTE_TASK', null, riskLevel);
    if (!govResult.allowed) {
      await this.auditLog({ type: 'TASK_REJECTED_GOVERNANCE', taskId: task.id, reason: govResult.reason });
      return { accepted: false, agentId: null, reason: govResult.reason };
    }

    // ── 2. Agent selection ────────────────────────────────────────────────────
    const agent = this._selectAgent(task);
    if (!agent) {
      await this.auditLog({ type: 'TASK_NO_AGENT_AVAILABLE', taskId: task.id, division: task.division });
      return { accepted: false, agentId: null, reason: 'No capable agent available for this task.' };
    }

    // ── 3. Update runtime state ───────────────────────────────────────────────
    const state = this.agentStates.get(agent.id);
    state.currentTask     = task.id;
    state.lastActive      = Date.now();
    state.tasksProcessed  = (state.tasksProcessed ?? 0) + 1;

    // Persist state update (fire-and-forget).
    this.env.SESSIONS.put(
      `${KEY.AGENT_STATE}${agent.id}`,
      JSON.stringify(state),
      { expirationTtl: 86_400 },
    ).catch(() => {});

    await this.auditLog({
      type:      'TASK_ROUTED',
      taskId:    task.id,
      agentId:   agent.id,
      division:  task.division,
      riskLevel,
      priority:  task.priority ?? 'standard',
    });

    return { accepted: true, agentId: agent.id };
  }

  // ─── Workflow Execution ────────────────────────────────────────────────────

  /**
   * Orchestrates a multi-agent workflow. Loads the workflow definition from KV,
   * executes each step in dependency order, and merges outputs into a shared
   * context that subsequent steps can consume.
   *
   * @param {string} workflowId - Identifier of the registered workflow template.
   * @param {object} payload    - Initial input data for the workflow.
   * @returns {Promise<{ runId: string, status: 'completed'|'failed', results: object[], error?: string }>}
   */
  async executeWorkflow(workflowId, payload = {}) {
    this._assertInitialized();

    const definition = await this.env.CACHE.get(`${KEY.WORKFLOW_DEF}${workflowId}`, { type: 'json' });
    if (!definition) {
      return { runId: null, status: 'failed', results: [], error: `Unknown workflow: ${workflowId}` };
    }

    const runId = `${workflowId}:run:${Date.now()}`;
    const runState = {
      runId,
      workflowId,
      startedAt: Date.now(),
      status:    'running',
      steps:     [],
    };
    this.activeWorkflows.set(runId, runState);

    await this.auditLog({ type: 'WORKFLOW_STARTED', workflowId, runId });

    const results = [];
    let context   = { ...payload };

    try {
      for (const step of definition.steps ?? []) {
        const riskLevel = step.riskLevel ?? RISK_LEVELS.LOW;

        const govResult = await this.enforceGovernance(`WORKFLOW_STEP:${step.id}`, step.agentId, riskLevel);
        if (!govResult.allowed) {
          throw new Error(`Governance blocked step "${step.id}": ${govResult.reason}`);
        }

        const stepOutput = await this._executeStep(step, context);
        results.push({ stepId: step.id, agentId: step.agentId, ...stepOutput });
        context = { ...context, ...stepOutput.output };

        runState.steps.push({ stepId: step.id, completedAt: Date.now(), status: stepOutput.status });
      }

      runState.status      = 'completed';
      runState.completedAt = Date.now();
      runState.durationMs  = runState.completedAt - runState.startedAt;

      // Persist run summary.
      await this.env.CACHE.put(
        `${KEY.WORKFLOW_RUN}${runId}`,
        JSON.stringify(runState),
        { expirationTtl: 604_800 }, // 7 days
      );

      await this.auditLog({ type: 'WORKFLOW_COMPLETED', workflowId, runId, stepCount: results.length });
      return { runId, status: 'completed', results };
    } catch (err) {
      runState.status = 'failed';
      runState.error  = err.message;
      await this.auditLog({ type: 'WORKFLOW_FAILED', workflowId, runId, error: err.message });
      return { runId, status: 'failed', results, error: err.message };
    } finally {
      this.activeWorkflows.delete(runId);
    }
  }

  // ─── Governance Enforcement ────────────────────────────────────────────────

  /**
   * Evaluates a proposed action against the Sovereign Governance Compendium
   * quality gates and approval chains. Automatically escalates Level 4 Critical
   * events to the CEO (1% Decision Reduction Protocol).
   *
   * @param {string}      action    - Human-readable action label (for audit trail).
   * @param {string|null} agentId   - Agent initiating the action, or null for system actions.
   * @param {number}      riskLevel - One of the {@link RISK_LEVELS} constants.
   * @returns {Promise<{ allowed: boolean, reason?: string, requiredApprovals: string[] }>}
   */
  async enforceGovernance(action, agentId, riskLevel = RISK_LEVELS.LOW) {
    const requiredApprovals = APPROVAL_CHAINS[riskLevel] ?? [];
    const minHealth         = QUALITY_GATES.MIN_HEALTH[riskLevel] ?? 0;

    // ── Quality gate: agent health ────────────────────────────────────────────
    if (agentId) {
      const health = this._getAgentHealthScore(agentId);
      if (health < minHealth) {
        const reason = `Agent ${agentId} health ${(health * 100).toFixed(1)}% is below the ${(minHealth * 100).toFixed(0)}% gate for risk level ${riskLevel}.`;
        await this.auditLog({ type: 'GOVERNANCE_BLOCKED', action, agentId, riskLevel, reason });
        return { allowed: false, reason, requiredApprovals };
      }
    }

    // ── CEO 1% Decision Reduction Protocol ───────────────────────────────────
    // Level 4 Critical is the *only* tier that ever reaches the CEO.
    if (riskLevel === RISK_LEVELS.CRITICAL) {
      await this.escalateToCEO({ action, agentId, riskLevel, timestamp: Date.now() });
      return {
        allowed: false,
        reason: 'Level 4 Critical — escalated to CEO. Awaiting approval before proceeding.',
        requiredApprovals,
      };
    }

    // ── Approval chain gate ───────────────────────────────────────────────────
    if (requiredApprovals.length > 0) {
      await this.auditLog({ type: 'APPROVAL_REQUIRED', action, agentId, riskLevel, requiredApprovals });
      return {
        allowed: false,
        reason:  `Action requires approval from: ${requiredApprovals.join(', ')}.`,
        requiredApprovals,
      };
    }

    await this.auditLog({ type: 'GOVERNANCE_APPROVED', action, agentId, riskLevel });
    return { allowed: true, requiredApprovals };
  }

  // ─── Fleet & Division Status ───────────────────────────────────────────────

  /**
   * Returns a comprehensive snapshot of every registered agent, including
   * lifecycle state, health score, task counts, uptime, and error counts.
   *
   * @returns {Promise<{ agents: object[], summary: object }>}
   */
  async getFleetStatus() {
    this._assertInitialized();

    const agents       = [];
    let totalHealth    = 0;
    let healthyCount   = 0;

    for (const [agentId, descriptor] of this.agentRegistry) {
      const state  = this.agentStates.get(agentId) ?? {};
      const health = this._getAgentHealthScore(agentId);

      totalHealth += health;
      if (health >= 0.70) healthyCount++;

      agents.push({
        id:             agentId,
        name:           descriptor.name,
        division:       descriptor.division,
        role:           descriptor.role,
        capabilities:   descriptor.capabilities ?? [],
        lifecycleState: state.lifecycleState ?? 'unknown',
        health:         parseFloat(health.toFixed(4)),
        tasksProcessed: state.tasksProcessed ?? 0,
        currentTask:    state.currentTask    ?? null,
        lastActive:     state.lastActive     ?? null,
        uptimeMs:       state.startedAt ? Date.now() - state.startedAt : 0,
        errorCount:     state.errorCount ?? 0,
      });
    }

    const total   = agents.length;
    const summary = {
      total,
      healthy:         healthyCount,
      degraded:        total - healthyCount,
      avgHealth:       total ? parseFloat((totalHealth / total).toFixed(4)) : 0,
      activeWorkflows: this.activeWorkflows.size,
      capturedAt:      Date.now(),
    };

    return { agents, summary };
  }

  /**
   * Returns aggregated health metrics and agent list for a single division.
   *
   * @param {string} divisionCode - One of the {@link DIVISIONS} values (e.g. 'MKT').
   * @returns {Promise<{ division: string, agents: object[], metrics: object }>}
   */
  async getDivisionStatus(divisionCode) {
    this._assertInitialized();

    const { agents } = await this.getFleetStatus();
    const divAgents  = agents.filter(a => a.division === divisionCode);

    if (!divAgents.length) {
      return { division: divisionCode, agents: [], metrics: { error: 'No agents found for this division.' } };
    }

    const totalTasks  = divAgents.reduce((s, a) => s + a.tasksProcessed, 0);
    const totalErrors = divAgents.reduce((s, a) => s + a.errorCount,    0);
    const avgHealth   = divAgents.reduce((s, a) => s + a.health,        0) / divAgents.length;
    const activeCount = divAgents.filter(a => a.lifecycleState === 'active' || a.lifecycleState === 'executing').length;

    return {
      division: divisionCode,
      agents:   divAgents,
      metrics: {
        agentCount:    divAgents.length,
        activeAgents:  activeCount,
        avgHealth:     parseFloat(avgHealth.toFixed(4)),
        totalTasks,
        totalErrors,
        errorRate:     totalTasks > 0 ? parseFloat(((totalErrors / totalTasks) * 100).toFixed(2)) : 0,
        capturedAt:    Date.now(),
      },
    };
  }

  // ─── CEO Escalation ────────────────────────────────────────────────────────

  /**
   * CEO 1% Decision Reduction Protocol — only Level 4 Critical events must
   * reach this method. Persists the escalation record to AUDIT_LOG KV and
   * records an audit trail entry.
   *
   * @param {object}      event           - Escalation descriptor.
   * @param {string}      event.action    - Action that triggered the escalation.
   * @param {string|null} event.agentId   - Originating agent (null if system-level).
   * @param {number}      event.riskLevel - Should always be RISK_LEVELS.CRITICAL.
   * @param {number}      event.timestamp - Unix ms timestamp.
   * @returns {Promise<{ escalationId: string }>}
   */
  async escalateToCEO(event) {
    const escalationId = `ESC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const record = {
      escalationId,
      ...event,
      status:    'PENDING_CEO_REVIEW',
      createdAt: Date.now(),
    };

    // 30-day retention for escalation records.
    await this.env.AUDIT_LOG.put(
      `${KEY.CEO_ESCALATION}${escalationId}`,
      JSON.stringify(record),
      { expirationTtl: 60 * 60 * 24 * 30 },
    );

    await this.auditLog({
      type:          'CEO_ESCALATION',
      escalationId,
      action:        event.action,
      agentId:       event.agentId,
      riskLevel:     event.riskLevel,
    });

    return { escalationId };
  }

  // ─── Directives ───────────────────────────────────────────────────────────

  /**
   * Broadcasts a governance directive to all agents in the fleet. The directive
   * is written to KV so each agent can read / acknowledge it on its next poll cycle.
   *
   * @param {object}  directive
   * @param {string}  directive.type     - Directive type code (e.g. 'POLICY_UPDATE').
   * @param {string}  directive.message  - Human-readable instruction.
   * @param {object}  [directive.data]   - Optional structured data payload.
   * @returns {Promise<{ directiveId: string, recipientCount: number }>}
   */
  async broadcastDirective(directive) {
    this._assertInitialized();

    if (!directive?.type) throw new Error('broadcastDirective: directive.type is required.');

    const directiveId = `DIR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const recipients  = [...this.agentRegistry.keys()];

    const payload = {
      directiveId,
      ...directive,
      issuedAt:     Date.now(),
      recipients,
      acknowledged: [],
    };

    // 24-hour TTL — directives are short-lived.
    await this.env.CACHE.put(
      `${KEY.DIRECTIVE_PREFIX}${directiveId}`,
      JSON.stringify(payload),
      { expirationTtl: 86_400 },
    );

    await this.auditLog({
      type:           'DIRECTIVE_BROADCAST',
      directiveId,
      directiveType:  directive.type,
      recipientCount: recipients.length,
    });

    return { directiveId, recipientCount: recipients.length };
  }

  // ─── System Health ─────────────────────────────────────────────────────────

  /**
   * Computes overall system health as a weighted percentage of agent health
   * scores. Results are cached for {@link HEALTH_CACHE_TTL_MS} to reduce KV reads.
   *
   * @returns {Promise<{ healthPercent: number, status: 'NOMINAL'|'DEGRADED'|'CRITICAL'|'EMERGENCY', details: object }>}
   */
  async getSystemHealth() {
    this._assertInitialized();

    const now = Date.now();
    if (this._healthCache && now < this._healthCacheExpiry) {
      return this._healthCache;
    }

    const { summary } = await this.getFleetStatus();
    const healthPercent = parseFloat((summary.avgHealth * 100).toFixed(1));

    const status =
      healthPercent >= 90 ? 'NOMINAL'    :
      healthPercent >= 75 ? 'DEGRADED'   :
      healthPercent >= 50 ? 'CRITICAL'   :
                            'EMERGENCY';

    const result = {
      healthPercent,
      status,
      details: {
        totalAgents:     summary.total,
        healthyAgents:   summary.healthy,
        degradedAgents:  summary.degraded,
        activeWorkflows: summary.activeWorkflows,
        capturedAt:      summary.capturedAt,
      },
    };

    this._healthCache       = result;
    this._healthCacheExpiry = now + HEALTH_CACHE_TTL_MS;

    return result;
  }

  // ─── Audit Logging ─────────────────────────────────────────────────────────

  /**
   * Appends an entry to both the in-memory ring buffer and the persistent
   * AUDIT_LOG KV namespace. KV writes are fire-and-forget and never crash
   * the calling flow if they fail.
   *
   * @param {object} entry - Audit event data. A `timestamp` field is auto-injected.
   * @returns {Promise<void>}
   */
  async auditLog(entry) {
    const record = { ...entry, timestamp: entry.timestamp ?? Date.now() };

    // In-memory ring buffer.
    this._auditRing.push(record);
    if (this._auditRing.length > AUDIT_RING_SIZE) this._auditRing.shift();

    // Persist to KV — fire and forget.
    const key = `${KEY.AUDIT_PREFIX}${record.timestamp}-${Math.random().toString(36).slice(2, 6)}`;
    this.env.AUDIT_LOG.put(key, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 90 }).catch(() => {
      // Audit logging failures must never propagate.
    });
  }

  /**
   * Returns recent audit entries from the in-memory ring buffer.
   *
   * @param {number} [limit=50] - Maximum number of entries to return (newest-last).
   * @returns {object[]}
   */
  getRecentAuditEntries(limit = 50) {
    return this._auditRing.slice(-Math.abs(limit));
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /** @private Throws if init() has not been awaited. */
  _assertInitialized() {
    if (!this._initialized) {
      throw new Error('Orchestrator.init() must be awaited before calling any other method.');
    }
  }

  /**
   * Selects the best available agent for a task using a weighted scoring
   * heuristic: division match > capability match > lowest load / task count.
   *
   * @private
   * @param {object} task
   * @returns {object|null} Agent descriptor, or null if none are available.
   */
  _selectAgent(task) {
    let best      = null;
    let bestScore = -Infinity;

    for (const [agentId, descriptor] of this.agentRegistry) {
      if (!this._isAgentAvailable(agentId)) continue;

      const state = this.agentStates.get(agentId) ?? {};
      let score   = 0;

      if (descriptor.division === task.division)              score += 10;
      if (descriptor.capabilities?.includes(task.type))       score +=  5;
      if (task.priority === 'critical' && state.currentTask == null) score += 3;

      // Penalise busy agents.
      score -= (state.tasksProcessed ?? 0) * 0.001;

      if (score > bestScore) {
        bestScore = score;
        best      = descriptor;
      }
    }

    return best;
  }

  /**
   * Returns true if an agent is in a state that can accept new work.
   *
   * @private
   * @param {string} agentId
   * @returns {boolean}
   */
  _isAgentAvailable(agentId) {
    const state = this.agentStates.get(agentId);
    if (!state) return false;
    return !['paused', 'error', 'decommissioned', 'maintenance'].includes(state.lifecycleState);
  }

  /**
   * Computes a normalised health score (0–1) for an agent based on its
   * lifecycle state and accumulated error count.
   *
   * @private
   * @param {string} agentId
   * @returns {number} Value between 0 and 1, inclusive.
   */
  _getAgentHealthScore(agentId) {
    const state = this.agentStates.get(agentId);
    if (!state) return 0;

    const BASE_SCORES = {
      active:         1.00,
      executing:      0.95,
      standby:        0.90,
      initializing:   0.80,
      training:       0.70,
      paused:         0.50,
      maintenance:    0.40,
      error:          0.10,
      decommissioned: 0.00,
    };

    const base        = BASE_SCORES[state.lifecycleState] ?? 0.50;
    const errorPenalty = Math.min(0.50, (state.errorCount ?? 0) * 0.02);
    return Math.max(0, base - errorPenalty);
  }

  /**
   * Delegates execution of a single workflow step to the assigned agent.
   * In production this should route through the MessageBus / TaskDispatcher.
   *
   * @private
   * @param {object} step    - Step descriptor from the workflow definition.
   * @param {object} context - Accumulated context from prior steps.
   * @returns {Promise<{ status: string, output: object }>}
   */
  async _executeStep(step, context) {
    const state = this.agentStates.get(step.agentId);
    if (state) {
      state.lastActive     = Date.now();
      state.tasksProcessed = (state.tasksProcessed ?? 0) + 1;
    }
    // In production, replace this with a real agent invocation.
    return { status: 'completed', output: { ...context, [`${step.id}_result`]: 'ok' } };
  }

  /**
   * Constructs the initial mutable runtime state for a freshly loaded agent.
   *
   * @private
   * @param {object} descriptor - Static agent descriptor from the registry.
   * @returns {object}
   */
  _buildInitialState(descriptor) {
    return {
      lifecycleState: descriptor.initialState ?? 'standby',
      startedAt:      Date.now(),
      lastActive:     null,
      tasksProcessed: 0,
      errorCount:     0,
      currentTask:    null,
    };
  }

  /**
   * Generates a default 40-agent registry (5 agents per division) used when
   * no registry entry exists in KV. Each agent gets two base capabilities.
   *
   * @private
   * @returns {object[]}
   */
  _buildDefaultRegistry() {
    const roles  = ['Analyst', 'Coordinator', 'Specialist', 'Lead', 'Monitor'];
    const agents = [];
    let seq      = 1;

    for (const [, divCode] of Object.entries(DIVISIONS)) {
      for (let i = 0; i < 5; i++) {
        const role = roles[i % roles.length];
        agents.push({
          id:           `CKA-${String(seq).padStart(3, '0')}`,
          name:         `${divCode} ${role}`,
          division:     divCode,
          role,
          capabilities: [
            `${divCode.toLowerCase()}-analysis`,
            `${divCode.toLowerCase()}-reporting`,
          ],
          initialState: 'standby',
        });
        seq++;
        if (agents.length === 40) return agents;
      }
    }

    return agents;
  }
}

export default Orchestrator;
