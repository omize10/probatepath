"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#e2e8f0] bg-[#f7f8fa] py-12 text-sm text-[#495067]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-3">
          <p className="text-base font-semibold text-[#1e3a8a]">ProbatePath</p>
          <p>BC probate document preparation with a clear fixed fee and modern intake experience.</p>
          <p>
            Email:{" "}
            <a
              href="mailto:hello@probatepath.ca"
              className="text-[#1e3a8a] underline-offset-4 hover:underline"
            >
              hello@probatepath.ca
            </a>
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1e3a8a]">Explore</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/how-it-works" className="transition hover:text-[#1e3a8a]">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="transition hover:text-[#1e3a8a]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="transition hover:text-[#1e3a8a]">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/start" className="transition hover:text-[#1e3a8a]">
                Start intake
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1e3a8a]">Legal</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/legal#terms" className="transition hover:text-[#1e3a8a]">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/legal#privacy" className="transition hover:text-[#1e3a8a]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal#disclaimer" className="transition hover:text-[#1e3a8a]">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/ops" className="transition hover:text-[#1e3a8a]">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-col gap-2 px-6 text-xs text-[#6b7287] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} ProbatePath Technologies Inc. All rights reserved.</p>
        <p>ProbatePath provides document preparation support and general information. We do not provide legal advice; executors remain self-represented.</p>
      </div>
    </footer>
  );
}
