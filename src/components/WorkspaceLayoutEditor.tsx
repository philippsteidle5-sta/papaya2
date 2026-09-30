import React, { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Check,
  Sparkles,
  Code2,
  TrendingUp,
  Monitor,
  Eye,
  Sliders,
  Save,
  X,
  ChevronDown,
  Layers,
  MapPin,
  MessageSquare,
  Activity,
  Cpu,
  Terminal,
  Globe,
  Zap,
  Mail,
  CloudSun,
  CalendarDays,
  Target,
} from "lucide-react";
import { MazeCoreStyling } from "./MazeCoreCustomizer";
import { useTheme } from "../utils/themeStore";

export interface ActiveWidgetsConfig {
  googleMaps: boolean;
  codeMapsBar: boolean;
  claudeCode: boolean;
  webBrowser: boolean;
  appStore: boolean;
  gmailInbox: boolean;
  socialUpload?: boolean;
  miniTrades: boolean;
  agentChat: boolean;
  systemStats: boolean;
  mazeCore: boolean;
  jarvisTrader: boolean;
  weatherWidget?: boolean;
  calendarWidget?: boolean;
  dailyObjectives?: boolean;
  agentDock?: boolean;
}

interface WorkspaceLayoutEditorProps {
  isEditMode: boolean;
  onExitEditMode: () => void;
  activeWidgets: ActiveWidgetsConfig;
  onToggleWidget: (key: keyof ActiveWidgetsConfig) => void;
  onApplyPreset: (preset: "coder" | "trader" | "visionos") => void;
  onOpenCoreCustomizer: () => void;
  onSaveAndApply: () => void;
  coreStyling: MazeCoreStyling;
  hasPromoHeader?: boolean;
  isAdmin?: boolean;
}

export const WorkspaceLayoutEditor: React.FC<WorkspaceLayoutEditorProps> = ({
  isEditMode,
  onExitEditMode,
  activeWidgets,
  onToggleWidget,
  onApplyPreset,
  onOpenCoreCustomizer,
  onSaveAndApply,
  coreStyling,
  hasPromoHeader = false,
  isAdmin = false,
}) => {
  const { isModern } = useTheme();
  const [showWidgetCenterPopover, setShowWidgetCenterPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowWidgetCenterPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isEditMode) return null;

  return (
    <div
      className={`fixed ${hasPromoHeader ? "top-14" : "top-3"} left-20 right-6 z-50 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-2xl animate-fade-in font-sans transition-all duration-200 ${
        isModern
          ? "bg-[#111115]/95 border border-zinc-800/90 shadow-[0_12px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(168,85,247,0.18)] text-zinc-100"
          : "bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_40px_rgba(0,240,255,0.25)] text-slate-100"
      }`}
    >
      {/* Left: Edit Mode Status & Badge */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            isModern
              ? "bg-purple-500/15 border border-purple-500/40 text-purple-200 font-mono shadow-[0_0_15px_rgba(168,85,247,0.25)]"
              : "bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full animate-ping ${
              isModern ? "bg-purple-400 shadow-[0_0_8px_#a855f7]" : "bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
            }`}
          />
          <LayoutGrid className={`w-4 h-4 ${isModern ? "text-purple-300" : "text-cyan-300"}`} />
          <span>[EDIT MODE ACTIVE]</span>
        </div>

        <span
          className={`hidden lg:inline text-[11px] font-mono border-l pl-3 ${
            isModern ? "text-zinc-400 border-zinc-800" : "text-slate-400 border-slate-800"
          }`}
        >
          VisionOS Layout Customizer
        </span>
      </div>

      {/* Middle: Controls & Presets */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Widget Center Popover Button */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setShowWidgetCenterPopover(!showWidgetCenterPopover)}
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              showWidgetCenterPopover
                ? isModern
                  ? "bg-purple-600/30 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                : isModern
                ? "bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300"
                : "bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300"
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            <span>WIDGET CENTER</span>
            <ChevronDown className={`w-3 h-3 ${isModern ? "text-zinc-400" : "text-slate-400"}`} />
          </button>

          {/* Popover Dropdown */}
          {showWidgetCenterPopover && (
            <div
              className={`absolute left-0 top-10 w-64 rounded-xl p-3 shadow-2xl z-50 animate-fade-in font-sans space-y-2 border ${
                isModern
                  ? "bg-[#131318]/98 border-zinc-700/80 text-zinc-200 shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
                  : "bg-slate-950/95 border-cyan-500/30 text-slate-200"
              }`}
            >
              <div
                className={`font-mono text-[10px] font-bold uppercase tracking-wider border-b pb-1.5 flex items-center justify-between ${
                  isModern ? "text-purple-400 border-purple-500/20" : "text-cyan-400 border-cyan-500/20"
                }`}
              >
                <span>MODULE EIN / AUSBLENDEN</span>
                <Eye className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {[
                  { key: "gmailInbox", label: "Gmail Posteingang & KI-Mails", icon: Mail },
                  { key: "socialUpload", label: "Social Media Studio (TikTok, IG, X)", icon: Zap },
                  { key: "calendarWidget", label: "Google Calendar & Chronos Termine", icon: CalendarDays },
                  { key: "agentDock", label: "Agenten Dock // 9-Core Bar", icon: Sparkles },
                  { key: "dailyObjectives", label: "Tagesziele // 3 Kernfokusse", icon: Target },
                  { key: "weatherWidget", label: "Standort Wetter Radar", icon: CloudSun },
                  { key: "webBrowser", label: "Quantum Web Browser", icon: Globe },
                  { key: "appStore", label: "S.Y.N.T.A.X. App Store Hub", icon: Zap },
                  { key: "claudeCode", label: "Lovable Live Fullstack IDE", icon: Terminal },
                  { key: "googleMaps", label: "Google Maps Radar", icon: MapPin },
                  { key: "codeMapsBar", label: "Google Code Maps Radar", icon: Code2 },
                  { key: "miniTrades", label: "Mini Quant Terminal", icon: TrendingUp },
                  { key: "agentChat", label: "Agenten Chat Panel", icon: MessageSquare },
                  { key: "systemStats", label: "System Diagnostic Stats", icon: Cpu },
                  { key: "mazeCore", label: "S.Y.N.T.A.X. Core Canvas", icon: Sparkles },
                  { key: "jarvisTrader", label: "SYNTAX Quant Terminal", icon: Activity },
                ]
                  .filter((item) => isAdmin || (item.key !== "googleMaps" && item.key !== "codeMapsBar"))
                  .map((item) => {
                  const isChecked = Boolean(activeWidgets?.[item.key as keyof ActiveWidgetsConfig]);
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onToggleWidget(item.key as keyof ActiveWidgetsConfig)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                        isChecked
                          ? isModern
                            ? "bg-purple-500/15 border-purple-500/40 text-purple-200 font-bold"
                            : "bg-cyan-500/20 border-cyan-500/40 text-cyan-200 font-bold"
                          : isModern
                          ? "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                          : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ItemIcon className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                          isChecked
                            ? isModern
                              ? "bg-purple-600 border-purple-400 text-white"
                              : "bg-cyan-400 border-cyan-300 text-slate-950"
                            : isModern
                            ? "border-zinc-700 bg-zinc-900"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Schnell-Presets */}
        <div
          className={`hidden md:flex items-center gap-1.5 p-1 rounded-xl border ${
            isModern ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <span className={`text-[10px] font-mono px-1.5 ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
            PRESETS:
          </span>
          <button
            onClick={() => onApplyPreset("coder")}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
              isModern
                ? "hover:bg-purple-500/20 text-zinc-300 hover:text-purple-200"
                : "hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200"
            }`}
            title="Coder Layout: Fokus auf Terminal, Agenten Chat & Core"
          >
            <Code2 className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            <span>[Coder]</span>
          </button>

          <button
            onClick={() => onApplyPreset("trader")}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
              isModern
                ? "hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-200"
                : "hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-200"
            }`}
            title="DeGen Trader Layout: Fokus auf Live Trades, Maps & SYNTAX Trading"
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>[DeGen Trader]</span>
          </button>

          <button
            onClick={() => onApplyPreset("visionos")}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition flex items-center gap-1 ${
              isModern
                ? "hover:bg-fuchsia-500/20 text-zinc-300 hover:text-fuchsia-200"
                : "hover:bg-fuchsia-500/20 text-slate-300 hover:text-fuchsia-200"
            }`}
            title="VisionOS Standard: Alle Module geöffnet"
          >
            <Monitor className="w-3 h-3 text-fuchsia-400" />
            <span>[VisionOS Standard]</span>
          </button>
        </div>

        {/* SYNTAX CORE STYLING Button */}
        <button
          onClick={onOpenCoreCustomizer}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition hover:scale-105 active:scale-95 border ${
            isModern
              ? "bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              : "bg-cyan-500/15 hover:bg-cyan-500/30 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          }`}
          title="S.Y.N.T.A.X. Core Partikel, Geometrie & Aura anpassen"
        >
          <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isModern ? "text-purple-300" : "text-cyan-300"}`} />
          <span>SYNTAX CORE STYLING</span>
        </button>
      </div>

      {/* Right: Save & Apply Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSaveAndApply}
          className={`px-4 py-1.5 rounded-xl font-mono font-black text-xs tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95 ${
            isModern
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.35)]"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.5)]"
          }`}
          title="Layout & Core Customization speichern und anwenden"
        >
          <Save className={`w-3.5 h-3.5 stroke-[2.5] ${isModern ? "text-white" : "text-slate-950"}`} />
          <span>SICHERN & ANWENDEN</span>
        </button>

        <button
          onClick={onExitEditMode}
          className={`p-1.5 rounded-xl border transition cursor-pointer ${
            isModern
              ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
              : "bg-slate-900 hover:bg-red-500/20 border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-300"
          }`}
          title="Edit Modus ohne Speichern beenden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
