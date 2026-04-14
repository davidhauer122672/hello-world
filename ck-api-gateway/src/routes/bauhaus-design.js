/**
 * Bauhaus Design System Routes
 *
 * Endpoints:
 *   GET  /v1/design/system              — Design system overview
 *   GET  /v1/design/principles          — All 6 Bauhaus principles
 *   GET  /v1/design/tokens              — Design tokens (colors, type, spacing, shapes)
 *   GET  /v1/design/assets              — Asset specifications (logo, photos, marketing, etc.)
 *   GET  /v1/design/master-prompt       — AI master design prompt
 */

import { getDesignSystem, getDesignPrinciples, getDesignTokens, getAssetSpecs, getMasterPrompt } from '../services/bauhaus-design.js';
import { jsonResponse } from '../utils/response.js';

export function handleDesignSystem() {
  return jsonResponse(getDesignSystem());
}

export function handleDesignPrinciples() {
  return jsonResponse(getDesignPrinciples());
}

export function handleDesignTokens() {
  return jsonResponse(getDesignTokens());
}

export function handleAssetSpecs() {
  return jsonResponse(getAssetSpecs());
}

export function handleMasterPrompt() {
  return jsonResponse(getMasterPrompt());
}
