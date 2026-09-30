import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AgentConfig } from "../types";
import { Sparkles, Crown, RotateCcw, Volume2, Activity, Zap, Shield, Radio, Layers, MessageSquare } from "lucide-react";

interface TheBig3VoiceMatrixCanvasProps {
  agents: AgentConfig[];
  currentAgent: AgentConfig;
  activeSpeakingAgentId: string | null;
  state: "idle" | "listening" | "thinking" | "speaking" | "";
  micLevel: number;
  speakingLevel: number;
  isScreenSharing?: boolean;
  onSelectAgent?: (agent: AgentConfig) => void;
  onOpenChat?: () => void;
}

export const TheBig3VoiceMatrixCanvas: React.FC<TheBig3VoiceMatrixCanvasProps> = ({
  agents,
  currentAgent,
  activeSpeakingAgentId,
  state,
  micLevel,
  speakingLevel,
  isScreenSharing,
  onSelectAgent,
  onOpenChat,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Big 3 Agent references
  const syntaxAgent = agents.find((a) => a.id === "maze" || a.id === "syntax" || a.short === "SYNTAX") || agents[0];
  const neoAgent = agents.find((a) => a.id === "neo") || agents[1];
  const vegaAgent = agents.find((a) => a.id === "vega") || agents[2];

  // Prop refs for 60fps render loop
  const activeAgentRef = useRef(activeSpeakingAgentId);
  const stateRef = useRef(state);
  const micLevelRef = useRef(micLevel);
  const speakingLevelRef = useRef(speakingLevel);

  // Screen-projected 2D coordinates for DOM badges
  const [badgePos, setBadgePos] = useState<{
    syntax: { x: number; y: number; visible: boolean };
    neo: { x: number; y: number; visible: boolean };
    vega: { x: number; y: number; visible: boolean };
  }>({
    syntax: { x: 30, y: 35, visible: true },
    neo: { x: 70, y: 35, visible: true },
    vega: { x: 50, y: 70, visible: true },
  });

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

  const handleResetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 7.8);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const width = Math.max(1, container.clientWidth || 800);
    const height = Math.max(1, container.clientHeight || 600);

    // Three.js Scene Setup with Deep Cosmic Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#010308");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    cameraRef.current = camera;

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
      console.warn("[TheBig3VoiceMatrixCanvas] WebGL init fallback:", err);
      return;
    }

    // High quality circular glow particle texture
    const createParticleTexture = (coreColor = "rgba(255, 255, 255, 1.0)", edgeColor = "rgba(0, 240, 255, 0.4)") => {
      const cv = document.createElement("canvas");
      cv.width = 64;
      cv.height = 64;
      const ctx = cv.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, coreColor);
        grad.addColorStop(0.2, coreColor);
        grad.addColorStop(0.5, edgeColor);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(cv);
    };

    const cyanParticleTex = createParticleTexture("rgba(255, 255, 255, 1.0)", "rgba(0, 240, 255, 0.6)");
    const pinkParticleTex = createParticleTexture("rgba(255, 255, 255, 1.0)", "rgba(255, 42, 141, 0.6)");
    const redParticleTex = createParticleTexture("rgba(255, 255, 255, 1.0)", "rgba(239, 68, 68, 0.6)");
    const whiteParticleTex = createParticleTexture("rgba(255, 255, 255, 1.0)", "rgba(148, 163, 184, 0.4)");

    // Main Trinity Quantum Node Group
    const trinityGroup = new THREE.Group();
    scene.add(trinityGroup);

    // =========================================================================
    // 0. AMBIENT BACKGROUND STARDUST & DEPTH RINGS
    // =========================================================================
    const stardustCount = 700;
    const stardustPos = new Float32Array(stardustCount * 3);
    const stardustColors = new Float32Array(stardustCount * 3);
    const dustColors = [
      new THREE.Color("#00f0ff"),
      new THREE.Color("#ff2a8d"),
      new THREE.Color("#ef4444"),
      new THREE.Color("#38bdf8"),
      new THREE.Color("#fbbf24"),
    ];

    for (let s = 0; s < stardustCount; s++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rad = 4.5 + Math.random() * 8.0;

      stardustPos[s * 3] = rad * Math.sin(phi) * Math.cos(theta);
      stardustPos[s * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      stardustPos[s * 3 + 2] = rad * Math.cos(phi);

      const col = dustColors[s % dustColors.length];
      stardustColors[s * 3] = col.r;
      stardustColors[s * 3 + 1] = col.g;
      stardustColors[s * 3 + 2] = col.b;
    }

    const stardustGeo = new THREE.BufferGeometry();
    stardustGeo.setAttribute("position", new THREE.BufferAttribute(stardustPos, 3));
    stardustGeo.setAttribute("color", new THREE.BufferAttribute(stardustColors, 3));

    const stardustMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      map: whiteParticleTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stardustMesh = new THREE.Points(stardustGeo, stardustMat);
    scene.add(stardustMesh);

    // Outer Orbit Resonance Ribbons
    const createFiberRibbon = (colorHex: number, count = 400, radius = 3.6, tilt = 0.35) => {
      const posArr = new Float32Array(count * 3);
      const colArr = new Float32Array(count * 3);
      const c = new THREE.Color(colorHex);

      for (let r = 0; r < count; r++) {
        const theta = (r / count) * Math.PI * 2;
        const spreadR = radius + (Math.random() - 0.5) * 0.18;
        const x = Math.cos(theta) * spreadR;
        const y = Math.sin(theta) * spreadR * 0.7;
        const z = (Math.random() - 0.5) * 0.15;

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
        size: 0.045,
        vertexColors: true,
        map: whiteParticleTex,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      return new THREE.Points(geo, mat);
    };

    const ribbon1 = createFiberRibbon(0x00f0ff, 500, 3.4, 0.4);
    const ribbon2 = createFiberRibbon(0xff2a8d, 400, 3.7, -0.45);
    trinityGroup.add(ribbon1);
    trinityGroup.add(ribbon2);

    // =========================================================================
    // 1. S.Y.N.T.A.X. CORE (CYAN #00f0ff) - QUANTUM FILIGREE NEURAL SPHERE
    // =========================================================================
    const syntaxParticleCount = 2200;
    const syntaxPos = new Float32Array(syntaxParticleCount * 3);
    const syntaxOriginals = new Float32Array(syntaxParticleCount * 3);
    const syntaxColors = new Float32Array(syntaxParticleCount * 3);
    const syntaxCyan1 = new THREE.Color("#00f0ff");
    const syntaxCyan2 = new THREE.Color("#38bdf8");
    const syntaxWhite = new THREE.Color("#ffffff");
    const syntaxPurple = new THREE.Color("#a855f7");

    for (let i = 0; i < syntaxParticleCount; i++) {
      const u = (i / syntaxParticleCount) * Math.PI * 2;
      const v = Math.acos(2 * ((i * 0.6180339887) % 1) - 1);

      // Parametric wave filigree surface
      const filigreeR =
        0.88 +
        0.12 * Math.sin(8 * u) * Math.cos(6 * v) +
        0.04 * Math.sin(16 * u + v * 3);

      const x = filigreeR * Math.sin(v) * Math.cos(u);
      const y = filigreeR * Math.sin(v) * Math.sin(u);
      const z = filigreeR * Math.cos(v);

      syntaxPos[i * 3] = x;
      syntaxPos[i * 3 + 1] = y;
      syntaxPos[i * 3 + 2] = z;

      syntaxOriginals[i * 3] = x;
      syntaxOriginals[i * 3 + 1] = y;
      syntaxOriginals[i * 3 + 2] = z;

      const col = syntaxCyan1.clone().lerp(syntaxCyan2, Math.random());
      if (i % 6 === 0) col.lerp(syntaxWhite, 0.85);
      if (i % 14 === 0) col.lerp(syntaxPurple, 0.6);

      syntaxColors[i * 3] = col.r;
      syntaxColors[i * 3 + 1] = col.g;
      syntaxColors[i * 3 + 2] = col.b;
    }

    const syntaxGeo = new THREE.BufferGeometry();
    syntaxGeo.setAttribute("position", new THREE.BufferAttribute(syntaxPos, 3));
    syntaxGeo.setAttribute("color", new THREE.BufferAttribute(syntaxColors, 3));

    const syntaxMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      map: cyanParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const syntaxMesh = new THREE.Points(syntaxGeo, syntaxMat);
    const syntaxNodeGroup = new THREE.Group();
    syntaxNodeGroup.add(syntaxMesh);
    trinityGroup.add(syntaxNodeGroup);

    // SYNTAX Inner Crystalline Icosahedron Wireframe
    const syntaxIcoGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const syntaxIcoMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const syntaxIcoMesh = new THREE.Mesh(syntaxIcoGeo, syntaxIcoMat);
    syntaxNodeGroup.add(syntaxIcoMesh);

    // SYNTAX Dual Concentric Glowing Energy Rings
    const syntaxRing1Geo = new THREE.RingGeometry(0.98, 1.05, 64);
    const syntaxRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const syntaxRing1Mesh = new THREE.Mesh(syntaxRing1Geo, syntaxRing1Mat);
    syntaxNodeGroup.add(syntaxRing1Mesh);

    const syntaxRing2Geo = new THREE.RingGeometry(1.12, 1.16, 48);
    const syntaxRing2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const syntaxRing2Mesh = new THREE.Mesh(syntaxRing2Geo, syntaxRing2Mat);
    syntaxRing2Mesh.rotation.x = Math.PI / 3;
    syntaxNodeGroup.add(syntaxRing2Mesh);

    // =========================================================================
    // 2. N.E.O. CORE (NEON PINK #ff2a8d) - SPIRAL TORUS MATRIX & VORTEX
    // =========================================================================
    const neoParticleCount = 2200;
    const neoPos = new Float32Array(neoParticleCount * 3);
    const neoOriginals = new Float32Array(neoParticleCount * 3);
    const neoColors = new Float32Array(neoParticleCount * 3);
    const neoPink1 = new THREE.Color("#ff2a8d");
    const neoPink2 = new THREE.Color("#f43f5e");
    const neoRose = new THREE.Color("#fda4af");
    const neoViolet = new THREE.Color("#c084fc");

    for (let i = 0; i < neoParticleCount; i++) {
      const u = (i / neoParticleCount) * Math.PI * 2 * 5; // Multi-spiral loops
      const v = ((i % 120) / 120) * Math.PI * 2;
      const R = 0.85; // Major radius
      const r = 0.26 + 0.06 * Math.sin(u * 4); // Minor radius with pulsation

      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v) + (Math.random() - 0.5) * 0.06;

      neoPos[i * 3] = x;
      neoPos[i * 3 + 1] = y;
      neoPos[i * 3 + 2] = z;

      neoOriginals[i * 3] = x;
      neoOriginals[i * 3 + 1] = y;
      neoOriginals[i * 3 + 2] = z;

      const col = neoPink1.clone().lerp(neoPink2, Math.random());
      if (i % 5 === 0) col.lerp(neoRose, 0.9);
      if (i % 9 === 0) col.lerp(neoViolet, 0.7);

      neoColors[i * 3] = col.r;
      neoColors[i * 3 + 1] = col.g;
      neoColors[i * 3 + 2] = col.b;
    }

    const neoGeo = new THREE.BufferGeometry();
    neoGeo.setAttribute("position", new THREE.BufferAttribute(neoPos, 3));
    neoGeo.setAttribute("color", new THREE.BufferAttribute(neoColors, 3));

    const neoMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      map: pinkParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const neoMesh = new THREE.Points(neoGeo, neoMat);
    const neoNodeGroup = new THREE.Group();
    neoNodeGroup.add(neoMesh);
    trinityGroup.add(neoNodeGroup);

    // N.E.O. Rotating Outer Glow Torus Ring
    const neoTorusGeo = new THREE.TorusGeometry(0.96, 0.035, 16, 64);
    const neoTorusMat = new THREE.MeshBasicMaterial({
      color: 0xff2a8d,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const neoTorusMesh = new THREE.Mesh(neoTorusGeo, neoTorusMat);
    neoNodeGroup.add(neoTorusMesh);

    const neoInnerRingGeo = new THREE.RingGeometry(0.5, 0.55, 32);
    const neoInnerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff4d8d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const neoInnerRingMesh = new THREE.Mesh(neoInnerRingGeo, neoInnerRingMat);
    neoNodeGroup.add(neoInnerRingMesh);

    // =========================================================================
    // 3. V.E.G.A. CORE (CRIMSON RED #ef4444) - GYROSCOPIC MULTI-AXIS ORBITS
    // =========================================================================
    const vegaParticleCount = 2200;
    const vegaPos = new Float32Array(vegaParticleCount * 3);
    const vegaOriginals = new Float32Array(vegaParticleCount * 3);
    const vegaColors = new Float32Array(vegaParticleCount * 3);
    const vegaRed1 = new THREE.Color("#ef4444");
    const vegaRed2 = new THREE.Color("#dc2626");
    const vegaGold = new THREE.Color("#fbbf24");
    const vegaFlame = new THREE.Color("#f97316");

    for (let i = 0; i < vegaParticleCount; i++) {
      const ringIdx = i % 3; // 3 Gyroscopic Rings
      const angle = (i / (vegaParticleCount / 3)) * Math.PI * 2;
      const rad = 0.88 + (Math.random() - 0.5) * 0.07;

      let rx = Math.cos(angle) * rad;
      let ry = Math.sin(angle) * rad;
      let rz = (Math.random() - 0.5) * 0.08;

      // Apply 3 Distinct Gimbal Angles
      if (ringIdx === 1) {
        const tiltX = Math.PI / 3;
        const yNew = ry * Math.cos(tiltX) - rz * Math.sin(tiltX);
        const zNew = ry * Math.sin(tiltX) + rz * Math.cos(tiltX);
        ry = yNew;
        rz = zNew;
      } else if (ringIdx === 2) {
        const tiltY = -Math.PI / 3;
        const xNew = rx * Math.cos(tiltY) + rz * Math.sin(tiltY);
        const zNew = -rx * Math.sin(tiltY) + rz * Math.cos(tiltY);
        rx = xNew;
        rz = zNew;
      }

      vegaPos[i * 3] = rx;
      vegaPos[i * 3 + 1] = ry;
      vegaPos[i * 3 + 2] = rz;

      vegaOriginals[i * 3] = rx;
      vegaOriginals[i * 3 + 1] = ry;
      vegaOriginals[i * 3 + 2] = rz;

      const col = vegaRed1.clone().lerp(vegaRed2, Math.random());
      if (i % 6 === 0) col.lerp(vegaGold, 0.8);
      if (i % 10 === 0) col.lerp(vegaFlame, 0.7);

      vegaColors[i * 3] = col.r;
      vegaColors[i * 3 + 1] = col.g;
      vegaColors[i * 3 + 2] = col.b;
    }

    const vegaGeo = new THREE.BufferGeometry();
    vegaGeo.setAttribute("position", new THREE.BufferAttribute(vegaPos, 3));
    vegaGeo.setAttribute("color", new THREE.BufferAttribute(vegaColors, 3));

    const vegaMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      map: redParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const vegaMesh = new THREE.Points(vegaGeo, vegaMat);
    const vegaNodeGroup = new THREE.Group();
    vegaNodeGroup.add(vegaMesh);
    trinityGroup.add(vegaNodeGroup);

    // V.E.G.A. 3 Interlocking Gyroscope Rings
    const createGyroRing = (tiltX: number, tiltY: number, colorHex: number) => {
      const rGeo = new THREE.RingGeometry(0.94, 1.0, 48);
      const rMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = tiltX;
      rMesh.rotation.y = tiltY;
      return rMesh;
    };

    const vegaRing1 = createGyroRing(0, 0, 0xef4444);
    const vegaRing2 = createGyroRing(Math.PI / 3, 0, 0xf97316);
    const vegaRing3 = createGyroRing(0, -Math.PI / 3, 0xfbbf24);
    vegaNodeGroup.add(vegaRing1);
    vegaNodeGroup.add(vegaRing2);
    vegaNodeGroup.add(vegaRing3);

    // =========================================================================
    // 4. CENTRAL TRINITY FUSION VORTEX & INTER-CONNECTING LASER SPLINES
    // =========================================================================
    const centralVortexCount = 1400;
    const vortexPos = new Float32Array(centralVortexCount * 3);
    const vortexColors = new Float32Array(centralVortexCount * 3);

    for (let i = 0; i < centralVortexCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 1.8) * 1.6;
      const height = (Math.random() - 0.5) * 0.7;

      vortexPos[i * 3] = Math.cos(theta) * r;
      vortexPos[i * 3 + 1] = Math.sin(theta) * r;
      vortexPos[i * 3 + 2] = height;

      const pick = i % 3;
      const c = pick === 0 ? syntaxCyan1 : pick === 1 ? neoPink1 : vegaRed1;
      vortexColors[i * 3] = c.r;
      vortexColors[i * 3 + 1] = c.g;
      vortexColors[i * 3 + 2] = c.b;
    }

    const vortexGeo = new THREE.BufferGeometry();
    vortexGeo.setAttribute("position", new THREE.BufferAttribute(vortexPos, 3));
    vortexGeo.setAttribute("color", new THREE.BufferAttribute(vortexColors, 3));

    const vortexMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      map: whiteParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const vortexMesh = new THREE.Points(vortexGeo, vortexMat);
    trinityGroup.add(vortexMesh);

    // Central Singularity Glowing Core
    const singularityGeo = new THREE.RingGeometry(0.08, 0.45, 32);
    const singularityMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const singularityMesh = new THREE.Mesh(singularityGeo, singularityMat);
    trinityGroup.add(singularityMesh);

    // Spline Energy Laser Cables connecting the 3 Nodes in Triad
    const triadBeamLinesGroup = new THREE.Group();
    trinityGroup.add(triadBeamLinesGroup);

    const createTriadCable = (colHex: number) => {
      const numPts = 30;
      const pos = new Float32Array(numPts * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.LineBasicMaterial({
        color: colHex,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      return new THREE.Line(geo, mat);
    };

    const cableSM = createTriadCable(0x00f0ff); // Syntax -> Neo
    const cableNV = createTriadCable(0xff2a8d); // Neo -> Vega
    const cableVS = createTriadCable(0xef4444); // Vega -> Syntax
    triadBeamLinesGroup.add(cableSM);
    triadBeamLinesGroup.add(cableNV);
    triadBeamLinesGroup.add(cableVS);

    // Fast-traveling Laser Data Packets
    const beamPacketCount = 42;
    const packetPos = new Float32Array(beamPacketCount * 3);
    const packetColors = new Float32Array(beamPacketCount * 3);

    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
    packetGeo.setAttribute("color", new THREE.BufferAttribute(packetColors, 3));

    const packetMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      map: whiteParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const packetMesh = new THREE.Points(packetGeo, packetMat);
    trinityGroup.add(packetMesh);

    // =========================================================================
    // 5. USER RED PARTICLE BALL (SPEECH INPUT REACTIVE)
    // =========================================================================
    const userParticleCount = 480;
    const userPos = new Float32Array(userParticleCount * 3);
    const userOriginals = new Float32Array(userParticleCount * 3);
    const userColors = new Float32Array(userParticleCount * 3);
    const userRed1 = new THREE.Color("#ef4444");
    const userRed2 = new THREE.Color("#b91c1c");

    for (let u = 0; u < userParticleCount; u++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.PI * 2 * Math.random();
      const r = 0.38 + Math.random() * 0.06;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      userPos[u * 3] = x;
      userPos[u * 3 + 1] = y;
      userPos[u * 3 + 2] = z;

      userOriginals[u * 3] = x;
      userOriginals[u * 3 + 1] = y;
      userOriginals[u * 3 + 2] = z;

      const mixC = userRed1.clone().lerp(userRed2, Math.random());
      userColors[u * 3] = mixC.r;
      userColors[u * 3 + 1] = mixC.g;
      userColors[u * 3 + 2] = mixC.b;
    }

    const userGeo = new THREE.BufferGeometry();
    userGeo.setAttribute("position", new THREE.BufferAttribute(userPos, 3));
    userGeo.setAttribute("color", new THREE.BufferAttribute(userColors, 3));

    const userMat = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      map: redParticleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const userMesh = new THREE.Points(userGeo, userMat);
    const userBallPos = new THREE.Vector3(0, -2.2, 0.2);
    userMesh.position.copy(userBallPos);
    scene.add(userMesh);

    // User Mic Pulse Ring
    const userRingGeo = new THREE.RingGeometry(0.42, 0.48, 48);
    const userRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const userRingMesh = new THREE.Mesh(userRingGeo, userRingMat);
    userRingMesh.position.copy(userBallPos);
    scene.add(userRingMesh);

    // =========================================================================
    // 6. MOUSE & TOUCH 3D CONTROLS
    // =========================================================================
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

      camera.position.x -= dx * 0.007;
      camera.position.y += dy * 0.007;

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(16.0, camera.position.z + e.deltaY * 0.007));
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

      camera.position.x -= dx * 0.007;
      camera.position.y += dy * 0.007;

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

    // =========================================================================
    // 7. ANIMATION & VOICE HARMONIC SYNTHESIS LOOP
    // =========================================================================
    let animId: number;
    const startTime = performance.now();
    const tempVec = new THREE.Vector3();

    // Helper to update bezier cable points between 2 nodes with organic wave
    const updateCableSpline = (cable: THREE.Line, p1: THREE.Vector3, p2: THREE.Vector3, time: number, offset: number) => {
      const posAttr = cable.geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const count = posArr.length / 3;

      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const bx = THREE.MathUtils.lerp(p1.x, p2.x, t);
        const by = THREE.MathUtils.lerp(p1.y, p2.y, t);
        const bz = THREE.MathUtils.lerp(p1.z, p2.z, t);

        const sag = Math.sin(t * Math.PI) * 0.15;
        const wave = Math.sin(t * 6 - time * 2 + offset) * 0.06 * Math.sin(t * Math.PI);

        posArr[i * 3] = bx;
        posArr[i * 3 + 1] = by - sag + wave;
        posArr[i * 3 + 2] = bz + wave * 0.5;
      }
      posAttr.needsUpdate = true;
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const time = (performance.now() - startTime) * 0.001;
      const currentActive = activeAgentRef.current;
      const currentMic = micLevelRef.current || 0;
      const currentSpeaking = speakingLevelRef.current || 0;

      // Slow cinematic Trinity Nexus rotation
      trinityGroup.rotation.y = time * 0.2;
      trinityGroup.rotation.x = Math.sin(time * 0.12) * 0.07;

      // Stardust background slow spin
      stardustMesh.rotation.y = -time * 0.03;
      ribbon1.rotation.z = time * 0.08;
      ribbon2.rotation.z = -time * 0.06;

      // Orbit Positions for The Big 3 (Equilateral Triad in 3D Space)
      const orbitDist = 2.05;
      const sAngle = 0; // S.Y.N.T.A.X. (Angle 0)
      const nAngle = (Math.PI * 2) / 3; // N.E.O. (Angle 120°)
      const vAngle = (Math.PI * 4) / 3; // V.E.G.A. (Angle 240°)

      const sPos = new THREE.Vector3(Math.cos(sAngle) * orbitDist, Math.sin(sAngle) * orbitDist, Math.sin(time * 0.8) * 0.2);
      const nPos = new THREE.Vector3(Math.cos(nAngle) * orbitDist, Math.sin(nAngle) * orbitDist, Math.cos(time * 0.8) * 0.2);
      const vPos = new THREE.Vector3(Math.cos(vAngle) * orbitDist, Math.sin(vAngle) * orbitDist, -Math.sin(time * 0.8) * 0.2);

      syntaxNodeGroup.position.copy(sPos);
      neoNodeGroup.position.copy(nPos);
      vegaNodeGroup.position.copy(vPos);

      // Core Self Rotations
      syntaxNodeGroup.rotation.y = time * 0.5;
      syntaxNodeGroup.rotation.z = time * 0.25;
      syntaxIcoMesh.rotation.x = -time * 0.6;
      syntaxRing1Mesh.rotation.z = time * 0.7;

      neoNodeGroup.rotation.x = time * 0.6;
      neoNodeGroup.rotation.z = -time * 0.35;
      neoTorusMesh.rotation.y = time * 0.8;

      vegaNodeGroup.rotation.y = -time * 0.7;
      vegaNodeGroup.rotation.x = time * 0.45;
      vegaRing1.rotation.z = time * 0.9;
      vegaRing2.rotation.y = -time * 0.8;
      vegaRing3.rotation.x = time * 0.75;

      // Audio Reactivity Per Core
      const isSyntaxSpeaking = currentActive === "maze" || currentActive === "syntax" || (syntaxAgent.id === currentAgent.id && currentSpeaking > 0);
      const isNeoSpeaking = currentActive === "neo" || (neoAgent.id === currentAgent.id && currentSpeaking > 0);
      const isVegaSpeaking = currentActive === "vega" || (vegaAgent.id === currentAgent.id && currentSpeaking > 0);

      // --- Pulse S.Y.N.T.A.X. ---
      const sScale = 1.0 + (isSyntaxSpeaking ? 0.28 + (currentSpeaking / 100) * 0.4 : 0.05 * Math.sin(time * 3));
      syntaxNodeGroup.scale.set(sScale, sScale, sScale);
      (syntaxRing1Mat as THREE.MeshBasicMaterial).opacity = isSyntaxSpeaking ? 0.95 : 0.5;

      // --- Pulse N.E.O. ---
      const nScale = 1.0 + (isNeoSpeaking ? 0.28 + (currentSpeaking / 100) * 0.4 : 0.05 * Math.cos(time * 3));
      neoNodeGroup.scale.set(nScale, nScale, nScale);
      (neoTorusMat as THREE.MeshBasicMaterial).opacity = isNeoSpeaking ? 0.95 : 0.5;

      // --- Pulse V.E.G.A. ---
      const vScale = 1.0 + (isVegaSpeaking ? 0.28 + (currentSpeaking / 100) * 0.4 : 0.05 * Math.sin(time * 2.5 + 1));
      vegaNodeGroup.scale.set(vScale, vScale, vScale);

      // --- Update Central Singularity & Vortex ---
      vortexMesh.rotation.z = -time * 0.85;
      const vortexScale = 1.0 + (currentSpeaking > 0 ? (currentSpeaking / 100) * 0.45 : 0.08 * Math.sin(time * 4));
      vortexMesh.scale.set(vortexScale, vortexScale, 1.0);

      const singScale = 1.0 + Math.sin(time * 6) * 0.2 + (currentSpeaking / 100) * 0.5;
      singularityMesh.scale.set(singScale, singScale, 1.0);
      (singularityMat as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 4) * 0.2;

      // Update Bezier Cables
      updateCableSpline(cableSM, sPos, nPos, time, 0);
      updateCableSpline(cableNV, nPos, vPos, time, 1);
      updateCableSpline(cableVS, vPos, sPos, time, 2);

      // --- Animate Laser Data Packets along Triad Cables ---
      const pArr = packetGeo.attributes.position.array as Float32Array;
      const cArr = packetGeo.attributes.color.array as Float32Array;
      const nodes = [sPos, nPos, vPos];
      const nodeColors = [syntaxCyan1, neoPink1, vegaRed1];

      for (let p = 0; p < beamPacketCount; p++) {
        const seg = p % 3; // 0: S->N, 1: N->V, 2: V->S
        const fromNode = nodes[seg];
        const toNode = nodes[(seg + 1) % 3];
        const progress = ((time * 0.75 + p / beamPacketCount) % 1);

        const px = fromNode.x + (toNode.x - fromNode.x) * progress;
        const py = fromNode.y + (toNode.y - fromNode.y) * progress;
        const pz = fromNode.z + (toNode.z - fromNode.z) * progress;

        pArr[p * 3] = px;
        pArr[p * 3 + 1] = py;
        pArr[p * 3 + 2] = pz;

        const baseCol = nodeColors[seg];
        cArr[p * 3] = baseCol.r;
        cArr[p * 3 + 1] = baseCol.g;
        cArr[p * 3 + 2] = baseCol.b;
      }
      packetGeo.attributes.position.needsUpdate = true;
      packetGeo.attributes.color.needsUpdate = true;

      // --- Animate User RED PARTICLE BALL during Speech ---
      const isVoiceActive = state === "listening" || currentMic > 0;
      userMesh.visible = isVoiceActive;
      userRingMesh.visible = isVoiceActive;

      if (isVoiceActive) {
        const uPosArr = userGeo.attributes.position.array as Float32Array;
        const userScale = 1.0 + (currentMic / 100) * 0.6 + Math.sin(time * 4) * 0.06;

        userMesh.rotation.y = time * 0.7;
        for (let u = 0; u < userParticleCount; u++) {
          uPosArr[u * 3] = userOriginals[u * 3] * userScale;
          uPosArr[u * 3 + 1] = userOriginals[u * 3 + 1] * userScale;
          uPosArr[u * 3 + 2] = userOriginals[u * 3 + 2] * userScale;
        }
        userGeo.attributes.position.needsUpdate = true;

        const uRingScale = 1.0 + (currentMic / 100) * 0.75;
        userRingMesh.scale.set(uRingScale, uRingScale, 1);
        (userRingMesh.material as THREE.MeshBasicMaterial).opacity = 0.4 + (currentMic / 100) * 0.5;
      }

      // --- Project 3D Node Positions to 2D Screen for HTML Badges ---
      const projectNode = (nodePos: THREE.Vector3) => {
        tempVec.copy(nodePos).applyMatrix4(trinityGroup.matrixWorld);
        tempVec.project(camera);
        return {
          x: (tempVec.x * 0.5 + 0.5) * 100,
          y: (-tempVec.y * 0.5 + 0.5) * 100,
          visible: tempVec.z < 1,
        };
      };

      const sProj = projectNode(sPos);
      const nProj = projectNode(nPos);
      const vProj = projectNode(vPos);

      setBadgePos({
        syntax: sProj,
        neo: nProj,
        vega: vProj,
      });

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
    activeSpeakingAgentId === "maze" ||
    activeSpeakingAgentId === "syntax" ||
    ((currentAgent.id === "maze" || currentAgent.id === "syntax") && speakingLevel > 0);
  const isNeoSpeaking = activeSpeakingAgentId === "neo" || (currentAgent.id === "neo" && speakingLevel > 0);
  const isVegaSpeaking = activeSpeakingAgentId === "vega" || (currentAgent.id === "vega" && speakingLevel > 0);
  const isVoiceActive = state === "listening" || micLevel > 0;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#010308] overflow-hidden select-none cursor-grab active:cursor-grabbing font-mono">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top Left View Control HUD */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-500/50 text-amber-300 font-mono text-[10.5px] font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-md">
          <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>👑 THE BIG 3 // TRI-CORE SOVEREIGN MATRIX</span>
        </div>
        <button
          onClick={handleResetCamera}
          className="px-2.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/60 text-amber-200 font-mono text-[10px] font-bold transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
          title="Kamera auf Tri-Core Zentrum zurücksetzen"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET</span>
        </button>
      </div>

      {/* Top Right Parallel Co-Processor Status Telemetry HUD */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 font-mono text-[10px] text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center gap-2.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>PARALLEL TRIAD: <strong className="text-white">SYNTAX • NEO • VEGA</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>

      {/* 3D-Projected Floating Agent Interactive HUD Badges */}
      
      {/* 1. S.Y.N.T.A.X. Badge (Cyan) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-75 z-20"
        style={{
          left: `${badgePos.syntax.x}%`,
          top: `${badgePos.syntax.y}%`,
          display: badgePos.syntax.visible ? "block" : "none",
        }}
      >
        <button
          onClick={() => onSelectAgent?.(syntaxAgent)}
          className={`px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold cursor-pointer transition-all duration-300 flex items-center gap-2.5 border shadow-lg ${
            isSyntaxSpeaking
              ? "bg-cyan-950/95 border-2 border-cyan-300 text-white shadow-[0_0_35px_rgba(0,240,255,0.95)] scale-110 animate-bounce z-30"
              : "bg-slate-950/85 hover:bg-slate-900 border-cyan-500/60 text-cyan-300 hover:text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-100"
          }`}
          title="S.Y.N.T.A.X. Sovereign Master Brain auswählen"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[10.5px]">S.Y.N.T.A.X. // CORE #01</span>
            <span className="text-[8px] text-cyan-400/80 font-normal">MASTER BRAIN & ROUTER</span>
          </div>
          {isSyntaxSpeaking && <Volume2 className="w-4 h-4 text-cyan-300 animate-pulse" />}
        </button>
      </div>

      {/* 2. N.E.O. Badge (Pink) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-75 z-20"
        style={{
          left: `${badgePos.neo.x}%`,
          top: `${badgePos.neo.y}%`,
          display: badgePos.neo.visible ? "block" : "none",
        }}
      >
        <button
          onClick={() => onSelectAgent?.(neoAgent)}
          className={`px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold cursor-pointer transition-all duration-300 flex items-center gap-2.5 border shadow-lg ${
            isNeoSpeaking
              ? "bg-pink-950/95 border-2 border-pink-300 text-white shadow-[0_0_35px_rgba(255,42,141,0.95)] scale-110 animate-bounce z-30"
              : "bg-slate-950/85 hover:bg-slate-900 border-pink-500/60 text-pink-300 hover:text-white shadow-[0_0_20px_rgba(255,42,141,0.4)] scale-100"
          }`}
          title="N.E.O. Vision & Veo Studio auswählen"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse shadow-[0_0_8px_#ff2a8d]" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[10.5px]">N.E.O. // CORE #02</span>
            <span className="text-[8px] text-pink-400/80 font-normal">VISION & VEO STUDIO</span>
          </div>
          {isNeoSpeaking && <Volume2 className="w-4 h-4 text-pink-300 animate-pulse" />}
        </button>
      </div>

      {/* 3. V.E.G.A. Badge (Crimson Red) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-75 z-20"
        style={{
          left: `${badgePos.vega.x}%`,
          top: `${badgePos.vega.y}%`,
          display: badgePos.vega.visible ? "block" : "none",
        }}
      >
        <button
          onClick={() => onSelectAgent?.(vegaAgent)}
          className={`px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold cursor-pointer transition-all duration-300 flex items-center gap-2.5 border shadow-lg ${
            isVegaSpeaking
              ? "bg-rose-950/95 border-2 border-rose-300 text-white shadow-[0_0_35px_rgba(239,68,68,0.95)] scale-110 animate-bounce z-30"
              : "bg-slate-950/85 hover:bg-slate-900 border-rose-500/60 text-rose-300 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-100"
          }`}
          title="V.E.G.A. Tactical Data & Code Matrix auswählen"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#ef4444]" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[10.5px]">V.E.G.A. // CORE #03</span>
            <span className="text-[8px] text-rose-400/80 font-normal">TACTICAL DATA & CODE</span>
          </div>
          {isVegaSpeaking && <Volume2 className="w-4 h-4 text-rose-300 animate-pulse" />}
        </button>
      </div>

      {/* User Red Particle Ball Label at Bottom - ONLY visible in speech / voice chat */}
      {isVoiceActive && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center text-center z-10 animate-fade-in">
          <div className="px-3 py-1 rounded-full bg-red-950/85 border border-red-500/60 text-red-300 font-mono text-[9.5px] font-bold tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>DU (USER // LIVE SPEECH INPUT)</span>
          </div>
        </div>
      )}

      {/* Bottom Center Scope Navigation Ribbon */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-3 px-5 py-2 rounded-full bg-[#050b14]/90 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
          <button
            onClick={() => onSelectAgent?.(syntaxAgent)}
            className="flex items-center gap-1.5 text-cyan-300 hover:text-white font-bold cursor-pointer transition hover:scale-105"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            <span>SYNTAX</span>
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => onSelectAgent?.(neoAgent)}
            className="flex items-center gap-1.5 text-pink-300 hover:text-white font-bold cursor-pointer transition hover:scale-105"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_6px_#ff2a8d]" />
            <span>NEO</span>
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => onSelectAgent?.(vegaAgent)}
            className="flex items-center gap-1.5 text-rose-300 hover:text-white font-bold cursor-pointer transition hover:scale-105"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#ef4444]" />
            <span>VEGA</span>
          </button>
          {onOpenChat && (
            <>
              <span className="text-amber-500/50">|</span>
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 font-bold cursor-pointer transition hover:scale-105 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                title="The Big 3 Tri-Core Chat öffnen"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                <span className="tracking-wider">THE BIG 3 CHAT</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
