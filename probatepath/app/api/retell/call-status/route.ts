import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaEnabled } from '@/lib/prisma';
import { AI_CALL_STATUS } from '@/lib/retell/types';

/**
 * Get the status of an AI call
 * Frontend polls this to check if call is complete
 */
export async function GET(req: NextRequest) {
  const callId = req.nextUrl.searchParams.get('call_id');

  if (!callId) {
    return NextResponse.json({ error: 'Missing call_id' }, { status: 400 });
  }

  if (!prismaEnabled) {
    // Return mock status in dev mode
    return NextResponse.json({ status: 'in_progress', ended: false });
  }

  try {
    // Try to find by retellCallId first, then by our internal id
    const aiCall = await prisma.aiCall.findFirst({
      where: {
        OR: [
          { retellCallId: callId },
          { id: callId },
        ],
      },
      select: {
        id: true,
        status: true,
        endedAt: true,
        durationSeconds: true,
        createdAt: true,
      },
    });

    if (!aiCall) {
      return NextResponse.json({ status: 'unknown', ended: false });
    }

    // Calculate if call is "ended" - any terminal state
    const terminalStates = [
      AI_CALL_STATUS.COMPLETED,
      AI_CALL_STATUS.FAILED,
      AI_CALL_STATUS.NO_ANSWER,
      AI_CALL_STATUS.VOICEMAIL,
      AI_CALL_STATUS.ABANDONED,
    ];
    const isEnded = terminalStates.includes(aiCall.status as typeof terminalStates[number]) || !!aiCall.endedAt;

    return NextResponse.json({
      status: aiCall.status,
      ended: isEnded,
      duration: aiCall.durationSeconds,
      callId: aiCall.id,
    });
  } catch (error) {
    console.error('[retell/call-status] Error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
