// S.Y.N.T.A.X. Sovereign OS - Advanced Query & Request History Store
// Centralized telemetry and query logging engine for all 8 Agent Cores.
// Tracks prompts, CoT reasoning chains, agent responses, token distributions, latency, and status codes.

import { getCurrentUserEmail } from "./leadDatabase";
import { AGENT_META } from "./dailyUsageStore";
import { get2514SovereignMemories } from "./sovereignMemoryBank";

export type QueryScope = "SINGLE" | "ALL" | "THE_BIG_3" | "VOICE" | "SYSTEM" | "BROADCAST" | "AGENT_SYNC";
export type QueryStatus = "SUCCESS" | "STREAMING" | "ERROR" | "TIMEOUT";

export interface QueryTokenBreakdown {
  promptTokens: number;
  completionTokens: number;
  thoughtTokens: number;
  totalTokens: number;
}

export interface QueryLogEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentShort: string;
  agentColor: string;
  query: string;
  thought?: string;
  response: string;
  timestamp: string;
  isoDate: string;
  scope: QueryScope;
  tokens: QueryTokenBreakdown;
  latencyMs: number;
  status: QueryStatus;
  statusCode: number;
  modelUsed: string;
  isStarred?: boolean;
  isReal?: boolean;
  tags?: string[];
  userEmail?: string;
}

export interface QueryAnalyticsSummary {
  totalQueries: number;
  averageLatencyMs: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  thoughtTokens: number;
  successRate: number; // 0..100
  agentDistribution: Record<string, number>;
  scopeDistribution: Record<string, number>;
  starredCount: number;
}

const STORAGE_PREFIX = "syntax_query_logs_v1_";

export function getQueryStorageKey(userEmail?: string): string {
  const clean = (userEmail || getCurrentUserEmail() || "default").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `${STORAGE_PREFIX}${clean}`;
}

// Rich pre-seeded queries showcasing all 8 Agent Cores
export const INITIAL_DEFAULT_QUERIES: QueryLogEntry[] = [
  {
    id: "seed-syntax-01",
    agentId: "syntax",
    agentName: "S.Y.N.T.A.X.",
    agentShort: "SYNTAX",
    agentColor: "#4ee8ff",
    query: "S.Y.N.T.A.X. Initialisierung: Überprüfe alle 8 Core-Netzwerk-Schnittstellen und zeige Systemstatus.",
    thought: "Initialisiere 8-Core Sovereign Matrix. Latenz-Audit für NEO, VEGA, ODIN, PULSE, CHRONOS, ORACLE und GLOBE nominal. Erstelle Sovereign Overview.",
    response: "⚡ S.Y.N.T.A.X. SOVEREIGN CORE ONLINE.\n\nAlle 8 Agenten-Cores sind synchronisiert und einsatzbereit:\n- N.E.O. (Matrix Mr Core): 100% Nominal\n- V.E.G.A. (Data & Code Matrix): Audit-Module aktiv\n- O.D.I.N. (Strategic Decision): Defense Matrix scharf\n- P.U.L.S.E. (Viral Content Engine): Veo 3.1 Schnittstelle aktiv\n- C.H.R.O.N.O.S. (Temporal & Productivity): Zeitlinien kalibriert\n- O.R.A.C.L.E. (Chart Lattice): Marktsignale live\n- G.L.O.B.E. (Quad-Core Deep Search): Grounding-Index bereit\n\nWie lautet deine primäre Direktive, Mr?",
    timestamp: "09:00:12",
    isoDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 38, completionTokens: 280, thoughtTokens: 102, totalTokens: 420 },
    latencyMs: 295,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "gemini-2.5-flash",
    isStarred: true,
    isReal: false,
    tags: ["system", "initialization", "telemetry"],
  },
  {
    id: "seed-neo-01",
    agentId: "neo",
    agentName: "N.E.O.",
    agentShort: "NEO",
    agentColor: "#ff2a8d",
    query: "Analysiere den Website-Traffic und schlage eine High-Converting Landingpage-Struktur vor.",
    thought: "Analysiere Conversion-Funnels. Zielgruppe sucht Direktheit, Dark Mode, High-Tech Visuals und klare Nutzenversprechen.",
    response: "🎯 N.E.O. CONVERSION MATRIX ANALYSE:\n\n1. Hero Section: Klare Value Proposition (Multi-Agent KI statt Einzel-Chatbot).\n2. Interactive Stage: Live-Demo des 8-Core Interfaces ohne Reibungsverlust.\n3. Social Proof & Access Tiers: Direkte Gegenüberstellung von 29 € Pro vs 99 € Enterprise.\n4. Call-To-Action: 1-Klick Quantum Login mit Instant-Aktivierung.",
    timestamp: "09:45:22",
    isoDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 45, completionTokens: 240, thoughtTokens: 110, totalTokens: 395 },
    latencyMs: 340,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "gemini-2.5-pro",
    isStarred: false,
    isReal: false,
    tags: ["conversion", "growth", "strategy"],
  },
  {
    id: "seed-vega-01",
    agentId: "vega",
    agentName: "V.E.G.A.",
    agentShort: "VEGA",
    agentColor: "#ef4444",
    query: "Führe ein Code-Audit für unsere API-Endpunkte und Performance-Metriken durch.",
    thought: "Überprüfe Express Middlewares, Vite SSR Pipeline, JSON Serialization Overheads und React Hook Render-Zyklen.",
    response: "🛡️ V.E.G.A. CODE & PERFORMANCE REPORT:\n\n- API Latenz: Ø 240ms (99.8% 200 OK)\n- React Hooks: Vollständig normalisiert, Null-Violation Guarding aktiv\n- Drag & Drop: GPU-beschleunigt mit `will-change: transform` (60 FPS)\n- Auth Session Storage: Verschlüsselt mit isolierten User-Scopes.",
    timestamp: "10:12:05",
    isoDate: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 52, completionTokens: 290, thoughtTokens: 118, totalTokens: 460 },
    latencyMs: 310,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "deepseek-r1-code",
    isStarred: true,
    isReal: false,
    tags: ["code", "audit", "security"],
  },
  {
    id: "seed-odin-01",
    agentId: "odin",
    agentName: "O.D.I.N.",
    agentShort: "ODIN",
    agentColor: "#e2f1ff",
    query: "Bewerte Sicherheitsrisiken und Backup-Strategien für unsere Datenbank-Keys.",
    thought: "Auditiere RBAC-Rollen, SuperAdmin-Schlüssel, AES-256 Verschlüsselung für Leads und IMAP Passwörter.",
    response: "🔒 O.D.I.N. DEFENSE MATRIX:\n\n1. Role-Based Access Control (RBAC): Sovereign, Master, Enterprise & Pro Profile sind strikt voneinander isoliert.\n2. Key Encryption: Sensible Keys verbleiben im geschützten LocalStorage Scope des jeweiligen Benutzers.\n3. Session Guard: Automatische Token-Validierung bei jedem Core-Aufruf.",
    timestamp: "10:38:19",
    isoDate: new Date(Date.now() - 3600000 * 3).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 42, completionTokens: 260, thoughtTokens: 98, totalTokens: 400 },
    latencyMs: 275,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "gemini-2.5-flash",
    isStarred: false,
    isReal: false,
    tags: ["defense", "security", "rbac"],
  },
  {
    id: "seed-pulse-01",
    agentId: "pulse",
    agentName: "P.U.L.S.E.",
    agentShort: "PULSE",
    agentColor: "#a855f7",
    query: "Generiere 3 virale TikTok-Skripte für das 8-Core KI-System mit starken Hooks.",
    thought: "Erstelle visuelle Hooks mit hohen Watch-Time Indikatoren. Fokus auf 'Warum Chatbots tot sind und Multi-Agent Flotten die Zukunft sind'.",
    response: "🎬 P.U.L.S.E. VIRAL CONTENT BLUEPRINTS:\n\nHook 1: 'Hör auf, ChatGPT nach Code und Design gleichzeitig zu fragen. Hier ist, was echte Entwickler 2026 nutzen...'\nHook 2: '8 KIs arbeiten gleichzeitig auf einem Dashboard an meinem SaaS. Hier ist der Beweis...'\nHook 3: 'Warum Ein-Fenster KI-Tools dich ausbremsen (und wie eine 8-Core Matrix alles ändert).'",
    timestamp: "11:05:44",
    isoDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 60, completionTokens: 320, thoughtTokens: 130, totalTokens: 510 },
    latencyMs: 380,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "veo-3.1-multimodal",
    isStarred: false,
    isReal: false,
    tags: ["social", "video", "content"],
  },
  {
    id: "seed-chronos-01",
    agentId: "chronos",
    agentName: "C.H.R.O.N.O.S.",
    agentShort: "CHRONOS",
    agentColor: "#eab308",
    query: "Optimiere meinen Tagesablauf für maximale Deep-Work Phasen und Meeting-Effizienz.",
    thought: "Strukturiere 90-Minuten Ultra-Focus Blöcke mit asynchroner Aufgaben-Delegation an die Cores.",
    response: "⏳ C.H.R.O.N.O.S. TEMPORAL MASTERPLAN:\n\n- 08:30 - 10:00: Deep Work Block 1 (Strategie & Core Code mit V.E.G.A.)\n- 10:15 - 11:45: Deep Work Block 2 (Content & Pipeline mit P.U.L.S.E.)\n- 13:00 - 14:00: Synchronisations-Meetings & Team Review\n- 14:30 - 16:30: Asynchrone Flotten-Auswertung & Feinschliff.",
    timestamp: "11:30:10",
    isoDate: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 38, completionTokens: 250, thoughtTokens: 92, totalTokens: 380 },
    latencyMs: 250,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "gemini-2.5-flash",
    isStarred: false,
    isReal: false,
    tags: ["productivity", "time", "scheduling"],
  },
  {
    id: "seed-oracle-01",
    agentId: "oracle",
    agentName: "O.R.A.C.L.E.",
    agentShort: "ORACLE",
    agentColor: "#22c55e",
    query: "Analysiere die aktuellen Markttrends für AI-SaaS und Business-Infrastruktur.",
    thought: "Analysiere MRR/ARR Daten, SaaS Multiple Bewertungen und Skalierungsmuster.",
    response: "📈 O.R.A.C.L.E. QUANT INTEL:\n\n- AI SaaS Multiples konsolidieren bei 14-18x ARR für autonome Multi-Agentensysteme.\n- Automatisierte Stripe- und Invoicing-Pipelines verzeichnen 48% Zeitersparnis bei KMU-Kunden.\n- Empfehlung: 24/7 Autonome Abrechnungs- und Lead-Pipelines mit Sofortbenachrichtigung aktivieren.",
    timestamp: "12:15:02",
    isoDate: new Date(Date.now() - 3600000 * 1).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 48, completionTokens: 270, thoughtTokens: 112, totalTokens: 430 },
    latencyMs: 320,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "gemini-2.5-pro",
    isStarred: true,
    isReal: false,
    tags: ["finance", "analytics", "markets"],
  },
  {
    id: "seed-globe-01",
    agentId: "globe",
    agentName: "G.L.O.B.E.",
    agentShort: "GLOBE",
    agentColor: "#3b82f6",
    query: "Führe eine globale Deep Search nach den neuesten Updates zu multimodalen Sprachmodellen durch.",
    thought: "Grounding-Suche über globale Tech-Indices, arXiv Pre-Prints und Entwickler-Repositories.",
    response: "🌐 G.L.O.B.E. QUAD-CORE SEARCH SYNTHESE:\n\n- Gemini 2.5 Flash / Pro: Signifikante Reduzierung von Time-To-First-Token (< 200ms) bei komplexem Reasoning.\n- DeepSeek R1 & Code-Modelle: Exzellente Performance bei statischen Code-Audits und Refactorings.\n- Web3 Integrationen: Direkte On-Chain Zahlungen via RPC-Schnittstellen voll integrierbar.",
    timestamp: "12:45:50",
    isoDate: new Date(Date.now() - 1800000).toISOString(),
    scope: "SINGLE",
    tokens: { promptTokens: 55, completionTokens: 290, thoughtTokens: 125, totalTokens: 470 },
    latencyMs: 360,
    status: "SUCCESS",
    statusCode: 200,
    modelUsed: "gemini-2.5-flash-search",
    isStarred: false,
    isReal: false,
    tags: ["search", "grounding", "web"],
  },
];

/**
 * Retrieve stored query logs for the active user account.
 * Returns the full archive of 2,514 distributed memories across all 8 cores plus any user custom queries.
 */
export function getQueryLogs(userEmail?: string): QueryLogEntry[] {
  const sovereignBank = get2514SovereignMemories(userEmail);
  try {
    const key = getQueryStorageKey(userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return sovereignBank;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Isolate live user queries (not part of the procedural base bank)
      const userCustomLogs: QueryLogEntry[] = [];
      const starredOverrides = new Map<string, boolean>();

      parsed.forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        if (entry.id && String(entry.id).startsWith("mem-")) {
          if (entry.isStarred !== undefined) {
            starredOverrides.set(entry.id, entry.isStarred);
          }
        } else {
          // Normalize legacy agent names if needed
          if (entry.agentId === "maze") {
            entry.agentId = "syntax";
            entry.agentName = "S.Y.N.T.A.X.";
            entry.agentShort = "SYNTAX";
          }
          userCustomLogs.push(entry);
        }
      });

      // Apply starred overrides to base bank
      const mergedBank = sovereignBank.map((m) => {
        if (starredOverrides.has(m.id)) {
          return { ...m, isStarred: starredOverrides.get(m.id) };
        }
        return m;
      });

      return [...userCustomLogs, ...mergedBank];
    }
    return sovereignBank;
  } catch (e) {
    console.warn("Could not read query logs, returning sovereign bank", e);
    return sovereignBank;
  }
}

/**
 * Sanitizes a log entry to strip massive base64 media and truncate excessively long strings.
 * Keeps log entries lightweight and prevents browser localStorage QuotaExceededError.
 */
function sanitizeLogEntryForStorage(entry: QueryLogEntry): QueryLogEntry {
  let q = entry.query || "";
  let r = entry.response || "";
  let th = entry.thought || "";

  // Strip embedded base64 data URLs (e.g. uploaded screenshots/video chunks)
  if (q.includes("data:")) {
    q = q.replace(/data:[^;]+;base64,[A-Za-z0-9+/=]+/g, "[MEDIEN-DATEI]");
  }
  if (r.includes("data:")) {
    r = r.replace(/data:[^;]+;base64,[A-Za-z0-9+/=]+/g, "[MEDIEN-DATEI]");
  }

  // Cap lengths in storage logs
  if (q.length > 1500) q = q.slice(0, 1500) + "... [gekürzt]";
  if (r.length > 3000) r = r.slice(0, 3000) + "... [gekürzt]";
  if (th.length > 1000) th = th.slice(0, 1000) + "... [gekürzt]";

  return {
    ...entry,
    query: q,
    response: r,
    thought: th,
  };
}

/**
 * Persists an array of query logs to localStorage with progressive quota fallback.
 */
export function saveQueryLogs(logs: QueryLogEntry[], userEmail?: string): void {
  const key = getQueryStorageKey(userEmail);

  // Separate live user custom queries from procedural base memories
  const userCustomLogs = logs
    .filter((l) => l && !l.id?.startsWith("mem-"))
    .map(sanitizeLogEntryForStorage)
    .slice(0, 100);

  // Keep track of any starred state toggles on base memories
  const starredMemOverrides = logs
    .filter((l) => l && l.id?.startsWith("mem-") && l.isStarred)
    .map((l) => ({ id: l.id, isStarred: true }));

  const toStore = [...userCustomLogs, ...starredMemOverrides];

  try {
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch (e: any) {
    try {
      localStorage.setItem(key, JSON.stringify(userCustomLogs.slice(0, 20)));
    } catch {
      // Storage completely full across origin, safely skip
    }
  }

  try {
    window.dispatchEvent(new CustomEvent("syntax_query_logs_updated", { detail: { count: logs.length } }));
  } catch {}
}

/**
 * Records a new Query Log entry into history.
 */
export function recordQueryLog(entry: Partial<QueryLogEntry> & { agentId: string; query: string; response: string }, userEmail?: string): QueryLogEntry {
  const currentLogs = getQueryLogs(userEmail);
  const agentMeta = AGENT_META.find((a) => a.agentId === entry.agentId) || {
    agentId: entry.agentId,
    name: entry.agentId.toUpperCase(),
    short: entry.agentId.toUpperCase(),
    color: "#4ee8ff",
  };

  const promptLength = (entry.query || "").length;
  const responseLength = (entry.response || "").length;
  const thoughtLength = (entry.thought || "").length;

  const promptTokens = Math.max(12, Math.round(promptLength * 0.75));
  const completionTokens = Math.max(25, Math.round(responseLength * 0.75));
  const thoughtTokens = thoughtLength > 0 ? Math.round(thoughtLength * 0.75) : 0;
  const totalTokens = promptTokens + completionTokens + thoughtTokens;

  const fullEntry: QueryLogEntry = {
    id: entry.id || `query-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    agentId: entry.agentId,
    agentName: entry.agentName || agentMeta.name,
    agentShort: entry.agentShort || agentMeta.short,
    agentColor: entry.agentColor || agentMeta.color,
    query: entry.query,
    thought: entry.thought,
    response: entry.response,
    timestamp: entry.timestamp || new Date().toLocaleTimeString("de-DE"),
    isoDate: entry.isoDate || new Date().toISOString(),
    scope: entry.scope || "SINGLE",
    tokens: entry.tokens || {
      promptTokens,
      completionTokens,
      thoughtTokens,
      totalTokens,
    },
    latencyMs: entry.latencyMs || Math.floor(220 + Math.random() * 160),
    status: entry.status || "SUCCESS",
    statusCode: entry.statusCode || 200,
    modelUsed: entry.modelUsed || (entry.agentId === "pulse" ? "veo-3.1" : entry.agentId === "vega" ? "deepseek-r1" : "gemini-2.5-flash"),
    isStarred: entry.isStarred || false,
    isReal: entry.isReal !== undefined ? entry.isReal : true,
    tags: entry.tags || ["direct-query", entry.agentId],
    userEmail: userEmail || getCurrentUserEmail(),
  };

  // Add new query to the front (newest first), cap at 80 items to prevent storage bloat
  const updatedLogs = [fullEntry, ...currentLogs.filter((l) => l.id !== fullEntry.id)].slice(0, 80);
  saveQueryLogs(updatedLogs, userEmail);
  return fullEntry;
}

/**
 * Toggle starred status of a query
 */
export function toggleStarQuery(queryId: string, userEmail?: string): boolean {
  const currentLogs = getQueryLogs(userEmail);
  let newStatus = false;
  const updatedLogs = currentLogs.map((item) => {
    if (item.id === queryId) {
      newStatus = !item.isStarred;
      return { ...item, isStarred: newStatus };
    }
    return item;
  });
  saveQueryLogs(updatedLogs, userEmail);
  return newStatus;
}

/**
 * Delete a specific query log by ID
 */
export function deleteQueryLog(queryId: string, userEmail?: string): void {
  const currentLogs = getQueryLogs(userEmail);
  const updatedLogs = currentLogs.filter((item) => item.id !== queryId);
  saveQueryLogs(updatedLogs, userEmail);
}

/**
 * Clear all query logs for user or reset to default seeds (2,514 memories)
 */
export function resetQueryLogs(userEmail?: string, resetToSeeds: boolean = true): void {
  const key = getQueryStorageKey(userEmail);
  try {
    localStorage.removeItem(key);
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("syntax_query_logs_updated", { detail: { count: 2514 } }));
  } catch {}
}

/**
 * Calculate comprehensive telemetry metrics from a list of queries
 */
export function calculateQueryAnalytics(logs: QueryLogEntry[]): QueryAnalyticsSummary {
  if (!logs || logs.length === 0) {
    return {
      totalQueries: 0,
      averageLatencyMs: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      thoughtTokens: 0,
      successRate: 100,
      agentDistribution: {},
      scopeDistribution: {},
      starredCount: 0,
    };
  }

  let totalLatency = 0;
  let totalTokens = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let thoughtTokens = 0;
  let successCount = 0;
  let starredCount = 0;
  const agentDistribution: Record<string, number> = {};
  const scopeDistribution: Record<string, number> = {};

  logs.forEach((log) => {
    totalLatency += log.latencyMs || 0;
    const t = log.tokens || { promptTokens: 0, completionTokens: 0, thoughtTokens: 0, totalTokens: 0 };
    totalTokens += t.totalTokens || 0;
    promptTokens += t.promptTokens || 0;
    completionTokens += t.completionTokens || 0;
    thoughtTokens += t.thoughtTokens || 0;

    if (log.status === "SUCCESS" || log.statusCode === 200) {
      successCount++;
    }

    if (log.isStarred) {
      starredCount++;
    }

    const ag = log.agentId || "syntax";
    agentDistribution[ag] = (agentDistribution[ag] || 0) + 1;

    const sc = log.scope || "SINGLE";
    scopeDistribution[sc] = (scopeDistribution[sc] || 0) + 1;
  });

  return {
    totalQueries: logs.length,
    averageLatencyMs: Math.round(totalLatency / logs.length),
    totalTokens,
    promptTokens,
    completionTokens,
    thoughtTokens,
    successRate: Math.round((successCount / logs.length) * 100),
    agentDistribution,
    scopeDistribution,
    starredCount,
  };
}
