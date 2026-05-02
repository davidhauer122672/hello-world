# Cloudflare Worker Secrets — Coastal Key Platform

This runbook covers the operator-side `wrangler secret put` commands for
the three Cloudflare Worker services. These steps must run from a machine
with `wrangler` installed and a Cloudflare account logged in
(`wrangler login` once per machine).

The secrets are never written to this repository. Each `wrangler secret put`
command prompts for the value privately — paste at the prompt, not into the
shell history or this chat.

## Prerequisites

```bash
npm install -g wrangler@4
wrangler login
```

## Required secrets per worker

### `ck-api-gateway`

```bash
cd ck-api-gateway

wrangler secret put ANTHROPIC_API_KEY
wrangler secret put AIRTABLE_API_KEY        # the rotated PAT (do not paste here)
wrangler secret put AIRTABLE_BASE_ID        # appUSnNgpDkcEOzhN
wrangler secret put WORKER_AUTH_TOKEN
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put SLACK_SIGNING_SECRET
wrangler secret put SLACK_WEBHOOK_URL
wrangler secret put NVIDIA_API_KEY
wrangler secret put ATLAS_API_KEY
```

### `sentinel-webhook`

```bash
cd sentinel-webhook

wrangler secret put AIRTABLE_API_KEY
wrangler secret put AIRTABLE_BASE_ID        # appUSnNgpDkcEOzhN
wrangler secret put WORKER_AUTH_TOKEN
wrangler secret put SLACK_WEBHOOK_URL
wrangler secret put RETELL_WEBHOOK_SECRET
```

### `ck-nemotron-worker`

```bash
cd ck-nemotron-worker

wrangler secret put NVIDIA_API_KEY
wrangler secret put WORKER_AUTH_TOKEN
```

## Verifying secrets were set (no values revealed)

```bash
cd ck-api-gateway && wrangler secret list
cd ../sentinel-webhook && wrangler secret list
cd ../ck-nemotron-worker && wrangler secret list
```

`wrangler secret list` prints only the names — never the values. Compare
against the lists above; missing entries indicate a `secret put` step that
needs to be re-run.

## Triggering deployment

Deploy is automated via `.github/workflows/deploy.yml` on every push to
`main`. The flow:

1. `test` job runs all four test suites + the avatar-studio policy gate.
2. `preflight` job validates the Cloudflare API token before any deploy.
3. Parallel deploys: `website`, `gateway`, `command-center`.
4. Sequential deploys gated on `gateway`: `sentinel`, `nemotron`.

To trigger a deploy: merge an approved PR into `main`. The CI workflow
handles the rest. No manual `wrangler deploy` is required.

To deploy manually from a local machine (skipping CI), with the same
secrets configured:

```bash
npm run deploy
```

This runs `deploy:gateway`, `deploy:sentinel`, `deploy:cc`, and
`deploy:nemotron` sequentially.

## Rotation policy

Any time a secret is rotated upstream (Airtable PAT, Anthropic key, Slack
token, etc.), re-run the matching `wrangler secret put` for every worker
that consumes it. Workers do not auto-detect upstream rotations — a stale
secret returns 401/403 from the upstream service until it is updated here.

## Audit hooks

- All inbound API calls are logged to KV namespace `AUDIT_LOG` with 30-day
  TTL. See `ck-api-gateway/src/utils/audit.js`.
- Slack inbound calls are HMAC-verified before any work runs. See
  `SLACK_SIGNING_SECRET` use in the gateway.
- `wrangler tail <worker-name>` streams live logs from a deployed worker.
