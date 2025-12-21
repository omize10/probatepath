import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-8 flex items-center gap-2 text-sm text-[color:var(--muted-ink)]">
      <Link href="/" className="hover:text-[color:var(--brand)]">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[color:var(--brand)]">{item.label}</Link>
          ) : (
            <span className="text-[color:var(--brand)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
