"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
}

/**
 * Hook for Speech-to-Text (mic) and Text-to-Speech (speak aloud).
 * Uses the browser's built-in Web Speech API — no external dependencies.
 */
export function useVoice({ lang = "hi-IN", onResult }: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<unknown>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  const isSupported = typeof window !== "undefined" && (
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );

  /**
   * Start listening — converts user speech to text
   */
  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Stop any ongoing speech first
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    const w = window as unknown as Record<string, unknown>;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new (SpeechRecognitionCtor as new () => Record<string, unknown>)();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: unknown) => {
      const e = event as { results: { 0: { 0: { transcript: string } } } };
      const transcript = e.results[0][0].transcript;
      if (transcript && onResult) {
        onResult(transcript);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    (recognition as { start: () => void }).start();
  }, [isSupported, lang, onResult]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
    }
    setIsListening(false);
  }, []);

  /**
   * Speak text aloud — Text-to-Speech
   */
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith("hi")) ||
                       voices.find(v => v.lang.startsWith("en-IN")) ||
                       voices.find(v => v.lang.startsWith("en"));
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
