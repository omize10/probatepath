import Link from "next/link";
import type { Metadata } from "next";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { CallbackStatusBadge, TierBadge } from "./components";

export const metadata: Metadata = {
  title: "Scheduled Callbacks - Operations",
  description: "Manage scheduled intake callbacks.",
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat("en-CA", { timeStyle: "short" });

interface CallbacksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getCallbacks(includeCompleted: boolean) {
  if (!prismaEnabled) {
    return [];
  }

  const whereClause = includeCompleted
    ? {}
    : { status: { not: "intake_complete" as const } };

  return prisma.callbackSchedule.findMany({
    where: whereClause,
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
        },
      },
      willUploads: {
        select: {
          id: true,
        },
      },
      retellIntake: {
        select: {
          id: true,
          pushedToEstate: true,
        },
      },
    },
    orderBy: [
      { scheduledDate: "asc" },
      { scheduledTime: "asc" },
    ],
  });
}

export default async function CallbacksPage({ searchParams }: CallbacksPageProps) {
  const params = await searchParams;
  const includeCompleted = params.completed === "true";
  const callbacks = await getCallbacks(includeCompleted);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Operations</p>
        <h1 className="font-serif text-4xl text-[color:var(--ink)]">Scheduled Callbacks</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Manage intake calls for Standard and Premium clients.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/ops/callbacks"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            !includeCompleted
              ? "bg-[color:var(--brand)] text-white"
              : "border border-[color:var(--border-muted)] text-[color:var(--ink-muted)] hover:bg-[color:var(--bg-muted)]"
          }`}
        >
          Active
        </Link>
        <Link
          href="/ops/callbacks?completed=true"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            includeCompleted
              ? "bg-[color:var(--brand)] text-white"
              : "border border-[color:var(--border-muted)] text-[color:var(--ink-muted)] hover:bg-[color:var(--bg-muted)]"
          }`}
        >
          All
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-white shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-[color:var(--border-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)] sm:px-6">
          <span>Client</span>
          <span>Date/Time</span>
          <span>Phone</span>
          <span>Tier</span>
          <span>Status</span>
          <span>Docs</span>
          <span className="text-right">Actions</span>
        </div>

        {callbacks.length === 0 ? (
          <div className="px-6 py-10 text-sm text-[color:var(--ink-muted)]">
            No scheduled callbacks. Standard and Premium clients will appear here after scheduling.
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border-muted)]">
            {callbacks.map((callback) => (
              <div
                key={callback.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-4 text-sm text-[color:var(--ink)] sm:px-6"
              >
                <div className="truncate">
                  <p className="font-semibold">{callback.user.name || "Unnamed client"}</p>
                  <p className="text-xs text-[color:var(--ink-muted)]">{callback.user.email}</p>
                </div>
                <div>
                  <p className="font-medium">{dateFormatter.format(callback.scheduledDate)}</p>
                  <p className="text-xs text-[color:var(--ink-muted)]">{callback.scheduledTime} PST</p>
                </div>
                <div className="truncate text-[color:var(--ink-muted)]">{callback.phoneNumber}</div>
                <div>
                  <TierBadge tier={callback.tierSelection.selectedTier} />
                </div>
                <div>
                  <CallbackStatusBadge status={callback.status} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[color:var(--ink-muted)]">
                    {callback.willUploads.length} file{callback.willUploads.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/ops/callbacks/${callback.id}`}
                    className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)] shadow-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
