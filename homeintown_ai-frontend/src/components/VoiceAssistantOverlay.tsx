"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface VoiceAssistantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<string>; // returns AI reply text
}

type VoiceState = "idle" | "listening" | "processing" | "speaking";

export default function VoiceAssistantOverlay({
  isOpen,
  onClose,
  onSendMessage,
}: VoiceAssistantOverlayProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const recognitionRef = useRef<unknown>(null);

  // Start listening when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTranscript("");
      setReply("");
      startListening();
    } else {
      stopAll();
    }
    return () => stopAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopAll = () => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
    }
    window.speechSynthesis?.cancel();
    setVoiceState("idle");
  };

  const startListening = useCallback(() => {
    const w = window as unknown as Record<string, unknown>;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      onClose();
      return;
    }

    const recognition = new (SpeechRecognitionCtor as new () => Record<string, unknown>)();
    recognition.lang = "hi-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setVoiceState("listening");

    recognition.onresult = (event: unknown) => {
      const e = event as { results: Array<{ 0: { transcript: string }; isFinal: boolean }> };
      const lastResult = e.results[e.results.length - 1];
      const text = lastResult[0].transcript;
      setTranscript(text);

      if (lastResult.isFinal) {
        handleUserSpeech(text);
      }
    };

    recognition.onerror = () => {
      setVoiceState("idle");
      setTimeout(onClose, 1000);
    };

    recognition.onend = () => {
      // If still listening (no final result), it timed out
      if (voiceState === "listening" && !transcript) {
        setVoiceState("idle");
        setTimeout(onClose, 500);
      }
    };

    recognitionRef.current = recognition;
    (recognition as { start: () => void }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserSpeech = async (text: string) => {
    setVoiceState("processing");

    try {
      const aiReply = await onSendMessage(text);
      const cleanReply = aiReply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      setReply(cleanReply);
      speakReply(cleanReply);
    } catch {
      setReply("Sorry, kuch problem ho gayi. Phir try karo.");
      setVoiceState("idle");
      setTimeout(onClose, 2000);
    }
  };

  const speakReply = (text: string) => {
    if (!window.speechSynthesis) {
      setVoiceState("idle");
      setTimeout(onClose, 2000);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("hi")) ||
                  voices.find(v => v.lang.startsWith("en-IN")) ||
                  voices.find(v => v.lang.startsWith("en"));
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => {
      setVoiceState("idle");
      // Auto-listen again after speaking
      setTimeout(() => {
        setTranscript("");
        setReply("");
        startListening();
      }, 500);
    };
    utterance.onerror = () => {
      setVoiceState("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center">
      {/* Close button */}
      <button
        onClick={() => { stopAll(); onClose(); }}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
        aria-label="Close voice assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Voice Animation Orb */}
      <div className="relative mb-12">
        {/* Outer glow rings */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          voiceState === "listening" ? "scale-150 bg-blue-500/20 animate-ping" :
          voiceState === "speaking" ? "scale-150 bg-green-500/20 animate-pulse" :
          voiceState === "processing" ? "scale-125 bg-yellow-500/20 animate-pulse" :
          "scale-100 bg-white/5"
        }`} style={{ width: 160, height: 160, marginLeft: -30, marginTop: -30 }} />
        
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          voiceState === "listening" ? "scale-125 bg-blue-400/30" :
          voiceState === "speaking" ? "scale-130 bg-green-400/30" :
          "scale-100 bg-white/5"
        }`} style={{ width: 130, height: 130, marginLeft: -15, marginTop: -15 }} />

        {/* Main orb */}
        <div className={`w-[100px] h-[100px] rounded-full flex items-center justify-center transition-all duration-300 ${
          voiceState === "listening" ? "bg-gradient-to-br from-blue-400 to-blue-600 scale-110 shadow-[0_0_60px_rgba(59,130,246,0.5)]" :
          voiceState === "speaking" ? "bg-gradient-to-br from-green-400 to-green-600 scale-105 shadow-[0_0_60px_rgba(34,197,94,0.5)]" :
          voiceState === "processing" ? "bg-gradient-to-br from-yellow-400 to-orange-500 scale-100 shadow-[0_0_40px_rgba(234,179,8,0.4)]" :
          "bg-gradient-to-br from-gray-400 to-gray-600 scale-95"
        }`}>
          {voiceState === "listening" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10 animate-pulse">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          )}
          {voiceState === "speaking" && (
            <div className="flex items-end gap-1 h-8">
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "60%" }} />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" style={{ height: "100%" }} />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.2s]" style={{ height: "40%" }} />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.3s]" style={{ height: "80%" }} />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.4s]" style={{ height: "50%" }} />
            </div>
          )}
          {voiceState === "processing" && (
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {voiceState === "idle" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 opacity-50">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center px-8 max-w-md">
        <p className={`text-lg font-medium mb-2 transition-colors ${
          voiceState === "listening" ? "text-blue-300" :
          voiceState === "speaking" ? "text-green-300" :
          voiceState === "processing" ? "text-yellow-300" :
          "text-gray-400"
        }`}>
          {voiceState === "listening" && "Listening..."}
          {voiceState === "processing" && "Thinking..."}
          {voiceState === "speaking" && "Speaking..."}
          {voiceState === "idle" && "Ready"}
        </p>

        {/* Live transcript */}
        {transcript && (
          <p className="text-white/80 text-sm mt-2 italic">
            &quot;{transcript}&quot;
          </p>
        )}

        {/* AI Reply */}
        {reply && voiceState === "speaking" && (
          <p className="text-white/60 text-xs mt-4 line-clamp-3">
            {reply}
          </p>
        )}
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-500 text-xs">
          {voiceState === "listening" ? "Bolo... main sun raha hun" : "Tap ✕ to close"}
        </p>
      </div>
    </div>
  );
}
