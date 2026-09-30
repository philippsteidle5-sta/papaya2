import React, { useEffect, useRef, useState } from "react";

interface FleetSphere3D {
  id: string;
  name: string;
  type: "fibonacci" | "gyro" | "helix" | "pulsar" | "icosahedron" | "tetra";
  baseRadius: number;
  palette: string[];
  primaryColor: string;
  glowColor: string;
  // Dynamic positioning function based on viewport & scroll
  getPosition: (
    scrollY: number,
    totalScroll: number,
    vw: number,
    vh: number
  ) => { x: number; y: number; scale: number; opacity: number };
  // 3D parameters
  nodes: {
    x: number;
    y: number;
    z: number;
    origX: number;
    origY: number;
    origZ: number;
    color: string;
    size: number;
    phase: number;
  }[];
  rotSpeedX: number;
  rotSpeedY: number;
  angleX: number;
  angleY: number;
}

interface NeedleStreamParticle {
  path: "left" | "right";
  t: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  jitterX: number;
  jitterY: number;
}

interface MuzzleFlashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export const HeroScrollParticleCanvas: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const scrollRef = useRef<number>(0);
  const targetScrollRef = useRef<number>(0);
  const totalPageHeightRef = useRef<number>(5000);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeFleetCount, setActiveFleetCount] = useState<number>(1);

  // Viewport tracking
  const [viewSize, setViewSize] = useState<{ width: number; height: number }>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        ) - window.innerHeight;

      totalPageHeightRef.current = Math.max(docHeight, 2000);
      const prog = Math.min(Math.max(scrollY / totalPageHeightRef.current, 0), 1);
      targetScrollRef.current = scrollY;
      setScrollProgress(prog);

      // Active count tracker for HUD
      if (scrollY < 180) setActiveFleetCount(1);
      else if (scrollY < 550) setActiveFleetCount(3);
      else if (scrollY < 1000) setActiveFleetCount(5);
      else if (scrollY < 1600) setActiveFleetCount(7);
      else setActiveFleetCount(9);
    };

    const handleResize = () => {
      setViewSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = viewSize;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // HELPER: Generate Distinct 3D Node Geometries
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    // 1. Fibonacci Quantum Sphere
    const makeFibonacciNodes = (count: number, radius: number, palette: string[]) => {
      const list = [];
      for (let i = 0; i < count; i++) {
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        const x = Math.cos(theta) * Math.sin(phi) * radius;
        const y = Math.sin(theta) * Math.sin(phi) * radius;
        const z = Math.cos(phi) * radius;
        list.push({
          x,
          y,
          z,
          origX: x,
          origY: y,
          origZ: z,
          color: palette[i % palette.length],
          size: i % 4 === 0 ? 2.5 : 1.3,
          phase: Math.random() * Math.PI * 2,
        });
      }
      return list;
    };

    // 2. Multi-Ring Gyro-Torus Sphere
    const makeGyroNodes = (count: number, radius: number, palette: string[]) => {
      const list = [];
      const rings = 5;
      const ptsPerRing = Math.floor(count / rings);
      for (let r = 0; r < rings; r++) {
        const ringAngle = (r / rings) * Math.PI;
        const ringY = Math.cos(ringAngle) * radius;
        const ringRad = Math.sin(ringAngle) * radius;
        for (let p = 0; p < ptsPerRing; p++) {
          const theta = (p / ptsPerRing) * Math.PI * 2;
          const x = Math.cos(theta) * ringRad;
          const y = ringY;
          const z = Math.sin(theta) * ringRad;
          list.push({
            x,
            y,
            z,
            origX: x,
            origY: y,
            origZ: z,
            color: palette[(r + p) % palette.length],
            size: p % 3 === 0 ? 2.6 : 1.2,
            phase: r * 0.9 + p * 0.3,
          });
        }
      }
      return list;
    };

    // 3. Double-Helix Quantum Vortex
    const makeHelixNodes = (count: number, radius: number, palette: string[]) => {
      const list = [];
      const helices = 3;
      const steps = Math.floor(count / helices);
      for (let h = 0; h < helices; h++) {
        const strandOffset = (h / helices) * Math.PI * 2;
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const phi = (t - 0.5) * Math.PI;
          const y = Math.sin(phi) * radius;
          const rAtY = Math.cos(phi) * radius;
          const theta = t * Math.PI * 4 + strandOffset;
          const x = Math.cos(theta) * rAtY;
          const z = Math.sin(theta) * rAtY;
          list.push({
            x,
            y,
            z,
            origX: x,
            origY: y,
            origZ: z,
            color: palette[(h + s) % palette.length],
            size: s % 3 === 0 ? 2.5 : 1.3,
            phase: h * 1.5 + t * 4,
          });
        }
      }
      return list;
    };

    // 4. Stellar Pulsar Core
    const makePulsarNodes = (count: number, radius: number, palette: string[]) => {
      const list = [];
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = (0.35 + Math.random() * 0.65) * radius;
        const x = Math.cos(theta) * Math.sin(phi) * r;
        const y = Math.sin(theta) * Math.sin(phi) * r;
        const z = Math.cos(phi) * r;
        list.push({
          x,
          y,
          z,
          origX: x,
          origY: y,
          origZ: z,
          color: palette[i % palette.length],
          size: i % 2 === 0 ? 2.8 : 1.5,
          phase: i * 0.4,
        });
      }
      return list;
    };

    // 5. Holographic Lattice Shell
    const makeLatticeNodes = (count: number, radius: number, palette: string[]) => {
      const list = [];
      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = i % 2 === 0 ? radius : radius * 0.65;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        list.push({
          x,
          y,
          z,
          origX: x,
          origY: y,
          origZ: z,
          color: palette[i % palette.length],
          size: i % 2 === 0 ? 2.2 : 1.6,
          phase: i * 0.3,
        });
      }
      return list;
    };

    // FLEET DEFINITION
    const fleet: FleetSphere3D[] = [
      // 0. FLAGSHIP: Top Quantum Alpha Core (Starts lower in hero, tracks and escorts user down screen)
      {
        id: "flagship",
        name: "CORE 0 // PRIME",
        type: "fibonacci",
        baseRadius: 66,
        palette: ["#06b6d4", "#38bdf8", "#a855f7", "#ffffff", "#22d3ee"],
        primaryColor: "#06b6d4",
        glowColor: "rgba(6, 182, 212, ALPHA)",
        rotSpeedX: 0.012,
        rotSpeedY: 0.016,
        angleX: 0,
        angleY: 0,
        nodes: makeFibonacciNodes(140, 66, ["#06b6d4", "#38bdf8", "#a855f7", "#ffffff", "#22d3ee"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          const initialY = isMobile ? 185 : 210;
          if (scrollY < 300) {
            return {
              x: vw / 2,
              y: initialY - scrollY * 0.25,
              scale: 1.15,
              opacity: 1.0,
            };
          }
          const escortProgress = Math.min(1, (scrollY - 300) / 1000);
          const targetX = isMobile ? vw * 0.85 : vw * 0.92;
          const targetY = isMobile ? 80 : 95;
          const curX = vw / 2 + (targetX - vw / 2) * escortProgress;
          const curY = (initialY - 75) + (targetY - (initialY - 75)) * escortProgress;
          return {
            x: curX,
            y: curY + Math.sin(scrollY * 0.005) * 8,
            scale: 0.95 + Math.min(scrollY / 1500, 0.4),
            opacity: 1.0,
          };
        },
      },

      // 1. LEFT WING: Core α Gyro-Torus (Spawns at scroll > 80, shoots out and scales up)
      {
        id: "left_gyro",
        name: "CORE 1 // GYRO α",
        type: "gyro",
        baseRadius: 46,
        palette: ["#10b981", "#34d399", "#06b6d4", "#a7f3d0", "#ffffff"],
        primaryColor: "#10b981",
        glowColor: "rgba(16, 185, 129, ALPHA)",
        rotSpeedX: 0.016,
        rotSpeedY: 0.022,
        angleX: 0,
        angleY: 0,
        nodes: makeGyroNodes(85, 46, ["#10b981", "#34d399", "#06b6d4", "#a7f3d0", "#ffffff"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          const startY = isMobile ? 185 : 210;
          if (scrollY < 80) return { x: vw / 2 - 35, y: startY, scale: 0, opacity: 0 };
          
          const t = Math.min(1, (scrollY - 80) / 320);
          const startX = vw / 2 - 35;
          const destX = isMobile ? vw * 0.10 : Math.max(70, vw * 0.07);
          const destY = vh * 0.62;

          const extraScale = scrollY > 400 ? Math.min(1.2, (scrollY - 400) / 1200) : 0;

          return {
            x: startX + (destX - startX) * t,
            y: startY + (destY - startY) * t + (scrollY > 400 ? (scrollY - 400) * 0.02 : 0),
            scale: t * (1.0 + extraScale),
            opacity: Math.min(1, t * 1.5),
          };
        },
      },

      // 2. RIGHT WING: Core β Quantum Helix Vortex (Spawns at scroll > 80, shoots out and scales up)
      {
        id: "right_helix",
        name: "CORE 2 // HELIX β",
        type: "helix",
        baseRadius: 46,
        palette: ["#ec4899", "#f43f5e", "#fbbf24", "#f472b6", "#ffffff", "#f97316"],
        primaryColor: "#ec4899",
        glowColor: "rgba(236, 72, 153, ALPHA)",
        rotSpeedX: -0.02,
        rotSpeedY: 0.018,
        angleX: 0,
        angleY: 0,
        nodes: makeHelixNodes(90, 46, ["#ec4899", "#f43f5e", "#fbbf24", "#f472b6", "#ffffff", "#f97316"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          const startY = isMobile ? 185 : 210;
          if (scrollY < 80) return { x: vw / 2 + 35, y: startY, scale: 0, opacity: 0 };

          const t = Math.min(1, (scrollY - 80) / 320);
          const startX = vw / 2 + 35;
          const destX = isMobile ? vw * 0.90 : Math.min(vw - 70, vw * 0.93);
          const destY = vh * 0.62;

          const extraScale = scrollY > 400 ? Math.min(1.2, (scrollY - 400) / 1200) : 0;

          return {
            x: startX + (destX - startX) * t,
            y: startY + (destY - startY) * t + (scrollY > 400 ? (scrollY - 400) * 0.02 : 0),
            scale: t * (1.0 + extraScale),
            opacity: Math.min(1, t * 1.5),
          };
        },
      },

      // 3. MID-FLEET VANGUARD: Core γ Solar Pulsar (Spawns at Features / Agents section, scroll > 550)
      {
        id: "mid_pulsar",
        name: "CORE 3 // PULSAR γ",
        type: "pulsar",
        baseRadius: 38,
        palette: ["#f59e0b", "#fbbf24", "#ef4444", "#ffffff", "#fcd34d"],
        primaryColor: "#f59e0b",
        glowColor: "rgba(245, 158, 11, ALPHA)",
        rotSpeedX: 0.025,
        rotSpeedY: -0.019,
        angleX: 0,
        angleY: 0,
        nodes: makePulsarNodes(75, 38, ["#f59e0b", "#fbbf24", "#ef4444", "#ffffff", "#fcd34d"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          if (scrollY < 550) return { x: vw * 0.15, y: vh, scale: 0, opacity: 0 };

          const t = Math.min(1, (scrollY - 550) / 450);
          const destX = isMobile ? vw * 0.12 : Math.max(80, vw * 0.06);
          const destY = vh * 0.28 + Math.sin(scrollY * 0.004) * 25;
          const extraScale = scrollY > 1100 ? Math.min(1.0, (scrollY - 1100) / 1000) : 0;

          return {
            x: destX,
            y: destY,
            scale: t * (0.85 + extraScale),
            opacity: Math.min(1, t * 1.4),
          };
        },
      },

      // 4. MID-FLEET GUARDIAN: Core δ Holographic Lattice (Spawns at scroll > 850)
      {
        id: "mid_lattice",
        name: "CORE 4 // LATTICE δ",
        type: "fibonacci",
        baseRadius: 38,
        palette: ["#8b5cf6", "#a855f7", "#c084fc", "#38bdf8", "#ffffff"],
        primaryColor: "#8b5cf6",
        glowColor: "rgba(139, 92, 246, ALPHA)",
        rotSpeedX: -0.015,
        rotSpeedY: 0.022,
        angleX: 0,
        angleY: 0,
        nodes: makeLatticeNodes(80, 38, ["#8b5cf6", "#a855f7", "#c084fc", "#38bdf8", "#ffffff"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          if (scrollY < 850) return { x: vw * 0.85, y: vh, scale: 0, opacity: 0 };

          const t = Math.min(1, (scrollY - 850) / 450);
          const destX = isMobile ? vw * 0.88 : Math.min(vw - 80, vw * 0.94);
          const destY = vh * 0.32 + Math.cos(scrollY * 0.004) * 25;
          const extraScale = scrollY > 1400 ? Math.min(1.0, (scrollY - 1400) / 1000) : 0;

          return {
            x: destX,
            y: destY,
            scale: t * (0.85 + extraScale),
            opacity: Math.min(1, t * 1.4),
          };
        },
      },

      // 5. DEEP-FLEET ESCORT: Core ε Neon Ion Sphere (Spawns at Calculator / ROI section, scroll > 1400)
      {
        id: "deep_ion_left",
        name: "CORE 5 // ION ε",
        type: "gyro",
        baseRadius: 36,
        palette: ["#06b6d4", "#22d3ee", "#38bdf8", "#ffffff", "#0284c7"],
        primaryColor: "#06b6d4",
        glowColor: "rgba(6, 182, 212, ALPHA)",
        rotSpeedX: 0.02,
        rotSpeedY: 0.028,
        angleX: 0,
        angleY: 0,
        nodes: makeGyroNodes(70, 36, ["#06b6d4", "#22d3ee", "#38bdf8", "#ffffff", "#0284c7"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          if (scrollY < 1400) return { x: vw * 0.08, y: vh, scale: 0, opacity: 0 };

          const t = Math.min(1, (scrollY - 1400) / 500);
          const destX = isMobile ? vw * 0.08 : Math.max(90, vw * 0.08);
          const destY = vh * 0.82 + Math.sin(scrollY * 0.003) * 20;

          return {
            x: destX,
            y: destY,
            scale: t * (0.9 + Math.min(0.8, (scrollY - 1400) / 1500)),
            opacity: Math.min(1, t * 1.5),
          };
        },
      },

      // 6. DEEP-FLEET SENTINEL: Core ζ Plasma Flare Sphere (Spawns at Comparison / Pricing section, scroll > 1800)
      {
        id: "deep_plasma_right",
        name: "CORE 6 // PLASMA ζ",
        type: "helix",
        baseRadius: 36,
        palette: ["#f43f5e", "#fb7185", "#f97316", "#ffffff", "#f59e0b"],
        primaryColor: "#f43f5e",
        glowColor: "rgba(244, 63, 94, ALPHA)",
        rotSpeedX: -0.024,
        rotSpeedY: 0.016,
        angleX: 0,
        angleY: 0,
        nodes: makeHelixNodes(75, 36, ["#f43f5e", "#fb7185", "#f97316", "#ffffff", "#f59e0b"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          if (scrollY < 1800) return { x: vw * 0.92, y: vh, scale: 0, opacity: 0 };

          const t = Math.min(1, (scrollY - 1800) / 500);
          const destX = isMobile ? vw * 0.92 : Math.min(vw - 90, vw * 0.92);
          const destY = vh * 0.82 + Math.cos(scrollY * 0.003) * 20;

          return {
            x: destX,
            y: destY,
            scale: t * (0.9 + Math.min(0.8, (scrollY - 1800) / 1500)),
            opacity: Math.min(1, t * 1.5),
          };
        },
      },

      // 7. ABYSS DEFENDER: Core η Chrono Warp Sphere (Spawns at FAQ / Footer, scroll > 2200)
      {
        id: "abyss_chrono_left",
        name: "CORE 7 // CHRONO η",
        type: "gyro",
        baseRadius: 35,
        palette: ["#06b6d4", "#a855f7", "#3b82f6", "#ffffff", "#67e8f9"],
        primaryColor: "#3b82f6",
        glowColor: "rgba(59, 130, 246, ALPHA)",
        rotSpeedX: 0.022,
        rotSpeedY: -0.02,
        angleX: 0,
        angleY: 0,
        nodes: makeGyroNodes(70, 35, ["#06b6d4", "#a855f7", "#3b82f6", "#ffffff", "#67e8f9"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          if (scrollY < 2200) return { x: vw * 0.12, y: vh, scale: 0, opacity: 0 };

          const t = Math.min(1, (scrollY - 2200) / 450);
          const destX = isMobile ? vw * 0.10 : Math.max(70, vw * 0.06);
          const destY = vh * 0.5 + Math.sin(scrollY * 0.002) * 15;

          return {
            x: destX,
            y: destY,
            scale: t * 1.0,
            opacity: Math.min(1, t * 1.4),
          };
        },
      },

      // 8. OMEGA SINGULARITY: Core θ Omega Matrix Sphere (Spawns at FAQ / Footer, scroll > 2200)
      {
        id: "omega_matrix_right",
        name: "CORE 8 // OMEGA θ",
        type: "pulsar",
        baseRadius: 35,
        palette: ["#10b981", "#fbbf24", "#06b6d4", "#ffffff", "#34d399"],
        primaryColor: "#10b981",
        glowColor: "rgba(16, 185, 129, ALPHA)",
        rotSpeedX: -0.018,
        rotSpeedY: 0.025,
        angleX: 0,
        angleY: 0,
        nodes: makePulsarNodes(72, 35, ["#10b981", "#fbbf24", "#06b6d4", "#ffffff", "#34d399"]),
        getPosition: (scrollY, docH, vw, vh) => {
          const isMobile = vw < 768;
          if (scrollY < 2200) return { x: vw * 0.88, y: vh, scale: 0, opacity: 0 };

          const t = Math.min(1, (scrollY - 2200) / 450);
          const destX = isMobile ? vw * 0.90 : Math.min(vw - 70, vw * 0.94);
          const destY = vh * 0.5 + Math.cos(scrollY * 0.002) * 15;

          return {
            x: destX,
            y: destY,
            scale: t * 1.0,
            opacity: Math.min(1, t * 1.4),
          };
        },
      },
    ];

    const needleParticles: NeedleStreamParticle[] = [];
    const muzzleParticles: MuzzleFlashParticle[] = [];
    const shockwaves: ShockwaveRing[] = [];

    let time = 0;
    let frame = 0;
    let prevScrollY = 0;
    let muzzleCooldown = 0;

    // Bezier Point Evaluator
    const getBezierPoint = (
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
      const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
      return { x, y };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth scroll interpolation
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.085;
      const scrollY = scrollRef.current;
      const docH = totalPageHeightRef.current;

      time += 0.024;
      frame++;
      if (muzzleCooldown > 0) muzzleCooldown--;

      const initialY = width < 768 ? 185 : 210;
      const topPos = { x: width / 2, y: initialY - Math.min(scrollY * 0.25, 75) };

      // SHOOT ANIMATION TRIGGER:
      // When the user starts scrolling down into the spawn range (80px to 320px) or scrolls rapidly
      const isShootingPhase = scrollY >= 50 && scrollY <= 380;
      const scrollSpeed = Math.abs(scrollY - prevScrollY);
      prevScrollY = scrollY;

      if (isShootingPhase && (scrollSpeed > 0.4 || frame % 12 === 0)) {
        // 1. Generate Shockwave Rings expanding from top sphere
        if (muzzleCooldown === 0 && frame % 15 === 0) {
          shockwaves.push({
            x: topPos.x,
            y: topPos.y,
            radius: 30,
            maxRadius: 130,
            color: frame % 30 === 0 ? "#06b6d4" : frame % 30 === 15 ? "#10b981" : "#ec4899",
            alpha: 0.9,
            lineWidth: 3.5,
          });
          muzzleCooldown = 8;
        }

        // 2. Generate Muzzle Sparks shooting outward to left and right launch vectors
        // Left launch muzzle burst
        for (let i = 0; i < 3; i++) {
          const angle = Math.PI * 0.65 + (Math.random() - 0.5) * 0.6; // Down-left vector
          const speed = 4.5 + Math.random() * 6.5;
          muzzleParticles.push({
            x: topPos.x - 30,
            y: topPos.y + 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: Math.random() > 0.4 ? "#34d399" : "#06b6d4",
            size: 2.5 + Math.random() * 2.5,
            life: 20,
            maxLife: 20,
          });
        }

        // Right launch muzzle burst
        for (let i = 0; i < 3; i++) {
          const angle = Math.PI * 0.35 + (Math.random() - 0.5) * 0.6; // Down-right vector
          const speed = 4.5 + Math.random() * 6.5;
          muzzleParticles.push({
            x: topPos.x + 30,
            y: topPos.y + 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: Math.random() > 0.4 ? "#f472b6" : "#fbbf24",
            size: 2.5 + Math.random() * 2.5,
            life: 20,
            maxLife: 20,
          });
        }
      }

      // 1. INITIAL HERO NEEDLE TRAIL (Only visible when scroll is between 0 and 420px, then completely disappears)
      if (scrollY < 420) {
        const needleProgress = Math.min(1, Math.max(0, (scrollY - 40) / 180)); // travel completion
        const needleAlpha = scrollY > 180 ? Math.max(0, 1 - (scrollY - 180) / 180) : scrollY > 40 ? 1.0 : 0;

        if (needleProgress > 0.01 && needleAlpha > 0.01) {
          const leftP0 = { x: topPos.x - 35, y: topPos.y + 35 };
          const leftP1 = { x: width * 0.22, y: topPos.y + 70 };
          const leftP2 = { x: width < 768 ? width * 0.05 : width * 0.03, y: height * 0.42 };
          const leftP3 = { x: width < 768 ? width * 0.10 : Math.max(70, width * 0.07), y: height * 0.62 };

          const rightP0 = { x: topPos.x + 35, y: topPos.y + 35 };
          const rightP1 = { x: width * 0.78, y: topPos.y + 70 };
          const rightP2 = { x: width < 768 ? width * 0.95 : width * 0.97, y: height * 0.42 };
          const rightP3 = { x: width < 768 ? width * 0.90 : Math.min(width - 70, width * 0.93), y: height * 0.62 };

          const steps = 40;
          const currentSteps = Math.floor(steps * needleProgress);

          // Left Needle Laser
          ctx.beginPath();
          ctx.moveTo(leftP0.x, leftP0.y);
          for (let i = 1; i <= currentSteps; i++) {
            const t = (i / steps) * needleProgress;
            const pt = getBezierPoint(leftP0, leftP1, leftP2, leftP3, t);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.strokeStyle = `rgba(16, 185, 129, ${(0.7 * needleAlpha).toFixed(3)})`;
          ctx.lineWidth = 3.8;
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 18 * needleAlpha;
          ctx.stroke();

          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.95 * needleAlpha).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Right Needle Laser
          ctx.beginPath();
          ctx.moveTo(rightP0.x, rightP0.y);
          for (let i = 1; i <= currentSteps; i++) {
            const t = (i / steps) * needleProgress;
            const pt = getBezierPoint(rightP0, rightP1, rightP2, rightP3, t);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.strokeStyle = `rgba(236, 72, 153, ${(0.7 * needleAlpha).toFixed(3)})`;
          ctx.lineWidth = 3.8;
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 18 * needleAlpha;
          ctx.stroke();

          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.95 * needleAlpha).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Needle stream particle emission
          if (frame % 2 === 0 && needleAlpha > 0.1) {
            needleParticles.push({
              path: "left",
              t: 0,
              speed: 0.045,
              size: 2.2,
              color: "#34d399",
              alpha: needleAlpha,
              jitterX: (Math.random() - 0.5) * 3,
              jitterY: (Math.random() - 0.5) * 3,
            });
            needleParticles.push({
              path: "right",
              t: 0,
              speed: 0.045,
              size: 2.2,
              color: "#f472b6",
              alpha: needleAlpha,
              jitterX: (Math.random() - 0.5) * 3,
              jitterY: (Math.random() - 0.5) * 3,
            });
          }

          // Render & update needle particles
          for (let i = needleParticles.length - 1; i >= 0; i--) {
            const p = needleParticles[i];
            p.t += p.speed;
            if (p.t >= needleProgress || p.t >= 1) {
              needleParticles.splice(i, 1);
              continue;
            }
            const pts = p.path === "left" ? [leftP0, leftP1, leftP2, leftP3] : [rightP0, rightP1, rightP2, rightP3];
            const pt = getBezierPoint(pts[0], pts[1], pts[2], pts[3], p.t);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * needleAlpha;
            ctx.beginPath();
            ctx.arc(pt.x + p.jitterX, pt.y + p.jitterY, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;
        }
      }

      // 2. RENDER SHOCKWAVE EXPANSIONS FROM TOP SPHERE (Shooting Animation Effect)
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 3.8;
        sw.alpha *= 0.91;
        sw.lineWidth *= 0.95;

        if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = sw.color;
        ctx.lineWidth = Math.max(0.8, sw.lineWidth);
        ctx.globalAlpha = sw.alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1.0;

      // 3. RENDER MUZZLE FLASH SPARKS (Shooting Animation Effect)
      for (let i = muzzleParticles.length - 1; i >= 0; i--) {
        const mp = muzzleParticles[i];
        mp.life--;
        mp.x += mp.vx;
        mp.y += mp.vy;
        mp.vx *= 0.94;
        mp.vy *= 0.94;

        const a = Math.max(0, mp.life / mp.maxLife);
        if (mp.life <= 0) {
          muzzleParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = mp.color;
        ctx.globalAlpha = a;
        ctx.shadowColor = mp.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, mp.size * a, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1.0;

      // 4. RENDER THE QUANTUM FLEET SPHERES
      fleet.forEach((sphere) => {
        // Update 3D rotation angles
        sphere.angleX += sphere.rotSpeedX;
        sphere.angleY += sphere.rotSpeedY;

        // Compute viewport position, scale, and opacity for this scroll state
        const pos = sphere.getPosition(scrollY, docH, width, height);
        if (pos.opacity <= 0.01 || pos.scale <= 0.02) return;

        // Dynamic recoil / pulsing when flagship shoots
        let recoilBonus = 0;
        if (sphere.id === "flagship" && isShootingPhase) {
          recoilBonus = Math.sin(time * 18) * 4; // High frequency tactical recoil vibration
        }

        const curRadius = (sphere.baseRadius + recoilBonus) * pos.scale * (1 + Math.sin(time * 3.5 + sphere.baseRadius) * 0.04);

        // Core Glowing Aura
        const aura = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, curRadius * 1.55);
        aura.addColorStop(0, sphere.glowColor.replace("ALPHA", String(0.45 * pos.opacity)));
        aura.addColorStop(0.6, sphere.glowColor.replace("ALPHA", String(0.12 * pos.opacity)));
        aura.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, curRadius * 1.55, 0, Math.PI * 2);
        ctx.fill();

        // 3D Nodes Projection
        const projected = sphere.nodes.map((node) => {
          const wave = Math.sin(time * 3 + node.phase) * (curRadius * 0.06);
          const dir = Math.sqrt(node.origX * node.origX + node.origY * node.origY + node.origZ * node.origZ) || 1;
          const scaleRad = (curRadius + wave) / dir;

          const nx = node.origX * scaleRad;
          const ny = node.origY * scaleRad;
          const nz = node.origZ * scaleRad;

          // Rotate X
          const cosX = Math.cos(sphere.angleX);
          const sinX = Math.sin(sphere.angleX);
          const y1 = ny * cosX - nz * sinX;
          const z1 = ny * sinX + nz * cosX;

          // Rotate Y
          const cosY = Math.cos(sphere.angleY);
          const sinY = Math.sin(sphere.angleY);
          const x2 = nx * cosY + z1 * sinY;
          const z2 = -nx * sinY + z1 * cosY;

          const fov = 170;
          const scaleProj = fov / (fov + z2 + 40);
          const px = pos.x + x2 * scaleProj;
          const py = pos.y + y1 * scaleProj;
          const alpha = Math.max(0.2, Math.min(1.0, (z2 + curRadius) / (curRadius * 2))) * pos.opacity;

          return {
            px,
            py,
            z: z2,
            alpha,
            color: node.color,
            size: node.size * scaleProj * Math.min(pos.scale, 1.4),
          };
        });

        projected.sort((a, b) => a.z - b.z);

        // Lattice lines connecting nearby nodes
        const maxDist = curRadius * 0.52;
        ctx.lineWidth = Math.max(0.7, 0.9 * pos.scale);
        for (let i = 0; i < projected.length; i++) {
          const p1 = projected[i];
          if (p1.z < -curRadius * 0.45) continue;

          let conn = 0;
          for (let j = i + 1; j < projected.length && conn < 2; j++) {
            const p2 = projected[j];
            const dx = p1.px - p2.px;
            const dy = p1.py - p2.py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              conn++;
              const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.55;
              ctx.strokeStyle = sphere.glowColor.replace("ALPHA", String(lineAlpha.toFixed(3)));
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }

        // Render 3D nodes
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.px, p.py, Math.max(0.9, p.size), 0, Math.PI * 2);
          ctx.fill();

          if (p.size > 2.0 && p.alpha > 0.6) {
            ctx.beginPath();
            ctx.arc(p.px, p.py, p.size * 1.6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fill();
          }
        }

        // Planetary Orbit Rings
        ctx.globalAlpha = pos.opacity * 0.65;
        ctx.strokeStyle = sphere.primaryColor;
        ctx.lineWidth = 1.2 * Math.min(pos.scale, 1.4);
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, curRadius * 1.35, curRadius * 0.4, sphere.angleY, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1.0;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [viewSize]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-10 overflow-hidden ${className}`}
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Floating HUD Fleet Status Indicator */}
      <div className="fixed top-20 right-4 md:right-8 px-3 py-1 rounded-full bg-black/85 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-[10px] font-mono text-cyan-300 z-30 flex items-center gap-2 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-bold tracking-wider">
          FLEET ONLINE: {activeFleetCount} / 9 CORES
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-emerald-400 font-bold">
          {Math.round(scrollProgress * 100)}% DEPTH
        </span>
      </div>

      {/* Fullscreen Fixed Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
        className="w-full h-full block"
      />
    </div>
  );
};
