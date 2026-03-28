/**
 * @file finance.js
 * @division FIN — Finance
 * @description Division controller for Finance. Manages P&L reporting, revenue operations,
 * investor relations, compliance auditing, and cash management.
 * Integrates with Airtable (Investor Presentations table) and financial reporting systems.
 *
 * Agents: Ledger, Revenue, Investor, Auditor, Treasury (5 total)
 */

/** Task types handled by the Finance division. */
export const FIN_TASK_TYPES = {
  PNL_REPORT:            'fin.pnl_report',
  REVENUE_OPS:           'fin.revenue_ops',
  INVESTOR_RELATIONS:    'fin.investor_relations',
  COMPLIANCE_AUDIT:      'fin.compliance_audit',
  CASH_MANAGEMENT:       'fin.cash_management',
  MONTHLY_PNL:           'fin.monthly_pnl',
  QUARTERLY_INVESTOR:    'fin.quarterly_investor',
  EXPENSE_AUDIT:         'fin.expense_audit',
  BUDGET_ALLOCATION:     'fin.budget_allocation',
  FINANCIAL_PROJECTION:  'fin.financial_projection',
};

/** Airtable table identifiers used by the Finance division. */
const AIRTABLE_TABLES = {
  INVESTOR_PRESENTATIONS: 'Investor Presentations',
};

/** Ordered list of agents within the Finance division. */
const AGENTS = ['Ledger', 'Revenue', 'Investor', 'Auditor', 'Treasury'];

export class FinanceController {
  /**
   * @param {object} env          - Cloudflare Worker environment bindings.
   * @param {object} orchestrator - Master Orchestrator instance.
   */
  constructor(env, orchestrator) {
    this.env          = env;
    this.orchestrator = orchestrator;
    this.divisionCode = 'FIN';
    this.divisionName = 'Finance';
    this.agents       = Object.fromEntries(AGENTS.map(name => [name, { name, status: 'idle', tasksCompleted: 0 }]));
    this.taskLog      = [];
    this.startedAt    = Date.now();

    /** Timestamp of the most recently closed monthly P&L. */
    this.lastPnLClosedAt = null;
  }

  /**
   * Route an incoming task to the appropriate Finance agent.
   *
   * @param {object} task         - Task descriptor.
   * @param {string} task.type    - One of FIN_TASK_TYPES.
   * @param {object} task.payload - Task-specific data.
   * @returns {Promise<object>} Result from the handling agent.
   */
  async handleTask(task) {
    const { type, payload } = task;

    switch (type) {
      case FIN_TASK_TYPES.PNL_REPORT:
        return this._dispatch('Ledger', task);

      case FIN_TASK_TYPES.REVENUE_OPS:
        return this._dispatch('Revenue', task);

      case FIN_TASK_TYPES.INVESTOR_RELATIONS:
        return this._dispatch('Investor', task);

      case FIN_TASK_TYPES.COMPLIANCE_AUDIT:
        return this._dispatch('Auditor', task);

      case FIN_TASK_TYPES.CASH_MANAGEMENT:
        return this._dispatch('Treasury', task);

      case FIN_TASK_TYPES.MONTHLY_PNL:
        return this._runMonthlyPnL(payload);

      case FIN_TASK_TYPES.QUARTERLY_INVESTOR:
        return this._runQuarterlyInvestorReport(payload);

      case FIN_TASK_TYPES.EXPENSE_AUDIT:
        return this._runExpenseAudit(payload);

      case FIN_TASK_TYPES.BUDGET_ALLOCATION:
        return this._dispatch('Treasury', task);

      case FIN_TASK_TYPES.FINANCIAL_PROJECTION:
        return this._dispatch('Revenue', task);

      default:
        return { success: false, error: `Unknown FIN task type: ${type}` };
    }
  }

  /**
   * Execute the monthly P&L close workflow.
   * Revenue aggregates income data → Ledger reconciles and produces the statement →
   * Auditor validates for compliance.
   * @param {object} payload - Period (YYYY-MM), cost centres, revenue streams.
   * @returns {Promise<object>} Closed P&L result.
   */
  async _runMonthlyPnL(payload) {
    const revenues    = await this._dispatch('Revenue', { type: FIN_TASK_TYPES.REVENUE_OPS,    payload });
    const statement   = await this._dispatch('Ledger',  { type: FIN_TASK_TYPES.PNL_REPORT,     payload: { ...payload, revenues } });
    const validated   = await this._dispatch('Auditor', { type: FIN_TASK_TYPES.COMPLIANCE_AUDIT, payload: { ...payload, statement } });
    this.lastPnLClosedAt = Date.now();
    return { workflow: 'monthly_pnl', success: true, revenues, statement, validated };
  }

  /**
   * Produce the quarterly investor report and log it in Airtable Investor Presentations.
   * Ledger provides financials → Revenue adds projections → Investor drafts the deck.
   * @param {object} payload - Quarter (e.g. Q1-2026), audience, key metrics.
   * @returns {Promise<object>} Investor report result.
   */
  async _runQuarterlyInvestorReport(payload) {
    const financials   = await this._dispatch('Ledger',    { type: FIN_TASK_TYPES.PNL_REPORT,          payload });
    const projections  = await this._dispatch('Revenue',   { type: FIN_TASK_TYPES.FINANCIAL_PROJECTION, payload: { ...payload, financials } });
    const report       = await this._dispatch('Investor',  { type: FIN_TASK_TYPES.INVESTOR_RELATIONS,   payload: { ...payload, projections } });
    await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.INVESTOR_PRESENTATIONS, {
      quarter:     payload.quarter,
      preparedAt:  new Date().toISOString(),
      status:      'Ready for Review',
    });
    return { workflow: 'quarterly_investor_report', success: true, financials, projections, report };
  }

  /**
   * Run a full expense audit across all cost centres.
   * Auditor scans transactions → Treasury reviews cash exposure → Ledger posts adjustments.
   * @param {object} payload - Audit period, cost-centre filter, anomaly thresholds.
   * @returns {Promise<object>} Audit findings.
   */
  async _runExpenseAudit(payload) {
    const findings    = await this._dispatch('Auditor',  { type: FIN_TASK_TYPES.COMPLIANCE_AUDIT, payload });
    const cashReview  = await this._dispatch('Treasury', { type: FIN_TASK_TYPES.CASH_MANAGEMENT,  payload: { ...payload, findings } });
    const adjustments = await this._dispatch('Ledger',   { type: FIN_TASK_TYPES.PNL_REPORT,       payload: { ...payload, cashReview } });
    return { workflow: 'expense_audit', success: true, findings, cashReview, adjustments };
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
   * Return current health and per-agent status for the Finance division.
   * @returns {object} Division status snapshot.
   */
  getStatus() {
    return {
      division:         this.divisionCode,
      name:             this.divisionName,
      healthy:          true,
      uptimeMs:         Date.now() - this.startedAt,
      agents:           Object.values(this.agents),
      taskCount:        this.taskLog.length,
      lastPnLClosedAt:  this.lastPnLClosedAt,
    };
  }

  /**
   * Return Finance-specific KPIs (P&L cycles, investor reports, audits, cash events).
   * @returns {object} Division metrics.
   */
  getDivisionMetrics() {
    const completed = this.taskLog.filter(t => t.success).length;

    return {
      division:               this.divisionCode,
      totalTasksProcessed:    this.taskLog.length,
      successRate:            this.taskLog.length ? (completed / this.taskLog.length) : 1,
      monthlyPnLCycles:       this.taskLog.filter(t => t.type === FIN_TASK_TYPES.MONTHLY_PNL).length,
      quarterlyInvestorReports:this.taskLog.filter(t => t.type === FIN_TASK_TYPES.QUARTERLY_INVESTOR).length,
      expenseAuditsRun:       this.taskLog.filter(t => t.type === FIN_TASK_TYPES.EXPENSE_AUDIT).length,
      budgetAllocations:      this.taskLog.filter(t => t.type === FIN_TASK_TYPES.BUDGET_ALLOCATION).length,
      lastPnLClosedAt:        this.lastPnLClosedAt,
      agentUtilization:       Object.fromEntries(
        Object.values(this.agents).map(a => [a.name, a.tasksCompleted])
      ),
    };
  }
}

export default FinanceController;
