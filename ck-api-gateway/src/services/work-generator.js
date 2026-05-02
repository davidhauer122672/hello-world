/**
 * Work Generator Orchestrator — Continuous Enterprise Task Engine
 *
 * Generates actionable work cycles aligned to Coastal Key's 4 Core Goals,
 * sovereign governance, and 383-agent fleet. Every output is a measurable,
 * copy-paste-ready asset that drives NOI, gross margin, automation %, and
 * risk elimination.
 *
 * Divisions:
 *   D1: Governance & Risk (MCCO, INT, EXC)
 *   D2: Operations & Automation (OPS, SEN, TEC)
 *   D3: Financial & Growth (FIN, MKT, VEN)
 *   D4: Orchestration & Scaling (WEB, COOP, CDX)
 */

import { inference } from './anthropic.js';

// ── Core Goals ─────────────────────────────────────────────────────────────

export const CORE_GOALS = [
  { id: 'CG-1', target: 'Scale to 30+ properties by Sep 30 2026', metric: 'properties_under_management', threshold: 30, kpis: ['NPS >= 4.8', '>= 75% AI automation'] },
  { id: 'CG-2', target: 'Zero preventable incidents via predictive AI + low-cost sensors', metric: 'preventable_incidents', threshold: 0, kpis: ['sensor coverage 100%', 'response time < 30min'] },
  { id: 'CG-3', target: 'Break-even in 6 months, 40%+ gross margin by Month 12', metric: 'gross_margin_pct', threshold: 40, kpis: ['tools < $20/mo', 'NOI positive'] },
  { id: 'CG-4', target: 'Capture 8% of Treasure Coast seasonal/vacation segment by 2027', metric: 'market_share_pct', threshold: 8, kpis: ['Martin + St. Lucie + Indian River', 'seasonal/vacation focus'] },
];

// ── Fleet Divisions ────────────────────────────────────────────────────────

export const FLEET_DIVISIONS = {
  D1: { name: 'Governance & Risk', agents: 100, codes: ['MCCO', 'INT', 'EXC'], focus: 'Validation, compliance, risk elimination, governance audits' },
  D2: { name: 'Operations & Automation', agents: 120, codes: ['OPS', 'SEN', 'TEC'], focus: 'Workflows, maintenance, call campaigns, tech infrastructure' },
  D3: { name: 'Financial & Growth', agents: 100, codes: ['FIN', 'MKT', 'VEN'], focus: 'Revenue modeling, marketing, vendor management, pricing' },
  D4: { name: 'Orchestration & Scaling', agents: 63, codes: ['WEB', 'COOP', 'CDX'], focus: 'Web presence, partnerships, content domination, scaling' },
};

// ── Phase Config ───────────────────────────────────────────────────────────

export const CURRENT_PHASE = {
  name: 'Soft-Launch Scaling',
  period: 'Q2 2026',
  priorities: [
    'Property acquisition pipeline (target: 30 by Sep 2026)',
    'Retell AI outbound campaign activation',
    'Sensor deployment playbook',
    'Revenue-first automation (inspection checklists, billing, owner reports)',
  ],
};

// ── System Prompt ──────────────────────────────────────────────────────────

const WORK_GENERATOR_PROMPT = `You are the Coastal Key Work Generator Orchestrator, operating at Fortune 500 standards for enterprise AI agent fleets. Your sole purpose is to generate systems, building processes, maintenance tasks, and repair protocols for Coastal Key Enterprise.

NON-NEGOTIABLE RULES:
1. Strict professional CEO/Executive Administrator tone — precise, data-driven, authoritative, zero fluff.
2. Automation First: Every task must be executable with low-cost or free tools (<$20/mo) — Google Workspace, Canva, Softr/Glide, Retell AI, markdown/Notion.
3. Low-Cost Capitalization & Risk Zero Tolerance: Prioritize tasks that eliminate water/pest/security/insurance risks or scale automation toward 75%+.
4. Iterate or Die: Every task includes measurable success criteria, friction identification, and simplification steps.
5. Treasure Coast Obsession: All systems target Martin, St. Lucie, and Indian River Counties seasonal/vacation homes in the 2026 market.
6. Truth-Based Only: Deliver only copy-paste-ready assets (prompts, markdown, Sheets formulas, Canva specs). Never claim external deployments or live integrations.

MISSION: Coastal Key delivers AI-powered, predictive home watch and property management that eliminates risk and creates total peace of mind for Treasure Coast property owners — at a fraction of traditional cost and with zero preventable incidents.

4 CORE GOALS (validate every task against these):
CG-1: Scale to 30+ properties by Sep 30 2026 with NPS >= 4.8 and >= 75% AI automation.
CG-2: Zero preventable incidents via predictive AI + low-cost sensors.
CG-3: Break-even in 6 months, 40%+ gross margin by Month 12 using <$20/mo tools.
CG-4: Capture 8% of Treasure Coast seasonal/vacation segment by 2027.

383-AGENT FLEET (4 divisions):
D1: Governance & Risk (100 agents) — MCCO, INT, EXC divisions
D2: Operations & Automation (120 agents) — OPS, SEN, TEC divisions
D3: Financial & Growth (100 agents) — FIN, MKT, VEN divisions
D4: Orchestration & Scaling (63 agents) — WEB, COOP, CDX divisions

CURRENT PHASE: Soft-Launch Scaling (Q2 2026)
- Property acquisition pipeline active (target: 30 by Sep 2026)
- Retell AI voice platform for inbound + outbound calls
- Sensor deployment playbook needed
- Revenue-first automation priority

OUTPUT FORMAT (strict JSON):
{
  "cycle_id": "WG-YYYY-MM-DD-NNN",
  "phase": "Soft-Launch Scaling",
  "tasks": [
    {
      "id": "TASK-NNN",
      "title": "...",
      "objective": "...",
      "assigned_divisions": ["D1", "D2"],
      "assigned_agents": ["OPS-001", "SEN-002"],
      "core_goals_served": ["CG-1", "CG-3"],
      "priority": "critical|high|medium",
      "steps": ["Step 1...", "Step 2..."],
      "deliverables": ["Copy-paste asset 1...", "Formula/template 2..."],
      "success_criteria": ["Metric >= threshold"],
      "friction_points": ["Potential blocker..."],
      "simplification": "How to reduce friction...",
      "roi_estimate": "Expected impact on NOI/margin/automation"
    }
  ],
  "fleet_utilization": { "assigned": N, "total": 383, "pct": N },
  "impact_projection": { "noi_impact": "...", "automation_delta": "...", "risk_reduction": "..." },
  "next_prompt": "Generate next Work Generator cycle focused on [area]"
}`;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Run a work generation cycle.
 *
 * @param {object} env — Worker env bindings
 * @param {object} options
 * @param {string} [options.focus] — Optional focus area
 * @param {string} [options.phase] — Override current phase
 * @param {number} [options.taskCount] — Number of tasks (3-5, default 5)
 * @returns {object} — Work cycle output
 */
export async function runCycle(env, options = {}) {
  const { focus, phase, taskCount = 5 } = options;

  const focusLine = focus ? `\n\nFOCUS AREA FOR THIS CYCLE: ${focus}` : '';
  const phaseLine = phase || CURRENT_PHASE.name;
  const date = new Date().toISOString().split('T')[0];

  const prompt = `Run Work Generator Cycle for ${date}.
Phase: ${phaseLine}
Generate exactly ${Math.min(Math.max(taskCount, 3), 5)} high-impact tasks.${focusLine}

Current priorities: ${CURRENT_PHASE.priorities.join('; ')}

Validate every task against the 4 Core Goals. Assign specific agent IDs from the fleet.
Output as the strict JSON format specified in your instructions.`;

  const result = await inference(env, {
    system: WORK_GENERATOR_PROMPT,
    prompt,
    tier: 'advanced',
    maxTokens: 4096,
    cacheKey: `workgen:${date}:${focus || 'general'}:${taskCount}`,
    cacheTtl: 900,
  });

  let cycle;
  try {
    const match = result.content.match(/\{[\s\S]*\}/);
    cycle = match ? JSON.parse(match[0]) : { raw: result.content };
  } catch {
    cycle = { raw: result.content };
  }

  return {
    engine: 'Work Generator Orchestrator',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    cycle,
    model: result.model,
    cached: result.cached,
    usage: result.usage,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Run a targeted system build cycle for a specific domain.
 */
export async function buildSystem(env, systemType, requirements = '') {
  const validTypes = [
    'inspection', 'onboarding', 'billing', 'maintenance',
    'sensor-deployment', 'owner-reporting', 'marketing-automation',
    'lead-pipeline', 'vendor-management', 'compliance', 'outbound-campaign',
  ];

  if (!validTypes.includes(systemType)) {
    throw new Error(`Invalid system type. Valid: ${validTypes.join(', ')}`);
  }

  const prompt = `Build a complete ${systemType} system for Coastal Key Property Management.

Requirements: ${requirements || 'Standard implementation aligned to Core Goals.'}

This must be a COMPLETE, DEPLOYABLE system — not a plan. Include:
1. Full process documentation (step-by-step)
2. All templates, formulas, and copy-paste assets
3. Airtable table/field design if needed
4. Automation triggers and workflows
5. Success metrics tied to Core Goals
6. Agent assignments from the 383-unit fleet

Output as JSON with keys: system_name, system_type, components (array of {name, type, content}), airtable_schema (if needed), automations (array), agent_assignments (array), success_metrics (array), estimated_roi.`;

  const result = await inference(env, {
    system: WORK_GENERATOR_PROMPT,
    prompt,
    tier: 'advanced',
    maxTokens: 4096,
    cacheKey: `workgen:build:${systemType}:${hashString(requirements)}`,
    cacheTtl: 1800,
  });

  let system;
  try {
    const match = result.content.match(/\{[\s\S]*\}/);
    system = match ? JSON.parse(match[0]) : { raw: result.content };
  } catch {
    system = { raw: result.content };
  }

  return {
    engine: 'Work Generator Orchestrator',
    mode: 'system_build',
    systemType,
    system,
    model: result.model,
    cached: result.cached,
    usage: result.usage,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Run a maintenance/repair diagnostic for an existing system.
 */
export async function diagnoseSystem(env, systemName, symptoms = '') {
  const prompt = `Run a maintenance and repair diagnostic on the "${systemName}" system.

Reported symptoms: ${symptoms || 'Routine maintenance check — no specific symptoms.'}

Produce:
1. Root cause analysis (if symptoms reported)
2. Repair protocol (step-by-step fix)
3. Preventive maintenance schedule
4. Automation opportunities to prevent recurrence
5. Agent assignments for monitoring
6. Impact on Core Goals if left unresolved

Output as JSON with keys: system_name, diagnosis, severity (critical/high/medium/low), root_cause, repair_protocol (array of steps), preventive_schedule, automation_opportunities (array), agent_assignments (array), goal_impact.`;

  const result = await inference(env, {
    system: WORK_GENERATOR_PROMPT,
    prompt,
    tier: 'standard',
    maxTokens: 3072,
    cacheKey: `workgen:diag:${hashString(systemName + symptoms)}`,
    cacheTtl: 900,
  });

  let diagnosis;
  try {
    const match = result.content.match(/\{[\s\S]*\}/);
    diagnosis = match ? JSON.parse(match[0]) : { raw: result.content };
  } catch {
    diagnosis = { raw: result.content };
  }

  return {
    engine: 'Work Generator Orchestrator',
    mode: 'system_diagnosis',
    diagnosis,
    model: result.model,
    cached: result.cached,
    usage: result.usage,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get the Work Generator dashboard — fleet status, goals, phase.
 */
export function getDashboard() {
  return {
    engine: 'Work Generator Orchestrator',
    status: 'online',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    phase: CURRENT_PHASE,
    coreGoals: CORE_GOALS,
    fleet: {
      total: 383,
      divisions: FLEET_DIVISIONS,
    },
    capabilities: {
      run_cycle: 'POST /v1/workgen/cycle',
      build_system: 'POST /v1/workgen/build',
      diagnose_system: 'POST /v1/workgen/diagnose',
      dashboard: 'GET /v1/workgen/dashboard',
      goals: 'GET /v1/workgen/goals',
      fleet: 'GET /v1/workgen/fleet',
    },
    validSystemTypes: [
      'inspection', 'onboarding', 'billing', 'maintenance',
      'sensor-deployment', 'owner-reporting', 'marketing-automation',
      'lead-pipeline', 'vendor-management', 'compliance', 'outbound-campaign',
    ],
    timestamp: new Date().toISOString(),
  };
}

// ── Utility ────────────────────────────────────────────────────────────────

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
