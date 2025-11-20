import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResumeHydrator } from "@/components/resume-hydrator";
import { defaultIntakeDraft, type IntakeDraft } from "@/lib/intake/types";

interface ResumePageProps {
  params: { token: string };
}

export default async function ResumePage({ params }: ResumePageProps) {
  const data = await prisma.resumeToken.findUnique({
    where: { token: params.token },
    include: { matter: { include: { draft: true } } },
  });
  if (!data || !data.matter?.draft) {
    notFound();
  }
  if (data.expiresAt < new Date()) {
    notFound();
  }
  const draftPayload = (data.matter.draft.payload as IntakeDraft | null) ?? defaultIntakeDraft;
  return (
    <ResumeHydrator
      draft={draftPayload}
      matterId={data.matterId}
      clientKey={data.matter.clientKey}
    />
  );
}
