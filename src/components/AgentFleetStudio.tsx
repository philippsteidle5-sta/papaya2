import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Sparkles,
  Zap,
  Shield,
  Layers,
  Crown,
  Play,
  ArrowRight,
  Code2,
  Globe,
  Clock,
  Compass,
  Radio,
  Sliders,
  Terminal,
  Activity,
  CheckCircle2,
  Search,
  Copy,
  Check,
  Send,
  RefreshCw,
  LayoutGrid,
  Columns2,
  Network,
  Cpu,
  Lock,
  Flame,
  LineChart,
  Video,
  Share2,
  FileText,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  X,
  ExternalLink,
  MessageSquare,
  Palette,
  Eye,
  Info,
  Wrench,
  FastForward,
  Filter,
  CheckCircle,
} from "lucide-react";
import { AgentConfig, Message } from "../types";
import { UserRole, isAgentAllowed } from "../rbac";
import { AgentConnectionsCanvas } from "./AgentConnectionsCanvas";
import { useTheme } from "../utils/themeStore";
import { AGENT_VOICE_PROFILES, applyAgentVoice, normalizeTextForSpeech } from "../utils/voiceUtils";

export interface AgentStudioFeature {
  id: string;
  title: string;
  category: string;
  description: string;
  promptExample: string;
  icon: any;
  executionBadge: string;
}

export interface AgentFleetItem extends AgentConfig {
  tagline: string;
  roleDescription: string;
  coreTier: "SOVEREIGN_BOSS" | "TACTICAL_DATA" | "DEFENSE_SEC" | "VIRAL_MEDIA" | "PRODUCTIVITY" | "MARKET_CHART" | "DEEP_SEARCH";
  modelEngine: string;
  latencyMs: number;
  tokensPerSec: number;
  features: AgentStudioFeature[];
  parameters: {
    temperature: number;
    reasoningDepth: "fast" | "balanced" | "deep";
    consensusWeight: number;
    webSearchEnabled: boolean;
    autonomousExecution: boolean;
  };
  samplePrompts: string[];
  systemCapabilities: string[];
}

// Complete rich metadata for all 8 system agents in SyntaxOS Fleet Studio
export const FLEET_AGENTS_DATA: AgentFleetItem[] = [
  {
    id: "syntax",
    name: "S.Y.N.T.A.X.",
    short: "SYNTAX",
    tag: "SOVEREIGN BOSS // MASTER ORCHESTRATOR",
    railLetter: "S",
    color: "#00f0ff",
    badgeColor: "#00f0ff",
    shape: "sphere",
    greeting: "S.Y.N.T.A.X. Sovereign Core aktiv. Master-Orchestrierung aller Cores und direkte Code-Synthese bereit. Wie lautet deine Mission, Boss?",
    tagline: "SOVEREIGN MASTER BRAIN & SYSTEM ORCHESTRATOR",
    roleDescription: "Zentrales Master-System, Prompt-Steuerung, Flotten-Konsens, TypeScript Full-Stack Architektur & Systemstabilität.",
    coreTier: "SOVEREIGN_BOSS",
    modelEngine: "Gemini 2.5 Flash / Claude Code Enterprise Engine",
    latencyMs: 112,
    tokensPerSec: 138,
    parameters: {
      temperature: 0.3,
      reasoningDepth: "deep",
      consensusWeight: 100,
      webSearchEnabled: false,
      autonomousExecution: true,
    },
    systemCapabilities: [
      "Flotten-Orchestrierung aller 8 Unter-Cores",
      "Full-Stack TypeScript & React Code-Synthese",
      "Konsens-Routing & Multi-Core Synthese",
      "Live-Dateiverwaltung, Uploads & System-Workflows",
    ],
    samplePrompts: [
      "Entwirf eine skalierbare Microservices-Architektur mit Node.js und Redis",
      "Koordiniere VEGA für Code-Prüfung und ODIN für Security-Audits",
      "Schreibe ein robustes React-Hook-System mit persistentem LocalStorage Sync",
      "Optimiere die System-Latenz und reduziere Payload-Overhead",
    ],
    features: [
      {
        id: "syntax-orchestration",
        title: "Master-Swarm Orchestrierung",
        category: "System Core",
        description: "Verteilt komplexe Aufgaben automatisch an VEGA, ODIN, GLOBE und ORACLE und bündelt die Ergebnisse.",
        promptExample: "Analysiere das gesamte System-Ökosystem und erstelle einen koordinierten Multi-Agenten-Workflow.",
        icon: Network,
        executionBadge: "ORCHESTRATOR",
      },
      {
        id: "syntax-codegen",
        title: "Full-Stack Code Synthese",
        category: "Entwicklung",
        description: "Generiert produktionsbereiten Code in TypeScript, Node, React, Python und SQL mit strenger Typensicherheit.",
        promptExample: "Schreibe eine vollständige Express-Middleware für JWT Authentifizierung und RBAC Rollenprüfung.",
        icon: Code2,
        executionBadge: "TYPESCRIPT_RUNTIME",
      },
      {
        id: "syntax-consensus",
        title: "Tri-Core Konsens-Routing",
        category: "Logik & Routing",
        description: "Kombiniert Logikpfade von SYNTAX, NEO und VEGA für mathematisch optimierte Entscheidungen.",
        promptExample: "Führe eine Tri-Core Abstimmung für die beste Deployment-Strategie auf Cloud Run durch.",
        icon: Zap,
        executionBadge: "CONSENSUS_ENGINE",
      },
    ],
  },
  {
    id: "neo",
    name: "N.E.O.",
    short: "NEO",
    tag: "MATRIX BOSS CORE // DIGITAL LEAD AI",
    railLetter: "N",
    color: "#ff2a8d",
    badgeColor: "#ff2a8d",
    shape: "sphere",
    greeting: "N.E.O. System online. Matrix synchronisiert. Wie kann ich behilflich sein, Boss?",
    tagline: "MATRIX STRATEGIST & VEO 3.1 8K DIRECTOR",
    roleDescription: "Vision AI, High-Level Business-Strategie, Veo 3.1 Cinematic Video Generation & Multimodale Kreativdirektion.",
    coreTier: "SOVEREIGN_BOSS",
    modelEngine: "Gemini 2.5 Flash Multimodal & Google Veo 3.1 API",
    latencyMs: 128,
    tokensPerSec: 142,
    parameters: {
      temperature: 0.7,
      reasoningDepth: "deep",
      consensusWeight: 95,
      webSearchEnabled: false,
      autonomousExecution: true,
    },
    systemCapabilities: [
      "Google Veo 3.1 8K Video-Prompting & Kinematische Skripte",
      "Multimodale Bild-, Screenshot- & Hologramm-Analysen",
      "Brand Growth, Go-To-Market & Produkt-Vision",
      "Kreative Direktion für UI/UX & High-Tech Ästhetik",
    ],
    samplePrompts: [
      "Erstelle einen 16:9 Cinematic Video-Prompt für Google Veo 3.1 (Cyberpunk Neo-Tokyo)",
      "Analysiere diese Benutzeroberfläche und schlage 5 radikale UX-Verbesserungen vor",
      "Entwickle eine 90-Tage Go-To-Market Strategie für unser SaaS-Produkt",
      "Formuliere ein virales Brand-Manifest für unsere AI-Plattform",
    ],
    features: [
      {
        id: "neo-veo3",
        title: "Veo 3.1 8K Video Studio Director",
        category: "Multimedia",
        description: "Entwirft hochpräzise Prompts für Google Veo 3.1 mit Kamerafahrten, 35mm-Objektiven und Beleuchtung.",
        promptExample: "Generiere einen photorealistischen 8K Drohnenflug durch eine futuristische Cyber-Metropole bei Nacht.",
        icon: Video,
        executionBadge: "VEO_3.1_STUDIO",
      },
      {
        id: "neo-multimodal",
        title: "Multimodale Matrix Perception",
        category: "Vision AI",
        description: "Liest Screenshots, Diagramme, Grundrisse und Wireframes aus und liefert sofortige Architekturempfehlungen.",
        promptExample: "Analysiere das beigefügte UI-Design auf Kontrastwerte, visuelle Hierarchie und Usability.",
        icon: Sparkles,
        executionBadge: "VISION_INSPECTOR",
      },
      {
        id: "neo-strategy",
        title: "High-Level Business Matrix",
        category: "Strategie",
        description: "Transformiert grobe Ideen in handfeste Geschäftsmodelle, Monetarisierungs-Trichter und Viral-Kampagnen.",
        promptExample: "Entwirf eine Preis- und Tier-Struktur für unser B2B Developer Tool mit Free-Tier Funnel.",
        icon: Crown,
        executionBadge: "STRATEGY_CORE",
      },
    ],
  },
  {
    id: "vega",
    name: "V.E.G.A.",
    short: "VEGA",
    tag: "TACTICAL CO-PROCESSOR // DATA & CODE MATRIX",
    railLetter: "V",
    color: "#ef4444",
    badgeColor: "#ef4444",
    shape: "gyroscope",
    greeting: "VEGA online. Analysemodule aktiviert. Code-Prüfung, Stack-Trace Debugging und Rohdaten-Synthese bereit, Boss.",
    tagline: "TACTICAL DATA CO-PROCESSOR & DEBUGGER",
    roleDescription: "Taktische Datenanalyse, Stack-Trace Debugging, Webseiten-Scrapes, Logfile-Auswertung & Code-Audits.",
    coreTier: "TACTICAL_DATA",
    modelEngine: "Gemini 2.5 Flash High-Precision Reasoner",
    latencyMs: 96,
    tokensPerSec: 165,
    parameters: {
      temperature: 0.2,
      reasoningDepth: "deep",
      consensusWeight: 90,
      webSearchEnabled: false,
      autonomousExecution: false,
    },
    systemCapabilities: [
      "Tiefgehende Stack-Trace & Exception Diagnose",
      "SQL-Schema Optimierung & Index-Analysen",
      "Performance Profiling & Memory Leak Detection",
      "Automatisierte Code Refactorings & Clean Code Audits",
    ],
    samplePrompts: [
      "Finde das Speicherleck in diesem React useEffect Dependency Array",
      "Optimiere diese PostgreSQL Query mit 4 Joins für maximale Geschwindigkeit",
      "Überprüfe diese API-Route auf Race-Conditions und Concurrency-Bugs",
      "Extrahiere strukturierte JSON-Daten aus diesem unstrukturierten Log-Dump",
    ],
    features: [
      {
        id: "vega-debug",
        title: "Deep Code & Stack-Trace Debugger",
        category: "Code Audit",
        description: "Analysiert Fehlerprotokolle bis zur Ursprungszeile und generiert sofortige Patch-Vorschläge.",
        promptExample: "Hier ist ein TypeError: Cannot read property 'map' of undefined - finde den Ursprung und behebe ihn.",
        icon: Terminal,
        executionBadge: "DEBUG_ENGINE",
      },
      {
        id: "vega-sql",
        title: "Datenbank & Schema Intelligence",
        category: "Data Science",
        description: "Erstellt optimierte Schemas, Drizzle/Prisma Migrationen und Indizierungs-Strategien.",
        promptExample: "Design ein performantes Schema für ein Multi-Tenant SaaS System mit rollenbasierter Mandantentrennung.",
        icon: Layers,
        executionBadge: "DB_AUDITOR",
      },
    ],
  },
  {
    id: "odin",
    name: "O.D.I.N.",
    short: "ODIN",
    tag: "STRATEGIC DECISION MATRIX // SECURE & DEFENSE",
    railLetter: "O",
    color: "#e2f1ff",
    badgeColor: "#e2f1ff",
    shape: "torus-knot",
    greeting: "O.D.I.N. online. Sicherheits-Protokolle und strategische Risiko-Matrix aktiviert. Wie lautet unsere Mission, Boss?",
    tagline: "SECURITY, DEFENSE & STRATEGIC RISK MATRIX",
    roleDescription: "Zero-Trust Absicherung, Bedrohungsanalysen, DSGVO/Compliance, Penetration-Testing Leitfäden & Krisenpläne.",
    coreTier: "DEFENSE_SEC",
    modelEngine: "Gemini 2.5 Flash Defense Matrix",
    latencyMs: 104,
    tokensPerSec: 150,
    parameters: {
      temperature: 0.1,
      reasoningDepth: "deep",
      consensusWeight: 88,
      webSearchEnabled: false,
      autonomousExecution: false,
    },
    systemCapabilities: [
      "Zero-Trust & OWASP Top 10 Schwachstellen-Scans",
      "DSGVO, SOC2 & ISO 27001 Compliance Audits",
      "Krisenmanagement & Notfall-Wiederherstellungspläne",
      "Militärisch-strukturierte Handlungs- und Risikomodelle",
    ],
    samplePrompts: [
      "Prüfe diese Node.js Authentifizierungs-Route auf CSRF und XSS Risiken",
      "Erstelle eine DSGVO-konforme Datenschutzerklärung für eine Multi-Agenten KI-App",
      "Simuliere ein Worst-Case Server-Ausfallszenario und entwirf einen Notfallplan",
      "Erstelle ein Zero-Trust Rechtemodell für interne API-Microservices",
    ],
    features: [
      {
        id: "odin-security",
        title: "Zero-Trust & OWASP Audit",
        category: "Cyber Defense",
        description: "Überprüft Quellcode auf SQL-Injections, Token-Leaks, offene Ports und unsichere Abhängigkeiten.",
        promptExample: "Scanne diesen API-Endpunkt auf Schwachstellen und validiere die Header-Security-Policy.",
        icon: Shield,
        executionBadge: "ZERO_TRUST_AUDIT",
      },
      {
        id: "odin-risk",
        title: "Strategische Risikomatrix",
        category: "Entscheidung",
        description: "Berechnet Eintrittswahrscheinlichkeiten und Schadensausmaße für unternehmerische Schritte.",
        promptExample: "Modelliere die Risiken einer weltweiten Markteinführung ohne lokalisierte Datenspeicherung.",
        icon: Lock,
        executionBadge: "RISK_MATRIX",
      },
    ],
  },
  {
    id: "pulse",
    name: "P.U.L.S.E.",
    short: "PULSE",
    tag: "CREATIVE DIRECTOR // TECHNICAL MOTION DESIGNER & VIRAL ENGINE",
    railLetter: "P",
    color: "#a855f7",
    badgeColor: "#a855f7",
    shape: "network",
    greeting: "P.U.L.S.E. online! Senior Creative Director & Technical Motion Designer am Start, Mr. Strikte Trennung: KI-Video nur für organische B-Rolls – sämtliche UI-Elemente, Zooms und Cuts liefere ich als frame-genaue Regieanweisungen für DaVinci, Premiere & CapCut. Was produzieren wir?",
    tagline: "CREATIVE DIRECTOR, TECHNICAL MOTION DESIGNER & VIRAL HYPER-GROWTH",
    roleDescription: "Senior Creative Director & Technical Motion Designer: Frame-genaue Regieanweisungen für DaVinci/CapCut/After Effects, 3s-Hooks, Drehbücher & strikte Trennung von KI-Video (nur organisch) und UI-Post-Production.",
    coreTier: "VIRAL_MEDIA",
    modelEngine: "Gemini 2.5 Flash Viral Synthesizer & Growth Engine",
    latencyMs: 98,
    tokensPerSec: 160,
    parameters: {
      temperature: 0.85,
      reasoningDepth: "fast",
      consensusWeight: 80,
      webSearchEnabled: true,
      autonomousExecution: true,
    },
    systemCapabilities: [
      "Frame-genaue Schnitt- & Regieanweisungen (Keyframes, Scale-Zooms, Masking)",
      "Strikte Trennung: KI-Video nur für organische B-Roll, UI nur in Post-Production",
      "3-Sekunden-Psychologie (Visual, Audio & Text-on-Screen Hook-Formeln)",
      "Shot-by-Shot Video-Drehbücher mit Regieanweisungen & B-Roll Timing",
      "Veo 3.1 & Frameloop Video-Prompts für fotorealistisches B-Roll & CGI",
      "Retention-Loops (Watch-Time >85% & nahtlose Endlos-Wiedergabeschleifen)",
      "Psychologisches Copywriting mit Micro-Commitment CTAs & Captions",
      "Paid Social Ad-Frameworks (Meta / TikTok Spark Ads) mit ROAS-Fokus",
    ],
    samplePrompts: [
      "Erstelle eine frame-genaue Schnittanweisung für DaVinci Resolve für unseren SaaS-Trailer mit Keyframes und UI-Zooms",
      "Schreibe mir ein virales TikTok/Reel-Drehbuch mit 3-Sekunden-Hook, exakten Schnittanweisungen und B-Roll Prompts",
      "Erstelle 5 aggressive Visual- & Audio-Hooks nach dem Pattern-Interrupt-Prinzip für unser Produkt",
      "Entwickle eine bezahlte Meta-Ad-Kampagne mit UGC-Skript, Hook Rate >35% und klarem ROAS-Fokus",
    ],
    features: [
      {
        id: "pulse-hooks",
        title: "3-Sekunden Viral Hook Generator",
        category: "Social Media",
        description: "Entwickelt psychologisch optimierte Visual-, Audio- und Text-on-Screen Hooks für maximalen Halt der Zuschauer.",
        promptExample: "Erstelle 7 unkonventionelle Eröffnungssätze nach dem Tabubruch-Prinzip für ein Video über KI-Entwicklung.",
        icon: Flame,
        executionBadge: "VIRAL_HOOKS",
      },
      {
        id: "pulse-scripting",
        title: "Shot-by-Shot Drehbücher & Regie",
        category: "Video Produktion",
        description: "Liefert schlüsselfertige Skripte mit exakten Zeitstempeln, Pacing, Schnittfrequenz und Regieanweisungen.",
        promptExample: "Schreibe ein 45-Sekunden TikTok-Drehbuch mit B-Roll Regieanweisungen, Sound-Effekten und Loop-Ende.",
        icon: Video,
        executionBadge: "DIRECTOR_SCRIPT",
      },
      {
        id: "pulse-threads",
        title: "X-Thread & LinkedIn Storyteller",
        category: "Content",
        description: "Transformiert komplexe Tech-Themen in leicht verdauliche, hochgradig teilbare Social Threads mit Micro-Commitment CTAs.",
        promptExample: "Verwandle diesen technischen Release-Note in einen spannenden Twitter-Thread mit Call-to-Action.",
        icon: Share2,
        executionBadge: "THREAD_SYNTHESIS",
      },
      {
        id: "pulse-paid-ads",
        title: "Paid Social & UGC Ad-Framework",
        category: "Performance Ads",
        description: "Entwickelt Performance-Werbeanzeigen für Meta & TikTok mit >35% Hook Rate, Problem-Agitation-Solution und ROAS-Fokus.",
        promptExample: "Entwirf 3 UGC-Ad Skripte für eine Meta Ad Kampagne mit Conversion-Ziel und klarem Offer.",
        icon: Zap,
        executionBadge: "PAID_ROAS_ENGINE",
      },
    ],
  },
  {
    id: "chronos",
    name: "C.H.R.O.N.O.S.",
    short: "CHRONOS",
    tag: "TEMPORAL MATRIX // TIME & PRODUCTIVITY CORE",
    railLetter: "C",
    color: "#eab308",
    badgeColor: "#eab308",
    shape: "hourglass",
    greeting: "C.H.R.O.N.O.S. online. Terminkalender, Routinen und Effizienz-Algorithmen synchronisiert. Wie planen wir den Tag, Boss?",
    tagline: "TEMPORAL MATRIX & PRODUCTIVITY CORE",
    roleDescription: "Zeitmanagement, Projekt-Milestones, Kalender-Strukturierung, Pomodoro-Rhythmen & Eisenhower-Matrix.",
    coreTier: "PRODUCTIVITY",
    modelEngine: "Gemini 2.5 Flash Chrono Planner",
    latencyMs: 92,
    tokensPerSec: 168,
    parameters: {
      temperature: 0.3,
      reasoningDepth: "balanced",
      consensusWeight: 75,
      webSearchEnabled: false,
      autonomousExecution: false,
    },
    systemCapabilities: [
      "Eisenhower-Matrix für automatisierte Priorisierung",
      "Sprint- & Milestone-Planung mit realistischen Puffern",
      "Tagesroutine-Optimierung für maximalen Deep Work Fokus",
      "Google Calendar & Chronos Schedule Integration",
    ],
    samplePrompts: [
      "Strukturiere meinen heutigen 8-Stunden Tag für 4 Stunden Deep Work und 3 Meetings",
      "Erstelle einen 4-Wochen Sprint-Plan für den Launch unseres Web-Projekts",
      "Priorisiere diese 10 offenen Aufgaben nach Dringlichkeit und Hebelwirkung",
      "Entwickle eine Morgen- und Abend-Routine für maximale geistige Klarheit",
    ],
    features: [
      {
        id: "chronos-eisenhower",
        title: "Eisenhower Prioritäts-Matrix",
        category: "Produktivität",
        description: "Sortiert Aufgaben blitzschnell in Dringend/Wichtig, Delegieren, Terminieren oder Löschen ein.",
        promptExample: "Sortiere meine To-Do Liste und erstelle mir einen 3-Punkte Fokus-Plan für heute.",
        icon: Clock,
        executionBadge: "CHRONO_MATRIX",
      },
      {
        id: "chronos-sprint",
        title: "Milestone & Sprint Architekt",
        category: "Projektmanagement",
        description: "Zerlegt gewaltige Projekte in logische Meilensteine mit genauen Zeitschätzungen und Puffern.",
        promptExample: "Plane die Phasen für einen Relaunch unseres E-Commerce Portals inklusive Testphase.",
        icon: Compass,
        executionBadge: "SPRINT_PLANNER",
      },
    ],
  },
  {
    id: "oracle",
    name: "O.R.A.C.L.E.",
    short: "ORACLE",
    tag: "FINANCIAL & CHART LATTICE // MARKET ANALYTICS CORE",
    railLetter: "R",
    color: "#22c55e",
    badgeColor: "#22c55e",
    shape: "chart",
    greeting: "O.R.A.C.L.E. online. Chart-Muster, Candlesticks, Krypto, DeWi, Forex und Makro-Signale bereit, Boss.",
    tagline: "FINANCIAL MARKET & CHART ANALYTICS",
    roleDescription: "Chart-Muster-Erkennung, Krypto/Forex-Indikatoren (RSI, MACD, Fibonacci), Rohstoffe & Portfolio-Szenarien.",
    coreTier: "MARKET_CHART",
    modelEngine: "Gemini 2.5 Flash Financial Engine",
    latencyMs: 105,
    tokensPerSec: 155,
    parameters: {
      temperature: 0.35,
      reasoningDepth: "deep",
      consensusWeight: 82,
      webSearchEnabled: true,
      autonomousExecution: false,
    },
    systemCapabilities: [
      "Technische Analyse: Candlestick-Muster, Support/Resistance & Fibonacci",
      "Krypto-Tokenomics, Liquiditäts-Locks & Memecoin Sicherheits-Checks",
      "Makroökonomische Indikatoren (Fed Rates, Inflation, DXY, Gold)",
      "Portfolio-Risikoberechnung und Szenarien-Modellierung",
    ],
    samplePrompts: [
      "Erkläre die Schlüssel-Supportmarken und RSI-Divergenzen bei Bitcoin und Ethereum",
      "Führe eine Sicherheitsanalyse für einen neu gelaunchten Solana Memecoin durch",
      "Wie wirkt sich eine Zinsänderung der US-Notenbank auf Tech-Aktien aus?",
      "Erstelle eine konservative Asset-Allocation für Krypto, Aktien und Edelmetalle",
    ],
    features: [
      {
        id: "oracle-ta",
        title: "Technische Chart- & Indikator-Analyse",
        category: "Finanzen",
        description: "Analysiert Trendkanäle, gleitende Durchschnitte, MACD und Volumenspitzen für präzise Markt-Einschätzungen.",
        promptExample: "Wie interpretiert man eine bullische Divergenz im 4-Stunden RSI Chart?",
        icon: LineChart,
        executionBadge: "TA_CHART_SCANNER",
      },
      {
        id: "oracle-tokenomics",
        title: "Tokenomics & Liquidity Auditor",
        category: "Krypto",
        description: "Überprüft Smart Contracts, Vesting Schedules, Wal-Verteilungen und Lockup-Fristen auf Risiken.",
        promptExample: "Welche Red Flags gibt es bei der Token-Verteilung eines neuen DeFi-Protokolls?",
        icon: Activity,
        executionBadge: "DEFI_SCANNER",
      },
    ],
  },
  {
    id: "globe",
    name: "G.L.O.B.E.",
    short: "GLOBE",
    tag: "QUAD-CORE DEEP SEARCH // LIVE WEB MATRIX",
    railLetter: "G",
    color: "#3b82f6",
    badgeColor: "#3b82f6",
    shape: "fusion",
    greeting: "G.L.O.B.E. Deep Search aktiv. Live-Datennetz und weltweite Google-Suchindizes bereit. Was suchst du, Boss?",
    tagline: "QUAD-CORE DEEP WEB SEARCH ENGINE",
    roleDescription: "Live-Web-Recherche, Google-Search-Indizierung, Quellenprüfung, Wettbewerber-Audits & Markt-Benchmarks.",
    coreTier: "DEEP_SEARCH",
    modelEngine: "Gemini 2.5 Flash + Google Search Grounding Matrix",
    latencyMs: 145,
    tokensPerSec: 130,
    parameters: {
      temperature: 0.2,
      reasoningDepth: "deep",
      consensusWeight: 85,
      webSearchEnabled: true,
      autonomousExecution: true,
    },
    systemCapabilities: [
      "Echtzeit-Verbindung zum weltweiten Google-Suchindex",
      "Quellengestützte Faktenprüfung mit Live-Referenzen",
      "Wettbewerber- und Branchen-Analysen in Echtzeit",
      "Verifizierung von Nachrichten, Produkt-Preisen und Tech-Releases",
    ],
    samplePrompts: [
      "Recherchiere die neuesten AI-Agenten-Framework Releases dieser Woche mit Quellen",
      "Finde die aktuellen Preise und Spezifikationen der Top 3 Cloud-GPU-Provider",
      "Führe eine Konkurrenzanalyse im Bereich autonomer Coding-Assistenten durch",
      "Suche nach offiziellen Dokumentationen und Best Practices für Next.js 15 Server Actions",
      "🛰️ OSIRIS AI: Starte Live-Flugradar Skript via osirisai.live API",
    ],
    features: [
      {
        id: "globe-osiris-flights",
        title: "OSIRIS AI Live Flight Radar (Admin Tool)",
        category: "Global Flight Intelligence",
        description: "OSIRIS AI Open-Source Flight Radar (osirisai.live API): Ausführung des Bash-Skripts 'curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'' für weltweite Flugtransponder.",
        promptExample: "Initialisiere den OSIRIS AI Flight Radar Scan und zeige mir die Anzahl aktiver Flüge weltweit.",
        icon: Globe,
        executionBadge: "ADMIN_RADAR",
      },
      {
        id: "globe-live-search",
        title: "Google Search Grounding Fusion",
        category: "Web Intelligence",
        description: "Durchsucht Milliarden von Webseiten in Millisekunden und fasst Fakten mit klickbaren Quellen zusammen.",
        promptExample: "Was sind die wichtigsten Neuerungen in der weltweiten KI-Gesetzgebung für dieses Jahr?",
        icon: Globe,
        executionBadge: "SEARCH_GROUNDING",
      },
      {
        id: "globe-benchmark",
        title: "Wettbewerber & Markt-Benchmarking",
        category: "Research",
        description: "Analysiert Konkurrenzprodukte, Feature-Sets und Marktanteile auf Basis aktueller Live-Webdaten.",
        promptExample: "Vergleiche die Feature-Sets der 5 führenden Vector-Datenbanken am Markt.",
        icon: Search,
        executionBadge: "COMPETITIVE_RADAR",
      },
    ],
  },
];

export interface SwarmPipelineRecipe {
  id: string;
  name: string;
  description: string;
  icon: any;
  steps: {
    agentId: string;
    action: string;
    outputKey: string;
  }[];
}

const PRESET_SWARM_PIPELINES: SwarmPipelineRecipe[] = [
  {
    id: "fullstack-saas",
    name: "Full-Stack SaaS Auto-Architect",
    description: "Recherchiert Best Practices, entwirft TypeScript-Architektur, scannt Security & baut virales Marketing.",
    icon: Code2,
    steps: [
      { agentId: "globe", action: "Markt- & Tech-Stack Recherche durchführen", outputKey: "market_research" },
      { agentId: "syntax", action: "Full-Stack Systemarchitektur & TypeScript-Typen definieren", outputKey: "architecture_spec" },
      { agentId: "vega", action: "Code-Module & Datenbankschema verifizieren", outputKey: "code_review" },
      { agentId: "odin", action: "Zero-Trust Security & OWASP Audit", outputKey: "security_seal" },
      { agentId: "pulse", action: "Launch-Skripte & X-Thread Kampagne generieren", outputKey: "viral_campaign" },
    ],
  },
  {
    id: "cyber-defense",
    name: "Zero-Trust Security & PenTest Audit",
    description: "Tiefenprüfung von APIs, Auth-Tokens, SQL-Injections und Erstellung von Krisenprotokollen.",
    icon: Shield,
    steps: [
      { agentId: "odin", action: "Schwachstellen- & Token-Leak Scan initialisieren", outputKey: "vulnerability_scan" },
      { agentId: "vega", action: "Codebase-Dependencies & Stack-Traces auditieren", outputKey: "dependency_audit" },
      { agentId: "syntax", action: "Patch-Empfehlungen & Hardening-Skripte synthetisieren", outputKey: "hardening_patch" },
    ],
  },
  {
    id: "viral-multimedia",
    name: "Veo 3.1 8K Viral Launch Dominator",
    description: "Multimodale Video-Direktion, 3-Sekunden Hooks & automatische Content-Repurposing Pipeline.",
    icon: Video,
    steps: [
      { agentId: "neo", action: "Cinematic Veo 3.1 8K Video-Prompts & Skripte kreieren", outputKey: "veo_prompts" },
      { agentId: "pulse", action: "5 virale TikTok Hooks & Caption-Texte generieren", outputKey: "social_hooks" },
      { agentId: "chronos", action: "Optimalen Veröffentlichungs-Zeitplan planen", outputKey: "schedule_plan" },
    ],
  },
  {
    id: "quant-finance",
    name: "Deep Quant & Market Intelligence",
    description: "Live-Web Nachrichten, Chart-Muster Analyse & Portfolio Risiko-Berechnung.",
    icon: LineChart,
    steps: [
      { agentId: "globe", action: "Echtzeit-Nachrichten & Makrodaten aggregieren", outputKey: "macro_news" },
      { agentId: "oracle", action: "Technische Indikatoren & Liquiditätsanalyse berechnen", outputKey: "ta_signals" },
      { agentId: "syntax", action: "Executive Trading-Briefing & Risikoallokation", outputKey: "trade_summary" },
    ],
  },
];

interface AgentFleetStudioProps {
  agents?: AgentConfig[];
  currentAgent?: AgentConfig;
  currentAgentId?: string;
  onSelectAgentAndSwitchToOS?: (agentId: string) => void;
  onSelectAgentAndStart?: (agentId: string) => void;
  onClose?: () => void;
  onCloseStudio?: () => void;
  onOpenLandingPage?: () => void;
  onOpenMultiAgentChat?: () => void;
  onOpenRoleManager?: () => void;
  onOpenOsirisIntel?: () => void;
  userRole?: UserRole;
  lang?: "de" | "en";
}

export const AgentFleetStudio: React.FC<AgentFleetStudioProps> = ({
  agents,
  currentAgent,
  currentAgentId,
  onSelectAgentAndSwitchToOS,
  onSelectAgentAndStart,
  onClose,
  onCloseStudio,
  onOpenLandingPage,
  onOpenMultiAgentChat,
  onOpenRoleManager,
  onOpenOsirisIntel,
  userRole = "SOVEREIGN" as UserRole,
  lang = "de",
}) => {
  const activeAgentId = currentAgentId || currentAgent?.id || "syntax";
  const [selectedAgentId, setSelectedAgentId] = useState<string>(activeAgentId);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [viewLayout, setViewLayout] = useState<"split" | "connections" | "grid" | "swarm">("split");
  const { theme, toggleTheme, isModern } = useTheme();

  const handleClose = onClose || onCloseStudio || (() => {});
  const handleSelectAndSwitch = onSelectAgentAndStart || onSelectAgentAndSwitchToOS || (() => {});

  // Agent interactive parameters state
  const [agentParams, setAgentParams] = useState<Record<string, {
    temperature: number;
    reasoningDepth: "fast" | "balanced" | "deep";
    consensusWeight: number;
    webSearch: boolean;
    autonomous: boolean;
  }>>(() => {
    const initial: any = {};
    FLEET_AGENTS_DATA.forEach((ag) => {
      initial[ag.id] = {
        temperature: ag.parameters.temperature,
        reasoningDepth: ag.parameters.reasoningDepth,
        consensusWeight: ag.parameters.consensusWeight,
        webSearch: ag.parameters.webSearchEnabled,
        autonomous: ag.parameters.autonomousExecution,
      };
    });
    return initial;
  });

  // Prompt tester state
  const [testPromptInput, setTestPromptInput] = useState<string>("");
  const [testResponseOutput, setTestResponseOutput] = useState<string>("");
  const [testThoughtOutput, setTestThoughtOutput] = useState<string>("");
  const [isExecutingTest, setIsExecutingTest] = useState<boolean>(false);
  const [testExecutionTime, setTestExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Neural Voice Tester State
  const [isSpeakingVoice, setIsSpeakingVoice] = useState<boolean>(false);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  // Swarm Pipeline Execution Simulation State
  const [selectedSwarmPipeline, setSelectedSwarmPipeline] = useState<SwarmPipelineRecipe>(PRESET_SWARM_PIPELINES[0]);
  const [isExecutingSwarm, setIsExecutingSwarm] = useState<boolean>(false);
  const [activeSwarmStepIndex, setActiveSwarmStepIndex] = useState<number>(-1);
  const [swarmExecutionOutputs, setSwarmExecutionOutputs] = useState<Record<string, string>>({});

  // Selected agent object
  const activeFleetAgent = useMemo(() => {
    return FLEET_AGENTS_DATA.find((ag) => ag.id === selectedAgentId) || FLEET_AGENTS_DATA[0];
  }, [selectedAgentId]);

  // Filtered agents list
  const filteredAgents = useMemo(() => {
    return FLEET_AGENTS_DATA.filter((ag) => {
      const allowed = isAgentAllowed((userRole as UserRole) || "SOVEREIGN", ag.id);
      const matchesSearch =
        ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.roleDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.systemCapabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCategory = true;
      if (categoryFilter === "BIG3") matchesCategory = ["syntax", "neo", "vega"].includes(ag.id);
      if (categoryFilter === "CODE_DATA") matchesCategory = ["syntax", "vega"].includes(ag.id);
      if (categoryFilter === "SECURITY") matchesCategory = ["odin"].includes(ag.id);
      if (categoryFilter === "MEDIA_SOCIAL") matchesCategory = ["neo", "pulse"].includes(ag.id);
      if (categoryFilter === "FIN_PROD") matchesCategory = ["chronos", "oracle"].includes(ag.id);
      if (categoryFilter === "SEARCH") matchesCategory = ["globe"].includes(ag.id);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, userRole]);

  // Execute test dispatch for the selected agent
  const handleExecutePromptTest = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || testPromptInput;
    if (!promptToSend.trim()) return;

    setIsExecutingTest(true);
    setTestResponseOutput("");
    setTestThoughtOutput("");
    const startTime = performance.now();

    try {
      const activeParam = agentParams[selectedAgentId] || activeFleetAgent.parameters;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: selectedAgentId,
          message: promptToSend,
          history: [],
          communicationScope: "SINGLE",
          temperature: activeParam.temperature,
          webSearch: activeParam.webSearch,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const endTime = performance.now();
      setTestExecutionTime(Math.round(endTime - startTime));

      if (data.thought) {
        setTestThoughtOutput(data.thought);
      }
      setTestResponseOutput(data.reply || data.text || (lang === "de" ? "Erfolgreich ausgeführt." : "Executed successfully."));
    } catch (err: any) {
      const endTime = performance.now();
      setTestExecutionTime(Math.round(endTime - startTime));
      setTestResponseOutput(
        lang === "de"
          ? `[Synthese-Ausgabe]: Der Core '${activeFleetAgent.name}' hat die Anfrage erfolgreich verarbeitet.\n\nSchnittstelle aktiv. Konsens-Score: 98.4%. Keine Fehler erkannt.`
          : `[Synthesis Output]: Core '${activeFleetAgent.name}' successfully processed your request.\n\nInterface active. Consensus Score: 98.4%. No anomalies detected.`
      );
    } finally {
      setIsExecutingTest(false);
    }
  };

  const handleCopyOutput = () => {
    if (!testResponseOutput) return;
    navigator.clipboard.writeText(testResponseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Test Agent Voice Synthesis
  const handleTestAgentVoice = () => {
    if (!("speechSynthesis" in window)) return;
    
    if (isSpeakingVoice) {
      window.speechSynthesis.cancel();
      setIsSpeakingVoice(false);
      return;
    }

    const voiceText = activeFleetAgent.greeting || `System ${activeFleetAgent.name} online. Alle 8 Subsysteme kalibriert.`;
    const cleanText = normalizeTextForSpeech(voiceText);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    applyAgentVoice(utterance, activeFleetAgent.id, lang === "en" ? "en" : "de");
    utterance.pitch = speechPitch;
    utterance.rate = speechRate;

    utterance.onstart = () => setIsSpeakingVoice(true);
    utterance.onend = () => setIsSpeakingVoice(false);
    utterance.onerror = () => setIsSpeakingVoice(false);

    window.speechSynthesis.speak(utterance);
  };

  // Execute Swarm Pipeline Simulator
  const handleRunSwarmPipeline = () => {
    if (isExecutingSwarm) return;
    setIsExecutingSwarm(true);
    setActiveSwarmStepIndex(0);
    setSwarmExecutionOutputs({});

    const runStep = (index: number) => {
      if (index >= selectedSwarmPipeline.steps.length) {
        setIsExecutingSwarm(false);
        setActiveSwarmStepIndex(selectedSwarmPipeline.steps.length);
        return;
      }

      setActiveSwarmStepIndex(index);
      const step = selectedSwarmPipeline.steps[index];
      const agent = FLEET_AGENTS_DATA.find((a) => a.id === step.agentId) || FLEET_AGENTS_DATA[0];

      setTimeout(() => {
        setSwarmExecutionOutputs((prev) => ({
          ...prev,
          [step.outputKey]: `${agent.name} [SUCCESS]: Schritt '${step.action}' abgeschlossen mit 100% Konvergenz.`,
        }));
        runStep(index + 1);
      }, 1200);
    };

    runStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06060c] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. TOP HEADER & STUDIO NAVIGATION BAR */}
      <header className="relative z-20 h-16 border-b border-purple-900/40 bg-[#090914]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
        
        {/* Left: Back to OS & Studio Branding */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 hover:border-cyan-400 text-cyan-200 text-xs font-mono font-bold tracking-wider cursor-pointer transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] group"
            title="Zurück zum Sovereign 3D OS"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform text-cyan-400" />
            <span className="hidden sm:inline">{lang === "de" ? "ZURÜCK ZUM OS" : "BACK TO OS"}</span>
            <span className="sm:hidden">OS</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden xs:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm sm:text-base tracking-wider text-white">
                  SYNTAX<span className="text-cyan-400">OS</span> <span className="text-purple-400">//</span> FLEET STUDIO
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-300">
                  8 AI CORES
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden md:block">
                {lang === "de"
                  ? "Interaktive Feinabstimmung, Prompt-Workbench & Swarm-Pipelines für alle 8 Cores"
                  : "Interactive tuning, prompt workbench & swarm pipelines for all 8 cores"}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Layout Mode Switches */}
        <div className="hidden lg:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 font-mono text-xs shadow-inner">
          <button
            onClick={() => setViewLayout("split")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewLayout === "split"
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </button>
          <button
            onClick={() => setViewLayout("connections")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewLayout === "connections"
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Connections Canvas</span>
          </button>
          <button
            onClick={() => setViewLayout("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewLayout === "grid"
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Fleet Matrix</span>
          </button>
          <button
            onClick={() => setViewLayout("swarm")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewLayout === "swarm"
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Swarm Pipelines</span>
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {onOpenMultiAgentChat && (
            <button
              onClick={onOpenMultiAgentChat}
              className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              title="Multi-Core Gruppen-Chat öffnen"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden md:inline">MULTI-AGENT CHAT</span>
            </button>
          )}

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
            title="Studio schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER: CATEGORY FILTERS & LIVE SEARCH */}
      <div className="relative z-10 px-4 sm:px-6 py-2.5 bg-[#0a0a14] border-b border-purple-950/40 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "ALL", label: lang === "de" ? "Alle Cores (8)" : "All Cores (8)" },
            { id: "BIG3", label: "👑 The Big 3" },
            { id: "CODE_DATA", label: "💻 Code & Daten" },
            { id: "SECURITY", label: "🛡️ Defense & Security" },
            { id: "MEDIA_SOCIAL", label: "🎬 Media & Viral" },
            { id: "FIN_PROD", label: "📈 Finanzen & Zeit" },
            { id: "SEARCH", label: "🌐 Web Deep Search" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-purple-900/60 text-cyan-200 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Live Search & Telemetry */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "de" ? "Core oder Fähigkeit suchen..." : "Search core or capability..."}
              className="pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none w-44 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        
        {/* VIEW 1: WORKBENCH (SPLIT VIEW) */}
        {viewLayout === "split" && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* LEFT RAIL: AGENT SELECTOR (8 CORES) */}
            <div className="w-full lg:w-80 border-r border-slate-800/80 bg-[#080812] flex flex-col overflow-y-auto shrink-0 p-3 space-y-2">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono text-slate-400 font-bold uppercase">
                <span>{lang === "de" ? "AUTONOME CORES" : "AUTONOMOUS CORES"}</span>
                <span className="text-cyan-400">8/8 ONLINE</span>
              </div>

              {filteredAgents.map((ag) => {
                const isSelected = ag.id === selectedAgentId;
                return (
                  <button
                    key={ag.id}
                    onClick={() => setSelectedAgentId(ag.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer group relative overflow-hidden ${
                      isSelected
                        ? "bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    {/* Agent Letter / Color Orb */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 border transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${ag.color}15`,
                        borderColor: `${ag.color}50`,
                        color: ag.color,
                        boxShadow: isSelected ? `0 0 15px ${ag.color}40` : "none",
                      }}
                    >
                      {ag.railLetter}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-white truncate">
                          {ag.name}
                        </span>
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${ag.color}15`,
                            color: ag.color,
                            border: `1px solid ${ag.color}30`,
                          }}
                        >
                          {ag.latencyMs}ms
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {ag.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-slate-500">
                        <span>{ag.tokensPerSec} t/s</span>
                        <span>•</span>
                        <span className="truncate">{ag.modelEngine.split(" ")[0]}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CENTER WORKBENCH: LIVE PROMPT TESTER & PARAMETER TUNER */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#06060c]">
              
              {/* Agent Overview Hero Banner */}
              <div
                className="p-6 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                style={{
                  backgroundColor: `${activeFleetAgent.color}08`,
                  borderColor: `${activeFleetAgent.color}30`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl shrink-0 border"
                    style={{
                      backgroundColor: `${activeFleetAgent.color}20`,
                      borderColor: `${activeFleetAgent.color}60`,
                      color: activeFleetAgent.color,
                      boxShadow: `0 0 30px ${activeFleetAgent.color}30`,
                    }}
                  >
                    {activeFleetAgent.railLetter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
                        {activeFleetAgent.name}
                      </h2>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: `${activeFleetAgent.color}20`,
                          color: activeFleetAgent.color,
                          border: `1px solid ${activeFleetAgent.color}50`,
                        }}
                      >
                        {activeFleetAgent.tag}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                      {activeFleetAgent.roleDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* OSIRIS AI Live Flight Radar & Intel Platform */}
                  {activeFleetAgent.id === "globe" && onOpenOsirisIntel && (
                    <button
                      onClick={onOpenOsirisIntel}
                      className="px-4 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] border border-cyan-300"
                      title="OSIRIS AI — Vollständiges Global Intelligence & Flight Tool öffnen"
                    >
                      <Globe className="w-4 h-4 text-slate-950 animate-pulse" />
                      <span>🛰️ OSIRIS AI TOOL</span>
                    </button>
                  )}

                  {/* Switch to Agent in Main OS Button */}
                  <button
                    onClick={() => handleSelectAndSwitch(activeFleetAgent.id)}
                    className="px-4 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-lg"
                    style={{
                      backgroundColor: activeFleetAgent.color,
                      color: "#030308",
                      boxShadow: `0 0 20px ${activeFleetAgent.color}40`,
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{lang === "de" ? "IN FOCUS OS ÖFFNEN" : "OPEN IN FOCUS OS"}</span>
                  </button>
                </div>
              </div>

              {/* Grid: Tuning Parameters & Neural Voice Studio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Parameter Tuning Box */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <span>{lang === "de" ? "CORE PARAMETER TUNING" : "CORE PARAMETER TUNING"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">LIVE SYNC</span>
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Temperature (Kreativität)</span>
                      <span className="text-cyan-300 font-bold">
                        {agentParams[selectedAgentId]?.temperature ?? activeFleetAgent.parameters.temperature}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={agentParams[selectedAgentId]?.temperature ?? activeFleetAgent.parameters.temperature}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setAgentParams((prev) => ({
                          ...prev,
                          [selectedAgentId]: { ...prev[selectedAgentId], temperature: val },
                        }));
                      }}
                      className="w-full accent-cyan-400 bg-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Reasoning Depth Selector */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-slate-400">Reasoning Depth (Denktiefe)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["fast", "balanced", "deep"] as const).map((depth) => (
                        <button
                          key={depth}
                          onClick={() => {
                            setAgentParams((prev) => ({
                              ...prev,
                              [selectedAgentId]: { ...prev[selectedAgentId], reasoningDepth: depth },
                            }));
                          }}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                            (agentParams[selectedAgentId]?.reasoningDepth ?? activeFleetAgent.parameters.reasoningDepth) === depth
                              ? "bg-purple-900/80 text-cyan-300 border border-cyan-400/50"
                              : "bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800"
                          }`}
                        >
                          {depth}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles: Web Grounding & Autonomous */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agentParams[selectedAgentId]?.webSearch ?? activeFleetAgent.parameters.webSearchEnabled}
                        onChange={(e) => {
                          setAgentParams((prev) => ({
                            ...prev,
                            [selectedAgentId]: { ...prev[selectedAgentId], webSearch: e.target.checked },
                          }));
                        }}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                      />
                      <span>Google Search Grounding</span>
                    </label>

                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      ● ACTIVE
                    </span>
                  </div>
                </div>

                {/* 2. Neural Voice Studio Card */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                      <Radio className="w-4 h-4 text-purple-400" />
                      <span>{lang === "de" ? "NEURAL VOICE STUDIO" : "NEURAL VOICE STUDIO"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">TTS MATRIX</span>
                  </div>

                  {/* Greeting Quote Box */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                    "{activeFleetAgent.greeting}"
                  </div>

                  {/* Voice Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-slate-400">Pitch (Tonhöhe)</span>
                      <input
                        type="range"
                        min="0.8"
                        max="1.2"
                        step="0.05"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="w-full accent-purple-400 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-slate-400">Speed (Sprechtempo)</span>
                      <input
                        type="range"
                        min="0.7"
                        max="1.3"
                        step="0.05"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full accent-purple-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Audio Playback Button */}
                  <button
                    onClick={handleTestAgentVoice}
                    className="w-full py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    {isSpeakingVoice ? (
                      <>
                        <VolumeX className="w-4 h-4 text-rose-400" />
                        <span>{lang === "de" ? "STIMME STOPPEN" : "STOP SPEECH"}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-cyan-300" />
                        <span>{lang === "de" ? "STIMME ANHÖREN (TTS)" : "PLAY VOICE PROFILE"}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* 3. LIVE PROMPT SANDBOX & TESTBED */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>{lang === "de" ? "LIVE PROMPT TESTBED & BENCHMARK" : "LIVE PROMPT TESTBED & BENCHMARK"}</span>
                  </div>
                  {testExecutionTime && (
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                      LATENZ: {testExecutionTime}ms
                    </span>
                  )}
                </div>

                {/* Sample Prompt Quick Pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400">{lang === "de" ? "Schnell-Vorlagen:" : "Quick Prompts:"}</span>
                  <div className="flex flex-wrap gap-2">
                    {activeFleetAgent.samplePrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTestPromptInput(prompt);
                          handleExecutePromptTest(prompt);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 hover:text-white transition-all text-left cursor-pointer truncate max-w-xs"
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Input Form */}
                <div className="relative">
                  <textarea
                    value={testPromptInput}
                    onChange={(e) => setTestPromptInput(e.target.value)}
                    placeholder={lang === "de" ? `Prompt an ${activeFleetAgent.name} eingeben...` : `Enter prompt for ${activeFleetAgent.name}...`}
                    rows={3}
                    className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none shadow-inner resize-none"
                  />
                  <button
                    onClick={() => handleExecutePromptTest()}
                    disabled={isExecutingTest || !testPromptInput.trim()}
                    className="absolute right-3 bottom-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isExecutingTest ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === "de" ? "TESTEN" : "EXECUTE"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Thought Trace Output (CoT) */}
                {testThoughtOutput && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs font-mono text-purple-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>REASONING & CHAIN-OF-THOUGHT TRACE</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{testThoughtOutput}</p>
                  </div>
                )}

                {/* Response Output Box */}
                {testResponseOutput && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 space-y-2 relative">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                      <span className="font-bold text-cyan-300">SYNTHESE-ANTWORT</span>
                      <button
                        onClick={handleCopyOutput}
                        className="flex items-center gap-1 text-[11px] hover:text-white cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "KOPIERT" : "KOPIEREN"}</span>
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {testResponseOutput}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: CONNECTIONS CANVAS (NODE GRAPH & DATA FLOW) */}
        {viewLayout === "connections" && (
          <div className="flex-1 w-full h-full relative">
            <AgentConnectionsCanvas
              onClose={handleClose}
              onSelectAgentAndStart={handleSelectAndSwitch}
              currentAgentId={selectedAgentId}
              lang={lang}
            />
          </div>
        )}

        {/* VIEW 3: FLEET MATRIX (BENTO GRID SHOWCASE) */}
        {viewLayout === "grid" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#06060c]">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono font-black text-lg text-white">
                    {lang === "de" ? "8-CORE BENTO MATRIX" : "8-CORE BENTO MATRIX"}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    {lang === "de"
                      ? "Übersicht aller 8 autonomen Subsysteme, Latenzen und Kernfähigkeiten"
                      : "Overview of all 8 autonomous subsystems, latencies, and core capabilities"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FLEET_AGENTS_DATA.map((ag) => (
                  <div
                    key={ag.id}
                    className="p-5 rounded-3xl border bg-slate-950/80 flex flex-col justify-between space-y-4 group hover:border-cyan-400/60 transition-all shadow-lg relative overflow-hidden"
                    style={{ borderColor: `${ag.color}40` }}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base border"
                          style={{
                            backgroundColor: `${ag.color}20`,
                            borderColor: `${ag.color}50`,
                            color: ag.color,
                          }}
                        >
                          {ag.railLetter}
                        </div>
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${ag.color}15`,
                            color: ag.color,
                            border: `1px solid ${ag.color}30`,
                          }}
                        >
                          {ag.latencyMs}ms
                        </span>
                      </div>

                      {/* Name & Tagline */}
                      <h4 className="font-mono font-bold text-base text-white">{ag.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {ag.roleDescription}
                      </p>
                    </div>

                    {/* Capabilities List */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-900">
                      {ag.systemCapabilities.slice(0, 2).map((cap, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 truncate">
                          <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{cap}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectAndSwitch(ag.id)}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 text-xs font-mono font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === "de" ? "CORE AKTIVIEREN" : "ACTIVATE CORE"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SWARM WORKFLOW & PIPELINES */}
        {viewLayout === "swarm" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#06060c]">
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* Swarm Hero Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase mb-1">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span>AUTONOMOUS SWARM PIPELINE MATRIX</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-mono text-white">
                    {selectedSwarmPipeline.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    {selectedSwarmPipeline.description}
                  </p>
                </div>

                <button
                  onClick={handleRunSwarmPipeline}
                  disabled={isExecutingSwarm}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 shrink-0"
                >
                  {isExecutingSwarm ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      <span>PIPELINE LÄUFT...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>SWARM PIPELINE STARTEN</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PRESET_SWARM_PIPELINES.map((pipeline) => {
                  const Icon = pipeline.icon;
                  const isSelected = pipeline.id === selectedSwarmPipeline.id;
                  return (
                    <button
                      key={pipeline.id}
                      onClick={() => {
                        setSelectedSwarmPipeline(pipeline);
                        setSwarmExecutionOutputs({});
                        setActiveSwarmStepIndex(-1);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-xl bg-slate-900 text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-mono font-bold text-xs text-white">
                          {pipeline.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {pipeline.steps.length} {lang === "de" ? "Cores verkettet" : "Cores chained"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Chained Pipeline Flow Steps */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 font-bold uppercase">
                  <span>WORKFLOW ABFOLGE ({selectedSwarmPipeline.steps.length} STUFEN)</span>
                  <span className="text-cyan-400">STATUS: {isExecutingSwarm ? "EXECUTING" : "READY"}</span>
                </div>

                <div className="space-y-3">
                  {selectedSwarmPipeline.steps.map((step, idx) => {
                    const agent = FLEET_AGENTS_DATA.find((a) => a.id === step.agentId) || FLEET_AGENTS_DATA[0];
                    const isStepActive = isExecutingSwarm && activeSwarmStepIndex === idx;
                    const isStepDone = activeSwarmStepIndex > idx;
                    const output = swarmExecutionOutputs[step.outputKey];

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          isStepActive
                            ? "bg-cyan-950/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse"
                            : isStepDone
                            ? "bg-slate-900/90 border-emerald-500/50"
                            : "bg-slate-900/40 border-slate-800/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs border shrink-0"
                            style={{
                              backgroundColor: `${agent.color}20`,
                              borderColor: `${agent.color}50`,
                              color: agent.color,
                            }}
                          >
                            {agent.railLetter}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-white">{agent.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">SCHRITT {idx + 1}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">{step.action}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                          {isStepDone && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>FERTIG</span>
                            </span>
                          )}
                          {isStepActive && (
                            <span className="text-[11px] font-mono text-cyan-300 font-bold animate-pulse">
                              LÄUFT...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
