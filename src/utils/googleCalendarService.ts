import firebaseConfig from "../../firebase-applet-config.json";

export interface GoogleCalendarApiEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
    self?: boolean;
  }>;
}

export interface NormalizedCalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  time: string; // HH:mm or "Ganztägig" / "All Day"
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  category: "work" | "ai" | "system" | "personal" | "meeting";
  completed: boolean;
  isRealGoogleEvent: boolean;
  rawGoogleEvent?: GoogleCalendarApiEvent;
}

const GOOGLE_CALENDAR_TOKEN_KEY = "google_calendar_oauth_token";
const GOOGLE_CALENDAR_EVENTS_CACHE_KEY = "google_calendar_cached_events_v1";

export function getStoredCalendarToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(GOOGLE_CALENDAR_TOKEN_KEY) || localStorage.getItem("gmail_oauth_token") || "";
}

export function setStoredCalendarToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOOGLE_CALENDAR_TOKEN_KEY, token.trim());
}

export function clearStoredCalendarToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GOOGLE_CALENDAR_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_CALENDAR_EVENTS_CACHE_KEY);
}

/**
 * Initiates Google OAuth2 popup for Calendar Scopes
 */
export async function requestGoogleCalendarAccess(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }

    const clientId =
      (firebaseConfig as any)?.oAuthClientId ||
      "992218580083-paq9orqivchq78mrtg68k7pvorpg6oi4.apps.googleusercontent.com";

    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const initClient = () => {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        reject(new Error("Google Identity Services (GSI) not loaded"));
        return;
      }

      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: scopes,
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
              return;
            }
            if (response.access_token) {
              setStoredCalendarToken(response.access_token);
              resolve(response.access_token);
            } else {
              reject(new Error("No access token returned"));
            }
          },
          error_callback: (err: any) => {
            reject(err);
          },
        });

        client.requestAccessToken({ prompt: "consent" });
      } catch (err) {
        reject(err);
      }
    };

    if ((window as any).google?.accounts?.oauth2) {
      initClient();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initClient();
      script.onerror = () => reject(new Error("Failed to load Google script"));
      document.head.appendChild(script);
    }
  });
}

/**
 * Fetch calendar list or primary calendar events
 */
export async function listGoogleCalendarEvents(
  token?: string,
  timeMin?: string,
  timeMax?: string
): Promise<NormalizedCalendarEvent[]> {
  const activeToken = token || getStoredCalendarToken();
  if (!activeToken) {
    throw new Error("NO_CALENDAR_TOKEN");
  }

  // Default to 3 months before and 6 months ahead if not provided
  const minDate = timeMin || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const maxDate = timeMax || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", minDate);
  url.searchParams.set("timeMax", maxDate);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "100");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredCalendarToken();
      throw new Error("CALENDAR_TOKEN_EXPIRED");
    }
    const errBody = await response.text();
    throw new Error(`Google Calendar API Error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const rawItems: GoogleCalendarApiEvent[] = data.items || [];

  const normalized: NormalizedCalendarEvent[] = rawItems
    .filter((item) => item.status !== "cancelled")
    .map((item) => {
      let dateStr = "";
      let time = "09:00";
      let endTime = "10:00";

      if (item.start?.dateTime) {
        const d = new Date(item.start.dateTime);
        dateStr = d.toISOString().split("T")[0];
        time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
      } else if (item.start?.date) {
        dateStr = item.start.date;
        time = "Ganztägig";
      }

      if (item.end?.dateTime) {
        const dEnd = new Date(item.end.dateTime);
        endTime = dEnd.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
      }

      // Infer category from summary
      const lower = (item.summary || "").toLowerCase();
      let category: NormalizedCalendarEvent["category"] = "work";
      if (lower.includes("arzt") || lower.includes("doctor") || lower.includes("privat") || lower.includes("family") || lower.includes("fitness") || lower.includes("training") || lower.includes("urlaub") || lower.includes("geburtstag")) {
        category = "personal";
      } else if (lower.includes("meeting") || lower.includes("call") || lower.includes("sync") || lower.includes("besprechung") || lower.includes("zoom") || lower.includes("meet")) {
        category = "meeting";
      } else if (lower.includes("ai") || lower.includes("gemini") || lower.includes("syntax") || lower.includes("bot") || lower.includes("model")) {
        category = "ai";
      } else if (lower.includes("system") || lower.includes("server") || lower.includes("backup") || lower.includes("dev") || lower.includes("deploy")) {
        category = "system";
      }

      return {
        id: item.id,
        dateStr,
        time,
        endTime,
        title: item.summary || "Unbenannter Termin",
        description: item.description,
        location: item.location,
        htmlLink: item.htmlLink,
        category,
        completed: false,
        isRealGoogleEvent: true,
        rawGoogleEvent: item,
      };
    });

  // Save cache
  try {
    localStorage.setItem(GOOGLE_CALENDAR_EVENTS_CACHE_KEY, JSON.stringify(normalized));
  } catch (e) {}

  return normalized;
}

/**
 * Creates a real event in the user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(params: {
  title: string;
  dateStr: string; // YYYY-MM-DD
  time?: string; // HH:mm (e.g. "09:00")
  durationMinutes?: number;
  description?: string;
  location?: string;
  token?: string;
}): Promise<NormalizedCalendarEvent> {
  const activeToken = params.token || getStoredCalendarToken();
  if (!activeToken) {
    throw new Error("NO_CALENDAR_TOKEN");
  }

  const startTimeStr = params.time || "09:00";
  const duration = params.durationMinutes || 60;

  // Build Start and End ISO strings with local timezone offset
  const [hours, minutes] = startTimeStr.split(":").map(Number);
  const startDate = new Date(params.dateStr);
  startDate.setHours(hours || 9, minutes || 0, 0, 0);

  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const requestBody = {
    summary: params.title,
    description: params.description || `Erstellt via S.Y.N.T.A.X. Autonomous AI Calendar Engine am ${new Date().toLocaleString("de-DE")}`,
    location: params.location || "",
    start: {
      dateTime: startDate.toISOString(),
    },
    end: {
      dateTime: endDate.toISOString(),
    },
  };

  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${activeToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredCalendarToken();
      throw new Error("CALENDAR_TOKEN_EXPIRED");
    }
    const errBody = await response.text();
    throw new Error(`Failed to create Google Calendar Event (${response.status}): ${errBody}`);
  }

  const createdItem: GoogleCalendarApiEvent = await response.json();

  const lower = (createdItem.summary || "").toLowerCase();
  let category: NormalizedCalendarEvent["category"] = "work";
  if (lower.includes("arzt") || lower.includes("privat") || lower.includes("fitness")) {
    category = "personal";
  } else if (lower.includes("meeting") || lower.includes("call") || lower.includes("sync")) {
    category = "meeting";
  } else if (lower.includes("ai") || lower.includes("gemini")) {
    category = "ai";
  }

  const newNormalized: NormalizedCalendarEvent = {
    id: createdItem.id,
    dateStr: params.dateStr,
    time: startTimeStr,
    endTime: endDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false }),
    title: createdItem.summary || params.title,
    description: createdItem.description,
    location: createdItem.location,
    htmlLink: createdItem.htmlLink,
    category,
    completed: false,
    isRealGoogleEvent: true,
    rawGoogleEvent: createdItem,
  };

  return newNormalized;
}

/**
 * Deletes a real Google Calendar Event
 */
export async function deleteGoogleCalendarEvent(eventId: string, token?: string): Promise<boolean> {
  const activeToken = token || getStoredCalendarToken();
  if (!activeToken) {
    throw new Error("NO_CALENDAR_TOKEN");
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204 && response.status !== 404) {
    if (response.status === 401) {
      clearStoredCalendarToken();
      throw new Error("CALENDAR_TOKEN_EXPIRED");
    }
    throw new Error(`Failed to delete Google Calendar Event: ${response.statusText}`);
  }

  return true;
}

/**
 * Parses natural language or agent commands for calendar creation
 * e.g. "Trage den Arzttermin am 29.09.2026 um 09:00 Uhr ein"
 */
export function extractCalendarCommand(text: string): {
  isCalendarAction: boolean;
  action: "create" | "list" | "open";
  title?: string;
  dateStr?: string;
  time?: string;
  durationMinutes?: number;
} | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  const hasExplicitCalNoun = /\b(kalender|calendar|termine|termin|appointment|appointments)\b/i.test(lower);
  if (!hasExplicitCalNoun) return null;

  // Check if creating an event: requires explicit action verb associated with calendar events
  const isCreate =
    /\b(eintragen|anlegen|erstellen|buche|buchen|setze|planen|plane|erstell|mach)\b/i.test(lower) &&
    /\b(termin|termine|event|appointment|meeting|besprechung)\b/i.test(lower);

  if (isCreate) {
    // Try to extract date: DD.MM.YYYY or YYYY-MM-DD or words like "morgen", "heute"
    let dateStr = new Date().toISOString().split("T")[0];
    const dmyMatch = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      dateStr = `${year}-${month}-${day}`;
    } else {
      const ymdMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (ymdMatch) {
        dateStr = `${ymdMatch[1]}-${ymdMatch[2].padStart(2, "0")}-${ymdMatch[3].padStart(2, "0")}`;
      } else if (lower.includes("morgen") || lower.includes("tomorrow")) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateStr = tomorrow.toISOString().split("T")[0];
      } else if (lower.includes("übermorgen")) {
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        dateStr = dayAfter.toISOString().split("T")[0];
      }
    }

    // Try to extract time: HH:MM or "um 9 Uhr" or "9:00"
    let time = "09:00";
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      time = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
    } else {
      const uhrMatch = text.match(/um\s*(\d{1,2})(?:\s*uhr)?/i);
      if (uhrMatch) {
        time = `${uhrMatch[1].padStart(2, "0")}:00`;
      }
    }

    // Extract title
    let title = "Neuer Termin";
    const quotesMatch = text.match(/["'„“](.*?)["'„“]/);
    if (quotesMatch) {
      title = quotesMatch[1];
    } else if (lower.includes("arzttermin") || lower.includes("arzt")) {
      title = "Arzttermin";
    } else if (lower.includes("meeting") || lower.includes("besprechung")) {
      title = "Meeting / Besprechung";
    } else if (lower.includes("telefonat") || lower.includes("call")) {
      title = "Telefonat / Call";
    } else {
      title = "Termin";
    }

    return {
      isCalendarAction: true,
      action: "create",
      title,
      dateStr,
      time,
      durationMinutes: 60,
    };
  }

  // Check if listing
  if (
    /\b(welche termine|zeige meine termine|habe ich termine|list events|termine anzeigen)\b/i.test(lower)
  ) {
    return {
      isCalendarAction: true,
      action: "list",
    };
  }

  // Check if explicit command to open the calendar
  if (
    /\b(öffne|starte|zeig(?:e)?)\s+(?:den\s+)?(?:kalender|calendar|terminplaner)\b/i.test(lower) ||
    /\b(?:kalender|calendar|terminplaner)\s+(?:öffnen|starten|anzeigen)\b/i.test(lower)
  ) {
    return {
      isCalendarAction: true,
      action: "open",
    };
  }

  return null;
}
