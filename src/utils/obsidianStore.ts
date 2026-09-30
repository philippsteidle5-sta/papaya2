// Obsidian Vault Store & Local File System Sync Engine
// Supports Web File System Access API (window.showDirectoryPicker)
// and stores notes in localStorage with Wikilink [[note]] parsing and graph analysis.

export interface ObsidianNote {
  id: string;
  name: string; // e.g. "Willkommen.md" or "Unbenannt.base"
  title: string;
  path: string;
  content: string;
  type: "markdown" | "base" | "canvas";
  updatedAt: string;
  size?: string;
  tags: string[];
  links: string[]; // Links to other notes extracted from [[Wikilinks]]
  backlinks: string[]; // Notes linking to this note
}

export interface ObsidianFolder {
  name: string;
  path: string;
  notes: ObsidianNote[];
  subfolders: ObsidianFolder[];
}

export interface ObsidianVaultState {
  vaultName: string;
  isConnectedToLocalFolder: boolean;
  notes: ObsidianNote[];
  activeNoteId: string | null;
  openTabIds: string[];
  activeView: "editor" | "table" | "graph";
}

const DEFAULT_NOTES: ObsidianNote[] = [
  {
    id: "unbenannt-base",
    name: "Unbenannt.base",
    title: "Unbenannt",
    path: "Unbenannt.base",
    type: "base",
    content: JSON.stringify(
      {
        type: "database",
        columns: [
          { key: "title", label: "Titel", type: "text" },
          { key: "category", label: "Kategorie", type: "tag" },
          { key: "status", label: "Status", type: "status" },
          { key: "updated", label: "Zuletzt bearbeitet", type: "date" },
        ],
        rows: [
          { title: "Gmail KI-Workflow", category: "Produktivität", status: "In Bearbeitung", updated: "Heute, 11:42" },
          { title: "Social Media Posting-Strategie", category: "Marketing", status: "Aktiv", updated: "Gestern" },
          { title: "Wochenplanung & Time-Blocking", category: "Kalender", status: "Geplant", updated: "13. Sep" },
        ],
      },
      null,
      2
    ),
    updatedAt: "13. September 2026",
    size: "1.2 KB",
    tags: ["datenbank", "basis", "uebersicht"],
    links: ["Willkommen", "Gmail KI-Workflow", "Social Media"],
    backlinks: [],
  },
  {
    id: "willkommen",
    name: "Willkommen.md",
    title: "Willkommen",
    path: "Willkommen.md",
    type: "markdown",
    content: `# Willkommen in deinem Obsidian Brain 🧠

Dieses Workspace verbindet deinen **Obsidian Vault** nahtlos mit deinen 3 wichtigsten Werkzeugen:
- 📬 **[[Gmail]]**: Lese E-Mails, fasse lange Threads mit KI zusammen und exportiere Notizen direkt als E-Mail-Entwurf.
- 📱 **[[Social Media]]**: Schreibe virale Hooks, plane TikToks & Reels und synchronisiere deinen Content-Plan.
- 📅 **[[Kalender]]**: Blocke Fokus-Zeiten in Google Calendar und verknüpfe Termine mit Notizen.

## Schnellanleitung:
1. Klicke links unten auf **"Vault verbinden"**, um einen echten lokalen Ordner auf deiner Festplatte auszuwählen.
2. Nutze Wikilinks wie \`[[Notiz-Name]]\`, um Gedanken miteinander zu verknüpfen.
3. Wechsle oben über die Tabs zwischen **Editor**, **Tabelle** und dem interaktiven **Wissensgraphen**.

---
*Erstellt mit S.Y.N.T.A.X. Obsidian Core*`,
    updatedAt: "13. September 2026",
    size: "840 B",
    tags: ["willkommen", "start", "anleitung"],
    links: ["Gmail", "Social Media", "Kalender"],
    backlinks: ["Unbenannt.base"],
  },
  {
    id: "gmail-notes",
    name: "Gmail KI-Workflow.md",
    title: "Gmail KI-Workflow",
    path: "Gmail KI-Workflow.md",
    type: "markdown",
    content: `# Gmail & Posteingangs-Automatisierung 📬

Hier werden wichtige Mails und KI-Zusammenfassungen aus dem **Gmail Assistant** gespeichert.

## Verknüpfte E-Mails:
- [[Investoren-Update Q3]]: Wichtige Meilensteine und Runway-Analyse
- [[Kunden-Feedback TikTok Campagne]]: Positive Reaktionen auf den neuen Hook

## Schnell-Aktionen:
- [x] Auto-Draft Template für Kundensupport definieren
- [ ] Wöchentliche Zusammenfassung in [[Wochenplanung]] übernehmen
- [ ] Phishing-Filter für verdächtige Anhänge aktivieren`,
    updatedAt: "13. September 2026",
    size: "620 B",
    tags: ["gmail", "workflow", "automatisierung"],
    links: ["Investoren-Update Q3", "Wochenplanung"],
    backlinks: ["Willkommen.md"],
  },
  {
    id: "social-media-notes",
    name: "Social Media Strategie.md",
    title: "Social Media Strategie",
    path: "Social Media Strategie.md",
    type: "markdown",
    content: `# Social Media Studio & Content-Planung 📱

Plattform-Fokus: **TikTok**, **Instagram Reels**, **LinkedIn** und **X**.

## Virale Hooks & Ideen:
1. *"Niemand erzählt dir das über KI-Automatisierung..."*
2. *"Ich habe meinen gesamten Alltag in Obsidian und Gemini gebaut – hier ist das System:"*

## Geplante Veröffentlichungen:
- **Montag**: Video über [[Gmail KI-Workflow]]
- **Mittwoch**: Carousel zu Zeitmanagement & [[Kalender]]
- **Freitag**: Q&A Livestream`,
    updatedAt: "12. September 2026",
    size: "710 B",
    tags: ["social", "tiktok", "reels", "marketing"],
    links: ["Gmail KI-Workflow", "Kalender"],
    backlinks: ["Willkommen.md"],
  },
  {
    id: "kalender-notes",
    name: "Wochenplanung & Time-Blocking.md",
    title: "Wochenplanung & Time-Blocking",
    path: "Wochenplanung & Time-Blocking.md",
    type: "markdown",
    content: `# Chronos Kalender & Wochenplanung 📅

Tägliche Fokusblöcke synchronisiert mit Google Calendar:

## Montag:
- 09:00 - 11:00: Deep Work (Architektur & [[Gmail KI-Workflow]])
- 14:00 - 15:30: Content Creation für [[Social Media Strategie]]

## Notizen:
- Alle Termine werden automatisch mit [[Willkommen]] synchronisiert.`,
    updatedAt: "11. September 2026",
    size: "540 B",
    tags: ["kalender", "fokus", "termine"],
    links: ["Gmail KI-Workflow", "Social Media Strategie", "Willkommen"],
    backlinks: ["Willkommen.md"],
  },
];

const VAULT_STORAGE_KEY = "syntax_obsidian_vault_v1";

// Extract [[Wikilinks]] from Markdown
export function extractWikilinks(text: string): string[] {
  const matches = text.match(/\[\[(.*?)\]\]/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/\[\[|\]\]/g, "").trim())));
}

// Extract #tags from Markdown
export function extractTags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_-]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((t) => t.replace("#", "").trim().toLowerCase())));
}

// Load notes from localStorage or fallback
export function loadObsidianVault(): ObsidianVaultState {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.notes && Array.isArray(parsed.notes) && parsed.notes.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not load stored Obsidian vault, using defaults:", e);
  }

  return {
    vaultName: "Obsidian Vault",
    isConnectedToLocalFolder: false,
    notes: DEFAULT_NOTES,
    activeNoteId: "unbenannt-base",
    openTabIds: ["unbenannt-base", "willkommen"],
    activeView: "table",
  };
}

// Save notes to localStorage
export function saveObsidianVault(state: ObsidianVaultState): void {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save Obsidian vault:", e);
  }
}

// Connect to native directory via File System Access API
export async function pickLocalObsidianVault(): Promise<{
  vaultName: string;
  notes: ObsidianNote[];
} | null> {
  // Check if browser supports showDirectoryPicker
  if (typeof (window as any).showDirectoryPicker !== "function") {
    alert(
      "Dein Browser unterstützt die native Dateisystem-API noch nicht direkt. Wir nutzen den Browser-Speicher für deinen Vault."
    );
    return null;
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: "readwrite",
    });

    const notes: ObsidianNote[] = [];
    const vaultName = dirHandle.name || "Obsidian Vault";

    // Read files recursively
    for await (const entry of dirHandle.values()) {
      if (entry.kind === "file" && (entry.name.endsWith(".md") || entry.name.endsWith(".base") || entry.name.endsWith(".txt"))) {
        const file = await entry.getFile();
        const content = await file.text();
        const isBase = entry.name.endsWith(".base");
        const title = entry.name.replace(/\.(md|base|txt)$/, "");

        notes.push({
          id: entry.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: entry.name,
          title,
          path: entry.name,
          content,
          type: isBase ? "base" : "markdown",
          updatedAt: new Date(file.lastModified).toLocaleDateString("de-DE"),
          size: `${(file.size / 1024).toFixed(1)} KB`,
          tags: extractTags(content),
          links: extractWikilinks(content),
          backlinks: [],
        });
      }
    }

    // Recalculate backlinks
    notes.forEach((note) => {
      note.backlinks = notes
        .filter((other) => other.id !== note.id && other.links.some((l) => l.toLowerCase() === note.title.toLowerCase()))
        .map((other) => other.title);
    });

    return { vaultName, notes: notes.length > 0 ? notes : DEFAULT_NOTES };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return null; // User cancelled
    }
    console.error("Error accessing local directory:", err);
    throw err;
  }
}
