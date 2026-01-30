import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { z } from "zod";
import { AI_CALL_STATUS } from "@/lib/retell/types";

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;
const RETELL_PHONE_NUMBER = process.env.RETELL_PHONE_NUMBER; // The number Retell calls from

const OutboundCallSchema = z.object({
  phone_number: z.string().min(10, "Phone number required"),
  name: z.string().optional(),
  email: z.string().email().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Trigger an outbound call via Retell AI
 * User provides their phone number and Retell calls them
 */
export async function POST(request: Request) {
  // Validate Retell is configured
  if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
    console.warn("[retell/outbound-call] Retell not configured - returning mock response");
    // Return mock response for development
    return NextResponse.json({
      success: true,
      call_id: `mock_${Date.now()}`,
      status: "initiated",
      message: "Development mode - call simulated",
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = OutboundCallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { phone_number, name, email, metadata } = parsed.data;

  // Format phone number for Retell (needs E.164 format)
  const formattedPhone = formatPhoneNumber(phone_number);
  if (!formattedPhone) {
    return NextResponse.json(
      { error: "Invalid phone number format" },
      { status: 400 }
    );
  }

  try {
    // Create AI call record first (if prisma enabled)
    let aiCallId: string | undefined;
    if (prismaEnabled) {
      try {
        const aiCall = await prisma.aiCall.create({
          data: {
            phoneNumber: formattedPhone,
            status: AI_CALL_STATUS.INITIATED,
            collectedData: {
              name,
              email,
              ...metadata,
            },
          },
        });
        aiCallId = aiCall.id;
      } catch (dbErr) {
        console.error("[retell/outbound-call] DB error creating AiCall:", dbErr);
        // Continue without DB record - call can still proceed
      }
    }

    // Trigger outbound call via Retell API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let retellResponse: Response;
    try {
      retellResponse = await fetch("https://api.retellai.com/v2/create-phone-call", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          from_number: RETELL_PHONE_NUMBER,
          to_number: formattedPhone,
          agent_id: RETELL_AGENT_ID,
          metadata: {
            ai_call_id: aiCallId,
            name,
            email,
            ...metadata,
          },
          retell_llm_dynamic_variables: {
            caller_name: name || "there",
          },
        }),
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const isTimeout = fetchErr instanceof DOMException && fetchErr.name === "AbortError";
      console.error("[retell/outbound-call] Retell fetch failed:", isTimeout ? "timeout" : fetchErr);

      // Update AI call status if we created one
      if (aiCallId && prismaEnabled) {
        await prisma.aiCall.update({
          where: { id: aiCallId },
          data: { status: AI_CALL_STATUS.FAILED },
        }).catch(() => {});
      }

      return NextResponse.json(
        { error: isTimeout ? "Call service timed out" : "Unable to reach call service", fallback: true },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (!retellResponse.ok) {
      const errorData = await retellResponse.text().then(t => {
        try { return JSON.parse(t); } catch { return { raw: t }; }
      });
      console.error("[retell/outbound-call] Retell API error:", retellResponse.status, errorData);

      if (aiCallId && prismaEnabled) {
        await prisma.aiCall.update({
          where: { id: aiCallId },
          data: { status: AI_CALL_STATUS.FAILED },
        }).catch(() => {});
      }

      return NextResponse.json(
        { error: "Failed to initiate call", details: errorData, fallback: true },
        { status: 502 }
      );
    }

    // Parse Retell success response safely
    let retellData: Record<string, unknown> = {};
    try {
      const text = await retellResponse.text();
      retellData = text ? JSON.parse(text) : {};
    } catch {
      console.warn("[retell/outbound-call] Could not parse Retell response body");
    }
    const retellCallId = retellData.call_id as string | undefined;

    // Update AI call with Retell call ID
    if (aiCallId && prismaEnabled && retellCallId) {
      await prisma.aiCall.update({
        where: { id: aiCallId },
        data: { retellCallId },
      }).catch(() => {});
    }

    console.log("[retell/outbound-call] Call initiated:", {
      aiCallId,
      retellCallId,
      phone: formattedPhone.slice(0, 5) + "..."
    });

    return NextResponse.json({
      success: true,
      call_id: retellCallId || aiCallId,
      ai_call_id: aiCallId,
      status: "initiated",
    });
  } catch (error) {
    console.error("[retell/outbound-call] Error:", error);
    return NextResponse.json(
      { error: "Failed to initiate call", fallback: true },
      { status: 500 }
    );
  }
}

/**
 * Format phone number to E.164 format
 * Assumes North American numbers if no country code
 */
function formatPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle different formats
  if (digits.length === 10) {
    // North American without country code
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    // North American with country code
    return `+${digits}`;
  } else if (digits.length > 10) {
    // Already has country code
    return `+${digits}`;
  }

  // Invalid
  return null;
}
