'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollFade } from "@/components/scroll-fade";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { deriveDraftStatus, loadChecklist, setChecklistItem, clearChecklist, type ChecklistState } from "@/lib/portal/storage";
import { mockMarkComplete } from "@/lib/mock";
import type { IntakeDraft } from "@/lib/intake/types";

const CHECKLIST_ITEMS = [
  {
    id: "will-search",
    title: "Will search packet",
    description: "Download the wills registry request template and prepare the envelope.",
    details: [
      "Confirm you have the latest will or send a registry search",
      "Print the cover letter and add executor ID photocopies",
      "Use the prepaid envelope label from the pack",
    ],
    image: "/images/steps-1.jpg",
  },
  {
    id: "intake",
    title: "Intake completed",
    description: "Finish the online intake so specialists can review for gaps.",
    details: [
      "All executor and deceased questions answered",
      "Assets/liabilities notes shared",
      "Uploaded supporting PDFs if available",
    ],
    image: "/images/steps-2.jpg",
  },
  {
    id: "pack-generated",
    title: "Pack generated",
    description: "Your filing-ready pack is created with signing tabs and notices.",
    details: [
      "Forms P1, P3/P4, P9, P10/P11 prepared",
      "Cover letter customised for your registry",
      "Notices bundled with mail labels",
    ],
    image: "/images/steps-3.jpg",
  },
  {
    id: "notarization",
    title: "Notarization booked",
    description: "Coordinate a $200 flat appointment with Open Door Law.",
    details: [
      "Bring original will, codicils, and ID",
      "Executor signs the affidavit in front of the lawyer",
      "Confirm two pieces of ID are ready",
    ],
    image: "/images/notary.jpg",
  },
  {
    id: "assemble-mail",
    title: "Assemble & mail",
    description: "Print, tab, and courier your package with tracking.",
    details: [
      "Use the checklist to stack documents correctly",
      "Add notarised originals and certified copies",
      "Courier to the selected Supreme Court registry",
    ],
    image: "/images/mail.jpg",
  },
  {
    id: "defects",
    title: "Defect letters",
    description: "If the court requests changes, track and resolve them quickly.",
    details: [
      "Upload a photo of the letter",
      "We highlight what to fix inside your pack",
      "Send replacements via courier",
    ],
    image: "/images/success.jpg",
  },
] as const;

type PortalSummary = {
  id: string;
  draft: IntakeDraft | null;
};

type PortalSummaryResponse = {
  matter: {
    id: string;
    draft: { payload: IntakeDraft | null } | null;
    pack: { zipUrl: string | null } | null;
    willSearch: Array<{ packetUrl: string | null }> | null;
  } | null;
};

type SummaryFileState = {
  packetUrl: string | null;
  packUrl: string | null;
};

export default function PortalPage() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [summary, setSummary] = useState<PortalSummary | null>(null);
  const [files, setFiles] = useState<SummaryFileState>({ packetUrl: null, packUrl: null });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setChecklist(loadChecklist());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    let active = true;

    const loadSummary = async () => {
      try {
        const res = await fetch("/api/portal/summary");
        if (!res.ok) return;
        const data: PortalSummaryResponse = await res.json();
        if (!active || !data.matter) return;

        setSummary({
          id: data.matter.id,
          draft: data.matter.draft?.payload ?? null,
        });
        setFiles({
          packetUrl: data.matter.willSearch?.[0]?.packetUrl ?? null,
          packUrl: data.matter.pack?.zipUrl ?? null,
        });
      } catch {
        // ignore network errors
      }
    };

    void loadSummary();

    return () => {
      active = false;
    };
  }, [status]);

  const draftStatus = useMemo(() => deriveDraftStatus(summary?.draft ?? null), [summary]);
  const matterId = summary?.id ?? null;

  const handleMarkComplete = async (id: string) => {
    if (matterId && id === "will-search") {
      const res = await fetch("/api/will-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId }),
      });
      if (res.ok) {
        const json = await res.json();
        setFiles((prev) => ({ ...prev, packetUrl: json.packetUrl }));
      }
    } else if (matterId && id === "pack-generated") {
      const res = await fetch("/api/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId }),
      });
      if (res.ok) {
        const json = await res.json();
        setFiles((prev) => ({ ...prev, packUrl: json.zipUrl }));
      }
    } else {
      toast({ title: "Saving…" });
      await mockMarkComplete();
    }
    const next = setChecklistItem(id, true);
    setChecklist({ ...next });
    toast({ title: "Marked complete", intent: "success" });
  };

  const handleReset = () => {
    clearChecklist();
    setChecklist({});
    toast({ title: "Progress reset", description: "Checklist progress cleared on this device." });
  };

  if (status === "loading") {
    return <p className="text-sm text-[#495067]">Loading portal…</p>;
  }

  if (!session) {
    return (
      <div className="space-y-6 pb-16">
        <h1 className="font-serif text-4xl text-[#0f172a]">Portal</h1>
        <p className="max-w-2xl text-base text-[#495067]">
          Sign in to your portal to view the live checklist. We only store details on this device.
        </p>
        <Button asChild className="w-fit bg-[#ff6a00] text-white hover:bg-[#e45f00]">
          <Link href="/signin">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <Card className="border-[#d7ddec]">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Your portal snapshot stays private inside this browser.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
            <div className="space-y-4 text-sm text-[#0f172a]">
              <p>
                Email: <span className="font-semibold">{session.user?.email ?? ""}</span>
              </p>
              <p>
                Draft status: <span className="font-semibold">{draftStatus}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/start">Resume intake</Link>
                </Button>
                {matterId ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/portal/how-to-assemble?matterId=${matterId}`}>
                      How to assemble & file
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="relative h-36 overflow-hidden rounded-2xl bg-[#0c3b6c]">
              <Image src="/images/portal-hero.jpg" alt="Portal preview" fill className="object-cover opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#d7ddec]">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage your checklist state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {matterId ? (
              <Button asChild className="w-full bg-[#ff6a00] text-white hover:bg-[#e45f00]">
                <Link href={`/portal/how-to-assemble?matterId=${matterId}`}>Open how-to guide</Link>
              </Button>
            ) : null}
            <Button variant="outline" className="w-full" onClick={handleReset}>
              Reset checklist
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-3xl text-[#0f172a]">Rolling checklist</h2>
        <p className="text-sm text-[#495067]">
          Follow each step and mark it complete. Everything saves locally so you can resume anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {CHECKLIST_ITEMS.map((item) => {
          const completed = checklist[item.id];
          return (
            <ScrollFade key={item.id} className="h-full">
              <Card className="flex h-full flex-col border-[#d7ddec]">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {item.title}
                    <span className={completed ? "text-xs font-semibold text-[#0c3b6c]" : "text-xs text-[#94a3b8]"}>
                      {completed ? "Completed" : "Pending"}
                    </span>
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="relative h-36 overflow-hidden rounded-2xl border border-[#e2e8f0]">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View details
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
                      <SheetHeader>
                        <CardTitle className="text-left">{item.title}</CardTitle>
                        <CardDescription className="text-left">{item.description}</CardDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        {item.details.map((detail) => (
                          <div key={detail} className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#ff6a00]" />
                            <p className="text-sm text-[#0f172a]">{detail}</p>
                          </div>
                        ))}
                        {item.id === "will-search" && files.packetUrl ? (
                          <Link href={files.packetUrl} className="text-sm font-semibold text-[#0c3b6c]" target="_blank">
                            Download packet
                          </Link>
                        ) : null}
                        {item.id === "pack-generated" && files.packUrl ? (
                          <Link href={files.packUrl} className="text-sm font-semibold text-[#0c3b6c]" target="_blank">
                            Download pack
                          </Link>
                        ) : null}
                        <Button
                          className="w-full bg-[#ff6a00] text-white hover:bg-[#e45f00]"
                          onClick={() => handleMarkComplete(item.id)}
                          disabled={completed}
                        >
                          {completed ? "Already completed" : "Mark complete"}
                        </Button>
                        <SheetClose asChild>
                          <Button variant="ghost" className="w-full">
                            Close
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>
            </ScrollFade>
          );
        })}
      </div>
    </div>
  );
}
