import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  isAudioEnabled,
  toggleAudioEnabled,
  subscribeAudioState,
  playValidationBeep,
} from "../utils/audioSynth";

interface HeaderAudioToggleProps {
  isModern?: boolean;
  className?: string;
  showLabel?: boolean;
}

export const HeaderAudioToggle: React.FC<HeaderAudioToggleProps> = ({
  isModern = false,
  className = "",
  showLabel = true,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(() => isAudioEnabled());

  useEffect(() => {
    // Sync with global audio state
    const unsubscribe = subscribeAudioState((enabled) => {
      setSoundOn(enabled);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = toggleAudioEnabled();
    setSoundOn(nextState);
  };

  return (
    <button
      type="button"
      id="header-audio-synth-toggle"
      onClick={handleToggle}
      className={`px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition select-none ${
        soundOn
          ? isModern
            ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/10"
            : "bg-emerald-950/60 border border-emerald-400/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
          : isModern
          ? "bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          : "bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200"
      } ${className}`}
      title={
        soundOn
          ? "Audio Feedback: AKTIV (Klicken zum Stummschalten)"
          : "Audio Feedback: STUMM (Klicken für 432 Hz Synth-Feedback & Haptik)"
      }
    >
      {soundOn ? (
        <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : (
        <VolumeX className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      )}

      {showLabel && (
        <span className="hidden sm:inline">
          {soundOn ? "SOUND: ON" : "SOUND: OFF"}
        </span>
      )}

      {soundOn && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      )}
    </button>
  );
};
