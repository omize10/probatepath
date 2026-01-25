import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaEnabled } from '@/lib/prisma';
import { AI_CALL_STATUS } from '@/lib/retell/types';

const RETELL_API_KEY = process.env.RETELL_API_KEY;

/**
 * Get the status of an AI call
 * Frontend polls this to check if call is complete
 * 
 * FALLBACK: If webhooks aren't firing, query Retell API directly
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
        retellCallId: true,
      },
    });

    if (!aiCall) {
      return NextResponse.json({ status: 'unknown', ended: false });
    }

    // FALLBACK: If call is still "INITIATED" but older than 2 minutes, 
    // query Retell API directly to check real status
    if (aiCall.status === AI_CALL_STATUS.INITIATED && aiCall.retellCallId) {
      const ageMs = Date.now() - aiCall.createdAt.getTime();
      if (ageMs > 120000) { // 2 minutes old
        console.log('[retell/call-status] Call is 2+ min old and still INITIATED - checking Retell API directly');
        
        try {
          const retellStatus = await queryRetellCallStatus(aiCall.retellCallId);
          if (retellStatus && retellStatus.ended) {
            console.log('[retell/call-status] ✅ Retell API says call ended:', retellStatus);
            // Update database with actual status
            await prisma.aiCall.update({
              where: { id: aiCall.id },
              data: {
                status: retellStatus.status,
                endedAt: new Date(),
                durationSeconds: retellStatus.duration,
              },
            });
            return NextResponse.json({
              status: retellStatus.status,
              ended: true,
              duration: retellStatus.duration,
              callId: aiCall.id,
              source: 'retell_api_fallback',
            });
          }
        } catch (e) {
          console.warn('[retell/call-status] Retell API query failed:', e);
          // Continue with database status
        }
      }
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

/**
 * Query Retell API directly for call status
 * Used as fallback when webhooks don't fire
 */
async function queryRetellCallStatus(retellCallId: string) {
  if (!RETELL_API_KEY) {
    return null;
  }

  try {
    const res = await fetch(`https://api.retellai.com/v2/get-call/${retellCallId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn('[retell/call-status] Retell API returned:', res.status);
      return null;
    }

    const data = await res.json();
    
    // Map Retell status to our status
    let status = AI_CALL_STATUS.INITIATED;
    let ended = false;

    if (data.end_reason) {
      ended = true;
      if (data.end_reason === 'error') {
        status = AI_CALL_STATUS.FAILED;
      } else if (['no_answer', 'busy', 'voicemail', 'timeout', 'machine_detected'].includes(data.end_reason)) {
        status = AI_CALL_STATUS.NO_ANSWER;
      } else {
        status = AI_CALL_STATUS.COMPLETED;
      }
    }

    return {
      status,
      ended,
      duration: data.duration_seconds || 0,
    };
  } catch (error) {
    console.error('[retell/call-status] Error querying Retell API:', error);
    return null;
  }
}
