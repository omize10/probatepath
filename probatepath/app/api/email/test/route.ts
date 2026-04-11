import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendTemplateEmail } from "@/lib/email";

// Ops-only manual email test. Requires ops_auth cookie — removed the previous
// "any authed user can send mail to themselves" version. Sends to the address
// in the request body if provided, else refuses.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("ops_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { to?: string };
  const to = typeof body.to === "string" ? body.to.trim() : "";
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Valid 'to' email required" }, { status: 400 });
  }

  await sendTemplateEmail({
    to,
    subject: "ProbateDesk ops test email",
    template: "ops_test",
    html: `<p>This is an ops test email from ProbateDesk.</p>`,
  });
  return NextResponse.json({ ok: true, to });
}
