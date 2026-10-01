export interface Project {
  slug: string;
  title: string;
  industry?: string;
  oneLiner: string;
  description: string;
  problem: string;
  solution: string;
  architecture: string;
  tech: string[];
  year?: number;
  keyFeatures: string[];
  challenges: string[];
  results: string[];
  links: {
    live?: string;
    github?: string;
  };
  images: string[];
  highlight?: boolean;
  /** Résumé bullets; only projects listed in resume.featuredProjects use them. */
  resumeBullets?: string[];
}

export const projects: Project[] = [
  {
    slug: "ai-content-operations-system",
    title: "AI Content Operations System",
    industry: "Content Operations",
    oneLiner:
      "One controlled pipeline for planning, AI-assisted copy and visuals, human approval, and verified social scheduling.",
    description:
      "Designed and built a Python-first content operations system with both a local operator interface and a complete CLI. The platform turns strategy and a reusable topic bank into scheduled content briefs, then moves each item through separately scoped copy, visual, approval, media, and publishing workflows. Deterministic application logic owns state, validation, timing, and side effects; AI providers operate behind explicit schemas and policy boundaries. Drafts and media remain immutable and checksum-verified, Discord supplies human approval gates, and approved posts can move to GoHighLevel for draft creation or scheduled Facebook and Instagram delivery.",
    problem:
      "Content planning, copy, visuals, approvals, and publishing were separate activities with no shared source of truth. A single AI response could change strategy, prose, and artwork together, so fixing one part risked reviving rejected work elsewhere. Remote actions also needed clear confirmation, auditability, and recovery instead of a fragile publish-now workflow.",
    solution:
      "Built an explicit content lifecycle around SQLite and immutable local artifacts. A deterministic planner balances strategy and publishing slots; scoped AI roles create the brief, copy, and visual direction without crossing ownership boundaries; copy and media are approved independently in Discord; and GoHighLevel integration handles preview, draft creation, media reuse, and scheduling. A loopback-only operator UI, daily queue, pipeline view, integrity doctor, and tested backup/restore path make the system usable and recoverable in day-to-day operation.",
    architecture:
      "Strategy + Topic Bank → Deterministic Planner → Scoped AI Roles (brief, copy, visual) → Immutable SQLite + File Artifacts → Discord Copy & Media Approval → GoHighLevel Drafts & Scheduling → Operator UI, Queue & Health Checks",
    tech: [
      "Python",
      "SQLite",
      "Codex CLI",
      "Discord API",
      "GoHighLevel API",
      "OpenAI Images API",
      "Pillow",
      "PyYAML",
      "pytest",
      "HTML/CSS/JavaScript",
    ],
    year: 2026,
    keyFeatures: [
      "Deterministic strategy planner with weighted distribution, publishing slots, blackout dates, and a reusable topic bank",
      "Separate strategist, copywriter, and visual-director schemas with revision scopes that cannot overwrite each other's artifacts",
      "Immutable copy and media versions with SHA-256 verification and explicit lifecycle history",
      "Independent Discord approval flows for copy and per-platform media candidates",
      "Safe GoHighLevel preview, draft, media-upload, and scheduling workflows with idempotent remote operations",
      "Loopback-only operator interface backed by the same domain safeguards as the full CLI",
      "Daily queue, pipeline status, integrity checks, health reporting, and actionable recovery guidance",
      "SQLite-aware backup and restore flow that excludes secrets and verifies the recovered system",
    ],
    challenges: [
      "Separating strategy, copy, and visual ownership so a narrow revision cannot silently change already approved work",
      "Modeling copy, media, per-platform bindings, approvals, and remote publishing as independent but coordinated lifecycles",
      "Keeping AI generation bounded by strict schemas while deterministic code remains authoritative for state and side effects",
      "Making external Discord and GoHighLevel operations retryable and idempotent without hiding unknown remote states",
      "Protecting credentials and managed media through environment isolation, path validation, signature sniffing, and redacted errors",
    ],
    results: [
      "Released a stable 1.0.0 content operations platform with a local operator workspace and complete CLI",
      "Live-verified Facebook and Instagram scheduling through GoHighLevel, including read-back, idempotency, and controlled cleanup",
      "Eliminated cross-scope revision drift by making strategy, copy, and visual direction separate versioned artifacts",
      "Established human approval gates and integrity checks across copy, media, scheduling, backup, and recovery paths",
    ],
    links: {},
    images: ["/projects/content-operations-system.png"],
    highlight: true,
    resumeBullets: [
      "Released v1.0.0 of a Python content operations platform (full CLI plus a local operator UI) that moves a strategy and topic bank through scoped AI copy and visual roles, human approval, and scheduled Facebook and Instagram publishing via GoHighLevel.",
      "Kept deterministic code in charge of state and side effects: AI roles work behind strict schemas, and drafts and media are immutable, SHA-256-verified versions, so a narrow revision can't silently change approved work.",
      "Made remote publishing idempotent and recoverable: live-verified scheduling with read-back and cleanup, integrity checks, and a tested backup and restore path, covered with pytest.",
    ],
  },
  {
    slug: "automated-lead-intake-estimating-system",
    title: "Automated Lead Intake & Estimating System",
    industry: "Home Services",
    oneLiner:
      "One lead pipeline for intake, CRM sync, estimating, staff follow-up, and an auditable override trail.",
    description:
      "Designed and built a single lead pipeline for a US-based home-services company, replacing scattered tools with five coordinated n8n workflows. Leads from three WordPress form paths are normalized, duplicate-checked, and synced to both GorillaDesk and a Google Sheets CRM with a concise summary of what the customer needs. An estimating layer applies configurable service-area and pricing rules, routing anything uncertain to manual review instead of guessing. Staff notifications run over Gmail and Twilio SMS with an acknowledgement reminder loop, and every estimate override is captured in an append-only audit trail that syncs idempotently back to the CRM.",
    problem:
      "Lead inquiries, project photos, CRM records, spreadsheet tracking, and estimating rules lived in separate tools. Leads arrived through multiple form paths with no shared normalization, producing duplicate records, inconsistent field mapping, and manual handoffs before any estimate could be reviewed — with no audit trail when a price was overridden.",
    solution:
      "Built one pipeline across five n8n workflows: contact form, quick intake, instant estimate, internal notification/acknowledgement, and estimate override audit. Submissions are normalized against an explicit field contract, matched for duplicates, geocoded for service-area rules, then written to GorillaDesk and Google Sheets. Pricing runs on configurable rules with explicit manual-review fallbacks, and human approval gates anything customer-facing.",
    architecture:
      "WordPress + WPForms (3 intake paths) → n8n normalization & field-contract validation → Duplicate matching → Google Maps geocoding + service-area rules → GorillaDesk + Google Sheets CRM sync → Rules-based estimate engine (manual-review fallback) → Gmail + Twilio staff notification & acknowledgement loop → Append-only override audit sync",
    tech: [
      "n8n",
      "WordPress",
      "WPForms",
      "GorillaDesk CRM",
      "Google Sheets API",
      "Google Maps Geocoding",
      "Twilio SMS",
      "Gmail API",
      "Elementor",
      "jq",
    ],
    keyFeatures: [
      "Five coordinated n8n workflows behind one lead pipeline",
      "Three WordPress intake paths normalized to a shared field contract",
      "Duplicate matching before any CRM write",
      "Dual sync to GorillaDesk and a Google Sheets CRM with concise lead summaries",
      "Geocoding-driven service-area and configurable pricing rules",
      "Manual-review routing when pricing inputs are missing or ambiguous",
      "Append-only estimate override audit with idempotent CRM sync",
      "Staff SMS/email notifications with an acknowledgement reminder loop",
      "Consent gating, opt-out suppression, and Do-Not-Text handling for A2P SMS compliance",
    ],
    challenges: [
      "Reconciling business requirements against technical field keys so an exported workflow key was never mistaken for an approved form contract",
      "Making override sync idempotent — already-synced rows are skipped so a retry can never double-post a CRM note",
      "Designing pricing to withhold an automatic quote and route to manual review rather than invent a charge on ambiguous input",
      "Gating customer SMS behind consent and suppression rules to stay within A2P requirements",
      "Preventing silent lead loss by surfacing workflow failures instead of dropping records",
    ],
    results: [
      "Delivered five workflows covering intake, estimating, notification, and override auditing",
      "Unified three previously separate form paths into one normalized lead pipeline",
      "Established an append-only override audit trail as the authoritative record for estimate changes",
      "Staff notification and acknowledgement path verified live; broader rollout still gated on client-side controlled testing and release approval",
    ],
    links: {},
    images: ["/projects/lead-intake-estimating-system.png"],
    highlight: true,
  },
  {
    slug: "str-lead-research-agent",
    title: "STR Lead Research Agent",
    oneLiner: "A simple web form that turns a market and location into an organized lead list.",
    description:
      "Built a web interface where users input location and business type, then the system automatically searches the internet for matching businesses, collects data, and saves structured results to Google Sheets. An n8n workflow processes the data for enrichment and follow-up. Fully automated from user input to organized lead database.",
    problem: "Manual lead research was time-consuming, inconsistent, and couldn't scale. Sales teams spent hours searching for potential clients one by one.",
    solution:
      "Built a website-powered lead research agent: users enter location and business type through a web form, the system searches the internet for matching businesses, collects relevant data, and automatically saves everything to Google Sheets. An n8n workflow triggers for data enrichment and processing.",
    architecture:
      "Website (user input: location + business type) → Internet Search (data collection) → Google Sheets (save results) → n8n (enrichment & processing)",
    tech: ["Python", "Claude API", "Flask", "SQLite", "SSE", "Google Sheets API", "n8n", "Web Scraping"],
    year: 2026,
    keyFeatures: [
      "Web interface for location and business type input",
      "Automated internet search for matching businesses",
      "Google Sheets integration for organized data storage",
      "n8n workflow for data enrichment and processing",
      "Hands-free operation from input to output",
    ],
    challenges: [
      "Handling inconsistent web data formats",
      "Ensuring search results are relevant and accurate",
      "Scaling across different locations and business types",
    ],
    results: [
      "Eliminated manual lead research process",
      "Users can find leads through a simple web form",
      "Results automatically organized in Google Sheets",
    ],
    links: { github: "https://github.com/CabzuJaz/claude-hello-world/tree/main/day23-str-lead-agent" },
    images: ["/projects/str-lead-research-agent.webp"],
    highlight: true,
    resumeBullets: [
      "Capstone of a self-directed 30-day Claude sprint: orchestrator, search, and enrichment agents coordinated through Claude tool use, at about $0.007 per run on Claude Haiku.",
      "Enrichment pulls emails, phones, and social links with four fallback strategies (mailto/tel links, regex, HTML-entity decoding, contact-page fallback), dedupes into SQLite, and syncs to Google Sheets.",
      "Flask front end streams every agent step live over Server-Sent Events, with input sanitization and XSS protection.",
    ],
  },
  {
    slug: "ai-email-triage",
    title: "AI Email Triage System",
    oneLiner: "AI-powered email classification and routing with real-time processing feedback.",
    description:
      "Intelligent email classification and routing system using Claude API with tool use, SSE streaming, and n8n integration for automated workflow execution. Processes incoming emails, classifies intent, and routes to appropriate handlers.",
    problem: "High volume of incoming emails required manual classification and routing, causing delays and inconsistency.",
    solution:
      "Built an AI-powered email triage system that uses Claude API with tool use to classify incoming emails by intent, urgency, and category, then automatically routes them to the appropriate handler via n8n workflows.",
    architecture:
      "Email Inbox (trigger) → n8n (orchestration) → Claude API (classification + tool use) → SSE (streaming) → Route to Handler",
    tech: ["Claude API", "Tool Use", "SSE", "n8n", "Python"],
    year: 2026,
    keyFeatures: [
      "Claude API with tool use for intelligent classification",
      "SSE streaming for real-time processing feedback",
      "n8n integration for automated workflow execution",
      "Multi-category email routing",
      "Urgency and intent detection",
    ],
    challenges: [
      "Designing effective classification prompts",
      "Handling edge cases in email formatting",
      "Maintaining low latency for real-time triage",
    ],
    results: [
      "Automated email classification and routing",
      "Reduced manual triage time significantly",
      "Consistent classification across all emails",
    ],
    links: {},
    images: [],
    highlight: true,
  },
  {
    slug: "multi-agent-orchestrator",
    title: "Multi-Agent Orchestrator Pipeline",
    oneLiner: "A coordinated agent pipeline that turns email requests into structured outputs.",
    description:
      "End-to-end multi-agent pipeline: email intake → Claude orchestration → sub-agents → tool use → structured output to Sheets/DB. Features SSE streaming and FastMCP for standardized tool access.",
    problem: "Complex workflows required coordination between multiple AI agents, each with specialized capabilities.",
    solution:
      "Designed and built a multi-agent orchestrator that receives email intake, uses Claude as the primary orchestrator to delegate tasks to specialized sub-agents, each with tool use capabilities, and produces structured output to Google Sheets and databases.",
    architecture:
      "Email Intake → Claude Orchestrator → Sub-Agents (parallel) → Tool Use → FastMCP → Structured Output (Sheets/DB)",
    tech: ["Claude API", "Tool Use", "SSE", "FastMCP", "Python", "SQLite", "Google Sheets API"],
    year: 2026,
    keyFeatures: [
      "Claude-powered orchestration layer",
      "Specialized sub-agents for different tasks",
      "SSE streaming for real-time progress",
      "FastMCP for standardized tool access",
      "Structured output to Sheets and SQLite",
    ],
    challenges: [
      "Coordinating multiple agents without conflicts",
      "Managing state across distributed agents",
      "Ensuring consistent output format",
    ],
    results: [
      "Fully automated multi-agent pipeline",
      "Real-time streaming progress feedback",
      "Structured, consistent output format",
    ],
    links: {},
    images: [],
    highlight: true,
    resumeBullets: [
      "Orchestrator agent breaks tasks into subtasks and delegates them to specialized sub-agents with tool use, writing structured output to Google Sheets and SQLite.",
      "Summarizes between agents to stop token bloat across multi-step runs, and caps every tool-use loop at three iterations to bound API cost.",
    ],
  },
  {
    slug: "mcp-server-sqlite",
    title: "MCP Server + SQLite Integration",
    oneLiner: "Reusable MCP tools that give AI clients safe, structured access to SQLite data.",
    description:
      "Built a Model Context Protocol server for standardized AI tool access with SQLite backend, Flask REST API, and CSV data import. Enables any MCP-compatible AI client to query and manage structured data.",
    problem: "AI tools needed a standardized way to access structured data across different clients and systems.",
    solution:
      "Built an MCP (Model Context Protocol) server that exposes SQLite database operations as standardized tools, with a Flask REST API for external access and CSV import capabilities for data ingestion.",
    architecture:
      "MCP Client → MCP Server (protocol) → SQLite (storage) ← Flask REST API (external access) ← CSV Import",
    tech: ["MCP", "FastMCP", "SQLite", "Flask", "REST API", "Python", "CSV Processing"],
    year: 2026,
    keyFeatures: [
      "MCP protocol for standardized AI tool access",
      "SQLite backend for structured data storage",
      "Flask REST API for external integrations",
      "CSV data import pipeline",
      "Compatible with any MCP-enabled AI client",
    ],
    challenges: [
      "Implementing MCP protocol correctly",
      "Handling concurrent access to SQLite",
      "Designing intuitive tool interfaces",
    ],
    results: [
      "Standardized tool access for AI clients",
      "Reusable across multiple projects",
      "Clean REST API for external integrations",
    ],
    links: { github: "https://github.com/CabzuJaz/claude-hello-world/tree/main/day13-mcp-sqlite" },
    images: [],
  },
  {
    slug: "ai-lead-qualification",
    title: "AI Lead Qualification & Follow-Up Automation",
    oneLiner: "Lead scoring, personalized follow-up, and owner alerts in one automated workflow.",
    description:
      "Built an end-to-end lead management workflow using n8n, Groq AI, Google Sheets, Gmail, and Telegram. The system automatically qualifies incoming leads, scores buying intent, recommends services, sends personalized follow-ups, and notifies the business owner in real time.",
    problem: "Manual lead qualification was slow, inconsistent, and leads were falling through the cracks without timely follow-up.",
    solution:
      "Built an end-to-end automated lead management workflow that qualifies incoming leads using Groq AI, scores buying intent on a 1-10 scale, recommends relevant services, sends personalized email follow-ups via Gmail, tracks everything in Google Sheets, and sends real-time Telegram notifications to the business owner.",
    architecture:
      "Lead Intake → n8n (orchestration) → Groq AI (qualification + scoring + recommendations) → Google Sheets (tracking) → Gmail (follow-ups) → Telegram (notifications)",
    tech: ["n8n", "Groq", "Google Sheets API", "Gmail", "Telegram"],
    year: 2026,
    keyFeatures: [
      "AI-powered lead qualification",
      "Lead scoring (1-10 scale)",
      "Buying intent detection",
      "Service recommendation engine",
      "Automated personalized email follow-up",
      "Google Sheets lead tracking",
      "Real-time Telegram notifications",
    ],
    challenges: [
      "Designing accurate scoring prompts for Groq AI",
      "Handling different lead sources and formats",
      "Ensuring follow-up timing is optimal",
    ],
    results: [
      "Fully automated lead management pipeline",
      "Real-time visibility into lead quality",
      "Consistent, personalized follow-ups at scale",
    ],
    links: {},
    images: ["/projects/ai-lead-qualifications.png"],
    highlight: true,
  },
  {
    slug: "ai-portfolio-minmin-chat",
    title: "AI Portfolio with MinMin Chat",
    industry: "Personal Product",
    oneLiner:
      "This site: a chat that answers as me from my own data, and turns a qualified conversation into a contract PDF and a CRM record.",
    description:
      "Built the site you are reading as a working product rather than a page. MinMin answers in first person using only my data files, and routes each question to one of ten tools whose results render as interactive cards: projects, skills, r\u00e9sum\u00e9, availability, contact, a business analysis, a prep sheet, and a generated contract. Every conversation is logged once to the CRM and once to a spreadsheet, so a lead that starts in chat already exists as a contact, a note, and a full transcript before I read it.",
    problem:
      "A static portfolio answers the same three questions and stops. Anything specific \u2014 can you build this, what would it cost, have you shipped something like it \u2014 needed me awake and typing, and the enquiries that did arrive lived in my inbox with no record and no follow-up.",
    solution:
      "A Next.js app on the Vercel AI SDK where the model is a router and narrator, never a database: it picks a tool, the tool returns structured data from one source of truth, and a React component renders it. The decisions that must not be wrong live in tool code rather than prompt wording \u2014 the server writes the one sentence the model may say about a delivered contract, refuses a contract whose hour breakdown drifts from the estimate already given in chat, and signs each conversation\u2019s log reference so later turns update the same records instead of creating new ones.",
    architecture:
      "Visitor \u2192 Streamed Chat (Next.js) \u2192 Model + 10 Tools \u2192 Rich Cards \u2192 Server-Side Contract PDF \u2192 CRM Contact, Note & Hosted PDF \u2192 Spreadsheet Transcript",
    tech: [
      "Next.js 16",
      "TypeScript",
      "Vercel AI SDK",
      "Claude API",
      "Tailwind CSS v4",
      "zod",
      "GoHighLevel API",
      "Google Sheets API",
      "React PDF",
    ],
    year: 2026,
    keyFeatures: [
      "Ten AI tools whose results render as interactive cards instead of prose",
      "Contract PDF generated, hosted, and emailed server-side through the CRM",
      "Estimate guard: a contract that drifts from the hours quoted in chat is refused",
      "One contact, one note, and one transcript row per conversation, updated in place",
      "R\u00e9sum\u00e9 PDF generated from the same data files, so the site and the CV cannot disagree",
      "Four-provider model fallback chain so the chat survives an outage",
    ],
    challenges: [
      "A major AI SDK upgrade changed the shape of tool results, and every card silently stopped rendering while the text still streamed. Fixed by reading tool parts through the SDK\u2019s own helpers, and by testing in a real browser instead of only against the API.",
      "Prompt-only rules failed often enough to matter: the model claimed an email had been sent when delivery had failed, and quoted hours it then contradicted in the contract. The fixes moved into tool code, which is deterministic.",
      "Logging ran on every turn, so one conversation produced a pile of near-identical CRM notes. Each conversation now carries a signed reference, and later turns update the record they already created.",
    ],
    results: [
      "Every chat arrives as one CRM contact, one note, and one readable transcript, with no copying by hand",
      "A qualified conversation produces a contract PDF and sends it without me in the loop",
      "The r\u00e9sum\u00e9 rebuilds from the same data in one command, so it never drifts from the site",
    ],
    links: {
      live: "https://www.buildwithjazz.com",
      github: "https://github.com/CabzuJaz/InteractivePortfolio",
    },
    images: ["/projects/ai-portfolio-minmin-chat.png"],
  },
  {
    slug: "asmr-video-publishing-pipeline",
    title: "ASMR Video Generation & Publishing Pipeline",
    industry: "Content Automation",
    oneLiner:
      "A scheduled n8n workflow that writes its own prompt, renders a vertical video with Veo, waits out the render, and publishes to YouTube and Facebook.",
    description:
      "A guided build, and I want to be straight about that: I followed a published n8n tutorial step by step rather than designing this myself. What is mine is everything it runs on \u2014 my Google Cloud project and service account, my OpenRouter key, my YouTube and Facebook accounts \u2014 and the work of getting a pipeline with service-account auth, a long-running render job and two publishing targets actually working end to end. It has been running on a schedule and the videos it produced are live.",
    problem:
      "Short-form content needs a steady stream of finished video, and producing each one by hand is slow. I also wanted hands-on experience with the parts I had only read about: Google service-account authentication, and media APIs that render asynchronously instead of answering straight away.",
    solution:
      "A scheduled n8n workflow. A language model writes the scene prompt, the title and the caption as structured JSON so later steps can read them as fields. A service-account payload is signed into a JWT and exchanged for a Google access token, which authorises a Veo render on Vertex AI. The workflow then polls the render until it reports done, branches on Google\u2019s safety filter and on errors, converts the returned base64 into a video file, and uploads the same file to YouTube and to Facebook.",
    architecture:
      "Schedule \u2192 LLM Prompt + Structured JSON \u2192 Service-Account JWT \u2192 Google Access Token \u2192 Veo Render Job \u2192 Poll Until Done \u2192 Safety & Error Branches \u2192 Base64 to Video File \u2192 YouTube + Facebook",
    tech: [
      "n8n",
      "Google Vertex AI (Veo)",
      "OpenRouter",
      "Google Cloud Service Accounts",
      "JWT",
      "YouTube Data API",
      "Facebook Graph API",
    ],
    year: 2026,
    keyFeatures: [
      "Prompt, title and caption generated as structured JSON, so the upload steps read them as fields rather than parsing prose",
      "Service-account payload signed into a JWT and exchanged for a Google access token inside the workflow",
      "Polling loop that waits for the render to report done, instead of guessing a fixed delay",
      "Safety-filter branch: a rejected generation goes back for a fresh prompt rather than ending the run",
      "Error branch retries the render",
      "One finished file publishes to both YouTube and Facebook",
    ],
    challenges: [
      "The render is asynchronous: the job returns an operation name, and the workflow has to poll it until it reports done before anything can read the video.",
      "Vertex returns the video as base64 inside JSON, so it has to be converted to a binary file before either platform will accept the upload.",
      "Google\u2019s safety filter rejects some generations outright, so the run needs a branch that regenerates rather than failing.",
    ],
    results: [
      "Runs on a schedule and has published finished videos to YouTube and Facebook",
      "First hands-on experience with Google service-account auth and long-running Vertex AI jobs",
      "Guided build: the design is the tutorial\u2019s, the cloud setup, credentials and accounts are mine",
    ],
    links: {},
    images: ["/projects/asmr-video-pipeline.png"],
  },
];
