/**
 * V2.1 Master Prompt Production Engine
 *
 * Implements the full Coastal Key Master Prompt V2.1 as live operational code:
 * - 10 Marketing Assets (hero, LinkedIn, email, ads, referral, video, testimonial, mail, realtor, dashboard)
 * - 4 Executive Administrator Avatars (Daphne, Stephanie, Twin, Master Orchestrator)
 * - Notebook LM Research Campaign (gap analysis, RPA loops)
 * - NOI Impact Model from gap capitalization
 *
 * Standards: IQVIA research, Walmart/Amazon ops, UiPath automation, DeviQA testing,
 * AECON planning, Chanel/Gucci/LVMH design, Siemens/SpaceX engineering, David Yurman artistry.
 *
 * Governance: 100% aligned with Sovereign Governance, Mission, 4 Core Goals.
 */

import { getCollectionsAgentStatus } from './collections-agent.js';

// ── Executive Administrator Avatars ────────────────────────────────────────

export const AVATARS = {
  daphne: {
    id: 'AVT-001',
    name: 'Daphne',
    role: 'Governance Administrator',
    responsibilities: [
      'Weekly performance audit (CTR → NOI impact)',
      'Investor PDF generation and gap integration',
      'Governance compliance validation',
      'External stakeholder communications',
    ],
    assignments: ['Integrate gaps into Investor PDF V3', 'Prepare V3 for external sharing'],
    status: 'active',
  },
  stephanie: {
    id: 'AVT-002',
    name: 'Stephanie',
    role: 'Operations Administrator',
    responsibilities: [
      'UiPath RPA deployment for ad optimization',
      'Ongoing Notebook LM-style research loops',
      'Campaign workflow automation',
      'Operational process monitoring',
    ],
    assignments: ['UiPath RPA for research loops', 'Monitor first RPA research loop output'],
    status: 'active',
  },
  twin: {
    id: 'AVT-003',
    name: 'Twin',
    role: 'Financial/Retail Administrator',
    responsibilities: [
      'Margin/ROI validation',
      'NOI impact modeling of gap capitalization',
      'Sensitivity analysis with insurance data',
      'Monthly professional briefings with charts',
    ],
    assignments: ['Model NOI impact of gap capitalization', 'Run sensitivity analysis'],
    status: 'active',
  },
  orchestrator: {
    id: 'AVT-000',
    name: 'Master Orchestrator',
    role: 'System Command & Live Confirmation',
    responsibilities: [
      'Full system pull and live confirmation',
      'Q2 scaling brief in Grok iPhone 16 app',
      'Founder feedback logging',
      'Cross-avatar coordination',
    ],
    assignments: ['Schedule Q2 scaling brief', 'Deliver brief and log feedback'],
    status: 'active',
  },
};

// ── V2.1 Marketing Assets ──────────────────────────────────────────────────

export const MARKETING_ASSETS = [
  {
    id: 'MA-001',
    name: 'Hero Website Homepage',
    version: '2.1',
    type: 'web',
    headline: 'Peace of Mind, Engineered.',
    subheadline: 'AI-powered predictive home watch and property management for Treasure Coast seasonal homes. Zero preventable incidents. Insurer-grade compliance. 75%+ automation delivering 40%+ gross margins at fractional cost.',
    specs: { width: 1920, height: 1080, format: 'hero banner' },
    cta: 'Schedule AI Risk Assessment',
    ctaTarget: 'ReTell voice/portal link',
    designNotes: 'Golden-hour ocean-view property, semi-transparent AI dashboard overlay (risk score 0.0, automation meter 68%), coastal-navy/teal palette, LVMH-level clean typography.',
    status: 'LIVE',
    location: 'coastalkey-pm.com',
  },
  {
    id: 'MA-002',
    name: 'LinkedIn Professional Post',
    version: '2.1',
    type: 'social',
    format: '4-slide 1080x1080 carousel',
    copy: 'Treasure Coast owners and partners: 2026 insurance stabilization demands documented, predictive protection. Coastal Key\'s $3.99 Grok SuperGrok AI agent delivers continuous monitoring, GPS-timestamped reports, and real-time alerts — achieving 100% zero preventable incidents in deployment. Automation scaling to 75%, driving Revenue per Property while controlling OER. Exclusive to Martin, St. Lucie, Indian River Counties. Request portfolio risk report.',
    slides: ['Property + AI shield', 'Risk metrics chart', 'Stephanie Ops avatar briefing', 'CTA'],
    status: 'SCHEDULED',
    platform: 'LinkedIn',
  },
  {
    id: 'MA-003',
    name: 'Email Nurture Campaign',
    version: '2.1',
    type: 'email',
    subject: 'Your Treasure Coast Home Deserves Engineered Protection',
    body: 'Seasonal properties face silent risks. Coastal Key\'s AI agent predicts and prevents incidents using sensor + weather data, auto-generating insurer-ready reports. Pilots demonstrate break-even trajectory and 40%+ margin path through automation. Daily professional briefings and 24/7 ReTell concierge deliver total peace of mind at lower cost. Book your 15-minute risk alignment call.',
    format: 'Responsive HTML template',
    status: 'LIVE',
    platform: 'Mailchimp',
  },
  {
    id: 'MA-004',
    name: 'Google/Facebook Ad Set',
    version: '2.1',
    type: 'paid',
    headline: 'AI Home Watch – Treasure Coast – Zero Preventable Risk',
    description: 'Predictive monitoring. Insurer-compliant reports. 75%+ automation. Peace of mind for Stuart, Port St. Lucie, Vero Beach seasonal homes.',
    formats: ['1080x1080 static', '15-sec vertical video'],
    status: 'RUNNING',
    platforms: ['Meta', 'Google'],
    monitoring: 'UiPath A/B automation',
  },
  {
    id: 'MA-005',
    name: 'Referral Program One-Pager',
    version: '2.1',
    type: 'pdf',
    title: 'Coastal Key Partner Referral Program — Shared Value in Risk Reduction',
    keyPoints: ['Refer → concierge credits + priority AI reporting', 'Strengthen client insurance positioning in 2026 market', 'Professional briefings + one-click compliance', 'Quarterly trackable metrics (automation %, incidents, NPS)'],
    specs: { pages: 2, size: '8.5x11' },
    status: 'DEPLOYED',
  },
  {
    id: 'MA-006',
    name: 'Short-Form Video Reel',
    version: '2.1',
    type: 'video',
    voiceover: 'Traditional home watch is periodic. Coastal Key is predictive. Our AI monitors continuously, prevents incidents, documents for insurers — scaling automation to 75% with zero preventable events. Lower cost. Higher peace of mind. Engineered for the Treasure Coast.',
    specs: { width: 1080, height: 1920, format: 'MP4', duration: '15s', loop: true },
    status: 'UPLOADED',
    platforms: ['Instagram', 'YouTube', 'Website'],
  },
  {
    id: 'MA-007',
    name: 'Client Testimonial Case Study',
    version: '2.1',
    type: 'social',
    copy: 'Predictive alerts prevented a potential leak. AI report satisfied carrier instantly. Automation handles 70%+ of workflow. NPS 5/5.',
    specs: { width: 1200, height: 628 },
    status: 'READY',
  },
  {
    id: 'MA-008',
    name: 'Direct Mail Postcard',
    version: '2.1',
    type: 'print',
    front: 'Protected Treasure Coast home + AI Shield icon',
    back: 'Leaving your home? Coastal Key AI eliminates risk with predictive alerts and documented compliance — measurable automation progress and zero preventable incidents. Scan QR for free AI risk profile. Peace of Mind, Engineered.',
    status: 'DEPLOYED',
    vendor: 'Vistaprint',
  },
  {
    id: 'MA-009',
    name: 'Realtor Partnership Pitch Slide',
    version: '2.1',
    type: 'presentation',
    title: 'Why Top Treasure Coast Realtors Partner with Coastal Key',
    bullets: ['Differentiate listings with AI predictive service', 'Documented risk mitigation for 2026 insurance stability', 'Referral credits via 75% automated execution', 'Professional joint assets'],
    specs: { width: 1920, height: 1080 },
    status: 'LIVE',
    platform: 'Google Slides',
  },
  {
    id: 'MA-010',
    name: 'Internal Scale Dashboard Executive Summary',
    version: '2.1',
    type: 'dashboard',
    copy: 'Q2 2026: Automation 68% (to 75%), Zero Incidents 100%, Gross Margin 28–32% (to 40%+), NPS 4.7. Marketing assets driving low-CAC scaling to 30 properties.',
    specs: { width: 1080, height: 1080 },
    status: 'LIVE',
    platforms: ['Grok iPhone 16 app', 'Notion'],
  },
];

// ── Top 1% Real Estate Industry Gaps (Notebook LM Research) ────────────────

export const INDUSTRY_GAPS = [
  {
    rank: 1,
    gap: 'Predictive Vacancy & Insurance Risk Elimination in Seasonal Homes',
    insight: '90%+ of RE firms test AI, yet <15% achieve true predictive risk mitigation for vacancy clauses. Insurers demand GPS-timestamped, AI-documented proof. Manual home watch dominates; no scalable low-cost AI system delivers zero preventable incidents with automated insurer exports.',
    ckOpportunity: '$3.99 AI agent + low-cost sensors for Treasure Coast and global seasonal expansion',
    goalAlignment: ['Goal 2: Risk Supremacy', 'Goal 4: 8% segment capture'],
    noiImpact: '18-28% uplift vs. traditional operators',
    sources: ['PwC Emerging Trends 2026', 'JLL Global Perspectives', '2026 insurance data'],
  },
  {
    rank: 2,
    gap: 'Automation of Compliance & Tenant Experience at Scale',
    insight: 'AI adoption at 58% among PMs, but most tools superficial. No full RPA/UiPath-level workflows for end-to-end compliance, predictive maintenance, and personalized concierge. Tenant gaps cause churn and stranded assets ($2T global risk by 2030).',
    ckOpportunity: 'UiPath-automated client portal + 4 Executive Administrator avatars',
    goalAlignment: ['Goal 1: 75%+ automation', 'Goal 3: 40%+ gross margin'],
    noiImpact: '10-15% OER reduction',
    sources: ['Buildium PropTech report', 'Forbes AI adoption survey', 'BCG ecosystems analysis'],
  },
  {
    rank: 3,
    gap: 'Data-Center & Ecosystem Resilience Integration for Traditional Assets',
    insight: 'AI/data-center boom creates opportunity but traditional portfolios lack predictive integration for energy, obsolescence, and climate resilience. ESG pragmatic yet unmeasured at scale.',
    ckOpportunity: 'Extend predictive AI to bundled concierge/PM for resilient seasonal assets',
    goalAlignment: ['Low-Cost Capitalization', 'Risk Zero Tolerance'],
    noiImpact: '15-30% NAV uplift from smart security/AI ops',
    sources: ['CoStar AI acceleration data', 'BCG real estate ecosystems', 'PwC ESG benchmarks'],
  },
];

// ── NOI Impact Model ───────────────────────────────────────────────────────

export function calculateNOIGapImpact(portfolioSize = 30) {
  const revenuePerProperty = 295 * 12;
  const baseRevenue = portfolioSize * revenuePerProperty;
  const traditionalMargin = 0.30;
  const ckTargetMargin = 0.42;

  const traditionalNOI = baseRevenue * traditionalMargin;
  const ckNOI = baseRevenue * ckTargetMargin;

  const gapCapitalization = {
    predictiveRisk: { uplift: 0.23, description: 'Zero preventable incidents + automated compliance' },
    automation75: { uplift: 0.12, description: 'Labor/OER cut via 75% automation' },
    seasonalMoat: { uplift: 0.18, description: 'Higher LTV, lower churn from predictive vacancy coverage' },
  };

  const conservativeUplift = 0.10;
  const optimisticUplift = 0.30;
  const baseUplift = 0.23;

  return {
    portfolio: {
      properties: portfolioSize,
      revenuePerProperty,
      annualRevenue: baseRevenue,
    },
    traditional: {
      margin: (traditionalMargin * 100) + '%',
      noi: Math.round(traditionalNOI),
    },
    coastalKey: {
      targetMargin: (ckTargetMargin * 100) + '%',
      projectedNOI: Math.round(ckNOI),
      noiUplift: Math.round(ckNOI - traditionalNOI),
      upliftPercent: Math.round(((ckNOI - traditionalNOI) / traditionalNOI) * 100) + '%',
    },
    gapCapitalization,
    sensitivity: {
      conservative: { uplift: (conservativeUplift * 100) + '%', noi: Math.round(traditionalNOI * (1 + conservativeUplift)) },
      base: { uplift: (baseUplift * 100) + '%', noi: Math.round(traditionalNOI * (1 + baseUplift)) },
      optimistic: { uplift: (optimisticUplift * 100) + '%', noi: Math.round(traditionalNOI * (1 + optimisticUplift)) },
    },
    breakEven: '< 6 months',
    scaleProjection: '100+ properties: compounding NOI growth via low-CAC referrals and insurer partnerships',
  };
}

// ── Master Orchestrator Fleet (Sentry, Ledger, Acquisition, Report) ────────

export const AGENT_FLEET = {
  sentry: {
    id: 'AGT-SENTRY',
    name: 'Sentry-Agent',
    domain: 'Property telemetry & autonomous maintenance dispatch',
    inputs: ['iot_sensors', 'weather_api', 'retell_calls', 'security_cameras'],
    outputs: ['work_orders', 'owner_notifications', 'insurance_evidence'],
    actions: ['telemetry_ingest', 'dispatch_work_order', 'storm_protocol', 'security_response'],
    killSwitch: 'Cost > $5,000 OR structural/electrical scope',
    status: 'active',
  },
  ledger: {
    id: 'AGT-LEDGER',
    name: 'Ledger-Agent',
    domain: 'Bill-pay, multi-LLC accounting, tax compliance',
    inputs: ['stripe_webhooks', 'vendor_invoices', 'bank_feeds', 'airtable_fin'],
    outputs: ['paid_invoices', 'gl_entries', 'tax_provisions', 'llc_pnl'],
    actions: ['bill_pay_execute', 'tax_provision_calculate', 'gl_post', 'reconcile'],
    killSwitch: 'Transfer > $5,000 OR inter-LLC OR new vendor',
    status: 'active',
  },
  acquisition: {
    id: 'AGT-ACQUISITION',
    name: 'Acquisition-Agent',
    domain: 'HNW lead scraping, enrichment, outbound sequencing',
    inputs: ['mls', 'public_records', 'luxury_portals', 'web_form'],
    outputs: ['enriched_leads', 'drip_enrollment', 'sen_queue'],
    actions: ['lead_enriched', 'sequence_enroll', 'do_not_contact_check'],
    killSwitch: 'Outbound > 100/day OR unverified source',
    status: 'active',
  },
  report: {
    id: 'AGT-REPORT',
    name: 'Report-Agent',
    domain: 'Weekly AI-narrated owner updates (PDF + video)',
    inputs: ['sentry_telemetry', 'completed_work_orders', 'photos'],
    outputs: ['owner_pdf', 'narration_mp4', 'evidence_vault_archive'],
    actions: ['report_published', 'narration_render', 'send_dispatch'],
    killSwitch: 'Unresolved P0 on property OR negative narrative detected',
    status: 'active',
  },
};

export const RATE_LIMITS_CONFIG = {
  sentry:      { rpm: 60,  daily: 2000, burst: 10 },
  ledger:      { rpm: 20,  daily: 500,  burst: 5  },
  acquisition: { rpm: 30,  daily: 100,  burst: 5  },
  report:      { rpm: 10,  daily: 50,   burst: 3  },
  orchestrator:{ rpm: 600, daily: null, burst: 60 },
};

export const HITL_THRESHOLDS = {
  financialTransferSingleCents: 500000,
  financialTransferAggregate24hCents: 500000,
  newVendorContractCents: 250000,
  acquisitionOutboundDailyCap: 100,
  priorityP0Always: true,
  interLlcTransferAlways: true,
  insuranceClaimAlways: true,
};

const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const VALID_RISK_CLASSES = ['R0', 'R1', 'R2', 'R3'];
const VALID_AGENTS = Object.keys(AGENT_FLEET);

function pickAgentForAction(action) {
  if (!action) return null;
  for (const [key, agent] of Object.entries(AGENT_FLEET)) {
    if (agent.actions.includes(action)) return key;
  }
  return null;
}

export function classifyDispatch(event) {
  const priority = event.priority && VALID_PRIORITIES.includes(event.priority) ? event.priority : 'P2';
  const riskClass = event.risk_class && VALID_RISK_CLASSES.includes(event.risk_class) ? event.risk_class : 'R1';
  const agent = event.recipient && VALID_AGENTS.includes(event.recipient)
    ? event.recipient
    : pickAgentForAction(event.action);
  return { priority, riskClass, agent };
}

export function validateGoalAlignment(event) {
  const claimed = Array.isArray(event.goal_alignment) ? event.goal_alignment : [];
  const valid = ['G1_automation', 'G2_risk', 'G3_financial', 'G4_market'];
  const matched = claimed.filter(g => valid.includes(g));
  return { passed: matched.length > 0, matched, claimed };
}

export function evaluateHITL(event) {
  const reasons = [];
  const cents = Number(event?.payload?.amount?.amount_cents || event?.payload?.estimated_cost?.amount_cents || 0);

  if (cents > HITL_THRESHOLDS.financialTransferSingleCents) {
    reasons.push(`financial_exposure_exceeds_$${HITL_THRESHOLDS.financialTransferSingleCents / 100}`);
  }
  if (event.priority === 'P0' && HITL_THRESHOLDS.priorityP0Always) {
    reasons.push('p0_priority_always_requires_hitl');
  }
  if (event.action === 'bill_pay_execute' && event?.payload?.requires_hitl === true) {
    reasons.push('bill_pay_marked_hitl_required');
  }
  if (event.action === 'insurance_claim_initiate') {
    reasons.push('insurance_claim_always_requires_hitl');
  }
  if (event.action === 'inter_llc_transfer') {
    reasons.push('inter_llc_transfer_always_requires_hitl');
  }
  if (event.action === 'lead_enriched' && Number(event?.payload?.daily_outbound_count || 0) > HITL_THRESHOLDS.acquisitionOutboundDailyCap) {
    reasons.push('acquisition_outbound_daily_cap_exceeded');
  }
  if (event?.payload?.scope_of_work && /structural|electrical|roofing/i.test(event.payload.scope_of_work)) {
    reasons.push('structural_or_electrical_scope_requires_hitl');
  }

  return { hitlRequired: reasons.length > 0, reasons };
}

export function routeDispatch(event) {
  const issuedAt = new Date().toISOString();
  const { priority, riskClass, agent } = classifyDispatch(event);

  if (!agent) {
    return {
      status: 'errored',
      issued_at: issuedAt,
      error: 'no_agent_matched',
      action: event.action,
    };
  }

  const goal = validateGoalAlignment(event);
  if (!goal.passed) {
    return {
      status: 'quarantined',
      issued_at: issuedAt,
      reason: 'goal_alignment_validation_failed',
      action: event.action,
      agent,
      priority,
      risk_class: riskClass,
      goal_alignment: goal,
    };
  }

  const hitl = evaluateHITL({ ...event, priority, risk_class: riskClass });
  if (hitl.hitlRequired) {
    return {
      status: 'hitl_pending',
      issued_at: issuedAt,
      action: event.action,
      agent,
      priority,
      risk_class: riskClass,
      goal_alignment: goal.matched,
      hitl: {
        required: true,
        reasons: hitl.reasons,
        decision_ttl_seconds: 600,
        escalation_channels: ['sms', 'slack', 'email'],
      },
    };
  }

  return {
    status: 'dispatched',
    issued_at: issuedAt,
    action: event.action,
    agent,
    priority,
    risk_class: riskClass,
    goal_alignment: goal.matched,
    rate_limit: RATE_LIMITS_CONFIG[agent],
    correlation_id: event.correlation_id || null,
  };
}

export function getOrchestratorFleetStatus() {
  return {
    fleet: Object.values(AGENT_FLEET),
    count: Object.keys(AGENT_FLEET).length,
    rateLimits: RATE_LIMITS_CONFIG,
    hitlThresholds: HITL_THRESHOLDS,
    activeAgents: Object.values(AGENT_FLEET).filter(a => a.status === 'active').length,
    governance: '100% routed through Coastal Key Master Orchestrator',
    timestamp: new Date().toISOString(),
  };
}

export const TRIGGER_ACTION_SEQUENCES = [
  { id: 'TAS-001', name: 'Water Intrusion Detected',           priority: 'P0', risk: 'R3', agent: 'sentry',      hitl: true,  retention: '365d' },
  { id: 'TAS-002', name: 'HVAC Humidity Anomaly (Mold Risk)',  priority: 'P1', risk: 'R2', agent: 'sentry',      hitl: false, retention: '30d'  },
  { id: 'TAS-003', name: 'Security Breach',                    priority: 'P0', risk: 'R3', agent: 'sentry',      hitl: true,  retention: '365d' },
  { id: 'TAS-004', name: 'Vendor Invoice Received',            priority: 'P2', risk: 'R1', agent: 'ledger',      hitl: false, retention: '7y'   },
  { id: 'TAS-005', name: 'New Acquisition Lead (MLS)',         priority: 'P3', risk: 'R0', agent: 'acquisition', hitl: false, retention: '30d'  },
  { id: 'TAS-006', name: 'Weekly Owner Report Cycle',          priority: 'P2', risk: 'R1', agent: 'report',      hitl: false, retention: '2y'   },
  { id: 'TAS-007', name: 'Insurance Claim Initiation',         priority: 'P0', risk: 'R3', agent: 'sentry',      hitl: true,  retention: '7y'   },
  { id: 'TAS-008', name: 'Quarterly Tax Provision',            priority: 'P1', risk: 'R2', agent: 'ledger',      hitl: true,  retention: '7y'   },
  { id: 'TAS-009', name: 'Sensor Battery Low',                 priority: 'P2', risk: 'R1', agent: 'sentry',      hitl: false, retention: '30d'  },
  { id: 'TAS-010', name: 'Storm Protocol Activation',          priority: 'P0', risk: 'R3', agent: 'sentry',      hitl: true,  retention: '365d' },
  { id: 'TAS-011', name: 'New Client Onboarding',              priority: 'P1', risk: 'R1', agent: 'sentry',      hitl: false, retention: '7y'   },
  { id: 'TAS-012', name: 'Owner Complaint Received',           priority: 'P1', risk: 'R2', agent: 'report',      hitl: true,  retention: '2y'   },
  { id: 'TAS-013', name: 'Monthly NOI & Financial Checkpoint', priority: 'P2', risk: 'R1', agent: 'ledger',      hitl: false, retention: '7y'   },
  { id: 'TAS-014', name: 'Vendor Performance Review',          priority: 'P3', risk: 'R1', agent: 'ledger',      hitl: false, retention: '30d'  },
  { id: 'TAS-015', name: 'CEO Daily Standup Ingestion',        priority: 'P2', risk: 'R1', agent: 'orchestrator',hitl: false, retention: '90d'  },
];

// ── Master Dashboard ───────────────────────────────────────────────────────

export function getMasterPromptDashboard() {
  return {
    system: 'Coastal Key Master Prompt V2.1',
    status: 'PRODUCTION_LIVE',
    governance: '100% aligned with Sovereign Governance',
    currentState: {
      automation: '68% → 75% trajectory',
      incidents: 'Zero preventable (100%)',
      grossMargin: '28-32% → 40%+ path',
      nps: 4.7,
      scaling: 'Soft-launch active, targeting 30 properties',
    },
    avatars: Object.values(AVATARS),
    marketingAssets: {
      count: MARKETING_ASSETS.length,
      live: MARKETING_ASSETS.filter(a => a.status === 'LIVE').length,
      scheduled: MARKETING_ASSETS.filter(a => a.status === 'SCHEDULED').length,
      running: MARKETING_ASSETS.filter(a => a.status === 'RUNNING').length,
      deployed: MARKETING_ASSETS.filter(a => a.status === 'DEPLOYED').length,
      assets: MARKETING_ASSETS.map(a => ({ id: a.id, name: a.name, type: a.type, status: a.status })),
    },
    researchGaps: INDUSTRY_GAPS,
    fleet: getOrchestratorFleetStatus(),
    triggerSequences: { count: TRIGGER_ACTION_SEQUENCES.length, sequences: TRIGGER_ACTION_SEQUENCES },
    noiModel: calculateNOIGapImpact(30),
    collectionsAgent: getCollectionsAgentStatus(),
    processExecuted: 'Create → Plan → Build → Test → Audit → Reconfigure → Deploy → Test → Audit → Reconfigure → Push to Production → Final Test/Audit/Reconfigure → Zero failures → Live',
    nextActions: [
      { avatar: 'Daphne', action: 'Prepare Investor PDF V3 for external sharing' },
      { avatar: 'Stephanie', action: 'Monitor first RPA research loop output' },
      { avatar: 'Twin', action: 'Run sensitivity analysis on NOI model with latest 2026 insurance data' },
      { avatar: 'Orchestrator', action: 'Deliver Q2 scaling brief and log Founder feedback' },
      { avatar: 'Twin', action: 'Monitor Collections Agent KPIs (RPC rate, promise-to-pay, kept promises) weekly' },
    ],
    timestamp: new Date().toISOString(),
  };
}
