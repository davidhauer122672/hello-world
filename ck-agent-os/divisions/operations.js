/**
 * @file operations.js
 * @division OPS — Operations
 * @description Division controller for Operations. Manages workflow orchestration,
 * property management, task dispatch, QA monitoring, and documentation.
 * Primary integrations with Airtable (Tasks, Properties, Maintenance tables).
 *
 * Agents: Conductor, Steward, Dispatch, Guardian, Chronicle (5 total)
 */

/** Task types handled by the Operations division. */
export const OPS_TASK_TYPES = {
  WORKFLOW_ORCHESTRATION:  'ops.workflow_orchestration',
  PROPERTY_MANAGEMENT:     'ops.property_management',
  TASK_DISPATCH:           'ops.task_dispatch',
  QA_REVIEW:               'ops.qa_review',
  DOCUMENTATION:           'ops.documentation',
  WORK_ORDER_CREATE:       'ops.work_order_create',
  WORK_ORDER_UPDATE:       'ops.work_order_update',
  INSPECTION_SCHEDULE:     'ops.inspection_schedule',
  SLA_MONITOR:             'ops.sla_monitor',
  MAINTENANCE_REQUEST:     'ops.maintenance_request',
};

/** Airtable table identifiers used by the Operations division. */
const AIRTABLE_TABLES = {
  TASKS:       'Tasks',
  PROPERTIES:  'Properties',
  MAINTENANCE: 'Maintenance',
};

/** Ordered list of agents within the Operations division. */
const AGENTS = ['Conductor', 'Steward', 'Dispatch', 'Guardian', 'Chronicle'];

export class OperationsController {
  /**
   * @param {object} env          - Cloudflare Worker environment bindings.
   * @param {object} orchestrator - Master Orchestrator instance.
   */
  constructor(env, orchestrator) {
    this.env          = env;
    this.orchestrator = orchestrator;
    this.divisionCode = 'OPS';
    this.divisionName = 'Operations';
    this.agents       = Object.fromEntries(AGENTS.map(name => [name, { name, status: 'idle', tasksCompleted: 0 }]));
    this.taskLog      = [];
    this.startedAt    = Date.now();

    /** Active SLA timers keyed by work order ID. */
    this.slaTimers    = new Map();
  }

  /**
   * Route an incoming task to the appropriate Operations agent.
   *
   * @param {object} task         - Task descriptor.
   * @param {string} task.type    - One of OPS_TASK_TYPES.
   * @param {object} task.payload - Task-specific data.
   * @returns {Promise<object>} Result from the handling agent.
   */
  async handleTask(task) {
    const { type, payload } = task;

    switch (type) {
      case OPS_TASK_TYPES.WORKFLOW_ORCHESTRATION:
        return this._dispatch('Conductor', task);

      case OPS_TASK_TYPES.PROPERTY_MANAGEMENT:
        return this._dispatch('Steward', task);

      case OPS_TASK_TYPES.TASK_DISPATCH:
        return this._dispatchWorkTask(payload);

      case OPS_TASK_TYPES.QA_REVIEW:
        return this._dispatch('Guardian', task);

      case OPS_TASK_TYPES.DOCUMENTATION:
        return this._dispatch('Chronicle', task);

      case OPS_TASK_TYPES.WORK_ORDER_CREATE:
        return this._createWorkOrder(payload);

      case OPS_TASK_TYPES.WORK_ORDER_UPDATE:
        return this._updateWorkOrder(payload);

      case OPS_TASK_TYPES.INSPECTION_SCHEDULE:
        return this._scheduleInspection(payload);

      case OPS_TASK_TYPES.SLA_MONITOR:
        return this._runSLACheck(payload);

      case OPS_TASK_TYPES.MAINTENANCE_REQUEST:
        return this._handleMaintenanceRequest(payload);

      default:
        return { success: false, error: `Unknown OPS task type: ${type}` };
    }
  }

  /**
   * Create a new work order record in Airtable and start its SLA timer.
   * @param {object} payload - Work order fields.
   * @returns {Promise<object>} Created record ID and SLA details.
   */
  async _createWorkOrder(payload) {
    const record = await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.MAINTENANCE, payload);
    if (record?.id && payload.slaDueAt) {
      this.slaTimers.set(record.id, { dueAt: payload.slaDueAt, createdAt: Date.now() });
    }
    return this._dispatch('Dispatch', {
      type:    OPS_TASK_TYPES.WORK_ORDER_CREATE,
      payload: { ...payload, recordId: record?.id },
    });
  }

  /**
   * Update an existing work order record in Airtable.
   * @param {object} payload - Updated fields including recordId.
   */
  async _updateWorkOrder(payload) {
    const { recordId, ...fields } = payload;
    await this.env.AIRTABLE_SERVICE?.updateRecord(AIRTABLE_TABLES.MAINTENANCE, recordId, fields);
    if (fields.status === 'Completed') this.slaTimers.delete(recordId);
    return this._dispatch('Steward', { type: OPS_TASK_TYPES.WORK_ORDER_UPDATE, payload });
  }

  /**
   * Schedule a property inspection via Steward and log in Airtable Properties table.
   * @param {object} payload - Property ID, inspection date, inspector.
   */
  async _scheduleInspection(payload) {
    await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.PROPERTIES, {
      type:        'Inspection',
      scheduledAt: payload.scheduledAt,
      propertyId:  payload.propertyId,
    });
    return this._dispatch('Steward', { type: OPS_TASK_TYPES.INSPECTION_SCHEDULE, payload });
  }

  /**
   * Scan active SLA timers and escalate any breached work orders.
   * @param {object} payload - Optional filter params.
   */
  async _runSLACheck(payload) {
    const now      = Date.now();
    const breached = [];
    for (const [id, timer] of this.slaTimers.entries()) {
      if (now > new Date(timer.dueAt).getTime()) {
        breached.push(id);
      }
    }
    return this._dispatch('Guardian', {
      type:    OPS_TASK_TYPES.SLA_MONITOR,
      payload: { ...payload, breachedWorkOrders: breached },
    });
  }

  /**
   * Handle an inbound maintenance request end-to-end.
   * Creates a work order, assigns to Dispatch, flags for Guardian QA.
   * @param {object} payload - Maintenance request details.
   */
  async _handleMaintenanceRequest(payload) {
    const workOrder = await this._createWorkOrder({ ...payload, status: 'Open' });
    return this._dispatch('Dispatch', { type: OPS_TASK_TYPES.TASK_DISPATCH, payload: { workOrder } });
  }

  /**
   * Dispatch a general work task and record in Airtable Tasks table.
   * @param {object} payload - Task assignment details.
   */
  async _dispatchWorkTask(payload) {
    await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.TASKS, payload);
    return this._dispatch('Dispatch', { type: OPS_TASK_TYPES.TASK_DISPATCH, payload });
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
   * Return current health and per-agent status for the Operations division.
   * @returns {object} Division status snapshot.
   */
  getStatus() {
    return {
      division:       this.divisionCode,
      name:           this.divisionName,
      healthy:        true,
      uptimeMs:       Date.now() - this.startedAt,
      agents:         Object.values(this.agents),
      taskCount:      this.taskLog.length,
      openSLATimers:  this.slaTimers.size,
    };
  }

  /**
   * Return Operations-specific KPIs (work orders, inspections, SLA compliance).
   * @returns {object} Division metrics.
   */
  getDivisionMetrics() {
    const completed   = this.taskLog.filter(t => t.success).length;
    const workOrders  = this.taskLog.filter(t => t.type === OPS_TASK_TYPES.WORK_ORDER_CREATE).length;
    const inspections = this.taskLog.filter(t => t.type === OPS_TASK_TYPES.INSPECTION_SCHEDULE).length;

    return {
      division:              this.divisionCode,
      totalTasksProcessed:   this.taskLog.length,
      successRate:           this.taskLog.length ? (completed / this.taskLog.length) : 1,
      workOrdersCreated:     workOrders,
      inspectionsScheduled:  inspections,
      activeSLATimers:       this.slaTimers.size,
      maintenanceRequests:   this.taskLog.filter(t => t.type === OPS_TASK_TYPES.MAINTENANCE_REQUEST).length,
      agentUtilization:      Object.fromEntries(
        Object.values(this.agents).map(a => [a.name, a.tasksCompleted])
      ),
    };
  }
}

export default OperationsController;
