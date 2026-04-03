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
 * WF2 - Content Engagement Pipeline
 *
 * Triggers when a Content Calendar record is created with Status "Draft"
 * and Content Type is set. Fires the WF-2 content engagement pipeline
 * to generate AI content, schedule to Buffer, and create engagement tasks.
 *
 * @type {TriggerConfig}
 */
export const WF2_CONTENT_ENGAGEMENT = {
  id: 'wf2-content-engagement',
  description: 'Generate and schedule content for new Content Calendar entries',
  trigger: {
    type: 'recordCreated',
    table: 'Content Calendar',
  },
  conditions: {
    status: {
      in: ['Draft', 'Planned'],
      field: 'Status',
    },
    contentType: {
      exists: true,
      field: 'Content Type',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/workflows/wf2',
    payload: {
      topic: '{{record.Content Title}}',
      platforms: '{{record.Platform}}',
      contentType: '{{record.Content Type}}',
      tone: '{{record.Tone}}',
      scheduledAt: '{{record.Scheduled Date}}',
    },
  },
  integrations: ['claude-ai', 'banana-pro', 'buffer'],
  slack_channel: '#content-alerts',
};

/**
 * WF4-ALIGNABLE - Alignable Community Alert Branch
 *
 * Triggers when a lead's "Service Zone" matches Treasure Coast AND
 * the lead has a business category populated. Routes through the
 * Alignable community engagement pipeline.
 *
 * @type {TriggerConfig}
 */
export const WF4_ALIGNABLE_BRANCH = {
  id: 'wf4-alignable-branch',
  description: 'Activate Alignable community engagement for local business leads',
  trigger: {
    type: 'fieldChange',
    table: 'Leads',
    field: 'Call Disposition',
  },
  conditions: {
    disposition: {
      in: ['No Answer', 'Not Interested'],
    },
    serviceZone: {
      includes: 'Treasure Coast',
      field: 'Service Zone',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/workflows/wf4-alignable',
    payload: {
      recordId: '{{record.id}}',
      businessName: '{{record.Business Name}}',
      businessCategory: '{{record.Business Category}}',
      location: '{{record.Service Zone}}',
    },
  },
  integrations: ['claude-ai', 'alignable'],
  slack_channel: '#community-alerts',
};

/**
 * BANANA_PRO_CONTENT - Banana Pro AI Content Generation
 *
 * Triggers when a Content Calendar entry needs AI enhancement.
 * Fires Banana Pro for GPU-accelerated content generation.
 *
 * @type {TriggerConfig}
 */
export const BANANA_PRO_CONTENT = {
  id: 'banana-pro-content',
  description: 'Enhance content with Banana Pro AI when Banana Pro Enhanced is unchecked',
  trigger: {
    type: 'fieldChange',
    table: 'Content Calendar',
    field: 'Status',
  },
  conditions: {
    status: {
      in: ['Scheduled', 'Ready'],
    },
    bananaEnhanced: {
      equals: false,
      field: 'Banana Pro Enhanced',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/banana/generate',
    payload: {
      topic: '{{record.Content Title}}',
      platform: '{{record.Platform}}',
      tone: '{{record.Tone}}',
    },
  },
  integrations: ['banana-pro'],
};

/**
 * BUFFER_SCHEDULE - Buffer Auto-Schedule
 *
 * Triggers when Content Calendar status changes to "Ready" and
 * Buffer Scheduled is false. Queues the content to Buffer.
 *
 * @type {TriggerConfig}
 */
export const BUFFER_AUTO_SCHEDULE = {
  id: 'buffer-auto-schedule',
  description: 'Auto-schedule ready content to Buffer for publishing',
  trigger: {
    type: 'fieldChange',
    table: 'Content Calendar',
    field: 'Status',
  },
  conditions: {
    status: {
      equals: 'Ready',
    },
    bufferScheduled: {
      equals: false,
      field: 'Buffer Scheduled',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/buffer/cross-post',
    payload: {
      text: '{{record.Content Body}}',
      platforms: '{{record.Platform}}',
      scheduledAt: '{{record.Scheduled Date}}',
    },
  },
  integrations: ['buffer'],
};

/**
 * MARKET_DAILY_SCAN - Daily Market Intelligence Scan
 *
 * Scheduled trigger (cron) — runs daily at 0700 EST.
 * Executes full market scan and generates AI report.
 *
 * @type {TriggerConfig}
 */
export const MARKET_DAILY_SCAN = {
  id: 'market-daily-scan',
  description: 'Daily market intelligence scan and report generation',
  trigger: {
    type: 'scheduled',
    cron: '0 12 * * 1-5', // 0700 EST (1200 UTC) weekdays
  },
  action: {
    method: 'GET',
    endpoint: '/v1/market/report',
  },
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
    purpose: 'Content pipeline status, Buffer scheduling, engagement metrics',
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
