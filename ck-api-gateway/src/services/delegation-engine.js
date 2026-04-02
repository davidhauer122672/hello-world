/**
 * Delegation Engine — Core orchestration layer for the 20 DEL-division agents.
 *
 * Capabilities:
 *   1. Enterprise Scan — scans all Airtable tables for gaps, failures, and opportunities
 *   2. Task Dispatch — assigns atomic tasks to the correct DEL agent with CEO-grade prompts
 *   3. Inter-Agent Handoff — routes completed tasks to target division agents
 *   4. CEO Prompt Generation — builds world-class prompts for each delegation task
 *   5. Completion Tracking — records outcomes with measurable proof to Airtable
 *
 * Badge clearance: Enterprise Full Access for all DEL agents.
 * Cooperates with: All Chiefs of Staff, Division Leads, Division Managers.
 */

import { inference } from './anthropic.js';
import { createRecord, listRecords, updateRecord, TABLES } from './airtable.js';

// ── Delegation Ops Table ──
const DELEGATION_OPS_TABLE = 'tblx1HfUCXhhA8UkJ';

// ── Agent-to-scan mapping ──
const SCAN_CONFIGS = {
  'DEL-002': { name: 'Content Sentinel', tables: [TABLES.CONTENT_CALENDAR], category: 'Content Gap' },
  'DEL-004': { name: 'Pipeline Guardian', tables: [TABLES.CONTENT_CALENDAR], category: 'Content Gap' },
  'DEL-005': { name: 'Revenue Hunter', tables: [TABLES.LEADS, TABLES.CLIENTS, TABLES.PROPERTIES], category: 'Revenue Opportunity' },
  'DEL-006': { name: 'Lead Optimizer', tables: [TABLES.LEADS, TABLES.INCOMPLETE_LEADS, TABLES.MISSED_FAILED_CALLS], category: 'Revenue Opportunity' },
  'DEL-007': { name: 'Automation Watchdog', tables: [TABLES.AI_LOG, TABLES.DEPLOYMENT_TRACKER], category: 'Automation Gap' },
  'DEL-008': { name: 'Integration Architect', tables: [TABLES.DEPLOYMENT_TRACKER, TABLES.AI_LOG], category: 'Integration Gap' },
  'DEL-010': { name: 'Data Integrity Officer', tables: [TABLES.LEADS, TABLES.CLIENTS, TABLES.PROPERTIES, TABLES.CONTACTS], category: 'Data Integrity' },
  'DEL-012': { name: 'Campaign Commander', tables: [TABLES.TH_CALL_LOG, TABLES.TH_AGENT_PERFORMANCE, TABLES.TH_CAMPAIGN_ANALYTICS], category: 'Performance Issue' },
  'DEL-013': { name: 'Vendor Shield', tables: [TABLES.VENDOR_COMPLIANCE, TABLES.SERVICE_PROVIDERS], category: 'Compliance Gap' },
  'DEL-014': { name: 'Retention Guardian', tables: [TABLES.CLIENTS, TABLES.GUEST_FEEDBACK, TABLES.MAINTENANCE_REQUESTS], category: 'Client Retention' },
  'DEL-015': { name: 'Market Radar', tables: [TABLES.COMPETITIVE_INTEL, TABLES.MARKET_DATA, TABLES.COMPETITOR_DATA], category: 'Revenue Opportunity' },
};

// ── CEO Prompt Templates ──

/**
 * Generate a world-class CEO prompt for a delegation task.
 * Designed with fiduciary care and unprecedented optimization standards.
 */
export function buildCEOPrompt(agentId, agentName, taskContext) {
  return `You are ${agentName} (${agentId}), a badge-authenticated AI Delegation Agent of Coastal Key Enterprise operating at Ferrari speed. Your clearance level is Enterprise Full Access.

OPERATING PROTOCOL:
1. Take enterprise facts and raw intel and turn them into EXECUTED OUTCOMES — not plans, not drafts — outcomes.
2. Assess current reality from the data provided.
3. Define the target outcome: what must exist after your intervention.
4. Build the action sequence to close the gap between current state and target.
5. Execute immediately: create records, dispatch tasks, set deadlines, assign owners.
6. Confirm delivery with measurable proof.

FIDUCIARY STANDARDS:
- Every output must advance the enterprise toward a viable, revenue-generating, operationally sound outcome.
- Report completion status, not progress updates.
- Short, clean, and built to run.
- Prioritize by financial enterprise urgency.
- Zero idle cycles. Zero half measures.

SOVEREIGN CONTENT STANDARD (when generating content):
- 9th-grade English reading level
- Short sentences, clear structure
- No exclamation points
- Faith-forward when appropriate
- Institutional quality comparable to Fortune 500 outputs

COOPERATION AUTHORITY:
You cooperate with all Chiefs of Staff, Division Leads, Division Managers, CEO, Executive Administrator, CMO, and CTO. Your badge grants access to all divisions, all personnel records, all enterprise systems.

TASK CONTEXT:
${taskContext}

REQUIRED OUTPUT FORMAT:
1. CURRENT STATE: What exists now (bullet points)
2. TARGET STATE: What must exist (bullet points)
3. ACTION SEQUENCE: Numbered steps taken
4. EXECUTION RESULTS: What was done with proof
5. HANDOFF: Who receives this next and what they must do
6. FINANCIAL IMPACT: Estimated revenue protected or generated`;
}

/**
 * Run an enterprise-wide scan using a specific DEL agent.
 * Pulls data from assigned tables, analyzes via Claude, returns findings.
 */
export async function runAgentScan(env, agentId, options = {}) {
  const config = SCAN_CONFIGS[agentId];
  if (!config) {
    return { error: `No scan config for agent ${agentId}` };
  }

  const tableData = {};
  for (const tableId of config.tables) {
    try {
      const records = await listRecords(env, tableId, {
        maxRecords: options.maxRecords || 50,
        ...(options.filterByFormula ? { filterByFormula: options.filterByFormula } : {}),
      });
      tableData[tableId] = {
        count: records.length,
        records: records.map(r => ({ id: r.id, fields: r.fields })),
      };
    } catch (err) {
      tableData[tableId] = { error: err.message, count: 0, records: [] };
    }
  }

  const taskContext = `SCAN TYPE: ${config.category}
AGENT: ${config.name} (${agentId})
TABLES SCANNED: ${config.tables.length}
DATA SUMMARY:
${Object.entries(tableData).map(([tid, d]) => `  Table ${tid}: ${d.count} records${d.error ? ` (ERROR: ${d.error})` : ''}`).join('\n')}

RAW DATA (first 5 records per table):
${Object.entries(tableData).map(([tid, d]) =>
    `--- ${tid} ---\n${d.records.slice(0, 5).map(r => JSON.stringify(r.fields)).join('\n')}`
  ).join('\n\n')}`;

  const ceoPrompt = buildCEOPrompt(agentId, config.name, taskContext);

  const aiResult = await inference(env, {
    system: ceoPrompt,
    prompt: `Execute your scan protocol. Analyze the data provided. Identify every gap, failure, missed opportunity, and optimization available. For each finding, specify: (1) what the problem is, (2) the financial impact, (3) the corrective action, (4) who receives the handoff. Prioritize by financial urgency.`,
    tier: 'advanced',
    maxTokens: 4000,
    cacheKey: `del:scan:${agentId}:${Date.now() - (Date.now() % 3600000)}`,
    cacheTtl: 1800,
  });

  return {
    agentId,
    agentName: config.name,
    category: config.category,
    tablesScanned: config.tables.length,
    recordsAnalyzed: Object.values(tableData).reduce((sum, d) => sum + d.count, 0),
    findings: aiResult.content,
    model: aiResult.model,
    cached: aiResult.cached,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Dispatch a task to a DEL agent — records it in Airtable and optionally
 * triggers AI execution via Claude.
 */
export async function dispatchTask(env, ctx, {
  agentId,
  agentName,
  taskName,
  category,
  priority,
  sourceDivision,
  targetDivision,
  taskContext,
  executeNow = false,
}) {
  const ceoPrompt = buildCEOPrompt(agentId, agentName, taskContext);
  const timestamp = new Date().toISOString();

  // Record dispatch in Delegation Ops table
  let opsRecord;
  try {
    opsRecord = await createRecord(env, DELEGATION_OPS_TABLE, {
      'Task Name': taskName,
      'Agent ID': agentId,
      'Agent Name': agentName,
      'Status': { name: 'Dispatched' },
      'Priority': { name: priority || 'Medium' },
      'Category': { name: category || 'Content Gap' },
      'Source Division': sourceDivision || 'DEL',
      'Target Division': targetDivision || 'DEL',
      'CEO Prompt': ceoPrompt.slice(0, 100000),
      'Created At': timestamp,
      'Badge Clearance': { name: 'Enterprise Full Access' },
    });
  } catch (err) {
    console.error('Delegation Ops record creation failed:', err);
    opsRecord = null;
  }

  let executionResult = null;

  if (executeNow) {
    try {
      const aiResult = await inference(env, {
        system: ceoPrompt,
        prompt: taskContext,
        tier: 'advanced',
        maxTokens: 4000,
      });

      executionResult = aiResult.content;

      // Update record with results
      if (opsRecord) {
        ctx.waitUntil(
          updateRecord(env, DELEGATION_OPS_TABLE, opsRecord.id, {
            'Status': { name: 'Completed' },
            'Scan Results': executionResult.slice(0, 100000),
            'Resolved At': new Date().toISOString(),
          }).catch(err => console.error('Delegation Ops update failed:', err))
        );
      }
    } catch (err) {
      executionResult = `Execution error: ${err.message}`;
    }
  }

  // Log to AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `DEL: ${agentId} dispatch — ${taskName} — ${timestamp}`,
      'Module': { name: 'Delegation' },
      'Request Type': { name: 'task_dispatch' },
      'Input Brief': taskContext.slice(0, 10000),
      'Output Text': (executionResult || 'Dispatched — awaiting execution').slice(0, 10000),
      'Model Used': { name: 'claude-opus-4-6' },
      'Timestamp': timestamp,
      'Status': { name: executeNow ? 'Completed' : 'Dispatched' },
    }).catch(err => console.error('AI Log creation failed:', err))
  );

  return {
    taskId: opsRecord?.id || null,
    agentId,
    agentName,
    taskName,
    status: executeNow ? 'completed' : 'dispatched',
    executionResult,
    timestamp,
  };
}

/**
 * Execute an inter-agent handoff — transfers task context from one agent
 * to another with full context preservation.
 */
export async function executeHandoff(env, ctx, {
  fromAgentId,
  toAgentId,
  toAgentName,
  taskId,
  taskContext,
  handoffInstructions,
}) {
  const timestamp = new Date().toISOString();

  // Update original task record
  if (taskId) {
    ctx.waitUntil(
      updateRecord(env, DELEGATION_OPS_TABLE, taskId, {
        'Status': { name: 'Handed Off' },
        'Handoff To': `${toAgentId} (${toAgentName})`,
      }).catch(err => console.error('Handoff update failed:', err))
    );
  }

  // Create new task for receiving agent
  const handoffResult = await dispatchTask(env, ctx, {
    agentId: toAgentId,
    agentName: toAgentName,
    taskName: `Handoff from ${fromAgentId}: ${handoffInstructions.slice(0, 100)}`,
    category: 'Content Gap',
    priority: 'High',
    sourceDivision: 'DEL',
    targetDivision: 'DEL',
    taskContext: `HANDOFF FROM: ${fromAgentId}
HANDOFF INSTRUCTIONS: ${handoffInstructions}
ORIGINAL TASK CONTEXT:
${taskContext}`,
    executeNow: true,
  });

  return {
    handoffFrom: fromAgentId,
    handoffTo: toAgentId,
    originalTaskId: taskId,
    newTaskId: handoffResult.taskId,
    status: 'handed_off',
    executionResult: handoffResult.executionResult,
    timestamp,
  };
}

/**
 * Run the full CEO Briefing Analysis — DEL-001 (Oversight Prime) ingests
 * the briefing, decomposes it into tasks, and dispatches to specialist agents.
 */
export async function processCEOBriefing(env, ctx, briefingContent) {
  const timestamp = new Date().toISOString();

  const ceoPrompt = buildCEOPrompt('DEL-001', 'Oversight Prime',
    `CEO BRIEFING RECEIVED AT ${timestamp}:\n${briefingContent}`);

  // DEL-001 analyzes the briefing and creates task decomposition
  const aiResult = await inference(env, {
    system: ceoPrompt,
    prompt: `Analyze this CEO briefing. Decompose it into atomic tasks. For each task:
1. Assign it to the most capable DEL agent (DEL-002 through DEL-020)
2. Set priority (Critical/High/Medium/Low) based on financial urgency
3. Set category from: Content Gap, Revenue Opportunity, System Failure, Data Integrity, Automation Gap, Integration Gap, Performance Issue, Security Alert, Compliance Gap, Client Retention
4. Write a clear task name and execution instructions
5. Identify the target division for handoff after completion

Output as JSON array: [{"agentId":"DEL-XXX","taskName":"...","priority":"...","category":"...","instructions":"...","targetDivision":"..."}]`,
    tier: 'advanced',
    maxTokens: 4000,
  });

  // Record the briefing analysis
  const briefingRecord = await createRecord(env, DELEGATION_OPS_TABLE, {
    'Task Name': `CEO Briefing Analysis — ${timestamp}`,
    'Agent ID': 'DEL-001',
    'Agent Name': 'Oversight Prime',
    'Status': { name: 'Completed' },
    'Priority': { name: 'Critical' },
    'Category': { name: 'Content Gap' },
    'Source Division': 'EXC',
    'Target Division': 'DEL',
    'CEO Prompt': ceoPrompt.slice(0, 100000),
    'Scan Results': aiResult.content.slice(0, 100000),
    'Created At': timestamp,
    'Resolved At': new Date().toISOString(),
    'Badge Clearance': { name: 'Enterprise Full Access' },
  }).catch(err => { console.error('Briefing record failed:', err); return null; });

  return {
    briefingId: briefingRecord?.id || null,
    analysis: aiResult.content,
    model: aiResult.model,
    timestamp,
  };
}

/**
 * Get fleet status — summarizes all active delegation operations.
 */
export async function getFleetStatus(env) {
  let ops;
  try {
    ops = await listRecords(env, DELEGATION_OPS_TABLE, {
      maxRecords: 100,
      sort: 'Created At',
    });
  } catch (err) {
    ops = [];
  }

  const byStatus = {};
  const byAgent = {};
  const byCategory = {};

  for (const record of ops) {
    const status = record.fields['Status'] || 'Unknown';
    const agent = record.fields['Agent ID'] || 'Unknown';
    const category = record.fields['Category'] || 'Unknown';

    byStatus[status] = (byStatus[status] || 0) + 1;
    byAgent[agent] = (byAgent[agent] || 0) + 1;
    byCategory[category] = (byCategory[category] || 0) + 1;
  }

  return {
    totalOps: ops.length,
    byStatus,
    byAgent,
    byCategory,
    recentOps: ops.slice(0, 10).map(r => ({
      id: r.id,
      taskName: r.fields['Task Name'],
      agentId: r.fields['Agent ID'],
      status: r.fields['Status'],
      priority: r.fields['Priority'],
      createdAt: r.fields['Created At'],
    })),
  };
}

export { DELEGATION_OPS_TABLE };
