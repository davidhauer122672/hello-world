/**
 * CEO Dashboard — Coastal Key Treasure Coast Asset Management
 * Single-page real-time dashboard. Fetches /api/dashboard + /api/health.
 * Auto-refreshes every 60 seconds.
 */

(function () {
  'use strict';

  const REFRESH_INTERVAL = 60_000;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------

  function money(cents) {
    return '$' + cents.toLocaleString('en-US');
  }

  function plural(n, singular, pluralForm) {
    return n === 1 ? singular : (pluralForm || singular + 's');
  }

  function relativeTime(iso) {
    if (!iso) return '--';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  function shortDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function shortTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function segmentLabel(key) {
    const labels = {
      absentee_homeowners: 'Absentee Homeowners',
      luxury_1m_plus: 'Luxury $1M+',
      investor_family_office: 'Investor / Family Office',
      seasonal_snowbirds: 'Seasonal Snowbirds',
      str_vacation_rental: 'STR / Vacation Rental',
    };
    return labels[key] || key;
  }

  function objectionLabel(key) {
    const labels = {
      competition_neighbor: 'Neighbor Competition',
      price: 'Price Objection',
      urgency_absence: 'Urgency / Absence',
      delay_think: 'Delay — Think',
      delay_next_season: 'Delay — Next Season',
      competition_pm_company: 'PM Company Competition',
    };
    return labels[key] || key;
  }

  function platformAbbr(p) {
    return { instagram: 'IG', facebook: 'FB', linkedin: 'LI', alignable: 'AL' }[p] || p.substring(0, 2).toUpperCase();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ----------------------------------------------------------------
  // Date bar
  // ----------------------------------------------------------------

  function updateDateBar() {
    const now = new Date();
    $('#topbar-date').textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + '  ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // ----------------------------------------------------------------
  // Render: KPIs
  // ----------------------------------------------------------------

  function renderKPIs(data) {
    const r = data.revenue;

    $('#kpi-today-val').textContent = money(r.today.amount);
    $('#kpi-today-sub').textContent = r.today.count + ' ' + plural(r.today.count, 'booking');

    $('#kpi-week-val').textContent = money(r.week.amount);
    $('#kpi-week-sub').textContent = r.week.count + ' ' + plural(r.week.count, 'booking');

    $('#kpi-month-val').textContent = money(r.month.amount);
    $('#kpi-month-sub').textContent = r.month.count + ' ' + plural(r.month.count, 'booking');

    $('#kpi-alltime-val').textContent = money(r.allTime.amount);
    $('#kpi-alltime-sub').textContent = r.allTime.count + ' ' + plural(r.allTime.count, 'booking');

    $('#kpi-drip-val').textContent = data.drip.active;
    $('#kpi-drip-sub').textContent = data.drip.total + ' total subscribers';

    $('#kpi-briefs-val').textContent = data.briefs.pending;
    $('#kpi-briefs-sub').textContent = data.briefs.total + ' total generated';
  }

  // ----------------------------------------------------------------
  // Render: Schedule
  // ----------------------------------------------------------------

  function renderSchedule(schedule) {
    const badge = $('#schedule-count');
    badge.textContent = schedule.length;

    const body = $('#schedule-body');
    if (schedule.length === 0) {
      body.innerHTML = '<div class="empty-state">No appointments today</div>';
      return;
    }

    let html = `<table class="schedule-table">
      <thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Status</th></tr></thead><tbody>`;

    for (const a of schedule) {
      const paidClass = a.paid ? 'paid' : 'unpaid';
      const paidText = a.paid ? 'Paid' : 'Unpaid';
      html += `<tr>
        <td class="time-cell">${escapeHtml(a.time)}</td>
        <td class="name-cell">${escapeHtml(a.name)}</td>
        <td><span class="service-tag">${escapeHtml(a.service)}</span></td>
        <td><span class="paid-badge ${paidClass}">${paidText}</span></td>
      </tr>`;
    }

    html += '</tbody></table>';
    body.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Render: Revenue
  // ----------------------------------------------------------------

  function renderRevenue(revenue) {
    const body = $('#revenue-body');
    const services = revenue.byService;
    const maxRev = Math.max(...services.map((s) => s.revenue), 1);

    if (services.every((s) => s.count === 0)) {
      body.innerHTML = '<div class="empty-state">No revenue data yet</div>';
      return;
    }

    let html = '<div class="revenue-bars">';
    for (const s of services) {
      const pct = Math.round((s.revenue / maxRev) * 100);
      html += `<div class="rev-row">
        <div class="rev-row-header">
          <span class="rev-service">${escapeHtml(s.service)}</span>
          <span class="rev-amount">${money(s.revenue)}</span>
        </div>
        <div class="rev-bar-track"><div class="rev-bar-fill" style="width:${pct}%"></div></div>
        <div class="rev-count">${s.count} ${plural(s.count, 'booking')}</div>
      </div>`;
    }
    html += '</div>';
    body.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Render: Social
  // ----------------------------------------------------------------

  function renderSocial(social) {
    $('#social-count').textContent = social.total;
    const body = $('#social-body');

    if (social.upcoming.length === 0) {
      body.innerHTML = '<div class="empty-state">No upcoming posts</div>';
      return;
    }

    let html = '<div class="social-list">';
    for (const p of social.upcoming) {
      const abbr = platformAbbr(p.platform);
      const sched = p.scheduledFor ? shortDate(p.scheduledFor) : 'Unscheduled';
      html += `<div class="social-item">
        <div class="platform-icon ${p.platform}">${abbr}</div>
        <div class="social-item-body">
          <div class="social-caption">${escapeHtml(p.caption)}</div>
          <div class="social-meta">
            <span><span class="status-dot ${p.status}"></span>${p.status.replace('_', ' ')}</span>
            <span>${sched}</span>
            ${p.contentPillar ? `<span>${p.contentPillar.replace('_', ' ')}</span>` : ''}
          </div>
        </div>
      </div>`;
    }
    html += '</div>';

    // Platform summary bar
    if (Object.keys(social.byPlatform).length > 0) {
      html += '<div style="display:flex;gap:10px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">';
      for (const [platform, count] of Object.entries(social.byPlatform)) {
        html += `<span style="font-size:.7rem;color:var(--text-3);font-weight:600">${platform}: ${count}</span>`;
      }
      html += '</div>';
    }

    body.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Render: Drip
  // ----------------------------------------------------------------

  function renderDrip(drip) {
    const body = $('#drip-body');

    if (drip.total === 0) {
      body.innerHTML = '<div class="empty-state">No subscribers enrolled</div>';
      return;
    }

    let html = `<div class="drip-summary">
      <div class="drip-stat"><div class="drip-stat-val">${drip.active}</div><div class="drip-stat-label">Active</div></div>
      <div class="drip-stat"><div class="drip-stat-val">${drip.completed}</div><div class="drip-stat-label">Completed</div></div>
      <div class="drip-stat"><div class="drip-stat-val">${drip.unsubscribed}</div><div class="drip-stat-label">Unsubscribed</div></div>
    </div>`;

    const segments = Object.entries(drip.bySegment);
    if (segments.length > 0) {
      html += '<div class="segment-list">';
      for (const [seg, counts] of segments) {
        html += `<div class="segment-row">
          <span class="segment-name">${escapeHtml(segmentLabel(seg))}</span>
          <span class="segment-counts">
            <span class="active-count">${counts.active || 0} active</span>
            <span>${counts.completed || 0} done</span>
            <span>${counts.total || 0} total</span>
          </span>
        </div>`;
      }
      html += '</div>';
    }

    body.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Render: Calls
  // ----------------------------------------------------------------

  function renderCalls(calls) {
    $('#calls-count').textContent = calls.total;
    const body = $('#calls-body');

    if (calls.recentCalls.length === 0) {
      body.innerHTML = '<div class="empty-state">No call logs recorded</div>';
      return;
    }

    let html = '<div class="call-list">';
    for (const c of calls.recentCalls) {
      const shortId = (c.callId || '--').substring(0, 12);
      const time = c.startedAt ? relativeTime(c.startedAt) : '--';
      const disp = c.disposition || 'in-progress';
      html += `<div class="call-item">
        <div class="call-icon">${c.objectionCount || 0}</div>
        <div class="call-info">
          <div class="call-id">${escapeHtml(shortId)}</div>
          <div class="call-meta">${time} · ${disp}${c.topObjection ? ' · ' + objectionLabel(c.topObjection) : ''}</div>
        </div>
        <div class="call-stats">
          ${c.objectionCount ? `<span class="call-stat-chip objections">${c.objectionCount} obj</span>` : ''}
          ${c.reframeCount ? `<span class="call-stat-chip reframes">${c.reframeCount} ref</span>` : ''}
        </div>
      </div>`;
    }
    html += '</div>';

    // Objection breakdown
    const breakdown = Object.entries(calls.objectionBreakdown);
    if (breakdown.length > 0) {
      html += '<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">';
      html += '<div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3);margin-bottom:8px">Objection Breakdown</div>';
      breakdown.sort((a, b) => b[1] - a[1]);
      for (const [type, count] of breakdown) {
        html += `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:.8rem">
          <span>${objectionLabel(type)}</span>
          <span style="font-family:var(--mono);font-weight:700;color:var(--navy)">${count}</span>
        </div>`;
      }
      html += '</div>';
    }

    body.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Render: Briefs
  // ----------------------------------------------------------------

  function renderBriefs(briefs) {
    const body = $('#briefs-body');

    if (briefs.pendingList.length === 0) {
      body.innerHTML = '<div class="empty-state">All briefs generated</div>';
      return;
    }

    let html = '<div class="brief-list">';
    for (const b of briefs.pendingList) {
      const typeLabel = b.type === 'social' ? 'Social' : b.type === 'thumbnail' ? 'Thumb' : b.type === 'carousel' ? 'Carousel' : b.type;
      html += `<div class="brief-item">
        <span class="brief-type-badge">${typeLabel}</span>
        <span class="brief-detail">${b.platform ? b.platform + ' · ' : ''}${escapeHtml(b.id.substring(0, 8))}</span>
        <span class="brief-date">${relativeTime(b.createdAt)}</span>
      </div>`;
    }
    html += '</div>';
    body.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Render: Health
  // ----------------------------------------------------------------

  function renderHealth(health) {
    const dot = $('#health-dot');
    const label = $('#health-label');

    dot.className = 'health-dot ' + (health.status || '');
    label.textContent = health.status || '--';
    label.className = 'health-label ' + (health.status || '');

    const body = $('#health-body');
    if (!health.checks) {
      body.innerHTML = '<div class="empty-state">Health data unavailable</div>';
      return;
    }

    const c = health.checks;
    let html = '<div class="health-grid">';

    // Uptime
    if (c.uptime) {
      html += `<div class="health-row">
        <span class="health-key">Uptime</span>
        <span class="health-val">${c.uptime.human}</span>
      </div>`;
    }

    // Memory
    if (c.memory) {
      html += `<div class="health-row">
        <span class="health-key">Heap</span>
        <span class="health-val">${c.memory.heapUsedMB}/${c.memory.heapTotalMB} MB (${c.memory.heapPercent}%)</span>
      </div>`;
      html += `<div class="health-row">
        <span class="health-key">RSS</span>
        <span class="health-val">${c.memory.rssMB} MB</span>
      </div>`;
    }

    // Data files
    if (c.dataFiles) {
      for (const [file, info] of Object.entries(c.dataFiles)) {
        const name = file.replace('.json', '');
        const val = info.records !== undefined && info.records !== 'N/A'
          ? `${info.records} records · ${info.sizeKB || 0} KB`
          : info.note || info.status;
        html += `<div class="health-row">
          <span class="health-key">${name}</span>
          <span class="health-val">${val}</span>
        </div>`;
      }
    }

    // Runtime
    if (c.runtime) {
      html += `<div class="health-row">
        <span class="health-key">Node</span>
        <span class="health-val">${c.runtime.nodeVersion}</span>
      </div>`;
    }

    // Environment keys
    if (c.environment) {
      const missing = Object.entries(c.environment).filter(([, v]) => v === 'MISSING');
      const set = Object.entries(c.environment).filter(([, v]) => v === 'set');
      html += `<div class="health-row">
        <span class="health-key">Env Keys</span>
        <span class="health-val ${missing.length > 0 ? 'missing' : 'set'}">${set.length} set${missing.length > 0 ? ` · ${missing.length} missing` : ''}</span>
      </div>`;
    }

    html += '</div>';
    body.innerHTML = html;
  }

  // ----------------------------------------------------------------
  // Data fetch
  // ----------------------------------------------------------------

  async function fetchDashboard() {
    const btn = $('#refresh-btn');
    btn.classList.add('spinning');

    try {
      const [dashRes, healthRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/health'),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        renderKPIs(data);
        renderSchedule(data.schedule);
        renderRevenue(data.revenue);
        renderSocial(data.social);
        renderDrip(data.drip);
        renderCalls(data.calls);
        renderBriefs(data.briefs);
        $('#last-updated').textContent = 'Updated ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      }

      if (healthRes.ok) {
        const health = await healthRes.json();
        renderHealth(health);
      }
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
      $('#health-dot').className = 'health-dot unhealthy';
    } finally {
      btn.classList.remove('spinning');
    }
  }

  // ----------------------------------------------------------------
  // Init
  // ----------------------------------------------------------------

  updateDateBar();
  setInterval(updateDateBar, 30_000);

  fetchDashboard();
  setInterval(fetchDashboard, REFRESH_INTERVAL);

  $('#refresh-btn').addEventListener('click', fetchDashboard);
})();
