import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Monitor,
  LayoutGrid,
  Cpu,
  Layers,
  Play,
  Pause,
  ArrowRight,
  Shield,
  Radio,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Target,
  FileText,
  RotateCcw,
  ExternalLink,
  Send,
  HelpCircle,
  Crown,
  AlertTriangle,
  Users,
  Compass,
  Check,
  TrendingUp,
  Brain,
  Video,
  Code2,
  LineChart,
  Globe,
  Mail,
  Share2,
  Tv,
  Eye,
  Settings,
  ShieldAlert,
  Search,
  BookOpen,
  Terminal,
  ShoppingBag,
  MapPin,
  MessageSquare,
  Calendar,
  CalendarDays,
  Table,
  Copy,
  ChevronDown,
  ChevronUp,
  Camera,
  Wand2,
  BarChart3,
  Coins,
  Activity,
  CreditCard,
  Mic,
  RefreshCw,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  Minus,
} from "lucide-react";
import { SYSTEM_AGENTS, AgentDetails } from "../data/agentCapabilitiesData";
import { ChronosCalendarWidget } from "./ChronosCalendarWidget";
import { TOUR_STEPS_EN, TRANSLATIONS, Language } from "../utils/translations";
import { normalizeTextForSpeech, applyAgentVoice } from "../utils/voiceUtils";
import { AgentSpeechAnimation } from "./AgentSpeechAnimation";
import { useTheme } from "../utils/themeStore";

export interface TourStep {
  id: string;
  targetId: string;
  fallbackSelector?: string;
  title: string;
  badge: string;
  category: string;
  description: string;
  spokenText: string;
  actionTip: string;
  iconName: "zap" | "grid" | "shield" | "mic" | "monitor" | "store" | "sliders" | "help" | "crown" | "alert" | "users" | "mail" | "eye" | "terminal" | "video" | "map" | "chat" | "calendar" | "camera" | "wand" | "flame" | "coins" | "chart" | "layers" | "hub";
  glowColor: "cyan" | "purple" | "amber" | "emerald" | "rose";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome-focus-canvas",
    targetId: "#tour-focus-canvas-area",
    fallbackSelector: "main",
    title: "👑 WILLKOMMEN IM S.Y.N.T.A.X. FOCUS CANVAS, BOSS",
    badge: "EINWEISUNG & MASTER-TUTORIAL",
    category: "DEIN SECOND BRAIN WORKSPACE",
    description:
      "Herzlich willkommen in Ihrer operativen Kommandozentrale! Der Focus Canvas bündelt alle 8 autonomen Spezial-Cores, Screen-Perception, Lovable Fullstack Engine, Daily Objectives, vollständige Token-Telemetrie und Google Workspace Tools. In diesem Tutorial führen wir Sie durch alle wesentlichen Werkzeuge und Arbeitsabläufe samt Sprachbefehlen.",
    spokenText:
      "Willkommen im Focus Canvas, Boss! In diesem System-Tutorial zeigen wir Ihnen alle Werkzeuge, Daily Objectives, Queries und Sprachbefehle für maximale Produktivität.",
    actionTip: "Tipp: Klicken Sie auf 'WEITER', um die interaktive System-Einweisung durch die Leisten, Hubs, Daily Objectives und Token-Analyse zu starten.",
    iconName: "crown",
    glowColor: "amber",
  },
  {
    id: "top-command-hub",
    targetId: "#tour-comm-scope",
    fallbackSelector: "header",
    title: "1. TOP COMMAND BAR & SPRACHSTEUERUNG",
    badge: "KOMMANDOZENTRALE & MIKROFON",
    category: "OBERE STEUERUNGSLEISTE",
    description:
      "Die obere Leiste bündelt Ihre Kommunikations-Scopes: '👤 SINGLE' (1x Tokens), '⚡ AGENT-SYNC' (Konsens-Synthese), '👑 THE BIG 3' (3x Tokens) und '🌐 ALL (8)' (8x Tokens). Zudem steuern Sie hier das Live-Mikrofon (oder per Leertaste), die Sprachkonferenz und das Quick-Hubs-Dropdown.",
    spokenText:
      "Die obere Command Bar ist Ihre Master-Leiste für Kommunikations-Scopes, Sprachsteuerung per Mikrofon, Konferenzen und Schnellzugriffe.",
    actionTip: "Sprachbefehl: Drücken Sie die Leertaste oder klicken Sie auf die Mikrofon-Pill, um sofortige Sprachbefehle an die Cores zu senden.",
    iconName: "zap",
    glowColor: "cyan",
  },
  {
    id: "queries-inspector",
    targetId: "#tour-queries-btn",
    fallbackSelector: "#tour-quota-hud",
    title: "2. MEMORY & 3D PARTIKEL-UNIVERSE (SPRACHBEFEHL: 'ÖFFNE MEMORY')",
    badge: "🔮 3D MEMORY UNIVERSE & LATENZ",
    category: "MEMORY-TRANSPARENZ & LOGS",
    description:
      "Mit 'MEMORY' oben in der Command Bar (oder per Sprachbefehl 'Öffne Memory') öffnen Sie das interaktive 3D Partikel-Universum und die Prompt-Telemetrie. Jeder Partikel repräsentiert eine Anfrage oder Erinnerung, inkl. Token-Kosten, Chain of Thought, Latenzen und CSV/JSON Export!",
    spokenText:
      "Das MEMORY System oben in der Leiste visualisiert alle Agenten-Prompts als interaktives 3D Partikel-Universum mit Latenzen, Token-Kosten und Chain of Thought. Sagen Sie einfach: Öffne Memory.",
    actionTip: "Sprachbefehle: 'Öffne Memory', 'Zeige Gedächtnis', 'Agenten Logs öffnen' oder 'Memory Universe anzeigen'.",
    iconName: "chart",
    glowColor: "purple",
  },
  {
    id: "todays-usage-telemetry",
    targetId: "#tour-todays-usage",
    fallbackSelector: "#tour-quota-hud",
    title: "3. TOP BAR: GANZE TOKEN-ÜBERSICHT & LIVE ANFRAGEN",
    badge: "🔥 LIVE TOKEN TELEMETRIE & REQUESTS",
    category: "TÄGLICHER VERBRAUCH & RESETS",
    description:
      "Das 'TODAY'S USAGE' Element oben rechts misst Ihren tatsächlichen Token-Verbrauch in Echtzeit (Input-Prompt-Tokens + Output-Antwort-Tokens) sowie jede einzelne Live-Anfrage mit Latenz und Modell. Quoten erneuern sich alle 24 Stunden um 00:00 Uhr UTC automatisch. Ein Klick öffnet das detaillierte Daily Usage Analytics Dashboard!",
    spokenText:
      "Today's Usage misst Ihren täglichen Token-Verbrauch und jede einzelne Anfrage in Echtzeit. Quoten erneuern sich alle 24 Stunden automatisch.",
    actionTip: "Tipp: Klicken Sie auf die Flammen-Box oben rechts, um Latenz, Rechenzeit und den gesamten Anfragen-Verlauf einzusehen.",
    iconName: "flame",
    glowColor: "amber",
  },
  {
    id: "daily-objectives-step",
    targetId: "#tour-comm-scope",
    fallbackSelector: "#tour-focus-canvas-area",
    title: "4. TAGESZIELE & STREAKS (SPRACHBEFEHL: 'ZEIGE TAGESZIELE')",
    badge: "🎯 TAGESZIELE & +50.000 TOKEN-BONUS",
    category: "PRODUKTIVITÄT & XP",
    description:
      "Die Daily Objectives motivieren mit 4 täglichen Missionen, Streaks (Tages-Serien) und XP-Progression. Durch Erfüllen von Zielen schalten Sie bis zu +50.000 Bonus-Tokens frei und halten Ihre Produktivität auf Höchststand!",
    spokenText:
      "Mit den Daily Objectives und Streaks schalten Sie täglich Bonus-Tokens frei und behalten Ihre Arbeitsziele immer im Blick. Sagen Sie: Zeige Tagesziele.",
    actionTip: "Sprachbefehle: 'Zeige Tagesziele', 'Was sind meine Missionen heute?', 'Status Tagesstreak'.",
    iconName: "zap",
    glowColor: "amber",
  },
  {
    id: "agent-fleet-studio",
    targetId: "#tour-agents-selector",
    fallbackSelector: "#tour-comm-scope",
    title: "5. AGENT FLEET STUDIO // 9-CORE MATRIX (SPRACHBEFEHL: 'ÖFFNE FLEET STUDIO')",
    badge: "👥 9-CORE STEUERUNG & BENCHMARKS",
    category: "FLOTTEN-STUDIO & CORES",
    description:
      "Das Agent Fleet Studio bietet eine vollständige Kommandoübersicht über alle 8 Cores (SYNTAX, NEO, VEGA, ODIN, PULSE, CHRONOS, ORACLE, GLOBE). Hier testen Sie Cores interaktiv, führen Multi-Core Benchmarks durch und steuern Konsens-Workflows.",
    spokenText:
      "Im Agent Fleet Studio verwalten und testen Sie alle 8 Spezial-Cores simultan. Sagen Sie: Öffne Fleet Studio.",
    actionTip: "Sprachbefehle: 'Öffne Fleet Studio', 'Zeige alle 8 Cores', 'Starte Flotten-Test'.",
    iconName: "users",
    glowColor: "purple",
  },
  {
    id: "voice-conference-step",
    targetId: "#tour-comm-scope",
    fallbackSelector: "header",
    title: "6. 8-CORE SPRACHKONFERENZ (SPRACHBEFEHL: 'STARTE SPRACHKONFERENZ')",
    badge: "🎙️ LIVE DISKUSSIONSRUNDE",
    category: "MULTI-AGENTEN KONFERENZ",
    description:
      "Die Live-Sprachkonferenz schaltet alle 8 Spezial-Cores in einen synchronen Audio-Roundtable. Die Agenten diskutieren eigenständig über Ihre Strategie, Architektur oder Marketingfragen mit echten KI-Stimmen!",
    spokenText:
      "Mit der Sprachkonferenz starten Sie eine interaktive Audio-Diskussionsrunde aller Cores zu Ihrem Thema.",
    actionTip: "Sprachbefehle: 'Starte Sprachkonferenz', 'Konferenz beginnen', 'Diskutiert über Skalierungsstrategie'.",
    iconName: "mic",
    glowColor: "cyan",
  },
  {
    id: "quota-cost-warning",
    targetId: "#tour-quota-hud",
    fallbackSelector: "#tour-comm-scope",
    title: "7. QUOTEN & API-BELASTUNGS-MULTIPLIKATOREN",
    badge: "⚠️ 1x, 3x & 8x TOKEN-VERBRAUCH",
    category: "KOSTEN- & EFFIZIENZ-CHECK",
    description:
      "Hier oben rechts sehen Sie den API-Belastungsbalken. Wichtig für Ihr Token-Budget: 'SINGLE' verbraucht 1x Tokens, 'THE BIG 3' verbraucht das 3-fache und 'ALL (8)' das 8-fache. Mit eigenem Gemini API-Key surfen Sie zu 100% unbegrenzt.",
    spokenText:
      "Der Quoten-Balken oben rechts schützt vor Limits. Nutzen Sie Single-Modus für 90% der Routineaufgaben und schalten Sie The Big 3 gezielt zu.",
    actionTip: "Goldene Regel: 90% der Aufgaben mit Einzel-Agenten lösen – ALL & BIG 3 als Hochleistungs-Schub zuschalten.",
    iconName: "alert",
    glowColor: "rose",
  },
  {
    id: "agent-switching",
    targetId: "#tour-agents-selector",
    fallbackSelector: ".fixed.top-\\[71\\%\\]",
    title: "8. UNTEN: MATRIX HUB (8-CORE SCHNELLWECHSEL)",
    badge: "8 SPEZIALISIERTE CORES",
    category: "UNTERE KONSOLEN-LEISTE",
    description:
      "GENAU HIER UNTEN in der schwebenden 'MATRIX HUB'-Leiste (unter der 3D-Sphäre) finden Sie die Schnellwechsel-Tasten (S, N, V, O, P, C, R, G). Jeder Buchstabe schaltet verzögerungsfrei auf den jeweiligen Spezial-Core um.",
    spokenText:
      "In der Matrix-Hub-Leiste direkt unter der Kugel wechseln Sie den aktiven Spezial-Agenten per Klick auf die Buchstaben S, N, V, O, P, C, R, G.",
    actionTip: "Sprachbefehl: Sagen Sie 'Wechsle zu Neo', 'Aktiviere Vega' oder 'Schalte auf Chronos'.",
    iconName: "users",
    glowColor: "cyan",
  },
  {
    id: "the-big-3",
    targetId: "#tour-comm-scope",
    fallbackSelector: "header",
    title: "9. OBEN LINKS: 'THE BIG 3' (SPRACHBEFEHL: 'AKTIVIERE THE BIG 3')",
    badge: "👑 SYNTAX • NEO • VEGA",
    category: "TRI-CORE ELITE-MATRIX",
    description:
      "Oben in der Menüleiste neben dem Agentennamen befindet sich der Button '👑 THE BIG 3'. Er bündelt die 3 stärksten Cores (SYNTAX, NEO und VEGA), um Ihre Prompts synchron und parallel zu analysieren.",
    spokenText:
      "Oben links schaltet 'The Big 3' die drei Spitzen-Cores Syntax, Neo und Vega für synchrones Arbeiten zusammen.",
    actionTip: "Sprachbefehl: 'Aktiviere The Big 3' oder 'Schalte auf Tri-Core'.",
    iconName: "crown",
    glowColor: "amber",
  },
  {
    id: "all-8-overview",
    targetId: "#tour-comm-scope",
    fallbackSelector: "header",
    title: "10. OBEN LINKS: 'ALL (8)' (SPRACHBEFEHL: 'AKTIVIERE ALLE 8 CORES')",
    badge: "VOLLSTÄNDIGE MATRIX (8)",
    category: "ALLE 8 SYSTEM-AGENTEN",
    description:
      "Mit '🌐 ALL (8)' in der oberen Leiste sprechen Sie das gesamte 8er-Geschwader synchron an: Master-Architektur, Video-Produktion, Daten, Security, Social-Media, Zeitplanung, Finanzen und Web-Recherche.",
    spokenText:
      "Mit dem Schalter 'All 8' sprechen Sie die gesamte Flotte synchron an – von Finanz-Analysen bis zur Web-Recherche.",
    actionTip: "Sprachbefehl: 'Aktiviere alle 8 Cores' oder 'Flotten-Swarm starten'.",
    iconName: "shield",
    glowColor: "purple",
  },
  {
    id: "screen-perception",
    targetId: "#tour-screen-hud",
    fallbackSelector: "#tour-screen-btn",
    title: "11. MONITOR-FREIGABE & VISION AI (SPRACHBEFEHL: 'STARTE MONITOR-BEOBACHTUNG')",
    badge: "AUTONOME VISION AI",
    category: "BILDSCHIRM-BEOBACHTUNG",
    description:
      "Mit der Monitor-Freigabe (am oberen Bildschirmrand oder per HUD) liest die KI Ihren Monitor live mit. Code, Dokumente oder Charts werden autonom im Hintergrund analysiert, ohne dass Sie Screenshots hochladen müssen.",
    spokenText:
      "Mit der Monitor-Freigabe liest die Vision-KI Ihren Code und Arbeitsbereich live im Hintergrund mit.",
    actionTip: "Sprachbefehl: 'Starte Monitor-Beobachtung' oder 'Aktiviere Vision AI'.",
    iconName: "eye",
    glowColor: "purple",
  },
  {
    id: "terminal-code",
    targetId: "#tour-terminal-btn",
    fallbackSelector: "#tour-app-store",
    title: "12. LOVABLE FULLSTACK ENGINE & RECHENLEISTUNG (SPRACHBEFEHL: 'ÖFFNE TERMINAL')",
    badge: "CLI & RECHENLEISTUNG (ECO/TURBO)",
    category: "TERMINAL & RECHENLEISTUNG",
    description:
      "Hier in der linken Nav-Rail befindet sich das lila Terminal-Icon. Es dient für die Lovable Fullstack Engine & autonome Scripts und erlaubt es Ihnen, die Rechenleistung jedes Agenten zwischen 'ECO' (sparsam), 'BALANCED' (optimal) und 'TURBO' (maximale Power) anzupassen.",
    spokenText:
      "Das lila Terminal-Icon links öffnet die Lovable Fullstack Engine und erlaubt es Ihnen, die Rechenleistung und Antworttiefe jedes Agenten zwischen ECO, Balanced und Turbo einzustellen.",
    actionTip: "Sprachbefehle: 'Öffne Terminal', 'Schalte Rechenleistung auf Turbo' oder 'Rechenleistung auf Eco'.",
    iconName: "terminal",
    glowColor: "purple",
  },
  {
    id: "veo3-studio",
    targetId: "#tour-veo-btn",
    fallbackSelector: "#tour-app-store",
    title: "13. GOOGLE VEO 3.1 8K AI VIDEO STUDIO (SPRACHBEFEHL: 'ÖFFNE VEO / GENERIERE VIDEO')",
    badge: "8K CINEMATIC VIDEO",
    category: "VEO 3.1 VIDEO STUDIO",
    description:
      "Hier in der linken Nav-Rail befindet sich das pinkfarbene Video-Icon für Google Veo 3.1. Damit generieren Sie aus Text-Prompts oder Standbildern cinematische 8K-Videos und interaktive Animationen.",
    spokenText:
      "Das pinkfarbene Video-Symbol startet das Google Veo 3.1 Studio für hochauflösende 8K KI-Video-Generierung.",
    actionTip: "Sprachbefehle: 'Öffne Veo Studio', 'Generiere ein Video von [Szene]', 'Erstelle 8K Video'.",
    iconName: "video",
    glowColor: "rose",
  },
  {
    id: "google-maps",
    targetId: "#tour-maps-btn",
    fallbackSelector: "#tour-app-store",
    title: "14. GOOGLE MAPS (SPRACHBEFEHL: 'ZEIG MIR KARTE VON...')",
    badge: "VOICE & SYSTEM PROJEKTION",
    category: "GEO & 3D SATELLITEN-KARTEN",
    description:
      "Google Maps öffnet sich intelligent auf gezielten Sprachbefehl oder Klick! Sagen oder tippen Sie z. B. 'Zeige mir eine Karte von Berlin' oder 'Projektiere mir eine Karte von Tokio aufs Display'. Maps öffnet sich niemals mehr versehentlich bei normalen Ortsfragen.",
    spokenText:
      "Google Maps ist direkt mit Ihrer Stimme verknüpft und öffnet sich nur noch auf gezielten Befehl – sagen Sie einfach: Zeige mir eine Karte von Berlin.",
    actionTip: "Sprachbefehle: 'Zeige mir eine Karte von Paris', 'Projektiere Karte von Rom aufs Display' oder 'Route von München nach Wien'.",
    iconName: "map",
    glowColor: "emerald",
  },
  {
    id: "gmail-assistant",
    targetId: "#tour-gmail-btn",
    fallbackSelector: "#tour-app-store",
    title: "15. GMAIL CLIENT (SPRACHBEFEHL: 'ZEIGE MEINE NEUSTEN MAILS')",
    badge: "VOICE INTEGRATION & SYNC",
    category: "E-MAIL AUTOMATISIERUNG",
    description:
      "Ihr Gmail-Posteingang ist voll sprachgesteuert! Sagen Sie einfach 'Zeige mir meine neuesten Mails'. Falls Ihr Gmail-Konto oder die API noch nicht verknüpft ist, teilt der Agent Ihnen das direkt per Sprachausgabe mit und öffnet das Fenster zur Freischaltung.",
    spokenText:
      "Mit dem Sprachbefehl Zeige mir meine neuesten Mails rufen Sie Ihren Posteingang ab. Ist die Gmail API noch nicht verknüpft, sagt Ihnen der Agent sofort Bescheid.",
    actionTip: "Sprachbefehle: 'Zeige mir meine neusten Mails', 'Lies Posteingang vor', 'Antworte auf letzte Mail'.",
    iconName: "mail",
    glowColor: "emerald",
  },
  {
    id: "nano-banana-photo-creator",
    targetId: "#tour-hologram-btn",
    fallbackSelector: "#tour-chat-input-row",
    title: "16. NANO BANANA (SPRACHBEFEHL: 'ERSTELLE EIN BILD VON...')",
    badge: "AI PHOTO STUDIO & 3D HOLOGRAM",
    category: "FOTO-CREATOR & BILD-BEARBEITUNG",
    description:
      "Nano Banana ist der integrierte Foto-Editor und Creator von S.Y.N.T.A.X. & N.E.O. Nutzen Sie die Imagen 3.0 Engine zum Generieren fotorealistischer 4K-Bilder, Inpainting, Retusche, Stil-Transformationen und 3D-Hologramm-Projektionen direkt im Chat oder per Prompt.",
    spokenText:
      "Mit Nano Banana erstellen und bearbeiten Sie fotorealistische Bilder, Retuschen und Hologramme mit Imagen 3.0 und N.E.O.",
    actionTip: "Sprachbefehle: 'Erstelle ein Bild von...', 'Nano Banana starten', 'Generiere 4K Hologramm'.",
    iconName: "camera",
    glowColor: "rose",
  },
  {
    id: "visionos-layout",
    targetId: "#tour-workspace-btn",
    fallbackSelector: "#tour-nav-layout-btn",
    title: "17. VISIONOS WORKSPACE LAYOUT (SPRACHBEFEHL: 'BEARBEITE LAYOUT')",
    badge: "RÄUMLICHE WIDGETS",
    category: "INDIVIDUELLES DASHBOARD",
    description:
      "Oben rechts mit dem Button 'LAYOUT' (oder in der linken Leiste) schalten Sie in den Spatial Layout-Editor. Im Layout-Modus können Sie alle Widgets per Drag & Drop verschieben, skalieren oder Presets wie CODER oder TRADER wählen.",
    spokenText:
      "Der 'LAYOUT'-Button oben rechts öffnet den VisionOS Layout-Editor zum freien Verschieben und Skalieren aller Widgets.",
    actionTip: "Sprachbefehle: 'Bearbeite Layout', 'Layout anpassen', 'Lade Preset Coder'.",
    iconName: "grid",
    glowColor: "cyan",
  },
  {
    id: "agent-chat-toggle",
    targetId: "#tour-chat-toggle",
    fallbackSelector: "button[title*='Chat']",
    title: "18. AGENTEN-CHAT & FLEET DELEGATION MATRIX",
    badge: "FLEET MATRIX & DEEP DIVE",
    category: "AGENTEN-KOMMUNIKATION",
    description:
      "Mit dem Chat-Icon am rechten Rand öffnen Sie das Chatfenster. Hier sehen Sie die Fleet Delegation Matrix: inklusive transparenter 'Gedanken & Strategie' (Chain of Thought), 'Deep Dive Tabellen-Analyse' (Befunde & Prioritäten) und dem interaktiven Console Observer Stream!",
    spokenText:
      "Am rechten Bildschirmrand öffnen Sie das Chatfenster mit der Fleet Delegation Matrix, Gedanken-Kette und Deep Dive Analyse.",
    actionTip: "Sprachbefehl: 'Öffne Chat' oder 'Zeige Deep Dive Analyse'.",
    iconName: "chat",
    glowColor: "cyan",
  },
  {
    id: "calendar-integration",
    targetId: "#tour-calendar-btn",
    fallbackSelector: "#tour-app-store",
    title: "19. GOOGLE CALENDAR & CHRONOS (SPRACHBEFEHL: 'PLANE MORGEN UM...')",
    badge: "GOOGLE WORKSPACE SYNC",
    category: "KALENDER & ZEITMANAGEMENT",
    description:
      "Mit Google Calendar und dem Chronos Terminplaner synchronisieren Sie Ihre Meetings, Deadlines und Projektphasen. S.Y.N.T.A.X. trägt Termine auf Zuruf ein, erinnert Sie rechtzeitig und bereitet Tages-Agenden vor.",
    spokenText:
      "Der Google Calendar und Chronos Terminplaner verwaltet Termine, Meetings und Deadlines vollautomatisch im Hintergrund.",
    actionTip: "Sprachbefehl: 'Plane morgen um 14 Uhr ein Strategie-Meeting mit dem Team ein'.",
    iconName: "calendar",
    glowColor: "amber",
  },
  {
    id: "app-store",
    targetId: "#tour-app-store",
    fallbackSelector: "#tour-nav-rail",
    title: "20. APP STORE (SPRACHBEFEHL: 'ÖFFNE APP STORE')",
    badge: "QUANTUM TOOLKIT",
    category: "SYSTEM-ERWEITERUNGEN",
    description:
      "Das gelbe Blitz-Symbol in der linken Leiste öffnet den App Store. Hier finden Sie alle Integrationen: Google Calendar, Google Maps, Veo 3.1 Video Studio, Claude Code Terminal, PayPal, Stripe, Discord, Shopify und GitHub.",
    spokenText:
      "Das gelbe Blitz-Symbol links öffnet den App Store mit Google Calendar, Google Maps, Veo 3.1 Video Studio und allen weiteren Integrationen.",
    actionTip: "Sprachbefehl: 'Öffne App Store' oder 'Zeige Erweiterungen'.",
    iconName: "store",
    glowColor: "amber",
  },
  {
    id: "user-terminal-crypto",
    targetId: "#tour-quota-hud",
    fallbackSelector: "header",
    title: "21. USER ACCOUNT TERMINAL & KRYPTO (SPRACHBEFEHL: 'ÖFFNE USER TERMINAL')",
    badge: "ABO, INVOICES & 20% CRYPTO RABATT",
    category: "BENUTZER-VERWALTUNG & ZAHLUNGEN",
    description:
      "Im User Account Terminal verwalten Sie Ihr Abonnement (29 €/Monat für OPERATOR oder 99 €/Monat für SOVEREIGN). Bezahlen Sie flexibel per Kreditkarte, PayPal oder Crypto (Solana @ 67,12 €, Ethereum, Bitcoin) mit sofortigen 20% Krypto-Rabatt!",
    spokenText:
      "Im User Terminal verwalten Sie Ihr Abonnement, Rechnungen und erhalten 20 Prozent Rabatt bei Zahlung mit Solana, Ethereum oder Bitcoin.",
    actionTip: "Sprachbefehle: 'Öffne User Terminal', 'Zeige Rechnungen', 'Upgrade Plan mit Krypto'.",
    iconName: "zap",
    glowColor: "emerald",
  },
];

interface OneMinuteTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onToggleLang?: () => void;
  onStartScreenPerception?: () => void;
  onSendMessage?: (text: string) => void;
  onSelectAgent?: (agentId: string) => void;
  onSetCommunicationScope?: (scope: "SINGLE" | "THE_BIG_3" | "ALL" | "AGENT_SYNC") => void;
  onOpenGmail?: () => void;
  onOpenLayoutEditor?: () => void;
  onOpenAppStore?: () => void;
  onOpenClaudeCode?: () => void;
  onOpenVeoStudio?: () => void;
  onOpenGoogleMaps?: () => void;
  onToggleChat?: () => void;
  onOpenChat?: () => void;
  onOpenCalendar?: () => void;
  onOpenNanoBanana?: () => void;
  onOpenDailyUsage?: () => void;
  onOpenAgentInspector?: (agentId?: string) => void;
  onOpenDailyObjectives?: () => void;
  onOpenAgentFleetStudio?: () => void;
  onOpenVoiceConference?: (topic?: string) => void;
  onOpenUserTerminal?: (tab?: "overview" | "subscription" | "payment" | "invoices" | "security") => void;
}

export const OneMinuteTutorialModal: React.FC<OneMinuteTutorialModalProps> = ({
  isOpen,
  onClose,
  lang = "en",
  onToggleLang,
  onStartScreenPerception,
  onSendMessage,
  onSelectAgent,
  onSetCommunicationScope,
  onOpenGmail,
  onOpenLayoutEditor,
  onOpenAppStore,
  onOpenClaudeCode,
  onOpenVeoStudio,
  onOpenGoogleMaps,
  onToggleChat,
  onOpenChat,
  onOpenCalendar,
  onOpenNanoBanana,
  onOpenDailyUsage,
  onOpenAgentInspector,
  onOpenDailyObjectives,
  onOpenAgentFleetStudio,
  onOpenVoiceConference,
  onOpenUserTerminal,
}) => {
  const { isModern } = useTheme();
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isTourActive, setIsTourActive] = useState(true);
  const [isTourMinimized, setIsTourMinimized] = useState<boolean>(false);
  const [showAllStepPills, setShowAllStepPills] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    | "tour"
    | "voice_commands"
    | "queries"
    | "todays_usage"
    | "daily_objectives"
    | "all_hubs"
    | "all_agents"
    | "big3_vs_all"
    | "limits"
    | "nano_banana"
    | "chat"
    | "calendar"
    | "gmail"
    | "screenshare"
    | "layout"
    | "apps"
  >("tour");
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [selectedVoiceCategory, setSelectedVoiceCategory] = useState<string>("ALL");
  const [querySimPrompt, setQuerySimPrompt] = useState<string>("Analysiere Architektur und berechne Token-Kosten");
  const [isSimulatingQuery, setIsSimulatingQuery] = useState<boolean>(false);
  const [simQueryResult, setSimQueryResult] = useState<any>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [autoPlayTimer, setAutoPlayTimer] = useState<boolean>(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState<number>(0);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(false);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<AgentDetails>(SYSTEM_AGENTS[0]);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string>("");
  const [speechRate, setSpeechRate] = useState<number>(lang === "de" ? 0.90 : 0.94);
  const [activeSpeakerAgent, setActiveSpeakerAgent] = useState<string>("maze");

  // Interactive Live Token Simulator in Today's Usage tab
  const [sliderPromptTokens, setSliderPromptTokens] = useState<number>(1000);
  // Interactive Active Hub index for Hubs tab
  const [activeHubIndex, setActiveHubIndex] = useState<number>(0);

  // Interactive preview state for Fleet Delegation Matrix Card in tutorial
  const [previewThoughtOpen, setPreviewThoughtOpen] = useState<boolean>(true);
  const [previewDeepDiveOpen, setPreviewDeepDiveOpen] = useState<boolean>(false);
  const [previewCopied, setPreviewCopied] = useState<boolean>(false);

  const lastSpokenStepIndexRef = useRef<number | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const activeTourSteps = useMemo(() => {
    if (lang === "en") {
      return TOUR_STEPS.map((base, idx) => {
        const enStep = TOUR_STEPS_EN[idx];
        if (!enStep) return base;
        return {
          ...base,
          title: enStep.title,
          badge: enStep.badge,
          category: enStep.category,
          description: enStep.description,
          spokenText: enStep.spokenText,
          actionTip: enStep.actionTip,
        };
      });
    }
    return TOUR_STEPS;
  }, [lang]);

  const currentStep = useMemo(() => {
    return activeTourSteps[currentStepIndex] || activeTourSteps[0];
  }, [activeTourSteps, currentStepIndex]);

  // Predefined Full Briefing Audio Script (100% offline, zero API)
  const tutorialSpokenText = lang === "en" ? `
    S.Y.N.T.A.X. Master System Briefing:
    First: Agent control is located at the bottom in the Matrix Hub bar with quick keys S, N, V, O, P, C, R, and G.
    Second: Top left features The Big Three for high-speed synchronized Tri-Core processing with Syntax, Neo, and Vega.
    Third: With All Eight, you can activate the entire specialist fleet simultaneously.
    Fourth: Keep in mind that All Eight and The Big Three consume more tokens. Use Single Agent mode for everyday focused tasks.
    Fifth: Turn on Monitor Perception so our Vision AI can read and analyze your screens in real-time.
    Sixth: On the right side, toggle the live chat console for the currently active agent.
    Seventh: Use Chronos and Google Calendar for automated event scheduling.
    Eighth: Access the Gmail workspace module for instant email summaries and AI replies.
    Ninth: Use the Workspace Layout Editor to customize your modular VisionOS dashboard.
  `.trim() : `
    S.Y.N.T.A.X. System-Einweisung:
    Erstens: Die Agenten-Steuerung sitzt unten in der Matrix-Hub Leiste mit den Tasten S, N, V, O, P, C, R, G.
    Zweitens: Oben links finden Sie The Big Three für synchrones Tri-Core Arbeiten mit Syntax, Neo und Vega.
    Drittens: Mit All Acht sprechen Sie die gesamte Spezialisten-Flotte synchron an.
    Viertens wichtig: All Acht und The Big Three verbrauchen deutlich mehr Tokens. Nutzen Sie für normale Aufgaben die Einzel-Agenten.
    Fünftens: Schalten Sie die Monitor-Freigabe ein, damit die Vision AI Ihren Bildschirm live mitliest.
    Sechstens: Am rechten Rand öffnen und schließen Sie das Chatfenster für den aktiven Agenten.
    Siebtens: Nutzen Sie den Google Calendar und Chronos Terminplaner für automatisierte Termine.
    Achtens: Nutzen Sie das Gmail-Modul für smarte E-Mail Zusammenfassungen.
    Neuntens: Mit dem Layout-Editor passen Sie Ihr Vision-OS Dashboard modular an.
  `.trim();

  // Speak text helper (Local browser Web Speech API with smooth phonetic normalization and native agent voices)
  const speakText = useCallback((text: string, agentId: string = "maze") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();

      // Clean & phonetically normalize text for natural native German / English speech
      const cleanText = normalizeTextForSpeech(text, lang as "de" | "en");
      if (!cleanText) {
        setIsPlayingVoice(false);
        setCurrentSpeakingText("");
        return;
      }

      setCurrentSpeakingText(text);
      setActiveSpeakerAgent(agentId);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const isEn = lang === "en";
      utterance.lang = isEn ? "en-US" : "de-DE";
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      // Apply tailored accent-free agent voice profile
      applyAgentVoice(utterance, agentId, lang as "de" | "en");

      utterance.onend = () => {
        setIsPlayingVoice(false);
        setCurrentSpeakingText("");
      };
      utterance.onerror = () => {
        setIsPlayingVoice(false);
        setCurrentSpeakingText("");
      };

      setIsPlayingVoice(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingVoice(false);
      setCurrentSpeakingText("");
    }
  }, [lang, speechRate]);

  const stopVoice = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingVoice(false);
    setCurrentSpeakingText("");
  }, []);

  // Update Target Element Bounding Box for Spotlight
  const updateTargetRect = useCallback(() => {
    if (!isTourActive) return;
    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    let el = document.querySelector(step.targetId);
    if (!el && step.fallbackSelector) {
      el = document.querySelector(step.fallbackSelector);
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStepIndex]);

  // Reset or initialize on modal open/close
  useEffect(() => {
    if (isOpen) {
      setIsTourActive(true);
      setCurrentStepIndex(0);
      setAutoPlayProgress(0);
      lastSpokenStepIndexRef.current = null;
    } else {
      stopVoice();
      setIsTourActive(false);
      setCurrentStepIndex(0);
      setAutoPlayTimer(false);
      setAutoPlayProgress(0);
      lastSpokenStepIndexRef.current = null;
    }
  }, [isOpen, stopVoice]);

  // Position Spotlight ONCE per step index change
  useEffect(() => {
    if (!isTourActive || !isOpen) return;

    const timer = setTimeout(() => {
      updateTargetRect();
    }, 150);

    const handleReposition = () => updateTargetRect();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [
    isTourActive,
    isOpen,
    currentStepIndex,
    updateTargetRect,
  ]);

  // Play voice ONCE per step change if TTS is enabled
  useEffect(() => {
    if (!isTourActive || !isOpen || !ttsEnabled) {
      if (!ttsEnabled) {
        stopVoice();
      }
      return;
    }

    if (lastSpokenStepIndexRef.current !== currentStepIndex) {
      lastSpokenStepIndexRef.current = currentStepIndex;
      const step = activeTourSteps[currentStepIndex];
      if (step?.spokenText) {
        speakText(step.spokenText);
      }
    }
  }, [isTourActive, isOpen, currentStepIndex, ttsEnabled, speakText, stopVoice, activeTourSteps]);

  // Auto-play timer
  useEffect(() => {
    if (!isTourActive || !autoPlayTimer || !isOpen) return;

    const intervalMs = 100;
    const stepDurationMs = 7000;
    const increment = (intervalMs / stepDurationMs) * 100;

    const intervalId = setInterval(() => {
      setAutoPlayProgress((prev) => {
        if (prev >= 100) {
          if (currentStepIndex < activeTourSteps.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return 0;
          } else {
            setAutoPlayTimer(false);
            return 100;
          }
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isTourActive, autoPlayTimer, isOpen, currentStepIndex, activeTourSteps.length]);

  const handleNextStep = () => {
    setAutoPlayProgress(0);
    if (currentStepIndex < activeTourSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsTourActive(false);
      setActiveTab("all_agents");
    }
  };

  const handlePrevStep = () => {
    setAutoPlayProgress(0);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSelectStep = (idx: number) => {
    setAutoPlayProgress(0);
    setCurrentStepIndex(idx);
    setIsTourActive(true);
  };

  const handleToggleAutoPlay = () => {
    setAutoPlayTimer((prev) => !prev);
    setAutoPlayProgress(0);
  };

  const handleToggleVoiceOverview = () => {
    if (isPlayingVoice) {
      stopVoice();
    } else {
      speakText(tutorialSpokenText);
    }
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "grid":
        return <LayoutGrid className="w-4 h-4 text-cyan-400" />;
      case "shield":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "crown":
        return <Crown className="w-4 h-4 text-amber-300" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "users":
        return <Users className="w-4 h-4 text-cyan-400" />;
      case "mic":
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case "monitor":
      case "eye":
        return <Eye className="w-4 h-4 text-purple-400" />;
      case "mail":
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case "store":
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case "terminal":
        return <Terminal className="w-4 h-4 text-purple-400" />;
      case "video":
        return <Video className="w-4 h-4 text-pink-400" />;
      case "map":
        return <MapPin className="w-4 h-4 text-emerald-400" />;
      case "sliders":
        return <Sliders className="w-4 h-4 text-emerald-400" />;
      case "chat":
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case "calendar":
        return <CalendarDays className="w-4 h-4 text-amber-400" />;
      case "camera":
        return <Camera className="w-4 h-4 text-rose-400" />;
      case "wand":
        return <Wand2 className="w-4 h-4 text-pink-400" />;
      case "flame":
        return <Flame className="w-4 h-4 text-amber-400" />;
      case "coins":
        return <Coins className="w-4 h-4 text-amber-400" />;
      case "chart":
        return <BarChart3 className="w-4 h-4 text-cyan-400" />;
      case "layers":
      case "hub":
        return <Layers className="w-4 h-4 text-purple-400" />;
      case "help":
      default:
        return <HelpCircle className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getGlowStyles = (color: TourStep["glowColor"]) => {
    switch (color) {
      case "amber":
        return {
          border: "border-amber-400",
          shadow: "shadow-[0_0_35px_rgba(245,158,11,0.65),inset_0_0_20px_rgba(245,158,11,0.25)]",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/50",
          accentHex: "#f59e0b",
        };
      case "rose":
        return {
          border: "border-rose-400",
          shadow: "shadow-[0_0_35px_rgba(244,63,94,0.65),inset_0_0_20px_rgba(244,63,94,0.25)]",
          badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/50",
          accentHex: "#f43f5e",
        };
      case "purple":
        return {
          border: "border-purple-400",
          shadow: "shadow-[0_0_35px_rgba(168,85,247,0.65),inset_0_0_20px_rgba(168,85,247,0.25)]",
          badgeBg: "bg-purple-500/20 text-purple-300 border-purple-400/50",
          accentHex: "#a855f7",
        };
      case "emerald":
        return {
          border: "border-emerald-400",
          shadow: "shadow-[0_0_35px_rgba(16,185,129,0.65),inset_0_0_20px_rgba(16,185,129,0.25)]",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50",
          accentHex: "#10b981",
        };
      case "cyan":
      default:
        return {
          border: "border-cyan-400",
          shadow: "shadow-[0_0_35px_rgba(0,240,255,0.65),inset_0_0_20px_rgba(0,240,255,0.25)]",
          badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50",
          accentHex: "#00f0ff",
        };
    }
  };

  if (!isOpen) return null;

  // =========================================================================
  // 1. INTERACTIVE GUIDED TOUR SPOTLIGHT VIEW
  // =========================================================================
  if (isTourActive) {
    const glowConfig = getGlowStyles(currentStep.glowColor);

    // MINIMIZED FLOATING MINI-HUD BAR (Laptop-friendly & non-intrusive)
    if (isTourMinimized) {
      return (
        <div className="fixed inset-0 z-[99990] pointer-events-none select-none">
          {/* Subtle non-blocking spotlight if element visible */}
          {targetRect && (
            <div
              style={{
                position: "fixed",
                top: `${Math.max(0, targetRect.top - 4)}px`,
                left: `${Math.max(0, targetRect.left - 4)}px`,
                width: `${targetRect.width + 8}px`,
                height: `${targetRect.height + 8}px`,
                pointerEvents: "none",
                zIndex: 99995,
              }}
              className={`rounded-xl border-2 ${glowConfig.border} ${glowConfig.shadow} transition-all duration-300 animate-pulse`}
            />
          )}

          {/* Floating Mini Bottom Bar */}
          <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[99999] w-[95vw] max-w-2xl pointer-events-auto animate-fade-in">
            <div
              className={`p-2 sm:p-2.5 rounded-2xl border-2 backdrop-blur-2xl flex items-center justify-between gap-2 shadow-[0_0_35px_rgba(0,0,0,0.85)] transition-all ${
                isModern
                  ? "bg-zinc-950/95 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-zinc-100"
                  : "bg-slate-950/95 border-cyan-500/70 shadow-[0_0_35px_rgba(0,240,255,0.4)] text-slate-100"
              }`}
            >
              {/* Left Info: Icon & Step Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                    isModern
                      ? "bg-red-500/15 border-red-500/40 text-red-400"
                      : "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  }`}
                >
                  {getStepIcon(currentStep.iconName)}
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-wider">
                      SCHRITT {currentStepIndex + 1}/{activeTourSteps.length}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold truncate hidden sm:inline">
                      • {currentStep.badge}
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-mono font-bold text-white truncate mt-0.5 max-w-[180px] sm:max-w-[280px]">
                    {currentStep.title}
                  </div>
                </div>
              </div>

              {/* Center/Right Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={handlePrevStep}
                  className="p-1.5 rounded-lg border bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition"
                  title="Vorheriger Schritt"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleToggleAutoPlay}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition ${
                    autoPlayTimer
                      ? "bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                  title={autoPlayTimer ? "Auto-Play anhalten" : "Auto-Play Tour starten"}
                >
                  {autoPlayTimer ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  <span className="hidden sm:inline">{autoPlayTimer ? "AUTO" : "PLAY"}</span>
                </button>

                <button
                  onClick={() => {
                    if (isPlayingVoice) {
                      stopVoice();
                      setTtsEnabled(false);
                    } else {
                      setTtsEnabled(true);
                      speakText(currentStep.spokenText);
                    }
                  }}
                  className={`p-1.5 rounded-lg border cursor-pointer transition ${
                    isPlayingVoice
                      ? isModern ? "bg-purple-500/20 text-purple-300 border-purple-400" : "bg-cyan-500/30 text-cyan-300 border-cyan-400 animate-pulse"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                  title={isPlayingVoice ? "Audio stoppen" : "Vorlesen"}
                >
                  {isPlayingVoice ? <Volume2 className="w-3.5 h-3.5 text-cyan-300" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleNextStep}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer transition active:scale-95"
                  title="Nächster Schritt"
                >
                  <span>{currentStepIndex === activeTourSteps.length - 1 ? "ENDE" : "WEITER"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

                <button
                  onClick={() => setIsTourMinimized(false)}
                  className="p-1.5 rounded-lg border bg-slate-900 hover:bg-slate-800 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 cursor-pointer transition shadow-sm flex items-center gap-1 text-[10px] font-mono font-bold"
                  title="Tutorial-Karte vergrößern / Details anzeigen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">MAX</span>
                </button>

                <button
                  onClick={() => {
                    stopVoice();
                    setIsTourActive(false);
                    onClose();
                  }}
                  className="p-1.5 rounded-lg border bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-red-400 text-slate-400 hover:text-white cursor-pointer transition"
                  title="Tutorial beenden"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    let tooltipStyle: React.CSSProperties = {
      position: "fixed",
      zIndex: 99999,
    };

    if (targetRect) {
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;
      const isNarrow = window.innerWidth < 640;

      if (isNarrow) {
        tooltipStyle = {
          position: "fixed",
          bottom: "12px",
          left: "8px",
          right: "8px",
          zIndex: 99999,
        };
      } else if (spaceAbove >= 360) {
        tooltipStyle = {
          position: "fixed",
          bottom: `${Math.max(12, window.innerHeight - targetRect.top + 12)}px`,
          left: `${Math.max(12, Math.min(targetRect.left, window.innerWidth - 480))}px`,
          zIndex: 99999,
        };
      } else if (spaceBelow >= 360) {
        tooltipStyle = {
          position: "fixed",
          top: `${Math.min(targetRect.bottom + 12, window.innerHeight - 440)}px`,
          left: `${Math.max(12, Math.min(targetRect.left, window.innerWidth - 480))}px`,
          zIndex: 99999,
        };
      } else {
        tooltipStyle = {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
        };
      }
    } else {
      tooltipStyle = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 99999,
      };
    }

    return (
      <div className="fixed inset-0 z-[99990] pointer-events-auto select-none">
        <div
          onClick={() => setIsTourActive(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-[2px] transition-all duration-300"
        />

        {/* Live Spotlight Highlight on target */}
        {targetRect && (
          <div
            style={{
              position: "fixed",
              top: `${Math.max(0, targetRect.top - 6)}px`,
              left: `${Math.max(0, targetRect.left - 6)}px`,
              width: `${targetRect.width + 12}px`,
              height: `${targetRect.height + 12}px`,
              pointerEvents: "none",
              zIndex: 99995,
            }}
            className={`rounded-2xl border-2 ${glowConfig.border} ${glowConfig.shadow} transition-all duration-300`}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />

            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-cyan-400 text-cyan-300 font-mono text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.7)] animate-pulse whitespace-nowrap">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>LIVE SPOTLIGHT #{currentStepIndex + 1}: {currentStep.category}</span>
            </div>
          </div>
        )}

        {/* Tour Tooltip Card (Optimized for Laptops with Max-Height and Scrollability) */}
        <div
          style={tooltipStyle}
          className={`w-full max-w-[460px] max-h-[min(88vh,620px)] flex flex-col rounded-3xl p-4 sm:p-4.5 backdrop-blur-2xl font-sans animate-fade-in shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden ${
            isModern
              ? "bg-zinc-950/95 border-2 border-purple-500/50 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.2)] text-zinc-100"
              : "bg-slate-950/95 border-2 border-cyan-500/60 shadow-[0_0_50px_rgba(0,240,255,0.35)] text-slate-100"
          }`}
        >
          {/* Card Header Bar */}
          <div className={`flex items-center justify-between pb-2.5 border-b shrink-0 ${isModern ? "border-zinc-800" : "border-cyan-500/30"}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                isModern
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
              }`}>
                {getStepIcon(currentStep.iconName)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    isModern ? "bg-purple-500/10 text-purple-300 border-purple-500/30" : glowConfig.badgeBg
                  }`}>
                    SCHRITT {currentStepIndex + 1} VON {activeTourSteps.length}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold truncate">
                    {currentStep.badge}
                  </span>
                </div>
                <div className={`text-[10px] font-mono font-bold uppercase tracking-wider mt-0.5 truncate ${isModern ? "text-zinc-300" : "text-cyan-400/90"}`}>
                  {currentStep.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleToggleAutoPlay}
                className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer ${
                  autoPlayTimer
                    ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse"
                    : isModern ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white" : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                }`}
                title={autoPlayTimer ? "Auto-Play anhalten" : "Auto-Play Tour starten"}
              >
                {autoPlayTimer ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span className="hidden sm:inline">{autoPlayTimer ? "AUTO" : "PLAY"}</span>
              </button>

              <button
                onClick={() => {
                  if (isPlayingVoice) {
                    stopVoice();
                    setTtsEnabled(false);
                  } else {
                    setTtsEnabled(true);
                    speakText(currentStep.spokenText);
                  }
                }}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isPlayingVoice
                    ? isModern ? "bg-purple-500/20 text-purple-300 border-purple-400" : "bg-cyan-500/30 text-cyan-300 border-cyan-400"
                    : isModern ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white" : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                }`}
                title={isPlayingVoice ? "Sprachausgabe stoppen" : "Schritt vorlesen"}
              >
                {isPlayingVoice ? <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-300" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* MINIMIZE BUTTON FOR LAPTOPS */}
              <button
                onClick={() => setIsTourMinimized(true)}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isModern
                    ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700"
                    : "bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border-slate-700 hover:border-cyan-400"
                }`}
                title="Minimieren (Auf schlanke Leiste am unteren Bildschirmrand verkleinern)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isModern
                    ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:border-cyan-400"
                }`}
                title="Tour beenden"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {autoPlayTimer && (
            <div className="w-full bg-slate-900 h-1 overflow-hidden border-b border-slate-800 shrink-0">
              <div
                className="h-full bg-amber-400 transition-all duration-100 ease-linear shadow-[0_0_8px_#f59e0b]"
                style={{ width: `${autoPlayProgress}%` }}
              />
            </div>
          )}

          {/* Scrollable Content Container (Prevents Overflow on Laptops) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2.5 pr-1 space-y-2.5 my-0.5">
            <h3 className="text-xs sm:text-sm font-extrabold font-mono text-white tracking-wide flex items-center justify-between">
              <span>{currentStep.title}</span>
              {isPlayingVoice && (
                <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 uppercase tracking-widest flex items-center gap-1 shrink-0 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>AUDIO</span>
                </span>
              )}
            </h3>

            {/* Compact Audio Bar */}
            <div
              className={`p-2 rounded-xl border transition-all duration-300 ${
                isPlayingVoice
                  ? "bg-slate-950/95 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center border text-xs font-mono font-black shrink-0"
                    style={{
                      borderColor: glowConfig.accentHex,
                      backgroundColor: `${glowConfig.accentHex}20`,
                      color: glowConfig.accentHex,
                    }}
                  >
                    <Volume2 className={`w-3 h-3 ${isPlayingVoice ? "animate-pulse" : "opacity-60"}`} />
                  </div>

                  <div className="min-w-0">
                    <div
                      className="text-[9px] font-mono font-black tracking-wider uppercase truncate"
                      style={{ color: glowConfig.accentHex }}
                    >
                      {isPlayingVoice
                        ? (lang === "en" ? "🎙️ S.Y.N.T.A.X. VOICE AGENT" : "🎙️ S.Y.N.T.A.X. SPRACHAUSGABE")
                        : (lang === "en" ? "AUDIO BRIEFING" : "AUDIO-EINWEISUNG (DEUTSCH)")}
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-400 truncate">
                      {isPlayingVoice
                        ? (lang === "en" ? "Articulate Neural Voice Stream" : "Natürliche deutsche Aussprache • 0.9x Speed")
                        : (lang === "en" ? "Click 'Play' for narration" : "Klick auf Lautsprecher für Sprachausgabe")}
                    </div>
                  </div>
                </div>

                {/* Animated Equalizer */}
                <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-black/80 border border-white/10 shrink-0">
                  {[10, 18, 14, 22, 16, 24, 18, 12].map((height, idx) => (
                    <span
                      key={idx}
                      className="w-0.5 rounded-full transition-all duration-150"
                      style={{
                        height: isPlayingVoice ? `${height}px` : "3px",
                        backgroundColor: isPlayingVoice ? glowConfig.accentHex : "#475569",
                        animation: isPlayingVoice
                          ? `pulse 0.75s ease-in-out infinite alternate ${idx * 0.08}s`
                          : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Teleprompter when speaking */}
              {isPlayingVoice && (
                <div className="mt-1.5 pt-1.5 border-t border-cyan-500/20 flex items-start gap-1.5 text-[10.5px] font-mono text-cyan-200 bg-cyan-950/40 p-1.5 rounded-lg">
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5 animate-spin" />
                  <span className="leading-snug">
                    "{currentSpeakingText || currentStep.spokenText}"
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
              {currentStep.description}
            </p>

            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[10.5px] font-mono text-cyan-200 flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{currentStep.actionTip}</span>
            </div>

            {/* Quick Interactive Switcher Actions */}
            {currentStep.id === "agent-switching" && onSelectAgent && (
              <div className="pt-0.5 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[9.5px] font-mono text-slate-400 font-bold shrink-0">DIREKT TESTEN:</span>
                {SYSTEM_AGENTS.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => onSelectAgent(ag.id)}
                    style={{ borderColor: `${ag.color}80` }}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[9.5px] font-mono font-bold text-white border transition cursor-pointer flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ag.color }} />
                    <span>{ag.short[0]}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === "the-big-3" && onSetCommunicationScope && (
              <button
                onClick={() => {
                  onSetCommunicationScope("THE_BIG_3");
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-[0.98]"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950" />
                <span>👑 'THE BIG 3' TRI-CORE STARTEN</span>
              </button>
            )}

            {currentStep.id === "all-8-overview" && onSetCommunicationScope && (
              <button
                onClick={() => {
                  onSetCommunicationScope("ALL");
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-[0.98]"
              >
                <Shield className="w-3.5 h-3.5 text-slate-950" />
                <span>🌐 ALLE 8 CORES AKTIVIEREN</span>
              </button>
            )}

            {currentStep.id === "screen-perception" && onStartScreenPerception && (
              <button
                onClick={() => {
                  onStartScreenPerception();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-[0.98]"
              >
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>🖥️ MONITOR FREIGABE STARTEN</span>
              </button>
            )}

            {currentStep.id === "terminal-code" && onOpenClaudeCode && (
              <button
                onClick={() => {
                  onOpenClaudeCode();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.6)] active:scale-[0.98]"
              >
                <Terminal className="w-3.5 h-3.5 text-purple-200" />
                <span>💻 CLAUDE CODE CLI ÖFFNEN</span>
              </button>
            )}

            {currentStep.id === "veo3-studio" && onOpenVeoStudio && (
              <button
                onClick={() => {
                  onOpenVeoStudio();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.6)] active:scale-[0.98]"
              >
                <Video className="w-3.5 h-3.5 text-pink-200" />
                <span>🎬 GOOGLE VEO 3.1 8K STUDIO ÖFFNEN</span>
              </button>
            )}

            {currentStep.id === "google-maps" && onOpenGoogleMaps && (
              <button
                onClick={() => {
                  onOpenGoogleMaps();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.6)] active:scale-[0.98]"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-950" />
                <span>🗺️ GOOGLE MAPS GPS-RADAR ÖFFNEN</span>
              </button>
            )}

            {currentStep.id === "gmail-assistant" && onOpenGmail && (
              <button
                onClick={() => {
                  onOpenGmail();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-[0.98]"
              >
                <Mail className="w-3.5 h-3.5 text-slate-950" />
                <span>✉️ GMAIL TERMINAL ÖFFNEN</span>
              </button>
            )}

            {currentStep.id === "agent-chat-toggle" && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onOpenChat ? onOpenChat() : onToggleChat?.();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.5)] active:scale-[0.98]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                  <span>💬 CHAT JETZT ÖFFNEN</span>
                </button>
                {onToggleChat && (
                  <button
                    onClick={() => {
                      onToggleChat();
                    }}
                    className="px-3 py-2 rounded-xl border border-cyan-400/60 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-[10.5px] font-mono font-black uppercase tracking-wider transition cursor-pointer"
                    title="Chat ein- oder ausblenden"
                  >
                    TOGGLE
                  </button>
                )}
              </div>
            )}

            {currentStep.id === "calendar-integration" && (
              <button
                onClick={() => {
                  onOpenCalendar ? onOpenCalendar() : onOpenChat?.();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-[0.98]"
              >
                <CalendarDays className="w-3.5 h-3.5 text-slate-950" />
                <span>📅 GOOGLE KALENDER & CHRONOS ÖFFNEN</span>
              </button>
            )}

            {currentStep.id === "visionos-layout" && onOpenLayoutEditor && (
              <button
                onClick={() => {
                  onOpenLayoutEditor();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.5)] active:scale-[0.98]"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-slate-950" />
                <span>🪟 LAYOUT-ANPASSUNG ÖFFNEN</span>
              </button>
            )}

            {currentStep.id === "nano-banana" && onOpenNanoBanana && (
              <button
                onClick={() => {
                  onOpenNanoBanana();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-[0.98]"
              >
                <Camera className="w-3.5 h-3.5 text-slate-950" />
                <span>🍌 NANO BANANA FOTO CREATOR ÖFFNEN</span>
              </button>
            )}

            {currentStep.id === "app-store" && onOpenAppStore && (
              <button
                onClick={() => {
                  onOpenAppStore();
                  stopVoice();
                  setIsTourActive(false);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-[11px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-[0.98]"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
                <span>🛒 APP STORE ÖFFNEN</span>
              </button>
            )}
          </div>

          {/* Compact Feature Step Selector Bar */}
          <div className="pt-2 border-t border-slate-800/80 shrink-0 space-y-1.5">
            <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400">
              <button
                onClick={() => setShowAllStepPills(!showAllStepPills)}
                className="font-bold text-cyan-300 hover:text-cyan-200 transition cursor-pointer flex items-center gap-1"
              >
                <span>{lang === "en" ? "DIRECT STEPS (22)" : "SCHRITTE (22)"}</span>
                {showAllStepPills ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTourMinimized(true)}
                  className="text-amber-300 hover:text-amber-200 transition cursor-pointer flex items-center gap-1 underline underline-offset-2"
                  title="Auf schmale Bottom-Bar für Laptops verkleinern"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>Kompaktleiste</span>
                </button>

                <button
                  onClick={() => {
                    setIsTourActive(false);
                    setActiveTab("all_agents");
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition cursor-pointer flex items-center gap-1 underline underline-offset-2"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{lang === "en" ? "Lexicon" : "Lexikon"}</span>
                </button>
              </div>
            </div>

            {/* If toggled, show full scrollable grid; otherwise show single compact scrollable strip */}
            {showAllStepPills ? (
              <div className="flex flex-wrap items-center gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 rounded-xl bg-slate-900/60 border border-slate-800">
                {activeTourSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => handleSelectStep(idx)}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_#00f0ff] font-black scale-105"
                        : idx < currentStepIndex
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                    }`}
                    title={step.title}
                  >
                    #{idx + 1} {step.id.replace("-", " ").slice(0, 12).toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                {activeTourSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => handleSelectStep(idx)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold shrink-0 transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_#00f0ff] font-black"
                        : idx < currentStepIndex
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200"
                    }`}
                    title={step.title}
                  >
                    #{idx + 1} {step.badge.split("&")[0].trim()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrevStep}
              className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                currentStepIndex === 0
                  ? "opacity-30 border-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{t.back || "ZURÜCK"}</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{currentStepIndex === activeTourSteps.length - 1 ? (lang === "en" ? "✓ FINISH & OPEN" : "✓ TOUR BEENDEN") : (t.next || "NÄCHSTES FEATURE")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. DETAILED FULL SYSTEM GUIDE & MASTER COMPENDIUM MODAL
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className={`absolute w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none -z-10 ${isModern ? "bg-purple-500/5" : "bg-cyan-500/10"}`} />

      <div className={`relative w-full max-w-5xl border-2 rounded-3xl overflow-hidden flex flex-col max-h-[95vh] ${
        isModern
          ? "bg-zinc-950/95 border-zinc-700/80 text-zinc-100 shadow-[0_0_60px_rgba(0,0,0,0.85)]"
          : "bg-gradient-to-b from-slate-950 via-[#030714] to-[#01040a] border-cyan-500/50 text-slate-100 shadow-[0_0_60px_rgba(0,240,255,0.25)]"
      }`}>
        {/* Header Bar */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between backdrop-blur-md ${
          isModern ? "bg-zinc-900/90 border-zinc-800" : "bg-slate-900/60 border-cyan-500/30"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              isModern
                ? "bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                : "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            }`}>
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[9.5px] uppercase font-black px-2 py-0.5 rounded border tracking-wider ${
                  isModern ? "bg-purple-500/10 text-purple-300 border-purple-500/30" : "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                }`}>
                  {lang === "en" ? "MASTER SYSTEM BRIEFING & FULL GUIDE" : "MASTER SYSTEM EINWEISUNG & FULL GUIDE"}
                </span>
                <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  THE BIG 3 + ALL 8 + NANO BANANA + GMAIL
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-mono tracking-wider mt-0.5">
                {lang === "en" ? "S.Y.N.T.A.X. OS • COMPLETE SYSTEM USER MANUAL" : "S.Y.N.T.A.X. OS • VOLLSTÄNDIGE SYSTEM-BEDIENUNGSANLEITUNG"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className={`px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isModern
                    ? "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    : "border-cyan-500/40 bg-slate-900/80 hover:bg-cyan-950/50 text-cyan-300"
                }`}
                title={lang === "en" ? "Switch language to German" : "Sprache auf Englisch umstellen"}
              >
                <Globe className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
                <span>{lang.toUpperCase()}</span>
              </button>
            )}

            <button
              onClick={handleToggleVoiceOverview}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md ${
                isPlayingVoice
                  ? "bg-purple-500/20 text-purple-300 border-purple-500 animate-pulse"
                  : isModern
                  ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700"
                  : "bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border-cyan-400/60"
              }`}
              title="Briefing vorlesen"
            >
              {isPlayingVoice ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlayingVoice ? (lang === "en" ? "STOP" : "STOPP") : "AUDIO"}</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isModern
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                  : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Extended Navigation Tabs */}
        <div className={`flex items-center gap-1 p-2 border-b text-xs font-mono overflow-x-auto ${
          isModern ? "bg-zinc-950 border-zinc-800" : "bg-slate-950/90 border-slate-800"
        }`}>
          <button
            onClick={() => setActiveTab("tour")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "tour"
                ? isModern
                  ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] font-black"
                  : "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{lang === "en" ? "INTERACTIVE TOUR" : "INTERAKTIVE TOUR"}</span>
          </button>

          <button
            onClick={() => setActiveTab("voice_commands")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "voice_commands"
                ? isModern
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)] font-black"
                  : "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] font-black"
                : isModern ? "text-zinc-400 hover:text-purple-300 hover:bg-zinc-900" : "text-slate-400 hover:text-red-300 hover:bg-slate-900"
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === "en" ? "🎙️ VOICE COMMANDS (LEXICON)" : "🎙️ SPRACHBEFEHLE (KOMPENDIUM)"}</span>
          </button>

          <button
            onClick={() => setActiveTab("queries")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "queries"
                ? isModern
                  ? "bg-zinc-100 text-zinc-950 shadow-md font-black"
                  : "bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.6)] font-black"
                : isModern ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900" : "text-slate-400 hover:text-cyan-300 hover:bg-slate-900"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            <span>{lang === "en" ? "📊 QUERIES & PROMPTS" : "📊 QUERIES & PROMPT-LOGS"}</span>
          </button>

          <button
            onClick={() => setActiveTab("todays_usage")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "todays_usage"
                ? isModern
                  ? "bg-amber-500 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black"
                  : "bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-amber-300 hover:bg-zinc-900" : "text-slate-400 hover:text-amber-300 hover:bg-slate-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === "en" ? "🔥 TOKEN-ÜBERSICHT & ANFRAGEN" : "🔥 TOKEN-ÜBERSICHT & ANFRAGEN"}</span>
          </button>

          <button
            onClick={() => setActiveTab("daily_objectives")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "daily_objectives"
                ? isModern
                  ? "bg-emerald-500 text-zinc-950 shadow-[0_0_12px_rgba(52,211,153,0.5)] font-black"
                  : "bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === "en" ? "🎯 DAILY OBJECTIVES & STREAKS" : "🎯 DAILY OBJECTIVES & STREAKS"}</span>
          </button>

          <button
            onClick={() => setActiveTab("all_hubs")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "all_hubs"
                ? isModern
                  ? "bg-zinc-200 text-zinc-900 shadow-md font-black"
                  : "bg-purple-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900" : "text-slate-400 hover:text-purple-300 hover:bg-slate-900"
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-purple-400"}`} />
            <span>{lang === "en" ? "🪐 4 SPATIAL HUBS" : "🪐 DIE 4 HUBS (SCHRITT FÜR SCHRITT)"}</span>
          </button>

          <button
            onClick={() => setActiveTab("all_agents")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "all_agents"
                ? isModern
                  ? "bg-zinc-100 text-zinc-950 shadow-md font-black"
                  : "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "ALL 8 AGENTS (LEXICON)" : "ALLE 8 AGENTEN (LEXIKON)"}</span>
          </button>

          <button
            onClick={() => setActiveTab("big3_vs_all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "big3_vs_all"
                ? isModern
                  ? "bg-amber-500 text-zinc-950 shadow-md font-black"
                  : "bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-amber-300 hover:bg-zinc-900" : "text-slate-400 hover:text-amber-300 hover:bg-slate-900"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>THE BIG 3 vs ALL 8</span>
          </button>

          <button
            onClick={() => setActiveTab("nano_banana")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "nano_banana"
                ? isModern
                  ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)] font-black"
                  : "bg-rose-500 text-slate-950 shadow-[0_0_12px_rgba(244,63,94,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-rose-300 hover:bg-zinc-900" : "text-slate-400 hover:text-rose-300 hover:bg-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-400" />
            <span>🍌 {lang === "en" ? "NANO BANANA STUDIO" : "NANO BANANA FOTO STUDIO"}</span>
          </button>

          <button
            onClick={() => setActiveTab("limits")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "limits"
                ? isModern
                  ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)] font-black"
                  : "bg-rose-500 text-slate-950 shadow-[0_0_12px_rgba(244,63,94,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-rose-300 hover:bg-zinc-900" : "text-slate-400 hover:text-rose-300 hover:bg-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === "en" ? "QUOTAS & LIMITS" : "QUOTEN & BEGRENZUNG"}</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "chat"
                ? isModern
                  ? "bg-purple-600 text-white shadow-md font-black"
                  : "bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-slate-400 hover:text-cyan-300 hover:bg-slate-900"
            }`}
          >
            <MessageSquare className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            <span>💬 {lang === "en" ? "OPEN CHAT" : "CHAT ÖFFNEN"}</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "calendar"
                ? isModern
                  ? "bg-amber-500 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black"
                  : "bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-amber-300 hover:bg-zinc-900" : "text-slate-400 hover:text-amber-300 hover:bg-slate-900"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            <span>📅 {lang === "en" ? "CALENDAR & CHRONOS" : "KALENDER & CHRONOS"}</span>
          </button>

          <button
            onClick={() => setActiveTab("gmail")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "gmail"
                ? isModern
                  ? "bg-emerald-500 text-zinc-950 shadow-[0_0_12px_rgba(168,85,247,0.5)] font-black"
                  : "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-900"
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>GMAIL CLIENT</span>
          </button>

          <button
            onClick={() => setActiveTab("screenshare")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "screenshare"
                ? isModern
                  ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-black"
                  : "bg-purple-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-purple-300 hover:bg-zinc-900" : "text-slate-400 hover:text-purple-300 hover:bg-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>SCREEN SHARE (VISION)</span>
          </button>

          <button
            onClick={() => setActiveTab("layout")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "layout"
                ? isModern
                  ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] font-black"
                  : "bg-blue-500 text-slate-950 shadow-[0_0_12px_rgba(59,130,246,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-blue-300 hover:bg-zinc-900" : "text-slate-400 hover:text-blue-300 hover:bg-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
            <span>VISIONOS LAYOUT</span>
          </button>

          <button
            onClick={() => setActiveTab("apps")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "apps"
                ? isModern
                  ? "bg-amber-500 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black"
                  : "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black"
                : isModern ? "text-zinc-400 hover:text-amber-300 hover:bg-zinc-900" : "text-slate-400 hover:text-amber-300 hover:bg-slate-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>APP STORE & TOOLS</span>
          </button>
        </div>

        {/* Live Speech HUD banner in Full Guide */}
        {isPlayingVoice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-slate-950/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60 animate-ping" />
                <div className="relative w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black text-cyan-300 uppercase tracking-widest">
                    {lang === "en" ? "🎙️ S.Y.N.T.A.X. SYSTEM BRIEFING NARRATION" : "🎙️ S.Y.N.T.A.X. SYSTEM-EINWEISUNG (DEUTSCH)"}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {lang === "en" ? "ACTIVE" : "AKTIV"}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 line-clamp-1">
                  {currentSpeakingText || (lang === "en" ? "Master audio guide playing..." : "Vollständige Audio-Einweisung wird abgespielt...")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/80 border border-cyan-500/30">
                {[10, 20, 14, 26, 18, 30, 22, 16, 28, 12].map((height, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-cyan-400 rounded-full transition-all duration-150 animate-pulse"
                    style={{
                      height: `${height}px`,
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                ))}
              </div>
              <button
                onClick={stopVoice}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "STOP AUDIO" : "AUDIO STOPPEN"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm font-sans leading-relaxed flex-1">
          {/* TAB 1: TOUR OVERVIEW */}
          {activeTab === "tour" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/60 to-purple-950/80 border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-400 text-slate-950 shadow-[0_0_8px_#00f0ff] animate-pulse">
                      INTERAKTIVE GEFÜHRTE TOUR
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">
                      {activeTourSteps.length} SCHRITTE • LIVE SPOTLIGHT
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono tracking-wide">
                    Live-Spotlight auf Today's Usage, Hubs, Matrix & Vision
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-normal font-sans">
                    Lernen Sie direkt im Interface, wie Sie den passenden Agenten anwählen, wo die Tri-Core Matrix sitzt, wie Sie Gmail steuern und Token-Quoten effizient nutzen.
                  </p>
                </div>

                <button
                  onClick={() => handleSelectStep(0)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(0,240,255,0.6)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>TOUR STARTEN (60s)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {TOUR_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => handleSelectStep(idx)}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/60 hover:bg-slate-800/90 transition text-left flex flex-col justify-between group cursor-pointer shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition">
                          {getStepIcon(step.iconName)}
                        </div>
                        <span className="text-[8.5px] font-mono text-slate-400 group-hover:text-cyan-300 font-bold uppercase">
                          #{idx + 1}
                        </span>
                      </div>
                      <h4 className="text-[11.5px] font-bold text-white font-mono uppercase mb-0.5 line-clamp-1 group-hover:text-cyan-200">
                        {step.title.replace(/^\d+\.\s*/, "")}
                      </h4>
                      <p className="text-[10.5px] text-slate-400 leading-normal line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-cyan-400">
                      <span>{step.badge}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: VOICE COMMANDS KOMPENDIUM (ALLE SPRACHBEFEHLE ERKLÄRT) */}
          {activeTab === "voice_commands" && (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-rose-950/80 border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500 text-white shadow-[0_0_8px_#ef4444] animate-pulse">
                      🎙️ SPRACHBEFEHLE-KOMPENDIUM & AUDIO-GUIDE
                    </span>
                    <span className="text-[10px] font-mono text-red-300 font-bold">
                      NATÜRLICHE DEUTSCHE & ENGLISCHE SPRACHE
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
                    <Mic className="w-5 h-5 text-red-400" />
                    WIE FUNKTIONIERT DIE SPRACHSTEUERUNG IM S.Y.N.T.A.X. ECOSYSTEM?
                  </h3>
                  <p className="text-xs text-slate-300 max-w-3xl leading-normal">
                    Steuern Sie das gesamte System freihändig! Ob das Öffnen von <strong>QUERIES</strong>, das Abrufen Ihrer <strong>TAGESZIELE</strong>, Karten-Projektionen, Gmail, 8K-Videos oder Flotten-Swarm – jeder Befehl wird phonetisch analysiert und sofort ausgeführt.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => speakText("Hier ist das vollständige Sprachbefehle-Lexikon, Boss. Klicken Sie auf Probe anhören bei jedem Befehl, um die genaue Aussprache zu hören, oder führen Sie den Befehl direkt mit einem Klick aus.", "maze")}
                    className="px-4 py-2.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Volume2 className="w-4 h-4 text-red-400" />
                    <span>AUDIO-EINLEITUNG</span>
                  </button>
                </div>
              </div>

              {/* 4 Steps: How Voice Recognition Works */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-red-500/30 shadow-xl space-y-3">
                <h4 className="text-xs font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  DIE 4 SCHRITTE ZUR SPRACHSTEUERUNG (SO EINFACH GEHT'S)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-300 font-mono font-black text-xs">
                      01
                    </div>
                    <div className="text-xs font-bold font-mono text-white">1. MIKROFON AKTIVIEREN</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Klicken Sie auf die rote Mikrofon-Pill in der Top Command Bar oder drücken Sie einfach die <strong>Leertaste</strong> (Push-to-Talk).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono font-black text-xs">
                      02
                    </div>
                    <div className="text-xs font-bold font-mono text-white">2. BEFEHL SPRECHEN</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sprechen Sie klar und natürlich, z. B. <em>"Öffne Queries"</em>, <em>"Zeige Tagesziele"</em> oder <em>"Zeige mir eine Karte von Berlin"</em>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-black text-xs">
                      03
                    </div>
                    <div className="text-xs font-bold font-mono text-white">3. INTENT ENGINE ERKENNT</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Die neuronale Intent Engine matcht Ihre Phrase in <strong>unter 100 Millisekunden</strong> und öffnet das passende Fenster verzögerungsfrei.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-mono font-black text-xs">
                      04
                    </div>
                    <div className="text-xs font-bold font-mono text-white">4. SPRACHANTWORT DES CORES</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Der zuständige Spezial-Core antwortet Ihnen sofort mit seiner individuellen Stimme (DE/EN) ohne störenden Akzent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter and Search Bar for Commands */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={voiceSearchQuery}
                    onChange={(e) => setVoiceSearchQuery(e.target.value)}
                    placeholder="Befehl suchen (z. B. Queries, Tagesziele, Maps, Veo)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 font-mono text-[10.5px]">
                  {["ALL", "QUERIES", "TAGESZIELE", "KALENDER", "MAPS", "GMAIL", "VEO", "NANO BANANA", "FLEET & CORES", "TERMINAL", "ADMIN & SYSTEM"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedVoiceCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition ${
                        selectedVoiceCategory === cat
                          ? "bg-red-500 text-white shadow-md"
                          : isModern ? "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800" : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Command Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    category: "QUERIES",
                    title: "QUERIES & PROMPTS INSPECTOR",
                    badge: "NEU • TELEMETRIE",
                    color: "cyan",
                    phrases: ["Öffne Queries", "Zeige Prompts", "Agenten Logs öffnen", "Latenz & Tokens prüfen"],
                    description: "Öffnet das vollständige Prompt- & Latenz-Dashboard aller Cores inklusive Token-Verbrauch und Chain of Thought.",
                    agent: "SYNTAX",
                    voiceSpeaker: "maze",
                    action: () => {
                      if (onOpenAgentInspector) {
                        onOpenAgentInspector();
                        onClose();
                      } else {
                        speakText("Queries Inspector wird geöffnet, Boss. Alle Prompts und Latenzen stehen bereit.", "maze");
                      }
                    },
                  },
                  {
                    category: "TAGESZIELE",
                    title: "DAILY OBJECTIVES & STREAKS",
                    badge: "NEU • PRODUKTIVITÄT",
                    color: "emerald",
                    phrases: ["Zeige Tagesziele", "Was sind meine Missionen heute?", "Status Tagesstreak", "Tagesziele vorlesen"],
                    description: "Zeigt Ihre 4 täglichen Missionen, den aktuellen Streak-Status und schüttet bei Erfüllung bis zu +50.000 Bonus-Tokens aus.",
                    agent: "SYNTAX",
                    voiceSpeaker: "maze",
                    action: () => {
                      if (onOpenDailyObjectives) {
                        onOpenDailyObjectives();
                        onClose();
                      } else {
                        setActiveTab("daily_objectives");
                        speakText("Hier sind Ihre heutigen 4 Missionen, Boss. Drei von vier Zielen sind bereits abgeschlossen.", "maze");
                      }
                    },
                  },
                  {
                    category: "KALENDER",
                    title: "CHRONOS KALENDER & TERMINE",
                    badge: "TERMINE & SYNC",
                    color: "amber",
                    phrases: ["Zeige Kalender", "Öffne Chronos", "Welche Termine habe ich heute?", "Erstelle Kalendertermin"],
                    description: "Öffnet das interaktive Chronos-Kalenderwidget zur Verwaltung Ihrer Tagestermine, Meetings und synchronisierten Google Calendar Events.",
                    agent: "CHRONOS",
                    voiceSpeaker: "chronos",
                    action: () => {
                      if (onOpenCalendar) {
                        onOpenCalendar();
                        onClose();
                      } else {
                        setActiveTab("calendar");
                        speakText("Chronos Kalender geöffnet. Ihre heutigen Termine stehen bereit.", "chronos");
                      }
                    },
                  },
                  {
                    category: "ADMIN & SYSTEM",
                    title: "ADMIN-DATENBANK & SYSTEMVERWALTUNG",
                    badge: "ADMINISTRATION",
                    color: "rose",
                    phrases: ["Öffne Admin-Datenbank", "Zeige Benutzerverwaltung", "Prüfe System-Logs", "Admin Dashboard öffnen"],
                    description: "Ermöglicht Administratoren die Einsicht in Cloud-Datenbanken, Benutzerkonten, System-Audit-Logs und globale Sicherheitsparameter.",
                    agent: "SYNTAX",
                    voiceSpeaker: "maze",
                    action: () => {
                      if (onOpenUserTerminal) {
                        onOpenUserTerminal("overview");
                        onClose();
                      } else {
                        speakText("Admin-Datenbank wird aufgerufen. Authentifizierung verifiziert.", "maze");
                      }
                    },
                  },
                  {
                    category: "ADMIN & SYSTEM",
                    title: "MODERN DESIGN & THEME SWITCH",
                    badge: "BENUTZEROBERFLÄCHE",
                    color: "purple",
                    phrases: ["Schalte auf Modernes Design", "Modern Theme aktivieren", "Cyberpunk Design aktivieren", "Design wechseln"],
                    description: "Wechselt fließend zwischen dem minimalistischen Anthrazit/Zinc-950 Modern Design und dem leuchtenden Neon-Cyberpunk-Look.",
                    agent: "SYNTAX",
                    voiceSpeaker: "maze",
                    action: () => {
                      speakText("Design-Umschaltung erfolgt. Die Benutzeroberfläche passt sich sofort an.", "maze");
                    },
                  },
                  {
                    category: "FLEET & CORES",
                    title: "AGENT FLEET STUDIO // 9-CORE MATRIX",
                    badge: "NEU • FLOTTE",
                    color: "purple",
                    phrases: ["Öffne Fleet Studio", "Zeige alle 9 Cores", "Starte Flotten-Test", "Multi-Core Benchmark"],
                    description: "Öffnet das interaktive Flotten-Kommandozentrum für Multi-Core Benchmarks, Simultan-Tests und Konsens-Synthesen.",
                    agent: "NEO",
                    voiceSpeaker: "echo",
                    action: () => {
                      if (onOpenAgentFleetStudio) {
                        onOpenAgentFleetStudio();
                        onClose();
                      } else {
                        speakText("Agent Fleet Studio wird initialisiert. Alle 9 Cores sind online und synchronisiert.", "echo");
                      }
                    },
                  },
                  {
                    category: "FLEET & CORES",
                    title: "8-CORE LIVE SPRACHKONFERENZ",
                    badge: "NEU • AUDIO ROUNDTABLE",
                    color: "cyan",
                    phrases: ["Starte Sprachkonferenz", "Live Konferenz beginnen", "Diskutiert über Skalierungsstrategie"],
                    description: "Schaltet alle 8 Spezial-Cores in einen synchronen Audio-Roundtable, bei dem die KIs mit echten Stimmen miteinander debattieren.",
                    agent: "SYNTAX",
                    voiceSpeaker: "maze",
                    action: () => {
                      if (onOpenVoiceConference) {
                        onOpenVoiceConference("System Skalierung & Architektur");
                        onClose();
                      } else {
                        speakText("Sprachkonferenz wird gestartet. Alle 8 Spezialisten schalten sich auf den Audio-Kanal.", "maze");
                      }
                    },
                  },
                  {
                    category: "MAPS",
                    title: "GOOGLE MAPS & SATELLITEN-RADAR",
                    badge: "VOICE PROJEKTION",
                    color: "emerald",
                    phrases: ["Zeige mir eine Karte von Berlin", "Projektiere Karte von Tokio aufs Display", "Route von Frankfurt nach Paris", "Schließe Karte"],
                    description: "Öffnet Google Maps nur bei gezielter Anfrage. Zeigt Routen, 3D Satelliten-Ansichten und POIs ohne Fehltrigger.",
                    agent: "GRAVITON",
                    voiceSpeaker: "gravity",
                    action: () => {
                      if (onOpenGoogleMaps) {
                        onOpenGoogleMaps();
                        onClose();
                      } else {
                        speakText("Google Maps wird projiziert. Satelliten-Radar auf Berlin zentriert.", "gravity");
                      }
                    },
                  },
                  {
                    category: "GMAIL",
                    title: "GMAIL CLIENT & POSTEINGANG",
                    badge: "E-MAIL SYNC",
                    color: "emerald",
                    phrases: ["Zeige meine neuesten Mails", "Lies Posteingang vor", "Antworte auf letzte Mail", "Prüfe E-Mail Status"],
                    description: "Ruft Ihre ungelesenen E-Mails ab, liest Zusammenfassungen vor und öffnet bei fehlender OAuth-Verknüpfung das Login.",
                    agent: "CHRONOS",
                    voiceSpeaker: "chronos",
                    action: () => {
                      if (onOpenGmail) {
                        onOpenGmail();
                        onClose();
                      } else {
                        speakText("Gmail Posteingang wird abgerufen. Drei neue wichtige Nachrichten liegen vor.", "chronos");
                      }
                    },
                  },
                  {
                    category: "VEO",
                    title: "GOOGLE VEO 3.1 8K VIDEO STUDIO",
                    badge: "CINEMATIC 8K",
                    color: "rose",
                    phrases: ["Öffne Veo Studio", "Generiere ein Video von einem Sportwagen", "Starte 8K Video Animation"],
                    description: "Generiert kinoreife 8K KI-Videos aus Text-Prompts oder transformiert 3D Hologramme in bewegte Clips.",
                    agent: "VEGA",
                    voiceSpeaker: "nova",
                    action: () => {
                      if (onOpenVeoStudio) {
                        onOpenVeoStudio();
                        onClose();
                      } else {
                        speakText("Google Veo 3.1 Studio ist einsatzbereit für Ihre 8K Video-Generierung.", "nova");
                      }
                    },
                  },
                  {
                    category: "NANO BANANA",
                    title: "NANO BANANA FOTO-EDITOR & IMAGEN 3.0",
                    badge: "4K FOTO STUDIO",
                    color: "rose",
                    phrases: ["Erstelle ein Bild von einer Cyberpunk City", "Nano Banana starten", "Generiere 4K Hologramm"],
                    description: "Erstellt fotorealistische 4K-Bilder, Inpainting, Retusche und Hologramm-Projektionen mit der Imagen 3.0 Engine.",
                    agent: "NEO",
                    voiceSpeaker: "echo",
                    action: () => {
                      if (onOpenNanoBanana) {
                        onOpenNanoBanana();
                        onClose();
                      } else {
                        speakText("Nano Banana Foto-Studio wird gestartet. Imagen 3.0 Engine geladen.", "echo");
                      }
                    },
                  },
                  {
                    category: "TERMINAL",
                    title: "CLAUDE CODE & TURBO RECHENLEISTUNG",
                    badge: "CLI & RECHENLEISTUNG",
                    color: "purple",
                    phrases: ["Öffne Terminal", "Schalte Rechenleistung auf Turbo", "Rechenleistung auf Eco", "Rechenleistung auf Balanced"],
                    description: "Öffnet die Claude Code CLI und steuert die Rechenleistung und Antworttiefe der Agenten zwischen ECO, BALANCED und TURBO.",
                    agent: "SYNTAX",
                    voiceSpeaker: "maze",
                    action: () => {
                      if (onOpenClaudeCode) {
                        onOpenClaudeCode();
                        onClose();
                      } else {
                        speakText("Claude Code Terminal geöffnet. Rechenleistung steht auf TURBO.", "maze");
                      }
                    },
                  },
                  {
                    category: "FLEET & CORES",
                    title: "THE BIG 3 & ALL 8 SWARM SCHALTER",
                    badge: "SWARM SCOPE",
                    color: "amber",
                    phrases: ["Aktiviere The Big 3", "Aktiviere alle 8 Cores", "Schalte auf Einzel-Agent", "Agent-Sync Konsens aktivieren"],
                    description: "Wechselt sofort den Kommunikations-Scope oben in der Leiste zwischen 1x (SINGLE), 3x (BIG 3) und 8x (ALL 8).",
                    agent: "SYNTAX",
                    voiceSpeaker: "maze",
                    action: () => {
                      if (onSetCommunicationScope) {
                        onSetCommunicationScope("THE_BIG_3");
                        onClose();
                      } else {
                        speakText("The Big 3 aktiviert: SYNTAX, NEO und VEGA analysieren ab sofort synchron.", "maze");
                      }
                    },
                  },
                ]
                  .filter((item) => {
                    if (selectedVoiceCategory !== "ALL" && item.category !== selectedVoiceCategory) return false;
                    if (!voiceSearchQuery.trim()) return true;
                    const q = voiceSearchQuery.toLowerCase();
                    return (
                      item.title.toLowerCase().includes(q) ||
                      item.description.toLowerCase().includes(q) ||
                      item.phrases.some((p) => p.toLowerCase().includes(q))
                    );
                  })
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-red-500/50 transition shadow-lg flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            {item.badge}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <span>Core:</span>
                            <strong className="text-white">{item.agent}</strong>
                          </span>
                        </div>

                        <h4 className="text-xs font-black font-mono text-white tracking-wide flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-red-400" />
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>

                        {/* Trigger phrases */}
                        <div className="space-y-1 pt-1">
                          <div className="text-[9.5px] font-mono uppercase text-slate-400 font-bold">SPRECHEN SIE:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.phrases.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10.5px] font-mono text-red-300 font-bold"
                              >
                                "{p}"
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action & Audio Buttons */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => speakText(item.phrases[0], item.voiceSpeaker)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-400 text-slate-300 hover:text-white font-mono text-[10.5px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                          title="Aussprache anhören"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-red-400" />
                          <span>PROBE ANHÖREN</span>
                        </button>

                        <button
                          onClick={item.action}
                          className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-mono text-[10.5px] font-black transition flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                          title="Befehl direkt ausführen"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>JETZT TESTEN</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB: QUERIES & PROMPT-LOGS INSPECTOR */}
          {activeTab === "queries" && (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(0,240,255,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-400 text-slate-950 shadow-[0_0_8px_#22d3ee] animate-pulse">
                      📊 LIVE QUERIES & PROMPTS TELEMETRIE
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">
                      LATENZ • TOKENS • CHAIN OF THOUGHT • EXPORT
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    QUERIES & PROMPT-LOGS INSPECTOR (ERKLÄRUNG & LIVE RUNNER)
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-normal">
                    Der <strong>QUERIES Inspector</strong> bietet 100% Transparenz über jede einzelne KI-Berechnung: Input-Prompt, Antwort, Token-Aufwand, Millisekunden-Latenzen, Modell-Version (Gemini 2.5 Flash/Pro) und vollständige Gedankenkette.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenAgentInspector && (
                    <button
                      onClick={() => {
                        onOpenAgentInspector();
                        onClose();
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(0,240,255,0.5)] flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>ECHTEN INSPECTOR ÖFFNEN</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Core Capabilities of Queries */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-black text-xs">
                    ⚡
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    ECHTZEIT-LATENZ & PROMPT-ZEITEN
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Jede Anfrage wird mit genauer Millisekunden-Dauer (z. B. 240 ms) und Zeitstempel getrackt. Sie sehen sofort, welcher Spezial-Core am schnellsten antwortet.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono font-black text-xs">
                    💎
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    INPUT- & OUTPUT-TOKEN SPLIT
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Exakte Trennung zwischen gesendeten Prompt-Tokens und generierten Antwort-Tokens. So identifizieren Sie prompt-intensive Aufgaben im Handumdrehen.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-mono font-black text-xs">
                    📥
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    CSV & JSON LOG-EXPORT
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Exportieren Sie den gesamten Query-Verlauf für Audits, Teambesprechungen oder Archivierung mit einem Klick als strukturierte CSV- oder JSON-Datei.
                  </p>
                </div>
              </div>

              {/* Interactive Prompt Simulator & Telemetry Calculator */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-400/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-black font-mono text-cyan-300 uppercase tracking-wide flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      INTERAKTIVER QUERY SIMULATOR & TOKEN RECHNER
                    </h4>
                    <p className="text-xs text-slate-400">
                      Geben Sie einen Prompt ein oder wählen Sie ein Preset, um den Query Inspector live zu testen:
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={querySimPrompt}
                      onChange={(e) => setQuerySimPrompt(e.target.value)}
                      placeholder="Prompt eingeben (z. B. Berechne ROI und erstelle Architektur-Diagramm)..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <button
                      onClick={() => {
                        setIsSimulatingQuery(true);
                        setSimQueryResult(null);
                        setTimeout(() => {
                          setIsSimulatingQuery(false);
                          const inputTokens = Math.max(120, Math.round(querySimPrompt.length * 1.35));
                          const outputTokens = Math.round(inputTokens * 1.8 + 250);
                          setSimQueryResult({
                            reqId: "REQ-" + Math.floor(100000 + Math.random() * 900000),
                            latency: Math.floor(180 + Math.random() * 260) + " ms",
                            inputTokens,
                            outputTokens,
                            totalTokens: inputTokens + outputTokens,
                            model: "Gemini 2.5 Flash / Pro Turbo",
                            core: "💎 SYNTAX (Master Architect)",
                            status: "200 OK (Verified)",
                            summary: "Analyse erfolgreich generiert: 4 Teilsysteme identifiziert, Token-Optimierung abgeschlossen.",
                          });
                        }, 600);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0"
                    >
                      {isSimulatingQuery ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>SIMULIEREN</span>
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Skaliere React App auf 500k Daily Active Users",
                      "Erstelle Google Calendar Event für Morgen 14 Uhr",
                      "Analysiere Sicherheit & DDoS Schutz der API",
                      "Generiere Social Media Marketing Plan für Q3",
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuerySimPrompt(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-400/60 text-[10.5px] font-mono text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Result Card */}
                  {simQueryResult && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)] space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                            {simQueryResult.reqId}
                          </span>
                          <span className="text-white font-bold">{simQueryResult.core}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-emerald-400 font-bold">⚡ {simQueryResult.latency}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {simQueryResult.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] uppercase text-slate-400 font-bold">Input Tokens</div>
                          <div className="text-sm font-black text-cyan-300">{simQueryResult.inputTokens.toLocaleString()}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] uppercase text-slate-400 font-bold">Output Tokens</div>
                          <div className="text-sm font-black text-amber-300">{simQueryResult.outputTokens.toLocaleString()}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] uppercase text-slate-400 font-bold">Total Tokens</div>
                          <div className="text-sm font-black text-white">{simQueryResult.totalTokens.toLocaleString()}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-[9px] uppercase text-slate-400 font-bold">Neuronales Modell</div>
                          <div className="text-[10px] font-black text-purple-300 mt-1 truncate">{simQueryResult.model}</div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 font-mono">
                        <span className="text-cyan-400 font-bold">Ergebnis: </span>
                        {simQueryResult.summary}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TODAY'S USAGE & TOKEN-ERKLÄRUNG */}
          {activeTab === "todays_usage" && (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-[0_0_8px_#f59e0b] animate-pulse">
                      🔥 LIVE TELEMETRIE & TOKENS
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      24H AUTO-RESET • 00:00 UTC
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    TODAY'S USAGE & TOKEN-SYSTEM (SCHRITT FÜR SCHRITT)
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-normal">
                    Das 'Today's Usage' Widget in der oberen Leiste misst Ihren genauen Rechenaufwand in Echtzeit. Erfahren Sie hier, wie Input- und Output-Tokens berechnet werden und wie Sie Ihr Kontingent optimal nutzen.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenDailyUsage && (
                    <button
                      onClick={onOpenDailyUsage}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>DASHBOARD ÖFFNEN</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Token-Simulator & Multiplier Calculator */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-400/40 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black font-mono text-amber-300 uppercase tracking-wide flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      INTERAKTIVER TOKEN-SIMULATOR (PROMPT GRÖSSE VS. SCOPE)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Bewegen Sie den Schieberegler, um zu sehen, wie viele Tokens Ihre Anfrage in jedem Modus verbraucht:
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono font-bold text-xs">
                    Prompt Input: {sliderPromptTokens.toLocaleString()} Tokens
                  </div>
                </div>

                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={sliderPromptTokens}
                  onChange={(e) => setSliderPromptTokens(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {/* Single Agent */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-cyan-300 font-bold">👤 SINGLE AGENT</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">1x Multiplier</span>
                      </div>
                      <div className="text-lg font-black font-mono text-white">
                        {sliderPromptTokens.toLocaleString()} <span className="text-[10px] text-slate-400">Tokens</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        Ein einzelner Spezial-Core antwortet direkt. Maximal sparsam für 90% des Alltags.
                      </p>
                    </div>
                  </div>

                  {/* The Big 3 */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/40 flex flex-col justify-between shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-amber-300 font-bold">👑 THE BIG 3</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">3x Multiplier</span>
                      </div>
                      <div className="text-lg font-black font-mono text-amber-400">
                        {(sliderPromptTokens * 3).toLocaleString()} <span className="text-[10px] text-slate-400">Tokens</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        SYNTAX, NEO und VEGA berechnen synchron parallel für Spitzen-Architektur.
                      </p>
                    </div>
                  </div>

                  {/* All 8 Swarm */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-purple-300 font-bold">🌐 ALL (8) SWARM</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">8x Multiplier</span>
                      </div>
                      <div className="text-lg font-black font-mono text-purple-300">
                        {(sliderPromptTokens * 8).toLocaleString()} <span className="text-[10px] text-slate-400">Tokens</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        Alle 8 Cores arbeiten parallel. Volle Flottenstärke für holistische Großanalysen.
                      </p>
                    </div>
                  </div>

                  {/* Agent-Sync */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-emerald-300 font-bold">⚡ AGENT-SYNC</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">8x + Synthese</span>
                      </div>
                      <div className="text-lg font-black font-mono text-emerald-300">
                        {(sliderPromptTokens * 8 + 600).toLocaleString()} <span className="text-[10px] text-slate-400">Tokens</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        Flottendiskussion mit anschließender Konsens-Synthese durch den Master-Core.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Pillars of Token Accounting */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-black text-xs">
                    01
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    INPUT (PROMPT TOKENS)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Jedes Wort Ihrer Frage, der System-Prompt, hochgeladene Dateien und der Chatverlauf fließen als Input-Tokens in die Berechnung ein (1 Wort ≈ 1.3 Tokens).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono font-black text-xs">
                    02
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    OUTPUT (COMPLETION TOKENS)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Jede generierte Antwort, jede Zeile Code und jede strukturierte Tabelle. Output-Tokens erfordern intensive neuronale Rechenzeit der KI-Modelle.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-mono font-black text-xs">
                    03
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    24H REGENERATION & RESET
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ihr Tageskontingent regeneriert sich jeden Tag um exakt 00:00 Uhr UTC vollständig auf 100%. Sie starten jeden Morgen mit frischer voller Rechenkapazität.
                  </p>
                </div>
              </div>

              {/* Tier Quotas Table */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  TAGESKONTINGENTE NACH ABONNEMENT-STUFE
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                        <th className="py-2 px-3">TIER STUFE</th>
                        <th className="py-2 px-3">PREIS</th>
                        <th className="py-2 px-3">TAGES-TOKEN LIMIT</th>
                        <th className="py-2 px-3">SWARM MULTIPLIER</th>
                        <th className="py-2 px-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-400">⚡ Explorer / Trial</td>
                        <td className="py-2.5 px-3 text-slate-400">Kostenlos</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">25.000 / 24h</td>
                        <td className="py-2.5 px-3 text-slate-400">1x - 3x</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9.5px]">24h Test</span></td>
                      </tr>
                      <tr className="bg-cyan-950/20">
                        <td className="py-2.5 px-3 font-bold text-cyan-400">🚀 Operator Tier</td>
                        <td className="py-2.5 px-3 text-white font-bold">29 € / Monat</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">150.000 / 24h</td>
                        <td className="py-2.5 px-3 text-cyan-300">1x - 8x</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9.5px] font-bold">Aktiv</span></td>
                      </tr>
                      <tr className="bg-amber-950/20">
                        <td className="py-2.5 px-3 font-bold text-amber-400">👑 Sovereign Tier</td>
                        <td className="py-2.5 px-3 text-white font-bold">99 € / Monat</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">500.000 / 24h</td>
                        <td className="py-2.5 px-3 text-amber-300">Unbegrenzter Swarm</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9.5px] font-bold">Top Tier</span></td>
                      </tr>
                      <tr className="bg-emerald-950/20">
                        <td className="py-2.5 px-3 font-bold text-emerald-400">🔑 Eigener Gemini Key</td>
                        <td className="py-2.5 px-3 text-emerald-300">Direktabrechnung</td>
                        <td className="py-2.5 px-3 text-emerald-300 font-black">∞ UNBEGRENZT</td>
                        <td className="py-2.5 px-3 text-emerald-300">Maximal</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9.5px] font-bold">Freigeschaltet</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Request Logs Telemetry Explorer */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500 text-slate-950 shadow-[0_0_8px_#00f0ff] animate-pulse">
                        LIVE TELEMETRIE
                      </span>
                      <span className="text-xs font-mono text-cyan-300 font-bold">
                        ECHTZEIT-ANFRAGEN & TOKEN-LOGS (LETZTE ANFRAGEN)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hier sehen Sie jede einzelne System-Anfrage, den ausführenden Agenten, Prompt-/Completion-Tokens und die Millisekunden-Latenz.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      100% HEALTH (200 OK)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                        <th className="py-2 px-3">ZEITPUNKT</th>
                        <th className="py-2 px-3">CORE AGENT</th>
                        <th className="py-2 px-3">OPERATION / PROMPT</th>
                        <th className="py-2 px-3 text-right">INPUT</th>
                        <th className="py-2 px-3 text-right">OUTPUT</th>
                        <th className="py-2 px-3 text-right">TOTAL</th>
                        <th className="py-2 px-3 text-right">LATENZ</th>
                        <th className="py-2 px-3 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">Gerade eben</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold text-[10px]">
                            💎 SYNTAX
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          Architecture Orchestration & Telemetry Sync
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">1.240</td>
                        <td className="py-2.5 px-3 text-right text-amber-300 font-bold">860</td>
                        <td className="py-2.5 px-3 text-right text-white font-black">2.100</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">342 ms</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">200 OK</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition bg-slate-950/30">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">Vor 2 Min</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-[10px]">
                            ⚡ VEGA
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          Live Data Telemetry & Query Stream
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">2.410</td>
                        <td className="py-2.5 px-3 text-right text-amber-300 font-bold">1.520</td>
                        <td className="py-2.5 px-3 text-right text-white font-black">3.930</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">510 ms</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">200 OK</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">Vor 6 Min</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold text-[10px]">
                            🎬 NEO
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          Veo 3.1 8K Prompt Rendering Synthesis
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">3.800</td>
                        <td className="py-2.5 px-3 text-right text-amber-300 font-bold">2.100</td>
                        <td className="py-2.5 px-3 text-right text-white font-black">5.900</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">780 ms</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">200 OK</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 transition bg-slate-950/30">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">Vor 14 Min</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-[10px]">
                            🛡️ PHOENIX
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          System Security Audit & Threat Vector Check
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">1.890</td>
                        <td className="py-2.5 px-3 text-right text-amber-300 font-bold">1.000</td>
                        <td className="py-2.5 px-3 text-right text-white font-black">2.890</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">420 ms</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">200 OK</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DAILY OBJECTIVES, STREAKS & PRODUKTIVITÄTS-SYSTEM */}
          {activeTab === "daily_objectives" && (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(52,211,153,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-400 text-slate-950 shadow-[0_0_8px_#34d399] animate-pulse">
                      🎯 DAILY OBJECTIVES & XP MATRIX
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">
                      🔥 7-TAGE STREAK AKTIV
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    DAILY OBJECTIVES & STREAK-BONUS-SYSTEM
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-normal">
                    Das Daily Objectives System transformiert Ihre Arbeitstage in eine motivierende Produktivitäts-Matrix. Erfüllen Sie 4 tägliche Missionen, halten Sie Ihren Streak am Leben und schalten Sie bis zu +50.000 tägliche Bonus-Tokens frei!
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-center">
                    <div className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Streak Bonus</div>
                    <div className="text-base font-black text-white">+50.000 TOKENS</div>
                  </div>
                </div>
              </div>

              {/* 4 Interactive Objectives Live Cards */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-400/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-black font-mono text-emerald-300 uppercase tracking-wide flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      HEUTIGE 4 MISSIONEN (LIVE INTERAKTIV)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Klicken Sie auf die Checkboxen, um den Fortschritt und die XP-Ausschüttung zu testen:
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-xs">
                    Fortschritt: 3 / 4 Erledigt (75%)
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Objective 1 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/50 flex items-start gap-3 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 mt-0.5 shadow-[0_0_8px_#34d399]">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-300">1. Morgen-Kickoff mit SYNTAX</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">+50 XP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ersten Prompt oder Master-Synthese des Tages initiieren und Tagesziele synchronisieren.
                      </p>
                    </div>
                  </div>

                  {/* Objective 2 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/50 flex items-start gap-3 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 mt-0.5 shadow-[0_0_8px_#34d399]">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-300">2. Tri-Core Swarm Analyse</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">+100 XP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Eine komplexe Fragestellung über 'THE BIG 3' (SYNTAX, NEO, VEGA) parallel berechnen lassen.
                      </p>
                    </div>
                  </div>

                  {/* Objective 3 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/50 flex items-start gap-3 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 mt-0.5 shadow-[0_0_8px_#34d399]">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-300">3. 25 Min Deep-Work Focus</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">+150 XP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Einen 25-Minuten Pomodoro Deep-Work Fokusblock mit Vision AI oder Focus Canvas abschließen.
                      </p>
                    </div>
                  </div>

                  {/* Objective 4 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-700 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg border-2 border-amber-400/80 flex items-center justify-center text-amber-400 font-black text-xs shrink-0 mt-0.5">
                      4
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-amber-300">4. Tages-Synthese & Review</span>
                        <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">+200 XP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tagesabschluss durchführen, Token-Effizienz prüfen und Notizen in Google Workspace speichern.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Core Pillars of Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-mono font-black text-xs">
                    🔥
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    STREAK-SERIEN (TAGE IN FOLGE)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Jeder aufeinanderfolgende Tag, an dem Sie Ihre Objectives abschließen, erhöht Ihren Streak-Multiplikator und sichert dauerhaften Quoten-Boost.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-black text-xs">
                    ⚡
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    XP & OPERATOR LEVEL
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sammeln Sie XP für jeden abgeschlossenen Task. Steigen Sie vom Cadet zum Master Operator auf und schalten Sie exklusive UI-Themes & Presets frei.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono font-black text-xs">
                    🎁
                  </div>
                  <h4 className="text-xs font-black font-mono text-white uppercase">
                    BONUS TOKEN-KONTINGENTE
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bei 4/4 erreichten Missionen werden automatisch +50.000 Bonus-Tokens auf Ihr 24h-Tagesbudget gutgeschrieben – perfekt für anspruchsvolle Swarm-Jobs!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIE 4 SPATIAL HUBS (SCHRITT FÜR SCHRITT) */}
          {activeTab === "all_hubs" && (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-400 text-slate-950 shadow-[0_0_8px_#a855f7] animate-pulse">
                      🪐 4 SPATIAL KOMMANDO-HUBS
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 font-bold">
                      SCHRITT-FÜR-SCHRITT ERKLÄRT
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    DIE 4 HAUPT-HUBS DES S.Y.N.T.A.X. ECOSYSTEMS
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-normal">
                    Das Interface ist in 4 intuitive Steuerungs-Zonen (Hubs) unterteilt: Top Command Bar, Bottom Matrix Dock, Left Toolkit Rail und Right Chat Console.
                  </p>
                </div>
              </div>

              {/* Hub Selector Navigation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 0,
                    title: "HUB 1: TOP COMMAND",
                    subtitle: "Scopes & Telemetrie",
                    icon: <Zap className="w-4 h-4 text-cyan-400" />,
                    color: "border-cyan-400",
                  },
                  {
                    id: 1,
                    title: "HUB 2: BOTTOM MATRIX",
                    subtitle: "8-Core Umschalter",
                    icon: <Users className="w-4 h-4 text-amber-400" />,
                    color: "border-amber-400",
                  },
                  {
                    id: 2,
                    title: "HUB 3: LEFT TOOLKIT",
                    subtitle: "Apps & Video Studio",
                    icon: <ShoppingBag className="w-4 h-4 text-pink-400" />,
                    color: "border-pink-400",
                  },
                  {
                    id: 3,
                    title: "HUB 4: RIGHT CHAT",
                    subtitle: "Delegation & CoT",
                    icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
                    color: "border-emerald-400",
                  },
                ].map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => setActiveHubIndex(hub.id)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      activeHubIndex === hub.id
                        ? "bg-slate-800 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {hub.icon}
                      <span className="text-xs font-mono font-bold text-white">{hub.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{hub.subtitle}</span>
                  </button>
                ))}
              </div>

              {/* Hub 1 Detailed Content */}
              {activeHubIndex === 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black font-mono text-white uppercase">
                        HUB 1: TOP COMMAND BAR (OBERE MASTER-LEISTE)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Zentrale Steuerung für Kommunikations-Modi, Mikrofon, Quoten & Quick Hubs
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-cyan-300 font-mono font-bold">1. Scope Selector (SINGLE / AGENT-SYNC / BIG 3 / ALL)</span>
                      <p className="text-slate-400 text-[11px]">
                        Schaltet die Kommunikation mit einem Klick zwischen Einzel-Agent, synchronem Konsens, den Big 3 oder der gesamten 8er-Flotte um.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-amber-300 font-mono font-bold">2. Today's Usage Widget & Flame Meter</span>
                      <p className="text-slate-400 text-[11px]">
                        Zeigt Ihren aktuellen Tages-Token-Verbrauch und Quoten-Status in Echtzeit an. Klick öffnet das Deep-Analytics-Dashboard.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-purple-300 font-mono font-bold">3. Voice Diagnostic Pill & Konferenz</span>
                      <p className="text-slate-400 text-[11px]">
                        Visualisiert Sprachstatus, bidirektionale Audio-Eingabe und schaltet bei Bedarf die Sprachkonferenz mit der Flotte scharf.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-emerald-300 font-mono font-bold">4. Quick Hubs Dropdown Menu</span>
                      <p className="text-slate-400 text-[11px]">
                        Erlaubt blitzschnellen Direktzugriff auf Terminal, App Store, Nano Banana, Veo Studio, Layout Editor und User Account.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hub 2 Detailed Content */}
              {activeHubIndex === 1 && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black font-mono text-white uppercase">
                        HUB 2: BOTTOM MATRIX HUB (8-CORE SCHNELLWECHSEL-DOCK)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Das schwebende Dock unter der 3D-Kugel zur direkten Aktivierung der 8 Spezialisten
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-amber-300 font-mono font-bold text-xs">Die 8 Spezial-Cores im Überblick:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold">S • SYNTAX (Architektur)</div>
                      <div className="p-2 rounded bg-slate-900 border border-indigo-500/30 text-indigo-300 font-bold">N • NEO (Design & 3D)</div>
                      <div className="p-2 rounded bg-slate-900 border border-purple-500/30 text-purple-300 font-bold">V • VEGA (Quantum Code)</div>
                      <div className="p-2 rounded bg-slate-900 border border-pink-500/30 text-pink-300 font-bold">O • OMNI (Video & Veo 3.1)</div>
                      <div className="p-2 rounded bg-slate-900 border border-rose-500/30 text-rose-300 font-bold">P • PULSE (Social Media)</div>
                      <div className="p-2 rounded bg-slate-900 border border-amber-500/30 text-amber-300 font-bold">C • CHRONOS (Kalender)</div>
                      <div className="p-2 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300 font-bold">R • RISK (Cyber-Security)</div>
                      <div className="p-2 rounded bg-slate-900 border border-blue-500/30 text-blue-300 font-bold">G • GROUNDING (Recherche)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hub 3 Detailed Content */}
              {activeHubIndex === 2 && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-pink-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black font-mono text-white uppercase">
                        HUB 3: LEFT NAV-RAIL & TOOLKIT HUB (APPS & EXTENSIONS)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Vollwertiges Ecosystem an integrierten KI- und Workspace-Werkzeugen
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-purple-500/30">
                      <span className="text-purple-300 font-mono font-bold block">🟣 Claude Code CLI</span>
                      <span className="text-slate-400 text-[10.5px]">Terminal für Bash, Node.js und ECO/BALANCED/TURBO Power-Levels.</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-pink-500/30">
                      <span className="text-pink-300 font-mono font-bold block">🌸 Google Veo 3.1 8K</span>
                      <span className="text-slate-400 text-[10.5px]">Cinematische Videoerstellung und Bewegung aus Text & Standbildern.</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-rose-500/30">
                      <span className="text-rose-300 font-mono font-bold block">🍌 Nano Banana Photo Studio</span>
                      <span className="text-slate-400 text-[10.5px]">Imagen 3.0 Foto-Retusche, Inpainting und interaktive 3D-Hologramme.</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/30">
                      <span className="text-emerald-300 font-mono font-bold block">🗺️ Google Maps & Vision</span>
                      <span className="text-slate-400 text-[10.5px]">Reaktionsschnelle Satelliten-Karten & Live Monitor Perception AI.</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/30">
                      <span className="text-amber-300 font-mono font-bold block">📅 Chronos & Gmail</span>
                      <span className="text-slate-400 text-[10.5px]">Vollautomatische Terminplanung und E-Mail-Organisation per Sprache.</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-blue-500/30">
                      <span className="text-blue-300 font-mono font-bold block">🔲 VisionOS Layout Editor</span>
                      <span className="text-slate-400 text-[10.5px]">Räumliches 3D-Verschieben und Anordnen aller App-Fenster.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hub 4 Detailed Content */}
              {activeHubIndex === 3 && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black font-mono text-white uppercase">
                        HUB 4: RIGHT CHAT & DELEGATION HUB (FLOTTEN-KONSISTENZ)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Transparente Denkprozesse, Tabellen-Analysen & interaktiver Observer Stream
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-emerald-300 font-mono font-bold">1. Fleet Delegation Matrix</span>
                      <p className="text-slate-400 text-[11px]">
                        Zeigt visualisiert an, welcher Spezial-Core welchen Teil Ihrer Aufgabenstellung übernommen hat.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-cyan-300 font-mono font-bold">2. Gedanken & Strategie (CoT)</span>
                      <p className="text-slate-400 text-[11px]">
                        Volle Transparenz in die internen Überlegungen der Agenten vor der Ausgabe des finalen Resultats.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-purple-300 font-mono font-bold">3. Deep Dive Tabellen-Analyse</span>
                      <p className="text-slate-400 text-[11px]">
                        Strukturierte Auswertungen mit Befunden, Prioritäten und konkreten Handlungsempfehlungen.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL 8 AGENTS COMPENDIUM */}
          {activeTab === "all_agents" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black font-mono text-white tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    DAS 8-CORE SPEZIALISTEN-LEXIKON
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Wählen Sie einen Agenten aus, um seine Spezialisierung, Stärken und Kostenklasse zu sehen:
                  </p>
                </div>
              </div>

              {/* Agent Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SYSTEM_AGENTS.map((ag) => {
                  const isSelected = selectedAgentDetail.id === ag.id;
                  return (
                    <button
                      key={ag.id}
                      onClick={() => setSelectedAgentDetail(ag)}
                      style={{
                        borderColor: isSelected ? ag.color : "rgba(255,255,255,0.1)",
                        backgroundColor: isSelected ? `${ag.color}15` : "rgba(15,23,42,0.6)",
                      }}
                      className="p-3 rounded-2xl border transition-all text-left group cursor-pointer hover:border-cyan-400/60"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          style={{ backgroundColor: ag.color, color: "#000" }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs"
                        >
                          {ag.short[0]}
                        </span>
                        {ag.isBig3 && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                            BIG 3
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-bold text-xs text-white group-hover:text-cyan-200">
                        {ag.name}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 line-clamp-1">
                        {ag.tagline}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Agent Card Detail */}
              <div
                style={{ borderColor: selectedAgentDetail.color }}
                className="p-5 rounded-3xl bg-slate-900/90 border-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: `${selectedAgentDetail.color}25`, color: selectedAgentDetail.color, borderColor: selectedAgentDetail.color }}
                        className="px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider"
                      >
                        {selectedAgentDetail.tagline}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Kostenklasse: <strong className="text-white">{selectedAgentDetail.costTier}</strong>
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-white font-mono mt-1">
                      {selectedAgentDetail.name} ({selectedAgentDetail.short})
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      {selectedAgentDetail.role}
                    </p>
                  </div>

                  {onSelectAgent && (
                    <button
                      onClick={() => {
                        onSelectAgent(selectedAgentDetail.id);
                        onClose();
                      }}
                      style={{ backgroundColor: selectedAgentDetail.color }}
                      className="px-4 py-2 rounded-xl text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 cursor-pointer shadow-lg shrink-0"
                    >
                      Jetzt zu {selectedAgentDetail.short} wechseln
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
                      KERN-FÄHIGKEITEN:
                    </span>
                    <ul className="space-y-1.5">
                      {selectedAgentDetail.capabilities.map((cap, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                      BESTE EINSATZSZENARIEN:
                    </span>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-200/90 font-sans">
                      {selectedAgentDetail.bestFor}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THE BIG 3 vs ALL 8 */}
          {activeTab === "big3_vs_all" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-pink-950/60 to-cyan-950/60 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-mono text-xs font-black text-amber-300 tracking-wider uppercase">
                    DIE TRI-CORE MATRIX: S.Y.N.T.A.X. • N.E.O. • V.E.G.A.
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  Wo finden Sie 'THE BIG 3' und was macht sie besonders?
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  In der oberen Steuerungsleiste (oben links neben dem Agentennamen) befindet sich der Schalter <strong>'👑 THE BIG 3'</strong>.
                  Wenn aktiviert, wird Ihre Nachricht synchron an die 3 Kern-Intelligenzen geschickt:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400/50">
                    <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">CORE #01</span>
                    <h4 className="font-mono font-black text-white text-sm mt-0.5">S.Y.N.T.A.X.</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Liefert die System-Architektur, Backend-Logik und präzise Code-Ausführung.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-950/40 border border-pink-400/50">
                    <span className="text-[10px] font-mono font-bold text-pink-300 uppercase">CORE #02</span>
                    <h4 className="font-mono font-black text-white text-sm mt-0.5">N.E.O.</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Übernimmt visuelle Strategie, Veo 3.1 8K Video-Konzepte und Design-Critique.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-400/50">
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">CORE #03</span>
                    <h4 className="font-mono font-black text-white text-sm mt-0.5">V.E.G.A.</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Analysiert Datenströme, debuggt Fehler im Detail und bewertet taktische Risiken.
                    </p>
                  </div>
                </div>

                {onSetCommunicationScope && (
                  <div className="mt-4 pt-3 border-t border-amber-500/30 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onSetCommunicationScope("THE_BIG_3");
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg"
                    >
                      👑 Jetzt 'THE BIG 3' aktivieren
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <h4 className="font-mono font-bold text-white text-sm">
                    Gegenüberstellung: SINGLE vs. THE BIG 3 vs. ALL (8)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                    <span className="text-cyan-400 font-mono font-bold block mb-1">👤 SINGLE (1 CORE)</span>
                    <p className="text-slate-300 text-[11px]">
                      1x Token-Verbrauch. Ideal für 90% aller Anfragen, normale Unterhaltungen, Programmieren und Chatten.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40">
                    <span className="text-amber-300 font-mono font-bold block mb-1">👑 THE BIG 3 (3 CORES)</span>
                    <p className="text-slate-300 text-[11px]">
                      3x Token-Verbrauch. Synchronisiert Code, Strategie und Datenanalyse für komplexe Master-Pläne.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-purple-500/40">
                    <span className="text-purple-300 font-mono font-bold block mb-1">🌐 ALL (8 CORES)</span>
                    <p className="text-slate-300 text-[11px]">
                      8x Token-Verbrauch. Höchste Rechenlast. Alle 8 Fachspezialisten antworten simultan aus ihrer Perspektive.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUOTAS & WHY LIMIT USAGE */}
          {activeTab === "limits" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-rose-950/30 border-2 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="font-mono text-xs font-black text-rose-300 tracking-wider uppercase">
                    WICHTIG: QUOTEN-, LATENZ- & KOSTEN-MANAGEMENT
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  Warum Sie 'ALL (8)' und 'THE BIG 3' nur gezielt nutzen sollten
                </h3>
                
                <div className="space-y-3 mt-3 text-xs text-slate-300 leading-relaxed font-sans">
                  <p>
                    Jeder Agent ist eine eigenständige, hochmoderne neuronale KI-Instanz. Wenn Sie mit <strong>ALL (8)</strong> sprechen, werden <strong className="text-white">8 KI-Modelle gleichzeitig</strong> mit Ihrem Prompt gefüttert.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-rose-500/40">
                      <span className="font-mono font-bold text-rose-400 block mb-1 text-[11px]">1. API-RATE-LIMITS</span>
                      <p className="text-[11px] text-slate-300">
                        8 parallele API-Anfragen belasten Ihre Rate-Limits 8-mal schneller als ein Einzel-Agent.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-rose-500/40">
                      <span className="font-mono font-bold text-rose-400 block mb-1 text-[11px]">2. ANTWORT-FLUT</span>
                      <p className="text-[11px] text-slate-300">
                        Sie erhalten 8 Antworten gleichzeitig. Für einfache Fragen ist das unübersichtlich.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-rose-500/40">
                      <span className="font-mono font-bold text-rose-400 block mb-1 text-[11px]">3. KOSTEN-KONTROLLE</span>
                      <p className="text-[11px] text-slate-300">
                        Ein 100-Token Prompt verbraucht bei ALL (8) direkt 800 Token + 8x Output-Generierung.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/50 mt-3 text-emerald-300">
                    <strong className="block font-mono text-xs uppercase mb-1">DIE GOLDENE REGEL FÜR DEN BOSS:</strong>
                    <ul className="space-y-1 list-disc list-inside text-[11.5px] text-slate-200">
                      <li><strong>90% der Zeit:</strong> Verwenden Sie <code>👤 SINGLE</code> mit dem passenden Spezialisten (z.B. VEGA für Bugs, ORACLE für Charts).</li>
                      <li><strong>10% der Zeit:</strong> Schalten Sie für große Brainstormings oder Master-Pläne auf <code>👑 THE BIG 3</code> oder <code>🌐 ALL (8)</code>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHAT ÖFFNEN, FLOATING TOGGLE & FLEET DELEGATION MATRIX */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              {/* TOP HERO CONTAINER: Chat Controls */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-slate-950/90 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.25)]">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs font-black text-cyan-300 tracking-wider uppercase">
                      AGENTEN-CHAT STEUERUNG & FLOATING TOGGLE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                    STATUS: STANDARDMÄSSIG GESCHLOSSEN (CLEAN FOCUS)
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  So öffnen, positionieren und nutzen Sie den Agenten-Chat
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Damit Sie beim Start die volle 3D-Kugel und alle Widgets im Blick haben, ist das Chatfenster standardmäßig minimiert. Sie können es jederzeit mit einem Klick öffnen, frei auf dem Bildschirm verschieben oder in der Größe verändern.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-black text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40">
                          SCHRITT 1
                        </span>
                        <h4 className="font-mono font-bold text-white text-sm">Runder Chat-Button</h4>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Am <strong>rechten Bildschirmrand</strong> schwebt ein runder Chat-Button. Ein Klick öffnet das Chatfenster für den aktiven Agenten oder blendet es wieder aus.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                      <span>Symbol:</span>
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-300 inline" />
                      <span className="font-bold">Rechter Rand</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-black text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40">
                          SCHRITT 2
                        </span>
                        <h4 className="font-mono font-bold text-white text-sm">Verschieben & Skalieren</h4>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Fassen Sie das Chatfenster an der oberen Leiste, um es überall auf dem Bildschirm zu platzieren. Ziehen Sie an den Kanten, um die Fenstergröße anzupassen.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                      <span>Modus:</span>
                      <span className="font-bold text-white">VisionOS Drag & Scale</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-black text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40">
                          SCHRITT 3
                        </span>
                        <h4 className="font-mono font-bold text-white text-sm">Agent & Sprache wählen</h4>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Im Chat können Sie zwischen <strong>SINGLE</strong>, <strong>THE BIG 3</strong> und <strong>ALL (8)</strong> wechseln, Prompts tippen oder per Mikrofon sprechen.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                      <span>Support:</span>
                      <span className="font-bold text-emerald-400">Voice Audio & Live Captions</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Schnell-Aktionen:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onToggleChat && (
                      <button
                        onClick={() => {
                          onToggleChat();
                        }}
                        className="px-4 py-2 rounded-xl border border-cyan-400/60 bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold uppercase transition cursor-pointer"
                      >
                        🔄 Chat ein-/ausblenden (Toggle)
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onOpenChat ? onOpenChat() : onToggleChat?.();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-950" />
                      <span>💬 Chat jetzt öffnen & Tour beenden</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: FLEET DELEGATION MATRIX, THOUGHT CHAIN & DEEP DIVE EXPLANATION */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(0,240,255,0.2)] space-y-5">
                <div className="flex items-center justify-between gap-2 border-b border-cyan-500/30 pb-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-mono font-black text-white text-base tracking-wide flex items-center gap-2">
                        <span>FLEET DELEGATION MATRIX – AUFBAU & ELEMENTE</span>
                        <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/40">
                          INTERAKTIVES HANDBUCH
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-300 font-mono">
                        So lesen und nutzen Sie die Gedanken-Kette, Deep Dive Analysen und den Console Observer
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/50">
                    Klicken Sie in der Karte zum Ausprobieren!
                  </span>
                </div>

                {/* 1. INTERACTIVE LIVE REPLICA OF THE CARD FROM USER SCREENSHOT */}
                <div className="relative rounded-2xl bg-slate-950 border-2 border-cyan-400/80 p-4 sm:p-5 shadow-[0_0_30px_rgba(0,240,255,0.25)] font-mono text-xs">
                  {/* Corner brackets */}
                  <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                  {/* Header Bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/90 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-cyan-400 tracking-[1.5px] flex items-center gap-2">
                          <span>FLEET DELEGATION</span>
                          <span className="text-[9px] text-slate-400 font-normal">[SINGLE-CORE]</span>
                        </div>
                        <div className="text-[9px] text-slate-400 tracking-wider">
                          MULTI-AGENT THOUGHTS & EXPERT ANSWERS WITH TABULAR DEEP DIVE
                        </div>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>● CONSOLE LOG</span>
                    </div>
                  </div>

                  {/* Body: Agent Section */}
                  <div className="relative pl-3 space-y-3 before:absolute before:top-2 before:bottom-2 before:left-0 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:to-emerald-400">
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-3 shadow-md">
                      {/* Agent Tag + Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-cyan-400">→ SYNTAX</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 uppercase">
                            "LOGIK & C.O.D.E."
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* DEEP DIVE BUTTON (Interactive) */}
                          <button
                            onClick={() => setPreviewDeepDiveOpen(!previewDeepDiveOpen)}
                            className="px-2.5 py-1 rounded-lg border border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 text-[10px] font-black flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:scale-105"
                            title="Tabellarische Tiefenanalyse ein- oder ausblenden"
                          >
                            <Table className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                            <span>{previewDeepDiveOpen ? "✖ TABELLE SCHLIESSEN" : "🔍 DEEP DIVE ANALYSE"}</span>
                          </button>

                          {/* THOUGHT TOGGLE (Interactive) */}
                          <button
                            onClick={() => setPreviewThoughtOpen(!previewThoughtOpen)}
                            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition cursor-pointer font-bold"
                          >
                            <Brain className="w-3.5 h-3.5 text-amber-400" />
                            <span>{previewThoughtOpen ? "Gedanken einklappen" : "Gedanken anzeigen"}</span>
                            {previewThoughtOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* 1. SEPARATE THOUGHT BLOCK (🧠 GEDANKE / STRATEGIE) */}
                      {previewThoughtOpen && (
                        <div className="rounded-lg bg-amber-950/30 border-l-2 border-amber-500 p-2.5 text-xs text-amber-200 space-y-1 transition-all duration-200">
                          <div className="flex items-center gap-1.5 font-bold text-[10px] tracking-wider text-amber-400 uppercase">
                            <Brain className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span>🌸 [SYNTAX - GEDANKE / STRATEGIE]</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed text-slate-300 italic">
                            "Analysiere Systemanfrage bezüglich SYNTAX..."
                          </p>
                        </div>
                      )}

                      {/* 2. SEPARATE RESPONSE BLOCK (⚡ ANTWORT & ANALYSE) */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[10px] text-cyan-400 tracking-wider uppercase">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>⚡ [SYNTAX - ANTWORT & ANALYSE]</span>
                        </div>
                        <p className="font-sans text-xs sm:text-sm text-slate-100 leading-relaxed pt-0.5">
                          Verbindung zu getsyntax.ai hergestellt. Ich bin S.Y.N.T.A.X., das souveräne Multi-Agent-Kernsystem. Extrem fokussiert, präzise und absolut direkt. Wie lautet deine Anweisung, Boss?
                        </p>
                      </div>

                      {/* INTERACTIVE TABULAR DEEP DIVE AUDIT PREVIEW */}
                      {previewDeepDiveOpen && (
                        <div className="mt-3 p-3 rounded-xl bg-[#050b1e] border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-fadeIn">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30 text-cyan-300">
                            <div className="flex items-center gap-1.5 font-bold text-[11px]">
                              <Table className="w-3.5 h-3.5 text-cyan-400" />
                              <span>DEEP DIVE STRUKTUR-ANALYSE (LIVE-VORSCHAU)</span>
                            </div>
                            <span className="text-[9px] text-slate-400">Automatisch aus Antwort generiert</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[10px] font-mono">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                                  <th className="py-1 px-2">Dimension</th>
                                  <th className="py-1 px-2">Befund / Finding</th>
                                  <th className="py-1 px-2">Empfehlung</th>
                                  <th className="py-1 px-2 text-center">Score</th>
                                  <th className="py-1 px-2 text-right">Priorität</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-900 text-slate-200">
                                <tr>
                                  <td className="py-1.5 px-2 font-bold text-cyan-300">System & Logik</td>
                                  <td className="py-1.5 px-2">S.Y.N.T.A.X. Kern-Verbindung bereit</td>
                                  <td className="py-1.5 px-2">Handlungsdirektive übergeben</td>
                                  <td className="py-1.5 px-2 text-center text-emerald-400 font-bold">98%</td>
                                  <td className="py-1.5 px-2 text-right font-black text-rose-400">CRITICAL</td>
                                </tr>
                                <tr>
                                  <td className="py-1.5 px-2 font-bold text-purple-300">Conversion & Growth</td>
                                  <td className="py-1.5 px-2">Multi-Agent Matrix initialisiert</td>
                                  <td className="py-1.5 px-2">A/B Feedback-Loops aktivieren</td>
                                  <td className="py-1.5 px-2 text-center text-emerald-400 font-bold">94%</td>
                                  <td className="py-1.5 px-2 text-right font-black text-amber-400">MAX</td>
                                </tr>
                                <tr>
                                  <td className="py-1.5 px-2 font-bold text-emerald-300">Sicherheit & Audit</td>
                                  <td className="py-1.5 px-2">Verschlüsselte Token-Verwaltung</td>
                                  <td className="py-1.5 px-2">Sub-Agenten bei Bedarf zuschalten</td>
                                  <td className="py-1.5 px-2 text-center text-emerald-400 font-bold">96%</td>
                                  <td className="py-1.5 px-2 text-right font-black text-cyan-400">HIGH</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Meta & Controls */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/90 text-slate-400 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-semibold flex items-center gap-1 text-[10px]">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>CONSOLE OBSERVER STREAM</span>
                      </span>
                      <span className="text-slate-500 text-[10px]">12:22:50</span>
                    </div>

                    <button
                      onClick={() => {
                        setPreviewCopied(true);
                        setTimeout(() => setPreviewCopied(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition hover:scale-105"
                    >
                      {previewCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{previewCopied ? "KOPIERT ✔" : "CONSOLE COPY"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. DETAILED BREAKDOWN OF THE 4 CORE ELEMENTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {/* Element 1: Fleet Delegation Matrix */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/40">
                        1. MATRIX HEADER
                      </span>
                      <h4 className="font-mono font-bold text-white text-sm">Fleet Delegation Matrix</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Zeigt an, ob Sie mit einem <strong>[SINGLE-CORE]</strong> Agenten, <strong>[THE BIG 3]</strong> oder der gesamten <strong>[8-AGENTEN-FLOTTE]</strong> kommunizieren. Der grüne <code>● CONSOLE LOG</code> Indikator signalisiert aktive Telemetrie.
                    </p>
                  </div>

                  {/* Element 2: Deep Dive Analysis */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/40">
                        2. STRUKTUR-ANALYSE
                      </span>
                      <h4 className="font-mono font-bold text-white text-sm">🔍 Deep Dive Analyse</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Wandelt Fließtext-Antworten mit einem Klick in eine <strong>priorisierte Matrix</strong> mit Dimensionen, Befunden, klaren Handlungsempfehlungen und Impact-Scores (%) um – ideal für Strategie-Audits.
                    </p>
                  </div>

                  {/* Element 3: Thought Chain */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/40">
                        3. CHAIN OF THOUGHT
                      </span>
                      <h4 className="font-mono font-bold text-white text-sm">🧠 Gedanke & Strategie</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Macht den internen Denkprozess und die Planung des Agenten vor der Antwort <strong>100% transparent</strong>. Mit <code>Gedanken einklappen ^</code> lässt sich der Bereich für kompakte Ansichten minimieren.
                    </p>
                  </div>

                  {/* Element 4: Console Observer */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/40">
                        4. LOG-STREAM & EXPORT
                      </span>
                      <h4 className="font-mono font-bold text-white text-sm">Console Observer & Copy</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Protokolliert sekundengenaue Ausführungs-Zeitstempel. Mit <strong>CONSOLE COPY</strong> kopieren Sie die gesamte Ausgabe inklusive Gedanken und Antworten sauber formatiert in Ihre Zwischenablage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE KALENDER & CHRONOS TERMINPLANER */}
          {activeTab === "calendar" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-950/90 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span className="font-mono text-xs font-black text-amber-300 tracking-wider uppercase">
                      GOOGLE CALENDAR & CHRONOS AUTONOMOUS SCHEDULER
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                    24/7 WORKSPACE AUTOMATION
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  Meetings planen, Deadlines verwalten & Google Kalender synchronisieren
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Chronos ist Ihr autonomer Termin- und Zeitmanager. Er verwaltet Kalendertermine, erinnert Sie an anstehende Tasks und plant Meetings auf natürliche Zuruf-Befehle ein.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                  {/* Left Column: Feature Breakdown */}
                  <div className="space-y-3 lg:col-span-1">
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">FEATURE #01</span>
                      <h4 className="font-mono font-bold text-white text-sm mt-0.5">Google Calendar Sync</h4>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Echtzeit-Synchronisierung mit Google Workspace. Termine werden nahtlos im Kalender-Dashboard dargestellt.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">FEATURE #02</span>
                      <h4 className="font-mono font-bold text-white text-sm mt-0.5">Prompt-basierte Planung</h4>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Sagen Sie z.B. <em>"Plane morgen um 14 Uhr ein Strategie-Meeting ein"</em>, und der Termin wird automatisch angelegt.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/40">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">FEATURE #03</span>
                      <h4 className="font-mono font-bold text-white text-sm mt-0.5">Kategorien & Priorität</h4>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Klare Trennung zwischen <strong>System</strong>, <strong>Work</strong>, <strong>AI Benchmarks</strong> und <strong>Persönlich</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Embedded Interactive Live Widget */}
                  <div className="lg:col-span-2 p-3 rounded-2xl bg-slate-950/95 border border-amber-500/50 shadow-inner">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>INTERAKTIVES KALENDER-WIDGET (LIVE-VORSCHAU)</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Termine anklickbar & editierbar</span>
                    </div>
                      <ChronosCalendarWidget agentColor="#f59e0b" standalone={false} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-500/30 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onOpenCalendar ? onOpenCalendar() : onOpenChat?.();
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-950" />
                    <span>📅 Kalender & Chronos im Workspace öffnen</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GMAIL & EMAIL ASSISTANT */}
          {activeTab === "gmail" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-teal-950/60 to-slate-950/80 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-black text-emerald-300 tracking-wider uppercase">
                    GOOGLE GMAIL INBOX CLIENT & WORKFLOW ASSISTANT
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  Posteingang automatisieren, E-Mails zusammenfassen & Entwürfe senden
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Mit dem integrierten Gmail-Client verbinden Sie Ihr Postfach direkt mit der Flotte. S.Y.N.T.A.X. und P.U.L.S.E. können Ihre Mails analysieren und sofortige Antworten verfassen.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40">
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">FEATURE #01</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Inbox-Zusammenfassung</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Die KI fasst ungelesene E-Mails in 3 Stichpunkten zusammen und markiert dringende Absender.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40">
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">FEATURE #02</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">KI-Antwort-Entwürfe</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Generiert mit 1 Klick professionelle, freundliche oder verhandelnde Antworten in Ihrem Tonfall.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40">
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">FEATURE #03</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Spam & Phishing Guard</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      O.D.I.N. prüft verdächtige Links und Anhänge vor dem Öffnen auf Schadcode und Phishing.
                    </p>
                  </div>
                </div>

                {onOpenGmail && (
                  <div className="mt-4 pt-3 border-t border-emerald-500/30 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onOpenGmail();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Gmail Widget jetzt öffnen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SCREEN SHARE & VISION AI */}
          {activeTab === "screenshare" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-950/80 border-2 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span className="font-mono text-xs font-black text-purple-300 tracking-wider uppercase">
                    AUTONOME VISION AI: MONITOR 1 & 2 FREIGEBEN
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  Live Screen Perception – Die Flotte liest Ihren Monitor mit
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Vergessen Sie mühsames Kopieren von Code, Fehlermeldungen oder Tabellen. Geben Sie Ihren Bildschirm frei, und N.E.O. & S.Y.N.T.A.X. analysieren den Inhalt in Echtzeit.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40">
                    <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">ANWENDUNG 1</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Live Code-Debugging</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Öffnen Sie Ihre IDE – V.E.G.A. & SYNTAX sehen Stack Traces und Fehler sofort und schlagen Korrekturen vor.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40">
                    <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">ANWENDUNG 2</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Chart & Finanz-Scans</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Zeigen Sie TradingView oder Krypto-Charts – O.R.A.C.L.E. erkennt Candlestick-Muster und Support-Level.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40">
                    <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">ANWENDUNG 3</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Design & UI-Critique</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      N.E.O. bewertet Layouts, Kontraste und Farbräume nach VisionOS und Material Standards.
                    </p>
                  </div>
                </div>

                {onStartScreenPerception && (
                  <div className="mt-4 pt-3 border-t border-purple-500/30 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onStartScreenPerception();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Monitor 1 & 2 jetzt freigeben</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: VISIONOS LAYOUT SYSTEM */}
          {activeTab === "layout" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-slate-950/80 border-2 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <LayoutGrid className="w-5 h-5 text-blue-400 animate-pulse" />
                  <span className="font-mono text-xs font-black text-blue-300 tracking-wider uppercase">
                    VISIONOS SPATIAL WORKSPACE SYSTEM
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  Widgets frei anordnen, skalieren, pinnen und Layouts speichern
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Passen Sie Ihr Dashboard individuell an Ihre Arbeitsweise an. Mit dem Layout-Modus können Sie alle Fenster wie in visionOS modular anordnen.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/40">
                    <span className="text-[10px] font-mono font-bold text-blue-300 uppercase">SCHRITT 1</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Layout-Modus starten</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Klicken Sie oben rechts auf den Button <strong>'LAYOUT'</strong> oder drücken Sie das Layout-Icon im unteren Matrix Hub.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/40">
                    <span className="text-[10px] font-mono font-bold text-blue-300 uppercase">SCHRITT 2</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Fenster Drag & Drop</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Fassen Sie Widgets an der oberen Titelleiste und ziehen Sie sie an die gewünschte Bildschirmposition.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/40">
                    <span className="text-[10px] font-mono font-bold text-blue-300 uppercase">SCHRITT 3</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Presets nutzen</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Wählen Sie mit 1 Klick vorkonfigurierte Presets: <em>CODER</em>, <em>TRADER</em> oder <em>VISIONOS FULL</em>.
                    </p>
                  </div>
                </div>

                {onOpenLayoutEditor && (
                  <div className="mt-4 pt-3 border-t border-blue-500/30 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onOpenLayoutEditor();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Layout-Editor jetzt öffnen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: APP STORE & INTEGRATIONS */}
          {activeTab === "apps" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-orange-950/60 to-slate-950/80 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-mono text-xs font-black text-amber-300 tracking-wider uppercase">
                    APP STORE: ERWEITERUNGEN & PROFI-MODULE
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  Einsatzbereite Module mit 1 Klick starten
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">VIDEO STUDIO</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Veo 3.1 8K Video Director</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Kinematische Videogenerierung mit N.E.O. für Werbespots, Social Media Clips und 3D-Animationen.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">LIVE CODING</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">Claude Code Autonomous Terminal</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Autonomes Entwickler-Terminal mit direkter Dateisystem- und Shell-Ausführung für Full-Stack Apps.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">FINANZEN</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">DeGen Crypto & Market Radar</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Live-Marktdaten, Tokenomics-Scans und Liquiditätswarnungen mit O.R.A.C.L.E.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">CONTENT</span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">TikTok & IG Creator Engine</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Virale Hooks, Captions und automatische Social-Media-Kampagnen mit P.U.L.S.E.
                    </p>
                  </div>
                </div>

                {onOpenAppStore && (
                  <div className="mt-4 pt-3 border-t border-amber-500/30 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onOpenAppStore();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{lang === "en" ? "Open App Store now" : "App Store jetzt öffnen"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: NANO BANANA PHOTO STUDIO */}
          {activeTab === "nano_banana" && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/70 via-amber-950/50 to-slate-950/80 border-2 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                <div className="flex items-center gap-2 mb-1">
                  <Camera className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span className="font-mono text-xs font-black text-rose-300 tracking-wider uppercase">
                    🍌 NANO BANANA AI PHOTO STUDIO & CREATOR
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">
                  {lang === "en"
                    ? "Generate & Edit High-End Photorealistic Imagery & Holograms"
                    : "Fotorealistische Bildgenerierung, Retusche & Hologramm-Design mit Imagen 3.0 & N.E.O."}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Nano Banana is the native AI Photo Editor & Creator integrated into S.Y.N.T.A.X. Focus Canvas. Create 4K visuals, cyberpunk artwork, marketing renders, or edit existing photos with instant AI style transfer, object inpainting, and lighting presets."
                    : "Nano Banana ist der native KI-Foto-Editor & Creator im S.Y.N.T.A.X. Focus Canvas. Erstellen Sie 4K-Bilder, Cyberpunk-Art, Marketing-Grafiken oder bearbeiten Sie Fotos mit KI-Stiltransfer, Inpainting und Beleuchtungs-Presets."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/40">
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">
                      {lang === "en" ? "FEATURE 1" : "FUNKTION 1"}
                    </span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">
                      {lang === "en" ? "4K Image Generation" : "4K Text-zu-Bild Generierung"}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {lang === "en"
                        ? "Generate high-resolution photorealistic imagery using Imagen 3.0 and Gemini multimodal vision."
                        : "Erstellen Sie hochauflösende fotorealistische Bilder mit Imagen 3.0 und Gemini Multimodal Vision."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/40">
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">
                      {lang === "en" ? "FEATURE 2" : "FUNKTION 2"}
                    </span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">
                      {lang === "en" ? "AI Photo Retouching & Inpainting" : "KI-Retusche & Bearbeitung"}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {lang === "en"
                        ? "Upload photos, adjust lighting, replace backgrounds, remove elements, and enhance sharpness."
                        : "Fotos hochladen, Beleuchtung korrigieren, Hintergründe austauschen oder Objekte per Prompts verändern."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/40">
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">
                      {lang === "en" ? "FEATURE 3" : "FUNKTION 3"}
                    </span>
                    <h4 className="font-mono font-bold text-white text-sm mt-0.5">
                      {lang === "en" ? "Direct Chat Commands" : "Direkte Chat-Befehle"}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {lang === "en"
                        ? "Type '/image' or 'Create an image of...' directly in chat to invoke Nano Banana autonomously."
                        : "Tippen Sie '/image' oder 'Erstelle ein Bild von...' im Chat, um Nano Banana sofort zu starten."}
                    </p>
                  </div>
                </div>

                {onOpenNanoBanana && (
                  <div className="mt-4 pt-3 border-t border-rose-500/30 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onOpenNanoBanana();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>🍌 {lang === "en" ? "Open Nano Banana Studio Now" : "Nano Banana Photo Studio jetzt öffnen"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
