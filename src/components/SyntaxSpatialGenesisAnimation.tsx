import React, { useEffect, useRef, useState } from "react";
import { Zap, ArrowRight, Cpu, Radio, Shield, Sparkles, CheckCircle2, Bot, Wrench, Flame, Target, Activity, Clock, Layers, CheckSquare, Terminal, Eye } from "lucide-react";

interface SyntaxSpatialGenesisAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

interface EmergenceEntity {
  id: string;
  name: string;
  short: string;
  role: string;
  type: "AGENT" | "TOOL";
  color: string;
  glowColor: string;
  orbitRadiusMult: number;
  baseAngle: number;
  spawnTimeNormalized: number; // 0.0 to 1.0
  size: number;
  particleCount: number;
}

// 1. First the 8 Main Sovereign Agents, then the New Core Feature Engines & Tools
const EMERGENCE_SEQUENCE: EmergenceEntity[] = [
  // --- DIE 8 SOVEREIGN AGENTEN (Schritt 1 bis 8) ---
  {
    id: "syntax",
    name: "S.Y.N.T.A.X.",
    short: "SYNTAX",
    role: "Sovereign Core // Master Orchestrator AI",
    type: "AGENT",
    color: "#4ee8ff", // Cyan
    glowColor: "rgba(78, 232, 255, 0.9)",
    orbitRadiusMult: 1.15,
    baseAngle: -Math.PI * 0.5,
    spawnTimeNormalized: 0.05,
    size: 9.0,
    particleCount: 16,
  },
  {
    id: "neo",
    name: "N.E.O.",
    short: "NEO",
    role: "Matrix Boss Core // Digital Screen Perception",
    type: "AGENT",
    color: "#ff2a8d", // Neon Pink
    glowColor: "rgba(255, 42, 141, 0.9)",
    orbitRadiusMult: 1.0,
    baseAngle: -Math.PI * 0.25,
    spawnTimeNormalized: 0.11,
    size: 8.5,
    particleCount: 14,
  },
  {
    id: "vega",
    name: "V.E.G.A.",
    short: "VEGA",
    role: "Tactical Co-Processor // Code & Data Matrix",
    type: "AGENT",
    color: "#ef4444", // Crimson Red
    glowColor: "rgba(239, 68, 68, 0.9)",
    orbitRadiusMult: 1.25,
    baseAngle: 0.0,
    spawnTimeNormalized: 0.17,
    size: 8.5,
    particleCount: 14,
  },
  {
    id: "odin",
    name: "O.D.I.N.",
    short: "ODIN",
    role: "Strategic Decision Matrix // Zero-Trust Defense",
    type: "AGENT",
    color: "#e2f1ff", // Ice White / Electric Silver
    glowColor: "rgba(226, 241, 255, 0.9)",
    orbitRadiusMult: 0.88,
    baseAngle: Math.PI * 0.25,
    spawnTimeNormalized: 0.23,
    size: 8.0,
    particleCount: 14,
  },
  {
    id: "pulse",
    name: "P.U.L.S.E.",
    short: "PULSE",
    role: "Viral & Social Engagement // Content Engine",
    type: "AGENT",
    color: "#a855f7", // Vivid Purple
    glowColor: "rgba(168, 85, 247, 0.9)",
    orbitRadiusMult: 1.35,
    baseAngle: Math.PI * 0.5,
    spawnTimeNormalized: 0.29,
    size: 8.5,
    particleCount: 14,
  },
  {
    id: "chronos",
    name: "C.H.R.O.N.O.S.",
    short: "CHRONOS",
    role: "Temporal Matrix // 24/7 Time & Productivity",
    type: "AGENT",
    color: "#eab308", // Electric Gold
    glowColor: "rgba(234, 179, 8, 0.9)",
    orbitRadiusMult: 1.1,
    baseAngle: Math.PI * 0.75,
    spawnTimeNormalized: 0.35,
    size: 8.0,
    particleCount: 14,
  },
  {
    id: "oracle",
    name: "O.R.A.C.L.E.",
    short: "ORACLE",
    role: "Financial & Chart Lattice // Market Intelligence",
    type: "AGENT",
    color: "#22c55e", // Emerald Green
    glowColor: "rgba(34, 197, 94, 0.9)",
    orbitRadiusMult: 1.45,
    baseAngle: Math.PI * 1.0,
    spawnTimeNormalized: 0.41,
    size: 8.5,
    particleCount: 14,
  },
  {
    id: "globe",
    name: "G.L.O.B.E.",
    short: "GLOBE",
    role: "Quad-Core Deep Search // Live Web Matrix",
    type: "AGENT",
    color: "#3b82f6", // Royal Blue
    glowColor: "rgba(59, 130, 246, 0.9)",
    orbitRadiusMult: 0.95,
    baseAngle: Math.PI * 1.25,
    spawnTimeNormalized: 0.47,
    size: 8.0,
    particleCount: 14,
  },

  // --- DIE NEUEN FEATURE-ENGINES & TOOLS (Schritt 9 bis 14) ---
  {
    id: "daily_objectives",
    name: "Daily Objectives Engine",
    short: "OBJECTIVES",
    role: "Tagesziele, Streaks, XP-Fortschritt & Quoten-Boni",
    type: "TOOL",
    color: "#f59e0b", // Amber / Gold
    glowColor: "rgba(245, 158, 11, 0.9)",
    orbitRadiusMult: 1.5,
    baseAngle: -Math.PI * 0.38,
    spawnTimeNormalized: 0.54,
    size: 7.5,
    particleCount: 12,
  },
  {
    id: "telemetry",
    name: "Token Telemetrie & Request Matrix",
    short: "TOKENS",
    role: "Echtzeit Token-Zähler, Anfragen-Historie & 24h Reset",
    type: "TOOL",
    color: "#06b6d4", // Cyan
    glowColor: "rgba(6, 182, 212, 0.9)",
    orbitRadiusMult: 1.32,
    baseAngle: -Math.PI * 0.12,
    spawnTimeNormalized: 0.62,
    size: 7.5,
    particleCount: 12,
  },
  {
    id: "claude",
    name: "Claude Code CLI",
    short: "CLAUDE",
    role: "Full-Stack Dev, Node.js & Terminal Pipeline",
    type: "TOOL",
    color: "#d946ef", // Fuchsia
    glowColor: "rgba(217, 70, 239, 0.9)",
    orbitRadiusMult: 1.6,
    baseAngle: Math.PI * 0.15,
    spawnTimeNormalized: 0.70,
    size: 7.5,
    particleCount: 10,
  },
  {
    id: "veo",
    name: "Veo 3.1 & Nano Banana",
    short: "VEO / IMAGEN",
    role: "Cinematische 8K-Video & Imagen 3.0 Foto-Creation",
    type: "TOOL",
    color: "#f97316", // Neon Orange
    glowColor: "rgba(249, 115, 22, 0.9)",
    orbitRadiusMult: 0.78,
    baseAngle: Math.PI * 0.38,
    spawnTimeNormalized: 0.78,
    size: 7.0,
    particleCount: 10,
  },
  {
    id: "gmail",
    name: "Gmail & Workspace",
    short: "GMAIL",
    role: "Autonome E-Mail Inbox & Dispatch Pipeline",
    type: "TOOL",
    color: "#ea4335", // Google Red
    glowColor: "rgba(234, 67, 53, 0.9)",
    orbitRadiusMult: 1.4,
    baseAngle: Math.PI * 0.62,
    spawnTimeNormalized: 0.86,
    size: 7.0,
    particleCount: 10,
  },
  {
    id: "memory",
    name: "Deep Memory RAG",
    short: "MEMORY",
    role: "Vektor-Langzeitgedächtnis & Knowledge Base",
    type: "TOOL",
    color: "#10b981", // Emerald
    glowColor: "rgba(16, 185, 129, 0.9)",
    orbitRadiusMult: 0.82,
    baseAngle: Math.PI * 1.15,
    spawnTimeNormalized: 0.93,
    size: 7.0,
    particleCount: 10,
  },
];

interface SphereDot3D {
  x: number;
  y: number;
  z: number;
  lat: number;
  lon: number;
  size: number;
}

export const SyntaxSpatialGenesisAnimation: React.FC<SyntaxSpatialGenesisAnimationProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<"AGENTS" | "TOOLS" | "READY">("AGENTS");
  const [activeEntityName, setActiveEntityName] = useState<string>("S.Y.N.T.A.X.");
  const [activeEntityRole, setActiveEntityRole] = useState<string>("Initialisiere Sovereign Core Matrix");
  const [activeEntityColor, setActiveEntityColor] = useState<string>("#4ee8ff");
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasFinishedRef = useRef<boolean>(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  // Calm audio synthesizer that responds to each agent and tool
  const playCalmCyberAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Gentle sub bass drone
      const oscDrone = ctx.createOscillator();
      const gainDrone = ctx.createGain();
      oscDrone.type = "sine";
      oscDrone.frequency.setValueAtTime(60, ctx.currentTime);
      gainDrone.gain.setValueAtTime(0.12, ctx.currentTime);
      gainDrone.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 13.5);
      oscDrone.connect(gainDrone);
      gainDrone.connect(ctx.destination);
      oscDrone.start();
      oscDrone.stop(ctx.currentTime + 13.5);

      // Emergence audio pings for each spawned entity
      EMERGENCE_SEQUENCE.forEach((entity, idx) => {
        const triggerTime = entity.spawnTimeNormalized * 13.0;
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
            osc.frequency.setValueAtTime(pentatonic[idx % pentatonic.length], ctx.currentTime);
            gain.gain.setValueAtTime(entity.type === "AGENT" ? 0.04 : 0.025, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.7);
          } catch (e) {}
        }, triggerTime * 1000);
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (!isOpen) return;

    hasFinishedRef.current = false;
    startTimeRef.current = performance.now();
    playCalmCyberAudio();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build the Blue Dotted Point-Sphere exactly matching user screenshot
    const sphereDots: SphereDot3D[] = [];
    const sphereRadius = 140;
    const latitudeBands = 22;
    const dotsPerBand = 36;

    for (let latIdx = 1; latIdx < latitudeBands; latIdx++) {
      const phi = (Math.PI * latIdx) / latitudeBands;
      const y = Math.cos(phi) * sphereRadius;
      const ringRadius = Math.sin(phi) * sphereRadius;

      for (let lonIdx = 0; lonIdx < dotsPerBand; lonIdx++) {
        const theta = (2 * Math.PI * lonIdx) / dotsPerBand;
        const x = Math.sin(theta) * ringRadius;
        const z = Math.cos(theta) * ringRadius;

        sphereDots.push({
          x,
          y,
          z,
          lat: phi,
          lon: theta,
          size: 1.5,
        });
      }
    }
    // Poles
    sphereDots.push({ x: 0, y: sphereRadius, z: 0, lat: 0, lon: 0, size: 2.2 });
    sphereDots.push({ x: 0, y: -sphereRadius, z: 0, lat: Math.PI, lon: 0, size: 2.2 });

    const DURATION = 13500; // 13.5s total — clean, clear, perfectly structured
    let lastProgressUpdate = 0;

    let rotY = 0;
    const rotX = 0.24; // Subtle fixed tilt

    const render = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const rawProgress = Math.min(1, elapsed / DURATION);

      rotY += 0.0025; // Gentle majestic rotation

      if (time - lastProgressUpdate > 50 || rawProgress >= 1) {
        lastProgressUpdate = time;
        setProgress(Math.floor(rawProgress * 100));

        let currentEntity: EmergenceEntity | null = null;
        let count = 0;
        for (let i = 0; i < EMERGENCE_SEQUENCE.length; i++) {
          if (rawProgress >= EMERGENCE_SEQUENCE[i].spawnTimeNormalized) {
            currentEntity = EMERGENCE_SEQUENCE[i];
            count = i + 1;
          }
        }
        setSyncedCount(count);

        if (currentEntity) {
          setActiveEntityName(currentEntity.name);
          setActiveEntityRole(currentEntity.role);
          setActiveEntityColor(currentEntity.color);
          if (currentEntity.type === "AGENT") {
            setActiveStage("AGENTS");
          } else {
            setActiveStage("TOOLS");
          }
        }
        if (rawProgress >= 0.98) {
          setActiveStage("READY");
        }
      }

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const minDim = Math.min(canvas.width, canvas.height);

      // Deep space backdrop
      ctx.fillStyle = "rgba(1, 4, 12, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Subtle Cyber Grid
      ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 64;
      ctx.beginPath();
      for (let x = cx % gridSize; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = cy % gridSize; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      const baseRadius = Math.min(minDim * 0.17, 135);
      const baseOrbitDist = Math.min(minDim * 0.38, 280);

      // 2. Central Blue Glow Aura
      const coreAura = ctx.createRadialGradient(cx, cy, 5, cx, cy, baseRadius * 1.5);
      coreAura.addColorStop(0, "rgba(56, 189, 248, 0.6)");
      coreAura.addColorStop(0.35, "rgba(2, 132, 199, 0.3)");
      coreAura.addColorStop(0.7, "rgba(3, 105, 161, 0.1)");
      coreAura.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreAura;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Central core bright point
      const centerGlow = ctx.createRadialGradient(cx, cy, 1, cx, cy, 26);
      centerGlow.addColorStop(0, "#ffffff");
      centerGlow.addColorStop(0.4, "#38bdf8");
      centerGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();

      // 3. Render the 3D Blue Point-Sphere (Exact to user image)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      interface ProjectedDot {
        px: number;
        py: number;
        pz: number;
        alpha: number;
        size: number;
      }

      const projectedDots: ProjectedDot[] = [];

      for (let i = 0; i < sphereDots.length; i++) {
        const d = sphereDots[i];
        const scaleRadius = baseRadius / sphereRadius;
        const ox = d.x * scaleRadius;
        const oy = d.y * scaleRadius;
        const oz = d.z * scaleRadius;

        const x1 = ox * cosY + oz * sinY;
        const z1 = -ox * sinY + oz * cosY;

        const y2 = oy * cosX - z1 * sinX;
        const z2 = oy * sinX + z1 * cosX;

        const fov = 320;
        const pScale = fov / (fov + z2);
        const px = cx + x1 * pScale;
        const py = cy + y2 * pScale;

        const depthNorm = (z2 + baseRadius) / (baseRadius * 2);
        const alpha = Math.max(0.12, Math.min(1.0, depthNorm * 0.95 + 0.1));
        const dotSize = Math.max(1.0, d.size * pScale * (depthNorm * 0.7 + 0.5));

        projectedDots.push({ px, py, pz: z2, alpha, size: dotSize });
      }

      projectedDots.sort((a, b) => a.pz - b.pz);

      for (let i = 0; i < projectedDots.length; i++) {
        const dot = projectedDots[i];
        ctx.save();
        ctx.globalAlpha = dot.alpha;
        ctx.fillStyle = dot.alpha > 0.6 ? "#e0f2fe" : "#38bdf8";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = dot.alpha > 0.7 ? 5 : 2;
        ctx.beginPath();
        ctx.arc(dot.px, dot.py, dot.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Concentric Orbit Rings
      [0.85, 1.15, 1.45].forEach((mult) => {
        ctx.save();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, baseOrbitDist * mult, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 5. Sequential Emergence: 8 Agents First -> then Tools!
      EMERGENCE_SEQUENCE.forEach((entity, index) => {
        if (rawProgress < entity.spawnTimeNormalized) return;

        const spawnDuration = 0.08;
        const timeSince = rawProgress - entity.spawnTimeNormalized;
        const travelProg = Math.min(1, timeSince / spawnDuration);
        const easeTravel = 1 - Math.pow(1 - travelProg, 3);

        const targetDist = baseOrbitDist * entity.orbitRadiusMult;
        const currentDist = targetDist * easeTravel;

        const currentAngle = entity.baseAngle + (time * 0.00012);
        const nodeX = cx + Math.cos(currentAngle) * currentDist;
        const nodeY = cy + Math.sin(currentAngle) * currentDist;

        // A. Laser Ray Line from Center of Blue Ball
        ctx.save();
        const laserGrad = ctx.createLinearGradient(cx, cy, nodeX, nodeY);
        laserGrad.addColorStop(0, "rgba(56, 189, 248, 0.9)");
        laserGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.4)");
        laserGrad.addColorStop(0.8, entity.glowColor);
        laserGrad.addColorStop(1, entity.color);

        ctx.strokeStyle = laserGrad;
        ctx.lineWidth = travelProg < 1 ? 2.2 : 1.2;
        ctx.shadowColor = entity.color;
        ctx.shadowBlur = travelProg < 1 ? 14 : 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nodeX, nodeY);
        ctx.stroke();
        ctx.restore();

        // B. Mini 3D Particle Cloud for the Entity (Agent or Tool)
        const nodeSize = entity.size * (0.5 + easeTravel * 0.5);

        // Radial Aura
        ctx.save();
        const aura = ctx.createRadialGradient(nodeX, nodeY, 1, nodeX, nodeY, nodeSize * 3.5);
        aura.addColorStop(0, entity.color);
        aura.addColorStop(0.4, entity.glowColor);
        aura.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Solid Central Sphere Node
        const nodeGrad = ctx.createRadialGradient(
          nodeX - nodeSize * 0.3,
          nodeY - nodeSize * 0.3,
          nodeSize * 0.1,
          nodeX,
          nodeY,
          nodeSize
        );
        nodeGrad.addColorStop(0, "#ffffff");
        nodeGrad.addColorStop(0.35, entity.color);
        nodeGrad.addColorStop(1, "#090d16");

        ctx.fillStyle = nodeGrad;
        ctx.shadowColor = entity.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Mini-Particles around the node (giving it an individual particle form)
        for (let p = 0; p < entity.particleCount; p++) {
          const pAngle = (time * 0.002) * (p % 2 === 0 ? 1 : -1) + (p * Math.PI * 2) / entity.particleCount;
          const pDist = (nodeSize * 1.5) + (Math.sin(time * 0.003 + p) * 3);
          const px = nodeX + Math.cos(pAngle) * pDist;
          const py = nodeY + Math.sin(pAngle) * pDist;

          ctx.fillStyle = entity.color;
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // C. Clear Cyberpunk Label once arrived in Orbit
        if (travelProg > 0.3) {
          const labelAlpha = Math.min(1, (travelProg - 0.3) / 0.7);
          ctx.save();
          ctx.globalAlpha = labelAlpha;

          const isRight = Math.cos(currentAngle) >= 0;
          const labelOffsetX = isRight ? 16 : -16;
          ctx.textAlign = isRight ? "left" : "right";

          // Category Badge
          ctx.font = "bold 9px monospace";
          ctx.fillStyle = entity.color;
          ctx.shadowColor = "#000000";
          ctx.shadowBlur = 8;
          ctx.fillText(entity.type === "AGENT" ? `[ AGENT ${index + 1}/8 ]` : `[ TOOL CORE ]`, nodeX + labelOffsetX, nodeY - 9);

          // Name
          ctx.font = "bold 12px monospace";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(entity.name, nodeX + labelOffsetX, nodeY + 5);

          // Role
          ctx.font = "10px monospace";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText(entity.role, nodeX + labelOffsetX, nodeY + 18);
          ctx.restore();
        }

        // D. Data Packets shooting along laser beam
        const packetProg = ((time * 0.0008 + index * 0.12) % 1);
        const pkX = cx + (nodeX - cx) * packetProg;
        const pkY = cy + (nodeY - cy) * packetProg;
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = entity.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pkX, pkY, 2.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Continuous animation loop - never terminates prematurely so scene stays alive & permanent
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isFullyLoaded = progress >= 100;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#01040a] text-slate-100 flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Fullscreen Canvas Animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Header HUD */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-cyan-400 tracking-[0.25em] uppercase">
                S.Y.N.T.A.X. SYSTEM-EINWEISUNG & INITIALISIERUNG
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {syncedCount} / {EMERGENCE_SEQUENCE.length} AKTIV
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-black text-white font-mono tracking-wider">
              8 SOVEREIGN AGENTS, DAILY OBJECTIVES & TOKEN TELEMETRIE
            </h2>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2">
          {isFullyLoaded ? (
            <button
              onClick={() => {
                if (onCompleteRef.current) onCompleteRef.current();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-black tracking-wider flex items-center gap-2 transition duration-200 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse"
            >
              <span>EINWEISUNG / TUTORIAL STARTEN</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={() => {
                hasFinishedRef.current = true;
                if (onSkipRef.current) onSkipRef.current();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition duration-200 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] group"
            >
              <span>ÜBERSPRINGEN</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <button
            onClick={() => {
              if (onSkipRef.current) onSkipRef.current();
            }}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 border border-slate-700 text-slate-400 font-mono text-xs transition cursor-pointer"
            title="Schließen"
          >
            <span className="font-bold">✕</span>
          </button>
        </div>
      </div>

      {/* Center Floating HUD Panels (Live Telemetry & Daily Objectives Preview) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-8 max-w-5xl mx-auto w-full pointer-events-none mb-auto">
        {/* Panel 1: Live Daily Objectives Matrix */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.12)] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[11px] font-black text-amber-300 uppercase tracking-wider">
                DAILY OBJECTIVES & STREAKS
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-500/30">
              <Flame className="w-3 h-3 text-amber-400" />
              7 TAGE SERIE
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20 text-slate-200">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Focus Canvas Initialisierung</span>
              </div>
              <span className="text-amber-400 text-[10px] font-bold">+50 XP</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-slate-200">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>3 Specialist Core Queries</span>
              </div>
              <span className="text-cyan-400 text-[10px] font-bold">+100 XP</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded border border-slate-600" />
                <span>The Big 3 Konsultation</span>
              </div>
              <span className="text-slate-500 text-[10px] font-bold">+150 XP</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Live Token Overview & Real-Time Request Stream */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[11px] font-black text-cyan-300 uppercase tracking-wider">
                LIVE TOKEN TELEMETRIE & ANFRAGEN
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-500/30">
              24H RESET: 00:00 UTC
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] font-mono text-slate-400 uppercase">HEUTE GENUTZT</div>
              <div className="text-sm font-black font-mono text-cyan-300">14.820 <span className="text-[9px] text-slate-500">/ 50.000</span></div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] font-mono text-slate-400 uppercase">Ø LATENZ & EFFIZIENZ</div>
              <div className="text-sm font-black font-mono text-emerald-400">112ms <span className="text-[9px] text-slate-500">/ 98.4%</span></div>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-black/60 border border-slate-800/80 font-mono text-[9.5px] text-slate-400 flex items-center justify-between">
            <span className="text-cyan-300 truncate">REQ #842: SYNTAX ➔ Consensus Dispatch</span>
            <span className="text-emerald-400 font-bold shrink-0 ml-2">200 OK • 1.240 Tok</span>
          </div>
        </div>
      </div>

      {/* Bottom Loading Bar & Clear Readable Status Card */}
      <div className="relative z-10 p-5 sm:p-6 max-w-xl mx-auto w-full text-center space-y-3 pointer-events-auto bg-slate-950/85 backdrop-blur-xl rounded-2xl border border-cyan-500/30 mb-6 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: activeEntityColor }}
          />
          <span
            className="text-[10px] font-mono font-black tracking-[0.2em] uppercase"
            style={{ color: activeEntityColor }}
          >
            {isFullyLoaded
              ? "STATUS: MATRIX 100% ONLINE & SYNCHRONISIERT"
              : activeStage === "AGENTS"
              ? `PHASE 1 // AGENT ${Math.min(8, syncedCount)} VON 8 KOPPELN`
              : activeStage === "TOOLS"
              ? `PHASE 2 // ENGINE & TOOL SYNC (${syncedCount - 8} VON 6)`
              : "SYSTEM VOLLSTÄNDIG SYNCHRONISIERT"}
          </span>
        </div>

        <div className="space-y-1">
          <p className="font-mono text-sm sm:text-base font-black text-white tracking-wider flex items-center justify-center gap-2">
            <span style={{ color: activeEntityColor }}>⚡</span>
            {isFullyLoaded ? "ALLE 8 AGENTEN-CORES & TOOLS BEREIT" : activeEntityName}
          </p>
          <p className="font-mono text-xs text-slate-400">
            {isFullyLoaded
              ? "Die gesamte Quantum-Matrix ist live geschaltet. Alle Datenströme, Daily Objectives & Token-Telemetrie sind permanent aktiv."
              : activeEntityRole}
          </p>
        </div>

        {/* High-Tech Loading Bar */}
        <div className="w-full bg-slate-900 border border-cyan-500/40 rounded-full h-2.5 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 rounded-full transition-all duration-150 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <Bot className="w-3.5 h-3.5" />
            8 SOVEREIGN AGENTEN
          </span>
          <span className="font-black text-amber-300 text-xs tracking-wider">
            {progress}% INITIALISIERT
          </span>
          <span className="flex items-center gap-1 text-purple-400 font-bold">
            <Wrench className="w-3.5 h-3.5" />
            6 SPECIAL TOOLS
          </span>
        </div>

        {isFullyLoaded && (
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (onSkipRef.current) onSkipRef.current();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-400/40 hover:bg-slate-800 text-cyan-300 text-xs font-mono font-bold tracking-wider transition cursor-pointer"
            >
              IN MATRIX VERBLEIBEN
            </button>
            <button
              onClick={() => {
                if (onCompleteRef.current) onCompleteRef.current();
              }}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-black tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center gap-1.5"
            >
              <span>ZUR EINWEISUNG / TUTORIAL</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
