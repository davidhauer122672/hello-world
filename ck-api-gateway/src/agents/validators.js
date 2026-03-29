/**
 * Webhook Signature Verification & Request Validation
 *
 * Prevents spoofed webhooks from creating fake leads or call records.
 * Uses HMAC-SHA256 for Retell webhook signature verification.
 */

/**
 * Verify a Retell webhook signature using HMAC-SHA256.
 *
 * @param {string} payload    — Raw request body string
 * @param {string} signature  — Value of the x-retell-signature header
 * @param {string} secret     — RETELL_WEBHOOK_SECRET from env
 * @returns {Promise<boolean>} true if valid
 */
export async function verifyRetellSignature(payload, signature, secret) {
  if (!signature || !secret) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expected = Array.from(new Uint8Array(mac))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(expected, signature);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison.
 * Prevents timing attacks on signature verification.
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Validate required fields in a request body.
 *
 * @param {object} body           — Parsed request body
 * @param {string[]} requiredFields — List of required field names
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequiredFields(body, requiredFields) {
  const missing = [];
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field);
    }
  }
  return { valid: missing.length === 0, missing };
}

/**
 * Validate that a value is one of the allowed options.
 *
 * @param {string} value   — Value to check
 * @param {string[]} allowed — List of allowed values
 * @returns {boolean}
 */
export function validateEnum(value, allowed) {
  return allowed.includes(value);
}

/**
 * Sanitize a string field: trim, limit length, strip control characters.
 *
 * @param {string} str     — Input string
 * @param {number} maxLen  — Maximum allowed length (default 10000)
 * @returns {string}
 */
export function sanitizeString(str, maxLen = 10000) {
  if (typeof str !== 'string') return '';
  // Remove control characters except newlines and tabs
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Validate a phone number format (basic US format check).
 *
 * @param {string} phone — Phone number string
 * @returns {boolean}
 */
export function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/**
 * Validate an email address format (basic check).
 *
 * @param {string} email — Email string
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
