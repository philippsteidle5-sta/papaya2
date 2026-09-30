// S.Y.N.T.A.X. Sovereign OS - Daily Usage Analytics Store
// Tracks token consumption, compute time, agent core distribution, and automatic midnight (00:00) day-rollover.
// All telemetry and token balances are strictly isolated per user account (50,000 tokens quota per account).

import {
  getCurrentUserEmail,
  SUPERADMIN_EMAIL,
  isSuperAdminEmail,
  isStoredAdminAuthenticated,
  getActiveAccessKey,
  getAccessKeysDatabase,
  getLeadsDatabase,
} from "./leadDatabase";
import { getBonusTokensForUser } from "../rbac";

export interface DayUsageRecord {
  date: string; // YYYY-MM-DD
  dayName: string; // "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"
  formattedDate: string; // "20. Aug"
  tokens: number;
  queries: number;
  computeMinutes: number;
  peakHour: string;
  isPreCreation?: boolean;
}

export interface AgentUsageStats {
  agentId: string;
  name: string;
  short: string;
  color: string;
  roleTag: string;
  queries: number;
  tokens: number;
  percentage: number;
}

export interface DailyUsageMetrics {
  userEmail: string;
  accountCreatedAt: string;
  accountCreatedDateFormatted: string;
  activeDaysCount: number;
  averageDailyTokens: number;
  averageDailyComputeMinutes: number;
  averageDailyQueries: number;
  todayTokens: number;
  todayComputeMinutes: number;
  todayQueries: number;
  dailyLimitTokens: number;
  bonusTokens: number;
  remainingTokensToday: number;
  percentUsedToday: number;
  efficiencyScore: number; // 0..100%
  weeklyChangePercent: number;
  activePlan: string;
  totalHistoricalTokens: number;
  history: DayUsageRecord[];
  agentBreakdown: AgentUsageStats[];
  hourlyDistribution: number[]; // 24 hours (0..23)
  lastUpdated: string;
}

export const AGENT_META = [
  { agentId: "syntax", name: "S.Y.N.T.A.X.", short: "SYNTAX", color: "#4ee8ff", roleTag: "SOVEREIGN ROUTER", defaultShare: 0.32 },
  { agentId: "neo", name: "N.E.O.", short: "NEO", color: "#ff2a8d", roleTag: "MATRIX MR & STRATEGY", defaultShare: 0.22 },
  { agentId: "vega", name: "V.E.G.A.", short: "VEGA", color: "#ef4444", roleTag: "DATA & CODE MATRIX", defaultShare: 0.16 },
  { agentId: "odin", name: "O.D.I.N.", short: "ODIN", color: "#e2f1ff", roleTag: "SECURITY & SCREEN VISION", defaultShare: 0.10 },
  { agentId: "pulse", name: "P.U.L.S.E.", short: "PULSE", color: "#a855f7", roleTag: "VIRAL CONTENT & VEO 3.1", defaultShare: 0.08 },
  { agentId: "chronos", name: "C.H.R.O.N.O.S.", short: "CHRONOS", color: "#eab308", roleTag: "TEMPORAL AUTOMATION", defaultShare: 0.05 },
  { agentId: "oracle", name: "O.R.A.C.L.E.", short: "ORACLE", color: "#22c55e", roleTag: "QUANT FINANCIAL INTEL", defaultShare: 0.04 },
  { agentId: "globe", name: "G.L.O.B.E.", short: "GLOBE", color: "#3b82f6", roleTag: "QUAD-CORE DEEP SEARCH", defaultShare: 0.03 },
];

const DAY_NAMES_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayNameDe(d: Date = new Date()): string {
  return DAY_NAMES_DE[d.getDay()];
}

export function getFormattedDateDe(d: Date = new Date()): string {
  return `${d.getDate()}. ${d.toLocaleDateString("de-DE", { month: "short" })}`;
}

/**
 * Get account-specific storage keys so User A and Admin/User B have completely separate token counters
 */
export function getAccountTelemetryStorageKey(userEmail?: string): string {
  let raw = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
  if (!raw && typeof localStorage !== "undefined") {
    try {
      const storedProfile = localStorage.getItem("maze_user_profile_v2");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed?.email) raw = parsed.email.trim().toLowerCase();
      }
    } catch {}
  }
  const clean = (raw || "sovereign_operator").replace(/[^a-z0-9]/g, "_");
  return `syntax_daily_usage_telemetry_v3_${clean}`;
}

export function getAccountAgentBreakdownStorageKey(userEmail?: string): string {
  let raw = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
  if (!raw && typeof localStorage !== "undefined") {
    try {
      const storedProfile = localStorage.getItem("maze_user_profile_v2");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed?.email) raw = parsed.email.trim().toLowerCase();
      }
    } catch {}
  }
  const clean = (raw || "sovereign_operator").replace(/[^a-z0-9]/g, "_");
  return `syntax_daily_agent_breakdown_v3_${clean}`;
}

/**
 * Accurately determines when this account or access key was created.
 * Prevents showing usage for days prior to account/key creation.
 */
export function getAccountCreationDate(userEmail?: string): Date {
  const now = new Date();
  let resolvedEmail = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();

  try {
    if (!resolvedEmail && typeof localStorage !== "undefined") {
      const storedProfile = localStorage.getItem("maze_user_profile_v2");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.email) resolvedEmail = parsed.email.trim().toLowerCase();
      }
    }
  } catch {}

  const clean = (resolvedEmail || "guest").replace(/[^a-z0-9]/g, "_");
  const localCreatedKey = `syntax_account_created_at_${clean}`;

  // 1. Check if user has an active redeemed key with createdAt
  try {
    const activeKey = getActiveAccessKey();
    if (activeKey?.createdAt) {
      const d = new Date(activeKey.createdAt);
      if (!isNaN(d.getTime())) {
        try { localStorage.setItem(localCreatedKey, d.toISOString()); } catch {}
        return d;
      }
    }
  } catch {}

  // 2. Check access keys database for matching key or email
  try {
    const keys = getAccessKeysDatabase();
    if (resolvedEmail.startsWith("key_")) {
      const keySnippet = resolvedEmail.replace(/^key_/, "").split("@")[0].replace(/[^a-z0-9]/g, "");
      const matched = keys.find((k) => k.key.toLowerCase().replace(/[^a-z0-9]/g, "") === keySnippet);
      if (matched?.createdAt) {
        const d = new Date(matched.createdAt);
        if (!isNaN(d.getTime())) {
          try { localStorage.setItem(localCreatedKey, d.toISOString()); } catch {}
          return d;
        }
      }
    }
  } catch {}

  // 3. Check leads database for registeredAt
  try {
    const leads = getLeadsDatabase();
    const lead = leads.find((l) => l.email.trim().toLowerCase() === resolvedEmail);
    if (lead?.registeredAt) {
      const d = new Date(lead.registeredAt);
      if (!isNaN(d.getTime())) {
        try { localStorage.setItem(localCreatedKey, d.toISOString()); } catch {}
        return d;
      }
    }
  } catch {}

  // 4. Check user profile for trial or registration start
  try {
    const storedProfile = localStorage.getItem("maze_user_profile_v2");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      const possibleDate = parsed?.promoSession?.promoTrialStartedAt || parsed?.createdAt;
      if (possibleDate) {
        const d = new Date(possibleDate);
        if (!isNaN(d.getTime())) {
          try { localStorage.setItem(localCreatedKey, d.toISOString()); } catch {}
          return d;
        }
      }
    }
  } catch {}

  // 5. Check explicitly stored account creation timestamp in localStorage
  try {
    const storedAt = localStorage.getItem(localCreatedKey);
    if (storedAt) {
      const d = new Date(storedAt);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }
  } catch {}

  // 6. First-time initialization: record today/now as the exact account creation moment
  try {
    localStorage.setItem(localCreatedKey, now.toISOString());
  } catch {}

  return now;
}

/**
 * Generate 14-day history with 0 tokens.
 * Days prior to account creation are marked isPreCreation: true and strictly have 0 tokens.
 */
export function generateFreshHistory(now: Date = new Date(), creationDate: Date = now): DayUsageRecord[] {
  const records: DayUsageRecord[] = [];
  const creationDateStr = getLocalDateString(creationDate);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = getLocalDateString(d);
    const isPreCreation = dateStr < creationDateStr;

    records.push({
      date: dateStr,
      dayName: DAY_NAMES_DE[d.getDay()],
      formattedDate: getFormattedDateDe(d),
      tokens: 0,
      queries: 0,
      computeMinutes: 0,
      peakHour: "-",
      isPreCreation,
    });
  }

  return records;
}

/**
 * Ensure records are synced to the current date and rolled over at midnight (00:00).
 * Sanitizes any invalid past tokens for dates before account/key creation.
 */
function syncAndEnsureRollover(userEmail?: string): { records: DayUsageRecord[]; hourly: number[]; todayRecord: DayUsageRecord } {
  const now = new Date();
  const todayStr = getLocalDateString(now);
  const resolvedEmail = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
  const storageKey = getAccountTelemetryStorageKey(resolvedEmail);
  const creationDate = getAccountCreationDate(resolvedEmail);
  const creationDateStr = getLocalDateString(creationDate);

  let records: DayUsageRecord[] = [];
  let hourly: number[] = new Array(24).fill(0);
  let needsSave = false;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.history) && parsed.history.length > 0) {
        records = parsed.history;
      }
      if (Array.isArray(parsed.hourlyDistribution) && parsed.hourlyDistribution.length === 24) {
        hourly = parsed.hourlyDistribution;
      }
    }
  } catch (e) {
    console.warn("Could not read daily usage storage", e);
  }

  if (records.length === 0) {
    records = generateFreshHistory(now, creationDate);
    hourly = new Array(24).fill(0);
    saveUsageRecords(records, hourly, resolvedEmail);
    resetAgentBreakdownForToday(todayStr, resolvedEmail);
  } else {
    // SANITIZATION: Check for invalid historical mock tokens on dates before creationDateStr
    records.forEach((r) => {
      if (r.date < creationDateStr) {
        if (r.tokens !== 0 || r.queries !== 0 || r.computeMinutes !== 0 || r.peakHour !== "-" || !r.isPreCreation) {
          r.tokens = 0;
          r.queries = 0;
          r.computeMinutes = 0;
          r.peakHour = "-";
          r.isPreCreation = true;
          needsSave = true;
        }
      } else {
        // Also eliminate legacy hardcoded mock values (e.g. 2850, 3420, 3980, etc.) on past days if the account was created today
        if (creationDateStr === todayStr && r.date < todayStr && (r.tokens > 0 || r.queries > 0)) {
          r.tokens = 0;
          r.queries = 0;
          r.computeMinutes = 0;
          r.peakHour = "-";
          r.isPreCreation = true;
          needsSave = true;
        }
      }
    });

    // Check if the last record matches today
    const lastRecord = records[records.length - 1];
    if (lastRecord.date !== todayStr) {
      // Midnight or new day has occurred!
      const lastDateParts = lastRecord.date.split("-").map(Number);
      const lastDate = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]);
      
      const oneDayMs = 24 * 60 * 60 * 1000;
      const daysDiff = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - lastDate.getTime()) / oneDayMs);

      if (daysDiff > 0 && daysDiff < 30) {
        for (let step = 1; step <= daysDiff; step++) {
          const stepDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + step);
          const stepDateStr = getLocalDateString(stepDate);

          records.push({
            date: stepDateStr,
            dayName: getDayNameDe(stepDate),
            formattedDate: getFormattedDateDe(stepDate),
            tokens: 0,
            queries: 0,
            computeMinutes: 0,
            peakHour: "-",
            isPreCreation: stepDateStr < creationDateStr,
          });
        }
      } else {
        // More than a month or corrupted, regenerate fresh history
        records = generateFreshHistory(now, creationDate);
      }

      // Keep last 14 days
      if (records.length > 14) {
        records = records.slice(-14);
      }

      // Reset hourly distribution and agent stats for the fresh day
      hourly = new Array(24).fill(0);
      resetAgentBreakdownForToday(todayStr, resolvedEmail);
      needsSave = true;

      // Broadcast midnight rollover event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("syntax_daily_usage_updated", { detail: { date: todayStr, rollover: true, userEmail: resolvedEmail } }));
      }
    }

    if (needsSave) {
      saveUsageRecords(records, hourly, resolvedEmail);
    }
  }

  const todayRecord = records[records.length - 1];
  return { records, hourly, todayRecord };
}

function resetAgentBreakdownForToday(todayStr: string, userEmail?: string): void {
  try {
    const emptyBreakdown: Record<string, { queries: number; tokens: number }> = {};
    AGENT_META.forEach((m) => {
      emptyBreakdown[m.agentId] = { queries: 0, tokens: 0 };
    });
    localStorage.setItem(
      getAccountAgentBreakdownStorageKey(userEmail),
      JSON.stringify({ date: todayStr, breakdown: emptyBreakdown })
    );
  } catch (e) {
    console.warn("Could not reset agent breakdown", e);
  }
}

function getStoredAgentBreakdown(todayStr: string, userEmail?: string): Record<string, { queries: number; tokens: number }> {
  try {
    const stored = localStorage.getItem(getAccountAgentBreakdownStorageKey(userEmail));
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === todayStr && parsed.breakdown) {
        return parsed.breakdown;
      }
    }
  } catch {
    // fallback
  }
  return {};
}

function saveAgentBreakdown(todayStr: string, breakdown: Record<string, { queries: number; tokens: number }>, userEmail?: string): void {
  try {
    localStorage.setItem(
      getAccountAgentBreakdownStorageKey(userEmail),
      JSON.stringify({ date: todayStr, breakdown })
    );
  } catch (e) {
    console.warn("Could not save agent breakdown", e);
  }
}

export function getDailyUsageMetrics(userEmail?: string, userRole?: string): DailyUsageMetrics {
  let resolvedEmail = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
  let resolvedRole = userRole || "SOVEREIGN";

  try {
    if (!resolvedEmail && typeof localStorage !== "undefined") {
      const storedProfile = localStorage.getItem("maze_user_profile_v2");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.email) resolvedEmail = parsed.email.trim().toLowerCase();
        if (parsed.purchasedRole) resolvedRole = parsed.purchasedRole;
      }
    }
  } catch {
    // fallback safe
  }

  const creationDate = getAccountCreationDate(resolvedEmail);
  const creationDateStr = getLocalDateString(creationDate);
  const { records, hourly, todayRecord } = syncAndEnsureRollover(resolvedEmail);
  const now = new Date();
  const todayStr = getLocalDateString(now);

  // Calculate active days since creation (inclusive of today)
  const creationParts = creationDateStr.split("-").map(Number);
  const cDate = new Date(creationParts[0], creationParts[1] - 1, creationParts[2]);
  const todayParts = todayStr.split("-").map(Number);
  const tDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const diffDays = Math.max(0, Math.round((tDate.getTime() - cDate.getTime()) / (24 * 3600 * 1000)));
  const activeDaysCount = Math.max(1, Math.min(14, diffDays + 1));

  // Only consider records from days on or after account/key creation
  const validRecords = records.filter((r) => r.date >= creationDateStr);
  const totalTokens = validRecords.reduce((acc, r) => acc + r.tokens, 0);
  const totalCompute = validRecords.reduce((acc, r) => acc + r.computeMinutes, 0);
  const totalQueries = validRecords.reduce((acc, r) => acc + r.queries, 0);

  // Averages are strictly calculated across active days since creation!
  // If created today, average matches today's actual tokens!
  const averageDailyTokens = Math.round(totalTokens / activeDaysCount);
  const averageDailyComputeMinutes = +(totalCompute / activeDaysCount).toFixed(1);
  const averageDailyQueries = Math.round(totalQueries / activeDaysCount);

  // Today's actual counters for THIS user
  const todayTokens = todayRecord ? todayRecord.tokens : 0;
  const todayComputeMinutes = todayRecord ? todayRecord.computeMinutes : 0;
  const todayQueries = todayRecord ? todayRecord.queries : 0;

  const isAdmin = (isSuperAdminEmail(resolvedEmail) || resolvedRole === "FULL_CORE_ADMIN" || resolvedRole === "ADMIN") && isStoredAdminAuthenticated();

  // Every account gets 50,000 base tokens limit + any bonus tokens claimed via Discord/Rewards!
  const bonusTokens = getBonusTokensForUser(resolvedEmail);
  const baseLimit = 50000;
  const dailyLimitTokens = baseLimit + bonusTokens;
  let activePlan = "SOVEREIGN 50K CORE (8 CORES)";

  if (isAdmin) {
    activePlan = bonusTokens > 0 
      ? `ADMIN ROOT (${(dailyLimitTokens / 1000).toFixed(0)}K TOKENS / +${(bonusTokens / 1000).toFixed(0)}K BONUS)`
      : "ADMIN ROOT (50K TOKENS / CORE)";
  } else {
    activePlan = bonusTokens > 0 
      ? `SOVEREIGN CORE (${(dailyLimitTokens / 1000).toFixed(0)}K TOKENS / +${(bonusTokens / 1000).toFixed(0)}K BONUS)`
      : "SOVEREIGN 50K CORE (8 CORES)";
  }

  // Calculate real weekly change ONLY if the account has existed for at least 8 days
  let weeklyChangePercent = 0;
  if (activeDaysCount >= 8 && records.length >= 14) {
    const recent7 = records.slice(-7).reduce((acc, r) => acc + r.tokens, 0);
    const prior7 = records.slice(-14, -7).reduce((acc, r) => acc + r.tokens, 0);
    if (prior7 > 0) {
      weeklyChangePercent = +(((recent7 - prior7) / prior7) * 100).toFixed(1);
    }
  }

  const remainingTokensToday = Math.max(0, dailyLimitTokens - todayTokens);
  const percentUsedToday = Math.min(100, +((todayTokens / dailyLimitTokens) * 100).toFixed(1));

  // Read per-agent breakdown for today for THIS user (Strictly real data, no fake default shares!)
  const storedAgentData = getStoredAgentBreakdown(todayStr, resolvedEmail);

  const agentBreakdown: AgentUsageStats[] = AGENT_META.map((meta) => {
    if (todayTokens === 0) {
      return {
        agentId: meta.agentId,
        name: meta.name,
        short: meta.short,
        color: meta.color,
        roleTag: meta.roleTag,
        queries: 0,
        tokens: 0,
        percentage: 0,
      };
    }

    const agentQueries = storedAgentData[meta.agentId]?.queries || 0;
    const agentTokens = storedAgentData[meta.agentId]?.tokens || 0;
    const percentage = todayTokens > 0 ? +((agentTokens / todayTokens) * 100).toFixed(1) : 0;

    return {
      agentId: meta.agentId,
      name: meta.name,
      short: meta.short,
      color: meta.color,
      roleTag: meta.roleTag,
      queries: agentQueries,
      tokens: agentTokens,
      percentage,
    };
  });

  // If todayTokens > 0 but agentBreakdown didn't catch specific agent (e.g. general query), allocate to syntax
  const currentSum = agentBreakdown.reduce((acc, a) => acc + a.tokens, 0);
  if (todayTokens > 0 && currentSum === 0) {
    const syntaxMeta = agentBreakdown.find((a) => a.agentId === "syntax");
    if (syntaxMeta) {
      syntaxMeta.tokens = todayTokens;
      syntaxMeta.queries = Math.max(1, todayQueries);
      syntaxMeta.percentage = 100;
    }
  }

  return {
    userEmail: resolvedEmail,
    accountCreatedAt: creationDate.toISOString(),
    accountCreatedDateFormatted: getFormattedDateDe(creationDate),
    activeDaysCount,
    averageDailyTokens,
    averageDailyComputeMinutes,
    averageDailyQueries,
    todayTokens,
    todayComputeMinutes,
    todayQueries,
    dailyLimitTokens,
    bonusTokens,
    remainingTokensToday,
    percentUsedToday,
    efficiencyScore: 98.4,
    weeklyChangePercent,
    activePlan,
    totalHistoricalTokens: totalTokens,
    history: records,
    agentBreakdown,
    hourlyDistribution: hourly,
    lastUpdated: new Date().toLocaleTimeString("de-DE"),
  };
}

function saveUsageRecords(history: DayUsageRecord[], hourly: number[], userEmail?: string): void {
  try {
    localStorage.setItem(
      getAccountTelemetryStorageKey(userEmail),
      JSON.stringify({
        history,
        hourlyDistribution: hourly,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (e) {
    console.warn("Could not save daily usage telemetry", e);
  }
}

/**
 * Record live usage when an agent completes a query or action for the active user account
 */
export function recordAgentUsage(agentId: string = "syntax", tokens: number = 240, computeMs: number = 1800, userEmail?: string): void {
  try {
    const resolvedEmail = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
    const { records, hourly } = syncAndEnsureRollover(resolvedEmail);
    const today = records[records.length - 1];
    const todayStr = getLocalDateString(new Date());

    if (today) {
      today.tokens += tokens;
      today.queries += 1;
      today.computeMinutes = +(today.computeMinutes + computeMs / 60000).toFixed(1);
    }

    const currentHour = new Date().getHours();
    hourly[currentHour] = (hourly[currentHour] || 0) + tokens;

    // Update per-agent breakdown store for this user
    const agentData = getStoredAgentBreakdown(todayStr, resolvedEmail);
    if (!agentData[agentId]) {
      agentData[agentId] = { queries: 0, tokens: 0 };
    }
    agentData[agentId].tokens += tokens;
    agentData[agentId].queries += 1;

    saveUsageRecords(records, hourly, resolvedEmail);
    saveAgentBreakdown(todayStr, agentData, resolvedEmail);

    // Broadcast usage event with userEmail details
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("syntax_daily_usage_updated", {
          detail: {
            tokens,
            agentId,
            todayTokens: today ? today.tokens : tokens,
            userEmail: resolvedEmail,
          },
        })
      );
    }
  } catch (e) {
    console.warn("Failed to record agent usage", e);
  }
}

/**
 * Simulate query activity in real time for testing the dashboard
 */
export function simulateAdditionalUsage(additionalTokens: number = 450, agentId: string = "syntax", userEmail?: string): DailyUsageMetrics {
  recordAgentUsage(agentId, additionalTokens, 2500, userEmail);
  return getDailyUsageMetrics(userEmail);
}

/**
 * Reset usage data for the specified account: resets today's counters to 0 and all agents to 0%
 */
export function resetUsageMetrics(userEmail?: string): DailyUsageMetrics {
  const resolvedEmail = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
  const now = new Date();
  const creationDate = getAccountCreationDate(resolvedEmail);
  const seed = generateFreshHistory(now, creationDate);
  const hourly = new Array(24).fill(0);
  saveUsageRecords(seed, hourly, resolvedEmail);
  resetAgentBreakdownForToday(getLocalDateString(now), resolvedEmail);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("syntax_daily_usage_updated", { detail: { reset: true, userEmail: resolvedEmail } }));
  }

  return getDailyUsageMetrics(resolvedEmail);
}

// Background watcher that checks every 10 seconds if midnight (00:00) has occurred
if (typeof window !== "undefined") {
  setInterval(() => {
    try {
      syncAndEnsureRollover(getCurrentUserEmail());
    } catch {
      // safe
    }
  }, 10000);
}
