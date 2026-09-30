import React, { useState, useEffect } from "react";
import {
  Clock,
  Zap,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  X,
  Sparkles,
  AlertTriangle,
  Lock,
  Flame,
  Power,
  Skull,
  Radio,
} from "lucide-react";
import { UserTrialStatusResult } from "../utils/leadDatabase";

interface TrialAccessNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialStatus: UserTrialStatusResult | null;
  userEmail?: string;
  lang?: "de" | "en";
  onOpenPaymentTerminal?: (method?: "paypal" | "card" | "klarna" | "crypto") => void;
  onContinueTrial?: () => void;
  onOpenPaymentMethods?: () => void;
  onContinueToDashboard?: () => void;
}

export const TrialAccessNoticeModal: React.FC<TrialAccessNoticeModalProps> = ({
  isOpen,
  onClose,
  trialStatus,
  userEmail,
  lang = "de",
  onOpenPaymentTerminal,
  onContinueTrial,
  onOpenPaymentMethods,
  onContinueToDashboard,
}) => {
  const [countdown, setCountdown] = useState<number>(trialStatus?.remainingSeconds || 0);

  const handleOpenPayment = (method?: "paypal" | "card" | "klarna" | "crypto") => {
    if (typeof onOpenPaymentTerminal === "function") {
      onOpenPaymentTerminal(method);
    } else if (typeof onOpenPaymentMethods === "function") {
      onOpenPaymentMethods();
    }
  };

  const handleContinue = () => {
    if (typeof onContinueTrial === "function") {
      onContinueTrial();
    } else if (typeof onContinueToDashboard === "function") {
      onContinueToDashboard();
    }
  };

  useEffect(() => {
    if (trialStatus?.remainingSeconds !== undefined) {
      setCountdown(trialStatus.remainingSeconds);
    }
  }, [trialStatus]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;
  const isExpired = countdown <= 0 || trialStatus?.isExpired || trialStatus?.reason === "TRIAL_EXPIRED_NO_PAYMENT";
  const hasPaymentMethod = trialStatus?.hasPaymentMethod;

  const formattedTime = `${hours.toString().padStart(2, "0")}h : ${minutes
    .toString()
    .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`;

  return (
    <div className="fixed inset-0 z-[230] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-3xl p-6 md:p-8 text-slate-100 overflow-hidden font-sans border-2 shadow-2xl transition-all ${
          isExpired && !hasPaymentMethod
            ? "bg-gradient-to-b from-[#1a050b] via-[#0d0306] to-black border-rose-500/70 shadow-[0_0_80px_rgba(244,63,94,0.4)]"
            : "bg-gradient-to-b from-[#0a0f26] via-[#050714] to-black border-cyan-500/50 shadow-[0_0_70px_rgba(6,182,212,0.4)]"
        }`}
        id="trial-access-modal"
      >
        {/* Glow ambient effects */}
        {isExpired && !hasPaymentMethod ? (
          <>
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-rose-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* Close button (only if not dead lock / active trial) */}
        {!isExpired && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ============================================================ */}
        {/* 🚨 CASE 1: SYSTEM TOT // 24H EXPIRED WITHOUT PAYMENT METHOD */}
        {/* ============================================================ */}
        {isExpired && !hasPaymentMethod ? (
          <div className="space-y-5">
            {/* Killswitch Header Banner */}
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-mono font-black text-[10px] uppercase tracking-wider animate-bounce">
                      KILLSWITCH AKTIVIERT
                    </span>
                    <span className="text-[11px] font-mono text-rose-300 font-bold">
                      STATUS: SYSTEM TOT
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-white font-mono tracking-tight mt-0.5">
                    🚨 8 KI-CORES SCHOCKGEFROSTET
                  </h3>
                </div>
              </div>

              <div className="hidden sm:block text-right font-mono">
                <span className="text-[10px] text-slate-400 block">TESTZEIT</span>
                <span className="text-rose-400 font-bold text-xs">00:00:00 (ABGELAUFEN)</span>
              </div>
            </div>

            {/* Dramatic Explanation */}
            <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/40 relative overflow-hidden space-y-2">
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                {lang === "de" ? (
                  <>
                    Deine <span className="text-rose-300 font-bold">24-stündige Testphase ist abgelaufen</span>. 
                    Da noch keine Zahlungsmethode hinterlegt wurde, hat das System deine 8 KI-Agenten 
                    (<span className="text-cyan-300">S.Y.N.T.A.X.</span>, <span className="text-rose-300">N.E.O.</span>, <span className="text-emerald-300">V.E.G.A.</span>, <span className="text-amber-300">O.D.I.N.</span> etc.) 
                    vorübergehend <strong>schockgefrostet</strong> und den Zugriff pausiert.
                  </>
                ) : (
                  <>
                    Your <span className="text-rose-300 font-bold">24-hour trial has expired</span>. 
                    Because no payment method was added, all 8 AI agent cores have been shock-frozen and offline.
                  </>
                )}
              </p>

              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-amber-300 font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {lang === "de" 
                    ? "Wähle jetzt 1 Zahlungsart, um dein System sofort wiederzubeleben:" 
                    : "Select 1 payment method to immediately revive your system:"}
                </span>
              </div>
            </div>

            {/* 3 High-Conversion "SYSTEM WIEDERBELEBEN" Instant Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Option 1: PAYPAL */}
              <button
                type="button"
                onClick={() => handleOpenPayment("paypal")}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-sans font-black text-xs md:text-sm uppercase tracking-wider transition flex items-center justify-between cursor-pointer shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-serif font-black text-white text-xs">
                    P
                  </div>
                  <span className="text-left font-mono">
                    {lang === "de" ? "⚡ SYSTEM WIEDERBELEBEN MIT PAYPAL" : "⚡ REVIVE SYSTEM WITH PAYPAL"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              {/* Option 2: KREDITKARTE */}
              <button
                type="button"
                onClick={() => handleOpenPayment("card")}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-sans font-black text-xs md:text-sm uppercase tracking-wider transition flex items-center justify-between cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-slate-950" />
                  <span className="text-left font-mono">
                    {lang === "de" ? "⚡ SYSTEM WIEDERBELEBEN MIT KREDITKARTE" : "⚡ REVIVE WITH CREDIT CARD"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              {/* Option 3: KLARNA */}
              <button
                type="button"
                onClick={() => handleOpenPayment("klarna")}
                className="w-full py-3 px-4 rounded-2xl bg-[#090b17] hover:bg-[#121630] border border-pink-500/50 hover:border-pink-400 text-pink-300 font-sans font-bold text-xs md:text-sm transition flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.2)] active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-black text-[10px] font-mono">
                    KLARNA
                  </span>
                  <span className="text-left font-mono text-xs">
                    {lang === "de" ? "Klarna (Später bezahlen / Ratenkauf)" : "Klarna (Pay later / Slice it)"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              {/* Option 4: CRYPTO & WEB3 WALLET (SOLANA, ETH, BTC, PHANTOM) */}
              <button
                type="button"
                onClick={() => handleOpenPayment("crypto")}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-900/60 via-[#140c2e] to-cyan-950/60 hover:from-purple-800/80 hover:to-cyan-900/80 border-2 border-purple-500/60 hover:border-purple-400 text-purple-200 font-sans font-black text-xs md:text-sm transition flex items-center justify-between cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.35)] active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px] font-mono">
                    20% RABATT
                  </span>
                  <span className="text-left font-mono text-xs text-white">
                    {lang === "de" ? "Crypto & Phantom (SOL • ETH • BTC)" : "Crypto & Phantom (SOL • ETH • BTC)"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* Safety & Cancellation Guarantees */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1-Klick Kündigung im Terminal
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> 256-Bit Verschlüsselung
              </span>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 🟢 CASE 2: TRIAL IS ACTIVE (1 DAY FULL ACCESS & 50K TOKENS)  */
          /* ============================================================ */
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>1 TAG FULL ACCESS & 50K TOKENS AKTIV</span>
              </span>

              <span className="text-cyan-400 font-mono text-xs font-bold">
                SLOT #{trialStatus ? 488 : 488} / 500
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
              {lang === "de"
                ? "1 Tag Vollzugriff & 50.000 Gratis-Tokens"
                : "1 Day Full Access & 50,000 Free Tokens"}
            </h2>

            {/* Subtitle / Description */}
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {lang === "de"
                ? "Du hast 24 Stunden vollen Zugriff auf alle 8 autonomen KI-Agenten und 50.000 Gratis-Tokens zum Ausprobieren. Wenn nach Ablauf der 24 Stunden keine Zahlungsmethode hinterlegt ist, wird der Zugriff automatisch entzogen."
                : "You have 24 hours of full access to all 8 AI Cores and 50,000 free tokens. After 24h, access will be revoked unless a payment method is linked."}
            </p>

            {/* Live Countdown Box & Tokens Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Countdown timer */}
              <div className="p-4 rounded-2xl bg-[#060a1e] border border-cyan-500/30 flex flex-col justify-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verbleibende Testzeit</span>
                </div>
                <div className="text-lg font-mono font-black text-cyan-300 mt-1">
                  {formattedTime}
                </div>
              </div>

              {/* Tokens limit */}
              <div className="p-4 rounded-2xl bg-[#060a1e] border border-purple-500/30 flex flex-col justify-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Gratis-Tokens Kontingent</span>
                </div>
                <div className="text-lg font-mono font-black text-purple-300 mt-1">
                  {trialStatus?.tokensUsed ? `${trialStatus.tokensUsed.toLocaleString()} / ` : "0 / "}
                  50.000 Tokens
                </div>
              </div>
            </div>

            {/* Value Points */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Alle 8 Cores freigeschaltet (Code, Deep-Search, Video, Voice)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Freie Wahl der Zahlungsmethode (PayPal, Kreditkarte, Klarna)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Keine Vorab-Abbuchung während der 24h Testphase</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleContinue}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95"
              >
                <span>{lang === "de" ? "🚀 OS JETZT STARTEN & TESTEN" : "🚀 LAUNCH & TEST OS NOW"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenPayment()}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 font-mono text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === "de" ? "Zahlungsart hinterlegen" : "Add Payment Method"}</span>
              </button>
            </div>
          </div>
        )}

        {/* User Email Footer */}
        {userEmail && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 text-center font-mono text-[10.5px] text-slate-500 flex items-center justify-center gap-2">
            <span>Account:</span>
            <span className="text-slate-300 font-bold">{userEmail}</span>
          </div>
        )}
      </div>
    </div>
  );
};
