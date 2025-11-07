"use client";

import Link from "next/link";

const LINKS = {
  About: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faqs", label: "FAQs" },
  ],
  Legal: [
    { href: "/legal#terms", label: "Terms" },
    { href: "/legal#privacy", label: "Privacy" },
    { href: "/legal#disclaimer", label: "Disclaimer" },
  ],
  Links: [
    { href: "/contact", label: "Contact" },
    { href: "/start", label: "Start now" },
    { href: "/dashboard", label: "Client dashboard" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#0b1524] py-12 text-sm text-slate-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="text-base font-semibold text-white">ProbatePath</p>
          <p className="text-sm text-slate-400">
            Probate document preparation for British Columbia executors. Fixed fee, modern experience, trusted support.
          </p>
          <p className="text-sm text-slate-400">
            Email:{" "}
            <a
              href="mailto:hello@probatepath.ca"
              className="text-slate-200 underline-offset-4 hover:text-white hover:underline"
            >
              hello@probatepath.ca
            </a>
          </p>
        </div>

        <div className="grid flex-1 gap-8 sm:grid-cols-3">
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-200">{section}</p>
              <ul className="space-y-2 text-sm">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-slate-400 transition hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-col gap-2 px-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} ProbatePath Technologies Inc. All rights reserved.</p>
        <p>ProbatePath is not a law firm. We are not your lawyers; executors remain self-represented.</p>
      </div>
    </footer>
  );
}
