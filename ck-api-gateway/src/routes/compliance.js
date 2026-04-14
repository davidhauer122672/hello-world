/**
 * TCPA/DNC Compliance Routes — Coastal Key Enterprise
 *
 * Full TCPA and Do Not Call compliance API for Sentinel Sales
 * Division and Atlas AI campaign operations.
 *
 *   POST /v1/compliance/dnc/add           — Add phone to DNC registry
 *   POST /v1/compliance/dnc/check         — Check single phone against DNC
 *   POST /v1/compliance/dnc/bulk-check    — Bulk scrub phone list against DNC
 *   POST /v1/compliance/dnc/remove        — Remove phone from DNC (consent re-obtained)
 *   POST /v1/compliance/consent/record    — Record PEWC for a contact
 *   POST /v1/compliance/consent/check     — Check consent status for phone
 *   GET  /v1/compliance/calling-window    — Check if calling window is open
 *   POST /v1/compliance/pre-call-check    — Full pre-call compliance gate
 *   GET  /v1/compliance/audit             — Generate compliance audit report
 */

import {
  addToDNC,
  checkDNC,
  bulkCheckDNC,
  removeFromDNC,
  recordConsent,
  checkConsent,
  isCallingWindowOpen,
  preCallCheck,
  generateAudit,
} from '../services/tcpa-compliance.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── POST /v1/compliance/dnc/add ────────────────────────────────────────────

export async function handleDNCAdd(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { phone, reason, source, agentId } = body;
  if (!phone) return errorResponse('Field "phone" is required.', 400);

  try {
    const result = await addToDNC(env, { phone, reason, source, agentId });

    writeAudit(env, ctx, {
      route: '/v1/compliance/dnc/add',
      action: 'dnc-added',
      phone,
      reason: reason || 'Consumer request',
    });

    return jsonResponse({
      status: 'added',
      registry: 'Coastal Key DNC',
      phone,
      reason: reason || 'Consumer request',
      recordId: result.id,
      sla: 'Removed from all campaigns within 24 hours',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`DNC add failed: ${err.message}`, 500);
  }
}

// ── POST /v1/compliance/dnc/check ──────────────────────────────────────────

export async function handleDNCCheck(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { phone } = body;
  if (!phone) return errorResponse('Field "phone" is required.', 400);

  try {
    const result = await checkDNC(env, phone);

    writeAudit(env, ctx, {
      route: '/v1/compliance/dnc/check',
      action: 'dnc-checked',
      phone,
      isDNC: result.isDNC,
    });

    return jsonResponse({
      phone,
      isDNC: result.isDNC,
      status: result.isDNC ? 'BLOCKED — on DNC list' : 'CLEAR — not on DNC list',
      record: result.record ? {
        dncDate: result.record.fields?.['DNC Date'],
        reason: result.record.fields?.['DNC Reason'],
      } : null,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`DNC check failed: ${err.message}`, 500);
  }
}

// ── POST /v1/compliance/dnc/bulk-check ─────────────────────────────────────

export async function handleDNCBulkCheck(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { phones } = body;
  if (!phones || !Array.isArray(phones) || phones.length === 0) {
    return errorResponse('Field "phones" must be a non-empty array.', 400);
  }

  if (phones.length > 100) {
    return errorResponse('Maximum 100 phones per bulk check.', 400);
  }

  try {
    const result = await bulkCheckDNC(env, phones);

    writeAudit(env, ctx, {
      route: '/v1/compliance/dnc/bulk-check',
      action: 'dnc-bulk-scrub',
      totalChecked: phones.length,
      dncFound: result.dncCount,
    });

    return jsonResponse({
      operation: 'DNC Bulk Scrub',
      ...result,
      governance: 'TCPA Compliance Engine',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Bulk DNC check failed: ${err.message}`, 500);
  }
}

// ── POST /v1/compliance/dnc/remove ─────────────────────────────────────────

export async function handleDNCRemove(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { phone, reason } = body;
  if (!phone) return errorResponse('Field "phone" is required.', 400);

  try {
    const result = await removeFromDNC(env, phone, reason);

    writeAudit(env, ctx, {
      route: '/v1/compliance/dnc/remove',
      action: 'dnc-removed',
      phone,
      removed: result.removed,
      reason: reason || 'Consent re-obtained',
    });

    return jsonResponse({
      phone,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`DNC remove failed: ${err.message}`, 500);
  }
}

// ── POST /v1/compliance/consent/record ─────────────────────────────────────

export async function handleConsentRecord(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { phone, name, consentType, consentMethod, consentText, agentId } = body;

  if (!phone || !consentType || !consentMethod) {
    return errorResponse('Fields "phone", "consentType", and "consentMethod" are required.', 400);
  }

  try {
    const result = await recordConsent(env, { phone, name, consentType, consentMethod, consentText, agentId });

    writeAudit(env, ctx, {
      route: '/v1/compliance/consent/record',
      action: 'consent-recorded',
      phone,
      consentType,
      consentMethod,
    });

    return jsonResponse({
      status: 'consent_recorded',
      phone,
      consentType,
      consentMethod,
      recordId: result.id,
      tcpaCompliant: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Consent recording failed: ${err.message}`, 500);
  }
}

// ── POST /v1/compliance/consent/check ──────────────────────────────────────

export async function handleConsentCheck(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { phone } = body;
  if (!phone) return errorResponse('Field "phone" is required.', 400);

  try {
    const result = await checkConsent(env, phone);

    return jsonResponse({
      phone,
      ...result,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Consent check failed: ${err.message}`, 500);
  }
}

// ── GET /v1/compliance/calling-window ──────────────────────────────────────

export function handleCallingWindow() {
  const result = isCallingWindowOpen();
  return jsonResponse({
    service: 'TCPA Calling Window Enforcement',
    ...result,
    governance: 'Coastal Key Compliance Engine',
  });
}

// ── POST /v1/compliance/pre-call-check ─────────────────────────────────────

export async function handlePreCallCheck(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { phone } = body;
  if (!phone) return errorResponse('Field "phone" is required.', 400);

  try {
    const result = await preCallCheck(env, phone);

    writeAudit(env, ctx, {
      route: '/v1/compliance/pre-call-check',
      action: 'pre-call-compliance-check',
      phone,
      passed: result.passed,
    });

    return jsonResponse({
      service: 'TCPA Pre-Call Compliance Gate',
      governance: 'Coastal Key Compliance Engine',
      ...result,
    });
  } catch (err) {
    return errorResponse(`Pre-call check failed: ${err.message}`, 500);
  }
}

// ── GET /v1/compliance/audit ───────────────────────────────────────────────

export async function handleComplianceAudit(env, ctx) {
  try {
    const audit = await generateAudit(env);

    writeAudit(env, ctx, {
      route: '/v1/compliance/audit',
      action: 'compliance-audit-generated',
    });

    return jsonResponse({
      governance: 'Coastal Key TCPA/DNC Compliance Engine',
      ...audit,
    });
  } catch (err) {
    return errorResponse(`Compliance audit failed: ${err.message}`, 500);
  }
}
