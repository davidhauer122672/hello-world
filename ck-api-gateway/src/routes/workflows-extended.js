/**
 * Extended Workflow Routes — WF-2, WF-5, WF-6, WF-7
 *
 * These complement the original workflows.js (SCAA-1, WF-3, WF-4)
 * and complete the full WF-1 through WF-7 nervous system.
 *
 *   POST /v1/workflows/wf2  — Approved Content → Buffer Social Publish
 *   POST /v1/workflows/wf5  — Missed Call → QA Alert + Auto-Retry
 *   POST /v1/workflows/wf6  — Daily Campaign Digest
 *   POST /v1/workflows/wf7  — Foundation Donation Pipeline
 *   POST /v1/webhooks/donation — Inbound donation webhook (public)
 */

import { inference } from '../services/anthropic.js';
import { createRecord, getRecord, updateRecord, listRecords, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const base = dateStr ? new Date(`${dateStr}T00:00:00Z`) : new Date();
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().split('T')[0];
}

function sendSlack(env, ctx, channel, text) {
  if (!env.SLACK_WEBHOOK_URL) return;
  ctx.waitUntil(
    fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text }),
    }).catch(err => console.error('Slack notification failed:', err))
  );
}

function validateRecordId(body) {
  if (!body || typeof body !== 'object') return '"recordId" is required.';
  if (!body.recordId || typeof body.recordId !== 'string') return '"recordId" is required.';
  if (!body.recordId.startsWith('rec')) return 'Invalid recordId. Must start with "rec".';
  return null;
}

// ── WF-2: Approved Content → Buffer Social Publish ─────────────────────────

/**
 * POST /v1/workflows/wf2
 *
 * Triggered when content in Content Calendar is marked "Approved".
 * Prepares the social media payload for Buffer publishing across
 * Instagram Business, Facebook Page, and LinkedIn Company Page.
 *
 * Body: { recordId: "recXXX" }
 */
export async function handleWf2ContentPublish(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateRecordId(body);
  if (validationError) return errorResponse(validationError, 400);

  const { recordId } = body;

  // 1. Fetch content record
  let record;
  try {
    record = await getRecord(env, TABLES.CONTENT_CALENDAR, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch content record: ${err.message}`, 502);
  }

  const fields = record.fields;
  const title = fields['Title'] || fields['Content Title'] || 'Untitled';
  const caption = fields['Caption'] || fields['Post Caption'] || '';
  const mediaUrl = fields['Media URL'] || fields['Image URL'] || null;
  const publishDate = fields['Publish Date'] || fields['Scheduled Date'] || today();
  const platform = fields['Platform'] || 'all';
  const status = fields['Status'];

  // 2. Verify status is Approved
  const statusValue = typeof status === 'object' && status !== null ? status.name : status;
  if (statusValue !== 'Approved') {
    return jsonResponse({ skipped: true, reason: `Status is "${statusValue}", not "Approved".` });
  }

  // 3. Generate optimized social copy via AI if caption is short
  let optimizedCaption = caption;
  if (caption.length < 50) {
    try {
      const aiResult = await inference(env, {
        system: 'You are a social media content specialist for Coastal Key Property Management, a luxury Treasure Coast property management company. Write engaging, professional social media captions.',
        prompt: `Write an engaging social media caption for this content:\nTitle: ${title}\nOriginal caption: ${caption}\nPlatform: ${platform}\n\nKeep it under 280 characters. Include relevant hashtags.`,
        tier: 'fast',
        maxTokens: 300,
        cacheKey: `wf2:${recordId}`,
        cacheTtl: 3600,
      });
      optimizedCaption = aiResult.content;
    } catch (err) {
      console.error('AI caption optimization failed, using original:', err);
    }
  }

  const timestamp = new Date().toISOString();

  // 4. Build Buffer payload for all three platforms
  const bufferPayload = {
    profiles: ['instagram_business', 'facebook_page', 'linkedin_company'],
    text: optimizedCaption,
    media: mediaUrl ? [{ link: mediaUrl }] : [],
    scheduledAt: publishDate,
    metadata: {
      source: 'ck-api-gateway',
      workflowId: 'WF-2',
      recordId,
      title,
    },
  };

  // 5. Update content record status to "Scheduled"
  ctx.waitUntil(
    updateRecord(env, TABLES.CONTENT_CALENDAR, recordId, {
      Status: { name: 'Scheduled' },
      'Buffer Payload': JSON.stringify(bufferPayload).slice(0, 10000),
    }).catch(err => console.error('Content record update failed:', err))
  );

  // 6. Log to AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Marketing: content_publish — ${title} — ${timestamp}`,
      'Module': { name: 'Marketing' },
      'Request Type': { name: 'content_publish' },
      'Input Brief': `Title: ${title}\nCaption: ${caption}`,
      'Output Text': optimizedCaption.slice(0, 10000),
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log creation failed:', err))
  );

  // 7. Slack notification
  sendSlack(env, ctx, '#marketing',
    `*CONTENT SCHEDULED:* ${title}\nPlatforms: Instagram, Facebook, LinkedIn\nPublish Date: ${publishDate}`
  );

  // 8. Audit
  writeAudit(env, ctx, {
    route: '/v1/workflows/wf2',
    action: 'content_publish',
    recordId,
    title,
    platforms: 'instagram,facebook,linkedin',
  });

  return jsonResponse({
    published: true,
    title,
    optimizedCaption,
    bufferPayload,
    publishDate,
  });
}

// ── WF-5: Missed/Failed Call → QA Alert + Auto-Retry ───────────────────────

/**
 * POST /v1/workflows/wf5
 *
 * Triggered when a new record lands in the Missed/Failed Calls table.
 * Alerts QA team, schedules a 48-hour auto-retry, and logs the event.
 *
 * Body: { recordId: "recXXX" }
 */
export async function handleWf5MissedCallRetry(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const validationError = validateRecordId(body);
  if (validationError) return errorResponse(validationError, 400);

  const { recordId } = body;

  // 1. Fetch missed call record
  let record;
  try {
    record = await getRecord(env, TABLES.MISSED_FAILED_CALLS, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch missed call record: ${err.message}`, 502);
  }

  const fields = record.fields;
  const phone = fields['Phone Number'] || fields['Phone'] || 'Unknown';
  const failureReason = fields['Failure Reason'] || fields['Disconnection Reason'] || 'Unknown';
  const agentName = fields['Agent Name'] || fields['Agent'] || 'Unknown';
  const callTime = fields['Call Time'] || fields['Timestamp'] || new Date().toISOString();

  const timestamp = new Date().toISOString();
  const retryDate = addDays(today(), 2); // 48 hours

  // 2. Create retry task
  let taskRecord;
  try {
    taskRecord = await createRecord(env, TABLES.TASKS, {
      'Task Name': `Auto-Retry Call: ${phone} — Failed: ${failureReason}`,
      'Type': { name: 'Auto-Retry' },
      'Priority': { name: 'Medium' },
      'Due Date': retryDate,
      'Status': { name: 'Not Started' },
    });
  } catch (err) {
    console.error('Retry task creation failed:', err);
    taskRecord = null;
  }

  // 3. Update missed call record with retry status
  ctx.waitUntil(
    updateRecord(env, TABLES.MISSED_FAILED_CALLS, recordId, {
      'Retry Status': 'Scheduled',
      'Retry Date': retryDate,
      'Retry Task': taskRecord ? [taskRecord.id] : undefined,
    }).catch(err => console.error('Missed call update failed:', err))
  );

  // 4. Slack QA alert
  sendSlack(env, ctx, '#qa-alerts', [
    `*MISSED CALL ALERT*`,
    `*Phone:* ${phone}`,
    `*Reason:* ${failureReason}`,
    `*Agent:* ${agentName}`,
    `*Time:* ${callTime}`,
    `*Retry:* Scheduled for ${retryDate}`,
  ].join('\n'));

  // 5. Audit
  writeAudit(env, ctx, {
    route: '/v1/workflows/wf5',
    action: 'missed_call_retry',
    recordId,
    phone,
    failureReason,
    retryDate,
  });

  return jsonResponse({
    retryScheduled: true,
    phone,
    failureReason,
    retryDate,
    taskId: taskRecord?.id || null,
  });
}

// ── WF-6: Daily Campaign Digest ────────────────────────────────────────────

/**
 * POST /v1/workflows/wf6
 *
 * Triggered daily at 7 PM ET by Zapier schedule. Compiles campaign
 * analytics, generates an AI summary, and posts to Slack + email.
 *
 * Body: { date: "YYYY-MM-DD" } (optional, defaults to today)
 */
export async function handleWf6DailyDigest(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const reportDate = body.date || today();
  const timestamp = new Date().toISOString();

  // 1. Fetch today's campaign analytics from Airtable
  let analyticsRecords = [];
  try {
    const result = await listRecords(env, 'TH Sentinel - Campaign Analytics', {
      filterByFormula: `IS_SAME({Date}, '${reportDate}', 'day')`,
      maxRecords: 50,
    });
    analyticsRecords = result.records || [];
  } catch (err) {
    console.error('Failed to fetch campaign analytics:', err);
  }

  // 2. Fetch today's call log
  let callRecords = [];
  try {
    const result = await listRecords(env, 'TH Sentinel - Call Log', {
      filterByFormula: `IS_SAME({Call Time}, '${reportDate}', 'day')`,
      maxRecords: 500,
    });
    callRecords = result.records || [];
  } catch (err) {
    console.error('Failed to fetch call log:', err);
  }

  // 3. Compute summary metrics
  const totalCalls = callRecords.length;
  const connectedCalls = callRecords.filter(r => {
    const dur = r.fields['Duration'] || r.fields['Call Duration'] || 0;
    return dur > 30;
  }).length;
  const connectionRate = totalCalls > 0 ? ((connectedCalls / totalCalls) * 100).toFixed(1) : '0.0';

  const metrics = {
    date: reportDate,
    totalCalls,
    connectedCalls,
    connectionRate: `${connectionRate}%`,
    analyticsRecords: analyticsRecords.length,
  };

  // 4. Generate AI digest summary
  let digestSummary = '';
  try {
    const aiResult = await inference(env, {
      system: 'You are a campaign operations analyst for Coastal Key Property Management. Generate concise, actionable daily campaign digest reports.',
      prompt: `Generate a daily campaign digest for ${reportDate}.\n\nMetrics:\n- Total Calls: ${totalCalls}\n- Connected Calls: ${connectedCalls}\n- Connection Rate: ${connectionRate}%\n- Analytics Records: ${analyticsRecords.length}\n\nProvide:\n1. Executive summary (2-3 sentences)\n2. Key highlights\n3. Areas needing attention\n4. Recommended actions for tomorrow`,
      tier: 'fast',
      maxTokens: 800,
      cacheKey: `wf6:${reportDate}`,
      cacheTtl: 86400,
    });
    digestSummary = aiResult.content;
  } catch (err) {
    digestSummary = `Daily digest for ${reportDate}: ${totalCalls} calls, ${connectedCalls} connected (${connectionRate}% rate).`;
    console.error('AI digest generation failed:', err);
  }

  // 5. Slack digest
  sendSlack(env, ctx, '#campaign-ops', [
    `*DAILY CAMPAIGN DIGEST — ${reportDate}*`,
    ``,
    `*Calls:* ${totalCalls} total | ${connectedCalls} connected | ${connectionRate}% rate`,
    ``,
    digestSummary,
  ].join('\n'));

  // 6. Prepare email payload
  const emailPayload = {
    to: 'david@coastalkey-pm.com',
    from: 'ops@coastalkey-pm.com',
    subject: `CK Daily Campaign Digest — ${reportDate}`,
    body: `Daily Campaign Digest — ${reportDate}\n\n${digestSummary}\n\nMetrics:\n- Total Calls: ${totalCalls}\n- Connected: ${connectedCalls}\n- Connection Rate: ${connectionRate}%`,
  };

  // 7. Log to AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Campaign: daily_digest — ${reportDate} — ${timestamp}`,
      'Module': { name: 'Campaign' },
      'Request Type': { name: 'daily_digest' },
      'Input Brief': JSON.stringify(metrics),
      'Output Text': digestSummary.slice(0, 10000),
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log creation failed:', err))
  );

  // 8. Audit
  writeAudit(env, ctx, {
    route: '/v1/workflows/wf6',
    action: 'daily_digest',
    date: reportDate,
    totalCalls,
    connectedCalls,
  });

  return jsonResponse({
    digest: true,
    date: reportDate,
    metrics,
    summary: digestSummary,
    emailPayload,
  });
}

// ── WF-7: Foundation Donation Pipeline ─────────────────────────────────────

/**
 * POST /v1/workflows/wf7
 *
 * Processes an inbound donation. Creates donor record, generates
 * thank-you email, updates live dashboard stats, and notifies #foundation.
 *
 * Body: {
 *   donorName: "Jane Doe",
 *   amount: 100,
 *   email: "jane@example.com",
 *   campaign: "CEO RISE Campaign",
 *   source: "gofundme",
 *   message: "Keep going!" (optional)
 * }
 */
export async function handleWf7DonationPipeline(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { donorName, amount, email, campaign, source, message } = body;

  if (!donorName || !amount || amount <= 0) {
    return errorResponse('donorName and a positive amount are required.', 400);
  }

  const timestamp = new Date().toISOString();
  const todayStr = today();

  // 1. Determine donor tier
  const tiers = [
    { name: 'Angel Partner', min: 5000 },
    { name: 'Visionary', min: 1000 },
    { name: 'Champion', min: 250 },
    { name: 'Advocate', min: 50 },
    { name: 'Supporter', min: 1 },
  ];
  const donorTier = tiers.find(t => amount >= t.min)?.name || 'Supporter';

  // 2. Create donation record in Airtable
  let donationRecord;
  try {
    donationRecord = await createRecord(env, 'Foundation Donations', {
      'Donor Name': donorName,
      'Amount': amount,
      'Email': email || '',
      'Campaign': campaign || 'General Fund',
      'Source': source || 'direct',
      'Donor Tier': { name: donorTier },
      'Date': todayStr,
      'Message': (message || '').slice(0, 5000),
      'Status': { name: 'Completed' },
    });
  } catch (err) {
    console.error('Donation record creation failed:', err);
    donationRecord = null;
  }

  // 3. Generate personalized thank-you email via AI
  let thankYouBody = '';
  const firstName = donorName.split(' ')[0] || donorName;
  try {
    const aiResult = await inference(env, {
      system: 'You are the Coastal Key Foundation communications director. Write warm, heartfelt thank-you emails to donors that make them feel valued and connected to the mission.',
      prompt: `Write a thank-you email for this donation:\n- Donor: ${donorName}\n- Amount: $${amount}\n- Tier: ${donorTier}\n- Campaign: ${campaign || 'General Fund'}\n- Message from donor: ${message || 'None'}\n\nKeep it personal, warm, and under 200 words. Mention their specific impact.`,
      tier: 'fast',
      maxTokens: 500,
      cacheKey: `wf7:thankyou:${donorTier}:${campaign}`,
      cacheTtl: 3600,
    });
    thankYouBody = aiResult.content;
  } catch (err) {
    thankYouBody = `Dear ${firstName},\n\nThank you for your generous $${amount} donation to the Coastal Key Foundation${campaign ? ` — ${campaign}` : ''}. Your support as a ${donorTier} directly fuels our mission of enterprise growth and international business development.\n\nWith gratitude,\nDavid Hauer\nCoastal Key Property Management`;
    console.error('AI thank-you generation failed:', err);
  }

  const emailPayload = {
    to: email || null,
    from: 'foundation@coastalkey-pm.com',
    subject: `Thank you, ${firstName} — Your impact at Coastal Key Foundation`,
    body: thankYouBody,
  };

  // 4. Update running totals in KV (for live dashboard)
  if (env.CACHE) {
    ctx.waitUntil((async () => {
      try {
        const statsKey = 'foundation:dashboard:stats';
        const existing = await env.CACHE.get(statsKey, 'json') || {
          totalRaised: 0,
          donorCount: 0,
          campaignTotals: {},
          lastDonation: null,
          lastUpdated: null,
        };
        existing.totalRaised = (existing.totalRaised || 0) + amount;
        existing.donorCount = (existing.donorCount || 0) + 1;
        const campKey = campaign || 'General Fund';
        existing.campaignTotals[campKey] = (existing.campaignTotals[campKey] || 0) + amount;
        existing.lastDonation = { donorName, amount, timestamp };
        existing.lastUpdated = timestamp;
        await env.CACHE.put(statsKey, JSON.stringify(existing), { expirationTtl: 86400 * 365 });
      } catch (err) {
        console.error('Dashboard stats update failed:', err);
      }
    })());
  }

  // 5. Slack notification
  sendSlack(env, ctx, '#foundation', [
    `*NEW DONATION!*`,
    `*Donor:* ${donorName}`,
    `*Amount:* $${amount.toLocaleString()}`,
    `*Tier:* ${donorTier}`,
    `*Campaign:* ${campaign || 'General Fund'}`,
    `*Source:* ${source || 'direct'}`,
    message ? `*Message:* "${message}"` : '',
  ].filter(Boolean).join('\n'));

  // 6. AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Foundation: donation — ${donorName} — $${amount} — ${timestamp}`,
      'Module': { name: 'Foundation' },
      'Request Type': { name: 'donation_processed' },
      'Input Brief': `${donorName}: $${amount} via ${source || 'direct'} for ${campaign || 'General Fund'}`,
      'Output Text': thankYouBody.slice(0, 10000),
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log creation failed:', err))
  );

  // 7. Audit
  writeAudit(env, ctx, {
    route: '/v1/workflows/wf7',
    action: 'donation_processed',
    donorName,
    amount,
    donorTier,
    campaign: campaign || 'General Fund',
    source: source || 'direct',
  });

  return jsonResponse({
    processed: true,
    donorName,
    amount,
    donorTier,
    donationId: donationRecord?.id || null,
    emailPayload,
  });
}

// ── Donation Webhook (Public) ──────────────────────────────────────────────

/**
 * POST /v1/webhooks/donation
 *
 * Public endpoint for inbound donation notifications from GoFundMe,
 * website forms, or other external sources. Validates and forwards
 * to WF-7 processing pipeline.
 *
 * Body: {
 *   donor_name: "Jane Doe",
 *   amount: 100,
 *   email: "jane@example.com",
 *   campaign: "CEO RISE Campaign",
 *   source: "gofundme",
 *   message: "optional message"
 * }
 */
export async function handleDonationWebhook(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  // Normalize field names (snake_case from external → camelCase internal)
  const normalized = {
    donorName: body.donor_name || body.donorName || body.name || 'Anonymous',
    amount: parseFloat(body.amount) || 0,
    email: body.email || body.donor_email || null,
    campaign: body.campaign || body.campaign_name || 'General Fund',
    source: body.source || body.platform || 'webhook',
    message: body.message || body.donor_message || '',
  };

  if (normalized.amount <= 0) {
    return errorResponse('Amount must be greater than 0.', 400);
  }

  // Create a synthetic request to pass to WF-7
  const syntheticRequest = {
    json: async () => normalized,
  };

  return handleWf7DonationPipeline(syntheticRequest, env, ctx);
}

// ── Foundation Dashboard Stats (Public) ────────────────────────────────────

/**
 * GET /v1/foundation/dashboard
 *
 * Returns live fundraising stats for the public website dashboard widget.
 * Reads from KV cache for fast response. No auth required.
 */
export async function handleFoundationDashboard(request, env) {
  const defaults = {
    totalRaised: 0,
    donorCount: 0,
    campaignTotals: {},
    lastDonation: null,
    lastUpdated: null,
    campaigns: [
      {
        id: 'RISE-001',
        name: 'CEO RISE Campaign',
        goal: 75000,
        raised: 0,
        donorCount: 0,
        status: 'active',
      },
    ],
  };

  if (!env.CACHE) {
    return jsonResponse(defaults);
  }

  try {
    const stats = await env.CACHE.get('foundation:dashboard:stats', 'json');
    return jsonResponse(stats || defaults);
  } catch (err) {
    console.error('Dashboard stats read failed:', err);
    return jsonResponse(defaults);
  }
}
