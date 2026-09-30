import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Zap,
  Terminal,
  Activity,
  Cpu,
  Shield,
  Layers,
  ArrowRight,
  Monitor,
  Eye,
  RefreshCw,
  Palette,
  CheckCircle2,
  Lock,
  Send,
  Bot,
  User,
  Database,
  Brain,
  Search,
  Code2,
  Calendar,
  DollarSign,
  Video,
  Flame,
  Globe as GlobeIcon,
  Check,
} from "lucide-react";
import { AgentConfig } from "../types";
import {
  getPersistentMemory,
  extractAndSaveMemoryFromUserText,
  setPreferredName,
  addRememberedFact,
  PersistentMemoryState,
  subscribeToMemory,
} from "../utils/persistentMemoryStore";
import { useTheme } from "../utils/themeStore";

interface InToolThemeSwitcherShowcaseProps {
  lang?: "de" | "en";
  onOpenApp?: () => void;
}

const DEMO_AGENTS: Array<{
  id: string;
  name: string;
  role: string;
  color: string;
  tag: string;
  initialMessage: string;
  icon: any;
}> = [
  {
    id: "maze",
    name: "S.Y.N.T.A.X.",
    role: "Master Orchestrator & Sovereign Core",
    color: "#00f0ff",
    tag: "SOVEREIGN CORE",
    initialMessage: "S.Y.N.T.A.X. Core online. Ich koordiniere die gesamte 8-Agenten-Flotte und merke mir jedes einzelne Wort von dir.",
    icon: Brain,
  },
  {
    id: "neo",
    name: "N.E.O.",
    role: "Matrix Boss & Lead Growth Engine",
    color: "#ff2a8d",
    tag: "STRATEGY BOSS",
    initialMessage: "N.E.O. aktiv. Wie skalieren wir dein Business heute auf die nächste Stufe?",
    icon: Flame,
  },
  {
    id: "vega",
    name: "V.E.G.A.",
    role: "Architecture & High-Speed TypeScript Audit",
    color: "#38bdf8",
    tag: "CODE ARCHITECT",
    initialMessage: "V.E.G.A. bereit. 0 Fehler im Codebase, 100% Type-Safety und unendliches Gedächtnis aktiv.",
    icon: Code2,
  },
  {
    id: "odin",
    name: "O.D.I.N.",
    role: "Tactical Defense & Zero-Trust Security",
    color: "#e2f1ff",
    tag: "SECURITY SHIELD",
    initialMessage: "O.D.I.N. Perimeter geschützt. 4096-Bit Zero-Trust Verschlüsselung verriegelt.",
    icon: Shield,
  },
  {
    id: "pulse",
    name: "P.U.L.S.E.",
    role: "Veo 3.1 8K Video Synthesis & Viral Hooks",
    color: "#f43f5e",
    tag: "VEO 3 VIDEO",
    initialMessage: "P.U.L.S.E. Video-Synthesizer bereit. Bereit für virale 9:16 Video-Hooks und Cinema-Prompts.",
    icon: Video,
  },
  {
    id: "chronos",
    name: "C.H.R.O.N.O.S.",
    role: "Temporal Matrix & Calendar Productivity",
    color: "#eab308",
    tag: "TIME MASTER",
    initialMessage: "C.H.R.O.N.O.S. synchronisiert. Deine Zeitlinien und Tagesprioritäten sind strukturiert.",
    icon: Calendar,
  },
  {
    id: "oracle",
    name: "O.R.A.C.L.E.",
    role: "Financial Candlestick & Market Analytics",
    color: "#22c55e",
    tag: "MARKET RADAR",
    initialMessage: "O.R.A.C.L.E. Chart-Scanner online. Krypto, Aktien und Markt-Signale analysiert.",
    icon: DollarSign,
  },
  {
    id: "globe",
    name: "G.L.O.B.E.",
    role: "Live Google Deep Search & Web Intelligence",
    color: "#3b82f6",
    tag: "LIVE SEARCH",
    initialMessage: "G.L.O.B.E. Deep Search verbunden. Zugriff auf das weltweite Live-Internet aktiv.",
    icon: GlobeIcon,
  },
];

export const InToolThemeSwitcherShowcase: React.FC<InToolThemeSwitcherShowcaseProps> = ({
  lang = "de",
  onOpenApp,
}) => {
  const { theme, setTheme, isModern, isCyberpunk } = useTheme();
  const isDe = lang === "de";

  // Simulated Tool State
  const [selectedAgentId, setSelectedAgentId] = useState<string>("maze");
  const [activeTab, setActiveTab] = useState<"chat" | "terminal" | "memory">("chat");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Persistent memory sync
  const [memoryState, setMemoryState] = useState<PersistentMemoryState>(getPersistentMemory);

  useEffect(() => {
    return subscribeToMemory((updated) => {
      setMemoryState({ ...updated });
    });
  }, []);

  // Chat message history inside the simulator (persists in localStorage as well!)
  const [simMessages, setSimMessages] = useState<Array<{ id: string; sender: "user" | "agent"; text: string; agentId: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem("syntax_sim_messages_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "m-1",
        sender: "agent",
        agentId: "maze",
        text: "Willkommen im S.Y.N.T.A.X. Live-Arbeitsbereich! Ich besitze ein permanentes Gedächtnis. Sag mir z. B.: 'Nenn mich ab jetzt Boss Philipp' oder 'Merke dir: Mein Projekt heißt Quantum AI' – ich werde es NIEMALS vergessen!",
        timestamp: "12:00",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("syntax_sim_messages_v1", JSON.stringify(simMessages));
    } catch (e) {}
  }, [simMessages]);

  const activeAgent = DEMO_AGENTS.find((a) => a.id === selectedAgentId) || DEMO_AGENTS[0];

  const handleSendSimMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;
    setInputText("");

    // 1. Infallible Memory Extraction (Auto-Learn & Store Forever)
    const memResult = extractAndSaveMemoryFromUserText(text, selectedAgentId);

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user" as const,
      text,
      agentId: selectedAgentId,
      timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    };

    setSimMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Formulate response taking active name & remembered memory into account
    setTimeout(() => {
      const currentMem = getPersistentMemory();
      const userName = currentMem.preferredName || "Boss";
      let responseText = "";

      if (memResult.detectedName) {
        responseText = `Verstanden, ${userName}! Ich habe deinen Namen dauerhaft in meinem unfehlbaren Langzeitgedächtnis verankert. Egal ob du den Browser schließt, den Tab wechselst oder morgen wiederkommst: Ich werde dich von nun an IMMER mit "${userName}" ansprechen! 🧠🔒`;
      } else if (memResult.detectedFact) {
        responseText = `Gedächtnis-Eintrag gespeichert, ${userName}! Die Direktive "${memResult.detectedFact}" ist jetzt dauerhaft im neuronalen Cortex hinterlegt und für alle 8 Spezialisten aktiv!`;
      } else if (text.toLowerCase().includes("wer bin ich") || text.toLowerCase().includes("weißt du wie ich heiße") || text.toLowerCase().includes("wie heiße ich")) {
        responseText = `Natürlich weiß ich das, ${userName}! Du bist ${userName}. Mein Langzeitgedächtnis vergisst kein einziges Detail, das du mir jemals anvertraut hast.`;
      } else if (text.toLowerCase().includes("was weißt du") || text.toLowerCase().includes("gedächtnis") || text.toLowerCase().includes("memory")) {
        const factCount = currentMem.facts.length;
        responseText = `Hier ist mein aktueller Gedächtnis-Status für dich, ${userName}: Ich spreche dich als "${userName}" an und habe ${factCount} persönliche Fakten/Regeln dauerhaft gespeichert. Wechsel oben auf den Reiter "🧠 MEMORY VAULT", um alle Einträge live zu inspizieren!`;
      } else {
        // Generic contextual agent response
        switch (selectedAgentId) {
          case "neo":
            responseText = `Perfekt analysiert, ${userName}! Als N.E.O. sehe ich hier einen massiven Wachstumshebel. Wir setzen den Funnel direkt auf maximale Conversion.`;
            break;
          case "vega":
            responseText = `Codebase-Check abgeschlossen, ${userName}. 100% Type-Safety und optimierte Microservice-Latenzen verifiziert.`;
            break;
          case "odin":
            responseText = `Sicherheitsmatrix bestätigt, ${userName}. Zero-Trust Perimeter aktiv, alle Verbindungen sind zu 100% verschlüsselt.`;
            break;
          case "pulse":
            responseText = `Video-Prompt generiert, ${userName}! 9:16 Hook mit 8K Cinema-Beleuchtung bereit für Veo 3.1 Synthese.`;
            break;
          case "chronos":
            responseText = `Zeitplan synchronisiert, ${userName}. Zeitblocker für maximale Tiefenarbeit freigegeben.`;
            break;
          case "oracle":
            responseText = `Chart-Muster gescannt, ${userName}. Bullish Divergenz erkannt mit optimalem Risiko-Ertrags-Verhältnis.`;
            break;
          case "globe":
            responseText = `Echtzeit-Websuche durchgeführt, ${userName}. Aktuelle Datenquellen und Google-Indizes abgeglichen.`;
            break;
          default:
            responseText = `Befehl ausgeführt, ${userName}! S.Y.N.T.A.X. Sovereign Core hat die Direktive an die Flotte übermittelt und im Langzeitgedächtnis verankert.`;
            break;
        }
      }

      const agentMsg = {
        id: `a-${Date.now()}`,
        sender: "agent" as const,
        text: responseText,
        agentId: selectedAgentId,
        timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      };

      setSimMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div
      id="in-tool-interactive-simulator"
      className={`w-full my-12 rounded-3xl transition-all duration-500 relative overflow-hidden border ${
        isModern
          ? "bg-[#090e17] border-slate-800 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          : "bg-black border-cyan-500/40 text-cyan-100 shadow-[0_0_50px_rgba(6,182,212,0.25)]"
      }`}
    >
      {/* Background Matrix & Ambience */}
      {!isModern && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px]" />
      )}

      {/* Simulator Outer Frame Header */}
      <div
        className={`px-5 py-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10 ${
          isModern ? "bg-[#0d1322] border-slate-800" : "bg-[#020512] border-cyan-500/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Window traffic light dots */}
          <div className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${isModern ? "bg-red-500/80" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`} />
            <div className={`w-3 h-3 rounded-full ${isModern ? "bg-amber-500/80" : "bg-yellow-400 shadow-[0_0_8px_#eab308]"}`} />
            <div className={`w-3 h-3 rounded-full ${isModern ? "bg-emerald-500/80" : "bg-cyan-400 shadow-[0_0_8px_#00f0ff]"}`} />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold pl-2 border-l border-slate-700/50">
            <span className={isModern ? "text-indigo-400" : "text-cyan-400 tracking-wider"}>
              {isModern ? "S.Y.N.T.A.X. OS // LIVE TOOL SIMULATOR" : "⚡ [SYNTAX // QUANTUM HUD OS v4.8]"}
            </span>
            <span
              className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isModern
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              }`}
            >
              ● 8 CORES ONLINE
            </span>
          </div>
        </div>

        {/* Live Theme Toggle Controller INSIDE THE TOOL FRAME */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-slate-400 hidden lg:inline">
            {isDe ? "LIVE ARBEITSBEREICH-DESIGN:" : "LIVE WORKSPACE THEME:"}
          </div>
          <div
            className={`flex items-center p-1 rounded-xl font-mono text-xs font-bold ${
              isModern ? "bg-slate-900 border border-slate-700" : "bg-black border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            }`}
          >
            <button
              type="button"
              onClick={() => setTheme("syntax")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isModern
                  ? "bg-zinc-100 text-zinc-950 font-black shadow-md scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>MODERN SAAS</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("cyberpunk")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isCyberpunk
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>CYBERPUNK HUD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulator Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        
        {/* Left Side: 8 Agents Fleet Selector Sidebar */}
        <div
          className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r p-4 space-y-3 flex flex-col justify-between ${
            isModern ? "bg-[#0a0f1c] border-slate-800" : "bg-[#02040d] border-cyan-500/30"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                {isDe ? "8 AUTONOME SPEZIALISTEN" : "8 AUTONOMOUS SPECIALISTS"}
              </span>
              <span className={`text-[10px] font-mono ${isModern ? "text-indigo-400" : "text-cyan-400"}`}>
                1-KLICK AUSWAHL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {DEMO_AGENTS.map((agent) => {
                const isSelected = selectedAgentId === agent.id;
                const IconComponent = agent.icon;

                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      // Add greeting if switching
                      setSimMessages((prev) => [
                        ...prev,
                        {
                          id: `ag-switch-${Date.now()}`,
                          sender: "agent",
                          agentId: agent.id,
                          text: agent.initialMessage,
                          timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
                        },
                      ]);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? isModern
                          ? "bg-slate-800/90 border border-slate-600 text-white shadow-md"
                          : "bg-cyan-950/40 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold"
                        : isModern
                        ? "bg-slate-900/40 border border-slate-800/60 hover:bg-slate-800/40 text-slate-300"
                        : "bg-black/60 border border-slate-800/80 hover:border-cyan-500/40 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${agent.color}15`,
                          borderColor: `${agent.color}40`,
                          color: agent.color,
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{agent.name}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{agent.role}</div>
                      </div>
                    </div>

                    <span
                      className="text-[9px] font-mono px-2 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: `${agent.color}20`,
                        color: agent.color,
                      }}
                    >
                      {agent.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persistent Memory Badge / Quick Status */}
          <div
            className={`p-3 rounded-xl border mt-3 space-y-1.5 ${
              isModern
                ? "bg-slate-900/80 border-slate-800 text-slate-300"
                : "bg-[#030614] border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isDe ? "UNFEHLBARES GEDÄCHTNIS" : "INFALLIBLE MEMORY"}</span>
              </span>
              <span className="text-emerald-400">● 100% AKTIV</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed font-sans">
              {isDe ? (
                <>
                  Aktueller Name: <strong className="text-white">{memoryState.preferredName || "Boss"}</strong> ({memoryState.facts.length} Fakten dauerhaft gespeichert)
                </>
              ) : (
                <>
                  Active Name: <strong className="text-white">{memoryState.preferredName || "Boss"}</strong> ({memoryState.facts.length} facts forever stored)
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Active Agent Screen & Simulator Views (Chat / Terminal / Memory Vault) */}
        <div
          className={`lg:col-span-8 p-4 sm:p-5 flex flex-col justify-between ${
            isModern ? "bg-[#090d16]" : "bg-[#01030a]"
          }`}
        >
          {/* Tab Controller (Live Chat vs Terminal vs Memory Vault) */}
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "chat"
                      ? isModern
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isDe ? "💬 LIVE CHAT" : "💬 LIVE CHAT"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("terminal")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "terminal"
                      ? isModern
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{isDe ? "⌨️ CLAUDE TERMINAL" : "⌨️ CLAUDE TERMINAL"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("memory")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "memory"
                      ? isModern
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "bg-purple-500/20 text-purple-300 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isDe ? "🧠 MEMORY VAULT" : "🧠 MEMORY VAULT"}</span>
                </button>
              </div>

              {/* Reset simulation button */}
              <button
                type="button"
                onClick={() => {
                  setSimMessages([
                    {
                      id: `m-reset-${Date.now()}`,
                      sender: "agent",
                      agentId: selectedAgentId,
                      text: `Gedächtnis synchronisiert, ${memoryState.preferredName || "Boss"}! Frag mich nach allem oder erteile einen neuen Befehl.`,
                      timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
                    },
                  ]);
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded bg-slate-800/40 hover:bg-slate-800 transition cursor-pointer"
                title={isDe ? "Chat-Verlauf zurücksetzen" : "Reset chat view"}
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">{isDe ? "Zurücksetzen" : "Reset"}</span>
              </button>
            </div>

            {/* TAB 1: LIVE CHAT VIEW */}
            {activeTab === "chat" && (
              <div className="space-y-3 min-h-[300px] max-h-[340px] overflow-y-auto pr-1">
                {simMessages.map((msg) => {
                  const isUser = msg.sender === "user";
                  const agentInfo = DEMO_AGENTS.find((a) => a.id === msg.agentId) || activeAgent;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border"
                          style={{
                            backgroundColor: `${agentInfo.color}20`,
                            borderColor: `${agentInfo.color}50`,
                            color: agentInfo.color,
                          }}
                        >
                          {agentInfo.name.charAt(0)}
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isUser
                            ? isModern
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-cyan-500/20 border border-cyan-400 text-cyan-100 rounded-br-none shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono"
                            : isModern
                            ? "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm font-sans"
                            : "bg-[#040817] border border-cyan-500/40 text-slate-200 rounded-bl-none shadow-[0_0_15px_rgba(6,182,212,0.15)] font-mono"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/40">
                            <span className="font-bold text-[11px]" style={{ color: agentInfo.color }}>
                              {agentInfo.name}
                            </span>
                            <span className="text-[9.5px] text-slate-400">{msg.timestamp}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
                    <Brain className="w-4 h-4 animate-spin" />
                    <span>{activeAgent.name} {isDe ? "greift auf Langzeitgedächtnis zu..." : "accessing memory vault..."}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CLAUDE TERMINAL VIEW */}
            {activeTab === "terminal" && (
              <div
                className={`p-4 rounded-xl font-mono text-xs space-y-2 min-h-[300px] border ${
                  isModern
                    ? "bg-[#060a14] border-slate-800 text-slate-300"
                    : "bg-black border-cyan-500/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                }`}
              >
                <div className="text-slate-400 border-b border-slate-800 pb-2 flex items-center justify-between text-[11px]">
                  <span>$ syntax-core --fleet-status --memory-check</span>
                  <span className="text-emerald-400">✓ ALL 8 AGENTS SYNCED</span>
                </div>
                <div className="text-cyan-400">&gt; Authenticated User Name: "{memoryState.preferredName || "Boss"}"</div>
                <div className="text-slate-400">&gt; Memory Ledger Status: {memoryState.facts.length} Facts / Directives permanently persisted</div>
                <div className="text-indigo-400">&gt; Active Model: Gemini 3.1 Flash + Dual-Core Multi-Agent Mesh</div>
                <div className="text-emerald-400">&gt; Zero Data-Loss Guarantee: Storage validated across tabs & restarts</div>
                <div className="text-purple-400">&gt; Active Node: {activeAgent.name} ({activeAgent.role})</div>
                <div className="pt-3 text-slate-400 text-[10.5px]">
                  [Tippe unten einen Befehl wie <span className="text-yellow-300">"Nenn mich ab jetzt Boss Philipp"</span>, um das Terminal live zu testen]
                </div>
              </div>
            )}

            {/* TAB 3: MEMORY VAULT VIEW */}
            {activeTab === "memory" && (
              <div
                className={`p-4 rounded-xl text-xs space-y-3 min-h-[300px] border ${
                  isModern
                    ? "bg-[#060a14] border-slate-800 text-slate-300"
                    : "bg-black border-purple-500/40 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>{isDe ? "DAUERHAFTES LANGZEITGEDÄCHTNIS (FOREVER REMEMBERED)" : "PERSISTENT MEMORY LEDGER"}</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    ● {memoryState.facts.length} EINTRÄGE
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block">BEVORZUGTE ANREDE / NAME</span>
                      <span className="text-xs font-bold text-white">"{memoryState.preferredName || "Boss"}"</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9.5px] font-mono">AKTIV</span>
                  </div>

                  {memoryState.facts.length === 0 ? (
                    <div className="text-slate-400 italic text-center py-4">
                      {isDe
                        ? "Noch keine zusätzlichen Fakten gespeichert. Sag z. B. 'Merke dir: Mein Projekt heißt Quantum AI'."
                        : "No extra facts saved yet. Type e.g. 'Remember: My project is called Quantum AI'."}
                    </div>
                  ) : (
                    memoryState.facts.map((fact) => (
                      <div
                        key={fact.id}
                        className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-2"
                      >
                        <div className="text-[11px] text-slate-200">
                          <span>{fact.fact}</span>
                          <span className="block text-[9px] text-slate-400 mt-0.5 font-mono">{fact.timestamp}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 shrink-0">
                          {fact.category.toUpperCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Interactive Message Bar with 1-Click Memory Prompt Pills */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
            {/* Quick Memory Action Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
              <span className="text-slate-400 shrink-0 mr-1">{isDe ? "Test-Prompts:" : "Test Prompts:"}</span>
              <button
                type="button"
                onClick={() => handleSendSimMessage("Nenn mich ab jetzt Boss Philipp")}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                  isModern
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    : "bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40"
                }`}
              >
                🧠 "Nenn mich ab jetzt Boss Philipp"
              </button>

              <button
                type="button"
                onClick={() => handleSendSimMessage("Weißt du noch wie ich heiße?")}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                  isModern
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    : "bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40"
                }`}
              >
                🔍 "Weißt du noch wie ich heiße?"
              </button>

              <button
                type="button"
                onClick={() => handleSendSimMessage("Merke dir: Mein Startup heißt Syntax AI")}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                  isModern
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    : "bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40"
                }`}
              >
                💡 "Merke dir: Mein Startup heißt Syntax AI"
              </button>
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendSimMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isDe
                    ? `Schreibe an ${activeAgent.name} (z. B. 'Nenn mich ab jetzt ...' oder Frage)...`
                    : `Type to ${activeAgent.name} (e.g. 'Call me from now on...' or ask)...`
                }
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs outline-none transition ${
                  isModern
                    ? "bg-slate-900/90 border border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500"
                    : "bg-black border border-cyan-500/50 focus:border-cyan-400 text-cyan-100 placeholder-cyan-700 font-mono shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                }`}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  isModern
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                    : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                }`}
              >
                <span>{isDe ? "Senden" : "Send"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Simulator Bottom Bar with Full Tool Launch CTA */}
      {onOpenApp && (
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isModern ? "bg-[#0d1322] border-slate-800" : "bg-[#020512] border-cyan-500/30"
          }`}
        >
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isDe
                ? "Alle Daten, Gespräche & Agenten-Gedächtnisse werden 1:1 in deine Vollversion übertragen."
                : "All data, chat history & agent memory transfer 1:1 into your full session."}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenApp}
            className={`px-6 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg active:scale-95 ${
              isModern
                ? "bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm"
                : "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
            }`}
          >
            <span>{isDe ? "VOLLEN ARBEITSBEREICH ÖFFNEN (24H GRATIS)" : "OPEN FULL WORKSPACE (24H FREE)"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
