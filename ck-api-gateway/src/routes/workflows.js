/**
 * Workflow Routes — Automated pipelines replacing Zapier steps.
 *
 *   POST /v1/workflows/scaa1 — SCAA-1 Battle Plan Pipeline
 *   POST /v1/workflows/wf3   — WF-3 Investor Escalation
 *   POST /v1/workflows/wf4   — WF-4 Long-Tail Nurture
 *
 * Each workflow fetches lead data, runs AI inference, updates Airtable,
 * creates tasks, logs to AI Log, and fires Slack notifications.
 */

import { inference } from '../services/anthropic.js';
import { createRecord, getRecord, updateRecord, listRecords, TABLES } from '../services/airtable.js';
import { sendMessageAsync, buildWorkflowNotification } from '../services/slack.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Return today's date as YYYY-MM-DD in UTC.
 * @returns {string}
 */
function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Add days to a date string (or today if omitted) and return YYYY-MM-DD.
 * @param {string} [dateStr] — Base date in YYYY-MM-DD format. Defaults to today.
 * @param {number} days — Number of days to add.
 * @returns {string}
 */
function addDays(dateStr, days) {
  const base = dateStr ? new Date(`${dateStr}T00:00:00Z`) : new Date();
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().split('T')[0];
}

/**
 * Send a Slack notification. Uses the enterprise Slack service with
 * Bot Token API (preferred) and webhook fallback. Supports intelligent
 * event-based channel routing and rich Block Kit formatting.
 * @param {object} env
 * @param {object} ctx
 * @param {string} channel — Slack channel name (e.g. "#sales-alerts")
 * @param {string} text — Message text
 */
function sendSlack(env, ctx, channel, text) {
  sendMessageAsync(env, ctx, { channel, text });
}

/**
 * Validate that a request body contains a recordId starting with "rec".
 * @param {object} body
 * @returns {string|null} — Error message or null if valid
 */
function validateRecordId(body) {
  if (!body || typeof body !== 'object') return '"recordId" is required.';
  if (!body.recordId || typeof body.recordId !== 'string') return '"recordId" is required.';
  if (!body.recordId.startsWith('rec')) return 'Invalid recordId. Must start with "rec".';
  return null;
}

// ── SCAA-1 Battle Plan Pipeline ────────────────────────────────────────────────

/**
 * POST /v1/workflows/scaa1 — SCAA-1 Battle Plan Pipeline.
 *
 * Generates a personalized battle plan for a new lead, creates follow-up task,
 * logs to AI Log, and fires Slack notification.
 *
 * Body: { recordId: "recXXX" }
 */
export async function handleScaa1BattlePlan(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateRecordId(body);
  if (validationError) return errorResponse(validationError, 400);

  const { recordId } = body;

  // ── 1. Fetch lead ──
  let lead;
  try {
    lead = await getRecord(env, TABLES.LEADS, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch lead: ${err.message}`, 502);
  }

  const fields = lead.fields;
  const leadName = fields['Lead Name'] || 'Unknown';
  const segment = fields['Sentinel Segment'] || 'Not classified';
  const propertyAddress = fields['Property Address'] || 'N/A';
  const serviceZone = fields['Service Zone'] || 'N/A';
  const propertyValue = fields['Property Value'] || 'N/A';
  const phone = fields['Phone Number'] || 'N/A';
  const email = fields['Email'] || 'N/A';

  // ── 2. Build lead context ──
  const leadContext = [
    `Lead Name: ${leadName}`,
    `Sentinel Segment: ${segment}`,
    `Property Address: ${propertyAddress}`,
    `Service Zone: ${serviceZone}`,
    `Property Value: ${propertyValue}`,
    `Phone Number: ${phone}`,
    `Email: ${email}`,
  ].join('\n');

  // ── 3. Generate battle plan via inference ──
  let aiResult;
  try {
    aiResult = await inference(env, {
      system: `You are SCAA-1, the Sentinel Campaign Acquisition Architect for Coastal Key Property Management. You create hyper-personalized outbound sales battle plans for the Treasure Coast luxury property management market. Your outputs are concise, actionable, and designed for a human closer to execute within 48 hours.`,
      prompt: `Generate a SCAA-1 Battle Plan for this lead. Include:\n1. Opening hook tailored to their segment\n2. Three key value propositions specific to their property/zone\n3. Objection handling for top 3 likely objections\n4. Recommended next action and timeline\n5. Follow-up email draft\n\nLead Data:\n${leadContext}`,
      tier: 'advanced',
      maxTokens: 3000,
      cacheKey: `scaa1:${recordId}`,
      cacheTtl: 7200,
    });
  } catch (err) {
    return errorResponse(`AI inference failed: ${err.message}`, 502);
  }

  const battlePlan = aiResult.content;
  const timestamp = new Date().toISOString();

  // ── 4. Update lead Audit Trail ──
  const auditAppend = `\n[${timestamp}] SCAA-1 Battle Plan generated.`;
  ctx.waitUntil(
    updateRecord(env, TABLES.LEADS, recordId, {
      'Audit Trail/Activity Log': (fields['Audit Trail/Activity Log'] || '') + auditAppend,
    }).catch(err => console.error('Lead audit trail update failed:', err))
  );

  // ── 5. Create AI Log entry ──
  let aiLogRecord;
  try {
    aiLogRecord = await createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Sentinel: battle_plan — ${leadName} — ${timestamp}`,
      'Module': { name: 'Sentinel' },
      'Request Type': { name: 'battle_plan' },
      'Input Brief': leadContext.slice(0, 10000),
      'Output Text': battlePlan.slice(0, 10000),
      'Model Used': { name: aiResult.model },
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
      'Leads': [recordId],
    });
  } catch (err) {
    console.error('AI Log creation failed:', err);
    aiLogRecord = null;
  }

  // ── 6. Slack notification (rich Block Kit with intelligent routing) ──
  const airtableLink = `https://airtable.com/${env.AIRTABLE_BASE_ID}/${TABLES.LEADS}/${recordId}`;
  const wfNotification = buildWorkflowNotification('scaa1', {
    leadName,
    segment,
    summary: battlePlan,
    airtableLink,
  });
  sendMessageAsync(env, ctx, {
    event: 'workflow.scaa1',
    text: wfNotification.text,
    blocks: wfNotification.blocks,
  });

  // ── 7. Create follow-up task ──
  let taskRecord;
  try {
    taskRecord = await createRecord(env, TABLES.TASKS, {
      'Task Name': `Follow up: ${leadName} — Battle Plan ready`,
      'Type': { name: 'Follow-up' },
      'Priority': { name: 'High' },
      'Due Date': addDays(today(), 1),
      'Related Lead': [recordId],
      'Status': { name: 'Not Started' },
    });
  } catch (err) {
    console.error('Task creation failed:', err);
    taskRecord = null;
  }

  // ── 8. Audit log ──
  writeAudit(env, ctx, {
    route: '/v1/workflows/scaa1',
    action: 'battle_plan',
    recordId,
    leadName,
    model: aiResult.model,
    cached: aiResult.cached,
  });

  return jsonResponse({
    battlePlan,
    leadName,
    taskId: taskRecord?.id || null,
    aiLogId: aiLogRecord?.id || null,
  });
}

// ── WF-3 Investor Escalation ──────────────────────────────────────────────────

/**
 * POST /v1/workflows/wf3 — WF-3 Investor Escalation.
 *
 * Fires when a lead's Investor Flag is checked and WF-3 has not yet been sent.
 * Generates investor presentation, creates escalation task, prepares email payload.
 *
 * Body: { recordId: "recXXX" }
 */
export async function handleWf3InvestorEscalation(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateRecordId(body);
  if (validationError) return errorResponse(validationError, 400);

  const { recordId } = body;

  // ── 1. Fetch lead ──
  let lead;
  try {
    lead = await getRecord(env, TABLES.LEADS, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch lead: ${err.message}`, 502);
  }

  const fields = lead.fields;
  const leadName = fields['Lead Name'] || 'Unknown';
  const propertyValue = fields['Property Value'] || 'N/A';
  const email = fields['Email'] || null;

  // ── 2. Check "WF-3 Sent" (fldQku2Qjy5oMnfUQ) ──
  if (fields['WF-3 Sent']) {
    return jsonResponse({ skipped: true, reason: 'WF-3 already sent' });
  }

  // ── 3. Check "Investor Flag" (fldbgutLkHL3YAYmL) ──
  if (!fields['Investor Flag']) {
    return jsonResponse({ skipped: true, reason: 'Investor Flag not set' });
  }

  // ── 4. Generate investor presentation recommendation ──
  const leadContext = [
    `Lead Name: ${leadName}`,
    `Sentinel Segment: ${fields['Sentinel Segment'] || 'Not classified'}`,
    `Property Address: ${fields['Property Address'] || 'N/A'}`,
    `Service Zone: ${fields['Service Zone'] || 'N/A'}`,
    `Property Value: ${propertyValue}`,
    `Phone Number: ${fields['Phone Number'] || 'N/A'}`,
    `Email: ${email || 'N/A'}`,
    `Inquiry Notes: ${(fields['Inquiry Notes'] || '').slice(0, 2000)}`,
  ].join('\n');

  let aiResult;
  try {
    aiResult = await inference(env, {
      system: `You are the Coastal Key Investor Relations AI. You analyze property investment opportunities on the Treasure Coast and create compelling investor-grade summaries. Focus on ROI, market position, and competitive advantages. You specialize in converting high-value leads into investor clients.`,
      prompt: `Create an investor presentation recommendation for this lead. Include:\n1. Investment thesis tailored to their property\n2. Market analysis for their service zone\n3. Projected ROI framework\n4. Competitive positioning vs local providers\n5. Recommended presentation template and talking points\n6. Personalized welcome email content\n\nLead Data:\n${leadContext}`,
      tier: 'advanced',
      maxTokens: 2500,
      cacheKey: `wf3:${recordId}`,
      cacheTtl: 7200,
    });
  } catch (err) {
    return errorResponse(`AI inference failed: ${err.message}`, 502);
  }

  const timestamp = new Date().toISOString();
  const todayStr = today();
  const dueDateStr = addDays(todayStr, 1);

  // ── 5. Create escalation task ──
  let taskRecord;
  try {
    taskRecord = await createRecord(env, TABLES.TASKS, {
      'Task Name': `Investor Follow-up: ${leadName}`,
      'Type': { name: 'Escalation' },
      'Priority': { name: 'Urgent' },
      'Due Date': dueDateStr,
      'Related Lead': [recordId],
      'Status': { name: 'Not Started' },
    });
  } catch (err) {
    console.error('Task creation failed:', err);
    taskRecord = null;
  }

  // ── 6. Create investor presentation record ──
  let presentationRecord;
  try {
    presentationRecord = await createRecord(env, TABLES.INVESTOR_PRESENTATIONS, {
      'Presentation Name': `Investor Package — ${leadName}`,
      'Related Lead': [recordId],
      'Triggered By': 'WF-3 Investor Escalation',
      'Status': { name: 'Draft' },
      'Date Deployed': todayStr,
    });
  } catch (err) {
    console.error('Investor presentation creation failed:', err);
    presentationRecord = null;
  }

  // ── 7. Update lead: set WF-3 Sent, append Audit Trail ──
  const auditAppend = `\n[${timestamp}] WF-3 Investor Escalation fired. Presentation created. Task assigned.`;
  ctx.waitUntil(
    updateRecord(env, TABLES.LEADS, recordId, {
      'WF-3 Sent': true,
      'Audit Trail/Activity Log': (fields['Audit Trail/Activity Log'] || '') + auditAppend,
    }).catch(err => console.error('Lead update failed:', err))
  );

  // ── 8. AI Log entry ──
  let aiLogRecord;
  try {
    aiLogRecord = await createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Sentinel: investor_escalation — ${leadName} — ${timestamp}`,
      'Module': { name: 'Sentinel' },
      'Request Type': { name: 'investor_escalation' },
      'Input Brief': leadContext.slice(0, 10000),
      'Output Text': aiResult.content.slice(0, 10000),
      'Model Used': { name: aiResult.model },
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
      'Leads': [recordId],
    });
  } catch (err) {
    console.error('AI Log creation failed:', err);
    aiLogRecord = null;
  }

  // ── 9. Slack notification (routed to #investor-escalations) ──
  const wf3Notification = buildWorkflowNotification('wf3', {
    leadName,
    propertyValue,
    taskId: taskRecord?.id,
    airtableLink: `https://airtable.com/${env.AIRTABLE_BASE_ID}/${TABLES.LEADS}/${recordId}`,
  });
  sendMessageAsync(env, ctx, {
    event: 'workflow.wf3',
    text: wf3Notification.text,
    blocks: wf3Notification.blocks,
  });

  // ── 10. Prepare email payload (returned, not sent) ──
  const firstName = leadName.split(' ')[0] || leadName;
  const emailPayload = {
    to: email,
    from: 'david@coastalkey-pm.com',
    subject: `Welcome to Coastal Key — ${firstName}`,
    body: [
      `Hi ${firstName},`,
      '',
      `Thank you for your interest in Coastal Key Property Management. We've prepared a personalized investor package based on your property and local market data.`,
      '',
      `Your dedicated portfolio advisor will walk you through our projected ROI framework and competitive positioning for your service zone.`,
      '',
      `In the meantime, here's a brief overview video: [VIDEO_LINK_PLACEHOLDER]`,
      '',
      `We'll be in touch within 24 hours to schedule a consultation.`,
      '',
      `Best regards,`,
      `David — Coastal Key Property Management`,
    ].join('\n'),
  };

  // ── 11. Audit ──
  writeAudit(env, ctx, {
    route: '/v1/workflows/wf3',
    action: 'investor_escalation',
    recordId,
    leadName,
    model: aiResult.model,
  });

  return jsonResponse({
    escalation: true,
    taskId: taskRecord?.id || null,
    presentationId: presentationRecord?.id || null,
    emailPayload,
  });
}

// ── WF-4 Long-Tail Nurture ────────────────────────────────────────────────────

/** Dispositions that qualify a lead for long-tail nurture enrollment. */
const NURTURE_QUALIFYING_DISPOSITIONS = ['No Answer', 'Not Interested'];

/**
 * POST /v1/workflows/wf4 — WF-4 Long-Tail Nurture.
 *
 * Fires when a lead's Call Disposition changes to a nurture-qualifying value.
 * Enrolls the lead in a 90-day drip sequence and creates a re-engagement task.
 *
 * Body: { recordId: "recXXX" }
 */
export async function handleWf4LongTailNurture(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateRecordId(body);
  if (validationError) return errorResponse(validationError, 400);

  const { recordId } = body;

  // ── 1. Fetch lead ──
  let lead;
  try {
    lead = await getRecord(env, TABLES.LEADS, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch lead: ${err.message}`, 502);
  }

  const fields = lead.fields;
  const leadName = fields['Lead Name'] || 'Unknown';
  const email = fields['Email'] || null;
  const callDisposition = fields['Call Disposition'] || null;
  const auditTrail = fields['Audit Trail/Activity Log'] || '';

  // ── 2. Check Call Disposition ──
  // Call Disposition may be a string or a { name } select object
  const dispositionValue = typeof callDisposition === 'object' && callDisposition !== null
    ? callDisposition.name
    : callDisposition;

  if (!dispositionValue || !NURTURE_QUALIFYING_DISPOSITIONS.includes(dispositionValue)) {
    return jsonResponse({
      skipped: true,
      reason: `Call Disposition "${dispositionValue || 'empty'}" does not qualify for nurture.`,
    });
  }

  // ── 3. Check for prior WF-4 enrollment in Audit Trail ──
  if (auditTrail.includes('WF-4 nurture enrolled')) {
    return jsonResponse({
      skipped: true,
      reason: 'WF-4 nurture already enrolled.',
    });
  }

  const timestamp = new Date().toISOString();
  const todayStr = today();
  const reEngagementDate = addDays(todayStr, 90);

  // ── 4. Create re-engagement task ──
  let taskRecord;
  try {
    taskRecord = await createRecord(env, TABLES.TASKS, {
      'Task Name': `Re-engagement: ${leadName} — 90-day nurture check`,
      'Type': { name: 'Re-engagement' },
      'Priority': { name: 'Low' },
      'Due Date': reEngagementDate,
      'Related Lead': [recordId],
      'Status': { name: 'Not Started' },
    });
  } catch (err) {
    console.error('Task creation failed:', err);
    taskRecord = null;
  }

  // ── 5 & 6. Update lead: Sequence Step + Audit Trail ──
  const auditAppend = `\n[${timestamp}] WF-4 nurture enrolled. Re-engagement task created for ${reEngagementDate}.`;
  ctx.waitUntil(
    updateRecord(env, TABLES.LEADS, recordId, {
      'Sequence Step': { name: 'Day 14 - Long-Tail Nurture' },
      'Audit Trail/Activity Log': auditTrail + auditAppend,
    }).catch(err => console.error('Lead update failed:', err))
  );

  // ── 7. Slack notification (routed to #pipeline-updates) ──
  const wf4Notification = buildWorkflowNotification('wf4', {
    leadName,
    reEngagementDate,
    taskId: taskRecord?.id,
    airtableLink: `https://airtable.com/${env.AIRTABLE_BASE_ID}/${TABLES.LEADS}/${recordId}`,
  });
  sendMessageAsync(env, ctx, {
    event: 'workflow.wf4',
    text: wf4Notification.text,
    blocks: wf4Notification.blocks,
  });

  // ── 8. Prepare Constant Contact payload (returned, not sent) ──
  const nameParts = leadName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const constantContactPayload = {
    email: email || null,
    firstName,
    lastName,
    listName: 'Sentinel Long-Tail Nurture',
  };

  // ── Audit ──
  writeAudit(env, ctx, {
    route: '/v1/workflows/wf4',
    action: 'long_tail_nurture',
    recordId,
    leadName,
    disposition: dispositionValue,
    reEngagementDate,
  });

  // ── 9. Return ──
  return jsonResponse({
    enrolled: true,
    taskId: taskRecord?.id || null,
    reEngagementDate,
    constantContactPayload,
  });
}
