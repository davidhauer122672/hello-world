/**
 * Main Application Shell
 *
 * Renders the top-level layout and registers all routes.
 * Public pages get the marketing layout.
 * Portal pages get the dashboard layout with sidebar.
 */

import { registerRoute, navigate } from '../utils/router.js';
import { isAuthenticated, login, logout, apiCall } from '../utils/auth.js';

// ── Route Registration ──────────────────────────────────────────────────────

export function renderApp() {
  document.getElementById('app').innerHTML = `
    <header id="site-header"></header>
    <main id="main-content"></main>
    <footer id="site-footer"></footer>
  `;

  registerRoute('/', renderHome);
  registerRoute('/services', renderServices);
  registerRoute('/areas', renderAreas);
  registerRoute('/about', renderAbout);
  registerRoute('/contact', renderContact);
  registerRoute('/portal', renderPortalGate);
  registerRoute('/portal/dashboard', renderPortalDashboard);
  registerRoute('/portal/agents', renderPortalAgents);
  registerRoute('/portal/leads', renderPortalLeads);
  registerRoute('/portal/tasks', renderPortalTasks);
  registerRoute('/portal/content', renderPortalContent);
  registerRoute('/portal/vendors', renderPortalVendors);
  registerRoute('/portal/reports', renderPortalReports);
  registerRoute('/404', renderNotFound);
}

// ── Shared Header ───────────────────────────────────────────────────────────

function setPublicLayout(main, title, content) {
  document.getElementById('site-header').innerHTML = `
    <nav class="public-nav">
      <a href="/" class="nav-logo">
        <span class="logo-mark">CK</span>
        <span class="logo-text">Coastal Key</span>
      </a>
      <div class="nav-links">
        <a href="/services" data-nav="/services">Services</a>
        <a href="/areas" data-nav="/areas">Areas</a>
        <a href="/about" data-nav="/about">About</a>
        <a href="/contact" data-nav="/contact">Contact</a>
        <a href="/portal" class="nav-portal-btn">Team Portal</a>
      </div>
      <button class="mobile-menu-btn" onclick="document.querySelector('.nav-links').classList.toggle('open')">
        <span></span><span></span><span></span>
      </button>
    </nav>
  `;
  document.getElementById('site-footer').innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo"><span class="logo-mark">CK</span> Coastal Key Property Management</div>
        <p>Luxury property management on Florida's Treasure Coast. AI-powered operations delivering white-glove service.</p>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="/services">Property Management</a>
        <a href="/services">Concierge Services</a>
        <a href="/services">Investor Relations</a>
        <a href="/services">STR Management</a>
      </div>
      <div class="footer-col">
        <h4>Service Areas</h4>
        <a href="/areas">Vero Beach</a>
        <a href="/areas">Stuart</a>
        <a href="/areas">Jupiter</a>
        <a href="/areas">Port St. Lucie</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
        <a href="/portal">Team Portal</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Coastal Key Property Management. All rights reserved.</p>
      <p>coastalkey-pm.com</p>
    </div>
  `;
  document.title = `${title} — Coastal Key Property Management`;
  main.innerHTML = content;
}

function setPortalLayout(main, title, content) {
  if (!isAuthenticated()) {
    navigate('/portal');
    return;
  }
  document.getElementById('site-header').innerHTML = `
    <nav class="portal-nav">
      <a href="/portal/dashboard" class="nav-logo">
        <span class="logo-mark">CK</span>
        <span class="logo-text">Command Center</span>
      </a>
      <div class="portal-nav-links">
        <a href="/portal/dashboard" data-nav="/portal/dashboard">Dashboard</a>
        <a href="/portal/agents" data-nav="/portal/agents">Agents</a>
        <a href="/portal/leads" data-nav="/portal/leads">Leads</a>
        <a href="/portal/tasks" data-nav="/portal/tasks">Tasks</a>
        <a href="/portal/content" data-nav="/portal/content">Content</a>
        <a href="/portal/vendors" data-nav="/portal/vendors">Vendors</a>
        <a href="/portal/reports" data-nav="/portal/reports">Reports</a>
      </div>
      <div class="portal-actions">
        <a href="/" class="portal-public-link">Public Site</a>
        <button class="portal-logout-btn" id="logout-btn">Logout</button>
      </div>
    </nav>
  `;
  document.getElementById('site-footer').innerHTML = '';
  document.title = `${title} — CK Command Center`;
  main.innerHTML = `<div class="portal-container">${content}</div>`;
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    navigate('/portal');
  });
}

// ── Public Pages ────────────────────────────────────────────────────────────

function renderHome(main) {
  setPublicLayout(main, 'Luxury Property Management', `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">AI-Powered Property Management</div>
        <h1>Your Property. <br>Our Obsession.</h1>
        <p class="hero-sub">Coastal Key delivers white-glove property management across Florida's Treasure Coast. 290 AI agents working 24/7 so your investment never sleeps.</p>
        <div class="hero-actions">
          <a href="/contact" class="btn btn-primary">Get a Proposal</a>
          <a href="/services" class="btn btn-secondary">Our Services</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">290</span><span class="stat-label">AI Agents Active</span></div>
          <div class="stat"><span class="stat-num">10</span><span class="stat-label">Service Zones</span></div>
          <div class="stat"><span class="stat-num">24/7</span><span class="stat-label">Operations</span></div>
          <div class="stat"><span class="stat-num">9</span><span class="stat-label">Divisions</span></div>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Enterprise-Grade Operations. Boutique-Level Care.</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon" style="background:#ef4444">S</div>
          <h3>Sentinel AI Sales</h3>
          <p>40 AI agents handle inbound calls, qualify leads, and generate personalized battle plans — converting prospects into clients around the clock.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#f59e0b">O</div>
          <h3>Operations Fleet</h3>
          <p>45 agents manage maintenance, inspections, turnovers, concierge, and emergency response for every managed property.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#10b981">I</div>
          <h3>Market Intelligence</h3>
          <p>30 agents scan market data, competitor moves, and economic indicators to keep your investment strategy ahead of the curve.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#8b5cf6">M</div>
          <h3>Marketing Engine</h3>
          <p>40 agents create content, optimize SEO, manage social media, and run ad campaigns that keep your listings fully booked.</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to Experience the Difference?</h2>
      <p>Join the property owners on the Treasure Coast who've upgraded to AI-powered management.</p>
      <a href="/contact" class="btn btn-primary btn-lg">Schedule a Consultation</a>
    </section>
  `);
}

function renderServices(main) {
  setPublicLayout(main, 'Services', `
    <section class="page-header"><h1>Our Services</h1><p>Comprehensive property management powered by AI precision and human care.</p></section>
    <section class="services-grid">
      <div class="service-card"><h3>Full-Service Property Management</h3><p>End-to-end management: tenant screening, maintenance coordination, financial reporting, and owner communications — all AI-optimized.</p></div>
      <div class="service-card"><h3>Short-Term Rental Management</h3><p>Dynamic pricing, multi-platform listing optimization, guest communications, turnover coordination, and revenue maximization.</p></div>
      <div class="service-card"><h3>Luxury Concierge Services</h3><p>White-glove concierge for high-end properties: personal shopping, travel arrangements, event planning, and guest experiences.</p></div>
      <div class="service-card"><h3>Investor Relations</h3><p>Portfolio analysis, ROI reporting, market intelligence, and acquisition opportunity identification for serious investors.</p></div>
      <div class="service-card"><h3>Maintenance & Inspections</h3><p>Preventive maintenance programs, quarterly inspections, vendor management, and emergency response coordination.</p></div>
      <div class="service-card"><h3>Hurricane Preparedness</h3><p>Storm preparation, property securing, post-storm inspections, insurance claim support, and recovery coordination.</p></div>
    </section>
  `);
}

function renderAreas(main) {
  const zones = [
    { name: 'Vero Beach', county: 'Indian River', desc: 'Barrier island luxury, oceanfront estates, and premier golf communities.' },
    { name: 'Sebastian', county: 'Indian River', desc: 'Waterfront living along the Indian River Lagoon with coastal charm.' },
    { name: 'Fort Pierce', county: 'St. Lucie', desc: 'Historic downtown revival and emerging investment corridor.' },
    { name: 'Port St. Lucie', county: 'St. Lucie', desc: 'Florida\'s fastest-growing city with expanding residential communities.' },
    { name: 'Jensen Beach', county: 'Martin', desc: 'Quaint coastal village with pineapple heritage and beach access.' },
    { name: 'Stuart', county: 'Martin', desc: 'Sailfish Capital of the World with vibrant downtown and waterfront.' },
    { name: 'Palm City', county: 'Martin', desc: 'Equestrian estates, golf communities, and family-friendly living.' },
    { name: 'Hobe Sound', county: 'Martin', desc: 'Nature preserve proximity with exclusive residential enclaves.' },
    { name: 'Jupiter', county: 'Palm Beach', desc: 'Celebrity haven with world-class golf, dining, and waterfront estates.' },
    { name: 'North Palm Beach', county: 'Palm Beach', desc: 'Southern gateway to the Treasure Coast with upscale communities.' },
  ];
  setPublicLayout(main, 'Service Areas', `
    <section class="page-header"><h1>Service Areas</h1><p>Serving Florida's Treasure Coast — from Vero Beach to Jupiter.</p></section>
    <section class="areas-grid">
      ${zones.map(z => `
        <div class="area-card">
          <h3>${z.name}</h3>
          <span class="area-county">${z.county} County</span>
          <p>${z.desc}</p>
        </div>
      `).join('')}
    </section>
  `);
}

function renderAbout(main) {
  setPublicLayout(main, 'About', `
    <section class="page-header"><h1>About Coastal Key</h1><p>Technology meets hospitality on the Treasure Coast.</p></section>
    <section class="about-content">
      <div class="about-text">
        <h2>Built for the Future of Property Management</h2>
        <p>Coastal Key Property Management operates 250 AI agents across 8 specialized divisions — Executive, Sales, Operations, Intelligence, Marketing, Finance, Vendor Management, and Technology. Our AI fleet handles everything from inbound sales calls to hurricane preparation, from investor reporting to social media content creation.</p>
        <p>But technology is only as good as the human vision behind it. Coastal Key was founded on a simple principle: property owners on the Treasure Coast deserve enterprise-grade operations with boutique-level personal care. Our AI systems amplify human expertise — they don't replace it.</p>
        <h3>Our Divisions</h3>
        <ul class="division-list">
          <li><strong>Executive (20 agents)</strong> — Strategy, governance, risk management</li>
          <li><strong>Sentinel Sales (40 agents)</strong> — Lead generation, qualification, conversion</li>
          <li><strong>Operations (45 agents)</strong> — Property management, maintenance, concierge</li>
          <li><strong>Intelligence (30 agents)</strong> — Market research, predictive analytics</li>
          <li><strong>Marketing (40 agents)</strong> — Content, SEO, advertising, social media</li>
          <li><strong>Finance (25 agents)</strong> — Revenue tracking, investor reporting, budgets</li>
          <li><strong>Vendor Management (25 agents)</strong> — Compliance, contracts, quality</li>
          <li><strong>Technology (25 agents)</strong> — Platform ops, integrations, security</li>
        </ul>
      </div>
    </section>
  `);
}

function renderContact(main) {
  setPublicLayout(main, 'Contact', `
    <section class="page-header"><h1>Get in Touch</h1><p>Let's discuss how Coastal Key can manage your Treasure Coast property.</p></section>
    <section class="contact-section">
      <form class="contact-form" id="contact-form">
        <div class="form-row">
          <div class="form-group"><label>Full Name</label><input type="text" name="name" required placeholder="Your name"></div>
          <div class="form-group"><label>Email</label><input type="email" name="email" required placeholder="you@example.com"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input type="tel" name="phone" placeholder="(555) 123-4567"></div>
          <div class="form-group"><label>Property Location</label>
            <select name="zone"><option value="">Select area...</option>
              <option>Vero Beach</option><option>Sebastian</option><option>Fort Pierce</option>
              <option>Port St. Lucie</option><option>Jensen Beach</option><option>Stuart</option>
              <option>Palm City</option><option>Hobe Sound</option><option>Jupiter</option>
              <option>North Palm Beach</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>How can we help?</label><textarea name="message" rows="4" placeholder="Tell us about your property and goals..."></textarea></div>
        <button type="submit" class="btn btn-primary btn-lg" id="contact-submit">Send Inquiry</button>
        <div id="contact-status" class="form-status"></div>
      </form>
    </section>
  `);
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit');
    const status = document.getElementById('contact-status');
    const form = e.target;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = '';
    try {
      const data = Object.fromEntries(new FormData(form));
      // Direct Airtable write for public form (no auth required)
      const res = await fetch('/v1/leads/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          zone: data.zone || '',
          message: data.message || '',
          source: 'website'
        })
      });
      if (res.ok) {
        status.textContent = 'Thank you! We will be in touch within 24 hours.';
        status.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      status.textContent = 'Something went wrong. Please call us directly.';
      status.className = 'form-status error';
    }
    btn.disabled = false;
    btn.textContent = 'Send Inquiry';
  });
}

// ── Portal Pages ────────────────────────────────────────────────────────────

function renderPortalGate(main) {
  if (isAuthenticated()) {
    navigate('/portal/dashboard');
    return;
  }
  setPublicLayout(main, 'Team Portal', `
    <section class="portal-login">
      <div class="login-card">
        <div class="login-logo"><span class="logo-mark lg">CK</span></div>
        <h2>Team Portal</h2>
        <p>Connect to the CK Command Center API to access the operational dashboard.</p>
        <form id="portal-login-form">
          <div class="form-group"><label>API Gateway URL</label><input type="url" id="api-url" required placeholder="https://ck-api-gateway.your-domain.workers.dev"></div>
          <div class="form-group"><label>Bearer Token</label><input type="password" id="api-token" required placeholder="Your API token"></div>
          <button type="submit" class="btn btn-primary btn-full">Connect</button>
        </form>
        <p class="login-note">Access restricted to authorized Coastal Key team members.</p>
      </div>
    </section>
  `);
  document.getElementById('portal-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('api-url').value;
    const token = document.getElementById('api-token').value;
    login(url, token);
    navigate('/portal/dashboard');
  });
}

function renderPortalDashboard(main) {
  // ── Static fallback data ──────────────────────────────────────────────────
  const fallbackDivisions = [
    { code: 'EXC', name: 'Executive',       agents: 20, color: '#6366f1' },
    { code: 'SEN', name: 'Sentinel Sales',  agents: 40, color: '#ef4444' },
    { code: 'OPS', name: 'Operations',       agents: 45, color: '#f59e0b' },
    { code: 'INT', name: 'Intelligence',     agents: 30, color: '#10b981' },
    { code: 'MKT', name: 'Marketing',        agents: 40, color: '#8b5cf6' },
    { code: 'FIN', name: 'Finance',          agents: 25, color: '#06b6d4' },
    { code: 'VEN', name: 'Vendor Mgmt',      agents: 25, color: '#f97316' },
    { code: 'TEC', name: 'Technology',        agents: 25, color: '#14b8a6' },
    { code: 'WEB', name: 'Web Development',    agents: 40, color: '#0ea5e9' },
  ];

  const fallbackStats = {
    totalAgents: 290,
    activeAgents: 273,
    divisions: 9,
    uptime: '99.9%',
  };

  const fallbackActivity = [
    { ts: 'Just now',   text: 'SEN-12 qualified inbound lead — Vero Beach oceanfront' },
    { ts: '2 min ago',  text: 'OPS-7 dispatched maintenance crew — Stuart condo unit 4B' },
    { ts: '8 min ago',  text: 'MKT-22 published social post — Instagram Reel #TreasureCoast' },
    { ts: '15 min ago', text: 'INT-3 generated market report — Indian River County Q1' },
    { ts: '22 min ago', text: 'FIN-9 processed owner distribution — Jupiter portfolio' },
  ];

  // ── Build the layout ──────────────────────────────────────────────────────
  setPortalLayout(main, 'Dashboard', `
    <h1 class="portal-title">Operational Dashboard</h1>

    <!-- Stat Cards -->
    <div class="portal-stats" id="dash-stats">
      <div class="stat-card"><span class="stat-num" id="stat-total">290</span><span class="stat-label">Total Agents</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-active">--</span><span class="stat-label">Active</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-divisions">9</span><span class="stat-label">Divisions</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-uptime">99.9%</span><span class="stat-label">Uptime</span></div>
    </div>

    <!-- Division Breakdown -->
    <div class="portal-card" id="dash-divisions">
      <h3>Division Breakdown</h3>
      <div class="card-body">
        <div class="division-grid" id="division-grid"></div>
      </div>
    </div>

    <div class="portal-grid">
      <!-- Recent Activity -->
      <div class="portal-card" id="dash-audit">
        <h3>Recent Activity</h3>
        <div class="card-body">
          <ul class="activity-feed" id="activity-feed"></ul>
        </div>
      </div>

      <!-- Owner Quick Actions -->
      <div class="portal-card" id="dash-owner-actions">
        <h3>Owner Quick Actions</h3>
        <div class="card-body">
          <div class="owner-actions-grid">
            <button class="btn btn-primary owner-action-btn" data-action="properties">View Properties</button>
            <button class="btn btn-secondary owner-action-btn" data-action="maintenance">Submit Maintenance Request</button>
            <button class="btn btn-secondary owner-action-btn" data-action="financials">View Financials</button>
            <button class="btn btn-secondary owner-action-btn" data-action="contact">Contact Team</button>
          </div>
        </div>
      </div>
    </div>
  `);

  // ── Populate with fallback data immediately ───────────────────────────────
  function applyStats(stats) {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-total', stats.totalAgents);
    el('stat-active', stats.activeAgents);
    el('stat-divisions', stats.divisions);
    el('stat-uptime', stats.uptime);
  }

  function applyDivisions(divisions) {
    const grid = document.getElementById('division-grid');
    if (!grid) return;
    grid.innerHTML = divisions.map(d => `
      <div class="division-card" style="border-left:4px solid ${d.color}">
        <span class="division-code">${d.code}</span>
        <span class="division-name">${d.name}</span>
        <span class="division-count">${d.agents} agents</span>
      </div>
    `).join('');
  }

  function applyActivity(items) {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    feed.innerHTML = items.map(a => `
      <li class="activity-item"><span class="activity-ts">${a.ts}</span> ${a.text}</li>
    `).join('');
  }

  // Render static fallback right away so the dashboard is never empty
  applyStats(fallbackStats);
  applyDivisions(fallbackDivisions);
  applyActivity(fallbackActivity);

  // ── Wire up owner quick action buttons ────────────────────────────────────
  document.querySelectorAll('.owner-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'properties')  navigate('/portal/reports');
      if (action === 'maintenance') navigate('/portal/tasks');
      if (action === 'financials')  navigate('/portal/reports');
      if (action === 'contact')     navigate('/contact');
    });
  });

  // ── Fetch live data from API and overwrite fallback when available ────────
  (async () => {
    try {
      const data = await apiCall('/v1/dashboard');
      if (data) {
        if (data.stats) {
          applyStats({
            totalAgents: data.stats.totalAgents ?? fallbackStats.totalAgents,
            activeAgents: data.stats.activeAgents ?? fallbackStats.activeAgents,
            divisions: data.stats.divisions ?? fallbackStats.divisions,
            uptime: data.stats.uptime ?? fallbackStats.uptime,
          });
        }
        if (Array.isArray(data.divisions) && data.divisions.length) {
          applyDivisions(data.divisions);
        }
        if (Array.isArray(data.activity) && data.activity.length) {
          applyActivity(data.activity);
        }
      }
    } catch (_) {
      // Fallback data is already rendered — nothing to do
    }
  })();
}

function renderPortalAgents(main) {
  setPortalLayout(main, 'Agent Fleet', `
    <h1 class="portal-title">AI Agent Fleet <span id="agent-count" class="portal-badge">382</span></h1>
    <div class="filter-bar">
      <input type="search" placeholder="Search agents by name, role, or ID..." class="filter-search" id="agent-search">
      <select class="filter-select" id="agent-status-filter"><option value="">All Statuses</option><option>active</option><option>standby</option><option>training</option><option>maintenance</option></select>
      <select class="filter-select" id="agent-division-filter"><option value="">All Divisions</option><option value="MCCO">MCCO Sovereign</option><option value="EXC">Executive</option><option value="SEN">Sentinel Sales</option><option value="OPS">Operations</option><option value="INT">Intelligence</option><option value="MKT">Marketing</option><option value="FIN">Finance</option><option value="VEN">Vendor Mgmt</option><option value="TEC">Technology</option><option value="WEB">Web Development</option></select>
    </div>
    <div class="portal-stats" id="agent-stats"></div>
    <div class="agent-grid" id="agent-list"><div class="loading-placeholder">Loading fleet...</div></div>
  `);

  let allAgents = [];
  const divColors = { MCCO:'#ef4444', EXC:'#6366f1', SEN:'#ef4444', OPS:'#f59e0b', INT:'#10b981', MKT:'#8b5cf6', FIN:'#06b6d4', VEN:'#f97316', TEC:'#14b8a6', WEB:'#0ea5e9' };

  function renderAgentCards(agents) {
    const grid = document.getElementById('agent-list');
    const count = document.getElementById('agent-count');
    if (count) count.textContent = agents.length;
    if (!grid) return;
    if (!agents.length) { grid.innerHTML = '<p class="empty-state">No agents match filters.</p>'; return; }
    grid.innerHTML = agents.map(a => `
      <div class="agent-card-mini" style="border-left:3px solid ${divColors[a.division] || '#666'}">
        <div class="agent-card-header">
          <span class="agent-id-badge">${a.id}</span>
          <span class="status-dot ${a.status}">${a.status}</span>
        </div>
        <div class="agent-card-name">${a.name}</div>
        <div class="agent-card-role">${a.role}</div>
        <div class="agent-card-desc">${a.description ? a.description.substring(0, 120) + '...' : ''}</div>
        <div class="agent-card-meta"><span>${a.division}</span><span>${a.tier || 'standard'}</span></div>
      </div>
    `).join('');
  }

  function filterAgents() {
    const q = (document.getElementById('agent-search')?.value || '').toLowerCase();
    const status = document.getElementById('agent-status-filter')?.value || '';
    const division = document.getElementById('agent-division-filter')?.value || '';
    let filtered = allAgents;
    if (q) filtered = filtered.filter(a => (a.name + a.role + a.id + (a.description || '')).toLowerCase().includes(q));
    if (status) filtered = filtered.filter(a => a.status === status);
    if (division) filtered = filtered.filter(a => a.division === division);
    renderAgentCards(filtered);
  }

  document.getElementById('agent-search')?.addEventListener('input', filterAgents);
  document.getElementById('agent-status-filter')?.addEventListener('change', filterAgents);
  document.getElementById('agent-division-filter')?.addEventListener('change', filterAgents);

  (async () => {
    try {
      const data = await apiCall('/v1/agents');
      allAgents = data.agents || [];
      const stats = document.getElementById('agent-stats');
      if (stats) {
        const byStatus = {};
        allAgents.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
        stats.innerHTML = `
          <div class="stat-card"><span class="stat-num">${allAgents.length}</span><span class="stat-label">Total Agents</span></div>
          <div class="stat-card"><span class="stat-num green">${byStatus.active || 0}</span><span class="stat-label">Active</span></div>
          <div class="stat-card"><span class="stat-num blue">${byStatus.standby || 0}</span><span class="stat-label">Standby</span></div>
          <div class="stat-card"><span class="stat-num yellow">${byStatus.training || 0}</span><span class="stat-label">Training</span></div>
        `;
      }
      renderAgentCards(allAgents);
    } catch (e) {
      document.getElementById('agent-list').innerHTML = '<p class="empty-state">Connect to Gateway to view fleet.</p>';
    }
  })();
}

function renderPortalLeads(main) {
  setPortalLayout(main, 'Lead Pipeline', `
    <h1 class="portal-title">Lead Pipeline</h1>
    <div class="portal-stats" id="lead-stats">
      <div class="stat-card"><span class="stat-num" id="leads-total">--</span><span class="stat-label">Total Leads</span></div>
      <div class="stat-card"><span class="stat-num green" id="leads-qualified">--</span><span class="stat-label">Qualified</span></div>
      <div class="stat-card"><span class="stat-num yellow" id="leads-nurture">--</span><span class="stat-label">In Nurture</span></div>
      <div class="stat-card"><span class="stat-num blue" id="leads-new">--</span><span class="stat-label">New Today</span></div>
    </div>
    <div class="portal-grid">
      <div class="portal-card">
        <h3>Quick Actions</h3>
        <div class="card-body">
          <div class="portal-actions-grid">
            <button class="btn btn-primary" id="btn-new-lead">Create New Lead</button>
            <button class="btn btn-secondary" id="btn-battle-plan">Generate Battle Plan</button>
            <button class="btn btn-secondary" id="btn-enrich">Enrich Lead</button>
            <button class="btn btn-secondary" id="btn-wf3">Investor Escalation (WF-3)</button>
          </div>
        </div>
      </div>
      <div class="portal-card">
        <h3>Pipeline Stages</h3>
        <div class="card-body">
          <div class="pipeline-stages">
            <div class="pipeline-stage"><span class="stage-dot new"></span><strong>New</strong> — Unqualified inbound leads</div>
            <div class="pipeline-stage"><span class="stage-dot contacted"></span><strong>Contacted</strong> — Initial outreach complete</div>
            <div class="pipeline-stage"><span class="stage-dot qualified"></span><strong>Qualified</strong> — Meets SCAA-1 criteria</div>
            <div class="pipeline-stage"><span class="stage-dot proposal"></span><strong>Proposal</strong> — Management proposal sent</div>
            <div class="pipeline-stage"><span class="stage-dot negotiation"></span><strong>Negotiation</strong> — Active deal negotiation</div>
            <div class="pipeline-stage"><span class="stage-dot closed"></span><strong>Closed Won</strong> — Signed management contract</div>
          </div>
        </div>
      </div>
    </div>
    <div class="portal-card" style="margin-top:20px">
      <h3>Recent Leads</h3>
      <div class="card-body" id="leads-list"><div class="loading-placeholder">Fetching leads from Airtable...</div></div>
    </div>
  `);

  // Wire up action buttons
  document.getElementById('btn-new-lead')?.addEventListener('click', async () => {
    const name = prompt('Lead name:');
    if (!name) return;
    const email = prompt('Email:') || '';
    const phone = prompt('Phone:') || '';
    try {
      await apiCall('/v1/leads', { method: 'POST', body: JSON.stringify({ name, email, phone, source: 'portal' }) });
      alert('Lead created successfully.');
    } catch (e) { alert('Error: ' + e.message); }
  });
  document.getElementById('btn-battle-plan')?.addEventListener('click', async () => {
    const id = prompt('Enter Airtable Lead Record ID:');
    if (!id) return;
    try {
      const result = await apiCall('/v1/workflows/scaa1', { method: 'POST', body: JSON.stringify({ leadId: id }) });
      alert('Battle plan generated. Check Airtable and Slack for results.');
    } catch (e) { alert('Error: ' + e.message); }
  });
  document.getElementById('btn-enrich')?.addEventListener('click', async () => {
    const id = prompt('Enter Airtable Lead Record ID:');
    if (!id) return;
    try {
      await apiCall('/v1/leads/enrich', { method: 'POST', body: JSON.stringify({ leadId: id }) });
      alert('Lead enriched successfully.');
    } catch (e) { alert('Error: ' + e.message); }
  });
  document.getElementById('btn-wf3')?.addEventListener('click', async () => {
    const id = prompt('Enter Airtable Lead Record ID for investor escalation:');
    if (!id) return;
    try {
      await apiCall('/v1/workflows/wf3', { method: 'POST', body: JSON.stringify({ leadId: id }) });
      alert('WF-3 investor escalation triggered.');
    } catch (e) { alert('Error: ' + e.message); }
  });

  (async () => {
    try {
      const dashboard = await apiCall('/v1/dashboard');
      if (dashboard?.leads) {
        const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        el('leads-total', dashboard.leads.total || 0);
        el('leads-qualified', dashboard.leads.qualified || 0);
        el('leads-nurture', dashboard.leads.nurture || 0);
        el('leads-new', dashboard.leads.newToday || 0);
      }
    } catch (_) {}
  })();
}

function renderPortalTasks(main) {
  setPortalLayout(main, 'Tasks', `
    <h1 class="portal-title">Task Management</h1>
    <div class="portal-stats">
      <div class="stat-card"><span class="stat-num" id="tasks-total">--</span><span class="stat-label">Total Tasks</span></div>
      <div class="stat-card"><span class="stat-num yellow" id="tasks-pending">--</span><span class="stat-label">Pending</span></div>
      <div class="stat-card"><span class="stat-num green" id="tasks-completed">--</span><span class="stat-label">Completed</span></div>
      <div class="stat-card"><span class="stat-num red" id="tasks-overdue">--</span><span class="stat-label">Overdue</span></div>
    </div>
    <div class="portal-grid">
      <div class="portal-card">
        <h3>Workflow-Generated Tasks</h3>
        <div class="card-body">
          <p>Tasks are auto-created by the three core workflows and linked to leads in Airtable:</p>
          <div class="workflow-list">
            <div class="workflow-item"><strong>SCAA-1</strong> — Sales Call Action Agenda. Generates a 3-step battle plan per qualified lead: opening hook, value props, and objection handling.</div>
            <div class="workflow-item"><strong>WF-3</strong> — Investor Escalation. Triggers when a lead exceeds $5M threshold. Creates investor brief, presentation draft, and Slack escalation to #investor-escalations.</div>
            <div class="workflow-item"><strong>WF-4</strong> — Long-Tail Nurture. 90-day re-engagement sequence for leads not yet ready to convert. Auto-generates check-in emails and content recommendations.</div>
          </div>
        </div>
      </div>
      <div class="portal-card">
        <h3>Maintenance Requests</h3>
        <div class="card-body">
          <button class="btn btn-primary" id="btn-maintenance">Submit Maintenance Request</button>
          <p style="margin-top:12px;color:var(--text-secondary)">Maintenance requests route to OPS division (45 agents). OPS-002 Maintenance Dispatcher assigns vendors based on skill, availability, and proximity.</p>
        </div>
      </div>
    </div>
  `);
  document.getElementById('btn-maintenance')?.addEventListener('click', () => {
    const property = prompt('Property address:');
    const issue = prompt('Describe the issue:');
    if (property && issue) alert(`Maintenance request submitted for ${property}. OPS division notified.`);
  });
}

function renderPortalContent(main) {
  setPortalLayout(main, 'Content Calendar', `
    <h1 class="portal-title">Content Engine</h1>
    <div class="portal-stats">
      <div class="stat-card"><span class="stat-num">168</span><span class="stat-label">Posts/Week</span></div>
      <div class="stat-card"><span class="stat-num">8</span><span class="stat-label">Platforms</span></div>
      <div class="stat-card"><span class="stat-num">47</span><span class="stat-label">MKT Agents</span></div>
      <div class="stat-card"><span class="stat-num">4</span><span class="stat-label">Content Pillars</span></div>
    </div>
    <div class="portal-grid">
      <div class="portal-card">
        <h3>Generate Content</h3>
        <div class="card-body">
          <div class="form-group"><label>Content Type</label>
            <select id="content-type" class="filter-select" style="width:100%">
              <option value="social">Social Media Post</option><option value="email">Email Campaign</option>
              <option value="script">Video Script</option><option value="youtube_idea">YouTube Idea</option>
              <option value="youtube_script">YouTube Script</option><option value="podcast">Podcast Outline</option>
            </select>
          </div>
          <div class="form-group"><label>Platform</label>
            <select id="content-platform" class="filter-select" style="width:100%">
              <option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option><option value="x">X (Twitter)</option>
              <option value="tiktok">TikTok</option><option value="youtube">YouTube</option>
            </select>
          </div>
          <div class="form-group"><label>Content Pillar</label>
            <select id="content-pillar" class="filter-select" style="width:100%">
              <option value="AI Authority">AI Authority</option><option value="Market Intelligence">Market Intelligence</option>
              <option value="CEO Journey">CEO Journey</option><option value="Treasure Coast Lifestyle">Treasure Coast Lifestyle</option>
            </select>
          </div>
          <div class="form-group"><label>Target Audience</label>
            <select id="content-audience" class="filter-select" style="width:100%">
              <option value="Absentee Owners">Absentee Owners</option><option value="Luxury Homeowners">Luxury Homeowners</option>
              <option value="Investors">Investors</option><option value="STR Owners">STR Owners</option>
              <option value="General">General Audience</option>
            </select>
          </div>
          <button class="btn btn-primary btn-full" id="btn-generate">Generate with Claude AI</button>
          <div id="content-result" style="margin-top:16px"></div>
        </div>
      </div>
      <div class="portal-card">
        <h3>Content Pillars</h3>
        <div class="card-body">
          <div class="pillar-list">
            <div class="pillar-item" style="border-left:3px solid #4f8fff"><strong>AI Authority</strong><br>Command Center screenshots, fleet operations, division spotlights, Gazette excerpts</div>
            <div class="pillar-item" style="border-left:3px solid #22c55e"><strong>Market Intelligence</strong><br>Monthly market reports, hot zone spotlights, median price trends, inventory data</div>
            <div class="pillar-item" style="border-left:3px solid #eab308"><strong>CEO Journey</strong><br>Personal brand, client wins, Children's Miracle Network, faith and family</div>
            <div class="pillar-item" style="border-left:3px solid #ef4444"><strong>Treasure Coast Lifestyle</strong><br>Drone content, local business spotlights, seasonal events, relocator guides</div>
          </div>
        </div>
      </div>
    </div>
    <div class="portal-card" style="margin-top:20px">
      <h3>MCCO Sovereign Command</h3>
      <div class="card-body">
        <p>The MCCO (Master Chief Commanding Officer) governs all marketing and sales through 15 sovereign command units operating at Ferrari-standard execution.</p>
        <div class="portal-actions-grid" style="margin-top:12px">
          <button class="btn btn-secondary" id="btn-calendar">30-Day Calendar</button>
          <button class="btn btn-secondary" id="btn-audience">Audience Profile</button>
          <button class="btn btn-secondary" id="btn-post">Generate Post</button>
        </div>
      </div>
    </div>
  `);

  document.getElementById('btn-generate')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-generate');
    const result = document.getElementById('content-result');
    btn.disabled = true; btn.textContent = 'Generating...';
    result.innerHTML = '';
    try {
      const data = await apiCall('/v1/content/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: document.getElementById('content-type').value,
          platform: document.getElementById('content-platform').value,
          pillar: document.getElementById('content-pillar').value,
          target_segment: document.getElementById('content-audience').value,
          tone: 'authoritative',
        }),
      });
      result.innerHTML = '<div class="content-output"><h4>Generated Content</h4><pre style="white-space:pre-wrap;font-family:inherit;background:var(--bg);padding:16px;border-radius:8px;font-size:13px;line-height:1.6">' + (data.content || data.result || JSON.stringify(data, null, 2)) + '</pre></div>';
    } catch (e) { result.innerHTML = '<p class="error-msg">Error: ' + e.message + '</p>'; }
    btn.disabled = false; btn.textContent = 'Generate with Claude AI';
  });

  document.getElementById('btn-calendar')?.addEventListener('click', async () => {
    try {
      const data = await apiCall('/v1/mcco/content-calendar', { method: 'POST', body: JSON.stringify({ month: new Date().toISOString().slice(0,7) }) });
      alert('30-day calendar generated. Check the response in console.');
      console.log('MCCO Calendar:', data);
    } catch (e) { alert('Error: ' + e.message); }
  });
  document.getElementById('btn-audience')?.addEventListener('click', async () => {
    try {
      const data = await apiCall('/v1/mcco/audience-profile', { method: 'POST', body: JSON.stringify({ segment: 'absentee-owners' }) });
      alert('Audience profile generated. Check console.');
      console.log('Audience Profile:', data);
    } catch (e) { alert('Error: ' + e.message); }
  });
  document.getElementById('btn-post')?.addEventListener('click', async () => {
    const topic = prompt('Post topic or theme:');
    if (!topic) return;
    try {
      const data = await apiCall('/v1/mcco/post', { method: 'POST', body: JSON.stringify({ topic, platform: 'instagram' }) });
      alert('Post generated. Check console.');
      console.log('MCCO Post:', data);
    } catch (e) { alert('Error: ' + e.message); }
  });
}

function renderPortalVendors(main) {
  setPortalLayout(main, 'Vendor Compliance', `
    <h1 class="portal-title">Vendor Management</h1>
    <div class="portal-stats">
      <div class="stat-card"><span class="stat-num">25</span><span class="stat-label">VEN Agents</span></div>
      <div class="stat-card"><span class="stat-num green">--</span><span class="stat-label">Compliant</span></div>
      <div class="stat-card"><span class="stat-num yellow">--</span><span class="stat-label">Expiring Soon</span></div>
      <div class="stat-card"><span class="stat-num red">--</span><span class="stat-label">Non-Compliant</span></div>
    </div>
    <div class="portal-grid">
      <div class="portal-card">
        <h3>Compliance Monitoring</h3>
        <div class="card-body">
          <p>The VEN division (25 agents) monitors vendor compliance across these critical areas:</p>
          <div class="compliance-grid">
            <div class="compliance-item"><strong>Insurance</strong> — VEN-007 tracks certificates of insurance, expiration dates, and coverage adequacy for all contracted vendors.</div>
            <div class="compliance-item"><strong>Licensing</strong> — VEN-008 monitors professional licenses: contractor, pest control, electrical, plumbing, and specialty trades.</div>
            <div class="compliance-item"><strong>Background Checks</strong> — VEN-022 conducts and tracks background verification for all vendors with property access.</div>
            <div class="compliance-item"><strong>Safety</strong> — VEN-017 monitors OSHA standards, jobsite safety protocols, and incident reporting compliance.</div>
            <div class="compliance-item"><strong>Subcontractors</strong> — VEN-018 verifies subcontractors used by primary vendors meet Coastal Key standards.</div>
          </div>
        </div>
      </div>
      <div class="portal-card">
        <h3>Vendor Operations</h3>
        <div class="card-body">
          <div class="portal-actions-grid">
            <button class="btn btn-primary">Vendor Registry</button>
            <button class="btn btn-secondary">Bid Management</button>
            <button class="btn btn-secondary">Performance Scorecards</button>
            <button class="btn btn-secondary">Emergency Roster</button>
          </div>
          <div style="margin-top:16px">
            <h4 style="font-size:14px;margin-bottom:8px">Preferred Vendor Program</h4>
            <p>VEN-012 manages tier assignments (Gold, Silver, Bronze) based on performance scores, compliance rates, and client feedback.</p>
          </div>
        </div>
      </div>
    </div>
  `);
}

function renderPortalReports(main) {
  setPortalLayout(main, 'Reports', `
    <h1 class="portal-title">Reports & Analytics</h1>
    <div class="portal-stats">
      <div class="stat-card"><span class="stat-num">30</span><span class="stat-label">INT Agents</span></div>
      <div class="stat-card"><span class="stat-num">50</span><span class="stat-label">Intel Officers</span></div>
      <div class="stat-card"><span class="stat-num">5</span><span class="stat-label">Intel Squads</span></div>
      <div class="stat-card"><span class="stat-num">25</span><span class="stat-label">FIN Agents</span></div>
    </div>
    <div class="portal-grid">
      <div class="portal-card">
        <h3>Intelligence Reports</h3>
        <div class="card-body">
          <div class="report-list">
            <button class="btn btn-secondary btn-full report-btn" data-report="market">Market Trends by Zone</button>
            <button class="btn btn-secondary btn-full report-btn" data-report="competitive">Competitive Intelligence</button>
            <button class="btn btn-secondary btn-full report-btn" data-report="pipeline">Lead Pipeline Health</button>
            <button class="btn btn-secondary btn-full report-btn" data-report="fleet">Fleet Analytics</button>
            <button class="btn btn-secondary btn-full report-btn" data-report="churn">Churn Prediction</button>
          </div>
        </div>
      </div>
      <div class="portal-card">
        <h3>Financial Engine</h3>
        <div class="card-body">
          <div class="report-list">
            <button class="btn btn-secondary btn-full report-btn" data-report="roi">Property ROI Analysis</button>
            <button class="btn btn-secondary btn-full report-btn" data-report="forecast">12-Month Forecast</button>
            <button class="btn btn-secondary btn-full report-btn" data-report="pricing">Dynamic Pricing</button>
            <button class="btn btn-secondary btn-full report-btn" data-report="budget">Annual Budget</button>
          </div>
        </div>
      </div>
    </div>
    <div class="portal-card" style="margin-top:20px">
      <h3>Intelligence Officer Fleet</h3>
      <div class="card-body" id="intel-fleet">
        <div class="intel-squads">
          <div class="intel-squad" style="border-left:3px solid #4f8fff"><strong>ALPHA</strong> — Infrastructure (10 officers)<br>Gateway health, KV connectivity, DNS, SSL, CDN, latency</div>
          <div class="intel-squad" style="border-left:3px solid #22c55e"><strong>BRAVO</strong> — Data Integrity (10 officers)<br>Schema consistency, duplicate detection, audit trail, pipeline leakage</div>
          <div class="intel-squad" style="border-left:3px solid #ef4444"><strong>CHARLIE</strong> — Security (10 officers)<br>Auth failures, rate violations, CORS, TCPA compliance, secret exposure</div>
          <div class="intel-squad" style="border-left:3px solid #eab308"><strong>DELTA</strong> — Revenue Ops (10 officers)<br>Conversion velocity, campaign KPIs, booking rates, revenue attribution</div>
          <div class="intel-squad" style="border-left:3px solid #7c5cfc"><strong>ECHO</strong> — Performance (10 officers)<br>Inference costs, Airtable rates, CPU time, cache optimization, MTTR</div>
        </div>
        <button class="btn btn-primary" id="btn-fleet-scan" style="margin-top:16px">Run Fleet Scan (Critical Officers)</button>
        <div id="scan-result" style="margin-top:12px"></div>
      </div>
    </div>
  `);

  // Wire up report buttons
  document.querySelectorAll('.report-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const report = btn.dataset.report;
      const endpoints = {
        market: '/v1/analysis/market-trends', competitive: '/v1/analysis/competitive-intel',
        pipeline: '/v1/analysis/lead-pipeline', fleet: '/v1/analysis/fleet', churn: '/v1/analysis/churn-prediction',
        roi: '/v1/financial/roi', forecast: '/v1/financial/forecast', pricing: '/v1/pricing/zones', budget: '/v1/financial/budget',
      };
      try {
        const data = await apiCall(endpoints[report] || '/v1/health', { method: endpoints[report]?.includes('financial') || endpoints[report]?.includes('analysis') ? 'POST' : 'GET', body: ['GET'].includes('GET') ? undefined : JSON.stringify({}) });
        console.log(`Report [${report}]:`, data);
        alert('Report generated. Results logged to console.');
      } catch (e) { alert('Error: ' + e.message); }
    });
  });

  document.getElementById('btn-fleet-scan')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-fleet-scan');
    const result = document.getElementById('scan-result');
    btn.disabled = true; btn.textContent = 'Scanning...';
    try {
      const data = await apiCall('/v1/intel/fleet-scan', { method: 'POST' });
      const scan = data.fleetScan || {};
      result.innerHTML = '<div class="scan-output"><strong>Status: ' + (scan.overallStatus || 'UNKNOWN') + '</strong><br>Officers scanned: ' + (scan.officersScanned || 0) + '<br>Findings: ' + (scan.totalFindings || 0) + '</div>';
    } catch (e) { result.innerHTML = '<p class="error-msg">Scan failed: ' + e.message + '</p>'; }
    btn.disabled = false; btn.textContent = 'Run Fleet Scan (Critical Officers)';
  });
}

function renderNotFound(main) {
  setPublicLayout(main, '404', `
    <section class="not-found"><h1>404</h1><p>Page not found.</p><a href="/" class="btn btn-primary">Return Home</a></section>
  `);
}
