import type { Testimonial } from "@/lib/testimonials";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const { highlight, quote, name, roleOrLocation } = testimonial;

  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl border border-[color:var(--border-muted)] bg-white/90 p-6 text-left shadow-[0_30px_80px_-70px_rgba(15,26,42,0.45)] transition hover:-translate-y-1 hover:shadow-[0_25px_70px_-65px_rgba(15,26,42,0.5)]",
        className,
      )}
      aria-label={`Testimonial from ${name}`}
    >
      <div className="space-y-4">
        {highlight ? (
          <span className="inline-flex items-center rounded-full bg-[#f0f3f7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)]">
            {highlight}
          </span>
        ) : null}
        <p className="text-base leading-relaxed text-[color:var(--muted-ink)]">&ldquo;{quote}&rdquo;</p>
      </div>
      <div className="mt-6 space-y-1 text-sm">
        <p className="font-semibold text-[color:var(--brand)]">{name}</p>
        <p className="text-[color:var(--slate)]">{roleOrLocation}</p>
      </div>
    </article>
  );
}
