/**
 * Enterprise Transformation Scheduler — CK-STRAT-WCT-V1.0 Section 6
 *
 *   GET  /v1/transformation/schedule  — Full 47-task schedule with status
 *   GET  /v1/transformation/kpis      — KPI ledger summary from Airtable
 *   GET  /v1/transformation/risks     — Enterprise risk register summary
 *   POST /v1/transformation/alert     — Process alert from automated task
 *
 * Implements the automated heartbeat described in the Enterprise
 * Transformation Roadmap. All tasks are read-and-alert by default.
 * No automation executes financial transactions or signs contracts.
 */

import { listRecords, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

const KPI_TABLE = 'tblET1olcLfcwFiv1';
const RISK_TABLE = 'tbl6Zvs8OjzUdEHBg';
const OKR_TABLE = 'tbl2hqs1oFBqC2tto';

const TASK_SCHEDULE = {
  hourly: [
    { id: 'H-01', task: 'API gateway health check (latency p95, error rate)', surface: 'ck-api-gateway', green: 'p95<300ms, err<0.5%', yellow: 'p95>500ms', red: 'err>1%' },
    { id: 'H-02', task: 'Governance validator self-test', surface: 'governance.js', green: 'canary passes', red: 'any failure' },
    { id: 'H-03', task: 'Sovereign roster integrity check', surface: 'sovereign-roster.js', green: 'hash match', red: 'any drift' },
    { id: 'H-04', task: 'Storm/weather alert ingestion (Treasure Coast)', surface: 'NWS feeds', green: 'ingested <5min', red: 'watch/warning' },
    { id: 'H-05', task: 'Property camera/sensor uptime ping', surface: 'IoT layer', green: '>99.5%', yellow: '1 device down', red: '3+ devices' },
    { id: 'H-06', task: 'Cash position snapshot', surface: 'Treasury', green: 'no exceptions', red: '>10% deviation' },
    { id: 'H-07', task: 'Brand-voice gate self-test', surface: 'brand-voice skill', green: 'pass', red: 'failure' },
  ],
  daily: [
    { id: 'D-01', task: 'Executive briefing (risk, weather, financials)', owner: 'CEO', green: 'delivered by 06:00 ET', yellow: 'late' },
    { id: 'D-02', task: 'Pre-commit governance hook scan', owner: 'TEC', green: 'zero banned matches', red: 'match found' },
    { id: 'D-03', task: 'DSCR and liquidity ratio recalculation', owner: 'CFO', green: '>=1.40x', yellow: '1.30x', red: '<1.20x' },
    { id: 'D-04', task: 'Open ticket aging and SLA breach scan', owner: 'CX', green: 'no ticket above SLA', yellow: '80% SLA', red: 'breach' },
    { id: 'D-05', task: 'Inspection report quality review (sample)', owner: 'OPS', green: '>98%', yellow: '95%', red: '<95%' },
    { id: 'D-06', task: 'Vendor compliance status (insurance, license)', owner: 'Legal/OPS', green: 'all current', red: 'lapse' },
    { id: 'D-07', task: 'Property condition exception report', owner: 'OPS', green: 'routed <4h', red: 'unrouted >24h' },
    { id: 'D-08', task: 'Cybersecurity vulnerability scan delta', owner: 'Security', green: 'zero new high/critical', red: 'new high/critical' },
    { id: 'D-09', task: 'Customer correspondence brand-voice audit', owner: 'MKT', green: '100% on-brand', red: 'deviation' },
    { id: 'D-10', task: 'Calendar and obligation register check', owner: 'CEO', green: 'zero past due', red: 'past due' },
    { id: 'D-11', task: 'Talent pipeline status', owner: 'HR', green: '<30 days-to-fill', yellow: '30 days', red: '45 days' },
    { id: 'D-12', task: 'Daily revenue vs plan', owner: 'Sales/OPS', green: 'within 5%', yellow: '-5%', red: '-10%' },
  ],
  weekly: [
    { id: 'W-01', task: 'Enterprise Risk Register refresh', owner: 'TEC+CFO', green: 'top 10 reviewed', yellow: 'score +15%', red: 'score +30%' },
    { id: 'W-02', task: 'OKR check-in across 15 divisions', owner: 'CEO', green: '80% on-track', red: 'division <60%' },
    { id: 'W-03', task: 'Pipeline review with risk flags', owner: 'Sales', green: 'coverage >3.0x', yellow: '2.5x', red: '2.0x' },
    { id: 'W-04', task: 'NPS pulse and verbatim review', owner: 'CX', green: '>=70', yellow: '60', red: '<50' },
    { id: 'W-05', task: 'Share-of-voice index', owner: 'MKT', green: 'trend positive', yellow: 'flat', red: 'decline' },
    { id: 'W-06', task: 'Cash forecast variance review', owner: 'CFO', green: '<5%', yellow: '8%', red: '12%' },
    { id: 'W-07', task: 'Vendor performance scorecard', owner: 'OPS', green: '90% green', red: 'tier-1 vendor red' },
    { id: 'W-08', task: 'Competitor intelligence digest', owner: 'MKT', green: 'top 3 profiled', red: 'material move' },
    { id: 'W-09', task: 'Capacity utilization review', owner: 'TEC', green: '70-85%', yellow: 'outside band', red: '>90% sustained' },
    { id: 'W-10', task: 'Voice wrapper quality sample', owner: 'TEC', green: '>98%', red: '<95%' },
    { id: 'W-11', task: 'Security findings age and owner', owner: 'Security', green: 'zero critical >7d', red: 'age breach' },
    { id: 'W-12', task: 'Knowledge management hygiene', owner: 'TEC', green: '95% reviewed <90d', yellow: '90%', red: '80%' },
    { id: 'W-13', task: 'Alert false-positive calibration', owner: 'TEC', green: '<5%', yellow: '10%', red: '>10%' },
  ],
  monthly: [
    { id: 'M-01', task: 'Five-day month-end close', owner: 'CFO', green: 'close <5 days', red: 'day 6' },
    { id: 'M-02', task: 'EBITDA bridge (volume, price, mix, cost)', owner: 'CFO', green: 'published close+2', red: 'delay' },
    { id: 'M-03', task: 'Concentration analysis', owner: 'CFO', green: 'no division >35%', red: 'threshold breach' },
    { id: 'M-04', task: 'Brand equity valuation refresh', owner: 'MKT', green: 'methodology consistent', red: 'decline >5%' },
    { id: 'M-05', task: 'Customer churn forecast', owner: 'CX', green: 'accuracy >80%', yellow: '<70%' },
    { id: 'M-06', task: 'Innovation portfolio stage-gate review', owner: 'TEC', green: 'at expected gate', red: 'stalled 2 cycles' },
    { id: 'M-07', task: 'SOC 2 control test sample', owner: 'Security', green: '>98%', red: '<95%' },
    { id: 'M-08', task: 'Regulatory change scan', owner: 'Legal', green: 'zero unaddressed', red: 'material w/o plan' },
    { id: 'M-09', task: 'Talent succession review (top 25)', owner: 'HR', green: 'all covered', red: 'uncovered role' },
    { id: 'M-10', task: 'Insurance/bond coverage adequacy', owner: 'Risk/Legal', green: 'adequate', red: 'gap' },
    { id: 'M-11', task: 'Climate/storm-season readiness', owner: 'OPS', green: '100% by Jun 1', red: '<100% by Jun 1' },
    { id: 'M-12', task: 'Board-grade KPI dashboard published', owner: 'CEO', green: 'live close+3', red: 'delay' },
    { id: 'M-13', task: 'Capital allocation review', owner: 'CFO+CEO', green: 'documented per GOV-V1.0', red: 'undocumented' },
    { id: 'M-14', task: 'Phase Map status update', owner: 'TEC', green: 'current status/blocker/owner', red: 'blocker >30d' },
    { id: 'M-15', task: 'Cybersecurity tabletop exercise', owner: 'Security', green: 'executed, gaps logged', red: 'critical gap' },
  ],
};

const INITIATIVES = [
  { id: 1, name: 'Enterprise Risk Register', owner: 'TEC+CFO', metric: 'Residual risk score trended', target: 'Top-quartile ERM maturity' },
  { id: 2, name: 'Closed-loop NPS + churn model', owner: 'CX', metric: 'Weekly NPS, monthly churn accuracy', target: 'NPS>=70, churn<4%' },
  { id: 3, name: '13-week rolling cash forecast', owner: 'CFO', metric: 'Forecast variance vs actual', target: 'Zero covenant surprises, DSCR>=1.40x' },
  { id: 4, name: 'Five-day month-end close', owner: 'Finance', metric: 'Days to close, variance explained %', target: '5-day by Q3, 3-day stretch' },
  { id: 5, name: 'Brand equity valuation + SOV', owner: 'MKT', metric: 'SOV % in Treasure Coast PM category', target: 'Valuation booked, SOV tracked weekly' },
  { id: 6, name: 'SOC 2 Type II readiness', owner: 'Security', metric: 'Control test pass rate, exception age', target: 'Audit-ready Q4, Type II window Q1-2027' },
  { id: 7, name: 'OKR cascade across 15 divisions', owner: 'CEO', metric: 'Division OKR confidence score', target: '90% clarity, 80% on-track at wk 6' },
  { id: 8, name: 'Innovation portfolio with stage-gate', owner: 'TEC', metric: 'Stage-gate conversion, NPV per project', target: '3 Go, 2 Kill, portfolio NPV positive' },
];

export function handleTransformationSchedule(request, env, ctx) {
  const totalTasks = Object.values(TASK_SCHEDULE).reduce((s, arr) => s + arr.length, 0);

  writeAudit(env, ctx, { route: '/v1/transformation/schedule', action: 'schedule_viewed' });

  return jsonResponse({
    document: 'CK-STRAT-WCT-V1.0',
    governance: 'CK-GOV-V1.0',
    totalTasks,
    initiatives: INITIATIVES,
    schedule: TASK_SCHEDULE,
    alertProtocol: {
      green: 'Auto-log, no notification',
      yellow: 'Division lead, 4-hour response SLA',
      red: 'CEO+TEC, 60-minute response SLA',
    },
    constraints: [
      'No automation executes financial transactions',
      'No automation signs contracts or alters license registrations',
      'All automation is read, analyze, alert, and propose',
      'Brand-voice gate required on all customer-facing automated sends',
      'Governance validator (validateProposal) gating on all initiatives',
    ],
  });
}

export async function handleTransformationKPIs(request, env, ctx) {
  const records = await listRecords(env, KPI_TABLE, { maxRecords: 20 });

  const kpis = records.map(r => ({
    id: r.id,
    name: r.fields['KPI Name'],
    category: r.fields['Category'],
    currentValue: r.fields['Current Value'],
    target: r.fields['Target (12mo)'],
    benchmark: r.fields['F500 Benchmark'],
    status: r.fields['Status'],
    trend: r.fields['Trend'],
    cadence: r.fields['Refresh Cadence'],
    owner: r.fields['Owner Division'],
  }));

  const summary = {
    total: kpis.length,
    green: kpis.filter(k => k.status === 'Green').length,
    yellow: kpis.filter(k => k.status === 'Yellow').length,
    red: kpis.filter(k => k.status === 'Red').length,
    notMeasured: kpis.filter(k => k.status === 'Not Measured').length,
  };

  writeAudit(env, ctx, { route: '/v1/transformation/kpis', action: 'kpis_viewed', summary });
  return jsonResponse({ kpis, summary, source: `Airtable ${KPI_TABLE}` });
}

export async function handleTransformationRisks(request, env, ctx) {
  const records = await listRecords(env, RISK_TABLE, { maxRecords: 25 });

  const risks = records.map(r => ({
    id: r.id,
    title: r.fields['Risk Title'],
    category: r.fields['Risk Category'],
    likelihood: r.fields['Likelihood (1-5)'],
    impact: r.fields['Impact (1-5)'],
    inherentScore: r.fields['Inherent Risk Score'],
    residualScore: r.fields['Residual Risk Score'],
    mitigations: r.fields['Mitigations'],
    owner: r.fields['Risk Owner'],
    status: r.fields['Status'],
    boardReportable: r.fields['Board Reportable'],
    nextReview: r.fields['Next Review Date'],
  }));

  const summary = {
    total: risks.length,
    active: risks.filter(r => r.status === 'Active').length,
    boardReportable: risks.filter(r => r.boardReportable).length,
    avgResidualScore: risks.length ? +(risks.reduce((s, r) => s + (r.residualScore || 0), 0) / risks.length).toFixed(1) : 0,
    highestResidual: risks.reduce((max, r) => Math.max(max, r.residualScore || 0), 0),
  };

  writeAudit(env, ctx, { route: '/v1/transformation/risks', action: 'risks_viewed', summary });
  return jsonResponse({ risks, summary, source: `Airtable ${RISK_TABLE}` });
}

export async function handleTransformationAlert(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON.', 400); }

  const { taskId, tier, value, message } = body;
  if (!taskId) return errorResponse('"taskId" is required.', 400);
  if (!tier || !['green', 'yellow', 'red'].includes(tier)) return errorResponse('"tier" must be green/yellow/red.', 400);

  const alert = {
    taskId,
    tier,
    value: value ?? null,
    message: message || '',
    timestamp: new Date().toISOString(),
    routing: tier === 'green' ? 'auto-log' : tier === 'yellow' ? 'division-lead-4h' : 'ceo-tec-60m',
  };

  if (env.AUDIT_LOG) {
    ctx.waitUntil(
      env.AUDIT_LOG.put(`alert:${taskId}:${Date.now()}`, JSON.stringify(alert), { expirationTtl: 30 * 86400 })
    );
  }

  writeAudit(env, ctx, { route: '/v1/transformation/alert', action: 'alert_processed', taskId, tier });
  return jsonResponse({ processed: true, alert });
}
