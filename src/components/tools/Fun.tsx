"use client";

import { motion } from "framer-motion";
import { Brain, Layers, Shield, Zap, Sparkles } from "lucide-react";
import type { Hobby } from "@/data/fun";

interface FunProps {
  fun: {
    hobbies: Hobby[];
    facts: string[];
    photos: string[];
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  layers: Layers,
  shield: Shield,
  zap: Zap,
  code: Brain,
  users: Shield,
  heart: Shield,
  coffee: Brain,
  mountain: Brain,
  camera: Brain,
};

export function Fun({ fun }: FunProps) {
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fun.hobbies.map((hobby, i) => {
          const Icon = iconMap[hobby.icon] ?? Sparkles;
          return (
            <motion.div
              key={hobby.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring" as const, stiffness: 260, damping: 24 }}
              className="rounded-2xl border border-border/50 bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{hobby.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{hobby.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" />
          Fun Facts
        </h3>
        <ul className="space-y-2">
          {fun.facts.map((fact, i) => (
            <motion.li
              key={fact}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: "spring" as const, stiffness: 260, damping: 24 }}
              className="text-sm text-muted-foreground"
            >
              • {fact}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
