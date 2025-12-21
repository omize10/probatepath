import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requirePortalAuth } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import {
  WILL_FILE_LIMITS,
  checkImageResolution,
  getWillFilesForMatter,
  measureImageDimensions,
  replaceWillFilesForMatter,
  saveWillFilesForMatter,
  serializeWillFiles,
  uploadWillFile,
  validateImageSelection,
  validatePdfSelection,
  type WillFileKind,
} from "@/lib/will-files";
import { randomUUID } from "crypto";

type RouteContext = { params: Promise<{ matterId: string }> };

async function assertMatterAccess(matterId: string, userId: string) {
  const matter = await prisma.matter.findFirst({ where: { id: matterId, userId }, select: { id: true } });
  if (!matter) {
    return null;
  }
  return matter;
}

export async function GET(_: NextRequest, context: RouteContext) {
  const session = await requirePortalAuth("/portal/intake");
  const userId = (session.user as { id?: string })?.id;
  const { matterId } = await context.params;

  if (!userId || !matterId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await assertMatterAccess(matterId, userId);
  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const files = prismaEnabled ? await getWillFilesForMatter(matterId) : [];
  return NextResponse.json({ files: serializeWillFiles(files) });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requirePortalAuth("/portal/intake");
  const userId = (session.user as { id?: string })?.id;
  const { matterId } = await context.params;

  if (!userId || !matterId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await assertMatterAccess(matterId, userId);
  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const kind = (formData.get("kind") as WillFileKind | null) ?? null;
  const replace = (formData.get("replace")?.toString() ?? "").toLowerCase() === "true";
  const files = formData.getAll("file").filter((entry): entry is File => entry instanceof File);

  if (!kind) {
    return NextResponse.json({ error: "Missing upload kind" }, { status: 400 });
  }
  if (!files.length) {
    return NextResponse.json({ error: "Please attach at least one file." }, { status: 400 });
  }

  const errors =
    kind === "pdf"
      ? validatePdfSelection(files)
      : validateImageSelection(files);
  if (errors.length) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  if (kind === "image") {
    for (const file of files) {
      const dimensions = await measureImageDimensions(file);
      const resolution = checkImageResolution(dimensions);
      if (!resolution.ok && resolution.error) {
        return NextResponse.json({ error: `${file.name}: ${resolution.error}` }, { status: 400 });
      }
    }
  }

  const uploads = [];
  for (const [index, file] of files.entries()) {
    if (kind === "pdf" && file.size > WILL_FILE_LIMITS.pdfMaxBytes) {
      return NextResponse.json({ error: "PDF exceeds allowed size." }, { status: 400 });
    }
    const stored = await uploadWillFile({ matterId, file, kind });
    uploads.push({
      fileUrl: stored.url,
      fileType: kind,
      originalFilename: stored.originalFilename,
      pageIndex: kind === "image" && replace ? index + 1 : null,
      uploadedBy: userId,
    });
  }

  let persisted = false;
  if (prismaEnabled) {
    try {
      if (kind === "pdf" || replace) {
        await replaceWillFilesForMatter(matterId, uploads);
      } else {
        await saveWillFilesForMatter(matterId, uploads);
      }
      persisted = true;
    } catch (error) {
      console.warn("[will-files] failed to persist will files, using fallback payload", error);
    }
  }

  if (prismaEnabled) {
    try {
      const draft = await prisma.intakeDraft.findUnique({ where: { matterId } });
      const payload = (draft?.payload as any) ?? {};
      const estate = payload.estateIntake ?? {};
      const willUpload = {
        ...(estate.willUpload ?? {}),
        hasFiles: true,
        lastUploadedAt: new Date().toISOString(),
      };
      const nextPayload = { ...payload, estateIntake: { ...estate, willUpload } };
      if (draft) {
        await prisma.intakeDraft.update({
          where: { matterId },
          data: { payload: nextPayload },
        });
      } else {
        await prisma.intakeDraft.create({
          data: {
            matterId,
            email: "",
            consent: false,
            exFullName: "",
            exCity: "",
            exRelation: "",
            decFullName: "",
            decDateOfDeath: new Date(),
            decCityProv: "",
            hadWill: true,
            willLocation: "",
            estateValueRange: "",
            anyRealProperty: false,
            multipleBeneficiaries: false,
            payload: nextPayload,
          },
        });
      }
    } catch (error) {
      console.warn("[will-files] failed to mark intake draft will upload", error);
    }
  }

  if (!persisted) {
    const now = new Date().toISOString();
    const synthetic = uploads.map((file) => ({
      id: randomUUID(),
      matterId,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      originalFilename: file.originalFilename,
      pageIndex: file.pageIndex ?? null,
      uploadedBy: file.uploadedBy ?? null,
      createdAt: now,
    }));
    return NextResponse.json({ files: synthetic });
  }

  const refreshed = await getWillFilesForMatter(matterId);
  revalidatePath(`/matters/${matterId}/intake`);
  revalidatePath(`/ops/cases/${matterId}`);
  return NextResponse.json({ files: serializeWillFiles(refreshed) });
}
