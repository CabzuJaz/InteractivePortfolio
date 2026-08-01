export interface Skill {
  name: string;
  level?: 1 | 2 | 3; // 1 = familiar, 2 = proficient, 3 = expert
}

export interface SkillCategory {
  category: string;
  items: Skill[];
}

export const skills: SkillCategory[] = [
  {
    category: "AI & Automation",
    items: [
      { name: "Claude API", level: 3 },
      { name: "Prompt Engineering", level: 3 },
      { name: "MCP", level: 3 },
      { name: "FastMCP", level: 2 },
      { name: "n8n", level: 3 },
      { name: "GoHighLevel (GHL)", level: 3 },
      { name: "GHL Workflows", level: 3 },
      { name: "GHL API", level: 2 },
      { name: "Multi-Agent Systems", level: 3 },
      { name: "Tool Use", level: 3 },
      { name: "SSE", level: 2 },
      { name: "RAG", level: 2 },
    ],
  },
  {
    category: "Programming",
    items: [
      { name: "Python", level: 3 },
      { name: "C#", level: 2 },
      { name: "VB.NET", level: 2 },
      { name: "JavaScript", level: 2 },
      { name: "SQL", level: 3 },
      { name: "HTML/CSS", level: 2 },
    ],
  },
  {
    category: "APIs & Integrations",
    items: [
      { name: "Google Sheets API", level: 3 },
      { name: "Google Drive API", level: 2 },
      { name: "Microsoft Graph API", level: 2 },
      { name: "Anthropic API", level: 3 },
      { name: "REST APIs", level: 3 },
      { name: "OpenAI API", level: 2 },
      { name: "GorillaDesk CRM", level: 2 },
      { name: "Twilio SMS", level: 2 },
      { name: "Gmail API", level: 2 },
      { name: "Google Maps / Geocoding", level: 2 },
      { name: "Webhooks", level: 3 },
    ],
  },
  {
    category: "Backend & Data",
    items: [
      { name: "Flask", level: 2 },
      { name: "SQLite", level: 3 },
      { name: "MS Access", level: 2 },
      { name: "Web Scraping", level: 2 },
      { name: "Regex", level: 2 },
      { name: "CSV Processing", level: 2 },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Git", level: 2 },
      { name: "GitHub", level: 2 },
      { name: "Google Workspace", level: 2 },
      { name: "MS Office", level: 2 },
      { name: "WordPress", level: 2 },
      { name: "WPForms", level: 2 },
      { name: "Elementor", level: 1 },
    ],
  },
];
