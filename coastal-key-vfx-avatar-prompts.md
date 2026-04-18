# Coastal Key VFX Avatar Prompts — SUPERSEDED

> **Superseded**: this document's previous real-person-likeness content has
> been removed. All avatar specs now live under
> [`avatar-studio/`](./avatar-studio/) and are restricted to the CEO's own
> self-likeness only. Content-policy enforcement runs on every push via
> `.github/workflows/avatar-policy.yml`.

## Where things live now

| Concern | Location |
|---|---|
| Spec files (4 CEO-self-likeness avatars) | `avatar-studio/specs/*.spec.json` |
| Content-policy rules | `avatar-studio/lib/content-policy.js` |
| Build + policy gate | `avatar-studio/scripts/build.js` |
| CEO source-file preflight | `avatar-studio/scripts/preflight-ceo.js` |
| Render submission (Banana Pro) | `avatar-studio/scripts/render-via-banana-pro.js` |
| Unit tests (no network) | `tests/render-via-banana-pro.test.js` |
| CI regression guard | `.github/workflows/avatar-policy.yml` |

## Commands

```bash
npm run avatar:preflight   # Verify manus-documents/ceo/ is complete
npm run avatar:build       # Policy-gate + write avatar-studio/build/*
npm run avatar:render -- --dry-run
npm run avatar:render -- --only 04-ceo-orchestrator
```

## What changed

The earlier draft referenced third-party celebrity likenesses (publicity-rights
risk) and non-professional framing. Both are rejected by
`avatar-studio/lib/content-policy.js` at build time, so that material cannot
re-enter the pipeline without the CI job failing.

## What remains outside this environment

1. **Banana Pro transport fields** (four categories): base URL, generate + status
   paths, auth header, and the three body field names. Set via
   `BANANA_PRO_*` env vars or `avatar-studio/config.json`.
2. **CEO source files** under `manus-documents/ceo/`: front/side reference
   images, voice sample, bio. The preflight script enumerates what it expects.

Until both are provided, use `--dry-run` to inspect payload shape.
