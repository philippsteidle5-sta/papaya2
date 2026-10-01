import React, { useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Target,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Edit3,
  Trash2,
  ArrowRight,
  RotateCw,
  Award,
  X,
  Flame,
  Trophy,
  Copy,
  Download,
  Upload,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Minus,
  Sliders,
  MessageSquare,
  Bot,
} from "lucide-react";

export type PeriodType = "d" | "w" | "m" | "y";
export type PriorityType = "h" | "m" | "l";
export type GoalType = "c" | "n"; // c = check, n = numeric counter

export interface SubTask {
  t: string;
  d: boolean; // done
}

export interface GoalItem {
  id: string;
  title: string;
  per: PeriodType;
  key: string; // date key like 2026-10-01 or 2026-W40
  cat: string; // category id
  type: GoalType;
  val: number;
  target: number;
  unit?: string;
  step?: number;
  pri: PriorityType;
  rep?: boolean; // repeat / rollover
  p?: boolean; // pinned
  note?: string;
  sub?: SubTask[];
  src?: string;
}

export interface GoalCategory {
  id: string;
  n: string;
  c: string; // color hex
}

interface PapayaGoalsWidgetProps {
  standalone?: boolean;
  isEditMode?: boolean;
  onClose?: () => void;
  agentColor?: string;
  lang?: "de" | "en";
  currentAgentName?: string;
  onDiscussGoalWithAgent?: (goal: {
    title: string;
    per: PeriodType;
    subtasks?: string[];
    id?: string;
    target?: number;
    unit?: string;
  }) => void;
  onDiscussOverallGoals?: () => void;
}

const DEFAULT_CATS: GoalCategory[] = [
  { id: "c1", n: "Persönlich", c: "#ff7a59" },
  { id: "c2", n: "Projekte", c: "#fbbf24" },
  { id: "c3", n: "Gesundheit", c: "#10b981" },
  { id: "c4", n: "Lernen", c: "#22d3ee" },
  { id: "c5", n: "Netzwerk", c: "#ec4899" },
];

const PERIOD_LABELS: Record<PeriodType, { de: string; en: string }> = {
  d: { de: "Tag", en: "Day" },
  w: { de: "Woche", en: "Week" },
  m: { de: "Monat", en: "Month" },
  y: { de: "Jahr", en: "Year" },
};

const PRI_LABELS: Record<PriorityType, { de: string; en: string }> = {
  h: { de: "Hoch", en: "High" },
  m: { de: "Mittel", en: "Medium" },
  l: { de: "Niedrig", en: "Low" },
};

const PRI_WEIGHT: Record<PriorityType, number> = { h: 0, m: 1, l: 2 };

// Date helpers
const p2 = (n: number) => String(n).padStart(2, "0");
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (v: number) => +(+v).toFixed(2);

function getISOWeek(d: Date): [number, number] {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const n = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - n);
  const y = t.getUTCFullYear();
  return [y, Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7)];
}

function getPeriodKey(p: PeriodType, d: Date): string {
  if (p === "d") {
    return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  }
  if (p === "w") {
    const [y, w] = getISOWeek(d);
    return `${y}-W${p2(w)}`;
  }
  if (p === "m") {
    return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
  }
  return `${d.getFullYear()}`;
}

function shiftPeriod(p: PeriodType, d: Date, n: number): Date {
  const x = new Date(d);
  if (p === "d") x.setDate(x.getDate() + n);
  else if (p === "w") x.setDate(x.getDate() + 7 * n);
  else if (p === "m") {
    x.setDate(1);
    x.setMonth(x.getMonth() + n);
  } else {
    x.setDate(1);
    x.setFullYear(x.getFullYear() + n);
  }
  return x;
}

function formatPeriodLabel(p: PeriodType, d: Date, lang: "de" | "en"): string {
  const isEn = lang === "en";
  if (p === "d") {
    return d.toLocaleDateString(isEn ? "en-US" : "de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
  if (p === "w") {
    const [, w] = getISOWeek(d);
    return isEn ? `Week ${w} · ${d.getFullYear()}` : `KW ${w} · ${d.getFullYear()}`;
  }
  if (p === "m") {
    return d.toLocaleDateString(isEn ? "en-US" : "de-DE", {
      month: "long",
      year: "numeric",
    });
  }
  return `${d.getFullYear()}`;
}

export const PapayaGoalsWidget: React.FC<PapayaGoalsWidgetProps> = ({
  standalone = true,
  isEditMode = false,
  onClose,
  agentColor = "#ff7a59",
  lang = "de",
  currentAgentName = "S.Y.N.T.A.X.",
  onDiscussGoalWithAgent,
  onDiscussOverallGoals,
}) => {
  const langKey: "de" | "en" = lang === "en" ? "en" : "de";
  const isEn = langKey === "en";

  // Data state
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [cats, setCats] = useState<GoalCategory[]>(DEFAULT_CATS);
  const [skip, setSkip] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active view filters
  const [per, setPer] = useState<PeriodType>("d");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [filterCat, setFilterCat] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Editor sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Editor form values
  const [formTitle, setFormTitle] = useState("");
  const [formPer, setFormPer] = useState<PeriodType>("d");
  const [formCat, setFormCat] = useState("c1");
  const [formType, setFormType] = useState<GoalType>("c");
  const [formPri, setFormPri] = useState<PriorityType>("m");
  const [formTarget, setFormTarget] = useState(1);
  const [formUnit, setFormUnit] = useState("");
  const [formStep, setFormStep] = useState(1);
  const [formRep, setFormRep] = useState(false);
  const [formNote, setFormNote] = useState("");
  const [formSub, setFormSub] = useState<SubTask[]>([]);
  const [newSubText, setNewSubText] = useState("");

  // Category creation in sheet
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#a855f7");

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // JSON Import / Export text
  const [jsonText, setJsonText] = useState("");

  // Fullscreen / Window state
  const [isMaximized, setIsMaximized] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("papaya.goals");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.goals && Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
        }
        if (parsed.cats && Array.isArray(parsed.cats)) {
          setCats(parsed.cats);
        }
        if (parsed.skip && Array.isArray(parsed.skip)) {
          setSkip(parsed.skip);
        }
      } else {
        // Seed default initial goals
        const t = new Date();
        const initialSeed: GoalItem[] = [
          {
            id: uid(),
            per: "d",
            key: getPeriodKey("d", t),
            title: isEn ? "Morning Routine" : "Morgenroutine",
            cat: "c1",
            type: "c",
            target: 1,
            val: 0,
            pri: "h",
            rep: true,
            p: true,
          },
          {
            id: uid(),
            per: "d",
            key: getPeriodKey("d", t),
            title: isEn ? "Drink Water" : "Wasser trinken",
            cat: "c3",
            type: "n",
            val: 1,
            target: 2.5,
            unit: "Liter",
            step: 0.5,
            pri: "m",
            rep: true,
          },
          {
            id: uid(),
            per: "d",
            key: getPeriodKey("d", t),
            title: isEn ? "Deep Focus Session" : "Fokusblock für System-Features",
            cat: "c2",
            type: "c",
            target: 1,
            val: 0,
            pri: "h",
            rep: false,
          },
          {
            id: uid(),
            per: "w",
            key: getPeriodKey("w", t),
            title: isEn ? "Workouts & Sport" : "Sport & Training",
            cat: "c3",
            type: "n",
            val: 1,
            target: 3,
            unit: isEn ? "Sessions" : "Einheiten",
            step: 1,
            pri: "m",
            rep: true,
          },
          {
            id: uid(),
            per: "m",
            key: getPeriodKey("m", t),
            title: isEn ? "Product Milestone Launch" : "Beta-Launch abschließen",
            cat: "c2",
            type: "n",
            val: 4,
            target: 10,
            unit: isEn ? "Tasks" : "Aufgaben",
            step: 1,
            pri: "h",
            rep: false,
          },
          {
            id: uid(),
            per: "y",
            key: getPeriodKey("y", t),
            title: isEn ? "Read 12 Books" : "Zehn Bücher lesen",
            cat: "c4",
            type: "n",
            val: 3,
            target: 10,
            unit: isEn ? "Books" : "Bücher",
            step: 1,
            pri: "l",
            rep: false,
          },
        ];
        setGoals(initialSeed);
      }
    } catch (e) {
      console.warn("Error reading goals from localStorage", e);
    }
    setIsLoaded(true);
  }, [isEn]);

  // Listen for real-time external updates from AI agent
  useEffect(() => {
    const handleExternalUpdate = () => {
      try {
        const stored = localStorage.getItem("papaya.goals");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.goals && Array.isArray(parsed.goals)) {
            setGoals(parsed.goals);
          }
          if (parsed.cats && Array.isArray(parsed.cats)) {
            setCats(parsed.cats);
          }
        }
      } catch (e) {}
    };
    window.addEventListener("papaya_goals_updated", handleExternalUpdate);
    return () => window.removeEventListener("papaya_goals_updated", handleExternalUpdate);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        "papaya.goals",
        JSON.stringify({ goals, cats, skip, seeded: 1 })
      );
    } catch (e) {
      console.error("Error saving goals to localStorage", e);
    }
  }, [goals, cats, skip, isLoaded]);

  // Ensure recurring goals rollover
  useEffect(() => {
    if (!isLoaded) return;
    const currentKey = getPeriodKey(per, currentDate);
    const todayKey = getPeriodKey(per, new Date());
    if (currentKey > todayKey) return;

    const prevDate = shiftPeriod(per, currentDate, -1);
    const prevKey = getPeriodKey(per, prevDate);

    const candidates = goals.filter((g) => g.per === per && g.key === prevKey && g.rep);
    if (!candidates.length) return;

    setGoals((prev) => {
      let changed = false;
      const nextGoals = [...prev];

      candidates.forEach((g) => {
        const src = g.src || g.id;
        const exists = nextGoals.some(
          (x) => x.src === src && x.per === per && x.key === currentKey
        );
        const isSkipped = skip.includes(`${src}|${per}|${currentKey}`);

        if (!exists && !isSkipped) {
          nextGoals.push({
            ...g,
            id: uid(),
            key: currentKey,
            val: 0,
            src,
          });
          changed = true;
        }
      });

      return changed ? nextGoals : prev;
    });
  }, [per, currentDate, isLoaded, skip]);

  // Goal progress calculation (0.0 to 1.0)
  const getGoalProgress = (g: GoalItem): number => {
    if (g.type === "n") {
      return Math.min(1, Math.max(0, g.val / (g.target || 1)));
    }
    return g.val ? 1 : 0;
  };

  // Goals of current period & key
  const currentKey = useMemo(() => getPeriodKey(per, currentDate), [per, currentDate]);

  const periodGoals = useMemo(() => {
    return goals.filter((g) => g.per === per && g.key === currentKey);
  }, [goals, per, currentKey]);

  // Filtered goals by search & category
  const filteredGoals = useMemo(() => {
    return periodGoals.filter((g) => {
      const matchCat = !filterCat || g.cat === filterCat;
      const matchQuery =
        !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [periodGoals, filterCat, searchQuery]);

  // Average completion rate of a list of goals
  const getAverage = (list: GoalItem[]): number | null => {
    if (!list.length) return null;
    const sum = list.reduce((acc, g) => acc + getGoalProgress(g), 0);
    return sum / list.length;
  };

  const periodAvg = useMemo(() => getAverage(periodGoals), [periodGoals]);
  const periodPercentage = periodAvg === null ? 0 : Math.round(periodAvg * 100);
  const completedCount = useMemo(
    () => periodGoals.filter((g) => getGoalProgress(g) >= 1).length,
    [periodGoals]
  );

  // Category lookup
  const getCat = (catId: string): GoalCategory => {
    return cats.find((c) => c.id === catId) || { id: "none", n: isEn ? "None" : "Ohne", c: "#8b8f9c" };
  };

  // Daily streak calculator (consecutive days where all goals were 100% completed)
  const currentStreak = useMemo(() => {
    let streak = 0;
    const t = new Date();
    for (let i = 0; i < 400; i++) {
      const d = shiftPeriod("d", t, -i);
      const k = getPeriodKey("d", d);
      const dayGoals = goals.filter((g) => g.per === "d" && g.key === k);
      if (!dayGoals.length) {
        if (i === 0) continue;
        break;
      }
      if (dayGoals.every((g) => getGoalProgress(g) >= 1)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [goals]);

  // Total completed goals
  const totalCompleted = useMemo(() => {
    return goals.filter((g) => getGoalProgress(g) >= 1).length;
  }, [goals]);

  // XP & Level calculations
  const { currentLevel, xp, levelTitle, lowXp, highXp, xpProgressPct } = useMemo(() => {
    const calculateGoalXp = (g: GoalItem) => {
      const base = g.pri === "h" ? 30 : g.pri === "m" ? 20 : 10;
      const mult = g.per === "d" ? 1 : g.per === "w" ? 3 : g.per === "m" ? 8 : 20;
      return base * mult;
    };

    const totalXp = goals
      .filter((g) => getGoalProgress(g) >= 1)
      .reduce((acc, g) => acc + calculateGoalXp(g), 0);

    const level = Math.floor(Math.sqrt(totalXp / 50)) + 1;
    const low = 50 * Math.pow(level - 1, 2);
    const high = 50 * Math.pow(level, 2);
    const pct = high > low ? Math.min(100, Math.round(((totalXp - low) / (high - low)) * 100)) : 100;

    const titlesDe = ["Keimling", "Sprössling", "Macher", "Profi", "Meister", "Legende"];
    const titlesEn = ["Sprout", "Sapling", "Achiever", "Pro", "Master", "Legend"];
    const title = (isEn ? titlesEn : titlesDe)[Math.min(level - 1, 5)] || (isEn ? "Legend" : "Legende");

    return {
      currentLevel: level,
      xp: totalXp,
      levelTitle: title,
      lowXp: low,
      highXp: high,
      xpProgressPct: pct,
    };
  }, [goals, isEn]);

  // Celebration trigger
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff7a59", "#ffb547", "#5fd68a", "#22d3ee", "#ec4899"],
        zIndex: 999999,
      });
    } catch (e) {
      console.warn("Celebration confetti error", e);
    }
  };

  // Step action (increment, check, toggle)
  const handleStep = (id: string, fn: (g: GoalItem) => number) => {
    setGoals((prev) => {
      let isAllCompleted = false;
      const next = prev.map((g) => {
        if (g.id !== id) return g;
        const wasDone = getGoalProgress(g) >= 1;
        const newVal = fn(g);
        const nowDone = g.type === "n" ? newVal >= (g.target || 1) : newVal >= 1;

        if (!wasDone && nowDone) {
          // Check if all goals in this period are now done
          const otherGoals = prev.filter((x) => x.per === g.per && x.key === g.key && x.id !== id);
          if (otherGoals.every((x) => getGoalProgress(x) >= 1)) {
            isAllCompleted = true;
          }
        }
        return { ...g, val: newVal };
      });

      if (isAllCompleted) {
        showToast(isEn ? "🎉 All goals achieved in this period!" : "🎉 Alles erreicht in diesem Zeitraum!");
        triggerCelebration();
      } else {
        const target = next.find((x) => x.id === id);
        if (target && getGoalProgress(target) >= 1) {
          showToast(isEn ? "Goal achieved!" : "Ziel erreicht!");
        }
      }

      return next;
    });
  };

  // Toggle Checkbox goal
  const handleToggleCheck = (id: string) => {
    handleStep(id, (g) => (g.val ? 0 : 1));
  };

  // Plus counter
  const handleIncrement = (id: string) => {
    handleStep(id, (g) => fmt(g.val + (g.step || 1)));
  };

  // Minus counter
  const handleDecrement = (id: string) => {
    handleStep(id, (g) => Math.max(0, fmt(g.val - (g.step || 1))));
  };

  // Pin goal
  const handleTogglePin = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, p: !g.p } : g))
    );
  };

  // Shift goal to next period
  const handleShiftNext = (id: string) => {
    const nextDate = shiftPeriod(per, currentDate, 1);
    const nextKey = getPeriodKey(per, nextDate);
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, key: nextKey } : g))
    );
    showToast(isEn ? "Moved to next period →" : "In nächsten Zeitraum verschoben →");
  };

  // Toggle Sub-task (Teilschritt)
  const handleToggleSubTask = (goalId: string, subIndex: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId || !g.sub) return g;
        const nextSub = g.sub.map((s, idx) =>
          idx === subIndex ? { ...s, d: !s.d } : s
        );
        return { ...g, sub: nextSub };
      })
    );
  };

  // Open Editor Sheet
  const handleOpenSheet = (goalId?: string) => {
    if (goalId) {
      const g = goals.find((x) => x.id === goalId);
      if (!g) return;
      setEditingId(g.id);
      setFormTitle(g.title);
      setFormPer(g.per);
      setFormCat(g.cat);
      setFormType(g.type);
      setFormPri(g.pri);
      setFormTarget(g.target || 1);
      setFormUnit(g.unit || "");
      setFormStep(g.step || 1);
      setFormRep(Boolean(g.rep));
      setFormNote(g.note || "");
      setFormSub(g.sub ? [...g.sub] : []);
    } else {
      setEditingId(null);
      setFormTitle("");
      setFormPer(per);
      setFormCat(filterCat || cats[0]?.id || "c1");
      setFormType("c");
      setFormPri("m");
      setFormTarget(1);
      setFormUnit("");
      setFormStep(1);
      setFormRep(false);
      setFormNote("");
      setFormSub([]);
    }
    setNewSubText("");
    setIsSheetOpen(true);
  };

  // Save Goal
  const handleSaveGoal = () => {
    const cleanTitle = formTitle.trim();
    if (!cleanTitle) {
      showToast(isEn ? "Please enter a title" : "Bitte einen Titel eingeben");
      return;
    }
    if (!cats.length) {
      showToast(isEn ? "Create a category first" : "Lege zuerst eine Kategorie an");
      return;
    }

    const payload = {
      title: cleanTitle,
      per: formPer,
      cat: formCat,
      type: formType,
      pri: formPri,
      target: Math.max(0.1, Number(formTarget) || 1),
      unit: formUnit.trim(),
      step: Math.max(0.1, Number(formStep) || 1),
      rep: formRep,
      note: formNote.trim(),
      sub: formSub,
    };

    if (editingId) {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== editingId) return g;
          const nextKey = formPer !== g.per ? getPeriodKey(formPer, currentDate) : g.key;
          return { ...g, ...payload, key: nextKey };
        })
      );
      showToast(isEn ? "Goal updated" : "Ziel gespeichert");
    } else {
      const newGoal: GoalItem = {
        ...payload,
        id: uid(),
        key: getPeriodKey(formPer, currentDate),
        val: 0,
        p: false,
      };
      setGoals((prev) => [newGoal, ...prev]);
      showToast(isEn ? "Goal created" : "Ziel angelegt");
    }

    if (formPer !== per) {
      setPer(formPer);
    }
    setIsSheetOpen(false);
  };

  // Delete Goal
  const handleDeleteGoal = () => {
    if (!editingId) return;
    const target = goals.find((x) => x.id === editingId);
    if (target && (target.src || target.rep)) {
      setSkip((prev) => [...prev, `${target.src || target.id}|${target.per}|${target.key}`]);
    }
    setGoals((prev) => prev.filter((x) => x.id !== editingId));
    setIsSheetOpen(false);
    showToast(isEn ? "Goal deleted" : "Ziel gelöscht");
  };

  // Add Subtask inside editor
  const handleAddSubTask = () => {
    const text = newSubText.trim();
    if (!text) return;
    setFormSub((prev) => [...prev, { t: text, d: false }]);
    setNewSubText("");
  };

  // Add new Category
  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const newCategory: GoalCategory = {
      id: `c_${uid()}`,
      n: name,
      c: newCatColor,
    };
    setCats((prev) => [...prev, newCategory]);
    setNewCatName("");
    setFormCat(newCategory.id);
    showToast(isEn ? "Category added" : "Kategorie hinzugefügt");
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (goals.some((g) => g.cat === catId)) {
      showToast(isEn ? "Category still in use by goals" : "Kategorie wird noch von Zielen genutzt");
      return;
    }
    setCats((prev) => prev.filter((c) => c.id !== catId));
    if (filterCat === catId) setFilterCat("");
  };

  // Export JSON
  const handleExportJSON = async () => {
    const dataStr = JSON.stringify({ goals, cats, skip }, null, 2);
    try {
      await navigator.clipboard.writeText(dataStr);
      showToast(isEn ? "Export copied to clipboard!" : "Export kopiert!");
    } catch (e) {
      setJsonText(dataStr);
      showToast(isEn ? "Export text generated below" : "Export-Text im Feld generiert");
    }
  };

  // Import JSON
  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed.goals) || !Array.isArray(parsed.cats)) {
        throw new Error("Invalid structure");
      }
      setGoals(parsed.goals);
      setCats(parsed.cats);
      setSkip(parsed.skip || []);
      setJsonText("");
      showToast(isEn ? "Import successful!" : "Import erfolgreich!");
    } catch (e) {
      showToast(isEn ? "Invalid JSON data" : "Ungültige Daten");
    }
  };

  // 26-week Heatmap generation
  const heatmapDays = useMemo(() => {
    const t = new Date();
    // 26 weeks * 7 = 182 days
    const dayOfWeek = (t.getDay() + 6) % 7;
    const startDate = shiftPeriod("d", t, -(dayOfWeek + 175));
    const days: { key: string; count: number; total: number; pct: number }[] = [];

    for (let d = new Date(startDate); d <= t; d = shiftPeriod("d", d, 1)) {
      const dk = getPeriodKey("d", d);
      const dayList = goals.filter((g) => g.per === "d" && g.key === dk);
      const done = dayList.filter((g) => getGoalProgress(g) >= 1).length;
      const total = dayList.length;
      const pct = total > 0 ? done / total : 0;
      days.push({ key: dk, count: done, total, pct });
    }
    return days;
  }, [goals]);

  // Year Months Bar Chart
  const yearMonths = useMemo(() => {
    const y = currentDate.getFullYear();
    const monthsDe = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const list = isEn ? monthsEn : monthsDe;

    return list.map((name, m) => {
      const mk = `${y}-${p2(m + 1)}`;
      const mGoals = goals.filter((g) => g.per === "m" && g.key === mk);
      const avg = getAverage(mGoals);
      return {
        month: m,
        name,
        avg,
        pct: avg !== null ? Math.round(avg * 100) : null,
      };
    });
  }, [goals, currentDate, isEn]);

  // 10 Badges with unlock state
  const badges = useMemo(() => {
    return [
      {
        icon: "🔥",
        title: isEn ? "7 Days Streak" : "7 Tage Serie",
        unlocked: currentStreak >= 7,
      },
      {
        icon: "🏆",
        title: isEn ? "30 Days Streak" : "30 Tage Serie",
        unlocked: currentStreak >= 30,
      },
      {
        icon: "✅",
        title: isEn ? "10 Goals Done" : "10 Ziele erreicht",
        unlocked: totalCompleted >= 10,
      },
      {
        icon: "💯",
        title: isEn ? "50 Goals Done" : "50 Ziele erreicht",
        unlocked: totalCompleted >= 50,
      },
      {
        icon: "🌟",
        title: isEn ? "Level 5 Reached" : "Level 5 erreicht",
        unlocked: currentLevel >= 5,
      },
      {
        icon: "📅",
        title: isEn ? "Yearly Goal Achieved" : "Jahresziel erreicht",
        unlocked: goals.some((g) => g.per === "y" && getGoalProgress(g) >= 1),
      },
      {
        icon: "🧭",
        title: isEn ? "5 Categories Used" : "5 Kategorien genutzt",
        unlocked: new Set(goals.map((g) => g.cat)).size >= 5,
      },
      {
        icon: "📌",
        title: isEn ? "Goal Pinned" : "Ziel angeheftet",
        unlocked: goals.some((g) => g.p),
      },
      {
        icon: "✍️",
        title: isEn ? "Sub-tasks Used" : "Teilschritte genutzt",
        unlocked: goals.some((g) => g.sub && g.sub.length > 0),
      },
      {
        icon: "👑",
        title: isEn ? "Level 10 Master" : "Level 10 Meister",
        unlocked: currentLevel >= 10,
      },
    ];
  }, [currentStreak, totalCompleted, currentLevel, goals, isEn]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="PapayaOS Goals"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      style={{
        fontFamily: '"Bricolage Grotesque", "Inter", system-ui, sans-serif',
      }}
    >
      <div
        className={`w-full ${
          isMaximized ? "max-w-[98vw] h-[96vh]" : "max-w-[1140px] max-h-[92vh] h-[860px]"
        } flex flex-col rounded-[24px] overflow-hidden border border-[#2a262e] bg-[#0c0a0e] text-[#f4f0ea] shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(255,122,89,0.12)] relative transition-all duration-200`}
      >
        {/* HEADER BAR */}
        <header className="flex flex-col gap-2.5 px-5 py-3.5 border-b border-[#221e26] bg-[#121015] flex-shrink-0 z-10">
          <div className="flex items-center gap-3 flex-wrap justify-between">
            {/* Logo Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff7a59]/15 border border-[#ff7a59]/30 text-[#f4f0ea] text-[12px] font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-[#ff7a59] shadow-[0_0_8px_#ff7a59] animate-pulse" />
              <b className="text-white">PapayaOS Goals</b>
              <span className="text-[#9a94a0] ml-1">· {goals.length} {isEn ? "Goals" : "Ziele"}</span>
            </div>

            {/* Period Segmented Switcher (Tag, Woche, Monat, Jahr) */}
            <div className="flex items-center bg-[#070608] border border-[#242028] rounded-[11px] p-[3px] gap-[3px] text-[12px] font-mono">
              {(Object.keys(PERIOD_LABELS) as PeriodType[]).map((pKey) => (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setPer(pKey)}
                  className={`px-3 py-1 rounded-[8px] font-semibold cursor-pointer transition ${
                    per === pKey
                      ? "bg-[#ff7a59] text-[#1b1006] shadow-sm"
                      : "text-[#9a94a0] hover:text-white"
                  }`}
                >
                  {PERIOD_LABELS[pKey][langKey]}
                </button>
              ))}
            </div>

            {/* Period Navigator: ‹ label › */}
            <div className="flex items-center gap-1 bg-[#19161c] border border-[#2a262e] rounded-full px-2.5 py-1 text-[12px] font-mono">
              <button
                type="button"
                onClick={() => setCurrentDate((d) => shiftPeriod(per, d, -1))}
                className="p-1 hover:text-white text-[#9a94a0] transition cursor-pointer"
                title={isEn ? "Previous period" : "Vorheriger Zeitraum"}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium min-w-[140px] text-center text-[#f4f0ea]">
                {formatPeriodLabel(per, currentDate, langKey)}
              </span>
              <button
                type="button"
                onClick={() => setCurrentDate((d) => shiftPeriod(per, d, 1))}
                className="p-1 hover:text-white text-[#9a94a0] transition cursor-pointer"
                title={isEn ? "Next period" : "Nächster Zeitraum"}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-full bg-[#19161c] hover:bg-white/[0.08] border border-[#2a262e] text-[12px] font-mono text-[#f4f0ea] cursor-pointer transition"
              >
                {isEn ? "Today" : "Heute"}
              </button>

              {/* Agent Sparring & Analysis Trigger */}
              {onDiscussOverallGoals && (
                <button
                  type="button"
                  onClick={onDiscussOverallGoals}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff7a59]/20 via-[#ffb547]/20 to-[#ff7a59]/15 hover:from-[#ff7a59]/30 hover:to-[#ffb547]/30 border border-[#ff7a59]/40 text-[#ffb547] hover:text-white font-bold text-[12px] flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_15px_rgba(255,122,89,0.2)] active:scale-95 font-mono"
                  title={isEn ? `Discuss goals with ${currentAgentName}` : `Ziele mit ${currentAgentName} besprechen`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ff7a59] animate-pulse" />
                  <span>{isEn ? `Sparring with ${currentAgentName}` : `Sparring mit ${currentAgentName}`}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenSheet()}
                className="px-3.5 py-1.5 rounded-full bg-[#ff7a59] hover:bg-[#ff8f73] text-[#1a0d08] font-bold text-[12px] flex items-center gap-1.5 cursor-pointer transition shadow-[0_2px_12px_rgba(255,122,89,0.3)] active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isEn ? "New Goal" : "Neues Ziel"}</span>
              </button>

              {/* Maximize toggle */}
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="w-8 h-8 rounded-[9px] bg-[#19161c] hover:bg-white/[0.08] border border-[#2a262e] text-[#9a94a0] hover:text-white flex items-center justify-center transition cursor-pointer"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-[9px] bg-[#19161c] hover:bg-rose-500/20 hover:text-rose-400 border border-[#2a262e] text-[#9a94a0] flex items-center justify-center transition cursor-pointer"
                  title={isEn ? "Close" : "Schließen"}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search bar & Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
            <div className="flex items-center gap-1.5 bg-[#0a090c] border border-[#242028] rounded-full px-3 py-1 flex-none">
              <Search className="w-3.5 h-3.5 text-[#8b8f9c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search goals..." : "Ziele suchen..."}
                className="bg-transparent border-0 outline-none text-[12px] text-white placeholder:text-[#6f7382] w-28 sm:w-36 font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Chips */}
            <button
              type="button"
              onClick={() => setFilterCat("")}
              className={`flex-none px-3 py-1 rounded-full text-[11px] font-mono cursor-pointer transition border ${
                !filterCat
                  ? "bg-[#ff7a59]/20 border-[#ff7a59] text-white font-bold"
                  : "bg-[#141217] border-[#2a262e] text-[#cfd1d8] hover:border-white/20"
              }`}
            >
              {isEn ? "All" : "Alle"} <small className="text-[#8b8f9c]">({periodGoals.length})</small>
            </button>

            {cats.map((c) => {
              const count = periodGoals.filter((g) => g.cat === c.id).length;
              const isSelected = filterCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilterCat(isSelected ? "" : c.id)}
                  className={`flex-none flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono cursor-pointer transition border ${
                    isSelected
                      ? "bg-[#ff7a59]/20 border-[#ff7a59] text-white font-bold"
                      : "bg-[#141217] border-[#2a262e] text-[#cfd1d8] hover:border-white/20"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.c }} />
                  <span>{c.n}</span>
                  <small className="text-[#8b8f9c]">({count})</small>
                </button>
              );
            })}
          </div>
        </header>

        {/* MAIN BODY 2-COLUMN WRAPPER */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 p-4 sm:p-5 relative">
          {/* LEFT COLUMN: Ring, Minis, Bilanz, Heatmap, Level & XP */}
          <aside className="flex flex-col gap-4">
            {/* CARD 1: Radial Progress Ring */}
            <div className="bg-[#141217] border border-[#242028] rounded-[20px] p-5 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
              <div className="relative w-[190px] h-[190px]">
                <svg viewBox="0 0 180 180" className="w-full h-full block">
                  <defs>
                    <linearGradient id="papaya-goal-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff7a59" />
                      <stop offset="100%" stopColor="#ffb547" />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="12"
                  />
                  {/* Filled Arc */}
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="url(#papaya-goal-gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="439.8"
                    strokeDashoffset={439.8 * (1 - (periodAvg || 0))}
                    transform="rotate(-90 90 90)"
                    className="transition-all duration-700 ease-out"
                    style={{
                      filter: periodAvg === 1 ? "drop-shadow(0 0 10px #ff7a59)" : "none",
                    }}
                  />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <b className="text-[44px] font-bold leading-none tracking-tight text-white">
                    {periodAvg === null ? "–" : `${periodPercentage}%`}
                  </b>
                  <span className="text-[11px] font-mono text-[#8b8f9c] mt-1.5 uppercase tracking-wider">
                    {PERIOD_LABELS[per][langKey]}
                  </span>
                </div>
              </div>

              <div className="text-[13px] text-[#cfd1d8] text-center mt-3 font-medium">
                {periodGoals.length
                  ? `${completedCount} ${isEn ? "of" : "von"} ${periodGoals.length} ${
                      isEn ? "goals achieved" : "Zielen erreicht"
                    }`
                  : isEn
                  ? "No goals in this period yet"
                  : "Noch keine Ziele in diesem Zeitraum"}
              </div>

              {/* XP & Leveling Bar */}
              <div className="w-full mt-4 pt-3.5 border-t border-[#221e26]">
                <div className="flex justify-between items-center text-[11px] font-mono text-[#8b8f9c] mb-1.5">
                  <span>
                    Level <b className="text-[#ffb547]">{currentLevel}</b> · {levelTitle}
                  </span>
                  <span>
                    {xp} / {highXp} XP
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff7a59] to-[#ffb547] transition-all duration-500"
                    style={{ width: `${xpProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Mini Rings for All 4 Periods */}
            <div className="bg-[#141217] border border-[#242028] rounded-[20px] p-4">
              <h3 className="text-[12px] font-mono font-semibold text-[#8b8f9c] uppercase tracking-wider m-0 mb-3">
                {isEn ? "All Periods for this Date" : "Alle Zeiträume rund um dieses Datum"}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(PERIOD_LABELS) as PeriodType[]).map((pKey) => {
                  const pKeyString = getPeriodKey(pKey, currentDate);
                  const pList = goals.filter((g) => g.per === pKey && g.key === pKeyString);
                  const pAvg = getAverage(pList);
                  const pPct = pAvg === null ? 0 : Math.round(pAvg * 100);
                  const isActive = per === pKey;

                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => setPer(pKey)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-[14px] border transition cursor-pointer ${
                        isActive
                          ? "bg-[#ff7a59]/15 border-[#ff7a59] text-white shadow-sm"
                          : "bg-white/[0.03] border-transparent hover:border-white/15 text-[#8b8f9c] hover:text-white"
                      }`}
                    >
                      <div className="w-10 h-10 relative">
                        <svg viewBox="0 0 40 40" className="w-full h-full">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="url(#papaya-goal-gradient)"
                            strokeWidth="4"
                            strokeDasharray="100.5"
                            strokeDashoffset={100.5 * (1 - (pAvg || 0))}
                            transform="rotate(-90 20 20)"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span className="text-[10.5px] font-mono">{PERIOD_LABELS[pKey][langKey]}</span>
                      <b className="text-[12px] text-white">
                        {pAvg === null ? "–" : `${pPct}%`}
                      </b>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 3: Bilanz (Streak, Total, Heatmap & Categories) */}
            <div className="bg-[#141217] border border-[#242028] rounded-[20px] p-4">
              <h3 className="text-[12px] font-mono font-semibold text-[#8b8f9c] uppercase tracking-wider m-0 mb-3">
                {isEn ? "Stats & 26-Week Heatmap" : "Bilanz & 26-Wochen-Heatmap"}
              </h3>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-white/[0.04] border border-white/5 rounded-[12px] p-2.5">
                  <small className="block text-[10px] font-mono text-[#8b8f9c] mb-1">
                    {isEn ? "Streak (Days)" : "Serie (Tage)"}
                  </small>
                  <div className="text-[20px] font-bold text-[#ffb547] flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-[#ff7a59]" />
                    <span>{currentStreak}</span>
                  </div>
                </div>

                <div className="bg-white/[0.04] border border-white/5 rounded-[12px] p-2.5">
                  <small className="block text-[10px] font-mono text-[#8b8f9c] mb-1">
                    {isEn ? "Total Achieved" : "Erreicht gesamt"}
                  </small>
                  <div className="text-[20px] font-bold text-white flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    <span>{totalCompleted}</span>
                  </div>
                </div>
              </div>

              {/* 26-Week Heatmap Grid */}
              <div
                className="grid grid-rows-7 grid-flow-col gap-1 my-3 overflow-x-auto scrollbar-none pb-1"
                aria-label="Tagesziele der letzten 26 Wochen"
              >
                {heatmapDays.map((hd) => {
                  const isCurrent = hd.key === currentKey && per === "d";
                  let bgStyle = "bg-white/[0.05]";
                  if (hd.total > 0) {
                    bgStyle =
                      hd.pct >= 1
                        ? "bg-[#ff7a59]"
                        : hd.pct > 0.4
                        ? "bg-[#ff7a59]/60"
                        : "bg-[#ff7a59]/30";
                  }

                  return (
                    <button
                      key={hd.key}
                      type="button"
                      onClick={() => {
                        setPer("d");
                        setCurrentDate(new Date(`${hd.key}T12:00:00`));
                      }}
                      className={`w-3.5 h-3.5 rounded-[3px] transition cursor-pointer ${bgStyle} ${
                        isCurrent ? "ring-2 ring-[#ffb547]" : ""
                      }`}
                      title={`${hd.key}: ${hd.count}/${hd.total} ${isEn ? "completed" : "erreicht"}`}
                    />
                  );
                })}
              </div>

              {/* Category Progress Bars */}
              <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[#221e26]">
                {cats.map((c) => {
                  const catList = periodGoals.filter((g) => g.cat === c.id);
                  const cAvg = getAverage(catList);
                  if (cAvg === null) return null;
                  const cPct = Math.round(cAvg * 100);

                  return (
                    <div key={c.id} className="grid grid-cols-[85px_1fr_36px] items-center gap-2 text-[11px] font-mono">
                      <span className="truncate text-[#cfd1d8]">{c.n}</span>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${cPct}%`, backgroundColor: c.c }}
                        />
                      </div>
                      <span className="text-right text-[#8b8f9c]">{cPct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 4: Year Progress (Jan - Dez) */}
            <div className="bg-[#141217] border border-[#242028] rounded-[20px] p-4">
              <h3 className="text-[12px] font-mono font-semibold text-[#8b8f9c] uppercase tracking-wider m-0 mb-3">
                {isEn ? "Year Overview" : "Jahresverlauf"} · {currentDate.getFullYear()}
              </h3>
              <div className="grid grid-cols-12 gap-1 items-end h-[75px]">
                {yearMonths.map((ym) => {
                  const isCurMonth = per === "m" && currentDate.getMonth() === ym.month;
                  const hPx = ym.avg === null ? 3 : 3 + Math.round(ym.avg * 52);

                  return (
                    <button
                      key={ym.month}
                      type="button"
                      onClick={() => {
                        setPer("m");
                        setCurrentDate(new Date(currentDate.getFullYear(), ym.month, 1));
                      }}
                      className={`flex flex-col items-center justify-end h-full gap-1.5 text-[9px] font-mono cursor-pointer transition ${
                        isCurMonth ? "text-white font-bold" : "text-[#8b8f9c] hover:text-white"
                      }`}
                      title={`${ym.name} ${currentDate.getFullYear()}: ${
                        ym.pct === null ? "–" : `${ym.pct}%`
                      }`}
                    >
                      <div
                        className="w-full rounded-[3px] bg-gradient-to-t from-[#ff7a59] to-[#ffb547] transition-all duration-300"
                        style={{
                          height: `${hPx}px`,
                          opacity: ym.avg === null ? 0.2 : 1,
                        }}
                      />
                      <span>{ym.name.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 5: Badges (Abzeichen) */}
            <div className="bg-[#141217] border border-[#242028] rounded-[20px] p-4">
              <h3 className="text-[12px] font-mono font-semibold text-[#8b8f9c] uppercase tracking-wider m-0 mb-3">
                {isEn ? "Badges & Achievements" : "Abzeichen"}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {badges.map((b, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-[12px] flex items-center justify-center text-[18px] border transition ${
                      b.unlocked
                        ? "bg-[#ffb547]/15 border-[#ffb547] shadow-[0_0_12px_rgba(255,181,71,0.25)]"
                        : "bg-white/[0.03] border-white/5 grayscale opacity-30"
                    }`}
                    title={b.title}
                  >
                    <span>{b.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 6: Data Backup (Export / Import) */}
            <div className="bg-[#141217] border border-[#242028] rounded-[20px] p-4 text-[11px] font-mono">
              <h3 className="text-[12px] font-mono font-semibold text-[#8b8f9c] uppercase tracking-wider m-0 mb-2">
                {isEn ? "Backup & Sync" : "Daten sichern"}
              </h3>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={isEn ? "Paste JSON to import or view export..." : "JSON hier einfügen, Import ersetzt alle Daten..."}
                rows={2}
                className="w-full bg-[#0b0d14] border border-[#2a262e] rounded-[10px] p-2 text-white outline-none mb-2"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex-1 py-1.5 px-2 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center gap-1 cursor-pointer transition border border-white/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEn ? "Copy Export" : "Export kopieren"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleImportJSON}
                  disabled={!jsonText.trim()}
                  className="flex-1 py-1.5 px-2 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1 cursor-pointer transition border border-white/10"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isEn ? "Import" : "Importieren"}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Goals List grouped by Category */}
          <section className="flex flex-col gap-4">
            {filteredGoals.length > 0 ? (
              cats.map((c) => {
                const catGoals = filteredGoals
                  .filter((g) => g.cat === c.id)
                  .sort((x, y) => {
                    // Pinned first
                    if (Boolean(y.p) !== Boolean(x.p)) return y.p ? 1 : -1;
                    // Incomplete before complete
                    const xDone = getGoalProgress(x) >= 1 ? 1 : 0;
                    const yDone = getGoalProgress(y) >= 1 ? 1 : 0;
                    if (xDone !== yDone) return xDone - yDone;
                    // Priority
                    return PRI_WEIGHT[x.pri] - PRI_WEIGHT[y.pri];
                  });

                if (!catGoals.length) return null;
                const catAvg = getAverage(catGoals);
                const catPct = catAvg !== null ? Math.round(catAvg * 100) : 0;

                return (
                  <div key={c.id} className="flex flex-col gap-2">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 px-1 text-[11px] font-mono uppercase tracking-wider text-[#cfd1d8] font-semibold">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.c }} />
                      <span>{c.n}</span>
                      <span className="ml-auto text-[#8b8f9c]">{catPct}%</span>
                    </div>

                    {/* Goals Rows */}
                    <div className="flex flex-col gap-2">
                      {catGoals.map((g) => {
                        const progress = getGoalProgress(g);
                        const isDone = progress >= 1;
                        const subtasks = g.sub || [];
                        const subDoneCount = subtasks.filter((s) => s.d).length;

                        return (
                          <article
                            key={g.id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-[16px] border transition-all ${
                              isDone
                                ? "bg-[#141217]/70 border-emerald-900/30 opacity-75"
                                : "bg-[#16141a] border-[#2a262e] hover:border-[#ff7a59]/40 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Pin Button */}
                              <button
                                type="button"
                                onClick={() => handleTogglePin(g.id)}
                                className={`p-1 transition cursor-pointer text-[14px] ${
                                  g.p ? "text-[#ffb547]" : "text-[#6f7382] hover:text-white"
                                }`}
                                title={g.p ? (isEn ? "Unpin" : "Entpinnen") : (isEn ? "Pin" : "Anheften")}
                              >
                                ★
                              </button>

                              {/* Control: Checkbox vs Counter */}
                              {g.type === "n" ? (
                                <div className="flex items-center gap-1.5 font-mono text-[12px] bg-black/40 border border-white/10 rounded-[10px] p-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrement(g.id)}
                                    className="w-6 h-6 rounded-[6px] hover:bg-white/10 flex items-center justify-center cursor-pointer transition text-[#9a94a0] hover:text-white"
                                    aria-label="Weniger"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-1.5 font-bold text-white min-w-[36px] text-center">
                                    {fmt(g.val)}/{fmt(g.target)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrement(g.id)}
                                    className="w-6 h-6 rounded-[6px] hover:bg-white/10 flex items-center justify-center cursor-pointer transition text-[#9a94a0] hover:text-white"
                                    aria-label="Mehr"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleCheck(g.id)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer border-2 ${
                                    isDone
                                      ? "bg-[#ff7a59] border-[#ff7a59] text-[#1a0d08]"
                                      : "border-[#403b47] hover:border-[#ff7a59] bg-transparent text-transparent"
                                  }`}
                                  aria-label={isEn ? "Check off" : "Abhaken"}
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              )}
                            </div>

                            {/* Center Content: Title, metadata, progress bar */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[14px] font-semibold leading-snug truncate ${
                                    isDone ? "line-through text-[#8b8f9c]" : "text-[#f4f0ea]"
                                  }`}
                                >
                                  {g.title}
                                </span>
                                {subtasks.length > 0 && (
                                  <span className="text-[11px] font-mono text-[#8b8f9c]">
                                    ({subDoneCount}/{subtasks.length})
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8b8f9c] mt-0.5 flex-wrap">
                                <span>{PRI_LABELS[g.pri][langKey]}</span>
                                {g.type === "n" && g.unit && <span>· {g.unit}</span>}
                                {g.rep && <span title="Wiederholt in jedem Zeitraum">· ↻</span>}
                                {g.note && <span className="truncate max-w-[200px]">· {g.note}</span>}
                              </div>

                              {/* Progress bar */}
                              <div className="h-1 rounded-full bg-white/10 overflow-hidden mt-2">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.round(progress * 100)}%`,
                                    backgroundColor: c.c,
                                  }}
                                />
                              </div>

                              {/* Subtasks (Teilschritte) */}
                              {subtasks.length > 0 && (
                                <div className="flex flex-col gap-1.5 mt-2.5 pl-1">
                                  {subtasks.map((st, sIdx) => (
                                    <div
                                      key={sIdx}
                                      onClick={() => handleToggleSubTask(g.id, sIdx)}
                                      className="flex items-center gap-2 text-[12px] text-[#cfd1d8] cursor-pointer hover:text-white transition"
                                    >
                                      <div
                                        className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition ${
                                          st.d
                                            ? "bg-[#ff7a59] border-[#ff7a59] text-[#1b1006]"
                                            : "border-white/20 bg-transparent text-transparent"
                                        }`}
                                      >
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      </div>
                                      <span className={st.d ? "line-through text-[#8b8f9c]" : ""}>
                                        {st.t}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right Actions: Discuss with Agent, Shift to next period, Edit, Delete */}
                            <div className="flex items-center gap-1 sm:ml-auto">
                              {onDiscussGoalWithAgent && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDiscussGoalWithAgent({
                                      title: g.title,
                                      per: g.per,
                                      subtasks: g.sub?.map((s) => s.t),
                                      id: g.id,
                                      target: g.target,
                                      unit: g.unit,
                                    })
                                  }
                                  className="p-1.5 rounded-[8px] text-[#ff7a59]/80 hover:text-white hover:bg-[#ff7a59]/20 transition cursor-pointer"
                                  title={
                                    isEn
                                      ? `Discuss this goal with ${currentAgentName}`
                                      : `Dieses Ziel mit ${currentAgentName} besprechen`
                                  }
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleShiftNext(g.id)}
                                className="p-1.5 rounded-[8px] text-[#8b8f9c] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                                title={isEn ? "Shift to next period" : "In nächsten Zeitraum verschieben"}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenSheet(g.id)}
                                className="p-1.5 rounded-[8px] text-[#8b8f9c] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                                title={isEn ? "Edit goal" : "Ziel bearbeiten"}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-[#141217] border border-[#242028] rounded-[22px] text-[#8b8f9c]">
                <Target className="w-12 h-12 stroke-[1.5] text-[#ff7a59]/60 mb-3" />
                <p className="text-[14px] text-[#cfd1d8] mb-1 font-medium">
                  {periodGoals.length
                    ? isEn
                      ? "No goals match your search filter."
                      : "Keine Ziele entsprechen deinen Suchfiltern."
                    : isEn
                    ? `Set your first goal for ${formatPeriodLabel(per, currentDate, langKey)}`
                    : `Lege dein erstes Ziel für ${formatPeriodLabel(per, currentDate, langKey)} an.`}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenSheet()}
                  className="mt-4 px-4 py-2 rounded-full bg-[#ff7a59] text-[#1a0d08] font-bold text-[13px] flex items-center gap-1.5 cursor-pointer transition shadow-md hover:bg-[#ff8f73] active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{isEn ? "Create Goal" : "Neues Ziel anlegen"}</span>
                </button>
              </div>
            )}
          </section>
        </div>

        {/* SLIDE-OUT / MODAL EDITOR SHEET */}
        {isSheetOpen && (
          <div
            className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsSheetOpen(false)}
          >
            <div
              className="w-full max-w-[440px] max-h-[90vh] bg-[#16131b] border border-[#2e2936] rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-scaleUp text-[#f4f0ea]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#282430]">
                <span className="font-mono text-[13px] font-bold text-white">
                  {editingId
                    ? isEn
                      ? "Edit Goal"
                      : "Ziel bearbeiten"
                    : isEn
                    ? "New Goal"
                    : "Neues Ziel"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  className="p-1 rounded-lg text-[#8b8f9c] hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet Form */}
              <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-3 text-[12px] font-mono">
                <label className="flex flex-col gap-1">
                  <span className="text-[#8b8f9c]">{isEn ? "Title" : "Titel"}</span>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={isEn ? "e.g. 30 minutes reading" : "z. B. 30 Minuten lesen"}
                    maxLength={80}
                    autoFocus
                    className="w-full bg-[#0b0d14] border border-[#2a262e] focus:border-[#ff7a59] rounded-[10px] p-2.5 text-white outline-none font-sans text-[14px]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1">
                    <span className="text-[#8b8f9c]">{isEn ? "Period" : "Zeitraum"}</span>
                    <select
                      value={formPer}
                      onChange={(e) => setFormPer(e.target.value as PeriodType)}
                      className="w-full bg-[#0b0d14] border border-[#2a262e] rounded-[10px] p-2.5 text-white outline-none"
                    >
                      {(Object.keys(PERIOD_LABELS) as PeriodType[]).map((p) => (
                        <option key={p} value={p}>
                          {PERIOD_LABELS[p][langKey]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[#8b8f9c]">{isEn ? "Category" : "Kategorie"}</span>
                    <select
                      value={formCat}
                      onChange={(e) => setFormCat(e.target.value)}
                      className="w-full bg-[#0b0d14] border border-[#2a262e] rounded-[10px] p-2.5 text-white outline-none"
                    >
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1">
                    <span className="text-[#8b8f9c]">{isEn ? "Type" : "Typ"}</span>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as GoalType)}
                      className="w-full bg-[#0b0d14] border border-[#2a262e] rounded-[10px] p-2.5 text-white outline-none"
                    >
                      <option value="c">{isEn ? "Checkbox" : "Abhaken"}</option>
                      <option value="n">{isEn ? "Counter" : "Zähler"}</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[#8b8f9c]">{isEn ? "Priority" : "Priorität"}</span>
                    <select
                      value={formPri}
                      onChange={(e) => setFormPri(e.target.value as PriorityType)}
                      className="w-full bg-[#0b0d14] border border-[#2a262e] rounded-[10px] p-2.5 text-white outline-none"
                    >
                      <option value="h">{isEn ? "High" : "Hoch"}</option>
                      <option value="m">{isEn ? "Medium" : "Mittel"}</option>
                      <option value="l">{isEn ? "Low" : "Niedrig"}</option>
                    </select>
                  </label>
                </div>

                {/* Counter specific row */}
                {formType === "n" && (
                  <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-[12px] border border-white/5">
                    <label className="flex flex-col gap-1">
                      <span className="text-[#8b8f9c]">{isEn ? "Target" : "Ziel"}</span>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={formTarget}
                        onChange={(e) => setFormTarget(Number(e.target.value))}
                        className="bg-[#0b0d14] border border-[#2a262e] rounded-[8px] p-2 text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[#8b8f9c]">{isEn ? "Unit" : "Einheit"}</span>
                      <input
                        type="text"
                        placeholder={isEn ? "Pages, Liters..." : "Seiten, Liter..."}
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        className="bg-[#0b0d14] border border-[#2a262e] rounded-[8px] p-2 text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[#8b8f9c]">{isEn ? "Step" : "Schritt"}</span>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={formStep}
                        onChange={(e) => setFormStep(Number(e.target.value))}
                        className="bg-[#0b0d14] border border-[#2a262e] rounded-[8px] p-2 text-white outline-none"
                      />
                    </label>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={formRep}
                    onChange={(e) => setFormRep(e.target.checked)}
                    className="w-4 h-4 accent-[#ff7a59] rounded"
                  />
                  <span className="text-[#cfd1d8]">
                    {isEn
                      ? "Rollover to next period automatically (repeat)"
                      : "In jeden neuen Zeitraum übernehmen (wiederholen)"}
                  </span>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[#8b8f9c]">{isEn ? "Note" : "Notiz"}</span>
                  <textarea
                    rows={2}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder={isEn ? "Optional notes or details..." : "Optionale Notizen..."}
                    className="w-full bg-[#0b0d14] border border-[#2a262e] rounded-[10px] p-2.5 text-white outline-none font-sans text-[13px]"
                  />
                </label>

                {/* Subtasks (Teilschritte) */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[#8b8f9c]">{isEn ? "Sub-steps" : "Teilschritte"}</span>
                  <div className="flex flex-col gap-1">
                    {formSub.map((st, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 bg-black/40 border border-white/5 rounded-[8px] px-2.5 py-1.5"
                      >
                        <span className={st.d ? "line-through text-[#8b8f9c]" : "text-white"}>
                          {st.t}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormSub((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-[#8b8f9c] hover:text-rose-400 p-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={newSubText}
                      onChange={(e) => setNewSubText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubTask();
                        }
                      }}
                      placeholder={isEn ? "Add sub-step, press Enter" : "Teilschritt hinzufügen, Enter"}
                      className="flex-1 bg-[#0b0d14] border border-[#2a262e] rounded-[8px] px-2.5 py-1.5 text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubTask}
                      className="px-3 py-1.5 rounded-[8px] bg-white/[0.08] hover:bg-white/[0.14] text-white cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {onDiscussGoalWithAgent && formTitle.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        onDiscussGoalWithAgent({
                          title: formTitle.trim(),
                          per: formPer,
                          subtasks: formSub.map((s) => s.t),
                        });
                        setIsSheetOpen(false);
                      }}
                      className="mt-1 py-1.5 px-3 rounded-[9px] bg-[#ff7a59]/15 hover:bg-[#ff7a59]/25 border border-[#ff7a59]/30 text-[#ffb547] text-[11px] font-mono flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ff7a59]" />
                      <span>
                        {isEn
                          ? `Brainstorm sub-steps with ${currentAgentName}`
                          : `Teilschritte mit ${currentAgentName} erarbeiten`}
                      </span>
                    </button>
                  )}
                </div>

                {/* Categories Management in Sheet */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#282430]">
                  <span className="text-[#8b8f9c]">{isEn ? "Manage Categories" : "Eigene Kategorien"}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cats.map((c) => (
                      <span
                        key={c.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 text-[11px] bg-black/30"
                        style={{ borderColor: c.c }}
                      >
                        <span>{c.n}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id)}
                          className="hover:text-rose-400 cursor-pointer ml-0.5"
                          title="Löschen"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder={isEn ? "New category name" : "Neue Kategorie"}
                      className="flex-1 bg-[#0b0d14] border border-[#2a262e] rounded-[8px] p-2 text-white outline-none"
                    />
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-[8px] bg-transparent border border-[#2a262e] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-2 rounded-[8px] bg-white/[0.08] hover:bg-white/[0.14] text-white cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Sheet Action Buttons */}
              <div className="flex items-center gap-2.5 p-4 border-t border-[#282430] bg-[#121015]">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleDeleteGoal}
                    className="py-2.5 px-4 rounded-[11px] border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold cursor-pointer transition"
                  >
                    {isEn ? "Delete" : "Löschen"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-[11px] border border-[#2a262e] hover:bg-white/[0.06] text-[#f4f0ea] font-medium cursor-pointer transition text-center"
                >
                  {isEn ? "Cancel" : "Abbrechen"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  className="flex-1 py-2.5 px-4 rounded-[11px] bg-[#ff7a59] hover:bg-[#ff8f73] text-[#1a0d08] font-bold cursor-pointer transition text-center shadow-[0_2px_12px_rgba(255,122,89,0.3)]"
                >
                  {isEn ? "Save Goal" : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST POPUP */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-[#111] font-medium px-4 py-2 rounded-full shadow-2xl animate-fade-in font-sans text-[13px] flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-4 h-4 text-[#ff7a59]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
