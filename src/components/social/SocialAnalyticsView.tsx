import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Flame,
  Globe,
  Award,
  Sparkles,
  Zap,
  ArrowUpRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { SocialPlatform, SocialPost } from "./types";

interface SocialAnalyticsViewProps {
  posts: SocialPost[];
  onOpenAudit: (post: SocialPost) => void;
}

export const SocialAnalyticsView: React.FC<SocialAnalyticsViewProps> = ({
  posts,
  onOpenAudit,
}) => {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | "all">("all");

  const filteredPosts = posts.filter(
    (p) => activePlatform === "all" || p.platform === activePlatform
  );

  const totalViews = filteredPosts.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = filteredPosts.reduce((acc, p) => acc + p.likes, 0);
  const totalComments = filteredPosts.reduce((acc, p) => acc + p.comments, 0);
  const totalShares = filteredPosts.reduce((acc, p) => acc + p.shares, 0);
  const avgWatchTime = filteredPosts.length
    ? (filteredPosts.reduce((acc, p) => acc + p.watchTimePercent, 0) / filteredPosts.length).toFixed(1)
    : "84.5";

  // Mock points for SVG Retention Graph (Seconds 0s to 60s)
  // Hook zone: 100% -> 92% -> 86% -> 82% -> 79% -> 76% -> 74%
  const retentionPoints = [
    { sec: "0s", pct: 100 },
    { sec: "3s", pct: 91 },
    { sec: "10s", pct: 85 },
    { sec: "20s", pct: 81 },
    { sec: "30s", pct: 78 },
    { sec: "45s", pct: 75 },
    { sec: "60s", pct: 72 },
  ];

  const sortedLeaderboard = [...filteredPosts].sort((a, b) => b.views - a.views);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-200 p-4 space-y-4 overflow-y-auto custom-scrollbar font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Algorithmus & Virality Analytics
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            G.L.O.B.E. Deep Search Tracking, Retention-Kurven & Plattform-Performance
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActivePlatform("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activePlatform === "all" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setActivePlatform("tiktok")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activePlatform === "tiktok" ? "bg-pink-500/20 text-pink-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setActivePlatform("instagram")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activePlatform === "instagram" ? "bg-purple-500/20 text-purple-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => setActivePlatform("x")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activePlatform === "x" ? "bg-blue-500/20 text-blue-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            𝕏
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1 */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium uppercase text-[10px] tracking-wider">Gesamtaufrufe</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+34.2% diese Woche</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium uppercase text-[10px] tracking-wider">Interaktionen (Likes & Comments)</span>
            <div className="w-6 h-6 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {(totalLikes + totalComments).toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-pink-400 font-medium">
            <Award className="w-3 h-3" />
            <span>16.8% Engagement Rate</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium uppercase text-[10px] tracking-wider">Ø Verweildauer (Watch-Time)</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {avgWatchTime}%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-400 font-medium">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Starke FYP-Empfehlungsrate</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium uppercase text-[10px] tracking-wider">G.L.O.B.E. Virality Index</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            92.4 / 100
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <span>Tier 1 Algorithmus Bucket</span>
          </div>
        </div>

      </div>

      {/* Retention Curve Chart & G.L.O.B.E. Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Retention SVG Graph */}
        <div className="lg:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">
                Zuschauer-Retention & Drop-Off Kurve
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              Hook Retention: 91.2% (Top 5% der Nische)
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Visuelle Analyse der ersten 60 Sekunden. Videos, die Sekunde 3 mit &gt;80% überstehen, erhalten 4x mehr organische Ausspielung.
          </p>

          {/* SVG Graph */}
          <div className="relative w-full h-44 pt-2">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#3f3f46" />

              {/* Y Axis Labels */}
              <text x="10" y="24" fill="#71717a" fontSize="9" fontFamily="monospace">100%</text>
              <text x="14" y="64" fill="#71717a" fontSize="9" fontFamily="monospace">80%</text>
              <text x="14" y="104" fill="#71717a" fontSize="9" fontFamily="monospace">60%</text>

              {/* Hook Zone Highlight Box (0s - 3s) */}
              <rect x="40" y="20" width="80" height="120" fill="#ec4899" fillOpacity="0.06" rx="4" />
              <text x="46" y="34" fill="#f472b6" fontSize="8" fontWeight="bold" fontFamily="monospace">HOOK ZONE (0-3s)</text>

              {/* 70% Viral Trigger Threshold */}
              <line x1="40" y1="80" x2="480" y2="80" stroke="#eab308" strokeOpacity="0.6" strokeDasharray="4 4" />
              <text x="350" y="75" fill="#facc15" fontSize="8" fontFamily="monospace">FYP BOOST SCHWELLE (70%)</text>

              {/* Curve Area Fill */}
              <path
                d="M 40,20 Q 80,35 120,44 T 200,56 T 300,68 T 400,74 T 480,82 L 480,140 L 40,140 Z"
                fill="url(#curveGradient)"
              />

              {/* Curve Stroke */}
              <path
                d="M 40,20 Q 80,35 120,44 T 200,56 T 300,68 T 400,74 T 480,82"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />

              {/* Key Data Nodes */}
              <circle cx="40" cy="20" r="4" fill="#06b6d4" stroke="#083344" strokeWidth="2" />
              <circle cx="120" cy="44" r="4" fill="#ec4899" stroke="#500724" strokeWidth="2" />
              <circle cx="300" cy="68" r="4" fill="#06b6d4" stroke="#083344" strokeWidth="2" />
              <circle cx="480" cy="82" r="4" fill="#06b6d4" stroke="#083344" strokeWidth="2" />

              {/* X Axis Labels */}
              <text x="40" y="154" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">0s</text>
              <text x="120" y="154" fill="#f472b6" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">3s (Hook)</text>
              <text x="200" y="154" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">15s</text>
              <text x="300" y="154" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">30s</text>
              <text x="400" y="154" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">45s</text>
              <text x="480" y="154" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">60s</text>
            </svg>
          </div>
        </div>

        {/* G.L.O.B.E. Algorithm Intel Card */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Globe className="w-4 h-4 animate-spin [animation-duration:8s]" />
              <h3 className="font-bold text-sm text-white">
                G.L.O.B.E. Algorithmus Audit
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Echtzeit-Empfehlungen zur Reichweiten-Maximierung auf Basis von über 12.000 analysierten Tech-Shorts:
            </p>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Text-Hook in ersten 1.5s
                </span>
                <p className="text-zinc-400 text-[10.5px]">
                  Fettgedruckte dynamische Untertitel erhöhen die Stopp-Rate um +38%.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1">
                <span className="font-bold text-pink-400 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  Trending Tech Audio
                </span>
                <p className="text-zinc-400 text-[10.5px]">
                  Verwende den Quantum Beats Sound als leisen Hintergrundtrack (12% Volume).
                </p>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono flex items-center justify-between">
            <span>Algorithmus Status:</span>
            <span className="font-bold">OPTIMIERT</span>
          </div>
        </div>

      </div>

      {/* Top Posts Leaderboard */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top-Performing Content Leaderboard
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {sortedLeaderboard.length} Beiträge erfasst
          </span>
        </div>

        <div className="space-y-2">
          {sortedLeaderboard.map((post, rank) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 ${
                  rank === 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                  rank === 1 ? "bg-zinc-700 text-zinc-200" :
                  "bg-zinc-900 text-zinc-400"
                }`}>
                  #{rank + 1}
                </span>

                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                />

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate max-w-sm">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span className="capitalize">{post.platform}</span>
                    <span>·</span>
                    <span>{post.postedAt || "Vor kurzem"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono flex-shrink-0">
                <div className="text-right">
                  <span className="text-white font-bold block">{post.views.toLocaleString()}</span>
                  <span className="text-[9.5px] text-zinc-500">AUFRUFE</span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-pink-400 font-bold block">{post.likes.toLocaleString()}</span>
                  <span className="text-[9.5px] text-zinc-500">LIKES</span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-emerald-400 font-bold block">{post.viralityScore}</span>
                  <span className="text-[9.5px] text-zinc-500">SCORE</span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAudit(post)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10.5px] font-medium transition"
                >
                  G.L.O.B.E. Audit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
