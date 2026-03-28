/**
 * @file executive.js
 * @division EXC — Executive Command
 * @description Division controller for Executive Command. Manages apex authority
 * agents, routes strategic tasks, and coordinates cross-division governance.
 * Reports directly to the Master Orchestrator.
 *
 * Agents: Sovereign, Meridian, Bastion, Prism, Vault (5 total)
 */

/** Task types handled by the Executive division. */
export const EXC_TASK_TYPES = {
  STRATEGIC_PLANNING:       'exc.strategic_planning',
  GOVERNANCE_ENFORCEMENT:   'exc.governance_enforcement',
  CAPITAL_ALLOCATION:       'exc.capital_allocation',
  PERFORMANCE_ANALYTICS:    'exc.performance_analytics',
  CEO_ESCALATION:           'exc.ceo_escalation',
  GOVERNANCE_BROADCAST:     'exc.governance_broadcast',
  CROSS_DIVISION_DIRECTIVE: 'exc.cross_division_directive',
  RISK_REVIEW:              'exc.risk_review',
};

/** Ordered list of agents within the Executive division. */
const AGENTS = ['Sovereign', 'Meridian', 'Bastion', 'Prism', 'Vault'];

export class ExecutiveController {
  /**
   * @param {object} env         - Cloudflare Worker environment bindings.
   * @param {object} orchestrator - Master Orchestrator instance for cross-division comms.
   */
  constructor(env, orchestrator) {
    this.env          = env;
    this.orchestrator = orchestrator;
    this.divisionCode = 'EXC';
    this.divisionName = 'Executive Command';
    this.agents       = Object.fromEntries(AGENTS.map(name => [name, { name, status: 'idle', tasksCompleted: 0 }]));
    this.taskLog      = [];
    this.startedAt    = Date.now();
  }

  /**
   * Route an incoming task to the appropriate Executive agent.
   * CEO escalation and governance broadcasts receive priority handling.
   *
   * @param {object} task         - Task descriptor.
   * @param {string} task.type    - One of EXC_TASK_TYPES.
   * @param {object} task.payload - Task-specific data.
   * @returns {Promise<object>} Result from the handling agent.
   */
  async handleTask(task) {
    const { type, payload } = task;

    switch (type) {
      case EXC_TASK_TYPES.STRATEGIC_PLANNING:
        return this._dispatch('Sovereign', task);

      case EXC_TASK_TYPES.GOVERNANCE_ENFORCEMENT:
        return this._dispatch('Bastion', task);

      case EXC_TASK_TYPES.CAPITAL_ALLOCATION:
        return this._dispatch('Vault', task);

      case EXC_TASK_TYPES.PERFORMANCE_ANALYTICS:
        return this._dispatch('Prism', task);

      case EXC_TASK_TYPES.CEO_ESCALATION:
        // Priority path: notify Sovereign immediately, log for audit
        await this._notifyCEO(payload);
        return this._dispatch('Sovereign', task);

      case EXC_TASK_TYPES.GOVERNANCE_BROADCAST:
        // Broadcast directive to all divisions via orchestrator
        return this._broadcastDirective(payload);

      case EXC_TASK_TYPES.CROSS_DIVISION_DIRECTIVE:
        return this._dispatch('Meridian', task);

      case EXC_TASK_TYPES.RISK_REVIEW:
        return this._dispatch('Bastion', task);

      default:
        return { success: false, error: `Unknown EXC task type: ${type}` };
    }
  }

  /**
   * Broadcast a governance directive to every registered division.
   * @param {object} payload - Directive content.
   * @returns {Promise<object>} Broadcast confirmation.
   */
  async _broadcastDirective(payload) {
    const divisions = this.orchestrator.getDivisionCodes();
    const results   = await Promise.allSettled(
      divisions.filter(code => code !== this.divisionCode)
              .map(code => this.orchestrator.sendDirective(code, payload))
    );
    return { success: true, broadcastCount: results.length, results };
  }

  /**
   * Trigger the CEO escalation notification pathway.
   * @param {object} payload - Escalation context.
   */
  async _notifyCEO(payload) {
    await this.env.CEO_NOTIFICATION_QUEUE?.send({ escalation: payload, ts: Date.now() });
  }

  /**
   * Internal task dispatch to a named agent.
   * @param {string} agentName - Target agent.
   * @param {object} task      - Task descriptor.
   * @returns {Promise<object>} Agent result.
   */
  async _dispatch(agentName, task) {
    const agent = this.agents[agentName];
    agent.status = 'busy';
    const result = await this.orchestrator.runAgent(this.divisionCode, agentName, task);
    agent.status = 'idle';
    agent.tasksCompleted += 1;
    this.taskLog.push({ agentName, type: task.type, ts: Date.now(), success: result?.success ?? true });
    return result;
  }

  /**
   * Return current health and per-agent status for the Executive division.
   * @returns {object} Division status snapshot.
   */
  getStatus() {
    return {
      division:   this.divisionCode,
      name:       this.divisionName,
      healthy:    true,
      uptimeMs:   Date.now() - this.startedAt,
      agents:     Object.values(this.agents),
      taskCount:  this.taskLog.length,
    };
  }

  /**
   * Return Executive-specific KPIs.
   * @returns {object} Division metrics.
   */
  getDivisionMetrics() {
    const completed  = this.taskLog.filter(t => t.success).length;
    const escalations = this.taskLog.filter(t => t.type === EXC_TASK_TYPES.CEO_ESCALATION).length;
    const broadcasts  = this.taskLog.filter(t => t.type === EXC_TASK_TYPES.GOVERNANCE_BROADCAST).length;

    return {
      division:              this.divisionCode,
      totalTasksProcessed:   this.taskLog.length,
      successRate:           this.taskLog.length ? (completed / this.taskLog.length) : 1,
      ceoEscalations:        escalations,
      governanceBroadcasts:  broadcasts,
      capitalAllocations:    this.taskLog.filter(t => t.type === EXC_TASK_TYPES.CAPITAL_ALLOCATION).length,
      agentUtilization:      Object.fromEntries(
        Object.values(this.agents).map(a => [a.name, a.tasksCompleted])
      ),
    };
  }
}

export default ExecutiveController;
