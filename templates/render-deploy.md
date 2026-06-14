# Deploy n8n on Render.com (Free)

## Step 1: Create Render Account

1. Go to **[render.com](https://render.com)**
2. Sign up with GitHub (free)

---

## Step 2: Fork n8n Docker Image

Render deploys from a Git repo. Create a simple repo with a Dockerfile:

### Option A: Use My Template (Fastest)

1. Create a new GitHub repo called `n8n-render`
2. Add this `Dockerfile`:

```dockerfile
FROM n8nio/n8n

ENV N8N_PORT=5678
ENV N8N_PROTOCOL=https
ENV WEBHOOK_URL=https://your-n8n.onrender.com/
ENV N8N_SECURE_COOKIE=false

EXPOSE 5678
```

3. Push to GitHub

---

## Step 3: Deploy on Render

1. Go to **[dashboard.render.com](https://dashboard.render.com)**
2. Click **New** → **Web Service**
3. Connect your GitHub repo (`n8n-render`)
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `n8n` |
| **Runtime** | `Docker` |
| **Instance Type** | `Free` |
| **Port** | `5678` |
| **Health Check Path** | `/` |

5. Click **Create Web Service**

---

## Step 4: Set Environment Variables

After deployment, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `N8N_HOST` | `your-n8n.onrender.com` |
| `N8N_PORT` | `5678` |
| `N8N_PROTOCOL` | `https` |
| `WEBHOOK_URL` | `https://your-n8n.onrender.com/` |
| `N8N_SECURE_COOKIE` | `false` |
| `N8N_BASIC_AUTH_ACTIVE` | `true` |
| `N8N_BASIC_AUTH_USER` | `your-username` |
| `N8N_BASIC_AUTH_PASSWORD` | `your-password` |

---

## Step 5: Access n8n

1. Wait for deployment to finish (2-3 minutes)
2. Open `https://your-n8n.onrender.com`
3. Log in with your credentials

---

## Step 6: Import Workflows

Once n8n is running, I can import all 4 contract automation workflows via the API.

Just give me:
1. Your n8n URL: `https://your-n8n.onrender.com`
2. Your API key (generate in n8n → Settings → API)

---

## Important Notes

### Free Tier Limitations
- **Spins down after 15 min** of inactivity
- **Cold start**: 30-60 seconds to wake up
- **Webhooks may fail** during spin-down

### Fix: Keep-Alive Ping
Add a free cron job to ping your n8n every 10 minutes:

1. Go to **[cron-job.org](https://cron-job.org)** (free)
2. Create a job:
   - URL: `https://your-n8n.onrender.com`
   - Schedule: Every 10 minutes
3. This keeps n8n awake

### Alternative: Use n8n.cloud Instead
If the spin-down issue is a problem, n8n.cloud free tier is better:
- No spin-down
- 5 workflows, 100 executions/month
- Permanent URL

---

## Quick Deploy Checklist

- [ ] Create Render account
- [ ] Create GitHub repo with Dockerfile
- [ ] Deploy on Render (Free tier)
- [ ] Set environment variables
- [ ] Access n8n and set up account
- [ ] Generate API key
- [ ] Import 4 workflows
- [ ] Set up keep-alive ping
- [ ] Update GHL webhook URLs
- [ ] Test the flow
