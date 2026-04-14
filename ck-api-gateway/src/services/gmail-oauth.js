/**
 * Gmail OAuth 2.0 Service — Coastal Key Enterprise Email Worker
 *
 * Replaces SMTP-based email delivery with Gmail API via OAuth 2.0.
 * Supports sending, drafting, and reading email through the business
 * Gmail account with proper OAuth token management.
 *
 * Required Cloudflare Worker Secrets:
 *   GOOGLE_CLIENT_ID      — OAuth 2.0 client ID (Google Cloud Console)
 *   GOOGLE_CLIENT_SECRET   — OAuth 2.0 client secret
 *   GMAIL_REFRESH_TOKEN    — Long-lived refresh token for offline access
 *   GMAIL_FROM_ADDRESS     — Authorized sender address (e.g., ceo@coastalkey-pm.com)
 *
 * Token flow: refresh_token → access_token (cached 50 min in KV)
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

/**
 * Get a valid Gmail access token, using KV cache when possible.
 * Refreshes automatically when expired.
 */
export async function getAccessToken(env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN) {
    throw new Error('Gmail OAuth secrets not configured. Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN');
  }

  // Check KV cache first (tokens valid ~60 min, we cache 50 min)
  if (env.CACHE) {
    const cached = await env.CACHE.get('gmail:access_token');
    if (cached) return cached;
  }

  // Refresh the token
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail token refresh failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  const accessToken = data.access_token;

  // Cache for 50 minutes (tokens expire at 60 min)
  if (env.CACHE) {
    await env.CACHE.put('gmail:access_token', accessToken, { expirationTtl: 3000 });
  }

  return accessToken;
}

/**
 * Build a RFC 2822 MIME email message and Base64url encode it.
 */
function buildMimeMessage({ to, from, subject, body, cc, bcc, replyTo, isHtml = true }) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const contentType = isHtml ? 'text/html' : 'text/plain';

  let headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
  ];

  if (cc) headers.push(`Cc: ${cc}`);
  if (bcc) headers.push(`Bcc: ${bcc}`);
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);

  headers.push(`Content-Type: ${contentType}; charset=utf-8`);
  headers.push('');
  headers.push(body);

  const raw = headers.join('\r\n');

  // Base64url encode (Gmail API requirement)
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email via Gmail API.
 * @returns {object} — Gmail message resource (id, threadId, labelIds)
 */
export async function sendEmail(env, { to, subject, body, cc, bcc, replyTo, isHtml = true }) {
  const accessToken = await getAccessToken(env);
  const from = env.GMAIL_FROM_ADDRESS || 'ceo@coastalkey-pm.com';

  const raw = buildMimeMessage({ to, from, subject, body, cc, bcc, replyTo, isHtml });

  const response = await fetch(`${GMAIL_API}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail send failed (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Create a draft email (does not send).
 * @returns {object} — Gmail draft resource
 */
export async function createDraft(env, { to, subject, body, cc, bcc, replyTo, isHtml = true }) {
  const accessToken = await getAccessToken(env);
  const from = env.GMAIL_FROM_ADDRESS || 'ceo@coastalkey-pm.com';

  const raw = buildMimeMessage({ to, from, subject, body, cc, bcc, replyTo, isHtml });

  const response = await fetch(`${GMAIL_API}/drafts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: { raw } }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail draft creation failed (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Get Gmail profile info (email address, messages total, threads total).
 * Useful for health checks and verifying OAuth is working.
 */
export async function getProfile(env) {
  const accessToken = await getAccessToken(env);

  const response = await fetch(`${GMAIL_API}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gmail profile fetch failed (${response.status}): ${err}`);
  }

  return response.json();
}

/**
 * Check Gmail OAuth health — returns status object.
 */
export async function checkHealth(env) {
  try {
    const profile = await getProfile(env);
    return {
      status: 'ok',
      emailAddress: profile.emailAddress,
      messagesTotal: profile.messagesTotal,
      threadsTotal: profile.threadsTotal,
    };
  } catch (err) {
    return {
      status: 'error',
      error: err.message,
    };
  }
}
