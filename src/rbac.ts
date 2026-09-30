// S.Y.N.T.A.X. Ecosystem Role-Based Access Control (RBAC) Architecture

export type UserRole = "LITE_ACCESS" | "OPERATOR" | "SOVEREIGN" | "CLOSED_BETA_TESTER";

export enum UserRoleEnum {
  LITE_ACCESS = "LITE_ACCESS",
  OPERATOR = "OPERATOR",
  SOVEREIGN = "SOVEREIGN",
  CLOSED_BETA_TESTER = "CLOSED_BETA_TESTER",
}

// Big Launch Promotion Data Interfaces
export interface PromoSession {
  isEarlyBird: boolean;
  isDiscordVerified: boolean;
  discordUsername?: string;
  bonusTokensClaimed?: number;
  promoTrialStartedAt: string | null; // ISO Date String e.g. "2026-07-29T12:00:00.000Z"
  promoTrialExpiresAt: string | null; // ISO Date String e.g. 72 hours later
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  purchasedRole: UserRole; // Standard purchased/assigned role (e.g. LITE_ACCESS or OPERATOR)
  promoSession: PromoSession;
}

// Exactly 9 System-Agents in the S.Y.N.T.A.X. Matrix
export const AGENT_IDS = [
  "syntax",
  "maze",
  "neo",
  "vega",
  "odin",
  "pulse",
  "chronos",
  "oracle",
  "globe",
  "jarvis",
] as const;

export type AgentID = typeof AGENT_IDS[number];

export interface RoleTierMeta {
  role: UserRole;
  name: string;
  price: string;
  badgeColor: string;
  borderColor: string;
  description: string;
  allowedAgents: AgentID[];
}

// Role-Based Permissions Mapping
export const ROLE_PERMISSIONS: Record<UserRole, AgentID[]> = {
  LITE_ACCESS: ["syntax", "maze", "neo", "vega"],
  OPERATOR: ["syntax", "maze", "neo", "vega", "chronos", "odin", "pulse", "jarvis"],
  SOVEREIGN: [
    "syntax",
    "maze",
    "neo",
    "vega",
    "odin",
    "pulse",
    "chronos",
    "oracle",
    "globe",
    "jarvis",
  ],
  CLOSED_BETA_TESTER: [
    "syntax",
    "maze",
    "neo",
    "vega",
    "odin",
    "pulse",
    "chronos",
    "oracle",
    "globe",
    "jarvis",
  ],
};

export const ROLE_TIER_DETAILS: Record<UserRole, RoleTierMeta> = {
  LITE_ACCESS: {
    role: "LITE_ACCESS",
    name: "LITE ACCESS TIER",
    price: "29 €/mo",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    borderColor: "border-cyan-500/40",
    description: "Core Entry Suite (3 Agenten: S.Y.N.T.A.X., N.E.O., V.E.G.A.). Basic Matrix Compute.",
    allowedAgents: ROLE_PERMISSIONS.LITE_ACCESS,
  },
  OPERATOR: {
    role: "OPERATOR",
    name: "OPERATOR TIER",
    price: "29 €/mo",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    borderColor: "border-amber-500/40",
    description: "Trader & Dev Suite (7 Agenten). Inkl. C.H.R.O.N.O.S., O.D.I.N., P.U.L.S.E. & O.R.A.C.L.E.",
    allowedAgents: ROLE_PERMISSIONS.OPERATOR,
  },
  SOVEREIGN: {
    role: "SOVEREIGN",
    name: "SOVEREIGN MATRIX TIER",
    price: "99 €/mo",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    borderColor: "border-purple-500/40",
    description: "Quant VIP / Full 8-Core Matrix Access (Alle 8 Agenten: SYNTAX, NEO, VEGA, ODIN, PULSE, CHRONOS, ORACLE, GLOBE).",
    allowedAgents: ROLE_PERMISSIONS.SOVEREIGN,
  },
  CLOSED_BETA_TESTER: {
    role: "CLOSED_BETA_TESTER",
    name: "CLOSED BETA TESTER",
    price: "BETA ACCESS",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    borderColor: "border-emerald-500/40",
    description: "Closed Beta Tester Suite · Voller Zugriff auf alle 8 Cores zum Testen (Streng geschützt ohne Admin-Rechte).",
    allowedAgents: ROLE_PERMISSIONS.CLOSED_BETA_TESTER,
  },
};

/**
 * Helper function getActiveUserRole(user): UserRole
 * Calculates the user's active effective role considering Early Bird status,
 * Discord verification, and 72-hour trial window.
 *
 * 1. If user role is CLOSED_BETA_TESTER -> returns CLOSED_BETA_TESTER
 * 2. If isEarlyBird && isDiscordVerified AND current timestamp < promoTrialExpiresAt -> SOVEREIGN (Full Access)
 * 3. Otherwise -> fallback to standard purchasedRole
 */
export function getActiveUserRole(user: UserProfile | { purchasedRole: UserRole; promoSession: PromoSession }): UserRole {
  if (!user || !user.purchasedRole) {
    return "SOVEREIGN";
  }

  if (user.purchasedRole === "CLOSED_BETA_TESTER") {
    return "CLOSED_BETA_TESTER";
  }

  if (user.purchasedRole === "SOVEREIGN") {
    return "SOVEREIGN";
  }

  const { isEarlyBird, isDiscordVerified, promoTrialExpiresAt } = user.promoSession || {};

  if (isEarlyBird && isDiscordVerified && promoTrialExpiresAt) {
    const expiresMs = new Date(promoTrialExpiresAt).getTime();
    const nowMs = Date.now();
    if (!isNaN(expiresMs) && nowMs < expiresMs) {
      return "SOVEREIGN"; // Full Matrix Access (SOVEREIGN Tier)
    }
  }

  return user.purchasedRole || "SOVEREIGN";
}

/**
 * Checks if 72h promo trial is active
 */
export function isPromoTrialActive(promoSession: PromoSession): boolean {
  if (!promoSession?.isEarlyBird || !promoSession?.isDiscordVerified || !promoSession?.promoTrialExpiresAt) {
    return false;
  }
  const expiresMs = new Date(promoSession.promoTrialExpiresAt).getTime();
  return !isNaN(expiresMs) && Date.now() < expiresMs;
}

/**
 * Checks if 72h promo trial has expired
 */
export function isPromoTrialExpired(promoSession: PromoSession): boolean {
  if (!promoSession?.isEarlyBird || !promoSession?.isDiscordVerified || !promoSession?.promoTrialExpiresAt) {
    return false;
  }
  const expiresMs = new Date(promoSession.promoTrialExpiresAt).getTime();
  return !isNaN(expiresMs) && Date.now() >= expiresMs;
}

/**
 * Checks whether an agent is allowed for a given user role.
 */
export function isAgentAllowed(role: UserRole, agent: AgentID | string): boolean {
  if (!agent) return true;
  const norm = String(agent).toLowerCase();
  if (norm === "syntax" || norm === "maze" || norm === "neo" || norm === "globe" || role === "SOVEREIGN" || role === "CLOSED_BETA_TESTER") return true;
  const allowedList = ROLE_PERMISSIONS[role];
  if (!allowedList) return true;
  return allowedList.includes(agent as AgentID);
}

/**
 * Returns the minimum required role tier needed to unlock a specific agent.
 */
export function getMinRequiredRoleForAgent(agent: AgentID | string): UserRole {
  if (ROLE_PERMISSIONS.LITE_ACCESS.includes(agent as AgentID)) {
    return "LITE_ACCESS";
  }
  if (ROLE_PERMISSIONS.OPERATOR.includes(agent as AgentID)) {
    return "OPERATOR";
  }
  return "SOVEREIGN";
}

// Storage Keys
const USER_PROFILE_KEY = "maze_user_profile_v2";

/**
 * Gets stored user profile from localStorage or initializes a default Early Bird profile.
 */
export function getStoredUserProfile(): UserProfile {
  const now = new Date();
  const expires = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now

  const defaultProfile: UserProfile = {
    id: "usr_pioneer_01",
    name: "Matrix Operator",
    email: "operator@maze-matrix.io",
    purchasedRole: "SOVEREIGN", // Default to full Sovereign access directly for clean usage
    promoSession: {
      isEarlyBird: true,
      isDiscordVerified: false,
      discordUsername: undefined,
      promoTrialStartedAt: now.toISOString(),
      promoTrialExpiresAt: expires.toISOString(),
    },
  };

  try {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.promoSession) {
        // Clean up legacy fake Discord username or unverified states
        if (parsed.promoSession.discordUsername === "MatrixOperator#0001" || !parsed.promoSession.discordUsername) {
          parsed.promoSession.isDiscordVerified = false;
          parsed.promoSession.discordUsername = undefined;
        }
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error loading user profile from localStorage", e);
  }

  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
  } catch (e) {
    console.warn("Could not save initial profile", e);
  }

  return defaultProfile;
}

/**
 * Persists user profile to localStorage.
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving user profile to localStorage", e);
  }
}

/**
 * Helper to get saved user role (backwards compatibility).
 */
export function getStoredUserRole(): UserRole {
  const profile = getStoredUserProfile();
  return getActiveUserRole(profile);
}

/**
 * Helper to update base purchased role.
 */
export function saveUserRole(role: UserRole): void {
  const profile = getStoredUserProfile();
  profile.purchasedRole = role;
  saveUserProfile(profile);
}

/**
 * Get account-specific bonus tokens (awarded via rewards, discord connect, streaks, etc.)
 */
export function getBonusTokensForUser(userEmail?: string): number {
  if (typeof localStorage === "undefined") return 0;
  try {
    const emailKey = (userEmail || "default").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
    const stored = localStorage.getItem(`syntax_bonus_tokens_${emailKey}`);
    if (stored) return parseInt(stored, 10) || 0;
  } catch {}
  return 0;
}

/**
 * Grants bonus AI tokens to the user and broadcasts updates.
 */
export function grantBonusTokens(amount: number, userEmail?: string): number {
  if (typeof localStorage === "undefined") return 0;
  try {
    const emailKey = (userEmail || "default").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
    const current = getBonusTokensForUser(userEmail);
    const updated = current + amount;
    localStorage.setItem(`syntax_bonus_tokens_${emailKey}`, updated.toString());

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("syntax_bonus_tokens_updated", {
          detail: { bonusTokens: updated, amountAdded: amount, userEmail },
        })
      );
    }
    return updated;
  } catch (e) {
    console.warn("Could not grant bonus tokens", e);
    return 0;
  }
}

/**
 * Checks if 24-hour daily streak reward is available to claim.
 */
export function isDailyStreakClaimable(userEmail?: string): boolean {
  if (typeof localStorage === "undefined") return true;
  try {
    const emailKey = (userEmail || "default").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
    const lastClaim = localStorage.getItem(`syntax_last_daily_streak_claim_${emailKey}`);
    if (!lastClaim) return true;
    const lastMs = parseInt(lastClaim, 10);
    const diffHours = (Date.now() - lastMs) / (1000 * 60 * 60);
    return diffHours >= 20; // Allow every 20-24 hours
  } catch {
    return true;
  }
}

/**
 * Claims daily streak bonus (+5,000 Free Tokens).
 */
export function claimDailyStreakReward(userEmail?: string): { success: boolean; tokens: number; message: string } {
  if (!isDailyStreakClaimable(userEmail)) {
    return { success: false, tokens: 0, message: "Heute bereits abgeholt! Komme morgen wieder." };
  }
  const emailKey = (userEmail || "default").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  localStorage.setItem(`syntax_last_daily_streak_claim_${emailKey}`, Date.now().toString());
  const granted = grantBonusTokens(5000, userEmail);
  return { success: true, tokens: 5000, message: "+5.000 Free Tokens erfolgreich gutgeschrieben!" };
}

/**
 * Connects Discord account and initiates 72-hour Sovereign launch trial + grants 25,000 Free Tokens!
 */
export function connectDiscordToProfile(
  profile: UserProfile,
  discordUsername: string,
  bonusTokensAmount: number = 25000
): UserProfile {
  const now = new Date();
  const expires = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  // Grant 25,000 Free Tokens directly to account balance!
  grantBonusTokens(bonusTokensAmount, profile.email);

  const updated: UserProfile = {
    ...profile,
    promoSession: {
      ...profile.promoSession,
      isEarlyBird: true,
      isDiscordVerified: true,
      discordUsername: discordUsername.trim() || "DiscordUser",
      bonusTokensClaimed: (profile.promoSession?.bonusTokensClaimed || 0) + bonusTokensAmount,
      promoTrialStartedAt: profile.promoSession?.promoTrialStartedAt || now.toISOString(),
      promoTrialExpiresAt: expires.toISOString(),
    },
  };

  saveUserProfile(updated);
  return updated;
}

/**
 * Resets 72-hour trial timer for testing/demo purposes.
 */
export function reset72HourPromoTrial(profile: UserProfile, hoursFromNow: number = 72): UserProfile {
  const now = new Date();
  const expires = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);

  const updated: UserProfile = {
    ...profile,
    promoSession: {
      ...profile.promoSession,
      isEarlyBird: true,
      isDiscordVerified: true,
      promoTrialStartedAt: now.toISOString(),
      promoTrialExpiresAt: expires.toISOString(),
    },
  };

  saveUserProfile(updated);
  return updated;
}

/**
 * Simulates immediate expiration of the 72h trial.
 */
export function expirePromoTrialNow(profile: UserProfile): UserProfile {
  const past = new Date(Date.now() - 1000);

  const updated: UserProfile = {
    ...profile,
    promoSession: {
      ...profile.promoSession,
      promoTrialExpiresAt: past.toISOString(),
    },
  };

  saveUserProfile(updated);
  return updated;
}

