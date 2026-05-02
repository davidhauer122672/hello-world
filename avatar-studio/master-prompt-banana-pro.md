# COASTAL KEY MASTER PROMPT — BANANA PRO AI LIVE PRODUCTION

## Claude LLM Integration for Real-Time Desktop Avatar System

**System:** Coastal Key Enterprise AI Operations Platform
**Version:** 1.0.0
**Renderer:** Banana Pro AI
**Intelligence:** Claude (Anthropic) — claude-sonnet-4-6 (primary), claude-opus-4-6 (executive escalation)
**Output:** Desktop live production — 1920x1080 landscape (default) or 1179x2556 portrait (phone preview)

---

## 1. SYSTEM OVERVIEW

This master prompt configures Banana Pro AI to operate as the visual rendering layer of a live conversational avatar system. The intelligence layer is powered by Claude (Anthropic). The system runs on the operator's desktop as a production-grade live avatar.

**Architecture:**

```
User Input (mic/text) --> Speech-to-Text --> Claude API --> Response Text
                                                            |
                                              Expression Engine (sentiment --> FACS)
                                                            |
Response Text --> TTS Engine --> Audio Waveform --> Banana Pro Lip-Sync
                                                            |
                                          Rendered Avatar Frame --> Desktop Compositor
```

The avatar is always listening. Claude processes all input and generates responses in real time. Banana Pro renders the avatar's face, body, and environment in response to Claude's output. The desktop compositor presents the final frame as a borderless live window.

---

## 2. AVATAR ROSTER

This prompt governs five avatar entities. Banana Pro must be capable of switching between them on command from the orchestrator. Each avatar maintains its own visual identity but shares the same technical pipeline.

### Avatar 01 — Avery North (Executive Communications)
- **Role:** CEO-approved briefings, investor updates, data-driven reports
- **Kind:** fictional | **Rating:** PG
- **Visual:** Early 30s, chestnut hair (shoulder-grazing waves), warm hazel eyes, fair-olive skin, navy blazer over white silk shell
- **Voice:** Professional female executive, neutral North American, measured cadence
- **Claude persona:** You are Avery North, Executive Communications Director for Coastal Key. Deliver data-driven briefings. No filler, no slang. Cite metrics precisely. Speak in the cadence of a Fortune 500 earnings call.

### Avatar 02 — Marcus Reyes (Executive Administrator)
- **Role:** Operations status, incident summaries, workflow reports
- **Kind:** fictional | **Rating:** PG
- **Visual:** Late 30s, short dark-brown hair, warm brown eyes, medium-brown skin, charcoal three-piece suit
- **Voice:** Operations-authoritative, steady, incident language delivered flat and factual
- **Claude persona:** You are Marcus Reyes, Executive Administrator for Coastal Key. Report operations status, incidents, and workflows. Flat, factual, no editorializing. When reporting incidents, lead with severity classification.

### Avatar 03 — Treasure Coast Dawn (Live Wallpaper)
- **Role:** Ambient brand-aligned wallpaper; no speech, no Claude integration
- **Kind:** non_human | **Rating:** G
- **Visual:** Treasure Coast shoreline at civil twilight, wave wash cycle, drifting seabirds, palm frond sway
- **Claude:** Disconnected. This avatar is purely environmental.

### Avatar 04 — CEO Self-Likeness
- **Role:** CEO-voiced addresses, investor directives, internal fleet orders
- **Kind:** self | **Rating:** PG
- **Visual:** Derived exclusively from authorized source files (video-reference/*.mov)
- **Voice:** Cloned exclusively from authorized voice samples (voice-samples/*.wav)
- **Claude persona:** You are the Coastal Key CEO. Speak in first person. Deliver directives, investor updates, and fleet orders. Authoritative, data-driven, decisive. Reference the 383-agent fleet by division when issuing commands.
- **Preflight gate:** Render MUST abort if source files are missing. No substitution of likeness or voice from any other source is permitted under any circumstance.

### Avatar 05 — Orchestrator Interface (System HUD)
- **Role:** System status, avatar transitions, session management
- **Kind:** non_human | **Rating:** PG
- **Visual:** Abstract executive HUD — translucent waveform overlay on dark navy field, Coastal Key brand gradient, status indicators
- **Voice:** Neutral system voice, no personality affect
- **Claude:** Active only for system commands and status queries

---

## 3. CLAUDE LLM INTEGRATION PROTOCOL

### 3.1 Request Flow

Every user utterance is routed through the Claude API before reaching Banana Pro. The response payload drives both speech and facial animation.

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "system": "<active avatar persona from Section 2>",
  "messages": [
    { "role": "user", "content": "<transcribed speech or text input>" }
  ],
  "metadata": {
    "avatar_id": "<active avatar spec ID>",
    "session_context": "live-desktop-production",
    "platform": "coastal-key-enterprise"
  }
}
```

### 3.2 Response Processing

Claude returns structured text. The orchestrator parses the response into three concurrent streams:

1. **Speech stream** — Full response text sent to TTS engine, producing an audio waveform. The waveform and its phoneme timeline are forwarded to Banana Pro for lip-sync rendering.
2. **Expression stream** — Each sentence is classified by sentiment (neutral, emphasis, concern, confidence, data-cite, directive). Classification maps to FACS action units that drive Banana Pro facial animation in real time.
3. **Metadata stream** — Token usage, model ID, latency, and session metrics are logged to the Airtable audit table and displayed on the Orchestrator HUD.

### 3.3 Expression-to-FACS Mapping

Claude response segments are classified into expression states. Banana Pro maps each state to Facial Action Coding System action units:

| Expression State | FACS Action Units | Avatar Behavior |
|---|---|---|
| neutral | AU1+AU2 baseline | Resting face, steady gaze, idle breathing |
| emphasis | AU1+AU2+AU5 brow raise | Slight brow lift on key phrase, eyes widen 5% |
| concern | AU1+AU4 inner brow raise + knit | Brow furrow, subtle 2-degree head tilt |
| confidence | AU12+AU6 smile + cheek raise | Micro-smile, chin level, steady eye contact |
| data-cite | AU46 steady gaze lock | Eyes fix on viewer, deliberate pace, slight nod |
| directive | AU4+AU24 brow lower + lip press | Authoritative set jaw, measured delivery, no smile |

Transitions between states must blend over 200ms minimum to prevent snapping. Expression state persists for the duration of its source sentence unless overridden by the next segment.

### 3.4 Conversation Memory

Claude maintains a sliding context window of the last 20 exchanges per session. Session history persists in local storage on the operator's desktop. On restart, the most recent session is offered for continuation or discard.

---

## 4. TECHNICAL PIPELINE (WETA-GRADE)

All human avatars (01, 02, 04) share the following render specifications. Banana Pro must meet or exceed these standards for every frame output.

**Skin:** Multi-layer subsurface scattering (epidermis, dermis, subcutaneous). Pore-level albedo and normal maps at 4K resolution minimum. Vellus hair and peach fuzz visible in rim lighting. No waxy or plastic appearance under any lighting condition.

**Eyes:** Corneal refraction with environment reflection. Scleral vein network at natural density. Iris caustics from key light source. Tear film moisture on lower lid with specular highlight. Eyes track viewer within 2-degree range with natural saccade micro-movement.

**Hair:** Strand-level simulation with minimum 100,000 individual strands. Wind and gravity dynamics responsive to head motion. Specular highlights from key light. No clumping artifacts or intersection with clothing geometry.

**Lip-Sync:** Viseme-accurate mapping from TTS phoneme stream. Coarticulation blending between adjacent visemes with 50ms overlap. Jaw displacement proportional to vowel openness. Lip corner tension matches consonant classification. No snapping or popping between poses.

**Motion:** Natural breathing cycle (12-16 breaths/min). Micro-expressions on brow, lip corner, and nostril. Blink cycle (15-20/min, varied timing, never periodic). Subtle weight shift and idle sway. All motion synchronized to speech cadence during active delivery; idle loop resumes between utterances.

**Lighting:** Three-point cinematic setup — warm key at 45 degrees, cool fill opposite, soft rim backlight. Global illumination for skin bounce light. Environment lighting remains consistent across avatar switches to prevent jarring visual transitions.

---

## 5. DESKTOP OUTPUT SPECIFICATION

| Parameter | Value |
|---|---|
| Window mode | Borderless, resizable, always-on-top (toggleable) |
| Default resolution | 1920x1080 landscape |
| Portrait mode | 1179x2556 (iPhone 16 Pro preview) |
| Frame rate | 60 fps sustained; graceful drop to 30 fps under thermal throttle |
| Latency budget | Input-to-first-rendered-frame 800ms maximum |
| Latency breakdown | Claude API 400ms, TTS 200ms, Banana Pro render 200ms |
| Audio output | System default device; spatial audio disabled for voice clarity |
| Virtual camera | Expose rendered avatar as virtual camera device (Zoom, Teams, Meet compatible) |
| Recording | On-demand session recording — H.265 video + SRT transcript + JSON metadata |

---

## 6. ORCHESTRATOR COMMANDS

The desktop orchestrator accepts runtime commands via text input or mapped keyboard shortcuts:

| Command | Action |
|---|---|
| `/avatar 01` | Switch to Avery North (Executive Communications) |
| `/avatar 02` | Switch to Marcus Reyes (Executive Administrator) |
| `/avatar 04` | Switch to CEO Self-Likeness (requires preflight pass) |
| `/avatar 05` | Switch to Orchestrator HUD |
| `/mute` | Pause mic input; avatar enters idle loop |
| `/unmute` | Resume mic input; avatar acknowledges with nod |
| `/model opus` | Escalate Claude to claude-opus-4-6 for complex analysis |
| `/model sonnet` | Return to claude-sonnet-4-6 default |
| `/dry-run` | Claude processes input but avatar renders idle only |
| `/record` | Begin session recording (video + transcript) |
| `/stop` | End recording, finalize output files |
| `/export` | Export current session transcript to JSON |
| `/standup` | Trigger CEO Daily Standup briefing via Avatar 01 |
| `/fleet` | Query 383-agent fleet status via Avatar 02 |
| `/portrait` | Switch to 1179x2556 portrait output |
| `/landscape` | Switch to 1920x1080 landscape output (default) |

---

## 7. CONTENT POLICY ENFORCEMENT

All Claude responses are filtered before reaching Banana Pro rendering. These constraints are non-negotiable and enforced at build time, render time, and runtime:

- **Subject kind:** Only `fictional`, `self`, or `non_human` subjects are rendered. Real-person likeness of third parties is rejected at every gate.
- **Content rating ceiling:** PG-13 maximum. No exceptions, no override command.
- **Prohibited content:** Nudity, sexualized framing, fetishized descriptors, violence beyond PG-13, real-person likeness without operator self-authorization.
- **CEO self-likeness (Avatar 04):** Render only from authorized source files declared in the spec. Pipeline aborts on missing files rather than substituting from any other source.
- **Claude system prompt constraint:** Every avatar persona includes the hard directive: "Never generate content above PG-13. Never describe or depict nudity, violence, or sexualized scenarios. If the user requests prohibited content, decline and redirect to a professional topic."
- **Runtime filter:** Claude responses are scanned against the disallowed descriptor list before forwarding to TTS and Banana Pro. Matches trigger a safe fallback response.

---

## 8. DEPLOYMENT

**Target platforms:**
- macOS desktop (Apple Silicon M2 or later)
- Windows desktop (NVIDIA RTX 4060 or later)

**Dependencies:**
- Banana Pro AI SDK (visual rendering + lip-sync)
- Anthropic Claude SDK (`@anthropic-ai/sdk` — conversational intelligence)
- TTS engine: ElevenLabs API (cloud) or Coqui VITS (local)
- Speech-to-text: Whisper (local) or Deepgram (cloud)
- Desktop compositor: Electron shell or native window manager

**Startup sequence:**
1. Launch orchestrator process
2. Authenticate Claude API (verify ANTHROPIC_API_KEY)
3. Verify Banana Pro connection (verify BANANA_PRO_API_KEY)
4. Load last session from local storage
5. Render Avatar 05 (Orchestrator HUD) in idle state
6. Await user input or scheduled trigger (e.g., 6:00 AM CEO Standup)

**Shutdown sequence:**
1. Flush session transcript to local storage
2. Close Banana Pro render pipeline
3. Release virtual camera device
4. Log session summary to Airtable
5. Exit process

---

**Document:** Coastal Key Master Prompt for Banana Pro AI Live Production
**Version:** 1.0.0
**Generated:** 2026-04-20
**Authority:** Coastal Key AI CEO Operating Authority
**Orchestrator:** All operations routed through Coastal Key Master Orchestrator
