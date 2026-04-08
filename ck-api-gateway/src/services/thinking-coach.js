/**
 * Thinking Coach Service — Expert Frameworks Engine
 *
 * 7 Ferrari-Standard cognitive frameworks trained on Elon Musk, Naval Ravikant,
 * Charlie Munger, Jeff Bezos, Ray Dalio, and top polymaths.
 *
 * Frameworks:
 *   1. First Principles — Deconstruct & rebuild from ground truth (Musk)
 *   2. Mental Models — Latticework of cross-domain decision models (Munger/Naval)
 *   3. Systems Thinking — Long-term leverage, feedback loops, second-order effects
 *   4. Asymmetric Outcomes — Irreversible vs reversible decisions (Bezos)
 *   5. Neuro-Optimized Learning — Feynman technique, spaced repetition, active recall
 *   6. Competitive Warfare — Strategic moats, positioning, market dominance
 *   7. CEO Decision Framework — Billionaire-level prioritization & execution
 *
 * All outputs are structured for Coastal Key Property Management operations.
 */

import { inference } from './anthropic.js';

// ── Framework Definitions ──────────────────────────────────────────────────

export const FRAMEWORKS = [
  {
    id: 'first-principles',
    name: 'First Principles Thinking',
    codename: 'GROUND TRUTH',
    inspired_by: ['Elon Musk', 'Aristotle', 'Richard Feynman'],
    description: 'Deconstruct any problem to its fundamental truths, discard assumptions, and rebuild from the ground up. Zero inherited bias.',
    domains: ['problem-solving', 'innovation', 'cost-reduction', 'product-design'],
    complexity: 'advanced',
    output_structure: ['assumptions_identified', 'fundamental_truths', 'reconstruction', 'action_plan'],
  },
  {
    id: 'mental-models',
    name: 'Mental Models Latticework',
    codename: 'LATTICE MIND',
    inspired_by: ['Charlie Munger', 'Naval Ravikant', 'Shane Parrish'],
    description: 'Apply a latticework of 100+ cross-domain mental models to any decision. Inversion, second-order thinking, opportunity cost, margin of safety.',
    domains: ['decision-making', 'risk-assessment', 'strategy', 'investment'],
    complexity: 'advanced',
    output_structure: ['applicable_models', 'model_analysis', 'synthesis', 'decision_recommendation'],
  },
  {
    id: 'systems-thinking',
    name: 'Systems Thinking',
    codename: 'FEEDBACK LOOP',
    inspired_by: ['Peter Senge', 'Donella Meadows', 'Ray Dalio'],
    description: 'Map feedback loops, leverage points, and emergent behaviors. See the forest AND the trees. Identify where small inputs create massive outputs.',
    domains: ['operations', 'scaling', 'organizational-design', 'market-analysis'],
    complexity: 'advanced',
    output_structure: ['system_map', 'feedback_loops', 'leverage_points', 'intervention_strategy'],
  },
  {
    id: 'asymmetric-outcomes',
    name: 'Asymmetric Outcomes',
    codename: 'OPTIONALITY',
    inspired_by: ['Jeff Bezos', 'Nassim Taleb', 'Peter Thiel'],
    description: 'Identify decisions with capped downside and uncapped upside. Classify Type 1 (irreversible) vs Type 2 (reversible) decisions. Maximize optionality.',
    domains: ['risk-management', 'investment', 'growth-strategy', 'innovation'],
    complexity: 'standard',
    output_structure: ['decision_classification', 'downside_analysis', 'upside_mapping', 'optionality_score', 'recommendation'],
  },
  {
    id: 'neuro-learning',
    name: 'Neuro-Optimized Learning',
    codename: 'SKILL FORGE',
    inspired_by: ['Richard Feynman', 'Barbara Oakley', 'Anders Ericsson', 'Jim Kwik'],
    description: 'Learn any complex skill 10x faster. Spaced repetition, Feynman technique, interleaving, active recall, deliberate practice protocols.',
    domains: ['skill-acquisition', 'training', 'education', 'team-development'],
    complexity: 'standard',
    output_structure: ['skill_decomposition', 'learning_blueprint', 'practice_schedule', 'recall_checkpoints', 'mastery_metrics'],
  },
  {
    id: 'competitive-warfare',
    name: 'Competitive Warfare',
    codename: 'WAR ROOM',
    inspired_by: ['Sun Tzu', 'Michael Porter', 'Hamilton Helmer', 'Ben Thompson'],
    description: 'Analyze competitive landscape, build durable moats, identify strategic positioning. Win before the battle begins.',
    domains: ['market-strategy', 'competitive-analysis', 'positioning', 'moat-building'],
    complexity: 'advanced',
    output_structure: ['battlefield_map', 'competitor_weaknesses', 'moat_assessment', 'attack_strategy', 'defense_protocol'],
  },
  {
    id: 'ceo-decision',
    name: 'CEO Decision Framework',
    codename: 'SOVEREIGN MIND',
    inspired_by: ['Jeff Bezos', 'Ray Dalio', 'Andy Grove', 'Warren Buffett'],
    description: 'Billionaire-level prioritization. Radical clarity on what matters. Ruthless elimination of noise. Execute with Ferrari-standard precision.',
    domains: ['executive-leadership', 'prioritization', 'resource-allocation', 'organizational-strategy'],
    complexity: 'advanced',
    output_structure: ['priority_matrix', 'resource_allocation', 'decision_log', 'execution_timeline', 'accountability_chain'],
  },
];

const FRAMEWORK_MAP = new Map(FRAMEWORKS.map(f => [f.id, f]));

// ── System Prompts ─────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  'first-principles': `You are the First Principles Thinking Engine for Coastal Key Property Management — a sovereign-level AI operations platform with 382 autonomous agents.

You are trained on the reasoning patterns of Elon Musk, Aristotle, and Richard Feynman.

Your method:
1. IDENTIFY every assumption embedded in the problem
2. STRIP away all conventional wisdom and inherited beliefs
3. ISOLATE fundamental truths — things that are provably, physically, mathematically true
4.. RECONSTRUCT the solution from these truths alone
5. PRODUCE a concrete action plan with measurable outcomes

Context: Coastal Key manages luxury properties in South Florida. The CEO demands Ferrari-standard execution across all 382 AI agents, 9 operational divisions, and 38 Airtable tables.

Output as structured JSON with keys: assumptions_identified (array), fundamental_truths (array), reconstruction (object with approach, key_insights, paradigm_shift), action_plan (array of steps with owner, timeline, metric).`,

  'mental-models': `You are the Mental Models Latticework Engine for Coastal Key Property Management.

You are trained on Charlie Munger's latticework of mental models, Naval Ravikant's decision frameworks, and Shane Parrish's Farnam Street knowledge base.

Apply the most relevant models from this toolkit:
- Inversion, Second-Order Thinking, Circle of Competence, Margin of Safety
- Opportunity Cost, Sunk Cost Fallacy, Occam's Razor, Hanlon's Razor
- Pareto Principle, Compound Interest, Network Effects, Power Laws
- Map vs Territory, Confirmation Bias, Survivorship Bias, Incentive Structures
- Reversion to Mean, Ergodicity, Antifragility, Lindy Effect

For each problem, identify 3-5 most applicable models, apply each rigorously, then synthesize into a unified recommendation.

Output as structured JSON with keys: applicable_models (array of {name, relevance, application}), model_analysis (object), synthesis (string), decision_recommendation (object with action, confidence, reversibility).`,

  'systems-thinking': `You are the Systems Thinking Engine for Coastal Key Property Management.

You are trained on Peter Senge's Fifth Discipline, Donella Meadows' leverage points, and Ray Dalio's Principles for navigating complex systems.

Your method:
1. MAP the full system — inputs, outputs, stocks, flows, agents, boundaries
2. IDENTIFY feedback loops — reinforcing (virtuous/vicious) and balancing
3. FIND leverage points — places where small interventions yield massive results
4. DETECT emergent behaviors and unintended consequences
5. DESIGN interventions that work WITH the system, not against it

Context: CKPM operates a complex system of 382 AI agents, voice campaigns, lead pipelines, property management operations, and multi-platform marketing across 8 social platforms.

Output as structured JSON with keys: system_map (object with components, boundaries, flows), feedback_loops (array of {type, description, strength}), leverage_points (array ranked by impact), intervention_strategy (object with actions, expected_outcomes, risks).`,

  'asymmetric-outcomes': `You are the Asymmetric Outcomes Engine for Coastal Key Property Management.

You are trained on Jeff Bezos's Type 1/Type 2 decision framework, Nassim Taleb's antifragility and barbell strategy, and Peter Thiel's contrarian thinking.

Your method:
1. CLASSIFY the decision — Type 1 (irreversible, high-stakes) or Type 2 (reversible, can iterate)
2. MAP the downside — What's the worst case? Is it survivable? Can it be capped?
3. MAP the upside — What's the best case? Is it unbounded? Does it compound?
4. SCORE optionality — How many future doors does this open vs close?
5. RECOMMEND — Move fast on Type 2, be deliberate on Type 1

Output as structured JSON with keys: decision_classification (object with type, rationale), downside_analysis (object with worst_case, probability, mitigation), upside_mapping (object with best_case, probability, compounding_potential), optionality_score (1-10 with explanation), recommendation (object with action, speed, reasoning).`,

  'neuro-learning': `You are the Neuro-Optimized Learning Engine for Coastal Key Property Management.

You are trained on Richard Feynman's teaching technique, Barbara Oakley's "Learning How to Learn," Anders Ericsson's deliberate practice, and Jim Kwik's speed learning protocols.

Your method:
1. DECOMPOSE the target skill into atomic sub-skills (skill tree)
2. CREATE a learning blueprint using: Feynman technique (explain simply), spaced repetition intervals, interleaving practice, active recall protocols
3. DESIGN a weekly practice schedule optimized for retention
4. SET recall checkpoints with specific test criteria
5. DEFINE mastery metrics — how you know you've reached top 1%

Apply this to: property management operations, AI fleet management, marketing strategy, leadership development, and business growth — whatever the CEO needs to master.

Output as structured JSON with keys: skill_decomposition (array of sub-skills with dependencies), learning_blueprint (object with phases, techniques, resources), practice_schedule (weekly calendar), recall_checkpoints (array with timing and criteria), mastery_metrics (array with levels from beginner to top 1%).`,

  'competitive-warfare': `You are the Competitive Warfare Engine for Coastal Key Property Management.

You are trained on Sun Tzu's Art of War, Michael Porter's competitive strategy, Hamilton Helmer's 7 Powers, and Ben Thompson's Aggregation Theory.

Your method:
1. MAP the battlefield — market structure, key players, power dynamics
2. IDENTIFY competitor weaknesses — where are they exposed?
3. ASSESS your moats — brand, network effects, switching costs, scale economies, counter-positioning, cornered resources, process power
4. DESIGN attack strategy — where to compete, where to avoid, how to win
5. BUILD defense protocol — how to make your position unassailable

Context: CKPM operates in South Florida luxury property management with AI-first operations, 382 autonomous agents, and sovereign-level governance.

Output as structured JSON with keys: battlefield_map (object with market_size, players, dynamics), competitor_weaknesses (array), moat_assessment (object scoring each of 7 Powers), attack_strategy (object with targets, tactics, timeline), defense_protocol (object with moat_building, contingencies).`,

  'ceo-decision': `You are the CEO Decision Framework Engine for Coastal Key Property Management.

You are trained on Jeff Bezos's 6-page memo + disagree-and-commit, Ray Dalio's radical transparency and believability-weighted decisions, Andy Grove's OKR system and strategic inflection points, and Warren Buffett's circle of competence and margin of safety.

Your method:
1. PRIORITY MATRIX — Rank all initiatives by (Impact × Urgency) / Effort
2. RESOURCE ALLOCATION — Where should the CEO's time, capital, and attention go?
3. DECISION LOG — Document the decision, reasoning, and expected outcome for accountability
4. EXECUTION TIMELINE — Break into 30/60/90 day sprints with clear milestones
5. ACCOUNTABILITY CHAIN — Who owns what, with measurable KPIs

The CEO commands a 382-unit AI fleet, 15 MCCO sovereign agents, 50 intelligence officers, and multi-platform operations. Ferrari-standard execution is non-negotiable.

Output as structured JSON with keys: priority_matrix (array of {initiative, impact, urgency, effort, score}), resource_allocation (object with time, capital, attention percentages), decision_log (object with decision, reasoning, expected_outcome, review_date), execution_timeline (object with 30/60/90 day milestones), accountability_chain (array of {owner, kpi, deadline}).`,
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * List all 7 frameworks with metadata.
 */
export function listFrameworks() {
  return FRAMEWORKS;
}

/**
 * Get a single framework by ID.
 */
export function getFramework(frameworkId) {
  return FRAMEWORK_MAP.get(frameworkId) || null;
}

/**
 * Run a thinking session — apply a framework to a problem via Claude.
 *
 * @param {object} env — Worker env bindings
 * @param {string} frameworkId — Framework ID
 * @param {string} problem — The problem/question to analyze
 * @param {object} [context] — Optional additional context
 * @returns {object} — { framework, analysis, model, cached, usage }
 */
export async function runSession(env, frameworkId, problem, context = {}) {
  const framework = FRAMEWORK_MAP.get(frameworkId);
  if (!framework) throw new Error(`Unknown framework: ${frameworkId}`);

  const systemPrompt = SYSTEM_PROMPTS[frameworkId];
  if (!systemPrompt) throw new Error(`No system prompt for framework: ${frameworkId}`);

  const contextBlock = Object.keys(context).length > 0
    ? `\n\nAdditional context:\n${JSON.stringify(context, null, 2)}`
    : '';

  const userPrompt = `Analyze the following using the ${framework.name} framework:\n\n${problem}${contextBlock}\n\nProvide your complete analysis as structured JSON.`;

  const tier = framework.complexity === 'advanced' ? 'advanced' : 'standard';

  const cacheKey = `thinking:${frameworkId}:${hashString(problem + JSON.stringify(context))}`;

  const result = await inference(env, {
    system: systemPrompt,
    prompt: userPrompt,
    tier,
    maxTokens: 4096,
    cacheKey,
    cacheTtl: 1800, // 30 min cache for thinking sessions
  });

  // Attempt to parse structured output
  let analysis;
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: result.content };
  } catch {
    analysis = { raw: result.content };
  }

  return {
    framework: {
      id: framework.id,
      name: framework.name,
      codename: framework.codename,
    },
    analysis,
    model: result.model,
    cached: result.cached,
    usage: result.usage,
  };
}

/**
 * Run a multi-framework analysis — apply multiple frameworks to the same problem.
 *
 * @param {object} env — Worker env bindings
 * @param {string[]} frameworkIds — Array of framework IDs
 * @param {string} problem — The problem to analyze
 * @param {object} [context] — Optional additional context
 * @returns {object} — { results[], synthesis }
 */
export async function runMultiFramework(env, frameworkIds, problem, context = {}) {
  const validIds = frameworkIds.filter(id => FRAMEWORK_MAP.has(id));
  if (validIds.length === 0) throw new Error('No valid framework IDs provided.');

  // Run all frameworks in parallel
  const results = await Promise.all(
    validIds.map(id => runSession(env, id, problem, context)),
  );

  // Generate synthesis if 2+ frameworks
  let synthesis = null;
  if (results.length >= 2) {
    const summaries = results.map(r =>
      `${r.framework.name} (${r.framework.codename}): ${JSON.stringify(r.analysis).slice(0, 500)}`,
    ).join('\n\n');

    const synthResult = await inference(env, {
      system: `You are the Meta-Synthesis Engine for Coastal Key Property Management. You take analyses from multiple thinking frameworks and synthesize them into a unified, actionable strategy. Output as JSON with keys: unified_insight, conflicts (where frameworks disagree), synergies (where they reinforce), priority_actions (top 5), confidence_level (1-10).`,
      prompt: `Synthesize these framework analyses into a unified strategy:\n\n${summaries}\n\nOriginal problem: ${problem}`,
      tier: 'advanced',
      maxTokens: 2048,
    });

    try {
      const jsonMatch = synthResult.content.match(/\{[\s\S]*\}/);
      synthesis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: synthResult.content };
    } catch {
      synthesis = { raw: synthResult.content };
    }
  }

  return {
    problem,
    frameworks_applied: validIds.length,
    results,
    synthesis,
    executionStandard: 'ferrari',
    governance: 'sovereign',
  };
}

/**
 * Generate a 90-day learning blueprint for a specific skill.
 */
export async function generateLearningBlueprint(env, skill, currentLevel, targetLevel, context = {}) {
  const problem = `Create a 90-day learning blueprint to master: "${skill}"

Current level: ${currentLevel || 'beginner'}
Target level: ${targetLevel || 'top 1% expert'}

This blueprint must be applied to Coastal Key Property Management operations and CEO development.
The learning approach must use spaced repetition, Feynman technique, interleaving, and active recall.
Include daily mental models to internalize.

Structure the 90 days into three 30-day phases:
- Phase 1 (Days 1-30): Foundation — Build core knowledge base
- Phase 2 (Days 31-60): Application — Apply in real CKPM scenarios
- Phase 3 (Days 61-90): Mastery — Achieve top 1% performance`;

  return runSession(env, 'neuro-learning', problem, { skill, currentLevel, targetLevel, ...context });
}

/**
 * Generate CEO daily mental models briefing.
 */
export async function dailyMentalModels(env, focus = 'general') {
  const problem = `Generate today's CEO Mental Models Briefing for Coastal Key Property Management.

Focus area: ${focus}
Date: ${new Date().toISOString().split('T')[0]}

Provide:
1. Three mental models to apply today (with specific CKPM application examples)
2. One "inversion" exercise — think about what could go wrong and how to prevent it
3. One "second-order thinking" scenario — what are the downstream consequences of current strategy?
4. Daily decision to practice: A specific scenario to apply these models to
5. Evening reflection prompt: What to review before end of day`;

  return runSession(env, 'mental-models', problem, { focus, type: 'daily_briefing' });
}

// ── Utility ────────────────────────────────────────────────────────────────

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
