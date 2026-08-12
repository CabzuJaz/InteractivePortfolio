"use client";

import type { ComponentProps } from "react";
import type { UIMessage } from "ai";
import { Projects } from "@/components/tools/Projects";
import { Skills } from "@/components/tools/Skills";
import { Resume } from "@/components/tools/Resume";
import { Contact } from "@/components/tools/Contact";
import { Me } from "@/components/tools/Me";
import { Fun } from "@/components/tools/Fun";
import { Availability } from "@/components/tools/Availability";
import { BusinessAnalysis } from "@/components/tools/BusinessAnalysis";
import { Contract } from "@/components/tools/Contract";
import { PrepSheet } from "@/components/tools/PrepSheet";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

type ToolPart = { type: string; state: string; toolName: string; output?: unknown };

const toolSkeletonLabels: Record<string, string> = {
  getProjects: "Pulling up my projects…",
  getSkills: "Loading my skill set…",
  getResume: "Fetching my resume…",
  getContact: "Getting contact info…",
  getMe: "Loading my profile…",
  getFun: "Finding fun facts…",
  getAvailability: "Checking availability…",
  analyzeBusiness: "Analyzing your business for automation opportunities…",
  generateContract: "Preparing your contract proposal…",
  sharePrepSheet: "Checking prep sheet details…",
};

/**
 * Tool output arrives untyped from the model at runtime, so each case asserts
 * the shape its own renderer declares. Every tool returns an object whose keys
 * are exactly that component's props, which keeps the assertion tied to the
 * component's contract instead of a hand-maintained copy of it.
 */
function renderToolOutput(toolName: string, data: unknown) {
  switch (toolName) {
    case "getProjects":
      return <Projects {...(data as ComponentProps<typeof Projects>)} />;
    case "getSkills":
      return <Skills {...(data as ComponentProps<typeof Skills>)} />;
    case "getResume":
      return <Resume {...(data as ComponentProps<typeof Resume>)} />;
    case "getContact":
      return <Contact {...(data as ComponentProps<typeof Contact>)} />;
    case "getMe":
      return <Me {...(data as ComponentProps<typeof Me>)} />;
    case "getFun":
      return <Fun {...(data as ComponentProps<typeof Fun>)} />;
    case "getAvailability":
      return <Availability {...(data as ComponentProps<typeof Availability>)} />;
    case "analyzeBusiness":
      return <BusinessAnalysis {...(data as ComponentProps<typeof BusinessAnalysis>)} />;
    case "sharePrepSheet":
      return <PrepSheet {...(data as ComponentProps<typeof PrepSheet>)} />;
    case "generateContract":
      return <Contract {...(data as ComponentProps<typeof Contract>)} />;
    default:
      return null;
  }
}

interface ToolRendererProps {
  part: UIMessage["parts"] extends readonly (infer P)[] ? P : never;
}

export function ToolRenderer({ part }: ToolRendererProps) {
  const p = part as unknown as ToolPart;
  if (!p.type.startsWith("tool-")) return null;

  // Output available
  if (p.state === "output-available" && p.output) {
    return renderToolOutput(p.toolName, p.output);
  }

  // Loading / other states → show skeleton
  if (p.state !== "output-denied") {
    return <ToolSkeleton label={toolSkeletonLabels[p.toolName] ?? "Loading…"} />;
  }

  return null;
}
