const CANONICAL_ZONES = [
  'Vero Beach', 'Sebastian', 'Fort Pierce', 'Port Saint Lucie',
  'Jensen Beach', 'Palm City', 'Stuart', 'Hobe Sound',
  'Jupiter', 'North Palm Beach'
];

const ZONE_ALIASES = {
  'port st lucie': 'Port Saint Lucie',
  'port st. lucie': 'Port Saint Lucie',
  'psl': 'Port Saint Lucie',
  'n palm beach': 'North Palm Beach',
  'n. palm beach': 'North Palm Beach',
  'npb': 'North Palm Beach',
  'ft pierce': 'Fort Pierce',
  'ft. pierce': 'Fort Pierce'
};

const NOAA_ZONE_MAP = {
  'FLZ060': ['Vero Beach', 'Sebastian'],
  'FLZ061': ['Fort Pierce', 'Port Saint Lucie'],
  'FLZ062': ['Jensen Beach', 'Palm City', 'Stuart', 'Hobe Sound'],
  'FLZ063': ['Jupiter', 'North Palm Beach']
};

function normalizeZoneName(input) {
  const lower = input.toLowerCase().trim();
  if (ZONE_ALIASES[lower]) return ZONE_ALIASES[lower];
  const match = CANONICAL_ZONES.find(z => z.toLowerCase() === lower);
  return match || null;
}

function validateZonesInContent(text) {
  const violations = [];
  const validMentions = [];

  const locationPattern = /(?:in|near|around|serving|covering|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/g;
  let match;
  while ((match = locationPattern.exec(text)) !== null) {
    const candidate = match[1].trim();
    const normalized = normalizeZoneName(candidate);
    if (normalized) {
      validMentions.push({ found: candidate, canonical: normalized, position: match.index });
    } else {
      const isKnownNonZone = ['Florida', 'Treasure Coast', 'Coastal Key'].some(
        n => candidate.toLowerCase().includes(n.toLowerCase())
      );
      if (!isKnownNonZone) {
        violations.push({
          type: 'unrecognized_zone',
          severity: 'warning',
          found: candidate,
          position: match.index,
          message: `"${candidate}" is not a recognized Coastal Key service zone`,
          valid_zones: CANONICAL_ZONES
        });
      }
    }
  }

  return {
    passed: violations.filter(v => v.severity === 'error').length === 0,
    violations,
    valid_mentions: validMentions,
    canonical_zones: CANONICAL_ZONES,
    timestamp: new Date().toISOString()
  };
}

function validateLeadZone(zoneName) {
  const normalized = normalizeZoneName(zoneName);
  if (!normalized) {
    return {
      valid: false,
      input: zoneName,
      message: `"${zoneName}" is not a Coastal Key service zone`,
      suggestion: findClosestZone(zoneName),
      canonical_zones: CANONICAL_ZONES
    };
  }
  const noaaZone = Object.entries(NOAA_ZONE_MAP).find(([_, zones]) =>
    zones.includes(normalized)
  );
  return {
    valid: true,
    input: zoneName,
    canonical: normalized,
    noaa_zone: noaaZone ? noaaZone[0] : null,
    county: getCounty(normalized)
  };
}

function findClosestZone(input) {
  const lower = input.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const zone of CANONICAL_ZONES) {
    const zoneLower = zone.toLowerCase();
    let score = 0;
    for (let i = 0; i < Math.min(lower.length, zoneLower.length); i++) {
      if (lower[i] === zoneLower[i]) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = zone;
    }
  }
  return bestMatch;
}

function getCounty(zoneName) {
  const counties = {
    'Vero Beach': 'Indian River', 'Sebastian': 'Indian River',
    'Fort Pierce': 'St. Lucie', 'Port Saint Lucie': 'St. Lucie',
    'Jensen Beach': 'Martin', 'Palm City': 'Martin',
    'Stuart': 'Martin', 'Hobe Sound': 'Martin',
    'Jupiter': 'Palm Beach', 'North Palm Beach': 'Palm Beach'
  };
  return counties[zoneName] || null;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST required' }), { status: 405 });
    }

    const body = await request.json();
    const { content, zone, mode } = body;

    let result;
    if (mode === 'lead' && zone) {
      result = validateLeadZone(zone);
    } else if (content) {
      result = validateZonesInContent(content);
    } else {
      return new Response(JSON.stringify({ error: 'content or zone required' }), { status: 400 });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
