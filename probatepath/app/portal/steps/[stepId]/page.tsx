import { redirect } from "next/navigation";

interface StepRedirectProps {
  params: Promise<{ stepId: string }>;
}

export default async function LegacyStepPage({ params }: StepRedirectProps) {
  void params;
  redirect("/portal");
}
