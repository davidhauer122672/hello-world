/**
 * Coastal Key Bauhaus Design System
 *
 * Founded 1919, Weimar. Walter Gropius. "Form follows function."
 * Applied 2026, Treasure Coast. Coastal Key Property Management LLC.
 *
 * Every asset — logo, property photos, marketing, signage, website,
 * portal, reports — adheres to Bauhaus principles:
 *
 *   Geometric shapes only (rectangle, circle, triangle)
 *   Primary palette (black, white, red, blue, yellow)
 *   Sans-serif typography (Herbert Bayer universal style)
 *   Asymmetrical balance with grid system
 *   Zero ornamentation — no shadows, gradients, decorative elements
 *   Functional, modern, timeless — Dessau 1926 meets coastal PM 2026
 *
 * References: Walter Gropius, Herbert Bayer, Marcel Breuer, László Moholy-Nagy
 */

const BAUHAUS_SYSTEM = {
  id: 'CK-BAUHAUS-DS',
  version: '1.0.0',
  name: 'Coastal Key Bauhaus Design System',
  origin: 'Bauhaus (Staatliches Bauhaus), founded 1919 by Walter Gropius, Weimar, Germany',
  corePhilosophy: 'Form follows function. No decoration for its own sake.',
  entity: 'Coastal Key Property Management LLC',
};

const DESIGN_PRINCIPLES = [
  {
    id: 'BP-01',
    principle: 'Form Follows Function',
    origin: 'Walter Gropius, Bauhaus Manifesto 1919',
    rule: 'Every visual element must serve a purpose. If it does not communicate information or guide action, remove it.',
    application: 'Logos communicate identity. Layouts guide the eye. Colors signal meaning. Typography ensures legibility. Nothing else.',
    violation: 'Drop shadows, decorative borders, ornamental icons, texture overlays, gradient fills',
  },
  {
    id: 'BP-02',
    principle: 'Geometric Purity',
    origin: 'Wassily Kandinsky, Bauhaus form theory',
    rule: 'Use only fundamental geometric shapes: rectangles, circles, triangles. All compound forms derive from these three.',
    application: 'Logo built from geometric primitives. Layout grids use rectangular modules. Icons are geometric abstractions.',
    violation: 'Organic shapes, freeform curves, hand-drawn elements, irregular outlines',
  },
  {
    id: 'BP-03',
    principle: 'Primary Color Discipline',
    origin: 'Johannes Itten / Kandinsky color theory',
    rule: 'Palette limited to black, white, and the three primaries: red, blue, yellow. Grays permitted as tonal variants of black-white axis.',
    application: 'Brand uses deep blue (#1B365D) as primary, geometric red (#C41E3A) for alerts, gold-yellow (#DAA520) for accents. Black for text. White for space.',
    violation: 'Pastels, neons, multi-color gradients, decorative color use',
  },
  {
    id: 'BP-04',
    principle: 'Universal Typography',
    origin: 'Herbert Bayer, Universal Typeface 1925',
    rule: 'Sans-serif only. Geometric letterforms. Maximum legibility. Lowercase-favored where appropriate. No serif, script, or decorative type.',
    application: 'Montserrat for headings (geometric sans). Inter for body (clarity-optimized). System sans-serif for UI. All weights used purposefully.',
    violation: 'Serif fonts, script fonts, decorative typefaces, excessive font weights, ALL CAPS abuse',
  },
  {
    id: 'BP-05',
    principle: 'Asymmetrical Balance',
    origin: 'László Moholy-Nagy, New Typography movement',
    rule: 'Layouts are asymmetrical but perfectly balanced through visual weight distribution. Grid-based composition with generous white space.',
    application: 'Website uses 12-column grid. Reports use asymmetric headers with left-aligned content. White space is a design element, not empty space.',
    violation: 'Centered-everything layouts, cramped margins, wall-of-text density, symmetrical decoration',
  },
  {
    id: 'BP-06',
    principle: 'Material Honesty',
    origin: 'Marcel Breuer (Wassily Chair), Bauhaus workshop ethos',
    rule: 'Show materials as they are. Digital assets should feel like what they are — screens, not paper simulations. No skeuomorphism.',
    application: 'Flat UI design. PDF reports use clean grid layouts, not faux-leather textures. Property photos show real conditions, not HDR fantasies.',
    violation: 'Skeuomorphic UI, faux textures, HDR-overprocessed photos, fake depth effects',
  },
];

const DESIGN_TOKENS = {
  colors: {
    primary: { name: 'Coastal Navy', hex: '#1B365D', usage: 'Primary brand, headers, navigation', bauhausMapping: 'Blue (Kandinsky: calm, spiritual, depth)' },
    accent: { name: 'Signal Red', hex: '#C41E3A', usage: 'Alerts, CTAs, urgent notifications', bauhausMapping: 'Red (Kandinsky: warm, energetic, action)' },
    highlight: { name: 'Precision Gold', hex: '#DAA520', usage: 'Premium elements, key accent, achievement markers', bauhausMapping: 'Yellow (Kandinsky: bright, angular, attention)' },
    black: { name: 'True Black', hex: '#1A1A1A', usage: 'Body text, primary content', bauhausMapping: 'Foundation — maximum contrast' },
    white: { name: 'Pure White', hex: '#FFFFFF', usage: 'Backgrounds, breathing space', bauhausMapping: 'Negative space — essential, not empty' },
    gray100: { name: 'Light Gray', hex: '#F5F5F5', usage: 'Background sections, subtle separation' },
    gray400: { name: 'Mid Gray', hex: '#9E9E9E', usage: 'Secondary text, borders, dividers' },
    gray700: { name: 'Dark Gray', hex: '#424242', usage: 'Subheadings, secondary content' },
  },
  typography: {
    heading: { family: 'Montserrat', weights: [500, 700], style: 'Geometric sans-serif', bauhausRef: 'Inspired by Herbert Bayer Universal, geometric precision' },
    body: { family: 'Inter', weights: [400, 500], style: 'Clarity-optimized sans-serif', bauhausRef: 'Optimized for screen legibility, functional type' },
    mono: { family: 'JetBrains Mono', weights: [400], style: 'Technical data display', bauhausRef: 'Functional typography for data and code' },
    scale: {
      h1: '2.5rem / 700 / -0.02em tracking',
      h2: '2rem / 700 / -0.01em tracking',
      h3: '1.5rem / 600 / 0 tracking',
      body: '1rem / 400 / 0.01em tracking',
      small: '0.875rem / 400 / 0.02em tracking',
      caption: '0.75rem / 400 / 0.03em tracking',
    },
  },
  spacing: {
    unit: '8px',
    scale: ['0', '4px', '8px', '16px', '24px', '32px', '48px', '64px', '96px', '128px'],
    gridColumns: 12,
    maxWidth: '1200px',
    containerPadding: '24px',
  },
  shapes: {
    allowed: ['rectangle', 'circle', 'triangle'],
    borderRadius: { none: '0', small: '2px', medium: '4px' },
    rule: 'No rounded corners beyond 4px. Geometric precision over friendly softness.',
  },
};

const ASSET_SPECIFICATIONS = {
  logo: {
    construction: 'Geometric primitives only — rectangle (key shaft), circle (key head), triangle (key teeth). No organic curves.',
    colorVersions: ['Navy on white (primary)', 'White on navy (reversed)', 'Black on white (print)', 'Gold accent version (premium)'],
    clearSpace: 'Minimum clear space = height of the C in COASTAL KEY on all sides',
    minimumSize: '24px height for digital, 0.5 inch for print',
    forbiddenModifications: ['Rotation', 'Distortion', 'Color changes outside system', 'Adding shadows or effects', 'Enclosing in non-geometric shapes'],
  },
  propertyPhotos: {
    style: 'Documentary — honest, well-lit, no HDR. Show the property as it is.',
    composition: 'Rule of thirds grid. Horizontal orientation. Level horizon line.',
    processing: 'Minimal — white balance correction, exposure normalization only. No filters, no saturation boost, no vignettes.',
    metadata: 'Timestamped, geotagged, sequential numbering (PROP-XXX-YYYY-MM-DD-NNN)',
  },
  marketing: {
    layouts: 'Asymmetric grid. Left-aligned text blocks. Geometric color blocks for visual weight.',
    imagery: 'Property photos in rectangular frames. No rounded corners. No overlapping elements.',
    cta: 'Rectangular button, navy or red background, white geometric sans text. No gradients, no rounded pills.',
    whitespace: 'Minimum 30% of any composition must be white/negative space.',
  },
  signage: {
    material: 'Brushed aluminum or matte white panel. No glossy finishes.',
    typography: 'Montserrat Bold, navy on white or white on navy. All caps for company name only.',
    dimensions: 'Property signs: 18x24 inches. Door signs: 4x10 inches. Vehicle: full wrap with geometric grid.',
    placement: 'Centered on mounting surface. Level. Clean mounting hardware — no visible screws.',
  },
  website: {
    layout: '12-column grid. Maximum content width 1200px. Generous vertical spacing.',
    navigation: 'Top horizontal bar, navy background, white geometric sans text. No hamburger menus on desktop.',
    cards: 'Rectangular. 1px border (gray-400). No shadows. 16px internal padding.',
    animations: 'None. No parallax, no fade-ins, no hover effects beyond color change. Static is honest.',
  },
  reports: {
    format: 'Single-column with asymmetric header. Grid data tables with 1px borders.',
    header: 'Company name (Montserrat Bold) top-left. Date top-right. Geometric divider line.',
    charts: 'Bar charts and line charts only. No pie charts (difficult to read). Primary palette colors.',
    footer: 'Page number centered. Company info left-aligned. Geometric rule above.',
  },
};

const MASTER_PROMPT = {
  id: 'CK-BAUHAUS-PROMPT',
  name: 'Coastal Key Bauhaus Master Design Prompt',
  purpose: 'Locks Bauhaus principles into every design decision across all AI agents and human designers.',
  prompt: `Design every asset for Coastal Key Property Management LLC strictly according to Bauhaus principles:

1. FORM FOLLOWS FUNCTION — No decoration for its own sake. Every element serves a purpose.
2. GEOMETRIC SHAPES ONLY — Rectangles, circles, triangles. All forms derive from these three.
3. PRIMARY COLOR DISCIPLINE — Black (#1A1A1A), white (#FFFFFF), navy (#1B365D), red (#C41E3A), gold (#DAA520). No pastels, neons, or gradients.
4. UNIVERSAL TYPOGRAPHY — Sans-serif only. Montserrat for headings, Inter for body. Geometric, legible, functional.
5. ASYMMETRICAL BALANCE — Grid-based layouts with generous white space. Visual weight distribution, not centered symmetry.
6. MATERIAL HONESTY — Show things as they are. No skeuomorphism, no HDR, no faux textures.
7. ZERO ORNAMENTATION — No shadows, gradients, decorative borders, ornamental icons, or texture overlays.

The result must look like it came from the Dessau workshop in 1926 but feel perfectly suited to coastal property management in 2026. Clarity, honesty, and efficiency above all else.`,
  applicableTo: ['Logo design', 'Property photography', 'Marketing collateral', 'Signage', 'Website/portal UI', 'Reports and documents', 'Email templates', 'Social media graphics', 'Presentation decks', 'Vehicle wraps'],
};

// ── Public API ──

export function getDesignSystem() {
  return {
    ...BAUHAUS_SYSTEM,
    principleCount: DESIGN_PRINCIPLES.length,
    colorTokens: Object.keys(DESIGN_TOKENS.colors).length,
    assetCategories: Object.keys(ASSET_SPECIFICATIONS).length,
    masterPromptAvailable: true,
    status: 'active',
  };
}

export function getDesignPrinciples() {
  return {
    system: BAUHAUS_SYSTEM.name,
    origin: BAUHAUS_SYSTEM.origin,
    corePhilosophy: BAUHAUS_SYSTEM.corePhilosophy,
    totalPrinciples: DESIGN_PRINCIPLES.length,
    principles: DESIGN_PRINCIPLES,
  };
}

export function getDesignTokens() {
  return {
    system: BAUHAUS_SYSTEM.name,
    tokens: DESIGN_TOKENS,
  };
}

export function getAssetSpecs() {
  return {
    system: BAUHAUS_SYSTEM.name,
    totalCategories: Object.keys(ASSET_SPECIFICATIONS).length,
    specifications: ASSET_SPECIFICATIONS,
  };
}

export function getMasterPrompt() {
  return MASTER_PROMPT;
}
