#!/usr/bin/env python3
"""Patch index.js to wire ITAM KPI routes. Run from repo root: python3 patch-itam.py"""
import os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
f = 'ck-api-gateway/src/index.js'
c = open(f).read()
if 'itam-kpi' in c:
    print('ITAM already wired. Nothing to do.')
    sys.exit(0)

# Add import
old_imp = "import { handleAvatarDashboard, handleAvatarGenerate, handleAvatarStatus } from './routes/banana-avatar.js';"
new_imp = old_imp + "\nimport { handleITAMDashboard, handleITAMKpis, handleITAMCategory, handleITAMScore, handleITAMTco, handleITAMHealth, handleITAMStrategic } from './routes/itam-kpi.js';"
if old_imp not in c:
    print('ERROR: Could not find banana-avatar import line.')
    sys.exit(1)
c = c.replace(old_imp, new_imp)

# Add routes
old_route = '      // ── Work Generator Orchestrator ──'
new_route = """      // ── ITAM KPI Engine ──
      if (path === '/v1/itam/dashboard' && method === 'GET') {
        return handleITAMDashboard();
      }
      if (path === '/v1/itam/kpis' && method === 'GET') {
        return handleITAMKpis();
      }
      if (path.startsWith('/v1/itam/kpis/') && method === 'GET') {
        const category = path.split('/v1/itam/kpis/')[1];
        return handleITAMCategory(category);
      }
      if (path === '/v1/itam/score' && method === 'POST') {
        const body = await request.json();
        return handleITAMScore(body);
      }
      if (path === '/v1/itam/tco' && method === 'POST') {
        const body = await request.json();
        return handleITAMTco(body);
      }
      if (path === '/v1/itam/health' && method === 'GET') {
        return handleITAMHealth();
      }
      if (path === '/v1/itam/strategic' && method === 'GET') {
        return handleITAMStrategic();
      }

      // ── Work Generator Orchestrator ──"""
if old_route not in c:
    print('ERROR: Could not find Work Generator route marker.')
    sys.exit(1)
c = c.replace(old_route, new_route)
open(f, 'w').write(c)
print(f'Patched {f} — ITAM import + 7 route handlers added.')
print('Run: git add -A && git commit -m "Wire ITAM KPI routes into gateway" && git push origin main')
