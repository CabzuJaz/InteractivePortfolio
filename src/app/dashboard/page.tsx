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

function DashboardContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const adminKey = searchParams.get("admin");
  const [isAdmin, setIsAdmin] = useState(false);

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

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProject = useCallback(async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/dashboard?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch {
      // silent
    }
  }, [email]);

  useEffect(() => {
    if (!email) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/dashboard?email=${encodeURIComponent(email)}`);
        if (cancelled) return;
        if (!res.ok) {
          setError("Project not found. Check the email address.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setProject(data.project);
      } catch {
        if (!cancelled) setError("Failed to load project.");
      }
      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [email]);

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

    await fetch("/api/dashboard", {
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

    fetchProject();
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
                  onToggle={handleToggleDeliverable}
                />
              ))}
            </div>
          )}

          {/* Admin Panel */}
          {isAdmin && (
            <div className="pt-4 border-t border-border/50">
              <AdminPanel
                deliverables={project.deliverables}
                contactId={project.contactId}
                adminKey={adminKey || ""}
                onUpdate={fetchProject}
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
