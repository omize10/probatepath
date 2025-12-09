import type { ReactNode } from "react";
import { PortalNav } from "@/components/portal/PortalNav";
import { requirePortalAuth } from "@/lib/auth";
import { logSecurityAudit } from "@/lib/audit";
import { prismaEnabled } from "@/lib/prisma";
import { resolvePortalMatter } from "@/lib/portal/server";
import { portalStatusLabels } from "@/lib/portal/status";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await requirePortalAuth("/portal");
  const userId = (session!.user as { id?: string }).id;
  let navStatus = "Start intake";

  if (userId && prismaEnabled) {
    await logSecurityAudit({ userId, action: "portal.view" });
    try {
      const matter = await resolvePortalMatter(userId);
      if (matter) {
        navStatus = portalStatusLabels[matter.portalStatus] ?? "Active case";
      }
    } catch (error) {
      console.warn("[portal] Layout failed to resolve matter", { userId, error });
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <PortalNav statusLabel={navStatus} />
      <main className="mx-auto max-w-6xl space-y-10 px-6">{children}</main>
    </div>
  );
}
