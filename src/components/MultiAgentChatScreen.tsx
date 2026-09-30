import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  ImageIcon,
  X,
  RotateCcw,
  Copy,
  Check,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Sparkles,
  Crown,
  Minimize2,
  Maximize2,
  FileText,
  Palette,
  Brain,
  Film,
  Play,
} from "lucide-react";
import { Message, AgentConfig } from "../types";
import { ParticleSphere } from "./ParticleSphere";
import { ParticleVoiceOrb } from "./ParticleVoiceOrb";
import { UserRole, isAgentAllowed } from "../rbac";
import { AgentSpeechAnimation } from "./AgentSpeechAnimation";
import { MultiAgentResponseCard } from "./MultiAgentResponseCard";
import { copyToClipboard } from "../utils/clipboard";
import { extractImageFromPasteEvent, extractImagesFromPasteEvent } from "../utils/pasteImage";
import { compressImage, compressImages } from "../utils/compressImage";
import { isVideoUrl } from "../utils/mediaUtils";
import { useTheme } from "../utils/themeStore";
import { ChatApiConnector } from "./ChatApiConnector";
import { ChatWaitingAnimation } from "./ChatWaitingAnimation";
import { ThinkingOrb } from "thinking-orbs";


interface MultiAgentChatScreenProps {
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  onSelectAgent?: (agent: AgentConfig) => void;
  agentChats: Record<string, Message[]>;
  onSendMessageToAgent: (
    agentId: string,
    text: string,
    imageUrl?: string,
    forcedScope?: "SINGLE" | "ALL" | "THE_BIG_3",
    imageUrls?: string[]
  ) => Promise<void>;
  onClearAllChats: () => void;
  onClose: () => void;
  geminiKey: string;
  onSaveGeminiKey?: (key: string) => void;
  onOpenSettings: () => void;
  userRole?: UserRole;
  onOpenRoleManager?: () => void;
  onOpenAgentInspector?: (agentId?: string) => void;
  onSpeak?: (text: string, agentId?: string) => void;
  lang?: "de" | "en";
}

export const MultiAgentChatScreen = React.memo<MultiAgentChatScreenProps>(({
  agents,
  currentAgent,
  onSelectAgent,
  agentChats,
  onSendMessageToAgent,
  onClearAllChats,
  onClose,
  geminiKey,
  onSaveGeminiKey,
  userRole = "SOVEREIGN" as UserRole,
  onOpenRoleManager,
  onOpenAgentInspector,
  onSpeak,
  lang = "de",
}) => {
  const { theme, toggleTheme, isModern } = useTheme();
  const allowedAgents = agents.filter((a) => isAgentAllowed(userRole, a.id));
  const [activeAgent, setActiveAgent] = useState<AgentConfig>(() => {
    return isAgentAllowed(userRole, currentAgent.id) ? currentAgent : (allowedAgents[0] || currentAgent);
  });
  const [chatScopeMode, setChatScopeMode] = useState<"SINGLE" | "THE_BIG_3" | "ALL">("SINGLE");
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev">("next");
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [isStageMinimized, setIsStageMinimized] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize when currentAgent or userRole changes externally
  useEffect(() => {
    if (isAgentAllowed(userRole, currentAgent.id)) {
      setActiveAgent(currentAgent);
    } else if (allowedAgents.length > 0) {
      setActiveAgent(allowedAgents[0]);
    }
  }, [currentAgent.id, userRole]);

  // Index and prev/next calculations for arrow navigation within allowed agents
  const currentIndex = Math.max(0, allowedAgents.findIndex((a) => a.id === activeAgent.id));
  const prevIndex = (currentIndex - 1 + allowedAgents.length) % (allowedAgents.length || 1);
  const nextIndex = (currentIndex + 1) % (allowedAgents.length || 1);

  const prevAgent = allowedAgents[prevIndex] || activeAgent;
  const nextAgent = allowedAgents[nextIndex] || activeAgent;

  const getAgentEffectiveColor = (ag: AgentConfig) => {
    if (isModern && (ag.id === "maze" || ag.id === "syntax")) {
      return "#a855f7";
    }
    return ag.color;
  };

  const activeAgentEffectiveColor = getAgentEffectiveColor(activeAgent);
  const prevAgentEffectiveColor = getAgentEffectiveColor(prevAgent);
  const nextAgentEffectiveColor = getAgentEffectiveColor(nextAgent);

  const handlePrevAgent = () => {
    setTransitionDirection("prev");
    const target = prevAgent;
    setActiveAgent(target);
    if (onSelectAgent) {
      onSelectAgent(target);
    }
  };

  const handleNextAgent = () => {
    setTransitionDirection("next");
    const target = nextAgent;
    setActiveAgent(target);
    if (onSelectAgent) {
      onSelectAgent(target);
    }
  };

  // Keyboard navigation with left/right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevAgent();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextAgent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, agents]);

  // Messages for active agent ONLY
  const activeAgentMessages = agentChats[activeAgent.id] || [];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeAgentMessages.length, isLoading, activeAgent.id]);

  // Helper components for formatting chat code blocks and text
const CodeBlock: React.FC<{ lang: string; code: string }> = React.memo(({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code.trim());
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative bg-[#03060d] border border-cyan-500/20 rounded-lg my-2 overflow-hidden shadow-inner">
      <div className="flex justify-between items-center px-4 py-1.5 bg-[#08101e] border-b border-cyan-500/15">
        <span className="font-mono text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
          {lang || "CODE"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-300 hover:text-white cursor-pointer bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 px-2 py-0.5 rounded transition"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>KOPIERT</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-cyan-400" />
              <span>KOPIEREN</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs text-[#d5f5ff] overflow-x-auto whitespace-pre leading-relaxed select-text">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
});

const FormattedText: React.FC<{ text: string }> = React.memo(({ text }) => {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1.5">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const lang = match?.[1] || "code";
          const code = match?.[2] || "";
          return <CodeBlock key={idx} lang={lang} code={code} />;
        } else {
          const inlineParts = part.split(/(`[^`\n]+`)/g);
          return (
            <div
              key={idx}
              className="text-sm md:text-base font-sans leading-relaxed whitespace-pre-wrap break-words text-slate-100"
            >
              {inlineParts.map((subPart, subIdx) => {
                if (subPart.startsWith("`") && subPart.endsWith("`")) {
                  return (
                    <code
                      key={subIdx}
                      className="inline-code bg-cyan-950/60 text-cyan-200 font-mono text-xs px-2 py-0.5 rounded border border-cyan-500/20 mx-0.5"
                    >
                      {subPart.slice(1, -1)}
                    </code>
                  );
                }
                return subPart;
              })}
            </div>
          );
        }
      })}
    </div>
  );
});

  const handleImagesSelect = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files);
    const mediaFiles = rawFiles.filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.type.startsWith("video/") ||
        /\.(mp4|webm|mov|mkv|ogg|avi|quicktime)$/i.test(f.name)
    );
    if (mediaFiles.length === 0) return;

    const newMediaItems: string[] = [];
    const imageFiles: File[] = [];

    for (const file of mediaFiles) {
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg|avi|quicktime)$/i.test(file.name);
      if (isVideo) {
        if (file.size > 80 * 1024 * 1024) continue;
        try {
          const videoDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") resolve(reader.result);
              else reject(new Error("Video read failed"));
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          newMediaItems.push(videoDataUrl);
        } catch (e) {
          console.error("Video load error:", e);
        }
      } else {
        imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      try {
        const compressedList = await compressImages(imageFiles, 1280, 0.85);
        newMediaItems.push(...compressedList);
      } catch (e) {
        for (const file of imageFiles) {
          try {
            const imgDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") resolve(reader.result);
                else reject(new Error("Image read failed"));
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            });
            newMediaItems.push(imgDataUrl);
          } catch (err) {}
        }
      }
    }

    if (newMediaItems.length > 0) {
      setSelectedImages((prev) => [...prev, ...newMediaItems]);
    }
  };

  const handleImageSelect = async (file: File) => {
    await handleImagesSelect([file]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearImages = () => {
    setSelectedImages([]);
    setSelectedImage(null);
  };

  // Harmonized image list for active attachment
  const effectiveImages = selectedImages.length > 0
    ? selectedImages
    : (selectedImage ? [selectedImage] : []);

  const handleSend = async () => {
    if ((!input.trim() && effectiveImages.length === 0) || isLoading) return;

    const messageText = input.trim();
    const currentImgs = [...effectiveImages];

    setInput("");
    handleClearImages();
    setIsLoading(true);

    try {
      await onSendMessageToAgent(
        activeAgent.id,
        messageText,
        currentImgs[0] || undefined,
        chatScopeMode,
        currentImgs
      );
    } catch (err) {
      console.error("Error sending message to agent", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isMicListening) {
      setIsMicListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = "de-DE";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsMicListening(true);
      rec.onend = () => setIsMicListening(false);
      rec.onerror = () => setIsMicListening(false);

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      rec.start();
    } catch (e) {
      setIsMicListening(false);
    }
  };

  const getShapeLabel = (shape: string) => {
    switch (shape) {
      case "torus-knot":
        return "TORUS-KNOTEN (QUANTEN-SCHLEIFE)";
      case "gyroscope":
        return "GYROSKOP (ROTIERENDER KERN)";
      case "fusion":
        return "FUSIONSRING (PLASMAPARTIKEL)";
      case "network":
        return "NETZWERK (VIRALE HELIX)";
      case "hourglass":
        return "SANDUHR (CHRONO CORE)";
      case "chart":
        return "CHART-MATRIX (FINANZ-GITTER)";
      case "sphere":
      default:
        return "NEURAL-SPHÄRE (PARTIKELFELD)";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020409] text-white font-sans flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-4 md:px-8 border-b border-cyan-500/20 bg-[#040812] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            style={{
              borderColor: activeAgent.color,
              backgroundColor: `${activeAgent.color}20`,
            }}
            className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg"
          >
            <MessageSquare style={{ color: activeAgent.color }} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-400 font-bold uppercase">
                EINZEL-AGENTEN CHAT
              </span>
              <span
                style={{
                  color: activeAgent.color,
                  borderColor: `${activeAgent.color}40`,
                  backgroundColor: `${activeAgent.color}15`,
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: activeAgent.color }}
                />
                CORE {currentIndex + 1} VON {allowedAgents.length}: {activeAgent.name} ({userRole})
              </span>
            </div>
            <h1 className="font-display font-bold text-lg md:text-xl text-white tracking-wide flex items-center gap-2">
              CHAT MIT {activeAgent.name.toUpperCase()}
            </h1>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Communication Scope Selector Toggle */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-cyan-500/30">
            <button
              onClick={() => setChatScopeMode("SINGLE")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chatScopeMode === "SINGLE"
                  ? "bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title={`Sende Nachrichten exklusiv an ${activeAgent.name}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeAgent.color }} />
              <span>EXKLUSIV {activeAgent.short || activeAgent.name}</span>
            </button>
            <button
              onClick={() => setChatScopeMode("THE_BIG_3")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chatScopeMode === "THE_BIG_3"
                  ? "bg-amber-500/25 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  : "text-slate-400 hover:text-amber-300"
              }`}
              title="Sende Nachrichten an DIE GROSSEN 3 (SYNTAX • NEO • VEGA)"
            >
              <Crown className="w-3 h-3 text-amber-400" />
              <span>THE BIG 3</span>
            </button>
            <button
              onClick={() => setChatScopeMode("ALL")}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                chatScopeMode === "ALL"
                  ? "bg-purple-500/30 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Sende Nachrichten an ALLE 8 Agenten gleichzeitig"
            >
              <Sparkles className="w-3 h-3 text-purple-300" />
              <span>ALLE 8 AGENTEN</span>
            </button>
          </div>

          {onOpenAgentInspector && (
            <button
              onClick={() => onOpenAgentInspector(activeAgent.id)}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm ${
                isModern
                  ? "border-purple-500/40 bg-purple-950/40 hover:bg-purple-600 hover:text-white text-purple-200"
                  : "border-cyan-400/60 bg-cyan-950/70 hover:bg-cyan-500 hover:text-slate-950 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              }`}
              title={`Alle Memories, Prompts & Antworten von ${activeAgent.name} im 3D Universe einsehen`}
            >
              <Brain className={`w-3.5 h-3.5 ${isModern ? "text-purple-300" : "text-cyan-300"} animate-pulse`} />
              <span className="hidden sm:inline">MEMORY ({activeAgent.short})</span>
            </button>
          )}

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              isModern
                ? "border-purple-500/40 bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
                : "border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            }`}
            title={`Design umschalten: Aktuell ${isModern ? "Modern Syntax" : "Cyberpunk Jarvis"}`}
          >
            <Palette className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
            <span className="hidden sm:inline">{isModern ? "MODERN" : "CYBERPUNK"}</span>
          </button>

          <button
            onClick={() => setIsStageMinimized(!isStageMinimized)}
            className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            title={isStageMinimized ? "3D Partikel-Sphäre vergrößern" : "Chat-Ansicht maximieren"}
          >
            {isStageMinimized ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">3D SPHÄRE</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">MINIMIEREN</span>
              </>
            )}
          </button>

          <button
            onClick={onClearAllChats}
            className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 cursor-pointer transition ${
              isModern 
                ? "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                : "border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300"
            }`}
            title="Chatverlauf für diesen Agenten zurücksetzen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LÖSCHEN</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-cyan-400/50 bg-cyan-500/20 hover:bg-cyan-400 hover:text-slate-950 font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 transition duration-200 cursor-pointer shadow-[0_0_15px_rgba(78,232,255,0.2)]"
          >
            <X className="w-4 h-4" />
            <span>SCHLIESSEN</span>
          </button>
        </div>
      </header>

      {/* 8-AGENT DIRECT SWITCH & QUERIES STRIP */}
      <div className="px-4 md:px-8 py-2 bg-[#030611] border-b border-cyan-500/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wider pl-1 hidden md:inline">
          AGENTEN-MATRIX:
        </span>
        {allowedAgents.map((ag) => {
          const isCurrent = ag.id === activeAgent.id;
          return (
            <div key={ag.id} className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => setActiveAgent(ag)}
                style={{
                  borderColor: isCurrent ? ag.color : "rgba(255, 255, 255, 0.12)",
                  backgroundColor: isCurrent ? `${ag.color}25` : "rgba(10, 15, 25, 0.7)",
                  color: isCurrent ? "#ffffff" : "#94a3b8",
                  boxShadow: isCurrent ? `0 0 12px ${ag.color}40` : "none",
                }}
                className="px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer hover:border-cyan-400 hover:text-white"
                title={`Klicken: Zu ${ag.name} wechseln`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ag.color }} />
                <span>{ag.short || ag.name}</span>
              </button>
              {onOpenAgentInspector && (
                <button
                  onClick={() => onOpenAgentInspector(ag.id)}
                  className="p-1 rounded-md bg-cyan-950/60 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                  title={`Queries & REQ Logs von ${ag.name} öffnen`}
                >
                  <FileText className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 3D PARTICLE STAGE (COMPACT OR EXPANDED) */}
      {isStageMinimized ? (
        /* COMPACT / MINIMIZED TOP BAR (MAX CHAT SPACE FOR MOBILE) */
        <div className="px-3 md:px-8 py-2 bg-[#03060f] border-b border-cyan-500/20 flex-shrink-0 relative">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            {/* Left & Right Agent Arrows and Active Agent Badge */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevAgent}
                style={{ borderColor: `${prevAgent.color}50` }}
                className="p-1.5 rounded-lg border bg-black/60 hover:bg-black/90 text-white cursor-pointer transition flex items-center gap-1"
                title={`Vorheriger Agent: ${prevAgent.name}`}
              >
                <ChevronLeft style={{ color: prevAgent.color }} className="w-4 h-4" />
                <span style={{ color: prevAgent.color }} className="hidden sm:inline font-mono text-[10px] uppercase font-bold">
                  {prevAgent.short}
                </span>
              </button>

              <div
                style={{ borderColor: `${activeAgent.color}60`, backgroundColor: `${activeAgent.color}15` }}
                className="px-3 py-1 rounded-lg border flex items-center gap-2 shadow-md"
              >
                <span style={{ color: activeAgent.color }} className="font-display font-bold text-sm tracking-wide uppercase">
                  {activeAgent.name}
                </span>
                <span
                  style={{ color: activeAgent.color, borderColor: `${activeAgent.color}40` }}
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded border bg-black/50 font-bold uppercase hidden sm:inline-block"
                >
                  {activeAgent.short}
                </span>
              </div>

              <button
                onClick={handleNextAgent}
                style={{ borderColor: `${nextAgentEffectiveColor}50` }}
                className="p-1.5 rounded-lg border bg-black/60 hover:bg-black/90 text-white cursor-pointer transition flex items-center gap-1"
                title={`Nächster Agent: ${nextAgent.name}`}
              >
                <span style={{ color: nextAgentEffectiveColor }} className="hidden sm:inline font-mono text-[10px] uppercase font-bold">
                  {nextAgent.short}
                </span>
                <ChevronRight style={{ color: nextAgentEffectiveColor }} className="w-4 h-4" />
              </button>
            </div>

            {/* Mini 3D Particle Sphere + Expand Button on Right */}
            <div className="flex items-center gap-2">
              <div
                style={{ borderColor: activeAgentEffectiveColor, boxShadow: `0 0 10px ${activeAgentEffectiveColor}40` }}
                className="w-8 h-8 rounded-lg border bg-black/80 overflow-hidden flex items-center justify-center relative cursor-pointer"
                onClick={() => setIsStageMinimized(false)}
                title="Klicken zum Vergrößern der 3D Sphäre"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <ParticleSphere
                    state={isLoading ? "thinking" : isMicListening ? "listening" : "idle"}
                    micLevel={isMicListening ? 0.6 : 0.1}
                    speakingLevel={isLoading ? 0.6 : 0.1}
                    agentColor={activeAgentEffectiveColor}
                    shape={activeAgent.shape}
                    currentAgentId={activeAgent.id}
                    isActive={true}
                  />
                </div>
              </div>

              <button
                onClick={() => setIsStageMinimized(false)}
                className="px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/50 hover:bg-cyan-900 text-cyan-300 font-mono text-[10px] flex items-center gap-1 cursor-pointer transition"
                title="3D Ansicht vergrößern"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">3D SPHÄRE</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* EXPANDED FULL 3D STAGE */
        <div className="px-4 md:px-8 py-3 bg-[#03060f] border-b border-cyan-500/20 flex-shrink-0 relative">
          <div
            style={{ borderColor: `${activeAgentEffectiveColor}40`, backgroundColor: "#050b18" }}
            className="max-w-5xl mx-auto border rounded-2xl p-3 md:p-4 flex items-center justify-between gap-3 shadow-2xl relative overflow-hidden"
          >
            {/* Minimize Stage Quick Button */}
            <button
              onClick={() => setIsStageMinimized(true)}
              className="absolute top-2 right-2 z-20 px-2 py-1 rounded-md border border-cyan-500/30 bg-black/80 hover:bg-black text-cyan-300 hover:text-white cursor-pointer transition flex items-center gap-1 text-[9px] font-mono shadow-md"
              title="3D Sphäre minimieren für mehr Chatplatz"
            >
              <Minimize2 className="w-3 h-3" />
              <span>MINIMIEREN</span>
            </button>

            {/* Subtle Color Accent Ambient Backlight */}
            <div
              style={{ backgroundColor: activeAgentEffectiveColor }}
              className="absolute -top-12 -left-12 w-56 h-56 rounded-full blur-[90px] opacity-25 pointer-events-none"
            />

            {/* LEFT ARROW BUTTON (<) */}
            <button
              onClick={handlePrevAgent}
              aria-label={`Vorheriger Agent: ${prevAgent.name}`}
              style={{
                borderColor: `${prevAgentEffectiveColor}60`,
                boxShadow: `0 0 15px ${prevAgentEffectiveColor}30`,
              }}
              className="relative z-10 p-2.5 md:p-3.5 rounded-xl border bg-black/60 hover:bg-black/90 text-white cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group flex-shrink-0 flex items-center gap-2"
            >
              <ChevronLeft
                style={{ color: prevAgentEffectiveColor }}
                className="w-6 h-6 transition-transform duration-200 group-hover:-translate-x-1"
              />
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                  ◀ VORHERIGER
                </span>
                <span
                  style={{ color: prevAgentEffectiveColor }}
                  className="font-display font-bold text-xs tracking-wider"
                >
                  {prevAgent.name}
                </span>
              </div>
            </button>

            {/* CENTER: LIVE 3D PARTICLE SPHERE STAGE & AGENT DETAILS */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 min-w-0">
              {/* Live 3D Particle Canvas Box */}
              <div
                style={{
                  borderColor: activeAgentEffectiveColor,
                  boxShadow: `0 0 25px ${activeAgentEffectiveColor}35`,
                }}
                className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl border bg-black/70 overflow-hidden flex-shrink-0 flex items-center justify-center"
              >
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  {activeAgent.shape === "particle-orb" ? (
                    <ParticleVoiceOrb
                      bare
                      size={140}
                      type="custom"
                      primaryColor={activeAgentEffectiveColor}
                      intensity={isLoading ? 0.75 : isMicListening ? 0.6 : 0.1}
                      isLive={isLoading || isMicListening}
                      state={isLoading ? "speaking" : isMicListening ? "listening" : "idle"}
                    />
                  ) : (
                    <ParticleSphere
                      state={isLoading ? "thinking" : isMicListening ? "listening" : "idle"}
                      micLevel={isMicListening ? 0.6 : 0.1}
                      speakingLevel={isLoading ? 0.6 : 0.1}
                      agentColor={activeAgentEffectiveColor}
                      shape={activeAgent.shape}
                      currentAgentId={activeAgent.id}
                      isActive={true}
                    />
                  )}
                </div>

                {/* Particle Shape Badge */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 px-2 py-0.5 rounded text-[8px] font-mono text-slate-300 tracking-wider uppercase whitespace-nowrap">
                  {activeAgent.shape}
                </div>
              </div>

              {/* Agent Info Details */}
              <div className="text-center md:text-left min-w-0 flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span
                    style={{ color: activeAgent.color }}
                    className="font-display font-bold text-lg md:text-2xl tracking-wide"
                  >
                    {activeAgent.name}
                  </span>
                  <span
                    style={{
                      color: activeAgent.color,
                      borderColor: `${activeAgent.color}50`,
                    }}
                    className="font-mono text-[10px] px-2 py-0.5 rounded border bg-black/50 font-bold uppercase"
                  >
                    {activeAgent.short}
                  </span>
                </div>

                <div className="text-xs text-cyan-300 font-mono tracking-wider mt-0.5">
                  {activeAgent.tag}
                </div>

                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {activeAgent.greeting}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] font-mono text-slate-400">
                  <AgentSpeechAnimation
                    agentColor={activeAgent.color}
                    isSpeaking={isLoading}
                    isListening={!isLoading}
                    label="VOICE/SPRECH-ANIMATION"
                  />
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300">
                    ✦ {getShapeLabel(activeAgent.shape)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT ARROW BUTTON (>) */}
            <button
              onClick={handleNextAgent}
              aria-label={`Nächster Agent: ${nextAgent.name}`}
              style={{
                borderColor: `${nextAgent.color}60`,
                boxShadow: `0 0 15px ${nextAgent.color}30`,
              }}
              className="relative z-10 p-2.5 md:p-3.5 rounded-xl border bg-black/60 hover:bg-black/90 text-white cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group flex-shrink-0 flex items-center gap-2"
            >
              <div className="hidden lg:flex flex-col items-end text-right">
                <span className="font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                  NÄCHSTER ▶
                </span>
                <span
                  style={{ color: nextAgent.color }}
                  className="font-display font-bold text-xs tracking-wider"
                >
                  {nextAgent.name}
                </span>
              </div>
              <ChevronRight
                style={{ color: nextAgent.color }}
                className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      )}

      {/* CHAT MESSAGES FEED (FOR ACTIVE AGENT ONLY) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 select-text max-w-5xl mx-auto w-full">
        {activeAgentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500 font-mono">
            <Cpu
              style={{ color: activeAgent.color }}
              className="w-12 h-12 mb-3 animate-pulse opacity-80"
            />
            <h3
              style={{ color: activeAgent.color }}
              className="font-display text-base tracking-wider uppercase"
            >
              CHAT MIT {activeAgent.name} BEREIT
            </h3>
            <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
              Stelle {activeAgent.name} eine Frage oder erteile eine Aufgabe. {activeAgent.greeting}
            </p>
          </div>
        ) : (
          activeAgentMessages.map((msg) => {
            const isUser = msg.role === "user";

            if (isUser) {
              return (
                <div key={msg.id} className="flex flex-col items-end w-full">
                  <div className="max-w-[85%] md:max-w-[75%] bg-zinc-800/90 border border-zinc-700/60 p-4 rounded-2xl rounded-tr-sm shadow-md text-zinc-100 font-sans leading-relaxed">
                    <FormattedText text={msg.content} />

                    {((msg.imageUrls && msg.imageUrls.length > 0) || msg.imageUrl) && (
                      <div className={`mt-3 grid gap-2 rounded-xl overflow-hidden max-w-lg ${
                        (msg.imageUrls?.length || 1) === 1
                          ? "grid-cols-1"
                          : (msg.imageUrls?.length || 0) === 2
                          ? "grid-cols-2"
                          : "grid-cols-2 sm:grid-cols-3"
                      }`}>
                        {(msg.imageUrls && msg.imageUrls.length > 0 ? msg.imageUrls : [msg.imageUrl!]).map((url, imgIdx) => {
                          const isVid = isVideoUrl(url);
                          return (
                            <div
                              key={imgIdx}
                              className="relative rounded-xl overflow-hidden border border-zinc-700/70 bg-black/60 group"
                            >
                              {isVid ? (
                                <video
                                  src={url}
                                  controls
                                  playsInline
                                  className="w-full h-auto object-cover max-h-60 bg-black rounded"
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt={`Attachment ${imgIdx + 1}`}
                                  className="w-full h-auto object-cover max-h-60"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              {(msg.imageUrls?.length || 0) > 1 && (
                                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-zinc-300">
                                  #{imgIdx + 1}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Agent Response Message (MultiAgent or Single Agent)
            return (
              <div key={msg.id} className="w-full">
                <MultiAgentResponseCard msg={msg} lang={lang} onSpeak={onSpeak} />
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="max-w-md w-full">
            <ChatWaitingAnimation currentAgent={activeAgent} lang={lang} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT DOCK FOOTER */}
      <footer className="p-4 md:px-8 bg-[#040812] border-t border-cyan-500/20 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {effectiveImages.length > 0 && (
            <div className="bg-cyan-950/60 border border-cyan-500/40 p-2.5 rounded-xl text-cyan-300 text-xs font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  {effectiveImages.some(isVideoUrl) ? (
                    <Film className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                  )}
                  {(() => {
                    const vidCount = effectiveImages.filter(isVideoUrl).length;
                    const imgCount = effectiveImages.length - vidCount;
                    if (vidCount > 0 && imgCount > 0) return `${vidCount} VIDEO(S) & ${imgCount} FOTO(S) ANGEHÄNGT`;
                    if (vidCount > 0) return vidCount === 1 ? "1 VIDEO ANGEHÄNGT (MULTIMODALE ANALYSE)" : `${vidCount} VIDEOS ANGEHÄNGT (MULTIMODALE ANALYSE)`;
                    return effectiveImages.length === 1 
                      ? "1 FOTO ANGEHÄNGT (MULTIMODALE ANALYSE)" 
                      : `${effectiveImages.length} FOTOS ANGEHÄNGT (MULTIMODALE ANALYSE)`;
                  })()}
                </span>
                <button
                  onClick={handleClearImages}
                  className="text-slate-400 hover:text-red-400 cursor-pointer flex items-center gap-1 transition-colors text-[11px]"
                  title="Alle Anhänge entfernen"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ALLE ENTFERNEN</span>
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {effectiveImages.map((mediaUrl, idx) => {
                  const isVid = isVideoUrl(mediaUrl);
                  return (
                    <div key={idx} className="relative group shrink-0 rounded-lg overflow-hidden border border-cyan-500/30 w-16 h-16 bg-black/60 flex items-center justify-center">
                      {isVid ? (
                        <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                          <video src={mediaUrl} className="w-full h-full object-cover opacity-75" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="p-1 rounded-full bg-black/70 text-amber-400">
                              <Play className="w-3 h-3 fill-amber-400" />
                            </span>
                          </div>
                          <span className="absolute top-0.5 left-0.5 px-1 rounded bg-amber-500/90 text-[7px] font-mono text-black font-black uppercase">
                            VID
                          </span>
                        </div>
                      ) : (
                        <img src={mediaUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center text-[10px] transition cursor-pointer shadow z-10"
                        title={`Medium #${idx + 1} entfernen`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1 rounded bg-black/75 text-[8px] font-mono text-cyan-300 z-10">
                        #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* API Connection Bar at the bottom of the chat */}
          <div className="mb-2">
            <ChatApiConnector
              geminiKey={geminiKey}
              onKeySaved={onSaveGeminiKey}
              lang={lang}
              agentName={activeAgent.name}
              agentColor={activeAgent.color}
            />
          </div>

          <div
            style={{ borderColor: `${activeAgent.color}40` }}
            className="flex items-center gap-2 bg-[#02050b] border rounded-2xl p-2 shadow-2xl"
          >
            <input
              type="file"
              id="multi-agent-file-input"
              accept="image/*,video/*"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleImagesSelect(e.target.files);
                  e.target.value = "";
                }
              }}
              className="hidden"
            />

            <button
              onClick={handleToggleMic}
              disabled={isLoading}
              title="Spracheingabe"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                isMicListening
                  ? "bg-amber-500 border-amber-400 text-slate-950 font-bold"
                  : "bg-cyan-950/30 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={() => document.getElementById("multi-agent-file-input")?.click()}
              disabled={isLoading}
              title="Fotos oder Videos anhängen (Clip bis 80MB, Mehrfachauswahl möglich)"
              className="w-10 h-10 rounded-xl border border-cyan-500/20 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center transition cursor-pointer relative"
            >
              {effectiveImages.some(isVideoUrl) ? (
                <Film className="w-4 h-4 text-amber-400" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              {effectiveImages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-black text-[9px] font-bold flex items-center justify-center shadow">
                  {effectiveImages.length}
                </span>
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              onPaste={(e) => {
                const files = extractImagesFromPasteEvent(e);
                if (files.length > 0) {
                  e.preventDefault();
                  handleImagesSelect(files);
                  return;
                }
                const file = extractImageFromPasteEvent(e);
                if (file) {
                  e.preventDefault();
                  handleImageSelect(file);
                }
              }}
              placeholder={
                chatScopeMode === "ALL"
                  ? "Schreibe eine Nachricht an ALLE 8 AGENTEN gleichzeitig (mehrere Fotos/Videos möglich)..."
                  : chatScopeMode === "THE_BIG_3"
                  ? "Schreibe eine Nachricht an THE BIG 3 (SYNTAX • NEO • VEGA)..."
                  : `Schreibe eine Nachricht exklusiv an ${activeAgent.name} (Strg+V für Medien)...`
              }
              className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none min-w-0"
            />

            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && effectiveImages.length === 0)}
              style={{
                backgroundColor: activeAgent.color,
                boxShadow: `0 0 15px ${activeAgent.color}50`,
              }}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-slate-950 font-mono text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>SENDEN</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
});
