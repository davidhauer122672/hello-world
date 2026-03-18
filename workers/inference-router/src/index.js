/**
 * CKPM Inference Router — Cloudflare Worker
 * ===========================================
 * Routes AI inference requests from Nanobanana / Zapier to:
 *   1. Primary:  Cloudflare Workers AI  (@cf/nvidia/nemotron-3-120b-a12b)
 *   2. Fallback: Anthropic API          (claude-sonnet-4-6)
 *
 * Pre-authorization additions (March 2026):
 *   - Tier confirmation gate (Anthropic Tier 3+ required)
 *   - Durable Object queue coordinator (cross-isolate serialization)
 *   - Exponential backoff with retry-after on 429 responses
 *
 * Architecture note: The fallback queue lives in a Durable Object
 * (FallbackQueueCoordinator), not in the Worker isolate. Cloudflare
 * Workers create a new isolate per request, so module-level state
 * cannot serialize across concurrent requests. The Durable Object is
 * a singleton that persists across all isolates and enforces:
 *   - One fallback request at a time
 *   - Module A (Sentinel) priority over B and C
 *   - Backoff delays that block the queue correctly
 *
 * Model note: The fallback model string is claude-sonnet-4-6 (current
 * production Sonnet). The earlier document referenced claude-sonnet-4-20250514
 * which is base Sonnet 4. Both share the same rate-limit pool, but
 * claude-sonnet-4-6 is the supported production version.
 */

// Re-export the Durable Object class so the runtime can instantiate it.
export { FallbackQueueCoordinator } from "./queue-coordinator.js";


// ---------------------------------------------------------------------------
// TIER CONFIRMATION
// ---------------------------------------------------------------------------

const TIER_CONFIRMED_HEADER = "X-Anthropic-Tier-Confirmed";

function tierCheckResponse(env) {
  const confirmed = env.ANTHROPIC_TIER_CONFIRMED === "true";
  return {
    tier_confirmed: confirmed,
    required_tier: "Tier 3 (minimum)",
    verify_url: "https://console.anthropic.com/settings/limits",
    fallback_model: env.FALLBACK_MODEL || "claude-sonnet-4-6",
    note: confirmed
      ? "Tier 3+ confirmed at deploy time. Fallback is cleared for production load."
      : "WARNING: Tier not confirmed. Set ANTHROPIC_TIER_CONFIRMED=true via "
        + "'wrangler secret put' after verifying Tier 3+ in the Anthropic Console.",
  };
}


// ---------------------------------------------------------------------------
// AIRTABLE LOGGING
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
// DURABLE OBJECT STUB HELPER
// ---------------------------------------------------------------------------

/**
 * Returns a stub to the singleton FallbackQueueCoordinator Durable Object.
 * All fallback traffic routes through a single instance (keyed by a fixed
 * name) so the queue serializes across every concurrent isolate.
 */
function getQueueStub(env) {
  const id = env.FALLBACK_QUEUE.idFromName("global-fallback-queue");
  return env.FALLBACK_QUEUE.get(id);
}


// ---------------------------------------------------------------------------
// MAIN WORKER ENTRY POINT
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
        queue_backend: "durable-object",
      });
    }

    // ---- Tier check diagnostic endpoint ----
    if (url.pathname === "/tier-check") {
      return Response.json(tierCheckResponse(env));
    }

    // ---- Queue status (proxied to Durable Object) ----
    if (url.pathname === "/queue-status") {
      try {
        const stub = getQueueStub(env);
        const doResponse = await stub.fetch(
          new Request("https://do-internal/status")
        );
        const data = await doResponse.json();
        return Response.json(data);
      } catch (err) {
        return Response.json(
          { error: "Could not reach queue coordinator", detail: err.message },
          { status: 503 }
        );
      }
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
      // ---- Primary failed — route fallback through Durable Object ----
      provider = "anthropic";
      model = env.FALLBACK_MODEL || "claude-sonnet-4-6";

      try {
        const stub = getQueueStub(env);
        const doResponse = await stub.fetch(
          new Request("https://do-internal/enqueue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              module,
              anthropic_api_key: env.ANTHROPIC_API_KEY,
              model,
              system,
              messages,
              max_tokens,
            }),
          })
        );

        const doResult = await doResponse.json();

        if (doResult.error) {
          status = "error";
          retryCount = doResult.retries_attempted || 0;
          result = JSON.stringify(doResult);
        } else {
          // Extract text from Anthropic response format
          result =
            doResult.content?.[0]?.text ||
            JSON.stringify(doResult);
        }
      } catch (fallbackError) {
        status = "error";
        result = `Fallback failed: ${fallbackError.message}`;
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
