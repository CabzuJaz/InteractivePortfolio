import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BUG_MAN_COOKIE, isPassphrase, sessionToken } from "@/lib/bug-man/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

const attemptWindows = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 10;
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function isRateLimited(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const client = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const recent = (attemptWindows.get(client) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);

  if (recent.length >= RATE_LIMIT) {
    attemptWindows.set(client, recent);
    return true;
  }

  recent.push(now);
  attemptWindows.set(client, recent);
  return false;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ error: "This request was not accepted." }, 403);
  }

  if (isRateLimited(request)) {
    return json({ error: "Too many attempts. Please wait a few minutes and try again." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Enter the access code." }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Enter the access code." }, 400);
  }

  const token = sessionToken();
  if (!token) {
    console.error("[bug-man-login] BUG_MAN_PASSWORD is not configured");
    return json({ error: "This page is not ready yet. Please contact Jazz." }, 503);
  }

  if (!isPassphrase(parsed.data.password.trim())) {
    return json({ error: "That code did not match. Check the message from Jazz and try again." }, 401);
  }

  const response = json({ ok: true }, 200);
  response.cookies.set(BUG_MAN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
