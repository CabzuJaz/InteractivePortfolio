"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface ArchitectureFlowProps {
  /** Pipeline string from project data, e.g. "Form → n8n → CRM". */
  architecture: string;
  className?: string;
}

export interface FlowStep {
  label: string;
  /** Direction of the connector that precedes this step; null for the first step. */
  direction: "forward" | "backward" | null;
}

const SEPARATOR = /(→|->|=>|←|<-)/;

/**
 * Splits a pipeline string into steps, preserving each arrow's direction so
 * inbound sources (rendered with ←) keep their meaning.
 */
export function parseArchitecture(architecture: string): FlowStep[] {
  const tokens = architecture.split(SEPARATOR).map((t) => t.trim());
  const steps: FlowStep[] = [];
  let pending: FlowStep["direction"] = null;

  for (const token of tokens) {
    if (!token) continue;
    if (SEPARATOR.test(token) && token.length <= 2) {
      pending = token === "←" || token === "<-" ? "backward" : "forward";
      continue;
    }
    steps.push({ label: token, direction: steps.length === 0 ? null : pending });
    pending = null;
  }

  return steps;
}

/**
 * Renders a project's architecture string as a stepped flow diagram.
 * Used as the card visual for projects with no screenshot, so a missing image
 * file can never leave a broken <img> in the card.
 */
export function ArchitectureFlow({ architecture, className = "" }: ArchitectureFlowProps) {
  const steps = parseArchitecture(architecture);
  if (steps.length === 0) return null;

  const readable = steps
    .map((s, i) => (i === 0 ? s.label : `${s.direction === "backward" ? "from" : "then"} ${s.label}`))
    .join(", ");

  return (
    <div
      className={`rounded-xl border border-border bg-muted/30 p-4 ${className}`}
      role="img"
      aria-label={`Architecture flow: ${readable}`}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
        Pipeline
      </p>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-hidden="true">
        {steps.map((step, i) => (
          <li key={`${step.label}-${i}`} className="flex items-center gap-2">
            {step.direction && (
              <span className="shrink-0 text-muted-foreground">
                {step.direction === "backward" ? (
                  <ArrowLeft className="h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </span>
            )}
            <span
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium leading-snug sm:text-[0.8125rem] ${
                i === 0
                  ? "bg-primary/10 text-primary"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
