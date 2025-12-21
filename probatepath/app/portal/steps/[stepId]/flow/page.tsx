import { redirect } from "next/navigation";

interface StepFlowRedirectProps {
  params: Promise<{ stepId: string }>;
}

export default async function LegacyStepFlowPage({ params }: StepFlowRedirectProps) {
  void params;
  redirect("/portal");
}
