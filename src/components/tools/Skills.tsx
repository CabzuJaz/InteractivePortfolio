"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { SkillCategory } from "@/data/skills";

interface SkillsProps {
  skills: SkillCategory[];
}

const levelLabels: Record<number, string> = {
  1: "Familiar",
  2: "Proficient",
  3: "Expert",
};

const levelColors: Record<number, string> = {
  1: "bg-muted text-muted-foreground",
  2: "bg-primary/10 text-primary",
  3: "bg-primary text-primary-foreground",
};

const categoryIcons: Record<string, string> = {
  "AI & Automation": "🤖",
  Programming: "💻",
  "APIs & Integrations": "🔌",
  "Backend & Data": "🗄️",
  Tools: "🛠️",
  Frontend: "🎨",
  Backend: "⚙️",
  "AI/ML": "🧠",
  DevOps: "🚀",
  Soft: "🤝",
};

export function Skills({ skills }: SkillsProps) {
  return (
    <div className="w-full space-y-6">
      {skills.map((category, ci) => (
        <motion.div
          key={category.category}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.08, type: "spring" as const, stiffness: 260, damping: 24 }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {categoryIcons[category.category] ?? "📦"} {category.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.items.map((skill) => (
              <div key={skill.name} className="flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className={`rounded-full px-3 py-1 ${skill.level ? levelColors[skill.level] : ""}`}
                >
                  {skill.name}
                </Badge>
                {skill.level && (
                  <span className="text-xs text-muted-foreground">
                    {levelLabels[skill.level]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
