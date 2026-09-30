import React, { useState } from "react";
import {
  Cpu,
  Zap,
  Play,
  Terminal,
  Video,
  Mail,
  Share2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Send,
  Layers,
  Code2,
  Eye,
  BarChart3,
  Bot,
  ExternalLink,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface SalePageLiveCapabilitiesShowcaseProps {
  lang?: "de" | "en";
  onOpenApp?: () => void;
  onRegisterClick?: () => void;
}

export const SalePageLiveCapabilitiesShowcase: React.FC<SalePageLiveCapabilitiesShowcaseProps> = ({
  lang = "de",
  onOpenApp,
  onRegisterClick,
}) => {
  // Active feature tab for interactive live demonstrations
  const [activeTab, setActiveTab] = useState<
    "fleet" | "video" | "code" | "gmail" | "social" | "market" | "security"
  >("fleet");

  // State for interactive live prompt playground
  const [promptInput, setPromptInput] = useState<string>(
    lang === "de"
      ? "Erstelle eine B2B Kaltakquise-Kampagne mit viralem TikTok Hook und Follow-Up E-Mail"
      : "Create a B2B cold outreach campaign with viral TikTok hook and follow-up email"
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  // Quick prompt suggestions
  const QUICK_PROMPTS = [
    {
      label: lang === "de" ? "🚀 B2B Launch Kampagne" : "🚀 B2B Launch Campaign",
      prompt:
        lang === "de"
          ? "Erstelle eine B2B Kaltakquise-Kampagne mit viralem TikTok Hook und Follow-Up E-Mail"
          : "Create a B2B cold outreach campaign with viral TikTok hook and follow-up email",
    },
    {
      label: lang === "de" ? "🎬 Veo 3.1 Video-Trailer" : "🎬 Veo 3.1 Video Trailer",
      prompt:
        lang === "de"
          ? "Plane einen 15s kinoreifen 8K Cyberpunk Teaser mit Drohnenflug und Neon-Reflexionen"
          : "Plan a 15s cinematic 8K cyberpunk teaser with drone shot and neon reflections",
    },
    {
      label: lang === "de" ? "💻 React & API Backend" : "💻 React & API Backend",
      prompt:
        lang === "de"
          ? "Schreibe einen vollständigen Express API Endpunkt mit Stripe Webhook & JWT Token Auth"
          : "Write a complete Express API endpoint with Stripe webhook & JWT token auth",
    },
    {
      label: lang === "de" ? "📊 Krypto & Markt-Setup" : "📊 Crypto & Market Setup",
      prompt:
        lang === "de"
          ? "Berechne ein Swing-Trade Setup für Bitcoin mit RSI-Divergenz und Stop-Loss Level"
          : "Calculate a Bitcoin swing trade setup with RSI divergence and stop-loss level",
    },
  ];

  const handleSimulatePrompt = (targetPrompt?: string) => {
    const textToRun = targetPrompt || promptInput;
    setIsSimulating(true);
    setSimulatedOutput(null);

    setTimeout(() => {
      setIsSimulating(false);
      if (textToRun.toLowerCase().includes("video") || textToRun.toLowerCase().includes("teaser") || textToRun.toLowerCase().includes("veo")) {
        setSimulatedOutput(
          lang === "de"
            ? `[VEO 3.1 NEURAL PROMPT GENERATED]\n\nSCENE 1 (00:00 - 00:05): Cinematic FPV drone dive through dense rain-soaked cyberpunk metropolis. Hyper-realistic reflections, anamorphic lens flares, volumetric fog. 8K ProRes 422 HQ.\n\nPROMPT COMMAND:\n/render aspect:9:16 fps:60 lighting:cyberpunk_neon motion:dynamic_dolly camera:master_shot audio_cues:"bass_drop_subwoofer.wav"\n\n✓ Storyboard gerendert. 3 Sequenzen bereit für 1-Klick Veo 3.1 Render-Pipeline.`
            : `[VEO 3.1 NEURAL PROMPT GENERATED]\n\nSCENE 1 (00:00 - 00:05): Cinematic FPV drone dive through dense rain-soaked cyberpunk metropolis. Hyper-realistic reflections, anamorphic lens flares, volumetric fog. 8K ProRes 422 HQ.\n\nPROMPT COMMAND:\n/render aspect:9:16 fps:60 lighting:cyberpunk_neon motion:dynamic_dolly camera:master_shot audio_cues:"bass_drop_subwoofer.wav"\n\n✓ Storyboard rendered. 3 sequences ready for 1-click Veo 3.1 render pipeline.`
        );
      } else if (textToRun.toLowerCase().includes("code") || textToRun.toLowerCase().includes("express") || textToRun.toLowerCase().includes("react")) {
        setSimulatedOutput(
          lang === "de"
            ? `// [CLAUDE CODE AUTOPILOT - BACKEND ENDPOINT VERIFIED]\nimport express, { Request, Response } from "express";\nimport Stripe from "stripe";\n\nconst router = express.Router();\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });\n\nrouter.post("/api/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {\n  const sig = req.headers["stripe-signature"] as string;\n  try {\n    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);\n    if (event.type === "checkout.session.completed") {\n      await fulfillSubscriptionOrder(event.data.object);\n    }\n    return res.status(200).json({ received: true });\n  } catch (err: any) {\n    return res.status(400).send(\`Webhook Error: \${err.message}\`);\n  }\n});\n\n// Status: Syntax-Audit bestanden (0 Fehler, 0 Warnungen) ✓`
            : `// [CLAUDE CODE AUTOPILOT - BACKEND ENDPOINT VERIFIED]\nimport express, { Request, Response } from "express";\nimport Stripe from "stripe";\n\nconst router = express.Router();\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });\n\nrouter.post("/api/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {\n  const sig = req.headers["stripe-signature"] as string;\n  try {\n    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);\n    if (event.type === "checkout.session.completed") {\n      await fulfillSubscriptionOrder(event.data.object);\n    }\n    return res.status(200).json({ received: true });\n  } catch (err: any) {\n    return res.status(400).send(\`Webhook Error: \${err.message}\`);\n  }\n});\n\n// Status: Code passed linting & tests (0 errors, 0 warnings) ✓`
        );
      } else if (textToRun.toLowerCase().includes("krypto") || textToRun.toLowerCase().includes("crypto") || textToRun.toLowerCase().includes("bitcoin") || textToRun.toLowerCase().includes("markt")) {
        setSimulatedOutput(
          lang === "de"
            ? `[AETHER QUANTUM MARKET INTEL]\n\nASSET: BTC/USDT (4H Timeframe)\n• Aktueller Kurs: $64.280\n• Signal: BULLISH REVERSAL CONFIRMED (Confidence: 89.4%)\n• RSI(14): 38.2 (Bullishe Divergenz im Support-Cluster)\n• 200 EMA Retest erfolgreich verteidigt.\n\nTRADE SETUP:\n→ Einstieg: $63.800 - $64.300\n→ Take Profit 1: $66.500 (+3.5%)\n→ Take Profit 2: $68.900 (+7.2%)\n→ Stop Loss: $62.700 (-2.4%)\n→ Risk/Reward Ratio: 1:3.0`
            : `[AETHER QUANTUM MARKET INTEL]\n\nASSET: BTC/USDT (4H Timeframe)\n• Current Price: $64,280\n• Signal: BULLISH REVERSAL CONFIRMED (Confidence: 89.4%)\n• RSI(14): 38.2 (Bullish divergence on key support cluster)\n• 200 EMA retest cleanly defended.\n\nTRADE SETUP:\n→ Entry Range: $63,800 - $64,300\n→ Take Profit 1: $66,500 (+3.5%)\n→ Take Profit 2: $68,900 (+7.2%)\n→ Stop Loss: $62,700 (-2.4%)\n→ Risk/Reward Ratio: 1:3.0`
        );
      } else {
        setSimulatedOutput(
          lang === "de"
            ? `[HERMES GMAIL + ECHO SOCIAL AUTOPILOT]\n\n1. VIRALER TIKTOK HOOK (Virality Score: 94/100):\n"90% aller Agenturen verschwenden 20 Stunden pro Woche an manuellen E-Mails – hier ist wie unsere KI-Flotte das in 3 Minuten erledigt:"\n\n2. PERSONALISIERTE B2B OUTREACH E-MAIL:\nBetreff: Kurze Frage zu eurer aktuellen Lead-Pipeline bei {{Company}}\n\nHallo {{Vorname}},\nich habe gesehen, dass ihr euer Team in {{City}} skaliert. Oft entsteht dabei der Engpass, dass Kundenanfragen länger als 4 Stunden unberührt im Postfach liegen.\n\nWir haben ein System aufgesetzt, das Kunden-Mails in unter 90 Sekunden qualifiziert und vorformuliert. Hättest du Donnerstag 10 Minuten Zeit für eine kurze Live-Demo?\n\nBeste Grüße,\n[Dein Name] | S.Y.N.T.A.X. Automated Response Core`
            : `[HERMES GMAIL + ECHO SOCIAL AUTOPILOT]\n\n1. VIRAL TIKTOK HOOK (Virality Score: 94/100):\n"90% of agency owners waste 20 hours a week on manual outreach emails – here is how our autonomous AI fleet handles it in 3 minutes:"\n\n2. PERSONALIZED B2B OUTREACH EMAIL:\nSubject: Quick question regarding your lead pipeline at {{Company}}\n\nHi {{FirstName}},\nI noticed you are currently scaling your sales team in {{City}}. Usually, the biggest bottleneck is inquiries sitting in inboxes for over 4 hours.\n\nWe deployed an automated workflow that triages and pre-writes verified replies in under 90 seconds. Would you be open for a quick 10-minute preview this Thursday?\n\nBest,\n[Your Name] | S.Y.N.T.A.X. Automated Response Core`
        );
      }
    }, 600);
  };

  const handleCopy = () => {
    if (!simulatedOutput) return;
    navigator.clipboard.writeText(simulatedOutput);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div className="w-full space-y-12 font-sans" id="capabilities-deepdive-root">
      {/* SECTION HEADER */}
      <div className="text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{lang === "de" ? "ECHTE FÄHIGKEITEN & ANWENDUNGEN" : "REAL CAPABILITIES & DELIVERABLES"}</span>
        </div>

        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          {lang === "de" ? (
            <>
              WAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300">S.Y.N.T.A.X. WIRKLICH KANN</span>:
              <br />
              <span className="text-slate-300 text-lg sm:text-2xl font-light">Echte Workflows statt leerer Marketing-Versprechen</span>
            </>
          ) : (
            <>
              WHAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300">S.Y.N.T.A.X. ACTUALLY DOES</span>:
              <br />
              <span className="text-slate-300 text-lg sm:text-2xl font-light">Real Production Workflows, Not Empty Promises</span>
            </>
          )}
        </h2>

        <p className="text-slate-400 text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed">
          {lang === "de"
            ? "Keine simplen Chat-Antworten. S.Y.N.T.A.X. orchestriert 9 hochspezialisierte KI-Cores gleichzeitig, die eigenständig Code schreiben, Google Workspace steuern, 8K Videos rendern und Social-Media Posts veröffentlichen."
            : "No simple one-line chat prompts. S.Y.N.T.A.X. orchestrates 9 specialized AI cores simultaneously, executing production code, controlling Google Workspace, rendering 8K videos, and publishing viral content autonomously."}
        </p>
      </div>

      {/* INTERACTIVE WORKFLOW DEMONSTRATOR TABS */}
      <div className="bg-[#05091a]/95 border border-cyan-500/30 rounded-3xl p-4 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* TOP WORKFLOW SELECTOR BUTTONS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-800/80">
          {[
            {
              id: "fleet",
              label: lang === "de" ? "Multi-Agent Fleet" : "Multi-Agent Fleet",
              icon: Layers,
              color: "text-cyan-400 border-cyan-500/50 bg-cyan-500/10",
              tag: "SYNTAX + 4 CORES",
            },
            {
              id: "video",
              label: lang === "de" ? "Veo 3.1 Video Studio" : "Veo 3.1 Video Studio",
              icon: Video,
              color: "text-purple-400 border-purple-500/50 bg-purple-500/10",
              tag: "8K MP4 / 9:16",
            },
            {
              id: "code",
              label: lang === "de" ? "Claude Code Terminal" : "Claude Code Terminal",
              icon: Terminal,
              color: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
              tag: "FULL-STACK / GIT",
            },
            {
              id: "gmail",
              label: lang === "de" ? "Gmail Autopilot" : "Gmail Autopilot",
              icon: Mail,
              color: "text-amber-400 border-amber-500/50 bg-amber-500/10",
              tag: "REAL OAUTH2 SYNC",
            },
            {
              id: "social",
              label: lang === "de" ? "TikTok & IG Studio" : "TikTok & IG Studio",
              icon: Share2,
              color: "text-rose-400 border-rose-500/50 bg-rose-500/10",
              tag: "VIRALITY SCORE",
            },
            {
              id: "market",
              label: lang === "de" ? "Aether Quant Intel" : "Aether Quant Intel",
              icon: TrendingUp,
              color: "text-blue-400 border-blue-500/50 bg-blue-500/10",
              tag: "CRYPTO & STOCKS",
            },
            {
              id: "security",
              label: lang === "de" ? "Aegis Zero-Day Auditor" : "Aegis Zero-Day Auditor",
              icon: ShieldCheck,
              color: "text-teal-400 border-teal-500/50 bg-teal-500/10",
              tag: "4096-BIT AUDIT",
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? "bg-slate-900 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${item.color}`}>
                  {item.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* WORKFLOW CONTENT STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: DETAILED CAPABILITY BREAKDOWN (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            {activeTab === "fleet" && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>{lang === "de" ? "Autonome Multi-Agenten Kollaboration" : "Autonomous Multi-Agent Collaboration"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === "de"
                    ? "Ein Befehl aktiviert 4 Spezialisten parallel"
                    : "One Master Prompt Triggers 4 Specialists in Parallel"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {lang === "de"
                    ? "Du musst nicht zwischen 10 verschiedenen KI-Webseiten hin- und herspringen. Wenn du SYNTAX sagst: „Launch unsere Kampagne“, delegiert er in Millisekunden an die richtigen Spezialisten:"
                    : "Stop switching between ten different browser tabs. When you tell SYNTAX: 'Launch our new campaign', it delegates tasks to specialized sub-agents in milliseconds:"}
                </p>

                {/* Step-by-step Execution Pipeline */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#09142e] border border-cyan-500/40 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>SYNTAX Core // Orchestrierung</span>
                        <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.2 rounded">Master</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Zerlegt das Ziel in 4 strukturierte Teilaufgaben und synchronisiert den Kontext im gemeinsamen RAM.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#140b2a] border border-purple-500/40 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>VEO 3.1 & ECHO // Media Pipeline</span>
                        <span className="text-[10px] text-purple-400 bg-purple-500/20 px-1.5 py-0.2 rounded">Visuals</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Veo 3.1 generiert 3 Video-Storyboards, Echo optimiert zeitgleich Hook-Zeilen und Hashtags für TikTok & Instagram.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#091a1a] border border-emerald-500/40 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>HERMES // Gmail & CRM Outreach</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded">E-Mail</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Scannt dein Postfach nach relevanten B2B Leads und formuliert maßgeschneiderte Kaltakquise-Entwürfe in deinem Schreibstil.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1a1708] border border-amber-500/40 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xs shrink-0">
                      4
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>CHRONOS // Google Calendar Scheduler</span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded">Timing</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Blockiert automatische Review-Slots und trägt Lead-Calls synchron in deinen Google Calendar ein.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "video" && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold uppercase">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>{lang === "de" ? "Kinoreifes Video-Studio der nächsten Generation" : "Cinematic Next-Gen Video Studio"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === "de"
                    ? "Veo 3.1: Vom Textprompt zum fertigen 8K Werbevideo"
                    : "Veo 3.1: From Text Prompt to Finished 8K Video Ad"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {lang === "de"
                    ? "Erstelle ohne Videobearbeitungs-Kenntnisse hochkonvertierende Werbeclips, Produkt-Showcases oder Social-Media Reels. Wähle Bildformate (16:9 Cinema, 9:16 Smartphone Vertikal) und präzise Kamerasteuerung."
                    : "Create high-converting ad reels, product showcases, or teasers without video editing skills. Choose aspect ratios (16:9 Cinema, 9:16 Vertical) with precise camera movement controls."}
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30">
                    <div className="text-purple-300 font-bold mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>16:9 & 9:16 Export</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Optimiert für YouTube Widescreen oder TikTok / Instagram Reels.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30">
                    <div className="text-purple-300 font-bold mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Kamera-Regie KI</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Drohnenflug, Macro-Zoom, FPV-Orbit oder statische Studio-Beleuchtung.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30">
                    <div className="text-purple-300 font-bold mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Storyboard Skripte</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Vollständiges Skript mit Sprechtext, Szenen-Timings und Soundeffekten.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30">
                    <div className="text-purple-300 font-bold mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Instant Rendering</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Direkt angebundene Cloud-GPUs für blitzschnelle Erstellung.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold uppercase">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "de" ? "Claude Code Live Terminal & Developer Engine" : "Claude Code Live Terminal & Dev Engine"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === "de"
                    ? "Echte Befehle, echter Code, direkte Fehlerbehebung"
                    : "Real Shell Commands, Production Code, Zero-Lag Debugging"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {lang === "de"
                    ? "Nicht nur Text-Schnipsel: Der integrierte Entwickler-Agent führt Terminal-Befehle aus, durchsucht deine Dateien, schreibt vollständige React/Node/Python-Skripte und testet den Code auf Syntax- und Sicherheitsfehler."
                    : "Not just text snippets: The integrated Claude Code engine executes bash commands, navigates project trees, writes complete React/Node/Python code, and validates for syntax and security errors."}
                </p>

                <div className="p-3.5 rounded-2xl bg-black/80 border border-emerald-500/40 font-mono text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 text-[11px] pb-1 border-b border-emerald-500/20">
                    <span>STATUS: DOCKER CONTAINER ONLINE // TSX RUNNER READY</span>
                    <span>LATENZ: 42ms</span>
                  </div>
                  <div className="text-slate-400">
                    $ claude-code run tests --coverage
                  </div>
                  <div className="text-emerald-300">
                    ✓ 34/34 Test-Suites erfolgreich bestanden. 0 Memory-Leaks entdeckt.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gmail" && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>{lang === "de" ? "Google Workspace & Gmail Zwei-Wege-Synchronisation" : "Google Workspace & Gmail Two-Way Sync"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === "de"
                    ? "Dein Postfach auf Autopilot: Nie wieder unbeantwortete E-Mails"
                    : "Inbox on Autopilot: Never Miss a High-Value Lead"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {lang === "de"
                    ? "Verbinde dein Gmail-Konto per sicherem Google OAuth2. Hermes liest eingehende Mails, kategorisiert sie nach Dringlichkeit (VIP Kunde, Support, Spam), fasst lange Threads zusammen und erstellt vorformulierte Antworten in deiner persönlichen Tonalität."
                    : "Connect your Gmail securely via Google OAuth2. Hermes triages incoming messages by urgency (VIP Client, Urgent Support, Invoice, Noise), summarizes threads, and drafts contextual replies in your personal tone."}
                </p>

                <div className="p-3.5 rounded-2xl bg-[#141005] border border-amber-500/40 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                    <span>POSTFACH-STATUS (ECHTZEIT-METRIK):</span>
                    <span className="text-emerald-400">● LIVE SYNC AKTIV</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    • 18 E-Mails in 45 Sekunden gescannt<br />
                    • 3 VIP-Anfragen mit hoher Kaufabsicht markiert<br />
                    • Vorformulierter Antwort-Entwurf mit 1 Klick versandbereit
                  </div>
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold uppercase">
                  <Share2 className="w-4 h-4 text-rose-400" />
                  <span>{lang === "de" ? "TikTok, Instagram & LinkedIn Multi-Post Studio" : "TikTok, Instagram & LinkedIn Multi-Post Studio"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === "de"
                    ? "Virale Hooks & Multi-Plattform Publishing in 60 Sekunden"
                    : "Viral Video Hooks & Multi-Platform Publishing in 60 Seconds"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {lang === "de"
                    ? "Echo analysiert aktuelle Social-Media Trends und berechnet einen Virality-Score (0-100) für deine Video-Titel und Hooks. Veröffentliche oder plane Posts direkt für TikTok, Instagram, X (Twitter) und YouTube Shorts."
                    : "Echo benchmarks trending patterns to compute a Virality Score (0-100) for your video hooks and captions. Publish or schedule directly to TikTok, Instagram, X (Twitter), and YouTube Shorts."}
                </p>

                <div className="p-3.5 rounded-2xl bg-[#1a0812] border border-rose-500/40 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-rose-300 font-bold text-[11px]">
                    <span>VIRALITY SCORE ALGORITHMUS:</span>
                    <span className="text-emerald-400 font-black">94 / 100 (HIGH IMPACT)</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    • Retentions-Trigger in den ersten 2,5 Sekunden eingebaut<br />
                    • Dynamische Hashtag-Cluster (#ai #productivity #workflow)<br />
                    • Exportierbares Video-Script inklusive Sprechtempo-Angaben
                  </div>
                </div>
              </div>
            )}

            {activeTab === "market" && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-blue-300 font-mono text-xs font-bold uppercase">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>{lang === "de" ? "Aether Quant & Krypto/Aktien Analyse" : "Aether Quant & Crypto/Market Intel"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === "de"
                    ? "Algorithmische Chart-Analysen & mathematische Risikosteuerung"
                    : "Algorithmic Chart Analysis & Quantitative Risk Controls"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {lang === "de"
                    ? "Aether berechnet in Echtzeit Indikatoren wie RSI, MACD, Orderflow-Ungleichgewichte und Liquidation-Level für Bitcoin, Ethereum, Tech-Aktien und Rohstoffe. Inklusive präziser Stop-Loss & Take-Profit Setups."
                    : "Aether calculates RSI, MACD, order flow imbalances, and liquidation clusters in real-time across crypto and equities, yielding calculated stop-loss and take-profit setups."}
                </p>

                <div className="p-3.5 rounded-2xl bg-[#08122a] border border-blue-500/40 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-blue-300 font-bold text-[11px]">
                    <span>TELEMETRIE FEED (BTC/USDT & S&P 500):</span>
                    <span className="text-emerald-400 font-bold">● LIVE FEED</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    • 12 technische Indikatoren auf 4 Zeitfenstern synchron analysiert<br />
                    • Risikoverhältnis (CRV) von mindestens 1:2,5 garantiert<br />
                    • Echtzeit-Warnungen bei Trendbrüchen und Volatilitäts-Spikes
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div className="flex items-center gap-2 text-teal-300 font-mono text-xs font-bold uppercase">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>{lang === "de" ? "Aegis Cyber Security & Pentest Auditor" : "Aegis Cyber Security & Pentest Auditor"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === "de"
                    ? "Banken-Grad Verschlüsselung & automatisierter Sicherheits-Scan"
                    : "Bank-Grade Encryption & Automated Security Posture Scanning"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {lang === "de"
                    ? "Aegis scannt deinen Code, API-Keys und Umgebungsvariablen auf Sicherheitslücken (SQL-Injections, XSS, exposed Secrets). Deine Daten werden lokal und mit 4096-Bit Ende-zu-Ende verschlüsselt gespeichert."
                    : "Aegis audits your codebase, OAuth tokens, and environment configs for security vulnerabilities (SQL injection, XSS, token leakage). All user data is secured with 4096-bit encryption."}
                </p>

                <div className="p-3.5 rounded-2xl bg-[#061818] border border-teal-500/40 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-teal-300 font-bold text-[11px]">
                    <span>SECURITY POSTURE SCORE:</span>
                    <span className="text-emerald-400 font-black">99.8% (ENTERPRISE READY)</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    • 0 Exposed Secrets oder Key-Leaks im Code gefunden<br />
                    • AES-GCM 256 / RSA-4096 Token-Verschlüsselung aktiv<br />
                    • Eigener Gemini API-Key kann hinterlegt werden (100% Datenkontrolle)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE INTERACTIVE TERMINAL SIMULATOR (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="rounded-2xl bg-black/90 border-2 border-cyan-500/40 p-4 font-mono text-xs shadow-2xl flex flex-col h-full justify-between">
              {/* Terminal Titlebar */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-400 font-bold">SYNTAX_CORE_EXEC.sh</span>
                  </div>
                  <span className="text-cyan-400 font-bold">V 4.2.0</span>
                </div>

                {/* Simulated Terminal Body */}
                <div className="mt-3 space-y-2.5 text-[11px] leading-relaxed">
                  <div className="text-slate-500">
                    // S.Y.N.T.A.X. Multi-Core Execution Matrix
                  </div>

                  <div className="text-slate-300">
                    <span className="text-cyan-400">&gt;</span> active_cores: <span className="text-purple-300">[syntax, veo3, claude, hermes, echo, aether, aegis, chronos]</span>
                  </div>

                  <div className="text-slate-300">
                    <span className="text-cyan-400">&gt;</span> latency: <span className="text-emerald-400">38ms</span> | memory_bandwidth: <span className="text-emerald-400">128 GB/s</span>
                  </div>

                  <div className="text-slate-300">
                    <span className="text-cyan-400">&gt;</span> task_status: <span className="text-amber-300 font-bold">SYNCHRONIZED (All 9 Engines Online)</span>
                  </div>

                  {/* Dynamic Output Box */}
                  <div className="mt-3 p-3 rounded-xl bg-[#090f26] border border-cyan-500/30 text-cyan-200 min-h-[140px] text-[11px] font-mono whitespace-pre-wrap select-all">
                    {isSimulating ? (
                      <div className="flex items-center gap-2 text-amber-300 py-6 justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{lang === "de" ? "Orchestriere Agenten..." : "Orchestrating agents..."}</span>
                      </div>
                    ) : simulatedOutput ? (
                      simulatedOutput
                    ) : (
                      <span className="text-slate-400">
                        {lang === "de"
                          ? "Klicke unten auf einen Test-Prompt oder starte die Simulation, um den echten Output von S.Y.N.T.A.X. in Echtzeit zu sehen."
                          : "Click a prompt suggestion below or hit Execute to inspect the real production output from S.Y.N.T.A.X."}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Terminal Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>PROMPT DEMO AUSWÄHLEN:</span>
                  {simulatedOutput && (
                    <button
                      onClick={handleCopy}
                      className="text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedStatus ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedStatus ? "Kopiert!" : "Kopieren"}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPromptInput(qp.prompt);
                        handleSimulatePrompt(qp.prompt);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-[10px] text-left truncate transition cursor-pointer"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleSimulatePrompt()}
                  disabled={isSimulating}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{lang === "de" ? "PROMPT JETZT SIMULIEREN" : "EXECUTE PROMPT NOW"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TANGIBLE DELIVERABLES GRID ("WAS DU IN SEKUNDEN ERHÄLTST") */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest font-bold">
            {lang === "de" ? "KONKRETE ERGEBNISSE" : "TANGIBLE OUTPUTS"}
          </span>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            {lang === "de" ? "Was S.Y.N.T.A.X. in Sekunden für dich erstellt" : "What S.Y.N.T.A.X. Generates in Seconds"}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            {lang === "de"
              ? "Keine halbgaren Antworten. Sofort einsetzbare Produktions-Dateien für dein Business."
              : "No unfinished answers. Ready-to-use production assets for your business."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Video className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-sm">
              {lang === "de" ? "Kinoreife Video-Ads (8K)" : "Cinematic Video Ads (8K)"}
            </div>
            <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
              {lang === "de"
                ? "Vollständige Storyboards mit Szenenbeschreibungen, Musik-Stimmung und 1-Klick Rendering für Instagram & TikTok."
                : "Full scene-by-scene storyboards with audio cues and 1-click 8K rendering for social ads."}
            </p>
            <div className="text-[10px] text-cyan-300 font-mono pt-1">
              ⚡ Output: MP4 Video, Storyboard PDF
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-sm">
              {lang === "de" ? "Produktionsreife Software" : "Production-Ready Software"}
            </div>
            <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
              {lang === "de"
                ? "React Web-Apps, Node.js API Endpoints, Tailwind Layouts und Datenbank-Abfragen direkt im Browser getestet."
                : "React web apps, Node.js APIs, responsive Tailwind interfaces, and tested database schemas."}
            </p>
            <div className="text-[10px] text-emerald-300 font-mono pt-1">
              ⚡ Output: Git Repos, TSX Files, ZIP Export
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Mail className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-sm">
              {lang === "de" ? "Automatisierter Lead-Vertrieb" : "Automated Lead Outreach"}
            </div>
            <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
              {lang === "de"
                ? "Personalisierte E-Mail-Sequenzen, automatische Einwandbehandlung und Google Calendar Terminbuchungen."
                : "Personalized cold email campaigns, automated objection handling, and Google Calendar demo bookings."}
            </p>
            <div className="text-[10px] text-purple-300 font-mono pt-1">
              ⚡ Output: Gmail Entwürfe, CRM Status, Calendar Slots
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
