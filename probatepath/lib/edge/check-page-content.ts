/**
 * Edge-compatible check for published Puck page content.
 * Uses Supabase REST API (not Prisma) because middleware runs in edge runtime.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function hasPageContent(slug: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 500);

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/PageContent?slug=eq.${encodeURIComponent(slug)}&select=slug&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) return false;

    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    // Timeout, network error, or Supabase down — fall through to original page
    return false;
  }
}
