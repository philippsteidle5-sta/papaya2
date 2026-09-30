import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import {
  Sparkles,
  Globe,
  Search,
  FileText,
  MessageSquare,
  ArrowRight,
  Lock,
  X,
  Cpu,
  Palette,
  Brain,
  Mic,
  Smartphone,
} from "lucide-react";
import { AgentConfig } from "../types";
import { UserRole, isAgentAllowed, getMinRequiredRoleForAgent } from "../rbac";
import { AgentCinematicShowcaseModal } from "./AgentCinematicShowcaseModal";
import { SyntaxSpatialGenesisAnimation } from "./SyntaxSpatialGenesisAnimation";
import { useTheme } from "../utils/themeStore";
import { PWAInstallButton } from "./PWAInstallButton";

interface AgentConstellationScreenProps {
  agents: AgentConfig[];
  currentAgentId: string;
  onSelectAgentAndStart: (agentId: string) => void;
  onCloseConstellation?: () => void;
  onOpenMultiAgentChat?: () => void;
  onOpenLandingPage?: () => void;
  onOpenMobileVoice?: () => void;
  userRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
  onOpenRoleManager?: () => void;
  onOpenTutorial?: () => void;
  onOpenAgentInspector?: (agentId?: string) => void;
}

interface ConstellationNode {
  id: string;
  name: string;
  sub: string;
  short: string;
  color: number;
  hexColor: string;
  x: number;
  y: number;
  z?: number;
  isCenter?: boolean;
  pos: THREE.Vector3;
}

export const AgentConstellationScreen: React.FC<AgentConstellationScreenProps> = ({
  agents,
  currentAgentId,
  onSelectAgentAndStart,
  onCloseConstellation,
  onOpenMultiAgentChat,
  onOpenLandingPage,
  userRole = "SOVEREIGN" as UserRole,
  onOpenRoleManager,
  onOpenTutorial,
  onOpenAgentInspector,
  onOpenMobileVoice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, isModern } = useTheme();
  const isModernRef = useRef(isModern);
  isModernRef.current = isModern;

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedAnimId, setSelectedAnimId] = useState<string | null>(null);
  const [showShowcaseModal, setShowShowcaseModal] = useState<boolean>(false);
  const [showGenesisAnimation, setShowGenesisAnimation] = useState<boolean>(false);

  // Direct DOM refs for 60fps label positioning without React re-render flooding
  const primaryLabelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Stable callback refs
  const onSelectAgentRef = useRef(onSelectAgentAndStart);
  onSelectAgentRef.current = onSelectAgentAndStart;
  const onOpenRoleManagerRef = useRef(onOpenRoleManager);
  onOpenRoleManagerRef.current = onOpenRoleManager;
  const onOpenAgentInspectorRef = useRef(onOpenAgentInspector);
  onOpenAgentInspectorRef.current = onOpenAgentInspector;

  const [topbarVisible, setTopbarVisible] = useState<boolean>(true);

  // Sound generator helper for Sci-Fi HUD interactions
  const playHudSound = (freq = 440, type: OscillatorType = "sine", duration = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  };

  // 1. Definition of Pure 8-Core Matrix (PAPAYA = Pure Luminous Warm Orange/Amber, VEGA = Pure Vivid Red)
  const CENTER_DEF: ConstellationNode = useMemo(
    () => ({
      id: "maze",
      name: "PAPAYA",
      sub: "SOVEREIGN CORE",
      short: "PAPAYA",
      color: 0xff6b35,
      hexColor: "#ff6b35",
      x: 0,
      y: 0,
      isCenter: true,
      pos: new THREE.Vector3(0, 0, 0),
    }),
    []
  );

  const SATELLITES_DEF: ConstellationNode[] = useMemo(
    () => [
      { id: "neo", name: "N.E.O.", sub: "VISION CORE", short: "NEO", color: 0xff2d95, hexColor: "#ff2d95", x: -6.4, y: 3.6, pos: new THREE.Vector3(-6.4, 3.6, 0.4) },
      { id: "globe", name: "G.L.O.B.E.", sub: "DEEP SEARCH", short: "GLOBE", color: 0x3b82f6, hexColor: "#3b82f6", x: 0.0, y: 4.8, pos: new THREE.Vector3(0.0, 4.8, -0.2) },
      { id: "vega", name: "V.E.G.A.", sub: "TACTICAL", short: "VEGA", color: 0xff2222, hexColor: "#ff2222", x: 6.4, y: 3.6, pos: new THREE.Vector3(6.4, 3.6, 0.3) },
      { id: "oracle", name: "O.R.A.C.L.E.", sub: "MARKET LATTICE", short: "ORACLE", color: 0x22c55e, hexColor: "#22c55e", x: -9.0, y: -0.2, pos: new THREE.Vector3(-9.0, -0.2, -0.1) },
      { id: "odin", name: "O.D.I.N.", sub: "EXECUTIVE", short: "ODIN", color: 0xe2f1ff, hexColor: "#e2f1ff", x: 9.0, y: -0.2, pos: new THREE.Vector3(9.0, -0.2, 0.2) },
      { id: "chronos", name: "C.H.R.O.N.O.S.", sub: "TEMPORAL", short: "CHRONOS", color: 0xeab308, hexColor: "#eab308", x: -5.8, y: -4.2, pos: new THREE.Vector3(-5.8, -4.2, 0.1) },
      { id: "pulse", name: "P.U.L.S.E.", sub: "VIRAL NETWORK", short: "PULSE", color: 0xa855f7, hexColor: "#a855f7", x: 5.8, y: -4.2, pos: new THREE.Vector3(5.8, -4.2, -0.3) },
    ],
    []
  );

  const allPrimaryNodes = useMemo(() => [CENTER_DEF, ...SATELLITES_DEF], [CENTER_DEF, SATELLITES_DEF]);

  // Main Three.js Engine Lifecycle
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    let animFrameId: number;

    const W = () => mount.clientWidth || window.innerWidth;
    const H = () => mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = null; // Transparent to allow CSS canvas theme gradients

    const camera = new THREE.PerspectiveCamera(46, W() / H(), 0.1, 500);
    camera.position.set(0, 1.2, 33);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    mount.appendChild(renderer.domElement);

    // Helpers to create glowing radial gradient textures
    function makeGlowTexture(hexColor: number) {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);
      const col = new THREE.Color(hexColor);
      const r = Math.floor(col.r * 255);
      const g = Math.floor(col.g * 255);
      const b = Math.floor(col.b * 255);
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, `rgba(${r},${g},${b},1.0)`);
      grad.addColorStop(0.25, `rgba(${r},${g},${b},0.65)`);
      grad.addColorStop(0.6, `rgba(${r},${g},${b},0.15)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }

    function makeDotTexture(hexColor: number) {
      const size = 64;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);
      const col = new THREE.Color(hexColor);
      const r = Math.floor(col.r * 255);
      const g = Math.floor(col.g * 255);
      const b = Math.floor(col.b * 255);
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.7, `rgba(${r},${g},${b},0.2)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }

    function makeCircularSpriteTexture(tint = "rgba(0, 240, 255, 0.7)") {
      const size = 64;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return undefined;
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.2, "rgba(255, 255, 255, 0.9)");
      grad.addColorStop(0.5, tint);
      grad.addColorStop(0.85, "rgba(0, 0, 0, 0.05)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    const cyanGlowTex = makeCircularSpriteTexture("rgba(0, 240, 255, 0.7)");
    const purpleGlowTex = makeCircularSpriteTexture("rgba(168, 85, 247, 0.7)");
    const whiteGlowTex = makeCircularSpriteTexture("rgba(230, 240, 255, 0.6)");

    // --- CYBERPUNK BACKGROUND ELEMENTS ---
    // 1. Cyberpunk Grid Texture
    function makeCyberGridTexture() {
      const size = 512;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);
      ctx.strokeStyle = "rgba(0,240,255,0.28)";
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x <= size; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }
      for (let y = 0; y <= size; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      return tex;
    }

    const cyberFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(130, 130),
      new THREE.MeshBasicMaterial({
        map: makeCyberGridTexture(),
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      })
    );
    cyberFloor.rotation.x = -Math.PI / 2.35;
    cyberFloor.position.y = -9.2;
    cyberFloor.position.z = -4;
    scene.add(cyberFloor);

    // 2. Cyberpunk Neon Embers Particle System (Multi-hued energetic sparks)
    const CYBER_DUST_COUNT = 700;
    const cyberDustGeo = new THREE.BufferGeometry();
    const cyberDustPos = new Float32Array(CYBER_DUST_COUNT * 3);
    const cyberDustCol = new Float32Array(CYBER_DUST_COUNT * 3);
    const cyberDustVel: { x: number; y: number; z: number; phase: number }[] = [];

    const cyberPalette = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xff2d95), // Magenta
      new THREE.Color(0x3b82f6), // Electric Blue
      new THREE.Color(0x22c55e), // Green
      new THREE.Color(0xeab308), // Gold
      new THREE.Color(0xa855f7), // Purple
      new THREE.Color(0xffffff), // Stardust
    ];

    for (let i = 0; i < CYBER_DUST_COUNT; i++) {
      cyberDustPos[i * 3] = (Math.random() - 0.5) * 58;
      cyberDustPos[i * 3 + 1] = (Math.random() - 0.5) * 38;
      cyberDustPos[i * 3 + 2] = (Math.random() - 0.5) * 42 - 5;
      const col = cyberPalette[i % cyberPalette.length];
      cyberDustCol[i * 3] = col.r;
      cyberDustCol[i * 3 + 1] = col.g;
      cyberDustCol[i * 3 + 2] = col.b;

      cyberDustVel.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.006 + 0.003,
        z: (Math.random() - 0.5) * 0.004,
        phase: Math.random() * Math.PI * 2,
      });
    }
    cyberDustGeo.setAttribute("position", new THREE.BufferAttribute(cyberDustPos, 3));
    cyberDustGeo.setAttribute("color", new THREE.BufferAttribute(cyberDustCol, 3));

    const cyberDustMat = new THREE.PointsMaterial({
      size: 0.16,
      map: cyanGlowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cyberDustPoints = new THREE.Points(cyberDustGeo, cyberDustMat);
    scene.add(cyberDustPoints);

    // 3. Cyberpunk Nebula Cosmic Atmospheric Sprites
    const cyberNebulaGroup = new THREE.Group();
    const cyberNebulaCyan = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(0x00f0ff),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    cyberNebulaCyan.scale.set(42, 30, 1);
    cyberNebulaCyan.position.set(-8, 3, -12);
    cyberNebulaGroup.add(cyberNebulaCyan);

    const cyberNebulaMagenta = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(0xff2d95),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    cyberNebulaMagenta.scale.set(38, 28, 1);
    cyberNebulaMagenta.position.set(9, -2, -14);
    cyberNebulaGroup.add(cyberNebulaMagenta);
    scene.add(cyberNebulaGroup);

    // --- MODERN BACKGROUND ELEMENTS ---
    // 1. Modern Concentric Studio Platform
    function makeModernPlatformTexture() {
      const size = 512;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);

      const center = size / 2;
      ctx.clearRect(0, 0, size, size);

      // Concentric orbital rings
      const rings = [60, 120, 180, 230];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? "rgba(168, 85, 247, 0.4)" : "rgba(140, 150, 180, 0.18)";
        ctx.lineWidth = idx === 1 ? 1.5 : 1;
        if (idx % 2 === 0) {
          ctx.setLineDash([8, 8]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
      });

      // Axis cross markers
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(center, 10);
      ctx.lineTo(center, size - 10);
      ctx.moveTo(10, center);
      ctx.lineTo(size - 10, center);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    const modernFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshBasicMaterial({
        map: makeModernPlatformTexture(),
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      })
    );
    modernFloor.rotation.x = -Math.PI / 2.4;
    modernFloor.position.y = -8.5;
    modernFloor.position.z = -3;
    scene.add(modernFloor);

    // 2. Modern Studio Deep Purple Backdrop Ambient Halo
    const modernStudioAura = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(0x7c3aed),
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    modernStudioAura.scale.set(48, 38, 1);
    modernStudioAura.position.set(0, 1, -12);
    scene.add(modernStudioAura);

    // 3. Modern Luxury Stardust (Sleek monochrome / lavender quartz particles)
    const MODERN_DUST_COUNT = 450;
    const modernDustGeo = new THREE.BufferGeometry();
    const modernDustPos = new Float32Array(MODERN_DUST_COUNT * 3);
    const modernDustVel: { x: number; y: number; z: number; phase: number }[] = [];

    for (let i = 0; i < MODERN_DUST_COUNT; i++) {
      modernDustPos[i * 3] = (Math.random() - 0.5) * 52;
      modernDustPos[i * 3 + 1] = (Math.random() - 0.5) * 34;
      modernDustPos[i * 3 + 2] = (Math.random() - 0.5) * 36 - 4;

      modernDustVel.push({
        x: (Math.random() - 0.5) * 0.002,
        y: (Math.random() - 0.5) * 0.003 + 0.0015,
        z: (Math.random() - 0.5) * 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }
    modernDustGeo.setAttribute("position", new THREE.BufferAttribute(modernDustPos, 3));
    const modernDustMat = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.09,
      map: whiteGlowTex,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const modernDustPoints = new THREE.Points(modernDustGeo, modernDustMat);
    scene.add(modernDustPoints);

    // 3. Build 8 Rich Multi-Layered Particle Orb Balls
    interface CoreBallInstance {
      node: ConstellationNode;
      group: THREE.Group;
      innerDenseBall: THREE.Points;
      outerAuraBall: THREE.Points;
      orbitalRings: THREE.Points[];
      energyGlow: THREE.Sprite;
      coronaGlow: THREE.Sprite;
      baseGlowScale: number;
      hover: number;
      targetHover: number;
      bootDelay: number;
      rotationSpeeds: { x: number; y: number; z: number };
    }

    const cores: CoreBallInstance[] = allPrimaryNodes.map((node, index) => {
      const scale = node.isCenter ? 2.1 : 1.15;
      const group = new THREE.Group();
      group.position.copy(node.pos);
      group.scale.setScalar(0.0001);
      scene.add(group);

      // A. Inner high-density particle orb sphere (Solid glowing core)
      const INNER_COUNT = node.isCenter ? 620 : 320;
      const innerGeo = new THREE.BufferGeometry();
      const innerPos = new Float32Array(INNER_COUNT * 3);
      for (let p = 0; p < INNER_COUNT; p++) {
        // Uniform sphere distribution with slight radial jitter
        const rr = (0.5 + (Math.random() - 0.5) * 0.12) * scale;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        innerPos[p * 3] = rr * Math.sin(theta) * Math.cos(phi);
        innerPos[p * 3 + 1] = rr * Math.sin(theta) * Math.sin(phi);
        innerPos[p * 3 + 2] = rr * Math.cos(theta);
      }
      innerGeo.setAttribute("position", new THREE.BufferAttribute(innerPos, 3));
      const innerMat = new THREE.PointsMaterial({
        color: node.color,
        size: node.isCenter ? 0.065 : 0.05,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const innerDenseBall = new THREE.Points(innerGeo, innerMat);
      group.add(innerDenseBall);

      // B. Outer pulsating quantum aura shell
      const OUTER_COUNT = node.isCenter ? 360 : 180;
      const outerGeo = new THREE.BufferGeometry();
      const outerPos = new Float32Array(OUTER_COUNT * 3);
      for (let p = 0; p < OUTER_COUNT; p++) {
        const rr = (0.8 + (Math.random() - 0.5) * 0.18) * scale;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        outerPos[p * 3] = rr * Math.sin(theta) * Math.cos(phi);
        outerPos[p * 3 + 1] = rr * Math.sin(theta) * Math.sin(phi);
        outerPos[p * 3 + 2] = rr * Math.cos(theta);
      }
      outerGeo.setAttribute("position", new THREE.BufferAttribute(outerPos, 3));
      const outerMat = new THREE.PointsMaterial({
        color: node.color,
        size: node.isCenter ? 0.045 : 0.038,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const outerAuraBall = new THREE.Points(outerGeo, outerMat);
      group.add(outerAuraBall);

      // C. Multi-axis glowing orbital particle rings
      const orbitalRings: THREE.Points[] = [];
      const ringConfigs = node.isCenter
        ? [
            { rx: 1.45 * scale, ry: 0.55 * scale, tiltX: 0.4, tiltZ: 0.2, speed: 0.012 },
            { rx: 1.25 * scale, ry: 0.95 * scale, tiltX: -0.5, tiltZ: -0.6, speed: -0.01 },
            { rx: 1.65 * scale, ry: 0.45 * scale, tiltX: 0.8, tiltZ: 0.9, speed: 0.016 },
          ]
        : [
            { rx: 1.25, ry: 0.45, tiltX: 0.4, tiltZ: (Math.random() - 0.5) * 0.8, speed: 0.014 },
            { rx: 1.1, ry: 0.85, tiltX: -0.6, tiltZ: (Math.random() - 0.5) * 0.6, speed: -0.011 },
          ];

      ringConfigs.forEach((rc) => {
        const PTS = 72;
        const rGeo = new THREE.BufferGeometry();
        const rPos = new Float32Array(PTS * 3);
        for (let p = 0; p < PTS; p++) {
          const a = (p / PTS) * Math.PI * 2;
          rPos[p * 3] = Math.cos(a) * rc.rx;
          rPos[p * 3 + 1] = Math.sin(a) * rc.ry;
          rPos[p * 3 + 2] = (Math.random() - 0.5) * 0.05;
        }
        rGeo.setAttribute("position", new THREE.BufferAttribute(rPos, 3));
        const rMat = new THREE.PointsMaterial({
          color: node.color,
          size: 0.038,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const ring = new THREE.Points(rGeo, rMat);
        ring.rotation.x = rc.tiltX;
        ring.rotation.z = rc.tiltZ;
        group.add(ring);
        orbitalRings.push(ring);
      });

      // D. Layer 1: Core Intense Radial Sprite Glow
      const energyGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeGlowTexture(node.color),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0,
        })
      );
      const glowScale = node.isCenter ? 4.8 : 2.7;
      energyGlow.scale.set(glowScale, glowScale, 1);
      group.add(energyGlow);

      // E. Layer 2: Wide Atmospheric Corona Glow
      const coronaGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeGlowTexture(node.color),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0,
        })
      );
      const coronaScale = glowScale * 1.8;
      coronaGlow.scale.set(coronaScale, coronaScale, 1);
      group.add(coronaGlow);

      return {
        node,
        group,
        innerDenseBall,
        outerAuraBall,
        orbitalRings,
        energyGlow,
        coronaGlow,
        baseGlowScale: glowScale,
        hover: 0,
        targetHover: 0,
        bootDelay: node.isCenter ? 0 : 0.12 + index * 0.08,
        rotationSpeeds: {
          x: (Math.random() - 0.5) * 0.006,
          y: (Math.random() * 0.008 + 0.006) * (node.isCenter ? 1.4 : 1.0),
          z: (Math.random() - 0.5) * 0.006,
        },
      };
    });

    // 4. Matrix Inter-Core Neural Beam Network
    const linkGroup = new THREE.Group();
    scene.add(linkGroup);
    interface LinkItem {
      line: THREE.Line;
      a: number;
      b: number;
      isSpoke: boolean;
      baseOpacity: number;
      delay: number;
    }
    const links: LinkItem[] = [];

    for (let i = 0; i < allPrimaryNodes.length; i++) {
      for (let j = i + 1; j < allPrimaryNodes.length; j++) {
        const a = allPrimaryNodes[i];
        const b = allPrimaryNodes[j];
        const isSpoke = a.isCenter || b.isCenter;
        const geo = new THREE.BufferGeometry().setFromPoints([a.pos, b.pos]);
        const spokeColor = a.isCenter ? b.color : a.color;
        const mat = new THREE.LineBasicMaterial({
          color: isSpoke ? spokeColor : 0x1a3348,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(geo, mat);
        linkGroup.add(line);
        links.push({
          line,
          a: i,
          b: j,
          isSpoke,
          baseOpacity: isSpoke ? 0.65 : 0.15,
          delay: isSpoke ? 0.25 + Math.random() * 0.25 : 0.7 + Math.random() * 0.4,
        });
      }
    }

    // 5. Traveling Quantum Light Bullets along spoke vectors
    const spokes = links.filter((l) => l.isSpoke);
    const packets = spokes.map((l, idx) => {
      const destNode = allPrimaryNodes[l.a].isCenter ? allPrimaryNodes[l.b] : allPrimaryNodes[l.a];
      const mat = new THREE.SpriteMaterial({
        map: makeDotTexture(destNode.color),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.45, 0.45, 1);
      scene.add(sprite);
      return {
        sprite,
        link: l,
        dest: destNode,
        phase: idx * 0.3,
        speed: 0.4 + Math.random() * 0.2,
      };
    });

    // 6. Hit Meshes for accurate Raycasting (Generous hit radius for easy clicking)
    const hitMeshes = allPrimaryNodes.map((n) => {
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(n.isCenter ? 2.5 : 1.6, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.copy(n.pos);
      scene.add(hit);
      return hit;
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredIndex = -1;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObjects(hitMeshes);
      const newHoveredIdx = hits.length ? hitMeshes.indexOf(hits[0].object as any) : -1;

      if (newHoveredIdx !== hoveredIndex) {
        hoveredIndex = newHoveredIdx;
        if (hoveredIndex !== -1) {
          const hovered = allPrimaryNodes[hoveredIndex];
          setHoveredNodeId(hovered.id);
          playHudSound(600, "sine", 0.04);
        } else {
          setHoveredNodeId(null);
        }
      }
    };

    const handleMouseLeave = () => {
      hoveredIndex = -1;
      setHoveredNodeId(null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObjects(hitMeshes);
      const clickedIdx = hits.length ? hitMeshes.indexOf(hits[0].object as any) : hoveredIndex;

      if (clickedIdx !== -1) {
        const targetNode = allPrimaryNodes[clickedIdx];
        setSelectedAnimId(targetNode.id);
        setHoveredNodeId(targetNode.id);
        playHudSound(880, "sawtooth", 0.15);
        if (onSelectAgentRef.current) {
          onSelectAgentRef.current(targetNode.id);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseleave", handleMouseLeave);
    renderer.domElement.addEventListener("click", handleClick);

    // Animation Loop
    const startTime = performance.now();
    let t = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;
      t += 0.01;

      const modern = isModernRef.current;

      // Theme layer visibility
      cyberFloor.visible = !modern;
      cyberNebulaGroup.visible = !modern;
      cyberDustPoints.visible = !modern;

      modernFloor.visible = modern;
      modernStudioAura.visible = modern;
      modernDustPoints.visible = modern;

      scene.rotation.y = Math.sin(t * 0.05) * 0.04;
      if (!modern) {
        cyberFloor.rotation.z += 0.0006;
      } else {
        modernFloor.rotation.z += 0.0003;
      }

      // Animate particles
      if (!modern) {
        const cDustArr = cyberDustGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < CYBER_DUST_COUNT; i++) {
          const v = cyberDustVel[i];
          cDustArr[i * 3 + 1] += Math.sin(t + v.phase) * 0.004 + v.y;
          cDustArr[i * 3] += Math.cos(t * 0.5 + v.phase) * 0.003;
          if (cDustArr[i * 3 + 1] > 20) cDustArr[i * 3 + 1] = -20;
        }
        cyberDustGeo.attributes.position.needsUpdate = true;
      } else {
        const mDustArr = modernDustGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < MODERN_DUST_COUNT; i++) {
          const v = modernDustVel[i];
          mDustArr[i * 3 + 1] += Math.sin(t + v.phase) * 0.002 + v.y;
          mDustArr[i * 3] += Math.cos(t * 0.4 + v.phase) * 0.0015;
          if (mDustArr[i * 3 + 1] > 18) mDustArr[i * 3 + 1] = -18;
        }
        modernDustGeo.attributes.position.needsUpdate = true;
      }

      // Project Primary Core Coordinates directly to DOM elements & update balls
      cores.forEach((c, i) => {
        const bootT = Math.min(1, Math.max(0, (elapsed - c.bootDelay) / 0.6));
        const eased = 1 - Math.pow(1 - bootT, 3);

        c.targetHover = i === hoveredIndex ? 1 : 0;
        c.hover += (c.targetHover - c.hover) * 0.1;

        // Spherical rotation
        c.innerDenseBall.rotation.y += c.rotationSpeeds.y * (1 + c.hover * 2);
        c.innerDenseBall.rotation.x += c.rotationSpeeds.x;
        c.outerAuraBall.rotation.y -= c.rotationSpeeds.y * 0.7 * (1 + c.hover * 1.5);
        c.outerAuraBall.rotation.z += 0.004;

        // Orbital rings rotation
        c.orbitalRings.forEach((ring, ri) => {
          ring.rotation.y += (0.01 + ri * 0.006) * (1 + c.hover * 2.2);
          ring.rotation.x += 0.003 * (ri % 2 === 0 ? 1 : -1);
        });

        // Dynamic pulsing breathing energy
        const pulse = Math.sin(t * 1.8 + i * 1.2) * (c.node.isCenter ? 0.38 : 0.22);
        const curGlowScale = c.baseGlowScale + pulse + c.hover * (c.node.isCenter ? 1.4 : 0.9);
        c.energyGlow.scale.setScalar(curGlowScale);
        c.energyGlow.material.opacity = eased * (0.65 + c.hover * 0.35);

        c.coronaGlow.scale.setScalar(curGlowScale * 1.8 + Math.sin(t * 0.9 + i) * 0.3);
        c.coronaGlow.material.opacity = eased * (0.2 + c.hover * 0.25);

        c.group.scale.setScalar(eased * (1 + c.hover * 0.15));
        if (!c.node.isCenter) {
          c.group.position.z = c.node.pos.z + Math.sin(t * 0.6 + i * 1.5) * 0.25;
        }

        const yOff = c.node.isCenter ? 2.5 : 1.6;
        const lp = c.group.position.clone().add(new THREE.Vector3(0, -yOff, 0));
        lp.project(camera);
        const scrX = (lp.x * 0.5 + 0.5) * W();
        const scrY = (-lp.y * 0.5 + 0.5) * H();
        const op = eased * (i === hoveredIndex ? 1 : 0.85);

        const el = primaryLabelRefs.current[c.node.id];
        if (el) {
          el.style.left = `${scrX}px`;
          el.style.top = `${scrY}px`;
          el.style.opacity = `${op}`;
        }
      });

      // Links update
      links.forEach((l) => {
        const bootT = Math.min(1, Math.max(0, (elapsed - l.delay) / 0.7));
        let target = l.baseOpacity * bootT;
        if (hoveredIndex !== -1 && (l.a === hoveredIndex || l.b === hoveredIndex)) {
          target = (l.isSpoke ? 0.95 : 0.55) * bootT;
        }
        const lineMat = l.line.material as THREE.LineBasicMaterial;
        lineMat.opacity += (target - lineMat.opacity) * 0.12;
      });

      // Animate data packets
      packets.forEach((p) => {
        const bootReady = elapsed > 1.2;
        const speedMult = hoveredIndex !== -1 && allPrimaryNodes.indexOf(p.dest) === hoveredIndex ? 2.4 : 1;
        const phase = (elapsed * p.speed * speedMult + p.phase) % 1;
        const from = allPrimaryNodes[0].pos;
        const to = p.dest.pos;
        p.sprite.position.lerpVectors(from, to, phase);
        const fade = Math.sin(phase * Math.PI);
        p.sprite.material.opacity = bootReady ? fade * 0.95 : 0;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mouseleave", handleMouseLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      cancelAnimationFrame(animFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [allPrimaryNodes]);

  const activeHoveredAgent = agents.find((a) => a.id === (hoveredNodeId || currentAgentId)) || agents[0];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 font-mono select-none overflow-hidden transition-colors duration-700 ${
        isModern
          ? "bg-[radial-gradient(ellipse_at_center,_#1d1033_0%,_#0b0616_50%,_#040407_100%)] text-zinc-100"
          : "bg-black text-cyan-400"
      }`}
    >
      {/* 1. Cinematic Scanlines & Vignette Overlays (Cyberpunk Only) */}
      {!isModern && (
        <div
          className="fixed inset-0 pointer-events-none z-[4] mix-blend-screen opacity-35"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(0,240,255,0.035) 0px, rgba(0,240,255,0.035) 1px, transparent 1px, transparent 4px)",
          }}
        />
      )}
      <div
        className="fixed inset-0 pointer-events-none z-[4]"
        style={{
          background: isModern
            ? "radial-gradient(ellipse at center, transparent 55%, rgba(4,4,7,0.85) 100%)"
            : "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* 2. Top Command Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 backdrop-blur-md text-xs tracking-wider transition-opacity duration-700 ${
          isModern
            ? "bg-[#09090b]/90 border-b border-zinc-800 text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
            : "bg-black/85 border-b border-cyan-400/25 text-slate-300"
        } ${
          topbarVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left Telemetry Cluster */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Brand Emblem */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
            isModern
              ? "bg-zinc-900/90 border-zinc-700/80 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              : "bg-black/90 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isModern
                ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)] animate-pulse"
                : "bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,1)] animate-pulse"
            }`} />
            <span className={`font-mono font-black tracking-[0.22em] text-xs ${
              isModern ? "text-white" : "text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]"
            }`}>
              S.Y.N.T.A.X.
            </span>
            <span className={`text-[9px] font-mono border-l pl-2 ${
              isModern ? "border-zinc-700 text-zinc-400" : "border-cyan-500/30 text-cyan-300/80"
            }`}>
              v3.8
            </span>
          </div>

          {/* Visual 8-Cores Micro-Matrix */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[10.5px] font-bold transition-all shadow-sm ${
            isModern
              ? "border-purple-500/30 bg-purple-950/30 text-purple-300"
              : "border-cyan-400/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          }`}>
            <Cpu className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-300"} animate-pulse`} />
            <span>8/8 CORES LINKED</span>
            
            {/* Miniature visual core nodes */}
            <div className={`flex items-center gap-1 pl-2 border-l ${isModern ? "border-purple-500/30" : "border-cyan-400/30"}`}>
              {allPrimaryNodes.map((n) => (
                <span
                  key={n.id}
                  title={`${n.name} (${n.short})`}
                  className="w-1.5 h-1.5 rounded-full transition-transform hover:scale-150 cursor-pointer"
                  style={{
                    backgroundColor: n.hexColor,
                    boxShadow: `0 0 6px ${n.hexColor}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Design Mode Switcher Button */}
          {/* PWA Mobile App Install Button */}
          <PWAInstallButton variant="badge" />

          {/* Dedicated Mobile Voice Interface Trigger */}
          {onOpenMobileVoice && (
            <button
              onClick={() => {
                playHudSound(780, "sawtooth", 0.12);
                onOpenMobileVoice();
              }}
              className="px-3 py-1.5 rounded-xl border border-pink-500/60 bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-cyan-950/80 hover:from-pink-600 hover:to-cyan-600 text-white font-mono text-[11px] font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.35)] active:scale-95 animate-pulse"
              title="Handy Sprach-Interface mit 3D-Partikelkugel starten"
            >
              <Mic className="w-3.5 h-3.5 text-pink-400" />
              <span>SPRACHE</span>
            </button>
          )}

          <button
            onClick={() => {
              playHudSound(650, "triangle", 0.08);
              toggleTheme();
            }}
            title={`Design-Stil wechseln: Aktuell ist ${isModern ? "Modern Syntax" : "Cyberpunk Jarvis"}`}
            className={`px-3 py-1.5 rounded-xl border font-mono text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
              isModern
                ? "border-purple-500/40 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-purple-400 shadow-sm"
                : "border-cyan-400/60 bg-cyan-950/70 hover:bg-cyan-500 hover:text-slate-950 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            }`}
          >
            <Palette className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-300"}`} />
            <span>{isModern ? "DESIGN: MODERN" : "DESIGN: CYBERPUNK"}</span>
          </button>

          {onOpenLandingPage && (
            <button
              onClick={onOpenLandingPage}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isModern
                  ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                  : "border-purple-400/60 bg-purple-950/70 hover:bg-purple-500 hover:text-white text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">VERKAUFSSEITE</span>
            </button>
          )}

          <button
            onClick={() => setShowShowcaseModal(true)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
              isModern
                ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                : "border-pink-400/60 bg-pink-950/70 hover:bg-pink-500 hover:text-white text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D SHOWCASE</span>
          </button>

          <button
            onClick={() => {
              playHudSound(950, "sawtooth", 0.2);
              setShowGenesisAnimation(true);
            }}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-black transition cursor-pointer flex items-center gap-1.5 ${
              isModern
                ? "border-purple-500/60 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300"
                : "border-cyan-400 bg-cyan-500/20 hover:bg-cyan-400 hover:text-slate-950 text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>1-MIN EINWEISUNG</span>
          </button>

          {onOpenAgentInspector && (
            <button
              onClick={() => onOpenAgentInspector(activeHoveredAgent.id)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isModern
                  ? "border-zinc-700 bg-zinc-900 hover:bg-purple-950/40 hover:border-purple-500/50 hover:text-purple-200 text-zinc-200"
                  : "border-cyan-500/40 bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300"
              }`}
            >
              <Brain className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              <span className="hidden sm:inline">MEMORY</span>
            </button>
          )}

          {onOpenMultiAgentChat && (
            <button
              onClick={onOpenMultiAgentChat}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isModern
                  ? "border-zinc-700 bg-zinc-900 hover:bg-purple-950/40 hover:border-purple-500/50 hover:text-purple-200 text-zinc-200"
                  : "border-cyan-400/60 bg-cyan-950/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-200"
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
              <span className="hidden sm:inline">CHAT</span>
            </button>
          )}

          {onCloseConstellation && (
            <button
              onClick={onCloseConstellation}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isModern
                  ? "border-zinc-700 bg-zinc-900/90 hover:bg-purple-500/20 hover:border-purple-400 hover:text-purple-300 text-zinc-400"
                  : "border-zinc-700 bg-zinc-900/90 hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 text-zinc-400"
              }`}
              title="Konstellation schließen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Three.js Mount Stage */}
      <div ref={canvasMountRef} className="relative w-full h-full cursor-crosshair z-[1]" />

      {/* 4. Projected HTML Labels for Primary Cores */}
      {allPrimaryNodes.map((node) => {
        const isHovered = hoveredNodeId === node.id;
        const isAllowed = isAgentAllowed(userRole, node.id);
        const reqRole = getMinRequiredRoleForAgent(node.id);

        return (
          <div
            key={node.id}
            ref={(el) => {
              primaryLabelRefs.current[node.id] = el;
            }}
            style={{
              left: "-9999px",
              top: "-9999px",
              opacity: 0,
              transform: "translate(-50%, -50%)",
              color: node.hexColor,
            }}
            onClick={() => {
              if (!isAllowed && onOpenRoleManagerRef.current) {
                onOpenRoleManagerRef.current();
              } else {
                setSelectedAnimId(node.id);
                playHudSound(880, "sawtooth", 0.15);
                setTimeout(() => onSelectAgentRef.current(node.id), 250);
              }
            }}
            className={`absolute z-10 text-center pointer-events-auto cursor-pointer transition-opacity duration-200 group ${
              isHovered ? "scale-105" : ""
            }`}
          >
            {/* HUD Corner Brackets */}
            <div
              className={`absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-3.5 transition-opacity duration-200 pointer-events-none ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                style={{ borderColor: node.hexColor }}
                className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2"
              />
              <span
                style={{ borderColor: node.hexColor }}
                className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2"
              />
            </div>

            <div
              className={`font-black tracking-[2.5px] uppercase transition-all duration-200 ${
                node.isCenter ? "text-sm sm:text-base tracking-[3.5px]" : "text-[11px] sm:text-xs"
              }`}
              style={{
                textShadow: isHovered
                  ? `0 0 16px ${node.hexColor}, 0 0 30px ${node.hexColor}`
                  : `0 0 8px ${node.hexColor}`,
              }}
            >
              {node.name}
            </div>

            <div className="text-[8px] tracking-[1.5px] text-white/60 mt-0.5 uppercase flex items-center justify-center gap-1">
              {!isAllowed && <Lock className="w-2.5 h-2.5 text-red-400 inline" />}
              <span>{isAllowed ? node.sub : `SPERRE (${reqRole})`}</span>
            </div>

            {/* Quick hover query inspector pill */}
            {isHovered && onOpenAgentInspectorRef.current && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenAgentInspectorRef.current) {
                    onOpenAgentInspectorRef.current(node.id);
                  }
                }}
                className={`mt-1 px-2 py-0.5 rounded-full font-mono text-[8px] font-bold tracking-wider uppercase transition flex items-center gap-1 mx-auto cursor-pointer ${
                  isModern
                    ? "bg-purple-950/95 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:bg-purple-600 hover:text-white"
                    : "bg-cyan-950/95 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.5)] hover:bg-cyan-500 hover:text-slate-950"
                }`}
              >
                <Brain className={`w-2.5 h-2.5 ${isModern ? "text-purple-300" : "text-cyan-300"}`} />
                <span>MEMORY</span>
              </button>
            )}
          </div>
        );
      })}

      {/* 5. Bottom Active Core Detail Card */}
      {activeHoveredAgent && (
        <div
          className={`fixed bottom-4 right-4 sm:right-6 z-20 max-w-sm sm:max-w-md p-3.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-2xl flex items-center justify-between gap-3 text-xs ${
            isModern
              ? "bg-zinc-950/90 border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] text-zinc-200"
              : "bg-black/90 border-cyan-400/40 shadow-[0_0_35px_rgba(0,240,255,0.25)] text-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                borderColor: activeHoveredAgent.color,
                backgroundColor: `${activeHoveredAgent.color}20`,
                color: activeHoveredAgent.color,
              }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center font-black text-lg shrink-0 shadow-[0_0_15px_rgba(53,231,255,0.3)]"
            >
              {activeHoveredAgent.railLetter}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  style={{ color: activeHoveredAgent.color }}
                  className="font-bold tracking-wider uppercase text-sm font-mono"
                >
                  {activeHoveredAgent.name}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                  isModern ? "bg-zinc-900 border-zinc-700 text-zinc-300" : "bg-black/80 border-white/10 text-slate-300"
                }`}>
                  {activeHoveredAgent.short}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1 font-sans mt-0.5">
                {activeHoveredAgent.tag}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenMobileVoice && (
              <button
                onClick={() => {
                  playHudSound(880, "triangle", 0.12);
                  onOpenMobileVoice();
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500/30 to-cyan-500/30 border border-pink-400/80 hover:border-pink-300 text-pink-200 hover:text-white font-mono font-bold text-xs tracking-wider flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(236,72,153,0.3)] shrink-0"
                title="Handy Sprach-Interface starten"
              >
                <Mic className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span>SPRACHE</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedAnimId(activeHoveredAgent.id);
                playHudSound(880, "sawtooth", 0.15);
                setTimeout(() => onSelectAgentAndStart(activeHoveredAgent.id), 250);
              }}
              style={{
                backgroundColor: `${activeHoveredAgent.color}25`,
                borderColor: activeHoveredAgent.color,
                color: "#ffffff",
              }}
              className="px-3.5 py-2 rounded-xl border font-bold text-xs tracking-wider flex items-center gap-1.5 transition cursor-pointer hover:scale-105 active:scale-95 shadow-md shrink-0"
            >
              <span>START</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Mobile Voice Quick Action (Prominent for thumb tapping on mobile screens) */}
      {onOpenMobileVoice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto sm:hidden">
          <button
            onClick={() => {
              playHudSound(900, "sawtooth", 0.1);
              onOpenMobileVoice();
            }}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-mono text-xs font-black tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(236,72,153,0.6)] border border-white/40 active:scale-95 cursor-pointer animate-pulse"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>🎤 HANDY SPRACH-INTERFACE</span>
          </button>
        </div>
      )}

      {/* 7. 3D Cinematic Showcase Modal */}
      <AgentCinematicShowcaseModal
        isOpen={showShowcaseModal}
        onClose={() => setShowShowcaseModal(false)}
        agents={agents}
        currentAgentId={activeHoveredAgent?.id || currentAgentId}
        onSelectAgentAndStart={(agentId) => {
          setShowShowcaseModal(false);
          onSelectAgentAndStart(agentId);
        }}
      />

      {/* 8. Spatial Genesis 1-Min Tutorial Animation */}
      <SyntaxSpatialGenesisAnimation
        isOpen={showGenesisAnimation}
        onComplete={() => {
          setShowGenesisAnimation(false);
          if (onOpenTutorial) onOpenTutorial();
        }}
        onSkip={() => {
          setShowGenesisAnimation(false);
        }}
      />
    </div>
  );
};
