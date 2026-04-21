# Pending Forge — Instagram Reel DWZVIhxgV48

Status: **P0 BLOCKED** — awaiting source artifact.

## Target
Source: https://www.instagram.com/reel/DWZVIhxgV48/
Intent: build the reel's lesson into a Claude skill via `sovereign-skill-forge`.

## Block reason
Instagram returns HTTP 403 to unauthenticated fetchers. No video-viewing capability in this harness. Under Sovereign Skill Forge input contract, fabrication is refused.

## Unblock checklist
Drop any ONE of the following into `./source/` and re-invoke the forge:
- `transcript.txt` — spoken words, verbatim
- `caption.txt` — Instagram caption text, verbatim
- `lesson.md` — the lesson in the CEO's own words, 3–10 bullets
- screenshots `*.png` of the caption (Read tool will OCR visually)

## On unblock
Forge will execute P0→P9 and publish:
`.claude/skills/<derived-name>/SKILL.md`

Skill name will be derived from the lesson nucleus, not the reel ID.
