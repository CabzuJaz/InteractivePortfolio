# Manual Actions Checklist

These actions must be done by the project owner (Jazzmin) — they involve rotating live credentials and dashboard configuration that cannot be done from the repo.

---

## Priority 1: Rotate Leaked Credentials

The following secrets were committed to git history in `docs/PROJECT-SETUP.md` and must be rotated:

### 1.1 Discord Webhook URL

- [ ] Go to **Discord** → Your server → `#portfolio-leads` channel
- [ ] **⚙️** → Integrations → Webhooks → Select the existing webhook
- [ ] Click **Delete Webhook**
- [ ] Click **New Webhook** → Name: "Portfolio Bot"
- [ ] Copy the new webhook URL
- [ ] Update in **Vercel**: Settings → Environment Variables → `DISCORD_WEBHOOK_URL`
- [ ] Update in **Render** (n8n): Environment → `DISCORD_WEBHOOK_URL`
- [ ] Update in local `.env`
- [ ] Redeploy on Vercel

### 1.2 Dashboard Admin Key

- [ ] Generate a new key: `openssl rand -hex 32`
- [ ] Update in **Vercel**: Settings → Environment Variables → `DASHBOARD_ADMIN_KEY`
- [ ] Update in local `.env`
- [ ] Redeploy on Vercel
- [ ] Test: visit `clients.buildwithjazz.com/dashboard?email=...&admin=<new-key>`

### 1.3 GHL API Key (recommended)

- [ ] Go to **GHL** → Settings → API Keys
- [ ] Create a new API key
- [ ] Delete the old key
- [ ] Update in **Vercel**: `GHL_API_KEY`
- [ ] Update in local `.env`
- [ ] Redeploy on Vercel

### 1.4 MiMo API Key (recommended)

- [ ] Regenerate key at MiMo platform
- [ ] Update in **Vercel**: `MIMO_API_KEY`
- [ ] Update in local `.env`
- [ ] Redeploy on Vercel

### 1.5 Groq API Key (recommended)

- [ ] Go to **console.groq.com** → API Keys
- [ ] Create new key, delete old
- [ ] Update in **Vercel**: `GROQ_API_KEY`
- [ ] Update in local `.env`
- [ ] Redeploy on Vercel

---

## Priority 2: Set Up External Postgres for n8n

Render's free tier has ephemeral storage — n8n workflows are lost on every restart.

### 2.1 Create Free Postgres (Supabase)

- [ ] Go to **supabase.com** → Sign up (free)
- [ ] Create a new project → name: `n8n-production`
- [ ] Set a strong database password (save it)
- [ ] Go to **Project Settings** → **Database** → **Connection string**
- [ ] Copy the **URI** format connection string
- [ ] Note: host (`db.<ref>.supabase.co`), database (`postgres`), user (`postgres`), password

### 2.2 Generate Encryption Key

- [ ] Run: `openssl rand -hex 32`
- [ ] Save the output — this is your `N8N_ENCRYPTION_KEY`

### 2.3 Set Render Environment Variables

- [ ] Go to **Render** → Your n8n service → Environment
- [ ] Add these variables:

```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<your-neon-host>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=<your-neon-user>
DB_POSTGRESDB_PASSWORD=<your-neon-password>
DB_POSTGRESDB_SSL_ENABLED=true
N8N_ENCRYPTION_KEY=<your-generated-key>
```

- [ ] Redeploy n8n on Render
- [ ] Recreate the 4 webhook workflows (they'll now persist)

---

## Priority 3: Set Up n8n Backups

### 3.1 Manual Backup

- [ ] SSH into Render or use n8n API
- [ ] Run: `n8n export:workflow --all --output=workflows.json`
- [ ] Run: `n8n export:credentials --all --decrypted=false --output=creds.json`
- [ ] Commit both files to repo (creds are encrypted, safe to commit)

### 3.2 GitHub Action (optional)

- [ ] Create `.github/workflows/n8n-backup.yml` (template exists in repo)
- [ ] Set GitHub secrets: `N8N_URL`, `N8N_API_KEY`
- [ ] Test the workflow manually

---

## Priority 4: Resend Domain Verification

Currently emails only send to the owner's email (Resend free tier limitation).

- [ ] Go to **resend.com/domains**
- [ ] Add domain: `buildwithjazz.com`
- [ ] Add the 3 DNS records Resend provides (TXT, MX, CNAME)
- [ ] Wait for verification (5-10 minutes)
- [ ] Update `send-contract/route.ts` from address to `noreply@buildwithjazz.com`
- [ ] Test: send contract to a non-owner email

---

## Priority 5: UptimeRobot Setup

Keep n8n awake on Render free tier.

- [ ] Go to **uptimerobot.com** → Sign up (free)
- [ ] Add Monitor → HTTP(s)
- [ ] URL: `https://eightn-render.onrender.com`
- [ ] Interval: 5 minutes
- [ ] Optional: set up email/SMS alerts

---

## Priority 6: GHL Custom Field IDs

The following env vars need real values from your GHL account:

- [ ] Go to **GHL** → Settings → Custom Fields
- [ ] For each field, click and copy the ID
- [ ] Set in Vercel:
  - `GHL_FIELD_PDF_URL` = Contract PDF URL field ID
  - `GHL_FIELD_CLIENT_NAME` = Contract Client Name field ID
  - `GHL_FIELD_TOTAL_COST` = Contract Total Cost field ID
- [ ] Set in local `.env`
- [ ] Redeploy

---

## Verification Checklist

After completing the above, verify everything works:

- [ ] Chat works on `buildwithjazz.com/chat`
- [ ] Contract generation works (Download PDF + Send to Client)
- [ ] GHL contact created after chat conversation
- [ ] Discord notification received
- [ ] Dashboard accessible at `clients.buildwithjazz.com`
- [ ] Prep sheet form submits successfully
- [ ] n8n workflows persist after Render restart
- [ ] Emails send to non-owner addresses (if domain verified)

---

*Last updated: 2026-06-24*
