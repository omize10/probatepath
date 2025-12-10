'use client';

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

interface AskHelperProps {
  currentStepId: string;
  extractionId?: string | null;
  nudge?: string | null;
  autoOpenKey?: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildInitialMessage(stepId: string, hasWill: boolean): string {
  let base = "I can answer general questions about BC probate and help you with this step.";
  if (stepId?.includes("executor")) {
    base = hasWill
      ? "I have read your will. Ask me about your executors or what an executor typically does in BC probate."
      : "Ask me about who can be an executor and what they typically do in BC probate.";
  } else if (stepId?.includes("beneficiar")) {
    base = hasWill
      ? "I have read your will. Ask me about your beneficiaries or what details the court needs."
      : "Ask me about beneficiary requirements and notices.";
  } else if (stepId?.includes("will")) {
    base = hasWill
      ? "I have read your will. Ask me about your will details or common issues to flag."
      : "Ask about BC will requirements and what the court looks for.";
  }
  return `${base}\n\nThis is general information only, not legal advice.`;
}

export function AskHelper({ currentStepId, extractionId: incomingExtractionId, nudge, autoOpenKey }: AskHelperProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [extractionId, setExtractionId] = useState<string | null>(incomingExtractionId ?? null);
  const [hasWill, setHasWill] = useState(Boolean(incomingExtractionId));
  const greetedRef = useRef(false);
  const [lastOpenKey, setLastOpenKey] = useState<number | null>(null);

  useEffect(() => {
    async function check() {
      if (incomingExtractionId) {
        setExtractionId(incomingExtractionId);
        setHasWill(true);
        return;
      }
      try {
        const res = await fetch("/api/will-upload/check");
        if (res.ok) {
          const data = (await res.json()) as { extractionId?: string | null; hasWill?: boolean };
          setExtractionId(data.extractionId ?? null);
          setHasWill(Boolean(data.extractionId));
        }
      } catch {
        // best-effort; keep helper available
      }
    }
    check();
  }, [incomingExtractionId]);

  useEffect(() => {
    const greeting = buildInitialMessage(currentStepId, hasWill);
    setMessages((prev) => {
      if (!prev.length || !greetedRef.current) {
        greetedRef.current = true;
        return [{ role: "assistant", content: greeting }];
      }
      return [...prev, { role: "assistant", content: greeting }];
    });
  }, [currentStepId, hasWill]);

  useEffect(() => {
    if (nudge) {
      setMessages((prev) => [...prev, { role: "assistant", content: nudge }]);
    }
  }, [nudge]);

  useEffect(() => {
    if (autoOpenKey !== undefined && autoOpenKey !== null && autoOpenKey !== lastOpenKey) {
      setOpen(true);
      setLastOpenKey(autoOpenKey);
    }
  }, [autoOpenKey, lastOpenKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/will-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, currentStep: currentStepId, extractionId }),
      });
      if (!res.ok) {
        throw new Error("Request failed");
      }
      const payload = (await res.json()) as { response?: string };
      setMessages((prev) => [...prev, { role: "assistant", content: payload.response ?? "No response available." }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const desktopPanel = (
    <div className="space-y-3 rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Need help?</p>
          <p className="font-semibold text-[color:var(--ink)]">Ask about this step</p>
          <p className="text-xs text-[color:var(--ink-muted)]">General guidance only. Always review your answers.</p>
            {hasWill ? (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
                <span>✓ Will uploaded</span>
              </div>
            ) : null}
          </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
        >
          <MessageCircle className="h-4 w-4" />
          {open ? "Hide" : "Ask"}
        </button>
      </div>
      {open ? (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          {hasWill ? (
            <div className="flex items-center gap-2 rounded-md bg-green-100 px-3 py-2 text-[11px] font-semibold text-green-800">
              <span>✓ Will uploaded. I can use it to help you.</span>
            </div>
          ) : null}
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}-${m.content.slice(0, 6)}`}
                className={`max-w-[90%] rounded-lg px-3 py-2 ${
                  m.role === "assistant" ? "bg-blue-50 text-gray-900" : "ml-auto bg-white text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-600 px-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "120ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "240ms" }} />
                </div>
                Thinking…
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about this step..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Send
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              AI can share general information only. Double-check everything against your documents.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      {desktopPanel}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 lg:hidden"
      >
        <MessageCircle className="h-4 w-4" />
        Ask
      </button>

      {open && isMobile ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-label="Close chat overlay" />
          <div className="relative w-full rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Help</p>
                <p className="text-sm font-semibold text-gray-900">Ask about this step</p>
                {hasWill ? <p className="text-xs text-green-700">✓ Will uploaded</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            <div className="flex max-h-[70vh] min-h-[60vh] flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm text-gray-900">
                {messages.map((m, idx) => (
                  <div
                    key={`${m.role}-${idx}-${m.content.slice(0, 6)}`}
                    className={`max-w-[90%] rounded-lg px-3 py-2 ${
                      m.role === "assistant" ? "bg-blue-50 text-gray-900" : "ml-auto bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
                {loading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-600 px-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "120ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "240ms" }} />
                    </div>
                    Thinking…
                  </div>
                ) : null}
                <div ref={endRef} />
              </div>
              <div className="border-t px-4 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Ask about this step..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    Send
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  AI can share general information only. Double-check everything against your documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
