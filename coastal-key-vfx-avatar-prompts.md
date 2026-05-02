# Coastal Key VFX Avatar Prompts — SUPERSEDED

> **Superseded**: this document's previous real-person-likeness content has
> been removed. All avatar work now lives under
> [`avatar-studio/`](./avatar-studio/). Content policy is enforced at spec
> build time by `lib/avatar-spec.js` and guarded on every push by
> `.github/workflows/avatar-policy.yml`.

## Where things live now

| Concern | Location |
|---|---|
| Spec configs (4 builds) | `avatar-studio/specs/*.config.js` |
| Built machine specs | `avatar-studio/specs/built/*.json` |
| Pasteable prompt blocks | `avatar-studio/prompts/*.prompt.md` |
| Spec builder + content policy | `lib/avatar-spec.js` |
| Build driver | `avatar-studio/scripts/build-specs.js` |
| Spec builder tests | `tests/avatar-spec.test.js` |
| CEO source-file preflight | `avatar-studio/scripts/preflight-ceo.js` |
| Render submission (Banana Pro) | `avatar-studio/scripts/render-via-banana-pro.js` |
| Render submission tests | `tests/render-via-banana-pro.test.js` |
| Banana Pro transport config | `avatar-studio/config.json` |
| CI regression guard | `.github/workflows/avatar-policy.yml` |

## Content policy (non-negotiable)

Enforced in `lib/avatar-spec.js`:

1. Subjects must be `fictional`, `self`, or `non_human`. Third-party
   likeness is rejected at build time — no "X% different" bypass.
2. `contentRating` must be `G`, `PG`, or `PG-13`.
3. Sexualized / objectifying descriptors are rejected.
4. `self` subjects must supply `selfInputs.consentStatement` and
   `selfInputs.sourceFiles`; the render pipeline aborts on any missing
   source file rather than substituting likeness.

## Commands

```bash
npm run avatar:build        # Build all specs (policy-gated)
npm run avatar:preflight    # Enumerate CEO source-file status
npm run avatar:render -- --dry-run
npm run avatar:render -- --only ck-avatar-04-ceo-self
npm run test:server         # Runs both avatar-spec and render tests
```

## What remains outside this environment

1. **Banana Pro transport fields** (four categories): base URL, generate +
   status paths, auth header, and the three body field names. Configure via
   `BANANA_PRO_*` env vars or `avatar-studio/config.json`.
2. **CEO source files** for spec `ck-avatar-04-ceo-self` under
   `manus-documents/ceo/` and `notebooklm-exports/ceo-profile.md`.

Until both are provided, use `--dry-run` to inspect payload shape.
