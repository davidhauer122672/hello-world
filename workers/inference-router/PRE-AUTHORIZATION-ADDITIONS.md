# CKPM Inference Router — Pre-Authorization Additions

**Status:** Required before Module A dials a single number
**Date:** March 18, 2026
**Applies to:** Master Orchestrator v2.0, Section 2.3 (Nemotron Model Integration)

---

## Summary

Three items were missing from the Cloudflare Worker configuration described in the Master Orchestrator. All three have been implemented in `workers/inference-router/src/index.js` and enforced by the deploy gate script in `workers/inference-router/scripts/deploy.sh`.

---

## Addition 1: Anthropic API Tier Confirmation

**Problem.** The fallback path routes to the Anthropic API when Cloudflare Workers AI (Nemotron) is unavailable. Accounts below Tier 3 will hit rate limits under any meaningful load. Three modules sharing a single fallback endpoint makes this worse.

**What was added.**

| Component | Implementation |
|---|---|
| `wrangler.toml` | Documentation block requiring Tier 3 verification with console URL |
| `ANTHROPIC_TIER_CONFIRMED` env var | Boolean flag set via `wrangler secret put` after manual verification |
| `/tier-check` endpoint | Diagnostic endpoint returning tier confirmation status, required tier, and verification URL |
| `scripts/deploy.sh` | Deploy gate that blocks production push until operator confirms Tier 3+ |
| Airtable log | Every fallback call logs `Tier Confirmed: true/false` for audit |

**Verification URL:** https://console.anthropic.com/settings/limits

**Tier 3 provides:** 4,000 requests/min for Sonnet-class models, which is the practical floor for a 3-module fallback architecture.

---

## Addition 2: Per-Module Request Queue

**Problem.** When the primary model (Nemotron) goes down, all three modules could fire fallback requests to the Anthropic API simultaneously. Three parallel inference calls against the same rate-limit pool increases the probability of 429 responses and wastes quota on lower-priority modules while the revenue-generating module (Sentinel) waits.

**What was added.**

| Component | Implementation |
|---|---|
| `ModuleQueue` class | Semaphore that allows only one fallback request at a time |
| Priority ordering | `MODULE_A (0) > MODULE_B (1) > MODULE_C (2)` — Sentinel always goes first |
| Queue re-sorting | When a new request arrives while another is in-flight, the queue re-sorts by priority |
| `/queue-status` endpoint | Returns current queue depth, running state, and list of pending modules |
| `release()` guarantee | Queue slot is released in a `finally` block so a failed request never deadlocks the queue |

**Behavior under load.** If all three modules trigger fallback simultaneously, Module A (Sentinel) executes first. Module B waits. Module C waits behind Module B. Each module's request completes (or fails) before the next one starts. This prevents quota burn on social media captions while a sales call is waiting for an objection response.

---

## Addition 3: Exponential Backoff on 429 Responses

**Problem.** Without backoff, a rate-limited fallback call loops immediately and burns quota without completing any calls. The Anthropic API returns a `retry-after` header on 429 responses that must be respected.

**What was added.**

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

**Explanation.** `claude-sonnet-4-20250514` refers to base Sonnet 4. The current production model is `claude-sonnet-4-6`. Both share the same rate-limit pool, but `claude-sonnet-4-6` is the current supported version. The `wrangler.toml` and Worker code both use `claude-sonnet-4-6`.

The deploy gate script (`scripts/deploy.sh`) will flag and warn if the old model string is detected in `wrangler.toml`.

---

## File Manifest

```
workers/inference-router/
  wrangler.toml                  — Worker config with tier documentation and model string
  src/index.js                   — Worker code with queue, backoff, and tier gate
  scripts/deploy.sh              — Deploy gate enforcing all three checks
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

**None of this blocks authorization, but the Worker code needs these three additions before Module A dials a single number.**
