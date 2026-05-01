/**
 * Coastal Key Centralized Constants
 *
 * Single source of truth for all Airtable table IDs, field mappings,
 * service zone definitions, and segment classifications.
 *
 * Any file that previously hardcoded these values should import from here.
 */

// ── Airtable Base ────────────────────────────────────────────────────────────

export const AIRTABLE_BASE_ID = 'appUSnNgpDkcEOzhN';

// ── Airtable Table IDs ───────────────────────────────────────────────────────

export const TABLES = {
  LEADS:                  'tblpNasm0AxreRqLW',
  CLIENTS:                'tblMaMdzP9FXjWbsL',
  PROPERTIES:             'tblT0wq21qxU1KJNM',
  CONTACTS:               'tblLAzR9CdNhrYa95',
  TASKS:                  'tbl5kGQ81WObMHTup',
  SALES_CAMPAIGNS:        'tblxClRECEijLysHi',
  CONTENT_CALENDAR:       'tblEPr4f2lMz6ruxF',
  AI_LOG:                 'tblZ0bgRmH7KQiZyf',
  VIDEO_PRODUCTION:       'tbl8dvykC4yTiLDBa',
  PODCAST_PRODUCTION:     'tbl2nRbeo2vHjm1Qr',
  INVESTOR_PRESENTATIONS: 'tblJdcuwF1U2SK8PB',
  MAINTENANCE_RECORDS:    'tblWNOfq1OCK4kAnA',
  MAINTENANCE_REQUESTS:   'tblVhVdsQmnblFclI',
  INSPECTIONS:            'tblAZqNDIbBnxPNQn',
  CONCIERGE_REQUESTS:     'tblrtZrImuSIWA54o',
  BOOKINGS:               'tbl75OsuFTHVx8J0l',
  GUEST_FEEDBACK:         'tblNQAfPTdeo3clmn',
  VENDOR_COMPLIANCE:      'tbl2rTYKSdC65kmYp',
  COMPETITIVE_INTEL:      'tbl5Xpu6tyb7WjtvB',
  DEPLOYMENT_TRACKER:     'tblGkLHXDiUkKttXq',
  NOTEBOOKLM_IMPORTS:     'tblmk7HdK3nn7RBaH',
  INCOMPLETE_LEADS:       'tblYh4Rg4NxkRstJl',
  MISSED_FAILED_CALLS:    'tblWW25r6GmsQe3mQ',
  MCCO_SOVEREIGN_OPS:     'tblWJD4efsentwjLO',
};

// ── Service Zones (Treasure Coast) ───────────────────────────────────────────

export const SERVICE_ZONES = [
  { id: 'vero_beach',        label: 'Vero Beach',        county: 'Indian River' },
  { id: 'sebastian',         label: 'Sebastian',         county: 'Indian River' },
  { id: 'fort_pierce',       label: 'Fort Pierce',       county: 'St. Lucie' },
  { id: 'port_saint_lucie',  label: 'Port Saint Lucie',  county: 'St. Lucie' },
  { id: 'jensen_beach',      label: 'Jensen Beach',      county: 'Martin' },
  { id: 'palm_city',         label: 'Palm City',         county: 'Martin' },
  { id: 'stuart',            label: 'Stuart',            county: 'Martin' },
  { id: 'hobe_sound',        label: 'Hobe Sound',        county: 'Martin' },
  { id: 'jupiter',           label: 'Jupiter',           county: 'Palm Beach' },
  { id: 'north_palm_beach',  label: 'North Palm Beach',  county: 'Palm Beach' },
];

// ── Lead Segments ────────────────────────────────────────────────────────────

export const LEAD_SEGMENTS = [
  { id: 'absentee_homeowner',   label: 'Absentee Homeowner' },
  { id: 'luxury_property',      label: 'Luxury Property' },
  { id: 'investor',             label: 'Investor / Family Office' },
  { id: 'family_office',        label: 'Investor / Family Office' },
  { id: 'seasonal',             label: 'Seasonal / Snowbird' },
  { id: 'snowbird',             label: 'Seasonal / Snowbird' },
  { id: 'str',                  label: 'STR / Vacation Rental' },
  { id: 'vacation_rental',      label: 'STR / Vacation Rental' },
];

// ── Call Disposition Mapping (Retell disconnection_reason → CK disposition) ──

export const DISPOSITION_MAP = {
  user_hangup:       'Callback',
  agent_hangup:      'Booked',
  inactivity_timeout: 'No Answer',
  machine_hangup:    'No Answer',
  error:             'No Answer',
};

// Disconnection reasons that indicate a failed/missed call (routes to QA table)
export const FAILED_CALL_REASONS = new Set([
  'inactivity_timeout',
  'machine_hangup',
  'error',
]);

// ── Claude Model Tiers ───────────────────────────────────────────────────────

export const MODEL_TIERS = {
  fast:     'claude-sonnet-4-6',
  standard: 'claude-sonnet-4-6',
  advanced: 'claude-opus-4-6',
};

// ── Rate Limiting Defaults ───────────────────────────────────────────────────

export const RATE_LIMIT_DEFAULTS = {
  requestsPerMinute: 60,
  windowMs: 60_000,
};

// ── KV TTL Defaults (seconds) ────────────────────────────────────────────────

export const KV_TTL = {
  inferenceCache: 3600,      // 1 hour
  rateLimitWindow: 60,       // 1 minute
  auditLog: 2_592_000,       // 30 days
  sessionData: 86_400,       // 24 hours
};

// ── Workflow Constants ───────────────────────────────────────────────────────

export const WORKFLOW = {
  SCAA1_MAX_TOKENS: 3000,
  WF3_MAX_TOKENS: 2500,
  WF4_NURTURE_DAYS: 90,
  WF4_QUALIFYING_DISPOSITIONS: ['No Answer', 'Not Interested'],
};
