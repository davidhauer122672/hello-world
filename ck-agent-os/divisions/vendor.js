/**
 * @file vendor.js
 * @division VEN — Vendor & Partnerships
 * @description Division controller for Vendor & Partnerships. Manages vendor evaluation,
 * procurement, partnership development, and contractor scheduling.
 * Integrates with Airtable (Vendors table) and contract management systems.
 *
 * Agents: Alliance, Procure, Partner, Contractor (4 total)
 */

/** Task types handled by the Vendor & Partnerships division. */
export const VEN_TASK_TYPES = {
  VENDOR_EVALUATION:     'ven.vendor_evaluation',
  VENDOR_ONBOARD:        'ven.vendor_onboard',
  PROCUREMENT:           'ven.procurement',
  PARTNERSHIP_DEV:       'ven.partnership_dev',
  CONTRACTOR_SCHEDULE:   'ven.contractor_schedule',
  CONTRACTOR_REVIEW:     'ven.contractor_review',
  RFP_PROCESS:           'ven.rfp_process',
  CONTRACT_REVIEW:       'ven.contract_review',
  VENDOR_PERFORMANCE:    'ven.vendor_performance',
};

/** Airtable table identifiers used by the Vendor & Partnerships division. */
const AIRTABLE_TABLES = {
  VENDORS: 'Vendors',
};

/** Ordered list of agents within the Vendor & Partnerships division. */
const AGENTS = ['Alliance', 'Procure', 'Partner', 'Contractor'];

export class VendorController {
  /**
   * @param {object} env          - Cloudflare Worker environment bindings.
   * @param {object} orchestrator - Master Orchestrator instance.
   */
  constructor(env, orchestrator) {
    this.env          = env;
    this.orchestrator = orchestrator;
    this.divisionCode = 'VEN';
    this.divisionName = 'Vendor & Partnerships';
    this.agents       = Object.fromEntries(AGENTS.map(name => [name, { name, status: 'idle', tasksCompleted: 0 }]));
    this.taskLog      = [];
    this.startedAt    = Date.now();

    /** Active contractor assignments keyed by contractor ID. */
    this.activeContractors = new Map();
  }

  /**
   * Route an incoming task to the appropriate Vendor & Partnerships agent.
   *
   * @param {object} task         - Task descriptor.
   * @param {string} task.type    - One of VEN_TASK_TYPES.
   * @param {object} task.payload - Task-specific data.
   * @returns {Promise<object>} Result from the handling agent.
   */
  async handleTask(task) {
    const { type, payload } = task;

    switch (type) {
      case VEN_TASK_TYPES.VENDOR_EVALUATION:
        return this._runVendorEvaluation(payload);

      case VEN_TASK_TYPES.VENDOR_ONBOARD:
        return this._onboardVendor(payload);

      case VEN_TASK_TYPES.PROCUREMENT:
        return this._dispatch('Procure', task);

      case VEN_TASK_TYPES.PARTNERSHIP_DEV:
        return this._dispatch('Partner', task);

      case VEN_TASK_TYPES.CONTRACTOR_SCHEDULE:
        return this._scheduleContractor(payload);

      case VEN_TASK_TYPES.CONTRACTOR_REVIEW:
        return this._dispatch('Contractor', task);

      case VEN_TASK_TYPES.RFP_PROCESS:
        return this._runRFPProcess(payload);

      case VEN_TASK_TYPES.CONTRACT_REVIEW:
        return this._dispatch('Alliance', task);

      case VEN_TASK_TYPES.VENDOR_PERFORMANCE:
        return this._dispatch('Alliance', task);

      default:
        return { success: false, error: `Unknown VEN task type: ${type}` };
    }
  }

  /**
   * Run the vendor evaluation workflow.
   * Alliance scores the vendor → Procure validates commercial terms → record created in Airtable.
   * @param {object} payload - Vendor name, category, scoring criteria.
   * @returns {Promise<object>} Evaluation result.
   */
  async _runVendorEvaluation(payload) {
    const scoring     = await this._dispatch('Alliance', { type: VEN_TASK_TYPES.VENDOR_EVALUATION, payload });
    const commercial  = await this._dispatch('Procure',  { type: VEN_TASK_TYPES.PROCUREMENT,       payload: { ...payload, scoring } });
    await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.VENDORS, {
      name:       payload.vendorName,
      category:   payload.category,
      score:      scoring?.score,
      status:     'Under Evaluation',
      evaluatedAt: new Date().toISOString(),
    });
    return { workflow: 'vendor_evaluation', success: true, scoring, commercial };
  }

  /**
   * Onboard an approved vendor: update Airtable record and notify Partnership agent.
   * @param {object} payload - Vendor ID (Airtable record), contract start date.
   * @returns {Promise<object>} Onboarding confirmation.
   */
  async _onboardVendor(payload) {
    const { vendorRecordId, ...fields } = payload;
    await this.env.AIRTABLE_SERVICE?.updateRecord(AIRTABLE_TABLES.VENDORS, vendorRecordId, {
      ...fields,
      status:    'Active',
      onboardedAt: new Date().toISOString(),
    });
    return this._dispatch('Partner', { type: VEN_TASK_TYPES.VENDOR_ONBOARD, payload });
  }

  /**
   * Execute the RFP (Request for Proposal) process.
   * Procure drafts the RFP → Alliance distributes to shortlisted vendors →
   * Partner manages relationship communications.
   * @param {object} payload - Project scope, budget ceiling, vendor shortlist, deadline.
   * @returns {Promise<object>} RFP process result.
   */
  async _runRFPProcess(payload) {
    const rfpDraft    = await this._dispatch('Procure',  { type: VEN_TASK_TYPES.PROCUREMENT,    payload });
    const distributed = await this._dispatch('Alliance', { type: VEN_TASK_TYPES.CONTRACT_REVIEW, payload: { ...payload, rfpDraft } });
    const managed     = await this._dispatch('Partner',  { type: VEN_TASK_TYPES.PARTNERSHIP_DEV, payload: { ...payload, distributed } });
    return { workflow: 'rfp_process', success: true, rfpDraft, distributed, managed };
  }

  /**
   * Schedule a contractor for a work engagement and track the assignment.
   * @param {object} payload - Contractor ID, work order ID, start/end dates, site details.
   * @returns {Promise<object>} Scheduling confirmation.
   */
  async _scheduleContractor(payload) {
    const { contractorId, workOrderId, startDate, endDate } = payload;
    this.activeContractors.set(contractorId, { workOrderId, startDate, endDate, assignedAt: Date.now() });
    return this._dispatch('Contractor', { type: VEN_TASK_TYPES.CONTRACTOR_SCHEDULE, payload });
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
   * Return current health and per-agent status for the Vendor & Partnerships division.
   * @returns {object} Division status snapshot.
   */
  getStatus() {
    return {
      division:           this.divisionCode,
      name:               this.divisionName,
      healthy:            true,
      uptimeMs:           Date.now() - this.startedAt,
      agents:             Object.values(this.agents),
      taskCount:          this.taskLog.length,
      activeContractors:  this.activeContractors.size,
    };
  }

  /**
   * Return Vendor & Partnerships-specific KPIs (evaluations, onboardings, RFPs, contractors).
   * @returns {object} Division metrics.
   */
  getDivisionMetrics() {
    const completed = this.taskLog.filter(t => t.success).length;

    return {
      division:              this.divisionCode,
      totalTasksProcessed:   this.taskLog.length,
      successRate:           this.taskLog.length ? (completed / this.taskLog.length) : 1,
      vendorEvaluations:     this.taskLog.filter(t => t.type === VEN_TASK_TYPES.VENDOR_EVALUATION).length,
      vendorOnboardings:     this.taskLog.filter(t => t.type === VEN_TASK_TYPES.VENDOR_ONBOARD).length,
      rfpProcessesRun:       this.taskLog.filter(t => t.type === VEN_TASK_TYPES.RFP_PROCESS).length,
      contractorSchedulings: this.taskLog.filter(t => t.type === VEN_TASK_TYPES.CONTRACTOR_SCHEDULE).length,
      activeContractors:     this.activeContractors.size,
      agentUtilization:      Object.fromEntries(
        Object.values(this.agents).map(a => [a.name, a.tasksCompleted])
      ),
    };
  }
}

export default VendorController;
