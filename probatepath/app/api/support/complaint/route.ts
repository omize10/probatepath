import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ISSUE_TYPES = ["Intake", "Upload", "Portal", "Payment", "Ops", "Other"] as const;
const SEVERITIES = ["Low", "Normal", "High"] as const;
const rateLimitMap = new Map<string, number[]>();

type ComplaintInput = {
  email?: unknown;
  message?: unknown;
  issueType?: unknown;
  severity?: unknown;
  pageUrl?: unknown;
  userAgent?: unknown;
};

function getClientIp(request: Request) {
  const headerValue = request.headers.get("x-forwarded-for");
  if (!headerValue) return "unknown";
  return headerValue.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

function generateTicketId() {
  const randomId = randomBytes(9).toString("base64url").slice(0, 12);
  return `T${randomId}`;
}

function isValidString(input: unknown) {
  return typeof input === "string" && input.trim().length > 0;
}

function logDebug(payload: { host: string; secretSuffix: string; status: number; text: string }) {
  if (process.env.NODE_ENV !== "development") return;
  const { host, secretSuffix, status, text } = payload;
  console.log("[support] webhook", {
    host,
    secret: secretSuffix ? `***${secretSuffix}` : "missing",
    status,
    textLength: text.length,
    textPreview: text.slice(0, 120),
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: ComplaintInput;
  try {
    body = (await request.json()) as ComplaintInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email;
  const message = body.message;
  const issueType = body.issueType;
  const severity = body.severity;
  const pageUrl = body.pageUrl;
  const userAgent = body.userAgent;

  if (email !== undefined && typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!isValidString(message) || (message as string).trim().length < 10 || (message as string).length > 2000) {
    return NextResponse.json({ error: "Message must be between 10 and 2000 characters" }, { status: 400 });
  }

  if (!isValidString(issueType) || !ISSUE_TYPES.includes(issueType as (typeof ISSUE_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid issue type" }, { status: 400 });
  }

  if (!isValidString(severity) || !SEVERITIES.includes(severity as (typeof SEVERITIES)[number])) {
    return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
  }

  if (!isValidString(pageUrl)) {
    return NextResponse.json({ error: "Missing page URL" }, { status: 400 });
  }

  const webhookUrl = process.env.SUPPORT_SHEET_WEBHOOK_URL;
  const secret = process.env.SUPPORT_SHEET_SECRET;

  if (!webhookUrl || !secret) {
    console.error("[support] Missing webhook configuration");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const ticketId = generateTicketId();
  const targetUrl = `${webhookUrl}?secret=${encodeURIComponent(secret)}`;
  const payload = {
    ticketId,
    email: email ? String(email) : "",
    userId: "",
    pageUrl: String(pageUrl),
    issueType: String(issueType),
    severity: String(severity),
    message: String(message).trim(),
    userAgent: typeof userAgent === "string" ? userAgent : "",
    sheetId: "",
  };

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    const responseJson = (() => {
      try {
        return JSON.parse(responseText) as { ok?: boolean; error?: string } | null;
      } catch {
        return null;
      }
    })();

    const errorHint = (() => {
      const refMatch = responseText.match(/ReferenceError:[^<]+/);
      const excMatch = responseText.match(/Exception:[^<]+/);
      const msg = refMatch?.[0] ?? excMatch?.[0];
      return msg ? msg.trim() : null;
    })();

    let host = "invalid-url";
    try {
      host = new URL(webhookUrl).host;
    } catch {
      host = "invalid-url";
    }

    logDebug({
      host,
      secretSuffix: secret.slice(-4),
      status: res.status,
      text: responseText,
    });

    const success = res.ok && responseJson?.ok === true;
    if (!success) {
      console.error("[support] Webhook failed", { status: res.status, body: responseText });
      return NextResponse.json(
        {
          error:
            responseJson?.error ??
            (errorHint ? `Unable to record support request. Apps Script error: ${errorHint}` : null) ??
            "Unable to record support request. If Apps Script execution logs show hits but no rows, update the Apps Script to open the sheet by ID.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[support] Webhook request error", { error });
    return NextResponse.json({ error: "Failed to forward request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ticketId });
}
