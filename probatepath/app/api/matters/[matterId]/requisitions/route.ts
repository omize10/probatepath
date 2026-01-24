import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { uploadFileToBucket } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { userId: true },
  });
  if (!matter || matter.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const requisitions = await prisma.requisition.findMany({
    where: { matterId },
    orderBy: { receivedAt: "desc" },
  });

  return NextResponse.json({ requisitions });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { userId: true },
  });
  if (!matter || matter.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  // Handle file upload (multipart)
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const description = formData.get("description")?.toString() ?? "";
    const dueAt = formData.get("dueAt")?.toString();

    let fileUrl = "";
    if (file && file instanceof File) {
      const buffer = await file.arrayBuffer();
      const key = `requisitions/${matterId}/${Date.now()}-${file.name}`;
      try {
        const { data } = await uploadFileToBucket({
          bucket: "requisitions",
          path: key,
          content: buffer,
          contentType: file.type,
        });
        fileUrl = data?.path ?? key;
      } catch {
        fileUrl = key;
      }
    }

    const req = await prisma.requisition.create({
      data: {
        matterId,
        description,
        fileUrl: fileUrl || null,
        dueAt: dueAt ? new Date(dueAt) : null,
      },
    });

    return NextResponse.json({ requisition: req });
  }

  // Handle JSON updates
  const body = await request.json();

  if (body.action === "update" && body.id) {
    const { id, ...updates } = body;
    const allowedFields = ["status", "description", "courtNotes", "responseNotes", "responseFileUrl", "resolvedAt", "dueAt"];
    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        data[key] = updates[key];
      }
    }
    if (data.status === "resolved" && !data.resolvedAt) {
      data.resolvedAt = new Date().toISOString();
    }

    const req = await prisma.requisition.update({ where: { id }, data });
    return NextResponse.json({ requisition: req });
  }

  if (body.action === "delete" && body.id) {
    await prisma.requisition.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
