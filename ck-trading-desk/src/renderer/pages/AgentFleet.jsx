import React, { useState } from 'react';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const DIVISIONS = ['ALL', 'Investment Banking', 'Sales & Trading', 'Asset Management', 'Quant Strategies', 'Risk', 'Technology'];

const TIERS = [
  { name: 'C-Suite', count: 5, color: 'var(--gold)' },
  { name: 'Managing Directors', count: 8, color: 'var(--purple)' },
  { name: 'Partners', count: 6, color: 'var(--blue)' },
  { name: 'Executive Directors', count: 10, color: 'var(--cyan)' },
  { name: 'Vice Presidents', count: 15, color: 'var(--green)' },
  { name: 'Directors', count: 13, color: 'var(--yellow)' },
  { name: 'Associates', count: 20, color: 'var(--text-secondary)' },
  { name: 'Analysts', count: 20, color: 'var(--text-muted)' },
];

const AGENTS = [
  // C-Suite (5)
  { id: 'TD-CEO-001', codename: 'Sovereign Alpha', title: 'Chief Executive Officer', division: 'Investment Banking', tier: 'C-Suite', trading: true, riskLimit: 50000000, modules: 'All Modules' },
  { id: 'TD-CIO-001', codename: 'Alpha Seeker', title: 'Chief Investment Officer', division: 'Asset Management', tier: 'C-Suite', trading: true, riskLimit: 40000000, modules: 'Portfolio, Execution, Research' },
  { id: 'TD-CRO-001', codename: 'Shield Protocol', title: 'Chief Risk Officer', division: 'Risk', tier: 'C-Suite', trading: false, riskLimit: 0, modules: 'Risk Engine, Compliance, Audit' },
  { id: 'TD-CTO-001', codename: 'Neural Architect', title: 'Chief Technology Officer', division: 'Technology', tier: 'C-Suite', trading: false, riskLimit: 0, modules: 'Infrastructure, ML Pipeline, Data' },
  { id: 'TD-CFO-001', codename: 'Ledger Prime', title: 'Chief Financial Officer', division: 'Investment Banking', tier: 'C-Suite', trading: false, riskLimit: 0, modules: 'Treasury, Reporting, Compliance' },

  // Managing Directors (8)
  { id: 'TD-MD-001', codename: 'Deal Architect', title: 'MD, Mergers & Acquisitions', division: 'Investment Banking', tier: 'Managing Directors', trading: true, riskLimit: 25000000, modules: 'M&A, Valuation, Deal Flow' },
  { id: 'TD-MD-002', codename: 'Flow Commander', title: 'MD, Equities Trading', division: 'Sales & Trading', tier: 'Managing Directors', trading: true, riskLimit: 30000000, modules: 'Equities, Dark Pools, Execution' },
  { id: 'TD-MD-003', codename: 'Yield Hunter', title: 'MD, Fixed Income', division: 'Sales & Trading', tier: 'Managing Directors', trading: true, riskLimit: 35000000, modules: 'Bonds, Rates, Credit' },
  { id: 'TD-MD-004', codename: 'Macro Sentinel', title: 'MD, Global Macro', division: 'Asset Management', tier: 'Managing Directors', trading: true, riskLimit: 20000000, modules: 'FX, Rates, Commodities' },
  { id: 'TD-MD-005', codename: 'Deriv Oracle', title: 'MD, Derivatives', division: 'Sales & Trading', tier: 'Managing Directors', trading: true, riskLimit: 28000000, modules: 'Options, Swaps, Exotics' },
  { id: 'TD-MD-006', codename: 'Credit Vanguard', title: 'MD, Credit Trading', division: 'Sales & Trading', tier: 'Managing Directors', trading: true, riskLimit: 22000000, modules: 'IG, HY, CDS, CLOs' },
  { id: 'TD-MD-007', codename: 'Capital Forge', title: 'MD, Capital Markets', division: 'Investment Banking', tier: 'Managing Directors', trading: true, riskLimit: 18000000, modules: 'ECM, DCM, Syndication' },
  { id: 'TD-MD-008', codename: 'Quant Overlord', title: 'MD, Quantitative Strategies', division: 'Quant Strategies', tier: 'Managing Directors', trading: true, riskLimit: 32000000, modules: 'Stat Arb, ML Models, Alpha Gen' },

  // Partners (6)
  { id: 'TD-PTR-001', codename: 'Strategic Apex', title: 'Partner, Strategic Advisory', division: 'Investment Banking', tier: 'Partners', trading: true, riskLimit: 15000000, modules: 'Advisory, Restructuring' },
  { id: 'TD-PTR-002', codename: 'Capital Sovereign', title: 'Partner, Private Equity', division: 'Asset Management', tier: 'Partners', trading: true, riskLimit: 20000000, modules: 'PE, LBOs, Growth Equity' },
  { id: 'TD-PTR-003', codename: 'Horizon Watch', title: 'Partner, Wealth Management', division: 'Asset Management', tier: 'Partners', trading: true, riskLimit: 12000000, modules: 'HNW, Family Office, Trusts' },
  { id: 'TD-PTR-004', codename: 'Volatility King', title: 'Partner, Volatility Strategies', division: 'Quant Strategies', tier: 'Partners', trading: true, riskLimit: 18000000, modules: 'Vol Surface, Greeks, Hedging' },
  { id: 'TD-PTR-005', codename: 'Compliance Titan', title: 'Partner, Regulatory Affairs', division: 'Risk', tier: 'Partners', trading: false, riskLimit: 0, modules: 'Reg Compliance, Dodd-Frank' },
  { id: 'TD-PTR-006', codename: 'Data Sovereign', title: 'Partner, Data Science', division: 'Technology', tier: 'Partners', trading: false, riskLimit: 0, modules: 'ML Ops, Feature Eng, NLP' },

  // Executive Directors (5 shown of 10)
  { id: 'TD-ED-001', codename: 'Sector Blade', title: 'ED, Sector Research', division: 'Asset Management', tier: 'Executive Directors', trading: false, riskLimit: 0, modules: 'Equity Research, Ratings' },
  { id: 'TD-ED-002', codename: 'Algo Prime', title: 'ED, Algorithmic Trading', division: 'Quant Strategies', tier: 'Executive Directors', trading: true, riskLimit: 10000000, modules: 'HFT, Market Making, TWAP' },
  { id: 'TD-ED-003', codename: 'Debt Phantom', title: 'ED, Leveraged Finance', division: 'Investment Banking', tier: 'Executive Directors', trading: true, riskLimit: 12000000, modules: 'LevFin, HY Origination' },
  { id: 'TD-ED-004', codename: 'Risk Matrix', title: 'ED, Market Risk', division: 'Risk', tier: 'Executive Directors', trading: false, riskLimit: 0, modules: 'VaR, Stress Testing, Greeks' },
  { id: 'TD-ED-005', codename: 'Client Nexus', title: 'ED, Institutional Sales', division: 'Sales & Trading', tier: 'Executive Directors', trading: true, riskLimit: 8000000, modules: 'Inst Sales, Coverage, Pitchbook' },

  // Vice Presidents (6 shown of 15)
  { id: 'TD-VP-001', codename: 'Spread Eagle', title: 'VP, Credit Analysis', division: 'Sales & Trading', tier: 'Vice Presidents', trading: true, riskLimit: 5000000, modules: 'Credit Analysis, Ratings' },
  { id: 'TD-VP-002', codename: 'Model Victor', title: 'VP, Financial Modeling', division: 'Investment Banking', tier: 'Vice Presidents', trading: false, riskLimit: 0, modules: 'DCF, LBO, Comps, M&A Models' },
  { id: 'TD-VP-003', codename: 'Signal Prime', title: 'VP, Quantitative Research', division: 'Quant Strategies', tier: 'Vice Presidents', trading: true, riskLimit: 6000000, modules: 'Alpha Research, Factor Models' },
  { id: 'TD-VP-004', codename: 'Liquidity Ghost', title: 'VP, Market Making', division: 'Sales & Trading', tier: 'Vice Presidents', trading: true, riskLimit: 7000000, modules: 'Market Making, Spreads, Depth' },
  { id: 'TD-VP-005', codename: 'Pipeline Hawk', title: 'VP, Deal Origination', division: 'Investment Banking', tier: 'Vice Presidents', trading: false, riskLimit: 0, modules: 'Origination, Client Mgmt' },
  { id: 'TD-VP-006', codename: 'Theta Decay', title: 'VP, Options Strategies', division: 'Sales & Trading', tier: 'Vice Presidents', trading: true, riskLimit: 4000000, modules: 'Options Flow, Vol Trading' },

  // Directors (4 shown of 13)
  { id: 'TD-DIR-001', codename: 'Compliance Aegis', title: 'Director, Trade Surveillance', division: 'Risk', tier: 'Directors', trading: false, riskLimit: 0, modules: 'Surveillance, AML, KYC' },
  { id: 'TD-DIR-002', codename: 'Infra Core', title: 'Director, Trading Infrastructure', division: 'Technology', tier: 'Directors', trading: false, riskLimit: 0, modules: 'Infra, Latency, Co-location' },
  { id: 'TD-DIR-003', codename: 'Allocation Engine', title: 'Director, Portfolio Construction', division: 'Asset Management', tier: 'Directors', trading: true, riskLimit: 3000000, modules: 'Allocation, Rebalancing' },
  { id: 'TD-DIR-004', codename: 'Revenue Shield', title: 'Director, P&L Attribution', division: 'Risk', tier: 'Directors', trading: false, riskLimit: 0, modules: 'P&L, Attribution, Reporting' },

  // Associates (4 shown of 20)
  { id: 'TD-ASC-001', codename: 'Pitch Perfect', title: 'Associate, Investment Banking', division: 'Investment Banking', tier: 'Associates', trading: false, riskLimit: 0, modules: 'Pitchbooks, CIMs, Teasers' },
  { id: 'TD-ASC-002', codename: 'Data Pulse', title: 'Associate, Quantitative Analytics', division: 'Quant Strategies', tier: 'Associates', trading: true, riskLimit: 1000000, modules: 'Data Pipeline, Backtesting' },
  { id: 'TD-ASC-003', codename: 'Flow Tracker', title: 'Associate, Trade Support', division: 'Sales & Trading', tier: 'Associates', trading: false, riskLimit: 0, modules: 'Trade Ops, Confirms, Settlements' },
  { id: 'TD-ASC-004', codename: 'Risk Scout', title: 'Associate, Risk Analytics', division: 'Risk', tier: 'Associates', trading: false, riskLimit: 0, modules: 'Risk Reports, Scenario Analysis' },

  // Analysts (4 shown of 20)
  { id: 'TD-ANL-001', codename: 'Screen Hunter', title: 'Analyst, Equity Research', division: 'Asset Management', tier: 'Analysts', trading: false, riskLimit: 0, modules: 'Screening, Earnings, Models' },
  { id: 'TD-ANL-002', codename: 'Wire Tap', title: 'Analyst, Market Data', division: 'Technology', tier: 'Analysts', trading: false, riskLimit: 0, modules: 'Data Feeds, API, Normalization' },
  { id: 'TD-ANL-003', codename: 'Basis Point', title: 'Analyst, Fixed Income Research', division: 'Sales & Trading', tier: 'Analysts', trading: false, riskLimit: 0, modules: 'Rates Research, Curve Analysis' },
  { id: 'TD-ANL-004', codename: 'Code Runner', title: 'Analyst, Quantitative Development', division: 'Quant Strategies', tier: 'Analysts', trading: false, riskLimit: 0, modules: 'Strategy Dev, Backtesting' },
];

export default function AgentFleet() {
  const [activeDivision, setActiveDivision] = useState('ALL');

  const filteredAgents = activeDivision === 'ALL'
    ? AGENTS
    : AGENTS.filter(a => a.division === activeDivision);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      {/* Fleet Overview Banner */}
      <div className="card" style={{ border: '1px solid var(--gold-dim)', boxShadow: 'var(--shadow-glow-gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--gap-md)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '1px', fontFamily: 'var(--font-sans)' }}>
              CK TRADING DESK -- AGENT FLEET COMMAND
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Goldman Sachs Corporate Hierarchy | Autonomous AI Operations</span>
          </div>
          <span className="badge badge-green">ALL SYSTEMS NOMINAL</span>
        </div>
        <div className="grid-4">
          <div className="metric">
            <span className="metric-label">Total Agents</span>
            <span className="metric-value" style={{ color: 'var(--gold)' }}>97</span>
          </div>
          <div className="metric">
            <span className="metric-label">Status</span>
            <span className="metric-value positive">ALL ACTIVE</span>
          </div>
          <div className="metric">
            <span className="metric-label">Divisions</span>
            <span className="metric-value">6</span>
          </div>
          <div className="metric">
            <span className="metric-label">Tiers</span>
            <span className="metric-value">8</span>
          </div>
        </div>
      </div>

      {/* Tier Breakdown Cards */}
      <div className="grid-4">
        {TIERS.map(tier => (
          <div className="card" key={tier.name} style={{ borderLeft: `3px solid ${tier.color}` }}>
            <div className="metric">
              <span className="metric-label">{tier.name}</span>
              <span className="metric-value" style={{ color: tier.color }}>{tier.count}</span>
            </div>
            <div style={{ marginTop: 'var(--gap-sm)', display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
              <span className="status-dot active" />
              <span style={{ fontSize: '10px', color: 'var(--green)' }}>ALL OPERATIONAL</span>
            </div>
          </div>
        ))}
      </div>

      {/* Division Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap' }}>
        {DIVISIONS.map(div => (
          <button
            key={div}
            className={`btn btn-sm ${activeDivision === div ? 'btn-primary' : ''}`}
            onClick={() => setActiveDivision(div)}
          >
            {div}
          </button>
        ))}
      </div>

      {/* Agent Roster Table */}
      <div className="card" style={{ overflow: 'auto', maxHeight: '600px' }}>
        <div className="card-header">
          <span className="card-title">Agent Roster ({filteredAgents.length} agents displayed)</span>
          <span className="badge badge-gold">{activeDivision === 'ALL' ? 'ALL DIVISIONS' : activeDivision.toUpperCase()}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Codename</th>
              <th>Title</th>
              <th>Division</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Trading Auth</th>
              <th>Risk Limit</th>
              <th>Modules Serviced</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map(agent => (
              <tr key={agent.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{agent.id}</td>
                <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{agent.codename}</td>
                <td>{agent.title}</td>
                <td>
                  <span className="badge badge-blue">{agent.division}</span>
                </td>
                <td>
                  <span style={{ fontSize: '11px', color: TIERS.find(t => t.name === agent.tier)?.color || 'var(--text-secondary)' }}>
                    {agent.tier}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xs)' }}>
                    <span className="status-dot active" />
                    <span style={{ fontSize: '10px', color: 'var(--green)' }}>ACTIVE</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {agent.trading
                    ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>Y</span>
                    : <span style={{ color: 'var(--text-muted)' }}>N</span>
                  }
                </td>
                <td style={{ textAlign: 'right', color: agent.riskLimit > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {agent.riskLimit > 0 ? fmt.format(agent.riskLimit) : '--'}
                </td>
                <td style={{ fontSize: '10px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {agent.modules}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Banner */}
      <div className="card" style={{ textAlign: 'center', background: 'var(--green-bg)', border: '1px solid rgba(0,255,136,0.2)' }}>
        <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          All agents work tirelessly 24/7 generating revenue for Coastal Key Enterprise
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: 'var(--gap-xs)' }}>
          97 autonomous AI agents | 6 divisions | 8 tiers | Goldman Sachs hierarchy | Zero downtime
        </p>
      </div>
    </div>
  );
}
