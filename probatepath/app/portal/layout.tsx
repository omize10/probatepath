import type { ReactNode } from "react";
import { PortalNav } from "@/components/portal/PortalNav";
import { requirePortalAuth } from "@/lib/auth";
import { logSecurityAudit } from "@/lib/audit";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { resolvePortalMatter } from "@/lib/portal/server";
import { calculatePortalProgress } from "@/lib/intake/portal/validation";
import { formatIntakeDraftRecord } from "@/lib/intake/format";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await requirePortalAuth("/portal");
  const userId = (session!.user as { id?: string }).id;
  let navStatus = "Start intake";

  if (userId && prismaEnabled) {
    await logSecurityAudit({ userId, action: "portal.view" });
    try {
      await prisma.user.findUnique({ where: { id: userId } });
      const matter = await resolvePortalMatter(userId);
      if (matter?.draft) {
        const normalized = formatIntakeDraftRecord(matter.draft);
        const pct = calculatePortalProgress(normalized);
        navStatus = `Draft saved · ${pct}%`;
      } else if (matter) {
        navStatus = "Matter ready";
      }
    } catch (error) {
      console.warn("[portal] Layout failed to resolve matter", { userId, error });
    }
  }

  return (
    <div className="pb-16 lg:grid lg:grid-cols-[270px,1fr] lg:gap-8">
      <aside className="mb-8 lg:mb-0">
        <PortalNav statusLabel={navStatus} />
      </aside>
      <main className="space-y-10">{children}</main>
    </div>
  );
}
