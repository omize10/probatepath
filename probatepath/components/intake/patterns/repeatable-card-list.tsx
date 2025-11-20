'use client';

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface RepeatableCardListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  onAdd: () => void;
  addLabel?: string;
}

export function RepeatableCardList<T>({ items, renderItem, onAdd, addLabel = "Add another", emptyState }: RepeatableCardListProps<T>) {
  return (
    <div className="space-y-4">
      {items.length === 0 && emptyState ? <div className="rounded-3xl border border-dashed border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 text-sm text-[color:var(--ink-muted)]">{emptyState}</div> : null}
      <div className="space-y-4">{items.map((item, index) => renderItem(item, index))}</div>
      <Button type="button" variant="outline" className="w-full border-dashed border-[color:var(--border-muted)] text-[color:var(--brand)] hover:border-[color:var(--brand)]" onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  );
}
