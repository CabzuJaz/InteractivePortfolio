export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  description: string;
  problem: string;
  solution: string;
  architecture: string;
  tech: string[];
  year: number;
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
    slug: "str-lead-research-agent",
    title: "STR Lead Research Agent",
    oneLiner: "Automated lead research pipeline with Google Sheets integration",
    description:
      "Automated lead research pipeline: Google Sheets triggers n8n workflow, scrapes web data, calls Claude for analysis, and writes enriched results back. Runs hands-free with intelligent error handling and retry logic.",
    problem: "Manual lead research was time-consuming, inconsistent, and couldn't scale.",
    solution:
      "Built an end-to-end automated pipeline that triggers from Google Sheets, scrapes relevant web data, uses Claude API to analyze and enrich lead information, and writes structured results back to the sheet — all hands-free.",
    architecture:
      "Google Sheets (trigger) → n8n (orchestration) → Web Scraper (data collection) → Claude API (analysis & enrichment) → Google Sheets (output)",
    tech: ["Claude API", "n8n", "Google Sheets API", "Web Scraping", "Python"],
    year: 2026,
    keyFeatures: [
      "Google Sheets trigger-based workflow",
      "Automated web scraping for lead data",
      "Claude-powered lead analysis and enrichment",
      "Structured output back to spreadsheets",
      "Error handling and retry logic",
    ],
    challenges: [
      "Handling inconsistent web data formats",
      "Rate limiting across multiple APIs",
      "Ensuring data quality in automated pipeline",
    ],
    results: [
      "Eliminated manual lead research process",
      "Runs completely hands-free",
      "Consistent, structured lead data output",
    ],
    links: {},
    images: ["/projects/str-lead.svg"],
    highlight: true,
  },
  {
    slug: "ai-email-triage",
    title: "AI Email Triage System",
    oneLiner: "Intelligent email classification and routing with Claude API",
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
    images: ["/projects/email-triage.svg"],
    highlight: true,
  },
  {
    slug: "multi-agent-orchestrator",
    title: "Multi-Agent Orchestrator Pipeline",
    oneLiner: "End-to-end multi-agent pipeline from email to structured output",
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
    images: ["/projects/orchestrator.svg"],
    highlight: true,
  },
  {
    slug: "mcp-server-sqlite",
    title: "MCP Server + SQLite Integration",
    oneLiner: "Standardized AI tool access with MCP protocol and REST API",
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
    images: ["/projects/mcp-server.svg"],
  },
  {
    slug: "ai-lead-qualification",
    title: "AI Lead Qualification & Follow-Up Automation",
    oneLiner: "End-to-end lead management with AI scoring, automated follow-ups, and real-time notifications",
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
    images: ["/projects/lead-qualification.svg"],
    highlight: true,
  },
];
