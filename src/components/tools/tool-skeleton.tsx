"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ToolSkeletonProps {
  label: string;
}

export function ToolSkeleton({ label }: ToolSkeletonProps) {
  return (
    <div className="w-full rounded-2xl border border-border/50 bg-muted/30 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
}
