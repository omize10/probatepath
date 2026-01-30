import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const UpsertSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  quizAnswers: z.record(z.string(), z.unknown()).optional(),
  recommendedTier: z.string().optional(),
  selectedTier: z.string().optional(),
  grantType: z.string().optional(),
  redFlags: z.array(z.string()).optional(),
});

/**
 * POST — Create or update a PendingIntake record.
 * Upserts by email. Only updates if status is still 'in_progress'.
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ id: null, status: "no_db" }, { status: 200 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, phone, quizAnswers, recommendedTier, selectedTier, grantType, redFlags } =
    parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    // Check if a record already exists
    const existing = await prisma.pendingIntake.findUnique({
      where: { email: normalizedEmail },
    });

    // Don't overwrite converted records
    if (existing && existing.status === "converted_to_account") {
      return NextResponse.json({
        id: existing.id,
        status: existing.status,
        isResuming: false,
      });
    }

    const updateData: Record<string, unknown> = {};
    if (phone !== undefined) updateData.phone = phone;
    if (quizAnswers !== undefined) updateData.quizAnswers = quizAnswers;
    if (recommendedTier !== undefined) updateData.recommendedTier = recommendedTier;
    if (selectedTier !== undefined) updateData.selectedTier = selectedTier;
    if (grantType !== undefined) updateData.grantType = grantType;
    if (redFlags !== undefined) updateData.redFlags = redFlags;

    const record = await prisma.pendingIntake.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        phone: phone ?? null,
        quizAnswers: quizAnswers ? (quizAnswers as Prisma.InputJsonValue) : undefined,
        recommendedTier,
        selectedTier,
        grantType,
        redFlags: redFlags ?? undefined,
      },
      update: updateData,
    });

    const isResuming =
      existing !== null &&
      existing.quizAnswers !== null &&
      Object.keys(existing.quizAnswers as object).length > 0;

    return NextResponse.json({
      id: record.id,
      status: record.status,
      isResuming,
    });
  } catch (error) {
    console.error("[pending-intake] Error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

/**
 * GET — Check if a PendingIntake exists for an email.
 * Query param: ?email=user@example.com
 */
export async function GET(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ found: false });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "email param required" }, { status: 400 });
  }

  try {
    const record = await prisma.pendingIntake.findUnique({
      where: { email },
      select: {
        id: true,
        quizAnswers: true,
        recommendedTier: true,
        selectedTier: true,
        grantType: true,
        redFlags: true,
        status: true,
        phone: true,
      },
    });

    if (!record || record.status === "converted_to_account") {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      pendingIntake: record,
    });
  } catch (error) {
    console.error("[pending-intake] GET error:", error);
    return NextResponse.json({ found: false });
  }
}
