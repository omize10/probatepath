import { notFound } from "next/navigation";
import { prisma } from "@/src/server/db/prisma";
import { ResumeHydrator } from "@/components/resume-hydrator";

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
  return (
    <ResumeHydrator
      draft={data.matter.draft}
      matterId={data.matterId}
      clientKey={data.matter.clientKey}
    />
  );
}
