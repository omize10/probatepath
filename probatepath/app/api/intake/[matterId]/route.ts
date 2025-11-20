import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { getServerAuth } from "@/lib/auth";

export async function GET(request: Request, ctx: any) {
  const { session } = await getServerAuth();
  // ctx.params may be a Promise (Next types) or an object — handle both
  let params = ctx?.params;
  if (params && typeof params.then === 'function') {
    try {
      params = await params;
    } catch (e) {
      params = undefined;
    }
  }
  if (!session || !(session.user && (session.user as any).id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const matterId = params.matterId;
  if (!matterId) return NextResponse.json({ error: "Missing matterId" }, { status: 400 });

  try {
    const draft = await prisma.intakeDraft.findUnique({ where: { matterId } });
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const matter = await prisma.matter.findUnique({ where: { id: matterId } });
    if (matter?.userId && matter.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ payload: draft.payload ?? null, updatedAt: draft.updatedAt, submittedAt: draft.submittedAt ?? null });
  } catch (err) {
    console.warn("[intake.get] failed", err);
    return NextResponse.json({ error: "Unable to load" }, { status: 500 });
  }
}
