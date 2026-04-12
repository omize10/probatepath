import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token: tokenValue } = await context.params;

  // Soft single-use: cap per-token uses in memory so a stolen token can't be
  // replayed indefinitely, and cap per-IP scans so an attacker can't crawl
  // the token space.
  if (!rateLimit(`resume-token:${tokenValue}`, 10, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Token exhausted" }, { status: 410 });
  }
  if (!rateLimit(`resume-ip:${ipFromRequest(request)}`, 30, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = await prisma.resumeToken.findUnique({
    where: { token: tokenValue },
    include: { matter: { include: { draft: true } } },
  });
  if (!token || !token.matter?.draft) {
    return NextResponse.json({ error: "Token invalid" }, { status: 404 });
  }
  if (token.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }
  return NextResponse.json({
    matterId: token.matterId,
    clientKey: token.matter.clientKey,
    draft: token.matter.draft,
  });
}
