import React, { useState, useEffect, useRef, useMemo } from "react";
import { Language } from "../utils/translations";

interface ChronosCalendarWidgetProps {
  agentColor?: string;
  compact?: boolean;
  standalone?: boolean;
  isEditMode?: boolean;
  onClose?: () => void;
  onAddEventToChat?: (eventText: string) => void;
  lang?: Language;
}

export type CleanCategoryType = "meeting" | "privat" | "subscriptions" | "rechnungen" | "fokus";

export interface CleanCalendarItem {
  id: string;
  name: string;
  category: CleanCategoryType;
  date: string; // YYYY-MM-DD
  time?: string;
  amount?: number;
  repeat?: "monthly" | "yearly" | "weekly" | "none";
}

export const CATEGORY_METADATA: Record<CleanCategoryType, { label: string; color: string; dot: string }> = {
  meeting: { label: "Meeting", color: "text-[#a855f7]", dot: "#a855f7" },
  privat: { label: "Privat", color: "text-[#10b981]", dot: "#10b981" },
  subscriptions: { label: "Subscriptions", color: "text-[#6d6cf5]", dot: "#6d6cf5" },
  rechnungen: { label: "Rechnungen", color: "text-[#ef4444]", dot: "#ef4444" },
  fokus: { label: "Fokus", color: "text-[#f59e0b]", dot: "#f59e0b" },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const ChronosCalendarWidget: React.FC<ChronosCalendarWidgetProps> = ({
  agentColor = "#6d6cf5",
  compact = false,
  standalone = true,
  isEditMode = false,
  onClose,
  onAddEventToChat,
  lang = "de",
}) => {
  const isEn = lang === "en";
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Drag state for the clean card
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number; isDragging: boolean }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    isDragging: false,
  });

  // Active Category Filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | CleanCategoryType>("all");

  // Active Overlays
  const [activeOverlay, setActiveOverlay] = useState<"add" | "dayDetail" | "search" | "stats" | "export" | "upcoming" | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<CleanCategoryType>("meeting");
  const [formDate, setFormDate] = useState(selectedDateStr);
  const [formTime, setFormTime] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formRepeat, setFormRepeat] = useState<"monthly" | "yearly" | "weekly" | "none">("none");

  // Live Search Query
  const [liveQuery, setLiveQuery] = useState("");

  // Toast notification
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 2800);
  };

  // State: Clean items without hardcoded subscriptions
  const [items, setItems] = useState<CleanCalendarItem[]>(() => {
    try {
      const saved = localStorage.getItem("jarvis_chronos_clean_user_items_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not load calendar items", e);
    }
    // Starts completely clean as requested!
    return [];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("jarvis_chronos_clean_user_items_v2", JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save calendar items", e);
    }
  }, [items]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevStep = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(selectedDateStr);
      d.setDate(d.getDate() - 7);
      setSelectedDateStr(d.toISOString().split("T")[0]);
      setCurrentDate(d);
    }
  };

  const nextStep = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(selectedDateStr);
      d.setDate(d.getDate() + 7);
      setSelectedDateStr(d.toISOString().split("T")[0]);
      setCurrentDate(d);
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split("T")[0]);
    showToast(isEn ? "Jumped to Today" : "Zu Heute gesprungen");
  };

  // 1-Click Quick Start for selected date
  const handleQuickAdd = (category: CleanCategoryType) => {
    setFormDate(selectedDateStr);
    setFormCategory(category);
    setFormName("");
    setFormAmount("");
    setFormTime(category === "meeting" || category === "fokus" ? "10:00" : "");
    setFormRepeat(category === "subscriptions" ? "monthly" : category === "rechnungen" ? "monthly" : "none");
    setActiveOverlay("add");
  };

  // Add Item Handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDate) return;

    const newItem: CleanCalendarItem = {
      id: "clean-ev-" + Date.now(),
      name: formName.trim(),
      category: formCategory,
      date: formDate,
      time: formTime || undefined,
      amount: formAmount ? parseFloat(formAmount) : undefined,
      repeat: formRepeat,
    };

    setItems((prev) => [newItem, ...prev]);

    if (onAddEventToChat) {
      onAddEventToChat(
        isEn
          ? `📅 Added to Calendar: "${formName}" (${CATEGORY_METADATA[formCategory].label}) on ${formDate}`
          : `📅 Im Kalender erfasst: "${formName}" (${CATEGORY_METADATA[formCategory].label}) am ${formDate}`
      );
    }

    setFormName("");
    setFormAmount("");
    setFormTime("");
    setActiveOverlay(null);
    showToast(`✓ "${formName}" hinzugefügt`);
  };

  const handleDeleteItem = (id: string) => {
    const toDelete = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast(`"${toDelete?.name || 'Eintrag'}" gelöscht`);
  };

  // Export CSV / JSON
  const handleExport = (format: "csv" | "json") => {
    const todayStr = new Date().toISOString().split("T")[0];
    let dataStr = "";
    let filename = `calendar-export-${todayStr}`;

    if (format === "csv") {
      const headers = ["ID", "Name", "Category", "Date", "Time", "Amount", "Repeat"];
      const rows = items.map((e) => [
        `"${e.id}"`,
        `"${e.name}"`,
        `"${e.category}"`,
        `"${e.date}"`,
        `"${e.time || ''}"`,
        e.amount || 0,
        `"${e.repeat || 'none'}"`,
      ]);
      dataStr = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      filename += ".csv";
    } else {
      dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
      filename += ".json";
    }

    const a = document.createElement("a");
    a.href = dataStr;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setActiveOverlay(null);
    showToast(`Export als ${format.toUpperCase()} gestartet`);
  };

  // Calendar Math (Days Grid)
  const daysGridData = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    if (viewMode === "week") {
      const cur = new Date(selectedDateStr || todayStr);
      const dayOfWeek = (cur.getDay() + 6) % 7;
      const monday = new Date(cur);
      monday.setDate(cur.getDate() - dayOfWeek);

      const weekDays: Array<{
        date: number;
        dateStr: string;
        muted: boolean;
        dayItems: CleanCalendarItem[];
      }> = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dStr = d.toISOString().split("T")[0];
        let dayItems = items.filter((it) => it.date === dStr);
        if (activeCategoryFilter !== "all") {
          dayItems = dayItems.filter((it) => it.category === activeCategoryFilter);
        }

        weekDays.push({
          date: d.getDate(),
          dateStr: dStr,
          muted: d.getMonth() !== month,
          dayItems,
        });
      }

      return weekDays;
    }

    // MONTH VIEW
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const result: Array<{
      date: number;
      dateStr: string;
      muted: boolean;
      dayItems: CleanCalendarItem[];
    }> = [];

    // Leading prev month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 12 : month;
      const prevY = month === 0 ? year - 1 : year;
      const dStr = `${prevY}-${String(prevM).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({
        date: d,
        dateStr: dStr,
        muted: true,
        dayItems: [],
      });
    }

    // Current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      let dayItems = items.filter((it) => it.date === dStr);
      if (activeCategoryFilter !== "all") {
        dayItems = dayItems.filter((it) => it.category === activeCategoryFilter);
      }

      result.push({
        date: d,
        dateStr: dStr,
        muted: false,
        dayItems,
      });
    }

    // Trailing next month
    const totalCells = result.length <= 35 ? 35 : 42;
    const remaining = totalCells - result.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 1 : month + 2;
      const nextY = month === 11 ? year + 1 : year;
      const dStr = `${nextY}-${String(nextM).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({
        date: d,
        dateStr: dStr,
        muted: true,
        dayItems: [],
      });
    }

    return result;
  }, [year, month, items, viewMode, selectedDateStr, activeCategoryFilter]);

  // Selected Day Items
  const selectedDayItems = useMemo(() => {
    return items.filter((it) => it.date === selectedDateStr);
  }, [items, selectedDateStr]);

  // Monthly Financial Total
  const curMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthSpend = useMemo(() => {
    let sum = 0;
    items
      .filter((it) => it.date.startsWith(curMonthPrefix))
      .forEach((it) => {
        if (it.amount) sum += it.amount;
      });
    return sum;
  }, [items, curMonthPrefix]);

  // Upcoming 5 items
  const upcomingFive = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return [...items]
      .filter((it) => it.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [items]);

  // Live Search Results
  const liveSearchResults = useMemo(() => {
    if (!liveQuery.trim()) return [];
    const q = liveQuery.toLowerCase();
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        CATEGORY_METADATA[it.category].label.toLowerCase().includes(q) ||
        (it.amount && String(it.amount).includes(q))
    );
  }, [items, liveQuery]);

  // Stats calculation
  const statsSummary = useMemo(() => {
    const counts: Record<CleanCategoryType, number> = {
      meeting: 0,
      privat: 0,
      subscriptions: 0,
      rechnungen: 0,
      fokus: 0,
    };
    let totalExpenses = 0;

    items.forEach((it) => {
      counts[it.category] = (counts[it.category] || 0) + 1;
      if (it.amount) totalExpenses += it.amount;
    });

    return { counts, totalExpenses, totalCount: items.length };
  }, [items]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Drag handlers for the clean card
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking header background or title
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) {
      return;
    }
    const currentCard = (e.currentTarget as HTMLElement).closest(".calendar-card-root") as HTMLElement;
    if (!currentCard) return;

    const rect = currentCard.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: rect.left,
      posY: rect.top,
      isDragging: true,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 440, dragRef.current.posX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 300, dragRef.current.posY + dy)),
      });
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const calendarCard = (
    <div
      style={{
        ["--background" as any]: "#0a0a0b",
        ["--card" as any]: "#141416",
        ["--foreground" as any]: "#fafafa",
        ["--muted" as any]: "#232326",
        ["--muted-foreground" as any]: "#8b8b93",
        ["--border" as any]: "#2a2a2e",
        ["--input" as any]: "#3a3a40",
        ["--primary" as any]: "#6d6cf5",
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className="calendar-card-root relative w-full max-w-[27rem] p-5 rounded-[24px] border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] select-none transition-all"
    >
      {/* HEADER: DRAGGABLE HANDLE + MONTH + VIEW TOGGLE + ACTIONS */}
      <div 
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between gap-2 mb-3.5 flex-wrap cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-wrap">
          <h2 className="text-sm font-semibold whitespace-nowrap text-white">
            {MONTHS[month]}, {year}
          </h2>

          <button
            type="button"
            onClick={jumpToToday}
            className="border border-[#3a3a40] text-[#8b8b93] hover:text-white hover:border-[#6d6cf5] rounded-full px-2.5 py-0.5 text-[10px] whitespace-nowrap transition cursor-pointer"
          >
            Today
          </button>

          {/* View Toggle: Month / Week */}
          <div className="flex bg-[#232326] rounded-full p-0.5 border border-[#2a2a2e] text-[9px] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-2 py-0.5 rounded-full cursor-pointer transition ${
                viewMode === "month" ? "bg-[#6d6cf5] text-white shadow-sm" : "text-[#8b8b93] hover:text-white"
              }`}
            >
              MONAT
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-2 py-0.5 rounded-full cursor-pointer transition ${
                viewMode === "week" ? "bg-[#6d6cf5] text-white shadow-sm" : "text-[#8b8b93] hover:text-white"
              }`}
            >
              WOCHE
            </button>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Zurück"
              onClick={prevStep}
              className="text-[#8b8b93] hover:bg-[#232326] hover:text-white p-1 rounded-md transition cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              title="Vor"
              onClick={nextStep}
              className="text-[#8b8b93] hover:bg-[#232326] hover:text-white p-1 rounded-md transition cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Button */}
          <button
            type="button"
            className="bg-[#6d6cf5] text-white cursor-pointer h-7 w-11 rounded-full flex items-center justify-center shadow-[0_10px_15px_-3px_rgba(109,108,245,0.4)] hover:scale-105 active:scale-95 transition-transform"
            title="Eintrag hinzufügen (+)"
            onClick={() => {
              setFormDate(selectedDateStr);
              setActiveOverlay("add");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          </button>

          {/* Direct Close Button in Header */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#232326] hover:bg-red-500/20 text-[#8b8b93] hover:text-red-400 flex items-center justify-center transition cursor-pointer"
              title="Schließen"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* 5-CATEGORY FILTER BAR */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategoryFilter("all")}
          className={`px-2.5 py-1 rounded-full border transition cursor-pointer shrink-0 ${
            activeCategoryFilter === "all"
              ? "bg-white/15 text-white border-white/30 font-bold"
              : "bg-[#232326]/50 text-[#8b8b93] border-[#2a2a2e] hover:text-white"
          }`}
        >
          Alle
        </button>

        {(["meeting", "privat", "subscriptions", "rechnungen", "fokus"] as CleanCategoryType[]).map((catKey) => {
          const meta = CATEGORY_METADATA[catKey];
          const isActive = activeCategoryFilter === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setActiveCategoryFilter(isActive ? "all" : catKey)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition cursor-pointer shrink-0 ${
                isActive
                  ? "bg-white/15 text-white border-white/40 font-bold shadow-sm"
                  : "bg-[#232326]/40 text-[#8b8b93] border-[#2a2a2e] hover:text-white hover:border-[#3a3a40]"
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: meta.dot }}
              />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((wd) => (
          <div
            key={wd}
            className="bg-[#232326]/60 border border-[#2a2a2e] rounded-full py-1.5 text-center text-[9px] font-semibold tracking-wider text-[#8b8b93]"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* DAYS GRID */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysGridData.map((d, idx) => {
          const isSelected = d.dateStr === selectedDateStr;
          const isToday = d.dateStr === todayStr;

          return (
            <button
              key={`${d.dateStr}-${idx}`}
              type="button"
              onClick={() => {
                setSelectedDateStr(d.dateStr);
                setActiveOverlay("dayDetail");
              }}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border text-[11px] font-medium cursor-pointer transition-all duration-150 active:scale-95 ${
                d.muted
                  ? "bg-[#232326]/30 text-[#8b8b93]/50 border-[#2a2a2e]/60"
                  : "bg-[#232326]/60 text-white border-[#2a2a2e] hover:border-[#3a3a40]"
              } ${
                isSelected
                  ? "!border-[#6d6cf5]/80 !bg-[#6d6cf5]/15 shadow-[0_0_15px_rgba(109,108,245,0.3)]"
                  : ""
              }`}
            >
              {/* Category Indicator Dots */}
              {d.dayItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex gap-0.5 pointer-events-none">
                  {d.dayItems.slice(0, 3).map((item, dotIdx) => (
                    <span
                      key={dotIdx}
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ backgroundColor: CATEGORY_METADATA[item.category]?.dot || "#6d6cf5" }}
                    />
                  ))}
                </span>
              )}

              <span className={isToday ? "font-bold text-white" : ""}>{d.date}</span>
            </button>
          );
        })}
      </div>

      {/* 1-KLICK SCHNELLSTART LEISTE FÜR DAS GEWÄHLTE DATUM */}
      <div className="mt-3.5 p-2.5 rounded-2xl bg-[#1c1c20]/60 border border-[#2a2a2e] flex flex-col gap-1.5">
        <div className="text-[10px] text-[#8b8b93] font-mono flex items-center justify-between px-1">
          <span>1-Klick Schnellstart für das gewählte Datum:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {(["meeting", "privat", "subscriptions", "rechnungen", "fokus"] as CleanCategoryType[]).map((catKey) => {
            const meta = CATEGORY_METADATA[catKey];
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => handleQuickAdd(catKey)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#232326] hover:bg-[#2c2c31] border border-[#2a2a2e] text-[10px] text-[#fafafa] transition cursor-pointer hover:border-[#6d6cf5]"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
                <span>+ {meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-3.5 pt-3 border-t border-[#2a2a2e] flex items-center justify-between gap-2">
        <div className="flex gap-3 text-[#8b8b93]">
          {/* Live Search */}
          <button
            type="button"
            title="Live-Suche"
            onClick={() => setActiveOverlay("search")}
            className="bg-transparent border-none text-inherit hover:text-white cursor-pointer flex items-center transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </button>

          {/* Export (CSV / JSON) */}
          <button
            type="button"
            title="Export (CSV / JSON)"
            onClick={() => setActiveOverlay("export")}
            className="bg-transparent border-none text-inherit hover:text-[#6d6cf5] cursor-pointer flex items-center transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
          </button>

          {/* Stats & SVG Donut */}
          <button
            type="button"
            title="Kategorie-Statistik"
            onClick={() => setActiveOverlay("stats")}
            className="bg-transparent border-none text-inherit hover:text-white cursor-pointer flex items-center transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
          </button>

          {/* Upcoming 5 Drawer Trigger */}
          <button
            type="button"
            title="Nächste 5 Termine & Fälligkeiten"
            onClick={() => setActiveOverlay("upcoming")}
            className="bg-transparent border-none text-inherit hover:text-white cursor-pointer flex items-center transition relative"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {upcomingFive.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#6d6cf5] absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>

        <div className="text-[10px] font-medium text-[#8b8b93] whitespace-nowrap">
          ZAHLUNGEN :{" "}
          <span className="text-white text-xs font-bold ml-1">
            ${monthSpend.toFixed(2)}
          </span>
        </div>
      </div>

      {/* OVERLAY: ADD ENTRY FORM */}
      {activeOverlay === "add" && (
        <div className="absolute inset-0 z-50 bg-[#141416]/95 backdrop-blur-md rounded-[23px] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="absolute top-4 right-4 bg-transparent border-none text-[#8b8b93] hover:text-white cursor-pointer p-1"
            onClick={() => setActiveOverlay(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>

          <div
            className="w-11 h-11 rounded-full flex items-center justify-center mb-2.5"
            style={{ backgroundColor: `${CATEGORY_METADATA[formCategory].dot}20`, color: CATEGORY_METADATA[formCategory].dot }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          </div>

          <h3 className="text-sm font-bold text-white mb-0.5">
            Eintrag anlegen: {CATEGORY_METADATA[formCategory].label}
          </h3>
          <p className="text-[10px] text-[#8b8b93] text-center mb-3">
            Für den {formDate}
          </p>

          <form onSubmit={handleAddItem} className="flex flex-col gap-2 w-full">
            <input
              type="text"
              placeholder="Titel (z. B. Team Sync, Miete, Deep Work)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full border border-[#3a3a40] bg-transparent text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#6d6cf5]"
              autoFocus
              required
            />

            <div className="flex gap-2">
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as CleanCategoryType)}
                className="flex-1 border border-[#3a3a40] bg-[#141416] text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#6d6cf5]"
              >
                <option value="meeting">Meeting</option>
                <option value="privat">Privat</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="rechnungen">Rechnungen</option>
                <option value="fokus">Fokus</option>
              </select>

              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-32 border border-[#3a3a40] bg-transparent text-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#6d6cf5]"
                required
              />
            </div>

            <div className="flex gap-2">
              <input
                type="time"
                placeholder="Uhrzeit"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="flex-1 border border-[#3a3a40] bg-transparent text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#6d6cf5]"
              />

              <input
                type="number"
                step="0.01"
                placeholder="Betrag ($ / opt.)"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="flex-1 border border-[#3a3a40] bg-transparent text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#6d6cf5]"
              />
            </div>

            <select
              value={formRepeat}
              onChange={(e) => setFormRepeat(e.target.value as any)}
              className="w-full border border-[#3a3a40] bg-[#141416] text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#6d6cf5]"
            >
              <option value="none">Einmaliger Termin</option>
              <option value="monthly">Monatlich wiederkehrend</option>
              <option value="weekly">Wöchentlich</option>
              <option value="yearly">Jährlich</option>
            </select>

            <button
              type="submit"
              className="mt-1 w-full bg-[#6d6cf5] text-white border-none rounded-lg py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition"
            >
              Eintrag speichern
            </button>
          </form>
        </div>
      )}

      {/* OVERLAY: DAY DETAIL (CLICK ON DAY) */}
      {activeOverlay === "dayDetail" && (
        <div className="absolute inset-0 z-50 bg-[#141416]/95 backdrop-blur-md rounded-[23px] flex flex-col p-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="absolute top-4 right-4 bg-transparent border-none text-[#8b8b93] hover:text-white cursor-pointer p-1"
            onClick={() => setActiveOverlay(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>

          <div className="mb-3">
            <h3 className="text-sm font-bold text-white">
              Details für {selectedDateStr}
            </h3>
            <p className="text-[10px] text-[#8b8b93]">
              {selectedDayItems.length} Eintrag/Einträge an diesem Tag
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {selectedDayItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#8b8b93]">
                <p className="text-xs mb-1">Noch keine Termine an diesem Tag.</p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {(["meeting", "privat", "fokus"] as CleanCategoryType[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleQuickAdd(cat)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#232326] text-white hover:border-[#6d6cf5] border border-[#2a2a2e] cursor-pointer"
                    >
                      + {CATEGORY_METADATA[cat].label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              selectedDayItems.map((it) => {
                const meta = CATEGORY_METADATA[it.category];
                return (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#232326]/70 border border-[#2a2a2e] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: meta.dot }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{it.name}</div>
                        <div className="text-[10px] text-[#8b8b93]">
                          {meta.label} {it.time ? `· ${it.time}` : ""} {it.amount ? `· $${it.amount.toFixed(2)}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onAddEventToChat && (
                        <button
                          type="button"
                          onClick={() => onAddEventToChat(`Termin im Chat: ${it.name} am ${it.date}`)}
                          className="p-1 rounded text-[#8b8b93] hover:text-[#6d6cf5] cursor-pointer"
                          title="Im KI-Chat besprechen"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(it.id)}
                        className="p-1 rounded text-red-400 hover:bg-red-500/20 cursor-pointer"
                        title="Löschen"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setFormDate(selectedDateStr);
              setActiveOverlay("add");
            }}
            className="mt-3 w-full bg-[#232326] hover:bg-[#2c2c31] border border-[#2a2a2e] text-white py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            + Weiteren Eintrag anlegen
          </button>
        </div>
      )}

      {/* OVERLAY: LIVE SEARCH */}
      {activeOverlay === "search" && (
        <div className="absolute inset-0 z-50 bg-[#141416]/95 backdrop-blur-md rounded-[23px] flex flex-col p-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="absolute top-4 right-4 bg-transparent border-none text-[#8b8b93] hover:text-white cursor-pointer p-1"
            onClick={() => setActiveOverlay(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>

          <h3 className="text-sm font-bold text-white mb-2">Live-Suche & Filter</h3>
          <input
            type="text"
            placeholder="Name, Betrag oder Kategorie suchen..."
            value={liveQuery}
            onChange={(e) => setLiveQuery(e.target.value)}
            className="w-full border border-[#3a3a40] bg-transparent text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#6d6cf5]"
            autoFocus
          />

          <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-1">
            {liveSearchResults.length === 0 ? (
              <p className="text-[11px] text-[#8b8b93] text-center mt-6">
                {liveQuery ? "Keine Treffer gefunden" : "Suchbegriff eingeben..."}
              </p>
            ) : (
              liveSearchResults.map((it) => (
                <div
                  key={it.id}
                  onClick={() => {
                    setSelectedDateStr(it.date);
                    setActiveOverlay("dayDetail");
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#232326]/60 border border-[#2a2a2e] text-xs cursor-pointer hover:border-[#6d6cf5] transition"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_METADATA[it.category]?.dot }}
                    />
                    <span className="font-semibold text-white">{it.name}</span>
                  </div>
                  <span className="text-[10px] text-[#8b8b93]">
                    {it.date} {it.time ? `· ${it.time}` : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* OVERLAY: EXPORT */}
      {activeOverlay === "export" && (
        <div className="absolute inset-0 z-50 bg-[#141416]/95 backdrop-blur-md rounded-[23px] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="absolute top-4 right-4 bg-transparent border-none text-[#8b8b93] hover:text-white cursor-pointer p-1"
            onClick={() => setActiveOverlay(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>

          <h3 className="text-sm font-bold text-white mb-1">Daten exportieren</h3>
          <p className="text-[10px] text-[#8b8b93] text-center mb-5">
            Lade alle Termine & Einträge als CSV oder JSON herunter
          </p>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className="flex-1 bg-[#6d6cf5] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 transition"
            >
              CSV Export
            </button>
            <button
              type="button"
              onClick={() => handleExport("json")}
              className="flex-1 bg-[#232326] border border-[#2a2a2e] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:border-[#3a3a40] transition"
            >
              JSON Export
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY: STATS */}
      {activeOverlay === "stats" && (
        <div className="absolute inset-0 z-50 bg-[#141416]/95 backdrop-blur-md rounded-[23px] flex flex-col p-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="absolute top-4 right-4 bg-transparent border-none text-[#8b8b93] hover:text-white cursor-pointer p-1"
            onClick={() => setActiveOverlay(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>

          <h3 className="text-sm font-bold text-white mb-1">Kategorie-Übersicht</h3>
          <p className="text-[10px] text-[#8b8b93] mb-3">Einteilung deiner Termine & Ausgaben</p>

          <div className="grid grid-cols-2 gap-2 w-full my-auto">
            {(["meeting", "privat", "subscriptions", "rechnungen", "fokus"] as CleanCategoryType[]).map((cat) => (
              <div key={cat} className="p-2.5 rounded-xl bg-[#232326]/60 border border-[#2a2a2e] flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#8b8b93]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_METADATA[cat].dot }} />
                  <span>{CATEGORY_METADATA[cat].label}</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {statsSummary.counts[cat] || 0} <span className="text-[9px] font-normal text-[#8b8b93]">Einträge</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-[#6d6cf5]/10 border border-[#6d6cf5]/20 text-center mt-3">
            <div className="text-[10px] text-[#8b8b93]">Aktuelle Gesamtausgaben (Monat)</div>
            <div className="text-sm font-bold text-[#6d6cf5]">${monthSpend.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* OVERLAY: UPCOMING 5 ITEMS (ON-DEMAND) */}
      {activeOverlay === "upcoming" && (
        <div className="absolute inset-0 z-50 bg-[#141416]/95 backdrop-blur-md rounded-[23px] flex flex-col p-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="absolute top-4 right-4 bg-transparent border-none text-[#8b8b93] hover:text-white cursor-pointer p-1"
            onClick={() => setActiveOverlay(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>

          <div className="mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Nächste 5 Termine & Fälligkeiten
            </h3>
            <p className="text-[10px] text-[#8b8b93]">
              Chronologische Übersicht mit Countdown
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {upcomingFive.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#8b8b93]">
                <p className="text-xs mb-1">Keine anstehenden Termine.</p>
              </div>
            ) : (
              upcomingFive.map((it) => {
                const diffTime = new Date(it.date).getTime() - new Date(todayStr).getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                let badgeText = `in ${diffDays}d`;
                let isUrgent = diffDays <= 1;
                if (diffDays === 0) badgeText = "HEUTE";
                else if (diffDays === 1) badgeText = "MORGEN";

                const meta = CATEGORY_METADATA[it.category];

                return (
                  <div
                    key={it.id}
                    onClick={() => {
                      setSelectedDateStr(it.date);
                      setActiveOverlay("dayDetail");
                    }}
                    className="p-2.5 rounded-xl bg-[#232326]/70 hover:bg-[#232326] border border-[#2a2a2e] hover:border-[#3a3a40] flex items-center justify-between gap-2 cursor-pointer transition"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
                        <span className="truncate">{it.name}</span>
                      </div>
                      <div className="text-[10px] text-[#8b8b93]">
                        {meta.label} · {it.date} {it.time ? `· ${it.time}` : ""}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        isUrgent
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-[#6d6cf5]/15 text-[#6d6cf5] border border-[#6d6cf5]/30"
                      }`}
                    >
                      {badgeText}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FLOATING TOAST */}
      {toastText && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1c1c20] border border-[#2a2a2e] shadow-xl px-3 py-1.5 rounded-full text-xs text-white z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          {toastText}
        </div>
      )}
    </div>
  );

  if (!standalone) {
    return <div className="w-full flex items-center justify-center p-2">{calendarCard}</div>;
  }

  // Floating pristine card directly on screen without outer bulky wrapper
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 50,
        left: position ? `${position.x}px` : "50%",
        top: position ? `${position.y}px` : "72px",
        transform: position ? "none" : "translateX(-50%)",
      }}
      className="pointer-events-auto select-none transition-[transform] duration-75"
    >
      {calendarCard}
    </div>
  );
};
