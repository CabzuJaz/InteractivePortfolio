"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
}

interface DeliverableItemProps {
  deliverable: Deliverable;
  index: number;
  isAdmin: boolean;
  onToggle?: (id: string) => void;
}

export function DeliverableItem({
  deliverable,
  index,
  isAdmin,
  onToggle,
}: DeliverableItemProps) {
  const statusIcon = {
    pending: <Circle className="w-5 h-5 text-muted-foreground" />,
    "in-progress": <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
    completed: <CheckCircle className="w-5 h-5 text-green-500" />,
  };

  const statusBg = {
    pending: "",
    "in-progress": "bg-blue-500/5",
    completed: "bg-green-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${statusBg[deliverable.status]} ${
        isAdmin ? "cursor-pointer hover:bg-accent/50" : ""
      }`}
      onClick={() => isAdmin && onToggle?.(deliverable.id)}
    >
      <div className="mt-0.5 shrink-0">{statusIcon[deliverable.status]}</div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            deliverable.status === "completed"
              ? "line-through text-muted-foreground"
              : ""
          }`}
        >
          {deliverable.title}
        </p>
        {deliverable.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {deliverable.description}
          </p>
        )}
        {deliverable.completedAt && (
          <p className="text-xs text-green-500 mt-1">
            Completed {new Date(deliverable.completedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}
