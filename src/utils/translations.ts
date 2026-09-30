export type Language = "de" | "en";

export interface TourStepTranslation {
  id: string;
  title: string;
  badge: string;
  category: string;
  description: string;
  spokenText: string;
  actionTip: string;
}

export const TRANSLATIONS = {
  de: {
    // Common / Global
    common: {
      langSwitch: "Sprache: Deutsch (Klicken für English)",
      close: "Schließen",
      open: "Öffnen",
      save: "Speichern",
      cancel: "Abbrechen",
      back: "Zurück",
      next: "Weiter",
      start: "Starten",
      active: "Aktiv",
      online: "Online",
      offline: "Offline",
      status: "Status",
      settings: "Einstellungen",
      tutorial: "Einweisung / Tutorial",
      apps: "App Store",
      calendar: "Kalender & Chronos",
      chat: "Chat & Flotte",
      layout: "Workspace Layout",
      copy: "Kopieren",
      copied: "Kopiert!",
      delete: "Löschen",
      download: "Herunterladen",
      search: "Suchen...",
      filter: "Filter",
      preview: "Vorschau",
      live: "LIVE",
      beta: "PRO",
    },
    // Top Nav / Rail
    nav: {
      toggleVoice: "Sprachausgabe umschalten",
      workspaceLayout: "Workspace Layout anpassen (VisionOS)",
      appStore: "App Store & Tools öffnen",
      calendar: "Google Calendar & Chronos Terminplaner",
      photoStudio: "Nano Banana Photo Editor & Hologram Creator",
      gmail: "Gmail Inbox & Mail Automation",
      googleMaps: "Google Maps 3D Navigator",
      veoStudio: "Google Veo 3.1 8K Video Studio",
      claudeCode: "Lovable Fullstack Engine & Cloud IDE",
      tutorialBtn: "System-Einweisung & Tutorial",
      roleManager: "RBAC Rollen-Manager & Access Tiers",
      settingsBtn: "Gemini API-Key & System-Settings",
      languageToggle: "Sprache auf Englisch umschalten",
    },
    // Nano Banana Photo Editor & Creator
    nanoBanana: {
      title: "NANO BANANA FOTO-EDITOR & CREATOR",
      badge: "IMAGEN 3.0 • 4K QUANTUM ENGINE",
      subtitle: "Fotorealistische Bildgenerierung, Retusche, Prompt-to-Holo & 3D Spatial Canvas",
      description: "Nano Banana ist das integrierte Profi-Fotostudio von S.Y.N.T.A.X. & N.E.O. Nutzen Sie Google Imagen 3.0 für fotorealistische 4K-Bilder, Inpainting, KI-Retuschen und direkte 3D-Hologramm-Projektionen im Raum.",
      feature1Title: "Imagen 3.0 4K Ultra-Realismus",
      feature1Desc: "Erzeugt lebensechte Fotos, Renderings, UI-Konzepte und futuristische Visualisierungen mit mikroskopischer Detailtreue.",
      feature2Title: "Inpainting, Retusche & Style-Transfer",
      feature2Desc: "Laden Sie vorhandene Bilder hoch, entfernen Sie Elemente oder transformieren Sie Stile durch präzise Textprompts.",
      feature3Title: "3D Hologramm & Veo 3.1 Video Bridge",
      feature3Desc: "Jedes Bild kann direkt als interaktives 3D-Hologramm projiziert und mit 1 Klick in ein 8K Veo-Video animiert werden.",
      openCreator: "Nano Banana Foto-Creator jetzt starten",
      openGallery: "Foto & Hologramm-Galerie ansehen",
      samplePrompt1: "Cyberpunk Wolkenkratzer in Tokio bei Nacht mit Neon-Regen im 4K Cinema-Stil",
      samplePrompt2: "Hyperrealistisches Hologramm-Interface im VisionOS Stil mit leuchtenden Partikeln",
      samplePrompt3: "Luxuriöses Sportwagen-Konzept mit glänzenden Reflexionen im Studio-Licht",
      samplePrompt4: "Futuristische Cyber-City Skyline mit schwebenden Verkehrs-Drohnen",
    },
    // Tour / Tutorial
    tutorial: {
      modalTitle: "SYSTEM-EINWEISUNG & MASTER TUTORIAL",
      modalSubtitle: "Interaktive Tour, Daily Objectives, Token-Übersicht & Agenten-Lexikon",
      step: "SCHRITT",
      of: "VON",
      audioPlaying: "SPRACHAUSGABE LÄUFT...",
      playAudio: "ERKLÄRUNG ANHÖREN",
      autoTourActive: "AUTO-TOUR AKTIV",
      autoTour: "AUTO-TOUR (6S)",
      featureDirect: "FEATURES DIREKT ANWÄHLEN:",
      toFullGuide: "Zum Full Guide Lexikon",
      tabs: {
        tour: "TOUR STARTEN",
        todaysUsage: "📊 TODAY'S USAGE & TOKENS",
        allHubs: "🪐 DIE 4 SYSTEM-HUBS",
        allAgents: "ALLE 8 AGENTEN",
        big3VsAll: "THE BIG 3 VS. 8 AGENTEN",
        nanoBanana: "🍌 NANO BANANA FOTO-STUDIO",
        limits: "QUOTEN & BEGRENZUNG",
        chat: "💬 CHAT ÖFFNEN",
        calendar: "📅 KALENDER & CHRONOS",
        gmail: "GMAIL CLIENT",
        screenshare: "SCREEN SHARE (VISION)",
        layout: "VISIONOS LAYOUT",
        apps: "APP STORE & TOOLS",
      },
    },
    // Command Dashboard
    dashboard: {
      inputPlaceholder: "Befehl an S.Y.N.T.A.X. oder Flotte eingeben... (oder '/image' für Nano Banana)",
      scopeSingle: "EINZEL-AGENT",
      scopeBig3: "THE BIG 3 (TRI-CORE)",
      scopeAll: "ALLE 8 AGENTEN (OMNI)",
      micStart: "Sprachsteuerung starten",
      micStop: "Mikrofon stoppen",
      send: "Senden",
      photoMode: "Foto- & Hologramm-Modus",
      attachImage: "Bildvorlage anhängen",
      gallery: "Galerie",
    },
    // Calendar
    calendar: {
      title: "CHRONOS KALENDER & TERMINPLANER",
      syncStatus: "GOOGLE WORKSPACE SYNC AKTIV",
      addEvent: "Neuer Termin",
      today: "Heute",
      month: "Monat",
      week: "Woche",
      day: "Tag",
      categories: {
        all: "Alle Kategorien",
        work: "Arbeit",
        meeting: "Meetings",
        ai: "AI & System",
        personal: "Persönlich",
      },
    },
    // App Store
    appStore: {
      title: "S.Y.N.T.A.X. SPATIAL APP STORE & WIDGET HUB",
      subtitle: "Autonome Werkzeuge, Google Workspace Module & Third-Party Integrationen",
      launch: "Starten",
      installed: "Bereit",
      categories: {
        all: "Alle Apps",
        aiMedia: "AI Media & Creation",
        workspace: "Google Workspace & Productivity",
        developer: "Developer & Terminal",
        social: "Social & Automation",
      },
    },
  },
  en: {
    // Common / Global
    common: {
      langSwitch: "Language: English (Click for German)",
      close: "Close",
      open: "Open",
      save: "Save",
      cancel: "Cancel",
      back: "Back",
      next: "Next",
      start: "Start",
      active: "Active",
      online: "Online",
      offline: "Offline",
      status: "Status",
      settings: "Settings",
      tutorial: "1-Minute Tutorial",
      apps: "App Store",
      calendar: "Calendar & Chronos",
      chat: "Chat & Fleet",
      layout: "Workspace Layout",
      copy: "Copy",
      copied: "Copied!",
      delete: "Delete",
      download: "Download",
      search: "Search...",
      filter: "Filter",
      preview: "Preview",
      live: "LIVE",
      beta: "PRO",
    },
    // Top Nav / Rail
    nav: {
      toggleVoice: "Toggle Voice Output",
      workspaceLayout: "Customize Workspace Layout (VisionOS)",
      appStore: "Open App Store & Tools Hub",
      calendar: "Google Calendar & Chronos Scheduler",
      photoStudio: "Nano Banana Photo Editor & Hologram Creator",
      gmail: "Gmail Inbox & Mail Automation",
      googleMaps: "Google Maps 3D Navigator",
      veoStudio: "Google Veo 3.1 8K Video Studio",
      claudeCode: "Claude Code Cloud Terminal",
      tutorialBtn: "1-Minute Tutorial & System Briefing",
      roleManager: "RBAC Role Manager & Access Tiers",
      settingsBtn: "Gemini API-Key & System Settings",
      languageToggle: "Switch Language to German",
    },
    // Nano Banana Photo Editor & Creator
    nanoBanana: {
      title: "NANO BANANA PHOTO EDITOR & CREATOR",
      badge: "IMAGEN 3.0 • 4K QUANTUM ENGINE",
      subtitle: "Photorealistic Image Generation, Retouching, Prompt-to-Holo & 3D Spatial Canvas",
      description: "Nano Banana is the integrated professional photo studio of S.Y.N.T.A.X. & N.E.O. Harness Google Imagen 3.0 for photorealistic 4K image creation, inpainting, AI retouching, and direct 3D spatial hologram projections.",
      feature1Title: "Imagen 3.0 4K Ultra-Realism",
      feature1Desc: "Generates lifelike photos, futuristic renderings, UI concepts, and artworks with microscopic fidelity.",
      feature2Title: "Inpainting, Retouching & Style Transfer",
      feature2Desc: "Upload existing images, edit components, or transform styles through precision natural language prompts.",
      feature3Title: "3D Hologram & Veo 3.1 Video Bridge",
      feature3Desc: "Every generated image can be projected as an interactive 3D spatial hologram and animated to 8K Veo video with 1 click.",
      openCreator: "Launch Nano Banana Photo Creator",
      openGallery: "View Photo & Hologram Gallery",
      samplePrompt1: "Cyberpunk skyscraper in Tokyo at night with glowing neon rain in 4K cinema style",
      samplePrompt2: "Hyperrealistic hologram interface in VisionOS style with floating particles",
      samplePrompt3: "Luxury supercar concept with metallic reflections in high-end studio lighting",
    },
    // Tour / Tutorial
    tutorial: {
      modalTitle: "SYSTEM BRIEFING & MASTER TUTORIAL",
      modalSubtitle: "Interactive Tour, Daily Objectives, Token Telemetry & Agent Lexicon",
      step: "STEP",
      of: "OF",
      audioPlaying: "VOICE BRIEFING PLAYING...",
      playAudio: "LISTEN TO BRIEFING",
      autoTourActive: "AUTO-TOUR ACTIVE",
      autoTour: "AUTO-TOUR (6S)",
      featureDirect: "JUMP DIRECTLY TO FEATURE:",
      toFullGuide: "Open Full Guide Lexicon",
      tabs: {
        tour: "START TOUR",
        todaysUsage: "📊 TOKEN OVERVIEW & REQUESTS",
        dailyObjectives: "🎯 DAILY OBJECTIVES & STREAKS",
        allHubs: "🪐 4 SPATIAL HUBS",
        allAgents: "ALL 8 AGENTS",
        big3VsAll: "THE BIG 3 VS. 8 AGENTS",
        nanoBanana: "🍌 NANO BANANA PHOTO STUDIO",
        limits: "QUOTAS & LIMITS",
        chat: "💬 OPEN CHAT",
        calendar: "📅 CALENDAR & CHRONOS",
        gmail: "GMAIL CLIENT",
        screenshare: "SCREEN SHARE (VISION)",
        layout: "VISIONOS LAYOUT",
        apps: "APP STORE & TOOLS",
      },
    },
    // Command Dashboard
    dashboard: {
      inputPlaceholder: "Enter command for S.Y.N.T.A.X. or Fleet... (or '/image' for Nano Banana)",
      scopeSingle: "SINGLE AGENT",
      scopeBig3: "THE BIG 3 (TRI-CORE)",
      scopeAll: "ALL 8 AGENTS (OMNI)",
      micStart: "Start Voice Recognition",
      micStop: "Stop Microphone",
      send: "Send",
      photoMode: "Photo & Hologram Mode",
      attachImage: "Attach Reference Image",
      gallery: "Gallery",
    },
    // Calendar
    calendar: {
      title: "CHRONOS CALENDAR & SCHEDULER",
      syncStatus: "GOOGLE WORKSPACE SYNC ACTIVE",
      addEvent: "New Event",
      today: "Today",
      month: "Month",
      week: "Week",
      day: "Day",
      categories: {
        all: "All Categories",
        work: "Work",
        meeting: "Meetings",
        ai: "AI & System",
        personal: "Personal",
      },
    },
    // App Store
    appStore: {
      title: "S.Y.N.T.A.X. SPATIAL APP STORE & WIDGET HUB",
      subtitle: "Autonomous Tools, Google Workspace Modules & Third-Party Integrations",
      launch: "Launch",
      installed: "Ready",
      categories: {
        all: "All Apps",
        aiMedia: "AI Media & Creation",
        workspace: "Google Workspace & Productivity",
        developer: "Developer & Terminal",
        social: "Social & Automation",
      },
    },
  },
};

export const TOUR_STEPS_EN: TourStepTranslation[] = [
  {
    id: "welcome-focus-canvas",
    title: "👑 WELCOME TO THE S.Y.N.T.A.X. FOCUS CANVAS, MR",
    badge: "SYSTEM BRIEFING & MASTER TUTORIAL",
    category: "YOUR SECOND BRAIN WORKSPACE",
    description:
      "Welcome to your operational command center! The Focus Canvas unifies all 8 autonomous specialist cores, real-time screen perception, Lovable Fullstack Engine, Daily Objectives, full Token Telemetry, and Google Workspace tools. In this tutorial, we will walk you through the core workflows and natural voice commands.",
    spokenText:
      "Welcome to the Focus Canvas, Mr! Let us explore the essential tools, Daily Objectives, Queries Inspector, and natural voice commands designed for maximum productivity.",
    actionTip: "Voice command: 'Start interactive tour' or click 'NEXT'.",
  },
  {
    id: "top-command-hub",
    title: "1. TOP COMMAND BAR (VOICE COMMAND: 'SWITCH TO THE BIG 3')",
    badge: "CENTRAL COMMAND MATRIX",
    category: "TOP CONTROL HEADER",
    description:
      "The Top Command Bar houses the core scopes: '👤 SINGLE' (1x Tokens), '⚡ AGENT-SYNC', '👑 THE BIG 3' (3x Multiplier), and '🌐 ALL (8)' (8x Swarm). It also features the live voice diagnostic pill, live conference, quick hubs dropdown, and real-time clock.",
    spokenText:
      "The top command bar is your master header with communication scopes, voice diagnostics, quick hubs dropdown, and live clock.",
    actionTip: "Voice commands: 'Activate The Big 3', 'Activate all 8 cores', 'Switch to Single agent'.",
  },
  {
    id: "todays-usage-telemetry",
    title: "2. TOP BAR: TOKEN OVERVIEW & LIVE REQUEST LOGS (VOICE COMMAND: 'SHOW DAILY USAGE')",
    badge: "🔥 LIVE TOKEN TELEMETRY & REQUESTS",
    category: "REAL-TIME TELEMETRY",
    description:
      "The 'TODAY'S USAGE' widget in the top right tracks token consumption in real time (prompt input + completion output) as well as each live request with latency and model info. Quotas refresh automatically every 24 hours at 00:00 UTC. Click the widget anytime to open the full Daily Usage Analytics Dashboard!",
    spokenText:
      "Today's Usage tracks your daily token consumption and each live request in real time. It automatically resets every 24 hours at 00:00 UTC.",
    actionTip: "Voice commands: 'Open Daily Usage', 'Show token consumption', 'Check request quota'.",
  },
  {
    id: "daily-objectives-step",
    title: "3. DAILY OBJECTIVES, STREAKS & QUOTA BONUSES (VOICE COMMAND: 'SHOW DAILY OBJECTIVES')",
    badge: "🎯 DAILY OBJECTIVES & XP MATRIX",
    category: "PRODUCTIVITY & XP",
    description:
      "Daily Objectives motivate your workflow with 4 daily missions, streaks (consecutive days), and XP progression. Completing all missions unlocks up to +50,000 bonus tokens to maximize your productivity!",
    spokenText:
      "With Daily Objectives and Streaks, you unlock daily bonus tokens and keep your productivity on top.",
    actionTip: "Voice commands: 'Show Daily Objectives', 'What are my daily missions?', 'Check streak status'.",
  },
  {
    id: "queries-inspector",
    title: "4. QUERIES & PROMPTS INSPECTOR (VOICE COMMAND: 'OPEN QUERIES')",
    badge: "📊 LIVE PROMPT & LATENCY TELEMETRY",
    category: "TELEMETRY & QUERY LOGS",
    description:
      "The new 'QUERIES' button in the top bar opens the comprehensive Query & Prompt Inspector. Review prompt input tokens, output tokens, exact latency (e.g. 240 ms), model tiers (Gemini 2.5 Flash/Pro), and export detailed telemetry logs as CSV/JSON.",
    spokenText:
      "The Queries button gives you 100% transparency into every single AI calculation, prompt latencies, and token costs.",
    actionTip: "Voice commands: 'Open Queries', 'Show Prompts', 'Open Agent Logs', 'Check latency'.",
  },
  {
    id: "quota-cost-warning",
    title: "5. QUOTAS & API LOAD MULTIPLIERS (VOICE COMMAND: 'SET REASONING TO TURBO')",
    badge: "⚠️ 1x, 3x & 8x TOKEN CONTROLLER",
    category: "EFFICIENCY & BUDGETING",
    description:
      "The API LOAD gauge monitors your tier quota. Remember: 'SINGLE' uses 1x tokens, 'THE BIG 3' uses 3x tokens, and 'ALL (8)' uses 8x tokens. Use Single agent mode for routine tasks to conserve your allowance, or connect your own Gemini API key for unlimited capacity.",
    spokenText:
      "The API load gauge monitors your quota. Single mode consumes one token multiplier, The Big 3 consumes three times, and All 8 consumes eight times.",
    actionTip: "Golden Rule: Resolve 90% of tasks in Single mode, activating ALL and BIG 3 for high-impact multi-core swarms.",
  },
  {
    id: "agent-switching",
    title: "6. BOTTOM BAR: MATRIX HUB (VOICE COMMAND: 'SWITCH TO VEGA')",
    badge: "8 SPECIALIZED CORES",
    category: "LOWER COMMAND DOCK",
    description:
      "Right down here in the floating Matrix Hub dock (below the 3D core sphere), you can switch between agents (S, N, V, O, P, C, R, G) with a single click. Each letter instantly activates that specialist core with zero latency.",
    spokenText:
      "In the Matrix Hub dock at the bottom, click any letter to instantly switch between all eight specialist agents.",
    actionTip: "Voice commands: 'Switch to Syntax', 'Activate Neo', 'Talk with Vega', 'Switch to Chronos'.",
  },
  {
    id: "the-big-3",
    title: "7. THE BIG 3 (TRI-CORE POWERHOUSE: SYNTAX • NEO • VEGA)",
    badge: "👑 TRI-CORE SYNCHRONOUS MATRIX",
    category: "TRI-CORE POWERHOUSE",
    description:
      "At the top left next to the agent name, click '👑 THE BIG 3' to harness the three powerhouse cores: SYNTAX (Master Dispatcher), NEO (Frontend & Holograms), and VEGA (Quantum Logic & Code Architecture) simultaneously.",
    spokenText:
      "The Big Three switch unifies Syntax, Neo, and Vega for synchronized parallel computing.",
    actionTip: "Voice command: 'Activate The Big 3' to run architecture, frontend, and quantum logic in parallel.",
  },
  {
    id: "all-8-overview",
    title: "8. ALL 8 FLEET SWARM (VOICE COMMAND: 'ACTIVATE ALL 8 CORES')",
    badge: "COMPLETE EXPERT SWARM",
    category: "ALL 8 FLEET CORES",
    description:
      "Activating '🌐 ALL (8)' broadcasts your request to the entire eight-agent squadron: Master Architecture, Video Production, Data, Cybersecurity, Social Media, Time Management, Financial Markets, and Deep Web Research.",
    spokenText:
      "With All Eight, you dispatch tasks across your entire fleet simultaneously from market trading to web research.",
    actionTip: "Voice command: 'Activate all 8 cores' or 'Start swarm consensus'.",
  },
  {
    id: "agent-fleet-studio",
    title: "9. AGENT FLEET STUDIO // 9-CORE MATRIX (VOICE COMMAND: 'OPEN FLEET STUDIO')",
    badge: "MULTI-CORE BENCHMARK & TESTER",
    category: "FLEET BENCHMARK & SIMULATION",
    description:
      "The Agent Fleet Studio provides an interactive testing matrix for all 9 cores simultaneously. Run instant latency benchmarks, consensus tests, and stress tests across the entire fleet.",
    spokenText:
      "In Agent Fleet Studio, benchmark and stress-test all nine cores simultaneously in real time.",
    actionTip: "Voice commands: 'Open Fleet Studio', 'Show all 9 cores', 'Start fleet benchmark'.",
  },
  {
    id: "voice-conference-step",
    title: "10. 8-CORE LIVE VOICE CONFERENCE (VOICE COMMAND: 'START VOICE CONFERENCE')",
    badge: "AUDIO ROUNDTABLE & LIVE DISCUSSION",
    category: "SYNCHRONOUS AUDIO DISCUSSIONS",
    description:
      "The synchronous Voice Conference allows all 8 specialist cores to enter a live audio roundtable. Listen as the AI agents debate architectural trade-offs, code optimizations, and strategy with distinct voices in real time.",
    spokenText:
      "In the live Voice Conference, all eight cores discuss complex questions collaboratively in a real audio roundtable.",
    actionTip: "Voice commands: 'Start voice conference', 'Begin audio roundtable', 'Debate system architecture'.",
  },
  {
    id: "screen-perception",
    title: "11. MONITOR PERCEPTION & VISION AI (VOICE COMMAND: 'START SCREEN PERCEPTION')",
    badge: "AUTONOMOUS VISION AI",
    category: "REAL-TIME SCREEN PERCEPTION",
    description:
      "With Monitor Perception (in the top bar or via HUD), the fleet watches your screens live. Your code, documents, charts, or browser windows are analyzed autonomously in the background without needing manual screenshots.",
    spokenText:
      "With Monitor Perception enabled, the Vision AI watches your screens live and assists with debugging and workflows in real time.",
    actionTip: "Voice commands: 'Start Screen Perception', 'Analyze my screen', 'Help debug current code'.",
  },
  {
    id: "terminal-code",
    title: "12. LOVABLE FULLSTACK ENGINE & COMPUTE MODES (VOICE COMMAND: 'OPEN TERMINAL')",
    badge: "HYBRID CLOUD CLI",
    category: "TERMINAL & COMPUTE SETTINGS",
    description:
      "The purple Terminal icon on the left dock opens Lovable Fullstack Engine for bash, git, and TypeScript automation. You can also adjust agent reasoning power between 'ECO' (compact), 'BALANCED' (optimal), and 'TURBO' (deep reasoning).",
    spokenText:
      "The purple Terminal icon opens Lovable Fullstack Engine and lets you customize reasoning depth between Eco, Balanced, and Turbo.",
    actionTip: "Voice commands: 'Open Terminal', 'Set compute power to Turbo', 'Set compute power to Eco'.",
  },
  {
    id: "veo3-studio",
    title: "13. GOOGLE VEO 3.1 8K AI VIDEO STUDIO (VOICE COMMAND: 'OPEN VEO STUDIO')",
    badge: "8K CINEMATIC VIDEO",
    category: "VEO 3.1 STUDIO",
    description:
      "The pink video camera icon in the left nav-rail opens Google Veo 3.1. Generate breathtaking 8K cinematic videos and motion animations from text prompts or still images with precise camera controls.",
    spokenText:
      "The pink video icon launches the Google Veo 3.1 Studio for generating ultra high definition 8K video scenes.",
    actionTip: "Voice commands: 'Open Veo Studio', 'Generate an 8K video of a sports car', 'Start video rendering'.",
  },
  {
    id: "nano-banana-photo-creator",
    title: "14. NANO BANANA FOTO-EDITOR & IMAGEN 3.0 (VOICE COMMAND: 'START NANO BANANA')",
    badge: "4K FOTO STUDIO & 3D HOLOGRAM",
    category: "PHOTO CREATION & RETOUCHING",
    description:
      "Nano Banana is the integrated creative photo studio powered by Google Imagen 3.0 & N.E.O. Generate photorealistic 4K imagery, perform AI inpainting, retouching, style transfers, and project interactive 3D holograms directly from chat prompts.",
    spokenText:
      "With Nano Banana, craft photorealistic 4K images, perform AI retouching, and project 3D spatial holograms using Imagen 3.0.",
    actionTip: "Voice commands: 'Create an image of a futuristic skyline', 'Start Nano Banana', 'Generate 4K hologram'.",
  },
  {
    id: "google-maps",
    title: "15. GOOGLE MAPS (VOICE COMMAND: 'SHOW A MAP OF BERLIN')",
    badge: "VOICE & SYSTEM PROJECTION",
    category: "GEOSPATIAL INTELLIGENCE",
    description:
      "Google Maps opens strictly on explicit voice command or manual click! Say 'Show me a map of Berlin' or 'Project a map of Tokyo onto the display'. Maps will never trigger accidentally on general location queries.",
    spokenText:
      "Google Maps is connected to your voice commands and opens only on explicit requests like: Show me a map of Berlin or Project Tokyo on the display.",
    actionTip: "Voice examples: 'Show me a map of Paris', 'Project map of Rome' or 'Route from Munich to Vienna'.",
  },
  {
    id: "gmail-assistant",
    title: "16. GMAIL CLIENT (VOICE COMMAND: 'SHOW MY LATEST EMAILS')",
    badge: "VOICE INTEGRATION & SYNC",
    category: "EMAIL AUTOMATION",
    description:
      "Your Gmail inbox is fully voice-enabled! Say 'Show me my latest emails'. If your Gmail API is not yet linked, the agent tells you verbally and guides you to Google Workspace authorization immediately.",
    spokenText:
      "Say Show me my latest emails. If your Gmail integration is not yet connected, the agent announces it aloud and opens the connection dialog.",
    actionTip: "Voice commands: 'Show me my latest emails', 'Read inbox', 'Reply to last email'.",
  },
  {
    id: "agent-chat-toggle",
    title: "17. AGENT CHAT & FLEET DELEGATION MATRIX (VOICE COMMAND: 'OPEN CHAT')",
    badge: "FLEET MATRIX & DEEP DIVE",
    category: "AGENT COMMUNICATION",
    description:
      "Toggle the right chat sidebar to open the live console. Inspect the Fleet Delegation Matrix, view transparent reasoning steps (Chain of Thought), explore structured Deep Dive table analyses, and monitor the live observer stream.",
    spokenText:
      "On the right, toggle the chat console to view the Fleet Delegation Matrix, thought chains, and deep dive table analyses.",
    actionTip: "Voice commands: 'Open chat', 'Close chat', 'Show Deep Dive analysis', 'Expand thought chain'.",
  },
  {
    id: "visionos-layout",
    title: "18. VISIONOS SPATIAL LAYOUT (VOICE COMMAND: 'OPEN LAYOUT EDITOR')",
    badge: "SPATIAL 3D WIDGETS",
    category: "CUSTOM DASHBOARD",
    description:
      "Click 'LAYOUT' in the top right or the grid icon in the left rail to enter the Spatial Layout Editor. Drag, resize, float, or snap widgets in 3D space, and select tailored presets like CODER or TRADER.",
    spokenText:
      "The Layout button opens the VisionOS Spatial Editor so you can freely position, resize, and arrange your windows.",
    actionTip: "Voice commands: 'Open layout editor', 'Switch to Coder layout', 'Reset window layout'.",
  },
  {
    id: "calendar-integration",
    title: "19. GOOGLE CALENDAR & CHRONOS (VOICE COMMAND: 'SCHEDULE MEETING TOMORROW AT 2 PM')",
    badge: "GOOGLE WORKSPACE SYNC",
    category: "CALENDAR & TIME MANAGEMENT",
    description:
      "Synchronize your meetings, deadlines, and project schedules with Chronos and Google Calendar. S.Y.N.T.A.X. schedules events from voice commands, sets reminders, and prepares morning agendas.",
    spokenText:
      "Chronos schedules appointments and synchronizes with Google Calendar automatically from natural voice commands.",
    actionTip: "Voice commands: 'Schedule a strategy session tomorrow at 2 PM', 'Show upcoming events', 'Open calendar'.",
  },
  {
    id: "app-store",
    title: "20. SPATIAL APP STORE & TOOL HUB (VOICE COMMAND: 'OPEN APP STORE')",
    badge: "QUANTUM TOOLKIT",
    category: "SYSTEM EXTENSIONS",
    description:
      "The yellow lightning bolt in the left rail opens the App Store. Discover integrations for Google Calendar, Google Maps, Veo 3.1, Claude Code Terminal, Stripe, Discord, Shopify, GitHub, and more.",
    spokenText:
      "The yellow lightning icon opens the App Store with Google Workspace tools, terminals, and ecosystem integrations.",
    actionTip: "Voice commands: 'Open App Store', 'Show extensions', 'Install integrations'.",
  },
  {
    id: "user-terminal-crypto",
    title: "21. USER TERMINAL & CRYPTO PAYMENTS (VOICE COMMAND: 'OPEN USER TERMINAL')",
    badge: "ACCOUNT & 20% CRYPTO DISCOUNT",
    category: "BILLING & MEMBERSHIP",
    description:
      "Manage your active subscription (29 €/mo Operator or 99 €/mo Sovereign) in the User Account Terminal. Pay with Credit Card, PayPal, or Crypto (SOL @ 67.12 €, ETH, BTC) with an automatic 20% discount!",
    spokenText:
      "Access your User Account Terminal to manage subscriptions, invoices, and receive a 20 percent discount when paying with Solana, Ethereum, or Bitcoin.",
    actionTip: "Voice commands: 'Open User Terminal', 'Show invoices', 'Upgrade subscription with crypto'.",
  },
];
