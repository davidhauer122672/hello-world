/**
 * Workflow Executor — The core engine that replaces Zapier.
 *
 * Executes multi-step workflows defined as configuration objects.
 * Each workflow has: trigger conditions, steps (actions), error handling, and logging.
 *
 * Supports:
 *   - Sequential step execution with data passing between steps
 *   - Conditional branching (if/else per step)
 *   - Error handling with retry and fallback
 *   - Variable interpolation from trigger data and prior step outputs
 *   - Execution logging to KV + Airtable
 */

import { runAction } from './actions.js';
import { logExecution } from './logger.js';

/**
 * Execute a complete workflow.
 *
 * @param {object} workflow — Workflow definition from the registry
 * @param {object} triggerData — Data from the trigger event (e.g. Airtable record, webhook payload)
 * @param {object} env — Cloudflare Worker env bindings
 * @param {object} ctx — Cloudflare Worker execution context
 * @returns {object} — Execution result with step outputs and status
 */
export async function executeWorkflow(workflow, triggerData, env, ctx) {
  const executionId = `exec:${workflow.id}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  const execution = {
    id: executionId,
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: 'running',
    triggerData,
    steps: [],
    outputs: {},
    startedAt: new Date().toISOString(),
    completedAt: null,
    duration: null,
    error: null,
  };

  // Build context that steps can read from and write to
  const context = {
    trigger: triggerData,
    env,
    ctx,
    outputs: {},       // step outputs keyed by step id
    variables: {},     // shared variables across steps
    workflowId: workflow.id,
    executionId,
  };

  try {
    for (const step of workflow.steps) {
      // Evaluate step condition (skip if condition is false)
      if (step.condition && !evaluateCondition(step.condition, context)) {
        execution.steps.push({
          id: step.id,
          action: step.action,
          status: 'skipped',
          reason: 'Condition not met',
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      // Resolve step parameters with variable interpolation
      const resolvedParams = resolveParams(step.params || {}, context);

      const stepStart = Date.now();
      let stepResult;

      try {
        stepResult = await runAction(step.action, resolvedParams, env, ctx);

        // Store output for subsequent steps
        context.outputs[step.id] = stepResult;

        execution.steps.push({
          id: step.id,
          action: step.action,
          status: 'completed',
          output: summarizeOutput(stepResult),
          duration: Date.now() - stepStart,
          timestamp: new Date().toISOString(),
        });
      } catch (stepError) {
        // Retry logic
        if (step.retry && step.retry.maxAttempts > 0) {
          stepResult = await retryStep(step, resolvedParams, env, ctx);
          if (stepResult) {
            context.outputs[step.id] = stepResult;
            execution.steps.push({
              id: step.id,
              action: step.action,
              status: 'completed_after_retry',
              output: summarizeOutput(stepResult),
              duration: Date.now() - stepStart,
              timestamp: new Date().toISOString(),
            });
            continue;
          }
        }

        // If step is optional, continue; otherwise fail the workflow
        if (step.optional) {
          execution.steps.push({
            id: step.id,
            action: step.action,
            status: 'failed_optional',
            error: stepError.message,
            duration: Date.now() - stepStart,
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        // Hard failure
        execution.steps.push({
          id: step.id,
          action: step.action,
          status: 'failed',
          error: stepError.message,
          duration: Date.now() - stepStart,
          timestamp: new Date().toISOString(),
        });

        execution.status = 'failed';
        execution.error = `Step "${step.id}" failed: ${stepError.message}`;
        break;
      }
    }

    if (execution.status === 'running') {
      execution.status = 'completed';
    }
  } catch (err) {
    execution.status = 'failed';
    execution.error = err.message;
  }

  execution.completedAt = new Date().toISOString();
  execution.duration = Date.now() - startTime;
  execution.outputs = summarizeOutputs(context.outputs);

  // Log execution (non-blocking)
  ctx.waitUntil(logExecution(env, execution));

  return execution;
}

/**
 * Retry a failed step with exponential backoff.
 */
async function retryStep(step, params, env, ctx) {
  const { maxAttempts = 2, backoffMs = 1000 } = step.retry;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(backoffMs * attempt);
    try {
      return await runAction(step.action, params, env, ctx);
    } catch (err) {
      if (attempt === maxAttempts) return null;
    }
  }
  return null;
}

/**
 * Evaluate a condition object against the current workflow context.
 *
 * Supports:
 *   - { field: "trigger.status", equals: "New" }
 *   - { field: "trigger.amount", gt: 100 }
 *   - { field: "trigger.segment", in: ["Investor", "Luxury"] }
 *   - { field: "trigger.flag", exists: true }
 *   - { field: "outputs.step1.recordId", notEquals: null }
 *   - { all: [ ...conditions ] }
 *   - { any: [ ...conditions ] }
 */
export function evaluateCondition(condition, context) {
  if (condition.all) {
    return condition.all.every(c => evaluateCondition(c, context));
  }
  if (condition.any) {
    return condition.any.some(c => evaluateCondition(c, context));
  }

  const value = resolveValue(condition.field, context);

  if ('equals' in condition) return value === condition.equals;
  if ('notEquals' in condition) return value !== condition.notEquals;
  if ('gt' in condition) return value > condition.gt;
  if ('gte' in condition) return value >= condition.gte;
  if ('lt' in condition) return value < condition.lt;
  if ('lte' in condition) return value <= condition.lte;
  if ('in' in condition) return Array.isArray(condition.in) && condition.in.includes(value);
  if ('notIn' in condition) return !condition.notIn.includes(value);
  if ('contains' in condition) return typeof value === 'string' && value.includes(condition.contains);
  if ('exists' in condition) return condition.exists ? (value != null && value !== '') : (value == null || value === '');
  if ('matches' in condition) return new RegExp(condition.matches).test(value);

  return true;
}

/**
 * Resolve a dot-path value from the context.
 * e.g. "trigger.fields.Lead Name" → context.trigger.fields['Lead Name']
 */
export function resolveValue(path, context) {
  if (!path || typeof path !== 'string') return path;

  const parts = path.split('.');
  let current = context;

  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Resolve template variables in step parameters.
 * Supports {{trigger.fieldName}}, {{outputs.stepId.value}}, {{variables.key}}
 */
export function resolveParams(params, context) {
  if (typeof params === 'string') {
    return params.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const val = resolveValue(path.trim(), context);
      return val != null ? String(val) : '';
    });
  }

  if (Array.isArray(params)) {
    return params.map(item => resolveParams(item, context));
  }

  if (params && typeof params === 'object') {
    const resolved = {};
    for (const [key, value] of Object.entries(params)) {
      resolved[key] = resolveParams(value, context);
    }
    return resolved;
  }

  return params;
}

/**
 * Summarize a step output for logging (avoid storing huge payloads).
 */
function summarizeOutput(output) {
  if (!output) return null;
  if (typeof output === 'string') return output.slice(0, 500);
  if (typeof output === 'object') {
    const summary = {};
    for (const [key, value] of Object.entries(output)) {
      if (typeof value === 'string') summary[key] = value.slice(0, 200);
      else if (typeof value === 'object' && value?.id) summary[key] = { id: value.id };
      else summary[key] = value;
    }
    return summary;
  }
  return output;
}

function summarizeOutputs(outputs) {
  const summary = {};
  for (const [stepId, output] of Object.entries(outputs)) {
    summary[stepId] = summarizeOutput(output);
  }
  return summary;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
