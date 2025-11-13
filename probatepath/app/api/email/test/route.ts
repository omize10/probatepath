import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendTemplateEmail } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await sendTemplateEmail({
    to: session.user.email,
    subject: "ProbatePath test email",
    template: "test",
    html: `<p>This is a test email from ProbatePath.</p>`,
  });
  return NextResponse.json({ ok: true });
}
