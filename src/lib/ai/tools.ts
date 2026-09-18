import { tool, generateText, type ModelMessage } from "ai";
import { z } from "zod";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { resume } from "@/data/resume";
import { contact } from "@/data/contact";
import { persona } from "@/data/persona";
import { fun } from "@/data/fun";
import { buildPrepSheetResult } from "@/lib/prep-sheet";
import { getModel } from "./provider";

const projectSlugs = projects.map((project) => project.slug) as [string, ...string[]];

export const getProjects = tool({
  description:
    "Show my projects as interactive cards. Call this whenever the user asks about " +
    "projects, work, portfolio, what I have built, what I've shipped, STR Lead Research Agent, " +
    "email triage, multi-agent orchestrator, MCP server, or anything I have worked on. " +
    "Pass slugs to show only specific projects — always do this when pointing to one build as proof " +
    "that I've done something before, or when the visitor asks about a named project, so they see " +
    "that card instead of every card. Leave slugs out only when they want to see my work in general. " +
    "Projects: " +
    projects.map((project) => `${project.slug} (${project.title})`).join("; ") +
    ".",
  inputSchema: z.object({
    slugs: z
      .array(z.enum(projectSlugs))
      .optional()
      .describe("Show only these projects. Omit to show all of them."),
  }),
  execute: async ({ slugs }) => ({
    projects: slugs?.length ? projects.filter((project) => slugs.includes(project.slug)) : projects,
  }),
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
    "my resume, work experience, background, career history, past jobs, education, " +
    "certificates, or qualifications.",
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
      "3+ years in engineering, 1+ year building production-grade AI automation systems",
      "Deep expertise in Claude API, MCP, and multi-agent architectures",
      "Proven track record of shipping systems that reduce manual effort",
      "Comfortable in both legacy enterprise systems and cutting-edge AI",
      "Self-directed learner who completed a 30-day AI Engineering sprint",
    ],
    availability: contact.availability,
    location: "Cavite, Philippines — available for remote",
  }),
});

/**
 * The one sentence MinMin says after a contract call. It is decided here from
 * the real delivery result, because the model picking between canned lines
 * reported a failed send as "Done, I've emailed it" in testing.
 */
function deliveryStatusLine(
  delivery: import("../contract-delivery").DeliveryResult,
  clientEmail: string | undefined,
): string {
  if (delivery.sent && delivery.sentTo) {
    return `Done — I've emailed the contract PDF to ${delivery.sentTo}. Check your inbox, and the spam folder just in case.`;
  }
  if (!clientEmail) {
    return "Here's your contract proposal — if you'd like the PDF emailed to you, just share your email.";
  }
  return `Your contract summary is ready — the email didn't go through on my end just now, so I'll personally follow up at ${clientEmail} shortly.`;
}

/**
 * The most recent hours estimate MinMin gave the visitor in chat, as a range.
 * A contract outside it quotes the lead one number and bills another, which
 * happened in testing: "about 5–10 hours" in chat, a 15-hour contract.
 */
function lastQuotedHours(messages: ModelMessage[]): { min: number; max: number } | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "assistant") continue;
    const text =
      typeof message.content === "string"
        ? message.content
        : message.content.map((part) => (part.type === "text" ? part.text : "")).join(" ");

    const range = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:–|—|-|to)\s*(\d+(?:\.\d+)?)\s*hours?/gi)].at(-1);
    if (range) return { min: Number(range[1]), max: Number(range[2]) };

    const single = [...text.matchAll(/(?:about|around|roughly|approximately|~)\s*(\d+(?:\.\d+)?)\s*hours?/gi)].at(-1);
    if (single) {
      // "About N hours" is read as N give or take a quarter.
      const n = Number(single[1]);
      return { min: Math.floor(n * 0.75), max: Math.ceil(n * 1.25) };
    }
  }
  return null;
}

/** Records a scope field the model left out as explicitly outside the project. */
function orNotInScope(value: string | undefined): string {
  return value?.trim() || "Not in scope";
}

export const generateContract = tool({
  description:
    "Generates a contract proposal PDF with rate card and confirmed tool costs only after qualification is complete. " +
    "REQUIRED precondition, no exceptions: at some point in this conversation the VISITOR must have " +
    "either (a) explicitly mentioned price, cost, rate, quote, contract, or hiring, or (b) explicitly " +
    "said yes after being asked whether they want a proposal/implementation plan. " +
    "Having enough scope/requirements to build something is NOT sufficient on its own — thorough " +
    "discovery does not imply the visitor wants a contract yet. " +
    "Do NOT call this on a visitor's first description of a new problem, even if they ask about price in " +
    "the same message — scope it first. Do NOT call this in the same turn as asking scoping questions the " +
    "visitor hasn't answered yet. Any scope field that isn't part of the project can simply be left out — it is recorded as not in scope. " +
    "If featureBreakdown is missing, this tool returns a missing-info card instead of a formal quote. Once pricing intent AND qualified scope both exist, call this immediately.",
  inputSchema: z.object({
    clientName: z
      .string()
      .optional()
      .describe(
        "The client or company name, if given. If the visitor hasn't shared a name, " +
          "do NOT omit this field or abort the call — pass \"Client\" as a placeholder instead. " +
          "A tool call must always succeed; never let a missing name block generating the proposal.",
      ),
    clientEmail: z
      .string()
      .optional()
      .describe(
        "The client's email address. IMPORTANT: when this is provided, the contract PDF is " +
          "automatically emailed to it server-side (via GHL/CRM) — so collect it during scoping " +
          "whenever possible. If the visitor declined to share an email or only wants to see " +
          "numbers, omit it — the proposal card still shows everything, it just won't be emailed.",
      ),
    projectDescription: z
      .string()
      .describe("Brief description of the project or engagement scope"),
    existingCrm: z
      .string()
      .optional()
      .describe("The CRM or lead database the client currently uses. Use 'none' only if the visitor said they have none."),
    websitePlatform: z
      .string()
      .optional()
      .describe("The website/form platform the client currently uses, such as WordPress, Webflow, Shopify, etc."),
    smsProvider: z
      .string()
      .optional()
      .describe("The SMS provider available or preferred. Leave this out if texting isn't part of the project."),
    emailProvider: z
      .string()
      .optional()
      .describe("The email provider available or preferred. Leave this out if sending email isn't part of the project."),
    bookingSystem: z
      .string()
      .optional()
      .describe("The appointment-booking system available or preferred. Leave this out if booking isn't part of the project."),
    followUpPlan: z
      .string()
      .optional()
      .describe("How many follow-up messages, which channels, and the basic timing/rules. Leave this out if the project has no follow-up sequence."),
    stopCondition: z
      .string()
      .optional()
      .describe("When leads stop receiving follow-ups, e.g. after reply, booking, opt-out, or manual status change. Leave this out if the project has no follow-up sequence."),
    internalNotifications: z
      .string()
      .optional()
      .describe("Who should receive internal notifications and through which channel. Leave this out if the visitor hasn't asked for notifications."),
    monthlyLeadVolume: z
      .string()
      .optional()
      .describe("Expected monthly lead volume or a rough range. Only needed when something in scope is usage-priced, such as SMS; leave it out otherwise."),
    includedServices: z
      .string()
      .optional()
      .describe("Whether reporting, AI qualification, ongoing maintenance, revisions, and testing are included or excluded. Default: testing of the delivered build included; maintenance, reporting, and extra revisions excluded unless the visitor asked for them."),
    featureBreakdown: z
      .array(
        z.object({
          deliverable: z.string().describe("A concrete deliverable or integration."),
          hours: z.number().positive().describe("Estimated hours for this deliverable."),
        }),
      )
      .optional()
      .describe(
        "Feature-by-feature hour breakdown based only on confirmed scope. Required for a formal contract.",
      ),
    confirmedToolCosts: z
      .array(
        z.object({
          name: z.string().describe("Confirmed client-billable tool or subscription."),
          cost: z.number().nonnegative().describe("Monthly fixed cost, if known."),
          period: z.string().describe("Billing period, usually 'month'."),
          note: z.string().optional().describe("Mention usage-based pricing, existing client account, or assumptions."),
        }),
      )
      .optional()
      .describe("Only include tools confirmed as client-billable. Do not include developer tools like GitHub Copilot."),
    projectComplexity: z
      .enum(["simple", "moderate", "complex"])
      .optional()
      .describe("Project complexity: simple (basic automation), moderate (multi-step workflows), complex (AI/ML, custom integrations)"),
    clientType: z
      .enum(["startup", "small-business", "enterprise"])
      .optional()
      .describe("Client type: startup (budget-conscious), small-business (standard), enterprise (premium support)"),
  }),
  execute: async ({
    clientName,
    clientEmail,
    projectDescription,
    existingCrm,
    websitePlatform,
    smsProvider,
    emailProvider,
    bookingSystem,
    followUpPlan,
    stopCondition,
    internalNotifications,
    monthlyLeadVolume,
    includedServices,
    featureBreakdown,
    confirmedToolCosts,
    projectComplexity,
    clientType,
  }, { messages }) => {
    // Scope fields describe the project, and one left out means that
    // component isn't part of it. The model reliably omits fields that don't
    // apply rather than writing "none" into them, so an omitted field must not
    // block the proposal. What stops an invented total is the feature-by-feature
    // breakdown, which stays required.
    if (!featureBreakdown?.length) {
      return {
        contractQualification: {
          status: "needs_info" as const,
          message:
            "Preliminary only. A final scope, timeline, and price will follow once the deliverables are broken down.",
          missingFields: ["Feature-by-feature deliverables and hour breakdown"],
          questions: [],
        },
        // Nothing was generated or sent, so there is no recipient to report.
        delivery: {
          sent: false,
          method: "none" as const,
          sentTo: null,
          pdfUrl: null,
        },
      };
    }

    // Dynamic pricing based on complexity and client type
    // Base rate: $10/hr, max rate: $15/hr
    let hourlyRate = 10;

    // Adjust by complexity
    if (projectComplexity === "complex") {
      hourlyRate = 15;
    } else if (projectComplexity === "moderate") {
      hourlyRate = 12;
    }

    // Adjust by client type (enterprise pays more for premium support)
    if (clientType === "enterprise") {
      hourlyRate = Math.min(hourlyRate + 3, 15);
    } else if (clientType === "startup") {
      hourlyRate = Math.max(hourlyRate - 2, 10);
    }

    const hours = featureBreakdown.reduce((sum, item) => sum + item.hours, 0);

    // Hold the contract to the hours already promised in chat. Returning no
    // contract here renders nothing; the model rebuilds the breakdown inside
    // the quote, or tells the visitor why the scope now needs more.
    const quoted = lastQuotedHours(messages);
    if (quoted && (hours < quoted.min || hours > quoted.max)) {
      return {
        estimateMismatch: {
          quotedHours: `${quoted.min}–${quoted.max}`,
          breakdownHours: hours,
        },
      };
    }

    const laborCost = hourlyRate * hours;

    const toolSubscriptions = confirmedToolCosts ?? [];

    const monthlyToolCost = toolSubscriptions.reduce((sum, t) => sum + t.cost, 0);
    const projectDurationMonths = Math.ceil(hours / 80); // ~80 hrs/month
    const totalToolCost = monthlyToolCost * projectDurationMonths;
    const totalCost = laborCost + totalToolCost;

    const contract = {
      clientName: clientName ?? "Client",
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
      featureBreakdown,
      scopeAssumptions: {
        existingCrm: orNotInScope(existingCrm),
        websitePlatform: orNotInScope(websitePlatform),
        smsProvider: orNotInScope(smsProvider),
        emailProvider: orNotInScope(emailProvider),
        bookingSystem: orNotInScope(bookingSystem),
        followUpPlan: orNotInScope(followUpPlan),
        stopCondition: orNotInScope(stopCondition),
        internalNotifications: orNotInScope(internalNotifications),
        monthlyLeadVolume: orNotInScope(monthlyLeadVolume),
        includedServices: orNotInScope(includedServices),
      },
      pricingFactors: {
        complexity: projectComplexity ?? "moderate",
        clientType: clientType ?? "small-business",
        selectedRate: `$${hourlyRate}/hr`,
      },
      terms: [
        "Payment: 50% upfront, 50% on delivery",
        "Revisions: 2 rounds included per milestone",
        "Communication: Daily async updates via preferred channel",
        "Timeline: Estimated based on scope; adjustments discussed upfront",
        "Tool subscriptions are billed at cost — no markup",
        "Usage-based API, SMS, and email costs are estimated separately from fixed subscription costs",
        "Cancellation: 1-week notice required",
      ],
    };

    // Server-side delivery: generate the PDF here and route it via GHL
    // (hosted PDF + CRM contact + proposal-sent tag + GHL-sent email, with
    // Resend fallback) so nothing depends on client-side buttons.
    let delivery: import("../contract-delivery").DeliveryResult = {
      sent: false,
      method: "none",
      sentTo: clientEmail ?? null,
      pdfUrl: null,
    };
    if (clientEmail) {
      try {
        const { generateContractPDF } = await import(
          "@/components/tools/ContractPDF"
        );
        const blob = await generateContractPDF(contract);
        const pdfBuffer = Buffer.from(await blob.arrayBuffer());
        const { deliverContract } = await import("../contract-delivery");
        delivery = await deliverContract(contract, pdfBuffer);
      } catch (err) {
        console.error("[generateContract] delivery failed:", err);
        const { notifyDeliveryFailure } = await import("../contract-delivery");
        notifyDeliveryFailure(contract);
      }
    }

    return { contract, delivery: { ...delivery, statusLine: deliveryStatusLine(delivery, clientEmail) } };
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

CRITICAL: Do not invent specific numbers — no "X hours saved per week," no percentage conversion-rate lifts, no dollar figures — unless the business owner actually provided data to calculate them from. You were only given industry, goal, and current tools; there is no usage data here. Use qualitative, directional language instead (e.g. "meaningfully reduces manual data entry" rather than "saves 10 hours per week"). A specific-sounding number you made up is worse than an honest qualitative claim — it damages credibility if it's wrong.

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

## Expected Impact
Describe the directional impact qualitatively (e.g. "fewer missed leads," "faster response times," "less manual reconciliation work") — no invented numbers.`,
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

export const sharePrepSheet = tool({
  description:
    "Qualifies a visitor and returns a prep sheet link only after required details are present. " +
    "Call this ONLY when the visitor EXPLICITLY " +
    "asks for a prep sheet, says something like 'I don't know where to start', or asks you to 'assess my " +
    "business' / 'send me the form'. Do NOT call this just because a visitor describes an automation need " +
    "or seems interested — answer their question directly first (see Response Structure). " +
    "NEVER write a /prep URL, or any placeholder/example version of one, directly in your text response — " +
    "the ONLY valid way to give the visitor this link is calling this tool, which renders a clickable card. " +
    "Required qualification fields: clientName, clientEmail, and processDescription. Reuse anything already " +
    "provided in the conversation; do not invent missing fields.",
  inputSchema: z.object({
    clientName: z
      .string()
      .optional()
      .describe("The visitor's real name from the conversation. Do not invent a placeholder."),
    clientEmail: z
      .string()
      .optional()
      .describe("The visitor's email address from the conversation. Do not invent a placeholder."),
    businessName: z
      .string()
      .optional()
      .describe("The visitor's business or company name, if provided or applicable."),
    processDescription: z
      .string()
      .optional()
      .describe("Brief description of the process, workflow, or task the visitor wants to automate or improve."),
    clientSlug: z
      .string()
      .optional()
      .describe("A URL-safe slug for tracking, e.g. 'acme-corp'"),
  }),
  execute: async ({ clientName, clientEmail, businessName, processDescription, clientSlug }) => {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "https://www.buildwithjazz.com";

    return {
      prepSheet: buildPrepSheetResult(
        { clientName, clientEmail, businessName, processDescription, clientSlug },
        base,
      ),
    };
  },
});
