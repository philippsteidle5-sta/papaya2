/**
 * 📡 SYNTAX PRODUCTION REAL-TIME TELEMETRY & HEARTBEAT CLIENT
 * 
 * Tracks 100% genuine real user sessions, live heartbeat, real pageviews,
 * real client device details (OS, Browser, Screen, active Core) and events.
 */

import { getCurrentUserEmail, SUPERADMIN_EMAIL } from "./leadDatabase";

export interface RealClientSession {
  id: string;
  userName: string;
  userEmail?: string;
  isRegisteredLead: boolean;
  role: string;
  plan: string;
  ip: string;
  city: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  device: "Desktop" | "Mobil";
  browser: string;
  os: string;
  currentScreen: string;
  currentAgent: string;
  sessionStartTime: string;
  durationSeconds: number;
  lastPing: number;
  status: "ACTIVE" | "IDLE" | "PROMPTING";
  referrer: string;
  utmSource?: string;
  pageviews: number;
  eventsCount: number;
}

export interface RealTelemetryEvent {
  id: string;
  sessionId: string;
  eventType: "PAGEVIEW" | "PROMPT" | "AGENT_SWITCH" | "CHECKOUT_CLICK" | "LEAD_SUBMIT" | "ACTION";
  label: string;
  meta?: any;
  timestamp: string;
}

// Global session identifier per browser tab
function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem("syntax_telemetry_session_id");
    if (!sid) {
      sid = "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
      sessionStorage.setItem("syntax_telemetry_session_id", sid);
    }
    return sid;
  } catch {
    return "sess_mem_" + Date.now();
  }
}

// Detect client browser
function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  return "Browser";
}

// Detect client operating system
function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Mac OS X") || ua.includes("Macintosh")) return "macOS";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Desktop";
}

// Session state storage
let currentActiveScreen = "Sovereign Cockpit";
let currentActiveAgent = "Syntax";
let sessionPageviewsCount = 1;
let sessionEventsCount = 0;
let isHeartbeatRunning = false;

export function updateTelemetryContext(screen?: string, agent?: string) {
  if (screen && screen !== currentActiveScreen) {
    currentActiveScreen = screen;
    sessionPageviewsCount++;
  }
  if (agent) {
    currentActiveAgent = agent;
  }
}

/**
 * Send real heartbeat ping to backend server
 */
export async function sendTelemetryPing(isPrompting = false) {
  try {
    const sessionId = getOrCreateSessionId();
    const email = getCurrentUserEmail() || "";
    const isSuperAdmin = email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

    const payload = {
      sessionId,
      userEmail: email || undefined,
      userName: isSuperAdmin ? "Philipp Steidle (Admin)" : (email ? email.split("@")[0] : "Gast-Besucher (Du)"),
      currentScreen: currentActiveScreen,
      currentAgent: currentActiveAgent,
      device: window.innerWidth < 768 ? "Mobil" : "Desktop",
      browser: detectBrowser(),
      os: detectOS(),
      referrer: document.referrer || "Direktaufruf",
      utmSource: new URLSearchParams(window.location.search).get("utm_source") || "direct",
      isPrompting,
      pageviews: sessionPageviewsCount,
      eventsCount: sessionEventsCount,
    };

    const res = await fetch("/api/telemetry/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Fail silently in development/offline
  }
  return null;
}

/**
 * Log a genuine user action event
 */
export async function trackTelemetryEvent(
  eventType: RealTelemetryEvent["eventType"],
  label: string,
  meta?: any
) {
  sessionEventsCount++;
  try {
    const sessionId = getOrCreateSessionId();
    await fetch("/api/telemetry/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, eventType, label, meta }),
    });
  } catch {}
}

/**
 * Start background heartbeat (every 10s)
 */
export function startTelemetryHeartbeat() {
  if (isHeartbeatRunning || typeof window === "undefined") return;
  isHeartbeatRunning = true;

  // Immediate first ping
  sendTelemetryPing();

  // Periodic ping every 10 seconds
  setInterval(() => {
    sendTelemetryPing();
  }, 10000);
}

/**
 * Fetch genuine active sessions from backend
 */
export async function fetchLiveSessionsFromBackend(): Promise<{
  liveCount: number;
  lifetimeVisitors: number;
  sessions: RealClientSession[];
  events: RealTelemetryEvent[];
} | null> {
  try {
    const res = await fetch("/api/telemetry/live-sessions");
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {}
  return null;
}
