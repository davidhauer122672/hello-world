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
 * DEL-OPS — Delegation Ops Status Change Triggers
 *
 * Fires when a Delegation Ops record's Status field changes.
 * Routes: Dispatched → execute, Completed → handoff, Failed → escalate.
 *
 * @type {TriggerConfig}
 */
export const DEL_OPS_DISPATCH = {
  id: 'del-ops-dispatch',
  description: 'Auto-execute dispatched delegation tasks',
  trigger: {
    type: 'fieldChange',
    table: 'Delegation Ops',
    field: 'Status',
  },
  conditions: {
    status: {
      matchValues: ['Dispatched'],
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/delegation/dispatch',
    payload: {
      agentId: '{{record.Agent ID}}',
      taskName: '{{record.Task Name}}',
      taskContext: '{{record.CEO Prompt}}',
      executeNow: true,
    },
  },
  slack_channel: '#delegation-ops',
};

export const DEL_OPS_HANDOFF = {
  id: 'del-ops-handoff',
  description: 'Auto-handoff completed delegation tasks to target division',
  trigger: {
    type: 'fieldChange',
    table: 'Delegation Ops',
    field: 'Status',
  },
  conditions: {
    status: {
      matchValues: ['Completed'],
    },
    targetDivision: {
      not: 'DEL',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/delegation/handoff',
    payload: {
      fromAgentId: '{{record.Agent ID}}',
      toAgentId: '{{record.Handoff To}}',
      taskContext: '{{record.Scan Results}}',
      handoffInstructions: '{{record.Task Name}}',
    },
  },
  slack_channel: '#delegation-ops',
};

export const DEL_OPS_ESCALATION = {
  id: 'del-ops-escalation',
  description: 'Escalate failed delegation tasks to DEL-001 Oversight Prime',
  trigger: {
    type: 'fieldChange',
    table: 'Delegation Ops',
    field: 'Status',
  },
  conditions: {
    status: {
      matchValues: ['Failed'],
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/delegation/dispatch',
    payload: {
      agentId: 'DEL-001',
      taskName: 'ESCALATION: {{record.Task Name}}',
      taskContext: 'FAILED TASK ESCALATION — Original Agent: {{record.Agent ID}} — Error: {{record.Scan Results}}',
      priority: 'Critical',
      executeNow: true,
    },
  },
  slack_channel: '#delegation-ops',
  sla: '1 hour',
};

/**
 * UPG-OPS — Systems Upgrade Status Triggers
 *
 * Fires when upgrade tasks complete, routing to integration-specific actions.
 *
 * @type {TriggerConfig}
 */
export const UPG_CONTENT_PUBLISH = {
  id: 'upg-content-auto-publish',
  description: 'Auto-publish Scheduled content via Buffer when status changes to Scheduled',
  trigger: {
    type: 'fieldChange',
    table: 'Content Calendar',
    field: 'Status',
  },
  conditions: {
    status: {
      matchValues: ['Scheduled'],
    },
    source: {
      includes: 'AI Generated',
    },
  },
  action: {
    method: 'POST',
    endpoint: '/v1/upgrade/publish',
    payload: {
      contentRecordId: '{{record.id}}',
      platforms: ['instagram', 'facebook', 'linkedin', 'twitter'],
    },
  },
  slack_channel: '#delegation-ops',
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
  GENERAL: {
    name: '#general',
    purpose: 'System-wide announcements and status updates',
  },
  DELEGATION_OPS: {
    name: '#delegation-ops',
    purpose: 'Real-time AI Delegation Agent dispatch alerts, handoffs, escalations, and upgrade sprint notifications',
  },
};
