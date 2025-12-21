"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TOCItem = { id: string; title: string; level: number };

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
        On this page
      </p>
      <ul className="space-y-1 border-l border-[color:var(--border-muted)]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block border-l-2 py-1 pl-4 text-sm transition-colors",
                item.level === 3 && "pl-8",
                activeId === item.id
                  ? "border-[color:var(--brand)] text-[color:var(--brand)] font-medium"
                  : "border-transparent text-[color:var(--muted-ink)] hover:text-[color:var(--brand)]"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
