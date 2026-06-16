"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { persona } from "@/data/persona";

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query");
  const hasSentInitial = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

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

  const { messages, sendMessage, status } = useChat({
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

  return (
    <div className="flex flex-col h-dvh bg-background">
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
          <div className="flex items-center gap-3 flex-1">
            <Image
              src="/avatars/avatar.webp"
              alt={persona.nickname}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h1 className="text-sm font-semibold">{persona.nickname}</h1>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
        {isError && (
          <div className="max-w-3xl mx-auto px-4 py-2">
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
              <span>Something went wrong. Please try again.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom: suggestions + input */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md pt-3 pb-1">
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
