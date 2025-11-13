import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/src/server/db/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({
    where: { userId: session.user.id },
    include: {
      draft: true,
      pack: true,
      willSearch: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ matter });
}
