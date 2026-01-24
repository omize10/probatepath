import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { uploadFileToBucket } from "@/lib/supabase";

export async function POST(
  request: Request,
  context: { params: Promise<{ matterId: string; mailingId: string }> }
) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId, mailingId } = await context.params;

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { userId: true },
  });
  if (!matter || matter.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const mailing = await prisma.beneficiaryMailing.findUnique({
    where: { id: mailingId },
  });
  if (!mailing || mailing.matterId !== matterId) {
    return NextResponse.json({ error: "Mailing not found" }, { status: 404 });
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
  const key = `delivery-proofs/${matterId}/${mailingId}/${Date.now()}-${file.name}`;

  let fileUrl = "";
  try {
    const { data, error } = await uploadFileToBucket({
      bucket: "delivery-proofs",
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

  const proof = await prisma.deliveryProof.create({
    data: {
      beneficiaryMailingId: mailingId,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    },
  });

  return NextResponse.json({ proof });
}
