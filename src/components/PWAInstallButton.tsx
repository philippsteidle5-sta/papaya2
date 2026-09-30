import React, { useState } from "react";
import { Download, Share2, PlusSquare, X, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "badge" | "button" | "banner";
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = "",
  variant = "badge",
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, do not show install prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow with automatic beforeinstallprompt
  if (isInstallable) {
    if (variant === "banner") {
      return (
        <div className={`p-3 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_25px_rgba(0,245,255,0.25)] flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                Als Handy-App installieren
              </div>
              <div className="text-[9px] text-cyan-200/80 font-mono">
                Vollbild-Sprachinterface ohne Browserleiste
              </div>
            </div>
          </div>
          <button
            onClick={install}
            className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,245,255,0.4)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>INSTALLIEREN</span>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-300 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,245,255,0.25)] transition active:scale-95 cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>APP INSTALLIEREN</span>
      </button>
    );
  }

  // iOS Safari flow (manual "Add to Home Screen")
  if (isIOS) {
    return (
      <>
        {variant === "banner" ? (
          <div className={`p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-cyan-950/80 border border-cyan-400/40 shadow-[0_0_25px_rgba(0,245,255,0.2)] flex items-center justify-between gap-3 ${className}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                  Auf iPhone-Homescreen
                </div>
                <div className="text-[9px] text-cyan-200/80 font-mono">
                  Als Vollbild-App mit Partikelkugel nutzen
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs font-mono tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,245,255,0.4)] shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>INSTALLIEREN</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/60 text-cyan-200 hover:bg-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,245,255,0.2)] transition active:scale-95 cursor-pointer ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>APP INSTALLIEREN</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
            <div className="relative w-full max-w-sm rounded-3xl bg-[#080d18] border border-cyan-500/40 p-6 text-slate-100 shadow-[0_0_60px_rgba(0,245,255,0.25)] space-y-5">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,245,255,0.4)]">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide font-mono flex items-center gap-1.5">
                    <span>N.E.O. auf dein iPhone</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h3>
                  <p className="text-[11px] text-cyan-300/80 font-mono">
                    Als Vollbild-App ohne Safari-Browserleiste
                  </p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Tippe auf Teilen</span>
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                      Im unteren Safari-Menü auf das Viereck mit Pfeil nach oben tippen.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>„Zum Home-Bildschirm“</span>
                      <PlusSquare className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                      Scrolle in der Liste etwas nach unten und wähle <strong>Zum Home-Bildschirm</strong>.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Oben rechts: „Hinzufügen“</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                      Bestätigen – N.E.O. ist sofort als eigene App auf deinem Homescreen bereit!
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(0,245,255,0.4)]"
              >
                VERSTANDEN
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for general desktop / mobile browsers
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/25 text-xs font-mono font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span>PWA APP</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#080d18] border border-cyan-500/40 p-6 text-slate-100 shadow-[0_0_60px_rgba(0,245,255,0.25)] space-y-4 font-mono">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <span>App auf Handy installieren</span>
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Öffne diese Seite auf deinem Smartphone in Safari (iOS) oder Chrome (Android) und wähle im Browser-Menü:
              <br /><br />
              <strong className="text-cyan-300">„Zum Home-Bildschirm hinzufügen“</strong>
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              SCHLIEßEN
            </button>
          </div>
        </div>
      )}
    </>
  );
};
