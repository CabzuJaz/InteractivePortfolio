"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { BugMark } from "./bug-mark";

export default function BugManLogin() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const unlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bug-man/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || "That code did not work.");
      }

      // A full navigation so the server renders the gated route with the new cookie.
      window.location.assign("/bug-man/dashboard");
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : "That code did not work.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-18 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <BugMark />
          <p className="text-base font-semibold">Bug-Man Phase 1</p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
        <Card className="gap-0 rounded-2xl border-border bg-card py-0 ring-0">
          <CardContent className="p-6 sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">This page is private.</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter the access code Jazz sent you. You only need to do this once on this device.</p>

            <form className="mt-6 space-y-4" onSubmit={unlock}>
              <label className="block text-sm font-medium">
                Access code
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  maxLength={200}
                  required
                />
              </label>

              {error && (
                <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? "Checking…" : "Open the dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm leading-6 text-muted-foreground">Lost the code? Reply to Jazz&apos;s message and she will resend it.</p>
      </main>
    </div>
  );
}
