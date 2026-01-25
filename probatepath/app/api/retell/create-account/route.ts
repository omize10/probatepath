import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const CreateAccountSchema = z.object({
  call_id: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  name: z.string().optional(),
});

/**
 * Create or link a user account during an AI call
 * Called by Retell when AI collects email from caller
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  // Get raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("x-retell-signature");

  if (!verifyRetellSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id, email, phone, name } = parsed.data;

  try {
    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      // Create new user (no password - will need to set one later)
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          phone: phone || null,
          createdVia: "ai_call",
        },
      });
      isNewUser = true;
      console.log("[retell/create-account] Created new user:", user.id);
    } else {
      // Update phone if provided and not already set
      if (phone && !user.phone) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone },
        });
      }
      console.log("[retell/create-account] Found existing user:", user.id);
    }

    // Create a new Matter for this intake
    const clientKey = uuidv4();
    const matter = await prisma.matter.create({
      data: {
        userId: user.id,
        clientKey,
        status: "DRAFT",
        intakeSource: "ai_call",
        portalStatus: "intake_complete",
      },
    });
    console.log("[retell/create-account] Created matter:", matter.id);

    // Link the AI call to user and matter
    await prisma.aiCall.update({
      where: { retellCallId: call_id },
      data: {
        userId: user.id,
        matterId: matter.id,
        status: "in_progress",
      },
    });

    // Create lead source record
    await prisma.leadSource.create({
      data: {
        userId: user.id,
        matterId: matter.id,
        source: "retell_call",
        channel: "phone",
      },
    });

    return NextResponse.json({
      success: true,
      user_id: user.id,
      matter_id: matter.id,
      is_new: isNewUser,
    });
  } catch (error) {
    console.error("[retell/create-account] Error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
