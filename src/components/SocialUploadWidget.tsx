import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Sparkles,
  Send,
  Calendar,
  CheckCircle2,
  X,
  Play,
  Film,
  BarChart3,
  TrendingUp,
  Heart,
  MessageSquare,
  Clock,
  Search,
  Filter,
  Flame,
  Award,
  Trash2,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Hash,
  Music2,
  Layers,
  Smartphone,
  Zap,
  Globe,
  Plus,
  Share2,
  Check,
  Copy,
  Sliders,
  ChevronDown,
  Monitor,
  Lightbulb,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DraggableResizableWidget } from "./DraggableResizableWidget";
import {
  SocialPlatform,
  SocialPost,
  SocialAccountProfile,
  PostAspectRatio,
} from "./social/types";
import {
  getStoredPosts,
  saveStoredPosts,
  getStoredAccounts,
  saveStoredAccounts,
} from "./social/socialDataStore";
import { SmartphoneFeedPreview } from "./social/SmartphoneFeedPreview";
import { SocialCalendarView } from "./social/SocialCalendarView";
import { SocialAnalyticsView } from "./social/SocialAnalyticsView";
import { AiHookStudioView } from "./social/AiHookStudioView";
import { SocialMediaVaultView } from "./social/SocialMediaVaultView";
import { SocialOAuthModal } from "./social/SocialOAuthModal";
import { GlobeAuditModal } from "./social/GlobeAuditModal";

interface SocialUploadWidgetProps {
  isEditMode?: boolean;
  onClose?: () => void;
  initialPlatform?: "tiktok" | "instagram";
  accountName?: string;
}

type StudioTab = "composer" | "calendar" | "vault" | "analytics" | "ai_hooks";

// Pre-packaged viral video assets for instant testing
const DEMO_MEDIA_ASSETS = [
  {
    name: "Quantum Core (9:16)",
    type: "video" as const,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    aspect: "9:16" as PostAspectRatio,
    thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Cyber Interface (9:16)",
    type: "video" as const,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    aspect: "9:16" as PostAspectRatio,
    thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Neural Code HUD (1:1)",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
    aspect: "1:1" as PostAspectRatio,
    thumb: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
  },
];

const AUDIO_TRACKS = [
  "⚡ Trending Tech Sound - Quantum Beats 2026",
  "🎵 Cyber Synth Wave - Deep Bassline (FYP Viral)",
  "☕ Lo-Fi Coding Beats - 128 BPM Focus",
  "🎙️ Nur Voice-Over (Original Audio)",
];

const VIRAL_HASHTAG_PACKS = {
  tech: ["#SYNTAXAI", "#TechTok", "#FutureTech", "#DeveloperLife", "#AIRevolution"],
  startup: ["#BuildInPublic", "#SaaS", "#StartupLife", "#IndieHacker", "#Productivity"],
  growth: ["#ViralReels", "#AlgorithmHacks", "#ContentCreator", "#FYP", "#TrendingNow"],
};

export const SocialUploadWidget: React.FC<SocialUploadWidgetProps> = ({
  isEditMode = false,
  onClose,
  initialPlatform = "tiktok",
  accountName,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<StudioTab>("composer");
  const [platform, setPlatform] = useState<SocialPlatform>(
    initialPlatform === "instagram" ? "instagram" : "tiktok"
  );
  const [crossPostPlatforms, setCrossPostPlatforms] = useState<SocialPlatform[]>([
    initialPlatform === "instagram" ? "instagram" : "tiktok",
  ]);

  // Account Profiles
  const [accounts, setAccounts] = useState<Record<SocialPlatform, SocialAccountProfile>>(
    () => getStoredAccounts()
  );
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oAuthPlatform, setOAuthPlatform] = useState<SocialPlatform>(platform);

  // Content Repository
  const [posts, setPosts] = useState<SocialPost[]>(() => getStoredPosts());
  const [selectedAuditPost, setSelectedAuditPost] = useState<SocialPost | null>(null);

  // Composer Form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(
    DEMO_MEDIA_ASSETS[0].url
  );
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [aspectRatio, setAspectRatio] = useState<PostAspectRatio>("9:16");
  const [caption, setCaption] = useState<string>(
    "🚀 S.Y.N.T.A.X. Core V3 Live Demo: 8 autonome KI-Agenten steuern simultan Frontend, Backend und Spatial Holograms. Was meint ihr dazu? 🔥"
  );
  const [hashtags, setHashtags] = useState<string[]>([
    "#SYNTAXAI",
    "#TechTok",
    "#FutureTech",
    "#DeveloperLife",
    "#AIRevolution",
  ]);
  const [tagInput, setTagInput] = useState("");
  const [soundTrack, setSoundTrack] = useState<string>(AUDIO_TRACKS[0]);
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(() => {
    const today = new Date();
    today.setHours(19, 30, 0, 0);
    return today.toISOString().slice(0, 16);
  });
  const [autoFirstComment, setAutoFirstComment] = useState(true);
  const [firstCommentText, setFirstCommentText] = useState(
    "👇 Hol dir den frühen Beta-Zugang zu S.Y.N.T.A.X. im Bio-Link!"
  );

  // Simulator Mode (Phone vs Desktop Card)
  const [previewDevice, setPreviewDevice] = useState<"phone" | "card">("phone");

  // Publishing Workflow
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<number>(0);
  const [publishStageText, setPublishStageText] = useState<string>("");
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const currentAccount = accounts[platform] || {
    platform,
    handle: `@philippsteidle`,
    connected: true,
    followersCount: 142000,
  };

  // Cross-Post platform toggle
  const toggleCrossPost = (plat: SocialPlatform) => {
    if (crossPostPlatforms.includes(plat)) {
      if (crossPostPlatforms.length === 1) return; // keep at least one
      setCrossPostPlatforms(crossPostPlatforms.filter((p) => p !== plat));
    } else {
      setCrossPostPlatforms([...crossPostPlatforms, plat]);
    }
  };

  // Quick Hook Inserters
  const injectHook = (hookType: "shock" | "curiosity" | "contrarian" | "proof") => {
    let hookText = "";
    switch (hookType) {
      case "shock":
        hookText = "⚠️ Hör sofort auf, Zeit damit zu verschwenden: Hier ist der schnellere Weg.";
        break;
      case "curiosity":
        hookText = "🧠 Niemand spricht darüber, aber das verändert gerade die gesamte Tech-Branche:";
        break;
      case "contrarian":
        hookText = "❌ Die meisten Entwickler machen 2026 einen massiven Denkfehler. Hier ist der Beweis:";
        break;
      case "proof":
        hookText = "⚡ Wie wir in unter 60 Sekunden 8 KI-Agenten synchronisiert haben (Live Test):";
        break;
    }
    setCaption((prev) => `${hookText}\n\n${prev.replace(/^[^\n]+\n\n/, "")}`);
    showToast("✓ High-Retention Hook eingefügt!");
  };

  // Calculate live Viral Readiness Score (0 - 100)
  const viralScore = React.useMemo(() => {
    let score = 40;
    if (caption.length >= 60 && caption.length <= 350) score += 20;
    if (hashtags.length >= 3 && hashtags.length <= 7) score += 15;
    if (aspectRatio === "9:16") score += 15;
    if (mediaType === "video") score += 10;
    return Math.min(100, score);
  }, [caption, hashtags, aspectRatio, mediaType]);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const isVid = file.type.startsWith("video/");
      setMediaType(isVid ? "video" : "image");
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
      showToast(`Datei "${file.name}" geladen`);
    }
  };

  // Publish / Schedule Process
  const handleStartPublish = () => {
    setIsPublishing(true);
    setPublishProgress(10);
    setPublishStageText("G.L.O.B.E. Retention Check & Optimierung...");

    const stages = [
      { pct: 25, text: "G.L.O.B.E. Retention Check abgeschlossen" },
      { pct: 50, text: `Rendere Video im ${aspectRatio} Format mit Audiotrack...` },
      { pct: 75, text: `Synchronisiere mit ${crossPostPlatforms.length} Plattform(en)...` },
      { pct: 90, text: isScheduled ? "Trage Slot im Content-Kalender ein..." : "Pushe Beitrag live in den Feed..." },
      { pct: 100, text: "Erfolgreich abgeschlossen!" },
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < stages.length) {
        setPublishProgress(stages[step].pct);
        setPublishStageText(stages[step].text);
        step++;
      } else {
        clearInterval(interval);
        setIsPublishing(false);

        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          title: caption.slice(0, 45) || `${platform.toUpperCase()} Post`,
          caption: caption,
          platform: platform,
          platforms: crossPostPlatforms,
          thumbnailUrl:
            mediaPreviewUrl ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
          mediaUrl: mediaPreviewUrl || undefined,
          mediaType: mediaType,
          aspectRatio: aspectRatio,
          status: isScheduled ? "scheduled" : "published",
          scheduledFor: isScheduled ? scheduledDateTime : undefined,
          postedAt: isScheduled ? undefined : "Gerade eben",
          views: isScheduled ? 0 : 3420,
          likes: isScheduled ? 0 : 780,
          comments: isScheduled ? 0 : 64,
          shares: isScheduled ? 0 : 112,
          watchTimePercent: isScheduled ? 0 : 89.4,
          viralityScore: viralScore,
          soundTrack: soundTrack,
          hashtags: hashtags,
          creatorHandle: currentAccount.handle,
          globeAudit: {
            hookScore: "9.6 / 10 (S-Tier Virality)",
            retentionNote: "Hervorragender visueller & textueller Stopp in den ersten 2.5 Sekunden.",
            hashtagImpact: `${hashtags[0] || "#SYNTAXAI"} erzielt maximale FYP-Indexierung.`,
            viralAdvice: "Reagiere innerhalb der ersten 15 Minuten auf Kommentare.",
            audioMomentum: `${soundTrack} trendet stark mit 120k+ Nutzungen.`,
            estimatedFypReach: "65.000 - 110.000 geschätzte FYP Einblendungen",
          },
        };

        const updated = [newPost, ...posts];
        setPosts(updated);
        saveStoredPosts(updated);

        try {
          confetti({
            particleCount: 65,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        showToast(
          isScheduled
            ? `✓ Beitrag für ${new Date(scheduledDateTime).toLocaleString("de-DE")} eingeplant!`
            : `🎉 Live auf ${crossPostPlatforms.map((p) => p.toUpperCase()).join(", ")} gepostet!`
        );
      }
    }, 400);
  };

  const headerControls = (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      {/* Platform Multi Indicator */}
      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-[10.5px] text-zinc-300 font-sans font-medium">
          {currentAccount.handle}
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          setOAuthPlatform(platform);
          setShowOAuthModal(true);
        }}
        className="px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-[10px] transition cursor-pointer"
      >
        + Account
      </button>
    </div>
  );

  return (
    <DraggableResizableWidget
      id="socialStudio"
      title="S.Y.N.T.A.X. SOCIAL MEDIA STUDIO PRO"
      initialX={80}
      initialY={70}
      initialWidth={1080}
      initialHeight={740}
      minWidth={680}
      minHeight={520}
      maxWidth={1600}
      maxHeight={1050}
      isEditMode={isEditMode}
      onClose={onClose}
      headerControls={headerControls}
    >
      <div className="flex flex-col h-full bg-[#09090b] text-zinc-100 font-sans select-none overflow-hidden text-xs">
        
        {/* TOP WORKSPACE NAVIGATION BAR */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-[#0d0d11] flex-shrink-0">
          
          {/* Main Views Pills */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("composer")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "composer"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Pro Composer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>📅 Kalender & Queue</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "vault"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>🗄️ Media Vault</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>📈 Viral Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai_hooks")}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "ai_hooks"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>🧠 AI Hook Lab</span>
            </button>
          </div>

          {/* Primary Platform Selector for Composer */}
          {activeTab === "composer" && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-zinc-500 hidden sm:inline">
                Ziel-Plattform:
              </span>
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                {(["tiktok", "instagram", "youtube", "x", "linkedin"] as SocialPlatform[]).map(
                  (plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        setPlatform(plat);
                        if (!crossPostPlatforms.includes(plat)) {
                          setCrossPostPlatforms([...crossPostPlatforms, plat]);
                        }
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                        platform === plat
                          ? "bg-zinc-800 text-white font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {plat === "tiktok" && "TikTok"}
                      {plat === "instagram" && "Reels"}
                      {plat === "youtube" && "Shorts"}
                      {plat === "x" && "𝕏 Post"}
                      {plat === "linkedin" && "LinkedIn"}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

        </div>

        {/* TOAST ALERT */}
        {toastNotification && (
          <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-200 text-xs flex items-center justify-between animate-fade-in flex-shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="text-zinc-500 hover:text-white p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* TAB CONTENTS */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* TAB 1: PRO COMPOSER */}
          {activeTab === "composer" && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* LEFT COLUMN: THE ENGINE */}
              <div className="flex-1 p-4 lg:p-5 overflow-y-auto custom-scrollbar space-y-4 border-r border-zinc-800/80">
                
                {/* Omni Cross-Posting Matrix */}
                <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/90 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Omni-Publishing Matrix (Multi-Cross-Post)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {crossPostPlatforms.length} Netzwerk(e) aktiv
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                    {[
                      { id: "tiktok" as SocialPlatform, label: "🎵 TikTok FYP", badge: "2.2k" },
                      { id: "instagram" as SocialPlatform, label: "📸 IG Reels", badge: "2.2k" },
                      { id: "youtube" as SocialPlatform, label: "▶️ YT Shorts", badge: "100" },
                      { id: "x" as SocialPlatform, label: "𝕏 Post", badge: "280" },
                      { id: "linkedin" as SocialPlatform, label: "💼 LinkedIn", badge: "3.0k" },
                    ].map((item) => {
                      const isActive = crossPostPlatforms.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleCrossPost(item.id)}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                            isActive
                              ? "bg-zinc-800 border-zinc-600 text-white"
                              : "bg-zinc-950/60 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span className="font-medium text-xs leading-none">
                            {item.label}
                          </span>
                          <span className="text-[9px] font-mono mt-1 opacity-60">
                            Limit: {item.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1-Click AI Hook Booster Buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Klick Viral Hook Generator</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      +42% Hook-Stopp-Rate
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => injectHook("shock")}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer"
                    >
                      <p className="font-bold text-white text-[11px]">⚡ Schock / Stopp</p>
                      <p className="text-[9.5px] text-zinc-400 mt-0.5 truncate">
                        "Hör sofort auf mit..."
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => injectHook("curiosity")}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer"
                    >
                      <p className="font-bold text-white text-[11px]">🧠 Curiosity Gap</p>
                      <p className="text-[9.5px] text-zinc-400 mt-0.5 truncate">
                        "Niemand spricht darüber..."
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => injectHook("contrarian")}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer"
                    >
                      <p className="font-bold text-white text-[11px]">❌ Contrarian Take</p>
                      <p className="text-[9.5px] text-zinc-400 mt-0.5 truncate">
                        "Der größte Denkfehler..."
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => injectHook("proof")}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer"
                    >
                      <p className="font-bold text-white text-[11px]">📊 Case Proof</p>
                      <p className="text-[9.5px] text-zinc-400 mt-0.5 truncate">
                        "In unter 60 Sekunden..."
                      </p>
                    </button>
                  </div>
                </div>

                {/* Caption & Hook Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">
                      Caption & Skript (Hook & Inhalt)
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {caption.length} Zeichen
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={4}
                      placeholder="Schreibe deine Caption oder nutze einen der Hook-Buttons oben..."
                      className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans text-xs leading-relaxed custom-scrollbar resize-none"
                    />
                  </div>
                </div>

                {/* Hashtag Management & Trending Packs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Hashtags ({hashtags.length})</span>
                    </span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-zinc-500">Schnell-Packs:</span>
                      <button
                        type="button"
                        onClick={() => setHashtags(VIRAL_HASHTAG_PACKS.tech)}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Tech
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() => setHashtags(VIRAL_HASHTAG_PACKS.startup)}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Startup
                      </button>
                      <span className="text-zinc-600">·</span>
                      <button
                        type="button"
                        onClick={() => setHashtags(VIRAL_HASHTAG_PACKS.growth)}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Growth
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    {hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-mono flex items-center gap-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setHashtags(hashtags.filter((_, i) => i !== idx))}
                          className="text-zinc-500 hover:text-red-400 transition ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          e.preventDefault();
                          const cleanTag = tagInput.trim().startsWith("#")
                            ? tagInput.trim()
                            : `#${tagInput.trim()}`;
                          if (!hashtags.includes(cleanTag)) {
                            setHashtags([...hashtags, cleanTag]);
                          }
                          setTagInput("");
                        }
                      }}
                      placeholder="+ Tag hinzufügen..."
                      className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none px-2 py-0.5 min-w-[120px]"
                    />
                  </div>
                </div>

                {/* Media Picker & Aspect Ratio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Preset Media Quick Select */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Video-Clip wählen / Upload</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {DEMO_MEDIA_ASSETS.map((asset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setMediaPreviewUrl(asset.url);
                            setMediaType(asset.type);
                            setAspectRatio(asset.aspect);
                            showToast(`Asset "${asset.name}" gewählt`);
                          }}
                          className={`flex-1 p-1.5 rounded-lg border text-left transition cursor-pointer ${
                            mediaPreviewUrl === asset.url
                              ? "bg-zinc-800 border-zinc-600 text-white"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <p className="font-medium text-[10px] truncate">{asset.name}</p>
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="video/*,image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white transition font-medium text-[10.5px] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Eigenes Video / Bild hochladen</span>
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio & Audio */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Format & Sound</span>
                    </span>

                    {/* Ratio Buttons */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                      {(["9:16", "1:1", "16:9", "4:5"] as PostAspectRatio[]).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAspectRatio(ratio)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                            aspectRatio === ratio
                              ? "bg-zinc-800 text-white font-bold"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>

                    {/* Sound Selector */}
                    <div className="pt-1">
                      <select
                        value={soundTrack}
                        onChange={(e) => setSoundTrack(e.target.value)}
                        className="w-full p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10.5px] focus:outline-none"
                      >
                        {AUDIO_TRACKS.map((sound, i) => (
                          <option key={i} value={sound}>
                            {sound}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                {/* Auto First Comment Automation */}
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoFirstComment}
                        onChange={(e) => setAutoFirstComment(e.target.checked)}
                        className="rounded bg-zinc-800 border-zinc-700 text-cyan-500"
                      />
                      <span className="font-medium text-zinc-200 text-xs">
                        💬 Ersten Kommentar automatisch posten (+30s nach Veröffentlichung)
                      </span>
                    </label>
                  </div>
                  {autoFirstComment && (
                    <input
                      type="text"
                      value={firstCommentText}
                      onChange={(e) => setFirstCommentText(e.target.value)}
                      placeholder="Link zur Website, Bio-Hinweis oder zusätzliche Frage..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] focus:outline-none focus:border-zinc-600"
                    />
                  )}
                </div>

                {/* Publishing & Scheduling Bar */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsScheduled(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          !isScheduled
                            ? "bg-zinc-800 text-white border border-zinc-700"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        ⚡ Sofort posten
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsScheduled(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                          isScheduled
                            ? "bg-zinc-800 text-white border border-zinc-700"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span>Einplanen</span>
                      </button>
                    </div>

                    {isScheduled && (
                      <button
                        type="button"
                        onClick={() => {
                          const peak = new Date();
                          peak.setHours(19, 30, 0, 0);
                          setScheduledDateTime(peak.toISOString().slice(0, 16));
                          showToast("🔥 Slot auf heute 19:30 Uhr (Peak-Traffic) gesetzt!");
                        }}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Flame className="w-3 h-3" />
                        <span>AI Peak-Time (19:30)</span>
                      </button>
                    )}
                  </div>

                  {isScheduled && (
                    <div className="flex items-center gap-2">
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="flex-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none"
                      >
                      </input>
                    </div>
                  )}

                  {/* Progress Bar during publishing */}
                  {isPublishing && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400">{publishStageText}</span>
                        <span className="text-white font-bold">{publishProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${publishProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Master Publish Button */}
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={handleStartPublish}
                    className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Veröffentliche auf {crossPostPlatforms.length} Plattform(en)...</span>
                      </>
                    ) : isScheduled ? (
                      <>
                        <Calendar className="w-4 h-4 text-black" />
                        <span>
                          BEITRAG FÜR {new Date(scheduledDateTime).toLocaleDateString("de-DE")} EINPLANEN
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-black" />
                        <span>
                          JETZT LIVE AUF {crossPostPlatforms.map((p) => p.toUpperCase()).join(" + ")} POSTEN
                        </span>
                      </>
                    )}
                  </button>

                </div>

              </div>

              {/* RIGHT COLUMN: LIVE SIMULATOR & VIRALITY METER */}
              <div className="w-full lg:w-[420px] bg-[#0c0c10] p-4 flex flex-col flex-shrink-0 border-t lg:border-t-0 border-zinc-800 space-y-3 overflow-y-auto custom-scrollbar">
                
                {/* Simulator Header & Device Switch */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-zinc-400" />
                    <span className="font-bold text-white text-xs">Live Feed Simulator</span>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("phone")}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                        previewDevice === "phone"
                          ? "bg-zinc-800 text-white font-bold"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      📱 Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("card")}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                        previewDevice === "card"
                          ? "bg-zinc-800 text-white font-bold"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      💻 Desktop
                    </button>
                  </div>
                </div>

                {/* Virality Readiness Index Card */}
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      Viral Readiness Index
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        viralScore >= 80
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {viralScore} / 100 ({viralScore >= 80 ? "S-Tier" : "Gut"})
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        viralScore >= 80 ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                      style={{ width: `${viralScore}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 pt-1">
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>9:16 Vertical Ratio</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Soundtrack aktiv</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{hashtags.length} FYP-Hashtags</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>3s Visual Stopp</span>
                    </div>
                  </div>
                </div>

                {/* The Phone Chassis Mockup */}
                <div className="flex-1 flex items-center justify-center py-1">
                  <div className="w-full max-w-[320px]">
                    <SmartphoneFeedPreview
                      platform={platform}
                      caption={caption}
                      hashtags={hashtags}
                      mediaUrl={mediaPreviewUrl}
                      mediaType={mediaType}
                      aspectRatio={aspectRatio}
                      soundTrack={soundTrack}
                      creatorHandle={currentAccount.handle}
                      avatarUrl={currentAccount.avatarUrl}
                      likesCount={currentAccount.followersCount ? Math.floor(currentAccount.followersCount * 0.08) : 1840}
                      commentsCount={84}
                      sharesCount={142}
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CALENDAR VIEW */}
          {activeTab === "calendar" && (
            <SocialCalendarView
              posts={posts}
              onSelectPost={(p) => {
                setCaption(p.caption);
                setPlatform(p.platform);
                setHashtags(p.hashtags);
                if (p.mediaUrl) setMediaPreviewUrl(p.mediaUrl);
                setActiveTab("composer");
                showToast("Post in den Composer geladen.");
              }}
              onNewPostAtTime={(iso) => {
                setScheduledDateTime(iso.slice(0, 16));
                setIsScheduled(true);
                setActiveTab("composer");
                showToast("Slot im Kalender ausgewählt.");
              }}
              onDeletePost={(id) => {
                const updated = posts.filter((p) => p.id !== id);
                setPosts(updated);
                saveStoredPosts(updated);
                showToast("Post gelöscht.");
              }}
            />
          )}

          {/* TAB 3: ASSET VAULT */}
          {activeTab === "vault" && (
            <SocialMediaVaultView
              onSelectMedia={(media) => {
                setMediaPreviewUrl(media.url);
                setMediaType(media.type);
                setAspectRatio(media.aspectRatio);
                setActiveTab("composer");
                showToast(`Asset "${media.title}" in Composer geladen.`);
              }}
              onOpenAudit={(post) => setSelectedAuditPost(post)}
            />
          )}

          {/* TAB 4: VIRAL ANALYTICS */}
          {activeTab === "analytics" && (
            <SocialAnalyticsView
              posts={posts}
              onOpenAudit={(post) => setSelectedAuditPost(post)}
            />
          )}

          {/* TAB 5: AI HOOK LAB */}
          {activeTab === "ai_hooks" && (
            <AiHookStudioView
              platform={platform}
              onApplyToComposer={(hook, fullCaption, tags) => {
                setCaption(fullCaption);
                setHashtags(tags);
                setActiveTab("composer");
                showToast("✓ Hook & Skript in den Pro Composer übertragen!");
              }}
            />
          )}

        </div>

        {/* OAUTH CONNECT MODAL */}
        {showOAuthModal && (
          <SocialOAuthModal
            platform={oAuthPlatform}
            currentHandle={accounts[oAuthPlatform]?.handle || "@steidle"}
            onClose={() => setShowOAuthModal(false)}
            onConnectSuccess={(plat, handle) => {
              const updated = {
                ...accounts,
                [plat]: {
                  ...accounts[plat],
                  handle,
                  connected: true,
                  connectedAt: new Date().toISOString(),
                },
              };
              setAccounts(updated);
              saveStoredAccounts(updated);
              setShowOAuthModal(false);
              showToast(`✓ Mit ${plat.toUpperCase()} (${handle}) verbunden!`);
            }}
          />
        )}

        {/* G.L.O.B.E. AUDIT MODAL */}
        {selectedAuditPost && (
          <GlobeAuditModal
            post={selectedAuditPost}
            onClose={() => setSelectedAuditPost(null)}
          />
        )}

      </div>
    </DraggableResizableWidget>
  );
};
