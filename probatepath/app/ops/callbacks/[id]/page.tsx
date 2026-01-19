import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { CallbackStatusBadge, TierBadge } from "../components";
import { CallbackActions } from "./actions";

export const metadata: Metadata = {
  title: "Callback Details - Operations",
  description: "View and manage callback details.",
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "full",
  timeStyle: "short",
});

interface CallbackDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getCallback(id: string) {
  if (!prismaEnabled) {
    return null;
  }

  return prisma.callbackSchedule.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tierSelection: {
        select: {
          selectedTier: true,
          tierPrice: true,
          createdAt: true,
        },
      },
      willUploads: true,
      retellIntake: true,
    },
  });
}

export default async function CallbackDetailPage({ params }: CallbackDetailPageProps) {
  const { id } = await params;
  const callback = await getCallback(id);

  if (!callback) {
    notFound();
  }

  const scheduledDateTime = new Date(callback.scheduledDate);
  const [hours, minutes] = callback.scheduledTime.split(/[: ]/);
  const isPM = callback.scheduledTime.toLowerCase().includes("pm");
  scheduledDateTime.setHours(
    parseInt(hours) + (isPM && parseInt(hours) !== 12 ? 12 : 0),
    parseInt(minutes) || 0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Link
            href="/ops/callbacks"
            className="text-sm text-[color:var(--ink-muted)] hover:text-[color:var(--brand)]"
          >
            ← Back to Callbacks
          </Link>
          <h1 className="font-serif text-4xl text-[color:var(--ink)]">
            {callback.user.name || "Unnamed Client"}
          </h1>
          <div className="flex items-center gap-3">
            <TierBadge tier={callback.tierSelection.selectedTier} />
            <CallbackStatusBadge status={callback.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[color:var(--brand)]">Contact Information</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-[color:var(--ink-muted)]">Email</dt>
                <dd className="mt-1 text-sm font-medium text-[color:var(--ink)]">{callback.user.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[color:var(--ink-muted)]">Phone</dt>
                <dd className="mt-1 text-sm font-medium text-[color:var(--ink)]">{callback.phoneNumber}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[color:var(--ink-muted)]">Scheduled Call</dt>
                <dd className="mt-1 text-sm font-medium text-[color:var(--ink)]">
                  {dateFormatter.format(callback.scheduledDate)} at {callback.scheduledTime} PST
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[color:var(--ink-muted)]">Tier Price</dt>
                <dd className="mt-1 text-sm font-medium text-[color:var(--ink)]">
                  ${callback.tierSelection.tierPrice.toLocaleString()} CAD
                </dd>
              </div>
            </dl>
          </div>

          {/* Will Documents */}
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[color:var(--brand)]">
              Will Documents ({callback.willUploads.length})
            </h2>
            {callback.willUploads.length === 0 ? (
              <p className="text-sm text-[color:var(--ink-muted)]">No documents uploaded.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {callback.willUploads.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-[color:var(--border-muted)] p-3"
                  >
                    {doc.thumbnailUrl ? (
                      <img
                        src={doc.thumbnailUrl}
                        alt={doc.filename}
                        className="mb-2 h-24 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-[color:var(--bg-muted)]">
                        <span className="text-2xl">
                          {doc.fileType === "pdf" ? "📄" : "🖼️"}
                        </span>
                      </div>
                    )}
                    <p className="truncate text-sm font-medium text-[color:var(--ink)]">
                      {doc.filename}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {doc.qualityScore !== null && (
                        <span
                          className={`text-xs ${
                            doc.qualityScore >= 80
                              ? "text-green-600"
                              : doc.qualityScore >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          Quality: {doc.qualityScore}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={doc.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-[color:var(--brand)] hover:underline"
                      >
                        View Original
                      </a>
                      {doc.processedUrl && (
                        <a
                          href={doc.processedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[color:var(--brand)] hover:underline"
                        >
                          View Processed
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Intake Data */}
          {callback.retellIntake && (
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[color:var(--brand)]">Intake Data</h2>
              {callback.retellIntake.pushedToEstate ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    ✓ Intake data has been pushed to estate record
                  </p>
                  {callback.retellIntake.estateId && (
                    <Link
                      href={`/ops/cases/${callback.retellIntake.estateId}`}
                      className="mt-2 inline-block text-sm font-medium text-green-700 hover:underline"
                    >
                      View Estate →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {callback.retellIntake.recordingUrl && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[color:var(--ink-muted)]">
                        Recording
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={callback.retellIntake.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[color:var(--brand)] hover:underline"
                        >
                          Listen to Recording
                        </a>
                      </dd>
                    </div>
                  )}
                  {callback.retellIntake.transcriptUrl && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-[color:var(--ink-muted)]">
                        Transcript
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={callback.retellIntake.transcriptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[color:var(--brand)] hover:underline"
                        >
                          View Transcript
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[color:var(--ink-muted)]">
                      Raw Intake Data
                    </dt>
                    <dd className="mt-1">
                      <pre className="max-h-64 overflow-auto rounded-lg bg-[color:var(--bg-muted)] p-3 text-xs">
                        {JSON.stringify(callback.retellIntake.intakeData, null, 2)}
                      </pre>
                    </dd>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call Notes */}
          {callback.callNotes && (
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[color:var(--brand)]">Call Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-[color:var(--ink)]">
                {callback.callNotes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <CallbackActions
            callbackId={callback.id}
            currentStatus={callback.status}
            hasIntakeData={!!callback.retellIntake}
            intakePushed={callback.retellIntake?.pushedToEstate ?? false}
          />

          {/* Timeline */}
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[color:var(--brand)]">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[color:var(--brand)]" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--ink)]">Tier Selected</p>
                  <p className="text-xs text-[color:var(--ink-muted)]">
                    {dateFormatter.format(callback.tierSelection.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[color:var(--brand)]" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--ink)]">Callback Scheduled</p>
                  <p className="text-xs text-[color:var(--ink-muted)]">
                    {dateFormatter.format(callback.createdAt)}
                  </p>
                </div>
              </div>
              {callback.status !== "scheduled" && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[color:var(--brand)]" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--ink)]">Status Updated</p>
                    <p className="text-xs text-[color:var(--ink-muted)]">
                      {dateFormatter.format(callback.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
