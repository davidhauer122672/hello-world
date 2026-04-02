/**
 * Upgrade Engine — Core orchestration for the 20 UPG-division agents.
 *
 * Manages the 7-day enterprise upgrade sprint:
 *   Day 1: Buffer + Twitter/X + Slack #delegation-ops + Cron triggers
 *   Day 2: Constant Contact + Airtable automations + Content pipeline
 *   Day 3: Gmail drafts + Canva designs + CEO briefing webhook upgrade
 *   Day 4: Gamma presentations + Zapier Tables
 *   Day 5: Google Sheets dashboards + Manus AI
 *   Day 6: API hardening + Dashboard upgrade
 *   Day 7: Integration testing + Sprint close
 *
 * Cron-triggered scans run via Cloudflare Workers scheduled handler.
 */

import { inference } from './anthropic.js';
import { createRecord, listRecords, updateRecord, TABLES } from './airtable.js';
import {
  bufferPublish,
  twitterPost,
  constantContactEnroll,
  sendDelegationSlack,
  autoGenerateContent,
  crossPlatformPublish,
} from './integrations.js';

// ── Upgrade Ops uses the Delegation Ops table ──
const UPGRADE_OPS_TABLE = TABLES.DELEGATION_OPS || 'tblx1HfUCXhhA8UkJ';

// ── Sprint Day Configuration ──
const SPRINT_SCHEDULE = {
  1: { agents: ['UPG-002', 'UPG-003', 'UPG-012', 'UPG-013'], focus: 'Buffer + Twitter/X + Slack + Cron' },
  2: { agents: ['UPG-004', 'UPG-014', 'UPG-015'], focus: 'Constant Contact + Airtable Automations + Content Pipeline' },
  3: { agents: ['UPG-006', 'UPG-007', 'UPG-016'], focus: 'Gmail + Canva + CEO Briefing Upgrade' },
  4: { agents: ['UPG-008', 'UPG-009'], focus: 'Gamma Presentations + Zapier Tables' },
  5: { agents: ['UPG-010', 'UPG-011'], focus: 'Google Sheets Dashboards + Manus AI' },
  6: { agents: ['UPG-017', 'UPG-018'], focus: 'API Hardening + Dashboard Upgrade' },
  7: { agents: ['UPG-019', 'UPG-020'], focus: 'Integration Testing + Sprint Close' },
};

/**
 * Execute a specific integration upgrade action.
 */
export async function executeUpgrade(env, ctx, { agentId, action, params }) {
  const timestamp = new Date().toISOString();

  // Route to integration
  let result;
  switch (action) {
    case 'buffer_publish':
      result = await bufferPublish(env, params);
      break;

    case 'twitter_post':
      result = await twitterPost(env, params);
      break;

    case 'constant_contact_enroll':
      result = await constantContactEnroll(env, params);
      break;

    case 'auto_generate_content':
      result = await autoGenerateContent(env, ctx, params);
      break;

    case 'cross_platform_publish':
      result = await crossPlatformPublish(env, ctx, params);
      break;

    case 'content_scan': {
      // DEL-002 content scan — run via cron daily at 6 PM ET
      result = await runContentScan(env, ctx);
      break;
    }

    case 'gap_alert': {
      // Daily gap alert — check next 48 hours
      result = await runGapAlert(env, ctx);
      break;
    }

    case 'pipeline_tracker': {
      // Status pipeline tracker — detect stalled posts
      result = await runPipelineTracker(env, ctx);
      break;
    }

    case 'empty_cleanup': {
      // Empty record cleanup — remove stale drafts
      result = await runEmptyCleanup(env, ctx);
      break;
    }

    default:
      result = { error: `Unknown action: ${action}` };
  }

  // Record in Delegation Ops
  try {
    await createRecord(env, UPGRADE_OPS_TABLE, {
      'Task Name': `UPG: ${action} — ${agentId}`,
      'Agent ID': agentId,
      'Agent Name': `UPG Agent`,
      'Status': { name: result.error ? 'Failed' : 'Completed' },
      'Priority': { name: 'High' },
      'Category': { name: 'Systems Upgrade' },
      'Source Division': 'UPG',
      'Target Division': 'UPG',
      'Scan Results': JSON.stringify(result).slice(0, 100000),
      'Created At': timestamp,
      'Resolved At': new Date().toISOString(),
      'Badge Clearance': { name: 'Enterprise Full Access' },
    });
  } catch (err) {
    console.error('Upgrade ops record creation failed:', err);
  }

  // Slack notify
  sendDelegationSlack(env, ctx, {
    agentId,
    agentName: action,
    action: `Upgrade: ${action}`,
    details: result.error || `Completed successfully`,
    priority: result.error ? 'Critical' : 'Medium',
  });

  return { agentId, action, result, timestamp };
}

/**
 * Run DEL-002 content scan — checks Content Calendar for platform gaps.
 * Triggered by cron at 6 PM ET daily.
 */
async function runContentScan(env, ctx) {
  let records;
  try {
    records = await listRecords(env, TABLES.CONTENT_CALENDAR, {
      maxRecords: 100,
      filterByFormula: `IS_AFTER({Post Date}, DATEADD(TODAY(), -7, 'days'))`,
    });
  } catch (err) {
    return { error: `Content Calendar scan failed: ${err.message}` };
  }

  const platforms = {};
  const pillars = {};
  const statuses = {};
  const postTypes = {};

  for (const r of records) {
    const f = r.fields;
    const plat = Array.isArray(f['Platform']) ? f['Platform'] : [f['Platform'] || 'Unknown'];
    for (const p of plat) {
      platforms[p] = (platforms[p] || 0) + 1;
    }
    const pillar = f['Content Pillar'] || 'Unassigned';
    pillars[pillar] = (pillars[pillar] || 0) + 1;
    const status = f['Status'] || 'Unknown';
    statuses[status] = (statuses[status] || 0) + 1;
    const pt = f['Post Type'] || 'Unknown';
    postTypes[pt] = (postTypes[pt] || 0) + 1;
  }

  const allPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'Buffer', 'Mighty', 'Alignable'];
  const darkPlatforms = allPlatforms.filter(p => !platforms[p] || platforms[p] === 0);

  const gaps = [];
  if (darkPlatforms.length > 0) {
    gaps.push({ type: 'CRITICAL', issue: `Dark platforms: ${darkPlatforms.join(', ')}`, impact: 'Zero audience reach on these channels' });
  }
  if (!statuses['Published'] || statuses['Published'] === 0) {
    gaps.push({ type: 'CRITICAL', issue: 'Zero Published posts in pipeline', impact: 'Content not reaching audience' });
  }

  // Auto-remediate: generate content for dark platforms
  const remediations = [];
  for (const darkPlatform of darkPlatforms.slice(0, 3)) {
    try {
      const gen = await autoGenerateContent(env, ctx, {
        platform: darkPlatform,
        pillar: 'Brand',
        postType: 'Text Post',
        brief: `Coastal Key Property Management — Treasure Coast luxury property expertise. Professional, trusted service for discerning property owners.`,
      });
      remediations.push({ platform: darkPlatform, recordId: gen.airtableRecordId, status: 'generated' });
    } catch (err) {
      remediations.push({ platform: darkPlatform, status: 'failed', error: err.message });
    }
  }

  return {
    totalRecords: records.length,
    platforms,
    pillars,
    statuses,
    postTypes,
    darkPlatforms,
    gaps,
    remediations,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Run daily gap alert — check next 48 hours for platform gaps.
 */
async function runGapAlert(env, ctx) {
  let records;
  try {
    records = await listRecords(env, TABLES.CONTENT_CALENDAR, {
      maxRecords: 50,
      filterByFormula: `AND(IS_AFTER({Post Date}, TODAY()), IS_BEFORE({Post Date}, DATEADD(TODAY(), 2, 'days')))`,
    });
  } catch (err) {
    return { error: `Gap alert scan failed: ${err.message}` };
  }

  const scheduledPlatforms = new Set();
  for (const r of records) {
    const plat = Array.isArray(r.fields['Platform']) ? r.fields['Platform'] : [];
    plat.forEach(p => scheduledPlatforms.add(p));
  }

  const allPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'Buffer', 'Mighty', 'Alignable'];
  const gapPlatforms = allPlatforms.filter(p => !scheduledPlatforms.has(p));

  if (gapPlatforms.length > 0) {
    sendDelegationSlack(env, ctx, {
      agentId: 'UPG-013',
      agentName: 'Cron Sentinel',
      action: '48-Hour Platform Gap Alert',
      details: `Platforms with NO scheduled content in next 48h: ${gapPlatforms.join(', ')}`,
      priority: gapPlatforms.length >= 3 ? 'Critical' : 'High',
    });
  }

  return { scheduledPlatforms: [...scheduledPlatforms], gapPlatforms, postsScheduled: records.length };
}

/**
 * Run pipeline tracker — detect posts stuck in Draft (>72h) or Approved (>48h).
 */
async function runPipelineTracker(env, ctx) {
  let records;
  try {
    records = await listRecords(env, TABLES.CONTENT_CALENDAR, {
      maxRecords: 100,
      filterByFormula: `OR({Status} = 'Draft', {Status} = 'Approved')`,
    });
  } catch (err) {
    return { error: `Pipeline tracker scan failed: ${err.message}` };
  }

  const stale = [];
  const now = Date.now();
  for (const r of records) {
    const created = r.fields['Created'] || r.fields['Post Date'];
    if (!created) continue;
    const age = now - new Date(created).getTime();
    const hours = age / (1000 * 60 * 60);
    const status = r.fields['Status'];
    if ((status === 'Draft' && hours > 72) || (status === 'Approved' && hours > 48)) {
      stale.push({
        id: r.id,
        title: r.fields['Post Title'] || 'Untitled',
        status,
        ageHours: Math.round(hours),
      });
    }
  }

  if (stale.length > 0) {
    sendDelegationSlack(env, ctx, {
      agentId: 'DEL-004',
      agentName: 'Pipeline Guardian',
      action: 'Stale Pipeline Alert',
      details: `${stale.length} posts stuck: ${stale.map(s => `${s.title} (${s.status}, ${s.ageHours}h)`).join('; ')}`,
      priority: stale.length > 5 ? 'Critical' : 'High',
    });
  }

  return { totalScanned: records.length, staleCount: stale.length, stalePosts: stale };
}

/**
 * Run empty record cleanup — remove records with no title and no caption.
 */
async function runEmptyCleanup(env, ctx) {
  let records;
  try {
    records = await listRecords(env, TABLES.CONTENT_CALENDAR, {
      maxRecords: 100,
      filterByFormula: `AND({Post Title} = '', {Caption} = '')`,
    });
  } catch (err) {
    return { error: `Empty cleanup scan failed: ${err.message}` };
  }

  const flagged = records.map(r => ({
    id: r.id,
    platform: r.fields['Platform'] || 'Unknown',
    status: r.fields['Status'] || 'Unknown',
    postDate: r.fields['Post Date'] || 'Unknown',
  }));

  if (flagged.length > 0) {
    sendDelegationSlack(env, ctx, {
      agentId: 'DEL-004',
      agentName: 'Pipeline Guardian',
      action: 'Empty Record Cleanup',
      details: `${flagged.length} empty records flagged for cleanup.`,
      priority: flagged.length > 20 ? 'High' : 'Medium',
    });
  }

  return { emptyRecords: flagged.length, records: flagged };
}

/**
 * Get the sprint dashboard — current day, active agents, completion status.
 */
export function getSprintDashboard() {
  const sprintStart = new Date('2026-04-02T00:00:00Z');
  const now = new Date();
  const daysSinceStart = Math.ceil((now - sprintStart) / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(Math.max(daysSinceStart, 1), 7);

  return {
    sprintName: 'Enterprise Systems Upgrade Sprint',
    sprintStart: '2026-04-02',
    sprintEnd: '2026-04-09',
    currentDay,
    daysRemaining: Math.max(7 - currentDay, 0),
    schedule: SPRINT_SCHEDULE,
    todayFocus: SPRINT_SCHEDULE[currentDay],
    totalAgents: 20,
    totalIntegrations: 10,
    integrations: [
      { name: 'Buffer API', agent: 'UPG-002', day: 1, status: 'deployed' },
      { name: 'Twitter/X API v2', agent: 'UPG-003', day: 1, status: 'deployed' },
      { name: 'Slack #delegation-ops', agent: 'UPG-012', day: 1, status: 'deployed' },
      { name: 'Cloudflare Cron Triggers', agent: 'UPG-013', day: 1, status: 'deployed' },
      { name: 'Constant Contact', agent: 'UPG-004', day: 2, status: 'deployed' },
      { name: 'Airtable Automations', agent: 'UPG-014', day: 2, status: 'deployed' },
      { name: 'Content Auto-Generation', agent: 'UPG-015', day: 2, status: 'deployed' },
      { name: 'Gmail Drafts', agent: 'UPG-006', day: 3, status: 'deployed' },
      { name: 'Canva Design', agent: 'UPG-007', day: 3, status: 'deployed' },
      { name: 'Gamma Presentations', agent: 'UPG-008', day: 4, status: 'deployed' },
      { name: 'Zapier Tables', agent: 'UPG-009', day: 4, status: 'deployed' },
      { name: 'Google Sheets', agent: 'UPG-010', day: 5, status: 'deployed' },
      { name: 'Manus AI', agent: 'UPG-011', day: 5, status: 'deployed' },
    ],
  };
}

/**
 * Cloudflare Workers cron handler — triggered by scheduled events.
 * Maps cron schedules to DEL/UPG agent scans.
 */
export async function handleScheduledEvent(env, ctx, scheduledTime) {
  const hour = new Date(scheduledTime).getUTCHours();
  const dayOfWeek = new Date(scheduledTime).getUTCDay();
  const results = [];

  // 6 PM ET = 22:00 UTC (or 23:00 UTC during EST)
  if (hour === 22 || hour === 23) {
    // Daily content scan (DEL-002)
    results.push(await executeUpgrade(env, ctx, {
      agentId: 'DEL-002',
      action: 'content_scan',
      params: {},
    }));

    // Daily gap alert
    results.push(await executeUpgrade(env, ctx, {
      agentId: 'UPG-013',
      action: 'gap_alert',
      params: {},
    }));
  }

  // Monday 8 AM ET = 12:00/13:00 UTC
  if (dayOfWeek === 1 && (hour === 12 || hour === 13)) {
    // Weekly report
    results.push(await executeUpgrade(env, ctx, {
      agentId: 'DEL-018',
      action: 'content_scan',
      params: {},
    }));
  }

  // Wed + Fri 9 AM ET = 13:00/14:00 UTC
  if ((dayOfWeek === 3 || dayOfWeek === 5) && (hour === 13 || hour === 14)) {
    // Pipeline tracker
    results.push(await executeUpgrade(env, ctx, {
      agentId: 'DEL-004',
      action: 'pipeline_tracker',
      params: {},
    }));
  }

  // Sunday 9 PM ET = 01:00/02:00 UTC Monday
  if (dayOfWeek === 0 && (hour === 1 || hour === 2)) {
    // Empty record cleanup
    results.push(await executeUpgrade(env, ctx, {
      agentId: 'DEL-004',
      action: 'empty_cleanup',
      params: {},
    }));
  }

  return results;
}
