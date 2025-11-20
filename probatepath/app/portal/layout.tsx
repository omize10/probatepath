import type { ReactNode } from "react";
import { PortalNav } from "@/components/portal/PortalNav";
import { requirePortalAuth } from "@/lib/auth";
import { logSecurityAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: require auth for portal SSR (middleware also checks JWT)
  const session = await requirePortalAuth("/portal");

  // Keep user lookup for future checks if needed
  // session is guaranteed to be non-null after requirePortalAuth()
  const userId = (session!.user as { id?: string }).id;
  if (userId) {
    // Log portal access
    await logSecurityAudit({
      userId,
      action: "portal.view",
    });

    // Previously we redirected unverified users to a verification flow.
    // That flow has been removed — allow access and rely on password-reset instead.
    await prisma.user.findUnique({ where: { id: userId } });
  }

  return (
    <div className="space-y-8 pb-16">
      <PortalNav />
      {children}
    </div>
  );
}
