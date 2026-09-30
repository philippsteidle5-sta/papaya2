import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Sliders,
  X,
  CreditCard,
  Lock,
  Crown,
  RefreshCw,
  ExternalLink,
  Gift,
  Coins,
} from "lucide-react";
import {
  UserProfile,
  isPromoTrialActive,
  isPromoTrialExpired,
  connectDiscordToProfile,
  reset72HourPromoTrial,
  expirePromoTrialNow,
  saveUserProfile,
  ROLE_TIER_DETAILS,
} from "../rbac";

interface PromoLaunchBannerProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenRoleManager: () => void;
}

export const PromoLaunchBanner: React.FC<PromoLaunchBannerProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenRoleManager,
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [hoursLeft, setHoursLeft] = useState<number>(0);
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const [discordModalOpen, setDiscordModalOpen] = useState(false);
  const [discordTagInput, setDiscordTagInput] = useState("MatrixOperator#7777");
  const [simModalOpen, setSimModalOpen] = useState(false);

  const { promoSession, purchasedRole } = userProfile;
  const isTrialActive = isPromoTrialActive(promoSession);
  const isTrialExpired = isPromoTrialExpired(promoSession);
  const needsDiscord = promoSession?.isEarlyBird && !promoSession?.isDiscordVerified;

  // Real-time 1-second countdown ticker
  useEffect(() => {
    const updateTimer = () => {
      if (!promoSession?.promoTrialExpiresAt) {
        setTimeLeftStr("00h 00m 00s");
        return;
      }

      const expiresMs = new Date(promoSession.promoTrialExpiresAt).getTime();
      const nowMs = Date.now();
      const diffMs = expiresMs - nowMs;

      if (diffMs <= 0) {
        setTimeLeftStr("ABGELAUFEN (EXPIRED)");
        setHoursLeft(0);
        setMinutesLeft(0);
        setSecondsLeft(0);
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setHoursLeft(hrs);
      setMinutesLeft(mins);
      setSecondsLeft(secs);

      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      setTimeLeftStr(`${hrs}h ${pad(mins)}m ${pad(secs)}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [promoSession?.promoTrialExpiresAt]);

  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const handleConnectDiscord = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = discordTagInput.trim() || "DiscordMember";
    const updated = connectDiscordToProfile(userProfile, tag, 25000);
    onUpdateProfile(updated);
    setClaimedNotice("🎉 +25.000 FREE TOKENS ERHALTEN! 72h Sovereign Tier aktiviert.");
    setTimeout(() => {
      setClaimedNotice(null);
      setDiscordModalOpen(false);
    }, 1800);
  };

  const handleResetTrial = () => {
    const updated = reset72HourPromoTrial(userProfile, 72);
    onUpdateProfile(updated);
  };

  const handleExpireTrial = () => {
    const updated = expirePromoTrialNow(userProfile);
    onUpdateProfile(updated);
  };

  const handleToggleEarlyBird = () => {
    const updated: UserProfile = {
      ...userProfile,
      promoSession: {
        ...userProfile.promoSession,
        isEarlyBird: !userProfile.promoSession.isEarlyBird,
      },
    };
    saveUserProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <>
      {/* 1. ACTIVE 72-HOUR SOVEREIGN TRIAL HEADER BANNER */}
      {isTrialActive && (
        <div className="fixed top-0 left-0 right-0 h-11 z-50 bg-gradient-to-r from-purple-950/95 via-slate-950/98 to-cyan-950/95 border-b border-purple-500/50 px-4 flex items-center justify-between gap-3 text-xs font-mono shadow-[0_4px_25px_rgba(168,85,247,0.3)] backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider animate-pulse flex-shrink-0">
              <Crown className="w-3.5 h-3.5 text-purple-400" />
              SOVEREIGN LAUNCH ACCESS
            </span>

            <div className="hidden sm:flex items-center gap-2 text-slate-200 truncate">
              <span className="text-cyan-400 font-bold">
                REVO-STATUS ACTIVE
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 truncate">
                Alle 8 Matrix-Agenten freigeschaltet (SOVEREIGN Tier gratis)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Live Countdown Display */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-purple-400/50 text-amber-300 px-2.5 py-0.5 rounded-lg font-bold font-mono tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>{timeLeftStr}</span>
            </div>

            <button
              onClick={() => setSimModalOpen(true)}
              title="Promo Control & Simulation Center"
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 rounded hover:border-purple-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Sliders className="w-3 h-3 text-purple-400" />
              <span className="hidden md:inline">Simulator</span>
            </button>

            <button
              onClick={onOpenRoleManager}
              className="px-2.5 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded uppercase tracking-wider transition shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC Details
            </button>
          </div>
        </div>
      )}

      {/* 2. EXPIRED TRIAL CONVERSION BANNER */}
      {isTrialExpired && (
        <div className="fixed top-0 left-0 right-0 h-11 z-50 bg-gradient-to-r from-amber-950/95 via-red-950/98 to-slate-950 border-b border-amber-500/60 px-4 flex items-center justify-between gap-3 text-xs font-mono shadow-[0_4px_30px_rgba(245,158,11,0.35)] backdrop-blur-xl animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex items-center gap-2 truncate">
              <div className="font-display font-extrabold text-xs text-amber-300 tracking-wider uppercase flex items-center gap-2">
                3-TAGE SOVEREIGN TRIAL ABGELAUFEN!
                <span className="hidden md:inline-block text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded">
                  FALLBACK: {ROLE_TIER_DETAILS[purchasedRole]?.name || "LITE_ACCESS"}
                </span>
              </div>
              <p className="hidden lg:inline text-slate-300 text-[11px] truncate">
                • Sichere dir jetzt dauerhaften Matrix-Access & behalte alle 9 Agenten
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSimModalOpen(true)}
              className="px-2 py-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-bold uppercase transition cursor-pointer"
            >
              Simulator
            </button>

            <button
              onClick={onOpenRoleManager}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-lg uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer flex items-center gap-1.5 text-xs hover:scale-105 active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5" />
              MATRIX-ACCESS SICHERN (SOVEREIGN)
            </button>
          </div>
        </div>
      )}

      {/* 3. EARLY BIRD UNVERIFIED DISCORD PROMO CALLOUT BANNER */}
      {needsDiscord && (
        <div className="fixed top-0 left-0 right-0 h-11 z-50 bg-gradient-to-r from-amber-950/95 via-indigo-950/98 to-purple-950/95 border-b border-amber-500/50 px-4 flex items-center justify-between gap-3 text-xs font-mono shadow-[0_4px_25px_rgba(245,158,11,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
              <Gift className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 truncate">
              <div className="font-display font-bold text-xs text-amber-300 tracking-wide uppercase flex items-center gap-2">
                🎁 REWARDS: DISCORD VERKNÜPFEN
                <span className="hidden sm:inline-block text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  +25.000 FREE TOKENS
                </span>
                <span className="hidden md:inline-block text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono">
                  72h SOVEREIGN FREE
                </span>
              </div>
              <p className="hidden lg:inline text-slate-300 text-[11px] truncate">
                • Verknüpfe deinen Discord-Account und erhalte sofort 25.000 Bonus-Tokens gutgeschrieben!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="https://discord.gg/4D6mb4xbVr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-[#5865F2]/30 hover:bg-[#5865F2]/50 text-indigo-200 hover:text-white border border-[#5865F2]/60 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(88,101,242,0.3)]"
              title="SYNTAX Discord Server beitreten"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discord Server</span>
            </a>
            <button
              onClick={() => setDiscordModalOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-lg uppercase tracking-wider transition shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              +25.000 TOKENS SICHERN
            </button>
          </div>
        </div>
      )}

      {/* DISCORD VERIFICATION MODAL */}
      {discordModalOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in font-mono">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border-2 border-indigo-500/50 shadow-[0_0_60px_rgba(99,102,241,0.4)] relative overflow-hidden bg-slate-900/95">
            <button
              onClick={() => setDiscordModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {claimedNotice ? (
              <div className="py-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-extrabold text-xl text-white tracking-wide">
                  ERFOLGREICH VERKNÜPFT! 🎉
                </h3>
                <p className="text-sm text-emerald-300 font-bold max-w-xs mx-auto">
                  {claimedNotice}
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  +25.000 Bonus-Tokens sofort im Konto aktiv
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">
                      Discord Account Verknüpfen 🎁
                    </h3>
                    <p className="text-xs text-indigo-300 font-bold">
                      S.Y.N.T.A.X. Launch Airdrop & Free Tokens
                    </p>
                  </div>
                </div>

                {/* Reward Highlights */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-center">
                    <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> REWARD DROP
                    </div>
                    <div className="text-base font-black text-amber-300 mt-0.5">
                      +25.000 Tokens
                    </div>
                    <div className="text-[9px] text-slate-400">Direkt gutgeschrieben</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col justify-center">
                    <div className="text-[10px] text-purple-400 uppercase font-bold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" /> TIER CLEARANCE
                    </div>
                    <div className="text-base font-black text-purple-300 mt-0.5">
                      72h Sovereign
                    </div>
                    <div className="text-[9px] text-slate-400">Alle 9 Agenten freigeschaltet</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Trage deinen Discord-Benutzernamen ein, um deinen Server-Status zu verknüpfen. Du erhältst sofort <strong>25.000 Free AI-Tokens</strong> und 72 Stunden vollen Zugriff auf das SOVEREIGN Tier.
                </p>

                <form onSubmit={handleConnectDiscord} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-bold">
                      DEIN DISCORD USERNAME ODER TAG:
                    </label>
                    <input
                      type="text"
                      value={discordTagInput}
                      onChange={(e) => setDiscordTagInput(e.target.value)}
                      placeholder="z.B. commander_neo oder matrix#1337"
                      className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2.5 text-sm text-cyan-300 focus:outline-none focus:border-indigo-400 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Early Bird Status: AKTIV
                    </div>
                    <div className="text-slate-300">
                      • +25.000 Bonus-Tokens werden direkt deinem Daily Quota Store addiert.
                    </div>
                    <div className="text-slate-300">
                      • Du kannst deinen Tag eintragen oder direkt mit Standard-Handle freischalten.
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.5)] transition cursor-pointer flex items-center justify-center gap-2 text-xs active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      VERKNÜPFEN & +25.000 TOKENS CLAIMEN 🎁
                    </button>
                    
                    <a
                      href="https://discord.gg/4D6mb4xbVr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-indigo-200 hover:text-white font-mono text-[11px] rounded-lg transition text-center flex items-center justify-center gap-1.5 border border-[#5865F2]/50 shadow-[0_0_15px_rgba(88,101,242,0.25)]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
                      SYNTAX Discord Server beitreten (discord.gg/4D6mb4xbVr)
                    </a>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* PROMO TESTING & CONTROL SIMULATOR MODAL */}
      {simModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative overflow-hidden">
            <button
              onClick={() => setSimModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-purple-500/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  ⚡ PROMO LAUNCH SIMULATOR
                  <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
                    DEBUG / DEMO
                  </span>
                </h3>
                <p className="font-mono text-xs text-purple-300">
                  Test- und Steuerungs-Panel für die 3-Tage Big Launch Promotion
                </p>
              </div>
            </div>

            {/* Current State Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 mb-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">EARLY BIRD BERECHTIGUNG:</span>
                <span
                  className={
                    promoSession.isEarlyBird
                      ? "text-emerald-400 font-bold"
                      : "text-red-400 font-bold"
                  }
                >
                  {promoSession.isEarlyBird ? "✅ JA (Early Pioneer)" : "❌ NEIN"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">DISCORD STATUS:</span>
                <span
                  className={
                    promoSession.isDiscordVerified
                      ? "text-emerald-400 font-bold"
                      : "text-amber-400 font-bold"
                  }
                >
                  {promoSession.isDiscordVerified && promoSession.discordUsername
                    ? `✅ VERKNÜPFT (${promoSession.discordUsername})`
                    : "❌ NICHT VERKNÜPFT"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">72h TRIAL STATUS:</span>
                <span
                  className={
                    isTrialActive
                      ? "text-purple-300 font-bold"
                      : isTrialExpired
                      ? "text-amber-400 font-bold"
                      : "text-slate-500"
                  }
                >
                  {isTrialActive
                    ? `🚀 AKTIV (${timeLeftStr})`
                    : isTrialExpired
                    ? "⚠️ ABGELAUFEN (EXPIRED)"
                    : "NICHT GESTARTET"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">REGULÄRE KAUF-ROLLE:</span>
                <span className="text-cyan-300 font-bold">
                  {purchasedRole} ($
                  {ROLE_TIER_DETAILS[purchasedRole]?.price})
                </span>
              </div>
            </div>

            {/* Simulator Action Buttons */}
            <div className="space-y-2 font-mono text-xs">
              <button
                onClick={handleResetTrial}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 rounded-xl font-bold flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  72-Stunden Trial Timer Zurücksetzen
                </span>
                <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">
                  +72h ab jetzt
                </span>
              </button>

              <button
                onClick={handleExpireTrial}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-xl font-bold flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Trial Sofort Beenden (Simuliere Ablauf)
                </span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                  Expiring Now
                </span>
              </button>

              <button
                onClick={handleToggleEarlyBird}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Early Bird Status Umschalten
                </span>
                <span className="text-[10px] text-cyan-300">
                  {promoSession.isEarlyBird ? "Als Normaler User setzen" : "Als Early Bird setzen"}
                </span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-500/20 flex justify-end">
              <button
                onClick={() => setSimModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg font-mono text-xs"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
