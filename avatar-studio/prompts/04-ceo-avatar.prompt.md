# Coastal Key CEO Avatar (Self-Likeness)

Role: Delivers CEO-voiced addresses, investor updates, and internal directives using the operator's authorized likeness and voice.
Renderer: banana_pro_ai
Target: iphone_16_pro_wallpaper, grok_companion, command_center_ceo_panel

## Subject
Name: Coastal Key CEO
Kind: self
Content rating: PG

Description:
- Photorealistic reconstruction driven entirely by authorized source files listed in selfInputs.
- Renderer must derive facial geometry, skin albedo, and hair from source footage only.
- Renderer must derive voice from source voice samples only.
- No descriptive features are declared in this spec; the pipeline is identity-preserving.

Authorized self-inputs:
- manus-documents/ceo/bio.md
- manus-documents/ceo/video-reference/*.mov
- manus-documents/ceo/voice-samples/*.wav
- notebooklm-exports/ceo-profile.md
Consent: Operator is the subject and authorizes use of their own likeness and voice for Coastal Key executive communications only.

## Wardrobe
- Derived from source footage; renderer must match operator's standard executive wardrobe
- Default fallback if wardrobe is ambiguous: navy tailored blazer, white shirt, no tie

## Environment
- Clean executive studio set, soft neutral backdrop (warm gray)
- Daylight key from camera-left at 45 degrees
- Shallow depth of field, backdrop reads as soft gradient

## Technical pipeline (Weta-grade)
- skin:
    - multi-layer subsurface scattering (epidermis, dermis, subcutaneous)
    - pore-level albedo and normal maps
    - vellus hair / peach fuzz visible in rim lighting
- eyes:
    - corneal refraction with environment reflection
    - scleral vein network at natural density
    - iris caustics from key light
    - tear film moisture on lower lid
- hair:
    - strand-level simulation (>= 100,000 strands)
    - wind and gravity dynamics
    - specular highlights from key light
- motion:
    - natural breathing cycle (12-16 breaths/min)
    - micro-expressions (brow, lip corner, nostril)
    - blink cycle (15-20/min, varied timing)
    - subtle weight shift / idle sway
- lighting:
    - three-point cinematic (warm key, cool fill, soft rim)
    - global illumination for skin bounce

## Animation
Loop: 5s seamless @ 60 fps
- breathing cycle derived from source footage
- blink rate derived from source footage (target 15-18/min)
- micro-expressions derived from source footage
- eyes track viewer with 2-degree range

## Delivery profile
Tone: strictly professional, CEO-level, data-driven
Cadence: measured, deliberate, pause before key metric

## Output
- 1179 x 2556 (iPhone 16 Pro native portrait)
- mov / H.265/HEVC
- Display P3, HDR10
