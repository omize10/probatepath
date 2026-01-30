import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { AI_CALL_STATUS, NO_ANSWER_REASONS } from "@/lib/retell/types";

const RETELL_API_KEY = process.env.RETELL_API_KEY;

/**
 * Poll call status as a fallback when webhooks aren't working
 * Checks both local database and Retell API
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ callId: string }> }
) {
  const { callId } = await params;

  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!callId) {
    return NextResponse.json({ error: "Missing callId parameter" }, { status: 400 });
  }

  try {
    // First, check our database
    const aiCall = await prisma.aiCall.findFirst({
      where: {
        OR: [
          { id: callId },
          { retellCallId: callId },
        ],
      },
      select: {
        id: true,
        retellCallId: true,
        status: true,
        createdAt: true,
        endedAt: true,
        durationSeconds: true,
      },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // If call is already in a final state, return it
    const finalStates = [
      AI_CALL_STATUS.COMPLETED,
      AI_CALL_STATUS.FAILED,
      AI_CALL_STATUS.NO_ANSWER,
      AI_CALL_STATUS.VOICEMAIL,
      AI_CALL_STATUS.ABANDONED,
    ];

    if (finalStates.includes(aiCall.status)) {
      return NextResponse.json({
        success: true,
        status: aiCall.status,
        callId: aiCall.id,
        retellCallId: aiCall.retellCallId,
        endedAt: aiCall.endedAt,
        durationSeconds: aiCall.durationSeconds,
        source: "database",
      });
    }

    // If call is still in progress and has a retell ID, check Retell API
    if (aiCall.retellCallId && RETELL_API_KEY) {
      // Only query Retell if call is older than 2 minutes (webhooks might be delayed)
      const ageInMinutes = (Date.now() - aiCall.createdAt.getTime()) / 1000 / 60;
      if (ageInMinutes > 2) {
        try {
          const retellResponse = await fetch(
            `https://api.retellai.com/v2/get-call/${aiCall.retellCallId}`,
            {
              headers: {
                Authorization: `Bearer ${RETELL_API_KEY}`,
              },
            }
          );

          if (retellResponse.ok) {
            const retellData = await retellResponse.json();

            // Map Retell status to our internal status
            let newStatus = aiCall.status;
            let endedAt = aiCall.endedAt;
            let durationSeconds = aiCall.durationSeconds;

            if (retellData.end_reason) {
              // Call has ended
              if (retellData.end_reason === "error") {
                newStatus = AI_CALL_STATUS.FAILED;
              } else if (NO_ANSWER_REASONS.includes(retellData.end_reason)) {
                newStatus = AI_CALL_STATUS.NO_ANSWER;
              } else {
                newStatus = AI_CALL_STATUS.COMPLETED;
              }

              endedAt = new Date();
              durationSeconds = retellData.duration_seconds || 0;

              // Update database with latest info
              await prisma.aiCall.update({
                where: { id: aiCall.id },
                data: {
                  status: newStatus,
                  endedAt,
                  durationSeconds,
                  transcript: retellData.transcript,
                  recordingUrl: retellData.recording_url,
                },
              });

              console.log("[retell/check-status] Updated stale call from Retell API:", {
                callId: aiCall.id,
                oldStatus: aiCall.status,
                newStatus,
                end_reason: retellData.end_reason,
              });
            } else if (retellData.status === "in-progress" || retellData.status === "connected") {
              // Call is active
              newStatus = AI_CALL_STATUS.CONNECTED;
              await prisma.aiCall.update({
                where: { id: aiCall.id },
                data: { status: newStatus },
              });
            }

            return NextResponse.json({
              success: true,
              status: newStatus,
              callId: aiCall.id,
              retellCallId: aiCall.retellCallId,
              endedAt,
              durationSeconds,
              source: "retell_api",
            });
          }
        } catch (retellError) {
          console.error("[retell/check-status] Error querying Retell API:", retellError);
          // Fall through to return database status
        }
      }
    }

    // Return current database status if we couldn't get fresh data from Retell
    return NextResponse.json({
      success: true,
      status: aiCall.status,
      callId: aiCall.id,
      retellCallId: aiCall.retellCallId,
      endedAt: aiCall.endedAt,
      durationSeconds: aiCall.durationSeconds,
      source: "database",
    });
  } catch (error) {
    console.error("[retell/check-status] Error:", error);
    return NextResponse.json(
      { error: "Failed to check call status" },
      { status: 500 }
    );
  }
}
