"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-start leading-none", className)}>
      <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--brand)' }}>
        ProbateDesk<span className="text-[#445266]">.com</span>
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#445266]">
        Done
      </span>
    </div>
  );
}

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing Tiers" },
  { href: "/info", label: "About probate" },
  { href: "/faqs", label: "FAQs" },
  { href: "/legal", label: "Legal" },
  { href: "/contact", label: "Contact" },
  { href: "/portal", label: "My Desk" },
];

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > threshold);
    };

    handler();

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return scrolled;
}

export function Navbar() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user);
  const pathname = usePathname();
  const scrolled = useScrolled();
  const portalHref = isAuthed ? "/portal" : `/login?next=${encodeURIComponent("/portal")}`;
  const actionLabel = isAuthed ? "My Desk" : "Sign in";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur",
        scrolled
          ? "border-[color:var(--border-muted)] bg-[rgba(250,248,245,0.96)] shadow-[0_10px_30px_-25px_rgba(15,26,42,0.35)]"
          : "border-transparent bg-[rgba(250,248,245,0.9)]",
      )}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center transition hover:opacity-90" aria-label="ProbateDesk home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => {
            const targetHref = label === "My Desk" ? portalHref : href;
            const isActive = pathname === href || (pathname ?? "").startsWith(href);
            return (
              <Link
                key={href}
                href={targetHref}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-[#0a0d12] transition-colors hover:text-[#0a0d12]",
                  isActive && "bg-[#f0f3f7] text-[#0a0d12]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <button
              type="button"
              className="text-sm font-medium text-[#445266] hover:text-[color:var(--brand)]"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </button>
          ) : null}
          <Button asChild size="sm">
            <Link href={portalHref}>{actionLabel}</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-[color:var(--border-muted)] bg-[rgba(255,255,255,0.9)] p-2 text-[#445266] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)] md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-[color:var(--bg-surface)]">
            <SheetHeader className="flex items-center justify-between">
              <Link href="/" className="flex items-center" aria-label="ProbateDesk home">
                <Logo />
              </Link>
              <SheetClose asChild>
                <button
                  type="button"
                  className="rounded-full p-2 text-[#445266] transition hover:text-[color:var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </SheetHeader>

            <div className="mt-6 space-y-3">
              {NAV_LINKS.map(({ href, label }) => {
                const targetHref = label === "My Desk" ? portalHref : href;
                const isActive = pathname === href || (pathname ?? "").startsWith(href);
                return (
                  <SheetClose asChild key={href}>
                    <Link
                      href={targetHref}
                      className={cn(
                        "block rounded-2xl border border-transparent px-4 py-3 text-base font-medium text-[#0a0d12] transition hover:border-[color:var(--border-muted)] hover:text-[#0a0d12]",
                        isActive && "border-[color:var(--border-muted)] bg-[#f0f3f7] text-[#0a0d12]",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            <div className="mt-8 space-y-3 border-t border-[color:var(--border-muted)] pt-6">
              {isAuthed ? (
                <SheetClose asChild>
                  <button
                    type="button"
                    className="w-full py-2 text-sm font-medium text-[#445266] hover:text-[color:var(--brand)]"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </button>
                </SheetClose>
              ) : null}
              <SheetClose asChild>
                <Button asChild className="w-full justify-center">
                  <Link href={portalHref}>{actionLabel}</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
