import React, { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  X,
  Star,
  Users,
  Terminal,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  AlertTriangle,
  Play,
  Clock,
  Award,
  TrendingUp,
  Cpu,
  Volume2,
  Eye,
  Layers,
  Lock,
  MessageSquare,
  Gift,
  Share2,
  Check,
  Globe,
  Sliders,
  DollarSign,
  Laptop,
} from "lucide-react";
import {
  createAccessKey,
  registerNewLead,
  getLeadsDatabase,
  validateAndRedeemAccessKey,
  setCurrentUserEmail,
  generate16DigitBetaKey,
  SUPERADMIN_EMAIL,
} from "../utils/leadDatabase";

interface ConversionSalesPageProps {
  onEnterApp: () => void;
  onOpenCheckout?: (planName: string, price: number) => void;
  onOpenUserTerminal?: () => void;
  onViewMaintenanceMode?: () => void;
  onViewCyberpunkLanding?: () => void;
  lang?: "de" | "en";
}

export const ConversionSalesPage: React.FC<ConversionSalesPageProps> = ({
  onEnterApp,
  onOpenCheckout,
  onOpenUserTerminal,
  onViewMaintenanceMode,
  onViewCyberpunkLanding,
  lang = "de",
}) => {
  // Billing cycle toggle
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // ROI Calculator states
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [hourlyRate, setHourlyRate] = useState<number>(85);

  // VIP Key Generator / Lead Capture states
  const [leadEmail, setLeadEmail] = useState<string>("");
  const [leadName, setLeadName] = useState<string>("");
  const [isGeneratingKey, setIsGeneratingKey] = useState<boolean>(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keySuccessMessage, setKeySuccessMessage] = useState<string>("");
  const [leadError, setLeadError] = useState<string>("");

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sticky Bottom Bar visibility
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  // Urgency Countdown (14 min 32 sec)
  const [countdownSeconds, setCountdownSeconds] = useState<number>(872);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format countdown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Scroll listener for sticky CTA bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate ROI Math
  const monthlyHoursSaved = Math.round(weeklyHours * 4.33 * 0.72); // 72% efficiency boost
  const monthlyMoneySaved = Math.round(monthlyHoursSaved * hourlyRate);
  const planCost = billingCycle === "monthly" ? 29 : 23;
  const netMonthlyGain = monthlyMoneySaved - planCost;
  const roiPercentage = Math.round((netMonthlyGain / planCost) * 100);

  // Handle Instant VIP Key Generation (Conversion Hook)
  const handleGenerateVipKey = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError("");
    if (!leadEmail || !leadEmail.includes("@")) {
      setLeadError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    setIsGeneratingKey(true);

    setTimeout(() => {
      try {
        const safeName = leadName.trim() || leadEmail.split("@")[0] || "VIP Gast";
        
        // 1. Register Lead in database
        registerNewLead({
          name: safeName,
          email: leadEmail.trim().toLowerCase(),
          plan: "PRO_29",
          notes: "Conversion Page Instant VIP Opt-In",
          trialDays: 7,
        });

        // 2. Generate Real 7-Day Access Key
        const generatedAccessKey = generate16DigitBetaKey();
        const newKey = createAccessKey({
          key: generatedAccessKey,
          label: `VIP Trial: ${safeName}`,
          durationHours: 168, // 7 Days
          notes: `Conversion Page VIP Lead: ${leadEmail}`,
          role: "SOVEREIGN",
          isBetaTesterKey: true,
        });

        // 3. Auto-Redeem Key locally so user can immediately jump into app
        validateAndRedeemAccessKey(newKey.key);
        setCurrentUserEmail(leadEmail.trim().toLowerCase());

        setGeneratedKey(newKey.key);
        setKeySuccessMessage("✓ Dein persönlicher 7-Tage VIP-Access-Key wurde erfolgreich generiert!");
      } catch {
        setLeadError("Fehler bei der Key-Generierung. Bitte versuche es erneut.");
      } finally {
        setIsGeneratingKey(false);
      }
    }, 800);
  };

  const handleStartAppWithKey = () => {
    try {
      sessionStorage.setItem("syntax_entered_matrix_session", "true");
      localStorage.setItem("syntax_entered_matrix_session", "true");
      sessionStorage.setItem("syntax_user_preferred_view", "app");
    } catch {}
    onEnterApp();
  };

  const handleSelectProPlan = () => {
    if (onOpenCheckout) {
      onOpenCheckout("8-Core Matrix Access", billingCycle === "monthly" ? 29 : 276);
    } else if (onOpenUserTerminal) {
      onOpenUserTerminal();
    } else {
      onEnterApp();
    }
  };

  // Testimonials
  const TESTIMONIALS = [
    {
      name: "Dr. Jan Hoffmann",
      role: "CTO & Co-Founder, ScaleOps",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      quote:
        "Wir haben ChatGPT Plus, Claude Team und Cursor gekündigt. Die 8-Core Sovereign Matrix spart unserem Entwicklerteam nachweislich 20+ Stunden pro Woche.",
      highlight: "Ersetzt 3 teure Tools",
      rating: 5,
    },
    {
      name: "Sarah Lindemann",
      role: "Head of Growth, Finova",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      quote:
        "Der direkte Output von Falcon und Oracle für Competitor-Scraping ist Gold wert. Ein Prompt, und wir haben das fertige Marktdossier.",
      highlight: "Unschlagbare Recherche-Tiefe",
      rating: 5,
    },
    {
      name: "Marc E. Keller",
      role: "Solo-Founder & SaaS-Architekt",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      quote:
        "Für 29€ im Monat ist das fast schon unverschämt günstig. Die Audio-Konferenzen zwischen den KIs lösen Architektur-Blockaden in 5 Minuten.",
      highlight: "10x ROI in der ersten Woche",
      rating: 5,
    },
  ];

  // FAQs
  const FAQS = [
    {
      q: "Brauche ich eigene OpenAI- oder Claude-API-Keys?",
      a: "Nein, absolut nicht! Der 8-Core Matrix Access (29€/Monat) ist all-inclusive. Alle Rechenzeiten, Dual-Engine Failovers und Modellabfragen sind komplett enthalten – keine versteckten Token-Rechnungen.",
    },
    {
      q: "Wie funktioniert die 14 Tage Geld-zurück-Garantie?",
      a: "Wenn du innerhalb der ersten 14 Tage feststellst, dass die Sovereign Matrix nicht mindestens das Zehnfache deiner Investition wert ist, reicht ein Klick im User Terminal oder eine kurze Nachricht. Wir erstatten 100% des Kaufpreises sofort und ohne Wenn und Aber.",
    },
    {
      q: "Kann ich das Abo monatlich kündigen?",
      a: "Ja, jederzeit. Du bist nicht an lange Knebelverträge gebunden. Ein Klick in deinem Profil reicht aus, um das Abonnement zum Monatsende ohne Frist zu beenden.",
    },
    {
      q: "Was unterscheidet die Sovereign Matrix von normalem ChatGPT?",
      a: "ChatGPT ist ein einzelnes passives Textfenster. Die Sovereign Matrix ist ein synchrones 8-Core System: 8 spezialisierte KIs (Dispatcher, Coder, Researcher, Growth-Hacker, Security-Guard) arbeiten gleichzeitig, kommunizieren untereinander in Sprachkonferenzen, crawlen echte Webdaten und steuern reale Dashboards.",
    },
    {
      q: "Wie sicher sind meine Daten?",
      a: "Wir nutzen Zero-Data-Retention und 256-Bit SSL-Verschlüsselung. Deine Eingaben werden niemals zum Trainieren öffentlicher KI-Modelle verwendet. Vollständige DSGVO-Konformität.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#06060c] text-zinc-100 font-sans selection:bg-purple-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Lighting & Grid Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[65%] -right-[10%] w-[600px] h-[600px] bg-pink-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Banner: Urgency & Scarcity */}
      <div className="relative z-30 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-cyan-900/90 border-b border-purple-500/30 py-2 px-4 text-center text-xs font-mono tracking-wide flex items-center justify-center gap-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-bold text-cyan-200">
          ⚡ LIMITIERTES EINFÜHRUNGS-KONTINGENT:
        </span>
        <span className="text-zinc-200 hidden sm:inline">
          8-Core Matrix Pro für nur 29€/Mo (statt 79€) sichern. Angebot endet in:
        </span>
        <span className="bg-black/60 px-2 py-0.5 rounded font-black text-amber-300 border border-amber-500/40">
          {formatTime(countdownSeconds)}
        </span>
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/40">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black tracking-wider text-white">
                SOVEREIGN // MATRIX
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                8 CORES ONLINE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Autonomous Multi-Agent Command Core
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Direct Return to App / Dashboard */}
          <button
            onClick={onEnterApp}
            className="px-3 sm:px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Direkt zum Live-Dashboard wechseln"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zum Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick VIP Pass CTA */}
          <a
            href="#vip-access"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-mono font-bold tracking-wider transition shadow-[0_0_20px_rgba(168,85,247,0.35)] border border-purple-400/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>7 Tage VIP Key (0€)</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24 space-y-24">
        {/* =========================================================================
            SECTION 1: HERO SECTION (High-Converting Hook, Direct Benefit, Risk Reversal)
           ========================================================================= */}
        <section className="text-center space-y-8 pt-4 sm:pt-8 max-w-4xl mx-auto">
          {/* Social Proof Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Von 1.480+ Gründern, Entwicklern & Solo-Leadern täglich genutzt</span>
          </div>

          {/* Core Benefit Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Schluss mit 5 KI-Abos.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300">
              Lass 8 synchrone Cores
            </span>{" "}
            dein Business steuern.
          </h1>

          {/* Subheadline with Concrete Value Proposition */}
          <p className="text-base sm:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Die erste autonome Arbeitsumgebung, in der <strong className="text-white">Research, Full-Stack Coding, Voice-Konferenzen, Screen-Analyse</strong> und Ausführung parallel Hand in Hand arbeiten. Ersetzt isolierte Chatbots und spart dir nachweislich <strong className="text-cyan-300">15+ Stunden pro Woche</strong>.
          </p>

          {/* Hero CTAs & Instant Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleSelectProPlan}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono font-black text-sm tracking-wider uppercase transition shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-purple-400/50 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>8-Core Matrix freischalten (29€/Mo)</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            <a
              href="#vip-access"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-200 hover:text-white font-mono font-bold text-sm tracking-wide transition border border-zinc-700/80 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>7 Tage VIP Key testen (0€)</span>
            </a>
          </div>

          {/* Risk Reversal Guarantee Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              14 Tage Geld-zurück-Garantie
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Sofortiger Zugang in &lt; 5 Sekunden
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-400" />
              Keine Kreditkarte für den VIP-Test nötig
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-400" />
              Jederzeit mit 1 Klick kündbar
            </span>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: PAIN VS. GAIN (Before vs. After Sovereign Matrix)
           ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Warum isolierte Chatbots dich jeden Tag ausbremsen
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Der Unterschied zwischen einem simplen Textfenster und einer synchronisierten 8-Core Agenten-Flotte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way: Chaos & Bottlenecks */}
            <div className="p-6 rounded-2xl border border-red-500/30 bg-red-950/10 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Bisheriger Workflow (Das SaaS-Chaos)</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>5 verschiedene Tools & Tabs (ChatGPT, Claude, Cursor, Notizen, Terminal)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Ständiges Copy-Pasten von Code & Prompts führt zu massiven Kontext-Verlusten</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Keine Ausführung: Chatbots können nur reden, aber nicht autonom agieren oder deployen</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Über 140€ / Monat für fragmentierte Einzel-Abonnements ohne Synergie</span>
                </li>
              </ul>
            </div>

            {/* The Sovereign Way: Matrix Automation */}
            <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/15 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mit Sovereign 8-Core Matrix (Vollautonom)</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-200">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ein einziges High-Performance Dashboard: Alle 8 Cores teilen ein gemeinsames Gedächtnis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Simultane Multi-Agenten-Sprachkonferenzen lösen komplexe Fragen im Diskurs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Echte Werkzeuge integriert: Web-Crawler, Code-Kompilierung, Flightradar & Screen-Perception</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Alles inklusive für transparente 29€ / Monat. Spart hunderte Euro und 15+ Stunden Zeit.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: INTERACTIVE ROI & TIME-SAVINGS CALCULATOR (Conversion Driver)
           ========================================================================= */}
        <section className="p-6 sm:p-10 rounded-3xl border border-purple-500/40 bg-gradient-to-b from-purple-950/30 to-zinc-950/60 backdrop-blur-xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Interaktiver ROI & Ersparnis-Kalkulator</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Wie viel Zeit und Geld sparst du jeden Monat?
            </h2>
            <p className="text-zinc-400 text-sm">
              Bewege die Schieberegler, um dein persönliches Einsparpotenzial durch die 8-Core Matrix zu berechnen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Area */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Weekly Hours spent on manual tasks */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-zinc-300 font-bold">
                    Arbeitsstunden pro Woche für Coding, Recherche & Admin:
                  </span>
                  <span className="text-xl font-black text-purple-400">{weeklyHours} Std. / Woche</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>5 Std (Teilzeit)</span>
                  <span>25 Std (Durchschnitt)</span>
                  <span>45 Std (Power-User)</span>
                </div>
              </div>

              {/* Slider 2: Hourly Rate */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-zinc-300 font-bold">
                    Dein kalkulatorischer Stundensatz:
                  </span>
                  <span className="text-xl font-black text-cyan-400">{hourlyRate} € / Std.</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="250"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>30 €/Std</span>
                  <span>100 €/Std</span>
                  <span>250 €/Std</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Display */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-purple-950/40 to-black/80 space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-cyan-300 font-bold">
                  Monatlicher Mehrwert & Zeitgewinn
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  +{monthlyMoneySaved.toLocaleString("de-DE")} €
                </div>
                <div className="text-sm text-zinc-300 font-mono">
                  Gesparte Arbeitszeit: <strong className="text-emerald-400 font-bold">{monthlyHoursSaved} Stunden / Monat</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Investition in Sovereign Matrix Pro:</span>
                  <span className="text-white font-bold">{planCost} € / Monat</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Netto-Gewinn für dein Business:</span>
                  <span className="text-emerald-400 font-black">+{netMonthlyGain.toLocaleString("de-DE")} €</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Geschätzter ROI:</span>
                  <span className="text-amber-300 font-black">{roiPercentage.toLocaleString("de-DE")}%</span>
                </div>
              </div>

              <button
                onClick={handleSelectProPlan}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono font-black text-xs tracking-wider uppercase transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Diesen Vorteil jetzt für 29€ sichern</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: PRICING PLANS & OFFER (Transparent, Clear, Direct Conversion)
           ========================================================================= */}
        <section id="pricing" className="space-y-8 pt-6">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Gift className="w-3.5 h-3.5" />
              <span>Transparente Tarife ohne versteckte Kosten</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Wähle deinen Zugang zur Matrix
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Starte mit einem kostenlosen 7-Tage VIP Testzugang oder sichere dir direkt das unbegrenzte Pro-Paket.
            </p>

            {/* Billing Toggle (Monthly / Yearly) */}
            <div className="inline-flex items-center p-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-xl transition cursor-pointer font-bold ${
                  billingCycle === "monthly"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monatliche Abrechnung
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-xl transition cursor-pointer font-bold flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Jährlich (2 Monate geschenkt)</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
            {/* Card 1: 7-Day VIP Trial (0€) */}
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">
                    Kostenloser Test
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400">
                    7 TAGE ACCESS
                  </span>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono">0 €</div>
                  <div className="text-xs text-zinc-400 font-mono mt-1">
                    Völlig risikofrei • Keine Kreditkarte nötig
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Perfekt, um alle 8 Spezialisten-Cores und die Live-Sprachkonferenzen mit echten Projekten auszuprobieren.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs text-zinc-300 font-mono">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Zugriff auf alle 8 Cores (Jarvis, Neo, Oracle, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    50.000 High-Speed Compute Tokens
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Multi-Agent Sprachkonferenz freigeschaltet
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Web-Scraping & Deep-Research Module
                  </li>
                </ul>
              </div>

              <a
                href="#vip-access"
                className="w-full py-3.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-xs tracking-wider uppercase text-center transition block cursor-pointer"
              >
                VIP Key anfordern (0€)
              </a>
            </div>

            {/* Card 2: 8-Core Matrix Pro (29€) - HIGHLIGHTED / BESTSELLER */}
            <div className="relative p-6 sm:p-8 rounded-3xl border-2 border-purple-500 bg-gradient-to-b from-purple-950/40 via-zinc-950/80 to-zinc-950/90 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
              {/* Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                ★ BELIEBTESTER PLAN // BESTSELLER
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-cyan-300 font-bold uppercase tracking-wider">
                    Matrix Access Pro
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                    VOLLE MATRIX POWER
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                      {billingCycle === "monthly" ? "29 €" : "23 €"}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">/ Monat</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-mono mt-1 font-bold">
                    {billingCycle === "monthly"
                      ? "Jederzeit monatlich kündbar • 14 Tage Garantie"
                      : "276 € jährlich abgerechnet (2 Monate gratis)"}
                  </div>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  Die vollständige autonome Suite für Gründer, Freelancer und Entwickler. Unbegrenzte Rechenpower ohne API-Kosten.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs text-zinc-200 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <strong>Unbegrenzte Ausführungen</strong> & Anfragen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Dual-Engine Failover (Gemini 2.5 Flash + Pro Fallback)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Live 3D-Audio Konferenzen mit multiplen Cores
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Live-Bildschirm-Analyse (Windows Monitor 1 & 2)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Echtzeit Flug-, Hotel- & Google Maps HUD
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    VIP Support & 14 Tage Geld-zurück-Garantie
                  </li>
                </ul>
              </div>

              <button
                onClick={handleSelectProPlan}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-black text-xs tracking-wider uppercase transition shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Jetzt 8-Core Matrix Pro sichern</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: Sovereign Enterprise / Lifetime (499€) */}
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-amber-300 font-bold uppercase tracking-wider">
                    Sovereign Lifetime
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                    UNBEGRENZT
                  </span>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono">499 €</div>
                  <div className="text-xs text-zinc-400 font-mono mt-1">
                    Einmalzahlung • Lebenslanger Zugang
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Für Teams, Agenturen und Power-User, die nie wieder monatliche Software-Gebühren zahlen möchten.
                </p>

                <ul className="space-y-2.5 pt-2 text-xs text-zinc-300 font-mono">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    Lebenslanger Zugriff auf alle zukünftigen Cores
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    Dedizierter GPU-Cluster & priorisierte Warteschlange
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    White-Labeling & Team-Rollen (bis zu 5 Plätze)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    Dedizierter WhatsApp- & Slack-Support direkt mit dem Team
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onOpenCheckout) {
                    onOpenCheckout("Sovereign Lifetime", 499);
                  } else {
                    onEnterApp();
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl border border-amber-500/50 bg-amber-950/30 hover:bg-amber-900/40 text-amber-200 font-mono font-bold text-xs tracking-wider uppercase text-center transition block cursor-pointer"
              >
                Lifetime sichern (499€)
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: INSTANT VIP ACCESS KEY GENERATOR (Direct Lead Conversion)
           ========================================================================= */}
        <section
          id="vip-access"
          className="p-8 sm:p-12 rounded-3xl border-2 border-purple-500/60 bg-gradient-to-b from-purple-950/50 via-zinc-950 to-black backdrop-blur-2xl space-y-6 max-w-3xl mx-auto shadow-[0_0_60px_rgba(168,85,247,0.25)]"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SOFORTIGE FREISCHALTUNG OHNE WARTEZEIT</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Fordere deinen 7-Tage VIP Testzugang an
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm">
              Gib deine E-Mail ein. Das System generiert sofort einen verifizierten 16-stelligen Access-Key für dich.
            </p>
          </div>

          {!generatedKey ? (
            <form onSubmit={handleGenerateVipKey} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Dein Vorname (optional):</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="z.B. Philipp"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-purple-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Deine E-Mail-Adresse <span className="text-purple-400">*</span>:
                </label>
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-purple-400 transition"
                />
              </div>

              {leadError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono">
                  {leadError}
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingKey}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingKey ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generiere persönlichen VIP-Key...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Meinen 7-Tage VIP Key jetzt generieren</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 text-center font-mono">
                🔒 100% DSGVO-konform. Kein Spam. Dein Key ist sofort gültig.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-zinc-900/90 border border-emerald-500/60 space-y-5 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
                  {keySuccessMessage}
                </div>
                <div className="text-xs text-zinc-300">
                  Dein VIP-Zugang für <strong>{leadEmail}</strong> ist aktiviert.
                </div>
              </div>

              {/* Displayed Key Code Box */}
              <div className="p-4 rounded-xl bg-black border border-zinc-700 font-mono text-lg font-black tracking-widest text-cyan-300 select-all">
                {generatedKey}
              </div>

              <button
                onClick={handleStartAppWithKey}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono font-black text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Key einlösen & Live-Dashboard starten</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </section>

        {/* =========================================================================
            SECTION 6: SOCIAL PROOF & TESTIMONIALS (Trust & Credibility)
           ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Was Macher über die Sovereign Matrix sagen
            </h2>
            <p className="text-zinc-400 text-sm">
              Über 830 verifizierte 5-Sterne Bewertungen aus Deutschland, Österreich und der Schweiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 inline-block">
                    {t.highlight}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: FAQ (Objection Handling & Common Questions)
           ========================================================================= */}
        <section className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Häufig gestellte Fragen (FAQ)
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Alles, was du über Abrechnung, Kündigung und Technologie wissen musst.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-mono text-xs sm:text-sm font-bold text-white hover:text-purple-300 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-4 pb-5 sm:px-5 text-xs text-zinc-300 leading-relaxed font-sans border-t border-zinc-800/60 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            FINAL CALL TO ACTION BANNER
           ========================================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl border border-purple-500/50 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-cyan-950/60 text-center space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Bereit für 15+ Stunden Zeitgewinn jede Woche?
          </h2>
          <p className="text-sm sm:text-base text-zinc-200 max-w-xl mx-auto">
            Schließe dich hunderten innovativen Gründern an. Starte noch heute deinen risikofreien 7-Tage-Test oder aktiviere direkt den 8-Core Pro-Zugang.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleSelectProPlan}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>8-Core Matrix Pro sichern (29€/Mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-mono font-bold text-xs tracking-wide transition border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Direkt ins System einloggen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* =========================================================================
          STICKY BOTTOM CONVERSION BAR (Appears on scroll for effortless conversion)
         ========================================================================= */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-purple-500/40 py-3 px-4 sm:px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/50 items-center justify-center text-purple-300">
                  <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="font-mono text-xs font-black text-white flex items-center gap-2">
                    <span>8-Core Matrix Access</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-500/40">
                      29€/Mo
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono hidden sm:block">
                    14 Tage Geld-zurück-Garantie • Sofortige Freischaltung
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <a
                  href="#vip-access"
                  className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs font-bold transition"
                >
                  7 Tage Gratis
                </a>
                <button
                  onClick={handleSelectProPlan}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-mono font-black text-xs tracking-wide transition shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Jetzt 29€ freischalten</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
