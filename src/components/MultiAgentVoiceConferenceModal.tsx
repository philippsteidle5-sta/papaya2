import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  Layers,
  CheckCircle2,
  X,
  MessageSquare,
  RefreshCw,
  Send,
  Radio,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Brain,
  Award,
  Terminal,
  FileText,
  Activity,
  Globe
} from "lucide-react";
import { AgentConfig, VoiceConferenceTurn, AgentSyncSynthesis } from "../types";
import { applyAgentVoice, normalizeTextForSpeech } from "../utils/voiceUtils";

interface MultiAgentVoiceConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  initialTopic?: string;
  onOpenAgentSyncSynthesis?: (synthesis: AgentSyncSynthesis) => void;
  lang?: "de" | "en";
}

interface ConferenceAgentState {
  id: string;
  name: string;
  short: string;
  roleTag: string;
  color: string;
  angleDeg: number;
  isSpeaking: boolean;
  frequencyData: number[]; // 5-10 bars for equalizer
}

const PRESET_TOPICS = [
  "🚀 100k User Skalierung & virale Wachstumsstrategie für das SaaS-System",
  "🛡️ Zero-Trust Sicherheitsaudit & Ausfallsicherheit der 8-Core Architektur",
  "🎬 Virale TikTok & Cinema Video-Kampagne mit Veo 3.1 & Social Hooks",
  "📊 Krypto- & Marktvolatilitäts-Analyse mit Automated Risk Management",
  "⚡ Globales Cloud-Routing & High-Performance TypeScript Microservices",
];

const DEFAULT_CONFERENCE_SCRIPT = (topic: string, lang: "de" | "en"): VoiceConferenceTurn[] => {
  const isDe = lang === "de";
  return [
    {
      id: "turn-syntax-intro",
      agentId: "maze",
      agentName: "S.Y.N.T.A.X.",
      roleTag: "MASTER ORCHESTRATOR",
      color: "#00f0ff",
      thought: `Initialisiere 8-Core Konferenz-Matrix für Boss. Thema: ${topic}`,
      speechText: isDe
        ? `Willkommen in der 8-Core Live-Konferenz, Boss. Ich habe alle 8 Spezialisten im Quantum-Roundtable synchronisiert. Unser Thema lautet: "${topic}". N.E.O., wie lautet deine strategische Einschätzung?`
        : `Welcome to the 8-Core Live Conference, Boss. I have synchronized all 8 specialists in the Quantum Roundtable. Our topic is: "${topic}". N.E.O., what is your strategic assessment?`,
      topicAngle: isDe ? "Konferenzeröffnung & Tagesordnung" : "Conference Opening & Agenda",
      durationEstimateSec: 7,
    },
    {
      id: "turn-neo-growth",
      agentId: "neo",
      agentName: "N.E.O.",
      roleTag: "STRATEGY & GROWTH BOSS",
      color: "#ff2a8d",
      thought: "Analysiere Skalierungspotenzial, Hebelwirkung und Zielgruppen-Conversion...",
      speechText: isDe
        ? `Aus strategischer Sicht müssen wir den Hebel maximal ansetzen, Boss! Unsere Conversion-Rate steigt exponentiell, wenn wir die Lead-Funnels direkt mit den 8 Cores verzahnen. V.E.G.A., wie sieht die technische Machbarkeit und Code-Architektur aus?`
        : `From a strategic perspective, we must maximize leverage, Boss! Our conversion rate grows exponentially when we link lead funnels directly with the 8 Cores. V.E.G.A., what is the technical feasibility and code architecture?`,
      topicAngle: isDe ? "Wachstum, Funnel & Skalierung" : "Growth, Funnels & Scaling",
      durationEstimateSec: 8,
    },
    {
      id: "turn-vega-tech",
      agentId: "vega",
      agentName: "V.E.G.A.",
      roleTag: "ARCHITECTURE & AUDIT",
      color: "#ff4d5e",
      thought: "Prüfe Server-Last, Cache-Invalidierung und Latenzen...",
      speechText: isDe
        ? `Systemanalyse abgeschlossen, Boss. Die TypeScript-Architektur hält einer Spitzenlast von 10.000 Requests pro Sekunde stand. Der Memory-Cortex indexiert alle Daten verzögerungsfrei. O.D.I.N., Sicherheitsaudit freigegeben?`
        : `System analysis complete, Boss. The TypeScript architecture easily handles 10,000 requests per second. The memory cortex indexes all data with zero latency. O.D.I.N., security audit cleared?`,
      topicAngle: isDe ? "Architektur, Performance & Speicher" : "Architecture, Performance & Memory",
      durationEstimateSec: 7,
    },
    {
      id: "turn-odin-security",
      agentId: "odin",
      agentName: "O.D.I.N.",
      roleTag: "SECURITY & RISK TACTICS",
      color: "#e2f1ff",
      thought: "Scanne Angriffsvektoren, Token-Validierung und Ausfallrisiken...",
      speechText: isDe
        ? `Alle Schutzschilde sind auf 100 Prozent, Boss. Zero-Trust-Verschlüsselung aktiv, Brute-Force-Abwehr greift ab Sekunde eins. Kein Angreifer durchdringt das Perimeter. C.H.R.O.N.O.S., wie sieht der zeitliche Umsetzungsplan aus?`
        : `All shields operating at 100 percent, Boss. Zero-trust encryption is active, brute-force defense engages immediately. No attacker breaches the perimeter. C.H.R.O.N.O.S., what is the execution timeline?`,
      topicAngle: isDe ? "Security Shields & Risikotaktik" : "Security Shields & Risk Tactics",
      durationEstimateSec: 7,
    },
    {
      id: "turn-chronos-timing",
      agentId: "chronos",
      agentName: "C.H.R.O.N.O.S.",
      roleTag: "TIMING & EXECUTION",
      color: "#eab308",
      thought: "Kalkuliere Sprint-Dauer, Meilensteine und Pufferzeiten...",
      speechText: isDe
        ? `Der Zeitplan steht fest: Wir rollen die Roadmap in drei präzisen 48-Stunden-Phasen aus. Wir sparen damit 72 Prozent der üblichen Entwicklungszeit. P.U.L.S.E., bereite das virale Launch-Video vor!`
        : `The schedule is set: We deploy the roadmap in three precise 48-hour sprints. This cuts typical deployment time by 72 percent. P.U.L.S.E., prepare the viral launch creative!`,
      topicAngle: isDe ? "Execution-Roadmap & Zeit-Hebel" : "Execution Roadmap & Timing",
      durationEstimateSec: 7,
    },
    {
      id: "turn-pulse-creative",
      agentId: "pulse",
      agentName: "P.U.L.S.E.",
      roleTag: "VIRALITY & CREATIVE",
      color: "#a855f7",
      thought: "Generiere 8K Video-Hooks, Sound-Design und Social Trends...",
      speechText: isDe
        ? `Video-Synthesizer bereit, Boss! Mit Veo 3.1 rendern wir kinoreife 8K Clips mit messerscharfen 3-Sekunden-Hooks auf TikTok und Instagram. Das Engagement wird durch die Decke gehen! O.R.A.C.L.E., wie reagieren die Markttrends?`
        : `Video synthesizer ready, Boss! With Veo 3.1 we render cinematic 8K clips with razor-sharp 3-second hooks for TikTok and Instagram. Engagement is set to explode! O.R.A.C.L.E., how are the market trends aligning?`,
      topicAngle: isDe ? "Viralität, Veo 3.1 & Community Hook" : "Virality, Veo 3.1 & Community Hooks",
      durationEstimateSec: 8,
    },
    {
      id: "turn-oracle-market",
      agentId: "oracle",
      agentName: "O.R.A.C.L.E.",
      roleTag: "MARKET & DATA FORECAST",
      color: "#22c55e",
      thought: "Berechne Marktdaten, Konkurrenz-Metriken und Krypto-Muster...",
      speechText: isDe
        ? `Marktindikatoren zeigen ein starkes Kaufsignal, Boss. Das Sentiment ist bullisch mit 89 Prozent Wachstums-Wahrscheinlichkeit im aktuellen Quartal. G.L.O.B.E., weltweites Radar bestätigt?`
        : `Market indicators show a strong buy signal, Boss. Sentiment is bullish with an 89 percent growth probability this quarter. G.L.O.B.E., global radar confirmed?`,
      topicAngle: isDe ? "Markt-Signale & Sentiment-Prognose" : "Market Signals & Sentiment Forecast",
      durationEstimateSec: 7,
    },
    {
      id: "turn-globe-intel",
      agentId: "globe",
      agentName: "G.L.O.B.E.",
      roleTag: "GLOBAL RADAR & DISPATCH",
      color: "#38bdf8",
      thought: "Scanne globale Web-Quellen, Konkurrenzdaten und Partner-APIs...",
      speechText: isDe
        ? `Weltweites Radar bestätigt grüne Signale in allen Zeitzonen, Boss. Die E-Mail-Workflows sind automatisiert und globale Partner stehen bereit. S.Y.N.T.A.X., bitte fasse die Master-Entscheidung zusammen!`
        : `Global radar confirms green across all time zones, Boss. Email workflows are automated and global partners are standing by. S.Y.N.T.A.X., please deliver the master summary!`,
      topicAngle: isDe ? "Globales Web-Radar & Partner-Dispatch" : "Global Web Radar & Partner Dispatch",
      durationEstimateSec: 7,
    },
    {
      id: "turn-syntax-summary",
      agentId: "maze",
      agentName: "S.Y.N.T.A.X.",
      roleTag: "MASTER ORCHESTRATOR",
      color: "#00f0ff",
      thought: "Synthetisiere alle 8 Beiträge zum Master-Konsens...",
      speechText: isDe
        ? `Fazit für Boss: Alle 8 Spezialisten stimmen zu 98 Prozent überein. Die Roadmap ist freigegeben, Sicherheit garantiert, viraler Launch vorbereitet. Du kannst die vollständige Synthese mit einem Klick im Agent-Sync Fenster öffnen!`
        : `Conclusion for Boss: All 8 specialists align at 98 percent consensus. The roadmap is cleared, security guaranteed, viral launch primed. You can open the complete synthesis in the Agent-Sync window with one click!`,
      topicAngle: isDe ? "Master-Synthese & Flotten-Freigabe" : "Master Synthesis & Fleet Clearance",
      durationEstimateSec: 8,
    },
  ];
};

export const MultiAgentVoiceConferenceModal: React.FC<MultiAgentVoiceConferenceModalProps> = ({
  isOpen,
  onClose,
  agents,
  currentAgent,
  initialTopic = "🚀 100k User Skalierung & virale Wachstumsstrategie für das SaaS-System",
  onOpenAgentSyncSynthesis,
  lang = "de",
}) => {
  const normalizedLang: "de" | "en" = lang === "en" ? "en" : "de";
  const [topic, setTopic] = useState(initialTopic);
  const [turns, setTurns] = useState<VoiceConferenceTurn[]>(() =>
    DEFAULT_CONFERENCE_SCRIPT(initialTopic, normalizedLang)
  );
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingLevel, setSpeakingLevel] = useState(0.5);
  const [userInterventionText, setUserInterventionText] = useState("");
  const [isGeneratingNewDiscussion, setIsGeneratingNewDiscussion] = useState(false);
  const [activeSpeechProgress, setActiveSpeechProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTurn = turns[currentTurnIndex] || turns[0];

  // 8 Agent configurations positioned circularly
  const conferenceAgents: ConferenceAgentState[] = [
    { id: "maze", name: "S.Y.N.T.A.X.", short: "SYNTAX", roleTag: "ORCHESTRATOR", color: "#00f0ff", angleDeg: 270, isSpeaking: currentTurn.agentId === "maze" || currentTurn.agentId === "syntax", frequencyData: [30, 60, 90, 75, 45] },
    { id: "neo", name: "N.E.O.", short: "NEO", roleTag: "STRATEGY", color: "#ff2a8d", angleDeg: 315, isSpeaking: currentTurn.agentId === "neo", frequencyData: [40, 80, 100, 60, 50] },
    { id: "vega", name: "V.E.G.A.", short: "VEGA", roleTag: "ARCHITECTURE", color: "#ff4d5e", angleDeg: 0, isSpeaking: currentTurn.agentId === "vega", frequencyData: [50, 70, 85, 90, 40] },
    { id: "odin", name: "O.D.I.N.", short: "ODIN", roleTag: "SECURITY", color: "#e2f1ff", angleDeg: 45, isSpeaking: currentTurn.agentId === "odin", frequencyData: [35, 65, 80, 70, 55] },
    { id: "chronos", name: "C.H.R.O.N.O.S.", short: "CHRONOS", roleTag: "TIMING", color: "#eab308", angleDeg: 90, isSpeaking: currentTurn.agentId === "chronos", frequencyData: [45, 75, 95, 85, 35] },
    { id: "pulse", name: "P.U.L.S.E.", short: "PULSE", roleTag: "VIRALITY", color: "#a855f7", angleDeg: 135, isSpeaking: currentTurn.agentId === "pulse", frequencyData: [60, 90, 100, 95, 70] },
    { id: "oracle", name: "O.R.A.C.L.E.", short: "ORACLE", roleTag: "MARKET", color: "#22c55e", angleDeg: 180, isSpeaking: currentTurn.agentId === "oracle", frequencyData: [30, 55, 75, 65, 40] },
    { id: "globe", name: "G.L.O.B.E.", short: "GLOBE", roleTag: "GLOBAL RADAR", color: "#38bdf8", angleDeg: 225, isSpeaking: currentTurn.agentId === "globe", frequencyData: [40, 70, 90, 80, 50] },
  ];

  // Speech loop handler
  const playCurrentTurnSpeech = (turn: VoiceConferenceTurn) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (isMuted) return;

    const cleanSpeech = normalizeTextForSpeech(turn.speechText, normalizedLang);
    const utter = new SpeechSynthesisUtterance(cleanSpeech || turn.speechText);
    applyAgentVoice(utter, turn.agentId, normalizedLang);

    utter.onboundary = (e) => {
      if (e.charIndex && turn.speechText.length > 0) {
        setActiveSpeechProgress(Math.min(100, Math.round((e.charIndex / turn.speechText.length) * 100)));
      }
    };

    utter.onend = () => {
      setActiveSpeechProgress(100);
      if (isPlayingRef.current) {
        // Auto advance after 800ms pause between speakers
        setTimeout(() => {
          if (isPlayingRef.current) {
            setCurrentTurnIndex((prev) => {
              if (prev < turns.length - 1) {
                return prev + 1;
              } else {
                setIsPlaying(false);
                return prev;
              }
            });
          }
        }, 800);
      }
    };

    utter.onerror = () => {
      if (isPlayingRef.current) {
        setTimeout(() => {
          if (isPlayingRef.current) {
            setCurrentTurnIndex((prev) => (prev < turns.length - 1 ? prev + 1 : prev));
          }
        }, 1500);
      }
    };

    window.speechSynthesis.speak(utter);
  };

  // Trigger speech when turn index changes while playing
  useEffect(() => {
    if (isPlaying && currentTurn) {
      setActiveSpeechProgress(0);
      playCurrentTurnSpeech(currentTurn);
    }
  }, [currentTurnIndex, isPlaying]);

  // Clean up speech synthesis when closing or unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsPlaying(true);
    }
  };

  const handleNextTurn = () => {
    if (currentTurnIndex < turns.length - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      setCurrentTurnIndex(0);
    }
  };

  const handleJumpToAgent = (agentId: string) => {
    const foundIdx = turns.findIndex((t) => t.agentId.toLowerCase() === agentId.toLowerCase());
    if (foundIdx !== -1) {
      setCurrentTurnIndex(foundIdx);
    }
  };

  // Generate dynamic live discussion from API for a new topic
  const handleGenerateDiscussion = async (newTopic: string) => {
    setTopic(newTopic);
    setIsGeneratingNewDiscussion(true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Erstelle eine 8-Core Live-Konferenz zum Thema: "${newTopic}". Lass S.Y.N.T.A.X. moderieren und alle 8 Spezialisten (S.Y.N.T.A.X., N.E.O., V.E.G.A., O.D.I.N., C.H.R.O.N.O.S., P.U.L.S.E., O.R.A.C.L.E., G.L.O.B.E.) kurz und prägnant zu Wort kommen.`,
          agent: "maze",
          scope: "ALL",
        }),
      });

      const data = await resp.json();
      if (data.multiResponses && data.multiResponses.length > 0) {
        const dynamicTurns: VoiceConferenceTurn[] = data.multiResponses.map((r: any, idx: number) => ({
          id: `turn-${r.agentId}-${idx}`,
          agentId: r.agentId,
          agentName: r.name || r.agentId.toUpperCase(),
          roleTag: r.badge || "SPECIALIST",
          color: r.color || "#00f0ff",
          thought: r.thought,
          speechText: r.response,
          topicAngle: `Perspektive von ${r.name || r.agentId}`,
        }));
        setTurns(dynamicTurns);
      } else {
        setTurns(DEFAULT_CONFERENCE_SCRIPT(newTopic, normalizedLang));
      }
    } catch (e) {
      setTurns(DEFAULT_CONFERENCE_SCRIPT(newTopic, normalizedLang));
    } finally {
      setIsGeneratingNewDiscussion(false);
      setCurrentTurnIndex(0);
      setIsPlaying(true);
    }
  };

  // Create Agent-Sync Synthesis from Conference Discussion
  const handleSynthesizeConference = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlaying(false);

    const synth: AgentSyncSynthesis = {
      id: `synth-conf-${Date.now()}`,
      topic: topic,
      timestamp: new Date().toLocaleTimeString("de-DE"),
      consensusScore: 98,
      executiveSummary: `Im Rahmen der 8-Core Live-Sprachkonferenz haben alle Spezialisten einstimmig beschlossen: Das System "${topic}" wird mit maximaler Hebelwirkung und dreistufiger Roadmap umgesetzt. V.E.G.A. und O.D.I.N. garantieren Zero-Trust-Architektur, während N.E.O. und P.U.L.S.E. die virale Conversion sicherstellen.`,
      strategicDirective: `Sofortige Freigabe der 48-Stunden-Sprints. Volle Ressourcenallokation auf Lead-Funnels und TikTok/Veo 3.1 Content.`,
      corePerspectives: turns.map((t) => ({
        agentId: t.agentId,
        agentName: t.agentName,
        color: t.color,
        roleTag: t.roleTag,
        keyContribution: t.speechText,
        actionableInsight: `Umsetzung gemäß Direktive von ${t.agentName}`,
        priorityScore: 96,
      })),
      masterActionPlan: [
        { step: 1, title: "Funnel-Verzahnung mit 8-Core Matrix", owner: "N.E.O.", description: "Direkte Verknüpfung der Lead-Erfassung mit der S.Y.N.T.A.X. Routing-Engine.", priority: "CRITICAL" },
        { step: 2, title: "Zero-Trust & Performance-Audit", owner: "O.D.I.N. & V.E.G.A.", description: "Prüfung aller API-Endpoints und Schutz vor DDoS & Quotenlimits.", priority: "HIGH" },
        { step: 3, title: "Virale Veo 3.1 Video-Assets", owner: "P.U.L.S.E.", description: "Erstellung von 5 hochkonvertierenden 8K Video-Hooks für Social Media.", priority: "MAX" },
        { step: 4, title: "Globaler Rollout & Timing-Kontrolle", owner: "C.H.R.O.N.O.S. & G.L.O.B.E.", description: "Freischaltung in allen Zeitzonen und automatisiertes Monitoring.", priority: "HIGH" },
      ],
      rawResponses: turns.map((t) => ({
        agentId: t.agentId,
        name: t.agentName,
        badge: t.roleTag,
        color: t.color,
        thought: t.thought,
        response: t.speechText,
      })),
    };

    if (onOpenAgentSyncSynthesis) {
      onOpenAgentSyncSynthesis(synth);
    }
  };

  // Canvas visualizer loop for the circular equalizers and hologram center
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angleOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Hologram Grid & Radial Radar Rings
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let r = radius * 0.3; r <= radius * 1.1; r += radius * 0.25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Connecting polygon lines between 8 cores
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.beginPath();
      conferenceAgents.forEach((ag, idx) => {
        const rad = (ag.angleDeg * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * radius;
        const y = centerY + Math.sin(rad) * radius;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // 2. Central Quantum Reactor / Sound Core
      angleOffset += isPlaying ? 0.03 : 0.01;
      const activeColor = currentTurn.color || "#00f0ff";

      // Pulsing central glow
      const pulseSize = isPlaying ? Math.sin(Date.now() * 0.008) * 12 + 55 : 45;
      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, pulseSize * 1.6);
      grad.addColorStop(0, `${activeColor}99`);
      grad.addColorStop(0.5, `${activeColor}33`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Center sphere ring
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Center spinning tech rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angleOffset);
      ctx.setLineDash([8, 12]);
      ctx.strokeStyle = `${activeColor}bb`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, pulseSize * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Render 8 Agent Nodes with Equalizer Audio Bars
      conferenceAgents.forEach((ag) => {
        const rad = (ag.angleDeg * Math.PI) / 180;
        const nodeX = centerX + Math.cos(rad) * radius;
        const nodeY = centerY + Math.sin(rad) * radius;

        // Beam from center to active speaker
        if (ag.isSpeaking && isPlaying) {
          ctx.strokeStyle = `${ag.color}88`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(nodeX, nodeY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Outer glow on active speaker
        if (ag.isSpeaking) {
          const speakGlow = ctx.createRadialGradient(nodeX, nodeY, 8, nodeX, nodeY, 40);
          speakGlow.addColorStop(0, `${ag.color}66`);
          speakGlow.addColorStop(1, "transparent");
          ctx.fillStyle = speakGlow;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 40, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node Circle
        ctx.fillStyle = ag.isSpeaking ? ag.color : "#060e26";
        ctx.strokeStyle = ag.color;
        ctx.lineWidth = ag.isSpeaking ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, ag.isSpeaking ? 22 : 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3D Audio Frequency Bars (Pulsing Equalizer on each agent)
        const barCount = 5;
        const barWidth = 3;
        const spacing = 4;
        const totalW = barCount * (barWidth + spacing);
        const startX = nodeX - totalW / 2;

        for (let b = 0; b < barCount; b++) {
          const rawHeight = ag.isSpeaking && isPlaying
            ? Math.abs(Math.sin(Date.now() * 0.01 + b * 0.8 + ag.angleDeg)) * 22 + 6
            : 3;
          ctx.fillStyle = ag.isSpeaking ? "#ffffff" : `${ag.color}88`;
          ctx.fillRect(startX + b * (barWidth + spacing), nodeY - rawHeight / 2, barWidth, rawHeight);
        }

        // Agent Name Label
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = ag.isSpeaking ? "#ffffff" : ag.color;
        ctx.textAlign = "center";
        ctx.fillText(ag.short, nodeX, nodeY + (ag.isSpeaking ? 36 : 28));
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, currentTurnIndex, isPlaying, turns]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-2 sm:p-4 animate-fadeIn font-sans">
      
      {/* Outer Main Container */}
      <div className="relative w-full max-w-6xl max-h-[96vh] bg-[#020410] border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_100px_rgba(0,240,255,0.35)] overflow-hidden flex flex-col font-mono text-xs">
        
        {/* Top Sci-Fi Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* ===================================================================== */}
        {/* HEADER BAR                                                            */}
        {/* ===================================================================== */}
        <div className="p-3 sm:p-4 bg-[#050c26]/90 border-b border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <Volume2 className="w-5 h-5 animate-pulse text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base text-cyan-200 tracking-wider flex items-center gap-1.5">
                  <span>🎙️ 8-CORE LIVE-SPRACHKONFERENZ</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-400/40 animate-pulse">
                  {isPlaying ? "● LIVE AUDIO STREAM" : "⏸️ PAUSIERT"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-400/40">
                  MODERATION: S.Y.N.T.A.X.
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono truncate max-w-xl">
                Thema: <strong className="text-slate-200">{topic}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Action: Generate Agent-Sync Synthesis */}
            <button
              onClick={handleSynthesizeConference}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-mono text-[10.5px] font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95"
              title="Alle Beiträge der Konferenz als Master-Synthese im Agent-Sync Fenster öffnen"
            >
              <Zap className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>⚡ AGENT-SYNC SYNTHESE</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MAIN BODY: 3D HOLO ROUNDTABLE & LIVE DIALOG STREAM                   */}
        {/* ===================================================================== */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT 7 COLS: 3D EQUALIZER ROUNDTABLE CANVAS & ACTIVE SPEAKER PODIUM */}
          <div className="lg:col-span-7 p-4 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-cyan-500/20 bg-gradient-to-b from-[#020516] to-[#04081c] relative overflow-hidden">
            
            {/* Preset Topic Quick Selector Bar */}
            <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none z-10">
              <span className="text-[9px] text-slate-400 uppercase font-bold shrink-0">THEMEN:</span>
              {PRESET_TOPICS.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateDiscussion(pt)}
                  disabled={isGeneratingNewDiscussion}
                  className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-500/40 text-[9px] font-mono shrink-0 transition truncate max-w-[200px] cursor-pointer"
                >
                  {pt}
                </button>
              ))}
            </div>

            {/* Canvas Stage with Holographic Roundtable */}
            <div className="relative w-full aspect-square max-w-[420px] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={460}
                height={460}
                className="w-full h-full object-contain cursor-crosshair"
              />

              {/* Central Reactor Overlay Label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-0.5">
                  <span className="text-[8px] font-mono text-cyan-400 font-bold tracking-widest uppercase">
                    QUANTUM CORE
                  </span>
                  <div className="text-[10px] font-black text-white" style={{ color: currentTurn.color }}>
                    {currentTurn.agentName}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Speaker Card with Thought & Subtitles */}
            <div
              className="w-full rounded-2xl bg-[#060e28]/95 border p-3.5 space-y-2 shadow-xl backdrop-blur-md z-10"
              style={{
                borderColor: `${currentTurn.color}60`,
                boxShadow: `0 0 25px ${currentTurn.color}15`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: currentTurn.color }} />
                  <span className="font-mono font-black text-xs sm:text-sm" style={{ color: currentTurn.color }}>
                    → {currentTurn.agentName}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase bg-slate-900 border border-slate-700 text-slate-300">
                    "{currentTurn.roleTag}"
                  </span>
                </div>

                <span className="font-mono text-[9px] text-slate-400">
                  {currentTurn.topicAngle}
                </span>
              </div>

              {/* Inner Thought */}
              {currentTurn.thought && (
                <div className="p-2 rounded-xl bg-amber-950/25 border border-amber-500/30 text-amber-200/90 font-mono text-[10.5px] italic">
                  🧠 "{currentTurn.thought}"
                </div>
              )}

              {/* Subtitles & Spoken Text */}
              <p className="font-sans text-xs sm:text-sm text-white font-medium leading-relaxed">
                "{currentTurn.speechText}"
              </p>

              {/* Progress Bar of Spoken Turn */}
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${activeSpeechProgress}%`,
                    backgroundColor: currentTurn.color,
                  }}
                />
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLS: CONFERENCE CONTROLS, AGENDA & BOSS INTERVENTION */}
          <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-[#030616] space-y-4 overflow-y-auto">
            
            {/* Playback Controls & Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-mono font-bold text-xs text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>KONFERENZ-STEUERUNG</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  RUNDE {currentTurnIndex + 1} / {turns.length}
                </span>
              </div>

              {/* Main Media Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-inner">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlay}
                    className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition shadow-[0_0_15px_rgba(0,240,255,0.5)] cursor-pointer"
                    title={isPlaying ? "Konferenz pausieren" : "Konferenz starten / fortsetzen"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNextTurn}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                    title="Nächsten Sprecher aufrufen"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMuted((prev) => !prev)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isMuted
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                    title={isMuted ? "Audio aktivieren" : "Audio stummschalten"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => handleGenerateDiscussion(topic)}
                  disabled={isGeneratingNewDiscussion}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                  title="Neue dynamische Runde generieren"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingNewDiscussion ? "animate-spin" : ""}`} />
                  <span>NEU STARTEN</span>
                </button>
              </div>
            </div>

            {/* Interactive Timeline of All 8 Specialists */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                SPRECHER-REIHENFOLGE (KLICKEN ZUM AUFRUFEN):
              </span>

              <div className="space-y-1.5 font-mono text-xs pr-1">
                {turns.map((turn, idx) => {
                  const isActive = idx === currentTurnIndex;
                  return (
                    <div
                      key={turn.id}
                      onClick={() => setCurrentTurnIndex(idx)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? "bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: turn.color,
                            boxShadow: isActive ? `0 0 8px ${turn.color}` : "none",
                          }}
                        />
                        <span className="font-bold text-xs shrink-0" style={{ color: turn.color }}>
                          {turn.agentName}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {turn.topicAngle}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isActive && isPlaying && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-black text-[8px] animate-pulse">
                            SPRICHT
                          </span>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono">#{idx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boss Direct Live Intervention Box */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-cyan-300 uppercase">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>BOSS-INTERVENTION (ZWISCHENFRAGE / DIREKTIVE):</span>
                </span>
                <span className="text-slate-400">ECHTZEIT-INPUT</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userInterventionText}
                  onChange={(e) => setUserInterventionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userInterventionText.trim()) {
                      handleGenerateDiscussion(`${topic} (Direktive vom Boss: ${userInterventionText.trim()})`);
                      setUserInterventionText("");
                    }
                  }}
                  placeholder="Befehl oder Frage an die 8 Spezialisten werfen..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  onClick={() => {
                    if (userInterventionText.trim()) {
                      handleGenerateDiscussion(`${topic} (Direktive vom Boss: ${userInterventionText.trim()})`);
                      setUserInterventionText("");
                    }
                  }}
                  disabled={!userInterventionText.trim()}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition disabled:opacity-40 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  title="Befehl senden"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
