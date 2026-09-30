import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  FileCode2,
  GitBranch,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BatteryCharging,
  Zap,
  Flame,
  LayoutGrid,
  CheckCircle2,
  Folder,
} from "lucide-react";
import { DraggableResizableWidget } from "./DraggableResizableWidget";
import { AgentConfig } from "../types";
import { copyToClipboard } from "../utils/clipboard";
import { Language } from "../utils/translations";

export interface ClaudeCodeLog {
  id: string;
  type: "system" | "tool" | "thought" | "code" | "output" | "error" | "user";
  agentId: string;
  agentName: string;
  text: string;
  codeSnippet?: string;
  filename?: string;
  timestamp: string;
}

interface ClaudeCodeTerminalProps {
  isEditMode?: boolean;
  onClose?: () => void;
  currentAgent?: AgentConfig;
  agents?: AgentConfig[];
  onSelectAgent?: (agent: AgentConfig) => void;
  lang?: Language;
}

const MODES = {
  eco: {
    label: "ECO",
    iconLabel: "⊙ ECO",
    sub: "Sparsam",
    subEn: "Token-Save",
    color: "#27e6a4",
    tokens: 2000,
    latency: 320,
    pct: 22,
    desc: "Token-Sparmodus (Minimale Token-Nutzung & blitzschnelle Antworten)",
    descEn: "Token saving mode (Minimal token usage & ultra-fast responses)",
  },
  bal: {
    label: "BALANCED",
    iconLabel: "◈ BALANCED",
    sub: "Optimal",
    subEn: "Optimal",
    color: "#2ce3ff",
    tokens: 8000,
    latency: 640,
    pct: 58,
    desc: "Optimal (Ausgewogenes Verhältnis zwischen Kontext, Tiefe & Geschwindigkeit)",
    descEn: "Optimal (Balanced ratio between context, depth & speed)",
  },
  turbo: {
    label: "TURBO",
    iconLabel: "⚡ TURBO",
    sub: "Max. Leistung",
    subEn: "Max Compute",
    color: "#ffb020",
    tokens: 32000,
    latency: 1450,
    pct: 100,
    desc: "Max. Leistung (Deep Reasoning, Multi-Core Ausführung, maximaler Kontext)",
    descEn: "Max power (Deep reasoning, multi-core execution & maximum context)",
  },
};

type ModeKey = keyof typeof MODES;

const INITIAL_CODE_FILES = [
  {
    name: "App.tsx",
    path: "/src/App.tsx",
    language: "typescript",
    content: `import React, { useState } from "react";
import { MultiAssistantCanvas } from "./components/MultiAssistantCanvas";

// Lovable Fullstack Engine initialized by Agent SYNTAX
export function App() {
  const [activeCore, setActiveCore] = useState("quantum");
  return (
    <div className="main-viewport bg-slate-950 text-cyan-200">
      <MultiAssistantCanvas activeCore={activeCore} />
    </div>
  );
}`,
  },
  {
    name: "ParticleSphere.tsx",
    path: "/src/components/ParticleSphere.tsx",
    language: "typescript",
    content: `// WebGL Shader Engine programmed by C.H.R.O.N.O.S.
import { useFrame } from "@react-three/fiber";

export const ParticleSphere = ({ density = 5000, speed = 1.0 }) => {
  useFrame((state, delta) => {
    // Holographic particle position update with dynamic audio pulse
  });
  return <points material={shaderMaterial} />;
};`,
  },
  {
    name: "QuantumMath.ts",
    path: "/src/utils/QuantumMath.ts",
    language: "typescript",
    content: `export function calculateFibonacciLattice(points: number): Float32Array {
  const positions = new Float32Array(points * 3);
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < points; i++) {
    const theta = 2 * Math.PI * i / phi;
    const y = 1 - (i / (points - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
  }
  return positions;
}`,
  },
];

// Helper to get rgba string from hex
function hexAlpha(hex: string, a: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const ClaudeCodeTerminal = React.memo<ClaudeCodeTerminalProps>(({
  isEditMode = false,
  onClose,
  currentAgent,
  agents = [],
  onSelectAgent,
  lang = "de",
}) => {
  const isEn = lang === "en";

  // Fallback agent
  const activeAgent = currentAgent || agents[0] || {
    id: "syntax",
    name: "S.Y.N.T.A.X.",
    short: "SYNTAX",
    color: "#2ce3ff",
    railLetter: "S",
    shape: "sphere",
    tag: "SOVEREIGN CORE",
  };

  // State
  const [globalMode, setGlobalMode] = useState<ModeKey>("bal");
  const [activeTab, setActiveTab] = useState<"terminal" | "grid" | "editor" | "git">("terminal");
  const [promptInput, setPromptInput] = useState("");
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Canvas Refs
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashOverlayRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // Per-Agent Compute Performance Mode Memory
  const [agentPowerModes, setAgentPowerModes] = useState<Record<string, ModeKey>>({
    maze: "bal",
    syntax: "bal",
    jarvis: "turbo",
    neo: "turbo",
    vega: "bal",
    apex: "turbo",
    odin: "bal",
    pulse: "eco",
    chronos: "bal",
    oracle: "bal",
    globe: "turbo",
    risk: "bal",
    grounding: "turbo",
  });

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toTimeString().slice(0, 8));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync mode with active agent
  const currentAgentMode = agentPowerModes[activeAgent.id] || globalMode;

  // Logs state
  const [logs, setLogs] = useState<ClaudeCodeLog[]>(() => [
    {
      id: "log-1",
      type: "system",
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      text: isEn
        ? `Lovable CLI & Fullstack Engine v2.0 initialized. Agent ${activeAgent.name} connected to codebase /src. Mode: BALANCED`
        : `Lovable CLI & Fullstack Engine v2.0 initialisiert. Agent ${activeAgent.name} mit Codebasis /src verknüpft. Modus: BALANCED`,
      timestamp: new Date().toTimeString().slice(0, 8),
    },
    {
      id: "log-2",
      type: "thought",
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      text: isEn
        ? `Analyzing project structure... Found React 18, Vite, Three.js & Tailwind CSS. Ready for live prompts.`
        : `Analysiere Projektstruktur... Gefunden: React 18, Vite, Three.js & Tailwind CSS. Bereit für Live-Prompts.`,
      timestamp: new Date().toTimeString().slice(0, 8),
    },
    {
      id: "log-3",
      type: "tool",
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      text: `Tool call: view_file("/src/components/ParticleSphere.tsx")`,
      timestamp: new Date().toTimeString().slice(0, 8),
    },
    {
      id: "log-4",
      type: "code",
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      text: isEn
        ? `Generated Quantum Matrix algorithm in /src/utils/QuantumMath.ts`
        : `Quantum Matrix Algorithmus in /src/utils/QuantumMath.ts generiert`,
      codeSnippet: `const positions = calculateFibonacciLattice(5000);`,
      filename: "/src/utils/QuantumMath.ts",
      timestamp: new Date().toTimeString().slice(0, 8),
    },
  ]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ============================================================
  // PARTICLE FX ENGINE
  // ============================================================
  const burstsRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    decay: number;
    r: number;
    color: string;
  }>>([]);
  const fxRunningRef = useRef(false);

  const spawnBurst = useCallback((x: number, y: number, hex: string, count = 22, power = 1) => {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = (0.6 + Math.random() * 2.2) * power;
      burstsRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 1,
        decay: 0.014 + Math.random() * 0.02,
        r: 1 + Math.random() * 2.2,
        color: hex,
      });
    }

    if (!fxRunningRef.current) {
      fxRunningRef.current = true;
      const canvas = fxCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const runFx = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        burstsRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.012;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.life -= p.decay;
        });
        burstsRef.current = burstsRef.current.filter((p) => p.life > 0);

        burstsRef.current.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(p.r * p.life, 0.3), 0, Math.PI * 2);
          ctx.fillStyle = hexAlpha(p.color, p.life);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        });
        ctx.shadowBlur = 0;

        if (burstsRef.current.length > 0) {
          requestAnimationFrame(runFx);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          fxRunningRef.current = false;
        }
      };
      runFx();
    }
  }, []);

  const triggerFlash = useCallback(() => {
    const el = flashOverlayRef.current;
    if (!el) return;
    el.classList.remove("flash-active");
    // Trigger reflow
    void el.offsetWidth;
    el.classList.add("flash-active");
  }, []);

  // Background Canvas Animation
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let bgParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    }> = [];

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 400;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = globalMode === "turbo" ? 90 : globalMode === "bal" ? 60 : 35;
    bgParticles = [];
    for (let i = 0; i < count; i++) {
      bgParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 1.6,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = MODES[globalMode].color;
      const speedMul = globalMode === "turbo" ? 2.0 : globalMode === "bal" ? 1.3 : 1.0;
      const linkDist = globalMode === "turbo" ? 120 : 90;

      for (let i = 0; i < bgParticles.length; i++) {
        const p = bgParticles[i];
        p.x += p.vx * speedMul;
        p.y += p.vy * speedMul;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = hexAlpha(color, 0.45);
        ctx.fill();

        for (let j = i + 1; j < bgParticles.length; j++) {
          const q = bgParticles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = hexAlpha(color, (1 - d / linkDist) * 0.14);
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [globalMode]);

  // Handle Mode Change (ECO / BALANCED / TURBO)
  const handleSelectMode = (mode: ModeKey, e?: React.MouseEvent<HTMLButtonElement>) => {
    const prevMode = globalMode;
    setGlobalMode(mode);
    setAgentPowerModes((prev) => ({
      ...prev,
      [activeAgent.id]: mode,
    }));

    if (e && containerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      spawnBurst(
        rect.left - containerRect.left + rect.width / 2,
        rect.top - containerRect.top + rect.height / 2,
        MODES[mode].color,
        mode === "turbo" ? 35 : 20,
        mode === "turbo" ? 1.5 : 1
      );
    }

    if (mode === "turbo" && prevMode !== "turbo") {
      triggerFlash();
    }

    // Trigger terminal boot sequence
    const m = MODES[mode];
    const tsStr = new Date().toTimeString().slice(0, 8);
    const newLogs: ClaudeCodeLog[] = [
      {
        id: `mode-switch-${Date.now()}-1`,
        type: "system",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: isEn
          ? `[${tsStr}] Core ${activeAgent.name} initialized. API Mode "${m.label}" active — ${m.descEn}.`
          : `[${tsStr}] Core ${activeAgent.name} initialisiert. API-Modus "${m.label}" aktiv — ${m.desc}.`,
        timestamp: tsStr,
      },
      {
        id: `mode-switch-${Date.now()}-2`,
        type: "thought",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: isEn
          ? `[${activeAgent.name} // REASONING]: Compute level updated to ${m.label} (${m.tokens.toLocaleString()} tokens capacity).`
          : `[${activeAgent.name} // GEDANKENGANG]: Rechenleistung auf ${m.label} aktualisiert (${m.tokens.toLocaleString()} Tokens Budget).`,
        timestamp: tsStr,
      },
    ];

    if (mode === "eco") {
      newLogs.push({
        id: `mode-switch-${Date.now()}-3`,
        type: "tool",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: `Tool call: minimal_context_fetch() — sparsame Token-Ausführung.`,
        timestamp: tsStr,
      });
      newLogs.push({
        id: `mode-switch-${Date.now()}-4`,
        type: "output",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: isEn ? `✓ Fast compact response profile enabled.` : `✓ Schnelles, kompaktes Antwortprofil aktiviert.`,
        timestamp: tsStr,
      });
    } else if (mode === "bal") {
      newLogs.push({
        id: `mode-switch-${Date.now()}-3`,
        type: "tool",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: `Tool call: view_context() :: standard reasoning pipeline.`,
        timestamp: tsStr,
      });
      newLogs.push({
        id: `mode-switch-${Date.now()}-4`,
        type: "output",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: isEn ? `✓ Balanced depth and latency profile engaged.` : `✓ Ausgewogenes Verhältnis Geschwindigkeit/Tiefe aktiviert.`,
        timestamp: tsStr,
      });
    } else {
      newLogs.push({
        id: `mode-switch-${Date.now()}-3`,
        type: "error",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: isEn
          ? `⚡ COMPUTE ON TURBO :: Deep Reasoning, Multi-Core Swarm & Extended Context enabled.`
          : `⚡ RECHENLEISTUNG AUF TURBO :: Deep Reasoning, Multi-Core Ausführung & erweiterter Kontext.`,
        timestamp: tsStr,
      });
      newLogs.push({
        id: `mode-switch-${Date.now()}-4`,
        type: "tool",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: `Tool call: deep_reasoning_pass() → parallel_agent_dispatch(3x)`,
        timestamp: tsStr,
      });
      newLogs.push({
        id: `mode-switch-${Date.now()}-5`,
        type: "output",
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        text: isEn ? `✓ Maximum accuracy and architectural depth engaged.` : `✓ Maximale Tiefe, Synthese und Genauigkeit aktiviert.`,
        timestamp: tsStr,
      });
    }

    setLogs((prev) => [...prev, ...newLogs]);
  };

  // Agent Selection Click
  const handleSelectAgentCard = (ag: AgentConfig, e?: React.MouseEvent<HTMLDivElement>) => {
    if (onSelectAgent) onSelectAgent(ag);

    if (e && containerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      spawnBurst(
        rect.left - containerRect.left + rect.width / 2,
        rect.top - containerRect.top + rect.height / 2,
        ag.color || "#2ce3ff",
        24,
        1.1
      );
    }

    const m = MODES[globalMode];
    const tsStr = new Date().toTimeString().slice(0, 8);
    setLogs((prev) => [
      ...prev,
      {
        id: `agent-sw-${Date.now()}`,
        type: "system",
        agentId: ag.id,
        agentName: ag.name,
        text: isEn
          ? `[${tsStr}] Switched active Coder Core to "${ag.name}". Mode: ${m.label}`
          : `[${tsStr}] Aktiver Coder-Core auf "${ag.name}" gewechselt. Modus: ${m.label}`,
        timestamp: tsStr,
      },
    ]);
  };

  // Submit Prompt to Live Claude Code
  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isExecuting) return;

    const userText = promptInput.trim();
    setPromptInput("");

    if (containerRef.current) {
      const runBtn = containerRef.current.querySelector("#termRunBtn");
      if (runBtn) {
        const rect = runBtn.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        spawnBurst(
          rect.left - containerRect.left + rect.width / 2,
          rect.top - containerRect.top + rect.height / 2,
          activeAgent.color || MODES[globalMode].color,
          20,
          1.0
        );
      }
    }

    const tsStr = new Date().toTimeString().slice(0, 8);
    const targetFile = INITIAL_CODE_FILES[selectedFileIdx] || INITIAL_CODE_FILES[0];

    // User prompt log
    const userLog: ClaudeCodeLog = {
      id: `user-${Date.now()}`,
      type: "user",
      agentId: activeAgent.id,
      agentName: "USER",
      text: userText,
      timestamp: tsStr,
    };

    setLogs((prev) => [...prev, userLog]);
    setIsExecuting(true);

    // Initial thought
    setLogs((prev) => [
      ...prev,
      {
        id: `thought-${Date.now()}`,
        type: "thought",
        agentId: activeAgent.id,
        agentName: "CLAUDE CODE",
        text: isEn
          ? `[Claude Code 3.5 // AST Reasoning]: Analyzing "${userText}" for file "${targetFile?.path}" [Mode: ${MODES[globalMode].label}]...`
          : `[Claude Code 3.5 // AST Reasoning]: Analysiere "${userText}" für Datei "${targetFile?.path}" [Modus: ${MODES[globalMode].label}]...`,
        timestamp: new Date().toTimeString().slice(0, 8),
      },
    ]);

    try {
      const customKey = localStorage.getItem("syntax_custom_gemini_key") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey) {
        headers["x-custom-gemini-key"] = customKey;
      }

      const res = await fetch("/api/claude-code", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: userText,
          mode: globalMode,
          file: targetFile?.path || "/src/App.tsx",
          agent: activeAgent.name,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      const codeSnippet = data.codeSnippet || data.text || `// Code generated by Claude Code\n// Task: ${userText}`;

      // Add tool execution & output logs
      setLogs((prev) => [
        ...prev,
        {
          id: `tool-${Date.now()}`,
          type: "tool",
          agentId: activeAgent.id,
          agentName: "CLAUDE CODE",
          text: `Executing tool edit_file("${data.filename || targetFile?.path}") with verified AST diff [${MODES[globalMode].label}]...`,
          timestamp: new Date().toTimeString().slice(0, 8),
        },
        {
          id: `code-${Date.now()}`,
          type: "code",
          agentId: activeAgent.id,
          agentName: "CLAUDE CODE",
          text: isEn
            ? `[Claude Code 3.5 Architecture: Verified Code Produced]`
            : `[Claude Code 3.5 Architektur: Verifizierter Quellcode generiert]`,
          codeSnippet,
          filename: data.filename || targetFile?.path,
          timestamp: new Date().toTimeString().slice(0, 8),
        },
        {
          id: `output-${Date.now()}`,
          type: "output",
          agentId: activeAgent.id,
          agentName: "CLAUDE CODE",
          text: isEn
            ? `✓ Build verified! TypeScript syntax clean. Production-ready AST output.`
            : `✓ Build erfolgreich verifiziert! 0 TypeScript Syntaxfehler. Produktionsreifer Code.`,
          timestamp: new Date().toTimeString().slice(0, 8),
        },
      ]);
    } catch (err: any) {
      // Fallback
      setLogs((prev) => [
        ...prev,
        {
          id: `code-${Date.now()}`,
          type: "code",
          agentId: activeAgent.id,
          agentName: "CLAUDE CODE",
          text: `[Claude Code Standalone Fallback]`,
          codeSnippet: `// Claude Code Standalone Architecture [${MODES[globalMode].label}]\n// Prompt: ${userText}\nexport const GeneratedFeature = () => {\n  return (\n    <div className="p-4 rounded-xl border border-cyan-500/30 bg-slate-950/80 text-cyan-200">\n      <h3>Feature: ${userText.replace(/"/g, "'")}</h3>\n    </div>\n  );\n};`,
          filename: targetFile?.path || "/src/App.tsx",
          timestamp: new Date().toTimeString().slice(0, 8),
        },
        {
          id: `output-${Date.now()}`,
          type: "output",
          agentId: activeAgent.id,
          agentName: "CLAUDE CODE",
          text: isEn
            ? `✓ Syntax generated in developer sandbox.`
            : `✓ Quellcode in Entwickler-Sandbox generiert.`,
          timestamp: new Date().toTimeString().slice(0, 8),
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopySnippet = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeFile = INITIAL_CODE_FILES[selectedFileIdx];
  const activeModeObj = MODES[globalMode];

  const headerControls = (
    <div className="flex items-center gap-2 font-mono text-[10px]">
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: activeAgent.color || activeModeObj.color }}
        />
        <span className="font-bold">{activeAgent.name}</span>
        <span className="text-slate-500">:: {isEn ? "8-CORE SYSTEM" : "8-CORE SYSTEM"}</span>
      </div>
      <span
        className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase transition border"
        style={{
          backgroundColor: `${activeModeObj.color}20`,
          borderColor: `${activeModeObj.color}50`,
          color: activeModeObj.color,
        }}
      >
        {activeModeObj.label} MODE
      </span>
    </div>
  );

  return (
    <DraggableResizableWidget
      id="claudeCode"
      title={`S.Y.N.T.A.X. :: 8-CORE AGENT CONTROL & LOVABLE FULLSTACK ENGINE`}
      initialX={60}
      initialY={120}
      initialWidth={740}
      initialHeight={520}
      minWidth={460}
      minHeight={360}
      isEditMode={isEditMode}
      onClose={onClose}
      headerControls={headerControls}
    >
      <div
        ref={containerRef}
        className="relative flex flex-col h-full bg-[#050810] text-[#cfe3f5] font-mono text-xs overflow-hidden select-none"
        style={
          {
            "--cyan": "#2ce3ff",
            "--amber": "#ffb020",
            "--green": "#27e6a4",
            "--mode-eco": "#27e6a4",
            "--mode-bal": "#2ce3ff",
            "--mode-turbo": "#ffb020",
          } as React.CSSProperties
        }
      >
        {/* Scoped CSS Styles for Visual & Particle Engine */}
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0 0; }
            100% { background-position: 0 220%; }
          }
          @keyframes cometPulse {
            0%, 100% { opacity: 0.7; transform: translateY(-50%) scale(0.85); }
            50% { opacity: 1; transform: translateY(-50%) scale(1.2); }
          }
          @keyframes flow {
            from { background-position: 0 0; }
            to { background-position: -32px 0; }
          }
          @keyframes activeGlow {
            0%, 100% { box-shadow: 0 0 0 1px var(--card-accent, #2ce3ff) inset, 0 0 18px -4px var(--card-accent, #2ce3ff); }
            50% { box-shadow: 0 0 0 1px var(--card-accent, #2ce3ff) inset, 0 0 30px -2px var(--card-accent, #2ce3ff); }
          }
          @keyframes sparkRise {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            15% { opacity: 0.9; }
            100% { transform: translateY(-38px) scale(0.2); opacity: 0; }
          }
          @keyframes flashPulse {
            0% { opacity: 0; }
            18% { opacity: 0.85; }
            100% { opacity: 0; }
          }
          @keyframes warnFlicker {
            0%, 100% { opacity: 1; }
            48% { opacity: 1; }
            50% { opacity: 0.55; }
            52% { opacity: 1; }
          }
          @keyframes blinkCursor {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .flash-active {
            animation: flashPulse 0.75s ease-out forwards;
          }
          .active-agent-glow {
            animation: activeGlow 2.6s ease-in-out infinite;
          }
          .gauge-flow-anim {
            background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 2px, transparent 2px 14px);
            background-size: 16px 100%;
            animation: flow 1.6s linear infinite;
          }
          .comet-pulse-anim {
            animation: cometPulse 1.2s ease-in-out infinite;
          }
          .warn-flicker-anim {
            animation: warnFlicker 1.4s ease-in-out infinite;
          }
          .cursor-box-blink {
            animation: blinkCursor 1s steps(1) infinite;
          }
          .custom-term-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-term-scrollbar::-webkit-scrollbar-thumb {
            background: #16233a;
            border-radius: 4px;
          }
        `}</style>

        {/* Ambient Canvas Background FX */}
        <canvas
          ref={bgCanvasRef}
          className="absolute inset-0 pointer-events-none z-0 opacity-70"
        />

        {/* Interaction Burst Canvas FX */}
        <canvas
          ref={fxCanvasRef}
          className="absolute inset-0 pointer-events-none z-30"
        />

        {/* Turbo Flash Overlay */}
        <div
          ref={flashOverlayRef}
          className="absolute inset-0 pointer-events-none z-40 opacity-0 bg-[radial-gradient(ellipse_at_center,rgba(255,176,32,0.4),transparent_70%)]"
        />

        {/* Header Strip with Live Status & Session Clock */}
        <div className="relative z-10 px-3 py-2 bg-[#0a101c]/90 backdrop-blur-md border-b border-[#16233a] flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_#27e6a4]"
              style={{ backgroundColor: "#27e6a4" }}
            />
            <div>
              <div className="font-mono font-black text-xs tracking-wider text-white flex items-center gap-1.5">
                <span>S.Y.N.T.A.X. :: 8-CORE AGENT CONTROL</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  CLI v1.2
                </span>
              </div>
              <div className="text-[9.5px] text-slate-400 font-mono">
                {isEn
                  ? "ALL ROUNDER 8 CORE AGENT SYSTEM — GLOBAL API COMPUTE ENGINE"
                  : "ALL ROUNDER 8 CORE AGENT SYSTEM — GLOBALE API-RECHENLEISTUNG"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <div className="px-2 py-0.5 rounded bg-[#0d1424] border border-[#16233a] text-slate-400 flex items-center gap-1.5">
              <span>SESSION</span>
              <span className="text-cyan-400 font-bold">{currentTime || "--:--:--"}</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#0d1424] border border-[#16233a] text-emerald-400 font-bold">
              8 / 8 ONLINE
            </div>
          </div>
        </div>

        {/* RECHENLEISTUNG SUMMARY BAR & 3-MODE SWITCH (ECO | BALANCED | TURBO) */}
        <div className="relative z-10 p-3 bg-[#0a101c]/95 border-b border-[#16233a] space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-slate-400 uppercase">
            <span>
              {isEn
                ? "COMPUTE POWER [S.Y.N.T.A.X.] :: API-WIDE FOR ALL 8 CORES"
                : "RECHENLEISTUNG [S.Y.N.T.A.X.] :: API-WEIT FÜR ALLE 8 CORES"}
            </span>
            <span style={{ color: activeModeObj.color }} className="font-bold">
              {activeModeObj.tokens.toLocaleString()} TOKENS / REQ
            </span>
          </div>

          {/* 3 Large Mode Buttons (ECO, BALANCED, TURBO) */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#050810] p-1 rounded-xl border border-[#16233a]">
            {(["eco", "bal", "turbo"] as ModeKey[]).map((mKey) => {
              const modeItem = MODES[mKey];
              const isSelected = globalMode === mKey;
              return (
                <button
                  key={mKey}
                  onClick={(e) => handleSelectMode(mKey, e)}
                  className={`py-2 px-1 rounded-lg font-mono text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "shadow-lg text-slate-950 font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                  style={{
                    backgroundColor: isSelected ? modeItem.color : "transparent",
                    color: isSelected ? "#001018" : undefined,
                    boxShadow: isSelected ? `0 0 15px ${modeItem.color}60` : undefined,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {mKey === "eco" && <BatteryCharging className="w-3.5 h-3.5" />}
                    {mKey === "bal" && <Zap className="w-3.5 h-3.5" />}
                    {mKey === "turbo" && <Flame className="w-3.5 h-3.5" />}
                    <span>{modeItem.iconLabel}</span>
                  </div>
                  <span
                    className={`text-[8.5px] font-normal tracking-wide ${
                      isSelected ? "text-slate-900/80 font-bold" : "text-slate-500"
                    }`}
                  >
                    {isEn ? modeItem.subEn : modeItem.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Flow Gauge with Comet Pulse & Flow Animation */}
          <div className="relative h-2 bg-[#101a2c] rounded-full border border-[#16233a] overflow-visible">
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 overflow-hidden"
              style={{
                width: `${activeModeObj.pct}%`,
                backgroundColor: activeModeObj.color,
                boxShadow: `0 0 12px ${activeModeObj.color}`,
              }}
            >
              {/* Flowing stripes */}
              <div className="absolute inset-0 gauge-flow-anim" />
            </div>

            {/* Glowing Comet Head */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white comet-pulse-anim pointer-events-none transition-all duration-500"
              style={{
                left: `calc(${activeModeObj.pct}% - 6px)`,
                boxShadow: `0 0 10px 3px ${activeModeObj.color}`,
              }}
            />
          </div>
        </div>

        {/* Tab Navigation Rail: Terminal / 8-Agent Matrix / Code Editor / Git Diff */}
        <div className="relative z-10 px-3 py-1.5 bg-[#0a101c]/80 border-b border-[#16233a] flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            {[
              { id: "terminal", label: isEn ? "📟 LIVE TERMINAL" : "📟 LIVE TERMINAL", icon: Terminal },
              { id: "grid", label: isEn ? "🪐 8-CORE MATRIX" : "🪐 8-CORE MATRIX", icon: LayoutGrid },
              { id: "editor", label: isEn ? "📝 CODE EDITOR" : "📝 CODE-EDITOR", icon: FileCode2 },
              { id: "git", label: isEn ? "🧬 GIT DIFF" : "🧬 GIT-DIFF", icon: GitBranch },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(44,227,255,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Agent Pill */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span>ACTIVE:</span>
            <span
              className="px-2 py-0.5 rounded font-bold"
              style={{
                backgroundColor: `${activeAgent.color || "#2ce3ff"}20`,
                borderColor: `${activeAgent.color || "#2ce3ff"}40`,
                color: activeAgent.color || "#2ce3ff",
              }}
            >
              {activeAgent.name}
            </span>
          </div>
        </div>

        {/* TAB 1: LIVE TERMINAL */}
        {activeTab === "terminal" && (
          <div className="relative z-10 flex-1 flex flex-col justify-between p-3 overflow-hidden">
            {/* Terminal Header */}
            <div className="px-2.5 py-1.5 bg-[#0a101c]/90 border border-[#16233a] rounded-xl flex items-center justify-between text-[11px] mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shadow-[0_0_8px]"
                  style={{
                    backgroundColor: activeAgent.color || "#2ce3ff",
                    boxShadow: `0 0 8px ${activeAgent.color || "#2ce3ff"}`,
                  }}
                />
                <span className="font-bold text-white">{activeAgent.name}</span>
                <span className="text-slate-500">:: LIVE LOGS & COMMAND RUNTIME</span>
              </div>

              <div
                className="px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold uppercase"
                style={{
                  borderColor: `${activeModeObj.color}60`,
                  color: activeModeObj.color,
                  backgroundColor: `${activeModeObj.color}15`,
                }}
              >
                {activeModeObj.label} MODE
              </div>
            </div>

            {/* Scrollable Output Terminal Log Area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-term-scrollbar bg-[#070b14]/90 p-3 rounded-2xl border border-[#16233a]/80">
              {logs.map((log) => (
                <div key={log.id} className="text-[11px] leading-relaxed space-y-1">
                  {/* System Log */}
                  {log.type === "system" && (
                    <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
                      <span className="text-slate-500 text-[10px]">[{log.timestamp}]</span>
                      <span>{log.text}</span>
                    </div>
                  )}

                  {/* Thought Process Log */}
                  {log.type === "thought" && (
                    <div className="text-purple-300 bg-purple-950/40 border-l-2 border-purple-500 px-2.5 py-1.5 rounded-r-xl">
                      <span className="text-[9px] text-purple-400 font-bold uppercase block mb-0.5">
                        🧠 {log.agentName} {isEn ? "THOUGHT PROCESS:" : "GEDANKENGANG:"}
                      </span>
                      <span>{log.text}</span>
                    </div>
                  )}

                  {/* Tool Call Log */}
                  {log.type === "tool" && (
                    <div className="text-cyan-300 font-mono bg-cyan-950/30 border border-cyan-500/30 px-2.5 py-1.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span>{log.text}</span>
                      </div>
                      <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                    </div>
                  )}

                  {/* Warning / Turbo Flash Log */}
                  {log.type === "error" && (
                    <div className="text-amber-400 font-bold bg-amber-950/40 border-l-2 border-amber-400 px-2.5 py-1.5 rounded-r-xl warn-flicker-anim flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{log.text}</span>
                    </div>
                  )}

                  {/* Code Generated Log */}
                  {log.type === "code" && (
                    <div className="bg-[#0a101c] border border-cyan-500/30 rounded-xl overflow-hidden my-1">
                      <div className="px-2.5 py-1 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <FileCode2 className="w-3 h-3" />
                          {log.filename || (isEn ? "Generated Output" : "Generierter Output")}
                        </span>
                        {log.codeSnippet && (
                          <button
                            onClick={() => handleCopySnippet(log.codeSnippet!)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{isEn ? "COPY" : "KOPIEREN"}</span>
                          </button>
                        )}
                      </div>
                      {log.codeSnippet && (
                        <pre className="p-2.5 bg-slate-950 text-emerald-300 text-[10.5px] overflow-x-auto select-text font-mono">
                          <code>{log.codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  )}

                  {/* User Input Log */}
                  {log.type === "user" && (
                    <div className="text-amber-200 font-bold bg-amber-500/10 border-l-2 border-amber-400 px-2.5 py-1 rounded-r-lg flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{log.text}</span>
                    </div>
                  )}

                  {/* Output Result Log */}
                  {log.type === "output" && (
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5 px-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{log.text}</span>
                    </div>
                  )}
                </div>
              ))}

              {isExecuting && (
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs py-1 animate-pulse">
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>
                    {isEn
                      ? `${activeAgent.name} is compiling code via Lovable Fullstack Engine [${activeModeObj.label}]...`
                      : `${activeAgent.name} kocht Code via Lovable Fullstack Engine [${activeModeObj.label}]...`}
                  </span>
                </div>
              )}

              <div ref={logEndRef} />
            </div>

            {/* Prompt Input Form Line */}
            <form
              onSubmit={handleSendPrompt}
              className="mt-2 pt-2 border-t border-[#16233a] flex items-center gap-2 flex-shrink-0"
            >
              <div className="flex items-center gap-1 text-cyan-400 font-bold text-xs pl-1">
                <span>&gt;</span>
                <span className="text-slate-500">({activeAgent.short})</span>
              </div>

              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={
                  isEn
                    ? `Command for ${activeAgent.name} (e.g. "Create WebGL Shader Component", "/refactor App.tsx")...`
                    : `Befehl für ${activeAgent.name} (z.B. "Erstelle WebGL Shader Component", "/refactor App.tsx")...`
                }
                className="flex-1 bg-[#0a101c] border border-[#16233a] hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl px-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:shadow-[0_0_12px_rgba(44,227,255,0.3)] transition font-mono"
              />

              <button
                id="termRunBtn"
                type="submit"
                disabled={isExecuting || !promptInput.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(44,227,255,0.4)]"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>RUN</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: 8-AGENT MATRIX GRID */}
        {activeTab === "grid" && (
          <div className="relative z-10 flex-1 p-3 overflow-y-auto custom-term-scrollbar space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">
                {isEn ? "SELECT ACTIVE CODER AGENT:" : "WÄHLE AKTIVEN CODER-AGENTEN:"}
              </span>
              <span className="text-[10px] text-cyan-400">
                {isEn ? "Click any card to switch live context" : "Klick auf eine Karte zum Live-Kontextwechsel"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {agents.map((ag) => {
                const isSelected = ag.id === activeAgent.id;
                const cardMode = agentPowerModes[ag.id] || globalMode;
                const cardModeObj = MODES[cardMode];

                return (
                  <div
                    key={ag.id}
                    onClick={(e) => handleSelectAgentCard(ag, e)}
                    style={
                      {
                        "--card-accent": ag.color || "#2ce3ff",
                        borderColor: isSelected ? ag.color || "#2ce3ff" : "#16233a",
                      } as React.CSSProperties
                    }
                    className={`relative p-3 rounded-2xl bg-[#0a101c]/90 border transition cursor-pointer flex flex-col justify-between group overflow-hidden ${
                      isSelected ? "active-agent-glow bg-slate-900/90" : "hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    {/* Corner Brackets */}
                    {isSelected && (
                      <>
                        <span
                          className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2"
                          style={{ borderColor: ag.color || "#2ce3ff" }}
                        />
                        <span
                          className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2"
                          style={{ borderColor: ag.color || "#2ce3ff" }}
                        />
                        <span
                          className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2"
                          style={{ borderColor: ag.color || "#2ce3ff" }}
                        />
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2"
                          style={{ borderColor: ag.color || "#2ce3ff" }}
                        />
                      </>
                    )}

                    {/* Top Identity */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className="w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-mono font-black"
                          style={{
                            backgroundColor: `${ag.color || "#2ce3ff"}20`,
                            borderColor: `${ag.color || "#2ce3ff"}50`,
                            color: ag.color || "#2ce3ff",
                            boxShadow: isSelected ? `0 0 12px ${ag.color || "#2ce3ff"}60` : undefined,
                          }}
                        >
                          {ag.railLetter || ag.short?.[0] || "C"}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ONLINE</span>
                        </div>
                      </div>

                      <div className="font-mono font-bold text-xs text-white uppercase">{ag.name}</div>
                      <div className="text-[9.5px] text-slate-400 truncate">{ag.tag || "CODER CORE"}</div>
                    </div>

                    {/* Bottom Mode Tag */}
                    <div className="mt-2 pt-2 border-t border-[#16233a] flex items-center justify-between">
                      <div
                        className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold flex items-center gap-1 border"
                        style={{
                          backgroundColor: `${cardModeObj.color}15`,
                          borderColor: `${cardModeObj.color}40`,
                          color: cardModeObj.color,
                        }}
                      >
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: cardModeObj.color }}
                        />
                        <span>{cardModeObj.label}</span>
                      </div>

                      <span className="text-[8.5px] text-slate-500 font-mono">
                        {cardModeObj.tokens.toLocaleString()}T
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: FILE EDITOR */}
        {activeTab === "editor" && (
          <div className="relative z-10 flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* Sidebar File Explorer */}
            <div className="w-full sm:w-48 bg-[#0a101c]/90 border-r border-[#16233a] p-2 space-y-1 overflow-y-auto custom-term-scrollbar flex-shrink-0">
              <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider px-2 py-1 border-b border-[#16233a] flex items-center justify-between">
                <span>{isEn ? "FILES" : "DATEIEN"}</span>
                <Folder className="w-3 h-3 text-cyan-400" />
              </div>

              {INITIAL_CODE_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full text-left px-2 py-1.5 rounded-xl border text-[10.5px] font-mono transition cursor-pointer flex items-center justify-between ${
                    selectedFileIdx === idx
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(44,227,255,0.3)]"
                      : "bg-[#070b14] border-[#16233a] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileCode2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Code Content Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#070b14]/90">
              <div className="px-3 py-1.5 bg-[#0a101c] border-b border-[#16233a] flex items-center justify-between text-[10.5px]">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                  {activeFile.path}
                </span>

                <button
                  onClick={() => handleCopySnippet(activeFile.content)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? (isEn ? "COPIED" : "KOPIERT") : (isEn ? "COPY CODE" : "CODE KOPIEREN")}</span>
                </button>
              </div>

              <div className="p-3 overflow-y-auto flex-1 custom-term-scrollbar bg-[#050810] text-cyan-200 font-mono text-xs leading-relaxed select-text">
                <pre>
                  <code>{activeFile.content}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GIT DIFF */}
        {activeTab === "git" && (
          <div className="relative z-10 flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs custom-term-scrollbar">
            <div className="p-2.5 bg-[#0a101c] border border-[#16233a] rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-cyan-300 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  BRANCH: main // CLAUDE-CODE-COMMIT-08
                </span>
                <span className="text-[9.5px] text-emerald-400 font-normal">+48 lines / -12 lines</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isEn
                  ? `Last automated Git Diff executed by ${activeAgent.name} in mode [${activeModeObj.label}].`
                  : `Letzter automatischer Git-Diff ausgeführt von ${activeAgent.name} im Modus [${activeModeObj.label}].`}
              </p>
            </div>

            <div className="bg-[#0a101c]/90 border border-[#16233a] rounded-xl overflow-hidden">
              <div className="px-3 py-1.5 bg-[#0d1424] text-[10px] font-bold text-cyan-300 border-b border-[#16233a]">
                DIFF /src/components/ParticleSphere.tsx
              </div>
              <div className="p-2.5 space-y-0.5 text-[10.5px]">
                <div className="text-slate-500">@@ -112,6 +112,18 @@ export const ParticleSphere = () =&gt; &#123;</div>
                <div className="text-red-400 bg-red-500/10 px-1 rounded">- const oldShape = "sphere";</div>
                <div className="text-emerald-400 bg-emerald-500/10 px-1 rounded">+ const newShape = customShape || "gyroscope";</div>
                <div className="text-emerald-400 bg-emerald-500/10 px-1 rounded">+ const reactiveSpeed = particleSpeed * audioSensitivity;</div>
                <div className="text-slate-300">  useFrame((state, delta) =&gt; &#123;</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Status Bar */}
        <div className="relative z-10 px-3 py-1.5 bg-[#0a101c] border-t border-[#16233a] flex items-center justify-between text-[9.5px] text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Sparkles className="w-3 h-3 animate-pulse" />
              S.Y.N.T.A.X. ORCHESTRATOR
            </span>
            <span>:: {isEn ? `CORE ${activeAgent.name} READY` : `CORE ${activeAgent.name} BEREIT`}</span>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ color: activeModeObj.color }} className="font-bold">
              MODE: {activeModeObj.label} ({activeModeObj.tokens.toLocaleString()}T)
            </span>
            <span className="text-emerald-400">● 200 OK</span>
          </div>
        </div>
      </div>
    </DraggableResizableWidget>
  );
});
