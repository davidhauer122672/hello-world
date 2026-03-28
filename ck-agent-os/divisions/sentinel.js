/**
 * @file sentinel.js
 * @division SEN — Sentinel Operations
 * @description Division controller for Sentinel Operations. Manages all lead generation,
 * enrichment, qualification, deal acceleration, and nurture campaign workflows.
 * Interfaces with Retell AI dialer agents, Airtable Leads, and Constant Contact.
 *
 * Agents: Sentinel Prime, Prospector, Enricher, Closer, Nurture, Qualifier (6 total)
 * External: Retell AI (40 dialer agents), Airtable Leads table, Constant Contact
 */

/** Task types handled by the Sentinel Operations division. */
export const SEN_TASK_TYPES = {
  LEAD_GENERATION:       'sen.lead_generation',
  LEAD_ENRICHMENT:       'sen.lead_enrichment',
  LEAD_QUALIFICATION:    'sen.lead_qualification',
  DEAL_ACCELERATION:     'sen.deal_acceleration',
  NURTURE_CAMPAIGN:      'sen.nurture_campaign',
  DIALER_DISPATCH:       'sen.dialer_dispatch',
  INVESTOR_ESCALATION:   'sen.investor_escalation',   // WF-3
  LONG_TAIL_NURTURE:     'sen.long_tail_nurture',     // WF-4
  BATTLE_PLAN:           'sen.battle_plan',           // SCAA-1
  APPOINTMENT_SET:       'sen.appointment_set',
  TRANSFER_CALL:         'sen.transfer_call',
};

/** Ordered list of agents within the Sentinel division. */
const AGENTS = ['Sentinel Prime', 'Prospector', 'Enricher', 'Closer', 'Nurture', 'Qualifier'];

export class SentinelController {
  /**
   * @param {object} env          - Cloudflare Worker environment bindings.
   * @param {object} orchestrator - Master Orchestrator instance.
   */
  constructor(env, orchestrator) {
    this.env          = env;
    this.orchestrator = orchestrator;
    this.divisionCode = 'SEN';
    this.divisionName = 'Sentinel Operations';
    this.agents       = Object.fromEntries(AGENTS.map(name => [name, { name, status: 'idle', tasksCompleted: 0 }]));
    this.taskLog      = [];
    this.startedAt    = Date.now();

    /** Daily rolling KPI counters — reset each day by Chronicle (OPS). */
    this.dailyKPIs = {
      callsDispatched:  0,
      connections:      0,
      qualifiedLeads:   0,
      transfers:        0,
      appointments:     0,
    };
  }

  /**
   * Route an incoming task to the appropriate Sentinel agent or external integration.
   *
   * @param {object} task         - Task descriptor.
   * @param {string} task.type    - One of SEN_TASK_TYPES.
   * @param {object} task.payload - Task-specific data.
   * @returns {Promise<object>} Result from the handling agent.
   */
  async handleTask(task) {
    const { type, payload } = task;

    switch (type) {
      case SEN_TASK_TYPES.LEAD_GENERATION:
        return this._dispatch('Prospector', task);

      case SEN_TASK_TYPES.LEAD_ENRICHMENT:
        return this._dispatch('Enricher', task);

      case SEN_TASK_TYPES.LEAD_QUALIFICATION:
        return this._dispatch('Qualifier', task);

      case SEN_TASK_TYPES.DEAL_ACCELERATION:
        return this._dispatch('Closer', task);

      case SEN_TASK_TYPES.NURTURE_CAMPAIGN:
        return this._runNurtureCampaign(payload);

      case SEN_TASK_TYPES.DIALER_DISPATCH:
        return this._dispatchRetellDialer(payload);

      case SEN_TASK_TYPES.INVESTOR_ESCALATION:   // WF-3
        return this._runWF3InvestorEscalation(payload);

      case SEN_TASK_TYPES.LONG_TAIL_NURTURE:     // WF-4
        return this._runWF4LongTailNurture(payload);

      case SEN_TASK_TYPES.BATTLE_PLAN:           // SCAA-1
        return this._dispatch('Sentinel Prime', task);

      case SEN_TASK_TYPES.APPOINTMENT_SET:
        this.dailyKPIs.appointments += 1;
        return this._dispatch('Closer', task);

      case SEN_TASK_TYPES.TRANSFER_CALL:
        this.dailyKPIs.transfers += 1;
        return this._dispatch('Sentinel Prime', task);

      default:
        return { success: false, error: `Unknown SEN task type: ${type}` };
    }
  }

  /**
   * Dispatch outbound calls to Retell AI dialer pool (up to 40 concurrent agents).
   * @param {object} payload - Dialer job specification (lead list, script ID, etc.).
   * @returns {Promise<object>} Dialer dispatch confirmation.
   */
  async _dispatchRetellDialer(payload) {
    const { leadIds = [], scriptId, maxConcurrent = 40 } = payload;
    this.dailyKPIs.callsDispatched += leadIds.length;
    const result = await this.env.RETELL_SERVICE?.dispatch({ leadIds, scriptId, maxConcurrent });
    return { success: true, dispatched: leadIds.length, retellResult: result };
  }

  /**
   * Execute WF-3 Investor Escalation workflow.
   * Qualifies investor prospect → enriches profile → routes to Closer.
   * @param {object} payload - Investor lead data.
   */
  async _runWF3InvestorEscalation(payload) {
    const enriched   = await this._dispatch('Enricher',   { type: SEN_TASK_TYPES.LEAD_ENRICHMENT,    payload });
    const qualified  = await this._dispatch('Qualifier',  { type: SEN_TASK_TYPES.LEAD_QUALIFICATION, payload: { ...payload, enriched } });
    const escalation = await this._dispatch('Closer',     { type: SEN_TASK_TYPES.DEAL_ACCELERATION,  payload: { ...payload, qualified } });
    return { workflow: 'WF-3', success: true, enriched, qualified, escalation };
  }

  /**
   * Execute WF-4 Long-Tail Nurture workflow.
   * Moves cold/inactive leads into Constant Contact drip sequences.
   * @param {object} payload - Segment and sequence configuration.
   */
  async _runWF4LongTailNurture(payload) {
    const campaign = await this._runNurtureCampaign(payload);
    return { workflow: 'WF-4', success: true, campaign };
  }

  /**
   * Launch a nurture campaign via Constant Contact.
   * @param {object} payload - Campaign parameters.
   */
  async _runNurtureCampaign(payload) {
    const result = await this.env.CONSTANT_CONTACT_SERVICE?.sendCampaign(payload);
    return this._dispatch('Nurture', { type: SEN_TASK_TYPES.NURTURE_CAMPAIGN, payload: { ...payload, ccResult: result } });
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
   * Return current health and per-agent status for the Sentinel division.
   * @returns {object} Division status snapshot.
   */
  getStatus() {
    return {
      division:  this.divisionCode,
      name:      this.divisionName,
      healthy:   true,
      uptimeMs:  Date.now() - this.startedAt,
      agents:    Object.values(this.agents),
      taskCount: this.taskLog.length,
    };
  }

  /**
   * Return Sentinel-specific KPIs (calls, connections, qualified leads, transfers, appointments).
   * @returns {object} Division metrics.
   */
  getDivisionMetrics() {
    const completed = this.taskLog.filter(t => t.success).length;

    return {
      division:            this.divisionCode,
      totalTasksProcessed: this.taskLog.length,
      successRate:         this.taskLog.length ? (completed / this.taskLog.length) : 1,
      daily: {
        callsDispatched: this.dailyKPIs.callsDispatched,
        connections:     this.dailyKPIs.connections,
        qualifiedLeads:  this.dailyKPIs.qualifiedLeads,
        transfers:       this.dailyKPIs.transfers,
        appointments:    this.dailyKPIs.appointments,
      },
      workflowCounts: {
        wf3InvestorEscalations: this.taskLog.filter(t => t.type === SEN_TASK_TYPES.INVESTOR_ESCALATION).length,
        wf4LongTailNurtures:    this.taskLog.filter(t => t.type === SEN_TASK_TYPES.LONG_TAIL_NURTURE).length,
        battlePlansExecuted:    this.taskLog.filter(t => t.type === SEN_TASK_TYPES.BATTLE_PLAN).length,
      },
      agentUtilization: Object.fromEntries(
        Object.values(this.agents).map(a => [a.name, a.tasksCompleted])
      ),
    };
  }
}

export default SentinelController;
