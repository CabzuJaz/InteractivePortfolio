# GHL Workflow Setup Guide

Copy-paste ready. Follow each workflow step by step.

---

## Workflow 1: Contract & Downpayment

**Name:** `Portfolio — Contract Sent → Downpayment`
**Trigger:** Contact tag added → `proposal-sent`

### Step-by-Step:

```
1. Go to Automation → Workflows → + Create Workflow → Start from Scratch
2. Name: Portfolio — Contract Sent → Downpayment
```

**Trigger:**
```
Type: Contact Tag Added
Tag: proposal-sent
```

**Action 1 — Send Internal Notification:**
```
Type: Send Internal Notification
To: your email/phone
Message: 📄 Contract sent to {{contact.first_name}} {{contact.last_name}} ({{contact.email}}) — {{contact.company}}
```

**Action 2 — Wait:**
```
Type: Wait
Duration: 5 minutes
```

**Action 3 — Send Email (Follow-Up):**
```
Type: Send Email
To: {{contact.email}}
Subject: Quick follow-up on your contract, {{contact.first_name}}

Body:
Hi {{contact.first_name}},

Just wanted to make sure you received the contract proposal I sent over.

Quick recap:
• Rate: $10/hour
• Payment: 50% upfront, 50% on delivery
• Tool subscriptions billed at cost

To move forward:
1. Review the attached contract
2. Reply "CONFIRM" to accept
3. I'll send the downpayment invoice (50%)

Questions? Reply to this email or book a quick call:
https://calendly.com/jazzmincabizares/15-minutes-discovery-call

Best,
Jazzmin Sicat-Cabizares
AI Automation Engineer
BuildWithJazz.com
```

**Action 4 — Wait:**
```
Type: Wait
Duration: 2 days
```

**Action 5 — Filter (Check if Confirmed):**
```
Type: Filter
Condition: Contact tag IS NOT "downpayment-paid"
```

**Action 6 — Send Email (Reminder):**
```
Type: Send Email
To: {{contact.email}}
Subject: Still interested, {{contact.first_name}}?

Body:
Hi {{contact.first_name}},

I wanted to check in — are you still interested in moving forward with the project?

If the timing isn't right, no worries at all. Just let me know and I can hold off.

If you're ready:
• Reply "CONFIRM" and I'll send the downpayment invoice
• Or book a call: https://calendly.com/jazzmincabizares/15-minutes-discovery-call

Best,
Jazzmin
```

**Action 7 — Discord Notification:**
```
Type: Webhook
Method: POST
URL: https://discord.com/api/webhooks/1515600055778803832/IwC-TVb4Aytg4Mo_CdQDo5zb8JUxcwnxNxqTN7bIaASDFO4U6WGQcjdg6jToo7sSMu55

Body:
{
  "embeds": [{
    "title": "⏰ Follow-Up Sent",
    "color": 16776960,
    "fields": [
      {"name": "Client", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Email", "value": "{{contact.email}}", "inline": true},
      {"name": "Status", "value": "Waiting for confirmation", "inline": true}
    ]
  }]
}
```

**Save → Activate**

---

## Workflow 2: Downpayment Received → Start Project

**Name:** `Portfolio — Downpayment Paid → Start`
**Trigger:** Contact tag added → `downpayment-paid`

### Step-by-Step:

```
1. Go to Automation → Workflows → + Create Workflow → Start from Scratch
2. Name: Portfolio — Downpayment Paid → Start
```

**Trigger:**
```
Type: Contact Tag Added
Tag: downpayment-paid
```

**Action 1 — Send Email (Project Kickoff):**
```
Type: Send Email
To: {{contact.email}}
Subject: Let's get started, {{contact.first_name}}! 🚀

Body:
Hi {{contact.first_name}},

Thank you for the downpayment — I'm excited to get started!

Here's what happens next:
1. I'll begin work within 24 hours
2. You'll receive daily progress updates
3. I'll reach out if I need anything from you

Communication:
• Primary: Email (async updates)
• Urgent: WhatsApp (+639389036717)
• Meetings: https://calendly.com/jazzmincabizares/15-minutes-discovery-call

Let's build something great!

Best,
Jazzmin Sicat-Cabizares
AI Automation Engineer
BuildWithJazz.com
```

**Action 2 — Add Tag:**
```
Type: Add Tag
Tag: in-progress
```

**Action 3 — Move Opportunity:**
```
Type: Move Opportunity
Pipeline: Portfolio Leads
Stage: In Progress
```

**Action 4 — Discord Notification:**
```
Type: Webhook
Method: POST
URL: (your Discord webhook)

Body:
{
  "embeds": [{
    "title": "🚀 Project Started",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Company", "value": "{{contact.company}}", "inline": true},
      {"name": "Email", "value": "{{contact.email}}", "inline": true}
    ],
    "description": "Downpayment received. Project is now in progress."
  }]
}
```

**Save → Activate**

---

## Workflow 3: Project Completed → Final Payment & Turnover

**Name:** `Portfolio — Project Done → Final Payment`
**Trigger:** Contact tag added → `done`

### Step-by-Step:

```
1. Go to Automation → Workflows → + Create Workflow → Start from Scratch
2. Name: Portfolio — Project Done → Final Payment
```

**Trigger:**
```
Type: Contact Tag Added
Tag: done
```

**Action 1 — Send Email (Final Invoice + Docs):**
```
Type: Send Email
To: {{contact.email}}
Subject: Project Complete — Final Payment & Documentation

Body:
Hi {{contact.first_name}},

Great news — your project is complete! 🎉

Please find attached:
1. 📄 Project Documentation (technical specs, architecture, API docs)
2. 📘 Turnover Manual (how to use, maintain, and extend)
3. 🔑 Access credentials (if applicable)

Final Payment:
The remaining 50% is now due. I'll send the final invoice separately.

Next Steps:
1. Review the attached documentation
2. Pay the final invoice
3. Let me know if you have any questions

I'm available for 2 weeks of free support after delivery for any questions or minor adjustments.

It's been a pleasure working with you!

Best,
Jazzmin Sicat-Cabizares
AI Automation Engineer
BuildWithJazz.com

Attachments:
- Project Documentation (upload to GHL Media Library first)
- Turnover Manual (upload to GHL Media Library first)
```

**Action 2 — Wait:**
```
Type: Wait
Duration: 1 hour
```

**Action 3 — Send Invoice (Final 50%):**
```
Type: Send Invoice
Template: Final Payment (50%)
To: {{contact.email}}
```

**Action 4 — Discord Notification:**
```
Type: Webhook
Method: POST
URL: (your Discord webhook)

Body:
{
  "embeds": [{
    "title": "✅ Project Completed",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Company", "value": "{{contact.company}}", "inline": true},
      {"name": "Email", "value": "{{contact.email}}", "inline": true},
      {"name": "Action", "value": "Final invoice + docs sent", "inline": false}
    ]
  }]
}
```

**Action 5 — Add Tag:**
```
Type: Add Tag
Tag: final-invoice-sent
```

**Action 6 — Move Opportunity:**
```
Type: Move Opportunity
Pipeline: Portfolio Leads
Stage: Completed
```

**Save → Activate**

---

## Workflow 4: Final Payment Received → Close Project

**Name:** `Portfolio — Final Payment → Close`
**Trigger:** Contact tag added → `final-payment-paid`

### Step-by-Step:

```
1. Go to Automation → Workflows → + Create Workflow → Start from Scratch
2. Name: Portfolio — Final Payment → Close
```

**Trigger:**
```
Type: Contact Tag Added
Tag: final-payment-paid
```

**Action 1 — Send Email (Thank You + Review Request):**
```
Type: Send Email
To: {{contact.email}}
Subject: Thank you, {{contact.first_name}}! 🙏

Body:
Hi {{contact.first_name}},

Thank you for the final payment — our project is officially complete!

I hope the system serves you well. If you need anything in the future:
• Bug fixes: Free for 2 weeks after delivery
• New features: $10/hour
• Maintenance: $10/hour

Would you mind leaving a quick review? It helps me a lot:
• Google: [YOUR_GOOGLE_REVIEW_LINK]
• LinkedIn: linkedin.com/in/jazzmin-sicat-cabizares-9346041b8

It's been a pleasure working with you. Stay in touch!

Best,
Jazzmin Sicat-Cabizares
AI Automation Engineer
BuildWithJazz.com
```

**Action 2 — Add Tag:**
```
Type: Add Tag
Tag: completed
```

**Action 3 — Remove Tag:**
```
Type: Remove Tag
Tag: in-progress
```

**Action 4 — Discord Notification:**
```
Type: Webhook
Method: POST
URL: (your Discord webhook)

Body:
{
  "embeds": [{
    "title": "🎉 Project Closed",
    "color": 65280,
    "fields": [
      {"name": "Client", "value": "{{contact.first_name}} {{contact.last_name}}", "inline": true},
      {"name": "Company", "value": "{{contact.company}}", "inline": true},
      {"name": "Status", "value": "Fully paid and completed", "inline": true}
    ],
    "description": "All deliverables sent. Project is officially closed."
  }]
}
```

**Save → Activate**

---

## Summary: All Workflows

| # | Name | Trigger | Key Actions |
|---|------|---------|-------------|
| 1 | Contract Sent → Downpayment | `proposal-sent` | Follow-up email → Wait 2d → Reminder |
| 2 | Downpayment Paid → Start | `downpayment-paid` | Kickoff email → Tag `in-progress` |
| 3 | Project Done → Final Payment | `done` | Send docs + final invoice |
| 4 | Final Payment → Close | `final-payment-paid` | Thank you + review request |

---

## Tags Reference

| Tag | When Added | By |
|-----|------------|-----|
| `portfolio-chat-lead` | Chat conversation logged | Auto (your site) |
| `proposal-sent` | Contract PDF uploaded | Auto (your site) |
| `downpayment-paid` | You manually confirm | You |
| `in-progress` | Workflow 2 | Auto |
| `done` | You mark project complete | You |
| `final-invoice-sent` | Workflow 3 | Auto |
| `final-payment-paid` | You manually confirm | You |
| `completed` | Workflow 4 | Auto |

---

## Invoice Templates to Create

Go to **Payments** → **Invoices** → **Templates**

**Template 1: Downpayment (50%)**
```
Name: Downpayment Invoice
Item: Project Downpayment — 50% of total
Description: 50% upfront payment for [PROJECT_NAME]
Price: Manual (enter per project)
Due: Immediately
```

**Template 2: Final Payment (50%)**
```
Name: Final Payment Invoice
Item: Final Payment — 50% of total
Description: Final 50% payment for [PROJECT_NAME]
Price: Manual (enter per project)
Due: On receipt
```

---

## Files to Upload to GHL Media Library

Go to **Settings** → **Media Library** → **Upload**

1. `templates/project-documentation.md` — Convert to PDF first
2. `templates/turnover-manual.md` — Convert to PDF first

These will be attached to the "Project Done" workflow email.
