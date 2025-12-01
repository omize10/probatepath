import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/log-auth-event";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(12, "Use at least 12 characters"),
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

    return NextResponse.json({ success: true, id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("[auth] Failed to register user", error);
    return NextResponse.json({ success: false, error: "Unable to create your account right now." }, { status: 500 });
  }
}
