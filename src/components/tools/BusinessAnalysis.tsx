"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Building2, Target, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BusinessAnalysisProps {
  analysis: {
    industry: string;
    goal: string;
    currentTools: string;
    content: string;
  };
}

export function BusinessAnalysis({ analysis }: BusinessAnalysisProps) {
  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
        className="rounded-2xl border border-border/50 bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold">Business Automation Analysis</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              {analysis.industry}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              {analysis.goal}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Wrench className="w-3 h-3" />
              {analysis.currentTools}
            </Badge>
          </div>
        </div>

        {/* Analysis content */}
        <div className="p-5 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {analysis.content}
          </ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
}
