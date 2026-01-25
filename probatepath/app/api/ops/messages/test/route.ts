import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendMessage } from "@/lib/messaging/service";
import { z } from "zod";

/**
 * Check ops authentication
 */
async function requireOpsAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("ops_auth")?.value === "1";
}

const TestSendSchema = z.object({
  key: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  variables: z.record(z.string(), z.string()).optional(),
});

/**
 * POST /api/ops/messages/test - Send a test message
 */
export async function POST(request: Request) {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = TestSendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { key, email, phone, variables = {} } = parsed.data;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "At least one of email or phone is required" },
        { status: 400 }
      );
    }

    // Add default sample variables if not provided
    const sampleVariables: Record<string, string> = {
      name: "Test User",
      portalLink: "https://probatedesk.com/portal",
      resumeLink: "https://probatedesk.com/resume/test-token",
      link: "https://probatedesk.com/link/test",
      code: "123456",
      url: "https://probatedesk.com/signin/test-link",
      paymentUrl: "https://probatedesk.com/pay?token=test",
      deceasedName: "John Smith",
      ...variables, // User-provided variables override defaults
    };

    const result = await sendMessage({
      templateKey: key,
      to: { email, phone },
      variables: sampleVariables,
      meta: { test: true, sentBy: "ops-admin" },
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Test message sent to ${[email, phone].filter(Boolean).join(" and ")}`,
    });
  } catch (error) {
    console.error("[api/ops/messages/test] Error:", error);
    return NextResponse.json({ error: "Failed to send test message" }, { status: 500 });
  }
}
