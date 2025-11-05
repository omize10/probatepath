"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full border-b bg-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg">
        ProbatePath
      </Link>

      <div className="flex gap-6 text-sm">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/start">Start now</Link>
        <Link href="/faqs">FAQs</Link>
        <Link href="/legal">Legal</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </nav>
  );
}
