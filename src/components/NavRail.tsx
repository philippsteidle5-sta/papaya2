import React, { useState, useRef, useEffect } from "react";
import {
  Cpu,
  Columns2,
  Volume2,
  VolumeX,
  Settings,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Network,
  Globe,
  SlidersHorizontal,
  LayoutGrid,
  Compass,
  Zap,
  Mail,
  Share2,
  ShieldCheck,
  Lock,
  Terminal,
  Trophy,
  Gift,
  MapPin,
  Video,
  CalendarDays,
  FileText,
  Target,
  Sparkles,
  Palette,
  Plane,
  Brain,
} from "lucide-react";
import { AgentConfig } from "../types";
import { UserRole, isAgentAllowed, ROLE_TIER_DETAILS } from "../rbac";
import { AgentSpeechAnimation } from "./AgentSpeechAnimation";
import { useTheme } from "../utils/themeStore";

interface NavRailProps {
  currentAgent: AgentConfig;
  onSelectAgent: (id: string) => void;
  compareEnabled: boolean;
  onToggleCompare: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenConstellation?: () => void;
  onOpenJarvisTerminalDashboard?: () => void;
  onOpenWebBrowser?: () => void;
  onOpenAppStore?: () => void;
  onOpenGmailInbox?: () => void;
  onOpenSocialUpload?: (platform?: "tiktok" | "instagram") => void;
  onOpenGoogleMaps?: () => void;
  onOpenFlightSearch?: () => void;
  onOpenHotelSearch?: () => void;
  onOpenVeoStudio?: () => void;
  onOpenClaudeCode?: () => void;
  onOpenCalendar?: () => void;
  onOpenDailyObjectives?: () => void;
  onOpenObsidianBrain?: () => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  agents: AgentConfig[];
  userRole?: UserRole;
  onOpenRoleManager?: () => void;
  onOpenRewardProgram?: () => void;
  onOpenAgentInspector?: (agentId?: string) => void;
  onOpenAgentFleetStudio?: () => void;
  hasPromoHeader?: boolean;
  lang?: "de" | "en";
  onToggleLang?: () => void;
  onOpenVoiceConference?: () => void;
  onOpenAgentSyncSynthesis?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAppToolManager?: () => void;
}

export const NavRail: React.FC<NavRailProps> = ({
  currentAgent,
  onSelectAgent,
  compareEnabled,
  onToggleCompare,
  muted,
  onToggleMute,
  onOpenSettings,
  onOpenConstellation,
  onOpenJarvisTerminalDashboard,
  onOpenWebBrowser,
  onOpenAppStore,
  onOpenAppToolManager,
  onOpenGmailInbox,
  onOpenSocialUpload,
  onOpenGoogleMaps,
  onOpenFlightSearch,
  onOpenHotelSearch,
  onOpenVeoStudio,
  onOpenClaudeCode,
  onOpenCalendar,
  onOpenDailyObjectives,
  onOpenObsidianBrain,
  isEditMode = false,
  onToggleEditMode,
  agents,
  userRole = "SOVEREIGN" as UserRole,
  onOpenRoleManager,
  onOpenRewardProgram,
  onOpenAgentInspector,
  onOpenAgentFleetStudio,
  hasPromoHeader = false,
  lang = "de",
  onToggleLang,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
}) => {
  const { theme, toggleTheme, isModern } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("syntax_navrail_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;

  const toggleCollapsed = () => {
    if (externalOnToggleCollapse) {
      externalOnToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("syntax_navrail_collapsed", String(next));
          window.dispatchEvent(new Event("syntax_navrail_toggle"));
        } catch {}
        return next;
      });
    }
  };

  const menuRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX < -30 && !isCollapsed) {
      // Swiped left -> collapse
      toggleCollapsed();
    } else if (deltaX > 30 && isCollapsed) {
      // Swiped right -> expand
      toggleCollapsed();
    }
    setTouchStartX(null);
  };

  // Close agent selector menu if clicked outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      {/* 1. Collapsed Edge Tab / Lasche (Visible on left screen edge when collapsed, just like Live Monitor Perception) */}
      {isCollapsed && (
        <button
          onClick={toggleCollapsed}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Seitenleiste ausklappen (NavRail öffnen)"
          className={`fixed left-0 z-40 group py-3.5 px-2 rounded-r-2xl border-r-2 border-y-2 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 shadow-2xl backdrop-blur-2xl animate-fade-in hover:scale-105 active:scale-95 ${
            hasPromoHeader ? "top-28" : "top-20"
          } ${
            isModern
              ? "bg-[#111114]/95 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 shadow-[4px_0_25px_rgba(0,0,0,0.8)]"
              : "bg-slate-950/95 border-cyan-400 text-cyan-300 hover:text-white hover:bg-cyan-950/70 shadow-[5px_0_25px_rgba(0,240,255,0.4)]"
          }`}
        >
          <div className="flex items-center gap-1">
            <ChevronRight
              className={`w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform ${
                isModern ? "text-purple-400" : "text-cyan-400"
              }`}
            />
          </div>
          <div className="relative flex items-center justify-center my-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isModern ? "bg-purple-500" : "bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse"
              }`}
            />
          </div>
          <span
            className={`[writing-mode:vertical-lr] text-[9.5px] font-extrabold tracking-widest uppercase select-none ${
              isModern ? "text-zinc-300" : "text-cyan-200"
            }`}
          >
            MENÜ
          </span>
        </button>
      )}

      {/* 2. Edge Tab / Latch sticking out on the right side of the OPEN NavRail for instant 1-click collapse */}
      {!isCollapsed && (
        <button
          onClick={toggleCollapsed}
          title="Seitenleiste einklappen (NavRail schließen)"
          className={`fixed left-[61px] z-40 group py-2.5 px-1.5 rounded-r-xl border-r border-y flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg backdrop-blur-xl hover:scale-110 active:scale-95 ${
            hasPromoHeader ? "top-28" : "top-20"
          } ${
            isModern
              ? "bg-[#141418]/95 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-[4px_0_20px_rgba(0,0,0,0.6)]"
              : "bg-slate-950/95 border-cyan-500/50 text-cyan-400 hover:text-cyan-100 hover:bg-cyan-950/80 shadow-[4px_0_15px_rgba(0,240,255,0.25)]"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* 3. Main NavRail Sidebar */}
      <div
        id="tour-nav-rail"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed left-0 ${
          hasPromoHeader ? "top-11 h-[calc(100vh-44px)]" : "top-0 bottom-0"
        } w-[62px] z-30 flex flex-col items-center gap-2.5 py-3 transition-all duration-300 overflow-y-auto no-scrollbar ${
          isCollapsed ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        } ${
          isModern
            ? "bg-[#111114]/98 border-r border-zinc-800/80 shadow-[2px_0_20px_rgba(0,0,0,0.6)]"
            : "glass-rail"
        }`}
      >
        {/* Top Collapse Button inside Rail Header */}
        <div className="w-full flex justify-center pb-1">
          <button
            onClick={toggleCollapsed}
            title="Seitenleiste einklappen (Klick oder nach links wischen)"
            className={`w-9 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition ${
              isModern
                ? "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-cyan-500/30 bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/15"
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Agent Selector / Back to Matrix Hub Button */}
        <div className="relative" ref={menuRef} id="navrail-agent-btn">
          <button
            onClick={() => {
              if (onOpenConstellation) {
                onOpenConstellation();
              } else {
                setMenuOpen(!menuOpen);
              }
            }}
            title="Zurück zur 8-Core Sovereign Matrix"
            style={
              isModern
                ? {}
                : {
                    borderColor: (currentAgent || {}).color || "#4ee8ff",
                    color: (currentAgent || {}).color || "#4ee8ff",
                    boxShadow: `0 0 12px ${(currentAgent || {}).color || "#4ee8ff"}40`,
                    textShadow: `0 0 8px ${(currentAgent || {}).color || "#4ee8ff"}`,
                  }
            }
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-base cursor-pointer transition duration-200 group ${
              isModern
                ? "border border-purple-500/50 bg-purple-950/30 text-purple-400 hover:bg-purple-900/40 hover:border-purple-400"
                : "border hover:bg-white/10 hover:scale-105 active:scale-95"
            }`}
          >
            {(currentAgent || {}).railLetter || "S"}
          </button>

          {/* Dropdown Menu for Navigating via Constellation Matrix */}
          {menuOpen && (
            <div
              className={`absolute left-14 top-0 w-52 rounded-xl overflow-hidden animate-fade-in py-1 z-40 border shadow-2xl ${
                isModern
                  ? "bg-[#141418]/95 border-zinc-800 text-zinc-100"
                  : "glass-panel border-cyan-500/20 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              }`}
            >
              <div
                className={`px-3 py-1.5 font-mono text-[9px] tracking-[1.5px] border-b flex items-center justify-between ${
                  isModern
                    ? "text-zinc-400 border-zinc-800 bg-zinc-900/60"
                    : "text-cyan-400 border-cyan-500/10"
                }`}
              >
                <span>8-CORE MATRIX ({userRole})</span>
                <Network className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              </div>
              {agents.map((ag) => {
                const allowed = isAgentAllowed(userRole, ag.id);
                return (
                  <button
                    key={ag.id}
                    onClick={() => {
                      if (!allowed && onOpenRoleManager) {
                        onOpenRoleManager();
                      } else {
                        onSelectAgent(ag.id);
                        if (onOpenConstellation) onOpenConstellation();
                      }
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between font-mono text-xs cursor-pointer transition ${
                      currentAgent?.id === ag.id
                        ? isModern
                          ? "text-purple-400 bg-purple-950/30 font-bold"
                          : "text-cyan-400 bg-cyan-500/10 font-bold"
                        : allowed
                        ? isModern
                          ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                          : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
                        : "text-red-400/70 bg-red-950/20 hover:bg-red-950/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {!allowed && <Lock className="w-3 h-3 text-red-400 inline flex-shrink-0" />}
                      <span>{ag.name}</span>
                      {allowed && (
                        <AgentSpeechAnimation
                          agentColor={isModern ? "#a855f7" : ag.color}
                          isSpeaking={currentAgent?.id === ag.id}
                          isListening={currentAgent?.id !== ag.id}
                          size="sm"
                          showRipple={false}
                        />
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      {onOpenAgentInspector && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            onOpenAgentInspector(ag.id);
                          }}
                          className={`p-1 rounded transition ${
                            isModern
                              ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                              : "hover:bg-cyan-500/20 text-cyan-400 hover:text-white"
                          }`}
                          title={`Queries & REQs von ${ag.name} ansehen`}
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                      )}
                      {allowed ? (
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      ) : (
                        <span className="text-[8px] text-amber-300 font-bold uppercase bg-amber-500/20 px-1 py-0.5 rounded border border-amber-500/30">
                          SPERRE
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={`w-[75%] h-[1px] my-0.5 ${isModern ? "bg-zinc-800" : "bg-slate-800"}`} />

        {/* JARVIS & Claude Code Terminal Matrix View Button */}
        <button
          id="tour-terminal-btn"
          onClick={() => {
            if (onOpenClaudeCode) {
              onOpenClaudeCode();
            } else if (onOpenJarvisTerminalDashboard) {
              onOpenJarvisTerminalDashboard();
            }
          }}
          title="Lovable Fullstack Engine & Agenten-Rechenleistung"
          className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
            isModern
              ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
              : "border-purple-500/50 text-purple-300 bg-purple-500/15 hover:bg-purple-500/30 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
          }`}
        >
          <Terminal className="w-4 h-4 transition" />
          {!isModern && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-ping" />
          )}
        </button>

        {/* Google Veo AI Video Studio Button */}
        {onOpenVeoStudio && (
          <button
            id="tour-veo-btn"
            onClick={onOpenVeoStudio}
            title="Google Veo AI Video Studio"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-pink-500/60 text-pink-300 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/30 hover:bg-pink-500/40 hover:border-pink-300 shadow-[0_0_16px_rgba(236,72,153,0.4)]"
            }`}
          >
            <Video className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899] animate-ping" />
            )}
          </button>
        )}

        {/* 📬 Gmail Posteingang & KI-Mails (Core Triad) */}
        {onOpenGmailInbox && (
          <button
            id="tour-gmail-btn"
            onClick={onOpenGmailInbox}
            title="📬 Gmail Posteingang // KI-Zusammenfassungen & Auto-Entwürfe"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-red-500/40 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                : "border-red-500/60 text-red-300 bg-gradient-to-br from-red-500/20 via-pink-500/20 to-red-500/30 hover:bg-red-500/40 hover:border-red-300 shadow-[0_0_16px_rgba(239,68,68,0.4)]"
            }`}
          >
            <Mail className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#ef4444] animate-ping" />
            )}
          </button>
        )}

        {/* 📱 Social Media Studio (Core Triad) */}
        {onOpenSocialUpload && (
          <button
            id="tour-social-studio-btn"
            onClick={() => onOpenSocialUpload("tiktok")}
            title="📱 Social Media Studio // TikTok, Instagram, LinkedIn & X"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-pink-500/40 bg-pink-500/10 text-pink-400 hover:text-pink-300 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.25)]"
                : "border-pink-500/60 text-pink-300 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/30 hover:bg-pink-500/40 hover:border-pink-300 shadow-[0_0_16px_rgba(236,72,153,0.4)]"
            }`}
          >
            <Share2 className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899] animate-ping" />
            )}
          </button>
        )}

        {/* 📅 Chronos Kalender & Termine (Core Triad) */}
        {onOpenCalendar && (
          <button
            id="tour-calendar-btn"
            onClick={onOpenCalendar}
            title="📅 Chronos Kalender // Google Calendar Sync & Zeitmanagement"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "border-amber-500/60 text-amber-300 bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-500/30 hover:bg-amber-500/40 hover:border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.4)]"
            }`}
          >
            <CalendarDays className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
            )}
          </button>
        )}

        {/* 🧠 Obsidian Brain & Knowledge Graph */}
        {onOpenObsidianBrain && (
          <button
            id="tour-obsidian-btn"
            onClick={onOpenObsidianBrain}
            title="🧠 Obsidian Brain // Local Vault & Knowledge Graph"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-purple-500/40 bg-purple-500/10 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                : "border-purple-500/60 text-purple-300 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-purple-500/30 hover:bg-purple-500/40 hover:border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.4)]"
            }`}
          >
            <Brain className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7] animate-ping" />
            )}
          </button>
        )}

        {/* Google Maps Cyber Radar Button */}
        {onOpenGoogleMaps && (
          <button
            id="tour-maps-btn"
            onClick={onOpenGoogleMaps}
            title="Google Maps GPS & Radar"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-emerald-500/60 text-emerald-300 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-emerald-500/30 hover:bg-emerald-500/40 hover:border-emerald-300 shadow-[0_0_16px_rgba(160,185,129,0.4)]"
            }`}
          >
            <MapPin className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-ping" />
            )}
          </button>
        )}

        {/* S.Y.N.T.A.X. Reward Program Button */}
        {onOpenRewardProgram && (
          <button
            onClick={onOpenRewardProgram}
            title="🏆 S.Y.N.T.A.X. Reward Program Hub"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-amber-400/70 text-amber-300 bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-purple-500/20 hover:bg-amber-500/35 hover:border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse"
            }`}
          >
            <Trophy className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
            )}
          </button>
        )}


        {/* 8-Agent Neural Constellation Matrix Button */}
        {onOpenConstellation && (
          <button
            onClick={onOpenConstellation}
            title="8-Core Neuronale Netzwerk-Matrix"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400 shadow-[0_0_10px_rgba(78,232,255,0.2)]"
            }`}
          >
            <Network className="w-4 h-4 transition" />
          </button>
        )}

        {/* Agenten Queries & Request Logs Inspector Button */}
        {onOpenAgentInspector && (
          <button
            id="tour-agent-queries-btn"
            onClick={() => onOpenAgentInspector(currentAgent?.id)}
            title="Agenten-Queries & REQ Log"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-cyan-400/50 text-cyan-300 bg-cyan-950/60 hover:bg-cyan-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            }`}
          >
            <FileText className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-ping" />
            )}
          </button>
        )}

        {/* Quantum Web Browser Button */}
        {onOpenWebBrowser && (
          <button
            onClick={onOpenWebBrowser}
            title="Web Browser & AI Assistant"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-cyan-500/40 text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            }`}
          >
            <Compass className="w-4 h-4 transition group-hover:rotate-45" />
          </button>
        )}

        {/* Apps & Agent-Verknüpfung Manager Button */}
        {onOpenAppToolManager && (
          <button
            onClick={onOpenAppToolManager}
            title="Apps & Funktionen verwalten und mit Agenten verknüpfen (z.B. Browser zu N.E.O.)"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-purple-500/50 bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60"
                : "border-cyan-400/60 text-cyan-300 bg-cyan-950/60 hover:bg-cyan-500/30 hover:border-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.3)]"
            }`}
          >
            <span className="text-sm leading-none">🧩</span>
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-ping" />
            )}
          </button>
        )}

        {/* App Store & Integrations Marketplace Button */}
        {onOpenAppStore && (
          <button
            id="tour-app-store"
            onClick={onOpenAppStore}
            title="App Store & Integrationen"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-amber-500/50 text-amber-300 bg-amber-500/15 hover:bg-amber-500/30 hover:border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.3)]"
            }`}
          >
            <Zap className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
            )}
          </button>
        )}

        {/* Daily Objectives Button */}
        {onOpenDailyObjectives && (
          <button
            id="tour-daily-objectives-btn"
            onClick={onOpenDailyObjectives}
            title="Tagesziele // 3 Kernfokusse"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 group relative ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-cyan-400/60 text-cyan-300 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-blue-500/30 hover:bg-cyan-500/40 hover:border-cyan-300 shadow-[0_0_16px_rgba(0,240,255,0.4)]"
            }`}
          >
            <Target className="w-4 h-4 transition" />
            {!isModern && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-ping" />
            )}
          </button>
        )}

        {/* Workspace Layout Editor Mode Button */}
        {onToggleEditMode && (
          <button
            id="tour-nav-layout-btn"
            onClick={onToggleEditMode}
            title="Workspace Layout Editor"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-150 relative group ${
              isModern
                ? isEditMode
                  ? "border-purple-500/50 bg-purple-950/30 text-purple-400 font-bold"
                  : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : isEditMode
                ? "border-cyan-400 text-cyan-200 bg-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse"
                : "border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/5"
            }`}
          >
            <LayoutGrid className="w-4 h-4 transition" />
          </button>
        )}

        {/* Dual Core / Compare Button */}
        <button
          onClick={onToggleCompare}
          title="Gemini-Vergleich ein/aus"
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer ${
            isModern
              ? compareEnabled
                ? "border-purple-500/50 bg-purple-950/30 text-purple-400 font-bold"
                : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
              : compareEnabled
              ? "border-amber-500/50 text-amber-400 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
              : "border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/5"
          }`}
        >
          <Columns2 className="w-4 h-4" />
        </button>

        {/* Voice Output Mute/Unmute Button */}
        <button
          onClick={onToggleMute}
          title={muted ? "Sprachausgabe: OFF" : "Sprachausgabe: AKTIV"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer ${
            isModern
              ? muted
                ? "border-purple-500/50 bg-purple-950/30 text-purple-400"
                : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
              : muted
              ? "border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10"
              : "border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/5"
          }`}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* RBAC Role & Access Tier Manager Button */}
        {onOpenRoleManager && (
          <button
            onClick={onOpenRoleManager}
            title={`RBAC Rollen-Manager (${userRole})`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : userRole === "SOVEREIGN"
                ? "border-purple-500/50 text-purple-300 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : userRole === "OPERATOR"
                ? "border-amber-500/50 text-amber-300 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "border-cyan-500/50 text-cyan-300 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}

        {/* Language Switcher (DE / EN) */}
        {onToggleLang && (
          <button
            onClick={onToggleLang}
            title={lang === "de" ? "Switch Language to English" : "Sprache auf Deutsch wechseln"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border font-mono text-[10px] font-bold cursor-pointer transition-all duration-150 relative group ${
              isModern
                ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
                : "border-cyan-500/50 text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            }`}
          >
            <Globe className="w-4 h-4 transition" />
            <span
              className={`absolute -top-1 -right-1 px-1 rounded font-black text-[7.5px] ${
                isModern
                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  : "bg-cyan-400 text-slate-950"
              }`}
            >
              {lang.toUpperCase()}
            </span>
          </button>
        )}

        {/* Theme Switcher Button (Modern vs Cyberpunk) */}
        <button
          onClick={toggleTheme}
          title={`Design wechseln: Aktuell ${isModern ? "Modern Syntax" : "Cyberpunk Jarvis"}`}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer ${
            isModern
              ? "border-purple-500/40 text-purple-400 bg-zinc-900 hover:bg-zinc-800 hover:border-purple-500"
              : "border-cyan-500/40 text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
          }`}
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Gemini API Key Settings button */}
        <button
          onClick={onOpenSettings}
          title="Gemini API-Key & Einstellungen"
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer ${
            isModern
              ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
              : "border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/5"
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="flex-1 min-h-[8px]" />

        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-1 pb-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isModern
                ? "bg-emerald-500"
                : "bg-cyan-400 shadow-[0_0_8px_#4ee8ff] animate-pulse"
            }`}
          />
          <span
            className={`font-mono text-[7.5px] tracking-wider ${
              isModern ? "text-zinc-500" : "text-cyan-500/60"
            }`}
          >
            ONLINE
          </span>
        </div>
      </div>
    </>
  );
};
