# Projects Source Of Truth

Runtime portfolio data lives in `src/data/projects.ts`. This document mirrors key project facts for planning, copywriting, proposals, and portfolio updates.

## Automated Lead Intake & Estimating System

- Industry: Home Services
- Tools: n8n, WordPress, WPForms, GorillaDesk CRM, Google Sheets API, Google Maps geocoding, Twilio SMS, Gmail API, Elementor, jq
- Image: `/projects/lead-intake-estimating-system.png` (deliberately client-neutral filename — the
  public URL is visible to anyone, so it must not carry the client's initials)
- Working folder: this client's n8n lead project under `~/PROJECTS/` (`02-docs/` is the doc
  set). The folder name carries the client's initials, so it isn't written out here — this
  file is in a public repository.

Designed and built a single lead pipeline for a US-based home-services company, replacing scattered tools with five coordinated n8n workflows covering intake, estimating, notification, and override auditing.

### Client confidentiality

Keep the client anonymous ("US-based home-services company"). Per the project's own
`02-docs/15-sensitive-asset-handling.md`, raw n8n workflow exports must **not** be published
without a sanitization pass that strips credential IDs/names, account labels, webhook
identifiers, and environment-specific references. Never publish the client contact's name,
workbook/workflow IDs, or the client's pricing constants.

### Portfolio Summary

Multi-workflow lead pipeline unifying WordPress intake, CRM sync, estimate automation, and an auditable override trail.

### Architecture

WordPress + WPForms (3 intake paths) -> n8n normalization & field-contract validation -> Duplicate matching -> Google Maps geocoding + service-area rules -> GorillaDesk + Google Sheets CRM sync -> Rules-based estimate engine (manual-review fallback) -> Gmail + Twilio staff notification & acknowledgement loop -> Append-only override audit sync

### Workflow inventory

1. Website Contact Form — intake path
2. Quick Intake — intake path
3. Instant Estimate — rules-based estimate engine with manual-review routing
4. Internal Notification & Staff Acknowledgement — Gmail + Twilio with reminder loop
5. Estimate Override Audit — append-only audit trail, idempotent CRM note sync

### Key Capabilities

- Five coordinated n8n workflows behind one lead pipeline
- Three WordPress intake paths normalized to a shared field contract
- Duplicate matching before any CRM write
- Dual sync to GorillaDesk and a Google Sheets CRM with concise lead summaries
- Geocoding-driven service-area and configurable pricing rules
- Manual-review routing when pricing inputs are missing or ambiguous
- Append-only estimate override audit with idempotent CRM sync
- Staff SMS/email notifications with an acknowledgement reminder loop
- Consent gating, opt-out suppression, and Do-Not-Text handling for A2P SMS compliance

### Status honesty (important for proposals)

Source of truth (`02-docs/01-project-overview.md`) records overall release status as
**Not Ready** and workflows as **Partially Live / not production-verified**. Only the staff
notification + acknowledgement path is live-verified. Portfolio copy therefore claims
*capabilities delivered*, not measured business outcomes. Do not add metrics such as
"reduced intake time by X%" until controlled testing and client release approval produce
evidence.

## ASMR Video Generation & Publishing Pipeline

- Industry: Content Automation
- Tools: n8n, Google Vertex AI (Veo), OpenRouter, Google Cloud service account + JWT, YouTube
  Data API, Facebook Graph API
- Image: `/projects/asmr-video-pipeline.png` (the n8n canvas, cropped to the nodes and split
  into two rows; no project IDs or endpoints are legible in it)
- Where it lives: my own n8n instance, Personal workspace, workflow "Jazz - ASMR video creator"

Scheduled run → an LLM writes prompt, title and caption as structured JSON → a service-account
payload is signed into a JWT and exchanged for a Google access token → Veo renders a 9:16 clip
→ the workflow polls the long-running operation until done → branches on Google's safety
filter and on errors → base64 is converted to a video file → uploaded to YouTube and Facebook.

### Provenance (keep this accurate in public copy)

The workflow follows a published n8n blueprint that Jazzmin **has permission to use**. The
public entry therefore leads with what the system does and names the blueprint in one line at
the end, without apology. The design still is not hers: never write or let MinMin say she
designed or invented it, and if an interviewer asks, the honest answer — blueprint used with
permission, her cloud project, credentials, accounts and the work of making it run — is
already on the site.

### Security (unresolved)

The service-account identity is pasted into a **Code node** ("Secret Payload") inside the
workflow rather than stored as an n8n credential. That means the credential travels inside
every export of this workflow.

- Move it into an n8n credential, and have the JWT node read from there.
- Never paste or commit this workflow's JSON anywhere public; the export carries the service
  account, credential IDs, and the Google Cloud project name.
- If a full export containing `private_key` has ever left this machine, rotate that
  service-account key in Google Cloud and delete the old one.
