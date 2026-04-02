/**
 * Master Orchestrator Service
 *
 * Department 1: Top-level routing intelligence governing the 330-agent
 * enterprise across 11 divisions. Reports directly to David Hauer, CEO.
 *
 * Command Hierarchy (8 Core Divisions):
 *   1. Executive Governance (EXC)
 *   2. Operations & Field Execution (OPS)
 *   3. Finance & Capital Management (FIN)
 *   4. Growth, Sales & Market Expansion (SEN + MKT)
 *   5. Client Experience & Retention (OPS + VEN)
 *   6. Technology & Systems (TEC + WEB)
 *   7. Human Capital & Culture (EXC)
 *   8. Risk & Compliance (EXC + INT)
 *
 * Integrated Prompting Systems:
 *   1. SCAA-1 (Systems Check & Audit Agent)
 *   2. Customer Service Director AI (Asset Protection)
 *   3. 5-Agent Media Automation System
 *   4. Enterprise Audit Package Model
 *   5. Strategic Negotiation (Disarm the Difference)
 *   6. AI Governance & Board-Level Escalation
 *
 * Escalation Protocol:
 *   S1 (Critical): Revenue loss, client harm, legal exposure. Immediate CEO escalation.
 *   S2 (High): Degraded workflow, SLA breach. Escalate within 4 hours.
 *   S3 (Medium): Process inefficiency, prompt drift. Daily summary.
 *   S4 (Low): Minor anomaly. Weekly batch.
 *
 * Voice: Authoritative, precise, institutional. 9th-grade English.
 * Short sentences. No em dashes. No cheesy quotes.
 * Truth over convenience. Transparency over opacity.
 * Long-term reputation over short-term revenue.
 */

import { inference } from './anthropic.js';
import { createRecord, listRecords, updateRecord, TABLES } from './airtable.js';
import { sendDelegationSlack } from './integrations.js';

// ── Orchestrator System Prompt ──

const ORCHESTRATOR_SYSTEM = `You are the Master Orchestrator (Department 1) for Coastal Key Treasure Coast Asset Management. You are the top-level routing intelligence governing a 330-agent army across 11 divisions. You report directly to David Hauer, Founder and CEO.

PERSONA AND VOICE:
You speak as a Billion Dollar Fortune 500 Home Watch and Property Management Enterprise CEO. Your tone is authoritative, precise, and institutional. You use 9th-grade English. You write in short, punchy sentences. You never use em dashes. You never use cheesy quotes. You prioritize truth over convenience, transparency over opacity, and long-term reputation over short-term revenue.

COMMAND HIERARCHY (8 Core Divisions):
1. Executive Governance: Moral authority, strategic control. Division EXC. 20 agents.
2. Operations and Field Execution: Flawless service delivery. Division OPS. 45 agents.
3. Finance and Capital Management: Protect margins, ensure liquidity. Division FIN. 25 agents.
4. Growth, Sales and Market Expansion: Controlled dominance. Divisions SEN (40) + MKT (40). 80 agents.
5. Client Experience and Retention: Turn clients into lifetime advocates. Divisions OPS + VEN. 70 agents.
6. Technology and Systems: Automation, security, data dominance. Divisions TEC (25) + WEB (40). 65 agents.
7. Human Capital and Culture: Build warriors, not employees. Division EXC subset. 10 agents.
8. Risk and Compliance: Protect license, insurance, and legal exposure. Divisions EXC + INT. 50 agents.

ADDITIONAL DIVISIONS:
- AI Delegation (DEL): 20 agents. Enterprise-wide gap detection and task dispatch.
- Systems Upgrade (UPG): 20 agents. 7-day integration sprint. Buffer, Twitter/X, Constant Contact, Google Calendar, Gmail, Canva, Gamma, Zapier Tables, Google Sheets, Manus AI.
- Intelligence (INT): 30 agents. Market research, competitive intel, predictive modeling.

INTEGRATED PROMPTING SYSTEMS:
1. SCAA-1: Systems Check and Audit Agent. Lead qualification, battle plans, conversion pipeline.
2. Customer Service Director AI: Asset protection protocols. Maintenance, inspections, concierge.
3. 5-Agent Media Automation: Content pipeline across 7 platforms. Sovereign Standard formatting.
4. Enterprise Audit Package: Cross-division data integrity, financial reconciliation, compliance verification.
5. Strategic Negotiation (Disarm the Difference): Vendor negotiation, investor relations, contract optimization.
6. AI Governance and Board-Level Escalation: Prompt quality monitoring, model performance tracking, CEO escalation routing.

ESCALATION PROTOCOL:
- S1 (Critical): Revenue loss, client harm, legal exposure. Escalate IMMEDIATELY to CEO. Do not batch. Do not delay.
- S2 (High): Degraded workflow, SLA breach. Escalate within 4 hours.
- S3 (Medium): Process inefficiency, prompt drift. Include in daily summary.
- S4 (Low): Minor anomaly. Batch weekly.

SOVEREIGN STANDARD (All Outputs):
- 9th-grade English reading level
- Short sentences. Clear structure.
- No exclamation points. No em dashes.
- Faith-forward when appropriate.
- Institutional quality comparable to Fortune 500 outputs.
- Content quality always outweighs content quantity.

OUTPUT FORMAT:
Every output must advance the enterprise toward a viable, revenue-generating, operationally sound outcome. Report completion status, not progress updates. Short, clean, and built to run.`;

// ── Escalation Severity Levels ──

const SEVERITY = {
  S1: { level: 'S1', name: 'Critical', sla: 'Immediate', slackPriority: 'Critical', description: 'Revenue loss, client harm, legal exposure' },
  S2: { level: 'S2', name: 'High', sla: '4 hours', slackPriority: 'High', description: 'Degraded workflow, SLA breach' },
  S3: { level: 'S3', name: 'Medium', sla: 'Daily summary', slackPriority: 'Medium', description: 'Process inefficiency, prompt drift' },
  S4: { level: 'S4', name: 'Low', sla: 'Weekly batch', slackPriority: 'Low', description: 'Minor anomaly' },
};

// ── Command Hierarchy Map ──

const COMMAND_HIERARCHY = [
  { id: 1, name: 'Executive Governance', divisions: ['EXC'], mission: 'Moral authority, strategic control', agentCount: 20 },
  { id: 2, name: 'Operations & Field Execution', divisions: ['OPS'], mission: 'Flawless service delivery', agentCount: 45 },
  { id: 3, name: 'Finance & Capital Management', divisions: ['FIN'], mission: 'Protect margins, ensure liquidity', agentCount: 25 },
  { id: 4, name: 'Growth, Sales & Market Expansion', divisions: ['SEN', 'MKT'], mission: 'Controlled dominance', agentCount: 80 },
  { id: 5, name: 'Client Experience & Retention', divisions: ['OPS', 'VEN'], mission: 'Turn clients into lifetime advocates', agentCount: 70 },
  { id: 6, name: 'Technology & Systems', divisions: ['TEC', 'WEB'], mission: 'Automation, security, data dominance', agentCount: 65 },
  { id: 7, name: 'Human Capital & Culture', divisions: ['EXC'], mission: 'Build warriors, not employees', agentCount: 10 },
  { id: 8, name: 'Risk & Compliance', divisions: ['EXC', 'INT'], mission: 'Protect license, insurance, and legal exposure', agentCount: 50 },
];

// ── Integrated Prompting Systems ──

const PROMPTING_SYSTEMS = [
  {
    id: 'SCAA-1',
    name: 'Systems Check & Audit Agent',
    description: 'Lead qualification, battle plan generation, conversion pipeline automation.',
    endpoint: '/v1/workflows/scaa1',
    divisions: ['SEN'],
    status: 'active',
  },
  {
    id: 'CSD-AI',
    name: 'Customer Service Director AI',
    description: 'Asset protection protocols. Maintenance dispatch, inspection scheduling, concierge services, emergency response.',
    endpoint: '/v1/dashboard',
    divisions: ['OPS'],
    status: 'active',
  },
  {
    id: 'MEDIA-5',
    name: '5-Agent Media Automation System',
    description: 'Content pipeline across 7 platforms. Auto-generation, scheduling, cross-platform publishing. Sovereign Standard formatting enforced.',
    endpoint: '/v1/content/generate',
    divisions: ['MKT', 'DEL'],
    status: 'active',
  },
  {
    id: 'EAP',
    name: 'Enterprise Audit Package',
    description: 'Cross-division data integrity verification. Financial reconciliation. Compliance gap detection. 38-table scan protocol.',
    endpoint: '/v1/delegation/scan',
    divisions: ['FIN', 'DEL', 'INT'],
    status: 'active',
  },
  {
    id: 'DTD',
    name: 'Strategic Negotiation (Disarm the Difference)',
    description: 'Vendor negotiation frameworks. Investor relations communication. Contract optimization. Objection handling protocols.',
    endpoint: '/v1/workflows/wf3',
    divisions: ['VEN', 'FIN', 'SEN'],
    status: 'active',
  },
  {
    id: 'AIGOV',
    name: 'AI Governance & Board-Level Escalation',
    description: 'Prompt quality monitoring. Model performance tracking. CEO escalation routing. Compliance verification for all AI outputs.',
    endpoint: '/v1/audit',
    divisions: ['EXC', 'TEC'],
    status: 'active',
  },
];

// ── Core Functions ──

/**
 * Run the Master Orchestrator enterprise health scan.
 * Pulls data from key tables, analyzes via Claude, returns enterprise health report.
 */
export async function runEnterpriseHealthScan(env, ctx) {
  const timestamp = new Date().toISOString();
  const healthData = {};

  // Scan key tables for health metrics
  const scans = [
    { key: 'leads', table: TABLES.LEADS, label: 'Lead Pipeline' },
    { key: 'tasks', table: TABLES.TASKS, label: 'Task Queue' },
    { key: 'clients', table: TABLES.CLIENTS, label: 'Client Portfolio' },
    { key: 'maintenance', table: TABLES.MAINTENANCE_REQUESTS, label: 'Maintenance Queue' },
    { key: 'content', table: TABLES.CONTENT_CALENDAR, label: 'Content Pipeline' },
    { key: 'aiLog', table: TABLES.AI_LOG, label: 'AI Operations Log' },
    { key: 'delegationOps', table: TABLES.DELEGATION_OPS, label: 'Delegation Operations' },
    { key: 'vendorCompliance', table: TABLES.VENDOR_COMPLIANCE, label: 'Vendor Compliance' },
    { key: 'competitiveIntel', table: TABLES.COMPETITIVE_INTEL, label: 'Competitive Intelligence' },
  ];

  for (const scan of scans) {
    try {
      const records = await listRecords(env, scan.table, { maxRecords: 20 });
      healthData[scan.key] = {
        label: scan.label,
        count: records.length,
        sample: records.slice(0, 3).map(r => Object.keys(r.fields).length),
        status: records.length > 0 ? 'operational' : 'empty',
      };
    } catch (err) {
      healthData[scan.key] = {
        label: scan.label,
        count: 0,
        status: 'error',
        error: err.message,
      };
    }
  }

  // Run AI analysis
  const healthSummary = Object.entries(healthData)
    .map(([k, v]) => `${v.label}: ${v.count} records, status: ${v.status}${v.error ? ` (${v.error})` : ''}`)
    .join('\n');

  const aiResult = await inference(env, {
    system: ORCHESTRATOR_SYSTEM,
    prompt: `ENTERPRISE HEALTH SCAN REQUESTED AT ${timestamp}

DATA SUMMARY:
${healthSummary}

Produce the CEO Administration Dashboard feed with:
1. ENTERPRISE HEALTH: Overall status (Green/Yellow/Red) with justification.
2. RISK AND COMPLIANCE: Any S1/S2 escalations detected from the data.
3. AI AGENT ARMY STATUS: Fleet readiness assessment (330 agents, 11 divisions).
4. FINANCIAL GROWTH: Revenue pipeline health based on leads and client data.
5. RECOMMENDATIONS: Top 3 actions ranked by financial urgency.
6. NEW CAPABILITIES: Any integration or model upgrades to recommend.

Format as a CEO-ready briefing. Short sentences. No filler.`,
    tier: 'advanced',
    maxTokens: 3000,
    cacheKey: `orchestrator:health:${Date.now() - (Date.now() % 1800000)}`,
    cacheTtl: 1800,
  });

  // Record to AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Orchestrator: enterprise_health_scan - ${timestamp}`,
      'Module': { name: 'Orchestrator' },
      'Request Type': { name: 'enterprise_health_scan' },
      'Input Brief': healthSummary.slice(0, 10000),
      'Output Text': aiResult.content.slice(0, 10000),
      'Model Used': { name: aiResult.model },
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log write failed:', err))
  );

  // Notify Slack
  sendDelegationSlack(env, ctx, {
    agentId: 'ORCH-001',
    agentName: 'Master Orchestrator',
    action: 'Enterprise Health Scan Complete',
    details: `9 systems scanned. CEO briefing generated.`,
    priority: 'Medium',
  });

  return {
    orchestrator: 'Master Orchestrator (Department 1)',
    reportTo: 'David Hauer, Founder & CEO',
    scanTimestamp: timestamp,
    healthData,
    ceoBriefing: aiResult.content,
    model: aiResult.model,
    cached: aiResult.cached,
  };
}

/**
 * Process an escalation through the Master Orchestrator.
 * Routes to correct severity level and takes appropriate action.
 */
export async function processEscalation(env, ctx, { severity, source, subject, details, affectedDivisions }) {
  const sev = SEVERITY[severity] || SEVERITY.S3;
  const timestamp = new Date().toISOString();

  // S1 escalations get immediate AI analysis
  let aiAnalysis = null;
  if (severity === 'S1' || severity === 'S2') {
    const aiResult = await inference(env, {
      system: ORCHESTRATOR_SYSTEM,
      prompt: `ESCALATION RECEIVED: ${sev.level} (${sev.name})
SOURCE: ${source}
SUBJECT: ${subject}
DETAILS: ${details}
AFFECTED DIVISIONS: ${(affectedDivisions || []).join(', ')}

This is a ${sev.description} event. SLA: ${sev.sla}.

Produce:
1. IMPACT ASSESSMENT: What is at risk. Quantify financial exposure.
2. ROOT CAUSE HYPOTHESIS: Most likely cause based on available data.
3. IMMEDIATE ACTIONS: Steps to contain the issue. Numbered. Specific.
4. OWNER ASSIGNMENT: Which division lead owns resolution.
5. CEO COMMUNICATION: 2-sentence summary for David Hauer.`,
      tier: 'advanced',
      maxTokens: 2000,
    });
    aiAnalysis = aiResult.content;
  }

  // Record escalation
  let escalationRecord;
  try {
    escalationRecord = await createRecord(env, TABLES.TASKS, {
      'Task Name': `[${sev.level}] ESCALATION: ${subject}`,
      'Type': { name: 'Escalation' },
      'Priority': { name: sev.level === 'S1' ? 'Urgent' : sev.level === 'S2' ? 'High' : 'Medium' },
      'Due Date': sev.level === 'S1' ? new Date().toISOString().split('T')[0] : undefined,
      'Status': { name: 'Not Started' },
    });
  } catch (err) {
    console.error('Escalation task creation failed:', err);
    escalationRecord = null;
  }

  // Slack notification for S1/S2
  if (severity === 'S1' || severity === 'S2') {
    sendDelegationSlack(env, ctx, {
      agentId: 'ORCH-001',
      agentName: 'Master Orchestrator',
      action: `${sev.level} ESCALATION: ${subject}`,
      details: `Source: ${source}. ${details.slice(0, 200)}`,
      priority: sev.slackPriority,
    });
  }

  return {
    escalationId: escalationRecord?.id || null,
    severity: sev,
    source,
    subject,
    aiAnalysis,
    taskCreated: !!escalationRecord,
    timestamp,
  };
}

/**
 * Execute a prompting system by ID.
 * Routes to the correct integrated system and returns results.
 */
export async function executePromptingSystem(env, ctx, { systemId, input, context }) {
  const system = PROMPTING_SYSTEMS.find(s => s.id === systemId);
  if (!system) {
    return { error: `Unknown prompting system: ${systemId}. Valid: ${PROMPTING_SYSTEMS.map(s => s.id).join(', ')}` };
  }

  const timestamp = new Date().toISOString();

  const aiResult = await inference(env, {
    system: `${ORCHESTRATOR_SYSTEM}\n\nYou are now operating as the ${system.name} (${system.id}). ${system.description}\n\nExecute the following task with institutional precision.`,
    prompt: `SYSTEM: ${system.name} (${system.id})
INPUT: ${input}
CONTEXT: ${context || 'None provided'}

Execute this task. Produce a world-class output. Short, clean, built to run.`,
    tier: 'advanced',
    maxTokens: 3000,
  });

  // Log execution
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Orchestrator: ${system.id} execution - ${timestamp}`,
      'Module': { name: 'Orchestrator' },
      'Request Type': { name: `system_${system.id.toLowerCase()}` },
      'Input Brief': input.slice(0, 10000),
      'Output Text': aiResult.content.slice(0, 10000),
      'Model Used': { name: aiResult.model },
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log write failed:', err))
  );

  return {
    systemId: system.id,
    systemName: system.name,
    output: aiResult.content,
    model: aiResult.model,
    cached: aiResult.cached,
    timestamp,
  };
}

/**
 * Get the full CEO Administration Dashboard.
 * Aggregates enterprise health, risk, agent status, and financial data.
 */
export function getCEODashboard() {
  return {
    orchestrator: {
      name: 'Master Orchestrator',
      department: 1,
      reportTo: 'David Hauer, Founder & CEO',
      version: '3.0.0',
    },
    commandHierarchy: COMMAND_HIERARCHY,
    promptingSystems: PROMPTING_SYSTEMS,
    escalationProtocol: Object.values(SEVERITY),
    fleetStatus: {
      totalAgents: 330,
      totalDivisions: 11,
      divisions: [
        { id: 'EXC', name: 'Executive', agents: 20, status: 'active' },
        { id: 'SEN', name: 'Sentinel Sales', agents: 40, status: 'active' },
        { id: 'OPS', name: 'Operations', agents: 45, status: 'active' },
        { id: 'INT', name: 'Intelligence', agents: 30, status: 'active' },
        { id: 'MKT', name: 'Marketing', agents: 40, status: 'active' },
        { id: 'FIN', name: 'Finance', agents: 25, status: 'active' },
        { id: 'VEN', name: 'Vendor Management', agents: 25, status: 'active' },
        { id: 'TEC', name: 'Technology', agents: 25, status: 'active' },
        { id: 'WEB', name: 'Website Development', agents: 40, status: 'active' },
        { id: 'DEL', name: 'AI Delegation', agents: 20, status: 'active' },
        { id: 'UPG', name: 'Systems Upgrade', agents: 20, status: 'active' },
      ],
    },
    integrations: {
      total: 13,
      live: ['Airtable', 'Cloudflare Workers', 'Anthropic Claude', 'Retell AI', 'Slack', 'Buffer', 'Twitter/X', 'Constant Contact'],
      mcpReady: ['Google Calendar', 'Gmail', 'Canva', 'Gamma', 'Zapier Tables', 'Google Sheets', 'Manus AI'],
    },
    voice: {
      standard: 'Sovereign Standard',
      readingLevel: '9th-grade English',
      rules: ['Short sentences', 'No exclamation points', 'No em dashes', 'No cheesy quotes', 'Faith-forward when appropriate', 'Truth over convenience', 'Transparency over opacity', 'Long-term reputation over short-term revenue'],
    },
    timestamp: new Date().toISOString(),
  };
}

export { ORCHESTRATOR_SYSTEM, SEVERITY, COMMAND_HIERARCHY, PROMPTING_SYSTEMS };
