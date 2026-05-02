# Phase 5: Dominate

This directory contains Phase 5 dominance routes for the Coastal Key Property Management platform:

- `franchise.js` — White-label franchise system (8 FL territories)
- `marketplace.js` — API marketplace with KV usage metering
- `retell-tuning.js` — AI prompt tuning from call performance data
- `phase5-router.js` — Single-import dispatcher for all Phase 5 endpoints

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/franchise/config | White-label template (8 FL territories, 3 tiers) |
| POST | /v1/franchise/provision | Territory provisioning with overlap validation |
| GET | /v1/franchise/territories | Available territory listing |
| GET | /v1/marketplace/catalog | 6 API products |
| POST | /v1/marketplace/usage | KV-backed usage metering |
| GET | /v1/marketplace/usage/:apiKey | Per-key cost tracking |
| POST | /v1/retell/tune | AI prompt tuning from call data |
| GET | /v1/retell/performance | Booking rate, top objections, zone metrics |

## Wiring

In `ck-api-gateway/src/index.js`:

```javascript
import { dispatchPhase5 } from './routes/phase5-router.js';

// Inside fetch handler, after auth + rate-limit:
const phase5 = await dispatchPhase5(path, method, request, env, ctx, url);
if (phase5) return phase5;
```
