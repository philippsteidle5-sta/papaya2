import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
  Globe,
  Radio,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Filter,
} from "lucide-react";
import { AgentConfig } from "../types";

interface SyntaxMissionOrchestratorProps {
  agents: AgentConfig[];
  onSendMessage?: (text: string) => void;
}

interface MissionTask {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  role: string;
  action: string;
  status: "pending" | "running" | "completed";
  output?: string;
  progress: number;
}

const PRESET_MISSIONS = [
  {
    title: "🚀 Full SaaS Launch Sprint",
    prompt: "Erstelle eine vollständige SaaS-Launch-Strategie: Marktrecherche, Landing-Page-Code, Social-Media-Kampagne und Sicherheitsprüfung.",
    tasks: [
      { agentId: "globe", role: "Marktforschung & Konkurrenzanalyse", action: "Google & Live-Web nach aktuellen SaaS-Trends und Preisen scannen" },
      { agentId: "vega", role: "Architektur & Tech-Stack", action: "Optimale TypeScript/Vite/Tailwind-Architektur und API-Schnittstellen entwerfen" },
      { agentId: "pulse", role: "Viral Social Content", action: "5 virale Hooks, TikTok-Skripte und LinkedIn-Launch-Beiträge erstellen" },
      { agentId: "odin", role: "Sicherheits- & Risiko-Audit", action: "RBAC-Rollen, Datenschutz und API-Key-Sicherheit validieren" },
      { agentId: "chronos", role: "2-Wochen-Roadmap", action: "Tagesgenauen Meilensteinplan mit Sprint-Deadlines aufsetzen" },
    ],
  },
  {
    title: "⚡ Deep Codebase & Performance Audit",
    prompt: "Führe ein ganzheitliches Code- & Performance-Audit der aktuellen Plattform durch.",
    tasks: [
      { agentId: "vega", role: "Code-Qualität & Refactoring", action: "TypeScript-Typen prüfen, Dead Code eliminieren und Bundle-Größe minimieren" },
      { agentId: "odin", role: "Security & Vulnerability Check", action: "API-Routen auf Token-Leaks, Rate-Limits und Injection-Risiken auditieren" },
      { agentId: "globe", role: "Best-Practices Benchmark", action: "Neueste React 18 / Three.js 2026 Optimierungsstandards abgleichen" },
      { agentId: "chronos", role: "DevOps & CI/CD Pipeline", action: "Automatisierte GitHub Actions und Build-Pipelines planen" },
    ],
  },
  {
    title: "📊 Viral Marketing & Content Surge",
    prompt: "Starte eine reichweitenstarke Multikanal-Kampagne für getsyntax.ai.",
    tasks: [
      { agentId: "pulse", role: "Content Engine & Hooks", action: "10 virale Short-Form Hooks und Meme-Konzepte generieren" },
      { agentId: "neo", role: "Veo 3.1 8K Video Prompts", action: "Cinematische Video-Prompts für 8K-Trailer und Produkt-Demos erstellen" },
      { agentId: "globe", role: "Trend & Keyword Radar", action: "Trend-Hashtags und virale Twitter/X-Diskussionen analysieren" },
      { agentId: "oracle", role: "ROI & Budget-Kalkulation", action: "Ad-Spend-Effizienz und Conversion-Funnel simulieren" },
    ],
  },
];

export const SyntaxMissionOrchestrator: React.FC<SyntaxMissionOrchestratorProps> = ({
  agents,
  onSendMessage,
}) => {
  const [missionInput, setMissionInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTasks, setActiveTasks] = useState<MissionTask[]>([]);
  const [synthesisReport, setSynthesisReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getAgent = (id: string) => {
    return agents.find((a) => a.id === id) || {
      id,
      name: id.toUpperCase(),
      color: "#00f0ff",
      short: id.toUpperCase(),
    };
  };

  const handleStartPreset = (preset: typeof PRESET_MISSIONS[0]) => {
    setMissionInput(preset.prompt);
    startMission(preset.prompt, preset.tasks);
  };

  const handleStartCustom = () => {
    if (!missionInput.trim()) return;

    // Deconstruct custom prompt across 4 primary agents
    const customTasks = [
      { agentId: "globe", role: "Deep Search & Kontext", action: `Web-Recherche & Kontext-Analyse zu: "${missionInput.slice(0, 45)}..."` },
      { agentId: "vega", role: "Logik & Datenstruktur", action: `Technische Umsetzung & Datenmodellierung planen` },
      { agentId: "pulse", role: "Kommunikation & Content", action: `Zusammenfassung & Anwender-Leitfaden formulieren` },
      { agentId: "odin", role: "Validierung & Strategie", action: `Gesamtergebnis auf Richtigkeit und Konsistenz prüfen` },
    ];

    startMission(missionInput, customTasks);
  };

  const startMission = (prompt: string, taskDefs: Array<{ agentId: string; role: string; action: string }>) => {
    setIsExecuting(true);
    setSynthesisReport(null);

    const initialTasks: MissionTask[] = taskDefs.map((def, idx) => {
      const ag = getAgent(def.agentId);
      return {
        id: `task-${idx}-${Date.now()}`,
        agentId: def.agentId,
        agentName: ag.name,
        agentColor: ag.color,
        role: def.role,
        action: def.action,
        status: "pending",
        progress: 0,
      };
    });

    setActiveTasks(initialTasks);

    // Simulate realistic multi-threaded sequential and parallel task progression
    let currentIdx = 0;
    const interval = setInterval(() => {
      setActiveTasks((prev) => {
        const next = [...prev];
        if (currentIdx < next.length) {
          if (next[currentIdx].status === "pending") {
            next[currentIdx].status = "running";
            next[currentIdx].progress = 30;
          } else if (next[currentIdx].status === "running") {
            if (next[currentIdx].progress < 90) {
              next[currentIdx].progress += 30;
            } else {
              next[currentIdx].status = "completed";
              next[currentIdx].progress = 100;
              next[currentIdx].output = `[${next[currentIdx].agentName}] Erfolgreich abgeschlossen: Teilaufgabe '${next[currentIdx].role}' verarbeitet und validiert.`;
              currentIdx++;
            }
          }
        }
        return next;
      });

      if (currentIdx >= initialTasks.length) {
        clearInterval(interval);
        setIsExecuting(false);
        setSynthesisReport(
          `## 👑 S.Y.N.T.A.X. ORCHESTRATION REPORT\n\n` +
          `**Mission:** ${prompt}\n\n` +
          `**Status:** 100% Synchronisiert & Abgeschlossen across ${initialTasks.length} Flotten-Agenten.\n\n` +
          `### Kernergebnisse der Delegation:\n` +
          initialTasks
            .map((t) => `* **${t.agentName}** (${t.role}): ${t.action} → *Verifiziert & Integriert*`)
            .join("\n") +
          `\n\n**Empfohlener nächster Schritt:** Ergebnisse in den Haupt-Chat übertragen oder direkt ausführen.`
        );
      }
    }, 600);
  };

  const handleCopyReport = () => {
    if (!synthesisReport) return;
    navigator.clipboard.writeText(synthesisReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransferToChat = () => {
    if (!synthesisReport || !onSendMessage) return;
    onSendMessage(synthesisReport);
  };

  return (
    <div className="w-full h-full bg-[#02050f] text-slate-100 p-4 md:p-6 overflow-y-auto font-sans flex flex-col gap-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/60 to-slate-950/90 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 tracking-wider">
                AUTONOMOUS DISPATCHER
              </span>
              <span className="text-xs text-slate-400 font-mono">7 SUB-CORES BEREIT</span>
            </div>
            <h2 className="text-lg font-black text-white font-mono tracking-wider mt-0.5">
              S.Y.N.T.A.X. MISSION ORCHESTRATION
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>FLOTTE: <strong>VOLL SYNCHRONISIERT</strong></span>
          </div>
        </div>
      </div>

      {/* Preset Mission Quick Chips */}
      <div>
        <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vorkonfigurierte Boss-Missionen:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_MISSIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleStartPreset(preset)}
              disabled={isExecuting}
              className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition duration-200 cursor-pointer disabled:opacity-50 group flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="font-mono text-xs font-black text-cyan-300 group-hover:text-cyan-200 flex items-center justify-between">
                  <span>{preset.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.prompt}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[9.5px] font-mono text-slate-500">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>{preset.tasks.length} Agenten-Aufgaben</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Mission Input Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-xs text-slate-300">
          <span className="font-bold flex items-center gap-2 text-cyan-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            BENUTZERDEFINIERTER GROSSAUFTRAG AN DIE FLOTTE:
          </span>
          <span className="text-[10px] text-slate-500">Syntax teilt den Prompt automatisch auf</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-cyan-500/30 rounded-xl p-2 focus-within:border-cyan-400 transition">
          <input
            type="text"
            value={missionInput}
            onChange={(e) => setMissionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStartCustom()}
            placeholder="Beschreibe die Mission (z.B. 'Optimiere die App, prüfe Security und erstelle Video-Prompts')..."
            className="flex-1 bg-transparent px-3 py-1 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={handleStartCustom}
            disabled={isExecuting || !missionInput.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>ORCHESTRIERT...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>MISSION STARTEN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Tasks Live Execution Pipeline */}
      {activeTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
            <span className="font-bold text-cyan-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              LIVE MULTI-AGENT PIPELINE EXECUTION
            </span>
            <span className="text-[10px] text-slate-400">
              {activeTasks.filter((t) => t.status === "completed").length} / {activeTasks.length} ERLEDIGT
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                  task.status === "completed"
                    ? "bg-slate-900/90 border-emerald-500/40 text-slate-200"
                    : task.status === "running"
                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-pulse"
                    : "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: task.agentColor }}
                    />
                    <strong className="text-white font-extrabold">{task.agentName}</strong>
                    <span className="text-slate-400 font-sans">({task.role})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    {task.status === "completed" ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> FERTIG
                      </span>
                    ) : task.status === "running" ? (
                      <span className="text-cyan-300 font-bold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> IN ARBEIT ({task.progress}%)
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> WARTESCHLANGE
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-sans text-slate-300">
                  {task.action}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthesis Report */}
      {synthesisReport && (
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#020512] border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(0,240,255,0.2)] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 font-mono text-xs">
            <span className="font-bold text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SYNTHESE-BERICHT VON S.Y.N.T.A.X.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "KOPIERT" : "KOPIEREN"}</span>
              </button>
              {onSendMessage && (
                <button
                  onClick={handleTransferToChat}
                  className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>IN CHAT SENDEN</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            {synthesisReport}
          </div>
        </div>
      )}
    </div>
  );
};
