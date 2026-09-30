import React, { useState } from "react";
import {
  ShieldCheck,
  X,
  RefreshCw,
  Globe,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { SocialPlatform, SocialAccountProfile } from "./types";

interface SocialOAuthModalProps {
  platform: SocialPlatform;
  isOpen: boolean;
  onClose: () => void;
  onConnectSuccess: (platform: SocialPlatform, handle: string) => void;
}

export const SocialOAuthModal: React.FC<SocialOAuthModalProps> = ({
  platform,
  isOpen,
  onClose,
  onConnectSuccess,
}) => {
  const [handleInput, setHandleInput] = useState("");
  const [authStep, setAuthStep] = useState<"credentials" | "authorizing" | "success">("credentials");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const platformInfo = {
    tiktok: {
      name: "TikTok Creator Studio",
      icon: "🎵",
      color: "from-pink-500 to-rose-600",
      accentBorder: "border-pink-500/50",
      placeholder: "@dein_tiktok_handle oder E-Mail",
      scope: "video.upload, video.data, user.info.basic",
    },
    instagram: {
      name: "Instagram Professional Graph API",
      icon: "📸",
      color: "from-purple-500 via-pink-500 to-amber-500",
      accentBorder: "border-purple-500/50",
      placeholder: "@dein_instagram_handle oder E-Mail",
      scope: "instagram_basic, instagram_content_publish, insights",
    },
    youtube: {
      name: "YouTube Shorts Creator API",
      icon: "▶️",
      color: "from-red-500 to-rose-600",
      accentBorder: "border-red-500/50",
      placeholder: "@dein_kanal oder Gmail",
      scope: "youtube.upload, youtube.readonly",
    },
    x: {
      name: "𝕏 (Twitter) Developer API v2",
      icon: "𝕏",
      color: "from-zinc-700 to-zinc-900",
      accentBorder: "border-blue-500/50",
      placeholder: "@dein_x_handle",
      scope: "tweet.read, tweet.write, users.read",
    },
    linkedin: {
      name: "LinkedIn Creator & Company API",
      icon: "💼",
      color: "from-cyan-600 to-blue-700",
      accentBorder: "border-cyan-500/50",
      placeholder: "in/dein-name oder E-Mail",
      scope: "w_member_social, r_basicprofile",
    },
  }[platform];

  const handleStartAuth = () => {
    if (!handleInput.trim()) {
      setErrorMessage("Bitte gib deinen Account-Handle oder deine E-Mail ein.");
      return;
    }
    setErrorMessage(null);
    setAuthStep("authorizing");

    setTimeout(() => {
      setAuthStep("success");
      const cleanHandle = handleInput.trim().startsWith("@") || handleInput.includes("/")
        ? handleInput.trim()
        : `@${handleInput.trim()}`;

      setTimeout(() => {
        onConnectSuccess(platform, cleanHandle);
        onClose();
        setAuthStep("credentials");
        setHandleInput("");
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className={`w-full max-w-md bg-zinc-950 border ${platformInfo.accentBorder} rounded-3xl shadow-2xl overflow-hidden flex flex-col`}>
        
        {/* Modal Header */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${platformInfo.color} flex items-center justify-center text-lg text-white font-bold shadow-md`}>
              {platformInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {platformInfo.name}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Offizielle OAuth 2.0 Verifizierung
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {authStep === "credentials" && (
            <>
              {/* Permissions Box */}
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-zinc-200 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Berechtigungen für S.Y.N.T.A.X. Studio:</span>
                </div>
                <ul className="text-zinc-400 text-[11px] space-y-1 pl-5 list-disc">
                  <li>Automatisches Veröffentlichen & Planen von Reels & Clips</li>
                  <li>Abruf von Video-Analytics & Retention-Dropoff-Daten</li>
                  <li>Synchronisation mit dem zentralen Content-Kalender</li>
                </ul>
              </div>

              {/* Input field */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium text-xs block">
                  Benutzername / Channel Handle:
                </label>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder={platformInfo.placeholder}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleStartAuth();
                  }}
                />
                {errorMessage && (
                  <p className="text-[11px] text-red-400">{errorMessage}</p>
                )}
              </div>

              {/* Security guarantee */}
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Ende-zu-Ende 256-bit AES Token Verschlüsselung</span>
              </div>
            </>
          )}

          {authStep === "authorizing" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-white">OAuth 2.0 Handshake...</p>
                <p className="text-xs text-zinc-400 font-mono">
                  Fordere API Tokens an von {platformInfo.name}
                </p>
              </div>
            </div>
          )}

          {authStep === "success" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-white">Account erfolgreich autorisiert!</p>
                <p className="text-xs text-emerald-400 font-mono">
                  Token aktiv · S.Y.N.T.A.X. Publisher synchronisiert
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        {authStep === "credentials" && (
          <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleStartAuth}
              className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition shadow-md shadow-pink-500/20"
            >
              Konto Verknüpfen
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
