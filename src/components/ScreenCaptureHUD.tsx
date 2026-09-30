import React, { useEffect, useRef, useState } from "react";
import {
  Monitor,
  Square,
  Eye,
  Sparkles,
  Camera,
  Layers,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Activity,
  Shield,
  Radio,
  Cpu,
  Zap,
} from "lucide-react";
import { useTheme } from "../utils/themeStore";

interface ScreenCaptureHUDProps {
  stream: MediaStream | null;
  activeActionTitle?: string;
  onStartSharing: () => void;
  onStopSharing: () => void;
  onSendSnapshotToAgent?: (snapshotBase64: string, customPrompt?: string, isSilent?: boolean) => void;
  lang?: "en" | "de";
}

const FLEET_AGENTS = [
  { id: "neo", name: "N.E.O.", role: "BOSS CORE", color: "from-rose-500 to-pink-600", hex: "#f43f5e" },
  { id: "maze", name: "S.Y.N.T.A.X.", role: "ALT CORE", color: "from-cyan-500 to-blue-600", hex: "#06b6d4" },
  { id: "chronos", name: "CHRONOS", role: "TIME CORE", color: "from-amber-500 to-yellow-600", hex: "#f59e0b" },
  { id: "vega", name: "VEGA", role: "DATA CORE", color: "from-purple-500 to-indigo-600", hex: "#a855f7" },
  { id: "odin", name: "ODIN", role: "TACTICS CORE", color: "from-emerald-500 to-teal-600", hex: "#10b981" },
  { id: "pulse", name: "PULSE", role: "VIRAL CORE", color: "from-pink-500 to-rose-600", hex: "#ec4899" },
  { id: "oracle", name: "ORACLE", role: "MARKET CORE", color: "from-green-500 to-emerald-600", hex: "#22c55e" },
  { id: "globe", name: "GLOBE", role: "DEEP MATRIX", color: "from-cyan-400 to-sky-500", hex: "#38bdf8" },
];

export const ScreenCaptureHUD: React.FC<ScreenCaptureHUDProps> = ({
  stream,
  activeActionTitle,
  onStartSharing,
  onStopSharing,
  onSendSnapshotToAgent,
  lang = "en",
}) => {
  const { isModern } = useTheme();
  const isEn = lang === "en";
  const defaultActionTitle = isEn
    ? "N.E.O. & Fleet Vision AI Hub"
    : "N.E.O. & Flotte Vision AI Hub";
  const effectiveActionTitle = activeActionTitle || defaultActionTitle;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoObserver, setAutoObserver] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Periodic silent screen observation when screen stream is active
  useEffect(() => {
    if (!stream || !autoObserver) return;

    const intervalId = setInterval(() => {
      handleCaptureFrame(
        isEn
          ? "[AUTOMATIC SCREEN OBSERVATION] Analyze the screen content from your specialized perspective!"
          : "[AUTOMATISCHE BILDSCHIRM-BEOBACHTUNG] Analysiere den Bildschirminhalt rein aus deiner eigenen Fachperspektive!",
        true
      );
    }, 20000);

    return () => clearInterval(intervalId);
  }, [stream, autoObserver, isEn]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    // Swipe Right (> 40px) -> Collapse to side
    if (deltaX > 40) {
      setIsCollapsed(true);
    }
    // Swipe Left (< -40px) -> Expand
    else if (deltaX < -40) {
      setIsCollapsed(false);
    }
    setTouchStartX(null);
  };

  const handleCaptureFrame = (customPrompt?: string, isSilent: boolean = true) => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      if (onSendSnapshotToAgent) {
        onSendSnapshotToAgent(dataUrl, customPrompt, isSilent);
      }
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 3000);
    }
  };

  const handleAllAgentsFeedback = () => {
    handleCaptureFrame(
      isEn
        ? "Here is my current screen / active application / website, Boss. Analyze the visual screen content strictly from your individual domain expertise!"
        : "Hier ist mein aktueller Bildschirm / die gezeigte Website / der Inhalt, Boss. Analysiert den Bildschirminhalt bitte rein aus eurer jeweiligen individuellen Fachperspektive!",
      true
    );
  };

  // Collapsed Edge Tab (docked onto screen edge)
  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-24 right-0 z-[95] group py-2.5 px-2 rounded-l-xl border-l-2 border-y backdrop-blur-2xl font-mono text-xs font-bold flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer animate-fade-in hover:scale-105 active:scale-95 shadow-[-6px_0_20px_rgba(6,182,212,0.35)] ${
          isModern
            ? "bg-[#0b0c16]/95 border-purple-500/60 text-purple-300 hover:bg-[#121424] hover:text-white"
            : "bg-[#050711]/95 border-cyan-400/80 text-cyan-300 hover:bg-[#0a1024] hover:text-cyan-100"
        }`}
        title={isEn ? "Expand Vision Matrix HUD (Click or swipe left)" : "Vision Matrix HUD ausklappen (Klick oder nach links wischen)"}
      >
        <ChevronLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
        {stream ? (
          <div className="relative flex items-center justify-center my-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        )}
        <span className="[writing-mode:vertical-lr] text-[9px] font-mono font-black tracking-widest uppercase">
          {stream ? "LIVE VISION" : "VISION HUD"}
        </span>
      </button>
    );
  }

  // Standby / Unconnected State: System-true Tactical Sensor HUD
  if (!stream) {
    return (
      <div
        id="tour-screen-hud"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed top-16 right-4 z-[90] w-84 max-w-[calc(100vw-2rem)] font-mono select-none animate-fade-in transition-all duration-300"
      >
        <div
          className={`relative rounded-xl p-3.5 backdrop-blur-2xl overflow-hidden border shadow-2xl transition-all duration-200 ${
            isModern
              ? "bg-[#0a0a12]/95 border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.18)] text-slate-100"
              : "bg-[#040610]/95 border-cyan-400/50 shadow-[0_0_35px_rgba(0,240,255,0.25)] text-cyan-100"
          }`}
        >
          {/* Tactical Corner Reticles */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-400 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* Micro Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,240,255,0.03)_51%)] bg-[length:100%_4px] pointer-events-none opacity-50" />

          {/* Header Row */}
          <div className="relative flex items-center justify-between pb-2 mb-2.5 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-[11px] tracking-wider text-white">
                    VISION MATRIX
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    HUD // SENSOR
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-mono tracking-wider">
                  DUAL-DISP OPTICAL LINK
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[8.5px] font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                STANDBY
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
                title={isEn ? "Dock to side edge" : "An den Bildschirmrand docken"}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Telemetry Chips */}
          <div className="relative grid grid-cols-3 gap-1 mb-2.5 text-[9px] font-mono">
            <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-slate-500 text-[8px]">TARGET</span>
              <span className="text-cyan-300 font-bold truncate">MONITOR 1 & 2</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-slate-500 text-[8px]">LATENZ</span>
              <span className="text-emerald-400 font-bold">&lt; 5 ms (SYNC)</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-slate-500 text-[8px]">CIPHER</span>
              <span className="text-purple-300 font-bold truncate">ZERO-TRUST</span>
            </div>
          </div>

          {/* System Technical Description */}
          <div className="relative p-2 rounded-lg bg-purple-950/25 border border-purple-500/30 text-[10px] text-slate-300 font-mono leading-relaxed mb-3">
            <div className="flex items-center gap-1 text-cyan-300 font-bold text-[9.5px] mb-1 uppercase">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{isEn ? "OPTICAL NEURAL SENSOR" : "NEURONALE OPTIK-KOPPLUNG"}</span>
            </div>
            {isEn ? (
              <>Link <strong>Monitors 1 & 2</strong> to stream visual perception into N.E.O. & S.Y.N.T.A.X. for autonomous multi-screen comprehension.</>
            ) : (
              <>Kopple <strong>Monitor 1 & 2</strong> mit der N.E.O. & S.Y.N.T.A.X. KI-Matrix für visuelle Multimodal-Analyse & Desktop-Assistenz.</>
            )}
          </div>

          {/* High-Tech Tactical Action Button */}
          <button
            id="tour-screen-btn"
            onClick={onStartSharing}
            className="relative w-full py-2.5 px-3 rounded-lg font-mono font-black text-[11px] tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2 border bg-gradient-to-r from-cyan-500/25 via-purple-600/35 to-blue-500/25 hover:from-cyan-400/40 hover:to-purple-500/50 border-cyan-400/60 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98]"
          >
            <Monitor className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>{isEn ? "LINK OPTICAL FEED (DISP 1 & 2)" : "OPTICAL FEED KOPPELN (MONITOR 1 & 2)"}</span>
          </button>

          {/* Docking Footer */}
          <div className="relative flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[9px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>LOCAL ZERO-TRUST P2P</span>
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
            >
              <span>{isEn ? "Dock right" : "Nach rechts docken"}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Screen Sharing Streaming State: Tactical HUD
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed top-16 right-4 z-[90] transition-all duration-300 font-mono select-none ${
        isMinimized ? "w-64" : "w-84 max-w-[calc(100vw-2rem)]"
      }`}
    >
      <canvas ref={canvasRef} className="hidden" />

      <div
        className={`relative rounded-xl p-3.5 backdrop-blur-2xl overflow-hidden border shadow-2xl ${
          isModern
            ? "bg-[#0a0a12]/98 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.25)] text-slate-100"
            : "bg-[#040610]/98 border-cyan-400/70 shadow-[0_0_45px_rgba(0,240,255,0.35)] text-cyan-100"
        }`}
      >
        {/* Tactical Corner Reticles */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Animated Micro Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,240,255,0.03)_51%)] bg-[length:100%_4px] pointer-events-none opacity-50" />

        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between pb-2 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <span className="text-rose-400 font-bold text-[10px] tracking-wider uppercase font-mono">
              {isEn ? "VISION FEED // ACTIVE" : "VISION FEED // LIVE"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer text-[10px]"
              title={isMinimized ? (isEn ? "Maximize HUD" : "HUD Maximieren") : (isEn ? "Minimize HUD" : "HUD Minimieren")}
            >
              <Layers className="w-3 h-3" />
            </button>
            <button
              onClick={onStopSharing}
              className="px-2 py-0.5 rounded bg-red-950/90 hover:bg-red-900 border border-red-500/60 text-red-300 text-[9px] font-bold font-mono cursor-pointer transition flex items-center gap-1 shadow-md"
              title={isEn ? "Stop screen sharing" : "Bildschirm-Freigabe trennen"}
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>STOP</span>
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-200 border border-slate-800 transition cursor-pointer text-[10px]"
              title={isEn ? "Dock to side edge" : "An den Bildschirmrand docken"}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="relative pt-2 space-y-2">
            {/* Live Video Preview with Optics Overlay */}
            <div className="relative h-36 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-cyan-500/40">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Laser Scanning Line Animation */}
              <div className="absolute inset-x-0 h-0.5 pointer-events-none bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f0ff] animate-[pulse_2s_infinite,bounce_3s_infinite]" />

              {/* Optical Reticles & HUD Tags */}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/90 border border-cyan-500/60 text-[8.5px] font-bold text-cyan-300 flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>OPTIC FEED 1 & 2</span>
              </div>

              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-slate-950/90 border border-purple-500/70 rounded text-[8px] text-purple-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                <span>8/8 CORES LINKED</span>
              </div>
            </div>

            {/* Fleet Status Grid */}
            <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{isEn ? "OBSERVING KI CORES:" : "BEOBACHTENDE KI-KERNE:"}</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold">8/8 SYNC</span>
              </div>

              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {FLEET_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-1 rounded bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${agent.color} animate-pulse`} />
                    <span className="text-[7.5px] font-bold text-slate-300 mt-0.5 truncate w-full font-mono">
                      {agent.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Action Area */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={() => handleAllAgentsFeedback()}
                className={`py-2 px-2 rounded-lg font-mono text-[9.5px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  snapshotSuccess
                    ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                    : "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-500/50 text-cyan-200 hover:text-white"
                }`}
              >
                {snapshotSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                    <span>{isEn ? "CAPTURED!" : "ERFASST!"}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isEn ? "SNAPSHOT" : "BILD ANALYSE"}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setAutoObserver((prev) => !prev)}
                className={`py-2 px-2 rounded-lg font-mono text-[9px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                  autoObserver
                    ? "bg-purple-950/60 border-purple-500/60 text-purple-200"
                    : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                <Eye className={`w-3 h-3 ${autoObserver ? "text-purple-400 animate-pulse" : "text-slate-500"}`} />
                <span>{autoObserver ? (isEn ? "AUTO: ON" : "AUTO: EIN") : (isEn ? "AUTO: OFF" : "AUTO: AUS")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
