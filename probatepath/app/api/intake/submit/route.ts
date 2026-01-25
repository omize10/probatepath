import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit, logSecurityAudit } from "@/lib/audit";
import { getServerAuth } from "@/lib/auth";
import { sendTemplateEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { intakeDraftSchema } from "@/lib/intake/schema";
import { ensureMatter } from "@/lib/matter/server";
import { splitName } from "@/lib/name";
import type { IntakeDraft } from "@/lib/intake/types";

const SubmitSchema = z.object({
  clientKey: z.string().optional(),
  matterId: z.string().optional(),
  draft: z.any().optional(),
});

const DEFAULT_EXPIRY_HOURS = 24;

function formatName(parts?: {
  first?: string;
  middle1?: string;
  middle2?: string;
  middle3?: string;
  last?: string;
  suffix?: string;
}) {
  if (!parts) return "";
  return [parts.first, parts.middle1, parts.middle2, parts.middle3, parts.last, parts.suffix]
    .filter((token) => token && token.trim().length > 0)
    .join(" ")
    .trim();
}

function coalesceString(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function mapRelationship(value?: string | null): IntakeDraft["executor"]["relationToDeceased"] {
  switch (value) {
    case "spouse":
      return "partner";
    case "child":
      return "child";
    case "friend":
      return "friend";
    case "sibling":
    case "other_family":
      return "relative";
    default:
      return "other";
  }
}

function normalizeRelation(value?: string | null): IntakeDraft["executor"]["relationToDeceased"] {
  const mapped = mapRelationship(value);
  const allowed: IntakeDraft["executor"]["relationToDeceased"][] = ["partner", "child", "relative", "friend", "other"];
  return allowed.includes(mapped) ? mapped : "other";
}

function safeDate(value?: string): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

function normalizeDraft(raw: IntakeDraft): IntakeDraft {
  const draft = JSON.parse(JSON.stringify(raw)) as IntakeDraft;
  const estate = draft.estateIntake;
  const ensureText = (value: string | null | undefined, fallback: string) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed.length > 0 ? trimmed : fallback;
  };

  const applicantName = formatName(estate.applicant.name);
  draft.welcome.email = coalesceString(draft.welcome.email, estate.applicant.contact.email);
  draft.welcome.consent = Boolean(draft.welcome.consent || true);
  draft.welcome.email = ensureText(draft.welcome.email, "placeholder@example.com");

  draft.executor.fullName = coalesceString(draft.executor.fullName, applicantName, "Executor");
  draft.executor.email = coalesceString(draft.executor.email, draft.welcome.email, estate.applicant.contact.email);
  draft.executor.phone = coalesceString(draft.executor.phone, estate.applicant.contact.phone);
  draft.executor.city = coalesceString(draft.executor.city, estate.applicant.address.city);
  draft.executor.addressLine1 = coalesceString(draft.executor.addressLine1, estate.applicant.address.line1);
  draft.executor.addressLine2 = coalesceString(draft.executor.addressLine2, estate.applicant.address.line2);
  draft.executor.province = coalesceString(draft.executor.province, estate.applicant.address.region);
  draft.executor.postalCode = coalesceString(draft.executor.postalCode, estate.applicant.address.postalCode);
  draft.executor.timeZone = coalesceString(draft.executor.timeZone, "Pacific Time");
  draft.executor.emergencyContactName = coalesceString(draft.executor.emergencyContactName, applicantName, "Contact not provided");
  draft.executor.emergencyContactPhone = coalesceString(
    draft.executor.emergencyContactPhone,
    draft.executor.phone,
    estate.applicant.contact.phone,
  );
  draft.executor.relationToDeceased = normalizeRelation(
    draft.executor.relationToDeceased || estate.applicant.relationship || undefined,
  );
  draft.executor.addressLine1 = ensureText(draft.executor.addressLine1, "Address not provided");
  draft.executor.province = ensureText(draft.executor.province, "Province");
  draft.executor.postalCode = ensureText(draft.executor.postalCode, "00000");
  draft.executor.fullName = ensureText(draft.executor.fullName, "Executor");
  draft.executor.emergencyContactName = ensureText(draft.executor.emergencyContactName, applicantName || "Contact not provided");
  draft.executor.emergencyContactPhone = ensureText(draft.executor.emergencyContactPhone, draft.executor.phone || "000-000-0000");
  draft.executor.communicationPreference = draft.executor.communicationPreference ?? "either";
  draft.executor.timeZone = ensureText(draft.executor.timeZone, "Pacific Time");
  draft.executor.alternateExecutor = draft.executor.alternateExecutor ?? "no";

  const deceasedName = formatName(estate.deceased.name);
  draft.deceased.fullName = coalesceString(draft.deceased.fullName, deceasedName, "Deceased");
  draft.deceased.firstName = coalesceString(draft.deceased.firstName, estate.deceased.name.first, draft.deceased.fullName);
  draft.deceased.lastName = coalesceString(draft.deceased.lastName, estate.deceased.name.last);
  draft.deceased.dateOfDeath = coalesceString(draft.deceased.dateOfDeath, estate.deceased.dateOfDeath);
  draft.deceased.cityProvince = coalesceString(
    draft.deceased.cityProvince,
    [estate.deceased.placeOfDeath.city, estate.deceased.placeOfDeath.province].filter(Boolean).join(", "),
  );
  draft.deceased.birthDate = coalesceString(draft.deceased.birthDate, estate.deceased.dateOfBirth);
  draft.deceased.placeOfBirth = ensureText(draft.deceased.placeOfBirth, "Unknown");
  draft.deceased.maritalStatus = ensureText(draft.deceased.maritalStatus, estate.deceased.maritalStatus || "single");
  draft.deceased.occupation = ensureText(draft.deceased.occupation, "Not provided");
  draft.deceased.residenceAddress = coalesceString(draft.deceased.residenceAddress, estate.deceased.address.line1);
  draft.deceased.residenceLine1 = coalesceString(draft.deceased.residenceLine1, estate.deceased.address.line1);
  draft.deceased.residenceLine2 = coalesceString(draft.deceased.residenceLine2, estate.deceased.address.line2);
  draft.deceased.residenceCity = coalesceString(draft.deceased.residenceCity, estate.deceased.address.city);
  draft.deceased.residenceRegion = coalesceString(draft.deceased.residenceRegion, estate.deceased.address.region);
  draft.deceased.residencePostalCode = coalesceString(draft.deceased.residencePostalCode, estate.deceased.address.postalCode);
  draft.deceased.residenceCountry = coalesceString(draft.deceased.residenceCountry, estate.deceased.address.country);
  draft.deceased.hadWill = draft.deceased.hadWill ?? (estate.will.hasWill === "no" ? "no" : "yes");
  draft.deceased.residenceAddress = ensureText(draft.deceased.residenceAddress, "Address not provided");
  draft.deceased.residenceLine1 = ensureText(draft.deceased.residenceLine1, draft.deceased.residenceAddress);
  draft.deceased.residenceCity = ensureText(draft.deceased.residenceCity, "City");
  draft.deceased.residenceRegion = ensureText(draft.deceased.residenceRegion, "Province");
  draft.deceased.residencePostalCode = ensureText(draft.deceased.residencePostalCode, "00000");
  draft.deceased.residenceCountry = ensureText(draft.deceased.residenceCountry, "Canada");
  draft.deceased.residenceType = ensureText(draft.deceased.residenceType, "home");
  const childCount = estate.family.children.length;
  draft.deceased.childrenCount = ensureText(draft.deceased.childrenCount, String(childCount || 0));
  draft.deceased.yearsLivedInBC = ensureText(draft.deceased.yearsLivedInBC, "0");
  draft.deceased.assetsOutsideCanada = draft.deceased.assetsOutsideCanada ?? "no";
  draft.deceased.assetsOutsideDetails = draft.deceased.assetsOutsideDetails ?? "";
  draft.deceased.placeOfBirth = ensureText(draft.deceased.placeOfBirth, "Unknown");
  draft.deceased.digitalEstateNotes = draft.deceased.digitalEstateNotes ?? "";
  draft.deceased.hadPriorUnions = draft.deceased.hadPriorUnions ?? "no";
  draft.deceased.dateOfDeath = ensureText(draft.deceased.dateOfDeath, "1900-01-01");
  draft.deceased.birthDate = ensureText(draft.deceased.birthDate, "1900-01-01");
  draft.deceased.fullName = ensureText(draft.deceased.fullName, "Deceased");

  draft.will.willLocation = coalesceString(draft.will.willLocation, estate.will.storageLocation, "Not provided");
  draft.will.estateValueRange = draft.will.estateValueRange ?? "<$100k";
  draft.will.anyRealProperty =
    draft.will.anyRealProperty ?? (estate.assets.hasBCRealEstate === "yes" ? "yes" : "no");
  const beneficiaryCount = (estate.beneficiaries.people?.length ?? 0) + (estate.beneficiaries.organizations?.length ?? 0);
  draft.will.multipleBeneficiaries = draft.will.multipleBeneficiaries ?? (beneficiaryCount > 1 ? "yes" : "no");
  draft.will.hasCodicils = draft.will.hasCodicils ?? "no";
  draft.will.codicilDetails = draft.will.codicilDetails ?? "";
  draft.will.notaryNeeded = draft.will.notaryNeeded ?? "no";
  draft.will.probateRegistry = ensureText(draft.will.probateRegistry, estate.filing.registryLocation || "Vancouver");
  draft.will.expectedFilingDate = draft.will.expectedFilingDate ?? "";
  draft.will.physicalWillDate = draft.will.physicalWillDate ?? "";
  draft.will.electronicWillDate = draft.will.electronicWillDate ?? "";
  draft.will.realPropertyDetails = ensureText(
    draft.will.realPropertyDetails,
    estate.assets.bcProperties.map((property) => property.address.line1).filter(Boolean).join("; ") || "Not provided",
  );
  draft.will.liabilities = ensureText(
    draft.will.liabilities,
    estate.debts.liabilities.map((entry) => entry.creditorName || entry.type).filter(Boolean).join("; ") || "None noted",
  );
  const accountsSummary =
    estate.assets.accounts.map((account) => `${account.institutionName} ${account.accountType}`.trim()).filter(Boolean).join("; ") || "";
  draft.will.bankAccounts = ensureText(draft.will.bankAccounts, accountsSummary || "Not provided");
  draft.will.investmentAccounts = ensureText(draft.will.investmentAccounts, accountsSummary || "Not provided");
  draft.will.insurancePolicies = ensureText(draft.will.insurancePolicies, "Not provided");
  draft.will.businessInterests = ensureText(draft.will.businessInterests, "Not provided");
  draft.will.documentDeliveryPreference = ensureText(draft.will.documentDeliveryPreference, "mail");
  draft.will.charitableGifts = draft.will.charitableGifts ?? "";
  draft.will.digitalAssets = draft.will.digitalAssets ?? "";
  draft.will.specialCircumstances = draft.will.specialCircumstances ?? "";
  draft.will.specialRequests = draft.will.specialRequests ?? "";

  draft.confirmation.confirmed = Boolean(draft.confirmation.confirmed || true);

  return draft;
}

function summarizeIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

function debugDraftSnapshot(draft: IntakeDraft) {
  return {
    welcome: draft.welcome,
    executor: {
      fullName: draft.executor.fullName,
      email: draft.executor.email,
      phone: draft.executor.phone,
      city: draft.executor.city,
      province: draft.executor.province,
      postalCode: draft.executor.postalCode,
    },
    deceased: {
      fullName: draft.deceased.fullName,
      dateOfDeath: draft.deceased.dateOfDeath,
      birthDate: draft.deceased.birthDate,
      cityProvince: draft.deceased.cityProvince,
      residenceCity: draft.deceased.residenceCity,
      residenceRegion: draft.deceased.residenceRegion,
      residencePostalCode: draft.deceased.residencePostalCode,
    },
    will: {
      willLocation: draft.will.willLocation,
      probateRegistry: draft.will.probateRegistry,
      estateValueRange: draft.will.estateValueRange,
      anyRealProperty: draft.will.anyRealProperty,
      multipleBeneficiaries: draft.will.multipleBeneficiaries,
      realPropertyDetails: draft.will.realPropertyDetails,
    },
  };
}

function buildDraftInput(matterId: string, draft: IntakeDraft): Prisma.IntakeDraftUncheckedCreateInput {
  return {
    matterId,
    email: draft.welcome.email || "",
    consent: Boolean(draft.welcome.consent),
    exFullName: draft.executor.fullName || "",
    exPhone: draft.executor.phone || null,
    exCity: draft.executor.city || "",
    exRelation: draft.executor.relationToDeceased || "",
    decFullName: draft.deceased.fullName || "",
    decDateOfDeath: safeDate(draft.deceased.dateOfDeath),
    decCityProv: draft.deceased.cityProvince || "",
    hadWill: draft.deceased.hadWill === "yes",
    willLocation: draft.will.willLocation || "",
    estateValueRange: draft.will.estateValueRange,
    anyRealProperty: draft.will.anyRealProperty === "yes",
    multipleBeneficiaries: draft.will.multipleBeneficiaries === "yes",
    specialCircumstances: draft.will.specialCircumstances?.trim() || null,
    payload: draft as Prisma.InputJsonValue,
  };
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const input = SubmitSchema.safeParse(json);
  if (!input.success) {
    console.warn("[intake.submit] Invalid payload", input.error.flatten());
    return NextResponse.json({ error: "Invalid payload", details: input.error.flatten() }, { status: 400 });
  }

  if (!input.data.clientKey && !input.data.matterId) {
    return NextResponse.json({ error: "Missing client or matter id" }, { status: 400 });
  }
  if (!input.data.draft) {
    return NextResponse.json({ error: "Missing draft" }, { status: 400 });
  }
  const normalizedDraft = normalizeDraft(input.data.draft);
  const draft = intakeDraftSchema.safeParse(normalizedDraft);
  if (!draft.success) {
    const issues = summarizeIssues(draft.error);
    console.warn("[intake.submit] Draft validation failed", issues);
    return NextResponse.json(
      {
        error: `Invalid draft: ${issues[0]?.message ?? "Unknown error"}`,
        details: issues,
        debugDraft: debugDraftSnapshot(normalizedDraft),
      },
      { status: 400 },
    );
  }

  const { session } = await getServerAuth();
  const sessionUserId = session?.user && (session.user as { id?: string }).id;

  const matter = await ensureMatter({
    clientKey: input.data.clientKey ?? "fallback-client",
    matterId: input.data.matterId,
    userId: sessionUserId,
  });

  let draftRecord = await prisma.intakeDraft.findUnique({ where: { matterId: matter.id } });

  if (draft.data) {
    const createInput = buildDraftInput(matter.id, draft.data);
    const { matterId: _omit, ...updateData } = createInput;
    void _omit;
    draftRecord = await prisma.intakeDraft.upsert({
      where: { matterId: matter.id },
      create: createInput,
      update: updateData,
    });
  }

  if (!draftRecord) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const draftEmail = draftRecord.email?.trim();
  const normalizedEmail = draftEmail && draftEmail.includes("@") ? draftEmail : null;
  const resumeTokenEmail = normalizedEmail ?? `${matter.clientKey}@no-email.probatepath.local`;

  // Determine pathType based on will existence
  const hasWill = draft.data.estateIntake?.will?.hasWill;
  const pathType = hasWill === "no" ? "administration" : "probate";

  const result = await prisma.$transaction(async (tx) => {
    const updatedMatter = await tx.matter.update({
      where: { id: matter.id },
      data: {
        status: "REVIEW",
        userId: matter.userId ?? sessionUserId ?? null,
        pathType, // Persist the path type based on will existence
      },
    });

    await tx.generatedPack.upsert({
      where: { matterId: matter.id },
      create: { matterId: matter.id },
      update: {},
    });

    const resumeToken = await tx.resumeToken.create({
      data: {
        token: crypto.randomUUID(),
        matterId: matter.id,
        email: resumeTokenEmail,
        expiresAt: new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    const existingRequest = await tx.willSearchRequest.findFirst({ where: { matterId: matter.id } });
    if (!existingRequest) {
      const fallbackExecutorName = draftRecord.exFullName?.trim() || "Executor";
      const fallbackDeceasedName = draftRecord.decFullName?.trim() || "Deceased";
      const deceasedParts = splitName(fallbackDeceasedName);
      await tx.willSearchRequest.create({
        data: {
          matterId: matter.id,
          executorEmail: resumeTokenEmail,
          executorFullName: fallbackExecutorName,
          executorPhone: draftRecord.exPhone ?? null,
          executorCity: draftRecord.exCity ?? null,
          executorRelationship: draftRecord.exRelation ?? null,
          deceasedFullName: fallbackDeceasedName,
          deceasedGivenNames: deceasedParts.givenNames || null,
          deceasedSurname: deceasedParts.surname || null,
          deceasedDateOfDeath: draftRecord.decDateOfDeath ?? null,
          deceasedCity: draftRecord.decCityProv ?? null,
          hasWill: draftRecord.hadWill ?? null,
        },
      });
    }

    await tx.intakeDraft.update({
      where: { matterId: matter.id },
      data: { submittedAt: new Date(), finalSnapshot: draftRecord.payload ?? {} },
    });

    await logAudit({
      matterId: matter.id,
      action: "INTAKE_SUBMITTED",
      actorId: updatedMatter.userId,
    });

    if (updatedMatter.userId) {
      await logSecurityAudit({
        userId: updatedMatter.userId,
        matterId: matter.id,
        action: "intake.submit",
      });
    }

    return { updatedMatter, resumeToken };
  });

  const resumeLink = `${process.env.APP_URL ?? "http://localhost:3000"}/resume/${result.resumeToken.token}`;

  if (normalizedEmail) {
    await sendTemplateEmail({
      to: normalizedEmail,
      subject: "Your ProbateDesk draft",
      template: "intake-submitted",
      matterId: matter.id,
      html: `<p>Your draft is saved.</p><p>Resume anytime: <a href="${resumeLink}">${resumeLink}</a></p>`,
    });
  } else {
    console.warn("[intake.submit] Draft email missing; skipping notification");
  }

  // Send SMS confirmation if phone is available
  const phone = draftRecord.exPhone?.trim();
  if (phone) {
    const portalLink = `${process.env.APP_URL ?? "http://localhost:3000"}/portal`;
    await sendSMS({
      to: phone,
      body: `ProbateDesk: Your intake is submitted. We're preparing your documents. Check your portal: ${portalLink}`,
    }).catch((err) => {
      console.error("[intake.submit] SMS failed", { phone, error: err });
    });
  }

  const response = NextResponse.json({
    matterId: result.updatedMatter.id,
    resumeLink,
  });
  response.cookies.set("portalMatterId", result.updatedMatter.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
