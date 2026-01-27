'use client';

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function WillChatWidget({ extractionId, currentStep }: { extractionId: string; currentStep: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I've read your will and suggested some answers. You can ask me questions about your will or the probate process.\n\n⚠️ This is general information only, not legal advice.",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/will-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, extractionId, currentStep }),
      });
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      const payload = (await res.json()) as { response?: string };
      setMessages((prev) => [...prev, { role: "assistant", content: payload.response ?? "No response available." }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again or ask a simpler question." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-[color:var(--ink)]">Will &amp; Probate Helper</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`max-w-[90%] rounded-lg p-3 text-sm ${
              message.role === "assistant" ? "bg-blue-50 text-[color:var(--ink)]" : "ml-auto bg-gray-100 text-[color:var(--ink)]"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {loading ? <div className="text-sm text-slate-700">Thinking...</div> : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-600">AI can answer general BC probate questions. Not legal advice.</p>
      </div>
    </div>
  );
}
