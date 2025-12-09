import { redirect } from "next/navigation";

interface StepPageRedirectProps {
  params: Promise<{ stepId: string; pageSlug: string }>;
}

export default async function LegacyStepPageRedirect({ params }: StepPageRedirectProps) {
  void params;
  redirect("/portal");
}
