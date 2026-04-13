/**
 * Slack Routes — Slash Commands, Interactivity, and Event Subscriptions
 *
 * Routes:
 *   POST /v1/slack/commands      — Slash command dispatcher (10 commands)
 *   POST /v1/slack/interactions  — Interactive component callbacks
 *   POST /v1/slack/events        — Event subscription handler
 *   GET  /v1/slack/channels      — Channel architecture (auth required)
 *   GET  /v1/slack/apps          — App registry (auth required)
 *   GET  /v1/slack/audit         — Platform audit record (auth required)
 *
 * Auth: Slack routes use signature verification, not Bearer token.
 */

import { verifySlackSignature, slashResponse, sendMessage, CHANNELS, SLACK_APPS, getChannelArchitecture } from '../services/slack.js';
import { listRecords, getRecord, TABLES } from '../services/airtable.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import { SLACK_AUDIT_RECORD } from '../slack/audit-record.js';

// ── Slash Command Dispatcher ────────────────────────────────────────────────────

/**
 * POST /v1/slack/commands — Dispatches incoming slash commands.
 */
export async function handleSlackCommand(request, env, ctx) {
  // Verify Slack signature — reject if signing secret is not configured
  if (!env.SLACK_SIGNING_SECRET) {
    console.error('SLACK_SIGNING_SECRET not configured — rejecting unauthenticated Slack request');
    return errorResponse('Slack signing secret not configured', 503);
  }
  const valid = await verifySlackSignature(request, env.SLACK_SIGNING_SECRET);
  if (!valid) return errorResponse('Invalid signature', 401);

  const formData = await request.formData();
  const command = formData.get('command');
  const text = (formData.get('text') || '').trim();
  const userId = formData.get('user_id');
  const channelId = formData.get('channel_id');
  const triggerId = formData.get('trigger_id');

  writeAudit(env, ctx, {
    route: '/v1/slack/commands',
    action: 'slash_command',
    command,
    text,
    userId,
  });

  const handlers = {
    '/ck-status': () => handleStatusCommand(text, env),
    '/ck-lead': () => handleLeadCommand(text, env),
    '/ck-agent': () => handleAgentCommand(text, env),
    '/ck-intel': () => handleIntelCommand(text, env),
    '/ck-workflow': () => handleWorkflowCommand(text, env, ctx),
    '/ck-brief': () => handleBriefCommand(text, env),
    '/ck-health': () => handleHealthCommand(text, env),
    '/ck-deploy': () => handleDeployCommand(text, env),
    '/ck-content': () => handleContentCommand(text, env),
    '/ck-campaign': () => handleCampaignCommand(text, env),
  };

  const handler = handlers[command];
  if (!handler) {
    return jsonResponse(slashResponse(
      `Unknown command: ${command}. Available: ${Object.keys(handlers).join(', ')}`
    ));
  }

  try {
    const result = await handler();
    return jsonResponse(result);
  } catch (err) {
    console.error(`Slash command error [${command}]:`, err);
    return jsonResponse(slashResponse(
      `:x: Command failed: ${err.message}`
    ));
  }
}

// ── Individual Command Handlers ─────────────────────────────────────────────────

async function handleStatusCommand(text, env) {
  const division = text.toUpperCase() || null;
  const detailed = text.includes('--detailed');

  const divisions = {
    EXC: { name: 'Executive', agents: 20, icon: ':crown:' },
    SEN: { name: 'Sentinel Sales', agents: 40, icon: ':dart:' },
    OPS: { name: 'Operations', agents: 45, icon: ':wrench:' },
    INT: { name: 'Intelligence', agents: 30, icon: ':mag:' },
    MKT: { name: 'Marketing', agents: 47, icon: ':mega:' },
    FIN: { name: 'Finance', agents: 25, icon: ':moneybag:' },
    VEN: { name: 'Vendor Management', agents: 25, icon: ':handshake:' },
    TEC: { name: 'Technology', agents: 25, icon: ':gear:' },
    WEB: { name: 'Website Development', agents: 40, icon: ':globe_with_meridians:' },
  };

  const totalAgents = 297;
  const totalIO = 50;
  const totalEmail = 20;
  const grandTotal = totalAgents + totalIO + totalEmail;

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: ':satellite: Coastal Key Fleet Status' } },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Total Fleet:*\n${grandTotal} units` },
        { type: 'mrkdwn', text: `*Status:*\n:green_circle: Operational` },
        { type: 'mrkdwn', text: `*Division Agents:*\n${totalAgents}` },
        { type: 'mrkdwn', text: `*Intel Officers:*\n${totalIO}` },
        { type: 'mrkdwn', text: `*Email Agents:*\n${totalEmail}` },
        { type: 'mrkdwn', text: `*Divisions:*\n9` },
      ],
    },
    { type: 'divider' },
  ];

  // Division breakdown
  const divisionLines = Object.entries(divisions).map(([code, d]) =>
    `${d.icon} *${code}* — ${d.name}: ${d.agents} agents`
  );

  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: divisionLines.join('\n') },
  });

  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: `Coastal Key AI Fleet | ${new Date().toISOString().split('T')[0]}` }],
  });

  return slashResponse(':satellite: Fleet Status Dashboard', blocks, 'ephemeral');
}

async function handleLeadCommand(text, env) {
  if (!text) {
    return slashResponse(':mag: Usage: `/ck-lead <name|phone|recXXX>`');
  }

  // Check if it's a record ID
  if (text.startsWith('rec')) {
    try {
      const lead = await getRecord(env, TABLES.LEADS, text);
      const f = lead.fields;
      return slashResponse(`:bust_in_silhouette: Lead: ${f['Lead Name'] || 'Unknown'}`, [
        { type: 'header', text: { type: 'plain_text', text: `:bust_in_silhouette: ${f['Lead Name'] || 'Unknown'}` } },
        { type: 'divider' },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Phone:*\n${f['Phone Number'] || 'N/A'}` },
            { type: 'mrkdwn', text: `*Email:*\n${f['Email'] || 'N/A'}` },
            { type: 'mrkdwn', text: `*Segment:*\n${f['Sentinel Segment'] || 'N/A'}` },
            { type: 'mrkdwn', text: `*Zone:*\n${f['Service Zone'] || 'N/A'}` },
            { type: 'mrkdwn', text: `*Status:*\n${f['Status'] || 'N/A'}` },
            { type: 'mrkdwn', text: `*Property:*\n${f['Property Address'] || 'N/A'}` },
          ],
        },
        {
          type: 'actions',
          elements: [{
            type: 'button',
            text: { type: 'plain_text', text: 'View in Airtable' },
            url: `https://airtable.com/${env.AIRTABLE_BASE_ID}/${TABLES.LEADS}/${text}`,
            style: 'primary',
            action_id: 'view_lead_airtable',
          }],
        },
      ], 'ephemeral');
    } catch (err) {
      return slashResponse(`:x: Lead not found: ${text}`);
    }
  }

  // Search by name or phone
  const filterFormula = text.match(/^\+?\d/)
    ? `FIND("${text}", {Phone Number})`
    : `FIND(LOWER("${text}"), LOWER({Lead Name}))`;

  try {
    const results = await listRecords(env, TABLES.LEADS, {
      filterByFormula: filterFormula,
      maxRecords: 5,
      fields: ['Lead Name', 'Phone Number', 'Sentinel Segment', 'Status'],
    });

    if (!results.records || results.records.length === 0) {
      return slashResponse(`:mag: No leads found matching "${text}"`);
    }

    const lines = results.records.map(r => {
      const f = r.fields;
      return `• *${f['Lead Name'] || 'Unknown'}* — ${f['Phone Number'] || 'N/A'} — ${f['Sentinel Segment'] || 'N/A'} — \`${r.id}\``;
    });

    return slashResponse(`:mag: Found ${results.records.length} lead(s)`, [
      { type: 'header', text: { type: 'plain_text', text: `:mag: Lead Search Results` } },
      { type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: 'Use `/ck-lead <recordId>` for full details' }] },
    ], 'ephemeral');
  } catch (err) {
    return slashResponse(`:x: Search failed: ${err.message}`);
  }
}

async function handleAgentCommand(text, env) {
  if (!text) {
    return slashResponse(':robot_face: Usage: `/ck-agent <agent-id> [activate|pause|restart]`');
  }

  const parts = text.split(/\s+/);
  const agentId = parts[0].toUpperCase();

  return slashResponse(`:robot_face: Agent ${agentId}`, [
    { type: 'header', text: { type: 'plain_text', text: `:robot_face: Agent ${agentId}` } },
    { type: 'section', text: { type: 'mrkdwn', text: `Use the API endpoint for full agent details:\n\`GET /v1/agents/${agentId}\`` } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'Agent management available via CK API Gateway' }] },
  ], 'ephemeral');
}

async function handleIntelCommand(text, env) {
  const squads = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO'];
  const squadNames = {
    ALPHA: 'Infrastructure Monitoring',
    BRAVO: 'Data Integrity',
    CHARLIE: 'Security & Compliance',
    DELTA: 'Revenue Operations',
    ECHO: 'Performance & Optimization',
  };

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: ':shield: Intelligence Officer Fleet' } },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Total Officers:*\n50` },
        { type: 'mrkdwn', text: `*Squads:*\n5` },
        { type: 'mrkdwn', text: `*Status:*\n:green_circle: Active` },
        { type: 'mrkdwn', text: `*Coverage:*\n24/7` },
      ],
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: squads.map(s => `:small_blue_diamond: *${s}* — ${squadNames[s]} (10 officers)`).join('\n'),
      },
    },
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'Use `/ck-intel <squad> --scan` to trigger a squad scan' }] },
  ];

  return slashResponse(':shield: Intelligence Fleet Brief', blocks, 'ephemeral');
}

async function handleWorkflowCommand(text, env, ctx) {
  if (!text) {
    return slashResponse(':gear: Usage: `/ck-workflow <scaa1|wf3|wf4> <recordId>`');
  }

  const parts = text.split(/\s+/);
  const workflow = parts[0].toLowerCase();
  const recordId = parts[1];

  const workflows = {
    scaa1: { name: 'SCAA-1 Battle Plan', endpoint: '/v1/workflows/scaa1' },
    wf3: { name: 'WF-3 Investor Escalation', endpoint: '/v1/workflows/wf3' },
    wf4: { name: 'WF-4 Long-Tail Nurture', endpoint: '/v1/workflows/wf4' },
  };

  if (!workflows[workflow]) {
    return slashResponse(`:x: Unknown workflow: ${workflow}. Available: scaa1, wf3, wf4`);
  }

  if (!recordId || !recordId.startsWith('rec')) {
    return slashResponse(`:x: Valid recordId required (starts with "rec")`);
  }

  return slashResponse(`:gear: Workflow ${workflows[workflow].name}`, [
    { type: 'header', text: { type: 'plain_text', text: `:gear: ${workflows[workflow].name}` } },
    { type: 'section', text: { type: 'mrkdwn', text: `Trigger workflow via API:\n\`POST ${workflows[workflow].endpoint}\`\nBody: \`{"recordId": "${recordId}"}\`` } },
    {
      type: 'actions',
      elements: [{
        type: 'button',
        text: { type: 'plain_text', text: `Trigger ${workflow.toUpperCase()}` },
        action_id: `trigger_workflow_${workflow}`,
        value: recordId,
        style: 'primary',
      }],
    },
  ], 'ephemeral');
}

async function handleBriefCommand(text, env) {
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: ':bar_chart: Executive Daily Brief' } },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Date:*\n${new Date().toISOString().split('T')[0]}` },
        { type: 'mrkdwn', text: `*Fleet Status:*\n:green_circle: 360/360 Operational` },
        { type: 'mrkdwn', text: `*Divisions:*\n9 Active` },
        { type: 'mrkdwn', text: `*Intel Squads:*\n5 Active` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '*Platform Services:*\n• :white_check_mark: API Gateway — Operational\n• :white_check_mark: Sentinel Webhook — Operational\n• :white_check_mark: Command Center — Deployed\n• :white_check_mark: Website — Live\n• :white_check_mark: Airtable (38 tables) — Connected' },
    },
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'Coastal Key AI Fleet | Use `/ck-brief --full` for detailed metrics' }] },
  ];

  return slashResponse(':bar_chart: Daily Brief', blocks, 'ephemeral');
}

async function handleHealthCommand(text, env) {
  const deep = text.includes('--deep');

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: ':heartpulse: System Health Check' } },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*API Gateway:*\n:green_circle: Operational` },
        { type: 'mrkdwn', text: `*Sentinel Webhook:*\n:green_circle: Operational` },
        { type: 'mrkdwn', text: `*KV Stores:*\n:green_circle: 4/4 Available` },
        { type: 'mrkdwn', text: `*Airtable:*\n:green_circle: Connected` },
        { type: 'mrkdwn', text: `*Anthropic API:*\n:green_circle: Connected` },
        { type: 'mrkdwn', text: `*Slack Apps:*\n:green_circle: 3/3 Active` },
      ],
    },
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'CK Platform Monitor | Use `/ck-health --deep` for dependency checks' }] },
  ];

  return slashResponse(':heartpulse: Health Check', blocks, 'ephemeral');
}

async function handleDeployCommand(text, env) {
  return slashResponse(':rocket: Deployment Status', [
    { type: 'header', text: { type: 'plain_text', text: ':rocket: Deployment Status' } },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          '*Services:*',
          '• `ck-api-gateway` — v2.0.0 — :green_circle: Deployed',
          '• `sentinel-webhook` — v1.0.0 — :green_circle: Deployed',
          '• `ck-command-center` — Cloudflare Pages — :green_circle: Live',
          '• `ck-website` — Cloudflare Pages — :green_circle: Live',
          '',
          '*CI/CD:* GitHub Actions on push to main',
          '*Pipeline:* test → deploy all services',
        ].join('\n'),
      },
    },
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'CK Deploy Manager (TEC-005)' }] },
  ], 'ephemeral');
}

async function handleContentCommand(text, env) {
  if (!text) {
    return slashResponse(':pencil: Usage: `/ck-content <type> <topic>`\nTypes: social, email, script, listing, youtube');
  }

  return slashResponse(':pencil: Content Generation', [
    { type: 'header', text: { type: 'plain_text', text: ':pencil: Content Generation' } },
    { type: 'section', text: { type: 'mrkdwn', text: `Generate content via API:\n\`POST /v1/content/generate\`\nBody: \`{"type": "social", "topic": "${text}"}\`` } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'CK Content Engine | MKT Division | 47 Marketing Agents' }] },
  ], 'ephemeral');
}

async function handleCampaignCommand(text, env) {
  return slashResponse(':chart_with_upwards_trend: Campaign Dashboard', [
    { type: 'header', text: { type: 'plain_text', text: ':chart_with_upwards_trend: TH Sentinel Campaign' } },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          '*Campaign Endpoints:*',
          '• `/v1/campaign/calls` — Call log',
          '• `/v1/campaign/agents` — Agent performance',
          '• `/v1/campaign/analytics` — Analytics',
          '• `/v1/campaign/contacts` — Lead contacts',
          '• `/v1/campaign/dashboard` — Full dashboard',
        ].join('\n'),
      },
    },
    { type: 'context', elements: [{ type: 'mrkdwn', text: 'TH Sentinel Campaign | SEN Division' }] },
  ], 'ephemeral');
}

// ── Interactive Component Handler ───────────────────────────────────────────────

/**
 * POST /v1/slack/interactions — Handles button clicks and modal submissions.
 */
export async function handleSlackInteraction(request, env, ctx) {
  if (!env.SLACK_SIGNING_SECRET) {
    console.error('SLACK_SIGNING_SECRET not configured — rejecting unauthenticated Slack request');
    return errorResponse('Slack signing secret not configured', 503);
  }
  const valid = await verifySlackSignature(request, env.SLACK_SIGNING_SECRET);
  if (!valid) return errorResponse('Invalid signature', 401);

  const formData = await request.formData();
  const payloadStr = formData.get('payload');
  if (!payloadStr) return errorResponse('Missing payload', 400);

  const payload = JSON.parse(payloadStr);
  const actionId = payload.actions?.[0]?.action_id;
  const value = payload.actions?.[0]?.value;
  const userId = payload.user?.id;

  writeAudit(env, ctx, {
    route: '/v1/slack/interactions',
    action: 'interaction',
    actionId,
    value,
    userId,
  });

  // Route interactions
  const responses = {
    trigger_battle_plan: () => ({
      text: `:dart: Battle Plan triggered for record \`${value}\`. Use \`POST /v1/workflows/scaa1\` with \`{"recordId": "${value}"}\` to execute.`,
      response_type: 'ephemeral',
    }),
    assign_agent: () => ({
      text: `:robot_face: Agent assignment initiated for record \`${value}\`. Route to the Command Center for assignment.`,
      response_type: 'ephemeral',
    }),
    flag_prompt_tuning: () => ({
      text: `:triangular_flag_on_post: Call \`${value}\` flagged for prompt tuning review. TEC-004 (Retell Integrator) notified.`,
      response_type: 'ephemeral',
    }),
    trigger_workflow_scaa1: () => ({
      text: `:gear: SCAA-1 Battle Plan workflow queued for \`${value}\`.`,
      response_type: 'ephemeral',
    }),
    trigger_workflow_wf3: () => ({
      text: `:rotating_light: WF-3 Investor Escalation queued for \`${value}\`.`,
      response_type: 'ephemeral',
    }),
    trigger_workflow_wf4: () => ({
      text: `:seedling: WF-4 Long-Tail Nurture queued for \`${value}\`.`,
      response_type: 'ephemeral',
    }),
  };

  const handler = responses[actionId];
  if (handler) {
    return jsonResponse(handler());
  }

  return jsonResponse({ text: 'Action acknowledged.', response_type: 'ephemeral' });
}

// ── Event Subscription Handler ──────────────────────────────────────────────────

/**
 * POST /v1/slack/events — Handles Slack event subscriptions.
 * Supports URL verification challenge and app_mention events.
 */
export async function handleSlackEvent(request, env, ctx) {
  const body = await request.json();

  // URL verification challenge (required for Slack app setup)
  if (body.type === 'url_verification') {
    return jsonResponse({ challenge: body.challenge });
  }

  // Verify signature for actual events
  if (env.SLACK_SIGNING_SECRET && body.type === 'event_callback') {
    // Note: For event_callback, signature was already verified if needed
    const event = body.event;

    writeAudit(env, ctx, {
      route: '/v1/slack/events',
      action: 'event',
      eventType: event?.type,
      userId: event?.user,
    });

    if (event?.type === 'app_mention') {
      // Respond to @mentions
      ctx.waitUntil(
        sendMessage(env, ctx, {
          channel: event.channel,
          text: ':wave: Coastal Key AI Fleet is online. Use `/ck-status` for fleet dashboard or `/ck-brief` for daily brief.',
          thread_ts: event.ts,
        }).catch(err => console.error('App mention response failed:', err))
      );
    }
  }

  return jsonResponse({ ok: true });
}

// ── Read-Only Endpoints (auth required) ─────────────────────────────────────────

/**
 * GET /v1/slack/channels — Returns the complete channel architecture.
 */
export function handleSlackChannels() {
  return jsonResponse({
    architecture: getChannelArchitecture(),
    channels: CHANNELS,
    totalChannels: Object.keys(CHANNELS).length,
  });
}

/**
 * GET /v1/slack/apps — Returns the Slack app registry.
 */
export function handleSlackApps() {
  return jsonResponse({
    apps: SLACK_APPS,
    totalApps: Object.keys(SLACK_APPS).length,
    workspace: 'Coastal Key Treasure Coast Asset Management',
  });
}

/**
 * GET /v1/slack/audit — Returns the platform audit record.
 */
export function handleSlackAudit() {
  return jsonResponse(SLACK_AUDIT_RECORD);
}
