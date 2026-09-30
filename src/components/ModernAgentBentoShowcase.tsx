import React, { useState } from "react";
import {
  Cpu,
  Zap,
  Sparkles,
  ShieldCheck,
  Video,
  Mail,
  Share2,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Activity,
  Award,
  Lock,
  ChevronRight,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";
import { AgentConfig } from "../types";
import { getAgentSpecialtyData } from "./AgentCinematicShowcaseModal";

interface ModernAgentBentoShowcaseProps {
  agents: AgentConfig[];
  lang?: "de" | "en";
  onSelectAgentAndStart: (agentId: string) => void;
  onOpenUpgradeModal?: (tierName: string) => void;
}

export const ModernAgentBentoShowcase: React.FC<ModernAgentBentoShowcaseProps> = ({
  agents,
  lang = "de",
  onSelectAgentAndStart,
  onOpenUpgradeModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeAgentId, setActiveAgentId] = useState<string>(agents[0]?.id || "maze");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const isDe = lang === "de";

  const categories = [
    { id: "all", label: isDe ? "Alle (8)" : "All (8)" },
    { id: "core", label: isDe ? "Master & Core" : "Master & Core" },
    { id: "tech", label: isDe ? "Code & Security" : "Code & Security" },
    { id: "media", label: isDe ? "Video & Social" : "Video & Social" },
    { id: "intel", label: isDe ? "Finanzen & Web" : "Finance & Web" },
  ];

  const agentCategoryMap: Record<string, string> = {
    maze: "core",
    neo: "core",
    vega: "tech",
    apex: "tech",
    odin: "intel",
    chronos: "intel",
    pulse: "media",
    globe: "media",
  };

  const filteredAgents = agents.filter((ag) => {
    const matchesCategory = selectedCategory === "all" || agentCategoryMap[ag.id] === selectedCategory;
    const matchesSearch =
      ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ag.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeSpecialty = getAgentSpecialtyData(activeAgentId, lang);
  const activeAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Category Pills & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-[#090d18] border border-zinc-800">
        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-zinc-100 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isDe ? "Agenten durchsuchen..." : "Search agents..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
          />
        </div>
      </div>

      {/* Bento Grid: 8 Modern Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredAgents.map((agent) => {
          const specialty = getAgentSpecialtyData(agent.id, lang);
          const isSelected = activeAgentId === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? "bg-[#0f1526] border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50"
                  : "bg-[#090d19] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#0c1222]"
              }`}
            >
              {/* Top Accent Color Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition"
                style={{ backgroundColor: agent.color || "#06b6d4" }}
              />

              {/* Agent Header & Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs text-white shadow-md"
                      style={{ backgroundColor: `${agent.color}25`, border: `1px solid ${agent.color}60` }}
                    >
                      {agent.railLetter || agent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                        {agent.name}
                      </h4>
                      <div className="text-[10px] font-mono text-zinc-400">
                        {agent.short}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold">
                    ONLINE
                  </span>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {specialty.tagline}
                </p>

                {/* Specialties Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                  {specialty.specialties.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer with Launch Button */}
              <div className="pt-4 mt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">
                  {specialty.metrics[0]?.value || "< 45 ms"}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAgentAndStart(agent.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-slate-950 text-zinc-200 font-mono text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer group-hover:bg-cyan-500 group-hover:text-slate-950"
                >
                  <span>{isDe ? "Starten" : "Launch"}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Live Capability Inspector Panel */}
      {activeAgent && activeSpecialty && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1426] via-[#090e1c] to-[#0a0f20] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            {/* Agent Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-base text-white shadow-lg"
                  style={{ backgroundColor: `${activeAgent.color}30`, border: `2px solid ${activeAgent.color}` }}
                >
                  {activeAgent.railLetter || activeAgent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      {activeSpecialty.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono text-[10px] font-bold">
                      {activeSpecialty.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                    {activeSpecialty.subTitle}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans max-w-3xl">
                {activeSpecialty.description}
              </p>

              {/* Specialties 4-Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {activeSpecialty.specialties.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics & Launch CTA */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-black/60 border border-zinc-800 space-y-4 text-center">
              <div className="grid grid-cols-3 gap-2">
                {activeSpecialty.metrics.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[10px] font-mono text-zinc-400 truncate">{m.label}</div>
                    <div className="text-xs sm:text-sm font-mono font-black text-cyan-300 mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onSelectAgentAndStart(activeAgent.id)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
              >
                <span>{isDe ? `MIT ${activeAgent.name} STARTEN` : `START WITH ${activeAgent.name}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
