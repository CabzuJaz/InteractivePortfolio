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
    color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40",
    iconColor: "text-cyan-500",
  },
  {
    label: "Cut costs",
    query: "How do I reduce operational costs with automation?",
    icon: Workflow,
    color: "from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40",
    iconColor: "text-emerald-500",
  },
  {
    label: "Find bottlenecks",
    query: "My team is growing but productivity isn't keeping up. Where should I look for bottlenecks?",
    icon: Workflow,
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40",
    iconColor: "text-amber-500",
  },
  {
    label: "Automate tasks",
    query: "I spend a lot of time on repetitive tasks. Can those be automated?",
    icon: Workflow,
    color: "from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40",
    iconColor: "text-violet-500",
  },
  {
    label: "Scale without hiring",
    query: "How can I scale my operations without hiring more people?",
    icon: Workflow,
    color: "from-rose-500/10 to-pink-500/10 border-rose-500/20 hover:border-rose-500/40",
    iconColor: "text-rose-500",
  },
  {
    label: "Get a quote",
    query: "I'd like to hire you for a project. Can you send me a contract?",
    icon: FileText,
    color: "from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40",
    iconColor: "text-primary",
  },
  {
    label: "Prep sheet",
    query: "I'm interested in automation but not sure where to start. Can you give me a prep sheet?",
    icon: ClipboardList,
    color: "from-teal-500/10 to-cyan-500/10 border-teal-500/20 hover:border-teal-500/40",
    iconColor: "text-teal-500",
  },
];

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2.5 pb-3 px-4 justify-center">
      {suggestions.map((s, i) => (
        <motion.button
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 260, damping: 24 }}
          onClick={() => onSelect(s.query)}
          disabled={disabled}
          className={`flex items-center gap-2 shrink-0 rounded-full border bg-linear-to-r px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${s.color}`}
        >
          <s.icon className={`w-4 h-4 ${s.iconColor}`} />
          <span className="text-foreground/90">{s.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
