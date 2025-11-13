'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { IntakeDraft } from "@/lib/intake/types";
import { saveDraft } from "@/lib/intake/persist";
import { setClientKey, setMatterId } from "@/lib/intake/session";

export function ResumeHydrator({
  draft,
  matterId,
  clientKey,
}: {
  draft: IntakeDraft;
  matterId: string;
  clientKey: string;
}) {
  const router = useRouter();
  useEffect(() => {
    saveDraft(draft);
    setMatterId(matterId);
    if (clientKey) {
      setClientKey(clientKey);
    }
    router.replace("/start/step-2");
  }, [draft, matterId, clientKey, router]);

  return null;
}
