/**
 * FallbackQueueCoordinator — Durable Object
 * ============================================
 * Serializes Anthropic API fallback requests across concurrent Worker
 * isolates. A single Durable Object instance acts as the coordination
 * point for all fallback traffic, ensuring:
 *
 *   1. Only one module's fallback request executes at a time.
 *   2. Module A (Sentinel) always takes priority over B and C.
 *   3. The retry-after / exponential backoff logic runs inside the
 *      Durable Object so backoff delays block the queue correctly.
 *
 * Architecture:
 *   Worker isolate (request) → DO.fetch("/enqueue") → DO processes
 *   queue in priority order → DO calls Anthropic → returns result
 *   to the waiting isolate.
 *
 * The Durable Object is a singleton (one instance globally) because
 * all fallback traffic shares a single Anthropic rate-limit pool.
 */

const MODULE_PRIORITY = { MODULE_A: 0, MODULE_B: 1, MODULE_C: 2 };

// Backoff parameters (mirrored from the original implementation)
const MAX_RETRIES   = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS  = 16000;
const JITTER_MAX_MS = 500;

export class FallbackQueueCoordinator {
  constructor(state, env) {
    this.state = state;
    this.env = env;

    // In-memory queue of pending requests, sorted by module priority.
    // Each entry: { module, payload, resolve, reject }
    this.queue = [];
    this.processing = false;
  }

  async fetch(request) {
    const url = new URL(request.url);

    // ---- Status endpoint (non-blocking) ----
    if (url.pathname === "/status") {
      return Response.json({
        queue_depth: this.queue.length,
        processing: this.processing,
        pending_modules: this.queue.map((q) => q.module),
      });
    }

    // ---- Enqueue a fallback request ----
    if (url.pathname === "/enqueue" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
      }

      const { module, anthropic_api_key, model, system, messages, max_tokens } = body;

      // Wrap in a promise that resolves when this request's turn comes
      const resultPromise = new Promise((resolve, reject) => {
        this.queue.push({
          module,
          payload: { anthropic_api_key, model, system, messages, max_tokens },
          resolve,
          reject,
        });

        // Re-sort by priority after every insertion
        this.queue.sort(
          (a, b) =>
            (MODULE_PRIORITY[a.module] ?? 99) -
            (MODULE_PRIORITY[b.module] ?? 99)
        );
      });

      // Kick off processing if not already running
      this.processQueue();

      // Wait for this request's result
      try {
        const result = await resultPromise;
        return Response.json(result);
      } catch (err) {
        return Response.json(
          { error: true, message: err.message || "Queue processing failed" },
          { status: 502 }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  }

  /**
   * Process the queue sequentially. Only one request executes at a time.
   * After each completion, the next highest-priority request runs.
   */
  async processQueue() {
    if (this.processing) return;  // Another loop is already running
    this.processing = true;

    while (this.queue.length > 0) {
      const entry = this.queue.shift();

      try {
        const result = await this.callAnthropicWithBackoff(entry.payload);
        entry.resolve(result);
      } catch (err) {
        entry.reject(err);
      }
    }

    this.processing = false;
  }

  /**
   * Call the Anthropic Messages API with exponential backoff on 429.
   * This runs inside the Durable Object, so backoff delays block the
   * queue correctly — no other module's request can proceed until this
   * one completes or exhausts retries.
   */
  async callAnthropicWithBackoff({ anthropic_api_key, model, system, messages, max_tokens }) {
    let attempt = 0;

    while (attempt <= MAX_RETRIES) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropic_api_key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens,
          system,
          messages,
        }),
      });

      // Success
      if (response.ok) {
        const data = await response.json();
        return {
          error: false,
          provider: "anthropic",
          model,
          content: data.content,
          usage: data.usage,
        };
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
            retries_attempted: MAX_RETRIES,
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

      // Non-429 error — do not retry
      const errorBody = await response.text().catch(() => "");
      return {
        error: true,
        status: response.status,
        message: `Anthropic API error: ${response.status}`,
        body: errorBody,
      };
    }
  }
}
