import { getServerAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { ConfirmationClient } from "@/components/portal/ConfirmationClient";

export default async function ConfirmationPage() {
  const { session } = await getServerAuth();
  const userId = session?.user && (session.user as { id?: string }).id;
  const matter = await resolvePortalMatter(userId);
  const draftJson = matter?.draft ? JSON.stringify(matter.draft, null, 2) : null;

  return <ConfirmationClient matterId={matter?.id ?? null} draftJson={draftJson} />;
}
