import { registerRoute, navigate } from '../utils/router.js';
import { isAuthenticated, login, logout, apiCall } from '../utils/auth.js';

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

function setPublicLayout(main, title, content) {
  document.getElementById('site-header').innerHTML = `
    <nav class="public-nav">
      <a href="/" class="nav-logo">
        <span class="logo-mark">CK</span>
        <span class="logo-text">Coastal Key</span>
      </a>
      <div class="nav-links">
        <a href="/about" data-nav="/about">Why Coastal Key</a>
        <a href="/services" data-nav="/services">Services</a>
        <a href="/areas" data-nav="/areas">Markets</a>
        <a href="/contact" data-nav="/contact">Investors</a>
        <a href="/contact" class="nav-portal-btn">Request Assessment</a>
      </div>
      <button class="mobile-menu-btn" onclick="document.querySelector('.nav-links').classList.toggle('open')">
        <span></span><span></span><span></span>
      </button>
    </nav>
  `;
  document.getElementById('site-footer').innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo"><span class="logo-mark">CK</span> Coastal Key</div>
        <p>Institutional-grade property management on Florida's Treasure Coast. Fiduciary discipline. Operational precision. Full accountability.</p>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="/services">Asset Management</a>
        <a href="/services">Concierge Services</a>
        <a href="/services">Investor Relations</a>
        <a href="/services">STR Optimization</a>
      </div>
      <div class="footer-col">
        <h4>Markets</h4>
        <a href="/areas">Vero Beach</a>
        <a href="/areas">Stuart</a>
        <a href="/areas">Jupiter</a>
        <a href="/areas">Port St. Lucie</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/about">Why Coastal Key</a>
        <a href="/contact">Request Assessment</a>
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

function renderHome(main) {
  setPublicLayout(main, 'Institutional-Grade Asset Protection', `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">Premium Coastal Property Management</div>
        <h1>Institutional-Grade<br>Asset Protection.</h1>
        <p class="hero-sub">Coastal Key manages high-value residential properties with the discipline of a fiduciary, the precision of an operator, and the accountability of a public company.</p>
        <div class="hero-actions">
          <a href="/contact" class="btn btn-primary">Request a Portfolio Assessment</a>
          <a href="/about" class="btn btn-secondary">Our Story</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">290</span><span class="stat-label">AI Agents</span></div>
          <div class="stat"><span class="stat-num">10</span><span class="stat-label">Markets</span></div>
          <div class="stat"><span class="stat-num">24/7</span><span class="stat-label">Coverage</span></div>
          <div class="stat"><span class="stat-num">9</span><span class="stat-label">Divisions</span></div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="section-label">Capabilities</div>
      <h2 class="section-title">The Operating System Behind Your Investment</h2>
      <p class="section-subtitle">Nine specialized divisions. 290 autonomous agents. One mandate: protect and grow your asset value.</p>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon" style="background:#0c2340">F</div>
          <h3>Fiduciary Operations</h3>
          <p>Maintenance, inspections, turnovers, and emergency response orchestrated by 45 operations agents with institutional-grade reporting.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#153a5c">I</div>
          <h3>Market Intelligence</h3>
          <p>30 intelligence agents continuously scan market data, competitor positioning, and economic indicators across every Treasure Coast submarket.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#a8893d">R</div>
          <h3>Revenue Optimization</h3>
          <p>Dynamic pricing, occupancy management, and financial modeling calibrated by 25 finance agents to maximize risk-adjusted returns.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#c9a84c">V</div>
          <h3>Vendor Governance</h3>
          <p>25 agents enforce compliance, monitor contract performance, and manage vendor relationships with the rigor of institutional procurement.</p>
        </div>
      </div>
    </section>

    <section class="value-strip">
      <div class="section-label" style="color:#c9a84c">The Coastal Key Difference</div>
      <h2 class="section-title">Built for Owners Who Expect More</h2>
      <p class="section-subtitle">Traditional property management was designed for a different era. We built the replacement.</p>
      <div class="value-grid">
        <div class="value-item">
          <h4>Discipline of a Fiduciary</h4>
          <p>Every decision measured against your long-term asset value. No shortcuts. No conflicts of interest. Full transparency.</p>
        </div>
        <div class="value-item">
          <h4>Precision of an Operator</h4>
          <p>AI-driven operations eliminate the gaps between inspection, action, and reporting that plague traditional managers.</p>
        </div>
        <div class="value-item">
          <h4>Accountability of a Public Company</h4>
          <p>Real-time dashboards, audit trails, and performance metrics. Your property managed with the governance standards of a public REIT.</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="section-label">Get Started</div>
      <h2 class="section-title">Request a Portfolio Assessment</h2>
      <p class="section-subtitle">Discover how institutional-grade management can transform your Treasure Coast property investment.</p>
      <a href="/contact" class="btn btn-primary btn-lg">Schedule a Consultation</a>
    </section>
  `);
}

function renderServices(main) {
  setPublicLayout(main, 'Services', `
    <section class="page-header"><h1>Services</h1><p>Institutional-grade property management across every dimension of ownership.</p></section>
    <section class="services-grid">
      <div class="service-card"><h3>Full-Service Asset Management</h3><p>End-to-end oversight of your property as a financial asset: tenant screening, maintenance orchestration, financial reporting, and owner communications — governed by fiduciary standards.</p></div>
      <div class="service-card"><h3>Short-Term Rental Optimization</h3><p>Dynamic pricing algorithms, multi-platform distribution, guest experience management, and turnover coordination calibrated for maximum revenue per available night.</p></div>
      <div class="service-card"><h3>Luxury Concierge Services</h3><p>White-glove concierge for high-value properties: personal arrangements, travel coordination, event planning, and bespoke guest experiences that protect your brand.</p></div>
      <div class="service-card"><h3>Investor Relations & Reporting</h3><p>Portfolio analytics, risk-adjusted return modeling, market intelligence briefings, and acquisition opportunity identification for institutional and private investors.</p></div>
      <div class="service-card"><h3>Preventive Maintenance Programs</h3><p>Systematic inspection protocols, predictive maintenance scheduling, vendor performance monitoring, and 24/7 emergency response coordination.</p></div>
      <div class="service-card"><h3>Hurricane & Storm Preparedness</h3><p>Comprehensive storm protocols: property hardening, evacuation coordination, post-storm assessment, insurance claim management, and recovery oversight.</p></div>
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
  setPublicLayout(main, 'Markets', `
    <section class="page-header"><h1>Markets</h1><p>Serving Florida's Treasure Coast — from Vero Beach to Jupiter.</p></section>
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
  setPublicLayout(main, 'Why Coastal Key', `
    <section class="page-header"><h1>Why Coastal Key</h1><p>The discipline of a fiduciary. The precision of an operator. The accountability of a public company.</p></section>
    <section class="about-content">
      <div class="about-text">
        <h2>Property Management, Rebuilt From First Principles</h2>
        <p>Coastal Key Property Management deploys 290 autonomous AI agents across 9 specialized divisions — Executive, Sentinel Sales, Operations, Intelligence, Marketing, Finance, Vendor Management, Technology, and Web Development. Every property under our management benefits from institutional-grade oversight that was previously available only to large-scale REITs and fund managers.</p>
        <p>We founded Coastal Key on a conviction: high-value property owners on the Treasure Coast deserve the same operational rigor, transparency, and accountability that institutional investors demand. Our AI systems don't replace human judgment — they eliminate the operational gaps where value is destroyed.</p>
        <h3>Organizational Structure</h3>
        <ul class="division-list">
          <li><strong>Executive Division (20 agents)</strong> — Strategic governance, risk management, portfolio oversight</li>
          <li><strong>Sentinel Sales Division (40 agents)</strong> — Lead origination, qualification, conversion pipeline</li>
          <li><strong>Operations Division (45 agents)</strong> — Property operations, maintenance, concierge, emergency response</li>
          <li><strong>Intelligence Division (30 agents)</strong> — Market research, predictive analytics, competitive intelligence</li>
          <li><strong>Marketing Division (40 agents)</strong> — Brand, content, SEO, advertising, social media</li>
          <li><strong>Finance Division (25 agents)</strong> — Revenue optimization, investor reporting, budget governance</li>
          <li><strong>Vendor Management Division (25 agents)</strong> — Procurement, compliance, contract performance</li>
          <li><strong>Technology Division (25 agents)</strong> — Platform operations, integrations, security</li>
          <li><strong>Web Development Division (40 agents)</strong> — Digital presence, performance, user experience</li>
        </ul>
      </div>
    </section>
  `);
}

function renderContact(main) {
  setPublicLayout(main, 'Request Assessment', `
    <section class="page-header"><h1>Request a Portfolio Assessment</h1><p>Discover institutional-grade management for your Treasure Coast investment.</p></section>
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
  const fallbackDivisions = [
    { code: 'EXC', name: 'Executive',       agents: 20, color: '#0c2340' },
    { code: 'SEN', name: 'Sentinel Sales',  agents: 40, color: '#153a5c' },
    { code: 'OPS', name: 'Operations',       agents: 45, color: '#a8893d' },
    { code: 'INT', name: 'Intelligence',     agents: 30, color: '#c9a84c' },
    { code: 'MKT', name: 'Marketing',        agents: 40, color: '#0c2340' },
    { code: 'FIN', name: 'Finance',          agents: 25, color: '#153a5c' },
    { code: 'VEN', name: 'Vendor Mgmt',      agents: 25, color: '#a8893d' },
    { code: 'TEC', name: 'Technology',        agents: 25, color: '#c9a84c' },
    { code: 'WEB', name: 'Web Development',  agents: 40, color: '#0c2340' },
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

  setPortalLayout(main, 'Dashboard', `
    <h1 class="portal-title">Operational Dashboard</h1>
    <div class="portal-stats" id="dash-stats">
      <div class="stat-card"><span class="stat-num" id="stat-total">290</span><span class="stat-label">Total Agents</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-active">--</span><span class="stat-label">Active</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-divisions">9</span><span class="stat-label">Divisions</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-uptime">99.9%</span><span class="stat-label">Uptime</span></div>
    </div>
    <div class="portal-card" id="dash-divisions">
      <h3>Division Breakdown</h3>
      <div class="card-body"><div class="division-grid" id="division-grid"></div></div>
    </div>
    <div class="portal-grid">
      <div class="portal-card" id="dash-audit">
        <h3>Recent Activity</h3>
        <div class="card-body"><ul class="activity-feed" id="activity-feed"></ul></div>
      </div>
      <div class="portal-card" id="dash-owner-actions">
        <h3>Owner Quick Actions</h3>
        <div class="card-body">
          <div class="owner-actions-grid">
            <button class="btn btn-primary owner-action-btn" data-action="properties">View Properties</button>
            <button class="btn btn-secondary dark owner-action-btn" data-action="maintenance">Submit Maintenance Request</button>
            <button class="btn btn-secondary dark owner-action-btn" data-action="financials">View Financials</button>
            <button class="btn btn-secondary dark owner-action-btn" data-action="contact">Contact Team</button>
          </div>
        </div>
      </div>
    </div>
  `);

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

  applyStats(fallbackStats);
  applyDivisions(fallbackDivisions);
  applyActivity(fallbackActivity);

  document.querySelectorAll('.owner-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'properties')  navigate('/portal/reports');
      if (action === 'maintenance') navigate('/portal/tasks');
      if (action === 'financials')  navigate('/portal/reports');
      if (action === 'contact')     navigate('/contact');
    });
  });

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
    } catch (_) {}
  })();
}

function renderPortalAgents(main) {
  setPortalLayout(main, 'Agent Fleet', `
    <h1 class="portal-title">AI Agent Fleet</h1>
    <div class="filter-bar">
      <input type="search" placeholder="Search agents..." class="filter-search">
      <select class="filter-select"><option value="">All Statuses</option><option>active</option><option>standby</option><option>training</option><option>maintenance</option></select>
      <select class="filter-select"><option value="">All Divisions</option><option value="EXC">Executive</option><option value="SEN">Sentinel Sales</option><option value="OPS">Operations</option><option value="INT">Intelligence</option><option value="MKT">Marketing</option><option value="FIN">Finance</option><option value="VEN">Vendor Mgmt</option><option value="TEC">Technology</option><option value="WEB">Web Development</option></select>
    </div>
    <div class="agent-grid" id="agent-list">Loading agents...</div>
  `);
}

function renderPortalLeads(main) {
  setPortalLayout(main, 'Lead Pipeline', `
    <h1 class="portal-title">Lead Pipeline</h1>
    <div class="portal-card"><div class="card-body"><p>Connected to Airtable Leads table. Use the API to create, enrich, and manage leads.</p>
    <div class="portal-actions-bar">
      <button class="btn btn-primary" onclick="alert('Create lead via /v1/leads POST')">New Lead</button>
      <button class="btn btn-secondary dark" onclick="alert('Run SCAA-1 via /v1/workflows/scaa1')">Generate Battle Plan</button>
    </div></div></div>
  `);
}

function renderPortalTasks(main) {
  setPortalLayout(main, 'Tasks', `
    <h1 class="portal-title">Task Management</h1>
    <div class="portal-card"><div class="card-body"><p>Tasks are created automatically by workflows (SCAA-1, WF-3, WF-4) and linked to leads in Airtable.</p></div></div>
  `);
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
