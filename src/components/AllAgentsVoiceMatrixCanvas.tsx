import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { AgentConfig } from "../types";
import { Sparkles, Brain, Mail, Video, MessageSquare } from "lucide-react";

interface AllAgentsVoiceMatrixCanvasProps {
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  activeSpeakingAgentId: string | null;
  state: "idle" | "listening" | "thinking" | "speaking" | "";
  micLevel: number;
  speakingLevel: number;
  isScreenSharing?: boolean;
  onSelectAgent?: (agent: AgentConfig) => void;
  onOpenGmailInbox?: () => void;
  onOpenVeoStudio?: () => void;
  onOpenMemoryVault?: () => void;
  onOpenChat?: () => void;
}

export const AllAgentsVoiceMatrixCanvas: React.FC<AllAgentsVoiceMatrixCanvasProps> = ({
  agents,
  currentAgent,
  activeSpeakingAgentId,
  state,
  micLevel,
  speakingLevel,
  isScreenSharing,
  onSelectAgent,
  onOpenGmailInbox,
  onOpenVeoStudio,
  onOpenMemoryVault,
  onOpenChat,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // 3 Feature Crystals HUD Refs
  const goldFeatureRef = useRef<HTMLDivElement>(null);
  const cyanFeatureRef = useRef<HTMLDivElement>(null);
  const pinkFeatureRef = useRef<HTMLDivElement>(null);

  // S.Y.N.T.A.X. is the Central Boss Core in the middle.
  // The 7 other agents orbit INSIDE the geodesic sphere.
  const isSyntax = (a: AgentConfig) =>
    a.id === "syntax" || a.id === "maze" || a.short === "SYNTAX" || a.name?.includes("SYNTAX");

  const orbitAgents = agents.filter((a) => !isSyntax(a));
  const syntaxAgent = agents.find(isSyntax) || agents[0];

  // Latest state references for the Three.js 60fps render loop
  const activeAgentRef = useRef(activeSpeakingAgentId);
  const stateRef = useRef(state);
  const micLevelRef = useRef(micLevel);
  const speakingLevelRef = useRef(speakingLevel);

  useEffect(() => {
    activeAgentRef.current = activeSpeakingAgentId;
  }, [activeSpeakingAgentId]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    micLevelRef.current = micLevel;
  }, [micLevel]);

  useEffect(() => {
    speakingLevelRef.current = speakingLevel;
  }, [speakingLevel]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const width = Math.max(1, container.clientWidth || 800);
    const height = Math.max(1, container.clientHeight || 600);

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#02040a");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11.2);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
    } catch (err) {
      console.warn("[AllAgentsVoiceMatrixCanvas] WebGL init fallback:", err);
      return;
    }

    // Glow Canvas Texture for particles
    const createParticleTexture = (colorStr = "rgba(0,240,255,0.9)") => {
      const cv = document.createElement("canvas");
      cv.width = 32;
      cv.height = 32;
      const ctx = cv.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.25, colorStr);
        grad.addColorStop(0.65, "rgba(0,240,255,0.2)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(cv);
    };

    const cyanParticleTex = createParticleTexture("rgba(0,240,255,0.9)");
    const goldParticleTex = createParticleTexture("rgba(245,158,11,0.95)");
    const pinkParticleTex = createParticleTexture("rgba(255,42,141,0.95)");

    // ------------------------------------------------------------------
    // 1. CENTER BOSS CORE: S.Y.N.T.A.X. (CYAN / ELECTRIC BLUE / MATRIX)
    // ------------------------------------------------------------------
    const bossParticleCount = 2900;
    const bossPositions = new Float32Array(bossParticleCount * 3);
    const bossOriginals = new Float32Array(bossParticleCount * 3);
    const bossColors = new Float32Array(bossParticleCount * 3);

    const syntaxColor1 = new THREE.Color("#00f0ff"); // Bright Cyan
    const syntaxColor2 = new THREE.Color("#38bdf8"); // Sky Azure
    const syntaxColor3 = new THREE.Color("#a855f7"); // Purple Accents

    for (let i = 0; i < bossParticleCount; i++) {
      const u = (i / bossParticleCount) * Math.PI * 2;
      const v = Math.acos(2 * ((i * 0.6180339887) % 1) - 1);

      // Filigree parametric sphere surface
      const filigreeR =
        1.18 +
        0.16 * Math.sin(10 * u) * Math.cos(8 * v) +
        0.06 * Math.sin(20 * u + v * 4);

      const x = filigreeR * Math.sin(v) * Math.cos(u);
      const y = filigreeR * Math.sin(v) * Math.sin(u);
      const z = filigreeR * Math.cos(v);

      bossPositions[i * 3] = x;
      bossPositions[i * 3 + 1] = y;
      bossPositions[i * 3 + 2] = z;

      bossOriginals[i * 3] = x;
      bossOriginals[i * 3 + 1] = y;
      bossOriginals[i * 3 + 2] = z;

      const mixedColor = syntaxColor1.clone().lerp(syntaxColor2, (i % 80) / 80);
      if (i % 6 === 0) mixedColor.lerp(syntaxColor3, 0.7);

      bossColors[i * 3] = mixedColor.r;
      bossColors[i * 3 + 1] = mixedColor.g;
      bossColors[i * 3 + 2] = mixedColor.b;
    }

    const bossGeo = new THREE.BufferGeometry();
    bossGeo.setAttribute("position", new THREE.BufferAttribute(bossPositions, 3));
    bossGeo.setAttribute("color", new THREE.BufferAttribute(bossColors, 3));

    const bossMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      map: cyanParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const bossMesh = new THREE.Points(bossGeo, bossMat);
    scene.add(bossMesh);

    // SYNTAX Boss Core Halo Light Ring
    const bossRingGeo = new THREE.RingGeometry(1.28, 1.36, 64);
    const bossRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const bossRingMesh = new THREE.Mesh(bossRingGeo, bossRingMat);
    scene.add(bossRingMesh);

    // ------------------------------------------------------------------
    // 2. ALL 7 INTERNAL AGENT ORBS (INSIDE THE MAIN GEODESIC SPHERE)
    // ------------------------------------------------------------------
    const internalRadius = 2.45;
    const agentGroup = new THREE.Group();
    scene.add(agentGroup);

    interface AgentOrbData {
      id: string;
      colorHex: string;
      pos: THREE.Vector3;
      mesh: THREE.Points;
      geo: THREE.BufferGeometry;
      positions: Float32Array;
      originals: Float32Array;
      line: THREE.Line;
      laserParticles: THREE.Points;
      laserPos: Float32Array;
      ringMesh: THREE.Mesh;
    }

    const agentOrbList: AgentOrbData[] = [];
    const totalInternalAgents = orbitAgents.length;

    orbitAgents.forEach((ag, idx) => {
      const angle = (idx / totalInternalAgents) * Math.PI * 2 - Math.PI / 2;
      const orbX = Math.cos(angle) * internalRadius;
      const orbY = Math.sin(angle) * internalRadius;
      const orbZ = Math.sin(angle * 2) * 0.35;
      const orbPos = new THREE.Vector3(orbX, orbY, orbZ);

      // Create Agent Orb Particles
      const count = 380;
      const positions = new Float32Array(count * 3);
      const originals = new Float32Array(count * 3);
      const orbColors = new Float32Array(count * 3);

      const agColor = new THREE.Color(ag.color || "#00f0ff");

      for (let p = 0; p < count; p++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.PI * 2 * Math.random();
        const r = 0.32 + Math.random() * 0.05;

        const px = r * Math.sin(phi) * Math.cos(theta);
        const py = r * Math.sin(phi) * Math.sin(theta);
        const pz = r * Math.cos(phi);

        positions[p * 3] = px;
        positions[p * 3 + 1] = py;
        positions[p * 3 + 2] = pz;

        originals[p * 3] = px;
        originals[p * 3 + 1] = py;
        originals[p * 3 + 2] = pz;

        orbColors[p * 3] = agColor.r;
        orbColors[p * 3 + 1] = agColor.g;
        orbColors[p * 3 + 2] = agColor.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(orbColors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.07,
        vertexColors: true,
        map: cyanParticleTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const mesh = new THREE.Points(geo, mat);
      mesh.position.copy(orbPos);
      agentGroup.add(mesh);

      // Outer Audio Ring for Agent Orb
      const ringGeo = new THREE.RingGeometry(0.36, 0.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: agColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(orbPos);
      agentGroup.add(ringMesh);

      // Laser Line to Central SYNTAX Boss Core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        orbPos,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: agColor,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      agentGroup.add(line);

      // Laser Particle Stream
      const laserParticleCount = 20;
      const laserPos = new Float32Array(laserParticleCount * 3);
      const laserColors = new Float32Array(laserParticleCount * 3);

      for (let l = 0; l < laserParticleCount; l++) {
        const frac = l / laserParticleCount;
        laserPos[l * 3] = orbX * frac;
        laserPos[l * 3 + 1] = orbY * frac;
        laserPos[l * 3 + 2] = orbZ * frac;

        laserColors[l * 3] = agColor.r;
        laserColors[l * 3 + 1] = agColor.g;
        laserColors[l * 3 + 2] = agColor.b;
      }

      const laserGeo = new THREE.BufferGeometry();
      laserGeo.setAttribute("position", new THREE.BufferAttribute(laserPos, 3));
      laserGeo.setAttribute("color", new THREE.BufferAttribute(laserColors, 3));

      const laserMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        map: cyanParticleTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const laserParticles = new THREE.Points(laserGeo, laserMat);
      agentGroup.add(laserParticles);

      agentOrbList.push({
        id: ag.id,
        colorHex: ag.color,
        pos: orbPos,
        mesh,
        geo,
        positions,
        originals,
        line,
        laserParticles,
        laserPos,
        ringMesh,
      });
    });

    // ------------------------------------------------------------------
    // 3. MAIN GEODESIC WIREFRAME SPHERE (ENCLOSING ALL 8 AGENTS)
    // ------------------------------------------------------------------
    const sphereRadius = 3.4;
    const sphereGeo = new THREE.IcosahedronGeometry(sphereRadius, 2);
    const sphereOriginals = new Float32Array(sphereGeo.attributes.position.array);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // Inner subtle rotating lattice
    const innerLatticeGeo = new THREE.IcosahedronGeometry(3.0, 1);
    const innerLatticeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    const innerLatticeMesh = new THREE.Mesh(innerLatticeGeo, innerLatticeMat);
    scene.add(innerLatticeMesh);

    // Synaptic neural network connecting internal agent orbs
    const synapseLinesGroup = new THREE.Group();
    scene.add(synapseLinesGroup);

    for (let i = 0; i < totalInternalAgents; i++) {
      const angle1 = (i / totalInternalAgents) * Math.PI * 2 - Math.PI / 2;
      const pos1 = new THREE.Vector3(
        Math.cos(angle1) * internalRadius,
        Math.sin(angle1) * internalRadius,
        Math.sin(angle1 * 2) * 0.35
      );

      [1, 2].forEach((offset) => {
        const nextIdx = (i + offset) % totalInternalAgents;
        const angle2 = (nextIdx / totalInternalAgents) * Math.PI * 2 - Math.PI / 2;
        const pos2 = new THREE.Vector3(
          Math.cos(angle2) * internalRadius,
          Math.sin(angle2) * internalRadius,
          Math.sin(angle2 * 2) * 0.35
        );

        const synGeo = new THREE.BufferGeometry().setFromPoints([pos1, pos2]);
        const synMat = new THREE.LineBasicMaterial({
          color: offset === 1 ? 0x00f0ff : 0x38bdf8,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
        });
        const synLine = new THREE.Line(synGeo, synMat);
        synapseLinesGroup.add(synLine);
      });
    }

    // ------------------------------------------------------------------
    // 4. OUTER FIBER-OPTIC LIGHT TRAILS / ORBIT RIBBONS (STREAMING CABLES)
    // ------------------------------------------------------------------
    const createFiberRibbon = (colorHex: number, count = 500, radius = 5.2, tilt = 0.4) => {
      const posArr = new Float32Array(count * 3);
      const colArr = new Float32Array(count * 3);
      const c = new THREE.Color(colorHex);

      for (let r = 0; r < count; r++) {
        const theta = (r / count) * Math.PI * 2;
        const spreadR = radius + (Math.random() - 0.5) * 0.25;
        const x = Math.cos(theta) * spreadR;
        const y = Math.sin(theta) * spreadR * 0.65;
        const z = (Math.random() - 0.5) * 0.25;

        const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
        const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);

        posArr[r * 3] = x;
        posArr[r * 3 + 1] = tiltedY;
        posArr[r * 3 + 2] = tiltedZ;

        colArr[r * 3] = c.r;
        colArr[r * 3 + 1] = c.g;
        colArr[r * 3 + 2] = c.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        map: cyanParticleTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      return new THREE.Points(geo, mat);
    };

    const orbitRibbon1 = createFiberRibbon(0x00f0ff, 900, 5.1, 0.4);
    const orbitRibbon2 = createFiberRibbon(0xf59e0b, 700, 5.4, -0.45);
    scene.add(orbitRibbon1);
    scene.add(orbitRibbon2);

    // Multi-strand fiber cable bundles swooping to outer crystals
    const createFiberCableBundle = (colorHex: number, countStrands = 5, numPts = 35) => {
      const group = new THREE.Group();
      const c = new THREE.Color(colorHex);

      for (let s = 0; s < countStrands; s++) {
        const lineGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(numPts * 3);
        lineGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const lineMat = new THREE.LineBasicMaterial({
          color: c,
          transparent: true,
          opacity: 0.55 + s * 0.08,
          blending: THREE.AdditiveBlending,
        });

        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
      }
      return group;
    };

    const fiberBundleGold = createFiberCableBundle(0xf59e0b, 5);
    const fiberBundleCyan = createFiberCableBundle(0x00f0ff, 5);
    const fiberBundlePink = createFiberCableBundle(0xff2a8d, 5);
    scene.add(fiberBundleGold);
    scene.add(fiberBundleCyan);
    scene.add(fiberBundlePink);

    // ------------------------------------------------------------------
    // 5. THE 3 EXTERNAL FLOATING CRYSTAL POLYHEDRONS (EXACT MATCH TO PHOTO)
    // ------------------------------------------------------------------
    const createGlowingCrystal = (
      type: "icosahedron" | "octahedron",
      size: number,
      wireColor: number,
      particleTexMap: THREE.CanvasTexture,
      particleColorHex: number
    ) => {
      const crystalGroup = new THREE.Group();

      // 1. Sharp Outer Wireframe Polygon Facets
      const geom =
        type === "octahedron"
          ? new THREE.OctahedronGeometry(size, 0)
          : new THREE.IcosahedronGeometry(size, 0);

      const wireMat = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: 0.95,
      });
      const wireMesh = new THREE.Mesh(geom, wireMat);
      crystalGroup.add(wireMesh);

      // Inner faint translucent facet fill
      const fillMat = new THREE.MeshBasicMaterial({
        color: wireColor,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      const fillMesh = new THREE.Mesh(geom, fillMat);
      crystalGroup.add(fillMesh);

      // 2. Dense Glowing Particle Cloud inside the crystal
      const pCount = 260;
      const pPos = new Float32Array(pCount * 3);
      for (let p = 0; p < pCount; p++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.PI * 2 * Math.random();
        const r = Math.random() * (size * 0.75);

        pPos[p * 3] = r * Math.sin(phi) * Math.cos(theta);
        pPos[p * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[p * 3 + 2] = r * Math.cos(phi);
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));

      const pMat = new THREE.PointsMaterial({
        size: 0.08,
        color: particleColorHex,
        map: particleTexMap,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const pMesh = new THREE.Points(pGeo, pMat);
      crystalGroup.add(pMesh);

      return { crystalGroup, wireMesh, fillMesh, pMesh };
    };

    // CRYSTAL 1: GOLD / AMBER (Top-Left - Memory Vault)
    const crystalGold = createGlowingCrystal("icosahedron", 0.65, 0xf59e0b, goldParticleTex, 0xfbbf24);
    scene.add(crystalGold.crystalGroup);

    // CRYSTAL 2: CYAN / ICE BLUE (Bottom-Left - Gmail Inbox)
    const crystalCyan = createGlowingCrystal("octahedron", 0.65, 0x00f0ff, cyanParticleTex, 0x38bdf8);
    scene.add(crystalCyan.crystalGroup);

    // CRYSTAL 3: MAGENTA / NEON PINK (Right - Veo 8K Studio)
    const crystalPink = createGlowingCrystal("icosahedron", 0.72, 0xff2a8d, pinkParticleTex, 0xf43f5e);
    scene.add(crystalPink.crystalGroup);

    // NOTE: Removed stray pinkCircuitLine and red junction dot as requested!

    // ------------------------------------------------------------------
    // 6. USER SPEECH PARTICLE BALL
    // ------------------------------------------------------------------
    const userParticleCount = 350;
    const userPos = new Float32Array(userParticleCount * 3);
    const userColors = new Float32Array(userParticleCount * 3);
    const redC1 = new THREE.Color("#ef4444");
    const redC2 = new THREE.Color("#b91c1c");

    for (let u = 0; u < userParticleCount; u++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.PI * 2 * Math.random();
      const r = 0.35 + Math.random() * 0.05;

      userPos[u * 3] = r * Math.sin(phi) * Math.cos(theta);
      userPos[u * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      userPos[u * 3 + 2] = r * Math.cos(phi);

      const mc = redC1.clone().lerp(redC2, Math.random());
      userColors[u * 3] = mc.r;
      userColors[u * 3 + 1] = mc.g;
      userColors[u * 3 + 2] = mc.b;
    }

    const userGeo = new THREE.BufferGeometry();
    userGeo.setAttribute("position", new THREE.BufferAttribute(userPos, 3));
    userGeo.setAttribute("color", new THREE.BufferAttribute(userColors, 3));

    const userMat = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      map: cyanParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const userMesh = new THREE.Points(userGeo, userMat);
    userMesh.position.set(0, -2.15, 0.2);
    scene.add(userMesh);

    // ------------------------------------------------------------------
    // 7. MOUSE & TOUCH CAMERA CONTROLS
    // ------------------------------------------------------------------
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      camera.position.x -= dx * 0.005;
      camera.position.y += dy * 0.005;

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(4.0, Math.min(20.0, camera.position.z + e.deltaY * 0.006));
    };

    let touchStart = { x: 0, y: 0 };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchStart.x;
      const dy = e.touches[0].clientY - touchStart.y;

      camera.position.x -= dx * 0.005;
      camera.position.y += dy * 0.005;

      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // ------------------------------------------------------------------
    // 8. ANIMATION LOOP (VERY SLOW, SMOOTH, CINEMATIC)
    // ------------------------------------------------------------------
    let animId: number;
    const startTime = performance.now();

    const updateFiberBundle = (
      bundleGroup: THREE.Group,
      startPos: THREE.Vector3,
      endPos: THREE.Vector3,
      time: number,
      speedOffset: number
    ) => {
      const strands = bundleGroup.children as THREE.Line[];
      strands.forEach((line, sIdx) => {
        const numPts = 35;
        const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        const offsetAngle = (sIdx / strands.length) * Math.PI * 2 + time * 0.5;
        const radiusDev = 0.15 + (sIdx % 2) * 0.1;

        for (let p = 0; p < numPts; p++) {
          const t = p / (numPts - 1);
          const arcX = THREE.MathUtils.lerp(startPos.x, endPos.x, t);
          const arcY = THREE.MathUtils.lerp(startPos.y, endPos.y, t);
          const arcZ = THREE.MathUtils.lerp(startPos.z, endPos.z, t);

          const midBulge = Math.sin(t * Math.PI);
          const wave = Math.sin(t * 8 - time * 1.5 + sIdx) * 0.08 * midBulge;

          posArray[p * 3] = arcX + Math.cos(offsetAngle) * radiusDev * midBulge;
          posArray[p * 3 + 1] = arcY + Math.sin(offsetAngle) * radiusDev * midBulge + wave;
          posArray[p * 3 + 2] = arcZ + (sIdx - strands.length / 2) * 0.05 * midBulge;
        }
        posAttr.needsUpdate = true;
      });
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const time = (performance.now() - startTime) * 0.001;
      const currentActive = activeAgentRef.current;
      const currentMic = micLevelRef.current || 0;
      const currentSpeaking = speakingLevelRef.current || 0;

      // 1. Slow Rotation for Central S.Y.N.T.A.X. Boss Core
      bossMesh.rotation.y = time * 0.08;
      bossMesh.rotation.x = Math.sin(time * 0.04) * 0.06;
      bossRingMesh.rotation.z = -time * 0.1;

      // 2. Slow Rotation of Geodesic Wireframe Sphere
      sphereMesh.rotation.y = time * 0.025;
      sphereMesh.rotation.x = Math.sin(time * 0.02) * 0.03;
      innerLatticeMesh.rotation.y = -time * 0.035;

      const isThinkingOrSpeaking = currentSpeaking > 0 || currentMic > 0 || currentActive !== null;
      const waveSpeed = isThinkingOrSpeaking ? 2.0 : 0.8;
      const waveAmp = isThinkingOrSpeaking ? 0.05 + currentSpeaking * 0.08 : 0.025;

      const spherePosArr = sphereGeo.attributes.position.array as Float32Array;
      for (let s = 0; s < spherePosArr.length / 3; s++) {
        const ox = sphereOriginals[s * 3];
        const oy = sphereOriginals[s * 3 + 1];
        const oz = sphereOriginals[s * 3 + 2];

        const wave = Math.sin(time * waveSpeed + ox * 1.2 + oy * 1.2 + oz * 1.2) * waveAmp;
        const norm = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;

        spherePosArr[s * 3] = ox + (ox / norm) * wave;
        spherePosArr[s * 3 + 1] = oy + (oy / norm) * wave;
        spherePosArr[s * 3 + 2] = oz + (oz / norm) * wave;
      }
      sphereGeo.attributes.position.needsUpdate = true;

      // 3. Slow Rotation of Outer Orbit Particle Ribbons
      orbitRibbon1.rotation.z = time * 0.018;
      orbitRibbon2.rotation.z = -time * 0.015;

      // 4. SLOW MOTION ORBIT OF THE 3 FLOATING CRYSTALS
      // Crystal 1: Gold / Amber (Top-Left - Memory Vault)
      const c1Angle = -time * 0.032;
      const c1Pos = new THREE.Vector3(
        Math.cos(c1Angle) * 4.9,
        Math.sin(c1Angle) * 2.8 + Math.sin(time * 0.3) * 0.15,
        Math.sin(c1Angle) * 1.1
      );
      crystalGold.crystalGroup.position.copy(c1Pos);
      crystalGold.wireMesh.rotation.x = time * 0.18;
      crystalGold.wireMesh.rotation.y = time * 0.22;
      crystalGold.fillMesh.rotation.copy(crystalGold.wireMesh.rotation);

      // Crystal 2: Cyan / Ice Blue (Bottom-Left - Gmail Inbox)
      const c2Angle = time * 0.028 + Math.PI * 0.8;
      const c2Pos = new THREE.Vector3(
        Math.cos(c2Angle) * 5.0,
        Math.sin(c2Angle) * 2.6 + Math.cos(time * 0.25) * 0.12,
        Math.sin(c2Angle) * 1.2
      );
      crystalCyan.crystalGroup.position.copy(c2Pos);
      crystalCyan.wireMesh.rotation.x = -time * 0.15;
      crystalCyan.wireMesh.rotation.y = time * 0.2;
      crystalCyan.fillMesh.rotation.copy(crystalCyan.wireMesh.rotation);

      // Crystal 3: Magenta / Neon Pink (Right - Veo 8K Video)
      const c3Angle = -time * 0.024 + Math.PI * 0.08;
      const c3Pos = new THREE.Vector3(
        Math.cos(c3Angle) * 5.2,
        Math.sin(c3Angle) * 2.5 + Math.sin(time * 0.35) * 0.14,
        Math.sin(c3Angle) * 1.0
      );
      crystalPink.crystalGroup.position.copy(c3Pos);
      crystalPink.wireMesh.rotation.x = time * 0.2;
      crystalPink.wireMesh.rotation.y = -time * 0.24;
      crystalPink.fillMesh.rotation.copy(crystalPink.wireMesh.rotation);

      // Update Fiber Cable Bundles connecting crystals to sphere center
      const sphereCenter = new THREE.Vector3(0, 0, 0);
      updateFiberBundle(fiberBundleGold, sphereCenter, c1Pos, time, 0);
      updateFiberBundle(fiberBundleCyan, sphereCenter, c2Pos, time, 1);
      updateFiberBundle(fiberBundlePink, sphereCenter, c3Pos, time, 2);

      // 5. Animate Internal Agent Orbs & Project Badges
      const tempVec = new THREE.Vector3();
      agentOrbList.forEach((orb) => {
        const isThisSpeaking = currentActive === orb.id;

        orb.mesh.rotation.y = time * (isThisSpeaking ? 0.8 : 0.2);
        orb.mesh.rotation.z = time * 0.15;

        const posArr = orb.geo.attributes.position.array as Float32Array;
        const scaleFactor = isThisSpeaking
          ? 1.3 + Math.sin(time * 6) * 0.12 + currentSpeaking * 0.3
          : 1.0 + Math.sin(time * 1.5 + orb.pos.x) * 0.04;

        for (let p = 0; p < 380; p++) {
          posArr[p * 3] = orb.originals[p * 3] * scaleFactor;
          posArr[p * 3 + 1] = orb.originals[p * 3 + 1] * scaleFactor;
          posArr[p * 3 + 2] = orb.originals[p * 3 + 2] * scaleFactor;
        }
        orb.geo.attributes.position.needsUpdate = true;

        // Laser beam flow
        const laserPosArr = orb.laserParticles.geometry.attributes.position.array as Float32Array;
        const speed = isThisSpeaking ? 1.5 : 0.4;
        for (let l = 0; l < 20; l++) {
          let frac = (l / 20 + time * speed * 0.2) % 1.0;
          laserPosArr[l * 3] = orb.pos.x * frac;
          laserPosArr[l * 3 + 1] = orb.pos.y * frac;
          laserPosArr[l * 3 + 2] = orb.pos.z * frac;
        }
        orb.laserParticles.geometry.attributes.position.needsUpdate = true;

        // Project internal orb badge to 2D
        const badgeBtn = badgeRefs.current[orb.id];
        if (badgeBtn) {
          tempVec.copy(orb.pos).add(agentGroup.position);
          tempVec.project(camera);
          const leftPct = (tempVec.x * 0.5 + 0.5) * 100;
          const topPct = (-tempVec.y * 0.5 + 0.5) * 100;
          badgeBtn.style.left = `${leftPct}%`;
          badgeBtn.style.top = `${topPct}%`;
          badgeBtn.style.display = tempVec.z > 1 ? "none" : "flex";
        }
      });

      // 6. Project 3 Outer Crystal Feature Tooltips / HUD Cards
      if (goldFeatureRef.current) {
        tempVec.copy(c1Pos);
        tempVec.project(camera);
        const leftPct = (tempVec.x * 0.5 + 0.5) * 100;
        const topPct = (-tempVec.y * 0.5 + 0.5) * 100;
        goldFeatureRef.current.style.left = `${leftPct}%`;
        goldFeatureRef.current.style.top = `${topPct}%`;
        goldFeatureRef.current.style.display = tempVec.z > 1 ? "none" : "flex";
      }

      if (cyanFeatureRef.current) {
        tempVec.copy(c2Pos);
        tempVec.project(camera);
        const leftPct = (tempVec.x * 0.5 + 0.5) * 100;
        const topPct = (-tempVec.y * 0.5 + 0.5) * 100;
        cyanFeatureRef.current.style.left = `${leftPct}%`;
        cyanFeatureRef.current.style.top = `${topPct}%`;
        cyanFeatureRef.current.style.display = tempVec.z > 1 ? "none" : "flex";
      }

      if (pinkFeatureRef.current) {
        tempVec.copy(c3Pos);
        tempVec.project(camera);
        const leftPct = (tempVec.x * 0.5 + 0.5) * 100;
        const topPct = (-tempVec.y * 0.5 + 0.5) * 100;
        pinkFeatureRef.current.style.left = `${leftPct}%`;
        pinkFeatureRef.current.style.top = `${topPct}%`;
        pinkFeatureRef.current.style.display = tempVec.z > 1 ? "none" : "flex";
      }

      // 7. User Speech Ball
      const isVoiceActive = state === "listening" || currentMic > 0;
      userMesh.visible = isVoiceActive;
      if (isVoiceActive) {
        userMesh.rotation.y = time * 0.4;
      }

      renderer?.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      try {
        renderer?.dispose();
      } catch (e) {}
    };
  }, [agents]);

  const isSyntaxSpeaking =
    activeSpeakingAgentId === "syntax" ||
    activeSpeakingAgentId === "maze" ||
    (isSyntax(currentAgent) && (state === "speaking" || speakingLevel > 0));
  const isVoiceActive = state === "listening" || micLevel > 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#02040a] overflow-hidden select-none cursor-grab active:cursor-grabbing font-mono"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* CENTER OVERLAY BADGE: S.Y.N.T.A.X. // SOVEREIGN BOSS CORE */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center text-center z-20">
        <button
          onClick={() => onSelectAgent?.(syntaxAgent)}
          className={`pointer-events-auto px-5 py-1.5 rounded-full font-mono text-[11px] font-bold tracking-[2px] cursor-pointer flex items-center gap-2.5 transition-all duration-300 ${
            isSyntaxSpeaking
              ? "bg-cyan-950/95 border-2 border-cyan-300 text-white shadow-[0_0_35px_rgba(0,240,255,0.9)] animate-pulse scale-105"
              : "bg-[#0b101b]/85 hover:bg-[#0f172a] border border-cyan-400/80 text-cyan-200 hover:text-white shadow-[0_0_25px_rgba(0,240,255,0.5)] scale-100"
          }`}
          title="S.Y.N.T.A.X. Sovereign Boss Core auswählen"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSyntaxSpeaking
                ? "bg-emerald-400 animate-ping"
                : isScreenSharing
                ? "bg-cyan-400 animate-pulse"
                : "bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
            }`}
          />
          <span className="font-extrabold uppercase text-[10.5px]">
            {isSyntaxSpeaking
              ? "S.Y.N.T.A.X. // SPRECHAKTIV 🎙️"
              : "S.Y.N.T.A.X. // SOVEREIGN BOSS CORE"}
          </span>
        </button>
      </div>

      {/* User Speech Input Label (Active only during voice) */}
      {isVoiceActive && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center text-center z-10 animate-fade-in">
          <div className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-[9px] font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>DU (BOSS USER - SPEECH INPUT)</span>
          </div>
        </div>
      )}

      {/* ALL 7 INTERNAL AGENT LABELS (INSIDE THE GEODESIC SPHERE) */}
      <div className="absolute inset-0 pointer-events-none">
        {orbitAgents.map((ag) => {
          const isSpeaking = activeSpeakingAgentId === ag.id;

          return (
            <button
              key={ag.id}
              ref={(el) => {
                badgeRefs.current[ag.id] = el;
              }}
              onClick={() => onSelectAgent?.(ag)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto px-2.5 py-1 rounded-full font-mono text-[9.5px] font-bold transition-transform cursor-pointer flex items-center gap-1.5 border shadow-lg ${
                isSpeaking
                  ? "bg-slate-900 border-2 scale-110 shadow-[0_0_20px_rgba(0,240,255,0.6)] animate-bounce z-30"
                  : "bg-slate-950/80 hover:bg-slate-900 border-slate-700/80 hover:border-slate-500 scale-100 z-20"
              }`}
              title={`Zu ${ag.name} wechseln`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8.5px] font-bold"
                style={{
                  backgroundColor: `${ag.color}30`,
                  color: ag.color,
                  border: `1px solid ${ag.color}80`,
                }}
              >
                {ag.railLetter}
              </span>
              <span style={{ color: ag.color }}>{ag.short}</span>
              {isSpeaking && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3 FLOATING EXTERNAL CRYSTAL HUD CARDS: ZWECK & FÄHIGKEITEN           */}
      {/* ------------------------------------------------------------------ */}

      {/* 1. GOLD CRYSTAL (TOP-LEFT) - M.E.M.O.R.Y.S. VAULT */}
      <div
        ref={goldFeatureRef}
        onClick={() => onOpenMemoryVault?.()}
        className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto z-25 flex flex-col items-center cursor-pointer group pb-2"
        style={{ willChange: "left, top" }}
      >
        <div className="px-3 py-1.5 rounded-lg bg-amber-950/90 hover:bg-amber-900/90 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400 flex flex-col gap-1 max-w-[210px] text-left">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[10px] tracking-wider border-b border-amber-500/30 pb-0.5">
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>M.E.M.O.R.Y.S. // CORTEX</span>
          </div>
          <div className="text-[8.5px] text-amber-200/90 leading-tight">
            <span className="text-amber-400 font-semibold block">Zweck:</span>
            Langzeit-Gedächtnis & Wissens-Vault
          </div>
          <div className="text-[8px] text-amber-300/75 leading-tight pt-0.5 border-t border-amber-500/20">
            <span className="text-amber-400 font-semibold">Können:</span> Speichert Fakten, Notizen & Kontexte aller 8 Cores dauerhaft.
          </div>
        </div>
        {/* Pointer indicator line down to crystal */}
        <div className="w-[1px] h-3 bg-gradient-to-b from-amber-400 to-transparent" />
      </div>

      {/* 2. CYAN CRYSTAL (BOTTOM-LEFT) - G.M.A.I.L. INBOX */}
      <div
        ref={cyanFeatureRef}
        onClick={() => onOpenGmailInbox?.()}
        className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto z-25 flex flex-col items-center cursor-pointer group pb-2"
        style={{ willChange: "left, top" }}
      >
        <div className="px-3 py-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900/90 border border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400 flex flex-col gap-1 max-w-[210px] text-left">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[10px] tracking-wider border-b border-cyan-500/30 pb-0.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>G.M.A.I.L. // SMART INBOX</span>
          </div>
          <div className="text-[8.5px] text-cyan-200/90 leading-tight">
            <span className="text-cyan-400 font-semibold block">Zweck:</span>
            Posteingang & E-Mail Dispatcher
          </div>
          <div className="text-[8px] text-cyan-300/75 leading-tight pt-0.5 border-t border-cyan-500/20">
            <span className="text-cyan-400 font-semibold">Können:</span> Liest, priorisiert E-Mails & verfasst blitzschnelle Entwürfe.
          </div>
        </div>
        {/* Pointer indicator line down to crystal */}
        <div className="w-[1px] h-3 bg-gradient-to-b from-cyan-400 to-transparent" />
      </div>

      {/* 3. PINK CRYSTAL (RIGHT) - V.E.O.3 VIDEO STUDIO */}
      <div
        ref={pinkFeatureRef}
        onClick={() => onOpenVeoStudio?.()}
        className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto z-25 flex flex-col items-center cursor-pointer group pb-2"
        style={{ willChange: "left, top" }}
      >
        <div className="px-3 py-1.5 rounded-lg bg-pink-950/90 hover:bg-pink-900/90 border border-pink-500/60 shadow-[0_0_20px_rgba(255,42,141,0.4)] backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-pink-400 flex flex-col gap-1 max-w-[210px] text-left">
          <div className="flex items-center gap-1.5 text-pink-300 font-bold text-[10px] tracking-wider border-b border-pink-500/30 pb-0.5">
            <Video className="w-3.5 h-3.5 text-pink-400" />
            <span>V.E.O.3 // 8K VIDEO STUDIO</span>
          </div>
          <div className="text-[8.5px] text-pink-200/90 leading-tight">
            <span className="text-pink-400 font-semibold block">Zweck:</span>
            Generative KI-Videoproduktion
          </div>
          <div className="text-[8px] text-pink-300/75 leading-tight pt-0.5 border-t border-pink-500/20">
            <span className="text-pink-400 font-semibold">Können:</span> Erzeugt 8K Cinematic Clips, Animationen & Kamera-Effekte.
          </div>
        </div>
        {/* Pointer indicator line down to crystal */}
        <div className="w-[1px] h-3 bg-gradient-to-b from-pink-400 to-transparent" />
      </div>

      {/* HUD CIRCUIT TREE NODE SCHEMATIC ON RIGHT SIDE (EXACT MATCH TO PHOTO) */}
      <div className="absolute top-10 right-6 z-20 pointer-events-auto flex flex-col items-end gap-1.5 font-mono text-[9.5px] max-w-[290px]">
        {/* Top Node */}
        <div className="px-2.5 py-0.5 rounded-md bg-slate-950/85 border border-slate-700 text-cyan-400 font-bold tracking-widest shadow-md">
          S.7.9.1.4.3.
        </div>

        {/* Tree branch 1: Core 01 */}
        <div className="flex flex-col items-end gap-1 mt-1">
          <div className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-slate-300 text-[9px] flex items-center gap-1">
            <span className="text-cyan-400 font-bold">// CORE 01:</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[8.5px] pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500/20 border border-pink-400 flex items-center justify-center text-[7px] text-pink-300 font-bold">
              ●
            </span>
            <span className="text-slate-300 font-bold">MA1Z</span>
            <span className="text-slate-500 text-[8px]">(MICROPROCESSOR)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[8.5px] pr-4">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center text-[7px] text-purple-300 font-bold">
              ●
            </span>
            <span className="text-slate-300 font-bold">KEZ9</span>
            <span className="text-slate-500 text-[8px]">(EXECUTOR DECID)</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-500/50 text-cyan-300 text-[8.5px] flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>N.S... // MATRIX BOSS CORE</span>
          </div>

          <div className="text-slate-400 text-[8px] pr-6 flex items-center gap-1">
            <span>// CORE S1</span>
            <span className="text-slate-600">→</span>
            <span className="text-slate-500">// CORE X2</span>
          </div>

          <div className="text-slate-400 text-[8px] pr-8 flex items-center gap-1">
            <span className="text-rose-400 font-bold">RED</span>
            <span className="text-slate-500">(EXTRA USER)</span>
            <span className="text-slate-600">→</span>
            <span className="text-slate-400">S.7.8.14.2.</span>
          </div>
        </div>

        {/* Tree branch 2 */}
        <div className="flex items-center gap-1.5 text-slate-400 text-[8.5px] mt-1">
          <span className="text-slate-500">// CORE XX</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold">// VISA (0.001% EXEC ORDER)</span>
        </div>

        {/* Tree branch 3 */}
        <div className="flex items-center gap-1 text-slate-500 text-[8px]">
          <span>// CORE 3X</span>
          <span className="text-slate-600">→</span>
          <span className="text-cyan-400 font-mono">RAPID EVO</span>
        </div>
      </div>

      {/* Floating Bottom Center ALL 8 Matrix Chat Button */}
      {onOpenChat && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 pointer-events-auto flex items-center gap-2">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950/90 hover:bg-cyan-950/90 border border-cyan-400/70 text-cyan-200 font-mono text-xs font-black tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.45)] backdrop-blur-xl transition hover:scale-105 active:scale-95 cursor-pointer"
            title="All 8 Cores Matrix Chat öffnen"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>ALL 8 MATRIX CHAT ÖFFNEN</span>
          </button>
        </div>
      )}
    </div>
  );
};
