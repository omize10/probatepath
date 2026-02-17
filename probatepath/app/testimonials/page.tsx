import type { Metadata } from "next";
import { testimonials } from "@/lib/testimonials";
import { TestimonialsContent } from "./TestimonialsContent";
import { getPageContent } from "@/lib/page-content";
import { PuckPage } from "@/lib/puck/render-page";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Anonymised feedback from executors who used ProbateDesk to prepare BC probate documents with clear guidance and calm support.",
};

export default async function TestimonialsPage() {
  const puckData = await getPageContent("testimonials");
  if (puckData) return <PuckPage data={puckData} />;

  return (
    <div className="space-y-14 pb-20 sm:space-y-16">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Testimonials</p>
        <div className="space-y-3">
          <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Testimonials</h1>
          <p className="max-w-3xl text-lg text-[color:var(--muted-ink)]">
            What past clients say about working with us. These are anonymised examples that reflect common experiences and do not
            replace tailored legal advice.
          </p>
          <p className="max-w-2xl text-sm text-[color:var(--muted-ink)]">
            Probate can feel opaque, so we focus on steady communication, complete document packages, and practical next steps. Here&apos;s
            how executors describe that support.
          </p>
        </div>
      </section>

      <TestimonialsContent testimonials={testimonials} />
    </div>
  );
}
