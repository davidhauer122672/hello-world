/**
 * Engine Routes — Financial Engine, Analysis Suite, Trading Engine, Agent Hierarchy
 *
 * Exposes the backbone intelligence modules via API endpoints.
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import {
  REVENUE_MODELS, EXPENSE_CATEGORIES, FINANCIAL_BENCHMARKS,
  calculateManagementFee, calculateRentEstimate, analyzePropertyROI,
  generateFinancialForecast, generatePricingStrategy, generateBudget,
} from '../engines/financial-engine.js';
import {
  analyzeAgentPerformance, generateFleetAnalytics, analyzeMarketTrends,
  generateCompetitiveIntel, analyzeLeadPipeline, generateOperationalReport,
  ANALYSIS_TEMPLATES, scorePropertyHealth, predictChurn,
} from '../engines/analysis-suite.js';
import {
  DEAL_STAGES, DEAL_SCORING_WEIGHTS, scoreDeal, generateDealStrategy,
  analyzeComparables, calculateClosingCosts, generateInvestorPackage,
  evaluatePortfolio,
} from '../engines/trading-engine.js';
import {
  COMMAND_CHAIN, ESCALATION_MATRIX, getChainOfCommand, getDirectReports,
  getDivisionHierarchy, getFleetStatus,
} from '../agents/agent-hierarchy.js';

// ── Financial Engine ────────────────────────────────────────────────────────

export function handleFinancialModels() {
  return jsonResponse({
    engine: 'financial-engine',
    revenueModels: REVENUE_MODELS,
    expenseCategories: EXPENSE_CATEGORIES,
    benchmarks: FINANCIAL_BENCHMARKS,
  });
}

export async function handleManagementFee(request) {
  const body = await request.json();
  const { monthlyRent, propertyType, zoneId } = body;
  if (!monthlyRent) return errorResponse('monthlyRent required', 400);
  return jsonResponse(calculateManagementFee(monthlyRent, propertyType, zoneId));
}

export async function handleRentEstimate(request) {
  const body = await request.json();
  if (!body.zoneId) return errorResponse('zoneId required', 400);
  return jsonResponse(calculateRentEstimate(body));
}

export async function handlePropertyROI(request) {
  const body = await request.json();
  if (!body.purchasePrice || !body.monthlyRent) return errorResponse('purchasePrice and monthlyRent required', 400);
  return jsonResponse(analyzePropertyROI(body));
}

export async function handleFinancialForecast(request) {
  const body = await request.json();
  return jsonResponse(generateFinancialForecast(body));
}

export async function handleDynamicPricing(request) {
  const body = await request.json();
  if (!body.zoneId) return errorResponse('zoneId required', 400);
  return jsonResponse(generatePricingStrategy(body.zoneId, body.marketData));
}

export async function handleBudget(request) {
  const body = await request.json();
  if (!body.monthlyRent) return errorResponse('monthlyRent required', 400);
  return jsonResponse(generateBudget(body, body.year || new Date().getFullYear()));
}

// ── Analysis Suite ──────────────────────────────────────────────────────────

export async function handleAgentAnalysis(request) {
  const body = await request.json();
  if (!body.agentId) return errorResponse('agentId required', 400);
  return jsonResponse(analyzeAgentPerformance(body.agentId, body.metrics || {}));
}

export async function handleFleetAnalytics(request) {
  const body = await request.json();
  return jsonResponse(generateFleetAnalytics(body.agents || []));
}

export async function handleMarketTrends(request) {
  const body = await request.json();
  if (!body.zone) return errorResponse('zone required', 400);
  return jsonResponse(analyzeMarketTrends(body.zone, body.timeframe || 'quarterly'));
}

export async function handleCompetitiveIntel(request) {
  const body = await request.json();
  return jsonResponse(generateCompetitiveIntel(body.competitors || []));
}

export async function handleLeadPipeline(request) {
  const body = await request.json();
  return jsonResponse(analyzeLeadPipeline(body.leads || []));
}

export async function handleOperationalReport(request) {
  const body = await request.json();
  if (!body.division) return errorResponse('division required', 400);
  return jsonResponse(generateOperationalReport(body.division, body.period || 'monthly'));
}

export function handleAnalysisTemplates() {
  return jsonResponse({ templates: ANALYSIS_TEMPLATES });
}

export async function handlePropertyHealth(request) {
  const body = await request.json();
  return jsonResponse(scorePropertyHealth(body));
}

export async function handleChurnPrediction(request) {
  const body = await request.json();
  return jsonResponse(predictChurn(body.tenants || []));
}

// ── Trading Engine ──────────────────────────────────────────────────────────

export function handleDealStages() {
  return jsonResponse({ stages: DEAL_STAGES, scoringWeights: DEAL_SCORING_WEIGHTS });
}

export async function handleScoreDeal(request) {
  const body = await request.json();
  return jsonResponse(scoreDeal(body));
}

export async function handleDealStrategy(request) {
  const body = await request.json();
  return jsonResponse(generateDealStrategy(body));
}

export async function handleComparables(request) {
  const body = await request.json();
  return jsonResponse(analyzeComparables(body.property || body, body.radius));
}

export async function handleClosingCosts(request) {
  const body = await request.json();
  if (!body.salePrice) return errorResponse('salePrice required', 400);
  return jsonResponse(calculateClosingCosts(body.salePrice, body.type || 'buyer'));
}

export async function handleInvestorPackage(request) {
  const body = await request.json();
  return jsonResponse(generateInvestorPackage(body));
}

export async function handlePortfolioEvaluation(request) {
  const body = await request.json();
  return jsonResponse(evaluatePortfolio(body.properties || []));
}

// ── Agent Hierarchy ─────────────────────────────────────────────────────────

export function handleCommandChain() {
  return jsonResponse({ commandChain: COMMAND_CHAIN, escalationMatrix: ESCALATION_MATRIX });
}

export function handleFleetStatusEndpoint() {
  return jsonResponse(getFleetStatus());
}

export function handleChainOfCommand(agentId) {
  const chain = getChainOfCommand(agentId);
  if (!chain || chain.length === 0) return errorResponse(`Agent ${agentId} not found`, 404);
  return jsonResponse({ agentId, chain });
}

export function handleDirectReports(agentId) {
  return jsonResponse({ agentId, directReports: getDirectReports(agentId) });
}

export function handleDivisionHierarchyEndpoint(divisionCode) {
  const hierarchy = getDivisionHierarchy(divisionCode);
  if (!hierarchy) return errorResponse(`Division ${divisionCode} not found`, 404);
  return jsonResponse(hierarchy);
}
