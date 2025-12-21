import { NextResponse } from "next/server";

export const runtime = "nodejs";

const dummyPayload = {
  ticketId: `TEST-${Date.now().toString(36)}`,
  email: "",
  userId: "",
  pageUrl: "http://localhost/support-test",
  issueType: "Ops",
  severity: "Low",
  message: "Support webhook self-test ping",
  userAgent: "support-test",
  sheetId: "",
};

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const webhookUrl = process.env.SUPPORT_SHEET_WEBHOOK_URL;
  const secret = process.env.SUPPORT_SHEET_SECRET;

  if (!webhookUrl || !secret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 500 });
  }

  const targetUrl = `${webhookUrl}?secret=${encodeURIComponent(secret)}`;
  let text = "";
  let json: unknown = null;
  let status = 0;
  let errorHint: string | null = null;

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dummyPayload),
    });
    status = res.status;
    text = await res.text();
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    const refMatch = text.match(/ReferenceError:[^<]+/);
    const excMatch = text.match(/Exception:[^<]+/);
    const msg = refMatch?.[0] ?? excMatch?.[0];
    errorHint = msg ? msg.trim() : null;

    console.log("[support test] webhook", {
      host: (() => {
        try {
          return new URL(webhookUrl).host;
        } catch {
          return "invalid-url";
        }
      })(),
      secret: secret ? `***${secret.slice(-4)}` : "missing",
      status,
      textLength: text.length,
      textPreview: text.slice(0, 120),
    });
  } catch (error) {
    return NextResponse.json({ error: "Request failed", detail: String(error) }, { status: 500 });
  }

  return NextResponse.json({ status, response: json, text, errorHint });
}
