'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollFade } from "@/components/scroll-fade";
import { useToast } from "@/components/ui/toast";
import { mockBookNotary, mockCreatePack, mockGeneratePacket, mockMarkComplete } from "@/lib/mock";

const SECTIONS = [
  {
    key: "will-search",
    title: "Will search (request packet)",
    body:
      "Generate the registry request letter, envelope labels, and required ID checklist. Drop it off at any Service BC office or mail it with tracking.",
    image: "/images/envelope.jpg",
    actionLabel: "Generate packet",
    completionText: "Packet generated",
  },
  {
    key: "notary",
    title: "Notarization @ Open Door Law",
    body:
      "Book the $200 flat notarization appointment. Arrive with the original will, ID, and unsigned affidavits. We highlight where to sign.",
    image: "/images/notary.jpg",
    actionLabel: "Book appointment",
    completionText: "Appointment booked",
  },
  {
    key: "print-pack",
    title: "Print & label your pack",
    body:
      "Download your latest pack (P1, P3/P4, P9, P10/P11, notices) and follow the signing map. Use the provided labels for each envelope.",
    image: "/images/labels.jpg",
    actionLabel: "Create pack",
    completionText: "Pack ready",
  },
  {
    key: "mail-track",
    title: "Mail & track",
    body:
      "We recommend courier delivery to the registry. Stick the shipping label, keep the tracking number, and note estimated arrival.",
    image: "/images/mail.jpg",
    actionLabel: "Mark as mailed",
    completionText: "Parcel sent",
  },
  {
    key: "defects",
    title: "Defect letters",
    body:
      "If the court sends a defect letter, upload a copy so we can highlight fixes. Respond quickly to avoid delays.",
    image: "/images/success.jpg",
    actionLabel: "Mark defect resolved",
    completionText: "Defect cleared",
  },
] as const;

const CONFETTI_PARTICLES = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  delay: `${((index * 13) % 10) / 10}s`,
}));

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {CONFETTI_PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="absolute h-2 w-2 rounded-full bg-[#ff6a00] opacity-70"
          style={{
            left: particle.left,
            top: particle.top,
            animation: `float 3s ease-in-out infinite`,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function HowToAssemblePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const matterId = searchParams.get("matterId");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [actionNote, setActionNote] = useState("");
  const atFinalScreen = currentIndex >= SECTIONS.length;
  const effectiveIndex = atFinalScreen ? SECTIONS.length - 1 : currentIndex;
  const currentSection = SECTIONS[effectiveIndex];
  const totalSteps = SECTIONS.length + 1;
  const progressBase = atFinalScreen ? SECTIONS.length : effectiveIndex + (completion[currentSection.key] ? 1 : 0);
  const progress = (progressBase / totalSteps) * 100;

  const handleAction = async () => {
    switch (currentSection.key) {
      case "will-search": {
        if (matterId) {
          await fetch("/api/will-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matterId }),
          });
        } else {
          await mockGeneratePacket();
        }
        setActionNote("Packet ready — check your downloads for the PDF.");
        break;
      }
      case "notary": {
        const res = await mockBookNotary();
        setActionNote(`Appointment ID ${res.confirmation} confirmed.`);
        break;
      }
      case "print-pack": {
        if (matterId) {
          await fetch("/api/pack", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matterId }),
          });
        } else {
          const res = await mockCreatePack();
          setActionNote(`Pack created with ${res.pages} pages.`);
        }
        break;
      }
      case "mail-track": {
        await mockMarkComplete();
        setActionNote("Logged courier tracking number.");
        break;
      }
      case "defects": {
        await mockMarkComplete();
        setActionNote("Defect workflow marked as resolved.");
        break;
      }
      default:
        break;
    }
    toast({ title: currentSection.completionText, intent: "success" });
    setCompletion((prev) => ({ ...prev, [currentSection.key]: true }));
  };

  const canGoNext = completion[currentSection.key];

  const goBack = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };
  const showingFinal = atFinalScreen;

  if (showingFinal) {
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-[#e2e8f0] bg-white p-10 shadow-[0_45px_120px_-80px_rgba(15,23,42,0.4)]">
        <Confetti />
        <div className="relative space-y-6 text-center">
          <h1 className="font-serif text-4xl text-[#0f172a]">All set!</h1>
          <p className="text-base text-[#495067]">
            Your assemble & file checklist is complete. Keep tracking courier updates and wait for the grant. Need to revisit anything?
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link href="/portal">Return to dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/start">Open intake wizard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0c3b6c]">Assemble & file</p>
        <h1 className="font-serif text-4xl text-[#0f172a] sm:text-5xl">Step-by-step tutorial</h1>
        <p className="max-w-3xl text-base text-[#495067]">
          Follow each section, trigger the action button, and then move forward. Everything stays on this device — no uploads leave your
          browser.
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
          <div className="h-full rounded-full bg-[#ff6a00]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ScrollFade as="section" className="grid gap-8 rounded-[32px] border border-[#e2e8f0] bg-white p-8 shadow-[0_45px_120px_-80px_rgba(15,23,42,0.4)] lg:grid-cols-[0.55fr_0.45fr]">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-[#94a3b8]">Step {currentIndex + 1}</p>
            <h2 className="font-serif text-3xl text-[#0f172a]">{currentSection.title}</h2>
            <p className="text-base text-[#495067]">{currentSection.body}</p>
          </div>
          <div className="space-y-3 text-sm text-[#0f172a]">
            <p>
              Action status: {completion[currentSection.key] ? currentSection.completionText : "Not completed"}
            </p>
            {actionNote ? <p className="rounded-2xl bg-[#f7f8fa] px-4 py-3 text-[#0c3b6c]">{actionNote}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#ff6a00] text-white hover:bg-[#e45f00]" onClick={handleAction}>
              {currentSection.actionLabel}
            </Button>
            <Button variant="ghost" onClick={() => setCompletion((prev) => ({ ...prev, [currentSection.key]: true }))}>
              Mark step complete
            </Button>
          </div>
        </div>
        <div className="relative h-80 overflow-hidden rounded-3xl border border-[#e2e8f0]">
          <Image src={currentSection.image} alt={currentSection.title} fill className="object-cover" />
        </div>
      </ScrollFade>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" disabled={currentIndex === 0} onClick={goBack}>
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm">
          {SECTIONS.map((section, idx) => (
            <span
              key={section.key}
              className={
                idx === currentIndex
                  ? "h-2 w-6 rounded-full bg-[#ff6a00]"
                  : completion[section.key]
                    ? "h-2 w-2 rounded-full bg-[#0c3b6c]"
                    : "h-2 w-2 rounded-full bg-[#d7ddec]"
              }
            />
          ))}
        </div>
        <Button
          onClick={() => (canGoNext ? setCurrentIndex((prev) => Math.min(prev + 1, SECTIONS.length)) : undefined)}
          disabled={!canGoNext}
        >
          {currentIndex === SECTIONS.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
