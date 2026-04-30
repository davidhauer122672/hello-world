# Coastal Key Avatar Studio

Renderer-agnostic specifications for the CEO's photorealistic avatar and
live-wallpaper fleet. This module produces structured specs and pasteable
prompt blocks; it does not itself render video. Rendering is done by the
external pipeline (Banana Pro AI, Runway, etc.) fed with the artifacts
produced here.

## Build Inventory

| ID | Subject kind | Description |
|----|--------------|-------------|
| `ck-avatar-01-exec-comms` | fictional | Executive Communications Avatar ("Avery North") |
| `ck-avatar-02-exec-admin` | fictional | Executive Administrator Avatar ("Marcus Reyes") |
| `ck-wallpaper-03-treasure-coast-dawn` | non_human | Treasure Coast dawn live wallpaper |
| `ck-avatar-04-ceo-self` | self | CEO self-likeness avatar (operator-authorized inputs only) |

## Content Policy (Enforced by `lib/avatar-spec.js`)

1. Every subject must be `fictional`, `self`, or `non_human`. Subjects based
   on a real third party are rejected — no "X% different" bypass.
2. Every subject must declare `contentRating`. Only `G`, `PG`, and `PG-13`
   are accepted.
3. The spec tree is scanned for sexualized or objectifying descriptors.
   Matches cause `buildAvatarSpec` to throw.
4. `self` subjects must supply `selfInputs.consentStatement` and
   `selfInputs.sourceFiles`. The rendering pipeline must abort if any
   source file is missing rather than substituting likeness.

These gates are enforced at build time, which means the Orchestrator cannot
route a bad spec into production.

## Build

```bash
node avatar-studio/scripts/build-specs.js
```

Outputs:

- `avatar-studio/specs/built/*.json` — machine-readable spec payloads
- `avatar-studio/prompts/*.prompt.md` — pasteable prompt blocks
- `avatar-studio/specs/built/index.json` — manifest of all built specs

## Render Pipeline (External)

The build artifacts are the input to the render pipeline. The studio itself
does not call external APIs; the Orchestrator does. Expected flow:

```
config.js (authored)
   → buildAvatarSpec()        [validate + assemble]
   → specs/built/*.json       [machine payload]
   → prompts/*.prompt.md      [pasteable prompt]
   → Banana Pro / Runway      [render]
   → *.mov (1179x2556, 60fps) [artifact]
   → intoLive (iPhone)        [Live Photo conversion]
   → Wallpaper or Grok        [deployment]
```

## CEO Self-Avatar Inputs

The CEO avatar (spec 04) requires these authorized source files to exist
before render:

- `manus-documents/ceo/bio.md`
- `manus-documents/ceo/video-reference/*.mov`
- `manus-documents/ceo/voice-samples/*.wav`
- `notebooklm-exports/ceo-profile.md`

If any of those files are missing, the preflight check fails and no render
proceeds. The pipeline never substitutes likeness or voice from any other
source.

## Testing

Tests for the spec generator live in `tests/avatar-spec.test.js` and run
under the standard `npm run test:server` suite.
