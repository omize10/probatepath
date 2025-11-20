'use client';

import Link from "next/link";
import { ArrowRight, Download, FileText, HelpCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { ProgressRing } from "@/components/portal/ProgressRing";
import { DraftStatusCard } from "@/components/portal/DraftStatusCard";
import { usePortalStore } from "@/lib/portal/store";
import { portalChecklistItems } from "@/lib/portal/mock";
import { downloadJson } from "@/lib/portal/docs";
import { useToast } from "@/components/ui/toast";

const quickActions = [
  {
    label: "Resume intake",
    description: "Pick up where you left off and autosave every edit.",
    href: "/portal/intake",
    icon: RefreshCcw,
  },
  {
    label: "How to assemble",
    description: "Print order, signature map, and registry tips.",
    href: "/portal/how-to-assemble",
    icon: FileText,
  },
  {
    label: "Download summary (JSON)",
    description: "Export everything stored in this browser.",
    action: "download",
    icon: Download,
  },
  {
    label: "Contact us",
    description: "hello@probatepath.ca — BC probate specialists.",
    href: "mailto:hello@probatepath.ca",
    icon: HelpCircle,
  },
];

export default function PortalDashboardPage() {
  const { toast } = useToast();
  const { draft, checklist } = usePortalStore((state) => ({ draft: state.draft, checklist: state.checklist }));
  const nextItem = portalChecklistItems.find((item) => !checklist[item.id]?.completed);

  const handleDownloadSummary = () => {
    downloadJson("probatepath-summary.json", draft);
    toast({ title: "Summary ready", description: "Check your downloads folder.", intent: "success" });
  };

  return (
    <PortalShell
      title="Welcome back—let’s finish your probate packet."
      description="Everything here runs locally. Keep this tab open while you complete intake, assemble documents, and track registry follow-ups."
      actions={
        <Button asChild>
          <Link href="/portal/intake">Resume intake</Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.5fr_0.5fr]">
        <DraftStatusCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.5fr_0.5fr]">
        <ProgressRing value={draft.progress} label="Overall progress" />
        <div className="portal-card space-y-4 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Local autosave</p>
          <p className="text-2xl font-serif text-[color:var(--ink)]">Everything stays on this device.</p>
          <p className="text-sm text-[color:var(--ink-muted)]">
            Last saved {draft.lastSaved ? new Date(draft.lastSaved).toLocaleString() : "just now"}. Use the quick export if you want a JSON backup.
          </p>
          <Button type="button" variant="secondary" onClick={handleDownloadSummary}>
            Export JSON
          </Button>
        </div>
      </div>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Quick actions</p>
            <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">Everything you need today</h2>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isDownload = action.action === "download";
            const card = (
              <div className="portal-card flex h-full flex-col p-5">
                <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--ink)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--bg-muted)] text-[color:var(--brand-navy)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {action.label}
                </div>
                <p className="mt-3 flex-1 text-sm text-[color:var(--ink-muted)]">{action.description}</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-4 justify-start px-0 text-[color:var(--brand-navy)] hover:bg-transparent hover:underline"
                  onClick={isDownload ? handleDownloadSummary : undefined}
                  asChild={Boolean(action.href)}
                >
                  {action.href ? (
                    <Link href={action.href}>
                      Go <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span>
                      Go <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </Button>
              </div>
            );

            return <div key={action.label}>{card}</div>;
          })}
        </div>
      </section>

      <section className="mt-12">
        <div className="portal-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Next step</p>
            {nextItem ? (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[color:var(--ink)]">{nextItem.title}</h3>
                <p className="text-sm text-[color:var(--ink-muted)]">{nextItem.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={nextItem.route}>Start now</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/portal/process">See the full checklist</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-serif text-2xl text-[color:var(--ink)]">Nice work — everything is marked done.</h3>
                <p className="text-sm text-[color:var(--ink-muted)]">Download your documents or keep tracking registry updates in the help area.</p>
                <Button asChild>
                  <Link href="/portal/documents">Open documents</Link>
                </Button>
              </div>
            )}
        </div>
      </section>
    </PortalShell>
  );
}
