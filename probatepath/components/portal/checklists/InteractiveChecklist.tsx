"use client";

import { useState, useEffect } from "react";

type ChecklistItem = {
  id: string;
  label: string;
  description?: string;
  critical?: boolean;
};

type InteractiveChecklistProps = {
  title: string;
  description?: string;
  items: ChecklistItem[];
  storageKey: string;
  onAllChecked?: () => void;
};

export function InteractiveChecklist({
  title,
  description,
  items,
  storageKey,
  onAllChecked,
}: InteractiveChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setChecked(new Set(JSON.parse(stored)));
      } catch { /* ignore */ }
    }
  }, [storageKey]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      if (next.size === items.length && onAllChecked) {
        onAllChecked();
      }
      return next;
    });
  };

  const allChecked = checked.size === items.length;
  const progress = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">{checked.size}/{items.length}</span>
            <div className="h-2 w-20 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[color:var(--brand)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => toggle(item.id)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
            />
            <div className="flex-1">
              <span className={`text-sm ${checked.has(item.id) ? "text-gray-500 line-through" : "text-gray-900"} ${item.critical ? "font-medium" : ""}`}>
                {item.label}
              </span>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              )}
              {item.critical && !checked.has(item.id) && (
                <span className="inline-flex mt-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                  Important
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      {allChecked && (
        <div className="px-5 py-3 bg-green-50 border-t border-green-100">
          <p className="text-sm font-medium text-green-800">All items confirmed. You're ready to proceed.</p>
        </div>
      )}
    </div>
  );
}
