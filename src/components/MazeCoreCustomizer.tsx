import React, { useState } from "react";
import { Sparkles, Activity, Eye, RotateCw, Palette, Sliders, X, Check, Shield, User, RotateCcw } from "lucide-react";
import { AgentConfig } from "../types";
import { useTheme } from "../utils/themeStore";

export type AllowedShape =
  | "auto"
  | "particle-orb"
  | "sphere"
  | "torus"
  | "torus-knot"
  | "gyroscope"
  | "vortex"
  | "crystal"
  | "helix"
  | "nebula"
  | "network"
  | "hourglass"
  | "chart"
  | "fusion"
  | "vega-orbital"
  | "black-hole-accretion"
  | "supernova-pulse"
  | "quantum-field"
  | "hyper-cube"
  | "mobius-strip"
  | "cyber-dna-quad"
  | "plasma-sphere"
  | "solar-flare"
  | "galaxy-spiral"
  | "prism-pyramid"
  | "matrix-rain"
  | "pulsar-star"
  | "hologram-cube"
  | "cosmic-string"
  | "chladni-plate"
  | "cyber-shield"
  | "wormhole-tunnel"
  | "ring-of-fire"
  | "atom-core"
  | "lissajous-knot";

export interface AgentCustomStyling {
  shape: AllowedShape;
  color: string;
  density?: number;
  speed?: number;
  audioSensitivity?: number;
}

export interface MazeCoreStyling {
  shape: AllowedShape;
  color: string;
  density: number; // 1000 to 10000
  speed: number; // 0.2 to 3.0
  audioSensitivity: number; // 0.5 to 3.0
  agentOverrides?: Record<string, AgentCustomStyling>;
}

interface MazeCoreCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  styling: MazeCoreStyling;
  onChangeStyling: (newStyling: MazeCoreStyling) => void;
  onSaveAndApply: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  agents?: AgentConfig[];
  currentAgent?: AgentConfig;
  onSelectAgent?: (agent: AgentConfig) => void;
}

const COLOR_PRESETS = [
  { name: "Agent Auto", hex: "auto" },
  { name: "Cyber Cyan", hex: "#00F0FF" },
  { name: "Solana Violet", hex: "#9945FF" },
  { name: "Laser Emerald", hex: "#00FF9D" },
  { name: "Gold Vault", hex: "#FFD700" },
  { name: "Crimson Red", hex: "#FF2A55" },
  { name: "Void Indigo", hex: "#6366F1" },
];

const SHAPES_LIST: { id: AllowedShape; label: string; sub: string; icon: string }[] = [
  {
    id: "auto",
    label: "Agent Signature",
    sub: "Auto Agent Morph",
    icon: "✨",
  },
  {
    id: "particle-orb",
    label: "NEURAL PARTICLE ORB",
    sub: "1400 3D Points & Energy Filaments",
    icon: "🔮",
  },
  {
    id: "vega-orbital",
    label: "VEGA // ACTIVE Orbit",
    sub: "Red Ellipse & Satellite Dots",
    icon: "🔴",
  },
  {
    id: "black-hole-accretion",
    label: "Accretion Jet Core",
    sub: "Black Hole & Relativistic Jets",
    icon: "🕳️",
  },
  {
    id: "supernova-pulse",
    label: "ORACLE // ACTIVE Disc",
    sub: "Flat Horizontal Particle Cloud",
    icon: "🟢",
  },
  {
    id: "quantum-field",
    label: "Quantum Field Grid",
    sub: "3D Wave Frequency Lattice",
    icon: "🌊",
  },
  {
    id: "hyper-cube",
    label: "4D Tesseract Matrix",
    sub: "Hyperdimensional Geometry",
    icon: "🧊",
  },
  {
    id: "mobius-strip",
    label: "Möbius Strip Loop",
    sub: "Infinite Twisted Surface",
    icon: "♾️",
  },
  {
    id: "cyber-dna-quad",
    label: "Quad Helix Strand",
    sub: "4-Chain Genetic Engine",
    icon: "🧬",
  },
  {
    id: "plasma-sphere",
    label: "Plasma Arc Discharge",
    sub: "High-Voltage Energy Arcs",
    icon: "⚡",
  },
  {
    id: "solar-flare",
    label: "Solar Corona Loop",
    sub: "Heliosphere Mass Ejection",
    icon: "☀️",
  },
  {
    id: "galaxy-spiral",
    label: "Galaxy Spiral Arms",
    sub: "Logarithmic Star Swirl",
    icon: "🌌",
  },
  {
    id: "prism-pyramid",
    label: "Hologram Pyramid",
    sub: "Optic Refraction Lattice",
    icon: "🔺",
  },
  {
    id: "matrix-rain",
    label: "Matrix Code Stream",
    sub: "3D Vertical Digital Drops",
    icon: "💻",
  },
  {
    id: "pulsar-star",
    label: "PULSE // ACTIVE Helix",
    sub: "Vertical Cylindrical Spring Coil",
    icon: "🌀",
  },
  {
    id: "hologram-cube",
    label: "Cyber Wireframe Box",
    sub: "Holographic Matrix Cage",
    icon: "📦",
  },
  {
    id: "cosmic-string",
    label: "Cosmic String Loop",
    sub: "Harmonic Vibrating Loop",
    icon: "🎗️",
  },
  {
    id: "chladni-plate",
    label: "Chladni Frequency Plate",
    sub: "Acoustic Resonance Nodal",
    icon: "🔊",
  },
  {
    id: "cyber-shield",
    label: "Hex Shield Dome",
    sub: "Geodesic Defense Field",
    icon: "🛡️",
  },
  {
    id: "wormhole-tunnel",
    label: "Wormhole Warp Field",
    sub: "Hyperspace Vector Funnel",
    icon: "🌀",
  },
  {
    id: "ring-of-fire",
    label: "Triple Ring Fusion",
    sub: "Interlocking Orthogonal Rings",
    icon: "🔥",
  },
  {
    id: "atom-core",
    label: "Bohr Atom Orbital",
    sub: "Electron Cloud Nucleus",
    icon: "⚛️",
  },
  {
    id: "lissajous-knot",
    label: "3D Lissajous Loop",
    sub: "Harmonic Parametric Knot",
    icon: "➰",
  },
  {
    id: "sphere",
    label: "Sphere / Orb",
    sub: "Standard Orbit Shell",
    icon: "🌐",
  },
  {
    id: "gyroscope",
    label: "Cyber Gyroscope",
    sub: "Dual Rotating Rings",
    icon: "🪐",
  },
  {
    id: "torus-knot",
    label: "Quantum Torus Knot",
    sub: "Infinite Ribbon Loop",
    icon: "🎗️",
  },
  {
    id: "torus",
    label: "Cyber Torus",
    sub: "Matrix Ring",
    icon: "🍩",
  },
  {
    id: "network",
    label: "Neural Network",
    sub: "3D Trend Lattice",
    icon: "🕸️",
  },
  {
    id: "hourglass",
    label: "Chrono Hourglass",
    sub: "Temporal Sand",
    icon: "⏳",
  },
  {
    id: "chart",
    label: "Crypto Chart",
    sub: "Market Wave Lattice",
    icon: "📊",
  },
  {
    id: "fusion",
    label: "Quad-Core Fusion",
    sub: "Nucleus Orbital",
    icon: "⚛️",
  },
  {
    id: "vortex",
    label: "Singularity Vortex",
    sub: "Black Hole Swirl",
    icon: "🌪️",
  },
  {
    id: "crystal",
    label: "Quantum Crystal",
    sub: "Polyhedron Lattice",
    icon: "💎",
  },
  {
    id: "helix",
    label: "Double Helix",
    sub: "DNA Strand",
    icon: "🧬",
  },
  {
    id: "nebula",
    label: "Nebula Wave",
    sub: "Particle Sheet",
    icon: "🌌",
  },
];

export const MazeCoreCustomizer: React.FC<MazeCoreCustomizerProps> = ({
  isOpen,
  onClose,
  styling,
  onChangeStyling,
  onSaveAndApply,
  isFocusMode = false,
  onToggleFocusMode,
  agents = [],
  currentAgent,
  onSelectAgent,
}) => {
  const { isModern } = useTheme();
  const [selectedTarget, setSelectedTarget] = useState<string>("all");

  if (!isOpen) return null;

  const overrides = styling.agentOverrides || {};
  const activeAgentCustom = selectedTarget !== "all" ? overrides[selectedTarget] : undefined;

  // Active values depending on whether "all" or a specific agent is selected
  const activeShape: AllowedShape = selectedTarget === "all"
    ? styling.shape
    : (activeAgentCustom?.shape ?? "auto");

  const activeColor: string = selectedTarget === "all"
    ? styling.color
    : (activeAgentCustom?.color ?? "auto");

  const activeDensity: number = selectedTarget === "all"
    ? styling.density
    : (activeAgentCustom?.density ?? styling.density);

  const activeSpeed: number = selectedTarget === "all"
    ? styling.speed
    : (activeAgentCustom?.speed ?? styling.speed);

  const activeAudioSens: number = selectedTarget === "all"
    ? styling.audioSensitivity
    : (activeAgentCustom?.audioSensitivity ?? styling.audioSensitivity);

  // Helper to update styling for "all" or specific agent
  const updateField = (field: keyof AgentCustomStyling, value: any) => {
    if (selectedTarget === "all") {
      if (field === "shape") onChangeStyling({ ...styling, shape: value });
      else if (field === "color") onChangeStyling({ ...styling, color: value });
      else if (field === "density") onChangeStyling({ ...styling, density: value });
      else if (field === "speed") onChangeStyling({ ...styling, speed: value });
      else if (field === "audioSensitivity") onChangeStyling({ ...styling, audioSensitivity: value });
    } else {
      const currentOverride = overrides[selectedTarget] || {
        shape: "auto",
        color: "auto",
        density: styling.density,
        speed: styling.speed,
        audioSensitivity: styling.audioSensitivity,
      };
      const updatedOverride = { ...currentOverride, [field]: value };
      const newOverrides = { ...overrides, [selectedTarget]: updatedOverride };
      onChangeStyling({ ...styling, agentOverrides: newOverrides });
    }
  };

  const handleResetTarget = () => {
    if (selectedTarget === "all") {
      onChangeStyling({
        shape: "auto",
        color: "auto",
        density: 5000,
        speed: 1.0,
        audioSensitivity: 1.0,
        agentOverrides: {},
      });
    } else {
      const newOverrides = { ...overrides };
      delete newOverrides[selectedTarget];
      onChangeStyling({ ...styling, agentOverrides: newOverrides });
    }
  };

  const handleSelectAgentTab = (agentId: string) => {
    setSelectedTarget(agentId);
    if (agentId !== "all" && onSelectAgent) {
      const found = agents.find((a) => a.id === agentId);
      if (found) onSelectAgent(found);
    }
  };

  const activeAgentConfig = agents.find((a) => a.id === selectedTarget);

  return (
    <aside className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[390px] h-full backdrop-blur-xl border-l flex flex-col animate-slide-in-right font-sans overflow-hidden ${
      isModern
        ? "bg-[#111116]/95 border-zinc-800 shadow-[-10px_0_40px_rgba(0,0,0,0.85)] text-zinc-200"
        : "bg-slate-950/90 border-cyan-500/30 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] text-slate-200"
    }`}>
      {/* Header Bar */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 flex-shrink-0 ${
        isModern
          ? "bg-[#14141a]/95 border-zinc-800"
          : "bg-slate-950/95 border-cyan-500/30"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            isModern
              ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
              : "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
          }`}>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className={`font-display font-black text-sm tracking-wider ${
              isModern ? "text-zinc-100" : "text-cyan-300"
            }`}>
              SYNTAX CORE STYLING
            </h2>
            <p className={`font-mono text-[9px] tracking-wide ${
              isModern ? "text-zinc-400" : "text-slate-400"
            }`}>
              EINZELNE AGENTEN & PARTIKEL STYLEN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isModern
                ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700"
            }`}
            title="Sidebar schliessen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Focus Mode Quick Action Banner */}
      {onToggleFocusMode && (
        <div className={`px-4 py-2 border-b flex items-center justify-between flex-shrink-0 ${
          isModern
            ? "bg-purple-500/10 border-purple-500/20"
            : "bg-cyan-500/10 border-cyan-500/20"
        }`}>
          <span className={`font-mono text-[9.5px] font-bold uppercase tracking-wider ${
            isModern ? "text-purple-300" : "text-cyan-300"
          }`}>
            Deep Black Canvas Preview
          </span>
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`px-2 py-0.5 rounded-lg border font-mono text-[9.5px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1 ${
              isFocusMode
                ? isModern
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)] animate-pulse"
                  : "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.6)] animate-pulse"
                : isModern
                ? "bg-zinc-900 hover:bg-zinc-800 text-purple-300 border-purple-500/40 hover:border-purple-400"
                : "bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 hover:border-cyan-400"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{isFocusMode ? "FOCUS ACTIVE" : "FOCUS PREVIEW"}</span>
          </button>
        </div>
      )}

      {/* Target Agent Switcher Rail */}
      <div className={`px-3 py-2 border-b flex flex-col gap-1.5 flex-shrink-0 ${
        isModern
          ? "bg-[#14141a]/80 border-zinc-800"
          : "bg-slate-900/80 border-slate-800"
      }`}>
        <div className="flex items-center justify-between">
          <span className={`font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 ${
            isModern ? "text-purple-300" : "text-cyan-400"
          }`}>
            <User className="w-3 h-3" />
            AGENT ZUM ANPASSEN WÄHLEN:
          </span>
          <button
            onClick={handleResetTarget}
            className={`text-[9px] font-mono flex items-center gap-1 transition cursor-pointer hover:underline ${
              isModern ? "text-zinc-400 hover:text-purple-300" : "text-slate-400 hover:text-cyan-300"
            }`}
            title="Auf Standard zurücksetzen"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Scrollable horizontal agent selector pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => handleSelectAgentTab("all")}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold whitespace-nowrap transition cursor-pointer ${
              selectedTarget === "all"
                ? isModern
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  : "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                : isModern
                ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            ALLE AGENTEN
          </button>

          {agents.map((ag) => {
            const isSelected = selectedTarget === ag.id;
            const hasCustom = overrides[ag.id] && (overrides[ag.id].shape !== "auto" || overrides[ag.id].color !== "auto");
            return (
              <button
                key={ag.id}
                onClick={() => handleSelectAgentTab(ag.id)}
                className={`relative px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? isModern
                      ? "bg-zinc-800 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                      : "bg-slate-800 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : isModern
                    ? "bg-zinc-950 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border-zinc-800"
                    : "bg-slate-950 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-800"
                }`}
                style={{
                  borderColor: isSelected ? ag.color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ag.color }}
                />
                <span>{ag.short}</span>
                {hasCustom && (
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isModern ? "bg-purple-400" : "bg-cyan-400"
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Target Banner */}
      <div className={`px-4 py-1.5 border-b flex items-center justify-between text-[10px] font-mono ${
        isModern
          ? "bg-zinc-900/50 border-zinc-800/60"
          : "bg-slate-900/50 border-slate-800/60"
      }`}>
        <span className={isModern ? "text-zinc-400" : "text-slate-400"}>Aktives Ziel:</span>
        <span className={`font-bold tracking-wider ${
          isModern ? "text-purple-300" : "text-cyan-300"
        }`}>
          {selectedTarget === "all"
            ? "GLOBAL (Alle 8 Agenten)"
            : `${activeAgentConfig?.name || selectedTarget.toUpperCase()} :: ${
                activeShape === "auto" ? "Signature Dynamic" : activeShape.toUpperCase()
              }`}
        </span>
      </div>

      {/* Customization Body - Scrollable */}
      <div className="p-3.5 space-y-4 flex-1 overflow-y-auto font-sans custom-scrollbar">
        
        {/* 1) Geometrie / Shape Grid */}
        <div className="space-y-2">
          <label className={`font-mono text-[11px] font-bold tracking-wider flex items-center justify-between ${
            isModern ? "text-purple-300" : "text-cyan-400"
          }`}>
            <span className="flex items-center gap-1.5">
              <Eye className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              1. GEOMETRIE & ANIMATION (34 SHAPES / 20+ NEU)
            </span>
            <span className={`text-[9px] font-normal ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
              {activeShape === "auto" ? "Auto Signature" : activeShape}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {SHAPES_LIST.map((item) => {
              const active = activeShape === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => updateField("shape", item.id)}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-16 ${
                    active
                      ? isModern
                        ? "bg-purple-500/20 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                        : "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      : isModern
                      ? "bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">{item.icon}</span>
                    {active && <Check className={`w-3.5 h-3.5 font-bold ${isModern ? "text-purple-300" : "text-cyan-300"}`} />}
                  </div>
                  <div>
                    <div className="font-mono text-[11px] font-bold tracking-wide truncate">{item.label}</div>
                    <div className={`text-[8.5px] leading-tight truncate ${isModern ? "text-zinc-400" : "text-slate-400"}`}>{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2) Color Palette & Custom Picker */}
        <div className={`space-y-2 border-t pt-3 ${isModern ? "border-zinc-800/80" : "border-slate-800/80"}`}>
          <label className={`font-mono text-[11px] font-bold tracking-wider flex items-center justify-between ${
            isModern ? "text-purple-300" : "text-cyan-400"
          }`}>
            <span className="flex items-center gap-1.5">
              <Palette className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              2. AURA FARBE & PICKER
            </span>
            <span className={`text-[9px] font-normal uppercase ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
              {activeColor}
            </span>
          </label>

          <div className="space-y-2">
            {/* Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              {COLOR_PRESETS.map((preset) => {
                const isSel = activeColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    onClick={() => updateField("color", preset.hex)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10.5px] font-mono transition cursor-pointer ${
                      isSel
                        ? isModern
                          ? "border-purple-400 bg-purple-500/20 text-purple-200 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                          : "border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                        : isModern
                        ? "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700"
                        : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {preset.hex === "auto" ? (
                      <span className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm flex-shrink-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400" />
                    ) : (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                    )}
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Selector */}
            <div className={`p-2 rounded-xl flex items-center gap-2 border ${
              isModern
                ? "bg-zinc-900/70 border-zinc-800"
                : "bg-slate-900/70 border-slate-800"
            }`}>
              <div className={`relative w-8 h-8 rounded-lg overflow-hidden border flex-shrink-0 ${
                isModern ? "border-purple-400/40" : "border-cyan-400/40"
              }`}>
                <input
                  type="color"
                  value={activeColor === "auto" ? "#00F0FF" : activeColor}
                  onChange={(e) => updateField("color", e.target.value)}
                  className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={activeColor}
                onChange={(e) => updateField("color", e.target.value)}
                placeholder="#00F0FF"
                className={`flex-1 rounded-lg px-2 py-1 font-mono text-[11px] tracking-wider uppercase focus:outline-none border ${
                  isModern
                    ? "bg-zinc-950 border-zinc-700 text-purple-300 focus:border-purple-500"
                    : "bg-slate-950 border-slate-700 text-cyan-300 focus:border-cyan-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3) Sliders: Density, Speed, Audio Sensitivity */}
        <div className={`space-y-2.5 border-t pt-3 ${isModern ? "border-zinc-800/80" : "border-slate-800/80"}`}>
          <label className={`font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 ${
            isModern ? "text-purple-300" : "text-cyan-400"
          }`}>
            <Sliders className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            3. DICHTE, SPEED & AUDIO-DYNAMIK
          </label>

          {/* Density Slider */}
          <div className={`space-y-1 p-2 rounded-xl border ${
            isModern
              ? "bg-zinc-900/50 border-zinc-800"
              : "bg-slate-900/50 border-slate-800"
          }`}>
            <div className="flex justify-between items-center font-mono text-[10.5px]">
              <span className={`font-medium ${isModern ? "text-zinc-300" : "text-slate-300"}`}>Partikel Dichte:</span>
              <span className={`font-bold ${isModern ? "text-purple-300" : "text-cyan-300"}`}>{activeDensity.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={activeDensity}
              onChange={(e) => updateField("density", Number(e.target.value))}
              className={`w-full cursor-pointer h-1.5 rounded-lg ${
                isModern
                  ? "accent-purple-500 bg-zinc-800"
                  : "accent-cyan-400 bg-slate-800"
              }`}
            />
            <div className={`flex justify-between text-[8px] font-mono ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
              <span>1k</span>
              <span>5k (Std)</span>
              <span>10k</span>
            </div>
          </div>

          {/* Rotation Speed Slider */}
          <div className={`space-y-1 p-2 rounded-xl border ${
            isModern
              ? "bg-zinc-900/50 border-zinc-800"
              : "bg-slate-900/50 border-slate-800"
          }`}>
            <div className="flex justify-between items-center font-mono text-[10.5px]">
              <span className={`font-medium flex items-center gap-1 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                <RotateCw className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
                Rotations-Speed:
              </span>
              <span className={`font-bold ${isModern ? "text-purple-300" : "text-cyan-300"}`}>{activeSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={activeSpeed}
              onChange={(e) => updateField("speed", Number(e.target.value))}
              className={`w-full cursor-pointer h-1.5 rounded-lg ${
                isModern
                  ? "accent-purple-500 bg-zinc-800"
                  : "accent-cyan-400 bg-slate-800"
              }`}
            />
            <div className={`flex justify-between text-[8px] font-mono ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
              <span>0.2x</span>
              <span>1.0x</span>
              <span>3.0x</span>
            </div>
          </div>

          {/* Audio Sensitivity Slider */}
          <div className={`space-y-1 p-2 rounded-xl border ${
            isModern
              ? "bg-zinc-900/50 border-zinc-800"
              : "bg-slate-900/50 border-slate-800"
          }`}>
            <div className="flex justify-between items-center font-mono text-[10.5px]">
              <span className={`font-medium flex items-center gap-1 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                <Activity className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
                Audio Sensitivität:
              </span>
              <span className={`font-bold ${isModern ? "text-purple-300" : "text-cyan-300"}`}>{activeAudioSens.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={activeAudioSens}
              onChange={(e) => updateField("audioSensitivity", Number(e.target.value))}
              className={`w-full cursor-pointer h-1.5 rounded-lg ${
                isModern
                  ? "accent-purple-500 bg-zinc-800"
                  : "accent-cyan-400 bg-slate-800"
              }`}
            />
            <div className={`flex justify-between text-[8px] font-mono ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
              <span>0.5x</span>
              <span>1.0x</span>
              <span>3.0x</span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Apply Controls */}
      <div className={`px-4 py-2.5 border-t flex items-center justify-between flex-shrink-0 ${
        isModern
          ? "bg-[#14141a] border-zinc-800"
          : "bg-slate-950 border-cyan-500/20"
      }`}>
        <div className={`text-[9px] font-mono flex items-center gap-1 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
          <Shield className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
          <span>ECHTZEIT CANVAS AKTIV</span>
        </div>

        <button
          onClick={() => {
            onSaveAndApply();
            onClose();
          }}
          className={`px-4 py-1.5 rounded-xl font-mono font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95 ${
            isModern
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>SAVE & APPLY</span>
        </button>
      </div>

    </aside>
  );
};

