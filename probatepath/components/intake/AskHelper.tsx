'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AskHelperProps {
  currentStepId: string;
  extractionId: string | null;
}

const STEP_GREETINGS: Record<string, { withWill: string; withoutWill: string }> = {
  executor: {
    withWill: "I have read your will. Ask me about your executors or what an executor typically does in BC probate.",
    withoutWill: "Ask me about who can be an executor and what they typically do in BC probate.",
  },
  beneficiary: {
    withWill: "I have read your will. Ask me about your beneficiaries or what details the court needs.",
    withoutWill: "Ask me about beneficiaries and what information the court typically requires.",
  },
  will: {
    withWill: "I have read your will and extracted key information. Ask me anything about BC probate or your will.",
    withoutWill: "Ask me about wills and BC probate requirements.",
  },
  asset: {
    withWill: "I have read your will. Ask me about estate assets and how they are handled in BC probate.",
    withoutWill: "Ask me about estate assets and how they are handled in BC probate.",
  },
  default: {
    withWill: "I have read your will. Ask me about BC probate and this step.",
    withoutWill: "I can answer general questions about BC probate and help you with this step.",
  },
};

function getGreeting(stepId: string, hasWill: boolean): string {
  const stepKey = Object.keys(STEP_GREETINGS).find((key) => stepId.includes(key)) ?? "default";
  const greeting = STEP_GREETINGS[stepKey];
  return hasWill ? greeting.withWill : greeting.withoutWill;
}

export function AskHelper({ currentStepId, extractionId: initialExtractionId }: AskHelperProps) {
  const [extractionId, setExtractionId] = useState<string | null>(initialExtractionId);
  const [hasWill, setHasWill] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingWill, setIsCheckingWill] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has uploaded a will
    const checkWill = async () => {
      try {
        const response = await fetch("/api/will-upload/check");
        if (response.ok) {
          const data = await response.json();
          setHasWill(data.hasWill);
          if (data.extractionId) {
            setExtractionId(data.extractionId);
          }
        }
      } catch (error) {
        console.error("Failed to check will:", error);
      } finally {
        setIsCheckingWill(false);
      }
    };

    checkWill();
  }, []);

  useEffect(() => {
    // Update extraction ID when prop changes
    if (initialExtractionId) {
      setExtractionId(initialExtractionId);
      setHasWill(true);
    }
  }, [initialExtractionId]);

  useEffect(() => {
    // Add initial greeting message
    if (!isCheckingWill && messages.length === 0) {
      const greeting = getGreeting(currentStepId, hasWill);
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [isCheckingWill, hasWill, currentStepId, messages.length]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/will-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          extractionId,
          currentStep: currentStepId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isCheckingWill) {
    return (
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-6">
        <p className="text-sm text-[color:var(--ink-muted)]">Loading helper...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-[color:var(--border-muted)] bg-white">
      {hasWill && (
        <div className="flex items-center gap-2 border-b border-green-200 bg-green-50 px-4 py-2 rounded-t-3xl">
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-semibold text-green-700">Will uploaded. I can use it to help you.</p>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "border border-[color:var(--border-muted)] bg-gray-50 text-[color:var(--ink)]"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-gray-50 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[color:var(--border-muted)] p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-[color:var(--border-muted)] bg-white px-4 py-2 text-sm text-[color:var(--ink)] placeholder-[color:var(--ink-muted)] focus:border-blue-500 focus:outline-none"
          />
          <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading} size="sm">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
