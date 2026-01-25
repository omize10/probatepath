import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { RetellWebhookEvent, AI_CALL_STATUS } from "@/lib/retell/types";

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
  if (!verifyRetellSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse the event
  let event: RetellWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_type, call_id } = event;
  console.log("[retell/webhook] Received event:", { event_type, call_id });

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

  // Determine final status based on end reason
  let status: string = AI_CALL_STATUS.COMPLETED;
  if (end_reason === "user_hangup" || end_reason === "agent_hangup") {
    // Check if they completed payment - if not, mark as abandoned
    const call = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
      include: { paymentTokens: true },
    });
    if (!call?.paymentTokens?.some((t) => t.usedAt)) {
      status = AI_CALL_STATUS.ABANDONED;
    }
  } else if (end_reason === "error") {
    status = AI_CALL_STATUS.FAILED;
  }

  // Update AI call record
  await prisma.aiCall.update({
    where: { retellCallId: call_id },
    data: {
      status,
      durationSeconds: duration_seconds,
      recordingUrl: recording_url,
      transcript,
      endedAt: new Date(),
    },
  });

  console.log("[retell/webhook] Call ended:", { call_id, status, duration_seconds });
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
