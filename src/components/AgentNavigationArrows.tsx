import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AgentConfig } from "../types";
import { useTheme } from "../utils/themeStore";

interface AgentNavigationArrowsProps {
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  onSelectAgent: (agent: AgentConfig, direction: "next" | "prev") => void;
  showChat: boolean;
}

export const AgentNavigationArrows: React.FC<AgentNavigationArrowsProps> = ({
  agents,
  currentAgent,
  onSelectAgent,
  showChat,
}) => {
  const { isModern } = useTheme();
  const [isNavRailCollapsed, setIsNavRailCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("syntax_navrail_collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleNavRailToggle = () => {
      try {
        setIsNavRailCollapsed(localStorage.getItem("syntax_navrail_collapsed") === "true");
      } catch {}
    };

    window.addEventListener("syntax_navrail_toggle", handleNavRailToggle);
    window.addEventListener("storage", handleNavRailToggle);
    return () => {
      window.removeEventListener("syntax_navrail_toggle", handleNavRailToggle);
      window.removeEventListener("storage", handleNavRailToggle);
    };
  }, []);

  const currentIndex = agents.findIndex((a) => a.id === currentAgent.id);

  const prevIndex = (currentIndex - 1 + agents.length) % agents.length;
  const nextIndex = (currentIndex + 1) % agents.length;

  const prevAgent = agents[prevIndex];
  const nextAgent = agents[nextIndex];

  const handlePrev = () => {
    onSelectAgent(prevAgent, "prev");
  };

  const handleNext = () => {
    onSelectAgent(nextAgent, "next");
  };

  // Keyboard Left / Right arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, agents]);

  // Completely hide the floating side arrow buttons in modern theme (nav is handled via NavRail and bottom selector)
  if (isModern) {
    return null;
  }

  return (
    <>
      {/* Left Navigation Arrow Button (Previous Agent) */}
      <div
        className={`fixed ${
          isNavRailCollapsed ? "left-4 md:left-6" : "left-20 md:left-24"
        } top-1/2 -translate-y-1/2 z-30 flex items-center group select-none transition-all duration-300`}
      >
        <button
          onClick={handlePrev}
          aria-label={`Vorheriger Assistent: ${prevAgent.name}`}
          style={
            isModern
              ? {}
              : {
                  borderColor: prevAgent.color,
                  boxShadow: `0 0 20px ${prevAgent.color}30`,
                }
          }
          className={`relative w-11 h-14 md:w-12 md:h-16 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl ${
            isModern
              ? "bg-[#141418]/85 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white"
              : "bg-[#040812]/80 border text-white group-hover:bg-[#081226]/90 shadow-2xl"
          }`}
        >
          {!isModern && (
            <div
              style={{ backgroundColor: prevAgent.color }}
              className="absolute inset-0 rounded-2xl opacity-10 group-hover:opacity-30 blur-md transition duration-300"
            />
          )}

          <ChevronLeft
            style={isModern ? {} : { color: prevAgent.color }}
            className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 group-hover:-translate-x-0.5 ${
              isModern ? "text-zinc-300 group-hover:text-white" : "drop-shadow-[0_0_10px_currentColor]"
            }`}
          />

          <span
            className={`font-mono text-[8.5px] font-bold uppercase tracking-wider mt-0.5 ${
              isModern ? "text-zinc-500 group-hover:text-zinc-300" : "text-slate-400 group-hover:text-white"
            }`}
          >
            {prevAgent.railLetter}
          </span>
        </button>

        {/* Hover Tooltip - Previous Agent Info */}
        <div
          className={`absolute left-14 md:left-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap shadow-xl border ${
            isModern
              ? "bg-[#18181c]/95 border-zinc-800 text-zinc-200"
              : "bg-[#040812]/95 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          }`}
        >
          <div
            style={{ backgroundColor: isModern ? "#a855f7" : prevAgent.color }}
            className={`w-2 h-2 rounded-full ${!isModern ? "animate-ping" : ""}`}
          />
          <div>
            <div
              className={`font-mono text-[8.5px] uppercase tracking-widest ${
                isModern ? "text-zinc-400" : "text-slate-400"
              }`}
            >
              ◀ VORHERIGER CORE
            </div>
            <div
              style={isModern ? {} : { color: prevAgent.color }}
              className={`font-display font-bold text-xs md:text-sm tracking-wide ${
                isModern ? "text-zinc-100" : ""
              }`}
            >
              {prevAgent.name}
            </div>
          </div>
        </div>
      </div>

      {/* Right Navigation Arrow Button (Next Agent) */}
      <div
        className={`fixed ${
          showChat ? "right-6 md:right-8 lg:right-[420px]" : "right-6 md:right-10"
        } top-1/2 -translate-y-1/2 z-30 flex items-center group select-none transition-all duration-300`}
      >
        {/* Hover Tooltip - Next Agent Info */}
        <div
          className={`absolute right-14 md:right-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 -translate-x-2 group-hover:translate-x-0 px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap shadow-xl border ${
            isModern
              ? "bg-[#18181c]/95 border-zinc-800 text-zinc-200"
              : "bg-[#040812]/95 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          }`}
        >
          <div>
            <div
              className={`font-mono text-[8.5px] uppercase tracking-widest text-right ${
                isModern ? "text-zinc-400" : "text-slate-400"
              }`}
            >
              NÄCHSTER CORE ▶
            </div>
            <div
              style={isModern ? {} : { color: nextAgent.color }}
              className={`font-display font-bold text-xs md:text-sm tracking-wide text-right ${
                isModern ? "text-zinc-100" : ""
              }`}
            >
              {nextAgent.name}
            </div>
          </div>
          <div
            style={{ backgroundColor: isModern ? "#a855f7" : nextAgent.color }}
            className={`w-2 h-2 rounded-full ${!isModern ? "animate-ping" : ""}`}
          />
        </div>

        <button
          onClick={handleNext}
          aria-label={`Nächster Assistent: ${nextAgent.name}`}
          style={
            isModern
              ? {}
              : {
                  borderColor: nextAgent.color,
                  boxShadow: `0 0 20px ${nextAgent.color}30`,
                }
          }
          className={`relative w-11 h-14 md:w-12 md:h-16 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl ${
            isModern
              ? "bg-[#141418]/85 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white"
              : "bg-[#040812]/80 border text-white group-hover:bg-[#081226]/90 shadow-2xl"
          }`}
        >
          {!isModern && (
            <div
              style={{ backgroundColor: nextAgent.color }}
              className="absolute inset-0 rounded-2xl opacity-10 group-hover:opacity-30 blur-md transition duration-300"
            />
          )}

          <ChevronRight
            style={isModern ? {} : { color: nextAgent.color }}
            className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 group-hover:translate-x-0.5 ${
              isModern ? "text-zinc-300 group-hover:text-white" : "drop-shadow-[0_0_10px_currentColor]"
            }`}
          />

          <span
            className={`font-mono text-[8.5px] font-bold uppercase tracking-wider mt-0.5 ${
              isModern ? "text-zinc-500 group-hover:text-zinc-300" : "text-slate-400 group-hover:text-white"
            }`}
          >
            {nextAgent.railLetter}
          </span>
        </button>
      </div>
    </>
  );
};
