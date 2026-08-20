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
}

export const projects: Project[] = [
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
    tech: ["n8n", "Google Sheets API", "Web Scraping", "Python", "Web Form"],
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
    links: {},
    images: [],
    highlight: true,
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
    links: {},
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
    images: [],
    highlight: true,
  },
];
