"use client";

import { useEffect, useState } from "react";

type AnimatedStatusProps = {
  status: "preparing" | "processing" | "waiting" | "ready" | "complete";
  label?: string;
  sublabel?: string;
};

const STATUS_CONFIG = {
  preparing: {
    messages: ["Reviewing your intake answers...", "Assembling your documents...", "Formatting court forms..."],
    color: "var(--brand)",
    pulse: true,
  },
  processing: {
    messages: ["Checking document details...", "Verifying estate data...", "Preparing your packet..."],
    color: "var(--brand)",
    pulse: true,
  },
  waiting: {
    messages: ["Counting down your waiting period...", "No action needed right now...", "We'll notify you when ready..."],
    color: "#6366f1",
    pulse: false,
  },
  ready: {
    messages: ["Your documents are ready!"],
    color: "#16a34a",
    pulse: false,
  },
  complete: {
    messages: ["All done!"],
    color: "#16a34a",
    pulse: false,
  },
};

export function AnimatedStatus({ status, label, sublabel }: AnimatedStatusProps) {
  const config = STATUS_CONFIG[status];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (config.messages.length <= 1) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % config.messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [config.messages.length]);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--border-muted)] bg-white px-5 py-4 shadow-sm">
      {/* Animated indicator */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${config.pulse ? "animate-ping opacity-20" : ""}`}
          style={{ borderColor: config.color }}
        />
        {/* Spinning ring for active states */}
        {(status === "preparing" || status === "processing") && (
          <svg className="absolute inset-0 h-12 w-12 animate-spin" viewBox="0 0 48 48">
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeDasharray="80 40"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        )}
        {/* Countdown circle for waiting */}
        {status === "waiting" && (
          <svg className="absolute inset-0 h-12 w-12" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="2" />
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeDasharray="126"
              strokeDashoffset="30"
              strokeLinecap="round"
              className="transition-all duration-1000"
              transform="rotate(-90 24 24)"
            />
          </svg>
        )}
        {/* Center icon */}
        <div
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: config.color + "15" }}
        >
          {status === "complete" || status === "ready" ? (
            <svg className="h-4 w-4" style={{ color: config.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
          )}
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        {label && <p className="text-sm font-semibold text-gray-900">{label}</p>}
        <p className="text-xs text-gray-500 transition-opacity duration-500">
          {config.messages[messageIndex]}
        </p>
        {sublabel && <p className="text-xs text-gray-600 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}
