import type { PortalStatus } from "@prisma/client";

export const portalStatusOrder: PortalStatus[] = [
  "intake_complete",
  "will_search_prepping",
  "will_search_ready",
  "will_search_sent",
  "notices_in_progress",
  "notices_waiting_21_days",
  "probate_package_prepping",
  "probate_package_ready",
  "probate_filing_ready",
  "probate_filing_in_progress",
  "probate_filed",
  "waiting_for_grant",
  "grant_complete",
  "post_grant_active",
  "estate_closeout",
  "done",
];

export const portalStatusLabels: Record<PortalStatus, string> = {
  intake_complete: "Intake complete",
  will_search_prepping: "Will search – preparing",
  will_search_ready: "Will search – ready",
  will_search_sent: "Will search – mailed",
  notices_in_progress: "Notices in progress",
  notices_waiting_21_days: "Waiting 21 days after notices",
  probate_package_prepping: "Probate package – preparing",
  probate_package_ready: "Probate package – ready",
  probate_filing_ready: "Probate filing – ready",
  probate_filing_in_progress: "Probate filing – in progress",
  probate_filed: "Probate filed",
  waiting_for_grant: "Waiting for grant",
  grant_complete: "Grant complete",
  post_grant_active: "Post-grant administration",
  estate_closeout: "Estate closeout",
  done: "Finished",
};

export function hasReachedStatus(status: PortalStatus, target: PortalStatus): boolean {
  return portalStatusOrder.indexOf(status) >= portalStatusOrder.indexOf(target);
}

export function normalizePortalStatus(value?: string | null, fallback: PortalStatus = "intake_complete"): PortalStatus {
  if (!value) return fallback;
  const casted = value as PortalStatus;
  return portalStatusOrder.includes(casted) ? casted : fallback;
}
