const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BRIEFS_PATH = path.join(__dirname, '..', 'data', 'visual-briefs.json');

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadBriefs() {
  try {
    if (fs.existsSync(BRIEFS_PATH)) {
      return JSON.parse(fs.readFileSync(BRIEFS_PATH, 'utf8'));
    }
  } catch (_) { /* corrupted file – start fresh */ }
  return [];
}

function saveBriefs(briefs) {
  const dir = path.dirname(BRIEFS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BRIEFS_PATH, JSON.stringify(briefs, null, 2));
}

function createBriefEntry(type, prompt, context, platform, associatedPostId) {
  return {
    id: crypto.randomUUID(),
    type,
    prompt,
    context,
    platform,
    associatedPostId: associatedPostId || null,
    status: 'pending',
    generatedAssetPath: null,
    createdAt: new Date().toISOString()
  };
}

// ---------------------------------------------------------------------------
// Platform dimension map
// ---------------------------------------------------------------------------

const PLATFORM_DIMENSIONS = {
  instagram: { width: 1080, height: 1080, label: '1080x1080 square' },
  facebook:  { width: 1200, height: 630,  label: '1200x630 landscape' },
  linkedin:  { width: 1200, height: 627,  label: '1200x627 landscape' },
  youtube:   { width: 1280, height: 720,  label: '1280x720 landscape (16:9)' }
};

// ---------------------------------------------------------------------------
// Segment-specific visual direction
// ---------------------------------------------------------------------------

const SEGMENT_DIRECTION = {
  absentee_homeowners:
    'Show an unoccupied coastal property viewed from a slight distance — subtle signs ' +
    'of weather wear (salt-spray residue on railings, minor storm debris on a walkway). ' +
    'Include a property-inspection checklist clipboard or tablet in the foreground, ' +
    'partially visible, grounding the scene in professional oversight. Muted, overcast ' +
    'lighting to convey the vulnerability of an unattended home.',

  luxury_1m_plus:
    'Feature a striking high-end waterfront estate — floor-to-ceiling glass, infinity ' +
    'pool reflecting the sky, manicured tropical landscaping. Use golden-hour lighting ' +
    'with long shadows. A property manager in business-casual attire walks the grounds ' +
    'with a tablet, suggesting white-glove professional care. Architectural photography ' +
    'style: sharp lines, shallow depth of field on details like marble, teak, or ' +
    'brushed-nickel hardware.',

  investor_family_office:
    'Institutional, data-forward aesthetic. Show a clean workspace with a large monitor ' +
    'displaying a multi-property portfolio dashboard — occupancy rates, maintenance ' +
    'cost graphs, ROI trends. Overlay translucent data-visualization elements (bar ' +
    'charts, heat maps of the Florida coast). Cool-toned lighting, minimal decoration, ' +
    'conveying analytical rigor and scale.',

  seasonal_snowbirds:
    'Split-composition or smooth gradient transition: left side shows a snow-covered ' +
    'northern home with bare trees; right side shows a sun-drenched Florida coastal ' +
    'property with palms and blue sky. A calendar or datebook sits at the visual midpoint, ' +
    'open to the transition month. Warm vs cool color temperature contrast, editorial ' +
    'magazine quality.',

  str_vacation_rental:
    'Guest-ready interior of a bright coastal rental — crisp white linens, staged ' +
    'welcome amenities (local coffee, beach towels rolled neatly), natural light pouring ' +
    'through sheer curtains. A subtle 5-star review badge or rating overlay in the ' +
    'corner. The scene should feel aspirational yet achievable — "book this now" energy. ' +
    'Lifestyle-photography style with warm, inviting tones.'
};

// ---------------------------------------------------------------------------
// Shared brand instructions appended to every prompt
// ---------------------------------------------------------------------------

function brandBlock() {
  return (
    'Brand identity: "Coastal Key Treasure Coast Asset Management" wordmark should be ' +
    'subtly integrated — either as a small watermark in the lower-right corner or ' +
    'embossed into the image border. Use the coastal brand palette: navy (#1B2A4A), ' +
    'white (#FFFFFF), sand (#D2C4A0), ocean blue (#2E86AB), seafoam accent (#48BF84). ' +
    'Reference the Florida Gulf Coast / Keys service zone when geographic context is ' +
    'relevant. Absolutely no generic stock-photo feel — every image must look editorially ' +
    'composed, institutionally credible, and specific to coastal property management.'
  );
}

// ---------------------------------------------------------------------------
// generateSocialBrief
// ---------------------------------------------------------------------------

function generateSocialBrief(caption, platform, contentPillar, associatedPostId) {
  const plat = (platform || 'instagram').toLowerCase();
  const dims = PLATFORM_DIMENSIONS[plat] || PLATFORM_DIMENSIONS.instagram;
  const segmentHint = SEGMENT_DIRECTION[contentPillar] || '';

  const prompt = [
    `Create a ${dims.label} social-media graphic for ${plat}.`,
    '',
    '## Art Direction',
    'Style: clean, modern editorial photography with minimal graphic-design overlays.',
    `Composition: rule-of-thirds layout at ${dims.width}x${dims.height}px.`,
    'Lighting: soft natural coastal light, slightly desaturated highlights, rich shadows.',
    'Color palette: navy (#1B2A4A), white (#FFFFFF), sand (#D2C4A0), ocean blue (#2E86AB), seafoam (#48BF84).',
    'Mood: confident, trustworthy, premium but approachable.',
    '',
    '## Text Overlay',
    `Derive a concise headline (8 words max) from the following caption: "${caption}"`,
    'Set the headline in a bold sans-serif typeface (Montserrat or similar) in navy or white,',
    'placed on a semi-transparent sand-colored bar so it is legible over any background.',
    'Include a one-line sub-caption underneath in a lighter weight.',
    '',
    segmentHint ? `## Segment Visual Direction\n${segmentHint}\n` : '',
    '## Brand Requirements',
    brandBlock()
  ].filter(Boolean).join('\n');

  const brief = createBriefEntry(
    'social_graphic',
    prompt,
    `Social graphic for ${plat} — pillar: ${contentPillar || 'general'}. Caption: "${caption}"`,
    plat,
    associatedPostId
  );

  const briefs = loadBriefs();
  briefs.push(brief);
  saveBriefs(briefs);

  return brief;
}

// ---------------------------------------------------------------------------
// generateThumbnailBrief
// ---------------------------------------------------------------------------

function generateThumbnailBrief(videoTitle, targetSegment, contentType, associatedPostId) {
  const dims = PLATFORM_DIMENSIONS.youtube;
  const segmentHint = SEGMENT_DIRECTION[targetSegment] || '';

  const prompt = [
    `Create a high-CTR YouTube thumbnail at ${dims.label}.`,
    '',
    '## Art Direction',
    'Style: bold, high-contrast, scroll-stopping. Think MrBeast-level visibility but with',
    'an editorial, coastal-property-management tone — no cartoonish effects.',
    `Composition: ${dims.width}x${dims.height}px, 16:9 aspect ratio.`,
    'Background: either a dramatic close-up of a coastal property or a confident face',
    '(property manager) looking directly at camera, slightly off-center.',
    'Lighting: punchy, high-key with a subtle teal/navy vignette on the edges.',
    'Color palette: navy (#1B2A4A), white (#FFFFFF), sand (#D2C4A0), ocean blue (#2E86AB), seafoam (#48BF84).',
    '',
    '## Text Overlay (Critical for CTR)',
    `Derive a bold 3-5 word headline from the video title: "${videoTitle}"`,
    'Use a heavy, condensed sans-serif typeface (Impact or Bebas Neue style) in white',
    'with a navy stroke/outline for readability. Position in the upper-left or center.',
    'Add a small accent shape (arrow, circle, underline) in ocean blue to draw the eye.',
    '',
    `## Content Type: ${contentType || 'educational'}`,
    contentType === 'testimonial'
      ? 'Include a subtle 5-star rating graphic and a quote-mark icon.'
      : contentType === 'walkthrough'
        ? 'Show a property exterior with a "play button" overlay implying video tour.'
        : 'Use an informational layout — a key stat or number pulled from the title as a large numeral.',
    '',
    segmentHint ? `## Segment Visual Direction\n${segmentHint}\n` : '',
    '## Brand Requirements',
    brandBlock()
  ].filter(Boolean).join('\n');

  const brief = createBriefEntry(
    'thumbnail',
    prompt,
    `Thumbnail for video "${videoTitle}" — segment: ${targetSegment || 'general'}, type: ${contentType || 'educational'}`,
    'youtube',
    associatedPostId
  );

  const briefs = loadBriefs();
  briefs.push(brief);
  saveBriefs(briefs);

  return brief;
}

// ---------------------------------------------------------------------------
// generateCarouselBrief
// ---------------------------------------------------------------------------

function generateCarouselBrief(topic, slideCount, platform, associatedPostId) {
  const plat = (platform || 'instagram').toLowerCase();
  const dims = PLATFORM_DIMENSIONS[plat] || PLATFORM_DIMENSIONS.instagram;
  const count = Math.max(2, Math.min(slideCount || 5, 10));

  const slideBriefs = [];
  const briefs = loadBriefs();

  for (let i = 1; i <= count; i++) {
    let slideRole;
    if (i === 1) {
      slideRole =
        'COVER SLIDE — this must stop the scroll. Bold headline derived from the topic, ' +
        'eye-catching background image, and a "Swipe →" indicator in seafoam.';
    } else if (i === count) {
      slideRole =
        'CLOSING CTA SLIDE — include a strong call-to-action ("Get Your Free Assessment", ' +
        '"Book a Call", etc.), the Coastal Key wordmark prominently, and contact information ' +
        'or QR code placeholder.';
    } else {
      slideRole =
        `CONTENT SLIDE ${i} of ${count} — present one focused insight or data point about ` +
        `the topic. Use a numbered label ("${i}/${count}") in the corner. Alternate between ` +
        'image-heavy and text-heavy layouts for visual variety.';
    }

    const prompt = [
      `Create slide ${i} of ${count} for a ${plat} carousel at ${dims.label}.`,
      '',
      `## Topic: "${topic}"`,
      '',
      `## Slide Role\n${slideRole}`,
      '',
      '## Art Direction',
      'Style: cohesive series — every slide shares the same background treatment, color',
      'palette, and typography system so the carousel feels unified when swiped.',
      `Dimensions: ${dims.width}x${dims.height}px.`,
      'Color palette: navy (#1B2A4A), white (#FFFFFF), sand (#D2C4A0), ocean blue (#2E86AB), seafoam (#48BF84).',
      'Typography: bold sans-serif headlines, light-weight body text, generous whitespace.',
      'Photography: coastal property imagery as background with a 60% navy overlay to',
      'ensure text legibility.',
      '',
      '## Brand Requirements',
      brandBlock()
    ].join('\n');

    const brief = createBriefEntry(
      'carousel_slide',
      prompt,
      `Carousel slide ${i}/${count} for "${topic}" on ${plat}`,
      plat,
      associatedPostId
    );

    briefs.push(brief);
    slideBriefs.push(brief);
  }

  saveBriefs(briefs);
  return slideBriefs;
}

// ---------------------------------------------------------------------------
// Status / query helpers
// ---------------------------------------------------------------------------

function markGenerated(briefId, assetPath) {
  const briefs = loadBriefs();
  const brief = briefs.find(b => b.id === briefId);
  if (!brief) return null;

  brief.status = 'generated';
  brief.generatedAssetPath = assetPath;
  saveBriefs(briefs);
  return brief;
}

function getPendingBriefs() {
  return loadBriefs().filter(b => b.status === 'pending');
}

function getBriefsByPost(postId) {
  return loadBriefs().filter(b => b.associatedPostId === postId);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  generateSocialBrief,
  generateThumbnailBrief,
  generateCarouselBrief,
  markGenerated,
  getPendingBriefs,
  getBriefsByPost
};
