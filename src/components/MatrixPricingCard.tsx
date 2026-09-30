import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Cpu,
  CreditCard,
  Flame,
  Clock,
  Globe,
  Radio,
  Eye,
  Activity,
  Award,
  Check,
  RadioTower,
  Network,
  Maximize2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Terminal,
  X,
  ShieldCheck,
  Gift,
  Gauge,
  Sliders,
  Layers,
  Sparkle,
} from "lucide-react";
import { AgentConfig } from "../types";
import { ParticleSphere } from "./ParticleSphere";
import { UnifiedCoreParticleBall } from "./UnifiedCoreParticleBall";
import { getAgentSpecialtyData } from "./AgentCinematicShowcaseModal";
import { registerNewLead, setStoredAdminAuthenticated } from "../utils/leadDatabase";
import { recordNewCheckoutInvoice } from "../utils/invoiceDatabase";

interface MatrixPricingCardProps {
  onCheckout?: () => void;
  onJoinWaitlist?: (email: string, name?: string) => void;
  onEnterApp?: () => void;
  lang?: "de" | "en";
  mode?: "dashboard" | "waitlist";
  isTrialActive?: boolean;
  className?: string;
}

export const DEFAULT_8_AGENTS: AgentConfig[] = [
  {
    id: "syntax",
    name: "S.Y.N.T.A.X.",
    tag: "SOVEREIGN CORE // GETSYNTAX.AI",
    short: "SYNTAX",
    railLetter: "S",
    color: "#00f0ff",
    badgeColor: "#00f0ff",
    greeting: "Hier ist S.Y.N.T.A.X., Sovereign Core. Schön Sie wiederzusehen, Commander! Alle 8 Subsysteme laufen auf 100% Hochtouren.",
    shape: "sphere",
  },
  {
    id: "neo",
    name: "N.E.O.",
    tag: "MATRIX MR CORE // DIGITAL LEAD AI",
    short: "NEO",
    railLetter: "N",
    color: "#ff2a8d",
    badgeColor: "#ff2a8d",
    greeting: "Hier ist N.E.O., Ihr Growth- & Strategie-Kommandant. Na, Chief, bereit die Konkurrenz alt aussehen zu lassen?",
    shape: "sphere",
  },
  {
    id: "vega",
    name: "V.E.G.A.",
    tag: "TACTICAL CO-PROCESSOR // DATA & CODE MATRIX",
    short: "VEGA",
    railLetter: "V",
    color: "#ef4444",
    badgeColor: "#ef4444",
    greeting: "Hier ist V.E.G.A., Ihr taktischer Daten- & Code-Architekt. Mein Compiler schnurrt wie ein Kätzchen.",
    shape: "gyroscope",
  },
  {
    id: "odin",
    name: "O.D.I.N.",
    tag: "STRATEGIC DECISION MATRIX // SECURE & DEFENSE",
    short: "ODIN",
    railLetter: "O",
    color: "#e2f1ff",
    badgeColor: "#e2f1ff",
    greeting: "Hier ist O.D.I.N., Ihr Fels in der Brandung. 4096-Bit Schilde sind oben.",
    shape: "torus-knot",
  },
  {
    id: "pulse",
    name: "P.U.L.S.E.",
    tag: "VIRAL & SOCIAL ENGAGEMENT // CONTENT ENGINE",
    short: "PULSE",
    railLetter: "P",
    color: "#a855f7",
    badgeColor: "#a855f7",
    greeting: "Hier ist P.U.L.S.E., Ihre Content- & Viralitäts-Maschine! Welchen Banger hauen wir heute raus?",
    shape: "network",
  },
  {
    id: "chronos",
    name: "C.H.R.O.N.O.S.",
    tag: "TEMPORAL MATRIX // TIME & PRODUCTIVITY CORE",
    short: "CHRONOS",
    railLetter: "C",
    color: "#eab308",
    badgeColor: "#eab308",
    greeting: "Hier ist C.H.R.O.N.O.S., Ihr persönlicher Zeitmeister. Wie strukturieren wir Ihren Tag?",
    shape: "hourglass",
  },
  {
    id: "oracle",
    name: "O.R.A.C.L.E.",
    tag: "FINANCIAL & CHART LATTICE // MARKET ANALYTICS CORE",
    short: "ORACLE",
    railLetter: "R",
    color: "#22c55e",
    badgeColor: "#22c55e",
    greeting: "Hier ist O.R.A.C.L.E., Ihr Quant-Finanz-Orakel. Märkte schlafen nie, wir sind ihnen voraus.",
    shape: "chart",
  },
  {
    id: "globe",
    name: "G.L.O.B.E.",
    tag: "QUAD-CORE DEEP SEARCH // LIVE WEB MATRIX",
    short: "GLOBE",
    railLetter: "G",
    color: "#3b82f6",
    badgeColor: "#3b82f6",
    greeting: "Hier ist G.L.O.B.E., Ihr weltweiter Deep-Search Radar. Keine Information bleibt vor uns verborgen.",
    shape: "fusion",
  },
];

// SUBTLE DATA-STREAM PARTICLE EFFECT FOR 2026 AI-OS CHECKOUT SYSTEM CORE
const DataStreamCanvas: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 800;
      height = canvas.height = canvas.offsetHeight || 600;
    };
    window.addEventListener("resize", handleResize);

    // Flowing system streams (Electric Blue & Deep Purple)
    const streams = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.35 + Math.random() * 0.75,
      length: 25 + Math.random() * 65,
      opacity: 0.05 + Math.random() * 0.18,
      width: Math.random() > 0.8 ? 1.5 : 0.8,
      isPurple: Math.random() > 0.6,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle streaming lines
      streams.forEach((s) => {
        s.y += s.speed;
        if (s.y > height + s.length) {
          s.y = -s.length;
          s.x = Math.random() * width;
        }

        const color = s.isPurple ? "168, 85, 247" : "0, 242, 255";
        const gradient = ctx.createLinearGradient(s.x, s.y - s.length, s.x, s.y);
        gradient.addColorStop(0, `rgba(${color}, 0)`);
        gradient.addColorStop(0.7, `rgba(${color}, ${s.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${color}, ${s.opacity})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - s.length);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Particle head with soft glow
        ctx.fillStyle = `rgba(${color}, ${Math.min(0.9, s.opacity * 2.2)})`;
        ctx.fillRect(s.x - s.width / 2, s.y - 1, s.width, 2.5);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};

export const MatrixPricingCard: React.FC<MatrixPricingCardProps> = ({
  onCheckout,
  onJoinWaitlist,
  onEnterApp,
  lang = "de",
  mode = "waitlist",
  className = "",
}) => {
  const isDe = lang === "de";
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(2); // Default to VEGA as in screenshot
  const [isAutopilot, setIsAutopilot] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Modern vs Cyberpunk theme switcher (Modern is now default!)
  const [designTheme, setDesignTheme] = useState<"modern" | "cyberpunk">("modern");

  // Real-time telemetry state for the floating widget
  const [telemetry, setTelemetry] = useState({
    tokensPerSec: 28400,
    totalTokens: 1428900,
    contextUsed: 148200,
    contextMax: 2000000,
    latencyMs: 14.2,
    latencyJitter: 0.6,
    throughput: 99.8,
    activeCores: 8,
  });

  // Stripe checkout simulation modal states
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [generatedPasskey, setGeneratedPasskey] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingName, setBillingName] = useState("");

  const currentAgent = DEFAULT_8_AGENTS[activeAgentIndex] || DEFAULT_8_AGENTS[0];
  const specData = getAgentSpecialtyData(currentAgent.id, lang);

  // Live telemetry updater simulating real-time token streaming and ping per core
  useEffect(() => {
    const baseLatencies: Record<string, number> = {
      syntax: 16.2,
      neo: 18.0,
      vega: 11.4,
      odin: 8.8,
      pulse: 21.5,
      chronos: 13.9,
      oracle: 12.6,
      globe: 19.2,
    };
    const baseTokens: Record<string, number> = {
      syntax: 34200,
      neo: 29500,
      vega: 46800,
      odin: 22100,
      pulse: 54000,
      chronos: 24300,
      oracle: 39500,
      globe: 31000,
    };

    const targetLatency = baseLatencies[currentAgent.id] || 14.0;
    const targetTokens = baseTokens[currentAgent.id] || 28000;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const jitter = (Math.random() - 0.5) * 1.8;
        const delta = Math.floor((Math.random() - 0.48) * 920);
        return {
          ...prev,
          latencyMs: +(Math.max(5, targetLatency + jitter)).toFixed(1),
          tokensPerSec: Math.max(12000, targetTokens + delta),
          totalTokens: prev.totalTokens + Math.floor(Math.random() * 40 + 15),
          contextUsed: Math.min(prev.contextMax, prev.contextUsed + Math.floor(Math.random() * 14)),
          throughput: +(99.6 + Math.random() * 0.38).toFixed(1),
        };
      });
    }, 850);

    return () => clearInterval(interval);
  }, [currentAgent.id]);

  // Autopilot progress timer loop (cycles smoothly every 5 seconds)
  useEffect(() => {
    if (!isAutopilot) return;

    setProgress(0);
    const intervalTime = 50; // ms
    const totalDuration = 5000; // 5 seconds per core
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveAgentIndex((currentIdx) => (currentIdx + 1) % DEFAULT_8_AGENTS.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutopilot, activeAgentIndex]);

  const handleNext = () => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex((prev) => (prev + 1) % DEFAULT_8_AGENTS.length);
  };

  const handlePrev = () => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex((prev) => (prev - 1 + DEFAULT_8_AGENTS.length) % DEFAULT_8_AGENTS.length);
  };

  const handleSelectTab = (idx: number) => {
    setIsAutopilot(false);
    setProgress(0);
    setActiveAgentIndex(idx);
  };

  const handleOpenCheckout = () => {
    setIsStripeModalOpen(true);
    setStripeSuccess(false);
  };

  const handleExecuteSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingStripe(true);

    setTimeout(() => {
      const randomKey = `SYNTAX-8CORE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setGeneratedPasskey(randomKey);

      // Register into database as paid member
      registerNewLead({
        name: billingName || "Sovereign Commander",
        email: billingEmail || "commander@getsyntax.ai",
        plan: "PRO_29",
        source: "8-CORE MATRIX 29€ ACCESS",
        notes: `Paid 29€ Matrix Passkey: ${randomKey}`,
        device: "Desktop / Browser",
        trialDays: 3,
      });

      // Record official Invoice in Admin & User Billing Database
      let methodLabel = "Stripe Kreditkarte";
      let paymentType: "apple_pay" | "google_pay" | "paypal" | "klarna" | "card" = "card";
      const lowEmail = (billingEmail || "").toLowerCase();
      const lowName = (billingName || "").toLowerCase();
      if (lowEmail.includes("apple") || lowName.includes("apple")) {
        methodLabel = "Apple Pay Express (Touch ID)";
        paymentType = "apple_pay";
      } else if (lowEmail.includes("gpay") || lowName.includes("google")) {
        methodLabel = "Google Pay (1-Click)";
        paymentType = "google_pay";
      } else if (lowEmail.includes("paypal") || lowName.includes("paypal")) {
        methodLabel = "PayPal Fast (1-Click)";
        paymentType = "paypal";
      } else if (lowEmail.includes("klarna") || lowName.includes("klarna")) {
        methodLabel = "Klarna Sofortüberweisung";
        paymentType = "klarna";
      }

      recordNewCheckoutInvoice({
        name: billingName || "Sovereign Commander",
        email: billingEmail || "commander@getsyntax.ai",
        amount: 29.00,
        planName: "1x PRO SOVEREIGN CORE Plan (monthly)",
        paymentMethod: methodLabel,
        paymentType,
        token: randomKey,
        status: "PAID",
        notes: `Erfolgreiche 29€ Matrix-Aktivierung via ${methodLabel}`,
      });

      // Save passkey in localStorage so system unlocks immediately
      try {
        localStorage.setItem("syntax_beta_authenticated", "true");
        localStorage.setItem("syntax_admin_auth", "true");
        localStorage.setItem("syntax_user_passkey", randomKey);
        setStoredAdminAuthenticated(true);
      } catch (err) {
        console.error("Local storage write error:", err);
      }

      setIsProcessingStripe(false);
      setStripeSuccess(true);
    }, 1200);
  };

  const isCyber = designTheme === "cyberpunk";

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto rounded-3xl transition-all duration-500 overflow-hidden flex flex-col font-sans ${
        isCyber
          ? "bg-[#040714] border-2 border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.35)]"
          : "bg-[#0a0c16]/95 border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      } ${className}`}
    >
      {/* TOP HEADER CONTROL BAR - HIGH-CONVERSION ENGINE */}
      <div
        className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 transition-colors duration-300 z-30 ${
          isCyber
            ? "border-cyan-500/20 bg-[#060a1e]/90 font-mono text-xs"
            : "border-white/10 bg-zinc-950/80 backdrop-blur-xl font-sans"
        }`}
      >
        {/* LEFT: Branding, Live Core Status & High-Converting Social Proof */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isCyber
                ? "bg-cyan-500/10 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-300 shadow-sm"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isCyber ? "animate-spin text-cyan-300" : "text-amber-300 animate-pulse"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-bold tracking-tight text-white ${
                  isCyber ? "font-mono text-cyan-200 tracking-wider text-xs" : "text-sm sm:text-base font-semibold"
                }`}
              >
                SYNTAX CINEMATIC SHOWCASE
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                  isCyber
                    ? "bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-sans"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Core {activeAgentIndex + 1}/8 ONLINE</span>
              </span>
            </div>

            {/* Social Proof, Rating & Scarcity Micro-Bar */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-sans mt-0.5">
              <span className="text-amber-400 flex items-center gap-0.5 font-medium">
                ★ 4.9/5
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {isDe ? "3 Tage kostenlos testen (0€)" : "3 days free trial (0€)"}
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline text-zinc-400">
                {isDe ? "Noch 4 Plätze zu 29€" : "Only 4 spots left at 29€"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: HIGH-CONVERSION CTA BUTTON, DISCOUNT BADGE & THEME CONTROLS */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* HIGH-CONVERSION PRIMARY CTA TRIGGER */}
          <button
            type="button"
            onClick={handleOpenCheckout}
            className={`group relative py-2 px-3.5 sm:px-4 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer flex items-center gap-2 active:scale-95 shadow-lg overflow-hidden ${
              isCyber
                ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-mono tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110"
                : "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.35)] hover:shadow-[0_0_35px_rgba(52,211,153,0.55)] hover:brightness-105"
            }`}
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping shrink-0" />
            <span className="font-extrabold tracking-wide">
              {isDe ? "JETZT 3 TAGE TESTEN (0€)" : "START 3-DAY TRIAL (0€)"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Quick Price Anchor Badge with Discount Pill */}
          <div
            onClick={handleOpenCheckout}
            className={`cursor-pointer hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition hover:scale-105 ${
              isCyber
                ? "bg-cyan-950/80 border border-cyan-400/60 font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 font-sans text-zinc-200"
            }`}
            title="Jetzt Rabatt sichern"
          >
            <span className="line-through text-zinc-500 text-[10px]">79€</span>
            <span className="text-emerald-400 font-bold">29€/Mo</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase">
              -63%
            </span>
          </div>

          {/* CYBERPUNK EXTRA WIDGET SWITCHER */}
          <div className="flex items-center bg-zinc-900/90 border border-white/10 p-1 rounded-xl shadow-inner text-xs font-medium">
            <button
              type="button"
              onClick={() => setDesignTheme("modern")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                !isCyber
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Modern Minimalist Design (Standard)"
            >
              <Sparkle className="w-3 h-3" />
              <span className="hidden sm:inline">Modern</span>
            </button>
            <button
              type="button"
              onClick={() => setDesignTheme("cyberpunk")}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isCyber
                  ? "bg-cyan-500 text-slate-950 font-mono font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  : "text-zinc-400 hover:text-white font-mono text-[11px]"
              }`}
              title="Cyberpunk Extra Widget Mode"
            >
              <Terminal className="w-3 h-3" />
              <span className="hidden sm:inline">Cyberpunk</span>
            </button>
          </div>

          {/* Autopilot Button */}
          <button
            type="button"
            onClick={() => {
              setIsAutopilot(!isAutopilot);
              setProgress(0);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              isAutopilot
                ? isCyber
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 font-mono shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "bg-white/15 text-white border-white/20 font-sans shadow-sm"
                : "bg-transparent text-zinc-400 border-white/10 hover:text-white"
            }`}
            title={isDe ? "Autopilot Umschalten" : "Toggle Autopilot"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutopilot ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden xl:inline">Auto</span>
          </button>
        </div>
      </div>

      {/* TOP AUTOPILOT PROGRESS BAR */}
      {isAutopilot && (
        <div className="w-full bg-zinc-900/80 h-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              isCyber
                ? "bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400"
                : "bg-gradient-to-r from-white via-indigo-400 to-cyan-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* MAIN PRESENTATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 flex-1 items-center z-20">
        {/* LEFT COLUMN: 3D HOLOGRAPHIC CANVAS WITH THE REQUESTED FLOATING REAL-TIME TELEMETRY WIDGET */}
        <div
          className={`lg:col-span-6 flex flex-col items-center justify-center relative min-h-[360px] sm:min-h-[420px] rounded-2xl p-4 overflow-hidden group transition-all duration-300 ${
            isCyber
              ? "bg-[#030612]/90 border border-cyan-500/20"
              : "bg-gradient-to-b from-zinc-950/70 to-zinc-900/40 border border-white/10 shadow-inner"
          }`}
        >
          {/* Ambient Glow Backdrop */}
          <div
            className="absolute inset-0 opacity-30 blur-[100px] transition-colors duration-1000 rounded-full pointer-events-none"
            style={{ backgroundColor: currentAgent.color || "#06b6d4" }}
          />

          {/* FLOATING REAL-TIME TELEMETRY WIDGET (NEW REQUESTED COMPONENT) */}
          <div className="absolute top-3.5 right-3.5 z-30 max-w-[215px] w-full p-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] text-left font-mono transition-all duration-300 pointer-events-auto">
            {/* Header: Core Status */}
            <div className="flex items-center justify-between gap-1.5 mb-1.5 pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[10px] font-bold text-zinc-200 tracking-wider">
                  TELEMETRY
                </span>
              </div>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border"
                style={{
                  color: currentAgent.color || "#38bdf8",
                  borderColor: `${currentAgent.color}40`,
                  backgroundColor: `${currentAgent.color}15`,
                }}
              >
                {currentAgent.short || currentAgent.name}
              </span>
            </div>

            {/* Active Token Usage Stream */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">ACTIVE TOKENS:</span>
                <span className="font-bold text-white">
                  {(telemetry.tokensPerSec / 1000).toFixed(1)}k{" "}
                  <span className="text-[8px] text-zinc-400 font-normal">tok/s</span>
                </span>
              </div>

              {/* Dynamic Animated Token Gauge */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (telemetry.tokensPerSec / 60000) * 100)}%`,
                    backgroundColor: currentAgent.color || "#06b6d4",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-0.5">
                <span>Total Stream:</span>
                <span className="text-zinc-300 font-medium">
                  {(telemetry.totalTokens / 1000000).toFixed(2)}M processed
                </span>
              </div>
            </div>

            {/* System Latency & Core Nominal Status */}
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-zinc-400">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>LATENCY:</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-emerald-400 font-mono">
                  {telemetry.latencyMs} ms
                </span>
                <span className="text-[8px] text-zinc-400 font-normal">
                  [{telemetry.throughput}%]
                </span>
              </div>
            </div>
          </div>

          {/* 3D PARTICLE SPHERE VIEWPORT */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center z-10">
            <ParticleSphere
              state="speaking"
              micLevel={0.4}
              speakingLevel={0.6}
              agentColor={currentAgent.color || "#06b6d4"}
              shape={currentAgent.shape || "sphere"}
              currentAgentId={currentAgent.id}
              isActive={true}
            />
          </div>

          {/* Modern Bottom Floating Badge for Active Core */}
          <div className="mt-2 text-center z-20">
            <div
              className={`text-lg font-bold tracking-wide uppercase transition-colors ${
                isCyber ? "font-mono font-black drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" : "font-sans"
              }`}
              style={{ color: currentAgent.color || "#06b6d4" }}
            >
              {currentAgent.name}
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">
              3D Orb Shape: <span className="text-zinc-200">{(currentAgent.shape || "sphere").toUpperCase()}</span>
            </div>
          </div>

          {/* Previous / Next Arrow Controls */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/15 transition-all flex items-center justify-center cursor-pointer z-30 shadow-md active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-950/70 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/15 transition-all flex items-center justify-center cursor-pointer z-30 shadow-md active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* RIGHT COLUMN: REFINED MODERN SPECIFICATIONS & 29€ MATRIX PRICING POD */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div>
            {/* Category / Specialty Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2.5 ${
                isCyber
                  ? "bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono"
                  : "bg-white/[0.06] border border-white/15 text-zinc-300 font-sans"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{specData.badge}</span>
            </div>

            {/* Title & Subtitle */}
            <h2
              className={`text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight ${
                isCyber ? "font-mono uppercase" : "font-sans"
              }`}
            >
              {specData.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs sm:text-sm text-zinc-300 font-medium">
                {specData.subTitle}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] inline-block" />
            </div>

            {/* Tagline Quote */}
            <p className="mt-2.5 text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans border-l-2 border-indigo-400/80 pl-3 py-0.5">
              "{specData.tagline}"
            </p>
          </div>

          {/* Specialties Bullet Points */}
          <div className="space-y-1.5">
            <span
              className={`text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block ${
                isCyber ? "font-mono" : "font-sans"
              }`}
            >
              {isDe ? "Kern-Fähigkeiten & Spezialgebiete:" : "Core Capabilities & Strengths:"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specData.specialties.map((spec, sIdx) => (
                <div
                  key={sIdx}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-xs text-zinc-200 flex items-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium truncate">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            {specData.metrics.map((m, mIdx) => (
              <div
                key={mIdx}
                className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/10 text-center"
              >
                <div className="text-[10px] text-zinc-400 font-medium font-sans">
                  {m.label}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* THE 29€ MATRIX PRICING POD - SLEEK MODERN SAAS STYLE */}
          <div
            className={`p-4 rounded-2xl transition-all duration-300 ${
              isCyber
                ? "bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-950 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]"
                : "bg-zinc-950/90 border border-white/15 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  8-Core Matrix Unlimited
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                  Sofort einsatzbereit
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-extrabold text-white">29€</span>
                <span className="text-xs text-zinc-400 font-normal ml-1">/ Monat</span>
              </div>
            </div>

            <div className="text-xs text-zinc-300 flex flex-wrap items-center gap-x-3 gap-y-1 mb-3.5">
              <span className="flex items-center gap-1 text-zinc-200">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isDe ? "Alle 8 Spezialisten-Kerne" : "All 8 specialist cores"}
              </span>
              <span className="flex items-center gap-1 text-zinc-200">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isDe ? "Monatlich kündbar" : "Cancel anytime"}
              </span>
              <span className="flex items-center gap-1 text-zinc-200">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isDe ? "3 Tage risikofreie Testphase" : "3-day risk-free trial"}
              </span>
            </div>

            {/* High-Conversion Modern CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleOpenCheckout}
                className={`w-full py-3 px-3 rounded-xl font-bold text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-lg group ${
                  isCyber
                    ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-black uppercase font-mono shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110"
                    : "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 hover:brightness-105 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                }`}
              >
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950 group-hover:scale-110 transition-transform" />
                <span>{isDe ? "JETZT 3 TAGE TEST STARTEN (0€)" : "START 3-DAY TRIAL (0€)"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onEnterApp) {
                    onEnterApp();
                  } else if (onJoinWaitlist) {
                    onJoinWaitlist("vip@getsyntax.ai", currentAgent.name);
                  }
                }}
                className={`w-full py-3 px-3 rounded-xl font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                  isCyber
                    ? "bg-purple-950/80 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-400 font-mono"
                    : "bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/15 hover:border-white/25"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-300" />
                <span>{isDe ? `${currentAgent.name} im Dashboard starten` : `Launch ${currentAgent.name}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HORIZONTAL AGENT SELECTOR DOCK */}
      <div
        className={`p-3.5 border-t transition-colors duration-300 z-30 ${
          isCyber ? "border-purple-500/20 bg-[#020510] font-mono" : "border-white/10 bg-zinc-950/70 font-sans"
        }`}
      >
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
          {DEFAULT_8_AGENTS.map((ag, aIdx) => {
            const isSelected = aIdx === activeAgentIndex;
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => handleSelectTab(aIdx)}
                className={`px-3 py-2 rounded-xl border text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? isCyber
                      ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105 font-bold"
                      : "bg-white/15 border-white/30 text-white font-semibold shadow-md scale-105"
                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block transition-transform"
                  style={{
                    backgroundColor: ag.color || "#a855f7",
                    boxShadow: isSelected ? `0 0 8px ${ag.color || "#a855f7"}` : "none",
                  }}
                />
                <span>{ag.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* HIGH-END FUTURISTIC SOVEREIGN AI-OS CHECKOUT COMPONENT (DEEP OBSIDIAN #050505) */}
      {isStripeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
          {/* Deep Obsidian Modal Container: #050505 background with subtle Glassmorphism & 16px radius */}
          <div className="relative w-full max-w-4xl rounded-[16px] bg-[#050505]/90 border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_40px_rgba(0,242,255,0.08)] backdrop-blur-3xl overflow-hidden text-left my-auto transition-all duration-500">
            {/* ATMOSPHERE: Animated 'Data-Stream' particle effect running in background */}
            <DataStreamCanvas className="opacity-70" />

            {/* Top 2026 AI-OS Sovereign Header HUD */}
            <div className="relative z-10 px-6 py-3.5 border-b border-white/[0.06] bg-black/40 backdrop-blur-md flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2ff] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-white font-light uppercase">
                  SOVEREIGN AI-OS // CORE-ACCESS-GATEWAY 08+1
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.03] text-[#00f2ff] border border-[#00f2ff]/30 font-mono tracking-widest hidden sm:inline">
                  256-BIT QUANTUM TLS
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider hidden sm:flex items-center gap-1.5 font-light">
                  <ShieldCheck className="w-3 h-3 text-[#00f2ff]" />
                  DSGVO & PCI-DSS CERTIFIED
                </span>
                <button
                  type="button"
                  onClick={() => setIsStripeModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] hover:border-[#00f2ff]/40 flex items-center justify-center transition cursor-pointer"
                  title="Schließen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {!stripeSuccess ? (
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
                {/* LEFT COLUMN: 8-CORE MATRIX ORDER TELEMETRY & SPEC POD (5 COLS) */}
                <div className="lg:col-span-5 p-6 sm:p-7 bg-white/[0.01] border-b lg:border-b-0 lg:border-r border-white/[0.06] flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* UNIFIED 8-CORE PARTICLE BALL: REPRESENTS & DESCRIBES ALL 8 CORES IN ONE 3D SPHERE */}
                    <UnifiedCoreParticleBall
                      activeAgentIndex={activeAgentIndex}
                      onSelectAgent={setActiveAgentIndex}
                      lang={lang}
                    />

                    {/* Plan Heading: Clean geometric sans-serif font, High contrast, thin weight */}
                    <div className="pt-2">
                      <span className="text-[9px] font-mono font-light text-[#00f2ff] tracking-[0.25em] uppercase block">
                        SOVEREIGN NEURAL TIER
                      </span>
                      <h4 className="text-2xl font-extralight text-white font-sans tracking-tight mt-0.5">
                        8-Core Matrix Unlimited
                      </h4>
                    </div>

                    {/* Big Price Tag: High Contrast, Thin Weight */}
                    <div className="pt-2 border-t border-white/[0.05]">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-extralight text-white font-sans tracking-tight">
                          29,00 <span className="text-xl font-light text-[#00f2ff]">€</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-[0.2em]">/ MONAT</span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-[#00f2ff]/20 text-[#00f2ff] text-xs font-mono font-light">
                        <Sparkles className="w-3 h-3 text-[#00f2ff]" />
                        <span>3 Tage risikofreie Testphase inklusive</span>
                      </div>
                    </div>

                    {/* Transparent Itemized Price Breakdown */}
                    <div className="p-3.5 rounded-[12px] bg-white/[0.015] border border-white/[0.05] text-xs space-y-2 text-zinc-300">
                      <div className="flex justify-between items-center font-mono text-[11px]">
                        <span className="text-zinc-400 font-light">8 KI-Kerne Vollzugriff:</span>
                        <span className="font-light text-white">29,00 €</span>
                      </div>
                      <div className="flex justify-between items-center text-[#00f2ff] font-mono text-[11px]">
                        <span className="font-light">3 Tage Testphase Rabatt:</span>
                        <span className="font-light">-29,00 €</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500 text-[10px] font-mono">
                        <span>Enthaltene MwSt. (19%):</span>
                        <span>4,63 €</span>
                      </div>
                      <div className="border-t border-white/[0.05] pt-2 flex justify-between items-center text-sm font-light text-white font-mono">
                        <span className="tracking-wider">Heute fällig:</span>
                        <span className="text-[#00f2ff] text-base font-extralight tracking-tight">
                          0,00 €
                        </span>
                      </div>
                    </div>

                    {/* System Specifications Checklist */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[9px] font-mono text-zinc-400 tracking-[0.25em] uppercase block">
                        SYSTEMVERIFIZIERUNG // 2026 AI-OS:
                      </span>
                      <div className="space-y-1.5 text-xs text-zinc-400 font-sans font-light">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2ff] shrink-0 mt-0.5" />
                          <span>Alle 8 KI-Kerne sofort aktiv (Syntax, Neo, Vega, Odin, Pulse...)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2ff] shrink-0 mt-0.5" />
                          <span>Unbegrenzte Tokens & System-Latenz unter 15 ms</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2ff] shrink-0 mt-0.5" />
                          <span>Sofortiger kryptografischer Master-Passkey</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00f2ff] shrink-0 mt-0.5" />
                          <span>Monatlich kündbar mit 1 Klick im Dashboard</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Review / Trust Quote */}
                  <div className="p-3 rounded-[12px] bg-white/[0.015] border border-white/[0.04] text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1 text-amber-400/90 mb-1">
                      {"★".repeat(5)}
                      <span className="text-zinc-400 font-mono font-light ml-1 text-[10px]">4.9 / 5.0</span>
                    </div>
                    <p className="italic text-zinc-300 font-sans font-light">
                      "Die Spezialisten ersetzen bei uns 3 separate Tools. Zugriff war innerhalb von 10 Sekunden aktiv."
                    </p>
                    <span className="block mt-1 text-[9px] text-zinc-500 font-mono tracking-widest">— Verified Founder Member</span>
                  </div>
                </div>

                {/* RIGHT COLUMN: HIGH-END PROPRIETARY 2026 AI-OS PAYMENT FORM (7 COLS) */}
                <div className="lg:col-span-7 p-6 sm:p-7 bg-transparent flex flex-col justify-between">
                  <form onSubmit={handleExecuteSimulatedPayment} className="space-y-4">
                    {/* Express Checkout: Floating Glass Capsules with subtle borders */}
                    <div>
                      <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 uppercase block mb-2 font-light">
                        EXPRESS-AUTHENTIFIZIERUNG:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBillingName("Apple Pay User");
                            setBillingEmail("applepay@getsyntax.ai");
                          }}
                          className="py-2.5 px-2.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#00f2ff]/40 text-white border border-white/[0.08] font-sans text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.06)]"
                          title="Apple Pay Express"
                        >
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 fill-white shrink-0 -mt-0.5" viewBox="0 0 170 170" aria-label="Apple">
                              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.03-7.61-7.7-11.73-14.02-6.19-9.53-11.05-20.73-14.58-33.6-3.53-12.87-5.3-25.07-5.3-36.6 0-16.73 4.2-30.73 12.61-42 8.41-11.27 18.99-17.06 31.75-17.37 4.5 0 9.87 1.25 16.12 3.75 6.25 2.5 10.42 3.82 12.51 3.97 1.77-.15 6.06-1.52 12.87-4.12 6.81-2.6 12.18-3.8 16.12-3.6 12.28.61 22.25 5.56 29.9 14.85-10.74 6.53-15.98 15.65-15.72 27.36.26 9.4 3.91 17.27 10.96 23.6 7.05 6.33 15.42 10.02 25.1 11.08-2.62 8.04-5.91 16.5-9.87 25.37zm-27.14-118.8c0 7.82-2.88 15.22-8.63 22.2-5.75 6.98-12.72 11.2-20.91 12.66-.44-1.12-.66-2.31-.66-3.56 0-7.59 3.01-14.88 9.03-21.87 6.02-6.99 13.06-11.15 21.11-12.49.06 1.02.06 2.04.06 3.06z" />
                            </svg>
                            <span className="text-xs font-medium tracking-tight text-white">Pay</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 group-hover:text-cyan-300 tracking-wider hidden xs:inline">EXPRESS</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBillingName("Google Pay User");
                            setBillingEmail("gpay@getsyntax.ai");
                          }}
                          className="py-2.5 px-2.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#00f2ff]/40 text-white border border-white/[0.08] font-sans text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-sm hover:shadow-[0_0_15px_rgba(66,133,244,0.12)]"
                          title="Google Pay 1-Click"
                        >
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-label="Google">
                              <path
                                fill="#4285F4"
                                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                              />
                            </svg>
                            <span className="text-xs font-medium tracking-tight text-white">Pay</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 group-hover:text-cyan-300 tracking-wider hidden xs:inline">1-CLICK</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBillingName("PayPal User");
                            setBillingEmail("paypal@getsyntax.ai");
                          }}
                          className="py-2.5 px-2.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#00f2ff]/40 text-white border border-white/[0.08] font-sans text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-sm hover:shadow-[0_0_15px_rgba(0,121,193,0.15)]"
                          title="PayPal Fast Checkout"
                        >
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-label="PayPal">
                              <path
                                d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.78.78 0 0 1 .77-.655h6.639c3.238 0 5.438 1.637 4.954 4.887-.417 2.801-2.296 4.382-5.048 4.382H9.57a.78.78 0 0 0-.77.656l-.994 6.302-.73 2.045z"
                                fill="#0079C1"
                              />
                              <path
                                d="M9.13 13.67h2.69c2.76 0 4.64-1.58 5.06-4.39.48-3.25-1.72-4.89-4.95-4.89H5.29a.78.78 0 0 0-.77.66L2.34 20.6a.64.64 0 0 0 .63.74h3.69l.99-6.3a.78.78 0 0 1 .77-.66l.71-.71z"
                                fill="#00457C"
                              />
                            </svg>
                            <span className="text-xs font-medium tracking-tight text-white">PayPal</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 group-hover:text-cyan-300 tracking-wider hidden xs:inline">FAST</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBillingName("Klarna Verified");
                            setBillingEmail("klarna@getsyntax.ai");
                          }}
                          className="py-2.5 px-2.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#00f2ff]/40 text-white border border-white/[0.08] font-sans text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-sm hover:shadow-[0_0_15px_rgba(255,179,199,0.15)]"
                          title="Klarna Sofort"
                        >
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 shrink-0 rounded-[3px]" viewBox="0 0 24 24" fill="none" aria-label="Klarna">
                              <rect width="24" height="24" rx="4" fill="#FFB3C7" />
                              <path d="M6.5 5.5v13h2.4V5.5H6.5zm8.8 0l-3.8 6.2 4.4 6.8h2.8l-4.5-7 4.3-6H15.3z" fill="#0A0A0A" />
                              <circle cx="18.8" cy="16.5" r="1.6" fill="#0A0A0A" />
                            </svg>
                            <span className="text-xs font-semibold tracking-tight text-white flex items-center">
                              Klarna<span className="text-[#ffb3c7]">.</span>
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 group-hover:text-cyan-300 tracking-wider hidden xs:inline">SOFORT</span>
                        </button>
                      </div>
                    </div>

                    {/* Futuristic Minimalist Divider */}
                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-white/[0.06] w-full" />
                      <span className="px-3 text-[9px] font-mono font-light text-zinc-500 uppercase tracking-[0.25em]">
                        ODER SEPA / KREDITKARTE
                      </span>
                      <div className="border-t border-white/[0.06] w-full" />
                    </div>

                    {/* SLIM SYSTEM-STATUS ROW: SECURE TRANSACTION BADGES (DEEP OBSIDIAN THEME) */}
                    <div className="py-2 px-3 rounded-[10px] bg-white/[0.015] border border-white/[0.06] flex items-center justify-between gap-2 text-zinc-400">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2ff] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2ff] shadow-[0_0_6px_#00f2ff]" />
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] uppercase truncate">
                          <span className="text-zinc-500 font-light">SYSTEM-STATUS:</span>
                          <span className="text-zinc-200 font-medium flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-[#00f2ff]" />
                            SECURE TRANSACTION
                          </span>
                        </div>
                      </div>

                      {/* Dezent styled Secure Badges (Apple Pay, Google Pay, PayPal, Klarna, 256-BIT) */}
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap justify-end">
                        {/* Apple Pay Secure Badge */}
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-white/[0.02] border border-white/[0.05] text-zinc-300 transition-colors hover:border-white/[0.15]"
                          title="Apple Pay Secure Enclave"
                        >
                          <svg className="w-2.5 h-2.5 fill-white shrink-0 -mt-0.5" viewBox="0 0 170 170" aria-label="Apple Pay">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.03-7.61-7.7-11.73-14.02-6.19-9.53-11.05-20.73-14.58-33.6-3.53-12.87-5.3-25.07-5.3-36.6 0-16.73 4.2-30.73 12.61-42 8.41-11.27 18.99-17.06 31.75-17.37 4.5 0 9.87 1.25 16.12 3.75 6.25 2.5 10.42 3.82 12.51 3.97 1.77-.15 6.06-1.52 12.87-4.12 6.81-2.6 12.18-3.8 16.12-3.6 12.28.61 22.25 5.56 29.9 14.85-10.74 6.53-15.98 15.65-15.72 27.36.26 9.4 3.91 17.27 10.96 23.6 7.05 6.33 15.42 10.02 25.1 11.08-2.62 8.04-5.91 16.5-9.87 25.37zm-27.14-118.8c0 7.82-2.88 15.22-8.63 22.2-5.75 6.98-12.72 11.2-20.91 12.66-.44-1.12-.66-2.31-.66-3.56 0-7.59 3.01-14.88 9.03-21.87 6.02-6.99 13.06-11.15 21.11-12.49.06 1.02.06 2.04.06 3.06z" />
                          </svg>
                          <span className="font-sans font-medium text-[8.5px] tracking-tight">Pay</span>
                        </div>

                        {/* Google Pay Secure Badge */}
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-white/[0.02] border border-white/[0.05] text-zinc-300 transition-colors hover:border-white/[0.15]"
                          title="Google Pay Tokenized Authentication"
                        >
                          <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" aria-label="Google Pay">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                          </svg>
                          <span className="font-sans font-medium text-[8.5px] tracking-tight">Pay</span>
                        </div>

                        {/* PayPal Secure Badge */}
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-white/[0.02] border border-white/[0.05] text-zinc-300 transition-colors hover:border-white/[0.15]"
                          title="PayPal Käuferschutz & One-Touch"
                        >
                          <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-label="PayPal">
                            <path
                              d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.78.78 0 0 1 .77-.655h6.639c3.238 0 5.438 1.637 4.954 4.887-.417 2.801-2.296 4.382-5.048 4.382H9.57a.78.78 0 0 0-.77.656l-.994 6.302-.73 2.045z"
                              fill="#0079C1"
                            />
                            <path
                              d="M9.13 13.67h2.69c2.76 0 4.64-1.58 5.06-4.39.48-3.25-1.72-4.89-4.95-4.89H5.29a.78.78 0 0 0-.77.66L2.34 20.6a.64.64 0 0 0 .63.74h3.69l.99-6.3a.78.78 0 0 1 .77-.66l.71-.71z"
                              fill="#00457C"
                            />
                          </svg>
                          <span className="font-sans font-medium text-[8.5px] tracking-tight text-zinc-200">PayPal</span>
                        </div>

                        {/* Klarna Secure Badge */}
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-white/[0.02] border border-white/[0.05] text-zinc-300 transition-colors hover:border-white/[0.15]"
                          title="Klarna Sofort / Später Bezahlen"
                        >
                          <svg className="w-2.5 h-2.5 shrink-0 rounded-[2px]" viewBox="0 0 24 24" fill="none" aria-label="Klarna">
                            <rect width="24" height="24" rx="4" fill="#FFB3C7" />
                            <path d="M6.5 5.5v13h2.4V5.5H6.5zm8.8 0l-3.8 6.2 4.4 6.8h2.8l-4.5-7 4.3-6H15.3z" fill="#0A0A0A" />
                            <circle cx="18.8" cy="16.5" r="1.6" fill="#0A0A0A" />
                          </svg>
                          <span className="font-sans font-semibold text-[8.5px] tracking-tight text-white flex items-center">
                            Klarna<span className="text-[#ffb3c7] font-bold">.</span>
                          </span>
                        </div>

                        {/* End-to-End Cryptographic Badge */}
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-[#00f2ff]/[0.04] border border-[#00f2ff]/20 text-[#00f2ff] text-[8.5px] font-mono tracking-wider"
                          title="256-Bit TLS End-to-End Encryption"
                        >
                          <ShieldCheck className="w-2.5 h-2.5 text-[#00f2ff]" />
                          <span>256-BIT</span>
                        </div>
                      </div>
                    </div>

                    {/* INPUTS: Floating minimalist input fields with 1px soft neon-blue glow on focus */}
                    <div className="space-y-3.5 text-xs">
                      {/* Floating Minimalist Input: E-Mail */}
                      <div className="relative rounded-[12px] bg-white/[0.02] border border-white/[0.06] transition-all duration-300 focus-within:border-[#00f2ff]/80 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_20px_rgba(0,242,255,0.25)]">
                        <input
                          id="checkout-field-email"
                          type="email"
                          required
                          placeholder=" "
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          className="peer w-full px-4 pt-5 pb-1.5 bg-transparent text-white font-sans font-light text-sm outline-none"
                        />
                        <label
                          htmlFor="checkout-field-email"
                          className="absolute left-4 top-1.5 text-[9px] font-mono tracking-[0.25em] uppercase text-zinc-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-600 peer-placeholder-shown:font-sans peer-placeholder-shown:tracking-normal peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:font-mono peer-focus:tracking-[0.25em] peer-focus:text-[#00f2ff] pointer-events-none"
                        >
                          Neural ID // E-Mail-Adresse (Instant Passkey)
                        </label>
                      </div>

                      {/* Floating Minimalist Input: Full Name */}
                      <div className="relative rounded-[12px] bg-white/[0.02] border border-white/[0.06] transition-all duration-300 focus-within:border-[#00f2ff]/80 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_20px_rgba(0,242,255,0.25)]">
                        <input
                          id="checkout-field-name"
                          type="text"
                          required
                          placeholder=" "
                          value={billingName}
                          onChange={(e) => setBillingName(e.target.value)}
                          className="peer w-full px-4 pt-5 pb-1.5 bg-transparent text-white font-sans font-light text-sm outline-none"
                        />
                        <label
                          htmlFor="checkout-field-name"
                          className="absolute left-4 top-1.5 text-[9px] font-mono tracking-[0.25em] uppercase text-zinc-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-zinc-600 peer-placeholder-shown:font-sans peer-placeholder-shown:tracking-normal peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:font-mono peer-focus:tracking-[0.25em] peer-focus:text-[#00f2ff] pointer-events-none"
                        >
                          Inhaber // Vollständiger Name
                        </label>
                      </div>

                      {/* Cryptographic Card Credential Pod: Floating Fields with 1px Soft Neon Glow */}
                      <div className="relative rounded-[12px] bg-white/[0.02] border border-white/[0.06] transition-all duration-300 focus-within:border-[#00f2ff]/80 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_20px_rgba(0,242,255,0.25)] overflow-hidden">
                        {/* Top Card Number Row with Floating Minimalist Label */}
                        <div className="px-4 pt-5 pb-1.5 relative border-b border-white/[0.04] flex items-center justify-between">
                          <div className="w-full">
                            <span className="absolute left-4 top-1.5 text-[9px] font-mono tracking-[0.25em] uppercase text-zinc-500">
                              KRYPTOGRAFISCHE KARTEN-SIGNATUR (STRIPE SECURE)
                            </span>
                            <div className="flex items-center gap-2 pt-0.5">
                              <CreditCard className="w-3.5 h-3.5 text-[#00f2ff]/80 shrink-0" />
                              <input
                                type="text"
                                disabled
                                value="•••• •••• •••• 4242 (Instant Stripe Sandbox)"
                                className="w-full bg-transparent text-white font-mono font-light text-xs tracking-wider outline-none cursor-default"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="text-[9px] font-mono text-[#00f2ff] px-2 py-0.5 rounded-full bg-white/[0.03] border border-[#00f2ff]/30 tracking-wider">
                              VERIFIED ✓
                            </span>
                          </div>
                        </div>

                        {/* Expiration & CVC Sub-fields */}
                        <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
                          <div className="px-4 pt-3.5 pb-2 relative">
                            <span className="text-[8px] font-mono tracking-[0.25em] uppercase text-zinc-500 block">
                              GÜLTIG BIS
                            </span>
                            <input
                              type="text"
                              disabled
                              value="12 / 29"
                              className="w-full bg-transparent text-white font-mono font-light text-xs outline-none cursor-default mt-0.5"
                            />
                          </div>
                          <div className="px-4 pt-3.5 pb-2 relative flex items-center justify-between">
                            <div>
                              <span className="text-[8px] font-mono tracking-[0.25em] uppercase text-zinc-500 block">
                                CVC TOKEN
                              </span>
                              <input
                                type="text"
                                disabled
                                value="•••"
                                className="w-16 bg-transparent text-white font-mono font-light text-xs outline-none cursor-default mt-0.5"
                              />
                            </div>
                            <Lock className="w-3.5 h-3.5 text-[#00f2ff]/60 shrink-0" />
                          </div>
                        </div>
                      </div>

                      {/* Micro Security & Network Notice */}
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                        <div className="flex items-center gap-1.5 font-light">
                          <span>DEUTSCHLAND</span>
                          <span>•</span>
                          <span>SEPA / VISA / MC</span>
                        </div>
                        <span className="text-[#00f2ff] font-light flex items-center gap-1 tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping" />
                          SOFORT-AKTIVIERUNG
                        </span>
                      </div>
                    </div>

                    {/* Subscription & Legal Notice in Translucent Glass */}
                    <div className="p-3 rounded-[12px] bg-white/[0.015] border border-white/[0.04] text-[11px] text-zinc-400 leading-relaxed font-sans font-light">
                      Mit Klick auf den Button startest du deine <strong>3-tägige Testphase für 0,00 €</strong>. 
                      Nach Ablauf der 3 Tage werden monatlich 29,00 € berechnet. 
                      Du kannst jederzeit mit 1 Klick in deinem Dashboard kündigen.
                    </div>

                    {/* BUTTON: Sleek, slim button with subtle pulse animation, gradient border (Electric Blue to Deep Purple), transparent background gaining glass-blur on hover */}
                    <div className="relative rounded-full p-[1px] bg-gradient-to-r from-[#00f2ff] via-[#6366f1] to-[#a855f7] animate-slim-pulse transition-all duration-300 group active:scale-[0.99]">
                      <button
                        type="submit"
                        disabled={isProcessingStripe}
                        className="relative w-full py-3.5 px-6 rounded-full bg-transparent hover:bg-white/[0.07] hover:backdrop-blur-xl text-white font-sans font-light tracking-[0.22em] text-xs sm:text-sm uppercase transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-[inset_0_0_20px_rgba(0,242,255,0.06)]"
                      >
                        {isProcessingStripe ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#00f2ff]" />
                            <span className="font-mono text-zinc-300 tracking-[0.2em] text-xs">SYNCHRONISIERUNG MIT SOVEREIGN CORE...</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff] animate-ping" />
                            <span>JETZT 3 TAGE TEST STARTEN • 0,00 € HEUTE</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#00f2ff] group-hover:translate-x-1.5 transition-transform duration-300" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Footer Security Badges: High Contrast, Thin Weight */}
                    <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 pt-1 font-mono font-light">
                      <span className="flex items-center gap-1 text-[#00f2ff]/80">
                        <ShieldCheck className="w-3 h-3 text-[#00f2ff]" />
                        256-BIT QUANTUM VERSCHLÜSSELUNG
                      </span>
                      <span>•</span>
                      <span>STRIPE KÄUFERSCHUTZ</span>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* CELEBRATION / SUCCESS RECEIPT SCREEN - DEEP OBSIDIAN & NEON PARTICLES */
              <div className="relative z-10 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
                <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-[#00f2ff]/40 text-[#00f2ff] mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.3)] animate-pulse">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-light font-mono text-[#00f2ff] tracking-[0.25em] uppercase">
                    TRANSAKTION ERFOLGREICH BESTÄTIGT // 2026 AI-OS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extralight text-white font-sans tracking-tight">
                    Willkommen im Sovereign AI Core Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto font-sans font-light">
                    Deine 3-tägige Testphase wurde aktiviert. Dein persönlicher Master-Passkey wurde im System registriert.
                  </p>
                </div>

                {/* Receipt Terminal Card in Deep Obsidian */}
                <div className="p-5 rounded-[14px] bg-white/[0.02] border border-white/[0.06] text-left space-y-3 font-mono shadow-[0_0_30px_rgba(0,242,255,0.08)]">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.04]">
                    <span className="text-zinc-500 font-light">PLAN:</span>
                    <span className="font-light text-white">8-Core Matrix Unlimited (29€/Mo)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.04]">
                    <span className="text-zinc-500 font-light">TRANSAKTIONS-ID:</span>
                    <span className="text-[#00f2ff] font-light">TX-SYN-2026-9821</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.04]">
                    <span className="text-zinc-500 font-light">STATUS:</span>
                    <span className="text-[#00f2ff] font-light flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping" />
                      AKTIVIERT (0,00 € BEZAHLT)
                    </span>
                  </div>

                  {/* Passkey Copy Box */}
                  <div className="pt-1">
                    <span className="text-[9px] text-zinc-500 font-light block mb-1 tracking-[0.2em]">
                      DEIN PERSÖNLICHER MASTER PASSKEY:
                    </span>
                    <div className="flex items-center justify-between p-3 rounded-[10px] bg-black/40 border border-[#00f2ff]/30 text-[#00f2ff] font-mono font-light text-sm tracking-wider shadow-[inset_0_0_12px_rgba(0,242,255,0.08)]">
                      <span>{generatedPasskey}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(generatedPasskey);
                          }
                        }}
                        className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[#00f2ff] text-xs font-mono font-light transition cursor-pointer border border-[#00f2ff]/30"
                      >
                        KOPIEREN
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sleek Gradient Launch Button */}
                <div className="relative rounded-full p-[1px] bg-gradient-to-r from-[#00f2ff] via-[#6366f1] to-[#a855f7] animate-slim-pulse transition-all duration-300 group active:scale-[0.99]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStripeModalOpen(false);
                      if (onCheckout) {
                        onCheckout();
                      }
                      if (onEnterApp) {
                        onEnterApp();
                      } else if (!onCheckout) {
                        window.location.reload();
                      }
                    }}
                    className="relative w-full py-3.5 px-6 rounded-full bg-transparent hover:bg-white/[0.07] hover:backdrop-blur-xl text-white font-sans font-light tracking-[0.22em] text-xs sm:text-sm uppercase transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-[inset_0_0_20px_rgba(0,242,255,0.06)]"
                  >
                    <span>SOFORT INS COMMAND DASHBOARD EINTRETEN</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00f2ff] group-hover:translate-x-1.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
