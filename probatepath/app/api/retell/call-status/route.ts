import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaEnabled } from '@/lib/prisma';

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
    return NextResponse.json({ status: 'in_progress' });
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
        status: true,
        endedAt: true,
      },
    });

    if (!aiCall) {
      return NextResponse.json({ status: 'unknown' });
    }

    return NextResponse.json({
      status: aiCall.status,
      ended: !!aiCall.endedAt,
    });
  } catch (error) {
    console.error('[retell/call-status] Error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
