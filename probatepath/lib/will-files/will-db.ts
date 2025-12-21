import "server-only";
import type { Prisma, WillFileType } from "@prisma/client";
import { prisma, prismaEnabled } from "@/lib/prisma";

export type WillFileRecord = Prisma.WillFileGetPayload<{
  select: {
    id: true;
    matterId: true;
    fileUrl: true;
    fileType: true;
    originalFilename: true;
    pageIndex: true;
    uploadedBy: true;
    createdAt: true;
  };
}>;

export type NewWillFileInput = {
  fileUrl: string;
  fileType: WillFileType;
  originalFilename: string;
  pageIndex?: number | null;
  uploadedBy?: string | null;
};

export type WillFileSummary = Omit<WillFileRecord, "createdAt"> & { createdAt: string };

type TransactionClient = Prisma.TransactionClient | typeof prisma;

async function createWillFileRecords(
  client: TransactionClient,
  matterId: string,
  files: NewWillFileInput[],
  startingPageIndex: number,
) {
  let nextPageIndex = startingPageIndex;
  const created: WillFileRecord[] = [];
  for (const file of files) {
    const pageIndex = file.fileType === "image" ? file.pageIndex ?? nextPageIndex++ : null;
    const record = await client.willFile.create({
      data: {
        matterId,
        fileUrl: file.fileUrl,
        fileType: file.fileType,
        originalFilename: file.originalFilename,
        pageIndex,
        uploadedBy: file.uploadedBy ?? null,
      },
      select: {
        id: true,
        matterId: true,
        fileUrl: true,
        fileType: true,
        originalFilename: true,
        pageIndex: true,
        uploadedBy: true,
        createdAt: true,
      },
    });
    created.push(record);
  }
  return created;
}

async function nextImagePageIndex(client: TransactionClient, matterId: string) {
  const aggregate = await client.willFile.aggregate({
    where: { matterId, fileType: "image" },
    _max: { pageIndex: true },
  });
  return (aggregate._max.pageIndex ?? 0) + 1;
}

export async function getWillFilesForMatter(matterId: string) {
  if (!matterId || !prismaEnabled) return [];
  try {
    return prisma.willFile.findMany({
      where: { matterId },
      orderBy: [
        { createdAt: "asc" },
        { pageIndex: "asc" },
      ],
      select: {
        id: true,
        matterId: true,
        fileUrl: true,
        fileType: true,
        originalFilename: true,
        pageIndex: true,
        uploadedBy: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.warn("[will-files] failed to read will files", error);
    return [];
  }
}

export async function saveWillFilesForMatter(matterId: string, files: NewWillFileInput[]) {
  if (!files.length || !prismaEnabled) return [];
  try {
    return prisma.$transaction(async (tx) => {
      const startingIndex = await nextImagePageIndex(tx, matterId);
      return createWillFileRecords(tx, matterId, files, startingIndex);
    });
  } catch (error) {
    console.warn("[will-files] failed to save files", error);
    return [];
  }
}

export async function replaceWillFilesForMatter(matterId: string, files: NewWillFileInput[]) {
  if (!prismaEnabled) return [];
  try {
    return prisma.$transaction(async (tx) => {
      await tx.willFile.deleteMany({ where: { matterId } });
      const startingIndex = files.some((file) => file.fileType === "image") ? 1 : 0;
      return createWillFileRecords(tx, matterId, files, startingIndex);
    });
  } catch (error) {
    console.warn("[will-files] failed to replace files", error);
    return [];
  }
}

export function serializeWillFiles(records: WillFileRecord[]): WillFileSummary[] {
  return records.map((record) => ({
    ...record,
    createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : String(record.createdAt),
  }));
}
