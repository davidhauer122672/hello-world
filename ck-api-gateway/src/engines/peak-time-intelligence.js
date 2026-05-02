const TREASURE_COAST_TIMEZONE = 'America/New_York';

const CONTACT_WINDOWS = {
  voice: {
    monday:    { start: '09:00', end: '12:00', peak: '10:00', score: 92 },
    tuesday:   { start: '09:00', end: '12:00', peak: '10:30', score: 95 },
    wednesday: { start: '09:00', end: '11:30', peak: '10:00', score: 90 },
    thursday:  { start: '09:30', end: '12:00', peak: '10:30', score: 93 },
    friday:    { start: '09:00', end: '11:00', peak: '10:00', score: 85 },
    saturday:  { start: '10:00', end: '12:00', peak: '10:30', score: 70 },
    sunday:    null,
  },
  email: {
    monday:    { start: '06:00', end: '09:00', peak: '07:30', score: 88 },
    tuesday:   { start: '06:00', end: '09:00', peak: '07:00', score: 91 },
    wednesday: { start: '06:00', end: '09:00', peak: '07:30', score: 87 },
    thursday:  { start: '06:00', end: '09:00', peak: '07:00', score: 89 },
    friday:    { start: '06:00', end: '08:30', peak: '07:00', score: 82 },
    saturday:  { start: '08:00', end: '10:00', peak: '09:00', score: 65 },
    sunday:    null,
  },
  sms: {
    monday:    { start: '10:00', end: '14:00', peak: '11:30', score: 86 },
    tuesday:   { start: '10:00', end: '14:00', peak: '12:00', score: 90 },
    wednesday: { start: '10:00', end: '14:00', peak: '11:30', score: 85 },
    thursday:  { start: '10:00', end: '14:00', peak: '12:00', score: 88 },
    friday:    { start: '10:00', end: '13:00', peak: '11:00', score: 80 },
    saturday:  { start: '10:00', end: '12:00', peak: '10:30', score: 72 },
    sunday:    null,
  },
  social: {
    monday:    { start: '07:00', end: '09:00', peak: '08:00', score: 84 },
    tuesday:   { start: '07:00', end: '09:00', peak: '08:00', score: 88 },
    wednesday: { start: '07:00', end: '09:00', peak: '08:00', score: 86 },
    thursday:  { start: '12:00', end: '14:00', peak: '12:30', score: 90 },
    friday:    { start: '07:00', end: '09:00', peak: '08:00', score: 82 },
    saturday:  { start: '09:00', end: '11:00', peak: '10:00', score: 78 },
    sunday:    { start: '17:00', end: '19:00', peak: '18:00', score: 75 },
  },
};

const SEASONAL_ADJUSTMENTS = {
  snowbird: {
    months: [10, 11, 12, 1, 2, 3, 4],
    label: 'Snowbird Season (Oct–Apr)',
    multiplier: 1.35,
    notes: 'Peak population influx from Northeast US/Canada. Maximum outreach capacity.',
    adjustments: {
      voice: { start_shift: -30, end_shift: 60 },
      email: { start_shift: 0, end_shift: 30 },
      sms: { start_shift: -30, end_shift: 30 },
      social: { start_shift: 0, end_shift: 60 },
    },
  },
  summer: {
    months: [5, 6, 7, 8, 9],
    label: 'Summer Off-Season (May–Sep)',
    multiplier: 0.80,
    notes: 'Reduced seasonal population. Focus on year-round residents and investors.',
    adjustments: {
      voice: { start_shift: 30, end_shift: -30 },
      email: { start_shift: 0, end_shift: 0 },
      sms: { start_shift: 0, end_shift: -30 },
      social: { start_shift: 0, end_shift: 0 },
    },
  },
};

const BLACKOUT_DATES = [
  { date: '01-01', name: "New Year's Day" },
  { date: '01-20', name: 'MLK Day' },
  { date: '02-17', name: "Presidents' Day" },
  { date: '03-31', name: 'Easter' },
  { date: '05-26', name: 'Memorial Day' },
  { date: '07-04', name: 'Independence Day' },
  { date: '09-01', name: 'Labor Day' },
  { date: '10-13', name: 'Columbus Day' },
  { date: '11-11', name: 'Veterans Day' },
  { date: '11-27', name: 'Thanksgiving' },
  { date: '11-28', name: 'Black Friday' },
  { date: '12-24', name: 'Christmas Eve' },
  { date: '12-25', name: 'Christmas Day' },
  { date: '12-31', name: "New Year's Eve" },
];

const HURRICANE_SEASON = { start_month: 6, end_month: 11, impact: 'Pause non-essential outreach during active storms' };

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getSeason(month) {
  return SEASONAL_ADJUSTMENTS.snowbird.months.includes(month) ? 'snowbird' : 'summer';
}

function isBlackout(dateStr) {
  const mmdd = dateStr.slice(5).replace(/-0?/g, (m) => m);
  const normalized = `${String(parseInt(dateStr.slice(5, 7))).padStart(2, '0')}-${String(parseInt(dateStr.slice(8, 10))).padStart(2, '0')}`;
  return BLACKOUT_DATES.find((b) => b.date === normalized) || null;
}

function getOptimalTime(channel, dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const dayName = DAYS[date.getUTCDay()];
  const month = date.getUTCMonth() + 1;

  const blackout = isBlackout(dateStr);
  if (blackout) {
    return { channel, date: dateStr, blackout: true, holiday: blackout.name, recommendation: 'Do not contact' };
  }

  const window = CONTACT_WINDOWS[channel]?.[dayName];
  if (!window) {
    return { channel, date: dateStr, available: false, reason: `No ${channel} window on ${dayName}` };
  }

  const season = getSeason(month);
  const adj = SEASONAL_ADJUSTMENTS[season];

  return {
    channel,
    date: dateStr,
    day: dayName,
    timezone: TREASURE_COAST_TIMEZONE,
    window: { start: window.start, end: window.end, peak: window.peak },
    engagementScore: Math.round(window.score * adj.multiplier),
    season: adj.label,
    seasonMultiplier: adj.multiplier,
    recommendation: `Best time: ${window.peak} ET`,
  };
}

function getPeakTimeDashboard() {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const season = getSeason(month);

  return {
    engine: 'Peak-Time Intelligence',
    version: '1.0.0',
    timezone: TREASURE_COAST_TIMEZONE,
    channels: Object.keys(CONTACT_WINDOWS),
    currentSeason: SEASONAL_ADJUSTMENTS[season],
    hurricaneSeason: HURRICANE_SEASON,
    blackoutDates: BLACKOUT_DATES.length,
    totalWindows: Object.values(CONTACT_WINDOWS).reduce(
      (sum, ch) => sum + Object.values(ch).filter(Boolean).length, 0
    ),
    timestamp: now.toISOString(),
  };
}

export {
  CONTACT_WINDOWS,
  SEASONAL_ADJUSTMENTS,
  BLACKOUT_DATES,
  HURRICANE_SEASON,
  getOptimalTime,
  getPeakTimeDashboard,
};
