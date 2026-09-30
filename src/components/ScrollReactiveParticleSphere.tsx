import React, { useEffect, useRef, useState } from "react";

interface ScrollReactiveParticleSphereProps {
  className?: string;
  size?: number;
  width?: number;
  height?: number;
  interactive?: boolean;
}

interface SphereNode3D {
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

interface ShootingParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number; alpha: number }[];
}

export const ScrollReactiveParticleSphere: React.FC<ScrollReactiveParticleSphereProps> = ({
  className = "",
  size = 200,
  width = 640,
  height = 240,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scrollRef = useRef<number>(0);
  const targetScrollRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number; isHovered: boolean }>({
    x: 0,
    y: 0,
    isHovered: false,
  });

  const [scrollDepthPercent, setScrollDepthPercent] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1000
      );
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      targetScrollRef.current = progress;
      setScrollDepthPercent(Math.round(progress * 100));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = width;
    const canvasHeight = height;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Main center sphere configuration
    const mainRadius = size * 0.32;
    const childRadius = size * 0.17;
    const mainNodeCount = 110;
    const childNodeCount = 42;

    const paletteMain = [
      "#06b6d4", // cyan
      "#a855f7", // purple
      "#22d3ee", // bright cyan
      "#38bdf8", // sky blue
      "#ffffff", // pure core white
    ];

    const paletteLeft = [
      "#10b981", // emerald
      "#06b6d4", // cyan
      "#34d399", // light emerald
      "#22d3ee", // neon cyan
      "#ffffff",
    ];

    const paletteRight = [
      "#ec4899", // fuchsia
      "#f43f5e", // rose
      "#fbbf24", // solar amber
      "#a855f7", // purple
      "#ffffff",
    ];

    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    // Helper to generate 3D fibonacci sphere nodes
    const createSphereNodes = (count: number, radius: number, palette: string[]) => {
      const list: SphereNode3D[] = [];
      for (let i = 0; i < count; i++) {
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

        const x = Math.cos(theta) * Math.sin(phi) * radius;
        const y = Math.sin(theta) * Math.sin(phi) * radius;
        const z = Math.cos(phi) * radius;

        const col = palette[i % palette.length];
        const pSize = i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.7 : 1.1;

        list.push({
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
      return list;
    };

    const mainNodes = createSphereNodes(mainNodeCount, mainRadius, paletteMain);
    const leftChildNodes = createSphereNodes(childNodeCount, childRadius, paletteLeft);
    const rightChildNodes = createSphereNodes(childNodeCount, childRadius, paletteRight);

    const shootingParticles: ShootingParticle[] = [];

    // Helper to spawn ejected shooting particle
    const spawnEjectedParticle = (
      originX: number,
      originY: number,
      targetX: number,
      targetY: number,
      colorPalette: string[],
      speedMultiplier: number = 1.0
    ) => {
      const dx = targetX - originX;
      const dy = targetY - originY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = (3.5 + Math.random() * 5.0) * speedMultiplier;
      const jitter = (Math.random() - 0.5) * 1.5;

      const vx = (dx / dist) * speed + jitter;
      const vy = (dy / dist) * speed + jitter;
      const vz = (Math.random() - 0.5) * 3;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const maxLife = 25 + Math.random() * 20;

      shootingParticles.push({
        x: originX,
        y: originY,
        z: 0,
        vx,
        vy,
        vz,
        color,
        size: 1.4 + Math.random() * 2.2,
        life: maxLife,
        maxLife,
        trail: [],
      });
    };

    let mainAngleX = 0;
    let mainAngleY = 0;
    let mainAngleZ = 0;

    let leftAngleX = 0;
    let leftAngleY = 0;

    let rightAngleX = 0;
    let rightAngleY = 0;

    let time = 0;
    let frameCount = 0;

    // Smoothed animated ejection distances
    let currentLeftOffset = { x: 0, y: 0, scale: 0, alpha: 0 };
    let currentRightOffset = { x: 0, y: 0, scale: 0, alpha: 0 };

    const render = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Smooth interpolation for scroll
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.1;
      const scrollProgress = scrollRef.current; // 0 (top) to 1 (bottom)

      const currentScrollY = window.scrollY || 0;
      const scrollDelta = Math.abs(currentScrollY - lastScrollYRef.current);
      lastScrollYRef.current = currentScrollY;

      const isHovered = mousePosRef.current.isHovered;
      const hoverBoost = isHovered ? 1.6 : 1.0;
      const scrollSpeedBoost = (1 + scrollProgress * 2.5 + (scrollDelta > 2 ? 1.8 : 0)) * hoverBoost;

      time += 0.03 * scrollSpeedBoost;
      frameCount++;

      mainAngleX += 0.012 * scrollSpeedBoost;
      mainAngleY += 0.018 * scrollSpeedBoost;
      mainAngleZ += 0.007 * scrollSpeedBoost;

      leftAngleX += 0.02 * scrollSpeedBoost;
      leftAngleY += 0.025 * scrollSpeedBoost;

      rightAngleX += 0.022 * scrollSpeedBoost;
      rightAngleY += -0.024 * scrollSpeedBoost;

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      // Ejection calculation: As user scrolls down, 2 satellite spheres shoot out from center!
      // When scrollProgress is 0 -> inside center (offset 0, scale 0)
      // When scrollProgress > 0 -> shooting outward to left and right!
      const ejectionEase = Math.min(1, Math.max(0, scrollProgress * 3.5)); // fast ejection trigger on scroll
      const maxDistanceX = Math.min(canvasWidth * 0.34, 185);
      const maxDistanceY = 22;

      // Floating orbit wave
      const orbitWaveLeftX = -maxDistanceX * ejectionEase + Math.sin(time * 1.5) * 8;
      const orbitWaveLeftY = Math.sin(time * 2.0) * maxDistanceY * ejectionEase + 4 * ejectionEase;

      const orbitWaveRightX = maxDistanceX * ejectionEase + Math.cos(time * 1.5) * 8;
      const orbitWaveRightY = Math.cos(time * 2.0) * maxDistanceY * ejectionEase - 4 * ejectionEase;

      // Smooth lerp for offsets
      currentLeftOffset.x += (orbitWaveLeftX - currentLeftOffset.x) * 0.15;
      currentLeftOffset.y += (orbitWaveLeftY - currentLeftOffset.y) * 0.15;
      currentLeftOffset.scale += (Math.min(1, ejectionEase * 1.1) - currentLeftOffset.scale) * 0.15;
      currentLeftOffset.alpha += (Math.min(1, ejectionEase * 1.5) - currentLeftOffset.alpha) * 0.15;

      currentRightOffset.x += (orbitWaveRightX - currentRightOffset.x) * 0.15;
      currentRightOffset.y += (orbitWaveRightY - currentRightOffset.y) * 0.15;
      currentRightOffset.scale += (Math.min(1, ejectionEase * 1.1) - currentRightOffset.scale) * 0.15;
      currentRightOffset.alpha += (Math.min(1, ejectionEase * 1.5) - currentRightOffset.alpha) * 0.15;

      const leftCenter = {
        x: centerX + currentLeftOffset.x,
        y: centerY + currentLeftOffset.y,
      };

      const rightCenter = {
        x: centerX + currentRightOffset.x,
        y: centerY + currentRightOffset.y,
      };

      // Spawning energetic shooting particles from center core towards child spheres
      if (scrollProgress > 0.01 || scrollDelta > 5) {
        if (frameCount % 3 === 0) {
          // Shoot particle to left child
          spawnEjectedParticle(
            centerX + (Math.random() - 0.5) * 10,
            centerY + (Math.random() - 0.5) * 10,
            leftCenter.x,
            leftCenter.y,
            paletteLeft,
            1 + scrollProgress * 1.5
          );
        }
        if (frameCount % 3 === 1) {
          // Shoot particle to right child
          spawnEjectedParticle(
            centerX + (Math.random() - 0.5) * 10,
            centerY + (Math.random() - 0.5) * 10,
            rightCenter.x,
            rightCenter.y,
            paletteRight,
            1 + scrollProgress * 1.5
          );
        }
      }

      // Draw Quantum Energy Laser Beams connecting Main Sphere -> Child Spheres
      if (currentLeftOffset.alpha > 0.1) {
        const leftBeamAlpha = currentLeftOffset.alpha * (0.35 + Math.sin(time * 8) * 0.15);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.bezierCurveTo(
          centerX - 40,
          centerY + Math.sin(time * 5) * 15,
          leftCenter.x + 30,
          leftCenter.y - Math.cos(time * 5) * 15,
          leftCenter.x,
          leftCenter.y
        );
        ctx.strokeStyle = `rgba(16, 185, 129, ${leftBeamAlpha})`;
        ctx.lineWidth = 1.6 * currentLeftOffset.scale;
        ctx.stroke();

        // High-energy core beam
        ctx.strokeStyle = `rgba(255, 255, 255, ${leftBeamAlpha * 0.8})`;
        ctx.lineWidth = 0.8 * currentLeftOffset.scale;
        ctx.stroke();
      }

      if (currentRightOffset.alpha > 0.1) {
        const rightBeamAlpha = currentRightOffset.alpha * (0.35 + Math.sin(time * 8 + 1) * 0.15);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.bezierCurveTo(
          centerX + 40,
          centerY - Math.sin(time * 5) * 15,
          rightCenter.x - 30,
          rightCenter.y + Math.cos(time * 5) * 15,
          rightCenter.x,
          rightCenter.y
        );
        ctx.strokeStyle = `rgba(236, 72, 153, ${rightBeamAlpha})`;
        ctx.lineWidth = 1.6 * currentRightOffset.scale;
        ctx.stroke();

        // High-energy core beam
        ctx.strokeStyle = `rgba(255, 255, 255, ${rightBeamAlpha * 0.8})`;
        ctx.lineWidth = 0.8 * currentRightOffset.scale;
        ctx.stroke();
      }

      // Generic function to render a 3D particle sphere at given center
      const renderSphereInstance = (
        nodeList: SphereNode3D[],
        sphereCenter: { x: number; y: number },
        radius: number,
        rotX: number,
        rotY: number,
        rotZ: number,
        opacity: number,
        auraColor: string,
        lineColor: string,
        pulseScale: number = 1.0
      ) => {
        if (opacity <= 0.01) return;

        const effectiveRadius = radius * pulseScale;

        // Project nodes
        const projected = nodeList.map((node) => {
          // Dynamic morphing wave
          const wave = Math.sin(time * 3 + node.phase + scrollProgress * 6) * (effectiveRadius * 0.08);
          const dir = Math.sqrt(node.origX * node.origX + node.origY * node.origY + node.origZ * node.origZ) || 1;
          const scaleRad = (effectiveRadius + wave) / dir;

          const nx = node.origX * scaleRad;
          const ny = node.origY * scaleRad;
          const nz = node.origZ * scaleRad;

          // Rotation X
          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);
          const y1 = ny * cosX - nz * sinX;
          const z1 = ny * sinX + nz * cosX;

          // Rotation Y
          const cosY = Math.cos(rotY);
          const sinY = Math.sin(rotY);
          const x2 = nx * cosY + z1 * sinY;
          const z2 = -nx * sinY + z1 * cosY;

          // Rotation Z
          const cosZ = Math.cos(rotZ);
          const sinZ = Math.sin(rotZ);
          const x3 = x2 * cosZ - y1 * sinZ;
          const y3 = x2 * sinZ + y1 * cosZ;
          const z3 = z2;

          const fov = 180;
          const scaleProj = fov / (fov + z3 + 50);
          const px = sphereCenter.x + x3 * scaleProj;
          const py = sphereCenter.y + y3 * scaleProj;
          const nodeAlpha = Math.max(0.2, Math.min(1.0, (z3 + effectiveRadius) / (effectiveRadius * 2))) * opacity;

          return {
            px,
            py,
            z: z3,
            alpha: nodeAlpha,
            color: node.color,
            size: node.size * scaleProj,
          };
        });

        // Sort by Z
        projected.sort((a, b) => a.z - b.z);

        // Connective lattice lines
        const maxDist = effectiveRadius * 0.55;
        ctx.lineWidth = 0.6;

        for (let i = 0; i < projected.length; i++) {
          const p1 = projected[i];
          if (p1.z < -effectiveRadius * 0.5) continue;

          let conn = 0;
          for (let j = i + 1; j < projected.length && conn < 2; j++) {
            const p2 = projected[j];
            const dx = p1.px - p2.px;
            const dy = p1.py - p2.py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              conn++;
              const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.45;
              ctx.strokeStyle = lineColor.replace("ALPHA", String(lineAlpha.toFixed(2)));
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }

        // Glowing core aura
        const aura = ctx.createRadialGradient(
          sphereCenter.x,
          sphereCenter.y,
          0,
          sphereCenter.x,
          sphereCenter.y,
          effectiveRadius * 1.2
        );
        aura.addColorStop(0, auraColor.replace("ALPHA", String((0.35 * opacity).toFixed(2))));
        aura.addColorStop(0.6, auraColor.replace("ALPHA", String((0.12 * opacity).toFixed(2))));
        aura.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(sphereCenter.x, sphereCenter.y, effectiveRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Render nodes
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          ctx.beginPath();
          ctx.arc(p.px, p.py, Math.max(0.8, p.size), 0, Math.PI * 2);
          ctx.fill();

          // Sparkle halo on brighter nodes
          if (p.size > 1.5 && p.alpha > 0.5) {
            ctx.beginPath();
            ctx.arc(p.px, p.py, p.size * 2.0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fill();
          }
        }
      };

      // 1. Render Main Sphere (Center Quantum Core)
      const mainMorph = 1 + Math.sin(time * 2) * 0.05 + scrollProgress * 0.1;
      renderSphereInstance(
        mainNodes,
        { x: centerX, y: centerY },
        mainRadius,
        mainAngleX,
        mainAngleY,
        mainAngleZ,
        1.0,
        "rgba(6, 182, 212, ALPHA)",
        "rgba(6, 182, 212, ALPHA)",
        mainMorph
      );

      // 2. Render Left Satellite Sphere (Shooting Emerald-Cyan Orb)
      if (currentLeftOffset.alpha > 0.05) {
        const leftMorph = currentLeftOffset.scale * (1 + Math.sin(time * 2.5) * 0.06);
        renderSphereInstance(
          leftChildNodes,
          leftCenter,
          childRadius,
          leftAngleX,
          leftAngleY,
          0,
          currentLeftOffset.alpha,
          "rgba(16, 185, 129, ALPHA)",
          "rgba(16, 185, 129, ALPHA)",
          leftMorph
        );
      }

      // 3. Render Right Satellite Sphere (Shooting Fuchsia-Amber Orb)
      if (currentRightOffset.alpha > 0.05) {
        const rightMorph = currentRightOffset.scale * (1 + Math.cos(time * 2.5) * 0.06);
        renderSphereInstance(
          rightChildNodes,
          rightCenter,
          childRadius,
          rightAngleX,
          rightAngleY,
          0,
          currentRightOffset.alpha,
          "rgba(236, 72, 153, ALPHA)",
          "rgba(236, 72, 153, ALPHA)",
          rightMorph
        );
      }

      // 4. Update & Render Shooting Particle Trails
      for (let i = shootingParticles.length - 1; i >= 0; i--) {
        const sp = shootingParticles[i];
        sp.life--;

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.z += sp.vz;

        sp.vx *= 0.97;
        sp.vy *= 0.97;

        const lifeRatio = sp.life / sp.maxLife;
        const alpha = Math.max(0, lifeRatio * 0.95);

        sp.trail.unshift({ x: sp.x, y: sp.y, alpha });
        if (sp.trail.length > 6) sp.trail.pop();

        // Draw Motion Trail (Ray beam)
        if (sp.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(sp.trail[0].x, sp.trail[0].y);
          for (let t = 1; t < sp.trail.length; t++) {
            ctx.lineTo(sp.trail[t].x, sp.trail[t].y);
          }
          ctx.strokeStyle = sp.color;
          ctx.globalAlpha = alpha * 0.6;
          ctx.lineWidth = sp.size * 0.8;
          ctx.stroke();
        }

        // Draw particle point
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();

        if (sp.life <= 0) {
          shootingParticles.splice(i, 1);
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
  }, [size, width, height]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        if (interactive) mousePosRef.current.isHovered = true;
      }}
      onMouseLeave={() => {
        if (interactive) mousePosRef.current.isHovered = false;
      }}
      className={`relative inline-flex flex-col items-center justify-center select-none w-full max-w-2xl mx-auto ${className}`}
      style={{ minHeight: height }}
    >
      {/* Outer Holographic Energy Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-pink-500/15 via-purple-600/10 to-cyan-400/20 blur-2xl pointer-events-none animate-pulse" />

      {/* Dynamic Scroll Level Indicator Badge */}
      <div className="absolute -bottom-2 px-3.5 py-1 rounded-full bg-[#030611]/90 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.45)] text-[10px] font-mono text-cyan-300 z-20 flex items-center gap-2 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-bold tracking-wider">QUANTUM CORE // SCROLL {scrollDepthPercent}%</span>
        {scrollDepthPercent > 3 && (
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[8.5px] uppercase font-black animate-pulse">
            2 SUB-CORES EJECTED
          </span>
        )}
      </div>

      {/* High-Performance Canvas spanning full breadth */}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxWidth: width, height }}
        className="relative z-10 block pointer-events-none"
      />
    </div>
  );
};
