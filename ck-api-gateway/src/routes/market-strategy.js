/**
 * Market Strategy Skill Routes
 *
 * Routes:
 *   GET  /v1/strategy/dashboard  — Skill overview and framework
 *   POST /v1/strategy/generate   — Generate strategy from a lesson/input
 *   GET  /v1/strategy/framework  — Full 8-phase framework
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  STRATEGY_FRAMEWORK,
  generateStrategy,
  getMarketStrategyDashboard,
} from '../engines/market-strategy.js';

export function handleStrategyDashboard() {
  return jsonResponse(getMarketStrategyDashboard());
}

export async function handleStrategyGenerate(request, env, ctx) {
  const body = await request.json();
  const strategy = generateStrategy(body);

  writeAudit(env, ctx, '/v1/strategy/generate', {
    action: 'strategy_generated',
    strategyId: strategy.strategyId,
    source: strategy.source,
    focus: strategy.focus,
    timeline: strategy.timeline,
    lessonLength: strategy.lesson ? strategy.lesson.length : 0,
  });

  return jsonResponse(strategy);
}

export function handleStrategyFramework() {
  return jsonResponse({
    framework: STRATEGY_FRAMEWORK,
    phaseCount: STRATEGY_FRAMEWORK.phases.length,
  });
}
