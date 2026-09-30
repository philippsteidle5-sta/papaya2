import React, { useState } from "react";
import { X, Search, Trash2, Download, Eye, Sparkles, Layers, Copy, Check, Image as ImageIcon } from "lucide-react";

export interface GalleryHologramItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  agent?: string;
  enhancedPrompt?: string;
}

interface HologramGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: GalleryHologramItem[];
  onSelectHologram: (item: GalleryHologramItem) => void;
  onUseAsReference: (url: string) => void;
  onDeleteHologram: (id: string) => void;
  onClearGallery: () => void;
  currentAgentColor?: string;
}

export const HologramGalleryModal: React.FC<HologramGalleryModalProps> = ({
  isOpen,
  onClose,
  gallery,
  onSelectHologram,
  onUseAsReference,
  onDeleteHologram,
  onClearGallery,
  currentAgentColor = "#00f0ff",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredGallery = gallery.filter((item) =>
    (item.prompt || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.enhancedPrompt || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.timestamp || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `jarvis-photo-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-5xl h-[88vh] bg-[#05080e] border rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden"
        style={{
          borderColor: `${currentAgentColor}50`,
          boxShadow: `0 0 50px ${currentAgentColor}20, inset 0 0 20px ${currentAgentColor}10`,
        }}
      >
        {/* Futuristic Laser Bracket Accents */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-cyan-500/20 bg-slate-950/80 gap-3 select-none">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10"
              style={{ color: currentAgentColor }}
            >
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm sm:text-base font-bold tracking-[2px] text-cyan-200 flex items-center gap-2">
                SYNTAX FOTO & HOLOGRAMM GALERIE
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-mono">
                  {gallery.length} {gallery.length === 1 ? "Foto" : "Fotos"}
                </span>
              </h2>
              <p className="font-sans text-xs text-slate-400">
                Alle generierten Bilder & Hologramme durchsuchen, projizieren und weiterverarbeiten.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {gallery.length > 0 && (
              <button
                onClick={() => {
                  if (confirmClear) {
                    onClearGallery();
                    setConfirmClear(false);
                  } else {
                    setConfirmClear(true);
                    setTimeout(() => setConfirmClear(false), 4000);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  confirmClear
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/50"
                }`}
                title="Ganze Galerie leeren"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmClear ? "ALLE LÖSCHEN?" : "GALERIE LEEREN"}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-cyan-500/30 bg-slate-900 text-cyan-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition cursor-pointer"
              title="Galerie schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-cyan-500/15 bg-slate-900/50 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fotos nach Beschreibung oder Zeit durchsuchen..."
              className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>FLUX & IMAGEN CORES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Gallery Grid Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {filteredGallery.length === 0 ? (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400">
                <ImageIcon className="w-10 h-10" />
              </div>
              <h3 className="font-mono text-base font-bold text-cyan-200">
                {searchQuery ? "Keine passenden Fotos gefunden" : "Noch keine Fotos in der Galerie"}
              </h3>
              <p className="font-sans text-xs text-slate-400 max-w-sm leading-relaxed">
                {searchQuery
                  ? "Versuche einen anderen Suchbegriff."
                  : "Erstelle dein erstes Foto oder Hologramm direkt im Chat oder über den Holo-Projektor!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((item, idx) => (
                <div
                  key={item.id || `holo-${idx}`}
                  className="group relative bg-[#0a111f] border border-cyan-500/20 hover:border-cyan-400 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.25)] flex flex-col"
                >
                  {/* Image Display */}
                  <div className="relative w-full aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay & Quick Action Toolbar on Hover */}
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                          {item.timestamp}
                        </span>

                        <button
                          onClick={() => onDeleteHologram(item.id)}
                          className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition cursor-pointer"
                          title="Aus Galerie löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            onSelectHologram(item);
                            onClose();
                          }}
                          className="w-full py-1.5 rounded-lg bg-cyan-500/30 hover:bg-cyan-400 text-cyan-100 hover:text-slate-950 font-mono text-[10px] font-bold border border-cyan-400/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>PROJIZIEREN</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              onUseAsReference(item.url);
                              onClose();
                            }}
                            className="py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-600 text-purple-200 hover:text-white font-mono text-[9px] font-bold border border-purple-500/30 flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Als Bildvorlage laden"
                          >
                            <Layers className="w-3 h-3" />
                            <span>REFERENZ</span>
                          </button>

                          <button
                            onClick={() => handleDownload(item.url, idx)}
                            className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/30 flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Herunterladen"
                          >
                            <Download className="w-3 h-3" />
                            <span>DOWNLOAD</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Info */}
                  <div className="p-3 bg-[#060c17] flex-1 flex flex-col justify-between border-t border-cyan-500/10">
                    <p className="font-sans text-xs text-slate-200 line-clamp-2 leading-relaxed mb-2" title={item.prompt}>
                      "{item.prompt || "Generiertes Bild"}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-[9px] font-mono text-slate-400">
                      <span>{item.timestamp}</span>
                      <button
                        onClick={() => handleCopyPrompt(item.id, item.prompt)}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span>KOPIERT</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>PROMPT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-6 border-t border-cyan-500/20 bg-slate-950/90 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>S.Y.N.T.A.X. High-Fidelity Holographic Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-200 font-bold transition cursor-pointer"
          >
            SCHLIESSEN
          </button>
        </div>
      </div>
    </div>
  );
};
