import React, { useState } from "react";
import {
  Film,
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Play,
  Download,
  Trash2,
  Share2,
  Eye,
  Heart,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { SocialPlatform, SocialPost } from "./types";

interface SocialMediaVaultViewProps {
  posts: SocialPost[];
  onSelectPostToPublish: (post: SocialPost) => void;
  onDeletePost: (postId: string) => void;
  onUploadMedia: (file: File) => void;
  onOpenAudit: (post: SocialPost) => void;
}

export const SocialMediaVaultView: React.FC<SocialMediaVaultViewProps> = ({
  posts,
  onSelectPostToPublish,
  onDeletePost,
  onUploadMedia,
  onOpenAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<"all" | "video" | "image">("all");
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | "all">("all");
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const filteredPosts = posts.filter((post) => {
    if (selectedFormat !== "all" && post.mediaType !== selectedFormat) return false;
    if (selectedPlatform !== "all" && post.platform !== selectedPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.caption.toLowerCase().includes(q) ||
        post.hashtags.some((h) => h.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadMedia(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-200 p-4 space-y-4 overflow-y-auto custom-scrollbar font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Media & Content Asset Vault
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Zentrale Medienbibliothek für Videos, Visuals, Renders & Veröffentlichungsverlauf
          </p>
        </div>

        {/* Upload Button */}
        <label className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs cursor-pointer transition flex items-center gap-2 shadow-sm">
          <Upload className="w-3.5 h-3.5" />
          <span>Neue Datei Hochladen</span>
          <input
            type="file"
            accept="video/*,image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadMedia(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Clips & Assets durchsuchen..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-pink-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Format filter */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setSelectedFormat("all")}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                selectedFormat === "all" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Alle Formate
            </button>
            <button
              onClick={() => setSelectedFormat("video")}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                selectedFormat === "video" ? "bg-pink-500/20 text-pink-300 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setSelectedFormat("image")}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                selectedFormat === "image" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Bilder
            </button>
          </div>

          {/* Platform filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 focus:outline-none text-[11px]"
          >
            <option value="all">Alle Netzwerke</option>
            <option value="tiktok">🎵 TikTok</option>
            <option value="instagram">📸 Instagram</option>
            <option value="youtube">▶️ YouTube</option>
            <option value="x">𝕏 Post</option>
          </select>
        </div>
      </div>

      {/* Grid of Assets */}
      {filteredPosts.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-zinc-800 hover:border-pink-500/50 rounded-2xl p-12 text-center bg-zinc-900/30 flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Keine Assets gefunden</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Ziehe Video- oder Bilddateien hierher oder lade deinen ersten Content im Studio Composer hoch.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-zinc-900/80 border border-zinc-800 hover:border-pink-500/40 rounded-2xl overflow-hidden transition flex flex-col justify-between shadow-sm"
            >
              {/* Media Visual Area */}
              <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                {post.mediaUrl && post.mediaType === "video" && playingVideoId === post.id ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                    onEnded={() => setPlayingVideoId(null)}
                  />
                ) : (
                  <>
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {post.mediaType === "video" && (
                      <button
                        type="button"
                        onClick={() => setPlayingVideoId(post.id)}
                        className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-black/60 hover:bg-pink-600 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition cursor-pointer shadow-lg"
                        title="Abspielen"
                      >
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </button>
                    )}
                  </>
                )}

                {/* Platform Badge Overlay */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white capitalize">
                    {post.platform}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase ${
                    post.status === "published"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : post.status === "scheduled"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {post.status === "published" ? "Live" : post.status === "scheduled" ? "Geplant" : "Entwurf"}
                  </span>
                </div>

                {/* Virality Score Badge */}
                {post.viralityScore > 0 && (
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-amber-400 font-bold">
                    ★ {post.viralityScore}
                  </div>
                )}
              </div>

              {/* Card Meta Description */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1" title={post.title}>
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-1">
                    {post.caption}
                  </p>
                </div>

                {/* Stats Row */}
                {post.status === "published" && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/80">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-400" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {post.watchTimePercent}% Retention
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800/60">
                  <div className="flex items-center gap-1">
                    {post.mediaUrl && (
                      <a
                        href={post.mediaUrl}
                        download={`${post.title || "video"}.mp4`}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        title="Download Asset"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenAudit(post)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold transition"
                    >
                      Audit
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPostToPublish(post)}
                      className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold transition flex items-center gap-1"
                    >
                      <span>Bearbeiten</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
