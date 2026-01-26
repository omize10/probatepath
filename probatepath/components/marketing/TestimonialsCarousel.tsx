"use client";

import { useMemo, useState } from "react";
import { Pause } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials";
import { testimonials as defaultTestimonials } from "@/lib/testimonials";
import { cn } from "@/lib/utils";
import { TestimonialCard } from "./TestimonialCard";

interface TestimonialsCarouselProps {
  testimonials?: Testimonial[];
  className?: string;
}

export function TestimonialsCarousel({
  testimonials = defaultTestimonials,
  className,
}: TestimonialsCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Triplicate testimonials for seamless infinite loop on wide screens
  const trackItems = useMemo(() => [...testimonials, ...testimonials, ...testimonials], [testimonials]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs text-[color:var(--slate)] shadow-sm backdrop-blur-sm">
          <Pause className="h-3 w-3" />
          Paused
        </div>
      )}

      {/* Scrolling track - CSS animation */}
      <div
        className={cn(
          "flex gap-6 py-4",
          "animate-testimonials-scroll",
          isPaused && "animate-pause"
        )}
        style={{
          width: "max-content",
        }}
        aria-label="Client testimonials"
      >
        {trackItems.map((testimonial, index) => (
          <div
            key={`${testimonial.id}-${index}`}
            className="w-[350px] shrink-0 first:ml-0"
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>

      {/* Gradient overlays for smooth edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes testimonials-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-testimonials-scroll {
          animation: testimonials-scroll 30s linear infinite;
        }

        .animate-pause {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
