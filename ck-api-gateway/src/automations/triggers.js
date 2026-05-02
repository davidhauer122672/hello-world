/**
 * @file Airtable Automation Trigger Configurations
 * @description Maps Airtable field changes to Coastal Key API gateway workflow pipelines.
 * Each trigger config defines the conditions under which an Airtable automation
 * should fire and the corresponding API gateway endpoint to invoke.
 */

/**
 * @typedef {Object} TriggerConfig
 * @property {string} id - Unique workflow identifier
 * @property {string} description - Human-readable description of the trigger
 * @property {Object} trigger - Airtable trigger definition
 * @property {string} trigger.type - The type of Airtable trigger (e.g. "fieldChange", "recordCreated")
 * @property {string} trigger.table - The Airtable table to watch
 * @property {string} [trigger.field] - The specific field to watch for changes
 * @property {Object} conditions - Conditions that must be met for the trigger to fire
 * @property {Object} action - The API gateway action to execute
 * @property {string} action.method - HTTP method
 * @property {string} action.endpoint - API gateway endpoint path
 * @property {Object} action.payload - Request body template
 */

/**
 * WF2 - Content Calendar → Claude AI Publish
 *
 * Triggers when a Content Calendar record's "Status" field changes to "Approved".
 * Publishes the post via Claude AI through the /v1/content/publish endpoint for automated
 * multi-platform scheduling (Instagram, Facebook, LinkedIn, X, Alignable).
 *

/**
 * WF3 - Investor Escalation Workflow
 *
 * Triggers when a lead's "Sentinel Segment" field changes to "Investor" or
 * "High-Value Investor". Routes the lead to the investor escalation pipeline
 * with high urgency for expedited follow-up.
 *
 * @type {TriggerConfig}
 */
export const WF3_INVESTOR_ESCALATION = {
  id: 'wf3-investor-escalation',
  description: 'Escalate leads segmented as Investor or High-Value Investor',
  trigger: {
    type: 'fieldChange',
    table: 'Leads',
    field: 'Sentinel Segment',
  },
  conditions: {
    segment: {
      includes: 'Investor',
      matchValues: ['Investor', 'High-Value Investor'],
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/workflows/wf3',
    payload: {
      recordId: '{{record.id}}',
      segment: '{{record.Sentinel Segment}}',
      urgency: 'high',
    },
  },
  slack_channel: '#investor-escalations',
  sla: '4 hours',
};

/**
 * WF4 - Long Tail Nurture Workflow
 *
 * Triggers when a lead's "Status" changes to "Cold" or "Unresponsive" AND
 * their "Sequence Step" is >= 3. Places the lead into a long-tail nurture
 * cadence with a 14-day reactivation interval.
 *
 * @type {TriggerConfig}
 */
export const WF4_LONG_TAIL_NURTURE = {
  id: 'wf4-long-tail-nurture',
  description: 'Enroll cold or unresponsive leads (step >= 3) into long-tail nurture',
  trigger: {
    type: 'fieldChange',
    table: 'Leads',
    field: 'Status',
  },
  conditions: {
    status: {
      in: ['Cold', 'Unresponsive'],
    },
    sequenceStep: {
      gte: 3,
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/workflows/wf4',
    payload: {
      recordId: '{{record.id}}',
      currentStep: '{{record.Sequence Step}}',
      lastContact: '{{record.Last Contact}}',
    },
  },
  reactivation_interval: '14 days',
};

/**
 * SCAA1 - Battle Plan Workflow
 *
 * Triggers when a new lead record is created in the Leads table with a
 * "Lead Source" of "Retell" or "Website". Automatically assigns the lead
 * and initiates the battle plan workflow.
 *
 * @type {TriggerConfig}
 */
export const SCAA1_BATTLE_PLAN = {
  id: 'scaa1-battle-plan',
  description: 'Initiate battle plan for new Retell or Website leads',
  trigger: {
    type: 'recordCreated',
    table: 'Leads',
  },
  conditions: {
    source: {
      in: ['Retell', 'Website'],
      field: 'Lead Source',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/workflows/scaa1',
    payload: {
      recordId: '{{record.id}}',
    },
  },
  auto_assign: true,
};

/**
 * Slack channel configuration for workflow notifications.
 * Maps logical channel identifiers to their Slack channel names and purposes.
 *
 * @type {Object.<string, {name: string, purpose: string}>}
 */
/**
 * WF2 - Content Publish Workflow (Media Automation Pipeline)
 *
 * Triggers when a Content Calendar record's "Status" field changes to "Approved".
 * Generates platform-optimized content via Claude AI for multi-platform scheduling.
 * Updates Airtable with publish status and writes to the AI Log for audit trail.
 *
 * This is the core trigger for the media automation engine.
 *
 * @type {TriggerConfig}
 */
export const WF2_CONTENT_PUBLISH = {
  id: 'wf2-content-publish',
  description: 'Publish approved content via Claude AI for multi-platform distribution',
  trigger: {
    type: 'fieldChange',
    table: 'Content Calendar',
    field: 'Status',
  },
  conditions: {
    status: {
      equals: 'Approved',
      field: 'Status',
    },
    requiredFields: ['Caption', 'Platform'],
  },
  action: {
    method: 'POST',
    endpoint: '/v1/content/publish',
    payload: {
      recordId: '{{record.id}}',
    },
    headers: {
      Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}',
      'Content-Type': 'application/json',
    },
  },
  fallback: {
    mode: 'manual',
    description: 'Returns copy-paste payload for manual platform posting when needed',
  },
  platforms: ['instagram', 'facebook', 'linkedin', 'x'],
  slack_channel: '#marketing-ops',
  airtable_table_id: 'tblEPr4f2lMz6ruxF',
  airtable_setup_instructions: [
    '1. Open Airtable → Content Calendar table (tblEPr4f2lMz6ruxF)',
    '2. Go to Automations → Create new automation',
    '3. Trigger: "When a record matches conditions"',
    '4. Table: Content Calendar',
    '5. Condition: Status = "Approved"',
    '6. Action: "Run a script" or "Send webhook"',
    '7. Webhook URL: https://ck-api-gateway.david-e59.workers.dev/v1/content/publish',
    '8. Method: POST',
    '9. Headers: Authorization: Bearer {WORKER_AUTH_TOKEN}',
    '10. Body: { "recordId": "{Record ID}" }',
    '11. Enable the automation',
  ],
};

export const META_ADS_BOOST = {
  id: 'meta-ads-boost',
  description: 'Flag high-engagement posts for Meta Ads paid amplification',
  trigger: { type: 'fieldChange', table: 'Content Calendar', field: 'Engagement Rate' },
  conditions: { status: { equals: 'Published', field: 'Status' }, engagementThreshold: { multiplier: 3, baseline: 'rolling_average_30d' } },
  action: { method: 'POST', endpoint: '/v1/meta-ads/boost', payload: { recordId: '{{record.id}}', platform: '{{record.Platform}}', engagementRate: '{{record.Engagement Rate}}', postUrl: '{{record.Post URL}}' } },
  prerequisites: { metaAdsConnector: 'Must be authorized via OAuth', adAccountId: 'META_AD_ACCOUNT_ID', pageAccessToken: 'META_PAGE_ACCESS_TOKEN' },
  slack_channel: '#marketing-ops',
  budget: { default_daily: 25, max_daily: 100, duration_days: 3, currency: 'USD' },
};

export const WF2_CONTENT_ENGAGEMENT = {
  id: 'wf2-content-engagement',
  description: 'Generate and schedule content for new Content Calendar entries',
  trigger: { type: 'recordCreated', table: 'Content Calendar' },
  conditions: { status: { in: ['Draft', 'Planned'], field: 'Status' }, postType: { exists: true, field: 'Post Type' } },
  action: { method: 'POST', endpoint: '/v1/workflows/wf2', payload: { topic: '{{record.Post Title}}', platforms: '{{record.Platform}}', contentType: '{{record.Post Type}}', tone: '{{record.Tone}}', scheduledAt: '{{record.Post Date}}' } },
  integrations: ['claude-ai', 'banana-pro', 'claude-ai-publisher'],
  slack_channel: '#content-alerts',
};

export const WF4_ALIGNABLE_BRANCH = {
  id: 'wf4-alignable-branch',
  description: 'Activate Alignable community engagement for local business leads',
  trigger: { type: 'fieldChange', table: 'Leads', field: 'Call Disposition' },
  conditions: { disposition: { in: ['No Answer', 'Not Interested'] }, serviceZone: { includes: 'Treasure Coast', field: 'Service Zone' } },
  action: { method: 'POST', endpoint: '/v1/workflows/wf4-alignable', payload: { recordId: '{{record.id}}', businessName: '{{record.Business Name}}', businessCategory: '{{record.Business Category}}', location: '{{record.Service Zone}}' } },
  integrations: ['claude-ai', 'alignable'],
  slack_channel: '#community-alerts',
};

export const BANANA_PRO_CONTENT = {
  id: 'banana-pro-content',
  description: 'Enhance content with Banana Pro AI when Banana Pro Enhanced is unchecked',
  trigger: { type: 'fieldChange', table: 'Content Calendar', field: 'Status' },
  conditions: { status: { in: ['Scheduled', 'Ready'] }, bananaEnhanced: { equals: false, field: 'Banana Pro Enhanced' } },
  action: { method: 'POST', endpoint: '/v1/banana/generate', payload: { topic: '{{record.Post Title}}', platform: '{{record.Platform}}', tone: '{{record.Tone}}' } },
  integrations: ['banana-pro'],
};

export const CLAUDE_AI_AUTO_PUBLISH = {
  id: 'claude-ai-auto-publish',
  description: 'Auto-publish ready content via Claude AI platform',
  trigger: { type: 'fieldChange', table: 'Content Calendar', field: 'Status' },
  conditions: { status: { equals: 'Ready' }, publishScheduled: { equals: false, field: 'CK-SPP Scheduled' } },
  action: { method: 'POST', endpoint: '/v1/campaign/peak-time/schedule-post', payload: { text: '{{record.Caption}}', platforms: '{{record.Platform}}', scheduledAt: '{{record.Post Date}}' } },
  integrations: ['claude-ai-publisher'],
};

export const MARKET_DAILY_SCAN = {
  id: 'market-daily-scan',
  description: 'Daily market intelligence scan and report generation',
  trigger: { type: 'scheduled', cron: '0 12 * * 1-5' },
  action: { method: 'GET', endpoint: '/v1/market/report' },
  integrations: ['alpha-vantage', 'claude-ai', 'airtable'],
  slack_channel: '#market-intel',
};

export const SLACK_CHANNELS = {
  SALES_ALERTS: {
    name: '#sales-alerts',
    purpose: 'New lead notifications, conversion events',
  },
  OPS_ALERTS: {
    name: '#ops-alerts',
    purpose: 'Maintenance tickets, inspection reminders, guest issues',
  },
  INVESTOR_ESCALATIONS: {
    name: '#investor-escalations',
    purpose: 'High-value investor lead escalations',
  },
  CONTENT_ALERTS: {
    name: '#content-alerts',
    purpose: 'Content pipeline status, Claude AI publishing, engagement metrics',
  },
  COMMUNITY_ALERTS: {
    name: '#community-alerts',
    purpose: 'Alignable engagement, local business networking',
  },
  MARKET_INTEL: {
    name: '#market-intel',
    purpose: 'Market intelligence reports, stock alerts, economic indicators',
  },
  GENERAL: {
    name: '#general',
    purpose: 'System-wide announcements and status updates',
  },
};
