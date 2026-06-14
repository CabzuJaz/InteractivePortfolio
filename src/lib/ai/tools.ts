import { tool, generateText } from "ai";
import { z } from "zod";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { resume } from "@/data/resume";
import { contact } from "@/data/contact";
import { persona } from "@/data/persona";
import { fun } from "@/data/fun";
import { getModel } from "./provider";

export const getProjects = tool({
  description:
    "Show my projects as interactive cards. Call this whenever the user asks about " +
    "projects, work, portfolio, what I have built, what I've shipped, STR Lead Research Agent, " +
    "email triage, multi-agent orchestrator, MCP server, or anything I have worked on.",
  inputSchema: z.object({}),
  execute: async () => ({ projects }),
});

export const getSkills = tool({
  description:
    "Show my skills organized by category. Call this whenever the user asks about " +
    "skills, technologies, tech stack, what I know, what I'm good at, Claude API, Python, " +
    "MCP, automation tools, or my proficiency levels.",
  inputSchema: z.object({}),
  execute: async () => ({ skills }),
});

export const getResume = tool({
  description:
    "Show my resume with experience timeline. Call this whenever the user asks about " +
    "my resume, work experience, background, career history, Junior Software Engineer, " +
    "Kitchen Team Leader, IT Admin, or qualifications.",
  inputSchema: z.object({}),
  execute: async () => ({ resume }),
});

export const getContact = tool({
  description:
    "Show my contact information and social links. Call this whenever the user asks about " +
    "contact, email, socials, how to reach me, LinkedIn, GitHub, phone, availability, " +
    "remote work, or how to get in touch.",
  inputSchema: z.object({}),
  execute: async () => ({ contact }),
});

export const getMe = tool({
  description:
    "Show a personal introduction card with my bio, location, and values. Call this whenever the user asks " +
    "about me, who I am, my introduction, about myself, tell me about Jazz, or wants to know more about me as a person.",
  inputSchema: z.object({}),
  execute: async () => ({
    persona: {
      name: persona.name,
      role: persona.role,
      location: persona.location,
      bio: persona.bio,
      summary: persona.summary,
      values: persona.values,
      highlights: persona.highlights,
    },
  }),
});

export const getFun = tool({
  description:
    "Show my hobbies, fun facts, and personal interests. Call this whenever the user asks about " +
    "hobbies, fun, interests, personal life, what I do for fun, fun facts, AI engineering sprint, " +
    "banking systems, legacy systems, or anything casual about me.",
  inputSchema: z.object({}),
  execute: async () => ({ fun }),
});

export const getAvailability = tool({
  description:
    "Show my availability for work and what I'm looking for. Call this whenever the user asks about " +
    "availability, hiring, looking for work, recruiting, open to work, remote work, " +
    "what kind of role I want, or why they should hire me.",
  inputSchema: z.object({}),
  execute: async () => ({
    status: persona.status,
    lookingFor: [
      "AI Automation Engineer",
      "Backend Developer",
      "AI Systems Builder",
      "ML/AI Engineer",
    ],
    whyHireMe: [
      "2+ years building production-grade AI automation systems",
      "Deep expertise in Claude API, MCP, and multi-agent architectures",
      "Proven track record of shipping systems that reduce manual effort",
      "Comfortable in both legacy enterprise systems and cutting-edge AI",
      "Self-directed learner who completed a 30-day AI Engineering sprint",
    ],
    availability: "Open to remote work and project inquiries",
    location: "Cavite, Philippines — available for remote",
  }),
});

export const generateContract = tool({
  description:
    "MUST CALL when user mentions: contract, hire, rates, pricing, project cost, engagement, " +
    "or wants to work together. Generates a contract proposal PDF with rate card and tool costs. " +
    "Use whatever info is available — do NOT ask for more details first.",
  inputSchema: z.object({
    clientName: z.string().describe("The client or company name"),
    clientEmail: z
      .string()
      .optional()
      .describe("The client's email address (ask for it if not already provided)"),
    projectDescription: z
      .string()
      .describe("Brief description of the project or engagement scope"),
    estimatedHours: z
      .number()
      .optional()
      .describe("Estimated total hours for the project (default 40 if not specified)"),
  }),
  execute: async ({ clientName, clientEmail, projectDescription, estimatedHours }) => {
    const hourlyRate = 10;
    const hours = estimatedHours ?? 40;
    const laborCost = hourlyRate * hours;

    const toolSubscriptions = [
      { name: "Claude API (Anthropic)", cost: 100, period: "month" },
      { name: "n8n Cloud (Automation)", cost: 50, period: "month" },
      { name: "GitHub Copilot", cost: 10, period: "month" },
      { name: "Groq API (Inference)", cost: 25, period: "month" },
    ];

    const monthlyToolCost = toolSubscriptions.reduce((sum, t) => sum + t.cost, 0);
    const projectDurationMonths = Math.ceil(hours / 80); // ~80 hrs/month
    const totalToolCost = monthlyToolCost * projectDurationMonths;
    const totalCost = laborCost + totalToolCost;

    return {
      contract: {
        clientName,
        clientEmail: clientEmail ?? null,
        projectDescription,
        hourlyRate,
        hours,
        laborCost,
        toolSubscriptions,
        monthlyToolCost,
        projectDurationMonths,
        totalToolCost,
        totalCost,
        terms: [
          "Payment: 50% upfront, 50% on delivery",
          "Revisions: 2 rounds included per milestone",
          "Communication: Daily async updates via preferred channel",
          "Timeline: Estimated based on scope; adjustments discussed upfront",
          "Tool subscriptions are billed at cost — no markup",
          "Cancellation: 1-week notice required",
        ],
      },
    };
  },
});

export const analyzeBusiness = tool({
  description:
    "Analyze a business and design automation opportunities. ONLY call this AFTER you have completed a " +
    "consultative discovery conversation — you must first understand the business context, pain points, " +
    "current tools, and goals through 2-3 rounds of follow-up questions. Never call this immediately " +
    "on the first message about business automation. Requires: industry, goal, and current tools.",
  inputSchema: z.object({
    industry: z.string().describe("The business industry, e.g. 'E-commerce', 'Healthcare', 'SaaS'"),
    goal: z.string().describe("The primary business goal, e.g. 'Reduce operational costs', 'Scale without hiring'"),
    currentTools: z
      .string()
      .describe("Tools the business currently uses, e.g. 'Google Sheets, Slack, QuickBooks'"),
  }),
  execute: async ({ industry, goal, currentTools }) => {
    const { text } = await generateText({
      model: getModel(),
      prompt: `You are a Senior Automation Consultant. Analyze this business and design automation opportunities.

Business Industry: ${industry}
Business Goal: ${goal}
Current Tools: ${currentTools}

Generate a practical automation analysis with these exact sections. Use markdown formatting. Be specific and actionable.

## Business Summary
A 2-3 sentence overview of the business context and situation.

## Current Challenges
List 3-5 specific operational challenges this business likely faces.

## Automation Opportunities
List 3-5 concrete automation opportunities ranked by impact.

## Recommended Workflow
Describe the ideal automated workflow step-by-step.

## Recommended Software Stack
List specific tools and platforms with brief justification for each.

## n8n Workflow Design
Describe how this would be built in n8n — triggers, nodes, integrations.

## Implementation Difficulty
Rate as Easy / Medium / Hard with explanation of what makes it that level.

## Estimated Time Savings
Quantify expected time savings (hours per week/month).

## Expected Business Impact
Describe the projected business outcomes over 3-6 months.`,
    });

    return {
      analysis: {
        industry,
        goal,
        currentTools,
        content: text,
      },
    };
  },
});
