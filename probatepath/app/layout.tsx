import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { ToastProvider } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="bg-[#0b0b0f] text-slate-100">
      <body
        className={cn(
          "min-h-screen bg-[#0b0b0f] text-slate-100 antialiased",
          inter.variable,
          dmSerif.variable,
        )}
      >
        <ToastProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-[radial-gradient(circle_at_top,_rgba(255,106,0,0.38),_transparent_60%)]" />
            <Navbar />
            <main
              id="main-content"
              className="relative mx-auto w-full max-w-6xl flex-1 px-6 pb-24 pt-24 sm:px-10"
            >
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
