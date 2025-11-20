import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/src/server/db/prisma";

export async function GET() {
  const { session } = await getServerAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({
    where: { userId },
    include: {
      draft: true,
      pack: true,
      willSearch: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ matter });
}
