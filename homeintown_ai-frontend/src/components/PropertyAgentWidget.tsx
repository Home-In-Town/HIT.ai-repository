"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "agent";
  text: string;
}

interface HistoryTurn {
  role: "user" | "model";
  parts: [{ text: string }];
}

interface PropertyAgentWidgetProps {
  slug: string;
  propertyName?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function PropertyAgentWidget({
  slug,
  propertyName,
}: PropertyAgentWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: `Hi! I'm the AI agent for ${propertyName || "this property"}. Ask me anything — price, amenities, location, availability! 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/property-agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, message: text, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages((prev) => [...prev, { role: "agent", text: data.reply }]);
      setHistory(data.history);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "AI agent is temporarily unavailable.";
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: `Sorry, I'm having trouble right now. Please call us directly. 📞` },
      ]);
      console.error("PropertyAgentWidget error:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick question suggestions
  const suggestions = [
    "What's the price?",
    "What amenities are available?",
    "Is loan available?",
    "Book a site visit",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI Agent" : "Chat with AI Agent"}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 text-sm font-medium"
      >
        {isOpen ? (
          <>
            <span className="text-base leading-none">✕</span>
            <span>Close</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none">🤖</span>
            <span>Ask AI Agent</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Property Agent Chat"
          className="fixed bottom-20 right-6 z-50 w-[350px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-green-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                AI Property Agent
              </p>
              <p className="text-green-100 text-xs">
                {propertyName || "HomeInTown.ai"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
              <span className="text-green-100 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-green-700 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions — shown only before any user message */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-2 flex-wrap border-t border-gray-100 bg-white flex-shrink-0">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-green-600 text-green-700 hover:bg-green-50 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about price, amenities..."
              maxLength={500}
              disabled={loading}
              aria-label="Type your message"
              className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:opacity-50 bg-gray-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-full bg-green-700 hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
