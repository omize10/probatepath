import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { RetellWebhookPayload, AI_CALL_STATUS, NO_ANSWER_REASONS } from "@/lib/retell/types";

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

  // Parse the payload
  let payload: RetellWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[retell/webhook] Failed to parse JSON from webhook body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.event;
  const callId = payload.call?.call_id;
  console.log("[retell/webhook] ✅ Received event:", {
    event: eventType,
    call_id: callId,
    timestamp: new Date().toISOString(),
  });

  try {
    switch (eventType) {
      case "call_started":
        return handleCallStarted(payload);

      case "call_ended":
        return handleCallEnded(payload);

      case "call_analyzed":
        // Acknowledge - analysis data is in payload.call.call_analysis
        console.log("[retell/webhook] Call analyzed:", callId);
        return NextResponse.json({ success: true });

      default:
        console.warn("[retell/webhook] Unknown event type:", eventType);
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("[retell/webhook] Error processing event:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleCallStarted(payload: RetellWebhookPayload) {
  const call = payload.call;
  const callId = call.call_id;

  // Create or update AI call record
  await prisma.aiCall.upsert({
    where: { retellCallId: callId },
    create: {
      retellCallId: callId,
      status: AI_CALL_STATUS.CONNECTED,
      phoneNumber: call.to_number,
    },
    update: {
      status: AI_CALL_STATUS.CONNECTED,
    },
  });

  console.log("[retell/webhook] ✅ Call started:", callId);
  return NextResponse.json({ success: true });
}

async function handleCallEnded(payload: RetellWebhookPayload) {
  const call = payload.call;
  const callId = call.call_id;
  const disconnectionReason = call.disconnection_reason;
  const transcript = call.transcript;

  // Compute duration from timestamps if available
  let durationSeconds: number | undefined;
  if (call.start_timestamp && call.end_timestamp) {
    durationSeconds = Math.round((call.end_timestamp - call.start_timestamp) / 1000);
  }

  console.log("[retell/webhook] handleCallEnded:", { callId, disconnectionReason, durationSeconds });

  // Determine the appropriate status based on disconnection_reason
  let status: string;
  if (disconnectionReason === "error_inbound_webhook" || disconnectionReason === "error_llm_websocket_open" || disconnectionReason?.startsWith("error")) {
    status = AI_CALL_STATUS.FAILED;
  } else if (NO_ANSWER_REASONS.includes(disconnectionReason as typeof NO_ANSWER_REASONS[number])) {
    status = AI_CALL_STATUS.NO_ANSWER;
  } else {
    // Normal completion (user_hangup, agent_hangup, call_transfer, etc.)
    status = AI_CALL_STATUS.COMPLETED;
  }

  // Update AI call record
  try {
    const updated = await prisma.aiCall.update({
      where: { retellCallId: callId },
      data: {
        status,
        durationSeconds,
        transcript,
        endedAt: new Date(),
      },
    });
    console.log("[retell/webhook] ✅ Call ended:", { callId, status, durationSeconds, recordId: updated.id });
  } catch (e) {
    console.warn("[retell/webhook] ⚠️ Could not find call by retellCallId:", callId);

    // Try to find by looking at recent initiated calls
    const recentCall = await prisma.aiCall.findFirst({
      where: {
        status: { in: [AI_CALL_STATUS.INITIATED, AI_CALL_STATUS.RINGING, AI_CALL_STATUS.CONNECTED] },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCall) {
      await prisma.aiCall.update({
        where: { id: recentCall.id },
        data: {
          retellCallId: callId,
          status,
          durationSeconds,
          transcript,
          endedAt: new Date(),
        },
      });
      console.log("[retell/webhook] ✅ Call ended (matched recent):", { internalId: recentCall.id, callId, status });
    } else {
      console.error("[retell/webhook] ❌ No call record found:", { callId, disconnectionReason });
    }
  }

  return NextResponse.json({ success: true });
}
