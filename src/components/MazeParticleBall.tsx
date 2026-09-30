import React, { useEffect, useRef } from "react";
import { useTheme } from "../utils/themeStore";

interface MazeParticleBallProps {
  size?: number; // width/height in px
  className?: string;
  speedMultiplier?: number;
  interactive?: boolean;
  themeMode?: "modern" | "cyberpunk";
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  color: string;
  size: number;
  phase: number;
}

export const MazeParticleBall: React.FC<MazeParticleBallProps> = ({
  size = 54,
  className = "",
  speedMultiplier = 1.0,
  interactive = true,
  themeMode,
}) => {
  const { isModern: currentIsModern } = useTheme();
  const isModern = themeMode ? themeMode === "modern" : currentIsModern;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isHoveredRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = size;
    const height = size;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Modern = Regal Purple/Violet Theme; Cyberpunk = Electric Cyan/Blue Theme
    const colors = isModern
      ? [
          "#a855f7", // purple-500
          "#c084fc", // purple-400
          "#9333ea", // purple-600
          "#d946ef", // fuchsia-500
          "#e879f9", // fuchsia-400
          "#ffffff", // core white
          "#7e22ce", // purple-700
        ]
      : [
          "#00f0ff", // electric cyan
          "#00fff2", // neon aqua
          "#06b6d4", // cyan-500
          "#3b82f6", // blue-500
          "#60a5fa", // blue-400
          "#ffffff", // core white
          "#38bdf8", // sky-400
        ];

    const particleCount = 110;
    const sphereRadius = size * 0.42;
    const particles: Particle3D[] = [];

    // Fibonacci sphere distribution for uniform 3D sphere points
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < particleCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);

      const x = Math.cos(theta) * Math.sin(phi) * sphereRadius;
      const y = Math.sin(theta) * Math.sin(phi) * sphereRadius;
      const z = Math.cos(phi) * sphereRadius;

      const col = colors[i % colors.length];
      const pSize = i % 6 === 0 ? 2.2 : i % 3 === 0 ? 1.6 : 1.1;

      particles.push({
        x,
        y,
        z,
        origX: x,
        origY: y,
        origZ: z,
        color: col,
        size: pSize,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;
    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const speed = (isHoveredRef.current ? 2.2 : 1.0) * speedMultiplier;
      angleX += 0.012 * speed;
      angleY += 0.018 * speed;
      angleZ += 0.007 * speed;
      pulseTime += 0.04 * speed;

      const centerX = width / 2;
      const centerY = height / 2;
      const pulseScale = 1 + Math.sin(pulseTime) * 0.04;

      // Rotate particles and compute projected 2D coordinates
      const projected = particles.map((p, idx) => {
        // Rotation around X
        const radX = angleX + Math.sin(pulseTime * 0.5 + p.phase) * 0.05;
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const y1 = p.origY * cosX - p.origZ * sinX;
        const z1 = p.origY * sinX + p.origZ * cosX;

        // Rotation around Y
        const radY = angleY;
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const x2 = p.origX * cosY + z1 * sinY;
        const z2 = -p.origX * sinY + z1 * cosY;

        // Rotation around Z
        const radZ = angleZ;
        const cosZ = Math.cos(radZ);
        const sinZ = Math.sin(radZ);
        const x3 = x2 * cosZ - y1 * sinZ;
        const y3 = x2 * sinZ + y1 * cosZ;
        const z3 = z2;

        // Perspective projection
        const fov = 160;
        const scale = (fov / (fov + z3)) * pulseScale;
        const px = centerX + x3 * scale;
        const py = centerY + y3 * scale;
        const alpha = Math.max(0.15, Math.min(1.0, (z3 + sphereRadius) / (sphereRadius * 2)));

        return {
          px,
          py,
          z: z3,
          alpha,
          scale,
          color: p.color,
          size: p.size * scale,
          idx,
        };
      });

      // Sort by Z for proper depth rendering
      projected.sort((a, b) => a.z - b.z);

      // Draw connecting lines between nearby points (Matrix Neural Network Mesh)
      const maxConnectDist = sphereRadius * 0.52;
      ctx.lineWidth = 0.6;

      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.z < -sphereRadius * 0.7) continue; // Skip far backside lines for cleanliness

        let connections = 0;
        for (let j = i + 1; j < projected.length && connections < 3; j++) {
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            connections++;
            const lineAlpha = (1 - dist / maxConnectDist) * Math.min(p1.alpha, p2.alpha) * 0.38;
            ctx.strokeStyle = isModern
              ? `rgba(168, 85, 247, ${lineAlpha})`
              : `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw Glowing Core Aura
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        sphereRadius * 0.85
      );
      if (isModern) {
        coreGrad.addColorStop(0, "rgba(168, 85, 247, 0.3)");
        coreGrad.addColorStop(0.5, "rgba(147, 51, 234, 0.15)");
        coreGrad.addColorStop(1, "rgba(168, 85, 247, 0)");
      } else {
        coreGrad.addColorStop(0, "rgba(0, 240, 255, 0.3)");
        coreGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.15)");
        coreGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
      }
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Draw Particles with glow
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.6, p.size), 0, Math.PI * 2);
        ctx.fill();

        // Extra outer glow on larger bright nodes
        if (p.size > 1.5 && p.alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle =
            p.color === "#ffffff"
              ? "rgba(255,255,255,0.3)"
              : isModern
              ? "rgba(168,85,247,0.25)"
              : "rgba(0,240,255,0.25)";
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [size, speedMultiplier, isModern]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        if (interactive) isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        if (interactive) isHoveredRef.current = false;
      }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={
        isModern
          ? "S.Y.N.T.A.X. Sovereign Core // Purple Neural Lattice"
          : "S.Y.N.T.A.X. Cyberpunk Core // Blue Particle Lattice"
      }
    >
      {/* Outer subtle orbital glow ring */}
      <div
        className={`absolute inset-0 rounded-full border animate-pulse pointer-events-none ${
          isModern ? "border-purple-500/30" : "border-cyan-400/40"
        }`}
      />
      <div
        className={`absolute -inset-1 rounded-full blur-sm pointer-events-none ${
          isModern
            ? "bg-gradient-to-r from-purple-500/15 via-fuchsia-500/15 to-purple-600/15"
            : "bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-cyan-400/15"
        }`}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="relative z-10 block pointer-events-none"
      />
    </div>
  );
};
