import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = { title: string; description: string; href: string; eyebrow?: string };

export function InfoCard({ title, description, href, eyebrow }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 transition hover:border-[color:var(--brand)] hover:shadow-lg"
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
          {eyebrow}
        </p>
      )}
      <h3 className="mb-2 text-lg font-semibold text-[color:var(--brand)]">{title}</h3>
      <p className="mb-4 text-sm text-[color:var(--muted-ink)]">{description}</p>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--brand)]">
        Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
