import type { ReactNode } from "react";

import "./globals.css";
import { Navbar } from "./components/navbar";

export const metadata = {
  title: "ProbatePath – BC Probate Automation",
  description: "BC probate documents in hours, not weeks.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <Navbar />
        <main className="px-6 py-10 max-w-3xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

