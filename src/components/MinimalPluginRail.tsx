import React from "react";
import {
  Puzzle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { ActiveWidgetsConfig } from "./WorkspaceLayoutEditor";

interface MinimalPluginRailProps {
  activeWidgets: ActiveWidgetsConfig;
  onToggleWidget: (widget: keyof ActiveWidgetsConfig) => void;
  onOpenVeoStudio?: () => void;
  onOpenObsidianBrain?: () => void;
  onOpenScreenPerception?: () => void;
  isScreenSharing?: boolean;
  onOpenPluginStore?: () => void;
  lang?: "de" | "en";
}

export const MinimalPluginRail: React.FC<MinimalPluginRailProps> = ({
  activeWidgets,
  onToggleWidget,
  onOpenPluginStore,
  lang = "de",
}) => {
  const isStoreActive = !!activeWidgets.appStore;

  // Sobald der Plugin Store geöffnet ist, verschwindet der Button
  if (isStoreActive) {
    return null;
  }

  const handleOpen = () => {
    if (onOpenPluginStore) {
      onOpenPluginStore();
    } else {
      onToggleWidget("appStore");
    }
  };

  return (
    <aside
      aria-label="Plugin Store"
      className="fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 z-40 pointer-events-auto select-none transition-all duration-300"
    >
      <div className="relative group">
        {/* Main Plugin Store Button */}
        <button
          type="button"
          onClick={handleOpen}
          className="relative flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-2xl active:scale-95 shadow-[0_16px_40px_rgba(0,0,0,0.85)] bg-[#0a0a0c]/90 hover:bg-[#121114]/95 border-white/12 hover:border-[#ff6b00]/40 text-zinc-300 hover:text-white"
          style={{
            boxShadow:
              "0 18px 45px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
          aria-label="Plugin Store"
        >
          {/* Subtle Ambient Hover Light Sweep */}
          <span className="absolute -top-full -left-1/2 w-2/5 h-[300%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12 opacity-0 group-hover:opacity-100 group-hover:left-[120%] transition-all duration-700 pointer-events-none" />

          {/* Warm Papaya Glowing Icon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#ff6b00]/12 border border-[#ff6b00]/30 group-hover:border-[#ff6b00]/60 transition-all duration-300">
            <Puzzle className="w-4 h-4 text-[#ff7a38] transition-transform group-hover:rotate-12 group-hover:scale-110" />

            {/* Sparkle micro-badge */}
            <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-300 animate-pulse" />
          </div>

          {/* Compact Label */}
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="font-mono text-xs font-bold text-white tracking-wide flex items-center gap-1">
              Plugin Store
              <ArrowUpRight className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#ff8c38]" />
            </span>
            <span className="text-[9.5px] font-sans text-zinc-400 group-hover:text-zinc-300 transition-colors">
              {lang === "de" ? "Erweiterungen" : "Extensions"}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
