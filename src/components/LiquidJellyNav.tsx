import React from "react";
import { AgentConfig, CommunicationScope } from "../types";
import { LiquidJellyOrb } from "./LiquidJellyOrb";
import { 
  Calendar, 
  MessageSquare, 
  Mic, 
  Brain, 
  ChevronDown,
  LayoutGrid,
  MapPin,
} from "lucide-react";

interface LiquidJellyNavProps {
  currentAgent: AgentConfig;
  onOpenAgentPicker: () => void;
  communicationScope?: CommunicationScope;
  onSelectCommunicationScope?: (scope: CommunicationScope) => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  chatMessageCount?: number;
  isCalendarOpen: boolean;
  onToggleCalendar: () => void;
  micActive?: boolean;
  onToggleMic?: () => void;
  onOpenMemoryVault?: () => void;
  onOpenAgentInspector?: (agentId?: string) => void;
  onToggleCoreShape?: () => void;
  orientation?: "horizontal" | "vertical";
  isLayoutInstalled?: boolean;
  onOpenLayout?: () => void;
  isLayoutOpen?: boolean;
  isCalendarInstalled?: boolean;
  isGoogleMapsInstalled?: boolean;
  isGoogleMapsOpen?: boolean;
  onToggleGoogleMaps?: () => void;
}

export const LiquidJellyNav: React.FC<LiquidJellyNavProps> = ({
  currentAgent,
  onOpenAgentPicker,
  communicationScope = "SINGLE",
  onSelectCommunicationScope,
  isChatOpen,
  onToggleChat,
  chatMessageCount = 0,
  isCalendarOpen,
  onToggleCalendar,
  micActive = false,
  onToggleMic,
  onOpenAgentInspector,
  onToggleCoreShape,
  isLayoutInstalled = false,
  onOpenLayout,
  isLayoutOpen = false,
  isCalendarInstalled = true,
  isGoogleMapsInstalled = false,
  isGoogleMapsOpen = false,
  onToggleGoogleMaps,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center pointer-events-auto select-none">
      {/* Ambient Background Glow behind right dock */}
      <div
        className="absolute -top-10 -left-6 w-36 h-36 rounded-full pointer-events-none filter blur-2xl opacity-30 transition-all duration-700"
        style={{ background: currentAgent.color ? `${currentAgent.color}35` : "rgba(29, 108, 255, 0.16)" }}
      />
      <div
        className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full pointer-events-none filter blur-2xl opacity-25 transition-all duration-700"
        style={{ background: currentAgent.color ? `${currentAgent.color}25` : "rgba(66, 177, 255, 0.12)" }}
      />

      {/* Main Liquid Jelly Navigation Bar - Sleek vertical rail on right */}
      <nav
        className="relative flex flex-col items-center gap-2 p-2 sm:p-2.5 rounded-[28px] transition-all duration-300"
        style={{
          border: `1px solid ${currentAgent.color ? `${currentAgent.color}35` : "rgba(255, 255, 255, 0.085)"}`,
          background: "linear-gradient(180deg, rgba(25, 26, 27, 0.95), rgba(9, 10, 11, 0.985))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: `0 25px 60px rgba(0,0,0,0.7), 0 10px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.95)`,
        }}
      >
        {/* Three.js Liquid Jelly Energy Orb */}
        <div className="relative flex-shrink-0 flex items-center justify-center my-0.5">
          <LiquidJellyOrb
            size={56}
            agentColor={currentAgent.color || "#00f0ff"}
            onClick={onToggleCoreShape}
          />
        </div>

        <div className="w-7 h-px bg-white/10 my-0.5" />

        {/* Rail Items - Vertical Stack */}
        <div className="flex flex-col items-center gap-2">
          {/* Item 1: Active Agent Picker */}
          <button
            type="button"
            onClick={onOpenAgentPicker}
            className="group relative flex items-center justify-center w-11 h-11 rounded-2xl border border-white/[0.08] hover:border-white/[0.22] bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] text-zinc-200 hover:text-white transition-all duration-300 cursor-pointer overflow-hidden font-mono font-bold shadow-md"
            title={`Aktiver Core: ${currentAgent.name} (Klicken zum Wechseln)`}
          >
            <span className="absolute -top-[120%] -left-[45%] w-[42%] h-[340%] bg-gradient-to-r from-transparent via-white/15 to-transparent rotate-[16deg] opacity-0 group-hover:opacity-100 group-hover:left-[110%] transition-all duration-700 pointer-events-none" />
            <div className="flex flex-col items-center justify-center">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm mb-0.5"
                style={{ backgroundColor: currentAgent.color || "#ff6b35" }}
              />
              <span className="text-[10px] uppercase tracking-tighter">
                {(currentAgent.short || currentAgent.name).slice(0, 3)}
              </span>
            </div>
          </button>



          {/* Item 3: Live Mic Button */}
          {onToggleMic && (
            <button
              type="button"
              onClick={onToggleMic}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                micActive
                  ? "bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse"
                  : "border-white/[0.08] hover:border-white/[0.2] bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] text-zinc-300 hover:text-white"
              }`}
              title={micActive ? "Mikrofon aktiv (Hört zu...)" : "Sprachsteuerung starten"}
            >
              <span className="absolute -top-[120%] -left-[45%] w-[42%] h-[340%] bg-gradient-to-r from-transparent via-white/15 to-transparent rotate-[16deg] opacity-0 group-hover:opacity-100 group-hover:left-[110%] transition-all duration-700 pointer-events-none" />
              <Mic className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          )}


          {/* Item 4: Layout App (ONLY VISIBLE ONCE INSTALLED) */}
          {isLayoutInstalled && (
            <button
              type="button"
              onClick={onOpenLayout}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isLayoutOpen
                  ? "bg-[#ff8a3d]/25 border-[#ff8a3d] text-[#ff8a3d] shadow-[0_0_20px_rgba(255,138,61,0.5)]"
                  : "border-white/[0.08] hover:border-[#ff8a3d]/40 bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] text-zinc-300 hover:text-white"
              }`}
              title={isLayoutOpen ? "Layout Editor schließen" : "Layout App (Workspace & Cores) öffnen"}
            >
              <span className="absolute -top-[120%] -left-[45%] w-[42%] h-[340%] bg-gradient-to-r from-transparent via-white/15 to-transparent rotate-[16deg] opacity-0 group-hover:opacity-100 group-hover:left-[110%] transition-all duration-700 pointer-events-none" />
              <LayoutGrid className="w-4 h-4 text-[#ff8a3d] shrink-0" />
            </button>
          )}

          {/* Item 5: Chronos All-in-One Calendar Trigger (ONLY VISIBLE ONCE INSTALLED) */}
          {isCalendarInstalled && (
            <button
              type="button"
              onClick={onToggleCalendar}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isCalendarOpen
                  ? "bg-purple-600/35 border-purple-400 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.45)]"
                  : "border-white/[0.08] hover:border-white/[0.2] bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] text-zinc-300 hover:text-white"
              }`}
              title={isCalendarOpen ? "Kalender schließen" : "Kalender (Termine, Subscriptions, Fokus) öffnen"}
            >
              <span className="absolute -top-[120%] -left-[45%] w-[42%] h-[340%] bg-gradient-to-r from-transparent via-white/15 to-transparent rotate-[16deg] opacity-0 group-hover:opacity-100 group-hover:left-[110%] transition-all duration-700 pointer-events-none" />
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
            </button>
          )}

          {/* Item 5.5: Google Maps Trigger (ONLY VISIBLE ONCE INSTALLED) */}
          {isGoogleMapsInstalled && onToggleGoogleMaps && (
            <button
              type="button"
              onClick={onToggleGoogleMaps}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isGoogleMapsOpen
                  ? "bg-emerald-600/35 border-emerald-400 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                  : "border-white/[0.08] hover:border-emerald-400/40 bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] text-zinc-300 hover:text-white"
              }`}
              title={isGoogleMapsOpen ? "Google Maps schließen" : "Google Maps (3D-Map, Navigation & Orte) öffnen"}
            >
              <span className="absolute -top-[120%] -left-[45%] w-[42%] h-[340%] bg-gradient-to-r from-transparent via-white/15 to-transparent rotate-[16deg] opacity-0 group-hover:opacity-100 group-hover:left-[110%] transition-all duration-700 pointer-events-none" />
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>
          )}

          {/* Item 6: Synapse / Memory Inspector Trigger */}
          {onOpenAgentInspector && (
            <button
              type="button"
              onClick={() => onOpenAgentInspector(currentAgent.id)}
              className="group relative flex items-center justify-center w-11 h-11 rounded-2xl border border-white/[0.08] hover:border-white/[0.2] bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] text-zinc-400 hover:text-cyan-300 transition-all duration-300 cursor-pointer overflow-hidden"
              title="Memory Vault & Synapsen-Inspektor öffnen"
            >
              <span className="absolute -top-[120%] -left-[45%] w-[42%] h-[340%] bg-gradient-to-r from-transparent via-white/15 to-transparent rotate-[16deg] opacity-0 group-hover:opacity-100 group-hover:left-[110%] transition-all duration-700 pointer-events-none" />
              <Brain className="w-4 h-4 text-cyan-400" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
