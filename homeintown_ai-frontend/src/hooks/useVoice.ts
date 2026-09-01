"use client";

import { useState, useRef, useCallback } from "react";

const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://property-ai-agent-624770114041.asia-south1.run.app";

interface UseVoiceOptions {
  onTranscript?: (text: string) => void;
}

/**
 * Voice hook using Sarvam AI for STT and TTS.
 * Records audio from browser mic → sends to backend → Sarvam STT → transcript.
 * Also provides speak() that calls Sarvam TTS → plays audio.
 */
export function useVoice({ onTranscript }: UseVoiceOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSupported = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  /**
   * Start recording from microphone
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (audioBlob.size < 100) return; // too short

        // Send to backend for STT
        setIsProcessing(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const res = await fetch(`${AI_AGENT_URL}/api/property-agent/voice-stt`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (res.ok && data.transcript) {
            onTranscript?.(data.transcript);
          }
        } catch (err) {
          console.error("STT failed:", err);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  }, [isSupported, onTranscript]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  /**
   * Speak text using Sarvam TTS — plays audio in browser
   */
  const speak = useCallback(async (text: string) => {
    if (!text) return;

    setIsSpeaking(true);
    try {
      const res = await fetch(`${AI_AGENT_URL}/api/property-agent/voice-tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "hi-IN", speaker: "anushka" }),
      });

      const data = await res.json();

      if (res.ok && data.audio) {
        // Play base64 audio
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error("TTS failed:", err);
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    isSupported,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}
