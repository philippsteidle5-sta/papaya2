import React, { useState, useEffect } from "react";
import { X, Key, Sliders, ExternalLink, AlertTriangle, ShieldCheck, Sparkles, Check, Trash2, Save, Volume2, Play, Loader2, Info } from "lucide-react";
import { UserRole, ROLE_TIER_DETAILS } from "../rbac";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedKey?: string;
  geminiKey?: string;
  onSave?: (key: string) => void;
  onSaveGeminiKey?: (key: string) => void;
  micSensitivity: number;
  onMicSensitivityChange?: (val: number) => void;
  onChangeMicSensitivity?: (val: number) => void;
  userRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
  onOpenRoleManager?: () => void;
  compareEnabled?: boolean;
  onToggleCompare?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
  onClearAllChats?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  savedKey,
  geminiKey,
  onSave,
  onSaveGeminiKey,
  micSensitivity,
  onMicSensitivityChange,
  onChangeMicSensitivity,
  userRole = "SOVEREIGN",
  onSelectRole,
  onOpenRoleManager,
}) => {
  const initialKey = savedKey ?? geminiKey ?? "";
  const [key, setKey] = useState(initialKey);
  const [elevenLabsKey, setElevenLabsKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("elevenlabs_api_key") || "";
    }
    return "";
  });
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("elevenlabs_voice_id") || "70dzXY4HZleqxYtQr59t";
    }
    return "70dzXY4HZleqxYtQr59t";
  });
  const [justSaved, setJustSaved] = useState(false);
  const [testVoiceState, setTestVoiceState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [testVoiceMsg, setTestVoiceMsg] = useState<string | null>(null);
  const [accountVoices, setAccountVoices] = useState<Array<{ voice_id: string; name: string; category?: string }>>([]);

  // Fetch available ElevenLabs voices on open if key is available
  useEffect(() => {
    if (!isOpen) return;
    const keyToUse = elevenLabsKey.trim();
    fetch(`/api/tts/elevenlabs/voices?customApiKey=${encodeURIComponent(keyToUse)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.voices)) {
          setAccountVoices(data.voices);
        }
      })
      .catch(() => {
        // Silently ignore if no key or offline
      });
  }, [isOpen, elevenLabsKey]);

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    setTestVoiceState("loading");
    setTestVoiceMsg(null);
    try {
      const res = await fetch("/api/tts/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Hallo Philipp! N.E.O. Neural Nexus ist online und bereit für deine Befehle.",
          voiceId: elevenLabsVoiceId.trim() || "70dzXY4HZleqxYtQr59t",
          customApiKey: elevenLabsKey.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.details || errJson?.error || `Fehler: ${res.status}`);
      }

      const fallbackUsed = res.headers.get("X-ElevenLabs-Fallback") === "true";
      const warningRaw = res.headers.get("X-ElevenLabs-Warning");
      const warningText = warningRaw ? decodeURIComponent(warningRaw) : null;
      const usedVoice = res.headers.get("X-ElevenLabs-Used-Voice");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      setTestVoiceState("playing");
      if (fallbackUsed) {
        setTestVoiceMsg(
          warningText ||
          "ElevenLabs Free-Plan: Library-Stimmen erfordern Starter-Plan ($5). N.E.O. nutzt vorübergehend die fotorealistische Stimme 'Adam'."
        );
      } else {
        setTestVoiceMsg(`Erfolg: Stimme "${usedVoice || elevenLabsVoiceId}" spricht live!`);
      }

      audio.onended = () => {
        setTestVoiceState("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setTestVoiceState("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err: any) {
      setTestVoiceState("error");
      setTestVoiceMsg(err.message || "Fehler bei der Sprachgenerierung");
    }
  };

  const handleSaveElevenLabsKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("elevenlabs_api_key", elevenLabsKey.trim());
      localStorage.setItem("elevenlabs_voice_id", elevenLabsVoiceId.trim() || "70dzXY4HZleqxYtQr59t");
    }
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 1200);
  };

  const handleSave = () => {
    if (onSave) onSave(key.trim());
    if (onSaveGeminiKey) onSaveGeminiKey(key.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem("elevenlabs_api_key", elevenLabsKey.trim());
      localStorage.setItem("elevenlabs_voice_id", elevenLabsVoiceId.trim() || "70dzXY4HZleqxYtQr59t");
    }
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 400);
  };

  const handleClear = () => {
    setKey("");
    setElevenLabsKey("");
    setElevenLabsVoiceId("70dzXY4HZleqxYtQr59t");
    if (onSave) onSave("");
    if (onSaveGeminiKey) onSaveGeminiKey("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("elevenlabs_api_key");
      localStorage.removeItem("elevenlabs_voice_id");
    }
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-[250] flex items-center justify-center backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-2xl relative flex flex-col max-h-[94vh] my-auto overflow-hidden border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] bg-[#070c18]/95 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between z-10">
          <h3 className="font-mono text-xs sm:text-sm tracking-[2px] text-cyan-400 font-bold flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400 animate-pulse" />
            S.Y.N.T.A.X. KERN-EINSTELLUNGEN
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body - Guaranteed smooth scrolling on laptops & small screens */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-slate-950">
          
          {/* Quota Help Banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 text-xs font-sans text-emerald-200/90 leading-relaxed shadow-inner">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-400 mb-1">
              <AlertTriangle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              KEIN EIGENER SCHLÜSSEL ERFORDERLICH!
            </div>
            <p className="text-[11px] mb-2.5 text-emerald-100/90 leading-relaxed">
              Du musst <strong>keinen eigenen API-Key erstellen</strong>! Der kostenlose System-Schlüssel ist bereits aktiviert. Lass das Feld unten einfach leer, um sofort mit JARVIS & den 8 Agenten zu sprechen.
            </p>
            <button
              onClick={handleClear}
              className="w-full py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-[0.99] border border-emerald-400/50 rounded-lg text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              System-Schlüssel aktivieren (Eingabe löschen)
            </button>
          </div>

          {/* API Key Input Section */}
          <div className="space-y-1.5 bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3.5">
            <label className="block font-mono text-[10px] text-cyan-300 font-bold tracking-wider uppercase flex items-center justify-between">
              <span>Eigener Gemini API-Key (Optional)</span>
              <span className="text-[9px] text-slate-500 font-normal">Feld sonst leer lassen</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                placeholder="Google Gemini Key hier einfügen (AIza... / AQ...)"
                className="flex-1 bg-slate-900 border border-cyan-500/30 text-cyan-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                title="Diesen Key sofort speichern"
              >
                <Save className="w-3.5 h-3.5" />
                Übernehmen
              </button>
            </div>
            <p className="font-mono text-[9.5px] text-slate-400 leading-relaxed pt-1">
              Der Key wird sicher lokal in deinem Browser (localStorage) gespeichert und ermöglicht unbegrenzte Dual-Core Vergleiche.
            </p>
          </div>

          {/* ElevenLabs Voice Integration Section */}
          <div className="space-y-2.5 bg-slate-950/60 border border-violet-500/30 rounded-xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[10px] text-violet-300 font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>ELEVENLABS NEURAL VOICE (N.E.O.)</span>
              </label>
              <span className="text-[9px] text-violet-400 font-mono bg-violet-950/60 px-2 py-0.5 rounded border border-violet-500/30">
                Voice ID: {elevenLabsVoiceId}
              </span>
            </div>

            <p className="font-mono text-[9.5px] text-slate-300 leading-relaxed">
              Fotorealistische KI-Stimme für <strong>N.E.O.</strong>: <strong>Darth Revan</strong> (Voice ID: <code className="text-violet-300">70dzXY4HZleqxYtQr59t</code>).
            </p>

            {/* API Key Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value.trim())}
                placeholder="ElevenLabs API-Key (xi-api-key)..."
                className="flex-1 bg-slate-900 border border-violet-500/30 text-violet-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition"
              />
              <button
                onClick={handleSaveElevenLabsKey}
                className="px-3 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/50 text-violet-300 font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                title="ElevenLabs API-Key speichern"
              >
                <Save className="w-3.5 h-3.5" />
                Übernehmen
              </button>
            </div>

            {/* Voice ID & Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>STIMMEN-AUSWAHL / VOICE ID:</span>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={testVoiceState === "loading" || testVoiceState === "playing"}
                  className={`px-2.5 py-1 rounded text-[9.5px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    testVoiceState === "loading"
                      ? "bg-violet-900/50 text-violet-300 border border-violet-500/40"
                      : testVoiceState === "playing"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                      : "bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-400/40"
                  }`}
                >
                  {testVoiceState === "loading" ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Lädt Stimme...
                    </>
                  ) : testVoiceState === "playing" ? (
                    <>
                      <Volume2 className="w-3 h-3" />
                      Spricht...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Stimme testen
                    </>
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={elevenLabsVoiceId}
                  onChange={(e) => setElevenLabsVoiceId(e.target.value.trim())}
                  placeholder="Voice ID (z.B. 1QykRgkluVRz9xfOVUsh)..."
                  className="flex-1 bg-slate-900 border border-violet-500/30 text-violet-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-violet-400 transition"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setElevenLabsVoiceId("70dzXY4HZleqxYtQr59t");
                    if (typeof window !== "undefined") localStorage.setItem("elevenlabs_voice_id", "70dzXY4HZleqxYtQr59t");
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                    elevenLabsVoiceId === "70dzXY4HZleqxYtQr59t"
                      ? "bg-violet-600/30 border-violet-400 text-violet-200 font-bold"
                      : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Darth Revan - Epische, dunkle Sci-Fi-Stimme (Generiert)"
                >
                  ⚡ Darth Revan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElevenLabsVoiceId("pNInz6obpgDQGcFmaJgB");
                    if (typeof window !== "undefined") localStorage.setItem("elevenlabs_voice_id", "pNInz6obpgDQGcFmaJgB");
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                    elevenLabsVoiceId === "pNInz6obpgDQGcFmaJgB"
                      ? "bg-violet-600/30 border-violet-400 text-violet-200 font-bold"
                      : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Adam - Dominant, selbstbewusst, durchsetzungsstark"
                >
                  Adam (Dominant)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElevenLabsVoiceId("cjVigY5qzO86Huf0OWal");
                    if (typeof window !== "undefined") localStorage.setItem("elevenlabs_voice_id", "cjVigY5qzO86Huf0OWal");
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                    elevenLabsVoiceId === "cjVigY5qzO86Huf0OWal"
                      ? "bg-violet-600/30 border-violet-400 text-violet-200 font-bold"
                      : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Eric - Glatt, vertrauenswürdig, perfekt für KI-Assistenten (Jarvis-Vibe)"
                >
                  Eric (Jarvis Smooth)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElevenLabsVoiceId("IKne3meq5aSn9XLyUdCD");
                    if (typeof window !== "undefined") localStorage.setItem("elevenlabs_voice_id", "IKne3meq5aSn9XLyUdCD");
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                    elevenLabsVoiceId === "IKne3meq5aSn9XLyUdCD"
                      ? "bg-violet-600/30 border-violet-400 text-violet-200 font-bold"
                      : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Charlie - Tief, energisch und dynamisch"
                >
                  Charlie (Tief/Klar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElevenLabsVoiceId("0vcMRFperlmawzKnKKZa");
                    if (typeof window !== "undefined") localStorage.setItem("elevenlabs_voice_id", "0vcMRFperlmawzKnKKZa");
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                    elevenLabsVoiceId === "0vcMRFperlmawzKnKKZa"
                      ? "bg-violet-600/30 border-violet-400 text-violet-200 font-bold"
                      : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Palpatine - Dunkel, kalkulierend, bedrohlich ruhig"
                >
                  Palpatine
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElevenLabsVoiceId("rtFJXZEihc3Up8zyjMp2");
                    if (typeof window !== "undefined") localStorage.setItem("elevenlabs_voice_id", "rtFJXZEihc3Up8zyjMp2");
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                    elevenLabsVoiceId === "rtFJXZEihc3Up8zyjMp2"
                      ? "bg-violet-600/30 border-violet-400 text-violet-200 font-bold"
                      : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="C-3PO - Protokolldroide"
                >
                  C-3PO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElevenLabsVoiceId("1QykRgkluVRz9xfOVUsh");
                    if (typeof window !== "undefined") localStorage.setItem("elevenlabs_voice_id", "1QykRgkluVRz9xfOVUsh");
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                    elevenLabsVoiceId === "1QykRgkluVRz9xfOVUsh"
                      ? "bg-violet-600/30 border-violet-400 text-violet-200 font-bold"
                      : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Julius - Library (erfordert Starter-Plan)"
                >
                  Julius (Library)
                </button>
              </div>

              {/* Status or warning feedback from testing */}
              {testVoiceMsg && (
                <div className={`mt-2 p-2 rounded-lg text-[9.5px] font-mono border leading-relaxed flex items-start gap-1.5 ${
                  testVoiceState === "error"
                    ? "bg-red-950/40 border-red-500/40 text-red-300"
                    : testVoiceMsg.includes("Starter-Plan") || testVoiceMsg.includes("Free-Plan")
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                    : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                }`}>
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div>{testVoiceMsg}</div>
                </div>
              )}
            </div>

            <p className="font-mono text-[8.5px] text-slate-400 leading-relaxed pt-1">
              <strong>Hinweis zu ElevenLabs:</strong> Kostenlose Free-Accounts können Community-Library-Stimmen (wie Julius) laut ElevenLabs-Richtlinie nicht per API nutzen (erfordert Starter-Plan ab $5). N.E.O. wechselt bei Free-Accounts automatisch auf die Neuralstimme "Adam", sodass du niemals wieder die alte Browser-Stimme hörst!
            </p>
          </div>

          {/* Voice Activation Sensitivity Slider */}
          <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3.5 space-y-3">
            <h4 className="font-mono text-[11px] tracking-[1.5px] text-cyan-400 font-bold flex items-center gap-2 uppercase">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              MIKROFON & SPRACHSTEUERUNG
            </h4>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[10px] text-slate-300 font-medium">
                <span>MIC EMPFINDLICHKEIT:</span>
                <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {micSensitivity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={micSensitivity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onMicSensitivityChange) onMicSensitivityChange(val);
                  if (onChangeMicSensitivity) onChangeMicSensitivity(val);
                }}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-cyan-500/20 focus:outline-none accent-cyan-400"
              />
              <div className="flex justify-between font-mono text-[8px] text-slate-400 mt-0.5">
                <span>STILLER FILTER (NOISE GATE)</span>
                <span>EXTREM REAKTIV</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg font-mono text-[9px] text-slate-300 space-y-1">
              <span className="text-cyan-400 font-bold block">🎙️ WINDOWS MIKROFON DIAGNOSE:</span>
              <p>1. Chrome/Edge nutzt das <strong>Windows-Standard-Kommunikationsgerät</strong>.</p>
              <p>2. Achte darauf, dass in den Windows-Soundeinstellungen das richtige Mikrofon als Standard gewählt und nicht stummgeschaltet ist.</p>
            </div>
          </div>

          {/* RBAC Access Tier Role Selector */}
          <div className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
            <h4 className="font-mono text-[11px] tracking-[1.5px] text-amber-400 font-bold flex items-center justify-between uppercase">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                RBAC ACCESS TIER
              </span>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                {ROLE_TIER_DETAILS[userRole].price}
              </span>
            </h4>

            <p className="font-mono text-[9.5px] text-slate-400">
              Manuelles Zuweisen deiner Benutzer-Rolle zur Steuerung der 8 System-Agenten:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(["LITE_ACCESS", "OPERATOR", "SOVEREIGN"] as UserRole[]).map((r) => {
                const meta = ROLE_TIER_DETAILS[r];
                const isSelected = userRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => onSelectRole?.(r)}
                    className={`py-2 px-1.5 rounded-lg font-mono text-[9px] font-bold tracking-wider uppercase border transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-amber-500/25 text-amber-200 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div>{r === "LITE_ACCESS" ? "LITE" : r === "OPERATOR" ? "OPERATOR" : "SOVEREIGN"}</div>
                    <div className="text-[8px] font-normal text-amber-400/80 mt-0.5">{meta.price}</div>
                  </button>
                );
              })}
            </div>

            {onOpenRoleManager && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRoleManager();
                }}
                className="w-full py-2 px-3 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 rounded-lg text-cyan-300 font-mono text-[10px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Detaillierten Rollen-Manager öffnen
              </button>
            )}
          </div>
        </div>

        {/* Sticky Footer Bar - Always visible, never cut off! */}
        <div className="flex-shrink-0 px-5 py-3.5 bg-slate-950/95 border-t border-cyan-500/30 flex items-center justify-between gap-3 z-10">
          <button
            onClick={handleClear}
            className="px-3.5 py-2 text-xs font-mono border border-red-500/40 text-red-400 hover:bg-red-500/15 active:scale-95 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-bold"
            title="Eingaben löschen und System-Key verwenden"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>LÖSCHEN</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-mono border border-slate-700 text-slate-400 hover:bg-slate-800/80 rounded-lg transition cursor-pointer"
            >
              ABBRECHEN
            </button>
            <button
              onClick={handleSave}
              className={`px-5 py-2 text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95 ${
                justSaved
                  ? "bg-emerald-500 text-slate-950 border border-emerald-400"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              }`}
            >
              {justSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>GESPEICHERT!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SPEICHERN</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
