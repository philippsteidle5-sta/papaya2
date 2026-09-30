// src/components/AppAndToolManagerModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Layers,
  Check,
  ExternalLink,
  Bot,
  SlidersHorizontal,
  RefreshCw,
  Power,
  Shield,
  Zap,
} from "lucide-react";
import { AgentConfig } from "../types";
import {
  SYSTEM_APPS_CATALOG,
  SystemAppDefinition,
  getAppToAgentLinkMap,
  setAppLink,
} from "../utils/agentAppLinksStore";
import { useTheme } from "../utils/themeStore";

interface AppAndToolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  currentAgent?: AgentConfig;
  activeWidgets?: Record<string, boolean | undefined>;
  onToggleWidget?: (widgetKey: string) => void;
  onOpenAppDirectly?: (appId: string) => void;
  onOpenApp?: (appId: string) => void;
  isAdmin?: boolean;
  lang?: "de" | "en";
  initialSelectedAgentId?: string;
  initialAgentId?: string;
}

export const AppAndToolManagerModal: React.FC<AppAndToolManagerModalProps> = ({
  isOpen,
  onClose,
  agents = [],
  currentAgent,
  activeWidgets = {},
  onToggleWidget,
  onOpenAppDirectly,
  onOpenApp,
  isAdmin = false,
  lang = "de",
  initialSelectedAgentId,
  initialAgentId,
}) => {
  const { isModern } = useTheme();
  const isEn = lang === "en";

  const fallbackInitialAgentId =
    initialSelectedAgentId || initialAgentId || currentAgent?.id || agents?.[0]?.id || "neo";

  const [activeTab, setActiveTab] = useState<"apps" | "agentMatrix">("apps");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(fallbackInitialAgentId);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [linkMap, setLinkMap] = useState<Record<string, string>>(() => getAppToAgentLinkMap());

  // Keep linkMap updated
  useEffect(() => {
    const handleUpdate = () => {
      setLinkMap(getAppToAgentLinkMap());
    };
    window.addEventListener("syntax_app_links_updated", handleUpdate);
    return () => window.removeEventListener("syntax_app_links_updated", handleUpdate);
  }, []);

  // Update selected agent if initial prop changes
  useEffect(() => {
    const nextId = initialSelectedAgentId || initialAgentId;
    if (nextId) {
      setSelectedAgentId(nextId);
    }
  }, [initialSelectedAgentId, initialAgentId]);

  if (!isOpen) return null;

  const handleLaunchApp = (appId: string) => {
    onClose();
    if (onOpenAppDirectly) {
      onOpenAppDirectly(appId);
    } else if (onOpenApp) {
      onOpenApp(appId);
    }
  };

  // Filter apps
  const visibleApps = SYSTEM_APPS_CATALOG.filter((app) => {
    if (app.adminOnly && !isAdmin) return false;
    if (selectedCategory !== "ALL" && app.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName =
        app.nameDe.toLowerCase().includes(q) ||
        app.nameEn.toLowerCase().includes(q) ||
        app.shortName.toLowerCase().includes(q);
      const matchDesc =
        app.descriptionDe.toLowerCase().includes(q) ||
        app.descriptionEn.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleLinkChange = (appId: string, agentId: string) => {
    setAppLink(appId, agentId);
    setLinkMap(getAppToAgentLinkMap());
  };

  const handleToggleAppForSelectedAgent = (appId: string) => {
    const currentLinked = linkMap[appId] || "none";
    if (currentLinked === selectedAgentId) {
      handleLinkChange(appId, "none");
    } else {
      handleLinkChange(appId, selectedAgentId);
    }
  };

  const handleResetToDefaults = () => {
    SYSTEM_APPS_CATALOG.forEach((app) => {
      setAppLink(app.id, app.defaultAgentId);
    });
    setLinkMap(getAppToAgentLinkMap());
  };

  const activeAgentConfig =
    (agents && agents.find((a) => a.id === selectedAgentId)) ||
    currentAgent ||
    agents?.[0] || {
      id: "neo",
      name: "N.E.O. Sovereign Core",
      short: "NEO",
      railLetter: "N",
      color: "#a855f7",
      tagline: "High-Agency Autonomous Matrix Core",
      systemPrompt: "",
    };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans">
      <div
        className={`relative w-full max-w-5xl h-[88vh] max-h-[820px] rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)] border transition-all ${
          isModern
            ? "bg-[#0c0c11] border-zinc-800 text-zinc-100 shadow-[0_0_50px_rgba(168,85,247,0.12)]"
            : "bg-slate-950 border-cyan-500/40 text-slate-100 shadow-[0_0_50px_rgba(0,240,255,0.2)]"
        }`}
      >
        {/* TOP HEADER */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isModern ? "border-zinc-800/80 bg-zinc-900/40" : "border-cyan-500/30 bg-slate-900/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xl border ${
                isModern
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              }`}
            >
              🧩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide font-mono">
                  {isEn ? "SYSTEM APPS & AGENT ORCHESTRATION" : "APPS & AGENTEN-VERKNÜPFUNG"}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    isModern
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                  }`}
                >
                  MODULAR OS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Toggle workspace apps and link them directly to agents (e.g. Browser to N.E.O.)"
                  : "Wähle aktive Funktionen aus und verknüpfe sie mit deinen Agenten (z. B. Web Browser mit N.E.O.)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-900 border-slate-800"
              }`}
            >
              <button
                onClick={() => setActiveTab("apps")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  activeTab === "apps"
                    ? isModern
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? "All Apps" : "Alle Apps"}</span>
              </button>
              <button
                onClick={() => setActiveTab("agentMatrix")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  activeTab === "agentMatrix"
                    ? isModern
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{isEn ? "Agent Matrix" : "Agenten-Zuweisung"}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: ALL APPS LIST WITH DIRECT LINK SELECTORS */}
        {activeTab === "apps" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Search & Category Filter Bar */}
            <div
              className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                isModern ? "border-zinc-800/80 bg-zinc-900/20" : "border-slate-800 bg-slate-900/20"
              }`}
            >
              {/* Search Field */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? "Search apps & tools..." : "App oder Werkzeug suchen..."}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono border focus:outline-none transition ${
                    isModern
                      ? "bg-zinc-900/90 border-zinc-800 focus:border-purple-500 text-zinc-100"
                      : "bg-slate-900/90 border-slate-700 focus:border-cyan-400 text-slate-100"
                  }`}
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                {[
                  { id: "ALL", label: isEn ? "All" : "Alle" },
                  { id: "workspace", label: "Workspace & Dev" },
                  { id: "productivity", label: isEn ? "Productivity" : "Produktivität" },
                  { id: "travel", label: isEn ? "Travel & Maps" : "Reisen & Maps" },
                  { id: "media", label: isEn ? "Media & Video" : "Medien & Video" },
                  { id: "finance", label: isEn ? "Finance" : "Finanzen" },
                  ...(isAdmin ? [{ id: "intel", label: "Intel & Spionage" }] : []),
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      selectedCategory === cat.id
                        ? isModern
                          ? "bg-purple-600/30 border-purple-500 text-purple-200 font-bold"
                          : "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apps Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {visibleApps.map((app) => {
                  const isWidget = Boolean(app.widgetKey);
                  const isVisibleOnDesktop = isWidget && app.widgetKey
                    ? Boolean(activeWidgets?.[app.widgetKey])
                    : false;
                  const currentLinkedAgentId = linkMap[app.id] || app.defaultAgentId || "none";
                  const linkedAgent = agents.find((a) => a.id === currentLinkedAgentId);

                  return (
                    <div
                      key={app.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-200 ${
                        isModern
                          ? "bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700"
                          : "bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 hover:border-cyan-500/40"
                      }`}
                    >
                      {/* Top Row: Icon + Title + Desktop Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex-shrink-0">
                            {app.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm tracking-wide text-white">
                                {isEn ? app.nameEn : app.nameDe}
                              </h3>
                              {app.adminOnly && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {app.category}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Visibility Toggle (For widgets) */}
                        {isWidget && (
                          <button
                            onClick={() => {
                              if (app.widgetKey && onToggleWidget) {
                                onToggleWidget(app.widgetKey);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border flex items-center gap-1.5 cursor-pointer transition ${
                              isVisibleOnDesktop
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200"
                            }`}
                            title={
                              isVisibleOnDesktop
                                ? "Auf Desktop aktiv (Klick zum Ausblenden)"
                                : "Auf Desktop inaktiv (Klick zum Einblenden)"
                            }
                          >
                            <Power className="w-3 h-3" />
                            <span>{isVisibleOnDesktop ? "AKTIV" : "INAKTIV"}</span>
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {isEn ? app.descriptionEn : app.descriptionDe}
                      </p>

                      {/* Bottom Row: Agent Link Selector + Direct Launch */}
                      <div
                        className={`pt-3 border-t flex items-center justify-between gap-3 ${
                          isModern ? "border-zinc-800/60" : "border-slate-800"
                        }`}
                      >
                        {/* Agent Link Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 font-bold whitespace-nowrap">
                            {isEn ? "Linked Agent:" : "Verknüpft mit:"}
                          </span>
                          <select
                            value={currentLinkedAgentId}
                            onChange={(e) => handleLinkChange(app.id, e.target.value)}
                            className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition ${
                              isModern
                                ? "bg-zinc-950 border-zinc-700 text-zinc-100"
                                : "bg-slate-950 border-slate-700 text-slate-100"
                            }`}
                            style={{
                              borderColor: linkedAgent ? linkedAgent.color : undefined,
                            }}
                          >
                            <option value="none">-- Kein Agent --</option>
                            <option value="all">🌐 Alle Agenten (Global)</option>
                            {agents.map((ag) => (
                              <option key={ag.id} value={ag.id}>
                                {ag.railLetter} · {ag.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Direct Launch Button */}
                        <button
                          onClick={() => handleLaunchApp(app.id)}
                          className={`px-3 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition ${
                            isModern
                              ? "bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/50"
                              : "bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-black"
                          }`}
                        >
                          <span>{isEn ? "Launch" : "Öffnen"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENT MATRIX (Configure specifically for one agent, e.g. N.E.O.) */}
        {activeTab === "agentMatrix" && (
          <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
            {/* Left Agent Selector Column */}
            <div
              className={`w-full sm:w-64 p-3 sm:p-4 border-r overflow-y-auto space-y-2 ${
                isModern ? "border-zinc-800 bg-zinc-900/30" : "border-slate-800 bg-slate-900/30"
              }`}
            >
              <div className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                {isEn ? "Select Agent" : "Agent auswählen"}
              </div>

              {agents.map((ag) => {
                const isSelected = ag.id === selectedAgentId;
                const linkedAppsCount = visibleApps.filter((app) => {
                  const linked = linkMap[app.id] || app.defaultAgentId;
                  return linked === ag.id || linked === "all";
                }).length;

                return (
                  <button
                    key={ag.id}
                    onClick={() => setSelectedAgentId(ag.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-slate-800 border-white/40 shadow-lg text-white"
                        : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40"
                    }`}
                    style={{
                      borderColor: isSelected ? ag.color : undefined,
                      boxShadow: isSelected ? `0 0 15px ${ag.color}40` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                        style={{
                          backgroundColor: `${ag.color}20`,
                          color: ag.color,
                          border: `1px solid ${ag.color}60`,
                        }}
                      >
                        {ag.railLetter}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{ag.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ag.tag}</div>
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border"
                      style={{
                        backgroundColor: `${ag.color}15`,
                        color: ag.color,
                        borderColor: `${ag.color}40`,
                      }}
                    >
                      {linkedAppsCount} Apps
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Matrix Content for Selected Agent */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 sm:p-5">
              {/* Agent Overview Bar */}
              <div
                className="p-3.5 rounded-xl border mb-4 flex items-center justify-between gap-4"
                style={{
                  backgroundColor: `${activeAgentConfig.color}10`,
                  borderColor: `${activeAgentConfig.color}40`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm"
                    style={{
                      backgroundColor: `${activeAgentConfig.color}30`,
                      color: activeAgentConfig.color,
                      border: `1px solid ${activeAgentConfig.color}80`,
                    }}
                  >
                    {activeAgentConfig.railLetter}
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-wide text-white">
                      {activeAgentConfig.name} :: {isEn ? "Linked Apps & Tools" : "Verknüpfte Werkzeuge"}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {isEn
                        ? `Select which applications ${activeAgentConfig.name} can autonomously control and consult.`
                        : `Wähle aus, welche Werkzeuge ${activeAgentConfig.name} direkt steuern und nutzen kann.`}
                    </p>
                  </div>
                </div>

                <div
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold text-white border"
                  style={{
                    backgroundColor: activeAgentConfig.color,
                    color: "#020617",
                    borderColor: activeAgentConfig.color,
                  }}
                >
                  {activeAgentConfig.id.toUpperCase()} CORE
                </div>
              </div>

              {/* Checkbox List of Apps */}
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {visibleApps.map((app) => {
                  const currentLinked = linkMap[app.id] || app.defaultAgentId || "none";
                  const isLinkedToThis = currentLinked === selectedAgentId;
                  const isLinkedToAll = currentLinked === "all";
                  const isChecked = isLinkedToThis || isLinkedToAll;

                  return (
                    <div
                      key={app.id}
                      onClick={() => handleToggleAppForSelectedAgent(app.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        isChecked
                          ? "bg-slate-900/90 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                          : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/40"
                      }`}
                      style={{
                        borderColor: isChecked ? activeAgentConfig.color : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isChecked
                              ? "bg-cyan-500 border-cyan-400 text-slate-950"
                              : "border-slate-600 bg-slate-900"
                          }`}
                          style={{
                            backgroundColor: isChecked ? activeAgentConfig.color : undefined,
                            borderColor: isChecked ? activeAgentConfig.color : undefined,
                            color: isChecked ? "#020617" : undefined,
                          }}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="text-xl">{app.icon}</div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white">
                              {isEn ? app.nameEn : app.nameDe}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              ({app.shortName})
                            </span>
                            {isLinkedToAll && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                GLOBAL
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {isEn ? app.descriptionEn : app.descriptionDe}
                          </p>
                        </div>
                      </div>

                      <span
                        className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border whitespace-nowrap"
                        style={{
                          color: isChecked ? activeAgentConfig.color : "#94a3b8",
                          borderColor: isChecked ? `${activeAgentConfig.color}60` : "#334155",
                          backgroundColor: isChecked ? `${activeAgentConfig.color}15` : "transparent",
                        }}
                      >
                        {isChecked
                          ? isLinkedToAll
                            ? "ALLE AGENTEN"
                            : `VERKNÜPFT MIT ${activeAgentConfig.short}`
                          : "NICHT VERKNÜPFT"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FOOTER */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between gap-3 ${
            isModern ? "border-zinc-800/80 bg-zinc-900/60" : "border-cyan-500/20 bg-slate-900/60"
          }`}
        >
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEn ? "Reset Recommended Links" : "Empfohlene Verteilung laden"}</span>
          </button>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-black tracking-wide uppercase transition cursor-pointer ${
              isModern
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            }`}
          >
            {isEn ? "Save & Close" : "Speichern & Schließen"}
          </button>
        </div>
      </div>
    </div>
  );
};
