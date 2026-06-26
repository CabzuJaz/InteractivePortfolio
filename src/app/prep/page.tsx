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

interface Question {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
  required?: boolean;
}

const SECTION_0: Question[] = [
  {
    id: "email",
    label: "Email",
    placeholder: "you@company.com",
    type: "text",
  },
  {
    id: "whatsapp",
    label: "WhatsApp number (optional)",
    placeholder: "+63 912 345 6789",
    type: "text",
  },
];

const SECTION_1: Question[] = [
  {
    id: "lead_sources",
    label: "Where do your leads come from today?",
    placeholder: "Website forms, phone calls, referrals, Google Ads, etc.",
    type: "textarea",
  },
  {
    id: "form_plugin",
    label: "What form plugin are you using on your website?",
    placeholder: "Elementor Forms, WPForms, Gravity Forms, Contact Form 7, etc.",
    type: "text",
  },
  {
    id: "form_inbox",
    label: "Which email inbox receives your website form notifications?",
    placeholder: "e.g. larry@bmpcconcrete.com — exact address please",
    type: "text",
    required: true,
  },
  {
    id: "phone_routing",
    label: "How are phone calls routed?",
    placeholder: "Direct line, IVR, forwarding to mobile, etc.",
    type: "textarea",
  },
  {
    id: "answering_service",
    label: "Do you use an answering service?",
    placeholder: "Yes/No, which one, how do they forward leads to you?",
    type: "textarea",
  },
  {
    id: "leads_land",
    label: "Where do leads land after they come in?",
    placeholder: "Email inbox, GorillaDesk, spreadsheet, nowhere, etc.",
    type: "text",
  },
  {
    id: "gorilladesk_usage",
    label: "How are you using GorillaDesk today?",
    placeholder: "Scheduling, invoicing, CRM, not using it much, etc.",
    type: "textarea",
    required: true,
  },
  {
    id: "single_source",
    label: "Do you have a single source of truth for all leads?",
    placeholder: "One CRM, spreadsheet, or system where everything lives?",
    type: "text",
  },
  {
    id: "response_speed",
    label: "How fast do you respond to new leads?",
    placeholder: "Within 5 minutes, same day, when I remember, etc.",
    type: "text",
  },
  {
    id: "email_sending",
    label: "How are you sending emails to leads/customers?",
    placeholder: "Personal Gmail, business email, GorillaDesk, Mailchimp, etc.",
    type: "text",
  },
  {
    id: "texting_setup",
    label: "Do you text customers? If so, how?",
    placeholder: "Personal phone, business line, automated SMS, etc.",
    type: "text",
  },
  {
    id: "tools_available",
    label: "What tools/software do you currently use?",
    placeholder: "GorillaDesk, Google Workspace, QuickBooks, WordPress, CallRail, Twilio, Mailchimp, etc. — list everything you pay for or use regularly",
    type: "textarea",
    required: true,
  },
];

const SECTION_2: Question[] = [
  {
    id: "leads_per_week",
    label: "How many leads do you get per week right now?",
    placeholder: "Approximate number",
    type: "text",
  },
  {
    id: "leads_after_ads",
    label: "How many leads do you expect after increasing ad spend?",
    placeholder: "Your target or estimate",
    type: "text",
  },
  {
    id: "lost_lead",
    label: "Describe a time you lost a lead. What happened?",
    placeholder: "Tell me the story — what went wrong?",
    type: "textarea",
  },
  {
    id: "who_watches",
    label: "Who is responsible for watching and responding to leads?",
    placeholder: "Name + phone number for text alerts",
    type: "textarea",
    required: true,
  },
  {
    id: "avg_job_value",
    label: "What's the average job value for a concrete lead?",
    placeholder: "$500, $2,000, depends on the job, etc.",
    type: "text",
  },
  {
    id: "cost_reflection",
    label: "If you lose just 2 leads per week, what does that cost you?",
    placeholder: "Think about your average job value × 2 leads × 4 weeks",
    type: "textarea",
  },
  {
    id: "confirmation_preference",
    label: "Confirmation message preference: should customers get an email, a text, or both?",
    placeholder: "Email only, text only, both — and any wording you prefer?",
    type: "textarea",
  },
  {
    id: "anything_else",
    label: "Anything else you want me to know before we start?",
    placeholder: "Pain points, goals, concerns, things that have failed before...",
    type: "textarea",
  },
];

const ALL_QUESTIONS = [...SECTION_0, ...SECTION_1, ...SECTION_2];

function getProgress(answers: Record<string, string>) {
  const answered = ALL_QUESTIONS.filter((q) => answers[q.id]?.trim()).length;
  return Math.round((answered / ALL_QUESTIONS.length) * 100);
}

function getRequiredMissing(answers: Record<string, string>): string[] {
  return ALL_QUESTIONS.filter((q) => q.required && !answers[q.id]?.trim()).map(
    (q) => q.label,
  );
}

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

function PrepContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client") ?? "";
  const clientName = searchParams.get("name") ?? "";
  const clientEmail = searchParams.get("email") ?? "";

  const [answers, setAnswers] = useState<Record<string, string>>({
    email: clientEmail,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const progress = getProgress(answers);
  const requiredMissing = getRequiredMissing(answers);

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const buildPayload = () => {
    const answerList: Answer[] = ALL_QUESTIONS.filter(
      (q) => answers[q.id]?.trim(),
    ).map((q) => ({ label: q.label, value: answers[q.id].trim() }));

    return {
      clientId,
      clientName,
      clientEmail: answers.email?.trim() || clientEmail,
      clientPhone: answers.whatsapp?.trim() || undefined,
      answers: answerList,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      submittedAt: new Date().toISOString(),
    };
  };

  const handleSend = async () => {
    if (requiredMissing.length > 0) {
      setErrorMsg(
        `Please fill in required fields: ${requiredMissing.join(", ")}`,
      );
      setStatus("error");
      setShowErrors(true);
      // Scroll to first missing field
      const firstMissing = ALL_QUESTIONS.find((q) => q.required && !answers[q.id]?.trim());
      if (firstMissing) {
        document.getElementById(`field-${firstMissing.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

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

  const renderField = (q: Question) => {
    const isRequired = q.required;
    const isMissing = showErrors && isRequired && !answers[q.id]?.trim();
    const borderColor = isMissing ? "border-destructive" : "border-border";
    const base =
      "w-full rounded-xl border-2 bg-background px-5 py-4 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/70 transition-all shadow-sm";

    if (q.type === "textarea") {
      return (
        <textarea
          id={`field-${q.id}`}
          value={answers[q.id] ?? ""}
          onChange={(e) => {
            setAnswer(q.id, e.target.value);
            if (showErrors && isRequired && e.target.value.trim()) {
              setShowErrors(false);
            }
          }}
          placeholder={q.placeholder}
          required={isRequired}
          rows={4}
          className={`${base} ${borderColor} resize-none`}
        />
      );
    }
    return (
      <input
        id={`field-${q.id}`}
        type="text"
        value={answers[q.id] ?? ""}
        onChange={(e) => {
          setAnswer(q.id, e.target.value);
          if (showErrors && isRequired && e.target.value.trim()) {
            setShowErrors(false);
          }
        }}
        placeholder={q.placeholder}
        required={isRequired}
        className={`${base} ${borderColor}`}
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
            get back to you with a recommendation for BMPC.
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
              : "Hi Larry, let's map your lead flow"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Fill out what you can — every answer helps me design a better system
            for you. Fields marked with <span className="text-primary font-semibold">*</span> are required.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This form is for <strong>BMPC Concrete</strong> only.
          </p>
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

        {/* Section 0 — Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border/30 bg-linear-to-br from-primary/5 to-transparent p-5 space-y-4"
        >
          <p className="text-base font-semibold text-foreground/90">
            Contact Info (for your dashboard link)
          </p>
          {SECTION_0.map((q) => (
            <div key={q.id}>
              <label className="block text-base font-semibold text-foreground/90 mb-2">
                {q.label}
              </label>
              {renderField(q)}
            </div>
          ))}
        </motion.div>

        {/* Section 1 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/30 bg-linear-to-b from-card to-card/80 p-6 sm:p-8 shadow-sm"
        >
          <SectionHeader number="01" title="What you've already got" />
          <div className="space-y-6">
            {SECTION_1.map((q) => (
              <div key={q.id}>
                <label className="block text-base font-semibold text-foreground/90 mb-2">
                  {q.label}
                  {q.required && <span className="text-primary ml-1">*</span>}
                </label>
                {renderField(q)}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 2 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/30 bg-linear-to-b from-card to-card/80 p-6 sm:p-8 shadow-sm"
        >
          <SectionHeader number="02" title="Where leads might be leaking" />
          <div className="space-y-6">
            {SECTION_2.map((q) => (
              <div key={q.id}>
                <label className="block text-base font-semibold text-foreground/90 mb-2">
                  {q.label}
                  {q.required && <span className="text-primary ml-1">*</span>}
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
