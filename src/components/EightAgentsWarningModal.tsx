import React, { useState } from "react";
import { AlertTriangle, Zap, Cpu, X, Check, ShieldAlert, Layers } from "lucide-react";

interface EightAgentsWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgainSession: boolean) => void;
  currentScope?: string;
}

export const EightAgentsWarningModal: React.FC<EightAgentsWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    onConfirm(dontShowAgain);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#060c16] border border-amber-500/50 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
          title="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 animate-pulse">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                8x API LOAD MULTIPLIER
              </span>
            </div>
            <h3 className="font-mono text-base font-bold text-white tracking-wide mt-1">
              ALL 8 AGENTEN SCHALTUNG
            </h3>
          </div>
        </div>

        {/* Main Warning Text */}
        <div className="space-y-3.5 mb-6 text-sm text-slate-300 font-sans leading-relaxed">
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 font-sans leading-relaxed">
              Du beabsichtigst, <strong className="text-amber-300 font-semibold">alle 8 KI-Agenten gleichzeitig</strong> für jede Nachricht zu aktivieren. Dies erfordert die <strong className="text-white font-semibold">8-fache API-Leistung</strong>!
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-cyan-300">8 Parallele KI-Anfragen:</strong> Jedes Prompt sendet zeitgleich 8 separate Rechenanfragen an das Gemini AI-Netzwerk.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-orange-300">Schnellerer Quoten-Verbrauch:</strong> Dein API-Limit (Rate Limit / Tageskontingent) ist dadurch <strong className="text-white underline decoration-amber-500 decoration-2">8-mal schneller verbraucht</strong> als im Einzelagenten-Modus.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300">Empfehlung:</strong> Verwende für normale Unterhaltungen <em>'SINGLE'</em> oder <em>'THE BIG 3'</em>. Schalte <em>'ALL (8)'</em> gezielt ein, wenn du tiefgehende Multi-Perspektiven-Analysen benötigst.
              </span>
            </div>
          </div>

          {/* Visual Resource Meter Comparison */}
          <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-mono font-bold text-slate-400 flex justify-between">
              <span>RESOURCE & QUOTA IMPACT</span>
              <span className="text-amber-400">800% VERBRAUCH</span>
            </div>

            {/* Single Agent */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>👤 SINGLE AGENT</span>
                <span>1x Load (Schonend)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[12.5%]" />
              </div>
            </div>

            {/* The Big 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>👑 THE BIG 3 (SYNTAX • NEO • VEGA)</span>
                <span>3x Load (Ausgewogen)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[37.5%]" />
              </div>
            </div>

            {/* All 8 Agents */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-amber-300 font-bold">
                <span>🌐 ALL 8 AGENTS</span>
                <span className="text-amber-400">8x Load (Maximum / Limit schneller voll)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-amber-500/40">
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-full w-full rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Remember choice checkbox */}
        <label className="flex items-center gap-2 mb-5 text-xs text-slate-400 cursor-pointer select-none hover:text-slate-200 transition">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/50 cursor-pointer"
          />
          <span>In dieser Sitzung nicht mehr warnen</span>
        </label>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleConfirmClick}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>8x MODUS AKTIVIEREN & FORTFAHREN</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition border border-slate-700 active:scale-95"
          >
            <span>Abbrechen</span>
          </button>
        </div>

      </div>
    </div>
  );
};
