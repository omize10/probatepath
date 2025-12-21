import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";

type Props = { name: string; address: string; phone: string; hours: string; href: string };

export function RegistryCard({ name, address, phone, hours, href }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 transition hover:border-[color:var(--brand)]"
    >
      <h3 className="mb-4 text-lg font-semibold text-[color:var(--brand)]">{name}</h3>
      <div className="space-y-2 text-sm text-[color:var(--muted-ink)]">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--slate)]" />
          {address}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-[color:var(--slate)]" />
          {phone}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[color:var(--slate)]" />
          {hours}
        </p>
      </div>
    </Link>
  );
}
