/**
 * Email Operations Routes — Gmail OAuth Integration
 *
 * Production email delivery via Gmail API with OAuth 2.0.
 * Replaces SMTP-based delivery with authenticated Gmail access.
 *
 *   POST /v1/email/send           — Send email via Gmail API
 *   POST /v1/email/draft          — Create draft (does not send)
 *   GET  /v1/email/oauth/health   — Gmail OAuth connectivity check
 */

import { sendEmail, createDraft, checkHealth } from '../services/gmail-oauth.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── POST /v1/email/send ────────────────────────────────────────────────────

export async function handleEmailSend(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { to, subject, body: emailBody, cc, bcc, replyTo, isHtml = true } = body;

  if (!to || !subject || !emailBody) {
    return errorResponse('Fields "to", "subject", and "body" are required.', 400);
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return errorResponse('Invalid "to" email address format.', 400);
  }

  try {
    const result = await sendEmail(env, { to, subject, body: emailBody, cc, bcc, replyTo, isHtml });

    writeAudit(env, ctx, {
      route: '/v1/email/send',
      action: 'gmail-email-sent',
      to,
      subject,
      messageId: result.id,
      threadId: result.threadId,
    });

    return jsonResponse({
      status: 'sent',
      provider: 'Gmail API (OAuth 2.0)',
      messageId: result.id,
      threadId: result.threadId,
      to,
      subject,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    writeAudit(env, ctx, {
      route: '/v1/email/send',
      action: 'gmail-send-failed',
      to,
      error: err.message,
    });

    return errorResponse(`Email send failed: ${err.message}`, 500);
  }
}

// ── POST /v1/email/draft ───────────────────────────────────────────────────

export async function handleEmailDraft(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { to, subject, body: emailBody, cc, bcc, replyTo, isHtml = true } = body;

  if (!to || !subject || !emailBody) {
    return errorResponse('Fields "to", "subject", and "body" are required.', 400);
  }

  try {
    const result = await createDraft(env, { to, subject, body: emailBody, cc, bcc, replyTo, isHtml });

    writeAudit(env, ctx, {
      route: '/v1/email/draft',
      action: 'gmail-draft-created',
      to,
      subject,
      draftId: result.id,
    });

    return jsonResponse({
      status: 'drafted',
      provider: 'Gmail API (OAuth 2.0)',
      draftId: result.id,
      messageId: result.message?.id,
      to,
      subject,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Draft creation failed: ${err.message}`, 500);
  }
}

// ── GET /v1/email/oauth/health ─────────────────────────────────────────────

export async function handleEmailOAuthHealth(env) {
  try {
    const health = await checkHealth(env);

    return jsonResponse({
      service: 'Gmail OAuth 2.0',
      ...health,
      secrets: {
        GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!env.GOOGLE_CLIENT_SECRET,
        GMAIL_REFRESH_TOKEN: !!env.GMAIL_REFRESH_TOKEN,
        GMAIL_FROM_ADDRESS: env.GMAIL_FROM_ADDRESS || 'not configured',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return jsonResponse({
      service: 'Gmail OAuth 2.0',
      status: 'error',
      error: err.message,
      secrets: {
        GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!env.GOOGLE_CLIENT_SECRET,
        GMAIL_REFRESH_TOKEN: !!env.GMAIL_REFRESH_TOKEN,
        GMAIL_FROM_ADDRESS: env.GMAIL_FROM_ADDRESS || 'not configured',
      },
      timestamp: new Date().toISOString(),
    }, 503);
  }
}
