import { NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/email";

export async function POST(request: Request) {
  // Only allow in dev mode
  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (!isDev) {
    return NextResponse.json({ error: "Dev mode only" }, { status: 403 });
  }

  try {
    const { to } = await request.json();
    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "Missing 'to' email address" }, { status: 400 });
    }

    const result = await sendTemplateEmail({
      to,
      subject: "ProbateDesk Test Email",
      template: "dev-test",
      html: `
        <h2>Test Email from ProbateDesk</h2>
        <p>This is a test email sent from the dev tools.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>If you received this, email is working correctly!</p>
      `,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? `Test email sent to ${to}` : `Failed: ${result.error}`,
      details: {
        to,
        hasResendKey: Boolean(process.env.RESEND_API_KEY),
        from: process.env.RESEND_FROM ?? "notifications@example.com",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to send email", success: false },
      { status: 500 }
    );
  }
}
