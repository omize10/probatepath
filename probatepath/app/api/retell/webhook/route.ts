import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { RetellWebhookEvent, AI_CALL_STATUS, NO_ANSWER_REASONS } from "@/lib/retell/types";

/**
 * Main Retell webhook router
 * Receives all webhook events from Retell and routes to appropriate handlers
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  // Get raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("x-retell-signature");

  // Verify signature
  const isValidSignature = verifyRetellSignature(rawBody, signature);
  if (!isValidSignature) {
    console.error("[retell/webhook] ❌ REJECTED - Invalid signature:", {
      has_signature: !!signature,
      has_api_key: !!process.env.RETELL_API_KEY,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("[retell/webhook] ✅ Signature verified successfully");

  // Parse the event
  let event: RetellWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error("[retell/webhook] Failed to parse JSON from webhook body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_type, call_id } = event;
  console.log("[retell/webhook] ✅ Received event:", {
    event_type,
    call_id,
    timestamp: new Date().toISOString(),
    has_signature: !!signature,
  });

  // Log full payload in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("[retell/webhook] Full payload:", JSON.stringify(event, null, 2));
  }

  try {
    switch (event_type) {
      case "call_started":
        return handleCallStarted(event);

      case "call_ended":
        return handleCallEnded(event);

      case "function_call":
        return handleFunctionCall(event);

      case "transcript_update":
        // Just acknowledge - we don't need to process transcript updates
        return NextResponse.json({ success: true });

      default:
        console.warn("[retell/webhook] Unknown event type:", event_type);
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("[retell/webhook] Error processing event:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleCallStarted(event: RetellWebhookEvent) {
  const { call_id } = event;

  // Create or update AI call record
  await prisma.aiCall.upsert({
    where: { retellCallId: call_id },
    create: {
      retellCallId: call_id,
      status: AI_CALL_STATUS.CONNECTED,
    },
    update: {
      status: AI_CALL_STATUS.CONNECTED,
    },
  });

  console.log("[retell/webhook] Call started:", call_id);
  return NextResponse.json({ success: true });
}

async function handleCallEnded(event: RetellWebhookEvent) {
  const { call_id, duration_seconds, recording_url, transcript, end_reason } = event;

  console.log("[retell/webhook] handleCallEnded called:", { call_id, end_reason, duration_seconds });

  // Determine the appropriate status based on end_reason
  let status: string;
  if (end_reason === "error") {
    status = AI_CALL_STATUS.FAILED;
  } else if (NO_ANSWER_REASONS.includes(end_reason as typeof NO_ANSWER_REASONS[number])) {
    // User didn't pick up (no_answer, busy, voicemail, timeout, machine_detected)
    status = AI_CALL_STATUS.NO_ANSWER;
  } else {
    // Normal completion (user_hangup, agent_hangup, or undefined)
    status = AI_CALL_STATUS.COMPLETED;
  }

  console.log("[retell/webhook] Call status determined:", { call_id, status });

  // Update AI call record
  try {
    const updated = await prisma.aiCall.update({
      where: { retellCallId: call_id },
      data: {
        status,
        durationSeconds: duration_seconds,
        recordingUrl: recording_url,
        transcript,
        endedAt: new Date(),
      },
    });
    console.log("[retell/webhook] ✅ SUCCESS - Call ended - updated by retellCallId:", { call_id, status, duration_seconds, end_reason, recordId: updated.id });
  } catch (e) {
    // If no record with retellCallId, try to find by internal ID in metadata
    console.warn("[retell/webhook] ⚠️ Could not find call by retellCallId:", call_id, "error:", e);

    // Try to find by looking at recent initiated calls
    const recentCall = await prisma.aiCall.findFirst({
      where: {
        status: { in: [AI_CALL_STATUS.INITIATED, AI_CALL_STATUS.RINGING, AI_CALL_STATUS.CONNECTED] },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCall) {
      const updated = await prisma.aiCall.update({
        where: { id: recentCall.id },
        data: {
          retellCallId: call_id,
          status,
          durationSeconds: duration_seconds,
          recordingUrl: recording_url,
          transcript,
          endedAt: new Date(),
        },
      });
      console.log("[retell/webhook] ✅ SUCCESS - Call ended - found and updated recent call:", {
        internalId: recentCall.id,
        call_id,
        status,
        end_reason
      });
    } else {
      console.error("[retell/webhook] ❌ FAILED - No recent call found to update. Call may not have been initialized.", { call_id, end_reason });
    }
  }

  return NextResponse.json({ success: true });
}

async function handleFunctionCall(event: RetellWebhookEvent) {
  const { call_id, function_name, arguments: args } = event;

  if (!function_name) {
    return NextResponse.json({ error: "Missing function_name" }, { status: 400 });
  }

  console.log("[retell/webhook] Function call:", { call_id, function_name });

  // Route to the appropriate function handler
  // The actual function implementations are in separate route files
  // This webhook just acknowledges the function call
  // Retell will call the function endpoints directly
  return NextResponse.json({
    success: true,
    message: `Function ${function_name} acknowledged`,
  });
}
