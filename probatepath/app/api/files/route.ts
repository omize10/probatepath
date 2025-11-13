import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/src/server/db/prisma";

const QuerySchema = z.object({
  matterId: z.string(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams);
  const input = QuerySchema.safeParse(params);
  if (!input.success) {
    return NextResponse.json({ error: "Missing matterId" }, { status: 400 });
  }

  const matter = await prisma.matter.findFirst({
    where: { id: input.data.matterId, userId: session.user.id },
    include: {
      willSearch: true,
      pack: true,
      files: true,
    },
  });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  return NextResponse.json({
    packetUrl: matter.willSearch[0]?.packetUrl,
    packUrl: matter.pack?.zipUrl,
    files: matter.files,
  });
}
