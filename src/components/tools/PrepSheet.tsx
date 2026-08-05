"use client";

import { motion } from "framer-motion";
import { AlertCircle, ClipboardList, ExternalLink } from "lucide-react";
import type { PrepSheetResult } from "@/lib/prep-sheet";

interface LegacyPrepSheetData {
  status?: never;
  clientName?: string | null;
  url: string;
}

interface PrepSheetProps {
  prepSheet: PrepSheetResult | LegacyPrepSheetData;
}

function isCurrentPrepSheetData(
  prepSheet: PrepSheetResult | LegacyPrepSheetData,
): prepSheet is PrepSheetResult {
  return "status" in prepSheet && typeof prepSheet.status === "string";
}

export function PrepSheet({ prepSheet }: PrepSheetProps) {
  if (isCurrentPrepSheetData(prepSheet) && prepSheet.status === "needs_info") {
    return (
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          className="rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="p-5 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Prep Sheet Details Needed</h3>
                <p className="text-sm text-muted-foreground">No document was created yet.</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground">{prepSheet.message}</p>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              {prepSheet.missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ol>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isCurrentPrepSheetData(prepSheet) && prepSheet.status === "error") {
    return (
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
          className="rounded-2xl border border-destructive/40 bg-card overflow-hidden"
        >
          <div className="p-5 border-b border-destructive/30 bg-destructive/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Prep Sheet Not Created</h3>
                <p className="text-sm text-muted-foreground">You can retry after sharing the details.</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm text-muted-foreground">{prepSheet.message}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const fullUrl = isCurrentPrepSheetData(prepSheet)
    ? prepSheet.downloadUrl
    : prepSheet.url;
  const isValidUrl = fullUrl.trim().length > 0;

  if (!isValidUrl) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-destructive/40 bg-card p-5">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            I couldn&apos;t generate the prep sheet right now. No document was created.
          </p>
        </div>
      </div>
    );
  }

  const clientName = prepSheet.clientName ?? null;
  const previewItems =
    isCurrentPrepSheetData(prepSheet)
      ? prepSheet.previewItems
      : [
          "Your current lead flow and tools",
          "Where time and leads are slipping",
          "What successful automation looks like for you",
        ];

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
              <h3 className="font-semibold text-lg">Automation Prep Sheet</h3>
              <p className="text-sm text-muted-foreground">
                {clientName
                  ? `Personalized for ${clientName}`
                  : "Map your process before we build"}
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
            {previewItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>{item}</span>
              </div>
            ))}
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
