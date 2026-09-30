import React, { useState } from "react";
import { Message, AgentMultiResponse } from "../types";
import {
  Copy,
  Check,
  Volume2,
  Brain,
  ChevronDown,
  ChevronUp,
  Table,
  BarChart2,
  X,
  Sparkles,
} from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";
import { useTheme } from "../utils/themeStore";

interface MultiAgentResponseCardProps {
  msg: Message;
  onSpeak?: (text: string, agentId?: string) => void;
  agentColorMap?: Record<string, string>;
  lang?: "de" | "en";
  onToggleLang?: () => void;
  onOpenAgentSyncSynthesis?: () => void;
  onOpenVoiceConference?: (topic?: string) => void;
}

const AGENT_BADGE_MAP: Record<string, { label: string; tag: string; defaultColor: string }> = {
  syntax: { label: "PAPAYA", tag: "MASTER ARCHITECT", defaultColor: "#ff6b35" },
  maze: { label: "PAPAYA", tag: "MASTER ARCHITECT", defaultColor: "#ff6b35" },
  neo: { label: "N.E.O.", tag: "OFFER & SCREEN CO-PILOT", defaultColor: "#ff2a8d" },
  vega: { label: "V.E.G.A.", tag: "CODE & SYSTEM ENGINE", defaultColor: "#ef4444" },
  odin: { label: "O.D.I.N.", tag: "ZERO-TRUST DEFENSE", defaultColor: "#38bdf8" },
  pulse: { label: "P.U.L.S.E.", tag: "VIRAL MEDIA & VEO 3.1", defaultColor: "#a855f7" },
  chronos: { label: "C.H.R.O.N.O.S.", tag: "TIMEBOXING & SPRINTS", defaultColor: "#eab308" },
  oracle: { label: "O.R.A.C.L.E.", tag: "UNIT ECONOMICS & CHARTS", defaultColor: "#22c55e" },
  globe: { label: "G.L.O.B.E.", tag: "DEEP SEARCH & WEB RADAR", defaultColor: "#3b82f6" },
};

// Helper to turn plain response text into a structured analysis table rows
interface AnalysisRow {
  dimension: string;
  finding: string;
  recommendation: string;
  impactScore: string;
  priority: "HIGH" | "CRITICAL" | "MEDIUM" | "MAX";
}

function parseTextToAnalysisTable(text: string, agentName: string, lang: "de" | "en"): AnalysisRow[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows: AnalysisRow[] = [];
  const dimensionsDe = [
    "System & Architektur",
    "Conversion & Strategie",
    "Sicherheit & Audit",
    "Prozess-Effizienz",
    "Performance & Daten",
    "Umsetzung & Next Steps",
  ];
  const dimensionsEn = [
    "System & Architecture",
    "Conversion & Strategy",
    "Security & Audit",
    "Process Efficiency",
    "Performance & Data",
    "Execution & Next Steps",
  ];
  const dims = lang === "de" ? dimensionsDe : dimensionsEn;

  const keyPoints = lines.filter(
    (l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*") || /^\d+\./.test(l) || l.length > 25
  );

  if (keyPoints.length > 0) {
    keyPoints.slice(0, 6).forEach((pt, idx) => {
      const cleanPt = pt.replace(/^[-•*\d.]+\s*/, "").trim();
      const parts = cleanPt.split(":");
      const dimension = dims[idx % dims.length];
      const finding = parts[0] ? parts[0].trim() : cleanPt;
      const recommendation = parts[1]
        ? parts[1].trim()
        : lang === "de"
        ? `Empfohlene Maßnahme durch ${agentName} priorisieren`
        : `Prioritize recommended action via ${agentName}`;

      rows.push({
        dimension,
        finding,
        recommendation,
        impactScore: `${90 + (idx % 10)}%`,
        priority: idx === 0 ? "CRITICAL" : idx === 1 ? "MAX" : idx % 2 === 0 ? "HIGH" : "MEDIUM",
      });
    });
  } else {
    rows.push({
      dimension: dims[0],
      finding: text.slice(0, 140) + (text.length > 140 ? "..." : ""),
      recommendation:
        lang === "de"
          ? "Kernbefund in Arbeitsablauf integrieren."
          : "Integrate core finding into workflow.",
      impactScore: "98%",
      priority: "CRITICAL",
    });
    rows.push({
      dimension: dims[1],
      finding:
        lang === "de"
          ? "Konkrete Handlungsschritte und Feedbackschleife aktivieren."
          : "Activate actionable steps and feedback loops.",
      recommendation:
        lang === "de"
          ? "Maßnahmen testen und Ergebnisse validieren."
          : "Test actions and validate results.",
      impactScore: "94%",
      priority: "MAX",
    });
  }

  return rows;
}

// Clean CodeBlock without sci-fi/cyberpunk decoration
const ModernCodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code.trim());
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative rounded-xl my-3 overflow-hidden bg-[#0d0e13] border border-zinc-800 shadow-md">
      <div className="flex justify-between items-center px-3.5 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-xs font-mono">
        <span className="font-semibold text-zinc-300">{lang.toUpperCase() || "CODE"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-[11px] cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Kopiert" : "Kopieren"}</span>
        </button>
      </div>
      <pre className="p-4 font-mono text-xs overflow-x-auto text-zinc-200 leading-relaxed selection:bg-zinc-700">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

// Formats text cleanly with markdown code blocks and inline code
const ModernFormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-zinc-200 font-sans">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const lang = match?.[1] || "code";
          const code = match?.[2] || "";
          return <ModernCodeBlock key={idx} lang={lang} code={code} />;
        }

        const lines = part.split("\n");
        return (
          <div key={idx} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (!line.trim()) {
                return <div key={lIdx} className="h-1.5" />;
              }

              // Heading formatting
              if (line.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="font-semibold text-zinc-100 text-sm mt-3 mb-1">
                    {line.replace(/^###\s+/, "")}
                  </h4>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="font-semibold text-zinc-100 text-base mt-3.5 mb-1.5">
                    {line.replace(/^##\s+/, "")}
                  </h3>
                );
              }
              if (line.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className="font-bold text-zinc-100 text-lg mt-4 mb-2">
                    {line.replace(/^#\s+/, "")}
                  </h2>
                );
              }

              // Bullet points
              const isBullet = line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ");
              const cleanLine = isBullet ? line.replace(/^[-*•]\s+/, "") : line;

              // Inline code formatting
              const inlineParts = cleanLine.split(/(`[^`\n]+`)/g);

              return (
                <div key={lIdx} className={isBullet ? "flex items-start gap-2 pl-1" : ""}>
                  {isBullet && <span className="text-zinc-500 mt-1 select-none">•</span>}
                  <div className="flex-1">
                    {inlineParts.map((sub, sIdx) => {
                      if (sub.startsWith("`") && sub.endsWith("`")) {
                        return (
                          <code
                            key={sIdx}
                            className="bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 rounded px-1.5 py-0.5 text-xs font-mono mx-0.5"
                          >
                            {sub.slice(1, -1)}
                          </code>
                        );
                      }

                      // Check for bold **text**
                      const boldParts = sub.split(/(\*\*[^*]+\*\*)/g);
                      return boldParts.map((bSub, bIdx) => {
                        if (bSub.startsWith("**") && bSub.endsWith("**")) {
                          return (
                            <strong key={bIdx} className="font-semibold text-zinc-100">
                              {bSub.slice(2, -2)}
                            </strong>
                          );
                        }
                        return <span key={bIdx}>{bSub}</span>;
                      });
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const MultiAgentResponseCard: React.FC<MultiAgentResponseCardProps> = ({
  msg,
  onSpeak,
  agentColorMap = {},
  lang = "de",
  onToggleLang,
  onOpenAgentSyncSynthesis,
  onOpenVoiceConference,
}) => {
  const { isModern } = useTheme();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [activeDeepDiveAgent, setActiveDeepDiveAgent] = useState<AgentMultiResponse | null>(null);
  const [deepDiveViewMode, setDeepDiveViewMode] = useState<"table" | "kpi" | "raw">("table");

  // Multi-response tab selection (NEVER displays 9 stacked cards by default)
  const [selectedAgentTab, setSelectedAgentTab] = useState<number>(0);
  const [showAllParallel, setShowAllParallel] = useState(false);

  const toggleThought = (key: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyText = (text: string, key: string) => {
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Build the list of agent responses
  const rawResponses: AgentMultiResponse[] =
    msg.multiResponses && msg.multiResponses.length > 0
      ? msg.multiResponses
      : [
          {
            agentId: msg.role,
            name: AGENT_BADGE_MAP[msg.role.toLowerCase()]?.label || msg.role.toUpperCase(),
            badge: AGENT_BADGE_MAP[msg.role.toLowerCase()]?.tag || "AGENT",
            color: isModern ? "#a855f7" : (agentColorMap[msg.role] || AGENT_BADGE_MAP[msg.role.toLowerCase()]?.defaultColor || "#4ee8ff"),
            thought: msg.thought,
            response: msg.content,
            imageUrl: msg.imageUrl,
          },
        ];

  // De-duplicate if identical agent responses somehow leaked
  const responsesToRender: AgentMultiResponse[] = [];
  const seenAgents = new Set<string>();
  for (const r of rawResponses) {
    const key = r.agentId.toLowerCase();
    if (!seenAgents.has(key)) {
      seenAgents.add(key);
      responsesToRender.push(r);
    }
  }

  const isMultiAgent = responsesToRender.length > 1;
  const activeAgentIndex = Math.min(selectedAgentTab, responsesToRender.length - 1);
  const activeResponse = responsesToRender[activeAgentIndex] || responsesToRender[0];

  // Helper to render a clean, modern assistant card
  const renderSingleResponse = (agentResp: AgentMultiResponse, idx: number) => {
    const info = AGENT_BADGE_MAP[agentResp.agentId.toLowerCase()] || {
      label: agentResp.name,
      tag: agentResp.badge || "AGENT",
      defaultColor: agentResp.color || "#38bdf8",
    };
    const accentColor = agentResp.color || info.defaultColor;
    const key = `${agentResp.agentId}-${idx}`;
    const isThoughtOpen = Boolean(expandedThoughts[key]);
    const isCopied = copiedKey === key;

    return (
      <div
        key={key}
        className="w-full flex flex-col gap-2.5 rounded-2xl p-4 sm:p-5 bg-[#121319] border border-zinc-800/80 shadow-md text-zinc-100 transition-colors"
      >
        {/* Agent Info Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            {/* Sleek rounded avatar badge */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0"
              style={{
                backgroundColor: `${accentColor}18`,
                border: `1px solid ${accentColor}40`,
                color: accentColor,
              }}
            >
              {info.label.charAt(0)}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-zinc-100">
                {info.label}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                {info.tag}
              </span>
            </div>
          </div>

          {/* Quick Actions (Copy & Read Aloud) */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            {onSpeak && (
              <button
                onClick={() => onSpeak(agentResp.response, agentResp.agentId)}
                title={lang === "de" ? "Vorlesen" : "Read aloud"}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => handleCopyText(agentResp.response, key)}
              title={lang === "de" ? "Antwort kopieren" : "Copy response"}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer flex items-center gap-1 text-[11px]"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? "Kopiert" : "Kopieren"}</span>
            </button>

            <button
              onClick={() => setActiveDeepDiveAgent(agentResp)}
              title={lang === "de" ? "Strukturierte Analyse öffnen" : "Open structured analysis"}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analyse</span>
            </button>
          </div>
        </div>

        {/* Collapsible Reasoning Block (Like DeepSeek / Claude / Gemini) */}
        {agentResp.thought && (
          <div className="flex flex-col gap-1.5 my-1">
            <button
              onClick={() => toggleThought(key)}
              className="self-start flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isThoughtOpen ? (lang === "de" ? "Denkprozess verbergen" : "Hide reasoning") : (lang === "de" ? "Denkprozess anzeigen" : "Show reasoning")}</span>
              {isThoughtOpen ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
            </button>

            {isThoughtOpen && (
              <div className="border-l-2 border-zinc-700 pl-3.5 py-1.5 my-1 bg-zinc-900/40 rounded-r-xl text-xs text-zinc-400 italic font-sans leading-relaxed">
                {agentResp.thought}
              </div>
            )}
          </div>
        )}

        {/* Response Content */}
        <div className="pt-1">
          <ModernFormattedText text={agentResp.response} />
        </div>

        {/* Attached image if any */}
        {(agentResp.imageUrl || (idx === 0 && msg.imageUrl)) && (
          <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800 max-w-md shadow-md">
            <img
              src={agentResp.imageUrl || msg.imageUrl}
              alt="Generated asset"
              className="w-full h-auto object-cover max-h-72"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-3 flex flex-col gap-3 font-sans">
      {/* If this is an explicit Multi-Agent Broadcast message, show sleek pill switcher */}
      {isMultiAgent && (
        <div className="flex items-center justify-between gap-2 p-2 bg-[#121319] border border-zinc-800 rounded-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
            <span className="text-zinc-400 text-xs font-medium pl-1 pr-1.5 whitespace-nowrap">
              {lang === "de" ? "Flotten-Antworten:" : "Fleet responses:"}
            </span>
            {responsesToRender.map((r, i) => {
              const info = AGENT_BADGE_MAP[r.agentId.toLowerCase()] || { label: r.name };
              const isSelected = !showAllParallel && activeAgentIndex === i;
              return (
                <button
                  key={r.agentId}
                  onClick={() => {
                    setSelectedAgentTab(i);
                    setShowAllParallel(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: r.color || "#38bdf8" }}
                  />
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowAllParallel(!showAllParallel)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                showAllParallel
                  ? "bg-zinc-800 text-zinc-100 border-zinc-700"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800"
              }`}
              title="Alle Antworten parallel anzeigen"
            >
              {showAllParallel ? (lang === "de" ? "Tabs" : "Tabs") : (lang === "de" ? "Alle parallel" : "All parallel")}
            </button>

            {onOpenAgentSyncSynthesis && (
              <button
                onClick={onOpenAgentSyncSynthesis}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition cursor-pointer flex items-center gap-1"
                title="Synthese-Zusammenfassung öffnen"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="hidden sm:inline">Synthese</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Render Agent View (Single Active or Parallel) */}
      {isMultiAgent && showAllParallel ? (
        <div className="flex flex-col gap-3">
          {responsesToRender.map((resp, i) => renderSingleResponse(resp, i))}
        </div>
      ) : (
        renderSingleResponse(activeResponse, isMultiAgent ? activeAgentIndex : 0)
      )}

      {/* DEEP DIVE MODAL / TABULAR ANALYSIS OVERLAY (Modern, Sleek, Clean) */}
      {activeDeepDiveAgent && (
        <div className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in font-sans">
          <div className="relative w-full max-w-4xl max-h-[88vh] rounded-2xl overflow-hidden flex flex-col bg-[#121319] border border-zinc-800 shadow-2xl text-zinc-100">
            {/* Modal Header Bar */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{
                    backgroundColor: `${activeDeepDiveAgent.color || "#38bdf8"}20`,
                    color: activeDeepDiveAgent.color || "#38bdf8",
                  }}
                >
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                    <span>{lang === "de" ? "Strukturierte Analyse" : "Structured Analysis"}</span>
                    <span className="text-zinc-500 font-normal text-xs">·</span>
                    <span className="text-zinc-300 font-normal text-xs">{activeDeepDiveAgent.name}</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <button
                    onClick={() => setDeepDiveViewMode("table")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      deepDiveViewMode === "table" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Tabelle
                  </button>
                  <button
                    onClick={() => setDeepDiveViewMode("raw")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      deepDiveViewMode === "raw" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Original
                  </button>
                </div>

                <button
                  onClick={() => setActiveDeepDiveAgent(null)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {activeDeepDiveAgent.thought && (
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 italic">
                  <span className="font-semibold text-zinc-400 not-italic block mb-0.5">Denkprozess:</span>
                  "{activeDeepDiveAgent.thought}"
                </div>
              )}

              {deepDiveViewMode === "table" ? (
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0d0e13]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400">
                        <th className="p-3 font-medium">#</th>
                        <th className="p-3 font-medium">{lang === "de" ? "Dimension" : "Dimension"}</th>
                        <th className="p-3 font-medium">{lang === "de" ? "Befund" : "Finding"}</th>
                        <th className="p-3 font-medium">{lang === "de" ? "Empfohlene Aktion" : "Recommendation"}</th>
                        <th className="p-3 font-medium text-center">Impact</th>
                        <th className="p-3 font-medium text-center">Prio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                      {parseTextToAnalysisTable(activeDeepDiveAgent.response, activeDeepDiveAgent.name, lang === "en" ? "en" : "de").map(
                        (row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-zinc-800/30 transition">
                            <td className="p-3 font-mono text-zinc-500">{rIdx + 1}</td>
                            <td className="p-3 font-medium text-zinc-200">{row.dimension}</td>
                            <td className="p-3">{row.finding}</td>
                            <td className="p-3 text-zinc-300">{row.recommendation}</td>
                            <td className="p-3 text-center font-mono text-emerald-400">{row.impactScore}</td>
                            <td className="p-3 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                                {row.priority}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#0d0e13] border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {activeDeepDiveAgent.response}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
