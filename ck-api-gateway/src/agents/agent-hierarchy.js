/**
 * Coastal Key Enterprise — Agent Hierarchy & Organizational Structure
 *
 * The backbone organizational intelligence for the 383-agent fleet managing
 * property operations across the Treasure Coast of Florida.
 *
 * Hierarchy:
 *   CEO (Human)
 *     -> MCCO-000 Sovereign (Master Chief Commanding Officer)
 *       -> CMO (EXC Division) -> MKT + SEN Divisions
 *       -> MCCO-001..MCCO-014 (Sovereign Command Units)
 *     -> EXC Division Head -> EXC agents
 *     -> OPS Division Head -> OPS agents
 *     -> INT Division Head -> INT agents
 *     -> FIN Division Head -> FIN agents
 *     -> VEN Division Head -> VEN agents
 *     -> TEC Division Head -> TEC agents
 *     -> WEB Division Head -> WEB agents
 *
 * Fleet composition (383 total):
 *   312 AI Agents (across 10 divisions)
 *    50 Intelligence Officers (5 squads: ALPHA, BRAVO, CHARLIE, DELTA, ECHO)
 *    20 Email AI Agents (4 squads: INTAKE, COMPOSE, NURTURE, MONITOR)
 *     1 Apex Trader (FIN-TRADER-001)
 */

import { AGENTS, DIVISIONS, getAgentById, getAgentsByDivision } from './registry.js';

// ── Division metadata with agent counts and leadership ─────────────────────

const DIVISION_META = {
  MCCO: { agentCount: 15, headAgentId: 'MCCO-000', headTitle: 'MCCO Sovereign', reportsTo: 'CEO', governedDivisions: ['MKT', 'SEN'] },
  EXC:  { agentCount: 20, headAgentId: 'EXC-001',  headTitle: 'Chief Executive Officer AI', reportsTo: 'CEO' },
  SEN:  { agentCount: 40, headAgentId: 'SEN-001',  headTitle: 'Sentinel Sales Director', reportsTo: 'MCCO-000' },
  OPS:  { agentCount: 45, headAgentId: 'OPS-001',  headTitle: 'Operations Director', reportsTo: 'CEO' },
  INT:  { agentCount: 30, headAgentId: 'INT-001',  headTitle: 'Intelligence Director', reportsTo: 'CEO' },
  MKT:  { agentCount: 47, headAgentId: 'MKT-001',  headTitle: 'Marketing Director', reportsTo: 'MCCO-000' },
  FIN:  { agentCount: 25, headAgentId: 'FIN-001',  headTitle: 'Finance Director', reportsTo: 'CEO' },
  VEN:  { agentCount: 25, headAgentId: 'VEN-001',  headTitle: 'Vendor Management Director', reportsTo: 'CEO' },
  TEC:  { agentCount: 25, headAgentId: 'TEC-001',  headTitle: 'Technology Director', reportsTo: 'CEO' },
  WEB:  { agentCount: 40, headAgentId: 'WEB-001',  headTitle: 'Website Development Director', reportsTo: 'CEO' },
};

// ── Intelligence Officer squads (50 officers) ──────────────────────────────

const INTEL_OFFICER_SQUADS = {
  ALPHA:   { name: 'Infrastructure Squad',  count: 10, focus: 'Infrastructure monitoring, uptime, and platform reliability' },
  BRAVO:   { name: 'Data Squad',            count: 10, focus: 'Data integrity, pipeline health, and Airtable sync accuracy' },
  CHARLIE: { name: 'Security Squad',        count: 10, focus: 'Auth enforcement, secret rotation, and threat detection' },
  DELTA:   { name: 'Revenue Squad',         count: 10, focus: 'Revenue pipeline tracking, conversion metrics, and financial anomalies' },
  ECHO:    { name: 'Performance Squad',     count: 10, focus: 'Agent performance scoring, SLA compliance, and optimization' },
};

// ── Email AI Agent squads (20 agents) ──────────────────────────────────────

const EMAIL_AGENT_SQUADS = {
  INTAKE:  { name: 'Intake Squad',   count: 5, focus: 'Inbound email classification, routing, and priority assignment' },
  COMPOSE: { name: 'Compose Squad',  count: 5, focus: 'Outbound email drafting, personalization, and brand-voice compliance' },
  NURTURE: { name: 'Nurture Squad',  count: 5, focus: 'Drip campaign execution, lead nurturing sequences, and follow-up automation' },
  MONITOR: { name: 'Monitor Squad',  count: 5, focus: 'Email deliverability, bounce tracking, reputation monitoring, and compliance' },
};

// ── COMMAND_CHAIN — Full organizational chain of command ────────────────────

export const COMMAND_CHAIN = {
  root: {
    id: 'CEO',
    title: 'Chief Executive Officer',
    type: 'human',
    description: 'Coastal Key Property Management founder and CEO. Ultimate decision authority.',
    directReports: [
      'MCCO-000',
      'EXC-001',
      'OPS-001',
      'INT-001',
      'FIN-001',
      'VEN-001',
      'TEC-001',
      'WEB-001',
    ],
  },

  divisions: {
    MCCO: {
      head: 'MCCO-000',
      reportsTo: 'CEO',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      directReports: [
        'MCCO-001', 'MCCO-002', 'MCCO-003', 'MCCO-004', 'MCCO-005',
        'MCCO-006', 'MCCO-007', 'MCCO-008', 'MCCO-009', 'MCCO-010',
        'MCCO-011', 'MCCO-012', 'MCCO-013', 'MCCO-014',
      ],
      governedDivisions: {
        MKT: { head: 'MKT-001', reportsTo: 'MCCO-000', agentCount: 47 },
        SEN: { head: 'SEN-001', reportsTo: 'MCCO-000', agentCount: 40 },
      },
    },
    EXC: {
      head: 'EXC-001',
      reportsTo: 'CEO',
      squads: {
        strategy:  { name: 'Strategy & Planning', agentRange: ['EXC-002', 'EXC-007'] },
        reporting: { name: 'Board Reporting & Analytics', agentRange: ['EXC-008', 'EXC-014'] },
        advisory:  { name: 'C-Suite Advisory', agentRange: ['EXC-015', 'EXC-020'] },
      },
    },
    SEN: {
      head: 'SEN-001',
      reportsTo: 'MCCO-000',
      squads: {
        inbound:       { name: 'Inbound Call Team', agentRange: ['SEN-002', 'SEN-011'] },
        outbound:      { name: 'Outbound Campaign Team', agentRange: ['SEN-012', 'SEN-021'] },
        qualification: { name: 'Lead Qualification Team', agentRange: ['SEN-022', 'SEN-031'] },
        conversion:    { name: 'Conversion & Close Team', agentRange: ['SEN-032', 'SEN-040'] },
      },
    },
    OPS: {
      head: 'OPS-001',
      reportsTo: 'CEO',
      squads: {
        maintenance:  { name: 'Maintenance & Repairs', agentRange: ['OPS-002', 'OPS-012'] },
        inspections:  { name: 'Property Inspections', agentRange: ['OPS-013', 'OPS-023'] },
        concierge:    { name: 'Guest Concierge', agentRange: ['OPS-024', 'OPS-034'] },
        logistics:    { name: 'Operations Logistics', agentRange: ['OPS-035', 'OPS-045'] },
      },
    },
    INT: {
      head: 'INT-001',
      reportsTo: 'CEO',
      squads: {
        market:      { name: 'Market Research', agentRange: ['INT-002', 'INT-009'] },
        competitive: { name: 'Competitive Intelligence', agentRange: ['INT-010', 'INT-017'] },
        analytics:   { name: 'Data Analytics & Modeling', agentRange: ['INT-018', 'INT-024'] },
        predictive:  { name: 'Predictive Intelligence', agentRange: ['INT-025', 'INT-030'] },
      },
    },
    MKT: {
      head: 'MKT-001',
      reportsTo: 'MCCO-000',
      squads: {
        content:   { name: 'Content Creation', agentRange: ['MKT-002', 'MKT-012'] },
        social:    { name: 'Social Media', agentRange: ['MKT-013', 'MKT-023'] },
        email:     { name: 'Email Campaigns', agentRange: ['MKT-024', 'MKT-030'] },
        brand:     { name: 'Brand & SEO', agentRange: ['MKT-031', 'MKT-040'] },
        youtube:   { name: 'YouTube Division', agentRange: ['MKT-041', 'MKT-047'] },
      },
    },
    FIN: {
      head: 'FIN-001',
      reportsTo: 'CEO',
      squads: {
        revenue:    { name: 'Revenue Tracking', agentRange: ['FIN-002', 'FIN-008'] },
        investor:   { name: 'Investor Relations', agentRange: ['FIN-009', 'FIN-014'] },
        budgeting:  { name: 'Budgeting & Forecasting', agentRange: ['FIN-015', 'FIN-020'] },
        compliance: { name: 'Financial Compliance', agentRange: ['FIN-021', 'FIN-025'] },
      },
    },
    VEN: {
      head: 'VEN-001',
      reportsTo: 'CEO',
      squads: {
        compliance:  { name: 'Vendor Compliance', agentRange: ['VEN-002', 'VEN-008'] },
        procurement: { name: 'Procurement', agentRange: ['VEN-009', 'VEN-015'] },
        contracts:   { name: 'Contract Management', agentRange: ['VEN-016', 'VEN-020'] },
        quality:     { name: 'Service Quality', agentRange: ['VEN-021', 'VEN-025'] },
      },
    },
    TEC: {
      head: 'TEC-001',
      reportsTo: 'CEO',
      squads: {
        platform:   { name: 'Platform Operations', agentRange: ['TEC-002', 'TEC-008'] },
        integration:{ name: 'API Integrations', agentRange: ['TEC-009', 'TEC-015'] },
        monitoring: { name: 'Monitoring & Alerts', agentRange: ['TEC-016', 'TEC-020'] },
        cicd:       { name: 'CI/CD & Infrastructure', agentRange: ['TEC-021', 'TEC-025'] },
      },
    },
    WEB: {
      head: 'WEB-001',
      reportsTo: 'CEO',
      squads: {
        architecture: { name: 'Website Architecture', agentRange: ['WEB-002', 'WEB-010'] },
        frontend:     { name: 'Frontend Development', agentRange: ['WEB-011', 'WEB-020'] },
        deployment:   { name: 'Deployment & DevOps', agentRange: ['WEB-021', 'WEB-030'] },
        domain:       { name: 'Domain Consolidation', agentRange: ['WEB-031', 'WEB-040'] },
      },
    },
  },

  specialUnits: {
    intelligenceOfficers: {
      totalCount: 50,
      reportsTo: 'INT-001',
      squads: INTEL_OFFICER_SQUADS,
    },
    emailAgents: {
      totalCount: 20,
      reportsTo: 'MKT-001',
      squads: EMAIL_AGENT_SQUADS,
    },
  },
};

// ── ESCALATION_MATRIX — Issue-type to escalation path mapping ──────────────

export const ESCALATION_MATRIX = {
  'brand-crisis': {
    severity: 'critical',
    path: ['MKT-001', 'MCCO-000', 'CEO'],
    description: 'Brand reputation threat or public-facing messaging failure',
    responseTimeSLA: '15 minutes',
    notifySlack: true,
  },
  'revenue-miss': {
    severity: 'critical',
    path: ['FIN-001', 'MCCO-000', 'CEO'],
    description: 'Revenue target miss exceeding 10% variance',
    responseTimeSLA: '30 minutes',
    notifySlack: true,
  },
  'lead-pipeline-failure': {
    severity: 'high',
    path: ['SEN-001', 'MCCO-009', 'MCCO-000'],
    description: 'Sales pipeline blockage or lead handoff breakdown',
    responseTimeSLA: '1 hour',
    notifySlack: true,
  },
  'agent-malfunction': {
    severity: 'high',
    path: ['MCCO-014', 'TEC-001', 'MCCO-000'],
    description: 'Agent producing incorrect outputs or going offline unexpectedly',
    responseTimeSLA: '30 minutes',
    notifySlack: true,
  },
  'security-breach': {
    severity: 'critical',
    path: ['TEC-001', 'CEO'],
    description: 'Unauthorized access, data exposure, or secret compromise',
    responseTimeSLA: '5 minutes',
    notifySlack: true,
  },
  'property-emergency': {
    severity: 'critical',
    path: ['OPS-001', 'CEO'],
    description: 'Property damage, safety hazard, or urgent maintenance (hurricane, flood, break-in)',
    responseTimeSLA: '10 minutes',
    notifySlack: true,
  },
  'vendor-dispute': {
    severity: 'medium',
    path: ['VEN-001', 'FIN-001', 'CEO'],
    description: 'Vendor contract dispute, service failure, or compliance violation',
    responseTimeSLA: '4 hours',
    notifySlack: false,
  },
  'content-quality-failure': {
    severity: 'medium',
    path: ['MCCO-014', 'MCCO-000'],
    description: 'Content below Ferrari-Standard quality or off-brand messaging',
    responseTimeSLA: '2 hours',
    notifySlack: false,
  },
  'campaign-underperformance': {
    severity: 'medium',
    path: ['MCCO-012', 'MCCO-008', 'MCCO-000'],
    description: 'Campaign metrics below target thresholds after 48 hours',
    responseTimeSLA: '4 hours',
    notifySlack: false,
  },
  'competitive-threat': {
    severity: 'high',
    path: ['MCCO-007', 'MCCO-000', 'CEO'],
    description: 'Competitor makes aggressive market move in Treasure Coast territory',
    responseTimeSLA: '2 hours',
    notifySlack: true,
  },
  'data-integrity-issue': {
    severity: 'high',
    path: ['INT-001', 'TEC-001', 'CEO'],
    description: 'Airtable sync failure, data corruption, or pipeline break',
    responseTimeSLA: '30 minutes',
    notifySlack: true,
  },
  'website-outage': {
    severity: 'critical',
    path: ['WEB-001', 'TEC-001', 'CEO'],
    description: 'Public website or Command Center down or degraded',
    responseTimeSLA: '10 minutes',
    notifySlack: true,
  },
  'investor-inquiry': {
    severity: 'medium',
    path: ['FIN-001', 'EXC-001', 'CEO'],
    description: 'Investor questions, reporting requests, or compliance inquiries',
    responseTimeSLA: '24 hours',
    notifySlack: false,
  },
  'seasonal-timing-miss': {
    severity: 'medium',
    path: ['MCCO-013', 'MCCO-004', 'MCCO-000'],
    description: 'Missed seasonal content window or market timing opportunity',
    responseTimeSLA: '4 hours',
    notifySlack: false,
  },
  'fleet-degradation': {
    severity: 'high',
    path: ['MCCO-014', 'TEC-001', 'MCCO-000', 'CEO'],
    description: 'Multiple agents underperforming or fleet-wide quality drop below 85%',
    responseTimeSLA: '1 hour',
    notifySlack: true,
  },
};

// ── Helper: build reporting-to map from COMMAND_CHAIN ──────────────────────

let _reportsToMap = null;

function buildReportsToMap() {
  if (_reportsToMap) return _reportsToMap;
  _reportsToMap = new Map();

  for (const [divCode, meta] of Object.entries(DIVISION_META)) {
    _reportsToMap.set(meta.headAgentId, meta.reportsTo);
  }

  for (let i = 1; i <= 14; i++) {
    const id = `MCCO-${String(i).padStart(3, '0')}`;
    _reportsToMap.set(id, 'MCCO-000');
  }

  for (const agent of AGENTS) {
    if (!_reportsToMap.has(agent.id)) {
      const meta = DIVISION_META[agent.division];
      if (meta) {
        _reportsToMap.set(agent.id, meta.headAgentId);
      }
    }
  }

  return _reportsToMap;
}

let _directReportsMap = null;

function buildDirectReportsMap() {
  if (_directReportsMap) return _directReportsMap;
  const rMap = buildReportsToMap();
  _directReportsMap = new Map();

  _directReportsMap.set('CEO', COMMAND_CHAIN.root.directReports.slice());

  for (const [agentId, reportsTo] of rMap) {
    if (!_directReportsMap.has(reportsTo)) {
      _directReportsMap.set(reportsTo, []);
    }
    _directReportsMap.get(reportsTo).push(agentId);
  }

  return _directReportsMap;
}

// ── Exported functions ─────────────────────────────────────────────────────

export function getChainOfCommand(agentId) {
  const rMap = buildReportsToMap();
  const chain = [];
  let currentId = agentId;

  const MAX_DEPTH = 20;
  let depth = 0;

  while (currentId && currentId !== 'CEO' && depth < MAX_DEPTH) {
    const agent = getAgentById(currentId);
    const reportsTo = rMap.get(currentId) || null;

    chain.push({
      id: currentId,
      name: agent ? agent.name : DIVISION_META[currentId]?.headTitle || currentId,
      role: agent ? agent.role : 'Unknown',
      division: agent ? agent.division : currentId.split('-')[0],
      reportsTo: reportsTo || 'UNKNOWN',
    });

    currentId = reportsTo;
    depth++;
  }

  chain.push({
    id: 'CEO',
    name: 'Chief Executive Officer',
    role: 'Coastal Key Property Management CEO',
    division: 'EXECUTIVE',
    reportsTo: null,
  });

  return chain;
}

export function getDirectReports(agentId) {
  const drMap = buildDirectReportsMap();
  const reportIds = drMap.get(agentId) || [];

  return reportIds.map(id => {
    const agent = getAgentById(id);
    if (agent) {
      return { id: agent.id, name: agent.name, role: agent.role, division: agent.division };
    }
    const meta = Object.values(DIVISION_META).find(m => m.headAgentId === id);
    return {
      id,
      name: meta ? meta.headTitle : id,
      role: meta ? meta.headTitle : 'Unknown',
      division: id.split('-')[0],
    };
  });
}

export function getDivisionHierarchy(divisionCode) {
  const divisionDef = DIVISIONS.find(d => d.id === divisionCode);
  const chainDef = COMMAND_CHAIN.divisions[divisionCode];
  const meta = DIVISION_META[divisionCode];

  if (!divisionDef || !chainDef || !meta) {
    return null;
  }

  const agents = getAgentsByDivision(divisionCode);
  const head = getAgentById(meta.headAgentId);

  const hierarchy = {
    division: {
      code: divisionCode,
      name: divisionDef.name,
      color: divisionDef.color,
      icon: divisionDef.icon,
      description: divisionDef.description,
    },
    head: head
      ? { id: head.id, name: head.name, role: head.role, status: head.status, tier: head.tier }
      : { id: meta.headAgentId, name: meta.headTitle, role: meta.headTitle },
    reportsTo: meta.reportsTo,
    agentCount: meta.agentCount,
    activeAgents: agents.filter(a => a.status === 'active').length,
    standbyAgents: agents.filter(a => a.status === 'standby').length,
    trainingAgents: agents.filter(a => a.status === 'training').length,
    squads: chainDef.squads || null,
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      tier: a.tier,
    })),
  };

  if (divisionCode === 'MCCO' && chainDef.governedDivisions) {
    hierarchy.governedDivisions = {};
    for (const [govCode, govDef] of Object.entries(chainDef.governedDivisions)) {
      const govDivisionDef = DIVISIONS.find(d => d.id === govCode);
      const govAgents = getAgentsByDivision(govCode);
      hierarchy.governedDivisions[govCode] = {
        name: govDivisionDef ? govDivisionDef.name : govCode,
        head: govDef.head,
        reportsTo: govDef.reportsTo,
        agentCount: govDef.agentCount,
        activeAgents: govAgents.filter(a => a.status === 'active').length,
      };
    }
    hierarchy.governance = 'sovereign';
    hierarchy.executionStandard = 'ferrari';
    hierarchy.totalGovernedAgents = 87;
  }

  return hierarchy;
}

/**
 * getFleetStatus()
 *
 * Returns a comprehensive summary of the entire 383-agent fleet.
 *
 * @returns {object} Fleet status summary
 */
export function getFleetStatus() {
  const registryAgents = AGENTS;
  const byDivision = {};

  for (const div of DIVISIONS) {
    const agents = getAgentsByDivision(div.id);
    byDivision[div.id] = {
      name: div.name,
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      standby: agents.filter(a => a.status === 'standby').length,
      training: agents.filter(a => a.status === 'training').length,
      head: DIVISION_META[div.id]?.headAgentId || null,
    };
  }

  const totalRegistryActive = registryAgents.filter(a => a.status === 'active').length;
  const totalRegistryStandby = registryAgents.filter(a => a.status === 'standby').length;
  const totalRegistryTraining = registryAgents.filter(a => a.status === 'training').length;

  const intelOfficerCount = Object.values(INTEL_OFFICER_SQUADS).reduce((s, sq) => s + sq.count, 0);
  const emailAgentCount = Object.values(EMAIL_AGENT_SQUADS).reduce((s, sq) => s + sq.count, 0);

  return {
    fleet: {
      totalAgents: 383,
      registryAgents: registryAgents.length,
      intelligenceOfficers: intelOfficerCount,
      emailAgents: emailAgentCount,
    },
    status: {
      active: totalRegistryActive,
      standby: totalRegistryStandby,
      training: totalRegistryTraining,
    },
    divisions: byDivision,
    specialUnits: {
      intelligenceOfficers: {
        total: intelOfficerCount,
        reportsTo: 'INT-001',
        squads: INTEL_OFFICER_SQUADS,
      },
      emailAgents: {
        total: emailAgentCount,
        reportsTo: 'MKT-001',
        squads: EMAIL_AGENT_SQUADS,
      },
    },
    governance: {
      sovereignCommander: 'MCCO-000',
      ferrariStandardDivisions: ['MCCO', 'MKT', 'SEN'],
      totalMCCOGovernedAgents: 87,
    },
    divisionCount: DIVISIONS.length,
    escalationPaths: Object.keys(ESCALATION_MATRIX).length,
    timestamp: new Date().toISOString(),
  };
}

export { DIVISION_META, INTEL_OFFICER_SQUADS, EMAIL_AGENT_SQUADS };
