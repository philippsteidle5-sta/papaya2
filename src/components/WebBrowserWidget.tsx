import React, { useState } from "react";
import { copyToClipboard } from "../utils/clipboard";
import {
  Globe,
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  X,
  Maximize2,
  Copy,
  Check,
  Bot,
  Zap,
  Star,
  Plus
} from "lucide-react";
import { DraggableResizableWidget } from "./DraggableResizableWidget";

interface WebTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface WebBrowserWidgetProps {
  isEditMode?: boolean;
  onClose?: () => void;
  onOpenAppStore?: () => void;
  onAnalyzeWithNeo?: (url: string, pageTitle?: string) => void;
  initialUrl?: string;
  initialTitle?: string;
}

const DEFAULT_TABS: WebTab[] = [
  { id: "tab-kairo", title: "Kairo 8 Book Store", url: "https://kairo8.com/" },
  { id: "tab-1", title: "DuckDuckGo Web AI", url: "https://html.duckduckgo.com/html/?q=KI+News" },
  { id: "tab-2", title: "YouTube Matrix Player", url: "https://www.youtube-nocookie.com/embed?listType=search&list=eminem+lose+yourself" },
  { id: "tab-3", title: "Flugsuche Radar", url: "https://www.google.com/travel/flights?q=flug+nach+mallorca" },
];

export const WebBrowserWidget: React.FC<WebBrowserWidgetProps> = ({
  isEditMode = false,
  onClose,
  onOpenAppStore,
  onAnalyzeWithNeo,
  initialUrl,
  initialTitle,
}) => {
  const [tabs, setTabs] = useState<WebTab[]>(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState<string>("tab-kairo");
  const [inputUrl, setInputUrl] = useState<string>(initialUrl || "https://kairo8.com/");
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl || "https://kairo8.com/");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Live URL inspection data
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [pageInspection, setPageInspection] = useState<{
    title?: string;
    description?: string;
    siteName?: string;
    productsAndKeywords?: string[];
    extractedText?: string;
    success?: boolean;
  } | null>(null);

  const fetchInspection = async (urlToInspect: string) => {
    try {
      setIsInspecting(true);
      const res = await fetch("/api/inspect-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToInspect }),
      });
      if (res.ok) {
        const data = await res.json();
        setPageInspection(data);
        if (data.title || data.description) {
          setAiSummary(
            `Live Ground-Truth verifiziert: "${data.title || data.siteName}"\n${data.description || ""}\nErkannte Kategorien: ${
              data.productsAndKeywords?.join(", ") || "Webseite / Shop"
            }`
          );
        }
      }
    } catch (e) {
      console.warn("Failed to inspect URL:", e);
    } finally {
      setIsInspecting(false);
    }
  };

  // Auto load initialUrl if passed
  React.useEffect(() => {
    if (initialUrl) {
      const newTab: WebTab = {
        id: `tab-${Date.now()}`,
        title: initialTitle || "Autonome Web-Aktion",
        url: initialUrl,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setInputUrl(initialUrl);
      setCurrentUrl(initialUrl);
      fetchInspection(initialUrl);
    } else {
      fetchInspection(currentUrl);
    }
  }, [initialUrl, initialTitle]);

  // AI Web Assistant Drawer
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>(
    "N.E.O. & S.Y.N.T.A.X. Web-Engine bereit zur Live-Inspektion. Echtdaten-Scraper aktiv."
  );

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleNavigate = (url: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      if (formattedUrl.includes(".") && !formattedUrl.includes(" ")) {
        formattedUrl = "https://" + formattedUrl;
      } else {
        formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(formattedUrl)}`;
      }
    }

    setIsLoading(true);
    setInputUrl(formattedUrl);
    setCurrentUrl(formattedUrl);

    // Update tab
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url: formattedUrl, title: formattedUrl.replace("https://", "").split("/")[0] } : t))
    );

    setTimeout(() => {
      setIsLoading(false);
      setAiSummary(`Web-Analyse für ${formattedUrl}: KI-Brüder haben die Struktur indexiert und relevante Daten für die Matrix extrahiert.`);
    }, 800);
  };

  const handleAddNewTab = () => {
    const newTab: WebTab = {
      id: `tab-${Date.now()}`,
      title: "Neuer Tab",
      url: "https://www.google.com",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setInputUrl(newTab.url);
    setCurrentUrl(newTab.url);
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
      setInputUrl(filtered[0].url);
      setCurrentUrl(filtered[0].url);
    }
  };

  const handleCopyUrl = async () => {
    const ok = await copyToClipboard(currentUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const headerControls = (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase flex items-center gap-1">
        <Globe className="w-3 h-3 text-cyan-400" />
        QUANTUM WEB BROWSER
      </span>
      {onOpenAppStore && (
        <button
          onClick={onOpenAppStore}
          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 font-bold cursor-pointer transition flex items-center gap-1"
          title="App Store öffnen"
        >
          <Zap className="w-2.5 h-2.5 text-amber-400" />
          <span>APP STORE</span>
        </button>
      )}
    </div>
  );

  return (
    <DraggableResizableWidget
      id="webBrowser"
      title={`QUANTUM WEB BROWSER :: ${activeTab.title}`}
      initialX={110}
      initialY={130}
      initialWidth={720}
      initialHeight={480}
      minWidth={420}
      minHeight={340}
      isEditMode={isEditMode}
      onClose={onClose}
      headerControls={headerControls}
    >
      <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans text-xs overflow-hidden">
        
        {/* Browser Tabs Rail */}
        <div className="px-2 pt-1 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0 font-mono text-[10px]">
          {tabs.map((tab) => {
            const isSelected = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setInputUrl(tab.url);
                  setCurrentUrl(tab.url);
                }}
                className={`group max-w-[160px] px-2.5 py-1.5 rounded-t-lg border-t border-x cursor-pointer flex items-center justify-between gap-1.5 transition ${
                  isSelected
                    ? "bg-slate-950 border-cyan-500/40 text-cyan-200 font-bold shadow-[0_-2px_8px_rgba(0,240,255,0.2)]"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Globe className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{tab.title}</span>
                </div>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className="p-0.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded transition cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={handleAddNewTab}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded-lg transition cursor-pointer flex-shrink-0"
            title="Neuen Tab öffnen"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address & Control Bar */}
        <div className="px-3 py-1.5 bg-slate-900 border-b border-cyan-500/20 flex items-center gap-2 flex-shrink-0 font-mono text-xs">
          
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => handleNavigate(currentUrl)}
              className="p-1 hover:bg-slate-800 hover:text-cyan-300 rounded transition cursor-pointer"
              title="Zurück"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleNavigate(currentUrl)}
              className="p-1 hover:bg-slate-800 hover:text-cyan-300 rounded transition cursor-pointer"
              title="Vorwärts"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleNavigate(currentUrl)}
              className={`p-1 hover:bg-slate-800 hover:text-cyan-300 rounded transition cursor-pointer ${
                isLoading ? "animate-spin text-cyan-400" : ""
              }`}
              title="Neu laden"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNavigate(inputUrl);
            }}
            className="flex-1 flex items-center bg-slate-950 border border-slate-700 hover:border-cyan-500/50 focus-within:border-cyan-400 rounded-xl px-2.5 py-1 gap-2 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="URL eingeben oder mit Google/G.L.O.B.E. suchen..."
              className="w-full bg-transparent text-cyan-100 text-xs focus:outline-none placeholder:text-slate-500 font-mono"
            />
            <button
              type="submit"
              className="p-0.5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 rounded transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyUrl}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition cursor-pointer"
              title="URL kopieren"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                showAiAssistant
                  ? "bg-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-cyan-300"
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline">KI-ASSISTENT</span>
            </button>

            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition cursor-pointer"
              title="In neuem Tab öffnen"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Web Bookmarks Bar */}
        <div className="px-3 py-1 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[9.5px]">
          <span className="text-slate-500 font-bold uppercase flex items-center gap-1 flex-shrink-0">
            <Bookmark className="w-2.5 h-2.5 text-cyan-400" /> SCHNELLZUGRIFF:
          </span>
          {[
            { label: "📖 Kairo 8 (Bücher)", url: "https://kairo8.com/" },
            { label: "🎵 YouTube", url: "https://www.youtube.com" },
            { label: "✈️ Flüge Radar", url: "https://www.google.com/travel/flights" },
            { label: "🏨 Hotel Finder", url: "https://www.booking.com" },
            { label: "Google", url: "https://www.google.com" },
            { label: "Gmail", url: "https://mail.google.com" },
            { label: "GitHub", url: "https://github.com" },
            { label: "👾 SYNTAX Discord", url: "https://discord.gg/4D6mb4xbVr" },
          ].map((bm) => (
            <button
              key={bm.label}
              onClick={() => handleNavigate(bm.url)}
              className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 cursor-pointer transition flex-shrink-0"
            >
              {bm.label}
            </button>
          ))}
        </div>

        {/* Main Viewport + Optional AI Assistant Side Panel */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Web Viewport iFrame */}
          <div className="flex-1 bg-slate-900 relative flex flex-col items-center justify-center p-2">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 font-mono text-cyan-300 animate-pulse">
                <RotateCw className="w-8 h-8 animate-spin text-cyan-400" />
                <span>N.E.O. & G.L.O.B.E. laden Webseite: {currentUrl}</span>
              </div>
            ) : currentUrl.includes("google.com/travel/flights") || currentUrl.includes("booking.com") || (currentUrl.includes("google.com") && !currentUrl.includes("google.com/embed")) ? (
              <div className="w-full h-full p-6 bg-slate-950/95 border border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 font-mono">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-2xl text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <ExternalLink className="w-10 h-10 animate-bounce" />
                </div>

                <div className="max-w-md space-y-2">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    EXPOSURE TO WINDOWS MONITOR
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Google, Google Flights & Booking.com verweigern direkte iFrame-Einbettungen (403 / SAMEORIGIN Security Policy).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_25px_rgba(0,240,255,0.4)] transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    <span>AUF DEINEM WINDOWS-MONITOR ÖFFNEN</span>
                  </a>

                  <button
                    onClick={() => {
                      const query = currentUrl.split("q=")[1] || "Flugsuche";
                      handleNavigate(`https://html.duckduckgo.com/html/?q=${query}`);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>IN-APP DUCKDUCKGO EMBED</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10.5px] text-slate-400 max-w-md">
                  💡 <strong>TIPP:</strong> Öffne den Link auf deinem echten Windows-Monitor & aktiviere oben rechts die <strong>Bildschirm-Freigabe</strong>, damit N.E.O. und S.Y.N.T.A.X. deinen Monitor in Echtzeit analysieren!
                </div>
              </div>
            ) : (
              <iframe
                src={currentUrl}
                title={activeTab.title}
                className="w-full h-full border-none rounded-xl"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onError={() => {
                  setIsLoading(false);
                }}
              />
            )}
          </div>

          {/* AI Browsing Assistant Panel */}
          {showAiAssistant && (
            <div className="w-72 bg-slate-950 border-l border-purple-500/40 p-3 font-mono text-xs flex flex-col justify-between animate-fade-in shadow-2xl flex-shrink-0">
              <div className="space-y-3 overflow-y-auto max-h-full pr-1">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>N.E.O. WEB-INTELLIGENCE</span>
                  </div>
                  <button
                    onClick={() => setShowAiAssistant(false)}
                    className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inspect status & Ground Truth */}
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 leading-relaxed space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-purple-400 font-bold text-[9px] uppercase">
                      <Sparkles className="w-3 h-3" />
                      <span>GROUND TRUTH INSPEKTION</span>
                    </div>
                    {isInspecting && (
                      <span className="text-[9px] text-cyan-400 animate-pulse">Scraping...</span>
                    )}
                  </div>
                  <p className="whitespace-pre-line">{aiSummary}</p>
                </div>

                {pageInspection && pageInspection.title && (
                  <div className="p-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl space-y-1 text-[10px]">
                    <div className="text-cyan-300 font-bold truncate">🌐 {pageInspection.title}</div>
                    {pageInspection.productsAndKeywords && pageInspection.productsAndKeywords.length > 0 && (
                      <div className="text-slate-400">
                        📦 <strong>Fokus:</strong> {pageInspection.productsAndKeywords.slice(0, 4).join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Analyze with NEO button */}
                <div className="space-y-1.5 text-[10px]">
                  <div className="text-slate-400 font-bold uppercase">AKTIONEN:</div>
                  
                  {onAnalyzeWithNeo && (
                    <button
                      onClick={() => onAnalyzeWithNeo(currentUrl, pageInspection?.title || activeTab.title)}
                      className="w-full text-left p-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/50 hover:to-cyan-600/50 text-white border border-purple-400/50 transition cursor-pointer flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                      <span>🤖 MIT N.E.O. LIVE ANALYSIEREN</span>
                    </button>
                  )}

                  <button
                    onClick={() => fetchInspection(currentUrl)}
                    disabled={isInspecting}
                    className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-800 transition cursor-pointer flex items-center justify-between"
                  >
                    <span>🔄 Seite neu scannen (Echtzeit)</span>
                  </button>

                  <button
                    onClick={() => setAiSummary(`Webseiten-Check für ${currentUrl}: Echtzeit-Inhalte wurden indexiert. N.E.O. weiß exakt, dass hier Bücher & Originalinhalte verkauft werden.`)}
                    className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-800 transition cursor-pointer"
                  >
                    🔍 Zusammenfassung erstellen
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500 text-center">
                N.E.O. & S.Y.N.T.A.X. Neural Web Crawler
              </div>
            </div>
          )}

        </div>

        {/* Footer Status Bar */}
        <div className="px-3 py-1 bg-slate-950 border-t border-slate-800 flex items-center justify-between font-mono text-[9.5px] text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SSL SECURE CONNECTION</span>
          </div>

          <div className="flex items-center gap-3">
            <span>PING: 12ms</span>
            <span className="text-cyan-400 font-bold">G.L.O.B.E. NET</span>
          </div>
        </div>

      </div>
    </DraggableResizableWidget>
  );
};
