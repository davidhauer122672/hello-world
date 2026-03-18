/**
 * CKPM Inference Router — Cloudflare Worker
 * ===========================================
 * Routes AI inference requests from Nanobanana / Zapier to:
 *   1. Primary:  Cloudflare Workers AI  (@cf/nvidia/nemotron-3-120b-a12b)
 *   2. Fallback: Anthropic API          (claude-sonnet-4-6)
 *
 * Pre-authorization additions (March 2026):
 *   - Tier confirmation gate (Anthropic Tier 3+ required)
 *   - Per-module request queue with priority (Module A first)
 *   - Exponential backoff with retry-after on 429 responses
 *
 * Model note: The fallback model string is claude-sonnet-4-6 (current
 * production Sonnet). The earlier document referenced claude-sonnet-4-20250514
 * which is base Sonnet 4. Both share the same rate-limit pool, but
 * claude-sonnet-4-6 is the supported production version.
 */

// ---------------------------------------------------------------------------
// 1. MODULE PRIORITY QUEUE (Semaphore)
// ---------------------------------------------------------------------------
// Prevents all three modules from firing fallback calls in parallel.
// Module A (Sentinel) gets priority because it is revenue-generating.
//
// Priority order: MODULE_A > MODULE_B > MODULE_C
// Only one module's fallback request proceeds at a time. Others wait.
// ---------------------------------------------------------------------------

const MODULE_PRIORITY = { MODULE_A: 0, MODULE_B: 1, MODULE_C: 2 };

class ModuleQueue {
  constructor() {
    this.running = false;
    this.queue = [];           // Array of { module, resolve }
  }

  /** Enqueue a module request. Returns a promise that resolves when it is
   *  this request's turn to execute. */
  acquire(module) {
    return new Promise((resolve) => {
      if (!this.running) {
        this.running = true;
        resolve();
      } else {
        this.queue.push({ module, resolve });
        // Re-sort so highest-priority (lowest number) is first
        this.queue.sort(
          (a, b) =>
            (MODULE_PRIORITY[a.module] ?? 99) -
            (MODULE_PRIORITY[b.module] ?? 99)
        );
      }
    });
  }

  /** Release the semaphore and let the next queued request proceed. */
  release() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next.resolve();
    } else {
      this.running = false;
    }
  }
}

// Single global queue instance (lives for the Worker isolate lifetime).
const fallbackQueue = new ModuleQueue();


// ---------------------------------------------------------------------------
// 2. EXPONENTIAL BACKOFF WITH retry-after HANDLING
// ---------------------------------------------------------------------------
// On a 429 response from Anthropic, the Worker:
//   a) Reads the retry-after header (seconds) if present.
//   b) Falls back to exponential backoff: 1s, 2s, 4s, 8s, 16s.
//   c) Adds jitter (0-500ms) to avoid thundering herd.
//   d) Retries up to MAX_RETRIES times before returning an error.
// ---------------------------------------------------------------------------

const MAX_RETRIES    = 5;
const BASE_DELAY_MS  = 1000;
const MAX_DELAY_MS   = 16000;
const JITTER_MAX_MS  = 500;

/**
 * Call the Anthropic Messages API with automatic retry on 429.
 *
 * @param {string} apiKey      - Anthropic API key
 * @param {string} model       - Model string (e.g. claude-sonnet-4-6)
 * @param {string} system      - System prompt
 * @param {Array}  messages    - Conversation messages array
 * @param {number} maxTokens   - Max tokens for completion
 * @returns {Promise<object>}  - Parsed JSON response body
 */
async function callAnthropicWithBackoff(apiKey, model, system, messages, maxTokens) {
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });

    // Success — return immediately
    if (response.ok) {
      return await response.json();
    }

    // Rate limited — apply backoff
    if (response.status === 429) {
      attempt++;
      if (attempt > MAX_RETRIES) {
        return {
          error: true,
          status: 429,
          message: `Anthropic rate limit: exhausted ${MAX_RETRIES} retries`,
          hint: "Verify Anthropic account is Tier 3+. See console.anthropic.com/settings/limits",
        };
      }

      // Prefer retry-after header; fall back to exponential calculation
      const retryAfterHeader = response.headers.get("retry-after");
      let delayMs;

      if (retryAfterHeader) {
        const retryAfterSec = parseFloat(retryAfterHeader);
        delayMs = isNaN(retryAfterSec)
          ? Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS)
          : retryAfterSec * 1000;
      } else {
        delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
      }

      // Add jitter
      delayMs += Math.floor(Math.random() * JITTER_MAX_MS);

      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    // Non-429 error — return immediately, do not retry
    const errorBody = await response.text().catch(() => "");
    return {
      error: true,
      status: response.status,
      message: `Anthropic API error: ${response.status}`,
      body: errorBody,
    };
  }
}


// ---------------------------------------------------------------------------
// 3. TIER CONFIRMATION GATE
// ---------------------------------------------------------------------------
// Exposed as a /tier-check diagnostic endpoint. Also logged on every
// fallback invocation so the audit trail records whether the tier was
// verified before the Worker went live.
// ---------------------------------------------------------------------------

const TIER_CONFIRMED_HEADER = "X-Anthropic-Tier-Confirmed";

/**
 * Returns a diagnostic object for the tier check endpoint.
 * This does NOT call Anthropic — it reads the deploy-time env flag.
 */
function tierCheckResponse(env) {
  const confirmed = env.ANTHROPIC_TIER_CONFIRMED === "true";
  return {
    tier_confirmed: confirmed,
    required_tier: "Tier 3 (minimum)",
    verify_url: "https://console.anthropic.com/settings/limits",
    fallback_model: env.FALLBACK_MODEL || "claude-sonnet-4-6",
    note: confirmed
      ? "Tier 3+ confirmed at deploy time. Fallback is cleared for production load."
      : "WARNING: Tier not confirmed. Fallback will hit rate limits under load. "
        + "Set ANTHROPIC_TIER_CONFIRMED=true after verifying Tier 3+ in the Anthropic Console.",
  };
}


// ---------------------------------------------------------------------------
// 4. AIRTABLE LOGGING
// ---------------------------------------------------------------------------

async function logToAirtable(env, record) {
  if (!env.AIRTABLE_API_KEY || !env.AIRTABLE_BASE) return;

  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE}/${encodeURIComponent(env.AIRTABLE_TABLE || "AI Log")}`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Module: record.module,
        Provider: record.provider,
        Model: record.model,
        "Input Preview": (record.input || "").slice(0, 500),
        "Output Preview": (record.output || "").slice(0, 500),
        Status: record.status,
        "Retry Count": record.retryCount || 0,
        Timestamp: new Date().toISOString(),
        "Tier Confirmed": record.tierConfirmed || false,
      },
    }),
  }).catch(() => {});   // Fire-and-forget; do not block inference
}


// ---------------------------------------------------------------------------
// 5. MAIN WORKER ENTRY POINT
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ---- Health check ----
    if (url.pathname === "/health") {
      return Response.json({
        status: "ok",
        primary_model: env.PRIMARY_MODEL,
        fallback_model: env.FALLBACK_MODEL,
        environment: env.ENVIRONMENT,
      });
    }

    // ---- Tier check diagnostic endpoint ----
    if (url.pathname === "/tier-check") {
      return Response.json(tierCheckResponse(env));
    }

    // ---- Queue status endpoint ----
    if (url.pathname === "/queue-status") {
      return Response.json({
        queue_depth: fallbackQueue.queue.length,
        running: fallbackQueue.running,
        pending_modules: fallbackQueue.queue.map((q) => q.module),
      });
    }

    // ---- Inference endpoint ----
    if (request.method !== "POST" || url.pathname !== "/inference") {
      return new Response("Not found. POST /inference to run a completion.", {
        status: 404,
      });
    }

    // Auth
    const authHeader = request.headers.get("Authorization");
    if (!env.WORKER_AUTH_TOKEN || authHeader !== `Bearer ${env.WORKER_AUTH_TOKEN}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse request
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      module = "MODULE_UNDEFINED",
      system = "",
      messages = [],
      max_tokens = 2048,
    } = body;

    // Validate module tag
    if (!["MODULE_A", "MODULE_B", "MODULE_C"].includes(module)) {
      return Response.json(
        { error: `Invalid module tag: ${module}. Must be MODULE_A, MODULE_B, or MODULE_C.` },
        { status: 400 }
      );
    }

    const tierConfirmed = env.ANTHROPIC_TIER_CONFIRMED === "true";

    // ---- Attempt primary: Cloudflare Workers AI (Nemotron) ----
    let result;
    let provider = "cloudflare-workers-ai";
    let model = env.PRIMARY_MODEL;
    let retryCount = 0;
    let status = "success";

    try {
      const aiResponse = await env.AI.run(env.PRIMARY_MODEL, {
        messages: [{ role: "system", content: system }, ...messages],
        max_tokens,
      });

      result = aiResponse.response || aiResponse;
    } catch (primaryError) {
      // ---- Primary failed — fall back to Anthropic via queued path ----
      provider = "anthropic";
      model = env.FALLBACK_MODEL || "claude-sonnet-4-6";

      // Acquire queue slot (Module A gets priority)
      await fallbackQueue.acquire(module);

      try {
        const anthropicResult = await callAnthropicWithBackoff(
          env.ANTHROPIC_API_KEY,
          model,
          system,
          messages,
          max_tokens
        );

        if (anthropicResult.error) {
          status = "error";
          retryCount = MAX_RETRIES;
          result = JSON.stringify(anthropicResult);
        } else {
          // Extract text from Anthropic response format
          result =
            anthropicResult.content?.[0]?.text ||
            JSON.stringify(anthropicResult);
        }
      } catch (fallbackError) {
        status = "error";
        result = `Fallback failed: ${fallbackError.message}`;
      } finally {
        // Always release the queue slot
        fallbackQueue.release();
      }
    }

    // ---- Log to Airtable (non-blocking) ----
    const inputPreview = messages.length > 0
      ? messages[messages.length - 1].content || ""
      : "";

    ctx.waitUntil(
      logToAirtable(env, {
        module,
        provider,
        model,
        input: inputPreview,
        output: typeof result === "string" ? result : JSON.stringify(result),
        status,
        retryCount,
        tierConfirmed,
      })
    );

    // ---- Return response ----
    return Response.json({
      module,
      provider,
      model,
      tier_confirmed: tierConfirmed,
      output: result,
      status,
    });
  },
};
