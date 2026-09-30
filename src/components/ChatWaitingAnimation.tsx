import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { ThinkingOrb, OrbState, OrbSize } from "thinking-orbs";
import { AgentConfig } from "../types";

export interface ChatWaitingAnimationProps {
  currentAgent: AgentConfig;
  compareEnabled?: boolean;
  lang?: "de" | "en";
  customMessage?: string;
  onCancel?: () => void;
  state?: OrbState;
  size?: OrbSize;
}

const ALL_ORB_STATES: OrbState[] = [
  "searching",
  "connecting",
  "weaving",
  "solving",
  "composing",
  "shaping",
  "working",
  "breathing",
  "listening",
];

export const ChatWaitingAnimation: React.FC<ChatWaitingAnimationProps> = ({
  currentAgent,
  compareEnabled = false,
  lang = "de",
  customMessage,
  onCancel,
  state: overrideState,
  size = 64 as OrbSize,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [manualStateIndex, setManualStateIndex] = useState<number | null>(null);

  const phasesDe = [
    `${currentAgent.name} durchsucht Wissensräume...`,
    `Synapsen werden verknüpft...`,
    `Muster werden gewoben...`,
    `Lösungsvektor wird berechnet...`,
    `Antwort wird ausformuliert...`,
  ];

  const phasesEn = [
    `${currentAgent.name} is searching knowledge...`,
    `Connecting neural synapses...`,
    `Weaving context patterns...`,
    `Solving query vectors...`,
    `Composing final response...`,
  ];

  const phases = lang === "de" ? phasesDe : phasesEn;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [phases.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.dispatchEvent(new CustomEvent("syntax_cancel_chat"));
    }
  };

  // Determine active ThinkingOrb state from props, manual cycle, or dynamic elapsed timing
  const getDynamicState = (): OrbState => {
    if (overrideState) return overrideState;
    if (manualStateIndex !== null) return ALL_ORB_STATES[manualStateIndex];
    if (elapsedSeconds < 2) return "searching";
    if (elapsedSeconds < 5) return "connecting";
    if (elapsedSeconds < 8) return "weaving";
    if (elapsedSeconds < 12) return "solving";
    return "composing";
  };

  const activeOrbState = getDynamicState();
  const accentColor = currentAgent.color || "#ff7a59";

  const handleCycleOrbState = () => {
    setManualStateIndex((prev) => {
      const next = prev === null ? 0 : (prev + 1) % ALL_ORB_STATES.length;
      return next;
    });
  };

  return (
    <div className="w-full flex flex-col gap-2 my-2 font-sans select-none animate-fade-in">
      <div 
        className="rounded-2xl p-4 sm:p-4.5 text-zinc-200 shadow-xl flex items-center justify-between gap-4 transition-all duration-300"
        style={{
          background: "linear-gradient(180deg, rgba(14, 16, 26, 0.95), rgba(7, 9, 14, 0.98))",
          border: `1px solid ${accentColor ? `${accentColor}35` : "rgba(255, 255, 255, 0.1)"}`,
          boxShadow: `0 12px 36px rgba(0,0,0,0.6), 0 0 24px ${accentColor ? `${accentColor}15` : "rgba(255,122,89,0.1)"}`,
        }}
      >
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* ThinkingOrb from libraries.dev - 64px chat avatar scale or 20px inline */}
          <div 
            onClick={handleCycleOrbState}
            className="relative flex-shrink-0 flex items-center justify-center cursor-pointer group"
            title={`ThinkingOrb: state="${activeOrbState}" (Klicken zum Wechseln)`}
          >
            {/* Subtle glow backdrop behind the orb */}
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity"
              style={{ backgroundColor: accentColor }}
            />
            
            <ThinkingOrb 
              state={activeOrbState} 
              size={size} 
              theme="dark" 
              color={accentColor}
              speed={1.05}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-white tracking-wide">
                {currentAgent.name}
              </span>
              
              {/* Dynamic Thinking Orb State Tag */}
              <span 
                className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold border"
                style={{
                  backgroundColor: `${accentColor}18`,
                  borderColor: `${accentColor}35`,
                  color: accentColor,
                }}
              >
                {activeOrbState}
              </span>

              {elapsedSeconds > 1 && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  {elapsedSeconds}s
                </span>
              )}
            </div>

            <span className="text-xs text-zinc-300 mt-1 truncate max-w-[280px] sm:max-w-md">
              {customMessage || phases[phaseIndex % phases.length]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {elapsedSeconds > 6 && (
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === "de" ? "Abbrechen" : "Cancel"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
