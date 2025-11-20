"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type ConfirmationClientProps = {
  matterId: string | null;
  draftJson: string | null;
};

export function ConfirmationClient({ matterId, draftJson }: ConfirmationClientProps) {
  const handleDownloadJSON = () => {
    if (!draftJson) return;
    const blob = new Blob([draftJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = matterId ? `intake-${matterId}.json` : "intake-draft.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f3f7]">
              <svg className="h-8 w-8 text-[color:var(--brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Intake submitted</CardTitle>
          <CardDescription className="mt-2">
            Your probate intake application is saved. You can always reopen the portal if you need to edit anything.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {matterId ? (
            <div className="rounded-lg border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4">
              <p className="text-xs text-[color:var(--muted-ink)]">Matter ID</p>
              <p className="break-all font-mono text-sm font-semibold text-[color:var(--brand)]">{matterId}</p>
              <p className="mt-2 text-xs text-[color:var(--muted-ink)]">Save this ID for your records or when you contact the registry.</p>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-sm text-[color:var(--muted-ink)]">
              Next steps happen inside your portal: finish the will search form, keep executors and beneficiaries updated, and download the Phase 1
              packet from Documents whenever you need it.
            </p>
          </div>

          <div className="space-y-3 border-t border-[color:var(--border-muted)] pt-4">
            <Button variant="outline" onClick={handleDownloadJSON} className="w-full" disabled={!draftJson}>
              Download submission as JSON
            </Button>
            <Link href="/portal" className="block">
              <Button className="w-full">Go to dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
