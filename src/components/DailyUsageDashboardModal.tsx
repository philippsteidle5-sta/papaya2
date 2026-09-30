import React, { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  Cpu,
  BarChart3,
  Flame,
  ShieldCheck,
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  User,
  Sliders,
} from "lucide-react";
import {
  getDailyUsageMetrics,
  resetUsageMetrics,
  DailyUsageMetrics,
  DayUsageRecord,
} from "../utils/dailyUsageStore";
import { getCurrentUserEmail } from "../utils/leadDatabase";
import { useTheme } from "../utils/themeStore";

interface DailyUsageDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  lang?: "de" | "en";
}

export const DailyUsageDashboardModal: React.FC<DailyUsageDashboardModalProps> = ({
  isOpen,
  onClose,
  userRole = "SOVEREIGN",
  lang = "de",
}) => {
  const { isModern } = useTheme();
  const [metrics, setMetrics] = useState<DailyUsageMetrics>(() => getDailyUsageMetrics(getCurrentUserEmail(), userRole));
  const [selectedRange, setSelectedRange] = useState<7 | 14>(7);
  const [hoveredDay, setHoveredDay] = useState<DayUsageRecord | null>(null);
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setMetrics(getDailyUsageMetrics(getCurrentUserEmail(), userRole));
    }
  }, [isOpen, userRole]);

  useEffect(() => {
    const handleUsageUpdated = () => {
      setMetrics(getDailyUsageMetrics(getCurrentUserEmail(), userRole));
    };
    window.addEventListener("syntax_daily_usage_updated", handleUsageUpdated);
    window.addEventListener("syntax_bonus_tokens_updated", handleUsageUpdated);
    window.addEventListener("syntax_auth_state_change", handleUsageUpdated);
    window.addEventListener("storage", handleUsageUpdated);
    return () => {
      window.removeEventListener("syntax_daily_usage_updated", handleUsageUpdated);
      window.removeEventListener("syntax_bonus_tokens_updated", handleUsageUpdated);
      window.removeEventListener("syntax_auth_state_change", handleUsageUpdated);
      window.removeEventListener("storage", handleUsageUpdated);
    };
  }, [userRole]);

  if (!isOpen) return null;

  const visibleDays = metrics.history.slice(-selectedRange);
  const maxTokens = Math.max(...visibleDays.map((d) => d.tokens), 5000);

  const handleReset = () => {
    const email = getCurrentUserEmail();
    const updated = resetUsageMetrics(email);
    setMetrics(updated);
    setNotification(lang === "de" ? "Telemetrie auf Baseline zurückgesetzt" : "Telemetry reset to baseline");
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in font-sans text-slate-100 overflow-y-auto">
      <div
        className={`relative w-full max-w-4xl rounded-3xl p-5 sm:p-8 overflow-hidden font-mono space-y-6 my-auto max-h-[92vh] overflow-y-auto transition-all duration-200 ${
          isModern
            ? "bg-[#111114]/98 border border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-zinc-100"
            : "bg-[#060913] border-2 border-cyan-500/60 shadow-[0_0_100px_rgba(6,182,212,0.4)] text-slate-100"
        }`}
      >
        {/* Ambient Glows */}
        {!isModern && (
          <>
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 blur-3xl pointer-events-none" />
          </>
        )}
        {isModern && (
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-3xl pointer-events-none" />
        )}

        {/* Top Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
            isModern ? "border-zinc-800/80" : "border-cyan-500/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isModern
                  ? "bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-lg"
                  : "bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              }`}
            >
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isModern
                      ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      : "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300"
                  }`}
                >
                  TELEMETRY MATRIX
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isModern
                      ? "bg-purple-500/15 border border-purple-500/30 text-purple-300"
                      : "bg-purple-500/20 border border-purple-400/50 text-purple-300"
                  }`}
                >
                  {metrics.activePlan}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    isModern
                      ? "bg-zinc-900 border border-zinc-800 text-zinc-300"
                      : "bg-slate-900 border border-slate-700 text-cyan-300"
                  }`}
                >
                  <span>🔑 {lang === "de" ? "KEY ERSTELLT" : "KEY CREATED"}:</span>
                  <span className="text-white font-mono">{metrics.accountCreatedDateFormatted || (lang === "de" ? "Heute" : "Today")}</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider mt-1 flex items-center gap-2 text-white">
                <span>{lang === "de" ? "AVERAGE DAILY USAGE DASHBOARD" : "AVERAGE DAILY USAGE DASHBOARD"}</span>
                <span className={`w-2 h-2 rounded-full ${isModern ? "bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-emerald-400 animate-pulse"}`} />
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                isModern
                  ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white"
                  : "bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Notification Feedback */}
        {notification && (
          <div
            className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce ${
              isModern
                ? "bg-emerald-950/40 border border-emerald-500/60 text-emerald-300"
                : "bg-emerald-950/80 border border-emerald-500/80 text-emerald-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* 3 MAIN KPI CARDS (Ø AVERAGE USAGE METRICS) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Card 1: Ø Daily Tokens */}
          <div
            className={`p-4 rounded-2xl relative overflow-hidden group transition border ${
              isModern
                ? "bg-[#141418] border-zinc-800 hover:border-zinc-700 shadow-md"
                : "bg-slate-950/80 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:border-cyan-400"
            }`}
          >
            <div className="text-[10px] uppercase font-bold flex items-center justify-between text-zinc-400">
              <span>{lang === "de" ? "Ø TÄGLICHE TOKENS" : "Ø DAILY TOKENS"}</span>
              <Activity className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isModern ? "text-zinc-100" : "text-cyan-300"}`}>
              {metrics.averageDailyTokens.toLocaleString("de-DE")}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              {metrics.bonusTokens > 0 ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> +{metrics.bonusTokens.toLocaleString("de-DE")} Bonus-Tokens
                </span>
              ) : metrics.activeDaysCount === 1 ? (
                <span className="text-purple-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                  {lang === "de" ? "Key heute erstellt (Tag 1)" : "Key created today (Day 1)"}
                </span>
              ) : metrics.weeklyChangePercent !== 0 ? (
                <span className={`${metrics.weeklyChangePercent > 0 ? "text-emerald-400" : "text-zinc-400"} font-bold flex items-center gap-1`}>
                  {metrics.weeklyChangePercent > 0 ? `+${metrics.weeklyChangePercent}%` : `${metrics.weeklyChangePercent}%`} vs. Vorwoche
                </span>
              ) : (
                <span className="text-zinc-400">
                  {metrics.activeDaysCount > 1
                    ? `${metrics.activeDaysCount} ${lang === "de" ? "aktive Tage erfasst" : "active days recorded"}`
                    : (lang === "de" ? "50.000 Basis-Limit" : "50,000 Base Limit")}
                </span>
              )}
            </div>
            <div
              className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none transition ${
                isModern ? "bg-purple-500/5 group-hover:bg-purple-500/10" : "bg-cyan-500/10 group-hover:bg-cyan-500/20"
              }`}
            />
          </div>

          {/* Card 2: Ø Daily Queries */}
          <div
            className={`p-4 rounded-2xl relative overflow-hidden group transition border ${
              isModern
                ? "bg-[#141418] border-zinc-800 hover:border-zinc-700 shadow-md"
                : "bg-slate-950/80 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:border-emerald-400"
            }`}
          >
            <div className="text-[10px] uppercase font-bold flex items-center justify-between text-zinc-400">
              <span>{lang === "de" ? "Ø INVOCATIONS" : "Ø INVOCATIONS"}</span>
              <Cpu className={`w-4 h-4 ${isModern ? "text-emerald-400" : "text-emerald-400"}`} />
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isModern ? "text-zinc-100" : "text-emerald-300"}`}>
              {metrics.averageDailyQueries} <span className="text-base font-bold text-emerald-400">Req/Tag</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">{metrics.efficiencyScore}%</span>
              <span>{lang === "de" ? "Latenz-Effizienz" : "latency score"}</span>
            </div>
            <div
              className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none transition ${
                isModern ? "bg-emerald-500/5" : "bg-emerald-500/10 group-hover:bg-emerald-500/20"
              }`}
            />
          </div>

          {/* Card 3: Today's Consumption vs Limit */}
          <div
            className={`p-4 rounded-2xl relative overflow-hidden group transition border ${
              isModern
                ? "bg-[#141418] border-zinc-800 hover:border-zinc-700 shadow-md"
                : "bg-slate-950/80 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:border-amber-400"
            }`}
          >
            <div className="text-[10px] uppercase font-bold flex items-center justify-between text-zinc-400">
              <span>{lang === "de" ? "HEUTE GENUTZT" : "TODAY'S USAGE"}</span>
              <Flame className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-amber-400"}`} />
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isModern ? "text-purple-400" : "text-amber-300"}`}>
              {metrics.todayTokens.toLocaleString("de-DE")}
            </div>
            <div className="mt-1.5">
              <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isModern
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                      : "bg-gradient-to-r from-amber-400 to-rose-500"
                  }`}
                  style={{ width: `${metrics.percentUsedToday}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>{metrics.percentUsedToday}% Quota</span>
                <span>{metrics.dailyLimitTokens > 900000 ? "PRIORITY (∞ Limit)" : "50.000 max"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* INTERACTIVE DAILY USAGE TREND CHART (SVG WITH HOVER TOOLTIP) */}
        <div
          className={`p-4 sm:p-6 rounded-3xl space-y-4 border ${
            isModern
              ? "bg-[#141418]/90 border-zinc-800/90 shadow-lg"
              : "bg-slate-950/90 border-cyan-500/30"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
                <span>{lang === "de" ? "TÄGLICHER TOKENS-VERLAUF & Ø USAGE" : "DAILY TOKENS TIMELINE & Ø USAGE"}</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                {lang === "de"
                  ? `Verlauf der letzten ${selectedRange} Tage mit täglichen Spitzenzeiten und Ø-Referenzlinie`
                  : `Historical trajectory of the past ${selectedRange} days with peak operational windows`}
              </p>
            </div>

            {/* Range Toggle */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto ${
                isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-900 border-slate-700"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedRange(7)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedRange === 7
                    ? isModern
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                7 {lang === "de" ? "Tage" : "Days"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange(14)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedRange === 14
                    ? isModern
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                14 {lang === "de" ? "Tage" : "Days"}
              </button>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="relative pt-6 pb-2">
            {/* Average Baseline Indicator Line */}
            <div
              className={`absolute left-0 right-0 border-b border-dashed z-10 flex items-center justify-end pr-2 pointer-events-none ${
                isModern ? "border-zinc-600/60" : "border-cyan-400/50"
              }`}
              style={{
                bottom: `${Math.min(95, Math.max(10, (metrics.averageDailyTokens / maxTokens) * 160))}px`,
              }}
            >
              <span
                className={`px-2 py-0.5 rounded text-[9.5px] font-bold shadow-md -translate-y-3 ${
                  isModern
                    ? "bg-zinc-900 border border-zinc-700 text-zinc-300"
                    : "bg-cyan-950/90 border border-cyan-400/60 text-cyan-300"
                }`}
              >
                Ø {metrics.averageDailyTokens} Tokens
              </span>
            </div>

            {/* Bars */}
            <div className="grid grid-flow-col gap-2 sm:gap-3 items-end h-44 px-2">
              {visibleDays.map((day, idx) => {
                const isToday = idx === visibleDays.length - 1;
                const isHovered = hoveredDay?.date === day.date;
                const isPreCreation = day.isPreCreation || (day.tokens === 0 && day.date < (metrics.history[metrics.history.length - 1]?.date || "") && metrics.activeDaysCount === 1);
                const heightPercent = day.tokens > 0 
                  ? Math.min(100, Math.max(8, (day.tokens / maxTokens) * 100))
                  : 0;

                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div
                        className={`absolute -top-14 z-30 px-3 py-2 rounded-xl text-[11px] shadow-2xl pointer-events-none whitespace-nowrap animate-scaleUp border ${
                          isModern
                            ? "bg-zinc-900/95 border-zinc-700 text-zinc-100"
                            : "bg-slate-900 border-cyan-400 text-cyan-100"
                        }`}
                      >
                        <div className="font-bold text-white flex items-center justify-between gap-3">
                          <span>{day.formattedDate} ({day.dayName})</span>
                          <span className={`font-mono ${day.tokens > 0 ? (isModern ? "text-purple-400" : "text-cyan-300") : "text-zinc-500"}`}>
                            {day.tokens.toLocaleString("de-DE")} Tokens
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          {isPreCreation ? (
                            <span className="text-amber-400/90 font-medium">
                              🛡️ {lang === "de" ? "Account / Key noch nicht existent (0 Tokens)" : "Account not yet created (0 Tokens)"}
                            </span>
                          ) : day.tokens === 0 ? (
                            <span className="text-zinc-400">
                              ⚡ 0 Queries • {lang === "de" ? "Keine Invocations" : "No invocations"}
                            </span>
                          ) : (
                            <>
                              <span>⚡ {day.queries} Queries</span>
                              <span>🔥 Peak: {day.peakHour}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bar Pillar */}
                    <div className="w-full max-w-[48px] h-full flex items-end justify-center">
                      {day.tokens > 0 ? (
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                            isModern
                              ? isToday
                                ? "bg-gradient-to-t from-purple-600 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                : isHovered
                                ? "bg-gradient-to-t from-zinc-700 to-zinc-500"
                                : "bg-zinc-800 hover:bg-zinc-700"
                              : isToday
                              ? "bg-gradient-to-t from-cyan-600 via-teal-400 to-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                              : isHovered
                              ? "bg-gradient-to-t from-purple-600 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                              : "bg-gradient-to-t from-slate-900 via-slate-800 to-cyan-500/60 hover:to-cyan-400"
                          }`}
                        >
                          {/* Internal Shimmer */}
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      ) : (
                        <div
                          className={`w-full h-1.5 rounded-full transition ${
                            isPreCreation
                              ? "bg-zinc-800/40 border border-zinc-800/60 group-hover:border-zinc-600"
                              : "bg-zinc-800/60 border border-zinc-700/50 group-hover:border-zinc-500"
                          }`}
                        />
                      )}
                    </div>

                    {/* Day Label */}
                    <div className="text-center">
                      <span
                        className={`text-[10px] font-bold block ${
                          isToday
                            ? isModern
                              ? "text-purple-400 font-black"
                              : "text-cyan-300 font-black"
                            : isPreCreation
                            ? "text-zinc-600"
                            : "text-zinc-400"
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <span className={`text-[9px] hidden sm:block ${isPreCreation ? "text-zinc-600" : "text-zinc-500"}`}>
                        {day.date.slice(8, 10)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 8-AGENT CORE USAGE BREAKDOWN */}
        <div
          className={`p-4 sm:p-6 rounded-3xl space-y-4 border ${
            isModern
              ? "bg-[#141418]/90 border-zinc-800/90 shadow-lg"
              : "bg-slate-950/90 border-purple-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className={`w-4 h-4 ${isModern ? "text-zinc-300" : "text-purple-400"}`} />
              <span>{lang === "de" ? "8-CORE FLOTTEN-AUFTEILUNG (USAGE PER AGENT)" : "8-CORE AGENT FLEET BREAKDOWN"}</span>
            </h3>
            <span className={`text-xs font-bold ${isModern ? "text-zinc-400" : "text-purple-300"}`}>
              100% {lang === "de" ? "Sync" : "Sync"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.agentBreakdown.map((agent) => (
              <div
                key={agent.agentId}
                className={`p-3 rounded-2xl border transition space-y-2 ${
                  isModern
                    ? "bg-[#18181c]/80 border-zinc-800 hover:border-zinc-700"
                    : "bg-black/60 border-slate-800 hover:border-cyan-500/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: isModern ? (agent.agentId === "maze" ? "#a855f7" : agent.color) : agent.color,
                        boxShadow: `0 0 8px ${isModern ? (agent.agentId === "maze" ? "#a855f7" : agent.color) : agent.color}`,
                      }}
                    />
                    <span className="font-bold text-xs text-white tracking-wider">{agent.short}</span>
                  </div>
                  <span
                    className="text-xs font-black"
                    style={{ color: isModern ? (agent.agentId === "maze" ? "#a855f7" : agent.color) : agent.color }}
                  >
                    {agent.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${agent.percentage}%`,
                      backgroundColor: isModern ? (agent.agentId === "maze" ? "#a855f7" : agent.color) : agent.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{agent.tokens.toLocaleString("de-DE")} Tokens</span>
                  <span>{agent.queries} Queries</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CONTROLS & EXPORT */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t text-xs ${
            isModern ? "border-zinc-800/80 text-zinc-400" : "border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-4">
            <span>
              {lang === "de" ? "Zuletzt synchronisiert: " : "Last synced: "}
              <strong className={isModern ? "text-zinc-200" : "text-cyan-300"}>{metrics.lastUpdated} Uhr</strong>
            </span>
            <button
              onClick={handleReset}
              className="text-zinc-500 hover:text-rose-400 transition underline cursor-pointer text-[11px]"
            >
              {lang === "de" ? "Telemetrie zurücksetzen" : "Reset telemetry"}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`w-full sm:w-auto px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                isModern
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                  : "bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              }`}
            >
              {lang === "de" ? "SCHLIESSEN" : "CLOSE"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
