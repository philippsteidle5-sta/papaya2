import React, { useState, useEffect } from "react";
import { extractImageFromPasteEvent, extractImagesFromPasteEvent } from "../utils/pasteImage";
import { compressImage, compressImages } from "../utils/compressImage";
import { ChatApiConnector } from "./ChatApiConnector";
import {
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  Sparkles,
  LayoutGrid,
  Radio,
  Sliders,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Terminal,
  Layers,
  Search,
  Lock,
  Key,
  Send,
  Mic,
  Camera,
  Image as ImageIcon,
  Images,
  Volume2,
  X,
  TrendingUp,
  Globe,
  Settings,
  Mail,
  Gift,
  ListFilter,
  CheckCircle2,
  Clock,
  Shield,
  Clapperboard,
  BarChart3,
  Palette,
  Play,
  Film,
  Target,
  CalendarDays,
  Share2,
  Brain,
} from "lucide-react";
import { isVideoUrl } from "../utils/mediaUtils";
import { AgentConfig, Message, CommunicationScope } from "../types";
import { ActiveWidgetsConfig } from "./WorkspaceLayoutEditor";
import { UserRole, isAgentAllowed, ROLE_TIER_DETAILS, UserProfile } from "../rbac";
import {
  isSuperAdminEmail,
  isStoredAdminAuthenticated,
  getCurrentUserEmail,
  getActiveAccessKey,
  AccessKeyRecord,
  generateKeyDirectUrl,
} from "../utils/leadDatabase";
import { AgentSpeechAnimation } from "./AgentSpeechAnimation";
import { ChatPanel } from "./ChatPanel";
import { useTheme } from "../utils/themeStore";


export interface SystemEventLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warn" | "agent";
  agentName?: string;
  text: string;
}

interface CommandDashboardLayoutProps {
  viewMode: "dashboard" | "focus";
  onToggleViewMode: (mode: "dashboard" | "focus") => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  rightPanelTab: "chat" | "logs" | "tools";
  onSelectRightPanelTab: (tab: "chat" | "logs" | "tools") => void;
  onChangeRightPanelTab?: (tab: "chat" | "logs" | "tools") => void;
  
  // Agents & Role
  currentAgent: AgentConfig;
  agents: AgentConfig[];
  onSelectAgent: (agent: AgentConfig, dir?: "next" | "prev") => void;
  onSwitchAgent?: (agent: AgentConfig) => void;
  userRole: UserRole;
  userProfile?: UserProfile;
  
  // System metrics
  apiLoadPercentage: number;
  isQuotaExhausted: boolean;
  timeStr: string;
  hasPromoHeader?: boolean;
  
  // Input & Voice
  state: string;
  isLoading: boolean;
  micLevel: number;
  toggleMic: () => void;
  input?: string;
  inputPrompt?: string;
  setInput?: (val: string) => void;
  setInputPrompt?: (val: string) => void;
  handleSendMessage?: (txt?: string) => void;
  handleSendInput?: () => void;
  selectedImage?: string | null;
  selectedImages?: string[];
  onImageSelect?: (file: File) => void;
  onImagesSelect?: (files: FileList | File[]) => void;
  onRemoveImage?: (index: number) => void;
  onClearImage?: () => void;
  setSelectedImage?: (img: string | null) => void;
  isImageMode: boolean;
  setIsImageMode: (val: boolean) => void;
  aspectRatio?: string;
  setAspectRatio?: (v: string) => void;
  imageSize?: string;
  setImageSize?: (v: string) => void;
  liveTranscript?: string;
  setLiveTranscript?: (val: string) => void;
  recognition?: any;
  speechBufferRef?: any;
  setState?: (st: string) => void;
  
  // Chat Panel Props
  messages?: Message[];
  onClearChat?: () => void;
  onOpenSettings: () => void;
  setActiveHologram?: (holo: any) => void;
  activeHologram?: any;
  chatPanelContent?: React.ReactNode;
  
  // Modals & Navigation triggers
  onOpenRoleManager: () => void;
  onOpenRewardProgram: () => void;
  onOpenConstellation: () => void;
  onOpenJarvisTerminalDashboard: () => void;
  onOpenGallery?: () => void;
  onOpenSocialUpload: (platform?: "tiktok" | "instagram") => void;
  onOpenWebBrowser: () => void;
  onOpenAppStore: () => void;
  onOpenGmailInbox: () => void;
  onOpenCalendar?: () => void;
  onOpenObsidianBrain?: () => void;
  onOpenVeoVideoStudio?: () => void;
  onOpenMultiAgentChat?: () => void;
  onOpenLandingPage?: () => void;
  onOpenAdminDatabase?: () => void;
  onOpenConversionAnalytics?: () => void;
  onOpenTutorial?: () => void;
  onOpenKeyWelcomeTour?: () => void;
  onOpenDailyUsage?: () => void;
  onOpenVoiceConference?: () => void;
  onOpenAgentSyncSynthesis?: () => void;
  
  // Multi-Agent Scope Control
  communicationScope?: CommunicationScope;
  onCommunicationScopeChange?: (scope: CommunicationScope) => void;
  
  // Layout customization
  isEditMode: boolean;
  onToggleEditMode: () => void;
  
  // Canvas viewports
  canvasViewport: React.ReactNode;
  
  // System Logs
  eventLogs: SystemEventLog[];
  
  // Captions
  captionWords?: string[];
  captionProgress?: number;
  statusLabel?: string | (() => string);
  
  // API Key Props
  geminiKey?: string;
  onSaveGeminiKey?: (key: string) => void;
  lang?: "de" | "en";

  children?: React.ReactNode;
}

export const CommandDashboardLayout = React.memo<CommandDashboardLayoutProps>(({
  viewMode,
  onToggleViewMode,
  rightPanelOpen,
  onToggleRightPanel,
  rightPanelTab,
  onSelectRightPanelTab,
  onChangeRightPanelTab,
  currentAgent,
  agents,
  onSelectAgent,
  onSwitchAgent,
  userRole,
  userProfile,
  apiLoadPercentage,
  isQuotaExhausted,
  timeStr,
  hasPromoHeader,
  state,
  isLoading,
  micLevel,
  toggleMic,
  input = "",
  inputPrompt = "",
  setInput,
  setInputPrompt,
  handleSendMessage,
  handleSendInput,
  selectedImage,
  selectedImages = [],
  onImageSelect,
  onImagesSelect,
  onRemoveImage,
  onClearImage,
  setSelectedImage,
  isImageMode,
  setIsImageMode,
  liveTranscript = "",
  setLiveTranscript,
  recognition,
  speechBufferRef,
  setState,
  messages = [],
  onClearChat,
  onOpenSettings,
  setActiveHologram,
  chatPanelContent,
  onOpenRoleManager,
  onOpenRewardProgram,
  onOpenConstellation,
  onOpenJarvisTerminalDashboard,
  onOpenGallery,
  onOpenSocialUpload,
  onOpenWebBrowser,
  onOpenAppStore,
  onOpenGmailInbox,
  onOpenCalendar,
  onOpenObsidianBrain,
  onOpenVeoVideoStudio,
  onOpenMultiAgentChat,
  onOpenLandingPage,
  onOpenAdminDatabase,
  onOpenConversionAnalytics,
  onOpenTutorial,
  onOpenKeyWelcomeTour,
  onOpenDailyUsage,
  onOpenVoiceConference,
  onOpenAgentSyncSynthesis,
  communicationScope = "SINGLE",
  onCommunicationScopeChange,
  isEditMode,
  onToggleEditMode,
  canvasViewport,
  eventLogs,
  captionWords = [],
  captionProgress = 0,
  geminiKey,
  onSaveGeminiKey,
  lang = "de",
  children,
}) => {
  const { theme, toggleTheme, setTheme, isModern } = useTheme();
  const [logsFilter, setLogsFilter] = useState<"all" | "info" | "agent">("all");
  const [localInput, setLocalInput] = useState(() => input || inputPrompt || "");

  useEffect(() => {
    const ext = input || inputPrompt || "";
    if (ext !== localInput) {
      setLocalInput(ext);
    }
  }, [input, inputPrompt]);

  const actualInput = localInput;
  const actualSetInput = (val: string) => {
    setLocalInput(val);
    if (setInput) setInput(val);
    if (setInputPrompt) setInputPrompt(val);
  };
  const actualSend = () => {
    const textToSend = localInput;
    setLocalInput("");
    if (handleSendMessage) handleSendMessage(textToSend);
    else if (handleSendInput) handleSendInput();
  };
  const actualSwitchAgent = (ag: AgentConfig) => {
    if (onSelectAgent) onSelectAgent(ag);
    else if (onSwitchAgent) onSwitchAgent(ag);
  };
  const actualSelectTab = (tab: "chat" | "logs" | "tools") => {
    if (onSelectRightPanelTab) onSelectRightPanelTab(tab);
    else if (onChangeRightPanelTab) onChangeRightPanelTab(tab);
  };
  const actualClearImage = () => {
    if (onClearImage) onClearImage();
    else if (setSelectedImage) setSelectedImage(null);
  };
  const actualRemoveImage = (index: number) => {
    if (onRemoveImage) onRemoveImage(index);
    else actualClearImage();
  };

  const effectiveImages = selectedImages && selectedImages.length > 0
    ? selectedImages
    : (selectedImage ? [selectedImage] : []);

  const filteredLogs = eventLogs.filter((log) => {
    if (logsFilter === "info") return log.type === "info" || log.type === "warn" || log.type === "success";
    if (logsFilter === "agent") return log.type === "agent";
    return true;
  });

  const isAllScope = communicationScope === "ALL";
  const isBig3Scope = communicationScope === "THE_BIG_3";
  const isMatrixScope = isAllScope || isBig3Scope;

  const [performanceMode, setPerformanceMode] = useState<"TURBO" | "BALANCED" | "ECO">(() => {
    try {
      return (localStorage.getItem("syntax_perf_mode") as any) || "TURBO";
    } catch {
      return "TURBO";
    }
  });

  // --- LIVE SESSION & REMAINING KEY TIME MONITOR ---
  const [activeKey, setActiveKey] = useState<AccessKeyRecord | null>(() => getActiveAccessKey());
  const [sessionTimeLeft, setSessionTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean } | null>(null);
  const [showSessionDetailModal, setShowSessionDetailModal] = useState<boolean>(false);

  useEffect(() => {
    const checkRemaining = () => {
      const currentKey = getActiveAccessKey();
      setActiveKey(currentKey);

      let targetTime = currentKey ? new Date(currentKey.expiresAt).getTime() : 0;
      if (!targetTime && userProfile?.promoSession?.promoTrialExpiresAt) {
        targetTime = new Date(userProfile.promoSession.promoTrialExpiresAt).getTime();
      }

      if (targetTime > 0) {
        const diffMs = targetTime - Date.now();
        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          setSessionTimeLeft({ hours, minutes, seconds, isExpired: false });
        } else {
          setSessionTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        }
      } else {
        setSessionTimeLeft(null);
      }
    };

    checkRemaining();
    const timer = setInterval(checkRemaining, 1000);
    return () => clearInterval(timer);
  }, [userProfile]);

  const handleSelectPerfMode = (mode: "TURBO" | "BALANCED" | "ECO") => {
    setPerformanceMode(mode);
    try {
      localStorage.setItem("syntax_perf_mode", mode);
    } catch {}
  };

  return (
    <div
      id="command-dashboard-layout"
      className={`w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth flex flex-col transition-colors duration-300 ${
        isModern
          ? "bg-[#09090b] text-zinc-100"
          : isMatrixScope
          ? "bg-[#000000] text-slate-100"
          : "bg-[#03060a] text-slate-100"
      } font-sans select-none relative ${hasPromoHeader && !isMatrixScope ? "pt-11" : ""}`}
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      
      {/* ========================================================================= */}
      {/* TOP SYSTEM CONTROL HEADER & BADGES BAR                                    */}
      {/* ========================================================================= */}
      <header
        className={`snap-start scroll-snap-start h-14 border-b px-4 flex items-center justify-between gap-4 z-40 relative flex-shrink-0 transition-colors duration-300 ${
          isModern
            ? "border-zinc-800 bg-[#111114]/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
            : "border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
        }`}
        style={{ scrollSnapAlign: "start" }}
      >
        
        {/* Brand Logo & Active Core Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg p-[1px] ${
              isModern
                ? "bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-500 shadow-[0_0_12px_rgba(255,107,53,0.4)]"
                : "bg-gradient-to-tr from-orange-600 via-amber-500 to-emerald-500 shadow-[0_0_14px_rgba(255,107,53,0.5)]"
            }`}>
              <div className={`w-full h-full rounded-[7px] flex items-center justify-center ${isModern ? "bg-[#111114]" : "bg-slate-950"}`}>
                <Cpu className={`w-4 h-4 ${isModern ? "text-orange-400" : "text-orange-400 animate-pulse"}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-display font-black text-sm tracking-[2.5px] ${
                  isModern ? "text-zinc-100" : "text-orange-300 drop-shadow-[0_0_8px_rgba(255,107,53,0.5)]"
                }`}>
                  PAPAYA<span className="text-orange-400 font-mono text-xs ml-0.5">OS.ai</span>
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-widest ${
                  isModern
                    ? "bg-orange-950/40 border border-orange-800/50 text-orange-300"
                    : isBig3Scope
                    ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    : isAllScope
                    ? "bg-orange-500/20 border border-orange-400/50 text-orange-300 shadow-[0_0_8px_rgba(255,107,53,0.4)]"
                    : "bg-orange-500/10 border border-orange-500/30 text-orange-400"
                }`}>
                  {isBig3Scope ? "👑 THE BIG 3 ACTIVE" : isAllScope ? "🌐 ALL 8 CORES ACTIVE" : "v4.8 COMMAND"}
                </span>
              </div>
              <span className={`text-[9px] font-mono tracking-wider hidden sm:block ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                {isBig3Scope ? "TRI-CORE QUANTUM NEXUS (PAPAYA • NEO • VEGA)" : "PAPAYA SOVEREIGN INTELLIGENCE SUITE"}
              </span>
            </div>
          </div>

          {!isAllScope && (
            <>
              <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

              {/* Core Selection Pills */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-cyan-500/15">
                {onOpenKeyWelcomeTour && (
                  <>
                    <button
                      id="btn-syntax-3step-tour"
                      onClick={onOpenKeyWelcomeTour}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wider text-amber-200 bg-gradient-to-r from-amber-950/90 to-orange-950/90 border border-amber-400/80 hover:from-amber-500/30 hover:to-orange-500/30 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95"
                      title="3-Schritte Schnellstart-Führung für Key-Nutzer öffnen"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>3-SCHRITTE TOUR</span>
                    </button>
                    <div className="h-3 w-[1px] bg-slate-800" />
                  </>
                )}
                {onOpenTutorial && (
                  <>
                    <button
                      id="btn-syntax-1min-tutorial"
                      onClick={onOpenTutorial}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black tracking-wider text-cyan-200 bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border border-cyan-400/70 hover:from-cyan-500/30 hover:to-indigo-500/30 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:scale-105 active:scale-95"
                      title="1-Minuten System-Einweisung für den Boss öffnen"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                      <span>1-MIN EINWEISUNG</span>
                    </button>
                    <div className="h-3 w-[1px] bg-slate-800" />
                  </>
                )}
                {onOpenLandingPage && (
                  <>
                    <button
                      onClick={onOpenLandingPage}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider text-purple-200 bg-purple-950/60 border border-purple-500/40 hover:bg-purple-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                      title="Offizielle Sales Page (7-Tage VIP Key & 29€ Pro Plan) anzeigen"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>SALES PAGE</span>
                    </button>
                    <div className="h-3 w-[1px] bg-slate-800" />
                  </>
                )}
                {onOpenGallery && (
                  <button
                    onClick={onOpenGallery}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider text-cyan-200 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    title="SYNTAX Foto & Hologramm Galerie öffnen"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
                    <span>GALERIE</span>
                  </button>
                )}
                <div className="h-3 w-[1px] bg-slate-800" />
                <button
                  onClick={onOpenConstellation}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  title="8-Core Matrix Network Viewport"
                >
                  <Activity className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                  <span>8-CORE NETWORK</span>
                </button>
                <div className="h-3 w-[1px] bg-slate-800" />
                <button
                  onClick={onOpenRoleManager}
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/30 transition flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span>{userRole}</span>
                </button>
                <div className="h-3 w-[1px] bg-slate-800" />
                <button
                  onClick={() => setTheme(isModern ? "cyberpunk" : "syntax")}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider transition flex items-center gap-1 cursor-pointer ${
                    isModern
                      ? "bg-zinc-100 text-zinc-950 shadow-sm"
                      : "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  }`}
                  title={isModern ? "Zu Cyberpunk Quantum HUD wechseln" : "Zu Modern Enterprise SaaS wechseln"}
                >
                  {isModern ? <Sparkles className="w-3 h-3 text-purple-600" /> : <Zap className="w-3 h-3 text-cyan-400 fill-slate-950" />}
                  <span>{isModern ? "MODERN" : "CYBERPUNK"}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* System Status Badges (Performance Mode, Kopplung, Quantum Encryption, API Load) */}
        {!isAllScope && (
          <div id="tour-status-badges" className="hidden md:flex items-center gap-2.5 font-mono text-xs">
            
            {/* Badge 1: Performance Mode Selector (ECO • BALANCED • TURBO) */}
            <div
              id="tour-performance-mode"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              title="Performance Mode Switcher: TURBO (<35ms), BALANCED (85ms), ECO (150ms)"
            >
              <Zap className={`w-3.5 h-3.5 ${performanceMode === "TURBO" ? "text-amber-400 animate-pulse drop-shadow-[0_0_6px_#f59e0b]" : performanceMode === "BALANCED" ? "text-cyan-400" : "text-emerald-400"}`} />
              <div className="flex items-center gap-1 font-mono text-[9.5px] font-bold">
                <button
                  type="button"
                  onClick={() => handleSelectPerfMode("ECO")}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${performanceMode === "ECO" ? "bg-emerald-500/30 text-emerald-300 font-black border border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "text-slate-400 hover:text-slate-200"}`}
                >
                  ECO
                </button>
                <span className="text-slate-600">/</span>
                <button
                  type="button"
                  onClick={() => handleSelectPerfMode("BALANCED")}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${performanceMode === "BALANCED" ? "bg-cyan-500/30 text-cyan-200 font-black border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]" : "text-slate-400 hover:text-slate-200"}`}
                >
                  BALANCED
                </button>
                <span className="text-slate-600">/</span>
                <button
                  type="button"
                  onClick={() => handleSelectPerfMode("TURBO")}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${performanceMode === "TURBO" ? "bg-amber-500/30 text-amber-300 font-black border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" : "text-slate-400 hover:text-slate-200"}`}
                >
                  TURBO
                </button>
              </div>
              <span className="text-[8.5px] font-mono px-1 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/30 font-semibold hidden lg:inline">
                {performanceMode === "TURBO" ? "<35ms" : performanceMode === "BALANCED" ? "<85ms" : "<150ms"}
              </span>
            </div>

            {/* Badge 2: Kopplung 100% */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider">KOPPLUNG: 100%</span>
            </div>

            {/* Badge 3: Encryption Quantum 4096-bit */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-indigo-500/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">4096-BIT</span>
            </div>

            {/* Badge 4: API Load Bar */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border text-[10px] font-bold ${
                isQuotaExhausted
                  ? "border-red-500/60 text-red-400 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                  : apiLoadPercentage > 80
                  ? "border-amber-500/50 text-amber-300"
                  : "border-cyan-500/30 text-cyan-300"
              }`}
              title={`Aktuelle API Belastung: ${apiLoadPercentage}%`}
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>API: {isQuotaExhausted ? "0% (LIMIT)" : `${apiLoadPercentage}%`}</span>
              <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    isQuotaExhausted ? "w-0 bg-red-500" : apiLoadPercentage > 80 ? "bg-amber-400" : "bg-cyan-400"
                  }`}
                  style={{ width: `${isQuotaExhausted ? 0 : apiLoadPercentage}%` }}
                />
              </div>
            </div>

            {/* Badge 5: Live Key & Session Countdown Badge (e.g. 🔑 Key: otto • 23h 42m verbleibend) */}
            {sessionTimeLeft && (
              <button
                onClick={() => setShowSessionDetailModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-[10.5px] font-bold transition cursor-pointer border shadow-[0_0_15px_rgba(78,232,255,0.3)] hover:scale-105 active:scale-95 ${
                  sessionTimeLeft.isExpired
                    ? "bg-rose-950/90 border-rose-500/70 text-rose-300 animate-pulse"
                    : sessionTimeLeft.hours < 2
                    ? "bg-amber-950/90 border-amber-500/70 text-amber-300 animate-pulse"
                    : "bg-emerald-950/90 border-emerald-500/60 text-emerald-300"
                }`}
                title="Klicken für Session-Details, 1-Klick-Link & Restzeit"
              >
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono tracking-tight">
                  🔑 Key: <strong className="text-white font-bold">{activeKey ? activeKey.key : "otto"}</strong> •{" "}
                  {sessionTimeLeft.isExpired
                    ? "ABGELAUFEN"
                    : `${sessionTimeLeft.hours}h ${sessionTimeLeft.minutes}m verbleibend`}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              </button>
            )}
          </div>
        )}

        {/* View Mode Switcher & Control Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Mobile / Tablet Compact Key Badge */}
          {sessionTimeLeft && (
            <button
              onClick={() => setShowSessionDetailModal(true)}
              className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9.5px] font-mono font-bold"
              title="Key Session Status"
            >
              <Key className="w-3 h-3 text-emerald-400" />
              <span>{activeKey ? activeKey.key : "otto"}: {sessionTimeLeft.hours}h {sessionTimeLeft.minutes}m</span>
            </button>
          )}
          
          {/* Admin Database & Leads Control Button (Exclusively for authenticated root admin) */}
          {onOpenAdminDatabase && isStoredAdminAuthenticated() && (
            <button
              onClick={onOpenAdminDatabase}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-600 text-cyan-200 hover:text-slate-950 border border-cyan-400 font-mono text-[10.5px] font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] active:scale-95"
              title="Admin Database & Lead-Verwaltung öffnen"
            >
              <Key className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">ADMIN-PANEL</span>
            </button>
          )}

          {/* Conversion & Live User Radar (Exclusively for authenticated root admin) */}
          {onOpenConversionAnalytics && isStoredAdminAuthenticated() && (
            <button
              onClick={onOpenConversionAnalytics}
              className="px-3 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-400 font-mono text-[10.5px] font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] active:scale-95"
              title="Live Conversion & Traffic Radar öffnen"
            >
              <Target className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">CONVERSION-RADAR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </button>
          )}

          {/* 8-Core Live-Sprachkonferenz Trigger Button */}
          {onOpenVoiceConference && (
            <button
              onClick={onOpenVoiceConference}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/90 via-indigo-950/90 to-purple-950/90 hover:from-cyan-500 hover:to-purple-600 text-cyan-200 hover:text-slate-950 border border-cyan-400 font-mono text-[10.5px] font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] active:scale-95"
              title="8-Core Live-Sprachkonferenz (Multi-Agent Voice Room) starten"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden md:inline">8-CORE KONFERENZ</span>
            </button>
          )}

          {/* Agent-Sync Synthesizer Modal Button */}
          {onOpenAgentSyncSynthesis && (
            <button
              onClick={onOpenAgentSyncSynthesis}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/70 font-mono text-[10.5px] font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] active:scale-95"
              title="Agent-Sync Synthesizer Fenster öffnen"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">AGENT-SYNC</span>
            </button>
          )}

          {/* Average Daily Usage Dashboard Trigger */}
          {onOpenDailyUsage && (
            <button
              onClick={onOpenDailyUsage}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-500 text-cyan-200 hover:text-slate-950 border border-cyan-400/80 font-mono text-[10.5px] font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] active:scale-95"
              title="Average Daily Usage Dashboard (Tokens, Compute-Zeit & Quota)"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Ø USAGE</span>
            </button>
          )}

          {/* Always Visible SaaS Sales Page Button */}
          {onOpenLandingPage && (
            <button
              onClick={onOpenLandingPage}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 hover:from-purple-600 hover:to-cyan-500 text-white border border-purple-400 font-mono text-[10.5px] font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] active:scale-95"
              title="Offizielle S.Y.N.T.A.X. Sales Page (7-Tage VIP Key & 29€ Pro Plan) öffnen"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>SALES PAGE</span>
            </button>
          )}

          {/* Theme Switcher Button (Modern vs Cyberpunk) */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl border font-mono text-[10.5px] font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
              isModern
                ? "border-purple-500/40 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-purple-500"
                : "border-cyan-400/60 bg-cyan-950/80 text-cyan-200 hover:bg-cyan-900 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            }`}
            title={`Design-Stil wechseln: Aktuell ist ${isModern ? "Modern Syntax" : "Cyberpunk Jarvis"}`}
          >
            <Palette className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-300"}`} />
            <span className="hidden sm:inline">{isModern ? "MODERN" : "CYBERPUNK"}</span>
          </button>

          {/* Dual-Mode Toggle Button */}
          <div className={`flex items-center p-0.5 rounded-xl border shadow-inner ${
            isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-900 border-cyan-500/30"
          }`}>
            <button
              onClick={() => onToggleViewMode("dashboard")}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "dashboard"
                  ? isModern
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  : isModern
                  ? "text-zinc-400 hover:text-zinc-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">COMMAND DASHBOARD</span>
            </button>
            <button
              onClick={() => onToggleViewMode("focus")}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "focus"
                  ? isModern
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  : isModern
                  ? "text-zinc-400 hover:text-zinc-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">FOCUS CANVAS</span>
            </button>
          </div>

          {!isAllScope && (
            <button
              onClick={onOpenRewardProgram}
              className="px-2.5 py-1 rounded-lg border border-amber-400/60 bg-amber-500/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
              title="40 Challenges für 1 Monat Gratis ABO"
            >
              <Gift className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xl:inline">FREE ABO</span>
            </button>
          )}

          {/* Layout Edit Toggle */}
          <button
            id="tour-layout-editor"
            onClick={onToggleEditMode}
            className={`p-1.5 rounded-lg border font-mono text-xs cursor-pointer transition ${
              isEditMode
                ? "border-cyan-400 bg-cyan-400 text-slate-950 animate-pulse shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40"
            }`}
            title="Workspace Layout Anpassen"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN 3-COLUMN DASHBOARD GRID CONTENT                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: COLLAPSIBLE SLIM GLASSMORPHISM NAV RAIL                   */}
        {/* ----------------------------------------------------------------------- */}
        {!isAllScope && (
          <aside className="w-[64px] border-r border-cyan-500/15 bg-slate-950/80 backdrop-blur-2xl flex flex-col items-center justify-between py-3 z-30 flex-shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.4)]">
            
            {/* Tool Navigation Icons */}
            <div className="flex flex-col items-center gap-3.5 w-full">
              {/* 8-Core Live Sprachkonferenz Multi-Agent Voice Room */}
              {onOpenVoiceConference && (
                <button
                  onClick={onOpenVoiceConference}
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-950 via-indigo-950 to-purple-950 border border-cyan-400 hover:border-cyan-300 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center transition cursor-pointer group relative shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  title="8-Core Live-Sprachkonferenz (Multi-Agent Voice Room)"
                >
                  <Volume2 className="w-5 h-5 group-hover:scale-110 transition duration-300 text-cyan-300 animate-pulse" />
                  <span className="absolute left-14 bg-slate-900 border border-cyan-400 text-cyan-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-xl flex items-center gap-1">
                    <span>🎙️ 8-CORE SPRACHKONFERENZ</span>
                  </span>
                </button>
              )}

              {/* Agent-Sync Multi-Agent Synthesizer */}
              {onOpenAgentSyncSynthesis && (
                <button
                  onClick={onOpenAgentSyncSynthesis}
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/20 text-cyan-300 flex items-center justify-center transition cursor-pointer group relative shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  title="Agent-Sync Synthesizer Matrix"
                >
                  <Zap className="w-5 h-5 group-hover:scale-110 transition duration-300 text-cyan-400" />
                  <span className="absolute left-14 bg-slate-900 border border-cyan-400 text-cyan-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-xl flex items-center gap-1">
                    <span>⚡ AGENT-SYNC SYNTHESE</span>
                  </span>
                </button>
              )}

              {/* Multi-Agent Fullscreen Chat Room */}
              {onOpenMultiAgentChat && (
                <button
                  onClick={onOpenMultiAgentChat}
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/20 text-cyan-300 flex items-center justify-center transition cursor-pointer group relative shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  title="Multi-Agenten Chatraum (Vollbild)"
                >
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition duration-300 text-cyan-300" />
                  <span className="absolute left-14 bg-slate-900 border border-cyan-400 text-cyan-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-xl flex items-center gap-1">
                    <span>💬 MULTI-AGENT CHAT</span>
                  </span>
                </button>
              )}

              {/* 8-Core Network Constellation */}
              <button
                onClick={onOpenConstellation}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 text-cyan-300 flex items-center justify-center transition cursor-pointer group relative"
                title="8-Core Matrix Visualizer"
              >
                <Activity className="w-5 h-5 group-hover:scale-110 transition duration-300" />
                <span className="absolute left-14 bg-slate-900 border border-cyan-400 text-cyan-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                  8-CORE MATRIX
                </span>
              </button>

              {/* TikTok / Social Upload */}
              <button
                onClick={() => onOpenSocialUpload("tiktok")}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 text-purple-300 flex items-center justify-center transition cursor-pointer group relative"
                title="TikTok Studio & Video Synthesizer"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition duration-300 text-purple-400" />
                <span className="absolute left-14 bg-slate-900 border border-purple-400 text-purple-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                  TIKTOK STUDIO
                </span>
              </button>

              {/* Veo 3.1 AI Video Studio */}
              {onOpenVeoVideoStudio && (
                <button
                  onClick={onOpenVeoVideoStudio}
                  className="w-10 h-10 rounded-xl bg-purple-950/90 border border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/30 text-pink-300 flex items-center justify-center transition cursor-pointer group relative shadow-lg shadow-purple-900/40 animate-pulse"
                  title="Veo 3.1 AI Video Studio (Exklusiv P.U.L.S.E.)"
                >
                  <Clapperboard className="w-5 h-5 group-hover:scale-110 transition duration-300 text-pink-400" />
                  <span className="absolute left-14 bg-slate-900 border border-pink-400 text-pink-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 flex items-center gap-1">
                    <span>🎬 VEO 3.1 VIDEO STUDIO</span>
                    <span className="px-1 py-0.2 rounded bg-purple-500/30 text-[8px]">P.U.L.S.E.</span>
                  </span>
                </button>
              )}

              {/* Claude IDE Terminal */}
              <button
                onClick={onOpenJarvisTerminalDashboard}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-amber-300 flex items-center justify-center transition cursor-pointer group relative"
                title="Claude Code Terminal & IDE"
              >
                <Terminal className="w-5 h-5 group-hover:scale-110 transition duration-300 text-amber-400" />
                <span className="absolute left-14 bg-slate-900 border border-amber-400 text-amber-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                  CLAUDE IDE
                </span>
              </button>

              {/* Web Browser */}
              <button
                onClick={onOpenWebBrowser}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/20 text-blue-300 flex items-center justify-center transition cursor-pointer group relative"
                title="Matrix Web Browser Radar"
              >
                <Globe className="w-5 h-5 group-hover:scale-110 transition duration-300 text-blue-400" />
                <span className="absolute left-14 bg-slate-900 border border-blue-400 text-blue-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                  WEB RADAR
                </span>
              </button>

              {/* App Store */}
              <button
                onClick={onOpenAppStore}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-500/20 text-indigo-300 flex items-center justify-center transition cursor-pointer group relative"
                title="Matrix App Store Modules"
              >
                <Layers className="w-5 h-5 group-hover:scale-110 transition duration-300 text-indigo-400" />
                <span className="absolute left-14 bg-slate-900 border border-indigo-400 text-indigo-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                  APP STORE
                </span>
              </button>

              {/* Gmail Inbox */}
              <button
                onClick={onOpenGmailInbox}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-red-500/30 hover:border-red-400 hover:bg-red-500/20 text-red-300 flex items-center justify-center transition cursor-pointer group relative"
                title="Gmail Assistant Inbox"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition duration-300 text-red-400" />
                <span className="absolute left-14 bg-slate-900 border border-red-400 text-red-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                  GMAIL INBOX
                </span>
              </button>

              {/* Social Media Studio */}
              <button
                onClick={() => onOpenSocialUpload("tiktok")}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-pink-500/30 hover:border-pink-400 hover:bg-pink-500/20 text-pink-300 flex items-center justify-center transition cursor-pointer group relative"
                title="Social Media Studio (TikTok, IG, X)"
              >
                <Share2 className="w-5 h-5 group-hover:scale-110 transition duration-300 text-pink-400" />
                <span className="absolute left-14 bg-slate-900 border border-pink-400 text-pink-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                  SOCIAL STUDIO
                </span>
              </button>

              {/* Google Calendar */}
              {onOpenCalendar && (
                <button
                  onClick={onOpenCalendar}
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-amber-300 flex items-center justify-center transition cursor-pointer group relative"
                  title="Chronos Google Calendar"
                >
                  <CalendarDays className="w-5 h-5 group-hover:scale-110 transition duration-300 text-amber-400" />
                  <span className="absolute left-14 bg-slate-900 border border-amber-400 text-amber-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                    CALENDAR
                  </span>
                </button>
              )}

              {/* Obsidian Brain */}
              {onOpenObsidianBrain && (
                <button
                  onClick={onOpenObsidianBrain}
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 text-purple-300 flex items-center justify-center transition cursor-pointer group relative"
                  title="Obsidian Brain & Local Vault"
                >
                  <Brain className="w-5 h-5 group-hover:scale-110 transition duration-300 text-purple-400" />
                  <span className="absolute left-14 bg-slate-900 border border-purple-400 text-purple-300 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                    OBSIDIAN BRAIN
                  </span>
                </button>
              )}
            </div>

            {/* System Health Indicator & Settings at Bottom */}
            <div className="flex flex-col items-center gap-3 w-full border-t border-slate-800/80 pt-3">
              
              {/* Health Core Pulse */}
              <div className="flex flex-col items-center gap-1" title="System Status: Operational (100% Online)">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_#10b981]" />
                <span className="font-mono text-[8px] text-emerald-400 uppercase font-bold tracking-tighter">
                  ONLINE
                </span>
              </div>

              {/* Settings Trigger */}
              <button
                onClick={onOpenSettings}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition cursor-pointer"
                title="System Einstellungen & API Key Manager"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </aside>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER COLUMN: MAIN FOCUS VIEWPORT & UNIFIED INPUT BAR                   */}
        {/* ----------------------------------------------------------------------- */}
        <main className="snap-start scroll-snap-start flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#03060a] via-[#050912] to-[#020408]" style={{ scrollSnapAlign: "start" }}>
          
          {/* Active Agent Info Banner Header Bar */}
          {!isAllScope && (
            <div className="h-10 border-b border-cyan-500/15 bg-slate-950/60 px-4 flex items-center justify-between text-xs font-mono backdrop-blur-md z-20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentAgent.color }} />
                  CORE: {currentAgent.name} ({currentAgent.short})
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 text-[11px] truncate hidden md:inline">
                  {currentAgent.role}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <AgentSpeechAnimation
                  agentColor={currentAgent.color}
                  isSpeaking={state === "speaking" || isLoading}
                  isListening={state === "listening"}
                  size="sm"
                  label="SPRECH-ANIMATION"
                />
                <span className="text-slate-500 text-[11px] font-mono hidden sm:inline">
                  {timeStr || "12:00:00"}
                </span>
              </div>
            </div>
          )}

          {/* Central 3D Canvas Viewport Box */}
          <div id="tour-canvas-area" className="flex-1 relative flex items-center justify-center overflow-hidden border-b border-cyan-500/15 group">
            
            {/* Sci-Fi Decorative Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(78,232,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(78,232,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mix-blend-screen" />

            {/* Corner Tech Accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

            {/* 3D WebGL Particle Canvas Viewport */}
            <div className="w-full h-full relative z-10 flex items-center justify-center">
              {canvasViewport}
            </div>
          </div>

          {/* Bottom Floating Command Input Bar */}
          <div className="p-3 bg-slate-950/90 border-t border-cyan-500/20 backdrop-blur-2xl z-30 flex flex-col items-center gap-2">
            
            {/* Live Mic Recognition Banner */}
            {state === "listening" && (
              <div className="w-full max-w-3xl bg-slate-900/90 border border-red-500/60 rounded-xl px-4 py-2 flex items-center justify-between gap-3 text-xs font-mono text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                  <span className="font-bold text-red-400 tracking-wider text-[10px] uppercase flex-shrink-0">
                    🔴 LAUSCHT:
                  </span>
                  
                  {/* Mic Level Bar */}
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-950 border border-red-500/30 rounded flex-shrink-0">
                    {[0.1, 0.25, 0.45, 0.7, 0.9].map((lvlThreshold, idx) => (
                      <div
                        key={idx}
                        className={`w-1 transition-all duration-75 rounded-full ${
                          micLevel >= lvlThreshold ? "bg-red-500 h-3 shadow-[0_0_6px_#ef4444]" : "bg-slate-800 h-1.5"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="truncate italic text-red-100 font-sans text-xs flex-1">
                    {liveTranscript ? `"${liveTranscript}"` : "Sprich jetzt... System horcht aktiv..."}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (recognition) recognition.stop();
                    }}
                    className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded text-red-200 text-[10px] font-bold tracking-wider uppercase cursor-pointer transition flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> SENDEN
                  </button>
                  <button
                    onClick={() => {
                      if (recognition) {
                        speechBufferRef.current = "";
                        setLiveTranscript("");
                        recognition.abort();
                        setState("");
                      }
                    }}
                    className="p-1 bg-slate-900 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 rounded text-slate-400 hover:text-red-300 text-[10px] cursor-pointer transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Attached Images Preview */}
            {effectiveImages.length > 0 && (
              <div className="w-full max-w-3xl bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 animate-fade-in shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-cyan-300 font-bold flex items-center gap-2">
                    {effectiveImages.some(isVideoUrl) ? (
                      <Film className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    {isImageMode 
                      ? "HOLOGRAMM-MUSTER GELADEN" 
                      : (() => {
                          const vidCount = effectiveImages.filter(isVideoUrl).length;
                          const imgCount = effectiveImages.length - vidCount;
                          if (vidCount > 0 && imgCount > 0) return `${vidCount} VIDEO(S) & ${imgCount} BILD(ER) FÜR CORE-ANALYSE ANGEHÄNGT`;
                          if (vidCount > 0) return vidCount === 1 ? "1 VIDEO FÜR CORE-ANALYSE ANGEHÄNGT" : `${vidCount} VIDEOS FÜR CORE-ANALYSE ANGEHÄNGT`;
                          return effectiveImages.length === 1
                            ? "1 BILD FÜR CORE-ANALYSE ANGEHÄNGT"
                            : `${effectiveImages.length} BILDER FÜR CORE-ANALYSE ANGEHÄNGT`;
                        })()}
                  </span>
                  <button
                    onClick={actualClearImage}
                    className="px-2 py-0.5 rounded-full hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
                    title="Alle Anhänge entfernen"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>ALLE LÖSCHEN</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {effectiveImages.map((mediaUrl, idx) => {
                    const isVid = isVideoUrl(mediaUrl);
                    return (
                      <div key={idx} className="relative group shrink-0 rounded-lg overflow-hidden border border-cyan-400/40 w-14 h-14 bg-black/60 flex items-center justify-center">
                        {isVid ? (
                          <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                            <video src={mediaUrl} className="w-full h-full object-cover opacity-75" muted playsInline />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="p-1 rounded-full bg-black/70 text-amber-400 shadow">
                                <Play className="w-2.5 h-2.5 fill-amber-400" />
                              </span>
                            </div>
                            <span className="absolute top-0.5 left-0.5 px-1 rounded bg-amber-500/90 text-[7px] font-mono text-black font-black uppercase">
                              VID
                            </span>
                          </div>
                        ) : (
                          <img src={mediaUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={() => actualRemoveImage(idx)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center text-[9px] transition cursor-pointer shadow z-10"
                          title="Entfernen"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/75 text-[8px] font-mono text-cyan-200 z-10">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Communication Scope Selector Bar */}
            {onCommunicationScopeChange && (
              <div id="tour-comm-scope" className="w-full max-w-3xl flex items-center justify-between bg-slate-950/80 border border-cyan-500/20 rounded-xl px-3 py-1.5 backdrop-blur-md">
                <span className="font-mono text-[9.5px] text-slate-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  EMPFÄNGER-FLOTTE:
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onCommunicationScopeChange("AGENT_SYNC")}
                    title="⚡ AGENT-SYNC MODUS: Alle 8 Cores generieren eine gemeinsame, synthetisierte Master-Zusammenfassung in einem speziellen Fenster"
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      communicationScope === "AGENT_SYNC"
                        ? "bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.7)] scale-105"
                        : "text-cyan-400 hover:text-cyan-200 hover:bg-slate-900 border border-cyan-500/30"
                    }`}
                  >
                    <Zap className="w-3 h-3 text-current" />
                    <span>⚡ AGENT-SYNC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCommunicationScopeChange("ALL")}
                    title="An alle 8 Agenten gleichzeitig senden (Gedanken & Antworten getrennt)"
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      communicationScope === "ALL"
                        ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.6)] scale-105"
                        : "text-slate-400 hover:text-cyan-300 hover:bg-slate-900"
                    }`}
                  >
                    <span>🌐 ALL (8)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCommunicationScopeChange("THE_BIG_3")}
                    title="👑 THE BIG 3 (SYNTAX • NEO • VEGA) Tri-Core Matrix aktivieren"
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      communicationScope === "THE_BIG_3"
                        ? "bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105"
                        : "text-slate-400 hover:text-orange-300 hover:bg-slate-900"
                    }`}
                  >
                    <span>👑 THE BIG 3</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCommunicationScopeChange("SINGLE")}
                    title={`Nur an ${currentAgent.name} senden`}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      communicationScope === "SINGLE"
                        ? "bg-slate-100 text-slate-950 shadow-[0_0_10px_rgba(255,255,255,0.4)] scale-105"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <span>👤 {currentAgent.short} (EINZELN)</span>
                  </button>
                </div>
              </div>
            )}

            {/* API Connection Bar at the bottom of the chat */}
            <div className="w-full max-w-3xl mb-2">
              <ChatApiConnector
                geminiKey={geminiKey}
                onKeySaved={onSaveGeminiKey}
                lang={lang}
                agentName={currentAgent.name}
                agentColor={currentAgent.color}
              />
            </div>

            {/* Main Command Input Box */}
            <div id="tour-command-input" className="w-full max-w-3xl flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-2 shadow-[0_0_25px_rgba(0,240,255,0.15)] focus-within:border-cyan-400 focus-within:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all">
              
              {/* File upload hidden */}
              <input
                type="file"
                id="cmd-dashboard-upload"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    if (onImagesSelect) {
                      onImagesSelect(e.target.files);
                    } else if (onImageSelect && e.target.files[0]) {
                      onImageSelect(e.target.files[0]);
                    } else if (setSelectedImage && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setSelectedImage(ev.target.result as string);
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                    e.target.value = "";
                  }
                }}
                className="hidden"
              />

              {/* Upload media trigger */}
              <label
                htmlFor="cmd-dashboard-upload"
                className="p-2 rounded-xl bg-slate-950 border border-cyan-500/20 hover:border-cyan-400 text-cyan-400 hover:text-white cursor-pointer transition flex items-center justify-center flex-shrink-0"
                title="Foto oder Video für Analyse hochladen (Clip bis 80MB)"
              >
                {effectiveImages.some(isVideoUrl) ? (
                  <Film className="w-4 h-4 text-amber-400" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </label>

              {/* Hologram project mode toggle */}
              <button
                onClick={() => setIsImageMode(!isImageMode)}
                className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-center flex-shrink-0 ${
                  isImageMode
                    ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "bg-slate-950 border-cyan-500/20 text-slate-400 hover:text-cyan-300"
                }`}
                title="Hologramm-Generator Modus umschalten"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {onOpenGallery && (
                <button
                  onClick={onOpenGallery}
                  className="p-2 rounded-xl bg-slate-950 border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400 cursor-pointer transition flex items-center justify-center flex-shrink-0"
                  title="Foto & Hologramm Galerie öffnen"
                >
                  <Images className="w-4 h-4" />
                </button>
              )}

              {/* Text Input Field */}
              <input
                type="text"
                value={actualInput}
                onChange={(e) => actualSetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    actualSend();
                  }
                }}
                onPaste={async (e) => {
                  if (extractImagesFromPasteEvent) {
                    const files = extractImagesFromPasteEvent(e);
                    if (files.length > 0) {
                      e.preventDefault();
                      if (onImagesSelect) {
                        onImagesSelect(files);
                      } else if (onImageSelect) {
                        onImageSelect(files[0]);
                      }
                      return;
                    }
                  }
                  const file = extractImageFromPasteEvent(e);
                  if (file) {
                    e.preventDefault();
                    if (onImagesSelect) {
                      onImagesSelect([file]);
                    } else if (onImageSelect) {
                      onImageSelect(file);
                    } else if (setSelectedImage) {
                      try {
                        const compressed = await compressImage(file, 1280, 0.85);
                        setSelectedImage(compressed);
                      } catch (err) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setSelectedImage(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }
                }}
                placeholder={`Sag etwas zu ${currentAgent.name} oder füge Videos/Fotos ein (Strg+V)...`}
                className="flex-1 bg-transparent px-3 py-1 font-sans text-sm text-cyan-100 placeholder-slate-500 focus:outline-none"
              />

              {/* Voice Mic Toggle */}
              <button
                onClick={toggleMic}
                disabled={isLoading}
                className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-center flex-shrink-0 ${
                  state === "listening"
                    ? "bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_15px_#ef4444]"
                    : "bg-slate-950 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                }`}
                title="Sprachsteuerung aktivieren"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send Button */}
              <button
                onClick={actualSend}
                disabled={isLoading || (!actualInput.trim() && effectiveImages.length === 0)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SENDEN</span>
              </button>
            </div>
          </div>
        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: DOCKABLE & COLLAPSIBLE INTELLIGENCE PANEL                  */}
        {/* ----------------------------------------------------------------------- */}
        <aside
          className={`border-l border-cyan-500/20 bg-slate-950/95 backdrop-blur-2xl flex flex-col z-30 transition-all duration-300 relative flex-shrink-0 shadow-[-4px_0_25px_rgba(0,0,0,0.6)] ${
            rightPanelOpen ? "w-[390px]" : "w-[42px]"
          }`}
        >
          {/* Header Bar with Toggle Collapse */}
          <div className="h-10 border-b border-cyan-500/20 bg-slate-900/80 px-2.5 flex items-center justify-between text-xs font-mono flex-shrink-0">
            {rightPanelOpen ? (
              <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-wider">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="truncate">AGENTEN CHAT :: S.Y.N.T.A.X.</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
              </div>
            )}

            <div className="flex items-center gap-1">
              {rightPanelOpen && onOpenMultiAgentChat && (
                <button
                  onClick={onOpenMultiAgentChat}
                  className="p-1 rounded bg-slate-950 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition cursor-pointer"
                  title="Vollbild Multi-Agenten Chatraum öffnen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Collapse/Expand Panel Button */}
              <button
                onClick={onToggleRightPanel}
                className="p-1 rounded bg-slate-950 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition cursor-pointer"
                title={rightPanelOpen ? "Rechte Seitenleiste einklappen" : "Rechte Seitenleiste ausklappen"}
              >
                {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Panel Content (only visible when expanded) */}
          {rightPanelOpen && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Agent Quick Switcher Bar */}
              <div className="p-2 border-b border-cyan-500/15 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                {agents.map((ag) => {
                  const allowed = isAgentAllowed(userRole, ag.id);
                  const active = currentAgent.id === ag.id;
                  return (
                    <button
                      key={ag.id}
                      onClick={() => allowed && actualSwitchAgent(ag)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                        active
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                          : allowed
                          ? "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                          : "bg-red-950/20 text-red-400/50 border border-red-900/30 opacity-60"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ag.color }} />
                      <span>{ag.short}</span>
                      {!allowed && <Lock className="w-2.5 h-2.5 text-red-400 inline" />}
                    </button>
                  );
                })}
              </div>

              {/* Right Panel Sub-Tabs (Chat, Logs, Tools) */}
              <div className="flex items-center border-b border-cyan-500/15 bg-slate-900/40 text-[10px] font-mono font-bold flex-shrink-0">
                <button
                  onClick={() => actualSelectTab("chat")}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === "chat"
                      ? "bg-cyan-500/15 text-cyan-300 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>CHAT</span>
                </button>
                <button
                  onClick={() => actualSelectTab("logs")}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === "logs"
                      ? "bg-cyan-500/15 text-cyan-300 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>LIVE LOGS ({filteredLogs.length})</span>
                </button>
                <button
                  onClick={() => actualSelectTab("tools")}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === "tools"
                      ? "bg-cyan-500/15 text-cyan-300 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>MODULES</span>
                </button>
              </div>

              {/* Tab Viewport Content */}
              <div className="flex-1 overflow-y-auto relative bg-slate-950/80">
                
                {/* TAB 1: AGENT CHAT */}
                {rightPanelTab === "chat" && (
                  <div className="h-full">
                    {chatPanelContent ? (
                      chatPanelContent
                    ) : (
                      <ChatPanel
                        messages={messages}
                        currentAgent={currentAgent}
                        compareEnabled={false}
                        isLoading={isLoading}
                        onOpenSettings={onOpenSettings}
                        onClearChat={onClearChat || (() => {})}
                        onSelectHologram={(url, prompt) => {
                          if (setActiveHologram) {
                            setActiveHologram({
                              url,
                              prompt,
                              timestamp: new Date().toLocaleTimeString("de-DE"),
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                )}

                {/* TAB 2: LIVE EVENT LOGS & OUTPUT FEED */}
                {rightPanelTab === "logs" && (
                  <div className="p-3 flex flex-col gap-2 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        SYSTEM PROTOKOLL & CORE EVENTS
                      </span>
                      <div className="flex gap-1 text-[9px]">
                        <button
                          onClick={() => setLogsFilter("all")}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            logsFilter === "all" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-500"
                          }`}
                        >
                          ALLE
                        </button>
                        <button
                          onClick={() => setLogsFilter("agent")}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            logsFilter === "agent" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-500"
                          }`}
                        >
                          AGENTEN
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pt-1">
                      {filteredLogs.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 italic text-xs">
                          Keine Protokoll-Einträge vorhanden.
                        </div>
                      ) : (
                        filteredLogs.map((log) => (
                          <div
                            key={log.id}
                            className={`p-2 rounded-lg border text-[11px] leading-relaxed transition ${
                              log.type === "agent"
                                ? "bg-purple-950/20 border-purple-500/30 text-purple-200"
                                : log.type === "warn"
                                ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                                : log.type === "success"
                                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                                : "bg-slate-900/60 border-slate-800 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                              <span className="font-bold text-cyan-400">{log.agentName || "S.Y.N.T.A.X. SYSTEM"}</span>
                              <span>{log.timestamp}</span>
                            </div>
                            <p>{log.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: MATRIX MODULES LAUNCHER (8-CORE SPECIALIST HUB) */}
                {rightPanelTab === "tools" && (
                  <div className="p-3 space-y-3 font-mono">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center justify-between pb-1 border-b border-cyan-500/20">
                      <span>8-CORE SPEZIALISTEN-SUITE</span>
                      <span className="text-slate-500">v4.8 QUANTUM</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* GMAIL INBOX */}
                      <button
                        onClick={onOpenGmailInbox}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-red-500/40 hover:border-red-400 text-left transition hover:scale-[1.02] cursor-pointer group shadow-lg shadow-red-950/20"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Mail className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">CORE</span>
                        </div>
                        <div className="text-[11px] font-bold text-red-200">GMAIL INBOX</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">KI-Mails & Entwürfe</div>
                      </button>

                      {/* SOCIAL MEDIA STUDIO */}
                      <button
                        onClick={() => onOpenSocialUpload("tiktok")}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-pink-500/40 hover:border-pink-400 text-left transition hover:scale-[1.02] cursor-pointer group shadow-lg shadow-pink-950/20"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Share2 className="w-4 h-4 text-pink-400 group-hover:scale-110 transition" />
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">CORE</span>
                        </div>
                        <div className="text-[11px] font-bold text-pink-200">SOCIAL STUDIO</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">TikTok, IG, X, Reels</div>
                      </button>

                      {/* CHRONOS KALENDER */}
                      {onOpenCalendar && (
                        <button
                          onClick={onOpenCalendar}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-left transition hover:scale-[1.02] cursor-pointer group shadow-lg shadow-amber-950/20"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <CalendarDays className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">CORE</span>
                          </div>
                          <div className="text-[11px] font-bold text-amber-200">CHRONOS CALENDAR</div>
                          <div className="text-[8.5px] text-slate-400 mt-0.5">Google Sync & Termine</div>
                        </button>
                      )}

                      {/* OBSIDIAN BRAIN */}
                      {onOpenObsidianBrain && (
                        <button
                          onClick={onOpenObsidianBrain}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 text-left transition hover:scale-[1.02] cursor-pointer group shadow-lg shadow-purple-950/20"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Brain className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">CORE</span>
                          </div>
                          <div className="text-[11px] font-bold text-purple-200">OBSIDIAN BRAIN</div>
                          <div className="text-[8.5px] text-slate-400 mt-0.5">Local Vault & Graph</div>
                        </button>
                      )}

                      {/* VEO 3.1 AI VIDEO STUDIO */}
                      {onOpenVeoVideoStudio && (
                        <button
                          onClick={onOpenVeoVideoStudio}
                          className="p-2.5 rounded-xl bg-gradient-to-br from-purple-950/80 to-pink-950/40 border border-pink-500/40 hover:border-pink-400 text-left transition hover:scale-[1.02] cursor-pointer group shadow-lg shadow-pink-950/30"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <Clapperboard className="w-4 h-4 text-pink-400 group-hover:scale-110 transition" />
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">VEO 3.1</span>
                          </div>
                          <div className="text-[11px] font-bold text-pink-200">VIDEO STUDIO</div>
                          <div className="text-[8.5px] text-slate-400 mt-0.5">8K Cinema & Reels</div>
                        </button>
                      )}

                      {/* CLAUDE CODE */}
                      <button
                        onClick={onOpenJarvisTerminalDashboard}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 text-left transition hover:scale-[1.02] cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Terminal className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">DEV</span>
                        </div>
                        <div className="text-[11px] font-bold text-amber-200">CLAUDE CODE</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">Code Terminal</div>
                      </button>

                      {/* WEB RADAR */}
                      <button
                        onClick={onOpenWebBrowser}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 hover:border-blue-400 text-left transition hover:scale-[1.02] cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Globe className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">SEARCH</span>
                        </div>
                        <div className="text-[11px] font-bold text-blue-200">WEB RADAR</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">Live Deep Scraping</div>
                      </button>

                      {/* TIKTOK STUDIO */}
                      <button
                        onClick={() => onOpenSocialUpload("tiktok")}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 text-left transition hover:scale-[1.02] cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Camera className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">SOCIAL</span>
                        </div>
                        <div className="text-[11px] font-bold text-purple-200">TIKTOK STUDIO</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">Shorts & Upload</div>
                      </button>

                      {/* APP STORE */}
                      <button
                        onClick={onOpenAppStore}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 text-left transition hover:scale-[1.02] cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">STORE</span>
                        </div>
                        <div className="text-[11px] font-bold text-indigo-200">APP MATRIX</div>
                        <div className="text-[8.5px] text-slate-400 mt-0.5">Modular Integrations</div>
                      </button>
                    </div>

                    {/* VEO 3.1 AI VIDEO SCHNELL-PROMPTS */}
                    {onOpenVeoVideoStudio && (
                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                        <div className="text-[9.5px] font-bold text-pink-300 flex items-center justify-between">
                          <span>⚡ VEO 3.1 SCHNELL-PROMPTS</span>
                          <span className="text-[8px] text-slate-500">1-KLICK START</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => {
                              if (setInputPrompt) setInputPrompt("Erstelle ein 8K Cinematic Sci-Fi Cyberpunk Drohnenvideo einer futuristischen Megacity mit neonblauen Wolkenkratzern und fliegenden Gleitern.");
                              if (setInput) setInput("Erstelle ein 8K Cinematic Sci-Fi Cyberpunk Drohnenvideo einer futuristischen Megacity mit neonblauen Wolkenkratzern und fliegenden Gleitern.");
                              onOpenVeoVideoStudio();
                            }}
                            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-purple-900/50 border border-purple-500/20 text-left text-[9.5px] text-purple-200 transition cursor-pointer hover:border-pink-400"
                          >
                            🎬 <strong>16:9 Cinema:</strong> Cyberpunk Megacity Drohnenflug
                          </button>
                          <button
                            onClick={() => {
                              if (setInputPrompt) setInputPrompt("Erstelle ein 9:16 hochkant TikTok/Reels Video mit schnellen Schnitten, dynamischem Licht und 3D Hologramm-Explosionen für Social Media.");
                              if (setInput) setInput("Erstelle ein 9:16 hochkant TikTok/Reels Video mit schnellen Schnitten, dynamischem Licht und 3D Hologramm-Explosionen für Social Media.");
                              onOpenVeoVideoStudio();
                            }}
                            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-purple-900/50 border border-purple-500/20 text-left text-[9.5px] text-pink-200 transition cursor-pointer hover:border-pink-400"
                          >
                            📱 <strong>9:16 Viral Reels:</strong> Dynamic Hologram Drops
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
      {children}

      {/* SESSION & RESTZEIT DETAIL MODAL */}
      {showSessionDetailModal && sessionTimeLeft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-[#080d16] border-2 border-cyan-400/80 rounded-3xl p-6 text-slate-100 space-y-5 shadow-[0_0_60px_rgba(0,240,255,0.35)] font-mono">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {activeKey ? `KEY SESSION: ${activeKey.key}` : "PRO TRIAL SESSION"}
                  </h3>
                  <p className="text-[10px] text-cyan-400">8-Core Sovereign Matrix Status</p>
                </div>
              </div>
              <button
                onClick={() => setShowSessionDetailModal(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Countdown Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/40 text-center space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                VERBLEIBENDE RESTZEIT
              </span>
              <div className="text-3xl font-black text-cyan-300 tracking-wider drop-shadow-[0_0_12px_rgba(78,232,255,0.6)] animate-pulse">
                {sessionTimeLeft.isExpired
                  ? "00h 00m 00s (ABGELAUFEN)"
                  : `${String(sessionTimeLeft.hours).padStart(2, "0")}h : ${String(sessionTimeLeft.minutes).padStart(2, "0")}m : ${String(sessionTimeLeft.seconds).padStart(2, "0")}s`}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SOVEREIGN CORE STATUS: 100% UNLOCKED</span>
              </div>
            </div>

            {/* Key Information details */}
            {activeKey && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Aktivierter Key:</span>
                  <span className="font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                    {activeKey.key}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Gültigkeitsdauer:</span>
                  <span className="text-slate-200">{activeKey.durationHours || 24} Stunden</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Ablaufzeitpunkt:</span>
                  <span className="text-slate-200">
                    {new Date(activeKey.expiresAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr (
                    {new Date(activeKey.expiresAt).toLocaleDateString("de-DE")})
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              {activeKey && (
                <button
                  onClick={() => {
                    const url = generateKeyDirectUrl(activeKey.key);
                    navigator.clipboard.writeText(url);
                    alert(`🔗 1-Klick-Link kopiert:\n${url}`);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(78,232,255,0.3)]"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>1-KLICK-DIREKTLINK KOPIEREN</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowSessionDetailModal(false);
                  onOpenRoleManager();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>ROLE MANAGER & TARIFE ÖFFNEN</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
});
