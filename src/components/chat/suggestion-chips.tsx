"use client";

import { motion } from "framer-motion";
import { Workflow, FileText, ClipboardList } from "lucide-react";

interface SuggestionChipsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

const suggestions = [
  {
    label: "Can AI help me?",
    query: "Can AI help my business? I'm not sure where to start.",
    icon: Workflow,
  },
  {
    label: "Cut costs",
    query: "How do I reduce operational costs with automation?",
    icon: Workflow,
  },
  {
    label: "Find bottlenecks",
    query: "My team is growing but productivity isn't keeping up. Where should I look for bottlenecks?",
    icon: Workflow,
  },
  {
    label: "Automate tasks",
    query: "I spend a lot of time on repetitive tasks. Can those be automated?",
    icon: Workflow,
  },
  {
    label: "Scale without hiring",
    query: "How can I scale my operations without hiring more people?",
    icon: Workflow,
  },
  {
    label: "Get a quote",
    query: "I'd like to hire you for a project. Can you send me a contract?",
    icon: FileText,
  },
  {
    label: "Prep sheet",
    query: "I'm interested in automation but not sure where to start. Can you give me a prep sheet?",
    icon: ClipboardList,
  },
];

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 pb-2 px-4 justify-center">
      {suggestions.map((s, i) => (
        <motion.button
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 260, damping: 24 }}
          onClick={() => onSelect(s.query)}
          disabled={disabled}
          className="flex items-center gap-1.5 shrink-0 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs hover:bg-accent hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <s.icon className="w-3 h-3 text-muted-foreground" />
          {s.label}
        </motion.button>
      ))}
    </div>
  );
}
