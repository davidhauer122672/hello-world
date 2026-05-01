/**
 * Coastal Key Mobile App — Leads Screen
 * Real-time scoring, battle plans, follow-up automation, multi-channel AI
 */

import * as api from '../utils/api.js';

export function renderLeads() {
  const leads = getSampleLeads();

  return `
    <!-- Search & Filter Bar -->
    <div class="card-glass mb-md" style="padding:var(--space-md);display:flex;gap:var(--space-sm);">
      <input type="search" placeholder="Search leads..." id="lead-search" style="flex:1;background:var(--ck-surface);border:1px solid var(--ck-border);border-radius:var(--radius-md);padding:10px 14px;color:#fff;font-size:0.85rem;font-family:var(--font-body);outline:none;" />
      <button class="btn btn-secondary" style="padding:10px 14px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      </button>
    </div>

    <!-- Lead Pipeline Summary -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-xs);margin-bottom:var(--space-lg);">
      <div class="card" style="padding:var(--space-sm);text-align:center;">
        <div style="font-size:1.1rem;font-weight:700;color:var(--ck-red);" id="pipeline-hot">18</div>
        <div class="text-xs text-dim">Hot</div>
      </div>
      <div class="card" style="padding:var(--space-sm);text-align:center;">
        <div style="font-size:1.1rem;font-weight:700;color:var(--ck-amber);" id="pipeline-warm">43</div>
        <div class="text-xs text-dim">Warm</div>
      </div>
      <div class="card" style="padding:var(--space-sm);text-align:center;">
        <div style="font-size:1.1rem;font-weight:700;color:var(--ck-blue);" id="pipeline-cool">89</div>
        <div class="text-xs text-dim">Cool</div>
      </div>
      <div class="card" style="padding:var(--space-sm);text-align:center;">
        <div style="font-size:1.1rem;font-weight:700;color:#71717a;" id="pipeline-nurture">97</div>
        <div class="text-xs text-dim">Nurture</div>
      </div>
    </div>

    <!-- Segment Tags -->
    <div style="display:flex;gap:var(--space-xs);overflow-x:auto;padding-bottom:var(--space-sm);margin-bottom:var(--space-md);-webkit-overflow-scrolling:touch;">
      <span class="tag tag-gold">All Leads</span>
      <span class="tag tag-red">Absentee Owner</span>
      <span class="tag tag-purple">Luxury $1M+</span>
      <span class="tag tag-blue">Investor</span>
      <span class="tag tag-green">Seasonal</span>
    </div>

    <!-- Lead List -->
    <div class="section-header">
      <span class="section-title">Lead Pipeline</span>
      <button class="section-action">Sort by Score</button>
    </div>

    <div id="lead-list">
    ${leads.map(renderLeadRow).join('')}
    </div>

    <!-- AI Actions -->
    <div class="divider"></div>
    <div class="section-header">
      <span class="section-title">Automation Controls</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);">
      <button class="btn btn-execute" style="font-size:0.75rem;padding:12px;" id="btn-score-all">Score All Leads</button>
      <button class="btn btn-secondary" style="font-size:0.75rem;padding:12px;">Generate Battle Plans</button>
      <button class="btn btn-ghost" style="font-size:0.75rem;padding:12px;">Start Nurture Sequence</button>
      <button class="btn btn-ghost" style="font-size:0.75rem;padding:12px;">Export Pipeline</button>
    </div>
  `;
}

function renderLeadRow(lead) {
  return `
    <div class="list-item" style="margin-bottom:var(--space-sm);">
      <div class="score-badge ${lead.scoreClass}">${lead.score}</div>
      <div class="list-content">
        <div class="list-title">${lead.name}</div>
        <div class="list-subtitle">${lead.segment} &middot; ${lead.location}</div>
        <div style="display:flex;gap:4px;margin-top:6px;">
          ${lead.channels.map((ch) => `<span class="tag tag-${ch.color}" style="font-size:0.6rem;padding:2px 6px;">${ch.label}</span>`).join('')}
        </div>
      </div>
      <div class="list-meta">
        <div style="font-size:0.7rem;color:#71717a;">${lead.lastContact}</div>
        <button class="btn btn-primary" style="padding:6px 12px;font-size:0.7rem;margin-top:6px;">Battle Plan</button>
      </div>
    </div>
  `;
}

export function initLeads() {
  loadLiveLeads();
}

async function loadLiveLeads() {
  try {
    const data = await api.getLeads({ limit: 20 });
    if (data.leads && data.leads.length > 0) {
      const list = document.getElementById('lead-list');
      if (list) {
        list.innerHTML = data.leads.map((l) => renderLeadRow({
          name: l.name || 'Unknown',
          score: l.score || 0,
          scoreClass: l.score >= 80 ? 'hot' : l.score >= 60 ? 'warm' : 'cool',
          segment: l.segment || 'General',
          location: l.location || 'Treasure Coast',
          lastContact: l.lastContact || 'N/A',
          channels: l.channels || [{ label: 'Email', color: 'purple' }]
        })).join('');
      }
    }
    if (data.pipeline) {
      const ids = { hot: 'pipeline-hot', warm: 'pipeline-warm', cool: 'pipeline-cool', nurture: 'pipeline-nurture' };
      Object.entries(ids).forEach(([key, id]) => {
        if (data.pipeline[key] !== undefined) {
          const el = document.getElementById(id);
          if (el) el.textContent = data.pipeline[key];
        }
      });
    }
  } catch (_) {
    // Graceful degradation — sample data remains
  }
}

function getSampleLeads() {
  return [
    { name: 'Victoria Harrington', score: 94, scoreClass: 'hot', segment: 'Luxury Property', location: 'Stuart, FL', lastContact: '2h ago', channels: [{ label: 'SMS', color: 'green' }, { label: 'Voice', color: 'blue' }, { label: 'Email', color: 'purple' }] },
    { name: 'Marcus Chen', score: 87, scoreClass: 'hot', segment: 'Investor / Family Office', location: 'Jupiter, FL', lastContact: '4h ago', channels: [{ label: 'Email', color: 'purple' }, { label: 'Voice', color: 'blue' }] },
    { name: 'Catherine Blackwell', score: 82, scoreClass: 'hot', segment: 'Absentee Homeowner', location: 'Hobe Sound, FL', lastContact: '1d ago', channels: [{ label: 'SMS', color: 'green' }] },
    { name: 'Robert Wentworth III', score: 71, scoreClass: 'warm', segment: 'Seasonal / Snowbird', location: 'Palm City, FL', lastContact: '2d ago', channels: [{ label: 'Email', color: 'purple' }] },
    { name: 'Diana Mercer', score: 65, scoreClass: 'warm', segment: 'STR / Vacation Rental', location: 'Jensen Beach, FL', lastContact: '3d ago', channels: [{ label: 'Voice', color: 'blue' }, { label: 'SMS', color: 'green' }] },
    { name: 'Thomas Ashford', score: 48, scoreClass: 'cool', segment: 'Luxury Property', location: 'Vero Beach, FL', lastContact: '5d ago', channels: [{ label: 'Email', color: 'purple' }] },
    { name: 'Elena Rodriguez', score: 42, scoreClass: 'cool', segment: 'Absentee Homeowner', location: 'Port St. Lucie, FL', lastContact: '1w ago', channels: [{ label: 'SMS', color: 'green' }] }
  ];
}
