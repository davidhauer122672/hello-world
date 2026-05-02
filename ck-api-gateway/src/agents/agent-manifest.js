/**
 * Coastal Key Enterprise — Agent Manifest
 *
 * The definitive registry of every autonomous unit operating under the
 * Coastal Key AI CEO. This manifest is the single source of truth for
 * fleet composition, hierarchy, capabilities, and operational status.
 *
 * Fleet Composition: 384 Total Units
 *   - 16 MCCO Sovereign Command (MCCO-000 through MCCO-014 + SMO-001)
 *   - 297 Division Agents (9 divisions: EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB)
 *   - 50 Intelligence Officers (5 squads: ALPHA, BRAVO, CHARLIE, DELTA, ECHO)
 *   - 20 Email AI Agents (4 squads: INTAKE, COMPOSE, NURTURE, MONITOR)
 *   - 1 AI Trader Agent (FIN-TRADER-001 Apex Trader)
 *
 * Organizational Hierarchy:
 *   CEO (Human) → MCCO-000 Sovereign → CMO → MKT (47) + SEN (40)
 *   CEO (Human) → Division Heads → Division Agents
 *   CEO (Human) → FIN-TRADER-001 Apex Trader (direct report)
 *
 * Generated: 2026-04-05
 * Authority: Coastal Key AI CEO
 * Agent: TEC-018 Documentation Bot
 */

import { EXC_AGENTS } from './agents-exc.js';
import { SEN_AGENTS } from './agents-sen.js';
import { OPS_AGENTS } from './agents-ops.js';
import { INT_AGENTS } from './agents-int.js';
import { MKT_AGENTS } from './agents-mkt.js';
import { FIN_AGENTS } from './agents-fin.js';
import { VEN_AGENTS } from './agents-ven.js';
import { TEC_AGENTS } from './agents-tec.js';
import { WEB_AGENTS } from './agents-web.js';
import { MCCO_AGENTS } from './agents-mcco.js';

// ── MANIFEST VERSION ────────────────────────────────────────────────────────

export const MANIFEST_VERSION = '2.0.0';
export const MANIFEST_DATE = '2026-04-05';

// ── FLEET COMPOSITION ───────────────────────────────────────────────────────

export const FLEET = {
  totalUnits: 384,
  composition: {
    mccoSovereignCommand: 16,
    divisionAgents: 297,
    intelligenceOfficers: 50,
    emailAgents: 20,
    traderAgent: 1,
  },
};

// ── ORGANIZATIONAL HIERARCHY ────────────────────────────────────────────────

export const HIERARCHY = {
  root: {
    id: 'CEO',
    title: 'Chief Executive Officer',
    type: 'human',
    description: 'Coastal Key Property Management founder and CEO. Ultimate decision authority.',
  },

  // Level 1: Direct CEO Reports
  directCeoReports: [
    { id: 'MCCO-000', title: 'MCCO Sovereign', governance: 'sovereign', governs: ['MKT', 'SEN'] },
    { id: 'EXC-001', title: 'Chief Executive Officer AI', division: 'EXC' },
    { id: 'OPS-001', title: 'Operations Director', division: 'OPS' },
    { id: 'INT-001', title: 'Intelligence Director', division: 'INT' },
    { id: 'FIN-001', title: 'Finance Director', division: 'FIN' },
    { id: 'VEN-001', title: 'Vendor Management Director', division: 'VEN' },
    { id: 'TEC-001', title: 'Technology Director', division: 'TEC' },
    { id: 'WEB-001', title: 'Website Development Director', division: 'WEB' },
    { id: 'FIN-TRADER-001', title: 'Apex Trader', division: 'FIN', tier: 'sovereign' },
  ],
};

// ── DIVISIONS ───────────────────────────────────────────────────────────────

export const DIVISIONS = {
  MCCO: {
    name: 'Master Chief Commanding Officer',
    code: 'MCCO',
    color: '#dc2626',
    icon: 'shield',
    agentCount: 16,
    headAgent: 'MCCO-000',
    reportsTo: 'CEO',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    description: 'Sovereign-level governance commanding all marketing and sales operations. Ferrari-standard execution across MKT (47 agents) and SEN (40 agents).',
    governs: ['MKT', 'SEN'],
    squads: {
      sovereign: { name: 'Sovereign Command', agents: ['MCCO-000'] },
      strategy: { name: 'Strategy Units', agents: ['MCCO-001', 'MCCO-002', 'MCCO-003', 'MCCO-006', 'MCCO-007'] },
      execution: { name: 'Execution Units', agents: ['MCCO-004', 'MCCO-005', 'MCCO-008', 'MCCO-009'] },
      intelligence: { name: 'Intelligence Units', agents: ['MCCO-010', 'MCCO-011', 'MCCO-012', 'MCCO-013', 'MCCO-014'] },
      marketing: { name: 'Sovereign Marketing Officer', agents: ['SMO-001'] },
    },
  },
  EXC: {
    name: 'Executive',
    code: 'EXC',
    color: '#6366f1',
    icon: 'crown',
    agentCount: 20,
    headAgent: 'EXC-001',
    reportsTo: 'CEO',
    description: 'C-suite strategy, board reporting, enterprise decision-making, culture, and innovation.',
    squads: {
      strategy: { name: 'Strategy & Planning', range: 'EXC-002 to EXC-007' },
      reporting: { name: 'Board Reporting & Analytics', range: 'EXC-008 to EXC-014' },
      advisory: { name: 'C-Suite Advisory', range: 'EXC-015 to EXC-020' },
    },
  },
  SEN: {
    name: 'Sentinel Sales',
    code: 'SEN',
    color: '#ef4444',
    icon: 'phone',
    agentCount: 40,
    headAgent: 'SEN-001',
    reportsTo: 'MCCO-000',
    description: 'Inbound/outbound sales, lead qualification, conversion pipeline, Retell AI voice campaigns.',
    squads: {
      inbound: { name: 'Inbound Call Team', range: 'SEN-002 to SEN-011' },
      outbound: { name: 'Outbound Campaign Team', range: 'SEN-012 to SEN-021' },
      qualification: { name: 'Lead Qualification Team', range: 'SEN-022 to SEN-031' },
      conversion: { name: 'Conversion & Close Team', range: 'SEN-032 to SEN-040' },
    },
  },
  OPS: {
    name: 'Operations',
    code: 'OPS',
    color: '#f59e0b',
    icon: 'cog',
    agentCount: 45,
    headAgent: 'OPS-001',
    reportsTo: 'CEO',
    description: 'Property management, maintenance, inspections, concierge, guest services, hurricane prep.',
    squads: {
      maintenance: { name: 'Maintenance & Repairs', range: 'OPS-002 to OPS-012' },
      inspections: { name: 'Property Inspections', range: 'OPS-013 to OPS-023' },
      concierge: { name: 'Guest Concierge', range: 'OPS-024 to OPS-034' },
      logistics: { name: 'Operations Logistics', range: 'OPS-035 to OPS-045' },
    },
  },
  INT: {
    name: 'Intelligence',
    code: 'INT',
    color: '#10b981',
    icon: 'chart-bar',
    agentCount: 30,
    headAgent: 'INT-001',
    reportsTo: 'CEO',
    description: 'Market research, competitive intel, data analysis, predictive modeling, NLP processing.',
    squads: {
      market: { name: 'Market Research', range: 'INT-002 to INT-009' },
      competitive: { name: 'Competitive Intelligence', range: 'INT-010 to INT-017' },
      analytics: { name: 'Data Analytics & Modeling', range: 'INT-018 to INT-024' },
      predictive: { name: 'Predictive Intelligence', range: 'INT-025 to INT-030' },
    },
  },
  MKT: {
    name: 'Marketing',
    code: 'MKT',
    color: '#8b5cf6',
    icon: 'megaphone',
    agentCount: 47,
    headAgent: 'MKT-001',
    reportsTo: 'MCCO-000',
    description: 'Content creation, social media, email campaigns, brand management, SEO, YouTube.',
    squads: {
      content: { name: 'Content Creation', range: 'MKT-002 to MKT-012' },
      social: { name: 'Social Media', range: 'MKT-013 to MKT-023' },
      email: { name: 'Email Campaigns', range: 'MKT-024 to MKT-030' },
      brand: { name: 'Brand & SEO', range: 'MKT-031 to MKT-040' },
      youtube: { name: 'YouTube Division', range: 'MKT-041 to MKT-047' },
    },
  },
  FIN: {
    name: 'Finance',
    code: 'FIN',
    color: '#06b6d4',
    icon: 'currency-dollar',
    agentCount: 25,
    headAgent: 'FIN-001',
    reportsTo: 'CEO',
    description: 'Revenue tracking, investor relations, budgeting, forecasting, financial compliance.',
    squads: {
      revenue: { name: 'Revenue Tracking', range: 'FIN-002 to FIN-008' },
      investor: { name: 'Investor Relations', range: 'FIN-009 to FIN-014' },
      budgeting: { name: 'Budgeting & Forecasting', range: 'FIN-015 to FIN-020' },
      compliance: { name: 'Financial Compliance', range: 'FIN-021 to FIN-025' },
    },
    specialUnits: [
      { id: 'FIN-TRADER-001', name: 'Apex Trader', role: 'AI Trading Intelligence Officer', tier: 'sovereign', reportsTo: 'CEO' },
    ],
  },
  VEN: {
    name: 'Vendor Management',
    code: 'VEN',
    color: '#f97316',
    icon: 'truck',
    agentCount: 25,
    headAgent: 'VEN-001',
    reportsTo: 'CEO',
    description: 'Vendor compliance, procurement, contract management, service quality assurance.',
    squads: {
      compliance: { name: 'Vendor Compliance', range: 'VEN-002 to VEN-008' },
      procurement: { name: 'Procurement', range: 'VEN-009 to VEN-015' },
      contracts: { name: 'Contract Management', range: 'VEN-016 to VEN-020' },
      quality: { name: 'Service Quality', range: 'VEN-021 to VEN-025' },
    },
  },
  TEC: {
    name: 'Technology',
    code: 'TEC',
    color: '#64748b',
    icon: 'code',
    agentCount: 25,
    headAgent: 'TEC-001',
    reportsTo: 'CEO',
    description: 'Platform ops, API integrations, monitoring, CI/CD, infrastructure, Slack integration.',
    squads: {
      platform: { name: 'Platform Operations', range: 'TEC-002 to TEC-008' },
      integration: { name: 'API Integrations', range: 'TEC-009 to TEC-015' },
      monitoring: { name: 'Monitoring & Alerts', range: 'TEC-016 to TEC-020' },
      cicd: { name: 'CI/CD & Infrastructure', range: 'TEC-021 to TEC-025' },
    },
  },
  WEB: {
    name: 'Website Development',
    code: 'WEB',
    color: '#0ea5e9',
    icon: 'globe',
    agentCount: 40,
    headAgent: 'WEB-001',
    reportsTo: 'CEO',
    description: 'Website architecture, frontend development, deployment, domain consolidation.',
    squads: {
      architecture: { name: 'Website Architecture', range: 'WEB-002 to WEB-010' },
      frontend: { name: 'Frontend Development', range: 'WEB-011 to WEB-020' },
      deployment: { name: 'Deployment & DevOps', range: 'WEB-021 to WEB-030' },
      domain: { name: 'Domain Consolidation', range: 'WEB-031 to WEB-040' },
    },
  },
};

// ── SPECIAL UNITS ───────────────────────────────────────────────────────────

export const SPECIAL_UNITS = {
  intelligenceOfficers: {
    totalCount: 50,
    reportsTo: 'INT-001',
    description: '50-officer autonomous monitoring fleet conducting 24/7 surveillance across infrastructure, data, security, revenue, and performance.',
    squads: {
      ALPHA: { name: 'Infrastructure Squad', count: 10, focus: 'Infrastructure monitoring, uptime, and platform reliability', officers: 'IO-A01 to IO-A10' },
      BRAVO: { name: 'Data Squad', count: 10, focus: 'Data integrity, pipeline health, and Airtable sync accuracy', officers: 'IO-B01 to IO-B10' },
      CHARLIE: { name: 'Security Squad', count: 10, focus: 'Auth enforcement, secret rotation, and threat detection', officers: 'IO-C01 to IO-C10' },
      DELTA: { name: 'Revenue Squad', count: 10, focus: 'Revenue pipeline tracking, conversion metrics, and financial anomalies', officers: 'IO-D01 to IO-D10' },
      ECHO: { name: 'Performance Squad', count: 10, focus: 'Agent performance scoring, SLA compliance, and optimization', officers: 'IO-E01 to IO-E10' },
    },
  },
  emailAgents: {
    totalCount: 20,
    reportsTo: 'MKT-001',
    description: '20-agent email operations fleet handling inbound classification, outbound composition, nurture sequences, and deliverability monitoring.',
    squads: {
      INTAKE: { name: 'Intake Squad', count: 5, focus: 'Inbound email classification, routing, and priority assignment', agents: 'EMAIL-INT-01 to EMAIL-INT-05' },
      COMPOSE: { name: 'Compose Squad', count: 5, focus: 'Outbound email drafting, personalization, and brand-voice compliance', agents: 'EMAIL-COM-01 to EMAIL-COM-05' },
      NURTURE: { name: 'Nurture Squad', count: 5, focus: 'Drip campaign execution, lead nurturing sequences, and follow-up automation', agents: 'EMAIL-NUR-01 to EMAIL-NUR-05' },
      MONITOR: { name: 'Monitor Squad', count: 5, focus: 'Email deliverability, bounce tracking, reputation monitoring, and compliance', agents: 'EMAIL-MON-01 to EMAIL-MON-05' },
    },
  },
};

// ── PLATFORM INTEGRATIONS ───────────────────────────────────────────────────

export const INTEGRATIONS = {
  slack: {
    workspace: 'Coastal Key Treasure Coast Asset Management',
    workspaceId: 'T0AGWM16Z7V',
    apps: [
      { id: 'A0APSJ44NV6', name: 'Coastal Key', commands: 6, role: 'Primary Bot' },
      { id: 'A0APKPRBW3U', name: 'CK Gateway', commands: 2, role: 'System Alerts' },
      { id: 'A0ANS0760LB', name: 'Coastal Key Content', commands: 2, role: 'Content Distribution' },
    ],
    channels: 33,
    slashCommands: 10,
    eventRoutes: 18,
    airtableTable: 'tbluSdmSXReoqcROr',
  },
  airtable: {
    baseId: 'appUSnNgpDkcEOzhN',
    tables: 59,
    primaryTables: [
      'Leads', 'Clients', 'Properties', 'Tasks', 'AI Log',
      'Sales Campaigns', 'Content Calendar', 'Slack Integrations',
    ],
  },
  cloudflare: {
    workers: ['ck-api-gateway', 'sentinel-webhook', 'ck-nemotron-worker'],
    pages: ['ck-command-center', 'ck-website'],
    kvStores: ['CACHE', 'SESSIONS', 'RATE_LIMITS', 'AUDIT_LOG'],
  },
  ai: {
    anthropic: { models: ['claude-opus-4-6', 'claude-sonnet-4-6'], usage: 'inference, workflows, content generation' },
    retell: { agents: 40, campaign: 'TH Sentinel', dailyCalls: 2400 },
    nvidia: { model: 'nemotron', endpoint: 'ck-nemotron-worker' },
  },
  atlas: {
    platform: 'youratlas.com',
    purpose: 'Speed-to-lead calls, dead-lead revival, appointment confirmations',
  },
};

// ── API ENDPOINTS ───────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  total: 90,
  categories: {
    core: { count: 4, prefix: '/v1/', endpoints: ['inference', 'health', 'audit', 'dashboard'] },
    leads: { count: 4, prefix: '/v1/leads/' },
    agents: { count: 4, prefix: '/v1/agents/' },
    workflows: { count: 3, prefix: '/v1/workflows/', pipelines: ['scaa1', 'wf3', 'wf4'] },
    content: { count: 1, prefix: '/v1/content/' },
    campaign: { count: 5, prefix: '/v1/campaign/' },
    intel: { count: 5, prefix: '/v1/intel/' },
    email: { count: 5, prefix: '/v1/email/' },
    mcco: { count: 10, prefix: '/v1/mcco/' },
    atlas: { count: 14, prefix: '/v1/atlas/' },
    frameworks: { count: 7, prefix: '/v1/frameworks/' },
    financial: { count: 7, prefix: '/v1/financial/' },
    analysis: { count: 9, prefix: '/v1/analysis/' },
    deals: { count: 7, prefix: '/v1/deals/' },
    hierarchy: { count: 5, prefix: '/v1/hierarchy/' },
    trader: { count: 11, prefix: '/v1/trader/' },
    pricing: { count: 2, prefix: '/v1/pricing/' },
    propertyIntel: { count: 3, prefix: '/v1/property-intel/' },
    slack: { count: 6, prefix: '/v1/slack/' },
    webhook: { count: 1, prefix: '/v1/webhook/' },
  },
};

// ── SECURITY FRAMEWORK ──────────────────────────────────────────────────────

export const SECURITY = {
  authentication: {
    api: 'Bearer token (WORKER_AUTH_TOKEN)',
    slack: 'HMAC-SHA256 signature verification (SLACK_SIGNING_SECRET)',
    webhook: 'Bearer token + replay protection (5-min window)',
  },
  rateLimiting: { rpm: 60, kvStore: 'RATE_LIMITS', strategy: 'sliding-window' },
  auditTrail: { kvStore: 'AUDIT_LOG', retentionDays: 30 },
  cors: { origins: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] },
};

// ── AGGREGATE ALL AGENTS ────────────────────────────────────────────────────

/**
 * Returns the complete agent manifest — every agent in the fleet.
 */
export function getFullManifest() {
  const allDivisionAgents = [
    ...MCCO_AGENTS,
    ...EXC_AGENTS,
    ...SEN_AGENTS,
    ...OPS_AGENTS,
    ...INT_AGENTS,
    ...MKT_AGENTS,
    ...FIN_AGENTS,
    ...VEN_AGENTS,
    ...TEC_AGENTS,
    ...WEB_AGENTS,
  ];

  return {
    version: MANIFEST_VERSION,
    date: MANIFEST_DATE,
    authority: 'Coastal Key AI CEO',
    fleet: FLEET,
    hierarchy: HIERARCHY,
    divisions: DIVISIONS,
    specialUnits: SPECIAL_UNITS,
    integrations: INTEGRATIONS,
    apiEndpoints: API_ENDPOINTS,
    security: SECURITY,
    agents: {
      total: allDivisionAgents.length,
      list: allDivisionAgents,
    },
    divisionCounts: {
      MCCO: MCCO_AGENTS.length,
      EXC: EXC_AGENTS.length,
      SEN: SEN_AGENTS.length,
      OPS: OPS_AGENTS.length,
      INT: INT_AGENTS.length,
      MKT: MKT_AGENTS.length,
      FIN: FIN_AGENTS.length,
      VEN: VEN_AGENTS.length,
      TEC: TEC_AGENTS.length,
      WEB: WEB_AGENTS.length,
    },
  };
}

/**
 * Returns a summary manifest (no individual agent details).
 */
export function getManifestSummary() {
  return {
    version: MANIFEST_VERSION,
    date: MANIFEST_DATE,
    authority: 'Coastal Key AI CEO',
    fleet: FLEET,
    hierarchy: HIERARCHY,
    divisions: Object.fromEntries(
      Object.entries(DIVISIONS).map(([k, v]) => [k, {
        name: v.name,
        code: v.code,
        agentCount: v.agentCount,
        headAgent: v.headAgent,
        reportsTo: v.reportsTo,
        squads: Object.keys(v.squads || {}),
      }])
    ),
    specialUnits: {
      intelligenceOfficers: { total: 50, squads: Object.keys(SPECIAL_UNITS.intelligenceOfficers.squads) },
      emailAgents: { total: 20, squads: Object.keys(SPECIAL_UNITS.emailAgents.squads) },
    },
    integrations: {
      slack: { apps: 3, channels: 33, commands: 10 },
      airtable: { tables: 59 },
      cloudflare: { workers: 3, pages: 2, kvStores: 4 },
      ai: { anthropic: true, retell: true, nvidia: true },
    },
    apiEndpoints: API_ENDPOINTS.total,
  };
}
