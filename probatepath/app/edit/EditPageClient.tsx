"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditPageClient() {
  const [customPath, setCustomPath] = useState("");
  const router = useRouter();

  const handleGo = () => {
    const trimmed = customPath.trim().replace(/^\/+/, "");
    if (!trimmed) return;
    router.push(`/edit/${trimmed}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-3 shadow-sm">
      <span className="text-sm text-[color:var(--muted-ink)] whitespace-nowrap">Edit any path:</span>
      <input
        type="text"
        value={customPath}
        onChange={(e) => setCustomPath(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGo()}
        placeholder="e.g. info/guides/bc-probate-guide"
        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-[color:var(--brand)] focus:outline-none"
      />
      <button
        onClick={handleGo}
        className="rounded-lg bg-[color:var(--brand)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 transition"
      >
        Open Editor
      </button>
    </div>
  );
}
