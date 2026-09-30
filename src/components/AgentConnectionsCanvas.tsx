import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Sparkles,
  Zap,
  Sliders,
  Database,
  Cpu,
  Wrench,
  User,
  RotateCw,
  Layers,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  Globe,
  Settings2,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Activity,
  Maximize2,
  Minimize2,
  X,
  MessageSquare,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AgentConfig } from "../types";

export interface ContextConfig {
  memoryItems: string[];
  customContext: string;
  injectedFiles: { id: string; name: string; content: string }[];
}

export interface LLMConfig {
  model: string;
  temperature: number;
  reasoningDepth: "fast" | "balanced" | "deep";
  topP: number;
  maxTokens: number;
}

export interface ToolConfig {
  webSearch: boolean;
  codeSandbox: boolean;
  visionPerceiver: boolean;
  databaseQuery: boolean;
  terminalRunner: boolean;
}

export interface HumanLoopConfig {
  requireApproval: boolean;
  interventionMode: boolean;
}

export interface AgentConnectionsCanvasProps {
  onClose?: () => void;
  onSelectAgentAndStart?: (agentId: string) => void;
  currentAgentId?: string;
  lang?: "de" | "en";
}

export const AgentConnectionsCanvas: React.FC<AgentConnectionsCanvasProps> = ({
  onClose,
  onSelectAgentAndStart,
  currentAgentId = "syntax",
  lang = "de",
}) => {
  // Active Selected Nodes for Inspector Drawer
  const [activeInspectorNode, setActiveInspectorNode] = useState<
    "agents_managing" | "human_loop" | "multi_agent" | "agent_y" | "agent_x" | "context" | "llm" | "tool" | null
  >(null);

  // Sub-Agent assignments
  const [agentXId, setAgentXId] = useState<string>("vega");
  const [agentYId, setAgentYId] = useState<string>("globe");
  const [orchestratorAgentId, setOrchestratorAgentId] = useState<string>("syntax");

  // Real Node Configurations
  const [contextConfig, setContextConfig] = useState<ContextConfig>({
    memoryItems: [
      "User bevorzugt sauberen, modularisierten TypeScript/React Code",
      "Aktives Projekt: Sovereign AI Multi-Agent Matrix & OS",
      "Strikte Sicherheits- und Identitäts-Isolation aller 8 Cores",
    ],
    customContext: "Fokus auf maximale Präzision, echte Funktionsfähigkeit und moderne Tailwind UI.",
    injectedFiles: [
      {
        id: "f-1",
        name: "architecture_spec.md",
        content: "Multi-Agent System with Human-In-The-Loop Chat & Control cycle, LLM inference, Vector Context, and Live Tools.",
      },
    ],
  });

  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    model: "gemini-3.1-flash-lite",
    temperature: 0.4,
    reasoningDepth: "deep",
    topP: 0.95,
    maxTokens: 4096,
  });

  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    webSearch: true,
    codeSandbox: true,
    visionPerceiver: false,
    databaseQuery: true,
    terminalRunner: true,
  });

  const [humanLoopConfig, setHumanLoopConfig] = useState<HumanLoopConfig>({
    requireApproval: false,
    interventionMode: false,
  });

  // Prompt and Chat Feed
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [executionStep, setExecutionStep] = useState<string>("");
  const [activeExecutionNode, setActiveExecutionNode] = useState<string | null>(null);

  // Pipeline execution log & results
  const [pipelineMessages, setPipelineMessages] = useState<
    {
      id: string;
      role: "user" | "pipeline";
      text: string;
      timestamp: string;
      telemetry?: any;
      subAgentBreakdown?: any[];
    }[]
  >([
    {
      id: "init-1",
      role: "pipeline",
      text: "⚡ **Multi-Agent Connections Engine bereit.**\n\nAlle Knotenpunkte (Human in the loop, Multi Agent, Agent X, Agent Y, Context, LLM, Tool) sind live verknüpft und funktionsfähig. Gib einen Prompt ein oder wähle ein Preset, um die Pipeline in Echtzeit zu starten.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pipelineMessages, isRunningPipeline]);

  // Preset prompts to test the pipeline immediately
  const PRESET_PIPELINES = [
    {
      label: "Full-Stack Code Audit & Refactoring",
      prompt: "Analysiere eine React & TypeScript Full-Stack Architektur, prüfe Typensicherheit, Performance-Bottlenecks und erstelle einen refaktorisierten Code-Vorschlag.",
      agentX: "vega",
      agentY: "maze",
    },
    {
      label: "Live Web & Market Intelligence",
      prompt: "Recherchiere aktuelle Entwicklungen zu KI-Agenten-Architekturen und fasse die wichtigsten Erkenntnisse zusammen.",
      agentX: "oracle",
      agentY: "globe",
    },
    {
      label: "Strategische Flotten-Konsens-Analyse",
      prompt: "Erstelle eine strukturierte Roadmap für die Skalierung eines Multi-Agent-Systems mit Human-in-the-Loop Freigaben und Tool-Calling.",
      agentX: "odin",
      agentY: "chronos",
    },
  ];

  // REAL PIPELINE RUNNER
  const handleRunPipeline = async (promptToRun?: string) => {
    const textToSend = promptToRun || currentPrompt;
    if (!textToSend.trim() || isRunningPipeline) return;

    setCurrentPrompt("");
    setIsRunningPipeline(true);
    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: "user" as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setPipelineMessages((prev) => [...prev, userMsg]);

    // Animate through nodes visually while calling the backend
    try {
      // Node 1: Context
      setActiveExecutionNode("context");
      setExecutionStep("Context Node: Ingestiere Vektor-Gedächtnis & System-Kontext...");
      await new Promise((r) => setTimeout(r, 400));

      // Node 2: Multi-Agent & Sub-Agents
      setActiveExecutionNode("multi_agent");
      setExecutionStep(`Multi-Agent Hub: Koordiniere Sub-Agenten (${agentXId.toUpperCase()} + ${agentYId.toUpperCase()})...`);
      await new Promise((r) => setTimeout(r, 450));

      // Node 3: Tools
      if (toolConfig.webSearch || toolConfig.codeSandbox) {
        setActiveExecutionNode("tool");
        setExecutionStep("Tool Node: Führe Google Search Grounding & Code-Sandbox-Validierung aus...");
        await new Promise((r) => setTimeout(r, 400));
      }

      // Node 4: LLM Inference
      setActiveExecutionNode("llm");
      setExecutionStep(`LLM Node: Generiere Inferenz via ${llmConfig.model} (Temp: ${llmConfig.temperature})...`);

      // REAL BACKEND CALL to /api/connections/pipeline
      const customKey = localStorage.getItem("custom_gemini_api_key") || undefined;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey) {
        headers["x-custom-gemini-key"] = customKey;
      }

      const response = await fetch("/api/connections/pipeline", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: textToSend,
          connectedAgents: [orchestratorAgentId, agentXId, agentYId],
          contextConfig,
          llmConfig,
          toolConfig,
          humanInTheLoop: humanLoopConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Fehler in der Connections Pipeline");
      }

      // Node 5: Human in the loop completed
      setActiveExecutionNode("human_loop");
      setExecutionStep("Human in the loop: Antwortpaket erfolgreich synthetisiert.");
      await new Promise((r) => setTimeout(r, 300));

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: "pipeline" as const,
        text: data.response || "Pipeline erfolgreich ausgeführt.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        telemetry: data.telemetry,
        subAgentBreakdown: data.subAgentContributions,
      };

      setPipelineMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: "pipeline" as const,
        text: `⚠️ **Pipeline-Ausführung unterbrochen:**\n${err.message || "Unbekannter Fehler"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setPipelineMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsRunningPipeline(false);
      setActiveExecutionNode(null);
      setExecutionStep("");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full h-full bg-[#09090b] text-zinc-100 flex flex-col font-sans overflow-hidden select-none relative">
      {/* ========================================================================= */}
      {/* TOP HEADER: SYNTAX CONNECTIONS PIPELINE STUDIO                            */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#111114] border-b border-zinc-800/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs sm:text-sm text-zinc-100 tracking-wider">
                SYNTAX <span className="text-purple-500">//</span> CONNECTIONS PIPELINE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950/40 text-purple-400 border border-purple-800/50">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
              Agents Managing → Human in the Loop → Multi Agent → [Context, LLM, Tool]
            </p>
          </div>
        </div>

        {/* Action Presets and Close */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <span className="text-[10px] font-mono text-zinc-400 px-2">Presets:</span>
            {PRESET_PIPELINES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAgentXId(preset.agentX);
                  setAgentYId(preset.agentY);
                  handleRunPipeline(preset.prompt);
                }}
                disabled={isRunningPipeline}
                className="px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-zinc-800/80 hover:bg-red-950/40 hover:text-red-300 text-zinc-300 transition border border-transparent hover:border-red-500/30 disabled:opacity-50 cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition cursor-pointer"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEW: SPLIT CANVAS (DIAGRAM ON TOP/LEFT, CHAT & CONTROL RIGHT)       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ======================================================================= */}
        {/* LEFT / TOP: INTERACTIVE CONNECTIONS DIAGRAM CANVAS                      */}
        {/* ======================================================================= */}
        <div className="flex-1 bg-[#0c0c0e] p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-auto border-b lg:border-b-0 lg:border-r border-zinc-800/80">
          {/* Subtle Grid dots background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Diagram Container */}
          <div className="relative w-full max-w-[850px] min-w-[700px] h-[480px] flex items-center justify-between px-6 select-none">
            {/* SVG Connecting Lines with Clean Modern Directional Flow */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="redLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
                </linearGradient>
                <marker
                  id="arrowheadRed"
                  markerWidth="7"
                  markerHeight="7"
                  refX="5"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 7 3.5, 0 7" fill="#ef4444" />
                </marker>
                <marker
                  id="arrowheadZinc"
                  markerWidth="7"
                  markerHeight="7"
                  refX="5"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 7 3.5, 0 7" fill="#52525b" />
                </marker>
              </defs>

              {/* Line 1: Agents Managing -> Human in the loop */}
              <line
                x1="140"
                y1="240"
                x2="210"
                y2="240"
                stroke="#3f3f46"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Line 2: Human in the loop -> Multi Agent */}
              <line
                x1="320"
                y1="240"
                x2="390"
                y2="240"
                stroke={activeExecutionNode === "multi_agent" ? "#ef4444" : "#52525b"}
                strokeWidth="2"
                markerEnd={activeExecutionNode === "multi_agent" ? "url(#arrowheadRed)" : "url(#arrowheadZinc)"}
                className={activeExecutionNode === "multi_agent" ? "animate-pulse" : ""}
              />

              {/* Line 3: Agent Y -> Multi Agent (Top down) */}
              <line
                x1="460"
                y1="125"
                x2="460"
                y2="185"
                stroke={activeExecutionNode === "multi_agent" ? "#ef4444" : "#52525b"}
                strokeWidth="2"
                markerEnd={activeExecutionNode === "multi_agent" ? "url(#arrowheadRed)" : "url(#arrowheadZinc)"}
              />

              {/* Line 4: Agent X -> Multi Agent (Bottom up) */}
              <line
                x1="460"
                y1="355"
                x2="460"
                y2="295"
                stroke={activeExecutionNode === "multi_agent" ? "#ef4444" : "#52525b"}
                strokeWidth="2"
                markerEnd={activeExecutionNode === "multi_agent" ? "url(#arrowheadRed)" : "url(#arrowheadZinc)"}
              />

              {/* Line 5: Multi Agent -> Context (Branch 1 Top Right) */}
              <path
                d="M 530 240 L 610 240 L 610 100 L 670 100"
                fill="none"
                stroke={activeExecutionNode === "context" ? "#ef4444" : "#52525b"}
                strokeWidth="2"
                markerEnd={activeExecutionNode === "context" ? "url(#arrowheadRed)" : "url(#arrowheadZinc)"}
                className={activeExecutionNode === "context" ? "animate-pulse" : ""}
              />

              {/* Line 6: Multi Agent -> LLM (Branch 2 Center Right) */}
              <line
                x1="530"
                y1="240"
                x2="670"
                y2="240"
                stroke={activeExecutionNode === "llm" ? "#ef4444" : "#52525b"}
                strokeWidth="2"
                markerEnd={activeExecutionNode === "llm" ? "url(#arrowheadRed)" : "url(#arrowheadZinc)"}
                className={activeExecutionNode === "llm" ? "animate-pulse" : ""}
              />

              {/* Line 7: Multi Agent -> Tool (Branch 3 Bottom Right) */}
              <path
                d="M 530 240 L 610 240 L 610 380 L 670 380"
                fill="none"
                stroke={activeExecutionNode === "tool" ? "#ef4444" : "#52525b"}
                strokeWidth="2"
                markerEnd={activeExecutionNode === "tool" ? "url(#arrowheadRed)" : "url(#arrowheadZinc)"}
                className={activeExecutionNode === "tool" ? "animate-pulse" : ""}
              />
            </svg>

            {/* ------------------------------------------------------------- */}
            {/* NODE 1: AGENTS MANAGING (Left)                                */}
            {/* ------------------------------------------------------------- */}
            <div
              onClick={() => setActiveInspectorNode("agents_managing")}
              className={`relative z-10 w-32 h-24 rounded-xl border border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 ${
                activeInspectorNode === "agents_managing"
                  ? "border-red-500 bg-red-950/30 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] scale-105"
                  : "border-zinc-700 bg-zinc-900/90 hover:border-zinc-500 hover:bg-zinc-800/90 text-zinc-300"
              }`}
            >
              <span className="text-center font-medium text-sm leading-tight text-zinc-100">
                Agents
                <br />
                Managing
              </span>
              <span className="mt-1 text-[10px] font-mono text-red-400 font-semibold">9 Cores</span>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* NODE 2: HUMAN IN THE LOOP (Chat & Control Center Loop)        */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div
                onClick={() => setActiveInspectorNode("human_loop")}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  activeExecutionNode === "human_loop"
                    ? "shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-105"
                    : "hover:scale-105"
                }`}
              >
                {/* Circular Flow Arrows */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="70 20"
                    strokeLinecap="round"
                    className="animate-spin-slow origin-center opacity-85"
                  />
                  <polygon points="50,2 56,6 50,10" fill="#ef4444" />
                  <polygon points="50,90 44,94 50,98" fill="#ef4444" />
                </svg>

                {/* Crimson Human Avatar */}
                <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                  <User className="w-7 h-7 fill-current" />
                </div>
              </div>

              <div className="mt-2 text-center">
                <div className="text-xs font-semibold text-zinc-200">Human in</div>
                <div className="text-xs font-semibold text-zinc-200">the loop</div>
                <div className="text-[10px] font-mono text-red-400 mt-0.5 font-medium">Chat & Control</div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CENTER COLUMN: AGENT Y (Top), MULTI AGENT (Center), AGENT X (Bottom) */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 flex flex-col items-center justify-between h-full py-2">
              {/* AGENT Y */}
              <div
                onClick={() => setActiveInspectorNode("agent_y")}
                className={`w-32 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 ${
                  activeInspectorNode === "agent_y"
                    ? "border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] scale-105"
                    : "border-zinc-700 bg-zinc-900/90 hover:border-zinc-500 hover:bg-zinc-800/90"
                }`}
              >
                <span className="text-sm font-medium text-zinc-200">Agent Y</span>
                <span className="text-[11px] font-mono text-red-400 font-bold uppercase mt-0.5">
                  {agentYId}
                </span>
              </div>

              {/* MULTI AGENT (Orchestrator) */}
              <div
                onClick={() => setActiveInspectorNode("multi_agent")}
                className={`w-44 h-24 rounded-xl border flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200 ${
                  activeInspectorNode === "multi_agent" || activeExecutionNode === "multi_agent"
                    ? "border-red-500 bg-zinc-900 shadow-[0_0_25px_rgba(239,68,68,0.3)] scale-105 ring-1 ring-red-500"
                    : "border-zinc-700 bg-zinc-900/95 hover:border-red-500/60 hover:bg-zinc-850"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-white tracking-wide">
                    Multi Agent
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 mt-1">
                  Orchestrator: <span className="text-red-400 font-bold">{orchestratorAgentId.toUpperCase()}</span>
                </span>
              </div>

              {/* AGENT X */}
              <div
                onClick={() => setActiveInspectorNode("agent_x")}
                className={`w-32 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 ${
                  activeInspectorNode === "agent_x"
                    ? "border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] scale-105"
                    : "border-zinc-700 bg-zinc-900/90 hover:border-zinc-500 hover:bg-zinc-800/90"
                }`}
              >
                <span className="text-sm font-medium text-zinc-200">Agent X</span>
                <span className="text-[11px] font-mono text-red-400 font-bold uppercase mt-0.5">
                  {agentXId}
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: 3 OUTPUT NODES (Context, LLM, Tool)             */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 flex flex-col items-center justify-between h-full py-2">
              {/* CONTEXT NODE */}
              <div
                onClick={() => setActiveInspectorNode("context")}
                className={`w-32 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 ${
                  activeInspectorNode === "context" || activeExecutionNode === "context"
                    ? "border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] scale-105"
                    : "border-zinc-700 bg-zinc-900/90 hover:border-zinc-500 hover:bg-zinc-800/90"
                }`}
              >
                <span className="text-sm font-medium text-zinc-200">Context</span>
                <span className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  {contextConfig.memoryItems.length} Memory · {contextConfig.injectedFiles.length} File
                </span>
              </div>

              {/* LLM NODE */}
              <div
                onClick={() => setActiveInspectorNode("llm")}
                className={`w-32 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 ${
                  activeInspectorNode === "llm" || activeExecutionNode === "llm"
                    ? "border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] scale-105"
                    : "border-zinc-700 bg-zinc-900/90 hover:border-zinc-500 hover:bg-zinc-800/90"
                }`}
              >
                <span className="text-sm font-medium text-zinc-200">LLM</span>
                <span className="text-[9px] font-mono text-zinc-400 mt-0.5 truncate max-w-[110px]">
                  {llmConfig.model.replace("gemini-", "")}
                </span>
              </div>

              {/* TOOL NODE */}
              <div
                onClick={() => setActiveInspectorNode("tool")}
                className={`w-32 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 ${
                  activeInspectorNode === "tool" || activeExecutionNode === "tool"
                    ? "border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] scale-105"
                    : "border-zinc-700 bg-zinc-900/90 hover:border-zinc-500 hover:bg-zinc-800/90"
                }`}
              >
                <span className="text-sm font-medium text-zinc-200">Tool</span>
                <span className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  {toolConfig.webSearch ? "Search" : ""} {toolConfig.codeSandbox ? "· Sandbox" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Node Execution Status Banner */}
          {isRunningPipeline && (
            <div className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 border border-red-500/60 flex items-center gap-2.5 text-xs font-mono text-zinc-200 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
              <span>{executionStep}</span>
            </div>
          )}

          <div className="absolute bottom-3 left-4 text-[11px] font-mono text-zinc-500">
            Tipp: Klicke auf einen Knotenpunkt, um Parameter & Agents zu konfigurieren.
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT / BOTTOM: LIVE PIPELINE FEED & HUMAN IN THE LOOP CONTROLLER       */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-[460px] xl:w-[520px] bg-[#111114] flex flex-col border-t lg:border-t-0 shrink-0">
          {/* Feed Header */}
          <div className="px-4 py-3 border-b border-zinc-800 bg-[#141418] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-mono font-bold text-zinc-200">
                HUMAN IN THE LOOP <span className="text-red-500">//</span> TELEMETRY
              </span>
            </div>
            <button
              onClick={() => setPipelineMessages([])}
              className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-mono text-xs">
            {pipelineMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl border ${
                    isUser
                      ? "bg-red-950/20 border-red-800/40 text-zinc-200 ml-4"
                      : "bg-zinc-900 border-zinc-800 text-zinc-200 mr-2"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 pb-1 border-b border-zinc-800">
                    <span className="font-bold text-red-400">
                      {isUser ? "👤 HUMAN IN THE LOOP" : "⚡ MULTI-AGENT SYNTHESIS"}
                    </span>
                    <span className="text-[9px] text-zinc-500">{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed text-zinc-200 text-xs font-sans">
                    {msg.text}
                  </div>

                  {/* Execution Telemetry if available */}
                  {msg.telemetry && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 space-y-1 font-mono">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>⚡ Inferenzzeit: <span className="text-red-400 font-bold">{msg.telemetry.totalDurationMs}ms</span></span>
                        <span>Modell: {msg.telemetry.model}</span>
                      </div>
                      <div className="text-zinc-500">
                        Beteiligte Cores: {msg.telemetry.connectedAgents?.join(", ")}
                      </div>
                    </div>
                  )}

                  {/* Copy Button */}
                  {!isUser && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-red-400" />
                            <span className="text-red-400">Kopiert</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Kopieren</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Input Box */}
          <div className="p-3 bg-[#0d0d10] border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleRunPipeline();
                  }
                }}
                placeholder="Mission / Prompt an die Multi-Agent Pipeline senden..."
                disabled={isRunningPipeline}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono disabled:opacity-50"
              />
              <button
                onClick={() => handleRunPipeline()}
                disabled={!currentPrompt.trim() || isRunningPipeline}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isRunningPipeline ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>RUN</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NODE CONFIGURATION INSPECTOR MODAL / SLIDEOVER                            */}
      {/* ========================================================================= */}
      {activeInspectorNode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141418] border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-100 font-mono font-bold text-sm">
                <Settings2 className="w-4 h-4 text-red-500" />
                <span>NODE INSPECTOR: {activeInspectorNode.toUpperCase().replace("_", " ")}</span>
              </div>
              <button
                onClick={() => setActiveInspectorNode(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-mono">
              {/* INSPECTOR: AGENT X / AGENT Y */}
              {(activeInspectorNode === "agent_x" || activeInspectorNode === "agent_y") && (
                <div className="space-y-3">
                  <p className="text-zinc-300">
                    Wähle welcher Flotten-Agent in diesen Slot gesteckt werden soll:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "maze", name: "SYNTAX", desc: "Orchestrierung & Code" },
                      { id: "vega", name: "VEGA", desc: "Daten & Code-Audit" },
                      { id: "oracle", name: "ORACLE", desc: "Markt & Finance" },
                      { id: "globe", name: "GLOBE", desc: "Deep Web Recherche" },
                      { id: "odin", name: "ODIN", desc: "Taktik & Security" },
                      { id: "pulse", name: "PULSE", desc: "Viral & Media" },
                      { id: "chronos", name: "CHRONOS", desc: "Zeit & Effizienz" },
                      { id: "neo", name: "NEO", desc: "Vision & Boss Core" },
                    ].map((item) => {
                      const currentVal = activeInspectorNode === "agent_x" ? agentXId : agentYId;
                      const isChosen = currentVal === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (activeInspectorNode === "agent_x") setAgentXId(item.id);
                            else setAgentYId(item.id);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            isChosen
                              ? "bg-red-950/40 border-red-500 text-white"
                              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          <div className="font-bold text-red-400">{item.name}</div>
                          <div className="text-[10px] text-zinc-400">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INSPECTOR: CONTEXT */}
              {activeInspectorNode === "context" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">
                      Langzeit-Gedächtnis (Memory Items):
                    </label>
                    {contextConfig.memoryItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1.5">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...contextConfig.memoryItems];
                            updated[idx] = e.target.value;
                            setContextConfig({ ...contextConfig, memoryItems: updated });
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                        />
                        <button
                          onClick={() => {
                            const updated = contextConfig.memoryItems.filter((_, i) => i !== idx);
                            setContextConfig({ ...contextConfig, memoryItems: updated });
                          }}
                          className="p-1.5 rounded text-red-400 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setContextConfig({
                          ...contextConfig,
                          memoryItems: [...contextConfig.memoryItems, "Neue Gedächtnis-Regel"],
                        });
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-[10px] mt-1 cursor-pointer"
                    >
                      + Neues Gedächtnis-Element
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="text-zinc-300 font-bold block mb-1">
                      Projekt-Direktive & Custom Context:
                    </label>
                    <textarea
                      value={contextConfig.customContext}
                      onChange={(e) =>
                        setContextConfig({ ...contextConfig, customContext: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* INSPECTOR: LLM */}
              {activeInspectorNode === "llm" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">Modell Engine:</label>
                    <select
                      value={llmConfig.model}
                      onChange={(e) => setLlmConfig({ ...llmConfig, model: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra-Fast)</option>
                      <option value="gemini-3.7-flash">Gemini 3.7 Flash (Deep Reasoning)</option>
                      <option value="gemini-flash-latest">Gemini Flash Latest</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 mb-1">
                      <span className="font-bold">Temperatur:</span>
                      <span className="text-red-400">{llmConfig.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={llmConfig.temperature}
                      onChange={(e) =>
                        setLlmConfig({ ...llmConfig, temperature: parseFloat(e.target.value) })
                      }
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>
              )}

              {/* INSPECTOR: TOOLS */}
              {activeInspectorNode === "tool" && (
                <div className="space-y-2">
                  <label className="text-zinc-300 font-bold block mb-2">Aktive Tools:</label>
                  {[
                    { key: "webSearch", label: "Google Live Web Search & Grounding" },
                    { key: "codeSandbox", label: "TypeScript Code Sandbox Compiler" },
                    { key: "databaseQuery", label: "Vector Database Context Retriever" },
                    { key: "terminalRunner", label: "Terminal & Shell Execution" },
                  ].map((t) => (
                    <label
                      key={t.key}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
                    >
                      <span className="text-zinc-200">{t.label}</span>
                      <input
                        type="checkbox"
                        checked={(toolConfig as any)[t.key]}
                        onChange={(e) =>
                          setToolConfig({ ...toolConfig, [t.key]: e.target.checked })
                        }
                        className="w-4 h-4 accent-red-500"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* INSPECTOR: AGENTS MANAGING / MULTI AGENT / HUMAN IN THE LOOP */}
              {(activeInspectorNode === "agents_managing" ||
                activeInspectorNode === "multi_agent" ||
                activeInspectorNode === "human_loop") && (
                <div className="space-y-3">
                  <p className="text-zinc-300">
                    Knoten-Status: <span className="text-red-400 font-bold">ONLINE & BEREIT</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Dieser Knotenpunkt steuert die Human-in-the-Loop Feedback-Schleife und die
                    Master-Orchestrierung zwischen den verbundenen Sub-Agenten.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setActiveInspectorNode(null)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Konfiguration übernehmen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
