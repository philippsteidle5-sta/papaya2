import React, { useEffect, useRef, useState, useCallback } from "react";
import { VolumeX, Volume2, Mic, Radio, CheckCircle2, Filter, Sliders, Map, Film, Camera, Image as ImageIcon, Play, Sparkles } from "lucide-react";
import { NeoGoogleMapsRoutePlanner } from "./NeoGoogleMapsRoutePlanner";
import { isVideoUrl } from "../utils/mediaUtils";

interface NeoSpeakOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string, mediaUrls?: string[]) => Promise<string | void>;
  isNeoSpeaking?: boolean;
  speakingLevel?: number;
  micLevel?: number;
  onStopSpeaking?: () => void;
}

interface SonicRipple {
  r: number;
  maxR: number;
  alpha: number;
  speed: number;
  color: [number, number, number];
}

interface ConstellationNode {
  nx: number;
  ny: number;
  nz: number;
  baseSize: number;
  colorIdx: number;
  phase: number;
  neighbors: number[];
}

interface StardustParticle {
  theta: number;
  phi: number;
  baseR: number;
  orbitSpeed: number;
  size: number;
  colorIdx: number;
  twinkleFreq: number;
  twinklePhase: number;
  wobbleAmp: number;
}

interface UserSatelliteParticle {
  angle: number;
  speed: number;
  dist: number;
  size: number;
  alpha: number;
}

interface FluidRibbon {
  phase: number;
  speed: number;
  freq: number;
  color: string;
  width: number;
}

interface BridgePulse {
  progress: number;
  speed: number;
  direction: 1 | -1; // 1 = Neo to User, -1 = User to Neo
  size: number;
  color: [number, number, number];
}

export interface AddressingDecision {
  isAddressed: boolean;
  reason: string;
  matchedTrigger?: string;
}

/**
 * Intelligent Route Intent Parser for Live Google Maps Integration in Speak Mode
 */
export function parseRouteIntent(text: string): {
  origin: string;
  destination: string;
  travelMode: "d" | "r" | "w" | "b";
} | null {
  if (!text) return null;
  const clean = text.trim();

  // 1. "von X nach Y" or "ab X nach Y" (e.g. "plane route von Berlin nach München", "von Frankfurt nach Paris")
  const pat1 = /(?:von|ab)\s+([A-Za-zÄÖÜäöüß0-9\s\-.,]+?)\s+(?:nach|zu|bis|to|->)\s+([A-Za-zÄÖÜäöüß0-9\s\-.,]+)/i;
  const m1 = clean.match(pat1);
  if (m1 && m1[1] && m1[2]) {
    const orig = m1[1].replace(/^(?:einer|eine|der|dem|meinem|unserem)\s+/i, "").trim();
    const dest = m1[2].replace(/[?!.,;]/g, "").trim();
    if (orig.length >= 2 && dest.length >= 2) {
      let mode: "d" | "r" | "w" | "b" = "d";
      if (/zu\s+fuß|gehen|laufen|walk/i.test(clean)) mode = "w";
      else if (/fahrrad|bike|rad/i.test(clean)) mode = "b";
      else if (/bahn|zug|öpnw|transit|bus/i.test(clean)) mode = "r";
      return { origin: orig, destination: dest, travelMode: mode };
    }
  }

  // 2. "route nach X" or "navigiere nach X" or "weg nach X" (starts from Frankfurt or current location)
  const pat2 = /(?:route|navigation|navigiere|weg|strecke|fahrt)\s+(?:nach|zu|to)\s+([A-Za-zÄÖÜäöüß0-9\s\-.,]+)/i;
  const m2 = clean.match(pat2);
  if (m2 && m2[1]) {
    const dest = m2[1].replace(/[?!.,;]/g, "").trim();
    if (dest.length >= 2) {
      let mode: "d" | "r" | "w" | "b" = "d";
      if (/zu\s+fuß|gehen|laufen|walk/i.test(clean)) mode = "w";
      else if (/fahrrad|bike|rad/i.test(clean)) mode = "b";
      else if (/bahn|zug|öpnw|transit|bus/i.test(clean)) mode = "r";
      return { origin: "Frankfurt am Main", destination: dest, travelMode: mode };
    }
  }

  // 3. "nach X navigieren" or "nach X fahren"
  const pat3 = /nach\s+([A-Za-zÄÖÜäöüß0-9\s\-.,]+?)\s+(?:navigieren|fahren|reisen|kommen)/i;
  const m3 = clean.match(pat3);
  if (m3 && m3[1]) {
    const dest = m3[1].replace(/[?!.,;]/g, "").trim();
    if (dest.length >= 2) {
      return { origin: "Frankfurt am Main", destination: dest, travelMode: "d" };
    }
  }

  return null;
}

/**
 * Intelligent filter ensuring NEO only answers when he is actually meant / addressed.
 * Prevents answering background chatter, phone calls, or talking to other people in the room.
 */
export function checkNeoAddressed(
  rawText: string,
  lastNeoReplyTimestamp: number,
  mode: "addressed_only" | "all"
): AddressingDecision {
  if (mode === "all") {
    return { isAddressed: true, reason: "Filter deaktiviert (Antwortet immer)" };
  }

  const text = rawText.trim().toLowerCase();
  if (text.length < 2) {
    return { isAddressed: false, reason: "Zu kurzes Fragment" };
  }

  // 1. Explicit wake words / assistant names anywhere in the phrase
  const wakeMatch = text.match(/\b(neo|n\.e\.o|nio|neyo|jarvis|syntax|computer|system|assistent|ki|bot)\b/i);
  if (wakeMatch) {
    return {
      isAddressed: true,
      reason: `Name erkannt ("${wakeMatch[0].toUpperCase()}")`,
      matchedTrigger: wakeMatch[0],
    };
  }

  // 2. Direct conversational greeting / attention-getter
  const greetMatch = text.match(
    /\b(hey|hallo|hi|servus|moin|guten tag|guten morgen|guten abend)\s+(neo|jarvis|syntax|computer)\b/i
  );
  if (greetMatch) {
    return {
      isAddressed: true,
      reason: `Direkte Ansprache ("${greetMatch[0]}")`,
      matchedTrigger: greetMatch[0],
    };
  }

  if (/\b(sag mal|hör mal|pass mal auf|hör zu)\b/i.test(text)) {
    return {
      isAddressed: true,
      reason: "Aufmerksamkeits-Aufruf",
    };
  }

  // 3. Direct imperative assistant actions, route questions & inquiries
  const cmdMatch = text.match(
    /^(kannst du|könntest du|kann man|würdest du|hilf mir|hilf|sag mir|erklär|erkläre|analysiere|berechne|prüfe|check|checke|zeige|zeig|suche|finde|öffne|schließe|starte|stoppe|erstelle|generiere|schreibe|schreib|übersetze|mach mal|was ist|was sind|was war|was bedeutet|wer ist|wer war|wo ist|wie funktioniert|wie geht|wie viel|wie viele|warum|wieso|weshalb|wie spät|wie sieht es aus|statusbericht|systemstatus|plane|navigiere|navigation|route|strecke|fahr|wie komme ich|wo liegt|wie weit|bring mich|hast du|gibt es|kennst du|weißt du|was hältst|was meinst|was denkst)\b/i
  );
  if (cmdMatch || text.includes("?")) {
    return {
      isAddressed: true,
      reason: cmdMatch ? `Direkte Frage / Befehl ("${cmdMatch[0]}")` : "Frage an N.E.O.",
      matchedTrigger: cmdMatch ? cmdMatch[0] : "?",
    };
  }

  // Check if route command
  if (parseRouteIntent(rawText)) {
    return {
      isAddressed: true,
      reason: "Google Maps Routenanfrage",
      matchedTrigger: "route",
    };
  }

  // 4. Ongoing dialogue continuity (within 14 seconds after NEO spoke)
  const timeSinceReply = Date.now() - lastNeoReplyTimestamp;
  if (lastNeoReplyTimestamp > 0 && timeSinceReply < 14000) {
    const dialogFollowUp =
      /^(ja|nein|genau|richtig|mach das|und warum|warum|ok|okay|danke|super|perfekt|verstanden|weiter|nochmal|was noch|zeig es|mach weiter|stopp|nein danke)\b/i;
    if (dialogFollowUp.test(text) || text.split(" ").length <= 4) {
      return {
        isAddressed: true,
        reason: "Laufender Dialog (Follow-up)",
      };
    }
  }

  return {
    isAddressed: false,
    reason: "Nicht an N.E.O. gerichtet (Hintergrund ignoriert)",
  };
}

export const NeoSpeakOverlay: React.FC<NeoSpeakOverlayProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  isNeoSpeaking = false,
  speakingLevel = 0,
  micLevel = 0,
  onStopSpeaking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  // Default to "all" so N.E.O. always answers smoothly in live speak mode
  const [filterMode, setFilterMode] = useState<"addressed_only" | "all">("all");
  const [userTranscript, setUserTranscript] = useState("");
  const [neoLastResponse, setNeoLastResponse] = useState("Bereit, Boss. Sprich einfach mit mir – ich höre zu.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [lastAddressingResult, setLastAddressingResult] = useState<AddressingDecision | null>(null);

  // Attached Media (Videos & Photos) in Speak Mode
  const [attachedMedia, setAttachedMedia] = useState<string[]>([]);
  const attachedMediaRef = useRef<string[]>([]);
  attachedMediaRef.current = attachedMedia;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);

  const handleSelectMediaFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list || list.length === 0) return;

    const newItems: string[] = [];
    for (const file of list) {
      const isVid = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg|avi|quicktime)$/i.test(file.name);
      if (isVid) {
        if (file.size > 80 * 1024 * 1024) {
          setMediaWarning(`Video "${file.name}" ist größer als 80MB. Bitte Clip unter 80MB wählen.`);
          setTimeout(() => setMediaWarning(null), 5000);
          continue;
        }
        try {
          const videoDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") resolve(reader.result);
              else reject(new Error("Video konnte nicht gelesen werden"));
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          newItems.push(videoDataUrl);
        } catch (e) {
          console.error("Video load error:", e);
        }
      } else if (file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
        try {
          const imgDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") resolve(reader.result);
              else reject(new Error("Bild konnte nicht gelesen werden"));
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          newItems.push(imgDataUrl);
        } catch (e) {
          console.error("Image load error:", e);
        }
      }
    }

    if (newItems.length > 0) {
      setAttachedMedia((prev) => [...prev, ...newItems]);
      const vidCount = newItems.filter(isVideoUrl).length;
      const imgCount = newItems.length - vidCount;
      if (vidCount > 0 && imgCount > 0) {
        setNeoLastResponse(`${vidCount} Video(s) und ${imgCount} Foto(s) empfangen. Sprich dazu oder klicke auf 'Video/Foto analysieren'.`);
      } else if (vidCount > 0) {
        setNeoLastResponse(`${vidCount === 1 ? 'Video' : vidCount + ' Videos'} empfangen. Sprich dazu oder klicke auf 'Video analysieren'.`);
      } else {
        setNeoLastResponse(`${newItems.length === 1 ? 'Foto' : newItems.length + ' Fotos'} empfangen. Sprich dazu oder klicke auf 'Foto analysieren'.`);
      }
    }
  }, []);

  const handleRemoveMedia = useCallback((idx: number) => {
    setAttachedMedia((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleClearAllMedia = useCallback(() => {
    setAttachedMedia([]);
  }, []);

  // 5-Second Dispatch Delay Countdown State
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const countdownIntervalRef = useRef<any>(null);
  const pendingSpeechRef = useRef<string>("");

  // Dedicated Google Maps & Routenplaner Integration for Speak Mode
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState("Frankfurt am Main");
  const [routeDest, setRouteDest] = useState("München");
  const [travelMode, setTravelMode] = useState<"d" | "r" | "w" | "b">("d");

  // Timestamps and references
  const lastNeoReplyTimeRef = useRef<number>(0);

  // References to eliminate closure staleness and prevent rapid re-render cycles
  const onSendMessageRef = useRef(onSendMessage);
  onSendMessageRef.current = onSendMessage;

  const onStopSpeakingRef = useRef(onStopSpeaking);
  onStopSpeakingRef.current = onStopSpeaking;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const filterModeRef = useRef(filterMode);
  filterModeRef.current = filterMode;

  const isNeoSpeakingRef = useRef(isNeoSpeaking);
  isNeoSpeakingRef.current = isNeoSpeaking;

  const speakingLevelRef = useRef(speakingLevel);
  speakingLevelRef.current = speakingLevel;

  const micLevelRef = useRef(micLevel);
  micLevelRef.current = micLevel;

  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;

  const recognitionRef = useRef<any>(null);
  const accumulatedSpeechRef = useRef("");
  const silenceTimerRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const filterBannerTimerRef = useRef<any>(null);
  const activeSessionRef = useRef(false);

  // Visual intensities for particle orbs
  const userSpeakingIntensity = useRef(1);

  // Web Audio Far-Field High-Gain Analyser & AGC
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const farFieldLevelRef = useRef<number>(0);

  // Starts the high-sensitivity Far-Field Web Audio AGC pipeline
  const startFarFieldAudioEngine = useCallback(async () => {
    if (mediaStreamRef.current) return;
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;

      // Request hardware Automatic Gain Control (AGC) + noise suppression + echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          noiseSuppression: true,
          echoCancellation: true,
          channelCount: 1,
        },
      });

      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);

      // 3.2x Gain Boost for far-field distance capture (user sitting far from mic)
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 3.2;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.35;
      analyserRef.current = analyser;

      source.connect(gainNode);
      gainNode.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const trackAudioLevel = () => {
        if (!isOpenRef.current || !mediaStreamRef.current || isMutedRef.current) {
          farFieldLevelRef.current = 0;
          return;
        }

        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length / 255;

        // Dynamic Far-field amplification
        const rawAmp = Math.max(0, avg - 0.02) * 3.8;
        const normalized = Math.min(1.0, rawAmp);
        farFieldLevelRef.current = normalized;

        if (normalized > 0.08) {
          userSpeakingIntensity.current = Math.max(userSpeakingIntensity.current, 1 + normalized * 2.5);
        }

        requestAnimationFrame(trackAudioLevel);
      };

      trackAudioLevel();
    } catch (err) {
      console.warn("[NeoSpeak] Far-field audio setup warning:", err);
    }
  }, []);

  const stopFarFieldAudioEngine = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    farFieldLevelRef.current = 0;
  }, []);

  // Safely halts recognition
  const stopRecognition = useCallback(() => {
    activeSessionRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownRemaining(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  // Automatic silence dispatch to NEO (only if addressed!)
  const dispatchToNeo = useCallback(
    async (textToSend: string) => {
      let cleaned = (textToSend || "").replace(/\s+/g, " ").trim();
      const currentMedia = [...attachedMediaRef.current];
      const hasMedia = currentMedia.length > 0;

      if ((!cleaned && !hasMedia) || isProcessingRef.current || isMutedRef.current || isNeoSpeakingRef.current) {
        return;
      }

      // If user uploaded video/photo but spoke no text, provide default prompt
      if (!cleaned && hasMedia) {
        const vidCount = currentMedia.filter(isVideoUrl).length;
        cleaned = vidCount > 0
          ? "Analysiere bitte dieses Video im Detail und beschreibe mir genau, was darin zu sehen ist, welche Handlungen stattfinden und worum es geht."
          : "Analysiere bitte dieses Bild im Detail und erkläre mir was du siehst.";
      }

      // Clear any pending countdown
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdownRemaining(null);

      // 1. Voice mute commands (always processed)
      if (/\b(mute|off|aus|ausschalten|stumm schalten|stumm|sei leise|pause|stopp)\b/i.test(cleaned)) {
        setIsMuted(true);
        isMutedRef.current = true;
        stopRecognition();
        if (onStopSpeakingRef.current) onStopSpeakingRef.current();
        setNeoLastResponse("Deaktiviert (OFF). Sage 'Ein' / 'On' oder drücke den Button.");
        setUserTranscript(cleaned);
        return;
      }

      // 2. Intelligent Addressing Filter: Is NEO meant?
      // Note: If media is attached, user explicitly chose to send it to N.E.O.
      const decision = hasMedia
        ? { isAddressed: true, reason: "Medien-Upload (Video/Foto) für N.E.O." }
        : checkNeoAddressed(cleaned, lastNeoReplyTimeRef.current, filterModeRef.current);
      setLastAddressingResult(decision);

      if (!decision.isAddressed) {
        // Speech was detected by Far-Field microphone, but NOT addressed to NEO!
        // Do NOT trigger LLM speech, but show clear HUD feedback so Philipp knows NEO heard it and respected his conversation.
        setFilterStatus(`[IGNORIERT: ${decision.reason} • RUFE 'NEO' ODER STELLE EINE FRAGE]`);
        if (filterBannerTimerRef.current) clearTimeout(filterBannerTimerRef.current);
        filterBannerTimerRef.current = setTimeout(() => {
          setFilterStatus(null);
        }, 4000);
        accumulatedSpeechRef.current = "";
        return;
      }

      // 3. NEO IS ADDRESSED: Proceed to response!
      setFilterStatus(`[ADRESSIERT: ${decision.reason}]`);
      stopRecognition();
      setIsProcessing(true);
      isProcessingRef.current = true;
      setUserTranscript(cleaned);
      accumulatedSpeechRef.current = "";

      // Check if user is asking for route planning or navigation in Google Maps
      const routeIntent = parseRouteIntent(cleaned);
      if (routeIntent) {
        setRouteOrigin(routeIntent.origin);
        setRouteDest(routeIntent.destination);
        if (routeIntent.travelMode) setTravelMode(routeIntent.travelMode);
        setShowRoutePlanner(true);
      }

      try {
        let enhancedPrompt = "";
        if (routeIntent) {
          const modeLabel =
            routeIntent.travelMode === "w"
              ? "Fußweg"
              : routeIntent.travelMode === "b"
              ? "Fahrrad"
              : routeIntent.travelMode === "r"
              ? "Bahn / ÖPNV"
              : "Auto";
          enhancedPrompt = `[NEO SPEAK MODUS - LIVE SPRACHVERBINDUNG // GOOGLE MAPS ROUTENPLANER]
Philipp (Boss) sagt: "${cleaned}"
Du hast den Google Maps Routenplaner für die Strecke von "${routeIntent.origin}" nach "${routeIntent.destination}" (Reisemodus: ${modeLabel}) auf dem Display geöffnet.
Antworte als loyaler Navigator direkt gesprochen in 1 bis maximal 2 kurzen Sätzen mit geschätzter Entfernung/Fahrzeit und der wichtigsten Route. Verwende keine Markdown-Formatierung (* oder #), keine Rauten und keine Links, sondern puren gesprochenen Text.`;
        } else {
          enhancedPrompt = `[NEO SPEAK MODUS - LIVE SPRACHVERBINDUNG]
Philipp (Boss) sagt: "${cleaned}"
Antworte direkt, schlagfertig und loyal in 1 bis maximal 3 gesprochenen Sätzen auf seine Frage oder Aussage. Sei proaktiv und steuere deinen Standpunkt bei. Verwende KEINE Markdown-Sterne (*), keine Rauten (#), keine Aufzählungszeichen und keine Links, sondern puren gesprochenen Text.`;
        }

        if (hasMedia) {
          const hasVids = currentMedia.some(isVideoUrl);
          const hasImgs = currentMedia.some((u) => !isVideoUrl(u));
          let mediaContext = "";
          if (hasVids && hasImgs) {
            mediaContext = `\n[MEDIENANHANG: Philipp hat dir ${currentMedia.length} Mediendateien (Videos und Fotos) übermittelt. Analysiere das Video und die Fotos im Detail.]`;
          } else if (hasVids) {
            mediaContext = `\n[MEDIENANHANG: Philipp hat dir ${currentMedia.length > 1 ? currentMedia.length + " Video-Clips" : "einen Video-Clip"} übermittelt. Analysiere das Video im Detail bezüglich Handlungen, Szenen, Personen und Inhalten.]`;
          } else {
            mediaContext = `\n[MEDIENANHANG: Philipp hat dir ${currentMedia.length > 1 ? currentMedia.length + " Fotos" : "ein Foto"} übermittelt. Analysiere den Bildinhalt im Detail.]`;
          }
          enhancedPrompt += mediaContext;
        }

        const reply = await onSendMessageRef.current(enhancedPrompt, currentMedia);
        if (reply && typeof reply === "string") {
          setNeoLastResponse(reply);
          lastNeoReplyTimeRef.current = Date.now();
        }
        // Clear media once dispatched
        setAttachedMedia([]);
      } catch (err) {
        console.error("[NeoSpeak] Error during automatic dispatch:", err);
      } finally {
        setIsProcessing(false);
        isProcessingRef.current = false;
        if (filterBannerTimerRef.current) clearTimeout(filterBannerTimerRef.current);
        filterBannerTimerRef.current = setTimeout(() => {
          setFilterStatus(null);
        }, 3000);
      }
    },
    [stopRecognition]
  );

  // Single reliable recognition runner
  const startRecognition = useCallback(() => {
    if (!isOpenRef.current || isMutedRef.current || isProcessingRef.current || isNeoSpeakingRef.current) {
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    // Clean up previous instance cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = "de-DE";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        activeSessionRef.current = true;
      };

      rec.onresult = (e: any) => {
        if (isMutedRef.current || isProcessingRef.current || isNeoSpeakingRef.current) {
          return;
        }

        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const item = e.results[i];
          const text = item[0]?.transcript || "";
          if (item.isFinal) {
            accumulatedSpeechRef.current += text + " ";
          } else {
            interim += text;
          }
        }

        const currentSpeech = (accumulatedSpeechRef.current + " " + interim).replace(/\s+/g, " ").trim();
        if (!currentSpeech) return;

        setUserTranscript(currentSpeech);
        userSpeakingIntensity.current = Math.max(userSpeakingIntensity.current, 2.5);

        // Real-time evaluation of addressing while speaking
        const liveDecision = checkNeoAddressed(currentSpeech, lastNeoReplyTimeRef.current, filterModeRef.current);
        setLastAddressingResult(liveDecision);

        pendingSpeechRef.current = currentSpeech;

        // Reset silence timer and countdown on every speech token
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }

        // Voice mute check
        if (/\b(mute|off|aus|ausschalten|stumm schalten|stumm|sei leise|pause|stopp)\b/i.test(currentSpeech)) {
          dispatchToNeo(currentSpeech);
          return;
        }

        // 5-SECOND DELAY: Trigger prompt dispatch exactly 5 seconds (5000ms) after the user finishes speaking
        setCountdownRemaining(5);
        let secondsLeft = 5;

        countdownIntervalRef.current = setInterval(() => {
          secondsLeft -= 1;
          if (secondsLeft > 0) {
            setCountdownRemaining(secondsLeft);
          } else {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
          }
        }, 1000);

        silenceTimerRef.current = setTimeout(() => {
          setCountdownRemaining(null);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          const toSend = (accumulatedSpeechRef.current + " " + interim).replace(/\s+/g, " ").trim();
          if (toSend.length >= 2 && !isMutedRef.current && !isProcessingRef.current && !isNeoSpeakingRef.current) {
            dispatchToNeo(toSend);
          }
        }, 5000);
      };

      rec.onerror = (e: any) => {
        console.warn("[NeoSpeak] Speech error:", e.error);
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          activeSessionRef.current = false;
        }
      };

      rec.onend = () => {
        activeSessionRef.current = false;
        if (isOpenRef.current && !isMutedRef.current && !isProcessingRef.current && !isNeoSpeakingRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isOpenRef.current && !isMutedRef.current && !isProcessingRef.current && !isNeoSpeakingRef.current) {
              startRecognition();
            }
          }, 250);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("[NeoSpeak] SpeechRecognition start error:", err);
    }
  }, [dispatchToNeo]);

  // Manually trigger immediate send without waiting for remaining 5-second countdown
  const handleImmediateSend = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownRemaining(null);
    const toSend = (pendingSpeechRef.current || userTranscript).replace(/\s+/g, " ").trim();
    if ((toSend.length >= 2 || attachedMediaRef.current.length > 0) && !isMutedRef.current && !isProcessingRef.current && !isNeoSpeakingRef.current) {
      dispatchToNeo(toSend);
    }
  }, [userTranscript, dispatchToNeo]);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;

      if (next) {
        stopRecognition();
        stopFarFieldAudioEngine();
        if (onStopSpeakingRef.current) onStopSpeakingRef.current();
        setNeoLastResponse("Ausgeschaltet.");
      } else {
        accumulatedSpeechRef.current = "";
        setUserTranscript("");
        startFarFieldAudioEngine();
        startRecognition();
      }
      return next;
    });
  }, [startRecognition, stopRecognition, startFarFieldAudioEngine, stopFarFieldAudioEngine]);

  // Toggle Addressing Mode
  const handleToggleFilterMode = useCallback(() => {
    setFilterMode((prev) => {
      const next = prev === "addressed_only" ? "all" : "addressed_only";
      filterModeRef.current = next;
      return next;
    });
  }, []);

  // Lifecycle control
  useEffect(() => {
    if (isOpen && !isMuted) {
      startFarFieldAudioEngine();
      startRecognition();
    } else {
      stopRecognition();
      stopFarFieldAudioEngine();
    }

    return () => {
      stopRecognition();
      stopFarFieldAudioEngine();
      if (filterBannerTimerRef.current) clearTimeout(filterBannerTimerRef.current);
    };
  }, [isOpen, isMuted, startFarFieldAudioEngine, startRecognition, stopFarFieldAudioEngine, stopRecognition]);

  // Seamless auto-resume when NEO finishes speaking
  const prevSpeakingRef = useRef(isNeoSpeaking);
  useEffect(() => {
    if (prevSpeakingRef.current && !isNeoSpeaking) {
      if (isOpenRef.current && !isMutedRef.current && !isProcessingRef.current) {
        accumulatedSpeechRef.current = "";
        setTimeout(() => {
          startRecognition();
        }, 150);
      }
    }
    if (!prevSpeakingRef.current && isNeoSpeaking) {
      stopRecognition();
    }
    prevSpeakingRef.current = isNeoSpeaking;
  }, [isNeoSpeaking, startRecognition, stopRecognition]);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenRef.current) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Window paste handler for videos and photos (Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;
      const files: File[] = [];
      if (clipboardData.items) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type && (item.type.startsWith("video/") || item.type.startsWith("image/"))) {
            const f = item.getAsFile();
            if (f) files.push(f);
          }
        }
      }
      if (files.length === 0 && clipboardData.files) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const f = clipboardData.files[i];
          if (f.type && (f.type.startsWith("video/") || f.type.startsWith("image/"))) {
            files.push(f);
          }
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleSelectMediaFiles(files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, handleSelectMediaFiles]);

  // =========================================================
  // PRISTINE SOVEREIGN NEURAL CORE (CLEAN & NON-FLICKERING)
  // ==========================================
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    // Responsive Base Dimensions
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Sovereign Color Palettes
    //    // Sovereign Projector-Grade High-Luminosity Neon Colors
    const neoColors: [number, number, number][] = [
      [0, 245, 255],   // Vivid Electric Cyan (#00f5ff)
      [255, 0, 138],   // Hot Neon Magenta (#ff008a)
      [255, 190, 11],  // Radiant Solar Gold (#ffbe0b)
      [0, 255, 170],   // Laser Mint Emerald (#00ffa0)
      [168, 85, 247],  // Royal Ultraviolet (#a855f7)
      [56, 189, 248],  // Sky Azure (#38bdf8)
      [255, 255, 255]  // White Hot Core
    ];

    const isMobile = cssWidth < 768;
    // GROßER PARTIKEL-BALL: Large, impressive spherical radius
    const ballBaseRadius = isMobile ? 150 : 220;

    // Generate Big 3D Particle Ball (Fibonacci Sphere Distribution)
    interface BallParticle {
      nx: number;
      ny: number;
      nz: number;
      layerRadius: number; // Volumetric thickness factor (0.75 - 1.15)
      baseSize: number;
      color: [number, number, number];
      phase: number;
      freq: number;
    }

    const particleCount = isMobile ? 650 : 1050;
    const particles: BallParticle[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const goldenAngle = Math.PI * 2 * (1 - 1 / goldenRatio);

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // -1 to +1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Volumetric distribution: some inner core particles, mostly outer shell
      const rRand = Math.random();
      const layer = rRand < 0.2 ? 0.45 + Math.random() * 0.35 : 0.85 + Math.random() * 0.25;

      particles.push({
        nx: x,
        ny: y,
        nz: z,
        layerRadius: layer,
        baseSize: Math.random() * 1.8 + 1.2,
        color: neoColors[Math.floor(Math.random() * neoColors.length)],
        phase: Math.random() * Math.PI * 2,
        freq: 1.8 + Math.random() * 2.4,
      });
    }

    // Dynamic sonic ripples emitted from the ball
    interface BallRipple {
      r: number;
      maxR: number;
      alpha: number;
      color: [number, number, number];
    }
    const ripples: BallRipple[] = [];
    let lastRippleTime = 0;

    let smoothedIntensity = 0.15;
    let rotY = 0;
    let lastFrameTime = performance.now();
    const startTime = performance.now();

    const animate = (now: number) => {
      try {
        const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
        lastFrameTime = now;
        const t = (now - startTime) / 1000;

        // Check resize safely
        if (cssWidth !== window.innerWidth || cssHeight !== window.innerHeight) {
          resizeCanvas();
        }

        // 1. ALWAYS RESET CANVAS STATE TO SOURCE-OVER & CLEAR TO DARK SPACE
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#04060c";
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        // Calculate speech & activity intensity
        const activeNeo = isNeoSpeakingRef.current;
        const rawSpeakingLevel = speakingLevelRef.current || 0;
        const isProc = isProcessingRef.current;

        let targetIntensity = 0.22;
        if (activeNeo) {
          // Energetic voice modulation
          const cadence = Math.sin(t * 5.0) * 0.22 + Math.sin(t * 3.2) * 0.15;
          targetIntensity = 0.85 + Math.max(0, Math.min(0.35, rawSpeakingLevel * 0.4)) + cadence;
        } else if (isProc) {
          // Pulsing thinking state
          targetIntensity = 0.55 + Math.sin(t * 3.5) * 0.18;
        } else {
          // Alive breathing standby
          targetIntensity = 0.22 + Math.sin(t * 1.8) * 0.08;
        }

        // Smooth intensity interpolation
        smoothedIntensity += (targetIntensity - smoothedIntensity) * Math.min(1, dt * 6.0);

        // Center coordinates of the Particle Ball
        const cx = cssWidth / 2;
        const cy = cssHeight * 0.42;

        // 3D Rotation angles
        const rotSpeed = 0.35 + smoothedIntensity * 0.65;
        rotY += rotSpeed * dt;
        const rotX = Math.sin(t * 0.45) * 0.14;

        const cosRY = Math.cos(rotY);
        const sinRY = Math.sin(rotY);
        const cosRX = Math.cos(rotX);
        const sinRX = Math.sin(rotX);

        // Dynamic radius: expands dynamically with voice
        const currentBallRadius = ballBaseRadius * (1 + smoothedIntensity * 0.28);
        const fov = currentBallRadius * 3.2;

        // 2. SOFT AMBIENT CORE GLOW (BEHIND PARTICLES)
        const glowGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, currentBallRadius * 1.15);
        glowGrad.addColorStop(0, `rgba(0, 245, 255, ${0.18 + smoothedIntensity * 0.18})`);
        glowGrad.addColorStop(0.4, `rgba(255, 0, 138, ${0.10 + smoothedIntensity * 0.12})`);
        glowGrad.addColorStop(0.75, `rgba(168, 85, 247, ${0.05 + smoothedIntensity * 0.06})`);
        glowGrad.addColorStop(1, "rgba(4, 6, 12, 0)");

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, currentBallRadius * 1.15, 0, Math.PI * 2);
        ctx.fill();

        // 3. PERIODIC SONIC RIPPLES (When speaking or pulsing)
        const rippleInterval = activeNeo ? 350 : 1200;
        if (now - lastRippleTime > rippleInterval) {
          const ripColors: [number, number, number][] = [
            [0, 245, 255],
            [255, 0, 138],
            [255, 190, 11],
            [0, 255, 170]
          ];
          const cIdx = Math.floor(t * 1.2) % ripColors.length;
          ripples.push({
            r: currentBallRadius * 0.85,
            maxR: currentBallRadius * (activeNeo ? 2.3 : 1.7),
            alpha: 0.45 + smoothedIntensity * 0.35,
            color: ripColors[cIdx],
          });
          lastRippleTime = now;
        }

        // Draw Expanding Sonic Rings
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rip = ripples[i];
          rip.r += currentBallRadius * 0.7 * dt;
          const progress = rip.r / rip.maxR;
          const currentAlpha = rip.alpha * Math.max(0, 1 - progress);

          if (progress >= 1 || currentAlpha <= 0.01) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = `rgba(${rip.color[0]}, ${rip.color[1]}, ${rip.color[2]}, ${currentAlpha})`;
          ctx.lineWidth = 2.0 * (1 - progress * 0.5);
          ctx.beginPath();
          ctx.arc(cx, cy, rip.r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 4. DRAW 3D PARTICLES OF THE BALL
        // Project all particles to 2D
        interface ProjectedP {
          px: number;
          py: number;
          z: number;
          size: number;
          alpha: number;
          color: [number, number, number];
        }
        const projected: ProjectedP[] = [];

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // 3D Voice Harmonic Wave Displacement
          // Organic sine/cosine wave undulations across sphere surface
          const wave =
            Math.sin(p.ny * 5.0 + t * 6.0) *
            Math.cos(p.nx * 4.0 - t * 4.5) *
            (smoothedIntensity * 38);

          // Subtle breathing in standby
          const breath = Math.sin(t * p.freq + p.phase) * (3.0 + smoothedIntensity * 8.0);

          const r = currentBallRadius * p.layerRadius + wave + breath;

          let x = p.nx * r;
          let y = p.ny * r;
          let z = p.nz * r;

          // Apply Rotation Y & X
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

          // Depth feeling: front particles (z > 0) are brighter and larger
          const depth = Math.max(0.12, Math.min(1.0, (z + currentBallRadius) / (2 * currentBallRadius)));
          const twinkle = 0.75 + Math.sin(t * p.freq + p.phase) * 0.25;
          const alpha = depth * twinkle * (0.35 + smoothedIntensity * 0.65);
          const pSize = Math.max(0.8, p.baseSize * scale * (1.0 + smoothedIntensity * 0.45));

          projected.push({
            px,
            py,
            z,
            size: pSize,
            alpha,
            color: p.color,
          });
        }

        // Sort by Z for realistic depth layering (draw back to front)
        projected.sort((a, b) => a.z - b.z);

        // Render all particles cleanly with bright neon colors
        for (let i = 0; i < projected.length; i++) {
          const pt = projected[i];
          ctx.fillStyle = `rgba(${pt.color[0]}, ${pt.color[1]}, ${pt.color[2]}, ${pt.alpha})`;
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);
          ctx.fill();

          // Extra bright specular glow on closest front particles
          if (pt.z > currentBallRadius * 0.35 && pt.alpha > 0.6) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, pt.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } catch (err) {
        console.error("Animation loop error:", err);
      } finally {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#05080d] select-none overflow-hidden font-['Segoe_UI',_Arial,_sans-serif]"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleSelectMediaFiles(e.dataTransfer.files);
        }
      }}
    >
      {/* Drag & Drop Visual HUD Overlay for Videos and Photos */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-[#05080d]/90 backdrop-blur-md border-4 border-dashed border-cyan-400/80 flex flex-col items-center justify-center pointer-events-none animate-pulse">
          <Film className="w-16 h-16 text-cyan-400 mb-4 animate-bounce" />
          <h3 className="text-xl sm:text-2xl font-mono font-black text-cyan-300 uppercase tracking-widest">
            VIDEO ODER FOTO HIER ABLEGEN
          </h3>
          <p className="text-sm font-mono text-purple-200 mt-2">
            N.E.O. analysiert dein Video (MP4, WebM, MOV bis 80MB) oder Foto direkt live
          </p>
        </div>
      )}

      {/* Hidden File Input for Video & Photo Upload in Speak Mode */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*,image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleSelectMediaFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {/* 1. Visual Canvas with 3D Quantum Assembly Particle Orbs & Voice Reactivity */}
      <canvas ref={canvasRef} className="block absolute inset-0 w-full h-full cursor-default" />

      {/* 2. Topbar: Holographic Console Controls & Tuning */}
      <div className="fixed top-0 left-0 w-full h-[56px] flex items-center justify-between px-4 sm:px-8 z-10 pointer-events-none bg-gradient-to-b from-[#05080d]/95 via-[#05080d]/80 to-transparent">
        <div className="text-[#e5e5e5] text-[14px] sm:text-[15px] tracking-[1.5px] font-medium pointer-events-auto flex items-center gap-2 sm:gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="font-mono font-bold text-white tracking-widest">N.E.O.</span>
          <span className="text-[#8b5cf6] font-bold hidden sm:inline">SPRACHVERBINDUNG</span>
          {/* Far-Field AGC Active Badge */}
          <span className="text-[10px] tracking-normal px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono hidden md:flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            FERNFELD-AGC AKTIV (3.2x GAIN)
          </span>
        </div>

        <div className="flex h-full items-center pointer-events-auto gap-2">
          {/* Video & Photo Upload in Speak Mode Button */}
          <button
            id="neoSpeakUploadBtn"
            onClick={() => fileInputRef.current?.click()}
            title="Video (MP4/WebM/MOV bis 80MB) oder Fotos für N.E.O. anhängen"
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer relative ${
              attachedMedia.length > 0
                ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50 hover:text-white"
            }`}
          >
            {attachedMedia.some(isVideoUrl) ? (
              <Film className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span className="font-bold">
              {attachedMedia.length > 0
                ? `${attachedMedia.length} MEDI${attachedMedia.length === 1 ? "UM" : "EN"}`
                : "VIDEO / FOTO"}
            </span>
            {attachedMedia.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Google Maps Route Planner Toggle */}
          <button
            onClick={() => setShowRoutePlanner((prev) => !prev)}
            title="Google Maps Routenplaner einblenden / ausblenden"
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              showRoutePlanner
                ? "bg-purple-800/80 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] ring-1 ring-purple-400"
                : "bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50 hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-bold">GOOGLE MAPS</span>
          </button>

          {/* Addressing Filter Mode Toggle */}
          <button
            onClick={handleToggleFilterMode}
            title="Umschalten: Nur antworten wenn N.E.O. gemeint ist vs. Auf alles antworten"
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              filterMode === "addressed_only"
                ? "bg-purple-950/70 border-purple-500/60 text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.3)]"
                : "bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.3)]"
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">
              {filterMode === "addressed_only" ? "FILTER: NUR WENN GEMEINT ('NEO')" : "FILTER: ALLE AUSSAGEN"}
            </span>
          </button>

          {/* Mute Button */}
          <button
            id="muteBtn"
            onClick={handleToggleMute}
            title={isMuted ? "Einschalten (oder sage 'Ein' / 'On')" : "Ausschalten (oder sage 'Off' / 'Aus')"}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isMuted
                ? "bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? "OFF" : "AKTIV"}</span>
          </button>

          {/* Close Button */}
          <button
            id="closeBtn"
            onClick={onClose}
            title="Schließen (ESC)"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer transition-all hover:bg-red-600 hover:text-white hover:border-red-500"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2]">
              <path d="M4 4l16 16M20 4L4 20" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3. Orb Holographic Identifiers (Centered Dominant NEO Core + Minimal User Satellite) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        {/* NEO Dominant Centerpiece Indicator */}
        <div className="flex flex-col items-center gap-2.5 transition-all mt-[230px] sm:mt-[290px]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f5ff] animate-pulse" />
            <span className="text-xl sm:text-3xl font-black tracking-[5px] text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-300 font-mono uppercase drop-shadow-[0_0_24px_rgba(0,245,255,0.6)]">
              N.E.O. CORE MATRIX
            </span>
            <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,245,255,0.5)]">
              AI SINGULARITY
            </span>
          </div>
          <div className="text-xs sm:text-sm font-mono text-cyan-200 bg-black/80 px-5 py-2 rounded-full border border-cyan-500/50 shadow-[0_0_20px_rgba(0,245,255,0.35)] backdrop-blur-md transition-all">
            {isNeoSpeaking ? (
              <span className="text-pink-400 font-black flex items-center gap-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                <span className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_#f43f5e] animate-ping" />
                N.E.O. SPRICHT LIVE // QUANTUM AUDIO STREAM
              </span>
            ) : isProcessing ? (
              <span className="text-cyan-300 font-black flex items-center gap-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-spin" />
                SYNTHETISIERT ANTWORT // QUANTUM NEURAL MATRIX...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-emerald-300 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                STANDBY ONLINE // AKTIVER REAKTOR • SPRECHE FREI MIT N.E.O.
              </span>
            )}
          </div>
        </div>

        {/* Minimal User Satellite Indicator (Bottom Right Corner) */}
        <div className="absolute bottom-28 sm:bottom-32 right-4 sm:right-12 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-amber-500/30 backdrop-blur-sm text-[10px] font-mono text-amber-300/80 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <span className={`w-1.5 h-1.5 rounded-full ${isMuted ? "bg-zinc-600" : "bg-amber-400"}`} />
          <span className="font-bold tracking-wider">MIC IN: PHILIPP</span>
          <span className="text-[9px] text-zinc-400">({isMuted ? "OFF" : "AKTIV"})</span>
        </div>
      </div>

      {/* 4. Embedded Google Maps & Routenplaner HUD */}
      {showRoutePlanner && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
          <NeoGoogleMapsRoutePlanner
            isOpen={showRoutePlanner}
            onClose={() => setShowRoutePlanner(false)}
            origin={routeOrigin}
            destination={routeDest}
            travelMode={travelMode}
            onChangeOrigin={setRouteOrigin}
            onChangeDestination={setRouteDest}
            onChangeTravelMode={setTravelMode}
            onCalculateRoute={(orig, dest, mode) => {
              setRouteOrigin(orig);
              setRouteDest(dest);
              setTravelMode(mode);
            }}
          />
        </div>
      )}

      {/* 5. Live Subtitles & Dynamic Addressing Filter HUD */}
      <div className="fixed bottom-0 left-0 w-full p-4 sm:p-6 z-20 flex flex-col items-center gap-3 bg-gradient-to-t from-[#05080d] via-[#05080d]/90 to-transparent pointer-events-none">
        {/* Status indicator badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs pointer-events-auto max-w-xl text-center">
          {isMuted ? (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-300 font-mono font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <VolumeX className="w-4 h-4 text-amber-400" />
              OFF (Sage &quot;Ein&quot; / &quot;On&quot; oder drücke den Button)
            </span>
          ) : isProcessing ? (
            <span className="px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-200 font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
              N.E.O. SYNTHETISIERT ANTWORT...
            </span>
          ) : isNeoSpeaking ? (
            <span className="px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-200 font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
              N.E.O. SPRICHT LIVE...
            </span>
          ) : countdownRemaining !== null && countdownRemaining > 0 ? (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-200 font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              <span>PROMPT-TIMEOUT: ABSENDEN IN {countdownRemaining}s... (SPRICHT WEITER ZUM VERLÄNGERN)</span>
            </span>
          ) : filterStatus ? (
            <span
              className={`px-3.5 py-1.5 rounded-full border font-mono font-bold flex items-center gap-2 transition-all ${
                filterStatus.includes("ADRESSIERT")
                  ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "bg-slate-900/90 border-amber-500/40 text-amber-200/90 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {filterStatus}
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/50 text-purple-200 font-mono font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>FERNFELD AKTIV • SAGE &quot;NEO&quot; ODER STELLE EINE FRAGE</span>
            </span>
          )}
        </div>

        {/* Media Warning Notice (e.g. file size > 80MB) */}
        {mediaWarning && (
          <div className="px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-500/80 text-amber-300 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.5)] pointer-events-auto flex items-center gap-2 animate-bounce">
            <Film className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{mediaWarning}</span>
          </div>
        )}

        {/* Attached Videos & Photos Dock (HUD) */}
        {attachedMedia.length > 0 && (
          <div className="w-full max-w-2xl p-3 sm:p-4 rounded-2xl bg-[#070d18]/95 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-xl pointer-events-auto flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
                {attachedMedia.some(isVideoUrl) ? (
                  <Film className="w-4 h-4 text-amber-400" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                )}
                <span>
                  {(() => {
                    const vCount = attachedMedia.filter(isVideoUrl).length;
                    const iCount = attachedMedia.length - vCount;
                    if (vCount > 0 && iCount > 0) return `${vCount} Video(s) & ${iCount} Foto(s) für N.E.O. bereit`;
                    if (vCount > 0) return `${vCount === 1 ? '1 Video-Clip' : vCount + ' Video-Clips'} für N.E.O. bereit (max 80MB)`;
                    return `${attachedMedia.length === 1 ? '1 Foto' : attachedMedia.length + ' Fotos'} für N.E.O. bereit`;
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/20 text-slate-300 text-[10px] font-mono transition cursor-pointer"
                  title="Weitere Videos oder Fotos hinzufügen"
                >
                  + MEHR
                </button>
                <button
                  onClick={handleClearAllMedia}
                  className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-[10px] font-mono transition cursor-pointer"
                  title="Alle Anhänge entfernen"
                >
                  LÖSCHEN
                </button>
              </div>
            </div>

            {/* Media thumbnail horizontal list */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar max-h-24">
              {attachedMedia.map((url, idx) => {
                const isVid = isVideoUrl(url);
                return (
                  <div
                    key={idx}
                    className="relative group shrink-0 rounded-xl overflow-hidden border border-cyan-400/50 w-16 h-16 bg-black/80 flex items-center justify-center shadow"
                  >
                    {isVid ? (
                      <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                        <video src={url} className="w-full h-full object-cover opacity-80" muted playsInline />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="p-1 rounded-full bg-black/75 text-amber-400 shadow">
                            <Play className="w-3 h-3 fill-amber-400" />
                          </span>
                        </div>
                        <span className="absolute top-0.5 left-0.5 px-1 rounded bg-amber-500 text-[8px] font-mono text-black font-black uppercase shadow">
                          VIDEO
                        </span>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-0.5 left-0.5 px-1 rounded bg-cyan-500 text-[8px] font-mono text-black font-black uppercase shadow">
                          FOTO
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/85 hover:bg-red-600 text-white flex items-center justify-center text-[9px] transition cursor-pointer shadow z-10"
                      title="Entfernen"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Direct Send Media Trigger */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-cyan-500/20">
              <span className="text-[11px] font-mono text-slate-400">
                Sprich deine Frage dazu frei ODER:
              </span>
              <button
                onClick={handleImmediateSend}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.5)] disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{attachedMedia.some(isVideoUrl) ? "⚡ VIDEO JETZT ANALYSIEREN" : "⚡ FOTO JETZT ANALYSIEREN"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Subtitle Displays */}
        <div className="w-full max-w-2xl flex flex-col gap-2 pointer-events-auto">
          {/* User Heard Line */}
          {userTranscript && (
            <div className="p-3.5 rounded-xl bg-[#05080d]/85 border border-amber-500/40 text-amber-200 text-sm font-mono backdrop-blur-md flex items-start gap-2.5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="text-amber-400 font-bold shrink-0">DU:</span>
              <div className="flex-1 flex flex-col gap-1">
                <span className="break-words">{userTranscript}</span>
                {lastAddressingResult && (
                  <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                    {lastAddressingResult.isAddressed ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ADRESSIERT: {lastAddressingResult.reason}
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-amber-400" />
                        GEFILTERT: {lastAddressingResult.reason}
                      </span>
                    )}
                  </div>
                )}

                {/* 5-Second Dispatch Countdown & Quick-Send Bar */}
                {countdownRemaining !== null && countdownRemaining > 0 && (
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-amber-500/20">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>
                        Prompt wird in{" "}
                        <strong className="text-white text-sm px-1.5 py-0.5 bg-amber-950/90 border border-amber-500/50 rounded font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                          {countdownRemaining}s
                        </strong>{" "}
                        abgesendet
                      </span>
                    </div>
                    <button
                      onClick={handleImmediateSend}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-white"
                      title="Nicht warten – Prompt sofort absenden"
                    >
                      <span>Sofort absenden</span>
                      <span>➔</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NEO Spoken Line */}
          {neoLastResponse && (
            <div className="p-3.5 rounded-xl bg-[#05080d]/85 border border-purple-500/40 text-purple-200 text-sm font-sans backdrop-blur-md flex items-start gap-2.5 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
              <span className="text-purple-400 font-bold font-mono shrink-0">NEO:</span>
              <span className="break-words">{neoLastResponse}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
