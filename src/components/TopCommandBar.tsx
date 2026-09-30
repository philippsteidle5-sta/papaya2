import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  ShieldAlert,
  Image as ImageIcon,
  LayoutGrid,
  ChevronDown,
  Globe,
  BarChart3,
  FileText,
  User,
  Palette,
  Video,
  Brain,
  Target,
  Menu,
  Volume2,
  Boxes,
  Compass,
  Monitor,
  MonitorOff,
  Mic,
  Smartphone,
} from "lucide-react";
import { AgentConfig, CommunicationScope } from "../types";
import { AgentSpeechAnimation } from "./AgentSpeechAnimation";
import { ParticleVoiceOrb } from "./ParticleVoiceOrb";
import { getDailyUsageMetrics, DailyUsageMetrics } from "../utils/dailyUsageStore";
import { getCurrentUserEmail } from "../utils/leadDatabase";
import { useTheme } from "../utils/themeStore";
import { HeaderAudioToggle } from "./HeaderAudioToggle";
import { PWAInstallButton } from "./PWAInstallButton";

interface TopCommandBarProps {
  currentAgent: AgentConfig;
  state: string;
  isLoading: boolean;
  isFocusMode: boolean;
  hasPromoHeader: boolean;
  communicationScope: CommunicationScope;
  onSelectCommunicationScope: (scope: CommunicationScope) => void;
  onOpenConstellation: () => void;
  onOpenVoiceConference: () => void;
  onOpenAgentSyncSynthesis?: () => void;
  onOpenTheBig3Modal: () => void;
  onToggleMic: () => void;
  statusLabel: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  apiLoadPercentage: number;
  isQuotaExhausted: boolean;
  timeStr: string;
  onOpenGallery: () => void;
  galleryCount: number;
  onOpenRewardProgram: () => void;
  onOpenAdminDatabase: () => void;
  onOpenConversionAnalytics?: () => void;
  isAdminUser: boolean;
  onOpenTutorial: () => void;
  onOpenDailyUsage?: () => void;
  onOpenAgentInspector?: (agentId?: string) => void;
  onOpenAgentFleetStudio?: () => void;
  onOpenVeoStudio?: () => void;
  onOpenUserTerminal?: (tab?: "overview" | "subscription" | "payment" | "invoices" | "security") => void;
  onOpenLandingPage?: () => void;
  onOpenMaintenanceMode?: () => void;
  onOpenPricing?: () => void;
  onOpenOsirisIntel?: () => void;
  compareEnabled?: boolean;
  activeHologram?: any;
  onOpenHologram?: () => void;
  onOpenAppToolManager?: (agentId?: string) => void;
  isScreenSharing?: boolean;
  onToggleScreenShare?: () => void;
  onOpenNeoSpeak?: () => void;
  onOpenMobileVoice?: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  currentAgent,
  state,
  isLoading,
  isFocusMode,
  hasPromoHeader,
  communicationScope,
  onSelectCommunicationScope,
  onOpenConstellation,
  onOpenVoiceConference,
  onOpenAgentSyncSynthesis,
  onOpenTheBig3Modal,
  onToggleMic,
  statusLabel,
  isEditMode,
  onToggleEditMode,
  apiLoadPercentage,
  isQuotaExhausted,
  timeStr,
  onOpenGallery,
  galleryCount,
  onOpenRewardProgram,
  onOpenAdminDatabase,
  onOpenConversionAnalytics,
  isAdminUser,
  onOpenTutorial,
  onOpenDailyUsage,
  onOpenAgentInspector,
  onOpenAgentFleetStudio,
  onOpenVeoStudio,
  onOpenUserTerminal,
  onOpenLandingPage,
  onOpenMaintenanceMode,
  onOpenPricing,
  onOpenOsirisIntel,
  onOpenAppToolManager,
  isScreenSharing = false,
  onToggleScreenShare,
  onOpenNeoSpeak,
  onOpenMobileVoice,
}) => {
  const { toggleTheme, setTheme, isModern } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [usageMetrics, setUsageMetrics] = useState<DailyUsageMetrics | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const refreshMetrics = useCallback(() => {
    try {
      const email = getCurrentUserEmail();
      setUsageMetrics(getDailyUsageMetrics(email));
    } catch {
      // Safe fallback
    }
  }, []);

  useEffect(() => {
    refreshMetrics();
    const handleUpdate = () => refreshMetrics();
    window.addEventListener("syntax_daily_usage_updated", handleUpdate);
    window.addEventListener("syntax_auth_state_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("syntax_daily_usage_updated", handleUpdate);
      window.removeEventListener("syntax_auth_state_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [isLoading, state, refreshMetrics]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isListening = state === "listening";
  const isSpeaking = state === "speaking" || isLoading;

  const agentColor = currentAgent?.color || "#a855f7";

  return (
    <header
      id="syntax-top-command-bar"
      className={`fixed ${
        hasPromoHeader ? "top-11" : "top-0"
      } left-0 right-0 z-40 h-13 backdrop-blur-2xl border-b px-3 sm:px-5 flex items-center justify-between gap-2 select-none transition-all duration-300 ${
        isModern
          ? "bg-[#0c0c0f]/95 border-zinc-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-zinc-100"
          : "bg-slate-950/90 border-cyan-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.6)] text-[#d9f4ff]"
      } ${
        isFocusMode ? "opacity-0 pointer-events-none filter blur-sm" : "opacity-100"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. LEFT: Clean Brand & Active Core Pill                                   */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-3 pl-10 lg:pl-12 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenConstellation} title="PapayaOS.ai Cores Matrix">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 animate-pulse shadow-[0_0_10px_rgba(255,107,53,0.9)]" />
          <span className="font-display font-black text-sm tracking-[2px] bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
            PAPAYA<span className="text-[11px] font-mono text-orange-400 font-bold ml-0.5">OS.ai</span>
          </span>
        </div>

        {/* Separator */}
        <span className="text-zinc-700 hidden sm:inline">/</span>

        {/* Active Agent Badge - Clean & Interactive */}
        <button
          onClick={onOpenConstellation}
          title={`Aktiver Core: ${currentAgent?.name || "Neo"} — Klicke um Matrix & Agenten zu wechseln`}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
            isModern
              ? "bg-zinc-900/90 border-zinc-800 hover:border-purple-500/60 text-zinc-200 hover:text-white shadow-sm"
              : "bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 text-cyan-200 hover:text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          }`}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: agentColor, boxShadow: `0 0 8px ${agentColor}` }}
          />
          <span className="tracking-wide">{currentAgent?.short || "NEO"}</span>
          <AgentSpeechAnimation
            agentColor={agentColor}
            isSpeaking={isSpeaking}
            isListening={isListening}
            size="sm"
          />
          <ChevronDown className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTER: Hero Apps & Tools Button + Minimal Scope Controller            */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl mx-auto">
        {/* HERO: Apps & Tools Modular Hub Button */}
        {onOpenAppToolManager && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenAppToolManager(currentAgent?.id)}
            title="Apps & Tools verwalten und mit Agenten verknüpfen"
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border font-mono text-xs font-black tracking-wide cursor-pointer transition shadow-md ${
              isModern
                ? "bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/50 shadow-[0_0_16px_rgba(168,85,247,0.35)]"
                : "bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/60 shadow-[0_0_18px_rgba(0,240,255,0.4)]"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>APPS & TOOLS</span>
            <span className="hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded bg-black/40 border border-white/20 text-white/90">
              MODULAR
            </span>
          </motion.button>
        )}

        {/* Minimal Clean Scope Controller */}
        <div
          className={`flex items-center p-0.5 rounded-xl border backdrop-blur-md ${
            isModern
              ? "bg-zinc-900/90 border-zinc-800"
              : "bg-slate-900/90 border-cyan-500/30"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelectCommunicationScope("SINGLE")}
            title={`Nur mit ${currentAgent?.name || "aktuellem Agenten"} kommunizieren`}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition cursor-pointer ${
              communicationScope === "SINGLE"
                ? isModern
                  ? "bg-zinc-100 text-zinc-950 font-black shadow-sm"
                  : "bg-cyan-400 text-slate-950 font-black shadow-[0_0_10px_rgba(0,240,255,0.6)]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            SOLO ({currentAgent?.short || "AGENT"})
          </button>

          <button
            type="button"
            onClick={() => onSelectCommunicationScope("ALL")}
            title="Gleichzeitig an alle 8 Cores senden"
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition cursor-pointer flex items-center gap-1 ${
              communicationScope === "ALL"
                ? isModern
                  ? "bg-purple-600 text-white font-black shadow-sm"
                  : "bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.7)]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>8-CORE BROADCAST</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5. CENTER: NEO SPEAK MODUS (Permanent Quantum Assembly Voice Orbit HUD) */}
      {/* ========================================================================= */}
      {onOpenNeoSpeak && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenNeoSpeak}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/70 bg-gradient-to-r from-purple-950/90 via-violet-900/85 to-purple-950/90 text-purple-100 shadow-[0_0_16px_rgba(168,85,247,0.45)] hover:border-purple-400 hover:shadow-[0_0_24px_rgba(168,85,247,0.75)] transition cursor-pointer font-mono text-[10px] font-black tracking-wider flex-shrink-0"
          title="NEO Speak Modus öffnen (Quantum Assembly Sprachsystem & Dauerhaftes Live-Zuhören)"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-purple-300">NEO</span>
          <span className="text-white">SPEAK MODUS</span>
        </motion.button>
      )}

      {/* ========================================================================= */}
      {/* 3. RIGHT: Voice Mic + Audio Toggle + Unified System Dropdown              */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Compact Push-To-Talk Voice Mic */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggleMic}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border cursor-pointer transition font-mono text-[10px] font-bold ${
            isListening
              ? "bg-red-950/70 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              : isSpeaking
              ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              : isModern
              ? "bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
              : "bg-slate-900/80 border-cyan-500/30 text-cyan-200 hover:border-cyan-400"
          }`}
          title="Push-to-Talk Sprachsteuerung aktivieren"
        >
          <ParticleVoiceOrb
            bare
            size={18}
            type="custom"
            primaryColor={isListening ? "#ef4444" : isSpeaking ? "#facc15" : (isModern ? "#a855f7" : agentColor)}
            intensity={isListening ? 0.8 : isSpeaking ? 0.7 : 0.2}
            isLive={isListening || isSpeaking}
            state={isListening ? "listening" : isSpeaking ? "speaking" : "idle"}
          />
          <span className="hidden md:inline">
            {isListening ? "HÖRT ZU..." : isSpeaking ? "ANTWORTET..." : "SPRECHEN"}
          </span>
        </motion.button>

        {/* Audio Output Mute / Unmute */}
        <HeaderAudioToggle isModern={isModern} />

        {/* Dedicated Handy Sprach-Interface Button */}
        {onOpenMobileVoice && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenMobileVoice}
            className={`px-2.5 py-1.5 rounded-xl border font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_15px_rgba(236,72,153,0.3)] ${
              isModern
                ? "border-pink-500/50 bg-gradient-to-r from-pink-950/70 to-purple-950/70 text-pink-200 hover:border-pink-400"
                : "border-pink-500/60 bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-cyan-950/80 text-pink-200 hover:border-pink-300"
            }`}
            title="Handy Sprach-Interface mit 3D-Partikelkugel öffnen"
          >
            <Mic className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span className="hidden sm:inline">HANDY-SPRACHE</span>
          </motion.button>
        )}

        {/* PWA App Install Button */}
        <PWAInstallButton variant="badge" className="hidden sm:inline-flex" />

        {/* Live Screen Perception / Screenshare Button */}
        {onToggleScreenShare && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleScreenShare}
            className={`px-2.5 py-1.5 rounded-xl border font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              isScreenSharing
                ? "border-emerald-400 bg-emerald-500/25 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
                : isModern
                ? "border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-cyan-500/60 hover:text-cyan-300 hover:bg-zinc-800"
                : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300"
            }`}
            title={isScreenSharing ? "Bildschirm-Freigabe stoppen" : "Bildschirm teilen & Live-Vision KI aktivieren"}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {isScreenSharing ? "BILDSCHIRM AN" : "BILDSCHIRM"}
            </span>
          </motion.button>
        )}

        {/* Unified SYSTEM & TOOLS Menu Dropdown (Replaces 12 scattered buttons!) */}
        <div className="relative" ref={menuRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`px-2.5 py-1.5 rounded-xl border font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              isMenuOpen
                ? isModern
                  ? "border-purple-500 bg-zinc-800 text-white shadow-sm"
                  : "border-cyan-400 bg-cyan-500/30 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : isModern
                ? "border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-zinc-700 hover:text-white"
                : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-cyan-500/50 hover:text-white"
            }`}
            title="System-Menü öffnen (Konferenz, Theme, Pricing, Layout, Admin)"
          >
            <Menu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MENÜ</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
          </motion.button>

          {/* Clean Organized Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-72 rounded-2xl border backdrop-blur-2xl p-2 z-50 flex flex-col gap-1 max-h-[82vh] overflow-y-auto custom-scrollbar ${
                  isModern
                    ? "bg-[#121217]/98 border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-zinc-100"
                    : "bg-slate-950/98 border-cyan-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,240,255,0.2)] text-[#d9f4ff]"
                }`}
              >
                {/* Section 1: Design Switcher */}
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span className="text-[11px] font-mono font-bold">Design Theme</span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10 font-mono text-[9px]">
                    <button
                      onClick={() => setTheme("syntax")}
                      className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
                        isModern ? "bg-purple-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      MODERN
                    </button>
                    <button
                      onClick={() => setTheme("cyberpunk")}
                      className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
                        !isModern ? "bg-cyan-500 text-slate-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      CYBERPUNK
                    </button>
                  </div>
                </div>

                {/* Section 2: KI-Studios & Hubs */}
                <div className="px-2 pt-2 pb-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  KI-Studios & Cores
                </div>

                {/* Bildschirm teilen & Live-Vision */}
                {onToggleScreenShare && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleScreenShare();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                  >
                    {isScreenSharing ? (
                      <MonitorOff className="w-4 h-4 text-emerald-400 animate-pulse" />
                    ) : (
                      <Monitor className="w-4 h-4 text-cyan-400" />
                    )}
                    <div>
                      <div className="text-[11px] font-bold flex items-center gap-1.5">
                        <span>🖥️ Screen-Perception (Live-Vision)</span>
                        {isScreenSharing && (
                          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[8px]">
                            AKTIV
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-zinc-400">
                        {isScreenSharing ? "Freigabe beenden" : "Bildschirm für KI-Analyse & Co-Pilot teilen"}
                      </div>
                    </div>
                  </button>
                )}

                {/* Sprachkonferenz */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenVoiceConference();
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-[11px] font-bold">🎙️ 8-Core Sprachkonferenz</div>
                    <div className="text-[9px] text-zinc-400">Live-Audio-Diskussion mit allen Spezialisten</div>
                  </div>
                </button>

                {/* Veo Studio */}
                {onOpenVeoStudio && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenVeoStudio();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                  >
                    <Video className="w-4 h-4 text-pink-400" />
                    <div>
                      <div className="text-[11px] font-bold">🎬 Google Veo 3.1 AI Studio</div>
                      <div className="text-[9px] text-zinc-400">Cinematic 8K Video Synthese</div>
                    </div>
                  </button>
                )}

                {/* Fleet Studio */}
                {onOpenAgentFleetStudio && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAgentFleetStudio();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[11px] font-bold">⚡ Agent Fleet Studio</div>
                      <div className="text-[9px] text-zinc-400">Alle 9 Cores ansehen, steuern & testen</div>
                    </div>
                  </button>
                )}

                {/* Memory Inspector */}
                {onOpenAgentInspector && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAgentInspector(currentAgent?.id);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                  >
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-[11px] font-bold">🧠 Agent Memory & Inspector</div>
                      <div className="text-[9px] text-zinc-400">Prompts, CoT & REQ Logs prüfen</div>
                    </div>
                  </button>
                )}

                {/* Section 3: Workspace & Layout */}
                <div className="px-2 pt-2 pb-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  Workspace
                </div>

                {/* Layout Editor */}
                {onToggleEditMode && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleEditMode();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                  >
                    <LayoutGrid className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-[11px] font-bold">
                        {isEditMode ? "Layout sperren (Fertig)" : "🎛️ Workspace Layout anpassen"}
                      </div>
                      <div className="text-[9px] text-zinc-400">Widgets verschieben, skalieren & speichern</div>
                    </div>
                  </button>
                )}

                {/* Galerie */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenGallery();
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[11px] font-bold">🖼️ Holo & Foto Galerie</div>
                    <div className="text-[9px] text-zinc-400">{galleryCount} gespeicherte Bilder</div>
                  </div>
                </button>

                {/* Section 4: Account & Pricing */}
                <div className="px-2 pt-2 pb-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  Account & Zugang
                </div>

                {/* Pricing / 29€ Access */}
                {onOpenPricing && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenPricing();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left text-purple-200"
                  >
                    <Zap className="w-4 h-4 text-cyan-300" />
                    <div>
                      <div className="text-[11px] font-black text-white">⚡ 8-Core Matrix Access (29€)</div>
                      <div className="text-[9px] text-zinc-300">Unbegrenzte KI-Leistung & Features</div>
                    </div>
                  </button>
                )}

                {/* Sales Page */}
                {onOpenLandingPage && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenLandingPage();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <div>
                      <div className="text-[11px] font-bold">🚀 Offizielle Sales Page</div>
                      <div className="text-[9px] text-zinc-400">7-Tage VIP Key & System-Features</div>
                    </div>
                  </button>
                )}

                {/* User Terminal */}
                {onOpenUserTerminal && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenUserTerminal("overview");
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[11px] font-bold">👤 User Terminal & Abo</div>
                      <div className="text-[9px] text-zinc-400">Rechnungen, Zahlungsmittel & Profil</div>
                    </div>
                  </button>
                )}

                {/* Section 5: Admin (if admin) */}
                {isAdminUser && (
                  <>
                    <div className="px-2 pt-2 pb-1 text-[9px] font-mono uppercase tracking-widest text-red-400">
                      Admin Tools
                    </div>

                    {onOpenAdminDatabase && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenAdminDatabase();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left text-red-200"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        <div>
                          <div className="text-[11px] font-bold">Admin Live Database</div>
                          <div className="text-[9px] text-zinc-400">Leads, User & Logs</div>
                        </div>
                      </button>
                    )}

                    {onOpenConversionAnalytics && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenConversionAnalytics();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                      >
                        <Target className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-[11px] font-bold">Conversion & Live Radar</div>
                          <div className="text-[9px] text-zinc-400">Funnel & User Flow Telemetrie</div>
                        </div>
                      </button>
                    )}

                    {onOpenOsirisIntel && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenOsirisIntel();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-mono font-bold flex items-center gap-2.5 cursor-pointer transition text-left"
                      >
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="text-[11px] font-bold">OSIRIS Global Intelligence</div>
                          <div className="text-[9px] text-zinc-400">Flight Tracker & Cyber Radar</div>
                        </div>
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimal Clock */}
        <span className="font-mono text-[10px] text-zinc-500 tracking-wider hidden xl:block">
          {timeStr || "--:--"}
        </span>
      </div>
    </header>
  );
};
