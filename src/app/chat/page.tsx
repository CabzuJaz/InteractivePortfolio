"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { PrepSheet } from "@/components/tools/PrepSheet";
import { persona } from "@/data/persona";
import {
  buildPrepSheetResult,
  isLikelyClientName,
  isSpecificProcessDescription,
  type PrepSheetResult,
} from "@/lib/prep-sheet";

interface LocalPrepSheetCard {
  id: string;
  prepSheet: PrepSheetResult;
}

const prepSheetRequestPattern =
  /\b(prep\s*-?\s*sheet|prep\s*form|send\s+me\s+the\s+form|assess\s+my\s+business|where\s+to\s+start|don'?t\s+know\s+where\s+to\s+start)\b/i;

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const automationScopePattern =
  /\b(automate|automation|workflow|process|task|lead|estimate|intake|crm|form|email|follow[-\s]?up|manual|repetitive|approval|sync)\b/i;
const namePatterns = [
  /\b(?:my name is|this is)\s+([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,3})/i,
  /\bname\s*(?:is|:)\s*([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,3})/i,
];
const businessPatterns = [
  /\b(?:business|company|company name|business name)\s*(?:is|:)\s*([^.,\n]+)/i,
  /\b(?:at|from)\s+([A-Z][A-Za-z0-9&.' -]{2,40})(?:,|\.|\n|$)/i,
];

function isPrepSheetRequest(content: string) {
  return prepSheetRequestPattern.test(content);
}

function messageToText(message: UIMessage) {
  return (
    message.parts
      ?.filter((part) => part.type === "text" && "text" in part)
      .map((part) => part.text)
      .join("\n") ?? ""
  );
}

function cleanCapturedValue(value: string) {
  return value
    .replace(emailPattern, "")
    .split(/\b(?:and|for|because|about|to automate|i need|we need)\b/i)[0]
    .replace(/[.,;:!?]+$/g, "")
    .trim();
}

function extractByPatterns(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1] ? cleanCapturedValue(match[1]) : "";
    if (value) return value;
  }

  return undefined;
}

function extractClientName(text: string) {
  const name = extractByPatterns(text, namePatterns);
  return name && isLikelyClientName(name) ? name : undefined;
}

function extractProcessDescription(currentText: string, previousTexts: string[]) {
  const candidates = [currentText, ...previousTexts.slice().reverse()];

  for (const candidate of candidates) {
    const cleaned = candidate
      .replace(emailPattern, "")
      .replace(prepSheetRequestPattern, "")
      .replace(/\b(?:please|can you|could you|send me|generate|create|make)\b/gi, "")
      .trim();

    if (automationScopePattern.test(cleaned) && isSpecificProcessDescription(cleaned)) {
      return cleaned;
    }
  }

  return undefined;
}

function hasSharePrepSheetTool(messages: UIMessage[]) {
  return messages.some((message) =>
    message.parts?.some((part) => {
      if (!part.type.startsWith("tool-")) return false;
      return "toolName" in part && part.toolName === "sharePrepSheet";
    }),
  );
}

function hasQualificationSignal(content: string) {
  return (
    emailPattern.test(content) ||
    automationScopePattern.test(content) ||
    namePatterns.some((pattern) => pattern.test(content))
  );
}

function buildLocalPrepSheet(content: string, messages: UIMessage[]) {
  const previousUserTexts = messages
    .filter((message) => message.role === "user")
    .map(messageToText)
    .filter(Boolean);
  const conversationText = [...previousUserTexts, content].join("\n");

  return buildPrepSheetResult(
    {
      clientName: extractClientName(conversationText),
      clientEmail: conversationText.match(emailPattern)?.[0],
      businessName: extractByPatterns(conversationText, businessPatterns),
      processDescription: extractProcessDescription(content, previousUserTexts),
    },
    typeof window === "undefined" ? "https://www.buildwithjazz.com" : window.location.origin,
  );
}

function createPrepSheetCard(prepSheet: PrepSheetResult): LocalPrepSheetCard {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

  return { id: randomId, prepSheet };
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query");
  const hasSentInitial = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [localPrepSheets, setLocalPrepSheets] = useState<LocalPrepSheetCard[]>(
    () =>
      initialQuery && isPrepSheetRequest(initialQuery)
        ? [{ id: "initial-prep-sheet", prepSheet: buildLocalPrepSheet(initialQuery, []) }]
        : [],
  );

  // Redirect to www version to avoid POST body loss on redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "buildwithjazz.com") {
        window.location.replace(`https://www.buildwithjazz.com${window.location.pathname}${window.location.search}`);
      }
    }
  }, []);
  const logTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, sendMessage, regenerate, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: () => {
      setAutoScroll(true);
    },
  });

  // Debounced conversation logger — fires 5s after messages stop changing
  useEffect(() => {
    if (messages.length < 2) return;

    // Only log after an assistant response (last message is from assistant)
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "assistant") return;

    if (logTimerRef.current) clearTimeout(logTimerRef.current);
    logTimerRef.current = setTimeout(() => {
      fetch("/api/log-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      }).catch(() => {}); // fire-and-forget
    }, 5000);

    return () => {
      if (logTimerRef.current) clearTimeout(logTimerRef.current);
    };
  }, [messages]);

  const isError = status === "error";
  const isLoading = status === "submitted" || status === "streaming";

  // Cleanup log timer on unmount
  useEffect(() => {
    return () => {
      if (logTimerRef.current) clearTimeout(logTimerRef.current);
    };
  }, []);

  // Send initial query from URL
  useEffect(() => {
    if (initialQuery && !hasSentInitial.current && messages.length === 0) {
      hasSentInitial.current = true;
      sendMessage({ text: initialQuery });
    }
  }, [initialQuery, sendMessage, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // Pause auto-scroll when user scrolls up
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendMessage = (content: string, files?: File[]) => {
    setAutoScroll(true);
    const latestPrepSheet = localPrepSheets[localPrepSheets.length - 1]?.prepSheet;
    const shouldHandlePrepSheet =
      isPrepSheetRequest(content) ||
      (latestPrepSheet?.status === "needs_info" && hasQualificationSignal(content));

    if (shouldHandlePrepSheet) {
      setLocalPrepSheets([createPrepSheetCard(buildLocalPrepSheet(content, messages))]);
    }

    if (files && files.length > 0) {
      // Convert File[] to data-URL FileUIPart[] for the AI SDK
      const readers = files.map(
        (file) =>
          new Promise<{ url: string; mediaType: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ url: reader.result as string, mediaType: file.type });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      );

      Promise.all(readers).then((fileParts) => {
        sendMessage({
          text: content,
          files: fileParts.map((fp) => ({
            type: "file" as const,
            url: fp.url,
            mediaType: fp.mediaType,
          })),
        });
      });
    } else {
      sendMessage({ text: content });
    }
  };

  const showLocalPrepSheets =
    localPrepSheets.length > 0 && !hasSharePrepSheetTool(messages);
  const visibleLocalPrepSheets = showLocalPrepSheets ? localPrepSheets.slice(-1) : [];

  return (
    <div className="flex h-dvh flex-col bg-background">
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
          <div className="flex items-center gap-3 flex-1">
            <Image
              src="/avatars/avatar.webp"
              alt={persona.nickname}
              width={32}
              height={32}
              className="h-9 w-9 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-sm font-semibold">{persona.nickname} AI</h1>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Interactive portfolio
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="mx-auto max-w-3xl px-4 pb-2 pt-12 sm:pt-16">
            <p className="eyebrow">Ask the portfolio</p>
            <h2 className="display-title mt-4 max-w-2xl text-3xl sm:text-4xl">
              Start with the work, the skills, or a workflow you want to improve.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              I&apos;m the AI version of {persona.nickname}. I answer from {persona.name}&apos;s portfolio and can pull up projects, experience, and contact details.
            </p>
          </div>
        )}
        <MessageList messages={messages} isLoading={isLoading} />
        {visibleLocalPrepSheets.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 pb-3 space-y-3">
            {visibleLocalPrepSheets.map((card) => (
              <PrepSheet key={card.id} prepSheet={card.prepSheet} />
            ))}
          </div>
        )}
        {isError && (
          <div className="max-w-3xl mx-auto px-4 py-2">
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-2">
              <span>That reply hit a temporary error — nothing you shared was lost. Try again, or just keep chatting.</span>
              <button
                onClick={() => regenerate()}
                className="shrink-0 text-xs font-medium underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom: suggestions + input */}
      <div className="sticky bottom-0 border-t border-border/70 bg-background/90 pb-1 pt-3 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto">
          <SuggestionChips onSelect={handleSendMessage} disabled={isLoading} />
          <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
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
      <ChatContent />
    </Suspense>
  );
}
