"use client";

import { motion } from "framer-motion";
import { ClipboardList, ExternalLink } from "lucide-react";

interface PrepSheetData {
  url: string;
  clientName?: string | null;
}

interface PrepSheetProps {
  prepSheet: PrepSheetData;
}

export function PrepSheet({ prepSheet }: PrepSheetProps) {
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${prepSheet.url}`
      : `https://www.buildwithjazz.com${prepSheet.url}`;

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
        className="rounded-2xl border border-border/50 bg-card overflow-hidden"
      >
        <div className="p-5 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Lead Automation Prep Sheet</h3>
              <p className="text-sm text-muted-foreground">
                {prepSheet.clientName
                  ? `Personalized for ${prepSheet.clientName}`
                  : "Map your lead flow before we build"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Answer a few questions about how you currently handle leads. This
            helps me design the right automation for your business.
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>Where leads come from today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>How fast you respond</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>Where leads might be leaking</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>Your tools and current setup</span>
            </div>
          </div>

          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            Open Prep Sheet
          </a>
        </div>
      </motion.div>
    </div>
  );
}
