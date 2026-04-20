/**
 * Coastal Key Treasure Coast Asset Management
 * 90-Day Email Drip Nurture Engine
 *
 * Replaces Constant Contact with a local, self-hosted drip
 * sequence system. Stores subscriber state in a JSON flat file
 * and sends HTML emails via nodemailer on a cron schedule.
 */

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(__dirname, '..', 'data');
const SEQUENCES_FILE = path.join(DATA_DIR, 'drip-sequences.json');

const SMTP_CONFIGURED = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = SMTP_CONFIGURED
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.SMTP_USER;

const VALID_SEGMENTS = [
  'absentee_homeowners',
  'luxury_1m_plus',
  'investor_family_office',
  'seasonal_snowbirds',
  'str_vacation_rental',
];

// ---------------------------------------------------------------------------
// Branding constants
// ---------------------------------------------------------------------------

const BRAND = {
  company: 'Coastal Key Treasure Coast Asset Management',
  phone: '(772) 247-0982',
  web: 'www.coastalkey-pm.com',
  address: '1407 SE Legacy Cove Circle, Ste 100, Stuart, FL 34997',
  primaryColor: '#0B3D6B',
  accentColor: '#1A7AB5',
  lightBg: '#F4F7FA',
  darkText: '#1E293B',
  mutedText: '#64748B',
};

// ---------------------------------------------------------------------------
// 90-Day Drip Sequence Definition
// ---------------------------------------------------------------------------

const DRIP_SEQUENCE = [
  {
    day: 1,
    subject: 'Your vacant property is at risk right now',
    purpose: 'risk_awareness',
    buildHtml: (name, segment) => buildEmailShell(name, segment, {
      headline: 'Unmonitored Properties Lose Value Every Day',
      body: `
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Properties left unattended in South Florida deteriorate faster than most owners realize.
          Humidity alone can cause mold growth in under 72 hours. Add storm damage, pest intrusion,
          and plumbing failures, and the cost of neglect compounds quickly.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          The Treasure Coast sees an average of 14 insurance claims per week tied to unoccupied
          residential properties. Most of those claims involve damage that a routine inspection
          would have caught within days, not months.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Coastal Key provides scheduled property inspections, environmental monitoring, and
          documented condition reporting so you know the state of your asset at all times.
        </p>
        <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          Every week without oversight is a week where small problems become large liabilities.
        </p>
      `,
    }),
  },
  {
    day: 7,
    subject: 'How a $200 leak became a $47,000 remediation',
    purpose: 'case_study',
    buildHtml: (name, segment) => buildEmailShell(name, segment, {
      headline: 'Case Study: Stuart, FL Waterfront Home',
      body: `
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          A homeowner in Stuart left their waterfront property vacant for five months.
          A slow leak under the master bathroom went undetected. By the time a neighbor
          reported a musty smell, black mold had spread through the subfloor and into
          the HVAC ductwork.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Total remediation cost: $47,200. The original plumbing repair would have cost $200.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Coastal Key inspectors check plumbing access points, HVAC condensation lines, water
          heater pans, and appliance connections during every scheduled visit. We photograph
          and log every finding. If something needs attention, you know about it within hours.
        </p>
        <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          The cost of one inspection is less than the deductible on most homeowner policies.
          The cost of skipping it is unpredictable.
        </p>
      `,
    }),
  },
  {
    day: 14,
    subject: 'What Coastal Key does that other managers do not',
    purpose: 'service_overview',
    buildHtml: (name, segment) => buildEmailShell(name, segment, {
      headline: 'A Different Standard of Property Oversight',
      body: `
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Most property management companies focus on tenant placement and rent collection.
          Coastal Key focuses on asset protection. We built our service around the needs of
          owners who may not visit their property for months at a time.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 20px 0;">
          <tr style="background:${BRAND.lightBg};">
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;font-weight:600;">Scheduled Interior and Exterior Inspections</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;">Photo-documented condition reports delivered to your inbox</td>
          </tr>
          <tr style="background:${BRAND.lightBg};">
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;">Storm preparation and post-storm damage assessment</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;">Vendor coordination for repairs, landscaping, and pool care</td>
          </tr>
          <tr style="background:${BRAND.lightBg};">
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;">HVAC, plumbing, and electrical spot checks</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};">Insurance compliance documentation and key holding</td>
          </tr>
        </table>
        <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          Vacant property insurance often requires proof of regular inspections.
          Without documentation, a denied claim is a real possibility.
        </p>
      `,
    }),
  },
  {
    day: 30,
    subject: 'Hurricane season is approaching. Is your property prepared.',
    purpose: 'seasonal_urgency',
    buildHtml: (name, segment) => buildEmailShell(name, segment, {
      headline: 'Seasonal Risk Demands Proactive Planning',
      body: `
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          South Florida hurricane season runs from June 1 through November 30. Properties
          that sit vacant during this period face compounded risk: wind damage, flooding,
          debris impact, and extended power outages that disable dehumidification systems.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Coastal Key provides a pre-season hardening checklist for every property we manage.
          This includes shutter verification, landscaping clearance, generator testing, sump
          pump inspection, and emergency contact coordination with local contractors.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          After a storm, our team conducts rapid damage assessments and files preliminary
          reports before insurance adjusters arrive. Early documentation strengthens claims
          and accelerates payouts.
        </p>
        <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          Owners who wait until a storm is named to arrange property oversight find that
          every qualified vendor is already committed. Planning now prevents scrambling later.
        </p>
      `,
    }),
  },
  {
    day: 45,
    subject: 'What our clients say about Coastal Key oversight',
    purpose: 'social_proof',
    buildHtml: (name, segment) => buildEmailShell(name, segment, {
      headline: 'Trusted by Property Owners Across the Treasure Coast',
      body: `
        <div style="background:${BRAND.lightBg};border-left:4px solid ${BRAND.primaryColor};padding:20px;margin:0 0 20px 0;">
          <p style="margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-style:italic;">
            "We live in Connecticut and own two properties in Palm City. Before Coastal Key,
            we relied on neighbors to keep an eye on things. After a pipe burst went
            unnoticed for three weeks, we hired Coastal Key. Their inspection reports are
            thorough and their response time is exceptional."
          </p>
          <p style="margin:0;font-size:14px;color:${BRAND.mutedText};font-weight:600;">
            R. and M. Callahan, Palm City
          </p>
        </div>
        <div style="background:${BRAND.lightBg};border-left:4px solid ${BRAND.primaryColor};padding:20px;margin:0 0 20px 0;">
          <p style="margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-style:italic;">
            "I own a portfolio of six rental units on Hutchinson Island. Coastal Key handles
            the inspections between tenants and coordinates all turnover maintenance. They
            have saved me more in prevented damage than their entire annual fee."
          </p>
          <p style="margin:0;font-size:14px;color:${BRAND.mutedText};font-weight:600;">
            D. Weiss, Hutchinson Island
          </p>
        </div>
        <div style="background:${BRAND.lightBg};border-left:4px solid ${BRAND.primaryColor};padding:20px;margin:0 0 20px 0;">
          <p style="margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-style:italic;">
            "Our insurer required quarterly inspection documentation or they would not
            renew our vacant property rider. Coastal Key provided exactly what we needed,
            formatted to the insurer's specifications."
          </p>
          <p style="margin:0;font-size:14px;color:${BRAND.mutedText};font-weight:600;">
            J. Patel, Stuart
          </p>
        </div>
        <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          Property owners who delay professional oversight often discover problems only
          after they have become expensive. Our clients discover them early.
        </p>
      `,
    }),
  },
  {
    day: 60,
    subject: 'Your first property inspection is complimentary',
    purpose: 'pricing_transparency',
    buildHtml: (name, segment) => buildEmailShell(name, segment, {
      headline: 'Transparent Pricing. No Long-Term Contracts.',
      body: `
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Coastal Key offers your first full property inspection at no cost. There is no
          obligation and no contract required. We want you to see the quality of our
          reporting before you make any commitment.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 20px 0;border:1px solid #E2E8F0;">
          <tr style="background:${BRAND.primaryColor};">
            <td style="padding:14px 16px;font-size:15px;color:#FFFFFF;font-weight:600;">Service</td>
            <td style="padding:14px 16px;font-size:15px;color:#FFFFFF;font-weight:600;text-align:right;">Monthly</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;">Bi-weekly inspection (interior + exterior)</td>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;text-align:right;">$295/mo</td>
          </tr>
          <tr style="background:${BRAND.lightBg};">
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;">Weekly inspection (interior + exterior)</td>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;text-align:right;">$395/mo</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;">Storm response add-on</td>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};border-bottom:1px solid #E2E8F0;text-align:right;">$75/event</td>
          </tr>
          <tr style="background:${BRAND.lightBg};">
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};">Vendor coordination</td>
            <td style="padding:12px 16px;font-size:15px;color:${BRAND.darkText};text-align:right;">Included</td>
          </tr>
        </table>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          All plans include photo-documented reports, key holding, and direct access to your
          assigned property manager. No setup fees. Cancel with 30 days notice.
        </p>
        <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          A single undetected water leak will cost more than a full year of professional
          oversight. The complimentary inspection lets you evaluate our work with zero risk.
        </p>
      `,
    }),
  },
  {
    day: 90,
    subject: 'A personal invitation from our CEO',
    purpose: 'final_touch',
    buildHtml: (name, segment) => buildEmailShell(name, segment, {
      headline: 'A Direct Message from Our Leadership',
      body: `
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          ${name}, I wanted to reach out to you directly.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Over the past several weeks, we have shared information about the risks facing
          unmonitored properties on the Treasure Coast. We have shown you real cases, real
          costs, and the specific steps we take to prevent them.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          If you have been considering professional property oversight, I want to make the
          decision simple. Contact me directly at ${BRAND.phone} or reply to this email.
          I will personally arrange your complimentary first inspection and walk you through
          our reporting process.
        </p>
        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Our current pricing is locked through the end of the quarter. After that, rates
          will adjust to reflect increased demand during peak vacancy season.
        </p>
        <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          Properties do not wait for their owners to be ready. Deterioration follows its own
          schedule. The only question is whether you will know about it when it starts.
        </p>
        <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
          Regards,
        </p>
        <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};font-weight:600;">
          David Hauer<br>
          CEO, ${BRAND.company}
        </p>
      `,
    }),
  },
];

// ---------------------------------------------------------------------------
// Email HTML Shell
// ---------------------------------------------------------------------------

function buildEmailShell(name, segment, content) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.headline}</title>
</head>
<body style="margin:0;padding:0;background-color:#EAEEF3;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAEEF3;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:4px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.primaryColor};padding:28px 32px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:0.3px;">
                ${BRAND.company}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:700;color:${BRAND.primaryColor};">
                ${content.headline}
              </h2>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${BRAND.darkText};">
                ${name},
              </p>
              ${content.body}
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px 32px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND.accentColor};border-radius:4px;">
                    <a href="https://${BRAND.web}/contact"
                       style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#FFFFFF;text-decoration:none;">
                      Schedule Your Complimentary Inspection
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.lightBg};padding:24px 32px;border-top:1px solid #E2E8F0;">
              <p style="margin:0 0 4px 0;font-size:13px;color:${BRAND.mutedText};">
                ${BRAND.company}
              </p>
              <p style="margin:0 0 4px 0;font-size:13px;color:${BRAND.mutedText};">
                ${BRAND.address}
              </p>
              <p style="margin:0 0 12px 0;font-size:13px;color:${BRAND.mutedText};">
                ${BRAND.phone} | ${BRAND.web}
              </p>
              <p style="margin:0 0 0 0;font-size:12px;color:${BRAND.mutedText};">
                &copy; ${year} ${BRAND.company}. All rights reserved.<br>
                <a href="https://${BRAND.web}/unsubscribe" style="color:${BRAND.mutedText};text-decoration:underline;">
                  Unsubscribe from future emails
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Data persistence helpers
// ---------------------------------------------------------------------------

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSubscribers() {
  ensureDataDir();
  if (!fs.existsSync(SEQUENCES_FILE)) {
    fs.writeFileSync(SEQUENCES_FILE, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
  const raw = fs.readFileSync(SEQUENCES_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse drip-sequences.json, resetting:', e.message);
    return [];
  }
}

function saveSubscribers(subscribers) {
  ensureDataDir();
  fs.writeFileSync(SEQUENCES_FILE, JSON.stringify(subscribers, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Enroll a contact into the 90-day drip sequence.
 */
function enrollContact(email, name, segment, source) {
  if (!email || !name) {
    throw new Error('email and name are required');
  }

  const normalizedSegment = (segment || 'absentee_homeowners').toLowerCase().trim();
  if (!VALID_SEGMENTS.includes(normalizedSegment)) {
    throw new Error(`Invalid segment: ${segment}. Must be one of: ${VALID_SEGMENTS.join(', ')}`);
  }

  const subscribers = loadSubscribers();
  const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    if (existing.status === 'unsubscribed') {
      throw new Error('Contact has previously unsubscribed and cannot be re-enrolled');
    }
    if (existing.status === 'active') {
      return { message: 'Contact is already enrolled and active', subscriber: existing };
    }
    // If completed, allow re-enrollment
    existing.enrolledAt = new Date().toISOString();
    existing.lastSentDay = 0;
    existing.status = 'active';
    existing.segment = normalizedSegment;
    existing.source = source || 'manual';
    saveSubscribers(subscribers);
    return { message: 'Contact re-enrolled', subscriber: existing };
  }

  const subscriber = {
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    segment: normalizedSegment,
    enrolledAt: new Date().toISOString(),
    lastSentDay: 0,
    status: 'active',
    source: source || 'manual',
  };

  subscribers.push(subscriber);
  saveSubscribers(subscribers);
  return { message: 'Contact enrolled', subscriber };
}

/**
 * Process all active subscribers and send any emails that are due.
 */
async function processScheduledDrips() {
  const subscribers = loadSubscribers();
  const now = Date.now();
  let sent = 0;
  let errors = 0;

  for (const sub of subscribers) {
    if (sub.status !== 'active') continue;

    const enrolledMs = new Date(sub.enrolledAt).getTime();
    const daysSinceEnroll = Math.floor((now - enrolledMs) / (1000 * 60 * 60 * 24));

    // Find the next email that is due
    const nextEmail = DRIP_SEQUENCE.find(
      step => step.day > sub.lastSentDay && step.day <= daysSinceEnroll
    );

    if (!nextEmail) continue;

    try {
      if (!transporter) {
        console.log(`[drip] SMTP not configured — skipping email to ${sub.email}`);
        continue;
      }
      const html = nextEmail.buildHtml(sub.name, sub.segment);
      await transporter.sendMail({
        from: FROM_ADDRESS,
        to: sub.email,
        subject: nextEmail.subject,
        html,
      });

      sub.lastSentDay = nextEmail.day;
      console.log(`[drip] Sent Day ${nextEmail.day} email to ${sub.email}`);
      sent++;

      // Mark completed if this was the final email
      if (nextEmail.day === 90) {
        sub.status = 'completed';
        console.log(`[drip] Sequence completed for ${sub.email}`);
      }
    } catch (err) {
      console.error(`[drip] Failed to send Day ${nextEmail.day} to ${sub.email}:`, err.message);
      errors++;
    }
  }

  saveSubscribers(subscribers);
  return { processed: subscribers.filter(s => s.status === 'active').length, sent, errors };
}

/**
 * Unsubscribe a contact by email address.
 */
function unsubscribeContact(email) {
  if (!email) throw new Error('email is required');

  const subscribers = loadSubscribers();
  const sub = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());

  if (!sub) {
    return { message: 'Contact not found', unsubscribed: false };
  }

  if (sub.status === 'unsubscribed') {
    return { message: 'Contact is already unsubscribed', unsubscribed: false };
  }

  sub.status = 'unsubscribed';
  saveSubscribers(subscribers);
  return { message: 'Contact unsubscribed', unsubscribed: true };
}

/**
 * Get the drip status for a given email.
 */
function getDripStatus(email) {
  if (!email) throw new Error('email is required');

  const subscribers = loadSubscribers();
  const sub = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());

  if (!sub) {
    return null;
  }

  const enrolledMs = new Date(sub.enrolledAt).getTime();
  const daysSinceEnroll = Math.floor((Date.now() - enrolledMs) / (1000 * 60 * 60 * 24));

  const nextStep = DRIP_SEQUENCE.find(step => step.day > sub.lastSentDay);

  return {
    ...sub,
    daysSinceEnroll,
    nextEmailDay: nextStep ? nextStep.day : null,
    nextEmailPurpose: nextStep ? nextStep.purpose : null,
    daysUntilNextEmail: nextStep ? Math.max(0, nextStep.day - daysSinceEnroll) : null,
    totalEmailsInSequence: DRIP_SEQUENCE.length,
    emailsSent: DRIP_SEQUENCE.filter(s => s.day <= sub.lastSentDay).length,
  };
}

/**
 * Start the hourly cron job that processes scheduled drips.
 */
function startDripScheduler() {
  console.log('[drip] Scheduler started. Processing drips every hour.');
  cron.schedule('0 * * * *', async () => {
    console.log(`[drip] Running scheduled drip processing at ${new Date().toISOString()}`);
    try {
      const result = await processScheduledDrips();
      console.log(`[drip] Processing complete:`, result);
    } catch (err) {
      console.error('[drip] Scheduled processing failed:', err.message);
    }
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  enrollContact,
  processScheduledDrips,
  unsubscribeContact,
  getDripStatus,
  startDripScheduler,
};
