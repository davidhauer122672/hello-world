# avatar-studio

Coastal Key executive avatar pipeline. Four CEO-self-likeness specs, built
and policy-gated locally, rendered via the Banana Pro API.

## Directory layout

```
avatar-studio/
├── config.json                       # Banana Pro transport + field config
├── specs/
│   ├── 01-ceo-governance.spec.json
│   ├── 02-ceo-operations.spec.json
│   ├── 03-ceo-retail-finance.spec.json
│   └── 04-ceo-orchestrator.spec.json  # requires CEO source files
├── lib/
│   ├── content-policy.js             # identity + descriptor rules
│   └── build-payload.js              # buildRequestPayload()
├── scripts/
│   ├── preflight-ceo.js              # checks manus-documents/ceo/
│   ├── build.js                      # policy + preflight gate
│   └── render-via-banana-pro.js      # submit to Banana Pro API
└── build/                            # generated (gitignored)
```

## Commands

| Command | Purpose |
|---|---|
| `npm run avatar:preflight` | Enumerate missing CEO source files |
| `npm run avatar:build`     | Policy-gate all specs, write `build/*.prompt.json` |
| `npm run avatar:render -- --dry-run` | Print payload shape without touching network |
| `npm run avatar:render -- --only 04-ceo-orchestrator` | Submit one spec |

## Content policy

Every spec is walked string-by-string and checked against:

1. Identity source must be `ceo-self-likeness`.
2. No third-party real-person names (see
   `avatar-studio/lib/content-policy.js` for the full pattern list).
3. No sexualized or seductive descriptors.
4. Required schema fields present.

A single violation fails the build (exit 1), which fails the CI job.

## Config — Banana Pro

Set once per environment, either in `avatar-studio/config.json` or via env:

| Env var | Meaning |
|---|---|
| `BANANA_PRO_BASE_URL` | API base URL |
| `BANANA_PRO_GENERATE_PATH` | POST path for generation |
| `BANANA_PRO_STATUS_PATH` | GET path for job status |
| `BANANA_PRO_AUTH_HEADER` | Full `Authorization` header value |
| `BANANA_PRO_PROMPT_FIELD` | Body field name for prompt text |
| `BANANA_PRO_METADATA_FIELD` | Body field name for metadata |
| `BANANA_PRO_OUTPUT_FORMAT_FIELD` | Body field name for output format |
| `BANANA_PRO_API_KEY` | Required unless `--dry-run` |

## Preflight — `manus-documents/ceo/`

Build 04 aborts until every file resolves:

- `reference-front.{jpg,jpeg,png}`
- `reference-side.{jpg,jpeg,png}`
- `voice-sample.{wav,mp3,m4a}`
- `bio.md`
