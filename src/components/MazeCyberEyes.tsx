import React, { useState, useEffect, useRef } from "react";
import { Eye, Sparkles, Scan, Zap, Activity } from "lucide-react";

export type EyeMode = "cyber-pupils" | "visor-scan" | "focus-crosshair" | "matrix-eye";

interface MazeCyberEyesProps {
  agentColor?: string;
  isSpeaking?: boolean;
  isThinking?: boolean;
  isListening?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  interactiveMouse?: boolean;
  mode?: EyeMode;
  onModeChange?: (newMode: EyeMode) => void;
}

export const MazeCyberEyes: React.FC<MazeCyberEyesProps> = ({
  agentColor = "#00f0ff",
  isSpeaking = false,
  isThinking = false,
  isListening = false,
  size = "lg",
  className = "",
  interactiveMouse = true,
  mode: initialMode = "cyber-pupils",
  onModeChange,
}) => {
  const [mode, setMode] = useState<EyeMode>(initialMode);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync mode prop if passed
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // Handle Mouse movement for Eye Tracking
  useEffect(() => {
    if (!interactiveMouse) return;

    let lastMouseMoveTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveTime = Date.now();

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      // Max pupil offset range in pixels based on eye size
      const maxRange = size === "xl" ? 18 : size === "lg" ? 12 : size === "md" ? 8 : 5;

      if (distance < 1) {
        targetOffsetRef.current = { x: 0, y: 0 };
        return;
      }

      // Angle to mouse position
      const angle = Math.atan2(deltaY, deltaX);
      // Scale displacement proportionally with max limit
      const clampedDist = Math.min(distance / 15, maxRange);

      const dx = Math.cos(angle) * clampedDist;
      const dy = Math.sin(angle) * clampedDist;

      targetOffsetRef.current = { x: dx, y: dy };
    };

    // Idle organic movement when mouse is stationary
    const idleInterval = setInterval(() => {
      if (Date.now() - lastMouseMoveTime > 2500) {
        const randomAngle = Math.random() * Math.PI * 2;
        const randomDist = Math.random() * 4;
        targetOffsetRef.current = {
          x: Math.cos(randomAngle) * randomDist,
          y: Math.sin(randomAngle) * randomDist,
        };
      }
    }, 2000);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(idleInterval);
    };
  }, [interactiveMouse, size]);

  // Smooth Interpolation Loop for Pupil Position
  useEffect(() => {
    const animate = () => {
      setPupilOffset((prev) => {
        const target = targetOffsetRef.current;
        const lerpFactor = 0.12;
        const nextX = prev.x + (target.x - prev.x) * lerpFactor;
        const nextY = prev.y + (target.y - prev.y) * lerpFactor;
        return { x: nextX, y: nextY };
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Natural Blinking Timer
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
      const nextBlink = 2500 + Math.random() * 3000;
      blinkTimeout = setTimeout(triggerBlink, nextBlink);
    };

    let blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  const handleEyeClick = () => {
    // Make MAZE wink or cycle modes when clicked!
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 350);

    const modes: EyeMode[] = ["cyber-pupils", "visor-scan", "focus-crosshair", "matrix-eye"];
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(nextMode);
    if (onModeChange) onModeChange(nextMode);
  };

  // Dimension scaling based on size prop
  const dimensions =
    size === "sm"
      ? { width: 80, height: 32, eyeR: 10, pupilR: 4 }
      : size === "md"
      ? { width: 140, height: 50, eyeR: 16, pupilR: 7 }
      : size === "xl"
      ? { width: 280, height: 90, eyeR: 32, pupilR: 13 }
      : { width: 200, height: 64, eyeR: 22, pupilR: 9 };

  const activeColor = isSpeaking
    ? "#ffb238" // Amber speaking
    : isThinking
    ? "#a855f7" // Purple thinking
    : agentColor; // Default Cyber Cyan

  return (
    <div
      ref={containerRef}
      onClick={handleEyeClick}
      title="SYNTAX CYBER EYES (Klicken zum Umschalten/Zwinkern)"
      className={`relative inline-flex flex-col items-center justify-center cursor-pointer select-none group transition-all duration-300 ${className}`}
    >
      {/* Outer Ambient Eye Glow */}
      <div
        style={{
          backgroundColor: activeColor,
          boxShadow: `0 0 30px ${activeColor}80`,
        }}
        className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
      />

      {/* SVG HOLOGRAPHIC EYE SYSTEM */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="relative z-10 drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]"
      >
        <defs>
          {/* Radial Gradient for Iris Glow */}
          <radialGradient id="mazeIrisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={activeColor} stopOpacity="0.8" />
            <stop offset="85%" stopColor={activeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Linear Gradient for Eyelid / Cyber Visor */}
          <linearGradient id="mazeVisorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={activeColor} stopOpacity="0.1" />
            <stop offset="50%" stopColor={activeColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* EYE MODE 1: DUAL CYBER PUPILS */}
        {mode === "cyber-pupils" && (
          <g>
            {/* LEFT EYE CONTAINER */}
            <g transform={`translate(${dimensions.width * 0.3}, ${dimensions.height * 0.5})`}>
              {/* Outer Eye Socket Frame */}
              <ellipse
                cx="0"
                cy="0"
                rx={dimensions.eyeR * 1.3}
                ry={dimensions.eyeR * 0.85}
                fill="#030712"
                stroke={activeColor}
                strokeWidth="1.8"
                strokeOpacity="0.7"
              />

              {/* Rotating Aperture Tech Ring */}
              <circle
                cx="0"
                cy="0"
                r={dimensions.eyeR * 1.1}
                fill="none"
                stroke={activeColor}
                strokeWidth="1"
                strokeDasharray="4, 3"
                strokeOpacity="0.5"
                className={isThinking || isSpeaking ? "animate-spin" : ""}
                style={{ animationDuration: "6s" }}
              />

              {/* Glowing Iris & Pupil (Tracked offset) */}
              <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                <circle cx="0" cy="0" r={dimensions.eyeR * 0.75} fill="url(#mazeIrisGrad)" />
                <circle cx="0" cy="0" r={dimensions.pupilR} fill="#ffffff" />
                {/* Glint Highlight */}
                <circle
                  cx={-dimensions.pupilR * 0.35}
                  cy={-dimensions.pupilR * 0.35}
                  r={dimensions.pupilR * 0.3}
                  fill="#ffffff"
                />
              </g>

              {/* Eyelid Blink Cover */}
              <ellipse
                cx="0"
                cy="0"
                rx={dimensions.eyeR * 1.35}
                ry={isBlinking ? dimensions.eyeR * 0.9 : 0}
                fill="#050a14"
                stroke={activeColor}
                strokeWidth="1"
                className="transition-all duration-100 ease-in-out"
              />
            </g>

            {/* RIGHT EYE CONTAINER */}
            <g transform={`translate(${dimensions.width * 0.7}, ${dimensions.height * 0.5})`}>
              {/* Outer Eye Socket Frame */}
              <ellipse
                cx="0"
                cy="0"
                rx={dimensions.eyeR * 1.3}
                ry={dimensions.eyeR * 0.85}
                fill="#030712"
                stroke={activeColor}
                strokeWidth="1.8"
                strokeOpacity="0.7"
              />

              {/* Rotating Aperture Tech Ring */}
              <circle
                cx="0"
                cy="0"
                r={dimensions.eyeR * 1.1}
                fill="none"
                stroke={activeColor}
                strokeWidth="1"
                strokeDasharray="4, 3"
                strokeOpacity="0.5"
                className={isThinking || isSpeaking ? "animate-spin" : ""}
                style={{ animationDuration: "6s", animationDirection: "reverse" }}
              />

              {/* Glowing Iris & Pupil (Tracked offset) */}
              <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                <circle cx="0" cy="0" r={dimensions.eyeR * 0.75} fill="url(#mazeIrisGrad)" />
                <circle cx="0" cy="0" r={dimensions.pupilR} fill="#ffffff" />
                {/* Glint Highlight */}
                <circle
                  cx={-dimensions.pupilR * 0.35}
                  cy={-dimensions.pupilR * 0.35}
                  r={dimensions.pupilR * 0.3}
                  fill="#ffffff"
                />
              </g>

              {/* Eyelid Blink Cover (or Wink) */}
              <ellipse
                cx="0"
                cy="0"
                rx={dimensions.eyeR * 1.35}
                ry={isBlinking || isWinking ? dimensions.eyeR * 0.9 : 0}
                fill="#050a14"
                stroke={activeColor}
                strokeWidth="1"
                className="transition-all duration-100 ease-in-out"
              />
            </g>

            {/* Connecting Sci-Fi Bridge Line between eyes */}
            <line
              x1={dimensions.width * 0.3 + dimensions.eyeR * 1.3}
              y1={dimensions.height * 0.5}
              x2={dimensions.width * 0.7 - dimensions.eyeR * 1.3}
              y2={dimensions.height * 0.5}
              stroke={activeColor}
              strokeWidth="1.5"
              strokeDasharray="2, 2"
              strokeOpacity="0.6"
            />
          </g>
        )}

        {/* EYE MODE 2: VISOR SCAN */}
        {mode === "visor-scan" && (
          <g>
            {/* Wide Visor Outline */}
            <path
              d={`M 10,${dimensions.height * 0.5} Q ${dimensions.width * 0.5},10 ${dimensions.width - 10},${dimensions.height * 0.5} Q ${dimensions.width * 0.5},${dimensions.height - 10} 10,${dimensions.height * 0.5} Z`}
              fill="#030712"
              stroke={activeColor}
              strokeWidth="2"
            />
            {/* Scanning Beam */}
            <line
              x1={dimensions.width * 0.2 + pupilOffset.x * 2}
              y1={dimensions.height * 0.2}
              x2={dimensions.width * 0.2 + pupilOffset.x * 2}
              y2={dimensions.height * 0.8}
              stroke={activeColor}
              strokeWidth="3"
              className="animate-pulse"
            />
            <circle
              cx={dimensions.width * 0.5 + pupilOffset.x * 3}
              cy={dimensions.height * 0.5 + pupilOffset.y * 2}
              r={dimensions.eyeR * 0.8}
              fill="url(#mazeIrisGrad)"
            />
          </g>
        )}

        {/* EYE MODE 3: FOCUS CROSSHAIR */}
        {mode === "focus-crosshair" && (
          <g transform={`translate(${dimensions.width * 0.5 + pupilOffset.x}, ${dimensions.height * 0.5 + pupilOffset.y})`}>
            <circle cx="0" cy="0" r={dimensions.eyeR * 1.2} fill="none" stroke={activeColor} strokeWidth="1.5" strokeDasharray="6, 4" />
            <circle cx="0" cy="0" r={dimensions.eyeR * 0.6} fill="url(#mazeIrisGrad)" />
            <line x1={-dimensions.eyeR * 1.6} y1="0" x2={dimensions.eyeR * 1.6} y2="0" stroke={activeColor} strokeWidth="1" />
            <line x1="0" y1={-dimensions.eyeR * 1.6} x2="0" y2={dimensions.eyeR * 1.6} stroke={activeColor} strokeWidth="1" />
          </g>
        )}

        {/* EYE MODE 4: MATRIX EYE */}
        {mode === "matrix-eye" && (
          <g transform={`translate(${dimensions.width * 0.5}, ${dimensions.height * 0.5})`}>
            <circle cx="0" cy="0" r={dimensions.eyeR * 1.4} fill="#000000" stroke={activeColor} strokeWidth="2" />
            <circle cx="0" cy="0" r={dimensions.eyeR * 0.8} fill={activeColor} className="animate-ping opacity-40" />
            <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
              <circle cx="0" cy="0" r={dimensions.pupilR * 1.5} fill="#ffffff" />
            </g>
          </g>
        )}
      </svg>

      {/* HUD Label Badge (Optional) */}
      <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-white/10 text-[9px] font-mono tracking-wider text-slate-300 uppercase opacity-80 group-hover:opacity-100 transition-opacity">
        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeColor }} />
        <span style={{ color: activeColor }} className="font-bold">
          SYNTAX EYES
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">{mode.replace("-", " ")}</span>
      </div>
    </div>
  );
};
