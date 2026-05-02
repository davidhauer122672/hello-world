/**
 * Slack App Manifests — Production-ready configurations for all 3 Coastal Key apps.
 *
 * These manifests define the complete Slack app configuration including:
 * - OAuth scopes and permissions
 * - Slash commands
 * - Event subscriptions
 * - Interactivity endpoints
 * - Bot user configuration
 *
 * To deploy: Slack API → Your Apps → App Manifest → paste YAML/JSON.
 * All 3 apps target the "Coastal Key Treasure Coast Asset Management" workspace.
 */

// ── App 1: Coastal Key (A0APSJ44NV6) ───────────────────────────────────────────
// Primary bot — slash commands, notifications, interactive workflows

export const COASTAL_KEY_MANIFEST = {
  _metadata: { major_version: 1, minor_version: 1 },
  display_information: {
    name: 'Coastal Key',
    description: 'Coastal Key Property Management AI Operations Hub — 360-unit autonomous fleet command center.',
    background_color: '#1a5276',
    long_description: 'Coastal Key is the primary AI operations interface for Coastal Key Property Management. It provides real-time lead notifications, workflow automation, agent fleet management, and executive intelligence briefings powered by a 360-unit autonomous AI fleet across 9 divisions.',
  },
  features: {
    app_home: {
      home_tab_enabled: true,
      messages_tab_enabled: true,
      messages_tab_read_only_enabled: false,
    },
    bot_user: {
      display_name: 'Coastal Key AI',
      always_online: true,
    },
    slash_commands: [
      {
        command: '/ck-status',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'Fleet status dashboard — view agent fleet health and system metrics',
        usage_hint: '[division] [--detailed]',
        should_escape: false,
      },
      {
        command: '/ck-lead',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'Look up a lead by name, phone, or record ID',
        usage_hint: '<name|phone|recXXX>',
        should_escape: false,
      },
      {
        command: '/ck-agent',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'View agent details or trigger an action',
        usage_hint: '<agent-id> [activate|pause|restart]',
        should_escape: false,
      },
      {
        command: '/ck-intel',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'Intelligence brief — market data, competitor alerts, anomalies',
        usage_hint: '[squad] [--scan]',
        should_escape: false,
      },
      {
        command: '/ck-workflow',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'Trigger or check status of a workflow pipeline',
        usage_hint: '<scaa1|wf3|wf4> <recordId>',
        should_escape: false,
      },
      {
        command: '/ck-brief',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'Generate executive daily brief with KPI dashboard',
        usage_hint: '[--full]',
        should_escape: false,
      },
    ],
  },
  oauth_config: {
    scopes: {
      bot: [
        'chat:write',
        'chat:write.public',
        'commands',
        'incoming-webhook',
        'channels:read',
        'channels:history',
        'groups:read',
        'im:write',
        'users:read',
        'files:write',
        'reactions:write',
        'app_mentions:read',
      ],
    },
  },
  settings: {
    event_subscriptions: {
      request_url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/events',
      bot_events: [
        'app_mention',
        'app_home_opened',
        'message.channels',
      ],
    },
    interactivity: {
      is_enabled: true,
      request_url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/interactions',
    },
    org_deploy_enabled: false,
    socket_mode_enabled: false,
    token_rotation_enabled: true,
  },
};

// ── App 2: CK Gateway (A0APKPRBW3U) ────────────────────────────────────────────
// API gateway alerts, system health, webhook relay

export const CK_GATEWAY_MANIFEST = {
  _metadata: { major_version: 1, minor_version: 1 },
  display_information: {
    name: 'CK Gateway',
    description: 'Coastal Key API Gateway — system health monitoring, deployment alerts, and error tracking.',
    background_color: '#e74c3c',
    long_description: 'CK Gateway is the system health and operations monitoring bot for the Coastal Key API Gateway. It provides real-time alerts for API errors, deployment status, rate limit breaches, and infrastructure health across all Cloudflare Workers and KV stores.',
  },
  features: {
    bot_user: {
      display_name: 'CK Gateway',
      always_online: true,
    },
    slash_commands: [
      {
        command: '/ck-health',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'Deep health check of all API gateway services and dependencies',
        usage_hint: '[--deep]',
        should_escape: false,
      },
      {
        command: '/ck-deploy',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'View recent deployments and CI/CD pipeline status',
        usage_hint: '[--last <n>]',
        should_escape: false,
      },
    ],
  },
  oauth_config: {
    scopes: {
      bot: [
        'chat:write',
        'chat:write.public',
        'commands',
        'incoming-webhook',
      ],
    },
  },
  settings: {
    interactivity: {
      is_enabled: true,
      request_url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/interactions',
    },
    org_deploy_enabled: false,
    socket_mode_enabled: false,
    token_rotation_enabled: true,
  },
};

// ── App 3: Coastal Key Content (A0ANS0760LB) ────────────────────────────────────
// Content distribution & scheduling (NOTE: Fix typo "Coasta" → "Coastal" in Slack dashboard)

export const COASTAL_KEY_CONTENT_MANIFEST = {
  _metadata: { major_version: 1, minor_version: 1 },
  display_information: {
    name: 'Coastal Key Content',
    description: 'Coastal Key Content Engine — social media scheduling, campaign alerts, and content distribution.',
    background_color: '#27ae60',
    long_description: 'Coastal Key Content manages the content pipeline for Coastal Key Property Management. It handles social media post scheduling, campaign launch notifications, content approval workflows, and marketing analytics distribution across all channels.',
  },
  features: {
    bot_user: {
      display_name: 'CK Content',
      always_online: true,
    },
    slash_commands: [
      {
        command: '/ck-content',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'Generate content via AI — social posts, emails, scripts, listings',
        usage_hint: '<type> <topic>',
        should_escape: false,
      },
      {
        command: '/ck-campaign',
        url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/commands',
        description: 'View campaign analytics and Sentinel call performance',
        usage_hint: '[--dashboard]',
        should_escape: false,
      },
    ],
  },
  oauth_config: {
    scopes: {
      bot: [
        'chat:write',
        'chat:write.public',
        'commands',
        'incoming-webhook',
        'files:write',
      ],
    },
  },
  settings: {
    interactivity: {
      is_enabled: true,
      request_url: 'https://ck-api-gateway.david-e59.workers.dev/v1/slack/interactions',
    },
    org_deploy_enabled: false,
    socket_mode_enabled: false,
    token_rotation_enabled: true,
  },
};

// ── Required Slack Channels ─────────────────────────────────────────────────────

export const REQUIRED_CHANNELS = [
  { name: 'sales-alerts', topic: 'New leads, conversions, battle plan completions', purpose: 'SEN Division — Real-time sales pipeline notifications', isPrivate: false },
  { name: 'investor-escalations', topic: 'High-value investor leads, WF-3 triggers', purpose: 'SEN Division — Urgent investor lead escalations', isPrivate: true },
  { name: 'pipeline-updates', topic: 'Pipeline changes, deal progression, nurture enrollment', purpose: 'SEN Division — Deal pipeline stage tracking', isPrivate: false },
  { name: 'ops-alerts', topic: 'Maintenance, inspections, guest issues', purpose: 'OPS Division — Property operations alerts', isPrivate: false },
  { name: 'property-ops', topic: 'Turnovers, cleaning, vendor dispatch', purpose: 'OPS Division — Day-to-day property coordination', isPrivate: false },
  { name: 'tech-alerts', topic: 'System health, API errors, deployments', purpose: 'TEC Division — Infrastructure and platform alerts', isPrivate: false },
  { name: 'deploy-log', topic: 'CI/CD runs, version deployments, rollbacks', purpose: 'TEC Division — Deployment tracking', isPrivate: false },
  { name: 'intel-briefs', topic: 'Market data, competitor alerts, data anomalies', purpose: 'INT Division — Intelligence officer reports', isPrivate: true },
  { name: 'security-alerts', topic: 'Auth failures, rate limits, threats', purpose: 'INT Division — Security monitoring', isPrivate: true },
  { name: 'marketing-ops', topic: 'Campaigns, content approvals, social scheduling', purpose: 'MKT Division — Marketing operations', isPrivate: false },
  { name: 'finance-alerts', topic: 'Revenue, invoices, budget thresholds', purpose: 'FIN Division — Financial notifications', isPrivate: true },
  { name: 'exec-briefing', topic: 'Daily summaries, KPI dashboards, strategic alerts', purpose: 'EXC Division — Executive intelligence', isPrivate: true },
];

// ── Required Secrets ────────────────────────────────────────────────────────────

export const REQUIRED_SECRETS = [
  { name: 'SLACK_BOT_TOKEN', description: 'Coastal Key bot OAuth token (xoxb-...)', app: 'Coastal Key' },
  { name: 'SLACK_SIGNING_SECRET', description: 'Slack app signing secret for request verification', app: 'Coastal Key' },
  { name: 'SLACK_WEBHOOK_URL', description: 'Incoming webhook URL (legacy fallback)', app: 'CK Gateway' },
];
