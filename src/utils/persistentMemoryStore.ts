export interface MemoryFact {
  id: string;
  fact: string;
  category: "name" | "rule" | "fact" | "preference" | "project";
  timestamp: string;
  agentId?: string;
}

export interface PersistentMemoryState {
  preferredName: string;
  facts: MemoryFact[];
  customDirectives: string[];
  agentSpecificNotes: Record<string, string[]>;
  totalLearnedCount: number;
  lastUpdated: string;
}

const MEMORY_STORAGE_KEY = "syntax_agent_persistent_memory_v1";

const DEFAULT_MEMORY_STATE: PersistentMemoryState = {
  preferredName: "Mr",
  facts: [
    {
      id: "fact-name-01",
      fact: "Der Operator wird mit 'Mr' angesprochen.",
      category: "name",
      timestamp: "09:00",
      agentId: "syntax",
    },
    {
      id: "fact-rule-01",
      fact: "Sovereign OS Architektur: 8 spezialisierte Cores arbeiten autonom im Verbund.",
      category: "rule",
      timestamp: "09:02",
      agentId: "syntax",
    },
    {
      id: "fact-perf-01",
      fact: "Conversion-Rate und Beta-Key Metriken verbleiben exklusiv im geschützten Admin-Bereich.",
      category: "preference",
      timestamp: "09:05",
      agentId: "neo",
    },
    {
      id: "fact-tech-01",
      fact: "2.514 Memory-Knoten sind im 3D Universe über alle 8 Agenten gleichmäßig verteilt.",
      category: "fact",
      timestamp: "09:10",
      agentId: "vega",
    },
  ],
  customDirectives: [
    "Präzise, faktenbasierte und souveräne Antworten liefern.",
    "Alle 8 Cores synchron halten und Latenzen unter 300ms garantieren.",
    "Admin-Kennzahlen strikt vor unberechtigtem Zugriff schützen.",
  ],
  agentSpecificNotes: {
    syntax: [
      "Orchestriert 315 primäre Routing- und Flotten-Workflows.",
      "Hält Quantum-Puffer und Token-Quota im Gleichgewicht.",
    ],
    neo: [
      "Betreut 315 Conversion-, Funnel- und Preis-Strategien.",
      "Optimiert die psychologische Aktivierungsrate der VIP-Keys.",
    ],
    vega: [
      "Verwaltet 314 Full-Stack Code-, Datenbank- und Cache-Architekturen.",
      "60 FPS 3D Universe und virtualisiertes Infinite Scrolling.",
    ],
    odin: [
      "Überwacht 314 Defense-Audits, Screen Vision Scans und RBAC-Routen.",
      "Zero-Trust Schutz für sensible Operator-Daten.",
    ],
    pulse: [
      "Generiert 314 virale Veo 3.1 Prompts, TikTok Skripte und Hooklines.",
      "Multi-Channel Copywriting für maximale Reichweite.",
    ],
    chronos: [
      "Koordiniert 314 zeitgesteuerte Cronjobs, Midnight-Rollover und Pipelines.",
      "Automatisierte Token-Erneuerung um 00:00 Uhr.",
    ],
    oracle: [
      "Berechnet 314 Finanz-Modelle, MRR-Wachstum und LTV-Projektionen.",
      "Quant-Vorhersagen für nachhaltige SaaS-Skalierung.",
    ],
    globe: [
      "Führt 314 Quad-Core Deep Searches mit Grounding-Zitaten durch.",
      "Echtzeit-Web-Recherche und globale AI-Trends.",
    ],
  },
  totalLearnedCount: 2514,
  lastUpdated: new Date().toISOString(),
};

// In-memory cache + subscribers
let memoryCache: PersistentMemoryState = loadMemoryFromStorage();
const subscribers: Set<(state: PersistentMemoryState) => void> = new Set();

function loadMemoryFromStorage(): PersistentMemoryState {
  if (typeof window === "undefined") return DEFAULT_MEMORY_STATE;
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    let resolvedName = "Philipp"; // Sensible default for the user

    // Check if user has a stored profile or email
    try {
      const profileRaw = localStorage.getItem("syntax_user_profile");
      if (profileRaw) {
        const p = JSON.parse(profileRaw);
        if (p.name && p.name !== "User" && p.name !== "Mr") {
          resolvedName = p.name;
        }
      }
    } catch (_) {}

    if (raw) {
      const parsed = JSON.parse(raw);
      const chosenName = (parsed.preferredName && parsed.preferredName !== "Mr") ? parsed.preferredName : resolvedName;
      return {
        ...DEFAULT_MEMORY_STATE,
        ...parsed,
        preferredName: chosenName,
        facts: Array.isArray(parsed.facts) ? parsed.facts : [],
        customDirectives: Array.isArray(parsed.customDirectives) ? parsed.customDirectives : [],
        agentSpecificNotes: parsed.agentSpecificNotes || {},
      };
    } else {
      return {
        ...DEFAULT_MEMORY_STATE,
        preferredName: resolvedName,
      };
    }
  } catch (e) {
    console.warn("Could not load persistent memory from storage", e);
  }
  return DEFAULT_MEMORY_STATE;
}

function saveMemoryToStorage(state: PersistentMemoryState) {
  memoryCache = state;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save persistent memory to storage", e);
    }
  }
  subscribers.forEach((cb) => {
    try {
      cb(state);
    } catch (err) {
      console.error("Memory subscriber error:", err);
    }
  });
}

export function getPersistentMemory(): PersistentMemoryState {
  return memoryCache;
}

export function subscribeToMemory(callback: (state: PersistentMemoryState) => void): () => void {
  subscribers.add(callback);
  callback(memoryCache);
  return () => {
    subscribers.delete(callback);
  };
}

export function setPreferredName(name: string): PersistentMemoryState {
  const cleanName = name.trim();
  if (!cleanName) return memoryCache;

  const existingFacts = memoryCache.facts.filter((f) => f.category !== "name");
  const nameFact: MemoryFact = {
    id: `name-${Date.now()}`,
    fact: `Der Nutzer wird ab sofort und für immer mit dem Namen "${cleanName}" angesprochen.`,
    category: "name",
    timestamp: new Date().toLocaleDateString("de-DE", { hour: "2-digit", minute: "2-digit" }),
  };

  const nextState: PersistentMemoryState = {
    ...memoryCache,
    preferredName: cleanName,
    facts: [nameFact, ...existingFacts],
    totalLearnedCount: memoryCache.totalLearnedCount + 1,
    lastUpdated: new Date().toISOString(),
  };

  saveMemoryToStorage(nextState);
  return nextState;
}

export function addRememberedFact(
  factText: string,
  category: MemoryFact["category"] = "fact",
  agentId?: string
): PersistentMemoryState {
  const clean = factText.trim();
  if (!clean) return memoryCache;

  // Prevent exact duplicate facts
  if (memoryCache.facts.some((f) => f.fact.toLowerCase() === clean.toLowerCase())) {
    return memoryCache;
  }

  const newFact: MemoryFact = {
    id: `fact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fact: clean,
    category,
    timestamp: new Date().toLocaleDateString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    agentId,
  };

  const nextFacts = [newFact, ...memoryCache.facts].slice(0, 100);
  const nextNotes = { ...memoryCache.agentSpecificNotes };
  if (agentId) {
    const existing = nextNotes[agentId] || [];
    nextNotes[agentId] = [clean, ...existing.filter((x) => x !== clean)].slice(0, 30);
  }

  const nextState: PersistentMemoryState = {
    ...memoryCache,
    facts: nextFacts,
    agentSpecificNotes: nextNotes,
    totalLearnedCount: memoryCache.totalLearnedCount + 1,
    lastUpdated: new Date().toISOString(),
  };

  saveMemoryToStorage(nextState);
  return nextState;
}

export function addCustomDirective(directiveText: string): PersistentMemoryState {
  const clean = directiveText.trim();
  if (!clean) return memoryCache;

  if (memoryCache.customDirectives.some((d) => d.toLowerCase() === clean.toLowerCase())) {
    return memoryCache;
  }

  const nextDirectives = [clean, ...memoryCache.customDirectives].slice(0, 50);
  const nextState: PersistentMemoryState = {
    ...memoryCache,
    customDirectives: nextDirectives,
    totalLearnedCount: memoryCache.totalLearnedCount + 1,
    lastUpdated: new Date().toISOString(),
  };

  saveMemoryToStorage(nextState);
  return nextState;
}

export function removeMemoryFact(factId: string): PersistentMemoryState {
  const nextFacts = memoryCache.facts.filter((f) => f.id !== factId);
  const nextState: PersistentMemoryState = {
    ...memoryCache,
    facts: nextFacts,
    lastUpdated: new Date().toISOString(),
  };
  saveMemoryToStorage(nextState);
  return nextState;
}

export function clearAllMemory(): PersistentMemoryState {
  const resetState: PersistentMemoryState = {
    ...DEFAULT_MEMORY_STATE,
    lastUpdated: new Date().toISOString(),
  };
  saveMemoryToStorage(resetState);
  return resetState;
}

/**
 * Intelligent automatic text parser that analyzes user input for:
 * - Name assignments ("nenn mich ab jetzt Boss X", "ich heiße X", "mein Name ist X", "call me X from now on")
 * - Rules & Directives ("merke dir: ...", "merk dir ...", "du musst immer ...", "antworte ab jetzt ...")
 * - Personal Facts ("ich wohne in ...", "mein Projekt heißt ...", "meine Firma ist ...")
 */
export function extractAndSaveMemoryFromUserText(
  userText: string,
  agentId?: string
): { learnedSomething: boolean; detectedName?: string; detectedFact?: string } {
  if (!userText || typeof userText !== "string") {
    return { learnedSomething: false };
  }

  const text = userText.trim();
  const lower = text.toLowerCase();
  let learnedSomething = false;
  let detectedName: string | undefined;
  let detectedFact: string | undefined;

  // 1. Detect Name Patterns
  const namePatterns = [
    /(?:du\s+)?nenn(?:e)?\s+mich\s+(?:ab\s+jetzt|ab\s+sofort|von\s+nun\s+an|bitte)\s+["'„]?([^"'\n\.\!\?]{2,40})["'“]?/i,
    /(?:ab\s+jetzt|ab\s+sofort)\s+(?:nennst\s+du\s+mich|heiß(?:e|t)\s+ich|bin\s+ich)\s+["'„]?([^"'\n\.\!\?]{2,40})["'“]?/i,
    /nenn(?:e)?\s+mich\s+["'„]?([^"'\n\.\!\?]{2,30})["'“]?(?:\s+ab\s+jetzt|\s+ab\s+sofort)?/i,
    /(?:mein\s+name\s+ist|mein\s+name\s+lautet)\s+["'„]?([A-Za-z0-9äöüÄÖÜß\s\-]{2,30})["'“]?/i,
    /ich\s+hei(?:ß|ss)e\s+["'„]?([A-Za-z0-9äöüÄÖÜß\s\-]{2,30})["'“]?/i,
    /ich\s+bin\s+(?:der\s+)?["'„]?([A-ZÄÖÜ][a-zäöüß]{2,25})["'“]?\b/i,
    /call\s+me\s+["']?([A-Za-z0-9\s\-]{2,30})["']?\s+(?:from\s+now\s+on|from\s+now)?/i,
    /from\s+now\s+on\s+call\s+me\s+["']?([A-Za-z0-9\s\-]{2,30})["']?/i,
  ];

  for (const pat of namePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const candidateName = match[1].trim().replace(/[.,!?;:]$/, "");
      if (candidateName && candidateName.length >= 2 && candidateName.length <= 40 && !["ein", "eine", "hier", "da", "dort"].includes(candidateName.toLowerCase())) {
        setPreferredName(candidateName);
        detectedName = candidateName;
        learnedSomething = true;
        break;
      }
    }
  }

  // 2. Detect "Merke dir" / "Merk dir" / "Vergiss nicht" / "Wichtig"
  const factPatterns = [
    /(?:merke\s+dir|merk\s+dir|speicher(?:e)?\s+dir|notier(?:e)?\s+dir)(?:\s+bitte)?(?:\s*:\s*|\s+dass\s+|\s+folgendes\s*:\s*|\s+)(.+)/i,
    /(?:vergiss\s+nicht|nicht\s+vergessen)(?:\s*,\s*dass\s*|\s*:\s*|\s+)(.+)/i,
    /(?:wichtig\s+für\s+dich|wichtige\s+regel)(?:\s*:\s*|\s+)(.+)/i,
    /(?:remember\s+that|remember\s+this|keep\s+in\s+mind)(?:\s*:\s*|\s+that\s+|\s+)(.+)/i,
    /(?:lass\s+uns|wir\s+müssen|wir\s+sollen|fokus\s+auf|spezialisier(?:en)?\s+auf)\s+(.+)/i,
  ];

  for (const pat of factPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const factContent = match[1].trim().replace(/[.,!?;:]$/, "");
      if (factContent && factContent.length >= 3) {
        addRememberedFact(factContent, "fact", agentId);
        addCustomDirective(`Vom Nutzer vorgegebener Fokus/Regel: "${factContent}"`);
        detectedFact = factContent;
        learnedSomething = true;
        break;
      }
    }
  }

  // 3. Detect Personal Statements & Project Context
  const personalPatterns = [
    /(?:mein\s+projekt\s+ist|mein\s+startup\s+heißt|meine\s+firma\s+heißt)\s+(.+)/i,
    /(?:ich\s+arbeite\s+als|mein\s+beruf\s+ist)\s+(.+)/i,
    /(?:mein\s+ziel\s+ist\s+es|meine\s+vision\s+ist)\s+(.+)/i,
    /(?:wir\s+arbeiten\s+an|unser\s+ziel\s+ist)\s+(.+)/i,
  ];

  for (const pat of personalPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const extracted = match[0].trim();
      addRememberedFact(extracted, "project", agentId);
      learnedSomething = true;
      break;
    }
  }

  return { learnedSomething, detectedName, detectedFact };
}

/**
 * Returns a comprehensive, highly authoritative System Prompt context block
 * containing all persistent memories, user preferred name, rules, and facts.
 */
export function getPersistentMemoryContextForPrompt(agentId?: string): string {
  const mem = getPersistentMemory();
  const parts: string[] = [];

  const displayName = mem.preferredName && mem.preferredName !== "Mr" ? mem.preferredName : "Philipp";

  parts.push(`=== PERSISTENTES UNVERGESSLICHES LANGZEITGEDÄCHTNIS (FOREVER REMEMBERED) ===`);
  parts.push(`• BEVORZUGTER NAME / ANREDE DES NUTZERS: "${displayName}"`);
  parts.push(`  -> ABSOLUTE PRIORITÄT: Sprich den Nutzer persönlich mit "${displayName}" an (nicht stur mit "Mr", es sei denn er verlangt es)!`);

  if (mem.facts.length > 0) {
    parts.push(`• EINGEPRÄGTE FAKTEN & PERSÖNLICHE DETAILS DES NUTZERS:`);
    mem.facts.slice(0, 25).forEach((f, idx) => {
      parts.push(`  [${idx + 1}] ${f.fact} (Gespeichert am ${f.timestamp})`);
    });
  }

  if (mem.customDirectives.length > 0) {
    parts.push(`• VOM NUTZER DEFINIERTE DAUERHAFTE REGELN & VERHALTENSANWEISUNGEN:`);
    mem.customDirectives.slice(0, 15).forEach((d, idx) => {
      parts.push(`  [Regel ${idx + 1}] ${d}`);
    });
  }

  if (agentId && mem.agentSpecificNotes[agentId]?.length) {
    parts.push(`• SPEZIFISCHE NOTIZEN FÜR DICH (${agentId.toUpperCase()}):`);
    mem.agentSpecificNotes[agentId].slice(0, 10).forEach((n, idx) => {
      parts.push(`  - ${n}`);
    });
  }

  parts.push(`STRIKTE GEDÄCHTNIS-DIREKTIVE:
Du verfügst über ein unfehlbares, permanentes Langzeitgedächtnis. Alle Absprachen, Vorlieben und Anweisungen des Nutzers sind für alle 8 Cores der Flotte verbindlich.`);
  parts.push(`=== ENDE LANGZEITGEDÄCHTNIS ===\n`);

  return parts.join("\n");
}
