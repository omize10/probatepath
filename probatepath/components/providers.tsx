'use client';

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";

function SessionRefresh() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/auth/refresh");
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);
  return null;
}

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <SessionRefresh />
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
