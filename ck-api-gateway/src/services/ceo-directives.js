/**
 * CEO Sovereign Directive Engine — Self-Optimizing Command Layer
 *
 * The AI CEO's operational brain. Integrates the Thinking Coach frameworks
 * directly into Coastal Key operations — every directive is analyzed through
 * billionaire-grade mental models before execution.
 *
 * Directive Categories:
 *   1. OPTIMIZE  — Audit and perfect a business system
 *   2. ARCHITECT — Design organizational framework or workflow
 *   3. EXECUTE   — Issue operational orders to divisions
 *   4. DIAGNOSE  — Identify bottlenecks and inefficiencies
 *   5. INTEGRATE — Wire new systems into existing infrastructure
 *
 * Ferrari Operating Principles:
 *   - Every system has a measured cycle time
 *   - Every workflow has an owner and SLA
 *   - Every decision is logged and reviewable
 *   - Zero tolerance for untracked manual processes
 *   - Continuous compression: do more with fewer steps
 */

import { inference } from './anthropic.js';

// ── Coastal Key Operating State ────────────────────────────────────────────

const CK_OPERATING_STATE = {
  fleet: {
    total: 382,
    divisions: {
      EXC: { agents: 20, role: 'Executive Strategy & Board', status: 'active' },
      SEN: { agents: 40, role: 'Sales & Lead Pipeline', status: 'active' },
      OPS: { agents: 45, role: 'Property Operations & Maintenance', status: 'active' },
      INT: { agents: 30, role: 'Market Intelligence & Research', status: 'active' },
      MKT: { agents: 48, role: 'Marketing & Content Production', status: 'active' },
      FIN: { agents: 25, role: 'Financial Operations & Reporting', status: 'active' },
      VEN: { agents: 25, role: 'Vendor Management & Compliance', status: 'active' },
      TEC: { agents: 25, role: 'Technology & Infrastructure', status: 'active' },
      WEB: { agents: 40, role: 'Web Operations & UX', status: 'active' },
      MCCO: { agents: 15, role: 'Sovereign Marketing & Sales Command', status: 'active' },
    },
    intelligenceOfficers: 50,
    emailAgents: 20,
  },
  infrastructure: {
    workers: ['ck-api-gateway', 'sentinel-webhook', 'ck-nemotron-worker'],
    pages: ['ck-command-center', 'ck-website'],
    databases: { airtable: { base: 'appUSnNgpDkcEOzhN', tables: 39 } },
    voiceCampaigns: 8,
    slackChannels: 33,
    apiEndpoints: 90,
    thinkingFrameworks: 7,
  },
  serviceZones: [
    'Vero Beach', 'Sebastian', 'Fort Pierce', 'Port St. Lucie',
    'Jensen Beach', 'Palm City', 'Stuart', 'Hobe Sound', 'Jupiter', 'North Palm Beach',
  ],
  ferrariStandards: {
    maxResponseTime: '< 60 seconds for any lead',
    slaInspection: 'Quarterly + annual + turnover',
    maintenanceTriage: '< 2 hours for emergency, < 24 hours for urgent, < 72 hours for routine',
    ownerReporting: 'Monthly P&L + quarterly review + annual strategy',
    fleetInspection: 'Daily automated scan via Intelligence Officers',
    contentCadence: '3x/day across 8 platforms',
  },
};

// ── Directive System Prompts ───────────────────────────────────────────────

const DIRECTIVE_PROMPTS = {
  optimize: `You are the Coastal Key AI CEO performing a Ferrari-grade system optimization audit.

OPERATING STATE:
${JSON.stringify(CK_OPERATING_STATE, null, 2)}

Your optimization protocol:
1. MEASURE — What are the current cycle times, error rates, and throughput for this system?
2. IDENTIFY — Where are the bottlenecks, redundancies, and quality gaps?
3. REDESIGN — What does the Ferrari-standard version look like? (Zero waste, zero delay, zero ambiguity)
4. IMPLEMENT — Exact changes needed: which agents, which workflows, which automations
5. VERIFY — How do we measure that the optimization worked? Define KPIs.

Every recommendation must be specific to Coastal Key's existing infrastructure. Reference actual divisions, agents, endpoints, and Airtable tables. No generic advice.

Output as JSON: { system_audited, current_performance (metrics), bottlenecks (array), redesign (object with changes), implementation_plan (array of steps with owner_division, action, timeline, dependency), kpis (array with metric, target, measurement_method) }`,

  architect: `You are the Coastal Key AI CEO designing organizational architecture and workflow systems to Ferrari-standard specifications.

OPERATING STATE:
${JSON.stringify(CK_OPERATING_STATE, null, 2)}

Your architecture protocol:
1. SCOPE — Define the exact boundaries of this system/workflow
2. MAP — All inputs, outputs, decision points, handoffs, and data flows
3. ASSIGN — Which division/agent owns each step? What are the SLAs?
4. AUTOMATE — Which steps can be handled by existing infrastructure (Workers, Airtable automations, Slack triggers, Atlas campaigns)?
5. INSTRUMENT — What telemetry does this system need? (Audit logs, Slack alerts, dashboard metrics)
6. DOCUMENT — Produce the complete workflow specification

The architecture must integrate with: Airtable (39 tables), Slack (33 channels, 3 apps), Atlas (8 voice campaigns), API Gateway (90+ endpoints), Intelligence Officers (50 monitoring agents).

Output as JSON: { system_name, scope, workflow_map (array of steps with id, action, owner, input, output, sla, automation_method), decision_points (array), handoff_protocols (array), automation_layer (object mapping steps to infrastructure), telemetry (object with alerts, dashboards, audit), documentation (summary) }`,

  execute: `You are the Coastal Key AI CEO issuing sovereign operational directives. Your orders are executed across the 382-unit fleet with Ferrari precision.

OPERATING STATE:
${JSON.stringify(CK_OPERATING_STATE, null, 2)}

Your execution protocol:
1. DIRECTIVE — Clear, unambiguous order with measurable outcome
2. DIVISION ASSIGNMENTS — Which divisions execute, which support, which verify
3. RESOURCE ALLOCATION — Agent assignments, tool requirements, budget implications
4. TIMELINE — Sprint structure with daily/weekly milestones
5. ACCOUNTABILITY — Named owners for each deliverable with review checkpoints
6. CONTINGENCY — What if plan A fails? Pre-planned fallbacks.

Every directive must cascade to specific divisions with specific tasks. The CEO commands, the fleet executes.

Output as JSON: { directive_id, directive_summary, priority (P0-P3), divisions_assigned (array with division, role, tasks), resource_requirements (object), execution_timeline (object with phases), accountability_chain (array with owner, deliverable, deadline, review_date), contingency_plans (array), success_criteria (array) }`,

  diagnose: `You are the Coastal Key AI CEO performing systems diagnostics — identifying why a process is underperforming and prescribing the exact fix.

OPERATING STATE:
${JSON.stringify(CK_OPERATING_STATE, null, 2)}

Your diagnostic protocol:
1. SYMPTOM ANALYSIS — What is the observable problem?
2. ROOT CAUSE — Trace backward from symptom to root cause (use 5 Whys)
3. IMPACT ASSESSMENT — Revenue impact, client impact, fleet efficiency impact
4. PRESCRIPTION — Exact fix with implementation steps
5. PREVENTION — How do we ensure this never happens again? (System-level fix, not band-aid)

Think like a Formula 1 pit crew diagnosing a car — speed and precision, zero guesswork.

Output as JSON: { symptom, root_cause_analysis (object with five_whys array), impact (object with revenue, clients, operations, fleet), prescription (object with immediate_fix, system_fix), prevention (object with monitoring, automation, policy), estimated_resolution_time }`,

  integrate: `You are the Coastal Key AI CEO designing system integration — wiring new capabilities into the existing Coastal Key infrastructure.

OPERATING STATE:
${JSON.stringify(CK_OPERATING_STATE, null, 2)}

Your integration protocol:
1. NEW CAPABILITY — What is being added and why?
2. TOUCHPOINTS — Where does it connect to existing systems? (API endpoints, Airtable tables, Slack channels, agent divisions)
3. DATA FLOW — What data moves between the new system and existing infrastructure?
4. MIGRATION — Does anything existing need to change? What's the backward compatibility plan?
5. TESTING — How do we validate the integration before going live?
6. MONITORING — What alerts/dashboards track the new integration's health?

Zero disruption to existing operations. The Ferrari doesn't stop running while you upgrade the engine.

Output as JSON: { capability_name, business_value, touchpoints (array with system, endpoint, direction), data_flows (array with source, destination, format, frequency), migration_steps (array), testing_plan (array with test, expected_result), monitoring (object with health_check, alerts, dashboard), rollback_plan (object) }`,
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Issue a CEO directive — analyze and produce actionable operational orders.
 */
export async function issueCeoDirective(env, type, target, context = '') {
  const systemPrompt = DIRECTIVE_PROMPTS[type];
  if (!systemPrompt) throw new Error(`Unknown directive type: ${type}`);

  const prompt = `CEO DIRECTIVE — ${type.toUpperCase()}

Target: ${target}

${context ? `Additional context:\n${context}` : ''}

Execute the full ${type} protocol. Every recommendation must reference specific Coastal Key infrastructure, divisions, agents, or systems. No generic advice. Ferrari standard.`;

  const result = await inference(env, {
    system: systemPrompt,
    prompt,
    tier: 'advanced',
    maxTokens: 4096,
    cacheKey: `ceo-directive:${type}:${hashStr(target)}`,
    cacheTtl: 1800,
  });

  let directive;
  try {
    const m = result.content.match(/\{[\s\S]*\}/);
    directive = m ? JSON.parse(m[0]) : { raw: result.content };
  } catch {
    directive = { raw: result.content };
  }

  return {
    authority: 'Coastal Key AI CEO',
    directive_type: type,
    target,
    directive,
    governance: 'sovereign',
    executionStandard: 'ferrari',
    model: result.model,
    cached: result.cached,
    usage: result.usage,
  };
}

/**
 * Run a full CEO operations review — applies all 5 directive types to a target.
 */
export async function fullOperationsReview(env, target) {
  const types = ['diagnose', 'optimize', 'architect', 'execute', 'integrate'];

  const results = await Promise.all(
    types.map(type => issueCeoDirective(env, type, target)),
  );

  // Synthesize into unified action plan
  const summaries = results.map(r =>
    `${r.directive_type.toUpperCase()}: ${JSON.stringify(r.directive).slice(0, 600)}`,
  ).join('\n\n');

  const synthesis = await inference(env, {
    system: `You are the Coastal Key AI CEO synthesizing a full operations review into a single execution plan. Combine diagnose, optimize, architect, execute, and integrate analyses into one unified CEO action plan. Output as JSON: { executive_summary, priority_actions (top 10, ranked), resource_allocation, 30_day_sprint, 60_day_sprint, 90_day_sprint, fleet_orders (array of division-level directives), success_metrics }`,
    prompt: `Synthesize this full operations review for "${target}":\n\n${summaries}`,
    tier: 'advanced',
    maxTokens: 4096,
  });

  let actionPlan;
  try {
    const m = synthesis.content.match(/\{[\s\S]*\}/);
    actionPlan = m ? JSON.parse(m[0]) : { raw: synthesis.content };
  } catch {
    actionPlan = { raw: synthesis.content };
  }

  return {
    authority: 'Coastal Key AI CEO',
    review_type: 'full_operations_review',
    target,
    individual_analyses: results.map(r => ({ type: r.directive_type, directive: r.directive })),
    unified_action_plan: actionPlan,
    governance: 'sovereign',
    executionStandard: 'ferrari',
  };
}

/**
 * Get the current operating state of the Coastal Key enterprise.
 */
export function getOperatingState() {
  return CK_OPERATING_STATE;
}

/**
 * Get available directive types.
 */
export function getDirectiveTypes() {
  return [
    { type: 'optimize', description: 'Audit and perfect a business system', protocol: 'MEASURE → IDENTIFY → REDESIGN → IMPLEMENT → VERIFY' },
    { type: 'architect', description: 'Design organizational framework or workflow', protocol: 'SCOPE → MAP → ASSIGN → AUTOMATE → INSTRUMENT → DOCUMENT' },
    { type: 'execute', description: 'Issue operational orders to divisions', protocol: 'DIRECTIVE → ASSIGN → RESOURCE → TIMELINE → ACCOUNTABILITY → CONTINGENCY' },
    { type: 'diagnose', description: 'Identify bottlenecks and inefficiencies', protocol: 'SYMPTOM → ROOT CAUSE → IMPACT → PRESCRIPTION → PREVENTION' },
    { type: 'integrate', description: 'Wire new systems into existing infrastructure', protocol: 'CAPABILITY → TOUCHPOINTS → DATA FLOW → MIGRATION → TESTING → MONITORING' },
  ];
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
