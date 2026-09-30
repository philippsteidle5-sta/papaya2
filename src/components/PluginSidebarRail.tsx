import React from "react";
import {
  Calendar,
  Brain,
  Terminal,
  Video,
  Mail,
  Globe,
  Target,
  LayoutGrid,
  Sparkles
} from "lucide-react";
import { Language } from "../utils/translations";
import { ActiveWidgetsConfig } from "./WorkspaceLayoutEditor";

export interface PluginSidebarRailProps {
  activeWidgets?: Partial<ActiveWidgetsConfig>;
  isObsidianOpen?: boolean;
  isVeoStudioOpen?: boolean;
  isTerminalOpen?: boolean;
  onToggleCalendar: () => void;
  onToggleObsidian: () => void;
  onToggleTerminal: () => void;
  onToggleVeo: () => void;
  onToggleGmail: () => void;
  onToggleBrowser: () => void;
  onToggleObjectives: () => void;
  onToggleAppStore: () => void;
  lang?: Language;
}

export const PluginSidebarRail: React.FC<PluginSidebarRailProps> = ({
  activeWidgets = {} as Partial<ActiveWidgetsConfig>,
  isObsidianOpen = false,
  isVeoStudioOpen = false,
  isTerminalOpen = false,
  onToggleCalendar,
  onToggleObsidian,
  onToggleTerminal,
  onToggleVeo,
  onToggleGmail,
  onToggleBrowser,
  onToggleObjectives,
  onToggleAppStore,
  lang = "de",
}) => {
  const isEn = lang === "en";

  const plugins = [
    {
      id: "calendar",
      title: isEn ? "Chronos Calendar" : "Chronos Kalender",
      subtitle: isEn ? "Scheduling & Google Sync" : "Terminplaner & Google-Sync",
      icon: Calendar,
      active: !!activeWidgets.calendarWidget,
      onClick: onToggleCalendar,
      activeColor: "bg-amber-400",
      activeText: "text-amber-400",
      activeBorder: "border-amber-500/40",
    },
    {
      id: "obsidian",
      title: isEn ? "Obsidian Brain" : "Obsidian Wissensgraph",
      subtitle: isEn ? "Memory & Neural Vault" : "Langzeitgedächtnis & Notizen",
      icon: Brain,
      active: isObsidianOpen,
      onClick: onToggleObsidian,
      activeColor: "bg-purple-400",
      activeText: "text-purple-400",
      activeBorder: "border-purple-500/40",
    },
    {
      id: "terminal",
      title: isEn ? "Claude Code Terminal" : "Claude Code Terminal",
      subtitle: isEn ? "AST Engine & CLI" : "Autonome Code-Generierung",
      icon: Terminal,
      active: isTerminalOpen || !!activeWidgets.claudeCode,
      onClick: onToggleTerminal,
      activeColor: "bg-cyan-400",
      activeText: "text-cyan-400",
      activeBorder: "border-cyan-500/40",
    },
    {
      id: "veo",
      title: isEn ? "Veo 3.1 Video Studio" : "Veo 3.1 Video Studio",
      subtitle: isEn ? "Generative Media" : "8K Video & Motion KI",
      icon: Video,
      active: isVeoStudioOpen,
      onClick: onToggleVeo,
      activeColor: "bg-pink-400",
      activeText: "text-pink-400",
      activeBorder: "border-pink-500/40",
    },
    {
      id: "gmail",
      title: isEn ? "Gmail AI Client" : "Gmail KI-Postfach",
      subtitle: isEn ? "Smart Inbox & Drafts" : "Intelligente E-Mails",
      icon: Mail,
      active: !!activeWidgets.gmailInbox,
      onClick: onToggleGmail,
      activeColor: "bg-red-400",
      activeText: "text-red-400",
      activeBorder: "border-red-500/40",
    },
    {
      id: "browser",
      title: isEn ? "Web Radar & Research" : "Web Radar & Recherche",
      subtitle: isEn ? "Live Internet Sources" : "Quellen-Audit & Suche",
      icon: Globe,
      active: !!activeWidgets.webBrowser,
      onClick: onToggleBrowser,
      activeColor: "bg-emerald-400",
      activeText: "text-emerald-400",
      activeBorder: "border-emerald-500/40",
    },
    {
      id: "objectives",
      title: isEn ? "Daily Objectives" : "Tagesziele & Fokus",
      subtitle: isEn ? "Task Matrix" : "Prioritäten & Meilensteine",
      icon: Target,
      active: !!activeWidgets.dailyObjectives,
      onClick: onToggleObjectives,
      activeColor: "bg-orange-400",
      activeText: "text-orange-400",
      activeBorder: "border-orange-500/40",
    },
  ];

  return (
    <aside
      aria-label="Workspace Plugins"
      className="fixed left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-auto select-none"
    >
      <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-[#080a14]/85 border border-white/10 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        {/* Core Plugin Buttons */}
        {plugins.map((plugin) => {
          const Icon = plugin.icon;
          return (
            <div key={plugin.id} className="relative group">
              <button
                type="button"
                onClick={plugin.onClick}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative border ${
                  plugin.active
                    ? `bg-white/10 ${plugin.activeBorder} ${plugin.activeText} shadow-md`
                    : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                aria-label={plugin.title}
              >
                <Icon className="w-4 h-4" />

                {/* Glowing Active Dot Indicator */}
                {plugin.active && (
                  <span
                    className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${plugin.activeColor} shadow-[0_0_8px_currentColor]`}
                  />
                )}
              </button>

              {/* Minimalist Glass Hover Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0a0d1a]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-left pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-white">
                    {plugin.title}
                  </span>
                  {plugin.active && (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">
                      · AKTIV
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 font-sans">
                  {plugin.subtitle}
                </div>
              </div>
            </div>
          );
        })}

        {/* Separator */}
        <div className="w-5 h-[1px] bg-white/10 my-1" />

        {/* Plugin Manager / App Store Button */}
        <div className="relative group">
          <button
            type="button"
            onClick={onToggleAppStore}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative border ${
              activeWidgets.appStore
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            aria-label={isEn ? "Plugin Store" : "Plugin Store"}
          >
            <LayoutGrid className="w-4 h-4" />
            {activeWidgets.appStore && (
              <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            )}
          </button>

          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0a0d1a]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-left pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap hidden sm:block">
            <div className="text-xs font-mono font-bold text-white">
              {isEn ? "App & Plugin Store" : "App & Plugin Store"}
            </div>
            <div className="text-[10px] text-zinc-400 font-sans">
              {isEn ? "Manage integrations" : "Alle Erweiterungen & Tools"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
