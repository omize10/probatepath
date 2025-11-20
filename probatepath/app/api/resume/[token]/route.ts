import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  const { token: tokenValue } = await context.params;
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
