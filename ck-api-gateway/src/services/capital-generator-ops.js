/**
 * Capital Generator Operations Engine
 *
 * THE REVENUE MACHINE. This is what makes everything else matter.
 * Connects campaigns → leads → orchestrator → Slack → CRM → revenue.
 *
 * Owners: David Hauer & Tracy Hunter
 * Entity: Coastal Key Property Management LLC
 * Industry: Home Watch, Property Management, Real Estate Software
 *
 * Standards: Ferrari precision, Red Bull speed, SpaceX engineering.
 * Governance: Aligned to Coastal Key Mission, Goals, Decision Filter.
 */

const CAPITAL_ENGINE_OPS = {
  id: 'CK-CAPGEN-OPS',
  version: '1.0.0',
  name: 'Coastal Key Capital Generator — Operations Engine',
  entity: 'Coastal Key Property Management LLC',
  owners: [
    { name: 'David Hauer', role: 'Managing Partner / CEO', focus: 'Strategy, acquisitions, investor relations' },
    { name: 'Tracy Hunter', role: 'Managing Partner / COO', focus: 'Operations, client relations, service delivery' },
  ],
  industry: ['Home Watch', 'Property Management', 'Real Estate Software'],
  region: 'Treasure Coast, FL (Martin, St. Lucie, Indian River counties)',
  status: 'operational',
};

// ── OUTBOUND CAMPAIGN ENGINE ──
const OUTBOUND_CAMPAIGNS = [
  {
    id: 'CAMP-01',
    name: 'Seasonal Owner Direct Outreach',
    channel: 'Phone (Atlas AI / ReTell)',
    status: 'active',
    targetList: 'Absentee owners — property tax records, Martin/St. Lucie/Indian River counties',
    listSize: 2500,
    cadence: '50 calls/day, Mon–Fri, 9 AM–6 PM EST',
    script: 'Pain-point discovery: "How are you currently monitoring your property while you\'re away?"',
    qualification: [
      'Property vacant 4+ months/year',
      'No current PM company OR dissatisfied with current',
      'Property value > $250K',
      'Owner responsive and interested',
    ],
    leadRouting: 'Qualified → Airtable Lead + Slack #sales-alerts + Email to David/Tracy',
    conversionTarget: '5% of contacts → qualified lead, 20% of leads → assessment scheduled',
    compliance: 'TCPA compliant — PEWC recorded, DNC scrubbed, calling window enforced',
    costPerLead: '$15–$25',
  },
  {
    id: 'CAMP-02',
    name: 'Email Nurture Campaign',
    channel: 'Email (Gmail OAuth + AI Compose)',
    status: 'active',
    targetList: 'Website leads, referrals, past inquiries, event contacts',
    sequences: [
      { name: '7-Day Welcome', emails: 5, goal: 'Educate on Coastal Key value proposition' },
      { name: '30-Day Nurture', emails: 8, goal: 'Build trust, demonstrate expertise, offer free property assessment' },
      { name: '90-Day Long-Tail', emails: 12, goal: 'Stay top-of-mind for seasonal decision cycle (Aug–Oct)' },
      { name: 'Re-Engagement', emails: 3, goal: 'Revive cold leads with new offer or market update' },
    ],
    aiPowered: true,
    personalization: 'Property address, owner name, local market data, seasonal timing',
    unsubscribeCompliance: 'CAN-SPAM compliant — every email has unsubscribe link',
    leadRouting: 'Reply/click → Airtable Lead update + Slack #pipeline-updates + Assign to David/Tracy',
    conversionTarget: '3% of nurture contacts → assessment scheduled',
  },
  {
    id: 'CAMP-03',
    name: 'Google Ads — Local Search',
    channel: 'Google Ads (Search + Maps)',
    status: 'planned',
    keywords: [
      'property management treasure coast',
      'home watch stuart fl',
      'property management port st lucie',
      'vacant property monitoring florida',
      'seasonal home management',
    ],
    budget: '$500/month',
    landingPage: 'coastalkey-pm.com/get-started',
    conversionTarget: '8% click-to-lead, $35 cost per lead',
    leadRouting: 'Form submit → Airtable Lead + Slack #sales-alerts + Auto-email confirmation',
  },
  {
    id: 'CAMP-04',
    name: 'Realtor Referral Program',
    channel: 'Partnership (in-person + email)',
    status: 'planned',
    targetPartners: 'Top 25 listing agents in tri-county area',
    incentive: '$100 per closed referral + co-branded marketing materials',
    cadence: 'Monthly check-in, quarterly lunch, annual appreciation event',
    leadRouting: 'Partner submits via portal or email → Airtable Lead + Slack #pipeline-updates',
    conversionTarget: '30% of referrals → closed client (warm leads)',
  },
  {
    id: 'CAMP-05',
    name: 'Insurance Agent Referral Network',
    channel: 'Partnership',
    status: 'planned',
    rationale: 'FL insurance crisis → agents actively seeking PM companies that document properties for claims defense',
    targetPartners: 'Top 15 home insurance agents in tri-county area',
    valueExchange: 'Coastal Key provides insurance-ready documentation → agent retains client → agent refers new PM clients',
    leadRouting: 'Agent submits via portal → Airtable Lead + Slack #pipeline-updates',
    conversionTarget: '40% of referrals → closed client (high trust)',
  },
];

// ── LEAD PIPELINE ORCHESTRATION ──
const LEAD_PIPELINE = {
  stages: [
    { id: 'LP-01', stage: 'New Lead', action: 'Auto-enrich from property records + score', sla: '< 15 min', owner: 'AI Fleet' },
    { id: 'LP-02', stage: 'Qualified', action: 'Human review + assign to David or Tracy', sla: '< 2 hours', owner: 'David/Tracy' },
    { id: 'LP-03', stage: 'Assessment Scheduled', action: 'Book property walkthrough', sla: '< 48 hours', owner: 'David/Tracy' },
    { id: 'LP-04', stage: 'Assessment Complete', action: 'AI generates proposal from inspection data', sla: '< 24 hours post-walkthrough', owner: 'AI Fleet' },
    { id: 'LP-05', stage: 'Proposal Sent', action: 'Present pricing + service tier', sla: '< 24 hours', owner: 'David/Tracy' },
    { id: 'LP-06', stage: 'Negotiation', action: 'Address objections, adjust terms', sla: 'Varies', owner: 'David/Tracy' },
    { id: 'LP-07', stage: 'Closed Won', action: 'Execute contract → Onboarding workflow triggers', sla: '< 5 business days', owner: 'Operations' },
    { id: 'LP-08', stage: 'Closed Lost', action: 'Log reason → Enter re-engagement nurture', sla: 'Immediate', owner: 'AI Fleet' },
  ],
  slackNotifications: {
    newLead: { channel: '#sales-alerts', format: 'Lead name, property address, source, score, phone, email' },
    qualified: { channel: '#pipeline-updates', format: 'Lead promoted to qualified + assigned owner' },
    assessmentScheduled: { channel: '#pipeline-updates', format: 'Assessment date/time + property address' },
    proposalSent: { channel: '#pipeline-updates', format: 'Proposal amount + service tier' },
    closedWon: { channel: '#exec-briefing', format: 'New client signed — name, property, MRR value' },
    closedLost: { channel: '#pipeline-updates', format: 'Lost reason + re-engagement plan' },
  },
  emailNotifications: {
    newLead: { to: ['david@coastalkey-pm.com', 'tracy@coastalkey-pm.com'], subject: 'New Lead: {name} — {property_address}' },
    closedWon: { to: ['david@coastalkey-pm.com', 'tracy@coastalkey-pm.com'], subject: 'CLIENT SIGNED: {name} — {monthly_value}/mo' },
  },
  airtableSync: {
    table: 'Leads',
    fields: ['Lead Name', 'Phone', 'Email', 'Property Address', 'Source', 'Score', 'Stage', 'Assigned To', 'Notes', 'Created'],
    automations: ['Stage change → Slack notification', 'New lead → Auto-score → Route', 'Closed Won → Create Property record'],
  },
};

// ── MASTER ORCHESTRATOR ROUTING ──
const ORCHESTRATOR = {
  id: 'CK-MASTER-ORCH',
  name: 'Coastal Key Master Orchestrator',
  description: 'Central intelligence that routes every lead, alert, and event to the right person via the right channel.',
  routingRules: [
    { event: 'New qualified lead', destination: 'Slack #sales-alerts + Email David/Tracy', priority: 'high' },
    { event: 'Assessment scheduled', destination: 'Slack #pipeline-updates + Calendar invite', priority: 'medium' },
    { event: 'Proposal accepted', destination: 'Slack #exec-briefing + Email David/Tracy + Airtable update', priority: 'critical' },
    { event: 'Sensor alert (severity 3+)', destination: 'Slack #ops-alerts + SMS owner + Vendor dispatch', priority: 'critical' },
    { event: 'Campaign performance update', destination: 'Slack #marketing-ops (weekly digest)', priority: 'low' },
    { event: 'Financial milestone', destination: 'Slack #finance-alerts + Email David/Tracy', priority: 'high' },
    { event: 'Investor inquiry', destination: 'Slack #investor-escalations + Email David', priority: 'critical' },
    { event: 'Client churn risk', destination: 'Slack #exec-briefing + Email Tracy', priority: 'high' },
  ],
  contactMethods: {
    david: { slack: 'DM', email: 'david@coastalkey-pm.com', phone: 'Primary', role: 'Strategy + acquisitions' },
    tracy: { slack: 'DM', email: 'tracy@coastalkey-pm.com', phone: 'Primary', role: 'Operations + clients' },
  },
  escalationMatrix: [
    { level: 1, handler: 'AI Fleet', timeToEscalate: '15 minutes', type: 'Automated triage and routing' },
    { level: 2, handler: 'Tracy Hunter', timeToEscalate: '2 hours', type: 'Operational decisions, client issues' },
    { level: 3, handler: 'David Hauer', timeToEscalate: '4 hours', type: 'Strategic decisions, investor matters, legal' },
    { level: 4, handler: 'Both Owners', timeToEscalate: 'Immediate', type: 'Emergency, major financial, legal threat' },
  ],
};

// ── REVENUE PROJECTIONS (MISSION-ALIGNED) ──
const REVENUE_MODEL = {
  month1: {
    campaigns: ['CAMP-01 (phone)', 'CAMP-02 (email)'],
    expectedLeads: 25,
    expectedClients: 3,
    mrr: '$1,197',
    breakdown: { managed: '2 × $399 = $798', aiTier: '10 × $3.99 = $39.90', activations: '$360' },
  },
  month3: {
    campaigns: ['CAMP-01', 'CAMP-02', 'CAMP-03 (Google Ads)'],
    expectedLeads: 75,
    expectedClients: 15,
    mrr: '$6,485',
    breakdown: { managed: '10 × $399 = $3,990', aiTier: '40 × $3.99 = $159.60', monitor: '5 × $29.99 = $149.95', activations: '$2,186' },
  },
  month6: {
    campaigns: ['CAMP-01', 'CAMP-02', 'CAMP-03', 'CAMP-04 (realtors)', 'CAMP-05 (insurance)'],
    expectedLeads: 200,
    expectedClients: 45,
    mrr: '$19,755',
    breakdown: { managed: '30 × $399 = $11,970', aiTier: '120 × $3.99 = $478.80', monitor: '20 × $29.99 = $599.80', activations: '$6,706' },
  },
  month12: {
    campaigns: 'All 5 active + word-of-mouth flywheel',
    expectedLeads: 500,
    expectedClients: 120,
    mrr: '$52,380',
    breakdown: { managed: '80 × $399 = $31,920', aiTier: '400 × $3.99 = $1,596', monitor: '60 × $29.99 = $1,799.40', activations: '$17,065' },
    goalAlignment: 'GOAL-01: 120 properties ✓ | GOAL-02: $50K MRR ✓',
  },
};

// ── Public API ──

export function getCapitalGeneratorOps() {
  return {
    ...CAPITAL_ENGINE_OPS,
    campaigns: OUTBOUND_CAMPAIGNS.length,
    activeCampaigns: OUTBOUND_CAMPAIGNS.filter(c => c.status === 'active').length,
    pipelineStages: LEAD_PIPELINE.stages.length,
    orchestratorRoutes: ORCHESTRATOR.routingRules.length,
    projectedMonth12MRR: REVENUE_MODEL.month12.mrr,
    goalAlignment: 'GOAL-01 (120 properties) + GOAL-02 ($50K MRR)',
  };
}

export function getCampaigns() {
  return {
    engine: CAPITAL_ENGINE_OPS.name,
    totalCampaigns: OUTBOUND_CAMPAIGNS.length,
    active: OUTBOUND_CAMPAIGNS.filter(c => c.status === 'active').length,
    planned: OUTBOUND_CAMPAIGNS.filter(c => c.status === 'planned').length,
    campaigns: OUTBOUND_CAMPAIGNS,
  };
}

export function getCampaign(campaignId) {
  return OUTBOUND_CAMPAIGNS.find(c => c.id === campaignId) || null;
}

export function getLeadPipeline() {
  return {
    engine: CAPITAL_ENGINE_OPS.name,
    totalStages: LEAD_PIPELINE.stages.length,
    stages: LEAD_PIPELINE.stages,
    slackNotifications: LEAD_PIPELINE.slackNotifications,
    emailNotifications: LEAD_PIPELINE.emailNotifications,
    airtableSync: LEAD_PIPELINE.airtableSync,
  };
}

export function getOrchestrator() {
  return {
    ...ORCHESTRATOR,
    totalRoutes: ORCHESTRATOR.routingRules.length,
    escalationLevels: ORCHESTRATOR.escalationMatrix.length,
  };
}

export function getRevenueProjections() {
  return {
    engine: CAPITAL_ENGINE_OPS.id,
    entity: CAPITAL_ENGINE_OPS.entity,
    owners: CAPITAL_ENGINE_OPS.owners,
    projections: REVENUE_MODEL,
    goalAlignment: {
      'GOAL-01': { target: '120 properties in 12 months', month12Projected: 120, onTrack: true },
      'GOAL-02': { target: '$50K MRR in 12 months', month12Projected: '$52,380', onTrack: true },
    },
    note: 'Projections based on Treasure Coast seasonal owner market. Conservative estimates — actual may exceed with referral flywheel.',
  };
}

export function getCampaignDashboard() {
  return {
    engine: CAPITAL_ENGINE_OPS.name,
    status: CAPITAL_ENGINE_OPS.status,
    owners: CAPITAL_ENGINE_OPS.owners,
    campaigns: OUTBOUND_CAMPAIGNS.map(c => ({
      id: c.id,
      name: c.name,
      channel: c.channel,
      status: c.status,
      conversionTarget: c.conversionTarget,
    })),
    pipeline: LEAD_PIPELINE.stages.map(s => ({
      stage: s.stage,
      sla: s.sla,
      owner: s.owner,
    })),
    orchestrator: {
      totalRoutes: ORCHESTRATOR.routingRules.length,
      escalationLevels: ORCHESTRATOR.escalationMatrix.length,
      contactMethods: ORCHESTRATOR.contactMethods,
    },
    revenue: {
      month3: REVENUE_MODEL.month3.mrr,
      month6: REVENUE_MODEL.month6.mrr,
      month12: REVENUE_MODEL.month12.mrr,
    },
  };
}
