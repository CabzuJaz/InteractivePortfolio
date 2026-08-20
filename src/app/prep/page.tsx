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
import { isLikelyClientName, isSpecificProcessDescription } from "@/lib/prep-sheet";

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
    id: "name",
    label: "Your name",
    placeholder: "Full name",
    type: "text",
    required: true,
  },
  {
    id: "email",
    label: "Your email",
    placeholder: "you@company.com",
    type: "text",
    required: true,
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
    id: "business_type",
    label: "What type of business do you run?",
    placeholder: "E-commerce, agency, SaaS, service business, etc.",
    type: "text",
    required: true,
  },
  {
    id: "lead_sources",
    label: "Where do your leads come from today?",
    placeholder: "Website forms, phone calls, referrals, Google Ads, social media, etc.",
    type: "textarea",
  },
  {
    id: "leads_land",
    label: "Where do leads go after they come in?",
    placeholder: "CRM, email inbox, spreadsheet, nothing — describe what happens today",
    type: "textarea",
    required: true,
  },
  {
    id: "response_speed",
    label: "How fast do you respond to new leads?",
    placeholder: "Within 5 minutes, same day, when I remember, etc.",
    type: "text",
  },
  {
    id: "follow_up",
    label: "How do you follow up with leads?",
    placeholder: "Manual email, phone call, automated sequence, nothing consistent, etc.",
    type: "textarea",
  },
  {
    id: "tools_available",
    label: "What tools/software do you currently use?",
    placeholder: "CRM, email platform, project management, accounting, communication tools — list everything you pay for or use regularly",
    type: "textarea",
    required: true,
  },
];

const SECTION_2: Question[] = [
  {
    id: "leads_per_week",
    label: "How many leads do you get per week?",
    placeholder: "Approximate number",
    type: "text",
  },
  {
    id: "biggest_bottleneck",
    label: "What's the biggest bottleneck in your current process?",
    placeholder: "Where do things fall through the cracks or slow down the most?",
    type: "textarea",
    required: true,
  },
  {
    id: "lost_lead",
    label: "Describe a time you lost a lead or customer. What happened?",
    placeholder: "Tell me the story — what went wrong and what did it cost you?",
    type: "textarea",
  },
  {
    id: "avg_deal_value",
    label: "What's the average value of a closed deal or project?",
    placeholder: "$500, $2,000, varies — give me a rough range",
    type: "text",
  },
  {
    id: "automation_goal",
    label: "What would a successful automation look like for you?",
    placeholder: "Faster response, more consistent follow-up, less manual work, better reporting, etc.",
    type: "textarea",
    required: true,
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
    <div className="mb-7">
      <p className="eyebrow mb-3">
        Section {number}
      </p>
      <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{title}</h2>
    </div>
  );
}

function PrepContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client") ?? "";
  const rawPrefillName = searchParams.get("name") ?? "";
  const prefillEmail = searchParams.get("email") ?? "";
  const prefillBusiness = searchParams.get("business") ?? "";
  const rawPrefillProcess = searchParams.get("process") ?? "";
  const prefillName = isLikelyClientName(rawPrefillName) ? rawPrefillName : "";
  const prefillProcess = isSpecificProcessDescription(rawPrefillProcess)
    ? rawPrefillProcess
    : "";

  const [answers, setAnswers] = useState<Record<string, string>>({
    name: prefillName,
    email: prefillEmail,
    business_type: prefillBusiness,
    biggest_bottleneck: prefillProcess,
    automation_goal: prefillProcess,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
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
      clientName: answers.name?.trim() || prefillName || "Client",
      clientEmail: answers.email?.trim() || "",
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
      await res.json();
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
      "w-full rounded-xl border bg-card px-4 py-3.5 text-base leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/10";

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
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="display-title mb-3 text-3xl">Got it.</h1>
          <p className="mb-6 text-base leading-7 text-muted-foreground">
            Your answers have been sent to Jazzmin. She&apos;ll review them and
            reach out with a recommendation soon. A copy of your answers has
            been sent to your email.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Link
            href="/"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">Automation prep sheet</h1>
            <p className="text-xs text-muted-foreground">
              {persona.name} — BuildWithJazz
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:space-y-8 sm:py-14">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="eyebrow mb-4">Process discovery</p>
          <h1 className="display-title mb-4 text-3xl sm:text-5xl">
            {prefillName
              ? `Hi ${prefillName}, let's map the workflow.`
              : "Let's map the workflow."}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Short answers are fine. Share how the process works today, where it slows down, and what a better outcome looks like. Fields marked <span className="font-semibold text-primary">*</span> are required.
          </p>
        </motion.div>

        {/* Progress gauge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between text-base mb-3">
            <span className="font-medium text-foreground">Form progress</span>
            <span className="text-lg font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </motion.div>

        {/* Section 0 — Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <SectionHeader number="00" title="Contact details" />
          <p className="-mt-3 text-sm leading-6 text-muted-foreground">We&apos;ll use these details to send a copy of your answers and follow up.</p>
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
          className="rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <SectionHeader number="01" title="Your current setup" />
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
          className="rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <SectionHeader number="02" title="Pain points & goals" />
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
        <div className="flex flex-col gap-3 pb-12 sm:flex-row">
          <button
            onClick={handleSend}
            disabled={status === "sending" || progress === 0}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 font-semibold transition-colors hover:border-primary/40"
          >
            <Copy className="w-4 h-4" />
            Copy my answers
          </button>
          <button
            onClick={() => window.print()}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 font-semibold transition-colors hover:border-primary/40"
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
