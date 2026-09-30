// S.Y.N.T.A.X. Sovereign OS - Central Lead & User Access Database (getsyntax.ai)
// Strict Administrator Email: philippsteidle5@gmail.com
import { UserRole } from "../rbac";

export const SUPERADMIN_EMAIL = "philippsteidle5@gmail.com";

// MASTER ADMIN SECRET ACCESS KEY (Short, crisp and easy to enter)
export const MASTER_ADMIN_SECRET_KEY = "SYNTAX-9988";
export const MASTER_ADMIN_PIN = "9988";

export const AUTH_BROADCAST_CHANNEL_NAME = "syntax_quantum_auth_broadcast_v1";

export type AccessStatus = "PENDING_APPROVAL" | "TRIAL_ACTIVE" | "GRANTED" | "REVOKED";

export interface AccessKeyRecord {
  id: string;
  key: string; // e.g. "otto", "7482-9104-5821-3940"
  label: string; // e.g. "Closed Beta Tester Key"
  createdAt: string; // ISO
  expiresAt: string; // ISO (24h default)
  durationHours: number; // default 24
  createdBy: string; // philippsteidle5@gmail.com
  usedCount: number;
  isActive: boolean;
  notes?: string;
  role?: UserRole; // "CLOSED_BETA_TESTER" | "SOVEREIGN" | "OPERATOR" | "LITE_ACCESS"
  isBetaTesterKey?: boolean;
}

/**
 * Generates a random 16-digit numeric key formatted in 4 groups: XXXX-XXXX-XXXX-XXXX
 */
export function generate16DigitBetaKey(): string {
  let digits = "";
  for (let i = 0; i < 16; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  slot: number;
  plan: "PRO_29" | "ENTERPRISE_99";
  planName: string;
  priceMonthly: number;
  registeredAt: string; // ISO string e.g. "2026-09-03T19:42:15.123Z"
  registeredDate?: string; // Formatted date e.g. "03.09.2026"
  registeredTime?: string; // Formatted time e.g. "19:42:15 Uhr"
  trialExpiresAt: string; // ISO string (24h or 3 days after registration)
  status: AccessStatus;
  grantedAt?: string | null;
  grantedBy?: string | null;
  token: string;
  goal?: string;
  notes?: string;
  accessKey?: string; // If registered via Access Key
  source?: string; // e.g. "VIP Warteliste (3 Tage gratis)", "Slot #463", "Wartungs-Modus", "Landing Page"
  device?: string; // e.g. "Desktop" | "Mobilgerät"
  clientIp?: string;
}

export interface FormattedLeadTimestamp {
  dateStr: string;
  timeStr: string;
  fullStr: string;
  relativeStr: string;
  isRecent: boolean;
}

/**
 * Formats an ISO timestamp into German localized Date, exact Time (hh:mm:ss), and relative time badge
 */
export function formatLeadTimestamp(isoString?: string): FormattedLeadTimestamp {
  if (!isoString) {
    return {
      dateStr: "—",
      timeStr: "—",
      fullStr: "—",
      relativeStr: "—",
      isRecent: false,
    };
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return {
      dateStr: isoString,
      timeStr: "",
      fullStr: isoString,
      relativeStr: "",
      isRecent: false,
    };
  }

  const dateStr = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " Uhr";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  let relativeStr = "";
  let isRecent = false;

  if (diffSec < 60) {
    relativeStr = "Gerade eben";
    isRecent = true;
  } else if (diffMin < 60) {
    relativeStr = `vor ${diffMin} Min`;
    isRecent = diffMin <= 15;
  } else if (diffHours < 24) {
    relativeStr = `vor ${diffHours} Std`;
  } else if (diffDays === 1) {
    relativeStr = "Gestern";
  } else {
    relativeStr = `vor ${diffDays} T`;
  }

  return {
    dateStr,
    timeStr,
    fullStr: `${dateStr}, ${timeStr}`,
    relativeStr,
    isRecent,
  };
}

const DATABASE_STORAGE_KEY = "syntax_quantum_leads_database_v2";
const ACCESS_KEYS_STORAGE_KEY = "syntax_quantum_access_keys_v2";
const CURRENT_LOGGED_IN_EMAIL_KEY = "syntax_current_user_email";
const ADMIN_AUTHENTICATED_KEY = "syntax_admin_authenticated_session";
const ACTIVE_ACCESS_KEY_STORAGE = "syntax_active_redeemed_key";

/**
 * Broadcasts authorization events to all active windows/tabs/monitors in real time
 */
export function broadcastAuthEvent(payload: {
  type: "STATUS_CHANGED" | "LEAD_DELETED" | "SESSION_KICK" | "ADMIN_LOGIN" | "ADMIN_LOGOUT";
  email?: string;
  status?: AccessStatus;
  timestamp: number;
  reason?: string;
}): void {
  try {
    if (typeof window !== "undefined") {
      // 1. BroadcastChannel across all tabs & monitors
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(AUTH_BROADCAST_CHANNEL_NAME);
        bc.postMessage(payload);
        setTimeout(() => bc.close(), 100);
      }
      // 2. Custom DOM Event in local window
      window.dispatchEvent(new CustomEvent("syntax_auth_state_change", { detail: payload }));
      // 3. Storage sync tick trigger for cross-tab event listeners
      localStorage.setItem("syntax_auth_sync_tick", Date.now().toString());
    }
  } catch (e) {
    console.warn("Could not broadcast auth event", e);
  }
}

/**
 * Verifies if provided secret key or password matches Master Admin Secret Key
 */
export function verifyAdminSecretKey(key: string): boolean {
  if (!key) return false;
  const clean = key.trim().toLowerCase().replace(/[\s\-_]/g, "");
  const originalClean = key.trim().toUpperCase();

  const validNormalized = [
    "9988",
    "maze9988",
    "admin",
    "admin2026",
    "philipp",
    "philipp2026",
    "philippsteidle",
    "philippsteidle5@gmail.com",
    "philippsteidle5",
    "maze",
    "maze2026",
    "778899",
    "1234",
    "root",
    "mazeadminroot",
    "mazeadmin2026",
    "mazeadminsec9988qk77alphakey",
    "mzsuperadmin2026philippsteidlequantumcoremasterkey",
  ];

  return validNormalized.includes(clean) || clean.includes("9988") || originalClean === MASTER_ADMIN_SECRET_KEY;
}

/**
 * Checks if current admin session is authenticated
 */
export function isStoredAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTHENTICATED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setStoredAdminAuthenticated(auth: boolean): void {
  try {
    if (auth) {
      localStorage.setItem(ADMIN_AUTHENTICATED_KEY, "true");
      broadcastAuthEvent({ type: "ADMIN_LOGIN", timestamp: Date.now() });
    } else {
      localStorage.removeItem(ADMIN_AUTHENTICATED_KEY);
      broadcastAuthEvent({ type: "ADMIN_LOGOUT", timestamp: Date.now() });
    }
  } catch (e) {
    console.warn("Could not set admin auth storage", e);
  }
}

// ==========================================
// 🔑 CENTRAL 1-DAY ACCESS KEYS DATABASE
// ==========================================

export const INITIAL_SEEDED_ACCESS_KEYS: AccessKeyRecord[] = [
  {
    id: "key_maria",
    key: "maria",
    label: "Maria Steidle VIP 24h Vollzugriff",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 8760,
    createdBy: SUPERADMIN_EMAIL,
    usedCount: 0,
    isActive: true,
    notes: "VIP Dauerzugang für Maria Steidle zu allen 8 Cores",
  },
  {
    id: "key_mariasteidle",
    key: "mariasteidle",
    label: "Maria Steidle VIP Pass",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 8760,
    createdBy: SUPERADMIN_EMAIL,
    usedCount: 0,
    isActive: true,
    notes: "VIP Dauerzugang für Maria Steidle",
  },
  {
    id: "key_otto",
    key: "otto",
    label: "Otto VIP 1-Tag Vollzugriff",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 24,
    createdBy: SUPERADMIN_EMAIL,
    usedCount: 0,
    isActive: true,
    notes: "1-Tag Test-Key für Otto mit Zugriff auf alle 8 Cores",
  },
  {
    id: "key_vip2026",
    key: "VIP2026",
    label: "VIP 2026 Sovereign Pass",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 24,
    createdBy: SUPERADMIN_EMAIL,
    usedCount: 0,
    isActive: true,
    notes: "Offizieller 24h VIP-Key für alle 8 Cores",
  },
  {
    id: "key_matrix_test",
    key: "MATRIX-24H",
    label: "Matrix 24h Full Fleet Access",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 24,
    createdBy: SUPERADMIN_EMAIL,
    usedCount: 0,
    isActive: true,
    notes: "Testkey für 8 Cores",
  },
];

/**
 * Returns all stored access keys from database
 */
export function getAccessKeysDatabase(): AccessKeyRecord[] {
  try {
    const raw = localStorage.getItem(ACCESS_KEYS_STORAGE_KEY);
    if (raw) {
      const parsed: AccessKeyRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure 'otto', 'maria', 'mariasteidle' keys are always present and active
        const requiredKeys = ["otto", "maria", "mariasteidle"];
        let needsSave = false;

        requiredKeys.forEach((reqKey) => {
          const found = parsed.find((k) => k.key.trim().toLowerCase() === reqKey);
          if (!found) {
            const seed = INITIAL_SEEDED_ACCESS_KEYS.find((k) => k.key.trim().toLowerCase() === reqKey);
            if (seed) {
              parsed.unshift(seed);
              needsSave = true;
            }
          } else if (new Date(found.expiresAt).getTime() < Date.now()) {
            // Auto renew
            found.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
            found.isActive = true;
            needsSave = true;
          }
        });

        if (needsSave) {
          saveAccessKeysDatabase(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load access keys database", e);
  }

  saveAccessKeysDatabase(INITIAL_SEEDED_ACCESS_KEYS);
  return INITIAL_SEEDED_ACCESS_KEYS;
}

/**
 * Persists access keys to localStorage and syncs with server API
 */
export function saveAccessKeysDatabase(keys: AccessKeyRecord[]): void {
  try {
    localStorage.setItem(ACCESS_KEYS_STORAGE_KEY, JSON.stringify(keys));
    broadcastAuthEvent({
      type: "STATUS_CHANGED",
      timestamp: Date.now(),
    });

    if (typeof fetch !== "undefined") {
      fetch("/api/access-keys/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error("Failed to save access keys database", e);
  }
}

/**
 * Sync access keys from server API
 */
export async function syncAccessKeysWithServer(): Promise<AccessKeyRecord[]> {
  try {
    if (typeof fetch === "undefined") return getAccessKeysDatabase();
    const res = await fetch("/api/access-keys");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.keys) && data.keys.length > 0) {
        const local = getAccessKeysDatabase();
        const mergedMap = new Map<string, AccessKeyRecord>();
        local.forEach((k) => mergedMap.set(k.key.trim().toLowerCase(), k));
        data.keys.forEach((k: AccessKeyRecord) => {
          if (k.key) mergedMap.set(k.key.trim().toLowerCase(), k);
        });
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(ACCESS_KEYS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.warn("Could not sync access keys with server", e);
  }
  return getAccessKeysDatabase();
}

/**
 * ADMIN ONLY: Create a new access key (Supports Closed Beta Tester & Sovereign access keys)
 */
export function createAccessKey(
  keyOrParams:
    | string
    | {
        key: string;
        label?: string;
        durationHours?: number;
        notes?: string;
        createdBy?: string;
        role?: UserRole;
        isBetaTesterKey?: boolean;
      },
  label?: string,
  durationHours: number = 24,
  notes?: string,
  adminEmail: string = SUPERADMIN_EMAIL,
  role?: UserRole
): AccessKeyRecord {
  let cleanKey = "";
  let keyLabel = label;
  let keyDuration = durationHours;
  let keyNotes = notes;
  let keyAdmin = adminEmail;
  let keyRole: UserRole = role || "SOVEREIGN";
  let isBeta = false;

  if (typeof keyOrParams === "object" && keyOrParams !== null) {
    cleanKey = (keyOrParams.key || "").trim();
    keyLabel = keyOrParams.label || undefined;
    keyDuration = keyOrParams.durationHours !== undefined ? keyOrParams.durationHours : 24;
    keyNotes = keyOrParams.notes || undefined;
    keyAdmin = keyOrParams.createdBy || SUPERADMIN_EMAIL;
    keyRole = keyOrParams.role || "SOVEREIGN";
    isBeta = keyOrParams.isBetaTesterKey || keyRole === "CLOSED_BETA_TESTER";
  } else if (typeof keyOrParams === "string") {
    cleanKey = keyOrParams.trim();
  }

  if (!cleanKey) {
    throw new Error("Key cannot be empty");
  }

  // Auto-detect 16-digit or Beta key
  const stripped = cleanKey.replace(/[\s\-]/g, "");
  if (stripped.length === 16 && /^\d+$/.test(stripped)) {
    isBeta = true;
    keyRole = "CLOSED_BETA_TESTER";
  }

  const keys = getAccessKeysDatabase();
  const existingIdx = keys.findIndex((k) => {
    const kClean = k.key.trim().toLowerCase();
    const kStripped = k.key.replace(/[\s\-]/g, "").toLowerCase();
    return kClean === cleanKey.toLowerCase() || kStripped === stripped.toLowerCase();
  });
  const now = new Date();
  const expiresAt = new Date(now.getTime() + keyDuration * 60 * 60 * 1000).toISOString();

  const newKeyRecord: AccessKeyRecord = {
    id: `key_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    key: cleanKey,
    label: keyLabel?.trim() || (isBeta ? `Closed Beta Tester Key (${cleanKey})` : `${cleanKey} (${keyDuration}h Key)`),
    createdAt: now.toISOString(),
    expiresAt,
    durationHours: keyDuration,
    createdBy: keyAdmin,
    usedCount: 0,
    isActive: true,
    role: keyRole,
    isBetaTesterKey: isBeta,
    notes: keyNotes?.trim() || `Erstellt am ${now.toLocaleDateString("de-DE")} von ${keyAdmin} (Rang: ${keyRole}, Gültig: ${keyDuration}h)`,
  };

  if (existingIdx >= 0) {
    // Update existing key
    keys[existingIdx] = {
      ...keys[existingIdx],
      expiresAt,
      durationHours: keyDuration,
      label: keyLabel?.trim() || keys[existingIdx].label,
      isActive: true,
      role: keyRole,
      isBetaTesterKey: isBeta,
      notes: keyNotes?.trim() || keys[existingIdx].notes,
    };
    saveAccessKeysDatabase(keys);
    return keys[existingIdx];
  } else {
    keys.unshift(newKeyRecord);
    saveAccessKeysDatabase(keys);
    return newKeyRecord;
  }
}

/**
 * ADMIN ONLY: Delete an access key
 */
export function deleteAccessKey(idOrKey: string): boolean {
  const keys = getAccessKeysDatabase();
  const target = idOrKey.trim().toLowerCase();
  const filtered = keys.filter((k) => k.id.toLowerCase() !== target && k.key.toLowerCase() !== target);
  saveAccessKeysDatabase(filtered);
  return true;
}

/**
 * ADMIN ONLY: Toggle active state of access key
 */
export function toggleAccessKeyStatus(idOrKey: string, active?: boolean): AccessKeyRecord | null {
  const keys = getAccessKeysDatabase();
  const target = idOrKey.trim().toLowerCase();
  const found = keys.find((k) => k.id.toLowerCase() === target || k.key.toLowerCase() === target);
  if (found) {
    found.isActive = active !== undefined ? active : !found.isActive;
    saveAccessKeysDatabase(keys);
    return found;
  }
  return null;
}

/**
 * ADMIN ONLY: Extend duration of access key (+24h)
 */
export function extendAccessKeyDuration(idOrKey: string, additionalHours: number = 24): boolean {
  const keys = getAccessKeysDatabase();
  const target = idOrKey.trim().toLowerCase();
  const found = keys.find((k) => k.id.toLowerCase() === target || k.key.toLowerCase() === target);
  if (found) {
    const currentExpiry = new Date(found.expiresAt).getTime();
    const base = currentExpiry > Date.now() ? currentExpiry : Date.now();
    found.expiresAt = new Date(base + additionalHours * 60 * 60 * 1000).toISOString();
    found.isActive = true;
    saveAccessKeysDatabase(keys);
    return true;
  }
  return false;
}

/**
 * PUBLIC / USER: Validate and redeem access key (e.g. "otto")
 * Instant 1-Day Full Sovereign Access to all 8 cores without registration
 */
export function validateAndRedeemAccessKey(rawKey: string): {
  success: boolean;
  message: string;
  keyRecord?: AccessKeyRecord;
  sessionEmail?: string;
} {
  const cleanKey = (rawKey || "").trim();
  if (!cleanKey) {
    return { success: false, message: "Bitte gib einen Zugangs-Key ein." };
  }

  // 1. Check master admin secret key bypass
  if (verifyAdminSecretKey(cleanKey)) {
    setStoredAdminAuthenticated(true);
    setCurrentUserEmail(SUPERADMIN_EMAIL);
    return {
      success: true,
      message: "👑 Master-Admin Schlüssel erkannt! Voller Root-Zugriff freigeschaltet.",
      sessionEmail: SUPERADMIN_EMAIL,
    };
  }

  // 2. Look up in access keys database
  let keys = getAccessKeysDatabase();
  const strippedKey = cleanKey.replace(/[\s\-]/g, "").toLowerCase();
  let found = keys.find((k) => {
    const kClean = k.key.trim().toLowerCase();
    const kStripped = k.key.replace(/[\s\-]/g, "").toLowerCase();
    return kClean === cleanKey.toLowerCase() || kStripped === strippedKey;
  });

  // If not found in primary list, check if it's a 16-digit numeric Beta key or in secondary storage
  if (!found && strippedKey.length === 16 && /^\d+$/.test(strippedKey)) {
    // Format nicely XXXX-XXXX-XXXX-XXXX
    const formatted = `${strippedKey.slice(0, 4)}-${strippedKey.slice(4, 8)}-${strippedKey.slice(8, 12)}-${strippedKey.slice(12, 16)}`;
    const now = new Date();
    const newBetaKey: AccessKeyRecord = {
      id: `key_beta_${strippedKey}_${Date.now()}`,
      key: formatted,
      label: `Closed Beta Tester (#${strippedKey.slice(0, 4)})`,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 720 * 60 * 60 * 1000).toISOString(),
      durationHours: 720,
      createdBy: SUPERADMIN_EMAIL,
      usedCount: 0,
      isActive: true,
      role: "CLOSED_BETA_TESTER",
      isBetaTesterKey: true,
      notes: "Auto-registered Closed Beta Tester Key (16-Digit Full 8-Core Access)",
    };
    keys.unshift(newBetaKey);
    saveAccessKeysDatabase(keys);
    found = newBetaKey;
  }

  if (!found) {
    return {
      success: false,
      message: `Ungültiger Key '${cleanKey}'. Bitte überprüfe die 16 Zahlen oder fordere beim Admin einen neuen Key an.`,
    };
  }

  if (!found.isActive) {
    return {
      success: false,
      message: `Der Key '${found.key}' wurde vom Administrator vorübergehend deaktiviert.`,
    };
  }

  const expiresMs = new Date(found.expiresAt).getTime();
  const nowMs = Date.now();
  if (!isNaN(expiresMs) && nowMs >= expiresMs) {
    return {
      success: false,
      message: `Dieser Key '${found.key}' ist leider abgelaufen (Gültigkeit: ${found.durationHours}h). Bitte neuen Key beim Admin anfordern.`,
    };
  }

  // Determine if this is a CLOSED BETA TESTER key
  const isBetaTester =
    found.role === "CLOSED_BETA_TESTER" ||
    found.isBetaTesterKey === true ||
    (found.label && found.label.toLowerCase().includes("beta")) ||
    (strippedKey.length === 16 && /^\d+$/.test(strippedKey));

  const assignedRole: UserRole = isBetaTester ? "CLOSED_BETA_TESTER" : (found.role || "SOVEREIGN");

  // 3. Mark key as used & save
  found.usedCount = (found.usedCount || 0) + 1;
  saveAccessKeysDatabase(keys);

  // 4. Create an automatic user session & lead record for this key user
  const sessionEmail = `key_${found.key.toLowerCase().replace(/[^a-z0-9]/g, "")}@syntax.local`;
  const leads = getLeadsDatabase();
  const existingLeadIdx = leads.findIndex((l) => l.email.trim().toLowerCase() === sessionEmail);

  const keyLead: LeadRecord = {
    id: `lead_key_${found.key.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    name: found.label || (isBetaTester ? `Closed Beta Tester (#${found.key})` : `Key-Nutzer (${found.key})`),
    email: sessionEmail,
    slot: existingLeadIdx >= 0 ? leads[existingLeadIdx].slot : Math.max(1, 500 - leads.length),
    plan: "ENTERPRISE_99",
    planName: isBetaTester ? "CLOSED BETA TESTER PASS (8 CORES)" : "SOVEREIGN MATRIX (8 CORES)",
    priceMonthly: 0,
    registeredAt: found.createdAt,
    trialExpiresAt: found.expiresAt,
    status: "TRIAL_ACTIVE",
    grantedAt: new Date().toISOString(),
    grantedBy: SUPERADMIN_EMAIL,
    token: `KEY-${found.key.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
    goal: isBetaTester
      ? "Offizieller Closed Beta Tester Zugang (Alle 8 Cores freigeschaltet, kein Admin-Zugriff)"
      : "Zugang über 1-Tages-Key freigeschaltet (Alle 8 Cores)",
    notes: `Vollzugriff via Key '${found.key}' (Rang: ${assignedRole}, Gültig bis ${new Date(found.expiresAt).toLocaleString("de-DE")})`,
    accessKey: found.key,
  };

  if (existingLeadIdx >= 0) {
    leads[existingLeadIdx] = keyLead;
  } else {
    leads.unshift(keyLead);
  }
  saveLeadsDatabase(leads);

  // 5. Store session in localStorage (Strictly enforce NO ADMIN privileges!)
  setStoredAdminAuthenticated(false);
  setCurrentUserEmail(sessionEmail);
  try {
    localStorage.setItem(ACTIVE_ACCESS_KEY_STORAGE, JSON.stringify(found));
    localStorage.setItem(
      "maze_registered_vip_user",
      JSON.stringify({
        name: keyLead.name,
        email: sessionEmail,
        slot: keyLead.slot,
        token: keyLead.token,
        plan: "ENTERPRISE_99",
        trialExpiresAt: found.expiresAt,
        accessKey: found.key,
        role: assignedRole,
      })
    );

    // Update user profile with explicit assignedRole (e.g. CLOSED_BETA_TESTER)
    const currentProfileRaw = localStorage.getItem("maze_user_profile_v2");
    const currentProfile = currentProfileRaw ? JSON.parse(currentProfileRaw) : {};
    const updatedProfile = {
      ...currentProfile,
      name: keyLead.name,
      email: sessionEmail,
      purchasedRole: assignedRole,
      promoSession: {
        isEarlyBird: true,
        isDiscordVerified: true,
        promoTrialStartedAt: new Date().toISOString(),
        promoTrialExpiresAt: found.expiresAt,
      },
    };
    localStorage.setItem("maze_user_profile_v2", JSON.stringify(updatedProfile));
  } catch (e) {
    console.warn("Could not save key user session", e);
  }

  // 6. Broadcast event across all monitors/windows
  broadcastAuthEvent({
    type: "STATUS_CHANGED",
    email: sessionEmail,
    status: "TRIAL_ACTIVE",
    timestamp: Date.now(),
  });

  return {
    success: true,
    message: isBetaTester
      ? `🧪 Key '${found.key}' verifiziert! Rang CLOSED BETA TESTER aktiviert – Voller 8-Core Zugriff freigeschaltet (Benutzer-Modus ohne Admin-Rechte).`
      : `🚀 Key '${found.key}' erfolgreich aktiviert! ${found.durationHours} Stunden Vollzugriff auf alle 8 Cores freigeschaltet.`,
    keyRecord: found,
    sessionEmail,
  };
}

/**
 * Returns currently active redeemed key from storage if valid
 */
export function getActiveAccessKey(): AccessKeyRecord | null {
  try {
    const raw = localStorage.getItem(ACTIVE_ACCESS_KEY_STORAGE);
    if (raw) {
      const parsed: AccessKeyRecord = JSON.parse(raw);
      if (parsed && new Date(parsed.expiresAt).getTime() > Date.now()) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * Builds the direct 1-click activation URL for a specific access key
 */
export function generateKeyDirectUrl(key: string): string {
  const clean = key.trim();
  return `https://maze-fullacces-core-assistant.ai.studio/?key=${encodeURIComponent(clean)}`;
}

/**
 * Formats a high-conversion WhatsApp invitation message with 1-click direct link
 */
export function generateKeyWhatsAppInvite(keyRecord: AccessKeyRecord): string {
  const directLink = generateKeyDirectUrl(keyRecord.key);
  const hours = keyRecord.durationHours || 24;
  return `🚀 *S.Y.N.T.A.X. Quantum – Dein persönlicher ${hours}h VIP-Vollzugriff ist da!*

Hallo! Dein exklusiver ${hours}-Stunden-Vollzugriff auf alle 8 KI-Spezialisten (S.Y.N.T.A.X., N.E.O., V.E.G.A., O.D.I.N., P.U.L.S.E., C.H.R.O.N.O.S., O.R.A.C.L.E., G.L.O.B.E.) wurde freigeschaltet:

⚡ *1-Klick-Direktstart (Automatische Aktivierung):*
👉 ${directLink}

🔑 *Dein Key:* \`${keyRecord.key}\`
⏱️ *Gültigkeit:* ${hours} Stunden Vollzugriff
🛡️ *100% Anonym:* Keine Registrierung & kein Passwort nötig.

Einfach auf den Link klicken und sofort im Dashboard loslegen!`;
}

/**
 * Formats a professional E-Mail invitation text with subject and 1-click direct link
 */
export function generateKeyEmailInvite(keyRecord: AccessKeyRecord): { subject: string; body: string } {
  const directLink = generateKeyDirectUrl(keyRecord.key);
  const hours = keyRecord.durationHours || 24;
  const subject = `🔑 Dein S.Y.N.T.A.X. ${hours}h VIP-Vollzugriff (Key: ${keyRecord.key})`;
  const body = `Hallo,

dein persönlicher ${hours}-Stunden VIP-Vollzugriff auf das S.Y.N.T.A.X. Quantum Multi-Agenten-System wurde soeben aktiviert.

Du hast damit uneingeschränkten Zugriff auf alle 8 autonomen KI-Cores:
- S.Y.N.T.A.X. // Sovereign Central Router
- N.E.O. // 3D Hologramm & Strategie-Kommandant
- M.E.M.O.R.Y.S. / V.E.G.A. // Neural Vektor-Langzeitgedächtnis
- G.M.A.I.L. // Autonome Posteingang-Synchronisation
- V.E.O.3 // Google Veo 8K Video Studio & Reels Generator
- C.H.R.O.N.O.S. // Kalender & Zeit-Automatisierung
- O.R.A.C.L.E. // Krypto & Finanz-Quant-Analytik
- O.D.I.N. // Echtzeit-Screen-Perception & 4096-Bit Schutz

👉 Klicke hier für die sofortige 1-Klick-Aktivierung:
${directLink}

Alternativ:
1. Öffne https://maze-fullacces-core-assistant.ai.studio/
2. Klicke oben auf "Mit Key anmelden"
3. Gib deinen Key ein: ${keyRecord.key}

Gültig für ${hours} Stunden ab Aktivierung.

Viel Erfolg mit deinem neuen KI-Cockpit!
Dein S.Y.N.T.A.X. Team`;

  return { subject, body };
}

/**
 * Checks URL query parameters on application startup for auto-redeem (?key=xyz or ?access_key=xyz)
 */
export function autoRedeemKeyFromUrlQuery(): {
  redeemed: boolean;
  key?: string;
  result?: ReturnType<typeof validateAndRedeemAccessKey>;
} {
  if (typeof window === "undefined" || !window.location) {
    return { redeemed: false };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const keyParam = params.get("key") || params.get("access_key") || params.get("k") || params.get("code");

    if (keyParam && keyParam.trim().length > 0) {
      const cleanKey = keyParam.trim();
      const res = validateAndRedeemAccessKey(cleanKey);
      
      // Clean up URL parameter cleanly without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("key");
      url.searchParams.delete("access_key");
      url.searchParams.delete("k");
      url.searchParams.delete("code");
      window.history.replaceState({}, document.title, url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""));

      return {
        redeemed: res.success,
        key: cleanKey,
        result: res,
      };
    }
  } catch (e) {
    console.warn("Could not check key from URL query", e);
  }

  return { redeemed: false };
}

// Initial seed database with early signups - The ONLY pre-installed account is FULL CORE ADMIN philippsteidle5@gmail.com
const INITIAL_SEEDED_LEADS: LeadRecord[] = [
  {
    id: "lead_admin_philipp_steidle",
    name: "Philipp Steidle",
    email: "philippsteidle5@gmail.com",
    slot: 1,
    plan: "ENTERPRISE_99",
    planName: "FULL CORE ADMIN (SUPERADMIN ROOT)",
    priceMonthly: 0,
    registeredAt: "2026-01-01T00:00:00.000Z",
    registeredDate: "01.01.2026",
    registeredTime: "00:00:00 Uhr",
    trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "GRANTED",
    grantedAt: new Date().toISOString(),
    grantedBy: SUPERADMIN_EMAIL,
    token: "MZ-SUPERADMIN-FULLCORE-ROOT-9988",
    goal: "Full Core Admin & Sovereign Root Orchestration (Alle 8 KI-Cores)",
    notes: "Vorinstallierter Full Core Admin Account - Voller Root Zugriff",
    source: "Master Admin Root Installation",
    device: "Desktop",
  },
];

/**
 * Returns all stored leads from the database
 */
export function getLeadsDatabase(): LeadRecord[] {
  try {
    const raw = localStorage.getItem(DATABASE_STORAGE_KEY);
    if (raw) {
      const parsed: LeadRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure Philipp Steidle admin is present in existing cached databases
        const adminFound = parsed.find(
          (l) => l.email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
        );
        if (!adminFound) {
          parsed.unshift(INITIAL_SEEDED_LEADS[0]);
          saveLeadsDatabase(parsed);
        } else if (adminFound.status !== "GRANTED") {
          adminFound.status = "GRANTED";
          adminFound.grantedBy = SUPERADMIN_EMAIL;
          saveLeadsDatabase(parsed);
        }
        return parsed.sort((a, b) => {
          const timeA = new Date(a.registeredAt || 0).getTime();
          const timeB = new Date(b.registeredAt || 0).getTime();
          return timeB - timeA;
        });
      }
    }
  } catch (e) {
    console.error("Failed to load leads database", e);
  }

  // Seed default if empty
  saveLeadsDatabase(INITIAL_SEEDED_LEADS);
  return INITIAL_SEEDED_LEADS;
}

/**
 * Fetch latest database from server and merge (sorted newest first)
 */
export async function syncLeadsWithServer(): Promise<LeadRecord[]> {
  try {
    if (typeof fetch === "undefined") return getLeadsDatabase();
    const res = await fetch("/api/leads");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.leads) && data.leads.length > 0) {
        const local = getLeadsDatabase();
        const mergedMap = new Map<string, LeadRecord>();
        
        local.forEach((item) => mergedMap.set(item.email.trim().toLowerCase(), item));
        data.leads.forEach((item: LeadRecord) => {
          if (item.email) {
            const key = item.email.trim().toLowerCase();
            const existing = mergedMap.get(key);
            mergedMap.set(key, { ...existing, ...item });
          }
        });

        const mergedList = Array.from(mergedMap.values()).sort((a, b) => {
          const timeA = new Date(a.registeredAt || 0).getTime();
          const timeB = new Date(b.registeredAt || 0).getTime();
          return timeB - timeA;
        });
        localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(mergedList));
        return mergedList;
      }
    }
  } catch (e) {
    console.warn("Could not sync leads with server", e);
  }
  return getLeadsDatabase();
}

/**
 * Persists leads array to localStorage and broadcasts sync event
 */
export function saveLeadsDatabase(leads: LeadRecord[]): void {
  try {
    localStorage.setItem(DATABASE_STORAGE_KEY, JSON.stringify(leads));
    broadcastAuthEvent({
      type: "STATUS_CHANGED",
      timestamp: Date.now(),
    });

    // Background sync to server API so other browsers/devices receive it
    if (typeof fetch !== "undefined") {
      fetch("/api/leads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error("Failed to save leads database", e);
  }
}

/**
 * Trigger immediate session kick across all open browser windows, tabs, and devices
 */
export function kickAccountImmediately(email: string, reason: string = "Account wurde vom Administrator gesperrt."): void {
  const cleanEmail = email.trim().toLowerCase();
  
  // Store in local blocked cache
  try {
    const rawBlocked = localStorage.getItem("syntax_kicked_accounts_cache") || localStorage.getItem("maze_kicked_accounts_cache") || "[]";
    const blockedList: string[] = JSON.parse(rawBlocked);
    if (!blockedList.includes(cleanEmail)) {
      blockedList.push(cleanEmail);
      localStorage.setItem("syntax_kicked_accounts_cache", JSON.stringify(blockedList));
    }
  } catch {}

  // 1. BroadcastChannel across all tabs & monitors
  broadcastAuthEvent({
    type: "SESSION_KICK",
    email: cleanEmail,
    status: "REVOKED",
    timestamp: Date.now(),
    reason,
  });

  // 2. Server API Kick so all devices / browsers get terminated
  if (typeof fetch !== "undefined") {
    fetch("/api/leads/kick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, reason }),
    }).catch(() => {});
  }
}

/**
 * Checks if a given email is the designated Superadmin
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === SUPERADMIN_EMAIL.toLowerCase() ||
    clean === "philippsteidle5" ||
    clean.startsWith("philippsteidle5@") ||
    clean.includes("philippsteidle5")
  );
}

/**
 * Returns currently logged in or active user email
 */
export function getCurrentUserEmail(): string {
  try {
    const email = localStorage.getItem(CURRENT_LOGGED_IN_EMAIL_KEY);
    if (email && email.trim().length > 0) return email.trim().toLowerCase();

    const legacyEmail = localStorage.getItem("maze_current_user_email");
    if (legacyEmail && legacyEmail.trim().length > 0) return legacyEmail.trim().toLowerCase();

    const vipRaw = localStorage.getItem("maze_registered_vip_user");
    if (vipRaw) {
      const parsed = JSON.parse(vipRaw);
      if (parsed?.email && typeof parsed.email === "string" && parsed.email.trim().length > 0) {
        return parsed.email.trim().toLowerCase();
      }
    }
  } catch {
    // fallback
  }

  // Only return Superadmin email if explicitly authenticated with Master PIN / Key
  if (isStoredAdminAuthenticated()) {
    return SUPERADMIN_EMAIL;
  }

  return "";
}

/**
 * Sets the active user email session
 */
export function setCurrentUserEmail(email: string): void {
  try {
    const clean = email.trim().toLowerCase();
    localStorage.setItem(CURRENT_LOGGED_IN_EMAIL_KEY, clean);
    localStorage.setItem("maze_current_user_email", clean);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("syntax_auth_state_change", { detail: { email: clean, type: "LOGIN" } }));
      window.dispatchEvent(new CustomEvent("syntax_daily_usage_updated", { detail: { accountSwitched: true, userEmail: clean } }));
      localStorage.setItem("syntax_auth_sync_tick", Date.now().toString());
    }
  } catch (e) {
    console.warn("Could not save current user email", e);
  }
}

/**
 * Check access rights for an email.
 * - Admin always has unrestricted root access
 * - Granted users have full access
 * - Active trial users have access during their 24h trial
 * - Otherwise access requires admin approval
 */
export function checkEmailAccessStatus(email: string): {
  hasAccess: boolean;
  isAdmin: boolean;
  status: AccessStatus | "UNREGISTERED";
  record?: LeadRecord;
  reason: string;
} {
  const cleanEmail = email.trim().toLowerCase();

  if (isSuperAdminEmail(cleanEmail)) {
    return {
      hasAccess: true,
      isAdmin: true,
      status: "GRANTED",
      reason: "Superadmin Root Privileges (philippsteidle5@gmail.com)",
    };
  }

  // Maria Steidle VIP Whitelist: Instant full access
  if (cleanEmail.includes("maria") || cleanEmail.includes("steidle")) {
    return {
      hasAccess: true,
      isAdmin: false,
      status: "GRANTED",
      reason: "VIP Dauerzugang für Maria Steidle freigeschaltet",
    };
  }

  const leads = getLeadsDatabase();
  let found = leads.find((l) => l.email.trim().toLowerCase() === cleanEmail);

  if (!found && cleanEmail) {
    // Flexible fallback: match by username before domain or name
    found = leads.find((l) => {
      const lEmail = l.email.trim().toLowerCase();
      const lName = l.name.trim().toLowerCase();
      return (
        lEmail === cleanEmail ||
        (cleanEmail.includes("maria") && cleanEmail.includes("steidle") && lEmail.includes("maria")) ||
        lName === cleanEmail
      );
    });
  }

  if (!found) {
    return {
      hasAccess: false,
      isAdmin: false,
      status: "UNREGISTERED",
      reason: "Email ist noch nicht registriert. Bitte trage dich in die 500-Plätze-Liste ein.",
    };
  }

  // If Admin specifically granted access
  if (found.status === "GRANTED") {
    return {
      hasAccess: true,
      isAdmin: false,
      status: "GRANTED",
      record: found,
      reason: "Zugang wurde freigeschaltet (Vollzugriff aktiv).",
    };
  }

  // If Trial is active or newly registered (Instant access for everyone up to 500 slots!)
  if (found.status === "TRIAL_ACTIVE" || found.status === "PENDING_APPROVAL") {
    const expiresMs = new Date(found.trialExpiresAt).getTime();
    if (!isNaN(expiresMs) && Date.now() < expiresMs) {
      return {
        hasAccess: true,
        isAdmin: false,
        status: "TRIAL_ACTIVE",
        record: found,
        reason: "1-Tag-Vollzugriff (24h) ist aktiv. 50.000 Tokens bereit.",
      };
    } else {
      // Check if user has linked a payment method in their profile
      try {
        const rawProfile = localStorage.getItem("syntax_user_terminal_profile_" + cleanEmail);
        if (rawProfile) {
          const parsed = JSON.parse(rawProfile);
          if (Array.isArray(parsed.paymentMethods) && parsed.paymentMethods.length > 0) {
            return {
              hasAccess: true,
              isAdmin: false,
              status: "GRANTED",
              record: found,
              reason: "Zahlungsmethode hinterlegt — Vollzugriff aktiv.",
            };
          }
        }
      } catch {}

      // Trial expired without payment method -> SYSTEM TOT (Killswitch)
      return {
        hasAccess: false,
        isAdmin: false,
        status: "REVOKED",
        record: found,
        reason: "SYSTEM TOT // 24h Testphase abgelaufen. Keine Zahlungsmethode hinterlegt.",
      };
    }
  }

  if (found.status === "REVOKED") {
    return {
      hasAccess: false,
      isAdmin: false,
      status: "REVOKED",
      record: found,
      reason: "SYSTEM TOT // Zugriff gesperrt oder 24h Testphase ohne Zahlungsmethode abgelaufen.",
    };
  }

  // Instant default trial for registered leads
  return {
    hasAccess: true,
    isAdmin: false,
    status: "TRIAL_ACTIVE",
    record: found,
    reason: "1-Tag-Vollzugriff (24h) freigeschaltet.",
  };
}

/**
 * Adds a new lead into the central database
 */
export function registerNewLead(data: {
  name: string;
  email: string;
  plan?: "PRO_29" | "ENTERPRISE_99";
  slot?: number;
  goal?: string;
  token?: string;
  source?: string;
  notes?: string;
  device?: string;
  trialDays?: number;
}): LeadRecord {
  const leads = getLeadsDatabase();
  const cleanEmail = data.email.trim().toLowerCase();

  // If user already exists, update their record
  const existingIndex = leads.findIndex((l) => l.email.trim().toLowerCase() === cleanEmail);
  const now = new Date();
  const days = data.trialDays || (data.source?.includes("3 Tage") || data.source?.includes("VIP") ? 3 : 1);
  const trialEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const slotNum = typeof data.slot === "number" && !isNaN(data.slot) ? data.slot : 463;
  const sourceStr = data.source || `VIP Warteliste (3 Tage gratis) [Slot #${slotNum}]`;
  const dateStr = now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " Uhr";

  const detectedDevice =
    data.device ||
    (typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      ? "Mobilgerät"
      : "Desktop");

  const newRecord: LeadRecord = {
    id: existingIndex >= 0 ? leads[existingIndex].id : `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: (data.name || "VIP Interessent").trim(),
    email: cleanEmail,
    slot: slotNum,
    plan: data.plan || "PRO_29",
    planName: data.plan === "ENTERPRISE_99" ? "SOVEREIGN ENTERPRISE" : "PRO SOVEREIGN CORE",
    priceMonthly: data.plan === "ENTERPRISE_99" ? 99 : 29,
    registeredAt: now.toISOString(),
    registeredDate: dateStr,
    registeredTime: timeStr,
    trialExpiresAt: trialEnd.toISOString(),
    status: "TRIAL_ACTIVE",
    token: data.token || `VIP-${slotNum}-${Date.now().toString().slice(-4)}`,
    goal: data.goal || `VIP Launch Notification (Slot #${slotNum})`,
    source: sourceStr,
    notes: data.notes || `Eingetragen am ${dateStr} um ${timeStr} über ${sourceStr}`,
    device: detectedDevice,
  };

  if (existingIndex >= 0) {
    // Keep granted status if already granted
    if (leads[existingIndex].status === "GRANTED") {
      newRecord.status = "GRANTED";
      newRecord.grantedAt = leads[existingIndex].grantedAt;
      newRecord.grantedBy = leads[existingIndex].grantedBy;
    } else if (leads[existingIndex].status === "TRIAL_ACTIVE") {
      newRecord.status = "TRIAL_ACTIVE";
      newRecord.trialExpiresAt = leads[existingIndex].trialExpiresAt;
    }
    leads[existingIndex] = newRecord;
  } else {
    leads.unshift(newRecord);
  }

  saveLeadsDatabase(leads);
  setCurrentUserEmail(cleanEmail);

  // Instant server persistence & sync
  if (typeof fetch !== "undefined") {
    fetch("/api/leads/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord),
    }).catch(() => {});
  }

  return newRecord;
}

/**
 * ADMIN ONLY: Unban / Entsperren & Restore Access for a specific lead
 */
export function unbanLeadAndRestoreAccess(
  email: string,
  mode: "TRIAL" | "GRANTED" = "TRIAL",
  adminEmail: string = SUPERADMIN_EMAIL
): boolean {
  if (!isSuperAdminEmail(adminEmail)) {
    console.error("Unauthorized: Only philippsteidle5@gmail.com can unban users!");
    return false;
  }

  const cleanEmail = email.trim().toLowerCase();
  const leads = getLeadsDatabase();
  const found = leads.find((l) => l.email.trim().toLowerCase() === cleanEmail);

  // 1. Remove from local blocked cache
  try {
    const rawBlocked = localStorage.getItem("maze_kicked_accounts_cache") || "[]";
    const blockedList: string[] = JSON.parse(rawBlocked);
    const updatedBlocked = blockedList.filter((e) => e !== cleanEmail);
    localStorage.setItem("maze_kicked_accounts_cache", JSON.stringify(updatedBlocked));
  } catch {}

  const now = new Date();
  const newStatus: AccessStatus = mode === "GRANTED" ? "GRANTED" : "TRIAL_ACTIVE";

  if (found) {
    found.status = newStatus;
    if (mode === "GRANTED") {
      found.grantedAt = now.toISOString();
      found.grantedBy = adminEmail;
    } else {
      found.trialExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      found.grantedAt = now.toISOString();
      found.grantedBy = adminEmail;
    }
    saveLeadsDatabase(leads);
  } else {
    // If not found in list, create new granted record
    const newRecord: LeadRecord = {
      id: `lead_${Date.now()}`,
      name: "Entsperrter Nutzer",
      email: cleanEmail,
      slot: Math.max(1, 500 - leads.length),
      plan: "PRO_29",
      planName: "PRO SOVEREIGN CORE",
      priceMonthly: 29,
      registeredAt: now.toISOString(),
      trialExpiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      status: newStatus,
      grantedAt: now.toISOString(),
      grantedBy: adminEmail,
      token: `MZ-RESTORED-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: "Vom Admin entsperrt",
    };
    leads.unshift(newRecord);
    saveLeadsDatabase(leads);
  }

  // 2. Notify server to remove from server-side kicked blacklist
  if (typeof fetch !== "undefined") {
    fetch("/api/leads/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, status: newStatus, reason: "Vom Administrator entsperrt." }),
    }).catch(() => {});
  }

  // 3. Broadcast status change across all windows and tabs
  broadcastAuthEvent({
    type: "STATUS_CHANGED",
    email: cleanEmail,
    status: newStatus,
    timestamp: Date.now(),
  });

  return true;
}

/**
 * ADMIN ONLY: Grant 1-Day Free Trial to a specific lead
 */
export function grantTrialAccessToLead(email: string, adminEmail: string = SUPERADMIN_EMAIL): boolean {
  return unbanLeadAndRestoreAccess(email, "TRIAL", adminEmail);
}

/**
 * ADMIN ONLY: Batch Approve all Pending Leads with 1-Click
 */
export function approveAllPendingLeads(adminEmail: string = SUPERADMIN_EMAIL): number {
  if (!isSuperAdminEmail(adminEmail)) {
    console.error("Unauthorized: Only philippsteidle5@gmail.com can approve leads!");
    return 0;
  }

  const leads = getLeadsDatabase();
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let count = 0;

  leads.forEach((l) => {
    if (l.status === "PENDING_APPROVAL" || l.status === "REVOKED") {
      l.status = "TRIAL_ACTIVE";
      l.trialExpiresAt = trialEnd.toISOString();
      l.grantedAt = now.toISOString();
      l.grantedBy = adminEmail;
      count++;
    }
  });

  if (count > 0) {
    saveLeadsDatabase(leads);
  }
  return count;
}

/**
 * ADMIN ONLY: Grant permanent full access ("GEWÄHREN") to a specific lead
 */
export function grantAccessToLead(email: string, adminEmail: string = SUPERADMIN_EMAIL): boolean {
  return unbanLeadAndRestoreAccess(email, "GRANTED", adminEmail);
}

/**
 * ADMIN ONLY: Update status of a specific lead
 */
export function updateLeadStatus(email: string, newStatus: AccessStatus): boolean {
  const leads = getLeadsDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const found = leads.find((l) => l.email.trim().toLowerCase() === cleanEmail);

  if (found) {
    found.status = newStatus;
    if (newStatus === "GRANTED" || newStatus === "TRIAL_ACTIVE") {
      found.grantedAt = new Date().toISOString();
      found.grantedBy = SUPERADMIN_EMAIL;
      if (newStatus === "TRIAL_ACTIVE") {
        found.trialExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
    }
    saveLeadsDatabase(leads);
    
    if (newStatus === "REVOKED") {
      kickAccountImmediately(cleanEmail, "Account wurde vom Administrator gesperrt.");
    } else {
      // Remove from kicked cache
      try {
        const rawBlocked = localStorage.getItem("maze_kicked_accounts_cache") || "[]";
        const blockedList: string[] = JSON.parse(rawBlocked);
        const updatedBlocked = blockedList.filter((e) => e !== cleanEmail);
        localStorage.setItem("maze_kicked_accounts_cache", JSON.stringify(updatedBlocked));
      } catch {}

      if (typeof fetch !== "undefined") {
        fetch("/api/leads/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, status: newStatus }),
        }).catch(() => {});
      }

      broadcastAuthEvent({
        type: "STATUS_CHANGED",
        email: cleanEmail,
        status: newStatus,
        timestamp: Date.now(),
      });
    }
    return true;
  }
  return false;
}

/**
 * ADMIN ONLY: Custom Lead Access & Plan Configuration
 */
export interface CustomLeadUpdate {
  email: string;
  name?: string;
  plan?: "PRO_29" | "ENTERPRISE_99";
  status?: AccessStatus;
  customTrialHours?: number;
  customTrialExpiresAt?: string;
  notes?: string;
  goal?: string;
}

export function updateCustomLeadAccess(update: CustomLeadUpdate, adminEmail: string = SUPERADMIN_EMAIL): boolean {
  if (!isSuperAdminEmail(adminEmail)) {
    console.error("Unauthorized: Only philippsteidle5@gmail.com can modify custom access!");
    return false;
  }

  const leads = getLeadsDatabase();
  const index = leads.findIndex((l) => l.email.trim().toLowerCase() === update.email.trim().toLowerCase());
  if (index === -1) return false;

  const lead = { ...leads[index] };
  if (update.name !== undefined) lead.name = update.name;
  if (update.plan !== undefined) {
    lead.plan = update.plan;
    lead.planName = update.plan === "ENTERPRISE_99" ? "SOVEREIGN ENTERPRISE" : "PRO SOVEREIGN CORE";
    lead.priceMonthly = update.plan === "ENTERPRISE_99" ? 99 : 29;
  }
  if (update.status !== undefined) {
    lead.status = update.status;
    if (update.status === "GRANTED" || update.status === "TRIAL_ACTIVE") {
      lead.grantedAt = new Date().toISOString();
      lead.grantedBy = adminEmail;
    }
  }
  if (update.customTrialHours !== undefined && update.customTrialHours > 0) {
    const now = new Date();
    lead.trialExpiresAt = new Date(now.getTime() + update.customTrialHours * 60 * 60 * 1000).toISOString();
  } else if (update.customTrialExpiresAt) {
    lead.trialExpiresAt = update.customTrialExpiresAt;
  }
  if (update.notes !== undefined) lead.notes = update.notes;
  if (update.goal !== undefined) lead.goal = update.goal;

  leads[index] = lead;
  saveLeadsDatabase(leads);

  if (lead.status === "REVOKED") {
    kickAccountImmediately(lead.email, "Account wurde vom Administrator gesperrt.");
  } else {
    // Remove from kicked cache
    try {
      const rawBlocked = localStorage.getItem("maze_kicked_accounts_cache") || "[]";
      const blockedList: string[] = JSON.parse(rawBlocked);
      const updatedBlocked = blockedList.filter((e) => e !== lead.email.trim().toLowerCase());
      localStorage.setItem("maze_kicked_accounts_cache", JSON.stringify(updatedBlocked));
    } catch {}

    if (typeof fetch !== "undefined") {
      fetch("/api/leads/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lead.email.trim().toLowerCase(), status: lead.status }),
      }).catch(() => {});
    }

    broadcastAuthEvent({
      type: "STATUS_CHANGED",
      email: lead.email,
      status: lead.status,
      timestamp: Date.now(),
    });
  }
  return true;
}

/**
 * ADMIN ONLY: Extend trial by 24 hours
 */
export function extendLeadTrial(email: string, additionalHours: number = 24): boolean {
  const leads = getLeadsDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const found = leads.find((l) => l.email.trim().toLowerCase() === cleanEmail);

  if (found) {
    const currentExpiry = new Date(found.trialExpiresAt).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    found.trialExpiresAt = new Date(baseTime + additionalHours * 60 * 60 * 1000).toISOString();
    found.status = "TRIAL_ACTIVE";
    saveLeadsDatabase(leads);
    broadcastAuthEvent({
      type: "STATUS_CHANGED",
      email: cleanEmail,
      status: "TRIAL_ACTIVE",
      timestamp: Date.now(),
    });
    return true;
  }
  return false;
}

/**
 * ADMIN ONLY: Delete a lead entry
 */
export function deleteLeadRecord(email: string): boolean {
  const leads = getLeadsDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const filtered = leads.filter((l) => l.email.trim().toLowerCase() !== cleanEmail);
  saveLeadsDatabase(filtered);
  kickAccountImmediately(cleanEmail, "Account-Eintrag wurde gelöscht.");
  return true;
}

/**
 * Export all leads as CSV string and auto-trigger file download in browser
 */
export function exportLeadsToCSV(): string {
  const leads = getLeadsDatabase();
  const headers = [
    "Slot",
    "Name",
    "E-Mail",
    "Registrierungs-Datum",
    "Registrierungs-Uhrzeit",
    "Quelle / Herkunft",
    "Plan",
    "Preis (Monat)",
    "Status",
    "Testphase Gültig Bis",
    "Token",
    "Ziel & Notizen",
    "Endgerät",
    "ISO Timestamp",
  ];
  
  const rows = leads.map((l) => {
    const ts = formatLeadTimestamp(l.registeredAt);
    const expiresTs = formatLeadTimestamp(l.trialExpiresAt);
    return [
      `#${l.slot}`,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${ts.dateStr}"`,
      `"${ts.timeStr}"`,
      `"${(l.source || "VIP Warteliste (3 Tage gratis)").replace(/"/g, '""')}"`,
      `"${(l.planName || l.plan || "").replace(/"/g, '""')}"`,
      `"${l.priceMonthly || (l.plan === "ENTERPRISE_99" ? 99 : 29)} €"`,
      `"${l.status}"`,
      `"${expiresTs.fullStr}"`,
      `"${(l.token || "").replace(/"/g, '""')}"`,
      `"${((l.notes ? l.notes + " | " : "") + (l.goal || "")).replace(/"/g, '""')}"`,
      `"${(l.device || "Desktop").replace(/"/g, '""')}"`,
      `"${l.registeredAt || ""}"`,
    ];
  });

  const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  // Trigger browser download if running in client
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `syntax_leads_database_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Could not auto-download CSV blob", e);
    }
  }

  return csvContent;
}

// =========================================================================
// 🔐 CLIENT-SIDE USER AUTHENTICATION & REGISTRATION API HELPERS
// =========================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  planName?: string;
  slot: number;
  token: string;
  status: AccessStatus;
  isFullCoreAdmin: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  notes?: string;
}

export interface AuthResponse {
  ok: boolean;
  message: string;
  error?: string;
  user?: AuthUser;
  sessionToken?: string;
  isKeyAccess?: boolean;
}

/**
 * Standard Login with Robust Querying
 * Checks backend user registry; supports Full Core Admin root credentials or 1-day access keys.
 */
export async function loginUserAccount(emailOrKey: string, password?: string): Promise<AuthResponse> {
  const cleanInput = (emailOrKey || "").trim();
  const cleanPassword = (password || "").trim();

  if (!cleanInput) {
    return {
      ok: false,
      error: "MISSING_CREDENTIALS",
      message: "Bitte gib deine E-Mail oder deinen Zugangs-Key ein.",
    };
  }

  // Check if it's admin master key local bypass
  if (verifyAdminSecretKey(cleanInput) || (isSuperAdminEmail(cleanInput) && (cleanPassword === "admin2026" || cleanPassword === "9988" || cleanPassword === "SYNTAX-9988" || verifyAdminSecretKey(cleanPassword)))) {
    setStoredAdminAuthenticated(true);
    setCurrentUserEmail(SUPERADMIN_EMAIL);
    return {
      ok: true,
      message: "👑 Full Core Admin Root Zugriff gewährt! Alle 8 KI-Cores synchronisiert.",
      user: {
        id: "usr_admin_philipp_steidle",
        email: SUPERADMIN_EMAIL,
        name: "Philipp Steidle",
        role: "FULL_CORE_ADMIN",
        plan: "FULL_CORE_ADMIN",
        planName: "FULL CORE ADMIN (SUPERADMIN ROOT)",
        slot: 1,
        token: "MZ-SUPERADMIN-FULLCORE-ROOT-9988",
        status: "GRANTED",
        isFullCoreAdmin: true,
      },
    };
  }

  // 1. Direct Access Key redemption fallback (supports 16-digit Beta Keys, Otto, etc.)
  if (!cleanInput.includes("@")) {
    const keyRedeem = validateAndRedeemAccessKey(cleanInput);
    if (keyRedeem.success) {
      const rec = keyRedeem.keyRecord;
      const stripped = cleanInput.replace(/[\s\-]/g, "");
      const isBeta = rec?.role === "CLOSED_BETA_TESTER" || (stripped.length === 16 && /^\d+$/.test(stripped));
      const effectiveRole = isBeta ? "CLOSED_BETA_TESTER" : (rec?.role || "SOVEREIGN");
      return {
        ok: true,
        isKeyAccess: true,
        message: keyRedeem.message,
        user: {
          id: rec?.id || `key_${stripped}`,
          email: keyRedeem.sessionEmail || `key_${stripped}@syntax.local`,
          name: rec?.label || (isBeta ? `Closed Beta Tester (#${stripped.slice(0, 4)})` : `Key-User (${cleanInput})`),
          role: effectiveRole,
          plan: "ENTERPRISE_99",
          planName: isBeta ? "CLOSED BETA TESTER PASS (8 CORES)" : "SOVEREIGN KEY PASS (8 CORES)",
          slot: 488,
          token: `KEY-${cleanInput.toUpperCase().replace(/[^A-Z0-9]/g, "")}-9988`,
          status: "GRANTED",
          isFullCoreAdmin: false,
        },
      };
    }
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrKey: cleanInput, password: cleanPassword }),
    });

    const data: AuthResponse = await res.json();

    if (res.ok && data.ok && data.user) {
      setCurrentUserEmail(data.user.email);
      if (data.user.isFullCoreAdmin || isSuperAdminEmail(data.user.email)) {
        setStoredAdminAuthenticated(true);
      }

      // Store VIP session record
      try {
        localStorage.setItem(
          "maze_registered_vip_user",
          JSON.stringify({
            name: data.user.name,
            email: data.user.email,
            slot: data.user.slot,
            token: data.user.token,
            plan: data.user.plan,
            role: data.user.role,
          })
        );
      } catch {}

      broadcastAuthEvent({
        type: "STATUS_CHANGED",
        email: data.user.email,
        status: data.user.status,
        timestamp: Date.now(),
      });

      return data;
    } else {
      // Check if it's an access key locally before giving up
      if (!cleanInput.includes("@")) {
        const localKeyRedeem = validateAndRedeemAccessKey(cleanInput);
        if (localKeyRedeem.success) {
          const rec = localKeyRedeem.keyRecord;
          const stripped = cleanInput.replace(/[\s\-]/g, "");
          const isBeta = rec?.role === "CLOSED_BETA_TESTER" || (stripped.length === 16 && /^\d+$/.test(stripped));
          const effectiveRole = isBeta ? "CLOSED_BETA_TESTER" : (rec?.role || "SOVEREIGN");
          return {
            ok: true,
            isKeyAccess: true,
            message: localKeyRedeem.message,
            user: {
              id: rec?.id || `key_${stripped}`,
              email: localKeyRedeem.sessionEmail || `key_${stripped}@syntax.local`,
              name: rec?.label || (isBeta ? `Closed Beta Tester (#${stripped.slice(0, 4)})` : `Key-User (${cleanInput})`),
              role: effectiveRole,
              plan: "ENTERPRISE_99",
              planName: isBeta ? "CLOSED BETA TESTER PASS (8 CORES)" : "SOVEREIGN KEY PASS (8 CORES)",
              slot: 488,
              token: `KEY-${cleanInput.toUpperCase().replace(/[^A-Z0-9]/g, "")}-9988`,
              status: "GRANTED",
              isFullCoreAdmin: false,
            },
          };
        }
      }

      return {
        ok: false,
        error: data.error || "LOGIN_FAILED",
        message: data.message || "Anmeldung fehlgeschlagen. Bitte überprüfe deine Eingabe.",
      };
    }
  } catch (err: any) {
    // Offline fallback: check local access keys first
    if (!cleanInput.includes("@")) {
      const localKeyRedeem = validateAndRedeemAccessKey(cleanInput);
      if (localKeyRedeem.success) {
        const rec = localKeyRedeem.keyRecord;
        const stripped = cleanInput.replace(/[\s\-]/g, "");
        const isBeta = rec?.role === "CLOSED_BETA_TESTER" || (stripped.length === 16 && /^\d+$/.test(stripped));
        const effectiveRole = isBeta ? "CLOSED_BETA_TESTER" : (rec?.role || "SOVEREIGN");
        return {
          ok: true,
          isKeyAccess: true,
          message: localKeyRedeem.message,
          user: {
            id: rec?.id || `key_${stripped}`,
            email: localKeyRedeem.sessionEmail || `key_${stripped}@syntax.local`,
            name: rec?.label || (isBeta ? `Closed Beta Tester (#${stripped.slice(0, 4)})` : `Key-User (${cleanInput})`),
            role: effectiveRole,
            plan: "ENTERPRISE_99",
            planName: isBeta ? "CLOSED BETA TESTER PASS (8 CORES)" : "SOVEREIGN KEY PASS (8 CORES)",
            slot: 488,
            token: `KEY-${cleanInput.toUpperCase().replace(/[^A-Z0-9]/g, "")}-9988`,
            status: "GRANTED",
            isFullCoreAdmin: false,
          },
        };
      }
    }
    // Offline fallback: check local leads database
    const cleanLower = cleanInput.toLowerCase();
    const leads = getLeadsDatabase();
    const found = leads.find((l) => l.email.toLowerCase() === cleanLower);

    if (found) {
      if (found.status === "REVOKED") {
        return {
          ok: false,
          error: "ACCOUNT_REVOKED",
          message: "Dieser Account wurde vom Administrator gesperrt.",
        };
      }
      setCurrentUserEmail(found.email);
      return {
        ok: true,
        message: "Anmeldung erfolgreich (Offline Modus).",
        user: {
          id: found.id,
          email: found.email,
          name: found.name,
          role: isSuperAdminEmail(found.email) ? "FULL_CORE_ADMIN" : "SOVEREIGN",
          plan: found.plan,
          planName: found.planName,
          slot: found.slot,
          token: found.token,
          status: found.status,
          isFullCoreAdmin: isSuperAdminEmail(found.email),
        },
      };
    }

    return {
      ok: false,
      error: "ACCOUNT_NOT_FOUND",
      message: `Kein Account für '${cleanInput}' gefunden. Bitte erstelle zuerst einen Account über 'Registrieren'.`,
    };
  }
}

/**
 * Helper to check if an email is already registered in the system
 */
export function isEmailAlreadyRegistered(email: string): { exists: boolean; message?: string } {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { exists: false };
  }

  // 1. Check leads database
  const currentLeads = getLeadsDatabase();
  const foundLead = currentLeads.find((l) => l.email.trim().toLowerCase() === cleanEmail);
  if (foundLead) {
    return {
      exists: true,
      message: `⚠️ Diese E-Mail-Adresse (${cleanEmail}) ist bereits registriert! Bitte nutze den 'Anmelden'-Button, um dich mit deinem Passwort einzuloggen.`,
    };
  }

  return { exists: false };
}

/**
 * Standard User Registration & Account Creation
 */
export async function registerUserAccount(data: {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  plan?: "PRO_29" | "ENTERPRISE_99";
  goal?: string;
}): Promise<AuthResponse> {
  const cleanEmail = (data.email || "").trim().toLowerCase();
  const cleanName = (data.name || "").trim();
  const cleanPassword = (data.password || "").trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      ok: false,
      error: "INVALID_EMAIL",
      message: "Bitte gib eine gültige E-Mail-Adresse ein.",
    };
  }

  // Pre-check duplicate registration locally
  const currentLeads = getLeadsDatabase();
  const existingLead = currentLeads.find((l) => l.email.trim().toLowerCase() === cleanEmail);
  if (existingLead) {
    return {
      ok: false,
      error: "ACCOUNT_EXISTS",
      message: `⚠️ Diese E-Mail-Adresse (${cleanEmail}) ist bereits registriert! Bitte nutze den 'Anmelden'-Button, um dich mit deinem Passwort einzuloggen.`,
    };
  }

  if (cleanPassword.length < 6) {
    return {
      ok: false,
      error: "WEAK_PASSWORD",
      message: "Das Passwort muss mindestens 6 Zeichen lang sein.",
    };
  }

  if (data.confirmPassword !== undefined && data.confirmPassword.trim() !== cleanPassword) {
    return {
      ok: false,
      error: "PASSWORD_MISMATCH",
      message: "Die Passwörter stimmen nicht überein.",
    };
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        confirmPassword: data.confirmPassword?.trim(),
        plan: data.plan || "ENTERPRISE_99",
        goal: data.goal,
      }),
    });

    const result: AuthResponse = await res.json();

    if (res.ok && result.ok && result.user) {
      setCurrentUserEmail(result.user.email);
      
      // Save locally as well
      const newLead = registerNewLead({
        name: result.user.name,
        email: result.user.email,
        slot: result.user.slot,
        plan: (result.user.plan as any) || "ENTERPRISE_99",
        token: result.user.token,
        goal: data.goal,
      });

      // Update lead to granted status
      newLead.status = "GRANTED";
      const idx = currentLeads.findIndex((l) => l.email.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        currentLeads[idx].status = "GRANTED";
        saveLeadsDatabase(currentLeads);
      }

      return result;
    } else {
      return {
        ok: false,
        error: result.error || "REGISTRATION_FAILED",
        message: result.message || `⚠️ Diese E-Mail-Adresse (${cleanEmail}) ist bereits registriert! Bitte nutze den 'Anmelden'-Button, um dich mit deinem Passwort einzuloggen.`,
      };
    }
  } catch (err: any) {
    // Check if email already exists locally before fallback
    const latestLeads = getLeadsDatabase();
    if (latestLeads.some((l) => l.email.trim().toLowerCase() === cleanEmail)) {
      return {
        ok: false,
        error: "ACCOUNT_EXISTS",
        message: `⚠️ Diese E-Mail-Adresse (${cleanEmail}) ist bereits registriert! Bitte nutze den 'Anmelden'-Button, um dich mit deinem Passwort einzuloggen.`,
      };
    }

    // Local fallback registration
    const newLead = registerNewLead({
      name: cleanName || cleanEmail.split("@")[0],
      email: cleanEmail,
      slot: Math.floor(450 + Math.random() * 40),
      plan: data.plan || "ENTERPRISE_99",
      token: `MZ-QUANTUM-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`,
      goal: data.goal,
    });
    newLead.status = "GRANTED";
    const idx = latestLeads.findIndex((l) => l.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      latestLeads[idx].status = "GRANTED";
      saveLeadsDatabase(latestLeads);
    }

    return {
      ok: true,
      message: "Account erfolgreich lokal registriert! Du kannst dich jetzt anmelden.",
      user: {
        id: newLead.id,
        email: newLead.email,
        name: newLead.name,
        role: "SOVEREIGN",
        plan: newLead.plan,
        planName: newLead.planName,
        slot: newLead.slot,
        token: newLead.token,
        status: "GRANTED",
        isFullCoreAdmin: false,
      },
    };
  }
}

/**
 * ADMIN: Fetch all registered users from backend
 */
export async function fetchRegisteredUsers(adminEmail: string = SUPERADMIN_EMAIL): Promise<AuthUser[]> {
  try {
    const res = await fetch(`/api/auth/users?adminEmail=${encodeURIComponent(adminEmail)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.users)) {
        return data.users;
      }
    }
  } catch (e) {
    console.warn("Could not fetch registered users from server", e);
  }

  // Fallback from leads database
  const leads = getLeadsDatabase();
  return leads.map((l) => ({
    id: l.id,
    email: l.email,
    name: l.name,
    role: isSuperAdminEmail(l.email) ? "FULL_CORE_ADMIN" : "SOVEREIGN",
    plan: l.plan,
    planName: l.planName,
    slot: l.slot,
    token: l.token,
    status: l.status,
    isFullCoreAdmin: isSuperAdminEmail(l.email),
    createdAt: l.registeredAt,
    notes: l.notes,
  }));
}

/**
 * ADMIN: Update a registered user account
 */
export async function updateUserAccount(params: {
  adminEmail: string;
  targetEmail: string;
  status?: string;
  role?: string;
  newPassword?: string;
  notes?: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/auth/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, message: err?.message || "Fehler beim Aktualisieren des Users." };
  }
}

/**
 * ADMIN: Delete a registered user account
 */
export async function deleteUserAccount(adminEmail: string, targetEmail: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/auth/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminEmail, targetEmail }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, message: err?.message || "Fehler beim Löschen des Users." };
  }
}

// =========================================================================
// 🚀 USER ACCOUNT TERMINAL, BILLING & PAYMENT METHODS TYPES AND APIS
// =========================================================================

export interface PaymentMethodItem {
  id: string;
  type: "paypal" | "card" | "klarna" | "sepa" | "crypto";
  isDefault: boolean;
  label: string;
  brand?: string; // "Visa", "Mastercard", "Amex", "PayPal", "Klarna", "Solana", "Bitcoin", "Ethereum", "Phantom", "MetaMask"
  last4?: string;
  expiry?: string;
  email?: string;
  klarnaType?: "pay_later" | "slice_it" | "pay_now";
  cryptoCurrency?: "BTC" | "ETH" | "SOL";
  walletAddress?: string;
  walletProvider?: string; // "Phantom", "MetaMask", "Coinbase", "Trust", "Solflare", "Ledger", "Other"
  addedAt: string;
}

export interface UserSubscriptionDetails {
  planId: "PRO_29" | "ENTERPRISE_99" | "FLEET_299" | "FULL_CORE_ADMIN";
  planName: string;
  priceMonthly: number;
  billingCycle: "monthly" | "yearly";
  status: "ACTIVE" | "TRIAL" | "TRIAL_ACTIVE" | "CANCELLED_PERIOD_END" | "EXPIRED";
  nextBillingDate: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface UserInvoiceItem {
  id: string;
  number: string;
  date: string;
  amount: number;
  currency: string;
  planName: string;
  status: "PAID" | "PENDING";
  paymentMethodLabel: string;
  netAmount?: number;
  taxAmount?: number;
  taxRatePercent?: number;
  recipientName?: string;
  recipientEmail?: string;
  recipientSlot?: number | string;
  quantumToken?: string;
  features?: string[];
}

export interface FullUserProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  slot: number;
  token: string;
  status: string;
  isFullCoreAdmin: boolean;
  createdAt: string;
  subscription: UserSubscriptionDetails;
  paymentMethods: PaymentMethodItem[];
  invoices: UserInvoiceItem[];
  resourceUsage: {
    coresActive: number;
    totalCores: number;
    tokensUsed: number;
    tokensLimit: number;
    queriesToday: number;
    queriesLimit: number;
    uptimePercent: number;
  };
}

const LOCAL_USER_TERMINAL_STORAGE_PREFIX = "syntax_user_terminal_profile_";

/**
 * Fetch Complete User Profile & Terminal Data from Server
 */
export async function fetchUserTerminalProfile(userEmail?: string): Promise<FullUserProfileData> {
  const email = (userEmail || getCurrentUserEmail() || SUPERADMIN_EMAIL).trim().toLowerCase();
  const isSuper = isSuperAdminEmail(email);

  try {
    const res = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.profile) {
        try {
          localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + email, JSON.stringify(data.profile));
        } catch {}
        return data.profile;
      }
    }
  } catch (e) {
    console.warn("Could not fetch user terminal profile from backend, using fallback:", e);
  }

  // Check local cached profile
  try {
    const cached = localStorage.getItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + email);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // Fallback initial state
  const registeredLead = getLeadsDatabase().find((l) => l.email.toLowerCase() === email);
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isBetaRole =
    registeredLead?.planName?.includes("CLOSED BETA") ||
    email.startsWith("key_") ||
    localStorage.getItem("syntax_user_logged_in_role") === "CLOSED_BETA_TESTER" ||
    (registeredLead?.notes && registeredLead.notes.includes("CLOSED_BETA_TESTER"));

  const trialExpiryDate = registeredLead?.trialExpiresAt || new Date(now.getTime() + (isBetaRole ? 720 : 24) * 60 * 60 * 1000).toISOString();

  const fallbackProfile: FullUserProfileData = {
    id: registeredLead?.id || `usr_${email.replace(/[^a-z0-9]/g, "_")}`,
    email: email,
    name: registeredLead?.name || (isSuper ? "Philipp Steidle" : (isBetaRole ? "Closed Beta Tester" : email.split("@")[0])),
    role: isSuper ? "FULL_CORE_ADMIN" : (isBetaRole ? "CLOSED_BETA_TESTER" : "SOVEREIGN"),
    slot: registeredLead?.slot || (isSuper ? 1 : 488),
    token: registeredLead?.token || (isSuper ? "MZ-SUPERADMIN-FULLCORE-ROOT-9988" : `MZ-QUANTUM-${email.slice(0, 4).toUpperCase()}-9900`),
    status: (isSuper || isBetaRole) ? "GRANTED" : (registeredLead?.status || "TRIAL_ACTIVE"),
    isFullCoreAdmin: isSuper,
    createdAt: registeredLead?.registeredAt || now.toISOString(),
    subscription: {
      planId: isSuper ? "FULL_CORE_ADMIN" : (isBetaRole ? "PRO_29" : (registeredLead?.plan === "PRO_29" ? "PRO_29" : "ENTERPRISE_99")),
      planName: isSuper
        ? "FULL CORE ADMIN (ROOT LIFETIME)"
        : (isBetaRole
            ? "CLOSED BETA TESTER (29€ PRO PLAN INKLUSIVE)"
            : (registeredLead?.plan === "PRO_29" ? "PRO SOVEREIGN CORE" : "SOVEREIGN ENTERPRISE")),
      priceMonthly: isSuper ? 0 : (isBetaRole ? 0 : (registeredLead?.plan === "PRO_29" ? 29 : 99)),
      billingCycle: "monthly",
      status: (isSuper || isBetaRole) ? "ACTIVE" : "TRIAL_ACTIVE",
      nextBillingDate: nextMonth.toLocaleDateString("de-DE"),
      trialEndsAt: trialExpiryDate,
    },
    paymentMethods: [],
    // Default official invoices matching S.Y.N.T.A.X. Sovereign OS tax records
    invoices: isSuper ? [
      {
        id: "inv_2026_2319",
        number: "#SYNTAX-INV-2026-2319",
        date: "20.08.2026",
        amount: 99.00,
        netAmount: 80.19,
        taxAmount: 18.81,
        currency: "EUR",
        planName: "1x SOVEREIGN ENTERPRISE Plan (monthly)",
        status: "PAID",
        paymentMethodLabel: "PayPal (philippsteidle5@gmail.com)",
        recipientName: "Philipp Steidle",
        recipientEmail: email,
        recipientSlot: 1,
        quantumToken: "MZ-SUPERADMIN-FULLCORE-ROOT-9988",
        features: [
          "Bereitstellung von 8 sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.)",
          "256-bit Quantum-Verschlüsselung & lückenloser Speicher",
        ],
      },
      {
        id: "inv_2026_1711",
        number: "#SYNTAX-INV-2026-1711",
        date: "20.08.2026",
        amount: 29.00,
        netAmount: 23.49,
        taxAmount: 5.51,
        currency: "EUR",
        planName: "1x PRO SOVEREIGN CORE Plan (monthly)",
        status: "PAID",
        paymentMethodLabel: "PayPal (philippsteidle5@gmail.com)",
        recipientName: "Philipp Steidle",
        recipientEmail: email,
        recipientSlot: 1,
        quantumToken: "MZ-SUPERADMIN-FULLCORE-ROOT-9988",
        features: [
          "Bereitstellung von 8 sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.)",
          "256-bit Quantum-Verschlüsselung & lückenloser Speicher",
        ],
      },
    ] : (isBetaRole ? [
      {
        id: `inv_beta_${email.slice(0, 6)}`,
        number: `#SYNTAX-BETA-PASS`,
        date: now.toLocaleDateString("de-DE"),
        amount: 0.00,
        netAmount: 0.00,
        taxAmount: 0.00,
        currency: "EUR",
        planName: "1x CLOSED BETA TESTER PASS (29€ PRO PLAN 100% GRATIS)",
        status: "PAID",
        paymentMethodLabel: "Closed Beta Key Voucher (Kostenlos)",
        recipientName: registeredLead?.name || "Closed Beta Tester",
        recipientEmail: email,
        recipientSlot: registeredLead?.slot || 488,
        quantumToken: registeredLead?.token || `KEY-BETA-${email.slice(0, 4).toUpperCase()}-9900`,
        features: [
          "29€ Pro Plan kostenfrei freigeschaltet für Closed Beta Tester",
          "Alle 8 Sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.) aktiv",
          "Keine Zahlungsdaten erforderlich",
        ],
      }
    ] : []),
    resourceUsage: {
      coresActive: 8,
      totalCores: 8,
      tokensUsed: 0,
      tokensLimit: isSuper ? 10000000 : 50000, // 50,000 Free Trial Tokens
      queriesToday: 0,
      queriesLimit: isSuper ? 5000 : 1000,
      uptimePercent: 99.98,
    },
  };

  try {
    localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + email, JSON.stringify(fallbackProfile));
  } catch {}

  return fallbackProfile;
}

/**
 * Update User Subscription Plan (Upgrade / Downgrade)
 */
export async function updateUserPlan(
  email: string,
  newPlanId: "PRO_29" | "ENTERPRISE_99" | "FLEET_299",
  billingCycle: "monthly" | "yearly" = "monthly"
): Promise<{ ok: boolean; message: string; profile?: FullUserProfileData }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch("/api/user/update-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, planId: newPlanId, billingCycle }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.profile) {
        try {
          localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(data.profile));
        } catch {}
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend update plan error, updating local state", e);
  }

  // Local fallback update
  const profile = await fetchUserTerminalProfile(cleanEmail);
  const planNames: Record<string, string> = {
    PRO_29: "PRO SOVEREIGN CORE",
    ENTERPRISE_99: "SOVEREIGN ENTERPRISE",
    FLEET_299: "QUANTUM DEDICATED FLEET",
  };
  const prices: Record<string, number> = {
    PRO_29: 29,
    ENTERPRISE_99: 99,
    FLEET_299: 299,
  };

  profile.subscription.planId = newPlanId;
  profile.subscription.planName = planNames[newPlanId] || "SOVEREIGN ENTERPRISE";
  profile.subscription.priceMonthly = prices[newPlanId] || 99;
  profile.subscription.billingCycle = billingCycle;
  profile.subscription.status = "ACTIVE";

  // Add invoice with precise tax and layout details
  const now = new Date();
  const grossPrice = prices[newPlanId] || 99;
  const netPrice = grossPrice === 29 ? 23.49 : grossPrice === 99 ? 80.19 : 242.29;
  const taxPrice = Math.round((grossPrice - netPrice) * 100) / 100;

  profile.invoices.unshift({
    id: `inv_${Date.now()}`,
    number: `#SYNTAX-INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: now.toLocaleDateString("de-DE"),
    amount: grossPrice,
    netAmount: netPrice,
    taxAmount: taxPrice,
    currency: "EUR",
    planName: `1x ${planNames[newPlanId]} Plan (${billingCycle})`,
    status: "PAID",
    paymentMethodLabel: profile.paymentMethods.find((p) => p.isDefault)?.label || `PayPal (${cleanEmail})`,
    recipientName: profile.name || "Philipp Steidle",
    recipientEmail: profile.email,
    recipientSlot: profile.slot || 1,
    quantumToken: profile.token || "MZ-SUPERADMIN-FULLCORE-ROOT-9988",
    features: [
      "Bereitstellung von 8 sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.)",
      "256-bit Quantum-Verschlüsselung & lückenloser Speicher",
    ],
  });

  try {
    localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(profile));
  } catch {}

  return {
    ok: true,
    message: `Plan erfolgreich auf '${profile.subscription.planName}' aktualisiert!`,
    profile,
  };
}

/**
 * Cancel User Subscription
 */
export async function cancelUserSubscription(
  email: string,
  reason?: string
): Promise<{ ok: boolean; message: string; profile?: FullUserProfileData }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch("/api/user/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, reason }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.profile) {
        try {
          localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(data.profile));
        } catch {}
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend cancel subscription error", e);
  }

  // Local fallback
  const profile = await fetchUserTerminalProfile(cleanEmail);
  profile.subscription.status = "CANCELLED_PERIOD_END";
  profile.subscription.cancelReason = reason || "Vom Nutzer gekündigt";
  profile.subscription.cancelledAt = new Date().toISOString();

  try {
    localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(profile));
  } catch {}

  return {
    ok: true,
    message: "Abo erfolgreich zum Ende der aktuellen Abrechnungsperiode gekündigt. Dein Zugang bleibt bis dahin voll aktiv.",
    profile,
  };
}

/**
 * Reactivate User Subscription
 */
export async function reactivateUserSubscription(
  email: string
): Promise<{ ok: boolean; message: string; profile?: FullUserProfileData }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch("/api/user/reactivate-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.profile) {
        try {
          localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(data.profile));
        } catch {}
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend reactivate error", e);
  }

  // Local fallback
  const profile = await fetchUserTerminalProfile(cleanEmail);
  profile.subscription.status = "ACTIVE";
  delete profile.subscription.cancelledAt;
  delete profile.subscription.cancelReason;

  try {
    localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(profile));
  } catch {}

  return {
    ok: true,
    message: "Abo erfolgreich reaktiviert! Deine automatische Verlängerung ist wieder aktiv.",
    profile,
  };
}

/**
 * Add Payment Method (PayPal, Kreditkarte, Klarna, Crypto: BTC, ETH, SOL, Phantom)
 */
export async function addUserPaymentMethod(
  email: string,
  method: {
    type: "paypal" | "card" | "klarna" | "sepa" | "crypto";
    label: string;
    brand?: string;
    last4?: string;
    expiry?: string;
    payPalEmail?: string;
    klarnaType?: "pay_later" | "slice_it" | "pay_now";
    cryptoCurrency?: "BTC" | "ETH" | "SOL";
    walletAddress?: string;
    walletProvider?: string;
    setAsDefault?: boolean;
  }
): Promise<{ ok: boolean; message: string; profile?: FullUserProfileData }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch("/api/user/payment-methods/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, ...method }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.profile) {
        try {
          localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(data.profile));
        } catch {}
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend payment method add error", e);
  }

  // Local fallback
  const profile = await fetchUserTerminalProfile(cleanEmail);
  const isDefault = method.setAsDefault || profile.paymentMethods.length === 0;

  if (isDefault) {
    profile.paymentMethods.forEach((p) => (p.isDefault = false));
  }

  const newPm: PaymentMethodItem = {
    id: `pm_${method.type}_${Date.now()}`,
    type: method.type,
    isDefault,
    label: method.label,
    brand: method.brand || (method.type === "paypal" ? "PayPal" : method.type === "klarna" ? "Klarna" : method.type === "crypto" ? (method.cryptoCurrency || "Crypto") : "Card"),
    last4: method.last4,
    expiry: method.expiry,
    email: method.payPalEmail,
    klarnaType: method.klarnaType,
    cryptoCurrency: method.cryptoCurrency,
    walletAddress: method.walletAddress,
    walletProvider: method.walletProvider,
    addedAt: new Date().toISOString(),
  };

  profile.paymentMethods.push(newPm);

  try {
    localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(profile));
  } catch {}

  return {
    ok: true,
    message: `Zahlungsmethode '${method.label}' erfolgreich hinzugefügt!`,
    profile,
  };
}

/**
 * Remove Payment Method
 */
export async function removeUserPaymentMethod(
  email: string,
  paymentMethodId: string
): Promise<{ ok: boolean; message: string; profile?: FullUserProfileData }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch("/api/user/payment-methods/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, paymentMethodId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.profile) {
        try {
          localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(data.profile));
        } catch {}
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend remove payment method error", e);
  }

  // Local fallback
  const profile = await fetchUserTerminalProfile(cleanEmail);
  profile.paymentMethods = profile.paymentMethods.filter((p) => p.id !== paymentMethodId);
  if (profile.paymentMethods.length > 0 && !profile.paymentMethods.some((p) => p.isDefault)) {
    profile.paymentMethods[0].isDefault = true;
  }

  try {
    localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(profile));
  } catch {}

  return {
    ok: true,
    message: "Zahlungsmethode erfolgreich entfernt.",
    profile,
  };
}

/**
 * Set Default Payment Method
 */
export async function setDefaultUserPaymentMethod(
  email: string,
  paymentMethodId: string
): Promise<{ ok: boolean; message: string; profile?: FullUserProfileData }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch("/api/user/payment-methods/set-default", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, paymentMethodId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.profile) {
        try {
          localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(data.profile));
        } catch {}
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend set default payment method error", e);
  }

  // Local fallback
  const profile = await fetchUserTerminalProfile(cleanEmail);
  profile.paymentMethods.forEach((p) => {
    p.isDefault = p.id === paymentMethodId;
  });

  try {
    localStorage.setItem(LOCAL_USER_TERMINAL_STORAGE_PREFIX + cleanEmail, JSON.stringify(profile));
  } catch {}

  return {
    ok: true,
    message: "Standard-Zahlungsmethode aktualisiert.",
    profile,
  };
}

export interface UserTrialStatusResult {
  hasAccess: boolean;
  isTrial: boolean;
  isExpired: boolean;
  trialExpiresAt: string;
  remainingSeconds: number;
  tokensLimit: number;
  tokensUsed: number;
  hasPaymentMethod: boolean;
  reason?: "TRIAL_ACTIVE" | "PAYMENT_ACTIVE" | "TRIAL_EXPIRED_NO_PAYMENT" | "REVOKED";
}

function getLiveTokensUsedForAccount(email: string): number {
  try {
    const clean = email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
    const stored = localStorage.getItem(`syntax_daily_usage_telemetry_v3_${clean}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.history) && parsed.history.length > 0) {
        const last = parsed.history[parsed.history.length - 1];
        if (typeof last.tokens === "number") {
          return last.tokens;
        }
      }
    }
  } catch {}
  return 0;
}

/**
 * Validates whether user currently has active trial or paid access
 */
export async function checkUserTrialAccess(email: string): Promise<UserTrialStatusResult> {
  const cleanEmail = (email || getCurrentUserEmail() || SUPERADMIN_EMAIL).trim().toLowerCase();
  const isSuper = isSuperAdminEmail(cleanEmail);
  const liveTokensUsed = getLiveTokensUsedForAccount(cleanEmail);

  if (isSuper) {
    return {
      hasAccess: true,
      isTrial: false,
      isExpired: false,
      trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      remainingSeconds: 86400 * 365,
      tokensLimit: 10000000,
      tokensUsed: liveTokensUsed,
      hasPaymentMethod: true,
      reason: "PAYMENT_ACTIVE",
    };
  }

  const profile = await fetchUserTerminalProfile(cleanEmail);
  const now = Date.now();
  const expiresTimestamp = profile.subscription.trialEndsAt ? new Date(profile.subscription.trialEndsAt).getTime() : (now + 24 * 60 * 60 * 1000);
  const remainingSeconds = Math.max(0, Math.floor((expiresTimestamp - now) / 1000));
  const isExpired = remainingSeconds <= 0;
  const hasPaymentMethod = Array.isArray(profile.paymentMethods) && profile.paymentMethods.length > 0;

  if (profile.status === "REVOKED") {
    return {
      hasAccess: false,
      isTrial: false,
      isExpired: true,
      trialExpiresAt: new Date(expiresTimestamp).toISOString(),
      remainingSeconds: 0,
      tokensLimit: profile.resourceUsage.tokensLimit || 50000,
      tokensUsed: liveTokensUsed,
      hasPaymentMethod,
      reason: "REVOKED",
    };
  }

  if (hasPaymentMethod || profile.subscription.status === "ACTIVE") {
    return {
      hasAccess: true,
      isTrial: false,
      isExpired: false,
      trialExpiresAt: new Date(expiresTimestamp).toISOString(),
      remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 86400 * 30,
      tokensLimit: profile.resourceUsage.tokensLimit || 2500000,
      tokensUsed: liveTokensUsed,
      hasPaymentMethod: true,
      reason: "PAYMENT_ACTIVE",
    };
  }

  if (!isExpired) {
    return {
      hasAccess: true,
      isTrial: true,
      isExpired: false,
      trialExpiresAt: new Date(expiresTimestamp).toISOString(),
      remainingSeconds,
      tokensLimit: profile.resourceUsage.tokensLimit || 50000,
      tokensUsed: liveTokensUsed,
      hasPaymentMethod: false,
      reason: "TRIAL_ACTIVE",
    };
  }

  // Expired and no payment method -> Access revoked until payment method linked
  return {
    hasAccess: false,
    isTrial: true,
    isExpired: true,
    trialExpiresAt: new Date(expiresTimestamp).toISOString(),
    remainingSeconds: 0,
    tokensLimit: profile.resourceUsage.tokensLimit || 50000,
    tokensUsed: liveTokensUsed,
    hasPaymentMethod: false,
    reason: "TRIAL_EXPIRED_NO_PAYMENT",
  };
}

export interface SlotStatusResult {
  ok: boolean;
  totalCapacity: number;
  occupiedCount: number;
  freeSlots: number;
  percentageOccupied: string;
  slots: Array<{
    slot: number;
    email: string;
    name: string;
    plan: string;
    planName: string;
    status: string;
    hasPaymentMethod: boolean;
    isFullCoreAdmin: boolean;
    createdAt: string;
    trialExpiresAt: string;
    remainingHours: number | null;
  }>;
  kickedEmails: Record<string, { timestamp: number; reason: string }>;
  timestamp?: number;
}

/**
 * Fetch live slots status and allocation count
 */
export async function fetchSlotsStatus(): Promise<SlotStatusResult> {
  try {
    const res = await fetch("/api/slots/status");
    if (res.ok) {
      const data = await res.json();
      if (data.ok) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Could not fetch slots status from backend", e);
  }

  // Fallback from local state
  const localLeads = getLeadsDatabase();
  return {
    ok: true,
    totalCapacity: 500,
    occupiedCount: localLeads.length,
    freeSlots: Math.max(0, 500 - localLeads.length),
    percentageOccupied: ((localLeads.length / 500) * 100).toFixed(1),
    slots: localLeads.map((l) => ({
      slot: l.slot,
      email: l.email,
      name: l.name,
      plan: l.plan,
      planName: l.planName,
      status: l.status,
      hasPaymentMethod: false,
      isFullCoreAdmin: isSuperAdminEmail(l.email),
      createdAt: l.registeredAt,
      trialExpiresAt: l.trialExpiresAt,
      remainingHours: 24,
    })),
    kickedEmails: {},
    timestamp: Date.now(),
  };
}

/**
 * ADMIN: Trigger purge of expired unpaid 24h accounts and recover slots
 */
export async function triggerAdminCleanExpiredSlots(adminEmail: string = SUPERADMIN_EMAIL): Promise<{
  ok: boolean;
  message: string;
  cleanedCount: number;
  freedSlots: number[];
  freeSlots: number;
  totalOccupied: number;
}> {
  try {
    const res = await fetch("/api/admin/clean-expired", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminEmail }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Could not clean expired slots via API", e);
  }
  return {
    ok: false,
    message: "Verbindung zum Backend fehlgeschlagen.",
    cleanedCount: 0,
    freedSlots: [],
    freeSlots: 489,
    totalOccupied: 11,
  };
}

