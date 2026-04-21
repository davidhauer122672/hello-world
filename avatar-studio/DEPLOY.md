# Avatar Studio — Deployment Checklist

End-to-end path from `avatar-studio/` specs to a live wallpaper on iPhone
16 Pro. Steps are split by actor: the **repo** actions run from this codebase,
the **operator** actions require a browser, iOS device, or Banana Pro
account.

## Prerequisites

- Banana Pro AI account with API access (for the scripted path) OR a logged-in
  Banana Pro web session (for the paste path).
- iPhone 16 Pro running iOS 18+.
- intoLive app installed on the iPhone (App Store, free tier sufficient).
- For the CEO self-likeness build only: authorized source files at the paths
  declared in `avatar-studio/specs/04-ceo-avatar.config.js`.

---

## Path A — Paste (no API key required)

| # | Actor | Step |
|---|-------|------|
| 1 | repo | `node avatar-studio/scripts/build-specs.js` — regenerates JSON + prompts + bundle |
| 2 | operator | Open `avatar-studio/prompts/ALL-BUILDS.prompt.md` |
| 3 | operator | Copy the section between `<!-- BEGIN ck-... -->` and `<!-- END ck-... -->` for the build you want |
| 4 | operator | Paste into Banana Pro AI's prompt input |
| 5 | operator | Set output: 1179 × 2556 portrait, 60 fps, 4-sec seamless loop, HEVC `.mov`, Display P3, HDR10 |
| 6 | operator | Generate; download the `.mov` |
| 7 | operator | AirDrop the `.mov` to the iPhone 16 Pro |
| 8 | operator | Open intoLive → import `.mov` → export as Live Photo (save to Photos) |
| 9 | operator | iPhone → Settings → Wallpaper → Add New Wallpaper → Photos → select the Live Photo |
| 10 | operator | Enable the **Live** toggle in the wallpaper editor → Set |
| 11 | operator | Long-press the lock screen to confirm the loop plays |

Repeat steps 3–11 for each build you want deployed.

---

## Path B — Scripted (requires Banana Pro API key)

| # | Actor | Step |
|---|-------|------|
| 1 | operator | Obtain Banana Pro API key; confirm the three `TODO` blocks in `avatar-studio/scripts/render-via-banana-pro.js` match the current Banana Pro API (endpoint, auth scheme, response schema) |
| 2 | operator | `export BANANA_PRO_API_KEY=sk_...` |
| 3 | operator | `node avatar-studio/scripts/render-via-banana-pro.js` (or add `--only <id>` for a single build) |
| 4 | repo (script) | Submits each spec, polls to completion, downloads each `.mov` to `avatar-studio/renders/<id>.mov` |
| 5 | operator | AirDrop each `.mov` from `avatar-studio/renders/` to the iPhone 16 Pro |
| 6 | operator | Steps 8–11 from Path A |

Dry-run the payload before calling the API:

```bash
node avatar-studio/scripts/render-via-banana-pro.js --dry-run --only ck-wallpaper-03-treasure-coast-dawn
```

Probe the real endpoint with a minimal call and dump the raw response (use
this before a full run to verify the URL, auth, and schema against your
account):

```bash
export BANANA_PRO_API_KEY=sk_...
node avatar-studio/scripts/render-via-banana-pro.js --probe
```

---

## Path C — Scripted via Google Vertex AI Veo

| # | Actor | Step |
|---|-------|------|
| 1 | operator | Enable Vertex AI API on GCP project `coastal-key-soe` (Console → APIs & Services → Library → "Vertex AI API" → Enable) |
| 2 | operator | Create a GCS bucket for renders, e.g. `gs://ck-avatar-renders/` |
| 3 | operator | Grant the signed-in account `roles/aiplatform.user` and `roles/storage.objectAdmin` on that bucket |
| 4 | operator | `export GOOGLE_CLOUD_PROJECT=coastal-key-soe` |
| 5 | operator | `export VERTEX_LOCATION=us-central1` (or another supported region) |
| 6 | operator | `export VERTEX_MODEL=veo-3.0-generate-preview` |
| 7 | operator | `export VERTEX_STORAGE_URI=gs://ck-avatar-renders/` |
| 8 | operator | `export GOOGLE_ACCESS_TOKEN=$(gcloud auth print-access-token)` |
| 9 | operator | Probe first: `node avatar-studio/scripts/render-via-vertex.js --probe` |
| 10 | operator | Submit: `node avatar-studio/scripts/render-via-vertex.js` (polls to completion, writes manifest files under `avatar-studio/renders/<id>.vertex.json`) |
| 11 | operator | Download the `.mp4` files: `gsutil -m cp -r gs://ck-avatar-renders/ ./avatar-studio/renders/` |
| 12 | operator | Transcode to `.mov` for Live Photo: `ffmpeg -i input.mp4 -c:v hevc_videotoolbox -tag:v hvc1 output.mov` |
| 13 | operator | Steps 7–11 from Path A (AirDrop → intoLive → Wallpaper) |

Dry-run without calling the API:

```bash
GOOGLE_CLOUD_PROJECT=x VERTEX_STORAGE_URI=gs://x/ GOOGLE_ACCESS_TOKEN=x \
  node avatar-studio/scripts/render-via-vertex.js --dry-run --only ck-wallpaper-03-treasure-coast-dawn
```

Note: Vertex Veo outputs H.264/H.265 `.mp4`, not `.mov` directly. The
transcode step is required for iOS Live Photo compatibility. Vertex's
access-token auth also expires roughly every hour; re-run step 8 if you
get a 401 during a long session.

---

## Build IDs

| ID | Path A section to copy | Deployment target |
|----|------------------------|-------------------|
| `ck-avatar-01-exec-comms` | Between the matching BEGIN/END markers in `ALL-BUILDS.prompt.md` | Grok companion + Command Center briefing panel |
| `ck-avatar-02-exec-admin` | Between the matching BEGIN/END markers | Grok companion + Command Center ops panel |
| `ck-wallpaper-03-treasure-coast-dawn` | Between the matching BEGIN/END markers | iPhone 16 Pro live wallpaper |
| `ck-avatar-04-ceo-self` | Between the matching BEGIN/END markers | CEO Command Center panel + Grok companion |

---

## CEO Self-Likeness Preflight

Before running build 04, confirm every `selfInputs.sourceFiles` path exists:

- `manus-documents/ceo/bio.md`
- `manus-documents/ceo/video-reference/*.mov` (≥ 10s frontal-facing footage)
- `manus-documents/ceo/voice-samples/*.wav` (≥ 30s clean speech)
- `notebooklm-exports/ceo-profile.md`

If any are missing, the external pipeline must abort rather than substitute
likeness from any other source. Do not relax this check.

---

## QA Checklist (Per Render)

Run through this after each `.mov` is downloaded but before enabling as
wallpaper. Reject any build that fails a gate.

- [ ] Resolution is exactly 1179 × 2556 (no upscaling artifacts)
- [ ] Duration is 3–5 seconds, loop is seamless (no visible cut)
- [ ] Frame rate is steady 60 fps (no judder on iPhone playback)
- [ ] Container is `.mov`, codec is HEVC, color space is Display P3
- [ ] Skin (avatar builds): visible pore detail; no waxy look
- [ ] Eyes (avatar builds): visible corneal reflection and tear-film moisture
- [ ] Hair (avatar builds): strand-level; no clumping
- [ ] No watermarks, no visible text, no brand marks
- [ ] Content: no sexualized or objectifying framing present
- [ ] For build 04: the generated face and voice match the operator's
      authorized source files; no third-party likeness bleed

---

## Rollback

If a deployed wallpaper fails QA after install:

1. iPhone → Settings → Wallpaper → switch to a previous wallpaper.
2. Photos → delete the Live Photo.
3. Delete the source `.mov` from `avatar-studio/renders/`.
4. Fix the spec config under `avatar-studio/specs/NN-*.config.js`.
5. Re-run `node avatar-studio/scripts/build-specs.js`.
6. Re-render via Path A or Path B.

No partial or failed renders ship.
