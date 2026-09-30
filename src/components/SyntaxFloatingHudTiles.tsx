import React from "react";
import { Sparkles, HelpCircle, Play, Info } from "lucide-react";
import { useTheme } from "../utils/themeStore";

interface SyntaxFloatingHudTilesProps {
  onOpenTutorial?: () => void;
}

export const SyntaxFloatingHudTiles: React.FC<SyntaxFloatingHudTilesProps> = ({
  onOpenTutorial,
}) => {
  const { isModern } = useTheme();
  if (!onOpenTutorial) return null;

  return (
    <div className="absolute top-4 right-4 z-40 pointer-events-auto flex items-center gap-2">
      {/* Primary 1-Min Einweisung Button inside Focus Canvas */}
      <button
        id="btn-syntax-1min-tutorial"
        onClick={(e) => {
          e.stopPropagation();
          onOpenTutorial();
        }}
        className={`group relative px-3.5 py-1.5 rounded-2xl text-xs font-mono font-black uppercase tracking-wider backdrop-blur-2xl flex items-center gap-2 transition-all duration-300 cursor-pointer active:scale-95 ${
          isModern
            ? "bg-zinc-950/90 hover:bg-zinc-900 border-2 border-red-500/80 hover:border-red-400 text-red-200 hover:text-white shadow-[0_0_25px_rgba(239,68,68,0.35)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)]"
            : "bg-slate-950/85 hover:bg-slate-900 border-2 border-cyan-400/80 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_35px_rgba(0,240,255,0.8)]"
        }`}
        title="Interaktive 1-Minuten System-Einweisung starten"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isModern ? "bg-red-400" : "bg-cyan-400"
          }`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            isModern ? "bg-red-300" : "bg-cyan-300"
          }`} />
        </span>
        <Sparkles className={`w-4 h-4 group-hover:scale-110 transition duration-300 ${
          isModern ? "text-red-300" : "text-cyan-300"
        }`} />
        <span className="font-extrabold tracking-wider">1-MIN EINWEISUNG</span>
        <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[9px] border ${
          isModern
            ? "bg-red-500/20 text-red-300 border-red-400/40"
            : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
        }`}>
          TOUR
        </span>
      </button>
    </div>
  );
};
