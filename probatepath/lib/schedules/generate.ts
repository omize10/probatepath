import type { PrismaClient, ScheduleKind } from "@prisma/client";
import { Prisma } from "@prisma/client";

type SerializedExecutor = {
  id: string;
  fullName: string;
  givenNames: string | null;
  surname: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isPrimary: boolean;
  isAlternate: boolean;
  isRenouncing: boolean;
  isMinor: boolean;
  isDeceased: boolean;
};

type SerializedBeneficiary = {
  id: string;
  type: string;
  status: string;
  fullName: string;
  givenNames: string | null;
  surname: string | null;
  relationshipLabel?: string | null;
  isMinor: boolean;
  dateOfBirth?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  shareDescription?: string | null;
  notes?: string | null;
  representedById?: string | null;
};

function serializeExecutors(executors: (SerializedExecutor | undefined)[]) {
  return executors.filter(Boolean) as SerializedExecutor[];
}

function serializeBeneficiaries(beneficiaries: (SerializedBeneficiary | undefined)[]) {
  return beneficiaries.filter(Boolean) as SerializedBeneficiary[];
}

type RegeneratedSchedule = {
  kind: ScheduleKind;
  title: string;
  description?: string;
  sortOrder: number;
  payload: Prisma.InputJsonValue;
};

export async function regenerateSchedulesForMatter(matterId: string, prisma: PrismaClient) {
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: {
      executors: true,
      beneficiaries: true,
      willSearch: true,
    },
  });
  if (!matter) {
    throw new Error("Matter not found");
  }

  const schedules: RegeneratedSchedule[] = [];

  const primaryExecutor = matter.executors.find((exe) => exe.isPrimary) ?? matter.executors[0];
  const additionalExecutors = matter.executors.filter((exe) => !primaryExecutor || exe.id !== primaryExecutor.id);
  if (additionalExecutors.length > 0) {
    schedules.push({
      kind: "EXECUTORS",
      title: "Supplement A – Additional Executors",
      description: "Lists all additional executors and their contact details.",
      sortOrder: 10,
      payload: {
        primaryExecutorId: primaryExecutor?.id ?? null,
        executors: serializeExecutors(
          additionalExecutors.map((exe) => ({
            id: exe.id,
            fullName: exe.fullName,
            givenNames: exe.givenNames,
            surname: exe.surname,
            email: exe.email,
            phone: exe.phone,
            addressLine1: exe.addressLine1,
            addressLine2: exe.addressLine2,
            city: exe.city,
            province: exe.province,
            postalCode: exe.postalCode,
            country: exe.country,
            isPrimary: exe.isPrimary,
            isAlternate: exe.isAlternate,
            isRenouncing: exe.isRenouncing,
            isMinor: exe.isMinor,
            isDeceased: exe.isDeceased,
          })),
        ),
      } as Prisma.InputJsonValue,
    });
  }

  const deceasedBeneficiaries = matter.beneficiaries.filter(
    (b) => b.status === "DECEASED_BEFORE_WILL" || b.status === "DECEASED_AFTER_WILL",
  );
  if (deceasedBeneficiaries.length > 0) {
    schedules.push({
      kind: "DECEASED_BENEFICIARIES",
      title: "Supplement B – Deceased Beneficiaries & Representation",
      description: "Explains which beneficiaries have died and who takes their share.",
      sortOrder: 20,
      payload: {
        beneficiaries: serializeBeneficiaries(
          deceasedBeneficiaries.map((b) => ({
            id: b.id,
            type: b.type,
            status: b.status,
            fullName: b.fullName,
            givenNames: b.givenNames,
            surname: b.surname,
            relationshipLabel: b.relationshipLabel,
            isMinor: b.isMinor,
            dateOfBirth: b.dateOfBirth ? b.dateOfBirth.toISOString() : null,
            addressLine1: b.addressLine1,
            addressLine2: b.addressLine2,
            city: b.city,
            province: b.province,
            postalCode: b.postalCode,
            country: b.country,
            shareDescription: b.shareDescription,
            notes: b.notes,
            representedById: b.representedById,
          })),
        ),
      } as Prisma.InputJsonValue,
    });
  }

  const minorBeneficiaries = matter.beneficiaries.filter((b) => b.isMinor);
  if (minorBeneficiaries.length > 0) {
    schedules.push({
      kind: "MINORS",
      title: "Supplement C – Minor Beneficiaries",
      description: "Lists minor beneficiaries and who controls funds for them.",
      sortOrder: 30,
      payload: {
        minors: serializeBeneficiaries(
          minorBeneficiaries.map((b) => ({
            id: b.id,
            type: b.type,
            status: b.status,
            fullName: b.fullName,
            givenNames: b.givenNames,
            surname: b.surname,
            relationshipLabel: b.relationshipLabel,
            isMinor: b.isMinor,
            dateOfBirth: b.dateOfBirth ? b.dateOfBirth.toISOString() : null,
            addressLine1: b.addressLine1,
            addressLine2: b.addressLine2,
            city: b.city,
            province: b.province,
            postalCode: b.postalCode,
            country: b.country,
            shareDescription: b.shareDescription,
            notes: b.notes,
            representedById: b.representedById,
          })),
        ),
      } as Prisma.InputJsonValue,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.supplementalSchedule.deleteMany({ where: { matterId } });
    for (const schedule of schedules) {
      await tx.supplementalSchedule.create({
        data: {
          matterId,
          kind: schedule.kind,
          title: schedule.title,
          description: schedule.description,
          sortOrder: schedule.sortOrder,
          payload: schedule.payload,
        },
      });
    }
  });
}
