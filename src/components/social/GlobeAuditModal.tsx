import React from "react";
import {
  Globe,
  X,
  Flame,
  Clock,
  Hash,
  Music2,
  Sparkles,
  TrendingUp,
  Share2,
  Eye,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { SocialPost } from "./types";

interface GlobeAuditModalProps {
  post: SocialPost | null;
  onClose: () => void;
  onRePost?: (post: SocialPost) => void;
}

export const GlobeAuditModal: React.FC<GlobeAuditModalProps> = ({
  post,
  onClose,
  onRePost,
}) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-zinc-950 border border-cyan-500/50 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-zinc-900 to-zinc-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Globe className="w-5 h-5 animate-spin [animation-duration:8s]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                G.L.O.B.E. Neural Video Audit
              </h3>
              <p className="text-[10px] text-cyan-400 font-mono">
                Tiefenanalyse für: {post.title}
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh] custom-scrollbar">
          
          {/* Virality Score Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">
                Algorithmus Virality Index
              </span>
              <div className="text-3xl font-black text-amber-400 flex items-center gap-1.5 tracking-tight font-mono">
                <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
                <span>{post.viralityScore}</span>
                <span className="text-xs text-zinc-500 font-normal">/ 100</span>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">
                Hook-Score
              </span>
              <span className="text-sm font-bold text-cyan-300 font-mono">
                {post.globeAudit.hookScore}
              </span>
              <span className="text-[10px] text-emerald-400 block font-medium">
                {post.globeAudit.estimatedFypReach}
              </span>
            </div>
          </div>

          {/* Detailed Audit Criteria */}
          <div className="space-y-2.5">
            
            {/* Retention Note */}
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Zuschauer-Retention & Hook-Dynamik
              </span>
              <p className="text-zinc-300 text-xs leading-relaxed pl-5">
                {post.globeAudit.retentionNote}
              </p>
            </div>

            {/* Hashtag Impact */}
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-pink-400" />
                Hashtag & Keyword Cluster
              </span>
              <p className="text-zinc-300 text-xs leading-relaxed pl-5">
                {post.globeAudit.hashtagImpact}
              </p>
            </div>

            {/* Audio Momentum */}
            <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5 text-purple-400" />
                Soundtrack & Audio Momentum
              </span>
              <p className="text-zinc-300 text-xs leading-relaxed pl-5">
                {post.globeAudit.audioMomentum}
              </p>
            </div>

            {/* G.L.O.B.E. Master Recommendation */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-zinc-900 border border-cyan-500/40 space-y-1.5">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                G.L.O.B.E. Handlungs-Empfehlung
              </span>
              <p className="text-zinc-200 text-xs leading-relaxed pl-5 font-medium">
                {post.globeAudit.viralAdvice}
              </p>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-[10px] text-zinc-500 font-mono">
            ID: {post.id} · {post.platform.toUpperCase()}
          </span>

          <div className="flex items-center gap-2">
            {onRePost && (
              <button
                type="button"
                onClick={() => {
                  onRePost(post);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>In Studio öffnen</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition"
            >
              Schließen
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
