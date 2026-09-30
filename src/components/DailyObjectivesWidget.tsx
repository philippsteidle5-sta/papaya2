import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  Flame,
  Trophy,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  Share2,
  Check,
  X,
  Bot,
  Layers,
  ChevronRight,
  Calendar,
  Filter,
  CheckCheck,
  Award,
  ListTodo,
  TrendingUp,
  Code,
  Brain,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { DraggableResizableWidget } from "./DraggableResizableWidget";
import { Language } from "../utils/translations";
import { getCurrentUserEmail, isSuperAdminEmail, isStoredAdminAuthenticated } from "../utils/leadDatabase";
import { useTheme } from "../utils/themeStore";

export type ObjectiveCategory =
  | "deep_work"
  | "strategy"
  | "content"
  | "admin"
  | "growth"
  | "coding"
  | "mindset";

export type ObjectivePriority =
  | "core_1"
  | "core_2"
  | "core_3"
  | "high"
  | "medium"
  | "quick_win";

export interface DailyObjectiveItem {
  id: string;
  title: string;
  category: ObjectiveCategory;
  priority: ObjectivePriority;
  priorityLabel?: string;
  completed: boolean;
  completedAt?: string;
  assignedAgentId?: string;
  estimatedMinutes?: number;
  createdAt?: string;
}

export interface DailyObjectivesData {
  date: string; // YYYY-MM-DD
  streakDays: number;
  objectives: DailyObjectiveItem[];
  notes?: string;
}

interface DailyObjectivesWidgetProps {
  userEmail?: string;
  agentColor?: string;
  isEditMode?: boolean;
  onClose?: () => void;
  onSendGoalToAgent?: (goalText: string, agentId?: string) => void;
  lang?: Language;
  standalone?: boolean;
}

export function getObjectivesStorageKey(userEmail?: string): string {
  const clean = (userEmail || getCurrentUserEmail() || "guest").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `syntax_daily_objectives_v3_${clean}`;
}

export function loadObjectivesForAccount(email: string, isEn: boolean, todayStr: string): DailyObjectivesData {
  try {
    // 1. First priority: Check universal live current key
    const liveCurrent = localStorage.getItem("syntax_daily_objectives_current");
    if (liveCurrent) {
      const parsed = JSON.parse(liveCurrent);
      if (parsed && Array.isArray(parsed.objectives) && parsed.objectives.length > 0) {
        return parsed;
      }
    }

    // 2. Second priority: Check user-specific key
    const storageKey = getObjectivesStorageKey(email);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.objectives) && parsed.objectives.length > 0) {
        return parsed;
      }
    }

    // 3. Third priority: Check guest key if different
    const guestStored = localStorage.getItem("syntax_daily_objectives_v3_guest");
    if (guestStored) {
      const parsed = JSON.parse(guestStored);
      if (parsed && Array.isArray(parsed.objectives) && parsed.objectives.length > 0) {
        return parsed;
      }
    }

    // 4. Fourth priority: Scan all localStorage keys for any valid objectives
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("syntax_daily_objectives_v3_") || key === "syntax_daily_objectives_v2")) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed && Array.isArray(parsed.objectives) && parsed.objectives.length > 0) {
              return parsed;
            }
          } catch {}
        }
      }
    }
  } catch (e) {
    console.warn("Could not load account daily objectives", e);
  }

  // Account specific default objectives fallback
  const isAdmin = isSuperAdminEmail(email) && isStoredAdminAuthenticated();
  if (isAdmin) {
    return {
      date: todayStr,
      streakDays: 4,
      objectives: [
        {
          id: "1",
          title: isEn ? "Superadmin Root Fleet Orchestration & Core Balance" : "Superadmin Root Flotten-Orchestrierung & Cores auditieren",
          category: "strategy",
          priority: "core_1",
          completed: false,
          estimatedMinutes: 60,
          assignedAgentId: "neo",
        },
        {
          id: "2",
          title: isEn ? "Review 256-bit Quantum Token security protocols" : "256-Bit Quantum Token Sicherheitsprotokolle validieren",
          category: "coding",
          priority: "core_2",
          completed: false,
          estimatedMinutes: 45,
          assignedAgentId: "odin",
        },
        {
          id: "3",
          title: isEn ? "Calibrate Veo 3.1 Neural Generator matrix pipeline" : "Veo 3.1 Neural Generator Matrix-Pipeline kalibrieren",
          category: "content",
          priority: "core_3",
          completed: false,
          estimatedMinutes: 30,
          assignedAgentId: "pulse",
        },
      ],
    };
  }

  return {
    date: todayStr,
    streakDays: 1,
    objectives: [
      {
        id: "1",
        title: isEn ? "Explore Sovereign 8-Core AI capabilities & chat with SYNTAX" : "Sovereign 8-Core KI-Funktionen testen & Chat mit SYNTAX starten",
        category: "deep_work",
        priority: "core_1",
        completed: false,
        estimatedMinutes: 30,
        assignedAgentId: "syntax",
      },
      {
        id: "2",
        title: isEn ? "Generate first high-impact strategy roadmap with N.E.O." : "Erste High-Impact Strategie-Roadmap mit N.E.O. erstellen",
        category: "strategy",
        priority: "core_2",
        completed: false,
        estimatedMinutes: 45,
        assignedAgentId: "neo",
      },
      {
        id: "3",
        title: isEn ? "Analyze business data or write code with V.E.G.A." : "Unternehmensdaten analysieren oder Code schreiben mit V.E.G.A.",
        category: "coding",
        priority: "core_3",
        completed: false,
        estimatedMinutes: 30,
        assignedAgentId: "vega",
      },
    ],
  };
}

export function getDailyObjectivesFormattedSummary(email?: string, isEn: boolean = false, onlyTitles: boolean = false): {
  total: number;
  completed: number;
  streak: number;
  objectives: DailyObjectiveItem[];
  summaryText: string;
} {
  const todayStr = new Date().toISOString().split("T")[0];
  const userEmail = email || getCurrentUserEmail() || "guest";
  const data = loadObjectivesForAccount(userEmail, isEn, todayStr);
  const total = data.objectives.length;
  const completed = data.objectives.filter((o) => o.completed).length;
  const streak = data.streakDays || 1;

  let summaryText = "";
  if (total === 0) {
    summaryText = isEn
      ? `You currently have no daily objectives configured for today. I can open the Daily Objectives panel for you so you can set your priorities!`
      : `Du hast für heute noch keine Tagesziele eingetragen. Ich habe dein Tagesziele-Board geöffnet, damit du deine Prioritäten erfassen kannst!`;
  } else if (onlyTitles) {
    const pureList = data.objectives
      .map((o, idx) => `${idx + 1}. ${o.title}`)
      .join("\n");
    summaryText = isEn
      ? `Hier sind deine aktuellen Ziele für heute, Boss:\n\n${pureList}`
      : `Hier sind deine aktuellen Ziele für heute, Boss:\n\n${pureList}`;
  } else {
    const list = data.objectives
      .map((o, idx) => {
        const statusIcon = o.completed ? "✓ [ERLEDIGT]" : "○ [OFFEN]";
        const timeStr = o.estimatedMinutes ? ` (~${o.estimatedMinutes} Min)` : "";
        const agentStr = o.assignedAgentId ? ` [Zugewiesen: ${o.assignedAgentId.toUpperCase()}]` : "";
        return `${idx + 1}. ${statusIcon} ${o.title}${timeStr}${agentStr}`;
      })
      .join("\n");

    summaryText = isEn
      ? `Here are your Daily Objectives for today (Active Streak: ${streak} days | Completed: ${completed}/${total}):\n\n${list}`
      : `Hier sind deine aktuellen Tagesziele für heute (Aktiver Streak: ${streak} Tage | Erledigt: ${completed}/${total}):\n\n${list}`;
  }

  return {
    total,
    completed,
    streak,
    objectives: data.objectives,
    summaryText,
  };
}

const CATEGORY_META: Record<
  ObjectiveCategory,
  { bg: string; border: string; text: string; labelEn: string; labelDe: string; icon: string }
> = {
  deep_work: { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-300", labelEn: "Deep Work", labelDe: "Deep Work", icon: "🧠" },
  coding: { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-300", labelEn: "Coding & Dev", labelDe: "Code & Dev", icon: "💻" },
  strategy: { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-300", labelEn: "Strategy", labelDe: "Strategie", icon: "♟️" },
  growth: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", labelEn: "Growth & Sales", labelDe: "Wachstum & Sales", icon: "🚀" },
  content: { bg: "bg-pink-500/15", border: "border-pink-500/30", text: "text-pink-300", labelEn: "Content & Media", labelDe: "Content & Video", icon: "🎬" },
  admin: { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-300", labelEn: "Operations", labelDe: "Operations", icon: "⚙️" },
  mindset: { bg: "bg-indigo-500/15", border: "border-indigo-500/30", text: "text-indigo-300", labelEn: "Mindset & Health", labelDe: "Mindset & Fokus", icon: "⚡" },
};

const PRIORITY_META: Record<
  ObjectivePriority,
  { labelEn: string; labelDe: string; badgeClass: string; isCore: boolean }
> = {
  core_1: { labelEn: "CORE #1 • MUST-WIN", labelDe: "KERN #1 • MUST-WIN", badgeClass: "bg-red-500/20 text-red-300 border-red-500/40", isCore: true },
  core_2: { labelEn: "CORE #2 • KEY DELIVERABLE", labelDe: "KERN #2 • WICHTIGES ZIEL", badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40", isCore: true },
  core_3: { labelEn: "CORE #3 • MOMENTUM WIN", labelDe: "KERN #3 • MOMENTUM GEWINN", badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", isCore: true },
  high: { labelEn: "HIGH PRIORITY", labelDe: "HOHE PRIORITÄT", badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40", isCore: false },
  medium: { labelEn: "STRATEGIC GOAL", labelDe: "STRATEGISCH", badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40", isCore: false },
  quick_win: { labelEn: "QUICK WIN (<30M)", labelDe: "QUICK WIN (<30M)", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", isCore: false },
};

const PRESET_TEMPLATES = [
  {
    nameEn: "🚀 High Growth & Scale Fleet",
    nameDe: "🚀 High Growth & Flottenskalierung",
    goals: [
      { title: "Close 3 high-ticket client proposals", category: "growth" as const, priority: "core_1" as const, mins: 90, agent: "neo" },
      { title: "Optimize funnel conversion & landing page hooks", category: "strategy" as const, priority: "core_2" as const, mins: 60, agent: "pulse" },
      { title: "Publish 2 viral Veo 3.1 video reels", category: "content" as const, priority: "core_3" as const, mins: 45, agent: "pulse" },
      { title: "Follow up with 10 qualified VIP leads in CRM", category: "growth" as const, priority: "high" as const, mins: 30, agent: "chronos" },
      { title: "Automate outbound email sequences with Gemini", category: "coding" as const, priority: "quick_win" as const, mins: 25, agent: "vega" },
    ],
  },
  {
    nameEn: "⚡ 10x Sovereign Full-Stack Dev",
    nameDe: "⚡ 10x Sovereign Full-Stack Coder",
    goals: [
      { title: "Implement core backend API & test edge cases", category: "coding" as const, priority: "core_1" as const, mins: 120, agent: "vega" },
      { title: "Refactor spatial VisionOS UI components & animation loops", category: "deep_work" as const, priority: "core_2" as const, mins: 60, agent: "syntax" },
      { title: "Execute security audit & 256-bit quantum token test", category: "admin" as const, priority: "core_3" as const, mins: 30, agent: "odin" },
      { title: "Setup automated Docker CI/CD Cloud Run pipeline", category: "coding" as const, priority: "high" as const, mins: 45, agent: "vega" },
      { title: "Code review PRs & optimize React re-renders", category: "coding" as const, priority: "quick_win" as const, mins: 20, agent: "vega" },
    ],
  },
  {
    nameEn: "🎯 Executive Focus & Revenue Sprint",
    nameDe: "🎯 Executive Tagesfokus & Umsatz-Sprint",
    goals: [
      { title: "Review weekly team milestones & unblock revenue bottlenecks", category: "strategy" as const, priority: "core_1" as const, mins: 45, agent: "syntax" },
      { title: "Finish quarterly financial modeling & burn rate calculation", category: "growth" as const, priority: "core_2" as const, mins: 60, agent: "oracle" },
      { title: "Zero inbox & key stakeholder alignment call", category: "admin" as const, priority: "core_3" as const, mins: 30, agent: "chronos" },
      { title: "Strategic planning for next product launch phase", category: "strategy" as const, priority: "high" as const, mins: 40, agent: "syntax" },
      { title: "Meditate 15m & evening shutdown routine", category: "mindset" as const, priority: "quick_win" as const, mins: 15, agent: "syntax" },
    ],
  },
  {
    nameEn: "🧠 Deep Work Flow Master",
    nameDe: "🧠 Deep Work Flow Sprint (Fokus Pur)",
    goals: [
      { title: "90-Minuten ungestörter Deep Work Block ohne Handy", category: "deep_work" as const, priority: "core_1" as const, mins: 90, agent: "syntax" },
      { title: "Komplexe Architektur-Spezifikation für KI-Flotte finalisieren", category: "deep_work" as const, priority: "core_2" as const, mins: 60, agent: "vega" },
      { title: "Wichtigstes Verkaufsdokument / Pitch Deck fertigstellen", category: "strategy" as const, priority: "core_3" as const, mins: 45, agent: "neo" },
      { title: "Lernsession: Neueste KI-Modelle & Agentic Frameworks analysieren", category: "deep_work" as const, priority: "medium" as const, mins: 30, agent: "oracle" },
    ],
  },
];

function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * High-tech Synthesizer sound generator for completing objectives
 */
function playQuantumCompletionSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play dual futuristic harmonious chime
    const now = ctx.currentTime;
    
    // Osc 1: Crystal bell
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6
    
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Osc 2: Sub shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1318.51, now + 0.05); // E6
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.22); // G6
    gain2.gain.setValueAtTime(0.08, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.5);
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

export const DailyObjectivesWidget: React.FC<DailyObjectivesWidgetProps> = ({
  userEmail,
  agentColor = "#00f0ff",
  isEditMode = false,
  onClose,
  onSendGoalToAgent,
  lang = "de",
  standalone = true,
}) => {
  const { isModern } = useTheme();
  const isEn = lang === "en";
  const todayStr = useMemo(() => getTodayDateStr(), []);

  const [activeAccountEmail, setActiveAccountEmail] = useState<string>(() => {
    return (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
  });

  // State initialization keyed strictly to active user account
  const [data, setData] = useState<DailyObjectivesData>(() => {
    const email = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
    return loadObjectivesForAccount(email, isEn, todayStr);
  });

  // Re-sync instantly when account switches (e.g. login, logout, user switch)
  useEffect(() => {
    const handleAccountSync = () => {
      const freshEmail = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
      setActiveAccountEmail(freshEmail);
      setData(loadObjectivesForAccount(freshEmail, isEn, todayStr));
    };

    window.addEventListener("syntax_auth_state_change", handleAccountSync);
    window.addEventListener("syntax_daily_usage_updated", handleAccountSync);
    window.addEventListener("storage", handleAccountSync);

    return () => {
      window.removeEventListener("syntax_auth_state_change", handleAccountSync);
      window.removeEventListener("syntax_daily_usage_updated", handleAccountSync);
      window.removeEventListener("storage", handleAccountSync);
    };
  }, [userEmail, isEn, todayStr]);

  useEffect(() => {
    const freshEmail = (userEmail || getCurrentUserEmail() || "").trim().toLowerCase();
    if (freshEmail !== activeAccountEmail) {
      setActiveAccountEmail(freshEmail);
      setData(loadObjectivesForAccount(freshEmail, isEn, todayStr));
    }
  }, [userEmail, activeAccountEmail, isEn, todayStr]);

  // UI state
  const [newGoalInput, setNewGoalInput] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<ObjectiveCategory>("deep_work");
  const [newGoalPriority, setNewGoalPriority] = useState<ObjectivePriority>("high");
  const [newGoalMins, setNewGoalMins] = useState<number>(45);
  const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<ObjectiveCategory>("deep_work");
  const [editPriority, setEditPriority] = useState<ObjectivePriority>("high");
  const [editMins, setEditMins] = useState<number>(45);

  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Floating celebration effect state
  const [recentCompletedId, setRecentCompletedId] = useState<string | null>(null);

  // Persistence to active user's dedicated key and universal current mirror
  useEffect(() => {
    try {
      const storageKey = getObjectivesStorageKey(activeAccountEmail);
      const dataStr = JSON.stringify(data);
      localStorage.setItem(storageKey, dataStr);
      localStorage.setItem("syntax_daily_objectives_current", dataStr);
      localStorage.setItem("syntax_daily_objectives_v3_guest", dataStr);
      window.dispatchEvent(new CustomEvent("syntax_daily_objectives_updated", { detail: data }));
    } catch (e) {
      console.warn("Could not save daily objectives", e);
    }
  }, [data, activeAccountEmail]);

  const activeObjectives = data.objectives.filter((o) => o.title.trim().length > 0);
  const totalCount = activeObjectives.length;
  const completedCount = activeObjectives.filter((o) => o.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered list
  const visibleObjectives = useMemo(() => {
    if (filterTab === "active") return data.objectives.filter((o) => !o.completed);
    if (filterTab === "completed") return data.objectives.filter((o) => o.completed);
    return data.objectives;
  }, [data.objectives, filterTab]);

  // Handle checking/ticking off an objective with cool animations!
  const handleToggleComplete = (id: string, event?: React.MouseEvent) => {
    const targetObj = data.objectives.find((o) => o.id === id);
    if (!targetObj || !targetObj.title.trim()) return;

    const willBeCompleted = !targetObj.completed;

    if (willBeCompleted) {
      // 1. Play sci-fi quantum chime
      playQuantumCompletionSound();

      // 2. Trigger particle burst from the click location
      const clientX = event ? event.clientX : window.innerWidth / 2;
      const clientY = event ? event.clientY : window.innerHeight / 2;
      const originX = Math.min(1, Math.max(0, clientX / window.innerWidth));
      const originY = Math.min(1, Math.max(0, clientY / window.innerHeight));

      confetti({
        particleCount: 40,
        spread: 65,
        origin: { x: originX, y: originY },
        colors: ["#10b981", "#34d399", "#00f0ff", "#6ee7b7", "#ffffff", "#f59e0b"],
        ticks: 180,
        gravity: 1.1,
        scalar: 0.9,
        shapes: ["circle", "square"],
      });

      // 3. Mark recent completed for floating XP animation
      setRecentCompletedId(id);
      setTimeout(() => {
        setRecentCompletedId((current) => (current === id ? null : current));
      }, 1500);
    }

    setData((prev) => {
      const nextObjectives = prev.objectives.map((o) => {
        if (o.id === id) {
          const nextState = !o.completed;
          return {
            ...o,
            completed: nextState,
            completedAt: nextState
              ? new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        }
        return o;
      });

      // Check if ALL goals are now completed!
      const activeObjs = nextObjectives.filter((o) => o.title.trim().length > 0);
      const allDone = activeObjs.length > 0 && activeObjs.every((o) => o.completed);

      if (allDone && willBeCompleted) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);

        // Huge victory confetti shower
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.6 },
            colors: ["#10b981", "#00f0ff", "#fbbf24", "#a855f7", "#ffffff"],
          });
        }, 200);
      }

      return { ...prev, objectives: nextObjectives };
    });
  };

  // Add new objective
  const handleAddNewGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGoalInput.trim()) return;

    // Determine default priority based on existing items
    const existingCores = data.objectives.filter((o) =>
      ["core_1", "core_2", "core_3"].includes(o.priority)
    );

    let assignedPriority = newGoalPriority;
    if (data.objectives.length === 0) assignedPriority = "core_1";
    else if (data.objectives.length === 1 && !existingCores.some((o) => o.priority === "core_2")) assignedPriority = "core_2";
    else if (data.objectives.length === 2 && !existingCores.some((o) => o.priority === "core_3")) assignedPriority = "core_3";

    const newObj: DailyObjectiveItem = {
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newGoalInput.trim(),
      category: newGoalCategory,
      priority: assignedPriority,
      completed: false,
      estimatedMinutes: newGoalMins,
      assignedAgentId:
        newGoalCategory === "coding"
          ? "vega"
          : newGoalCategory === "content"
          ? "pulse"
          : newGoalCategory === "growth"
          ? "neo"
          : "syntax",
      createdAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    };

    setData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, newObj],
    }));

    setNewGoalInput("");
    setIsQuickAddExpanded(false);
  };

  // Start editing an objective
  const handleStartEdit = (obj: DailyObjectiveItem) => {
    setEditingId(obj.id);
    setEditText(obj.title);
    setEditCategory(obj.category);
    setEditPriority(obj.priority);
    setEditMins(obj.estimatedMinutes || 45);
  };

  // Save edited objective
  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) {
      // Remove if empty
      handleDeleteGoal(id);
    } else {
      setData((prev) => ({
        ...prev,
        objectives: prev.objectives.map((o) =>
          o.id === id
            ? {
                ...o,
                title: editText.trim(),
                category: editCategory,
                priority: editPriority,
                estimatedMinutes: editMins,
              }
            : o
        ),
      }));
    }
    setEditingId(null);
  };

  // Delete objective
  const handleDeleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((o) => o.id !== id),
    }));
    if (editingId === id) setEditingId(null);
  };

  // Apply a preset pack
  const handleApplyPreset = (preset: (typeof PRESET_TEMPLATES)[0]) => {
    setData((prev) => ({
      ...prev,
      objectives: preset.goals.map((g, idx) => ({
        id: `preset_${Date.now()}_${idx}`,
        title: g.title,
        category: g.category,
        priority: g.priority,
        completed: false,
        estimatedMinutes: g.mins,
        assignedAgentId: g.agent,
      })),
    }));
    setShowPresetMenu(false);
  };

  // Reset completion for today
  const handleResetForToday = () => {
    setData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((o) => ({ ...o, completed: false, completedAt: undefined })),
    }));
  };

  // Clear all goals
  const handleClearAllGoals = () => {
    if (window.confirm(isEn ? "Clear all daily objectives?" : "Alle Tagesziele löschen?")) {
      setData((prev) => ({ ...prev, objectives: [] }));
    }
  };

  // Content Layout
  const content = (
    <div className={`flex flex-col h-full font-sans select-none overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors duration-300 ${
      isModern
        ? "bg-[#0c0c10]/95 text-zinc-100 border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        : "bg-[#050914]/95 text-slate-100 border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.18)]"
    }`}>
      {/* Header Bar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isModern
          ? "border-zinc-800 bg-[#141419]/90"
          : "border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/50 to-slate-950/80"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isModern
              ? "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-sm"
              : "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
          }`}>
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                <span>{isEn ? "SOVEREIGN DAILY OBJECTIVES" : "TAGESZIELE // MULTI-ZIEL FOKUS"}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[9.5px] font-mono font-bold ${
                isModern
                  ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                  : "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
              }`}>
                {completedCount}/{totalCount} {isEn ? "DONE" : "ERLEDIGT"}
              </span>
            </div>
            <div className={`text-[10px] font-mono flex items-center gap-2 mt-0.5 ${
              isModern ? "text-zinc-400" : "text-slate-400"
            }`}>
              <span className="flex items-center gap-1">
                <Calendar className={`w-3 h-3 ${isModern ? "text-zinc-400" : "text-cyan-400/70"}`} />
                <span>{new Date().toLocaleDateString(isEn ? "en-US" : "de-DE", { weekday: "short", day: "numeric", month: "short" })}</span>
              </span>
              <span className={isModern ? "text-zinc-600" : "text-slate-600"}>•</span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                <span>{data.streakDays} {isEn ? "Day Streak" : "Tage Streak"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                isModern
                  ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white"
                  : "bg-slate-900/90 hover:bg-cyan-500/20 border-slate-700 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-200"
              }`}
              title={isEn ? "Load focus template presets" : "Fokus-Vorlagen laden"}
            >
              <Sparkles className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              <span className="hidden sm:inline">{isEn ? "Templates" : "Vorlagen"}</span>
            </button>

            {showPresetMenu && (
              <div className={`absolute right-0 top-8 w-72 border rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1 ${
                isModern
                  ? "bg-zinc-900 border-zinc-700 shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
                  : "bg-[#060b18] border-cyan-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
              }`}>
                <div className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1 border-b flex items-center justify-between ${
                  isModern ? "text-zinc-300 border-zinc-800" : "text-cyan-400 border-slate-800"
                }`}>
                  <span>{isEn ? "SELECT OBJECTIVE PRESET" : "ZIEL-VORLAGE WÄHLEN"}</span>
                  <Zap className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
                </div>
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition cursor-pointer flex items-center justify-between group border ${
                      isModern
                        ? "hover:bg-zinc-800 text-zinc-200 hover:text-white border-transparent hover:border-zinc-700"
                        : "hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-100 border-transparent hover:border-cyan-500/30"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{isEn ? preset.nameEn : preset.nameDe}</div>
                      <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                        {preset.goals.length} {isEn ? "Goals included" : "Ziele enthalten"}
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 transition group-hover:translate-x-0.5 ${
                      isModern ? "text-zinc-500 group-hover:text-zinc-200" : "text-slate-500 group-hover:text-cyan-300"
                    }`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleResetForToday}
            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
              isModern
                ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-400 hover:text-cyan-300"
            }`}
            title={isEn ? "Reset checkboxes for today" : "Häkchen für heute zurücksetzen"}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Quantum Focus Meter */}
      <div className={`px-4 py-2.5 border-b flex flex-col gap-1.5 ${
        isModern
          ? "bg-zinc-950/60 border-zinc-800/80"
          : "bg-slate-950/70 border-slate-800/80"
      }`}>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className={`flex items-center gap-1.5 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
            <span className={`w-2 h-2 rounded-full ${
              progressPercent === 100
                ? "bg-emerald-400"
                : isModern ? "bg-purple-500" : "bg-cyan-400"
            } animate-pulse`} />
            <span className="font-bold">{isEn ? "DAILY PROGRESS" : "TAGESZIELE-FORTSCHRITT"}</span>
          </span>
          <span className={`font-mono font-bold flex items-center gap-1.5 ${
            isModern ? "text-zinc-200" : "text-cyan-300"
          }`}>
            <span className="text-white">{completedCount}/{totalCount}</span>
            <span className={isModern ? "text-zinc-400" : "text-cyan-400"}>({progressPercent}%)</span>
            {progressPercent === 100 && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-bounce">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% COMPLETE!</span>
              </span>
            )}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full border overflow-hidden relative ${
          isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-900 border-slate-800"
        }`}>
          <motion.div
            className={`h-full ${
              isModern
                ? "bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-500"
                : "bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_15px_rgba(0,240,255,0.7)]"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Filter Tabs & Quick Add Bar */}
      <div className={`px-4 py-2 border-b flex items-center justify-between gap-2 ${
        isModern ? "bg-zinc-950/40 border-zinc-800/60" : "bg-slate-950/40 border-slate-800/60"
      }`}>
        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer border ${
              filterTab === "all"
                ? isModern
                  ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                  : "bg-cyan-500/20 border-cyan-400/60 text-cyan-300"
                : isModern
                ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isEn ? "All" : "Alle"} ({totalCount})
          </button>
          <button
            onClick={() => setFilterTab("active")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer border ${
              filterTab === "active"
                ? isModern
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-amber-500/20 border-amber-400/60 text-amber-300"
                : isModern
                ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isEn ? "Active" : "Offen"} ({data.objectives.filter((o) => !o.completed).length})
          </button>
          <button
            onClick={() => setFilterTab("completed")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer border ${
              filterTab === "completed"
                ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300"
                : isModern
                ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isEn ? "Done" : "Erledigt"} ({completedCount})
          </button>
        </div>

        {/* Quick Add Toggle */}
        <button
          onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)}
          className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-sm ${
            isModern
              ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/50 text-cyan-300 hover:text-white"
          }`}
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          <span>{isEn ? "New Goal" : "Neues Ziel"}</span>
        </button>
      </div>

      {/* Quick Add Expandable Panel */}
      <AnimatePresence>
        {isQuickAddExpanded && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleAddNewGoal}
            className={`overflow-hidden border-b px-4 py-3 space-y-2.5 ${
              isModern
                ? "bg-[#131318] border-zinc-800"
                : "bg-[#070e22] border-cyan-500/30"
            }`}
          >
            <div className={`flex items-center justify-between text-[10px] font-mono font-bold uppercase ${
              isModern ? "text-zinc-300" : "text-cyan-400"
            }`}>
              <span>{isEn ? "ADD NEW DAILY OBJECTIVE" : "NEUES TAGESZIEL HINZUFÜGEN"}</span>
              <button
                type="button"
                onClick={() => setIsQuickAddExpanded(false)}
                className={`cursor-pointer ${isModern ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-white"}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                placeholder={isEn ? "e.g. Finish client presentation or code feature..." : "z.B. Kundenpräsentation fertigstellen oder Code-Feature..."}
                autoFocus
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs text-white font-sans focus:outline-none ${
                  isModern
                    ? "bg-zinc-900 border border-zinc-800 placeholder-zinc-500 focus:border-purple-500"
                    : "bg-slate-950 border border-cyan-500/40 placeholder-slate-500 focus:border-cyan-300"
                }`}
              />
              <button
                type="submit"
                disabled={!newGoalInput.trim()}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black flex items-center gap-1 transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isModern
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md border border-purple-500"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isEn ? "Add" : "Erstellen"}</span>
              </button>
            </div>

            {/* Config selectors */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono">
              {/* Category Pills */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className={`mr-1 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>{isEn ? "Category:" : "Kategorie:"}</span>
                {(["deep_work", "coding", "growth", "strategy", "content", "admin"] as ObjectiveCategory[]).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewGoalCategory(cat)}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer border ${
                        newGoalCategory === cat
                          ? isModern
                            ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-bold"
                            : "bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold"
                          : isModern
                          ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{meta.icon} {isEn ? meta.labelEn : meta.labelDe}</span>
                    </button>
                  );
                })}
              </div>

              {/* Estimated Time */}
              <div className="flex items-center gap-1">
                <span className={isModern ? "text-zinc-400" : "text-slate-400"}>{isEn ? "Time:" : "Dauer:"}</span>
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setNewGoalMins(mins)}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer border ${
                      newGoalMins === mins
                        ? isModern
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold"
                          : "bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold"
                        : isModern
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Celebration Banner when 100% done */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 border-b border-emerald-400/50 flex items-center justify-between text-emerald-200 text-xs font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <div className="flex items-center gap-2 font-bold">
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{isEn ? "🏆 100% OBJECTIVES ACHIEVED! SOVEREIGN DAY COMPLETED!" : "🏆 100% ZIELE ERREICHT! SOVEREIGN FOKUS PERFEKT!"}</span>
            </div>
            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400/40">
              +100 XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Objectives List Canvas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar relative">
        {visibleObjectives.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-10 text-center space-y-2 ${
            isModern ? "text-zinc-500" : "text-slate-500"
          }`}>
            <ListTodo className={`w-8 h-8 ${isModern ? "text-zinc-600" : "text-slate-600"}`} />
            <p className="text-xs font-mono">
              {filterTab === "completed"
                ? isEn ? "No completed goals yet. Check off your first task!" : "Noch keine erledigten Ziele. Hake dein erstes Ziel ab!"
                : isEn ? "No daily objectives yet. Click '+ New Goal' to add your focuses." : "Noch keine Tagesziele. Klicke auf '+ Neues Ziel', um Ziele anzulegen."}
            </p>
            {filterTab !== "completed" && (
              <button
                onClick={() => setIsQuickAddExpanded(true)}
                className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                  isModern
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                    : "bg-cyan-500/20 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30"
                }`}
              >
                + {isEn ? "Add First Goal" : "Erstes Ziel anlegen"}
              </button>
            )}
          </div>
        ) : (
          visibleObjectives.map((objective) => {
            const isEditing = editingId === objective.id;
            const categoryMeta = CATEGORY_META[objective.category] || CATEGORY_META.deep_work;
            const priorityMeta = PRIORITY_META[objective.priority] || PRIORITY_META.high;
            const isRecent = recentCompletedId === objective.id;

            if (isEditing) {
              return (
                <div
                  key={objective.id}
                  className={`p-3.5 rounded-xl border animate-in fade-in space-y-3 ${
                    isModern
                      ? "bg-zinc-900 border-zinc-700 shadow-xl"
                      : "bg-slate-900/95 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  }`}
                >
                  <div className={`flex items-center justify-between text-[10px] font-mono font-bold ${
                    isModern ? "text-zinc-300" : "text-cyan-400"
                  }`}>
                    <span>{isEn ? "EDIT OBJECTIVE" : "ZIEL BEARBEITEN"}</span>
                    <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(objective.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className={`w-full px-3 py-2 rounded-lg text-sm text-white font-sans focus:outline-none ${
                      isModern
                        ? "bg-zinc-950 border border-zinc-700 focus:border-purple-500"
                        : "bg-slate-950 border border-cyan-500/40 focus:border-cyan-300"
                    }`}
                  />

                  {/* Priority & Category & Minutes controls */}
                  <div className={`space-y-2 pt-2 border-t ${isModern ? "border-zinc-800" : "border-slate-800"}`}>
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                      <span className={isModern ? "text-zinc-400" : "text-slate-400"}>{isEn ? "Priority:" : "Priorität:"}</span>
                      {(["core_1", "core_2", "core_3", "high", "medium", "quick_win"] as ObjectivePriority[]).map((pr) => {
                        const pMeta = PRIORITY_META[pr];
                        return (
                          <button
                            key={pr}
                            type="button"
                            onClick={() => setEditPriority(pr)}
                            className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                              editPriority === pr
                                ? isModern
                                  ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-bold"
                                  : "bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold"
                                : isModern
                                ? "bg-zinc-950 border-zinc-800 text-zinc-400"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            {isEn ? pMeta.labelEn : pMeta.labelDe}
                          </button>
                        );
                      })}
                    </div>

                    <div className={`flex items-center justify-between flex-wrap gap-2 pt-1 border-t ${
                      isModern ? "border-zinc-800" : "border-slate-800"
                    }`}>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(["deep_work", "coding", "growth", "strategy", "content", "admin"] as ObjectiveCategory[]).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditCategory(cat)}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono transition cursor-pointer border ${
                              editCategory === cat
                                ? isModern
                                  ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-bold"
                                  : "bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold"
                                : isModern
                                ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {isEn ? CATEGORY_META[cat].labelEn : CATEGORY_META[cat].labelDe}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleDeleteGoal(objective.id)}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-mono transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(objective.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer ${
                            isModern
                              ? "bg-purple-600 hover:bg-purple-500 text-white"
                              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{isEn ? "Save" : "Speichern"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                key={objective.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`group relative p-3 rounded-xl border transition-all duration-300 ${
                  objective.completed
                    ? isModern
                      ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                      : "bg-[#061412]/90 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                    : isModern
                    ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                    : "bg-[#070d1e]/90 border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.08)]"
                }`}
              >
                {/* Floating Floating +25 XP Pill Effect on Checkoff */}
                <AnimatePresence>
                  {isRecent && (
                    <motion.div
                      initial={{ opacity: 0, y: 0, scale: 0.7 }}
                      animate={{ opacity: 1, y: -24, scale: 1.1 }}
                      exit={{ opacity: 0, y: -36 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute right-4 top-0 z-30 pointer-events-none px-2.5 py-0.5 rounded-full bg-emerald-500 border border-emerald-300 text-slate-950 font-mono text-[10px] font-black shadow-[0_0_15px_#10b981] flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>+25 XP ERREICHT!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-start gap-3">
                  {/* Interactive Checkbox with Pulsing Glow */}
                  <button
                    onClick={(e) => handleToggleComplete(objective.id, e)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0 relative overflow-hidden active:scale-90 ${
                      objective.completed
                        ? "bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.7)]"
                        : isModern
                        ? "bg-zinc-950 border-zinc-700 hover:border-zinc-500 text-transparent hover:text-zinc-500"
                        : "bg-slate-950/80 border-slate-700 hover:border-cyan-400 text-transparent hover:text-cyan-400/40"
                    }`}
                    title={objective.completed ? (isEn ? "Mark incomplete" : "Als unerledigt markieren") : (isEn ? "Mark completed" : "Als erledigt abhaken")}
                  >
                    {objective.completed ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Check className="w-4 h-4 stroke-[3.5] text-slate-950" />
                      </motion.div>
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[2]" />
                    )}
                  </button>

                  {/* Objective Text & Details */}
                  <div className="flex-1 min-w-0 relative">
                    {/* Header Badges */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${priorityMeta.badgeClass}`}>
                        {isEn ? priorityMeta.labelEn : priorityMeta.labelDe}
                      </span>

                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${categoryMeta.bg} ${categoryMeta.border} ${categoryMeta.text}`}>
                        <span>{categoryMeta.icon}</span>
                        <span>{isEn ? categoryMeta.labelEn : categoryMeta.labelDe}</span>
                      </span>

                      {objective.completed && objective.completedAt && (
                        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 ml-auto font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{objective.completedAt}</span>
                        </span>
                      )}
                    </div>

                    {/* Objective Title with Laser Strike-Through Animation */}
                    <div className="relative inline-block w-full">
                      <p
                        onClick={() => handleStartEdit(objective)}
                        className={`text-sm font-sans cursor-pointer leading-snug transition-all duration-300 ${
                          objective.completed
                            ? "text-zinc-500 line-through decoration-emerald-400 decoration-[2.5px] font-normal"
                            : isModern
                            ? "text-zinc-100 font-medium hover:text-white"
                            : "text-slate-100 font-medium hover:text-cyan-200"
                        }`}
                        title={isEn ? "Click to edit" : "Klicken zum Bearbeiten"}
                      >
                        {objective.title}
                      </p>

                      {/* Animated Green Strike Line Overlay */}
                      {objective.completed && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="absolute top-1/2 left-0 h-[2.5px] bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 shadow-[0_0_10px_#10b981,0_0_20px_#10b981] rounded-full z-10 pointer-events-none -translate-y-1/2"
                        />
                      )}
                    </div>

                    {/* Metadata: Time & Dispatch to AI Agent */}
                    <div className={`flex items-center gap-3 mt-2 text-[10px] font-mono ${
                      isModern ? "text-zinc-400" : "text-slate-400"
                    }`}>
                      {objective.estimatedMinutes && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>~{objective.estimatedMinutes} Min</span>
                        </span>
                      )}

                      {/* Send to AI Agent */}
                      {onSendGoalToAgent && !objective.completed && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendGoalToAgent(
                              `Boss-Tagesziel (${priorityMeta.labelDe}): "${objective.title}". Bitte erstelle mir einen 3-Punkte-Aktionsplan, um dieses Ziel heute extrem effizient zu erreichen!`,
                              objective.assignedAgentId || "syntax"
                            );
                          }}
                          className={`flex items-center gap-1 cursor-pointer transition hover:underline ml-auto ${
                            isModern ? "text-purple-400 hover:text-purple-300" : "text-cyan-400 hover:text-cyan-200"
                          }`}
                          title={isEn ? "Dispatch goal to AI Agent for execution plan" : "Ziel an Agenten für Aktionsplan senden"}
                        >
                          <Bot className="w-3 h-3" />
                          <span>{isEn ? "Ask Agent" : "Mit Agent lösen"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150 flex-shrink-0">
                    <button
                      onClick={() => handleStartEdit(objective)}
                      className={`p-1 rounded-md cursor-pointer transition ${
                        isModern
                          ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          : "hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300"
                      }`}
                      title={isEn ? "Edit goal" : "Ziel bearbeiten"}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(objective.id)}
                      className="p-1 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer transition"
                      title={isEn ? "Delete goal" : "Ziel löschen"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Bar */}
      <div className={`px-4 py-2.5 border-t flex items-center justify-between text-[10px] font-mono ${
        isModern
          ? "border-zinc-800 bg-zinc-950/80 text-zinc-400"
          : "border-slate-800 bg-slate-950/80 text-slate-400"
      }`}>
        <span className={`flex items-center gap-1.5 ${isModern ? "text-zinc-300" : "text-cyan-300"}`}>
          <Zap className={`w-3 h-3 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
          <span>{isEn ? "Unlimited Multi-Goal Sovereign Engine" : "S.Y.N.T.A.X. Multi-Ziel Sovereign Engine"}</span>
        </span>
        <div className="flex items-center gap-2">
          {data.objectives.length > 0 && (
            <button
              onClick={handleClearAllGoals}
              className="text-zinc-500 hover:text-red-400 transition cursor-pointer text-[9px]"
              title="Alle Ziele löschen"
            >
              {isEn ? "Clear All" : "Alle löschen"}
            </button>
          )}
          <span className={isModern ? "text-zinc-600" : "text-slate-600"}>•</span>
          <span className={`font-bold ${isModern ? "text-zinc-300" : "text-slate-400"}`}>
            {totalCount} {isEn ? "Objectives" : "Ziele"}
          </span>
        </div>
      </div>
    </div>
  );

  if (standalone) {
    return (
      <DraggableResizableWidget
        id="dailyObjectives"
        title={isEn ? "DAILY OBJECTIVES // MULTI-GOAL QUANTUM FOCUS" : "TAGESZIELE // MULTI-ZIEL QUANTUM FOKUS"}
        initialX={typeof window !== "undefined" ? Math.max(20, window.innerWidth - 890) : 480}
        initialY={130}
        initialWidth={450}
        initialHeight={540}
        minWidth={360}
        minHeight={420}
        isEditMode={isEditMode}
        onClose={onClose}
        zIndex={36}
      >
        {content}
      </DraggableResizableWidget>
    );
  }

  return content;
};
