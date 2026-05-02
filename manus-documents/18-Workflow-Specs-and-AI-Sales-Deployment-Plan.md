# [REDACTED-PLATFORM] Workflow Specs and AI Sales Deployment Plan

**Task ID:** `2chTsTvLWe9aCrQ7sjbM7a`  
**Status:** completed  
**Model:** manus-1.6-adaptive  
**Source:** https://manus.im/app/2chTsTvLWe9aCrQ7sjbM7a  
**Created:** 1774997816

---

## Conversation Content

**[USER]:** Produce the following documentation for Coastal Key Treasure Coast Asset Management. This is a research and writing task only. No external tool connections are needed.

SECTION 1: [REDACTED-PLATFORM] WORKFLOW BUILD SPECIFICATIONS
Produce detailed step-by-step [REDACTED-PLATFORM] build instructions for these 5 workflows. For each, specify the exact Trigger app/event, every Action step with app and action type, and field mappings.

WF-5 Video Brief to Production: Triggered when Airtable Video Production table status changes to Approved. Actions: assemble production brief, post to Slack, dispatch thumbnail brief.

WF-6 Podcast Publish: Triggered when Airtable Podcast Production table status changes to Approved. Actions: push show notes to Buffer for LinkedIn/Facebook, post teaser to Buffer for Instagram, alert Slack.

WF-7 AI Log Write: Triggered by webhook POST from Cloudflare Worker. Actions: create record in Airtable AI Log table with module tag, brief, output, model, timestamp.

WF-9 Storm Protocol: Triggered manually or by weather webhook. Actions: activate storm protocols, post emergency Slack alert, send SMS to property owners, create pre-storm tasks.

WF-10 Client Renewal: Triggered 30 days before contract renewal date in Airtable Clients table. Actions: send renewal email, create follow-up task, alert Slack.

SECTION 2: 40-AGENT RETELL AI SALES DEPLOYMENT PLAN
Deployment plan for 40 AI agents making cold calls via Retell AI (ElevenLabs voice) for a real estate team (Tracey Hunter Group, RE/MAX of Stuart, Florida Treasure Coast). Covers: agent configuration, script loading, call routing, daily dial targets per agent, ElevenLabs voice integration, Florida Do-Not-Call compliance, TCPA requirements, and recommended calling hours.

Format as a professional operations document with numbered steps and clear headers.

**[ASSISTANT]:** Understood. I will produce the full operations document for Coastal Key Treasure Coast Asset Management covering both sections: the 5 [REDACTED-PLATFORM] workflow build specifications and the 40-agent Retell AI sales deployment plan. Let me begin research and drafting now.

**[ASSISTANT]:** The Operations & Automation Document for Coastal Key Treasure Coast Asset Management is complete. Here is a summary of what was produced:

---

**Section 1 — [REDACTED-PLATFORM] Workflow Build Specifications** covers all five workflows in a structured table format, with every trigger, action step, app, event type, and field mapping specified:

- **WF-5 (Video Brief to Production):** Airtable "Approved Videos" view trigger → Formatter assembles brief → Slack posts to `#video-production` → Gmail dispatches thumbnail brief to design team.
- **WF-6 (Podcast Publish):** Airtable "Approved Podcasts" view trigger → Buffer queues show notes for LinkedIn/Facebook → Buffer queues teaser for Instagram → Slack alerts `#marketing-updates`.
- **WF-7 (AI Log Write):** Webhooks by [REDACTED-PLATFORM] catches POST from Cloudflare Worker → Airtable creates record in AI Log table with module tag, brief, output, model, and timestamp. Includes the required JSON payload schema.
- **WF-9 (Storm Protocol):** Manual Push or weather webhook trigger → Airtable logs activation → Slack broadcasts `@channel` emergency alert → Twilio sends SMS to property owners → Asana creates pre-storm checklist task.
- **WF-10 (Client Renewal):** Airtable "Upcoming Renewals – 30 Days" view trigger (using `DATETIME_DIFF` formula) → Gmail sends personalized renewal email → Asana creates follow-up task → Slack alerts `#client-success`.

---

**Section 2 — 40-Agent Retell AI Sales Deployment Plan** covers the full deployment in five numbered steps:

- **Step 1 (Agent Configuration):** 40 agents across 4–5 Retell AI voice personas, provisioned for 40+ concurrent calls, with local 772/561 area code phone numbers via Twilio.
- **Step 2 (Script Loading):** Retell-formatted prompt scripts with `{{dynamic variables}}`, branching logic, objection handling, and a knowledge base upload. Includes a sample real estate cold call script.
- **Step 3 (Call Routing & Targets):** 500 dials/agent/day = 20,000 fleet dials/day, with hot-transfer protocol to live agents and fallback calendar booking.
- **Step 4 (Compliance):** Full TCPA/FTSA compliance table covering Prior Express Written Consent, National and Florida DNC scrubbing (every 31 days), opt-out recognition, and caller identification — with FCC 2024 AI ruling noted.
- **Step 5 (Calling Hours):** Hard window of 8:00 AM–8:00 PM EST per Florida FTSA, with optimized sub-windows (8:30–11:00 AM and 4:00–7:00 PM as High priority) and Double Call feature enabled.

---

## Attached Files

- [Coastal_Key_Operations_Document.md](https://private-us-east-1.manuscdn.com/sessionFile/2chTsTvLWe9aCrQ7sjbM7a/sandbox/1vpruSzGTpSwybdCPwIuHK_1774998431744_na1fn_L2hvbWUvdWJ1bnR1L0NvYXN0YWxfS2V5X09wZXJhdGlvbnNfRG9jdW1lbnQ.md?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvMmNoVHNUdkxXZTlhQ3JRN3NqYk03YS9zYW5kYm94LzF2cHJ1U3pHVHBTd3liZENQd0l1SEtfMTc3NDk5ODQzMTc0NF9uYTFmbl9MMmh2YldVdmRXSjFiblIxTDBOdllYTjBZV3hmUzJWNVgwOXdaWEpoZEdsdmJuTmZSRzlqZFcxbGJuUS5tZCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=bfs4UrTw3kHh44bIW7uvZ7htHjVFvg9PjrJDCWf7pXlK0MAezOyhG5cBJyPudRbnvfIkCZh82K-0PPY-IzI0Hjt9o7RfaYmsnoGpW6JdTV9YFWKbkAqWjC5oMEHuHxiIVQVHikmrpKDuBpZf0P4MwbomXiUEa7~SCwj4JIAxXB7Q9ZUGLG5VI3aCe0ZJIodKajIQW6WDL~RTrPSuNNUarHHR1nbCQ47Gk-dApcB3wpcA4tuqY7XK2mNGxR8zb4PYbT0g~YyZTCou80MNvVCO4eVR-1NkX6T8c2RhZo9wilqISzfnbYJXbVIK7rC7Vi5-rbYozsb9uGSoBUyozDCkeQ__)
