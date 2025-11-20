import Image from "next/image";

interface MediaCardProps {
  image: string;
  alt: string;
  caption: string;
  tips: string[];
}

export function MediaCard({ image, alt, caption, tips }: MediaCardProps) {
  return (
    <div className="portal-card space-y-4 p-4">
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border-muted)] bg-white">
        <Image src={image} alt={alt} width={640} height={420} className="h-48 w-full object-cover" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[color:var(--ink)]">{caption}</p>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--ink-muted)]">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--brand-orange)]" aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
