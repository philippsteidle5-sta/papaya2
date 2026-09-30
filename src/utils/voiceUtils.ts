export interface VoiceProfile {
  pitch: number;
  rate: number;
  preferredGender: "male" | "female";
  keywords: string[];
  enKeywords?: string[];
  elevenLabsVoiceId?: string;
}

/**
 * Human-like Neural Voice Profiles:
 * Calibrated with pitch: 1.0 (eliminates metallic vocoder / robotic pitch distortion in browser synthesis engines)
 * and rate: 0.92 (fluent, natural, conversational tempo).
 */
export const AGENT_VOICE_PROFILES: Record<string, VoiceProfile> = {
  // S.Y.N.T.A.X. Core Agent - Pure, natural, warm & articulate human voice matching Neo's acoustic clarity
  syntax: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "microsoft markus",
      "markus",
      "microsoft stefan online (natural)",
      "stefan",
      "yannick",
      "daniel",
      "martin",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google us english",
      "microsoft ryan online (natural)",
      "microsoft guy online (natural)",
      "ryan",
      "guy",
      "alex",
      "daniel",
      "natural",
      "en-us",
      "male",
    ],
  },
  maze: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "microsoft markus",
      "markus",
      "microsoft stefan online (natural)",
      "stefan",
      "yannick",
      "daniel",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google us english",
      "microsoft ryan online (natural)",
      "microsoft guy online (natural)",
      "guy",
      "alex",
      "daniel",
      "natural",
      "en-us",
      "male",
    ],
  },
  neo: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "male",
    elevenLabsVoiceId: "70dzXY4HZleqxYtQr59t", // Exclusive ElevenLabs Neural Voice for N.E.O.: Darth Revan
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "microsoft markus",
      "markus",
      "microsoft stefan online (natural)",
      "stefan",
      "yannick",
      "daniel",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google us english",
      "microsoft ryan online (natural)",
      "microsoft guy online (natural)",
      "ryan",
      "tom",
      "guy",
      "en-us",
      "male",
    ],
  },
  gemini: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "microsoft markus",
      "markus",
      "microsoft stefan online (natural)",
      "stefan",
      "yannick",
      "daniel",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google us english",
      "microsoft ryan online (natural)",
      "microsoft guy online (natural)",
      "ryan",
      "guy",
      "alex",
      "en-us",
      "male",
    ],
  },
  claude: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "microsoft markus",
      "markus",
      "stefan",
      "daniel",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google us english",
      "microsoft ryan online (natural)",
      "alex",
      "daniel",
      "en-us",
      "male",
    ],
  },
  vega: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "female",
    keywords: [
      "microsoft katja online (natural)",
      "microsoft katja",
      "katja",
      "google deutsch",
      "anna",
      "amelie",
      "viktoria",
      "marlene",
      "female",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "microsoft jenny online (natural)",
      "microsoft aria online (natural)",
      "microsoft jenny",
      "jenny",
      "google us english",
      "serena",
      "samantha",
      "victoria",
      "female",
      "en-us",
    ],
  },
  odin: {
    pitch: 0.96,
    rate: 0.90, // Calmer, solid, clear tempo
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft stefan online (natural)",
      "microsoft markus",
      "markus",
      "stefan",
      "daniel",
      "deutsch",
      "de-de",
      "male",
    ],
    enKeywords: [
      "microsoft daniel",
      "microsoft ryan online (natural)",
      "daniel",
      "david",
      "george",
      "male",
      "en-gb",
      "en-us",
    ],
  },
  pulse: {
    pitch: 1.0,
    rate: 0.93,
    preferredGender: "female",
    keywords: [
      "microsoft katja online (natural)",
      "microsoft katja",
      "katja",
      "google deutsch",
      "amelie",
      "viktoria",
      "anna",
      "female",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "microsoft aria online (natural)",
      "microsoft jenny online (natural)",
      "ava",
      "allison",
      "serena",
      "female",
      "en-us",
    ],
  },
  chronos: {
    pitch: 1.0,
    rate: 0.91,
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "yannick",
      "stefan",
      "markus",
      "daniel",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google uk english male",
      "microsoft ryan online (natural)",
      "oliver",
      "arthur",
      "daniel",
      "male",
      "en-gb",
    ],
  },
  oracle: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "daniel",
      "markus",
      "stefan",
      "yannick",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google us english",
      "microsoft guy online (natural)",
      "alex",
      "evan",
      "natural",
      "male",
      "en-us",
    ],
  },
  globe: {
    pitch: 1.0,
    rate: 0.92,
    preferredGender: "male",
    keywords: [
      "google deutsch",
      "microsoft markus online (natural)",
      "markus",
      "stefan",
      "daniel",
      "yannick",
      "deutsch",
      "de-de",
    ],
    enKeywords: [
      "google us english",
      "microsoft ryan online (natural)",
      "david",
      "mark",
      "male",
      "en-us",
    ],
  },
};

/**
 * Phonetic & clarity normalizer: cleans symbols, formats acronyms,
 * removes thought blocks, brackets, emojis, and inserts natural conversational breath pauses to ensure fluent German & English TTS.
 */
export function normalizeTextForSpeech(text: string, lang: "de" | "en" = "de"): string {
  if (!text) return "";

  let cleaned = text
    // Remove thoughts and inner reasoning tags
    .replace(/<thought[\s\S]*?<\/thought>/gi, "")
    .replace(/\[\s*(?:thought|denkprozess|analyse|logik|reasoning|gedanke|strategie)[\s\S]*?\](?:"[^"]*"|'[^']*'|[^\n⚡])*/gi, "")
    .replace(/🧠\s*\[[^\]]*\][^\n⚡]*/gi, "")
    .replace(/⚡\s*\[[^\]]*\]:?/gi, "")
    .replace(/\[(?:8-AGENTEN-EXPERTEN|FLEET DELEGATION MATRIX|DEEP DIVE ANALYSE|CONSOLE LOG|CLAUDE CORE|GEMINI CORE)[^\]]*\]/gi, "")
    .replace(/->\s*(?:NEO|SYNTAX|VEGA|ODIN|PULSE|CHRONOS|ORACLE|GLOBE)\s*(?:\([^)]*\))?/gi, "")
    // Code blocks and inline code
    .replace(/```[\s\S]*?```/g, lang === "de" ? " Code-Abschnitt in der Anzeige. " : " Code snippet in preview. ")
    .replace(/`([^`\n]+)`/g, "$1")
    // Markdown links & URLs
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/www\.[^\s)]+/g, "")
    // Markdown table rows (e.g. | Col1 | Col2 |)
    .replace(/\|[^\n|]+\|[^\n|]+\|/g, "")
    // Remove markdown formatting & tool brackets
    .replace(/\[(MAP|ROUTE|MAP_CLOSE|BEOBACHTUNG|VEO_VIDEO|IMAGE|SYSTEM|CALENDAR)[^\]]*\]/gi, "")
    .replace(/[*#_~]/g, "")
    // Bullets to commas for natural pauses
    .replace(/^[•\-\*]\s+/gm, ", ")
    .replace(/\n\s*[•\-\*]\s+/g, ", ")
    // Remove emojis so browser TTS does not stumble or speak weird unicode symbols
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, " ");

  // --- UNIVERSAL HONORIFIC, SALUTATION & ACRONYM BUG FIXES ---
  cleaned = cleaned
    .replace(/\bM\.R\.\b/gi, "Mister")
    .replace(/\bMR\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/gi, "Mister")
    .replace(/\bMr\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/g, "Mister")
    .replace(/\bMISTER\b/g, "Mister")
    .replace(/\bmister\b/g, "Mister")
    // Fix Mrs / Mrs. / Misses
    .replace(/\bMRS\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/gi, "Misses")
    .replace(/\bMrs\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/g, "Misses")
    // Fix Ms / Ms.
    .replace(/\bMS\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/gi, "Miss")
    .replace(/\bMs\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/g, "Miss")
    // Fix Boss / B.O.S.S.
    .replace(/\bB\.O\.S\.S\.?\b/gi, "Boss")
    .replace(/\bBOSS\b/g, "Boss")
    .replace(/\bboss\b/g, "Boss")
    // Fix Sir / S.I.R.
    .replace(/\bS\.I\.R\.?\b/gi, "Sir")
    .replace(/\bSIR\b/g, "Sir")
    .replace(/\bsir\b/g, "Sir")
    // Fix Master / Lord / Chief / Commander / Captain
    .replace(/\bMASTER\b/g, "Master")
    .replace(/\bLORD\b/g, "Lord")
    .replace(/\bCHIEF\b/g, "Chief")
    .replace(/\bCOMMANDER\b/g, "Commander")
    .replace(/\bCmdr\.?\b/gi, "Commander")
    .replace(/\bCAPTAIN\b/g, "Captain")
    .replace(/\bCpt\.?\b/gi, "Captain")
    .replace(/\bADMIN\b/g, "Admin");

  // Format colon after salutations into a smooth pause comma
  cleaned = cleaned.replace(/\b(Boss|Sir|Mister|Misses|Miss|Master|Lord|Commander|Captain|Admin)\s*:\s*/g, "$1, ");

  if (lang === "de") {
    // German phonetic adjustments for crisp, native pronunciation
    cleaned = cleaned
      .replace(/\bDr\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/gi, "Doktor")
      .replace(/\bDR\.?\b/gi, "Doktor")
      .replace(/\bProf\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/gi, "Professor")
      .replace(/\bAPI\b/g, "A-P-I")
      .replace(/\bAPIs\b/g, "A-P-Is")
      .replace(/\bKI\b/g, "K-I")
      .replace(/\bKIs\b/g, "K-Is")
      .replace(/\bUI\b/g, "U-I")
      .replace(/\bUX\b/g, "U-X")
      .replace(/\bS\.Y\.N\.T\.A\.X\./g, "Syntax")
      .replace(/\bSYNTAX\b/g, "Syntax")
      .replace(/\bN\.E\.O\./g, "Neo")
      .replace(/\bNEO\b/g, "Neo")
      .replace(/\bV\.E\.G\.A\./g, "Vega")
      .replace(/\bVEGA\b/g, "Vega")
      .replace(/\bO\.D\.I\.N\./g, "Odin")
      .replace(/\bODIN\b/g, "Odin")
      .replace(/\bP\.U\.L\.S\.E\./g, "Pulse")
      .replace(/\bPULSE\b/g, "Pulse")
      .replace(/\bC\.H\.R\.O\.N\.O\.S\./g, "Chronos")
      .replace(/\bCHRONOS\b/g, "Chronos")
      .replace(/\bO\.R\.A\.C\.L\.E\./g, "Oracle")
      .replace(/\bORACLE\b/g, "Oracle")
      .replace(/\bG\.L\.O\.B\.E\./g, "Globe")
      .replace(/\bGLOBE\b/g, "Globe")
      .replace(/\bMAZE\b/g, "Maze")
      .replace(/\bVIP\b/g, "V-I-P")
      .replace(/\bGoogle Calendar\b/gi, "Google Kalender")
      .replace(/\bGoogle Workspace\b/gi, "Google Wörkspeis")
      .replace(/\bGOAT\b/gi, "Goat")
      .replace(/\b50k\b/gi, "50-Tausend")
      .replace(/\b15k\b/gi, "15-Tausend")
      .replace(/\b25k\b/gi, "25-Tausend")
      .replace(/\b100k\b/gi, "100-Tausend")
      .replace(/Ø/g, "Durchschnitt ")
      .replace(/∞/g, "Unbegrenzt")
      .replace(/\bCPU\b/g, "C-P-U")
      .replace(/\bGPU\b/g, "G-P-U")
      .replace(/\bDB\b/g, "Datenbank")
      .replace(/\bPDF\b/g, "P-D-F")
      .replace(/\bURL\b/g, "U-R-L")
      .replace(/\bURLs\b/g, "U-R-Ls")
      .replace(/\bms\b/g, "Millisekunden")
      .replace(/\bsec\b/g, "Sekunden");
  } else {
    // English phonetic adjustments
    cleaned = cleaned
      .replace(/\bDr\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/gi, "Doctor")
      .replace(/\bProf\.?\b(?=\s+[A-ZÄÖÜa-zäöüß0-9]|$)/gi, "Professor")
      .replace(/\bS\.Y\.N\.T\.A\.X\./g, "Syntax")
      .replace(/\bSYNTAX\b/g, "Syntax")
      .replace(/\bN\.E\.O\./g, "Neo")
      .replace(/\bNEO\b/g, "Neo")
      .replace(/\bV\.E\.G\.A\./g, "Vega")
      .replace(/\bVEGA\b/g, "Vega")
      .replace(/\bO\.D\.I\.N\./g, "Odin")
      .replace(/\bODIN\b/g, "Odin")
      .replace(/\bP\.U\.L\.S\.E\./g, "Pulse")
      .replace(/\bPULSE\b/g, "Pulse")
      .replace(/\bC\.H\.R\.O\.N\.O\.S\./g, "Chronos")
      .replace(/\bCHRONOS\b/g, "Chronos")
      .replace(/\bO\.R\.A\.C\.L\.E\./g, "Oracle")
      .replace(/\bORACLE\b/g, "Oracle")
      .replace(/\bG\.L\.O\.B\.E\./g, "Globe")
      .replace(/\bGLOBE\b/g, "Globe")
      .replace(/\bMAZE\b/g, "Maze")
      .replace(/\bGOAT\b/gi, "Goat")
      .replace(/\b50k\b/gi, "50 thousand")
      .replace(/Ø/g, "Average ")
      .replace(/∞/g, "Unlimited");
  }

  // Normalize multiple whitespaces, colons, and semi-colons into speech-friendly commas/periods
  return cleaned
    .replace(/[;:]\s+/g, ". ")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits text into natural conversational sentence chunks (max ~180 chars).
 * This completely avoids the Chromium 15-second speech synthesis cutoff bug!
 */
export function splitTextIntoSpeechChunks(text: string, maxChunkLength: number = 180): string[] {
  if (!text) return [];
  const clean = text.trim();
  if (clean.length <= maxChunkLength) return [clean];

  // Match sentences ending with period, exclamation, question mark, or newlines
  const sentences = clean.match(/[^.!?\n]+[.!?\n]+/g) || [clean];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 <= maxChunkLength) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      if (trimmed.length > maxChunkLength) {
        // Break long sentence by commas, colons or semicolons
        const clauses = trimmed.split(/([,;:]\s+)/);
        for (const clause of clauses) {
          if (!clause) continue;
          if (currentChunk.length + clause.length <= maxChunkLength) {
            currentChunk += clause;
          } else {
            if (currentChunk.trim()) chunks.push(currentChunk.trim());
            currentChunk = clause;
          }
        }
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * Calculates a quality score for available browser voices.
 * Higher score = more natural, neural, human-like sound (avoiding robotic desktop voices).
 */
function scoreVoiceQuality(
  voice: SpeechSynthesisVoice,
  keywords: string[],
  preferredGender: "male" | "female",
  isEn: boolean
): number {
  const name = voice.name.toLowerCase();
  const lang = (voice.lang || "").toLowerCase().replace("_", "-");
  let score = 0;

  // Language match check
  if (isEn) {
    if (!lang.startsWith("en")) return -100;
  } else {
    if (!lang.startsWith("de") && !lang.includes("ger") && !name.includes("deutsch") && !name.includes("german")) {
      return -100;
    }
  }

  // Heavy bonus for Neural / Natural / Online high-definition human voices
  if (name.includes("natural")) score += 60;
  if (name.includes("online")) score += 40;
  if (name.includes("neural")) score += 50;
  if (name.includes("google")) score += 55;
  if (name.includes("wavenet")) score += 45;
  if (name.includes("premium")) score += 40;
  if (name.includes("enhanced")) score += 35;
  if (name.includes("siri")) score += 40;

  // Neo-matching signature voices (Markus, Yannick, Stefan Natural, Ryan Natural)
  if (name.includes("markus")) score += 50;
  if (name.includes("ryan")) score += 45;
  if (name.includes("yannick")) score += 40;
  if (name.includes("stefan") && !name.includes("desktop")) score += 35;
  if (name.includes("guy") && name.includes("natural")) score += 40;

  // Keyword match bonuses
  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i].toLowerCase();
    if (name.includes(kw)) {
      score += (keywords.length - i) * 10;
      break;
    }
  }

  // Penalize legacy robotic desktop synthesizers if modern neural ones exist
  if (name.includes("desktop")) score -= 30;
  if (name.includes("hedda desktop")) score -= 40;

  // Gender matching bonus
  if (preferredGender === "male") {
    if (/male|markus|stefan|yannick|daniel|martin|hans|david|alex|guy|ryan/i.test(name)) {
      score += 20;
    }
    if (/female|katja|hedda|viktoria|anna|amelie|petra|marlene|zira|samantha|karen|serena|jenny|aria/i.test(name)) {
      score -= 25;
    }
  } else {
    if (/female|katja|hedda|viktoria|anna|amelie|petra|marlene|zira|samantha|karen|serena|jenny|aria/i.test(name)) {
      score += 20;
    }
    if (/male|markus|stefan|yannick|daniel|martin|hans|david|alex|guy|ryan/i.test(name)) {
      score -= 25;
    }
  }

  return score;
}

/**
 * Configures a SpeechSynthesisUtterance with native, human-like voice selection per agent.
 */
export function applyAgentVoice(
  utterance: SpeechSynthesisUtterance,
  agentId: string = "syntax",
  lang: "de" | "en" = "de"
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const rawId = (agentId || "syntax").toLowerCase().trim();
  // Map aliases
  const normalizedId =
    rawId === "gemini" || rawId === "claude" || rawId === "maze" || rawId === "syntax_core"
      ? "syntax"
      : rawId;

  const profile = AGENT_VOICE_PROFILES[normalizedId] || AGENT_VOICE_PROFILES.syntax || AGENT_VOICE_PROFILES.neo;

  const isEn = lang === "en";
  utterance.lang = isEn ? "en-US" : "de-DE";
  // Pitch 1.0 ensures completely natural human acoustic waveform without robotic vocoder distortion
  utterance.pitch = profile.pitch || 1.0;
  utterance.rate = profile.rate || 0.92;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return;

  const targetKeywords = isEn
    ? profile.enKeywords || ["google us english", "microsoft ryan", "natural", "en-us", "male"]
    : profile.keywords;

  // Score all voices in browser and pick the highest scoring human-like voice
  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -999;

  for (const voice of voices) {
    const score = scoreVoiceQuality(voice, targetKeywords, profile.preferredGender, isEn);
    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }

  if (bestVoice) {
    utterance.voice = bestVoice;
    if (bestVoice.lang) {
      utterance.lang = bestVoice.lang;
    }
  }
}

export interface WordOffset {
  word: string;
  start: number;
  end: number;
  timestamp: number;
}

/**
 * Calculates high-precision word character spans and timestamp offsets (in milliseconds) for speech synthesis.
 */
export function calculateWordOffsets(
  text: string,
  speechRate: number = 0.92,
  lang: "de" | "en" = "de"
): WordOffset[] {
  if (!text) return [];
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const rateFactor = 1 / Math.max(0.5, Math.min(2.0, speechRate || 0.92));
  const msPerChar = (lang === "de" ? 50 : 44) * rateFactor;
  const baseWordDuration = (lang === "de" ? 110 : 95) * rateFactor;
  const offsets: WordOffset[] = [];

  let searchIdx = 0;
  let cumulativeMs = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let start = text.indexOf(word, searchIdx);
    if (start < 0) {
      start = searchIdx;
    }
    const end = start + word.length;
    searchIdx = end;

    const pureWord = word.replace(/[^a-zA-Z0-9äöüÄÖÜßáéíóú]/gi, "");
    const charCount = Math.max(1, pureWord.length);

    let wordDuration = baseWordDuration + charCount * msPerChar;

    if (/[.!?]$/.test(word)) {
      wordDuration += 320 * rateFactor;
    } else if (/[,;:—–]$/.test(word)) {
      wordDuration += 160 * rateFactor;
    } else if (/[…]$/.test(word) || /\.\.\./.test(word)) {
      wordDuration += 380 * rateFactor;
    }

    cumulativeMs += wordDuration;
    offsets.push({
      word,
      start,
      end,
      timestamp: cumulativeMs,
    });
  }

  return offsets;
}

/**
 * Calculates high-precision word timestamp offsets (in milliseconds) for speech synthesis.
 */
export function calculateWordTimestamps(
  words: string[],
  speechRate: number = 0.92,
  lang: "de" | "en" = "de"
): number[] {
  if (!words || words.length === 0) return [];
  const rateFactor = 1 / Math.max(0.5, Math.min(2.0, speechRate || 0.92));
  const msPerChar = (lang === "de" ? 48 : 42) * rateFactor;
  const timestamps: number[] = [];
  let cumulativeMs = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const pureWord = word.replace(/[^a-zA-Z0-9äöüÄÖÜßáéíóú]/gi, "");
    const charCount = Math.max(1, pureWord.length);

    let wordDuration = Math.max(90 * rateFactor, charCount * msPerChar);

    if (/[.!?]$/.test(word)) {
      wordDuration += 300 * rateFactor;
    } else if (/[,;:—–]$/.test(word)) {
      wordDuration += 150 * rateFactor;
    } else if (/[…]$/.test(word) || /\.\.\./.test(word)) {
      wordDuration += 350 * rateFactor;
    }

    cumulativeMs += wordDuration;
    timestamps.push(cumulativeMs);
  }

  return timestamps;
}
