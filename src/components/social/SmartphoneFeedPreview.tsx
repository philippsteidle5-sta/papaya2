import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  MoreVertical,
  Repeat,
  BarChart2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Compass,
} from "lucide-react";
import { SocialPlatform, PostAspectRatio } from "./types";

interface SmartphoneFeedPreviewProps {
  platform: SocialPlatform;
  mediaUrl?: string | null;
  mediaType?: "video" | "image";
  caption: string;
  hashtags: string[];
  soundTrack?: string;
  creatorHandle?: string;
  displayName?: string;
  avatarUrl?: string;
  aspectRatio?: PostAspectRatio;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

export const SmartphoneFeedPreview: React.FC<SmartphoneFeedPreviewProps> = ({
  platform,
  mediaUrl,
  mediaType = "video",
  caption,
  hashtags,
  soundTrack = "Original Sound - S.Y.N.T.A.X. AI",
  creatorHandle = "@philippsteidle",
  displayName = "Philipp Steidle",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  aspectRatio = "9:16",
  likesCount = 4280,
  commentsCount = 312,
  sharesCount = 590,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState("19:42");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setCurrentTimeStr(`${hours}:${mins}`);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formattedLikes = (likesCount + (isLiked ? 1 : 0)).toLocaleString();
  const cleanCaption = caption || "Dein nächster viraler Content mit S.Y.N.T.A.X. AI Multi-Agent Power. ⚡";

  return (
    <div className="flex flex-col items-center justify-center select-none w-full max-w-[320px] mx-auto py-1">
      {/* Platform Badge Bar Above Phone */}
      <div className="flex items-center justify-between w-full px-2 mb-2 text-[10.5px] font-mono">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE SIMULATOR</span>
        </span>
        <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9.5px] bg-white/5 border border-white/10 text-zinc-300">
          {platform === "tiktok" && "🎵 TikTok FYP"}
          {platform === "instagram" && "📸 Instagram Reels"}
          {platform === "youtube" && "▶️ Shorts Feed"}
          {platform === "x" && "𝕏 Timeline"}
          {platform === "linkedin" && "💼 Feed"}
        </span>
      </div>

      {/* Smartphone Chassis */}
      <div className="relative w-full aspect-[9/18.5] max-h-[580px] bg-black rounded-[42px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12)] border-[4px] border-zinc-800/90 overflow-hidden flex flex-col justify-between">
        
        {/* Dynamic Island / Bezel Top */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center">
          <div className="w-24 h-5 rounded-full bg-zinc-950 border border-zinc-800/80 flex items-center justify-between px-2 text-[8px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            <span className="w-2 h-2 rounded-full bg-zinc-800" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="relative z-30 px-3 pt-1 flex items-center justify-between text-[10px] text-white/80 font-mono tracking-tight">
          <span className="font-semibold">{currentTimeStr}</span>
          <div className="flex items-center gap-1.5 text-[9px]">
            <span>5G</span>
            <div className="w-4 h-2 border border-white/70 rounded-xs flex items-center p-0.5">
              <div className="h-full w-3 bg-white rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Media Canvas / Screen Interior */}
        <div className="relative flex-1 w-full rounded-[32px] overflow-hidden bg-zinc-950 flex items-center justify-center group my-1">
          
          {/* Media Content */}
          {mediaUrl ? (
            mediaType === "video" ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Post Preview"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-2">
                <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
              </div>
              <p className="text-xs font-medium text-zinc-300">Medienvorschau</p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Lade ein Video oder Bild hoch, um die Live-Vorschau zu sehen.
              </p>
            </div>
          )}

          {/* Video Control Buttons (Hover or tap) */}
          {mediaType === "video" && mediaUrl && (
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
              <button
                type="button"
                onClick={toggleMute}
                className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs hover:bg-black/80 transition"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs hover:bg-black/80 transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* PLATFORM-SPECIFIC CHROME OVERLAYS */}
          {platform === "tiktok" && (
            <>
              {/* Top Tabs */}
              <div className="absolute top-2 left-0 right-0 z-20 flex items-center justify-center gap-4 text-xs font-bold text-white/60">
                <span className="hover:text-white transition cursor-pointer">Live</span>
                <span className="hover:text-white transition cursor-pointer">Folge ich</span>
                <span className="text-white border-b-2 border-white pb-0.5">Für dich</span>
              </div>

              {/* Right Engagement Column */}
              <div className="absolute right-2 bottom-12 z-20 flex flex-col items-center gap-3.5 text-white">
                {/* Creator Avatar with Follow Plus */}
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={creatorHandle}
                    className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-md"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-black leading-none">
                    +
                  </div>
                </div>

                {/* Heart / Like */}
                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className={`p-1.5 rounded-full transition ${isLiked ? "text-pink-500 scale-110" : "text-white group-hover:scale-110"}`}>
                    <Heart className={`w-6 h-6 ${isLiked ? "fill-pink-500" : "fill-white/20"}`} />
                  </div>
                  <span className="text-[10px] font-bold drop-shadow-md">{formattedLikes}</span>
                </button>

                {/* Comments */}
                <div className="flex flex-col items-center">
                  <div className="p-1.5">
                    <MessageCircle className="w-6 h-6 fill-white/20 drop-shadow-md" />
                  </div>
                  <span className="text-[10px] font-bold drop-shadow-md">{commentsCount}</span>
                </div>

                {/* Bookmark */}
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className={`p-1.5 transition ${isSaved ? "text-amber-400" : "text-white"}`}>
                    <Bookmark className={`w-6 h-6 ${isSaved ? "fill-amber-400" : "fill-white/20"}`} />
                  </div>
                  <span className="text-[10px] font-bold drop-shadow-md">1.2k</span>
                </button>

                {/* Share */}
                <div className="flex flex-col items-center">
                  <div className="p-1.5">
                    <Share2 className="w-6 h-6 fill-white/20 drop-shadow-md" />
                  </div>
                  <span className="text-[10px] font-bold drop-shadow-md">{sharesCount}</span>
                </div>

                {/* Rotating Vinyl Disc */}
                <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-spin [animation-duration:4s] shadow-lg">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                </div>
              </div>

              {/* Bottom Caption & Audio Bar */}
              <div className="absolute left-3 right-14 bottom-3 z-20 space-y-1 text-white text-left drop-shadow-md">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs hover:underline cursor-pointer">{creatorHandle}</span>
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
                </div>
                <p className="text-[11px] line-clamp-2 leading-tight text-white/95">
                  {cleanCaption}
                </p>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px] font-bold text-pink-300">
                    {hashtags.slice(0, 4).map((tag, i) => (
                      <span key={i}>{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[9.5px] text-white/80 pt-0.5 overflow-hidden">
                  <Music2 className="w-3 h-3 flex-shrink-0 animate-bounce" />
                  <span className="truncate">{soundTrack}</span>
                </div>
              </div>
            </>
          )}

          {platform === "instagram" && (
            <>
              {/* Instagram Reels Top Header */}
              <div className="absolute top-2 left-3 right-3 z-20 flex items-center justify-between text-white text-xs font-bold">
                <span className="text-sm tracking-tight flex items-center gap-1">
                  <span>Reels</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 font-normal">
                  Audio Original
                </span>
              </div>

              {/* Right Reels Actions */}
              <div className="absolute right-2 bottom-12 z-20 flex flex-col items-center gap-4 text-white">
                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                  <span className="text-[10px] font-medium mt-0.5">{formattedLikes}</span>
                </button>

                <div className="flex flex-col items-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                  <span className="text-[10px] font-medium mt-0.5">{commentsCount}</span>
                </div>

                <div className="flex flex-col items-center">
                  <Send className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-medium mt-0.5">{sharesCount}</span>
                </div>

                <MoreVertical className="w-5 h-5 text-white/80" />

                <div className="w-6 h-6 rounded-md border border-white/80 overflow-hidden mt-1">
                  <img src={avatarUrl} alt="audio" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Bottom Creator & Description */}
              <div className="absolute left-3 right-14 bottom-3 z-20 space-y-1.5 text-white text-left">
                <div className="flex items-center gap-2">
                  <img
                    src={avatarUrl}
                    alt={creatorHandle}
                    className="w-7 h-7 rounded-full border border-white object-cover"
                  />
                  <span className="font-bold text-xs">{creatorHandle}</span>
                  <button className="px-2 py-0.5 rounded-full border border-white/60 text-[9px] font-semibold hover:bg-white/20 transition">
                    Folgen
                  </button>
                </div>
                <p className="text-[10.5px] line-clamp-2 leading-tight text-white/90">
                  {cleanCaption}
                </p>
                <div className="flex items-center gap-1.5 text-[9.5px] text-white/80">
                  <Music2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{soundTrack}</span>
                </div>
              </div>
            </>
          )}

          {platform === "youtube" && (
            <>
              {/* YouTube Shorts Overlay */}
              <div className="absolute top-2 left-3 right-3 z-20 flex items-center justify-between text-white text-xs">
                <span className="font-bold text-red-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Shorts
                </span>
              </div>

              {/* Right Shorts Column */}
              <div className="absolute right-2 bottom-10 z-20 flex flex-col items-center gap-3.5 text-white">
                <div className="flex flex-col items-center">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-[9.5px] font-bold mt-0.5">{formattedLikes}</span>
                </div>
                <div className="flex flex-col items-center">
                  <ThumbsDown className="w-5 h-5" />
                  <span className="text-[9.5px] font-bold mt-0.5">Dislike</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[9.5px] font-bold mt-0.5">{commentsCount}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Share2 className="w-5 h-5" />
                  <span className="text-[9.5px] font-bold mt-0.5">Teilen</span>
                </div>
                <Repeat className="w-5 h-5" />
              </div>

              {/* Bottom YouTube Details */}
              <div className="absolute left-3 right-14 bottom-3 z-20 space-y-1.5 text-white text-left">
                <div className="flex items-center gap-2">
                  <img
                    src={avatarUrl}
                    alt={creatorHandle}
                    className="w-7 h-7 rounded-full border border-white/60 object-cover"
                  />
                  <span className="font-bold text-xs">{displayName}</span>
                  <button className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9.5px] font-bold">
                    Abonnieren
                  </button>
                </div>
                <p className="text-[10.5px] line-clamp-2 leading-tight text-white/90">
                  {cleanCaption}
                </p>
              </div>
            </>
          )}

          {(platform === "x" || platform === "linkedin") && (
            /* Card Style Timeline Preview */
            <div className="absolute inset-0 z-20 bg-zinc-950 p-3 flex flex-col justify-between overflow-y-auto text-left text-zinc-100 font-sans">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs truncate text-white">{displayName}</span>
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono block">{creatorHandle} · 2m</span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-zinc-200">
                  {cleanCaption}
                </p>

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10.5px] text-cyan-400 font-medium">
                    {hashtags.map((t, idx) => (
                      <span key={idx}>{t}</span>
                    ))}
                  </div>
                )}

                {mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video mt-1">
                    {mediaType === "video" ? (
                      <video src={mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                    ) : (
                      <img src={mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>

              {/* Engagement Actions */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-zinc-500 text-xs mt-2">
                <div className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{commentsCount}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{sharesCount}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-pink-500 cursor-pointer">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{formattedLikes}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">14.8k</span>
                </div>
                <Bookmark className="w-3.5 h-3.5 hover:text-amber-400 cursor-pointer" />
              </div>
            </div>
          )}

        </div>

        {/* Home Indicator Bar */}
        <div className="relative z-30 flex items-center justify-center pt-1">
          <div className="w-28 h-1 rounded-full bg-white/40" />
        </div>

      </div>
    </div>
  );
};
