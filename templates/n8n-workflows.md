# n8n Workflow Setup — Contract Automation

Use n8n as middleware between GHL and Discord/Email. GHL sends webhooks to n8n, n8n handles everything else.

---

## Prerequisites

1. **n8n instance** — self-hosted or n8n.cloud
2. **GHL API Key** — already have it
3. **Discord Webhook URL** — already have it
4. **Resend API Key** — already have it

---

## Workflow 1: Contract Sent → Notify + Follow-Up

**Trigger:** GHL Webhook (when tag `proposal-sent` is added)

### n8n Nodes:

```
[Webhook] → [GHL: Get Contact] → [IF: Has Email] → [Discord] → [Resend: Email] → [Wait 2d] → [GHL: Check Tag] → [Resend: Reminder]
```

### Step-by-Step:

**Node 1 — Webhook Trigger**
```
Type: Webhook
Method: POST
Path: /contract-sent
Webhook URL: https://your-n8n.com/webhook/contract-sent
```

**Node 2 — GHL: Get Contact**
```
Type: HTTP Request
Method: GET
URL: https://services.leadconnectorhq.com/contacts/{{contactId}}
Headers:
  Authorization: Bearer {{$env.GHL_API_KEY}}
  Version: 2021-07-28
```

**Node 3 — IF: Has Email**
```
Type: IF
Condition: {{email}} is not empty
```

**Node 4 — Discord Notification**
```
Type: HTTP Request
Method: POST
URL: YOUR_DISCORD_WEBHOOK_URL
Body (JSON):
{
  "embeds": [{
    "title": "📄 Contract Sent",
    "color": 16776960,
    "fields": [
      {"name": "Client", "value": "{{firstName}} {{lastName}}", "inline": true},
      {"name": "Email", "value": "{{email}}", "inline": true},
      {"name": "Company", "value": "{{companyName}}", "inline": true},
      {"name": "Status", "value": "Awaiting confirmation", "inline": true}
    ],
    "footer": {"text": "BuildWithJazz.com"}
  }]
}
```

**Node 5 — Resend: Follow-Up Email**
```
Type: HTTP Request
Method: POST
URL: https://api.resend.com/emails
Headers:
  Authorization: Bearer {{$env.RESEND_API_KEY}}
  Content-Type: application/json
Body:
{
  "from": "Jazzmin <onboarding@resend.dev>",
  "to": "{{email}}",
  "subject": "Quick follow-up on your contract, {{firstName}}",
  "html": "<div style='font-family:system-ui'>Hi {{firstName}},<br><br>Just wanted to make sure you received the contract proposal.<br><br>Quick recap:<br>• Rate: $10/hour<br>• Payment: 50% upfront, 50% on delivery<br><br>To move forward, reply 'CONFIRM' and I'll send the downpayment invoice.<br><br>Questions? Book a call: <a href='https://calendly.com/jazzmincabizares/15-minutes-discovery-call'>calendly.com/jazzmincabizares</a><br><br>Best,<br>Jazzmin</div>"
}
```

**Node 6 — Wait**
```
Type: Wait
Duration: 2 days
```

**Node 7 — GHL: Check if Confirmed**
```
Type: HTTP Request
Method: GET
URL: https://services.leadconnectorhq.com/contacts/{{contactId}}
Headers:
  Authorization: Bearer {{$env.GHL_API_KEY}}
  Version: 2021-07-28
Then check if tags include "downpayment-paid"
```

**Node 8 — IF: Not Confirmed**
```
Type: IF
Condition: tags does NOT include "downpayment-paid"
```

**Node 9 — Resend: Reminder Email**
```
Type: HTTP Request
Method: POST
URL: https://api.resend.com/emails
Body:
{
  "from": "Jazzmin <onboarding@resend.dev>",
  "to": "{{email}}",
  "subject": "Still interested, {{firstName}}?",
  "html": "<div style='font-family:system-ui'>Hi {{firstName}},<br><br>Checking in — are you still interested in moving forward?<br><br>If the timing isn't right, no worries. Just let me know.<br><br>Ready? Reply 'CONFIRM' and I'll send the downpayment invoice.<br><br>Best,<br>Jazzmin</div>"
}
```

**Node 10 — Discord: Reminder Sent**
```
Type: HTTP Request
Method: POST
URL: (Discord webhook)
Body:
{
  "embeds": [{
    "title": "⏰ Reminder Sent",
    "color": 16776960,
    "fields": [
      {"name": "Client", "value": "{{firstName}} {{lastName}}", "inline": true},
      {"name": "Status", "value": "Waiting for confirmation"}
    ]
  }]
}
```

---

## Workflow 2: Downpayment Paid → Start Project

**Trigger:** GHL Webhook (when tag `downpayment-paid` is added)

### n8n Nodes:

```
[Webhook] → [Discord] → [Resend: Kickoff Email] → [GHL: Update Stage]
```

**Node 1 — Webhook Trigger**
```
Type: Webhook
Path: /downpayment-paid
```

**Node 2 — Discord Notification**
```
Type: HTTP Request
Method: POST
URL: (Discord webhook)
Body:
{
  "embeds": [{
    "title": "💰 Downpayment Received",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{firstName}} {{lastName}}", "inline": true},
      {"name": "Company", "value": "{{companyName}}", "inline": true},
      {"name": "Email", "value": "{{email}}", "inline": true}
    ],
    "description": "Project can now begin!"
  }]
}
```

**Node 3 — Resend: Kickoff Email**
```
Type: HTTP Request
Method: POST
URL: https://api.resend.com/emails
Body:
{
  "from": "Jazzmin <onboarding@resend.dev>",
  "to": "{{email}}",
  "subject": "Let's get started, {{firstName}}! 🚀",
  "html": "<div style='font-family:system-ui'>Hi {{firstName}},<br><br>Thank you for the downpayment — I'm excited to get started!<br><br>Here's what happens next:<br>1. I'll begin work within 24 hours<br>2. You'll receive daily progress updates<br>3. I'll reach out if I need anything<br><br>Communication:<br>• Email: <OWNER_EMAIL><br>• WhatsApp: <OWNER_PHONE><br>• Book a call: <a href='https://calendly.com/jazzmincabizares/15-minutes-discovery-call'>calendly.com</a><br><br>Let's build something great!<br><br>Best,<br>Jazzmin</div>"
}
```

**Node 4 — GHL: Add Tag**
```
Type: HTTP Request
Method: POST
URL: https://services.leadconnectorhq.com/contacts/{{contactId}}/tags
Headers:
  Authorization: Bearer {{$env.GHL_API_KEY}}
  Version: 2021-07-28
Body:
{
  "tags": ["in-progress"]
}
```

---

## Workflow 3: Project Done → Final Payment + Docs

**Trigger:** GHL Webhook (when tag `done` is added)

### n8n Nodes:

```
[Webhook] → [Discord] → [Resend: Docs Email] → [Wait 1h] → [GHL: Send Invoice]
```

**Node 1 — Webhook Trigger**
```
Type: Webhook
Path: /project-done
```

**Node 2 — Discord Notification**
```
Type: HTTP Request
Method: POST
URL: (Discord webhook)
Body:
{
  "embeds": [{
    "title": "✅ Project Completed",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{firstName}} {{lastName}}", "inline": true},
      {"name": "Company", "value": "{{companyName}}", "inline": true},
      {"name": "Action", "value": "Sending docs + final invoice", "inline": true}
    ]
  }]
}
```

**Node 3 — Resend: Documentation Email**
```
Type: HTTP Request
Method: POST
URL: https://api.resend.com/emails
Body:
{
  "from": "Jazzmin <onboarding@resend.dev>",
  "to": "{{email}}",
  "subject": "Project Complete — Documentation & Final Payment",
  "html": "<div style='font-family:system-ui'>Hi {{firstName}},<br><br>Great news — your project is complete! 🎉<br><br>Please find attached:<br>1. 📄 Project Documentation<br>2. 📘 Turnover Manual<br>3. 🔑 Access credentials (if applicable)<br><br>The final invoice (remaining 50%) will be sent shortly.<br><br>I'm available for 2 weeks of free support after delivery.<br><br>It's been a pleasure working with you!<br><br>Best,<br>Jazzmin</div>",
  "attachments": [
    {"path": "https://your-n8n.com/files/project-documentation.pdf"},
    {"path": "https://your-n8n.com/files/turnover-manual.pdf"}
  ]
}
```

**Node 4 — Wait**
```
Type: Wait
Duration: 1 hour
```

**Node 5 — GHL: Send Final Invoice**
```
Type: HTTP Request
Method: POST
URL: https://services.leadconnectorhq.com/invoices
Headers:
  Authorization: Bearer {{$env.GHL_API_KEY}}
  Version: 2021-07-28
Body:
{
  "contactId": "{{contactId}}",
  "name": "Final Payment (50%)",
  "dueDate": "{{now}}",
  "items": [
    {"name": "Final Payment — 50% of total", "qty": 1, "price": {{totalCost * 0.5}}}
  ]
}
```

**Node 6 — GHL: Add Tag**
```
Type: HTTP Request
Method: POST
URL: https://services.leadconnectorhq.com/contacts/{{contactId}}/tags
Body:
{
  "tags": ["final-invoice-sent"]
}
```

---

## Workflow 4: Final Payment → Close Project

**Trigger:** GHL Webhook (when tag `final-payment-paid` is added)

### n8n Nodes:

```
[Webhook] → [Discord] → [Resend: Thank You] → [GHL: Add Tag]
```

**Node 1 — Webhook Trigger**
```
Type: Webhook
Path: /final-payment-paid
```

**Node 2 — Discord Notification**
```
Type: HTTP Request
Method: POST
URL: (Discord webhook)
Body:
{
  "embeds": [{
    "title": "🎉 Project Fully Paid",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{firstName}} {{lastName}}", "inline": true},
      {"name": "Company", "value": "{{companyName}}", "inline": true},
      {"name": "Status", "value": "Completed — requesting review", "inline": true}
    ]
  }]
}
```

**Node 3 — Resend: Thank You + Review Request**
```
Type: HTTP Request
Method: POST
URL: https://api.resend.com/emails
Body:
{
  "from": "Jazzmin <onboarding@resend.dev>",
  "to": "{{email}}",
  "subject": "Thank you, {{firstName}}! 🙏",
  "html": "<div style='font-family:system-ui'>Hi {{firstName}},<br><br>Thank you for the final payment — our project is officially complete!<br><br>If you need anything in the future:<br>• Bug fixes: Free for 2 weeks<br>• New features: $10/hour<br>• Maintenance: $10/hour<br><br>Would you mind leaving a review?<br>• <a href='https://g.page/r/YOUR_GOOGLE_REVIEW'>Google Review</a><br>• <a href='https://linkedin.com/in/jazzmin-sicat-cabizares-9346041b8'>LinkedIn</a><br><br>It's been a pleasure working with you!<br><br>Best,<br>Jazzmin</div>"
}
```

**Node 4 — GHL: Add Tag**
```
Type: HTTP Request
Method: POST
URL: https://services.leadconnectorhq.com/contacts/{{contactId}}/tags
Body:
{
  "tags": ["completed"]
}
```

---

## n8n Environment Variables

Set these in n8n (Settings → Environment Variables):

```
GHL_API_KEY=YOUR_GHL_API_KEY
GHL_LOCATION_ID=YOUR_GHL_LOCATION_ID
RESEND_API_KEY=YOUR_RESEND_API_KEY
DISCORD_WEBHOOK_URL=YOUR_DISCORD_WEBHOOK_URL
```

---

## GHL Workflow Setup (Simplified)

Since n8n handles the heavy lifting, GHL workflows become simple webhook triggers:

**Workflow 1: Contract Sent**
```
Trigger: Tag added → proposal-sent
Action: Webhook POST → https://your-n8n.com/webhook/contract-sent
Body: {"contactId": "{{contact.id}}", "email": "{{contact.email}}", "firstName": "{{contact.first_name}}", "lastName": "{{contact.last_name}}", "companyName": "{{contact.company}}"}
```

**Workflow 2: Downpayment Paid**
```
Trigger: Tag added → downpayment-paid
Action: Webhook POST → https://your-n8n.com/webhook/downpayment-paid
Body: {"contactId": "{{contact.id}}", "email": "{{contact.email}}", "firstName": "{{contact.first_name}}", "lastName": "{{contact.last_name}}", "companyName": "{{contact.company}}"}
```

**Workflow 3: Project Done**
```
Trigger: Tag added → done
Action: Webhook POST → https://your-n8n.com/webhook/project-done
Body: {"contactId": "{{contact.id}}", "email": "{{contact.email}}", "firstName": "{{contact.first_name}}", "lastName": "{{contact.last_name}}", "companyName": "{{contact.company}}", "totalCost": "{{opportunity.value}}"}
```

**Workflow 4: Final Payment**
```
Trigger: Tag added → final-payment-paid
Action: Webhook POST → https://your-n8n.com/webhook/final-payment-paid
Body: {"contactId": "{{contact.id}}", "email": "{{contact.email}}", "firstName": "{{contact.first_name}}", "lastName": "{{contact.last_name}}", "companyName": "{{contact.company}}"}
```

---

## Summary

| Component | Role |
|-----------|------|
| **GHL** | CRM, contact management, simple webhook triggers |
| **n8n** | Automation engine — Discord, email, invoices, logic |
| **Discord** | Real-time notifications |
| **Resend** | Transactional emails |

This way you only need the basic GHL plan — all the complex automation lives in n8n.
