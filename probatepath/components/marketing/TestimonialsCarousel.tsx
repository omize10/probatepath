"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials";
import { testimonials as defaultTestimonials } from "@/lib/testimonials";
import { cn } from "@/lib/utils";
import { TestimonialCard } from "./TestimonialCard";

interface TestimonialsCarouselProps {
  testimonials?: Testimonial[];
  motionEnabled?: boolean;
  className?: string;
}

export function TestimonialsCarousel({
  testimonials = defaultTestimonials,
  motionEnabled = true,
  className,
}: TestimonialsCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const trackItems = useMemo(() => [...testimonials, ...testimonials], [testimonials]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };

    handleChange(media);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isDesktop || !motionEnabled) return;

    let lastTime: number | null = null;

    const loop = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!isHovered) {
        const pixelsPerMs = 0.05; // tuned for smooth, readable speed
        const increment = delta * pixelsPerMs;
        container.scrollLeft += increment;

        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }

      frameRef.current = window.requestAnimationFrame(loop);
    };

    frameRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isDesktop, isHovered, motionEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!motionEnabled) {
      container.scrollLeft = 0;
    }
  }, [motionEnabled]);

  const handleStep = (direction: "next" | "prev") => {
    const container = containerRef.current;
    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>("[data-testimonial-card]");
    const cardWidth = firstCard?.offsetWidth ?? 360;
    const gap = 16; // matches gap-4
    const distance = cardWidth + gap;
    const delta = direction === "next" ? distance : -distance;

    const halfWidth = container.scrollWidth / 2;
    let nextLeft = container.scrollLeft + delta;

    if (nextLeft >= halfWidth) {
      nextLeft -= halfWidth;
    } else if (nextLeft < 0) {
      nextLeft = halfWidth + nextLeft;
    }

    container.scrollTo({ left: nextLeft, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className={cn(
          "group flex gap-4 overflow-x-auto rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)]/90 p-4 shadow-[0_36px_120px_-90px_rgba(14,26,42,0.55)] md:p-6",
          "snap-x snap-mandatory md:snap-none",
          "scroll-smooth",
        )}
        aria-label="Client testimonials"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {trackItems.map((testimonial, index) => (
          <div
            key={`${testimonial.id}-${index}`}
            data-testimonial-card
            className="w-[86vw] shrink-0 snap-center md:w-[360px]"
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center justify-between px-3 md:flex">
        <button
          type="button"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-muted)] bg-white text-[color:var(--brand)] shadow-[0_18px_38px_-28px_rgba(14,26,42,0.45)] transition hover:-translate-y-0.5 hover:text-[color:var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
          aria-label="Previous testimonial"
          onClick={() => handleStep("prev")}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-muted)] bg-white text-[color:var(--brand)] shadow-[0_18px_38px_-28px_rgba(14,26,42,0.45)] transition hover:-translate-y-0.5 hover:text-[color:var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
          aria-label="Next testimonial"
          onClick={() => handleStep("next")}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
