/**
 * @file intelligence.js
 * @division INT — Intelligence
 * @description Division controller for Intelligence. Manages market research,
 * data analytics, competitive intelligence, and predictive modeling workflows.
 * Leverages the advanced-tier Claude API for deep analysis and uses market data feeds.
 *
 * Agents: Oracle, Scout, Cipher, Beacon, Forecast (5 total)
 * External: Claude API (advanced tier), market data feeds
 */

/** Task types handled by the Intelligence division. */
export const INT_TASK_TYPES = {
  MARKET_RESEARCH:       'int.market_research',
  DATA_ANALYTICS:        'int.data_analytics',
  COMPETITIVE_INTEL:     'int.competitive_intel',
  PREDICTIVE_MODELING:   'int.predictive_modeling',
  MARKET_ANALYSIS_REPORT:'int.market_analysis_report',
  COMPETITIVE_SWOT:      'int.competitive_swot',
  REVENUE_FORECAST:      'int.revenue_forecast',
  DATA_PIPELINE_RUN:     'int.data_pipeline_run',
  TREND_DETECTION:       'int.trend_detection',
};

/** Ordered list of agents within the Intelligence division. */
const AGENTS = ['Oracle', 'Scout', 'Cipher', 'Beacon', 'Forecast'];

export class IntelligenceController {
  /**
   * @param {object} env          - Cloudflare Worker environment bindings.
   * @param {object} orchestrator - Master Orchestrator instance.
   */
  constructor(env, orchestrator) {
    this.env          = env;
    this.orchestrator = orchestrator;
    this.divisionCode = 'INT';
    this.divisionName = 'Intelligence';
    this.agents       = Object.fromEntries(AGENTS.map(name => [name, { name, status: 'idle', tasksCompleted: 0 }]));
    this.taskLog      = [];
    this.startedAt    = Date.now();

    /** Cache for the most recent market snapshot, refreshed by data pipeline runs. */
    this.marketSnapshotAt = null;
  }

  /**
   * Route an incoming task to the appropriate Intelligence agent.
   *
   * @param {object} task         - Task descriptor.
   * @param {string} task.type    - One of INT_TASK_TYPES.
   * @param {object} task.payload - Task-specific data.
   * @returns {Promise<object>} Result from the handling agent.
   */
  async handleTask(task) {
    const { type, payload } = task;

    switch (type) {
      case INT_TASK_TYPES.MARKET_RESEARCH:
        return this._dispatch('Scout', task);

      case INT_TASK_TYPES.DATA_ANALYTICS:
        return this._dispatch('Cipher', task);

      case INT_TASK_TYPES.COMPETITIVE_INTEL:
        return this._dispatch('Scout', task);

      case INT_TASK_TYPES.PREDICTIVE_MODELING:
        return this._dispatch('Forecast', task);

      case INT_TASK_TYPES.MARKET_ANALYSIS_REPORT:
        return this._runMarketAnalysisReport(payload);

      case INT_TASK_TYPES.COMPETITIVE_SWOT:
        return this._runCompetitiveSWOT(payload);

      case INT_TASK_TYPES.REVENUE_FORECAST:
        return this._runRevenueForecast(payload);

      case INT_TASK_TYPES.DATA_PIPELINE_RUN:
        return this._runDataPipeline(payload);

      case INT_TASK_TYPES.TREND_DETECTION:
        return this._dispatch('Beacon', task);

      default:
        return { success: false, error: `Unknown INT task type: ${type}` };
    }
  }

  /**
   * Produce a full market analysis report.
   * Scout gathers raw data → Cipher analyses it → Oracle synthesises the final report.
   * @param {object} payload - Market segment, geography, date range.
   * @returns {Promise<object>} Compiled report result.
   */
  async _runMarketAnalysisReport(payload) {
    const raw      = await this._dispatch('Scout',  { type: INT_TASK_TYPES.MARKET_RESEARCH,  payload });
    const analysis = await this._dispatch('Cipher', { type: INT_TASK_TYPES.DATA_ANALYTICS,   payload: { ...payload, raw } });
    const report   = await this._dispatch('Oracle', { type: INT_TASK_TYPES.MARKET_ANALYSIS_REPORT, payload: { ...payload, analysis } });
    return { workflow: 'market_analysis_report', success: true, raw, analysis, report };
  }

  /**
   * Run a competitive SWOT analysis using advanced-tier Claude API.
   * Scout researches competitors → Cipher structures the SWOT → Oracle writes the brief.
   * @param {object} payload - Target company or market segment.
   * @returns {Promise<object>} SWOT analysis result.
   */
  async _runCompetitiveSWOT(payload) {
    const intel  = await this._dispatch('Scout',  { type: INT_TASK_TYPES.COMPETITIVE_INTEL, payload });
    const swot   = await this._dispatch('Cipher', { type: INT_TASK_TYPES.DATA_ANALYTICS,    payload: { ...payload, intel } });
    const brief  = await this._dispatch('Oracle', { type: INT_TASK_TYPES.COMPETITIVE_SWOT,  payload: { ...payload, swot } });
    return { workflow: 'competitive_swot', success: true, intel, swot, brief };
  }

  /**
   * Generate a revenue forecast using Forecast agent and market data feeds.
   * Beacon surfaces trend signals → Forecast builds the predictive model.
   * @param {object} payload - Forecast horizon, revenue streams, assumptions.
   * @returns {Promise<object>} Revenue forecast result.
   */
  async _runRevenueForecast(payload) {
    const trends   = await this._dispatch('Beacon',   { type: INT_TASK_TYPES.TREND_DETECTION,    payload });
    const forecast = await this._dispatch('Forecast', { type: INT_TASK_TYPES.PREDICTIVE_MODELING, payload: { ...payload, trends } });
    return { workflow: 'revenue_forecast', success: true, trends, forecast };
  }

  /**
   * Execute a full data pipeline run: ingest from market data feeds, refresh snapshot.
   * @param {object} payload - Data source configuration and filters.
   * @returns {Promise<object>} Pipeline execution result.
   */
  async _runDataPipeline(payload) {
    const feedData = await this.env.MARKET_DATA_SERVICE?.fetch(payload);
    this.marketSnapshotAt = Date.now();
    return this._dispatch('Cipher', {
      type:    INT_TASK_TYPES.DATA_PIPELINE_RUN,
      payload: { ...payload, feedData, snapshotAt: this.marketSnapshotAt },
    });
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
   * Return current health and per-agent status for the Intelligence division.
   * @returns {object} Division status snapshot.
   */
  getStatus() {
    return {
      division:          this.divisionCode,
      name:              this.divisionName,
      healthy:           true,
      uptimeMs:          Date.now() - this.startedAt,
      agents:            Object.values(this.agents),
      taskCount:         this.taskLog.length,
      marketSnapshotAt:  this.marketSnapshotAt,
    };
  }

  /**
   * Return Intelligence-specific KPIs (research runs, forecasts, SWOT analyses, pipeline runs).
   * @returns {object} Division metrics.
   */
  getDivisionMetrics() {
    const completed = this.taskLog.filter(t => t.success).length;

    return {
      division:              this.divisionCode,
      totalTasksProcessed:   this.taskLog.length,
      successRate:           this.taskLog.length ? (completed / this.taskLog.length) : 1,
      marketResearchRuns:    this.taskLog.filter(t => t.type === INT_TASK_TYPES.MARKET_RESEARCH).length,
      competitiveSWOTs:      this.taskLog.filter(t => t.type === INT_TASK_TYPES.COMPETITIVE_SWOT).length,
      revenueForecasts:      this.taskLog.filter(t => t.type === INT_TASK_TYPES.REVENUE_FORECAST).length,
      dataPipelineRuns:      this.taskLog.filter(t => t.type === INT_TASK_TYPES.DATA_PIPELINE_RUN).length,
      marketSnapshotAgeMs:   this.marketSnapshotAt ? Date.now() - this.marketSnapshotAt : null,
      agentUtilization:      Object.fromEntries(
        Object.values(this.agents).map(a => [a.name, a.tasksCompleted])
      ),
    };
  }
}

export default IntelligenceController;
