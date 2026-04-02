/**
 * Zapier Workflow Definitions (WF-1 through WF-7)
 *
 * Infrastructure-as-code specs for each Zap. These define the trigger,
 * filter, actions, and webhook endpoints so any developer or automation
 * tool can recreate the Zaps deterministically.
 *
 * Each workflow fires via Airtable record triggers or webhook events,
 * calls the ck-api-gateway for AI processing, and pushes results to
 * downstream channels (Slack, Buffer, Constant Contact, Airtable).
 */

export const ZAPIER_WORKFLOWS = [
  // ── WF-1: New Lead → Battle Plan + Slack ─────────────────────────────────
  {
    id: 'WF-1',
    name: 'New Lead → SCAA-1 Battle Plan Pipeline',
    status: 'on',
    description: 'When a new lead enters Airtable, generate an AI battle plan, create a follow-up task, log to AI Log, and notify #sales-alerts.',
    trigger: {
      app: 'airtable',
      event: 'new_record',
      table: 'Leads',
      tableId: 'tblpNasm0AxreRqLW',
      baseId: 'appUSnNgpDkcEOzhN',
      view: 'All Leads',
    },
    filter: {
      field: 'Status',
      condition: 'is',
      value: 'New',
    },
    actions: [
      {
        step: 1,
        app: 'webhook',
        event: 'post',
        url: 'https://ck-api-gateway.<ACCOUNT>.workers.dev/v1/workflows/scaa1',
        method: 'POST',
        headers: { Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}' },
        body: { recordId: '{{record_id}}' },
      },
      {
        step: 2,
        app: 'slack',
        event: 'send_channel_message',
        channel: '#sales-alerts',
        channelId: 'C06SALES01',
        message: '🎯 *New Lead Battle Plan*\n*Lead:* {{lead_name}}\n*Segment:* {{segment}}\n*Zone:* {{service_zone}}\nBattle plan generated and task created.',
      },
    ],
    webhookEndpoint: '/v1/workflows/scaa1',
    slackChannel: '#sales-alerts',
    slackChannelId: 'C06SALES01',
  },

  // ── WF-2: Approved Content → Buffer → Social Publish ─────────────────────
  {
    id: 'WF-2',
    name: 'Approved Content → Buffer Social Publish',
    status: 'on',
    description: 'When content in Content Calendar is marked Approved, push to Buffer for scheduled publishing across Instagram, Facebook, and LinkedIn.',
    trigger: {
      app: 'airtable',
      event: 'record_updated',
      table: 'Content Calendar',
      tableId: 'tblEPr4f2lMz6ruxF',
      baseId: 'appUSnNgpDkcEOzhN',
      watchField: 'Status',
    },
    filter: {
      field: 'Status',
      condition: 'is',
      value: 'Approved',
    },
    actions: [
      {
        step: 1,
        app: 'webhook',
        event: 'post',
        url: 'https://ck-api-gateway.<ACCOUNT>.workers.dev/v1/workflows/wf2',
        method: 'POST',
        headers: { Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}' },
        body: { recordId: '{{record_id}}' },
      },
      {
        step: 2,
        app: 'buffer',
        event: 'create_post',
        profiles: ['instagram_business', 'facebook_page', 'linkedin_company'],
        text: '{{post_caption}}',
        mediaUrl: '{{media_url}}',
        scheduledAt: '{{publish_date}}',
      },
      {
        step: 3,
        app: 'airtable',
        event: 'update_record',
        table: 'Content Calendar',
        tableId: 'tblEPr4f2lMz6ruxF',
        fields: { Status: 'Published', 'Published Date': '{{now}}' },
      },
    ],
    webhookEndpoint: '/v1/workflows/wf2',
    bufferProfiles: {
      instagram: 'Instagram Business — @coastalkeypm',
      facebook: 'Facebook Business Page — Coastal Key Property Management',
      linkedin: 'LinkedIn Company Page — Coastal Key Property Management LLC',
    },
    slackChannel: '#marketing',
    slackChannelId: 'C06MKT01',
  },

  // ── WF-3: Investor Flag → Escalation Pipeline ────────────────────────────
  {
    id: 'WF-3',
    name: 'Investor Flag → Executive Escalation',
    status: 'on',
    description: 'When a lead is flagged as Investor and WF-3 has not been sent, generate investor presentation, create escalation task, and prepare welcome email.',
    trigger: {
      app: 'airtable',
      event: 'record_updated',
      table: 'Leads',
      tableId: 'tblpNasm0AxreRqLW',
      baseId: 'appUSnNgpDkcEOzhN',
      watchField: 'Investor Flag',
    },
    filter: {
      conditions: [
        { field: 'Investor Flag', condition: 'is', value: true },
        { field: 'WF-3 Sent', condition: 'is_not', value: true },
      ],
      logic: 'AND',
    },
    actions: [
      {
        step: 1,
        app: 'webhook',
        event: 'post',
        url: 'https://ck-api-gateway.<ACCOUNT>.workers.dev/v1/workflows/wf3',
        method: 'POST',
        headers: { Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}' },
        body: { recordId: '{{record_id}}' },
      },
      {
        step: 2,
        app: 'slack',
        event: 'send_channel_message',
        channel: '#investor-alerts',
        channelId: 'C06INV01',
        message: '💰 *INVESTOR ESCALATION*\n*Lead:* {{lead_name}}\n*Property Value:* {{property_value}}\nPresentation created. Task assigned.',
      },
      {
        step: 3,
        app: 'gmail',
        event: 'send_email',
        to: '{{lead_email}}',
        from: 'david@coastalkey-pm.com',
        subject: 'Welcome to Coastal Key — {{first_name}}',
        body: '{{welcome_email_body}}',
      },
    ],
    webhookEndpoint: '/v1/workflows/wf3',
    slackChannel: '#investor-alerts',
    slackChannelId: 'C06INV01',
  },

  // ── WF-4: Disposition Change → Long-Tail Nurture ─────────────────────────
  {
    id: 'WF-4',
    name: 'Disposition Change → 90-Day Nurture Drip',
    status: 'on',
    description: 'When a lead disposition changes to No Answer or Not Interested, enroll in 90-day nurture sequence via Constant Contact and create re-engagement task.',
    trigger: {
      app: 'airtable',
      event: 'record_updated',
      table: 'Leads',
      tableId: 'tblpNasm0AxreRqLW',
      baseId: 'appUSnNgpDkcEOzhN',
      watchField: 'Call Disposition',
    },
    filter: {
      field: 'Call Disposition',
      condition: 'is_one_of',
      values: ['No Answer', 'Not Interested'],
    },
    actions: [
      {
        step: 1,
        app: 'webhook',
        event: 'post',
        url: 'https://ck-api-gateway.<ACCOUNT>.workers.dev/v1/workflows/wf4',
        method: 'POST',
        headers: { Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}' },
        body: { recordId: '{{record_id}}' },
      },
      {
        step: 2,
        app: 'constant_contact',
        event: 'add_contact_to_list',
        listName: 'Sentinel Long-Tail Nurture',
        email: '{{lead_email}}',
        firstName: '{{first_name}}',
        lastName: '{{last_name}}',
      },
      {
        step: 3,
        app: 'slack',
        event: 'send_channel_message',
        channel: '#sales-alerts',
        channelId: 'C06SALES01',
        message: '📋 *Nurture Enrolled:* {{lead_name}} — 90-day drip started.',
      },
    ],
    webhookEndpoint: '/v1/workflows/wf4',
    slackChannel: '#sales-alerts',
    slackChannelId: 'C06SALES01',
  },

  // ── WF-5: Missed Call → QA Alert + Retry ─────────────────────────────────
  {
    id: 'WF-5',
    name: 'Missed/Failed Call → QA Alert + Auto-Retry',
    status: 'on',
    description: 'When a call record lands in Missed/Failed Calls table, alert the QA team on Slack and schedule an auto-retry within 48 hours.',
    trigger: {
      app: 'airtable',
      event: 'new_record',
      table: 'Missed/Failed Calls',
      tableId: 'tblWW25r6GmsQe3mQ',
      baseId: 'appUSnNgpDkcEOzhN',
    },
    filter: null,
    actions: [
      {
        step: 1,
        app: 'webhook',
        event: 'post',
        url: 'https://ck-api-gateway.<ACCOUNT>.workers.dev/v1/workflows/wf5',
        method: 'POST',
        headers: { Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}' },
        body: { recordId: '{{record_id}}' },
      },
      {
        step: 2,
        app: 'slack',
        event: 'send_channel_message',
        channel: '#qa-alerts',
        channelId: 'C06QA01',
        message: '⚠️ *Missed Call Alert*\n*Phone:* {{phone}}\n*Reason:* {{failure_reason}}\n*Agent:* {{agent_name}}\nRetry scheduled in 48h.',
      },
      {
        step: 3,
        app: 'airtable',
        event: 'update_record',
        table: 'Missed/Failed Calls',
        tableId: 'tblWW25r6GmsQe3mQ',
        fields: { 'Retry Status': 'Scheduled', 'Retry Date': '{{now + 48h}}' },
      },
    ],
    webhookEndpoint: '/v1/workflows/wf5',
    slackChannel: '#qa-alerts',
    slackChannelId: 'C06QA01',
  },

  // ── WF-6: Campaign Analytics → Daily Digest ──────────────────────────────
  {
    id: 'WF-6',
    name: 'Daily Campaign Digest → Slack + Email',
    status: 'on',
    description: 'Every day at 7 PM ET, compile campaign analytics from Airtable, generate an AI summary, and post to #campaign-ops + email to stakeholders.',
    trigger: {
      app: 'schedule',
      event: 'every_day',
      time: '19:00',
      timezone: 'America/New_York',
    },
    filter: null,
    actions: [
      {
        step: 1,
        app: 'webhook',
        event: 'post',
        url: 'https://ck-api-gateway.<ACCOUNT>.workers.dev/v1/workflows/wf6',
        method: 'POST',
        headers: { Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}' },
        body: { date: '{{today}}' },
      },
      {
        step: 2,
        app: 'slack',
        event: 'send_channel_message',
        channel: '#campaign-ops',
        channelId: 'C06CAMP01',
        message: '📊 *Daily Campaign Digest — {{today}}*\n{{digest_summary}}',
      },
      {
        step: 3,
        app: 'gmail',
        event: 'send_email',
        to: 'david@coastalkey-pm.com',
        subject: 'CK Daily Campaign Digest — {{today}}',
        body: '{{digest_full_report}}',
      },
    ],
    webhookEndpoint: '/v1/workflows/wf6',
    slackChannel: '#campaign-ops',
    slackChannelId: 'C06CAMP01',
  },

  // ── WF-7: Foundation Fundraising → Donor Pipeline ────────────────────────
  {
    id: 'WF-7',
    name: 'Foundation Donation → Donor Pipeline + Thank You',
    status: 'on',
    description: 'When a new donation record is created (via GoFundMe webhook, website form, or manual entry), log the donor, send a thank-you email, update the live dashboard, and notify #foundation.',
    trigger: {
      app: 'webhook',
      event: 'catch_hook',
      webhookPath: '/v1/webhooks/donation',
    },
    filter: {
      field: 'amount',
      condition: 'greater_than',
      value: 0,
    },
    actions: [
      {
        step: 1,
        app: 'webhook',
        event: 'post',
        url: 'https://ck-api-gateway.<ACCOUNT>.workers.dev/v1/workflows/wf7',
        method: 'POST',
        headers: { Authorization: 'Bearer {{WORKER_AUTH_TOKEN}}' },
        body: {
          donorName: '{{donor_name}}',
          amount: '{{amount}}',
          email: '{{donor_email}}',
          campaign: '{{campaign_name}}',
          source: '{{source}}',
        },
      },
      {
        step: 2,
        app: 'airtable',
        event: 'create_record',
        table: 'Foundation Donors',
        baseId: 'appUSnNgpDkcEOzhN',
        fields: {
          'Donor Name': '{{donor_name}}',
          'Amount': '{{amount}}',
          'Email': '{{donor_email}}',
          'Campaign': '{{campaign_name}}',
          'Source': '{{source}}',
          'Date': '{{now}}',
        },
      },
      {
        step: 3,
        app: 'gmail',
        event: 'send_email',
        to: '{{donor_email}}',
        from: 'foundation@coastalkey-pm.com',
        subject: 'Thank you for supporting Coastal Key Foundation',
        body: '{{thank_you_email_body}}',
      },
      {
        step: 4,
        app: 'slack',
        event: 'send_channel_message',
        channel: '#foundation',
        channelId: 'C06FND01',
        message: '🎉 *New Donation!*\n*Donor:* {{donor_name}}\n*Amount:* ${{amount}}\n*Campaign:* {{campaign_name}}\n*Source:* {{source}}',
      },
    ],
    webhookEndpoint: '/v1/workflows/wf7',
    slackChannel: '#foundation',
    slackChannelId: 'C06FND01',
  },
];

// ── Slack Channel Registry ──────────────────────────────────────────────────

export const SLACK_CHANNELS = {
  'sales-alerts':    { id: 'C06SALES01', name: '#sales-alerts',    purpose: 'Lead battle plans, nurture enrollments' },
  'investor-alerts': { id: 'C06INV01',   name: '#investor-alerts', purpose: 'Investor escalations' },
  'qa-alerts':       { id: 'C06QA01',    name: '#qa-alerts',       purpose: 'Missed/failed call alerts' },
  'campaign-ops':    { id: 'C06CAMP01',  name: '#campaign-ops',    purpose: 'Daily campaign digests' },
  'marketing':       { id: 'C06MKT01',   name: '#marketing',       purpose: 'Content publishing notifications' },
  'foundation':      { id: 'C06FND01',   name: '#foundation',      purpose: 'Foundation donations and fundraising' },
};

// ── Buffer Social Profile Config ────────────────────────────────────────────

export const BUFFER_PROFILES = {
  instagram: {
    platform: 'instagram',
    type: 'business',
    handle: '@coastalkeypm',
    profileId: null, // Set after Buffer OAuth connection
  },
  facebook: {
    platform: 'facebook',
    type: 'page',
    name: 'Coastal Key Property Management',
    profileId: null,
  },
  linkedin: {
    platform: 'linkedin',
    type: 'company',
    name: 'Coastal Key Property Management LLC',
    profileId: null,
  },
};

export default ZAPIER_WORKFLOWS;
