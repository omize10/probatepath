"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SupportWidget } from "@/components/support/SupportWidget";

export function Footer() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/ops-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Incorrect password");
        return;
      }
      setShowPrompt(false);
      setPassword("");
      router.push("/ops");
      router.refresh();
    } catch {
      setError("Unable to set access right now.");
    }
  }

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
          <div className="pt-3">
            <SupportWidget placement="inline" />
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
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-col gap-2 px-6 text-xs text-[#616977] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} ProbatePath Technologies Inc. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <p>ProbatePath provides document preparation support and general information. We do not provide legal advice; executors remain self-represented.</p>
        </div>
      </div>

      <div className="fixed bottom-3 right-3 z-50">
        <button
          type="button"
          onClick={() => setShowPrompt(true)}
          className="rounded-full border border-[color:var(--border-muted)] bg-white/80 px-3 py-1 text-xs font-medium text-[color:var(--ink-muted)] shadow-sm backdrop-blur transition hover:bg-white hover:text-[color:var(--brand)]"
        >
          Ops
        </button>
      </div>

      {showPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[color:var(--ink)]">Ops access</h3>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Enter the ops password to continue.</p>
            <form className="mt-4 space-y-3" onSubmit={submitPassword}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
                placeholder="Password"
                autoFocus
              />
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
