import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { TableOfContents } from "./TableOfContents";

type TOCItem = { id: string; title: string; level: number };
type BreadcrumbItem = { label: string; href?: string };

type Props = {
  breadcrumbs: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description: string;
  lastUpdated?: string;
  readingTime?: string;
  toc?: TOCItem[];
  children: ReactNode;
};

export function InfoPageLayout({
  breadcrumbs, eyebrow, title, description, lastUpdated, readingTime, toc, children
}: Props) {
  return (
    <div className="pb-16">
      <Breadcrumbs items={breadcrumbs} />
      
      <header className="mb-12 space-y-4">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">{title}</h1>
        <p className="max-w-3xl text-lg text-[color:var(--muted-ink)]">{description}</p>
        {(lastUpdated || readingTime) && (
          <div className="flex flex-wrap gap-4 text-sm text-[color:var(--slate)]">
            {lastUpdated && <span>Updated {lastUpdated}</span>}
            {readingTime && <span>{readingTime} read</span>}
          </div>
        )}
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
        <article className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[color:var(--brand)] prose-p:text-[color:var(--muted-ink)] prose-a:text-[color:var(--brand)] prose-strong:text-[color:var(--brand)]">
          {children}
        </article>

        {toc && toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <TableOfContents items={toc} />
              <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-5">
                <p className="mb-3 text-sm font-semibold text-[color:var(--brand)]">
                  Need help with probate?
                </p>
                <p className="mb-4 text-sm text-[color:var(--muted-ink)]">
                  ProbateDesk guides you step by step starting at $799.
                </p>
                <Link
                  href="/create-account"
                  className="block w-full rounded-full bg-[color:var(--brand)] py-2 text-center text-sm font-semibold text-white hover:bg-[color:var(--accent-dark)]"
                >
                  Start intake
                </Link>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
