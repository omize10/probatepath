import { redirect } from "next/navigation";
import { EligibilityGate } from "@/components/intake/eligibility/eligibility-gate";
import { auth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";

export const dynamic = "force-dynamic";

interface StartPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StartPage({ searchParams }: StartPageProps) {
  const params = await searchParams;
  const forceGate = typeof params?.retry === "string" ? params.retry === "1" || params.retry === "true" : false;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;

  // Always require an account before showing the eligibility gate to avoid double prompts.
  if (!userId) {
    redirect(`/create-account?next=${encodeURIComponent("/start")}`);
  }

  if (userId && !forceGate) {
    const matter = await resolvePortalMatter(userId);
    if (matter?.rightFitStatus === "NOT_FIT") {
      redirect(`/matters/${matter.id}/not-a-fit`);
    }
    if (matter && !(matter.draft?.submittedAt ?? false)) {
      redirect(`/matters/${matter.id}/intake`);
    }
    if (matter?.rightFitStatus === "ELIGIBLE") {
      redirect("/portal/intake");
    }
    if (matter) {
      redirect("/portal");
    }
  }

  return (
    <main className="px-4">
      <EligibilityGate isAuthed={Boolean(userId)} />
    </main>
  );
}
