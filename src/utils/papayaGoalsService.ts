import { GoalItem, GoalCategory, PeriodType, PriorityType, SubTask } from "../components/PapayaGoalsWidget";

const uid = () => Math.random().toString(36).slice(2, 9);
const p2 = (n: number) => String(n).padStart(2, "0");

function getISOWeek(d: Date): [number, number] {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const n = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - n);
  const y = t.getUTCFullYear();
  return [y, Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7)];
}

function getPeriodKey(p: PeriodType, d: Date): string {
  if (p === "d") return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  if (p === "w") {
    const [y, w] = getISOWeek(d);
    return `${y}-W${p2(w)}`;
  }
  if (p === "m") return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
  return `${d.getFullYear()}`;
}

export interface ParsedGoalIntent {
  action: "create" | "discuss" | "list" | "open" | "close";
  title?: string;
  per?: PeriodType;
  subtasks?: string[];
  unit?: string;
  target?: number;
  pri?: PriorityType;
}

/**
 * Reads all goals currently saved in localStorage
 */
export function getStoredGoalsData(): { goals: GoalItem[]; cats: GoalCategory[] } {
  if (typeof window === "undefined") return { goals: [], cats: [] };
  try {
    const raw = localStorage.getItem("papaya.goals");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        cats: Array.isArray(parsed.cats) ? parsed.cats : [],
      };
    }
  } catch (e) {
    console.warn("Could not parse papaya.goals", e);
  }
  return { goals: [], cats: [] };
}

/**
 * Creates and stores a new goal directly into Papaya Goals
 */
export function createGoalFromAgent(params: {
  title: string;
  per?: PeriodType;
  subtasks?: string[];
  catId?: string;
  target?: number;
  unit?: string;
  pri?: PriorityType;
}): GoalItem {
  const { goals, cats } = getStoredGoalsData();
  const per: PeriodType = params.per || "d";
  const now = new Date();
  const key = getPeriodKey(per, now);

  const sub: SubTask[] = (params.subtasks || []).map((t) => ({ t: t.trim(), d: false }));
  const cat = params.catId || (cats.length > 0 ? cats[0].id : "c1");

  const newGoal: GoalItem = {
    id: uid(),
    title: params.title.trim(),
    per,
    key,
    cat,
    type: params.target && params.target > 1 ? "n" : "c",
    val: 0,
    target: params.target || 1,
    unit: params.unit || "",
    pri: params.pri || "m",
    rep: false,
    p: true, // pin newly created goals from agent
    sub: sub.length > 0 ? sub : undefined,
  };

  const updatedGoals = [newGoal, ...goals];
  try {
    localStorage.setItem("papaya.goals", JSON.stringify({ goals: updatedGoals, cats }));
    window.dispatchEvent(new CustomEvent("papaya_goals_updated", { detail: newGoal }));
  } catch (e) {
    console.error("Could not write to papaya.goals", e);
  }

  return newGoal;
}

/**
 * Returns a human-readable prompt summary of current goals for AI sparring
 */
export function getGoalsSummaryForSparring(lang: "de" | "en" = "de"): string {
  const { goals, cats } = getStoredGoalsData();
  const now = new Date();
  const dayKey = getPeriodKey("d", now);
  const weekKey = getPeriodKey("w", now);
  const monthKey = getPeriodKey("m", now);

  const dayGoals = goals.filter((g) => g.per === "d" && g.key === dayKey);
  const weekGoals = goals.filter((g) => g.per === "w" && g.key === weekKey);
  const monthGoals = goals.filter((g) => g.per === "m" && g.key === monthKey);

  const getPct = (list: GoalItem[]) => {
    if (!list.length) return "–";
    const done = list.filter((g) => (g.type === "n" ? g.val >= g.target : g.val >= 1)).length;
    return `${done}/${list.length} (${Math.round((done / list.length) * 100)}%)`;
  };

  if (lang === "en") {
    let out = `[PAPAYA GOALS OVERVIEW]\n`;
    out += `• Today's Goals: ${getPct(dayGoals)}\n`;
    dayGoals.forEach((g) => (out += `  - ${g.val ? "✓" : "○"} ${g.title}\n`));
    out += `• Weekly Goals: ${getPct(weekGoals)}\n`;
    weekGoals.forEach((g) => (out += `  - ${g.val ? "✓" : "○"} ${g.title}\n`));
    out += `• Monthly Goals: ${getPct(monthGoals)}\n`;
    monthGoals.forEach((g) => (out += `  - ${g.val ? "✓" : "○"} ${g.title}\n`));
    return out;
  }

  let out = `[PAPAYA GOALS STATUS-ÜBERSICHT]\n`;
  out += `• Tagesziele: ${getPct(dayGoals)}\n`;
  dayGoals.forEach((g) => (out += `  - ${g.val ? "✓" : "○"} ${g.title}\n`));
  out += `• Wochenziele: ${getPct(weekGoals)}\n`;
  weekGoals.forEach((g) => (out += `  - ${g.val ? "✓" : "○"} ${g.title}\n`));
  out += `• Monatsziele: ${getPct(monthGoals)}\n`;
  monthGoals.forEach((g) => (out += `  - ${g.val ? "✓" : "○"} ${g.title}\n`));
  return out;
}

/**
 * Detects if a user message is a command to create, open, or discuss Papaya Goals
 */
export function detectGoalsCommandFromMessage(text: string): ParsedGoalIntent | null {
  if (!text) return null;
  const clean = text.trim();

  // 1. Close Goals
  if (/(?:schließe|beende|verstecke)\s+(?:goals|ziele|papaya goals|ziel-tracker)/i.test(clean)) {
    return { action: "close" };
  }

  // 2. Open / Show Goals
  if (
    /^(?:öffne|zeige|starten?)\s+(?:goals|ziele|papaya goals|mein(?:e)? ziele|meinen? ziel-tracker)/i.test(clean) ||
    /^(?:was sind meine ziele|zeig mir meine ziele|wie steht es um meine ziele)/i.test(clean)
  ) {
    return { action: "open" };
  }

  // 3. Goal Creation Intent: e.g. "Erstelle mir ein Wochenziel für den Launch mit 4 Teilschritten"
  const createRegex = /(?:erstelle|erstelle mir|neues|lege|erzeuge)\s+(?:ein\s+)?(?:(tages|wochen|monats|jahres)ziel|ziel)(?:\s*:\s*|\s+(?:für|zu|namens|mit dem titel)\s+)?(.*)/i;
  const match = clean.match(createRegex);

  if (match) {
    const rawPeriodType = (match[1] || "").toLowerCase();
    let per: PeriodType = "d";
    if (rawPeriodType.includes("woche")) per = "w";
    else if (rawPeriodType.includes("monat")) per = "m";
    else if (rawPeriodType.includes("jahr")) per = "y";

    let remainder = (match[2] || "").trim();

    // Extract subtasks if mentioned: "mit X teilschritten" or bullet points
    let subtasks: string[] = [];
    const subtaskMatch = remainder.match(/mit\s+(\d+)\s+teilschritten/i);
    const subtaskCount = subtaskMatch ? parseInt(subtaskMatch[1], 10) : 0;

    // Clean title from "mit X teilschritten"
    let title = remainder
      .replace(/mit\s+\d+\s+teilschritten/gi, "")
      .replace(/[.:;!]+$/, "")
      .trim();

    if (!title) {
      title = "Fokus-Meilenstein";
    }

    // Default smart subtasks generation based on context if requested
    if (subtaskCount > 0) {
      if (/launch/i.test(title)) {
        subtasks = [
          "Landingpage & Copy final prüfen",
          "Zahlungsabwicklung & Checkout testen",
          "E-Mail-Kampagne an Warteliste versenden",
          "Social Media Launch-Post live stellen",
        ].slice(0, subtaskCount);
      } else if (/sport|workout|training/i.test(title)) {
        subtasks = [
          "Warm-up & Dehnen",
          "Haupt-Einheit absolvieren",
          "Cool-down & Hydration",
          "Trainingslog dokumentieren",
        ].slice(0, subtaskCount);
      } else if (/buch|lesen/i.test(title)) {
        subtasks = [
          "Kapitel 1-3 lesen",
          "Wichtigste Zitate markieren",
          "Zusammenfassung notieren",
          "Handlungsempfehlungen ableiten",
        ].slice(0, subtaskCount);
      } else {
        for (let i = 1; i <= subtaskCount; i++) {
          subtasks.push(`Teilschritt ${i}: Vorbereitung und Umsetzung`);
        }
      }
    }

    return {
      action: "create",
      title,
      per,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    };
  }

  // 4. Discuss Goals Sparring Intent
  if (
    /(?:bespreche?n?|analysiere?n?|sparring|feedback zu)\s+(?:meine[n]?\s+)?(?:goals|ziele[n]?)/i.test(clean) ||
    /sparring\s+zu\s+meinen?\s+zielen/i.test(clean)
  ) {
    return { action: "discuss" };
  }

  return null;
}
