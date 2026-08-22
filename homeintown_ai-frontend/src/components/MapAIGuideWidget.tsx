"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useVoice } from "@/hooks/useVoice";

interface Message {
  role: "user" | "agent";
  text: string;
}

interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

interface MapProperty {
  projectName?: string;
  builderName?: string;
  city?: string;
  location?: string;
  projectStatus?: string;
  category?: string;
  propertyType?: string;
  slug?: string;
  pricing?: {
    startingPrice?: number;
    pricePerSqFt?: number;
  };
  configuration?: {
    bhkOptions?: string[];
  };
  amenities?: string[];
  reraApproved?: boolean;
  cta?: {
    callNumber?: string;
    whatsappNumber?: string;
  };
}

interface MapAIGuideWidgetProps {
  properties: MapProperty[];
  isOpen: boolean;
  onClose: () => void;
}

const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://property-ai-agent-624770114041.asia-south1.run.app";

export default function MapAIGuideWidget({
  properties,
  isOpen,
  onClose,
}: MapAIGuideWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: `Hi! I'm your AI property guide. I can see ${properties.length} properties on your map right now. What are you looking for — budget, BHK, area? Ask me anything! 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update greeting when properties count changes
  useEffect(() => {
    setMessages([
      {
        role: "agent",
        text: `Hi! I'm your AI property guide. I can see ${properties.length} properties on your map right now. What are you looking for — budget, BHK, area? Ask me anything! 😊`,
      },
    ]);
    setHistory([]);
  }, [properties.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const sendMessage = async (voiceText?: string) => {
    const text = (voiceText || input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${AI_AGENT_URL}/api/property-agent/map-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties, message: text, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages((prev) => [...prev, { role: "agent", text: data.reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() }]);
      setHistory(data.history);

      // Speak the reply aloud if voice mode is active
      if (voiceText) {
        speak(data.reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim());
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "AI unavailable";
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Sorry, I'm having trouble right now. Please try again in a moment." },
      ]);
      console.error("MapAIGuide error:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Voice hook
  const handleVoiceResult = useCallback((transcript: string) => {
    setInput(transcript);
    sendMessage(transcript);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, history]);

  const { isListening, isSpeaking, isSupported, startListening, stopListening, speak, stopSpeaking } = useVoice({
    lang: "hi-IN",
    onResult: handleVoiceResult,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "What properties are available?",
    "Show me under 50 lakh",
    "Any 3BHK options?",
    "Compare top 2 cheapest",
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="AI Map Guide"
      className="absolute bottom-16 left-4 z-50 w-[370px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      style={{ height: "500px" }}
    >
      {/* Header */}
      <div className="bg-black px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
          🎧
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm leading-tight">
            24/7 AI Guide
          </p>
          <p className="text-gray-300 text-xs">
            {properties.length} properties on map
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI Guide"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition"
        >
          ✕
        </button>
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
                  ? "bg-black text-white rounded-tr-sm"
                  : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

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

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-3 py-2 flex gap-2 flex-wrap border-t border-gray-100 bg-white flex-shrink-0">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-800 text-gray-800 hover:bg-gray-100 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
        {/* Mic Button — inline voice in popup */}
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
            aria-label={isListening ? "Stop listening" : "Speak"}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : isSpeaking
                ? "bg-green-500 text-white animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } disabled:opacity-40`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask about properties on map..."}
          maxLength={500}
          disabled={loading || isListening}
          aria-label="Type your message"
          className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800 disabled:opacity-50 bg-gray-50"
        />

        {/* Stop Speaking Button */}
        {isSpeaking ? (
          <button
            onClick={stopSpeaking}
            aria-label="Stop speaking"
            className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="w-9 h-9 rounded-full bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
