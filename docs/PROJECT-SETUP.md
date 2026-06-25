# Project Setup Documentation

Complete setup guide for the AI Portfolio with chat, GHL integration, n8n automation, and client dashboards.

**Last Updated:** June 2026
**Owner:** Jazzmin Sicat-Cabizares
**Domain:** buildwithjazz.com

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Environment Variables](#environment-variables)
4. [Vercel Deployment](#vercel-deployment)
5. [Domain Setup](#domain-setup)
6. [AI Chat System](#ai-chat-system)
7. [GoHighLevel (GHL) Integration](#gohighlevel-ghl-integration)
8. [n8n Automation](#n8n-automation)
9. [Discord Notifications](#discord-notifications)
10. [Contract PDF System](#contract-pdf-system)
11. [Client Dashboard](#client-dashboard)
12. [Prep Sheet](#prep-sheet)
13. [Issues & Resolutions](#issues--resolutions)
14. [Maintenance Guide](#maintenance-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    buildwithjazz.com                      │
│                   (Vercel - Next.js)                      │
├─────────────────────────────────────────────────────────┤
│  /chat          → AI Chat (MiMo model)                   │
│  /dashboard     → Client Project Dashboard               │
│  /prep          → Lead Automation Prep Sheet             │
│  /api/chat      → streamText + 9 AI tools                │
│  /api/dashboard → GHL CRUD + auth                        │
│  /api/prep-intake → Form → GHL + WhatsApp + Discord      │
│  /api/log-conversation → GHL + Discord logging           │
│  /api/send-contract  → Email + PDF + GHL upload          │
└─────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│  GoHighLevel │  │  n8n     │  │   Discord    │
│  (CRM)       │  │ (Render) │  │  (Webhooks)  │
└─────────────┘  └──────────┘  └──────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 | App Router, API routes |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS v4 + shadcn/ui | UI components |
| AI | Vercel AI SDK v6 | Chat streaming |
| Model | MiMo v2.5-pro | Primary AI model |
| Fallback | Groq (llama-3.3-70b) | Backup model |
| CRM | GoHighLevel | Contact management |
| Automation | n8n (Render) | Workflow automation |
| Email | Resend | Transactional email |
| PDF | @react-pdf/renderer | Contract generation |
| Notifications | Discord Webhooks | Real-time alerts |

---

## Environment Variables

### Required

```env
# AI Models
MIMO_API_KEY=tp-...
MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/anthropic/v1
MIMO_TEXT_MODEL=mimo-v2.5-pro
GROQ_API_KEY=gsk_...

# GoHighLevel
GHL_LOCATION_ID=...
GHL_API_KEY=pit-...

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email
RESEND_API_KEY=re_...

# Dashboard Auth
DASHBOARD_ADMIN_KEY=your-secret-key
```

### Optional

```env
AI_MODEL=llama-3.3-70b-versatile
GITHUB_TOKEN=ghp_...
```

---

## Vercel Deployment

### Initial Setup

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project from GitHub
4. Vercel auto-detects Next.js
5. Add environment variables in Settings → Environment Variables

### Domains Configured

| Domain | Purpose |
|--------|---------|
| `buildwithjazz.com` | Main portfolio |
| `www.buildwithjazz.com` | www redirect |
| `clients.buildwithjazz.com` | Client portal |

### Important: DNS Configuration

The main domain `buildwithjazz.com` must point to Vercel's CNAME:
```
CNAME: cname.vercel-dns.com
```

**Issue:** `buildwithjazz.com` (non-www) redirects to `www.buildwithjazz.com` via Vercel's 308 redirect. This causes POST requests to lose their body.

**Fix:** Added redirect in `chat/page.tsx` to auto-redirect to `www.` version:
```typescript
if (host === "buildwithjazz.com") {
  window.location.replace(`https://www.buildwithjazz.com${window.location.pathname}`);
}
```

---

## Domain Setup

### clients.buildwithjazz.com (Client Portal)

1. Added domain in Vercel Dashboard → Settings → Domains
2. Added CNAME record in DNS:
   ```
   clients → cname.vercel-dns.com
   ```
3. Added rewrite in `next.config.ts`:
   ```typescript
   async rewrites() {
     return [
       {
         source: "/:email",
         has: [{ type: "host", value: "clients.buildwithjazz.com" }],
         destination: "/dashboard?email=:email",
       },
     ];
   },
   ```

**Result:**
- `clients.buildwithjazz.com` → Dashboard page
- `clients.buildwithjazz.com/sarah@test.com` → Dashboard with email pre-filled

---

## AI Chat System

### Provider Chain

```
MiMo (primary) → Groq (fallback) → Anthropic → OpenAI
```

### Model Configuration

```typescript
// src/lib/ai/provider.ts
if (process.env.MIMO_API_KEY) {
  return mimo("mimo-v2.5-pro");  // Primary
}
if (process.env.GROQ_API_KEY) {
  return groq("llama-3.3-70b-versatile");  // Fallback
}
```

### 9 AI Tools

| Tool | Purpose |
|------|---------|
| `getProjects` | Show project cards |
| `getSkills` | Show skills grid |
| `getResume` | Show experience |
| `getContact` | Show contact info |
| `getMe` | Show personal intro |
| `getFun` | Show hobbies/facts |
| `getAvailability` | Show availability |
| `generateContract` | Generate contract PDF |
| `sharePrepSheet` | Generate prep sheet link |
| `analyzeBusiness` | Business automation analysis |

### Specialist Personas

The AI switches between 3 personas based on the conversation:

1. **AI Automation Engineer** (default) — portfolio, skills, projects
2. **Senior GHL Specialist** — CRM, workflows, pipelines
3. **Business Automation Consultant** — process optimization, n8n

### Dynamic Pricing

Contract rates range from $10-15/hr based on:
- **Complexity:** Simple ($10), Moderate ($12), Complex ($15)
- **Client type:** Startup (-$2), Small Business (base), Enterprise (+$3)
- **Buffer:** 24 hours added to all estimates

---

## GoHighLevel (GHL) Integration

### API Configuration

```
Base URL: https://services.leadconnectorhq.com
Version: 2021-07-28
Auth: Bearer {GHL_API_KEY}
```

### Contact Creation

When a conversation is logged:
1. Extract email, name, company from conversation
2. Search for existing contact by email
3. Create new if not found (tag: `portfolio-chat-lead`)
4. Add conversation note
5. Send Discord notification

### Tags Used

| Tag | When Added |
|-----|------------|
| `portfolio-chat-lead` | Chat conversation logged |
| `proposal-sent` | Contract PDF uploaded |
| `downpayment-paid` | Payment received |
| `in-progress` | Project started |
| `done` | Project completed |
| `final-payment-paid` | Final payment received |
| `completed` | Project closed |
| `prep-sheet` | Prep sheet submitted |
| `prep-sheet-submitted` | Prep sheet answers saved |

### Pipeline: Portfolio Leads

```
1. New Lead
2. Proposal Sent
3. Downpayment Paid
4. In Progress
5. Completed
6. Final Payment
```

### Custom Fields (for contract data)

| Field | ID |
|-------|----|
| Contract PDF URL | `5KhQSkHhEvXKXJEx3NHZ` |
| Contract Client Name | `XgvQOEZBcbBnXFFi4lx5` |
| Contract Total Cost | `VZWF2XTXvbK9R7vavt8S` |

---

## n8n Automation

### Migration: Localhost → Render

**Problem:** n8n was running on `localhost:5678`, which is not accessible from external services (GHL webhooks, UptimeRobot).

**Solution:** Deployed n8n to Render.com (free tier).

### Render Setup

1. Created GitHub repo with Dockerfile:
   ```dockerfile
   FROM n8nio/n8n:latest
   ENV N8N_PORT=5678
   ENV N8N_PROTOCOL=https
   ENV N8N_SECURE_COOKIE=false
   EXPOSE 5678
   ```
2. Deployed on Render as Web Service (Free tier)
3. Set environment variables in Render dashboard

### Render Free Tier Limitation

**Problem:** Render spins down after 15 minutes of inactivity. Webhooks fail when the service is sleeping.

**Solution:** Used **UptimeRobot** (not cron-job.org) to ping the service every 5 minutes.

**Why UptimeRobot over cron-job.org:**
- Free tier: 50 monitors (only need 1)
- 5-minute intervals (cron-job.org was slower)
- Dashboard with uptime history
- Email/SMS alerts if service goes down
- More reliable and well-known

**UptimeRobot Setup:**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Add Monitor → HTTP(s)
4. URL: `https://eightn-render.onrender.com`
5. Interval: 5 minutes

### Active Workflows

| Workflow | Webhook URL | Trigger |
|----------|-------------|---------|
| Contract Sent | `/webhook/contract-sent` | Tag: `proposal-sent` |
| Downpayment Paid | `/webhook/downpayment-paid` | Tag: `downpayment-paid` |
| Project Done | `/webhook/project-done` | Tag: `done` |
| Final Payment | `/webhook/final-payment-paid` | Tag: `final-payment-paid` |

### Issue: GHL Webhook Format

**Problem:** GHL sends webhooks as key-value pairs (form-urlencoded), not JSON.

**Fix:** n8n workflows use Code nodes to parse the data:
```javascript
const body = $input.first().json.body;
const payload = {
  embeds: [{
    title: "📄 Contract Sent",
    fields: [
      { name: "Client", value: body.firstName + " " + body.lastName, inline: true }
    ]
  }]
};
return [{ json: payload }];
```

### Issue: n8n Expression Syntax Error

**Problem:** Using `inline:true` (without quotes) in JSON expressions caused "invalid syntax" errors.

**Fix:** Used Code nodes instead of inline expressions for complex JSON payloads.

---

## Discord Notifications

### Webhook URL

```
https://discord.com/api/webhooks/1515600055778803832/IwC-TVb4Aytg4Mo_CdQDo5zb8JUxcwnxNxqTN7bIaASDFO4U6WGQcjdg6jToo7sSMu55
```

### What Gets Sent

| Event | Fields |
|-------|--------|
| Chat conversation | Client name, email, message count, topic, last message |
| Contract sent | Client name, email, total cost |
| Prep sheet submitted | Client name, email, dashboard link |

### Issue: Discord Character Limit

**Problem:** Full conversation transcripts exceeded Discord's embed character limit (4096 chars).

**Fix:** Changed from full transcript to summary only:
- Client name (extracted from conversation)
- Email (extracted)
- Message count
- Topic (auto-detected)
- Last user message (truncated to 200 chars)

---

## Contract PDF System

### Generation

- Uses `@react-pdf/renderer` for client-side PDF generation
- **Issue:** SSR hydration errors when importing at top level
- **Fix:** Dynamic import inside click handlers:
  ```typescript
  const handleDownload = async () => {
    const { generateContractPDF } = await import("./ContractPDF");
    const blob = await generateContractPDF(contract);
  };
  ```

### Distribution

When "Send to Client" is clicked:
1. PDF generated client-side
2. Sent to `/api/send-contract` as base64
3. API sends emails via Resend (owner + client)
4. Uploads PDF to GHL Media Library
5. Adds note to GHL contact
6. Sends Discord notification

### Issue: Resend Free Tier Limitation

**Problem:** Resend free tier only allows sending to your own email address.

**Solution:** Emails go to owner (`jazzmincabizares@gmail.com`). To send to clients, verify a domain at [resend.com/domains](https://resend.com/domains).

### Issue: Blank PDF

**Problem:** Contract PDF showed blank content.

**Fix:** 
1. Moved `ContractData` interface before the lazy load function
2. Used dynamic import inside click handlers instead of top-level import
3. Updated `ContractPDF.tsx` to include `clientEmail` and `pricingFactors`

---

## Client Dashboard

### URL Pattern

```
https://clients.buildwithjazz.com/dashboard?email=client@email.com
```

### Features

- Payment status (downpayment + final)
- Deliverables checklist with progress bar
- Real-time updates
- Admin mode with password

### Admin Access

```
https://clients.buildwithjazz.com/dashboard?email=...&admin=jazz-admin-2026
```

### Issue: Client-Side Admin Auth

**Problem:** Admin key was exposed in client bundle via `NEXT_PUBLIC_DASHBOARD_ADMIN_KEY`.

**Fix:** Moved to server-side verification:
1. Created `/api/dashboard/verify` endpoint
2. Dashboard page calls verify endpoint with the key
3. Server checks against `DASHBOARD_ADMIN_KEY` env var
4. Removed `NEXT_PUBLIC_DASHBOARD_ADMIN_KEY` from Vercel

### Issue: Dashboard API No Auth

**Problem:** PUT endpoint had no authentication — anyone could modify deliverables.

**Fix:** Added `x-admin-key` header validation:
```typescript
const adminKey = req.headers.get("x-admin-key");
if (adminKey !== process.env.DASHBOARD_ADMIN_KEY) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## Prep Sheet

### URL Pattern

```
https://www.buildwithjazz.com/prep?client=larry-bmpc&name=Larry&email=larry@example.com
```

### Features

- 17 questions across 2 sections
- Progress gauge ("Foundation poured")
- Email and WhatsApp fields
- Sends dashboard link via WhatsApp
- Creates GHL contact with answers
- Discord notification

### Flow

```
Client fills form
    ↓
API creates/updates GHL contact
    ↓
Adds note with all answers
    ↓
Tags: prep-sheet, prep-sheet-submitted
    ↓
Sends WhatsApp with dashboard link
    ↓
Sends Discord notification
    ↓
Shows success screen with dashboard link
```

---

## Issues & Resolutions

### 1. MiMo Model Not Found

**Problem:** `mimo-vl-7b` model returned "Not supported model" error.

**Fix:** Changed to `mimo-v2.5-pro` and updated base URL to include `/v1`:
```
MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/anthropic/v1
MIMO_TEXT_MODEL=mimo-v2.5-pro
```

### 2. Contract Card Not Rendering

**Problem:** Contract component showed text instead of the card with download buttons.

**Root cause:** `@react-pdf/renderer` caused SSR hydration errors when imported at top level.

**Fix:** Dynamic import inside click handlers.

### 3. GHL Contacts Not Created

**Problem:** Conversation logging returned `ok: true` but no contacts appeared in GHL.

**Root cause:** Name extraction regex matched common verbs ("looking", "trying") as names.

**Fix:** Added verb filter and stricter name matching:
```typescript
const NOT_NAMES = new Set(["looking", "trying", "interested", ...]);
const nameMatch = allText.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+)/i);
if (nameMatch && !NOT_NAMES.has(nameMatch[1].toLowerCase())) {
  firstName = nameMatch[1];
}
```

### 4. Discord Messages Cut Off

**Problem:** Discord embeds exceeded character limits.

**Fix:** Changed from full transcript to summary (name, email, count, topic, last message).

### 5. POST Body Lost on Redirect

**Problem:** `buildwithjazz.com` redirects to `www.buildwithjazz.com` via 308, losing POST body.

**Fix:** Auto-redirect chat page to www version on load.

### 6. Vercel Serverless Timeout

**Problem:** `generateContract` tool's nested `generateText` call exceeded 30s `maxDuration`.

**Fix:** Added `await` to all async operations in API routes.

### 7. Admin Key Exposed

**Problem:** `NEXT_PUBLIC_DASHBOARD_ADMIN_KEY` was in client bundle.

**Fix:** Server-side verification via `/api/dashboard/verify` endpoint.

### 8. n8n Webhooks Failed When Sleeping

**Problem:** Render free tier spins down after 15 min, webhooks fail.

**Fix:** UptimeRobot pings every 5 minutes to keep service awake.

---

## Maintenance Guide

### Regular Tasks

| Task | Frequency | How |
|------|-----------|-----|
| Check Vercel deployments | Weekly | vercel.com dashboard |
| Check n8n executions | Weekly | eightn-render.onrender.com |
| Check GHL contacts | Weekly | GHL dashboard |
| Check Discord notifications | Daily | Discord channel |
| Update skills/projects | As needed | Edit `src/data/*.ts` |
| Add certificates | As needed | Drop PDF in `public/certs/`, update `resume.ts` |

### Adding a New AI Tool

1. Define tool in `src/lib/ai/tools.ts`
2. Create renderer in `src/components/tools/`
3. Register in `src/components/chat/tool-renderer.tsx`
4. Add routing instruction in `src/lib/ai/system-prompt.ts`
5. Build, push, deploy

### Adding a New Certificate

1. Drop PDF in `public/certs/`
2. Add entry to `src/data/resume.ts`:
   ```typescript
   { name: "...", issuer: "...", date: "2026", url: "/certs/filename.pdf" }
   ```
3. Build, push, deploy

### Emergency Contacts

| Service | URL | Purpose |
|---------|-----|---------|
| Vercel | vercel.com | Hosting |
| GHL | app.gohighlevel.com | CRM |
| Render | render.com | n8n hosting |
| UptimeRobot | uptimerobot.com | Uptime monitoring |
| Discord | discord.com | Notifications |
| Resend | resend.com | Email |

---

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── chat/page.tsx         # Chat interface
│   ├── dashboard/page.tsx    # Client dashboard
│   ├── prep/page.tsx         # Prep sheet form
│   └── api/
│       ├── chat/route.ts     # AI chat endpoint
│       ├── dashboard/        # Dashboard CRUD + auth
│       ├── prep-intake/      # Prep sheet → GHL + WhatsApp
│       ├── log-conversation/ # GHL + Discord logging
│       └── send-contract/    # Email + PDF + GHL upload
├── components/
│   ├── chat/                 # Chat UI
│   ├── dashboard/            # Dashboard UI
│   ├── tools/                # AI tool renderers
│   └── ui/                   # shadcn primitives
├── data/                     # Static data files
├── lib/
│   ├── ai/                   # Provider, tools, system prompt
│   └── logging/              # GHL, Discord loggers
└── types.ts                  # Shared types
```

---

*Generated by BuildWithJazz.com — AI Automation Engineer*
