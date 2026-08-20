"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, Layers3, Send, UserRound, Workflow } from "lucide-react";

interface SuggestionChipsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

const suggestions = [
  {
    label: "Selected work",
    query: "Show me your strongest projects and the results they delivered.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Skills & tools",
    query: "What are your strongest skills and tools?",
    icon: Layers3,
  },
  {
    label: "About Jazzmin",
    query: "Tell me about your background and how you got into AI automation.",
    icon: UserRound,
  },
  {
    label: "Improve my workflow",
    query: "Can you help me identify automation opportunities in my current workflow?",
    icon: Workflow,
  },
  {
    label: "Start a project",
    query: "I'd like to discuss an automation project with you.",
    icon: Send,
  },
] as const;

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion.label}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reduceMotion ? 0 : index * 0.035,
            type: "spring" as const,
            stiffness: 260,
            damping: 24,
          }}
          onClick={() => onSelect(suggestion.query)}
          disabled={disabled}
          className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <suggestion.icon className="h-3.5 w-3.5 text-primary" />
          {suggestion.label}
        </motion.button>
      ))}
    </div>
  );
}
