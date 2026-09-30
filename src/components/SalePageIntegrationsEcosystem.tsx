import React, { useState } from "react";
import {
  Globe,
  Mail,
  Calendar,
  CreditCard,
  MessageSquare,
  Github,
  ShoppingBag,
  Terminal,
  Video,
  Share2,
  Lock,
  Check,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";

interface SalePageIntegrationsEcosystemProps {
  lang?: "de" | "en";
  onOpenApp?: () => void;
  onRegisterClick?: () => void;
  hideIntegrationsGrid?: boolean;
}

export const SalePageIntegrationsEcosystem: React.FC<SalePageIntegrationsEcosystemProps> = ({
  lang = "de",
  onOpenApp,
  onRegisterClick,
  hideIntegrationsGrid = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "productivity" | "developer" | "media" | "commerce"
  >("all");

  const INTEGRATIONS = [
    {
      id: "gmail",
      category: "productivity",
      name: "Google Gmail Matrix",
      desc:
        lang === "de"
          ? "Zwei-Wege-Sync per offiziellem OAuth2. E-Mails lesen, zusammenfassen und im eigenen Schreibstil beantworten."
          : "Two-way sync via official OAuth2. Triage, summarize, and reply in your authentic tone.",
      tag: "OAUTH2 CERTIFIED",
      color: "border-red-500/40 text-red-400 bg-red-500/10",
      icon: Mail,
    },
    {
      id: "calendar",
      category: "productivity",
      name: "Google Calendar Core",
      desc:
        lang === "de"
          ? "Intelligente Termin-Koordination, automatische Vorbereitung von Meetings und Kalender-Verwaltung per Sprache."
          : "Smart meeting coordination, automated briefing notes, and hands-free voice scheduling.",
      tag: "REAL-TIME SYNC",
      color: "border-blue-500/40 text-blue-400 bg-blue-500/10",
      icon: Calendar,
    },
    {
      id: "discord",
      category: "commerce",
      name: "Discord Community Bot",
      desc:
        lang === "de"
          ? "24/7 Community-Moderator, KI-Ticket System & Rollenverwaltung direkt auf deinem Discord Server."
          : "24/7 autonomous moderator, ticket resolution, and role automation directly on your server.",
      tag: "PERMANENT LINK",
      color: "border-[#5865F2]/60 text-indigo-300 bg-[#5865F2]/10",
      icon: MessageSquare,
      link: "https://discord.gg/4D6mb4xbVr",
      linkLabel: "discord.gg/4D6mb4xbVr",
    },
    {
      id: "veo",
      category: "media",
      name: "Veo 3.1 Video Engine",
      desc:
        lang === "de"
          ? "High-End Video-Synthese: Aus Textprompts werden 8K MP4 Clips in 16:9 Cinema oder 9:16 Mobile Formaten gerendert."
          : "High-end video synthesis: Text prompts turn into cinematic 8K MP4 clips in 16:9 or 9:16 vertical.",
      tag: "8K GPU RENDER",
      color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      icon: Video,
    },
    {
      id: "claude-code",
      category: "developer",
      name: "Claude Code Terminal",
      desc:
        lang === "de"
          ? "Echte Bash-Befehle, Git-Commits und Multi-File Code-Refactoring ohne Verzögerung im Browser."
          : "Execute real shell commands, git operations, and multi-file code refactoring in browser.",
      tag: "FULL-STACK IDE",
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      icon: Terminal,
    },
    {
      id: "social",
      category: "media",
      name: "TikTok & Instagram Studio",
      desc:
        lang === "de"
          ? "Direkter Social Media Upload, Virality-Score Vorhersage und optimierte Hashtag-Generierung."
          : "Direct upload, virality prediction algorithms, and automated hashtag discovery.",
      tag: "VIRAL ENGINE",
      color: "border-pink-500/40 text-pink-400 bg-pink-500/10",
      icon: Share2,
    },
    {
      id: "stripe",
      category: "commerce",
      name: "Stripe & PayPal Gateway",
      desc:
        lang === "de"
          ? "Sichere Rechnungsabwicklung, Abonnements, Klarna-Integration und automatisierte Zahlungs-Webhooks."
          : "Secure billing, recurring subscriptions, Klarna integration, and automated payment webhooks.",
      tag: "PCI COMPLIANT",
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      icon: CreditCard,
    },
    {
      id: "github",
      category: "developer",
      name: "GitHub & Repo Sync",
      desc:
        lang === "de"
          ? "Automatische Pull-Requests, CI/CD Pipeline-Überwachung und Code-Sicherheitsaudits per Klick."
          : "Automated Pull Requests, CI/CD monitoring, and code security checks with one click.",
      tag: "GIT INTEGRATED",
      color: "border-slate-500/40 text-slate-300 bg-slate-500/10",
      icon: Github,
    },
    {
      id: "shopify",
      category: "commerce",
      name: "Shopify E-Commerce",
      desc:
        lang === "de"
          ? "Automatisierte Produktbeschreibungen, Bestands-Updates und 24/7 KI-Verkaufsberater im Webshop."
          : "Automated SEO descriptions, stock telemetry, and 24/7 sales concierge for web stores.",
      tag: "STORE BRIDGE",
      color: "border-lime-500/40 text-lime-400 bg-lime-500/10",
      icon: ShoppingBag,
    },
  ];

  const filteredIntegrations =
    activeCategory === "all"
      ? INTEGRATIONS
      : INTEGRATIONS.filter((item) => item.category === activeCategory);

  const COMPARISON_ITEMS = [
    {
      feature: lang === "de" ? "Vernetzte Multi-Agenten Flotte" : "Connected Multi-Agent Fleet",
      syntax: lang === "de" ? "Ja (9 Spezialisten parallel im Team)" : "Yes (9 Specialists in Parallel)",
      chatgpt: lang === "de" ? "Nein (Nur 1 isolierter Chat-Bot)" : "No (Single Isolated Bot)",
      copilot: lang === "de" ? "Nein (Einfacher Chat)" : "No (Standard Chat)",
    },
    {
      feature: lang === "de" ? "Echter Gmail & Workspace Sync" : "Real Gmail & Workspace Sync",
      syntax: lang === "de" ? "Ja (OAuth2 lesen, analysieren & senden)" : "Yes (OAuth2 read, triage & send)",
      chatgpt: lang === "de" ? "Nein (Nur Text-Vorschläge)" : "No (Text suggestions only)",
      copilot: lang === "de" ? "Eingeschränkt auf MS Office" : "Restricted to MS Office",
    },
    {
      feature: lang === "de" ? "Veo 3.1 8K Video Studio" : "Veo 3.1 8K Video Studio",
      syntax: lang === "de" ? "Integriert (16:9 Cinema & 9:16 Mobile)" : "Integrated (16:9 & 9:16 Formats)",
      chatgpt: lang === "de" ? "Nein (Keine Videoerstellung)" : "No (No Video Generation)",
      copilot: lang === "de" ? "Nein" : "No",
    },
    {
      feature: lang === "de" ? "Claude Code Live Terminal" : "Claude Code Live Terminal",
      syntax: lang === "de" ? "Ja (Docker Bash Runner & Git Commits)" : "Yes (Docker Runner & Git Commits)",
      chatgpt: lang === "de" ? "Nur Textausgabe im Chat" : "Text Output Only",
      copilot: lang === "de" ? "Nur Code-Autovervollständigung" : "Autocomplete Only",
    },
    {
      feature: lang === "de" ? "Social Media Direct Upload" : "Direct Social Media Upload",
      syntax: lang === "de" ? "Ja (TikTok, Instagram & X)" : "Yes (TikTok, Instagram & X)",
      chatgpt: lang === "de" ? "Nein (Manuell kopieren nötig)" : "No (Manual copy required)",
      copilot: lang === "de" ? "Nein" : "No",
    },
    {
      feature: lang === "de" ? "Echtzeit-Sprachsteuerung" : "Real-Time Voice Conversation",
      syntax: lang === "de" ? "Unter 85ms Latenz (Natürliche Stimmen)" : "Sub-85ms Latency (Natural Voices)",
      chatgpt: lang === "de" ? "Spürbare Verzögerung (>500ms)" : "High Latency (>500ms)",
      copilot: lang === "de" ? "Nein / Träge" : "Sluggish / None",
    },
    {
      feature: lang === "de" ? "Eigener API-Key (0 Limits)" : "Custom API Key (Zero Limits)",
      syntax: lang === "de" ? "Ja (Beliebig eigene Keys hinterlegen)" : "Yes (Unlimited custom keys)",
      chatgpt: lang === "de" ? "Nein (Strikte 3-Stunden Begrenzung)" : "No (Strict 3h rate limits)",
      copilot: lang === "de" ? "Nein (Gedrosselt)" : "No (Throttled)",
    },
    {
      feature: lang === "de" ? "24/7 Discord Community Bot" : "24/7 Discord Community Bot",
      syntax: lang === "de" ? "Ja (Inklusive Server-Anbindung)" : "Yes (Native bridge included)",
      chatgpt: lang === "de" ? "Nein" : "No",
      copilot: lang === "de" ? "Nein" : "No",
    },
  ];

  return (
    <div className="w-full space-y-16 font-sans" id="integrations-and-comparison-root">
      {/* 1. NATIVE INTEGRATIONS ECOSYSTEM */}
      {!hideIntegrationsGrid && (
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/40 text-purple-300 font-mono text-xs uppercase tracking-widest font-bold">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === "de" ? "15+ NATIVE INTEGRATIONEN" : "15+ NATIVE INTEGRATIONS"}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
              {lang === "de"
                ? "Verbinde deine bestehenden Tools in 1 Klick"
                : "Connect Your Existing Tech Stack in 1 Click"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-light">
              {lang === "de"
                ? "S.Y.N.T.A.X. arbeitet nahtlos mit deinen bestehenden Konten zusammen – ohne komplizierte API-Programmierung."
                : "S.Y.N.T.A.X. connects directly to your business apps with zero code setup."}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-xs">
            {[
              { id: "all", label: lang === "de" ? "Alle Tools (15+)" : "All Tools (15+)" },
              { id: "productivity", label: lang === "de" ? "Workspace & E-Mail" : "Workspace & Email" },
              { id: "developer", label: lang === "de" ? "Developer & Code" : "Developer & Code" },
              { id: "media", label: lang === "de" ? "Video & Social Media" : "Video & Social Media" },
              { id: "commerce", label: lang === "de" ? "E-Commerce & Discord" : "E-Commerce & Discord" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer font-bold ${
                  activeCategory === cat.id
                    ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#060b1c]/90 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.color}`}>
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-sm sm:text-base font-mono">
                      {item.name}
                    </h3>

                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-300 hover:text-white flex items-center gap-1 font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{item.linkLabel || "Server beitreten"}</span>
                      </a>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>1-Klick Connect</span>
                      </span>
                    )}

                    <span className="text-slate-400 text-[10px]">Pre-Access Ready</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ULTIMATE CAPABILITY COMPARISON TABLE */}
      <div className="rounded-3xl bg-[#040816]/95 border-2 border-cyan-500/40 p-5 sm:p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden font-mono">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-8">
          <span className="text-cyan-400 text-xs uppercase tracking-widest font-bold block">
            {lang === "de" ? "TRANSPARENTER VERGLEICH" : "TRANSPARENT COMPARISON"}
          </span>
          <h3 className="font-display text-2xl sm:text-4xl font-black text-white">
            {lang === "de"
              ? "S.Y.N.T.A.X. OS vs. Isolierte Einzel-Chatbots"
              : "S.Y.N.T.A.X. OS vs. Isolated Chatbots"}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm font-sans font-light">
            {lang === "de"
              ? "Warum 9 vernetzte Agenten ein ganzes Team ersetzen können, während herkömmliche Chatbots bei einfachen Texten stehen bleiben."
              : "Why 9 interconnected agents replace an entire operations team while traditional chatbots get stuck at simple text prompts."}
          </p>
        </div>

        {/* Responsive Table Frame */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-cyan-500/30">
                <th className="pb-3 text-slate-400 font-bold uppercase text-[11px] w-2/5">
                  {lang === "de" ? "KERN-FÄHIGKEIT" : "CORE CAPABILITY"}
                </th>
                <th className="pb-3 text-cyan-300 font-black uppercase text-[11px] w-1/3 bg-cyan-950/40 px-3 rounded-t-xl border-t border-x border-cyan-500/40">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>S.Y.N.T.A.X. SOVEREIGN</span>
                  </div>
                </th>
                <th className="pb-3 text-slate-500 font-bold uppercase text-[11px] px-3">
                  CHATGPT PLUS ($20)
                </th>
                <th className="pb-3 text-slate-500 font-bold uppercase text-[11px] px-3">
                  MS COPILOT PRO ($30)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {COMPARISON_ITEMS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 pr-4 text-white font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{row.feature}</span>
                  </td>
                  <td className="py-3.5 px-3 bg-cyan-950/20 text-emerald-300 font-bold border-x border-cyan-500/30">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{row.syntax}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      <span>{row.chatgpt}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      <span>{row.copilot}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM CALLOUT */}
        <div className="mt-8 pt-6 border-t border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300 font-sans">
            <strong className="text-cyan-300 font-bold font-mono">
              {lang === "de" ? "Fazit:" : "Conclusion:"}
            </strong>{" "}
            {lang === "de"
              ? "Statt $90/Monat für getrennte Tools zu zahlen, bündelt S.Y.N.T.A.X. alles in einer Cyberpunk-Zentrale."
              : "Instead of paying $90+/month across fragmented subscriptions, S.Y.N.T.A.X. unifies your entire workflow."}
          </div>

          <button
            onClick={() => {
              if (onRegisterClick) {
                onRegisterClick();
              } else {
                const el = document.getElementById("hero-registration-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-95 whitespace-nowrap"
          >
            <span>{lang === "de" ? "JETZT 3 TAGE GRATIS TESTEN" : "START 3-DAY FREE TRIAL"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
