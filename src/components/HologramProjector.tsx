import React, { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, RefreshCw, Maximize2, Sparkles, Layers, Eye, EyeOff, Image as ImageIcon } from "lucide-react";

interface HologramProjectorProps {
  imageUrl: string;
  prompt?: string;
  timestamp?: string;
  onClose: () => void;
  onEditPrompt?: (newPrompt: string) => void;
  onAnimateToVeoVideo?: (imageUrl: string, prompt?: string) => void;
  onOpenGallery?: () => void;
  isLoading?: boolean;
  currentAgentColor?: string;
}

export const HologramProjector = React.memo<HologramProjectorProps>(({
  imageUrl,
  prompt,
  timestamp,
  onClose,
  onEditPrompt,
  onAnimateToVeoVideo,
  onOpenGallery,
  isLoading,
  currentAgentColor = "#00f0ff",
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showScanlines, setShowScanlines] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [editPromptInput, setEditPromptInput] = useState<string>("");

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `jarvis-hologram-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPromptInput.trim() && onEditPrompt) {
      onEditPrompt(editPromptInput.trim());
      setEditPromptInput("");
    }
  };

  return (
    <div
      className={`fixed z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFullscreen
          ? "inset-0 bg-slate-950/95 p-4 sm:p-8 flex items-center justify-center backdrop-blur-xl"
          : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-xl w-[90vw] sm:w-[540px]"
      }`}
    >
      {/* Hologram Base Beam Projector Effect (Bottom Light Emitter) */}
      {!isFullscreen && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-8 pointer-events-none flex flex-col items-center justify-center">
          <div
            className="w-36 h-2 rounded-full blur-sm animate-pulse"
            style={{ backgroundColor: currentAgentColor, boxShadow: `0 0 25px ${currentAgentColor}` }}
          />
          <div
            className="w-full h-12 -mt-2 opacity-30"
            style={{
              background: `polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)`,
              backgroundImage: `linear-gradient(to top, ${currentAgentColor}, transparent)`,
            }}
          />
        </div>
      )}

      {/* Main Holographic Container Glass Box */}
      <div
        className="relative w-full rounded-2xl border bg-slate-950/90 backdrop-blur-2xl p-4 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col animate-fade-in"
        style={{
          borderColor: `${currentAgentColor}60`,
          boxShadow: `0 0 40px ${currentAgentColor}25, inset 0 0 15px ${currentAgentColor}10`,
        }}
      >
        {/* Futuristic Laser Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: currentAgentColor }} />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20 select-none">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: currentAgentColor, boxShadow: `0 0 8px ${currentAgentColor}` }}
            />
            <span className="font-mono text-xs font-bold tracking-[2px] text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              PROJIZIERTES HOLOGRAMM
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenGallery && (
              <button
                onClick={onOpenGallery}
                className="px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/50 hover:bg-cyan-500/25 text-cyan-200 hover:text-white transition cursor-pointer flex items-center gap-1 font-mono text-[10px] font-bold mr-1"
                title="Foto & Hologramm Galerie öffnen"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
                <span>GALERIE</span>
              </button>
            )}

            <button
              onClick={() => setShowScanlines(!showScanlines)}
              className="p-1.5 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-100 transition cursor-pointer"
              title={showScanlines ? "Scanlines deaktivieren" : "Scanlines aktivieren"}
            >
              {showScanlines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-100 transition cursor-pointer"
              title={isFullscreen ? "Vollbild beenden" : "Vollbild"}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-100 transition cursor-pointer"
              title="Hologramm speichern"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/30 text-red-300 hover:text-red-100 transition cursor-pointer ml-1"
              title="Projektion beenden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projection Stage / Viewport */}
        <div className="relative w-full aspect-square max-h-[60vh] rounded-xl overflow-hidden bg-black/90 border border-cyan-500/20 flex items-center justify-center group select-none">
          {/* Holographic Cyber Scanlines Overlay (Only active when Scanlines enabled) */}
          {showScanlines && (
            <>
              <div
                className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-screen"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.15) 3px, transparent 4px)",
                }}
              />
              <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-cyan-500/10 via-transparent to-cyan-500/20 animate-pulse" />
            </>
          )}

          {/* The Holographic / High-Definition Image */}
          <img
            src={imageUrl}
            alt="Holographic Projection"
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${zoom})` }}
            className={`w-full h-full object-contain transition-all duration-300 ease-out ${
              showScanlines ? "filter drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "shadow-2xl"
            }`}
          />

          {/* Interactive Floating Zoom & Clarity Controls */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-slate-950/85 border border-cyan-500/30 rounded-lg p-1 backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowScanlines(!showScanlines)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                showScanlines
                  ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/50"
                  : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              }`}
              title="Zwischen Hologramm-Scanlines & HD-Klarfoto umschalten"
            >
              {showScanlines ? <Eye className="w-3 h-3 text-cyan-300" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
              <span>{showScanlines ? "HOLO FX" : "HQ FOTO"}</span>
            </button>
            <div className="h-3 w-[1px] bg-slate-800" />
            <button
              onClick={handleZoomOut}
              className="p-1 text-cyan-300 hover:bg-cyan-500/20 rounded cursor-pointer"
              title="Verkleinern"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 font-mono text-[9px] text-cyan-300 hover:bg-cyan-500/20 rounded cursor-pointer"
              title="Zoom zurücksetzen"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-cyan-300 hover:bg-cyan-500/20 rounded cursor-pointer"
              title="Vergrößern"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="font-mono text-xs text-cyan-300 tracking-[2px] animate-pulse">
                FOTO WIRD GENERIERT...
              </span>
            </div>
          )}
        </div>

        {/* Prompt Information & Quick Edit Bar */}
        <div className="mt-3 flex flex-col gap-2">
          {prompt && (
            <div className="bg-slate-900/60 border border-cyan-500/15 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 tracking-wider">
                <span>PROMPT / ANWEISUNG</span>
                <span>{timestamp || "HEUTE"}</span>
              </div>
              <p className="font-sans text-xs text-cyan-100 line-clamp-2 leading-relaxed">
                "{prompt}"
              </p>
            </div>
          )}

          {/* Preset HD Quality Modifiers */}
          {onEditPrompt && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[10px] font-mono">
              <span className="text-slate-500 text-[9px] flex-shrink-0">PRESETS:</span>
              {onAnimateToVeoVideo && (
                <button
                  type="button"
                  onClick={() => onAnimateToVeoVideo(imageUrl, prompt)}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 border border-purple-500/50 text-purple-200 hover:bg-purple-500/40 cursor-pointer flex-shrink-0 transition font-bold flex items-center gap-1 shadow-md"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  🎬 Als Veo 3 Video animieren
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (onEditPrompt) {
                    onEditPrompt("Ein rein tiefschwarzer Kater, 100% pechschwarzes Fell, absolut keine weißen Stellen oder Flecken, goldene Augen, 8k Studio-Foto, gestochen scharf");
                  }
                }}
                className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 cursor-pointer flex-shrink-0 transition"
              >
                🐈 Pechschwarzer Kater
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onEditPrompt) {
                    onEditPrompt(`${prompt || "Motiv"}, ultra-fotorealistische High-End Studioaufnahme, 85mm Objektiv, gestochen scharfes Fell, 8k Auflösung`);
                  }
                }}
                className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 cursor-pointer flex-shrink-0 transition"
              >
                📸 Ultra-HD Studiofoto
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onEditPrompt) {
                    onEditPrompt(`${prompt || "Motiv"}, dramatisches filmisches Licht, cinematic masterpiece, hyper-realistische Details`);
                  }
                }}
                className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 cursor-pointer flex-shrink-0 transition"
              >
                🎬 Cinematic Lighting
              </button>
            </div>
          )}

          {onEditPrompt && (
            <form onSubmit={handleSubmitEdit} className="flex items-center gap-2 mt-0.5">
              <input
                type="text"
                value={editPromptInput}
                onChange={(e) => setEditPromptInput(e.target.value)}
                placeholder="Foto verändern (z.B. 'vollständig schwarzer Kater ohne weiße Flecken')..."
                className="flex-1 bg-slate-900/80 border border-cyan-500/25 rounded-lg px-3 py-1.5 text-xs text-cyan-50 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
              <button
                type="submit"
                disabled={!editPromptInput.trim() || isLoading}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-200 font-mono text-[10px] font-bold tracking-wider cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 flex-shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                NEU GENERIEREN
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
});
