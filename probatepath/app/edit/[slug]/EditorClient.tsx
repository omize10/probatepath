"use client";

import { useState, useCallback } from "react";
import { Puck } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { puckConfig } from "@/lib/puck/config";

export function EditorClient({ slug, initialData }: { slug: string; initialData: Data }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handlePublish = useCallback(async (data: Data) => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/editor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, data }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("Published! Changes saved to database" + (result.committed ? " and committed to GitHub." : "."));
      } else {
        setMessage(`Error: ${result.error || "Failed to save"}`);
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 5000);
    }
  }, [slug]);

  return (
    <div className="relative">
      {/* Status bar */}
      {(saving || message) && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center bg-black/90 px-4 py-2 text-sm text-white">
          {saving ? "Publishing..." : message}
        </div>
      )}

      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
      />
    </div>
  );
}
