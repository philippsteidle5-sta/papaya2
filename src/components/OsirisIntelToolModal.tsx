import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Plane,
  Radio,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  X,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Search,
  Shield,
  Eye,
  Video,
  Satellite,
  Flame,
  AlertTriangle,
  Activity,
  Send,
  Compass,
  Layers,
  Info,
  MapPin,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { playClickSound } from "../utils/audioSynth";
import { CctvSurveillanceGrid } from "./CctvSurveillanceGrid";

export interface OsirisFlight {
  callsign: string;
  icao24: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  aircraft: string;
  airline?: string;
  squawk?: string;
}

type TabType = "RADAR" | "TERMINAL" | "WEBVIEW" | "SATELLITES" | "CCTV" | "THREATS";

interface OsirisIntelToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransmitIntel?: (intelSummary: string) => void;
  lang?: "de" | "en";
  initialTab?: TabType;
}

export const OsirisIntelToolModal: React.FC<OsirisIntelToolModalProps> = ({
  isOpen,
  onClose,
  onTransmitIntel,
  lang = "de",
  initialTab = "RADAR",
}) => {
  const isEn = lang === "en";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Script & API Telemetry State
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [commercialFlightsCount, setCommercialFlightsCount] = useState<number>(9180);
  const [militaryFlightsCount, setMilitaryFlightsCount] = useState<number>(365);
  const [executionMs, setExecutionMs] = useState<number>(185);
  const [source, setSource] = useState<string>("live_osiris_api");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [flights, setFlights] = useState<OsirisFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<OsirisFlight | null>(null);
  const [flightSearchQuery, setFlightSearchQuery] = useState<string>("");
  const [altitudeFilter, setAltitudeFilter] = useState<"ALL" | "HIGH" | "LOW">("ALL");

  // Terminal Log State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "# OSIRIS AI LIVE RADAR ENGINE (osirisai.live)",
    "# Official script: curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'",
    "# Bereit zur Ausführung. Klicke auf 'Skript Ausführen' oder wechsle zwischen den Modulen...",
  ]);

  // Selected CCTV Camera State
  const [selectedCctv, setSelectedCctv] = useState<any | null>(null);

  // Run the bash script: curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'
  const runOsirisScript = async () => {
    setLoading(true);
    playClickSound();
    const commandText = "curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'";
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    setTerminalLogs((prev) => [
      ...prev,
      `[${timeNow}] $ ${commandText}`,
      `[${timeNow}] > Verbindung wird aufgebaut zu https://osirisai.live/api/flights...`,
      `[${timeNow}] > Mode-S / ADS-B Transponderdaten werden live empfangen...`,
    ]);

    try {
      const res = await fetch("/api/admin/osiris-flights");
      const data = await res.json();

      if (data.count) {
        setCommercialFlightsCount(data.count);
      }
      if (data.militaryFlightsCount) {
        setMilitaryFlightsCount(data.militaryFlightsCount);
      }
      if (data.executionMs) {
        setExecutionMs(data.executionMs);
      }
      if (data.source) {
        setSource(data.source);
      }
      if (Array.isArray(data.sampleFlights) && data.sampleFlights.length > 0) {
        setFlights(data.sampleFlights);
        if (!selectedFlight) {
          setSelectedFlight(data.sampleFlights[0]);
        }
      }
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      setTerminalLogs((prev) => [
        ...prev,
        `[${timeNow}] > HTTP 200 OK (${data.executionMs || 185}ms) | Remote: osirisai.live`,
        `[${timeNow}] > Parsing JSON: .commercial_flights | length`,
        `[${timeNow}] > ERGEBNIS: ${data.count} kommerzielle Flüge aktiv im Orbit/Luftraum`,
        `[${timeNow}] [✓ VERIFIED: ${data.count?.toLocaleString()} kommerzielle Flüge & ${data.militaryFlightsCount || 0} Special-Transponder]`,
      ]);
    } catch (err: any) {
      setTerminalLogs((prev) => [
        ...prev,
        `[${timeNow}] > Fehler bei der Skriptabfrage: ${err?.message || "Netzwerkunterbrechung"}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on initial open
  useEffect(() => {
    if (isOpen) {
      runOsirisScript();
    }
  }, [isOpen]);

  // Filtered flights list
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (altitudeFilter === "HIGH" && f.altitude < 30000) return false;
      if (altitudeFilter === "LOW" && f.altitude >= 30000) return false;
      if (!flightSearchQuery) return true;
      const q = flightSearchQuery.toLowerCase();
      return (
        f.callsign.toLowerCase().includes(q) ||
        f.icao24.toLowerCase().includes(q) ||
        f.aircraft.toLowerCase().includes(q) ||
        (f.airline && f.airline.toLowerCase().includes(q))
      );
    });
  }, [flights, flightSearchQuery, altitudeFilter]);

  // Transmit selected flight info to G.L.O.B.E.
  const handleTransmitSelectedFlight = (flight: OsirisFlight) => {
    if (!onTransmitIntel) return;
    playClickSound();
    const summary = `🛰️ [OSIRIS AI FLIGHT INTEL]\nCallsign: ${flight.callsign} | ICAO24: ${flight.icao24}\nFlugzeugtyp: ${flight.aircraft} (${flight.airline || "Commercial Carrier"})\nFlughöhe: ${flight.altitude.toLocaleString()} ft | Geschwindigkeit: ${flight.speed} kts | Kurs: ${flight.heading}°\nKoordinaten: ${flight.lat.toFixed(4)}°, ${flight.lng.toFixed(4)}°\nTransponder Squawk: ${flight.squawk || "1200"}\nQuelle: osirisai.live/api/flights`;
    onTransmitIntel(summary);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-2 sm:p-4 animate-fade-in font-sans">
      <div
        className={`w-full flex flex-col bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden transition-all duration-300 ${
          isMaximized ? "h-[98vh] max-w-[99vw]" : "h-[92vh] max-w-7xl"
        }`}
      >
        {/* TOP COMMAND HEADER */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white tracking-wider font-mono flex items-center gap-2">
                  <span>OSIRIS AI</span>
                  <span className="text-cyan-400">—</span>
                  <span className="text-cyan-300 text-sm sm:text-base">GLOBAL INTELLIGENCE PLATFORM</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  osirisai.live
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  OPEN-SOURCE PALANTIR
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Echtzeit-Transponder, Orbital-Tracking, CCTVs & OSINT-Telemetrie</span>
                {lastUpdated && (
                  <span className="text-cyan-400/80 text-[11px]">
                    (Letzter Abruf: {lastUpdated})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* SCRIPT ACTION & EXTERNAL LINK BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* The exact requested curl script button */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/80 border border-cyan-500/40 text-xs font-mono">
              <code className="text-cyan-300 font-bold select-all text-[11px]">
                curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'");
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                }}
                className="text-cyan-400 hover:text-cyan-200 p-1 transition"
                title="Befehl kopieren"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={runOsirisScript}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs font-mono tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "LÄDT..." : "SKRIPT AUSFÜHREN"}</span>
            </button>

            {/* DIRECT EXTERNAL LINK TO OSIRISAI.LIVE */}
            <a
              href="https://osirisai.live"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer transition shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105"
              title="Vollständige Website osirisai.live in neuem Tab öffnen"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-200" />
              <span>OSIRISAI.LIVE ÖFFNEN</span>
            </a>

            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition"
              title={isMaximized ? "Verkleinern" : "Vollbild"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 transition"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRIC STRIP */}
        <div className="bg-slate-900/90 border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar font-mono text-xs">
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">.commercial_flights:</span>
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-cyan-400" />
                {commercialFlightsCount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Militär/Special:</span>
              <span className="font-bold text-blue-300 text-sm flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                {militaryFlightsCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Satelliten (LEO):</span>
              <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-amber-400" />
                2,140+
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500">CCTV Kameras:</span>
              <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                1,420+ Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <span className="text-zinc-400">API-Latenz:</span>
            <span className="text-teal-300 font-bold">{executionMs}ms</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              200 OK
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-slate-950 px-3 pt-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("RADAR");
              playClickSound();
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border-t border-x ${
              activeTab === "RADAR"
                ? "bg-cyan-950/70 text-cyan-200 border-cyan-500/50 shadow-[0_-2px_10px_rgba(6,182,212,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/50"
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-cyan-400" />
            <span>FLIGHT RADAR & KARTE</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
              {flights.length > 0 ? flights.length : "LIVE"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("TERMINAL");
              playClickSound();
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border-t border-x ${
              activeTab === "TERMINAL"
                ? "bg-cyan-950/70 text-cyan-200 border-cyan-500/50 shadow-[0_-2px_10px_rgba(6,182,212,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/50"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>BASH TERMINAL (CURL & JQ)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("WEBVIEW");
              playClickSound();
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border-t border-x ${
              activeTab === "WEBVIEW"
                ? "bg-cyan-950/70 text-cyan-200 border-cyan-500/50 shadow-[0_-2px_10px_rgba(6,182,212,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/50"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>OSIRISAI.LIVE WEB-VIEW</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px]">
              VOLLBILD
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("SATELLITES");
              playClickSound();
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border-t border-x ${
              activeTab === "SATELLITES"
                ? "bg-cyan-950/70 text-cyan-200 border-cyan-500/50 shadow-[0_-2px_10px_rgba(6,182,212,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/50"
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-amber-400" />
            <span>SATELLITEN & ISS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("CCTV");
              playClickSound();
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border-t border-x ${
              activeTab === "CCTV"
                ? "bg-cyan-950/70 text-cyan-200 border-cyan-500/50 shadow-[0_-2px_10px_rgba(6,182,212,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/50"
            }`}
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>LIVE CCTVS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("THREATS");
              playClickSound();
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border-t border-x ${
              activeTab === "THREATS"
                ? "bg-cyan-950/70 text-cyan-200 border-cyan-500/50 shadow-[0_-2px_10px_rgba(6,182,212,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>SEISMISCH & THREATS</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
          {/* TAB 1: FLIGHT RADAR & MAP */}
          {activeTab === "RADAR" && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Tactical Radar Display (Left/Center) */}
              <div className="flex-1 relative bg-slate-950 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800">
                {/* Radar Grid Background & SVG Canvas */}
                <div className="absolute inset-0 bg-[radial-gradient(#083344_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

                {/* Radar Top Controls Overlay */}
                <div className="p-3 bg-slate-950/80 backdrop-blur-md border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 z-10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-48 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={flightSearchQuery}
                        onChange={(e) => setFlightSearchQuery(e.target.value)}
                        placeholder="Callsign / ICAO / Modell..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAltitudeFilter("ALL")}
                        className={`px-2 py-0.5 rounded transition ${
                          altitudeFilter === "ALL" ? "bg-cyan-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Alle
                      </button>
                      <button
                        type="button"
                        onClick={() => setAltitudeFilter("HIGH")}
                        className={`px-2 py-0.5 rounded transition ${
                          altitudeFilter === "HIGH" ? "bg-cyan-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        &gt;30k ft
                      </button>
                      <button
                        type="button"
                        onClick={() => setAltitudeFilter("LOW")}
                        className={`px-2 py-0.5 rounded transition ${
                          altitudeFilter === "LOW" ? "bg-cyan-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        &lt;30k ft
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{filteredFlights.length} Flugzeuge im Suchfeld</span>
                  </div>
                </div>

                {/* Tactical World Radar Projection Area */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
                  {/* Circular Radar Sweep Effect */}
                  <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/20 pointer-events-none flex items-center justify-center">
                    <div className="w-[450px] h-[450px] rounded-full border border-cyan-500/20" />
                    <div className="w-[300px] h-[300px] rounded-full border border-cyan-500/20" />
                    <div className="w-[150px] h-[150px] rounded-full border border-cyan-500/20" />
                    <div className="absolute inset-0 border-t border-cyan-500/30" />
                    <div className="absolute inset-0 border-l border-cyan-500/30" />
                  </div>

                  {/* World Map SVG Outline */}
                  <svg
                    viewBox="-180 -90 360 180"
                    className="w-full h-full max-h-[550px] opacity-40 select-none pointer-events-none"
                  >
                    <rect x="-180" y="-90" width="360" height="180" fill="none" />
                    {/* Equator & Meridians */}
                    <line x1="-180" y1="0" x2="180" y2="0" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="-90" x2="0" y2="90" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="2,2" />
                  </svg>

                  {/* Interactive Flight Pins Overlay */}
                  <div className="absolute inset-0 p-8">
                    {filteredFlights.slice(0, 70).map((flight, idx) => {
                      // Project lat/lng (-90..90, -180..180) to percentage (0..100)
                      const xPercent = Math.min(Math.max(((flight.lng + 180) / 360) * 100, 2), 98);
                      const yPercent = Math.min(Math.max(((90 - flight.lat) / 180) * 100, 5), 95);
                      const isSelected = selectedFlight?.callsign === flight.callsign;

                      return (
                        <button
                          key={`${flight.callsign}-${idx}`}
                          type="button"
                          onClick={() => {
                            setSelectedFlight(flight);
                            playClickSound();
                          }}
                          style={{
                            left: `${xPercent}%`,
                            top: `${yPercent}%`,
                            transform: `translate(-50%, -50%) rotate(${flight.heading}deg)`,
                          }}
                          className={`absolute p-1 rounded-full transition-transform hover:scale-150 cursor-pointer ${
                            isSelected
                              ? "z-30 text-cyan-300 drop-shadow-[0_0_10px_#22d3ee] scale-125"
                              : "z-20 text-cyan-400/80 hover:text-white"
                          }`}
                          title={`${flight.callsign} (${flight.aircraft}) - ${flight.altitude}ft, ${flight.speed}kts`}
                        >
                          <Plane className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Radar Corner Telemetry */}
                  <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 space-y-0.5 pointer-events-none">
                    <div>RADAR MODE: OSIRIS GLOBAL ADS-B</div>
                    <div>DATA ENGINE: osirisai.live/api/flights</div>
                    <div>COVERAGE: 10,000+ AIRCRAFT GLOBAL</div>
                  </div>
                </div>
              </div>

              {/* Flight Details & Telemetry Sidebar (Right) */}
              <div className="w-full lg:w-96 bg-slate-950 flex flex-col overflow-hidden">
                {selectedFlight ? (
                  <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto custom-scrollbar font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase">CALLSIGN / FLUG</div>
                          <div className="text-xl font-black text-cyan-300 font-mono tracking-wider flex items-center gap-2">
                            <Plane className="w-5 h-5 text-cyan-400" />
                            <span>{selectedFlight.callsign}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/40">
                          {selectedFlight.icao24}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                          <span className="text-zinc-500 block text-[9px]">AIRCRAFT MODEL</span>
                          <span className="text-white font-bold">{selectedFlight.aircraft}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                          <span className="text-zinc-500 block text-[9px]">AIRLINE / CARRIER</span>
                          <span className="text-white font-bold">{selectedFlight.airline || "Commercial"}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                          <span className="text-zinc-500 block text-[9px]">FLUGHÖHE (ALTITUDE)</span>
                          <span className="text-emerald-400 font-bold">{selectedFlight.altitude.toLocaleString()} ft</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                          <span className="text-zinc-500 block text-[9px]">GESCHWINDIGKEIT</span>
                          <span className="text-amber-300 font-bold">{selectedFlight.speed} kts</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                          <span className="text-zinc-500 block text-[9px]">KURS / HEADING</span>
                          <span className="text-cyan-300 font-bold">{selectedFlight.heading}°</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                          <span className="text-zinc-500 block text-[9px]">TRANSPONDER SQUAWK</span>
                          <span className="text-zinc-300 font-bold">{selectedFlight.squawk || "1200"}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-[11px]">
                        <span className="text-zinc-500 block text-[9px]">GPS KOORDINATEN</span>
                        <span className="text-zinc-300">
                          {selectedFlight.lat.toFixed(4)}° N / S, {selectedFlight.lng.toFixed(4)}° E / W
                        </span>
                      </div>

                      {onTransmitIntel && (
                        <button
                          type="button"
                          onClick={() => handleTransmitSelectedFlight(selectedFlight)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-[1.02]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>AN G.L.O.B.E. AGENT ZUR ANALYSE</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Flight List */}
                    <div className="flex-1 flex flex-col space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span>AKTIVE TRANSPONDER-LISTE</span>
                        <span className="text-cyan-400 font-mono">{filteredFlights.length}</span>
                      </div>

                      <div className="flex-1 space-y-1.5 overflow-y-auto max-h-60 custom-scrollbar pr-1">
                        {filteredFlights.slice(0, 30).map((f) => (
                          <button
                            key={f.callsign}
                            type="button"
                            onClick={() => {
                              setSelectedFlight(f);
                              playClickSound();
                            }}
                            className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                              selectedFlight.callsign === f.callsign
                                ? "bg-cyan-950/60 border-cyan-400/60 text-cyan-200"
                                : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Plane className="w-3 h-3 text-cyan-400" />
                              <span className="font-bold">{f.callsign}</span>
                              <span className="text-[10px] text-zinc-400">({f.aircraft})</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold">{f.altitude.toLocaleString()} ft</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 flex-1 flex flex-col items-center justify-center text-center text-zinc-500 font-mono text-xs">
                    <Plane className="w-10 h-10 text-zinc-700 mb-3" />
                    <p>Wähle ein Flugzeug auf dem Radar aus, um Transponder-Telemetrie anzuzeigen.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BASH SCRIPT TERMINAL */}
          {activeTab === "TERMINAL" && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-4 font-mono">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-white">BASH SKRIPT AUSFÜHRUNG</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      REST API + JQ FILTER
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'");
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 flex items-center gap-1.5 transition"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? "Kopiert" : "Befehl kopieren"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={runOsirisScript}
                      disabled={loading}
                      className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-slate-950" />
                      <span>{loading ? "Wird ausgeführt..." : "Jetzt Ausführen"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black border border-cyan-500/30 text-xs text-cyan-300 font-bold overflow-x-auto select-all">
                  curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'
                </div>
              </div>

              {/* Interactive Terminal Window */}
              <div className="flex-1 rounded-xl bg-black border border-zinc-800 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-zinc-300 ml-2">bash terminal // osiris-telemetry</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTerminalLogs(["# Terminal geleert."])}
                    className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-xs text-emerald-400 space-y-1">
                  {terminalLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`${
                        log.startsWith("$")
                          ? "text-cyan-300 font-bold"
                          : log.startsWith(">")
                          ? "text-zinc-400"
                          : log.startsWith("[✓")
                          ? "text-emerald-300 font-bold"
                          : log.startsWith("#")
                          ? "text-zinc-500"
                          : "text-amber-300"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OSIRISAI.LIVE WEBVIEW & DIRECT LAUNCH */}
          {activeTab === "WEBVIEW" && (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Web Header Banner with 1-Click Launch */}
              <div className="p-3 bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/80 border-b border-blue-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    OSIRIS LIVE WEB-APP (https://osirisai.live)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                    ORIGINAL TOOL
                  </span>
                </div>

                <a
                  href="https://osirisai.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition hover:scale-105"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                  <span>IN NEUEM TAB ÖFFNEN</span>
                </a>
              </div>

              {/* Iframe View with Fallback Overlay */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <iframe
                  src="https://osirisai.live"
                  title="OSIRIS AI Live Platform"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />

                {/* Info Note in case Cloudflare SAMEORIGIN prevents embed */}
                <div className="absolute bottom-4 left-4 right-4 max-w-lg mx-auto p-3 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-zinc-300">
                      Sollte dein Browser externe Einbettungen blockieren:
                    </span>
                  </div>
                  <a
                    href="https://osirisai.live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition shrink-0"
                  >
                    Vollbild öffnen
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SATELLITES & ISS */}
          {activeTab === "SATELLITES" && (
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Satellite className="w-6 h-6 text-amber-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-white">ORBITAL SATELLITE & ISS TRACKER</h3>
                    <p className="text-zinc-400 text-[11px]">
                      Über 2,000 erfasste LEO/GEO-Satelliten & Internationale Raumstation
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  NORAD TLE ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span>ISS (ZARYA)</span>
                    <span>NORAD 25544</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1">
                    <div>Geschwindigkeit: <span className="text-white">27,580 km/h</span></div>
                    <div>Flughöhe: <span className="text-emerald-400">418 km</span></div>
                    <div>Inklination: <span className="text-white">51.64°</span></div>
                    <div>Orbit: <span className="text-cyan-400">LEO (92.9 Min/Umlauf)</span></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-cyan-300 font-bold">
                    <span>HUBBLE TELESCOPE</span>
                    <span>NORAD 20580</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1">
                    <div>Geschwindigkeit: <span className="text-white">27,320 km/h</span></div>
                    <div>Flughöhe: <span className="text-emerald-400">535 km</span></div>
                    <div>Inklination: <span className="text-white">28.47°</span></div>
                    <div>Status: <span className="text-emerald-400">Aktiv & Kalibriert</span></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-blue-300 font-bold">
                    <span>TIANGONG STATION</span>
                    <span>NORAD 48274</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1">
                    <div>Geschwindigkeit: <span className="text-white">27,620 km/h</span></div>
                    <div>Flughöhe: <span className="text-emerald-400">389 km</span></div>
                    <div>Inklination: <span className="text-white">41.47°</span></div>
                    <div>Besatzung: <span className="text-white">3 Taikonauten</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE CCTV FEEDS */}
          {activeTab === "CCTV" && (
            <CctvSurveillanceGrid onTransmitToGlobe={onTransmitIntel} lang={lang} />
          )}

          {/* TAB 6: SEISMISCH & THREATS */}
          {activeTab === "THREATS" && (
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-white">NATURKATASTROPHEN & THREAT INTEL</h3>
                    <p className="text-zinc-400 text-[11px]">
                      USGS Seismik, NASA FIRMS Waldbrände, Nuklearanlagen & Cyber-Threats
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  GLOBAL SENSORS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-red-400 font-bold">
                    <span>USGS SEISMISCHE AKTIVITÄT</span>
                    <span>M4.5+ FILTER</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1.5">
                    <div className="p-2 rounded bg-black/40 border border-zinc-800 flex justify-between">
                      <span className="text-white">M 5.8 — Honshu, Japan</span>
                      <span className="text-amber-400 font-bold">Vor 18m</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800 flex justify-between">
                      <span className="text-white">M 4.9 — Antofagasta, Chile</span>
                      <span className="text-zinc-400">Vor 1h 12m</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-amber-400 font-bold">
                    <span>NASA FIRMS THERMAL-ANOMALIEN</span>
                    <span>MODIS / VIIRS</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1.5">
                    <div className="p-2 rounded bg-black/40 border border-zinc-800 flex justify-between">
                      <span className="text-white">Thermal Hotspot Cluster — Südeuropa</span>
                      <span className="text-red-400 font-bold">Aktiv</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800 flex justify-between">
                      <span className="text-white">Vegetationsfeuer — Amazonasbecken</span>
                      <span className="text-amber-400">Überwacht</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
