"use client";

import { motion } from "framer-motion";
import { CheckCircle, ChevronDown, Circle, CircleDot, Clock } from "lucide-react";
import type { Deliverable } from "@/lib/types";

interface DeliverableItemProps {
  deliverable: Deliverable;
  index: number;
  isAdmin: boolean;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onToggle?: (id: string) => void;
}

export function DeliverableItem({
  deliverable,
  index,
  isAdmin,
  isExpanded,
  onExpand,
  onToggle,
}: DeliverableItemProps) {
  const statusIcon = {
    pending: <Circle className="w-5 h-5 text-muted-foreground" />,
    "in-progress": <CircleDot className="w-5 h-5 text-blue-500" />,
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
      className={`rounded-xl transition-colors ${statusBg[deliverable.status]}`}
    >
      <button
        type="button"
        onClick={() => onExpand(deliverable.id)}
        className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-expanded={isExpanded}
      >
        <div className="mt-0.5 shrink-0">{statusIcon[deliverable.status]}</div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              deliverable.status === "completed"
                ? "line-through text-muted-foreground"
                : ""
            }`}
          >
            {deliverable.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs capitalize text-muted-foreground">
              {deliverable.status.replace("-", " ")}
            </span>
            {deliverable.estimatedTime && deliverable.status !== "completed" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <Clock className="h-3 w-3" />
                {deliverable.estimatedTime}
              </span>
            )}
          </div>
        </div>
        <span className="hidden shrink-0 text-xs font-semibold text-primary sm:inline">
          {isExpanded ? "Hide details" : "View details"}
        </span>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-11 pb-3 pr-3">
          {deliverable.description && (
            <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
              {deliverable.description}
            </p>
          )}
          {deliverable.completedAt && (
            <p className="mt-2 text-xs text-green-500">
              Completed {new Date(deliverable.completedAt).toLocaleDateString()}
            </p>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onToggle?.(deliverable.id)}
              className="mt-3 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {deliverable.status === "completed" ? "Reopen task" : "Mark complete"}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
