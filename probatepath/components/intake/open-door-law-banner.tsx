'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OpenDoorLawBanner() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Need legal counsel?</p>
          <p className="mt-1 text-base text-[color:var(--ink)]">Feeling stuck or overwhelmed? We can arrange a callback with a lawyer anytime.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="border-[color:var(--brand)] text-[color:var(--brand)]" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Hide callback form" : "Request a callback"}
          </Button>
        </div>
      </div>
      {showForm ? (
        <form className="mt-4 grid gap-3 md:grid-cols-3">
          <Input placeholder="Full name" />
          <Input placeholder="Phone number" type="tel" />
          <Input placeholder="Best time to call" />
        </form>
      ) : null}
    </section>
  );
}
