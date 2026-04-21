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
      const API_BASE = window.__ckApiBase || 'https://ck-api-gateway.david-e59.workers.dev';
      const res = await fetch(API_BASE + '/v1/leads/public', {
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
  // ── Division color map ─────────────────────────────────────────────────────
  const divColors = {
    EXC: '#6366f1', SEN: '#ef4444', OPS: '#f59e0b', INT: '#10b981',
    MKT: '#8b5cf6', FIN: '#06b6d4', VEN: '#f97316', TEC: '#14b8a6', WEB: '#0ea5e9',
  };

  // ── Static fallback agents ─────────────────────────────────────────────────
  const fallbackAgents = [
    { id: 'EXC-1', name: 'Chief Strategy Officer', role: 'Executive oversight & governance', division: 'EXC', status: 'active', tier: 'alpha' },
    { id: 'SEN-1', name: 'Lead Qualifier Prime', role: 'Inbound lead qualification', division: 'SEN', status: 'active', tier: 'alpha' },
    { id: 'OPS-1', name: 'Maintenance Coordinator', role: 'Work order dispatch & tracking', division: 'OPS', status: 'active', tier: 'alpha' },
    { id: 'INT-1', name: 'Market Analyst Prime', role: 'Competitive intelligence & reports', division: 'INT', status: 'active', tier: 'alpha' },
    { id: 'MKT-1', name: 'Content Engine Lead', role: 'SEO content & social strategy', division: 'MKT', status: 'active', tier: 'alpha' },
    { id: 'FIN-1', name: 'Revenue Tracker', role: 'Owner distributions & reporting', division: 'FIN', status: 'standby', tier: 'beta' },
    { id: 'VEN-1', name: 'Compliance Monitor', role: 'Vendor insurance & contract tracking', division: 'VEN', status: 'active', tier: 'beta' },
    { id: 'TEC-1', name: 'Platform Ops Lead', role: 'Infra monitoring & deployments', division: 'TEC', status: 'training', tier: 'alpha' },
    { id: 'WEB-1', name: 'Frontend Architect', role: 'Website development & optimization', division: 'WEB', status: 'active', tier: 'alpha' },
  ];

  // ── Render layout ──────────────────────────────────────────────────────────
  setPortalLayout(main, 'Agent Fleet', `
    <h1 class="portal-title">AI Agent Fleet</h1>
    <div class="filter-bar">
      <input type="search" placeholder="Search agents..." class="filter-search" id="agent-search">
      <select class="filter-select" id="agent-status-filter"><option value="">All Statuses</option><option>active</option><option>standby</option><option>training</option><option>maintenance</option></select>
      <select class="filter-select" id="agent-division-filter"><option value="">All Divisions</option><option value="EXC">Executive</option><option value="SEN">Sentinel Sales</option><option value="OPS">Operations</option><option value="INT">Intelligence</option><option value="MKT">Marketing</option><option value="FIN">Finance</option><option value="VEN">Vendor Mgmt</option><option value="TEC">Technology</option><option value="WEB">Web Development</option></select>
    </div>
    <div class="agent-grid" id="agent-list">Loading agents...</div>
  `);

  // ── Rendering helpers ──────────────────────────────────────────────────────
  let allAgents = fallbackAgents;

  function renderAgentCards(agents) {
    const grid = document.getElementById('agent-list');
    if (!grid) return;
    if (!agents.length) { grid.innerHTML = '<p style="opacity:0.6">No agents match the current filters.</p>'; return; }
    grid.innerHTML = agents.map(a => {
      const color = divColors[a.division] || '#6b7280';
      return `
        <div class="agent-card">
          <span class="agent-id">${a.id}</span>
          <div class="agent-name">${a.name}</div>
          <div class="agent-role">${a.role || ''}</div>
          <div class="agent-meta">
            <span class="badge" style="background:${color}22;color:${color}">${a.division}</span>
            <span class="badge badge-${a.status || 'active'}">${a.status || 'active'}</span>
            ${a.tier ? `<span class="badge" style="background:#f3f4f6;color:#374151">${a.tier}</span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function applyFilters() {
    const search = (document.getElementById('agent-search')?.value || '').toLowerCase();
    const status = document.getElementById('agent-status-filter')?.value || '';
    const division = document.getElementById('agent-division-filter')?.value || '';
    const filtered = allAgents.filter(a => {
      if (search && !(a.name.toLowerCase().includes(search) || a.id.toLowerCase().includes(search) || (a.role || '').toLowerCase().includes(search))) return false;
      if (status && a.status !== status) return false;
      if (division && a.division !== division) return false;
      return true;
    });
    renderAgentCards(filtered);
  }

  // ── Populate fallback immediately ──────────────────────────────────────────
  renderAgentCards(fallbackAgents);

  // ── Wire up filters ────────────────────────────────────────────────────────
  document.getElementById('agent-search')?.addEventListener('input', applyFilters);
  document.getElementById('agent-status-filter')?.addEventListener('change', applyFilters);
  document.getElementById('agent-division-filter')?.addEventListener('change', applyFilters);

  // ── Fetch live data and overwrite ──────────────────────────────────────────
  (async () => {
    try {
      const data = await apiCall('/v1/agents');
      if (Array.isArray(data) && data.length) {
        allAgents = data;
      } else if (data && Array.isArray(data.agents) && data.agents.length) {
        allAgents = data.agents;
      }
      applyFilters();
    } catch (_) {
      // Fallback data already rendered — show error only if grid still says loading
      const grid = document.getElementById('agent-list');
      if (grid && grid.textContent === 'Loading agents...') {
        renderAgentCards(fallbackAgents);
      }
    }
  })();
}

function renderPortalLeads(main) {
  // ── Static fallback leads ────────────────────────────────────────────────
  const fallbackLeads = [
    { name: 'Jennifer Hartwell', email: 'jhartwell@example.com', zone: 'Vero Beach', status: 'new', source: 'website' },
    { name: 'Marcus Reyes', email: 'mreyes@example.com', zone: 'Stuart', status: 'qualified', source: 'referral' },
    { name: 'Susan Blake', email: 'sblake@example.com', zone: 'Jupiter', status: 'nurturing', source: 'website' },
    { name: 'David Chen', email: 'dchen@example.com', zone: 'Port St. Lucie', status: 'new', source: 'paid_ad' },
  ];

  const statusColors = {
    new: '#6366f1', qualified: '#10b981', nurturing: '#f59e0b', converted: '#059669', lost: '#ef4444',
  };

  // ── Render layout ──────────────────────────────────────────────────────────
  setPortalLayout(main, 'Lead Pipeline', `
    <h1 class="portal-title">Lead Pipeline</h1>

    <div class="portal-actions-bar" style="margin-bottom:1.5rem">
      <button class="btn btn-primary" id="create-lead-btn">Create Lead</button>
      <button class="btn btn-secondary" id="enrich-lead-btn">Enrich Lead</button>
    </div>

    <!-- Inline Create Lead Form (hidden by default) -->
    <div class="inline-form" id="create-lead-form" style="display:none">
      <h4>Create New Lead</h4>
      <form id="lead-form">
        <div class="form-row">
          <div class="form-group"><label>Full Name</label><input type="text" name="name" required placeholder="Lead name"></div>
          <div class="form-group"><label>Email</label><input type="email" name="email" required placeholder="email@example.com"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Zone</label>
            <select name="zone"><option value="">Select zone...</option>
              <option>Vero Beach</option><option>Sebastian</option><option>Fort Pierce</option>
              <option>Port St. Lucie</option><option>Jensen Beach</option><option>Stuart</option>
              <option>Palm City</option><option>Hobe Sound</option><option>Jupiter</option>
              <option>North Palm Beach</option>
            </select>
          </div>
          <div class="form-group"><label>Source</label>
            <select name="source"><option value="website">Website</option><option value="referral">Referral</option><option value="paid_ad">Paid Ad</option><option value="cold_outreach">Cold Outreach</option></select>
          </div>
        </div>
        <div class="form-group"><label>Message</label><textarea name="message" rows="2" placeholder="Optional notes..."></textarea></div>
        <button type="submit" class="btn btn-primary">Submit Lead</button>
        <div id="lead-form-status" class="form-status"></div>
      </form>
    </div>

    <!-- Inline Enrich Lead Form (hidden by default) -->
    <div class="inline-form" id="enrich-lead-form" style="display:none">
      <h4>Enrich Lead</h4>
      <form id="enrich-form">
        <div class="form-group"><label>Lead Email</label><input type="email" name="email" required placeholder="email@example.com"></div>
        <button type="submit" class="btn btn-secondary">Run Enrichment</button>
        <div id="enrich-form-status" class="form-status"></div>
      </form>
    </div>

    <div class="agent-grid" id="lead-list" style="margin-top:1.5rem">Loading leads...</div>
  `);

  // ── Rendering helpers ──────────────────────────────────────────────────────
  function renderLeadCards(leads) {
    const grid = document.getElementById('lead-list');
    if (!grid) return;
    if (!leads.length) { grid.innerHTML = '<p style="opacity:0.6">No leads found.</p>'; return; }
    grid.innerHTML = leads.map(l => {
      const color = statusColors[l.status] || '#6b7280';
      return `
        <div class="lead-card">
          <div class="lead-name">${l.name}</div>
          <div class="lead-meta">${l.email || ''}</div>
          <div class="lead-meta">${l.zone || ''}</div>
          <div class="agent-meta" style="margin-top:0.75rem">
            <span class="badge" style="background:${color}22;color:${color}">${l.status || 'new'}</span>
            <span class="badge" style="background:#f3f4f6;color:#374151">${l.source || 'unknown'}</span>
          </div>
        </div>`;
    }).join('');
  }

  // ── Populate fallback immediately ──────────────────────────────────────────
  renderLeadCards(fallbackLeads);

  // ── Wire up Create Lead toggle & form ──────────────────────────────────────
  document.getElementById('create-lead-btn')?.addEventListener('click', () => {
    const form = document.getElementById('create-lead-form');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    // Hide enrich form when opening create
    const enrich = document.getElementById('enrich-lead-form');
    if (enrich) enrich.style.display = 'none';
  });

  document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('lead-form-status');
    const formData = Object.fromEntries(new FormData(e.target));
    try {
      status.textContent = 'Creating lead...';
      status.className = 'form-status';
      await apiCall('/v1/leads', { method: 'POST', body: JSON.stringify(formData) });
      status.textContent = 'Lead created successfully!';
      status.className = 'form-status success';
      e.target.reset();
    } catch (err) {
      status.textContent = 'Failed to create lead. ' + (err.message || '');
      status.className = 'form-status error';
    }
  });

  // ── Wire up Enrich Lead toggle & form ──────────────────────────────────────
  document.getElementById('enrich-lead-btn')?.addEventListener('click', () => {
    const form = document.getElementById('enrich-lead-form');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    // Hide create form when opening enrich
    const create = document.getElementById('create-lead-form');
    if (create) create.style.display = 'none';
  });

  document.getElementById('enrich-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('enrich-form-status');
    const formData = Object.fromEntries(new FormData(e.target));
    try {
      status.textContent = 'Running enrichment...';
      status.className = 'form-status';
      await apiCall('/v1/leads/enrich', { method: 'POST', body: JSON.stringify({ email: formData.email }) });
      status.textContent = 'Enrichment complete!';
      status.className = 'form-status success';
      e.target.reset();
    } catch (err) {
      status.textContent = 'Enrichment failed. ' + (err.message || '');
      status.className = 'form-status error';
    }
  });

  // ── Fetch live data and overwrite ──────────────────────────────────────────
  (async () => {
    try {
      const data = await apiCall('/v1/leads');
      if (Array.isArray(data) && data.length) {
        renderLeadCards(data);
      } else if (data && Array.isArray(data.leads) && data.leads.length) {
        renderLeadCards(data.leads);
      }
    } catch (_) {
      // Fallback data already rendered
    }
  })();
}

function renderPortalTasks(main) {
  // ── Static fallback tasks ────────────────────────────────────────────────
  const fallbackTasks = [
    { name: 'Q1 property inspection — Vero Beach portfolio', type: 'inspection', priority: 'high', status: 'In Progress', due: '2026-04-25' },
    { name: 'HVAC filter replacement — Stuart unit 4B', type: 'maintenance', priority: 'medium', status: 'Not Started', due: '2026-04-28' },
    { name: 'Pool resurfacing bid review', type: 'vendor', priority: 'low', status: 'Complete', due: '2026-04-18' },
    { name: 'Hurricane shutter audit — Jupiter', type: 'inspection', priority: 'urgent', status: 'Not Started', due: '2026-05-01' },
    { name: 'Generate monthly owner report', type: 'report', priority: 'medium', status: 'In Progress', due: '2026-04-30' },
  ];

  const priorityBadge = { urgent: 'badge-urgent', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  const typeBadge = { maintenance: '#f59e0b', inspection: '#6366f1', vendor: '#f97316', report: '#06b6d4' };

  // ── Render layout ──────────────────────────────────────────────────────────
  setPortalLayout(main, 'Tasks', `
    <h1 class="portal-title">Task Management</h1>

    <div class="filter-bar">
      <button class="btn btn-secondary filter-status-btn" data-filter="">All</button>
      <button class="btn btn-secondary filter-status-btn" data-filter="Not Started">Not Started</button>
      <button class="btn btn-secondary filter-status-btn" data-filter="In Progress">In Progress</button>
      <button class="btn btn-secondary filter-status-btn" data-filter="Complete">Complete</button>
    </div>

    <div id="task-list">Loading tasks...</div>

    <!-- Submit Maintenance Request -->
    <div class="inline-form" style="margin-top:2rem">
      <h4>Submit Maintenance Request</h4>
      <form id="maintenance-form">
        <div class="form-group"><label>Property</label><input type="text" name="property" required placeholder="Property address or unit"></div>
        <div class="form-group"><label>Description</label><textarea name="description" rows="3" required placeholder="Describe the issue..."></textarea></div>
        <div class="form-group"><label>Urgency</label>
          <select name="urgency">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Submit Request</button>
        <div id="maintenance-form-status" class="form-status"></div>
      </form>
    </div>
  `);

  // ── Rendering helpers ──────────────────────────────────────────────────────
  let allTasks = fallbackTasks;
  let activeFilter = '';

  function renderTaskCards(tasks) {
    const container = document.getElementById('task-list');
    if (!container) return;
    if (!tasks.length) { container.innerHTML = '<p style="opacity:0.6">No tasks match the current filter.</p>'; return; }
    container.innerHTML = tasks.map(t => {
      const pClass = priorityBadge[t.priority] || 'badge-medium';
      const tColor = typeBadge[t.type] || '#6b7280';
      return `
        <div class="task-card">
          <div class="task-name">${t.name}</div>
          <div class="task-meta">
            <span class="badge" style="background:${tColor}22;color:${tColor}">${t.type || 'task'}</span>
            <span class="badge ${pClass}">${t.priority || 'medium'}</span>
            <span>${t.status || ''}</span>
            ${t.due ? `<span>Due: ${t.due}</span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function applyFilter() {
    const filtered = activeFilter ? allTasks.filter(t => t.status === activeFilter) : allTasks;
    renderTaskCards(filtered);
  }

  // ── Populate fallback immediately ──────────────────────────────────────────
  renderTaskCards(fallbackTasks);

  // ── Wire up status filter buttons ──────────────────────────────────────────
  document.querySelectorAll('.filter-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter') || '';
      // Highlight active button
      document.querySelectorAll('.filter-status-btn').forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
      applyFilter();
    });
  });

  // ── Wire up maintenance request form ───────────────────────────────────────
  document.getElementById('maintenance-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('maintenance-form-status');
    const formData = Object.fromEntries(new FormData(e.target));
    try {
      status.textContent = 'Submitting request...';
      status.className = 'form-status';
      await apiCall('/v1/tasks', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Maintenance: ' + formData.property,
          type: 'maintenance',
          priority: formData.urgency,
          description: formData.description,
          property: formData.property,
          status: 'Not Started',
        }),
      });
      status.textContent = 'Maintenance request submitted!';
      status.className = 'form-status success';
      e.target.reset();
    } catch (err) {
      status.textContent = 'Failed to submit request. ' + (err.message || '');
      status.className = 'form-status error';
    }
  });

  // ── Fetch live data and overwrite ──────────────────────────────────────────
  (async () => {
    try {
      const data = await apiCall('/v1/tasks');
      if (Array.isArray(data) && data.length) {
        allTasks = data;
      } else if (data && Array.isArray(data.tasks) && data.tasks.length) {
        allTasks = data.tasks;
      }
      applyFilter();
    } catch (_) {
      // Fallback data already rendered
    }
  })();
}

function renderPortalContent(main) {
  setPortalLayout(main, 'Content Calendar', `
    <h1 class="portal-title">Content Calendar</h1>
    <div class="portal-card"><div class="card-body"><p>Generate content via the /v1/content/generate endpoint. Supports social posts, emails, video scripts, and podcast outlines.</p>
    <div class="portal-actions-bar">
      <button class="btn btn-primary" onclick="alert('Generate via /v1/content/generate POST')">Generate Content</button>
    </div></div></div>
  `);
}

function renderPortalVendors(main) {
  setPortalLayout(main, 'Vendor Compliance', `
    <h1 class="portal-title">Vendor Compliance</h1>
    <div class="portal-card"><div class="card-body"><p>25 vendor management AI agents monitor compliance, contracts, insurance, and performance across all vendors.</p></div></div>
  `);
}

function renderPortalReports(main) {
  setPortalLayout(main, 'Reports', `
    <h1 class="portal-title">Reports & Analytics</h1>
    <div class="portal-card"><div class="card-body"><p>Intelligence division (30 agents) generates market reports, forecasts, and operational analytics.</p></div></div>
  `);
}

function renderNotFound(main) {
  setPublicLayout(main, '404', `
    <section class="not-found"><h1>404</h1><p>Page not found.</p><a href="/" class="btn btn-primary">Return Home</a></section>
  `);
}
