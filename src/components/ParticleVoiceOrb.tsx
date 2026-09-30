import React, { useEffect, useRef, useState } from "react";

export interface ParticleVoiceOrbProps {
  type?: "syntax" | "boss" | "custom";
  intensity?: number; // 0.0 to 1.0 (audio volume, mic level or speech frequency)
  isLive?: boolean;
  state?: "idle" | "listening" | "speaking" | "thinking" | "";
  size?: number; // size in px (e.g., 60, 120, 260, 360)
  responsive?: boolean; // fill parent container
  themeStyle?: "modern" | "cyberpunk";
  primaryColor?: string; // hex or rgb
  secondaryColor?: string;
  label?: string;
  subLabel?: string;
  onClick?: () => void;
  bare?: boolean;
  className?: string;
  interactive?: boolean;
  enableDrag?: boolean;
}

interface OrbParticle {
  theta: number;
  phi: number;
  baseR: number;
  speed: number;
  dir: number;
  size: number;
  twinkleSpeed: number;
  twinklePhase: number;
  colorMix: number;
  wobble: number;
  wobbleSpeed: number;
  life: number;
  sx: number;
  sy: number;
  scale: number;
  z: number;
  twinkle: number;
}

interface OrbFilament {
  theta: number;
  phi: number;
  length: number;
  r: number;
  speed: number;
  width: number;
  colorMix: number;
  phaseOffset: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16) || 168,
      parseInt(clean[1] + clean[1], 16) || 85,
      parseInt(clean[2] + clean[2], 16) || 247,
    ];
  }
  return [
    parseInt(clean.substring(0, 2), 16) || 168,
    parseInt(clean.substring(2, 4), 16) || 85,
    parseInt(clean.substring(4, 6), 16) || 247,
  ];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export const ParticleVoiceOrb: React.FC<ParticleVoiceOrbProps> = ({
  type = "syntax",
  intensity = 0,
  isLive = false,
  state = "idle",
  size = 64,
  responsive = false,
  themeStyle = "modern",
  primaryColor,
  secondaryColor,
  label,
  subLabel,
  onClick,
  bare = false,
  className = "",
  interactive = true,
  enableDrag = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Drag / Rotation state
  const rotYRef = useRef(0);
  const rotXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Keep animated states in refs to prevent recreate lag
  const intensityRef = useRef(intensity);
  const isLiveRef = useRef(isLive);
  const stateRef = useRef(state);
  const primaryColorRef = useRef(primaryColor);
  const secondaryColorRef = useRef(secondaryColor);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    primaryColorRef.current = primaryColor;
  }, [primaryColor]);

  useEffect(() => {
    secondaryColorRef.current = secondaryColor;
  }, [secondaryColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let targetW = size;
    let targetH = size;

    const getDimensions = () => {
      if (responsive && containerRef.current) {
        targetW = containerRef.current.clientWidth || window.innerWidth;
        targetH = containerRef.current.clientHeight || window.innerHeight;
      } else {
        targetW = size;
        targetH = size;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = targetW * dpr;
      canvas.height = targetH * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    getDimensions();

    let cx = targetW / 2;
    let cy = targetH / 2;
    let minDim = Math.min(targetW, targetH);
    let baseSphereRadius = minDim * (responsive ? 0.32 : 0.28);

    const handleResize = () => {
      if (responsive) {
        getDimensions();
        cx = targetW / 2;
        cy = targetH / 2;
        minDim = Math.min(targetW, targetH);
        baseSphereRadius = minDim * 0.32;
      }
    };

    window.addEventListener("resize", handleResize);

    // Palette construction based on type & custom color
    let basePalette: [number, number, number][] = [
      [190, 100, 255], // purple
      [130, 80, 255],  // violet
      [90, 200, 255],  // cyan
      [60, 230, 255],  // bright cyan
      [255, 255, 255], // white core
    ];

    if (type === "boss") {
      basePalette = [
        [16, 185, 129],  // emerald
        [5, 150, 105],   // deep emerald
        [52, 211, 153],  // light emerald
        [110, 231, 183], // bright mint
        [255, 255, 255], // white core
      ];
    } else if (primaryColorRef.current) {
      const rgbPrimary = hexToRgb(primaryColorRef.current);
      const rgbSecondary: [number, number, number] = secondaryColorRef.current
        ? hexToRgb(secondaryColorRef.current)
        : [
            Math.min(255, rgbPrimary[0] + 50),
            Math.min(255, rgbPrimary[1] + 50),
            Math.min(255, rgbPrimary[2] + 70),
          ];
      basePalette = [
        rgbPrimary,
        [
          Math.floor(rgbPrimary[0] * 0.7),
          Math.floor(rgbPrimary[1] * 0.7),
          Math.floor(rgbPrimary[2] * 0.9),
        ],
        rgbSecondary,
        [
          Math.min(255, rgbSecondary[0] + 40),
          Math.min(255, rgbSecondary[1] + 40),
          Math.min(255, rgbSecondary[2] + 40),
        ],
        [255, 255, 255],
      ];
    }

    // Determine particle count based on size
    const particleCount = minDim > 300 ? 1200 : minDim > 180 ? 700 : minDim > 100 ? 400 : 160;
    const filamentCount = minDim > 300 ? 24 : minDim > 180 ? 16 : minDim > 100 ? 10 : 5;

    const particles: OrbParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const r = Math.random();
      particles.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        baseR: baseSphereRadius * Math.pow(r, 0.65),
        speed: 0.0012 + Math.random() * 0.004,
        dir: Math.random() < 0.5 ? 1 : -1,
        size: Math.max(0.4, (Math.random() * 1.5 + 0.4) * (minDim / 180)),
        twinkleSpeed: 0.02 + Math.random() * 0.05,
        twinklePhase: Math.random() * Math.PI * 2,
        colorMix: Math.random(),
        wobble: Math.random() * 0.5,
        wobbleSpeed: 0.5 + Math.random() * 1.5,
        life: 0,
        sx: cx,
        sy: cy,
        scale: 1,
        z: 0,
        twinkle: 1,
      });
    }

    const filaments: OrbFilament[] = [];
    for (let i = 0; i < filamentCount; i++) {
      filaments.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        length: 0.35 + Math.random() * 0.55,
        r: baseSphereRadius * (0.65 + Math.random() * 0.5),
        speed: (Math.random() < 0.5 ? 1 : -1) * (0.0025 + Math.random() * 0.0045),
        width: Math.max(0.5, (0.6 + Math.random() * 1.2) * (minDim / 160)),
        colorMix: Math.random(),
        phaseOffset: Math.random() * Math.PI * 2,
      });
    }

    let startTime = performance.now();
    let smoothedIntensity = 0.05;

    const render = () => {
      const t = (performance.now() - startTime) / 1000;
      const targetIntensity = isLiveRef.current
        ? Math.max(0.25, intensityRef.current)
        : stateRef.current === "speaking" || stateRef.current === "listening"
        ? Math.max(0.35, intensityRef.current)
        : 0.07;

      smoothedIntensity += (targetIntensity - smoothedIntensity) * 0.18;

      ctx.clearRect(0, 0, targetW, targetH);

      // Outer ambient aura glow
      const safeSphereRadius = Math.max(10, Number.isFinite(baseSphereRadius) ? baseSphereRadius : 40);
      const safeIntensity = Number.isFinite(smoothedIntensity) ? Math.max(0, smoothedIntensity) : 0;
      const safeCx = Number.isFinite(cx) ? cx : targetW / 2;
      const safeCy = Number.isFinite(cy) ? cy : targetH / 2;

      const innerGlowRadius = Math.max(1, safeSphereRadius * 0.35);
      const outerGlowRadius = Math.max(innerGlowRadius + 5, safeSphereRadius * (1.3 + safeIntensity * 1.0));
      const outerGrad = ctx.createRadialGradient(safeCx, safeCy, innerGlowRadius, safeCx, safeCy, outerGlowRadius);
      const auraColor = basePalette[0];
      outerGrad.addColorStop(0, `rgba(${auraColor[0]}, ${auraColor[1]}, ${auraColor[2]}, ${0.14 + safeIntensity * 0.28})`);
      outerGrad.addColorStop(1, `rgba(${auraColor[0]}, ${auraColor[1]}, ${auraColor[2]}, 0)`);
      ctx.beginPath();
      ctx.fillStyle = outerGrad;
      ctx.arc(safeCx, safeCy, outerGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";

      const perspective = minDim * 2.2;
      const autoRotY = t * (0.2 + smoothedIntensity * 0.65) + rotYRef.current;
      const autoRotX = rotXRef.current + Math.sin(t * 0.5) * 0.1;

      const cosRY = Math.cos(autoRotY);
      const sinRY = Math.sin(autoRotY);
      const cosRX = Math.cos(autoRotX);
      const sinRX = Math.sin(autoRotX);

      // Render energy filaments / streak arcs
      filaments.forEach((f) => {
        f.theta += f.speed * (1 + smoothedIntensity * 3.5);
        const segments = 14;
        let prevPoint: { x: number; y: number } | null = null;

        let c: [number, number, number];
        if (f.colorMix < 0.5) {
          c = lerpColor(basePalette[0], basePalette[1], f.colorMix / 0.5);
        } else {
          c = lerpColor(basePalette[2], basePalette[3], (f.colorMix - 0.5) / 0.5);
        }

        const dynamicR = f.r * (1 + smoothedIntensity * 0.45 * Math.sin(t * 3.5 + f.phaseOffset));

        for (let s = 0; s <= segments; s++) {
          const segT = s / segments;
          const ang = f.theta + segT * f.length * Math.PI * 2 * 0.18;
          const phi = f.phi + Math.sin(segT * Math.PI * 2 + f.phaseOffset) * 0.18;
          const sinPhi = Math.sin(phi);
          let x3 = dynamicR * sinPhi * Math.cos(ang);
          let y3 = dynamicR * sinPhi * Math.sin(ang);
          let z3 = dynamicR * Math.cos(phi);

          // 3D Rotations
          const yRot = y3 * cosRX - z3 * sinRX;
          const zRot = y3 * sinRX + z3 * cosRX;
          y3 = yRot;
          z3 = zRot;

          const xr = x3 * cosRY - z3 * sinRY;
          const zr = x3 * sinRY + z3 * cosRY;
          const scale = perspective / (perspective + zr);
          const sx = cx + xr * scale;
          const sy = cy + y3 * scale;

          const depthFactor = (zr + baseSphereRadius) / (baseSphereRadius * 2);
          const alpha = Math.max(0.04, Math.min(0.95, depthFactor)) * (0.45 + smoothedIntensity * 0.55);

          if (prevPoint) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${alpha})`;
            ctx.lineWidth = f.width * scale * (1 + smoothedIntensity * 0.85);
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
          prevPoint = { x: sx, y: sy };
        }
      });

      // Render 3D particles with depth perspective & wobble
      particles.forEach((p) => {
        p.theta += p.speed * p.dir * (1 + smoothedIntensity * 3.2);
        p.life += 0.01;

        const rWobble =
          p.baseR * (1 + smoothedIntensity * 0.5) +
          Math.sin(t * p.wobbleSpeed * 2 + p.twinklePhase) * p.wobble * (baseSphereRadius * 0.15 + smoothedIntensity * 8);

        const sinPhi = Math.sin(p.phi);
        let x3 = rWobble * sinPhi * Math.cos(p.theta);
        let y3 = rWobble * sinPhi * Math.sin(p.theta);
        let z3 = rWobble * Math.cos(p.phi);

        // 3D Rotations
        const yRot = y3 * cosRX - z3 * sinRX;
        const zRot = y3 * sinRX + z3 * cosRX;
        y3 = yRot;
        z3 = zRot;

        const xr = x3 * cosRY - z3 * sinRY;
        const zr = x3 * sinRY + z3 * cosRY;

        const scale = perspective / (perspective + zr);
        const sx = cx + xr * scale;
        const sy = cy + y3 * scale;

        p.twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed * 12 + p.twinklePhase);

        const depthFactor = (zr + baseSphereRadius) / (baseSphereRadius * 2);
        const alpha =
          Math.max(0.06, Math.min(1, depthFactor)) *
          (0.35 + 0.65 * p.twinkle) *
          (0.7 + smoothedIntensity * 0.6);
        const pSize = Math.max(0.35, p.size * scale * (0.7 + 0.5 * p.twinkle) * (1 + smoothedIntensity * 0.5));

        let c: [number, number, number];
        if (p.colorMix < 0.15) {
          c = lerpColor(basePalette[4], basePalette[0], p.colorMix / 0.15);
        } else if (p.colorMix < 0.55) {
          c = lerpColor(basePalette[0], basePalette[1], (p.colorMix - 0.15) / 0.4);
        } else {
          c = lerpColor(basePalette[2], basePalette[3], (p.colorMix - 0.55) / 0.45);
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${alpha})`;
        ctx.arc(sx, sy, pSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw pulsating central energy core
      const pulse = 0.85 + 0.15 * Math.sin(t * (3.5 + safeIntensity * 8)) + safeIntensity * 0.5;
      const coreRadius = Math.max(4, safeSphereRadius * 0.28 * pulse);
      const outerCoreRadius = Math.max(coreRadius + 2, coreRadius * 4.5);

      const coreGrad = ctx.createRadialGradient(safeCx, safeCy, 0, safeCx, safeCy, outerCoreRadius);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
      coreGrad.addColorStop(0.18, `rgba(${basePalette[3][0]}, ${basePalette[3][1]}, ${basePalette[3][2]}, 0.85)`);
      coreGrad.addColorStop(0.45, `rgba(${basePalette[0][0]}, ${basePalette[0][1]}, ${basePalette[0][2]}, 0.35)`);
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.fillStyle = coreGrad;
      ctx.arc(safeCx, safeCy, outerCoreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sharp white inner pinpoint core
      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.arc(safeCx, safeCy, Math.max(1, coreRadius * 0.6), 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [type, size, responsive]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableDrag) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !enableDrag) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    rotYRef.current += dx * 0.01;
    rotXRef.current += dy * 0.01;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const isModern = themeStyle === "modern";

  if (responsive) {
    return (
      <div
        ref={containerRef}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-full ${enableDrag ? "cursor-grab active:cursor-grabbing" : ""} ${className}`}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    );
  }

  if (bare) {
    return (
      <div
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-shrink-0 ${onClick && interactive ? "cursor-pointer" : ""} ${className}`}
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="block w-full h-full pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all select-none ${
        onClick && interactive ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
      } ${
        isModern
          ? type === "syntax"
            ? "bg-slate-900/80 border border-purple-500/30 shadow-lg shadow-purple-950/30"
            : "bg-slate-900/80 border border-emerald-500/30 shadow-lg shadow-emerald-950/30"
          : type === "syntax"
          ? "bg-[#081224]/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
          : "bg-[#081224]/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
      } ${className}`}
    >
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="block w-full h-full pointer-events-none"
        />
      </div>

      {(label || subLabel) && (
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-black tracking-wider uppercase truncate ${
                type === "syntax"
                  ? isModern ? "text-purple-400" : "text-cyan-400"
                  : isModern ? "text-emerald-400" : "text-emerald-300"
              }`}
            >
              {label}
            </span>
            {(isLive || state === "speaking" || state === "listening") && (
              <span
                className={`w-1.5 h-1.5 rounded-full animate-ping ${
                  type === "syntax" ? (isModern ? "bg-purple-400" : "bg-cyan-400") : "bg-emerald-400"
                }`}
              />
            )}
          </div>
          {subLabel && (
            <p className="text-[10.5px] text-zinc-300 font-sans line-clamp-1 leading-tight mt-0.5 max-w-[170px]">
              {subLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
