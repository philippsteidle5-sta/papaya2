import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Layers } from "lucide-react";
import { DEFAULT_8_AGENTS } from "./MatrixPricingCard";

interface UnifiedCoreParticleBallProps {
  activeAgentIndex: number;
  onSelectAgent: (index: number) => void;
  lang?: "de" | "en";
  className?: string;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  coreIndex?: number; // 0-7 if it's one of the 8 main cores
  letter?: string;
  name?: string;
}

export const UnifiedCoreParticleBall: React.FC<UnifiedCoreParticleBallProps> = ({
  activeAgentIndex,
  onSelectAgent,
  lang = "de",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCoreIndex, setHoveredCoreIndex] = useState<number | null>(null);

  // Mouse interaction for 3D tilt
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });
  const rotationRef = useRef({ rotX: 0.2, rotY: 0, targetRotX: 0.2, targetRotY: 0 });

  const isDe = lang === "de";
  const displayedAgent =
    hoveredCoreIndex !== null
      ? DEFAULT_8_AGENTS[hoveredCoreIndex]
      : DEFAULT_8_AGENTS[activeAgentIndex] || DEFAULT_8_AGENTS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    // Radius of the 3D particle ball
    const SPHERE_RADIUS = 46;
    const TOTAL_AMBIENT_PARTICLES = 90;

    // Generate 8 Primary Core Nodes evenly distributed on the sphere
    // Using spherical coordinates for an even 8-core orbital arrangement
    const coreNodes: Particle3D[] = DEFAULT_8_AGENTS.map((agent, i) => {
      // Symmetrical spherical coordinates for 8 points (Cube / Antiprism vertices)
      const phi = Math.acos(-1 + (2 * i + 1) / 8);
      const theta = Math.sqrt(8 * Math.PI) * i;
      return {
        x: SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
        y: SPHERE_RADIUS * Math.cos(phi),
        z: SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta),
        color: agent.color || "#00f2ff",
        size: 5.5,
        coreIndex: i,
        letter: agent.railLetter || agent.name[0],
        name: agent.name,
      };
    });

    // Generate Ambient Quantum Filament Particles (Fibonacci spiral on sphere)
    const ambientParticles: Particle3D[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < TOTAL_AMBIENT_PARTICLES; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / TOTAL_AMBIENT_PARTICLES);
      // Vary radii slightly for depth breathing
      const r = SPHERE_RADIUS * (0.85 + Math.random() * 0.25);
      // Nearest core color tint
      const nearestCore = coreNodes[i % 8];
      ambientParticles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
        color: nearestCore.color,
        size: Math.random() * 1.8 + 0.8,
      });
    }

    const allParticles = [...coreNodes, ...ambientParticles];

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Smooth rotation
      if (mouseRef.current.isHovering) {
        rotationRef.current.targetRotY += mouseRef.current.x * 0.04;
        rotationRef.current.targetRotX -= mouseRef.current.y * 0.03;
      } else {
        rotationRef.current.targetRotY += 0.009;
        rotationRef.current.targetRotX = 0.2 + Math.sin(Date.now() * 0.001) * 0.1;
      }

      // Lerp towards target
      rotationRef.current.rotX += (rotationRef.current.targetRotX - rotationRef.current.rotX) * 0.1;
      rotationRef.current.rotY += (rotationRef.current.targetRotY - rotationRef.current.rotY) * 0.1;

      const rotX = rotationRef.current.rotX;
      const rotY = rotationRef.current.rotY;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Central Quantum Singularity Glow (Breathing Core)
      const pulseTime = Date.now() * 0.003;
      const corePulse = 0.28 + Math.sin(pulseTime) * 0.08;
      const singularityGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, SPHERE_RADIUS * 0.85);
      singularityGlow.addColorStop(0, `rgba(0, 242, 255, ${corePulse * 1.3})`);
      singularityGlow.addColorStop(0.35, `rgba(168, 85, 247, ${corePulse * 0.7})`);
      singularityGlow.addColorStop(0.7, `rgba(239, 68, 68, ${corePulse * 0.25})`);
      singularityGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = singularityGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, SPHERE_RADIUS * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Project particles to 2D
      const projected = allParticles.map((p) => {
        // Rotate Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective
        const cameraDist = 220;
        const fov = cameraDist / (cameraDist + z2);
        const px = cx + x1 * fov;
        const py = cy + y2 * fov;

        return {
          ...p,
          px,
          py,
          pz: z2,
          fov,
        };
      });

      // Sort by depth (back to front)
      projected.sort((a, b) => a.pz - b.pz);

      // Draw connecting filaments between close core nodes
      ctx.lineWidth = 0.75;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        // Connect only among significant nodes or ambient within threshold
        const maxLinks = p1.coreIndex !== undefined ? 5 : 2;
        let links = 0;

        for (let j = i + 1; j < projected.length; j++) {
          if (links >= maxLinks) break;
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = p1.coreIndex !== undefined && p2.coreIndex !== undefined ? 65 : 28;

          if (dist < maxDist) {
            links++;
            const alpha = (1 - dist / maxDist) * (p1.pz > 0 || p2.pz > 0 ? 0.35 : 0.12);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle =
              p1.coreIndex !== undefined
                ? `${p1.color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`
                : `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.stroke();
          }
        }
      }

      // Render projected particles
      for (const p of projected) {
        const isCore = p.coreIndex !== undefined;
        const isSelected = p.coreIndex === activeAgentIndex;
        const isHovered = p.coreIndex === hoveredCoreIndex;

        // Depth alpha calculation
        const depthAlpha = Math.max(0.18, Math.min(1, (p.pz + SPHERE_RADIUS) / (SPHERE_RADIUS * 2)));

        if (isCore) {
          const coreRadius = (p.size * (isSelected || isHovered ? 1.4 : 1.0)) * p.fov;

          // Outer halo
          ctx.beginPath();
          ctx.arc(p.px, p.py, coreRadius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.floor(depthAlpha * (isSelected ? 70 : 35)).toString(16).padStart(2, "0")}`;
          ctx.fill();

          // Core node body
          ctx.beginPath();
          ctx.arc(p.px, p.py, coreRadius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = isSelected ? 16 : 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          // White center highlight
          ctx.beginPath();
          ctx.arc(p.px, p.py, coreRadius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          // Engraved core letter label (if facing front)
          if (p.pz > -15 && p.letter) {
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.round(8.5 * p.fov)}px ui-monospace, monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(p.letter, p.px, p.py - coreRadius * 1.7);
          }
        } else {
          // Ambient quantum particle
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size * p.fov, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.floor(depthAlpha * 180).toString(16).padStart(2, "0")}`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeAgentIndex, hoveredCoreIndex]);

  // Handle canvas mouse move for interactive rotation & hit testing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    mouseRef.current = { x, y, isHovering: true };
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHovering = false;
    setHoveredCoreIndex(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl bg-slate-950/70 border border-white/[0.08] backdrop-blur-xl p-3.5 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden ${className}`}
    >
      {/* Background radial ambient glow based on current agent's color */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 opacity-25"
        style={{ backgroundColor: displayedAgent.color || "#00f2ff" }}
      />

      {/* TOP HEADER: UNIFIED PARTICLE SINGULARITY TITLE & HARMONIZATION BADGE */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#00f2ff] animate-pulse" />
          <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-white uppercase">
            {isDe ? "UNIFIED 8-CORE PARTICLE BALL" : "UNIFIED 8-CORE PARTICLE SPHERE"}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-mono text-emerald-400 font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>8/8 HARMONIZED</span>
        </span>
      </div>

      {/* MIDDLE: 3D PARTICLE BALL CANVAS WITH EMBEDDED CORES */}
      <div className="relative flex items-center justify-center my-1 group">
        <canvas
          ref={canvasRef}
          width={280}
          height={140}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            // Cycle through cores on click
            onSelectAgent((activeAgentIndex + 1) % DEFAULT_8_AGENTS.length);
          }}
          className="cursor-pointer max-w-full drop-shadow-[0_0_15px_rgba(0,242,255,0.2)]"
          title={isDe ? "Klicken zum Durchwechseln der 8 Cores • Bewegen zum 3D-Rotieren" : "Click to cycle 8 cores • Hover to rotate 3D sphere"}
        />

        {/* Subtle interactive hint overlay */}
        <div className="absolute bottom-1 right-2 pointer-events-none text-[8px] font-mono text-zinc-500 opacity-60">
          3D QUANTUM ORB
        </div>
      </div>

      {/* BOTTOM DESCRIPTIVE SYSTEM HUD: EXPLAINS ALL 8 CORES UNITED IN ONE */}
      <div className="space-y-2 pt-1 border-t border-white/[0.06]">
        {/* Core Legend & Active Core Descriptors */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-sm"
              style={{
                backgroundColor: displayedAgent.color,
                boxShadow: `0 0 8px ${displayedAgent.color}`,
              }}
            />
            <span className="font-mono text-[10px] font-bold text-white tracking-wide truncate">
              {displayedAgent.railLetter}: {displayedAgent.name}
            </span>
            <span className="text-[9px] font-mono text-zinc-400 truncate hidden sm:inline">
              ({displayedAgent.short})
            </span>
          </div>

          <span
            className="text-[9px] font-mono px-2 py-0.5 rounded-md font-semibold shrink-0 uppercase"
            style={{
              backgroundColor: `${displayedAgent.color}15`,
              color: displayedAgent.color,
              border: `1px solid ${displayedAgent.color}35`,
            }}
          >
            {displayedAgent.shape || "ACTIVE CORE"}
          </span>
        </div>

        {/* Descriptive synthesis text of the unified particle sphere */}
        <p className="text-[10px] text-zinc-300 font-sans leading-relaxed">
          {isDe ? (
            <>
              Alle <strong className="text-white font-medium">8 autarken Sovereign Cores</strong> (S.Y.N.T.A.X., N.E.O., V.E.G.A., O.D.I.N., P.U.L.S.E., C.H.R.O.N.O.S., O.R.A.C.L.E., G.L.O.B.E.) sind in dieser <strong className="text-[#00f2ff] font-medium">singulären Partikelsphäre</strong> synchronisiert.
            </>
          ) : (
            <>
              All <strong className="text-white font-medium">8 sovereign cores</strong> (Syntax, Neo, Vega, Odin, Pulse, Chronos, Oracle, Globe) harmonized into this <strong className="text-[#00f2ff] font-medium">unified quantum particle sphere</strong>.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
