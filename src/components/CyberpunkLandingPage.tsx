import React, { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Mail,
  Video,
  Share2,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  CreditCard,
  X,
  Play,
  Check,
  Star,
  Users,
  Terminal,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Compass,
  Layers,
  Award,
  ThumbsUp,
  Sliders,
  Flame,
  Ticket,
  Timer,
  BadgeCheck,
  UserCheck,
  Network,
  Shield,
  ShieldAlert,
  Database,
  Crown,
  Scale,
  TrendingUp,
  Percent,
  ArrowLeftRight,
  Key,
  BarChart3,
  Activity,
  User,
  Eye,
  EyeOff,
  Palette,
  LogIn,
  LogOut,
} from "lucide-react";
import { AgentConfig } from "../types";
import { UserProfile } from "../rbac";
import { AgentCinematicShowcaseModal, AgentCinematicShowcaseInline } from "./AgentCinematicShowcaseModal";
import { MazeParticleBall } from "./MazeParticleBall";
import { ScrollReactiveParticleSphere } from "./ScrollReactiveParticleSphere";
import { HeroScrollParticleCanvas } from "./HeroScrollParticleCanvas";
import { AdminDatabaseModal } from "./AdminDatabaseModal";
import { KeyLoginModal } from "./KeyLoginModal";
import { DailyUsageDashboardModal } from "./DailyUsageDashboardModal";
import { UserAccountTerminalModal } from "./UserAccountTerminalModal";
import { TrialAccessNoticeModal } from "./TrialAccessNoticeModal";
import { HeaderAudioToggle } from "./HeaderAudioToggle";
import { InfiniteGridAbilityMenu, CoreAbilityItem } from "./InfiniteGridAbilityMenu";
import { SalePageLiveCapabilitiesShowcase } from "./SalePageLiveCapabilitiesShowcase";
import { SalePageIntegrationsEcosystem } from "./SalePageIntegrationsEcosystem";
import { useTheme } from "../utils/themeStore";
import {
  SUPERADMIN_EMAIL,
  isSuperAdminEmail,
  getLeadsDatabase,
  registerNewLead,
  checkEmailAccessStatus,
  checkUserTrialAccess,
  UserTrialStatusResult,
  getCurrentUserEmail,
  setCurrentUserEmail,
  isStoredAdminAuthenticated,
  setStoredAdminAuthenticated,
  LeadRecord,
  registerUserAccount,
  isEmailAlreadyRegistered,
  fetchSlotsStatus,
} from "../utils/leadDatabase";

interface CyberpunkLandingPageProps {
  onEnterApp: () => void;
  agents: AgentConfig[];
  userProfile: UserProfile;
  onUpgradeToPro: (tierName: string) => void;
  onOpenGmailInbox?: () => void;
  onOpenVeoVideoStudio?: () => void;
  onOpenAgentFleetStudio?: () => void;
  onViewMaintenanceMode?: () => void;
  lang?: "de" | "en";
  onToggleLang?: () => void;
}

// Simulated Live Sales & Registration Popups for High Conversion Social Proof with Slot Numbers
const RECENT_PURCHASES = [
  { name: "Julian M. (Growth Agency)", city: "Frankfurt", slot: "#14 / 500", plan: "AGENCY STUDIO (5 SEATS)", time: "vor 2 Min.", action: "sicherte 3 Tage Free Pre-Access (Slot #14)" },
  { name: "Lisa K. (Social Lead)", city: "Wien", slot: "#13 / 500", plan: "AGENCY STUDIO", time: "vor 4 Min.", action: "registriert für 3 Tage Free Pre-Access (Slot #13)" },
  { name: "Tim S. (Content Creator)", city: "Hamburg", slot: "#12 / 500", plan: "CREATOR PRO", time: "vor 7 Min.", action: "sicherte 3 Tage Free Pre-Access (Slot #12)" },
  { name: "Maximilian B. (Brand Director)", city: "Zürich", slot: "#11 / 500", plan: "ENTERPRISE WHITELABEL", time: "vor 11 Min.", action: "hat Slot #11 mit 3 Tagen Free Pre-Access reserviert" },
  { name: "Elena R. (Digital Marketing)", city: "Berlin", slot: "#10 / 500", plan: "AGENCY STUDIO", time: "vor 15 Min.", action: "sicherte Slot #10 für Open Beta Start" },
];

export const CyberpunkLandingPage: React.FC<CyberpunkLandingPageProps> = ({
  onEnterApp,
  agents,
  userProfile,
  onUpgradeToPro,
  onOpenGmailInbox,
  onOpenVeoVideoStudio,
  onOpenAgentFleetStudio,
  onViewMaintenanceMode,
  lang = "de",
  onToggleLang,
}) => {
  const { theme, setTheme, isModern, isCyberpunk } = useTheme();
  const [selectedAgentTab, setSelectedAgentTab] = useState<string>(agents[0]?.id || "syntax");
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  // --- 500 SPOTS SCARCITY (EXACTLY 490 FREE SPOTS / 10 CLAIMED) ---
  const TOTAL_SPOTS = 500;
  const [claimedSpots, setClaimedSpots] = useState<number>(10);
  const remainingSpots = TOTAL_SPOTS - claimedSpots; // Exactly 490 remaining
  const percentageClaimed = ((claimedSpots / TOTAL_SPOTS) * 100).toFixed(1);

  // Registration Form State with Mandatory Password Creation & Tier Choice + 3-Day Free Pre-Access
  const [leadName, setLeadName] = useState<string>("");
  const [leadEmail, setLeadEmail] = useState<string>("");
  const [leadPassword, setLeadPassword] = useState<string>("");
  const [leadConfirmPassword, setLeadConfirmPassword] = useState<string>("");
  const [showLeadPassword, setShowLeadPassword] = useState<boolean>(false);
  const [showLeadConfirmPassword, setShowLeadConfirmPassword] = useState<boolean>(false);
  const [regFormError, setRegFormError] = useState<string>("");
  const [selectedTierChoice, setSelectedTierChoice] = useState<"pro" | "enterprise">("pro");
  const [showPriceComparison, setShowPriceComparison] = useState<boolean>(true);
  const [leadGoal, setLeadGoal] = useState<string>("business");
  const [registrationModalOpen, setRegistrationModalOpen] = useState<boolean>(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [showVipPassModal, setShowVipPassModal] = useState<boolean>(false);
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    email: string;
    slot: number;
    plan: string;
    token: string;
    date: string;
    trialEnds: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem("maze_registered_vip_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 10-Minute Reservation Countdown Timer for Scarcity (09:48 -> 00:00)
  const [reservationSeconds, setReservationSeconds] = useState<number>(588);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [keyLoginModalOpen, setKeyLoginModalOpen] = useState<boolean>(false);
  const [openBetaGateModalOpen, setOpenBetaGateModalOpen] = useState<boolean>(false);
  const [dailyUsageModalOpen, setDailyUsageModalOpen] = useState<boolean>(false);
  const [userTerminalModalOpen, setUserTerminalModalOpen] = useState<boolean>(false);
  const [userTerminalInitialTab, setUserTerminalInitialTab] = useState<"overview" | "subscription" | "payment" | "invoices" | "security">("overview");
  const [accessNoticeModalOpen, setAccessNoticeModalOpen] = useState<boolean>(false);
  const [accessNoticeData, setAccessNoticeData] = useState<{ title: string; desc: string; isPending: boolean } | null>(null);
  const [trialNoticeModalOpen, setTrialNoticeModalOpen] = useState<boolean>(false);
  const [currentTrialStatus, setCurrentTrialStatus] = useState<UserTrialStatusResult | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setReservationSeconds((prev) => (prev > 0 ? prev - 1 : 599));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live synchronise 500-slot quota from server
  useEffect(() => {
    const syncSlots = async () => {
      try {
        const data = await fetchSlotsStatus();
        if (data && data.ok) {
          setClaimedSpots(data.occupiedCount);
        }
      } catch (e) {
        console.warn("Could not sync live slots status", e);
      }
    };
    syncSlots();
    const interval = setInterval(syncSlots, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Auto-rotation state for 360-degree Orbit Radar
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Agent Cinematic Showcase Modal state
  const [showCinematicModal, setShowCinematicModal] = useState<boolean>(false);
  const [cinematicAgentId, setCinematicAgentId] = useState<string>("syntax");

  // Live Notification Popup state
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState<number>(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(true);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Pricing Billing Cycle (Monthly / Yearly)
  const [pricingBillingCycle, setPricingBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // ROI Calculator States
  const [weeklyEmails, setWeeklyEmails] = useState<number>(45);
  const [monthlyVideos, setMonthlyVideos] = useState<number>(8);
  const [weeklyPosts, setWeeklyPosts] = useState<number>(15);

  // Sticky Push-Up CTA Bar state
  const [showStickyCta, setShowStickyCta] = useState<boolean>(false);
  const [isStickyDismissed, setIsStickyDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeAgent = agents.find((a) => a.id === selectedAgentTab) || agents[0];

  // Auto-cycle through Agent Radar Orbit
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setSelectedAgentTab((prevId) => {
        const currentIndex = agents.findIndex((ag) => ag.id === prevId);
        const nextIndex = (currentIndex + 1) % (agents.length || 1);
        return agents[nextIndex]?.id || "syntax";
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRotate, agents]);

  // Social Proof Popup Cycle
  useEffect(() => {
    const popupInterval = setInterval(() => {
      setShowNotificationPopup(false);
      setTimeout(() => {
        setCurrentNotificationIndex((prev) => (prev + 1) % RECENT_PURCHASES.length);
        setShowNotificationPopup(true);
      }, 600);
    }, 9000);
    return () => clearInterval(popupInterval);
  }, []);

  const currentPurchase = RECENT_PURCHASES[currentNotificationIndex];

  // Handle Free Registration / Lead Submission with Mandatory Password Creation (29€ or 99€ / month) + 1-Day Trial
  const handleRegisterAndClaimSpot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRegFormError("");

    const cleanName = leadName.trim() || (lang === "de" ? "Quantum Pioneer" : "Quantum Pioneer");
    const cleanEmail = leadEmail.trim().toLowerCase();
    const cleanPassword = leadPassword.trim();
    const cleanConfirmPassword = leadConfirmPassword.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      const err = lang === "de" ? "Bitte gib eine gültige E-Mail-Adresse ein!" : "Please enter a valid email address!";
      setRegFormError(err);
      alert(err);
      return;
    }

    if (cleanPassword.length < 6) {
      const err = lang === "de" ? "Bitte erstelle ein Passwort mit mindestens 6 Zeichen!" : "Please create a password with at least 6 characters!";
      setRegFormError(err);
      alert(err);
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      const err = lang === "de" ? "Die Passwörter stimmen nicht überein!" : "Passwords do not match!";
      setRegFormError(err);
      alert(err);
      return;
    }

    // 0. Pre-check if email already exists locally or in leads database
    const emailCheck = isEmailAlreadyRegistered(cleanEmail);
    if (emailCheck.exists) {
      const errMsg = emailCheck.message || (lang === "de"
        ? `⚠️ Diese E-Mail-Adresse (${cleanEmail}) ist bereits registriert! Bitte nutze den 'Anmelden'-Button, um dich mit deinem bestehenden Passwort einzuloggen.`
        : `⚠️ This email address (${cleanEmail}) is already registered! Please log in with your password.`);
      setRegFormError(errMsg);
      return;
    }

    setIsSubmittingLead(true);

    const planType = selectedTierChoice === "enterprise" ? "ENTERPRISE_99" : "PRO_29";
    const planLabel =
      selectedTierChoice === "enterprise"
        ? (lang === "de" ? "SOVEREIGN ENTERPRISE ($99 / Monat)" : "SOVEREIGN ENTERPRISE ($99 / mo)")
        : (lang === "de" ? "PRO SOVEREIGN CORE ($29 / Monat)" : "PRO SOVEREIGN CORE ($29 / mo)");

    const trialExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(
      lang === "de" ? "de-DE" : "en-US",
      { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }
    );

    try {
      // 1. Register secure account in backend & hash password for future login
      const regRes = await registerUserAccount({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        confirmPassword: cleanConfirmPassword,
        plan: planType,
        goal: leadGoal,
      });

      if (!regRes.ok) {
        const errMsg = regRes.message || (lang === "de"
          ? `⚠️ Diese E-Mail-Adresse (${cleanEmail}) ist bereits registriert! Bitte nutze den 'Anmelden'-Button, um dich mit deinem bestehenden Passwort einzuloggen.`
          : `⚠️ This email address (${cleanEmail}) is already registered! Please log in with your password.`);
        setRegFormError(errMsg);
        setIsSubmittingLead(false);
        return;
      }

      const assignedSlot = regRes.user?.slot || (claimedSpots + 1);
      setClaimedSpots((prev) => Math.min(TOTAL_SPOTS, prev + 1));
      const generatedToken = regRes.user?.token || `MZ-QUANTUM-2026-${Math.floor(1000 + Math.random() * 9000)}-${assignedSlot}`;

      // 2. Persist in Central Leads Database for Admin philippsteidle5@gmail.com
      registerNewLead({
        name: cleanName,
        email: cleanEmail,
        plan: planType,
        slot: assignedSlot,
        token: generatedToken,
        goal: leadGoal,
      });

      const newVip = {
        name: cleanName,
        email: cleanEmail,
        slot: assignedSlot,
        plan: planLabel,
        token: generatedToken,
        date: new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-US"),
        trialEnds: trialExpiration,
      };
      setRegisteredUser(newVip);
      setCurrentUserEmail(cleanEmail);
      try {
        localStorage.setItem("maze_registered_vip_user", JSON.stringify(newVip));
        localStorage.setItem("maze_current_user_email", cleanEmail);
      } catch (err) {
        console.warn("Could not persist VIP registration", err);
      }
      setIsSubmittingLead(false);
      setRegistrationModalOpen(false);
      setShowVipPassModal(true);
    } catch (err: any) {
      console.error("Registration error", err);
      setIsSubmittingLead(false);
      const errTxt = err?.message || (lang === "de" ? "Fehler bei der Registrierung." : "Registration error.");
      setRegFormError(errTxt);
    }
  };

  // Intercept Direct Dashboard Access to enforce Admin-Only Entry & Open Beta Candidate Gate
  const handleRequestDashboardAccess = async (targetAgentId?: string) => {
    // 1. If currently authenticated as Master Admin, open immediately
    if (isStoredAdminAuthenticated()) {
      onEnterApp();
      return;
    }

    const currentStoredEmail = getCurrentUserEmail();
    const activeEmail = (registeredUser?.email || (leadEmail.trim().length > 0 ? leadEmail.trim() : currentStoredEmail)).trim().toLowerCase();

    if (!activeEmail) {
      setRegistrationModalOpen(true);
      return;
    }

    // If superadmin email without session authentication, open admin login modal
    if (isSuperAdminEmail(activeEmail)) {
      setAdminModalOpen(true);
      return;
    }

    // For all other visitors, display the Open Beta Gate modal (Closed Alpha/Beta System Access)
    setOpenBetaGateModalOpen(true);
  };

  const handleApplyPromo = () => {
    if (promoCodeInput.trim().toUpperCase() === "EARLYBIRD72H" || promoCodeInput.trim().toUpperCase() === "SYNTAXPRO" || promoCodeInput.trim().toUpperCase() === "MAZEPRO") {
      setPromoApplied(true);
    } else {
      alert("Ungültiger Promo-Code. Versuche 'EARLYBIRD72H' oder 'SYNTAXPRO' für 72h Gratis-Zugang!");
    }
  };

  // ROI Calculations
  const hoursSavedPerMonth = Math.round(
    (weeklyEmails * 4 * 10) / 60 + (monthlyVideos * 180) / 60 + (weeklyPosts * 4 * 15) / 60
  );
  const moneyValueSaved = hoursSavedPerMonth * 45; // €45/h standard value

  return (
    <div
      id="landing-app-wrapper"
      className={`min-h-screen ${
        isModern ? "bg-[#080c16] text-slate-100" : "bg-black text-slate-100"
      } font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative`}
    >
      
      {/* Background Deep Ambient Glow & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] ${
          isModern
            ? "bg-gradient-to-b from-indigo-500/10 via-slate-600/5 to-transparent blur-[180px]"
            : "bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-[160px]"
        } rounded-full`} />
        <div className={`absolute bottom-0 right-0 w-[600px] h-[400px] ${
          isModern ? "bg-indigo-900/10" : "bg-blue-600/5"
        } blur-[160px] rounded-full`} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#08080c_1px,transparent_1px),linear-gradient(to_bottom,#08080c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Global Scroll-Reactive Particle Needle & Fleet Canvas (Tracks throughout the whole page) */}
      <HeroScrollParticleCanvas />

      {/* TOP COUNTDOWN & SCARCITY BANNER (URGENCY / HIGH CONVERSION) */}
      <div className={`${
        isModern
          ? "bg-slate-950/95 border-b border-slate-800 text-slate-300 shadow-sm"
          : "bg-gradient-to-r from-[#140008] via-[#0d0016] to-[#00121a] border-b border-rose-500/30 text-slate-200 shadow-[0_0_25px_rgba(244,63,94,0.25)]"
      } text-center py-2 px-4 font-mono text-xs flex flex-wrap items-center justify-center gap-2 relative z-50`}>
        <Flame className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-rose-400 animate-bounce"}`} />
        <span>
          <strong className={isModern ? "text-white font-bold" : "text-rose-300 font-bold"}>
            {lang === "de" ? "⚠️ OPEN BETA BATCH 1 (syntaxos.net):" : "⚠️ OPEN BETA BATCH 1 (syntaxos.net):"}
          </strong>{" "}
          {lang === "de"
            ? `Nur noch ${remainingSpots} von ${TOTAL_SPOTS} Plätzen für die Vorab-Phase verfügbar (${percentageClaimed}% vergeben)`
            : `Only ${remainingSpots} of ${TOTAL_SPOTS} spots remaining for the pre-release phase (${percentageClaimed}% claimed)`}
          {" — "}
          <span className={isModern ? "text-purple-300 font-bold" : "text-cyan-300 font-bold"}>
            {lang === "de" ? "Priority Code: " : "Priority Code: "}
            <span className={`${isModern ? "bg-purple-600 text-white" : "bg-cyan-400 text-slate-950"} px-1.5 py-0.5 rounded font-black`}>
              SYNTAX2026
            </span>
          </span>
        </span>
        <button
          onClick={() => setRegistrationModalOpen(true)}
          className={`ml-2 px-3.5 py-1 rounded-full ${
            isModern
              ? "bg-white hover:bg-slate-200 text-slate-950 font-bold shadow-sm"
              : "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black shadow-[0_0_12px_rgba(244,63,94,0.5)]"
          } transition text-[10.5px] uppercase cursor-pointer active:scale-95 flex items-center gap-1`}
        >
          <Ticket className="w-3 h-3 fill-current" />
          <span>{lang === "de" ? `OPEN BETA SLOT #${claimedSpots + 1} SICHERN` : `CLAIM BETA SLOT #${claimedSpots + 1}`}</span>
        </button>
      </div>

      {/* TOP HUD NAVIGATION BAR */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl ${
        isModern
          ? "bg-slate-950/85 border-b border-slate-800/80 shadow-lg"
          : "bg-black/90 border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
      } px-4 md:px-8 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${
            isModern 
              ? "bg-slate-900 border border-slate-700/80 shadow-md shadow-purple-950/20" 
              : "bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          } overflow-hidden flex items-center justify-center shrink-0`}>
            <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
              <MazeParticleBall size={32} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-display font-black text-base tracking-[2px] ${
                isModern ? "text-white" : "text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
              }`}>
                S.Y.N.T.A.X. OS
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                isModern
                  ? "bg-purple-500/15 border border-purple-500/30 text-purple-300"
                  : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isModern ? "bg-purple-400" : "bg-emerald-400 animate-ping"}`} />
                <span>OPEN BETA</span>
              </span>
            </div>
            <span className="text-[9.5px] font-mono text-slate-400 hidden sm:block">
              syntaxos.net • MULTI-AGENT QUANTUM OS
            </span>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden lg:flex items-center gap-5 font-mono text-xs text-slate-300">
          <a href="#abilities-3d" className={`transition cursor-pointer ${isModern ? "hover:text-purple-300 font-semibold" : "hover:text-cyan-300"}`}>
            {lang === "de" ? "3D FÄHIGKEITEN" : "3D ABILITIES"}
          </a>
          <a href="#live-capabilities" className={`transition cursor-pointer text-cyan-300 font-bold ${isModern ? "hover:text-purple-300" : "hover:text-cyan-200"}`}>
            {lang === "de" ? "⚡ LIVE-WORKFLOWS" : "⚡ LIVE WORKFLOWS"}
          </a>
          <a href="#features" className={`transition cursor-pointer ${isModern ? "hover:text-purple-300 font-semibold" : "hover:text-cyan-300"}`}>
            {lang === "de" ? "SYSTEM-POWER" : "SYSTEM POWER"}
          </a>
          <a href="#agents" className={`transition cursor-pointer ${isModern ? "hover:text-purple-300 font-semibold" : "hover:text-cyan-300"}`}>
            {lang === "de" ? "8 KI-AGENTEN" : "8 AI AGENTS"}
          </a>
          <a href="#integrations" className={`transition cursor-pointer text-purple-300 font-bold ${isModern ? "hover:text-purple-200" : "hover:text-purple-200"}`}>
            {lang === "de" ? "INTEGRATIONEN" : "INTEGRATIONS"}
          </a>
          <a href="#calculator" className={`transition cursor-pointer ${isModern ? "hover:text-purple-300 font-semibold" : "hover:text-cyan-300"}`}>
            {lang === "de" ? "ROI RECHNER" : "ROI CALCULATOR"}
          </a>
          <a href="#pricing" className={`transition cursor-pointer ${isModern ? "hover:text-purple-300 font-semibold" : "hover:text-cyan-300"}`}>
            {lang === "de" ? "PLÄNE & PREISE" : "PLANS & PRICING"}
          </a>
          <a href="#faq" className={`transition cursor-pointer ${isModern ? "hover:text-purple-300 font-semibold" : "hover:text-cyan-300"}`}>FAQ</a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* DIRECT SYSTEM OS ENTRY BUTTON */}
          <button
            type="button"
            onClick={onEnterApp}
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
            title={lang === "de" ? "Direkt in die Command-Zentrale / System-Workspace wechseln" : "Switch to System OS Command Workspace"}
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span className="font-black">{lang === "de" ? "ZUM SYSTEM" : "SYSTEM OS"}</span>
          </button>

          {/* WARTUNGS-ANSICHT TOGGLE BUTTON */}
          {onViewMaintenanceMode && (
            <button
              type="button"
              onClick={onViewMaintenanceMode}
              className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-100 border border-amber-500/40 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title={lang === "de" ? "Wartungs- & Pre-Launch Hub ansehen" : "View Maintenance & Pre-Launch Hub"}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">{lang === "de" ? "WARTUNG" : "MAINTENANCE"}</span>
            </button>
          )}

          {/* KEY LOGIN BUTTON (BETA KEYS & SOVEREIGN ACCESS KEYS) */}
          <button
            type="button"
            onClick={() => setKeyLoginModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isModern
                ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-sm"
                : "bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            }`}
            title="Key Login // Beta Key & Access Key einlösen"
          >
            <Key className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            <span className="font-bold">KEY LOGIN</span>
          </button>

          {/* ADMIN TOOL GATEWAY (SUPERADMIN) */}
          <button
            type="button"
            onClick={() => setAdminModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-950 text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-500 font-mono text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
            title="Admin Tool // Master Root Access"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          {/* USER ACCOUNT BUTTON (IF LOGGED IN) */}
          {((isStoredAdminAuthenticated() && getCurrentUserEmail()) || (registeredUser && registeredUser.email && !isSuperAdminEmail(registeredUser.email) && localStorage.getItem("syntax_user_logged_in_token")) || localStorage.getItem("syntax_user_logged_in_role") === "CLOSED_BETA_TESTER") && (
            <button
              type="button"
              onClick={() => {
                setUserTerminalInitialTab("overview");
                setUserTerminalModalOpen(true);
              }}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isModern
                  ? "bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-white border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              }`}
              title={lang === "de" ? "Benutzerkonto & Terminal öffnen" : "Open User Terminal & Billing"}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "de" ? "MEIN KONTO" : "MY ACCOUNT"}</span>
            </button>
          )}

          {/* OPEN BETA REGISTRATION CTA BUTTON */}
          <button
            type="button"
            onClick={() => setRegistrationModalOpen(true)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-sans font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition flex items-center gap-2 active:scale-95 ${
              isModern
                ? "bg-white hover:bg-slate-200 text-slate-950 shadow-md shadow-white/10"
                : "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] border border-cyan-300/80"
            }`}
          >
            <Zap className={`w-4 h-4 ${isModern ? "text-purple-600 fill-purple-600" : "text-slate-950 fill-slate-950"}`} />
            <span>{lang === "de" ? "OPEN BETA REGISTRIERUNG" : "JOIN OPEN BETA"}</span>
          </button>

          {/* THEME MODE SWITCHER PILL (MODERN SAAS VS CYBERPUNK HUD) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-[10.5px] shadow-sm">
            <button
              type="button"
              onClick={() => setTheme("syntax")}
              className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1.5 cursor-pointer ${
                isModern
                  ? "bg-zinc-100 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title={lang === "de" ? "Modernes, minimalistisches Enterprise SaaS Design" : "Modern, minimalist Enterprise SaaS Design"}
            >
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span className="hidden md:inline">MODERN</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("cyberpunk")}
              className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1.5 cursor-pointer ${
                isCyberpunk
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title={lang === "de" ? "Immersives Cyberpunk Quantum HUD Design" : "Immersive Cyberpunk Quantum HUD Design"}
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="hidden md:inline">CYBERPUNK</span>
            </button>
          </div>

          {/* Discrete Audio-Toggle im Header (Sound: ON/OFF) */}
          <HeaderAudioToggle isModern={isModern} />

          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs font-bold transition cursor-pointer"
              title={lang === "de" ? "Switch to English" : "Zu Deutsch wechseln"}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
        </div>
      </header>

      {/* HERO SECTION WITH 500 SPOTS SCARCITY & INLINE REGISTRATION FORM */}
      <section id="hero" className="snap-start scroll-snap-start relative z-10 pt-6 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-center flex flex-col items-center" style={{ scrollSnapAlign: "start" }}>
        
        {/* Top Spacer for 3D Quantum Particle Ball */}
        <div className="h-[175px] sm:h-[195px] w-full flex items-center justify-center pointer-events-none mb-2" />

        {/* Scarcity / Reservation Urgency Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#08020b] border border-rose-500/40 text-slate-200 font-mono text-xs mb-6 shadow-[0_0_25px_rgba(244,63,94,0.25)] animate-pulse relative z-20">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="font-bold text-rose-300">
            {lang === "de" ? "BATCH 1 LIMITIERUNG:" : "BATCH 1 LIMITATION:"}
          </span>
          <span className="text-white font-bold">
            {lang === "de"
              ? `Noch ${remainingSpots} von ${TOTAL_SPOTS} Plätzen frei`
              : `Only ${remainingSpots} of ${TOTAL_SPOTS} spots remaining`}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-amber-300 flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            <span>{lang === "de" ? "Reservierungsfenster schließt in: " : "Window closes in: "}<strong>{formatCountdown(reservationSeconds)}</strong></span>
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-5xl relative z-20">
          {lang === "de" ? "DAS KI-BETRIEBSSYSTEM DER NÄCHSTEN GENERATION" : "NEXT-GENERATION AI OPERATING SYSTEM"}
        </h1>

        <p className="mt-6 text-slate-300 text-base md:text-lg max-w-3xl leading-relaxed font-light relative z-20">
          <strong className="text-cyan-300 font-semibold">S.Y.N.T.A.X. OS (getsyntax.ai)</strong>{" "}
          {lang === "de"
            ? "vereint 8 autonom vernetzte KI-Spezialisten in einer hochmodernen Cyberpunk-Zentrale. Synchronisiere dein Real Gmail, erstelle kinoreife Veo 3.1 Videos, poste direkt auf Instagram & TikTok und steuere dein Business in Echtzeit per Sprachbefehl."
            : "combines 8 autonomously connected AI specialists in a cutting-edge cyberpunk command center. Sync your real Gmail, generate cinematic Veo 3.1 videos, post directly to Instagram & TikTok, and command your business in real-time via voice."}
        </p>

        {/* HERO CALL TO ACTION BUTTONS: CONDITIONAL FOR VISITORS VS AUTHENTICATED SESSIONS */}
        {!((isStoredAdminAuthenticated() && getCurrentUserEmail()) || (registeredUser && registeredUser.email && !isSuperAdminEmail(registeredUser.email) && localStorage.getItem("syntax_user_logged_in_token"))) ? (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 relative z-20">
            <button
              type="button"
              onClick={() => setRegistrationModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-sans font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-cyan-300/80 active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>{lang === "de" ? "🚀 BATCH 1 ZUGANG JETZT SICHERN" : "🚀 CLAIM BATCH 1 ACCESS"}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={() => setKeyLoginModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-cyan-400 font-mono text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95"
            >
              <Key className="w-4 h-4 text-cyan-400" />
              <span>{lang === "de" ? "🔑 BEREITS REGISTRIERT? LOGIN" : "🔑 ALREADY REGISTERED? SIGN IN"}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 relative z-20">
            <button
              type="button"
              onClick={() => {
                setUserTerminalInitialTab("overview");
                setUserTerminalModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/35 hover:to-cyan-500/35 text-emerald-300 border-2 border-emerald-400/80 font-mono text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>{lang === "de" ? "👤 USER TERMINAL & ZAHLUNG" : "👤 USER TERMINAL & BILLING"}</span>
            </button>

            <button
              type="button"
              onClick={() => setDailyUsageModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-95"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>{lang === "de" ? "Ø DAILY USAGE DASHBOARD" : "Ø DAILY USAGE DASHBOARD"}</span>
            </button>
          </div>
        )}

        {/* LOGGED IN USER ACCOUNT TERMINAL QUICK BAR (ONLY VISIBLE FOR AUTHENTICATED USER SESSIONS) */}
        {((isStoredAdminAuthenticated() && getCurrentUserEmail()) || (registeredUser && registeredUser.email && !isSuperAdminEmail(registeredUser.email) && localStorage.getItem("syntax_user_logged_in_token"))) && (
          <div className="w-full max-w-3xl mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#070e28] via-[#091338] to-[#04081c] border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm">{registeredUser?.name || "Sovereign Pioneer"}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    SLOT #{registeredUser?.slot || "488"} AKTIV
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {registeredUser?.email || getCurrentUserEmail()} • 8/8 Cores Live
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setUserTerminalInitialTab("payment");
                  setUserTerminalModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Zahlungsmethoden (PayPal, Kreditkarte, Klarna) verwalten"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Zahlung</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserTerminalInitialTab("subscription");
                  setUserTerminalModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Abo verwalten oder upgraden"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Abo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserTerminalInitialTab("overview");
                  setUserTerminalModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                <span>TERMINAL ÖFFNEN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("maze_registered_vip_user");
                  localStorage.removeItem("syntax_user_logged_in_token");
                  localStorage.removeItem("current_logged_in_email");
                  setStoredAdminAuthenticated(false);
                  setRegisteredUser(null);
                  window.location.reload();
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition cursor-pointer"
                title="Abmelden / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* HIGH CONVERSION 500-SPOTS REGISTRATION CARD (DIRECT HERO FUNNEL) */}
        <div id="hero-registration-card" className="mt-10 w-full max-w-2xl bg-gradient-to-b from-[#0c0c16] via-[#06060c] to-[#020205] border-2 border-cyan-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative overflow-hidden text-left font-mono z-20">
          
          {/* Subtle Ambient Background Watermark */}
          <div className="absolute top-0 right-0 p-6 text-cyan-500/10 pointer-events-none font-black text-7xl select-none">
            500
          </div>

          {/* Scarcity Progress Bar Header */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{lang === "de" ? "LIVE SERVER-KAPAZITÄT (BATCH 1)" : "LIVE SERVER CAPACITY (BATCH 1)"}</span>
              </span>
              <span className="text-rose-400 font-black">
                {claimedSpots} / {TOTAL_SPOTS} {lang === "de" ? "BELEGT" : "CLAIMED"} ({percentageClaimed}%)
              </span>
            </div>

            {/* Glowing Multi-step Progress bar */}
            <div className="w-full h-3.5 bg-slate-900/90 rounded-full border border-cyan-500/30 overflow-hidden p-0.5 relative shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.8)] relative"
                style={{ width: `${percentageClaimed}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>{lang === "de" ? "⚡ Sofortige Bereitstellung" : "⚡ Instant Provisioning"}</span>
              <span className="text-rose-300 font-bold">
                {lang === "de" ? `Nur noch ${remainingSpots} von 500 Plätzen verfügbar!` : `Only ${remainingSpots} of 500 spots available!`}
              </span>
            </div>
          </div>

          {/* Root Admin Direct Control Card ONLY IF AUTHENTICATED */}
          {isStoredAdminAuthenticated() && isSuperAdminEmail(getCurrentUserEmail()) ? (
            <div className="border border-emerald-500/50 bg-emerald-950/30 rounded-2xl p-5 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <div className="flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      👑 ROOT ADMINISTRATOR: philippsteidle5@gmail.com
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/25 text-emerald-300 border border-emerald-400/60">
                      UNBEGRENZTER VOLLZUGRIFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {lang === "de"
                      ? "Du bist als Administrator eingeloggt. Du kannst die Quantum OS Zentrale jederzeit sofort öffnen. Andere Nutzer müssen registriert sein und von dir freigeschaltet werden."
                      : "You are logged in as Root Admin. You can launch Quantum OS instantly anytime. Other users require registration and manual approval."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onEnterApp}
                  className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>COMMAND-ZENTRALE DIREKT ÖFFNEN →</span>
                </button>
                <button
                  onClick={() => setAdminModalOpen(true)}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Admin-Panel & Leads</span>
                </button>
              </div>
            </div>
          ) : (registeredUser && (!isSuperAdminEmail(registeredUser.email) || isStoredAdminAuthenticated())) ? (
            /* User already registered state */
            (() => {
              const liveStatus = checkEmailAccessStatus(registeredUser.email);
              const isApproved = liveStatus.hasAccess;
              return (
                <div className={`border rounded-2xl p-5 space-y-4 ${
                  isApproved 
                    ? "bg-emerald-950/30 border-emerald-500/40" 
                    : "bg-amber-950/30 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isApproved 
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-400" 
                        : "bg-amber-500/20 border-amber-400 text-amber-400"
                    }`}>
                      {isApproved ? <BadgeCheck className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {lang === "de" ? `SLOT #${registeredUser.slot} / 500 RESERVIERT` : `SLOT #${registeredUser.slot} / 500 RESERVED`}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isApproved 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" 
                            : "bg-amber-500/25 text-amber-300 border border-amber-400/60 animate-pulse"
                        }`}>
                          {isApproved ? "1 TAG TEST AKTIV" : "⏳ WARTET AUF ADMIN-FREIGABE"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {isApproved
                          ? (lang === "de"
                              ? `Willkommen, ${registeredUser.name}! Dein ${registeredUser.plan} Test ist freigeschaltet.`
                              : `Welcome, ${registeredUser.name}! Your ${registeredUser.plan} trial is active.`)
                          : (lang === "de"
                              ? `Registrierung übermittelt! Warte auf Freischaltung des 1-Tages-Testzugangs durch Admin philippsteidle5@gmail.com.`
                              : `Registration submitted! Waiting for 1-day trial approval by admin philippsteidle5@gmail.com.`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => handleRequestDashboardAccess()}
                      className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
                        isApproved
                          ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                          : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                      }`}
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{isApproved ? (lang === "de" ? "DIREKT ZUR COMMAND-ZENTRALE →" : "ENTER COMMAND DASHBOARD →") : (lang === "de" ? "STATUS PRÜFEN / FREISCHALTUNG TESTEN →" : "CHECK STATUS / LAUNCH →")}</span>
                    </button>
                    <button
                      onClick={() => setShowVipPassModal(true)}
                      className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{lang === "de" ? "VIP-Pass ansehen" : "View VIP Pass"}</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            /* Lead Capture Form */
            <form onSubmit={handleRegisterAndClaimSpot} className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase mb-2">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{lang === "de" ? "OPEN BETA PRE-ACCESS (3 TAGE 100% FREE)" : "OPEN BETA PRE-ACCESS (3 DAYS 100% FREE)"}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {lang === "de"
                    ? `SICHERE DIR JETZT 1 DER ${remainingSpots} PRE-ACCESS PLÄTZE`
                    : `CLAIM 1 OF THE ${remainingSpots} PRE-ACCESS SPOTS NOW`}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === "de"
                    ? "Trage dich jetzt für den Open Beta Pre-Access ein. Die ersten Nutzer erhalten 3 Tage vollen, unlimitierten Zugriff auf alle 8 KI-Agenten komplett kostenlos. Keine Kreditkarte oder Bezahlung erforderlich."
                    : "Register now for Open Beta Pre-Access. Early supporters get 3 days of full, unlimited access to all 8 AI agents 100% free. No credit card or payment required."}
                </p>
              </div>

              {/* MANDATORY PLAN CHOICE SELECTOR (PRO vs ENTERPRISE) */}
              <div className="space-y-2.5 pt-1">
                {/* Header with Title & Price Comparison Toggle Button */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>{lang === "de" ? "1. WÄHLE DEINE PRE-ACCESS STUFE:" : "1. CHOOSE YOUR PRE-ACCESS TIER:"}</span>
                    <span className="text-emerald-300 text-[10px] font-bold hidden sm:inline">
                      {lang === "de" ? "✨ 3 Tage Free Pre-Access geschenkt" : "✨ 3 Days Free Pre-Access Included"}
                    </span>
                  </label>

                  {/* High-Contrast Price Comparison Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPriceComparison(!showPriceComparison)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                      showPriceComparison
                        ? "bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                        : "bg-slate-900/90 border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {lang === "de"
                        ? (showPriceComparison ? "VERGLEICH AKTIV (PRO vs. ENTERPRISE)" : "FEATURE-VERGLEICH ANZEIGEN")
                        : (showPriceComparison ? "COMPARISON ACTIVE (PRO vs. ENTERPRISE)" : "SHOW FEATURE COMPARISON")}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${showPriceComparison ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                  </button>
                </div>

                {/* HIGH-CONTRAST PRICE COMPARISON & SAVINGS BREAKDOWN MODULE */}
                {showPriceComparison && (
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0a1128] via-[#060a1f] to-[#040614] border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.25)] space-y-3 animate-fadeIn">
                    
                    {/* Executive Savings Callout Header */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/80 via-[#0a1538] to-cyan-950/80 border border-purple-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300">
                          <TrendingUp className="w-4 h-4 text-amber-300 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-white font-bold flex items-center gap-2">
                            <span>{lang === "de" ? "👑 ENTERPRISE PRE-ACCESS VORTEIL" : "👑 ENTERPRISE PRE-ACCESS VALUE"}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/80 text-emerald-300 text-[9px] font-black uppercase">
                              {lang === "de" ? "3 TAGE 100% FREE" : "3 DAYS 100% FREE"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                            {lang === "de"
                              ? "5 Seats + Unbegrenzt 8K Video + VIP Dedicated GPU Cluster zum Beta-Start gratis testen"
                              : "5 Seats + Unlimited 8K Video + VIP Dedicated GPU Cluster free at beta launch"}
                          </p>
                        </div>
                      </div>

                      {/* Direct Cash Savings Highlight Badge */}
                      <div className="text-right shrink-0 bg-purple-950/90 px-3 py-1.5 rounded-xl border border-purple-400/80">
                        <div className="text-[9px] text-purple-300 uppercase font-bold">{lang === "de" ? "PRE-ACCESS:" : "PRE-ACCESS:"}</div>
                        <div className="text-sm font-black text-emerald-300">
                          0,00 €
                        </div>
                      </div>
                    </div>

                    {/* Side-by-Side Comparison Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      
                      {/* Left Comparison Option: PRO CORE */}
                      <div
                        onClick={() => setSelectedTierChoice("pro")}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                          selectedTierChoice === "pro"
                            ? "bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">PRO SOVEREIGN CORE</span>
                            <span className="text-[10.5px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                              0,00 €
                            </span>
                          </div>
                          
                          <div className="mt-2 text-[10px] text-slate-400 font-mono">
                            {lang === "de" ? "Pre-Access Dauer:" : "Pre-Access Duration:"} <strong className="text-emerald-300">3 Tage Full Access</strong>
                          </div>

                          <div className="w-full h-px bg-slate-800 my-2.5" />

                          <ul className="space-y-1.5 text-[10.5px] font-mono text-slate-300">
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{lang === "de" ? "1 Einzel-Account (1 Seat)" : "1 Single Account (1 Seat)"}</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{lang === "de" ? "Alle 8 KI-Agenten & Veo 3.1" : "All 8 AI Agents & Veo 3.1"}</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{lang === "de" ? "Gmail & Social Media Sync" : "Gmail & Social Media Sync"}</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{lang === "de" ? "Keine Zahlungsdaten nötig" : "No payment info needed"}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>3 Tage Free Pre-Access</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedTierChoice === "pro" ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                            {selectedTierChoice === "pro" ? "GEWÄHLT ✓" : "WÄHLEN"}
                          </span>
                        </div>
                      </div>

                      {/* Right Comparison Option: ENTERPRISE */}
                      <div
                        onClick={() => setSelectedTierChoice("enterprise")}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                          selectedTierChoice === "enterprise"
                            ? "bg-purple-950/60 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)] ring-1 ring-purple-400"
                            : "bg-slate-900/60 border-purple-500/40 hover:border-purple-400 opacity-85 hover:opacity-100"
                        }`}
                      >
                        {/* Top Best Value Banner */}
                        <div className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-purple-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                          {lang === "de" ? "👑 5 SEATS // 3 TAGE FREE" : "👑 5 SEATS // 3 DAYS FREE"}
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-purple-200">SOVEREIGN ENTERPRISE</span>
                            <span className="text-[10.5px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                              0,00 €
                            </span>
                          </div>

                          <div className="mt-2 text-[10px] font-mono flex items-center justify-between">
                            <span className="text-slate-400">{lang === "de" ? "Pre-Access Umfang:" : "Pre-Access Scope:"}</span>
                            <span className="text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              5 Seats • 3 Tage Free
                            </span>
                          </div>

                          <div className="w-full h-px bg-purple-500/30 my-2.5" />

                          <ul className="space-y-1.5 text-[10.5px] font-mono text-slate-200">
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <strong className="text-amber-300">{lang === "de" ? "5 Team-Seats inklusive" : "5 Team Seats included"}</strong>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <strong className="text-white">{lang === "de" ? "Unbegrenzte 8K Veo 3.1 Render-Flatrate" : "Unlimited 8K Veo 3.1 Render Flatrate"}</strong>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{lang === "de" ? "Dedizierter VIP GPU-Cluster" : "Dedicated VIP GPU Cluster"}</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{lang === "de" ? "Keine Zahlungsdaten nötig" : "No payment info needed"}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-3 pt-2 border-t border-purple-500/30 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>3 Tage Free Pre-Access</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedTierChoice === "enterprise" ? "bg-purple-400 text-slate-950" : "bg-purple-950 text-purple-300 border border-purple-500/40"}`}>
                            {selectedTierChoice === "enterprise" ? "GEWÄHLT ✓" : "WÄHLEN (ENTERPRISE)"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Summary Footer */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-cyan-300">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {selectedTierChoice === "enterprise"
                            ? (lang === "de" ? "✓ Enterprise Pre-Access gewählt (5 Seats, 3 Tage kostenlos zum Launch)." : "✓ Enterprise Pre-Access selected (5 Seats, 3 days free at launch).")
                            : (lang === "de" ? "✓ Pro Core Pre-Access gewählt (1 Seat, 3 Tage kostenlos zum Launch)." : "✓ Pro Core Pre-Access selected (1 Seat, 3 days free at launch).")}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold hidden sm:inline">3 Tage 0,00 € Free</span>
                    </div>

                  </div>
                )}

                {/* Standard Compact Tier Selector (if Comparison is collapsed) */}
                {!showPriceComparison && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Plan Option 1: PRO CORE */}
                    <div
                      onClick={() => setSelectedTierChoice("pro")}
                      className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative ${
                        selectedTierChoice === "pro"
                          ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">PRO CORE PRE-ACCESS</span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                          0,00 €
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === "de" ? "3 Tage kostenlos zum Launch" : "3 Days Free at Launch"}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {lang === "de"
                          ? "Alle 8 Agenten, Real Gmail Sync & Veo 3.1 Studio (100% gratis Pre-Access)"
                          : "All 8 Agents, Real Gmail Sync & Veo 3.1 (100% free Pre-Access)"}
                      </p>
                    </div>

                    {/* Plan Option 2: ENTERPRISE */}
                    <div
                      onClick={() => setSelectedTierChoice("enterprise")}
                      className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative ${
                        selectedTierChoice === "enterprise"
                          ? "bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-200">ENTERPRISE PRE-ACCESS</span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                          0,00 €
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === "de" ? "5 Seats • 3 Tage gratis" : "5 Seats • 3 Days Free"}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {lang === "de"
                          ? "VIP Server-Cluster, unbegrenzt Veo 3.1 & 5 Team-Seats (100% gratis Pre-Access)"
                          : "VIP Cluster, unlimited Veo 3.1 & 5 Team Seats (100% free Pre-Access)"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* User credentials (Name, Email & Mandatory Password) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {lang === "de" ? "DEIN NAME" : "YOUR NAME"}
                  </label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder={lang === "de" ? "z.B. Alex Müller" : "e.g. Alex Miller"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#030612] border border-cyan-500/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {lang === "de" ? "DEINE E-MAIL-ADRESSE" : "YOUR EMAIL ADDRESS"}
                  </label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => {
                      setLeadEmail(e.target.value);
                      if (regFormError) setRegFormError("");
                    }}
                    placeholder={lang === "de" ? "alex@business.com" : "alex@business.com"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#030612] border border-cyan-500/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                  {leadEmail.trim().includes("@") && isEmailAlreadyRegistered(leadEmail).exists && (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[10.5px] flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Diese E-Mail ist bereits eingetragen!</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setKeyLoginModalOpen(true)}
                        className="underline text-cyan-300 font-bold hover:text-white cursor-pointer ml-2"
                      >
                        Hier anmelden →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Creation & Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span>{lang === "de" ? "PASSWORT ERSTELLEN" : "CREATE PASSWORD"}</span>
                    </label>
                    <span className="text-[9.5px] text-slate-400">min. 6 Zeichen</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showLeadPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={leadPassword}
                      onChange={(e) => setLeadPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#030612] border border-cyan-500/30 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLeadPassword(!showLeadPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                    >
                      {showLeadPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span>{lang === "de" ? "PASSWORT BESTÄTIGEN" : "CONFIRM PASSWORD"}</span>
                    </label>
                    {leadPassword && leadConfirmPassword && (
                      <span className={`text-[9.5px] font-bold ${leadPassword === leadConfirmPassword ? "text-emerald-400" : "text-rose-400"}`}>
                        {leadPassword === leadConfirmPassword ? "✓ Stimmt überein" : "✗ Keine Übereinstimmung"}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showLeadPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={leadConfirmPassword}
                      onChange={(e) => setLeadConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#030612] border text-white placeholder-slate-600 text-xs focus:outline-none transition font-mono ${
                        leadPassword && leadConfirmPassword
                          ? (leadPassword === leadConfirmPassword ? "border-emerald-500/60 focus:border-emerald-400" : "border-rose-500/60 focus:border-rose-400")
                          : "border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {regFormError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-bold leading-relaxed">{regFormError}</span>
                  </div>
                  {regFormError.includes("bereits registriert") && (
                    <button
                      type="button"
                      onClick={() => setKeyLoginModalOpen(true)}
                      className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{lang === "de" ? "👉 Hier direkt mit Passwort anmelden" : "👉 Log in here with password"}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Focus Goal Selector */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-400 block mb-1.5">
                  {lang === "de" ? "DEIN HAUPTFOKUS FÜR S.Y.N.T.A.X. OS:" : "YOUR PRIMARY FOCUS FOR S.Y.N.T.A.X. OS:"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "business", label: lang === "de" ? "💼 Gmail & Sales" : "💼 Gmail & Sales" },
                    { id: "video", label: lang === "de" ? "🎬 Veo 3.1 Videos" : "🎬 Veo 3.1 Videos" },
                    { id: "social", label: lang === "de" ? "📱 TikTok / Insta" : "📱 TikTok / Insta" },
                    { id: "all", label: lang === "de" ? "⚡ 8-Agenten All-in-1" : "⚡ 8-Agent All-in-1" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLeadGoal(item.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition text-center cursor-pointer ${
                        leadGoal === item.id
                          ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-Access 100% Free Notice */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === "de" ? "100% KOSTENLOSER PRE-ACCESS (0,00 €):" : "100% FREE PRE-ACCESS ($0.00):"}</span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-snug font-sans">
                  {lang === "de"
                    ? "Keine Zahlungsdaten oder Kreditkarten nötig. Du sicherst dir mit der Eintragung 3 Tage vollen, kostenlosen Zugang zum Start der Open Beta."
                    : "No payment info or credit card needed. By registering, you secure 3 days of full free access when the Open Beta launches."}
                </p>
              </div>

              {/* High-Conversion Primary Registration Button */}
              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-cyan-200 active:scale-95 disabled:opacity-50"
              >
                {isSubmittingLead ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === "de" ? "RESERVIERE PRE-ACCESS..." : "RESERVING PRE-ACCESS..."}</span>
                  </div>
                ) : (
                  <>
                    <Ticket className="w-4 h-4 fill-slate-950" />
                    <span>
                      {lang === "de"
                        ? `FÜR PRE-ACCESS EINTRAGEN (3 TAGE FREE) • SLOT #${claimedSpots + 1} →`
                        : `REGISTER FOR PRE-ACCESS (3 DAYS FREE) • SLOT #${claimedSpots + 1} →`}
                    </span>
                  </>
                )}
              </button>

              {/* Micro-Trust & Social Proof Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[10.5px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === "de" ? "3 Tage 0,00 € Free" : "3 Days $0 Free"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{lang === "de" ? "Keine Kreditkarte" : "No Credit Card"}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 text-amber-300">
                  <Timer className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === "de" ? "Open Beta Zugang" : "Open Beta Access"}</span>
                </div>
              </div>

              {/* Direct Access Key & Account Quantum Login Helper */}
              <div className="pt-3 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={() => setKeyLoginModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
                >
                  <Key className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{lang === "de" ? "⚡ Bereits registriert oder Access-Key vorhanden? Hier Quantum Login öffnen →" : "⚡ Already registered or have an Access Key? Open Quantum Login →"}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Live Metrics Row */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl font-mono text-left relative z-20">
          <div className={`p-4 rounded-2xl ${
            isModern 
              ? "bg-slate-900/80 border border-slate-800 shadow-md" 
              : "bg-[#06060c] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          }`}>
            <div className={`text-2xl font-black ${isModern ? "text-white" : "text-cyan-300"}`}>500 ONLY</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {lang === "de" ? "STRIKT LIMITIERTE SLOTS" : "STRICTLY LIMITED SLOTS"}
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${
            isModern 
              ? "bg-slate-900/80 border border-slate-800 shadow-md" 
              : "bg-[#06060c] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          }`}>
            <div className={`text-2xl font-black ${isModern ? "text-purple-400" : "text-purple-300"}`}>&lt; 85 ms</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {lang === "de" ? "QUANTUM SPRACH-LATENZ" : "QUANTUM VOICE LATENCY"}
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${
            isModern 
              ? "bg-slate-900/80 border border-slate-800 shadow-md" 
              : "bg-[#06060c] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          }`}>
            <div className={`text-2xl font-black ${isModern ? "text-emerald-400" : "text-emerald-300"}`}>8 CORES</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {lang === "de" ? "KI-AGENTEN NETWORK" : "AI AGENT NETWORK"}
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${
            isModern 
              ? "bg-slate-900/80 border border-slate-800 shadow-md" 
              : "bg-[#06060c] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          }`}>
            <div className={`text-2xl font-black ${isModern ? "text-slate-200" : "text-amber-300"}`}>4096-BIT</div>
            <div className="text-[11px] text-slate-400 mt-1">END-TO-END ENCRYPTION</div>
          </div>
        </div>
      </section>

      {/* 3D CORE ABILITY SPHERE & INTERACTIVE MENU (ALL 8 CORE CAPABILITIES) */}
      <section id="abilities-3d" className={`snap-start scroll-snap-start relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto border-t ${
        isModern ? "border-slate-800" : "border-cyan-500/20"
      }`} style={{ scrollSnapAlign: "start" }}>
        <InfiniteGridAbilityMenu
          lang={lang}
          onSelectAbility={(ability) => {
            handleRequestDashboardAccess(ability.agentId);
          }}
        />
      </section>

      {/* CORE FEATURES GRID - ENHANCED WITH CONCRETE CAPABILITIES */}
      <section id="features" className={`snap-start scroll-snap-start relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto border-t ${
        isModern ? "border-slate-800" : "border-cyan-500/20"
      }`} style={{ scrollSnapAlign: "start" }}>
        <div className="text-center mb-12 space-y-2">
          <span className={`font-mono text-xs uppercase tracking-widest font-bold ${
            isModern ? "text-purple-400" : "text-cyan-400"
          }`}>FEATURING 9-CORE ARCHITECTURE</span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
            {lang === "de" ? "ALLE TOOLS FÜR DEIN SKALIERBARES DIGITALES BUSINESS" : "ALL TOOLS FOR YOUR SCALABLE DIGITAL BUSINESS"}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-2xl mx-auto">
            {lang === "de"
              ? "Kein Baukasten, sondern 9 vollautonome Cores mit echten Schnittstellen, Terminal-Ausführung und 4K Video-Pipeline."
              : "Not a toy prompt, but 9 fully autonomous cores with live APIs, shell execution, and 4K video rendering."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Gmail & Google Workspace Sync */}
          <div className={`p-6 rounded-2xl transition duration-300 shadow-xl relative group flex flex-col justify-between ${
            isModern
              ? "bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
              : "bg-[#070b1a] border border-cyan-500/30 hover:border-cyan-400"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition ${
                  isModern
                    ? "bg-slate-800 border border-slate-700 text-purple-400"
                    : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  OAUTH2 VERIFIED
                </span>
              </div>
              <h3 className={`font-mono text-base font-bold ${isModern ? "text-white font-sans font-bold" : "text-cyan-200"}`}>
                REAL GMAIL & WORKSPACE MATRIX
              </h3>
              <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                {lang === "de"
                  ? "Verknüpfe dein echtes Google Konto per OAuth2. S.Y.N.T.A.X. liest, priorisiert und beantwortet E-Mails automatisch in Deinem persönlichen Schreibstil."
                  : "Connect your real Google account via OAuth2. S.Y.N.T.A.X. reads, prioritizes, and replies to emails automatically in your personal writing style."}
              </p>

              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>VIP Lead-Erkennung & Priorisierung</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>1-Klick Antwort-Entwürfe im Browser</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Google Calendar Terminabgleich</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-cyan-400">
              ⚡ Hermes Core Active
            </div>
          </div>

          {/* Card 2: Veo 3.1 AI Video Studio */}
          <div className={`p-6 rounded-2xl transition duration-300 shadow-xl relative group flex flex-col justify-between ${
            isModern
              ? "bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
              : "bg-[#070b1a] border border-purple-500/30 hover:border-purple-400"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition ${
                  isModern
                    ? "bg-slate-800 border border-slate-700 text-purple-400"
                    : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                }`}>
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  8K 60FPS ENGINE
                </span>
              </div>
              <h3 className={`font-mono text-base font-bold ${isModern ? "text-white font-sans font-bold" : "text-purple-200"}`}>
                VEO 3.1 AI VIDEO SYNTHESIZER
              </h3>
              <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                {lang === "de"
                  ? "Generiere aus Textprompts oder Fotos kinoreife 8K MP4 Video-Animationen im 16:9 Cinema- und 9:16 Smartphone-Format für virale Kampagnen."
                  : "Generate cinematic 8K MP4 video animations from text prompts or photos in 16:9 cinema and 9:16 vertical formats for viral campaigns."}
              </p>

              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Automatische Storyboard & Script Pipeline</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Drohne, FPV-Orbit & Macro Kamera-Regie</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Direkter MP4 Export & Social Download</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-purple-400">
              ⚡ Veo 3.1 Core Active
            </div>
          </div>

          {/* Card 3: Claude Code Terminal & Dev Studio */}
          <div className={`p-6 rounded-2xl transition duration-300 shadow-xl relative group flex flex-col justify-between ${
            isModern
              ? "bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
              : "bg-[#070b1a] border border-emerald-500/30 hover:border-emerald-400"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition ${
                  isModern
                    ? "bg-slate-800 border border-slate-700 text-emerald-400"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                }`}>
                  <Terminal className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  BASH & DOCKER IDE
                </span>
              </div>
              <h3 className={`font-mono text-base font-bold ${isModern ? "text-white font-sans font-bold" : "text-emerald-200"}`}>
                CLAUDE CODE LIVE TERMINAL
              </h3>
              <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                {lang === "de"
                  ? "Vollwertige Entwicklungsumgebung: Echte Shell-Befehle, Git-Commits, API-Routen, automatische Fehlersuche und sofortiger Live-Code-Vorschau."
                  : "Full development environment: Real shell commands, git commits, API routes, automated debugging, and instant live code preview."}
              </p>

              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>React, Node, Python & TypeScript Support</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Automatische Bug-Fixes & Test-Suites</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero-Lag Latenz (&lt; 45ms Ausführung)</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
              ⚡ Claude Code Core Active
            </div>
          </div>

          {/* Card 4: TikTok & IG Studio */}
          <div className={`p-6 rounded-2xl transition duration-300 shadow-xl relative group flex flex-col justify-between ${
            isModern
              ? "bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
              : "bg-[#070b1a] border border-pink-500/30 hover:border-pink-400"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition ${
                  isModern
                    ? "bg-slate-800 border border-slate-700 text-pink-400"
                    : "bg-pink-500/10 border border-pink-500/30 text-pink-400"
                }`}>
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  VIRALITY GAUGE
                </span>
              </div>
              <h3 className={`font-mono text-base font-bold ${isModern ? "text-white font-sans font-bold" : "text-pink-200"}`}>
                TIKTOK & INSTAGRAM STUDIO
              </h3>
              <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                {lang === "de"
                  ? "All-In-One Social Media Management: Virality Score Berechnungen (0-100), KI-Captions, Hashtag-Optimierung und direkter Multi-Plattform Upload."
                  : "All-In-One Social Media Management: Virality Score calculations, AI captions, hashtag optimization, and direct multi-platform upload."}
              </p>

              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Viral Hook Generator mit Retention-Trigger</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Automatische Hashtag & Sound-Trends</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Post-Planer für TikTok, IG & YouTube Shorts</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-pink-400">
              ⚡ Echo Social Core Active
            </div>
          </div>

          {/* Card 5: Quantum Voice Engine */}
          <div className={`p-6 rounded-2xl transition duration-300 shadow-xl relative group flex flex-col justify-between ${
            isModern
              ? "bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
              : "bg-[#070b1a] border border-blue-500/30 hover:border-blue-400"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition ${
                  isModern
                    ? "bg-slate-800 border border-slate-700 text-blue-400"
                    : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                }`}>
                  <Radio className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  &lt; 85MS AUDIO
                </span>
              </div>
              <h3 className={`font-mono text-base font-bold ${isModern ? "text-white font-sans font-bold" : "text-blue-200"}`}>
                QUANTUM VOICE & NEURAL SPEECH
              </h3>
              <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                {lang === "de"
                  ? "Echtzeit-Sprachsteuerung ohne spürbare Verzögerung. Sprich direkt mit den 8 Agenten und erhalte sofortige akustische Antworten in kristallklarem Ton."
                  : "Real-time voice control with sub-85ms latency. Converse naturally with the 8 agents and receive acoustic replies with crystal-clear fidelity."}
              </p>

              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Natürliche deutsche & englische Stimmen</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Unterbrechbar wie ein echtes Gespräch</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Hands-Free Diktier- & Steuerungsmodus</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-blue-400">
              ⚡ Voice Engine Active
            </div>
          </div>

          {/* Card 6: Quantum Security & Bank-Grade Cipher */}
          <div className={`p-6 rounded-2xl transition duration-300 shadow-xl relative group flex flex-col justify-between ${
            isModern
              ? "bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
              : "bg-[#070b1a] border border-teal-500/30 hover:border-teal-400"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition ${
                  isModern
                    ? "bg-slate-800 border border-slate-700 text-teal-400"
                    : "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  AES-4096 / SOVEREIGN
                </span>
              </div>
              <h3 className={`font-mono text-base font-bold ${isModern ? "text-white font-sans font-bold" : "text-teal-200"}`}>
                {lang === "de" ? "DATENSCHUTZ & CUSTOM KEYS" : "PRIVACY & CUSTOM API KEYS"}
              </h3>
              <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                {lang === "de"
                  ? "Hinterlege auf Wunsch deine eigenen Gemini API-Keys für unbegrenzte Quoten. Deine Daten bleiben strikt lokal verschlüsselt und werden nicht für KI-Training genutzt."
                  : "Optionally plug in your own Gemini API keys for zero rate-limits. Your data stays locally encrypted and is never used to train third-party models."}
              </p>

              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-slate-300 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Keine Token-Drosselung (0 Rate-Limits)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Ende-zu-Ende verschlüsselte Datenspeicherung</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Aegis Sicherheits- & Schwachstellen-Auditor</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-teal-400">
              ⚡ Aegis Security Active
            </div>
          </div>

        </div>
      </section>

      {/* LIVE CAPABILITIES & WORKFLOW PLAYGROUND - SHOWS WHAT S.Y.N.T.A.X. ACTUALLY DOES */}
      <section id="live-capabilities" className={`snap-start scroll-snap-start relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto border-t ${
        isModern ? "border-slate-800" : "border-cyan-500/20"
      }`} style={{ scrollSnapAlign: "start" }}>
        <SalePageLiveCapabilitiesShowcase
          lang={lang}
          onRegisterClick={() => {
            const el = document.getElementById("hero-registration-card");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      {/* 8 AGENTS 3D ORBIT SHOWCASE */}
      <section id="agents" className={`snap-start scroll-snap-start relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto border-t ${
        isModern ? "border-zinc-800" : "border-cyan-500/20"
      }`} style={{ scrollSnapAlign: "start" }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold mb-3">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{lang === "de" ? "8 AUTONOME KI-SPEZIALISTEN" : "8 AUTONOMOUS AI SPECIALISTS"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white">
            {lang === "de" ? "DEIN PERSÖNLICHES EXPERTEN-TEAM" : "YOUR PERSONAL EXPERT FLEET"}
          </h2>
          <p className="text-slate-300 font-sans text-xs sm:text-sm max-w-2xl mx-auto mt-2 leading-relaxed">
            {lang === "de"
              ? "Erlebe die 8 spezialisierten Agenten für Orchestrierung, Code, Video, Social Media, Security und Finanzen im interaktiven 3D Orbit."
              : "Explore the 8 specialized agents for orchestration, coding, video synthesis, social media, cybersecurity, and finance in the interactive 3D Orbit."}
          </p>
        </div>

        {/* 3D Orbit Interactive Constellation Showcase */}
        <AgentCinematicShowcaseInline
          agents={agents}
          lang={lang}
          onSelectAgentAndStart={(agentId) => handleRequestDashboardAccess(agentId)}
          onOpenUpgradeModal={(tier) => onUpgradeToPro(tier)}
        />
      </section>

      {/* ROI & TIME SAVED CALCULATOR (HIGH CONVERSION INTERACTIVE SECTION - IMAGE 1 DESIGN) */}
      <section id="calculator" className={`snap-start scroll-snap-start relative z-10 py-20 px-4 md:px-8 max-w-6xl mx-auto border-t ${
        isModern ? "border-slate-800" : "border-cyan-500/20"
      }`} style={{ scrollSnapAlign: "start" }}>
        <div className="text-center mb-10">
          <span className={`font-mono text-xs uppercase tracking-[3px] font-bold block mb-2 ${
            isModern ? "text-purple-400" : "text-cyan-400"
          }`}>
            {lang === "de" ? "CAPABILITY COMPARISON & ROI" : "CAPABILITY COMPARISON"}
          </span>
          <h2 className={`font-display text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight ${
            isModern ? "font-sans" : "drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]"
          }`}>
            {lang === "de" ? "WIE VIEL ZEIT SPART DIR S.Y.N.T.A.X. JEDEN MONAT?" : "HOW MUCH TIME DOES S.Y.N.T.A.X. SAVE YOU EACH MONTH?"}
          </h2>
          <p className="text-slate-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto mt-3 leading-relaxed">
            {lang === "de"
              ? "Passe die Regler an deine aktuellen Aufgaben an und vergleiche manuellen Aufwand mit S.Y.N.T.A.X. Automation."
              : "Adjust the sliders to your current tasks and compare manual effort with S.Y.N.T.A.X. automation."}
          </p>
        </div>

        {/* Frosted Container */}
        <div className={`relative rounded-3xl p-6 sm:p-8 md:p-10 font-mono overflow-hidden ${
          isModern
            ? "bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl"
            : "bg-[#060c22]/90 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_70px_rgba(6,182,212,0.18)]"
        }`}>
          
          {/* Subtle Ambient Glow Orbs behind card */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Grid of Sliders and Result Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Side: Sliders */}
            <div className="space-y-7">
              
              {/* Emails Slider */}
              <div className={`space-y-2.5 p-4 rounded-2xl transition ${
                isModern
                  ? "bg-slate-950/70 border border-slate-800 hover:border-slate-700"
                  : "bg-black/40 border border-cyan-500/20 hover:border-cyan-500/40"
              }`}>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-300 font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isModern ? "bg-purple-400" : "bg-cyan-400"}`} />
                    {lang === "de" ? "E-Mails pro Woche:" : "Emails per week:"}
                  </span>
                  <span className={`text-sm px-2.5 py-0.5 rounded-lg font-black ${
                    isModern
                      ? "bg-slate-800 border border-slate-700 text-purple-300"
                      : "text-cyan-300 bg-cyan-500/15 border border-cyan-400/40"
                  }`}>
                    {weeklyEmails} {lang === "de" ? "Stk." : "pcs."}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={weeklyEmails}
                  onChange={(e) => setWeeklyEmails(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>10 {lang === "de" ? "Mails" : "Mails"}</span>
                  <span>100 {lang === "de" ? "Mails" : "Mails"}</span>
                  <span>200 {lang === "de" ? "Mails" : "Mails"}</span>
                </div>
              </div>

              {/* Videos Slider */}
              <div className={`space-y-2.5 p-4 rounded-2xl transition ${
                isModern
                  ? "bg-slate-950/70 border border-slate-800 hover:border-slate-700"
                  : "bg-black/40 border border-purple-500/20 hover:border-purple-500/40"
              }`}>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-300 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    {lang === "de" ? "Veo 3.1 KI Videos / Monat:" : "Veo 3.1 AI Videos / month:"}
                  </span>
                  <span className={`text-sm px-2.5 py-0.5 rounded-lg font-black ${
                    isModern
                      ? "bg-slate-800 border border-slate-700 text-purple-300"
                      : "text-purple-300 bg-purple-500/15 border border-purple-400/40"
                  }`}>
                    {monthlyVideos} Videos
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={monthlyVideos}
                  onChange={(e) => setMonthlyVideos(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 Video</span>
                  <span>15 Videos</span>
                  <span>30 Videos</span>
                </div>
              </div>

              {/* Posts Slider */}
              <div className={`space-y-2.5 p-4 rounded-2xl transition ${
                isModern
                  ? "bg-slate-950/70 border border-slate-800 hover:border-slate-700"
                  : "bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40"
              }`}>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-300 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {lang === "de" ? "Social Posts / Woche:" : "Social Posts / week:"}
                  </span>
                  <span className={`text-sm px-2.5 py-0.5 rounded-lg font-black ${
                    isModern
                      ? "bg-slate-800 border border-slate-700 text-emerald-400"
                      : "text-emerald-300 bg-emerald-500/15 border border-emerald-400/40"
                  }`}>
                    {weeklyPosts} Posts
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={weeklyPosts}
                  onChange={(e) => setWeeklyPosts(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>2 Posts</span>
                  <span>25 Posts</span>
                  <span>50 Posts</span>
                </div>
              </div>

            </div>

            {/* Right Side: Estimated Time Saved Inner Card */}
            <div className={`p-6 sm:p-8 rounded-2xl text-center space-y-5 relative overflow-hidden ${
              isModern
                ? "bg-slate-950 border border-slate-800 shadow-xl"
                : "bg-[#030717]/95 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.25)]"
            }`}>
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400" />

              <span className={`text-xs sm:text-sm font-bold tracking-widest block uppercase ${
                isModern ? "text-purple-400" : "text-cyan-400"
              }`}>
                {lang === "de" ? "GESCHÄTZTE ZEITERSPARNIS" : "ESTIMATED TIME SAVED"}
              </span>

              <div className={`text-4xl sm:text-6xl font-black ${
                isModern
                  ? "text-white"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-emerald-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              }`}>
                ~{hoursSavedPerMonth} {lang === "de" ? "Std." : "hrs"}
                <span className="text-xs sm:text-sm text-slate-400 font-normal block mt-1">
                  {lang === "de" ? "pro Monat mit S.Y.N.T.A.X. Automation" : "/ month with S.Y.N.T.A.X. automation"}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                isModern
                  ? "bg-slate-900 border border-slate-800 text-slate-300"
                  : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-200"
              }`}>
                💰 {lang === "de" ? "Entspricht ca." : "Equivalent to approx."}{" "}
                <strong className="text-emerald-300 font-black">${moneyValueSaved} {lang === "de" ? "Wert an Arbeitszeit" : "value of work time"}</strong>{" "}
                {lang === "de" ? "pro Monat!" : "per month!"}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleRequestDashboardAccess()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4 fill-slate-950" />
                  <span>{lang === "de" ? "FÜR PRE-ACCESS EINTRAGEN (3 TAGE FREE)" : "REGISTER FOR PRE-ACCESS (3 DAYS FREE)"}</span>
                </button>
              </div>

            </div>

          </div>

          {/* Bottom Sub-Link */}
          <div className="mt-8 text-center pt-4 border-t border-cyan-500/15">
            <a
              href="#comparison"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300 transition cursor-pointer tracking-wider font-bold"
            >
              <span>{lang === "de" ? "QUANTUM OS FUNKTIONSVERGLEICH ANSEHEN" : "EXPLORE THE QUANTUM OS"}</span>
              <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
            </a>
          </div>

        </div>
      </section>

      {/* COMPARISON TABLE (INSPIRED BY CYBERPUNK HUD DESIGN IN IMAGE.PNG) */}
      <section id="comparison" className="snap-start scroll-snap-start relative z-10 py-16 px-4 md:px-8 max-w-6xl mx-auto border-t border-cyan-500/20" style={{ scrollSnapAlign: "start" }}>
        <div className="text-center mb-10">
          <span className="font-mono text-cyan-400 text-xs uppercase tracking-[3px] font-bold block mb-1">
            {lang === "de" ? "CAPABILITY COMPARISON" : "CAPABILITY COMPARISON"}
          </span>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            {lang === "de" ? "WARUM S.Y.N.T.A.X. EINZELNEN KI-TOOLS ÜBERLEGEN IST" : "WHY S.Y.N.T.A.X. OUTPERFORMS STANDALONE AI TOOLS"}
          </h2>
        </div>

        {/* Futuristic Outer HUD Panel Frame with Corner Accents */}
        <div className="relative rounded-3xl bg-[#040816]/95 border border-cyan-500/30 p-4 sm:p-7 md:p-9 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden font-mono">
          
          {/* Tech Corner HUD Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* Grid Layout: 3 Columns matching image.png */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* LEFT COLUMN: FEATURE / PERFORMANCE (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
              {/* Header Box */}
              <div className="py-2.5 px-4 rounded-xl bg-[#071329] border border-cyan-500/40 text-center font-black text-xs text-cyan-300 tracking-wider uppercase shadow-inner">
                {lang === "de" ? "FEATURE / PERFORMANCE" : "FEATURE / PERFORMANCE"}
              </div>

              {/* Feature Row 1: 8 Connected Agents */}
              <div className="flex items-center gap-2.5 h-[68px]">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
                  <Network className="w-5 h-5" />
                </div>
                <div className="flex-1 h-full flex items-center px-4 rounded-xl bg-[#071124] border border-cyan-500/30 text-white text-xs font-bold shadow-sm">
                  {lang === "de" ? "8 Vernetzte Agenten gleichzeitig" : "8 Connected Agents Simultaneously"}
                </div>
              </div>

              {/* Feature Row 2: Real Gmail Sync */}
              <div className="flex items-center gap-2.5 h-[68px]">
                <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-400/60 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 h-full flex items-center px-4 rounded-xl bg-[#0f0b20] border border-purple-500/30 text-white text-xs font-bold shadow-sm">
                  {lang === "de" ? "Real Gmail OAuth Sync" : "Real Gmail OAuth Sync"}
                </div>
              </div>

              {/* Feature Row 3: Veo 3.1 AI Video */}
              <div className="flex items-center gap-2.5 h-[68px]">
                <div className="w-12 h-12 rounded-xl bg-teal-950/60 border border-teal-400/60 flex items-center justify-center text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.25)] shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="flex-1 h-full flex items-center px-4 rounded-xl bg-[#08151c] border border-teal-500/30 text-white text-xs font-bold shadow-sm">
                  Veo 3.1 AI Video Studio (8K MP4)
                </div>
              </div>

              {/* Feature Row 4: Social Media Direct Upload */}
              <div className="flex items-center gap-2.5 h-[68px]">
                <div className="w-12 h-12 rounded-xl bg-[#130d22] border border-pink-500/50 flex items-center justify-center text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.25)] shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="flex-1 h-full flex items-center px-4 rounded-xl bg-[#0b0e22] border border-pink-500/30 text-white text-xs font-bold shadow-sm">
                  {lang === "de" ? "TikTok & Instagram Direkt-Upload" : "TikTok & Instagram Direct Upload"}
                </div>
              </div>

              {/* Feature Row 5: Custom Gemini API Key */}
              <div className="flex items-center gap-2.5 h-[68px]">
                <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-400/60 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 h-full flex items-center px-4 rounded-xl bg-[#110c26] border border-purple-500/30 text-white text-xs font-bold shadow-sm">
                  {lang === "de" ? "Eigenen Gemini API-Key hinterlegen" : "Custom Gemini API Key Support"}
                </div>
              </div>

            </div>

            {/* CENTER HIGHLIGHTED COLUMN: S.Y.N.T.A.X. QUANTUM OS ($29) (4.5 cols) */}
            <div className="lg:col-span-5 relative rounded-2xl bg-gradient-to-b from-[#091736] via-[#060e24] to-[#040816] border-2 border-cyan-400 p-3.5 shadow-[0_0_40px_rgba(6,182,212,0.4)] ring-1 ring-purple-500/50 flex flex-col justify-between space-y-3">
              
              {/* Header Box */}
              <div className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 text-center font-black text-xs text-cyan-200 tracking-wider uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                S.Y.N.T.A.X. SOVEREIGN OS ($29)
              </div>

              {/* Row 1: Yes (Fully Synchronized) + Neural Mesh Visualizer */}
              <div className="h-[68px] rounded-xl bg-[#06122b]/80 border border-cyan-400/40 p-3 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-black">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === "de" ? "Ja (Voll synchronisiert)" : "Yes (Fully Synchronized)"}</span>
                </div>
                {/* Micro Neural Network Schematic */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/40">
                  <svg className="w-12 h-6 text-cyan-400" viewBox="0 0 48 24" fill="none">
                    <circle cx="6" cy="12" r="3" fill="#22d3ee" className="animate-pulse" />
                    <circle cx="24" cy="5" r="3" fill="#a855f7" />
                    <circle cx="24" cy="19" r="3" fill="#06b6d4" />
                    <circle cx="42" cy="12" r="3" fill="#10b981" className="animate-pulse" />
                    <line x1="6" y1="12" x2="24" y2="5" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" />
                    <line x1="6" y1="12" x2="24" y2="19" stroke="#06b6d4" strokeWidth="1.5" />
                    <line x1="24" y1="5" x2="42" y2="12" stroke="#a855f7" strokeWidth="1.5" />
                    <line x1="24" y1="19" x2="42" y2="12" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>
                </div>
              </div>

              {/* Row 2: Yes (Read & Write Emails) */}
              <div className="h-[68px] rounded-xl bg-[#06122b]/80 border border-cyan-400/40 px-4 flex items-center text-emerald-300 text-xs font-black gap-2 shadow-inner">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "de" ? "Ja (E-Mails lesen & schreiben)" : "Yes (Read & Write Emails)"}</span>
              </div>

              {/* Row 3: Included (Embedded) + S.Y.N.T.A.X. 3D Particle Ball Orb */}
              <div className="h-[68px] rounded-xl bg-[#06122b]/80 border border-cyan-400/40 p-2 flex items-center justify-between gap-3 shadow-inner group">
                {/* S.Y.N.T.A.X. 3D Particle Ball Visualizer */}
                <div className="h-full px-2.5 rounded-lg bg-gradient-to-tr from-[#0b051b] via-[#080d24] to-[#041525] border border-cyan-400/60 flex items-center justify-center gap-2 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:border-pink-400 transition cursor-pointer">
                  {/* Glowing background aura */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 pointer-events-none" />
                  
                  {/* Canvas Particle Ball */}
                  <MazeParticleBall size={48} speedMultiplier={1.1} />
                  
                  {/* S.Y.N.T.A.X. HUD Mini Label */}
                  <div className="flex flex-col items-start pr-1 font-mono">
                    <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 tracking-wider">
                      SYNTAX
                    </span>
                    <span className="text-[8px] text-cyan-400/80 font-bold">
                      CORE
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-300 text-xs font-black block">
                    {lang === "de" ? "Inklusive" : "Included"}
                  </span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">(Embedded)</span>
                </div>
              </div>

              {/* Row 4: Integrated */}
              <div className="h-[68px] rounded-xl bg-[#06122b]/80 border border-cyan-400/40 px-4 flex items-center text-emerald-300 text-xs font-black gap-2 shadow-inner">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "de" ? "Integriert (1-Klick Export)" : "Integrated (1-Click Direct)"}</span>
              </div>

              {/* Row 5: Unlimited Allowed */}
              <div className="h-[68px] rounded-xl bg-[#06122b]/80 border border-cyan-400/40 px-4 flex items-center text-emerald-300 text-xs font-black gap-2 shadow-inner">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "de" ? "Unbegrenzt erlaubt" : "Unlimited Allowed"}</span>
              </div>

            </div>

            {/* RIGHT COLUMN: STANDARD (CHATGPT / CLAUDE $20) (3.5 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-3">
              {/* Header Box */}
              <div className="py-2.5 px-3 rounded-xl bg-[#080d1e] border border-slate-800 text-center font-bold text-xs text-slate-400 uppercase">
                {lang === "de" ? "STANDARDFALL (CHATGPT / CLAUDE $20)" : "STANDARD (CHATGPT / CLAUDE $20)"}
              </div>

              {/* Row 1 */}
              <div className="h-[68px] rounded-xl bg-[#080c1a] border border-rose-900/30 p-3 flex items-center justify-between text-rose-400/90 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{lang === "de" ? "Nein (Nur 1 Bot)" : "No (Single Bot)"}</span>
                </div>
                <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                  •
                </div>
              </div>

              {/* Row 2 */}
              <div className="h-[68px] rounded-xl bg-[#080c1a] border border-rose-900/30 px-4 flex items-center text-rose-400/90 text-xs font-bold gap-1.5">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{lang === "de" ? "Nein" : "No"}</span>
              </div>

              {/* Row 3 */}
              <div className="h-[68px] rounded-xl bg-[#080c1a] border border-rose-900/30 px-4 flex items-center text-rose-400/90 text-xs font-bold gap-1.5 leading-snug">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{lang === "de" ? "Nein (Teure Addons)" : "No (Expensive Addons)"}</span>
              </div>

              {/* Row 4 */}
              <div className="h-[68px] rounded-xl bg-[#080c1a] border border-rose-900/30 px-4 flex items-center text-rose-400/90 text-xs font-bold gap-1.5 leading-snug">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{lang === "de" ? "Manuell kopieren" : "Manual Copy Req."}</span>
              </div>

              {/* Row 5 */}
              <div className="h-[68px] rounded-xl bg-[#080c1a] border border-rose-900/30 px-4 flex items-center text-rose-400/90 text-xs font-bold gap-1.5">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{lang === "de" ? "Strikte Rate Limits" : "Strict Rate Limits"}</span>
              </div>

            </div>

          </div>

          {/* BOTTOM ACTIONS */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => handleRequestDashboardAccess()}
              className="px-8 py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.8)] active:scale-95 flex items-center gap-2"
            >
              <span>{lang === "de" ? "SIGN UP NOW — 3 TAGE GRATIS TESTEN" : "SIGN UP NOW — 3-DAY FREE TRIAL"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#integrations"
              className="text-slate-400 hover:text-cyan-300 text-[11px] font-bold tracking-widest uppercase transition underline underline-offset-4 cursor-pointer"
            >
              {lang === "de" ? "15+ NATIVE INTEGRATIONEN ANSEHEN ↓" : "VIEW 15+ NATIVE INTEGRATIONS ↓"}
            </a>
          </div>

        </div>
      </section>

      {/* 15+ NATIVE INTEGRATIONS ECOSYSTEM & BENCHMARK MATRIX */}
      <section id="integrations" className={`snap-start scroll-snap-start relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto border-t ${
        isModern ? "border-slate-800" : "border-cyan-500/20"
      }`} style={{ scrollSnapAlign: "start" }}>
        <SalePageIntegrationsEcosystem
          lang={lang}
          onRegisterClick={() => {
            const el = document.getElementById("hero-registration-card");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      {/* PRICING & MONETIZATION TIERS */}
      <section id="pricing" className="snap-start scroll-snap-start relative z-10 py-24 px-4 md:px-8 max-w-7xl mx-auto border-t border-cyan-500/20" style={{ scrollSnapAlign: "start" }}>
        
        {/* Subtle Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest font-bold mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{lang === "de" ? "OPEN BETA PRE-ACCESS // 3 TAGE 100% FREE" : "OPEN BETA PRE-ACCESS // 3 DAYS 100% FREE"}</span>
          </div>
          
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {lang === "de" ? "PRE-ACCESS SICHERN // 3 TAGE FREE" : "SECURE PRE-ACCESS // 3 DAYS FREE"}
          </h2>
          
          <p className="text-slate-400 text-sm mt-3 font-mono max-w-2xl mx-auto">
            {lang === "de" 
              ? `Keine Bezahlung erforderlich. Trage dich für den Pre-Access ein und sichere dir 3 Tage vollen, uneingeschränkten Zugriff auf alle 8 KI-Agenten zum Open-Beta-Start!`
              : `No payment required. Register for Pre-Access and get 3 full days of unrestricted access to all 8 AI agents at Open Beta launch!`}
          </p>

          {/* Billing Cycle Switcher / Future Pricing Preview */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl shadow-xl">
            <button
              onClick={() => setPricingBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                pricingBillingCycle === "monthly"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {lang === "de" ? "REGULÄR MONATLICH" : "REGULAR MONTHLY"}
            </button>
            <button
              onClick={() => setPricingBillingCycle("yearly")}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                pricingBillingCycle === "yearly"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>{lang === "de" ? "JÄHRLICH" : "ANNUAL"}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                pricingBillingCycle === "yearly" ? "bg-zinc-900 text-emerald-400" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {lang === "de" ? "-20% RABATT" : "SAVE 20%"}
              </span>
            </button>
          </div>
        </div>

              {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative z-10">
          
          {/* ========================================================================= */}
          {/* 1. CREATOR & SOLO PRO                                                    */}
          {/* ========================================================================= */}
          <div className="p-7 md:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between relative shadow-xl backdrop-blur-md hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  CREATOR SOLO
                </div>
                <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 rounded-full font-bold">
                  {lang === "de" ? "1 ACCOUNT // POWER-USER" : "1 ACCOUNT // POWER-USER"}
                </span>
              </div>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {pricingBillingCycle === "monthly" ? "79 €" : "63 €"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {pricingBillingCycle === "monthly" 
                    ? (lang === "de" ? "/ Monat" : "/ month") 
                    : (lang === "de" ? "/ Mo (jährlich 756 €)" : "/ mo ($756/yr)")}
                </span>
              </div>
              
              <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-sans">
                {lang === "de"
                  ? "Für Solopreneure & Creator: Voller Zugriff auf alle 8 KI-Agenten, Veo 3 Video-Studio, Gmail Sync und 1 TikTok & Instagram Account."
                  : "For solopreneurs & creators: Full access to 8 AI agents, Veo 3 video studio, Gmail Sync, and 1 TikTok & Instagram account."}
              </p>

              {/* Free Pre-Access Highlight Box */}
              <div className="mt-4 p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center gap-2 text-[11px] font-mono text-zinc-300">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "de" ? "Inklusive 3 Tage kostenloser Pre-Access" : "Includes 3 days free pre-access"}</span>
              </div>

              <div className="w-full h-px bg-zinc-800 my-6" />

              <ul className="space-y-3.5 text-xs font-mono text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Alle 8 spezialisierten KI-Cores & 3D Matrix" : "All 8 specialized AI Cores & 3D Matrix"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Veo 3 AI Video Generation Studio (8K MP4)" : "Veo 3 AI Video Generation Studio (8K MP4)"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "1x TikTok & 1x Instagram Auto-Publishing" : "1x TikTok & 1x Instagram Auto-Publishing"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Echter Google Workspace & Gmail Sync" : "Real Google Workspace & Gmail Sync"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "3D Memory Universe (bis 1.000 Knoten)" : "3D Memory Universe (up to 1,000 nodes)"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Eigene Gemini API Keys hinterlegbar" : "Add custom Gemini API Keys"}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => {
                  setSelectedTierChoice("pro");
                  setRegistrationModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Ticket className="w-4 h-4 text-zinc-300" />
                <span>{lang === "de" ? "3 TAGE FREE TESTEN" : "START 3-DAY TRIAL"}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. AGENCY & PRO STUDIO (HERO / BEST SELLER TIER)                         */}
          {/* ========================================================================= */}
          <div className="p-7 md:p-8 rounded-3xl bg-zinc-900 border-2 border-cyan-400 flex flex-col justify-between relative shadow-[0_0_60px_rgba(6,182,212,0.35)] lg:-translate-y-2 z-20 ring-1 ring-cyan-300">
            
            {/* Top Crown Ribbon Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-mono font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Crown className="w-3 h-3 fill-slate-950" />
              <span>{lang === "de" ? "⭐ BESTSELLER // AGENTUR SWEET SPOT" : "⭐ BESTSELLER // AGENCY SWEET SPOT"}</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5 tracking-wider">
                  <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  <span>AGENCY STUDIO PRO</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-2.5 py-0.5 rounded-full font-bold">
                  {lang === "de" ? "3–5 SEATS // MULTI-CLIENT" : "3–5 SEATS // MULTI-CLIENT"}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {pricingBillingCycle === "monthly" ? "249 €" : "199 €"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {pricingBillingCycle === "monthly" 
                    ? (lang === "de" ? "/ Monat" : "/ month") 
                    : (lang === "de" ? "/ Mo (jährlich 2.388 €)" : "/ mo ($2,388/yr)")}
                </span>
              </div>

              <p className="text-zinc-300 text-xs mt-3 leading-relaxed font-sans">
                {lang === "de"
                  ? "Das ultimative Kraftwerk für Social-Media-Agenturen & Marketing-Teams: Bis zu 5 Social-Kanäle, Multi-Agenten-Voice, automatisches Script-to-Video und Kunden-Workspaces."
                  : "The powerhouse for marketing agencies & media teams: up to 5 social channels, multi-agent voice, automatic script-to-video, and client workspaces."}
              </p>

              {/* Free Pre-Access Highlight Box */}
              <div className="mt-4 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center gap-2 text-[11px] font-mono text-cyan-200">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === "de" ? "Spart 3.000 €+ monatliche Agentur-Kosten" : "Saves $3,000+ monthly agency hours"}</span>
              </div>

              <div className="w-full h-px bg-zinc-800 my-5" />

              <ul className="space-y-3.5 text-xs font-mono text-zinc-200">
                <li className="flex items-start gap-2.5">
                  <Crown className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{lang === "de" ? "👑 Multi-Account Matrix (Bis zu 5 TikTok & IG Kanäle)" : "👑 Multi-Account Matrix (Up to 5 TikTok & IG Channels)"}</strong>
                    <p className="text-[10px] text-zinc-400 font-sans">{lang === "de" ? "Automatisches Scheduling, Virality Scoring & Scheduled Posting" : "Automated scheduling, virality scoring & direct posting queue"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{lang === "de" ? "3–5 Team-Seats & Workspace Management" : "3–5 Team Seats & Workspace Management"}</strong>
                    <p className="text-[10px] text-zinc-400 font-sans">{lang === "de" ? "Gemeinsames Memory-Universe & getrennte Kundenordner" : "Shared memory universe & separate client folders"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Prioritäts-Rendering für Veo 3 Video-Generierung" : "Priority Rendering for Veo 3 Video Generation"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Echtzeit 3D Multi-Agenten Sprach-Orchestrierung" : "Real-Time 3D Multi-Agent Voice Orchestration"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Google Calendar, Gmail & Maps Autopilot Sync" : "Google Calendar, Gmail & Maps Autopilot Sync"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Prioritäts-Support & direkte Onboarding-Session" : "Priority Support & direct onboarding session"}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => {
                  setSelectedTierChoice("pro");
                  setRegistrationModalOpen(true);
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>
                  {pricingBillingCycle === "monthly" ? "AGENCY STUDIO 3 TAGE TESTEN" : "AGENCY STUDIO 3 TAGE TESTEN"}
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. WHITELABEL ENTERPRISE                                                  */}
          {/* ========================================================================= */}
          <div className="p-7 md:p-8 rounded-3xl bg-zinc-900/90 border border-purple-500/40 flex flex-col justify-between relative shadow-xl backdrop-blur-md hover:border-purple-500/70 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wider">
                  WHITELABEL ENTERPRISE
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/50 px-2.5 py-0.5 rounded-full font-bold">
                  {lang === "de" ? "CUSTOM DOMAIN & BRAND" : "CUSTOM DOMAIN & BRAND"}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {pricingBillingCycle === "monthly" ? "899 €" : "749 €"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {pricingBillingCycle === "monthly" 
                    ? (lang === "de" ? "/ Monat" : "/ month") 
                    : (lang === "de" ? "/ Mo (jährlich 8.988 €)" : "/ mo ($8,988/yr)")}
                </span>
              </div>

              <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-sans">
                {lang === "de"
                  ? "Vollständige Whitelabel-Lösung: Dein eigenes Logo, deine eigene Subdomain (ai.deineagentur.de) und unbegrenzte Kundenkanäle."
                  : "Full Whitelabel Solution: Your own branding, custom subdomain (ai.youragency.com), and unlimited client channels."}
              </p>

              {/* Free Pre-Access Highlight Box */}
              <div className="mt-4 p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/50 flex items-center gap-2 text-[11px] font-mono text-purple-200">
                <Crown className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{lang === "de" ? "Verkaufe SyntaxOS unter eigener Marke" : "Resell SyntaxOS under your brand"}</span>
              </div>

              <div className="w-full h-px bg-zinc-800 my-6" />

              <ul className="space-y-3.5 text-xs font-mono text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Eigenes Branding, Logo & Custom Subdomain" : "Custom Branding, Logo & Custom Subdomain"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Unbegrenzte TikTok & Instagram Kunden-Accounts" : "Unlimited TikTok & Instagram Client Accounts"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Dedizierter GPU-Cluster für ultraschnelles Rendering" : "Dedicated GPU Cluster for ultra-fast rendering"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "Custom Fine-Tuned Agenten-Personas für Kunden" : "Custom Fine-Tuned Agent Personas for Clients"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{lang === "de" ? "24/7 VIP Priority Matrix Support & Dev Access" : "24/7 VIP Priority Matrix Support & Dev Access"}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => {
                  setSelectedTierChoice("enterprise");
                  setRegistrationModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/60 font-mono text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>
                  {pricingBillingCycle === "monthly" ? "WHITELABEL DEMO SICHERN" : "WHITELABEL DEMO SICHERN"}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Trust & Pre-Access Guarantee Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs font-mono text-slate-400">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === "de" ? "100% Kostenloser Pre-Access (0,00 €)" : "100% Free Pre-Access ($0.00)"}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === "de" ? "Keine Zahlungsdaten / Kreditkarte nötig" : "No Payment Data / Credit Card Needed"}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <Zap className="w-4 h-4" />
              <span>{lang === "de" ? "3 Tage Free für Early Birds" : "3 Days Free for Early Birds"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-emerald-400 font-mono text-[11px] font-bold">
            <span>✓ Open Beta Registrierung aktiv</span>
          </div>
        </div>

      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION - HIGH CONVERSION) */}
      <section id="faq" className="snap-start scroll-snap-start relative z-10 py-16 px-4 md:px-8 max-w-4xl mx-auto border-t border-cyan-500/20" style={{ scrollSnapAlign: "start" }}>
        <div className="text-center mb-10">
          <span className="font-mono text-cyan-400 text-xs uppercase tracking-widest font-bold">
            {lang === "de" ? "ANTWORTEN AUF DEINE FRAGEN" : "ANSWERS TO YOUR QUESTIONS"}
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold mt-2 text-white">
            {lang === "de" ? "HÄUFIG GESTELLTE FRAGEN (FAQ)" : "FREQUENTLY ASKED QUESTIONS (FAQ)"}
          </h2>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {[
            {
              q: lang === "de"
                ? "Warum ist der Zugang aktuell auf genau 500 Plätze limitiert?"
                : "Why is access currently capped at exactly 500 spots?",
              a: lang === "de"
                ? "Um die extrem niedrige Reaktionszeit (<85ms) und die ungedrosselte Leistung der 8 vernetzten KI-Cores zu garantieren, schaltet unser Rechenzentrum nur 500 Live-Slots in Batch 1 frei."
                : "To guarantee ultra-low latency (<85ms) and unthrottled computing power across all 8 interconnected AI cores, our cluster limits Batch 1 strictly to 500 live slots.",
            },
            {
              q: lang === "de"
                ? "Wie funktioniert der 3 Tage Free Pre-Access für die Open Beta?"
                : "How does the 3-day free pre-access for Open Beta work?",
              a: lang === "de"
                ? "Alle Personen, die sich für den Pre-Access eintragen, erhalten zum Start der Open Beta 3 Tage vollen, uneingeschränkten Zugriff auf alle 8 KI-Agenten und Funktionen 100% kostenlos. Es ist keine Kreditkarte oder Bezahlung erforderlich."
                : "Everyone who signs up for pre-access gets 3 days of full, unrestricted access to all 8 AI agents and features 100% free at the Open Beta launch. No credit card or payment is required.",
            },
            {
              q: lang === "de"
                ? "Brauche ich technische Vorkenntnisse, um S.Y.N.T.A.X. OS zu nutzen?"
                : "Do I need technical skills to use S.Y.N.T.A.X. OS?",
              a: lang === "de"
                ? "Nein, überhaupt nicht! S.Y.N.T.A.X. ist so intuitiv wie WhatsApp oder ChatGPT aufgebaut. Du kannst ganz normal in deutscher oder englischer Sprache schreiben oder sprechen."
                : "Not at all! S.Y.N.T.A.X. is as intuitive as WhatsApp or ChatGPT. You can talk or type naturally in English or German.",
            },
            {
              q: lang === "de"
                ? "Wie funktioniert die Verknüpfung mit meinem echten Gmail Konto?"
                : "How does connecting my real Gmail account work?",
              a: lang === "de"
                ? "Über die offizielle Google Workspace OAuth2 Schnittstelle. Du meldest dich mit 1 Klick bei deinem Google Konto an. Deine Login-Daten werden niemals gespeichert und die Verbindung erfolgt nach höchsten Sicherheitsstandards."
                : "Via the official Google Workspace OAuth2 API. You sign in with 1 click to your Google account. Your login credentials are never stored and connection adheres to top security standards.",
            },
            {
              q: lang === "de"
                ? "Kann ich meine eigenen Gemini API-Keys nutzen?"
                : "Can I use my own Gemini API keys?",
              a: lang === "de"
                ? "Ja! Im Dashboard kannst du unter den Einstellungen deinen persönlichen Gemini API-Key eintragen. Dadurch hast du unbegrenzte Quoten ohne jegliche Plattform-Beschränkungen."
                : "Yes! In the Settings menu inside the dashboard you can enter your personal Gemini API key for unlimited quotas with zero platform rate limits.",
            },
            {
              q: lang === "de"
                ? "Wie erhalte ich nach dem Eintragen meinen Zugang?"
                : "How do I get access after registering?",
              a: lang === "de"
                ? "Sofort! Direkt nach der Eintragung wird dein personalisierter VIP Quantum Access Pass generiert und du gelangst unmittelbar in die Command-Zentrale."
                : "Instantly! Directly after registering, your personalized VIP Quantum Access Pass is generated and you immediately enter the command dashboard.",
            },
            {
              q: lang === "de"
                ? "Kann ich mein Abonnement jederzeit kündigen?"
                : "Can I cancel my subscription anytime?",
              a: lang === "de"
                ? "Ja, absolut. Es gibt keine Mindestvertragslaufzeit. Du kannst dein Abonnement jederzeit mit einem Klick in den Einstellungen kündigen."
                : "Yes, absolutely. There is no lock-in period. You can cancel your subscription anytime with one click in settings.",
            },
          ].map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#060918] border border-cyan-500/20 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-200 flex items-center justify-between gap-4 hover:text-cyan-300 cursor-pointer"
                >
                  <span className="text-sm">{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="snap-start scroll-snap-start relative z-10 py-8 border-t border-cyan-500/20 text-center font-mono text-xs text-slate-500" style={{ scrollSnapAlign: "start" }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-4 h-4" />
            <span className="font-bold">S.Y.N.T.A.X. SOVEREIGN OS (getsyntax.ai)</span>
            <span>:: ALL RIGHTS RESERVED 2026</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={handleRequestDashboardAccess} className="hover:text-cyan-300 transition cursor-pointer">
              {registeredUser ? `SYSTEM DASHBOARD (SLOT #${registeredUser.slot})` : "PRE-ACCESS REGISTRIERUNG"}
            </button>
            <span>•</span>
            <button onClick={() => setRegistrationModalOpen(true)} className="hover:text-purple-300 transition cursor-pointer">OPEN BETA PRE-ACCESS</button>
            {onViewMaintenanceMode && (
              <>
                <span>•</span>
                <button
                  onClick={onViewMaintenanceMode}
                  className="text-slate-600 hover:text-amber-400 transition cursor-pointer text-[10px]"
                  title="Wartungsmodus-Vorschau ansehen"
                >
                  {lang === "de" ? "WARTUNGS-ANSICHT" : "MAINTENANCE VIEW"}
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* FLOATING LIVE SALES POPUP REMOVED/HIDDEN AS REQUESTED */}

      {/* 500-SPOTS VIP REGISTRATION / CLAIM MODAL (ADAPTS DYNAMICALLY TO MODERN OR CYBERPUNK HUD) */}
      {registrationModalOpen && (() => {
        const scorePassword = (pw: string) => {
          if (!pw) return 0;
          let score = 0;
          if (pw.length >= 8) score++;
          if (pw.length >= 12) score++;
          if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
          if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
          return Math.min(score, 4);
        };
        const pwScore = scorePassword(leadPassword);
        const strengthColors = isModern
          ? ['#a855f7', '#c084fc', '#eab308', '#22c55e']
          : ['#ff2079', '#ff8a4c', '#ffd23f', '#00fff2'];
        const strengthLabelsDe = ['SCHWACH', 'AKZEPTABEL', 'GUT', 'STARK (OPTIMAL)'];
        const strengthLabelsEn = ['WEAK', 'OKAY', 'GOOD', 'STRONG (SECURE)'];

        return (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            {/* Ambient Background Glows */}
            {isModern ? (
              <>
                <div className="fixed top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-purple-900/15 blur-[120px] pointer-events-none" />
              </>
            ) : (
              <>
                <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(0,255,242,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,242,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
                <div className="fixed top-[-180px] left-[-180px] w-[500px] h-[500px] rounded-full bg-[rgba(0,255,242,0.12)] blur-[100px] pointer-events-none" />
                <div className="fixed bottom-[-180px] right-[-180px] w-[500px] h-[500px] rounded-full bg-[rgba(255,32,121,0.12)] blur-[100px] pointer-events-none" />
              </>
            )}

            <div className="relative w-full max-w-[460px] my-auto animate-scaleUp z-10">
              {/* Card Container */}
              <div className={`relative p-6 sm:p-7 overflow-hidden ${
                isModern
                  ? "bg-[#0e0e13]/95 border border-zinc-800 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.08)]"
                  : "bg-gradient-to-b from-[#0a0a12] to-[#07070d] border border-[rgba(0,255,242,0.35)] shadow-[0_0_0_1px_rgba(0,255,242,0.08),0_0_40px_-4px_rgba(0,255,242,0.25),0_30px_70px_-20px_rgba(0,0,0,0.9)]"
              }`}>
                
                {/* Interactive Ambient Canvas */}
                <canvas
                  ref={(canvas) => {
                    if (!canvas) return;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    let animId: number;
                    const W = (canvas.width = canvas.offsetWidth || 450);
                    const H = (canvas.height = canvas.offsetHeight || 650);

                    const particles: Array<{
                      x: number;
                      y: number;
                      vx: number;
                      vy: number;
                      size: number;
                      color: string;
                      alpha: number;
                      maxLife: number;
                      life: number;
                    }> = [];

                    const colors = isModern
                      ? ["#ef4444", "#f43f5e", "#ffffff", "#a1a1aa", "#fb7185"]
                      : ["#00fff2", "#ff2079", "#00d8ff", "#ffffff", "#ffd23f"];

                    for (let i = 0; i < 24; i++) {
                      particles.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 0.35,
                        vy: -0.2 - Math.random() * 0.45,
                        size: 1 + Math.random() * 2,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        alpha: 0.2 + Math.random() * 0.5,
                        maxLife: 100 + Math.random() * 150,
                        life: Math.random() * 100,
                      });
                    }

                    const render = () => {
                      ctx.clearRect(0, 0, W, H);
                      particles.forEach((p) => {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.life++;
                        if (p.life > p.maxLife || p.y < 0 || p.x < 0 || p.x > W) {
                          p.x = Math.random() * W;
                          p.y = H + 5;
                          p.life = 0;
                          p.alpha = 0.2 + Math.random() * 0.5;
                        }
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = p.alpha * Math.sin((p.life / p.maxLife) * Math.PI);
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = isModern ? 4 : 6;
                        ctx.fill();
                      });
                      ctx.globalAlpha = 1;
                      animId = requestAnimationFrame(render);
                    };
                    render();
                    return () => cancelAnimationFrame(animId);
                  }}
                  className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
                />

                {/* Cyberpunk Scanlines & Corner Tabs (Cyberpunk Only) */}
                {!isModern && (
                  <>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_3px)] pointer-events-none z-0 mix-blend-overlay" />
                    <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-[#00fff2] z-20 pointer-events-none" />
                    <div className="absolute top-[-1px] right-[-1px] w-4 h-4 border-t-2 border-r-2 border-[#00fff2] z-20 pointer-events-none" />
                    <div className="absolute bottom-[-1px] left-[-1px] w-4 h-4 border-b-2 border-l-2 border-[#00fff2] z-20 pointer-events-none" />
                    <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-[#00fff2] z-20 pointer-events-none" />
                  </>
                )}

                <div className="relative z-10">
                  {/* Top Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Geometric Quantum Mark */}
                      <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${
                        isModern
                          ? "rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-sm"
                          : "bg-[#0a0a12] border border-[#00fff2] shadow-[0_0_14px_-2px_rgba(0,255,242,0.7)] [clip-path:polygon(15%_0,100%_0,100%_85%,85%_100%,0_100%,0_15%)]"
                      }`}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L4 6.5V17.5L12 22L20 17.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                          <path d="M12 22V13.5M12 13.5L4 6.5M12 13.5L20 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h1 className={`text-base font-bold leading-tight ${
                          isModern
                            ? "text-white tracking-tight font-sans"
                            : "font-mono text-[14.5px] tracking-[0.1em] text-[#e8fffd] [text-shadow:0_0_10px_rgba(0,255,242,0.6),2px_0_rgba(255,32,121,0.5),-2px_0_rgba(0,255,242,0.5)]"
                        }`}>
                          QUANTUM PRE-ACCESS
                        </h1>
                        <div className={`flex items-center gap-1.5 mt-1 text-[10.5px] font-semibold tracking-wider ${
                          isModern ? "text-zinc-400 font-sans" : "text-[#00fff2] font-mono"
                        }`}>
                          <span className={`w-1.5 h-1.5 ${isModern ? "rounded-full bg-purple-500" : "rounded-none bg-[#00fff2] shadow-[0_0_10px_2px_rgba(0,255,242,0.9)] animate-pulse"}`} />
                          <span>{lang === "de" ? "OPEN BETA · NOCH NICHT LIVE" : "LAUNCHING SOON · NOT LIVE YET"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Theme switcher inside modal */}
                      <button
                        type="button"
                        onClick={() => setTheme(isModern ? "cyberpunk" : "syntax")}
                        className={`px-2 py-1 text-[9px] font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                          isModern
                            ? "rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                            : "bg-[#0a0a12] border border-[rgba(0,255,242,0.35)] text-[#00fff2] hover:border-[#00fff2]"
                        }`}
                        title={isModern ? "Zu Cyberpunk HUD wechseln" : "Zu Modern wechseln"}
                      >
                        {isModern ? <Sparkles className="w-2.5 h-2.5 text-purple-400" /> : <Zap className="w-2.5 h-2.5 text-cyan-400" />}
                        <span>{isModern ? "MODERN" : "CYBERPUNK"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegistrationModalOpen(false)}
                        className={`w-7 h-7 flex items-center justify-center cursor-pointer transition shrink-0 ${
                          isModern
                            ? "rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                            : "bg-[#0a0a12] border border-[rgba(0,255,242,0.35)] hover:border-[#00fff2] hover:shadow-[0_0_10px_-2px_rgba(0,255,242,0.8)] text-[#00fff2]"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Capacity Box */}
                  <div className={`p-[10px_14px] flex flex-col w-full mb-4 ${
                    isModern
                      ? "bg-zinc-900/80 border border-zinc-800 rounded-2xl"
                      : "bg-[rgba(0,255,242,0.04)] border border-[rgba(0,255,242,0.25)]"
                  }`}>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className={`${isModern ? "text-zinc-400 font-sans font-medium" : "text-[#7de8e0] font-mono tracking-[0.06em] uppercase"}`}>
                        {lang === "de" ? "PRE-ACCESS PLÄTZE" : "PRE-ACCESS SPOTS"}
                      </span>
                      <span className={`font-semibold ${isModern ? "text-zinc-200 font-sans" : "text-[#e8fffd] font-mono"}`}>
                        {claimedSpots} / {TOTAL_SPOTS} {lang === "de" ? "REGISTRIERT" : "REGISTERED"}
                      </span>
                    </div>
                    <div className={`h-1.5 mt-2 overflow-hidden relative w-full ${isModern ? "rounded-full bg-zinc-800" : "bg-[rgba(0,255,242,0.12)]"}`}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          isModern
                            ? "rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 shadow-sm"
                            : "bg-gradient-to-r from-[#00fff2] via-[#2dd4ee] to-[#ff2079] shadow-[0_0_10px_1px_rgba(0,255,242,0.7)]"
                        }`}
                        style={{ width: `${percentageClaimed}%` }}
                      />
                    </div>
                  </div>

                  {/* Section Label */}
                  <div className={`text-[10px] tracking-[0.06em] mb-2 flex items-center justify-between uppercase ${
                    isModern ? "text-zinc-400 font-sans font-semibold" : "text-[#7de8e0] font-mono"
                  }`}>
                    <span>{lang === "de" ? "PLAN WÄHLEN // 3 TAGE PRE-ACCESS TEST // 0,00 €" : "CHOOSE PLAN // 3-DAY PRE-ACCESS TRIAL // $0.00"}</span>
                  </div>

                  {/* Plans Selection */}
                  <div className="flex flex-col gap-2 mb-4">
                    {/* Pro Core */}
                    <div
                      onClick={() => setSelectedTierChoice("pro")}
                      className={`relative p-[12px_14px] cursor-pointer transition border ${
                        isModern
                          ? selectedTierChoice === "pro"
                            ? "rounded-2xl border-purple-500/80 bg-purple-500/10 ring-1 ring-purple-500/30"
                            : "rounded-2xl border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                          : selectedTierChoice === "pro"
                          ? "border-[#00fff2] bg-[rgba(0,255,242,0.08)] shadow-[0_0_16px_-4px_rgba(0,255,242,0.5),inset_0_0_20px_-12px_rgba(0,255,242,0.6)]"
                          : "border-[rgba(0,255,242,0.18)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(0,255,242,0.45)]"
                      }`}
                    >
                      {selectedTierChoice === "pro" && (
                        <div className={`absolute top-3 right-3 w-4 h-4 flex items-center justify-center ${
                          isModern
                            ? "rounded-full bg-purple-500 text-white"
                            : "border border-[#00fff2] bg-[#00fff2] shadow-[0_0_8px_1px_rgba(0,255,242,0.8)] text-[#050508]"
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-0.5 pr-6">
                        <span className={`text-[13.5px] font-bold ${isModern ? "text-white font-sans" : "text-[#e8fffd] tracking-wide"}`}>
                          PRO CORE
                        </span>
                        <span className={`text-[13.5px] font-bold ${isModern ? "text-white font-sans" : "font-mono text-[#e8fffd]"}`}>
                          29€<span className={`text-[10.5px] ${isModern ? "text-zinc-400" : "text-[#7de8e0]"}`}>/mo</span>
                        </span>
                      </div>
                      <div className={`text-[11.5px] font-medium ${isModern ? "text-purple-400 font-sans" : "text-[#ff2079] font-mono"}`}>
                        {lang === "de" ? "3 Tage kostenlos testen · Shared Cluster" : "3-day free trial · shared cluster"}
                      </div>
                    </div>

                    {/* Enterprise */}
                    <div
                      onClick={() => setSelectedTierChoice("enterprise")}
                      className={`relative p-[12px_14px] cursor-pointer transition border ${
                        isModern
                          ? selectedTierChoice === "enterprise"
                            ? "rounded-2xl border-purple-500/80 bg-purple-500/10 ring-1 ring-purple-500/30"
                            : "rounded-2xl border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                          : selectedTierChoice === "enterprise"
                          ? "border-[#00fff2] bg-[rgba(0,255,242,0.08)] shadow-[0_0_16px_-4px_rgba(0,255,242,0.5),inset_0_0_20px_-12px_rgba(0,255,242,0.6)]"
                          : "border-[rgba(0,255,242,0.18)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(0,255,242,0.45)]"
                      }`}
                    >
                      {selectedTierChoice === "enterprise" && (
                        <div className={`absolute top-3 right-3 w-4 h-4 flex items-center justify-center ${
                          isModern
                            ? "rounded-full bg-purple-500 text-white"
                            : "border border-[#00fff2] bg-[#00fff2] shadow-[0_0_8px_1px_rgba(0,255,242,0.8)] text-[#050508]"
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-0.5 pr-6">
                        <div className="flex items-center">
                          <span className={`text-[13.5px] font-bold ${isModern ? "text-white font-sans" : "text-[#e8fffd] tracking-wide"}`}>ENTERPRISE</span>
                          <span className={`inline-flex items-center gap-1 font-semibold text-[9px] px-2 py-0.5 ml-2 ${
                            isModern
                              ? "rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 font-sans"
                              : "bg-[rgba(255,32,121,0.12)] border border-[rgba(255,32,121,0.4)] text-[#ff5c9d] font-mono"
                          }`}>
                            {lang === "de" ? "276€/Mo. Ersparnis" : "SAVE $276/MO"}
                          </span>
                        </div>
                        <span className={`text-[13.5px] font-bold ${isModern ? "text-white font-sans" : "font-mono text-[#e8fffd]"}`}>
                          99€<span className={`text-[10.5px] ${isModern ? "text-zinc-400" : "text-[#7de8e0]"}`}>/mo</span>
                        </span>
                      </div>
                      <div className={`text-[11.5px] font-medium ${isModern ? "text-zinc-400 font-sans" : "text-[#7a8f8d] font-mono"}`}>
                        {lang === "de" ? "5 Seats · Priority Veo 3 Rendering · 3 Tage Pre-Access" : "5 seats · priority Veo 3 rendering · 3-day free trial"}
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRegisterAndClaimSpot} className="space-y-3">
                    {/* Name */}
                    <div>
                      <label className={`block text-[10.5px] mb-1 font-semibold ${
                        isModern ? "text-zinc-300 font-sans" : "font-mono tracking-[0.06em] text-[#7de8e0]"
                      }`}>
                        {lang === "de" ? "DEIN NAME" : "YOUR NAME"}
                      </label>
                      <input
                        type="text"
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder={lang === "de" ? "Alex Müller" : "Alex Miller"}
                        className={`w-full p-[9px_12px] text-[13px] outline-none transition ${
                          isModern
                            ? "rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 text-white placeholder-zinc-500 font-sans"
                            : "bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,242,0.25)] focus:border-[#00fff2] focus:shadow-[0_0_12px_-4px_rgba(0,255,242,0.6)] text-[#e8fffd] placeholder-[#3a4644] font-sans"
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-[10.5px] mb-1 font-semibold ${
                        isModern ? "text-zinc-300 font-sans" : "font-mono tracking-[0.06em] text-[#7de8e0]"
                      }`}>
                        {lang === "de" ? "DEINE E-MAIL-ADRESSE" : "YOUR EMAIL ADDRESS"}
                      </label>
                      <input
                        type="email"
                        required
                        value={leadEmail}
                        onChange={(e) => {
                          setLeadEmail(e.target.value);
                          if (regFormError) setRegFormError("");
                        }}
                        placeholder="alex@business.com"
                        className={`w-full p-[9px_12px] text-[13px] outline-none transition ${
                          isModern
                            ? "rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 text-white placeholder-zinc-500 font-sans"
                            : "bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,242,0.25)] focus:border-[#00fff2] focus:shadow-[0_0_12px_-4px_rgba(0,255,242,0.6)] text-[#e8fffd] placeholder-[#3a4644] font-sans"
                        }`}
                      />
                      {leadEmail.trim().includes("@") && isEmailAlreadyRegistered(leadEmail).exists && (
                        <div className={`mt-1.5 p-2 text-[10.5px] flex items-center justify-between ${
                          isModern
                            ? "rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 font-sans"
                            : "bg-[#0e161c] border border-[#00fff2]/40 text-[#e8fffd] font-mono"
                        }`}>
                          <span className={`flex items-center gap-1 font-bold ${isModern ? "text-purple-300" : "text-[#00fff2]"}`}>
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === "de" ? "Bereits eingetragen!" : "Already registered!"}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setRegistrationModalOpen(false);
                              setKeyLoginModalOpen(true);
                            }}
                            className={`underline font-bold cursor-pointer ml-2 ${isModern ? "text-purple-300 hover:text-white" : "text-[#00fff2] hover:text-white"}`}
                          >
                            {lang === "de" ? "Hier anmelden →" : "Log in here →"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Create Password */}
                    <div>
                      <label className={`block text-[10.5px] mb-1 font-semibold ${
                        isModern ? "text-zinc-300 font-sans" : "font-mono tracking-[0.06em] text-[#7de8e0]"
                      }`}>
                        {lang === "de" ? "PASSWORT ERSTELLEN" : "CREATE PASSWORD"}
                      </label>
                      <div className="relative">
                        <input
                          type={showLeadPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={leadPassword}
                          onChange={(e) => setLeadPassword(e.target.value)}
                          placeholder={lang === "de" ? "mind. 8 Zeichen" : "min. 8 characters"}
                          className={`w-full p-[9px_12px] pr-10 text-[13px] outline-none transition ${
                            isModern
                              ? "rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 text-white placeholder-zinc-500 font-sans"
                              : "bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,242,0.25)] focus:border-[#00fff2] focus:shadow-[0_0_12px_-4px_rgba(0,255,242,0.6)] text-[#e8fffd] placeholder-[#3a4644] font-sans"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLeadPassword(!showLeadPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition ${
                            isModern ? "text-zinc-400 hover:text-white" : "text-[#4a6462] hover:text-[#00fff2]"
                          }`}
                        >
                          {showLeadPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Meter */}
                      <div className="flex gap-1 mt-2">
                        {[0, 1, 2, 3].map((seg) => (
                          <div
                            key={seg}
                            className={`h-[3px] flex-1 transition-all duration-200 ${isModern ? "rounded-full" : ""}`}
                            style={{
                              background:
                                leadPassword.length > 0 && seg < pwScore
                                  ? strengthColors[Math.max(pwScore - 1, 0)]
                                  : isModern ? 'rgba(255,255,255,0.1)' : 'rgba(0,255,242,0.12)',
                              boxShadow:
                                leadPassword.length > 0 && seg < pwScore
                                  ? `0 0 8px -1px ${strengthColors[Math.max(pwScore - 1, 0)]}`
                                  : 'none',
                            }}
                          />
                        ))}
                      </div>

                      <div className={`flex items-center justify-between mt-1 text-[10px] min-h-[14px] ${isModern ? "font-sans" : "font-mono"}`}>
                        <span className={isModern ? "text-zinc-500" : "text-[#4a6462]"}>
                          {leadPassword.length < 8
                            ? (lang === "de" ? "MINDESTENS 8 ZEICHEN" : "AT LEAST 8 CHARACTERS")
                            : ""}
                        </span>
                        {leadPassword.length >= 8 && (
                          <span
                            style={{
                              color: strengthColors[Math.max(pwScore - 1, 0)],
                              fontWeight: 600,
                            }}
                          >
                            {lang === "de"
                              ? strengthLabelsDe[Math.max(pwScore - 1, 0)]
                              : strengthLabelsEn[Math.max(pwScore - 1, 0)]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className={`block text-[10.5px] mb-1 font-semibold ${
                        isModern ? "text-zinc-300 font-sans" : "font-mono tracking-[0.06em] text-[#7de8e0]"
                      }`}>
                        {lang === "de" ? "PASSWORT BESTÄTIGEN" : "CONFIRM PASSWORD"}
                      </label>
                      <div className="relative">
                        <input
                          type={showLeadConfirmPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={leadConfirmPassword}
                          onChange={(e) => setLeadConfirmPassword(e.target.value)}
                          placeholder={lang === "de" ? "Passwort wiederholen" : "repeat password"}
                          className={`w-full p-[9px_12px] pr-10 text-[13px] outline-none transition ${
                            isModern
                              ? "rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 text-white placeholder-zinc-500 font-sans"
                              : "bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,242,0.25)] focus:border-[#00fff2] focus:shadow-[0_0_12px_-4px_rgba(0,255,242,0.6)] text-[#e8fffd] placeholder-[#3a4644] font-sans"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLeadConfirmPassword(!showLeadConfirmPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition ${
                            isModern ? "text-zinc-400 hover:text-white" : "text-[#4a6462] hover:text-[#00fff2]"
                          }`}
                        >
                          {showLeadConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className={`text-[10px] mt-1 min-h-[14px] ${isModern ? "font-sans" : "font-mono"}`}>
                        {leadConfirmPassword.length > 0 && (
                          leadPassword === leadConfirmPassword ? (
                            <span className={isModern ? "text-emerald-400 font-semibold" : "text-[#00fff2] font-semibold"}>
                              {lang === "de" ? "PASSWÖRTER STIMMEN ÜBEREIN ✓" : "PASSWORDS MATCH ✓"}
                            </span>
                          ) : (
                            <span className={isModern ? "text-purple-400 font-semibold" : "text-[#ff2079] font-semibold"}>
                              {lang === "de" ? "PASSWÖRTER STIMMEN NICHT ÜBEREIN ✗" : "PASSWORDS DON'T MATCH ✗"}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Error Box */}
                    {regFormError && (
                      <div className={`p-3 text-xs space-y-2 ${
                        isModern
                          ? "rounded-xl bg-purple-950/50 border border-purple-500/50 text-purple-300 font-sans"
                          : "bg-[rgba(255,32,121,0.1)] border border-[rgba(255,32,121,0.5)] text-[#ff8a4c] font-mono"
                      }`}>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span className="font-bold leading-relaxed">{regFormError}</span>
                        </div>
                        {regFormError.includes("bereits registriert") && (
                          <button
                            type="button"
                            onClick={() => {
                              setRegistrationModalOpen(false);
                              setKeyLoginModalOpen(true);
                            }}
                            className={`w-full py-2 px-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                              isModern
                                ? "rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                                : "bg-[#00fff2] text-[#050508] shadow-[0_0_15px_rgba(0,255,242,0.7)]"
                            }`}
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{lang === "de" ? "👉 Hier direkt mit Passwort anmelden" : "👉 Log in here with password"}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Notice Box */}
                    <div className={`flex gap-2.5 p-[11px_12px] ${
                      isModern
                        ? "rounded-2xl bg-zinc-900/90 border border-zinc-800"
                        : "bg-[rgba(255,32,121,0.04)] border border-[rgba(255,32,121,0.35)]"
                    }`}>
                      <AlertCircle className={`w-[16px] h-[16px] shrink-0 mt-0.5 ${isModern ? "text-amber-400" : "text-[#ff2079]"}`} />
                      <div>
                        <div className={`text-[10.5px] font-bold mb-0.5 ${
                          isModern ? "text-zinc-200 font-sans" : "font-mono tracking-[0.06em] text-[#ff5c9d]"
                        }`}>
                          {lang === "de" ? "PRE-ACCESS // NOCH NICHT LIVE" : "PRE-ACCESS // NOT LIVE YET"}
                        </div>
                        <div className={`text-[11px] leading-[1.45] ${isModern ? "text-zinc-400 font-sans" : "text-[#a892a0]"}`}>
                          {lang === "de"
                            ? "Du registrierst dich für den Pre-Access vor dem Launch, kein sofortiges Live-Abo. Die ersten 500 Personen erhalten 3 Tage kostenlosen Vollzugriff statt der standardmäßigen 1 Tag nach dem Start."
                            : "You're registering for pre-access before launch, not signing up to a live product. The first 500 people who register get a 3-day free trial instead of the standard 1 day once we launch."}
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className={`w-full p-[13px] text-[12.5px] font-bold tracking-[0.04em] cursor-pointer flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 ${
                        isModern
                          ? "rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-sans shadow-lg shadow-white/10"
                          : "bg-[#00fff2] hover:bg-[#34ffff] text-[#050508] font-mono shadow-[0_0_24px_-4px_rgba(0,255,242,0.7)] hover:shadow-[0_0_34px_-2px_rgba(0,255,242,0.95)]"
                      }`}
                    >
                      {isSubmittingLead ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{lang === "de" ? "RESERVIERE PRE-ACCESS..." : "RESERVING PRE-ACCESS..."}</span>
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {lang === "de"
                              ? `FÜR PRE-ACCESS EINTRAGEN // 3 TAGE TEST SICHERN`
                              : `REGISTER FOR PRE-ACCESS // CLAIM 3-DAY TRIAL`}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Foot Notes */}
                    <div className={`flex items-center justify-center gap-2.5 mt-2.5 text-[9.5px] uppercase tracking-wider ${
                      isModern ? "text-zinc-500 font-sans font-medium" : "text-[#4a6462] font-mono"
                    }`}>
                      <span>{lang === "de" ? "0,00 € HEUTE" : "$0.00 TODAY"}</span>
                      <span>·</span>
                      <span>{lang === "de" ? "KEINE ZAHLUNGSDATEN" : "NO PAYMENT REQUIRED"}</span>
                      <span>·</span>
                      <span>{lang === "de" ? "E-MAIL ZUM LAUNCH" : "NOTIFIED AT LAUNCH"}</span>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* VIP QUANTUM ACCESS PASS CONFIRMATION MODAL */}
      {showVipPassModal && registeredUser && (() => {
        return (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-700 p-6 md:p-8 relative font-mono text-xs space-y-6 animate-scaleUp shadow-2xl">
              
              <button
                onClick={() => setShowVipPassModal(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl border bg-zinc-900 border-zinc-700 text-white flex items-center justify-center mx-auto shadow-md">
                  <BadgeCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black tracking-wider text-white">
                  {lang === "de" ? "🎉 PRE-ACCESS ERFOLGREICH RESERVIERT!" : "🎉 PRE-ACCESS SUCCESSFULLY RESERVED!"}
                </h3>
                <p className="text-zinc-400 text-xs">
                  {lang === "de"
                    ? "Dein Platz für Batch 1 (Open Beta) ist gesichert. Du erhältst zum Start 3 Tage kostenlosen Vollzugriff auf alle 8 KI-Agenten."
                    : "Your spot for Batch 1 (Open Beta) is secured. You will receive 3 days of full free access to all 8 AI agents at launch."}
                </p>
              </div>

              {/* HOLOGRAPHIC VIP PASS CARD */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-700 relative overflow-hidden shadow-inner space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[9.5px] text-zinc-400 block font-bold">S.Y.N.T.A.X. QUANTUM PASS</span>
                    <span className="text-sm font-black text-white">BATCH 1 VIP PRE-ACCESS (3 TAGE FREE)</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-white border border-zinc-700 text-[10px] font-bold">
                      SLOT #{registeredUser.slot} / 500
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="text-[9px] text-zinc-500 block">INHABER / HOLDER</span>
                    <span className="font-bold text-white text-xs">{registeredUser.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">E-MAIL</span>
                    <span className="font-bold text-zinc-300 text-xs truncate block">{registeredUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">ENCRYPTION TOKEN</span>
                    <span className="font-bold text-zinc-300 text-[10px] truncate block">{registeredUser.token}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block">STATUS</span>
                    <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 3 TAGE FREE RESERVIERT
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[10.5px] text-zinc-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>
                    {lang === "de"
                      ? `Dein Pre-Access Platz ist mit deinem Passwort gesichert! Du wirst pünktlich zum Start der Open Beta benachrichtigt.`
                      : `Your Pre-Access spot is secured with your password! You will be notified when the Open Beta goes live.`}
                  </span>
                </div>
              </div>

              {/* Next Action Button */}
              <button
                onClick={() => {
                  setShowVipPassModal(false);
                  // If admin email, allow entering app, otherwise keep on landing page
                  if (registeredUser.email?.toLowerCase().includes("philippsteidle5@gmail.com")) {
                    onEnterApp();
                  }
                }}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 bg-white hover:bg-zinc-100 text-zinc-950 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                <span>{registeredUser.email?.toLowerCase().includes("philippsteidle5@gmail.com") ? (lang === "de" ? "🚀 ADMIN COMMAND CENTER ÖFFNEN →" : "🚀 OPEN ADMIN DASHBOARD →") : (lang === "de" ? "✓ VERSTANDEN & RESERVIERUNG BESTÄTIGT" : "✓ GOT IT & RESERVATION CONFIRMED")}</span>
              </button>

            </div>
          </div>
        );
      })()}

      {/* AGENT CINEMATIC SHOWCASE MODAL */}
      <AgentCinematicShowcaseModal
        isOpen={showCinematicModal}
        onClose={() => setShowCinematicModal(false)}
        agents={agents}
        currentAgentId={cinematicAgentId}
        lang={lang}
        onSelectAgentAndStart={(agentId) => {
          setShowCinematicModal(false);
          handleRequestDashboardAccess(agentId);
        }}
        onOpenUpgradeModal={(tier) => {
          setShowCinematicModal(false);
          setSelectedTierChoice(tier.toLowerCase().includes("enterprise") ? "enterprise" : "pro");
          setRegistrationModalOpen(true);
        }}
      />

      {/* CENTRAL ADMIN LEADS & ACCESS CONTROL DATABASE MODAL */}
      <AdminDatabaseModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onLaunchDashboard={onEnterApp}
        currentUserEmail={registeredUser?.email || ""}
        lang={lang}
      />

      {/* 1-TAG ACCESS KEY / QUANTUM SOVEREIGN LOGIN MODAL */}
      <KeyLoginModal
        isOpen={keyLoginModalOpen}
        onClose={() => setKeyLoginModalOpen(false)}
        onKeySuccess={(email) => {
          setCurrentUserEmail(email);
          onEnterApp();
        }}
        onSuccess={(email) => {
          setCurrentUserEmail(email);
          onEnterApp();
        }}
        onOpenDailyUsage={() => setDailyUsageModalOpen(true)}
        onOpenUserTerminal={(tab) => {
          setUserTerminalInitialTab((tab as any) || "overview");
          setUserTerminalModalOpen(true);
        }}
        lang={lang}
      />

      {/* SOVEREIGN USER ACCOUNT & BILLING TERMINAL MODAL */}
      <UserAccountTerminalModal
        isOpen={userTerminalModalOpen}
        onClose={() => setUserTerminalModalOpen(false)}
        onLaunchDashboard={onEnterApp}
        onOpenDailyUsage={() => setDailyUsageModalOpen(true)}
        userEmail={registeredUser?.email || getCurrentUserEmail()}
        lang={lang}
        initialTab={userTerminalInitialTab}
      />

      {/* 24H TRIAL EXPIRATION & ACCESS NOTICE MODAL */}
      <TrialAccessNoticeModal
        isOpen={trialNoticeModalOpen}
        onClose={() => setTrialNoticeModalOpen(false)}
        trialStatus={currentTrialStatus}
        userEmail={registeredUser?.email || getCurrentUserEmail()}
        lang={lang}
        onOpenPaymentTerminal={() => {
          setTrialNoticeModalOpen(false);
          setUserTerminalInitialTab("payment");
          setUserTerminalModalOpen(true);
        }}
        onContinueTrial={() => {
          setTrialNoticeModalOpen(false);
          onEnterApp();
        }}
      />

      {/* AVERAGE DAILY USAGE TELEMETRY DASHBOARD */}
      <DailyUsageDashboardModal
        isOpen={dailyUsageModalOpen}
        onClose={() => setDailyUsageModalOpen(false)}
        userRole={userProfile.purchasedRole}
        lang={lang}
      />

      {/* ACCESS PENDING / APPROVAL NOTICE MODAL */}
      {accessNoticeModalOpen && accessNoticeData && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-700 rounded-3xl p-6 shadow-2xl text-center font-mono space-y-4 animate-scaleUp text-zinc-200">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white mx-auto shadow-lg">
              <AlertCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">{accessNoticeData.title}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{accessNoticeData.desc}</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 text-left space-y-1">
              <div className="flex items-center justify-between text-zinc-300 font-bold">
                <span>Admin-Prüfung:</span>
                <span className="text-white">philippsteidle5@gmail.com</span>
              </div>
              <div>Dein Platz wurde reserviert. Sobald der Administrator deinen Zugang gewährt, kannst du direkt starten.</div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setAccessNoticeModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Schließen
              </button>
              {(isSuperAdminEmail(registeredUser?.email) || isSuperAdminEmail(getCurrentUserEmail()) || isStoredAdminAuthenticated()) && (
                <button
                  onClick={() => {
                    setAccessNoticeModalOpen(false);
                    setAdminModalOpen(true);
                  }}
                  className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-md"
                  title="Key Login"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>KEY LOGIN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OPEN BETA ACCESS GATE MODAL (SYSTEM ACCESS EXCLUSIVELY FOR ADMINS & REGISTERED BETA TESTERS) */}
      {openBetaGateModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border-2 border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center font-mono space-y-5 animate-scaleUp text-zinc-200 relative">
            <button
              onClick={() => setOpenBetaGateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-400 flex items-center justify-center text-cyan-300 mx-auto shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>SYNTAXOS.NET // OPEN BETA BATCH 1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                {lang === "de" ? "GESCHLOSSENE OPEN BETA PHASE" : "CLOSED OPEN BETA PHASE"}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
                {lang === "de"
                  ? "S.Y.N.T.A.X. OS befindet sich aktuell im exklusiven Rollout auf syntaxos.net. Der direkte Matrix-Zugang ist zurzeit für System-Administratoren reserviert. Bewirb dich jetzt kostenfrei für die Open Beta oder logge dich als Administrator ein."
                  : "S.Y.N.T.A.X. OS is currently in exclusive rollout on syntaxos.net. Direct matrix access is strictly reserved for system administrators. Apply now for open beta or log in as administrator."}
              </p>
            </div>

            {/* System Status Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-300 font-bold border-b border-zinc-800 pb-2">
                <span className="text-slate-400">Verfügbare Beta-Slots:</span>
                <span className="text-rose-400 font-black">{remainingSpots} / {TOTAL_SPOTS} Plätze frei</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 font-bold">
                <span className="text-slate-400">Admin-Status:</span>
                <span className="text-cyan-300 font-bold">Freischaltung durch Philipp Steidle</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOpenBetaGateModalOpen(false);
                  setRegistrationModalOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-sans font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{lang === "de" ? "🚀 JETZT FÜR OPEN BETA BEWERBEN (100% KOSTENLOS)" : "🚀 JOIN OPEN BETA WAITLIST (FREE)"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenBetaGateModalOpen(false);
                  setKeyLoginModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-400 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-cyan-400" />
                <span>{lang === "de" ? "🔑 LOGIN // BEREITS REGISTRIERT?" : "🔑 SIGN IN // ALREADY REGISTERED?"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-CONVERSION STICKY PUSH-UP CTA BAR WITH 500 SPOTS TRACKER */}
      {showStickyCta && !isStickyDismissed && (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-5 md:left-1/2 md:-translate-x-1/2 z-40 w-full md:w-[94%] md:max-w-2xl bg-zinc-950/95 backdrop-blur-xl border-t md:border border-zinc-700 md:rounded-2xl shadow-2xl p-3 md:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Info / Value proposition & Scarcity */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  <span>S.Y.N.T.A.X. SOVEREIGN OS</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[9px] uppercase font-mono font-bold">
                    {lang === "de" ? `NUR NOCH ${remainingSpots}/500 FREI` : `ONLY ${remainingSpots}/500 LEFT`}
                  </span>
                </div>
                <div className="text-[10.5px] text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold">
                    {lang === "de" ? "8 KI-Agenten Live" : "8 AI Agents Live"}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300 font-bold">
                    {lang === "de" ? "100% Kostenlos" : "100% Free"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dismiss X button for Mobile view inside header */}
            <button
              onClick={() => setIsStickyDismissed(true)}
              className="sm:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              title={lang === "de" ? "Schließen" : "Dismiss"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CTAs Action Group */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setKeyLoginModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
              title="Mit bestehendem Account anmelden"
            >
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span>{lang === "de" ? "Anmelden" : "Sign In"}</span>
            </button>

            <button
              onClick={() => setRegistrationModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
              <span>{lang === "de" ? "GET EARLY ACCESS (24H FREE)" : "GET EARLY ACCESS (24H FREE)"}</span>
            </button>

            {/* Dismiss X button for Desktop view */}
            <button
              onClick={() => setIsStickyDismissed(true)}
              className="hidden sm:flex text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer ml-1"
              title={lang === "de" ? "Schließen" : "Dismiss"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
