import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  Share2,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { SocialPlatform, SocialPost } from "./types";

interface SocialCalendarViewProps {
  posts: SocialPost[];
  onSelectPost: (post: SocialPost) => void;
  onNewPostAtTime?: (dateIso: string) => void;
  onDeletePost: (postId: string) => void;
}

export const SocialCalendarView: React.FC<SocialCalendarViewProps> = ({
  posts,
  onSelectPost,
  onNewPostAtTime,
  onDeletePost,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | "all">("all");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Generate 7 days for current week view
  const getDaysOfWeek = (offsetWeeks: number) => {
    const today = new Date();
    // Monday as first day of week
    const currentDay = today.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + offsetWeeks * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysOfWeek(currentWeekOffset);

  const getPostsForDay = (date: Date) => {
    const dayStr = date.toISOString().split("T")[0];
    return posts.filter((p) => {
      if (selectedPlatform !== "all" && p.platform !== selectedPlatform) return false;
      if (p.scheduledFor) {
        return p.scheduledFor.startsWith(dayStr);
      }
      // If published today or recently
      return false;
    });
  };

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const platformBadge = (platform: SocialPlatform) => {
    switch (platform) {
      case "tiktok":
        return <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[9px] font-bold">🎵 TikTok</span>;
      case "instagram":
        return <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">📸 IG Reel</span>;
      case "youtube":
        return <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-bold">▶️ Shorts</span>;
      case "x":
        return <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">𝕏 Post</span>;
      case "linkedin":
        return <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">💼 In</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-200 p-4 space-y-4 overflow-y-auto custom-scrollbar font-sans">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Content Kalender & Algorithmus Slots
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automatische Taktung & geplante Postings synchronisiert über alle Plattformen
          </p>
        </div>

        {/* Platform Selector Filter */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedPlatform === "all" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Alle Plattformen
          </button>
          <button
            onClick={() => setSelectedPlatform("tiktok")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedPlatform === "tiktok" ? "bg-pink-500/20 text-pink-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setSelectedPlatform("instagram")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedPlatform === "instagram" ? "bg-purple-500/20 text-purple-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => setSelectedPlatform("youtube")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedPlatform === "youtube" ? "bg-red-500/20 text-red-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Shorts
          </button>
          <button
            onClick={() => setSelectedPlatform("x")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              selectedPlatform === "x" ? "bg-blue-500/20 text-blue-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            𝕏
          </button>
        </div>
      </div>

      {/* Week Navigator & Peak Time Recommendation Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-center">
        {/* Week Switcher */}
        <div className="flex items-center justify-between bg-zinc-900/70 border border-zinc-800 rounded-xl px-3 py-2 text-xs">
          <button
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-zinc-200 font-mono">
            {days[0].toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} –{" "}
            {days[6].toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <button
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Peak Hours Callout */}
        <div className="lg:col-span-2 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-amber-300 text-xs">G.L.O.B.E. Peak FYP Zeitfenster: 18:30 – 21:00 Uhr</span>
              <p className="text-[10.5px] text-zinc-400">
                Höchste organische Swipe-Rate & virale Verweildauer für Tech, Coding & AI Content.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase whitespace-nowrap">
            +180% FYP Boost
          </span>
        </div>
      </div>

      {/* 7-Day Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 flex-1 min-h-[360px]">
        {days.map((date, idx) => {
          const isToday = new Date().toDateString() === date.toDateString();
          const dayPosts = getPostsForDay(date);
          const dateStr = date.toISOString().split("T")[0];

          return (
            <div
              key={idx}
              className={`rounded-2xl border flex flex-col justify-between p-2.5 transition min-h-[220px] ${
                isToday
                  ? "bg-zinc-900/90 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                  : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">{dayNames[idx]}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {date.getDate()}.
                  </span>
                </div>
                {isToday && (
                  <span className="px-1.5 py-0.5 rounded bg-pink-500 text-white font-bold text-[9px] uppercase tracking-wider">
                    Heute
                  </span>
                )}
              </div>

              {/* Day Content / Post Slots */}
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {dayPosts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-2 text-zinc-600 space-y-1 my-4">
                    <Clock className="w-5 h-5 opacity-40" />
                    <span className="text-[10px]">Keine Posts</span>
                  </div>
                ) : (
                  dayPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="group relative bg-zinc-950/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-pink-500/50 rounded-xl p-2 cursor-pointer transition space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1">
                        {platformBadge(post.platform)}
                        <span className="text-[9px] font-mono text-zinc-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "18:30"}
                        </span>
                      </div>

                      <div className="flex gap-1.5 items-center">
                        <img
                          src={post.thumbnailUrl}
                          alt="Thumb"
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-zinc-700"
                        />
                        <p className="text-[10px] font-medium text-zinc-200 line-clamp-2 leading-tight">
                          {post.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[9px] text-zinc-400">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          Score {post.viralityScore}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePost(post.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                          title="Löschen"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Post Slot Button */}
              <button
                type="button"
                onClick={() => onNewPostAtTime && onNewPostAtTime(`${dateStr}T18:45`)}
                className="w-full mt-2 py-1 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white text-[10.5px] font-medium flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Planen</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
