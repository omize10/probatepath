"use client";

import { useState } from "react";
import { TestimonialCard } from "@/components/marketing/TestimonialCard";
import { TestimonialsCarousel } from "@/components/marketing/TestimonialsCarousel";
import type { Testimonial } from "@/lib/testimonials";
import { testimonials as defaultTestimonials } from "@/lib/testimonials";

interface TestimonialsContentProps {
  testimonials?: Testimonial[];
}

export function TestimonialsContent({ testimonials = defaultTestimonials }: TestimonialsContentProps) {
  const [motionEnabled, setMotionEnabled] = useState(true);
  const gridItems = testimonials.slice(0, 6);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--slate)]">What clients say</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
            Calm, detailed support when it matters most
          </h2>
          <p className="max-w-3xl text-[color:var(--muted-ink)]">
            These anonymised testimonials reflect how executors describe the guided intake, document preparation, and ongoing check-ins.
            Every estate is unique, so we focus on clarity, timelines, and steady communication.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-2xl border border-[color:var(--border-muted)] bg-white/80 px-4 py-2 shadow-[0_18px_48px_-38px_rgba(14,26,42,0.45)]">
          <div className="text-left text-sm text-[color:var(--slate)]">
            <p className="font-medium text-[color:var(--brand)]">Motion</p>
            <p className="text-[color:var(--muted-ink)]">{motionEnabled ? "Rolling carousel on" : "Motion turned off"}</p>
          </div>
          <button
            type="button"
            onClick={() => setMotionEnabled((prev) => !prev)}
            className={`
              relative flex h-10 w-16 items-center rounded-full border border-[color:var(--border-muted)] bg-white px-1
              transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]
            `}
            aria-pressed={motionEnabled}
            aria-label={motionEnabled ? "Turn off motion" : "Turn on motion"}
          >
            <span
              className={`
                inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-[color:var(--brand)]
                text-[10px] font-semibold text-white shadow-[0_12px_28px_-18px_rgba(15,26,42,0.65)]
                transition ${motionEnabled ? "translate-x-6" : "translate-x-0"}
              `}
            >
              {motionEnabled ? "On" : "Off"}
            </span>
          </button>
        </div>
      </div>

      {motionEnabled ? (
        <TestimonialsCarousel testimonials={testimonials} motionEnabled={motionEnabled} />
      ) : (
        <div className="rounded-3xl border border-dashed border-[color:var(--border-muted)] bg-white/70 px-6 py-5 text-sm text-[color:var(--muted-ink)] shadow-[0_24px_80px_-60px_rgba(14,26,42,0.35)]">
          Motion is paused. Scroll the static cards below to read through recent feedback.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--slate)]">Static view</p>
            <h3 className="font-serif text-2xl text-[color:var(--brand)]">Browse the highlights at your own pace</h3>
          </div>
          <p className="text-sm text-[color:var(--muted-ink)]">
            Six representative experiences, selected for clarity and variety.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridItems.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} className="h-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
