import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EditPageClient } from "./EditPageClient";

export const metadata: Metadata = {
  title: "Page Editor",
  robots: "noindex, nofollow",
};

const categories = [
  {
    name: "Marketing",
    pages: [
      { slug: "home", label: "Home", path: "/" },
      { slug: "pricing", label: "Pricing", path: "/pricing" },
      { slug: "how-it-works", label: "How It Works", path: "/how-it-works" },
      { slug: "get-started", label: "Get Started", path: "/get-started" },
      { slug: "faqs", label: "FAQs", path: "/faqs" },
      { slug: "contact", label: "Contact", path: "/contact" },
      { slug: "testimonials", label: "Testimonials", path: "/testimonials" },
      { slug: "legal", label: "Legal", path: "/legal" },
      { slug: "turnaround", label: "Turnaround", path: "/turnaround" },
      { slug: "call", label: "Book a Call", path: "/call" },
      { slug: "quiz", label: "Quiz", path: "/quiz" },
    ],
  },
  {
    name: "Info Center",
    pages: [
      { slug: "info", label: "Info Center Home", path: "/info" },
      { slug: "info/answers", label: "Answers Index", path: "/info/answers" },
      { slug: "info/guides", label: "Guides Index", path: "/info/guides" },
      { slug: "info/registries", label: "Registries Index", path: "/info/registries" },
    ],
  },
  {
    name: "Guides",
    pages: [
      { slug: "info/guides/bc-probate-guide", label: "BC Probate Guide", path: "/info/guides/bc-probate-guide" },
      { slug: "info/guides/what-is-probate", label: "What Is Probate", path: "/info/guides/what-is-probate" },
      { slug: "info/guides/when-do-you-need-probate", label: "When Do You Need Probate", path: "/info/guides/when-do-you-need-probate" },
      { slug: "info/guides/executor-duties", label: "Executor Duties", path: "/info/guides/executor-duties" },
      { slug: "info/guides/probate-fees-costs", label: "Probate Fees & Costs", path: "/info/guides/probate-fees-costs" },
      { slug: "info/guides/bc-probate-forms", label: "BC Probate Forms", path: "/info/guides/bc-probate-forms" },
      { slug: "info/guides/probate-without-will", label: "Probate Without a Will", path: "/info/guides/probate-without-will" },
      { slug: "info/guides/grant-types", label: "Grant Types", path: "/info/guides/grant-types" },
      { slug: "info/guides/after-the-grant", label: "After the Grant", path: "/info/guides/after-the-grant" },
      { slug: "info/guides/probate-timeline", label: "Probate Timeline", path: "/info/guides/probate-timeline" },
    ],
  },
  {
    name: "Answers",
    pages: [
      { slug: "info/answers/how-long-does-probate-take", label: "How Long Does Probate Take", path: "/info/answers/how-long-does-probate-take" },
      { slug: "info/answers/bank-accounts-before-probate", label: "Bank Accounts Before Probate", path: "/info/answers/bank-accounts-before-probate" },
      { slug: "info/answers/what-if-no-original-will", label: "What If No Original Will", path: "/info/answers/what-if-no-original-will" },
      { slug: "info/answers/probate-vs-lawyer-costs", label: "Probate vs Lawyer Costs", path: "/info/answers/probate-vs-lawyer-costs" },
      { slug: "info/answers/do-i-need-probate-for-house", label: "Do I Need Probate for a House", path: "/info/answers/do-i-need-probate-for-house" },
      { slug: "info/answers/first-30-days-executor", label: "First 30 Days as Executor", path: "/info/answers/first-30-days-executor" },
    ],
  },
  {
    name: "Registries",
    pages: [
      { slug: "info/registries/vancouver", label: "Vancouver Registry", path: "/info/registries/vancouver" },
      { slug: "info/registries/victoria", label: "Victoria Registry", path: "/info/registries/victoria" },
      { slug: "info/registries/surrey", label: "Surrey Registry", path: "/info/registries/surrey" },
      { slug: "info/registries/kelowna", label: "Kelowna Registry", path: "/info/registries/kelowna" },
    ],
  },
  {
    name: "Tools",
    pages: [
      { slug: "info/calculators/probate-fees", label: "Probate Fee Calculator", path: "/info/calculators/probate-fees" },
    ],
  },
];

export default async function EditIndexPage() {
  // Fetch all published slugs to show status indicators
  let publishedSlugs: Set<string> = new Set();
  try {
    const rows = await prisma.pageContent.findMany({ select: { slug: true } });
    publishedSlugs = new Set(rows.map((r) => r.slug));
  } catch {
    // DB unavailable — no indicators
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl text-[color:var(--brand)]">Page Editor</h1>
        <p className="text-[color:var(--muted-ink)]">
          Click any page to open the visual editor. Or add <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">?edit</code> to any page URL.
        </p>
      </div>

      {/* Free-form path input */}
      <EditPageClient />

      {/* Categorized page list */}
      {categories.map((cat) => (
        <div key={cat.name} className="space-y-3">
          <h2 className="text-lg font-semibold text-[color:var(--ink)]">{cat.name}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cat.pages.map((page) => (
              <Link
                key={page.slug}
                href={`/edit/${page.slug}`}
                className="group flex items-center gap-2 rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-3 shadow-sm transition hover:border-[color:var(--brand)] hover:shadow-md"
              >
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${
                    publishedSlugs.has(page.slug) ? "bg-green-500" : "bg-gray-300"
                  }`}
                  title={publishedSlugs.has(page.slug) ? "Published" : "Not edited"}
                />
                <span className="flex flex-col min-w-0">
                  <span className="truncate font-medium text-[color:var(--brand)] group-hover:underline">
                    {page.label}
                  </span>
                  <span className="truncate text-xs text-[color:var(--slate)]">{page.path}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
