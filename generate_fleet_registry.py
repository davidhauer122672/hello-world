#!/usr/bin/env python3
"""
Coastal Key Enterprise — AI Agent Fleet Registry
Generates Excel report from all agent definition files.
"""

import json
import re
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BASE = '/home/user/hello-world'

def extract_agents_from_js(filepath):
    """Parse JS agent array definitions and extract agent objects."""
    with open(filepath, 'r') as f:
        content = f.read()

    agents = []
    # Match each object literal in the array
    pattern = r'\{[^{}]*?id:\s*[\'"]([^"\']+)[\'"][^{}]*?\}'

    for match in re.finditer(pattern, content, re.DOTALL):
        block = match.group(0)
        agent = {}

        # Extract fields
        for field in ['id', 'name', 'role', 'description', 'division', 'tier', 'status', 'squad']:
            m = re.search(rf"{field}:\s*['\"]([^'\"]*)['\"]", block)
            if m:
                agent[field] = m.group(1)

        # Extract triggers array
        triggers_m = re.search(r"triggers:\s*\[([^\]]*)\]", block)
        if triggers_m:
            triggers = re.findall(r"'([^']*)'", triggers_m.group(1))
            agent['triggers'] = ', '.join(triggers)

        # Extract outputs array
        outputs_m = re.search(r"outputs:\s*\[([^\]]*)\]", block)
        if outputs_m:
            outputs = re.findall(r"'([^']*)'", outputs_m.group(1))
            agent['outputs'] = ', '.join(outputs)

        # Extract kpis array
        kpis_m = re.search(r"kpis:\s*\[([^\]]*)\]", block)
        if kpis_m:
            kpis = re.findall(r"'([^']*)'", kpis_m.group(1))
            agent['kpis'] = ', '.join(kpis)

        # Extract severity for intel officers
        sev_m = re.search(r"severity:\s*['\"]([^'\"]*)['\"]", block)
        if sev_m:
            agent['severity'] = sev_m.group(1)

        if agent.get('id'):
            agents.append(agent)

    return agents

def extract_campaign_agents(filepath):
    """Extract TH Sentinel campaign agents from JSON config."""
    with open(filepath, 'r') as f:
        config = json.load(f)

    agents = []
    for a in config.get('agents', {}).get('agent_roster', []):
        agents.append({
            'id': a['id'],
            'name': a['name'],
            'role': 'Retell AI Voice Sales Agent',
            'description': f"TH Sentinel outbound sales agent. Engages homeowners in 2-3 min conversations, qualifies leads, transfers to Tracey Hunter.",
            'division': 'TH-SEN',
            'tier': 'retell',
            'status': a.get('status', 'active'),
            'squad': 'TH Sentinel Campaign',
            'triggers': 'Outbound call, inbound callback',
            'outputs': 'Lead qualification, call transfer, DNC flag',
            'kpis': 'Connection rate, qualification rate, transfer rate',
        })
    return agents

# Division metadata for supervisor mapping
DIVISION_META = {
    'EXC': {'full_name': 'Executive', 'supervisor': 'CEO / Board of Directors', 'color': '6366F1'},
    'SEN': {'full_name': 'Sentinel Sales', 'supervisor': 'VP of Sales (EXC-002 Nexus Command)', 'color': 'EF4444'},
    'OPS': {'full_name': 'Operations', 'supervisor': 'COO (EXC-001 Strategos Prime)', 'color': 'F59E0B'},
    'INT': {'full_name': 'Intelligence', 'supervisor': 'Chief Intelligence Officer (EXC-003 Horizon Scanner)', 'color': '10B981'},
    'MKT': {'full_name': 'Marketing', 'supervisor': 'CMO (EXC-017 Brand Guardian)', 'color': '8B5CF6'},
    'FIN': {'full_name': 'Finance', 'supervisor': 'CFO (EXC-004 Capital Architect)', 'color': '06B6D4'},
    'VEN': {'full_name': 'Vendor Management', 'supervisor': 'VP of Vendor Relations (EXC-006 Partnership Forge)', 'color': 'F97316'},
    'TEC': {'full_name': 'Technology', 'supervisor': 'CTO (EXC-012 Innovation Catalyst)', 'color': '64748B'},
    'WEB': {'full_name': 'Web Development', 'supervisor': 'CTO (EXC-012 Innovation Catalyst)', 'color': '0EA5E9'},
    'IO':  {'full_name': 'Intelligence Officers', 'supervisor': 'Chief Intelligence Officer (EXC-003 Horizon Scanner)', 'color': '059669'},
    'EMAIL': {'full_name': 'Email AI Operations', 'supervisor': 'CMO (EXC-017 Brand Guardian)', 'color': 'D946EF'},
    'TH-SEN': {'full_name': 'TH Sentinel Campaign', 'supervisor': 'Campaign Director (SEN-001)', 'color': 'DC2626'},
}

# Gender assignment based on agent naming convention
# AI agents don't have gender, but user requests M/F designation
# Campaign agents have female names (per voice_profile config)
# Core agents: assign based on name character
def assign_gender(agent):
    div = agent.get('division', '')
    name = agent.get('name', '')

    # TH Sentinel campaign agents are all female voice profile
    if div == 'TH-SEN':
        return 'F'

    # For AI agents, assign based on name characteristics
    female_indicators = ['Muse', 'Weaver', 'Siren', 'Empress', 'Maiden', 'Athena', 'Muse', 'Flora', 'Stella',
                         'Luna', 'Aurora', 'Iris', 'Pearl', 'Sage', 'Harmony', 'Grace', 'Seraph']
    male_indicators = ['Prime', 'Command', 'Sentinel', 'Guard', 'Forge', 'Shield', 'Titan', 'Hawk', 'Vanguard',
                       'Commander', 'Marshal', 'Knight', 'Baron', 'Duke', 'Rex', 'Magnus']

    for ind in female_indicators:
        if ind.lower() in name.lower():
            return 'F'
    for ind in male_indicators:
        if ind.lower() in name.lower():
            return 'M'

    # Alternate based on agent number
    num_match = re.search(r'(\d+)', agent.get('id', '0'))
    if num_match:
        return 'M' if int(num_match.group(1)) % 2 == 1 else 'F'
    return 'M'

def build_excel(all_agents, output_path):
    wb = Workbook()
    ws = wb.active
    ws.title = 'Agent Fleet Registry'

    # ── Headers ──
    headers = [
        'Agent ID', 'Name', 'M/F', 'Title', 'Division', 'Division Code',
        'Supervisor', 'Job Description', 'Platform', 'Tier',
        'Live Status', 'Squad/Unit', 'Primary Triggers', 'Key Outputs',
        'KPIs', 'Severity', 'Enterprise Notes'
    ]

    # Styles
    header_font = Font(name='Calibri', bold=True, color='FFFFFF', size=11)
    header_fill = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid')
    header_align = Alignment(horizontal='center', vertical='center', wrap_text=True)
    thin_border = Border(
        left=Side(style='thin', color='D1D5DB'),
        right=Side(style='thin', color='D1D5DB'),
        top=Side(style='thin', color='D1D5DB'),
        bottom=Side(style='thin', color='D1D5DB'),
    )

    status_colors = {
        'active': PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid'),
        'standby': PatternFill(start_color='FEF9C3', end_color='FEF9C3', fill_type='solid'),
        'training': PatternFill(start_color='DBEAFE', end_color='DBEAFE', fill_type='solid'),
        'maintenance': PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid'),
    }

    # Write headers
    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_align
        cell.border = thin_border

    # Freeze top row
    ws.freeze_panes = 'A2'

    # Auto-filter
    ws.auto_filter.ref = f'A1:{get_column_letter(len(headers))}1'

    # Write agents
    for row_idx, agent in enumerate(all_agents, 2):
        div_code = agent.get('division', 'N/A')
        meta = DIVISION_META.get(div_code, {'full_name': div_code, 'supervisor': 'N/A', 'color': '94A3B8'})

        # Determine platform
        if div_code == 'TH-SEN':
            platform = 'Retell AI'
        elif div_code in ('IO', 'EMAIL'):
            platform = 'Claude API (Specialized)'
        else:
            platform = 'Claude API'

        gender = assign_gender(agent)
        status = agent.get('status', 'active').capitalize()

        # Enterprise notes
        notes = []
        if agent.get('tier') == 'advanced':
            notes.append('Advanced model tier (Claude Opus)')
        if agent.get('severity') == 'critical':
            notes.append('CRITICAL severity monitor')
        if agent.get('severity') == 'high':
            notes.append('HIGH severity monitor')
        if status.lower() == 'standby':
            notes.append('On standby — activate on demand')
        if div_code == 'TH-SEN':
            notes.append('External platform agent (Retell AI)')

        values = [
            agent.get('id', ''),
            agent.get('name', ''),
            gender,
            agent.get('role', ''),
            meta['full_name'],
            div_code,
            meta['supervisor'],
            agent.get('description', ''),
            platform,
            (agent.get('tier', 'standard')).capitalize(),
            status,
            agent.get('squad', '—'),
            agent.get('triggers', '—'),
            agent.get('outputs', '—'),
            agent.get('kpis', '—'),
            (agent.get('severity', '—')).capitalize() if agent.get('severity') else '—',
            '; '.join(notes) if notes else '—',
        ]

        for col, val in enumerate(values, 1):
            cell = ws.cell(row=row_idx, column=col, value=val)
            cell.font = Font(name='Calibri', size=10)
            cell.alignment = Alignment(vertical='center', wrap_text=True)
            cell.border = thin_border

            # Status color coding
            if col == 11:  # Live Status column
                fill = status_colors.get(status.lower())
                if fill:
                    cell.fill = fill
                    cell.font = Font(name='Calibri', size=10, bold=True)

            # Division color stripe (left border)
            if col == 1:
                div_color = meta.get('color', '94A3B8')
                cell.fill = PatternFill(start_color=div_color, end_color=div_color, fill_type='solid')
                cell.font = Font(name='Calibri', size=10, bold=True, color='FFFFFF')

    # Column widths
    widths = [16, 22, 5, 35, 20, 10, 40, 60, 18, 12, 12, 18, 35, 35, 30, 12, 40]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

    # ── Summary Sheet ──
    ws2 = wb.create_sheet('Division Summary')

    # Count by division
    div_counts = {}
    status_counts = {'Active': 0, 'Standby': 0, 'Training': 0, 'Maintenance': 0}
    tier_counts = {}
    for a in all_agents:
        d = a.get('division', 'N/A')
        div_counts[d] = div_counts.get(d, 0) + 1
        s = a.get('status', 'active').capitalize()
        if s in status_counts:
            status_counts[s] += 1
        t = a.get('tier', 'standard').capitalize()
        tier_counts[t] = tier_counts.get(t, 0) + 1

    # Write summary
    ws2.cell(row=1, column=1, value='COASTAL KEY ENTERPRISE — AI FLEET SUMMARY').font = Font(name='Calibri', bold=True, size=16, color='0F172A')
    ws2.merge_cells('A1:F1')
    ws2.cell(row=2, column=1, value=f'Generated: April 2, 2026 | Total Agents: {len(all_agents)}').font = Font(name='Calibri', size=11, color='64748B')
    ws2.merge_cells('A2:F2')

    row = 4
    for h_col, h_val in enumerate(['Division', 'Code', 'Agents', 'Supervisor', 'Platform', 'Status'], 1):
        cell = ws2.cell(row=row, column=h_col, value=h_val)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_align
        cell.border = thin_border

    row = 5
    for div_code in ['EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB', 'IO', 'EMAIL', 'TH-SEN']:
        meta = DIVISION_META.get(div_code, {})
        count = div_counts.get(div_code, 0)
        if count == 0:
            continue
        vals = [
            meta.get('full_name', div_code),
            div_code,
            count,
            meta.get('supervisor', 'N/A'),
            'Retell AI' if div_code == 'TH-SEN' else 'Claude API',
            'Operational',
        ]
        for c, v in enumerate(vals, 1):
            cell = ws2.cell(row=row, column=c, value=v)
            cell.font = Font(name='Calibri', size=10)
            cell.border = thin_border
            cell.alignment = Alignment(vertical='center')
        row += 1

    # Totals
    ws2.cell(row=row, column=1, value='TOTAL').font = Font(name='Calibri', bold=True, size=11)
    ws2.cell(row=row, column=3, value=len(all_agents)).font = Font(name='Calibri', bold=True, size=11)

    # Status breakdown
    row += 2
    ws2.cell(row=row, column=1, value='STATUS BREAKDOWN').font = Font(name='Calibri', bold=True, size=12)
    row += 1
    for status, count in status_counts.items():
        ws2.cell(row=row, column=1, value=status).font = Font(name='Calibri', size=10)
        ws2.cell(row=row, column=2, value=count).font = Font(name='Calibri', size=10)
        row += 1

    # Tier breakdown
    row += 1
    ws2.cell(row=row, column=1, value='TIER BREAKDOWN').font = Font(name='Calibri', bold=True, size=12)
    row += 1
    for tier, count in sorted(tier_counts.items()):
        ws2.cell(row=row, column=1, value=tier).font = Font(name='Calibri', size=10)
        ws2.cell(row=row, column=2, value=count).font = Font(name='Calibri', size=10)
        row += 1

    ws2.column_dimensions['A'].width = 25
    ws2.column_dimensions['B'].width = 10
    ws2.column_dimensions['C'].width = 10
    ws2.column_dimensions['D'].width = 45
    ws2.column_dimensions['E'].width = 18
    ws2.column_dimensions['F'].width = 14

    wb.save(output_path)
    return len(all_agents)

# ── Main ──
if __name__ == '__main__':
    all_agents = []

    # Core divisions
    agent_files = [
        'ck-api-gateway/src/agents/agents-exc.js',
        'ck-api-gateway/src/agents/agents-sen.js',
        'ck-api-gateway/src/agents/agents-ops.js',
        'ck-api-gateway/src/agents/agents-int.js',
        'ck-api-gateway/src/agents/agents-mkt.js',
        'ck-api-gateway/src/agents/agents-fin.js',
        'ck-api-gateway/src/agents/agents-ven.js',
        'ck-api-gateway/src/agents/agents-tec.js',
        'ck-api-gateway/src/agents/agents-web.js',
    ]

    for f in agent_files:
        filepath = os.path.join(BASE, f)
        agents = extract_agents_from_js(filepath)
        print(f"  {f}: {len(agents)} agents")
        all_agents.extend(agents)

    # Intelligence Officers
    io_path = os.path.join(BASE, 'ck-api-gateway/src/routes/intelligence-officers.js')
    io_agents = extract_agents_from_js(io_path)
    # Fix division for IO agents
    for a in io_agents:
        if not a.get('division') or a['division'] == 'INT':
            a['division'] = 'IO'
    print(f"  intelligence-officers.js: {len(io_agents)} officers")
    all_agents.extend(io_agents)

    # Email agents
    email_path = os.path.join(BASE, 'ck-api-gateway/src/routes/email-agents.js')
    email_agents = extract_agents_from_js(email_path)
    for a in email_agents:
        a['division'] = 'EMAIL'
    print(f"  email-agents.js: {len(email_agents)} agents")
    all_agents.extend(email_agents)

    # TH Sentinel Campaign agents
    campaign_path = os.path.join(BASE, 'th-sentinel-campaign/campaign-config.json')
    campaign_agents = extract_campaign_agents(campaign_path)
    print(f"  campaign-config.json: {len(campaign_agents)} agents")
    all_agents.extend(campaign_agents)

    print(f"\nTotal agents: {len(all_agents)}")

    output = os.path.join(BASE, 'CK_Enterprise_AI_Fleet_Registry.xlsx')
    count = build_excel(all_agents, output)
    print(f"Excel generated: {output} ({count} agents)")
