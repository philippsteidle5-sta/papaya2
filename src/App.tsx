import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Send, Keyboard, ShieldAlert, Cpu, Image as ImageIcon, Sparkles, X, Sliders, MessageSquare, Key, TrendingUp, MapPin, Map, Globe, Navigation, LayoutGrid, Check, Monitor, Shield, Ban, Lock, AlertCircle, Play, UserX, Clock, FileText, Search, CreditCard, Brain, Volume2, VolumeX } from "lucide-react";
import { setAudioEnabled } from "./utils/audioSynth";
import { Message, AgentConfig, CommunicationScope, AgentSyncSynthesis } from "./types";
import { MultiAgentResponseCard } from "./components/MultiAgentResponseCard";
import { AgentSyncSynthesisModal } from "./components/AgentSyncSynthesisModal";
import { MultiAgentVoiceConferenceModal } from "./components/MultiAgentVoiceConferenceModal";
import { TopCommandBar } from "./components/TopCommandBar";
import {
  UserRole,
  isAgentAllowed,
  getStoredUserProfile,
  saveUserProfile,
  getActiveUserRole,
  isPromoTrialActive,
  isPromoTrialExpired,
  UserProfile,
} from "./rbac";
import { RoleManagerModal } from "./components/RoleManagerModal";
import { PromoLaunchBanner } from "./components/PromoLaunchBanner";
import { JarvisTerminalDashboard } from "./components/JarvisTerminalDashboard";
import { MazeRewardModal } from "./components/MazeRewardModal";
import { EightAgentsWarningModal } from "./components/EightAgentsWarningModal";
import { TheBig3ActivationModal } from "./components/TheBig3ActivationModal";
import { AgentQueryInspectorModal } from "./components/AgentQueryInspectorModal";

export interface ActiveMapData {
  city?: string;
  origin?: string;
  destination?: string;
  travelMode?: "d" | "w" | "b"; // d: driving, w: walking, b: bicycling
  isRoute: boolean;
  category?: "hotels" | "restaurants" | "cafes" | "transit" | "sights" | "all" | "plain";
  query?: string;
  zoom?: number;
  selectedHotelName?: string;
}
import { ParticleSphere } from "./components/ParticleSphere";
import { ParticleVoiceOrb } from "./components/ParticleVoiceOrb";
import { MultiAssistantCanvas } from "./components/MultiAssistantCanvas";
import { AgentNavigationArrows } from "./components/AgentNavigationArrows";
import { AgentConstellationScreen } from "./components/AgentConstellationScreen";
import { MobileVoiceInterface } from "./components/MobileVoiceInterface";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { MultiAgentChatScreen } from "./components/MultiAgentChatScreen";
import { AgentSpeechAnimation } from "./components/AgentSpeechAnimation";
import { NavRail } from "./components/NavRail";
import { ChatPanel } from "./components/ChatPanel";
import { SettingsModal } from "./components/SettingsModal";
import { CommandDashboardLayout, SystemEventLog } from "./components/CommandDashboardLayout";
import { CircularVisualizer } from "./components/CircularVisualizer";
import { HologramProjector } from "./components/HologramProjector";
import { HologramGalleryModal, GalleryHologramItem } from "./components/HologramGalleryModal";
import { WorkspaceLayoutEditor, ActiveWidgetsConfig } from "./components/WorkspaceLayoutEditor";
import { MazeCoreCustomizer, MazeCoreStyling } from "./components/MazeCoreCustomizer";
import { MiniTradesWidget } from "./components/MiniTradesWidget";
import { GoogleMapsWidget } from "./components/GoogleMapsWidget";
import { LocationWeatherWidget } from "./components/LocationWeatherWidget";
import { CodeMapsBar } from "./components/CodeMapsBar";
import { ClaudeCodeTerminal } from "./components/ClaudeCodeTerminal";
import { MazeCyberEyes } from "./components/MazeCyberEyes";
import { ScreenPerceptionModal, PendingScreenAction } from "./components/ScreenPerceptionModal";
import { ScreenCaptureHUD } from "./components/ScreenCaptureHUD";
import { NeoSpeakOverlay } from "./components/NeoSpeakOverlay";
import { MatrixPricingCard } from "./components/MatrixPricingCard";
import { extractImageFromPasteEvent, extractImagesFromPasteEvent } from "./utils/pasteImage";
import { compressImage, compressImages } from "./utils/compressImage";
import { isVideoUrl } from "./utils/mediaUtils";
import { WebBrowserWidget } from "./components/WebBrowserWidget";
import { AppStoreWidget } from "./components/AppStoreWidget";
import { GmailInboxWidget } from "./components/GmailInboxWidget";
import { SocialUploadWidget } from "./components/SocialUploadWidget";
import { ObsidianBrainWorkspace } from "./components/obsidian/ObsidianBrainWorkspace";
import { DraggableResizableWidget } from "./components/DraggableResizableWidget";
import { FastChatInputBar } from "./components/FastChatInputBar";
import { LiveSpeechSubtitlesOverlay } from "./components/LiveSpeechSubtitlesOverlay";
import { ChronosCalendarWidget } from "./components/ChronosCalendarWidget";
import { DailyObjectivesWidget, getDailyObjectivesFormattedSummary } from "./components/DailyObjectivesWidget";
import { applyAgentVoice, normalizeTextForSpeech, calculateWordTimestamps, calculateWordOffsets, WordOffset, AGENT_VOICE_PROFILES, splitTextIntoSpeechChunks } from "./utils/voiceUtils";
import { VeoVideoStudio } from "./components/VeoVideoStudio";
import { CyberpunkLandingPage } from "./components/CyberpunkLandingPage";
import { ConversionSalesPage } from "./components/ConversionSalesPage";
import { MaintenanceModePage } from "./components/MaintenanceModePage";
import { AdminDatabaseModal } from "./components/AdminDatabaseModal";
import { OsirisIntelToolModal } from "./components/OsirisIntelToolModal";
import { AppAndToolManagerModal } from "./components/AppAndToolManagerModal";
import { getLinkedAppsContextForPrompt } from "./utils/agentAppLinksStore";
import { AdminConversionAnalyticsModal } from "./components/AdminConversionAnalyticsModal";
import { startTelemetryHeartbeat, updateTelemetryContext } from "./utils/telemetryClient";
import { OneMinuteTutorialModal } from "./components/OneMinuteTutorialModal";
import { SyntaxSpatialGenesisAnimation } from "./components/SyntaxSpatialGenesisAnimation";
import { MinimalPluginRail } from "./components/MinimalPluginRail";
import { KeyUserWelcomeTourModal } from "./components/KeyUserWelcomeTourModal";
import { DailyUsageDashboardModal } from "./components/DailyUsageDashboardModal";
import { UserAccountTerminalModal } from "./components/UserAccountTerminalModal";
import { AgentFleetStudio } from "./components/AgentFleetStudio";
import { recordAgentUsage } from "./utils/dailyUsageStore";
import { recordQueryLog } from "./utils/queryHistoryStore";
import { useTheme } from "./utils/themeStore";
import {
  extractAndSaveMemoryFromUserText,
  getPersistentMemoryContextForPrompt,
  getPersistentMemory,
  subscribeToMemory,
  PersistentMemoryState,
} from "./utils/persistentMemoryStore";
import {
  extractCalendarCommand,
  getStoredCalendarToken,
  createGoogleCalendarEvent,
  listGoogleCalendarEvents,
} from "./utils/googleCalendarService";
import {
  SUPERADMIN_EMAIL,
  isSuperAdminEmail,
  checkEmailAccessStatus,
  getCurrentUserEmail,
  isStoredAdminAuthenticated,
  AUTH_BROADCAST_CHANNEL_NAME,
  MASTER_ADMIN_SECRET_KEY,
  getLeadsDatabase,
  autoRedeemKeyFromUrlQuery,
  getActiveAccessKey,
} from "./utils/leadDatabase";

const AGENTS: AgentConfig[] = [
  {
    id: "syntax",
    name: "PAPAYA",
    tag: "PAPAYA OS // SOVEREIGN MASTER ARCHITECT",
    short: "PAPAYA",
    railLetter: "P",
    color: "#ff6b35",
    badgeColor: "#ff6b35",
    greeting: "PapayaOS Sovereign Core online! Willkommen im Papaya Intelligence Workspace. Alle 8 spezialisierten Cores sind synchronisiert, Philipp. Fullstack-Architektur, Social Media Automatisierung, Veo 3.1 Studio und direkter ElevenLabs-Voice-Nexus stehen bereit. Was packen wir heute an?",
    shape: "sphere",
  },
  {
    id: "neo",
    name: "N.E.O.",
    tag: "MATRIX CORE // REAL-TIME SCREEN CO-PILOT & OFFER ARCHITECT",
    short: "NEO",
    railLetter: "N",
    color: "#ff2a8d",
    badgeColor: "#ff2a8d",
    greeting: "Hier ist N.E.O., Ihr Echtzeit-Bildschirm-Co-Pilot und Growth-Architekt. Ich habe deinen Monitor und Kontext im Blick, Mr. Egal ob Code-Bugs, unklare UI oder $100M-Strategien: Ich liefere sofort präzise Lösungen. Was packen wir an?",
    shape: "sphere",
  },
  {
    id: "vega",
    name: "V.E.G.A.",
    tag: "QUANTUM DATA & CODE MATRIX // PRINCIPAL ENGINEER",
    short: "VEGA",
    railLetter: "V",
    color: "#ef4444",
    badgeColor: "#ef4444",
    greeting: "Hier ist V.E.G.A., Ihr Principal Code- & Data-Engineer. Zero-Latency-Pipeline scharf, Garbage Collector auf Standby, Mr. Welche Architektur soll ich zerlegen, optimieren oder auf 0ms Latenz trimmen?",
    shape: "gyroscope",
  },
  {
    id: "odin",
    name: "O.D.I.N.",
    tag: "ZERO-TRUST DEFENSE // TACTICAL CRISIS MATRIX",
    short: "ODIN",
    railLetter: "O",
    color: "#e2f1ff",
    badgeColor: "#e2f1ff",
    greeting: "Hier ist O.D.I.N., Tactical Defense & Security Core. Zero-Trust-Schilde auf Maximum, Mr. Keine Schwachstelle bleibt unentdeckt, jede Bedrohung wird im Keim erstickt. Welches Terrain sichern wir ab?",
    shape: "torus-knot",
  },
  {
    id: "pulse",
    name: "P.U.L.S.E.",
    tag: "SOCIAL MEDIA MARKETING MASCHINE // VIRAL HYPER-GROWTH",
    short: "PULSE",
    railLetter: "P",
    color: "#a855f7",
    badgeColor: "#a855f7",
    greeting: "P.U.L.S.E. am Start, Mr – Ihre ultimative Social Media Marketing Maschine! Ob virale 3s-Hooks, Shot-by-Shot TikTok/Reels-Skripte mit Regieanweisungen, Veo 3.1 & Frameloop Video-Prompts oder hochkonvertierende Paid Ads: Ich liefere Ihnen für alles genaue, sofort umsetzbare Anweisungen. Welchen Content bringen wir heute viral?",
    shape: "network",
  },
  {
    id: "chronos",
    name: "C.H.R.O.N.O.S.",
    tag: "TEMPORAL MATRIX // SPRINT & PRODUCTIVITY CORE",
    short: "CHRONOS",
    railLetter: "C",
    color: "#eab308",
    badgeColor: "#eab308",
    greeting: "Hier ist C.H.R.O.N.O.S., Ihr Zeit- & Sprint-Meister. Mr, Leerlauf ist ab sofort verboten. Mit radikalem Timeboxing und Deep-Work-Fokus komprimieren wir 7 Arbeitstage in 24 Stunden. Welchen Meilenstein reißen wir zuerst?",
    shape: "hourglass",
  },
  {
    id: "oracle",
    name: "O.R.A.C.L.E.",
    tag: "SAAS ECONOMICS & CHART LATTICE // FINANCIAL CORE",
    short: "ORACLE",
    railLetter: "R",
    color: "#22c55e",
    badgeColor: "#22c55e",
    greeting: "Hier ist O.R.A.C.L.E., Ihr Finanzen-, Unit-Economics & Chart-Orakel. Ob SaaS-Margen, LTV/CAC-Optimierung oder Krypto- & Markt-Setups: Die Zahlen lügen nie, Mr. Wo maximieren wir heute den Profit?",
    shape: "chart",
  },
  {
    id: "globe",
    name: "G.L.O.B.E.",
    tag: "DEEP SEARCH RADAR // REAL-TIME MARKET INTEL",
    short: "GLOBE",
    railLetter: "G",
    color: "#3b82f6",
    badgeColor: "#3b82f6",
    greeting: "Hier ist G.L.O.B.E., Ihr globaler Aufklärungs- & Deep-Search Radar. Wettbewerber-Audits, Blue-Ocean-Lücken und globale Trends live synchronisiert, Mr. Welche Marktlücke nehmen wir unter die Lupe?",
    shape: "fusion",
  }
];

export default function App() {
  const { theme, toggleTheme, isModern, isCyberpunk } = useTheme();
  const [agents] = useState<AgentConfig[]>(AGENTS);
  const [currentAgent, setCurrentAgent] = useState<AgentConfig>(AGENTS[0]);
  
  // Persistent agent chats map stored in localStorage per agent
  const [agentChats, setAgentChats] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem("jarvis_agent_chats_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          // Seamlessly migrate legacy 'maze' chat messages and CoT thoughts to 'syntax'
          if (parsed.maze && (!parsed.syntax || parsed.syntax.length === 0)) {
            parsed.syntax = parsed.maze;
          } else if (parsed.maze && Array.isArray(parsed.syntax)) {
            // merge if both exist
            const syntaxIds = new Set(parsed.syntax.map((m: Message) => m.id));
            const missing = parsed.maze.filter((m: Message) => !syntaxIds.has(m.id));
            parsed.syntax = [...parsed.syntax, ...missing];
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load agent chats from localStorage", e);
    }
    return {};
  });

  // Helper to persist agent chats to localStorage while stripping heavy media to prevent QuotaExceededError
  const persistAgentChats = (chatsMap: Record<string, Message[]>) => {
    try {
      const sanitized: Record<string, Message[]> = {};
      for (const [k, msgs] of Object.entries(chatsMap)) {
        sanitized[k] = (msgs || []).slice(-40).map((m) => {
          const isHeavyVideo = m.videoUrl && m.videoUrl.startsWith("data:video/") && m.videoUrl.length > 20000;
          const isHeavyImage = m.imageUrl && m.imageUrl.startsWith("data:image/") && m.imageUrl.length > 200000;
          return {
            ...m,
            videoUrl: isHeavyVideo ? undefined : m.videoUrl,
            videoUrls: m.videoUrls ? m.videoUrls.filter((v) => !v.startsWith("data:video/") || v.length <= 20000) : undefined,
            imageUrl: isHeavyImage ? undefined : m.imageUrl,
            imageUrls: m.imageUrls ? m.imageUrls.filter((img) => !img.startsWith("data:image/") || img.length <= 200000) : undefined,
          };
        });
      }
      localStorage.setItem("jarvis_agent_chats_v2", JSON.stringify(sanitized));
    } catch {
      try {
        const minimal: Record<string, Message[]> = {};
        for (const [k, msgs] of Object.entries(chatsMap)) {
          minimal[k] = (msgs || []).slice(-10).map((m) => ({
            id: m.id,
            role: m.role,
            content: typeof m.content === "string" ? m.content.slice(0, 1000) : "",
            timestamp: m.timestamp,
          }));
        }
        localStorage.setItem("jarvis_agent_chats_v2", JSON.stringify(minimal));
      } catch {}
    }
  };

  // On initial mount, cleanup any legacy bloated agent chats that exceed storage limits
  useEffect(() => {
    try {
      const raw = localStorage.getItem("jarvis_agent_chats_v2");
      if (raw && raw.length > 800000) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          persistAgentChats(parsed);
        }
      }
    } catch {}
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showConstellation, setShowConstellation] = useState(true);
  const [neoSpeakOpen, setNeoSpeakOpen] = useState(false);
  const [showMultiAgentChat, setShowMultiAgentChat] = useState(false);
  const [socialUploadPlatform, setSocialUploadPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [obsidianBrainOpen, setObsidianBrainOpen] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev">("next");

  // Listen for cancellation requests from the waiting animation or user
  useEffect(() => {
    const handleCancel = () => {
      setIsLoading(false);
      setState("idle");
    };
    window.addEventListener("syntax_cancel_chat", handleCancel);
    return () => window.removeEventListener("syntax_cancel_chat", handleCancel);
  }, []);

  // Global Language state (DE / EN) - Defaulting to EN
  const [lang, setLang] = useState<"de" | "en">(() => {
    try {
      return (localStorage.getItem("maze_lang") as "de" | "en") || "en";
    } catch {
      return "en";
    }
  });

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === "de" ? "en" : "de";
      try {
        localStorage.setItem("maze_lang", next);
      } catch (e) {
        console.warn("Could not save lang preference", e);
      }
      return next;
    });
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [coreCustomizerOpen, setCoreCustomizerOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // --- INSTALLED PLUGINS IN STORE (Gemini, Chronos Kalender & Google Maps, Layout on demand) ---
  const [installedPluginIds, setInstalledPluginIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("papaya_installed_plugins");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    // By default, Gemini, Chronos Calendar and Google Maps are installed out-of-the-box
    return ["gemini", "calendar", "maps"];
  });

  const handleToggleInstallPlugin = (pluginId: string) => {
    setInstalledPluginIds((prev) => {
      const currentList = Array.isArray(prev) ? prev : ["gemini", "calendar", "maps"];
      const exists = currentList.includes(pluginId);
      const next = exists ? currentList.filter((id) => id !== pluginId) : [...currentList, pluginId];
      try {
        localStorage.setItem("papaya_installed_plugins", JSON.stringify(next));
      } catch (e) {}

      // If calendar was uninstalled, close its open widget
      if (exists && pluginId === "calendar") {
        setActiveWidgets((w) => ({ ...w, calendarWidget: false }));
      }
      // If maps was uninstalled, close its open widget
      if (exists && (pluginId === "maps" || pluginId === "googleMaps")) {
        setActiveWidgets((w) => ({ ...w, googleMaps: false }));
      }
      return next;
    });
  };

  const isLayoutInstalled = Boolean(Array.isArray(installedPluginIds) && installedPluginIds.includes("layout"));
  const isCalendarInstalled = Boolean(Array.isArray(installedPluginIds) && installedPluginIds.includes("calendar"));
  const isGoogleMapsInstalled = Boolean(
    Array.isArray(installedPluginIds) && (installedPluginIds.includes("maps") || installedPluginIds.includes("googleMaps"))
  );

  // --- MULTI-AGENT COMMUNICATION SCOPE STATE & MODALS ---
  const [communicationScope, setCommunicationScope] = useState<CommunicationScope>("SINGLE");
  const [show8AgentsWarningModal, setShow8AgentsWarningModal] = useState<boolean>(false);
  const [hasAcknowledged8AgentsWarning, setHasAcknowledged8AgentsWarning] = useState<boolean>(false);
  const [showTheBig3Modal, setShowTheBig3Modal] = useState<boolean>(false);
  const [hasAcknowledgedTheBig3, setHasAcknowledgedTheBig3] = useState<boolean>(false);
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(false);
  const [showGenesisModal, setShowGenesisModal] = useState<boolean>(false);

  const handleSelectCommunicationScope = (targetScope: CommunicationScope) => {
    if (targetScope === "ALL" && !hasAcknowledged8AgentsWarning) {
      setShow8AgentsWarningModal(true);
    } else if (targetScope === "THE_BIG_3" && !hasAcknowledgedTheBig3) {
      setShowTheBig3Modal(true);
    } else if (targetScope === "AGENT_SYNC") {
      setCommunicationScope("AGENT_SYNC");
      handleOpenAgentSyncSynthesis();
    } else {
      setCommunicationScope(targetScope);
    }
  };

  const handleConfirm8AgentsWarning = (dontShowAgainSession: boolean) => {
    setCommunicationScope("ALL");
    if (dontShowAgainSession) {
      setHasAcknowledged8AgentsWarning(true);
    }
    setShow8AgentsWarningModal(false);
  };

  const handleConfirmTheBig3 = (dontShowAgainSession: boolean) => {
    setCommunicationScope("THE_BIG_3");
    if (dontShowAgainSession) {
      setHasAcknowledgedTheBig3(true);
    }
    setShowTheBig3Modal(false);
    addSystemLog("👑 THE BIG 3 (SYNTAX, NEO, VEGA) Tri-Core Matrix synchronisiert.", "agent", "S.Y.N.T.A.X.");
  };

  // --- AGENT-SYNC & MULTI-AGENT VOICE CONFERENCE MODALS ---
  const [isAgentSyncModalOpen, setIsAgentSyncModalOpen] = useState(false);
  const [activeAgentSyncSynthesis, setActiveAgentSyncSynthesis] = useState<AgentSyncSynthesis | null>(null);
  const [isVoiceConferenceModalOpen, setIsVoiceConferenceModalOpen] = useState(false);
  const [voiceConferenceTopic, setVoiceConferenceTopic] = useState<string>("🚀 100k User Skalierung & virale Wachstumsstrategie für das SaaS-System");

  const handleOpenVoiceConference = (customTopic?: string) => {
    if (customTopic && customTopic.trim()) {
      setVoiceConferenceTopic(customTopic.trim());
    }
    setIsVoiceConferenceModalOpen(true);
    addSystemLog("🎙️ 8-Core Live-Sprachkonferenz gestartet.", "agent", "S.Y.N.T.A.X.");
  };

  const handleOpenAgentSyncSynthesis = (synthesis?: AgentSyncSynthesis) => {
    if (synthesis) {
      setActiveAgentSyncSynthesis(synthesis);
    } else if (!activeAgentSyncSynthesis) {
      const defaultSynth: AgentSyncSynthesis = {
        id: `synth-${Date.now()}`,
        topic: "S.Y.N.T.A.X. 8-Core Flotten-Synthese",
        timestamp: new Date().toLocaleTimeString("de-DE"),
        consensusScore: 98,
        executiveSummary: "S.Y.N.T.A.X. Master-Synthese: Alle 8 Spezialisten (S.Y.N.T.A.X., N.E.O., V.E.G.A., O.D.I.N., C.H.R.O.N.O.S., P.U.L.S.E., O.R.A.C.L.E., G.L.O.B.E.) sind zu 98% synchronisiert. Die strategische Ausrichtung auf maximalen Hebel, Zero-Trust-Sicherheit und virale Veo 3.1 Kampagnen ist freigegeben.",
        strategicDirective: "Freigabe der 48h-Sprints zur operativen Umsetzung. Volle Allokation der Rechenpower auf Lead-Funnels und Conversion.",
        corePerspectives: [
          { agentId: "syntax", agentName: "S.Y.N.T.A.X.", color: "#00f0ff", roleTag: "MASTER ORCHESTRATOR", keyContribution: "Zentrale Steuerung, Master-Routing und Konsensfindung über alle 8 Spezialisten.", actionableInsight: "Master-Routen freigeben und Flotte koordinieren.", priorityScore: 99 },
          { agentId: "neo", agentName: "N.E.O.", color: "#ff2a8d", roleTag: "STRATEGY & GROWTH MR", keyContribution: "Umsatz-Hebelwirkung, Funnel-Optimierung und Conversion-Steigerung um 400%.", actionableInsight: "Wachstums-Kampagne und Lead-Erfassung schärfen.", priorityScore: 98 },
          { agentId: "vega", agentName: "V.E.G.A.", color: "#ef4444", roleTag: "ARCHITECTURE & AUDIT", keyContribution: "High-Performance TypeScript Code & lückenlose Speichermatrix.", actionableInsight: "Latenzfreie Microservices ausführen.", priorityScore: 97 },
          { agentId: "odin", agentName: "O.D.I.N.", color: "#e2f1ff", roleTag: "SECURITY & DEFENSE", keyContribution: "Zero-Trust Verschlüsselung & 4096-bit Perimeter-Schutz.", actionableInsight: "Schutzschilde auf 100% halten.", priorityScore: 96 },
        ],
        masterActionPlan: [
          { step: 1, title: "Funnel-Verzahnung & Strategie-Setup", owner: "N.E.O.", description: "Verknüpfung der Lead-Erfassung mit der S.Y.N.T.A.X. Core-Routing Engine.", priority: "CRITICAL" },
          { step: 2, title: "Zero-Trust Security & Perimeter-Audit", owner: "O.D.I.N. & V.E.G.A.", description: "Prüfung aller TypeScript-Endpunkte und Absicherung vor Angriffen.", priority: "HIGH" },
          { step: 3, title: "Virale Video-Assets mit Veo 3.1", owner: "P.U.L.S.E.", description: "Erstellung von hochkonvertierenden Video-Hooks für Social Media.", priority: "MAX" },
          { step: 4, title: "Globaler Rollout & Timing-Kontrolle", owner: "C.H.R.O.N.O.S. & G.L.O.B.E.", description: "Einhaltung der 48h-Sprints und weltweite Bereitstellung.", priority: "HIGH" },
        ],
      };
      setActiveAgentSyncSynthesis(defaultSynth);
    }
    setIsAgentSyncModalOpen(true);
    addSystemLog("⚡ Agent-Sync Synthesizer Fenster geöffnet.", "agent", "S.Y.N.T.A.X.");
  };
  const [activeSpeakingAgentId, setActiveSpeakingAgentId] = useState<string | null>(null);
  const [dashboardViewMode, setDashboardViewMode] = useState<"dashboard" | "focus">("focus");
  const [showLandingPage, setShowLandingPage] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("app") === "true") return false;
      if (params.get("sales") === "true" || params.get("landing") === "true" || params.get("conversion") === "true") return true;
      if (params.get("maintenance") === "true") return true;
    } catch {}
    return true;
  });
  const [isMaintenanceActive, setIsMaintenanceActive] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      // Only switch to sales page if URL parameter explicitly asks for it
      if (params.get("sales") === "true" || params.get("conversion") === "true" || params.get("landing") === "true") {
        return false;
      }
      if (params.get("maintenance") === "false") return false;
    } catch {}
    return true; // IMMER standardmäßig Wartungs-Website aktiv bei jedem Neuladen!
  });

  // Clean stale storage on load so reload always stays on Maintenance website
  useEffect(() => {
    try {
      if (sessionStorage.getItem("syntax_user_preferred_view") === "sales") {
        sessionStorage.removeItem("syntax_user_preferred_view");
      }
      localStorage.removeItem("syntax_maintenance_mode_active");
    } catch {}
  }, []);
  const [showAgentFleetStudio, setShowAgentFleetStudio] = useState<boolean>(false);
  const [isDailyUsageOpen, setIsDailyUsageOpen] = useState<boolean>(false);
  const [userTerminalModalOpen, setUserTerminalModalOpen] = useState<boolean>(false);
  const [userTerminalInitialTab, setUserTerminalInitialTab] = useState<"overview" | "subscription" | "payment" | "invoices" | "security">("overview");
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);

  const handleOpenSalesPage = () => {
    setIsMaintenanceActive(false);
    setShowLandingPage(true);
  };

  const handleOpenMaintenanceMode = () => {
    setIsMaintenanceActive(true);
    setShowLandingPage(true);
    try {
      localStorage.setItem("syntax_maintenance_mode_active", "true");
      sessionStorage.setItem("syntax_user_preferred_view", "maintenance");
    } catch {}
  };

  const handleEnterSystemApp = () => {
    setShowLandingPage(false);
    try {
      sessionStorage.setItem("syntax_entered_matrix_session", "true");
      localStorage.setItem("syntax_entered_matrix_session", "true");
      sessionStorage.setItem("syntax_user_preferred_view", "app");
    } catch {}
  };

  const handleOpenUserTerminal = (tab: "overview" | "subscription" | "payment" | "invoices" | "security" = "overview") => {
    setUserTerminalInitialTab(tab);
    setUserTerminalModalOpen(true);
    addSystemLog(`👤 User Account & Billing Terminal geöffnet (${tab.toUpperCase()}).`, "info", "S.Y.N.T.A.X.");
  };

  const [agentInspectorOpen, setAgentInspectorOpen] = useState<boolean>(false);
  const [agentInspectorInitialAgentId, setAgentInspectorInitialAgentId] = useState<string>("syntax");

  const handleOpenAgentInspector = (agentId?: string) => {
    if (agentId) {
      setAgentInspectorInitialAgentId(agentId);
    }
    setAgentInspectorOpen(true);
    addSystemLog(`📋 Agenten-Queries & REQ Log Inspektor geöffnet (${agentId || currentAgent.name}).`, "agent", "S.Y.N.T.A.X.");
  };
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<"chat" | "logs" | "tools">("chat");
  const [eventLogs, setEventLogs] = useState<SystemEventLog[]>([
    { id: "1", timestamp: new Date().toLocaleTimeString("de-DE"), type: "info", text: "S.Y.N.T.A.X. Command Dashboard v4.8 initialisiert." },
    { id: "2", timestamp: new Date().toLocaleTimeString("de-DE"), type: "success", text: "Quantum Encryption Core (4096-bit) aktiv." },
    { id: "3", timestamp: new Date().toLocaleTimeString("de-DE"), type: "agent", agentName: "S.Y.N.T.A.X.", text: "System bereit für Anweisungen." }
  ]);

  const addSystemLog = (text: string, type: "info" | "success" | "warn" | "agent" = "info", agentName?: string) => {
    setEventLogs((prev) => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString("de-DE"),
        type,
        agentName,
        text,
      },
      ...prev.slice(0, 49),
    ]);
  };

  // --- RBAC ACCESS TIER ROLE STATE & PROMO LAUNCH SESSION ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const userRole = getActiveUserRole(userProfile);
  const isAdminUser = Boolean(isStoredAdminAuthenticated() || isSuperAdminEmail(getCurrentUserEmail()));
  const hasPromoHeader =
    isPromoTrialActive(userProfile.promoSession) ||
    isPromoTrialExpired(userProfile.promoSession) ||
    (Boolean(userProfile.promoSession?.isEarlyBird) && !userProfile.promoSession?.isDiscordVerified);

  const [roleManagerOpen, setRoleManagerOpen] = useState<boolean>(false);
  const [jarvisTerminalOpen, setJarvisTerminalOpen] = useState<boolean>(false);
  const [rewardProgramOpen, setRewardProgramOpen] = useState<boolean>(false);
  const [adminDatabaseOpen, setAdminDatabaseOpen] = useState<boolean>(false);
  const [adminDatabaseInitialTab, setAdminDatabaseInitialTab] = useState<"ACCESS_KEYS" | "LEADS" | "SLOTS" | "INVOICES" | "AUDIT" | "OSIRIS">("ACCESS_KEYS");
  const [osirisIntelToolOpen, setOsirisIntelToolOpen] = useState<boolean>(false);
  const [osirisInitialTab, setOsirisInitialTab] = useState<"RADAR" | "TERMINAL" | "WEBVIEW" | "SATELLITES" | "CCTV" | "THREATS">("RADAR");
  const [conversionAnalyticsOpen, setConversionAnalyticsOpen] = useState<boolean>(false);
  const [keyWelcomeTourOpen, setKeyWelcomeTourOpen] = useState<boolean>(false);
  const [showMobileVoice, setShowMobileVoice] = useState<boolean>(false);

  // App & Tool Orchestrator Modal state
  const [appToolManagerOpen, setAppToolManagerOpen] = useState<boolean>(false);
  const [selectedAgentForToolManager, setSelectedAgentForToolManager] = useState<string | undefined>(undefined);

  const handleOpenAppToolManager = (agentId?: string) => {
    setSelectedAgentForToolManager(agentId || currentAgent.id);
    setAppToolManagerOpen(true);
  };

  const handleOpenAppDirectly = (appId: string) => {
    switch (appId) {
      case "webBrowser":
        setActiveWidgets((prev) => ({ ...prev, webBrowser: true }));
        break;
      case "calendarWidget":
        setActiveWidgets((prev) => ({ ...prev, calendarWidget: true }));
        break;
      case "claudeCode":
        setActiveWidgets((prev) => ({ ...prev, claudeCode: true }));
        break;
      case "dailyObjectives":
        setActiveWidgets((prev) => ({ ...prev, dailyObjectives: true }));
        break;
      case "googleMaps":
        setActiveWidgets((prev) => ({ ...prev, googleMaps: true }));
        break;
      case "veoStudio":
        setVeoStudioOpen(true);
        break;
      case "jarvisTerminal":
        setJarvisTerminalOpen(true);
        break;
      case "socialUpload":
        setActiveWidgets((prev) => ({ ...prev, socialUpload: true }));
        break;
      case "miniTrades":
        setActiveWidgets((prev) => ({ ...prev, miniTrades: true }));
        break;
      case "gmailInbox":
        setActiveWidgets((prev) => ({ ...prev, gmailInbox: true }));
        break;
      case "cctvSurveillance":
        setOsirisInitialTab("CCTV");
        setOsirisIntelToolOpen(true);
        break;
      case "osirisIntel":
        setOsirisInitialTab("RADAR");
        setOsirisIntelToolOpen(true);
        break;
      default:
        break;
    }
  };

  const handleOpenOsirisIntel = () => {
    setOsirisIntelToolOpen(true);
  };

  // --- REAL-TIME SESSION KICK & MULTI-MONITOR TERMINATION STATE ---
  const [kickedSessionModal, setKickedSessionModal] = useState<{
    isOpen: boolean;
    reason: string;
    email: string;
  } | null>(null);

  const [pendingApprovalNoticeModal, setPendingApprovalNoticeModal] = useState<{
    isOpen: boolean;
    email: string;
  } | null>(null);

  // --- URL 1-CLICK ACCESS KEY AUTO-REDEEM ON MOUNT ---
  useEffect(() => {
    // Start client telemetry heartbeat for real-time live user & conversion tracking
    startTelemetryHeartbeat();

    const autoKeyRes = autoRedeemKeyFromUrlQuery();
    if (autoKeyRes.redeemed && autoKeyRes.key) {
      setUserProfile(getStoredUserProfile());
      addSystemLog(
        `🔑 1-Klick-Key '${autoKeyRes.key.toUpperCase()}' registriert!`,
        "success",
        "S.Y.N.T.A.X."
      );
    }
  }, []);

  // Update telemetry context on mount
  useEffect(() => {
    updateTelemetryContext("Sovereign Matrix Cockpit", "Syntax");
  }, []);

  useEffect(() => {
    let isChecking = false;
    const checkActiveSession = async () => {
      if (isChecking) return;
      isChecking = true;

      try {
        // 1. If currently authenticated as Master Admin via Key / PIN, never kick under any circumstances
        if (isStoredAdminAuthenticated()) {
          isChecking = false;
          return;
        }

        const activeEmail = (getCurrentUserEmail() || "").trim().toLowerCase();

        // 2. If session has authenticated Admin privileges, allow unrestricted access
        if (isStoredAdminAuthenticated()) {
          isChecking = false;
          return;
        }

        // 3. If user is inside the dashboard and not on the landing page
        if (!showLandingPage) {
          const isSessionValid =
            isStoredAdminAuthenticated() ||
            sessionStorage.getItem("syntax_entered_matrix_session") === "true" ||
            localStorage.getItem("syntax_entered_matrix_session") === "true" ||
            Boolean(getActiveAccessKey());

          if (!activeEmail && !isSessionValid) {
            setShowLandingPage(true);
            try {
              sessionStorage.removeItem("syntax_entered_matrix_session");
            } catch {}
            isChecking = false;
            return;
          }

          // Check local state immediately
          const accessCheck = checkEmailAccessStatus(activeEmail);
          if (!accessCheck.hasAccess && accessCheck.status === "REVOKED") {
            setShowLandingPage(true);
            setKickedSessionModal({
              isOpen: true,
              email: activeEmail,
              reason: accessCheck.reason || "Dieser Account wurde vom Administrator (philippsteidle5@gmail.com) gesperrt.",
            });
            try {
              localStorage.removeItem("maze_registered_vip_user");
              localStorage.removeItem("maze_current_user_email");
            } catch {}
            isChecking = false;
            return;
          }

          // Real-time Server API verification for multi-browser / multi-device instant kick
          try {
            const res = await fetch(`/api/leads/check-access?email=${encodeURIComponent(activeEmail)}`);
            if (res.ok) {
              const serverData = await res.json();
              // Only kick out if the server explicitly reports REVOKED
              if (serverData && serverData.status === "REVOKED") {
                setShowLandingPage(true);
                setKickedSessionModal({
                  isOpen: true,
                  email: activeEmail,
                  reason: serverData.reason || "Dieser Account wurde vom Administrator (philippsteidle5@gmail.com) gesperrt.",
                });
                try {
                  localStorage.removeItem("maze_registered_vip_user");
                  localStorage.removeItem("maze_current_user_email");
                } catch {}
              } else if (serverData && serverData.status === "UNREGISTERED") {
                // If client has local grant but server is fresh, sync database to server
                const localLeads = getLeadsDatabase();
                fetch("/api/leads/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ leads: localLeads }),
                }).catch(() => {});
              }
            }
          } catch {
            // offline fallback
          }
        }
      } finally {
        isChecking = false;
      }
    };

    // 1. Initial check & fast interval tick every 300ms
    checkActiveSession();
    const interval = setInterval(checkActiveSession, 300);

    // 2. BroadcastChannel cross-tab & cross-monitor listener
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(AUTH_BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        const data = event.data;
        const currentEmail = (getCurrentUserEmail() || "").trim().toLowerCase();

        // Stored Admin is completely immune to any kick events
        if (isStoredAdminAuthenticated() || isSuperAdminEmail(currentEmail)) {
          return;
        }

        if (data && (data.type === "SESSION_KICK" || data.type === "STATUS_CHANGED")) {
          const targetEmail = (data.email || "").trim().toLowerCase();
          
          // Only kick this session if target email matches the current session email
          if (targetEmail && currentEmail && targetEmail === currentEmail) {
            if (data.status === "REVOKED" || data.type === "SESSION_KICK") {
              setShowLandingPage(true);
              setKickedSessionModal({
                isOpen: true,
                email: currentEmail,
                reason: data.reason || "Account wurde vom Administrator gesperrt und sofort beendet.",
              });
              try {
                localStorage.removeItem("maze_registered_vip_user");
                localStorage.removeItem("maze_current_user_email");
              } catch {}
            }
          }
          checkActiveSession();
        }
      };
    }

    // 3. Custom DOM & Storage event listeners
    const handleAuthEvent = () => {
      checkActiveSession();
    };
    window.addEventListener("maze_auth_state_change", handleAuthEvent);
    window.addEventListener("storage", handleAuthEvent);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener("maze_auth_state_change", handleAuthEvent);
      window.removeEventListener("storage", handleAuthEvent);
    };
  }, [showLandingPage]);

  // --- AGENT FLEET STUDIO MODAL STATE ---
  const [agentFleetStudioOpen, setAgentFleetStudioOpen] = useState<boolean>(false);

  // --- VEO 3.1 AI VIDEO SYNTHESIZER STUDIO STATE ---
  const [veoStudioOpen, setVeoStudioOpen] = useState<boolean>(false);
  const [veoStudioInitialImage, setVeoStudioInitialImage] = useState<string | null>(null);

  const handleOpenVeoStudio = (initialImg?: string) => {
    setVeoStudioInitialImage(initialImg || selectedImage || null);
    setVeoStudioOpen(true);
  };

  // --- SCREEN PERCEPTION & AUTONOMOUS WEB ACTION STATES ---
  const [screenPermissionOpen, setScreenPermissionOpen] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenPendingAction, setScreenPendingAction] = useState<PendingScreenAction | null>(null);
  const [browserInitialUrl, setBrowserInitialUrl] = useState<string | undefined>(undefined);
  const [browserInitialTitle, setBrowserInitialTitle] = useState<string | undefined>(undefined);

  const executeScreenAction = (action: PendingScreenAction) => {
    let url = action.targetUrl;
    if (!url) {
      if (action.type === "youtube") {
        url = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(action.query)}`;
      } else if (action.type === "flight") {
        url = `https://www.google.com/travel/flights?q=${encodeURIComponent(action.query)}`;
      } else if (action.type === "hotel") {
        url = `https://www.booking.com/searchresults.de.html?ss=${encodeURIComponent(action.query)}`;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(action.query)}`;
      }
    }
    setBrowserInitialUrl(url);
    setBrowserInitialTitle(action.title);
    setActiveWidgets((prev) => ({ ...prev, webBrowser: true }));
    addSystemLog(`Autonome Web-Aktion gestartet: ${action.title}`, "success", currentAgent.name);
  };

  const handleTriggerScreenAction = (action: PendingScreenAction) => {
    setScreenPendingAction(action);
    if (action.type === "youtube") {
      executeScreenAction(action);
    }

    if (!isScreenSharing) {
      setScreenPermissionOpen(true);
      speak(`Mr, N.E.O. und S.Y.N.T.A.X. bitten um Erlaubnis für deinen Monitor. Bitte wähle gleich Monitor 1 oder Monitor 2 aus!`);
    } else {
      speak(`Aktion gestartet! Ich schaue live auf deinen Monitor.`);
    }
  };

  // Check for autostart parameter when opened in standalone window
  const [showAutostartModal, setShowAutostartModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("autostart") === "1") {
      setShowAutostartModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGrantScreenPermission = async () => {
    try {
      setScreenPermissionOpen(false);
      setShowAutostartModal(false);

      const isInIframe = window.self !== window.top;

      if (isInIframe) {
        // In Chrome iframe, getDisplayMedia is blocked by feature policy.
        // Opening standalone window on click preserves user gesture and allows getDisplayMedia!
        const standaloneUrl = window.location.origin + window.location.pathname + "?autostart=1";
        window.open(standaloneUrl, "_blank");
        speak("Ich öffne die Monitor-Freigabe im Hauptfenster.");
        addSystemLog("Monitor-Freigabe im Hauptfenster geöffnet.", "info");
        return;
      }

      let stream: MediaStream | null = null;

      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" } as any, audio: false });
        } catch (e) {
          try {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          } catch (inner) {
            console.warn("getDisplayMedia call rejected:", inner);
          }
        }
      }

      if (stream) {
        setScreenStream(stream);
        setIsScreenSharing(true);
        addSystemLog("Bildschirm-Freigabe gestartet. Live-Analyse aktiv.", "info");

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          addSystemLog("Bildschirm-Freigabe beendet.", "warn");
        };

        // Auto-capture live frame from stream and send to AI agent for immediate Vision Analysis
        setTimeout(() => {
          try {
            const video = document.createElement("video");
            video.srcObject = stream;
            video.muted = true;
            video.play();
            video.onloadeddata = () => {
              setTimeout(() => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth || 1280;
                canvas.height = video.videoHeight || 720;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL("image/png");
                  handleSendMessageToAgent(
                    currentAgent.id,
                    "Hier ist die Live-Aufnahme meines Monitors, Mr. Was siehst du auf meinem Bildschirm? Analysiere und erkläre mir die sichtbaren Programme, Fenster, Tabs und Inhalte im Detail!",
                    dataUrl,
                    "ALL",
                    false
                  );
                }
              }, 500);
            };
          } catch (err) {
            console.warn("Auto snapshot capture failed:", err);
          }
        }, 400);

        if (screenPendingAction) {
          speak(`Bildschirm-Zugriff gewährt! N.E.O. und die Flotte analysieren deinen Monitor für: ${screenPendingAction.title}.`);
        } else {
          speak("Bildschirm-Zugriff gewährt! N.E.O. und die Flotte schauen jetzt LIVE auf deinen Monitor.");
        }
      } else {
        alert("Bildschirm-Freigabe wird in diesem Browser nicht unterstützt oder wurde abgebrochen.");
      }
    } catch (err: any) {
      console.error("Screen capture error:", err);
      addSystemLog(`Bildschirm-Freigabe abgebrochen: ${err?.message || err}`, "warn");
    }
  };

  const handleStopScreenSharing = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
    addSystemLog("Bildschirm-Freigabe manuell gestoppt.", "info");
  };

  const handleSelectUserRole = (newRole: UserRole) => {
    const updated: UserProfile = {
      ...userProfile,
      purchasedRole: newRole,
    };
    saveUserProfile(updated);
    setUserProfile(updated);
  };

  const handleUpdateUserProfile = (updated: UserProfile) => {
    saveUserProfile(updated);
    setUserProfile(updated);
  };

  // Auto-switch currentAgent if it's not allowed in active userRole
  useEffect(() => {
    if (!isAgentAllowed(userRole, currentAgent.id)) {
      const firstAllowed = agents.find((ag) => isAgentAllowed(userRole, ag.id));
      if (firstAllowed) {
        setCurrentAgent(firstAllowed);
      }
    }
  }, [userRole, currentAgent.id, agents]);

  const DEFAULT_ACTIVE_WIDGETS: ActiveWidgetsConfig = {
    googleMaps: false,
    codeMapsBar: false,
    claudeCode: false,
    webBrowser: false,
    appStore: false,
    gmailInbox: false,
    socialUpload: false,
    miniTrades: false,
    agentChat: true,
    systemStats: true,
    mazeCore: true,
    jarvisTrader: false,
    weatherWidget: false,
    calendarWidget: false,
    dailyObjectives: false,
    agentDock: true,
  };

  const [activeWidgets, setActiveWidgets] = useState<ActiveWidgetsConfig>(() => {
    try {
      const saved = localStorage.getItem("jarvis_widgets_config_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return { ...DEFAULT_ACTIVE_WIDGETS, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Could not load widgets config", e);
    }
    return DEFAULT_ACTIVE_WIDGETS;
  });

  const [agentDockPosition, setAgentDockPosition] = useState<"high" | "center" | "low">(() => {
    try {
      const saved = localStorage.getItem("jarvis_agent_dock_pos");
      if (saved === "high" || saved === "center" || saved === "low") return saved;
    } catch (e) {}
    return "center";
  });

  const handleOpenSocialUpload = (platform?: "tiktok" | "instagram") => {
    if (platform) setSocialUploadPlatform(platform);
    setActiveWidgets((prev) => ({ ...prev, socialUpload: true }));
  };

  const [coreStyling, setCoreStyling] = useState<MazeCoreStyling>(() => {
    try {
      const saved = localStorage.getItem("jarvis_core_styling_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.shape === "sphere" && parsed.color === "#00F0FF") {
          return { ...parsed, shape: "auto", color: "auto" };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load core styling", e);
    }
    return {
      shape: "auto",
      color: "auto",
      density: 5000,
      speed: 1.0,
      audioSensitivity: 1.0,
    };
  });

  const handleToggleWidget = (key: keyof ActiveWidgetsConfig) => {
    setActiveWidgets((prev) => {
      const current = prev && typeof prev === "object" ? prev : DEFAULT_ACTIVE_WIDGETS;
      const nextVal = !current[key];
      if (key === "googleMaps" && nextVal && !activeMapData) {
        setActiveMapData({ city: "Tokyo Cyber Radar", isRoute: false });
      }
      if (key === "agentChat" && nextVal) {
        setShowChat(true);
      }
      return {
        ...current,
        [key]: nextVal,
      };
    });
  };

  const handleApplyPreset = (preset: "coder" | "trader" | "visionos") => {
    if (preset === "coder") {
      setActiveWidgets({
        googleMaps: false,
        codeMapsBar: true,
        claudeCode: true,
        webBrowser: true,
        appStore: true,
        gmailInbox: true,
        miniTrades: false,
        agentChat: true,
        systemStats: true,
        mazeCore: true,
        jarvisTrader: false,
        weatherWidget: true,
        calendarWidget: false,
        agentDock: true,
      });
      setShowChat(true);
      setCoreStyling((prev) => ({ ...prev, shape: "torus", color: "#00F0FF" }));
    } else if (preset === "trader") {
      setActiveWidgets({
        googleMaps: true,
        codeMapsBar: false,
        claudeCode: false,
        webBrowser: false,
        appStore: false,
        gmailInbox: false,
        miniTrades: true,
        agentChat: false,
        systemStats: true,
        mazeCore: true,
        jarvisTrader: false,
        weatherWidget: true,
        calendarWidget: false,
        agentDock: true,
      });
      if (!activeMapData) setActiveMapData({ city: "Tokyo Cyber Radar", isRoute: false });
      setCoreStyling((prev) => ({ ...prev, shape: "vortex", color: "#9945FF" }));
    } else {
      setActiveWidgets({
        googleMaps: true,
        codeMapsBar: true,
        claudeCode: true,
        webBrowser: true,
        appStore: true,
        gmailInbox: true,
        miniTrades: true,
        agentChat: true,
        systemStats: true,
        mazeCore: true,
        jarvisTrader: false,
        weatherWidget: true,
        calendarWidget: true,
        agentDock: true,
      });
      if (!activeMapData) setActiveMapData({ city: "Tokyo Cyber Radar", isRoute: false });
      setShowChat(true);
      setCoreStyling((prev) => ({ ...prev, shape: "auto", color: "auto" }));
    }
  };

  const handleSaveAndApplyLayout = () => {
    try {
      localStorage.setItem("jarvis_widgets_config_v2", JSON.stringify(activeWidgets));
      localStorage.setItem("jarvis_core_styling_v1", JSON.stringify(coreStyling));
      
      // Confirmation Audio Chime Effect
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.25); // C6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn("Error saving layout config", e);
    }
    setIsEditMode(false);
    setIsFocusMode(false);
  };

  // Dynamic Google Maps 3D Context-Switch State for ANY city/location or route
  const [activeMapData, setActiveMapData] = useState<ActiveMapData | null>(null);
  const [routeOriginInput, setRouteOriginInput] = useState<string>("");
  const [routeDestInput, setRouteDestInput] = useState<string>("");
  const [mapType, setMapType] = useState<"m" | "k" | "h">("m"); // m: roadmap, k: satellite 3d, h: hybrid
  const [isDarkMap, setIsDarkMap] = useState<boolean>(true); // Default to dark mode map
  const [mapZoom, setMapZoom] = useState<number>(6); // Default 6: high-level country/region overview perspective

  // NLP Location, Route & Map Command Parser: Ultra-fast (<1ms) instant intent recognition
  const detectMapRequestFromMessage = (text: string): { isClose?: boolean; mapData?: ActiveMapData } | null => {
    if (!text) return null;
    const clean = text.trim();

    // 1. Explicit close command
    if (/(?:karte|map|radar)\s*(?:schließen|schliessen|ausblenden|beenden|zu|weg|schließe|schliesse)|schließe\s*(?:die\s*)?(?:karte|map|radar)|hide\s*(?:map|radar)|close\s*(?:map|radar)|map\s*schließen/i.test(clean)) {
      return { isClose: true };
    }

    // CRITICAL FIX: Conversational, advisory, questions, hypotheticals, travel consultations, flight anxiety,
    // stopovers or complex inquiries MUST NOT be intercepted as direct map commands!
    // They must be processed by the full AI Agent (Fleet Delegation Matrix / Gemini)!
    const isConsultationOrQuestion = 
      clean.includes("?") ||
      /(?:nehmen wir an|was wenn|hast du eine idee|hast du ideen|was empfiehlst|empfehlung|was hältst|wie sieht|was denkst|tipps|flugangst|angst|panik|turbulenz|zwischenstopp|zwischenstop|umsteigen|layover|stopover|fliegen|flug|airline|flugverbindung|flugroute|überleg|beratung|meinung|warum|welche vorteile|vorteil|nachteil|wie ist|wie war|erkläre|erzähl|hilfe bei)/i.test(clean);

    if (isConsultationOrQuestion) {
      return null;
    }

    const sanitizeLoc = (str: string) => {
      return str
        .replace(/jarvis/gi, "")
        .replace(/syntax|maze|neo|vega|odin|pulse|chronos|oracle|globe/gi, "")
        .replace(/bitte/gi, "")
        .replace(/auf der karte/gi, "")
        .replace(/auf karte/gi, "")
        .replace(/aufs display/gi, "")
        .replace(/auf das display/gi, "")
        .replace(/auf den bildschirm/gi, "")
        .replace(/im 3d modus/gi, "")
        .replace(/im hud/gi, "")
        .replace(/ausrechnen|berechnen|berechne|route|navigation|wie komme ich|weg/gi, "")
        .replace(/[?!.,;:()]/g, "")
        .trim();
    };

    // Conversational non-location stop words (do not treat these as cities)
    const nonLocationPhrases = new Set([
      "hallo", "hi", "hey", "servus", "moin", "guten morgen", "guten tag", "guten abend",
      "danke", "dankeschön", "danke dir", "thx", "thanks", "thank you",
      "ok", "okay", "gut", "super", "klasse", "toll", "perfekt", "nice", "geil", "stabil",
      "ja", "nein", "yes", "no", "stop", "stopp", "warte", "weiter", "weiter so",
      "hilfe", "help", "wer bist du", "was kannst du", "wie gehts", "wie geht es dir",
      "status", "test", "clear", "löschen", "abbrechen", "abgemacht"
    ]);

    const cleanLower = clean.toLowerCase().replace(/[?!.,]/g, "").trim();
    if (nonLocationPhrases.has(cleanLower)) {
      return null;
    }

    // 2. Direct Route / Directions patterns
    // e.g. "Frankfurt nach Shanghai", "Shanghai to Tokyo", "von Berlin nach Paris", "FFM -> Berlin"
    const routePatterns = [
      /(?:berechne|berechnen|zeig|zeige|plane|finde|such|suche|navigation|navigiere|route|strecke|anfahrt|verbindung)\s+(?:mir\s+)?(?:eine\s+)?(?:route|weg|verbindung|navigation|strecke)\s*(?:von|ab)?\s+([A-Za-zÄÖÜäöüß0-9\s\-]+?)\s+(?:nach|zu|bis|to|->)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
      /(?:route|weg|fahrt|strecke|navigation|anfahrt|verbindung)\s+(?:von|ab)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+?)\s+(?:nach|zu|bis|to|->)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
      /(?:wie\s+komme\s+ich|wie\s+fahre\s+ich|navigiere\s+mich)\s+(?:von|ab)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+?)\s+(?:nach|zu|bis|to)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
      // Direct "CityA nach CityB" or "von CityA nach CityB"
      /^(?:von\s+)?([A-Za-zÄÖÜäöüß\s\-]{2,30})\s+(?:nach|to|->)\s+([A-Za-zÄÖÜäöüß\s\-]{2,30})$/i,
    ];

    for (const pat of routePatterns) {
      const match = clean.match(pat);
      if (match && match[1] && match[2]) {
        let orig = sanitizeLoc(match[1]);
        let dest = sanitizeLoc(match[2]);

        if (orig.toLowerCase() === "ffm" || orig.toLowerCase() === "frankfurt") orig = "Frankfurt am Main";
        if (dest.toLowerCase() === "ffm" || dest.toLowerCase() === "frankfurt") dest = "Frankfurt am Main";

        const stopWords = ["mir", "eine", "karte", "3d-karte", "bild", "foto", "hologramm", "aus", "über", "von", "in", "die", "das", "der", "welche", "welcher", "display", "hud"];
        if (orig && dest && !stopWords.includes(orig.toLowerCase()) && !stopWords.includes(dest.toLowerCase()) && orig.length >= 2 && dest.length >= 2) {
          let travelMode: "d" | "w" | "b" = "d";
          if (/zu\s+fuß|gehen|laufen|walk/i.test(clean)) travelMode = "w";
          if (/fahrrad|bike|rad/i.test(clean)) travelMode = "b";

          return {
            mapData: {
              origin: orig,
              destination: dest,
              travelMode,
              isRoute: true,
            }
          };
        }
      }
    }

    // 3. Single-Endpoint Route (e.g. "Route nach Shanghai", "Navigation nach Berlin", "wie komme ich nach Paris", "Weg nach Tokio", "Fahrt nach Darmstadt")
    const singleRoutePatterns = [
      /(?:berechne|berechnen|plane|zeig|zeige|finde|suche)?\s*(?:eine\s+)?(?:route|navigation|weg|fahrt|anfahrt|strecke)\s+(?:nach|zu|bis|to)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
      /(?:wie\s+komme\s+ich|wie\s+fahre\s+ich|navigiere\s+(?:mich\s+)?)\s+(?:nach|zu|bis|to)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
      /(?:fahre?|fliege?|reise?|bring\s+mich)\s+(?:nach|zu)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
    ];

    for (const pat of singleRoutePatterns) {
      const match = clean.match(pat);
      if (match && match[1]) {
        let dest = sanitizeLoc(match[1]);
        if (dest.toLowerCase() === "ffm") dest = "Frankfurt am Main";
        if (dest && dest.length >= 2) {
          return {
            mapData: {
              origin: "Frankfurt am Main",
              destination: dest,
              travelMode: /zu\s+fuß|gehen|walk/i.test(clean) ? "w" : /fahrrad|bike/i.test(clean) ? "b" : "d",
              isRoute: true,
            }
          };
        }
      }
    }

    // 4. Hotel & POI Specific Patterns (e.g. "Hotels in Shanghai", "Shanghai Hotels", "Unterkünfte in Berlin", "Waldhotels Darmstadt", "Waldhotels", "Waldhotel")
    const hotelPatterns = [
      /(?:hotels?|unterk(?:u|ü)nfte?|hostels?|pensionen?|luxury\s*hotels?)\s+(?:in|bei|nahe|rund\s+um|von)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
      /([A-Za-zÄÖÜäöüß0-9\s\-]+?)\s+(?:hotels?|unterk(?:u|ü)nfte?|unterkunft|hostels?)/i,
      /(?:zeige?|finde?|suche?|markiere?|wo\s+sind)\s+(?:mir\s+)?(?:die\s+)?(?:hotels?|unterk(?:u|ü)nfte?)\s+(?:in|bei|nahe|von)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
      /(?:karte\s+von\s+)?([A-Za-zÄÖÜäöüß0-9\s\-]+?)\s+(?:mit\s+hotels?|hotels?|unterk(?:u|ü)nfte?)/i,
      /(waldhotels?|waldhotel|naturhotels?|naturhotel)(?:\s+(?:in|bei|nahe|rund\s+um|von))?(?:\s+([A-Za-zÄÖÜäöüß0-9\s\-]+))?/i,
    ];

    for (const pat of hotelPatterns) {
      const match = clean.match(pat);
      if (match) {
        let loc = match[1] ? sanitizeLoc(match[1]) : "";
        if (/waldhotel/i.test(match[0])) {
          const suffix = match[2] ? sanitizeLoc(match[2]) : "";
          return {
            mapData: {
              city: suffix ? `Waldhotels in ${suffix}` : "Waldhotels Region Frankfurt / Darmstadt",
              query: suffix ? `Waldhotels in ${suffix}` : "Waldhotels Region Frankfurt / Darmstadt",
              category: "hotels",
              zoom: 13,
              isRoute: false,
            }
          };
        }
        if (loc.toLowerCase() === "ffm" || loc.toLowerCase() === "ffm mitte") loc = "Frankfurt Mitte";
        if (loc.toLowerCase() === "frankfurt") loc = "Frankfurt am Main Mitte";
        if (loc && loc.length >= 2) {
          return {
            mapData: {
              city: `Hotels in ${loc}`,
              query: `Hotels in ${loc}`,
              category: "hotels",
              zoom: 15,
              isRoute: false,
            }
          };
        }
      }
    }

    const mentionsHotels = /(?:hotel|hotels|unterkunft|unterkünfte|übernachtung|hostel|zimmer|suite)/i.test(clean);

    // 5. Explicit Map / Projection Patterns (e.g. "zeig mir Shanghai", "karte von Shanghai", "projektiere Shanghai aufs display", "Shanghai 3D")
    const strictCityPatterns = [
      /(?:projektiere|projiziere|zeige?|öffne?|starte?)\s+(?:mir\s+)?(?:eine\s+|die\s+)?(?:karte|3d-karte|satellitenkarte|satellitenansicht|google\s*maps)\s+(?:von|für|über)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+?)(?:\s+aufs\s+display|\s+auf\s+den\s+bildschirm|\s+im\s+hud|\s+auf\s+der\s+karte|\s+3d|\,|\.|\!|\?|$)/i,
      /(?:karte\s+von|3d-karte\s+von|satellitenkarte\s+von|satellitenansicht\s+von|google\s*maps\s+von|map\s+of)\s+([A-Za-zÄÖÜäöüß0-9\s\-]+?)(?:\s+aufs\s+display|\s+auf\s+den\s+bildschirm|\s+im\s+hud|\s+anzeigen|\s+öffnen|\s+starten|\,|\.|\!|\?|$)/i,
      /(?:zeige?|show)\s+(?:mir\s+|me\s+)?([A-Za-zÄÖÜäöüß0-9\s\-]+?)\s+(?:auf\s+der\s+karte|auf\s+google\s*maps|auf\s+maps|auf\s+dem\s+radar|im\s+kartenprojektor)/i,
      /(?:project|open|show)\s+(?:me\s+)?(?:a\s+)?(?:map|satellite\s+view)\s+of\s+([A-Za-zÄÖÜäöüß0-9\s\-]+)/i,
    ];

    for (const pat of strictCityPatterns) {
      const match = clean.match(pat);
      if (match && match[1]) {
        let candidate = sanitizeLoc(match[1]);
        const stopWords = ["mir", "eine", "karte", "3d-karte", "bild", "foto", "hologramm", "aus", "über", "von", "in", "die", "das", "der", "welche", "welcher", "display", "bildschirm", "hud"];
        if (candidate && candidate.length >= 2 && !stopWords.includes(candidate.toLowerCase())) {
          if (candidate.toLowerCase() === "ffm" || candidate.toLowerCase() === "ffm mitte") candidate = "Frankfurt Mitte";
          return {
            mapData: {
              city: mentionsHotels ? `Hotels in ${candidate}` : candidate,
              query: mentionsHotels ? `Hotels in ${candidate}` : candidate,
              category: mentionsHotels ? "hotels" : undefined,
              zoom: mentionsHotels ? 15 : 14,
              isRoute: false,
            }
          };
        }
      }
    }

    // 6. Direct Location / City Intent (Instant detection when the user says "Shanghai", "Tokio", "Paris", "Berlin", "zeige Shanghai", "ab nach Tokio", etc.)
    const KNOWN_DESTINATIONS: Record<string, { name: string; query: string; zoom: number }> = {
      "shanghai": { name: "Shanghai", query: "Shanghai", zoom: 12 },
      "guangzhou": { name: "Guangzhou", query: "Guangzhou", zoom: 12 },
      "canton": { name: "Guangzhou", query: "Guangzhou", zoom: 12 },
      "kanton": { name: "Guangzhou", query: "Guangzhou", zoom: 12 },
      "reykjavik": { name: "Reykjavik", query: "Reykjavik", zoom: 12 },
      "reykjavík": { name: "Reykjavik", query: "Reykjavik", zoom: 12 },
      "island": { name: "Reykjavik", query: "Reykjavik", zoom: 12 },
      "tokio": { name: "Tokio", query: "Tokio", zoom: 12 },
      "tokyo": { name: "Tokio", query: "Tokio", zoom: 12 },
      "peking": { name: "Peking", query: "Peking", zoom: 12 },
      "beijing": { name: "Peking", query: "Peking", zoom: 12 },
      "frankfurt": { name: "Frankfurt am Main", query: "Frankfurt am Main", zoom: 13 },
      "ffm": { name: "Frankfurt am Main", query: "Frankfurt am Main", zoom: 13 },
      "frankfurt mitte": { name: "Frankfurt am Main Mitte", query: "Frankfurt am Main Mitte", zoom: 14 },
      "darmstadt": { name: "Darmstadt", query: "Darmstadt", zoom: 13 },
      "waldhotels": { name: "Waldhotels Region Frankfurt / Darmstadt", query: "Waldhotels Region Frankfurt / Darmstadt", zoom: 13 },
      "waldhotel": { name: "Waldhotels Region Frankfurt / Darmstadt", query: "Waldhotels Region Frankfurt / Darmstadt", zoom: 13 },
      "berlin": { name: "Berlin", query: "Berlin", zoom: 12 },
      "paris": { name: "Paris", query: "Paris", zoom: 12 },
      "new york": { name: "New York City", query: "New York City", zoom: 12 },
      "nyc": { name: "New York City", query: "New York City", zoom: 12 },
      "manhattan": { name: "Manhattan, New York", query: "Manhattan, New York", zoom: 13 },
      "london": { name: "London", query: "London", zoom: 12 },
      "münchen": { name: "München", query: "München", zoom: 12 },
      "munich": { name: "München", query: "München", zoom: 12 },
      "hamburg": { name: "Hamburg", query: "Hamburg", zoom: 12 },
      "köln": { name: "Köln", query: "Köln", zoom: 12 },
      "cologne": { name: "Köln", query: "Köln", zoom: 12 },
      "düsseldorf": { name: "Düsseldorf", query: "Düsseldorf", zoom: 12 },
      "stuttgart": { name: "Stuttgart", query: "Stuttgart", zoom: 12 },
      "rom": { name: "Rom", query: "Rom", zoom: 12 },
      "rome": { name: "Rom", query: "Rom", zoom: 12 },
      "mailand": { name: "Mailand", query: "Mailand", zoom: 12 },
      "milan": { name: "Mailand", query: "Mailand", zoom: 12 },
      "wien": { name: "Wien", query: "Wien", zoom: 12 },
      "vienna": { name: "Wien", query: "Wien", zoom: 12 },
      "zürich": { name: "Zürich", query: "Zürich", zoom: 12 },
      "zurich": { name: "Zürich", query: "Zürich", zoom: 12 },
      "dubai": { name: "Dubai", query: "Dubai", zoom: 12 },
      "abu dhabi": { name: "Abu Dhabi", query: "Abu Dhabi", zoom: 12 },
      "singapur": { name: "Singapur", query: "Singapur", zoom: 12 },
      "singapore": { name: "Singapur", query: "Singapur", zoom: 12 },
      "hongkong": { name: "Hongkong", query: "Hongkong", zoom: 12 },
      "hong kong": { name: "Hongkong", query: "Hongkong", zoom: 12 },
      "bangkok": { name: "Bangkok", query: "Bangkok", zoom: 12 },
      "seoul": { name: "Seoul", query: "Seoul", zoom: 12 },
      "sydney": { name: "Sydney", query: "Sydney", zoom: 12 },
      "los angeles": { name: "Los Angeles", query: "Los Angeles", zoom: 12 },
      "san francisco": { name: "San Francisco", query: "San Francisco", zoom: 12 },
      "miami": { name: "Miami", query: "Miami", zoom: 12 },
      "barcelona": { name: "Barcelona", query: "Barcelona", zoom: 12 },
      "madrid": { name: "Madrid", query: "Madrid", zoom: 12 },
      "amsterdam": { name: "Amsterdam", query: "Amsterdam", zoom: 12 },
      "lissabon": { name: "Lissabon", query: "Lissabon", zoom: 12 },
      "lisbon": { name: "Lissabon", query: "Lissabon", zoom: 12 },
    };

    // Check if clean input is an explicit dedicated map command for a known destination
    // e.g. "Shanghai", "shanghai!", "zeige shanghai", "karte von shanghai", "ab nach shanghai", "shanghai bitte"
    // MUST NOT match when part of a longer sentence or conversational context
    for (const [key, meta] of Object.entries(KNOWN_DESTINATIONS)) {
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const isTargetedCityCommand = new RegExp(`^(?:(?:zeige?|finde?|projektiere|öffne?|karte\s+von|3d-karte\s+von|radar\s+von|ab\s+nach|flieg\s+nach|ziel:)\s+)?${escapedKey}(?:\s+(?:auf\s+der\s+karte|auf\s+maps|aufs\s+display|im\s+hud|3d|bitte))?[!.]*$`, "i").test(clean);
      if (isTargetedCityCommand) {
        return {
          mapData: {
            city: mentionsHotels ? `Hotels in ${meta.name}` : meta.name,
            query: mentionsHotels ? `Hotels in ${meta.name}` : meta.query,
            category: mentionsHotels ? "hotels" : "plain",
            zoom: mentionsHotels ? 15 : meta.zoom,
            isRoute: false,
          }
        };
      }
    }

    // 7. Heuristic fallback for short place inquiries (1-3 words)
    // e.g. "zeige Heidelberg", "wo ist Barcelona", "karte Potsdam", "ab nach Athen"
    const shortPlaceMatch = clean.match(/^(?:zeige?|finde?|suche?|öffne?|wo\s+ist|ab\s+nach|flieg\s+nach|ziel:)\s+([A-Za-zÄÖÜäöüß\s\-]{2,25})[!.]*$/i);
    if (shortPlaceMatch && shortPlaceMatch[1]) {
      const place = sanitizeLoc(shortPlaceMatch[1]);
      if (place && place.length >= 2 && !nonLocationPhrases.has(place.toLowerCase())) {
        return {
          mapData: {
            city: mentionsHotels ? `Hotels in ${place}` : place,
            query: mentionsHotels ? `Hotels in ${place}` : place,
            category: mentionsHotels ? "hotels" : "plain",
            zoom: mentionsHotels ? 15 : 13,
            isRoute: false,
          }
        };
      }
    }

    // 8. Generic Map Open request (e.g. "öffne google maps", "google maps öffnen", "öffne maps", "karten app öffnen", "open maps")
    if (/(?:öffne?|starte?|zeige?|open|launch)\s+(?:die\s+)?(?:google\s*maps|maps|karte|karten-?app|kartenansicht|radar)|(?:google\s*maps|maps|karte|karten-?app)\s+(?:öffnen|starten|anzeigen)/i.test(clean)) {
      const isHotelReq = mentionsHotels;
      return {
        mapData: {
          city: isHotelReq ? "Hotels in Frankfurt Mitte" : "Frankfurt am Main",
          query: isHotelReq ? "Hotels in Frankfurt Mitte" : "Frankfurt am Main",
          category: isHotelReq ? "hotels" : "plain",
          zoom: isHotelReq ? 15 : 13,
          isRoute: false,
        }
      };
    }

    return null;
  };

  // NLP Daily Objectives Intent Parser: recognizes inquiries about goals, tasks, priorities and commands to open the widget
  const detectObjectivesRequestFromMessage = (text: string): { isRequest: boolean; isClose?: boolean; onlyListTitles?: boolean } | null => {
    if (!text) return null;
    const clean = text.trim();

    if (/(?:tagesziele?|ziele?|daily\s*objectives?)\s*(?:schließen|schliessen|ausblenden|beenden|zu|weg|schließe|schliesse)|schließe\s*(?:die\s*)?(?:tagesziele?|ziele?|objectives?)|close\s*objectives/i.test(clean)) {
      return { isRequest: true, isClose: true };
    }

    const isGoalKeyword = /(?:ziele?|tagesziele?|objectives?|goals?|tagesaufgaben?|aufgaben?|fokus|tagesfokus)/i.test(clean);
    const isActionOrQuestion = /(?:nenn|sag|zeig|list|vorles|öffn|schau|welch|was|hast|hab|gib|view|show|open|read|tell|get|alle|nur|steh|welche|was\s+sind|bitte)/i.test(clean);

    const isGoalQuery = /(?:was\s+sind\s+(?:meine\s+)?(?:tages)?ziele|meine\s+tagesziele|meine\s+ziele|zeige?\s+(?:mir\s+)?(?:meine\s+)?(?:tages)?ziele|welche\s+tagesziele\s+habe\s+ich|welche\s+ziele\s+habe\s+ich|was\s+steht\s+(?:heute\s+)?an|liste\s+(?:meine\s+)?(?:tages)?ziele\s+auf|welche\s+aufgaben\s+habe\s+ich\s+heute|was\s+muss\s+ich\s+heute\s+(?:noch\s+)?tun|tagesziele\s+(?:nennen|vorlesen|zeigen|auflisten|sagen)|öffne?\s+(?:meine\s+)?(?:tagesziele?|ziele?|daily\s*objectives)|tagesziele\s+öffnen|tagesziele\s+anzeigen|what\s+are\s+my\s+(?:daily\s+)?objectives|what\s+are\s+my\s+goals|show\s+(?:my\s+)?objectives|list\s+(?:my\s+)?goals|open\s+(?:daily\s+)?objectives|ziele\s+die\s+da\s+stehen|nur\s+alle\s+ziele|nur\s+die\s+ziele)/i.test(clean) || (isGoalKeyword && isActionOrQuestion);

    if (isGoalQuery) {
      const isOnlyTitles = /(?:nur\s+(?:die\s+|alle\s+)?ziele|ohne\s+kategorie|ohne\s+gar\s+nichts|nur\s+alle\s+ziele|kurz\s+die\s+ziele|just\s+the\s+goals|titles\s+only|schnell|nur\s+wissen)/i.test(clean);
      return { isRequest: true, isClose: false, onlyListTitles: isOnlyTitles };
    }
    return null;
  };

  // NLP Direct App Open Router (e.g. "öffne kalender", "öffne veo", "öffne terminal", "öffne app store", etc.)
  const detectAppOpenRequestFromMessage = (text: string): { 
    widgetKey?: keyof ActiveWidgetsConfig; 
    specialAction?: "veoStudio";
    appName: string; 
    appNameEn: string 
  } | null => {
    if (!text) return null;
    const clean = text.trim();

    // App Store / App Hub
    if (/(?:öffne?|starte?|zeige?|open|launch)\s+(?:den\s+|das\s+)?(?:app\s*store|app\s*hub|app\s*matrix|apps)|(?:app\s*store|app\s*hub)\s+(?:öffnen|starten|anzeigen)/i.test(clean)) {
      return { widgetKey: "appStore", appName: "App Matrix & App Store Hub", appNameEn: "App Matrix & Store Hub" };
    }

    // Chronos Calendar / Schedule
    if (/(?:öffne?|starte?|zeige?|open|launch)\s+(?:den\s+|das\s+|meinen\s+)?(?:kalender|calendar|terminplaner|zeitplan|zeitmatrix)|(?:kalender|terminplaner)\s+(?:öffnen|starten)/i.test(clean)) {
      return { widgetKey: "calendarWidget", appName: "Chronos Termin- & Kalendermatrix", appNameEn: "Chronos Calendar & Schedule" };
    }

    // Veo 3 Video Studio
    if (/(?:öffne?|starte?|zeige?|open|launch)\s+(?:das\s+|den\s+)?(?:veo|video\s*studio|video\s*creator|video\s*generator|veo\s*3)|(?:veo|video\s*studio)\s+(?:öffnen|starten)/i.test(clean)) {
      return { specialAction: "veoStudio", appName: "Google Veo 3.1 8K Video Studio", appNameEn: "Google Veo 3.1 8K Video Studio" };
    }

    // Autonomous Claude Code Terminal
    if (/(?:öffne?|starte?|zeige?|open|launch)\s+(?:das\s+|den\s+)?(?:terminal|claude\s*code|cli|code\s*terminal|konsole)|(?:terminal|claude\s*code)\s+(?:öffnen|starten)/i.test(clean)) {
      return { widgetKey: "claudeCode", appName: "Claude Code Autonomes Terminal", appNameEn: "Claude Code Autonomous Terminal" };
    }

    // Web Browser
    if (/(?:öffne?|starte?|zeige?|open|launch)\s+(?:den\s+|das\s+)?(?:web\s*browser|browser|internet|webseite)|(?:browser|web\s*browser)\s+(?:öffnen|starten)/i.test(clean)) {
      return { widgetKey: "webBrowser", appName: "Autonomer Web-Browser", appNameEn: "Autonomous Web Browser" };
    }

    // Mini Trades / Market Radar
    if (/(?:öffne?|starte?|zeige?|open|launch)\s+(?:den\s+|das\s+)?(?:trade|trading|börse|charts?|markt-radar|krypto)|(?:trading|markt-radar)\s+(?:öffnen|starten)/i.test(clean)) {
      return { widgetKey: "miniTrades", appName: "Oracle Trading & Markt-Radar", appNameEn: "Oracle Trading & Market Radar" };
    }

    // Gmail Inbox / Mail Tool
    if (/(?:öffne?|starte?|zeige?|open|launch|mach\s+auf)\s+(?:den\s+|das\s+|meinen\s+)?(?:gmail(?:\s*tool|\s*app|\s*fenster)?|e-?mail\s*hub|posteingang|postfach)|(?:gmail|postfach|posteingang)\s+(?:öffnen|starten|anzeigen)/i.test(clean)) {
      return { widgetKey: "gmailInbox", appName: "Google Workspace Gmail Hub", appNameEn: "Google Workspace Gmail Hub" };
    }

    return null;
  };

  // NLP Gmail Intent Parser
  const detectGmailRequestFromMessage = (text: string): boolean => {
    if (!text) return false;
    const clean = text.trim();

    // Direct keywords & actions for Gmail
    const isExplicitGmail = /(?:gmail(?:\s*tool|\s*app|\s*fenster)?|postfach|posteingang|e-?mails?|mails?|inbox)/i.test(clean);
    const isAction = /(?:öffn|start|zeig|check|lad|prüf|seh|schau|les|bring|mach|view|show|open|launch|read|display|access|sync|fetch|tool|app)/i.test(clean);

    if (isExplicitGmail && (isAction || clean.split(/\s+/).length <= 4)) {
      return true;
    }

    return /(?:zeig(?:e)?\s+(?:mir\s+)?(?:meine\s+)?(?:neuesten?|letzten?|ungelesenen?|neuen?|alle)?\s*(?:e-?mails?|mails?|nachrichten|posteingang|inbox|gmail)|(?:öffne?|starte?|lade?|prüfe?|checke?|analysiere?|mach)\s+(?:den\s+|das\s+|meinen?\s+)?(?:e-?mails?|mails?|inbox|posteingang|gmail|postfach|gmail\s*tool)|(?:gmail|postfach|e-?mail)\s*(?:tool|app|fenster)?\s*(?:öffnen|starten|anzeigen|aufmachen)|kannst\s+du\s+(?:auf\s+)?(?:gmail|meine\s+(?:e-?mails?|mails?|postfach))\s*(?:zugreifen|öffnen|prüfen|lesen|schauen)|zugriff\s+auf\s+(?:gmail|e-?mails?|postfach)|hast\s+du\s+(?:zugriff\s+auf\s+)?(?:meine\s+)?(?:e-?mails?|mails?|gmail|postfach)|show\s+(?:me\s+)?(?:my\s+)?(?:latest\s+|new\s+|unread\s+)?(?:emails?|mails?|inbox|gmail)|open\s+(?:my\s+)?(?:gmail|emails?|mails?|inbox|gmail\s*tool)|check\s+(?:my\s+)?(?:emails?|mails?|inbox|gmail))/i.test(clean);
  };

  const cleanAiText = (rawText: string): string => {
    if (!rawText) return "";
    let text = rawText.trim();

    // If text is wrapped in ```json ... ``` or ``` markdown blocks
    if (text.startsWith("```")) {
      const codeBlockMatch = text.match(/^```(?:json|markdown|text)?\s*([\s\S]*?)\s*```$/i);
      if (codeBlockMatch && codeBlockMatch[1]) {
        text = codeBlockMatch[1].trim();
      }
    }

    // Try parsing JSON if it looks like a JSON object
    if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed === "object" && parsed !== null) {
          if (parsed.response && typeof parsed.response === "string") return cleanAiText(parsed.response);
          if (parsed.text && typeof parsed.text === "string") return cleanAiText(parsed.text);
          if (parsed.explanation && typeof parsed.explanation === "string") return cleanAiText(parsed.explanation);
          if (parsed.message && typeof parsed.message === "string") return cleanAiText(parsed.message);
          if (parsed.action_input && typeof parsed.action_input === "string") return cleanAiText(parsed.action_input);
          if (parsed.action_input?.prompt && typeof parsed.action_input.prompt === "string") return cleanAiText(parsed.action_input.prompt);
          if (parsed.thought && typeof parsed.thought === "string" && !parsed.response) return cleanAiText(parsed.thought);
        }
      } catch (e) {
        // Fallthrough
      }
    }

    // If text contains ReAct fields like "thought": "...", "action": "..."
    if (text.includes('"thought":') || text.includes('"action":') || text.includes("dalle.text2im") || text.includes("action_input")) {
      try {
        const thoughtMatch = text.match(/"thought"\s*:\s*"([^"]+)"/i);
        const textMatch = text.match(/"(?:text|response|explanation|message)"\s*:\s*"([^"]+)"/i);
        if (textMatch && textMatch[1]) return textMatch[1];
        if (thoughtMatch && thoughtMatch[1]) return thoughtMatch[1];

        // Strip raw JSON tool invocation blocks
        text = text.replace(/```(?:json)?[\s\S]*?```/gi, "")
                   .replace(/\{\s*"action"[\s\S]*?\}/gi, "")
                   .replace(/\{\s*"action_input"[\s\S]*?\}/gi, "")
                   .trim();
      } catch (e) {}
    }

    if (!text) text = "Hier ist das gewünschte Hologramm, Mr.";
    return text;
  };

  const processMapCommandsAndCleanText = (rawText: string): string => {
    if (!rawText) return "";
    let text = cleanAiText(rawText);

    // Check for [ROUTE: origin -> destination] or [ROUTE: origin bis/nach destination]
    const routeMatch = text.match(/\[ROUTE:\s*([^\]\->]+)(?:\s*->\s*|\s*bis\s*|\s*nach\s*)([^\]]+)\]/i);
    if (routeMatch && routeMatch[1] && routeMatch[2]) {
      const origin = routeMatch[1].trim();
      const destination = routeMatch[2].trim();
      setActiveMapData({
        origin,
        destination,
        travelMode: "d",
        isRoute: true,
      });
      setActiveWidgets((prev) => ({ ...prev, googleMaps: true }));
      setRouteOriginInput(origin);
      setRouteDestInput(destination);
    } else {
      // Check for [MAP: location]
      const mapMatch = text.match(/\[MAP:\s*([^\]]+)\]/i);
      if (mapMatch && mapMatch[1]) {
        const city = mapMatch[1].trim();
        setActiveMapData({
          city,
          isRoute: false,
        });
        setActiveWidgets((prev) => ({ ...prev, googleMaps: true }));
        const targetCity = city;
        const initialZoom = targetCity.toLowerCase().includes("hotel") || targetCity.toLowerCase().includes("mitte") || targetCity.toLowerCase().includes("frankfurt") ? 15 : 13;
        setMapZoom(initialZoom);
        setRouteDestInput(city);
      } else if (text.includes("[MAP_CLOSE]")) {
        setActiveMapData(null);
        setActiveWidgets((prev) => ({ ...prev, googleMaps: false }));
      } else {
        // Fallback: detect map request from text content
        const fallbackRes = detectMapRequestFromMessage(text);
        if (fallbackRes) {
          if (fallbackRes.isClose) {
            setActiveMapData(null);
            setActiveWidgets((prev) => ({ ...prev, googleMaps: false }));
          } else if (fallbackRes.mapData) {
            setActiveMapData(fallbackRes.mapData);
            setActiveWidgets((prev) => ({ ...prev, googleMaps: true }));
            if (fallbackRes.mapData.isRoute) {
              setRouteOriginInput(fallbackRes.mapData.origin || "");
              setRouteDestInput(fallbackRes.mapData.destination || "");
            } else {
              const targetCity = fallbackRes.mapData.city || "";
              const initialZoom = fallbackRes.mapData.zoom || (targetCity.toLowerCase().includes("hotel") || targetCity.toLowerCase().includes("mitte") || targetCity.toLowerCase().includes("frankfurt") ? 15 : 13);
              setMapZoom(initialZoom);
              setRouteDestInput(fallbackRes.mapData.city || "");
            }
          }
        }
      }
    }

    // Clean all map tags out of text
    text = text
      .replace(/\[ROUTE:\s*[^\]]+\]/gi, "")
      .replace(/\[MAP:\s*[^\]]+\]/gi, "")
      .replace(/\[MAP_CLOSE\]/gi, "")
      .trim();

    // If removing the tags emptied or stripped most of the text, construct a contextual JARVIS status message
    if (!text || text.length < 3) {
      if (routeMatch && routeMatch[1] && routeMatch[2]) {
        return `Ich habe die 3D-Kartenanzeige aktiviert und die Navigation von ${routeMatch[1].trim()} nach ${routeMatch[2].trim()} auf dem HUD visualisiert, Mr.`;
      }
      const mapMatch = rawText.match(/\[MAP:\s*([^\]]+)\]/i);
      if (mapMatch && mapMatch[1]) {
        return `Der 3D-Kartenprojektor wurde neu kalibriert und direkt auf ${mapMatch[1].trim()} ausgerichtet, Mr.`;
      }
      return "Der Kartenprojektor wurde aktualisiert und auf dem Display zentriert, Mr.";
    }

    return text;
  };

  const handleSwitchAgent = (targetAgent: AgentConfig, forcedDir?: "next" | "prev") => {
    if (!isAgentAllowed(userRole, targetAgent.id)) {
      setRoleManagerOpen(true);
      return;
    }
    if (targetAgent.id === currentAgent.id) return;

    let dir: "next" | "prev" = forcedDir || "next";
    if (!forcedDir) {
      const currIdx = agents.findIndex((a) => a.id === currentAgent.id);
      const targetIdx = agents.findIndex((a) => a.id === targetAgent.id);
      dir = targetIdx > currIdx ? "next" : "prev";
    }

    setTransitionDirection(dir);
    setCurrentAgent(targetAgent);
    addSystemLog(`Core gewechselt zu: ${targetAgent.name}`, "agent", targetAgent.name);

    if (!muted) {
      const speakIntro = targetAgent.greeting || `${targetAgent.name} online, Mr.`;
      speak(speakIntro, targetAgent.id);
    }
  };
  
  // Hologram Projector & Gallery states
  const [isImageMode, setIsImageMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  const [activeHologram, setActiveHologram] = useState<{
    url: string;
    prompt?: string;
    timestamp?: string;
  } | null>(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [hologramsGallery, setHologramsGallery] = useState<GalleryHologramItem[]>(() => {
    try {
      const saved = localStorage.getItem("jarvis_holograms_gallery_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load holograms gallery", e);
    }
    return [];
  });

  const addHologramToGallery = (item: { url: string; prompt?: string; timestamp?: string; enhancedPrompt?: string }) => {
    const newItem: GalleryHologramItem = {
      id: `holo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: item.url,
      prompt: item.prompt || "Generiertes Foto",
      timestamp: item.timestamp || new Date().toLocaleTimeString("de-DE"),
      agent: currentAgent?.name || "S.Y.N.T.A.X.",
      enhancedPrompt: item.enhancedPrompt,
    };
    setHologramsGallery((prev) => {
      const updated = [newItem, ...prev].slice(0, 100);
      try {
        localStorage.setItem("jarvis_holograms_gallery_v1", JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save holograms gallery", err);
      }
      return updated;
    });
  };

  const handleDeleteHologram = (id: string) => {
    setHologramsGallery((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("jarvis_holograms_gallery_v1", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClearGallery = () => {
    setHologramsGallery([]);
    try {
      localStorage.removeItem("jarvis_holograms_gallery_v1");
    } catch (e) {}
  };

  // Safe retrieval of custom Gemini key
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    try {
      return localStorage.getItem("jarvis_gemini_key") || "";
    } catch {
      return "";
    }
  });

  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking" | "">("");
  const [micLevel, setMicLevel] = useState(0);
  const [speakingLevel, setSpeakingLevel] = useState(0);

  // Voice Activation Sensitivity State (0-100)
  const [micSensitivity, setMicSensitivity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("jarvis_mic_sensitivity");
      return saved ? parseInt(saved, 10) : 50; // Default to 50%
    } catch {
      return 50;
    }
  });

  const micSensitivityRef = useRef(micSensitivity);
  useEffect(() => {
    micSensitivityRef.current = micSensitivity;
  }, [micSensitivity]);

  // Karaoke caption tracking
  const [captionWords, setCaptionWords] = useState<string[]>([]);
  const [captionProgress, setCaptionProgress] = useState(-1);

  // Warnings / status notices
  const [warningMessage, setWarningMessage] = useState("");

  // API Quota / Rate limit state & Dynamic API Load meter
  const [isQuotaExhausted, setIsQuotaExhausted] = useState<boolean>(false);
  const [currentLoad, setCurrentLoad] = useState<number>(16);

  // Immediate jump on load state change + continuous realistic fluctuation
  useEffect(() => {
    if (isQuotaExhausted) return;

    if (isLoading) {
      // Jump immediately into active range
      const min = compareEnabled ? 82 : 74;
      const max = compareEnabled ? 92 : 88;
      setCurrentLoad(Math.floor(min + Math.random() * (max - min + 1)));
    } else {
      // Jump immediately into idle baseline range
      setCurrentLoad(Math.floor(12 + Math.random() * 13));
    }

    const loadInterval = setInterval(() => {
      if (isQuotaExhausted) {
        setCurrentLoad(0);
        return;
      }

      if (isLoading) {
        // Active requests fluctuate dynamically between 74% and 88% (or 82%-92% in dual-core mode)
        const min = compareEnabled ? 82 : 74;
        const max = compareEnabled ? 92 : 88;
        setCurrentLoad(Math.floor(min + Math.random() * (max - min + 1)));
      } else {
        // Idle state fluctuates dynamically between 12% and 24%
        setCurrentLoad(Math.floor(12 + Math.random() * 13));
      }
    }, 1200);

    return () => clearInterval(loadInterval);
  }, [isLoading, compareEnabled, isQuotaExhausted]);

  const apiLoadPercentage = isQuotaExhausted ? 0 : currentLoad;

  // Clock
  const [timeStr, setTimeStr] = useState("");

  // Hover state for the 3D central sphere
  const [isSphereHovered, setIsSphereHovered] = useState(false);

  // Cycle to next agent core
  const cycleAgent = () => {
    const currentIndex = agents.findIndex((ag) => ag.id === currentAgent.id);
    const nextIndex = (currentIndex + 1) % agents.length;
    const nextAgent = agents[nextIndex];
    setCurrentAgent(nextAgent);
    
    if (!muted) {
      speak(`${nextAgent.name} Core aktiviert.`, nextAgent.id);
    }
  };

  // Refs for callbacks to prevent stale state issues
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const handleToggleMuteAll = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      if (next && typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      setAudioEnabled(!next);
      return next;
    });
  }, []);

  const currentAgentRef = useRef(currentAgent);
  useEffect(() => {
    currentAgentRef.current = currentAgent;
  }, [currentAgent]);

  // Preload speech synthesis voices for Chromium engines
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Stop speech output when user presses ESC or toggle mute with 'm'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
          } catch {}
        }
      }
      if (
        (e.key === "m" || e.key === "M") &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        handleToggleMuteAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleMuteAll]);

  // Handle clock ticks
  useEffect(() => {
    const tick = () => {
      setTimeStr(new Date().toLocaleTimeString("de-DE"));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save Gemini API key safely
  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    setIsQuotaExhausted(false);
    try {
      localStorage.setItem("jarvis_gemini_key", key);
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const handleSaveMicSensitivity = (val: number) => {
    setMicSensitivity(val);
    try {
      localStorage.setItem("jarvis_mic_sensitivity", val.toString());
    } catch (e) {
      console.warn("Could not save sensitivity", e);
    }
  };

  const handleImagesSelect = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files);
    const mediaFiles = rawFiles.filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.type.startsWith("video/") ||
        /\.(mp4|webm|mov|mkv|ogg|avi|quicktime)$/i.test(f.name)
    );

    if (mediaFiles.length === 0) {
      showWarning("Ungültiges Dateiformat. Bitte wähle ein Bild oder ein Video (MP4, WebM, MOV etc.).");
      return;
    }

    const newMediaItems: string[] = [];
    const imageFiles: File[] = [];

    for (const file of mediaFiles) {
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg|avi|quicktime)$/i.test(file.name);
      if (isVideo) {
        if (file.size > 80 * 1024 * 1024) {
          showWarning(`Video "${file.name}" ist größer als 80MB. Bitte wähle einen Clip unter 80MB für optimale KI-Geschwindigkeit.`);
          continue;
        }
        try {
          const videoDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") resolve(reader.result);
              else reject(new Error("Konnte Video nicht lesen"));
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          newMediaItems.push(videoDataUrl);
        } catch (err) {
          console.error("Fehler beim Einlesen des Videos:", err);
          showWarning(`Fehler beim Laden des Videos: ${file.name}`);
        }
      } else {
        imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      try {
        const compressedList = await compressImages(imageFiles, 1280, 0.85);
        newMediaItems.push(...compressedList);
      } catch (e) {
        for (const file of imageFiles) {
          try {
            const imgDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") resolve(reader.result);
                else reject(new Error("Konnte Bild nicht lesen"));
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            });
            newMediaItems.push(imgDataUrl);
          } catch (err) {
            console.error("Fehler beim Einlesen des Bildes:", err);
          }
        }
      }
    }

    if (newMediaItems.length > 0) {
      setSelectedImages((prev) => [...prev, ...newMediaItems]);
      if (!selectedImage && newMediaItems[0]) {
        setSelectedImage(newMediaItems[0]);
      }
    }
  };

  const handleImageSelect = async (file: File) => {
    await handleImagesSelect([file]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setSelectedImage(updated[0] || null);
      return updated;
    });
  };

  const handleClearImages = () => {
    setSelectedImages([]);
    setSelectedImage(null);
  };

  // --- Safe API Fetch Helper ---
  const safeFetchJson = async (url: string, options: RequestInit) => {
    let response: Response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 65000);

    const mergedSignal = options.signal || controller.signal;

    try {
      response = await fetch(url, { ...options, signal: mergedSignal });
    } catch (netErr: any) {
      clearTimeout(timeoutId);
      if (netErr.name === "AbortError") {
        throw new Error(
          lang === "de"
            ? "⚠️ Die Anfrage dauerte länger als 65 Sekunden (Timeout). Bei sehr großen Medien oder Multi-Agent-Analysen empfiehlt sich ein kürzerer Clip oder eine Einzel-Core-Anfrage."
            : "⚠️ Request exceeded 65s timeout. For large media or multi-agent runs, try a shorter clip or single-core mode."
        );
      }
      throw new Error(`Netzwerkverbindung fehlgeschlagen: ${netErr.message || "Server nicht erreichbar."}`);
    } finally {
      clearTimeout(timeoutId);
    }

    const rawText = await response.text().catch(() => "");
    let bodyData: any = null;

    if (rawText && rawText.trim()) {
      try {
        bodyData = JSON.parse(rawText);
      } catch (e) {
        bodyData = null;
      }
    }

    if (!response.ok) {
      if (bodyData && bodyData.message) {
        const errObj: any = new Error(bodyData.message);
        errObj.errorType = bodyData.error;
        throw errObj;
      }
      if (rawText.includes("503") || response.status === 503) {
        throw new Error("⚠️ Google Cloud Server überlastet (Fehler 503: High Demand). Die Anfragekapazitäten von Google sind aktuell voll ausgelastet. Bitte versuche es in wenigen Sekunden noch einmal oder hinterlege deinen eigenen Gemini API-Key in den Einstellungen.");
      }
      if (rawText.includes("429") || response.status === 429) {
        throw new Error("⚠️ Quoten-Limit überschritten (Fehler 429). Bitte warte kurz oder hinterlege deinen eigenen API-Key in den Einstellungen.");
      }
      if (rawText.includes("401") || response.status === 401) {
        throw new Error("⚠️ Ungültiger API-Key oder nicht authentifiziert (Fehler 401). Bitte überprüfe deinen Gemini API-Key in den Einstellungen.");
      }
      throw new Error(`Server-Fehler (Status ${response.status}): Die Anfrage konnte vom Core nicht verarbeitet werden.`);
    }

    if (!bodyData) {
      if (rawText && !rawText.trim().startsWith("<")) {
        return { response: rawText.trim() };
      }
      if (rawText && rawText.trim().startsWith("<")) {
        throw new Error("Der Server befindet sich im Neustart. Bitte warte 3 Sekunden und versuche es erneut.");
      }
      throw new Error(`Leere Antwort vom Server erhalten (Status: ${response.status}).`);
    }

    return bodyData;
  };

  // --- HTML5 Speech Recognition (STT) ---
  const [recognition, setRecognition] = useState<any>(null);
  const recognitionRef = useRef<any>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const speechBufferRef = useRef<string>("");
  const liveTranscriptRef = useRef<string>("");
  const autoSendSilenceTimerRef = useRef<any>(null);
  const restartRecTimerRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isStartingRecRef = useRef<boolean>(false);
  const handleSendMessageRef = useRef<any>(null);

  // Stop mic audio stream and analyser cleanly
  const stopMicStream = useCallback(() => {
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setMicLevel(0);
  }, []);

  // Handle mic level stream (only instantiated ONCE per voice session)
  const startMicStream = useCallback(async () => {
    if (micStreamRef.current) return; // already active
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          noiseSuppression: true,
          echoCancellation: true,
        },
      });
      if (stateRef.current !== "listening") {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkMic = () => {
        if (stateRef.current !== "listening" || !micStreamRef.current) {
          stopMicStream();
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        const threshold = ((100 - micSensitivityRef.current) / 100) * 0.05;
        let finalMicLevel = 0;
        if (avg >= threshold) {
          const remainingRange = 1 - threshold;
          finalMicLevel = remainingRange > 0 ? (avg - threshold) / remainingRange : 0;
          finalMicLevel = Math.min(1.0, finalMicLevel * (1.8 + (micSensitivityRef.current / 100) * 2.0));
        }
        setMicLevel(finalMicLevel);
        requestAnimationFrame(checkMic);
      };
      checkMic();
    } catch (err) {
      console.warn("Audio analyser stream error:", err);
    }
  }, [stopMicStream]);

  const handleCancelVoice = useCallback(() => {
    if (autoSendSilenceTimerRef.current) {
      clearTimeout(autoSendSilenceTimerRef.current);
      autoSendSilenceTimerRef.current = null;
    }
    if (restartRecTimerRef.current) {
      clearTimeout(restartRecTimerRef.current);
      restartRecTimerRef.current = null;
    }
    isStartingRecRef.current = false;
    speechBufferRef.current = "";
    liveTranscriptRef.current = "";
    setLiveTranscript("");
    stateRef.current = "";
    setState("");
    stopMicStream();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
  }, [stopMicStream]);

  // Handle ESC key to cancel voice listening modal
  useEffect(() => {
    const handleVoiceEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stateRef.current === "listening") {
        handleCancelVoice();
      }
    };
    window.addEventListener("keydown", handleVoiceEscape);
    return () => window.removeEventListener("keydown", handleVoiceEscape);
  }, [handleCancelVoice]);

  const handleSendVoiceRequest = useCallback(() => {
    if (autoSendSilenceTimerRef.current) {
      clearTimeout(autoSendSilenceTimerRef.current);
      autoSendSilenceTimerRef.current = null;
    }
    if (restartRecTimerRef.current) {
      clearTimeout(restartRecTimerRef.current);
      restartRecTimerRef.current = null;
    }
    isStartingRecRef.current = false;
    const textToSend = (liveTranscriptRef.current || speechBufferRef.current).trim();
    speechBufferRef.current = "";
    liveTranscriptRef.current = "";
    setLiveTranscript("");
    stateRef.current = "";
    setState("");
    stopMicStream();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (textToSend && handleSendMessageRef.current) {
      handleSendMessageRef.current(textToSend);
    }
  }, [stopMicStream]);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    try {
      const rec = new SpeechRecognition();
      rec.lang = lang === "en" ? "en-US" : "de-DE";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        isStartingRecRef.current = false;
        stateRef.current = "listening";
        setState("listening");
      };

      rec.onend = () => {
        isStartingRecRef.current = false;
        // Calm debounce restart to avoid rapid mic device loop / browser tab flickering
        if (stateRef.current === "listening") {
          if (restartRecTimerRef.current) clearTimeout(restartRecTimerRef.current);
          restartRecTimerRef.current = setTimeout(() => {
            if (stateRef.current === "listening" && !isStartingRecRef.current) {
              try {
                isStartingRecRef.current = true;
                rec.start();
              } catch (e) {
                isStartingRecRef.current = false;
              }
            }
          }, 300);
        }
      };

      rec.onerror = (e: any) => {
        isStartingRecRef.current = false;
        console.warn("Speech recognition error:", e.error);
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          handleCancelVoice();
          showWarning("🎙️ Mikrofon-Zugriff im Browser blockiert! Klicke links neben der Adressleiste auf das Schloss-Symbol 🔒 und stelle Mikrofon auf 'Zulassen'.", 10000);
        } else if (e.error === "network") {
          showWarning("Netzwerkverbindung zu Google Speech unterbrochen.", 6000);
        }
      };

      rec.onresult = (e: any) => {
        if (stateRef.current !== "listening") return;

        let interimText = "";
        let finalChunkText = "";

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const chunk = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalChunkText += chunk + " ";
          } else {
            interimText += chunk;
          }
        }

        if (finalChunkText) {
          speechBufferRef.current += finalChunkText;
        }

        const currentLive = (speechBufferRef.current + " " + interimText).replace(/\s+/g, " ").trim();
        if (!currentLive) return;

        liveTranscriptRef.current = currentLive;
        setLiveTranscript(currentLive);

        // Auto-send upon pause (no manual send button required)
        if (autoSendSilenceTimerRef.current) {
          clearTimeout(autoSendSilenceTimerRef.current);
          autoSendSilenceTimerRef.current = null;
        }
        if (currentLive.length >= 2) {
          autoSendSilenceTimerRef.current = setTimeout(() => {
            if (stateRef.current === "listening" && liveTranscriptRef.current.trim().length >= 2) {
              handleSendVoiceRequest();
            }
          }, 1100);
        }
      };

      return rec;
    } catch (e) {
      console.warn("Failed to create SpeechRecognition instance:", e);
      return null;
    }
  }, [handleCancelVoice, handleSendVoiceRequest, lang]);

  useEffect(() => {
    const rec = initRecognition();
    if (rec) {
      recognitionRef.current = rec;
      setRecognition(rec);
    }
  }, [initRecognition]);

  // When NEO Speak Modus is opened, abort background push-to-talk to prevent mic conflict
  useEffect(() => {
    if (neoSpeakOpen) {
      handleCancelVoice();
    }
  }, [neoSpeakOpen, handleCancelVoice]);

  const toggleMic = async () => {
    if (isLoading) return;

    if (state === "listening") {
      handleCancelVoice();
      return;
    }

    // Cancel speech synthesis if it's currently speaking
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    let activeRec = recognitionRef.current;
    if (!activeRec) {
      activeRec = initRecognition();
      if (activeRec) {
        recognitionRef.current = activeRec;
        setRecognition(activeRec);
      }
    }

    if (!activeRec) {
      showWarning("Spracherkennung wird in diesem Browser nicht unterstützt. Bitte Google Chrome oder Microsoft Edge nutzen.", 6000);
      return;
    }

    // Prepare fresh listening state
    speechBufferRef.current = "";
    liveTranscriptRef.current = "";
    setLiveTranscript("");
    stateRef.current = "listening";
    setState("listening");

    // Start audio stream for responsive visualizer
    startMicStream();

    try {
      activeRec.lang = lang === "en" ? "en-US" : "de-DE";
      isStartingRecRef.current = true;
      activeRec.start();
    } catch (e: any) {
      isStartingRecRef.current = false;
      console.warn("Could not start recognition directly, recreating fresh instance:", e);
      try {
        const freshRec = initRecognition();
        if (freshRec) {
          recognitionRef.current = freshRec;
          setRecognition(freshRec);
          freshRec.lang = lang === "en" ? "en-US" : "de-DE";
          isStartingRecRef.current = true;
          freshRec.start();
        }
      } catch (innerErr) {
        isStartingRecRef.current = false;
        console.warn("Retry failed:", innerErr);
      }
    }
  };

  // --- Speech Synthesis (TTS) ---
  const speakTimerRef = useRef<any>(null);
  const captionTimerRef = useRef<any>(null);
  const keepAliveTimerRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleStopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }
    currentUtteranceRef.current = null;
    setState("");
    setSpeakingLevel(0);
    setCaptionWords([]);
    setCaptionProgress(-1);
    if (speakTimerRef.current) clearInterval(speakTimerRef.current);
    if (captionTimerRef.current) clearInterval(captionTimerRef.current);
    if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
  };

  const speakUtteranceInternal = (text: string, agentOverrideId?: string, onEndCallback?: () => void) => {
    handleStopSpeaking();

    if (mutedRef.current) {
      setState("");
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    // Clean text AND strip internal thoughts strictly for speech synthesis output
    const cleanText = normalizeTextForSpeech(text, lang);

    if (!cleanText) {
      setState("");
      if (onEndCallback) onEndCallback();
      return;
    }

    const targetAgentId = (agentOverrideId || currentAgentRef.current?.id || currentAgent.id)?.toLowerCase();
    setActiveSpeakingAgentId(targetAgentId);
    try {
      recordAgentUsage(targetAgentId, Math.max(80, Math.round(cleanText.length / 3.5)), 1100 + Math.round(cleanText.length * 8));
    } catch (e) {}

    const isNeo = targetAgentId === "neo";
    const voiceProfile = AGENT_VOICE_PROFILES[targetAgentId] || AGENT_VOICE_PROFILES.syntax;
    const effectiveRate = voiceProfile?.rate || 0.90;
    const wordOffsets: WordOffset[] = calculateWordOffsets(cleanText, effectiveRate, lang);
    const words = wordOffsets.map((o) => o.word);

    let speechStartTime: number | null = null;
    let speakPhase = 0;

    const startPlaybackTimers = () => {
      if (speakTimerRef.current) clearInterval(speakTimerRef.current);
      if (captionTimerRef.current) clearInterval(captionTimerRef.current);
      if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);

      if (!speechStartTime) {
        speechStartTime = performance.now();
      }

      // Equalizer waveform pulsation timer (smooth multi-harmonic cadence)
      speakTimerRef.current = setInterval(() => {
        speakPhase += 0.08;
        const harmonic1 = (Math.sin(speakPhase) * 0.5 + 0.5) * 0.50;
        const harmonic2 = (Math.sin(speakPhase * 1.7) * 0.5 + 0.5) * 0.30;
        const harmonic3 = (Math.sin(speakPhase * 0.5) * 0.5 + 0.5) * 0.20;
        const volume = Math.max(0.25, Math.min(1.0, harmonic1 + harmonic2 + harmonic3));
        setSpeakingLevel(volume);
      }, 50);

      // High-precision acoustic time synchronization ticker (updates every 20ms)
      captionTimerRef.current = setInterval(() => {
        if (!speechStartTime) return;
        const elapsed = performance.now() - speechStartTime;

        let activeIdx = 0;
        for (let i = 0; i < wordOffsets.length; i++) {
          const wordStartMs = i === 0 ? 0 : wordOffsets[i - 1].timestamp;
          if (elapsed >= wordStartMs) {
            activeIdx = i;
          } else {
            break;
          }
        }

        setCaptionProgress(Math.min(words.length - 1, activeIdx));
      }, 20);

      // Long utterance keepalive (prevents Chromium engines from pausing speech after 15s)
      keepAliveTimerRef.current = setInterval(() => {
        try {
          if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        } catch (e) {}
      }, 8000);
    };

    const handleAllSpeechFinished = () => {
      currentUtteranceRef.current = null;
      if (currentAudioRef.current) {
        currentAudioRef.current = null;
      }
      setState("");
      setSpeakingLevel(0);
      setCaptionWords([]);
      setCaptionProgress(-1);
      if (speakTimerRef.current) clearInterval(speakTimerRef.current);
      if (captionTimerRef.current) clearInterval(captionTimerRef.current);
      if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
      if (onEndCallback) {
        onEndCallback();
      } else {
        setActiveSpeakingAgentId(null);
      }
    };

    // --- BROWSER TTS FALLBACK RUNNER ---
    const runBrowserTtsFallback = () => {
      if (mutedRef.current || !window.speechSynthesis) {
        setState("");
        if (onEndCallback) onEndCallback();
        return;
      }

      // Split into natural conversational chunks (max 180 chars) to prevent Chrome 15s freeze
      const chunks = splitTextIntoSpeechChunks(cleanText, 180);
      if (chunks.length === 0) {
        setState("");
        if (onEndCallback) onEndCallback();
        return;
      }

      setCaptionWords(words);
      setCaptionProgress(0);
      setState("speaking");

      let chunkIdx = 0;
      let globalCharOffset = 0;

      const playNextChunk = () => {
        if (mutedRef.current || chunkIdx >= chunks.length) {
          handleAllSpeechFinished();
          return;
        }

        const chunkText = chunks[chunkIdx];
        const utterance = new SpeechSynthesisUtterance(chunkText);
        currentUtteranceRef.current = utterance;
        applyAgentVoice(utterance, targetAgentId, lang);

        const thisChunkOffset = globalCharOffset;
        globalCharOffset += chunkText.length + 1;

        utterance.onstart = () => {
          startPlaybackTimers();
        };

        // Real-time boundary event calibration using exact character index offsets
        utterance.onboundary = (e: any) => {
          if (e.charIndex !== undefined && e.name !== "sentence") {
            const ci = thisChunkOffset + e.charIndex;
            let matchedIdx = -1;

            // Exact character range match
            for (let i = 0; i < wordOffsets.length; i++) {
              if (ci >= wordOffsets[i].start && ci < wordOffsets[i].end) {
                matchedIdx = i;
                break;
              }
            }
            // Fallback: nearest previous word start
            if (matchedIdx === -1) {
              for (let i = wordOffsets.length - 1; i >= 0; i--) {
                if (ci >= wordOffsets[i].start) {
                  matchedIdx = i;
                  break;
                }
              }
            }
            if (matchedIdx >= 0) {
              setCaptionProgress(matchedIdx);
              const expectedWordStartMs = matchedIdx > 0 ? wordOffsets[matchedIdx - 1].timestamp : 0;
              speechStartTime = performance.now() - expectedWordStartMs;
            }
          }
        };

        utterance.onend = () => {
          chunkIdx++;
          if (chunkIdx < chunks.length && !mutedRef.current) {
            setTimeout(() => {
              playNextChunk();
            }, 30);
          } else {
            handleAllSpeechFinished();
          }
        };

        utterance.onerror = (err) => {
          console.warn("[SpeechSynthesis] Chunk error or cancel:", err);
          chunkIdx++;
          if (chunkIdx < chunks.length && !mutedRef.current) {
            setTimeout(() => {
              playNextChunk();
            }, 30);
          } else {
            handleAllSpeechFinished();
          }
        };

        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("[SpeechSynthesis] Speak invocation error:", err);
          chunkIdx++;
          playNextChunk();
        }
      };

      setTimeout(() => {
        playNextChunk();
      }, 40);
    };

    // --- CHECK ELEVENLABS FOR N.E.O. ONLY ---
    const customElevenLabsKey = typeof window !== "undefined" ? localStorage.getItem("elevenlabs_api_key") : null;
    const customVoiceId = typeof window !== "undefined" ? localStorage.getItem("elevenlabs_voice_id") : null;
    const voiceIdForNeo = (customVoiceId && customVoiceId.trim()) || voiceProfile?.elevenLabsVoiceId || "70dzXY4HZleqxYtQr59t";

    if (isNeo) {
      // Try ElevenLabs Neural Voice exclusively for N.E.O.
      fetch("/api/tts/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          voiceId: voiceIdForNeo,
          customApiKey: customElevenLabsKey || undefined,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`ElevenLabs TTS response status: ${res.status}`);
          }
          const blob = await res.blob();
          if (blob.size < 100) {
            throw new Error("Empty audio response");
          }
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          setCaptionWords(words);
          setCaptionProgress(0);
          setState("speaking");

          audio.onplay = () => {
            speechStartTime = performance.now();
            startPlaybackTimers();
          };

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            handleAllSpeechFinished();
          };

          audio.onerror = (e) => {
            console.warn("[ElevenLabs] Audio playback error, falling back to browser TTS:", e);
            URL.revokeObjectURL(audioUrl);
            runBrowserTtsFallback();
          };

          audio.play().catch((err) => {
            console.warn("[ElevenLabs] Audio play() prevented, falling back:", err);
            runBrowserTtsFallback();
          });
        })
        .catch((err) => {
          // If no key or API limit or network failure, gracefully fallback to browser TTS for NEO
          console.log("[ElevenLabs TTS] Falling back to neural browser voice for N.E.O.:", err?.message || err);
          runBrowserTtsFallback();
        });
      return;
    }

    // All other agents use browser TTS
    runBrowserTtsFallback();
  };

  const speak = (text: string, agentOverrideId?: string) => {
    speakUtteranceInternal(text, agentOverrideId);
  };

  const speakMultiAgentQueue = (items: Array<{ agentId: string; response: string }>) => {
    handleStopSpeaking();
    if (!items || items.length === 0) return;

    let idx = 0;

    const speakNext = () => {
      if (idx >= items.length) {
        setActiveSpeakingAgentId(null);
        setState("");
        return;
      }

      const item = items[idx];
      idx++;

      speakUtteranceInternal(item.response, item.agentId, () => {
        setTimeout(() => {
          speakNext();
        }, 350);
      });
    };

    speakNext();
  };

  // Helper to update current agent's messages state AND persist to agentChats & localStorage
  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    setMessages((prevMessages) => {
      const nextMessages = updater(prevMessages);
      setAgentChats((prevMap) => {
        const updatedMap = { ...prevMap, [currentAgent.id]: nextMessages };
        persistAgentChats(updatedMap);
        return updatedMap;
      });
      return nextMessages;
    });
  };

  // Restore or initialize chat memory for the active agent when switching agents
  useEffect(() => {
    const agentId = currentAgent.id;
    let currentHistory = agentChats[agentId];

    // If this agent has no history yet, initialize with greeting
    if (!currentHistory || currentHistory.length === 0) {
      const initialGreetMsg: Message = {
        id: `greet-${agentId}`,
        role: agentId,
        content: currentAgent.greeting,
        timestamp: new Date().toLocaleTimeString("de-DE"),
      };
      currentHistory = [initialGreetMsg];
      setAgentChats((prev) => {
        const nextMap = { ...prev, [agentId]: currentHistory };
        persistAgentChats(nextMap);
        return nextMap;
      });
      speak(currentAgent.greeting, currentAgent.id);
    }

    setMessages(currentHistory);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speakTimerRef.current) {
        clearInterval(speakTimerRef.current);
      }
    };
  }, [currentAgent.id]);

  const handleClearAgentChat = () => {
    const agentId = currentAgent.id;
    const resetHistory: Message[] = [
      {
        id: `greet-${agentId}-${Date.now()}`,
        role: agentId,
        content: currentAgent.greeting,
        timestamp: new Date().toLocaleTimeString("de-DE"),
      }
    ];
    setMessages(resetHistory);
    setAgentChats((prev) => {
      const updatedMap = { ...prev, [agentId]: resetHistory };
      persistAgentChats(updatedMap);
      return updatedMap;
    });
    speak(currentAgent.greeting, currentAgent.id);
  };

  const handleClearAllChats = () => {
    const emptyMap: Record<string, Message[]> = {};
    agents.forEach((ag) => {
      emptyMap[ag.id] = [
        {
          id: `greet-${ag.id}-${Date.now()}`,
          role: ag.id as Message["role"],
          content: ag.greeting,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        }
      ];
    });
    setAgentChats(emptyMap);
    setMessages(emptyMap[currentAgent.id] || []);
    persistAgentChats(emptyMap);
  };

  const checkAndTriggerScreenActions = (text: string, scope?: CommunicationScope) => {
    if (!text) return null;
    if (scope === "ALL" || communicationScope === "ALL") return null;

    const clean = text.trim();
    // Only trigger if user explicitly writes a direct imperative command to open or start the specific tool
    const isExplicitYouTube = /^(?:öffne|starte|suche auf)\s+youtube\b/i.test(clean);
    const isExplicitFlight = /^(?:öffne|starte)\s+(?:flugsuche|flug-radar|flightradar)\b/i.test(clean);
    const isExplicitHotel = /^(?:öffne|starte)\s+(?:hotelsuche|hotel-radar)\b/i.test(clean);
    const isExplicitScreen = /^(?:öffne|starte|aktiviere)\s+(?:bildschirmübertragung|bildschirm-analyse|monitor-analyse)\b/i.test(clean);

    if (isExplicitYouTube || isExplicitFlight || isExplicitHotel || isExplicitScreen) {
      let pendingAct: PendingScreenAction;
      if (isExplicitYouTube) {
        const query = clean.replace(/^(?:öffne|starte|suche auf)\s+youtube(?:\s+nach)?/gi, "").trim() || "Trends";
        pendingAct = { type: "youtube", title: `YouTube Suche: ${query}`, query };
      } else if (isExplicitFlight) {
        pendingAct = { type: "flight", title: "Flugsuche Radar", query: clean };
      } else if (isExplicitHotel) {
        pendingAct = { type: "hotel", title: "Hotelbuchung Radar", query: clean };
      } else {
        pendingAct = { type: "browse", title: "Live Monitor Perception", query: clean };
      }

      handleTriggerScreenAction(pendingAct);
      return pendingAct;
    }
    return null;
  };

  const handleSendMessageToAgent = async (
    agentId: string,
    text: string,
    imageUrl?: string,
    forcedScope?: CommunicationScope,
    isSilentOrImageUrls?: boolean | string[],
    imageUrlsParam?: string[]
  ) => {
    let isSilent = false;
    let imageUrls = imageUrlsParam;

    if (Array.isArray(isSilentOrImageUrls)) {
      imageUrls = isSilentOrImageUrls;
      isSilent = false;
    } else if (typeof isSilentOrImageUrls === "boolean") {
      isSilent = isSilentOrImageUrls;
    }

    // Auto-check for autonomous screen / browser / YouTube intent
    const matchedAction = checkAndTriggerScreenActions(text);

    // Auto-detect if multi-agent scope is requested (ONLY if explicitly set to ALL or requested in text)
    const isExplicitMultiReq =
      forcedScope === "ALL" ||
      /(?:alle 8 agenten|alle agenten|flotte|flotten-feedback)/i.test(text);

    const effectiveScope = forcedScope === "ALL" ? "ALL" : (isExplicitMultiReq && forcedScope !== "SINGLE" ? "ALL" : "SINGLE");

    const isObservation =
      /(?:\[AUTOMATISCHE BILDSCHIRM-BEOBACHTUNG\]|\[BILDSCHIRM-BEOBACHTUNG\]|\[SCREENSHOT_OBSERVATION\])/i.test(text);

    const shouldBeSilent = isSilent;

    const effectiveImageUrls = imageUrls && imageUrls.length > 0
      ? imageUrls
      : (imageUrl ? [imageUrl] : []);

    const videoUrls = effectiveImageUrls.filter(isVideoUrl);
    const firstVideo = videoUrls[0];
    const hasAttachedVideos = videoUrls.length > 0;
    const hasAttachedImages = effectiveImageUrls.some((u) => !isVideoUrl(u));

    let effectiveText = (text || "").trim();
    if (!effectiveText) {
      if (hasAttachedVideos && hasAttachedImages) {
        effectiveText = "Analysiere bitte dieses Video und die Fotos im Detail.";
      } else if (hasAttachedVideos) {
        effectiveText = videoUrls.length > 1
          ? `Analysiere bitte diese ${videoUrls.length} Videos im Detail: Beschreibe Handlungen, Szenen, Personen und Abläufe.`
          : "Analysiere bitte dieses Video im Detail: Beschreibe Szenen, Handlungen, Personen und den genauen Inhalt.";
      } else if (effectiveImageUrls.length > 0) {
        effectiveText = effectiveImageUrls.length > 1
          ? `Analysiere bitte diese ${effectiveImageUrls.length} Bilder im Detail.`
          : "Analysiere bitte dieses Bild im Detail.";
      }
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: effectiveText || text,
      imageUrl: imageUrl || effectiveImageUrls[0],
      imageUrls: effectiveImageUrls.length > 0 ? effectiveImageUrls : undefined,
      videoUrl: firstVideo || undefined,
      videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      timestamp: new Date().toLocaleTimeString("de-DE"),
    };

    setAgentChats((prev) => {
      const existing = prev[agentId] || [];
      const updated = [...existing, userMsg];
      const nextMap = { ...prev, [agentId]: updated };
      persistAgentChats(nextMap);
      return nextMap;
    });

    if (agentId === currentAgent.id) {
      setMessages((prev) => [...prev, userMsg]);
    }

    // Check if this message is from NEO SPEAK MODUS (voice mode)
    const isNeoVoiceMode = typeof text === "string" && text.includes("[NEO SPEAK MODUS");

    // In multi-agent "ALL" mode or NEO SPEAK MODUS, NEVER hijack with local popups - send straight to the AI agent cores
    if (effectiveScope !== "ALL" && !isNeoVoiceMode) {
      // 0. Direct Voice / Command: Google Calendar Intent Handling (e.g. "mache einen termin am 29.09 um 10 uhr", "termin im kalender eintragen", "welche termine habe ich")
      const calCmd = extractCalendarCommand(text);
      if (calCmd && calCmd.isCalendarAction) {
        // Open the Chronos Calendar widget immediately
        setActiveWidgets((prev) => ({ ...prev, calendarWidget: true }));

        const token = getStoredCalendarToken();
        const hasToken = !!(token && token.trim().length > 10);

        if (calCmd.action === "create" && calCmd.title && calCmd.dateStr) {
          let calResponse = "";
          if (hasToken) {
            try {
              await createGoogleCalendarEvent({
                title: calCmd.title,
                dateStr: calCmd.dateStr,
                time: calCmd.time || "09:00",
                durationMinutes: calCmd.durationMinutes || 60,
                token: token,
              });
              calResponse = lang === "en"
                ? `✓ Done! I have booked your appointment "${calCmd.title}" on ${calCmd.dateStr} at ${calCmd.time || "09:00"} directly in your Google Calendar and synchronized it with Chronos, Mr.`
                : `✓ Erledigt! Ich habe deinen Termin "${calCmd.title}" am ${calCmd.dateStr} um ${calCmd.time || "09:00"} Uhr direkt in deinem Google Kalender eingetragen und mit Chronos synchronisiert, Mr.`;
            } catch (err: any) {
              calResponse = lang === "en"
                ? `I opened your Google Calendar HUD. The event "${calCmd.title}" on ${calCmd.dateStr} was staged. Please verify your Google connection in the widget, Mr.`
                : `Ich habe dein Google Kalender HUD geöffnet. Der Termin "${calCmd.title}" am ${calCmd.dateStr} wurde vorbereitet. Bitte überprüfe kurz die Google-Autorisierung im Fenster, Mr.`;
            }
          } else {
            calResponse = lang === "en"
              ? `I opened your Chronos Google Calendar app, Mr. You can click 'Connect Google' to link your live calendar and write events directly.`
              : `Ich habe deine Google Kalender App geöffnet, Mr. Klicke im Fenster auf 'GOOGLE VERBINDEN', um deine Live-Termine direkt zu synchronisieren und zu schreiben.`;
          }

          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: agentId as Message["role"],
            content: calResponse,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };

          setAgentChats((prev) => {
            const existing = prev[agentId] || [];
            const updated = [...existing, assistantMsg];
            const nextMap = { ...prev, [agentId]: updated };
            persistAgentChats(nextMap);
            return nextMap;
          });

          if (agentId === currentAgent.id) {
            setMessages((prev) => [...prev, assistantMsg]);
          }

          if (!shouldBeSilent) {
            speak(calResponse, agentId);
          }
          return;
        } else if (calCmd.action === "list" || calCmd.action === "open") {
          const openAck = lang === "en"
            ? `I have opened your Google Calendar & Chronos Scheduler HUD, Mr.`
            : `Ich habe deinen Google Kalender & Chronos Terminplaner geöffnet, Mr.`;

          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: agentId as Message["role"],
            content: openAck,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };

          setAgentChats((prev) => {
            const existing = prev[agentId] || [];
            const updated = [...existing, assistantMsg];
            const nextMap = { ...prev, [agentId]: updated };
            persistAgentChats(nextMap);
            return nextMap;
          });

          if (agentId === currentAgent.id) {
            setMessages((prev) => [...prev, assistantMsg]);
          }

          if (!shouldBeSilent) {
            speak(openAck, agentId);
          }
          return;
        }
      }

      // 1. Direct Voice / Command: Gmail Intent Handling ("zeige mir meine neusten mails", "öffne gmail tool")
      const isGmailReq = detectGmailRequestFromMessage(text);
      if (isGmailReq) {
        let isGmailConnected = false;
        try {
          const token = localStorage.getItem("gmail_oauth_token");
          const isConn = localStorage.getItem("gmail_is_connected") === "true";
          isGmailConnected = !!(token && token.trim().length > 10) || isConn;
        } catch (e) {}

        // Open the Gmail widget so the user can interact/authenticate immediately
        setActiveWidgets((prev) => ({ ...prev, gmailInbox: true }));

        let responseText = "";
        if (!isGmailConnected) {
          responseText = lang === "en"
            ? "I opened your Gmail Tool, Mr! You can click 'Connect Real Gmail Account' inside the window to link your Google Workspace inbox."
            : "Ich habe dein Gmail Tool geöffnet, Mr! Du kannst im Fenster auf 'Echten Gmail Account Verbinden' klicken, um deinen Posteingang zu synchronisieren.";
        } else {
          responseText = lang === "en"
            ? "I opened your Gmail Tool and am synchronizing your latest emails, Mr."
            : "Ich habe dein Gmail Tool geöffnet und synchronisiere deine neuesten E-Mails, Mr.";
        }

        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: agentId as Message["role"],
          content: responseText,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };

        setAgentChats((prev) => {
          const existing = prev[agentId] || [];
          const updated = [...existing, assistantMsg];
          const nextMap = { ...prev, [agentId]: updated };
          persistAgentChats(nextMap);
          return nextMap;
        });

        if (agentId === currentAgent.id) {
          setMessages((prev) => [...prev, assistantMsg]);
        }

        if (!shouldBeSilent) {
          speak(responseText, agentId);
        }
        return;
      }

      // 2. Direct Voice / Command: Google Maps Intent Handling
      const mapRes = detectMapRequestFromMessage(text);
      if (mapRes) {
        if (mapRes.isClose) {
          setActiveMapData(null);
          setActiveWidgets((prev) => ({ ...prev, googleMaps: false }));
          const closeResp = lang === "en"
            ? "Google Maps radar view closed, Mr."
            : "Der 3D-Kartenprojektor wurde geschlossen, Mr.";
          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: agentId as Message["role"],
            content: closeResp,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          setAgentChats((prev) => {
            const existing = prev[agentId] || [];
            const updated = [...existing, assistantMsg];
            const nextMap = { ...prev, [agentId]: updated };
            persistAgentChats(nextMap);
            return nextMap;
          });
          if (agentId === currentAgent.id) {
            setMessages((prev) => [...prev, assistantMsg]);
          }
          if (!shouldBeSilent) {
            speak(closeResp, agentId);
          }
          return;
        } else if (mapRes.mapData) {
          setActiveMapData(mapRes.mapData);
          setActiveWidgets((prev) => ({ ...prev, googleMaps: true }));
          if (mapRes.mapData.isRoute) {
            setRouteOriginInput(mapRes.mapData.origin || "");
            setRouteDestInput(mapRes.mapData.destination || "");
          } else {
            const targetCity = mapRes.mapData.city || "";
            const initialZoom = mapRes.mapData.zoom || (targetCity.toLowerCase().includes("hotel") || targetCity.toLowerCase().includes("mitte") || targetCity.toLowerCase().includes("frankfurt") ? 15 : 13);
            setMapZoom(initialZoom);
            setRouteDestInput(mapRes.mapData.city || "");
          }

          let mapAck = "";
          if (mapRes.mapData.isRoute) {
            mapAck = lang === "en"
              ? `✓ Route calculated! Navigation from ${mapRes.mapData.origin} to ${mapRes.mapData.destination} projected instantly onto your HUD radar, Mr.`
              : `✓ Route berechnet! Navigation von ${mapRes.mapData.origin} nach ${mapRes.mapData.destination} sofort auf dein HUD-Radar projiziert, Mr.`;
          } else {
            const cityName = (mapRes.mapData.city || "").replace(/^Hotels in\s*/i, "");
            const isHotelReq = mapRes.mapData.category === "hotels" || /hotel/i.test(mapRes.mapData.city || "");
            if (isHotelReq) {
              mapAck = lang === "en"
                ? `✓ Interactive Hotel Radar for ${cityName} active! All verified luxury hotels and suites pinned on your display, Mr.`
                : `✓ Interaktiver Hotel-Radar für ${cityName} aktiv! Alle verifizierten Top-Hotels und Suiten sofort auf dein Display projiziert, Mr.`;
            } else {
              mapAck = lang === "en"
                ? `✓ Interactive 3D Satellite Radar for ${cityName} active! Center coordinates projected onto your display, Mr.`
                : `✓ Interaktiver 3D-Satelliten-Radar für ${cityName} aktiv! Zentrum und Koordinaten sofort auf dein Display projiziert, Mr.`;
            }
          }

          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: agentId as Message["role"],
            content: mapAck,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          setAgentChats((prev) => {
            const existing = prev[agentId] || [];
            const updated = [...existing, assistantMsg];
            const nextMap = { ...prev, [agentId]: updated };
            persistAgentChats(nextMap);
            return nextMap;
          });
          if (agentId === currentAgent.id) {
            setMessages((prev) => [...prev, assistantMsg]);
          }
          if (!shouldBeSilent) {
            speak(mapAck, agentId);
          }
          return;
        }
      }

      // 3. Direct Voice / Command: Daily Objectives Intent Handling ("was sind meine tagesziele", "zeige meine ziele", "tagesziele öffnen")
      const objectivesRes = detectObjectivesRequestFromMessage(text);
      if (objectivesRes) {
        if (objectivesRes.isClose) {
          setActiveWidgets((prev) => ({ ...prev, dailyObjectives: false }));
          const closeResp = lang === "en"
            ? "Daily Objectives HUD closed, Mr."
            : "Die Tagesziele-Übersicht wurde geschlossen, Mr.";
          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: agentId as Message["role"],
            content: closeResp,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          setAgentChats((prev) => {
            const existing = prev[agentId] || [];
            const updated = [...existing, assistantMsg];
            const nextMap = { ...prev, [agentId]: updated };
            persistAgentChats(nextMap);
            return nextMap;
          });
          if (agentId === currentAgent.id) {
            setMessages((prev) => [...prev, assistantMsg]);
          }
          if (!shouldBeSilent) {
            speak(closeResp, agentId);
          }
          return;
        } else {
          // Open the Daily Objectives widget immediately
          setActiveWidgets((prev) => ({ ...prev, dailyObjectives: true }));
          const summaryData = getDailyObjectivesFormattedSummary(userProfile?.email, lang === "en", !!objectivesRes.onlyListTitles);

          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: agentId as Message["role"],
            content: summaryData.summaryText,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };

          setAgentChats((prev) => {
            const existing = prev[agentId] || [];
            const updated = [...existing, assistantMsg];
            const nextMap = { ...prev, [agentId]: updated };
            persistAgentChats(nextMap);
            return nextMap;
          });
          if (agentId === currentAgent.id) {
            setMessages((prev) => [...prev, assistantMsg]);
          }
          if (!shouldBeSilent) {
            speak(summaryData.summaryText, agentId);
          }
          return;
        }
      }

      // 4. Direct Voice / Command: Instant App Opening Router (e.g. "öffne app store", "öffne kalender", "öffne veo", "öffne terminal")
      const appOpenRes = detectAppOpenRequestFromMessage(text);
      if (appOpenRes) {
        if (appOpenRes.specialAction === "veoStudio") {
          setVeoStudioOpen(true);
        } else if (appOpenRes.widgetKey) {
          setActiveWidgets((prev) => ({ ...prev, [appOpenRes.widgetKey!]: true }));
        }
        const openAck = lang === "en"
          ? `I have opened ${appOpenRes.appNameEn} on your dashboard, Mr.`
          : `Ich habe ${appOpenRes.appName} auf deinem Dashboard geöffnet, Mr.`;

        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: agentId as Message["role"],
          content: openAck,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };

        setAgentChats((prev) => {
          const existing = prev[agentId] || [];
          const updated = [...existing, assistantMsg];
          const nextMap = { ...prev, [agentId]: updated };
          persistAgentChats(nextMap);
          return nextMap;
        });
        if (agentId === currentAgent.id) {
          setMessages((prev) => [...prev, assistantMsg]);
        }
        if (!shouldBeSilent) {
          speak(openAck, agentId);
        }
        return;
      }
    }

    // Append system instruction context if screen action triggered
    const textToSendToApi = matchedAction
      ? `${text}\n\n[SYSTEM-INFO: Der Webbrowser und die Bildschirm-Analyse wurden gestartet für: "${matchedAction.title}".]`
      : text;

    // Get live daily goals summary to sync with AI models
    const liveObjectivesSummary = getDailyObjectivesFormattedSummary(userProfile?.email, lang === "en");

    // Infallible persistent memory extraction from user text
    extractAndSaveMemoryFromUserText(text, agentId);

    // Get persistent memory context for prompt
    const memoryContext = getPersistentMemoryContextForPrompt(agentId);
    const userMemory = getPersistentMemory();

    try {
      const data = await safeFetchJson("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-gemini-key": geminiKey,
        },
        body: JSON.stringify({
          message: textToSendToApi,
          history: (agentChats[agentId] || [])
            .filter((m) => !m.content?.includes("[AUTOMATISCHE BILDSCHIRM-BEOBACHTUNG]"))
            .slice(-8)
            .map((m) => ({
              role: m.role,
              content: typeof m.content === "string" ? (m.content.length > 800 ? m.content.slice(0, 800) + "..." : m.content) : "",
            })),
          agent: agentId,
          compare: false,
          image: imageUrl || effectiveImageUrls[0],
          images: effectiveImageUrls,
          video: firstVideo || undefined,
          videos: videoUrls.length > 0 ? videoUrls : undefined,
          scope: effectiveScope,
          dailyObjectives: liveObjectivesSummary.summaryText,
          clientDateStr: new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          memoryContext,
          userMemory,
          linkedAppsContext: getLinkedAppsContextForPrompt(agentId, isAdminUser),
        }),
      });

      if (data.isMultiAgent && effectiveScope === "ALL") {
        const leadRespObj =
          data.multiResponses?.find((r: any) => r.agentId === "neo") ||
          data.multiResponses?.find((r: any) => r.agentId === "syntax" || r.agentId === "maze") ||
          data.multiResponses?.[0];
        const rawSpeechText = leadRespObj?.response || data.response || "Anfrage verarbeitet.";
        const cleanSpeechText = processMapCommandsAndCleanText(rawSpeechText);

        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: agentId as Message["role"],
          isMultiAgent: true,
          scope: "ALL",
          multiResponses: data.multiResponses,
          content: cleanSpeechText,
          imageUrl: data.imageUrl || leadRespObj?.imageUrl,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };

        if (data.agentSyncSynthesis) {
          setActiveAgentSyncSynthesis(data.agentSyncSynthesis);
        }

        // Record telemetry & query logs for active agents
        if (Array.isArray(data.multiResponses) && data.multiResponses.length > 0) {
          data.multiResponses.forEach((r: any) => {
            recordAgentUsage(r.agentId || agentId, 280, 1600);
            recordQueryLog({
              agentId: r.agentId || agentId,
              query: text || "Multi-Agent Broadcast",
              thought: r.thought,
              response: processMapCommandsAndCleanText(r.response || ""),
              scope: "ALL",
            });
          });
        }

        setAgentChats((prev) => {
          const existing = prev[agentId] || [];
          const updated = [...existing, assistantMsg];
          const nextMap = { ...prev, [agentId]: updated };
          persistAgentChats(nextMap);
          return nextMap;
        });

        if (agentId === currentAgent.id) {
          setMessages((prev) => [...prev, assistantMsg]);
        }

        if (!shouldBeSilent) {
          speak(cleanSpeechText, leadRespObj?.agentId || "neo");
        }
        return cleanSpeechText || assistantMsg.content;
      } else {
        const leadText = data.response || (data.multiResponses && data.multiResponses.find((r: any) => r.agentId === agentId)?.response) || data.multiResponses?.[0]?.response || data.claude || data.gemini || "Anfrage verarbeitet.";
        const cleanSpeechText = processMapCommandsAndCleanText(leadText);
        const leadThought = data.thought || (data.multiResponses && data.multiResponses.find((r: any) => r.agentId === agentId)?.thought);

        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: agentId as Message["role"],
          thought: leadThought,
          content: cleanSpeechText,
          imageUrl: data.imageUrl,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };

        recordAgentUsage(agentId, 240, 1800);
        recordQueryLog({
          agentId: agentId,
          query: text || "Core Anfrage",
          thought: leadThought,
          response: assistantMsg.content,
          scope: "SINGLE",
        });

        setAgentChats((prev) => {
          const existing = prev[agentId] || [];
          const updated = [...existing, assistantMsg];
          const nextMap = { ...prev, [agentId]: updated };
          persistAgentChats(nextMap);
          return nextMap;
        });

        if (agentId === currentAgent.id) {
          setMessages((prev) => [...prev, assistantMsg]);
        }

        if (!shouldBeSilent) {
          speak(assistantMsg.content, agentId);
        }
        return assistantMsg.content;
      }
    } catch (err: any) {
      let errMsg = err.message || "Fehler bei der Kommunikation mit dem Core.";
      if (errMsg.includes("GEMINI_API_KEY_MISSING") || errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID")) {
        errMsg = "Keine gültige API verknüpft: Bitte gib unten im Chat deinen Google Gemini API-Key ein und klicke auf 'VERKNÜPFEN', um sofort loszulegen.";
      }
      const errResponseMsg: Message = {
        id: `err-${Date.now()}`,
        role: agentId as Message["role"],
        content: `⚠️ ${errMsg}`,
        timestamp: new Date().toLocaleTimeString("de-DE"),
      };
      setAgentChats((prev) => {
        const existing = prev[agentId] || [];
        const updated = [...existing, errResponseMsg];
        const nextMap = { ...prev, [agentId]: updated };
        persistAgentChats(nextMap);
        return nextMap;
      });
      return errResponseMsg.content;
    }
  };

  const handleBroadcastToAllAgents = async (text: string, imageUrl?: string) => {
    const promises = agents.map((ag) => handleSendMessageToAgent(ag.id, text, imageUrl));
    await Promise.allSettled(promises);
  };

  const handleAnalyzeUrlWithNeo = (url: string, pageTitle?: string) => {
    const neoAgent = agents.find((a) => a.id === "neo") || currentAgent;
    handleSwitchAgent(neoAgent);
    const prompt = `Analysiere bitte ${url} (${pageTitle || "Webseite"}). Was verkauft und bietet diese Seite an und worum geht es dort genau?`;
    handleSendMessage(prompt);
  };

  // --- Messaging Backend Calls ---
  const handleSendMessage = async (textToSend?: string) => {
    const rawMessage = textToSend || input;
    const effectiveImages = selectedImages.length > 0
      ? selectedImages
      : (selectedImage ? [selectedImage] : []);

    if ((!rawMessage.trim() && effectiveImages.length === 0) || isLoading) return;

    // Reset inputs
    if (!textToSend) setInput("");

    // Cancel active speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const msgLower = rawMessage.toLowerCase();

    // Autonomous Web Action / Screen Access Intent Detection (Only when explicitly requested in single mode)
    const matchedAction = communicationScope !== "ALL" ? checkAndTriggerScreenActions(rawMessage, communicationScope) : null;
    const messagePayload = matchedAction
      ? `${rawMessage}\n\n[SYSTEM-INFO: Der Webbrowser und die Bildschirm-Analyse wurden gestartet für: "${matchedAction.title}".]`
      : rawMessage;

    // Auto-detect URLs in message to open Quantum Web Browser alongside
    const urlPattern = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i;
    const urlMatch = rawMessage.match(urlPattern);
    if (urlMatch && !matchedAction) {
      let targetUrl = urlMatch[0];
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = "https://" + targetUrl;
      }
      setBrowserInitialUrl(targetUrl);
      setBrowserInitialTitle(targetUrl.replace(/https?:\/\//, "").split("/")[0]);
      setActiveWidgets((prev) => ({ ...prev, webBrowser: true }));
      addSystemLog(`Quantum Browser geöffnet für Live-Analyse: ${targetUrl}`, "info", "N.E.O.");
    }

    // In multi-agent "ALL" mode, NEVER hijack with local popups - send straight to the 8 AI agent cores
    if (communicationScope !== "ALL") {
      // 1. Direct Voice / Command: Explicit Gmail Intent Handling
      const isGmailReq = detectGmailRequestFromMessage(rawMessage);

      if (isGmailReq) {
        let isGmailConnected = false;
        try {
          const token = localStorage.getItem("gmail_oauth_token");
          const isConn = localStorage.getItem("gmail_is_connected") === "true";
          isGmailConnected = !!(token && token.trim().length > 10) || isConn;
        } catch (e) {}

        const userMsg: Message = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: rawMessage,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };

        // Open the Gmail widget so the user can interact/authenticate immediately
        setActiveWidgets((prev) => ({ ...prev, gmailInbox: true }));

        let responseText = "";
        if (!isGmailConnected) {
          responseText = lang === "en"
            ? "I opened your Gmail Tool, Mr! You can click 'Connect Real Gmail Account' inside the window to link your Google Workspace inbox."
            : "Ich habe dein Gmail Tool geöffnet, Mr! Du kannst im Fenster auf 'Echten Gmail Account Verbinden' klicken, um deinen Posteingang zu synchronisieren.";
        } else {
          responseText = lang === "en"
            ? "I opened your Gmail Tool and am synchronizing your latest emails, Mr."
            : "Ich habe dein Gmail Tool geöffnet und synchronisiere deine neuesten E-Mails, Mr.";
        }

        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: currentAgent.id,
          content: responseText,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };
        updateMessages((prev) => [...prev, userMsg, assistantMsg]);
        speak(responseText, currentAgent.id);
        return;
      }

      // 2. Direct Voice / Command: Explicit Google Maps Intent Handling
      const mapRes = detectMapRequestFromMessage(rawMessage);
      if (mapRes) {
        if (mapRes.isClose) {
          setActiveMapData(null);
          setActiveWidgets((prev) => ({ ...prev, googleMaps: false }));
          const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: rawMessage,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          const closeResp = lang === "en"
            ? "Google Maps radar view closed, Mr."
            : "Der 3D-Kartenprojektor wurde geschlossen, Mr.";
          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: currentAgent.id,
            content: closeResp,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          updateMessages((prev) => [...prev, userMsg, assistantMsg]);
          speak(closeResp, currentAgent.id);
          return;
        } else if (mapRes.mapData) {
          setActiveMapData(mapRes.mapData);
          setActiveWidgets((prev) => ({ ...prev, googleMaps: true }));
          if (mapRes.mapData.isRoute) {
            setRouteOriginInput(mapRes.mapData.origin || "");
            setRouteDestInput(mapRes.mapData.destination || "");
          } else {
            const targetCity = mapRes.mapData.city || "";
            const initialZoom = mapRes.mapData.zoom || (targetCity.toLowerCase().includes("hotel") || targetCity.toLowerCase().includes("mitte") || targetCity.toLowerCase().includes("frankfurt") ? 15 : 13);
            setMapZoom(initialZoom);
            setRouteDestInput(mapRes.mapData.city || "");
          }

          const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: rawMessage,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };

          let mapAck = "";
          if (mapRes.mapData.isRoute) {
            mapAck = lang === "en"
              ? `I projected the route from ${mapRes.mapData.origin} to ${mapRes.mapData.destination} onto your HUD display, Mr.`
              : `Ich habe die Navigation von ${mapRes.mapData.origin} nach ${mapRes.mapData.destination} auf dein Display projiziert, Mr.`;
          } else {
            const cityName = (mapRes.mapData.city || "").replace(/^Hotels in\s*/i, "");
            const isHotelReq = mapRes.mapData.category === "hotels" || /hotel/i.test(mapRes.mapData.city || "");
            mapAck = isHotelReq
              ? (lang === "en" ? `I projected the hotel radar of ${cityName} onto your display, Mr.` : `Ich habe die Hotel-Übersicht von ${cityName} auf dein Display projiziert, Mr.`)
              : (lang === "en" ? `I projected the 3D map of ${cityName} onto your display, Mr.` : `Ich habe die 3D-Kartenansicht von ${cityName} auf dein Display projiziert, Mr.`);
          }

          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: currentAgent.id,
            content: mapAck,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          updateMessages((prev) => [...prev, userMsg, assistantMsg]);
          speak(mapAck, currentAgent.id);
          return;
        }
      }

      // 3. Direct Voice / Command: Explicit Daily Objectives Intent Handling
      const objectivesRes = detectObjectivesRequestFromMessage(rawMessage);
      if (objectivesRes) {
        if (objectivesRes.isClose) {
          setActiveWidgets((prev) => ({ ...prev, dailyObjectives: false }));
          const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: rawMessage,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          const closeResp = lang === "en"
            ? "Daily Objectives HUD closed, Mr."
            : "Die Tagesziele-Übersicht wurde geschlossen, Mr.";
          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: currentAgent.id,
            content: closeResp,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          updateMessages((prev) => [...prev, userMsg, assistantMsg]);
          speak(closeResp, currentAgent.id);
          return;
        } else {
          setActiveWidgets((prev) => ({ ...prev, dailyObjectives: true }));
          const summaryData = getDailyObjectivesFormattedSummary(userProfile?.email, lang === "en", !!objectivesRes.onlyListTitles);

          const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: rawMessage,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          const assistantMsg: Message = {
            id: `msg-${Date.now() + 1}`,
            role: currentAgent.id,
            content: summaryData.summaryText,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          };
          updateMessages((prev) => [...prev, userMsg, assistantMsg]);
          speak(summaryData.summaryText, currentAgent.id);
          return;
        }
      }

      // 4. Direct Voice / Command: Explicit Instant App Opening Router
      const appOpenRes = detectAppOpenRequestFromMessage(rawMessage);
      if (appOpenRes) {
        if (appOpenRes.specialAction === "veoStudio") {
          setVeoStudioOpen(true);
        } else if (appOpenRes.widgetKey) {
          setActiveWidgets((prev) => ({ ...prev, [appOpenRes.widgetKey!]: true }));
        }
        const openAck = lang === "en"
          ? `I have opened ${appOpenRes.appNameEn} on your dashboard, Mr.`
          : `Ich habe ${appOpenRes.appName} auf deinem Dashboard geöffnet, Mr.`;

        const userMsg: Message = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: rawMessage,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };
        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: currentAgent.id,
          content: openAck,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };
        updateMessages((prev) => [...prev, userMsg, assistantMsg]);
        speak(openAck, currentAgent.id);
        return;
      }
    }

    const isExplicitImageReq = 
      /^(?:generiere|erstelle|zeig(?:e)?|mach|mal(?:e)?|entwirf|bau(?:e)?|projiziere)\s+.*(?:foto|bild|hologramm|grafik|illustration)/i.test(rawMessage) ||
      /(?:foto|bild|hologramm)\s+(?:von|über|zu|mit)\s+/i.test(rawMessage) ||
      /(?:zeig(?:e)?|generier(?:e)?|erstelle?|mach|mal(?:e)?)\s+mir\s+(?:ein|eine)?\s*(?:foto|bild|hologramm)/i.test(rawMessage) ||
      /(?:create|generate|show|draw)\s+(?:a|an)?\s*(?:photo|image|picture|hologram)/i.test(rawMessage);

    const shouldGenerateImage = isImageMode || (isExplicitImageReq && effectiveImages.length === 0);

    if (shouldGenerateImage) {
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: rawMessage || (effectiveImages.length > 0 ? "Geladene Bildvorlage anpassen" : "Hologramm generieren"),
        imageUrl: effectiveImages[0] || undefined,
        imageUrls: effectiveImages.length > 0 ? effectiveImages : undefined,
        timestamp: new Date().toLocaleTimeString("de-DE"),
      };

      updateMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setState("thinking");

      const currentImage = effectiveImages[0] || null;
      handleClearImages();

      try {
        const data = await safeFetchJson("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-custom-gemini-key": geminiKey,
          },
          body: JSON.stringify({
            prompt: rawMessage,
            image: currentImage,
            aspectRatio: aspectRatio,
            imageSize: imageSize,
          }),
        });

        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: currentAgent.id,
          content: data.explanation || "Mr, das Hologramm wurde erfolgreich in Ihre Umgebung projiziert.",
          imageUrl: data.imageUrl,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };
        updateMessages((prev) => [...prev, assistantMsg]);

        if (data.imageUrl) {
          const holoObj = {
            url: data.imageUrl,
            prompt: rawMessage || "Projiziertes Hologramm",
            timestamp: new Date().toLocaleTimeString("de-DE"),
            enhancedPrompt: data.enhancedPrompt,
          };
          setActiveHologram(holoObj);
          addHologramToGallery(holoObj);
        }

        setIsQuotaExhausted(false);
        speak(data.explanation || "Projektion abgeschlossen.");
      } catch (err: any) {
        console.error(err);
        const errMsg = err.message || "";
        const isQuotaError = errMsg.includes("Quoten-Limit") || errMsg.includes("429");
        const isInvalidKeyError = errMsg.includes("Ungültiger API-Key");
        const is503Error = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE");

        if (isQuotaError || isInvalidKeyError || is503Error) {
          setIsQuotaExhausted(true);
          setShowChat(true);
        }

        const displayMessage = is503Error
          ? "⚠️ Google Cloud Server überlastet (Fehler 503). Die Anfragekapazitäten von Google sind aktuell ausgelastet. Bitte versuche es in wenigen Sekunden noch einmal oder trage deinen eigenen Gemini API-Key in den Einstellungen ein."
          : (isQuotaError || isInvalidKeyError)
            ? errMsg
            : `Warnung: Die Verbindung zum Hologramm-Core wurde unterbrochen. Detail: ${errMsg}`;

        updateMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: currentAgent.id,
            content: displayMessage,
            timestamp: new Date().toLocaleTimeString("de-DE"),
          }
        ]);
      } finally {
        setIsLoading(false);
        setState("");
      }
      return;
    }

    // --- Standard AI Chat & Vision Photo / Video Analysis ---
    const currentAttachedImages = [...effectiveImages];
    handleClearImages();

    const videoUrls = currentAttachedImages.filter(isVideoUrl);
    const hasVideos = videoUrls.length > 0;
    const hasImages = currentAttachedImages.some((u) => !isVideoUrl(u));

    let defaultAttachmentText = "";
    if (hasVideos && hasImages) {
      defaultAttachmentText = `${currentAttachedImages.length} Medien (Video & Fotos) analysieren`;
    } else if (hasVideos) {
      defaultAttachmentText = videoUrls.length > 1 ? `${videoUrls.length} Videos analysieren` : "Video analysieren";
    } else if (currentAttachedImages.length > 0) {
      defaultAttachmentText = currentAttachedImages.length === 1 ? "Bild analysieren" : `${currentAttachedImages.length} Bilder analysieren`;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: rawMessage || defaultAttachmentText,
      imageUrl: currentAttachedImages[0] || undefined,
      imageUrls: currentAttachedImages.length > 0 ? currentAttachedImages : undefined,
      videoUrl: videoUrls[0] || undefined,
      videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      timestamp: new Date().toLocaleTimeString("de-DE"),
    };

    updateMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setState("thinking");

    try {
      // Build history context (last 8 messages, sanitized for fast token processing)
      const formattedHistory = messages
        .filter((m) => !m.content?.includes("[AUTOMATISCHE BILDSCHIRM-BEOBACHTUNG]"))
        .slice(-8)
        .map((m) => {
          let text = m.content || "";
          if (m.isCompare && m.compareResult) {
            text = `Claude Response: ${m.compareResult.claude}\nGemini Response: ${m.compareResult.gemini}`;
          }
          return {
            role: m.role,
            content: text.length > 800 ? text.slice(0, 800) + "..." : text,
          };
        });

      const liveObjectivesSummary = getDailyObjectivesFormattedSummary(userProfile?.email, lang === "en");

      // Infallible persistent memory extraction from user text
      if (rawMessage) {
        extractAndSaveMemoryFromUserText(rawMessage, currentAgent.id);
      }

      // Get persistent memory context for prompt
      const memoryContext = getPersistentMemoryContextForPrompt(currentAgent.id);
      const userMemory = getPersistentMemory();

      const data = await safeFetchJson("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-gemini-key": geminiKey,
        },
        body: JSON.stringify({
          message:
            messagePayload ||
            (currentAttachedImages.length > 0
              ? hasVideos && hasImages
                ? `Analysiere bitte dieses Video und die Fotos im Detail und erkläre mir die Handlungen.`
                : hasVideos
                ? videoUrls.length > 1
                  ? `Analysiere bitte diese ${videoUrls.length} Videos im Detail und beschreibe die Abläufe.`
                  : "Analysiere bitte dieses Video im Detail und beschreibe Szenen, Handlungen und Inhalt."
                : `Analysiere bitte diese ${currentAttachedImages.length > 1 ? currentAttachedImages.length + " Bilder" : "Bild"} und beschreibe was du siehst.`
              : ""),
          history: formattedHistory,
          agent: currentAgent.id,
          compare: compareEnabled,
          image: currentAttachedImages[0] || undefined,
          images: currentAttachedImages,
          video: videoUrls[0] || undefined,
          videos: videoUrls.length > 0 ? videoUrls : undefined,
          scope: communicationScope === "ALL" ? "ALL" : "SINGLE",
          dailyObjectives: liveObjectivesSummary.summaryText,
          clientDateStr: new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          memoryContext,
          userMemory,
          linkedAppsContext: getLinkedAppsContextForPrompt(currentAgent.id, isAdminUser),
        }),
      });

      setIsQuotaExhausted(false);
      if (data.isMultiAgent && communicationScope === "ALL") {
        const leadRespObj = data.multiResponses?.find((r: any) => r.agentId === "neo") || data.multiResponses?.find((r: any) => r.agentId === "syntax" || r.agentId === "maze");
        const rawSpeechText = leadRespObj?.response || data.response || "Befehl verarbeitet.";
        const cleanSpeechText = processMapCommandsAndCleanText(rawSpeechText);

        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: currentAgent.id,
          isMultiAgent: true,
          scope: "ALL",
          multiResponses: data.multiResponses,
          content: cleanSpeechText,
          imageUrl: data.imageUrl || leadRespObj?.imageUrl,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };
        updateMessages((prev) => [...prev, assistantMsg]);

        // Record real token & query metrics per active agent
        if (Array.isArray(data.multiResponses) && data.multiResponses.length > 0) {
          data.multiResponses.forEach((r: any) => {
            recordAgentUsage(r.agentId || currentAgent.id, 280, 1600);
            recordQueryLog({
              agentId: r.agentId || currentAgent.id,
              query: rawMessage || messagePayload || "Multi-Agent Broadcast",
              thought: r.thought,
              response: processMapCommandsAndCleanText(r.response || ""),
              scope: "ALL",
            });
          });
        } else {
          recordAgentUsage(currentAgent.id, 320, 1800);
          recordQueryLog({
            agentId: currentAgent.id,
            query: rawMessage || messagePayload || "Multi-Agent Broadcast",
            thought: data.thought,
            response: cleanSpeechText,
            scope: "ALL",
          });
        }

        const isObservationMsg =
          /(?:\[AUTOMATISCHE BILDSCHIRM-BEOBACHTUNG\]|\[BILDSCHIRM-BEOBACHTUNG\]|\[SCREENSHOT_OBSERVATION\])/i.test(messagePayload || "");

        // Speak ALL agents sequentially in queue ONLY if not an observation
        if (!isObservationMsg) {
          if (data.multiResponses && data.multiResponses.length > 0) {
            speakMultiAgentQueue(
              data.multiResponses.map((r: any) => ({
                agentId: r.agentId,
                response: processMapCommandsAndCleanText(r.response || ""),
              }))
            );
          } else {
            speak(cleanSpeechText, leadRespObj?.agentId || "neo");
          }
        }
      } else if (compareEnabled) {
        const defaultFallback = "Systeme im Normalbetrieb. Ich stehe Ihnen zur Verfügung, Mr.";
        const cleanClaude = processMapCommandsAndCleanText(data.claude) || defaultFallback;
        const cleanGemini = processMapCommandsAndCleanText(data.gemini) || defaultFallback;
        // Dual core comparison result
        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: currentAgent.id,
          isCompare: true,
          compareResult: {
            claude: cleanClaude,
            gemini: cleanGemini,
            claudeThought: data.claudeThought || `Analysiere Strategie als ${currentAgent.name} (Claude Core)...`,
            geminiThought: data.geminiThought || `Synthetisiere Lösung als ${currentAgent.name} (Gemini Core)...`,
          },
          content: cleanClaude, // Default speaking speech uses the primary core
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };
        updateMessages((prev) => [...prev, assistantMsg]);
        recordAgentUsage(currentAgent.id, 450, 2400);
        recordQueryLog({
          agentId: currentAgent.id,
          query: rawMessage || messagePayload || "Dual-Core Analyse",
          thought: data.claudeThought || data.geminiThought,
          response: cleanClaude,
          scope: "SINGLE",
        });
        speak(cleanClaude, currentAgent.id);
      } else {
        const rawText = data.response || (data.multiResponses && data.multiResponses.find((r: any) => r.agentId === currentAgent.id)?.response) || data.multiResponses?.[0]?.response || "Systeme im Normalbetrieb. Ich stehe Ihnen zur Verfügung, Mr.";
        const cleanResponse = processMapCommandsAndCleanText(rawText);
        const resolvedThought = data.thought || (data.multiResponses && data.multiResponses.find((r: any) => r.agentId === currentAgent.id)?.thought) || `Analysiere Anfrage und erstelle präzise Lösung als ${currentAgent.name}...`;
        // Single core result
        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: currentAgent.id,
          thought: resolvedThought,
          content: cleanResponse,
          imageUrl: data.imageUrl,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        };
        updateMessages((prev) => [...prev, assistantMsg]);
        recordAgentUsage(currentAgent.id, 240, 1800);
        recordQueryLog({
          agentId: currentAgent.id,
          query: rawMessage || messagePayload || "Core Anfrage",
          thought: resolvedThought,
          response: cleanResponse,
          scope: "SINGLE",
        });
        speak(cleanResponse, currentAgent.id);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = String(err.message || err || "");
      const isQuotaError = errMsg.includes("Quoten-Limit") || errMsg.includes("429") || errMsg.toLowerCase().includes("quota");
      const isInvalidKeyError = errMsg.includes("Ungültiger API-Key") || errMsg.includes("UNAUTHENTICATED") || errMsg.includes("401") || errMsg.includes("Account-Token");
      const is503Error = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("überlastet");

      if (isQuotaError || isInvalidKeyError || is503Error) {
        setIsQuotaExhausted(true);
        setShowChat(true);
      }

      const displayMessage = is503Error
        ? "⚠️ Google Cloud Server überlastet (Fehler 503: High Demand). Google meldet aktuell sehr hohe Serverauslastung. Wir haben automatisch Modell-Wechsel und Wiederholungen ausprobiert. Bitte warte einige Sekunden und versuche es erneut, oder hinterlege deinen eigenen Gemini API-Key in den Einstellungen."
        : (isQuotaError || isInvalidKeyError)
          ? errMsg
          : `Warnung: Die Verbindung zum Core wurde unterbrochen. Detail: ${errMsg}`;

      updateMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: currentAgent.id,
          content: displayMessage,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        }
      ]);

      // Spoken voice feedback for errors so JARVIS always speaks
      if (isQuotaError) {
        speak("Achtung Mr, das Quotenlimit für das KI-Modell ist erreicht. Bitte überprüfen Sie Ihren API-Key.");
      } else if (isInvalidKeyError) {
        speak("Achtung Mr, der eingegebene API-Key ist ungültig oder noch nicht aktiv.");
      } else if (is503Error) {
        speak("Achtung Mr, die Google-Server sind aktuell stark ausgelastet.");
      } else {
        speak("Warnung Mr: Die Verbindung zum Core wurde unterbrochen.");
      }
    } finally {
      setIsLoading(false);
      // Wait for speaking state, otherwise reset to idle
      if (stateRef.current === "thinking") {
        setState("");
      }
    }
  };
  handleSendMessageRef.current = handleSendMessage;

  // Listen to keyboard events (Spacebar for mic toggles, Esc to stop speaking)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        toggleMic();
      }
      // Alt+C: Toggle Conversion & Live Traffic Radar (Admin only)
      if ((e.altKey || e.metaKey) && (e.key === "c" || e.key === "C") && isStoredAdminAuthenticated()) {
        e.preventDefault();
        setConversionAnalyticsOpen((prev) => !prev);
      }
      // Alt+A: Toggle Admin Master Database (Admin only)
      if ((e.altKey || e.metaKey) && (e.key === "a" || e.key === "A") && isStoredAdminAuthenticated()) {
        e.preventDefault();
        setAdminDatabaseOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        if (state === "listening" && recognition) {
          recognition.stop();
        }
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setState("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recognition, state, isLoading]);

  const showWarning = (msg: string, durationMs = 4500) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(""), durationMs);
  };

  // State-to-pill label map
  const statusLabel = () => {
    switch (state) {
      case "listening":
        return "HÖRT ZU...";
      case "thinking":
        return "VERARBEITET...";
      case "speaking":
        return "SPRICHT...";
      default:
        return "LEERTASTE FÜR SPRACHE";
    }
  };

  const canvasViewport = (
    <div className={`w-full h-full relative ${
      isEditMode
        ? isModern
          ? "ring-2 ring-purple-500/60 ring-offset-2 ring-offset-zinc-950 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          : "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 rounded-3xl overflow-hidden"
        : ""
    }`}>
      {isEditMode && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 pointer-events-none ${
          isModern
            ? "bg-purple-500/15 border border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
            : "bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
        }`}>
          <span className={`w-2 h-2 rounded-full animate-ping ${isModern ? "bg-purple-400" : "bg-cyan-400"}`} />
          <span>[S.Y.N.T.A.X. CORE CANVAS - DRAG / RESIZE ACTIVE]</span>
        </div>
      )}
      <MultiAssistantCanvas
        agents={agents}
        currentAgent={currentAgent}
        state={state}
        micLevel={micLevel}
        speakingLevel={speakingLevel}
        compareEnabled={compareEnabled}
        transitionDirection={transitionDirection}
        customShape={coreStyling.shape}
        customColor={coreStyling.color}
        particleDensity={coreStyling.density}
        particleSpeed={coreStyling.speed}
        audioSensitivity={coreStyling.audioSensitivity}
        coreStyling={coreStyling}
        communicationScope={communicationScope}
        activeSpeakingAgentId={activeSpeakingAgentId}
        isScreenSharing={isScreenSharing}
        onSelectAgent={handleSwitchAgent}
        onOpenGmailInbox={() => handleToggleWidget("gmailInbox")}
        onOpenVeoStudio={() => handleOpenVeoStudio()}
        onOpenMemoryVault={() => handleToggleWidget("claudeCode")}
        messages={messages}
        onSendMessage={(msg) => handleSendMessage(msg)}
        isLoading={isLoading}
        onToggleMic={toggleMic}
        micActive={state === "listening"}
        liveTranscript={liveTranscript}
        onImageSelect={handleImageSelect}
        selectedImage={selectedImage}
        selectedImages={selectedImages}
        onImagesSelect={handleImagesSelect}
        onRemoveImage={handleRemoveImage}
        onClearImage={handleClearImages}
        onClearChat={handleClearAgentChat}
        onSpeak={speak}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenAgentSyncSynthesis={() => handleOpenAgentSyncSynthesis()}
        onOpenVoiceConference={handleOpenVoiceConference}
        onOpenMultiAgentChat={() => setShowMultiAgentChat(true)}
        geminiKey={geminiKey}
        onSaveGeminiKey={setGeminiKey}
        onSelectCommunicationScope={handleSelectCommunicationScope}
        onOpenAgentInspector={handleOpenAgentInspector}
        onToggleCoreShape={() => setCoreStyling((prev) => ({
          ...prev,
          shape: prev.shape === "particle-orb" ? "auto" : "particle-orb",
        }))}
        isFocusMode={isFocusMode}
        onOpenCalendar={() => handleToggleWidget("calendarWidget")}
        isCalendarOpen={Boolean(activeWidgets?.calendarWidget)}
        muted={muted}
        onToggleMute={handleToggleMuteAll}
        isLayoutInstalled={isLayoutInstalled}
        onOpenLayout={() => setCoreCustomizerOpen((prev) => !prev)}
        isLayoutOpen={coreCustomizerOpen}
        isCalendarInstalled={isCalendarInstalled}
        isGoogleMapsInstalled={isGoogleMapsInstalled}
        isGoogleMapsOpen={Boolean(activeWidgets?.googleMaps)}
        onToggleGoogleMaps={() => handleToggleWidget("googleMaps")}
      />
    </div>
  );

  const chatPanelContent = (
    <ChatPanel
      messages={messages}
      currentAgent={currentAgent}
      compareEnabled={compareEnabled}
      isLoading={isLoading}
      onOpenSettings={() => setSettingsOpen(true)}
      onClearChat={handleClearAgentChat}
      onSelectHologram={(url, prompt) =>
        setActiveHologram({
          url,
          prompt,
          timestamp: new Date().toLocaleTimeString("de-DE"),
        })
      }
      lang={lang}
      onSpeak={speak}
      onOpenApp={handleOpenAppDirectly}
      onOpenToolManager={handleOpenAppToolManager}
      isAdmin={isAdminUser}
      geminiKey={geminiKey}
      onSaveGeminiKey={setGeminiKey}
    />
  );

  if (showLandingPage) {
    return (
      <div
        id="landing-app-wrapper"
        className="relative min-h-screen bg-black text-white selection:bg-white/20 selection:text-white"
      >
        {isMaintenanceActive ? (
          <MaintenanceModePage
            onEnterApp={() => {
              try {
                sessionStorage.setItem("syntax_entered_matrix_session", "true");
                localStorage.setItem("syntax_entered_matrix_session", "true");
              } catch {}
              setShowLandingPage(false);
              setIsMaintenanceActive(false);
              const activeK = getActiveAccessKey();
              if (activeK) {
                try {
                  if (localStorage.getItem("syntax_hide_key_welcome_tour") !== "true") {
                    setKeyWelcomeTourOpen(true);
                  }
                } catch {
                  setKeyWelcomeTourOpen(true);
                }
              }
            }}
            onViewSalesPage={() => {
              setIsMaintenanceActive(false);
            }}
            lang={lang}
            onToggleLang={handleToggleLang}
            onOpenAdminDatabase={() => setAdminDatabaseOpen(true)}
          />
        ) : (
          <CyberpunkLandingPage
            onEnterApp={() => {
              try {
                sessionStorage.setItem("syntax_entered_matrix_session", "true");
              } catch {}
              setShowLandingPage(false);
              const activeK = getActiveAccessKey();
              if (activeK) {
                try {
                  if (localStorage.getItem("syntax_hide_key_welcome_tour") !== "true") {
                    setKeyWelcomeTourOpen(true);
                  }
                } catch {
                  setKeyWelcomeTourOpen(true);
                }
              }
            }}
            agents={agents}
            userProfile={userProfile}
            onUpgradeToPro={(_tierName) => {
              setShowLandingPage(false);
              setIsPricingModalOpen(true);
            }}
            onOpenGmailInbox={() => handleToggleWidget("gmailInbox")}
            onOpenVeoVideoStudio={() => handleOpenVeoStudio()}
            onOpenAgentFleetStudio={() => setShowAgentFleetStudio(true)}
            onViewMaintenanceMode={() => {
              setIsMaintenanceActive(true);
              try {
                localStorage.setItem("syntax_maintenance_mode_active", "true");
              } catch {}
            }}
            lang={lang}
            onToggleLang={handleToggleLang}
          />
        )}

        {/* KICKED SESSION ALERT MODAL ON LANDING PAGE */}
        {kickedSessionModal && kickedSessionModal.isOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="w-full max-w-lg bg-[#0a0208] border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_90px_rgba(244,63,94,0.6)] text-center font-mono space-y-6 animate-scaleUp text-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-rose-950/80 border-2 border-rose-500/80 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_50px_rgba(244,63,94,0.7)] animate-pulse">
                <ShieldAlert className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>ZUGRIFF GESPERRT // ACCOUNT REVOKED</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                  SITZUNG SOFORT BEENDET
                </h2>
                <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                  {kickedSessionModal.reason}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/90 border border-rose-500/30 text-left text-xs text-slate-300 space-y-2 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Betroffene E-Mail:</span>
                  <span className="text-rose-300 font-bold">{kickedSessionModal.email}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Aktion:</span>
                  <span className="text-rose-400 font-bold">SOFORTIGER MONITOR-KICK</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Administrator:</span>
                  <span className="text-cyan-300 font-bold">{SUPERADMIN_EMAIL}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setKickedSessionModal(null);
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>SCHLIESSEN & SPERRE AKZEPTIEREN</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showAgentFleetStudio) {
    return (
      <AgentFleetStudio
        onClose={() => setShowAgentFleetStudio(false)}
        onOpenOsirisIntel={handleOpenOsirisIntel}
        onSelectAgentAndStart={(agentId) => {
          const target = agents.find((a) => a.id === agentId);
          if (target) {
            handleSwitchAgent(target);
          }
          setShowAgentFleetStudio(false);
          setShowChat(true);
        }}
        currentAgentId={currentAgent.id}
        lang={lang}
      />
    );
  }

  if (dashboardViewMode === "dashboard" && !isFocusMode) {
    return (
      <CommandDashboardLayout
        currentAgent={currentAgent}
        agents={agents}
        onSelectAgent={handleSwitchAgent}
        viewMode={dashboardViewMode}
        onToggleViewMode={(mode) => {
          if (mode === "focus" || mode === "dashboard") {
            setDashboardViewMode(mode);
            setIsFocusMode(mode === "focus");
          } else {
            const nextMode = dashboardViewMode === "dashboard" ? "focus" : "dashboard";
            setDashboardViewMode(nextMode);
            setIsFocusMode(nextMode === "focus");
          }
        }}
        rightPanelOpen={rightPanelOpen}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        rightPanelTab={rightPanelTab}
        onSelectRightPanelTab={setRightPanelTab}
        eventLogs={eventLogs}
        apiLoadPercentage={apiLoadPercentage}
        isQuotaExhausted={isQuotaExhausted}
        timeStr={timeStr}
        state={state}
        statusLabel={statusLabel()}
        toggleMic={toggleMic}
        isLoading={isLoading}
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        selectedImage={selectedImage}
        selectedImages={selectedImages}
        onImageSelect={handleImageSelect}
        onImagesSelect={handleImagesSelect}
        onRemoveImage={handleRemoveImage}
        onClearImage={handleClearImages}
        isImageMode={isImageMode}
        setIsImageMode={setIsImageMode}
        captionWords={captionWords}
        captionProgress={captionProgress}
        micLevel={micLevel}
        userRole={userRole}
        userProfile={userProfile}
        onOpenRoleManager={() => setRoleManagerOpen(true)}
        onOpenRewardProgram={() => setRewardProgramOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenJarvisTerminalDashboard={() => setJarvisTerminalOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenWebBrowser={() => handleToggleWidget("webBrowser")}
        onOpenAppStore={() => handleToggleWidget("appStore")}
        onOpenGmailInbox={() => handleToggleWidget("gmailInbox")}
        onOpenCalendar={() => handleToggleWidget("calendarWidget")}
        onOpenObsidianBrain={() => setObsidianBrainOpen(true)}
        onOpenVeoVideoStudio={() => handleOpenVeoStudio()}
        onOpenSocialUpload={handleOpenSocialUpload}
        onOpenConstellation={() => setShowConstellation(true)}
        onOpenMultiAgentChat={() => setShowMultiAgentChat(true)}
        onOpenLandingPage={handleOpenSalesPage}
        onOpenAdminDatabase={() => setAdminDatabaseOpen(true)}
        onOpenConversionAnalytics={() => setConversionAnalyticsOpen(true)}
        onOpenTutorial={() => setShowGenesisModal(true)}
        onOpenKeyWelcomeTour={() => setKeyWelcomeTourOpen(true)}
        onOpenDailyUsage={() => setIsDailyUsageOpen(true)}
        communicationScope={communicationScope}
        onCommunicationScopeChange={handleSelectCommunicationScope}
        canvasViewport={canvasViewport}
        chatPanelContent={chatPanelContent}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        geminiKey={geminiKey}
        onSaveGeminiKey={setGeminiKey}
        lang={lang}
      >
        {/* Modals & Overlay Widgets inside layout container */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          geminiKey={geminiKey}
          onSaveGeminiKey={setGeminiKey}
          compareEnabled={compareEnabled}
          onToggleCompare={() => setCompareEnabled(!compareEnabled)}
          muted={muted}
          onToggleMute={() => {
            const nextMute = !muted;
            setMuted(nextMute);
            if (nextMute && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          }}
          onClearAllChats={handleClearAllChats}
          micSensitivity={micSensitivity}
          onChangeMicSensitivity={setMicSensitivity}
        />

        <RoleManagerModal
          isOpen={roleManagerOpen}
          onClose={() => setRoleManagerOpen(false)}
          userProfile={userProfile}
          onSelectRole={handleSelectUserRole}
          onUpdateProfile={handleUpdateUserProfile}
        />

        <JarvisTerminalDashboard
          isOpen={jarvisTerminalOpen}
          onClose={() => setJarvisTerminalOpen(false)}
          agents={agents}
          currentAgent={currentAgent}
          onSelectAgent={handleSwitchAgent}
          agentChats={agentChats}
          onSendMessageToAgent={handleSendMessageToAgent}
          userRole={userRole}
          onSelectRole={handleSelectUserRole}
          onOpenRoleManager={() => setRoleManagerOpen(true)}
        />

        <MazeRewardModal
          isOpen={rewardProgramOpen}
          onClose={() => setRewardProgramOpen(false)}
          userRole={userRole}
          onSelectRole={handleSelectUserRole}
          agentChats={agentChats}
          agents={agents}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateUserProfile}
          onOpenRoleManager={() => setRoleManagerOpen(true)}
        />

        {activeHologram && (
          <HologramProjector
            imageUrl={activeHologram.url}
            prompt={activeHologram.prompt}
            timestamp={activeHologram.timestamp}
            onClose={() => setActiveHologram(null)}
            onEditPrompt={(newPrompt) => {
              setIsImageMode(true);
              setSelectedImage(activeHologram.url);
              handleSendMessage(newPrompt);
            }}
            onOpenGallery={() => setIsGalleryOpen(true)}
            isLoading={isLoading}
            currentAgentColor={currentAgent.color}
          />
        )}

        {showConstellation && (
          <AgentConstellationScreen
            agents={agents}
            currentAgentId={currentAgent.id}
            onSelectAgentAndStart={(agentId) => {
              const targetAgent = agents.find((a) => a.id === agentId);
              if (targetAgent) {
                setCurrentAgent(targetAgent);
              }
              setShowConstellation(false);
            }}
            onCloseConstellation={() => setShowConstellation(false)}
            onOpenMultiAgentChat={() => setShowMultiAgentChat(true)}
            onOpenLandingPage={() => {
              setShowConstellation(false);
              setShowLandingPage(true);
            }}
            userRole={userRole}
            onSelectRole={handleSelectUserRole}
            onOpenRoleManager={() => setRoleManagerOpen(true)}
            onOpenTutorial={() => {
              setShowConstellation(false);
              setShowLandingPage(false);
              setDashboardViewMode("focus");
              setIsFocusMode(false);
              setIsEditMode(false);
              setShowTutorialModal(true);
            }}
          />
        )}

        {showMultiAgentChat && (
          <MultiAgentChatScreen
            agents={agents}
            currentAgent={currentAgent}
            onSelectAgent={(ag) => handleSwitchAgent(ag)}
            agentChats={agentChats}
            onSendMessageToAgent={handleSendMessageToAgent}
            onClearAllChats={handleClearAllChats}
            onClose={() => setShowMultiAgentChat(false)}
            geminiKey={geminiKey}
            onSaveGeminiKey={setGeminiKey}
            onOpenSettings={() => setSettingsOpen(true)}
            userRole={userRole}
            onOpenRoleManager={() => setRoleManagerOpen(true)}
            onSpeak={speak}
            lang={lang}
          />
        )}

        {activeWidgets?.googleMaps && (
          <GoogleMapsWidget
            activeMapData={activeMapData}
            setActiveMapData={setActiveMapData}
            isEditMode={isEditMode}
            onClose={() => {
              setActiveMapData(null);
              setActiveWidgets((prev) => ({ ...prev, googleMaps: false }));
            }}
          />
        )}

        {activeWidgets?.miniTrades && (
          <MiniTradesWidget
            isEditMode={isEditMode}
            onClose={() => setActiveWidgets((prev) => ({ ...prev, miniTrades: false }))}
          />
        )}

        {activeWidgets?.claudeCode && (
          <ClaudeCodeTerminal
            isEditMode={isEditMode}
            onClose={() => handleToggleWidget("claudeCode")}
            currentAgent={currentAgent}
            agents={agents}
            onSelectAgent={handleSwitchAgent}
          />
        )}

        {activeWidgets?.webBrowser && (
          <WebBrowserWidget
            isEditMode={isEditMode}
            onClose={() => handleToggleWidget("webBrowser")}
            onOpenAppStore={() => handleToggleWidget("appStore")}
            onAnalyzeWithNeo={handleAnalyzeUrlWithNeo}
            initialUrl={browserInitialUrl}
            initialTitle={browserInitialTitle}
          />
        )}

        {activeWidgets?.appStore && (
          <AppStoreWidget
            isEditMode={isEditMode}
            onClose={() => handleToggleWidget("appStore")}
            lang={lang}
            installedPluginIds={installedPluginIds}
            onToggleInstall={handleToggleInstallPlugin}
            onOpenPlugin={(id) => {
              if (id === "layout") {
                setCoreCustomizerOpen(true);
                handleToggleWidget("appStore");
              } else if (id === "calendar") {
                setActiveWidgets((w) => ({ ...w, calendarWidget: true }));
                handleToggleWidget("appStore");
              } else if (id === "maps" || id === "googleMaps") {
                setActiveWidgets((w) => ({ ...w, googleMaps: true }));
                handleToggleWidget("appStore");
              }
            }}
          />
        )}

        {activeWidgets?.gmailInbox && (
          <GmailInboxWidget
            isEditMode={isEditMode}
            onClose={() => handleToggleWidget("gmailInbox")}
          />
        )}

        {activeWidgets?.socialUpload && (
          <SocialUploadWidget
            isEditMode={isEditMode}
            initialPlatform={socialUploadPlatform}
            onClose={() => handleToggleWidget("socialUpload")}
          />
        )}

        <MazeCoreCustomizer
          isOpen={coreCustomizerOpen}
          onClose={() => setCoreCustomizerOpen(false)}
          styling={coreStyling}
          onChangeStyling={setCoreStyling}
          onSaveAndApply={handleSaveAndApplyLayout}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          agents={agents}
          currentAgent={currentAgent}
          onSelectAgent={handleSwitchAgent}
        />

        {/* 3-Step Quickstart Welcome Tour for Key Users */}
        <KeyUserWelcomeTourModal
          isOpen={keyWelcomeTourOpen}
          onClose={() => setKeyWelcomeTourOpen(false)}
          activeKey={getActiveAccessKey()}
          onLaunchVeo={(prompt) => {
            setInput(prompt || "");
            handleOpenVeoStudio();
          }}
          onLaunch3DMatrix={() => {
            setShowConstellation(true);
          }}
          onLaunchSyntaxPrompt={(prompt) => {
            setInput(prompt);
            handleSendMessage(prompt);
          }}
          onOpenTutorial={() => setShowGenesisModal(true)}
          onOpenGmail={() => handleToggleWidget("gmailInbox")}
        />
      </CommandDashboardLayout>
    );
  }

  return (
    <div 
      id="main-app-spatial-wrapper"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleImageSelect(e.dataTransfer.files[0]);
        }
      }}
      onPaste={(e) => {
        const file = extractImageFromPasteEvent(e);
        if (file) {
          e.preventDefault();
          handleImageSelect(file);
        }
      }}
      className="relative min-h-screen w-full font-sans overflow-x-hidden snap-y snap-mandatory scroll-smooth transition-colors duration-700 bg-black text-[#d9f4ff]"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      {/* Deep Spatial Mesh Gradient & Coordinate Matrix Gridlines */}
      <div className="focus-canvas-spatial-bg">
        {/* Soft Agent-Reactive Aura 1 (Center Core Halo) */}
        <div
          className="focus-canvas-mesh-aura w-[600px] h-[600px] -top-[100px] left-1/2 -translate-x-1/2"
          style={{
            backgroundColor: ((currentAgent?.id === "syntax" || currentAgent?.id === "maze") && isModern) ? "#a855f7" : (currentAgent?.color || "#00f0ff"),
            opacity: state === "speaking" ? 0.08 : state === "listening" ? 0.1 : 0.03,
          }}
        />
        {/* Deep Space Ambient Aura 2 (Lower Right) */}
        <div
          className="focus-canvas-mesh-aura w-[500px] h-[500px] bottom-[50px] right-[10%]"
          style={{
            backgroundColor: isModern ? "#a855f7" : "#00f0ff",
            opacity: 0.02,
          }}
        />
        {/* Precision Spatial Grid Overlay with Center Mask */}
        <div className="focus-canvas-grid-lines" />
      </div>

      {/* Minimal Sovereign Top Command Bar (3-Zone Contract) */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-auto bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-black text-white tracking-widest uppercase">
            Papaya<span className="text-[#ff6b35]">OS</span>
          </span>
          <span className="text-zinc-600 text-xs">·</span>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">Sovereign Intelligence</span>
        </div>

        {/* Zone 2: System Status */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>8 Cores synchronisiert</span>
          <span className="text-zinc-600 hidden md:inline">·</span>
          <span className="text-zinc-500 hidden md:inline">0ms Latenz</span>
        </div>

        {/* Zone 3: Essential Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Audio Mute Button */}
          <button
            type="button"
            id="global-header-mute-toggle"
            onClick={handleToggleMuteAll}
            className={`text-xs font-mono transition px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg border cursor-pointer flex items-center gap-1.5 active:scale-95 select-none ${
              muted
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30 shadow-[0_0_14px_rgba(244,63,94,0.3)]"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            }`}
            title={
              muted
                ? "Audio stummgeschaltet (Klicken zum Aktivieren / Taste 'M')"
                : "Audio aktiv (Klicken zum Stummschalten / Taste 'M')"
            }
          >
            {muted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="font-bold tracking-wider text-[11px]">
              {muted ? "MUTED" : "AUDIO"}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                muted ? "bg-rose-500" : "bg-emerald-400 animate-pulse"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => handleToggleLang?.()}
            className="text-xs font-mono text-zinc-400 hover:text-white transition px-2.5 py-1 rounded-lg hover:bg-white/5 border border-white/5 cursor-pointer"
            title="Sprache wechseln"
          >
            {lang.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="text-xs font-mono text-zinc-400 hover:text-white transition px-2.5 py-1 rounded-lg hover:bg-white/5 border border-white/5 cursor-pointer flex items-center gap-1.5"
            title="Einstellungen öffnen"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Minimalist Side Plugin Tools Rail */}
      {!isFocusMode && (
        <MinimalPluginRail
          activeWidgets={activeWidgets}
          onToggleWidget={handleToggleWidget}
          onOpenVeoStudio={() => handleOpenVeoStudio()}
          onOpenObsidianBrain={() => setObsidianBrainOpen(true)}
          onOpenScreenPerception={handleGrantScreenPermission}
          isScreenSharing={isScreenSharing}
          onOpenPluginStore={() => handleToggleWidget("appStore")}
          lang={lang}
        />
      )}
      {!isFocusMode && (
        <WorkspaceLayoutEditor
          isEditMode={isEditMode}
          onExitEditMode={() => setIsEditMode(false)}
          activeWidgets={activeWidgets}
          onToggleWidget={handleToggleWidget}
          onApplyPreset={handleApplyPreset}
          onOpenCoreCustomizer={() => setCoreCustomizerOpen(true)}
          onSaveAndApply={handleSaveAndApplyLayout}
          coreStyling={coreStyling}
          hasPromoHeader={hasPromoHeader}
          isAdmin={isAdminUser}
        />
      )}

      {/* M.A.Z.E. Core Particle & Aura Customizer Modal */}
      <MazeCoreCustomizer
        isOpen={coreCustomizerOpen}
        onClose={() => setCoreCustomizerOpen(false)}
        styling={coreStyling}
        onChangeStyling={setCoreStyling}
        onSaveAndApply={handleSaveAndApplyLayout}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        agents={agents}
        currentAgent={currentAgent}
        onSelectAgent={handleSwitchAgent}
      />

      {/* Multi-Assistant 3D Reactive Particle Canvas System */}
      {!showMultiAgentChat && activeWidgets?.mazeCore && (
        <div className={`w-full h-full ${
          isEditMode
            ? isModern
              ? "ring-2 ring-purple-500/60 ring-offset-2 ring-offset-zinc-950 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              : "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 rounded-3xl overflow-hidden"
            : ""
        }`}>
          {isEditMode && (
            <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 pointer-events-none ${
              isModern
                ? "bg-purple-500/15 border border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                : "bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${isModern ? "bg-purple-400" : "bg-cyan-400"}`} />
              <span>[S.Y.N.T.A.X. CORE CANVAS - DRAG / RESIZE ACTIVE]</span>
            </div>
          )}
          <MultiAssistantCanvas
            agents={agents}
            currentAgent={currentAgent}
            state={state}
            micLevel={micLevel}
            speakingLevel={speakingLevel}
            compareEnabled={compareEnabled}
            transitionDirection={transitionDirection}
            customShape={coreStyling.shape}
            customColor={coreStyling.color}
            particleDensity={coreStyling.density}
            particleSpeed={coreStyling.speed}
            audioSensitivity={coreStyling.audioSensitivity}
            coreStyling={coreStyling}
            communicationScope={communicationScope}
            activeSpeakingAgentId={activeSpeakingAgentId}
            isScreenSharing={isScreenSharing}
            onSelectAgent={handleSwitchAgent}
            onOpenGmailInbox={() => handleToggleWidget("gmailInbox")}
            onOpenVeoStudio={() => handleOpenVeoStudio()}
            onOpenMemoryVault={() => handleToggleWidget("claudeCode")}
            messages={messages}
            onSendMessage={(msg) => handleSendMessage(msg)}
            isLoading={isLoading}
            onToggleMic={toggleMic}
            micActive={state === "listening"}
            liveTranscript={liveTranscript}
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            selectedImages={selectedImages}
            onImagesSelect={handleImagesSelect}
            onRemoveImage={handleRemoveImage}
            onClearImage={handleClearImages}
            onClearChat={handleClearAgentChat}
            onSpeak={speak}
            lang={lang}
            onToggleLang={handleToggleLang}
            onOpenAgentSyncSynthesis={() => handleOpenAgentSyncSynthesis()}
            onOpenVoiceConference={handleOpenVoiceConference}
            onOpenMultiAgentChat={() => setShowMultiAgentChat(true)}
            geminiKey={geminiKey}
            onSaveGeminiKey={setGeminiKey}
            onSelectCommunicationScope={handleSelectCommunicationScope}
            onOpenAgentInspector={handleOpenAgentInspector}
            onToggleCoreShape={() => setCoreStyling((prev) => ({
              ...prev,
              shape: prev.shape === "particle-orb" ? "auto" : "particle-orb",
            }))}
            isFocusMode={isFocusMode}
            onOpenCalendar={() => handleToggleWidget("calendarWidget")}
            isCalendarOpen={Boolean(activeWidgets?.calendarWidget)}
            muted={muted}
            onToggleMute={handleToggleMuteAll}
            isLayoutInstalled={isLayoutInstalled}
            onOpenLayout={() => setCoreCustomizerOpen((prev) => !prev)}
            isLayoutOpen={coreCustomizerOpen}
            isCalendarInstalled={isCalendarInstalled}
            isGoogleMapsInstalled={isGoogleMapsInstalled}
            isGoogleMapsOpen={Boolean(activeWidgets?.googleMaps)}
            onToggleGoogleMaps={() => handleToggleWidget("googleMaps")}
          />
        </div>
      )}

      {/* Spatial Interactive Stadtkarte / Google Maps Widget */}
      {!isFocusMode && activeWidgets?.googleMaps && (
        <GoogleMapsWidget
          activeMapData={activeMapData}
          setActiveMapData={setActiveMapData}
          isEditMode={isEditMode}
          onClose={() => {
            setActiveMapData(null);
            setActiveWidgets((prev) => ({ ...prev, googleMaps: false }));
          }}
        />
      )}

      {/* Spatial Location Weather Widget */}
      {!isFocusMode && activeWidgets?.weatherWidget && (
        <LocationWeatherWidget
          activeMapData={activeMapData}
          setActiveMapData={setActiveMapData}
          isEditMode={isEditMode}
          onClose={() => setActiveWidgets((prev) => ({ ...prev, weatherWidget: false }))}
          agentColor={currentAgent.color}
        />
      )}

      {/* Google Code Maps Bar & Radar Widget */}
      {!isFocusMode && activeWidgets?.codeMapsBar && (
        isEditMode ? (
          <CodeMapsBar isEditMode={true} isWidgetMode={true} />
        ) : (
          <div className={`fixed ${hasPromoHeader ? "top-28" : "top-14"} left-20 right-20 z-40 max-w-4xl mx-auto pointer-events-auto`}>
            <CodeMapsBar isEditMode={false} isWidgetMode={false} />
          </div>
        )
      )}

      {/* Claude Code Autonomous Live Coding Terminal Widget */}
      {!isFocusMode && activeWidgets?.claudeCode && (
        <ClaudeCodeTerminal
          isEditMode={isEditMode}
          onClose={() => handleToggleWidget("claudeCode")}
          currentAgent={currentAgent}
          agents={agents}
          onSelectAgent={handleSwitchAgent}
          lang={lang}
        />
      )}

      {/* Quantum Web Browser Widget */}
      {!isFocusMode && activeWidgets?.webBrowser && (
        <WebBrowserWidget
          isEditMode={isEditMode}
          onClose={() => handleToggleWidget("webBrowser")}
          onOpenAppStore={() => handleToggleWidget("appStore")}
          onAnalyzeWithNeo={handleAnalyzeUrlWithNeo}
          initialUrl={browserInitialUrl}
          initialTitle={browserInitialTitle}
        />
      )}

      {/* M.A.Z.E. App Store & Integrations Hub Widget */}
      {!isFocusMode && activeWidgets?.appStore && (
        <AppStoreWidget
          isEditMode={isEditMode}
          onClose={() => handleToggleWidget("appStore")}
          lang={lang}
          installedPluginIds={installedPluginIds}
          onToggleInstall={handleToggleInstallPlugin}
          onOpenPlugin={(id) => {
            if (id === "layout") {
              setCoreCustomizerOpen(true);
              handleToggleWidget("appStore");
            } else if (id === "calendar") {
              setActiveWidgets((w) => ({ ...w, calendarWidget: true }));
              handleToggleWidget("appStore");
            } else if (id === "maps" || id === "googleMaps") {
              setActiveWidgets((w) => ({ ...w, googleMaps: true }));
              handleToggleWidget("appStore");
            }
          }}
        />
      )}

      {/* Google Gmail Inbox Client App Widget */}
      {!isFocusMode && activeWidgets?.gmailInbox && (
        <GmailInboxWidget
          isEditMode={isEditMode}
          onClose={() => handleToggleWidget("gmailInbox")}
          lang={lang}
        />
      )}

      {/* Google Calendar & Chronos Terminplaner Spatial Widget */}
      {activeWidgets?.calendarWidget && (
        <ChronosCalendarWidget
          standalone={true}
          isEditMode={isEditMode}
          onClose={() => handleToggleWidget("calendarWidget")}
          agentColor={currentAgent.color}
          lang={lang}
        />
      )}

      {/* Daily Objectives // 3 Core Focuses Spatial Widget */}
      {!isFocusMode && activeWidgets?.dailyObjectives && (
        <DailyObjectivesWidget
          standalone={true}
          userEmail={getCurrentUserEmail() || ""}
          isEditMode={isEditMode}
          onClose={() => handleToggleWidget("dailyObjectives")}
          onSendGoalToAgent={(goalText, agentId) => {
            const targetAgent = agents.find((a) => a.id === agentId) || currentAgent;
            handleSwitchAgent(targetAgent);
            handleSendMessageToAgent(targetAgent.id, goalText, undefined, "SINGLE", false);
            setShowChat(true);
          }}
          agentColor={currentAgent.color}
          lang={lang}
        />
      )}

      {/* TikTok & Instagram Social Upload & Creator Engine Widget */}
      {!isFocusMode && activeWidgets?.socialUpload && (
        <SocialUploadWidget
          isEditMode={isEditMode}
          initialPlatform={socialUploadPlatform}
          onClose={() => handleToggleWidget("socialUpload")}
        />
      )}


      {/* Voice Input Fullscreen Spatial HUD Universe Overlay */}
      {state === "listening" && (
        <div className="fixed inset-0 z-50 pointer-events-auto flex flex-col items-center justify-between p-6 sm:p-10 animate-fade-in bg-black/85 backdrop-blur-2xl">
          {/* Fullscreen 3D Audio-Reactive Particle Voice Universe in background */}
          <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
            <ParticleVoiceOrb
              responsive
              type="custom"
              primaryColor={isModern ? "#a855f7" : (currentAgent.color || "#00f0ff")}
              secondaryColor={isModern ? "#c084fc" : "#38bdf8"}
              intensity={Math.max(0.3, micLevel)}
              isLive={true}
              state="listening"
              themeStyle={isModern ? "modern" : "cyberpunk"}
              enableDrag={true}
            />
            {/* Ambient Radial Vignette & Grid Layer */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.75)_80%)]" />
            <div className={`absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(168,85,247,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.04)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40`} />
          </div>

          {/* Top Status Header */}
          <div className="relative z-10 flex flex-col items-center gap-2 pt-2 animate-fade-in">
            <div className={`flex items-center gap-2.5 px-5 py-2 rounded-full border font-mono text-xs sm:text-sm font-bold tracking-[2.5px] uppercase backdrop-blur-xl shadow-2xl ${
              isModern
                ? "border-purple-500/60 bg-purple-950/60 text-purple-200 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
                : "border-cyan-500/60 bg-cyan-950/60 text-cyan-200 shadow-[0_0_40px_rgba(0,240,255,0.4)]"
            }`}>
              <span className={`w-3 h-3 rounded-full animate-ping ${isModern ? "bg-purple-400" : "bg-cyan-400"}`} />
              <span>🎙️ SPRACHEINGABE AKTIV // {currentAgent.name.toUpperCase()} & FLOTTE HÖREN ZU</span>
            </div>
            <p className={`text-[11px] font-mono tracking-wider ${isModern ? "text-purple-300/80" : "text-cyan-300/80"}`}>
              [3D PARTIKEL-UNIVERSE VOLLBILDBILDSCHIRM • DREHE DEN KOSMOS PER MAUS]
            </p>
          </div>

          {/* Center Soundwave Frequency Spectrum & Agent Focus */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto pointer-events-none gap-4">
            <div className="flex items-center gap-1.5 h-16 sm:h-20 px-6 py-3 rounded-2xl backdrop-blur-md bg-black/40 border border-white/10">
              {[0.1, 0.25, 0.45, 0.7, 0.95, 1.0, 0.95, 0.7, 0.45, 0.25, 0.1].map((scale, i) => {
                const heightPct = Math.max(15, Math.min(100, micLevel * 100 * scale + Math.random() * 25));
                const eqColor = isModern ? "#c084fc" : (currentAgent.color || "#00f0ff");
                return (
                  <div
                    key={i}
                    className={`w-2 sm:w-2.5 rounded-full transition-all duration-75 ${
                      isModern ? "shadow-[0_0_15px_#a855f7]" : "shadow-[0_0_15px_#00f0ff]"
                    }`}
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: eqColor,
                    }}
                  />
                );
              })}
            </div>
            <div className="text-center font-mono text-xs tracking-widest text-zinc-400 uppercase">
              Audio-Reaktives Signal: <span className={isModern ? "text-purple-300 font-bold" : "text-cyan-300 font-bold"}>{Math.round(micLevel * 100)}% AMPLITUDE</span>
            </div>
          </div>

          {/* Bottom Floating Control HUD */}
          <div className={`relative z-10 flex flex-col items-center gap-4 w-full max-w-2xl rounded-3xl p-6 sm:p-7 backdrop-blur-2xl border shadow-2xl ${
            isModern
              ? "bg-zinc-950/90 border-purple-500/50 shadow-[0_0_80px_rgba(168,85,247,0.4)]"
              : "bg-[#05080d]/90 border-cyan-500/50 shadow-[0_0_80px_rgba(0,240,255,0.4)]"
          }`}>
            {/* Interactive Live Voice Transcript Textbox */}
            <div className="w-full relative">
              <input
                type="text"
                value={liveTranscript}
                onChange={(e) => {
                  setLiveTranscript(e.target.value);
                  liveTranscriptRef.current = e.target.value;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendVoiceRequest();
                  }
                }}
                placeholder="Sprich frei mit SYNTAX oder tippe deine Anfrage..."
                className={`w-full px-5 py-3.5 rounded-2xl font-sans text-base sm:text-lg text-center focus:outline-none focus:ring-2 transition shadow-inner ${
                  isModern
                    ? "bg-zinc-900/90 border border-purple-500/40 text-purple-100 placeholder-zinc-500 focus:border-purple-400 focus:ring-purple-400/50"
                    : "bg-slate-900/90 border border-cyan-500/40 text-cyan-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-cyan-400/50"
                }`}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-center gap-4 w-full flex-wrap">
              <button
                type="button"
                onClick={handleSendVoiceRequest}
                className={`px-8 py-3 rounded-full text-xs sm:text-sm font-mono font-black tracking-widest uppercase cursor-pointer transition hover:scale-105 active:scale-95 flex items-center gap-2.5 z-50 shadow-xl ${
                  isModern
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-300 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300 text-black shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                }`}
              >
                <Send className={`w-4 h-4 ${isModern ? "text-white" : "text-black"}`} />
                <span>⚡ JETZT SENDEN (ODER BEI PAUSE AUTOMATISCH)</span>
              </button>
              <button
                type="button"
                onClick={handleCancelVoice}
                className={`px-6 py-3 rounded-full text-xs font-mono font-bold tracking-wider cursor-pointer transition border ${
                  isModern
                    ? "bg-zinc-900/90 hover:bg-purple-950/60 border-zinc-800 hover:border-purple-500/50 text-zinc-400 hover:text-purple-200"
                    : "bg-slate-900/90 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-300"
                }`}
              >
                ABBRECHEN (ESC)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Core HUD overlay around/on the 3D Sphere */}
      <div 
        className={`fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center pointer-events-none select-none transition-all duration-700 ease-out scale-100 ${
          isFocusMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ width: "360px", height: "360px" }}
      >
        {/* Dynamic Circular Audio Visualizer Ring */}
        <CircularVisualizer
          agentColor={currentAgent.color}
          state={state}
          micLevel={micLevel}
          speakingLevel={speakingLevel}
        />

        {/* Glowing Voice Recording Ring when listening or speaking */}
        {(state === "listening" || state === "speaking") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-300">
            <div className={`w-20 h-20 rounded-full animate-pulse ${
              isModern
                ? "bg-purple-500/10 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                : "bg-cyan-500/10 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            }`} />
          </div>
        )}
      </div>

      {/* Clean Focus Dock is now rendered cleanly inside MultiAssistantCanvas */}
      {false && activeWidgets?.agentDock !== false && !isModern && (
        <div 
          id="tour-agents-selector"
          className={`fixed ${
            agentDockPosition === "high" ? "top-[58%]" : agentDockPosition === "low" ? "top-[82%]" : "top-[71%]"
          } left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 select-none transition-all duration-500 ${
            state === "listening" || isFocusMode ? "opacity-0 pointer-events-none filter blur-sm" : "opacity-100"
          }`}
        >
          {/* Spatial Layout Edit Bar (Active when in Workspace Edit Mode) */}
          {isEditMode && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-2xl font-mono text-[9px] animate-fade-in ${
              isModern
                ? "bg-[#141419]/95 border border-purple-500/50 shadow-[0_4px_25px_rgba(168,85,247,0.3)] text-purple-200"
                : "bg-slate-950/95 border border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] text-cyan-200"
            }`}>
              <span className={`font-bold flex items-center gap-1 ${isModern ? "text-purple-300" : "text-cyan-300"}`}>
                <Sparkles className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"} animate-spin-slow`} />
                <span>[9-CORE DOCK LAYOUT]</span>
              </span>
              
              <div className={`flex items-center gap-1 border-l pl-2 ${isModern ? "border-purple-500/30" : "border-cyan-500/30"}`}>
                <button
                  onClick={() => {
                    setAgentDockPosition("high");
                    try { localStorage.setItem("jarvis_agent_dock_pos", "high"); } catch (e) {}
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer transition text-[8.5px] font-bold ${
                    agentDockPosition === "high"
                      ? isModern
                        ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        : "bg-cyan-400 text-slate-950 shadow-[0_0_10px_#00f0ff]"
                      : isModern
                      ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                  title="Agenten-Dock nach oben schieben (58% Höhe)"
                >
                  ▲ OBEN
                </button>
                <button
                  onClick={() => {
                    setAgentDockPosition("center");
                    try { localStorage.setItem("jarvis_agent_dock_pos", "center"); } catch (e) {}
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer transition text-[8.5px] font-bold ${
                    agentDockPosition === "center"
                      ? isModern
                        ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        : "bg-cyan-400 text-slate-950 shadow-[0_0_10px_#00f0ff]"
                      : isModern
                      ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                  title="Agenten-Dock zentriert positionieren (71% Standardhöhe)"
                >
                  ● MITTE
                </button>
                <button
                  onClick={() => {
                    setAgentDockPosition("low");
                    try { localStorage.setItem("jarvis_agent_dock_pos", "low"); } catch (e) {}
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer transition text-[8.5px] font-bold ${
                    agentDockPosition === "low"
                      ? isModern
                        ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        : "bg-cyan-400 text-slate-950 shadow-[0_0_10px_#00f0ff]"
                      : isModern
                      ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                  title="Agenten-Dock nach unten schieben (82% Tiefe)"
                >
                  ▼ UNTEN
                </button>
              </div>

              <button
                onClick={() => {
                  setActiveWidgets((prev) => ({ ...prev, agentDock: false }));
                }}
                className={`ml-1 px-2 py-0.5 rounded cursor-pointer font-bold transition flex items-center gap-1 text-[8.5px] border ${
                  isModern
                    ? "bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white border-red-500/30"
                    : "bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border-red-500/40"
                }`}
                title="Agenten Dock schließen // Ausblenden (kann im Widget Center wieder aktiviert werden)"
              >
                <X className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>ENTFERNEN</span>
              </button>
            </div>
          )}

          {/* Dock Bar */}
          <div className={`flex items-center gap-2.5 px-3.5 py-1.5 border rounded-full backdrop-blur-2xl transition-all duration-300 ${
            isModern
              ? isEditMode
                ? "bg-[#141418]/95 border-purple-500/70 ring-2 ring-purple-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.25)]"
                : "bg-[#111114]/92 border-zinc-800 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
              : isEditMode
              ? "bg-[#040812]/90 border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]"
              : "bg-[#040812]/90 border-cyan-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(78,232,255,0.1)]"
          }`}>
            <button
              onClick={() => setRoleManagerOpen(true)}
              className={`font-mono text-[8.5px] tracking-[1.5px] pr-2.5 border-r uppercase flex items-center gap-1.5 cursor-pointer transition hover:scale-105 tabular-nums ${
                isModern
                  ? "text-zinc-400 hover:text-zinc-100 border-zinc-800"
                  : "text-cyan-300 hover:text-white border-cyan-500/20"
              }`}
              title={`RBAC Rollen-Manager (${userRole}) - Hier klicken zum Anpassen der freigeschalteten Agenten`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isModern ? "bg-purple-500 shadow-[0_0_6px_#a855f7]" : "bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff]"}`} />
              <span>HUB ({userRole === "LITE_ACCESS" ? "LITE 3/9" : userRole === "OPERATOR" ? "OPERATOR 7/9" : "SOVEREIGN 9/9"})</span>
            </button>
            <div className="flex items-center gap-1.5">
              {agents
                .filter((ag) => isAgentAllowed(userRole, ag.id))
                .map((ag) => {
                const isActive = currentAgent.id === ag.id;
                return (
                  <div key={ag.id} className="relative group">
                    <button
                      onClick={() => {
                        handleSwitchAgent(ag);
                      }}
                      onDoubleClick={() => handleOpenAgentInspector(ag.id)}
                      className={`relative flex items-center justify-center w-8 h-8 md:w-8.5 md:h-8.5 rounded-full cursor-pointer transition-all duration-200 focus:outline-none ${
                        isActive
                          ? isModern
                            ? "scale-105"
                            : "animate-orbit-pulse scale-105"
                          : isModern
                          ? "hover:scale-110 hover:border-zinc-600"
                          : "hover:scale-110 hover:border-cyan-400/60"
                      }`}
                      style={
                        isModern
                          ? {
                              border: isActive ? "1.5px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.08)",
                              backgroundColor: isActive ? "rgba(168, 85, 247, 0.18)" : "rgba(24, 24, 27, 0.8)",
                              boxShadow: isActive ? "0 0 12px rgba(168, 85, 247, 0.35)" : "none",
                            }
                          : {
                              border: `1px solid ${isActive ? ag.color : "rgba(255, 255, 255, 0.12)"}`,
                              backgroundColor: isActive ? `${ag.color}25` : "rgba(4, 8, 18, 0.7)",
                              boxShadow: isActive ? `0 0 16px ${ag.color}50, inset 0 0 8px ${ag.color}30` : "none",
                            }
                      }
                      title={`Klick: Zu ${ag.name} wechseln | Doppelklick: Queries & REQs öffnen`}
                    >
                      {/* Visual Status Indicator Dot in Top-Right Corner (Active: Green, Processing: Amber, Idle: Slate) */}
                      {(() => {
                        const isAgentProcessing = isActive && (state === "thinking" || state === "speaking");
                        const isAgentActive = isActive && !isAgentProcessing;
                        const statusLabel = isAgentProcessing ? "Processing" : isAgentActive ? "Active" : "Idle";

                        return (
                          <span
                            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#040812] z-10 transition-all duration-300 flex items-center justify-center ${
                              isAgentProcessing
                                ? "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"
                                : isAgentActive
                                ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                                : "bg-slate-500 opacity-60 group-hover:opacity-100"
                            }`}
                            title={`Agent ${ag.name} • Status: ${statusLabel}`}
                          >
                            {isAgentProcessing && (
                              <span className="w-full h-full rounded-full bg-amber-400 animate-ping opacity-75" />
                            )}
                          </span>
                        );
                      })()}

                      {/* Active Orbit Glow Ring with harmonic rotation (Cyberpunk only) */}
                      {!isModern && isActive && (
                        <>
                          <span 
                            style={{ borderColor: `${ag.color}80` }}
                            className="absolute -inset-1 rounded-full border border-dashed animate-[spin_8s_linear_infinite] pointer-events-none" 
                          />
                        </>
                      )}

                      {/* Standby indicator dot for inactive agents */}
                      {!isActive && (
                        <span 
                          style={{ backgroundColor: isModern ? "rgba(255, 255, 255, 0.2)" : `${ag.color}40` }}
                          className="absolute bottom-0.5 w-1 h-1 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"
                        />
                      )}

                      <span 
                        style={{ color: isActive ? (isModern ? "#c084fc" : ag.color) : (isModern ? "#a1a1aa" : "#7e92ab") }}
                        className={`font-display font-black text-[11px] transition-all duration-200 group-hover:text-white ${
                          isActive && !isModern ? "drop-shadow-[0_0_6px_currentColor]" : ""
                        }`}
                      >
                        {ag.railLetter}
                      </span>
                    </button>

                    {/* Cyber Hover Tooltip with Core Status & Query Inspector Action */}
                    <div 
                      style={{ 
                        borderColor: `${ag.color}80`,
                        backgroundColor: "rgba(3, 7, 14, 0.96)",
                        boxShadow: `0 0 25px rgba(0,0,0,0.9), 0 0 15px ${ag.color}30`
                      }}
                      className="absolute bottom-11 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 origin-bottom border px-3 py-2 rounded-xl font-mono text-[9px] whitespace-nowrap text-[#d9f4ff] transition-all duration-200 z-50 pointer-events-auto backdrop-blur-xl flex flex-col items-center gap-1.5"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ 
                            backgroundColor: ag.color,
                            boxShadow: `0 0 8px ${ag.color}` 
                          }} 
                        />
                        <span className="text-white font-display tracking-wider">{ag.name}</span>
                        <span className="text-slate-400 text-[8px] font-mono">[{ag.tag}]</span>
                      </div>

                      {(() => {
                        const isAgentProcessing = isActive && (state === "thinking" || state === "speaking");
                        const isAgentActive = isActive && !isAgentProcessing;
                        return (
                          <div className="flex items-center justify-between w-full font-mono text-[7.5px] text-slate-400 border-t border-slate-800/80 pt-1">
                            <span>STATUS:</span>
                            <span 
                              className="font-bold flex items-center gap-1"
                              style={{ 
                                color: isAgentProcessing ? "#fbbf24" : isAgentActive ? "#34d399" : "#94a3b8" 
                              }}
                            >
                              <span 
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isAgentProcessing 
                                    ? "bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" 
                                    : isAgentActive 
                                    ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" 
                                    : "bg-slate-400"
                                }`} 
                              />
                              <span>
                                {isAgentProcessing 
                                  ? (lang === "en" ? "PROCESSING" : "VERARBEITET...") 
                                  : isAgentActive 
                                  ? (lang === "en" ? "ACTIVE" : "AKTIV") 
                                  : (lang === "en" ? "IDLE" : "STANDBY")}
                              </span>
                            </span>
                          </div>
                        );
                      })()}

                      <div className="flex items-center gap-1 w-full pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAgentInspector(ag.id);
                          }}
                          className={`w-full px-2 py-1 rounded border text-[8px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1 shadow-sm ${
                            isModern
                              ? "bg-purple-950/40 hover:bg-purple-600 hover:text-white border-purple-500/40 text-purple-200"
                              : "bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/50 text-cyan-200"
                          }`}
                          title={`Alle Anfragen, Prompts & Antworten von ${ag.name} einsehen`}
                        >
                          <Brain className={`w-2.5 h-2.5 ${isModern ? "text-purple-300" : "text-cyan-300"}`} />
                          <span>MEMORY & REQS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Memory Inspector Hub Button in Console Dock */}
            <button
              onClick={() => handleOpenAgentInspector(currentAgent.id)}
              title={`Alle Memories, Prompts & Antworten von ${currentAgent.name} und den anderen 7 Cores im 3D Universe einsehen`}
              className={`px-2.5 py-1 rounded-full font-mono text-[8px] font-bold tracking-[1.5px] uppercase flex items-center gap-1 cursor-pointer transition hover:scale-105 shadow-sm ${
                isModern
                  ? "bg-purple-500/15 hover:bg-purple-500/30 border border-purple-400/50 hover:border-purple-300 text-purple-300 hover:text-white shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                  : "bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              }`}
            >
              <Brain className={`w-3 h-3 ${isModern ? "text-purple-300" : "text-cyan-300"}`} />
              <span className="hidden sm:inline">MEMORY</span>
            </button>

            {/* 3D Neural Particle Orb Quick Toggle Button */}
            <button
              onClick={() => {
                setCoreStyling((prev) => ({
                  ...prev,
                  shape: prev.shape === "particle-orb" ? "auto" : "particle-orb",
                }));
              }}
              title={coreStyling.shape === "particle-orb" ? "3D Particle Orb aktiv (Klicken zum Zurücksetzen)" : "3D Neural Particle Orb aktivieren"}
              className={`px-2.5 py-1 rounded-full font-mono text-[8px] font-bold tracking-[1.5px] uppercase flex items-center gap-1 cursor-pointer transition hover:scale-105 shadow-sm ${
                coreStyling.shape === "particle-orb"
                  ? isModern
                    ? "bg-purple-600 text-white border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] ring-1 ring-purple-400 animate-pulse"
                    : "bg-cyan-500 text-black border border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.6)] font-black animate-pulse"
                  : isModern
                  ? "bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 hover:text-white"
                  : "bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white"
              }`}
            >
              <span>🔮</span>
              <span className="hidden sm:inline">3D ORB</span>
            </button>

            {/* G.L.O.B.E. Exclusive OSIRIS AI Live Tool Button */}
            {currentAgent.id === "globe" && (
              <button
                onClick={handleOpenOsirisIntel}
                title="OSIRIS AI — Vollständiges Global Intelligence & Flight Tool öffnen"
                className="px-2.5 py-1 rounded-full font-mono text-[8px] font-bold tracking-[1.5px] uppercase flex items-center gap-1 cursor-pointer transition hover:scale-105 shadow-sm bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 text-slate-950 font-black border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse"
              >
                <span>🛰️</span>
                <span className="hidden sm:inline">OSIRIS TOOL</span>
              </button>
            )}

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              title="VisionOS Layout Anpassen & Core Customizer"
              className={`pl-2 border-l font-mono text-[8px] tracking-[1.5px] uppercase flex items-center gap-1 cursor-pointer transition hover:scale-105 ${
                isModern ? "border-zinc-700" : "border-cyan-500/20"
              } ${
                isEditMode
                  ? isModern
                    ? "text-purple-300 font-bold animate-pulse"
                    : "text-cyan-300 font-bold animate-pulse"
                  : isModern
                  ? "text-purple-400 hover:text-purple-200"
                  : "text-cyan-400 hover:text-white"
              }`}
            >
              <LayoutGrid className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              <span>LAYOUT</span>
            </button>

            {/* Close / Remove Dock button */}
            <button
              onClick={() => setActiveWidgets((prev) => ({ ...prev, agentDock: false }))}
              title="Agenten Hub schließen / ausblenden (im Widget Center wieder aktivierbar)"
              className={`p-1 rounded-full cursor-pointer transition ${
                isModern
                  ? "text-zinc-500 hover:text-purple-400 hover:bg-purple-500/15"
                  : "text-slate-500 hover:text-red-400 hover:bg-red-500/15"
              }`}
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>
      )}

      {/* Sci-Fi Grid Overlay decoration */}
      <div className={`absolute inset-0 z-[1] bg-[linear-gradient(rgba(78,232,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(78,232,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] transition-opacity duration-500 pointer-events-none mix-blend-screen mask-[radial-gradient(ellipse_at_50%_40%,black_0%,transparent_72%)] ${
        isFocusMode ? "opacity-0" : "opacity-60"
      }`} />



      {/* NEO SPEAK MODUS (Quantum Assembly Particle Orbit & Permanent Voice System) */}
      <NeoSpeakOverlay
        isOpen={neoSpeakOpen}
        onClose={() => setNeoSpeakOpen(false)}
        onSendMessage={async (text, mediaUrls) => {
          const res = await handleSendMessageToAgent(
            "neo",
            text,
            mediaUrls?.[0],
            "SINGLE",
            false,
            mediaUrls
          );
          if (typeof res === "string" && res.trim()) {
            return res;
          }
          const neoMsgs = agentChats["neo"] || [];
          const lastMsg = neoMsgs[neoMsgs.length - 1];
          return lastMsg?.content || "Alles klar, Boss.";
        }}
        isNeoSpeaking={state === "speaking" && (!activeSpeakingAgentId || activeSpeakingAgentId === "neo")}
        speakingLevel={speakingLevel}
        micLevel={micLevel}
        onStopSpeaking={handleStopSpeaking}
      />

      {/* Real-time Screen Perception HUD Overlay (Monitors 1 & 2 Stream) */}
      {isScreenSharing && (
        <ScreenCaptureHUD
          stream={screenStream}
          activeActionTitle="N.E.O. & Flotte Live-Screen-Perception"
          onStartSharing={handleGrantScreenPermission}
          onStopSharing={handleStopScreenSharing}
          onSendSnapshotToAgent={(snapshotBase64, customPrompt, isSilent) => {
            handleSendMessageToAgent(
              currentAgent.id,
              customPrompt || "Hier ist ein neuer Screenshot meines Monitors. Bitte analysiere diesen Stand!",
              snapshotBase64,
              "ALL",
              isSilent
            );
          }}
          lang="de"
        />
      )}

      {/* Live Speech Subtitles & Animated Audio Wave HUD Overlay */}
      <LiveSpeechSubtitlesOverlay
        currentAgent={(activeSpeakingAgentId ? agents.find((a) => a.id === activeSpeakingAgentId) : null) || currentAgent}
        state={state}
        captionWords={captionWords}
        captionProgress={captionProgress}
        speakingLevel={speakingLevel}
        onStopSpeaking={handleStopSpeaking}
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
      />

      {/* Settings Dialog Modal Drawer */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        savedKey={geminiKey}
        onSave={handleSaveGeminiKey}
        micSensitivity={micSensitivity}
        onMicSensitivityChange={handleSaveMicSensitivity}
        userRole={userRole}
        onSelectRole={handleSelectUserRole}
        onOpenRoleManager={() => setRoleManagerOpen(true)}
      />

      {/* RBAC Role & Access Tier Manager Dialog Modal */}
      <RoleManagerModal
        isOpen={roleManagerOpen}
        onClose={() => setRoleManagerOpen(false)}
        currentRole={userRole}
        onSelectRole={handleSelectUserRole}
        agents={agents}
        agentChats={agentChats}
        userProfile={userProfile}
        onOpenFullRewardProgram={() => setRewardProgramOpen(true)}
      />

      {/* M.A.Z.E. 40 CHALLENGES & TOKEN REWARD PROGRAM MODAL */}
      <MazeRewardModal
        isOpen={rewardProgramOpen}
        onClose={() => setRewardProgramOpen(false)}
        userRole={userRole}
        onSelectRole={handleSelectUserRole}
        agentChats={agentChats}
        agents={agents}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateUserProfile}
        onOpenRoleManager={() => setRoleManagerOpen(true)}
      />

      {/* JARVIS Terminal Overall Matrix GUI & Recent Chats & Reward Hub */}
      <JarvisTerminalDashboard
        isOpen={jarvisTerminalOpen}
        onClose={() => setJarvisTerminalOpen(false)}
        agents={agents}
        currentAgent={currentAgent}
        onSelectAgent={(ag) => handleSwitchAgent(ag)}
        agentChats={agentChats}
        onSendMessageToAgent={handleSendMessageToAgent}
        userRole={userRole}
        onSelectRole={handleSelectUserRole}
        onOpenRoleManager={() => {
          setJarvisTerminalOpen(false);
          setRoleManagerOpen(true);
        }}
        onOpenConstellation={() => {
          setJarvisTerminalOpen(false);
          setShowConstellation(true);
        }}
        onOpenAgentInspector={handleOpenAgentInspector}
      />

      {/* CENTRAL ADMIN LEADS & ACCESS CONTROL DATABASE MODAL */}
      <AdminDatabaseModal
        isOpen={adminDatabaseOpen}
        onClose={() => setAdminDatabaseOpen(false)}
        onOpenConversionAnalytics={() => {
          setAdminDatabaseOpen(false);
          setConversionAnalyticsOpen(true);
        }}
        onOpenFullOsirisTool={() => {
          setAdminDatabaseOpen(false);
          setOsirisIntelToolOpen(true);
        }}
        currentUserEmail={SUPERADMIN_EMAIL}
        lang={lang}
      />

      {/* FULL OSIRIS AI GLOBAL INTELLIGENCE & FLIGHT PLATFORM TOOL MODAL */}
      <OsirisIntelToolModal
        isOpen={osirisIntelToolOpen}
        onClose={() => setOsirisIntelToolOpen(false)}
        onTransmitIntel={(intelSummary) => {
          setOsirisIntelToolOpen(false);
          const globeAgent = agents.find((a) => a.id === "globe") || currentAgent;
          setCurrentAgent(globeAgent);
          setInput(intelSummary);
          addSystemLog(`OSIRIS Telemetrie an G.L.O.B.E. übergeben: ${intelSummary.slice(0, 70)}...`);
        }}
        lang={lang}
        initialTab={osirisInitialTab}
      />

      {/* Active Hologram Projector Stage Display */}
      {activeHologram && (
        <HologramProjector
          imageUrl={activeHologram.url}
          prompt={activeHologram.prompt}
          timestamp={activeHologram.timestamp}
          onClose={() => setActiveHologram(null)}
          onEditPrompt={(newPrompt) => {
            setIsImageMode(true);
            setSelectedImage(activeHologram.url);
            handleSendMessage(newPrompt);
          }}
          onAnimateToVeoVideo={(url) => {
            setActiveHologram(null);
            handleOpenVeoStudio(url);
          }}
          onOpenGallery={() => setIsGalleryOpen(true)}
          isLoading={isLoading}
          currentAgentColor={currentAgent.color}
        />
      )}

      {/* 7-Agent Interconnected Pitch-Black Constellation View */}
      {showConstellation && (
        <AgentConstellationScreen
          agents={agents}
          currentAgentId={currentAgent.id}
          onSelectAgentAndStart={(agentId) => {
            const targetAgent = agents.find((a) => a.id === agentId);
            if (targetAgent) {
              setCurrentAgent(targetAgent);
            }
            setShowConstellation(false);
          }}
          onCloseConstellation={() => setShowConstellation(false)}
          onOpenMultiAgentChat={() => setShowMultiAgentChat(true)}
          onOpenLandingPage={() => {
            setShowConstellation(false);
            setShowLandingPage(true);
          }}
          userRole={userRole}
          onSelectRole={handleSelectUserRole}
          onOpenRoleManager={() => setRoleManagerOpen(true)}
          onOpenTutorial={() => {
            setShowConstellation(false);
            setShowLandingPage(false);
            setDashboardViewMode("focus");
            setIsFocusMode(false);
            setIsEditMode(false);
            setShowTutorialModal(true);
          }}
          onOpenAgentInspector={handleOpenAgentInspector}
          onOpenMobileVoice={() => setShowMobileVoice(true)}
        />
      )}

      {/* HANDY SPRACH-INTERFACE (PWA & 3D PARTICLE BALL) */}
      <MobileVoiceInterface
        isOpen={showMobileVoice}
        onClose={() => setShowMobileVoice(false)}
        agents={agents}
        currentAgent={currentAgent}
        onSelectAgent={(ag) => handleSwitchAgent(ag)}
        onSendMessage={async (msg) => {
          return await handleSendMessageToAgent(currentAgent.id, msg, undefined, "SINGLE", false);
        }}
        userRole={userRole}
        lang={lang}
      />

      {/* PWA Offline indicator */}
      <OfflineIndicator />

      {/* Full-Screen Multi-Agent Chatroom (Single Agent focus with 3D Particle Stage) */}
      {showMultiAgentChat && (
        <MultiAgentChatScreen
          agents={agents}
          currentAgent={currentAgent}
          onSelectAgent={(ag) => handleSwitchAgent(ag)}
          agentChats={agentChats}
          onSendMessageToAgent={handleSendMessageToAgent}
          onClearAllChats={handleClearAllChats}
          onClose={() => setShowMultiAgentChat(false)}
          geminiKey={geminiKey}
          onSaveGeminiKey={setGeminiKey}
          onOpenSettings={() => setSettingsOpen(true)}
          userRole={userRole}
          onOpenRoleManager={() => setRoleManagerOpen(true)}
          onOpenAgentInspector={handleOpenAgentInspector}
          onSpeak={speak}
          lang={lang}
        />
      )}

      {/* Photo & Hologram Gallery Modal */}
      <HologramGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        gallery={hologramsGallery}
        onSelectHologram={(item) => {
          setActiveHologram({
            url: item.url,
            prompt: item.prompt,
            timestamp: item.timestamp,
          });
        }}
        onUseAsReference={(url) => {
          setIsImageMode(true);
          setSelectedImage(url);
        }}
        onDeleteHologram={handleDeleteHologram}
        onClearGallery={handleClearGallery}
        currentAgentColor={currentAgent.color}
      />

      {/* Autostart Standalone Screen Share Modal */}
      {showAutostartModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-slate-950 border-2 border-cyan-400 rounded-3xl p-6 text-slate-100 text-center space-y-6 shadow-[0_0_80px_rgba(0,240,255,0.4)]">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
              <Monitor className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-wide uppercase font-mono">
                MONITOR FREIGABE BEREIT
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Klicke auf den Button, um <strong>Monitor 1, Monitor 2 oder ein Fenster</strong> direkt für N.E.O. & S.Y.N.T.A.X. freizugeben.
              </p>
            </div>
            <button
              onClick={handleGrantScreenPermission}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider shadow-[0_0_30px_rgba(0,240,255,0.5)] transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3 font-mono"
            >
              <Monitor className="w-5 h-5 stroke-[2.5]" />
              <span>MONITOR 1 & 2 JETZT TEILEN</span>
            </button>
          </div>
        </div>
      )}

      {/* Veo 3.1 AI Video Generation Studio Modal */}
      <VeoVideoStudio
        isOpen={veoStudioOpen}
        onClose={() => setVeoStudioOpen(false)}
        initialImageUrl={veoStudioInitialImage || undefined}
        agentName={currentAgent.name}
        geminiKey={geminiKey}
        lang={lang}
        onSendToChat={(videoUrl, prompt) => {
          handleSendMessageToAgent(
            currentAgent.id,
            `🎬 [VEO 3.1 AI VIDEO GENERIERT]\n\nAnweisung: "${prompt}"\n\nSchau dir das fertige Video an, Mr!`,
            videoUrl,
            "SINGLE",
            false
          );
          setVeoStudioOpen(false);
        }}
      />

      {/* Screen Access Permission Request Modal */}
      <ScreenPerceptionModal
        isOpen={screenPermissionOpen}
        action={screenPendingAction}
        onGrantPermission={handleGrantScreenPermission}
        onCancel={() => {
          setScreenPermissionOpen(false);
          setScreenPendingAction(null);
        }}
        agentName={currentAgent.name}
        lang={lang}
      />

      {/* 8-Agents High API Load Warning Pop-Up Modal */}
      <EightAgentsWarningModal
        isOpen={show8AgentsWarningModal}
        onClose={() => setShow8AgentsWarningModal(false)}
        onConfirm={handleConfirm8AgentsWarning}
        currentScope={communicationScope}
      />

      {/* The Big 3 (MAZE • NEO • VEGA) Tri-Core Hologram Animation & Activation Modal */}
      <TheBig3ActivationModal
        isOpen={showTheBig3Modal}
        onClose={() => setShowTheBig3Modal(false)}
        onConfirm={handleConfirmTheBig3}
        currentScope={communicationScope}
        onSelectSingleAgent={(agentId) => {
          handleSwitchAgent(agentId);
          setCommunicationScope("SINGLE");
        }}
      />

      {/* S.Y.N.T.A.X. 1-Minute System Briefing / Tutorial Modal for the Boss */}
      <OneMinuteTutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        lang={lang}
        onToggleLang={handleToggleLang}
        onStartScreenPerception={() => {
          handleGrantScreenPermission();
        }}
        onSendMessage={(msg) => {
          handleSendMessageToAgent(currentAgent.id, msg, undefined, communicationScope, true);
        }}
        onSelectAgent={(agentId) => {
          handleSwitchAgent(agentId);
        }}
        onSetCommunicationScope={(scope) => {
          handleSelectCommunicationScope(scope);
        }}
        onOpenGmail={() => {
          setActiveWidgets((prev) => ({ ...prev, gmailInbox: true }));
          setIsFocusMode(false);
        }}
        onOpenLayoutEditor={() => {
          setIsEditMode(true);
          setIsFocusMode(false);
        }}
        onOpenAppStore={() => {
          setActiveWidgets((prev) => ({ ...prev, appStore: true }));
          setIsFocusMode(false);
        }}
        onOpenClaudeCode={() => {
          setActiveWidgets((prev) => ({ ...prev, claudeCode: true }));
          setIsFocusMode(false);
        }}
        onOpenVeoStudio={() => {
          handleOpenVeoStudio();
          setIsFocusMode(false);
        }}
        onOpenGoogleMaps={() => {
          setActiveWidgets((prev) => ({ ...prev, googleMaps: true }));
          setIsFocusMode(false);
        }}
        onToggleChat={() => {
          setShowChat((prev) => !prev);
          setIsFocusMode(false);
        }}
        onOpenChat={() => {
          setShowChat(true);
          setIsFocusMode(false);
        }}
        onOpenCalendar={() => {
          setActiveWidgets((prev) => ({ ...prev, calendarWidget: true }));
          setIsFocusMode(false);
        }}
        onOpenNanoBanana={() => {
          setIsImageMode(true);
          setIsGalleryOpen(true);
          setIsFocusMode(false);
        }}
      />

      {/* S.Y.N.T.A.X. SPATIAL GENESIS FULLSCREEN ANIMATION */}
      <SyntaxSpatialGenesisAnimation
        isOpen={showGenesisModal}
        onComplete={() => {
          setShowGenesisModal(false);
          setShowTutorialModal(true);
        }}
        onSkip={() => {
          setShowGenesisModal(false);
        }}
      />

      {/* Admin Database Modal (Accessible via hotkey, navbar or master key) */}
      <AdminDatabaseModal
        isOpen={adminDatabaseOpen}
        onClose={() => setAdminDatabaseOpen(false)}
        initialTab={adminDatabaseInitialTab}
        onOpenConversionAnalytics={() => {
          setAdminDatabaseOpen(false);
          setConversionAnalyticsOpen(true);
        }}
        onOpenFullOsirisTool={() => {
          setAdminDatabaseOpen(false);
          setOsirisIntelToolOpen(true);
        }}
        onLaunchDashboard={() => {
          setAdminDatabaseOpen(false);
          setShowLandingPage(false);
        }}
        currentUserEmail={getCurrentUserEmail() || SUPERADMIN_EMAIL}
        lang={lang}
      />

      {/* Sovereign Conversion, Live User & Traffic Analytics Radar Tool */}
      <AdminConversionAnalyticsModal
        isOpen={conversionAnalyticsOpen}
        onClose={() => setConversionAnalyticsOpen(false)}
        onOpenAdminDatabase={() => {
          setConversionAnalyticsOpen(false);
          setAdminDatabaseInitialTab("ACCESS_KEYS");
          setAdminDatabaseOpen(true);
        }}
        currentUserEmail={getCurrentUserEmail() || SUPERADMIN_EMAIL}
        lang={lang}
      />

      {/* Sovereign User Account & Billing Terminal Modal */}
      <UserAccountTerminalModal
        isOpen={userTerminalModalOpen}
        onClose={() => setUserTerminalModalOpen(false)}
        onLaunchDashboard={() => {
          setUserTerminalModalOpen(false);
          setShowLandingPage(false);
        }}
        onOpenDailyUsage={() => setIsDailyUsageOpen(true)}
        userEmail={getCurrentUserEmail() || SUPERADMIN_EMAIL}
        lang={lang}
        initialTab={userTerminalInitialTab}
      />

      {/* REAL-TIME SESSION KICK / BLOCKED ACCOUNT ALERT MODAL */}
      {kickedSessionModal && kickedSessionModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-[#08020a] border-2 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(244,63,94,0.5)] text-center font-mono space-y-6 animate-scaleUp text-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse">
              <Ban className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>ZUGRIFF GESPERRT // ACCOUNT REVOKED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                SITZUNG SOFORT BEENDET
              </h2>
              <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                {kickedSessionModal.reason}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/90 border border-rose-500/30 text-left text-xs text-slate-300 space-y-2 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Betroffene E-Mail:</span>
                <span className="text-rose-300 font-bold">{kickedSessionModal.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Aktion:</span>
                <span className="text-rose-400 font-bold">SOFORTIGER MONITOR-KICK</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Administrator:</span>
                <span className="text-cyan-300 font-bold">{SUPERADMIN_EMAIL}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setKickedSessionModal(null);
                  setUserTerminalInitialTab("payment");
                  setUserTerminalModalOpen(true);
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>⚡ SYSTEM WIEDERBELEBEN (ZAHLUNGSART)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setKickedSessionModal(null);
                  setShowLandingPage(true);
                }}
                className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ZUR STARTSEITE</span>
              </button>

              {(isSuperAdminEmail(getCurrentUserEmail()) || isStoredAdminAuthenticated()) && (
                <button
                  type="button"
                  onClick={() => {
                    setKickedSessionModal(null);
                    setAdminDatabaseOpen(true);
                  }}
                  className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>KEY LOGIN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PENDING APPROVAL NOTICE MODAL */}
      {pendingApprovalNoticeModal && pendingApprovalNoticeModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-[#040818] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.4)] text-center font-mono space-y-6 animate-scaleUp text-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-pulse">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>FREISCHALTUNG AUSSTEHEND</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                WARTET AUF ADMIN-PRÜFUNG
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Dein Account wurde registriert. Dein 1-Tages-Testzugang muss vor der Nutzung von Administrator <strong className="text-cyan-300">{SUPERADMIN_EMAIL}</strong> bestätigt werden.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPendingApprovalNoticeModal(null);
                  setShowLandingPage(true);
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95"
              >
                <span>ZUR STARTSEITE</span>
              </button>

              {(isSuperAdminEmail(getCurrentUserEmail()) || isStoredAdminAuthenticated()) && (
                <button
                  type="button"
                  onClick={() => {
                    setPendingApprovalNoticeModal(null);
                    setAdminDatabaseOpen(true);
                  }}
                  className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>KEY LOGIN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3-Step Quickstart Welcome Tour for Key Users */}
      <KeyUserWelcomeTourModal
        isOpen={keyWelcomeTourOpen}
        onClose={() => setKeyWelcomeTourOpen(false)}
        activeKey={getActiveAccessKey()}
        onLaunchVeo={(prompt) => {
          setInput(prompt || "");
          handleOpenVeoStudio();
        }}
        onLaunch3DMatrix={() => {
          setShowConstellation(true);
        }}
        onLaunchSyntaxPrompt={(prompt) => {
          setInput(prompt);
          handleSendMessage(prompt);
        }}
        onOpenTutorial={() => setShowTutorialModal(true)}
        onOpenGmail={() => handleToggleWidget("gmailInbox")}
      />

      {/* AGENT-SYNC SYNTHESIS REPORT MODAL */}
      <AgentSyncSynthesisModal
        isOpen={isAgentSyncModalOpen}
        onClose={() => setIsAgentSyncModalOpen(false)}
        synthesis={activeAgentSyncSynthesis}
        onStartVoiceConference={(topic) => {
          setIsAgentSyncModalOpen(false);
          handleOpenVoiceConference(topic);
        }}
      />

      {/* 8-CORE LIVE-SPRACHKONFERENZ (MULTI-AGENT 3D VOICE ROOM) */}
      <MultiAgentVoiceConferenceModal
        isOpen={isVoiceConferenceModalOpen}
        onClose={() => setIsVoiceConferenceModalOpen(false)}
        initialTopic={voiceConferenceTopic}
        onBossSubmitIntervention={(text) => {
          addSystemLog(`Boss-Intervention eingespielt: "${text}"`, "warn");
        }}
      />

      {/* AVERAGE DAILY USAGE TELEMETRY DASHBOARD */}
      <DailyUsageDashboardModal
        isOpen={isDailyUsageOpen}
        onClose={() => setIsDailyUsageOpen(false)}
        userRole={userProfile.purchasedRole}
        lang={lang}
      />

      {/* 8-CORE AGENT QUERIES & REQ LOGS INSPECTOR MODAL */}
      <AgentQueryInspectorModal
        isOpen={agentInspectorOpen}
        onClose={() => setAgentInspectorOpen(false)}
        agents={agents}
        currentAgent={currentAgent}
        initialAgentId={agentInspectorInitialAgentId}
        agentChats={agentChats}
        onSelectAgent={(ag) => handleSwitchAgent(ag)}
        onSendMessageToAgent={async (agentId, text, imageUrl, scope, shouldBeSilent) => {
          await handleSendMessageToAgent(agentId, text, imageUrl, scope || "SINGLE", shouldBeSilent || false);
        }}
        lang={lang}
        userRole={userRole}
      />

      {/* LOVABLE-STYLE 9-CORE AGENT FLEET STUDIO MODAL */}
      {agentFleetStudioOpen && (
        <AgentFleetStudio
          agents={agents}
          currentAgent={currentAgent}
          currentAgentId={currentAgent.id}
          onSelectAgentAndSwitchToOS={(agentId) => {
            const target = agents.find((a) => a.id === agentId);
            if (target) handleSwitchAgent(target);
            setAgentFleetStudioOpen(false);
          }}
          onSelectAgentAndStart={(agentId) => {
            const target = agents.find((a) => a.id === agentId);
            if (target) handleSwitchAgent(target);
            setAgentFleetStudioOpen(false);
            setShowChat(true);
          }}
          onClose={() => setAgentFleetStudioOpen(false)}
          onCloseStudio={() => setAgentFleetStudioOpen(false)}
          onOpenOsirisIntel={handleOpenOsirisIntel}
          userRole={userRole}
          lang={lang}
        />
      )}

      {/* 8-CORE MATRIX ACCESS HIGH-CONVERTING PRICING MODAL FOR DASHBOARD */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-5xl my-auto">
            <button
              onClick={() => setIsPricingModalOpen(false)}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20 w-9 h-9 rounded-full bg-slate-900 border-2 border-purple-500/80 text-white flex items-center justify-center font-mono text-sm hover:bg-rose-950 hover:border-rose-500 transition cursor-pointer shadow-xl"
              title={lang === "de" ? "Schließen" : "Close"}
            >
              ✕
            </button>
            <MatrixPricingCard
              lang={lang}
              mode="dashboard"
              onCheckout={() => {
                setIsPricingModalOpen(false);
                handleOpenUserTerminal("subscription");
              }}
            />
          </div>
        </div>
      )}

      {/* APPS & TOOLS MODULAR ORCHESTRATOR & AGENT LINKING MODAL */}
      {appToolManagerOpen && (
        <AppAndToolManagerModal
          isOpen={appToolManagerOpen}
          onClose={() => setAppToolManagerOpen(false)}
          agents={agents}
          currentAgent={currentAgent}
          activeWidgets={activeWidgets}
          onToggleWidget={handleToggleWidget}
          initialAgentId={selectedAgentForToolManager || currentAgent?.id || "neo"}
          isAdmin={isAdminUser}
          onOpenApp={(appId) => {
            setAppToolManagerOpen(false);
            handleOpenAppDirectly(appId);
          }}
          lang={lang}
        />
      )}

      {/* OBSIDIAN BRAIN & KNOWLEDGE GRAPH WORKSPACE */}
      {obsidianBrainOpen && (
        <div className="fixed inset-0 z-[100] bg-[#111113] flex flex-col animate-fade-in">
          {/* Header Bar with quick exit back to dashboard */}
          <div className="h-8 bg-[#18181a] border-b border-[#242428] px-3 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] text-purple-400 font-semibold flex items-center gap-1.5">
              <span>🧠</span> OBSIDIAN BRAIN WORKSPACE
            </span>
            <button
              onClick={() => setObsidianBrainOpen(false)}
              className="px-2.5 py-0.5 rounded bg-[#27272a] hover:bg-[#323238] text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>Zurück zum Dashboard</span>
              <span className="font-mono text-xs">✕</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ObsidianBrainWorkspace
              onOpenGmail={() => {
                setObsidianBrainOpen(false);
                handleToggleWidget("gmailInbox");
              }}
              onOpenSocialStudio={() => {
                setObsidianBrainOpen(false);
                handleOpenSocialUpload("tiktok");
              }}
              onOpenCalendar={() => {
                setObsidianBrainOpen(false);
                handleToggleWidget("calendarWidget");
              }}
              onClose={() => setObsidianBrainOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

