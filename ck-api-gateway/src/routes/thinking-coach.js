/**
 * Thinking Coach Routes — Expert Frameworks for CEO-Level Cognition
 *
 * Sovereign-Level Governance | Ferrari-Standard Execution
 *
 *   GET  /v1/thinking/frameworks          — List all 7 expert frameworks
 *   GET  /v1/thinking/frameworks/:id      — Get single framework details
 *   POST /v1/thinking/session             — Run thinking session (single framework)
 *   POST /v1/thinking/multi               — Multi-framework analysis
 *   POST /v1/thinking/learning-blueprint  — Generate 90-day learning blueprint
 *   POST /v1/thinking/daily-models        — CEO daily mental models briefing
 *   GET  /v1/thinking/dashboard           — Thinking Coach operational dashboard
 */

import {
  listFrameworks,
  getFramework,
  runSession,
  runMultiFramework,
  generateLearningBlueprint,
  dailyMentalModels,
} from '../services/thinking-coach.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/thinking/frameworks ────────────────────────────────────────────

export function handleListThinkingFrameworks(url) {
  const params = url.searchParams;
  const domain = params.get('domain');
  const complexity = params.get('complexity');

  let frameworks = listFrameworks();

  if (domain) {
    frameworks = frameworks.filter(f => f.domains.includes(domain));
  }

  if (complexity) {
    frameworks = frameworks.filter(f => f.complexity === complexity);
  }

  return jsonResponse({
    frameworks,
    count: frameworks.length,
    governance: 'sovereign',
    executionStandard: 'ferrari',
  });
}

// ── GET /v1/thinking/frameworks/:id ────────────────────────────────────────

export function handleGetThinkingFramework(frameworkId) {
  const framework = getFramework(frameworkId);
  if (!framework) {
    return errorResponse(`Framework "${frameworkId}" not found. Available: ${listFrameworks().map(f => f.id).join(', ')}`, 404);
  }
  return jsonResponse({ framework });
}

// ── POST /v1/thinking/session ──────────────────────────────────────────────

export async function handleThinkingSession(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { framework, problem, context } = body;

  if (!framework) {
    return errorResponse('Missing required field: "framework" (e.g., "first-principles", "mental-models").', 400);
  }

  if (!problem) {
    return errorResponse('Missing required field: "problem" (the question or challenge to analyze).', 400);
  }

  const validFramework = getFramework(framework);
  if (!validFramework) {
    return errorResponse(`Unknown framework: "${framework}". Available: ${listFrameworks().map(f => f.id).join(', ')}`, 400);
  }

  try {
    const result = await runSession(env, framework, problem, context || {});

    writeAudit(env, ctx, {
      route: '/v1/thinking/session',
      action: 'thinking_session',
      framework,
      cached: result.cached,
      model: result.model,
    });

    return jsonResponse({
      success: true,
      ...result,
      executionStandard: 'ferrari',
      governance: 'sovereign',
    });
  } catch (err) {
    return errorResponse(`Thinking session failed: ${err.message}`, 500);
  }
}

// ── POST /v1/thinking/multi ────────────────────────────────────────────────

export async function handleMultiFramework(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { frameworks, problem, context } = body;

  if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
    return errorResponse('Missing required field: "frameworks" (array of framework IDs).', 400);
  }

  if (!problem) {
    return errorResponse('Missing required field: "problem".', 400);
  }

  if (frameworks.length > 7) {
    return errorResponse('Maximum 7 frameworks per multi-analysis.', 400);
  }

  try {
    const result = await runMultiFramework(env, frameworks, problem, context || {});

    writeAudit(env, ctx, {
      route: '/v1/thinking/multi',
      action: 'multi_framework_analysis',
      frameworks_count: frameworks.length,
      frameworks: frameworks,
    });

    return jsonResponse({
      success: true,
      ...result,
    });
  } catch (err) {
    return errorResponse(`Multi-framework analysis failed: ${err.message}`, 500);
  }
}

// ── POST /v1/thinking/learning-blueprint ───────────────────────────────────

export async function handleLearningBlueprint(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { skill, current_level, target_level, context } = body;

  if (!skill) {
    return errorResponse('Missing required field: "skill" (what you want to master).', 400);
  }

  try {
    const result = await generateLearningBlueprint(
      env,
      skill,
      current_level || 'beginner',
      target_level || 'top 1% expert',
      context || {},
    );

    writeAudit(env, ctx, {
      route: '/v1/thinking/learning-blueprint',
      action: 'learning_blueprint',
      skill,
      cached: result.cached,
    });

    return jsonResponse({
      success: true,
      skill,
      current_level: current_level || 'beginner',
      target_level: target_level || 'top 1% expert',
      ...result,
      executionStandard: 'ferrari',
    });
  } catch (err) {
    return errorResponse(`Learning blueprint failed: ${err.message}`, 500);
  }
}

// ── POST /v1/thinking/daily-models ─────────────────────────────────────────

export async function handleDailyModels(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const focus = body.focus || 'general';

  try {
    const result = await dailyMentalModels(env, focus);

    writeAudit(env, ctx, {
      route: '/v1/thinking/daily-models',
      action: 'daily_mental_models',
      focus,
      cached: result.cached,
    });

    return jsonResponse({
      success: true,
      date: new Date().toISOString().split('T')[0],
      focus,
      ...result,
      executionStandard: 'ferrari',
    });
  } catch (err) {
    return errorResponse(`Daily models failed: ${err.message}`, 500);
  }
}

// ── GET /v1/thinking/dashboard ─────────────────────────────────────────────

export function handleThinkingDashboard() {
  const frameworks = listFrameworks();

  const domainCoverage = {};
  for (const f of frameworks) {
    for (const d of f.domains) {
      domainCoverage[d] = (domainCoverage[d] || 0) + 1;
    }
  }

  return jsonResponse({
    service: 'Thinking Coach — Expert Frameworks Engine',
    status: 'operational',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    frameworks: {
      total: frameworks.length,
      by_complexity: {
        advanced: frameworks.filter(f => f.complexity === 'advanced').length,
        standard: frameworks.filter(f => f.complexity === 'standard').length,
      },
      list: frameworks.map(f => ({
        id: f.id,
        name: f.name,
        codename: f.codename,
        complexity: f.complexity,
        domains: f.domains,
      })),
    },
    capabilities: {
      single_framework_session: '/v1/thinking/session',
      multi_framework_analysis: '/v1/thinking/multi',
      learning_blueprint: '/v1/thinking/learning-blueprint',
      daily_mental_models: '/v1/thinking/daily-models',
    },
    domain_coverage: domainCoverage,
    inspired_by: [
      'Elon Musk', 'Charlie Munger', 'Naval Ravikant', 'Jeff Bezos',
      'Ray Dalio', 'Richard Feynman', 'Peter Thiel', 'Sun Tzu',
      'Nassim Taleb', 'Andy Grove', 'Warren Buffett', 'Peter Senge',
    ],
    timestamp: new Date().toISOString(),
  });
}
