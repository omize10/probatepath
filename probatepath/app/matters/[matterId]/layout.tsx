import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { PortalNav } from "@/components/portal/PortalNav";
import { requirePortalAuth } from "@/lib/auth";
import { calculatePortalProgress } from "@/lib/intake/portal/validation";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import { getMatterForUser } from "@/lib/matter/server";
import { getWillFilesForMatter, serializeWillFiles } from "@/lib/will-files";

interface MatterLayoutProps {
  children: ReactNode;
  params: Promise<{ matterId: string }>;
}

export default async function MatterLayout({ children, params }: MatterLayoutProps) {
  const resolvedParams = await params;
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  if (!userId) {
    redirect("/portal");
  }

  const matter = await getMatterForUser(resolvedParams.matterId, userId);
  if (!matter) {
    redirect("/portal");
  }

  const willFiles = await getWillFilesForMatter(resolvedParams.matterId);
  const serializedWillFiles = serializeWillFiles(willFiles);
  const formattedDraft = matter.draft ?? null;
  const normalizedDraft = formattedDraft?.payload ? formatIntakeDraftRecord(formattedDraft) : null;
  const enhancedDraft = normalizedDraft
    ? {
        ...normalizedDraft,
        estateIntake: {
          ...normalizedDraft.estateIntake,
          willUpload: {
            hasFiles: serializedWillFiles.length > 0,
            lastUploadedAt: serializedWillFiles[serializedWillFiles.length - 1]?.createdAt ?? "",
          },
        },
      }
    : null;
  const progress = enhancedDraft ? calculatePortalProgress(enhancedDraft) : 0;
  const statusLabel = formattedDraft?.submittedAt ? "Submitted" : `Draft saved · ${progress}%`;

  return (
    <div className="pb-16 lg:grid lg:grid-cols-[270px,1fr] lg:gap-8">
      <aside className="mb-8 lg:mb-0">
        <PortalNav statusLabel={statusLabel} />
      </aside>
      <main className="space-y-10">{children}</main>
    </div>
  );
}
