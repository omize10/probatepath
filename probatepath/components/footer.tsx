"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--border-muted)] bg-[color:var(--bg-page)] py-12 text-sm text-[color:var(--muted-ink)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-3">
          <p className="text-base font-semibold text-[color:var(--brand)]">ProbatePath</p>
          <p>BC probate document preparation with a clear fixed fee and modern intake experience.</p>
          <p>
            Email:{" "}
            <a
              href="mailto:hello@probatepath.ca"
              className="text-[color:var(--brand)] underline-offset-4 hover:underline"
            >
              hello@probatepath.ca
            </a>
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/create-account"
              className="rounded-full border border-[color:var(--brand)] bg-[color:var(--brand)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus-visible:bg-[color:var(--accent-dark)]"
            >
              Create account
            </Link>
            <Link
              href="/portal"
              className="rounded-full border border-[color:var(--brand)] bg-[color:var(--brand)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[color:var(--brand)] focus-visible:bg-white focus-visible:text-[color:var(--brand)] active:bg-white active:text-[color:var(--brand)]"
            >
              My portal
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">Explore</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/how-it-works" className="transition hover:text-[color:var(--brand)]">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="transition hover:text-[color:var(--brand)]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="transition hover:text-[color:var(--brand)]">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/create-account" className="transition hover:text-[color:var(--brand)]">
                Start intake
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">Legal</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/legal#terms" className="transition hover:text-[color:var(--brand)]">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/legal#privacy" className="transition hover:text-[color:var(--brand)]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal#disclaimer" className="transition hover:text-[color:var(--brand)]">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/ops" className="transition hover:text-[color:var(--brand)]">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-col gap-2 px-6 text-xs text-[#616977] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} ProbatePath Technologies Inc. All rights reserved.</p>
        <p>ProbatePath provides document preparation support and general information. We do not provide legal advice; executors remain self-represented.</p>
      </div>
    </footer>
  );
}
