import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import { getFormPdfUrl, getPhase1PacketUrl, getWillSearchPdfUrl } from "@/lib/portal/downloads";
import { portalStatusLabels, portalStatusOrder, normalizePortalStatus } from "@/lib/portal/status";
import { NOTICES_WAIT_REMINDER_TYPE, REMINDER_EMAIL_CHANNEL, scheduleNoticeWaitReminder, scheduleWillSearchReminder } from "@/lib/reminders";
import { updatePortalState, markNoticesMailed, markProbateFiled, markWillSearchMailed } from "@/lib/cases";
import { downloadAndStorePdf, savePdfToUploads } from "@/lib/uploads";
import { notifyPacketReady, notifyProbatePackageReady, notifyProbateFilingReady } from "@/lib/reminders";
import { PdfUploadControl } from "@/components/ops/PdfUploadControl";
import { NotesAndFlags } from "@/components/ops/NotesAndFlags";
import { getWillFilesForMatter } from "@/lib/will-files";

const dateFormatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" });

async function requireOpsAccess() {
  const cookieStore = await cookies();
  const hasPass = cookieStore.get("ops_auth")?.value === "1";
  if (!hasPass) {
    redirect("/ops");
  }
}

function parseDateTime(value: FormDataEntryValue | null | undefined): Date | null {
  if (!value) return null;
  const str = value.toString().trim();
  if (!str) return null;
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const toInputValue = (value?: Date | null) => (value ? new Date(value).toISOString().slice(0, 16) : "");

type TimestampField =
  | "willSearchPreparedAt"
  | "willSearchMailedAt"
  | "noticesPreparedAt"
  | "noticesMailedAt"
  | "probatePackagePreparedAt"
  | "probateFiledAt";

type PortalTimestampInput = Partial<Record<TimestampField, Date | null>>;

const timestampFieldLabels: Record<TimestampField, string> = {
  willSearchPreparedAt: "Will search prepared at",
  willSearchMailedAt: "Will search mailed at",
  noticesPreparedAt: "Notices prepared at",
  noticesMailedAt: "Notices mailed at",
  probatePackagePreparedAt: "Probate package prepared at",
  probateFiledAt: "Probate filed at",
};

function buildTimestampUpdate(field: TimestampField, value: Date | null): PortalTimestampInput {
  return {
    [field]: value,
  };
}

export async function savePortalStateAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  if (!caseId) redirect("/ops");

  const portalStatus = normalizePortalStatus(formData.get("portalStatus")?.toString(), "intake_complete");
  const willSearchPreparedAt = parseDateTime(formData.get("willSearchPreparedAt"));
  const willSearchMailedAt = parseDateTime(formData.get("willSearchMailedAt"));
  const noticesPreparedAt = parseDateTime(formData.get("noticesPreparedAt"));
  const noticesMailedAt = parseDateTime(formData.get("noticesMailedAt"));
  const probatePackagePreparedAt = parseDateTime(formData.get("probatePackagePreparedAt"));
  const probateFiledAt = parseDateTime(formData.get("probateFiledAt"));

  await updatePortalState(caseId, {
    portalStatus,
    willSearchPreparedAt,
    willSearchMailedAt,
    noticesPreparedAt,
    noticesMailedAt,
    probatePackagePreparedAt,
    probateFiledAt,
  });

  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=state`);
}

export async function timestampAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const field = formData.get("field")?.toString() as TimestampField | undefined;
  const mode = formData.get("mode")?.toString();
  if (!caseId || !field || !timestampFieldLabels[field]) redirect("/ops");

  const value = mode === "now" ? new Date() : null;
  await updatePortalState(caseId, buildTimestampUpdate(field, value));
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=${field}`);
}

export async function quickSetAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const kind = formData.get("kind")?.toString();
  if (!caseId || !kind) redirect("/ops");

  const now = new Date();
  if (kind === "will-search-mailed") {
    await markWillSearchMailed({ caseId, mailedAt: now, portalStatus: "will_search_sent" });
  } else if (kind === "notices-mailed") {
    await markNoticesMailed({ caseId, mailedAt: now, portalStatus: "notices_waiting_21_days" });
  } else if (kind === "probate-filed") {
    await markProbateFiled({ caseId, filedAt: now, portalStatus: "probate_filed" });
  }

  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=${kind}`);
}

export async function markPacketReadyAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  if (!caseId) redirect("/ops");

  const record = await prisma.matter.update({
    where: { id: caseId },
    data: { portalStatus: "will_search_ready", willSearchPackageReady: true, willSearchPreparedAt: new Date() },
    include: { user: true },
  });

  await notifyPacketReady(record);

  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=packet-ready`);
}

export async function markProbateReadyAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  if (!caseId) redirect("/ops");

  const record = await prisma.matter.findUnique({ where: { id: caseId }, include: { user: true } });
  if (!record) {
    notFound();
  }
  if (!record.probatePackagePdfUrl) {
    redirect(`/ops/cases/${caseId}?error=missing-probate-pdf`);
  }

  await updatePortalState(caseId, { portalStatus: "probate_filing_ready" });
  await notifyProbateFilingReady(record);

  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=probate-ready`);
}

export async function markProbateFiledAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  if (!caseId) redirect("/ops");
  await updatePortalState(caseId, { portalStatus: "probate_filed", probateFiledAt: new Date() });
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=probate-filed`);
}

export async function markGrantReceivedAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  if (!caseId) redirect("/ops");
  await updatePortalState(caseId, { portalStatus: "grant_complete", grantIssuedAt: new Date() });
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=grant-received`);
}

export async function scheduleHelperReminderAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const kind = formData.get("kind")?.toString();
  if (!caseId || !kind) redirect("/ops");
  const record = await prisma.matter.findUnique({
    where: { id: caseId },
    select: { willSearchMailedAt: true, p1MailedAt: true, noticesMailedAt: true },
  });
  if (!record) notFound();
  if (kind === "will-search") {
    const mailedAt = record.willSearchMailedAt ?? record.p1MailedAt;
    if (!mailedAt) redirect(`/ops/cases/${caseId}?error=missing-will-search-mail-date`);
    await scheduleWillSearchReminder({ caseId, mailedAt });
  } else if (kind === "notices") {
    const mailedAt = record.noticesMailedAt;
    if (!mailedAt) redirect(`/ops/cases/${caseId}?error=missing-notices-mail-date`);
    await scheduleNoticeWaitReminder({ caseId, mailedAt });
  }
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=reminder`);
}

export async function markReminderSentAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const reminderId = formData.get("reminderId")?.toString();
  if (!caseId || !reminderId) redirect("/ops");
  await prisma.reminder.update({ where: { id: reminderId }, data: { sentAt: new Date() } });
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=reminder`);
}

export async function updateReminderAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const reminderId = formData.get("reminderId")?.toString();
  if (!caseId || !reminderId) redirect("/ops");
  const dueAt = parseDateTime(formData.get("dueAt"));
  const channel = formData.get("channel")?.toString().trim() || REMINDER_EMAIL_CHANNEL;
  await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      ...(dueAt ? { dueAt } : {}),
      channel,
    },
  });
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=reminder`);
}

export async function setNoticeDaysLeftAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const daysStr = formData.get("daysLeft")?.toString();
  if (!caseId || !daysStr) redirect("/ops");
  const daysLeft = Number.parseInt(daysStr, 10);
  if (Number.isNaN(daysLeft)) redirect(`/ops/cases/${caseId}?error=invalid-days`);
  const clamped = Math.min(21, Math.max(0, daysLeft));
  const mailedAt = new Date();
  mailedAt.setDate(mailedAt.getDate() - (21 - clamped));
  await updatePortalState(caseId, { noticesMailedAt: mailedAt, portalStatus: "notices_waiting_21_days" });
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=notices-countdown`);
}

export async function uploadPdfAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const kind = formData.get("kind")?.toString();
  const file = formData.get("file") as File | null;
  if (!caseId || !kind || !file) {
    redirect("/ops");
  }
  const saved = await savePdfToUploads(caseId, kind, file);
  await updatePortalState(caseId, mapPdfField(kind, saved.url));
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=upload`);
}

export async function generatePdfAction(formData: FormData) {
  "use server";
  await requireOpsAccess();
  const caseId = formData.get("caseId")?.toString();
  const kind = formData.get("kind")?.toString();
  if (!caseId || !kind) redirect("/ops");
  const source = resolveSourceUrl(kind, caseId);
  const saved = await downloadAndStorePdf(caseId, kind, source);
  if (kind === "probate-package") {
    const record = await prisma.matter.update({
      where: { id: caseId },
      data: {
        ...mapPdfField(kind, saved.url),
        portalStatus: "probate_filing_ready",
        probatePackagePreparedAt: new Date(),
      },
      include: { user: true },
    });
    await notifyProbatePackageReady(record);
  } else {
    await updatePortalState(caseId, mapPdfField(kind, saved.url));
  }
  const path = `/ops/cases/${caseId}`;
  revalidatePath(path);
  redirect(`${path}?updated=generated`);
}

function mapPdfField(kind: string, url: string) {
  if (kind === "will-search") {
    return { willSearchPdfUrl: url };
  }
  if (kind === "p1-notice") {
    return { p1NoticePdfUrl: url };
  }
  if (kind === "p1-packet" || kind === "p1_packet") {
    return { p1PacketPdfUrl: url };
  }
  if (kind === "probate-package") {
    return { probatePackagePdfUrl: url };
  }
  return {};
}

function resolveSourceUrl(kind: string, caseId: string) {
  if (kind === "will-search") return getWillSearchPdfUrl(caseId, { download: true });
  if (kind === "p1-notice") return getFormPdfUrl("p1", caseId, { download: true });
  if (kind === "probate-package") return getPhase1PacketUrl(caseId);
  throw new Error("Unknown pdf kind");
}

interface CaseDetailPageProps {
  params: Promise<{ matterId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CaseDetailPage({ params, searchParams }: CaseDetailPageProps) {
  await requireOpsAccess();
  const resolvedParams = await params;
  const query = await searchParams;
  const caseId = resolvedParams.matterId;

  const record = await prisma.matter.findUnique({
    where: { id: caseId },
    include: {
      user: true,
      draft: true,
      willSearch: true,
      reminders: { orderBy: { dueAt: "asc" } },
      notes: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      flags: { orderBy: [{ status: "asc" }, { severity: "desc" }, { createdAt: "desc" }] },
    },
  });

  if (!record) {
    notFound();
  }

  const willFiles = await getWillFilesForMatter(caseId);
  const intake = record.draft ? formatIntakeDraftRecord(record.draft) : null;
  const noticeReminder = record.reminders.find((r) => r.type === NOTICES_WAIT_REMINDER_TYPE);
  const successMessage = typeof query?.updated === "string" ? "Saved" : null;

  const timestamps: { key: TimestampField; value: Date | null | undefined }[] = [
    { key: "willSearchPreparedAt", value: record.willSearchPreparedAt },
    { key: "willSearchMailedAt", value: record.willSearchMailedAt ?? record.p1MailedAt },
    { key: "noticesPreparedAt", value: record.noticesPreparedAt },
    { key: "noticesMailedAt", value: record.noticesMailedAt },
    { key: "probatePackagePreparedAt", value: record.probatePackagePreparedAt },
    { key: "probateFiledAt", value: record.probateFiledAt },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Link href="/ops" className="text-xs text-[color:var(--brand)] underline-offset-4 hover:underline">
            ← Back to cases
          </Link>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Case details</p>
            <h1 className="font-serif text-3xl text-[color:var(--ink)]">Case dashboard</h1>
            <p className="text-sm text-[color:var(--ink-muted)]">
              {record.user?.name ?? "Unnamed client"} · Case ID {record.caseCode ?? record.id}
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-[color:var(--ink-muted)]">
          <p>
            Portal status: <span className="font-semibold text-[color:var(--brand-navy)]">{portalStatusLabels[record.portalStatus]}</span>
          </p>
          <p>Created {dateFormatter.format(record.createdAt)}</p>
          <p>Updated {dateTimeFormatter.format(record.updatedAt)}</p>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Changes saved.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-4">
          <IntakeSnapshot intake={intake} />
          <WillFilesCard files={willFiles} />
          <ScreeningAnswersCard
            rightFitAnswers={record.rightFitAnswers}
            recommendedTier={record.recommendedTier}
            tierRecommendationReason={record.tierRecommendationReason}
            grantType={record.grantType}
            rightFitStatus={record.rightFitStatus}
          />
        </div>

        <div className="space-y-6">
          <PortalStatusCard record={record} timestamps={timestamps} />
          <DocumentsCard
            recordId={record.id}
            willSearchUrl={record.willSearchPdfUrl}
            p1PacketUrl={record.p1PacketPdfUrl ?? record.p1NoticePdfUrl}
            probateUrl={record.probatePackagePdfUrl}
            portalStatus={record.portalStatus}
            probateFiledAt={record.probateFiledAt}
            grantIssuedAt={record.grantIssuedAt}
          />
          <FormsGenerationCard recordId={record.id} />
          <RemindersCard recordId={record.id} reminders={record.reminders} noticeReminder={noticeReminder} noticeMailDate={record.noticesMailedAt} />
          <NotesAndFlags
            matterId={record.id}
            notes={record.notes.map((n) => ({
              id: n.id,
              content: n.content,
              createdAt: n.createdAt.toISOString(),
              user: { name: n.user.name, email: n.user.email },
            }))}
            flags={record.flags.map((f) => ({
              id: f.id,
              flagType: f.flagType as any,
              severity: f.severity as any,
              status: f.status as any,
              description: f.description,
              createdAt: f.createdAt.toISOString(),
              resolvedAt: f.resolvedAt?.toISOString() ?? null,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

type IntakeSnapshotProps = {
  intake: ReturnType<typeof formatIntakeDraftRecord> | null;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-32 shrink-0 text-[color:var(--ink-muted)]">{label}</span>
      <span className="text-[color:var(--ink)]">{value || "Not provided"}</span>
    </div>
  );
}

function IntakeCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function IntakeSnapshot({ intake }: IntakeSnapshotProps) {
  if (!intake) {
    return (
      <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink-muted)]">
        No intake data available for this case.
      </div>
    );
  }

  const estate = intake.estateIntake;
  const deceasedName = estate?.deceased?.name;
  const applicant = estate?.applicant;

  const beneficiarySummary =
    estate?.beneficiaries?.people?.length || estate?.beneficiaries?.organizations?.length
      ? `${(estate?.beneficiaries?.people?.length ?? 0) + (estate?.beneficiaries?.organizations?.length ?? 0)} beneficiary record(s)`
      : "";

  return (
    <div className="space-y-3">
      <IntakeCard title="Client & decedent">
        <InfoRow label="Client" value={`${intake.executor.fullName || applicant?.name?.first || ""} ${intake.welcome.email}`} />
        <InfoRow label="Decedent" value={[deceasedName?.first, deceasedName?.last].filter(Boolean).join(" ") || intake.deceased.fullName} />
        <InfoRow label="Date of death" value={intake.deceased.dateOfDeath} />
        <InfoRow label="City / province" value={intake.deceased.cityProvince} />
        <InfoRow label="Relation" value={intake.executor.relationToDeceased || applicant?.relationship || ""} />
      </IntakeCard>

      <IntakeCard title="Family + beneficiaries">
        <InfoRow
          label="Spouse"
          value={
            estate?.family?.hasSpouse
              ? `${estate.family.spouse.name.first} ${estate.family.spouse.name.last}`.trim()
              : intake.will.specialCircumstances
          }
        />
        <InfoRow
          label="Children"
          value={estate?.family?.children?.length ? `${estate.family.children.length} child(ren)` : intake.deceased.childrenCount}
        />
        <InfoRow label="Beneficiaries" value={beneficiarySummary} />
      </IntakeCard>

      <IntakeCard title="Will & executor">
        <InfoRow label="Will exists" value={estate?.will?.hasWill || intake.deceased.hadWill} />
        <InfoRow label="Will location" value={intake.will.willLocation || estate?.will?.storageLocation || ""} />
        <InfoRow
          label="Executor(s)"
          value={
            estate?.will?.namedExecutors?.length
              ? estate.will.namedExecutors.map((ex) => `${ex.name.first} ${ex.name.last}`.trim()).join(", ")
              : intake.executor.fullName
          }
        />
        <InfoRow label="Applicant" value={applicant ? `${applicant.name.first} ${applicant.name.last}`.trim() : intake.executor.fullName} />
      </IntakeCard>

      <IntakeCard title="Estate snapshot">
        <InfoRow
          label="Real property"
          value={
            estate?.assets?.hasBCRealEstate
              ? `${estate.assets.bcProperties.length} property record(s)`
              : intake.will.realPropertyDetails
          }
        />
        <InfoRow
          label="Bank / investments"
          value={
            estate?.assets?.accounts?.length
              ? `${estate.assets.accounts.length} account(s)`
              : intake.will.bankAccounts
          }
        />
        <InfoRow
          label="Debts"
          value={
            estate?.debts?.liabilities?.length ? `${estate.debts.liabilities.length} liability record(s)` : intake.will.liabilities
          }
        />
      </IntakeCard>

      <details className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm">
        <summary className="cursor-pointer text-[color:var(--brand)]">Show full intake JSON</summary>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-[color:var(--bg-muted)] p-3 text-xs text-[color:var(--ink-muted)]">
          {JSON.stringify(intake, null, 2)}
        </pre>
      </details>
    </div>
  );
}

type WillFilesCardProps = {
  files: Awaited<ReturnType<typeof getWillFilesForMatter>>;
};

function WillFilesCard({ files }: WillFilesCardProps) {
  const hasFiles = files.length > 0;
  return (
    <div className="space-y-3 rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Will files</p>
      {hasFiles ? (
        <div className="divide-y divide-[color:var(--border-muted)] rounded-xl border border-[color:var(--border-muted)]">
          {files.map((file) => (
            <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-[color:var(--ink)]">{file.originalFilename}</p>
                <p className="text-xs text-[color:var(--ink-muted)]">
                  {file.fileType === "image" ? (file.pageIndex ? `Photo page ${file.pageIndex}` : "Photo") : "PDF"}
                  {" · "}
                  {dateFormatter.format(file.createdAt)}
                </p>
              </div>
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-[color:var(--brand)] underline"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--ink-muted)]">No will files uploaded yet.</p>
      )}
    </div>
  );
}

type PortalStatusCardProps = {
  record: NonNullable<Awaited<ReturnType<typeof prisma.matter.findUnique>>>;
  timestamps: { key: TimestampField; value: Date | null | undefined }[];
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[color:var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--ink)]">
      {children}
    </span>
  );
}

function PortalStatusCard({ record, timestamps }: PortalStatusCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Portal status</p>
        <h3 className="font-serif text-xl text-[color:var(--ink)]">Portal Status Control</h3>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Adjust the portal status and key timestamps for this case. Use the testing countdown control in the Documents card to fast-forward the
          21-day waiting period.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Pill>{portalStatusLabels[record.portalStatus]}</Pill>
          {record.willSearchMailedAt ? <Pill>Will search mailed: {dateFormatter.format(record.willSearchMailedAt)}</Pill> : null}
          {record.noticesMailedAt ? <Pill>Notices mailed: {dateFormatter.format(record.noticesMailedAt)}</Pill> : null}
        </div>
      </header>

      <form action={savePortalStateAction} className="space-y-4 rounded-2xl border border-[color:var(--border-muted)] p-4">
        <input type="hidden" name="caseId" value={record.id} />
        <label className="space-y-1 text-sm text-[color:var(--ink)]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">Portal status</span>
          <select
            name="portalStatus"
            defaultValue={record.portalStatus}
            className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-3 py-2 text-sm"
          >
            {portalStatusOrder.map((status) => (
              <option key={status} value={status}>
                {portalStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {timestamps.map((ts) => (
            <label key={ts.key} className="space-y-1 text-sm text-[color:var(--ink)]">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">{timestampFieldLabels[ts.key]}</span>
              <input
                type="datetime-local"
                name={ts.key}
                defaultValue={toInputValue(ts.value ?? null)}
                className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">
            Save portal state
          </button>
          <span className="text-xs text-[color:var(--ink-muted)]">Timestamps are optional; leave blank to keep current values.</span>
        </div>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {timestamps.map((ts) => (
          <form key={`${ts.key}-quick`} action={timestampAction} className="flex items-center justify-between rounded-2xl border border-[color:var(--border-muted)] px-3 py-2 text-sm">
            <input type="hidden" name="caseId" value={record.id} />
            <input type="hidden" name="field" value={ts.key} />
            <div>
              <p className="font-semibold text-[color:var(--ink)]">{timestampFieldLabels[ts.key]}</p>
              <p className="text-xs text-[color:var(--ink-muted)]">{ts.value ? dateTimeFormatter.format(ts.value) : "Not set"}</p>
            </div>
            <div className="flex gap-2">
              <button
                name="mode"
                value="now"
                className="rounded-full border border-[color:var(--border-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--brand)] hover:bg-[color:var(--bg-muted)]"
              >
                Set now
              </button>
              <button
                name="mode"
                value="clear"
                className="rounded-full border border-[color:var(--border-muted)] px-3 py-1 text-xs text-[color:var(--ink-muted)] hover:bg-[color:var(--bg-muted)]"
              >
                Clear
              </button>
            </div>
          </form>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <form action={markPacketReadyAction}>
            <input type="hidden" name="caseId" value={record.id} />
            <button className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">
              Mark packet ready & notify
            </button>
          </form>
          <form action={quickSetAction}>
            <input type="hidden" name="caseId" value={record.id} />
            <input type="hidden" name="kind" value="will-search-mailed" />
            <button className="rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--brand)] hover:bg-white">
              Set will search mailed = now
            </button>
          </form>
          <form action={quickSetAction}>
            <input type="hidden" name="caseId" value={record.id} />
            <input type="hidden" name="kind" value="notices-mailed" />
            <button className="rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--brand)] hover:bg-white">
              Set notices mailed = now
            </button>
          </form>
          <form action={quickSetAction}>
            <input type="hidden" name="caseId" value={record.id} />
            <input type="hidden" name="kind" value="probate-filed" />
            <button className="rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--brand)] hover:bg-white">
              Set probate filed = now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

type DocumentsCardProps = {
  recordId: string;
  willSearchUrl: string | null;
  p1PacketUrl: string | null;
  probateUrl: string | null;
  portalStatus: string;
  probateFiledAt?: Date | null;
  grantIssuedAt?: Date | null;
};

function DocRow({
  title,
  description,
  existingUrl,
  generateKind,
  generateLabel,
  generateHref,
  recordId,
  uploadKind,
  extraContent,
  requireUrlForStatus = false,
}: {
  title: string;
  description: string;
  existingUrl: string | null;
  generateKind: string;
  generateLabel: string;
  generateHref: string;
  recordId: string;
  uploadKind: "will_search" | "p1_notice" | "p1_packet" | "probate_package";
  extraContent?: React.ReactNode;
  requireUrlForStatus?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[color:var(--border-muted)] p-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{title}</p>
        <p className="text-sm text-[color:var(--ink-muted)]">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {existingUrl ? (
          <a
            href={existingUrl}
            target="_blank"
            className="inline-flex items-center rounded-full border border-[color:var(--brand)] px-4 py-2 font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand)] hover:text-white"
          >
            Download prepared PDF
          </a>
        ) : (
          <p className="text-[color:var(--ink-muted)]">No prepared PDF uploaded yet.</p>
        )}
        <a
          href={generateHref}
          target="_blank"
          className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-xs font-semibold text-[color:var(--ink-muted)] hover:bg-[color:var(--bg-muted)]"
        >
          Preview system-generated
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <form action={generatePdfAction} className="space-y-2 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-3">
          <input type="hidden" name="caseId" value={recordId} />
          <input type="hidden" name="kind" value={generateKind} />
          <p className="text-xs font-semibold text-[color:var(--ink-muted)]">Generate from system and save</p>
          <button className="w-full rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">
            {generateLabel}
          </button>
        </form>
        <div className="rounded-2xl border border-dashed border-[color:var(--border-muted)] p-3">
          <PdfUploadControl label="Upload/replace PDF" kind={uploadKind} matterId={recordId} currentUrl={existingUrl} />
        </div>
      </div>
      {extraContent}
      {requireUrlForStatus && !existingUrl ? (
        <p className="text-xs text-red-600">Upload the filing packet before marking ready.</p>
      ) : null}
    </div>
  );
}

function DocumentsCard({ recordId, willSearchUrl, p1PacketUrl, probateUrl, portalStatus, probateFiledAt, grantIssuedAt }: DocumentsCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Documents</p>
        <h3 className="font-serif text-xl text-[color:var(--ink)]">Generate or drop-in PDFs</h3>
        <p className="text-sm text-[color:var(--ink-muted)]">Upload flattened PDFs or capture the system-generated ones for the client portal.</p>
      </header>
      <div className="space-y-4">
        <DocRow
          title="Will search / Vital Statistics"
          description="Use the generated VSA 532 or upload a custom filled copy."
          existingUrl={willSearchUrl}
          generateKind="will-search"
          generateLabel="Generate VSA 532"
          generateHref={getWillSearchPdfUrl(recordId, { download: true })}
          recordId={recordId}
          uploadKind="will_search"
        />
        <DocRow
          title="P1 Notices"
          description="Combined P1 notice + cover letter packet for mailing/emailing beneficiaries."
          existingUrl={p1PacketUrl}
          generateKind="p1-notice"
          generateLabel="Generate P1"
          generateHref={getFormPdfUrl("p1", recordId, { download: true })}
          recordId={recordId}
          uploadKind="p1_packet"
          extraContent={
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-3 text-sm text-[color:var(--ink)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">P1 + cover letter packet</p>
              <p className="mt-1 text-[color:var(--ink-muted)]">Download a combined packet with the P1 notice followed by the cover letter.</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {p1PacketUrl ? (
                  <a
                    href={`/api/matter/${recordId}/p1-print-packet`}
                    target="_blank"
                    className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
                  >
                    Download P1 + cover letter packet
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-xs font-semibold text-[color:var(--ink-muted)]">
                    Upload the P1 PDF to enable packet download
                  </span>
                )}
              </div>
            </div>
          }
        />
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4 text-sm text-[color:var(--ink)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Testing countdown</p>
          <p className="text-[color:var(--ink-muted)]">
            Set the remaining days on the 21-day notices timer (for testing). We adjust the mailed date to reflect this.
          </p>
          <form action={setNoticeDaysLeftAction} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="caseId" value={recordId} />
            <label className="space-y-1 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">Days left (0-21)</span>
              <input
                type="number"
                name="daysLeft"
                min={0}
                max={21}
                className="w-28 rounded-2xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
                defaultValue={21}
              />
            </label>
            <button className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">
              Set countdown
            </button>
          </form>
        </div>
        <DocRow
          title="Probate filing package"
          description="Standard packet (P2/P3/P9/P10) ready for filing."
          existingUrl={probateUrl}
          generateKind="probate-package"
          generateLabel="Generate probate package"
          generateHref={getPhase1PacketUrl(recordId)}
          recordId={recordId}
          uploadKind="probate_package"
          requireUrlForStatus
          extraContent={
            <div className="mt-3 space-y-3">
              <div className="space-y-1 text-xs text-[color:var(--ink-muted)]">
                <p>
                  Current status: {portalStatusLabels[portalStatus as keyof typeof portalStatusLabels] ?? portalStatus}
                </p>
                <p>Probate filed at: {probateFiledAt ? dateTimeFormatter.format(probateFiledAt) : "—"}</p>
                <p>Grant issued at: {grantIssuedAt ? dateTimeFormatter.format(grantIssuedAt) : "—"}</p>
              </div>
              <form action={markProbateReadyAction} className="space-y-2">
                <input type="hidden" name="caseId" value={recordId} />
                <button className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">
                  Probate filing ready & notify
                </button>
                {!probateUrl ? <p className="text-xs text-red-600">Upload the filing packet before notifying.</p> : null}
              </form>
              <div className="flex flex-wrap gap-2">
                <form action={markProbateFiledAction}>
                  <input type="hidden" name="caseId" value={recordId} />
                  <button className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-xs font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]">
                    Mark application filed
                  </button>
                </form>
                <form action={markGrantReceivedAction}>
                  <input type="hidden" name="caseId" value={recordId} />
                  <button className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-xs font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]">
                    Mark grant received
                  </button>
                </form>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

type RemindersCardProps = {
  recordId: string;
  reminders: Awaited<ReturnType<typeof prisma.reminder.findMany>>;
  noticeReminder?: { dueAt: Date; sentAt: Date | null } | undefined;
  noticeMailDate?: Date | null;
};

function RemindersCard({ recordId, reminders, noticeReminder }: RemindersCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Reminders</p>
        <h3 className="font-serif text-xl text-[color:var(--ink)]">Follow-ups</h3>
        <p className="text-sm text-[color:var(--ink-muted)]">View, adjust, and schedule automatic nudges.</p>
        {noticeReminder ? (
          <p className="text-xs text-[color:var(--ink-muted)]">
            Notices wait reminder due {dateTimeFormatter.format(noticeReminder.dueAt)}{" "}
            {noticeReminder.sentAt ? `(sent ${dateTimeFormatter.format(noticeReminder.sentAt)})` : "(pending)"}
          </p>
        ) : null}
      </header>

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-sm text-[color:var(--ink-muted)]">No reminders yet.</p>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--ink)]">{reminder.type}</p>
                  <p className="text-xs text-[color:var(--ink-muted)]">
                    Due {dateTimeFormatter.format(reminder.dueAt)} · Channel: {reminder.channel}
                  </p>
                  {reminder.sentAt ? <p className="text-xs text-[color:var(--ink-muted)]">Sent {dateTimeFormatter.format(reminder.sentAt)}</p> : null}
                </div>
                {!reminder.sentAt ? (
                  <form action={markReminderSentAction}>
                    <input type="hidden" name="caseId" value={recordId} />
                    <input type="hidden" name="reminderId" value={reminder.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand)] hover:text-white"
                    >
                      Mark sent
                    </button>
                  </form>
                ) : null}
              </div>
              <form action={updateReminderAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="caseId" value={recordId} />
                <input type="hidden" name="reminderId" value={reminder.id} />
                <label className="flex-1 space-y-1 text-sm text-[color:var(--ink)]">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">Due at</span>
                  <input
                    type="datetime-local"
                    name="dueAt"
                    defaultValue={toInputValue(reminder.dueAt)}
                    className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="w-full space-y-1 text-sm text-[color:var(--ink)] sm:w-52">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">Channel</span>
                  <input
                    type="text"
                    name="channel"
                    defaultValue={reminder.channel}
                    className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
                >
                  Update
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <form action={scheduleHelperReminderAction}>
          <input type="hidden" name="caseId" value={recordId} />
          <input type="hidden" name="kind" value="will-search" />
          <button className="w-full rounded-2xl border border-[color:var(--border-muted)] px-4 py-3 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--bg-muted)]">
            Create will search follow-up reminder
          </button>
        </form>
        <form action={scheduleHelperReminderAction}>
          <input type="hidden" name="caseId" value={recordId} />
          <input type="hidden" name="kind" value="notices" />
          <button className="w-full rounded-2xl border border-[color:var(--border-muted)] px-4 py-3 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--bg-muted)]">
            Create 21-day wait reminder
          </button>
        </form>
      </div>
    </div>
  );
}

function FormsGenerationCard({ recordId }: { recordId: string }) {
  // All 46 BC Probate Forms (P1-P46) - Kimi Dynamically Generated
  const forms = [
    // Core Estate Grant Forms (P1-P10)
    { id: "P1", name: "Notice of Proposed Application", available: true, pdf: true },
    { id: "P2", name: "Submission for Estate Grant", available: true, pdf: true },
    { id: "P3", name: "Affidavit of Applicant (Short Form)", available: true, pdf: true },
    { id: "P4", name: "Affidavit of Applicant (Long Form)", available: true, pdf: true },
    { id: "P5", name: "Administration Affidavit (Intestate)", available: true, pdf: true },
    { id: "P6", name: "Ancillary Grant (with Will)", available: true, pdf: true },
    { id: "P7", name: "Ancillary Grant (without Will)", available: true, pdf: true },
    { id: "P8", name: "Affidavit in Support", available: true, pdf: true },
    { id: "P9", name: "Affidavit of Delivery", available: true, pdf: true },
    { id: "P10", name: "Assets & Liabilities (Domiciled)", available: true, pdf: true },
    { id: "P11", name: "Assets & Liabilities (Non-Domiciled)", available: true, pdf: true },
    // Supporting Forms (P12-P20)
    { id: "P12", name: "Affidavit of Translator", available: true, pdf: true },
    { id: "P13", name: "Direction of Public Guardian", available: true, pdf: true },
    { id: "P14", name: "Supplemental Assets (Domiciled)", available: true, pdf: true },
    { id: "P15", name: "Supplemental Assets (Non-Domiciled)", available: true, pdf: true },
    { id: "P16", name: "Affidavit of Alteration", available: true, pdf: true },
    { id: "P17", name: "Notice of Renunciation", available: true, pdf: true },
    { id: "P18", name: "Authorization for Estate Info", available: true, pdf: true },
    { id: "P19", name: "Estate Grant", available: true, pdf: true },
    { id: "P20", name: "Correction Record", available: true, pdf: true },
    { id: "P20.1", name: "Correction Record (Style)", available: true, pdf: true },
    // Resealing Forms (P21-P28)
    { id: "P21", name: "Submission for Resealing", available: true, pdf: true },
    { id: "P22", name: "Affidavit for Resealing (with Will)", available: true, pdf: true },
    { id: "P23", name: "Affidavit for Resealing (no Will)", available: true, pdf: true },
    { id: "P24", name: "Affidavit in Support of Resealing", available: true, pdf: true },
    { id: "P25", name: "Assets & Liabilities (Resealing)", available: true, pdf: true },
    { id: "P26", name: "Supplemental Assets (Resealing)", available: true, pdf: true },
    { id: "P27", name: "Authorization for Resealing Info", available: true, pdf: true },
    { id: "P28", name: "Certificate of Resealing", available: true, pdf: true },
    // Dispute Forms (P29-P35)
    { id: "P29", name: "Notice of Dispute", available: true, pdf: true },
    { id: "P30", name: "Withdrawal of Notice of Dispute", available: true, pdf: true },
    { id: "P31", name: "Order for Removal of Dispute", available: true, pdf: true },
    { id: "P32", name: "Citation", available: true, pdf: true },
    { id: "P33", name: "Answer to Citation", available: true, pdf: true },
    { id: "P34", name: "Affidavit of Deemed Renunciation", available: true, pdf: true },
    { id: "P35", name: "Requisition for Subpoena", available: true, pdf: true },
    // Court Forms (P36-P46)
    { id: "P36", name: "Warrant After Subpoena", available: true, pdf: true },
    { id: "P37", name: "Subpoena", available: true, pdf: true },
    { id: "P38", name: "Affidavit to Pass Accounts", available: true, pdf: true },
    { id: "P39", name: "Certificate", available: true, pdf: true },
    { id: "P40", name: "Statement of Account Affidavit", available: true, pdf: true },
    { id: "P41", name: "Requisition — Estates", available: true, pdf: true },
    { id: "P42", name: "Notice of Application (Spousal)", available: true, pdf: true },
    { id: "P43", name: "Petition to Court", available: true, pdf: true },
    { id: "P44", name: "Notice of Withdrawal", available: true, pdf: true },
    { id: "P45", name: "Affidavit of Electronic Will", available: true, pdf: true },
    { id: "P46", name: "Demand for Electronic Will", available: true, pdf: true },
    // Cover letters (DOCX)
    { id: "NOTARY-COVER", name: "Notary Cover Letter", available: true, docx: true },
    { id: "COURT-COVER", name: "Court Cover Letter", available: true, docx: true },
    { id: "FILING-CHECKLIST", name: "Filing Checklist", available: true, docx: true },
  ];

  const getFormUrl = (form: { id: string }) => {
    return `/api/forms/generated/${form.id}/${recordId}?download=1`;
  };

  return (
    <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Kimi Dynamically Generated Probate Forms</p>
        <h3 className="font-serif text-xl text-[color:var(--ink)]">Pixel-Perfect Court Forms</h3>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Generate probate forms with dynamic content based on case data. Forms automatically include all beneficiaries, assets, and other details.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {forms.map((form) => (
          <a
            key={form.id}
            href={form.available ? getFormUrl(form) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              form.available
                ? "border-[color:var(--brand)] text-[color:var(--brand)] hover:bg-[color:var(--brand)] hover:text-white"
                : "border-[color:var(--border-muted)] text-[color:var(--ink-muted)] cursor-not-allowed opacity-60"
            }`}
          >
            <span>{form.name}</span>
            <span className="flex items-center gap-1 text-xs opacity-75">
              ({form.id})
              {form.pdf && <span className="ml-1 rounded bg-green-100 px-1 py-0.5 text-[10px] text-green-700">.pdf</span>}
              {form.updated && <span className="ml-1 rounded bg-blue-100 px-1 py-0.5 text-[10px] font-bold text-blue-700">Updated</span>}
              {form.comingSoon && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Coming Soon</span>}
            </span>
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">How it works:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Forms are generated in real-time from case data</li>
          <li>Beneficiary lists, assets, and liabilities auto-populate</li>
          <li>No manual data entry required - everything comes from the database</li>
          <li>PDF documents are court-ready and pixel-perfect match to official BC Supreme Court forms</li>
          <li>Generated by Kimi - exact text extracted from BC Laws</li>
        </ul>
      </div>
    </div>
  );
}

type ScreeningAnswersCardProps = {
  rightFitAnswers: any;
  recommendedTier?: string | null;
  tierRecommendationReason?: string | null;
  grantType?: string | null;
  rightFitStatus: string;
};

function ScreeningAnswersCard({
  rightFitAnswers,
  recommendedTier,
  tierRecommendationReason,
  grantType,
  rightFitStatus,
}: ScreeningAnswersCardProps) {
  if (!rightFitAnswers || rightFitStatus === "UNKNOWN") {
    return null;
  }

  const answers = rightFitAnswers as Record<string, any>;

  const formatAnswer = (key: string, value: any): string => {
    if (value === null || value === undefined) return "Not answered";
    
    // Boolean values
    if (typeof value === "boolean") return value ? "Yes" : "No";
    
    // Special formatting for specific fields
    switch (key) {
      case "hasWill":
        if (value === "yes") return "Yes";
        if (value === "no") return "No";
        if (value === "not_sure") return "Not sure";
        break;
      case "willProperlyWitnessed":
      case "willPreparedInBC":
      case "potentialDisputes":
        if (value === "yes") return "Yes";
        if (value === "no") return "No";
        if (value === "not_sure") return "Not sure";
        break;
      case "hasOriginalWill":
        if (value === true) return "Yes, I have the original";
        if (value === false) return "No, I only have a copy";
        if (value === "can_get_it") return "Not right now, but I can get it";
        break;
      case "beneficiariesAware":
        if (value === "yes") return "Yes, everyone knows";
        if (value === "no") return "No, I haven't shared it yet";
        if (value === "partial") return "Some know, some don't";
        break;
      case "assetsOutsideBC":
        if (value === "none") return "No, all assets are in BC";
        if (value === "other_provinces") return "Yes, in other Canadian provinces";
        if (value === "international") return "Yes, outside of Canada";
        break;
    }
    
    return String(value);
  };

  const tierDisplayNames: Record<string, string> = {
    basic: "Basic ($799)",
    standard: "Standard ($1,499)",
    premium: "Premium ($2,499)",
  };

  const hasRecommendation = rightFitStatus === "RECOMMENDED" && recommendedTier;

  return (
    <div className="space-y-3 rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Screening Answers</p>
      
      <div className="space-y-2 text-sm">
        {answers.hasWill !== undefined && (
          <InfoRow label="Has will?" value={formatAnswer("hasWill", answers.hasWill)} />
        )}
        
        {answers.willProperlyWitnessed !== undefined && (
          <InfoRow label="Properly witnessed?" value={formatAnswer("willProperlyWitnessed", answers.willProperlyWitnessed)} />
        )}
        
        {answers.willPreparedInBC !== undefined && (
          <InfoRow label="Prepared in BC?" value={formatAnswer("willPreparedInBC", answers.willPreparedInBC)} />
        )}
        
        {answers.hasOriginalWill !== undefined && (
          <InfoRow label="Has original?" value={formatAnswer("hasOriginalWill", answers.hasOriginalWill)} />
        )}
        
        {answers.beneficiariesAware !== undefined && (
          <InfoRow label="Beneficiaries aware?" value={formatAnswer("beneficiariesAware", answers.beneficiariesAware)} />
        )}
        
        {answers.potentialDisputes !== undefined && (
          <InfoRow label="Potential disputes?" value={formatAnswer("potentialDisputes", answers.potentialDisputes)} />
        )}
        
        {answers.assetsOutsideBC !== undefined && (
          <InfoRow label="Assets outside BC?" value={formatAnswer("assetsOutsideBC", answers.assetsOutsideBC)} />
        )}
      </div>

      {hasRecommendation && (
        <>
          <div className="my-3 border-t border-[color:var(--border-muted)]" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Recommended: {tierDisplayNames[recommendedTier] || recommendedTier}
              </span>
              {grantType && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  {grantType === "probate" ? "Probate" : "Administration"}
                </span>
              )}
            </div>
            {tierRecommendationReason && (
              <p className="text-xs text-[color:var(--ink-muted)]">{tierRecommendationReason}</p>
            )}
          </div>
        </>
      )}

      {rightFitStatus === "NOT_FIT" && (
        <>
          <div className="my-3 border-t border-[color:var(--border-muted)]" />
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs font-semibold text-amber-900">Open Door Law Referral</p>
            <p className="mt-1 text-xs text-amber-800">
              {tierRecommendationReason || "This case was referred to Open Door Law for full legal representation."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
