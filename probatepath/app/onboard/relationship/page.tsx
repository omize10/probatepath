"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState, type RelationshipType, RELATIONSHIP_LABELS } from "@/lib/onboard/state";

const RELATIONSHIPS: RelationshipType[] = [
  'parent',
  'spouse',
  'child',
  'sibling',
  'grandparent',
  'aunt',
  'uncle',
  'friend',
  'other',
];

export default function OnboardRelationshipPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<RelationshipType | null>(null);

  useEffect(() => {
    const state = getOnboardState();
    if (state.isExecutor === undefined) {
      router.push("/onboard/executor");
      return;
    }
    if (state.relationshipToDeceased) {
      setSelected(state.relationshipToDeceased);
    }
  }, [router]);

  const handleSelect = (relationship: RelationshipType) => {
    setSelected(relationship);
    saveOnboardState({ relationshipToDeceased: relationship });

    // Auto-advance after short delay
    setTimeout(() => {
      router.push("/onboard/email");
    }, 300);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          We&apos;re sorry for your loss.
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Who did you lose?
        </p>
      </div>

      <div className="grid gap-3">
        {RELATIONSHIPS.map((relationship) => (
          <button
            key={relationship}
            onClick={() => handleSelect(relationship)}
            className={`w-full h-14 text-left px-4 rounded-xl border-2 transition-all font-medium
              ${selected === relationship
                ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
                : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
              }`}
          >
            {RELATIONSHIP_LABELS[relationship]}
          </button>
        ))}
      </div>

      <Button variant="ghost" onClick={() => router.push("/onboard/executor")} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  );
}
