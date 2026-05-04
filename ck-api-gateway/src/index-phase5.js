/**
 * CK API Gateway — Phase 5 + Transformation Wrapper Entrypoint
 *
 * Composes the existing gateway (index.js) with:
 *   1. Phase 5 dispatcher (franchise, marketplace, retell-tuning)
 *   2. Transformation dispatcher (schedule, KPIs, risks, alerts)
 *
 * Activated by setting main = "src/index-phase5.js" in wrangler.toml.
 */

import { authenticate } from './middleware/auth.js';
import { dispatchPhase5 } from './routes/phase5-router.js';
import { dispatchTransformation } from './routes/transformation-router.js';
import gateway from './index.js';

const PUBLIC_PATHS = new Set(['/v1/health', '/v1/leads/public']);

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return gateway.fetch(request, env, ctx);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (PUBLIC_PATHS.has(path)) {
      return gateway.fetch(request, env, ctx);
    }

    const authError = authenticate(request, env);
    if (!authError) {
      const phase5 = await dispatchPhase5(path, method, request, env, ctx, url);
      if (phase5) return phase5;

      const transformation = await dispatchTransformation(path, method, request, env, ctx);
      if (transformation) return transformation;
    }

    return gateway.fetch(request, env, ctx);
  },
};
