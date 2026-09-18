"use client";

import type { ComponentProps } from "react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
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
  if (!isToolUIPart(part)) return null;

  // Static tool parts carry their name only in the part type ("tool-getProjects");
  // there is no toolName field on them, so read it through the SDK helper.
  const toolName = getToolName(part);

  if (part.state === "output-available" && part.output) {
    return renderToolOutput(toolName, part.output);
  }

  // A failed or denied call gets no card; the model's reply explains it.
  // Without this, an errored tool would sit on a loading skeleton forever.
  if (part.state === "output-error" || part.state === "output-denied") {
    return null;
  }

  return <ToolSkeleton label={toolSkeletonLabels[toolName] ?? "Loading…"} />;
}
