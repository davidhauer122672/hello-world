# ck-nemotron-worker

NVIDIA Nemotron inference endpoint. Deployed to Cloudflare Workers.

- **Endpoints:** `POST /v1/inference` · `GET /v1/health`
- **Model:** `nvidia/nemotron-4-340b-instruct`
- **Deployed by:** GitHub Actions (`.github/workflows/deploy.yml` → `deploy-nemotron` job)

---

## Operator Remediation — Disable Cloudflare Workers Builds Git Integration

**Symptom:** Every push to any branch triggers a `Workers Builds: ck-nemotron-worker` check on the PR that returns a **failure** conclusion. This is a false negative — the GitHub Actions deploy pipeline (`deploy.yml`) is the authoritative deploy path.

**Permanent fix (~60 seconds):**

1. Cloudflare dashboard → **Workers & Pages** → **ck-nemotron-worker**
2. **Settings** → **Builds** → **Disconnect**
3. Confirm the disconnect

Once disconnected, PRs will only receive the authoritative `Test` check from GitHub Actions.

---

## Verification

- [ ] Push an empty commit to a test branch
- [ ] Open a PR — confirm no `Workers Builds: ck-nemotron-worker` check appears
- [ ] Record action in `#tech-alerts` Slack per audit-trail requirement

*Coastal Key Property Management — Sovereign Governance. One deploy path. Zero-defect CI.*
