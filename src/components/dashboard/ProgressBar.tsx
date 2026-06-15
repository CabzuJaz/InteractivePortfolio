"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-semibold text-primary">{percentage}%</span>
      </div>
      <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {completed} of {total} deliverables completed
      </p>
    </div>
  );
}
