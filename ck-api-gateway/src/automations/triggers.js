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
 * WF2 - Content Calendar → Buffer Publish
 *
 * Triggers when a Content Calendar record's "Status" field changes to "Approved".
 * Pushes the post to Buffer via the /v1/content/publish endpoint for automated
 * multi-platform scheduling (Instagram, Facebook, LinkedIn, X, Alignable).
 *
 * Airtable Automation Setup (11 steps):
 *   1. Open Airtable base → Content Calendar table
 *   2. Click Automations → Create Automation
 *   3. Trigger: "When a record matches conditions"
 *      - Table: Content Calendar
 *      - Condition: Status = "Approved"
 *   4. Action: "Send webhook"
 *      - Method: POST
 *      - URL: https://ck-api-gateway.david-e59.workers.dev/v1/content/publish
 *      - Headers: Authorization: Bearer {WORKER_AUTH_TOKEN}
 *      - Headers: Content-Type: application/json
 *   5. Body: {"recordId": "{{record.id}}"}
 *   6. Test the automation with a sample record
 *   7. Enable the automation
 *   8. Verify Buffer receives the post via GET /v1/health?deep=true
 *   9. Confirm Airtable record updates with Buffer Status field
 *  10. Check audit log at GET /v1/audit for publish confirmation
 *  11. Monitor #marketing-ops Slack channel for publish notifications
 *
 * @type {TriggerConfig}
 */
export const WF2_CONTENT_PUBLISH = {
  id: 'wf2-content-publish',
  description: 'Publish approved Content Calendar records to Buffer for multi-platform scheduling',
  trigger: {
    type: 'fieldChange',
    table: 'Content Calendar',
    field: 'Status',
  },
  conditions: {
    status: {
      equals: 'Approved',
      matchValues: ['Approved'],
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/content/publish',
    payload: {
      recordId: '{{record.id}}',
    },
    headers: {
      'Authorization': 'Bearer {{WORKER_AUTH_TOKEN}}',
      'Content-Type': 'application/json',
    },
  },
  fallback: {
    mode: 'manual',
    description: 'If BUFFER_ACCESS_TOKEN is not set, returns manual posting payload with copy-paste instructions',
  },
  platforms: ['instagram', 'facebook', 'linkedin', 'x', 'alignable'],
  slack_channel: '#marketing-ops',
};

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
