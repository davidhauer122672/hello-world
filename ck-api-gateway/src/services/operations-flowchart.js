/**
 * Operations Manager Flowchart — V1
 *
 * Linear workflow logic tree for property management operations.
 * Includes decision nodes, bottleneck flags, RACI matrix, and KPIs.
 * Designed so a NEW manager can run the department with THIS ALONE.
 *
 * Scales from small operation (< 50 properties) to mid-size (500+).
 */

const FLOWCHART_META = {
  id: 'CK-OPS-FLOW-V1',
  title: 'Operations Manager Workflow — Complete Logic Tree',
  version: '1.0.0',
  totalStages: 7,
  totalDecisionNodes: 12,
  scaleTiers: ['startup', 'growth', 'scale'],
};

const WORKFLOW_STAGES = [
  {
    id: 'STAGE-01',
    name: 'Lead Intake & Qualification',
    sequence: 1,
    owner: 'Sales / AI Agent',
    description: 'New property owner inquiry enters the pipeline. Qualify for fit.',
    steps: [
      { step: 1, action: 'Receive inquiry (web form, phone, referral, walk-in)', automated: true },
      { step: 2, action: 'Auto-enrich lead: property address → county records → Zillow estimate → flood zone', automated: true },
      { step: 3, action: 'Score lead: property type, location, owner profile, seasonal status', automated: true },
      { step: 4, action: 'Route: Score ≥ 7 → immediate callback. Score 4–6 → nurture sequence. Score < 4 → archive.', automated: true },
    ],
    decisionNode: {
      id: 'DN-01',
      question: 'Is the property in our service area AND does the owner match our ideal profile?',
      yes: 'Proceed to Property Assessment (STAGE-02)',
      no: 'Add to nurture list or refer to partner',
    },
    bottleneckFlag: 'Lead response time > 2 hours kills conversion by 60%',
    kpi: { name: 'Speed to Lead', target: '< 15 minutes', current: 'Automated' },
  },
  {
    id: 'STAGE-02',
    name: 'Property Assessment',
    sequence: 2,
    owner: 'Field Inspector / AI Agent',
    description: 'Physical and data assessment of the property before onboarding.',
    steps: [
      { step: 1, action: 'Schedule property walkthrough within 48 hours of qualification', automated: true },
      { step: 2, action: 'Execute 47-point inspection checklist (exterior, interior, systems, risks)', automated: false },
      { step: 3, action: 'Document with timestamped, geotagged photos (minimum 30 per property)', automated: false },
      { step: 4, action: 'AI risk assessment: property age, roof, plumbing, flood zone, pest history', automated: true },
      { step: 5, action: 'Generate property condition report with recommended service tier', automated: true },
    ],
    decisionNode: {
      id: 'DN-02',
      question: 'Does the property meet minimum condition standards OR is the owner willing to invest in remediation?',
      yes: 'Proceed to Proposal & Contract (STAGE-03)',
      no: 'Decline — document reasons, offer referral to remediation contractor',
    },
    bottleneckFlag: 'Inspection backlog > 5 days = lost deals',
    kpi: { name: 'Assessment Completion Time', target: '< 72 hours from lead', current: 'Manual — target for automation' },
  },
  {
    id: 'STAGE-03',
    name: 'Proposal & Contract',
    sequence: 3,
    owner: 'Sales Manager / AI Agent',
    description: 'Generate tailored proposal, negotiate terms, execute contract.',
    steps: [
      { step: 1, action: 'Auto-generate proposal based on assessment: service tier, pricing, scope', automated: true },
      { step: 2, action: 'Present proposal to owner (video call or in-person for high-value)', automated: false },
      { step: 3, action: 'Negotiate terms: management fee, sensor package, activation services', automated: false },
      { step: 4, action: 'Execute digital contract (DocuSign or equivalent)', automated: true },
      { step: 5, action: 'Process initial payment and sensor kit order (if applicable)', automated: true },
    ],
    decisionNode: {
      id: 'DN-03',
      question: 'Contract signed?',
      yes: 'Proceed to Onboarding (STAGE-04)',
      no: 'Enter follow-up sequence: 3-day, 7-day, 14-day, 30-day touchpoints',
    },
    bottleneckFlag: 'Proposal delivery > 24 hours after assessment = 40% close rate drop',
    kpi: { name: 'Proposal-to-Close Rate', target: '> 35%', current: 'Tracking' },
  },
  {
    id: 'STAGE-04',
    name: 'Property Onboarding',
    sequence: 4,
    owner: 'Operations Manager',
    description: 'Set up all systems, install sensors, configure workflows, activate monitoring.',
    steps: [
      { step: 1, action: 'Create property record in Airtable with all assessment data', automated: true },
      { step: 2, action: 'Configure owner portal account with dashboard access', automated: true },
      { step: 3, action: 'Install sensor kit (if applicable): water, humidity, temperature, security', automated: false },
      { step: 4, action: 'Set up maintenance calendar based on property profile', automated: true },
      { step: 5, action: 'Configure alert routing: owner preferences for SMS, email, portal', automated: true },
      { step: 6, action: 'Assign vendor network: plumber, electrician, pest, landscaper, HVAC', automated: true },
      { step: 7, action: 'Send owner welcome package with portal login, emergency contacts, FAQ', automated: true },
    ],
    decisionNode: {
      id: 'DN-04',
      question: 'Is the property currently vacant or occupied?',
      yes: 'Activate Vacant Property Monitoring (WF-CP-002)',
      no: 'Activate Occupied Mode — monthly check-ins, quarterly inspections',
    },
    bottleneckFlag: 'Onboarding > 7 days from contract = bad first impression',
    kpi: { name: 'Onboarding Completion', target: '< 5 business days', current: 'Manual — partially automated' },
  },
  {
    id: 'STAGE-05',
    name: 'Ongoing Operations',
    sequence: 5,
    owner: 'Operations Team / AI Fleet',
    description: 'Steady-state property management: monitoring, maintenance, communication.',
    steps: [
      { step: 1, action: 'Continuous sensor monitoring (24/7 for sensor-equipped properties)', automated: true },
      { step: 2, action: 'Execute proactive maintenance calendar (monthly/quarterly/annual tasks)', automated: true },
      { step: 3, action: 'Generate and deliver weekly owner status digest', automated: true },
      { step: 4, action: 'Process work orders: detect → classify → dispatch → track → resolve → report', automated: true },
      { step: 5, action: 'Monthly financial reconciliation: expenses, invoices, management fees', automated: true },
      { step: 6, action: 'Quarterly property condition update with photos', automated: false },
    ],
    decisionNode: {
      id: 'DN-05',
      question: 'Alert triggered? (sensor, inspection finding, owner request, weather event)',
      yes: 'Route to Emergency Response Protocol (STAGE-06)',
      no: 'Continue standard operations cycle',
    },
    bottleneckFlag: 'Manual work orders > 20% of total = automation gap',
    kpi: { name: 'Automation Coverage', target: '> 90%', current: '85%' },
  },
  {
    id: 'STAGE-06',
    name: 'Emergency Response & Resolution',
    sequence: 6,
    owner: 'Operations Manager / AI Dispatch',
    description: 'Handle alerts, emergencies, and non-routine events.',
    steps: [
      { step: 1, action: 'Classify alert: type (water/pest/security/weather/structural) + severity (1–5)', automated: true },
      { step: 2, action: 'Severity 1–2: log, schedule inspection within 72 hours', automated: true },
      { step: 3, action: 'Severity 3: auto-dispatch appropriate vendor, notify owner', automated: true },
      { step: 4, action: 'Severity 4–5: trigger emergency protocol — shutoff valves, vendor dispatch, owner call, insurance pre-doc', automated: true },
      { step: 5, action: 'Document response: photos, timestamps, vendor actions, costs', automated: false },
      { step: 6, action: 'Resolution confirmation from vendor + owner approval for costs > $500', automated: false },
      { step: 7, action: 'Post-incident report with root cause and preventive recommendation', automated: true },
    ],
    decisionNode: {
      id: 'DN-06',
      question: 'Is the event an insurance-claimable incident?',
      yes: 'Trigger insurance documentation workflow — compile evidence packet',
      no: 'Close incident, update maintenance calendar with preventive action',
    },
    bottleneckFlag: 'Response time > 1 hour for severity 3+ = owner churn risk',
    kpi: { name: 'Emergency Response Time', target: '< 45 minutes (sev 3+)', current: 'Automated dispatch' },
  },
  {
    id: 'STAGE-07',
    name: 'Review & Optimization',
    sequence: 7,
    owner: 'Operations Manager / CEO',
    description: 'Periodic review cycle: measure, optimize, iterate. No "finished" state.',
    steps: [
      { step: 1, action: 'Weekly: review open work orders, alert resolution times, owner satisfaction', automated: true },
      { step: 2, action: 'Monthly: financial review — revenue, costs, margin by property', automated: true },
      { step: 3, action: 'Monthly: churn analysis — any cancellations? Why? Preventable?', automated: true },
      { step: 4, action: 'Quarterly: full portfolio review — property conditions, vendor performance, pricing', automated: false },
      { step: 5, action: 'Quarterly: automation audit — what\'s still manual that shouldn\'t be?', automated: false },
      { step: 6, action: 'Annual: strategic review — market position, expansion readiness, tech roadmap', automated: false },
    ],
    decisionNode: {
      id: 'DN-07',
      question: 'Are all KPIs within target range?',
      yes: 'Maintain current operations — look for expansion opportunities',
      no: 'Identify underperforming area → root cause → corrective action within 14 days',
    },
    bottleneckFlag: 'Skipping reviews = silent decay. Non-negotiable cadence.',
    kpi: { name: 'KPI Achievement Rate', target: '> 80% of KPIs green', current: 'Tracking' },
  },
];

const RACI_MATRIX = {
  description: 'Responsibility Assignment Matrix — who does what at each stage',
  legend: { R: 'Responsible', A: 'Accountable', C: 'Consulted', I: 'Informed' },
  assignments: [
    { stage: 'Lead Intake', ceo: 'I', opsManager: 'A', fieldTeam: '-', aiFleet: 'R', vendors: '-' },
    { stage: 'Property Assessment', ceo: 'I', opsManager: 'A', fieldTeam: 'R', aiFleet: 'C', vendors: '-' },
    { stage: 'Proposal & Contract', ceo: 'C', opsManager: 'A', fieldTeam: '-', aiFleet: 'R', vendors: '-' },
    { stage: 'Onboarding', ceo: 'I', opsManager: 'R', fieldTeam: 'R', aiFleet: 'R', vendors: 'C' },
    { stage: 'Ongoing Operations', ceo: 'I', opsManager: 'A', fieldTeam: 'R', aiFleet: 'R', vendors: 'R' },
    { stage: 'Emergency Response', ceo: 'I', opsManager: 'A', fieldTeam: 'R', aiFleet: 'R', vendors: 'R' },
    { stage: 'Review & Optimization', ceo: 'A', opsManager: 'R', fieldTeam: 'C', aiFleet: 'R', vendors: 'I' },
  ],
};

const SCALE_TIERS = [
  { tier: 'startup', properties: '1–50', team: '1 ops manager + AI fleet', focus: 'Prove the model, nail the workflow' },
  { tier: 'growth', properties: '51–200', team: '1 ops manager + 1 field tech + AI fleet', focus: 'Systematize, delegate field work' },
  { tier: 'scale', properties: '201–500+', team: '1 ops director + 2 managers + 3 field techs + AI fleet', focus: 'Management layer, geographic expansion' },
];

// ── Public API ──

export function getOpsFlowchart() {
  return {
    ...FLOWCHART_META,
    stages: WORKFLOW_STAGES.map(s => ({
      id: s.id,
      name: s.name,
      sequence: s.sequence,
      owner: s.owner,
      stepCount: s.steps.length,
      hasDecisionNode: true,
      kpi: s.kpi.name,
    })),
    raci: RACI_MATRIX,
    scaleTiers: SCALE_TIERS,
    status: 'production-ready',
  };
}

export function getOpsStage(stageId) {
  return WORKFLOW_STAGES.find(s => s.id === stageId) || null;
}

export function getOpsStages() {
  return {
    document: FLOWCHART_META.title,
    totalStages: WORKFLOW_STAGES.length,
    totalDecisionNodes: FLOWCHART_META.totalDecisionNodes,
    stages: WORKFLOW_STAGES,
  };
}

export function getOpsRACI() {
  return RACI_MATRIX;
}

export function getOpsKPIs() {
  return {
    document: FLOWCHART_META.id,
    kpis: WORKFLOW_STAGES.map(s => ({
      stage: s.name,
      kpi: s.kpi,
      bottleneckFlag: s.bottleneckFlag,
    })),
    scaleTiers: SCALE_TIERS,
  };
}
