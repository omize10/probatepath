"use client";

import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

interface TestimonialsSectionProps {
  className?: string;
}

export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  return (
    <section
      id="testimonials"
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-white via-white to-[#f5f7fb]",
        "py-16 sm:py-20",
        className,
      )}
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
            Testimonials
          </p>
          <h2
            id="testimonials-heading"
            className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl"
          >
            What past BC executors say
          </h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-[color:var(--muted-ink)]">
            These are typical comments from people who used ProbateDesk to go from &quot;I have no idea how probate works&quot;
            to having a complete court filing ready to review. Names and details are anonymized.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
