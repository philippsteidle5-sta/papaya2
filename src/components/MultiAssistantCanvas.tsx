import React, { useEffect, useRef, useState } from "react";
import { AgentConfig, CommunicationScope, Message, AgentMultiResponse } from "../types";
import { ParticleSphere } from "./ParticleSphere";
import { ParticleVoiceOrb } from "./ParticleVoiceOrb";
import { MazeCoreStyling } from "./MazeCoreCustomizer";
import { AllAgentsVoiceMatrixCanvas } from "./AllAgentsVoiceMatrixCanvas";
import { TheBig3VoiceMatrixCanvas } from "./TheBig3VoiceMatrixCanvas";
import { useTheme } from "../utils/themeStore";
import { MultiAgentResponseCard } from "./MultiAgentResponseCard";
import { ChatWaitingAnimation } from "./ChatWaitingAnimation";
import { extractImagesFromPasteEvent } from "../utils/pasteImage";
import { isVideoUrl } from "../utils/mediaUtils";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  ArrowUpRight, 
  Sparkles, 
  Globe,
  X, 
  Minimize2, 
  Maximize2,
  Send,
  Mic,
  ImageIcon,
  Film,
  Trash2,
  Brain,
  Zap,
  Terminal,
  Activity,
  MessageSquare,
  Volume2,
  Calendar,
} from "lucide-react";
import { ChronosCalendarWidget } from "./ChronosCalendarWidget";
import { LiquidJellyNav } from "./LiquidJellyNav";
import { AetherChatCard } from "./AetherChatCard";
import { PapayaConstellationBackground } from "./PapayaConstellationBackground";

interface MultiAssistantCanvasProps {
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  state: "idle" | "listening" | "thinking" | "speaking" | "";
  micLevel: number;
  speakingLevel: number;
  compareEnabled?: boolean;
  secondaryAgent?: AgentConfig;
  transitionDirection?: "next" | "prev";
  customShape?: any;
  customColor?: string;
  particleDensity?: number;
  particleSpeed?: number;
  audioSensitivity?: number;
  coreStyling?: MazeCoreStyling;
  communicationScope?: CommunicationScope;
  activeSpeakingAgentId?: string | null;
  isScreenSharing?: boolean;
  onSelectAgent?: (agent: AgentConfig) => void;
  onOpenGmailInbox?: () => void;
  onOpenVeoStudio?: () => void;
  onOpenMemoryVault?: () => void;
  // Modern Embedded Chat Props
  messages?: Message[];
  onSendMessage?: (msg: string) => void;
  isLoading?: boolean;
  onToggleMic?: () => void;
  micActive?: boolean;
  onImageSelect?: (file: File) => void;
  selectedImage?: string | null;
  selectedImages?: string[];
  onImagesSelect?: (files: FileList | File[]) => void;
  onRemoveImage?: (index: number) => void;
  onClearImage?: () => void;
  onClearChat?: () => void;
  onSpeak?: (text: string, agentId?: string) => void;
  liveTranscript?: string;
  lang?: "de" | "en";
  onToggleLang?: () => void;
  onOpenAgentSyncSynthesis?: () => void;
  onOpenVoiceConference?: (topic?: string) => void;
  agentColorMap?: Record<string, string>;
  onOpenMultiAgentChat?: () => void;
  geminiKey?: string;
  onSaveGeminiKey?: (key: string) => void;
  // Clean Focus Dock enhancements
  onSelectCommunicationScope?: (scope: CommunicationScope) => void;
  onOpenAgentInspector?: (agentId?: string) => void;
  onToggleCoreShape?: () => void;
  isFocusMode?: boolean;
  onOpenCalendar?: () => void;
  isCalendarOpen?: boolean;
  muted?: boolean;
  onToggleMute?: () => void;
  isLayoutInstalled?: boolean;
  onOpenLayout?: () => void;
  isLayoutOpen?: boolean;
  isCalendarInstalled?: boolean;
  isGoogleMapsInstalled?: boolean;
  isGoogleMapsOpen?: boolean;
  onToggleGoogleMaps?: () => void;
  isGoalsInstalled?: boolean;
  isGoalsOpen?: boolean;
  onToggleGoals?: () => void;
}

export const MultiAssistantCanvas = React.memo<MultiAssistantCanvasProps>(({
  agents,
  currentAgent,
  state,
  micLevel,
  speakingLevel,
  compareEnabled = false,
  secondaryAgent,
  transitionDirection = "next",
  customShape,
  customColor,
  particleDensity,
  particleSpeed,
  audioSensitivity,
  coreStyling,
  communicationScope = "SINGLE",
  activeSpeakingAgentId = null,
  isScreenSharing = false,
  onSelectAgent,
  onOpenGmailInbox,
  onOpenVeoStudio,
  onOpenMemoryVault,
  onOpenMultiAgentChat,
  // Modern Embedded Chat Props
  messages = [],
  onSendMessage,
  isLoading = false,
  onToggleMic,
  micActive = false,
  onImageSelect,
  selectedImage = null,
  selectedImages = [],
  onImagesSelect,
  onRemoveImage,
  onClearImage,
  onClearChat,
  onSpeak,
  liveTranscript = "",
  lang = "de",
  onToggleLang,
  onOpenAgentSyncSynthesis,
  onOpenVoiceConference,
  agentColorMap = {},
  geminiKey,
  onSaveGeminiKey,
  onSelectCommunicationScope,
  onOpenAgentInspector,
  onToggleCoreShape,
  isFocusMode = false,
  onOpenCalendar,
  isCalendarOpen,
  muted = false,
  onToggleMute,
  isLayoutInstalled = false,
  onOpenLayout,
  isLayoutOpen = false,
  isCalendarInstalled = true,
  isGoogleMapsInstalled = false,
  isGoogleMapsOpen = false,
  onToggleGoogleMaps,
  isGoalsInstalled = true,
  isGoalsOpen = false,
  onToggleGoals,
}) => {
  const { isModern } = useTheme();
  const [prevAgentId, setPrevAgentId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeDirection, setActiveDirection] = useState<"next" | "prev">("next");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [internalCalendarOpen, setInternalCalendarOpen] = useState(false);
  const calendarActive = isCalendarOpen !== undefined ? isCalendarOpen : internalCalendarOpen;

  const handleToggleCalendar = () => {
    if (onOpenCalendar) {
      onOpenCalendar();
    } else {
      setInternalCalendarOpen((prev) => !prev);
    }
  };
  const [isAgentPickerOpen, setIsAgentPickerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "trace">("chat");
  const [inputText, setInputText] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevAgentIdRef = useRef<string>(currentAgent.id);

  // Harmonized image list supporting both multi-image and legacy single image
  const effectiveImages: string[] = selectedImages && selectedImages.length > 0
    ? selectedImages
    : (selectedImage ? [selectedImage] : []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeTab]);

  const handleInternalSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && effectiveImages.length === 0) return;
    onSendMessage?.(inputText);
    setInputText("");
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

  const currentIndex = agents.findIndex((a) => a.id === currentAgent.id);
  const handlePrevAgent = () => {
    if (agents.length === 0) return;
    const prevIdx = (currentIndex - 1 + agents.length) % agents.length;
    onSelectAgent?.(agents[prevIdx]);
  };

  const handleNextAgent = () => {
    if (agents.length === 0) return;
    const nextIdx = (currentIndex + 1) % agents.length;
    onSelectAgent?.(agents[nextIdx]);
  };

  // Hyperspace warp audio synthesis
  const playWarpSound = (dir: "next" | "prev") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const startFreq = dir === "next" ? 220 : 660;
      const endFreq = dir === "next" ? 880 : 330;

      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  useEffect(() => {
    if (currentAgent.id !== prevAgentIdRef.current) {
      const oldId = prevAgentIdRef.current;
      prevAgentIdRef.current = currentAgent.id;

      setPrevAgentId(oldId);
      setIsTransitioning(true);
      const dir: "next" | "prev" = transitionDirection === "prev" ? "prev" : "next";
      setActiveDirection(dir);
      playWarpSound(dir);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevAgentId(null);
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [currentAgent.id, transitionDirection]);

  const isAllMode = communicationScope === "ALL" || currentAgent.id === "ALL";
  const isBig3Mode = communicationScope === "THE_BIG_3" || currentAgent.id === "THE_BIG_3";
  const isMatrixMode = isAllMode || isBig3Mode;

  const handleOpenMatrixChat = () => {
    setIsChatOpen(true);
    setActiveTab("chat");
    if (onOpenMultiAgentChat) {
      onOpenMultiAgentChat();
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none"
      role="region"
      aria-label="PapayaOS Clean Focus Canvas System"
    >
      {/* 3D Backdrop Canvas: All 8 Matrix, The Big 3 Tri-Core, or Single Agent Particles */}
      {isAllMode ? (
        <div className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-auto bg-black">
          <AllAgentsVoiceMatrixCanvas
            agents={agents}
            currentAgent={currentAgent}
            activeSpeakingAgentId={activeSpeakingAgentId}
            state={state}
            micLevel={micLevel}
            speakingLevel={speakingLevel}
            isScreenSharing={isScreenSharing}
            onSelectAgent={onSelectAgent}
            onOpenGmailInbox={onOpenGmailInbox}
            onOpenVeoStudio={onOpenVeoStudio}
            onOpenMemoryVault={onOpenMemoryVault}
            onOpenChat={handleOpenMatrixChat}
          />
        </div>
      ) : isBig3Mode ? (
        <div className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-auto bg-black">
          <TheBig3VoiceMatrixCanvas
            agents={agents}
            currentAgent={currentAgent}
            activeSpeakingAgentId={activeSpeakingAgentId}
            state={state}
            micLevel={micLevel}
            speakingLevel={speakingLevel}
            isScreenSharing={isScreenSharing}
            onSelectAgent={onSelectAgent}
            onOpenChat={handleOpenMatrixChat}
          />
        </div>
      ) : (
        <>
          {/* Authentic PapayaOS Stardust Constellation Background */}
          <PapayaConstellationBackground accentColor={currentAgent.color} />

          {/* Subtle Hyperspace Pulse Wave */}
          {isTransitioning && (
            <div
              style={{
                borderColor: `${currentAgent.color}60`,
                boxShadow: `0 0 60px ${currentAgent.color}40`,
              }}
              className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full border animate-ping pointer-events-none z-20"
            />
          )}

          {agents
            .filter((agent) => agent.id === currentAgent.id || (isTransitioning && agent.id === prevAgentId) || (compareEnabled && secondaryAgent?.id === agent.id))
            .map((agent) => {
            const isCurrent = agent.id === currentAgent.id;
            const isPrev = agent.id === prevAgentId && isTransitioning;
            const isSecondary = compareEnabled && secondaryAgent?.id === agent.id;
            const isActive = isCurrent || isSecondary;

            let animClass = "";
            if (isPrev) {
              animClass = activeDirection === "next"
                ? "animate-agent-fly-out-left z-20 pointer-events-none"
                : "animate-agent-fly-out-right z-20 pointer-events-none";
            } else if (isCurrent && isTransitioning) {
              animClass = activeDirection === "next"
                ? "animate-agent-land-in-right is-active opacity-100 z-30 pointer-events-auto"
                : "animate-agent-land-in-left is-active opacity-100 z-30 pointer-events-auto";
            } else if (isActive) {
              animClass = "is-active opacity-100 pointer-events-auto z-30 transition-opacity duration-300";
            } else {
              animClass = "opacity-0 pointer-events-none z-0";
            }

            const defaultAgentColor = agent.color || "#ff6b35";
            const agentOverride = coreStyling?.agentOverrides?.[agent.id];

            const resolvedShape = (agentOverride?.shape && agentOverride.shape !== "auto")
              ? agentOverride.shape
              : (customShape && customShape !== "auto" ? customShape : (coreStyling?.shape ?? "auto"));

            const resolvedColor = (agentOverride?.color && agentOverride.color !== "auto")
              ? agentOverride.color
              : (customColor && customColor !== "auto" ? customColor : (coreStyling?.color && coreStyling.color !== "auto" ? coreStyling.color : defaultAgentColor));

            const resolvedDensity = agentOverride?.density ?? particleDensity ?? coreStyling?.density ?? 5000;
            const resolvedSpeed = agentOverride?.speed ?? particleSpeed ?? coreStyling?.speed ?? 1.0;
            const resolvedAudioSens = agentOverride?.audioSensitivity ?? audioSensitivity ?? coreStyling?.audioSensitivity ?? 1.0;

            return (
              <div
                key={agent.id}
                id={`assistant-core-${agent.id}`}
                data-agent-id={agent.id}
                data-active={isActive || isPrev}
                aria-hidden={!isActive}
                className={`absolute inset-0 w-full h-full ${animClass}`}
              >
                {(isActive || isPrev) && (
                  resolvedShape === "particle-orb" ? (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto">
                      <ParticleVoiceOrb
                        responsive
                        type="custom"
                        primaryColor={resolvedColor}
                        intensity={isActive ? (state === "speaking" ? Math.max(0.3, speakingLevel) : state === "listening" ? Math.max(0.3, micLevel) : 0.08) : 0}
                        isLive={isActive && (state === "speaking" || state === "listening")}
                        state={isActive ? state : "idle"}
                        themeStyle="modern"
                        enableDrag={true}
                      />
                    </div>
                  ) : (
                    <ParticleSphere
                      state={isActive ? state : "idle"}
                      micLevel={isActive ? micLevel : 0}
                      speakingLevel={isActive ? speakingLevel : 0}
                      agentColor={resolvedColor}
                      shape={agent.shape}
                      currentAgentId={agent.id}
                      isActive={isActive || isPrev}
                      customShape={resolvedShape}
                      customColor={resolvedColor !== defaultAgentColor ? resolvedColor : undefined}
                      particleDensity={resolvedDensity}
                      particleSpeed={resolvedSpeed}
                      audioSensitivity={resolvedAudioSens}
                    />
                  )
                )}
              </div>
            );
          })}
        </>
      )}

      {/* AGENT QUICK-SWITCH MODAL */}
      {isAgentPickerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto"
          onClick={() => setIsAgentPickerOpen(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-3xl bg-[#080911]/95 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b35] animate-pulse" />
                  KI-Spezialisten Cores
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Wähle einen autonomen Core für deine nächste Aufgabe:</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsAgentPickerOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {agents.map((ag) => {
                const isSelected = ag.id === currentAgent.id;
                return (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => {
                      onSelectAgent?.(ag);
                      setIsAgentPickerOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3.5 cursor-pointer group ${
                      isSelected
                        ? "bg-white/[0.08] border-white/30 shadow-md ring-1 ring-white/20"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: ag.color || "#ff6b35" }}
                    >
                      {(ag.short || ag.name).slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-sm font-bold text-white group-hover:text-cyan-300 transition">
                          {ag.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            AKTIV
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">
                        {ag.tag || "Autonomer KI Core"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED LIQUID JELLY FLOATING COMMAND DOCK - RIGHT SIDE VERTICAL RAIL */}
      <div 
        id="clean-focus-dock"
        className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 pointer-events-auto select-none transition-all duration-300 flex items-center justify-center"
      >
        <LiquidJellyNav
          currentAgent={currentAgent}
          onOpenAgentPicker={() => setIsAgentPickerOpen(true)}
          communicationScope={communicationScope}
          onSelectCommunicationScope={onSelectCommunicationScope}
          isChatOpen={isChatOpen}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          chatMessageCount={messages.length}
          isCalendarOpen={calendarActive}
          onToggleCalendar={handleToggleCalendar}
          micActive={micActive}
          onToggleMic={onToggleMic}
          onOpenMemoryVault={onOpenMemoryVault}
          onOpenAgentInspector={onOpenAgentInspector}
          onToggleCoreShape={onToggleCoreShape}
          isLayoutInstalled={isLayoutInstalled}
          onOpenLayout={onOpenLayout}
          isLayoutOpen={isLayoutOpen}
          isCalendarInstalled={isCalendarInstalled}
          isGoogleMapsInstalled={isGoogleMapsInstalled}
          isGoogleMapsOpen={isGoogleMapsOpen}
          onToggleGoogleMaps={onToggleGoogleMaps}
          isGoalsInstalled={isGoalsInstalled}
          isGoalsOpen={isGoalsOpen}
          onToggleGoals={onToggleGoals}
        />
      </div>

      {/* AETHER CHAT SYSTEM (Collapsed Pill in Image 1 & Recessed Floating Glass Card in Image 2) */}
      <AetherChatCard
        isOpen={isChatOpen}
        onToggleOpen={() => setIsChatOpen(!isChatOpen)}
        currentAgent={currentAgent}
        messages={messages}
        isLoading={isLoading}
        inputText={inputText}
        onChangeInputText={setInputText}
        onSendMessage={(text) => onSendMessage?.(text || inputText)}
        onClearChat={onClearChat}
        onOpenMultiAgentChat={onOpenMultiAgentChat}
        micActive={micActive}
        onToggleMic={onToggleMic}
        onImageSelect={onImageSelect}
        onImagesSelect={onImagesSelect}
        effectiveImages={effectiveImages}
        onClearImage={onClearImage}
        onSpeak={onSpeak}
        agentColorMap={agentColorMap}
        onOpenAgentSyncSynthesis={onOpenAgentSyncSynthesis}
        onOpenVoiceConference={onOpenVoiceConference}
        isAllMode={isAllMode}
        isBig3Mode={isBig3Mode}
        compareEnabled={compareEnabled}
        lang={lang}
        muted={muted}
        onToggleMute={onToggleMute}
        communicationScope={communicationScope}
        onSelectCommunicationScope={onSelectCommunicationScope}
      />

      {/* Standalone Fallback Calendar in Focus Canvas */}
      {!onOpenCalendar && internalCalendarOpen && (
        <ChronosCalendarWidget
          standalone={true}
          onClose={() => setInternalCalendarOpen(false)}
          agentColor={currentAgent.color}
          lang={lang}
        />
      )}
    </div>
  );
});

export default MultiAssistantCanvas;
