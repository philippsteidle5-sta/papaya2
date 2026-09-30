import React, { useState, useRef, useEffect } from "react";
import { copyToClipboard } from "../utils/clipboard";
import {
  Search,
  Code2,
  GitBranch,
  MapPin,
  Navigation,
  Layers,
  FileCode2,
  Route,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  X,
  ChevronDown,
  Check,
  Sparkles,
  Eye,
  Copy,
  Terminal,
  Activity,
  Cpu,
  Zap,
  ArrowRight
} from "lucide-react";
import { DraggableResizableWidget } from "./DraggableResizableWidget";

export interface CodeSpot {
  id: string;
  name: string;
  file: string;
  type: "component" | "hook" | "state" | "function" | "canvas";
  line: number;
  snippet: string;
  description: string;
  dependencies: string[];
}

export const CODE_SPOTS_DATABASE: CodeSpot[] = [
  {
    id: "app-core",
    name: "App.tsx (Main Voice & State Hub)",
    file: "/src/App.tsx",
    type: "component",
    line: 1,
    description: "Haupt-Orchestrierung für S.Y.N.T.A.X. Voice AI, WebGL Canvas Router, Multi-Agent States und VisionOS Layouts.",
    snippet: `// App.tsx - Main Entry Hub
export function App() {
  const [agents, setAgents] = useState<AgentConfig[]>(DEFAULT_AGENTS);
  const [currentAgent, setCurrentAgent] = useState<AgentConfig>(DEFAULT_AGENTS[0]);
  const [activeWidgets, setActiveWidgets] = useState<ActiveWidgetsConfig>({...});

  const handleSwitchAgent = (agent: AgentConfig) => {
    setCurrentAgent(agent);
    speakWelcome(agent);
  };
  return <MultiAssistantCanvas agents={agents} currentAgent={currentAgent} />;
}`,
    dependencies: ["MultiAssistantCanvas", "MazeCoreCustomizer"]
  },
  {
    id: "particle-sphere",
    name: "ParticleSphere.tsx (3D WebGL Engine)",
    file: "/src/components/ParticleSphere.tsx",
    type: "canvas",
    line: 1150,
    description: "Drei.js / Three.js 3D Partikel-Gitter mit 13 geometrischen Formen (Kristall, Helix, Vortex, Gyro, Torus) und Audio-Frequenz-Reaktivität.",
    snippet: `// ParticleSphere.tsx - WebGL Reactive Shader Core
export const ParticleSphere = ({ micLevel, speakingLevel, customShape, agentColor }) => {
  // Morphing between Sphere, Gyroscope, Torus Knot, Vortex and Helix
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    for (let i = 0; i < particleCount; i++) {
      const pos = calculateGeomPos(i, customShape, time, micLevel);
      positions.setXYZ(i, pos.x, pos.y, pos.z);
    }
  });
  return <points geometry={geom} material={mat} />;
};`,
    dependencies: ["Three.js", "React Three Fiber", "SimplexNoise"]
  },
  {
    id: "core-customizer",
    name: "MazeCoreCustomizer.tsx (Aura & Geometry Inspector)",
    file: "/src/components/MazeCoreCustomizer.tsx",
    type: "component",
    line: 1,
    description: "Einzelne Agenten-Anpassung: 13 Geometrien, Custom Color Picker, Partikel-Dichte (1k-10k) und Rotations-Speed Slider.",
    snippet: `// MazeCoreCustomizer.tsx - Per-Agent Core Customizer
export const MazeCoreCustomizer = ({ styling, onChangeStyling, agents }) => {
  const [selectedTarget, setSelectedTarget] = useState<string>("all");
  const updateField = (field, val) => {
    if (selectedTarget === "all") onChangeStyling({ ...styling, [field]: val });
    else updateAgentOverride(selectedTarget, field, val);
  };
  return <aside className="maze-core-customizer">...</aside>;
};`,
    dependencies: ["App.tsx", "MultiAssistantCanvas"]
  },
  {
    id: "chat-panel",
    name: "ChatPanel.tsx (Agent Voice & Speech Terminal)",
    file: "/src/components/ChatPanel.tsx",
    type: "component",
    line: 1,
    description: "Interaktives Sprach- & Text-Dialogfeld mit KI-Agenten-Antworten, TTS-Synthese und Echtzeit-Eingabe.",
    snippet: `// ChatPanel.tsx - Speech & Text Dialog Engine
export const ChatPanel = ({ currentAgent, messages, onSendMessage }) => {
  return (
    <div className="chat-panel">
      {messages.map(m => <ChatMessage key={m.id} message={m} />)}
    </div>
  );
};`,
    dependencies: ["App.tsx", "Gemini API"]
  },
  {
    id: "google-maps-widget",
    name: "GoogleMapsWidget.tsx (Autonomous Map Radar)",
    file: "/src/components/GoogleMapsWidget.tsx",
    type: "component",
    line: 1,
    description: "Google Maps Frame Integration mit Routen-Berechnung, Ortsdurchsuchung, Satellit-/Dark-Mode und Karten-Zoom.",
    snippet: `// GoogleMapsWidget.tsx - 3D Map Integration
export const GoogleMapsWidget = ({ activeMapData, setActiveMapData }) => {
  return <iframe src={\`https://maps.google.com/maps?q=\${activeMapData.city}&output=embed\`} />;
};`,
    dependencies: ["Google Maps Embed API"]
  }
];

export type CodeLayerType = "ast" | "heatmap" | "git" | "perf";

interface CodeMapsBarProps {
  isEditMode?: boolean;
  onClose?: () => void;
  isWidgetMode?: boolean;
  onSelectCodeSpot?: (spot: CodeSpot) => void;
}

export const CodeMapsBar: React.FC<CodeMapsBarProps> = ({
  isEditMode = false,
  onClose,
  isWidgetMode = false,
  onSelectCodeSpot,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [originSpot, setOriginSpot] = useState<string>("app-core");
  const [destSpot, setDestSpot] = useState<string>("particle-sphere");
  const [activeLayer, setActiveLayer] = useState<CodeLayerType>("ast");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [activeCodeModal, setActiveCodeModal] = useState<CodeSpot | null>(null);
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const layerMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node)) {
        setShowLayerMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSpots = CODE_SPOTS_DATABASE.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const originObj = CODE_SPOTS_DATABASE.find((s) => s.id === originSpot) || CODE_SPOTS_DATABASE[0];
  const destObj = CODE_SPOTS_DATABASE.find((s) => s.id === destSpot) || CODE_SPOTS_DATABASE[1];

  const handleCopyCode = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInspectSpot = (spot: CodeSpot) => {
    setActiveCodeModal(spot);
    setShowDropdown(false);
    if (onSelectCodeSpot) onSelectCodeSpot(spot);
  };

  // Render Inner Bar Content
  const barContent = (
    <div className="flex flex-col gap-2 p-2.5 bg-slate-950/90 border border-cyan-500/40 rounded-2xl backdrop-blur-2xl shadow-[0_0_30px_rgba(0,240,255,0.25)] font-mono text-xs w-full">
      
      {/* Top Header & Search Input (Google Maps Style) */}
      <div className="flex items-center gap-2 justify-between">
        
        {/* Left: Google Maps Style Search Container */}
        <div className="relative flex-1 flex items-center" ref={dropdownRef}>
          <div className="flex items-center gap-2 w-full bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 rounded-xl px-3 py-1.5 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition">
            <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-300">
              <Search className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Google Code Maps: Suche Funktionen, Dateipfade, Components..."
              className="w-full bg-transparent text-cyan-100 text-xs placeholder:text-slate-500 focus:outline-none"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setIsRouteMode(!isRouteMode)}
              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 ${
                isRouteMode
                  ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700"
              }`}
              title="Google Code Maps Routen-Planer umschalten"
            >
              <Navigation className="w-3 h-3" />
              <span>{isRouteMode ? "ROUTEN MODUS" : "ROUTEN-PLANER"}</span>
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showDropdown && filteredSpots.length > 0 && (
            <div className="absolute left-0 top-11 w-full bg-slate-950/95 border border-cyan-500/40 rounded-xl shadow-2xl p-2 z-50 animate-fade-in space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                <span>GEFUNDENE CODE SPOTS ({filteredSpots.length})</span>
                <MapPin className="w-3 h-3 text-cyan-400" />
              </div>

              {filteredSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleInspectSpot(spot)}
                  className="w-full text-left p-2 rounded-lg hover:bg-cyan-500/15 border border-transparent hover:border-cyan-500/30 transition cursor-pointer flex items-start justify-between gap-2 group"
                >
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-cyan-200 flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{spot.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-sm">{spot.description}</div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 flex-shrink-0">
                    Zeile {spot.line}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls: Layer Menu & Zoom */}
        <div className="flex items-center gap-1.5">
          {/* Layers Dropdown */}
          <div className="relative" ref={layerMenuRef}>
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`px-2.5 py-1.5 rounded-xl border text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
                showLayerMenu
                  ? "bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline uppercase">
                LAYERS: {activeLayer.toUpperCase()}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-10 w-52 bg-slate-950/95 border border-cyan-500/40 rounded-xl p-2 shadow-2xl z-50 animate-fade-in space-y-1 text-xs">
                <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                  CODE MAP EBENEN:
                </div>
                {[
                  { id: "ast", label: "🛰️ AST Component Tree", desc: "Vererbungs-Hierarchie" },
                  { id: "heatmap", label: "🚦 Code Heatmap", desc: "Ausführungs-Frequenz" },
                  { id: "git", label: "🧬 Git Blame Map", desc: "Commit & Code-Autoren" },
                  { id: "perf", label: "⚡ Performance Layer", desc: "FPS & Render-Zeit" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setActiveLayer(l.id as CodeLayerType);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg border text-[10.5px] transition cursor-pointer flex items-center justify-between ${
                      activeLayer === l.id
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{l.label}</div>
                      <div className="text-[8.5px] text-slate-400">{l.desc}</div>
                    </div>
                    {activeLayer === l.id && <Check className="w-3 h-3 text-cyan-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom Level Controls */}
          <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.min(160, z + 10))}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded cursor-pointer transition"
              title="Code Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold text-cyan-300 px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded cursor-pointer transition"
              title="Code Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Code Route Planner Bar (Google Route Navigation for Code) */}
      {isRouteMode && (
        <div className="p-2 bg-slate-900/80 border border-cyan-500/30 rounded-xl space-y-2 animate-fade-in text-[10.5px]">
          <div className="flex items-center justify-between text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Route className="w-3 h-3" />
              CODE CALL-ROUTE CALCULATOR
            </span>
            <span className="text-slate-400 font-mono">
              PFAD: O(N) // DEPTH: 4 CALLS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
            {/* Origin Select */}
            <div className="relative">
              <span className="text-[8px] text-cyan-400 font-bold block uppercase mb-0.5">Start Component:</span>
              <select
                value={originSpot}
                onChange={(e) => setOriginSpot(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
              >
                {CODE_SPOTS_DATABASE.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center justify-center text-cyan-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Destination Select */}
            <div className="relative">
              <span className="text-[8px] text-cyan-400 font-bold block uppercase mb-0.5">Ziel Funktion / Hook:</span>
              <select
                value={destSpot}
                onChange={(e) => setDestSpot(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
              >
                {CODE_SPOTS_DATABASE.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleInspectSpot(destObj)}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
            >
              <Navigation className="w-3 h-3 fill-slate-950" />
              <span>ROUTE INSPECT</span>
            </button>
          </div>

          {/* Route Call Chain Visualizer */}
          <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2 overflow-x-auto text-[9.5px]">
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              {originObj.name.split(" ")[0]}
            </span>
            <span className="text-slate-500">➔</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              React Context / Props
            </span>
            <span className="text-slate-500">➔</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
              {destObj.name.split(" ")[0]}
            </span>
            <span className="text-slate-500">➔</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              WebGL Shader Render Loop
            </span>
          </div>
        </div>
      )}

      {/* Quick Location Spots Shortcuts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 no-scrollbar text-[10px]">
        <span className="text-slate-500 font-bold uppercase text-[9px] flex-shrink-0 flex items-center gap-0.5">
          <MapPin className="w-2.5 h-2.5 text-cyan-400" /> CODE SPOTS:
        </span>

        {CODE_SPOTS_DATABASE.map((s) => (
          <button
            key={s.id}
            onClick={() => handleInspectSpot(s)}
            className="px-2 py-0.5 bg-slate-900/90 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 rounded-full text-slate-300 hover:text-cyan-200 cursor-pointer transition flex-shrink-0 flex items-center gap-1"
          >
            <span>📍</span>
            <span>{s.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Code Inspector Popover Modal */}
      {activeCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-hidden font-mono flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-cyan-200 text-sm">
                    {activeCodeModal.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {activeCodeModal.file} :: Zeile {activeCodeModal.line}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(activeCodeModal.snippet)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "COPIED" : "COPY SNIPPET"}</span>
                </button>
                <button
                  onClick={() => setActiveCodeModal(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description & Dependencies */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800 space-y-1.5 text-xs text-slate-300">
              <p>{activeCodeModal.description}</p>
              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                <span className="text-cyan-400 font-bold uppercase">DEPENDENCIES:</span>
                {activeCodeModal.dependencies.map((dep, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-slate-900 text-cyan-200 border border-slate-700"
                  >
                    #{dep}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="p-4 bg-slate-950 overflow-y-auto flex-1 font-mono text-xs text-cyan-300 leading-relaxed custom-scrollbar">
              <pre className="whitespace-pre-wrap select-text bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <code>{activeCodeModal.snippet}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Google Code Maps Inspection Radar</span>
              <button
                onClick={() => setActiveCodeModal(null)}
                className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition cursor-pointer uppercase"
              >
                SCHLIESSEN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isWidgetMode) {
    return (
      <DraggableResizableWidget
        id="codeMaps"
        title="GOOGLE CODE MAPS RADAR"
        initialX={120}
        initialY={130}
        initialWidth={600}
        initialHeight={260}
        minWidth={380}
        minHeight={180}
        isEditMode={isEditMode}
        onClose={onClose}
      >
        <div className="p-2">{barContent}</div>
      </DraggableResizableWidget>
    );
  }

  return barContent;
};
