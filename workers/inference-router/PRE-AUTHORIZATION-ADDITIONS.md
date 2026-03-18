# CKPM Inference Router — Pre-Authorization Additions

**Status:** Required before Module A dials a single number
**Date:** March 18, 2026 (revised)
**Applies to:** Master Orchestrator v2.0, Section 2.3 (Nemotron Model Integration)

---

## Summary

Three items were missing from the Cloudflare Worker configuration described in the Master Orchestrator. All three have been implemented. A subsequent code review identified two issues introduced by the initial implementation; both are resolved in this revision.

---

## Addition 1: Anthropic API Tier Confirmation

**Problem.** The fallback path routes to the Anthropic API when Cloudflare Workers AI (Nemotron) is unavailable. Accounts below Tier 3 will hit rate limits under any meaningful load. Three modules sharing a single fallback endpoint makes this worse.

**Implementation.**

| Component | Detail |
|---|---|
| `wrangler.toml` | Documentation block requiring Tier 3 verification with console URL |
| `ANTHROPIC_TIER_CONFIRMED` secret | Declared in `wrangler.toml` secrets documentation; set via `wrangler secret put`; read by Worker at runtime |
| `/tier-check` endpoint | Returns tier confirmation status, required tier, and verification URL |
| `scripts/deploy.sh` | Deploy gate blocks production push until operator confirms Tier 3+ |
| Airtable log | Every fallback call logs `Tier Confirmed: true/false` for audit |

**Verification URL:** https://console.anthropic.com/settings/limits

**Tier 3 provides:** 4,000 requests/min for Sonnet-class models, which is the practical floor for a 3-module fallback architecture.

**Issue 2 fix (from code review).** `ANTHROPIC_TIER_CONFIRMED` is now explicitly documented in the `wrangler.toml` secrets block and in the deploy script checklist. Previously it was read by the Worker code but undeclared in the toml, causing `env.ANTHROPIC_TIER_CONFIRMED` to evaluate to `undefined` and every Airtable log to write `Tier Confirmed: false`.

---

## Addition 2: Per-Module Request Queue (Durable Object)

**Problem.** When the primary model (Nemotron) goes down, all three modules could fire fallback requests to the Anthropic API simultaneously. Three parallel inference calls against the same rate-limit pool increases the probability of 429 responses and wastes quota on lower-priority modules while the revenue-generating module (Sentinel) waits.

**Initial implementation (v1).** A `ModuleQueue` class declared as a module-level global in the Worker. This was architecturally incorrect: Cloudflare Workers creates a new isolate per request, so the queue instance did not persist across concurrent HTTP requests. If Zapier triggered all three modules within seconds of each other during a Workers AI outage, each request arrived in its own isolate with its own queue. All three fired in parallel. The semaphore only serialized calls within a single request execution, which is not the failure scenario being protected against.

**Corrected implementation (v2).** The queue now lives in a **Durable Object** (`FallbackQueueCoordinator`), which persists outside the isolate lifecycle. A single globally-addressed instance coordinates all fallback traffic.

| Component | Detail |
|---|---|
| `src/queue-coordinator.js` | Durable Object class with in-memory priority queue |
| Singleton addressing | All isolates route to `idFromName("global-fallback-queue")` — one instance globally |
| Priority ordering | `MODULE_A (0) > MODULE_B (1) > MODULE_C (2)` — Sentinel always executes first |
| Queue re-sorting | On every insertion, the queue re-sorts by priority |
| Sequential processing | `processQueue()` loop runs one request at a time; backoff delays block the queue |
| `/queue-status` endpoint | Proxied from Worker to Durable Object; returns depth, running state, pending modules |
| `wrangler.toml` | Durable Object binding (`FALLBACK_QUEUE`) and migration tag (`v1`) declared |

**Behavior under load.** If all three modules trigger fallback simultaneously, each Worker isolate sends an `/enqueue` request to the Durable Object. The DO processes them sequentially in priority order: Module A first, then B, then C. Each module's request completes (including any backoff delays) before the next one starts. The Worker isolate that sent the request blocks on the DO response, so the caller receives the result transparently.

---

## Addition 3: Exponential Backoff on 429 Responses

**Problem.** Without backoff, a rate-limited fallback call loops immediately and burns quota without completing any calls. The Anthropic API returns a `retry-after` header on 429 responses that must be respected.

**Implementation.** The backoff logic runs inside the Durable Object, so delays block the queue correctly and prevent other modules from proceeding during a rate-limit event.

| Parameter | Value |
|---|---|
| Max retries | 5 |
| Base delay | 1,000 ms |
| Max delay cap | 16,000 ms |
| Jitter | 0–500 ms random (prevents thundering herd) |
| `retry-after` header | Read and used as delay when present; exponential calculation used as fallback |
| Exhaustion behavior | After 5 retries, returns structured error with hint to verify Tier 3 |

**Backoff sequence (without retry-after header):**

| Attempt | Base Delay | With Jitter (example) |
|---|---|---|
| 1 | 1,000 ms | 1,000–1,500 ms |
| 2 | 2,000 ms | 2,000–2,500 ms |
| 3 | 4,000 ms | 4,000–4,500 ms |
| 4 | 8,000 ms | 8,000–8,500 ms |
| 5 | 16,000 ms | 16,000–16,500 ms |

When the `retry-after` header is present, its value (in seconds) overrides the exponential calculation. Jitter is still added.

---

## Model String Correction

**Previous value in Master Orchestrator Section 2.3:**
```
Fallback: claude-sonnet-4-20250514 via Anthropic API if Workers AI is unavailable
```

**Corrected value:**
```
Fallback: claude-sonnet-4-6 via Anthropic API if Workers AI is unavailable
```

`claude-sonnet-4-20250514` refers to base Sonnet 4. The current production model is `claude-sonnet-4-6`. Both share the same rate-limit pool, but `claude-sonnet-4-6` is the current supported version. The `wrangler.toml` and Worker code both use `claude-sonnet-4-6`. The deploy gate script flags and warns if the old model string is detected.

---

## Minor Fix: Compatibility Date

Updated `compatibility_date` from `2024-01-01` (26 months stale) to `2025-09-01`. Cloudflare uses this date to gate breaking behavior changes in the Workers runtime. No functional impact today, but a stale date becomes a liability as the platform evolves.

---

## File Manifest

```
workers/inference-router/
  wrangler.toml                  — Worker config with DO binding, tier docs, model string
  src/index.js                   — Worker entry point; routes fallback through DO
  src/queue-coordinator.js       — Durable Object: cross-isolate queue with priority + backoff
  scripts/deploy.sh              — Deploy gate enforcing all four checks
  PRE-AUTHORIZATION-ADDITIONS.md — This document
```

---

## Deployment Sequence

1. Verify Anthropic account is Tier 3+ at https://console.anthropic.com/settings/limits
2. Set secrets:
   ```
   wrangler secret put ANTHROPIC_API_KEY
   wrangler secret put AIRTABLE_API_KEY
   wrangler secret put WORKER_AUTH_TOKEN
   wrangler secret put ANTHROPIC_TIER_CONFIRMED   # value: true
   ```
3. Update `wrangler.toml` with live Airtable base ID
4. Run `./scripts/deploy.sh staging` for staging test
5. Verify via `/health`, `/tier-check`, and `/queue-status` endpoints
6. Run `./scripts/deploy.sh production` for production deploy
7. Proceed with `AUTHORIZE MASTER ORCHESTRATOR`

---

**None of this blocks authorization, but the Worker code needs these additions before Module A dials a single number.**
