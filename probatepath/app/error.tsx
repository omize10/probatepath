"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log to console for dev; Sentry or other provider can be added later
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-serif">Something went wrong</h1>
        <p className="mt-4 text-sm text-gray-600">An unexpected error occurred. You can try again or return home.</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded bg-[#111827] px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
          <a href="/" className="text-sm underline">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
