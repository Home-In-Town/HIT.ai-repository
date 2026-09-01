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
  pricing?: { startingPrice?: number; pricePerSqFt?: number };
  configuration?: { bhkOptions?: string[] };
  amenities?: string[];
  reraApproved?: boolean;
  cta?: { callNumber?: string; whatsappNumber?: string };
}

interface MapAIGuideWidgetProps {
  properties: MapProperty[];
  isOpen: boolean;
  onClose: () => void;
}

const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://property-ai-agent-624770114041.asia-south1.run.app";

export default function MapAIGuideWidget({ properties, isOpen, onClose }: MapAIGuideWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", text: `Hi! I can see ${properties.length} properties on your map. What are you looking for — budget, BHK, area? 😊` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when properties count changes
  useEffect(() => {
    setMessages([{ role: "agent", text: `Hi! I can see ${properties.length} properties on your map. What are you looking for — budget, BHK, area? 😊` }]);
    setHistory([]);
  }, [properties.length]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Send message to AI
  const sendMessage = useCallback(async (voiceText?: string) => {
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
      if (!res.ok) throw new Error(data.error);

      const cleanReply = (data.reply || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      setMessages((prev) => [...prev, { role: "agent", text: cleanReply }]);
      setHistory(data.history);

      // If voice-triggered, speak the reply
      if (voiceText && cleanReply) {
        speak(cleanReply);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "agent", text: "Sorry, kuch problem ho gayi. Phir try karo." }]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, loading, properties, history]);

  // Voice hook
  const handleTranscript = useCallback((transcript: string) => {
    setInput(transcript);
    sendMessage(transcript);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, history]);

  const { isRecording, isProcessing, isSpeaking, isSupported, startRecording, stopRecording, speak, stopSpeaking } = useVoice({
    onTranscript: handleTranscript,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = ["What properties are available?", "Under 50 lakh options?", "Any 3BHK?", "Compare cheapest"];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="AI Map Guide"
      className="absolute bottom-16 left-4 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]"
      style={{ height: "520px" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg shadow-md">
          🎧
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">24/7 AI Guide</p>
          <p className="text-gray-300 text-[11px]">{properties.length} properties on map</p>
        </div>
        {isSpeaking && (
          <div className="flex items-center gap-0.5 mr-2">
            <span className="w-0.5 h-3 bg-green-400 rounded-full animate-[soundBar_0.5s_ease-in-out_infinite]" />
            <span className="w-0.5 h-4 bg-green-400 rounded-full animate-[soundBar_0.5s_ease-in-out_infinite_0.1s]" />
            <span className="w-0.5 h-2 bg-green-400 rounded-full animate-[soundBar_0.5s_ease-in-out_infinite_0.2s]" />
            <span className="w-0.5 h-5 bg-green-400 rounded-full animate-[soundBar_0.5s_ease-in-out_infinite_0.3s]" />
            <span className="w-0.5 h-3 bg-green-400 rounded-full animate-[soundBar_0.5s_ease-in-out_infinite_0.4s]" />
          </div>
        )}
        <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-all duration-200">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-[fadeIn_0.2s_ease-out]`}>
            <div className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
              msg.role === "user"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-sm"
                : "bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {(loading || isProcessing) && (
          <div className="flex justify-start animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-[bounce_0.6s_infinite]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-[bounce_0.6s_infinite_0.15s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-[bounce_0.6s_infinite_0.3s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-3 py-2 flex gap-2 flex-wrap border-t border-gray-50 bg-white flex-shrink-0">
          {suggestions.map((s) => (
            <button key={s} onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="text-[11px] px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
        {/* Mic Button */}
        {isSupported && (
          <button
            onClick={isRecording ? stopRecording : isSpeaking ? stopSpeaking : startRecording}
            disabled={loading || isProcessing}
            aria-label={isRecording ? "Stop recording" : isSpeaking ? "Stop speaking" : "Record voice"}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-110"
                : isSpeaking
                ? "bg-green-500 text-white shadow-lg shadow-green-200 scale-105"
                : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500"
            } disabled:opacity-40`}
          >
            {isRecording ? (
              <div className="w-3 h-3 bg-white rounded-sm" />
            ) : isSpeaking ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            )}
          </button>
        )}

        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={isRecording ? "🎤 Bol rahe ho..." : isProcessing ? "Samajh raha hun..." : "Type or tap mic..."}
          maxLength={500} disabled={loading || isRecording || isProcessing}
          className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 bg-gray-50 transition-all duration-200"
        />

        {/* Send Button */}
        <button onClick={() => sendMessage()} disabled={loading || !input.trim() || isRecording}
          aria-label="Send" className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes soundBar {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
    </div>
  );
}
