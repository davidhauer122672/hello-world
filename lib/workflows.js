/**
 * Coastal Key — Workflow Engine
 * Native Node.js workflow engine — 7 automated pipelines.
 * Receives webhooks from Airtable automations and executes
 * downstream actions: email, SMS, Buffer, AI generation, record updates.
 *
 * WF-1: New Lead Nurture
 * WF-2: Social Approval → Buffer
 * WF-3: Investor Escalation
 * WF-4: Buffer Published → Airtable
 * WF-5: Video Brief → Production
 * WF-6: Podcast Publish
 * WF-7: AI Log Write
 */

const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { sendSMS } = require('./sms');
const { approvePost, getPostsByStatus } = require('./social-publisher');
const { generateSocialBrief, generateThumbnailBrief } = require('./visual-generator');

// ─────────────────────────────────────────────────────────────────
// Email transporter with graceful degradation
// ─────────────────────────────────────────────────────────────────

const SMTP_CONFIGURED = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

const transporter = SMTP_CONFIGURED
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  : null;

async function sendEmail(to, subject, html) {
  if (!transporter) {
    console.warn('[workflow] SMTP not configured — email skipped');
    return false;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
  return true;
}

const FROM = process.env.EMAIL_FROM || process.env.SMTP_USER;
const CEO_EMAIL = process.env.CEO_EMAIL || 'ceo@coastalkey-pm.com';
const BUSINESS = 'Coastal Key Treasure Coast Asset Management';

// ─────────────────────────────────────────────────────────────────
// Workflow execution log (in-memory, also written via WF-7)
// ─────────────────────────────────────────────────────────────────

const executionLog = [];

function logExecution(workflow, input, output, status) {
  const entry = {
    workflow,
    timestamp: new Date().toISOString(),
    input: typeof input === 'object' ? JSON.stringify(input).substring(0, 500) : input,
    output: typeof output === 'object' ? JSON.stringify(output).substring(0, 500) : output,
    status,
  };
  executionLog.push(entry);
  if (executionLog.length > 500) executionLog.shift();
  console.log(`[workflow] ${workflow} → ${status}`);
  return entry;
}

function getExecutionLog(limit = 50) {
  return executionLog.slice(-limit).reverse();
}

// ─────────────────────────────────────────────────────────────────
// WF-1: New Lead Nurture
// Trigger: Airtable webhook when new record created in Leads table
// Actions: Generate SCAA-1 battle plan, email CEO, enroll in drip
// ─────────────────────────────────────────────────────────────────

async function wf1_newLeadNurture(payload) {
  const { leadName, email, phone, segment, propertyAddress, propertyValue, source } = payload;

  if (!leadName || !email) {
    return logExecution('WF-1', payload, 'Missing leadName or email', 'error');
  }

  const results = [];

  // Generate battle plan (always succeeds — no external dependency)
  const battlePlan = buildBattlePlan(leadName, segment, propertyAddress, propertyValue);
  results.push('battle_plan:ok');

  // Email CEO with lead alert
  try {
    await sendEmail(
      CEO_EMAIL,
      `New Lead: ${leadName} — ${segment || 'Unclassified'}`,
      buildLeadAlertEmail(leadName, email, phone, segment, propertyAddress, propertyValue, source, battlePlan),
    );
    results.push('email:sent');
  } catch (e) {
    console.warn('[WF-1] Email failed:', e.message);
    results.push('email:failed');
  }

  // Enroll in drip sequence
  try {
    const { enrollContact } = require('./drip-engine');
    enrollContact(email, leadName, segment || 'absentee_homeowners', 'wf1_auto');
    results.push('drip:enrolled');
  } catch (e) {
    console.warn('[WF-1] Drip enrollment skipped:', e.message);
    results.push('drip:skipped');
  }

  // SMS alert to owner
  try {
    await sendSMS(`NEW LEAD: ${leadName} | ${segment || 'N/A'} | ${propertyAddress || 'No address'} | Value: ${propertyValue || 'Unknown'}`);
    results.push('sms:sent');
  } catch (e) {
    console.warn('[WF-1] SMS failed:', e.message);
    results.push('sms:failed');
  }

  return logExecution('WF-1', payload, results.join(', '), 'success');
}

function buildBattlePlan(name, segment, address, value) {
  const hooks = {
    absentee_homeowners: 'Property sits vacant. Risk compounds daily without oversight.',
    luxury_1m_plus: 'Asset at this value requires institutional-grade documentation.',
    investor_family_office: 'Portfolio-level oversight that holds up under lender scrutiny.',
    seasonal_snowbirds: 'Highest-risk window is the months the property sits empty.',
    str_vacation_rental: 'Oversight gap between rental periods where damage sits undetected.',
  };

  return {
    lead: name,
    segment: segment || 'unclassified',
    hook: hooks[segment] || 'Your property deserves professional oversight.',
    address: address || 'TBD',
    value: value || 'TBD',
    nextAction: 'Schedule complimentary baseline inspection',
    urgency: value && parseFloat(String(value).replace(/[^0-9.]/g, '')) > 5000000 ? 'HIGH — Investor escalation recommended' : 'Standard',
  };
}

function buildLeadAlertEmail(name, email, phone, segment, address, value, source, battlePlan) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <h1 style="color:#1B2A4A;border-bottom:2px solid #D4A843;padding-bottom:10px;">${BUSINESS}</h1>
    <h2 style="color:#1B2A4A;">New Lead Alert</h2>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#F4F7FA;"><td style="padding:10px;font-weight:600;">Name</td><td style="padding:10px;">${name}</td></tr>
      <tr><td style="padding:10px;font-weight:600;">Email</td><td style="padding:10px;">${email}</td></tr>
      <tr style="background:#F4F7FA;"><td style="padding:10px;font-weight:600;">Phone</td><td style="padding:10px;">${phone || 'N/A'}</td></tr>
      <tr><td style="padding:10px;font-weight:600;">Segment</td><td style="padding:10px;">${segment || 'Unclassified'}</td></tr>
      <tr style="background:#F4F7FA;"><td style="padding:10px;font-weight:600;">Property</td><td style="padding:10px;">${address || 'N/A'}</td></tr>
      <tr><td style="padding:10px;font-weight:600;">Value</td><td style="padding:10px;">${value || 'N/A'}</td></tr>
      <tr style="background:#F4F7FA;"><td style="padding:10px;font-weight:600;">Source</td><td style="padding:10px;">${source || 'Direct'}</td></tr>
    </table>
    <div style="background:#1B2A4A;color:#fff;padding:16px;border-radius:4px;margin:16px 0;">
      <h3 style="color:#D4A843;margin:0 0 8px;">SCAA-1 Battle Plan</h3>
      <p style="margin:4px 0;"><strong>Hook:</strong> ${battlePlan.hook}</p>
      <p style="margin:4px 0;"><strong>Next Action:</strong> ${battlePlan.nextAction}</p>
      <p style="margin:4px 0;"><strong>Urgency:</strong> ${battlePlan.urgency}</p>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────
// WF-2: Social Approval → Buffer
// Trigger: Airtable webhook when Content Calendar Status = Approved
// Actions: Push to Buffer (via social-publisher), notify CEO
// ─────────────────────────────────────────────────────────────────

async function wf2_socialApproval(payload) {
  const { postId, caption, platform, scheduledFor } = payload;

  if (!postId) {
    return logExecution('WF-2', payload, 'Missing postId', 'error');
  }

  try {
    const result = await approvePost(postId);

    if (result.error) {
      return logExecution('WF-2', payload, result.error, 'error');
    }

    const status = result.status || 'approved';
    const mode = result.manualInstructions ? 'manual' : 'buffer';

    // Notify CEO
    await sendSMS(`SOCIAL: Post ${postId.substring(0, 8)} approved (${platform || 'unknown'}) → ${mode} mode, status: ${status}`);

    return logExecution('WF-2', payload, `Post ${postId} → ${status} (${mode})`, 'success');
  } catch (err) {
    return logExecution('WF-2', payload, err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────
// WF-3: Investor Escalation
// Trigger: Airtable webhook when Leads Investor Flag = true
// Actions: Email CEO with investor brief, SMS alert, create task
// ─────────────────────────────────────────────────────────────────

async function wf3_investorEscalation(payload) {
  const { leadName, email, phone, propertyValue, propertyAddress, segment } = payload;

  if (!leadName) {
    return logExecution('WF-3', payload, 'Missing leadName', 'error');
  }

  const results = [];

  // Urgent SMS
  try {
    await sendSMS(`INVESTOR ESCALATION: ${leadName} | Value: ${propertyValue || 'Unknown'} | ${propertyAddress || 'No address'} — 4hr follow-up required`);
    results.push('sms:sent');
  } catch (e) {
    console.warn('[WF-3] SMS failed:', e.message);
    results.push('sms:failed');
  }

  // CEO email with investor brief
  try {
    await sendEmail(CEO_EMAIL, `INVESTOR ESCALATION: ${leadName} — ${propertyValue || '$5M+'}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#1B2A4A;border-bottom:3px solid #dc2626;padding-bottom:10px;">INVESTOR ESCALATION</h1>
        <p style="font-size:16px;color:#1e293b;">High-value lead flagged for immediate CEO review.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#FEF2F2;"><td style="padding:12px;font-weight:600;">Lead</td><td style="padding:12px;">${leadName}</td></tr>
          <tr><td style="padding:12px;font-weight:600;">Email</td><td style="padding:12px;">${email || 'N/A'}</td></tr>
          <tr style="background:#FEF2F2;"><td style="padding:12px;font-weight:600;">Phone</td><td style="padding:12px;">${phone || 'N/A'}</td></tr>
          <tr><td style="padding:12px;font-weight:600;">Property Value</td><td style="padding:12px;font-weight:700;color:#dc2626;">${propertyValue || '$5M+'}</td></tr>
          <tr style="background:#FEF2F2;"><td style="padding:12px;font-weight:600;">Address</td><td style="padding:12px;">${propertyAddress || 'N/A'}</td></tr>
          <tr><td style="padding:12px;font-weight:600;">Segment</td><td style="padding:12px;">${segment || 'investor_family_office'}</td></tr>
        </table>
        <div style="background:#dc2626;color:#fff;padding:14px;border-radius:4px;text-align:center;font-weight:700;">
          FOLLOW-UP REQUIRED WITHIN 4 HOURS
        </div>
      </div>`
    );
    results.push('email:sent');
  } catch (e) {
    console.warn('[WF-3] Email failed:', e.message);
    results.push('email:failed');
  }

  return logExecution('WF-3', payload, results.join(', '), 'success');
}

// ─────────────────────────────────────────────────────────────────
// WF-4: Buffer Published → Airtable Status Update
// Handled by social-publisher.js startPublishTracker() cron
// This function is a manual trigger / webhook receiver
// ─────────────────────────────────────────────────────────────────

async function wf4_bufferPublished(payload) {
  const { postId, publishedAt } = payload;

  if (!postId) {
    return logExecution('WF-4', payload, 'Missing postId', 'error');
  }

  try {
    const { markPublished } = require('./social-publisher');
    const result = markPublished(postId);

    if (result.error) {
      return logExecution('WF-4', payload, result.error, 'error');
    }

    return logExecution('WF-4', payload, `Post ${postId} marked published`, 'success');
  } catch (err) {
    return logExecution('WF-4', payload, err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────
// WF-5: Video Brief → Production
// Trigger: Airtable webhook when Video Production Status = Approved
// Actions: Assemble production brief, generate thumbnail, notify
// ─────────────────────────────────────────────────────────────────

async function wf5_videoBriefToProduction(payload) {
  const { videoTitle, targetSegment, contentType, script, platforms } = payload;

  if (!videoTitle) {
    return logExecution('WF-5', payload, 'Missing videoTitle', 'error');
  }

  const results = [];

  // Generate thumbnail brief (no external dependency)
  const thumbnail = generateThumbnailBrief(videoTitle, targetSegment, contentType || 'educational');
  results.push('thumbnail:' + thumbnail.id.substring(0, 8));

  // Generate social briefs for each platform
  const briefs = [];
  const platformList = platforms || ['instagram', 'facebook'];
  for (const platform of platformList) {
    const brief = generateSocialBrief(`New video: ${videoTitle}`, platform, 'brand');
    briefs.push(brief);
  }
  results.push('briefs:' + briefs.length);

  // Notify CEO via SMS
  try {
    await sendSMS(`VIDEO APPROVED: "${videoTitle}" — Thumbnail brief + ${briefs.length} social briefs generated. Production ready.`);
    results.push('sms:sent');
  } catch (e) {
    console.warn('[WF-5] SMS failed:', e.message);
    results.push('sms:failed');
  }

  // Email production brief
  try {
    await sendEmail(CEO_EMAIL, `Production Brief: ${videoTitle}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#1B2A4A;">${BUSINESS}</h1>
        <h2 style="color:#D4A843;">Video Production Brief</h2>
        <p><strong>Title:</strong> ${videoTitle}</p>
        <p><strong>Segment:</strong> ${targetSegment || 'General'}</p>
        <p><strong>Type:</strong> ${contentType || 'Educational'}</p>
        <p><strong>Platforms:</strong> ${platformList.join(', ')}</p>
        <p><strong>Thumbnail Brief ID:</strong> ${thumbnail.id}</p>
        <p><strong>Social Briefs Generated:</strong> ${briefs.length}</p>
        ${script ? `<h3>Script</h3><pre style="background:#F4F7FA;padding:16px;border-radius:4px;white-space:pre-wrap;font-size:13px;">${script.substring(0, 2000)}</pre>` : ''}
      </div>`
    );
    results.push('email:sent');
  } catch (e) {
    console.warn('[WF-5] Email failed:', e.message);
    results.push('email:failed');
  }

  return logExecution('WF-5', payload, results.join(', '), 'success');
}

// ─────────────────────────────────────────────────────────────────
// WF-6: Podcast Publish
// Trigger: Airtable webhook when Podcast Production Status = Approved
// Actions: Push show notes to social, generate platform posts, notify
// ─────────────────────────────────────────────────────────────────

async function wf6_podcastPublish(payload) {
  const { episodeTitle, showNotes, targetSegment, platforms } = payload;

  if (!episodeTitle) {
    return logExecution('WF-6', payload, 'Missing episodeTitle', 'error');
  }

  try {
    // Create social drafts from show notes
    const { createDraft } = require('./social-publisher');
    const platformList = platforms || ['linkedin', 'facebook'];
    const drafts = [];

    for (const platform of platformList) {
      const caption = showNotes
        ? `New Episode: ${episodeTitle}\n\n${showNotes.substring(0, 300)}`
        : `New Episode: ${episodeTitle}`;
      const draft = createDraft(platform, caption, null, 'brand');
      if (!draft.error) drafts.push(draft);
    }

    // Notify CEO
    await sendSMS(`PODCAST APPROVED: "${episodeTitle}" — ${drafts.length} social drafts created. Ready for review.`);

    return logExecution('WF-6', payload, `${drafts.length} social drafts created for podcast "${episodeTitle}"`, 'success');
  } catch (err) {
    return logExecution('WF-6', payload, err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────
// WF-7: AI Log Write
// Trigger: Called after any AI inference (objection handler, etc.)
// Actions: Log to local file + optionally to Airtable via webhook
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const AI_LOG_PATH = path.join(__dirname, '..', 'data', 'ai-log.json');

function wf7_aiLogWrite(payload) {
  const { module, requestType, inputBrief, outputText, modelUsed } = payload;

  try {
    const dir = path.dirname(AI_LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let logs = [];
    try {
      if (fs.existsSync(AI_LOG_PATH)) {
        logs = JSON.parse(fs.readFileSync(AI_LOG_PATH, 'utf8'));
      }
    } catch { logs = []; }

    const entry = {
      id: require('crypto').randomUUID(),
      module: module || 'unknown',
      requestType: requestType || 'inference',
      inputBrief: (inputBrief || '').substring(0, 1000),
      outputText: (outputText || '').substring(0, 2000),
      modelUsed: modelUsed || 'claude-sonnet-4-20250514',
      timestamp: new Date().toISOString(),
      status: 'logged',
    };

    logs.push(entry);

    // Keep last 1000 entries
    if (logs.length > 1000) logs = logs.slice(-1000);

    fs.writeFileSync(AI_LOG_PATH, JSON.stringify(logs, null, 2));

    return logExecution('WF-7', { module, requestType }, `AI log entry ${entry.id}`, 'success');
  } catch (err) {
    return logExecution('WF-7', payload, err.message, 'error');
  }
}

function getAILog(limit = 50) {
  try {
    if (!fs.existsSync(AI_LOG_PATH)) return [];
    const logs = JSON.parse(fs.readFileSync(AI_LOG_PATH, 'utf8'));
    return logs.slice(-limit).reverse();
  } catch { return []; }
}

// ─────────────────────────────────────────────────────────────────
// Workflow Router — maps workflow names to handlers
// ─────────────────────────────────────────────────────────────────

const WORKFLOW_MAP = {
  'wf1': wf1_newLeadNurture,
  'wf2': wf2_socialApproval,
  'wf3': wf3_investorEscalation,
  'wf4': wf4_bufferPublished,
  'wf5': wf5_videoBriefToProduction,
  'wf6': wf6_podcastPublish,
  'wf7': wf7_aiLogWrite,
  'new-lead': wf1_newLeadNurture,
  'social-approval': wf2_socialApproval,
  'investor-escalation': wf3_investorEscalation,
  'buffer-published': wf4_bufferPublished,
  'video-production': wf5_videoBriefToProduction,
  'podcast-publish': wf6_podcastPublish,
  'ai-log': wf7_aiLogWrite,
};

async function executeWorkflow(workflowName, payload) {
  const handler = WORKFLOW_MAP[workflowName];
  if (!handler) {
    return logExecution(workflowName, payload, `Unknown workflow: ${workflowName}`, 'error');
  }
  return handler(payload);
}

// ─────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────

module.exports = {
  executeWorkflow,
  wf1_newLeadNurture,
  wf2_socialApproval,
  wf3_investorEscalation,
  wf4_bufferPublished,
  wf5_videoBriefToProduction,
  wf6_podcastPublish,
  wf7_aiLogWrite,
  getExecutionLog,
  getAILog,
  WORKFLOW_MAP,
};
