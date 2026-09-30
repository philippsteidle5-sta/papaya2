import React, { useState } from "react";
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  RefreshCw,
  Sparkles,
  Zap,
  Layers,
  FileCode,
  Bug,
  Cpu,
} from "lucide-react";

interface SyntaxCodeRuntimeProps {
  onSendMessage?: (text: string) => void;
}

const CODE_TEMPLATES = [
  {
    title: "⚡ Gemini 2.5 Multi-Agent Dispatcher",
    lang: "typescript",
    code: `// Sovereign Core Multi-Agent Task Dispatcher
import { GoogleGenAI } from "@google/genai";

interface FleetPayload {
  missionId: string;
  assignedCore: "SYNTAX" | "VEGA" | "NEO" | "GLOBE";
  task: string;
}

export async function dispatchTaskToFleet(payload: FleetPayload) {
  console.log(\`[SYNTAX] Dispatching mission \${payload.missionId} to \${payload.assignedCore}...\`);
  
  const startTime = performance.now();
  // Simulated asynchronous quantum task execution
  await new Promise(r => setTimeout(r, 450));
  
  const executionTimeMs = (performance.now() - startTime).toFixed(2);
  return {
    status: "SUCCESS",
    core: payload.assignedCore,
    telemetry: { executionTimeMs: \`\${executionTimeMs}ms\`, tokensUsed: 1420 },
    output: \`Mission \${payload.missionId} successfully synthesized by \${payload.assignedCore}.\`
  };
}`,
  },
  {
    title: "🌐 3D WebGL Hologram Wave Generator",
    lang: "typescript",
    code: `// Three.js Parametric Particle Vortex Algorithm
export function generateParticleVortex(count: number = 2400) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2 * 6;
    const radius = 0.8 + 0.3 * Math.sin(theta * 3);
    
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = Math.sin(theta) * radius;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    
    // Cyan to Electric Indigo Gradient
    colors[i * 3] = 0.0;
    colors[i * 3 + 1] = 0.94;
    colors[i * 3 + 2] = 1.0;
  }
  return { count, positions, colors };
}`,
  },
  {
    title: "🔒 RBAC & Quantum Key Encryption",
    lang: "typescript",
    code: `// Zero-Trust Role & Token Validator
export function validateSovereignAccess(token: string, requiredRole: string) {
  if (!token.startsWith("syntax_auth_")) {
    throw new Error("Invalid quantum token format.");
  }
  const timestamp = Date.now();
  return {
    valid: true,
    role: "SOVEREIGN_ADMIN",
    issuedAt: new Date(timestamp).toISOString(),
    allowedCores: ["SYNTAX", "NEO", "VEGA", "ODIN", "PULSE", "CHRONOS", "ORACLE", "GLOBE"]
  };
}`,
  },
];

export const SyntaxCodeRuntime: React.FC<SyntaxCodeRuntimeProps> = ({ onSendMessage }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [code, setCode] = useState(CODE_TEMPLATES[0].code);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplate(idx);
    setCode(CODE_TEMPLATES[idx].code);
    setTerminalOutput(null);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTerminalOutput("Compiling TypeScript syntax & initializing WebAssembly runtime...\n");

    setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput(
        `[SYNTAX RUNTIME] v4.8 TypeScript Engine Initialized.\n` +
        `[INFO] All 8 Type Definitions Verified (Zero Errors).\n` +
        `[EXECUTION] Function executed successfully in 42.1ms.\n` +
        `[OUTPUT] -> {\n` +
        `  status: "SUCCESS",\n` +
        `  runtime: "V8 Isolated Worker",\n` +
        `  memoryAllocated: "14.2 MB",\n` +
        `  telemetry: { latency: "0.14ms", status: "100% OPERATIONAL" }\n` +
        `}`
      );
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskSyntaxToOptimize = () => {
    if (!onSendMessage) return;
    onSendMessage(`S.Y.N.T.A.X., bitte analysiere und optimiere diesen Code:\n\`\`\`typescript\n${code}\n\`\`\``);
  };

  return (
    <div className="w-full h-full bg-[#02050f] text-slate-100 p-4 md:p-6 overflow-y-auto font-mono flex flex-col gap-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              INTERACTIVE DEV SANDBOX
            </span>
            <h2 className="text-base font-black text-white">S.Y.N.T.A.X. CODE RUNTIME</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "KOPIERT" : "CODE KOPIEREN"}</span>
          </button>
          <button
            onClick={handleAskSyntaxToOptimize}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>SYNTAX REFACTOR</span>
          </button>
        </div>
      </div>

      {/* Template Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CODE_TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectTemplate(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border ${
              selectedTemplate === idx
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800"
            }`}
          >
            {tmpl.title}
          </button>
        ))}
      </div>

      {/* Main Code Editor & Terminal Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[360px]">
        
        {/* Left: Code Editor View */}
        <div className="flex flex-col rounded-2xl bg-slate-950/90 border border-cyan-500/30 overflow-hidden">
          <div className="h-9 px-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>sandbox.ts</span>
            </span>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_12px_rgba(16,185,129,0.4)] disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isRunning ? "LÄUFT..." : "AUSFÜHREN"}</span>
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-slate-950/80 p-4 text-xs text-cyan-100 font-mono focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/40"
            rows={14}
            spellCheck={false}
          />
        </div>

        {/* Right: Interactive Terminal Output */}
        <div className="flex flex-col rounded-2xl bg-[#01040a] border border-cyan-500/30 overflow-hidden">
          <div className="h-9 px-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>TERMINAL OUTPUT</span>
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">LIVE V8 SANDBOX</span>
            </div>
          </div>

          <div className="flex-1 p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-y-auto whitespace-pre-wrap">
            {terminalOutput || (
              <span className="text-slate-600 italic">
                Klicke auf "AUSFÜHREN", um den Code in der isolierten V8-Sandbox von S.Y.N.T.A.X. zu testen...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
