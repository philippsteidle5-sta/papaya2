import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Brain,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Gift,
  ArrowRight,
  Shield,
  Zap,
  MessageSquare,
  Users,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Clock,
  Send,
  Bot,
  Terminal,
  Cpu,
  Mail,
  Video,
  Calendar,
  Share2,
  TrendingUp,
  Award,
  Globe,
  Star,
  Eye,
  Activity,
  Layers,
  CreditCard,
  Sliders,
  DollarSign,
  Laptop,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Play,
} from "lucide-react";
import {
  registerNewLead,
  validateAndRedeemAccessKey,
  verifyAdminSecretKey,
  setStoredAdminAuthenticated,
  SUPERADMIN_EMAIL,
  MASTER_ADMIN_SECRET_KEY,
  MASTER_ADMIN_PIN,
  getLeadsDatabase,
  setCurrentUserEmail,
  createAccessKey,
} from "../utils/leadDatabase";
import { ParticleBallCanvas } from "./ParticleBallCanvas";
import { RainbowParticleMemoryCanvas } from "./RainbowParticleMemoryCanvas";
import {
  PaymentMethodsBar,
  PaypalIcon,
  ApplePayIcon,
  GooglePayIcon,
  VisaIcon,
  MastercardIcon,
  AmexIcon,
  KlarnaIcon,
  SepaIcon,
  BitcoinIcon,
  StripeBadgeIcon,
} from "./PaymentMethodIcons";

export interface PapayaBetaWaitlistPageProps {
  onEnterApp: () => void;
  onViewSalesPage?: () => void;
  lang?: "de" | "en";
  onToggleLang?: () => void;
  onOpenAdminDatabase?: () => void;
}

// Target Launch & Deal Urgency Timer
const LAUNCH_DATE = new Date("2026-10-15T00:00:00Z").getTime();
const TOTAL_VIP_SLOTS = 500;
const INITIAL_CLAIMED_SLOTS = 472;

interface CoreAgent {
  id: string;
  name: string;
  short: string;
  title: string;
  color: string;
  glow: string;
  iconName: string;
  descriptionDe: string;
  descriptionEn: string;
  beforeDe: string;
  beforeEn: string;
  afterDe: string;
  afterEn: string;
  capabilitiesDe: string[];
  capabilitiesEn: string[];
  sampleQueryDe: string;
  sampleQueryEn: string;
  sampleAnswerDe: string;
  sampleAnswerEn: string;
}

const AGENTS: CoreAgent[] = [
  {
    id: "papaya",
    name: "PAPAYA CORE",
    short: "PAPAYA",
    title: "SOVEREIGN MASTER ARCHITECT",
    color: "#ff6b35",
    glow: "rgba(255, 107, 53, 0.35)",
    iconName: "Cpu",
    descriptionDe: "Zentraler Dirigent aller 8 Cores. Koordiniert komplexe Workflows, plant multi-modale Systemarchitekturen und steuert Gmail, Veo & Obsidian autonom.",
    descriptionEn: "Central conductor of all 8 cores. Orchestrates workflows, plans multimodal system architectures, and manages Gmail, Veo & Obsidian autonomously.",
    beforeDe: "45 Min. mühsames Springen zwischen 6 verschiedenen KI-Tools & Tabs mit manuellem Copy-Paste.",
    beforeEn: "45 mins of manual context jumping between 6 disparate tools and endless copy-pasting.",
    afterDe: "1 einziger Sprachbefehl – Papaya delegiert Aufgaben simultan an alle Cores in 12 Sekunden.",
    afterEn: "1 single voice prompt – Papaya dispatches tasks across all specialized cores in 12 seconds.",
    capabilitiesDe: ["Multi-Agent Orchestrierung", "Autonome Workflow-Automation", "Kontext-Synthese"],
    capabilitiesEn: ["Multi-Agent Orchestration", "Autonomous Workflow Automation", "Context Synthesis"],
    sampleQueryDe: "Analysiere mein gesamtes Projekt und erstelle die optimale 8-Core Architektur.",
    sampleQueryEn: "Analyze my whole project and establish the optimal 8-core architecture.",
    sampleAnswerDe: "Papaya Core: Systemarchitektur analysiert. 3 Hintergrund-Agenten delegiert: Vega für Code-Refactoring, Pulse für Social-Launch, Chronos für Sprint-Reservierung. Alle Tasks synchronisiert.",
    sampleAnswerEn: "Papaya Core: System architecture mapped. 3 sub-agents dispatched: Vega for code refactor, Pulse for social launch, Chronos for sprint reservation. Tasks synchronized.",
  },
  {
    id: "neo",
    name: "N.E.O.",
    short: "NEO",
    title: "SCREEN CO-PILOT & PERCEPTION",
    color: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.35)",
    iconName: "Eye",
    descriptionDe: "Echtzeit Bildschirm-Wahrnehmung & UI-Audit. Analysiert Live-Monitore, findet Code-Bugs und optimiert Conversion-Funnels in Sekundenschnelle.",
    descriptionEn: "Real-time screen perception & UI audit. Analyzes live monitor feeds, flags code bugs, and optimizes conversion funnels in seconds.",
    beforeDe: "Screenshots machen, zuschneiden, in ein Chatfenster laden und mühsam Fehlermeldungen abtippen.",
    beforeEn: "Taking screenshots, cropping, uploading to chatbots, and typing out complex errors manually.",
    afterDe: "0ms Screen Perception: N.E.O. sieht deinen Monitor live und behebt Bugs direkt während du tippst.",
    afterEn: "0ms Screen Perception: N.E.O. reads your active screen live and fixes bugs while you code.",
    capabilitiesDe: ["0ms Screen Perception", "Live UI/UX Diagnose", "Holographische Growth-Strategien"],
    capabilitiesEn: ["0ms Screen Perception", "Live UI/UX Diagnostics", "Holographic Growth Strategies"],
    sampleQueryDe: "Schau dir diesen Checkout-Screen an. Wo verlieren wir Nutzer?",
    sampleQueryEn: "Review this checkout screen. Where are we losing users?",
    sampleAnswerDe: "N.E.O. Perception: 3 UX-Friction Points erkannt. Reibung bei Zahlungs-CTA um 42% reduzierbar durch Single-Step Express Checkout und Floating Trust Badges.",
    sampleAnswerEn: "N.E.O. Perception: 3 UX friction points detected. Reduce drop-off by 42% using a single-step express checkout flow and floating trust badges.",
  },
  {
    id: "vega",
    name: "V.E.G.A.",
    short: "VEGA",
    title: "PRINCIPAL CODE & DATA ENGINEER",
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.35)",
    iconName: "Terminal",
    descriptionDe: "Senior Fullstack-Entwickler & Datenbank-Architekt. Schreibt performanten TypeScript-, Python- und Rust-Code mit strikter Typsicherheit.",
    descriptionEn: "Principal fullstack developer & database architect. Crafts production-ready TypeScript, Python, and Rust code with strict type safety.",
    beforeDe: "Stundenlanges Debuggen von Typfehlern und Memory Leaks bei komplexen React-Komponenten.",
    beforeEn: "Hours spent hunting down subtle TypeScript errors and memory leaks across large components.",
    afterDe: "Autonomer 120 FPS Code-Audit mit automatischer Optimierung & SQL-Schema-Validierung.",
    afterEn: "Autonomous 120 FPS code audit with automatic optimization & verified database schemas.",
    capabilitiesDe: ["Fullstack Architektur & Refactoring", "Zero-Latency API-Pipelines", "Sichere SQL & Vektoren"],
    capabilitiesEn: ["Fullstack Architecture & Refactoring", "Zero-Latency API Pipelines", "Secure SQL & Vectors"],
    sampleQueryDe: "Optimiere diese React-Komponente für flüssiges 120 FPS Rendering.",
    sampleQueryEn: "Optimize this React component for fluid 120 FPS rendering.",
    sampleAnswerDe: "V.E.G.A. Code Engine: Unnötige Re-Renders eliminiert, Virtualisierung via IntersectionObserver implementiert. Bundle-Größe um 38% gesenkt.",
    sampleAnswerEn: "V.E.G.A. Code Engine: Unnecessary re-renders eliminated, virtualization via IntersectionObserver implemented. Bundle size cut by 38%.",
  },
  {
    id: "odin",
    name: "O.D.I.N.",
    short: "ODIN",
    title: "CYBER SECURITY & VAULT FIREWALL",
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    iconName: "Shield",
    descriptionDe: "Militärische Zero-Trust-Sicherheit, Token-Verschlüsselung, Audit-Logs und proaktive Penetration-Testing-Schutzschilde.",
    descriptionEn: "Military-grade Zero-Trust security, token encryption, audit logs, and proactive penetration-testing shields.",
    beforeDe: "Ständige Sorge um Datenlecks und ungeschützte API-Keys im Frontend.",
    beforeEn: "Constant anxiety regarding leaked API credentials and unencrypted user sessions.",
    afterDe: "Automatische AES-256-Verschlüsselung aller Secrets mit lückenlosem Zero-Trust-Audit-Log.",
    afterEn: "Automated AES-256 encryption across all keys with tamper-proof zero-trust audit logs.",
    capabilitiesDe: ["Zero-Trust Auditierung", "End-to-End Verschlüsselung", "Automatisierte Security-Scans"],
    capabilitiesEn: ["Zero-Trust Auditing", "End-to-End Encryption", "Automated Security Scanning"],
    sampleQueryDe: "Überprüfe das System auf offene Angriffsvektoren.",
    sampleQueryEn: "Audit the system for potential attack vectors.",
    sampleAnswerDe: "O.D.I.N. Vault: 0 Schwachstellen erkannt. Alle API-Keys server-side gekapselt, Tokens mit AES-256-GCM verschlüsselt. Zero-Trust aktiv.",
    sampleAnswerEn: "O.D.I.N. Vault: 0 vulnerabilities found. All API keys encapsulated server-side, tokens AES-256-GCM encrypted. Zero-trust active.",
  },
  {
    id: "pulse",
    name: "P.U.L.S.E.",
    short: "PULSE",
    title: "GROWTH, VEO 3.1 & SOCIAL ENGINE",
    color: "#ec4899",
    glow: "rgba(236, 72, 153, 0.35)",
    iconName: "Video",
    descriptionDe: "Autonomes Google Veo 3.1 8K Video-Studio, virale Hook-Generierung und Multi-Platform Social Media Automatisierung.",
    descriptionEn: "Autonomous Google Veo 3.1 8K video studio, viral hook synthesis, and multi-channel social distribution engine.",
    beforeDe: "3 Stunden für 1 Video: Skript schreiben, Footage suchen, mühsam schneiden und exportieren.",
    beforeEn: "3 hours spent crafting one video: scripting, stock hunting, manual editing, and exporting.",
    afterDe: "8K cinematic Videos und fertige Social-Posts in unter 45 Sekunden auf Knopfdruck.",
    afterEn: "8K cinematic video renders and ready-to-publish social posts generated in under 45 seconds.",
    capabilitiesDe: ["Veo 3.1 8K Videoerstellung", "Virale Social-Media-Pipelines", "Autonome Content-Planung"],
    capabilitiesEn: ["Veo 3.1 8K Video Generation", "Viral Social Media Pipelines", "Autonomous Content Planning"],
    sampleQueryDe: "Erstelle ein 8K Teaser-Video für unseren Produkt-Launch.",
    sampleQueryEn: "Render an 8K teaser video for our upcoming product launch.",
    sampleAnswerDe: "Pulse Media Studio: 8K Teaser-Sequenz via Google Veo 3.1 gerendert. 3 virale Hooks für X, LinkedIn & Instagram generiert.",
    sampleAnswerEn: "Pulse Media Studio: 8K teaser rendered via Google Veo 3.1. 3 high-retention hooks prepared for X, LinkedIn & IG.",
  },
  {
    id: "chronos",
    name: "C.H.R.O.N.O.S.",
    short: "CHRONOS",
    title: "TIME WARP & CALENDAR ORCHESTRATOR",
    color: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.35)",
    iconName: "Calendar",
    descriptionDe: "Intelligente Kalender-Autonomie, Meeting-Triage und zeitoptimierte Task-Orchestrierung für maximale Produktivität.",
    descriptionEn: "Intelligent calendar autonomy, meeting triage, and time-optimized task scheduling for peak productivity.",
    beforeDe: "Termin-Konflikte, manuelle Kalendereinträge und 10 Hin- und Her-Mails für eine Terminfindung.",
    beforeEn: "Calendar double-bookings and 10 back-and-forth emails just to pin down a 30-minute call.",
    afterDe: "Chronos blockt Fokuszeiten, plant Meetings vollautomatisch und synchronisiert Deadlines in Echtzeit.",
    afterEn: "Chronos locks focus blocks, schedules meetings autonomously, and syncs project milestones in real-time.",
    capabilitiesDe: ["Autonome Kalender-Triage", "Fokus-Zeit-Schutz", "Echtzeit-Meeting-Orchestrierung"],
    capabilitiesEn: ["Autonomous Calendar Triage", "Deep Work Protection", "Real-Time Meeting Orchestration"],
    sampleQueryDe: "Organisiere meine Woche und blocke 15 Stunden Deep Work.",
    sampleQueryEn: "Structure my week and protect 15 hours of deep work blocks.",
    sampleAnswerDe: "Chronos Calendar: 15 Stunden ununterbrochene Deep-Work-Blöcke reserviert. 4 unwichtige Meetings auf asynchrone Briefings umgestellt.",
    sampleAnswerEn: "Chronos Calendar: 15 hours of uninterrupted deep work secured. 4 low-priority meetings shifted to async briefings.",
  },
  {
    id: "osiris",
    name: "O.S.I.R.I.S.",
    short: "OSIRIS",
    title: "DEEP INTEL & MARKET RADAR",
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
    iconName: "TrendingUp",
    descriptionDe: "Echtzeit-Web-Recherche, Konkurrenz-Radar und Markt-Analysen mit belegbaren Quellen und Fact-Checking.",
    descriptionEn: "Real-time web reconnaissance, competitor intelligence, and market trend tracking with grounded citations.",
    beforeDe: "Tage langes Googeln und Durchforsten unzähliger Blogs ohne klare Handlungsempfehlung.",
    beforeEn: "Days spent sifting through search results and blogs without getting concrete actionable insights.",
    afterDe: "Kompakte Intel-Briefings mit belegbaren Quellen und klaren Marktchancen in 2 Minuten.",
    afterEn: "Grounded competitive briefings with verified sources and immediate market opportunities in 2 minutes.",
    capabilitiesDe: ["Deep Research & Grounding", "Echtzeit-Markt-Radar", "Geprüfte Quellen-Synthese"],
    capabilitiesEn: ["Deep Research & Grounding", "Real-Time Market Radar", "Grounded Source Synthesis"],
    sampleQueryDe: "Welche neuen Trends dominieren unsere Nische diese Woche?",
    sampleQueryEn: "What emerging trends are disrupting our niche this week?",
    sampleAnswerDe: "Osiris Intel: 3 Schlüsseltrends analysiert. 14 verifizierte Quellen ausgewertet. Konkurrent X hat Pricing um 20% erhöht – Marktlücke identifiziert.",
    sampleAnswerEn: "Osiris Intel: 3 key trends mapped across 14 verified citations. Competitor X raised prices by 20% – open market window identified.",
  },
  {
    id: "lyra",
    name: "L.Y.R.A.",
    short: "LYRA",
    title: "SYNTHESIS & NEURAL VOICE ORB",
    color: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.35)",
    iconName: "MessageSquare",
    descriptionDe: "Natürlich klingende Mehrkanal-Sprachausgabe mit lebendiger Intonation und lückenloser Sprachsteuerung in Echtzeit.",
    descriptionEn: "Hyper-realistic multi-channel voice synthesis with organic inflection and continuous real-time voice guidance.",
    beforeDe: "Roboterhafte Computerstimmen, die ermüden und monotone Monologe ablesen.",
    beforeEn: "Robotic text-to-speech voices that fatigue ears and recite monotone monologues.",
    afterDe: "Lebensechte, menschliche Sprach-Konferenzen mit natürlicher Unterbrechungsmöglichkeit.",
    afterEn: "Life-like voice conferences with sub-200ms latency and seamless human interruptibility.",
    capabilitiesDe: ["Sub-200ms Audio Latenz", "Natürliche Intonation", "Multi-Agenten-Sprachkonferenz"],
    capabilitiesEn: ["Sub-200ms Audio Latency", "Natural Human Inflection", "Multi-Agent Voice Conference"],
    sampleQueryDe: "Fasse das Meeting zusammen und sprich mir das Briefing ein.",
    sampleQueryEn: "Summarize the key meeting takeaways and speak the briefing.",
    sampleAnswerDe: "Lyra Voice: Audio-Briefing gerendert. 3 Kernbeschlüsse in 45 Sekunden lebensecht zusammengefasst. Direkt anhörbar.",
    sampleAnswerEn: "Lyra Voice: Audio brief compiled. 3 strategic decisions summarized with natural human cadence in 45 seconds.",
  },
  {
    id: "memory",
    name: "RAINBOW MEMORY",
    short: "🌈 MEMORY",
    title: "SOVEREIGN QUANTUM MEMORY CLOUD & VECTOR RAG (2.514 KNOTEN)",
    color: "#ec4899",
    glow: "rgba(236, 72, 153, 0.45)",
    iconName: "Sparkles",
    descriptionDe: "Das unendliche Langzeitgedächtnis aller Cores. Speichert 2.514+ neuronale Wissensknoten in einer hochdimensionalen Regenbogen-Partikelwolke. Vergisst nie, synthetisiert Wissen über Wochen hinweg und versorgt alle 8 Agenten mit blitzschnellem Kontext.",
    descriptionEn: "The sovereign long-term memory across all cores. Houses 2,514+ neural knowledge nodes in an ultra-dimensional rainbow particle cloud. Never forgets, synthesizes context across weeks, and feeds all 8 agents instantly.",
    beforeDe: "Jeder Chat startet bei Null: Kontext geht verloren, wiederholtes Erklären und ständiger Wissensverlust.",
    beforeEn: "Every session starts from scratch: lost context, repetitive prompting, and endless fragmentation.",
    afterDe: "0% Kontextverlust: Die Rainbow-Memory-Wolke verknüpft automatisch Präferenzen, Code-Snippets, E-Mails & Projekt-Historie in Echtzeit.",
    afterEn: "0% Context Loss: The Rainbow Memory cloud automatically maps user preferences, code snippets, emails & project milestones in real-time.",
    capabilitiesDe: ["2.514+ Persistente Memory-Knoten", "Zero-Latency Vektor-Retrieval (RAG)", "Spektrale Rainbow-Partikel Assoziation", "Multi-Agent Wissens-Synchronisation"],
    capabilitiesEn: ["2,514+ Persistent Memory Nodes", "Zero-Latency Vector RAG", "Spectral Rainbow Particle Association", "Multi-Agent Knowledge Sync"],
    sampleQueryDe: "Welche Präferenzen und Projekt-Deadlines hast du für mein Q4-Projekt gespeichert?",
    sampleQueryEn: "What preferences and project deadlines do you have saved for my Q4 launch?",
    sampleAnswerDe: "🌈 Rainbow Memory Node: 47 synaptische Erinnerungen aktiv aufgerufen. Projekt-Frist: 15. November. Bevorzugter Tech-Stack: React, TypeScript, Tailwind. Letztes Briefing mit Agent Vega synchronisiert.",
    sampleAnswerEn: "🌈 Rainbow Memory Node: 47 synaptic memories recalled. Project deadline: Nov 15. Preferred stack: React, TypeScript, Tailwind. Last briefing synced with Vega.",
  },
];

const TESTIMONIALS = [
  {
    name: "Maximilian K.",
    role: "Founder & SaaS Builder",
    company: "ScaleFlow Labs",
    avatar: "MK",
    rating: 5,
    tag: "Verifizierter Lifetime Founder",
    textDe: "Der Lifetime Pass mit dem Extra-Code für meinen Co-Founder war die beste Investition des Jahres. Wir nutzen Screen-Perception täglich beim Frontend-Audit. Spart uns mindestens 2 Entwickler-Stunden pro Tag!",
    textEn: "The Lifetime Pass with the extra key for my co-founder was the best investment of the year. We use Screen Perception daily for frontend audits. Saves us at least 2 developer hours every day!",
    metricDe: "14h / Woche gespart",
    metricEn: "14h / week saved",
  },
  {
    name: "Dr. Sarah Lindner",
    role: "Senior AI & Data Architect",
    company: "Cognitive Solutions",
    avatar: "SL",
    rating: 5,
    tag: "Pro Member",
    textDe: "Endlich kein Tab-Chaos mehr. Vega und Odin übernehmen Refactorings und Security-Checks schneller als jedes andere Tool, das ich je getestet habe. Die 3 Tage Testphase haben mich sofort überzeugt.",
    textEn: "Finally no more tab chaos. Vega and Odin handle refactoring and security checks faster than any tool I have ever tried. The 3-day trial won me over instantly.",
    metricDe: "99.8% Code-Trefferquote",
    metricEn: "99.8% code accuracy",
  },
  {
    name: "Julian Brand",
    role: "Agency Inhaber & Creator",
    company: "Apex Media Group",
    avatar: "JB",
    rating: 5,
    tag: "Verifizierter Lifetime Founder",
    textDe: "Ich habe die kostenlose 3-Tage-Phase am Vormittag gestartet und am Nachmittag direkt den Lifetime Deal geholt. Den 2. Pass hat mein Head of Video bekommen – das Google Veo 3.1 Studio ist der absolute Wahnsinn!",
    textEn: "I started the 3-day free trial in the morning and bought the Lifetime deal that afternoon. Gave the 2nd key to my Head of Video – the Google Veo 3.1 studio is pure magic!",
    metricDe: "+320% Video-Output",
    metricEn: "+320% video output",
  },
  {
    name: "Elena Rostova",
    role: "Productivity Lead",
    company: "Nordic Ventures",
    avatar: "ER",
    rating: 5,
    tag: "Founding Member",
    textDe: "Die autonome Gmail-Triage und Chronos Kalender-Steuerung sind absolute Gamechanger. 50 Kunden-Mails in 10 Sekunden gescannt und kategorisiert. Ich kann mir ein Arbeiten ohne PapayaOS nicht mehr vorstellen.",
    textEn: "Autonomous Gmail triage and Chronos calendar scheduling are game changers. 50 client emails scanned and sorted in 10 seconds. I cannot imagine working without PapayaOS.",
    metricDe: "50 Mails in 10 Sek.",
    metricEn: "50 emails in 10s",
  },
];

export const PapayaBetaWaitlistPage: React.FC<PapayaBetaWaitlistPageProps> = ({
  onEnterApp,
  onViewSalesPage,
  lang = "de",
  onToggleLang,
  onOpenAdminDatabase,
}) => {
  // Canvas Ref for ambient star cosmos
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Billing Toggle (Monthly vs Yearly)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Selected Core for Workflow Showcase
  const [selectedAgentId, setSelectedAgentId] = useState<string>("papaya");
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<"trial" | "pro" | "lifetime">("lifetime");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"card" | "paypal" | "apple" | "google" | "klarna" | "sepa" | "crypto">("card");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccessKeys, setCheckoutSuccessKeys] = useState<{ mainKey: string; extraKey?: string } | null>(null);
  const [hasCopiedMainKey, setHasCopiedMainKey] = useState(false);
  const [hasCopiedExtraKey, setHasCopiedExtraKey] = useState(false);

  // Passkey Login Modal State
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Urgency Countdown
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 18,
    hours: 7,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ambient Star Canvas Animation with Papaya Orange Accents (Zero-lag, 60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particleCount = 35;
    const COLOR_PALETTE = [
      "rgba(255, 107, 53, 0.85)",
      "rgba(255, 143, 61, 0.75)",
      "rgba(255, 42, 141, 0.80)",
      "rgba(6, 182, 212, 0.75)",
      "rgba(168, 85, 247, 0.70)",
      "rgba(255, 255, 255, 0.90)",
      "rgba(255, 214, 10, 0.80)",
    ];

    const particles = Array.from({ length: particleCount }, (_, idx) => {
      const isCoreNode = idx % 5 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isCoreNode ? 0.3 : 0.18),
        vy: (Math.random() - 0.5) * (isCoreNode ? 0.3 : 0.18),
        radius: isCoreNode ? Math.random() * 1.6 + 1.1 : Math.random() * 0.9 + 0.5,
        color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
        opacity: Math.random() * 0.4 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        isCoreNode,
      };
    });

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dynamicAlpha = Math.max(0.12, p.opacity + Math.sin(frame * p.twinkleSpeed + p.twinkleOffset) * 0.2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = dynamicAlpha;
        ctx.fill();

        if (p.isCoreNode) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = dynamicAlpha * 0.15;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle Workflow Simulation
  const handleRunSimulator = () => {
    const currentAgent = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[0];
    setIsSimulatingAgent(true);
    setSimulatedResponse(null);

    setTimeout(() => {
      setSimulatedResponse(lang === "de" ? currentAgent.sampleAnswerDe : currentAgent.sampleAnswerEn);
      setIsSimulatingAgent(false);
    }, 700);
  };

  // Open Checkout for a specific plan
  const handleSelectPlan = (plan: "trial" | "pro" | "lifetime") => {
    setSelectedCheckoutPlan(plan);
    setCheckoutSuccessKeys(null);
    setIsCheckoutOpen(true);
  };

  // Handle Checkout submission
  const handleCompleteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutEmail || !checkoutEmail.includes("@")) return;

    setIsProcessingCheckout(true);

    setTimeout(() => {
      if (selectedCheckoutPlan === "trial") {
        // Free 3-Day Passkey
        const trialKey = `PAPAYA-3DAY-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        createAccessKey(trialKey, "Trial 3-Tage Zugang", 3);
        registerNewLead({
          name: checkoutName || "Free Trial User",
          email: checkoutEmail,
          goal: "Trial User",
          trialDays: 3,
          source: "Sales Page (3-Tage Free Pass)",
          token: trialKey,
        });
        setCurrentUserEmail(checkoutEmail);
        setCheckoutSuccessKeys({ mainKey: trialKey });
      } else if (selectedCheckoutPlan === "lifetime") {
        // Lifetime Founder Pass with EXTRA PASSKEY!
        const mainLifetimeKey = `PAPAYA-LIFETIME-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const extraPartnerKey = `PAPAYA-EXTRA-PASS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        createAccessKey(mainLifetimeKey, "Lifetime Founder Hauptlizenz", 3650);
        createAccessKey(extraPartnerKey, "Lifetime Founder Partnerlizenz (Geschenk)", 3650);
        
        registerNewLead({
          name: checkoutName || "Lifetime Founder",
          email: checkoutEmail,
          goal: "Lifetime Founder (2-in-1)",
          trialDays: 3650,
          source: "Sales Page (Lifetime Founder Pass + Extra Key)",
          token: mainLifetimeKey,
        });
        setCurrentUserEmail(checkoutEmail);
        setCheckoutSuccessKeys({ mainKey: mainLifetimeKey, extraKey: extraPartnerKey });
      } else {
        // Pro Plan
        const proKey = `PAPAYA-PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        createAccessKey(proKey, "Pro Membership", 365);
        registerNewLead({
          name: checkoutName || "Pro Member",
          email: checkoutEmail,
          goal: "Pro Member",
          trialDays: 365,
          source: `Sales Page (Pro ${billingCycle})`,
          token: proKey,
        });
        setCurrentUserEmail(checkoutEmail);
        setCheckoutSuccessKeys({ mainKey: proKey });
      }
      setIsProcessingCheckout(false);
    }, 800);
  };

  // Passkey verification
  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError(null);
    setPasskeySuccess(null);

    const clean = passkeyInput.trim();
    if (!clean) return;

    setIsVerifyingPasskey(true);

    if (verifyAdminSecretKey(clean)) {
      setStoredAdminAuthenticated(true);
      setCurrentUserEmail(SUPERADMIN_EMAIL);
      setPasskeySuccess(lang === "de" ? "✓ Master-Admin Zugriff gewährt! Öffne PapayaOS..." : "✓ Master Admin Access Granted! Launching PapayaOS...");
      setTimeout(() => {
        setIsPasskeyModalOpen(false);
        onEnterApp();
      }, 700);
      setIsVerifyingPasskey(false);
      return;
    }

    const res = validateAndRedeemAccessKey(clean);
    if (res.success) {
      setPasskeySuccess(lang === "de" ? "✓ Passkey aktiviert! Starte Session..." : "✓ Passkey Activated! Launching Session...");
      setTimeout(() => {
        setIsPasskeyModalOpen(false);
        onEnterApp();
      }, 700);
    } else {
      setPasskeyError(res.message);
    }
    setIsVerifyingPasskey(false);
  };

  const activeAgent = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[0];

  const faqs = [
    {
      qDe: "Wie funktioniert die kostenlose 3-Tage-Phase genau?",
      qEn: "How does the free 3-day trial work?",
      aDe: "Du kannst PapayaOS 3 volle Tage lang mit allen 8 Cores uneingeschränkt testen. Du musst keine Kreditkarte oder Bezahldaten angeben. Nach 3 Tagen endet der Zugriff automatisch – kein verstecktes Abo, keine automatische Verlängerung.",
      aEn: "You can test PapayaOS for 3 full days with unlimited access to all 8 cores. No credit card required. After 3 days, access ends automatically with zero hidden fees or automatic renewals.",
    },
    {
      qDe: "Was bedeutet 'Exklusiver Lifetime Pass inklusive Extra-Pass'?",
      qEn: "What does 'Exclusive Lifetime Pass including Extra Pass' mean?",
      aDe: "Beim Kauf des Lifetime Founder Passes erhältst du ZWEI vollwertige Lifetime-Lizenzen! Eine für dich und einen separaten zweiten Passkey für deinen Mitgründer, Partner oder besten Freund. Beide Schlüssel behalten ihren lebenslangen Vollzugriff ohne wiederkehrende Kosten.",
      aEn: "When purchasing the Lifetime Founder Pass, you receive TWO full lifetime licenses! One for yourself and an extra passkey for your co-founder, partner, or friend. Both keys retain permanent lifetime access with zero recurring subscription fees.",
    },
    {
      qDe: "Gibt es eine Geld-zurück-Garantie?",
      qEn: "Is there a money-back guarantee?",
      aDe: "Ja, zu 100%. Für den Lifetime Pass und alle Pro-Abonnements gilt eine 14-tägige bedingungslose Geld-zurück-Garantie. Bist du nicht vollkommen begeistert, erstatten wir jeden Cent ohne lästige Nachfragen zurück.",
      aEn: "Yes, 100%. We provide a 14-day unconditional money-back guarantee on the Lifetime Pass and Pro plans. If you are not completely satisfied, we refund every cent instantly.",
    },
    {
      qDe: "Was unterscheidet PapayaOS von ChatGPT oder Claude?",
      qEn: "How does PapayaOS differ from ChatGPT or Claude?",
      aDe: "Standard-Chatbots sind isolierte Textfenster. PapayaOS ist ein vollwertiges Betriebssystem mit 8 spezialisierten Agenten, die zusammenarbeiten: Real-Time Screen-Perception, autonome Gmail-Bearbeitung, Google Veo 3.1 8K Videoerstellung, Chronos-Kalendersteuerung und ein 3D-Vektor-Gedächtnis.",
      aEn: "Traditional chatbots are isolated text boxes. PapayaOS is a full autonomous operating system with 8 orchestrated AI specialists: zero-latency screen perception, Gmail inbox triage, Google Veo 3.1 video creation, Chronos calendar automation, and a 3D neural knowledge graph.",
    },
    {
      qDe: "Ich habe bereits einen Passkey – wie logge ich mich ein?",
      qEn: "I already have a passkey – how do I log in?",
      aDe: "Klicke einfach oben rechts auf 'Passkey / Login' oder gib deinen persönlichen Key (z. B. 'maria', 16-stelliger Code oder Admin-Key) ein. Das System schaltet dein Dashboard sofort ohne Wartezeit frei.",
      aEn: "Simply click 'Passkey / Login' at the top right and enter your private key. You will be routed straight into the live PapayaOS workspace immediately.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-white/20 selection:text-white">
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-80" />

      {/* Top Floating Notification Ticker - Limited Deal Alert */}
      <div className="relative z-20 w-full bg-black/90 border-b border-zinc-800/80 backdrop-blur-md py-1.5 px-4 text-xs font-mono text-center flex items-center justify-center gap-2 overflow-hidden">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b35]"></span>
        </span>
        <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
          {lang === "de" ? "LIMITED FOUNDER DEAL:" : "LIMITED FOUNDER DEAL:"}
        </span>
        <span className="text-zinc-400 text-[11px] truncate">
          <strong className="text-white">Lifetime Pass beinhaltet 1 Extra VIP-Lizenz geschenkt</strong> (2-in-1) ·{" "}
          <span className="text-orange-400 font-semibold">Nur noch {TOTAL_VIP_SLOTS - INITIAL_CLAIMED_SLOTS} Kontingente</span>
        </span>
      </div>

      {/* Main Header / Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-zinc-900/80">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 select-none">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.4)]">
            <span className="text-lg font-black text-white">P</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base font-black tracking-wider text-white">
                PAPAYA<span className="text-[#ff6b35]">OS</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold uppercase">
                PRO 2.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500">AUTONOMOUS INTELLIGENCE SUITE</p>
          </div>
        </div>

        {/* Center Quick Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-950/80 border border-zinc-800/80 rounded-full px-4 py-1.5 backdrop-blur-md text-xs font-mono text-zinc-400">
          <a href="#sales-hero" className="px-3 py-1 rounded-full hover:text-white transition-colors">
            {lang === "de" ? "Übersicht" : "Overview"}
          </a>
          <a href="#cores-showcase" className="px-3 py-1 rounded-full hover:text-white transition-colors">
            {lang === "de" ? "8 Cores" : "8 Cores"}
          </a>
          <a href="#pricing-table" className="px-3 py-1 rounded-full text-orange-400 font-bold hover:text-orange-300 transition-colors">
            {lang === "de" ? "Preise & Deals" : "Pricing & Deals"}
          </a>
          <a href="#testimonials" className="px-3 py-1 rounded-full hover:text-white transition-colors">
            {lang === "de" ? "Bewertungen" : "Reviews"}
          </a>
          <a href="#faq" className="px-3 py-1 rounded-full hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 font-semibold transition cursor-pointer"
            >
              {lang.toUpperCase()}
            </button>
          )}

          <button
            onClick={() => setIsPasskeyModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-200 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Key className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Passkey / Login</span>
            <span className="sm:hidden">Login</span>
          </button>

          <a
            href="#pricing-table"
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d] hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(255,107,53,0.4)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>{lang === "de" ? "Jetzt starten" : "Get Started"}</span>
          </a>
        </div>
      </header>

      {/* 1. HERO SECTION (HIGH CONVERSION SALES HERO WITH 1 BALL) */}
      <main id="sales-hero" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN: HEADLINE, VALUE PROP & DIRECT CTAS */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 text-xs font-mono tracking-wider uppercase mb-5 text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b35]"></span>
              </span>
              <span className="text-zinc-200 font-semibold tracking-wider">
                {lang === "de" ? "01 · SOVEREIGN AI OPERATING SYSTEM" : "01 · SOVEREIGN AI OPERATING SYSTEM"}
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-[#ff6b35] font-bold">SOFORT VERFÜGBAR</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08]">
              {lang === "de" ? (
                <>
                  Hör auf Tools zu abonnieren. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d]">
                    Starte dein eigenes KI-System.
                  </span>
                </>
              ) : (
                <>
                  Stop subscribing to tools. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d]">
                    Own your autonomous AI OS.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              {lang === "de"
                ? "8 spezialisierte Cores, die synchron für dich arbeiten: Screen-Perception in Echtzeit, autonome Gmail-Triage, 8K Veo Video Studio, Chronos Kalender & 3D Knowledge Graph. 3 Tage gratis testen oder Lifetime Founder Deal sichern."
                : "8 specialized cores working in sync: real-time screen perception, autonomous Gmail intelligence, 8K Veo video studio & Chronos calendar. Test 3 days free or lock in the Lifetime Founder pass."}
            </p>

            {/* Direct Dual CTAs: Lifetime Pass (Primary Deal) + Free 3-Day Trial */}
            <div className="w-full max-w-xl mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => handleSelectPlan("lifetime")}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d] hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_35px_rgba(255,107,53,0.5)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{lang === "de" ? "Lifetime Pass sichern (149.99 €) →" : "Claim Lifetime Pass (149.99 €) →"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPlan("trial")}
                className="px-6 py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Gift className="w-4 h-4 text-orange-400" />
                <span>{lang === "de" ? "3 Tage kostenlos testen" : "3-Day Free Trial"}</span>
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3 Tage gratis (keine Kreditkarte)</span>
              </span>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>4.9 / 5.0 (340+ Gründer)</span>
              </span>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>14 Tage Geld-zurück-Garantie</span>
              </span>
            </div>

            {/* Payment Method Icons in Hero */}
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-sans font-medium text-zinc-400 mr-1 select-none">
                {lang === "de" ? "Zahlung:" : "Payment:"}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <VisaIcon size="sm" />
                <MastercardIcon size="sm" />
                <AmexIcon size="sm" />
                <PaypalIcon size="sm" />
                <ApplePayIcon size="sm" />
                <GooglePayIcon size="sm" />
                <KlarnaIcon size="sm" />
                <SepaIcon size="sm" />
                <BitcoinIcon size="sm" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SINGLE 3D PARTICLE BALL (PRESERVED AS REQUESTED) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full mt-6 lg:mt-0">
            <ParticleBallCanvas
              size={500}
              className="w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] aspect-square"
            />
          </div>
        </div>
      </main>

      {/* 2. WORKFLOW-SHOWCASE: DAS NEURAL-PARTICLE BRAIN MEMORY */}
      <section id="cores-showcase" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.08]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest mb-4 backdrop-blur-xl">
            <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{lang === "de" ? "02 · NEURALES 3D BRAIN MEMORY" : "02 · NEURAL 3D BRAIN MEMORY"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {lang === "de"
              ? "Das 4.200-Knoten Brain: Kollektives Gedächtnis aller Cores."
              : "The 4,200-Node Brain: Collective Memory of All Cores."}
          </h2>
          <p className="mt-3.5 text-zinc-400 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed font-sans">
            {lang === "de"
              ? "Das neuronale Langzeitgedächtnis in anatomischer 3D-Gehirnstruktur. 4.200 synaptische Vektorknoten und Axone verbinden Code-ASTs, Termine, Research und Medien über alle 8 Cores in Echtzeit."
              : "The neural long-term memory in true 3D brain architecture. 4,200 synaptic vector nodes and axons interconnect code ASTs, schedules, research and multimodal media across all 8 cores in real-time."}
          </p>
        </div>

        {/* 3D RAINBOW-PARTICLE MEMORY SHOWCASE CANVAS */}
        <div>
          <RainbowParticleMemoryCanvas
            lang={lang}
            activeAgentId={selectedAgentId}
            onSelectMemoryFact={(fact) => {
              setSimulatedResponse(fact);
            }}
          />
        </div>
      </section>

      {/* 3. INTERAKTIVE PRICING-TABELLE MIT CHECKOUT */}
      <section id="pricing-table" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#ff6b35] block mb-3">
            {lang === "de" ? "03 · TRANSPARENTE PREISE & LIFETIME FOUNDER ANGEBOT" : "03 · TRANSPARENT PRICING & LIFETIME DEAL"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {lang === "de" ? "Wähle deinen Einstieg in die sovereign KI-Zukunft." : "Choose Your Sovereign AI Entry Point."}
          </h2>
          <p className="mt-3 text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {lang === "de"
              ? "Starte heute 3 Tage 100% kostenlos ohne Risiko – oder sichere dir den limitierten Lifetime Founder Pass inklusive 1 Extra-VIP-Lizenz geschenkt."
              : "Start today with a 3-day 100% free trial – or lock in the limited Lifetime Founder Pass including 1 bonus VIP key."}
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                billingCycle === "monthly" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              {lang === "de" ? "Monatlich" : "Monthly"}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-[#ff6b35] to-[#ff2a8d] text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>{lang === "de" ? "Jährlich" : "Yearly"}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-amber-300 font-black">
                -25%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* TIER 1: LIFETIME FOUNDER PASS (HIGHLIGHT CARD WITH EXTRA PASS) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-orange-950/40 via-zinc-950 to-black border-2 border-orange-500 shadow-[0_0_50px_rgba(255,107,53,0.3)] relative flex flex-col justify-between transform lg:-translate-y-2">
            {/* Top Deal Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d] text-white font-mono text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>LIMITIERTER DEAL · INKL. 2. PASSKEY</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                  {lang === "de" ? "LIFETIME FOUNDER PASS" : "LIFETIME FOUNDER PASS"}
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/50 text-[11px] font-mono font-bold text-orange-300">
                  EINMALZAHLUNG
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">149.99 €</span>
                  <span className="text-zinc-500 font-mono text-sm line-through">299 €</span>
                </div>
                <p className="text-xs text-orange-200 mt-2 font-medium">
                  {lang === "de"
                    ? "Lebenslang alles inklusive. Keine monatlichen Kosten mehr."
                    : "Lifetime full access. Zero monthly subscription fees forever."}
                </p>
              </div>

              {/* EXTRA PASSKEY HIGHLIGHT BOX */}
              <div className="p-4 rounded-2xl bg-orange-950/50 border border-orange-500/60 mb-6 text-left shadow-inner">
                <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-300 uppercase mb-1">
                  <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>INKLUSIVE 1 EXTRA VIP-PASSKEY:</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {lang === "de"
                    ? "Du erhältst ZWEI vollwertige Lifetime-Lizenzen! Eine für dich und einen 2. Code zum Verschenken an Mitgründer oder Partner."
                    : "You receive TWO full lifetime keys! One for yourself and an extra key to gift to a co-founder or friend."}
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs text-left">
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <Check className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Lebenslanger Vollzugriff auf alle 8 Cores</span>
                </div>
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <Check className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Priorisierte 8K GPU-Cluster (0ms Latenz)</span>
                </div>
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <Check className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Google Veo 3.1 & Gmail AI unlimitiert</span>
                </div>
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <Check className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Discord VIP-Founder Lounge Zugang</span>
                </div>
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <Check className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>14 Tage bedingungslose Geld-zurück-Garantie</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => handleSelectPlan("lifetime")}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d] hover:brightness-110 text-white font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(255,107,53,0.5)] active:scale-95"
              >
                {lang === "de" ? "Lifetime Deal sichern (149.99 €) →" : "Get Lifetime Deal (149.99 €) →"}
              </button>
            </div>
          </div>

          {/* TIER 2: PRO MEMBERSHIP */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {lang === "de" ? "PRO MEMBER" : "PRO MEMBER"}
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400">
                  FLEXIBEL
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">
                    {billingCycle === "yearly" ? "29 €" : "39 €"}
                  </span>
                  <span className="text-zinc-400 font-mono text-xs">/ Monat</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {billingCycle === "yearly" ? "Jährlich abgerechnet (spare 120 € / Jahr)." : "Monatlich flexibel kündbar."}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800/80 font-mono text-xs text-left">
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Voller unbegrenzter Zugriff auf alle 8 Cores</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Gmail AI Inbox & Chronos Kalender</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Echtzeit Screen-Perception Co-Pilot</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Monatlich kündbar, kein Risiko</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => handleSelectPlan("pro")}
                className="w-full py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95"
              >
                {lang === "de" ? "Pro Plan wählen →" : "Choose Pro Plan →"}
              </button>
            </div>
          </div>

          {/* TIER 3: 3-TAGE FREE PASS */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {lang === "de" ? "SCHNUPPER-PASS" : "TRIAL PASS"}
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-mono font-bold text-zinc-300">
                  100% GRATIS
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">0 €</span>
                  <span className="text-zinc-400 font-mono text-xs">/ 3 Tage</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {lang === "de" ? "Keine Kreditkarte nötig. Kein Abo, endet automatisch." : "No credit card needed. No subscription, ends automatically."}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800/80 font-mono text-xs text-left">
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3 Tage uneingeschränkter Vollzugriff</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Alle 8 Cores freigeschaltet</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 persönlicher Sofort-Passkey</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <Check className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>Standard GPU-Rechenknoten</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => handleSelectPlan("trial")}
                className="w-full py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95"
              >
                {lang === "de" ? "Jetzt 3 Tage gratis starten →" : "Start 3 Days Free →"}
              </button>
            </div>
          </div>
        </div>

        {/* AKZEPTIERTE ZAHLUNGSMETHODEN & SICHERHEITSGARANTIE */}
        <div className="mt-12 p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md max-w-4xl mx-auto">
          <PaymentMethodsBar lang={lang} size="sm" variant="full" />
        </div>
      </section>

      {/* 4. KUNDEN-BEWERTUNGEN & TESTIMONIALS */}
      <section id="testimonials" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 block mb-3">
            {lang === "de" ? "04 · ERFAHRUNGEN & KUNDENBEWERTUNGEN" : "04 · VERIFIED CUSTOMER REVIEWS"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {lang === "de" ? "Von über 340+ Gründern & Teams täglich geliebt." : "Loved Daily By 340+ Founders & Power-Users."}
          </h2>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="font-mono text-sm font-bold text-white ml-2">4.9 / 5.0 Gesamtbewertung</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                    {t.tag}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-6 italic">
                  "{lang === "de" ? t.textDe : t.textEn}"
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-pink-600 flex items-center justify-center font-mono text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="font-mono text-xs font-bold text-white">{t.name}</h4>
                      <p className="text-[10px] text-zinc-500">{t.role}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-900/50">
                    {lang === "de" ? t.metricDe : t.metricEn}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ SEKTION */}
      <section id="faq" className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 border-t border-zinc-900">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 block mb-3">
            {lang === "de" ? "05 · FRAGEN & ANTWORTEN" : "05 · FREQUENTLY ASKED QUESTIONS"}
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {lang === "de" ? "Häufige Fragen zu den Lizenzen" : "Everything You Need To Know"}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
                  isOpen
                    ? "bg-gradient-to-r from-orange-950/40 via-zinc-950/95 to-purple-950/30 border-orange-500/60 shadow-[0_0_25px_rgba(255,107,53,0.15)]"
                    : "bg-zinc-950/80 hover:bg-orange-950/15 border-zinc-800/90 hover:border-orange-500/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-white font-mono text-sm font-bold cursor-pointer group transition"
                >
                  <span className={isOpen ? "text-orange-200" : "group-hover:text-orange-300"}>
                    {lang === "de" ? faq.qDe : faq.qEn}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-orange-400 transition-transform duration-300 shrink-0 ml-3 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-zinc-300 leading-relaxed font-sans border-t border-zinc-900/50 mt-1">
                    {lang === "de" ? faq.aDe : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER CTA STRIP */}
      <footer className="relative z-10 w-full border-t border-zinc-900 py-12 px-4 sm:px-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PAPAYAOS.AI</span>
            <span>·</span>
            <span>Sovereign Intelligence Suite 2.0</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <a href="#sales-hero" className="hover:text-white transition">Nach oben</a>
            <a href="#pricing-table" className="hover:text-white transition">Preise</a>
            <button onClick={() => setIsPasskeyModalOpen(true)} className="hover:text-white transition cursor-pointer">
              Passkey Login
            </button>
          </div>
        </div>
      </footer>

      {/* INTERAKTIVES CHECKOUT / SOFORT-PASSKEY MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-700 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white font-mono text-lg cursor-pointer"
            >
              ✕
            </button>

            {checkoutSuccessKeys ? (
              /* CHECKOUT SUCCESS: KEYS GENERATED */
              <div className="text-left space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="font-mono text-lg font-black text-white">
                    {selectedCheckoutPlan === "trial"
                      ? "3-TAGE GRATIS-ZUGANG FREIGESCHALTET!"
                      : "LIFETIME DEAL ERFOLGREICH FREIGESCHALTET!"}
                  </h3>
                </div>

                <p className="text-xs text-zinc-300">
                  {selectedCheckoutPlan === "lifetime"
                    ? "Hier sind deine 2 vollwertigen Lifetime-Passkeys. Speichere sie gut ab:"
                    : "Dein persönlicher 3-Tage-Passkey ist sofort aktiv:"}
                </p>

                {/* Main Key Box */}
                <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>HAUPTLIZENZ (FÜR DICH):</span>
                    <span className="text-emerald-400 font-bold">100% AKTIV</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-white">
                    <span className="font-bold select-all">{checkoutSuccessKeys.mainKey}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(checkoutSuccessKeys.mainKey);
                        setHasCopiedMainKey(true);
                        setTimeout(() => setHasCopiedMainKey(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white text-black font-bold text-[10px] hover:bg-zinc-200 transition cursor-pointer"
                    >
                      {hasCopiedMainKey ? "KOPIERT!" : "KOPIEREN"}
                    </button>
                  </div>
                </div>

                {/* Extra Partner Key Box (If Lifetime) */}
                {checkoutSuccessKeys.extraKey && (
                  <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-500/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5" />
                        <span>2. EXTRA-LIZENZ (ZUM VERSCHENKEN):</span>
                      </span>
                      <span className="text-orange-400">PARTNER PASS</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black border border-orange-500/40 font-mono text-xs text-orange-200">
                      <span className="font-bold select-all">{checkoutSuccessKeys.extraKey}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(checkoutSuccessKeys.extraKey!);
                          setHasCopiedExtraKey(true);
                          setTimeout(() => setHasCopiedExtraKey(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold text-[10px] transition cursor-pointer"
                      >
                        {hasCopiedExtraKey ? "KOPIERT!" : "KOPIEREN"}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Diesen Code kannst du sofort per WhatsApp, Slack oder Mail an deinen Partner senden!
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    onEnterApp();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d] hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95"
                >
                  JETZT PAPAYAOS WORKSPACE STARTEN →
                </button>
              </div>
            ) : (
              /* CHECKOUT FORM */
              <div className="text-left space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-black text-white">
                      {selectedCheckoutPlan === "trial"
                        ? "3 TAGE GRATIS AKTIVIEREN"
                        : selectedCheckoutPlan === "lifetime"
                        ? "LIFETIME FOUNDER PASS (2-IN-1)"
                        : "PRO MEMBER ABONNEMENT"}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400">
                      {selectedCheckoutPlan === "trial"
                        ? "0,00 € · Keine Zahlungsdaten erforderlich"
                        : selectedCheckoutPlan === "lifetime"
                        ? "149,99 € einmalig · Inklusive 1 Extra-Lizenz"
                        : `${billingCycle === "yearly" ? "29 €" : "39 €"} / Monat`}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCompleteCheckout} className="space-y-4 pt-2">
                  <div>
                    <label className="text-zinc-400 font-mono text-[11px] block mb-1">DEIN NAME:</label>
                    <input
                      type="text"
                      required
                      placeholder="Max Mustermann"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 focus:border-orange-500 text-white font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-mono text-[11px] block mb-1">DEINE E-MAIL ADRESSE:</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 focus:border-orange-500 text-white font-mono text-xs focus:outline-none"
                    />
                  </div>

                  {selectedCheckoutPlan !== "trial" && (
                    <div>
                      <label className="text-zinc-400 font-mono text-[11px] block mb-1.5 font-semibold">
                        {lang === "de" ? "ZAHLUNGSMETHODE WÄHLEN:" : "SELECT PAYMENT METHOD:"}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* 1. KREDITKARTE */}
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("card")}
                          className={`p-2.5 rounded-xl border text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            checkoutPaymentMethod === "card"
                              ? "bg-zinc-850 border-white/40 text-white shadow-[0_0_14px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]"
                              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <VisaIcon size="xs" />
                            <MastercardIcon size="xs" />
                          </div>
                          <span className="text-[11px]">Karte / Visa</span>
                        </button>

                        {/* 2. PAYPAL */}
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("paypal")}
                          className={`p-2.5 rounded-xl border text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            checkoutPaymentMethod === "paypal"
                              ? "bg-zinc-850 border-white/40 text-white shadow-[0_0_14px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]"
                              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <PaypalIcon size="xs" />
                          <span className="text-[11px]">PayPal</span>
                        </button>

                        {/* 3. APPLE PAY */}
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("apple")}
                          className={`p-2.5 rounded-xl border text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            checkoutPaymentMethod === "apple"
                              ? "bg-zinc-850 border-white/40 text-white shadow-[0_0_14px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]"
                              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <ApplePayIcon size="xs" />
                          <span className="text-[11px]">Apple Pay</span>
                        </button>

                        {/* 4. GOOGLE PAY */}
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("google")}
                          className={`p-2.5 rounded-xl border text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            checkoutPaymentMethod === "google"
                              ? "bg-zinc-850 border-white/40 text-white shadow-[0_0_14px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]"
                              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <GooglePayIcon size="xs" />
                          <span className="text-[11px]">Google Pay</span>
                        </button>

                        {/* 5. KLARNA */}
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("klarna")}
                          className={`p-2.5 rounded-xl border text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            checkoutPaymentMethod === "klarna"
                              ? "bg-zinc-850 border-white/40 text-white shadow-[0_0_14px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]"
                              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <KlarnaIcon size="xs" />
                          <span className="text-[11px]">Klarna</span>
                        </button>

                        {/* 6. SEPA LASTSCHRIFT */}
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("sepa")}
                          className={`p-2.5 rounded-xl border text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            checkoutPaymentMethod === "sepa"
                              ? "bg-zinc-850 border-white/40 text-white shadow-[0_0_14px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]"
                              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <SepaIcon size="xs" />
                          <span className="text-[11px]">SEPA</span>
                        </button>

                        {/* 7. CRYPTO / BITCOIN */}
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod("crypto")}
                          className={`p-2.5 rounded-xl border text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-1.5 cursor-pointer sm:col-span-2 ${
                            checkoutPaymentMethod === "crypto"
                              ? "bg-zinc-850 border-white/40 text-white shadow-[0_0_14px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]"
                              : "bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <BitcoinIcon size="xs" />
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                              -20% Rabatt
                            </span>
                          </div>
                          <span className="text-[11px]">Krypto (BTC / SOL)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessingCheckout}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ff6b35] via-[#ff8f3d] to-[#ff2a8d] hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isProcessingCheckout ? (
                        <span>AKTIVIERE ZUGANG...</span>
                      ) : selectedCheckoutPlan === "trial" ? (
                        <span>JETZT 3 TAGE GRATIS STARTEN (0 €) →</span>
                      ) : (
                        <span>JETZT KAUF ABSCHLIESSEN & CODES ERHALTEN →</span>
                      )}
                    </button>
                  </div>

                  {/* Payment Icons Trust Footer */}
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <div className="flex flex-wrap items-center justify-center gap-1.5 opacity-90">
                      <VisaIcon size="xs" />
                      <MastercardIcon size="xs" />
                      <AmexIcon size="xs" />
                      <PaypalIcon size="xs" />
                      <ApplePayIcon size="xs" />
                      <GooglePayIcon size="xs" />
                      <KlarnaIcon size="xs" />
                      <SepaIcon size="xs" />
                      <BitcoinIcon size="xs" />
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono text-center flex flex-wrap items-center justify-center gap-1.5">
                      <span>🔒 256-Bit SSL-Verschlüsselung</span>
                      <span>·</span>
                      <span>14 Tage Geld-zurück-Garantie</span>
                      <span>·</span>
                      <span>Stripe & PayPal Verified</span>
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PASSKEY / LOGIN MODAL */}
      {isPasskeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-zinc-700 shadow-2xl relative text-left">
            <button
              onClick={() => {
                setIsPasskeyModalOpen(false);
                setPasskeyError(null);
                setPasskeySuccess(null);
              }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white font-mono text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="font-mono text-base font-black text-white">
                PASSKEY / ADMIN LOGIN
              </h3>
            </div>

            <p className="text-xs text-zinc-300 mb-4">
              Gib deinen persönlichen Passkey (z. B. "maria", 16-stelliger Token) oder Master-Admin PIN ein:
            </p>

            <form onSubmit={handlePasskeySubmit} className="space-y-3">
              <input
                type="password"
                autoFocus
                required
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Passkey oder Admin-Code..."
                className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 focus:border-orange-500 text-white font-mono text-xs focus:outline-none"
              />

              {passkeyError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-mono">
                  {passkeyError}
                </div>
              )}

              {passkeySuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono">
                  {passkeySuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingPasskey}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff2a8d] hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              >
                {isVerifyingPasskey ? "ÜBERPRÜFE..." : "ENTSICHERN & STARTEN →"}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
              <span>Philipp Steidle (Admin):</span>
              <button
                type="button"
                onClick={() => {
                  setStoredAdminAuthenticated(true);
                  setCurrentUserEmail(SUPERADMIN_EMAIL);
                  setIsPasskeyModalOpen(false);
                  onEnterApp();
                }}
                className="text-zinc-300 hover:text-white font-bold underline cursor-pointer"
              >
                ⚡ 1-Klick Admin Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
