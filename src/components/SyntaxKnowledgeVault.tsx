import React, { useState } from "react";
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Tag,
  Check,
  Cpu,
  Bookmark,
  Share2,
  Lock,
  Circle,
  LayoutGrid,
  Radio,
} from "lucide-react";
import { useTheme } from "../utils/themeStore";

interface MemoryNode {
  id: string;
  category: "PROJECT" | "PREFERENCE" | "API_INTEGRATION" | "CORE_RULE";
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  particleColor?: string;
}

const INITIAL_MEMORIES: MemoryNode[] = [
  {
    id: "mem-1",
    category: "PROJECT",
    title: "getsyntax.ai Architektur",
    content: "Sovereign Multi-Agent Kernsystem mit 8 spezialisierten Agenten, Vite/React, Tailwind CSS und 3D-Matrix.",
    tags: ["architecture", "react", "3d", "syntax"],
    updatedAt: "Heute, 10:45",
    particleColor: "#a855f7", // Vibrant Purple
  },
  {
    id: "mem-2",
    category: "PREFERENCE",
    title: "User Kommunikations-Stil",
    content: "Direkt, fokussiert, präzise ohne Floskeln. Höchste Priorität auf visuelle Ästhetik, Cyberpunk-Design und makellose Funktionalität.",
    tags: ["user", "preferences", "cyberpunk"],
    updatedAt: "Heute, 09:30",
    particleColor: "#ec4899", // Vibrant Rose/Pink
  },
  {
    id: "mem-3",
    category: "API_INTEGRATION",
    title: "Google Workspace & Veo 3.1",
    content: "OAuth-Client für Gmail & Drive Synchronisation sowie exklusives 8K Video Studio für N.E.O. / P.U.L.S.E.",
    tags: ["gmail", "veo3", "google-api"],
    updatedAt: "Gestern, 18:20",
    particleColor: "#06b6d4", // Vibrant Cyan
  },
  {
    id: "mem-4",
    category: "CORE_RULE",
    title: "Sovereign Master Brain Hierarchie",
    content: "S.Y.N.T.A.X. ist der zentrale Boss in der Mitte. Vega (Rot), Pulse (Lila), Globe (Blau), Odin (Weiß-Blau), Chronos (Gelb), Oracle (Grün), Neo (Pink).",
    tags: ["fleet", "boss", "hierarchy"],
    updatedAt: "Gestern, 14:15",
    particleColor: "#10b981", // Vibrant Emerald
  },
  {
    id: "mem-5",
    category: "PROJECT",
    title: "Shopify E-Com Integration",
    content: "Autonomer 24/7 Kunden-Concierge, Bestands-Tracking und automatische Produkt-Listings.",
    tags: ["shopify", "ecom", "sales"],
    updatedAt: "Gestern, 12:00",
    particleColor: "#8b5cf6", // Vibrant Violet
  },
  {
    id: "mem-6",
    category: "PREFERENCE",
    title: "Dark Minimalist Theme",
    content: "Dunkle Obsidian-Ästhetik mit purpurnen und violetten Neon-Akzenten statt greller Gradients.",
    tags: ["theme", "minimal", "purple"],
    updatedAt: "Vorgestern",
    particleColor: "#f59e0b", // Vibrant Amber
  },
];

export const SyntaxKnowledgeVault: React.FC = () => {
  const { isModern } = useTheme();
  const [memories, setMemories] = useState<MemoryNode[]>(INITIAL_MEMORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"PARTICLES" | "GRID">("PARTICLES");
  const [selectedMemory, setSelectedMemory] = useState<MemoryNode | null>(INITIAL_MEMORIES[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryNode["category"]>("PROJECT");
  const [newTags, setNewTags] = useState("");

  const getCategoryColorCode = (cat: MemoryNode["category"]) => {
    switch (cat) {
      case "PROJECT":
        return "#a855f7"; // Purple
      case "PREFERENCE":
        return "#ec4899"; // Rose
      case "API_INTEGRATION":
        return "#06b6d4"; // Cyan
      case "CORE_RULE":
        return "#10b981"; // Emerald
      default:
        return "#f59e0b"; // Amber
    }
  };

  const handleAddMemory = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNode: MemoryNode = {
      id: `mem-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      updatedAt: "Gerade eben",
      particleColor: getCategoryColorCode(newCategory),
    };

    setMemories([newNode, ...memories]);
    setSelectedMemory(newNode);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getCategoryColor = (cat: MemoryNode["category"]) => {
    switch (cat) {
      case "PROJECT":
        return "text-purple-300 border-purple-500/40 bg-purple-950/40";
      case "PREFERENCE":
        return "text-pink-300 border-pink-500/40 bg-pink-950/40";
      case "API_INTEGRATION":
        return "text-cyan-300 border-cyan-500/40 bg-cyan-950/40";
      case "CORE_RULE":
        return "text-emerald-300 border-emerald-500/40 bg-emerald-950/40";
    }
  };

  return (
    <div className={`w-full h-full p-4 md:p-6 overflow-y-auto font-sans flex flex-col gap-5 ${
      isModern ? "bg-[#0c0c10] text-zinc-100" : "bg-[#02050f] text-slate-100"
    }`}>
      
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border ${
        isModern
          ? "bg-[#141419] border-zinc-800 shadow-md"
          : "bg-slate-950/90 border-cyan-500/30"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            isModern
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-cyan-500/20 border-cyan-400 text-cyan-300"
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
              isModern ? "text-zinc-400" : "text-cyan-400"
            }`}>
              PERSISTENT MEMORY & KNOWLEDGE
            </span>
            <h2 className="text-base font-black text-white font-mono">S.Y.N.T.A.X. KNOWLEDGE VAULT</h2>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
            isModern
              ? "bg-red-600 hover:bg-red-500 text-white shadow-md border border-red-500"
              : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>NEUES WISSEN HINZUFÜGEN</span>
        </button>
      </div>

      {/* Add Memory Modal/Form */}
      {isAdding && (
        <div className={`p-4 rounded-2xl border flex flex-col gap-3 font-mono ${
          isModern
            ? "bg-[#141419] border-zinc-700 shadow-xl"
            : "bg-slate-950 border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.15)]"
        }`}>
          <div className={`text-xs font-bold uppercase ${isModern ? "text-zinc-200" : "text-cyan-300"}`}>
            Neuen Kontext-Knoten erfassen
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Titel des Eintrags..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`rounded-xl px-3 py-2 text-xs focus:outline-none ${
                isModern
                  ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-red-500"
                  : "bg-slate-900 border border-slate-800 text-cyan-100 placeholder-slate-500 focus:border-cyan-400"
              }`}
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className={`rounded-xl px-3 py-2 text-xs focus:outline-none ${
                isModern
                  ? "bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-red-500"
                  : "bg-slate-900 border border-slate-800 text-cyan-100 focus:border-cyan-400"
              }`}
            >
              <option value="PROJECT">Projekt & Architektur</option>
              <option value="PREFERENCE">Benutzer-Präferenzen</option>
              <option value="API_INTEGRATION">API & Schnittstellen</option>
              <option value="CORE_RULE">Sovereign Core Regeln</option>
            </select>
          </div>
          <textarea
            placeholder="Wissensinhalt, Regeln oder Kontextdaten eingeben..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className={`w-full rounded-xl p-3 text-xs focus:outline-none ${
              isModern
                ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-red-500"
                : "bg-slate-900 border border-slate-800 text-cyan-100 placeholder-slate-500 focus:border-cyan-400"
            }`}
          />
          <input
            type="text"
            placeholder="Tags durch Kommas getrennt (z.B. frontend, gemini, api)..."
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className={`rounded-xl px-3 py-2 text-xs focus:outline-none ${
              isModern
                ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-red-500"
                : "bg-slate-900 border border-slate-800 text-cyan-100 placeholder-slate-500 focus:border-cyan-400"
            }`}
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAdding(false)}
              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                isModern
                  ? "bg-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Abbrechen
            </button>
            <button
              onClick={handleAddMemory}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                isModern
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              }`}
            >
              Im Vault speichern
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar + View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Wissen & Tags durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none ${
                isModern
                  ? "bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-purple-500"
                  : "bg-slate-950 border border-slate-800 text-purple-100 placeholder-slate-500 focus:border-purple-400"
              }`}
            />
          </div>

          {/* View Mode Toggle: Particles vs Grid */}
          <div className="flex items-center bg-slate-950/80 border border-purple-500/30 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("PARTICLES")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "PARTICLES"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Erinnerungen als Partikel-Matrix anzeigen"
            >
              <Circle className="w-3 h-3 fill-current text-fuchsia-300" />
              <span>PARTIKEL</span>
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Klassische Kachel-Ansicht"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>KARTEN</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto font-mono text-[10px]">
          {["ALL", "PROJECT", "PREFERENCE", "API_INTEGRATION", "CORE_RULE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap border ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                  : isModern
                  ? "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode: Interactive Particles Matrix */}
      {viewMode === "PARTICLES" ? (
        <div className={`p-4 sm:p-6 rounded-3xl border flex flex-col lg:flex-row gap-5 relative overflow-hidden ${
          isModern ? "bg-[#111116] border-purple-500/20" : "bg-[#030614] border-purple-500/30"
        }`}>
          {/* Particle Orbit Area */}
          <div className="flex-1 min-h-[340px] sm:min-h-[400px] relative rounded-2xl bg-black/60 border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
            {/* Ambient Nebula Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Particle Canvas Top Status */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-bold">SYNAPSE NEURAL MATRIX</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-purple-500/30 text-purple-300 font-bold">
                {filteredMemories.length} Erinnerungs-Partikel aktiv
              </span>
            </div>

            {/* Floating Colorful Circular Memory Particles */}
            <div className="relative w-full h-[260px] sm:h-[300px] my-auto flex items-center justify-center">
              {filteredMemories.map((mem, index) => {
                const total = filteredMemories.length;
                const angle = (index / total) * Math.PI * 2;
                const radius = 105; // radius in px
                const posX = Math.cos(angle) * radius;
                const posY = Math.sin(angle) * radius;
                const isSelected = selectedMemory?.id === mem.id;

                return (
                  <div
                    key={mem.id}
                    style={{
                      transform: `translate(${posX}px, ${posY}px)`,
                    }}
                    onClick={() => setSelectedMemory(mem)}
                    className="absolute cursor-pointer group flex flex-col items-center justify-center transition-all duration-300 z-20"
                  >
                    {/* Synapse Connection Line to Center */}
                    <div
                      style={{
                        width: `${radius}px`,
                        transform: `rotate(${angle + Math.PI}deg)`,
                        transformOrigin: "left center",
                      }}
                      className={`absolute left-1/2 top-1/2 h-[1px] pointer-events-none transition-opacity ${
                        isSelected ? "bg-purple-400 opacity-60" : "bg-purple-600/20 opacity-30 group-hover:opacity-60"
                      }`}
                    />

                    {/* Simple Round Circle Particle in Distinct Colors */}
                    <div
                      style={{
                        backgroundColor: mem.particleColor || getCategoryColorCode(mem.category),
                        boxShadow: isSelected
                          ? `0 0 24px ${mem.particleColor || getCategoryColorCode(mem.category)}, 0 0 10px #ffffff`
                          : `0 0 14px ${mem.particleColor || getCategoryColorCode(mem.category)}`,
                      }}
                      className={`rounded-full transition-all duration-300 relative flex items-center justify-center ${
                        isSelected ? "w-8 h-8 scale-125 ring-2 ring-white" : "w-6 h-6 hover:scale-125"
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white/95" />
                    </div>

                    {/* Compact Label */}
                    <span className={`text-[10px] font-mono mt-1.5 px-2 py-0.5 rounded-full border whitespace-nowrap transition ${
                      isSelected
                        ? "bg-purple-950 text-purple-200 border-purple-400 font-bold shadow-lg"
                        : "bg-slate-950/80 text-slate-300 border-slate-800 group-hover:border-purple-500/50"
                    }`}>
                      {mem.title}
                    </span>
                  </div>
                );
              })}

              {/* Center Core Node */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-900 to-indigo-900 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] z-10">
                <Cpu className="w-6 h-6 text-purple-200 animate-pulse" />
              </div>
            </div>

            {/* Bottom Color Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono pt-2 border-t border-slate-900 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                <span className="text-slate-300">Projekt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
                <span className="text-slate-300">Präferenzen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                <span className="text-slate-300">API & OAuth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-slate-300">Core Regeln</span>
              </div>
            </div>
          </div>

          {/* Selected Memory Inspection Card */}
          <div className="w-full lg:w-80 flex flex-col justify-between p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30">
            {selectedMemory ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getCategoryColor(
                      selectedMemory.category
                    )}`}
                  >
                    {selectedMemory.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{selectedMemory.updatedAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedMemory.particleColor || getCategoryColorCode(selectedMemory.category) }}
                  />
                  <h3 className="text-base font-bold text-white font-mono">{selectedMemory.title}</h3>
                </div>

                <p className="text-xs leading-relaxed font-sans text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {selectedMemory.content}
                </p>

                <div className="flex items-center gap-1 flex-wrap mt-1">
                  {selectedMemory.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[9px] font-mono px-2 py-0.5 rounded border bg-purple-950/40 text-purple-300 border-purple-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between mt-2">
                  <span className="text-[10px] font-mono text-slate-400">Erinnerungs-Synapse: 100% Intakt</span>
                  <button
                    onClick={() => handleDelete(selectedMemory.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                    title="Partikel löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Klicke auf einen Farb-Partikel im Orbit, um die Erinnerung zu inspizieren.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Memory Nodes Classic Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className={`p-4 rounded-2xl border transition duration-200 shadow-md flex flex-col justify-between group ${
                isModern
                  ? "bg-[#141419] border-zinc-800/80 hover:border-zinc-700"
                  : "bg-slate-950/80 border-slate-800 hover:border-purple-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: mem.particleColor || getCategoryColorCode(mem.category) }}
                    />
                    <span
                      className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getCategoryColor(
                        mem.category
                      )}`}
                    >
                      {mem.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{mem.updatedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-white font-mono mb-1">{mem.title}</h3>
                <p className={`text-xs leading-relaxed font-sans ${isModern ? "text-zinc-300" : "text-slate-300"}`}>{mem.content}</p>
              </div>

              <div className={`mt-3 pt-2 border-t flex items-center justify-between ${
                isModern ? "border-zinc-800/80" : "border-slate-900"
              }`}>
                <div className="flex items-center gap-1 flex-wrap">
                  {mem.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        isModern
                          ? "bg-zinc-900 text-zinc-400 border-zinc-800"
                          : "bg-slate-900 text-purple-300 border-slate-800"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleDelete(mem.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                  title="Eintrag löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
