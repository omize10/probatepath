import { headers } from "next/headers";

export async function getRequestClientInfo() {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = headerStore.get("user-agent") ?? undefined;
  return { ip, userAgent };
}
