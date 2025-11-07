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
  { href: "/start", label: "Start now" },
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
        "sticky top-0 z-50 w-full border-b border-white/10 bg-[#050713]/75 backdrop-blur-xl transition-colors duration-300",
        scrolled ? "border-white/10" : "border-transparent"
      )}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-white transition hover:text-[#ff6a00]"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6a00] text-sm font-bold text-black">
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
                  "rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white",
                  isActive && "bg-white/10 text-white"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm" className="border border-white/10">
            <Link href="/contact">Contact</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/start">Start now</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-white/10 p-2 text-slate-200 transition hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a00] md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-[#050713]">
            <SheetHeader className="flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold text-white">
                ProbatePath
              </Link>
              <SheetClose asChild>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a00]"
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
                        "block rounded-2xl border border-transparent px-4 py-3 text-base font-medium text-slate-200 transition hover:border-white/10 hover:text-white",
                        isActive && "border-white/15 bg-white/5 text-white"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
              <SheetClose asChild>
                <Button asChild variant="ghost" className="w-full justify-center border border-white/10">
                  <Link href="/contact">Contact</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full justify-center">
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
