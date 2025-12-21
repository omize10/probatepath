import { redirect } from "next/navigation";
import { UploadSelector } from "@/components/will-upload/UploadSelector";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WillUploadEntryPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    redirect(`/signin?next=${encodeURIComponent("/intake/will-upload")}`);
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <UploadSelector />
      </div>
    </main>
  );
}
