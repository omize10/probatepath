/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { RegistryCard } from "@/components/info/RegistryCard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "BC Probate Registries | Locations and Filing Guides",
  description: "Addresses, phone numbers, hours, and filing tips for BC probate registries including Vancouver, Victoria, Surrey, and Kelowna.",
};

const registries = [
  { name: "Vancouver", address: "800 Smithe St", phone: "604-660-2853", hours: "Mon-Fri 9-4", href: "/info/registries/vancouver" },
  { name: "Victoria", address: "850 Burdett Ave", phone: "250-356-1478", hours: "Mon-Fri 9-4", href: "/info/registries/victoria" },
  { name: "Surrey", address: "14340 57 Ave", phone: "604-572-2200", hours: "Mon-Fri 9-4", href: "/info/registries/surrey" },
  { name: "Kelowna", address: "1355 Water St", phone: "250-470-6900", hours: "Mon-Fri 9-4", href: "/info/registries/kelowna" },
];

export default function RegistriesPage() {
  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <Badge variant="outline">Registries</Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">BC Probate Registries</h1>
        <p className="max-w-3xl text-lg text-[color:var(--muted-ink)]">
          Find the probate registry closest to where the deceased lived. Each guide covers what to bring, filing steps, and parking tips.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {registries.map((registry) => (
          <RegistryCard key={registry.href} {...registry} />
        ))}
      </div>

      <p className="text-[color:var(--muted-ink)]">
        Need a refresher on the full process? Read the <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">Complete BC Probate Guide</Link>.
      </p>
    </div>
  );
}
