import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/log-auth-event";
import { sendTemplateEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter a password"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existing?.passwordHash) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
      },
    });

    await logAuthEvent({
      action: "REGISTER",
      userId: user.id,
      email: user.email,
      req: request,
    });

    const portalUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/portal`;
    await sendTemplateEmail({
      to: user.email,
      subject: "Welcome to ProbateDesk",
      template: "welcome",
      html: [
        `<p>Hi ${user.name ?? "there"},</p>`,
        `<p>Your ProbateDesk account is ready.</p>`,
        `<p>When you're ready to begin, log in and start your intake. We'll walk you through every step of the BC probate process.</p>`,
        `<p><a href="${portalUrl}">Go to your portal</a></p>`,
        `<p>If you have questions, reply to this email or call 604-123-4567.</p>`,
        `<p>Thanks,<br/>ProbateDesk</p>`,
      ].join(""),
    }).catch((err) => {
      console.error("[auth] Welcome email failed", { email: user.email, error: err });
    });

    return NextResponse.json({ success: true, id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("[auth] Failed to register user", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    // Temporarily show debug info to diagnose production issue
    return NextResponse.json({
      success: false,
      error: "Unable to create your account right now.",
      debug: { name: err.name, message: err.message },
    }, { status: 500 });
  }
}
