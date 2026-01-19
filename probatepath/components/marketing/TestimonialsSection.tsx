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
        "relative overflow-hidden rounded-[32px] border border-[color:var(--border-muted)] bg-gradient-to-b from-white via-white to-[#f5f7fb]",
        "p-8 shadow-[0_42px_120px_-80px_rgba(14,26,42,0.35)] sm:p-12",
        className,
      )}
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <div className="space-y-3">
          <h2
            id="testimonials-heading"
            className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl"
          >
            What past BC executors say
          </h2>
          <p className="text-base leading-relaxed text-[color:var(--muted-ink)]">
            These are typical comments from people who used Probate Desk to go from “I have no idea how probate works”
            to having a complete court filing ready to review. Names and details are anonymized. This feedback is
            general information only and is not legal advice.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <TestimonialsCarousel testimonials={testimonials} motionEnabled />

        <p className="text-center text-xs text-[color:var(--slate)]">
          Probate Desk is not a law firm. We do not give legal advice. If you are unsure about your situation, you should speak with a BC lawyer.
        </p>
      </div>
    </section>
  );
}
