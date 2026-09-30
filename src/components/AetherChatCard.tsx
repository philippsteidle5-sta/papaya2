import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowUp, 
  ImageIcon, 
  Mic, 
  X, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Volume2,
  VolumeX
} from "lucide-react";
import { AgentConfig, Message, CommunicationScope } from "../types";
import { MultiAgentResponseCard } from "./MultiAgentResponseCard";
import { ChatWaitingAnimation } from "./ChatWaitingAnimation";
import { extractImagesFromPasteEvent } from "../utils/pasteImage";
import { isVideoUrl } from "../utils/mediaUtils";
import { ThinkingOrb } from "thinking-orbs";
import { AgentModeSegmentControl } from "./AgentModeSegmentControl";

// ∴ Constellation Signature Icon from user reference
export const ConstellationIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    aria-hidden="true"
  >
    <circle cx="12" cy="6.5" r="1.75" />
    <circle cx="6.5" cy="17" r="1.75" />
    <circle cx="17.5" cy="17" r="1.75" />
  </svg>
);

interface AetherChatCardProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  currentAgent: AgentConfig;
  messages: Message[];
  isLoading: boolean;
  inputText: string;
  onChangeInputText: (text: string) => void;
  onSendMessage: (textToSend?: string) => void;
  onClearChat?: () => void;
  onOpenMultiAgentChat?: () => void;
  micActive?: boolean;
  onToggleMic?: () => void;
  onImageSelect?: (file: File) => void;
  onImagesSelect?: (files: FileList | File[]) => void;
  effectiveImages?: string[];
  onRemoveImage?: (index: number) => void;
  onClearImage?: () => void;
  onSpeak?: (text: string, agentId?: string) => void;
  agentColorMap?: Record<string, string>;
  onOpenAgentSyncSynthesis?: () => void;
  onOpenVoiceConference?: (topic?: string) => void;
  isAllMode?: boolean;
  isBig3Mode?: boolean;
  compareEnabled?: boolean;
  lang?: "de" | "en";
  muted?: boolean;
  onToggleMute?: () => void;
  communicationScope?: CommunicationScope;
  onSelectCommunicationScope?: (scope: CommunicationScope) => void;
}

export const AetherChatCard: React.FC<AetherChatCardProps> = ({
  isOpen,
  onToggleOpen,
  currentAgent,
  messages,
  isLoading,
  inputText,
  onChangeInputText,
  onSendMessage,
  onClearChat,
  onOpenMultiAgentChat,
  micActive = false,
  onToggleMic,
  onImageSelect,
  onImagesSelect,
  effectiveImages = [],
  onClearImage,
  onSpeak,
  agentColorMap = {},
  onOpenAgentSyncSynthesis,
  onOpenVoiceConference,
  isAllMode = false,
  isBig3Mode = false,
  compareEnabled = false,
  lang = "de",
  muted = false,
  onToggleMute,
  communicationScope = "SINGLE",
  onSelectCommunicationScope,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "trace">("chat");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeTab, isOpen]);

  // Focus textarea when card opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Track chat opening event for cinematic expansion & energy pulse animation
  const [justOpened, setJustOpened] = useState(false);
  const prevOpenRef = useRef(isOpen);

  useEffect(() => {
    if (!prevOpenRef.current && isOpen) {
      setJustOpened(true);
      const timer = setTimeout(() => setJustOpened(false), 900);
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  const handleSend = () => {
    if (!inputText.trim() && effectiveImages.length === 0) return;
    onSendMessage(inputText);
    onChangeInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeInputText(e.target.value);
    // Auto-adjust height
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onImagesSelect) {
        onImagesSelect(e.target.files);
      } else if (onImageSelect) {
        onImageSelect(e.target.files[0]);
      }
    }
    e.target.value = "";
  };

  const hasMessages = messages.length > 0;
  const agentColor = currentAgent.color || "#00f0ff";

  // Dynamic guidance question from user screenshot ("How can I guide you?")
  const guidanceLabel = lang === "de"
    ? isAllMode ? "Wie kann die Flotte dich führen?" : isBig3Mode ? "Wie kann The Big 3 dich leiten?" : `Wie kann ${currentAgent.short || currentAgent.name} dich unterstützen?`
    : isAllMode ? "How can the Fleet guide you?" : isBig3Mode ? "How can The Big 3 guide you?" : `How can I guide you?`;

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. COLLAPSED PILL: [ ∴  Ask S.Y.N.T.A.X. ] (Matches Image 1)
         ───────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none transition-all duration-300 animate-fade-in">
          <button
            type="button"
            onClick={onToggleOpen}
            className="group relative inline-flex items-center gap-3 px-6 sm:px-7 py-3 rounded-full border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-2xl"
            style={{
              borderColor: "rgba(255, 255, 255, 0.12)",
              background: "linear-gradient(180deg, rgba(14, 16, 26, 0.88), rgba(6, 7, 10, 0.96))",
              boxShadow: "0 18px 45px rgba(0,0,0,0.65), 0 0 24px rgba(255, 122, 89, 0.12), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {/* Ambient hover light sweep */}
            <span className="absolute -top-full -left-1/2 w-2/5 h-[300%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12 opacity-0 group-hover:opacity-100 group-hover:left-[120%] transition-all duration-700 pointer-events-none" />
            
            {/* ThinkingOrb from libraries.dev (size=20 inline) */}
            <span 
              className="flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ color: currentAgent.color || "#ff7a59", filter: `drop-shadow(0 0 6px ${currentAgent.color || "#ff7a59"})` }}
            >
              <ThinkingOrb 
                state={isLoading ? "weaving" : micActive ? "listening" : "breathing"} 
                size={20} 
                theme="dark" 
                color={currentAgent.color || "#ff7a59"} 
              />
            </span>

            {/* Pill Text */}
            <span className="font-sans text-sm font-medium text-zinc-100 group-hover:text-white tracking-normal">
              {lang === "de" ? `Frag ${currentAgent.name}` : `Ask ${currentAgent.name}`}
            </span>

            {/* Message Count Indicator (if active history) */}
            {hasMessages && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full bg-[#ff7a59]/20 border border-[#ff7a59]/40 text-[10px] font-mono text-[#ffb547]">
                {messages.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. EXPANDED AETHER CHAT CARD (With Fluid Opening Animation)
         ───────────────────────────────────────────────────────────── */}
      {justOpened && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-35 pointer-events-none w-52 h-52 rounded-full animate-chat-shockwave"
          style={{
            background: `radial-gradient(circle, ${currentAgent.color || "#ff7a59"}70 0%, ${currentAgent.color || "#ff7a59"}20 50%, transparent 75%)`,
            boxShadow: `0 0 70px ${currentAgent.color || "#ff7a59"}60`,
          }}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div
          id="clean-embedded-chat-card"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col pointer-events-auto select-none transition-all duration-300 animate-chat-open ${
            isExpanded
              ? "w-[min(820px,calc(100vw-32px))] h-[84vh] max-h-[860px]"
              : hasMessages
              ? "w-[min(600px,calc(100vw-32px))] h-[600px] max-h-[78vh]"
              : "w-[min(560px,calc(100vw-32px))]"
          }`}
        >
          {/* Main Card Container */}
          <div
            className="relative flex flex-col w-full h-full rounded-[28px] overflow-hidden transition-all duration-300"
            style={{
              border: `1px solid ${currentAgent.color ? `${currentAgent.color}40` : "rgba(255, 255, 255, 0.12)"}`,
              background: "linear-gradient(180deg, rgba(14, 16, 26, 0.96), rgba(6, 7, 10, 0.985))",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              boxShadow: `0 25px 70px rgba(0,0,0,0.85), 0 0 40px ${currentAgent.color ? `${currentAgent.color}20` : "rgba(255,122,89,0.15)"}, inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.9)`,
            }}
          >
            {/* Top Luminous Neon Energy Beam Sweep on Open */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none z-50 bg-gradient-to-r from-transparent via-current to-transparent opacity-90 animate-pulse"
              style={{
                color: currentAgent.color || "#ff7a59",
                boxShadow: `0 0 16px ${currentAgent.color || "#ff7a59"}`,
              }}
            />

            {/* Clean Top Navigation Bar (Header) */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <ThinkingOrb 
                  state={isLoading ? "weaving" : micActive ? "listening" : "breathing"} 
                  size={20} 
                  theme="dark" 
                  color={agentColor} 
                />
                <span className="font-mono text-xs font-bold text-white tracking-wide">
                  {isAllMode ? "ALL 8 CORES" : isBig3Mode ? "THE BIG 3" : currentAgent.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                  · {isAllMode ? "Matrix" : isBig3Mode ? "Tri-Core" : "Autonomous Core"}
                </span>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 text-zinc-400">
                {/* Mode Tabs (Chat / Trace) */}
                {hasMessages && (
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] font-mono mr-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("chat")}
                      className={`px-2 py-0.5 rounded-md transition font-bold cursor-pointer ${
                        activeTab === "chat" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("trace")}
                      className={`px-2 py-0.5 rounded-md transition font-bold cursor-pointer ${
                        activeTab === "trace" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Trace
                    </button>
                  </div>
                )}

                {hasMessages && onClearChat && (
                  <button
                    type="button"
                    onClick={onClearChat}
                    className="p-1 rounded-lg hover:bg-white/10 hover:text-red-400 transition cursor-pointer"
                    title="Chatverlauf leeren"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {onOpenMultiAgentChat && (
                  <button
                    type="button"
                    onClick={onOpenMultiAgentChat}
                    className="p-1 rounded-lg hover:bg-white/10 hover:text-cyan-300 transition cursor-pointer hidden sm:block"
                    title="Im Vollbild öffnen"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}

                {onToggleMute && (
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className={`p-1 rounded-lg transition cursor-pointer flex items-center ${
                      muted
                        ? "text-rose-400 bg-rose-500/15 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                    title={
                      muted
                        ? "Audio stummgeschaltet (Klicken zum Aktivieren)"
                        : "Audio aktiv (Klicken zum Stummschalten)"
                    }
                  >
                    {muted ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer hidden sm:block"
                  title={isExpanded ? "Verkleinern" : "Vergrößern"}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={onToggleOpen}
                  className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title="Schließen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Conversation Stream (Visible when messages exist) */}
            {hasMessages && (
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent select-text"
              >
                {activeTab === "chat" ? (
                  <>
                    {messages.map((msg) => {
                      const isUser = msg.role === "user";

                      if (isUser) {
                        return (
                          <div
                            key={msg.id}
                            className="self-end max-w-[85%] ml-auto p-3.5 rounded-2xl rounded-tr-sm text-[#f2ede6] shadow-sm space-y-1 font-sans text-sm"
                            style={{
                              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))",
                              border: "1px solid rgba(255, 255, 255, 0.10)",
                            }}
                          >
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pb-0.5">
                              <span>Du</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{msg.timestamp}</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                            {/* Uploaded images/videos */}
                            {((msg.imageUrls && msg.imageUrls.length > 0) || msg.imageUrl) && (
                              <div className="mt-2 grid gap-1.5 rounded-xl overflow-hidden grid-cols-2">
                                {(msg.imageUrls && msg.imageUrls.length > 0 ? msg.imageUrls : [msg.imageUrl!]).map((url, imgIdx) => {
                                  const isVid = isVideoUrl(url);
                                  return (
                                    <div key={imgIdx} className="relative rounded-lg overflow-hidden border border-white/10 bg-black">
                                      {isVid ? (
                                        <video src={url} controls playsInline className="w-full h-auto max-h-48 object-cover" />
                                      ) : (
                                        <img src={url} alt={`Upload ${imgIdx + 1}`} className="w-full h-auto max-h-48 object-cover" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Agent response
                      return (
                        <div key={msg.id} className="w-full">
                          <MultiAgentResponseCard
                            msg={msg}
                            lang={lang}
                            onSpeak={onSpeak}
                            agentColorMap={agentColorMap}
                            onOpenAgentSyncSynthesis={onOpenAgentSyncSynthesis}
                            onOpenVoiceConference={onOpenVoiceConference}
                          />
                        </div>
                      );
                    })}

                    {isLoading && (
                      <ChatWaitingAnimation
                        currentAgent={currentAgent}
                        compareEnabled={compareEnabled}
                        lang={lang}
                      />
                    )}
                  </>
                ) : (
                  /* Trace view */
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-3">
                    <span className="text-[#ffb547] font-bold block">
                      ⚡ SYNAPSE EXECUTION LOG:
                    </span>
                    {messages.map((m) => (
                      <div key={m.id} className="space-y-1 border-b border-white/5 pb-2">
                        <span className="text-zinc-500">[{m.timestamp}] {m.agentId || m.role}:</span>
                        <p className="text-zinc-300 whitespace-pre-wrap pl-2 border-l border-white/10">
                          {m.thought || m.content.slice(0, 160) + "..."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Prompts (When zero messages exist) */}
            {!hasMessages && (
              <div className="px-5 pt-3.5 pb-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffb547]" />
                    Schnellstart-Vorschläge
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    0ms Latenz
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {(isAllMode ? [
                    "Analysiert mein Projekt im All-8-Verbund",
                    "Teilt Code-, Security- & Wachstumsaufgaben auf",
                  ] : isBig3Mode ? [
                    "Analysiert System-Architektur & Business-Strategie",
                    "Entwickelt einen schnellen Fullstack-Masterplan",
                  ] : [
                    "Analysiere die aktuelle System-Architektur",
                    "Welche Hebel optimieren Conversion und Geschwindigkeit?",
                  ]).map((promptText, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => onSendMessage(promptText)}
                      className="text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 text-zinc-200 hover:text-white transition flex items-center justify-between group cursor-pointer text-xs"
                    >
                      <span className="truncate pr-1">{promptText}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-[#ffb547] transition shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                RECESSED INPUT CARD (Directly from Image 2)
               ───────────────────────────────────────────────────────── */}
            <div className="p-3 sm:p-4">
              <div
                className="relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200"
                style={{
                  background: "#0b0d14",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {/* Uploaded File Chips */}
                {effectiveImages.length > 0 && (
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/5 overflow-x-auto text-[10px] font-mono">
                    <span className="text-zinc-400">{effectiveImages.length} Anhang(e):</span>
                    <button
                      type="button"
                      onClick={onClearImage}
                      className="text-red-400 hover:underline cursor-pointer"
                    >
                      Alle entfernen
                    </button>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                />

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  rows={hasMessages ? 2 : 2}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onPaste={(e) => {
                    const files = extractImagesFromPasteEvent(e);
                    if (files.length > 0) {
                      e.preventDefault();
                      if (onImagesSelect) onImagesSelect(files);
                      else if (onImageSelect) onImageSelect(files[0]);
                    }
                  }}
                  placeholder={
                    micActive
                      ? "Höre zu... Sprich jetzt..."
                      : lang === "de"
                      ? "Is the sound quality comparable to top ear buds on the market? (oder tippe deine Frage...)"
                      : "Is the sound quality comparable to top ear buds on the market?"
                  }
                  className="w-full bg-transparent resize-none outline-none border-none text-[#f2ede6] placeholder:text-[#6f7382] font-sans text-sm sm:text-[14.5px] leading-relaxed selection:bg-[#ff7a59]/30"
                />

                {/* "Press Enter to send" Helper Text (Directly from Image 2) */}
                <div className="flex items-center justify-end pt-1">
                  <span className="text-[11px] font-sans text-zinc-400/75 tracking-tight select-none font-mono">
                    Press Enter to send
                  </span>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  BOTTOM STATUS & BRANDING BAR (Directly from Image 2)
                  [ ∴                 How can I guide you?         (actions) ]
                 ───────────────────────────────────────────────────────── */}
              <div className="flex items-center justify-between pt-3 px-1.5">
                {/* Left: ThinkingOrb in size=20 */}
                <div className="flex items-center gap-2">
                  <span 
                    className="transition-transform flex items-center justify-center"
                    style={{ color: currentAgent.color || "#ff7a59", filter: `drop-shadow(0 0 6px ${currentAgent.color || "#ff7a59"})` }}
                    title={`ThinkingOrb: ${isLoading ? "solving" : micActive ? "listening" : "connecting"}`}
                  >
                    <ThinkingOrb 
                      state={isLoading ? "solving" : micActive ? "listening" : "connecting"} 
                      size={20} 
                      theme="dark" 
                      color={currentAgent.color || "#ff7a59"} 
                    />
                  </span>
                </div>

                {/* Center: "How can I guide you?" prompt */}
                <div className="text-center font-sans text-sm font-medium text-zinc-200/90 tracking-tight">
                  {guidanceLabel}
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                    title="Bild oder Video anhängen"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Mic Toggle Button */}
                  {onToggleMic && (
                    <button
                      type="button"
                      onClick={onToggleMic}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        micActive
                          ? "bg-amber-500/30 text-amber-300 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse"
                          : "text-zinc-400 hover:text-amber-300 hover:bg-white/[0.06]"
                      }`}
                      title={micActive ? "Mikrofon aktiv" : "Spracheingabe starten"}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() && effectiveImages.length === 0}
                    className={`p-2 rounded-xl transition-all cursor-pointer font-bold ${
                      inputText.trim() || effectiveImages.length > 0
                        ? "bg-[#ff7a59] text-zinc-950 hover:bg-[#ff6540] shadow-[0_0_15px_rgba(255,122,89,0.45)]"
                        : "text-zinc-600 cursor-not-allowed bg-white/[0.04]"
                    }`}
                    title="Nachricht senden"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
