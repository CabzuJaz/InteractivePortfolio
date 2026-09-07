import { appendFile, chmod, mkdir } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, resolve, sep } from "node:path";
import { execFile } from "node:child_process";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const accessSchema = z.object({
  system: z.enum(["WordPress", "GorillaDesk", "Answering service", "Slack", "Discord", "Private response log", "Other"]),
  accessArea: z.string().trim().min(2).max(100),
  accountEmail: z.union([z.literal(""), z.string().trim().email().max(254)]),
  loginUrl: z.union([z.literal(""), z.string().trim().url().max(500)]),
  permission: z.string().trim().min(2).max(500),
  credentialReference: z.string().trim().max(500),
  submittedBy: z.enum(["Larry", "Tyson", "Jazz", "Other"]),
  notes: z.string().trim().max(1000),
  website: z.string().max(200).optional(),
});

type AccessSubmission = z.infer<typeof accessSchema>;

const submissionWindows = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;
const obviousSecretPattern = /(?:^|\n)\s*(?:password|passcode|api[_ -]?key|secret|access[_ -]?token|recovery[_ -]?code)\s*[:=]\s*\S+/i;

function json(body: object, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isRateLimited(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const client = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const recent = (submissionWindows.get(client) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);

  if (recent.length >= RATE_LIMIT) {
    submissionWindows.set(client, recent);
    return true;
  }

  recent.push(now);
  submissionWindows.set(client, recent);
  return false;
}

function discordValue(value: string) {
  return (value.trim() || "Not provided").slice(0, 1024);
}

function readKeychainPassword(service: string) {
  return new Promise<string>((resolvePassword, rejectPassword) => {
    execFile(
      "/usr/bin/security",
      ["find-generic-password", "-s", service, "-w"],
      { encoding: "utf8", timeout: 5000, maxBuffer: 4096 },
      (error, stdout) => {
        if (error) {
          rejectPassword(new Error("Discord webhook Keychain entry is unavailable"));
          return;
        }
        resolvePassword(stdout.trim());
      },
    );
  });
}

async function getDiscordWebhookUrl() {
  let configuredUrl = process.env.BUG_MAN_ACCESS_DISCORD_WEBHOOK_URL?.trim();
  const keychainService = process.env.BUG_MAN_ACCESS_DISCORD_WEBHOOK_KEYCHAIN_SERVICE?.trim() || "discord-creds-notif";

  if (!configuredUrl && process.platform === "darwin") {
    configuredUrl = await readKeychainPassword(keychainService);
  }
  if (!configuredUrl) return null;

  const webhookUrl = new URL(configuredUrl);
  const isDiscordHost =
    webhookUrl.hostname === "discord.com" ||
    webhookUrl.hostname.endsWith(".discord.com") ||
    webhookUrl.hostname === "discordapp.com" ||
    webhookUrl.hostname.endsWith(".discordapp.com");

  if (webhookUrl.protocol !== "https:" || !isDiscordHost || !webhookUrl.pathname.startsWith("/api/webhooks/")) {
    throw new Error("BUG_MAN_ACCESS_DISCORD_WEBHOOK_URL is not a valid Discord webhook");
  }
  return webhookUrl.toString();
}

async function sendDiscordNotification(access: Omit<AccessSubmission, "website">, recordId: string, submittedAt: string) {
  const webhookUrl = await getDiscordWebhookUrl();
  if (!webhookUrl) return false;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Bug-Man Access",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: "New Bug-Man access response",
        description: "A new response was saved to the private server log.",
        color: 0x06b6d4,
        fields: [
          { name: "System", value: discordValue(access.system), inline: true },
          { name: "Submitted by", value: discordValue(access.submittedBy), inline: true },
          { name: "Record ID", value: discordValue(recordId), inline: false },
          { name: "Access area", value: discordValue(access.accessArea), inline: false },
          { name: "Account email", value: discordValue(access.accountEmail), inline: false },
          { name: "Login URL", value: discordValue(access.loginUrl), inline: false },
          { name: "Required permission", value: discordValue(access.permission), inline: false },
          { name: "Credential reference", value: discordValue(access.credentialReference), inline: false },
          { name: "Notes", value: discordValue(access.notes), inline: false },
        ],
        timestamp: submittedAt,
        footer: { text: "Passwords and secret values must remain in the approved vault." },
      }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Discord webhook returned " + response.status);
  }
  return true;
}

function resolvePrivateLogPath() {
  const configuredPath = process.env.BUG_MAN_ACCESS_LOG_PATH?.trim();
  if (!configuredPath && process.env.NODE_ENV === "production") {
    throw new Error("BUG_MAN_ACCESS_LOG_PATH is required in production");
  }

  const workingDirectory = process.cwd();
  const logPath = configuredPath
    ? resolve(isAbsolute(configuredPath) ? configuredPath : join(/* turbopackIgnore: true */ workingDirectory, configuredPath))
    : join(/* turbopackIgnore: true */ workingDirectory, ".private", "bug-man", "access-submissions.txt");

  const publicDirectory = resolve(/* turbopackIgnore: true */ workingDirectory, "public");
  const buildDirectory = resolve(/* turbopackIgnore: true */ workingDirectory, ".next");
  if (
    logPath === publicDirectory ||
    logPath.startsWith(publicDirectory + sep) ||
    logPath === buildDirectory ||
    logPath.startsWith(buildDirectory + sep) ||
    extname(logPath).toLowerCase() !== ".txt"
  ) {
    throw new Error("BUG_MAN_ACCESS_LOG_PATH must point to a private .txt file outside public and .next");
  }

  return logPath;
}

async function savePrivateRecord(record: object, recordId: string, submittedAt: string) {
  if (process.env.VERCEL) {
    const dateFolder = submittedAt.slice(0, 10);
    await put(
      "bug-man/access-responses/" + dateFolder + "/" + recordId + ".txt",
      JSON.stringify(record, null, 2) + "\n",
      {
        access: "private",
        addRandomSuffix: false,
        contentType: "text/plain; charset=utf-8",
        cacheControlMaxAge: 60,
      },
    );
    return;
  }

  const logPath = resolvePrivateLogPath();
  await mkdir(dirname(logPath), { recursive: true, mode: 0o700 });
  await appendFile(logPath, JSON.stringify(record) + "\n", {
    encoding: "utf8",
    flag: "a",
    mode: 0o600,
  });
  await chmod(logPath, 0o600);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ error: "This submission was not accepted." }, 403);
  }

  if (isRateLimited(request)) {
    return json({ error: "Too many submissions. Please wait a few minutes and try again." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "The submitted form was not valid." }, 400);
  }

  const parsed = accessSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Check the required fields and enter a valid email or URL." }, 400);
  }

  if (parsed.data.website) {
    return json({ ok: true, notificationSent: true }, 200);
  }

  const textFields = [parsed.data.permission, parsed.data.credentialReference, parsed.data.notes];
  if (textFields.some((value) => obviousSecretPattern.test(value))) {
    return json({ error: "Remove passwords, API keys, tokens, or recovery codes. Enter only a secure credential reference." }, 400);
  }
  if (/https?:\/\//i.test(parsed.data.credentialReference)) {
    return json({ error: "Do not paste a secure-share URL. Enter only the credential vault item name." }, 400);
  }

  const access: Omit<AccessSubmission, "website"> = {
    system: parsed.data.system,
    accessArea: parsed.data.accessArea,
    accountEmail: parsed.data.accountEmail,
    loginUrl: parsed.data.loginUrl,
    permission: parsed.data.permission,
    credentialReference: parsed.data.credentialReference,
    submittedBy: parsed.data.submittedBy,
    notes: parsed.data.notes,
  };
  const recordId = "BM-ACCESS-" + Date.now() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const submittedAt = new Date().toISOString();
  const record = {
    recordId,
    submittedAt,
    ...access,
    status: "Submitted",
  };

  try {
    await savePrivateRecord(record, recordId, submittedAt);
  } catch (error) {
    console.error("[bug-man-access] Private file save failed:", error instanceof Error ? error.message : "Unknown file error");
    return json({ error: "The details could not be saved to the private server file. Jazz has been asked to check storage." }, 503);
  }

  let notificationSent = false;
  try {
    notificationSent = await sendDiscordNotification(access, recordId, submittedAt);
  } catch (error) {
    console.error("[bug-man-access] Discord notification failed:", error instanceof Error ? error.message : "Unknown Discord error");
  }

  return json({ ok: true, recordId, notificationSent }, 201);
}
