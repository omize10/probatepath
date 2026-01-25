import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaEnabled } from '@/lib/prisma';

/**
 * DEBUG ENDPOINT - Shows all recent AI calls in database
 * Use this to diagnose Issue #2 (button not enabling)
 * 
 * Only works in development or if you know the secret
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  
  // Simple auth - check against env var or allow localhost
  const debugSecret = process.env.DEBUG_SECRET;
  const isLocalhost = req.headers.get('host')?.includes('localhost');
  
  if (!isLocalhost && secret !== debugSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!prismaEnabled) {
    return NextResponse.json({ error: 'Database not enabled' }, { status: 503 });
  }

  try {
    // Get all calls from last 2 hours
    const calls = await prisma.aiCall.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        phoneNumber: true,
        status: true,
        retellCallId: true,
        endedAt: true,
        durationSeconds: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      totalCalls: calls.length,
      calls: calls.map(c => ({
        ...c,
        isEnded: !!c.endedAt,
        createdAt: c.createdAt.toISOString(),
        endedAt: c.endedAt?.toISOString() || null,
      })),
      note: 'If status is INITIATED/RINGING/CONNECTED but endedAt is null, the webhook did not fire',
    });
  } catch (error) {
    console.error('[debug/call-status]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
