"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { DashboardContent } from "@/app/dashboard/page";

function ClientDashboardContent() {
  const params = useParams<{ slug: string }>();

  return <DashboardContent projectSlug={params.slug} />;
}

export default function ClientDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      }
    >
      <ClientDashboardContent />
    </Suspense>
  );
}
