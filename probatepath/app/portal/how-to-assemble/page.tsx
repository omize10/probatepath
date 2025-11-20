'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GripVertical, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { assembleSections, portalDocuments, printOrder } from "@/lib/portal/mock";
import { downloadDocHtml } from "@/lib/portal/docs";
import { setChecklistItem, usePortalStore } from "@/lib/portal/store";
import { useToast } from "@/components/ui/toast";

export default function HowToAssemblePage() {
  const { toast } = useToast();
  const completed = usePortalStore((state) => state.checklist.assemble?.completed ?? false);
  const [celebrate, setCelebrate] = useState(false);

  const printOrderWithDocs = useMemo(() => {
    return printOrder.map((row) => ({
      ...row,
      doc: portalDocuments.find((doc) => doc.id === row.id),
    }));
  }, []);

  const handleMarkComplete = () => {
    setChecklistItem("assemble", { completed: true });
    toast({ title: "Marked assemble complete", intent: "success" });
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 3200);
  };

  return (
    <PortalShell
      title="Assemble & file"
      description="Follow these sections to move from PDFs to a fully stacked, filing-ready package."
    >
      <div className="space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="portal-card space-y-6 p-6"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">1. Print in this exact order</p>
          <div className="space-y-4">
            {printOrderWithDocs.map((row, index) => (
              <div key={row.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 shadow-sm">
                <GripVertical className="h-5 w-5 text-[color:var(--ink-muted)]" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-[color:var(--ink)]">{index + 1}. {row.title}</p>
                  <p className="text-xs text-[color:var(--ink-muted)]">{row.note}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!row.doc}
                  onClick={() => row.doc && downloadDocHtml(`${row.title}.html`, row.doc.html)}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </motion.section>

        {assembleSections.map((section, index) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="portal-card grid gap-8 p-6 lg:grid-cols-[0.55fr_0.45fr]"
          >
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{index + 2}. {section.title}</p>
              <p className="text-2xl font-serif text-[color:var(--ink)]">{section.title}</p>
              <p className="text-sm text-[color:var(--ink-muted)]">{section.description}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[color:var(--ink)] sm:grid-cols-2">
                {section.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--brand-orange)]" aria-hidden="true" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--border-muted)] bg-white">
              <Image src={section.image} alt={section.title} width={960} height={720} className="h-full w-full object-cover" />
            </div>
          </motion.section>
        ))}

        <div className="relative overflow-hidden rounded-[40px] border border-white/20 bg-gradient-to-r from-[#ff7a18] to-[#ffb347] p-6 text-[#1b0c02]">
          {celebrate ? <Confetti /> : null}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em]">Finalise assemble step</p>
              <p className="text-3xl font-serif">Ready to mark this complete?</p>
              <p className="text-sm text-[#4b2b13]">This updates the rolling checklist and unlocks filing checklist downloads.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleMarkComplete} disabled={completed}>
                {completed ? "Already marked" : "Mark assemble complete"}
              </Button>
              <Button asChild variant="secondary">
                <Link href="/portal/documents">Open documents</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {[...Array(20)].map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-2 w-2 rounded-full bg-white/80"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -80 - index * 5, x: (index - 10) * 6 }}
          transition={{ duration: 1.6, delay: index * 0.05 }}
        />
      ))}
      <Sparkles className="absolute right-4 top-4 h-6 w-6 text-[color:var(--accent)]" aria-hidden="true" />
    </div>
  );
}
