/**
 * Coastal Key Mobile App — Market Intelligence
 * Daily AI briefings, regional trend analysis, pricing recommendations
 */

export function renderMarket() {
  return `
    <div class="flex justify-between items-center mb-lg" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg);">
      <div>
        <h2 style="font-size:1.35rem;">Market Intelligence</h2>
        <p class="text-sm text-dim" style="margin-top:4px;">AI-powered market analysis</p>
      </div>
      <span class="tag tag-gold">Live</span>
    </div>

    <!-- Daily AI Briefing -->
    <div class="card-hero mb-lg" style="padding:var(--space-xl);">
      <div class="text-xs" style="color:var(--ck-gold);margin-bottom:var(--space-sm);">Daily AI Briefing — April 3, 2026</div>
      <h3 style="font-size:1.1rem;margin-bottom:var(--space-md);">Treasure Coast Market Overview</h3>
      <div style="font-size:0.82rem;color:#d4d4d8;line-height:1.65;">
        <p style="margin-bottom:8px;">The Treasure Coast luxury segment shows continued strength with median prices up <strong style="color:var(--ck-green);">8.2%</strong> year-over-year in Martin County. Stuart and Palm City lead growth with increased buyer activity from out-of-state investors.</p>
        <p>Key signal: Absentee owner listings in Hobe Sound have decreased <strong style="color:var(--ck-red);">12%</strong>, suggesting increased holding confidence. Recommend adjusting outreach strategy to emphasize property management services over transaction-based pitches.</p>
      </div>
      <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
        <span class="tag tag-green">Bullish Outlook</span>
        <span class="tag tag-gold">High Confidence</span>
      </div>
    </div>

    <!-- Regional Trends -->
    <div class="section-header">
      <span class="section-title">Regional Trends</span>
      <button class="section-action">National View</button>
    </div>

    <!-- Trend Cards by Zone -->
    ${renderZoneTrend('Stuart', '+8.2%', 'up', '$685K', '24 days', '142')}
    ${renderZoneTrend('Jupiter', '+6.7%', 'up', '$1.2M', '31 days', '98')}
    ${renderZoneTrend('Hobe Sound', '+5.1%', 'up', '$945K', '28 days', '67')}
    ${renderZoneTrend('Palm City', '+4.8%', 'up', '$520K', '22 days', '89')}
    ${renderZoneTrend('Jensen Beach', '+3.2%', 'up', '$475K', '35 days', '54')}
    ${renderZoneTrend('Port St. Lucie', '+2.1%', 'up', '$385K', '19 days', '234')}
    ${renderZoneTrend('Vero Beach', '+1.8%', 'up', '$560K', '42 days', '76')}

    <div class="divider"></div>

    <!-- Pricing Recommendations -->
    <div class="section-header">
      <span class="section-title">Pricing Recommendations</span>
      <button class="section-action">Run Analysis</button>
    </div>
    <div class="card mb-md" style="border-left:3px solid var(--ck-green);margin-bottom:var(--space-sm);">
      <div style="font-size:0.85rem;font-weight:600;color:#fff;">Luxury Segment (Stuart)</div>
      <div style="font-size:0.75rem;color:#71717a;margin-top:4px;">AI recommends <strong style="color:var(--ck-green);">3-5% increase</strong> in management fees for properties >$1M. Market supports premium positioning.</div>
    </div>
    <div class="card mb-md" style="border-left:3px solid var(--ck-amber);margin-bottom:var(--space-sm);">
      <div style="font-size:0.85rem;font-weight:600;color:#fff;">STR Revenue Optimization (Jensen Beach)</div>
      <div style="font-size:0.75rem;color:#71717a;margin-top:4px;">Seasonal demand spike predicted for Q2. Recommend <strong style="color:var(--ck-amber);">dynamic pricing</strong> activation for vacation rental properties.</div>
    </div>
    <div class="card" style="border-left:3px solid var(--ck-blue);">
      <div style="font-size:0.85rem;font-weight:600;color:#fff;">Investor Opportunity (Hobe Sound)</div>
      <div style="font-size:0.75rem;color:#71717a;margin-top:4px;">Decreased listings signal supply constraint. Alert investor pipeline — <strong style="color:var(--ck-blue);">acquisition window narrowing</strong>.</div>
    </div>

    <div class="divider"></div>

    <!-- Predictive Timeline -->
    <div class="section-header">
      <span class="section-title">Predictive Timeline</span>
    </div>
    <div class="timeline-track">
      <div class="timeline-item">
        <div style="font-size:0.78rem;font-weight:600;color:#fff;">Q2 2026 — Seasonal Surge</div>
        <div style="font-size:0.72rem;color:#71717a;margin-top:2px;">Snowbird departures create management demand spike. 40+ properties entering active watch status.</div>
      </div>
      <div class="timeline-item">
        <div style="font-size:0.78rem;font-weight:600;color:#fff;">Q3 2026 — Hurricane Season</div>
        <div style="font-size:0.72rem;color:#71717a;margin-top:2px;">Pre-season inspections and emergency protocols activated. Insurance coordination window opens.</div>
      </div>
      <div class="timeline-item">
        <div style="font-size:0.78rem;font-weight:600;color:#fff;">Q4 2026 — Snowbird Return</div>
        <div style="font-size:0.72rem;color:#71717a;margin-top:2px;">Property preparation surge. Concierge demand increases 300%. Revenue peak period.</div>
      </div>
    </div>

    <!-- Governance Footer -->
    <div class="divider"></div>
    <div style="text-align:center;padding:var(--space-sm) 0;">
      <div style="font-size:0.6rem;color:var(--ck-gold-dim);letter-spacing:0.08em;">Intelligence Division &middot; 30 Agents Active &middot; Updated 15 min ago</div>
    </div>
  `;
}

function renderZoneTrend(zone, change, direction, median, dom, listings) {
  return `
    <div class="list-item" style="margin-bottom:var(--space-sm);">
      <div style="min-width:80px;">
        <div style="font-size:0.85rem;font-weight:600;color:#fff;">${zone}</div>
        <div class="metric-delta ${direction}" style="margin-top:4px;">${direction === 'up' ? '&#9650;' : '&#9660;'} ${change}</div>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;text-align:center;">
        <div>
          <div style="font-size:0.78rem;font-weight:600;color:#d4d4d8;">${median}</div>
          <div style="font-size:0.58rem;color:#71717a;text-transform:uppercase;">Median</div>
        </div>
        <div>
          <div style="font-size:0.78rem;font-weight:600;color:#d4d4d8;">${dom}</div>
          <div style="font-size:0.58rem;color:#71717a;text-transform:uppercase;">DOM</div>
        </div>
        <div>
          <div style="font-size:0.78rem;font-weight:600;color:#d4d4d8;">${listings}</div>
          <div style="font-size:0.58rem;color:#71717a;text-transform:uppercase;">Listings</div>
        </div>
      </div>
    </div>
  `;
}
