"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Briefcase,
  Calendar,
  Lock,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/components/dashboard/PaymentStatus";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { DeliverableItem } from "@/components/dashboard/DeliverableItem";
import { AdminPanel } from "@/components/dashboard/AdminPanel";
import type { ProjectData } from "@/lib/types";

export function DashboardContent({ projectSlug }: { projectSlug?: string }) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const slug = projectSlug ?? searchParams.get("slug");
  const adminKey = searchParams.get("admin");
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedDeliverableId, setExpandedDeliverableId] = useState<string | null>(null);

  // Verify admin key server-side
  useEffect(() => {
    if (!adminKey) return;
    fetch("/api/dashboard/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: adminKey }),
    })
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.valid === true))
      .catch(() => setIsAdmin(false));
  }, [adminKey]);

  // Access code for a private dashboard. Held for the tab only — a client
  // following their link again re-enters it rather than leaving it on disk.
  const [accessCode, setAccessCode] = useState("");
  const [codeRequired, setCodeRequired] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeInput, setCodeInput] = useState("");

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminError, setAdminError] = useState("");

  /**
   * Single source of truth for loading the project. Both the initial load and
   * the post-save refresh go through here, so the request is built once and a
   * failure is always raised rather than silently leaving stale data on screen.
   */
  const loadProject = useCallback(async (code?: string): Promise<ProjectData> => {
    const query = slug
      ? `slug=${encodeURIComponent(slug)}`
      : `email=${encodeURIComponent(email ?? "")}`;

    const headers: HeadersInit = {};
    const presented = code ?? accessCode;
    if (presented) headers["x-access-code"] = presented;
    if (adminKey) headers["x-admin-key"] = adminKey;

    const res = await fetch(`/api/dashboard?${query}`, { headers });

    if (res.status === 401) {
      const err = new Error("access-code-required");
      err.name = "AccessCodeRequired";
      throw err;
    }
    if (!res.ok) {
      throw new Error("Project not found. Check the dashboard link.");
    }

    const data = await res.json();
    return data.project as ProjectData;
  }, [accessCode, adminKey, email, slug]);

  /** Re-reads the project after a successful save, reporting a failed refresh. */
  const refreshProject = useCallback(async () => {
    try {
      setProject(await loadProject());
    } catch {
      setAdminError(
        "Saved, but the view could not be refreshed. Reload the page to see the change.",
      );
    }
  }, [loadProject]);

  useEffect(() => {
    if (!email && !slug) return;

    let cancelled = false;

    loadProject()
      .then((loaded) => {
        if (!cancelled) setProject(loaded);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && err.name === "AccessCodeRequired") {
          setCodeRequired(true);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load project.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [email, slug, loadProject]);

  const handleToggleDeliverable = async (id: string) => {
    if (!project || !isAdmin || !adminKey) return;

    const updated = project.deliverables.map((d) => {
      if (d.id === id) {
        const newStatus =
          d.status === "completed" ? "pending" : "completed";
        return {
          ...d,
          status: newStatus,
          completedAt:
            newStatus === "completed" ? new Date().toISOString() : undefined,
        };
      }
      return d;
    });

    setAdminError("");
    const res = await fetch("/api/dashboard", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({
        contactId: project.contactId,
        deliverables: updated,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAdminError(data.error || "Failed to update task status.");
      return;
    }

    await refreshProject();
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = codeInput.trim();
    if (!entered) return;

    setCodeError("");
    try {
      const loaded = await loadProject(entered);
      setAccessCode(entered);
      setProject(loaded);
      setCodeRequired(false);
    } catch (err) {
      setCodeError(
        err instanceof Error && err.name === "AccessCodeRequired"
          ? "That code doesn't match. Check the one you were sent."
          : "Could not load the dashboard. Try again.",
      );
    }
  };

  const handleExpandDeliverable = (id: string) => {
    setExpandedDeliverableId((current) => (current === id ? null : id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  if (codeRequired) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-5 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold">This dashboard is private</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the access code from your project link.
          </p>
        </div>
        <form onSubmit={handleSubmitCode} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="password"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Access code"
            aria-label="Access code"
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
          {codeError && <p className="text-xs text-destructive">{codeError}</p>}
          <Button type="submit" disabled={!codeInput.trim()}>
            View dashboard
          </Button>
        </form>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-4 px-6">
        <Briefcase className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">{error || "Project not found"}</p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const completedCount = project.deliverables.filter(
    (d) => d.status === "completed",
  ).length;

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 glass-strong">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Project Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {project.projectName}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Badge variant="secondary" className="bg-primary/15 text-primary text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Project Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{project.projectName}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                For {project.clientName}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={
                project.downpaymentPaid
                  ? "bg-green-500/15 text-green-500"
                  : "bg-yellow-500/15 text-yellow-500"
              }
            >
              {project.downpaymentPaid ? "Active" : "Awaiting Payment"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {project.clientEmail}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Started {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card p-6"
        >
          <PaymentStatus
            totalCost={project.totalCost}
            amountPaid={project.amountPaid}
            balanceDue={project.balanceDue}
            downpaymentPaid={project.downpaymentPaid}
            finalPaymentPaid={project.finalPaymentPaid}
          />
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/50 bg-card p-6"
        >
          <ProgressBar
            completed={completedCount}
            total={project.deliverables.length}
          />
        </motion.div>

        {/* Deliverables */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
        >
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            Deliverables
          </p>

          {project.deliverables.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No deliverables set yet.
            </p>
          ) : (
            <div className="space-y-1">
              {project.deliverables.map((d, i) => (
                <DeliverableItem
                  key={d.id}
                  deliverable={d}
                  index={i}
                  isAdmin={isAdmin}
                  isExpanded={expandedDeliverableId === d.id}
                  onExpand={handleExpandDeliverable}
                  onToggle={handleToggleDeliverable}
                />
              ))}
            </div>
          )}

          {/* Admin Panel */}
          {isAdmin && (
            <div className="pt-4 border-t border-border/50">
              {adminError && (
                <p className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {adminError}
                </p>
              )}
              <AdminPanel
                deliverables={project.deliverables}
                contactId={project.contactId}
                adminKey={adminKey || ""}
                onError={setAdminError}
                onUpdate={refreshProject}
              />
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              BuildWithJazz.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-dvh">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
