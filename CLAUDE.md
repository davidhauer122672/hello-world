# Coastal Key Enterprise + THG App — AI Development Guide

## Project Overview
Coastal Key Property Management (CKPM) Enterprise AI Operations Platform + Tracey Hunter Group Real Estate App.
Monorepo: Cloudflare Workers, Cloudflare Pages, Airtable, Retell AI, Claude API integrations.

## Architecture Map

```
hello-world/
├── ck-api-gateway/        # Central API — inference, leads, agents, workflows (CF Worker)
├── ck-command-center/     # Dashboard UI for 40-agent fleet (CF Pages, single HTML)
├── ck-website/            # Coastal Key public website
├── sentinel-webhook/      # Retell call_analyzed → Airtable + Slack pipeline (CF Worker)
├── th-sentinel-campaign/  # Campaign config, Retell prompts, Airtable field reference
├── thg-app/               # Tracey Hunter Group AI Real Estate PWA (CF Pages, React+Vite)
│   ├── src/
│   │   ├── main.jsx              # Entry point + splash screen
│   │   ├── App.jsx               # Root app with routing, admin gate, tab navigation
│   │   ├── config/
│   │   │   ├── theme.js          # Design tokens: colors, shadows, gradients
│   │   │   ├── agents.js         # AI agent definitions (Scout, Compass, Beacon, Harbor)
│   │   │   └── constants.js      # Service areas, market data defaults
│   │   ├── components/
│   │   │   ├── Header.jsx        # THG branded header
│   │   │   ├── ChatInterface.jsx # AI agent chat with typing animation
│   │   │   ├── MortgageCalc.jsx  # Mortgage calculator with validation
│   │   │   ├── LeadForm.jsx      # Lead capture → Airtable pipeline
│   │   │   ├── MarketData.jsx    # Market data dashboard cards
│   │   │   ├── ServiceAreas.jsx  # 12 Treasure Coast service areas
│   │   │   ├── QuickActions.jsx  # Call, Text, Directions CTAs
│   │   │   ├── AdminDashboard.jsx# PIN-gated admin panel (hidden from public)
│   │   │   └── Footer.jsx        # Fair Housing + compliance disclosures
│   │   ├── services/
│   │   │   └── airtable.js       # Lead submission + AI logging API calls
│   │   └── hooks/
│   │       └── useLeadSubmit.js  # Lead form state + submission logic
│   ├── public/
│   │   ├── manifest.json         # PWA manifest
│   │   ├── sw.js                 # Service worker (offline + caching)
│   │   ├── _redirects            # Cloudflare Pages SPA routing
│   │   ├── icon-192.png          # PWA icon
│   │   └── icon-512.png          # PWA icon large
│   ├── tests/
│   │   ├── App.test.jsx          # Component tests
│   │   └── agents.test.js        # AI agent + market data tests
│   ├── index.html                # PWA shell
│   ├── package.json
│   └── vite.config.js
├── deployment.json        # Service deployment manifest
├── action.yml             # GitHub Actions composite action
├── package.json           # Root workspace config
└── CLAUDE.md              # THIS FILE — read first every session
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend (THG) | React | 19.x |
| Build Tool | Vite | 6.x |
| Test Runner | Vitest | 3.x |
| Workers Runtime | Cloudflare Workers | ES Modules |
| Static Hosting | Cloudflare Pages | — |
| Database | Airtable | REST API v0 |
| AI Inference | Anthropic Claude API | claude-sonnet-4-20250514 |
| Voice AI | Retell AI | Webhook v2 |
| Notifications | Slack Webhooks | — |
| PWA | Service Worker + Web App Manifest | — |

## Commands

```bash
# THG App (thg-app/)
npm run dev              # Vite dev server → http://localhost:3000
npm run build            # Production build → dist/
npm run preview          # Preview production build locally
npm run test             # Run Vitest test suite
npm run deploy           # Build + copy assets + deploy to CF Pages

# Workers (root)
npm run dev:gateway      # wrangler dev for API gateway
npm run dev:sentinel     # wrangler dev for sentinel webhook
npm test                 # Run all worker tests (node --test)
npm run test:gateway     # Test API gateway only
npm run test:sentinel    # Test sentinel webhook only
npm run deploy           # Deploy all services to Cloudflare
```

## Coding Standards

### File Organization
- **One component per file** in `thg-app/src/components/`
- **Hooks** in `thg-app/src/hooks/` — custom React hooks only
- **Services/API** in `thg-app/src/services/` — external API calls
- **Constants/config** in `thg-app/src/config/` — design tokens, agent defs, static data
- Workers use flat `src/` with `routes/`, `middleware/`, `utils/`, `services/`, `agents/`

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase `.jsx` | `ChatInterface.jsx` |
| Hooks | camelCase, `use` prefix | `useLeadSubmit.js` |
| Services | camelCase `.js` | `airtable.js` |
| Config files | camelCase `.js` | `theme.js`, `agents.js` |
| Constants | SCREAMING_SNAKE_CASE | `NAVY`, `GOLD_LIGHT`, `SERVICE_AREAS` |
| CSS/style tokens | camelCase | `goldBarTexture` |
| Airtable field IDs | Original IDs, never rename | `fldTg7ISkLpjFaDmg` |
| Worker routes | kebab-case URLs | `/v1/leads/public` |
| Test files | `*.test.jsx` / `*.test.js` | `App.test.jsx` |

### React Patterns
- **Functional components only** — no class components
- **Inline styles** via style objects — single-file PWA, no CSS imports
- **Design tokens** centralized in `config/theme.js` — never hardcode colors
- **State**: `useState` for local, React Context for shared (auth, admin mode)
- **No external state libraries** — keep bundle small (<100KB gzip)
- **Error boundaries** wrap major sections (chat, calculator, forms)
- **Accessibility**: ARIA labels on interactive elements, semantic HTML
- **Input validation**: All user inputs validated before submission

### Security Rules (CRITICAL — ENFORCED IN CODE REVIEW)
1. **NEVER** hardcode API keys, secrets, or tokens in source files
2. **ALWAYS** validate webhook signatures before processing payloads
3. **ALWAYS** sanitize user input at API boundaries (leads, chat, forms)
4. **NEVER** use `Access-Control-Allow-Origin: *` in production
5. **ALWAYS** wrap `JSON.parse()` in try-catch
6. **NEVER** expose infrastructure details in unauthenticated endpoints
7. Admin routes require PIN authentication (6-digit, client-side gate)
8. Lead forms validate: name (required), phone (10+ digits), email (format)
9. Mortgage calculator validates numeric input, guards against NaN/Infinity
10. Rate limit all public-facing form submissions

### Worker Patterns (ck-api-gateway, sentinel-webhook)
- ES module format: `export default { fetch() }`
- Auth via Bearer token: `WORKER_AUTH_TOKEN` secret
- Rate limiting via KV: `RATE_LIMITS` namespace
- Audit logging via KV: `AUDIT_LOG` namespace
- All API routes prefixed with `/v1/`
- CORS restricted to known origins (NOT `*`)
- Webhook signature verification **mandatory** for Retell events

## Airtable Reference

### Base: Coastal Key Master Orchestrator
**Base ID**: `appUSnNgpDkcEOzhN`

### THG Tables
| Table | ID | Purpose |
|-------|-----|---------|
| THG Leads | `tblsclEA36lvUC6Vo` | Leads from app, social, ads, referrals |
| THG AI Log | `tblByo2bvfygdANlZ` | Every AI agent conversation for audit |
| THG Content Calendar | `tblhu80Rc5cFGqSoc` | Social media post workflow |
| THG Market Data | `tblyUj9C4gD7bhP6Y` | Daily market stats for AI agents |

### THG Leads Field Map
| Field | ID | Type |
|-------|-----|------|
| Lead Name | `fldTg7ISkLpjFaDmg` | singleLineText |
| Phone | `fld0YZ7PpGuboFHze` | phoneNumber |
| Email | `fldFKOJZijdkfUMNt` | email |
| Lead Type | `fldYs3nYR03mimGPP` | singleSelect (Buying/Selling/Investing/Renting/General) |
| Source | `fldznIbFfCs8t53xb` | singleSelect |
| Status | `fldr7YVxlbUSFfood` | singleSelect |
| Assigned Agent | `fld52wU08n5CsdwXo` | singleSelect |
| Notes | `fldWSEVco1aNtOXYP` | multilineText |

### THG AI Log Field Map
| Field | ID | Type |
|-------|-----|------|
| Session ID | `fldsirUGL706YoFJ2` | singleLineText |
| Agent | `fldblo8NoiMZnowfh` | singleSelect (Scout/Compass/Beacon/Harbor) |
| User Input | `fldCXcuzFo9opnssg` | multilineText |
| Agent Output | `fldg3bTxpAwkKoXK3` | multilineText |
| Lead Created | `fldGZw3dlhvFGmi8W` | checkbox |
| Intent Detected | `fldj465Whsj5tLlZE` | singleSelect |
| Timestamp | `fldlQYZwlGbCYD1kl` | dateTime |

### THG Market Data Field Map
| Field | ID | Type |
|-------|-----|------|
| Date | `fldEiaYUpd9qVwwJo` | date |
| Median Price | `fld0ltS32x3BOAw35` | currency |
| Avg Days on Market | `fldUfnesrKv73Ambn` | number |
| Active Listings | `fldW1gWIN7VzpC1En` | number |
| Inventory Months | `fldK3LhsDn1dk7H1N` | number |
| 30-Yr Fixed Rate | `fldUXfVxt1E3FUSn0` | number |
| Fed Rate | `fldcjo4TD7LTNyyXA` | number |
| Closed Last Month | `fldM9SxlO4wFLdQjp` | number |

## Zapier Workflow Registry
| ID | Name | Trigger |
|----|------|---------|
| THG-WF-1 | New Lead from App | Airtable THG Leads new record |
| THG-WF-2 | Investor Lead Escalation | THG Leads type = Investor |
| THG-WF-3 | Social Approval to Buffer | Content Calendar Status = Approved |
| THG-WF-4 | Daily Market Data Refresh | Scheduled 6 AM ET daily |
| THG-WF-5 | AI Log Archive | New AI Log record |
| THG-WF-6 | Callback Request | Lead requests callback |

## THG AI Agents (4 client-facing)
| Agent | Role | Color | Specialty |
|-------|------|-------|-----------|
| Scout | Customer Service Rep | Gold | First contact, scheduling, general inquiries |
| Compass | Market Intelligence Analyst | Blue | Pricing, trends, inventory, investment analysis |
| Beacon | Listing Specialist | Green | Home valuations, listing strategy, marketing |
| Harbor | Transaction Coordinator | Purple | Contract-to-close, inspections, deadlines |

## Agent Fleet (40 agents across 8 divisions)
Divisions: EXC (Executive), SEN (Sentinel), OPS (Operations), INT (Intelligence),
MKT (Marketing), FIN (Finance), VEN (Ventures), TEC (Technology)

## Secrets (set via wrangler secret put or Cloudflare dashboard)
- `ANTHROPIC_API_KEY` — Claude API access
- `AIRTABLE_API_KEY` — Airtable REST API (used server-side only, never in client)
- `WORKER_AUTH_TOKEN` — Inter-service Bearer auth
- `SLACK_WEBHOOK_URL` — Slack notifications
- `RETELL_WEBHOOK_SECRET` — Webhook HMAC-SHA256 verification (MUST be used)
- `THG_ADMIN_PIN` — Admin dashboard access pin

## CI/CD
GitHub Actions on push to main: test → deploy all services to Cloudflare.
Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.

## Deployment Targets
| Service | Platform | Production URL |
|---------|----------|---------------|
| ck-api-gateway | CF Worker | `api.coastalkey-pm.com` |
| ck-command-center | CF Pages | `command.coastalkey-pm.com` |
| sentinel-webhook | CF Worker | `sentinel.coastalkey-pm.com` |
| thg-app | CF Pages | `thg-app.pages.dev` → `app.traceyhuntergroup.com` |

## Known Security Issues (Prioritized)
1. **CRITICAL**: sentinel-webhook does NOT validate Retell webhook signatures (function exists in validators.js but unused)
2. **HIGH**: CORS is `Access-Control-Allow-Origin: *` — must restrict to known domains
3. **HIGH**: `/v1/health?deep=true` exposes infrastructure without auth
4. **MEDIUM**: Public lead endpoint doesn't use email/phone validators that exist in validators.js
5. **MEDIUM**: Unsafe `JSON.parse()` without try-catch in pricing.js and agents.js
6. **MEDIUM**: Airtable table IDs hardcoded in source — should be env vars

## PR Review Checklist
- [ ] No hardcoded secrets or API keys
- [ ] All user input validated and sanitized
- [ ] Error boundaries around new UI sections
- [ ] Tests written for new functionality
- [ ] CORS not set to `*`
- [ ] Webhook signatures verified
- [ ] JSON.parse wrapped in try-catch
- [ ] Accessibility: ARIA labels on interactive elements
- [ ] Mobile-first: tested on 375px viewport
- [ ] Bundle size impact assessed (<100KB gzip target)
