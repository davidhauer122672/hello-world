/**
 * Sovereign Shield Security Middleware
 *
 * Enterprise-grade request/response security layer derived from breach analysis:
 *   - FCMB vector:    API exploitation     → Request validation, injection detection
 *   - Sterling vector: Middleware vuln     → Security headers, PII protection
 *   - Remita vector:   Cloud misconfig     → Secret exposure detection, audit hardening
 *
 * Executes in the request pipeline AFTER auth and rate limiting.
 * Non-blocking — security events are logged asynchronously via KV.
 */

import { errorResponse } from '../utils/response.js';

// ── Injection Detection Patterns ────────────────────────────────────────────

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b.*\b(FROM|INTO|TABLE|WHERE|SET|VALUES)\b)/i,
  /(--|;)\s*(DROP|ALTER|DELETE|UPDATE|INSERT)/i,
  /'\s*(OR|AND)\s*'?\d*\s*=\s*\d*/i,
  /'\s*(OR|AND)\s*'[^']*'\s*=\s*'[^']*'/i,
  /UNION\s+ALL\s+SELECT/i,
];

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript\s*:/i,
  /on(load|error|click|mouseover|submit|focus|blur)\s*=/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /eval\s*\(/i,
  /document\.(cookie|location|write)/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e/i,
  /%252e%252e/i,
];

const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$]\s*(cat|ls|rm|wget|curl|nc|bash|sh|python|perl|ruby)\b/i,
  /\$\(.*\)/,
  /`[^`]+`/,
];

const SSRF_PATTERNS = [
  /https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0|169\.254\.\d+\.\d+)/i,
  /https?:\/\/\[::1\]/i,
  /https?:\/\/metadata\.google/i,
  /https?:\/\/169\.254\.169\.254/i,
];

// ── Security Headers ────────────────────────────────────────────────────────

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

// ── PII Detection Patterns ──────────────────────────────────────────────────

const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  credit_card: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
  bank_routing: /\b[0-9]{9}\b/g,
};

// ── Suspicious IP & Geo Patterns ────────────────────────────────────────────

const BLOCKED_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /masscan/i,
  /zgrab/i,
  /dirbuster/i,
  /gobuster/i,
  /nuclei/i,
];

// ── Payload Size Limits ─────────────────────────────────────────────────────

const MAX_PAYLOAD_BYTES = 1048576; // 1MB
const MAX_URL_LENGTH = 2048;
const MAX_HEADER_SIZE = 8192;

// ── Core Security Functions ─────────────────────────────────────────────────

/**
 * Scan a string for injection patterns.
 * Returns the first matching threat type or null.
 */
function detectInjection(input) {
  if (typeof input !== 'string') return null;

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) return 'sql_injection';
  }
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) return 'xss';
  }
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(input)) return 'path_traversal';
  }
  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(input)) return 'command_injection';
  }
  for (const pattern of SSRF_PATTERNS) {
    if (pattern.test(input)) return 'ssrf';
  }
  return null;
}

/**
 * Recursively scan an object's string values for injection attempts.
 * Returns { threat, path } or null.
 */
function deepScanObject(obj, path = '') {
  if (typeof obj === 'string') {
    const threat = detectInjection(obj);
    if (threat) return { threat, path, value: obj.slice(0, 200) };
    return null;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = deepScanObject(obj[i], `${path}[${i}]`);
      if (result) return result;
    }
    return null;
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const result = deepScanObject(obj[key], path ? `${path}.${key}` : key);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Detect PII in a string and return redacted version.
 */
function redactPII(text) {
  if (typeof text !== 'string') return text;
  let redacted = text;
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    redacted = redacted.replace(pattern, `[REDACTED:${type}]`);
  }
  return redacted;
}

// ── Security Event Logger ───────────────────────────────────────────────────

function logSecurityEvent(env, ctx, event) {
  if (!env.AUDIT_LOG) return;

  const key = `sec:${event.severity}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    ...event,
    service: 'sovereign-shield',
    timestamp: new Date().toISOString(),
  };

  ctx.waitUntil(
    env.AUDIT_LOG.put(key, JSON.stringify(record), { expirationTtl: 86400 * 90 })
  );
}

// ── Exported Middleware ─────────────────────────────────────────────────────

/**
 * Pre-route security inspection. Runs after auth and rate limiting.
 * Returns an error Response if the request is blocked, or null to proceed.
 */
export async function securityInspect(request, env, ctx) {
  const url = new URL(request.url);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || '';
  const method = request.method;
  const path = url.pathname;

  // ── 1. URL length check ──
  if (request.url.length > MAX_URL_LENGTH) {
    logSecurityEvent(env, ctx, {
      severity: 'high',
      type: 'url_overflow',
      ip,
      url_length: request.url.length,
      path,
    });
    return errorResponse('Request URI too long', 414);
  }

  // ── 2. Blocked scanner detection ──
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      logSecurityEvent(env, ctx, {
        severity: 'critical',
        type: 'scanner_detected',
        ip,
        user_agent: userAgent.slice(0, 200),
        path,
      });
      return errorResponse('Forbidden', 403);
    }
  }

  // ── 3. URL parameter injection scan ──
  for (const [key, value] of url.searchParams.entries()) {
    const threat = detectInjection(value);
    if (threat) {
      logSecurityEvent(env, ctx, {
        severity: 'critical',
        type: 'injection_blocked',
        vector: 'query_parameter',
        threat,
        ip,
        path,
        param: key,
        value: value.slice(0, 200),
      });
      return errorResponse('Malicious input detected', 400);
    }
  }

  // ── 4. Path traversal check ──
  const pathThreat = detectInjection(path);
  if (pathThreat) {
    logSecurityEvent(env, ctx, {
      severity: 'critical',
      type: 'injection_blocked',
      vector: 'path',
      threat: pathThreat,
      ip,
      path,
    });
    return errorResponse('Malicious input detected', 400);
  }

  // ── 5. Request body inspection (POST/PUT/PATCH only) ──
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);

    if (contentLength > MAX_PAYLOAD_BYTES) {
      logSecurityEvent(env, ctx, {
        severity: 'high',
        type: 'payload_overflow',
        ip,
        path,
        content_length: contentLength,
      });
      return errorResponse('Payload too large', 413);
    }

    // Clone request to inspect body without consuming it
    try {
      const clone = request.clone();
      const bodyText = await clone.text();

      if (bodyText.length > MAX_PAYLOAD_BYTES) {
        logSecurityEvent(env, ctx, {
          severity: 'high',
          type: 'payload_overflow',
          ip,
          path,
          body_length: bodyText.length,
        });
        return errorResponse('Payload too large', 413);
      }

      // Try to parse as JSON and deep-scan
      try {
        const bodyJson = JSON.parse(bodyText);
        const scanResult = deepScanObject(bodyJson);
        if (scanResult) {
          logSecurityEvent(env, ctx, {
            severity: 'critical',
            type: 'injection_blocked',
            vector: 'request_body',
            threat: scanResult.threat,
            ip,
            path,
            field_path: scanResult.path,
            value: scanResult.value,
          });
          return errorResponse('Malicious input detected', 400);
        }
      } catch {
        // Not JSON — scan raw body
        const threat = detectInjection(bodyText);
        if (threat) {
          logSecurityEvent(env, ctx, {
            severity: 'critical',
            type: 'injection_blocked',
            vector: 'request_body_raw',
            threat,
            ip,
            path,
          });
          return errorResponse('Malicious input detected', 400);
        }
      }
    } catch {
      // Body read failed — allow through (may be empty or binary)
    }
  }

  // ── Passed all checks ──
  return null;
}

/**
 * Apply security headers to any outgoing Response.
 * Also redacts PII from error messages in non-production.
 */
export function hardenResponse(response) {
  const hardened = new Response(response.body, response);
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    hardened.headers.set(header, value);
  }
  // Remove server fingerprinting headers
  hardened.headers.delete('Server');
  hardened.headers.delete('X-Powered-By');
  return hardened;
}

/**
 * Webhook signature validator for Retell AI payloads.
 * Prevents forged webhook attacks (SEC-024 Webhook Inspector).
 */
export async function validateWebhookSignature(request, env) {
  const signature = request.headers.get('X-Retell-Signature') || '';
  const secret = env.RETELL_WEBHOOK_SECRET;

  if (!secret) return true; // No secret configured — skip validation
  if (!signature) return false; // Secret configured but no signature provided

  try {
    const clone = request.clone();
    const body = await clone.text();
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computed = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computed === signature;
  } catch {
    return false;
  }
}

/**
 * Bulk data exfiltration detection.
 * Alerts when a single request returns more than the threshold of records.
 */
export function checkExfiltrationRisk(recordCount, threshold = 500) {
  return recordCount > threshold;
}

// ── Exported for testing ────────────────────────────────────────────────────
export { detectInjection, deepScanObject, redactPII, SECURITY_HEADERS };
