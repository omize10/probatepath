"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";

/**
 * Delay rendering the navbar until after hydration to avoid server/client markup mismatches.
 */
export function NavbarClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <Navbar />;
}
