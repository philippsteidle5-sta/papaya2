import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Smartphone,
  ChevronDown,
  Radio,
  Send,
  Share2,
  RefreshCw,
  Zap,
  Keyboard,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { AgentConfig } from "../types";
import { PWAInstallButton } from "./PWAInstallButton";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const getStandaloneAppUrl = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    if (!window.location.origin.includes("aistudio.google.com") && window.location.origin.startsWith("http")) {
      return window.location.origin;
    }
  }
  return "https://ais-dev-syh2xjatuj4zw74bh7ujzl-250673933399.europe-west2.run.app";
};

export const STANDALONE_APP_URL = "https://ais-dev-syh2xjatuj4zw74bh7ujzl-250673933399.europe-west2.run.app";

interface MobileVoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  onSelectAgent: (agent: AgentConfig) => void;
  onSendMessage: (text: string) => Promise<string | void> | void;
  userRole?: string;
  lang?: "de" | "en";
}

export const MobileVoiceInterface: React.FC<MobileVoiceInterfaceProps> = ({
  isOpen,
  onClose,
  agents,
  currentAgent,
  onSelectAgent,
  onSendMessage,
  lang = "de",
}) => {
  const { isInstalled, isIOS } = usePWAInstall();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Voice & Interaction States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isHandsFree, setIsHandsFree] = useState<boolean>(true); // Hands-Free by default for phone
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Fallback Text Input & Direct URL Guidance
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [textInputValue, setTextInputValue] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [showUrlModal, setShowUrlModal] = useState<boolean>(false);

  // URL resolution for standalone app
  const activeAppUrl = getStandaloneAppUrl();

  // Transcripts & Chat
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [neoResponse, setNeoResponse] = useState<string>(
    lang === "de"
      ? "Bereit, Boss. Sprich einfach frei mit mir – ich höre auf dein Handy-Mikrofon."
      : "Ready, Boss. Speak freely – I am listening through your mobile microphone."
  );

  // Audio Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const micLevelRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Keep state refs in sync to prevent stale closures in async callbacks
  const isHandsFreeRef = useRef(isHandsFree);
  const isSpeakingRef = useRef(isSpeaking);
  const isThinkingRef = useRef(isThinking);
  const isListeningRef = useRef(isListening);

  useEffect(() => { isHandsFreeRef.current = isHandsFree; }, [isHandsFree]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  // Check if inside AI Studio iframe or dev editor wrapper
  const isInsideAiStudio = typeof window !== "undefined" && (
    window.location.hostname.includes("aistudio.google.com") ||
    window.self !== window.top
  );

  // Animation Visual Mode: quantum (IMG_4693 holographic reactor) | neural | supernova
  const [visualMode, setVisualMode] = useState<"quantum" | "neural" | "supernova">("quantum");

  // Interactive Touch & Gesture Rotation
  const touchStateRef = useRef<{ isDown: boolean; startX: number; startY: number; lastX: number; lastY: number; velX: number; velY: number }>({
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    velX: 0,
    velY: 0,
  });
  const customRotRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const ripplesRef = useRef<{ r: number; maxR: number; alpha: number; color: string }[]>([]);

  // Trigger shockwave burst
  const triggerShockwave = useCallback((color = "#00f5ff") => {
    ripplesRef.current.push({
      r: 10,
      maxR: 260,
      alpha: 0.9,
      color,
    });
    if (ripplesRef.current.length > 8) ripplesRef.current.shift();
  }, []);

  // Sound generator helper for Sci-Fi HUD interactions
  const playBeep = useCallback((freq = 520, duration = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio context autoplay limitations
    }
  }, []);

  // Web Speech API / TTS Voice Playback with Darth Revan acoustic vibe
  const speakText = useCallback(
    (text: string) => {
      if (isMuted || !text) return;
      if (!window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "de" ? "de-DE" : "en-US";
        utterance.pitch = 0.82; // Deep sovereign robotic pitch
        utterance.rate = 1.05;

        const voices = window.speechSynthesis.getVoices();
        const germanVoice = voices.find(
          (v) => (v.lang.startsWith("de") && v.name.includes("Google")) || v.name.includes("Stefan") || v.lang.startsWith("de")
        );
        if (germanVoice) utterance.voice = germanVoice;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
          // If in hands-free mode, resume listening after speaking
          if (isHandsFreeRef.current) {
            setTimeout(() => {
              if (isHandsFreeRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
                startListening();
              }
            }, 300);
          }
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("SpeechSynthesis error:", err);
        setIsSpeaking(false);
      }
    },
    [isMuted, lang]
  );

  // Handle User Input Submission to Agent Core
  const handleProcessUserSpeech = useCallback(
    async (speechText: string) => {
      const trimmed = speechText.trim();
      if (!trimmed || isThinkingRef.current) return;

      setIsThinking(true);
      playBeep(780, 0.1);

      try {
        const result = await onSendMessage(trimmed);
        if (typeof result === "string" && result.length > 0) {
          // Clean markdown links or tags for clean speech
          const cleanText = result
            .replace(/\[ROUTE:[^\]]+\]/gi, "")
            .replace(/\[MAP:[^\]]+\]/gi, "")
            .replace(/\[MAP_CLOSE\]/gi, "")
            .replace(/[*#_`]/g, "")
            .slice(0, 350);

          setNeoResponse(cleanText);
          speakText(cleanText);
        } else {
          const fallback = lang === "de" ? "Befehl ausgeführt, Boss." : "Command executed, Boss.";
          setNeoResponse(fallback);
          speakText(fallback);
        }
      } catch (err) {
        console.error("Error processing mobile speech:", err);
        const errNotice = lang === "de" ? "Verbindung zum Core kurz unterbrochen." : "Core connection briefly lost.";
        setNeoResponse(errNotice);
      } finally {
        setIsThinking(false);
      }
    },
    [lang, onSendMessage, playBeep, speakText]
  );

  // Initialize Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUserTranscript(
        lang === "de"
          ? "Spracherkennung im Browser eingeschränkt. Nutze Text oder öffne die Direkt-URL im Safari."
          : "Speech recognition limited. Please use text or open direct URL in Safari."
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang === "de" ? "de-DE" : "en-US";

      rec.onstart = () => {
        setIsListening(true);
        playBeep(440, 0.05);
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = final || interim;
        setUserTranscript(currentText);

        if (final) {
          handleProcessUserSpeech(final);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition error:", e.error);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        // Automatically restart if hands-free is enabled and we are not speaking or thinking
        if (isHandsFreeRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (isHandsFreeRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
              try {
                startListening();
              } catch (e) {}
            }
          }, 350);
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
      setIsListening(false);
    }
  }, [handleProcessUserSpeech, lang, playBeep]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  // Web Audio Analyser for Live Mic Levels
  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    async function initMicAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        microphoneStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!active) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length / 255;
          micLevelRef.current = avg;
          requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (err) {
        // Audio stream might be restricted until user gesture
      }
    }

    initMicAudio();

    return () => {
      active = false;
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isOpen]);

  // 3D HOLOGRAPHIC QUANTUM REACTOR ORB (Inspired by IMG_4693)
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = canvas.clientWidth || window.innerWidth;
      cssHeight = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Dynamic Palette with Vivid Electric Tones
    const palette: [number, number, number][] = [
      [0, 245, 255],   // Vivid Electric Cyan
      [255, 0, 138],   // Hot Neon Magenta
      [157, 78, 221],  // Electric Purple
      [56, 189, 248],  // Sky Azure
      [255, 255, 255], // Pure White Singularity
      [0, 255, 170],   // Laser Mint
      [255, 190, 11],  // Solar Gold
    ];

    // Generate 650 3D Particles distributed in Fibonacci Sphere + Core Clustered Layers
    const particleCount = 650;
    interface SphereParticle {
      nx: number;
      ny: number;
      nz: number;
      layerRadius: number;
      baseSize: number;
      color: [number, number, number];
      phase: number;
      freq: number;
      speed: number;
    }

    const particles: SphereParticle[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const goldenAngle = Math.PI * 2 * (1 - 1 / goldenRatio);

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // 3 Layers: Core Sparks (20%), Mantle Orbit (60%), Outer Stardust (20%)
      const rand = Math.random();
      let layer = 0.95;
      let baseSize = 1.4;

      if (rand < 0.2) {
        layer = 0.35 + Math.random() * 0.3; // Inner core cloud
        baseSize = 1.0 + Math.random() * 1.4;
      } else if (rand < 0.8) {
        layer = 0.82 + Math.random() * 0.22; // Main sphere shell
        baseSize = 1.2 + Math.random() * 1.8;
      } else {
        layer = 1.08 + Math.random() * 0.25; // Outer halo
        baseSize = 0.9 + Math.random() * 1.2;
      }

      particles.push({
        nx: x,
        ny: y,
        nz: z,
        layerRadius: layer,
        baseSize,
        color: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2,
        freq: 1.5 + Math.random() * 2.5,
        speed: 0.6 + Math.random() * 0.8,
      });
    }

    let rotY = 0;
    let rotX = 0;
    let smoothedIntensity = 0.2;
    let lastTime = performance.now();
    const startTime = performance.now();
    let shockwaveCooldown = 0;

    const render = (now: number) => {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;
      const t = (now - startTime) / 1000;

      try {
        // Clear with deep space canvas
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#03050a";
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        // Compute Voice Reactivity Intensity
        const rawMic = micLevelRef.current || 0;
        let targetIntensity = 0.18;
        if (isSpeaking) {
          targetIntensity = 0.88 + Math.sin(t * 7.5) * 0.22;
        } else if (isListening) {
          targetIntensity = 0.42 + rawMic * 2.0;
        } else if (isThinking) {
          targetIntensity = 0.68 + Math.sin(t * 5.0) * 0.25;
        } else {
          targetIntensity = 0.22 + Math.sin(t * 1.6) * 0.08;
        }

        smoothedIntensity += (targetIntensity - smoothedIntensity) * Math.min(1, dt * 7.0);

        // Automatically trigger shockwave pulse on high voice surge
        shockwaveCooldown -= dt;
        if (smoothedIntensity > 0.75 && shockwaveCooldown <= 0) {
          triggerShockwave(isSpeaking ? "#ff008a" : "#00f5ff");
          shockwaveCooldown = 0.65;
        }

        // Center calculation: Upper-middle area optimal for phone screen without UI overlap
        const cx = cssWidth / 2;
        const cy = cssHeight * 0.40;

        // Base Radius for phone screens - compact so it never overlaps header or transcript
        const baseRadius = Math.min(cssWidth * 0.30, cssHeight * 0.16, 140);
        const dynamicRadius = baseRadius * (1 + smoothedIntensity * 0.25);
        const fov = dynamicRadius * 3.6;

        // Apply Inertial Touch Drag Rotation
        if (!touchStateRef.current.isDown) {
          touchStateRef.current.velX *= 0.94;
          touchStateRef.current.velY *= 0.94;
          customRotRef.current.y += touchStateRef.current.velX * 0.005;
          customRotRef.current.x += touchStateRef.current.velY * 0.005;
        }

        // Continuous ambient rotation + user drag
        rotY += (0.45 + smoothedIntensity * 0.55) * dt;
        rotX = Math.sin(t * 0.5) * 0.18;

        const totalRotY = rotY + customRotRef.current.y;
        const totalRotX = rotX + customRotRef.current.x;

        const cosRY = Math.cos(totalRotY);
        const sinRY = Math.sin(totalRotY);
        const cosRX = Math.cos(totalRotX);
        const sinRX = Math.sin(totalRotX);

        // ==========================================
        // 1. ANAMORPHIC HORIZONTAL SCI-FI LENS FLARE (IMG_4693 style)
        // ==========================================
        const flareWidth = dynamicRadius * (2.8 + smoothedIntensity * 0.9);
        const flareHeight = 5 + smoothedIntensity * 12;

        // Horizontal Soft Glow Flare
        const horizGrad = ctx.createLinearGradient(cx - flareWidth, cy, cx + flareWidth, cy);
        horizGrad.addColorStop(0, "rgba(0, 245, 255, 0)");
        horizGrad.addColorStop(0.3, `rgba(0, 245, 255, ${0.15 + smoothedIntensity * 0.25})`);
        horizGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.75 + smoothedIntensity * 0.25})`);
        horizGrad.addColorStop(0.7, `rgba(255, 0, 138, ${0.15 + smoothedIntensity * 0.25})`);
        horizGrad.addColorStop(1, "rgba(255, 0, 138, 0)");

        ctx.fillStyle = horizGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, flareWidth, flareHeight * 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slender Sharp Laser Line
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + smoothedIntensity * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, flareWidth * 0.85, 1.2 + smoothedIntensity * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vertical Subtle Crosshair Needle
        const vertGrad = ctx.createLinearGradient(cx, cy - dynamicRadius * 1.4, cx, cy + dynamicRadius * 1.4);
        vertGrad.addColorStop(0, "rgba(0, 245, 255, 0)");
        vertGrad.addColorStop(0.5, `rgba(0, 245, 255, ${0.35 + smoothedIntensity * 0.3})`);
        vertGrad.addColorStop(1, "rgba(0, 245, 255, 0)");
        ctx.strokeStyle = vertGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - dynamicRadius * 1.3);
        ctx.lineTo(cx, cy + dynamicRadius * 1.3);
        ctx.stroke();

        // ==========================================
        // 2. EXPANDING ACOUSTIC SHOCKWAVE PULSES
        // ==========================================
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const rip = ripplesRef.current[i];
          rip.r += 120 * dt;
          rip.alpha -= 0.65 * dt;

          if (rip.alpha <= 0 || rip.r >= rip.maxR) {
            ripplesRef.current.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = rip.color;
          ctx.globalAlpha = Math.max(0, rip.alpha);
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(cx, cy, rip.r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // ==========================================
        // 3. OUTER TECHNICAL HUD RETICLE & TICK MARKS (Holographic Astrolabe)
        // ==========================================
        const outerHudRadius = dynamicRadius * 1.05;

        // Outer Continuous Faint Ring
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.28 + smoothedIntensity * 0.2})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, outerHudRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Outer Dashed Rotating Track
        ctx.save();
        ctx.strokeStyle = `rgba(255, 0, 138, ${0.35 + smoothedIntensity * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = -t * 22;
        ctx.beginPath();
        ctx.arc(cx, cy, outerHudRadius * 0.94, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Outer Perimeter Tick Marks (Every 15 degrees)
        const tickStep = 24;
        for (let i = 0; i < tickStep; i++) {
          const angle = (i / tickStep) * Math.PI * 2 + t * 0.15;
          const isMajor = i % 6 === 0;
          const len = isMajor ? 12 : 5;
          const r1 = outerHudRadius + 2;
          const r2 = r1 + len;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          ctx.strokeStyle = isMajor
            ? `rgba(0, 245, 255, ${0.7 + smoothedIntensity * 0.3})`
            : "rgba(0, 245, 255, 0.25)";
          ctx.lineWidth = isMajor ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(cx + cosA * r1, cy + sinA * r1);
          ctx.lineTo(cx + cosA * r2, cy + sinA * r2);
          ctx.stroke();
        }

        // ==========================================
        // 4. HOLOGRAPHIC 3D GYROSCOPE RINGS (Quantum Reactor Orbits)
        // ==========================================
        // 3 Tilted Gyroscope Rings rotating in 3D
        const ringConfigs = [
          { tiltX: 0.45, tiltY: 0.6, speed: 0.8, color: [0, 245, 255], radiusScale: 1.0, dash: [14, 8] },
          { tiltX: -0.55, tiltY: 0.35, speed: -0.65, color: [255, 0, 138], radiusScale: 0.92, dash: [20, 12] },
          { tiltX: 0.85, tiltY: -0.4, speed: 0.5, color: [157, 78, 221], radiusScale: 0.84, dash: [10, 6] },
          { tiltX: -0.2, tiltY: 0.95, speed: -0.9, color: [0, 255, 170], radiusScale: 0.76, dash: [6, 14] },
        ];

        ringConfigs.forEach((rc, ringIdx) => {
          const ringPoints = 64;
          const rBase = dynamicRadius * rc.radiusScale;
          const ringRot = t * rc.speed + ringIdx * 1.5;

          ctx.beginPath();
          let firstX = 0, firstY = 0;

          for (let pIdx = 0; pIdx <= ringPoints; pIdx++) {
            const angle = (pIdx / ringPoints) * Math.PI * 2;

            // Audio wave ripple traveling through ring
            const wave = Math.sin(angle * 6 + t * 6 + ringIdx) * (smoothedIntensity * 14);
            const rEff = rBase + wave;

            let rx = Math.cos(angle) * rEff;
            let ry = Math.sin(angle) * rEff;
            let rz = 0;

            // Apply Ring Tilt
            const cosT = Math.cos(rc.tiltX);
            const sinT = Math.sin(rc.tiltX);
            const y1 = ry * cosT - rz * sinT;
            const z1 = ry * sinT + rz * cosT;
            ry = y1;
            rz = z1;

            // Rotate around Y axis
            const cosRot = Math.cos(ringRot + totalRotY * 0.3);
            const sinRot = Math.sin(ringRot + totalRotY * 0.3);
            const x2 = rx * cosRot - rz * sinRot;
            const z2 = rx * sinRot + rz * cosRot;
            rx = x2;
            rz = z2;

            // Perspective
            const sc = fov / (fov + rz);
            const px = cx + rx * sc;
            const py = cy + ry * sc;

            if (pIdx === 0) {
              firstX = px;
              firstY = py;
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();

          ctx.save();
          ctx.strokeStyle = `rgba(${rc.color[0]}, ${rc.color[1]}, ${rc.color[2]}, ${0.45 + smoothedIntensity * 0.45})`;
          ctx.lineWidth = 1.6 + smoothedIntensity * 1.2;
          ctx.setLineDash(rc.dash);
          ctx.lineDashOffset = t * 15 * (ringIdx % 2 === 0 ? 1 : -1);
          ctx.stroke();
          ctx.restore();

          // Orbiting Glowing Node Photon on each ring
          const nodeAngle = t * rc.speed * 1.8 + ringIdx * 2.2;
          let nx = Math.cos(nodeAngle) * rBase;
          let ny = Math.sin(nodeAngle) * rBase;
          let nz = 0;
          const y1 = ny * Math.cos(rc.tiltX) - nz * Math.sin(rc.tiltX);
          const z1 = ny * Math.sin(rc.tiltX) + nz * Math.cos(rc.tiltX);
          const x2 = nx * Math.cos(ringRot + totalRotY * 0.3) - z1 * Math.sin(ringRot + totalRotY * 0.3);
          const z2 = nx * Math.sin(ringRot + totalRotY * 0.3) + z1 * Math.cos(ringRot + totalRotY * 0.3);
          const nsc = fov / (fov + z2);
          const npx = cx + x2 * nsc;
          const npy = cy + y1 * nsc;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(npx, npy, 3.5 * nsc, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(${rc.color[0]}, ${rc.color[1]}, ${rc.color[2]}, 0.8)`;
          ctx.beginPath();
          ctx.arc(npx, npy, 7 * nsc, 0, Math.PI * 2);
          ctx.fill();
        });

        // ==========================================
        // 5. 3D PROJECTED PARTICLE MATRIX
        // ==========================================
        interface ProjectedItem {
          px: number;
          py: number;
          z: number;
          size: number;
          alpha: number;
          color: [number, number, number];
          layer: number;
        }
        const projected: ProjectedItem[] = [];

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Complex harmonic wave undulation
          const wave =
            Math.sin(p.ny * 6.0 + t * 6.5) *
            Math.cos(p.nx * 5.0 - t * 5.5) *
            (smoothedIntensity * 28);

          const r = dynamicRadius * p.layerRadius + wave;

          let x = p.nx * r;
          let y = p.ny * r;
          let z = p.nz * r;

          // Apply 3D Rotation
          const yRot = y * cosRX - z * sinRX;
          const zRotX = y * sinRX + z * cosRX;
          y = yRot;
          z = zRotX;

          const xRot = x * cosRY - z * sinRY;
          const zRot = x * sinRY + z * cosRY;
          x = xRot;
          z = zRot;

          // 3D Perspective Projection
          const scale = fov / (fov + z);
          const px = cx + x * scale;
          const py = cy + y * scale;

          const depth = Math.max(0.12, Math.min(1.0, (z + dynamicRadius) / (2 * dynamicRadius)));
          const twinkle = 0.72 + Math.sin(t * p.freq + p.phase) * 0.28;
          const alpha = depth * twinkle * (0.35 + smoothedIntensity * 0.65);
          const pSize = Math.max(0.8, p.baseSize * scale * (1.0 + smoothedIntensity * 0.55));

          projected.push({ px, py, z, size: pSize, alpha, color: p.color, layer: p.layerRadius });
        }

        // Draw back to front for accurate depth layering
        projected.sort((a, b) => a.z - b.z);

        // ==========================================
        // 6. PLASMA ARC FILAMENTS (Quantum Lightning Sparks)
        // ==========================================
        ctx.lineWidth = 1.0;
        const arcStep = 18; // Connect periodic close particles
        for (let i = 0; i < projected.length - arcStep; i += arcStep) {
          const p1 = projected[i];
          const p2 = projected[i + arcStep];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const distSq = dx * dx + dy * dy;

          if (distSq < 3200 && p1.z > 0 && p2.z > 0) {
            const arcAlpha = Math.min(p1.alpha, p2.alpha) * (0.25 + smoothedIntensity * 0.45);
            ctx.strokeStyle = `rgba(0, 245, 255, ${arcAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            // Jitter mid-point for electric plasma lightning effect
            const midX = (p1.px + p2.px) / 2 + (Math.sin(t * 18 + i) * 6);
            const midY = (p1.py + p2.py) / 2 + (Math.cos(t * 18 + i) * 6);
            ctx.quadraticCurveTo(midX, midY, p2.px, p2.py);
            ctx.stroke();
          }
        }

        // Render Projected Particles
        for (let i = 0; i < projected.length; i++) {
          const pt = projected[i];

          ctx.fillStyle = `rgba(${pt.color[0]}, ${pt.color[1]}, ${pt.color[2]}, ${pt.alpha})`;
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);
          ctx.fill();

          // Specular Glint on Front-Facing Hot Particles
          if (pt.z > dynamicRadius * 0.3 && pt.alpha > 0.65) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha * 0.9})`;
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, pt.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ==========================================
        // 7. CENTRAL SINGULARITY NUCLEUS (Blinding Arc Reactor Core)
        // ==========================================
        const coreRadius = (baseRadius * 0.28) * (1 + smoothedIntensity * 0.45);

        // Core Ambient Radiant Corona
        const coreAura = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreRadius * 1.8);
        coreAura.addColorStop(0, `rgba(255, 255, 255, ${0.9 + smoothedIntensity * 0.1})`);
        coreAura.addColorStop(0.2, `rgba(0, 245, 255, ${0.75 + smoothedIntensity * 0.25})`);
        coreAura.addColorStop(0.55, `rgba(255, 0, 138, ${0.35 + smoothedIntensity * 0.3})`);
        coreAura.addColorStop(0.85, `rgba(157, 78, 221, ${0.12 + smoothedIntensity * 0.15})`);
        coreAura.addColorStop(1, "rgba(3, 5, 10, 0)");

        ctx.fillStyle = coreAura;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Tech Iris Rings in Core
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.7 + smoothedIntensity * 0.3})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + smoothedIntensity * 0.4})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = t * 12;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // High-Intensity Center Spot
        const centerSpot = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 0.25);
        centerSpot.addColorStop(0, "#ffffff");
        centerSpot.addColorStop(0.5, "#ffffff");
        centerSpot.addColorStop(1, "rgba(0, 245, 255, 0.4)");
        ctx.fillStyle = centerSpot;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();

      } catch (err) {
        // Keep animation frame resilient
      } finally {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isOpen, isSpeaking, isListening, isThinking, visualMode, triggerShockwave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-[#04060c] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* 3D Background Interactive Quantum Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          touchStateRef.current.isDown = true;
          touchStateRef.current.startX = e.clientX;
          touchStateRef.current.startY = e.clientY;
          touchStateRef.current.lastX = e.clientX;
          touchStateRef.current.lastY = e.clientY;
          touchStateRef.current.velX = 0;
          touchStateRef.current.velY = 0;
        }}
        onPointerMove={(e) => {
          if (!touchStateRef.current.isDown) return;
          const dx = e.clientX - touchStateRef.current.lastX;
          const dy = e.clientY - touchStateRef.current.lastY;
          touchStateRef.current.velX = dx;
          touchStateRef.current.velY = dy;
          customRotRef.current.y += dx * 0.008;
          customRotRef.current.x += dy * 0.008;
          touchStateRef.current.lastX = e.clientX;
          touchStateRef.current.lastY = e.clientY;
        }}
        onPointerUp={(e) => {
          touchStateRef.current.isDown = false;
          const dist = Math.hypot(e.clientX - touchStateRef.current.startX, e.clientY - touchStateRef.current.startY);
          if (dist < 8) {
            triggerShockwave("#00f5ff");
            playBeep(880, 0.08);
          }
        }}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-0"
      />

      {/* TOP BAR: Safe area header for iPhone notch */}
      <header className="relative z-20 pt-safe pt-3 px-4 flex items-center justify-between backdrop-blur-md bg-black/50 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          {/* Agent Core Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: currentAgent.color }}
            />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-cyan-300">
              {currentAgent.name}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-mono uppercase font-bold">
              VOICE
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowUrlModal(true)}
            className="p-2 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white transition active:scale-90 cursor-pointer"
            title="Direkt-Link für iPhone Home-Bildschirm"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-full border transition active:scale-90 cursor-pointer ${
              isMuted
                ? "bg-rose-950/80 border-rose-500 text-rose-300"
                : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white"
            }`}
            title={isMuted ? "Stummschaltung aufheben" : "Stummschalten"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white transition active:scale-90 cursor-pointer"
            title="Zurück zum Dashboard / Cores"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* AI Studio Iframe Warning & Direct Link Banner */}
      {isInsideAiStudio && (
        <div className="relative z-30 mx-3 mt-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-cyan-950/90 border border-amber-400/50 backdrop-blur-md text-[11px] font-mono flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-1.5 text-amber-200 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="truncate font-semibold">AI Studio Vorschau: Für Mikrofon & Vollbild Direkt-Link nutzen</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(activeAppUrl);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold active:scale-95 cursor-pointer"
            >
              {copiedUrl ? "✓ KOPIERT" : "📋 KOPIEREN"}
            </button>
            <a
              href={activeAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[9px] flex items-center gap-1 active:scale-95 shadow cursor-pointer"
            >
              <span>ÖFFNEN</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* CORE SWITCHER PILL ROW (Switch between N.E.O., PAPAYA, VEGA, CHRONOS, etc.) */}
      <div className="relative z-20 px-4 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {agents.map((ag) => {
          const isSelected = ag.id === currentAgent.id;
          return (
            <button
              key={ag.id}
              onClick={() => {
                onSelectAgent(ag);
                playBeep(620, 0.05);
              }}
              style={{
                borderColor: isSelected ? ag.color : "rgba(255,255,255,0.1)",
                color: isSelected ? "#ffffff" : "rgba(255,255,255,0.6)",
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider shrink-0 transition active:scale-95 flex items-center gap-1 border ${
                isSelected ? "bg-white/10 shadow-[0_0_12px_rgba(0,245,255,0.3)]" : "bg-black/40 hover:bg-white/5"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ag.color }} />
              <span>{ag.name}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Animation Visual Mode Bar (Styled compactly so it doesn't touch the Orb) */}
      <div className="relative z-20 px-4 pt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10 backdrop-blur-md">
          <button
            onClick={() => {
              setVisualMode("quantum");
              triggerShockwave("#00f5ff");
              playBeep(680, 0.05);
            }}
            className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider transition uppercase font-bold cursor-pointer ${
              visualMode === "quantum"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌀 REAKTOR
          </button>
          <button
            onClick={() => {
              setVisualMode("neural");
              triggerShockwave("#ff008a");
              playBeep(740, 0.05);
            }}
            className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider transition uppercase font-bold cursor-pointer ${
              visualMode === "neural"
                ? "bg-pink-500/30 text-pink-300 border border-pink-400/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌌 NEURAL
          </button>
          <button
            onClick={() => {
              setVisualMode("supernova");
              triggerShockwave("#ffbe0b");
              playBeep(820, 0.05);
            }}
            className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider transition uppercase font-bold cursor-pointer ${
              visualMode === "supernova"
                ? "bg-amber-500/30 text-amber-300 border border-amber-400/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            💥 PULSAR
          </button>
        </div>

        <span className="text-[9px] font-mono text-cyan-400/70">
          👆 TOUCH ZUM DREHEN
        </span>
      </div>

      {/* CENTER STATUS BADGE (Interactive: Click to start speech) */}
      <div className="relative z-10 text-center px-4 mt-1">
        <button
          onClick={() => {
            if (!isListening) startListening();
          }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-cyan-400/40 backdrop-blur-md text-[11px] font-mono text-cyan-200 tracking-wider uppercase shadow-lg cursor-pointer active:scale-95 transition"
        >
          {isThinking ? (
            <>
              <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
              <span>N.E.O. DENKT NACH...</span>
            </>
          ) : isSpeaking ? (
            <>
              <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
              <span>N.E.O. ANTWORTET</span>
            </>
          ) : isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-bold">ICH HÖRE ZU... (SPRECHE JETZT)</span>
            </>
          ) : (
            <>
              <Mic className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>🎙️ TIPPEN ZUM SPRECHEN</span>
            </>
          )}
        </button>
      </div>

      {/* BOTTOM CONTROL DECK: Transcripts + Quick Prompts + Big Mic Orb */}
      <div className="relative z-20 px-4 pb-safe pb-5 space-y-2.5">
        {/* Live Dynamic Speech Transcript Card */}
        <div className="p-3 rounded-2xl bg-black/85 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.8)] space-y-1.5 max-h-32 overflow-y-auto">
          {/* User Transcript */}
          {userTranscript && (
            <div className="flex items-start gap-2 border-b border-white/10 pb-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider shrink-0 mt-0.5">
                DU:
              </span>
              <p className="text-xs text-amber-100 font-sans leading-relaxed break-words">
                {userTranscript}
              </p>
            </div>
          )}

          {/* N.E.O. Response */}
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider shrink-0 mt-0.5">
              {currentAgent.name}:
            </span>
            <p className="text-xs text-cyan-100 font-sans leading-relaxed break-words">
              {neoResponse}
            </p>
          </div>
        </div>

        {/* Text Input Fallback if enabled */}
        {showTextInput && (
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/90 border border-cyan-400/50 backdrop-blur-md animate-fade-in">
            <input
              type="text"
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && textInputValue.trim()) {
                  const text = textInputValue.trim();
                  setTextInputValue("");
                  setUserTranscript(text);
                  handleProcessUserSpeech(text);
                }
              }}
              placeholder={lang === "de" ? "Befehl oder Frage eingeben..." : "Type command or prompt..."}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
              autoFocus
            />
            <button
              onClick={() => {
                if (textInputValue.trim()) {
                  const text = textInputValue.trim();
                  setTextInputValue("");
                  setUserTranscript(text);
                  handleProcessUserSpeech(text);
                }
              }}
              className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold active:scale-95 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips (Thumb-friendly fast tap) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            "⚡ Statusbericht",
            "📅 Termine heute",
            "🔍 Was gibt es Neues?",
            "💡 Was kannst du?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUserTranscript(prompt);
                handleProcessUserSpeech(prompt);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 border border-slate-700/60 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-200 font-mono text-[10px] tracking-wider shrink-0 transition active:scale-95 cursor-pointer shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Giant Touch Interface */}
        <div className="flex items-center justify-between gap-2.5 pt-0.5">
          {/* Hands-Free Toggle */}
          <button
            onClick={() => {
              const next = !isHandsFree;
              setIsHandsFree(next);
              if (next) {
                startListening();
              } else {
                stopListening();
              }
              playBeep(next ? 660 : 330, 0.08);
            }}
            className={`flex-1 py-3 px-3 rounded-2xl border font-mono text-[11px] font-bold tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
              isHandsFree
                ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "bg-slate-900/80 border-slate-700 text-slate-400"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isHandsFree ? "animate-pulse text-emerald-400" : ""}`} />
            <span>{isHandsFree ? "FREISPRECHEN: AN" : "FREISPRECHEN: AUS"}</span>
          </button>

          {/* Toggle Text Keyboard Fallback */}
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-3 rounded-2xl border transition active:scale-95 cursor-pointer ${
              showTextInput
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white"
            }`}
            title="Tastatur einblenden"
          >
            <Keyboard className="w-5 h-5" />
          </button>

          {/* Main Giant Glowing Mic Button */}
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shadow-2xl transition active:scale-90 cursor-pointer ${
              isListening
                ? "bg-gradient-to-tr from-cyan-400 to-pink-500 border-white text-slate-950 shadow-[0_0_35px_rgba(0,245,255,0.7)] animate-pulse"
                : "bg-gradient-to-tr from-slate-900 to-cyan-950 border-cyan-400 text-cyan-300 hover:border-white shadow-[0_0_20px_rgba(0,245,255,0.3)]"
            }`}
            title="Mikrofon antippen"
          >
            {isListening ? (
              <Mic className="w-7 h-7 stroke-[2.5]" />
            ) : (
              <Mic className="w-6 h-6 stroke-[2]" />
            )}
          </button>
        </div>
      </div>

      {/* MODAL: Direct URL & Standalone iOS PWA Guide */}
      {showUrlModal && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-[#090d16] border border-cyan-500/50 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,245,255,0.3)] space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>IPHONE VOLLBILD-APP INSTALLIEREN</span>
              </span>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 space-y-1">
                <strong className="block font-bold">⚠️ WICHTIG:</strong>
                <p>
                  Auf deinem Home-Bildschirm war bisher noch der Link zu <code>aistudio.google.com</code> gespeichert. In dieser Vorschau sperrt Apple das Mikrofon.
                </p>
              </div>

              <div className="space-y-2 font-sans">
                <p className="font-bold text-white">So installierst du die echte N.E.O. App:</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                  <li>Öffne die Standalone-URL unten im Safari-Browser.</li>
                  <li>Tippe unten in der Safari-Leiste auf das <strong>Teilen-Symbol</strong> (Quadrat mit Pfeil).</li>
                  <li>Wähle <strong>&quot;Zum Home-Bildschirm&quot;</strong>.</li>
                  <li>Jetzt startet N.E.O. sofort als echte App im Vollbild mit funktionierender Sprache!</li>
                </ol>
              </div>

              <div className="p-2.5 rounded-xl bg-black/80 border border-slate-700 font-mono text-[10px] text-cyan-300 break-all select-all">
                {activeAppUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(activeAppUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2500);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-mono text-xs font-bold text-white transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? "KOPIERT!" : "LINK KOPIEREN"}</span>
              </button>
              <a
                href={activeAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowUrlModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(0,245,255,0.4)] cursor-pointer"
              >
                <span>IM SAFARI ÖFFNEN</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
