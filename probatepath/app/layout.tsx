import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth";
import { NavbarClient } from "@/components/navbar-client";
import { PasswordGate } from "@/components/password-gate";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://probatedesk.ca"),
  title: {
    default: "ProbateDesk — BC probate documents in hours",
    template: "%s | ProbateDesk",
  },
  description:
    "ProbateDesk prepares filing-ready probate documents for British Columbia executors starting at $799 CAD, with flexible service tiers.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await auth();
  return (
    <html lang="en" className="bg-[color:var(--bg-page)] text-[color:var(--ink)]">
      <body className={cn("min-h-screen bg-[color:var(--bg-page)] text-[color:var(--ink)] antialiased", inter.variable, dmSerif.variable)}>
        <PasswordGate>
          <Providers session={session}>
            <div className="relative flex min-h-screen flex-col">
              <NavbarClient />
              <main
                id="main-content"
                className="relative mx-auto w-full max-w-6xl flex-1 px-6 pb-24 pt-24 sm:px-10"
              >
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </PasswordGate>
      </body>
    </html>
  );
}
