import React, { useState, useEffect } from "react";
import { X, ShieldCheck, CheckCircle2, Lock, Sparkles, AlertCircle, Crown, Terminal, Check, Award, Gift, Clock, MessageSquare, Zap } from "lucide-react";
import { UserRole, ROLE_TIER_DETAILS, AGENT_IDS, AgentID, isAgentAllowed, UserProfile, isPromoTrialActive, isPromoTrialExpired } from "../rbac";
import { AgentConfig, Message } from "../types";

interface RoleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  agents?: AgentConfig[];
  agentChats?: Record<string, Message[]>;
  onOpenFullRewardProgram?: () => void;
  userProfile?: UserProfile;
}

export const RoleManagerModal: React.FC<RoleManagerModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  agents = [],
  agentChats = {},
  onOpenFullRewardProgram,
  userProfile,
}) => {
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("jarvis_maze_reward_claimed_v1") === "true";
    } catch {
      return false;
    }
  });

  if (!isOpen) return null;

  const roles: UserRole[] = ["LITE_ACCESS", "OPERATOR", "SOVEREIGN"];

  // Promo Session status checks
  const isTrialActive = userProfile ? isPromoTrialActive(userProfile.promoSession) : false;
  const isTrialExpired = userProfile ? isPromoTrialExpired(userProfile.promoSession) : false;
  const promoSession = userProfile?.promoSession;

  // Calculate actual dynamic progress metrics
  const distinctAgentsCount = Object.keys(agentChats).filter(
    (agentId) => agentChats[agentId] && agentChats[agentId].length > 0
  ).length;

  const totalMessagesCount = (Object.values(agentChats) as Message[][]).reduce(
    (acc: number, msgs: Message[]) => acc + (Array.isArray(msgs) ? msgs.length : 0),
    0
  );

  const tacticalMessagesCount = ["jarvis", "oracle", "vega"].reduce(
    (acc, id) => acc + (agentChats[id] ? agentChats[id].length : 0),
    0
  );

  const allowedAgentsCount = ROLE_TIER_DETAILS[currentRole].allowedAgents.length;

  // Quest requirements logic
  const quest1Completed = distinctAgentsCount >= 3;
  const quest2Completed = totalMessagesCount >= 20;
  const quest3Completed = tacticalMessagesCount >= 5;
  const quest4Completed = allowedAgentsCount >= 7;

  const completedQuestsCount = [
    quest1Completed,
    quest2Completed,
    quest3Completed,
    quest4Completed,
  ].filter(Boolean).length;

  const isRewardUnlocked = completedQuestsCount === 4;

  const handleClaimReward = () => {
    if (!isRewardUnlocked) return;
    setRewardClaimed(true);
    try {
      localStorage.setItem("jarvis_maze_reward_claimed_v1", "true");
    } catch (e) {
      console.warn("Could not save reward status", e);
    }
  };

  // Agent display names mapping
  const agentLabels: Record<AgentID, { name: string; tag: string }> = {
    syntax: { name: "S.Y.N.T.A.X.", tag: "Matrix Core" },
    maze: { name: "S.Y.N.T.A.X.", tag: "Matrix Core" },
    neo: { name: "N.E.O.", tag: "Digital Brother" },
    vega: { name: "V.E.G.A.", tag: "Tactical Co-Processor" },
    chronos: { name: "C.H.R.O.N.O.S.", tag: "Temporal Matrix" },
    odin: { name: "O.D.I.N.", tag: "Strategic Decision" },
    pulse: { name: "P.U.L.S.E.", tag: "Viral Network" },
    jarvis: { name: "J.A.R.V.I.S.", tag: "Master Core" },
    oracle: { name: "O.R.A.C.L.E.", tag: "Financial Analytics" },
    globe: { name: "G.L.O.B.E.", tag: "Deep Search Fusion" },
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-4xl rounded-xl p-6 relative overflow-hidden border border-cyan-500/30 max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2 tracking-wide">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              S.Y.N.T.A.X. RBAC // ROLLEN- & ZUGRIFFSMANAGER
            </h3>
            <p className="font-mono text-xs text-slate-400 mt-0.5">
              Verwalte die Access-Tiers & verteile die 9 System-Agenten manuell für Tests oder Admin-Zuweisung.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Middle Container for Laptop/Screen responsiveness */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-4">
          {/* Big Launch Promo Status Card */}
          {promoSession && (
            <div className="p-3 rounded-lg border bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] font-mono text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="font-bold text-slate-200">PROMO LAUNCH STATUS:</span>
                {isTrialActive ? (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold">
                    🚀 72h SOVEREIGN FREE TRIAL AKTIV
                  </span>
                ) : isTrialExpired ? (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                    ⚠️ 3-TAGE TRIAL ABGELAUFEN (FALLBACK AKTIV)
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    STANDARD REGISTRIERUNG
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Early Bird: <strong className={promoSession.isEarlyBird ? "text-emerald-400" : "text-slate-500"}>{promoSession.isEarlyBird ? "JA" : "NEIN"}</strong></span>
                <span>•</span>
                <span>Discord: <strong className={promoSession.isDiscordVerified && promoSession.discordUsername ? "text-emerald-400" : "text-red-400"}>{promoSession.isDiscordVerified && promoSession.discordUsername ? `VERKNÜPFT (${promoSession.discordUsername})` : "NICHT VERKNÜPFT"}</strong></span>
              </div>
            </div>
          )}

          {/* Current Active Role Indicator */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs text-slate-300">EFFEKTIV AKTIVE BENUTZER-ROLLE:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${ROLE_TIER_DETAILS[currentRole].badgeColor}`}>
                {ROLE_TIER_DETAILS[currentRole].name} ({ROLE_TIER_DETAILS[currentRole].price})
              </span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400">
              {ROLE_TIER_DETAILS[currentRole].allowedAgents.length} von 9 Agenten freigeschaltet
            </span>
          </div>

          {/* 3 Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => {
            const meta = ROLE_TIER_DETAILS[r];
            const isSelected = currentRole === r;

            return (
              <div
                key={r}
                className={`relative rounded-xl p-5 transition-all flex flex-col justify-between border ${
                  isSelected
                    ? "bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40"
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 px-3 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-widest uppercase shadow-sm flex items-center gap-1">
                    <Check className="w-3 h-3" /> AKTIVE ROLLE
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-slate-400 tracking-wider uppercase font-bold">
                      {meta.role}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {meta.price}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-slate-100 mb-2">
                    {meta.name}
                  </h4>

                  <p className="font-mono text-[11px] text-slate-400 leading-relaxed mb-4 min-h-[36px]">
                    {meta.description}
                  </p>

                  {/* Agents Access List */}
                  <div className="border-t border-slate-800 pt-3 mb-4">
                    <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>AGENTEN FREIGABE:</span>
                      <span className="text-cyan-400 font-bold">{meta.allowedAgents.length}/9</span>
                    </div>

                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {AGENT_IDS.map((agentId) => {
                        const allowed = isAgentAllowed(r, agentId);
                        const label = agentLabels[agentId] || { name: agentId, tag: "" };

                        return (
                          <div
                            key={agentId}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition ${
                              allowed
                                ? "bg-emerald-950/30 border border-emerald-500/20 text-emerald-300"
                                : "bg-red-950/20 border border-red-500/10 text-slate-600 line-through opacity-60"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {allowed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Lock className="w-3 h-3 text-red-400/70 flex-shrink-0" />
                              )}
                              <span className="font-bold">{label.name}</span>
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase">{label.tag}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectRole(r)}
                  disabled={isSelected}
                  className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default"
                      : "bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/40 text-amber-300 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Rolle Aktiviert
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Manuell Zuweisen ({meta.price})
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* M.A.Z.E. REWARD PROGRAM MODULE */}
        <div className="my-3 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950/15 to-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <h4 className="font-display font-extrabold text-sm text-amber-300 tracking-wide uppercase flex items-center gap-2">
                  🏆 S.Y.N.T.A.X. REWARD PROGRAM
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                    1 MONAT ABO KOSTENLOS
                  </span>
                </h4>
                <p className="font-mono text-[11px] text-slate-400">
                  Erfülle alle 4 Matrix-Quests durch echte Interaktionen, um <strong>1 Monat deines aktuellen Abos gratis</strong> freizuschalten!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="font-mono text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg font-bold self-start sm:self-auto">
                {completedQuestsCount}/4 Quests erfüllt
              </div>

              {onOpenFullRewardProgram && (
                <button
                  onClick={onOpenFullRewardProgram}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold uppercase transition shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  🏆 Alle 40 Challenges Öffnen
                </button>
              )}
            </div>
          </div>

          {/* 4 Dynamic Quests Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 my-3 font-mono text-xs">
            {/* Quest 1 */}
            <div className={`p-2.5 rounded-lg border transition ${quest1Completed ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-slate-900/80 border-slate-800 text-slate-400"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  {quest1Completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  1. Matrix Pioneer
                </span>
                <span className="text-[9px] font-bold">{quest1Completed ? "ERFÜLLT" : `${distinctAgentsCount}/3`}</span>
              </div>
              <p className="text-[10px] text-slate-400">Mind. 3 Agenten nutzen</p>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${Math.min(100, (distinctAgentsCount / 3) * 100)}%` }} />
              </div>
            </div>

            {/* Quest 2 */}
            <div className={`p-2.5 rounded-lg border transition ${quest2Completed ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-slate-900/80 border-slate-800 text-slate-400"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  {quest2Completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  2. Token Compute
                </span>
                <span className="text-[9px] font-bold">{quest2Completed ? "ERFÜLLT" : `${totalMessagesCount}/20`}</span>
              </div>
              <p className="text-[10px] text-slate-400">20+ Nachrichten senden</p>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                <div className="bg-purple-400 h-full transition-all duration-300" style={{ width: `${Math.min(100, (totalMessagesCount / 20) * 100)}%` }} />
              </div>
            </div>

            {/* Quest 3 */}
            <div className={`p-2.5 rounded-lg border transition ${quest3Completed ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-slate-900/80 border-slate-800 text-slate-400"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  {quest3Completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  3. Tactical Strategist
                </span>
                <span className="text-[9px] font-bold">{quest3Completed ? "ERFÜLLT" : `${tacticalMessagesCount}/5`}</span>
              </div>
              <p className="text-[10px] text-slate-400">5 Prompts an Tactical-Agenten</p>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${Math.min(100, (tacticalMessagesCount / 5) * 100)}%` }} />
              </div>
            </div>

            {/* Quest 4 */}
            <div className={`p-2.5 rounded-lg border transition ${quest4Completed ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-slate-900/80 border-slate-800 text-slate-400"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  {quest4Completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  4. Matrix Tier Upgrade
                </span>
                <span className="text-[9px] font-bold">{quest4Completed ? "ERFÜLLT" : `${allowedAgentsCount}/7`}</span>
              </div>
              <p className="text-[10px] text-slate-400">Operator/Sovereign Tier</p>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${Math.min(100, (allowedAgentsCount / 7) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Reward Action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-amber-500/20">
            <div className="font-mono text-[11px] text-slate-300">
              Prämie für deinen aktuellen Tarif: <strong className="text-amber-300 font-bold">{ROLE_TIER_DETAILS[currentRole].name} ({ROLE_TIER_DETAILS[currentRole].price})</strong>
            </div>

            {rewardClaimed ? (
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-default"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                1 MONAT GRATIS AKTIVIERT! 🎉
              </button>
            ) : isRewardUnlocked ? (
              <button
                onClick={handleClaimReward}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 animate-pulse"
              >
                <Gift className="w-4 h-4" />
                1 MONAT ABO KOSTENLOS EINLÖSEN 🚀
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-slate-900 border border-amber-500/20 text-slate-500 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                SPERRE ({completedQuestsCount}/4 Quests Erfüllt)
              </button>
            )}
          </div>
        </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            RBAC Helper-Funktion <code className="text-cyan-300 bg-cyan-950/80 px-1 py-0.5 rounded">isAgentAllowed(role, agent)</code> aktiv.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-xs transition cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
