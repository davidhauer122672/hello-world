/**
 * Project Sentinel Routes — Atlas + Retell AI Deployment Management.
 *
 *   GET  /v1/sentinel/deployment         — Full deployment status + blocker state
 *   POST /v1/sentinel/deployment/blocker  — Resolve a pre-launch blocker
 *   GET  /v1/sentinel/sequence           — 6-touch 14-day sequence configuration
 *   POST /v1/sentinel/sequence/advance    — Advance a lead to the next sequence step
 *   POST /v1/sentinel/investor-flag       — Evaluate and set investor flag on a lead
 *   GET  /v1/sentinel/kpis               — Live KPI snapshot vs targets
 *   POST /v1/sentinel/go-live            — Authorize Step 10 activation (CEO only)
 *
 * All routes reference the CEO-authorized Project Sentinel deployment config.
 * Airtable Record: recpEkZoxXTKNXYWW (Deployment Tracker)
 */

import { createRecord, getRecord, updateRecord, listRecords, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Project Sentinel Configuration ──────────────────────────────────────────

const SENTINEL_CONFIG = {
  name: 'Project Sentinel',
  campaign: '[CK] Project Sentinel - Outbound',
  authorization_date: '2026-04-02',
  authorized_by: 'David Hauer, Founder and CEO',
  classification: 'Confidential — CEO Use Only',
  airtable_record: 'recpEkZoxXTKNXYWW',
};

const PROSPECT_SEGMENTS = [
  { name: 'Absentee Homeowners',         priority: 1, revenue: '$195 to $395/month recurring' },
  { name: 'Luxury Property ($1M+)',       priority: 2, revenue: '$395/month + property premium' },
  { name: 'Investor / Family Office',     priority: 1, revenue: 'Multi-property; $5M+ triggers WF-3', track: 'Investor' },
  { name: 'Seasonal Residents / Snowbirds', priority: 2, revenue: '$295 to $395/month' },
  { name: 'STR / Vacation Rental Owners', priority: 3, revenue: '10% of gross rental income' },
];

const SEQUENCE_STEPS = [
  { day: 1,  touch: 'Cold Open Call',       channel: 'Retell Outbound',  script: 'Script 1', goal: 'Qualify + book consultation' },
  { day: 2,  touch: 'Voicemail Drop',        channel: 'Retell VM Drop',   script: 'Script 2', goal: 'Restate value, leave callback' },
  { day: 4,  touch: 'Second Live Attempt',   channel: 'Retell Outbound',  script: 'Script 3', goal: 'Handle objections, close to consult' },
  { day: 7,  touch: 'Welcome Email Trigger', channel: 'Zapier to Gmail',  script: null,        goal: 'CEO welcome email + launch video' },
  { day: 10, touch: 'Final Call',            channel: 'Retell Outbound',  script: 'Script 4', goal: 'Hard close or disqualify' },
  { day: 14, touch: 'Long-Tail Nurture',     channel: 'Constant Contact', script: null,        goal: '90-day drip if no close' },
];

const CALLING_HOURS = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  start: '09:00 ET',
  end: '19:00 ET',
  sunday: false,
  daily_dial_cap: { min: 80, max: 100 },
};

const KPI_TARGETS = {
  dials_per_agent_per_day:       { min: 80, max: 100, benchmark: '60 to 80' },
  connect_rate:                  { min: 0.12, max: 0.18, benchmark: '8% to 12%' },
  consultation_book_rate:        { min: 0.25, max: 0.35, benchmark: '15% to 20%' },
  consultation_to_close_rate:    { min: 0.40, max: 0.60, benchmark: '25% to 35%' },
  cost_per_acquisition:          { target: 150, ltv_annual: 3540 },
  sequence_completion_rate:      { target: 0.85 },
  investor_flag_accuracy:        { target: 1.0 },
};

const INVESTOR_KEYWORDS = ['investor', 'family office', 'trust', 'roi'];
const INVESTOR_VALUE_THRESHOLD = 5000000;

const SLACK_CHANNELS = {
  sales_alerts:            'C0AP1HRFTBL',
  sales_alerts_high_value: 'C0ANV6HALHH',
};

// ── Airtable Field IDs (Leads Table) ────────────────────────────────────────

const FIELDS = {
  LEAD_NAME:        'fldAQJqw8WaAzVJkc',
  SENTINEL_SEGMENT: 'fldIO7nG7Rdjbg1CY',
  PROPERTY_VALUE:   'fldxaWbH7pkY7Jpzv',
  SERVICE_ZONE:     'fldqWoQGCR1M1k3O9',
  CALL_DISPOSITION: 'fld6O4IRIKmGfzWHg',
  INVESTOR_FLAG:    'fldbgutLkHL3YAYmL',
  SEQUENCE_STEP:    'fldKNvxsK7YjykNPY',
  PROPERTY_ADDRESS: 'fldM63iz3K8k36Vjh',
  MAILING_ADDRESS:  'fldNVapicg1kweyZt',
  WF3_SENT:         'fldQku2Qjy5oMnfUQ',
  PHONE_NUMBER:     'fld1QyH8hdLQnTm09',
};

// ── Pre-Launch Blockers ─────────────────────────────────────────────────────

const PRE_LAUNCH_BLOCKERS = [
  { id: 1, name: 'Slack Channel IDs',  description: 'Confirm #sales-alerts and #sales-alerts-high-value channel IDs in Slack' },
  { id: 2, name: 'Zapier WF-1',        description: 'Build WF-1 New Lead Nurture in Zapier and set to ON' },
  { id: 3, name: 'Zapier WF-3',        description: 'Build WF-3 Investor Escalation in Zapier and set to ON' },
  { id: 4, name: 'TCPA DNC Scrub',     description: 'Scrub prospect lists against national DNC registry' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendSlack(env, ctx, channel, text) {
  if (!env.SLACK_WEBHOOK_URL) return;
  ctx.waitUntil(
    fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text }),
    }).catch(err => console.error('Slack notification failed:', err))
  );
}

/**
 * Determine current sequence step name from day number.
 */
function getSequenceStepByDay(day) {
  return SEQUENCE_STEPS.find(s => s.day === day) || null;
}

/**
 * Get the next sequence step after the current one.
 */
function getNextSequenceStep(currentDay) {
  const idx = SEQUENCE_STEPS.findIndex(s => s.day === currentDay);
  if (idx === -1 || idx >= SEQUENCE_STEPS.length - 1) return null;
  return SEQUENCE_STEPS[idx + 1];
}

// ── GET /v1/sentinel/deployment ─────────────────────────────────────────────

export async function handleSentinelDeployment(env) {
  let blockerStatus;
  try {
    const tracker = await getRecord(env, TABLES.DEPLOYMENT_TRACKER, SENTINEL_CONFIG.airtable_record);
    blockerStatus = tracker.fields;
  } catch {
    blockerStatus = null;
  }

  const blockers = PRE_LAUNCH_BLOCKERS.map(b => ({
    ...b,
    resolved: blockerStatus?.[`Blocker ${b.id} Resolved`] || false,
  }));

  const allResolved = blockers.every(b => b.resolved);

  return jsonResponse({
    config: SENTINEL_CONFIG,
    status: allResolved ? 'READY_FOR_GO_LIVE' : 'BLOCKERS_PENDING',
    step_10_locked: !allResolved,
    blockers,
    segments: PROSPECT_SEGMENTS,
    sequence: SEQUENCE_STEPS,
    calling_hours: CALLING_HOURS,
    slack_channels: SLACK_CHANNELS,
    field_reference: FIELDS,
    timestamp: new Date().toISOString(),
  });
}

// ── POST /v1/sentinel/deployment/blocker ────────────────────────────────────

export async function handleResolveBlocker(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { blockerId, resolved } = body;
  if (!blockerId || typeof blockerId !== 'number' || blockerId < 1 || blockerId > 4) {
    return errorResponse('blockerId must be 1, 2, 3, or 4.', 400);
  }

  const blocker = PRE_LAUNCH_BLOCKERS.find(b => b.id === blockerId);
  const timestamp = new Date().toISOString();

  try {
    await updateRecord(env, TABLES.DEPLOYMENT_TRACKER, SENTINEL_CONFIG.airtable_record, {
      [`Blocker ${blockerId} Resolved`]: resolved !== false,
    });
  } catch (err) {
    return errorResponse(`Failed to update blocker: ${err.message}`, 502);
  }

  writeAudit(env, ctx, {
    route: '/v1/sentinel/deployment/blocker',
    action: 'resolve_blocker',
    blockerId,
    blockerName: blocker.name,
    resolved: resolved !== false,
  });

  sendSlack(env, ctx, `#sales-alerts`,
    `*PROJECT SENTINEL:* Blocker #${blockerId} (${blocker.name}) ${resolved !== false ? 'RESOLVED' : 'REOPENED'}`
  );

  return jsonResponse({
    blockerId,
    name: blocker.name,
    resolved: resolved !== false,
    timestamp,
  });
}

// ── GET /v1/sentinel/sequence ───────────────────────────────────────────────

export async function handleSentinelSequence() {
  return jsonResponse({
    campaign: SENTINEL_CONFIG.campaign,
    sequence: SEQUENCE_STEPS,
    total_touches: SEQUENCE_STEPS.length,
    duration_days: 14,
    calling_hours: CALLING_HOURS,
  });
}

// ── POST /v1/sentinel/sequence/advance ──────────────────────────────────────

export async function handleSequenceAdvance(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { recordId, currentDay } = body;
  if (!recordId || typeof recordId !== 'string' || !recordId.startsWith('rec')) {
    return errorResponse('Valid recordId required.', 400);
  }
  if (typeof currentDay !== 'number') {
    return errorResponse('currentDay (number) required.', 400);
  }

  const nextStep = getNextSequenceStep(currentDay);
  if (!nextStep) {
    return jsonResponse({
      advanced: false,
      reason: 'Lead has completed the 6-touch sequence or invalid currentDay.',
      recordId,
    });
  }

  const stepLabel = `Day ${nextStep.day} - ${nextStep.touch}`;
  const timestamp = new Date().toISOString();

  try {
    await updateRecord(env, TABLES.LEADS, recordId, {
      'Sequence Step': { name: stepLabel },
    });
  } catch (err) {
    return errorResponse(`Failed to advance sequence: ${err.message}`, 502);
  }

  writeAudit(env, ctx, {
    route: '/v1/sentinel/sequence/advance',
    action: 'sequence_advance',
    recordId,
    from: `Day ${currentDay}`,
    to: stepLabel,
  });

  return jsonResponse({
    advanced: true,
    recordId,
    previousDay: currentDay,
    nextStep: {
      day: nextStep.day,
      touch: nextStep.touch,
      channel: nextStep.channel,
      goal: nextStep.goal,
    },
    stepLabel,
    timestamp,
  });
}

// ── POST /v1/sentinel/investor-flag ─────────────────────────────────────────

export async function handleInvestorFlagEvaluate(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { recordId } = body;
  if (!recordId || typeof recordId !== 'string' || !recordId.startsWith('rec')) {
    return errorResponse('Valid recordId required.', 400);
  }

  let lead;
  try {
    lead = await getRecord(env, TABLES.LEADS, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch lead: ${err.message}`, 502);
  }

  const fields = lead.fields;
  const propertyValue = parseFloat(fields['Property Value']) || 0;
  const leadName = fields['Lead Name'] || 'Unknown';

  // Check property value threshold
  const valueTriggered = propertyValue >= INVESTOR_VALUE_THRESHOLD;

  // Check keyword match across relevant text fields
  const textToScan = [
    fields['Lead Name'],
    fields['Inquiry Notes'],
    fields['Sentinel Segment'],
    fields['Audit Trail/Activity Log'],
  ].filter(Boolean).join(' ').toLowerCase();

  const keywordTriggered = INVESTOR_KEYWORDS.some(kw => textToScan.includes(kw));
  const shouldFlag = valueTriggered || keywordTriggered;

  if (shouldFlag && !fields['Investor Flag']) {
    // Set the flag
    try {
      await updateRecord(env, TABLES.LEADS, recordId, {
        'Investor Flag': true,
      });
    } catch (err) {
      return errorResponse(`Failed to set investor flag: ${err.message}`, 502);
    }

    // Notify high-value channel
    sendSlack(env, ctx, '#sales-alerts-high-value',
      `*INVESTOR DETECTED:* ${leadName} — Value: $${propertyValue.toLocaleString()} — ${valueTriggered ? 'Value threshold' : 'Keyword match'}`
    );

    writeAudit(env, ctx, {
      route: '/v1/sentinel/investor-flag',
      action: 'investor_flag_set',
      recordId,
      leadName,
      propertyValue,
      valueTriggered,
      keywordTriggered,
    });
  }

  return jsonResponse({
    recordId,
    leadName,
    propertyValue,
    investorFlag: shouldFlag,
    alreadyFlagged: !!fields['Investor Flag'],
    triggers: {
      value_threshold: valueTriggered,
      keyword_match: keywordTriggered,
      keywords_found: keywordTriggered ? INVESTOR_KEYWORDS.filter(kw => textToScan.includes(kw)) : [],
    },
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/sentinel/kpis ───────────────────────────────────────────────────

export async function handleSentinelKpis(env) {
  // Fetch latest campaign analytics and call log for live metrics
  let analyticsRecords, callRecords;
  try {
    [analyticsRecords, callRecords] = await Promise.all([
      listRecords(env, TABLES.TH_CAMPAIGN_ANALYTICS, { maxRecords: 7, sort: 'Report Date' }),
      listRecords(env, TABLES.TH_CALL_LOG, { maxRecords: 200 }),
    ]);
  } catch (err) {
    return errorResponse(`Failed to fetch KPI data: ${err.message}`, 502);
  }

  // Calculate live metrics from recent calls
  const totalCalls = callRecords.length;
  const connections = callRecords.filter(r =>
    r.fields['Call Outcome'] && !['No Answer', 'Voicemail'].includes(r.fields['Call Outcome'])
  ).length;
  const connectRate = totalCalls > 0 ? connections / totalCalls : 0;

  return jsonResponse({
    targets: KPI_TARGETS,
    live_metrics: {
      total_recent_calls: totalCalls,
      connections,
      connect_rate: Math.round(connectRate * 1000) / 10 + '%',
      analytics_periods: analyticsRecords.length,
    },
    revenue_projection: {
      dials_per_day: 80,
      connect_rate_assumed: 0.15,
      connects_per_agent: 12,
      book_rate: 0.30,
      consults_per_day: 3.6,
      close_rate: 0.50,
      new_clients_per_day: 1.8,
      arr_per_client: 3540,
      weekly_new_recurring_revenue: 31860,
    },
    timestamp: new Date().toISOString(),
  });
}

// ── POST /v1/sentinel/go-live ───────────────────────────────────────────────

export async function handleSentinelGoLive(request, env, ctx) {
  // Verify all blockers are resolved before activation
  let tracker;
  try {
    tracker = await getRecord(env, TABLES.DEPLOYMENT_TRACKER, SENTINEL_CONFIG.airtable_record);
  } catch (err) {
    return errorResponse(`Failed to fetch deployment tracker: ${err.message}`, 502);
  }

  const blockerResults = PRE_LAUNCH_BLOCKERS.map(b => ({
    ...b,
    resolved: tracker.fields[`Blocker ${b.id} Resolved`] || false,
  }));

  const unresolvedBlockers = blockerResults.filter(b => !b.resolved);
  if (unresolvedBlockers.length > 0) {
    return jsonResponse({
      activated: false,
      reason: 'Pre-launch blockers remain unresolved. Step 10 is locked.',
      unresolved: unresolvedBlockers,
    }, 409);
  }

  const timestamp = new Date().toISOString();

  // Update deployment tracker to LIVE
  try {
    await updateRecord(env, TABLES.DEPLOYMENT_TRACKER, SENTINEL_CONFIG.airtable_record, {
      'Status': 'LIVE',
      'Activation Date': timestamp.split('T')[0],
      'Activated By': SENTINEL_CONFIG.authorized_by,
    });
  } catch (err) {
    return errorResponse(`Failed to activate deployment: ${err.message}`, 502);
  }

  // Notify both Slack channels
  sendSlack(env, ctx, '#sales-alerts',
    `*PROJECT SENTINEL — GO LIVE AUTHORIZED*\nAll blockers resolved. Atlas Step 10 activated.\nAuthorized by: ${SENTINEL_CONFIG.authorized_by}\nTimestamp: ${timestamp}`
  );
  sendSlack(env, ctx, '#sales-alerts-high-value',
    `*PROJECT SENTINEL — GO LIVE*\nInvestor escalation pipeline (WF-3) is now active.\nAll $5M+ leads will trigger automatic escalation.`
  );

  writeAudit(env, ctx, {
    route: '/v1/sentinel/go-live',
    action: 'step_10_activated',
    authorized_by: SENTINEL_CONFIG.authorized_by,
    blockers_verified: blockerResults.length,
  });

  return jsonResponse({
    activated: true,
    campaign: SENTINEL_CONFIG.campaign,
    authorized_by: SENTINEL_CONFIG.authorized_by,
    blockers_verified: blockerResults.length,
    modules_activated: [
      'Atlas Outbound Sequence (6-touch, 14-day)',
      'Zapier WF-1 New Lead Nurture',
      'Zapier WF-3 Investor Escalation',
    ],
    calling_hours: CALLING_HOURS,
    segments: PROSPECT_SEGMENTS.map(s => s.name),
    timestamp,
  });
}
