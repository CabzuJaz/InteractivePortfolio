"use client";

import type { UIMessage } from "ai";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolRenderer } from "./tool-renderer";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

function isFilePart(
  part: UIMessage["parts"] extends (infer P)[] | undefined ? P : never,
): part is { type: "file"; url: string; mediaType: string } {
  return part.type === "file";
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="px-4 py-7" aria-live="polite" role="log">
      <div className="mx-auto max-w-3xl space-y-8">
        {messages.map((message) => {
          const textParts = message.parts?.filter((p) => p.type === "text") ?? [];
          const fileParts = message.parts?.filter(isFilePart) ?? [];
          const toolParts = message.parts?.filter((p) => p.type.startsWith("tool-")) ?? [];

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
            >
              {message.role === "user" ? (
                /* ── User message ── */
                <div className="flex justify-end">
                  <div className="max-w-[80%] space-y-2">
                    {fileParts
                      .filter((p) => p.mediaType.startsWith("image/"))
                      .map((p, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={p.url}
                          alt="Uploaded image"
                          className="rounded-2xl max-w-full h-auto border border-border/30"
                        />
                      ))}
                    {textParts.map((p, i) => (
                      <div
                        key={i}
                        className="w-fit max-w-full ml-auto rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-base leading-relaxed break-words"
                      >
                        {p.text}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Assistant message ── */
                <div className="space-y-4">
                  {/* Assistant replies stay full-width and visually calm. */}
                  {textParts.length > 0 && (
                    <div className="break-words border-l-2 border-primary/30 py-1 pl-4 pr-1 sm:pl-5">
                      <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">MinMin AI</p>
                      {textParts.map((p, i) => (
                        <div
                          key={i}
                          className="chat-markdown prose dark:prose-invert max-w-none text-base [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {p.text}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* File parts (images from the model) */}
                  {fileParts
                    .filter((p) => p.mediaType.startsWith("image/"))
                    .map((p, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={p.url}
                        alt="Generated image"
                        className="rounded-2xl max-w-sm h-auto border border-border/30"
                      />
                    ))}

                  {/* Tool parts — rendered as their own cards */}
                  {toolParts.map((part) => {
                    const toolKey =
                      "toolCallId" in part && typeof part.toolCallId === "string"
                        ? part.toolCallId
                        : `${message.id}-tool-${part.type}`;
                    return <ToolRenderer key={toolKey} part={part} />;
                  })}
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-sm">Thinking…</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
