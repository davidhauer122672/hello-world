/**
 * Sales & Client Acquisition Engine
 *
 * Tactical execution layer for the Coastal Key sales pipeline.
 * Covers: lead scoring, pipeline stages, conversion tracking,
 * acquisition channel management, and sales playbook execution.
 *
 * Integrates with: SEN division (40 agents), MCCO-009 Pipeline Fusion,
 * Retell AI calls, Google Ads, Airtable Leads table.
 */

// ── Pipeline Stages ────────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  { id: 'new', label: 'New Lead', order: 1, sla: '5 min', action: 'Immediate outreach via Retell AI', agent: 'SEN-001 Sentinel Alpha', color: '#3b82f6' },
  { id: 'contacted', label: 'Contacted', order: 2, sla: '24h', action: 'Qualify using SCAA-1 framework', agent: 'SEN-003 Battle Planner', color: '#8b5cf6' },
  { id: 'qualified', label: 'Qualified', order: 3, sla: '48h', action: 'Generate battle plan + schedule consultation', agent: 'SEN-004 Lead Scorer', color: '#a855f7' },
  { id: 'consultation', label: 'Consultation Booked', order: 4, sla: '72h', action: 'Prepare property assessment + pricing proposal', agent: 'SEN-023 Demo Conductor', color: '#d946ef' },
  { id: 'proposal', label: 'Proposal Sent', order: 5, sla: '5 days', action: 'Follow up, handle objections', agent: 'SEN-021 Contract Closer', color: '#ec4899' },
  { id: 'negotiation', label: 'Negotiation', order: 6, sla: '7 days', action: 'Finalize terms, address concerns', agent: 'SEN-005 Objection Handler', color: '#f43f5e' },
  { id: 'closed_won', label: 'Closed Won', order: 7, sla: 'N/A', action: 'Onboarding via SEN-026', agent: 'SEN-026 Onboarding Pilot', color: '#22c55e' },
  { id: 'closed_lost', label: 'Closed Lost', order: 8, sla: '30 days', action: 'Win-back sequence via SEN-022', agent: 'SEN-022 Win-Back Agent', color: '#64748b' },
  { id: 'nurture', label: 'Long-Tail Nurture', order: 9, sla: '90 days', action: 'WF-4 drip sequence', agent: 'SEN-015 Nurture Shepherd', color: '#94a3b8' },
];

// ── Lead Scoring Model ─────────────────────────────────────────────────────

export const SCORING_CRITERIA = {
  propertyValue: { weight: 25, tiers: [{ min: 1000000, score: 25, label: '$1M+' }, { min: 500000, score: 20, label: '$500K-$1M' }, { min: 250000, score: 15, label: '$250K-$500K' }, { min: 0, score: 10, label: '<$250K' }] },
  segment: { weight: 20, values: { investor: 20, luxury: 18, seasonal: 16, absentee: 15, str: 14, residential: 10 } },
  engagement: { weight: 20, values: { inbound_call: 20, form_submit: 16, referral: 18, google_ads: 14, social: 10, cold_outbound: 8 } },
  timeline: { weight: 15, values: { immediate: 15, within_30_days: 12, within_90_days: 8, exploring: 5 } },
  location: { weight: 10, values: { vero_beach: 10, stuart: 10, sebastian: 9, psl: 8, jupiter: 8, hobe_sound: 9, jensen_beach: 9 } },
  multiProperty: { weight: 10, values: { yes: 10, no: 5 } },
};

export function scoreLead(leadData) {
  let score = 0;
  const breakdown = {};

  // Property value
  const pv = leadData.propertyValue || 0;
  const pvTier = SCORING_CRITERIA.propertyValue.tiers.find(t => pv >= t.min) || SCORING_CRITERIA.propertyValue.tiers[3];
  score += pvTier.score;
  breakdown.propertyValue = { score: pvTier.score, label: pvTier.label };

  // Segment
  const segScore = SCORING_CRITERIA.segment.values[leadData.segment] || 10;
  score += segScore;
  breakdown.segment = { score: segScore, value: leadData.segment || 'residential' };

  // Engagement source
  const engScore = SCORING_CRITERIA.engagement.values[leadData.source] || 8;
  score += engScore;
  breakdown.engagement = { score: engScore, source: leadData.source || 'unknown' };

  // Timeline
  const tlScore = SCORING_CRITERIA.timeline.values[leadData.timeline] || 5;
  score += tlScore;
  breakdown.timeline = { score: tlScore, value: leadData.timeline || 'exploring' };

  // Location
  const locScore = SCORING_CRITERIA.location.values[leadData.zone] || 7;
  score += locScore;
  breakdown.location = { score: locScore, zone: leadData.zone || 'unknown' };

  // Multi-property
  const mpScore = leadData.multiProperty ? 10 : 5;
  score += mpScore;
  breakdown.multiProperty = { score: mpScore };

  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';
  const priority = score >= 85 ? 'HOT' : score >= 70 ? 'WARM' : score >= 55 ? 'NURTURE' : 'COLD';

  return {
    totalScore: score,
    maxScore: 100,
    grade,
    priority,
    breakdown,
    recommendedAction: getRecommendedAction(priority),
    assignedAgent: getAssignedAgent(priority, leadData),
    scoredAt: new Date().toISOString(),
  };
}

function getRecommendedAction(priority) {
  const actions = {
    HOT: 'Immediate CEO-level outreach. Schedule consultation within 24h. Deploy SCAA-1 battle plan.',
    WARM: 'Priority follow-up within 48h. Generate battle plan. Schedule discovery call.',
    NURTURE: 'Enter WF-4 nurture sequence. Monthly touchpoints. Quarterly re-score.',
    COLD: 'Add to long-tail drip. Monitor for engagement signals. Re-engage at seasonal triggers.',
  };
  return actions[priority];
}

function getAssignedAgent(priority, data) {
  if (data.segment === 'investor') return 'SEN-009 Investor Hawk';
  if (data.segment === 'luxury') return 'SEN-012 Luxury Liaison';
  if (data.segment === 'str') return 'SEN-013 STR Specialist';
  if (data.segment === 'seasonal') return 'SEN-010 Seasonal Scout';
  if (priority === 'HOT') return 'SEN-001 Sentinel Alpha';
  if (priority === 'WARM') return 'SEN-002 Sentinel Bravo';
  return 'SEN-015 Nurture Shepherd';
}

// ── Acquisition Channels ───────────────────────────────────────────────────

export const ACQUISITION_CHANNELS = [
  { id: 'retell', name: 'Retell AI Inbound Calls', type: 'inbound', agent: 'SEN-001', costPerLead: 0, status: 'active', webhook: '/v1/webhook/retell' },
  { id: 'website', name: 'Website Contact Form', type: 'inbound', agent: 'SEN-004', costPerLead: 0, status: 'active', endpoint: '/v1/leads/public' },
  { id: 'google_ads', name: 'Google Ads (3 campaigns)', type: 'paid', agent: 'MKT-008', costPerLead: 35, status: 'configured', endpoint: '/v1/ads/google/dashboard' },
  { id: 'retell_revival', name: 'Retell Dead Lead Revival', type: 'outbound', agent: 'SEN-002', costPerLead: 5, status: 'configured', webhook: '/v1/webhook/retell' },
  { id: 'retell_outreach', name: 'Retell Outbound Prospecting', type: 'outbound', agent: 'SEN-002', costPerLead: 3, status: 'configured', webhook: '/v1/webhook/retell' },
  { id: 'referral', name: 'Client Referral Program', type: 'organic', agent: 'SEN-014', costPerLead: 0, status: 'active', notes: 'Managed by Referral Engine' },
  { id: 'realtor', name: 'Realtor Partnerships', type: 'partnership', agent: 'EXC-006', costPerLead: 0, status: 'active', notes: '3+ realtor relationships' },
  { id: 'social', name: 'Social Media (organic)', type: 'organic', agent: 'MKT-002', costPerLead: 0, status: 'active', notes: 'MCCO-005 Scroll Breaker content' },
  { id: 'content', name: 'Content Marketing / SEO', type: 'organic', agent: 'MKT-004', costPerLead: 0, status: 'active', notes: 'Blog, YouTube, market reports' },
  { id: 'county_records', name: 'County Record Data Mining', type: 'outbound', agent: 'INT-004', costPerLead: 2, status: 'active', notes: 'Absentee owner identification' },
];

// ── Conversion Playbook ────────────────────────────────────────────────────

export const CONVERSION_PLAYBOOK = {
  scaa1: {
    name: 'SCAA-1 Battle Plan',
    description: 'Personalized sales battle plan generated for each qualified lead',
    steps: ['Property research', 'Owner profile analysis', 'Customized value proposition', 'Objection pre-handling', 'Pricing recommendation', 'Follow-up sequence'],
    endpoint: '/v1/workflows/scaa1',
    agent: 'SEN-003 Battle Planner',
  },
  wf3: {
    name: 'WF-3 Investor Escalation',
    description: 'Accelerated pipeline for investor and family office leads',
    steps: ['Investor qualification', 'Portfolio assessment', 'ROI projection', 'CEO-level meeting', 'Custom proposal', 'Contract negotiation'],
    endpoint: '/v1/workflows/wf3',
    agent: 'SEN-009 Investor Hawk',
  },
  wf4: {
    name: 'WF-4 Long-Tail Nurture',
    description: '90-day re-engagement sequence for not-yet-ready leads',
    steps: ['Drip email enrollment', 'Monthly market update', 'Quarterly re-score', 'Seasonal trigger outreach', 'Win-back offer at 90 days'],
    endpoint: '/v1/workflows/wf4',
    agent: 'SEN-015 Nurture Shepherd',
  },
};

// ── Dashboard Generator ────────────────────────────────────────────────────

export function getSalesAcquisitionDashboard() {
  return {
    engine: 'Sales & Client Acquisition Engine',
    framework: 'Sovereign Governance',
    status: 'OPERATIONAL',
    pipeline: {
      stages: PIPELINE_STAGES,
      stageCount: PIPELINE_STAGES.length,
    },
    scoring: {
      criteria: Object.keys(SCORING_CRITERIA),
      maxScore: 100,
      grades: ['A (85+)', 'B (70-84)', 'C (55-69)', 'D (40-54)', 'F (<40)'],
      priorities: ['HOT', 'WARM', 'NURTURE', 'COLD'],
    },
    channels: {
      list: ACQUISITION_CHANNELS,
      active: ACQUISITION_CHANNELS.filter(c => c.status === 'active').length,
      configured: ACQUISITION_CHANNELS.filter(c => c.status === 'configured').length,
      totalChannels: ACQUISITION_CHANNELS.length,
    },
    playbooks: CONVERSION_PLAYBOOK,
    agents: {
      senDivision: 40,
      keyAgents: ['SEN-001 Sentinel Alpha', 'SEN-003 Battle Planner', 'SEN-009 Investor Hawk', 'SEN-012 Luxury Liaison'],
      mccoAlignment: 'MCCO-009 Pipeline Fusion',
    },
    kpiTargets: {
      leadResponseTime: '< 5 minutes',
      qualificationRate: '> 25%',
      consultationBookingRate: '> 15%',
      proposalToCloseRate: '> 40%',
      averageContractValue: '$295/month',
      clientAcquisitionCost: '< $150',
      ltvToCacRatio: '> 3:1',
    },
    timestamp: new Date().toISOString(),
  };
}
