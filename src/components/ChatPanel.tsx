import React, { useState, useEffect, useRef } from "react";
import { Info, RotateCcw, GripHorizontal, Wrench } from "lucide-react";
import { Message, AgentConfig, AgentMultiResponse } from "../types";
import { ParticleVoiceOrb } from "./ParticleVoiceOrb";
import { MultiAgentResponseCard } from "./MultiAgentResponseCard";
import { ChatWaitingAnimation } from "./ChatWaitingAnimation";
import { useTheme } from "../utils/themeStore";
import { isVideoUrl } from "../utils/mediaUtils";
import { getAppsLinkedToAgent, SystemAppDefinition } from "../utils/agentAppLinksStore";
import { ChatApiConnector } from "./ChatApiConnector";

interface ChatPanelProps {
  messages: Message[];
  currentAgent: AgentConfig;
  compareEnabled: boolean;
  isLoading: boolean;
  onOpenSettings?: () => void;
  onClearChat?: () => void;
  onSelectHologram?: (url: string, prompt?: string) => void;
  lang?: "de" | "en";
  onSpeak?: (text: string, agentId?: string) => void;
  onOpenApp?: (appId: string) => void;
  onOpenToolManager?: (agentId?: string) => void;
  isAdmin?: boolean;
  geminiKey?: string;
  onSaveGeminiKey?: (key: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentAgent,
  compareEnabled,
  isLoading,
  onOpenSettings,
  onClearChat,
  onSelectHologram,
  lang = "de",
  onSpeak,
  onOpenApp,
  onOpenToolManager,
  isAdmin = false,
  geminiKey,
  onSaveGeminiKey,
}) => {
  const { isModern } = useTheme();
  const [activeTab, setActiveTab] = useState<"all" | "claude" | "gemini">("all");
  const [linkedApps, setLinkedApps] = useState<SystemAppDefinition[]>(() =>
    getAppsLinkedToAgent(currentAgent?.id || "neo", isAdmin)
  );

  useEffect(() => {
    setLinkedApps(getAppsLinkedToAgent(currentAgent?.id || "neo", isAdmin));
    const handleUpdate = () => {
      setLinkedApps(getAppsLinkedToAgent(currentAgent?.id || "neo", isAdmin));
    };
    window.addEventListener("syntax_app_links_updated", handleUpdate);
    return () => window.removeEventListener("syntax_app_links_updated", handleUpdate);
  }, [currentAgent?.id, isAdmin]);

  const [panelHeight, setPanelHeight] = useState<number>(() =>
    typeof window !== "undefined" ? Math.max(580, Math.min(820, window.innerHeight - 140)) : 680
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(680);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      isDraggingRef.current = true;
      setIsDragging(true);
      startYRef.current = e.touches[0].clientY;
      startHeightRef.current = panelHeight;
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.clientY;
    const maxH = Math.max(400, window.innerHeight - 90);
    const newHeight = Math.max(280, Math.min(maxH, startHeightRef.current + deltaY));
    setPanelHeight(newHeight);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current || !e.touches[0]) return;
    const deltaY = startYRef.current - e.touches[0].clientY;
    const maxH = Math.max(400, window.innerHeight - 90);
    const newHeight = Math.max(280, Math.min(maxH, startHeightRef.current + deltaY));
    setPanelHeight(newHeight);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };

  // Auto scroll to bottom when messages arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div 
      className={`w-full h-full max-w-full rounded-2xl flex flex-col overflow-hidden shadow-2xl relative z-20 transition-all border bg-[#0d0e13] border-zinc-800 text-zinc-100 ${
        isDragging ? "select-none ring-1 ring-zinc-700" : ""
      }`}
    >
      {/* Top Drag Handle Bar */}
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="w-full h-4 border-b border-zinc-800/80 bg-zinc-950/80 hover:bg-zinc-900/80 flex items-center justify-center cursor-ns-resize group transition-colors flex-shrink-0"
        title="Gedrückt halten und nach oben/unten ziehen, um den Chat zu vergrößern"
      >
        <div className="flex items-center gap-1 opacity-50 group-hover:opacity-90 transition">
          <GripHorizontal className="w-3.5 h-3 text-zinc-400" />
        </div>
      </div>

      {/* Agent Header & Status */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ParticleVoiceOrb
              bare
              size={34}
              type="custom"
              primaryColor={currentAgent.color || "#38bdf8"}
              intensity={isLoading ? 0.7 : 0.15}
              isLive={isLoading}
              state={isLoading ? "speaking" : "idle"}
              themeStyle="modern"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100">
                {currentAgent.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
                {currentAgent.short}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <span>{isLoading ? (lang === "de" ? "Antwortet..." : "Thinking...") : (lang === "de" ? "Bereit" : "Ready")}</span>
            </div>
          </div>
        </div>

        {onClearChat && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 px-2.5 py-1.5 rounded-lg transition border border-transparent hover:border-zinc-800 cursor-pointer"
            title="Chatverlauf leeren"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">{lang === "de" ? "Leeren" : "Clear"}</span>
          </button>
        )}
      </div>

      {/* Compare Dual Core Bar if enabled */}
      {compareEnabled && (
        <div className="flex border-b border-zinc-800 bg-zinc-950/70 flex-shrink-0 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 text-center py-2 font-medium transition cursor-pointer border-b-2 ${
              activeTab === "all"
                ? "text-zinc-100 border-zinc-100 font-semibold"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setActiveTab("claude")}
            className={`flex-1 text-center py-2 font-medium transition cursor-pointer border-b-2 ${
              activeTab === "claude"
                ? "text-zinc-100 border-zinc-100 font-semibold"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            Claude
          </button>
          <button
            onClick={() => setActiveTab("gemini")}
            className={`flex-1 text-center py-2 font-medium transition cursor-pointer border-b-2 ${
              activeTab === "gemini"
                ? "text-zinc-100 border-zinc-100 font-semibold"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            Gemini
          </button>
        </div>
      )}

      {/* Linked Tools Bar for Active Agent */}
      <div className="px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/40 flex items-center justify-between gap-2 text-xs flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <span className="text-zinc-500 text-[11px] font-medium whitespace-nowrap">
            Tools:
          </span>
          {linkedApps.length > 0 ? (
            linkedApps.map((app) => (
              <button
                key={app.id}
                onClick={() => onOpenApp?.(app.id)}
                className="px-2 py-0.5 rounded-md border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition cursor-pointer flex items-center gap-1 text-[11px]"
                title={`${app.nameDe} öffnen`}
              >
                <span>{app.icon}</span>
                <span>{app.shortName}</span>
              </button>
            ))
          ) : (
            <span className="text-zinc-500 text-xs italic">Keine Tools verknüpft</span>
          )}
        </div>

        {onOpenToolManager && (
          <button
            onClick={() => onOpenToolManager(currentAgent?.id || "neo")}
            className="px-2 py-0.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 text-[11px] transition cursor-pointer whitespace-nowrap flex items-center gap-1"
            title="Tools verknüpfen"
          >
            <Wrench className="w-3 h-3" />
            <span className="hidden sm:inline">+ Tools</span>
          </button>
        )}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 select-text">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          if (isUser) {
            return (
              <div
                key={msg.id}
                className="self-end max-w-[85%] sm:max-w-[78%] flex flex-col items-end gap-1.5"
              >
                <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-zinc-800/90 border border-zinc-750 text-zinc-100 text-sm leading-relaxed shadow-sm font-sans whitespace-pre-wrap selection:bg-zinc-700">
                  {msg.content}
                </div>

                {((msg.imageUrls && msg.imageUrls.length > 0) || msg.imageUrl) && (
                  <div className={`grid gap-2 max-w-full ${
                    (msg.imageUrls?.length || 1) === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}>
                    {(msg.imageUrls && msg.imageUrls.length > 0 ? msg.imageUrls : [msg.imageUrl!]).map((url, imgIdx) => {
                      const isVid = isVideoUrl(url);
                      return (
                        <div
                          key={imgIdx}
                          onClick={() => !isVid && onSelectHologram && onSelectHologram(url, msg.content)}
                          className="rounded-xl overflow-hidden border border-zinc-800 bg-black/60 transition hover:border-zinc-700 cursor-pointer shadow-md"
                        >
                          {isVid ? (
                            <video
                              src={url}
                              controls
                              playsInline
                              className="w-full h-auto object-cover max-h-48 bg-black rounded"
                            />
                          ) : (
                            <img src={url} alt={`Upload ${imgIdx + 1}`} className="w-full h-auto object-cover max-h-36" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Comparison message handling
          if (msg.isCompare && msg.compareResult) {
            const multiResponses: AgentMultiResponse[] = [];
            if (activeTab === "all" || activeTab === "claude") {
              multiResponses.push({
                agentId: `${currentAgent.id}-claude`,
                name: `${currentAgent.short} (Claude)`,
                badge: "CLAUDE",
                color: "#a855f7",
                thought: msg.compareResult.claudeThought,
                response: msg.compareResult.claude,
                imageUrl: msg.imageUrl,
              });
            }
            if (activeTab === "all" || activeTab === "gemini") {
              multiResponses.push({
                agentId: `${currentAgent.id}-gemini`,
                name: `${currentAgent.short} (Gemini)`,
                badge: "GEMINI",
                color: "#f59e0b",
                thought: msg.compareResult.geminiThought,
                response: msg.compareResult.gemini,
                imageUrl: msg.imageUrl,
              });
            }

            const compareMsg: Message = {
              ...msg,
              isMultiAgent: true,
              multiResponses,
            };

            return (
              <div key={msg.id} className="w-full">
                <MultiAgentResponseCard msg={compareMsg} lang={lang} onSpeak={onSpeak} />
              </div>
            );
          }

          // Regular or multi-agent response
          return (
            <div key={msg.id} className="w-full">
              <MultiAgentResponseCard msg={msg} lang={lang} onSpeak={onSpeak} />
            </div>
          );
        })}

        {/* Loading / Thinking State */}
        {isLoading && (
          <ChatWaitingAnimation 
            currentAgent={currentAgent} 
            compareEnabled={compareEnabled} 
            lang={lang} 
          />
        )}

        <div ref={logEndRef} />
      </div>

      {messages.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none select-none opacity-60">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
            <Info className="w-5 h-5 text-zinc-400" />
          </div>
          <h4 className="font-semibold text-sm text-zinc-200">
            {currentAgent.name}
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-[260px] leading-relaxed">
            {lang === "de"
              ? "Stelle eine Frage oder erteile eine Aufgabe."
              : "Ask a question or enter a task."}
          </p>
        </div>
      )}

      {/* Docked bottom API connector */}
      <div className="p-2.5 border-t border-zinc-800 bg-zinc-950 flex-shrink-0 z-20">
        <ChatApiConnector
          geminiKey={geminiKey}
          onKeySaved={onSaveGeminiKey}
          lang={lang}
          agentName={currentAgent?.name}
          agentColor={currentAgent?.color}
          compact
        />
      </div>
    </div>
  );
};
