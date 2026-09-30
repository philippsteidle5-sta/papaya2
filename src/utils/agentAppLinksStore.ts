// src/utils/agentAppLinksStore.ts
// Robust, persistent store to link apps & system functions to AI agents (e.g. WebBrowser -> NEO, ClaudeCode -> SYNTAX)

export interface SystemAppDefinition {
  id: string;
  nameDe: string;
  nameEn: string;
  shortName: string;
  descriptionDe: string;
  descriptionEn: string;
  icon: string;
  category: "workspace" | "productivity" | "travel" | "media" | "finance" | "intel";
  widgetKey?: string;
  adminOnly?: boolean;
  defaultAgentId: string; // e.g. "neo", "syntax", "globe", "none"
}

export const SYSTEM_APPS_CATALOG: SystemAppDefinition[] = [
  {
    id: "webBrowser",
    nameDe: "Quantum Web Browser",
    nameEn: "Quantum Web Browser",
    shortName: "Browser",
    descriptionDe: "In-OS Recherche-Browser mit Live-Seiteninspektion, Screenshot-Analyse und Multi-Tab Browsing.",
    descriptionEn: "In-OS research browser with live inspection, visual screenshot capture and multi-tab surfing.",
    icon: "🌐",
    category: "workspace",
    widgetKey: "webBrowser",
    defaultAgentId: "neo",
  },
  {
    id: "calendarWidget",
    nameDe: "Chronos Kalender",
    nameEn: "Chronos Calendar",
    shortName: "Kalender",
    descriptionDe: "Termin- und Zeitmanagement, Tagesstrukturierung, Event-Synchronisation und Chronos Zeit-Radar.",
    descriptionEn: "Schedule & time management, daily pacing, event sync and Chronos temporal radar.",
    icon: "📅",
    category: "productivity",
    widgetKey: "calendarWidget",
    defaultAgentId: "neo",
  },
  {
    id: "claudeCode",
    nameDe: "Claude Code & Fullstack IDE",
    nameEn: "Claude Code & Fullstack IDE",
    shortName: "Claude IDE",
    descriptionDe: "Interaktiver Code-Editor, TypeScript-Synthese, Datei-Inspektor und Live-Scripting Konsole.",
    descriptionEn: "Interactive code editor, TypeScript code synthesis, file inspector and live scripting console.",
    icon: "💻",
    category: "workspace",
    widgetKey: "claudeCode",
    defaultAgentId: "syntax",
  },
  {
    id: "jarvisTerminal",
    nameDe: "Jarvis Terminal Konsole",
    nameEn: "Jarvis Terminal Console",
    shortName: "Terminal",
    descriptionDe: "Cyber-Terminal mit System-Diagnose, Prompt-Pipelines, Node-Befehlen und Live-Logs.",
    descriptionEn: "Cyber terminal with system diagnostics, prompt pipelines, node commands and live logs.",
    icon: "⌨️",
    category: "workspace",
    defaultAgentId: "syntax",
  },
  {
    id: "dailyObjectives",
    nameDe: "Tagesziele & Prioritäten",
    nameEn: "Daily Objectives & Priorities",
    shortName: "Tagesziele",
    descriptionDe: "Verwaltung der 3 Kernfokusse, Fortschritts-Tracker, Zeitschätzungen und Zielerreichungs-Matrix.",
    descriptionEn: "Top 3 daily priorities, progress tracking, time estimates and goal completion matrix.",
    icon: "🎯",
    category: "productivity",
    widgetKey: "dailyObjectives",
    defaultAgentId: "syntax",
  },
  {
    id: "gmailInbox",
    nameDe: "Gmail Posteingang & KI-Mails",
    nameEn: "Gmail Inbox & AI Email Suite",
    shortName: "Gmail Hub",
    descriptionDe: "Vollständiger Google E-Mail Posteingang, KI-Zusammenfassungen, Auto-Entwürfe, intelligente Filter & Priority Inbox.",
    descriptionEn: "Full Google email inbox, AI thread summarization, neural drafts, automated reply suggestions and priority filters.",
    icon: "📬",
    category: "productivity",
    widgetKey: "gmailInbox",
    defaultAgentId: "syntax",
  },
  {
    id: "socialUpload",
    nameDe: "Social Media Studio (TikTok, Instagram, LinkedIn & X)",
    nameEn: "Social Media Studio (TikTok, Instagram, LinkedIn & X)",
    shortName: "Social Studio",
    descriptionDe: "Plattformübergreifender Multi-Channel Publisher, virale KI-Hook-Generierung, Smartphone Live-Feed und Video-Scheduler.",
    descriptionEn: "Multi-channel publisher for TikTok, IG, LinkedIn & X, viral hook generator, mobile feed preview and scheduling.",
    icon: "📱",
    category: "media",
    widgetKey: "socialUpload",
    defaultAgentId: "pulse",
  },
  {
    id: "googleMaps",
    nameDe: "Google Maps 3D Cyber Radar",
    nameEn: "Google Maps 3D Cyber Radar",
    shortName: "Maps Radar",
    descriptionDe: "Satelliten- und Straßenkarten, Routenberechnung für Transit/Drive/Walk und Geodaten-Navigation.",
    descriptionEn: "Satellite and street map navigator, multi-modal routing (transit/drive/walk) and GIS radar.",
    icon: "🗺️",
    category: "travel",
    widgetKey: "googleMaps",
    adminOnly: true,
    defaultAgentId: "globe",
  },
  {
    id: "veoStudio",
    nameDe: "Google Veo 3.1 Video Studio",
    nameEn: "Google Veo 3.1 Video Studio",
    shortName: "Veo Studio",
    descriptionDe: "Cinematische 8K-Videogenerierung, Skript-Direktion, Kameraführung und Video-Download.",
    descriptionEn: "Cinematic 8K video generation, camera directing scripts, storytelling and video export.",
    icon: "🎬",
    category: "media",
    defaultAgentId: "neo",
  },
  {
    id: "miniTrades",
    nameDe: "Mini Quant Terminal & Märkte",
    nameEn: "Mini Quant Terminal & Markets",
    shortName: "Quant Trades",
    descriptionDe: "Echtzeit Krypto- und Aktiencharts, Volatilitäts-Indikatoren und algorithmische Trading-Signale.",
    descriptionEn: "Real-time crypto and stock charts, volatility indicators and algorithmic trading signals.",
    icon: "📈",
    category: "finance",
    widgetKey: "miniTrades",
    defaultAgentId: "vega",
  },
  // Admin-Only Modules:
  {
    id: "cctvSurveillance",
    nameDe: "CCTV Live-Überwachungsgrid",
    nameEn: "CCTV Live Surveillance Grid",
    shortName: "CCTV Feeds",
    descriptionDe: "Militärische Echtzeit-Kameraüberwachung von Metropolen weltweit mit KI-Objekterkennung.",
    descriptionEn: "Military-grade real-time global city camera surveillance with neural object detection.",
    icon: "📹",
    category: "intel",
    adminOnly: true,
    defaultAgentId: "odin",
  },
  {
    id: "osirisIntel",
    nameDe: "OSIRIS Satelliten- & Flugradar",
    nameEn: "OSIRIS Satellite & Air Radar",
    shortName: "OSIRIS Intel",
    descriptionDe: "Globale Luftraum-Telemetrie, Satelliten-Orbitbahnen, Squawk-Alarmierung und Bedrohungsanalyse.",
    descriptionEn: "Global aerospace telemetry, satellite orbital passes, squawk alerts and threat vectors.",
    icon: "🛰️",
    category: "intel",
    adminOnly: true,
    defaultAgentId: "globe",
  },
];

const STORAGE_KEY = "syntax_agent_app_links_v2";

/**
 * Returns current map of { [appId: string]: string }
 * where value is agentId ('neo', 'syntax', etc.), 'all', or 'none'.
 */
export function getAppToAgentLinkMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not parse app links from localStorage", e);
  }

  // Fallback to default recommendations
  const initial: Record<string, string> = {};
  SYSTEM_APPS_CATALOG.forEach((app) => {
    initial[app.id] = app.defaultAgentId;
  });
  return initial;
}

/**
 * Assigns an app to an agent ('neo', 'syntax', 'none', 'all')
 */
export function setAppLink(appId: string, agentId: string) {
  const current = getAppToAgentLinkMap();
  current[appId] = agentId;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("syntax_app_links_updated", { detail: { appId, agentId } }));
  } catch (e) {
    console.error("Failed to save app links", e);
  }
}

/**
 * Returns all apps linked to a specific agentId (or 'all').
 */
export function getAppsLinkedToAgent(agentId: string, isAdmin = false): SystemAppDefinition[] {
  const map = getAppToAgentLinkMap();
  const normalizedAgent = agentId.toLowerCase();

  return SYSTEM_APPS_CATALOG.filter((app) => {
    if (app.adminOnly && !isAdmin) return false;
    const linked = map[app.id] || app.defaultAgentId;
    return linked === normalizedAgent || linked === "all";
  });
}

/**
 * Returns list of app IDs linked to an agent.
 */
export function getAppIdsLinkedToAgent(agentId: string, isAdmin = false): string[] {
  return getAppsLinkedToAgent(agentId, isAdmin).map((a) => a.id);
}

/**
 * Get human-readable summary of linked tools for AI prompt context
 */
export function getLinkedAppsContextForPrompt(agentId: string, isAdmin = false): string {
  const linked = getAppsLinkedToAgent(agentId, isAdmin);
  if (linked.length === 0) return "";
  const names = linked.map((a) => `${a.nameDe} (${a.shortName})`).join(", ");
  return `[DIREKT VERKNÜPFTE APPS & SYSTEM-WERKZEUGE]:
Du hast direkten Zugriff auf folgende vom Nutzer verknüpfte Werkzeuge: ${names}.
Wenn der Nutzer nach diesen Themen fragt (z. B. Recherche, Kalender, Flug, Code, Video), biete ihm aktiv an, diese Apps direkt einzusetzen!`;
}
