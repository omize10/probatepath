import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { uploadFileToBucket } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin/auth";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  const cookieStore = await cookies();
  const opsPass = cookieStore.get("ops_auth")?.value;
  const opsAllowed = opsPass === "1";
  const admin = isAdmin(session ?? null);

  if (!session?.user?.id && !opsAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { userId: true },
  });

  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Allow if admin/ops or if user owns the matter
  if (!admin && !opsAllowed && matter.userId !== session?.user?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const key = `grant-documents/${matterId}/${Date.now()}-${file.name}`;

  let fileUrl = "";
  try {
    const { data, error } = await uploadFileToBucket({
      bucket: "grant-documents",
      path: key,
      content: buffer,
      contentType: file.type,
    });
    if (error) throw error;
    fileUrl = data?.path ?? key;
  } catch {
    // Fallback: store reference only
    fileUrl = key;
  }

  // Update matter with grant document URL
  await prisma.matter.update({
    where: { id: matterId },
    data: {
      grantDocumentUrl: fileUrl,
      grantUploadedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    grantDocumentUrl: fileUrl,
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  const cookieStore = await cookies();
  const opsPass = cookieStore.get("ops_auth")?.value;
  const opsAllowed = opsPass === "1";
  const admin = isAdmin(session ?? null);

  if (!session?.user?.id && !opsAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { userId: true },
  });

  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!admin && !opsAllowed && matter.userId !== session?.user?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Clear grant document from matter
  await prisma.matter.update({
    where: { id: matterId },
    data: {
      grantDocumentUrl: null,
      grantUploadedAt: null,
    },
  });

  return NextResponse.json({ success: true });
}
