import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM ?? "notifications@example.com";
const to = "hello@probatedesk.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const subject = `Non-Executor Inquiry - ${name}`;
    const html = `
      <h2>New Non-Executor Inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Submitted at: ${new Date().toISOString()}<br>
        This person indicated they are not the executor when starting the onboarding flow.
      </p>
    `;

    if (!resend) {
      console.warn("[non-executor-contact] RESEND_API_KEY not configured; logging email only");
      console.log("[non-executor-contact] Would send email:", { to, subject, name, email, message });
      return NextResponse.json({ success: true });
    }

    const result = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      html,
    });

    console.log("[non-executor-contact] Email sent:", { resendId: result.data?.id, name, email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[non-executor-contact] Error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
