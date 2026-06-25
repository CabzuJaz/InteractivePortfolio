/**
 * Proxy route for GHL webhooks → n8n.
 *
 * GHL sends webhooks here; this route forwards them to n8n with retry/backoff.
 * This prevents lost events when n8n is sleeping on Render's free tier.
 *
 * Vercel functions are always warm, so this acts as a reliable buffer.
 *
 * Idempotent: if n8n is down, returns 503 after retries — GHL will retry on its own.
 */

import { NextRequest, NextResponse } from "next/server";

const N8N_BASE = process.env.N8N_URL ?? "https://eightn-render.onrender.com";
const MAX_RETRIES = 3;
const BACKOFF_MS = [2000, 5000, 10000]; // 2s, 5s, 10s

const WEBHOOK_MAP: Record<string, string> = {
  "proposal-sent": "contract-sent",
  "downpayment-paid": "downpayment-paid",
  "done": "project-done",
  "final-payment-paid": "final-payment-paid",
};

async function forwardToN8n(
  n8nPath: string,
  body: string,
): Promise<{ ok: boolean; status: number }> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${N8N_BASE}/webhook/${n8nPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) return { ok: true, status: res.status };

      // If n8n returns 404 (workflow not found or sleeping), retry
      if (res.status === 404 || res.status >= 500) {
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
          continue;
        }
      }

      return { ok: false, status: res.status };
    } catch {
      // Network error — n8n likely sleeping
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
        continue;
      }
      return { ok: false, status: 0 };
    }
  }

  return { ok: false, status: 0 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    // Determine which n8n webhook to call based on tag
    const tag = params.get("tag") ?? "";
    const n8nPath = WEBHOOK_MAP[tag];

    if (!n8nPath) {
      // Unknown tag — log and return ok (don't break GHL)
      console.warn(`[proxy-webhook] Unknown tag: ${tag}`);
      return NextResponse.json({ ok: true, forwarded: false });
    }

    const result = await forwardToN8n(n8nPath, body);

    if (result.ok) {
      return NextResponse.json({ ok: true, forwarded: true, n8nPath });
    }

    console.error(
      `[proxy-webhook] Failed to forward to n8n/${n8nPath}: status=${result.status}`,
    );
    return NextResponse.json(
      { ok: false, error: "n8n unavailable after retries" },
      { status: 503 },
    );
  } catch (err) {
    console.error("[proxy-webhook] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 },
    );
  }
}
