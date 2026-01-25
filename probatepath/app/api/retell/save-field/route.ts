import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { z } from "zod";
import { FIELD_MAPPING } from "@/lib/retell/types";
import type { Prisma } from "@prisma/client";

const SaveFieldSchema = z.object({
  call_id: z.string(),
  field: z.string(),
  value: z.unknown(),
  confidence: z.number().optional(),
});

/**
 * Save an individual field collected during an AI call
 * Called by Retell when AI extracts information from the conversation
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

  const parsed = SaveFieldSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id, field, value, confidence } = parsed.data;

  try {
    // Get the AI call record
    const aiCall = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Update collected_data JSON field
    const currentData = (aiCall.collectedData as Record<string, unknown>) || {};
    const updatedData = {
      ...currentData,
      [field]: value,
    };

    // Track confidence scores separately if provided
    const currentConfidence = (aiCall.qualificationFlags as Record<string, unknown>) || {};
    const updatedConfidence = confidence
      ? { ...currentConfidence, [`${field}_confidence`]: confidence }
      : currentConfidence;

    await prisma.aiCall.update({
      where: { id: aiCall.id },
      data: {
        collectedData: updatedData as Prisma.InputJsonValue,
        qualificationFlags: updatedConfidence as Prisma.InputJsonValue,
      },
    });

    console.log("[retell/save-field] Saved field:", { call_id, field, value });

    // Check if this field maps to a known intake/matter field
    const mapping = FIELD_MAPPING[field];
    if (mapping) {
      return NextResponse.json({
        success: true,
        mapped_to: mapping,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[retell/save-field] Error:", error);
    return NextResponse.json({ error: "Failed to save field" }, { status: 500 });
  }
}
