export type SocialPlatform = "tiktok" | "instagram" | "youtube" | "x" | "linkedin";

export type PostStatus = "published" | "scheduled" | "draft";

export type PostAspectRatio = "9:16" | "1:1" | "16:9" | "4:5";

export interface GlobeAuditMetrics {
  hookScore: string;
  retentionNote: string;
  hashtagImpact: string;
  viralAdvice: string;
  audioMomentum: string;
  estimatedFypReach: string;
}

export interface SocialPost {
  id: string;
  title: string;
  caption: string;
  platform: SocialPlatform;
  platforms?: SocialPlatform[]; // for cross-posting
  thumbnailUrl: string;
  mediaUrl?: string;
  mediaType: "video" | "image";
  aspectRatio: PostAspectRatio;
  status: PostStatus;
  scheduledFor?: string; // ISO string
  postedAt?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimePercent: number;
  viralityScore: number;
  soundTrack: string;
  hashtags: string[];
  globeAudit: GlobeAuditMetrics;
  creatorHandle: string;
}

export interface SocialAccountProfile {
  platform: SocialPlatform;
  handle: string;
  displayName: string;
  avatarUrl: string;
  followers: number;
  postsCount: number;
  connected: boolean;
  connectedAt?: string;
  isVerified?: boolean;
}

export interface ViralHookTemplate {
  id: string;
  category: "curiosity" | "story" | "provocative" | "data";
  label: string;
  hookText: string;
  captionDraft: string;
  hashtags: string[];
  score: number;
  estimatedRetention: string;
}
