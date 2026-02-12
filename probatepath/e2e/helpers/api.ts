import type { APIRequestContext } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "https://www.probatedesk.com";

/** Set portal status via the dev endpoint (no auth required) */
export async function setPortalStatus(
  request: APIRequestContext,
  matterId: string,
  status: string
) {
  const res = await request.post(`${BASE}/api/ops/dev/set-status`, {
    data: { matterId, status },
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`set-status failed (${res.status()}): ${body}`);
  }
  return res.json();
}

/** Submit intake via API for fast test setup */
export async function submitIntakeViaAPI(
  request: APIRequestContext,
  matterId: string,
  payload: Record<string, unknown>
) {
  const res = await request.post(`${BASE}/api/intake/submit`, {
    data: { matterId, ...payload },
  });
  return { status: res.status(), body: await res.json() };
}

/** Save intake draft via API */
export async function saveIntakeDraft(
  request: APIRequestContext,
  matterId: string,
  draft: Record<string, unknown>
) {
  const res = await request.post(`${BASE}/api/intake/save`, {
    data: { matterId, draft },
  });
  return { status: res.status(), body: await res.json() };
}

/** Get portal summary for a matter */
export async function getPortalSummary(request: APIRequestContext) {
  const res = await request.get(`${BASE}/api/portal/summary`);
  return { status: res.status(), body: await res.json() };
}
