const buildUrl = (base: string, download?: boolean) => (download ? `${base}?download=1` : base);

export function getWillSearchPdfUrl(matterId: string, opts?: { download?: boolean }) {
  return buildUrl(`/api/will-search/${matterId}/pdf`, opts?.download);
}

export function getFormPdfUrl(formId: string, matterId: string, opts?: { download?: boolean }) {
  return buildUrl(`/api/forms/${formId}/${matterId}/pdf`, opts?.download);
}

export function getPhase1PacketUrl(matterId: string) {
  return `/api/matter/${matterId}/package/phase1/pdf`;
}

export function getSchedulePdfUrl(matterId: string, scheduleId: string, opts?: { download?: boolean }) {
  return buildUrl(`/api/matter/${matterId}/schedules/${scheduleId}/pdf`, opts?.download);
}
