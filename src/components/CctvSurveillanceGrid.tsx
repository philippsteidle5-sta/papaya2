import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  Shield,
  Activity,
  Radio,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Crosshair,
  Camera,
  Layers,
  Sparkles,
  Sliders,
  ZoomIn,
  ZoomOut,
  MapPin,
  Clock,
  Check,
  X,
} from "lucide-react";
import { playClickSound } from "../utils/audioSynth";

export interface CctvCameraItem {
  id: string;
  camCode: string;
  name: string;
  location: string;
  country: string;
  timeZone: string;
  utcOffset: string;
  fps: string;
  resolution: string;
  bitrate: string;
  coords: string;
  agency: string;
  feedType: "youtube" | "snapshot" | "cctv_simulation";
  embedUrl?: string;
  snapshotUrl?: string;
  externalUrl: string;
  detections: {
    label: string;
    conf: number;
    x: number; // percentage
    y: number;
    w: number;
    h: number;
  }[];
  description: string;
}

export const CCTV_CAMERAS: CctvCameraItem[] = [
  {
    id: "abbey-road",
    camCode: "CAM-01",
    name: "Abbey Road Zebra Crossing",
    location: "London, City of Westminster",
    country: "UK",
    timeZone: "Europe/London",
    utcOffset: "BST UTC+1",
    fps: "30.0 FPS",
    resolution: "1080p FHD",
    bitrate: "4.5 Mbps",
    coords: "51.5320° N, 0.1773° W",
    agency: "EarthCam / Abbey Road Studios / TfL",
    feedType: "cctv_simulation",
    snapshotUrl: "https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00001.07450.jpg",
    externalUrl: "https://www.earthcam.com/world/england/london/abbeyroad/",
    detections: [
      { label: "PEDESTRIAN (ZEBRA)", conf: 98, x: 44, y: 52, w: 10, h: 26 },
      { label: "BEATLES TOURIST", conf: 95, x: 30, y: 48, w: 9, h: 28 },
      { label: "LONDON CAB", conf: 99, x: 68, y: 46, w: 20, h: 22 },
    ],
    description: "Weltberühmter Zebrastreifen vor den Abbey Road Studios. 24/7 Live-Überwachung von Touristen, London Black Cabs und Beatles-Fans.",
  },
  {
    id: "times-square",
    camCode: "CAM-02",
    name: "Times Square Broadway",
    location: "New York City, NY",
    country: "USA",
    timeZone: "America/New_York",
    utcOffset: "EDT UTC-4",
    fps: "60.0 FPS",
    resolution: "4K UHD",
    bitrate: "8.2 Mbps",
    coords: "40.7580° N, 73.9855° W",
    agency: "EarthCam / NYC DOT",
    feedType: "youtube",
    embedUrl: "https://www.youtube-nocookie.com/embed/1-iS7LArMPA?autoplay=1&mute=1&controls=1&playsinline=1",
    externalUrl: "https://www.earthcam.com/usa/newyork/timessquare/",
    detections: [
      { label: "YELLOW CAB", conf: 97, x: 22, y: 64, w: 24, h: 20 },
      { label: "BILLBOARD DISPLAY", conf: 99, x: 38, y: 12, w: 38, h: 32 },
      { label: "PEDESTRIAN CROWD", conf: 94, x: 58, y: 68, w: 28, h: 18 },
    ],
    description: "Zentrum von Manhattan: Kreuzung Broadway & 7th Avenue mit gigantischen LED-Billboards und dichtem Stadtverkehr.",
  },
  {
    id: "shibuya-crossing",
    camCode: "CAM-03",
    name: "Shibuya Scramble Crossing",
    location: "Tokyo, Shibuya",
    country: "Japan",
    timeZone: "Asia/Tokyo",
    utcOffset: "JST UTC+9",
    fps: "60.0 FPS",
    resolution: "1080p60",
    bitrate: "6.8 Mbps",
    coords: "35.6595° N, 139.7005° E",
    agency: "ANN News / MLIT Japan",
    feedType: "youtube",
    embedUrl: "https://www.youtube-nocookie.com/embed/coYw-eVU0Ks?autoplay=1&mute=1&controls=1&playsinline=1",
    externalUrl: "https://www.youtube.com/watch?v=coYw-eVU0Ks",
    detections: [
      { label: "SCRAMBLE CROWD (500+)", conf: 99, x: 28, y: 38, w: 48, h: 42 },
      { label: "METROPOLITAN BUS", conf: 96, x: 80, y: 28, w: 16, h: 22 },
    ],
    description: "Die verkehrsreichste Fußgänger-Kreuzung der Welt vor dem Bahnhof Shibuya mit bis zu 3.000 Menschen pro Ampelphase.",
  },
  {
    id: "frankfurt-airport",
    camCode: "CAM-04",
    name: "Frankfurt Airport (FRA) Runway",
    location: "Frankfurt am Main",
    country: "DE",
    timeZone: "Europe/Berlin",
    utcOffset: "CEST UTC+2",
    fps: "30.0 FPS",
    resolution: "1080p FHD",
    bitrate: "5.1 Mbps",
    coords: "50.0379° N, 8.5622° E",
    agency: "Fraport / DFS Deutsche Flugsicherung",
    feedType: "cctv_simulation",
    externalUrl: "https://www.fraport.com/de/geschaeftsfelder/betrieb-und-infrastruktur.html",
    detections: [
      { label: "AIRBUS A350-900 (DLH)", conf: 99, x: 32, y: 44, w: 46, h: 32 },
      { label: "APRON TUG VEHICLE", conf: 92, x: 18, y: 70, w: 14, h: 14 },
    ],
    description: "Start- und Landebahn Süd (07R/25L) am Drehkreuz Frankfurt mit Flugzeugabfertigung und Runway-Befeuerung.",
  },
  {
    id: "venice-grand-canal",
    camCode: "CAM-05",
    name: "Canal Grande & Rialto",
    location: "Venedig, Veneto",
    country: "Italy",
    timeZone: "Europe/Rome",
    utcOffset: "CEST UTC+2",
    fps: "25.0 FPS",
    resolution: "1080p FHD",
    bitrate: "3.8 Mbps",
    coords: "45.4381° N, 12.3358° E",
    agency: "SkylineWebcams / Comune di Venezia",
    feedType: "snapshot",
    snapshotUrl: "https://osirisai.live/api/cctv/proxy?url=https%3A%2F%2Fcdn.skylinewebcams.com%2Flive341.jpg",
    externalUrl: "https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/canal-grande.html",
    detections: [
      { label: "VAPORETTO LINIE 1", conf: 98, x: 38, y: 54, w: 28, h: 20 },
      { label: "GONDOLA TRADIZIONALE", conf: 94, x: 14, y: 66, w: 16, h: 14 },
    ],
    description: "Hauptwasserstraße Venedigs mit Blick auf historische Palazzi, Vaporettos und Gondeln nahe der Rialtobrücke.",
  },
  {
    id: "iss-orbit",
    camCode: "ISS-CAM",
    name: "ISS Earth Live Stream (LEO)",
    location: "Low Earth Orbit (418 km)",
    country: "GLOBAL",
    timeZone: "UTC",
    utcOffset: "UTC+0",
    fps: "60.0 FPS",
    resolution: "4K UHD",
    bitrate: "12.0 Mbps",
    coords: "Orbit: 51.6° Inklination",
    agency: "NASA / ESA / Roscosmos",
    feedType: "youtube",
    embedUrl: "https://www.youtube-nocookie.com/embed/jPTD2gnZFUw?autoplay=1&mute=1&controls=1&playsinline=1",
    externalUrl: "https://www.nasa.gov/live",
    detections: [
      { label: "EARTH ATMOSPHERE CURVE", conf: 100, x: 8, y: 32, w: 84, h: 48 },
      { label: "SOLAR ARRAY WING", conf: 96, x: 74, y: 10, w: 22, h: 25 },
    ],
    description: "Hochauflösende Live-Kamera an der Außenseite der Internationalen Raumstation. Zeigt Tag- und Nachtübergänge, Polarlichter und Stürme.",
  },
];

type VisionMode = "normal" | "nvg" | "flir" | "mono";

interface CctvSurveillanceGridProps {
  onTransmitToGlobe?: (summary: string) => void;
  lang?: "de" | "en";
}

export const CctvSurveillanceGrid: React.FC<CctvSurveillanceGridProps> = ({
  onTransmitToGlobe,
  lang = "de",
}) => {
  const [selectedCam, setSelectedCam] = useState<CctvCameraItem | null>(null);
  const [visionMode, setVisionMode] = useState<VisionMode>("normal");
  const [showAiDetections, setShowAiDetections] = useState<boolean>(true);
  const [activePlaybackModes, setActivePlaybackModes] = useState<Record<string, "stream" | "video" | "snapshot">>({
    "abbey-road": "video",
    "times-square": "stream",
    "shibuya-crossing": "stream",
    "frankfurt-airport": "video",
    "venice-grand-canal": "snapshot",
    "iss-orbit": "stream",
  });
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [currentMs, setCurrentMs] = useState<number>(0);
  const [snapshotSuccess, setSnapshotSuccess] = useState<boolean>(false);
  const [autoRefreshCounter, setAutoRefreshCounter] = useState<number>(0);

  // Live real-time clock down to milliseconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toISOString().replace("T", " ").substring(0, 19));
      setCurrentMs(now.getMilliseconds());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh snapshot cameras every 5 seconds
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setAutoRefreshCounter((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(refreshTimer);
  }, []);

  const handleCaptureSnapshot = (cam: CctvCameraItem) => {
    playClickSound();
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2500);
  };

  const handleForwardToGlobe = (cam: CctvCameraItem) => {
    playClickSound();
    if (onTransmitToGlobe) {
      const summary = `CCTV SURVEILLANCE TELEMETRY:
Kamera: ${cam.name} (${cam.camCode})
Standort: ${cam.location}, ${cam.country} [${cam.coords}]
Behörde / Quelle: ${cam.agency}
Sensor-Status: ${cam.fps} @ ${cam.resolution} (${cam.bitrate})
Erkannte Objekte: ${cam.detections.map((d) => `${d.label} (${d.conf}%)`).join(", ")}
Zeitstempel: ${currentTimeStr} UTC`;
      onTransmitToGlobe(summary);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 font-mono text-xs overflow-y-auto custom-scrollbar p-1">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide">
                WELTWEITE LIVE-CCTV ÜBERWACHUNGSMONITORE
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                6 FEEDS AKTIV
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Echtzeit-Videostreams, Live-Verkehrskameras (TfL, SkylineWebcams, EarthCam) mit KI-Objekterkennung
            </p>
          </div>
        </div>

        {/* Global Control Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Detections Toggle */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setShowAiDetections((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
              showAiDetections
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>KI-DETEKTION {showAiDetections ? "AN" : "AUS"}</span>
          </button>

          {/* Vision Mode Switcher */}
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setVisionMode("normal");
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                visionMode === "normal"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              RGB
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setVisionMode("nvg");
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                visionMode === "nvg"
                  ? "bg-emerald-500 text-slate-950 font-black shadow"
                  : "text-zinc-400 hover:text-emerald-400"
              }`}
              title="Night Vision Green (Nachtsicht)"
            >
              NVG
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setVisionMode("flir");
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                visionMode === "flir"
                  ? "bg-amber-500 text-slate-950 font-black shadow"
                  : "text-zinc-400 hover:text-amber-400"
              }`}
              title="FLIR Thermal Infrarot"
            >
              FLIR
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Cameras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CCTV_CAMERAS.map((cam) => {
          const playbackMode = activePlaybackModes[cam.id] || "video";
          const isSelected = selectedCam?.id === cam.id;

          return (
            <div
              key={cam.id}
              className={`p-3 rounded-xl bg-zinc-900/90 border transition-all duration-200 flex flex-col space-y-2.5 relative group ${
                isSelected
                  ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-zinc-900"
                  : "border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850"
              }`}
            >
              {/* Video Monitor Stage (NO BLACK BOX EVER!) */}
              <div
                onClick={() => {
                  playClickSound();
                  setSelectedCam(cam);
                }}
                className={`w-full h-48 rounded-lg relative overflow-hidden bg-black cursor-pointer border border-zinc-800 flex items-center justify-center ${
                  visionMode === "nvg"
                    ? "brightness-125 contrast-150 hue-rotate-[90deg] saturate-200"
                    : visionMode === "flir"
                    ? "contrast-200 invert hue-rotate-[180deg]"
                    : ""
                }`}
              >
                {/* 1. Live Embedded YouTube Stream if available & active */}
                {playbackMode === "stream" && cam.embedUrl && (
                  <iframe
                    src={cam.embedUrl}
                    title={cam.name}
                    className="w-full h-full border-0 pointer-events-none scale-105"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}

                {/* 2. Live Auto-refreshing Snapshot Image (e.g. TfL London or Venice) */}
                {playbackMode === "snapshot" && cam.snapshotUrl && (
                  <img
                    src={`${cam.snapshotUrl}?_t=${autoRefreshCounter}`}
                    alt={cam.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* 3. Animated High-Definition CCTV Scene / Procedural Feed (Always active & vibrant) */}
                {(playbackMode === "video" || (!cam.embedUrl && playbackMode === "stream")) && (
                  <CctvAnimatedCanvasScene camId={cam.id} />
                )}

                {/* Surveillance Scanlines and Vignette Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40" />

                {/* Optical Reticle & Corners */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

                {/* Live REC Indicator & Clock Header */}
                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 pointer-events-none z-10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-red-600 absolute" />
                  <span className="text-[10px] font-mono font-black text-red-400 bg-black/70 px-1 rounded shadow">
                    REC ●
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-300 bg-black/70 px-1 rounded shadow">
                    {currentTimeStr.slice(11)}.{String(currentMs).padStart(3, "0").slice(0, 1)}
                  </span>
                </div>

                {/* Camera Code & Agency OSD */}
                <div className="absolute top-2.5 right-3 pointer-events-none z-10">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 bg-black/70 px-1.5 py-0.5 rounded border border-cyan-500/30 shadow">
                    {cam.camCode}
                  </span>
                </div>

                {/* AI Target Recognition Bounding Boxes */}
                {showAiDetections &&
                  cam.detections.map((det, dIdx) => (
                    <div
                      key={dIdx}
                      style={{
                        left: `${det.x}%`,
                        top: `${det.y}%`,
                        width: `${det.w}%`,
                        height: `${det.h}%`,
                      }}
                      className="absolute border border-cyan-400/90 bg-cyan-500/10 pointer-events-none transition-all duration-300 flex flex-col justify-between"
                    >
                      <span className="text-[7px] font-mono font-bold text-slate-950 bg-cyan-400 px-0.5 whitespace-nowrap self-start">
                        {det.label} {det.conf}%
                      </span>
                      <div className="w-1 h-1 bg-cyan-400 self-end" />
                    </div>
                  ))}

                {/* Bottom OSD Bar: Bitrate & FPS */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-zinc-300 bg-black/75 px-2 py-0.5 rounded pointer-events-none z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{cam.fps}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300">{cam.resolution}</span>
                  </div>
                  <div className="text-cyan-300 font-bold">{cam.bitrate}</div>
                </div>

                {/* Hover Maximize Overlay Hint */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg scale-95 group-hover:scale-100 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5" />
                    VOLLBILD MONITOR
                  </span>
                </div>
              </div>

              {/* Camera Info & Controls */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>{cam.name}</span>
                    {cam.id === "abbey-road" && (
                      <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                        HIGHLIGHT
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{cam.location} • {cam.utcOffset}</span>
                  </div>
                </div>

                {/* Mode Switcher Buttons for this camera */}
                <div className="flex items-center gap-1 shrink-0">
                  {cam.embedUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setActivePlaybackModes((prev) => ({
                          ...prev,
                          [cam.id]: prev[cam.id] === "stream" ? "video" : "stream",
                        }));
                      }}
                      className={`px-1.5 py-1 rounded text-[9px] font-bold border transition ${
                        playbackMode === "stream"
                          ? "bg-red-600 text-white border-red-500"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                      }`}
                      title="YouTube Live Stream ein/aus"
                    >
                      STREAM
                    </button>
                  )}

                  {cam.snapshotUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setActivePlaybackModes((prev) => ({
                          ...prev,
                          [cam.id]: prev[cam.id] === "snapshot" ? "video" : "snapshot",
                        }));
                      }}
                      className={`px-1.5 py-1 rounded text-[9px] font-bold border transition ${
                        playbackMode === "snapshot"
                          ? "bg-cyan-600 text-white border-cyan-500"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                      }`}
                      title="Echter Live-Schnappschuss (TfL / Skyline) ein/aus"
                    >
                      FOTO
                    </button>
                  )}

                  <a
                    href={cam.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition"
                    title="Original-Stream im neuen Tab öffnen"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedCam(cam);
                    }}
                    className="p-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition"
                    title="Monitor vergrößern"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL TACTICAL MONITOR MODAL FOR SELECTED CAMERA */}
      {selectedCam && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl max-h-[95vh] rounded-2xl bg-slate-950 border-2 border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden">
            {/* Modal Top Command Bar */}
            <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Video className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">{selectedCam.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {selectedCam.camCode}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {selectedCam.location}, {selectedCam.country} • {selectedCam.coords}
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCaptureSnapshot(selectedCam)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 flex items-center gap-1.5 transition text-xs font-bold"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>{snapshotSuccess ? "GESPEICHERT!" : "SNAPSHOT"}</span>
                </button>

                {onTransmitToGlobe && (
                  <button
                    type="button"
                    onClick={() => handleForwardToGlobe(selectedCam)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black flex items-center gap-1.5 transition text-xs shadow-md"
                  >
                    <Radio className="w-3.5 h-3.5 text-slate-950" />
                    <span>AN G.L.O.B.E.</span>
                  </button>
                )}

                <a
                  href={selectedCam.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 flex items-center gap-1.5 transition text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ORIGINAL ÖFFNEN</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedCam(null);
                  }}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Central Surveillance Stage - Clean, Unobstructed Fullscreen View */}
            <div className="flex-1 min-h-[350px] relative bg-black flex items-center justify-center overflow-hidden">
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Embed, Snapshot or Animated Canvas */}
                {activePlaybackModes[selectedCam.id] === "stream" && selectedCam.embedUrl ? (
                  <iframe
                    src={selectedCam.embedUrl}
                    title={selectedCam.name}
                    className="w-full h-[60vh] sm:h-[72vh] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : activePlaybackModes[selectedCam.id] === "snapshot" && selectedCam.snapshotUrl ? (
                  <img
                    src={`${selectedCam.snapshotUrl}?_t=${autoRefreshCounter}`}
                    alt={selectedCam.name}
                    className="w-full h-[60vh] sm:h-[72vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-[60vh] sm:h-[72vh]">
                    <CctvAnimatedCanvasScene camId={selectedCam.id} isHighRes />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Camera Switcher Bar (Bottom) */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[10px] text-zinc-400 font-bold uppercase shrink-0">
                SCHNELLWECHSEL:
              </span>
              {CCTV_CAMERAS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedCam(c);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCam.id === c.id
                      ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                      : "bg-black/60 text-zinc-300 hover:text-white border border-zinc-700"
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>{c.camCode}: {c.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// VIBRANT PROCEDURAL CCTV ANIMATED CANVASES
// Displays authentic moving scenes so camera is NEVER black
// ==========================================
const CctvAnimatedCanvasScene: React.FC<{ camId: string; isHighRes?: boolean }> = ({
  camId,
  isHighRes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // ── ABBEY ROAD CROSSING (LONDON) ──
      if (camId === "abbey-road") {
        // Sky & Brick Studio Background
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        skyGrad.addColorStop(0, "#475569");
        skyGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.4);

        // London Victorian Buildings & Trees
        ctx.fillStyle = "#334155";
        ctx.fillRect(w * 0.05, h * 0.15, w * 0.3, h * 0.25);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(w * 0.4, h * 0.1, w * 0.35, h * 0.3);

        // Abbey Road Street Asphalt
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, h * 0.4, w, h * 0.6);

        // Zebra Crossing Stripes (The iconic Abbey Road crosswalk!)
        ctx.fillStyle = "#f8fafc";
        const stripeCount = 9;
        const stripeWidth = w / (stripeCount * 2);
        for (let i = 0; i < stripeCount; i++) {
          const sx = w * 0.2 + i * stripeWidth * 2;
          ctx.fillRect(sx, h * 0.5, stripeWidth * 1.3, h * 0.32);
        }

        // Sidewalk Curbs
        ctx.fillStyle = "#64748b";
        ctx.fillRect(0, h * 0.38, w, h * 0.04);
        ctx.fillRect(0, h * 0.82, w, h * 0.05);

        // London Black Cab driving by
        const cabX = ((frame * 2.5) % (w + 140)) - 70;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(cabX, h * 0.44, 60, 24);
        ctx.fillStyle = "#facc15"; // Taxi sign
        ctx.fillRect(cabX + 22, h * 0.41, 16, 5);
        // Headlights glow
        ctx.fillStyle = "rgba(254, 240, 138, 0.4)";
        ctx.beginPath();
        ctx.moveTo(cabX + 60, h * 0.5);
        ctx.lineTo(cabX + 110, h * 0.42);
        ctx.lineTo(cabX + 110, h * 0.58);
        ctx.fill();

        // 4 Pedestrians walking across the Zebra stripes (Beatles homage!)
        const walkOffset = (frame * 1.2) % (w * 0.65);
        const pNames = ["#1e1b4b", "#450a0a", "#1e3a8a", "#022c22"];
        for (let p = 0; p < 4; p++) {
          const px = w * 0.25 + walkOffset - p * 24;
          if (px > w * 0.15 && px < w * 0.85) {
            // Legs moving
            const legSwing = Math.sin(frame * 0.15 + p) * 5;
            ctx.fillStyle = "#020617";
            ctx.fillRect(px - 2, h * 0.64 + legSwing, 4, 14);
            ctx.fillRect(px + 2, h * 0.64 - legSwing, 4, 14);

            // Body
            ctx.fillStyle = pNames[p];
            ctx.fillRect(px - 4, h * 0.54, 8, 14);

            // Head
            ctx.fillStyle = "#fed7aa";
            ctx.beginPath();
            ctx.arc(px, h * 0.51, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ── FRANKFURT AIRPORT (FRA) ──
      else if (camId === "frankfurt-airport") {
        // Tarmac & Runway Background
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, h);

        // Distant Terminal Buildings with lights
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, h * 0.1, w, h * 0.25);
        // Terminal Window Lights
        ctx.fillStyle = "#fef08a";
        for (let i = 0; i < 20; i++) {
          ctx.fillRect(w * 0.05 + i * (w * 0.045), h * 0.16, 4, 6);
        }

        // Runway centerline and threshold stripes
        ctx.fillStyle = "#334155";
        ctx.fillRect(0, h * 0.45, w, h * 0.4);
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(w * 0.05 + i * (w * 0.12), h * 0.64, w * 0.06, 4);
        }

        // Taxiway edge lights (Green & Blue runway lights)
        const lightPulse = Math.sin(frame * 0.1) > 0;
        for (let i = 0; i < 15; i++) {
          ctx.fillStyle = i % 2 === 0 ? "#22c55e" : "#3b82f6";
          ctx.beginPath();
          ctx.arc(w * 0.05 + i * (w * 0.065), h * 0.45, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Airplane taxiing on the runway
        const planeX = ((frame * 1.8) % (w + 160)) - 80;
        ctx.fillStyle = "#e2e8f0"; // Fuselage
        ctx.fillRect(planeX, h * 0.54, 75, 14);
        ctx.beginPath(); // Wings
        ctx.moveTo(planeX + 30, h * 0.54);
        ctx.lineTo(planeX + 15, h * 0.42);
        ctx.lineTo(planeX + 25, h * 0.42);
        ctx.lineTo(planeX + 45, h * 0.54);
        ctx.fill();
        // Red beacon light flashing
        if (lightPulse) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(planeX + 35, h * 0.53, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── SHIBUYA OR TIMES SQUARE BACKUP CANVAS ──
      else {
        // High density neon city night scene
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, w, h);

        // Skyscraper silhouettes with neon ads
        for (let b = 0; b < 6; b++) {
          const bx = b * (w / 5.5);
          const bh = h * (0.3 + (b % 3) * 0.15);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(bx, h - bh, w / 6, bh);

          // Neon billboards
          const neonColors = ["#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"];
          ctx.fillStyle = neonColors[b % neonColors.length];
          ctx.fillRect(bx + 4, h - bh + 10, w / 7.5, bh * 0.35);
        }

        // Street level with moving headlights and crowds
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, h * 0.7, w, h * 0.3);

        const carCount = 5;
        for (let c = 0; c < carCount; c++) {
          const cx = ((frame * (2 + c)) + c * 80) % (w + 60) - 30;
          ctx.fillStyle = c % 2 === 0 ? "#ef4444" : "#f59e0b";
          ctx.fillRect(cx, h * 0.78 + (c % 3) * 10, 24, 8);

          // Headlight cone
          ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
          ctx.beginPath();
          ctx.moveTo(cx + 24, h * 0.78 + (c % 3) * 10 + 4);
          ctx.lineTo(cx + 60, h * 0.78 + (c % 3) * 10 - 6);
          ctx.lineTo(cx + 60, h * 0.78 + (c % 3) * 10 + 14);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [camId]);

  return (
    <canvas
      ref={canvasRef}
      width={isHighRes ? 800 : 380}
      height={isHighRes ? 450 : 210}
      className="w-full h-full object-cover"
    />
  );
};
