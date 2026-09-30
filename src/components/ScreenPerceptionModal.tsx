import React, { useState } from "react";
import { Monitor, ShieldCheck, Zap, X, Check, AlertTriangle, Eye, Youtube, Plane, Building } from "lucide-react";

export interface PendingScreenAction {
  type: "youtube" | "flight" | "hotel" | "browse" | "general";
  title: string;
  query: string;
  targetUrl?: string;
}

interface ScreenPerceptionModalProps {
  isOpen: boolean;
  action: PendingScreenAction | null;
  onGrantPermission: () => void;
  onCancel: () => void;
  agentName?: string;
  lang?: "en" | "de";
}

export const ScreenPerceptionModal: React.FC<ScreenPerceptionModalProps> = ({
  isOpen,
  action,
  onGrantPermission,
  onCancel,
  agentName = "N.E.O. // S.Y.N.T.A.X.",
  lang = "en",
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isEn = lang === "en";

  if (!isOpen) return null;

  const getActionIcon = () => {
    if (!action) return <Monitor className="w-6 h-6 text-cyan-400" />;
    switch (action.type) {
      case "youtube":
        return <Youtube className="w-6 h-6 text-red-500" />;
      case "flight":
        return <Plane className="w-6 h-6 text-cyan-400" />;
      case "hotel":
        return <Building className="w-6 h-6 text-amber-400" />;
      default:
        return <Eye className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-cyan-500/60 rounded-3xl p-6 text-slate-100 font-sans shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{isEn ? "SCREEN PERCEPTION ACCESS PERMISSION" : "BILDSCHIRM-ZUGRIFFS-ERLAUBNIS"}</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              {getActionIcon()}
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                {agentName} {isEn ? "VISION PERCEPTION CORE" : "BILD-PERCEPTION CORE"}
              </div>
              <div className="text-sm font-semibold text-white">
                {action?.title || (isEn ? "Screen & Autonomous Vision Actions Access" : "Zugriff auf Bildschirm & System-Aktionen")}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <p className="font-semibold text-cyan-200">
              {isEn
                ? "N.E.O. & S.Y.N.T.A.X. require access to your Windows monitor (Monitor 1 or Monitor 2) to analyze visual screen content in real time:"
                : "N.E.O. & S.Y.N.T.A.X. benötigen Zugriff auf deinen Windows Monitor (Monitor 1 oder Monitor 2), um deinen echten Bildschirm live zu analysieren:"}
            </p>
            {action && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span className="truncate">🎯 {action.title}: {action.query}</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold uppercase">
                  MONITOR ACCESS
                </span>
              </div>
            )}
            <ul className="space-y-1.5 text-[11px] text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>
                  {isEn
                    ? <>Select your <strong>Monitor 1</strong>, <strong>Monitor 2</strong> or application window in the browser dialog.</>
                    : <>Wähle im folgenden Windows-Dialog deinen <strong>Monitor 1</strong>, <strong>Monitor 2</strong> oder ein Fenster aus.</>}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>
                  {isEn
                    ? <>N.E.O. & S.Y.N.T.A.X. receive a direct video signal from your screen and analyze content in real time.</>
                    : <>N.E.O. & S.Y.N.T.A.X. erhalten ein direktes Bildsignal deines Monitors & analysieren den Bildschirminhalt in Echtzeit.</>}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <span>
                  {isEn
                    ? <>You can stop sharing anytime by clicking the red <strong>STOP</strong> button in the top right HUD.</>
                    : <>Du kannst die Freigabe jederzeit oben rechts mit dem roten <strong>STOP</strong>-Button beenden.</>}
                </span>
              </li>
            </ul>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition cursor-pointer"
          >
            {isEn ? "CANCEL" : "ABBRECHEN"}
          </button>
          <button
            onClick={() => {
              setErrorMsg(null);
              onGrantPermission();
            }}
            className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-mono text-xs font-bold tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.4)] transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isEn ? "GRANT PERMISSION & START" : "ZUGRIFF GESTATTEN & STARTEN"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
