const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const PRICES = { consultation: 50, followup: 30, premium: 100 };
const SERVICE_LABELS = {
  consultation: 'Consultation',
  followup: 'Follow-up',
  premium: 'Premium Session',
};

function loadJSON(filename) {
  const fp = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(fp)) return [];
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return [];
  }
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return toDateStr(d);
}

function getMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

router.get('/', (_req, res) => {
  const today = toDateStr(new Date());
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();
  const appointments = db.getAppointments();
  const drip = loadJSON('drip-sequences.json');
  const social = loadJSON('content-calendar.json');
  const briefs = loadJSON('visual-briefs.json');
  const calls = loadJSON('call-logs.json');

  // --- Schedule ---
  const todaySchedule = appointments
    .filter((a) => a.date === today)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
    .map((a) => ({
      id: a.id,
      time: a.timeSlot,
      name: a.name,
      email: a.email,
      service: SERVICE_LABELS[a.service] || a.service,
      serviceKey: a.service,
      paid: a.paid,
    }));

  // --- Revenue ---
  const allPaid = appointments.filter((a) => a.paid);
  const sum = (arr) => arr.reduce((s, a) => s + (PRICES[a.service] || 0), 0);

  const revenue = {
    today: { amount: sum(allPaid.filter((a) => a.date === today)), count: allPaid.filter((a) => a.date === today).length },
    week: { amount: sum(allPaid.filter((a) => a.date >= weekStart)), count: allPaid.filter((a) => a.date >= weekStart).length },
    month: { amount: sum(allPaid.filter((a) => a.date >= monthStart)), count: allPaid.filter((a) => a.date >= monthStart).length },
    allTime: { amount: sum(allPaid), count: allPaid.length },
    byService: Object.entries(PRICES).map(([key, price]) => {
      const matching = allPaid.filter((a) => a.service === key);
      return {
        service: SERVICE_LABELS[key],
        key,
        count: matching.length,
        revenue: matching.length * price,
      };
    }),
  };

  // --- Drip ---
  const dripStats = {
    active: 0,
    completed: 0,
    unsubscribed: 0,
    total: drip.length,
    bySegment: {},
  };

  for (const s of drip) {
    if (s.status === 'active') dripStats.active++;
    else if (s.status === 'completed') dripStats.completed++;
    else if (s.status === 'unsubscribed') dripStats.unsubscribed++;

    if (!dripStats.bySegment[s.segment]) {
      dripStats.bySegment[s.segment] = { active: 0, completed: 0, unsubscribed: 0, total: 0 };
    }
    dripStats.bySegment[s.segment][s.status] = (dripStats.bySegment[s.segment][s.status] || 0) + 1;
    dripStats.bySegment[s.segment].total++;
  }

  // --- Social ---
  const socialStats = {
    total: social.length,
    byStatus: {},
    byPlatform: {},
    upcoming: social
      .filter((p) => ['draft', 'approved', 'approved_manual', 'scheduled'].includes(p.status))
      .sort((a, b) => (a.scheduledFor || 'z').localeCompare(b.scheduledFor || 'z'))
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        platform: p.platform,
        caption: p.caption.length > 72 ? p.caption.substring(0, 72) + '...' : p.caption,
        status: p.status,
        scheduledFor: p.scheduledFor,
        contentPillar: p.contentPillar,
      })),
  };

  for (const p of social) {
    socialStats.byStatus[p.status] = (socialStats.byStatus[p.status] || 0) + 1;
    socialStats.byPlatform[p.platform] = (socialStats.byPlatform[p.platform] || 0) + 1;
  }

  // --- Briefs ---
  const pendingBriefs = briefs.filter((b) => b.status === 'pending');
  const briefStats = {
    pending: pendingBriefs.length,
    generated: briefs.filter((b) => b.status === 'generated').length,
    total: briefs.length,
    pendingList: pendingBriefs.slice(0, 6).map((b) => ({
      id: b.id,
      type: b.type,
      platform: b.platform || null,
      createdAt: b.createdAt,
    })),
  };

  // --- Calls ---
  const recentCalls = calls
    .sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''))
    .slice(0, 8)
    .map((c) => ({
      callId: c.callId,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      objectionCount: (c.objectionsDetected || []).length,
      reframeCount: (c.reframesProvided || []).length,
      topObjection: c.objectionsDetected && c.objectionsDetected.length > 0 ? c.objectionsDetected[0].type : null,
      disposition: c.disposition,
    }));

  const objectionBreakdown = {};
  for (const c of calls) {
    for (const o of c.objectionsDetected || []) {
      objectionBreakdown[o.type] = (objectionBreakdown[o.type] || 0) + 1;
    }
  }

  res.json({
    generatedAt: new Date().toISOString(),
    today,
    schedule: todaySchedule,
    revenue,
    drip: dripStats,
    social: socialStats,
    briefs: briefStats,
    calls: { total: calls.length, recentCalls, objectionBreakdown },
  });
});

module.exports = router;
