"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bug,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Database,
  FileText,
  Gauge,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquareText,
  PlugZap,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  Webhook,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type View = "overview" | "workflow" | "access";

const milestones = [
  {
    id: "access",
    number: "01",
    title: "Access & feasibility",
    description: "Confirm source access, APIs, and Tyson’s handling rules.",
    cap: 4,
    status: "ready",
  },
  {
    id: "capture",
    number: "02",
    title: "Capture & GorillaDesk",
    description: "Normalize, match, create or update each qualified lead.",
    cap: 8,
    status: "locked",
  },
  {
    id: "operations",
    number: "03",
    title: "Slack & Discord operations",
    description: "Route notifications, reminders, and visible failure alerts.",
    cap: 5,
    status: "locked",
  },
  {
    id: "wordpress",
    number: "04",
    title: "WordPress connection",
    description: "Connect approved forms after answering-service validation.",
    cap: 3,
    status: "locked",
  },
  {
    id: "testing",
    number: "05",
    title: "Test & handoff",
    description: "Run controlled tests, document, and walk through with Tyson.",
    cap: 4,
    status: "locked",
  },
] as const;

const accessItems = [
  { id: "samples", label: "Answering-service text/email samples", owner: "Larry" },
  { id: "gorilla", label: "Bug-Man GorillaDesk + API access", owner: "Larry" },
  { id: "wordpress", label: "WordPress / WPForms access", owner: "Larry" },
  { id: "slack", label: "General Slack workspace + Bug-Man channel permissions", owner: "Larry" },
  { id: "discord", label: "Dedicated Discord channel webhook", owner: "Larry" },
  { id: "log", label: "Private Bug-Man response storage", owner: "Jazz" },
  { id: "tyson", label: "GorillaDesk rules walkthrough", owner: "Tyson" },
] as const;

const workflow = [
  {
    icon: Inbox,
    label: "Capture",
    detail: "Answering service or WPForms",
  },
  {
    icon: SlidersHorizontal,
    label: "Normalize",
    detail: "Name, phone, email, service need",
  },
  {
    icon: Search,
    label: "Match",
    detail: "Check phone and email",
  },
  {
    icon: Database,
    label: "GorillaDesk",
    detail: "Create lead or update customer",
  },
  {
    icon: Bell,
    label: "Notify",
    detail: "Bug-Man channels in general Slack + Discord",
  },
] as const;

const acceptanceCriteria = [
  "Each approved source reaches the correct workflow",
  "Valid leads create or update the correct record",
  "Duplicate events do not create duplicate customers",
  "Incomplete information routes to manual review",
  "Failures create a visible internal alert",
  "Bug-Man data never enters BMPC systems",
  "Tyson completes the working-process walkthrough",
  "No internal SMS or customer auto-texting is active",
];

function BugMark() {
  return (
    <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <Bug className="size-[18px]" strokeWidth={2.4} />
    </div>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

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

const accessSystemPresets: Record<string, Pick<AccessFormState, "accessArea" | "permission">> = {
  WordPress: {
    accessArea: "WordPress / WPForms",
    permission: "Administrator access or a role that can review forms and configure webhooks",
  },
  GorillaDesk: {
    accessArea: "GorillaDesk CRM and API",
    permission: "Access to customers, leads, notes, custom fields, and API credentials",
  },
  "Answering service": {
    accessArea: "Answering-service texts and emails",
    permission: "Access to sample messages and the approved delivery inbox or integration",
  },
  Slack: {
    accessArea: "General Slack workspace",
    permission: "Permission to create and manage dedicated Bug-Man lead and alert channels",
  },
  Discord: {
    accessArea: "Dedicated Bug-Man response channel",
    permission: "Permission to create a channel webhook for internal access-response alerts",
  },
  "Private response log": {
    accessArea: "Bug-Man private response files",
    permission: "Private Vercel Blob storage available to the dashboard backend only",
  },
  Other: { accessArea: "", permission: "" },
};

const emptyAccessForm: AccessFormState = {
  system: "WordPress",
  accountEmail: "",
  loginUrl: "",
  credentialReference: "",
  submittedBy: "Larry",
  notes: "",
  ...accessSystemPresets.WordPress,
};

function AccessDetailsForm() {
  const [form, setForm] = useState<AccessFormState>(emptyAccessForm);
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
        throw new Error(data?.error || "The access details could not be saved.");
      }

      setResult(data?.notificationSent === false
        ? { tone: "warning", message: "Details were saved privately, but the Discord notification could not be sent." }
        : { tone: "success", message: "Details were saved privately and the Discord notification was sent." });
      setForm((current) => ({ ...emptyAccessForm, submittedBy: current.submittedBy }));
    } catch (error) {
      setResult({
        tone: "error",
        message: error instanceof Error ? error.message : "The access details could not be saved.",
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
    <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Submit access details</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Add one system at a time. Each submission is recorded separately so Jazz can verify access and follow up.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-primary/25 bg-primary/10 text-primary">Private file + Discord</Badge>
      </div>

      <CardContent className="p-5">
        <div className="mb-5 flex gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            Do not enter passwords, API keys, tokens, recovery codes, or secure-share URLs. Enter only the name of the item in the approved credential vault.
          </p>
        </div>

        <form className="space-y-5" onSubmit={submitAccess}>
          <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
            <label htmlFor="bug-man-website">Website</label>
            <input id="bug-man-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium">
              System <span className="text-primary">*</span>
              <select className={fieldClass} value={form.system} onChange={(event) => selectSystem(event.target.value)} required>
                {Object.keys(accessSystemPresets).map((system) => <option key={system}>{system}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium">
              Access area <span className="text-primary">*</span>
              <input className={fieldClass} value={form.accessArea} onChange={(event) => updateField("accessArea", event.target.value)} maxLength={100} required />
            </label>

            <label className="text-sm font-medium">
              Account or login email
              <input className={fieldClass} type="email" autoComplete="email" placeholder="larry@example.com" value={form.accountEmail} onChange={(event) => updateField("accountEmail", event.target.value)} maxLength={254} />
            </label>

            <label className="text-sm font-medium">
              Login URL
              <input className={fieldClass} type="url" inputMode="url" placeholder="https://example.com/login" value={form.loginUrl} onChange={(event) => updateField("loginUrl", event.target.value)} maxLength={500} />
            </label>

            <label className="text-sm font-medium md:col-span-2">
              Required permission or role <span className="text-primary">*</span>
              <input className={fieldClass} value={form.permission} onChange={(event) => updateField("permission", event.target.value)} maxLength={500} required />
            </label>

            <label className="text-sm font-medium md:col-span-2">
              Secure credential reference
              <input className={fieldClass} placeholder="Example: 1Password item 'Bug-Man WordPress'" value={form.credentialReference} onChange={(event) => updateField("credentialReference", event.target.value)} maxLength={500} />
              <span className="mt-2 block text-xs font-normal text-muted-foreground">Reference only—never paste the credential itself.</span>
            </label>

            <label className="text-sm font-medium">
              Submitted by <span className="text-primary">*</span>
              <select className={fieldClass} value={form.submittedBy} onChange={(event) => updateField("submittedBy", event.target.value)} required>
                {["Larry", "Tyson", "Jazz", "Other"].map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium md:col-span-2">
              Notes
              <textarea className="mt-2 min-h-28 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Add setup notes, limitations, or the best contact for access approval." value={form.notes} onChange={(event) => updateField("notes", event.target.value)} maxLength={1000} />
            </label>
          </div>

          {result && (
            <div role="status" className={cn("rounded-xl border px-4 py-3 text-sm", resultClass)}>
              {result.message}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">The form saves a private timestamped .txt record; it is never sent to the portfolio AI.</p>
            <Button type="submit" className="min-w-44 rounded-xl" disabled={isSubmitting}>
              <Send className="size-4" />
              {isSubmitting ? "Saving…" : "Send access details"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function BugManDashboard() {
  const [view, setView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkedAccess, setCheckedAccess] = useState<string[]>([]);

  useEffect(() => {
    const restoreSavedState = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("bug-man-access-checks");
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
            setCheckedAccess(parsed);
          }
        }
      } catch {
        // Device-local convenience only; the dashboard still works without it.
      }
    }, 0);

    return () => window.clearTimeout(restoreSavedState);
  }, []);

  const toggleAccess = (id: string) => {
    setCheckedAccess((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      try {
        window.localStorage.setItem("bug-man-access-checks", JSON.stringify(next));
      } catch {
        // Keep the interaction working when browser storage is unavailable.
      }
      return next;
    });
  };

  const accessPercent = Math.round((checkedAccess.length / accessItems.length) * 100);
  const hours = useMemo(() => milestones.reduce((sum, item) => sum + item.cap, 0), []);

  const navItems = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "workflow" as const, label: "Lead workflow", icon: Webhook },
    { id: "access" as const, label: "Access & readiness", icon: LockKeyhole },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[74px] items-center gap-3 border-b border-border px-5">
          <BugMark />
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em]">Bug-Man</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Lead operations</p>
          </div>
          <button
            type="button"
            className="ml-auto text-muted-foreground lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Project navigation" className="space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Phase 1 workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
                  view === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-2 border-t border-border px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Controls
          </p>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground">
            <UsersRound className="size-4" /> Team & roles
            <LockKeyhole className="ml-auto size-3.5" />
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground">
            <Settings className="size-4" /> Settings
            <LockKeyhole className="ml-auto size-3.5" />
          </div>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Records stay separated
            </div>
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
              Slack is shared. Bug-Man records and notifications stay in dedicated channels.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 px-1">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              LA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">Larry</p>
              <p className="truncate text-[10px] text-muted-foreground">Project approver</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-[74px] items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button
            type="button"
            className="mr-3 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Projects <ChevronRight className="size-3" /> Bug-Man Phase 1
            </div>
            <p className="mt-1 text-sm font-medium sm:text-[15px]">
              Answering-service & WordPress lead capture
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Badge className="hidden h-8 rounded-lg border border-border bg-muted/40 px-3 text-[11px] font-medium text-muted-foreground hover:bg-muted/40 sm:inline-flex">
              Phase 1 · Proposed
            </Badge>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
          {view === "overview" && (
            <div className="space-y-6">
              <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                <div>
                  <StatusPill>Awaiting Larry’s clarification</StatusPill>
                  <h1 className="display-title mt-4 max-w-3xl text-2xl sm:text-3xl">
                    Build a reliable path from first contact to the right GorillaDesk record.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Capture new-customer details, prevent duplicate records, and give the Bug-Man team a clear next action—without touching BMPC systems.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock3 className="size-3.5" /> Last reviewed Sep 7, 2026
                </div>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary p-5 text-primary-foreground sm:p-6">
                <div className="pointer-events-none absolute -right-14 -top-20 size-56 rounded-full border-[35px] border-black/[0.04]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
                    <AlertTriangle className="size-[17px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-60">Decision required before work begins</p>
                    <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Should new-customer details be added to GorillaDesk automatically?</h2>
                    <p className="mt-1 max-w-2xl text-xs leading-5 opacity-70">
                      Larry’s confirmation must be recorded through the agreed project approval process. This dashboard does not grant approval or activate production automation.
                    </p>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => setView("access")} className="shrink-0 rounded-xl bg-card text-foreground hover:bg-card/90">
                    Provide access details <ArrowRight className="size-4" />
                  </Button>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Project status", value: "Proposed", icon: Gauge, note: "Pending Larry’s approval" },
                  { label: "Total hour cap", value: `${hours} hours`, icon: Clock3, note: "Across 5 milestones" },
                  { label: "Planned sources", value: "3 channels", icon: Inbox, note: "Texts, email, WPForms" },
                  { label: "Live automations", value: "0 active", icon: PlugZap, note: "Production safely off" },
                ].map(({ label, value, icon: Icon, note }) => (
                  <Card key={label} className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                    <CardContent className="p-4.5">
                      <div className="flex items-start justify-between">
                        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
                          <Icon className="size-4" />
                        </div>
                      </div>
                      <p className="mt-4 text-[22px] font-semibold tracking-[-0.035em]">{value}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
                <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                      <h2 className="text-sm font-semibold">Milestone plan</h2>
                      <p className="mt-1 text-[11px] text-muted-foreground">Actual time will be recorded against each approved cap.</p>
                    </div>
                    <button type="button" onClick={() => setView("workflow")} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                      View workflow <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <CardContent className="px-0 py-1">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[42px_minmax(0,1fr)_110px_76px]">
                        <span className="font-mono text-xs text-muted-foreground">{milestone.number}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs font-semibold sm:text-[13px]">{milestone.title}</p>
                            {index === 0 && <span className="hidden size-1.5 rounded-full bg-primary sm:block" />}
                          </div>
                          <p className="mt-1 truncate text-[10px] text-muted-foreground">{milestone.description}</p>
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-0 rounded-full bg-primary" />
                          </div>
                          <span className="w-6 text-right text-[10px] text-muted-foreground">0h</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold">{milestone.cap}h</span>
                          <span className="ml-1 text-[9px] text-muted-foreground">cap</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                  <div className="border-b border-border px-5 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold">Access readiness</h2>
                      <span className="font-mono text-[11px] text-primary">{checkedAccess.length}/{accessItems.length}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${accessPercent}%` }} />
                    </div>
                  </div>
                  <CardContent className="space-y-1 p-3">
                    {accessItems.slice(0, 5).map((item) => {
                      const checked = checkedAccess.includes(item.id);
                      return (
                        <button key={item.id} type="button" onClick={() => toggleAccess(item.id)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-muted">
                          <span className={cn("flex size-4 shrink-0 items-center justify-center rounded border", checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40")}>
                            {checked && <Check className="size-3" strokeWidth={3} />}
                          </span>
                          <span className={cn("min-w-0 flex-1 truncate text-[11px]", checked ? "text-muted-foreground line-through" : "text-muted-foreground")}>{item.label}</span>
                        </button>
                      );
                    })}
                    <Button variant="ghost" onClick={() => setView("access")} className="mt-2 w-full justify-between rounded-xl text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground">
                      Review all requirements <ChevronRight className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="text-sm font-semibold">Lead sources</h2>
                    <span className="text-[10px] text-muted-foreground">Connection order</span>
                  </div>
                  <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                    {[
                      { icon: MessageSquareText, label: "Service texts", order: "First", state: "Access needed" },
                      { icon: Mail, label: "Service emails", order: "First", state: "Access needed" },
                      { icon: FileText, label: "WPForms", order: "After validation", state: "Queued" },
                    ].map(({ icon: Icon, label, order, state }) => (
                      <div key={label} className="rounded-xl border border-border bg-muted/30 p-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </div>
                          <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{order}</span>
                        </div>
                        <p className="mt-4 text-xs font-semibold">{label}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{state}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-sm font-semibold">Guardrails</h2>
                  </div>
                  <CardContent className="grid gap-x-5 gap-y-3.5 p-5 sm:grid-cols-2">
                    {[
                      ["No customer auto-texting", "Customer messaging stays off."],
                      ["Shared general Slack", "Dedicated Bug-Man lead and alert channels."],
                      ["No unapproved AI / OCR", "Separate review required."],
                      ["Stop on infeasibility", "Report options before more hours."],
                    ].map(([title, detail]) => (
                      <div key={title} className="flex gap-3">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] font-semibold">{title}</p>
                          <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{detail}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          )}

          {view === "workflow" && (
            <div className="space-y-6">
              <section>
                <StatusPill>Blueprint · Not connected</StatusPill>
                <h1 className="display-title mt-4 text-2xl sm:text-3xl">One controlled path for every new inquiry.</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Every source follows the same validation, matching, and notification rules before any action reaches production.</p>
              </section>

              <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-sm font-semibold">Primary lead path</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Answering-service path first, WordPress after validation.</p>
                </div>
                <CardContent className="p-5 sm:p-7">
                  <div className="grid gap-3 md:grid-cols-5">
                    {workflow.map(({ icon: Icon, label, detail }, index) => (
                      <div key={label} className="relative">
                        <div className="h-full rounded-xl border border-border bg-muted/40 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="size-4" />
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                          </div>
                          <p className="mt-5 text-xs font-semibold">{label}</p>
                          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{detail}</p>
                        </div>
                        {index < workflow.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-3 text-muted-foreground md:block" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <section className="grid gap-5 lg:grid-cols-2">
                <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                  <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Decision logic</h2></div>
                  <CardContent className="space-y-3 p-5">
                    {[
                      { title: "Required information is complete", action: "Check phone + email for an existing customer", tone: "lime" },
                      { title: "No customer match", action: "Create a new GorillaDesk lead", tone: "lime" },
                      { title: "Existing customer found", action: "Update the customer and add a source note", tone: "lime" },
                      { title: "Missing or uncertain details", action: "Route to Bug-Man Slack for manual review", tone: "amber" },
                      { title: "Integration failure", action: "Raise a visible internal alert; do not silently retry", tone: "red" },
                    ].map((item) => (
                      <div key={item.title} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <span className={cn("size-2 shrink-0 rounded-full", item.tone === "lime" ? "bg-primary" : item.tone === "amber" ? "bg-primary" : "bg-destructive")} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold">{item.title}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{item.action}</p>
                        </div>
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                  <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Acceptance checklist</h2></div>
                  <CardContent className="space-y-3 p-5">
                    {acceptanceCriteria.map((item) => (
                      <div key={item} className="flex gap-3">
                        <CircleDashed className="mt-px size-4 shrink-0 text-muted-foreground" />
                        <p className="text-[11px] leading-4 text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          )}

          {view === "access" && (
            <div className="space-y-6">
              <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <StatusPill>Milestone 01 · Up to 4 hours</StatusPill>
                  <h1 className="display-title mt-4 text-2xl sm:text-3xl">Access & feasibility gate</h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Verify every required connection before implementation hours are used. Checks below are saved only on this device.</p>
                </div>
                <div className="min-w-44 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-end justify-between"><span className="text-2xl font-semibold">{accessPercent}%</span><span className="text-[10px] text-muted-foreground">ready</span></div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${accessPercent}%` }} /></div>
                </div>
              </section>

              <AccessDetailsForm />

              <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
                <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_72px_36px] border-b border-border px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:grid-cols-[minmax(0,1fr)_100px_90px]">
                    <span>Requirement</span><span>Owner</span><span className="text-right">Status</span>
                  </div>
                  <CardContent className="px-0 py-0">
                    {accessItems.map((item) => {
                      const checked = checkedAccess.includes(item.id);
                      return (
                        <button key={item.id} type="button" onClick={() => toggleAccess(item.id)} className="grid w-full grid-cols-[minmax(0,1fr)_72px_36px] items-center border-b border-border px-5 py-4 text-left transition last:border-0 hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_100px_90px]">
                          <span className="flex min-w-0 items-center gap-3">
                            <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40")}>
                              {checked && <Check className="size-3.5" strokeWidth={3} />}
                            </span>
                            <span className={cn("truncate text-xs", checked ? "text-muted-foreground line-through" : "text-muted-foreground")}>{item.label}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">{item.owner}</span>
                          <span className="text-right">
                            {checked ? <CheckCircle2 className="ml-auto size-4 text-primary" /> : <span className="hidden text-[9px] text-primary sm:inline">Needed</span>}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                <div className="space-y-5">
                  <Card className="gap-0 rounded-2xl border border-primary/20 bg-primary/[0.06] py-0 ring-0">
                    <CardContent className="p-5">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><AlertTriangle className="size-4" /></div>
                      <h2 className="mt-4 text-sm font-semibold text-primary">Stop condition</h2>
                      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">If a required system cannot support the connection, stop after feasibility checks. Report the limitation and available options before using any remaining hours.</p>
                    </CardContent>
                  </Card>
                  <Card className="gap-0 rounded-2xl border border-border bg-card py-0 ring-0">
                    <CardContent className="p-5">
                      <h2 className="text-sm font-semibold">People involved</h2>
                      <div className="mt-4 space-y-4">
                        {[
                          ["Larry", "Approval, credentials, source access", "LA"],
                          ["Tyson", "GorillaDesk rules & walkthrough", "TY"],
                          ["Jazz", "Build, test, document", "JZ"],
                        ].map(([name, role, initials]) => (
                          <div key={name} className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials}</div>
                            <div><p className="text-[11px] font-semibold">{name}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{role}</p></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
