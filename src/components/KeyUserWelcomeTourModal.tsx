import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Clapperboard,
  Activity,
  Cpu,
  ArrowRight,
  CheckCircle2,
  X,
  Key,
  Globe,
  Mail,
  Play,
  Terminal,
  Shield,
} from "lucide-react";
import { AccessKeyRecord } from "../utils/leadDatabase";

interface KeyUserWelcomeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeKey: AccessKeyRecord | null;
  onLaunchVeo: (prompt?: string) => void;
  onLaunch3DMatrix: () => void;
  onLaunchSyntaxPrompt: (prompt: string) => void;
  onOpenTutorial?: () => void;
  onOpenGmail?: () => void;
}

export const KeyUserWelcomeTourModal: React.FC<KeyUserWelcomeTourModalProps> = ({
  isOpen,
  onClose,
  activeKey,
  onLaunchVeo,
  onLaunch3DMatrix,
  onLaunchSyntaxPrompt,
  onOpenTutorial,
  onOpenGmail,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem("syntax_hide_key_welcome_tour", "true");
      } catch {}
    }
    onClose();
  };

  return (
    <div
      id="key-user-welcome-tour-modal"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in font-sans overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-[#060b13] border-2 border-cyan-400/80 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_0_80px_rgba(0,240,255,0.4)] my-auto space-y-6">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/20 blur-[100px] pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-cyan-500/25 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-wider">
                  WILLKOMMEN IN PAPAYA<span className="text-orange-400 font-mono text-sm ml-1">OS.ai</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono font-bold tracking-widest uppercase animate-pulse">
                  SOVEREIGN ACCESS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-300 font-mono mt-0.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Zugang freigeschaltet via Key:{" "}
                  <strong className="text-white bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                    {activeKey?.key ? activeKey.key.toUpperCase() : "OTTO (24H)"}
                  </strong>
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          Wähle einen der 3 Schnellstart-Schritte, um sofort die volle Power der 8 Spezialisten-Kerne zu erleben:
        </p>

        {/* 3 Interactive Quickstart Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          
          {/* STEP 1: VEO 3.1 VIDEO CREATOR */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/90 border border-purple-500/40 hover:border-pink-400 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-purple-950/20 hover:scale-[1.02]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold">
                  GOOGLE VEO 3.1
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-pink-400 group-hover:scale-110 transition" />
                <h3 className="text-sm font-black text-white tracking-wide">Video Creator</h3>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Erstelle atemberaubende 8K Cinema-Videos oder virale 9:16 TikTok Reels mit Nanoleap KI.
              </p>
            </div>

            <div className="space-y-1.5 pt-4">
              <button
                onClick={() => {
                  handleCloseModal();
                  onLaunchVeo("Erstelle ein 8K Cinematic Sci-Fi Cyberpunk Drohnenvideo einer futuristischen Megacity mit neonblauen Wolkenkratzern.");
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-[10px] tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(236,72,153,0.4)] active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>16:9 CINEMA STARTEN</span>
              </button>

              <button
                onClick={() => {
                  handleCloseModal();
                  onLaunchVeo("Erstelle ein 9:16 hochkant TikTok/Reels Video mit schnellen dynamischen Lichteffekten und 3D Hologrammen.");
                }}
                className="w-full py-1.5 px-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-pink-200 font-bold text-[9.5px] transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>9:16 Viral Reels</span>
              </button>
            </div>
          </div>

          {/* STEP 2: 3D MATRIX & 8-CORE NETWORK */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border border-cyan-500/40 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-cyan-950/20 hover:scale-[1.02]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  QUANTUM 3D
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition duration-500" />
                <h3 className="text-sm font-black text-white tracking-wide">3D Core Matrix</h3>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Erlebe alle 8 Cores im interaktiven 3D Raum (SYNTAX, NEO, VEGA, ODIN, PULSE, CHRONOS, ORACLE, GLOBE).
              </p>
            </div>

            <div className="space-y-1.5 pt-4">
              <button
                onClick={() => {
                  handleCloseModal();
                  onLaunch3DMatrix();
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-[10px] tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95"
              >
                <Globe className="w-3 h-3" />
                <span>3D MATRIX ÖFFNEN</span>
              </button>

              {onOpenTutorial && (
                <button
                  onClick={() => {
                    handleCloseModal();
                    onOpenTutorial();
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-200 font-bold text-[9.5px] transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>1-Minuten Einweisung</span>
                </button>
              )}
            </div>
          </div>

          {/* STEP 3: MASTER ORCHESTRATOR SYNTAX */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900/90 border border-amber-500/40 hover:border-amber-300 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-amber-950/20 hover:scale-[1.02]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  ROUTER CORE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
                <h3 className="text-sm font-black text-white tracking-wide">S.Y.N.T.A.X. Anweisung</h3>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Stelle deine Anweisung direkt an den Boss-Core. Er delegiert automatisch an alle Cores.
              </p>
            </div>

            <div className="space-y-1.5 pt-4">
              <button
                onClick={() => {
                  handleCloseModal();
                  onLaunchSyntaxPrompt("Analysiere meine geschäftliche Ausgangslage und erstelle eine autonome 7-Tage-Wachstumsstrategie unter Einbindung aller 8 Cores.");
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-[10px] tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>STRATEGIE ANFORDERN</span>
              </button>

              {onOpenGmail && (
                <button
                  onClick={() => {
                    handleCloseModal();
                    onOpenGmail();
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/30 text-amber-200 font-bold text-[9.5px] transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3 h-3 text-amber-300" />
                  <span>Gmail Inbox öffnen</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions & Options */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
          <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-[11px]">Diese Schnellstart-Führung nicht mehr automatisch öffnen</span>
          </label>

          <button
            onClick={handleCloseModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95"
          >
            <span>DIREKT ZUM COMMAND-CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
