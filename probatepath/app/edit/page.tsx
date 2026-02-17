import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Editor",
  robots: "noindex, nofollow",
};

const pages = [
  { slug: "home", label: "Home", path: "/" },
  { slug: "pricing", label: "Pricing", path: "/pricing" },
  { slug: "faqs", label: "FAQs", path: "/faqs" },
  { slug: "how-it-works", label: "How It Works", path: "/how-it-works" },
  { slug: "get-started", label: "Get Started", path: "/get-started" },
  { slug: "contact", label: "Contact", path: "/contact" },
  { slug: "testimonials", label: "Testimonials", path: "/testimonials" },
  { slug: "legal", label: "Legal", path: "/legal" },
  { slug: "info", label: "Info Center", path: "/info" },
];

export default function EditIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl text-[color:var(--brand)]">Page Editor</h1>
        <p className="text-[color:var(--muted-ink)]">
          Click a page to open the visual editor. Drag sections, click text to edit, then hit Publish.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/edit/${page.slug}`}
            className="group flex flex-col rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5 shadow-sm transition hover:border-[color:var(--brand)] hover:shadow-md"
          >
            <span className="font-semibold text-[color:var(--brand)] group-hover:underline">{page.label}</span>
            <span className="mt-1 text-sm text-[color:var(--slate)]">{page.path}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
