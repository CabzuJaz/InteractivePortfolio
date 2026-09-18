export interface Education {
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  gpa?: string;
  highlights?: string[];
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  /** Résumé bullets; the chat card shows `description` instead. */
  highlights?: string[];
  tech?: string[];
}

/** Roles outside software, shown as a single line each on the résumé. */
export interface EarlierRole {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  summary: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  image?: string;
}

export interface Learning {
  name: string;
  detail: string;
}

export const resume = {
  pdfUrl: "/resume.pdf",
  headline: "AI Automation Engineer & Backend Developer",
  summary:
    "AI automation engineer with 3+ years in software engineering and automation, including 1+ year building AI systems. Designs and ships multi-agent pipelines, Claude tool-use integrations, n8n workflows, and Python, C#, and SQL backends, and builds in the parts that keep them reliable: idempotent retries, duplicate handling, audit trails, and human approval gates.",
  education: [
    {
      school: "Cavite State University",
      degree: "Bachelor of Science",
      field: "Computer Engineering",
      startYear: 2018,
      endYear: 2023,
    },
  ] as Education[],
  experience: [
    {
      company: "Build with Jazz (Freelance)",
      role: "AI Automation Engineer",
      startDate: "2025",
      endDate: "Present",
      description:
        "Building AI-powered automation systems and client portals. Integrating GoHighLevel (GHL) CRM with custom workflows for lead capture, contract generation, and project management. Developed n8n automation pipelines for client onboarding, payment tracking, and multi-channel notifications. Created an AI chatbot portfolio that generates contracts, logs leads to GHL, and sends Discord notifications in real-time.",
      highlights: [
        "Built and delivered a five-workflow n8n lead pipeline for a US home-services company: three WordPress intake paths normalized to one field contract, duplicate matching before any CRM write, GorillaDesk and Google Sheets sync, and rules-based estimating that routes ambiguous jobs to manual review.",
        "Added staff SMS and email alerts with an acknowledgement reminder loop, consent and opt-out handling for A2P SMS compliance, and an append-only audit trail for estimate overrides that syncs idempotently back to the CRM.",
        "Integrate GoHighLevel CRM through its workflows and API for lead capture, contract generation, and client project dashboards; build n8n pipelines for client onboarding, payment tracking, and multi-channel notifications.",
        "Built this portfolio's AI assistant (Next.js, Vercel AI SDK, Claude): streamed tool-calling chat that renders project and résumé cards, scopes automation requests, and generates contract PDFs delivered through the GoHighLevel API.",
      ],
      tech: ["GoHighLevel", "n8n", "Claude API", "GHL Workflows", "GHL API", "Discord Webhooks", "Resend", "Next.js"],
    },
    {
      company: "Xytron Int. Inc.",
      role: "Junior Software Engineer",
      startDate: "2023",
      endDate: "2025",
      description:
        "Built internal automation tools for database integration (SQL, Access, SQLite), print automation, and system workflows. Developed C# applications for secure banking document processing. Reduced manual processing time by 60% through workflow automation and custom tooling.",
      highlights: [
        "Cut manual processing time by 60% by building internal automation tools for database integration (SQL, MS Access, SQLite), print automation, and system workflows.",
        "Built and maintained C#/.NET desktop applications for secure banking document processing, processing bank statements of account with 100% accuracy.",
        "Automated high-volume document generation: populated Word and PDF templates and wrote print programs in PReS for Nipson high-speed printing systems.",
        "Built CSV, Excel, and SQL import/export and reporting workflows for structured data.",
      ],
      tech: ["C#", "Python", "SQL", "SQLite", "MS Access", "Automation"],
    },
  ] as Experience[],
  earlierExperience: [
    {
      company: "Seven-Eleven Corp.",
      role: "Kitchen Team Leader",
      startDate: "2021",
      endDate: "2023",
      summary: "Led team operations: staffing, payroll, supply forecasting, and monthly reporting.",
    },
    {
      company: "Greenergy Inc.",
      role: "IT Admin Intern",
      startDate: "2022",
      endDate: "2022",
      summary: "Network setup, hardware support, PC configuration, and invoice processing.",
    },
  ] as EarlierRole[],
  /** Project slugs shown with bullets on the résumé, in this order. */
  featuredProjects: ["ai-content-operations-system", "str-lead-research-agent", "multi-agent-orchestrator"],
  /** Project slugs named in a single "also built" line. */
  alsoBuilt: ["ai-email-triage", "mcp-server-sqlite", "ai-lead-qualification"],
  certificates: [
    {
      name: "Make.com",
      issuer: "Make",
      date: "2026",
      url: "/certs/make-certificate.pdf",
    },
    {
      name: "Zapier",
      issuer: "Tara AI Community",
      date: "2026",
      url: "/certs/certificate.pdf",
    },
  ] as Certificate[],
  learning: [
    {
      name: "30-Day Claude AI Engineering Sprint",
      detail:
        "Self-directed: 30 AI projects in 30 days covering Claude API tool use, MCP servers, multi-agent pipelines, and n8n integrations.",
    },
  ] as Learning[],
};
