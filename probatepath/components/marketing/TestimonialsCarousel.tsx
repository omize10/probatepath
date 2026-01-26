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

  // Duplicate testimonials for seamless infinite loop
  const trackItems = useMemo(() => [...testimonials, ...testimonials], [testimonials]);

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
          "flex gap-6 py-4 px-6",
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
            className="w-[350px] shrink-0"
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes testimonials-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-testimonials-scroll {
          animation: testimonials-scroll 45s linear infinite;
        }

        .animate-pause {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
