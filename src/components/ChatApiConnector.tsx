import React, { useState, useEffect } from "react";
import { Key, Check, AlertTriangle, ExternalLink, Eye, EyeOff, Zap, Loader2, ShieldCheck, Unlink, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../utils/themeStore";
import { useApiKey } from "../utils/apiKeyStore";

interface ChatApiConnectorProps {
  geminiKey?: string;
  onKeySaved?: (newKey: string) => void;
  onClearKey?: () => void;
  compact?: boolean;
  lang?: "de" | "en";
  agentName?: string;
  agentColor?: string;
}

export const ChatApiConnector: React.FC<ChatApiConnectorProps> = ({
  geminiKey,
  onKeySaved,
  onClearKey,
  compact = false,
  lang = "de",
  agentName = "S.Y.N.T.A.X.",
  agentColor = "#00f0ff",
}) => {
  const { isModern } = useTheme();
  const isEn = lang === "en";

  const [storedKey, setStoredKey] = useApiKey();
  const effectiveKey = geminiKey !== undefined ? geminiKey : storedKey;

  const [inputKey, setInputKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [serverFallbackActive, setServerFallbackActive] = useState(false);

  const hasUserKey = Boolean(effectiveKey && effectiveKey.trim().length > 6);

  // Check server key status on mount
  useEffect(() => {
    let isMounted = true;
    const checkServerStatus = async () => {
      try {
        const res = await fetch("/api/api-key-status", {
          headers: effectiveKey ? { "x-custom-gemini-key": effectiveKey } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setServerFallbackActive(Boolean(data.hasServerKey && !hasUserKey));
          }
        }
      } catch (e) {
        // Silently continue
      }
    };
    checkServerStatus();
    return () => {
      isMounted = false;
    };
  }, [effectiveKey, hasUserKey]);

  // Keep local input in sync if effectiveKey changes
  useEffect(() => {
    if (!hasUserKey) {
      setIsExpanded(true); // Automatically expand if no key is linked
    } else {
      setIsExpanded(false);
    }
  }, [hasUserKey]);

  const handleVerifyAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawKey = inputKey.trim().replace(/^["']|["']$/g, "");
    if (!rawKey || rawKey.length < 8) {
      setStatusMessage({
        type: "error",
        text: isEn ? "Please enter a valid Gemini API Key (starts with AIzaSy...)" : "Bitte gültigen Gemini API-Key eingeben (beginnt mit AIzaSy...)",
      });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/verify-gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: rawKey }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setStoredKey(rawKey);
        if (onKeySaved) onKeySaved(rawKey);
        setStatusMessage({
          type: "success",
          text: isEn ? "API Key successfully linked & verified!" : "API-Key erfolgreich verifiziert & verknüpft!",
        });
        setInputKey("");
        setTimeout(() => {
          setStatusMessage(null);
          setIsExpanded(false);
        }, 2200);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || (isEn ? "API key verification failed." : "API-Key Verifizierung fehlgeschlagen."),
        });
      }
    } catch (err: any) {
      setStoredKey(rawKey);
      if (onKeySaved) onKeySaved(rawKey);
      setStatusMessage({
        type: "success",
        text: isEn ? "API Key saved locally!" : "API-Key lokal gespeichert!",
      });
      setInputKey("");
      setTimeout(() => {
        setStatusMessage(null);
        setIsExpanded(false);
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = () => {
    setStoredKey("");
    if (onClearKey) {
      onClearKey();
    } else if (onKeySaved) {
      onKeySaved("");
    }
    setIsExpanded(true);
    setStatusMessage({
      type: "success",
      text: isEn ? "API Key disconnected." : "API-Key getrennt.",
    });
    setTimeout(() => setStatusMessage(null), 2000);
  };

  // Masked key helper
  const maskedUserKey = hasUserKey
    ? effectiveKey.substring(0, 6) + "..." + effectiveKey.substring(Math.max(0, effectiveKey.length - 4))
    : "";

  // ---------------------------------------------------------------------------
  // STATE 1: ALREADY LINKED
  // ---------------------------------------------------------------------------
  if (hasUserKey && !isExpanded) {
    return (
      <div className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
        isModern
          ? "bg-zinc-900/80 border-emerald-500/30 text-zinc-300"
          : "bg-slate-950/80 border-emerald-500/30 text-slate-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
      }`}>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-400 tracking-wider text-[11px]">
            {isEn ? "API LINKED" : "API VERKNÜPFT"}:
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Gemini ({maskedUserKey})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition cursor-pointer"
          >
            {isEn ? "Change" : "Ändern"}
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            className="px-2 py-0.5 rounded-lg border border-red-500/30 bg-red-950/30 hover:bg-red-900/50 text-red-300 text-[10px] font-mono transition cursor-pointer flex items-center gap-1"
            title={isEn ? "Disconnect API Key" : "API Key trennen"}
          >
            <Unlink className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">{isEn ? "Unlink" : "Trennen"}</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE 2: NO API LINKED (OR IN EDIT MODE)
  // ---------------------------------------------------------------------------
  return (
    <div className={`w-full rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xl backdrop-blur-xl ${
      hasUserKey
        ? isModern
          ? "bg-zinc-950/95 border-purple-500/40"
          : "bg-slate-950/95 border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.25)]"
        : isModern
        ? "bg-gradient-to-r from-zinc-950/95 via-purple-950/20 to-zinc-950/95 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
        : "bg-gradient-to-r from-slate-950/95 via-amber-950/20 to-slate-950/95 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
    }`}>
      {/* Top Banner Header */}
      <div className="px-3.5 py-2 flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
            <Key className="w-3 h-3" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black tracking-wider text-amber-300 uppercase">
                {hasUserKey
                  ? (isEn ? "Change Linked API" : "Verknüpfte API ändern")
                  : (isEn ? "No API Linked" : "Keine API verknüpft")}
              </span>
              {!hasUserKey && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {isEn ? "ACTION REQUIRED" : "ERFORDERLICH"}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-300 font-sans leading-tight">
              {isEn
                ? "Link your Google Gemini API Key to chat with agents directly & unlimited."
                : "Verknüpfe deinen Gemini API-Key, um direkt & unbegrenzt mit den Agenten zu chatten."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold transition hover:scale-105"
            title="Kostenlosen Key in Google AI Studio generieren"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{isEn ? "Get free Key ↗" : "Free Key holen ↗"}</span>
          </a>

          {hasUserKey && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Form Field */}
      <form onSubmit={handleVerifyAndSave} className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Key className="w-3.5 h-3.5 text-amber-400/70" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder={isEn ? "Paste Google Gemini API Key here (AIzaSy...)" : "Google Gemini API-Key hier einfügen (AIzaSy...)"}
              className={`w-full pl-9 pr-10 py-2 rounded-xl text-xs font-mono text-white placeholder-slate-500 border focus:outline-none transition ${
                isModern
                  ? "bg-zinc-900 border-zinc-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                  : "bg-slate-900 border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 shadow-inner"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !inputKey.trim()}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
              isModern
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? "VERIFYING..." : "PRÜFE..."}</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{isEn ? "LINK API" : "VERKNÜPFEN"}</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Messages */}
        {statusMessage && (
          <div className={`text-[11px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-2 animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
              : "bg-red-500/15 border border-red-500/40 text-red-300"
          }`}>
            {statusMessage.type === "success" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Bottom Helper Links / Mobile get key */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {isEn ? "Stored locally in browser (localStorage)" : "Sicher lokal im Browser gespeichert"}
          </span>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer noopener"
            className="text-cyan-400 hover:text-cyan-300 underline flex sm:hidden items-center gap-0.5"
          >
            {isEn ? "Get free Key ↗" : "Free Key holen ↗"}
          </a>
        </div>
      </form>
    </div>
  );
};
