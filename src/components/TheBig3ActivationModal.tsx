import React, { useEffect, useRef, useState } from "react";
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  Shield,
  Layers,
  ArrowRight,
  X,
  Volume2,
  Sliders,
  Radio,
  Cpu,
} from "lucide-react";

interface TheBig3ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
  onSelectSingleAgent?: (agentId: string) => void;
}

interface CoreAgentInfo {
  id: string;
  name: string;
  short: string;
  title: string;
  role: string;
  tagline: string;
  color: string;
  glowColor: string;
  bgGrad: string;
  borderColor: string;
  shape: string;
  spec: string[];
  power: string;
}

const BIG_3_CORES: CoreAgentInfo[] = [
  {
    id: "maze",
    name: "S.Y.N.T.A.X.",
    short: "SYNTAX",
    title: "CORE #01 // SOVEREIGN MASTER BRAIN",
    role: "Sovereign Core & Autonomous Intelligence",
    tagline: "Zentrale System-Architektur, getsyntax.ai Routing, Code-Generierung & Orchestrierung.",
    color: "#00f0ff",
    glowColor: "rgba(0, 240, 255, 0.7)",
    bgGrad: "from-cyan-950/60 to-slate-950/90",
    borderColor: "border-cyan-500/60",
    shape: "SPHERE // NEURAL MESH",
    spec: ["Quantum Multi-Routing", "Real Workspace & Gmail Sync", "Full System Logic"],
    power: "100% ORCHESTRATION",
  },
  {
    id: "neo",
    name: "N.E.O.",
    short: "NEO",
    title: "CORE #02 // VISION & STRATEGY",
    role: "Strategic Multi-Modal Synthesizer",
    tagline: "Veo 3.1 AI Video Generation, Vision Intelligence & High-Level Strategie.",
    color: "#ff2a8d",
    glowColor: "rgba(255, 42, 141, 0.7)",
    bgGrad: "from-pink-950/60 to-slate-950/90",
    borderColor: "border-pink-500/60",
    shape: "TORUS // RING MATRIX",
    spec: ["Veo 3.1 8K Video Synthesis", "Creative Prompt Direction", "Vision Perception"],
    power: "100% VISION SYNTH",
  },
  {
    id: "vega",
    name: "V.E.G.A.",
    short: "VEGA",
    title: "CORE #03 // TACTICAL ANALYST",
    role: "Tactical Co-Processor & Data Engine",
    tagline: "Echtzeit-Datenanalyse, Code-Debugging & Taktische Entscheidungsfindung.",
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.7)",
    bgGrad: "from-rose-950/60 to-slate-950/90",
    borderColor: "border-rose-500/60",
    shape: "GYROSCOPE // ORBITAL RINGS",
    spec: ["Deep Data Analytics", "Automated Tactical Signals", "Real-Time Telemetry"],
    power: "100% TACTICAL DATA",
  },
];

export const TheBig3ActivationModal: React.FC<TheBig3ActivationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSelectSingleAgent,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [activeHoverCore, setActiveHoverCore] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean; lastX: number; lastY: number }>({
    x: 0,
    y: 0,
    isDown: false,
    lastX: 0,
    lastY: 0,
  });
  const rotationRef = useRef<{ rotX: number; rotY: number; targetRotX: number; targetRotY: number }>({
    rotX: 0.2,
    rotY: 0,
    targetRotX: 0.2,
    targetRotY: 0,
  });

  // Futuristic Web Audio Synthesizer Chord on Open
  useEffect(() => {
    if (!isOpen || !soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Tri-Core Cyberpunk Triad Frequencies: C4 (261.63Hz), E4 (329.63Hz), G4 (392.00Hz), C5 (523.25Hz)
      const freqs = [261.63, 329.63, 392.0, 523.25];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq * 0.5, now);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.15 + i * 0.05);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(800, now + 1.2);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06 / freqs.length, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.04);
        osc.stop(now + 1.5);
      });
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }, [isOpen, soundEnabled]);

  // 3D Canvas Matrix Hologram Render Loop
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dynamic Ambient Quantum Particle Systems
    const ambientParticles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const pColors = ["#00f0ff", "#ff2a8d", "#ef4444", "#ffffff", "#38bdf8"];
    for (let i = 0; i < 90; i++) {
      ambientParticles.push({
        x: (Math.random() - 0.5) * 360,
        y: (Math.random() - 0.5) * 140,
        z: (Math.random() - 0.5) * 360,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 0.8,
        color: pColors[Math.floor(Math.random() * pColors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    // Laser Beam Data Packets
    const beamPackets: Array<{
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      color: string;
      size: number;
    }> = [];

    for (let i = 0; i < 18; i++) {
      const from = Math.floor(Math.random() * 3);
      const to = (from + 1 + Math.floor(Math.random() * 2)) % 3;
      beamPackets.push({
        fromIdx: from,
        toIdx: to,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
        color: pColors[Math.floor(Math.random() * 3)],
        size: Math.random() * 3.5 + 2.0,
      });
    }

    const render = () => {
      time += 0.022;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Soft Damping on Mouse 3D Rotations
      rotationRef.current.rotX += (rotationRef.current.targetRotX - rotationRef.current.rotX) * 0.08;
      rotationRef.current.rotY += (rotationRef.current.targetRotY - rotationRef.current.rotY) * 0.08;

      const autoY = time * 0.35;
      const totalRotY = rotationRef.current.rotY + autoY;
      const totalRotX = rotationRef.current.rotX + Math.sin(time * 0.6) * 0.05;

      ctx.clearRect(0, 0, w, h);

      // Deep space radial background glow
      const bgRadius = Math.max(20, Math.max(w, h) * 0.65);
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, bgRadius);
      bgGrad.addColorStop(0, "rgba(0, 240, 255, 0.05)");
      bgGrad.addColorStop(0.4, "rgba(255, 42, 141, 0.03)");
      bgGrad.addColorStop(0.8, "rgba(239, 68, 68, 0.02)");
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 3D Perspective Projection Helper
      const fov = 360;
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const cosY = Math.cos(totalRotY);
        const sinY = Math.sin(totalRotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate X
        const cosX = Math.cos(totalRotX);
        const sinX = Math.sin(totalRotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const rawScale = fov / Math.max(40, fov + z2 + 220);
        const scale = Number.isFinite(rawScale) && rawScale > 0 ? Math.min(Math.max(rawScale, 0.2), 3.5) : 1;
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      };

      // 1. Draw Central Quantum Grid Rings (Background)
      const nexusRadius = 145;
      ctx.save();
      for (let ring = 1; ring <= 3; ring++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (nexusRadius / 3) * ring, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Central Fusion Pulse
      const centralPulse = Math.max(8, Math.sin(time * 3) * 14 + 28);
      const glowR = Math.max(12, centralPulse * 2.8);
      const centralGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      centralGlow.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      centralGlow.addColorStop(0.25, "rgba(0, 240, 255, 0.35)");
      centralGlow.addColorStop(0.65, "rgba(255, 42, 141, 0.2)");
      centralGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = centralGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Central Rotating Hologram Rune
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.7);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const rx = Math.cos(a) * 26;
        const ry = Math.sin(a) * 26;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // 2. Compute 3D Coordinates for The Big 3 Cores
      const orbitRadius = 125;
      const baseAngles = [
        0, // S.Y.N.T.A.X.
        (Math.PI * 2) / 3, // N.E.O.
        (Math.PI * 4) / 3, // V.E.G.A.
      ];

      const cores3D = BIG_3_CORES.map((core, i) => {
        const angle = baseAngles[i];
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        const y = Math.sin(time * 1.5 + i * 2) * 16;
        const proj = project(x, y, z);
        return {
          ...core,
          idx: i,
          x3d: x,
          y3d: y,
          z3d: z,
          px: proj.px,
          py: proj.py,
          pz: proj.pz,
          scale: proj.scale,
        };
      });

      // Sort by depth
      const sortedRenderList = [...cores3D].sort((a, b) => b.pz - a.pz);

      // 3. Draw Laser Splines between the 3 Cores
      for (let i = 0; i < 3; i++) {
        const c1 = cores3D[i];
        const c2 = cores3D[(i + 1) % 3];

        const grad = ctx.createLinearGradient(c1.px, c1.py, c2.px, c2.py);
        grad.addColorStop(0, c1.color);
        grad.addColorStop(0.5, "#ffffff");
        grad.addColorStop(1, c2.color);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(c1.px, c1.py);
        ctx.lineTo(c2.px, c2.py);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.0 * Math.min(c1.scale, c2.scale);
        ctx.shadowColor = c1.color;
        ctx.shadowBlur = 16;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(c1.px, c1.py);
        ctx.lineTo(c2.px, c2.py);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.2 * Math.min(c1.scale, c2.scale);
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Flowing Laser Data Packets
      beamPackets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress > 1) {
          pkt.progress = 0;
          pkt.fromIdx = Math.floor(Math.random() * 3);
          pkt.toIdx = (pkt.fromIdx + 1 + Math.floor(Math.random() * 2)) % 3;
        }

        const cFrom = cores3D[pkt.fromIdx];
        const cTo = cores3D[pkt.toIdx];
        const px = cFrom.px + (cTo.px - cFrom.px) * pkt.progress;
        const py = cFrom.py + (cTo.py - cFrom.py) * pkt.progress;
        const pktScale = cFrom.scale + (cTo.scale - cFrom.scale) * pkt.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * pktScale, 0, Math.PI * 2);
        ctx.fillStyle = pkt.color;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, (pkt.size * pktScale) / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Ambient Floating Stardust Particles
      ambientParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x > 180 || p.x < -180) p.vx *= -1;
        if (p.y > 70 || p.y < -70) p.vy *= -1;
        if (p.z > 180 || p.z < -180) p.vz *= -1;

        const proj = project(p.x, p.y, p.z);
        ctx.save();
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, p.size * proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * proj.scale;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // 6. Draw The Big 3 Cores in Sorted Depth Order
      sortedRenderList.forEach((core) => {
        const { px, py, scale, color, id, name } = core;
        if (!Number.isFinite(px) || !Number.isFinite(py)) return;
        const isHovered = activeHoverCore === id;
        const validScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
        const coreRadius = Math.max(6, (isHovered ? 40 : 34) * validScale);

        ctx.save();

        // Volumetric Aura Glow
        const innerAura = Math.max(1, coreRadius * 0.3);
        const outerAura = Math.max(innerAura + 2, coreRadius * 2.4);
        const auraGrad = ctx.createRadialGradient(px, py, innerAura, px, py, outerAura);
        auraGrad.addColorStop(0, color);
        auraGrad.addColorStop(0.5, isHovered ? color : "rgba(0,0,0,0.5)");
        auraGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(px, py, outerAura, 0, Math.PI * 2);
        ctx.fill();

        // Core-Specific Geometry
        if (id === "maze") {
          // --- S.Y.N.T.A.X. // NEURAL WAVE SPHERE ---
          const pulseR = (Math.sin(time * 3.5) * 0.15 + 1.0) * coreRadius;
          ctx.beginPath();
          ctx.arc(px, py, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = "#011c2e";
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 3.2 * scale;
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.stroke();

          // Inner Wave Ring
          ctx.beginPath();
          ctx.arc(px, py, pulseR * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 1.8 * scale;
          ctx.stroke();

          // Rotating Core Reticle Crosshair
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(time * 1.4);
          ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(-pulseR * 0.8, 0);
          ctx.lineTo(pulseR * 0.8, 0);
          ctx.moveTo(0, -pulseR * 0.8);
          ctx.lineTo(0, pulseR * 0.8);
          ctx.stroke();
          ctx.restore();
        } else if (id === "neo") {
          // --- N.E.O. // SPIRAL TORUS MATRIX ---
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(time * 1.8);

          // Outer Elliptical Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, coreRadius * 1.3, coreRadius * 0.55, time * 0.9, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3.6 * scale;
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.stroke();

          // Inner Tilted Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, coreRadius * 0.75, coreRadius * 0.35, -time * 1.3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
          ctx.lineWidth = 2 * scale;
          ctx.stroke();

          // Center Glowing Orb
          ctx.beginPath();
          ctx.arc(0, 0, coreRadius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = "#ff2a8d";
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.restore();
        } else if (id === "vega") {
          // --- V.E.G.A. // GYROSCOPIC INTERLOCKING GIMBAL RINGS ---
          ctx.save();
          ctx.translate(px, py);

          // Ring 1 (Horizontal)
          ctx.beginPath();
          ctx.ellipse(0, 0, coreRadius * 1.25, coreRadius * 0.45, time * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3 * scale;
          ctx.shadowColor = color;
          ctx.shadowBlur = 18;
          ctx.stroke();

          // Ring 2 (Tilted Gimbal)
          ctx.beginPath();
          ctx.ellipse(0, 0, coreRadius * 1.15, coreRadius * 0.4, -time * 1.9 + Math.PI / 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
          ctx.lineWidth = 2.2 * scale;
          ctx.stroke();

          // Fast Satellite Nodes
          for (let s = 0; s < 3; s++) {
            const satAng = time * 3.5 + (s * Math.PI * 2) / 3;
            const satX = Math.cos(satAng) * coreRadius * 1.15;
            const satY = Math.sin(satAng) * coreRadius * 0.45;
            ctx.beginPath();
            ctx.arc(satX, satY, 3.5 * scale, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 10;
            ctx.fill();
          }

          // Center Gyro Core
          ctx.beginPath();
          ctx.arc(0, 0, coreRadius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ef4444";
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.restore();
        }

        // Floating HUD Text Label
        ctx.shadowBlur = 0;
        ctx.font = `bold ${Math.max(12, 14 * scale)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name, px, py + coreRadius + 18 * scale);

        ctx.font = `bold ${Math.max(9, 10 * scale)}px monospace`;
        ctx.fillStyle = color;
        ctx.fillText(core.role.split("&")[0].trim().toUpperCase(), px, py + coreRadius + 30 * scale);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isOpen, activeHoverCore]);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    onConfirm(dontShowAgain);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseRef.current.isDown) return;
    const deltaX = e.clientX - mouseRef.current.lastX;
    const deltaY = e.clientY - mouseRef.current.lastY;
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;

    rotationRef.current.targetRotY += deltaX * 0.01;
    rotationRef.current.targetRotX += deltaY * 0.01;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-[105] flex items-center justify-center backdrop-blur-xl p-3 sm:p-5 animate-fadeIn font-sans">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-[#030612] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col">
        
        {/* Top Animated Tri-Color Laser Header Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-pink-500 to-rose-500 animate-pulse" />

        {/* Modal Controls Header */}
        <div className="p-4 sm:p-6 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-[#040818]/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-pink-500/20 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)] shrink-0 animate-pulse">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] sm:text-xs font-black tracking-widest uppercase bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-rose-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                  TRI-CORE QUANTUM SYNERGY
                </span>
                <span className="hidden sm:inline-block font-mono text-[10px] text-slate-400">
                  3X PARALLEL SYNCHRONIZATION
                </span>
              </div>
              <h2 className="font-mono text-lg sm:text-xl font-black text-white tracking-wider mt-0.5 flex items-center gap-2">
                THE BIG 3 // ACTIVATION MATRIX
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundEnabled
                  ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
                  : "border-slate-800 bg-slate-900 text-slate-500"
              }`}
              title={soundEnabled ? "Audio aktiv" : "Audio stumm"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* INTERACTIVE 3D TRI-CORE CANVAS VISUALIZER */}
          <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-[#020510] to-[#050b1a] rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            
            {/* Interactive 3D Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            />

            {/* Floating Live Telemetry HUD Markers */}
            <div className="absolute top-3 left-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 font-mono text-[10px] space-y-0.5 backdrop-blur-md pointer-events-none">
              <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                TRI-CORE LINK: LOCKED
              </div>
              <div className="text-slate-400">LATENCY: 0.12ms // SYNC: 100%</div>
            </div>

            <div className="absolute top-3 right-3 bg-slate-950/80 border border-pink-500/30 rounded-xl px-2.5 py-1.5 font-mono text-[10px] text-right space-y-0.5 backdrop-blur-md pointer-events-none">
              <div className="text-pink-300 font-bold">PARALLEL CORES: 3</div>
              <div className="text-slate-400">SYNTAX • NEO • VEGA</div>
            </div>

            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-amber-500/30 rounded-full px-3.5 py-1 font-mono text-[10px] text-amber-200 backdrop-blur-md flex items-center gap-2 shadow-lg">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>Klicke & Ziehe im 3D-Feld zum Drehen des Tri-Core Nexus</span>
            </div>
          </div>

          {/* THE BIG 3 CORE AGENT SHOWCASE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {BIG_3_CORES.map((core) => {
              const isHovered = activeHoverCore === core.id;
              return (
                <div
                  key={core.id}
                  onMouseEnter={() => setActiveHoverCore(core.id)}
                  onMouseLeave={() => setActiveHoverCore(null)}
                  className={`relative p-4 rounded-2xl bg-gradient-to-b ${core.bgGrad} border ${
                    isHovered ? core.borderColor : "border-slate-800"
                  } transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between group`}
                  style={{
                    boxShadow: isHovered ? `0 0 25px ${core.glowColor}` : undefined,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border uppercase"
                        style={{
                          color: core.color,
                          borderColor: `${core.color}60`,
                          backgroundColor: `${core.color}15`,
                        }}
                      >
                        {core.title}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        {core.shape}
                      </span>
                    </div>

                    <h3 className="font-mono text-base font-black text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                        style={{ backgroundColor: core.color }}
                      />
                      {core.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-300 mt-0.5 font-sans leading-tight">
                      {core.role}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                      {core.tagline}
                    </p>

                    {/* Bullet Specs */}
                    <div className="mt-3 space-y-1.5">
                      {core.spec.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
                          <Check className="w-3.5 h-3.5 shrink-0" style={{ color: core.color }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional Quick Switch Single Agent Button */}
                  {onSelectSingleAgent && (
                    <button
                      onClick={() => {
                        onSelectSingleAgent(core.id);
                        onClose();
                      }}
                      className="mt-4 w-full py-1.5 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-mono text-[10px] font-bold border border-slate-700 hover:border-slate-500 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Nur {core.short} wählen</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* RESOURCE & BENEFIT COMPARISON HUD */}
          <div className="p-4 rounded-2xl bg-[#04091a] border border-amber-500/30 font-mono space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                OPTIMALE QUOTEN- & LEISTUNGS-BALANCE
              </span>
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                EMPFOHLENER MULTI-MODUS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-400">1. MULTI-PERSPEKTIVE</div>
                <div className="text-white font-bold">
                  SYNTAX (Architektur) + NEO (Strategie) + VEGA (Datenanalyse)
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-400">2. QUOTEN-EFFIZIENZ</div>
                <div className="text-emerald-300 font-bold">
                  62.5% weniger Last als 8-Agenten Modus
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-400">3. ANTWORT-FUSION</div>
                <div className="text-cyan-300 font-bold">
                  3 getrennte Fachgedanken pro Eingabe
                </div>
              </div>
            </div>
          </div>

          {/* Do Not Show Again Checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none hover:text-white transition">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/50 cursor-pointer"
            />
            <span>In dieser Sitzung direkt ohne Bestätigung umschalten</span>
          </label>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 pt-3 border-t border-slate-800/80 bg-[#040818] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-xs text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Aktiver Multi-Scope: <strong className="text-amber-300">SYNTAX • NEO • VEGA</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold tracking-wider cursor-pointer transition border border-slate-700 active:scale-95"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirmClick}
              className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-mono text-xs font-black tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 border border-amber-300"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>👑 THE BIG 3 JETZT AKTIVIEREN</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
