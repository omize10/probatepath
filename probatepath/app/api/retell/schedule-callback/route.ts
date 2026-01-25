import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { z } from "zod";
import { TIER_PRICES } from "@/lib/retell/types";

const ScheduleCallbackSchema = z.object({
  call_id: z.string(),
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // "9:00 AM", "2:30 PM", etc.
  phone_number: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schedule a follow-up callback
 * Called by Retell when caller wants to schedule a human callback
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

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

  const parsed = ScheduleCallbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id, date, time, phone_number, notes } = parsed.data;

  try {
    // Get the AI call record
    const aiCall = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    if (!aiCall.userId) {
      return NextResponse.json({ error: "No user linked to call" }, { status: 400 });
    }

    // Use provided phone or fall back to collected phone
    const phoneToUse = phone_number || aiCall.phoneNumber;
    if (!phoneToUse) {
      return NextResponse.json({ error: "No phone number available" }, { status: 400 });
    }

    // Get or create tier selection
    const tier = (aiCall.recommendedTier as "basic" | "standard" | "premium") || "standard";
    let tierSelection = await prisma.tierSelection.findFirst({
      where: { userId: aiCall.userId },
      orderBy: { createdAt: "desc" },
    });

    if (!tierSelection) {
      tierSelection = await prisma.tierSelection.create({
        data: {
          userId: aiCall.userId,
          selectedTier: tier,
          tierPrice: TIER_PRICES[tier],
        },
      });
    }

    // Create callback schedule
    const callback = await prisma.callbackSchedule.create({
      data: {
        userId: aiCall.userId,
        tierSelectionId: tierSelection.id,
        scheduledDate: new Date(date),
        scheduledTime: time,
        phoneNumber: phoneToUse,
        status: "scheduled",
        callNotes: notes,
      },
    });

    console.log("[retell/schedule-callback] Callback scheduled:", { call_id, callback_id: callback.id, date, time });

    return NextResponse.json({
      success: true,
      callback_id: callback.id,
      scheduled_date: date,
      scheduled_time: time,
      confirmation_message: `Your callback is scheduled for ${date} at ${time}. We'll call you at ${phoneToUse}.`,
    });
  } catch (error) {
    console.error("[retell/schedule-callback] Error:", error);
    return NextResponse.json({ error: "Failed to schedule callback" }, { status: 500 });
  }
}
