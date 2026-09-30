import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Volume2,
  Copy,
  Check,
  Download,
  Share2,
  Layers,
  ArrowRight,
  Radio,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Brain,
  MessageSquare,
  RefreshCw,
  Award,
  Terminal,
  FileText,
  Clock,
  Mic,
  Maximize2
} from "lucide-react";
import { AgentSyncSynthesis, AgentMultiResponse } from "../types";
import { copyToClipboard } from "../utils/clipboard";

interface AgentSyncSynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  synthesis: AgentSyncSynthesis | null;
  onStartVoiceConference?: (topic: string) => void;
  onSendToChat?: (text: string) => void;
  onReSynthesize?: (topic: string) => void;
  lang?: "de" | "en";
}

const AGENT_META: Record<string, { name: string; tag: string; color: string; icon: string }> = {
  syntax: { name: "S.Y.N.T.A.X.", tag: "SOVEREIGN MASTER CORE", color: "#00f0ff", icon: "⚡" },
  maze: { name: "S.Y.N.T.A.X.", tag: "SOVEREIGN MASTER CORE", color: "#00f0ff", icon: "⚡" },
  neo: { name: "N.E.O.", tag: "STRATEGY & GROWTH BOSS", color: "#ff2a8d", icon: "👑" },
  vega: { name: "V.E.G.A.", tag: "ARCHITECTURE & AUDIT", color: "#ff4d5e", icon: "🛡️" },
  odin: { name: "O.D.I.N.", tag: "SECURITY & RISK TACTICS", color: "#e2f1ff", icon: "⚔️" },
  pulse: { name: "P.U.L.S.E.", tag: "VIRALITY & CREATIVE", color: "#a855f7", icon: "🎬" },
  chronos: { name: "C.H.R.O.N.O.S.", tag: "TIMING & EXECUTION", color: "#eab308", icon: "⏱️" },
  oracle: { name: "O.R.A.C.L.E.", tag: "MARKET & DATA FORECAST", color: "#22c55e", icon: "📊" },
  globe: { name: "G.L.O.B.E.", tag: "GLOBAL RADAR & DISPATCH", color: "#38bdf8", icon: "🌐" },
};

export const AgentSyncSynthesisModal: React.FC<AgentSyncSynthesisModalProps> = ({
  isOpen,
  onClose,
  synthesis,
  onStartVoiceConference,
  onSendToChat,
  onReSynthesize,
  lang = "de",
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"synthesis" | "perspectives" | "actionPlan" | "raw">("synthesis");
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !synthesis) return null;

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps((prev) => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const lines = [
      `=================================================================`,
      `       ⚡ S.Y.N.T.A.X. AGENT-SYNC MASTER SYNTHESE REPORT       `,
      `=================================================================`,
      `Thema: ${synthesis.topic}`,
      `Zeitstempel: ${synthesis.timestamp}`,
      `Flotten-Konsens: ${synthesis.consensusScore}%`,
      ``,
      `--- [1. EXECUTIVE SUMMARY & KERN-DIREKTIVE] ---`,
      synthesis.executiveSummary,
      ``,
      `Strategische Direktive: ${synthesis.strategicDirective}`,
      ``,
      `--- [2. PERSPEKTIVEN DER SPEZIALISTEN] ---`,
      ...synthesis.corePerspectives.map(
        (p) => `• [${p.agentName} | ${p.roleTag}]:\n  Beitrag: ${p.keyContribution}\n  Actionable Insight: ${p.actionableInsight}\n`
      ),
      `--- [3. PRIORISIERTER MASTER-AKTIONSPLAN] ---`,
      ...synthesis.masterActionPlan.map(
        (step) => `[SCHRITT ${step.step}] [PRIO: ${step.priority}] [OWNER: ${step.owner}]: ${step.title}\n  -> ${step.description}`
      ),
      ``,
      `=================================================================`,
      `Generiert im Agent-Sync Modus durch S.Y.N.T.A.X. 8-Core Verbund.`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Agent-Sync-Synthese-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fullMarkdownCopy = `### ⚡ S.Y.N.T.A.X. Agent-Sync Master-Synthese
**Thema:** ${synthesis.topic} | **Konsens:** ${synthesis.consensusScore}%

#### 🌟 Executive Summary
${synthesis.executiveSummary}

**🎯 Strategische Direktive:** ${synthesis.strategicDirective}

#### 🧩 Perspektiven aller Cores
${synthesis.corePerspectives
  .map((p) => `- **${p.agentName}** (${p.roleTag}): ${p.keyContribution} — *Empfehlung:* ${p.actionableInsight}`)
  .join("\n")}

#### 📋 Master-Aktionsplan
${synthesis.masterActionPlan
  .map((s) => `${s.step}. **[${s.priority}] [${s.owner}] ${s.title}**: ${s.description}`)
  .join("\n")}
`;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-sans">
      
      {/* Outer Glow Wrapper */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#020512] border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_90px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col font-mono text-xs">
        
        {/* Sci-Fi Decorative Corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* ===================================================================== */}
        {/* HEADER BAR                                                            */}
        {/* ===================================================================== */}
        <div className="p-4 sm:p-5 bg-[#050a24]/90 border-b border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <Zap className="w-6 h-6 animate-pulse text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-black text-base text-cyan-200 tracking-widest flex items-center gap-2">
                  <span>⚡ AGENT-SYNC SYNTHESE</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>8-CORE MULTI-PERSPEKTIVE</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{synthesis.consensusScore}% FLOTTEN-KONSENS</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-xl">
                {lang === "de" ? "Thema:" : "Topic:"} <strong className="text-slate-200">{synthesis.topic}</strong> • {synthesis.timestamp}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Voice Conference Launcher */}
            {onStartVoiceConference && (
              <button
                onClick={() => onStartVoiceConference(synthesis.topic)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-mono text-[11px] font-black tracking-wider transition flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:scale-105 active:scale-95"
                title="Alle 8 Agenten live in die 3D Sprachkonferenz einladen und dieses Thema diskutieren lassen"
              >
                <Volume2 className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>🎙️ 8-CORE SPRACHKONFERENZ</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ACTION TABS & FAST EXPORT CONTROLS                                    */}
        {/* ===================================================================== */}
        <div className="px-5 py-2.5 bg-[#030616] border-b border-cyan-500/20 flex items-center justify-between flex-wrap gap-2">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("synthesis")}
              className={`px-3 py-1 rounded-lg font-bold text-[10.5px] transition flex items-center gap-1.5 ${
                activeTab === "synthesis"
                  ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>MASTER-SYNTHESE</span>
            </button>

            <button
              onClick={() => setActiveTab("perspectives")}
              className={`px-3 py-1 rounded-lg font-bold text-[10.5px] transition flex items-center gap-1.5 ${
                activeTab === "perspectives"
                  ? "bg-purple-500/30 text-purple-200 border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>8-CORE PERSPEKTIVEN ({synthesis.corePerspectives.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("actionPlan")}
              className={`px-3 py-1 rounded-lg font-bold text-[10.5px] transition flex items-center gap-1.5 ${
                activeTab === "actionPlan"
                  ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>MASTER-ROADMAP ({synthesis.masterActionPlan.length})</span>
            </button>

            {synthesis.rawResponses && synthesis.rawResponses.length > 0 && (
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1 rounded-lg font-bold text-[10.5px] transition flex items-center gap-1.5 ${
                  activeTab === "raw"
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>ROH-ANTWORTEN</span>
              </button>
            )}
          </div>

          {/* Quick Copy / Download buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(fullMarkdownCopy)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-cyan-500/30 hover:border-cyan-400 font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              title="Vollständigen Synthese-Report als Markdown in die Zwischenablage kopieren"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? (lang === "de" ? "KOPIERT!" : "COPIED!") : "MARKDOWN KOPIEREN"}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-cyan-500/30 hover:border-cyan-400 font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              title="Als Textdatei herunterladen"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT (.TXT)</span>
            </button>

            {onSendToChat && (
              <button
                onClick={() => {
                  onSendToChat(`⚡ [AGENT-SYNC MASTER-SYNTHESE]\nThema: ${synthesis.topic}\n\n${synthesis.executiveSummary}`);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-600 text-cyan-200 hover:text-slate-950 border border-cyan-400 font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                title="In den aktuellen Chat übertragen"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>IN CHAT</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MODAL MAIN CONTENT AREA                                               */}
        {/* ===================================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: MASTER SYNTHESIS */}
          {activeTab === "synthesis" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Executive Summary Hero Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#061033]/90 via-[#071342]/80 to-[#020516] border-2 border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-mono font-bold text-sm text-cyan-300 tracking-wider uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>S.Y.N.T.A.X. ORCHESTRIERTE MASTER-SYNTHESE</span>
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                    HARMONIE: {synthesis.consensusScore}% • 8 CORE KONSENS
                  </div>
                </div>

                <div className="font-sans text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {synthesis.executiveSummary}
                </div>

                {/* Strategic Directive Callout */}
                <div className="mt-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border-l-4 border-amber-400 p-4 font-mono space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>STRATEGISCHE HAUPT-DIREKTIVE FÜR DEN BOSS:</span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-amber-100 font-semibold leading-relaxed">
                    "{synthesis.strategicDirective}"
                  </p>
                </div>
              </div>

              {/* Quick Perspectives Grid Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs text-slate-300">
                  <span className="font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>ÜBERSICHT DER 8 CORE-WINKEL (1-KLICK DEEP-DIVE):</span>
                  </span>
                  <button
                    onClick={() => setActiveTab("perspectives")}
                    className="text-[10px] text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                  >
                    Alle 8 Details anzeigen →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {synthesis.corePerspectives.slice(0, 4).map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#04081c] border border-cyan-500/25 hover:border-cyan-400 transition-all space-y-2 group shadow-md"
                      style={{ borderLeftColor: p.color, borderLeftWidth: "3px" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs" style={{ color: p.color }}>
                          {p.agentName}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {p.roleTag}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-slate-200 line-clamp-2 leading-relaxed">
                        {p.keyContribution}
                      </p>
                      <div className="font-sans text-[11px] text-emerald-300 flex items-start gap-1 pt-1 border-t border-slate-800/80">
                        <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{p.actionableInsight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan Preview */}
              <div className="rounded-2xl bg-[#030616] border border-emerald-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold tracking-wider text-emerald-300 uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>SOFORTIGE ACTION ITEMS (TOP 3):</span>
                  </span>
                  <button
                    onClick={() => setActiveTab("actionPlan")}
                    className="text-[10px] text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
                  >
                    Vollständigen Aktionsplan öffnen →
                  </button>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {synthesis.masterActionPlan.slice(0, 3).map((item) => (
                    <div
                      key={item.step}
                      onClick={() => toggleStep(item.step)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        checkedSteps[item.step]
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 opacity-60 line-through"
                          : "bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            checkedSteps[item.step]
                              ? "bg-emerald-500 text-slate-950 border-emerald-400"
                              : "border-slate-600 bg-slate-950 text-slate-400"
                          }`}
                        >
                          {checkedSteps[item.step] ? <Check className="w-3.5 h-3.5" /> : item.step}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{item.title}</div>
                          <div className="font-sans text-[11px] text-slate-400 truncate">{item.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950 border border-slate-700 text-slate-300">
                          {item.owner}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.priority === "CRITICAL" || item.priority === "MAX"
                              ? "bg-red-500/20 text-red-300 border border-red-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ALL 8 CORE PERSPECTIVES */}
          {activeTab === "perspectives" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 pb-1">
                <span>AUFGETEILTE EXPERTISEN ALLER 8 SPEZIALISTEN FÜR DIESE ANFRAGE:</span>
                <span className="text-cyan-400">{synthesis.corePerspectives.length} CORES SYNCHRONISIERT</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {synthesis.corePerspectives.map((p, idx) => {
                  const meta = AGENT_META[p.agentId.toLowerCase()] || {
                    name: p.agentName,
                    tag: p.roleTag,
                    color: p.color,
                    icon: "⚡",
                  };

                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-3xl bg-[#04081c]/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-lg relative group"
                      style={{
                        boxShadow: `0 0 20px ${p.color}10`,
                      }}
                    >
                      {/* Top Core Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta.icon}</span>
                          <div>
                            <div className="font-mono font-black text-sm" style={{ color: p.color }}>
                              {p.agentName}
                            </div>
                            <div className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                              {p.roleTag}
                            </div>
                          </div>
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-full font-mono text-[9px] font-bold uppercase border"
                          style={{
                            borderColor: `${p.color}40`,
                            backgroundColor: `${p.color}15`,
                            color: p.color,
                          }}
                        >
                          IMPACT: {p.priorityScore || 95}%
                        </span>
                      </div>

                      {/* Main Contribution */}
                      <div className="space-y-1">
                        <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          HAUPT-BEITRAG & EXPERTEN-ANALYSE:
                        </div>
                        <p className="font-sans text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {p.keyContribution}
                        </p>
                      </div>

                      {/* Actionable Insight */}
                      <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                        <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>HANDLUNGSEMPFEHLUNG ({p.agentName}):</span>
                        </div>
                        <p className="font-sans text-xs text-emerald-200 leading-relaxed">
                          {p.actionableInsight}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP ACTION PLAN */}
          {activeTab === "actionPlan" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 pb-1">
                <span>CHRONOLOGISCHE EXECUTION-ROADMAP MIT OWNER-ZUWEISUNG:</span>
                <span className="text-emerald-400">
                  {Object.values(checkedSteps).filter(Boolean).length} / {synthesis.masterActionPlan.length} ABGEHAKT
                </span>
              </div>

              <div className="space-y-3 font-mono">
                {synthesis.masterActionPlan.map((step) => (
                  <div
                    key={step.step}
                    onClick={() => toggleStep(step.step)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      checkedSteps[step.step]
                        ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200 opacity-70"
                        : "bg-[#04081c] border-slate-800 hover:border-emerald-500/40 text-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${
                            checkedSteps[step.step]
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_#10b981]"
                              : "border-slate-700 bg-slate-900 text-cyan-400"
                          }`}
                        >
                          {checkedSteps[step.step] ? <Check className="w-4 h-4" /> : step.step}
                        </div>
                        <span className={`font-black text-sm ${checkedSteps[step.step] ? "line-through text-slate-400" : "text-white"}`}>
                          {step.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                          style={{
                            borderColor: `${step.ownerColor || "#06b6d4"}40`,
                            backgroundColor: `${step.ownerColor || "#06b6d4"}15`,
                            color: step.ownerColor || "#06b6d4",
                          }}
                        >
                          VERANTWORTLICH: {step.owner}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                            step.priority === "CRITICAL" || step.priority === "MAX"
                              ? "bg-red-500/20 text-red-300 border-red-500/40"
                              : step.priority === "HIGH"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          }`}
                        >
                          PRIO: {step.priority}
                        </span>
                      </div>
                    </div>

                    <p className={`font-sans text-xs sm:text-sm leading-relaxed pl-10 ${checkedSteps[step.step] ? "text-slate-500" : "text-slate-300"}`}>
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RAW AGENT RESPONSES */}
          {activeTab === "raw" && synthesis.rawResponses && (
            <div className="space-y-4 animate-fadeIn font-mono text-xs">
              <div className="text-slate-400">
                UNGEFILTERTE ORIGINAL-ANTWORTEN DER BETEILIGTEN CORES:
              </div>

              <div className="space-y-4">
                {synthesis.rawResponses.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#030612] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: r.color || "#06b6d4" }}>
                        [{r.name}]
                      </span>
                      <span className="text-[10px] text-slate-500">{r.badge}</span>
                    </div>
                    {r.thought && (
                      <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200/90 italic">
                        🧠 "{r.thought}"
                      </div>
                    )}
                    <div className="font-sans text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {r.response}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ===================================================================== */}
        {/* FOOTER BAR WITH FAST RESYNTHESIZE INPUT                              */}
        {/* ===================================================================== */}
        <div className="p-4 sm:p-5 bg-[#050a24] border-t border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
          {/* Quick Resynthesize / Custom Query Box */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customPrompt.trim() && onReSynthesize) {
                  onReSynthesize(customPrompt.trim());
                  setCustomPrompt("");
                }
              }}
              placeholder="Neues Thema oder Vertiefungsfrage für alle 8 Cores synthetisieren..."
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-xs shadow-inner"
            />
            {onReSynthesize && (
              <button
                onClick={() => {
                  if (customPrompt.trim()) {
                    onReSynthesize(customPrompt.trim());
                    setCustomPrompt("");
                  }
                }}
                disabled={!customPrompt.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400 font-mono text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>SYNTHETISIEREN</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold transition cursor-pointer border border-slate-700"
            >
              SCHLIESSEN
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
