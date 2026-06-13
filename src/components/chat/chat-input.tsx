"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
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
    // Reset so re-selecting the same file works
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

        <div className="flex items-center gap-1.5">
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            aria-label="Attach image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedFiles.length > 0
                ? "Add a message about this image…"
                : "Ask me anything…"
            }
            disabled={isLoading}
            className="flex-1 rounded-full border border-border/50 bg-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            aria-label="Chat message"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="icon"
        disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
        className="rounded-full w-12 h-12 shrink-0"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
