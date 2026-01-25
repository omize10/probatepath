import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(request: Request) {
  // Only allow in dev mode
  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (!isDev) {
    return NextResponse.json({ error: "Dev mode only" }, { status: 403 });
  }

  try {
    const { to } = await request.json();
    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "Missing 'to' phone number" }, { status: 400 });
    }

    const result = await sendSMS({
      to,
      body: `ProbateDesk Test SMS - ${new Date().toLocaleTimeString()}. If you received this, SMS is working!`,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? `Test SMS sent to ${to}` : `Failed: ${result.error}`,
      details: {
        to,
        hasTwilioConfig: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        fromNumber: process.env.TWILIO_PHONE_NUMBER ?? "not set",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to send SMS", success: false },
      { status: 500 }
    );
  }
}
