/**
 * Retail Blueprint Routes — Shoe & apparel business API handlers.
 *
 * Endpoints:
 *   GET  /v1/retail/blueprint            — Full blueprint overview
 *   GET  /v1/retail/brand                — Brand identity system
 *   GET  /v1/retail/sku-strategy         — SKU mix + inventory architecture
 *   GET  /v1/retail/financials           — Financial model + projections
 *   GET  /v1/retail/layout               — Store layout (7 zones, 1200 sq ft)
 *   GET  /v1/retail/omnichannel          — POS + ecommerce + social integration
 *   GET  /v1/retail/launch-plan          — Soft + hard launch phases
 *   GET  /v1/retail/acquisition          — Customer acquisition engine
 */

import { getRetailBlueprint, getRetailBrand, getRetailSKUStrategy, getRetailFinancials, getRetailLayout, getRetailOmnichannel, getRetailLaunchPlan, getRetailAcquisition } from '../services/retail-blueprint.js';
import { jsonResponse } from '../utils/response.js';

export function handleRetailBlueprint() {
  return jsonResponse(getRetailBlueprint());
}

export function handleRetailBrand() {
  return jsonResponse(getRetailBrand());
}

export function handleRetailSKUStrategy() {
  return jsonResponse(getRetailSKUStrategy());
}

export function handleRetailFinancials() {
  return jsonResponse(getRetailFinancials());
}

export function handleRetailLayout() {
  return jsonResponse(getRetailLayout());
}

export function handleRetailOmnichannel() {
  return jsonResponse(getRetailOmnichannel());
}

export function handleRetailLaunchPlan() {
  return jsonResponse(getRetailLaunchPlan());
}

export function handleRetailAcquisition() {
  return jsonResponse(getRetailAcquisition());
}
