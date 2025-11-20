'use client';

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PortalShell } from "@/components/portal/PortalShell";
import { ChecklistItem } from "@/components/portal/ChecklistItem";
import { portalChecklistItems } from "@/lib/portal/mock";
import { setChecklistItem, updateChecklistMeta, usePortalStore } from "@/lib/portal/store";
import { useToast } from "@/components/ui/toast";

type ChecklistId = (typeof portalChecklistItems)[number]["id"];

export default function MyProcessPage() {
  const { toast } = useToast();
  const checklist = usePortalStore((state) => state.checklist);
  const [openId, setOpenId] = useState<ChecklistId | "">(portalChecklistItems[0].id);

  const handleToggleComplete = (id: ChecklistId) => {
    const next = setChecklistItem(id, { completed: !checklist[id]?.completed });
    toast({
      title: next.completed ? "Marked done" : "Marked in progress",
      description: portalChecklistItems.find((item) => item.id === id)?.title,
      intent: "success",
    });
  };

  return (
    <PortalShell
      title="Rolling checklist"
      description="Track every probate milestone. Expand an item to record dates, add notes, or jump to the right resource."
    >
      <div className="space-y-4">
        {portalChecklistItems.map((item) => {
          const entry = checklist[item.id];
          const open = openId === item.id;
          return (
            <div key={item.id} className="portal-card">
              <button
                type="button"
                onClick={() => setOpenId((current) => (current === item.id ? "" : item.id))}
                className="flex w-full items-center justify-between gap-4 px-2 py-2 text-left"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{entry?.completed ? "Done" : "Next"}</p>
                  <p className="mt-1 font-serif text-xl text-[color:var(--ink)]">{item.title}</p>
                  <p className="text-sm text-[color:var(--ink-muted)]">{item.description}</p>
                </div>
                <span className="text-sm font-semibold text-[color:var(--brand-orange)]">{open ? "Hide" : "Open"}</span>
              </button>
              {open ? (
                <div className="border-t border-[color:var(--border-muted)] p-6">
                  <ChecklistItem
                    title={item.title}
                    description={item.description}
                    learnMoreHref={item.learnMoreHref}
                    media={item.media}
                    completed={entry?.completed}
                    actions={
                      <>
                        <Button asChild variant="secondary">
                          <Link href={item.route}>Go to step</Link>
                        </Button>
                        <Button type="button" onClick={() => handleToggleComplete(item.id)}>
                          {entry?.completed ? "Undo" : "Mark done"}
                        </Button>
                      </>
                    }
                  >
                    {item.id === "will-search" ? (
                      <div className="text-sm text-[color:var(--ink-muted)]">
                        <p>Generate the request packet inside Documents, print, and add executor ID photocopies. Drop at Service BC or courier.</p>
                      </div>
                    ) : null}

                    {item.id === "notices" ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="notices-date" className="text-[color:var(--ink)]">
                            Date mailed
                          </Label>
                          <Input
                            id="notices-date"
                            type="date"
                            value={entry?.meta?.date ?? ""}
                            onChange={(event) => updateChecklistMeta("notices", { date: event.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notices-count" className="text-[color:var(--ink)]">
                            Number sent
                          </Label>
                          <Input
                            id="notices-count"
                            type="number"
                            min="0"
                            value={entry?.meta?.count ?? ""}
                            onChange={(event) => updateChecklistMeta("notices", { count: event.target.value })}
                          />
                        </div>
                      </div>
                    ) : null}

                    {item.id === "assemble" ? (
                      <p className="text-sm text-[color:var(--ink-muted)]">Use the How to Assemble guide for print order, signature tabs, and attachments. Mark this complete only when everything is stacked.</p>
                    ) : null}

                    {item.id === "commission" ? (
                      <p className="text-sm text-[color:var(--ink-muted)]">Bring original ID and the entire packet to the commissioner. Keep receipts for the filing fee.</p>
                    ) : null}

                    {item.id === "court-tracking" ? (
                      <div className="space-y-2">
                        <Label htmlFor="court-notes" className="text-[color:var(--ink)]">
                          Registry notes
                        </Label>
                        <Textarea
                          id="court-notes"
                          value={entry?.meta?.notes ?? ""}
                          onChange={(event) => updateChecklistMeta("court-tracking", { notes: event.target.value })}
                          rows={4}
                        />
                      </div>
                    ) : null}
                  </ChecklistItem>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
