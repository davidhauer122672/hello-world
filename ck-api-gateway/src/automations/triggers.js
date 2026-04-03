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
 * WF2 - Social Approval → Buffer Publish Workflow
 *
 * Triggers when a Content Calendar record's "Status" field changes to "Approved".
 * Sends Slack preview, schedules via Buffer API across all connected channels
 * (Instagram, Facebook, LinkedIn, X), and updates record to Scheduled.
 *
 * Deployment Tracker: recBDReVmJrH6dPHg
 * Content Calendar Table: tblEPr4f2lMz6ruxF
 *
 * @type {TriggerConfig}
 */
export const WF2_SOCIAL_PUBLISH = {
  id: 'wf2-social-publish',
  description: 'Publish approved Content Calendar posts to Buffer and notify Slack',
  trigger: {
    type: 'fieldChange',
    table: 'Content Calendar',
    tableId: 'tblEPr4f2lMz6ruxF',
    field: 'Status',
    fieldId: 'fldD2rgOO9z1MTs9U',
  },
  conditions: {
    status: {
      equals: 'Approved',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/workflows/wf2',
    payload: {
      recordId: '{{record.id}}',
    },
  },
  dependencies: [
    'Buffer account connected (Instagram Business, Facebook Page, LinkedIn Company Page, X/Twitter)',
    'BUFFER_ACCESS_TOKEN secret configured',
    'Slack #content-calendar channel exists (C0ALCM1E5E2)',
  ],
  field_mapping: {
    caption: { fieldId: 'fldgJXI5IAaWcyw89', maps_to: 'Buffer post text' },
    asset: { fieldId: 'fldlbwkaiT9JBV18E', maps_to: 'Buffer post image' },
    postDate: { fieldId: 'fldFESTOO3wxMT4u2', maps_to: 'Buffer scheduled_at' },
    status: { fieldId: 'fldD2rgOO9z1MTs9U', maps_to: 'Airtable Status (Approved → Scheduled)' },
    notes: { fieldId: 'fld0hiWEXsL70GFpS', maps_to: 'Buffer Post ID written here' },
  },
  supported_platforms: ['Instagram', 'Facebook', 'LinkedIn', 'X'],
  test_record: 'rechVm1hmggAvfvXp',
  slack_channel: '#content-calendar',
};

/**
 * Slack channel configuration for workflow notifications.
 * Maps logical channel identifiers to their Slack channel names and purposes.
 *
 * @type {Object.<string, {name: string, purpose: string}>}
 */
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
  GENERAL: {
    name: '#general',
    purpose: 'System-wide announcements and status updates',
  },
};
