import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://probatepath.ca"),
  title: {
    default: "ProbatePath — BC probate documents in hours",
    template: "%s | ProbatePath",
  },
  description:
    "ProbatePath prepares filing-ready probate documents for British Columbia executors with a fixed 2,500 CAD fee.",
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
    <html lang="en" className="bg-[#f7f8fa] text-[#0f172a]">
      <body
        className={cn(
          "min-h-screen bg-[#f7f8fa] text-[#0f172a] antialiased",
          inter.variable,
          dmSerif.variable,
        )}
      >
        <Providers session={session}>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main
              id="main-content"
              className="relative mx-auto w-full max-w-6xl flex-1 px-6 pb-24 pt-24 sm:px-10"
            >
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
