"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Phone page has been merged into the email step.
 * Redirect for backwards compatibility.
 */
export default function OnboardPhonePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboard/email");
  }, [router]);

  return null;
}
