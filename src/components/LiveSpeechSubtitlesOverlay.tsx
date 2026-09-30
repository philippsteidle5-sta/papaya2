import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X, Radio, ArrowUpDown } from "lucide-react";
import { AgentConfig } from "../types";
import { useTheme } from "../utils/themeStore";
import { ParticleVoiceOrb } from "./ParticleVoiceOrb";

interface LiveSpeechSubtitlesOverlayProps {
  currentAgent: AgentConfig;
  state: "idle" | "listening" | "thinking" | "speaking" | "";
  captionWords: string[];
  captionProgress: number;
  speakingLevel: number;
  onStopSpeaking: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const LiveSpeechSubtitlesOverlay: React.FC<LiveSpeechSubtitlesOverlayProps> = React.memo(({
  currentAgent,
  state,
  captionWords,
  captionProgress,
  speakingLevel,
  onStopSpeaking,
  muted,
  onToggleMute,
}) => {
  const { isModern } = useTheme();
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<"bottom-left" | "top-left">("bottom-left");

  const isSpeaking = state === "speaking" || captionWords.length > 0;

  // Auto-scroll active word into view smoothly if captions span multiple lines
  useEffect(() => {
    if (isSpeaking && activeWordRef.current && containerRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [captionProgress, isSpeaking]);

  if (!isSpeaking) return null;

  // Agent color with fallback
  const agentColor = currentAgent?.color || (isModern ? "#f59e0b" : "#06b6d4");
  const color = isModern ? (currentAgent?.color || "#f59e0b") : (currentAgent?.color || "#facc15");
  const glowHex = `${color}50`;

  const totalWords = captionWords.length;
  const currentWordNum = Math.max(0, Math.min(totalWords, captionProgress + 1));
  const progressPercent = totalWords > 0 ? Math.round((currentWordNum / totalWords) * 100) : 0;

  const posClasses = position === "bottom-left"
    ? "bottom-24 sm:bottom-28 left-20 sm:left-24 md:left-28"
    : "top-20 sm:top-24 left-20 sm:left-24 md:left-28";

  return (
    <div className={`fixed ${posClasses} z-40 max-w-sm sm:max-w-[420px] w-[88%] sm:w-[420px] px-2 animate-fade-in pointer-events-auto transition-all duration-300`}>
      <div 
        className={`relative overflow-hidden rounded-xl p-2.5 sm:p-3 backdrop-blur-2xl transition-all duration-300 ${
          isModern
            ? "bg-zinc-950/95 border border-zinc-700/80 shadow-[0_0_30px_rgba(0,0,0,0.9)]"
            : "bg-[#060b14]/95 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,0,0,0.9)]"
        }`}
        style={{
          boxShadow: `0 0 20px ${glowHex}, inset 0 0 10px rgba(0,0,0,0.5)`,
          borderColor: `${color}60`,
        }}
      >
        {/* Animated Top Glow & Progress Bar */}
        <div 
          className="absolute top-0 left-0 h-[2px] transition-all duration-150"
          style={{ 
            width: `${Math.max(5, progressPercent)}%`,
            backgroundColor: color, 
            boxShadow: `0 0 10px ${color}` 
          }}
        />

        {/* Header Bar: Agent Badge + Equalizer + Stop Controls */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 3D Particle Voice Orb Avatar */}
            <ParticleVoiceOrb
              bare
              size={32}
              type="custom"
              primaryColor={color}
              intensity={Math.max(0.2, speakingLevel)}
              isLive={isSpeaking}
              state="speaking"
            />

            <span 
              className="font-bold tracking-wider uppercase text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1"
              style={{
                backgroundColor: `${color}15`,
                color: color,
                borderColor: `${color}40`,
              }}
            >
              <Radio className="w-2.5 h-2.5 animate-pulse" style={{ color }} />
              <span>🎙️ {currentAgent.name}</span>
            </span>

            {/* Live Reactive Equalizer Waveform */}
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/80 border border-white/10 shadow-inner">
              {[0.4, 0.9, 0.5, 1.1, 0.7].map((multiplier, idx) => {
                const dynamicHeight = Math.max(3, Math.min(12, Math.round(speakingLevel * 14 * multiplier)));
                return (
                  <span
                    key={idx}
                    className="w-0.5 rounded-full transition-all duration-75"
                    style={{
                      height: `${dynamicHeight}px`,
                      backgroundColor: color,
                      boxShadow: `0 0 4px ${color}`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-zinc-400">
              {currentWordNum}/{totalWords}
            </span>

            {/* Position Flip Button (Bottom-Left / Top-Left) */}
            <button
              onClick={() => setPosition((p) => (p === "bottom-left" ? "top-left" : "bottom-left"))}
              title={position === "bottom-left" ? "Nach oben links verschieben" : "Nach unten links verschieben"}
              className="p-1 rounded border border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/80 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <ArrowUpDown className="w-3 h-3 text-cyan-400" />
            </button>

            <button
              onClick={onToggleMute}
              title={muted ? "Ton einschalten" : "Stummschalten"}
              className="p-1 rounded border border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/80 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              {muted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" style={{ color }} />}
            </button>

            <button
              onClick={onStopSpeaking}
              title="Sprachausgabe abbrechen (ESC)"
              className="px-2 py-0.5 rounded border border-red-500/40 hover:border-red-500/80 bg-red-500/10 hover:bg-red-500/25 text-red-300 hover:text-red-100 transition cursor-pointer flex items-center gap-0.5 text-[9px] font-bold tracking-wider uppercase"
            >
              <X className="w-3 h-3" />
              <span>STOP</span>
            </button>
          </div>
        </div>

        {/* Karaoke Words Highlight Stream (Compact Teleprompter View) */}
        <div 
          ref={containerRef}
          className="min-h-[32px] flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 text-center py-1 max-h-[72px] overflow-y-auto custom-scrollbar scroll-smooth px-1"
        >
          {captionWords.map((word, idx) => {
            const isPast = idx < captionProgress;
            const isActive = idx === captionProgress;

            return (
              <span
                key={idx}
                ref={isActive ? activeWordRef : undefined}
                style={{
                  color: isActive ? color : isPast ? "#f8fafc" : "rgba(148, 163, 184, 0.3)",
                  textShadow: isActive ? `0 0 10px ${color}` : "none",
                  transform: isActive ? "scale(1.06)" : "scale(1.0)",
                }}
                className={`font-sans text-xs sm:text-[13px] leading-snug transition-all duration-100 inline-block px-0.5 select-text ${
                  isActive ? "font-bold underline decoration-2 underline-offset-2" : isPast ? "font-medium" : "font-normal"
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* ESC Key Hint */}
        <div className="mt-1 text-center font-mono text-[8px] text-zinc-500 tracking-wider">
          <kbd className="px-1 py-0.2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">ESC</kbd> ZUM STOPPEN
        </div>
      </div>
    </div>
  );
});

