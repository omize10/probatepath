import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";

export async function GET(request: Request, context: HandlerContext<{ matterId: string }>) {
  const { matterId } = await resolveContextParams(context);
  const { session } = await getServerAuth();
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const matter = await prisma.matter.findUnique({ where: { id: matterId } });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }
  if (matter.userId && matter.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schedules = await prisma.supplementalSchedule.findMany({
    where: { matterId: matter.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ schedules });
}
