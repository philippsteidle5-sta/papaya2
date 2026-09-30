import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Brain,
  ShieldCheck,
  TrendingUp,
  Search,
  Check,
  Lock,
  Flame,
  Star,
  Trophy,
  Filter,
  MessageSquare,
  Coins,
  ExternalLink,
  ArrowRight,
  Terminal,
  Share2,
  Layers,
  Calendar,
} from "lucide-react";
import {
  UserRole,
  ROLE_TIER_DETAILS,
  UserProfile,
  getStoredUserProfile,
  saveUserProfile,
  getBonusTokensForUser,
  grantBonusTokens,
  connectDiscordToProfile,
  isDailyStreakClaimable,
  claimDailyStreakReward,
} from "../rbac";
import { AgentConfig, Message } from "../types";
import { getCurrentUserEmail } from "../utils/leadDatabase";

export interface ChallengeItem {
  id: string;
  category: "neural" | "automation" | "quant" | "security" | "master";
  title: string;
  description: string;
  rewardPoints: number;
  autoCheckFn?: (data: ChallengeCheckData) => boolean;
}

export interface ChallengeCheckData {
  agentChats: Record<string, Message[]>;
  userRole: UserRole;
  agentsCount: number;
}

export const ALL_40_CHALLENGES: ChallengeItem[] = [
  // CATEGORY 1: NEURAL CORE & AI PROMPTS (1-8)
  {
    id: "c1",
    category: "neural",
    title: "1. First Contact",
    description: "Sende deine erste Nachricht an einen beliebigen S.Y.N.T.A.X. Agenten.",
    rewardPoints: 10,
    autoCheckFn: (d) => Object.values(d.agentChats).some(msgs => msgs && msgs.length > 0)
  },
  {
    id: "c2",
    category: "neural",
    title: "2. Token Synthesizer",
    description: "Generiere insgesamt mehr als 10 Chat-Nachrichten im System.",
    rewardPoints: 15,
    autoCheckFn: (d) => Object.values(d.agentChats).reduce((acc, m) => acc + (m ? m.length : 0), 0) >= 10
  },
  {
    id: "c3",
    category: "neural",
    title: "3. Deep Brain Prompt",
    description: "Formuliere eine ausführliche Anfrage mit mehr als 80 Zeichen.",
    rewardPoints: 15,
    autoCheckFn: (d) => Object.values(d.agentChats).some(msgs => msgs && msgs.some(m => m.content && m.content.length > 80))
  },
  {
    id: "c4",
    category: "neural",
    title: "4. Multi-Agent Pioneer",
    description: "Nutze und tausche dich mit mindestens 3 verschiedenen Agenten aus.",
    rewardPoints: 20,
    autoCheckFn: (d) => Object.keys(d.agentChats).filter(k => d.agentChats[k] && d.agentChats[k].length > 0).length >= 3
  },
  {
    id: "c5",
    category: "neural",
    title: "5. JARVIS Copilot Terminal",
    description: "Starte ein Quick-Command im JARVIS Copilot Terminal.",
    rewardPoints: 15
  },
  {
    id: "c6",
    category: "neural",
    title: "6. Multimodal Visual Input",
    description: "Lade ein Bild oder ein Diagramm in den Chatbereich eines Agenten hoch.",
    rewardPoints: 20
  },
  {
    id: "c7",
    category: "neural",
    title: "7. Voice Synthesizer Toggle",
    description: "Aktiviere oder deaktiviere die Sprach- und Audioausgabe im Matrix Rail.",
    rewardPoints: 10
  },
  {
    id: "c8",
    category: "neural",
    title: "8. Agent Persona Customizer",
    description: "Öffne das Prompt-Customizer Menü für einen Core-Agenten.",
    rewardPoints: 15
  },

  // CATEGORY 2: AUTOMATION & SOCIAL MATRIX (9-16)
  {
    id: "c9",
    category: "automation",
    title: "9. TikTok Script Generator",
    description: "Generiere ein virales TikTok Skript im Social Media Hub.",
    rewardPoints: 20
  },
  {
    id: "c10",
    category: "automation",
    title: "10. Instagram Reel Automated Pitch",
    description: "Erstelle ein 15-Sekunden Reel Skript mit dem Social Content Agenten.",
    rewardPoints: 20
  },
  {
    id: "c11",
    category: "automation",
    title: "11. Gmail Inbox AI Reply",
    description: "Öffne das Gmail Widget und bereite eine intelligente KI-Antwort vor.",
    rewardPoints: 15
  },
  {
    id: "c12",
    category: "automation",
    title: "12. Action Hub Macro Execution",
    description: "Führe eine Macro-Aktion im S.Y.N.T.A.X. Action Hub aus.",
    rewardPoints: 15
  },
  {
    id: "c13",
    category: "automation",
    title: "13. Quantum Web Browser Launch",
    description: "Starte das Quantum Web Browser Widget aus der Navigationsleiste.",
    rewardPoints: 10
  },
  {
    id: "c14",
    category: "automation",
    title: "14. App Store Widgets Discovery",
    description: "Erkunden Sie verfügbare Widgets im S.Y.N.T.A.X. App Store.",
    rewardPoints: 10
  },
  {
    id: "c15",
    category: "automation",
    title: "15. Dual-Agent Compare Mode",
    description: "Aktiviere den Side-by-Side Vergleichsmodus für 2 Agenten gleichzeitig.",
    rewardPoints: 20
  },
  {
    id: "c16",
    category: "automation",
    title: "16. Hologram 3D Projection",
    description: "Schalte den 3D Hologramm-Projektionsmodus für einen Core frei.",
    rewardPoints: 25
  },

  // CATEGORY 3: QUANT & FINANCIAL ANALYTICS (17-24)
  {
    id: "c17",
    category: "quant",
    title: "17. Quant Trading Terminal Boot",
    description: "Öffne das professionelle Quant Trading Terminal Widget.",
    rewardPoints: 15
  },
  {
    id: "c18",
    category: "quant",
    title: "18. Bitcoin Technical Analysis",
    description: "Befrage VEGA nach einer technischer Marktanalyse für BTC/USDT.",
    rewardPoints: 20,
    autoCheckFn: (d) => d.agentChats["vega"] && d.agentChats["vega"].length > 0
  },
  {
    id: "c19",
    category: "quant",
    title: "19. Quantitative Backtesting",
    description: "Führe eine 30-Tage Algorithmus-Backtest-Abfrage durch.",
    rewardPoints: 25
  },
  {
    id: "c20",
    category: "quant",
    title: "20. Portfolio Risk Scan",
    description: "Starte eine Risikobewertung deines virtuellen Krypto-Portfolios.",
    rewardPoints: 20
  },
  {
    id: "c21",
    category: "quant",
    title: "21. Order Flow Depth Inspection",
    description: "Prüfe das Live-Orderbuch und die Liquidität im Trading View.",
    rewardPoints: 15
  },
  {
    id: "c22",
    category: "quant",
    title: "22. Volatility Surface Analysis",
    description: "Berechne implizite Volatilitätsdaten mit ORACLE.",
    rewardPoints: 20
  },
  {
    id: "c23",
    category: "quant",
    title: "23. Automated Trading Signal",
    description: "Erstelle ein automatisches Buy/Sell Signal in VEGA.",
    rewardPoints: 25
  },
  {
    id: "c24",
    category: "quant",
    title: "24. High Frequency Arbitrage Query",
    description: "Simuliere eine Arbitrage-Opportunität über 3 DEX-Börsen.",
    rewardPoints: 25
  },

  // CATEGORY 4: SECURITY & ACCESS TIER (25-32)
  {
    id: "c25",
    category: "security",
    title: "25. RBAC Tier Audit",
    description: "Öffne den Role & Access Tier Manager.",
    rewardPoints: 10
  },
  {
    id: "c26",
    category: "security",
    title: "26. Operator Level Access",
    description: "Erreiche oder wähle die OPERATOR Zugriffsstufe ($99/mo Tarif).",
    rewardPoints: 20,
    autoCheckFn: (d) => d.userRole === "OPERATOR" || d.userRole === "SOVEREIGN"
  },
  {
    id: "c27",
    category: "security",
    title: "27. Sovereign Level Clearance",
    description: "Aktiviere die höchste SOVEREIGN Matrix Stufe (99 €/mo Tarif).",
    rewardPoints: 30,
    autoCheckFn: (d) => d.userRole === "SOVEREIGN"
  },
  {
    id: "c28",
    category: "security",
    title: "28. Gemini API Key Configuration",
    description: "Hinterlege einen eigenen Gemini 2.5/3.0 API Key in den Einstellungen.",
    rewardPoints: 20
  },
  {
    id: "c29",
    category: "security",
    title: "29. Zero-Trust Access Protocol",
    description: "Überprüfe die Berechtigungen aller 8 Core Agenten.",
    rewardPoints: 15
  },
  {
    id: "c30",
    category: "security",
    title: "30. Session Persistence Lock",
    description: "Speichere deine Matrix-Einstellungen in der lokalen Verschlüsselung.",
    rewardPoints: 15
  },
  {
    id: "c31",
    category: "security",
    title: "31. Diagnostic Matrix Health Check",
    description: "Führe eine komplette Systemdiagnose in den Einstellungen aus.",
    rewardPoints: 15
  },
  {
    id: "c32",
    category: "security",
    title: "32. Sovereign Vault Encryption",
    description: "Verschlüssele deine lokalen Chatverläufe im Sicherheitscenter.",
    rewardPoints: 20
  },

  // CATEGORY 5: CONSTELLATION & SYSTEM MASTER (33-40)
  {
    id: "c33",
    category: "master",
    title: "33. 8-Core Constellation View",
    description: "Öffne die 3D Neuronale Konstellations-Ansicht.",
    rewardPoints: 15
  },
  {
    id: "c34",
    category: "master",
    title: "34. Orbit Node Navigation",
    description: "Klicke auf einen rotierten Core-Knoten in der Konstellation.",
    rewardPoints: 15
  },
  {
    id: "c35",
    category: "master",
    title: "35. Particle Sphere Alignment",
    description: "Interagiere mit der Particle Sphere Partikel-Visualisierung.",
    rewardPoints: 15
  },
  {
    id: "c36",
    category: "master",
    title: "36. Layout Grid Customizer",
    description: "Passe das Widget-Raster an deine persönlichen Präferenzen an.",
    rewardPoints: 20
  },
  {
    id: "c37",
    category: "master",
    title: "37. Focus Mode Activation",
    description: "Schalte den ablenkungsfreien Focus Mode Vollbildmodus ein.",
    rewardPoints: 15
  },
  {
    id: "c38",
    category: "master",
    title: "38. System Audio Matrix Tuning",
    description: "Stelle die Hintergrund-Soundkulisse und Effekte individuell ein.",
    rewardPoints: 15
  },
  {
    id: "c39",
    category: "master",
    title: "39. Matrix Community Share",
    description: "Erstelle einen Teilen-Link für deine S.Y.N.T.A.X. Konfiguration.",
    rewardPoints: 20
  },
  {
    id: "c40",
    category: "master",
    title: "40. SYNTAX CORE SOVEREIGN MASTER",
    description: "Schließe alle 40 Quests ab, um 1 MONAT GRATIS SYNTAX CORE einzulösen!",
    rewardPoints: 50
  }
];

interface MazeRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
  agentChats?: Record<string, Message[]>;
  agents?: AgentConfig[];
  userProfile?: UserProfile;
  onUpdateProfile?: (p: UserProfile) => void;
  onOpenRoleManager?: () => void;
}

export const MazeRewardModal: React.FC<MazeRewardModalProps> = ({
  isOpen,
  onClose,
  userRole = "SOVEREIGN" as UserRole,
  onSelectRole,
  agentChats = {},
  agents = [],
  userProfile: propUserProfile,
  onUpdateProfile,
  onOpenRoleManager,
}) => {
  // Tabs: "tokens" (Free Token Drops & Discord) vs "challenges" (40 Matrix Challenges)
  const [activeTab, setActiveTab] = useState<"tokens" | "challenges">("tokens");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Resolve user profile & email
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    return propUserProfile || getStoredUserProfile();
  });

  useEffect(() => {
    if (propUserProfile) {
      setCurrentProfile(propUserProfile);
    } else {
      setCurrentProfile(getStoredUserProfile());
    }
  }, [propUserProfile, isOpen]);

  const userEmail = currentProfile?.email || getCurrentUserEmail();

  // Track live bonus tokens for this user
  const [bonusTokens, setBonusTokens] = useState<number>(() => getBonusTokensForUser(userEmail));

  // Discord connection form state
  const [discordTagInput, setDiscordTagInput] = useState<string>(
    currentProfile?.promoSession?.discordUsername || ""
  );
  const [isDiscordSaving, setIsDiscordSaving] = useState(false);

  // Daily Streak state
  const [streakClaimable, setStreakClaimable] = useState<boolean>(() => isDailyStreakClaimable(userEmail));

  // Quest claims store (one-time bonus token quests)
  const [claimedQuestIds, setClaimedQuestIds] = useState<Set<string>>(() => {
    try {
      const emailKey = (userEmail || "default").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
      const saved = localStorage.getItem(`syntax_claimed_reward_quests_${emailKey}`);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set<string>();
  });

  // Celebration state
  const [celebration, setCelebration] = useState<{
    title: string;
    message: string;
    tokens?: number;
  } | null>(null);

  // 40 Challenges completion state
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("maze_40_challenges_completed_ids_v1");
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {
      console.warn("Could not load challenge state", e);
    }
    return new Set<string>();
  });

  const [rewardClaimed, setRewardClaimed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("jarvis_maze_reward_claimed_v1") === "true";
    } catch {
      return false;
    }
  });

  // Sync bonus tokens when window event fires
  useEffect(() => {
    const handleBonusUpdated = () => {
      setBonusTokens(getBonusTokensForUser(userEmail));
      setStreakClaimable(isDailyStreakClaimable(userEmail));
    };
    window.addEventListener("syntax_bonus_tokens_updated", handleBonusUpdated);
    return () => window.removeEventListener("syntax_bonus_tokens_updated", handleBonusUpdated);
  }, [userEmail]);

  // Automatically check 40 challenges
  useEffect(() => {
    const checkData: ChallengeCheckData = {
      agentChats,
      userRole,
      agentsCount: agents.length,
    };

    const newCompleted = new Set(completedIds);
    let changed = false;

    ALL_40_CHALLENGES.forEach((ch) => {
      if (ch.autoCheckFn && ch.autoCheckFn(checkData)) {
        if (!newCompleted.has(ch.id)) {
          newCompleted.add(ch.id);
          changed = true;
        }
      }
    });

    if (changed) {
      setCompletedIds(newCompleted);
      try {
        localStorage.setItem("maze_40_challenges_completed_ids_v1", JSON.stringify(Array.from(newCompleted)));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [agentChats, userRole, agents]);

  if (!isOpen) return null;

  // Handle Discord linking & award 25,000 Free Tokens
  const handleConnectDiscord = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = discordTagInput.trim() || "DiscordPioneer";
    setIsDiscordSaving(true);

    const updated = connectDiscordToProfile(currentProfile, tag, 25000);
    setCurrentProfile(updated);
    if (onUpdateProfile) onUpdateProfile(updated);

    const newTokens = getBonusTokensForUser(userEmail);
    setBonusTokens(newTokens);
    setIsDiscordSaving(false);

    setCelebration({
      title: "DISCORD AIRDROP FREIGESCHALTET! 🎉",
      message: "Deinem Account wurden +25.000 Free AI-Tokens und 72h Sovereign Full Access gutgeschrieben.",
      tokens: 25000,
    });
  };

  // Handle Daily Streak claim
  const handleClaimDailyStreak = () => {
    const result = claimDailyStreakReward(userEmail);
    if (result.success) {
      setBonusTokens(getBonusTokensForUser(userEmail));
      setStreakClaimable(false);
      setCelebration({
        title: "TÄGLICHER DROP EINGELÖST! ⚡",
        message: "+5.000 Free Tokens wurden erfolgreich auf dein tägliches Kontingent gebucht.",
        tokens: 5000,
      });
    }
  };

  // Handle Quest claim
  const handleClaimQuest = (questId: string, tokens: number, questName: string) => {
    if (claimedQuestIds.has(questId)) return;

    grantBonusTokens(tokens, userEmail);
    const updated = new Set(claimedQuestIds);
    updated.add(questId);
    setClaimedQuestIds(updated);

    try {
      const emailKey = (userEmail || "default").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
      localStorage.setItem(`syntax_claimed_reward_quests_${emailKey}`, JSON.stringify(Array.from(updated)));
    } catch {}

    setBonusTokens(getBonusTokensForUser(userEmail));
    setCelebration({
      title: "QUEST ABGESCHLOSSEN! 🏆",
      message: `Herzlichen Glückwunsch! Du hast +${tokens.toLocaleString("de-DE")} Free Tokens für "${questName}" erhalten!`,
      tokens,
    });
  };

  // 40 Challenges toggle
  const toggleChallenge = (id: string) => {
    const next = new Set(completedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCompletedIds(next);
    try {
      localStorage.setItem("maze_40_challenges_completed_ids_v1", JSON.stringify(Array.from(next)));
    } catch (e) {
      console.warn(e);
    }
  };

  const completedCount = completedIds.size;
  const totalCount = ALL_40_CHALLENGES.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));
  const isRewardReady = completedCount >= 25 || completedCount === 40;

  const handleClaimFullMonthFree = () => {
    setRewardClaimed(true);
    setCelebration({
      title: "1 MONAT GRATIS ABO AKTIVIERT! 🏆",
      message: `Du hast ${completedCount} Challenges gemeistert! 1 Monat kostenloser Zugang für den ${ROLE_TIER_DETAILS[userRole].name} Tarif ist nun aktiv.`,
    });
    try {
      localStorage.setItem("jarvis_maze_reward_claimed_v1", "true");
    } catch (e) {
      console.warn(e);
    }
  };

  const isDiscordVerified = Boolean(currentProfile?.promoSession?.isDiscordVerified);
  const discordUsername = currentProfile?.promoSession?.discordUsername || "";

  // Filter 40 challenges
  const filteredChallenges = ALL_40_CHALLENGES.filter((ch) => {
    const matchesCat = selectedCategory === "all" || ch.category === selectedCategory;
    const matchesSearch =
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryCounts = {
    all: ALL_40_CHALLENGES.length,
    neural: ALL_40_CHALLENGES.filter((c) => c.category === "neural").length,
    automation: ALL_40_CHALLENGES.filter((c) => c.category === "automation").length,
    quant: ALL_40_CHALLENGES.filter((c) => c.category === "quant").length,
    security: ALL_40_CHALLENGES.filter((c) => c.category === "security").length,
    master: ALL_40_CHALLENGES.filter((c) => c.category === "master").length,
  };

  // Quests definitions
  const hasSentAnyMessage = Object.values(agentChats).some((msgs) => Array.isArray(msgs) && msgs.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl bg-slate-900/95 border border-amber-500/40 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* GOLD GLOW ACCENT BAR */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500 animate-pulse" />

        {/* CELEBRATION MODAL OVERLAY */}
        {celebration && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-bounce">
              {celebration.tokens ? <Coins className="w-10 h-10 text-amber-300" /> : <Trophy className="w-10 h-10 text-amber-300" />}
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl text-white tracking-wide mb-2">
              {celebration.title}
            </h2>
            {celebration.tokens && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 font-mono text-base font-black my-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                +{celebration.tokens.toLocaleString("de-DE")} FREE TOKENS
              </div>
            )}
            <p className="font-mono text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
              {celebration.message}
            </p>
            <button
              onClick={() => setCelebration(null)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono font-bold text-sm uppercase transition cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95"
            >
              Tokens im System nutzen 🚀
            </button>
          </div>
        )}

        {/* TOP HEADER */}
        <div className="p-4 md:p-6 border-b border-amber-500/20 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                S.Y.N.T.A.X. REWARD & AIRDROP HUB
              </span>
              <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Free Tokens & Quests
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-wide flex items-center gap-3">
              Rewards, Drops & Gratis Tokens 🎁
            </h1>
            <p className="font-mono text-xs text-slate-400 mt-1">
              Verknüpfe Discord für <strong>+25.000 Tokens</strong>, hole dir tägliche Drops ab oder meistere Quests für zusätzliche Kontingente!
            </p>
          </div>

          {/* User Live Balance Card */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="font-mono text-left">
                <div className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                  <span>DEINE BONUS-TOKENS</span>
                  {bonusTokens > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div className="text-base font-black text-amber-300">
                  +{bonusTokens.toLocaleString("de-DE")}{" "}
                  <span className="text-[10px] font-normal text-zinc-400">Tokens</span>
                </div>
                <div className="text-[9px] text-emerald-400 font-semibold">
                  Tageslimit: {(50000 + bonusTokens).toLocaleString("de-DE")} Tokens
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/20 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer shrink-0"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-4 md:px-6 bg-slate-950 border-b border-amber-500/20 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 font-mono text-xs py-2">
            <button
              onClick={() => setActiveTab("tokens")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === "tokens"
                  ? "bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Coins className="w-4 h-4 text-amber-300" />
              <span>🎁 FREE TOKEN DROPS & DISCORD</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400/30 text-amber-200 text-[10px]">
                NEU
              </span>
            </button>

            <button
              onClick={() => setActiveTab("challenges")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === "challenges"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>🏆 40 MATRIX CHALLENGES (1 MONAT ABO)</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                {completedCount}/40
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>Konto:</span>
            <span className="text-cyan-300 font-bold truncate max-w-[180px]">{userEmail}</span>
          </div>
        </div>

        {/* TAB 1: FREE TOKEN AIRDROPS & DISCORD REWARDS */}
        {activeTab === "tokens" && (
          <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* HERO CARDS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* CARD 1: DISCORD VERKNÜPFUNG */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/50 border-2 border-indigo-500/40 relative overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.25)] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                          HAUPT-BELOHNUNG • AIRDROP
                        </div>
                        <h3 className="font-display font-extrabold text-lg text-white">
                          Discord Verknüpfung
                        </h3>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      +25.000 TOKENS
                    </div>
                  </div>

                  <p className="font-mono text-xs text-slate-300 mb-4 leading-relaxed">
                    Verknüpfe deinen Discord-Account und trete unserer Community bei, um sofort <strong>25.000 Free AI-Tokens</strong> und <strong>72 Stunden Sovereign Tier</strong> mit allen 9 Agenten freizuschalten!
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-950/70 border border-indigo-500/20 flex items-center gap-2 text-slate-300">
                      <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>+25.000 Tokens sofort</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/70 border border-indigo-500/20 flex items-center gap-2 text-slate-300">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>72h Sovereign Full Tier</span>
                    </div>
                  </div>
                </div>

                {/* Form or Verified State */}
                {isDiscordVerified ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>DISCORD VERKNÜPFT: @{discordUsername}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        AKTIV
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      +25.000 Bonus-Tokens wurden deinem Konto gutgeschrieben.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="https://discord.gg/4D6mb4xbVr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#5865F2]/40 hover:bg-[#5865F2]/60 border border-[#5865F2]/60 text-indigo-100 text-[11px] font-bold flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(88,101,242,0.3)]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        SYNTAX Discord Server öffnen (discord.gg/4D6mb4xbVr)
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConnectDiscord} className="space-y-3 font-mono">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold block">
                        DEIN DISCORD USERNAME:
                      </label>
                      <input
                        type="text"
                        value={discordTagInput}
                        onChange={(e) => setDiscordTagInput(e.target.value)}
                        placeholder="z.B. matrix_user#1234 oder cyberking"
                        className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="submit"
                        disabled={isDiscordSaving}
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.5)] transition cursor-pointer flex items-center justify-center gap-2 text-xs active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        VERKNÜPFEN & +25.000 TOKENS CLAIMEN 🎁
                      </button>

                      <a
                        href="https://discord.gg/4D6mb4xbVr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-[#5865F2]/20 border border-[#5865F2]/50 hover:bg-[#5865F2]/40 text-indigo-200 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-[0_0_12px_rgba(88,101,242,0.2)] font-bold"
                        title="Offiziellen Discord Server besuchen (Permanent Link)"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
                        Discord Server
                      </a>
                    </div>
                  </form>
                )}
              </div>

              {/* CARD 2: TÄGLICHER LOGIN STREAK DROP */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-yellow-950/40 border-2 border-amber-500/40 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                        <Flame className="w-6 h-6 animate-pulse text-amber-400" />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          TÄGLICHER DROP • 24H REWARD
                        </div>
                        <h3 className="font-display font-extrabold text-lg text-white">
                          Daily Matrix Streak
                        </h3>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      +5.000 TOKENS / TAG
                    </div>
                  </div>

                  <p className="font-mono text-xs text-slate-300 mb-4 leading-relaxed">
                    Komm jeden Tag zurück in das S.Y.N.T.A.X. OS und hole dir deine kostenlosen <strong>5.000 AI-Tokens</strong> ab. Dein Kontingent wird sofort erweitert!
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 mb-4 font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Status heute:</span>
                      {streakClaimable ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> BEREIT ZUM CLAIMEN
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> BEREITS EINGELÖST
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {streakClaimable
                        ? "Klicke unten, um deine 5.000 Tokens für heute zu aktivieren."
                        : "Nächster Streak-Drop steht morgen um 00:00 Uhr wieder bereit!"}
                    </div>
                  </div>
                </div>

                <div>
                  {streakClaimable ? (
                    <button
                      onClick={handleClaimDailyStreak}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 animate-bounce"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      TÄGLICHEN DROP CLAIMEN (+5.000 TOKENS) ⚡
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-950 border border-amber-500/30 text-emerald-400 font-mono text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 cursor-default"
                    >
                      <Check className="w-4 h-4" />
                      HEUTE BEREITS ABGEHOLT (+5.000 TOKENS)
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* INSTANT BONUS TOKEN QUESTS */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Zusätzliche Matrix Token Quests
                </h3>
                <span className="text-xs text-slate-400">
                  {claimedQuestIds.size} abgeschlossen
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* QUEST 1: FIRST QUERY */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  claimedQuestIds.has("quest_first_query")
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                    : "bg-slate-950/70 border-slate-800 hover:border-amber-500/40 text-slate-200"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                        <Brain className="w-4 h-4" />
                      </div>
                      <span className="text-amber-300 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        +10.000 Tokens
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mb-1">
                      1. Multi-Agent Prompt
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      Sende eine Abfrage an einen der 9 Spezial-Agenten im System.
                    </p>
                  </div>

                  {claimedQuestIds.has("quest_first_query") ? (
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 py-1">
                      <Check className="w-3.5 h-3.5" /> Eingelöst (+10.000)
                    </div>
                  ) : hasSentAnyMessage ? (
                    <button
                      onClick={() => handleClaimQuest("quest_first_query", 10000, "1. Multi-Agent Prompt")}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    >
                      CLAIM (+10K) 🎁
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500 py-1">
                      Noch nicht ausgeführt (Chatte mit einem Agenten)
                    </div>
                  )}
                </div>

                {/* QUEST 2: CLAUDE CODE TERMINAL */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  claimedQuestIds.has("quest_claude_code")
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                    : "bg-slate-950/70 border-slate-800 hover:border-amber-500/40 text-slate-200"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <span className="text-amber-300 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        +15.000 Tokens
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mb-1">
                      Claude Code Engine
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      Öffne das Terminal oder führe einen KI-Code-Befehl aus.
                    </p>
                  </div>

                  {claimedQuestIds.has("quest_claude_code") ? (
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 py-1">
                      <Check className="w-3.5 h-3.5" /> Eingelöst (+15.000)
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimQuest("quest_claude_code", 15000, "Claude Code Engine")}
                      className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    >
                      CLAIM (+15K) 🚀
                    </button>
                  )}
                </div>

                {/* QUEST 3: WORKSPACE INTEGRATION */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  claimedQuestIds.has("quest_workspace")
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                    : "bg-slate-950/70 border-slate-800 hover:border-amber-500/40 text-slate-200"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-amber-300 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        +20.000 Tokens
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mb-1">
                      Google Workspace Sync
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      Verbinde dein Google Workspace (Gmail / Kalender) für Live-Automationen.
                    </p>
                  </div>

                  {claimedQuestIds.has("quest_workspace") ? (
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 py-1">
                      <Check className="w-3.5 h-3.5" /> Eingelöst (+20.000)
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimQuest("quest_workspace", 20000, "Google Workspace Sync")}
                      className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    >
                      CLAIM (+20K) ✨
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: 40 MATRIX CHALLENGES (1 MONAT GRATIS ABO) */}
        {activeTab === "challenges" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* REWARD PROGRESS HERO BAR */}
            <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-slate-950 via-amber-950/20 to-purple-950/30 border-b border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Progress Bar */}
              <div className="w-full md:w-2/3 font-mono">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                    Fortschritt: {completedCount} von {totalCount} Challenges ({progressPercent}%)
                  </span>
                  <span className="text-slate-400">
                    Ziel: Mind. 25/40 für 1 Monat Gratis
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-3 border border-amber-500/30 p-0.5 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Claim Button */}
              <div className="w-full md:w-auto flex-shrink-0 font-mono">
                {rewardClaimed ? (
                  <button
                    disabled
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-default"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    1 MONAT GRATIS BEREITS AKTIVIERT 🎉
                  </button>
                ) : isRewardReady ? (
                  <button
                    onClick={handleClaimFullMonthFree}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 animate-bounce"
                  >
                    <Gift className="w-4 h-4" />
                    1 MONAT ABO KOSTENLOS JETZT EINLÖSEN 🚀
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-slate-500 text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                  >
                    <Lock className="w-4 h-4 text-amber-500/70" />
                    SPERRE ({completedCount}/25 Challenges für Unlock)
                  </button>
                )}
              </div>
            </div>

            {/* CONTROLS: CATEGORIES & SEARCH */}
            <div className="p-4 md:px-6 bg-slate-950/80 border-b border-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1.5 text-xs w-full sm:w-auto">
                {[
                  { id: "all", label: `Alle (${categoryCounts.all})` },
                  { id: "neural", label: `🧠 Neural (${categoryCounts.neural})` },
                  { id: "automation", label: `⚡ Automation (${categoryCounts.automation})` },
                  { id: "quant", label: `📈 Quant (${categoryCounts.quant})` },
                  { id: "security", label: `🛡️ Security (${categoryCounts.security})` },
                  { id: "master", label: `🌌 Master (${categoryCounts.master})` },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                      selectedCategory === cat.id
                        ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Challenge suchen..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* CHALLENGES LIST GRID */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
              {filteredChallenges.map((ch) => {
                const isDone = completedIds.has(ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => toggleChallenge(ch.id)}
                    className={`p-3.5 rounded-xl border transition duration-200 cursor-pointer flex items-start justify-between gap-3 ${
                      isDone
                        ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-amber-500/40 hover:bg-amber-950/10 text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                          isDone
                            ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_8px_#10b981]"
                            : "bg-slate-900 border-slate-700 text-transparent hover:border-amber-400"
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-bold ${isDone ? "text-emerald-300 line-through opacity-80" : "text-white"}`}>
                            {ch.title}
                          </span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                            +{ch.rewardPoints} XP
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {ch.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isDone ? (
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded font-bold uppercase">
                          GELÖST
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-400/70 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold uppercase">
                          OFFEN
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>S.Y.N.T.A.X. MATRIX REWARD ENGINE</span>
            <span>•</span>
            <span className="text-amber-400">+{bonusTokens.toLocaleString("de-DE")} Free Tokens Aktiv</span>
          </div>
          <div>
            AKTUELLER TARIF: <strong className="text-amber-300">{userRole}</strong> ({ROLE_TIER_DETAILS[userRole]?.price || "€0/Monat"})
          </div>
        </div>

      </div>
    </div>
  );
};
