/**
 * Slack Service — Enterprise Slack Integration for Coastal Key
 *
 * Provides Bot API messaging, intelligent channel routing, rich Block Kit
 * formatting, interactive message handling, and delivery tracking.
 *
 * Supports both webhook (legacy) and Bot Token API (preferred) modes.
 * Falls back gracefully: Bot Token → Webhook → silent skip.
 *
 * Slack Apps:
 *   Coastal Key      (A0APSJ44NV6) — Primary bot: commands, notifications, interactivity
 *   CK Gateway       (A0APKPRBW3U) — API gateway alerts, webhook relay
 *   Coastal Key Content (A0ANS0760LB) — Content distribution & scheduling
 */

// ── Slack App Registry ──────────────────────────────────────────────────────────

export const SLACK_APPS = {
  COASTAL_KEY: {
    id: 'A0APSJ44NV6',
    name: 'Coastal Key',
    purpose: 'Primary bot — slash commands, notifications, interactive workflows',
    status: 'production',
  },
  CK_GATEWAY: {
    id: 'A0APKPRBW3U',
    name: 'CK Gateway',
    purpose: 'API gateway alerts, system health, webhook relay',
    status: 'production',
  },
  COASTAL_KEY_CONTENT: {
    id: 'A0ANS0760LB',
    name: 'Coastal Key Content',
    purpose: 'Content distribution, social scheduling, campaign alerts',
    status: 'production',
  },
};

// ── Channel Architecture ────────────────────────────────────────────────────────

export const CHANNELS = {
  // ── Revenue & Sales ──
  SALES_ALERTS: {
    id: '#sales-alerts',
    purpose: 'New leads, conversions, battle plan completions',
    division: 'SEN',
    priority: 'high',
  },
  INVESTOR_ESCALATIONS: {
    id: '#investor-escalations',
    purpose: 'High-value investor lead escalations, WF-3 triggers',
    division: 'SEN',
    priority: 'critical',
  },
  PIPELINE_UPDATES: {
    id: '#pipeline-updates',
    purpose: 'Pipeline stage changes, deal progression, revenue forecasts',
    division: 'SEN',
    priority: 'medium',
  },

  // ── Operations ──
  OPS_ALERTS: {
    id: '#ops-alerts',
    purpose: 'Maintenance tickets, inspection reminders, guest issues',
    division: 'OPS',
    priority: 'high',
  },
  PROPERTY_OPS: {
    id: '#property-ops',
    purpose: 'Turnover schedules, cleaning coordination, vendor dispatch',
    division: 'OPS',
    priority: 'medium',
  },

  // ── Technology ──
  TECH_ALERTS: {
    id: '#tech-alerts',
    purpose: 'System health, API errors, deployment status, uptime alerts',
    division: 'TEC',
    priority: 'critical',
  },
  DEPLOY_LOG: {
    id: '#deploy-log',
    purpose: 'CI/CD pipeline runs, deployment confirmations, rollbacks',
    division: 'TEC',
    priority: 'medium',
  },

  // ── Intelligence ──
  INTEL_BRIEFS: {
    id: '#intel-briefs',
    purpose: 'Market intelligence, competitor alerts, data anomalies',
    division: 'INT',
    priority: 'medium',
  },
  SECURITY_ALERTS: {
    id: '#security-alerts',
    purpose: 'Auth failures, rate limit breaches, threat detection',
    division: 'INT',
    priority: 'critical',
  },

  // ── Marketing ──
  MARKETING_OPS: {
    id: '#marketing-ops',
    purpose: 'Campaign launches, content approvals, social scheduling',
    division: 'MKT',
    priority: 'medium',
  },

  // ── Finance ──
  FINANCE_ALERTS: {
    id: '#finance-alerts',
    purpose: 'Revenue milestones, invoice alerts, budget thresholds',
    division: 'FIN',
    priority: 'high',
  },

  // ── Executive ──
  EXEC_BRIEFING: {
    id: '#exec-briefing',
    purpose: 'Daily summaries, KPI dashboards, strategic alerts',
    division: 'EXC',
    priority: 'high',
  },

  // ── General ──
  GENERAL: {
    id: '#general',
    purpose: 'System-wide announcements and status updates',
    division: null,
    priority: 'low',
  },
};

// ── Priority → Channel Routing Map ──────────────────────────────────────────────

const EVENT_ROUTING = {
  // Lead lifecycle
  'lead.created':           CHANNELS.SALES_ALERTS.id,
  'lead.qualified':         CHANNELS.SALES_ALERTS.id,
  'lead.converted':         CHANNELS.SALES_ALERTS.id,
  'lead.investor_flagged':  CHANNELS.INVESTOR_ESCALATIONS.id,
  'lead.nurture_enrolled':  CHANNELS.PIPELINE_UPDATES.id,

  // Workflows
  'workflow.scaa1':         CHANNELS.SALES_ALERTS.id,
  'workflow.wf3':           CHANNELS.INVESTOR_ESCALATIONS.id,
  'workflow.wf4':           CHANNELS.PIPELINE_UPDATES.id,

  // Call events
  'call.completed':         CHANNELS.SALES_ALERTS.id,
  'call.failed':            CHANNELS.OPS_ALERTS.id,

  // Operations
  'maintenance.created':    CHANNELS.OPS_ALERTS.id,
  'maintenance.urgent':     CHANNELS.OPS_ALERTS.id,
  'inspection.due':         CHANNELS.PROPERTY_OPS.id,
  'turnover.scheduled':     CHANNELS.PROPERTY_OPS.id,
  'guest.issue':            CHANNELS.OPS_ALERTS.id,

  // Technology
  'system.health':          CHANNELS.TECH_ALERTS.id,
  'system.error':           CHANNELS.TECH_ALERTS.id,
  'deploy.success':         CHANNELS.DEPLOY_LOG.id,
  'deploy.failure':         CHANNELS.TECH_ALERTS.id,
  'api.rate_limit':         CHANNELS.SECURITY_ALERTS.id,
  'api.auth_failure':       CHANNELS.SECURITY_ALERTS.id,

  // Intelligence
  'intel.scan_complete':    CHANNELS.INTEL_BRIEFS.id,
  'intel.anomaly':          CHANNELS.INTEL_BRIEFS.id,
  'intel.threat':           CHANNELS.SECURITY_ALERTS.id,

  // Marketing
  'campaign.launched':      CHANNELS.MARKETING_OPS.id,
  'content.published':      CHANNELS.MARKETING_OPS.id,

  // Finance
  'revenue.milestone':      CHANNELS.FINANCE_ALERTS.id,
  'invoice.overdue':        CHANNELS.FINANCE_ALERTS.id,

  // Executive
  'exec.daily_brief':       CHANNELS.EXEC_BRIEFING.id,
  'exec.kpi_alert':         CHANNELS.EXEC_BRIEFING.id,
};

// ── Core Messaging ──────────────────────────────────────────────────────────────

/**
 * Send a message via Slack Bot Token API with fallback to webhook.
 * @param {object} env - Worker env bindings
 * @param {object} ctx - Worker context (for waitUntil)
 * @param {object} options
 * @param {string} options.channel - Channel name or ID
 * @param {string} [options.text] - Fallback text
 * @param {Array} [options.blocks] - Block Kit blocks
 * @param {string} [options.event] - Event type for auto-routing
 * @param {string} [options.thread_ts] - Thread timestamp for replies
 * @returns {Promise<object|null>} - Slack API response or null
 */
export async function sendMessage(env, ctx, options) {
  const { text, blocks, event, thread_ts } = options;
  let channel = options.channel;

  // Auto-route by event type if no channel specified
  if (!channel && event && EVENT_ROUTING[event]) {
    channel = EVENT_ROUTING[event];
  }

  if (!channel) {
    channel = CHANNELS.GENERAL.id;
  }

  // Prefer Bot Token API → fall back to webhook
  if (env.SLACK_BOT_TOKEN) {
    return sendViaBotApi(env, { channel, text, blocks, thread_ts });
  }

  if (env.SLACK_WEBHOOK_URL) {
    return sendViaWebhook(env, { channel, text, blocks });
  }

  console.warn('No Slack credentials configured — message skipped.');
  return null;
}

/**
 * Non-blocking message send using ctx.waitUntil.
 */
export function sendMessageAsync(env, ctx, options) {
  ctx.waitUntil(
    sendMessage(env, ctx, options).catch(err =>
      console.error('Slack async message failed:', err)
    )
  );
}

/**
 * Send via Slack Bot Token API (chat.postMessage).
 */
async function sendViaBotApi(env, payload) {
  const body = {
    channel: payload.channel,
    text: payload.text || '',
    ...(payload.blocks && { blocks: payload.blocks }),
    ...(payload.thread_ts && { thread_ts: payload.thread_ts }),
    unfurl_links: false,
  };

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  if (!result.ok) {
    console.error(`Slack Bot API error: ${result.error}`, { channel: payload.channel });
  }
  return result;
}

/**
 * Send via incoming webhook (legacy fallback).
 */
async function sendViaWebhook(env, payload) {
  const body = {
    ...(payload.channel && { channel: payload.channel }),
    text: payload.text || '',
    ...(payload.blocks && { blocks: payload.blocks }),
  };

  const response = await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`Slack webhook error (${response.status}): ${await response.text()}`);
  }
  return { ok: response.ok };
}

// ── Rich Block Kit Builders ─────────────────────────────────────────────────────

/**
 * Build a rich lead notification message.
 */
export function buildLeadNotification(fields, record, env) {
  const meta = fields._meta || {};
  const leadName = fields['Lead Name'] || 'Unknown';
  const disposition = typeof fields['Call Disposition'] === 'object'
    ? fields['Call Disposition']?.name : fields['Call Disposition'] || 'Unknown';
  const segment = typeof fields['Sentinel Segment'] === 'object'
    ? fields['Sentinel Segment']?.name : fields['Sentinel Segment'] || 'Not classified';
  const serviceZone = typeof fields['Service Zone'] === 'object'
    ? fields['Service Zone']?.name : fields['Service Zone'] || 'N/A';
  const phone = fields['Phone Number'] || 'N/A';
  const duration = meta.durationSec || 0;
  const transcript = meta.transcript
    ? meta.transcript.slice(0, 400) + (meta.transcript.length > 400 ? '...' : '')
    : 'No transcript available';

  const airtableLink = `https://airtable.com/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID || 'tblpNasm0AxreRqLW'}/${record.id}`;

  const urgencyEmoji = segment.includes('Investor') ? ':rotating_light:' :
    disposition === 'Interested' ? ':fire:' : ':incoming_envelope:';

  return {
    text: `${urgencyEmoji} New Sentinel Lead: ${leadName} — ${disposition}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${urgencyEmoji} New Sentinel Lead: ${leadName}` },
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Disposition:*\n\`${disposition}\`` },
          { type: 'mrkdwn', text: `*Segment:*\n\`${segment}\`` },
          { type: 'mrkdwn', text: `*Phone:*\n${phone}` },
          { type: 'mrkdwn', text: `*Service Zone:*\n${serviceZone}` },
          { type: 'mrkdwn', text: `*Duration:*\n${duration}s` },
          { type: 'mrkdwn', text: `*Call ID:*\n\`${meta.callId || 'N/A'}\`` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Transcript Excerpt:*\n>>>${transcript}` },
      },
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View in Airtable' },
            url: airtableLink,
            style: 'primary',
            action_id: 'view_lead_airtable',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Trigger Battle Plan' },
            action_id: 'trigger_battle_plan',
            value: record.id,
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Assign Agent' },
            action_id: 'assign_agent',
            value: record.id,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `*Coastal Key Sentinel* | ${new Date().toISOString().split('T')[0]} | Powered by CK AI Fleet` },
        ],
      },
    ],
  };
}

/**
 * Build a failed call notification message.
 */
export function buildFailedCallNotification(call, failedRecord, env) {
  const transcript = call.transcript
    ? (typeof call.transcript === 'string' ? call.transcript : JSON.stringify(call.transcript))
    : '';
  const excerpt = transcript.slice(0, 400) + (transcript.length > 400 ? '...' : '') || 'No transcript';
  const phone = call.direction === 'inbound' ? (call.from_number || '') : (call.to_number || '');
  const duration = call.duration_ms ? Math.round(call.duration_ms / 1000) : 0;

  const reasonMap = {
    inactivity_timeout: 'Inactivity Timeout',
    machine_hangup: 'Machine Hangup',
    error: 'System Error',
    agent_hangup: 'Agent Hangup',
    dial_busy: 'Line Busy',
    dial_no_answer: 'No Answer',
  };
  const reason = reasonMap[call.disconnection_reason] || call.disconnection_reason || 'Unknown';
  const tableId = 'tblWW25r6GmsQe3mQ';
  const airtableLink = `https://airtable.com/${env.AIRTABLE_BASE_ID}/${tableId}/${failedRecord.id}`;

  return {
    text: `:warning: Failed Sentinel Call — ${reason} — ${phone || 'Unknown'}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':warning: Failed Sentinel Call — QA Review Required' },
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Call ID:*\n\`${call.call_id || 'N/A'}\`` },
          { type: 'mrkdwn', text: `*Phone:*\n${phone || 'N/A'}` },
          { type: 'mrkdwn', text: `*Failure Reason:*\n:red_circle: ${reason}` },
          { type: 'mrkdwn', text: `*Duration:*\n${duration}s` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Transcript:*\n>>>${excerpt}` },
      },
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Review in Airtable' },
            url: airtableLink,
            style: 'danger',
            action_id: 'review_failed_call',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Flag for Prompt Tuning' },
            action_id: 'flag_prompt_tuning',
            value: call.call_id || '',
          },
        ],
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Routed to *Missed/Failed Calls* QA dashboard | *Prompt tuning review* queued` },
        ],
      },
    ],
  };
}

/**
 * Build a workflow completion notification.
 */
export function buildWorkflowNotification(workflowId, data) {
  const configs = {
    scaa1: {
      title: ':dart: SCAA-1 Battle Plan Generated',
      color: '#22c55e',
      channel: CHANNELS.SALES_ALERTS.id,
    },
    wf3: {
      title: ':rotating_light: Investor Escalation — WF-3',
      color: '#ef4444',
      channel: CHANNELS.INVESTOR_ESCALATIONS.id,
    },
    wf4: {
      title: ':seedling: Long-Tail Nurture Enrollment — WF-4',
      color: '#eab308',
      channel: CHANNELS.PIPELINE_UPDATES.id,
    },
  };

  const config = configs[workflowId] || {
    title: `Workflow ${workflowId} Complete`,
    color: '#4f8fff',
    channel: CHANNELS.GENERAL.id,
  };

  const fields = [];
  if (data.leadName) fields.push({ type: 'mrkdwn', text: `*Lead:*\n${data.leadName}` });
  if (data.segment) fields.push({ type: 'mrkdwn', text: `*Segment:*\n${data.segment}` });
  if (data.propertyValue) fields.push({ type: 'mrkdwn', text: `*Property Value:*\n${data.propertyValue}` });
  if (data.taskId) fields.push({ type: 'mrkdwn', text: `*Task:*\n\`${data.taskId}\`` });
  if (data.reEngagementDate) fields.push({ type: 'mrkdwn', text: `*Re-engage:*\n${data.reEngagementDate}` });

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: config.title } },
    { type: 'divider' },
  ];

  if (fields.length > 0) {
    blocks.push({ type: 'section', fields });
  }

  if (data.summary) {
    const summaryText = data.summary.length > 800
      ? data.summary.slice(0, 800) + '...'
      : data.summary;
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Summary:*\n>>>${summaryText}` },
    });
  }

  if (data.airtableLink) {
    blocks.push({
      type: 'actions',
      elements: [{
        type: 'button',
        text: { type: 'plain_text', text: 'View in Airtable' },
        url: data.airtableLink,
        style: 'primary',
        action_id: `view_${workflowId}_airtable`,
      }],
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `*${config.title}* | ${new Date().toISOString().split('T')[0]} | CK AI Fleet` },
    ],
  });

  return { text: config.title, blocks, channel: config.channel };
}

/**
 * Build a system health alert.
 */
export function buildSystemAlert(severity, title, details) {
  const severityConfig = {
    critical: { emoji: ':red_circle:', channel: CHANNELS.TECH_ALERTS.id },
    high: { emoji: ':large_orange_circle:', channel: CHANNELS.TECH_ALERTS.id },
    medium: { emoji: ':large_yellow_circle:', channel: CHANNELS.TECH_ALERTS.id },
    low: { emoji: ':white_circle:', channel: CHANNELS.DEPLOY_LOG.id },
    info: { emoji: ':large_blue_circle:', channel: CHANNELS.DEPLOY_LOG.id },
  };

  const config = severityConfig[severity] || severityConfig.medium;

  return {
    text: `${config.emoji} [${severity.toUpperCase()}] ${title}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${config.emoji} ${title}` },
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Severity:*\n${config.emoji} ${severity.toUpperCase()}` },
          { type: 'mrkdwn', text: `*Time:*\n${new Date().toISOString()}` },
          ...(details.service ? [{ type: 'mrkdwn', text: `*Service:*\n${details.service}` }] : []),
          ...(details.endpoint ? [{ type: 'mrkdwn', text: `*Endpoint:*\n\`${details.endpoint}\`` }] : []),
        ],
      },
      ...(details.message ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Details:*\n\`\`\`${details.message}\`\`\`` },
      }] : []),
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `CK Platform Monitor | Squad ALPHA | IO Fleet` },
        ],
      },
    ],
    channel: config.channel,
  };
}

/**
 * Build an executive daily brief message.
 */
export function buildExecBrief(metrics) {
  return {
    text: ':bar_chart: Coastal Key — Daily Executive Brief',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':bar_chart: Daily Executive Brief' },
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*New Leads:*\n${metrics.newLeads || 0}` },
          { type: 'mrkdwn', text: `*Conversions:*\n${metrics.conversions || 0}` },
          { type: 'mrkdwn', text: `*Active Agents:*\n${metrics.activeAgents || 0}/${metrics.totalAgents || 360}` },
          { type: 'mrkdwn', text: `*API Calls:*\n${metrics.apiCalls || 0}` },
          { type: 'mrkdwn', text: `*Uptime:*\n${metrics.uptime || '99.9%'}` },
          { type: 'mrkdwn', text: `*Open Tasks:*\n${metrics.openTasks || 0}` },
        ],
      },
      ...(metrics.highlights ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Highlights:*\n${metrics.highlights}` },
      }] : []),
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `*Coastal Key AI Fleet* | ${new Date().toISOString().split('T')[0]} | 360 Units Operational` },
        ],
      },
    ],
    channel: CHANNELS.EXEC_BRIEFING.id,
  };
}

// ── Slash Command Response Builders ─────────────────────────────────────────────

/**
 * Build a slash command response (ephemeral by default).
 */
export function slashResponse(text, blocks, responseType = 'ephemeral') {
  return {
    response_type: responseType,
    text,
    ...(blocks && { blocks }),
  };
}

// ── Signature Verification ──────────────────────────────────────────────────────

/**
 * Verify Slack request signature (HMAC-SHA256).
 * @param {Request} request
 * @param {string} signingSecret
 * @returns {Promise<boolean>}
 */
export async function verifySlackSignature(request, signingSecret) {
  const timestamp = request.headers.get('x-slack-request-timestamp');
  const signature = request.headers.get('x-slack-signature');

  if (!timestamp || !signature) return false;

  // Reject requests older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const body = await request.clone().text();
  const baseString = `v0:${timestamp}:${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(baseString)
  );

  const computed = 'v0=' + Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === signature;
}

// ── Channel Utilities ───────────────────────────────────────────────────────────

/**
 * Get the appropriate channel for an event type.
 */
export function getChannelForEvent(eventType) {
  return EVENT_ROUTING[eventType] || CHANNELS.GENERAL.id;
}

/**
 * List all channels for a given division.
 */
export function getChannelsForDivision(division) {
  return Object.values(CHANNELS).filter(ch => ch.division === division);
}

/**
 * Get full channel architecture summary.
 */
export function getChannelArchitecture() {
  const summary = {};
  for (const [key, ch] of Object.entries(CHANNELS)) {
    const div = ch.division || 'GLOBAL';
    if (!summary[div]) summary[div] = [];
    summary[div].push({ key, ...ch });
  }
  return summary;
}
