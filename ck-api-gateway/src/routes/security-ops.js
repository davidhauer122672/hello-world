/**
 * Sovereign Shield Security Operations Routes
 *
 *   GET  /v1/security/dashboard        — Security posture dashboard
 *   GET  /v1/security/events           — Recent security events from audit log
 *   POST /v1/security/scan             — On-demand security scan of a route/payload
 *   GET  /v1/security/agents           — List all SEC division agents
 *   GET  /v1/security/agents/:id       — Get single SEC agent
 *   GET  /v1/security/compliance       — Compliance status across all vectors
 *   POST /v1/security/incident         — Report a security incident
 *
 * All routes require Bearer auth. Security events logged with 90-day retention.
 */

import { detectInjection, deepScanObject, SECURITY_HEADERS } from '../middleware/security.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Security Configuration ──────────────────────────────────────────────────

const SECURITY_CONFIG = {
  framework: 'Sovereign Shield',
  version: '1.0.0',
  authorization_date: '2026-04-02',
  classification: 'Confidential — CSO Use Only',
  breach_vectors_addressed: [
    { vector: 'API Exploitation', reference: 'FCMB — ₦677M stolen via API manipulation', controls: ['Request validation', 'Injection detection', 'Rate limiting', 'Payload inspection', 'Schema enforcement'] },
    { vector: 'Middleware Vulnerability', reference: 'Sterling Bank — 900K+ PII records exfiltrated', controls: ['Security headers', 'PII detection/redaction', 'Session hardening', 'CORS enforcement', 'DLP monitoring'] },
    { vector: 'Cloud Misconfiguration', reference: 'Remita — 3TB+ leaked via public S3', controls: ['Config audit', 'Secret management', 'Access control', 'Encryption enforcement', 'Webhook signature validation'] },
  ],
};

const COMPLIANCE_FRAMEWORKS = [
  { id: 'TCPA', name: 'Telephone Consumer Protection Act', status: 'enforced', scope: 'Sentinel Sales Division — outbound calling' },
  { id: 'CCPA', name: 'California Consumer Privacy Act', status: 'enforced', scope: 'All PII handling — leads, clients, owners' },
  { id: 'SOC2-T1', name: 'SOC 2 Type I — Security', status: 'in_progress', scope: 'API gateway, data handling, access control' },
  { id: 'FL-RE', name: 'Florida Real Estate Data Protection', status: 'enforced', scope: 'Property data, owner PII, financial records' },
  { id: 'FL-CAM', name: 'Florida CAM License Compliance (HB 913)', status: 'enforced', scope: 'Management contracts, disclosure requirements' },
  { id: 'OWASP-10', name: 'OWASP Top 10 — 2025', status: 'enforced', scope: 'All API routes — injection, auth, SSRF, misconfiguration' },
  { id: 'PCI-DSS', name: 'PCI DSS v4.0 (Applicable Controls)', status: 'partial', scope: 'Payment-adjacent data handling — no direct card processing' },
];

const INCIDENT_SEVERITY_LEVELS = {
  critical: { sla_response: '15 minutes', sla_containment: '1 hour', escalation: 'CEO + CSO + Legal' },
  high: { sla_response: '1 hour', sla_containment: '4 hours', escalation: 'CSO + TEC Division Lead' },
  medium: { sla_response: '4 hours', sla_containment: '24 hours', escalation: 'CSO' },
  low: { sla_response: '24 hours', sla_containment: '72 hours', escalation: 'Security Team' },
};

const ACTIVE_CONTROLS = [
  // API Security (FCMB Vector)
  { id: 'CTL-001', name: 'Bearer Token Auth', layer: 'api', status: 'active', agent: 'SEC-004' },
  { id: 'CTL-002', name: 'Constant-Time Token Comparison', layer: 'api', status: 'active', agent: 'SEC-004' },
  { id: 'CTL-003', name: 'Per-IP Rate Limiting (60 RPM)', layer: 'api', status: 'active', agent: 'SEC-005' },
  { id: 'CTL-004', name: 'SQL Injection Detection', layer: 'api', status: 'active', agent: 'SEC-006' },
  { id: 'CTL-005', name: 'XSS Pattern Detection', layer: 'api', status: 'active', agent: 'SEC-006' },
  { id: 'CTL-006', name: 'Command Injection Detection', layer: 'api', status: 'active', agent: 'SEC-006' },
  { id: 'CTL-007', name: 'SSRF Prevention', layer: 'api', status: 'active', agent: 'SEC-006' },
  { id: 'CTL-008', name: 'Path Traversal Blocking', layer: 'api', status: 'active', agent: 'SEC-006' },
  { id: 'CTL-009', name: 'Payload Size Enforcement (1MB)', layer: 'api', status: 'active', agent: 'SEC-003' },
  { id: 'CTL-010', name: 'Scanner/Bot User-Agent Blocking', layer: 'api', status: 'active', agent: 'SEC-002' },
  { id: 'CTL-011', name: 'Deep Object Injection Scanning', layer: 'api', status: 'active', agent: 'SEC-006' },
  // Middleware Security (Sterling Vector)
  { id: 'CTL-012', name: 'HSTS Enforcement', layer: 'middleware', status: 'active', agent: 'SEC-007' },
  { id: 'CTL-013', name: 'Content-Security-Policy', layer: 'middleware', status: 'active', agent: 'SEC-007' },
  { id: 'CTL-014', name: 'X-Frame-Options DENY', layer: 'middleware', status: 'active', agent: 'SEC-007' },
  { id: 'CTL-015', name: 'X-Content-Type-Options nosniff', layer: 'middleware', status: 'active', agent: 'SEC-007' },
  { id: 'CTL-016', name: 'Referrer-Policy strict-origin', layer: 'middleware', status: 'active', agent: 'SEC-007' },
  { id: 'CTL-017', name: 'PII Detection in Responses', layer: 'middleware', status: 'active', agent: 'SEC-009' },
  { id: 'CTL-018', name: 'SSN/Credit Card Redaction', layer: 'middleware', status: 'active', agent: 'SEC-009' },
  { id: 'CTL-019', name: 'Bulk Exfiltration Detection', layer: 'middleware', status: 'active', agent: 'SEC-009' },
  { id: 'CTL-020', name: 'Server Fingerprint Removal', layer: 'middleware', status: 'active', agent: 'SEC-007' },
  // Cloud/Infrastructure Security (Remita Vector)
  { id: 'CTL-021', name: 'Wrangler Secrets-Only Key Storage', layer: 'infrastructure', status: 'active', agent: 'SEC-012' },
  { id: 'CTL-022', name: 'KV Namespace Access Control', layer: 'infrastructure', status: 'active', agent: 'SEC-011' },
  { id: 'CTL-023', name: 'Webhook Signature Validation (HMAC-SHA256)', layer: 'infrastructure', status: 'active', agent: 'SEC-024' },
  { id: 'CTL-024', name: 'Audit Log 90-Day Retention (Security Events)', layer: 'infrastructure', status: 'active', agent: 'SEC-019' },
  { id: 'CTL-025', name: 'TLS-Only Communication', layer: 'infrastructure', status: 'active', agent: 'SEC-013' },
  { id: 'CTL-026', name: 'No-Cache Security Response Headers', layer: 'infrastructure', status: 'active', agent: 'SEC-007' },
];

// ── GET /v1/security/dashboard ──────────────────────────────────────────────

export async function handleSecurityDashboard(env) {
  // Count security events from KV
  let recentEvents = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
  if (env.AUDIT_LOG) {
    try {
      const criticalKeys = await env.AUDIT_LOG.list({ prefix: 'sec:critical:', limit: 100 });
      const highKeys = await env.AUDIT_LOG.list({ prefix: 'sec:high:', limit: 100 });
      recentEvents.critical = criticalKeys.keys.length;
      recentEvents.high = highKeys.keys.length;
      recentEvents.total = recentEvents.critical + recentEvents.high;
    } catch {
      // KV unavailable — continue with zero counts
    }
  }

  const activeControls = ACTIVE_CONTROLS.filter(c => c.status === 'active').length;
  const totalControls = ACTIVE_CONTROLS.length;
  const complianceEnforced = COMPLIANCE_FRAMEWORKS.filter(f => f.status === 'enforced').length;

  return jsonResponse({
    framework: SECURITY_CONFIG.framework,
    version: SECURITY_CONFIG.version,
    posture: {
      score: Math.round((activeControls / totalControls) * 100),
      rating: activeControls === totalControls ? 'GOLD' : activeControls >= totalControls * 0.9 ? 'SILVER' : 'BRONZE',
      active_controls: activeControls,
      total_controls: totalControls,
      compliance_enforced: complianceEnforced,
      compliance_total: COMPLIANCE_FRAMEWORKS.length,
    },
    threat_vectors: {
      api_security: { status: 'hardened', controls: ACTIVE_CONTROLS.filter(c => c.layer === 'api').length, reference: 'FCMB breach — API exploitation' },
      middleware_security: { status: 'hardened', controls: ACTIVE_CONTROLS.filter(c => c.layer === 'middleware').length, reference: 'Sterling Bank breach — middleware vulnerability' },
      infrastructure_security: { status: 'hardened', controls: ACTIVE_CONTROLS.filter(c => c.layer === 'infrastructure').length, reference: 'Remita breach — cloud misconfiguration' },
    },
    recent_events: recentEvents,
    incident_sla: INCIDENT_SEVERITY_LEVELS,
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/security/events ─────────────────────────────────────────────────

export async function handleSecurityEvents(url, env) {
  const severity = url.searchParams.get('severity') || 'critical';
  const limitParam = parseInt(url.searchParams.get('limit') || '50', 10);
  const limit = Math.min(Math.max(1, limitParam), 200);

  if (!env.AUDIT_LOG) {
    return jsonResponse({ events: [], count: 0 });
  }

  try {
    const keys = await env.AUDIT_LOG.list({ prefix: `sec:${severity}:`, limit });
    const events = [];

    for (const key of keys.keys) {
      const raw = await env.AUDIT_LOG.get(key.name, 'json');
      if (raw) events.push(raw);
    }

    return jsonResponse({
      severity,
      events,
      count: events.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Failed to fetch security events: ${err.message}`, 500);
  }
}

// ── POST /v1/security/scan ──────────────────────────────────────────────────

export async function handleSecurityScan(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { payload, url: targetUrl } = body;
  if (!payload && !targetUrl) {
    return errorResponse('Provide "payload" (object/string) or "url" (string) to scan.', 400);
  }

  const findings = [];

  // Scan payload
  if (payload) {
    if (typeof payload === 'string') {
      const threat = detectInjection(payload);
      if (threat) findings.push({ type: threat, location: 'payload', severity: 'critical' });
    } else if (typeof payload === 'object') {
      const result = deepScanObject(payload);
      if (result) findings.push({ type: result.threat, location: result.path, severity: 'critical', sample: result.value });
    }
  }

  // Scan URL
  if (targetUrl) {
    try {
      const parsed = new URL(targetUrl);
      const pathThreat = detectInjection(parsed.pathname);
      if (pathThreat) findings.push({ type: pathThreat, location: 'url_path', severity: 'critical' });

      for (const [key, value] of parsed.searchParams.entries()) {
        const paramThreat = detectInjection(value);
        if (paramThreat) findings.push({ type: paramThreat, location: `url_param:${key}`, severity: 'critical' });
      }
    } catch {
      findings.push({ type: 'invalid_url', location: 'url', severity: 'low' });
    }
  }

  const verdict = findings.length === 0 ? 'CLEAN' : 'THREATS_DETECTED';

  writeAudit(env, ctx, {
    route: '/v1/security/scan',
    action: 'on_demand_scan',
    verdict,
    findings_count: findings.length,
  });

  return jsonResponse({
    verdict,
    findings,
    controls_applied: [
      'SQL injection detection',
      'XSS pattern matching',
      'Command injection detection',
      'Path traversal detection',
      'SSRF prevention',
    ],
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/security/compliance ─────────────────────────────────────────────

export function handleSecurityCompliance() {
  return jsonResponse({
    frameworks: COMPLIANCE_FRAMEWORKS,
    controls: ACTIVE_CONTROLS,
    summary: {
      total_frameworks: COMPLIANCE_FRAMEWORKS.length,
      enforced: COMPLIANCE_FRAMEWORKS.filter(f => f.status === 'enforced').length,
      in_progress: COMPLIANCE_FRAMEWORKS.filter(f => f.status === 'in_progress').length,
      partial: COMPLIANCE_FRAMEWORKS.filter(f => f.status === 'partial').length,
      total_controls: ACTIVE_CONTROLS.length,
      active_controls: ACTIVE_CONTROLS.filter(c => c.status === 'active').length,
      by_layer: {
        api: ACTIVE_CONTROLS.filter(c => c.layer === 'api').length,
        middleware: ACTIVE_CONTROLS.filter(c => c.layer === 'middleware').length,
        infrastructure: ACTIVE_CONTROLS.filter(c => c.layer === 'infrastructure').length,
      },
    },
    breach_vectors_addressed: SECURITY_CONFIG.breach_vectors_addressed,
    timestamp: new Date().toISOString(),
  });
}

// ── POST /v1/security/incident ──────────────────────────────────────────────

export async function handleSecurityIncident(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { severity, title, description, vector, affected_systems } = body;

  if (!severity || !['critical', 'high', 'medium', 'low'].includes(severity)) {
    return errorResponse('severity must be critical, high, medium, or low.', 400);
  }
  if (!title || typeof title !== 'string') {
    return errorResponse('title (string) is required.', 400);
  }

  const incidentId = `INC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  const sla = INCIDENT_SEVERITY_LEVELS[severity];

  const incident = {
    incident_id: incidentId,
    severity,
    title,
    description: description || '',
    vector: vector || 'unknown',
    affected_systems: affected_systems || [],
    status: 'open',
    sla,
    reported_at: timestamp,
    assigned_to: 'SEC-015 Incident Commander',
    escalation_chain: sla.escalation,
  };

  // Log incident to security audit
  logSecurityIncident(env, ctx, incident);

  writeAudit(env, ctx, {
    route: '/v1/security/incident',
    action: 'incident_reported',
    incident_id: incidentId,
    severity,
    title,
  });

  return jsonResponse(incident, 201);
}

function logSecurityIncident(env, ctx, incident) {
  if (!env.AUDIT_LOG) return;

  const key = `incident:${incident.severity}:${Date.now()}:${incident.incident_id}`;
  ctx.waitUntil(
    env.AUDIT_LOG.put(key, JSON.stringify(incident), { expirationTtl: 86400 * 365 })
  );
}
