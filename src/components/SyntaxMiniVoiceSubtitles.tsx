import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  X,
  Play,
  RotateCcw,
  Compass,
  Plane,
} from "lucide-react";
import { ParticleVoiceOrb } from "./ParticleVoiceOrb";
import { Language } from "../utils/translations";

export interface SyntaxMiniVoiceSubtitlesProps {
  statusText: string;
  isSpeaking: boolean;
  speakingLevel: number;
  isListening: boolean;
  micVolumeLevel: number;
  liveTranscript: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleVoice: () => void;
  onReplaySpeech: () => void;
  onQuickPrompt?: (prompt: string) => void;
  themeStyle?: "modern" | "cyberpunk";
  lang?: Language;
}

export const SyntaxMiniVoiceSubtitles: React.FC<SyntaxMiniVoiceSubtitlesProps> = ({
  statusText,
  isSpeaking,
  speakingLevel,
  isListening,
  micVolumeLevel,
  liveTranscript,
  isMuted,
  onToggleMute,
  onToggleVoice,
  onReplaySpeech,
  onQuickPrompt,
  themeStyle = "modern",
  lang = "de",
}) => {
  const isEn = lang === "en";
  const isModern = themeStyle === "modern";
  const [isMinimized, setIsMinimized] = useState(false);
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  // Split text into words and animate subtitles
  useEffect(() => {
    if (!statusText) return;
    const words = statusText.split(" ");
    setDisplayedWords(words);
    setActiveWordIndex(0);

    if (isSpeaking) {
      const intervalTime = Math.max(120, Math.min(300, 3000 / words.length));
      const interval = setInterval(() => {
        setActiveWordIndex((prev) => {
          if (prev < words.length - 1) return prev + 1;
          return prev;
        });
      }, intervalTime);

      return () => clearInterval(interval);
    } else {
      setActiveWordIndex(words.length - 1);
    }
  }, [statusText, isSpeaking]);

  const effectiveIntensity = isSpeaking
    ? Math.max(0.2, speakingLevel)
    : isListening
    ? Math.max(0.2, micVolumeLevel)
    : 0.05;

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 select-none transition-all duration-300 font-mono ${
        isMinimized ? "w-auto" : "w-[440px] max-w-[92vw]"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-3.5 backdrop-blur-2xl transition-all duration-300 shadow-2xl border ${
          isModern
            ? "bg-zinc-950/95 border-zinc-700/80 text-white shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
            : "bg-[#060e1d]/95 border-cyan-500/40 text-cyan-100 shadow-[0_0_30px_rgba(0,240,255,0.25)]"
        }`}
      >
        {/* Animated Top Glow Accent Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${
            isSpeaking
              ? isModern
                ? "bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-pulse"
                : "bg-cyan-400 shadow-[0_0_12px_#00f0ff] animate-pulse"
              : isListening
              ? "bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse"
              : "bg-zinc-700"
          }`}
        />

        {/* Minimized Pill View */}
        {isMinimized ? (
          <div className="flex items-center gap-3 py-0.5">
            <div
              onClick={onToggleVoice}
              className="cursor-pointer hover:scale-105 transition-transform"
              title="S.Y.N.T.A.X. Voice"
            >
              <ParticleVoiceOrb
                type={isListening ? "boss" : "syntax"}
                intensity={effectiveIntensity}
                isLive={isSpeaking || isListening}
                size={40}
                themeStyle={themeStyle}
              />
            </div>

            <div
              className="flex-1 flex flex-col cursor-pointer min-w-0 pr-2"
              onClick={() => setIsMinimized(false)}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-sky-400 tracking-wider">
                  S.Y.N.T.A.X. AI
                </span>
                {(isSpeaking || isListening) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <p className="text-[10px] text-zinc-300 truncate max-w-[180px]">
                {statusText}
              </p>
            </div>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              title="Expandieren"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Expanded Mini HUD Subtitle Bar */
          <div className="space-y-2.5">
            {/* Header: Particle Voice Orb + Title Badge + Audio Spectrum + Action Icons */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                {/* Left Mini Interactive Particle Orb */}
                <div
                  onClick={() => {
                    if (isSpeaking) onReplaySpeech();
                    else onToggleVoice();
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                  title="S.Y.N.T.A.X. Voice Particle Ball"
                >
                  <ParticleVoiceOrb
                    type={isListening ? "boss" : "syntax"}
                    intensity={effectiveIntensity}
                    isLive={isSpeaking || isListening}
                    size={46}
                    themeStyle={themeStyle}
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10.5px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${
                        isSpeaking
                          ? isModern
                            ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                          : isListening
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                          : "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}
                    >
                      <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                      <span>
                        {isListening
                          ? "🎙️ BOSS MIKROFON"
                          : isSpeaking
                          ? "🎙️ S.Y.N.T.A.X. SPRICHT"
                          : "S.Y.N.T.A.X. RADAR KI"}
                      </span>
                    </span>

                    {/* Equalizer Frequency Spectrum Wave */}
                    <div className="flex items-center gap-0.5 px-1.5 py-1 rounded bg-black/60 border border-zinc-800">
                      {[0.5, 0.9, 1.3, 0.7, 1.1, 0.6, 1.0, 0.4].map((mult, idx) => {
                        const h = Math.max(
                          3,
                          Math.min(
                            18,
                            Math.round(effectiveIntensity * 20 * mult + Math.sin(idx + Date.now() * 0.01) * 2)
                          )
                        );
                        return (
                          <span
                            key={idx}
                            className={`w-0.5 rounded-full transition-all duration-100 ${
                              isSpeaking
                                ? isModern
                                  ? "bg-sky-400 shadow-[0_0_6px_#38bdf8]"
                                  : "bg-cyan-400 shadow-[0_0_6px_#00f0ff]"
                                : isListening
                                ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
                                : "bg-zinc-600"
                            }`}
                            style={{ height: `${h}px` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[9px] text-zinc-400 font-mono mt-0.5">
                    {isListening
                      ? "Spracherkennung aktiv..."
                      : isSpeaking
                      ? "Audio-Synthese 1090MHz Telemetrie"
                      : "Bereit für Sprachbefehle"}
                  </span>
                </div>
              </div>

              {/* Top Controls: Replay, Mute, Minimize */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onReplaySpeech}
                  title="Sprachausgabe wiederholen"
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onToggleMute}
                  title={isMuted ? "Audio aktivieren" : "Audio stummschalten"}
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white cursor-pointer transition"
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </button>

                <button
                  onClick={() => setIsMinimized(true)}
                  title="Minimieren"
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white cursor-pointer transition"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Subtitle Transcript Text Box */}
            <div
              className={`p-2.5 rounded-xl border font-sans text-xs leading-relaxed transition-all ${
                isModern
                  ? "bg-zinc-900/90 border-zinc-800 text-zinc-200"
                  : "bg-[#09152b]/90 border-cyan-500/30 text-cyan-50"
              }`}
            >
              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5 animate-spin" style={{ animationDuration: "6s" }} />
                <div className="flex-1">
                  {displayedWords.map((word, idx) => {
                    const isCurrent = idx === activeWordIndex && isSpeaking;
                    const isPast = idx < activeWordIndex || !isSpeaking;

                    return (
                      <span
                        key={idx}
                        className={`transition-colors duration-150 inline-block mr-1 ${
                          isCurrent
                            ? isModern
                              ? "text-sky-300 font-bold bg-sky-500/20 px-1 rounded shadow-sm"
                              : "text-cyan-200 font-bold bg-cyan-400/20 px-1 rounded shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                            : isPast
                            ? "text-zinc-100"
                            : "text-zinc-500"
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* If listening to boss, show live transcript badge below */}
              {isListening && liveTranscript && (
                <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">Boss:</span>
                  <span className="italic">"{liveTranscript}"</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Voice Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {[
                { label: "✈️ Flug nach Phuket", prompt: "Suche ein Flug nach Phuket live jz" },
                { label: "✈️ Flug TG921", prompt: "Flug TG921" },
                { label: "🏨 Hotel Phuket", prompt: "Suche Hotel in Phuket" },
                { label: "✈️ Flug nach Bali", prompt: "Flug nach Bali" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickPrompt && onQuickPrompt(chip.prompt)}
                  className={`px-2 py-1 rounded-lg border text-[9.5px] whitespace-nowrap cursor-pointer transition ${
                    isModern
                      ? "bg-zinc-900 border-zinc-800 hover:border-sky-500 text-sky-300"
                      : "bg-cyan-950/40 border-cyan-500/30 hover:border-cyan-400 text-cyan-300"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
