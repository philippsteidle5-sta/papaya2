import { SocialPlatform, SocialPost, SocialAccountProfile } from "./types";

const INITIAL_POSTS: SocialPost[] = [
  {
    id: "post-1",
    title: "S.Y.N.T.A.X. AI 8-Core Agent System Reveal",
    caption: "Was passiert, wenn 8 spezialisierte KI-Agenten synchron an einem Projekt arbeiten? Das ist die neue Ära von S.Y.N.T.A.X. Core. 🚀 Multi-Core Neural Processing live in Action!",
    platform: "tiktok",
    platforms: ["tiktok", "instagram"],
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    mediaType: "video",
    aspectRatio: "9:16",
    status: "published",
    postedAt: "Vor 3 Stunden",
    views: 18450,
    likes: 3420,
    comments: 284,
    shares: 412,
    watchTimePercent: 88.4,
    viralityScore: 94,
    soundTrack: "⚡ Trending Tech Sound - Quantum Beats 2026",
    hashtags: ["#SYNTAXAI", "#AITech", "#FutureTech", "#CodingTok", "#QuantumCore"],
    creatorHandle: "@philippsteidle",
    globeAudit: {
      hookScore: "9.6 / 10 (Hocheffektiv)",
      retentionNote: "88% der Zuschauer blieben über Sekunde 4 hinaus. Starker Hook!",
      hashtagImpact: "#SYNTAXAI trendet in Kategorie KI & Software Development.",
      viralAdvice: "Reagiere innerhalb der nächsten 30 Minuten auf die Top 5 Kommentare für einen weiteren FYP-Boost.",
      audioMomentum: "Quantum Beats Sound hat derzeit 340k Verwendungen auf TikTok.",
      estimatedFypReach: "85.000 - 120.000 geschätzte FYP Einblendungen",
    },
  },
  {
    id: "post-2",
    title: "Behind The Scenes: Jarvis Hologram HUD",
    caption: "Spatial Computing trifft Voice AI. Unser 3D-Hologramm projiziert Echtzeit-Systemdaten direkt in dein Sichtfeld. Wie findest du das Design? 💬",
    platform: "instagram",
    platforms: ["instagram"],
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    mediaType: "video",
    aspectRatio: "9:16",
    status: "published",
    postedAt: "Gestern 19:15",
    views: 12100,
    likes: 2180,
    comments: 165,
    shares: 290,
    watchTimePercent: 81.2,
    viralityScore: 88,
    soundTrack: "🎵 Aesthetic Cyber Ambient - S.Y.N.T.A.X. Wave",
    hashtags: ["#UIUX", "#CyberpunkDesign", "#SpatialComputing", "#ReelsViral", "#TechGram"],
    creatorHandle: "@philippsteidle",
    globeAudit: {
      hookScore: "8.9 / 10 (Sehr gut)",
      retentionNote: "Visueller Kontrast in den ersten 2 Sekunden sorgte für sofortigen Stopp beim Scrollen.",
      hashtagImpact: "#SpatialComputing treibt 42% des Explorer-Traffics.",
      viralAdvice: "Erstelle Teil 2 mit Fokus auf die Sprachsteuerung.",
      audioMomentum: "Eigener Audiosound wird bereits von 12 Creators wiederverwendet.",
      estimatedFypReach: "45.000 - 60.000 Accounts erreicht",
    },
  },
  {
    id: "post-3",
    title: "Der größte Fehler bei Next-Gen Web-Apps (und wie wir ihn gelöst haben)",
    caption: "Traditionelle Dashboards sind überladen und langsam. Wir haben das gesamte Interface auf ein modulares Spatial Grid umgestellt. 🧠 Hier sind die 3 wichtigsten Learnings:",
    platform: "x",
    platforms: ["x", "linkedin"],
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    mediaType: "image",
    aspectRatio: "16:9",
    status: "scheduled",
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    watchTimePercent: 0,
    viralityScore: 91,
    soundTrack: "Kein Audio (Bildbeitrag)",
    hashtags: ["#BuildInPublic", "#WebDev", "#TypeScript", "#AIProduct"],
    creatorHandle: "@philipp_steidle",
    globeAudit: {
      hookScore: "9.2 / 10",
      retentionNote: "Starker Contrarian-Hook für X Tech-Community.",
      hashtagImpact: "Optimal für Tech-Twitter & LinkedIn Feed-Algorithmus.",
      viralAdvice: "Zur Prime-Time um 18:45 Uhr veröffentlichen.",
      audioMomentum: "N/A",
      estimatedFypReach: "Geplante Reichweite: 25.000 Impressions",
    },
  },
  {
    id: "post-4",
    title: "Real-Time Speech Synthesis in under 120ms",
    caption: "Null Latenz. Natürliche Intonation. Schaut euch an, wie fluid die Konversation zwischen Mensch und Maschine sein kann. 🎧 Sound ON!",
    platform: "youtube",
    platforms: ["youtube", "tiktok"],
    thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    mediaType: "video",
    aspectRatio: "9:16",
    status: "draft",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    watchTimePercent: 0,
    viralityScore: 86,
    soundTrack: "Voice Demo Live Audio Stream",
    hashtags: ["#Shorts", "#VoiceAI", "#TechDemo", "#Innovation"],
    creatorHandle: "@philippsteidle",
    globeAudit: {
      hookScore: "8.7 / 10",
      retentionNote: "Audio-Fokus erfordert Untertitel für stumme Feeds.",
      hashtagImpact: "#Shorts optimiert für YouTube Shorts Feed Carousel.",
      viralAdvice: "Automatische Bilduntertitel aktivieren vor Veröffentlichung.",
      audioMomentum: "Originalton-Audiospur aktiv.",
      estimatedFypReach: "Geschätztes Shorts-Volumen: 70k+",
    },
  },
];

const STORAGE_KEY_POSTS = "syntax_social_posts_v3";
const STORAGE_KEY_ACCOUNTS = "syntax_social_accounts_v3";

export function getStoredPosts(): SocialPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read social posts from storage", e);
  }
  return INITIAL_POSTS;
}

export function saveStoredPosts(posts: SocialPost[]): void {
  try {
    // Keep top 60 posts to stay well within localStorage bounds
    const safePosts = posts.slice(0, 60).map((p) => {
      // If mediaUrl is a huge data: string, strip it from storage to avoid QuotaExceededError
      const isHugeMedia = p.mediaUrl && p.mediaUrl.startsWith("data:") && p.mediaUrl.length > 30000;
      return {
        ...p,
        mediaUrl: isHugeMedia ? undefined : p.mediaUrl,
      };
    });
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(safePosts));
  } catch (e) {
    console.warn("Failed to persist social posts", e);
  }
}

export const INITIAL_ACCOUNTS: Record<SocialPlatform, SocialAccountProfile> = {
  tiktok: {
    platform: "tiktok",
    handle: "@philippsteidle",
    displayName: "Philipp Steidle | S.Y.N.T.A.X.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    followers: 124800,
    postsCount: 68,
    connected: true,
    connectedAt: "2026-08-15",
    isVerified: true,
  },
  instagram: {
    platform: "instagram",
    handle: "@philippsteidle",
    displayName: "Philipp Steidle ⚡ AI Architect",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    followers: 46200,
    postsCount: 142,
    connected: true,
    connectedAt: "2026-08-20",
    isVerified: true,
  },
  youtube: {
    platform: "youtube",
    handle: "@SYNTAX_Tech",
    displayName: "SYNTAX AI Official",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80",
    followers: 28900,
    postsCount: 34,
    connected: false,
  },
  x: {
    platform: "x",
    handle: "@philipp_steidle",
    displayName: "Philipp Steidle ⚡",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    followers: 18400,
    postsCount: 890,
    connected: true,
    connectedAt: "2026-07-10",
    isVerified: true,
  },
  linkedin: {
    platform: "linkedin",
    handle: "in/philipp-steidle",
    displayName: "Philipp Steidle (Founder & AI Systems)",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    followers: 9540,
    postsCount: 52,
    connected: false,
  },
};

export function getStoredAccounts(): Record<SocialPlatform, SocialAccountProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...INITIAL_ACCOUNTS, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Failed to read accounts", e);
  }
  return INITIAL_ACCOUNTS;
}

export function saveStoredAccounts(accounts: Record<SocialPlatform, SocialAccountProfile>): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.warn("Failed to persist accounts", e);
  }
}
