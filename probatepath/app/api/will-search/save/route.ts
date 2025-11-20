import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { splitName } from "@/lib/name";
import { regenerateSchedulesForMatter } from "@/lib/schedules/generate";
import { willSearchSaveSchema } from "@/lib/will-search/types";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const sessionData = await getServerAuth();
  const userId = sessionData.session?.user && (sessionData.session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = willSearchSaveSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const payload = parsed.data;

  let matter = null;
  if (payload.matterId) {
    matter = await prisma.matter.findFirst({ where: { id: payload.matterId, userId } });
  }
  if (!matter) {
    matter = await prisma.matter.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  }
  if (!matter) {
    matter = await prisma.matter.create({
      data: {
        userId,
        clientKey: randomUUID(),
      },
    });
  }
  const matterId = matter.id;

  const executorName = payload.executor.fullName.trim();
  const deceasedName = payload.deceased.fullName.trim();
  const deceasedParts = splitName(deceasedName);
  const aliases = (payload.deceasedExtraAliases ?? [])
    .map((alias) => alias.trim())
    .filter((alias, index, arr) => alias.length > 0 && arr.indexOf(alias) === index);

  let deceasedDate: Date | null = null;
  if (payload.deceased.dateOfDeath) {
    const candidate = new Date(payload.deceased.dateOfDeath);
    if (!Number.isNaN(candidate.getTime())) {
      deceasedDate = candidate;
    }
  }

  let deceasedBirthDate: Date | null = null;
  if (payload.deceased.dateOfBirth) {
    const candidate = new Date(payload.deceased.dateOfBirth);
    if (!Number.isNaN(candidate.getTime())) {
      deceasedBirthDate = candidate;
    }
  }

  const recordData = {
    executorEmail: payload.executor.email.trim(),
    executorFullName: executorName,
    executorPhone: payload.executor.phone?.trim() || null,
    executorCity: payload.executor.city?.trim() || null,
    executorRelationship: payload.executor.relationship?.trim() || null,
    deceasedFullName: deceasedName,
    deceasedGivenNames: deceasedParts.givenNames || null,
    deceasedSurname: deceasedParts.surname || null,
    deceasedDateOfDeath: deceasedDate,
    deceasedDateOfBirth: deceasedBirthDate,
    deceasedCity: payload.deceased.city?.trim() || null,
    deceasedProvince: payload.deceased.province?.trim() || null,
    deceasedPlaceOfBirth: payload.deceased.placeOfBirth?.trim() || null,
    deceasedMarriedSurname: payload.deceased.marriedSurname?.trim() || null,
    hasWill: payload.deceased.hasWill ?? null,
    searchNotes: payload.searchNotes?.trim() || null,
    mailingPreference: payload.mailingPreference ?? null,
    courierAddress: payload.courierAddress?.trim() || null,
    deceasedAliases: aliases,
  };

  const existing = await prisma.willSearchRequest.findFirst({
    where: { matterId },
  });

  const record = existing
    ? await prisma.willSearchRequest.update({
        where: { id: existing.id },
        data: recordData,
      })
    : await prisma.willSearchRequest.create({
        data: {
          matterId,
          ...recordData,
        },
      });

  await regenerateSchedulesForMatter(matterId, prisma);
  await logAudit({ matterId, actorId: userId, action: "will_search.save" });

  return NextResponse.json({ ok: true, persisted: true, updatedAt: record.updatedAt.toISOString(), matterId });
}
