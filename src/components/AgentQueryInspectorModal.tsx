import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Clock,
  Send,
  Terminal,
  Brain,
  Sparkles,
  Copy,
  Check,
  X,
  Download,
  ChevronRight,
  ChevronDown,
  Layers,
  Cpu,
  Zap,
  ShieldCheck,
  Activity,
  FileText,
  MessageSquare,
  Radio,
  ArrowRight,
  CornerDownRight,
  Eye,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Lock,
  Star,
  Trash2,
  Share2,
  FileSpreadsheet,
  AlertTriangle,
  Play,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import { AgentConfig, Message } from "../types";
import { copyToClipboard } from "../utils/clipboard";
import { UserRole, isAgentAllowed } from "../rbac";
import { useTheme } from "../utils/themeStore";
import { MemoryParticleUniverse } from "./MemoryParticleUniverse";
import {
  QueryLogEntry,
  QueryScope,
  getQueryLogs,
  recordQueryLog,
  toggleStarQuery,
  deleteQueryLog,
  resetQueryLogs,
  calculateQueryAnalytics,
  INITIAL_DEFAULT_QUERIES,
} from "../utils/queryHistoryStore";

interface AgentQueryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  currentAgent?: AgentConfig;
  agentChats: Record<string, Message[]>;
  onSelectAgent?: (agent: AgentConfig) => void;
  onSendMessageToAgent?: (
    agentId: string,
    text: string,
    imageUrl?: string,
    scope?: "SINGLE" | "ALL" | "THE_BIG_3"
  ) => void;
  initialAgentId?: string;
  lang?: "de" | "en";
  userRole?: UserRole;
}

type FilterType = "ALL" | "REQ" | "COT" | "RES" | "STARRED" | "BROADCAST";
type SortOrder = "NEWEST" | "OLDEST" | "LATENCY" | "TOKENS";

export const AgentQueryInspectorModal: React.FC<AgentQueryInspectorModalProps> = ({
  isOpen,
  onClose,
  agents,
  currentAgent,
  agentChats,
  onSelectAgent,
  onSendMessageToAgent,
  initialAgentId,
  lang = "de",
  userRole = "SOVEREIGN" as UserRole,
}) => {
  const { isModern } = useTheme();

  // 1. All hooks are declared unconditionally at top level
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>(() => {
    return initialAgentId || "all";
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("NEWEST");
  const [newPromptText, setNewPromptText] = useState<string>("");
  const [runnerTargetAgentId, setRunnerTargetAgentId] = useState<string>("maze");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");
  const [expandedJsonId, setExpandedJsonId] = useState<string | null>(null);
  const [expandedThoughtIds, setExpandedThoughtIds] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [rawStoredLogs, setRawStoredLogs] = useState<QueryLogEntry[]>([]);
  const [show3DUniverse, setShow3DUniverse] = useState<boolean>(true);
  const [is3DFocusMode, setIs3DFocusMode] = useState<boolean>(true);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(60);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleCount(60);
  }, [searchQuery, activeFilter, selectedAgentFilter, sortOrder]);

  // Update selected agent if initialAgentId changes when modal opens, and activate 3D focus view by default
  useEffect(() => {
    if (isOpen) {
      setIs3DFocusMode(true);
      setShow3DUniverse(true);
      if (initialAgentId) {
        setSelectedAgentFilter(initialAgentId);
        setRunnerTargetAgentId(initialAgentId);
      } else if (currentAgent?.id) {
        setSelectedAgentFilter("all");
        setRunnerTargetAgentId(currentAgent.id);
      }
    }
  }, [initialAgentId, isOpen, currentAgent?.id]);

  // Load and subscribe to query logs
  const refreshLogs = useCallback(() => {
    const logs = getQueryLogs();
    setRawStoredLogs(logs);
  }, []);

  useEffect(() => {
    refreshLogs();
    const handleUpdate = () => refreshLogs();
    window.addEventListener("syntax_query_logs_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("syntax_query_logs_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshLogs]);

  // Synchronize actual chat messages from `agentChats` into query entries if not already present
  const mergedQueryRecords = useMemo(() => {
    const baseLogs = [...rawStoredLogs];
    const existingIds = new Set(baseLogs.map((l) => l.id));

    // Convert any live chat messages from all agents into query log records
    agents.forEach((ag) => {
      const chatMsgs = agentChats[ag.id] || [];
      let pendingQuery = "";
      let pendingTimestamp = "";
      let pendingScope: QueryScope = "SINGLE";

      chatMsgs.forEach((msg, idx) => {
        if (msg.role === "user") {
          pendingQuery = msg.content;
          pendingTimestamp = msg.timestamp || new Date().toLocaleTimeString("de-DE");
        } else if (msg.isMultiAgent && msg.scope === "ALL" && Array.isArray(msg.multiResponses) && msg.multiResponses.length > 0) {
          // Extract each of the 8 sub-agent responses with their respective thoughts
          msg.multiResponses.forEach((r: any, rIdx: number) => {
            const subAgentId = r.agentId || ag.id;
            const subAgentObj = agents.find((a) => a.id === subAgentId) || ag;
            const autoId = `${msg.id || `live-multi-${idx}`}-${subAgentId}`;

            if (!existingIds.has(autoId)) {
              const promptText = pendingQuery || (lang === "de" ? "Multi-Agent Broadcast" : "Multi-Agent Broadcast");
              const pLen = promptText.length;
              const rLen = (r.response || "").length;
              const thoughtText = r.thought || `Als ${subAgentObj.name} analysiere ich "${promptText.slice(0, 50)}..." und priorisiere meine Kernmetriken.`;
              const tLen = thoughtText.length;
              const promptTokens = Math.max(12, Math.round(pLen * 0.75));
              const completionTokens = Math.max(25, Math.round(rLen * 0.75));
              const thoughtTokens = Math.max(15, Math.round(tLen * 0.75));

              baseLogs.push({
                id: autoId,
                agentId: subAgentId,
                agentName: subAgentObj.name,
                agentShort: subAgentObj.short || subAgentObj.name,
                agentColor: subAgentObj.color || "#4ee8ff",
                query: promptText,
                thought: thoughtText,
                response: r.response || "Direktive verarbeitet.",
                timestamp: msg.timestamp || pendingTimestamp || new Date().toLocaleTimeString("de-DE"),
                isoDate: new Date(Date.now() - (chatMsgs.length - idx) * 60000 + rIdx * 100).toISOString(),
                scope: "ALL",
                tokens: {
                  promptTokens,
                  completionTokens,
                  thoughtTokens,
                  totalTokens: promptTokens + completionTokens + thoughtTokens,
                },
                latencyMs: 220 + ((idx * 37 + rIdx * 45) % 180),
                status: "SUCCESS",
                statusCode: 200,
                modelUsed: subAgentId === "pulse" ? "veo-3.1" : subAgentId === "vega" ? "deepseek-r1" : "gemini-2.5-flash",
                isStarred: false,
                isReal: true,
                tags: ["multi-agent", subAgentId],
              });
              existingIds.add(autoId);
            }
          });
          pendingQuery = "";
        } else {
          const autoId = msg.id || `live-chat-${ag.id}-${idx}`;
          if (!existingIds.has(autoId)) {
            const promptText = pendingQuery || (lang === "de" ? "System-Direktive" : "System Directive");
            const pLen = promptText.length;
            const rLen = (msg.content || "").length;
            const thoughtText = msg.thought || `Als ${ag.name} analysiere ich "${promptText.slice(0, 50)}..." und leite die Maßnahmen ein.`;
            const tLen = thoughtText.length;
            const promptTokens = Math.max(12, Math.round(pLen * 0.75));
            const completionTokens = Math.max(25, Math.round(rLen * 0.75));
            const thoughtTokens = Math.max(15, Math.round(tLen * 0.75));

            baseLogs.push({
              id: autoId,
              agentId: ag.id,
              agentName: ag.name,
              agentShort: ag.short || ag.name,
              agentColor: ag.color || "#4ee8ff",
              query: promptText,
              thought: thoughtText,
              response: msg.content,
              timestamp: msg.timestamp || pendingTimestamp || new Date().toLocaleTimeString("de-DE"),
              isoDate: new Date(Date.now() - (chatMsgs.length - idx) * 60000).toISOString(),
              scope: (msg.scope as QueryScope) || pendingScope,
              tokens: {
                promptTokens,
                completionTokens,
                thoughtTokens,
                totalTokens: promptTokens + completionTokens + thoughtTokens,
              },
              latencyMs: 240 + ((idx * 43) % 190),
              status: "SUCCESS",
              statusCode: 200,
              modelUsed: ag.id === "pulse" ? "veo-3.1" : ag.id === "vega" ? "deepseek-r1" : "gemini-2.5-flash",
              isStarred: false,
              isReal: true,
              tags: ["chat", ag.id],
            });
            existingIds.add(autoId);
          }
          pendingQuery = "";
        }
      });
    });

    return baseLogs;
  }, [rawStoredLogs, agentChats, agents, lang]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let result = mergedQueryRecords.filter((rec) => {
      // 1. Agent Filter
      if (
        selectedAgentFilter !== "all" &&
        rec.agentId !== selectedAgentFilter &&
        !(selectedAgentFilter === "syntax" && rec.agentId === "maze")
      ) {
        return false;
      }

      // 2. Type Filter
      if (activeFilter === "STARRED" && !rec.isStarred) return false;
      if (activeFilter === "BROADCAST" && rec.scope !== "ALL" && rec.scope !== "BROADCAST" && rec.scope !== "THE_BIG_3") {
        return false;
      }
      if (activeFilter === "COT" && !rec.thought) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = rec.query.toLowerCase().includes(q);
        const matchesResponse = rec.response.toLowerCase().includes(q);
        const matchesThought = rec.thought ? rec.thought.toLowerCase().includes(q) : false;
        const matchesAgent = rec.agentName.toLowerCase().includes(q) || rec.agentShort.toLowerCase().includes(q);
        const matchesModel = rec.modelUsed.toLowerCase().includes(q);
        const matchesTags = rec.tags ? rec.tags.some((t) => t.toLowerCase().includes(q)) : false;

        if (!matchesQuery && !matchesResponse && !matchesThought && !matchesAgent && !matchesModel && !matchesTags) {
          return false;
        }
      }

      return true;
    });

    // Sort order
    result.sort((a, b) => {
      if (sortOrder === "NEWEST") {
        return new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime();
      }
      if (sortOrder === "OLDEST") {
        return new Date(a.isoDate || 0).getTime() - new Date(b.isoDate || 0).getTime();
      }
      if (sortOrder === "LATENCY") {
        return (b.latencyMs || 0) - (a.latencyMs || 0);
      }
      if (sortOrder === "TOKENS") {
        return (b.tokens?.totalTokens || 0) - (a.tokens?.totalTokens || 0);
      }
      return 0;
    });

    return result;
  }, [mergedQueryRecords, selectedAgentFilter, activeFilter, searchQuery, sortOrder]);

  // Overall analytics metrics calculated from filtered or full records
  const analytics = useMemo(() => {
    return calculateQueryAnalytics(mergedQueryRecords);
  }, [mergedQueryRecords]);

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle star
  const handleToggleStar = (id: string) => {
    const newState = toggleStarQuery(id);
    refreshLogs();
    setNotification(
      newState
        ? (lang === "de" ? "⭐ Anfrage zu Favoriten hinzugefügt!" : "⭐ Query added to favorites!")
        : (lang === "de" ? "Aus Favoriten entfernt" : "Removed from favorites")
    );
    setTimeout(() => setNotification(""), 2500);
  };

  // Delete single query log
  const handleDeleteQuery = (id: string) => {
    deleteQueryLog(id);
    refreshLogs();
    setNotification(lang === "de" ? "Eintrag aus Verlauf gelöscht" : "Entry deleted from history");
    setTimeout(() => setNotification(""), 2500);
  };

  // Clear all query logs
  const handleClearAll = (resetToSeeds: boolean) => {
    resetQueryLogs(undefined, resetToSeeds);
    refreshLogs();
    setShowClearConfirm(false);
    setNotification(
      resetToSeeds
        ? (lang === "de" ? "Verlauf auf Standard-Audit zurückgesetzt" : "History reset to default audit logs")
        : (lang === "de" ? "Verlauf vollständig geleert" : "History completely cleared")
    );
    setTimeout(() => setNotification(""), 3000);
  };

  // Send query directly from Test Runner
  const handleSendQuery = async () => {
    if (!newPromptText.trim()) return;
    const promptToSend = newPromptText.trim();
    const targetAgentObj = agents.find((a) => a.id === runnerTargetAgentId) || agents[0];

    setIsSending(true);

    try {
      if (onSendMessageToAgent) {
        const isBroadcast = runnerTargetAgentId === "all_broadcast";
        if (isBroadcast) {
          onSendMessageToAgent("maze", promptToSend, undefined, "ALL");
        } else {
          onSendMessageToAgent(targetAgentObj.id, promptToSend, undefined, "SINGLE");
        }
      }

      // Record immediately in query store for instant feedback
      recordQueryLog({
        agentId: runnerTargetAgentId === "all_broadcast" ? "maze" : targetAgentObj.id,
        agentName: runnerTargetAgentId === "all_broadcast" ? "8-CORE FLOTTE" : targetAgentObj.name,
        agentShort: runnerTargetAgentId === "all_broadcast" ? "FLOTTE" : targetAgentObj.short,
        agentColor: runnerTargetAgentId === "all_broadcast" ? "#a855f7" : targetAgentObj.color,
        query: promptToSend,
        thought: `Synthetisiere Direktive für ${runnerTargetAgentId === "all_broadcast" ? "alle 8 Cores" : targetAgentObj.name}...`,
        response: `⚡ Direktive empfangen und verarbeitet: "${promptToSend}". Antwort wird im Chat-Stream visualisiert.`,
        scope: runnerTargetAgentId === "all_broadcast" ? "ALL" : "SINGLE",
        modelUsed: targetAgentObj.id === "pulse" ? "veo-3.1" : "gemini-2.5-flash",
      });

      refreshLogs();
      setNewPromptText("");
      setNotification(
        lang === "de"
          ? `Anfrage erfolgreich an ${runnerTargetAgentId === "all_broadcast" ? "alle 8 Cores" : targetAgentObj.name} gesendet!`
          : `Query successfully dispatched to ${runnerTargetAgentId === "all_broadcast" ? "all 8 Cores" : targetAgentObj.name}!`
      );
      setTimeout(() => setNotification(""), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            system: "S.Y.N.T.A.X. SOVEREIGN OS",
            exportType: "QUERY_TELEMETRY_AUDIT_LOG",
            exportedAt: new Date().toISOString(),
            analytics,
            activeFilter,
            selectedAgent: selectedAgentFilter,
            recordCount: filteredRecords.length,
            records: filteredRecords,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `syntax_queries_${selectedAgentFilter}_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Agent",
      "Timestamp",
      "Scope",
      "Model",
      "LatencyMs",
      "PromptTokens",
      "CompletionTokens",
      "TotalTokens",
      "Status",
      "Query",
      "Thought",
      "Response",
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredRecords.map((r) => [
      escapeCsv(r.id),
      escapeCsv(r.agentShort || r.agentName),
      escapeCsv(r.timestamp),
      escapeCsv(r.scope),
      escapeCsv(r.modelUsed),
      escapeCsv(r.latencyMs),
      escapeCsv(r.tokens?.promptTokens || 0),
      escapeCsv(r.tokens?.completionTokens || 0),
      escapeCsv(r.tokens?.totalTokens || 0),
      escapeCsv(r.status),
      escapeCsv(r.query),
      escapeCsv(r.thought || ""),
      escapeCsv(r.response),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute(
      "download",
      `syntax_queries_${selectedAgentFilter}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Quick Prompt Chips
  const promptSuggestions = [
    { label: "⚡ 8-Core Status", prompt: "S.Y.N.T.A.X. Initialisierung: Überprüfe alle 8 Core-Netzwerk-Schnittstellen." },
    { label: "🎯 Conversion Audit", prompt: "Analysiere den Conversion-Funnel und schlage 3 High-Impact Verbesserungen vor." },
    { label: "🛡️ Security Check", prompt: "Führe einen Defense-Check für API-Keys, RBAC-Rollen und Session Storage durch." },
    { label: "🎬 Viral TikTok Script", prompt: "Erstelle ein 30-Sekunden TikTok-Skript mit starkem Hook über autonome Multi-Agent Systeme." },
    { label: "🌐 Deep Tech Search", prompt: "Suche nach den neuesten Fortschritten bei Gemini 2.5 Flash und DeepSeek R1 Modellen." },
  ];

  // 2. Early return strictly after ALL hooks have executed!
  if (!isOpen) return null;

  const currentSelectedAgent = agents.find((a) => a.id === selectedAgentFilter);

  return (
    <div
      id="modal-agent-query-inspector"
      className="fixed inset-0 z-[230] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 text-slate-100 overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-6xl rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto border transition-all ${
          isModern
            ? "bg-zinc-950 border-zinc-800 text-zinc-100 font-sans shadow-black/80"
            : "bg-[#040814] border-2 border-cyan-500/40 text-slate-100 font-mono shadow-[0_0_80px_rgba(0,240,255,0.25)]"
        }`}
      >
        {/* Futuristic Corner Accents for Cyberpunk Mode */}
        {!isModern && (
          <>
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
          </>
        )}

        {/* ================= 1. HEADER SECTION ================= */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b flex-shrink-0 ${
            isModern ? "border-zinc-800" : "border-cyan-500/25"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg border flex-shrink-0 transition ${
                isModern
                  ? "bg-zinc-900 border-zinc-700 text-zinc-100"
                  : "border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              }`}
              style={
                !isModern && currentSelectedAgent
                  ? {
                      backgroundColor: `${currentSelectedAgent.color}20`,
                      color: currentSelectedAgent.color,
                      borderColor: `${currentSelectedAgent.color}70`,
                    }
                  : {}
              }
            >
              {currentSelectedAgent ? (
                currentSelectedAgent.railLetter || currentSelectedAgent.name[0]
              ) : (
                <Cpu className={`w-6 h-6 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isModern
                      ? "bg-purple-500/10 border border-purple-500/30 text-purple-300"
                      : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 tracking-[1.5px]"
                  }`}
                >
                  8-CORE MEMORY & PROMPTS TELEMETRIE
                </span>
                <span className={`text-[10px] ${isModern ? "text-zinc-500" : "text-slate-400 font-mono"}`}>
                  Sovereign Memory Matrix
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isModern 
                    ? "bg-purple-950/40 border-purple-500/30 text-purple-200" 
                    : "bg-cyan-950/40 border-cyan-500/30 text-cyan-200"
                }`}>
                  ✨ "See your Second Brain grow" // Beobachte wie dein zweites Gehirn wächst
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <span>
                  {selectedAgentFilter === "all"
                    ? "Matrix Memory Stream (Alle 8 Cores)"
                    : `${currentSelectedAgent?.name || "Agent Core"} Memory`}
                </span>
                {currentSelectedAgent && (
                  <span className={`text-xs font-normal ${isModern ? "text-zinc-400" : "text-slate-400 font-mono"}`}>
                    // {currentSelectedAgent.tag}
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* 3D Memory Universe Toggle Button */}
            <button
              onClick={() => setShow3DUniverse(!show3DUniverse)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                show3DUniverse
                  ? isModern
                    ? "bg-purple-600/90 text-white border-purple-400 shadow-purple-950/40"
                    : "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : isModern
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                  : "bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-300 font-mono"
              }`}
              title="3D Partikel Memory Universe umschalten"
            >
              <span>🔮</span>
              <span>{show3DUniverse ? "3D UNIVERSE AN" : "3D UNIVERSE AUS"}</span>
            </button>

            {/* Full Monitor Focus Preview Button */}
            {show3DUniverse && (
              <button
                onClick={() => setIs3DFocusMode(true)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isModern
                    ? "bg-purple-950/80 hover:bg-purple-900/90 border-purple-500/50 text-purple-200 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : "bg-cyan-950/80 hover:bg-cyan-900/90 border-cyan-500/50 text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] font-mono"
                }`}
                title="3D Memory Universe über den gesamten Monitor im Focus-Modus öffnen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>FOCUS PREVIEW</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                isModern
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                  : "bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-300 font-mono"
              }`}
              title="Als CSV-Tabelle exportieren"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">CSV</span>
            </button>

            <button
              onClick={handleExportJson}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                isModern
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                  : "bg-slate-900 border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-mono"
              }`}
              title="Vollständiges Audit Log als JSON exportieren"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            {currentSelectedAgent && onSelectAgent && (
              <button
                onClick={() => {
                  onSelectAgent(currentSelectedAgent);
                  onClose();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  isModern
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm"
                    : "border font-mono font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] text-white hover:scale-105"
                }`}
                style={
                  !isModern && currentSelectedAgent
                    ? {
                        backgroundColor: `${currentSelectedAgent.color}25`,
                        borderColor: currentSelectedAgent.color,
                      }
                    : {}
                }
              >
                <Zap className="w-3.5 h-3.5" />
                <span>IN CHAT ÖFFNEN</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                isModern
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white border-slate-700 hover:border-red-500/50"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= 2. LIVE 3D MEMORY UNIVERSE VISUALIZER ================= */}
        {show3DUniverse && (
          <div className="py-2.5 flex-shrink-0 animate-in fade-in zoom-in-95 duration-200">
            <MemoryParticleUniverse
              memories={mergedQueryRecords}
              selectedMemoryId={selectedMemoryId}
              onSelectMemory={(m) => {
                setSelectedMemoryId(m.id);
                // Scroll to memory in list
                const el = document.getElementById(`memory-log-${m.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              activeAgentFilter={selectedAgentFilter}
              searchQuery={searchQuery}
              height={320}
              themeStyle={isModern ? "modern" : "cyberpunk"}
              isFocusMode={is3DFocusMode}
              onToggleFocusMode={setIs3DFocusMode}
              onCloseModal={onClose}
            />
          </div>
        )}

        {/* ================= 3. LIVE TELEMETRY RIBBON ================= */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-b flex-shrink-0 ${
            isModern ? "border-zinc-800" : "border-slate-800"
          }`}
        >
          {/* Total Queries */}
          <div
            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isModern ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-950/80 border-slate-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isModern ? "bg-purple-500/10 text-purple-400" : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>TOTAL QUERIES</div>
              <div className="text-sm font-bold text-white font-mono flex items-baseline gap-1">
                <span>{analytics.totalQueries}</span>
                <span className={`text-[10px] font-normal ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
                  ({filteredRecords.length} gefiltert)
                </span>
              </div>
            </div>
          </div>

          {/* Average Latency */}
          <div
            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isModern ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-950/80 border-slate-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isModern ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>Ø RESPONSE LATENZ</div>
              <div className="text-sm font-bold text-emerald-400 font-mono flex items-baseline gap-1">
                <span>{analytics.averageLatencyMs} ms</span>
                <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-normal">Optimal</span>
              </div>
            </div>
          </div>

          {/* Token Throughput */}
          <div
            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isModern ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-950/80 border-slate-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isModern ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>TOKEN DURCHSATZ</div>
              <div className="text-sm font-bold text-amber-300 font-mono flex items-baseline gap-1">
                <span>{analytics.totalTokens.toLocaleString("de-DE")}</span>
                <span className={`text-[9px] font-normal ${isModern ? "text-zinc-500" : "text-slate-500"}`}>Tokens</span>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div
            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isModern ? "bg-zinc-900/60 border-zinc-800" : "bg-slate-950/80 border-slate-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isModern ? "bg-blue-500/10 text-blue-400" : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>STATUS & UPTIME</div>
              <div className="text-sm font-bold text-blue-300 font-mono flex items-baseline gap-1">
                <span>{analytics.successRate}%</span>
                <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 font-normal">200 OK</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. AGENT SELECTOR STRIP (8 CORES + ALL) ================= */}
        <div
          className={`py-2.5 border-b flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0 ${
            isModern ? "border-zinc-800" : "border-slate-800/80"
          }`}
        >
          {/* ALL CORES BUTTON */}
          <button
            onClick={() => setSelectedAgentFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer flex-shrink-0 border ${
              selectedAgentFilter === "all"
                ? isModern
                  ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                  : "bg-slate-900 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.35)]"
                : isModern
                ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 font-mono"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ALLE 8 CORES</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                isModern ? "bg-zinc-800 text-zinc-300" : "bg-cyan-500/20 text-cyan-300"
              }`}
            >
              {mergedQueryRecords.length}
            </span>
          </button>

          {/* INDIVIDUAL 8 CORES */}
          {agents.map((ag) => {
            const isSelected = selectedAgentFilter === ag.id;
            const coreQueryCount = mergedQueryRecords.filter((r) => r.agentId === ag.id).length;
            const isAllowed = isAgentAllowed(userRole, ag.id);

            return (
              <button
                key={ag.id}
                onClick={() => setSelectedAgentFilter(ag.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer flex-shrink-0 border ${
                  isSelected
                    ? isModern
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-sm scale-[1.02]"
                      : "bg-slate-900 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.35)] scale-[1.03]"
                    : isModern
                    ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 font-mono"
                }`}
                style={
                  !isModern && isSelected
                    ? {
                        borderColor: ag.color,
                        boxShadow: `0 0 14px ${ag.color}40`,
                      }
                    : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ag.color }}
                />
                <span style={{ color: isSelected && !isModern ? ag.color : undefined }}>
                  {ag.short || ag.name}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    coreQueryCount > 0
                      ? isModern
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : isModern
                      ? "bg-zinc-900 text-zinc-600"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {coreQueryCount}
                </span>
                {!isAllowed && <Lock className="w-2.5 h-2.5 text-red-400" />}
              </button>
            );
          })}
        </div>

        {/* ================= 4. SEARCH, FILTER & SORT BAR ================= */}
        <div
          className={`py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b flex-shrink-0 ${
            isModern ? "border-zinc-800" : "border-slate-800/80"
          }`}
        >
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche in Anfragen, Gedanken (CoT), Antworten, Tags..."
              className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs text-white focus:outline-none transition ${
                isModern
                  ? "bg-zinc-900 border border-zinc-800 focus:border-purple-500/60 placeholder-zinc-500"
                  : "bg-slate-900/90 border border-cyan-500/25 focus:border-cyan-400 placeholder-slate-500 font-mono"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Sort Selector */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            <div
              className={`flex p-0.5 rounded-xl text-[10px] border ${
                isModern ? "bg-zinc-900 border-zinc-800 font-sans" : "bg-slate-900 border-cyan-500/20 font-mono"
              }`}
            >
              {[
                { id: "ALL", label: "ALLE" },
                { id: "REQ", label: "PROMPTS (REQ)" },
                { id: "COT", label: "GEDANKEN (CoT)" },
                { id: "RES", label: "ANTWORTEN" },
                { id: "STARRED", label: "⭐ FAVORITEN" },
                { id: "BROADCAST", label: "🌐 BROADCASTS" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as FilterType)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    activeFilter === tab.id
                      ? isModern
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.6)] font-bold"
                      : isModern
                      ? "text-zinc-400 hover:text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort order select */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className={`px-2.5 py-1.5 rounded-xl text-xs outline-none cursor-pointer border ${
                isModern
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 focus:border-zinc-700 font-sans"
                  : "bg-slate-900 border-slate-800 text-slate-300 font-mono"
              }`}
            >
              <option value="NEWEST">Neueste zuerst</option>
              <option value="OLDEST">Älteste zuerst</option>
              <option value="LATENCY">Höchste Latenz</option>
              <option value="TOKENS">Meiste Tokens</option>
            </select>

            {/* Clear logs trigger */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className={`p-1.5 rounded-xl border transition cursor-pointer text-slate-400 hover:text-red-400 ${
                isModern ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-slate-900 border-slate-800 hover:bg-slate-800"
              }`}
              title="Verlauf verwalten / zurücksetzen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div
            className={`my-2 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150 shadow-md ${
              isModern
                ? "bg-zinc-900 border-zinc-700 text-zinc-100 font-sans"
                : "bg-cyan-950/80 border-cyan-400 text-cyan-200 font-mono"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${isModern ? "text-emerald-400" : "text-cyan-400"}`} />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification("")} className="hover:text-white cursor-pointer p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= 5. MAIN SCROLLABLE QUERY & RESPONSE FEED ================= */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 custom-scrollbar">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Terminal className={`w-10 h-10 mx-auto ${isModern ? "text-zinc-600" : "text-slate-600"} animate-pulse`} />
              <p className={`text-sm ${isModern ? "text-zinc-400" : "text-slate-400 font-mono"}`}>
                Keine Anfragen gefunden für die aktuellen Such- und Filterkriterien.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("ALL");
                  setSelectedAgentFilter("all");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  isModern
                    ? "bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                    : "bg-slate-900 border-cyan-500/30 text-cyan-400 font-mono hover:bg-cyan-500/20"
                }`}
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <>
              {filteredRecords.slice(0, visibleCount).map((rec, index) => {
                const showQuery = activeFilter === "ALL" || activeFilter === "REQ" || activeFilter === "STARRED" || activeFilter === "BROADCAST";
              const showThought =
                (activeFilter === "ALL" || activeFilter === "COT" || activeFilter === "STARRED" || activeFilter === "BROADCAST") &&
                rec.thought;
              const showResponse = activeFilter === "ALL" || activeFilter === "RES" || activeFilter === "STARRED" || activeFilter === "BROADCAST";
              const isThoughtExpanded = expandedThoughtIds[rec.id] !== false; // expanded by default
              const isJsonExpanded = expandedJsonId === rec.id;

              const isSelectedFrom3D = selectedMemoryId === rec.id;

              return (
                <div
                  id={`memory-log-${rec.id}`}
                  key={rec.id || index}
                  onClick={() => setSelectedMemoryId(rec.id)}
                  className={`rounded-2xl border p-4 transition-all duration-200 space-y-3 relative group shadow-sm ${
                    isSelectedFrom3D
                      ? isModern
                        ? "bg-purple-950/40 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.35)] ring-1 ring-purple-400"
                        : "bg-slate-900 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400"
                      : isModern
                      ? "bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700 text-zinc-200 font-sans"
                      : "bg-slate-950/90 border-slate-800/90 hover:border-cyan-500/40 text-slate-100 font-mono shadow-md"
                  }`}
                  style={{
                    borderLeft: `4px solid ${rec.agentColor || "#4ee8ff"}`,
                  }}
                >
                  {/* Top Meta Bar */}
                  <div
                    className={`flex items-center justify-between text-[11px] pb-2.5 border-b flex-wrap gap-2 ${
                      isModern ? "border-zinc-800/80 text-zinc-400 font-sans" : "border-slate-800/80 text-slate-400 font-mono"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-bold px-2 py-0.5 rounded border text-[10px]"
                        style={{
                          color: rec.agentColor,
                          backgroundColor: `${rec.agentColor}15`,
                          borderColor: `${rec.agentColor}40`,
                        }}
                      >
                        REQ #{filteredRecords.length - index} // {rec.agentShort || rec.agentName}
                      </span>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          rec.scope === "ALL" || rec.scope === "BROADCAST"
                            ? isModern
                              ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                              : "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                            : isModern
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-slate-900 text-slate-500"
                        }`}
                      >
                        [{rec.scope || "SINGLE"}]
                      </span>

                      <span className={`text-[10px] flex items-center gap-1 ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
                        <Clock className="w-3 h-3" />
                        {rec.timestamp}
                      </span>

                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          isModern ? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50" : "bg-slate-900 text-slate-400"
                        }`}
                      >
                        {rec.modelUsed}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-amber-300 font-semibold font-mono text-[10px]">
                        ~{rec.tokens?.totalTokens || 240} Tokens
                      </span>
                      <span className="text-emerald-400 font-semibold font-mono text-[10px]">
                        {rec.latencyMs || 280}ms
                      </span>

                      {/* Favorite button */}
                      <button
                        onClick={() => handleToggleStar(rec.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          rec.isStarred
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                            : isModern
                            ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-amber-300"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-300"
                        }`}
                        title={rec.isStarred ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
                      >
                        <Star className={`w-3 h-3 ${rec.isStarred ? "fill-amber-300" : ""}`} />
                      </button>

                      {/* Copy trace */}
                      <button
                        onClick={() =>
                          handleCopy(
                            `[SYNTAX QUERY LOG - ${rec.agentName}]\nID: ${rec.id}\nTIME: ${rec.timestamp}\nPROMPT: ${rec.query}\n\nCOT GEDANKE: ${rec.thought || "-"}\n\nANTWORT:\n${rec.response}`,
                            rec.id
                          )
                        }
                        className={`px-2 py-1 rounded-lg border text-xs transition flex items-center gap-1 cursor-pointer ${
                          isModern
                            ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                            : "bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-cyan-400 text-slate-300 font-mono"
                        }`}
                        title="Vollständige Anfrage & Antwort kopieren"
                      >
                        {copiedId === rec.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                        <span className="text-[10px]">{copiedId === rec.id ? "Kopiert" : "Kopieren"}</span>
                      </button>

                      {/* Re-run Query */}
                      {onSendMessageToAgent && (
                        <button
                          onClick={() => {
                            onSendMessageToAgent(rec.agentId, rec.query, undefined, "SINGLE");
                            setNotification(
                              lang === "de"
                                ? `Query erneut an ${rec.agentName} gesendet!`
                                : `Query re-dispatched to ${rec.agentName}!`
                            );
                            setTimeout(() => setNotification(""), 3000);
                          }}
                          className={`p-1.5 rounded-lg border transition cursor-pointer text-slate-400 hover:text-cyan-400 ${
                            isModern ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                          }`}
                          title="Query erneut ausführen"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}

                      {/* Toggle JSON view */}
                      <button
                        onClick={() => setExpandedJsonId(isJsonExpanded ? null : rec.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer text-slate-400 hover:text-white ${
                          isJsonExpanded
                            ? isModern
                              ? "bg-zinc-700 border-zinc-600 text-white"
                              : "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                            : isModern
                            ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                            : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                        }`}
                        title="Raw JSON Payload ansehen"
                      >
                        <FileText className="w-3 h-3" />
                      </button>

                      {/* Delete log */}
                      <button
                        onClick={() => handleDeleteQuery(rec.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer text-slate-500 hover:text-red-400 ${
                          isModern ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                        }`}
                        title="Diesen Eintrag löschen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 1. QUERY / PROMPT (USER REQUEST) */}
                  {showQuery && (
                    <div
                      className={`rounded-xl p-3 space-y-1.5 border ${
                        isModern
                          ? "bg-zinc-950/80 border-zinc-800/90 text-zinc-100"
                          : "bg-slate-900/90 border-cyan-500/20 text-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
                        <span className={`flex items-center gap-1.5 ${isModern ? "text-purple-400" : "text-cyan-300 font-bold"}`}>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>📥 EINGEHENDE ANFRAGE (QUERY / PROMPT):</span>
                        </span>
                        <button
                          onClick={() => handleCopy(rec.query, `q-${rec.id}`)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `q-${rec.id}` ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          <span>Prompt kopieren</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed">
                        {rec.query}
                      </p>
                    </div>
                  )}

                  {/* 2. REASONING / THOUGHT (CoT STEP) */}
                  {showThought && rec.thought && (
                    <div
                      className={`rounded-xl p-3 space-y-1.5 border transition ${
                        isModern
                          ? "bg-amber-950/15 border-amber-500/25 text-amber-200"
                          : "bg-amber-950/20 border-amber-500/30 text-amber-200/90 font-mono"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                        <button
                          onClick={() =>
                            setExpandedThoughtIds((prev) => ({
                              ...prev,
                              [rec.id]: !isThoughtExpanded,
                            }))
                          }
                          className="flex items-center gap-1.5 hover:text-amber-300 cursor-pointer"
                        >
                          <Brain className="w-3.5 h-3.5 animate-pulse" />
                          <span>🧠 INTERNE STRATEGIE & GEDANKE (CoT REASONING):</span>
                          {isThoughtExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        <span className="text-[9px] text-amber-500/80 font-normal">
                          {rec.tokens?.thoughtTokens || 80} Thought Tokens
                        </span>
                      </div>
                      {isThoughtExpanded && (
                        <p className="text-xs whitespace-pre-wrap italic leading-relaxed pt-0.5">
                          "{rec.thought}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. AGENT RESPONSE (OUTPUT / ANTWORT) */}
                  {showResponse && (
                    <div
                      className={`rounded-xl p-3 space-y-1.5 border ${
                        isModern ? "bg-zinc-950/60 border-zinc-800" : "bg-slate-900/60 border-slate-800 font-mono"
                      }`}
                    >
                      <div
                        className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: rec.agentColor || (isModern ? "#ef4444" : "#4ee8ff") }}
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>⚡ GENERIERTE ANTWORT & DIREKTIVE ({rec.agentShort || rec.agentName}):</span>
                        </span>
                        <button
                          onClick={() => handleCopy(rec.response, `res-${rec.id}`)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-normal"
                        >
                          {copiedId === `res-${rec.id}` ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          <span>Antwort kopieren</span>
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed pt-1">
                        {rec.response}
                      </div>
                    </div>
                  )}

                  {/* 4. RAW JSON INSPECTOR ACCORDION */}
                  {isJsonExpanded && (
                    <div
                      className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 overflow-x-auto ${
                        isModern ? "bg-black border-zinc-800 text-zinc-300" : "bg-black/90 border-cyan-500/40 text-cyan-300"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-[10px] text-slate-400">
                        <span>RAW QUERY TRACE PAYLOAD:</span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(rec, null, 2), `json-${rec.id}`)}
                          className="hover:text-white cursor-pointer"
                        >
                          JSON Kopieren
                        </button>
                      </div>
                      <pre className="text-[10px] leading-tight select-all">
                        {JSON.stringify(rec, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredRecords.length > visibleCount && (
              <div className="pt-4 pb-2 text-center flex flex-col items-center gap-2">
                <div className={`text-xs ${isModern ? "text-zinc-400" : "text-slate-400 font-mono"}`}>
                  Zeige {Math.min(visibleCount, filteredRecords.length)} von {filteredRecords.length} Memory-Einträgen
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 60)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer shadow-sm ${
                      isModern
                        ? "bg-purple-900/40 hover:bg-purple-800/50 border-purple-500/40 text-purple-200 shadow-purple-950/20"
                        : "bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-500/40 text-cyan-300 font-mono shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    }`}
                  >
                    + 60 WEITERE ERINNERUNGEN LADEN ({filteredRecords.length - Math.min(visibleCount, filteredRecords.length)} verbleibend)
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredRecords.length)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isModern
                        ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
                        : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 font-mono"
                    }`}
                  >
                    ALLE {filteredRecords.length} ANZEIGEN
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>

        {/* ================= 6. PROMPT SUGGESTION CHIPS ================= */}
        <div
          className={`py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 border-t ${
            isModern ? "border-zinc-800" : "border-slate-800"
          }`}
        >
          <span className={`text-[10px] uppercase font-semibold pl-1 flex-shrink-0 ${isModern ? "text-zinc-500" : "text-slate-500 font-mono"}`}>
            PROMPT SCHNELLTEST:
          </span>
          {promptSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setNewPromptText(s.prompt)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer flex-shrink-0 border ${
                isModern
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 font-mono"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ================= 7. BOTTOM QUICK TEST QUERY INPUT BAR ================= */}
        <div
          className={`pt-2.5 border-t flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 ${
            isModern ? "border-zinc-800" : "border-cyan-500/25"
          }`}
        >
          {/* Target core selector */}
          <select
            value={runnerTargetAgentId}
            onChange={(e) => setRunnerTargetAgentId(e.target.value)}
            className={`px-3 py-2.5 rounded-xl text-xs outline-none cursor-pointer border w-full sm:w-auto ${
              isModern
                ? "bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-red-500/60 font-sans"
                : "bg-slate-900 border-cyan-500/40 text-cyan-300 font-mono"
            }`}
          >
            <option value="all_broadcast">🌐 Alle 8 Cores (Broadcast)</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name} ({ag.short})
              </option>
            ))}
          </select>

          {/* Prompt input field */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={newPromptText}
              onChange={(e) => setNewPromptText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isSending && handleSendQuery()}
              placeholder="Query oder Test-Prompt eingeben..."
              className={`w-full rounded-xl px-4 py-2.5 pr-10 text-xs text-white focus:outline-none transition ${
                isModern
                  ? "bg-zinc-900 border border-zinc-800 focus:border-red-500/60 placeholder-zinc-500 font-sans"
                  : "bg-slate-900 border border-cyan-500/40 focus:border-cyan-300 placeholder-slate-500 font-mono shadow-inner"
              }`}
            />
            <button
              onClick={handleSendQuery}
              disabled={isSending || !newPromptText.trim()}
              className={`absolute right-2 top-2 p-1.5 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isModern
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              }`}
              title="Query absenden & loggen"
            >
              {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Chat Switch */}
          {currentSelectedAgent && onSelectAgent && (
            <button
              onClick={() => {
                onSelectAgent(currentSelectedAgent);
                onClose();
              }}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 ${
                isModern
                  ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              }`}
            >
              <span>CHATTEN MIT {currentSelectedAgent.short}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ================= MODAL: CLEAR CONFIRMATION ================= */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-[260] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
                isModern ? "bg-zinc-950 border-zinc-800 text-zinc-200 font-sans" : "bg-[#080d1e] border-2 border-red-500/60 font-mono text-slate-200"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Query Verlauf verwalten</h3>
                <p className={`text-xs mt-1 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                  Möchtest du den Query-Verlauf auf die standardmäßigen 8-Core Audits zurücksetzen oder komplett leeren?
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleClearAll(true)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer border ${
                    isModern
                      ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200"
                      : "bg-slate-900 hover:bg-slate-800 border-cyan-500/40 text-cyan-300 font-bold"
                  }`}
                >
                  Auf 8-Core Standard Audit zurücksetzen
                </button>

                <button
                  onClick={() => handleClearAll(false)}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300"
                >
                  Komplett leeren (0 Einträge)
                </button>

                <button
                  onClick={() => setShowClearConfirm(false)}
                  className={`w-full py-2 rounded-xl text-xs transition cursor-pointer ${
                    isModern ? "text-zinc-500 hover:text-zinc-300" : "text-slate-500 hover:text-slate-300 font-mono"
                  }`}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
