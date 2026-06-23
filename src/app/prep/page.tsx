"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Copy,
  Printer,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { persona } from "@/data/persona";

interface Answer {
  label: string;
  value: string;
}

const SECTION_01 = [
  {
    id: "lead_sources",
    label: "Where do your leads come from today?",
    placeholder: "Website forms, phone calls, referrals, Google Ads, etc.",
    type: "textarea" as const,
  },
  {
    id: "form_plugin",
    label: "What form plugin are you using on your website?",
    placeholder: "Elementor Forms, WPForms, Gravity Forms, Contact Form 7, etc.",
    type: "text" as const,
  },
  {
    id: "phone_routing",
    label: "How are phone calls routed?",
    placeholder: "Direct line, IVR, forwarding to mobile, etc.",
    type: "textarea" as const,
  },
  {
    id: "answering_service",
    label: "Do you use an answering service?",
    placeholder: "Yes/No, which one, how do they forward leads to you?",
    type: "textarea" as const,
  },
  {
    id: "leads_land",
    label: "Where do leads land after they come in?",
    placeholder: "Email inbox, GorillaDesk, spreadsheet, nowhere, etc.",
    type: "text" as const,
  },
  {
    id: "gorilladesk_usage",
    label: "How are you using GorillaDesk today?",
    placeholder: "Scheduling, invoicing, CRM, not using it much, etc.",
    type: "textarea" as const,
  },
  {
    id: "single_source",
    label: "Do you have a single source of truth for all leads?",
    placeholder: "One CRM, spreadsheet, or system where everything lives?",
    type: "text" as const,
  },
  {
    id: "response_speed",
    label: "How fast do you respond to new leads?",
    placeholder: "Within 5 minutes, same day, when I remember, etc.",
    type: "text" as const,
  },
  {
    id: "email_sending",
    label: "How are you sending emails to leads/customers?",
    placeholder: "Personal Gmail, business email, GorillaDesk, Mailchimp, etc.",
    type: "text" as const,
  },
  {
    id: "texting_setup",
    label: "Do you text customers? If so, how?",
    placeholder: "Personal phone, business line, automated SMS, etc.",
    type: "text" as const,
  },
];

const SECTION_02 = [
  {
    id: "leads_per_week",
    label: "How many leads do you get per week right now?",
    placeholder: "Approximate number",
    type: "text" as const,
  },
  {
    id: "leads_after_ads",
    label: "How many leads do you expect after increasing ad spend?",
    placeholder: "Your target or estimate",
    type: "text" as const,
  },
  {
    id: "lost_lead",
    label: "Describe a time you lost a lead. What happened?",
    placeholder: "Tell me the story — what went wrong?",
    type: "textarea" as const,
  },
  {
    id: "who_watches",
    label: "Who is responsible for watching and responding to leads?",
    placeholder: "You, a team member, nobody specifically, etc.",
    type: "text" as const,
  },
  {
    id: "avg_job_value",
    label: "What's the average job value for a concrete lead?",
    placeholder: "$500, $2,000, depends on the job, etc.",
    type: "text" as const,
  },
  {
    id: "cost_reflection",
    label: "If you lose just 2 leads per week, what does that cost you?",
    placeholder: "Think about your average job value × 2 leads × 4 weeks",
    type: "textarea" as const,
  },
  {
    id: "anything_else",
    label: "Anything else you want me to know before we start?",
    placeholder: "Pain points, goals, concerns, things that have failed before...",
    type: "textarea" as const,
  },
];

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
        Section {number}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
    </div>
  );
}

function getProgress(answers: Record<string, string>) {
  const allQuestions = [...SECTION_01, ...SECTION_02];
  const answered = allQuestions.filter(
    (q) => answers[q.id]?.trim(),
  ).length;
  return Math.round((answered / allQuestions.length) * 100);
}

function PrepContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client") ?? "";
  const clientName = searchParams.get("name") ?? "";
  const clientEmail = searchParams.get("email") ?? "";

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [emailInput, setEmailInput] = useState(clientEmail);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");

  const progress = getProgress(answers);

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const buildPayload = () => {
    const allQuestions = [...SECTION_01, ...SECTION_02];
    const answerList: Answer[] = allQuestions
      .filter((q) => answers[q.id]?.trim())
      .map((q) => ({ label: q.label, value: answers[q.id].trim() }));

    return {
      clientId,
      clientName,
      clientEmail: emailInput.trim() || clientEmail,
      clientPhone: phone.trim() || undefined,
      answers: answerList,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      submittedAt: new Date().toISOString(),
    };
  };

  const handleSend = async () => {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/prep-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      setDashboardUrl(data.dashboardUrl || "");
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const handleCopy = () => {
    const payload = buildPayload();
    const text = payload.answers.map((a) => `${a.label}\n${a.value}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const renderField = (q: (typeof SECTION_01)[0]) => {
    const base =
      "w-full rounded-xl border-2 border-border bg-background px-5 py-4 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 placeholder:text-muted-foreground/70 transition-all shadow-sm";
    if (q.type === "textarea") {
      return (
        <textarea
          value={answers[q.id] ?? ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={q.placeholder}
          rows={4}
          className={`${base} resize-none`}
        />
      );
    }
    return (
      <input
        type="text"
        value={answers[q.id] ?? ""}
        onChange={(e) => setAnswer(q.id, e.target.value)}
        placeholder={q.placeholder}
        className={base}
      />
    );
  };

  if (status === "sent") {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-3">Got it!</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Your answers have been sent to Jazzmin. She&apos;ll review them and
            get back to you with a recommendation.
          </p>
          {dashboardUrl && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Your project dashboard is ready:
              </p>
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline break-all"
              >
                {dashboardUrl}
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                A WhatsApp message with this link has been sent to your phone.
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {dashboardUrl && (
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Open Dashboard
              </a>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 glass-strong">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">
              Lead Automation Prep Sheet
            </h1>
            <p className="text-xs text-muted-foreground">
              {persona.name} — BuildWithJazz
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {clientName
              ? `Hi ${clientName}, let's map your lead flow`
              : "Let's map your lead flow"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Fill out what you can — every answer helps me design a better system
            for you. All fields are optional.
          </p>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border/30 bg-linear-to-br from-primary/5 to-transparent p-5 space-y-4"
        >
          <p className="text-base font-semibold text-foreground/90">
            Contact Info (for your dashboard link)
          </p>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border-2 border-border bg-background px-5 py-4 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/70 transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">
              WhatsApp number (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 912 345 6789"
              className="w-full rounded-xl border-2 border-border bg-background px-5 py-4 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/70 transition-all shadow-sm"
            />
          </div>
        </motion.div>

        {/* Progress gauge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/30 bg-linear-to-br from-primary/5 to-transparent p-5"
        >
          <div className="flex items-center justify-between text-base mb-3">
            <span className="text-foreground font-medium">Foundation poured</span>
            <span className="font-bold text-primary text-lg">{progress}%</span>
          </div>
          <div className="h-3.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="h-full rounded-full bg-linear-to-r from-primary to-primary/70"
            />
          </div>
        </motion.div>

        {/* Section 01 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/30 bg-linear-to-b from-card to-card/80 p-6 sm:p-8 shadow-sm"
        >
          <SectionHeader number="01" title="What you've already got" />
          <div className="space-y-6">
            {SECTION_01.map((q) => (
              <div key={q.id}>
                <label className="block text-base font-semibold text-foreground/90 mb-2">
                  {q.label}
                </label>
                {renderField(q)}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 02 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/30 bg-linear-to-b from-card to-card/80 p-6 sm:p-8 shadow-sm"
        >
          <SectionHeader number="02" title="Where leads might be leaking" />
          <div className="space-y-6">
            {SECTION_02.map((q) => (
              <div key={q.id}>
                <label className="block text-base font-semibold text-foreground/90 mb-2">
                  {q.label}
                </label>
                {renderField(q)}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-12">
          <button
            onClick={handleSend}
            disabled={status === "sending" || progress === 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "sending" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send my answers to Jazz
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy my answers
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full glass font-medium hover:bg-primary/10 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrepPage() {
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
      <PrepContent />
    </Suspense>
  );
}
