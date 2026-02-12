import type { APIRequestContext } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "https://www.probatedesk.com";

/**
 * Clean up a test user by email.
 * Uses the dev endpoint if available, otherwise just logs a warning.
 */
export async function deleteTestUser(
  request: APIRequestContext,
  email: string
) {
  try {
    const res = await request.post(`${BASE}/api/ops/dev/cleanup-test-user`, {
      data: { email },
    });
    if (res.ok()) {
      return true;
    }
  } catch {
    // Endpoint may not exist yet
  }
  console.warn(`[cleanup] Could not delete test user: ${email}`);
  return false;
}
