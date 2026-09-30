import React from "react";
import { Volume2, Radio, Mic, Sparkles, Activity } from "lucide-react";
import { useTheme } from "../utils/themeStore";

interface AgentSpeechAnimationProps {
  agentColor?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  showEqualizer?: boolean;
  showRipple?: boolean;
}

export const AgentSpeechAnimation = React.memo<AgentSpeechAnimationProps>(({
  agentColor = "#00f0ff",
  isSpeaking = true,
  isListening = false,
  size = "md",
  label,
  className = "",
  showEqualizer = true,
  showRipple = true,
}) => {
  const { isModern } = useTheme();

  // Vibrant Electric Yellow for Speech Output as requested by the user
  const speechYellow = "#facc15";
  // Default effective color
  const defaultEffectiveColor = isModern
    ? agentColor === "#00f0ff" || agentColor === "#4ee8ff"
      ? "#a855f7"
      : agentColor
    : agentColor;

  const effectiveColor = isSpeaking ? speechYellow : defaultEffectiveColor;

  // Height and bar counts based on size
  const barHeights =
    size === "sm"
      ? [8, 16, 12, 20, 14, 22, 16, 10]
      : size === "lg"
      ? [14, 28, 18, 34, 24, 38, 30, 22, 34, 26, 18, 30, 20, 12]
      : [12, 24, 16, 28, 20, 30, 24, 18, 26, 14];

  return (
    <div className={`inline-flex items-center gap-2.5 font-mono ${className}`}>
      {/* Ripple Sonic Ring Effect */}
      {showRipple && (isSpeaking || isListening) && (
        <div className="relative flex items-center justify-center">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-pulse"
            style={{ backgroundColor: effectiveColor }}
          />
          <div
            className={`relative rounded-xl p-1.5 border transition-all duration-300 ${
              isSpeaking
                ? "shadow-[0_0_15px_rgba(250,204,21,0.4)] bg-yellow-400/20 border-yellow-400"
                : isModern
                ? "shadow-[0_0_12px_rgba(239,68,68,0.25)] border-red-500/50 bg-red-500/10"
                : "shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            }`}
            style={{
              borderColor: isSpeaking ? "#facc15" : effectiveColor,
              backgroundColor: isSpeaking ? "rgba(250, 204, 21, 0.2)" : `${effectiveColor}20`,
            }}
          >
            <Volume2 className="w-3.5 h-3.5" style={{ color: effectiveColor }} />
          </div>
        </div>
      )}

      {/* Animated Equalizer Waveform Bars */}
      {showEqualizer && (
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors duration-200 ${
          isSpeaking
            ? "bg-yellow-950/40 border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
            : isModern
            ? "bg-zinc-900/90 border-zinc-700/80 shadow-sm"
            : "bg-black/80 border-white/10 shadow-inner"
        }`}>
          {barHeights.map((hPx, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isSpeaking ? "animate-pulse" : isListening ? "animate-pulse" : "opacity-35"
              }`}
              style={{
                height: isSpeaking || isListening ? `${hPx}px` : "4px",
                backgroundColor: effectiveColor,
                boxShadow: isSpeaking
                  ? `0 0 10px #facc15, 0 0 4px #ffe600`
                  : isListening
                  ? `0 0 8px ${effectiveColor}80`
                  : "none",
                animationDelay: `${idx * 0.07}s`,
                animationDuration: isSpeaking ? "0.65s" : "1.4s",
              }}
            />
          ))}
        </div>
      )}

      {/* Speech Label / Voice Status Badge */}
      {label && (
        <span
          className={`text-[10px] uppercase font-mono font-black tracking-wider px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-sm transition-colors duration-200 ${
            isSpeaking
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/60 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
              : isModern
              ? "bg-zinc-900/90 border-zinc-700 text-zinc-300"
              : ""
          }`}
          style={{
            color: isSpeaking ? "#fef08a" : effectiveColor,
            borderColor: isSpeaking ? "#facc15" : isModern ? undefined : `${effectiveColor}50`,
            backgroundColor: isSpeaking ? "rgba(250, 204, 21, 0.15)" : isModern ? undefined : `${effectiveColor}15`,
          }}
        >
          {isSpeaking ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
              <span className="text-yellow-300 font-black">🎙️ {label} SPRICHT</span>
            </>
          ) : isListening ? (
            <>
              <Activity className="w-3 h-3 animate-spin" style={{ color: effectiveColor }} />
              <span>🎧 LAUSCHT</span>
            </>
          ) : (
            label
          )}
        </span>
      )}
    </div>
  );
});
