# Orchestrator Route Wiring

The orchestrator engine, schemas, routes handler, and dashboard are all deployed on this branch.

To activate the 12 orchestrator API endpoints, add these two changes to `ck-api-gateway/src/index.js`:

## 1. Add import (after ceo-directives import, line ~154)

```js
import { handleOrchestratorStatus, handleOrchestratorAgents, handleOrchestratorAgentDetail, handleOrchestratorAgentHealth, handleOrchestratorQueue, handleOrchestratorDispatch, handleOrchestratorTrigger, handleOrchestratorTriggers, handleOrchestratorGates, handleOrchestratorSchemas, handleOrchestratorValidate, handleOrchestratorTestScenario } from './routes/orchestrator.js';
```

## 2. Add route dispatch (before the 404 return, line ~795)

```js
// Master Orchestrator
if (path === '/v1/orchestrator/status' && method === 'GET') return handleOrchestratorStatus(request, env, ctx);
if (path === '/v1/orchestrator/agents' && method === 'GET') return handleOrchestratorAgents(request, env, ctx);
if (path.match(/^\/v1\/orchestrator\/agents\/[^/]+\/health$/) && method === 'POST') { const k = path.split('/')[4]; return handleOrchestratorAgentHealth(request, env, ctx, k); }
if (path.match(/^\/v1\/orchestrator\/agents\/[^/]+$/) && method === 'GET') { const k = path.split('/')[4]; return handleOrchestratorAgentDetail(request, env, ctx, k); }
if (path === '/v1/orchestrator/queue' && method === 'GET') return handleOrchestratorQueue(request, env, ctx);
if (path === '/v1/orchestrator/dispatch' && method === 'POST') return await handleOrchestratorDispatch(request, env, ctx);
if (path === '/v1/orchestrator/trigger' && method === 'POST') return await handleOrchestratorTrigger(request, env, ctx);
if (path === '/v1/orchestrator/triggers' && method === 'GET') return handleOrchestratorTriggers(request, env, ctx);
if (path === '/v1/orchestrator/gates' && method === 'GET') return handleOrchestratorGates(request, env, ctx);
if (path === '/v1/orchestrator/schemas' && method === 'GET') return handleOrchestratorSchemas(request, env, ctx);
if (path === '/v1/orchestrator/validate' && method === 'POST') return await handleOrchestratorValidate(request, env, ctx);
if (path === '/v1/orchestrator/test/scenario' && method === 'POST') return await handleOrchestratorTestScenario(request, env, ctx);
```

All 104 gateway tests pass with these changes applied.
