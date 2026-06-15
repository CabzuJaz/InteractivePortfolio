"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectedFile {
  file: File;
  preview: string;
}

interface ChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200; // max height in px
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      for (const sf of selectedFiles) URL.revokeObjectURL(sf.preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: SelectedFile[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue; // 10 MB limit
      newFiles.push({ file, preview: URL.createObjectURL(file) });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && selectedFiles.length === 0) || isLoading) return;

    const files = selectedFiles.map((sf) => sf.file);
    onSubmit(trimmed, files.length > 0 ? files : undefined);

    setInput("");
    setSelectedFiles([]);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4 pb-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Attach images"
      />

      <div className="flex-1 relative">
        {/* Image previews */}
        {selectedFiles.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {selectedFiles.map((sf, i) => (
              <div key={i} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sf.preview}
                  alt={sf.file.name}
                  className="h-16 w-16 rounded-lg object-cover border border-border/50"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  aria-label={`Remove ${sf.file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5">
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 mb-1"
            aria-label="Attach image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedFiles.length > 0
                ? "Add a message about this image…"
                : "Ask me anything…"
            }
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-border/50 bg-card px-4 py-3 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 min-h-[48px]"
            aria-label="Chat message"
            style={{ maxHeight: "200px" }}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="icon"
        disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
        className="rounded-full w-12 h-12 shrink-0 mb-1"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
