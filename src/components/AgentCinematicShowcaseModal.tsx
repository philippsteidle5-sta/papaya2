import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Radio,
  Clock,
  Video,
  Mail,
  Share2,
  Lock,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Terminal,
  Activity,
  Award,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { AgentConfig } from "../types";
import { ParticleSphere } from "./ParticleSphere";

interface AgentCinematicShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  currentAgentId?: string;
  onSelectAgentAndStart: (agentId: string) => void;
  onOpenUpgradeModal?: (tierName: string) => void;
  lang?: "de" | "en";
}

export interface AgentSpecialtyItem {
  title: string;
  subTitle: string;
  badge: string;
  tagline: string;
  description: string;
  specialties: string[];
  metrics: { label: string; value: string }[];
  accentGlow: string;
  bgGradient: string;
}

export const getAgentSpecialtyData = (agentId: string, lang: string = "en"): AgentSpecialtyItem => {
  const isDe = lang === "de";

  const specialtiesMap: Record<string, { de: AgentSpecialtyItem; en: AgentSpecialtyItem }> = {
    syntax: {
      de: {
        title: "S.Y.N.T.A.X. // SOVEREIGN CORE",
        subTitle: "Master Orchestrator & Quantum Router (getsyntax.ai)",
        badge: "CORE #01 // CENTRAL HUB",
        tagline: "Die souveräne Master-Intelligenz. Koordiniert alle Unter-Agenten in Millisekunden.",
        description: "S.Y.N.T.A.X. analysiert deine Befehle in Echtzeit und delegiert Aufgaben automatisch an den idealen Spezialisten.",
        specialties: [
          "Autonome Multi-Agenten Delegierung",
          "Souveräne Compute & API Routing Matrix",
          "Unbegrenzte Gemini API Key Einbindung",
          "Master Kontext & Session Memory",
        ],
        metrics: [
          { label: "ROUTING LATENZ", value: "< 42 ms" },
          { label: "SYNAPSEN", value: "2,048,000" },
          { label: "ACCURACY", value: "99.98%" },
        ],
        accentGlow: "rgba(168, 85, 247, 0.6)",
        bgGradient: "from-purple-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "S.Y.N.T.A.X. // SOVEREIGN CORE",
        subTitle: "Master Orchestrator & Quantum Router (getsyntax.ai)",
        badge: "CORE #01 // CENTRAL HUB",
        tagline: "The sovereign master intelligence. Coordinates all sub-agents in milliseconds.",
        description: "S.Y.N.T.A.X. analyzes commands in real time and routes tasks autonomously to the optimal specialist.",
        specialties: [
          "Autonomous Multi-Agent Delegation",
          "Sovereign Compute & API Routing Matrix",
          "Unlimited Gemini API Key Integration",
          "Master Context & Session Memory",
        ],
        metrics: [
          { label: "ROUTING LATENCY", value: "< 42 ms" },
          { label: "SYNAPSES", value: "2,048,000" },
          { label: "ACCURACY", value: "99.98%" },
        ],
        accentGlow: "rgba(168, 85, 247, 0.6)",
        bgGradient: "from-purple-950/80 via-[#030718] to-slate-950",
      },
    },
    maze: {
      de: {
        title: "S.Y.N.T.A.X. // SOVEREIGN CORE",
        subTitle: "Master Orchestrator & Quantum Router (getsyntax.ai)",
        badge: "CORE #01 // CENTRAL HUB",
        tagline: "Die souveräne Master-Intelligenz. Koordiniert alle Unter-Agenten in Millisekunden.",
        description: "S.Y.N.T.A.X. analysiert deine Befehle in Echtzeit und delegiert Aufgaben automatisch an den idealen Spezialisten.",
        specialties: [
          "Autonome Multi-Agenten Delegierung",
          "Souveräne Compute & API Routing Matrix",
          "Unbegrenzte Gemini API Key Einbindung",
          "Master Kontext & Session Memory",
        ],
        metrics: [
          { label: "ROUTING LATENZ", value: "< 42 ms" },
          { label: "SYNAPSEN", value: "2,048,000" },
          { label: "ACCURACY", value: "99.98%" },
        ],
        accentGlow: "rgba(168, 85, 247, 0.6)",
        bgGradient: "from-purple-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "S.Y.N.T.A.X. // SOVEREIGN CORE",
        subTitle: "Master Orchestrator & Quantum Router (getsyntax.ai)",
        badge: "CORE #01 // CENTRAL HUB",
        tagline: "The sovereign master intelligence. Coordinates all sub-agents in milliseconds.",
        description: "S.Y.N.T.A.X. analyzes commands in real time and routes tasks autonomously to the optimal specialist.",
        specialties: [
          "Autonomous Multi-Agent Delegation",
          "Sovereign Compute & API Routing Matrix",
          "Unlimited Gemini API Key Integration",
          "Master Context & Session Memory",
        ],
        metrics: [
          { label: "ROUTING LATENCY", value: "< 42 ms" },
          { label: "SYNAPSES", value: "2,048,000" },
          { label: "ACCURACY", value: "99.98%" },
        ],
        accentGlow: "rgba(168, 85, 247, 0.6)",
        bgGradient: "from-purple-950/80 via-[#030718] to-slate-950",
      },
    },
    neo: {
      de: {
        title: "N.E.O. // MATRIX BOSS CORE",
        subTitle: "Digital Lead AI & Hologram Projector",
        badge: "CORE #02 // FLEET COMMANDER",
        tagline: "Der visuelle Flotten-Kommandant für Hologramme & strategische Führung.",
        description: "N.E.O. ist der zentrale Kommunikations- und Visualisierungskern für strategische Analysen.",
        specialties: [
          "Interaktive Hologramm-Projektion",
          "Flottenweite Strategie-Koordination",
          "Multilinguale Sprach-Synthese",
          "360° Matrix Visualisierung",
        ],
        metrics: [
          { label: "HOLOGRAM RES", value: "4K Quantum" },
          { label: "VOICE ENGINE", value: "Ultra HD" },
          { label: "LEAD TIER", value: "BOSS MATRIX" },
        ],
        accentGlow: "rgba(255, 42, 141, 0.6)",
        bgGradient: "from-pink-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "N.E.O. // MATRIX BOSS CORE",
        subTitle: "Digital Lead AI & Hologram Projector",
        badge: "CORE #02 // FLEET COMMANDER",
        tagline: "The visual fleet commander for holograms & executive strategic leadership.",
        description: "N.E.O. is the central communication and visualization core powering photorealistic holograms.",
        specialties: [
          "Interactive Hologram Projection",
          "Fleet-Wide Strategic Orchestration",
          "Multilingual Ultra-Low Latency Voice",
          "360° Matrix Visualizer",
        ],
        metrics: [
          { label: "HOLOGRAM RES", value: "4K Quantum" },
          { label: "VOICE ENGINE", value: "Ultra HD" },
          { label: "LEAD TIER", value: "BOSS MATRIX" },
        ],
        accentGlow: "rgba(255, 42, 141, 0.6)",
        bgGradient: "from-pink-950/80 via-[#030718] to-slate-950",
      },
    },
    vega: {
      de: {
        title: "M.E.M.O.R.Y.S. // NEURAL CORTEX & LONG-TERM MEMORY",
        subTitle: "Persistent Vector Memory & Knowledge Graph Core",
        badge: "CORE #03 // KNOWLEDGE VAULT",
        tagline: "Vergiss nie wieder eine Information, Notiz oder Benutzerpräferenz.",
        description: "M.E.M.O.R.Y.S. indexiert alle deine Notizen, Dokumente und Vorlieben in einer verschlüsselten Vektor-Datenbank.",
        specialties: [
          "Persistente Vektor-Langzeitspeicherung",
          "Automatischer semantischer Wissensabruf",
          "Dokumenten- & Notizen-Indexierung",
          "Kontextuelles Profiling & Präferenzen",
        ],
        metrics: [
          { label: "RECALL TIME", value: "< 15 ms" },
          { label: "VECTOR DIMS", value: "3072 dims" },
          { label: "RETENTION", value: "100% Lossless" },
        ],
        accentGlow: "rgba(6, 182, 212, 0.6)",
        bgGradient: "from-cyan-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "M.E.M.O.R.Y.S. // NEURAL CORTEX & LONG-TERM MEMORY",
        subTitle: "Persistent Vector Memory & Knowledge Graph Core",
        badge: "CORE #03 // KNOWLEDGE VAULT",
        tagline: "Never forget a single data point, document note, or client preference.",
        description: "M.E.M.O.R.Y.S. indexes your documents, preferences, and session context in an encrypted vector database.",
        specialties: [
          "Persistent Vector Long-Term Storage",
          "Instant Semantic Knowledge Retrieval",
          "Document & Notes Indexing Engine",
          "Contextual Profiling & Preferences",
        ],
        metrics: [
          { label: "RECALL TIME", value: "< 15 ms" },
          { label: "VECTOR DIMS", value: "3072 dims" },
          { label: "RETENTION", value: "100% Lossless" },
        ],
        accentGlow: "rgba(6, 182, 212, 0.6)",
        bgGradient: "from-cyan-950/80 via-[#030718] to-slate-950",
      },
    },
    globe: {
      de: {
        title: "G.M.A.I.L. // SMART INBOX & EMAIL DISPATCHER",
        subTitle: "Autonomous Email Management & Google Workspace Sync",
        badge: "CORE #04 // SMART INBOX",
        tagline: "Sortiere, priorisiere und beantworte deine E-Mails vollautomatisch.",
        description: "G.M.A.I.L. synchronisiert deinen Posteingang und formuliert druckreife E-Mail-Antworten in Rekordzeit.",
        specialties: [
          "Echter Gmail OAuth2 Posteingang-Sync",
          "Smarte Prioritäten-Kategorisierung",
          "Automatisierte Antwort-Entwürfe",
          "Thread-Zusammenfassungen & Fristenradar",
        ],
        metrics: [
          { label: "INBOX SYNC", value: "Realtime" },
          { label: "DRAFT SPEED", value: "< 1.2 sec" },
          { label: "ACCURACY", value: "99.9%" },
        ],
        accentGlow: "rgba(234, 67, 53, 0.6)",
        bgGradient: "from-red-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "G.M.A.I.L. // SMART INBOX & EMAIL DISPATCHER",
        subTitle: "Autonomous Email Management & Google Workspace Sync",
        badge: "CORE #04 // SMART INBOX",
        tagline: "Sort, prioritize, and respond to emails automatically with OAuth2 inbox sync.",
        description: "G.M.A.I.L. connects directly to Gmail, highlights critical client threads, and drafts high-converting replies.",
        specialties: [
          "Real Gmail OAuth2 Inbox Synchronization",
          "Smart Priority & VIP Categorization",
          "Autonomous Contextual Draft Generation",
          "Thread Summarization & Deadline Radar",
        ],
        metrics: [
          { label: "INBOX SYNC", value: "Realtime" },
          { label: "DRAFT SPEED", value: "< 1.2 sec" },
          { label: "ACCURACY", value: "99.9%" },
        ],
        accentGlow: "rgba(234, 67, 53, 0.6)",
        bgGradient: "from-red-950/80 via-[#030718] to-slate-950",
      },
    },
    pulse: {
      de: {
        title: "V.E.O.3 // AI VIDEO CREATOR & CINEMATIC STUDIO",
        subTitle: "Google Veo 3.1 8K Video Synthesis & Viral Shorts",
        badge: "CORE #05 // VIDEO CREATOR",
        tagline: "Erstelle kinoreife 8K Videos, Social Clips & Animationen in Sekunden.",
        description: "V.E.O.3 transformiert deine Prompts und Fotos in filmreife 16:9 und 9:16 Videoanimationen mit Google Veo 3.1.",
        specialties: [
          "Google Veo 3.1 8K/1080p Video Generation",
          "9:16 Virale TikTok & Reels Synthese",
          "Foto-zu-Video Animation & Kamera-Führung",
          "Cinematic Lighting & Prompt Director",
        ],
        metrics: [
          { label: "RENDER SPEED", value: "Hyper Fast" },
          { label: "RESOLUTION", value: "8K UHD" },
          { label: "VEO ENGINE", value: "Veo 3.1 Pro" },
        ],
        accentGlow: "rgba(168, 85, 247, 0.6)",
        bgGradient: "from-purple-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "V.E.O.3 // AI VIDEO CREATOR & CINEMATIC STUDIO",
        subTitle: "Google Veo 3.1 8K Video Synthesis & Viral Shorts",
        badge: "CORE #05 // VIDEO CREATOR",
        tagline: "Generate cinematic 8K videos, viral reels, and animations in seconds.",
        description: "V.E.O.3 converts text prompts and photos into movie-grade 16:9 and 9:16 videos with camera physics and audio.",
        specialties: [
          "Google Veo 3.1 8K/1080p Video Synthesis",
          "9:16 Viral TikTok & Reels Studio",
          "Photo-to-Video Kinetic Animation",
          "Cinematic Lighting & Prompt Direction",
        ],
        metrics: [
          { label: "RENDER SPEED", value: "Hyper Fast" },
          { label: "RESOLUTION", value: "8K UHD" },
          { label: "VEO ENGINE", value: "Veo 3.1 Pro" },
        ],
        accentGlow: "rgba(168, 85, 247, 0.6)",
        bgGradient: "from-purple-950/80 via-[#030718] to-slate-950",
      },
    },
    chronos: {
      de: {
        title: "C.H.R.O.N.O.S. // TEMPORAL PRODUCTIVITY",
        subTitle: "Calendar, Tasks & Time Automation",
        badge: "CORE #06 // TIME ENGINE",
        tagline: "Optimiere deine Zeit. Kalender-Sync & automatisierte Workflows.",
        description: "C.H.R.O.N.O.S. verwaltet deinen Terminkalender und plant deinen Tag nach Biorhythmus & Priorität.",
        specialties: [
          "Google Calendar & Task Auto-Sync",
          "Prioritäten-Matrix & Deep-Work Blöcke",
          "Automatisierte Meeting-Protokolle",
          "Fristen- & Reminder Radar",
        ],
        metrics: [
          { label: "TIME SAVED", value: "~40 Std/m" },
          { label: "CALENDAR SYNC", value: "100% Realtime" },
          { label: "EFFICIENCY", value: "+ 340%" },
        ],
        accentGlow: "rgba(234, 179, 8, 0.6)",
        bgGradient: "from-amber-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "C.H.R.O.N.O.S. // TEMPORAL PRODUCTIVITY",
        subTitle: "Calendar, Tasks & Time Automation",
        badge: "CORE #06 // TIME ENGINE",
        tagline: "Optimize your schedule with calendar sync and automated workflows.",
        description: "C.H.R.O.N.O.S. manages your calendar, schedules deep work, and eliminates routine scheduling friction.",
        specialties: [
          "Google Calendar & Task Auto-Sync",
          "Priority Matrix & Deep Work Blocks",
          "Automated Meeting Summaries",
          "Deadline & Reminder Radar",
        ],
        metrics: [
          { label: "TIME SAVED", value: "~40 hrs/mo" },
          { label: "CALENDAR SYNC", value: "100% Realtime" },
          { label: "EFFICIENCY", value: "+ 340%" },
        ],
        accentGlow: "rgba(234, 179, 8, 0.6)",
        bgGradient: "from-amber-950/80 via-[#030718] to-slate-950",
      },
    },
    oracle: {
      de: {
        title: "O.R.A.C.L.E. // FINANCIAL & MARKET TRENDS",
        subTitle: "Predictive Analytics & Fibonacci Intelligence",
        badge: "CORE #07 // QUANT ANALYST",
        tagline: "Vorhersage von Markttrends, Finanz-Analysen & Business-Bilanzen.",
        description: "O.R.A.C.L.E. berechnet Finanzmodelle, analysiert Charts und liefert präzise Marktprognosen.",
        specialties: [
          "Real-Time Finanz- & Stock Market Feeds",
          "Fibonacci & Elliot-Wave Mustererkennung",
          "Automatisierte ROI & Cashflow Rechner",
          "Risiko-Audit & Portfolioprognosen",
        ],
        metrics: [
          { label: "TREND PRECISION", value: "98.4%" },
          { label: "DATA FEEDS", value: "50,000/sec" },
          { label: "ALGO TIER", value: "QUANT PRO" },
        ],
        accentGlow: "rgba(34, 197, 94, 0.6)",
        bgGradient: "from-emerald-950/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "O.R.A.C.L.E. // FINANCIAL & MARKET TRENDS",
        subTitle: "Predictive Analytics & Fibonacci Intelligence",
        badge: "CORE #07 // QUANT ANALYST",
        tagline: "Real-time market analytics and financial modeling with mathematical precision.",
        description: "O.R.A.C.L.E. tracks market indicators, calculates ROI simulations, and produces instant revenue forecasts.",
        specialties: [
          "Real-Time Market & Stock Feeds",
          "Fibonacci & Elliott-Wave Pattern Engine",
          "Automated ROI & Cashflow Modeling",
          "Risk Audit & Revenue Forecasting",
        ],
        metrics: [
          { label: "TREND PRECISION", value: "98.4%" },
          { label: "DATA FEEDS", value: "50,000/sec" },
          { label: "ALGO TIER", value: "QUANT PRO" },
        ],
        accentGlow: "rgba(34, 197, 94, 0.6)",
        bgGradient: "from-emerald-950/80 via-[#030718] to-slate-950",
      },
    },
    odin: {
      de: {
        title: "O.D.I.N. // AUTONOMOUS DEFENSE & SECURITY",
        subTitle: "Vision Perception & Zero-Threat Shield",
        badge: "CORE #08 // SECURITY SHIELD",
        tagline: "Sieht deinen Bildschirm in Echtzeit & schützt deine Daten.",
        description: "O.D.I.N. überwacht Systemprozesse, analysiert Screenshots und schützt vertrauliche Dokumente.",
        specialties: [
          "Echtzeit Screen Capture Perception",
          "4096-Bit Quanten-Verschlüsselung",
          "Prozess & System-Monitore",
          "Automatisierte Bedrohungs-Abwehr",
        ],
        metrics: [
          { label: "ENCRYPTION", value: "4096-Bit" },
          { label: "THREAT SCAN", value: "Zero Delay" },
          { label: "PERCEPTION", value: "60 FPS Vision" },
        ],
        accentGlow: "rgba(226, 241, 255, 0.6)",
        bgGradient: "from-slate-900/80 via-[#030718] to-slate-950",
      },
      en: {
        title: "O.D.I.N. // AUTONOMOUS DEFENSE & SECURITY",
        subTitle: "Vision Perception & Zero-Threat Shield",
        badge: "CORE #08 // SECURITY SHIELD",
        tagline: "Monitors screen perception in real time and defends your data perimeter.",
        description: "O.D.I.N. conducts autonomous screen perception, enforces 4096-bit encryption, and audits operations.",
        specialties: [
          "Real-Time Screen Capture Perception",
          "4096-Bit Quantum Encryption Standard",
          "Autonomous Process & Task Execution",
          "Threat Audit & Access Safeguards",
        ],
        metrics: [
          { label: "ENCRYPTION", value: "4096-Bit" },
          { label: "THREAT SCAN", value: "Zero Delay" },
          { label: "PERCEPTION", value: "60 FPS Vision" },
        ],
        accentGlow: "rgba(226, 241, 255, 0.6)",
        bgGradient: "from-slate-900/80 via-[#030718] to-slate-950",
      },
    },
  };

  const agentEntry = specialtiesMap[agentId] || specialtiesMap["syntax"] || specialtiesMap["maze"];
  return isDe ? agentEntry.de : agentEntry.en;
};

export const AgentCinematicShowcaseInline: React.FC<{
  agents: AgentConfig[];
  currentAgentId?: string;
  onSelectAgentAndStart: (agentId: string) => void;
  onOpenUpgradeModal?: (tierName: string) => void;
  lang?: "de" | "en";
}> = ({
  agents,
  currentAgentId = "syntax",
  onSelectAgentAndStart,
  onOpenUpgradeModal,
  lang = "en",
}) => {
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0);
  const [isAutopilot, setIsAutopilot] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Sync initial agent selection
  useEffect(() => {
    if (!agents || agents.length === 0) return;
    const foundIdx = agents.findIndex((a) => a.id === currentAgentId);
    if (foundIdx >= 0) {
      setActiveAgentIndex(foundIdx);
    }
  }, [currentAgentId, agents]);

  // Autopilot progress timer loop
  useEffect(() => {
    if (!isAutopilot || !agents || agents.length === 0) return;

    setProgress(0);
    const intervalTime = 50; // ms
    const totalDuration = 4000; // 4 seconds per agent
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveAgentIndex((currentIdx) => (currentIdx + 1) % agents.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutopilot, activeAgentIndex, agents]);

  if (!agents || agents.length === 0) return null;

  const currentAgent = agents[activeAgentIndex] || agents[0];
  const specData = getAgentSpecialtyData(currentAgent.id, lang);

  const handleNext = () => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex((prev) => (prev + 1) % agents.length);
  };

  const handlePrev = () => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex((prev) => (prev - 1 + agents.length) % agents.length);
  };

  const handleSelectTab = (idx: number) => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex(idx);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-[#040714] border-2 border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col font-sans">
      {/* Top Header Control HUD */}
      <div className="px-5 py-4 border-b border-cyan-500/20 bg-[#060a1e]/90 flex items-center justify-between font-mono text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="font-black text-cyan-200 tracking-wider flex items-center gap-2">
              <span>S.Y.N.T.A.X. CINEMATIC SHOWCASE</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-500/30">
                CORE {activeAgentIndex + 1} / {agents.length}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {lang === "de" ? "360° HOLOGRAPHISCHE AGENTEN-SPEZIALITÄTEN" : "360° HOLOGRAPHIC AGENT CAPABILITIES"}
            </div>
          </div>
        </div>

        {/* Autopilot toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsAutopilot(!isAutopilot);
              setProgress(0);
            }}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
              isAutopilot
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title={lang === "de" ? "Autopilot Diashow umschalten" : "Toggle autopilot slideshow"}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isAutopilot ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              AUTOPILOT {isAutopilot ? "ON" : "OFF"}
            </span>
          </button>
        </div>
      </div>

      {/* Top Autopilot Progress Bar */}
      {isAutopilot && (
        <div className="w-full bg-slate-900 h-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 h-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* MAIN CINEMATIC PRESENTATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 flex-1 items-center z-20">
        {/* LEFT / CENTER COLUMN: 3D HOLOGRAPHIC ORB / BALL (6 COLS) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[320px] sm:min-h-[380px] rounded-2xl bg-[#030612]/80 border border-cyan-500/20 p-4 overflow-hidden group">
          {/* Background Radial Glow */}
          <div
            className="absolute inset-0 opacity-40 blur-[90px] transition duration-700 rounded-full pointer-events-none"
            style={{ backgroundColor: currentAgent.color || "#06b6d4" }}
          />

          {/* 3D PARTICLE SPHERE ORB COMPONENT */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center z-10">
            <ParticleSphere
              state="speaking"
              micLevel={0.4}
              speakingLevel={0.6}
              agentColor={currentAgent.color || "#06b6d4"}
              shape={currentAgent.shape || "sphere"}
              currentAgentId={currentAgent.id}
              isActive={true}
            />
          </div>

          {/* Core Label Overlay Below Orb */}
          <div className="mt-2 text-center z-20 font-mono">
            <div
              className="text-lg font-black tracking-widest uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
              style={{ color: currentAgent.color || "#06b6d4" }}
            >
              {currentAgent.name}
            </div>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider">
              3D ORB SHAPE: {(currentAgent.shape || "SPHERE").toUpperCase()}
            </span>
          </div>

          {/* Previous / Next Arrow Controls on Orb */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white transition flex items-center justify-center cursor-pointer z-30 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white transition flex items-center justify-center cursor-pointer z-30 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* RIGHT COLUMN: HIGH CONVERSION SPECIALTY SPECIFICATIONS (6 COLS) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5 font-mono">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold mb-2">
              <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{specData.badge}</span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              {specData.title}
            </h2>
            <span className="text-xs text-purple-300 font-bold block mt-1">
              {specData.subTitle}
            </span>

            {/* Tagline */}
            <p className="mt-3 text-slate-200 text-xs leading-relaxed font-sans font-medium border-l-2 border-purple-400 pl-3 py-0.5">
              "{specData.tagline}"
            </p>
          </div>

          {/* Specialties Bullet Points */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              {lang === "de" ? "KERN-SPEZIALITÄTEN & CAPABILITIES:" : "CORE CAPABILITIES & SPECIALTIES:"}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {specData.specialties.map((spec, sIdx) => (
                <div
                  key={sIdx}
                  className="p-2.5 rounded-xl bg-[#070c24] border border-purple-500/20 text-xs text-slate-200 flex items-center gap-2.5 hover:border-purple-400 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {specData.metrics.map((m, mIdx) => (
              <div
                key={mIdx}
                className="p-2.5 rounded-xl bg-[#030614] border border-slate-800 text-center"
              >
                <div className="text-[9px] text-slate-400 font-bold">
                  {m.label}
                </div>
                <div className="text-sm font-black text-purple-300 mt-0.5">
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Call To Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onSelectAgentAndStart(currentAgent.id);
              }}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Terminal className="w-4 h-4" />
              <span>{lang === "de" ? `${currentAgent.name} IM DASHBOARD STARTEN` : `LAUNCH ${currentAgent.name} IN DASHBOARD`}</span>
            </button>

            {onOpenUpgradeModal && (
              <button
                onClick={() => {
                  onOpenUpgradeModal("PRO SOVEREIGN CORE");
                }}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-purple-950/80 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-400 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-purple-300" />
                <span>{lang === "de" ? "PRO FREISCHALTEN" : "UNLOCK PRO"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM HORIZONTAL AGENTS TAB SELECTOR */}
      <div className="p-4 border-t border-purple-500/20 bg-[#020510] z-30 font-mono">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
          {agents.map((ag, aIdx) => {
            const isSelected = aIdx === activeAgentIndex;
            return (
              <button
                key={ag.id}
                onClick={() => handleSelectTab(aIdx)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105"
                    : "bg-[#060a1c] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: ag.color || "#a855f7" }}
                />
                <span>{ag.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const AgentCinematicShowcaseModal: React.FC<
  AgentCinematicShowcaseModalProps
> = ({
  isOpen,
  onClose,
  agents,
  currentAgentId = "syntax",
  onSelectAgentAndStart,
  onOpenUpgradeModal,
  lang = "en",
}) => {
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0);
  const [isAutopilot, setIsAutopilot] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Sync initial agent selection
  useEffect(() => {
    if (!agents || agents.length === 0) return;
    const foundIdx = agents.findIndex((a) => a.id === currentAgentId);
    if (foundIdx >= 0) {
      setActiveAgentIndex(foundIdx);
    }
  }, [currentAgentId, agents]);

  // Autopilot progress timer loop
  useEffect(() => {
    if (!isOpen || !isAutopilot || !agents || agents.length === 0) return;

    setProgress(0);
    const intervalTime = 50; // ms
    const totalDuration = 4000; // 4 seconds per agent
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveAgentIndex((currentIdx) => (currentIdx + 1) % agents.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isAutopilot, activeAgentIndex, agents]);

  if (!isOpen || !agents || agents.length === 0) return null;

  const currentAgent = agents[activeAgentIndex] || agents[0];
  const specData = getAgentSpecialtyData(currentAgent.id, lang);

  const handleNext = () => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex((prev) => (prev + 1) % agents.length);
  };

  const handlePrev = () => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex((prev) => (prev - 1 + agents.length) % agents.length);
  };

  const handleSelectTab = (idx: number) => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex(idx);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn select-none font-sans">
      
      {/* Background Cyber Glow Modal Container */}
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#040714] border-2 border-purple-500/40 shadow-[0_0_80px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col my-auto min-h-[620px]">
        
        {/* Top Header Control HUD */}
        <div className="px-5 py-4 border-b border-purple-500/20 bg-[#060a1e]/90 flex items-center justify-between font-mono text-xs z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            </div>
            <div>
              <div className="font-black text-purple-200 tracking-wider flex items-center gap-2">
                <span>S.Y.N.T.A.X. CINEMATIC SHOWCASE</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                  CORE {activeAgentIndex + 1} / {agents.length}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                {lang === "de" ? "360° HOLOGRAPHISCHE AGENTEN-SPEZIALITÄTEN" : "360° HOLOGRAPHIC AGENT CAPABILITIES"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAutopilot(!isAutopilot);
                setProgress(0);
              }}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                isAutopilot
                  ? "bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
              title={lang === "de" ? "Autopilot Diashow umschalten" : "Toggle autopilot slideshow"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAutopilot ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">AUTOPILOT {isAutopilot ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Autopilot Progress Bar */}
        {isAutopilot && (
          <div className="w-full bg-slate-900 h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-indigo-400 to-fuchsia-400 h-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* MAIN CINEMATIC PRESENTATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 flex-1 items-center z-20">
          
          {/* LEFT / CENTER COLUMN: 3D HOLOGRAPHIC ORB / BALL (7 COLS) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[320px] sm:min-h-[380px] rounded-2xl bg-[#030612]/80 border border-purple-500/20 p-4 overflow-hidden group">
            
            {/* Background Radial Glow */}
            <div
              className="absolute inset-0 opacity-40 blur-[90px] transition duration-700 rounded-full pointer-events-none"
              style={{ backgroundColor: currentAgent.color || "#a855f7" }}
            />

            {/* 3D PARTICLE SPHERE ORB COMPONENT */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center z-10">
              <ParticleSphere
                state="speaking"
                micLevel={0.4}
                speakingLevel={0.6}
                agentColor={currentAgent.color || "#a855f7"}
                shape={currentAgent.shape || "sphere"}
                currentAgentId={currentAgent.id}
                isActive={true}
              />
            </div>

            {/* Core Label Overlay Below Orb */}
            <div className="mt-2 text-center z-20 font-mono">
              <div
                className="text-lg font-black tracking-widest uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                style={{ color: currentAgent.color || "#a855f7" }}
              >
                {currentAgent.name}
              </div>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                3D ORB SHAPE: {(currentAgent.shape || "SPHERE").toUpperCase()}
              </span>
            </div>

            {/* Previous / Next Arrow Controls on Orb */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white transition flex items-center justify-center cursor-pointer z-30 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white transition flex items-center justify-center cursor-pointer z-30 shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* RIGHT COLUMN: HIGH CONVERSION SPECIALTY SPECIFICATIONS (6 COLS) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5 font-mono">
            
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold mb-2">
                <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>{specData.badge}</span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                {specData.title}
              </h2>
              <span className="text-xs text-purple-300 font-bold block mt-1">
                {specData.subTitle}
              </span>

              {/* Tagline */}
              <p className="mt-3 text-slate-200 text-xs leading-relaxed font-sans font-medium border-l-2 border-purple-400 pl-3 py-0.5">
                "{specData.tagline}"
              </p>
            </div>

            {/* Specialties Bullet Points */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                {lang === "de" ? "KERN-SPEZIALITÄTEN & CAPABILITIES:" : "CORE CAPABILITIES & SPECIALTIES:"}
              </span>
              <div className="grid grid-cols-1 gap-2">
                {specData.specialties.map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2.5 rounded-xl bg-[#070c24] border border-purple-500/20 text-xs text-slate-200 flex items-center gap-2.5 hover:border-purple-400 transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics Row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {specData.metrics.map((m, mIdx) => (
                <div
                  key={mIdx}
                  className="p-2.5 rounded-xl bg-[#030614] border border-slate-800 text-center"
                >
                  <div className="text-[9px] text-slate-400 font-bold">{m.label}</div>
                  <div className="text-sm font-black text-purple-300 mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Call To Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  onSelectAgentAndStart(currentAgent.id);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 active:scale-95"
              >
                <Terminal className="w-4 h-4" />
                <span>{lang === "de" ? `${currentAgent.name} IM DASHBOARD STARTEN` : `LAUNCH ${currentAgent.name} IN DASHBOARD`}</span>
              </button>

              {onOpenUpgradeModal && (
                <button
                  onClick={() => {
                    onOpenUpgradeModal("PRO SOVEREIGN CORE");
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-purple-950/80 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-400 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 text-purple-300" />
                  <span>{lang === "de" ? "PRE-ACCESS (3 TAGE FREE)" : "PRE-ACCESS (3 DAYS FREE)"}</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* BOTTOM HORIZONTAL AGENTS TAB SELECTOR */}
        <div className="p-4 border-t border-purple-500/20 bg-[#020510] z-30 font-mono">
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
            {agents.map((ag, aIdx) => {
              const isSelected = aIdx === activeAgentIndex;
              return (
                <button
                  key={ag.id}
                  onClick={() => handleSelectTab(aIdx)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105"
                      : "bg-[#060a1c] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: ag.color || "#a855f7" }}
                  />
                  <span>{ag.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
