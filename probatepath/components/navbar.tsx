"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/start", label: "Start" },
  { href: "/faqs", label: "FAQs" },
  { href: "/legal", label: "Legal" },
  { href: "/contact", label: "Contact" },
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
  const pathname = usePathname();
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent bg-transparent transition-colors duration-300",
        scrolled ? "border-[#e2e8f0] bg-white/90 shadow-sm backdrop-blur" : "backdrop-blur-0"
      )}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-[#1e3a8a] transition hover:text-[#ff6a00]"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
            PP
          </span>
          ProbatePath
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#1e3a8a]",
                  isActive && "bg-[#eef1f9] text-[#1e3a8a]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="outline" size="sm" className="border-[#e2e8f0] text-[#1e3a8a]">
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#ff6a00] text-white hover:bg-[#e45f00]">
            <Link href="/start">Start now</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-[#e2e8f0] bg-white/80 p-2 text-slate-600 transition hover:border-[#1e3a8a] hover:text-[#1e3a8a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-white">
            <SheetHeader className="flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold text-[#1e3a8a]">
                ProbatePath
              </Link>
              <SheetClose asChild>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-500 transition hover:text-[#1e3a8a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a]"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </SheetHeader>

            <div className="mt-6 space-y-3">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <SheetClose asChild key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "block rounded-2xl border border-transparent px-4 py-3 text-base font-medium text-slate-600 transition hover:border-slate-200 hover:text-[#1e3a8a]",
                        isActive && "border-[#1e3a8a]/30 bg-[#eef1f9] text-[#1e3a8a]"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            <div className="mt-8 space-y-3 border-t border-slate-200 pt-6">
              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center border border-slate-200 text-[#1e3a8a]"
                >
                  <Link href="/signin">Sign in</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full justify-center bg-[#ff6a00] text-white hover:bg-[#e45f00]">
                  <Link href="/start">Start now</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
