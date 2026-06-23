"use client";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyToolPart = { type: string; state: string; toolName: string; output?: any };

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
  sharePrepSheet: "Generating your prep sheet…",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderToolOutput(toolName: string, data: any) {
  switch (toolName) {
    case "getProjects":
      return <Projects projects={data.projects} />;
    case "getSkills":
      return <Skills skills={data.skills} />;
    case "getResume":
      return <Resume resume={data.resume} />;
    case "getContact":
      return <Contact contact={data.contact} />;
    case "getMe":
      return <Me persona={data.persona} />;
    case "getFun":
      return <Fun fun={data.fun} />;
    case "getAvailability":
      return (
        <Availability
          status={data.status}
          lookingFor={data.lookingFor}
          whyHireMe={data.whyHireMe}
          availability={data.availability}
          location={data.location}
        />
      );
    case "analyzeBusiness":
      return <BusinessAnalysis analysis={data.analysis} />;
    case "sharePrepSheet":
      return <PrepSheet prepSheet={data.prepSheet} />;
    case "generateContract":
      return <Contract contract={data.contract} />;
    default:
      return null;
  }
}

interface ToolRendererProps {
  part: UIMessage["parts"] extends readonly (infer P)[] ? P : never;
}

export function ToolRenderer({ part }: ToolRendererProps) {
  const p = part as unknown as AnyToolPart;
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
