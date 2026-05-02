/**
 * Payment Routes — Stripe Checkout Integration
 *
 * Routes:
 *   GET  /v1/payments/dashboard  — Payment engine status
 *   GET  /v1/payments/pricing    — Public pricing data (no auth)
 *   POST /v1/payments/link       — Generate Stripe checkout link
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  createPaymentLink,
  getPaymentDashboard,
  getPublicPricing,
} from '../engines/payment-links.js';

export function handlePaymentDashboard(env) {
  return jsonResponse(getPaymentDashboard(env));
}

export function handlePublicPricing() {
  return jsonResponse(getPublicPricing());
}

export async function handleCreatePaymentLink(request, env, ctx) {
  const body = await request.json();
  if (!body.service) {
    return errorResponse('service is required (select, premier, platinum, hurricanePrep, deepInspection, onboarding)', 400);
  }

  const result = await createPaymentLink(env, body.service, body.email || null);

  if (result.error) {
    return jsonResponse(result, 400);
  }

  writeAudit(env, ctx, '/v1/payments/link', {
    action: 'payment_link_created',
    service: body.service,
    email: body.email || 'anonymous',
    status: result.status,
  });

  return jsonResponse(result);
}
