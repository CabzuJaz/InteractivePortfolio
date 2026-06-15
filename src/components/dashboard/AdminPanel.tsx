"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Deliverable } from "@/lib/types";

interface AdminPanelProps {
  deliverables: Deliverable[];
  contactId: string;
  adminKey: string;
  onUpdate: () => void;
}

export function AdminPanel({ deliverables, contactId, adminKey, onUpdate }: AdminPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;

    setSaving(true);
    const newDeliverable: Deliverable = {
      id: `del_${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: "pending",
    };

    const updated = [...deliverables, newDeliverable];

    await fetch("/api/dashboard", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ contactId, deliverables: updated }),
    });

    setNewTitle("");
    setNewDescription("");
    setIsAdding(false);
    setSaving(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    const updated = deliverables.filter((d) => d.id !== id);

    await fetch("/api/dashboard", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ contactId, deliverables: updated }),
    });

    onUpdate();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Manage Deliverables
        </p>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title"
              className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!newTitle.trim() || saving}
                className="gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        {deliverables.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 group"
          >
            <Badge
              variant="secondary"
              className={`text-xs ${
                d.status === "completed"
                  ? "bg-green-500/15 text-green-500"
                  : d.status === "in-progress"
                  ? "bg-blue-500/15 text-blue-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {d.status}
            </Badge>
            <span className="flex-1 text-sm truncate">{d.title}</span>
            <button
              onClick={() => handleDelete(d.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
