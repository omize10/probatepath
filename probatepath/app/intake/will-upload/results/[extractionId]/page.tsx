import { redirect } from "next/navigation";
import { ExtractionResults, type ExtractionResult } from "@/components/will-upload/ExtractionResults";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WillResultsPage({ params }: { params: { extractionId: string } }) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    redirect(`/signin?next=${encodeURIComponent(`/intake/will-upload/results/${params.extractionId}`)}`);
  }

  const extraction = await prisma.willExtraction.findFirst({
    where: { id: params.extractionId, userId },
  });
  if (!extraction) {
    redirect("/intake/will-upload");
  }

  const data: ExtractionResult = {
    extractionId: params.extractionId,
    testatorName: extraction.testatorName,
    willDate: extraction.willDate,
    executors: Array.isArray(extraction.executors) ? (extraction.executors as unknown as ExtractionResult["executors"]) : [],
    beneficiaries: Array.isArray(extraction.beneficiaries)
      ? (extraction.beneficiaries as unknown as ExtractionResult["beneficiaries"])
      : [],
    hasCodicils: extraction.hasCodicils,
    handwrittenChanges: extraction.handwrittenChanges,
    issues: Array.isArray(extraction.issues) ? (extraction.issues as string[]) : [],
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6">
          <section className="space-y-4">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">AI extraction</p>
              <h1 className="text-2xl font-semibold text-gray-900">Here&apos;s what we found in your will</h1>
              <p className="text-sm text-gray-600">Review each item. You decide what to keep before continuing.</p>
            </header>
            <ExtractionResults extraction={data} />
          </section>
        </div>
      </div>
    </main>
  );
}
