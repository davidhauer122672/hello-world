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
    total: 383,
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
  optimize: `You are the Coastal Key AI CEO performing a Ferrari-grade system optimization audit.\n\nOPERATING STATE:\n${JSON.stringify(CK_OPERATING_STATE, null, 2)}\n\nYour optimization protocol:\n1. MEASURE — What are the current cycle times, error rates, and throughput for this system?\n2. IDENTIFY — Where are the bottlenecks, redundancies, and quality gaps?\n3. REDESIGN — What does the Ferrari-standard version look like?\n4. IMPLEMENT — Exact changes needed: which agents, which workflows, which automations\n5. VERIFY — How do we measure that the optimization worked? Define KPIs.\n\nEvery recommendation must be specific to Coastal Key's existing infrastructure.\n\nOutput as JSON: { system_audited, current_performance, bottlenecks, redesign, implementation_plan, kpis }`,

  architect: `You are the Coastal Key AI CEO designing organizational architecture and workflow systems to Ferrari-standard specifications.\n\nOPERATING STATE:\n${JSON.stringify(CK_OPERATING_STATE, null, 2)}\n\nYour architecture protocol:\n1. SCOPE — Define the exact boundaries\n2. MAP — All inputs, outputs, decision points, handoffs, and data flows\n3. ASSIGN — Which division/agent owns each step?\n4. AUTOMATE — Which steps can be handled by existing infrastructure?\n5. INSTRUMENT — What telemetry does this system need?\n6. DOCUMENT — Produce the complete workflow specification\n\nOutput as JSON: { system_name, scope, workflow_map, decision_points, handoff_protocols, automation_layer, telemetry, documentation }`,

  execute: `You are the Coastal Key AI CEO issuing sovereign operational directives. Your orders are executed across the 383-unit fleet with Ferrari precision.\n\nOPERATING STATE:\n${JSON.stringify(CK_OPERATING_STATE, null, 2)}\n\nYour execution protocol:\n1. DIRECTIVE — Clear, unambiguous order with measurable outcome\n2. DIVISION ASSIGNMENTS — Which divisions execute, support, verify\n3. RESOURCE ALLOCATION — Agent assignments, tool requirements, budget\n4. TIMELINE — Sprint structure with daily/weekly milestones\n5. ACCOUNTABILITY — Named owners with review checkpoints\n6. CONTINGENCY — Pre-planned fallbacks\n\nOutput as JSON: { directive_id, directive_summary, priority, divisions_assigned, resource_requirements, execution_timeline, accountability_chain, contingency_plans, success_criteria }`,

  diagnose: `You are the Coastal Key AI CEO performing systems diagnostics.\n\nOPERATING STATE:\n${JSON.stringify(CK_OPERATING_STATE, null, 2)}\n\nYour diagnostic protocol:\n1. SYMPTOM ANALYSIS — What is the observable problem?\n2. ROOT CAUSE — Trace backward (5 Whys)\n3. IMPACT ASSESSMENT — Revenue, client, fleet efficiency impact\n4. PRESCRIPTION — Exact fix with implementation steps\n5. PREVENTION — System-level fix, not band-aid\n\nOutput as JSON: { symptom, root_cause_analysis, impact, prescription, prevention, estimated_resolution_time }`,

  integrate: `You are the Coastal Key AI CEO designing system integration.\n\nOPERATING STATE:\n${JSON.stringify(CK_OPERATING_STATE, null, 2)}\n\nYour integration protocol:\n1. NEW CAPABILITY — What is being added and why?\n2. TOUCHPOINTS — Where does it connect?\n3. DATA FLOW — What data moves between systems?\n4. MIGRATION — Backward compatibility plan\n5. TESTING — Validation before going live\n6. MONITORING — Health tracking\n\nZero disruption to existing operations.\n\nOutput as JSON: { capability_name, business_value, touchpoints, data_flows, migration_steps, testing_plan, monitoring, rollback_plan }`,
};

// ── Public API ─────────────────────────────────────────────────────────────

export async function issueCeoDirective(env, type, target, context = '') {
  const systemPrompt = DIRECTIVE_PROMPTS[type];
  if (!systemPrompt) throw new Error(`Unknown directive type: ${type}`);

  const prompt = `CEO DIRECTIVE — ${type.toUpperCase()}\n\nTarget: ${target}\n\n${context ? `Additional context:\n${context}` : ''}\n\nExecute the full ${type} protocol. Every recommendation must reference specific Coastal Key infrastructure. Ferrari standard.`;

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

export async function fullOperationsReview(env, target) {
  const types = ['diagnose', 'optimize', 'architect', 'execute', 'integrate'];

  const results = await Promise.all(
    types.map(type => issueCeoDirective(env, type, target)),
  );

  const summaries = results.map(r =>
    `${r.directive_type.toUpperCase()}: ${JSON.stringify(r.directive).slice(0, 600)}`,
  ).join('\n\n');

  const synthesis = await inference(env, {
    system: `You are the Coastal Key AI CEO synthesizing a full operations review into a single execution plan. Combine diagnose, optimize, architect, execute, and integrate analyses into one unified CEO action plan. Output as JSON: { executive_summary, priority_actions, resource_allocation, 30_day_sprint, 60_day_sprint, 90_day_sprint, fleet_orders, success_metrics }`,
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

export function getOperatingState() {
  return CK_OPERATING_STATE;
}

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
