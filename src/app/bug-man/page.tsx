"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bug,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Database,
  Inbox,
  LockKeyhole,
  MessageSquareText,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type View = "start" | "access" | "plan";
type Approval = "approved" | "hold" | null;

type AccessFormState = {
  system: string;
  accessArea: string;
  accountEmail: string;
  loginUrl: string;
  permission: string;
  credentialReference: string;
  submittedBy: string;
  notes: string;
};

const requiredSystems = ["Answering service", "GorillaDesk", "WordPress", "Slack", "Discord"] as const;

const accessSystemPresets: Record<string, Pick<AccessFormState, "accessArea" | "permission">> = {
  "Answering service": {
    accessArea: "Answering-service texts and emails",
    permission: "Sample messages and access to the approved delivery inbox or integration",
  },
  GorillaDesk: {
    accessArea: "GorillaDesk CRM and API",
    permission: "Customers, leads, notes, custom fields, and API access",
  },
  WordPress: {
    accessArea: "WordPress / WPForms",
    permission: "Administrator access or a role that can review forms and configure webhooks",
  },
  Slack: {
    accessArea: "General Slack workspace",
    permission: "Create and manage dedicated Bug-Man lead and alert channels",
  },
  Discord: {
    accessArea: "Dedicated Bug-Man response channel",
    permission: "Create and use a channel webhook for internal access-response alerts",
  },
};

const initialAccessForm: AccessFormState = {
  system: "GorillaDesk",
  accountEmail: "",
  loginUrl: "",
  credentialReference: "",
  submittedBy: "Larry",
  notes: "",
  ...accessSystemPresets.GorillaDesk,
};

const milestones = [
  ["01", "Access & feasibility", "Confirm source access, APIs, and Tyson’s handling rules.", "4h"],
  ["02", "Capture & GorillaDesk", "Normalize, match, create, or update each qualified lead.", "8h"],
  ["03", "Slack & Discord", "Route lead notifications and visible failure alerts.", "5h"],
  ["04", "WordPress connection", "Connect approved forms after the answering-service path works.", "3h"],
  ["05", "Test & handoff", "Run controlled tests, document, and walk through with Tyson.", "4h"],
] as const;

const workflow = [
  { icon: Inbox, label: "Capture", detail: "Texts, emails, or WPForms" },
  { icon: SlidersHorizontal, label: "Clean", detail: "Normalize customer details" },
  { icon: Search, label: "Match", detail: "Check phone and email" },
  { icon: Database, label: "Update", detail: "Create or update GorillaDesk" },
  { icon: Bell, label: "Alert", detail: "Slack and Discord" },
] as const;

function BugMark() {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <Bug className="size-5" strokeWidth={2.4} />
    </div>
  );
}

function AccessDetailsForm({ onSubmitted }: { onSubmitted: (system: string) => void }) {
  const [form, setForm] = useState<AccessFormState>(initialAccessForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ tone: "success" | "error" | "warning"; message: string } | null>(null);

  const updateField = (field: keyof AccessFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setResult(null);
  };

  const selectSystem = (system: string) => {
    setForm((current) => ({ ...current, system, ...accessSystemPresets[system] }));
    setResult(null);
  };

  const submitAccess = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    const honeypot = new FormData(event.currentTarget).get("website");

    try {
      const response = await fetch("/api/bug-man/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: honeypot }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string; notificationSent?: boolean } | null;

      if (!response.ok) {
        throw new Error(data?.error || "These details could not be saved.");
      }

      onSubmitted(form.system);
      setResult(data?.notificationSent === false
        ? { tone: "warning", message: "Saved privately. The Discord alert needs attention, but your response is safe." }
        : { tone: "success", message: "Done—saved privately and Jazz was notified in Discord." });
      setForm((current) => ({
        ...initialAccessForm,
        system: current.system,
        submittedBy: current.submittedBy,
        ...accessSystemPresets[current.system],
      }));
    } catch (error) {
      setResult({
        tone: "error",
        message: error instanceof Error ? error.message : "These details could not be saved.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
  const resultClass = result?.tone === "success"
    ? "border-primary/25 bg-primary/10 text-primary"
    : result?.tone === "warning"
      ? "border-primary/25 bg-primary/[0.06] text-foreground"
      : "border-destructive/25 bg-destructive/10 text-destructive";

  return (
    <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
      <CardContent className="p-5 sm:p-7">
        <form className="space-y-6" onSubmit={submitAccess}>
          <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
            <label htmlFor="bug-man-website">Website</label>
            <input id="bug-man-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <p className="text-sm font-semibold">1. Choose the system</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {requiredSystems.map((system) => (
                <button
                  key={system}
                  type="button"
                  aria-pressed={form.system === system}
                  onClick={() => selectSystem(system)}
                  className={cn(
                    "flex min-h-11 items-center justify-between rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition",
                    form.system === system
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {system}
                  {form.system === system && <Check className="size-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-sm font-semibold">2. Tell us where the access belongs</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Use the account information Jazz should expect. All fields except the permission are optional.</p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium">
                Account or login email
                <input className={fieldClass} type="email" autoComplete="email" placeholder="larry@example.com" value={form.accountEmail} onChange={(event) => updateField("accountEmail", event.target.value)} maxLength={254} />
              </label>

              <label className="text-sm font-medium">
                Login page
                <input className={fieldClass} type="url" inputMode="url" placeholder="https://example.com/login" value={form.loginUrl} onChange={(event) => updateField("loginUrl", event.target.value)} maxLength={500} />
              </label>

              <label className="text-sm font-medium md:col-span-2">
                Credential vault item name
                <input className={fieldClass} placeholder="Example: 1Password item 'Bug-Man GorillaDesk'" value={form.credentialReference} onChange={(event) => updateField("credentialReference", event.target.value)} maxLength={500} />
                <span className="mt-2 block text-xs font-normal leading-5 text-muted-foreground">Enter the item name only—never paste a password, token, key, or secure-share URL.</span>
              </label>
            </div>
          </div>

          <details className="rounded-xl border border-border bg-muted/25">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Review permission and add notes</summary>
            <div className="grid gap-5 border-t border-border p-4 md:grid-cols-2">
              <label className="text-sm font-medium md:col-span-2">
                Permission Jazz needs <span className="text-primary">*</span>
                <input className={fieldClass} value={form.permission} onChange={(event) => updateField("permission", event.target.value)} maxLength={500} required />
              </label>
              <label className="text-sm font-medium">
                Submitted by
                <select className={fieldClass} value={form.submittedBy} onChange={(event) => updateField("submittedBy", event.target.value)}>
                  {["Larry", "Tyson", "Jazz", "Other"].map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium md:col-span-2">
                Notes
                <textarea className="mt-2 min-h-24 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Anything Jazz should know about this access." value={form.notes} onChange={(event) => updateField("notes", event.target.value)} maxLength={1000} />
              </label>
            </div>
          </details>

          {result && (
            <div role="status" className={cn("rounded-xl border px-4 py-3 text-sm leading-6", resultClass)}>
              {result.message}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full rounded-xl sm:w-auto sm:min-w-52" disabled={isSubmitting}>
            <Send className="size-4" />
            {isSubmitting ? "Saving securely…" : "Save access details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function BugManDashboard() {
  const [view, setView] = useState<View>("start");
  const [approval, setApproval] = useState<Approval>(null);
  const [submittedSystems, setSubmittedSystems] = useState<string[]>([]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const savedApproval = window.localStorage.getItem("bug-man-approval");
        if (savedApproval === "approved" || savedApproval === "hold") setApproval(savedApproval);

        const savedSystems: unknown = JSON.parse(window.localStorage.getItem("bug-man-submitted-systems") || "[]");
        if (Array.isArray(savedSystems) && savedSystems.every((item) => typeof item === "string")) {
          setSubmittedSystems(savedSystems);
        }
      } catch {
        // The workflow remains usable when browser storage is unavailable.
      }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const chooseApproval = (choice: Exclude<Approval, null>) => {
    setApproval(choice);
    try {
      window.localStorage.setItem("bug-man-approval", choice);
    } catch {
      // Device-local convenience only.
    }
  };

  const recordSubmission = (system: string) => {
    setSubmittedSystems((current) => {
      const next = current.includes(system) ? current : [...current, system];
      try {
        window.localStorage.setItem("bug-man-submitted-systems", JSON.stringify(next));
      } catch {
        // The private server record is already saved.
      }
      return next;
    });
  };

  const requiredSubmitted = useMemo(
    () => requiredSystems.filter((system) => submittedSystems.includes(system)).length,
    [submittedSystems],
  );
  const progressCount = requiredSubmitted + (approval ? 1 : 0);
  const progressPercent = Math.round((progressCount / (requiredSystems.length + 1)) * 100);

  const navigate = (nextView: View) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <BugMark />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">Bug-Man Phase 1</p>
            <p className="hidden text-xs text-muted-foreground sm:block">Lead capture setup</p>
          </div>

          <nav className="ml-auto hidden items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 sm:flex" aria-label="Dashboard sections">
            {[
              ["start", "Start here"],
              ["access", "Share access"],
              ["plan", "Project plan"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-current={view === id ? "page" : undefined}
                onClick={() => navigate(id as View)}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                  view === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
          <ThemeToggle />
        </div>

        <nav className="mx-auto grid max-w-6xl grid-cols-3 border-t border-border px-2 py-2 sm:hidden" aria-label="Dashboard sections">
          {[
            ["start", "Start"],
            ["access", "Access"],
            ["plan", "Plan"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-current={view === id ? "page" : undefined}
              onClick={() => navigate(id as View)}
              className={cn("rounded-lg px-2 py-2 text-sm font-medium", view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        {view === "start" && (
          <div className="space-y-7">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">Proposed · Setup only</Badge>
                <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Larry, here’s what we need to get started.</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Complete the decision and share access. Jazz will handle the technical setup from there.</p>
              </div>
              <div className="w-full rounded-2xl border border-border bg-card p-4 sm:w-56">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Setup progress</span>
                  <span className="font-semibold text-primary">{progressCount}/6</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: String(progressPercent) + "%" }} />
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
              <div className="space-y-5">
                <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
                  <CardContent className="p-5 sm:p-7">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold", approval ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted")}>
                        {approval ? <Check className="size-4" /> : "1"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-primary">Decision</p>
                        <h2 className="mt-1 text-xl font-semibold">Add new-customer details to GorillaDesk automatically?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Valid leads will be created or matched to an existing customer. Unclear information will always go to manual review.</p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            aria-pressed={approval === "approved"}
                            onClick={() => chooseApproval("approved")}
                            className={cn(
                              "rounded-xl border p-4 text-left transition",
                              approval === "approved" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                            )}
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              {approval === "approved" ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground" />}
                              Yes, prepare automation
                            </span>
                            <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">Production still stays off until final approval.</span>
                          </button>
                          <button
                            type="button"
                            aria-pressed={approval === "hold"}
                            onClick={() => chooseApproval("hold")}
                            className={cn(
                              "rounded-xl border p-4 text-left transition",
                              approval === "hold" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                            )}
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              {approval === "hold" ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground" />}
                              Not yet
                            </span>
                            <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">Jazz will pause and clarify the workflow.</span>
                          </button>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">This choice is saved on this device; formal approval is recorded separately.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
                  <CardContent className="p-5 sm:p-7">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold", requiredSubmitted === requiredSystems.length ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted")}>
                        {requiredSubmitted === requiredSystems.length ? <Check className="size-4" /> : "2"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-primary">Access</p>
                        <h2 className="mt-1 text-xl font-semibold">Share access one system at a time.</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Use vault item names only. Passwords and tokens never belong in this dashboard.</p>

                        <div className="mt-5 grid gap-2 sm:grid-cols-2">
                          {requiredSystems.map((system) => {
                            const complete = submittedSystems.includes(system);
                            return (
                              <div key={system} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                                {complete ? <CheckCircle2 className="size-4 shrink-0 text-primary" /> : <Circle className="size-4 shrink-0 text-muted-foreground" />}
                                <span className={cn("text-sm", complete ? "font-medium" : "text-muted-foreground")}>{system}</span>
                              </div>
                            );
                          })}
                        </div>

                        <Button size="lg" onClick={() => navigate("access")} className="mt-5 w-full rounded-xl sm:w-auto">
                          Share access details <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-5">
                <Card className="gap-0 rounded-2xl border-primary/20 bg-primary/[0.06] py-0 ring-0">
                  <CardContent className="p-5">
                    <h2 className="text-base font-semibold">What happens next</h2>
                    <div className="mt-4 space-y-4">
                      {[
                        "Jazz verifies each connection.",
                        "Tyson confirms GorillaDesk rules.",
                        "A controlled test runs before anything goes live.",
                      ].map((item, index) => (
                        <div key={item} className="flex gap-3">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{index + 1}</span>
                          <p className="pt-0.5 text-sm leading-5 text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <ShieldCheck className="size-4 text-primary" /> Safety rules
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-5 text-muted-foreground">
                      <li>• Bug-Man stays separate from BMPC.</li>
                      <li>• No automatic customer texting.</li>
                      <li>• Unclear leads require human review.</li>
                      <li>• Failures create a visible alert.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              {[
                ["24 hours", "Maximum Phase 1 cap", Clock3],
                ["3 sources", "Texts, emails, and WPForms", MessageSquareText],
                ["0 live", "Production automations", LockKeyhole],
              ].map(([value, label, Icon]) => (
                <div key={String(label)} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{String(value)}</p>
                    <p className="text-xs text-muted-foreground">{String(label)}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {view === "access" && (
          <div className="space-y-6">
            <section>
              <button type="button" onClick={() => navigate("start")} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> Back to setup
              </button>
              <Badge variant="outline" className="mt-6 border-primary/25 bg-primary/10 text-primary">Private .txt + Discord</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Share one access item.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Choose a system, identify the account, and save. Repeat only for the systems you can provide today.</p>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <AccessDetailsForm onSubmitted={recordSubmission} />
              <aside className="space-y-5">
                <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
                  <CardContent className="p-5">
                    <h2 className="text-sm font-semibold">Completed on this device</h2>
                    <div className="mt-4 space-y-3">
                      {requiredSystems.map((system) => {
                        const complete = submittedSystems.includes(system);
                        return (
                          <div key={system} className="flex items-center gap-3">
                            {complete ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground" />}
                            <span className={cn("text-sm", complete ? "font-medium" : "text-muted-foreground")}>{system}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">Responses are private, excluded from the portfolio AI, and copied to the dedicated Discord alert channel.</p>
                </div>
              </aside>
            </section>
          </div>
        )}

        {view === "plan" && (
          <div className="space-y-7">
            <section>
              <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">24-hour maximum</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A short, controlled Phase 1.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Access is checked first. If a required system cannot connect, work stops before the remaining hours are used.</p>
            </section>

            <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold">Milestones</h2>
              </div>
              <CardContent className="divide-y divide-border p-0">
                {milestones.map(([number, title, detail, cap], index) => (
                  <div key={number} className="grid gap-3 px-5 py-5 sm:grid-cols-[44px_minmax(0,1fr)_60px] sm:items-center">
                    <span className={cn("flex size-8 items-center justify-center rounded-full text-xs font-semibold", index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{number}</span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
                    </div>
                    <span className="text-sm font-semibold sm:text-right">{cap}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold">How each lead moves</h2>
              </div>
              <CardContent className="grid gap-3 p-5 md:grid-cols-5">
                {workflow.map(({ icon: Icon, label, detail }, index) => (
                  <div key={label} className="relative rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <Icon className="size-5 text-primary" />
                      <span className="text-xs text-muted-foreground">0{index + 1}</span>
                    </div>
                    <p className="mt-5 text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <section className="grid gap-5 md:grid-cols-2">
              <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
                <CardContent className="p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><CheckCircle2 className="size-5 text-primary" /> A successful test means</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    <li>• New leads reach the correct GorillaDesk workflow.</li>
                    <li>• Existing customers receive an update and source note.</li>
                    <li>• Duplicate events do not create duplicate customers.</li>
                    <li>• Missing information goes to manual review.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="gap-0 rounded-2xl border-primary/20 bg-primary/[0.06] py-0 ring-0">
                <CardContent className="p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold"><AlertTriangle className="size-5 text-primary" /> Not included</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    <li>• Internal SMS notifications or reminders</li>
                    <li>• Automated customer texting</li>
                    <li>• Changes to BMPC workflows</li>
                    <li>• AI or OCR without separate approval</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <Button size="lg" onClick={() => navigate("access")} className="rounded-xl">
              Share access details <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
