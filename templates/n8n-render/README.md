# n8n on Render

Deploy n8n workflow automation on Render.com (Free Tier).

## Deploy

1. Fork this repo
2. Go to [render.com](https://render.com)
3. New → Web Service → Connect this repo
4. Set environment variables (see below)
5. Deploy

## Environment Variables

| Key | Value |
|-----|-------|
| `N8N_HOST` | `your-app-name.onrender.com` |
| `N8N_PORT` | `5678` |
| `N8N_PROTOCOL` | `https` |
| `WEBHOOK_URL` | `https://your-app-name.onrender.com/` |
| `N8N_SECURE_COOKIE` | `false` |

## Keep Awake (Important!)

Free tier spins down after 15 min. Set up a keep-alive ping:

1. Go to [cron-job.org](https://cron-job.org) (free)
2. Create job: `https://your-app-name.onrender.com` every 10 minutes
