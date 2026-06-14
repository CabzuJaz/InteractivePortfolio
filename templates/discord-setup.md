# Discord Webhook Setup for Portfolio Leads

## Create the Webhook

1. Open Discord
2. Go to your server
3. Click **⚙️** next to the channel (e.g., `#portfolio-leads`)
4. Click **Integrations** → **Webhooks**
5. Click **New Webhook**
6. Name it: **Portfolio Bot**
7. Copy the **Webhook URL**

---

## Create the Channels

Create these channels in your Discord server:

| Channel | Purpose |
|---------|---------|
| `#portfolio-leads` | New lead notifications |
| `#contracts` | Contract sent confirmations |
| `#payments` | Payment received alerts |
| `#projects-done` | Project completion alerts |

---

## Webhook Payloads

### New Lead Notification
```json
{
  "embeds": [{
    "title": "🆕 New Portfolio Lead",
    "color": 65535,
    "fields": [
      {"name": "Name", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Email", "value": "{{contact.email}}", "inline": true},
      {"name": "Company", "value": "{{contact.company}}", "inline": true}
    ],
    "footer": {"text": "BuildWithJazz.com"},
    "timestamp": "{{now}}"
  }]
}
```

### Contract Sent
```json
{
  "embeds": [{
    "title": "📄 Contract Sent",
    "color": 16776960,
    "fields": [
      {"name": "Client", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Email", "value": "{{contact.email}}", "inline": true},
      {"name": "Amount", "value": "${{opportunity.value}}", "inline": true}
    ],
    "footer": {"text": "Awaiting downpayment"}
  }]
}
```

### Payment Received
```json
{
  "embeds": [{
    "title": "💰 Payment Received",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Amount", "value": "${{invoice.amount}}", "inline": true},
      {"name": "Type", "value": "Downpayment / Final", "inline": true}
    ],
    "footer": {"text": "Payment confirmed"}
  }]
}
```

### Project Completed
```json
{
  "embeds": [{
    "title": "✅ Project Completed",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Project", "value": "{{opportunity.name}}", "inline": true},
      {"name": "Action", "value": "Final invoice + docs sent"}
    ],
    "footer": {"text": "Ready for final payment"}
  }]
}
```

---

## Test Your Webhook

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test from Portfolio Bot!"}'
```

If you see the message in Discord, the webhook is working!
