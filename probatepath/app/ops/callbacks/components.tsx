'use client';

import { type CallbackStatus, type Tier } from "@prisma/client";

const statusLabels: Record<CallbackStatus, string> = {
  scheduled: "Scheduled",
  call_in_progress: "Call In Progress",
  call_complete: "Call Complete",
  intake_complete: "Intake Complete",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const statusColors: Record<CallbackStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  call_in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  call_complete: "bg-green-100 text-green-800 border-green-200",
  intake_complete: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  no_show: "bg-orange-100 text-orange-800 border-orange-200",
};

export function CallbackStatusBadge({ status }: { status: CallbackStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

const tierColors: Record<Tier, string> = {
  basic: "bg-gray-100 text-slate-700 border-gray-200",
  standard: "bg-blue-50 text-blue-700 border-blue-200",
  premium: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const tierLabels: Record<Tier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "PREMIUM",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${tierColors[tier]}`}
    >
      {tierLabels[tier]}
    </span>
  );
}
