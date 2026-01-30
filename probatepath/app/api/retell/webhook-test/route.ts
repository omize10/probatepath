import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { AI_CALL_STATUS } from "@/lib/retell/types";

/**
 * Test endpoint to simulate Retell webhook events
 * Useful for debugging webhook handling without making actual calls
 *
 * Usage:
 * POST /api/retell/webhook-test?event=call_started&callId=test_123
 * POST /api/retell/webhook-test?event=call_ended&callId=test_123&end_reason=user_hangup
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const url = new URL(request.url);
  const eventType = url.searchParams.get("event") || "call_started";
  const callId = url.searchParams.get("callId") || `test_${Date.now()}`;
  const endReason = url.searchParams.get("end_reason") || "user_hangup";

  console.log("[retell/webhook-test] Simulating event:", { eventType, callId, endReason });

  try {
    switch (eventType) {
      case "call_started": {
        // Create or update call to "connected" status
        const call = await prisma.aiCall.upsert({
          where: { retellCallId: callId },
          create: {
            retellCallId: callId,
            status: AI_CALL_STATUS.CONNECTED,
            phoneNumber: "+16047245161",
            collectedData: {
              test: true,
              simulatedEvent: "call_started",
            },
          },
          update: {
            status: AI_CALL_STATUS.CONNECTED,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Simulated call_started event",
          callId: call.id,
          retellCallId: callId,
          status: call.status,
        });
      }

      case "call_ended": {
        // Find existing call and update to ended status
        const existingCall = await prisma.aiCall.findFirst({
          where: {
            OR: [
              { retellCallId: callId },
              { id: callId },
            ],
          },
        });

        if (!existingCall) {
          // Create a test call if it doesn't exist
          const call = await prisma.aiCall.create({
            data: {
              retellCallId: callId,
              status: AI_CALL_STATUS.COMPLETED,
              phoneNumber: "+16047245161",
              durationSeconds: 120,
              endedAt: new Date(),
              collectedData: {
                test: true,
                simulatedEvent: "call_ended",
                end_reason: endReason,
              },
            },
          });

          return NextResponse.json({
            success: true,
            message: "Created test call with ended status",
            callId: call.id,
            retellCallId: callId,
            status: call.status,
          });
        }

        // Update existing call
        let status: string;
        if (endReason === "error") {
          status = AI_CALL_STATUS.FAILED;
        } else if (["no_answer", "busy", "voicemail", "timeout", "machine_detected"].includes(endReason)) {
          status = AI_CALL_STATUS.NO_ANSWER;
        } else {
          status = AI_CALL_STATUS.COMPLETED;
        }

        const updated = await prisma.aiCall.update({
          where: { id: existingCall.id },
          data: {
            status,
            endedAt: new Date(),
            durationSeconds: 120,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Simulated call_ended event",
          callId: updated.id,
          retellCallId: callId,
          status: updated.status,
          end_reason: endReason,
        });
      }

      case "create_test_call": {
        // Create a fresh test call in "initiated" status
        const call = await prisma.aiCall.create({
          data: {
            retellCallId: callId,
            status: AI_CALL_STATUS.INITIATED,
            phoneNumber: "+16047245161",
            collectedData: {
              test: true,
              name: "Test User",
              email: "test@example.com",
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: "Created test call",
          callId: call.id,
          retellCallId: callId,
          status: call.status,
          instructions: {
            test_call_started: `/api/retell/webhook-test?event=call_started&callId=${call.id}`,
            test_call_ended: `/api/retell/webhook-test?event=call_ended&callId=${call.id}&end_reason=user_hangup`,
            check_status: `/api/retell/check-status/${call.id}`,
          },
        });
      }

      default:
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
    }
  } catch (error) {
    console.error("[retell/webhook-test] Error:", error);
    return NextResponse.json(
      { error: "Failed to simulate webhook event", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to view recent test calls
 */
export async function GET() {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const calls = await prisma.aiCall.findMany({
      where: {
        retellCallId: { startsWith: "test_" },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        retellCallId: true,
        status: true,
        phoneNumber: true,
        createdAt: true,
        endedAt: true,
        durationSeconds: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: calls.length,
      calls,
      usage: {
        create_test: "POST /api/retell/webhook-test?event=create_test_call",
        simulate_started: "POST /api/retell/webhook-test?event=call_started&callId=<id>",
        simulate_ended: "POST /api/retell/webhook-test?event=call_ended&callId=<id>&end_reason=user_hangup",
        check_status: "GET /api/retell/check-status/<id>",
      },
    });
  } catch (error) {
    console.error("[retell/webhook-test] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test calls" },
      { status: 500 }
    );
  }
}
