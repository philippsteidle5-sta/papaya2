import React, { useState, useEffect } from "react";
import {
  Terminal,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  Activity,
  CheckCircle2,
  Lock,
  ShieldCheck,
  MessageSquare,
  Clock,
  ArrowUpRight,
  X,
  Award,
  Gift,
  Lightbulb,
  GitBranch,
  Send,
  Play,
  Share2,
  ChevronRight,
  Check,
  HeartPulse,
  BatteryCharging,
  Thermometer,
  Gauge,
  Flame,
} from "lucide-react";
import { AgentConfig, Message } from "../types";
import { UserRole, ROLE_TIER_DETAILS, isAgentAllowed } from "../rbac";

interface JarvisTerminalDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  onSelectAgent: (agent: AgentConfig) => void;
  agentChats: Record<string, Message[]>;
  onSendMessageToAgent: (agentId: string, text: string) => void;
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenRoleManager: () => void;
  onOpenConstellation?: () => void;
  onOpenAgentInspector?: (agentId?: string) => void;
}

export const JarvisTerminalDashboard: React.FC<JarvisTerminalDashboardProps> = ({
  isOpen,
  onClose,
  agents,
  currentAgent,
  onSelectAgent,
  agentChats,
  onSendMessageToAgent,
  userRole = "SOVEREIGN" as UserRole,
  onSelectRole,
  onOpenRoleManager,
  onOpenConstellation,
  onOpenAgentInspector,
}) => {
  const [activeTab, setActiveTab] = useState<"terminal" | "recent">("terminal");
  const [copilotInput, setCopilotInput] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => currentAgent?.id || (agents && agents[0]?.id) || "maze");

  const handleSelectAgent = (agentId: string) => {
    const found = agents.find((a) => a.id === agentId);
    if (found) {
      onSelectAgent(found);
      setSelectedAgentId(agentId);
    }
  };
  
  // Reward system state stored in localStorage
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("jarvis_maze_reward_claimed_v1") === "true";
    } catch {
      return false;
    }
  });

  const [questsCompleted, setQuestsCompleted] = useState<Record<string, boolean>>({
    quest1: true, // Matrix Pioneer
    quest2: true, // Token Synthesizer
    quest3: true, // Quant & Auto-Trader
    quest4: false, // Constellation Master
  });

  useEffect(() => {
    if (currentAgent?.id) {
      setSelectedAgentId(currentAgent.id);
    }
  }, [currentAgent?.id]);

  // Real-time Vitality & Energy Efficiency state
  const [powerMode, setPowerMode] = useState<"ECO" | "BALANCED" | "TURBO">("BALANCED");
  const [liveMetrics, setLiveMetrics] = useState({
    cpuLoad: 28,
    tensorCoreLoad: 34,
    vitality: 98.6,
    efficiency: 96.4,
    temp: 38,
    powerWatts: 14.8,
  });

  // Simulated live telemetry tick for processor load & vitality
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => {
        const baseLoad = powerMode === "TURBO" ? 68 : powerMode === "ECO" ? 16 : 30;
        const loadVar = (Math.random() - 0.5) * 10;
        const cpu = Math.min(99, Math.max(6, Math.round(baseLoad + loadVar)));
        const tensor = Math.min(99, Math.max(8, Math.round(baseLoad * 1.15 + loadVar)));
        const temp = Math.round(34 + (cpu / 100) * 18);
        const watts = parseFloat((10 + (cpu / 100) * 22).toFixed(1));
        const eff = parseFloat((99.5 - (cpu / 100) * 7.5).toFixed(1));
        const vit = parseFloat((99.8 - (temp > 46 ? 2.5 : 0.4)).toFixed(1));

        return {
          cpuLoad: cpu,
          tensorCoreLoad: tensor,
          vitality: vit,
          efficiency: eff,
          temp: temp,
          powerWatts: watts,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [powerMode]);

  if (!isOpen) return null;

  // Calculate stats
  const totalMessagesCount = agentChats ? (Object.values(agentChats) as Message[][]).reduce(
    (acc: number, msgs: Message[]) => acc + (Array.isArray(msgs) ? msgs.length : 0),
    0
  ) : 0;

  const completedCount = Object.values(questsCompleted).filter(Boolean).length;
  const isRewardAvailable = completedCount >= 3; // Allows claiming after 3+ quests

  const handleClaimReward = () => {
    setRewardClaimed(true);
    try {
      localStorage.setItem("jarvis_maze_reward_claimed_v1", "true");
    } catch (e) {
      console.warn("Could not save reward state", e);
    }
  };

  const handleSendPrompt = (textToSend?: string) => {
    const prompt = textToSend || copilotInput;
    if (!prompt.trim()) return;
    if (onSendMessageToAgent) {
      onSendMessageToAgent(selectedAgentId, prompt);
    }
    setCopilotInput("");
  };

  // Get dynamic greeting based on local hour
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Build array of recent conversations sorted by latest message
  const safeAgents = agents || [];
  const recentConversations = safeAgents.map((ag) => {
    const msgs = (agentChats && ag?.id && agentChats[ag.id]) || [];
    const lastMsg = msgs[msgs.length - 1];
    const allowed = isAgentAllowed(userRole, ag.id);
    return {
      agent: ag,
      msgs,
      lastMsg,
      msgCount: msgs.length,
      allowed,
    };
  }).filter(item => item.msgCount > 0 || item.allowed);

  const activeAgentConfig = safeAgents.find(a => a?.id === selectedAgentId) || currentAgent || { id: "syntax", name: "S.Y.N.T.A.X.", short: "SYNTAX", color: "#4ee8ff" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-7xl bg-slate-900/90 border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* TOP GLOW BAR */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

        {/* COMPACT HEADER SECTION */}
        <div className="p-4 md:p-5 border-b border-purple-500/20 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-[2px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  NEURAL ENGINE ONLINE
                </span>
              </div>
              <h1 className="font-display font-extrabold text-xl text-white tracking-wide mt-0.5">
                S.Y.N.T.A.X. TERMINAL DASHBOARD
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRoleManager}
              className="px-3.5 py-2 rounded-lg font-mono text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 transition cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>{ROLE_TIER_DETAILS[userRole]?.name || userRole}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/20 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DASHBOARD BODY - SCROLLABLE */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">

          {/* MAIN MIDDLE CONTENT (2 COLUMNS: CHART + COPILOT/RECENT CHATS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN (5 COLS): Agent Vitalitäts-Anzeige & Prozessor-Last Panel */}
            <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-purple-500/30 bg-slate-950/70 flex flex-col justify-between shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
              
              <div>
                {/* Header with Live Pulse */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                    <h3 className="font-mono text-xs text-purple-200 uppercase tracking-widest font-bold">
                      Vitalitäts-Anzeige
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE TELEMETRIE
                  </span>
                </div>

                {/* Agent Selection Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                  {safeAgents.map((ag) => {
                    const isSelected = ag.id === activeAgentConfig.id;
                    return (
                      <button
                        key={ag.id}
                        type="button"
                        onClick={() => {
                          setSelectedAgentId(ag.id);
                          onSelectAgent(ag);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                          isSelected
                            ? "bg-purple-600/30 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                            : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: ag.color || "#c084fc" }}
                        />
                        <span>{ag.short || ag.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Agent Identity & Health Badge */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/20 mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-md"
                      style={{
                        backgroundColor: `${activeAgentConfig.color}25`,
                        color: activeAgentConfig.color,
                        border: `1px solid ${activeAgentConfig.color}60`,
                      }}
                    >
                      {activeAgentConfig.railLetter || activeAgentConfig.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono text-sm font-bold text-white">
                          {activeAgentConfig.name}
                        </h4>
                        <span className="font-mono text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold uppercase">
                          VITAL
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-400">
                        {activeAgentConfig.role || "S.Y.N.T.A.X. Matrix Neural Agent"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-lg font-black text-emerald-400 tracking-tight">
                      {liveMetrics.vitality}%
                    </div>
                    <div className="font-mono text-[9px] text-slate-400 uppercase">
                      VITALITÄTS-INDEX
                    </div>
                  </div>
                </div>

                {/* Metric 1: Prozessor-Last (CPU & Tensor Core) */}
                <div className="space-y-3 mb-3.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        Prozessor-Last (CPU Core)
                      </span>
                      <span className="text-cyan-300 font-bold">{liveMetrics.cpuLoad}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        style={{ width: `${liveMetrics.cpuLoad}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        Tensor AI Core Last
                      </span>
                      <span className="text-purple-300 font-bold">{liveMetrics.tensorCoreLoad}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        style={{ width: `${liveMetrics.tensorCoreLoad}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metric 2: Energie-Effizienz & Thermals */}
                <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                  {/* Energy Efficiency */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Energie-Effizienz</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-mono text-base font-bold text-emerald-400">
                        {liveMetrics.efficiency}%
                      </span>
                      <span className="font-mono text-[9px] text-emerald-300 bg-emerald-500/20 px-1 rounded font-bold">
                        A++
                      </span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 mt-1">
                      {liveMetrics.powerWatts}W Power Draw
                    </div>
                  </div>

                  {/* Core Temperature */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Core Temperatur</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-mono text-base font-bold text-amber-300">
                        {liveMetrics.temp}°C
                      </span>
                      <span className="font-mono text-[9px] text-amber-400/80 uppercase font-bold">
                        {liveMetrics.temp > 45 ? "WARM" : "OPTIMAL"}
                      </span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 mt-1">
                      Latenz: 2.4ms
                    </div>
                  </div>
                </div>

                {/* Power Mode Controls */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                    <span>Energie-Modus Profil</span>
                    <span className="text-purple-300">{powerMode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPowerMode("ECO")}
                      className={`py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                        powerMode === "ECO"
                          ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>🌿 ECO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPowerMode("BALANCED")}
                      className={`py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                        powerMode === "BALANCED"
                          ? "bg-purple-500/30 text-purple-300 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>⚡ BALANCED</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPowerMode("TURBO")}
                      className={`py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                        powerMode === "TURBO"
                          ? "bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>🚀 TURBO</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-500/10 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>SYNAPSE LATENZ: <strong className="text-cyan-400">2.4ms</strong></span>
                <span>MATRIX FREQ: <strong className="text-purple-300">1.2 GHz</strong></span>
              </div>
            </div>

            {/* RIGHT COLUMN (7 COLS): S.Y.N.T.A.X. Copilot + Recent Conversations */}
            <div className="lg:col-span-7 glass-panel p-5 rounded-xl border border-purple-500/20 bg-slate-950/50 flex flex-col">
              
              {/* Header & Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="font-mono text-xs text-purple-200 uppercase tracking-widest font-bold">
                    S.Y.N.T.A.X. Copilot Terminal
                  </h3>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-mono font-bold">
                    GPT-∞
                  </span>
                </div>

                {/* Tabs for Copilot vs Recent Chats */}
                <div className="flex bg-slate-900 border border-purple-500/20 p-1 rounded-lg font-mono text-[10px]">
                  <button
                    onClick={() => setActiveTab("terminal")}
                    className={`px-3 py-1 rounded transition cursor-pointer font-bold ${
                      activeTab === "terminal"
                        ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Copilot
                  </button>
                  <button
                    onClick={() => setActiveTab("recent")}
                    className={`px-3 py-1 rounded transition cursor-pointer font-bold flex items-center gap-1 ${
                      activeTab === "recent"
                        ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    Letzte Chats ({recentConversations.length})
                  </button>
                </div>
              </div>

              {/* TAB 1: COPILOT QUICK PROMPT TERMINAL */}
              {activeTab === "terminal" && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  {/* AI Greeting Bubble */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 text-slate-200 font-mono text-xs flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center flex-shrink-0 text-purple-300">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-300 mb-1">S.Y.N.T.A.X. Copilot Terminal:</p>
                      <p className="text-slate-300">
                        Hey Boss! Ich bin S.Y.N.T.A.X., Ihr persönlicher OS-Copilot. Was wollen wir heute bauen? 🚀
                      </p>
                    </div>
                  </div>

                  {/* Prompt Input Box */}
                  <div className="relative">
                    <input
                      type="text"
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
                      placeholder={`Send prompt to ${activeAgentConfig.name}...`}
                      className="w-full bg-slate-900 border border-purple-500/30 rounded-xl px-4 py-3 pr-12 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
                    />
                    <button
                      onClick={() => handleSendPrompt()}
                      className="absolute right-2 top-2 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Action Pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "🚀 10x my workflow", prompt: "Optimiere meine Arbeitsabläufe und schlage automatisierte Agenten-Pipelines vor." },
                      { label: "🧠 Summarize my brain", prompt: "Fasse meine bisherigen Chat-Erkenntnisse und Notizen zusammen." },
                      { label: "🧩 Build a SaaS Strategy", prompt: "Erstelle mir einen Fahrplan für eine neue Quant & AI SaaS Anwendung." },
                      { label: "⚡ Auto-Post TikTok", prompt: "Generiere mir ein skriptfertiges Social-Media-Konzept für TikTok." },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendPrompt(btn.prompt)}
                        className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 text-purple-200 hover:text-white font-mono text-[11px] transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: LETZTE UNTERHALTUNGEN (RECENT CONVERSATIONS ACCESS) */}
              {activeTab === "recent" && (
                <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {recentConversations.length === 0 ? (
                    <div className="text-center py-8 font-mono text-xs text-slate-500">
                      Noch keine aktiven Unterhaltungen gespeichert.
                    </div>
                  ) : (
                    recentConversations.map(({ agent, msgs, lastMsg, allowed }) => (
                      <div
                        key={agent.id}
                        onClick={() => {
                          if (allowed) {
                            onSelectAgent(agent);
                            onClose();
                          } else {
                            onOpenRoleManager();
                          }
                        }}
                        className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                          allowed
                            ? "bg-slate-900/70 border-purple-500/20 hover:border-purple-400 hover:bg-purple-950/20"
                            : "bg-red-950/20 border-red-500/30 opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                            style={{ backgroundColor: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}50` }}
                          >
                            {agent.railLetter}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white">{agent.name}</span>
                              <span className="font-mono text-[9px] text-slate-400">({msgs.length} Nachrichten)</span>
                            </div>
                            <p className="font-mono text-[10px] text-slate-400 truncate max-w-xs sm:max-w-md">
                              {lastMsg ? lastMsg.text : agent.greeting}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {allowed ? (
                            <span className="font-mono text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5">
                              Öffnen <ChevronRight className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold uppercase flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-amber-400" /> SPERRE
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM ROW: SECOND BRAIN NODE MAP & ALL AGENTS PRESENTATION */}
          <div className="pt-2">
            <div className="glass-panel p-5 rounded-xl border border-purple-500/30 bg-slate-950/70 flex flex-col justify-between shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs text-purple-200 uppercase tracking-widest font-bold flex items-center gap-2">
                      <span>YOUR SECOND BRAIN • NEURAL CONSTELLATION</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300">
                        ALL 8 CORES LINKED
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded font-bold uppercase hidden sm:inline">
                    2,847 NODES • LIVE SYNAPSE STREAM
                  </span>
                  {onOpenAgentInspector && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAgentInspector(selectedAgentId);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-200 font-mono text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                      title="Alle Queries & Prompts der einzelnen Agenten einsehen"
                    >
                      <Brain className="w-3 h-3 text-cyan-300" />
                      <span>MEMORY & PROMPT LOG</span>
                    </button>
                  )}
                  {onOpenConstellation && (
                    <button
                      onClick={onOpenConstellation}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/50 text-purple-200 font-mono text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Vollbild Matrix View öffnen"
                    >
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      <span>VOLLBILD MATRIX</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Agent Constellation Matrix Canvas */}
              <div className="h-52 w-full bg-slate-950/90 rounded-xl border border-purple-500/20 p-4 relative overflow-hidden flex items-center justify-center group">
                {/* Background Grid & Pulsing Radial Center */}
                <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
                <div className="absolute w-40 h-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none animate-pulse" />

                {/* SVG Connecting Synapses from Central SECOND BRAIN to all Agents */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="brain-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#4ee8ff" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Synapse Lines from center (50%, 50%) to 8 orbital positions */}
                  {[
                    { x: 12, y: 22, color: "#4ee8ff" }, // MAZE
                    { x: 38, y: 18, color: "#ff2a8d" }, // NEO
                    { x: 62, y: 18, color: "#ff4d5e" }, // VEGA
                    { x: 88, y: 22, color: "#e2f1ff" }, // ODIN
                    { x: 12, y: 78, color: "#a855f7" }, // PULSE
                    { x: 38, y: 82, color: "#eab308" }, // CHRONOS
                    { x: 62, y: 82, color: "#22c55e" }, // ORACLE
                    { x: 88, y: 78, color: "#38bdf8" }, // GLOBE
                  ].map((pt, i) => (
                    <g key={i}>
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`${pt.x}%`}
                        y2={`${pt.y}%`}
                        stroke={pt.color}
                        strokeWidth="1.2"
                        strokeOpacity="0.35"
                        strokeDasharray="3 3"
                      />
                      <circle cx={`${pt.x}%`} cy={`${pt.y}%`} r="2" fill={pt.color} className="animate-ping" style={{ animationDuration: `${2 + i * 0.3}s` }} />
                    </g>
                  ))}
                </svg>

                {/* CENTER HUB: YOUR SECOND BRAIN */}
                <div className="absolute z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-cyan-500 p-0.5 shadow-[0_0_25px_rgba(168,85,247,0.6)] animate-pulse">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                      <Brain className="w-7 h-7 text-purple-300 animate-spin-slow" />
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-extrabold text-purple-200 tracking-wider bg-black/80 px-2 py-0.5 rounded border border-purple-500/40 mt-1 uppercase shadow-md">
                    YOUR SECOND BRAIN
                  </span>
                </div>

                {/* 8 Agent Orbiting Core Cards */}
                <div className="relative w-full h-full flex items-center justify-between px-2 font-mono text-[10px]">
                  {[
                    { id: "syntax", name: "S.Y.N.T.A.X.", short: "CORE", color: "#4ee8ff", pos: "top-2 left-2" },
                    { id: "neo", name: "N.E.O.", short: "MATRIX", color: "#ff2a8d", pos: "top-2 left-[28%]" },
                    { id: "vega", name: "V.E.G.A.", short: "TACTICAL", color: "#ff4d5e", pos: "top-2 right-[28%]" },
                    { id: "odin", name: "O.D.I.N.", short: "STRATEGY", color: "#e2f1ff", pos: "top-2 right-2" },
                    { id: "pulse", name: "P.U.L.S.E.", short: "VIRAL VEO", color: "#a855f7", pos: "bottom-2 left-2" },
                    { id: "chronos", name: "C.H.R.O.N.O.S.", short: "TEMPORAL", color: "#eab308", pos: "bottom-2 left-[28%]" },
                    { id: "oracle", name: "O.R.A.C.L.E.", short: "ANALYTICS", color: "#22c55e", pos: "bottom-2 right-[28%]" },
                    { id: "globe", name: "G.L.O.B.E.", short: "SEARCH", color: "#38bdf8", pos: "bottom-2 right-2" },
                  ].map((ag) => (
                    <button
                      key={ag.id}
                      onClick={() => handleSelectAgent(ag.id)}
                      style={{ borderColor: `${ag.color}50` }}
                      className={`absolute ${ag.pos} px-2.5 py-1.5 rounded-lg bg-slate-900/90 border hover:scale-110 transition duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg group/btn z-20`}
                    >
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: ag.color, boxShadow: `0 0 8px ${ag.color}` }}
                      />
                      <div className="text-left">
                        <div className="font-bold text-white group-hover/btn:text-cyan-300 transition">{ag.name}</div>
                        <div className="text-[8px] text-slate-400 uppercase">{ag.short}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER STATUS */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-purple-500/10 flex items-center justify-between font-mono text-[10px] text-slate-500">
          <span>&gt;_ S.Y.N.T.A.X. OVERALL MATRIX GUI // SYSTEM ONLINE</span>
          <span>ROLE: {userRole} ({ROLE_TIER_DETAILS[userRole]?.name || userRole})</span>
        </div>

      </div>
    </div>
  );
};
