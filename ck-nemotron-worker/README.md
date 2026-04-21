# ck-nemotron-worker

NVIDIA Nemotron inference endpoint. Deployed to Cloudflare Workers.

- **Endpoints:** `POST /v1/inference` · `GET /v1/health`
- **Model:** `nvidia/nemotron-4-340b-instruct`
- **Deployed by:** GitHub Actions (`.github/workflows/deploy.yml` → `deploy-nemotron` job)

---

## Operator Remediation — Disable Cloudflare Workers Builds Git Integration

**Symptom:** Every push to any branch triggers a `Workers Builds: ck-nemotron-worker` check on the PR that returns a **failure** conclusion. This is a false negative — the GitHub Actions deploy pipeline (`deploy.yml`) is the authoritative deploy path, and Cloudflare's Git integration is redundant and misconfigured.

**Root cause:** Cloudflare Workers Builds auto-build was connected to this repository at some point, and Cloudflare's API does not expose a first-party endpoint to disconnect it programmatically (verified: `scripts/disable-nemotron-builds.sh` attempts four different endpoints — all return 404 or no-op).

**Permanent fix (manual, ~60 seconds):**

1. Open the Cloudflare dashboard: https://dash.cloudflare.com/
2. Navigate: **Workers & Pages** → **ck-nemotron-worker**
3. Click **Settings** → **Builds**
4. Click **Disconnect** (or the equivalent "Remove Git integration" button)
5. Confirm the disconnect
6. Re-run any open PR checks to confirm the false-negative no longer appears

Once disconnected, new PRs will only receive the authoritative `Test` check from GitHub Actions — the single source of truth for CI status.

---

## Redeploy Path After Disconnect

Nothing changes. Deploys continue to flow through GitHub Actions on push to `main`:

```
push to main → .github/workflows/deploy.yml
             → test job (Node.js test suite)
             → preflight job (Cloudflare token validation)
             → deploy-nemotron job (wrangler deploy)
```

No developer workflow change. No redeploy required to apply this fix.

---

## Verification Checklist

After disconnect:

- [ ] Push an empty commit to a test branch: `git commit --allow-empty -m "test: verify CI cleanup" && git push`
- [ ] Open a PR from that branch
- [ ] Confirm no `Workers Builds: ck-nemotron-worker` check appears
- [ ] Confirm only `Test` (and the other GitHub Actions jobs) are gating

---

## Why Not a Code-Level Fix

The current `wrangler.toml` already has no `[build]` section, which would normally tell Cloudflare to treat this as a deploy-only worker. Cloudflare Workers Builds ignores `wrangler.toml` when the Git integration is active at the service level — the dashboard toggle is the only control plane that overrides it.

Adding a no-op `[build]` command was considered and rejected: it would mask the false negative by passing trivially, but it would also leak that "build" behavior into the wrangler config, creating drift between the authoritative deploy path (GitHub Actions) and the Cloudflare build system.

The correct architectural posture: **one deploy path, no redundant systems.** GitHub Actions is canonical. Cloudflare's integration gets disconnected.

---

## Files Related to This Fix

| File | Purpose |
|---|---|
| `ck-nemotron-worker/wrangler.toml` | Worker config; comments document this issue |
| `scripts/disable-nemotron-builds.sh` | Programmatic disable attempt (all known endpoints) |
| `.github/workflows/disable-nemotron-builds.yml` | One-shot workflow to re-run the disable script |
| `.github/workflows/deploy.yml` | **Authoritative** deploy pipeline |
| `ck-nemotron-worker/README.md` | This file — operator remediation procedure |

---

## Governance

**Authority:** CEO / Governor operates the dashboard step directly, or delegates to a TEC division human operator with Cloudflare account access. No external interference permitted per Sovereign Governance.

**Audit trail:** Once disconnected, record the action in `#tech-alerts` Slack channel with timestamp, operator ID, and PR reference.

*Coastal Key Property Management — Sovereign Governance. One deploy path. Zero-defect CI.*
