import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  ArrowLeftRight,
  Car,
  Train,
  Footprints,
  Bike,
  ExternalLink,
  LocateFixed,
  X,
  Map,
  Moon,
  Sun,
  Search,
} from "lucide-react";

export interface NeoGoogleMapsRoutePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  origin: string;
  destination: string;
  travelMode: "d" | "r" | "w" | "b";
  onChangeOrigin: (val: string) => void;
  onChangeDestination: (val: string) => void;
  onChangeTravelMode: (mode: "d" | "r" | "w" | "b") => void;
  onCalculateRoute?: (orig: string, dest: string, mode: "d" | "r" | "w" | "b") => void;
}

export const NeoGoogleMapsRoutePlanner: React.FC<NeoGoogleMapsRoutePlannerProps> = ({
  isOpen,
  onClose,
  origin,
  destination,
  travelMode,
  onChangeOrigin,
  onChangeDestination,
  onChangeTravelMode,
  onCalculateRoute,
}) => {
  const [isDarkMap, setIsDarkMap] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [originInput, setOriginInput] = useState(origin || "Frankfurt am Main");
  const [destInput, setDestInput] = useState(destination || "München");

  if (!isOpen) return null;

  // Swap origin and destination
  const handleSwap = () => {
    const temp = originInput;
    setOriginInput(destInput);
    setDestInput(temp);
    onChangeOrigin(destInput);
    onChangeDestination(temp);
    if (onCalculateRoute) {
      onCalculateRoute(destInput, temp, travelMode);
    }
  };

  // Trigger route computation
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onChangeOrigin(originInput);
    onChangeDestination(destInput);
    if (onCalculateRoute) {
      onCalculateRoute(originInput, destInput, travelMode);
    }
  };

  // Quick preset route selection
  const handleSelectPreset = (from: string, to: string) => {
    setOriginInput(from);
    setDestInput(to);
    onChangeOrigin(from);
    onChangeDestination(to);
    if (onCalculateRoute) {
      onCalculateRoute(from, to, travelMode);
    }
  };

  // Geolocation lookup
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setOriginInput("Mein Standort");
      onChangeOrigin("Mein Standort");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        setOriginInput(coords);
        onChangeOrigin(coords);
        if (destInput && onCalculateRoute) {
          onCalculateRoute(coords, destInput, travelMode);
        }
      },
      () => {
        setIsLocating(false);
        setOriginInput("Mein Standort");
        onChangeOrigin("Mein Standort");
      },
      { timeout: 8000 }
    );
  };

  const travelModes: { id: "d" | "r" | "w" | "b"; label: string; icon: React.ReactNode }[] = [
    { id: "d", label: "Auto", icon: <Car className="w-3.5 h-3.5" /> },
    { id: "r", label: "Bahn", icon: <Train className="w-3.5 h-3.5" /> },
    { id: "w", label: "Zu Fuß", icon: <Footprints className="w-3.5 h-3.5" /> },
    { id: "b", label: "Fahrrad", icon: <Bike className="w-3.5 h-3.5" /> },
  ];

  const travelModeApiStr =
    travelMode === "d" ? "driving" : travelMode === "w" ? "walking" : travelMode === "b" ? "bicycling" : "transit";

  const googleMapsWebUrl =
    originInput && destInput
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          originInput
        )}&destination=${encodeURIComponent(destInput)}&travelmode=${travelModeApiStr}`
      : destInput
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destInput)}`
      : "https://maps.google.com";

  return (
    <div className="w-full max-w-4xl bg-[#060913]/95 border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.35)] backdrop-blur-2xl text-white overflow-hidden flex flex-col pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* 1. Header */}
      <div className="px-4 py-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/50 via-zinc-900/50 to-purple-950/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs sm:text-sm tracking-wider text-purple-200 uppercase">
                Google Maps // Routenplaner
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                LIVE NAVIGATION
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Travel Mode Selector */}
          <div className="flex items-center bg-black/40 border border-purple-500/30 rounded-lg p-0.5">
            {travelModes.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChangeTravelMode(m.id);
                  if (onCalculateRoute) onCalculateRoute(originInput, destInput, m.id);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
                  travelMode === m.id
                    ? "bg-purple-600 text-white font-bold shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    : "text-zinc-400 hover:text-white"
                }`}
                title={m.label}
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Dark / Standard Map Filter Toggle */}
          <button
            onClick={() => setIsDarkMap((prev) => !prev)}
            title={isDarkMap ? "Zu normaler Karte wechseln" : "Zu Cyberpunk Dunkel-Karte wechseln"}
            className="p-1.5 rounded-lg border border-purple-500/30 bg-black/40 text-purple-300 hover:bg-purple-900/40 transition-colors"
          >
            {isDarkMap ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Open in Google Maps */}
          <a
            href={googleMapsWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="In Google Maps öffnen"
            className="p-1.5 rounded-lg border border-purple-500/30 bg-black/40 text-purple-300 hover:bg-purple-900/40 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Close HUD */}
          <button
            onClick={onClose}
            title="Routenplaner schließen"
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:bg-red-600/80 hover:text-white hover:border-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Controls & Quick Presets */}
      <div className="p-3 sm:p-4 border-b border-purple-500/20 bg-zinc-950/60 flex flex-col gap-2.5">
        <form onSubmit={handleCalculate} className="flex flex-col md:flex-row items-center gap-2">
          {/* Origin */}
          <div className="relative flex-1 w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder="Startpunkt (z.B. Frankfurt oder Standort)..."
              className="w-full pl-9 pr-10 py-2 rounded-xl bg-black/60 border border-purple-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
            <button
              type="button"
              onClick={handleLocateMe}
              title="Aktuellen Standort verwenden"
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors ${
                isLocating ? "animate-spin text-cyan-400" : ""
              }`}
            >
              <LocateFixed className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            title="Start und Ziel tauschen"
            className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-800/40 transition-all shrink-0"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Destination */}
          <div className="relative flex-1 w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
              <Navigation className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
              placeholder="Zielort (z.B. München, Berlin oder Adresse)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/60 border border-purple-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
            {destInput && (
              <button
                type="button"
                onClick={() => setDestInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Route Berechnen</span>
          </button>
        </form>

        {/* Quick Route Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="text-zinc-500 mr-1 hidden sm:inline">Schnell-Routen:</span>
          {[
            { from: "Frankfurt am Main", to: "München" },
            { from: "Berlin", to: "Hamburg" },
            { from: "Köln", to: "Amsterdam" },
            { from: "Stuttgart", to: "Zürich" },
          ].map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectPreset(r.from, r.to)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-500/50 hover:bg-purple-950/40 transition-all cursor-pointer"
            >
              {r.from} ➔ {r.to}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Embedded Google Maps Display */}
      <div className="relative w-full h-[280px] sm:h-[350px] bg-black">
        <iframe
          title="Google Maps Route"
          width="100%"
          height="100%"
          className={`w-full h-full border-0 transition-all duration-300 ${
            isDarkMap
              ? "filter invert-[90%] hue-rotate-180 contrast-[1.25] brightness-[0.88] saturate-[1.2]"
              : "filter contrast-[1.05] brightness-[0.98]"
          }`}
          src={
            originInput && destInput
              ? `https://maps.google.com/maps?saddr=${encodeURIComponent(
                  originInput
                )}&daddr=${encodeURIComponent(destInput)}&dirflg=${travelMode}&output=embed`
              : destInput
              ? `https://maps.google.com/maps?q=${encodeURIComponent(destInput)}&output=embed`
              : `https://maps.google.com/maps?q=Deutschland&output=embed`
          }
          allowFullScreen
        />

        {/* Floating Route Info Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/80 border border-purple-500/40 backdrop-blur-md text-[11px] font-mono text-purple-200 flex items-center gap-2 shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {originInput || "Start"} ➔ {destInput || "Ziel"} (
            {travelModes.find((m) => m.id === travelMode)?.label || "Auto"})
          </span>
        </div>
      </div>
    </div>
  );
};
