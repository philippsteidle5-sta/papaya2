import React from "react";
import { Lock, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { UserRole, getMinRequiredRoleForAgent, ROLE_TIER_DETAILS } from "../rbac";

interface LockedAgentCardOverlayProps {
  agentName: string;
  agentId: string;
  currentRole: UserRole;
  onOpenRoleManager?: () => void;
  compact?: boolean;
}

export const LockedAgentCardOverlay: React.FC<LockedAgentCardOverlayProps> = ({
  agentName,
  agentId,
  currentRole,
  onOpenRoleManager,
  compact = false,
}) => {
  const minRequiredRole = getMinRequiredRoleForAgent(agentId);
  const targetTierMeta = ROLE_TIER_DETAILS[minRequiredRole];

  if (compact) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-lg p-2 text-center border border-red-500/40 animate-fade-in">
        <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 mb-1">
          <Lock className="w-3.5 h-3.5" />
        </div>
        <span className="font-mono text-[9px] font-bold text-red-300 tracking-wider uppercase mb-0.5">
          {targetTierMeta.name}
        </span>
        <span className="font-mono text-[8px] text-slate-400 mb-1.5">
          Benötigt {targetTierMeta.price}
        </span>
        {onOpenRoleManager && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenRoleManager();
            }}
            className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 rounded text-amber-300 font-mono text-[8px] font-bold uppercase transition cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5" /> Upgrade
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-xl p-6 text-center border border-red-500/30 shadow-[inset_0_0_30px_rgba(239,68,68,0.15)] animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 mb-3 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
        <Lock className="w-6 h-6" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 font-mono text-[10px] tracking-wider uppercase mb-2">
        <ShieldAlert className="w-3 h-3 text-red-400" />
        SPERRE // ZUGRIFF BESCHRÄNKT
      </div>

      <h4 className="font-display font-bold text-sm text-slate-100 mb-1 tracking-wide">
        {agentName} ist gesperrt
      </h4>

      <p className="font-mono text-[11px] text-slate-400 max-w-[240px] leading-relaxed mb-4">
        Dein aktueller Tarif (<span className="text-cyan-400 font-bold">{currentRole}</span>) enthält keinen Zugriff auf diesen Quant/Compute-Agenten.
      </p>

      <div className="bg-slate-900/90 border border-amber-500/30 rounded-lg p-2.5 mb-4 w-full max-w-[240px]">
        <div className="font-mono text-[9px] text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-between">
          <span>ERFORDERLICHE ROLLE:</span>
          <span className="font-bold">{targetTierMeta.price}</span>
        </div>
        <div className="font-mono text-[11px] font-bold text-amber-200">
          {targetTierMeta.name}
        </div>
      </div>

      {onOpenRoleManager && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenRoleManager();
          }}
          className="w-full max-w-[240px] py-2 px-3 bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 border border-amber-400/50 rounded-lg text-amber-300 font-mono text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Rolle Manuell Ändern
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
