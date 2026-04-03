/**
 * Workflow Registry — All automation definitions (replaces Zapier Zaps).
 *
 * Each workflow is a complete automation pipeline with:
 *   - id: Unique identifier
 *   - name: Human-readable name
 *   - description: What this workflow does
 *   - trigger: How this workflow is activated (webhook, schedule, poll)
 *   - steps: Ordered list of actions to execute
 *   - enabled: Whether this workflow is active
 *
 * Trigger types:
 *   - webhook: Activated by an API call (POST /v1/automations/run/:workflowId)
 *   - schedule: Activated by Cloudflare Cron Trigger
 *   - poll: Activated by periodic Airtable polling (detects new/changed records)
 */

// ── Workflow Definitions ─────────────────────────────────────────────────────

const WORKFLOWS = {

  // ── SCAA-1: Battle Plan Pipeline (migrated from existing workflow) ──────
  'scaa1-battle-plan': {
    id: 'scaa1-battle-plan',
    name: 'SCAA-1 Battle Plan Pipeline',
    description: 'Generates a personalized battle plan for new Retell/Website leads. Creates follow-up task, AI log entry, and Slack notification.',
    enabled: true,
    trigger: {
      type: 'poll',
      table: 'LEADS',
      filter: `AND({Lead Source}="Retell", {Audit Trail/Activity Log}="")`,
      pollInterval: 5, // minutes
    },
    steps: [
      {
        id: 'fetch-lead',
        action: 'airtable.get',
        params: {
          table: 'LEADS',
          recordId: '{{trigger.recordId}}',
        },
      },
      {
        id: 'generate-battle-plan',
        action: 'claude.inference',
        params: {
          system: 'You are SCAA-1, the Sentinel Campaign Acquisition Architect for Coastal Key Property Management. You create hyper-personalized outbound sales battle plans for the Treasure Coast luxury property management market. Your outputs are concise, actionable, and designed for a human closer to execute within 48 hours.',
          prompt: 'Generate a SCAA-1 Battle Plan for this lead. Include:\n1. Opening hook tailored to their segment\n2. Three key value propositions specific to their property/zone\n3. Objection handling for top 3 likely objections\n4. Recommended next action and timeline\n5. Follow-up email draft\n\nLead Data:\nLead Name: {{outputs.fetch-lead.fields.Lead Name}}\nSentinel Segment: {{outputs.fetch-lead.fields.Sentinel Segment}}\nProperty Address: {{outputs.fetch-lead.fields.Property Address}}\nService Zone: {{outputs.fetch-lead.fields.Service Zone}}\nProperty Value: {{outputs.fetch-lead.fields.Property Value}}\nPhone: {{outputs.fetch-lead.fields.Phone Number}}\nEmail: {{outputs.fetch-lead.fields.Email}}',
          tier: 'advanced',
          maxTokens: 3000,
          cacheKey: 'scaa1:{{trigger.recordId}}',
          cacheTtl: 7200,
        },
      },
      {
        id: 'update-audit-trail',
        action: 'airtable.update',
        optional: true,
        params: {
          table: 'LEADS',
          recordId: '{{trigger.recordId}}',
          fields: {
            'Audit Trail/Activity Log': '{{outputs.fetch-lead.fields.Audit Trail/Activity Log}}\n[{{now}}] SCAA-1 Battle Plan generated via workflow engine.',
          },
        },
      },
      {
        id: 'create-ai-log',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'AI_LOG',
          fields: {
            'Log Entry': 'Sentinel: battle_plan — {{outputs.fetch-lead.fields.Lead Name}} — {{now}}',
            'Module': { name: 'Sentinel' },
            'Request Type': { name: 'battle_plan' },
            'Input Brief': 'Lead: {{outputs.fetch-lead.fields.Lead Name}} | Segment: {{outputs.fetch-lead.fields.Sentinel Segment}} | Zone: {{outputs.fetch-lead.fields.Service Zone}}',
            'Output Text': '{{outputs.generate-battle-plan.content}}',
            'Model Used': { name: '{{outputs.generate-battle-plan.model}}' },
            'Timestamp': '{{now}}',
            'Status': { name: 'Completed' },
          },
        },
      },
      {
        id: 'create-task',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'TASKS',
          fields: {
            'Task Name': 'Follow up: {{outputs.fetch-lead.fields.Lead Name}} — Battle Plan ready',
            'Type': { name: 'Follow-up' },
            'Priority': { name: 'High' },
            'Due Date': '{{tomorrow}}',
            'Related Lead': ['{{trigger.recordId}}'],
            'Status': { name: 'Not Started' },
          },
        },
      },
      {
        id: 'notify-slack',
        action: 'slack.send',
        optional: true,
        params: {
          channel: '#sales-alerts',
          text: '*SCAA-1 Battle Plan Generated*\n*Lead:* {{outputs.fetch-lead.fields.Lead Name}}\n*Segment:* {{outputs.fetch-lead.fields.Sentinel Segment}}\n*Zone:* {{outputs.fetch-lead.fields.Service Zone}}',
        },
      },
      {
        id: 'audit-log',
        action: 'audit.log',
        optional: true,
        params: {
          route: '/v1/automations/scaa1-battle-plan',
          data: {
            action: 'battle_plan',
            recordId: '{{trigger.recordId}}',
            leadName: '{{outputs.fetch-lead.fields.Lead Name}}',
            model: '{{outputs.generate-battle-plan.model}}',
          },
        },
      },
    ],
  },

  // ── WF-3: Investor Escalation (migrated from existing workflow) ─────────
  'wf3-investor-escalation': {
    id: 'wf3-investor-escalation',
    name: 'WF-3 Investor Escalation',
    description: 'Escalates leads flagged as investors. Generates investor presentation, creates escalation task, and prepares welcome email.',
    enabled: true,
    trigger: {
      type: 'poll',
      table: 'LEADS',
      filter: `AND({Investor Flag}=TRUE(), NOT({WF-3 Sent}))`,
      pollInterval: 5,
    },
    steps: [
      {
        id: 'fetch-lead',
        action: 'airtable.get',
        params: {
          table: 'LEADS',
          recordId: '{{trigger.recordId}}',
        },
      },
      {
        id: 'check-not-sent',
        action: 'filter.check',
        params: {
          value: '{{outputs.fetch-lead.fields.WF-3 Sent}}',
          operator: 'notEquals',
          compareTo: true,
          message: 'WF-3 already sent for this lead',
        },
      },
      {
        id: 'generate-presentation',
        action: 'claude.inference',
        params: {
          system: 'You are the Coastal Key Investor Relations AI. You analyze property investment opportunities on the Treasure Coast and create compelling investor-grade summaries. Focus on ROI, market position, and competitive advantages.',
          prompt: 'Create an investor presentation recommendation for this lead. Include:\n1. Investment thesis tailored to their property\n2. Market analysis for their service zone\n3. Projected ROI framework\n4. Competitive positioning vs local providers\n5. Recommended presentation template and talking points\n6. Personalized welcome email content\n\nLead Data:\nLead Name: {{outputs.fetch-lead.fields.Lead Name}}\nSentinel Segment: {{outputs.fetch-lead.fields.Sentinel Segment}}\nProperty Address: {{outputs.fetch-lead.fields.Property Address}}\nService Zone: {{outputs.fetch-lead.fields.Service Zone}}\nProperty Value: {{outputs.fetch-lead.fields.Property Value}}\nPhone: {{outputs.fetch-lead.fields.Phone Number}}\nEmail: {{outputs.fetch-lead.fields.Email}}',
          tier: 'advanced',
          maxTokens: 2500,
          cacheKey: 'wf3:{{trigger.recordId}}',
          cacheTtl: 7200,
        },
      },
      {
        id: 'create-escalation-task',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'TASKS',
          fields: {
            'Task Name': 'Investor Follow-up: {{outputs.fetch-lead.fields.Lead Name}}',
            'Type': { name: 'Escalation' },
            'Priority': { name: 'Urgent' },
            'Due Date': '{{tomorrow}}',
            'Related Lead': ['{{trigger.recordId}}'],
            'Status': { name: 'Not Started' },
          },
        },
      },
      {
        id: 'create-presentation-record',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'INVESTOR_PRESENTATIONS',
          fields: {
            'Presentation Name': 'Investor Package — {{outputs.fetch-lead.fields.Lead Name}}',
            'Related Lead': ['{{trigger.recordId}}'],
            'Triggered By': 'WF-3 Investor Escalation (Engine)',
            'Status': { name: 'Draft' },
            'Date Deployed': '{{today}}',
          },
        },
      },
      {
        id: 'mark-wf3-sent',
        action: 'airtable.update',
        params: {
          table: 'LEADS',
          recordId: '{{trigger.recordId}}',
          fields: {
            'WF-3 Sent': true,
            'Audit Trail/Activity Log': '{{outputs.fetch-lead.fields.Audit Trail/Activity Log}}\n[{{now}}] WF-3 Investor Escalation fired via workflow engine. Presentation created. Task assigned.',
          },
        },
      },
      {
        id: 'create-ai-log',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'AI_LOG',
          fields: {
            'Log Entry': 'Sentinel: investor_escalation — {{outputs.fetch-lead.fields.Lead Name}} — {{now}}',
            'Module': { name: 'Sentinel' },
            'Request Type': { name: 'investor_escalation' },
            'Output Text': '{{outputs.generate-presentation.content}}',
            'Model Used': { name: '{{outputs.generate-presentation.model}}' },
            'Timestamp': '{{now}}',
            'Status': { name: 'Completed' },
          },
        },
      },
      {
        id: 'notify-slack',
        action: 'slack.send',
        optional: true,
        params: {
          channel: '#sales-alerts',
          text: '*INVESTOR ESCALATION:* {{outputs.fetch-lead.fields.Lead Name}} — Property Value: {{outputs.fetch-lead.fields.Property Value}} — Presentation created',
        },
      },
      {
        id: 'prepare-email',
        action: 'email.prepare',
        optional: true,
        params: {
          to: '{{outputs.fetch-lead.fields.Email}}',
          from: 'david@coastalkey-pm.com',
          subject: 'Welcome to Coastal Key — {{outputs.fetch-lead.fields.Lead Name}}',
          body: 'Thank you for your interest in Coastal Key Property Management. We have prepared a personalized investor package based on your property and local market data.',
        },
      },
    ],
  },

  // ── WF-4: Long-Tail Nurture (migrated from existing workflow) ───────────
  'wf4-long-tail-nurture': {
    id: 'wf4-long-tail-nurture',
    name: 'WF-4 Long-Tail Nurture',
    description: 'Enrolls cold/unresponsive leads into a 90-day re-engagement drip sequence.',
    enabled: true,
    trigger: {
      type: 'poll',
      table: 'LEADS',
      filter: `AND(OR({Call Disposition}="No Answer", {Call Disposition}="Not Interested"), NOT(FIND("WF-4 nurture enrolled", {Audit Trail/Activity Log})))`,
      pollInterval: 10,
    },
    steps: [
      {
        id: 'fetch-lead',
        action: 'airtable.get',
        params: {
          table: 'LEADS',
          recordId: '{{trigger.recordId}}',
        },
      },
      {
        id: 'check-disposition',
        action: 'filter.check',
        params: {
          value: '{{outputs.fetch-lead.fields.Call Disposition}}',
          operator: 'in',
          compareTo: ['No Answer', 'Not Interested'],
          message: 'Call Disposition does not qualify for nurture',
        },
      },
      {
        id: 'check-not-enrolled',
        action: 'filter.check',
        params: {
          value: '{{outputs.fetch-lead.fields.Audit Trail/Activity Log}}',
          operator: 'notExists',
          compareTo: 'WF-4 nurture enrolled',
          message: 'Already enrolled in WF-4 nurture',
        },
      },
      {
        id: 'create-reengage-task',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'TASKS',
          fields: {
            'Task Name': 'Re-engagement: {{outputs.fetch-lead.fields.Lead Name}} — 90-day nurture check',
            'Type': { name: 'Re-engagement' },
            'Priority': { name: 'Low' },
            'Due Date': '{{plus90days}}',
            'Related Lead': ['{{trigger.recordId}}'],
            'Status': { name: 'Not Started' },
          },
        },
      },
      {
        id: 'update-lead',
        action: 'airtable.update',
        params: {
          table: 'LEADS',
          recordId: '{{trigger.recordId}}',
          fields: {
            'Sequence Step': { name: 'Day 14 - Long-Tail Nurture' },
            'Audit Trail/Activity Log': '{{outputs.fetch-lead.fields.Audit Trail/Activity Log}}\n[{{now}}] WF-4 nurture enrolled via workflow engine. Re-engagement task created for {{plus90days}}.',
          },
        },
      },
      {
        id: 'notify-slack',
        action: 'slack.send',
        optional: true,
        params: {
          channel: '#sales-alerts',
          text: '*LONG-TAIL NURTURE:* {{outputs.fetch-lead.fields.Lead Name}} enrolled in 90-day drip. Re-engagement task set for {{plus90days}}.',
        },
      },
      {
        id: 'prepare-constant-contact',
        action: 'email.prepare',
        optional: true,
        params: {
          to: '{{outputs.fetch-lead.fields.Email}}',
          from: 'david@coastalkey-pm.com',
          subject: 'Coastal Key — Property Management Solutions',
          body: 'We wanted to follow up on our recent conversation about property management services for the Treasure Coast.',
          listName: 'Sentinel Long-Tail Nurture',
        },
      },
    ],
  },

  // ── WF-5: New Website Lead Welcome (NEW — replaces Zapier) ──────────────
  'wf5-website-welcome': {
    id: 'wf5-website-welcome',
    name: 'WF-5 Website Lead Welcome',
    description: 'Sends a welcome Slack notification and creates a follow-up task when a new lead comes from the website contact form.',
    enabled: true,
    trigger: {
      type: 'webhook',
      event: 'lead.created',
      source: 'website',
    },
    steps: [
      {
        id: 'fetch-lead',
        action: 'airtable.get',
        params: {
          table: 'LEADS',
          recordId: '{{trigger.recordId}}',
        },
      },
      {
        id: 'create-welcome-task',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'TASKS',
          fields: {
            'Task Name': 'Website Lead Follow-up: {{outputs.fetch-lead.fields.Lead Name}}',
            'Type': { name: 'Follow-up' },
            'Priority': { name: 'High' },
            'Due Date': '{{today}}',
            'Related Lead': ['{{trigger.recordId}}'],
            'Status': { name: 'Not Started' },
          },
        },
      },
      {
        id: 'notify-slack',
        action: 'slack.send',
        optional: true,
        params: {
          channel: '#sales-alerts',
          text: '*NEW WEBSITE LEAD:* {{outputs.fetch-lead.fields.Lead Name}}\n*Email:* {{outputs.fetch-lead.fields.Email}}\n*Phone:* {{outputs.fetch-lead.fields.Phone Number}}\n*Zone:* {{outputs.fetch-lead.fields.Service Zone}}',
        },
      },
      {
        id: 'audit-log',
        action: 'audit.log',
        optional: true,
        params: {
          route: '/v1/automations/wf5-website-welcome',
          data: {
            action: 'website_welcome',
            recordId: '{{trigger.recordId}}',
            leadName: '{{outputs.fetch-lead.fields.Lead Name}}',
          },
        },
      },
    ],
  },

  // ── WF-6: Daily Campaign Digest (NEW — scheduled) ──────────────────────
  'wf6-daily-digest': {
    id: 'wf6-daily-digest',
    name: 'WF-6 Daily Campaign Digest',
    description: 'Runs every morning at 8 AM EST. Summarizes yesterday\'s campaign performance via Claude and posts to Slack.',
    enabled: true,
    trigger: {
      type: 'schedule',
      cron: '0 13 * * 1-6', // 8 AM EST (UTC-5) Mon-Sat
    },
    steps: [
      {
        id: 'fetch-calls',
        action: 'airtable.list',
        params: {
          table: 'TH_CALL_LOG',
          filter: 'IS_AFTER({Date}, DATEADD(TODAY(), -1, "days"))',
          maxRecords: 100,
        },
      },
      {
        id: 'fetch-analytics',
        action: 'airtable.list',
        params: {
          table: 'TH_CAMPAIGN_ANALYTICS',
          maxRecords: 1,
          sort: 'Date',
        },
      },
      {
        id: 'generate-digest',
        action: 'claude.inference',
        params: {
          system: 'You are the Coastal Key Campaign Intelligence AI. You create concise daily campaign performance digests. Use bullet points, key metrics, and actionable insights. Keep it under 500 words.',
          prompt: 'Generate a daily campaign digest based on this data:\n\nCalls logged: {{outputs.fetch-calls.count}}\nAnalytics: {{outputs.fetch-analytics.records}}\n\nInclude:\n1. Key metrics (calls, connections, qualified leads)\n2. Top performing agents\n3. Notable trends or concerns\n4. Recommended actions for today',
          tier: 'fast',
          maxTokens: 1000,
        },
      },
      {
        id: 'post-digest',
        action: 'slack.send',
        params: {
          channel: '#ops-alerts',
          text: '*DAILY CAMPAIGN DIGEST — {{today}}*\n\n{{outputs.generate-digest.content}}',
        },
      },
    ],
  },

  // ── WF-7: Stale Lead Re-engagement (NEW — scheduled) ───────────────────
  'wf7-stale-lead-check': {
    id: 'wf7-stale-lead-check',
    name: 'WF-7 Stale Lead Re-engagement Check',
    description: 'Runs weekly to find leads with no activity in 30+ days and creates re-engagement tasks.',
    enabled: true,
    trigger: {
      type: 'schedule',
      cron: '0 14 * * 1', // 9 AM EST Monday
    },
    steps: [
      {
        id: 'find-stale-leads',
        action: 'airtable.list',
        params: {
          table: 'LEADS',
          filter: 'AND(IS_BEFORE({Last Contact}, DATEADD(TODAY(), -30, "days")), {Status}!="Closed", {Status}!="Converted")',
          fields: ['Lead Name', 'Email', 'Phone Number', 'Last Contact', 'Status', 'Service Zone'],
          maxRecords: 50,
        },
      },
      {
        id: 'notify-stale',
        action: 'slack.send',
        optional: true,
        params: {
          channel: '#sales-alerts',
          text: '*WEEKLY STALE LEAD REPORT*\nFound {{outputs.find-stale-leads.count}} leads with no activity in 30+ days.\nReview and re-engage these leads this week.',
        },
      },
    ],
  },

  // ── WF-8: Missed Call Follow-up (NEW — replaces Zapier) ────────────────
  'wf8-missed-call-followup': {
    id: 'wf8-missed-call-followup',
    name: 'WF-8 Missed Call Follow-up',
    description: 'When a call is logged as missed/failed, creates a callback task and notifies the ops channel.',
    enabled: true,
    trigger: {
      type: 'webhook',
      event: 'call.missed',
    },
    steps: [
      {
        id: 'get-call-record',
        action: 'airtable.get',
        params: {
          table: 'MISSED_FAILED_CALLS',
          recordId: '{{trigger.recordId}}',
        },
      },
      {
        id: 'create-callback-task',
        action: 'airtable.create',
        optional: true,
        params: {
          table: 'TASKS',
          fields: {
            'Task Name': 'Callback: {{outputs.get-call-record.fields.Lead Name}} — Missed call',
            'Type': { name: 'Callback' },
            'Priority': { name: 'Medium' },
            'Due Date': '{{today}}',
            'Status': { name: 'Not Started' },
          },
        },
      },
      {
        id: 'notify-ops',
        action: 'slack.send',
        optional: true,
        params: {
          channel: '#ops-alerts',
          text: '*MISSED CALL:* {{outputs.get-call-record.fields.Lead Name}} — {{outputs.get-call-record.fields.Phone Number}}\nReason: {{outputs.get-call-record.fields.Disconnection Reason}}\nCallback task created.',
        },
      },
    ],
  },

  // ── WF-9: Property Intel Auto-Import (NEW — scheduled) ─────────────────
  'wf9-property-import': {
    id: 'wf9-property-import',
    name: 'WF-9 Property Intelligence Auto-Import',
    description: 'Runs daily to check for new property records and posts a summary.',
    enabled: true,
    trigger: {
      type: 'schedule',
      cron: '0 15 * * 1-5', // 10 AM EST weekdays
    },
    steps: [
      {
        id: 'check-stats',
        action: 'http.request',
        params: {
          url: 'https://ck-api-gateway.david-e59.workers.dev/v1/property-intel/stats',
          method: 'GET',
          headers: { 'Authorization': 'Bearer {{env.WORKER_AUTH_TOKEN}}' },
        },
      },
      {
        id: 'post-summary',
        action: 'slack.send',
        optional: true,
        params: {
          channel: '#ops-alerts',
          text: '*DAILY PROPERTY INTEL UPDATE*\nStats: {{outputs.check-stats.data}}',
        },
      },
    ],
  },

  // ── WF-10: Health Check Monitor (NEW — scheduled) ──────────────────────
  'wf10-health-monitor': {
    id: 'wf10-health-monitor',
    name: 'WF-10 System Health Monitor',
    description: 'Runs every 30 minutes to check API gateway health and alert on degradation.',
    enabled: true,
    trigger: {
      type: 'schedule',
      cron: '*/30 * * * *',
    },
    steps: [
      {
        id: 'health-check',
        action: 'http.request',
        params: {
          url: 'https://ck-api-gateway.david-e59.workers.dev/v1/health?deep=true',
          method: 'GET',
        },
      },
      {
        id: 'alert-if-degraded',
        action: 'slack.send',
        condition: {
          field: 'outputs.health-check.data.status',
          notEquals: 'operational',
        },
        params: {
          channel: '#ops-alerts',
          text: '*SYSTEM HEALTH ALERT*\nStatus: {{outputs.health-check.data.status}}\nChecks: {{outputs.health-check.data.checks}}',
        },
      },
    ],
  },
};

// ── Registry API ─────────────────────────────────────────────────────────────

/**
 * Get all registered workflows.
 */
export function getAllWorkflows() {
  return Object.values(WORKFLOWS);
}

/**
 * Get a workflow by ID.
 */
export function getWorkflow(id) {
  return WORKFLOWS[id] || null;
}

/**
 * Get workflows by trigger type.
 */
export function getWorkflowsByTrigger(triggerType) {
  return Object.values(WORKFLOWS).filter(w => w.enabled && w.trigger.type === triggerType);
}

/**
 * Get workflow summary (for dashboard).
 */
export function getWorkflowSummary() {
  return Object.values(WORKFLOWS).map(w => ({
    id: w.id,
    name: w.name,
    description: w.description,
    enabled: w.enabled,
    trigger: w.trigger.type,
    stepCount: w.steps.length,
  }));
}

/**
 * Get the total count of registered workflows.
 */
export function getWorkflowCount() {
  return Object.keys(WORKFLOWS).length;
}
