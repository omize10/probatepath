import { redirect } from "next/navigation";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { EligibilityGate } from "@/components/intake/eligibility/eligibility-gate";

export default async function ScreeningPage() {
  const session = await requirePortalAuth("/portal/screening");
  const userId = (session.user as { id?: string })?.id ?? null;

  if (!userId) {
    redirect("/login");
  }

  // Check if user already has a matter (meaning they've already passed screening)
  const existingMatter = await resolvePortalMatter(userId);
  if (existingMatter) {
    // User already has a matter - they've passed screening before
    if (existingMatter.rightFitStatus === "NOT_FIT") {
      redirect(`/matters/${existingMatter.id}/not-a-fit`);
    }
    // Already screened and eligible - send to pricing or intake
    redirect("/portal/pricing");
  }

  // Show the eligibility screening questions
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <EligibilityGate isAuthed={true} />
    </div>
  );
}
