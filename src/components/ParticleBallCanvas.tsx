import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type SpherePalette = "sunset" | "cyan-neon" | "amber-gold";

export interface SystemCoreInfo {
  id: string;
  name: string;
  shortName: string;
  role: string;
  color: string;
  hex: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  phaseOffset: number;
}

export const SYSTEM_CORES: SystemCoreInfo[] = [
  { id: "papaya", name: "Papaya Core", shortName: "PAPAYA", role: "Master Synthesis & Orchestration", color: "#ff6b35", hex: 0xff6b35, orbitRadius: 2.35, orbitSpeed: 0.35, orbitTilt: 0.12, phaseOffset: 0 },
  { id: "neo", name: "N.E.O.", shortName: "N.E.O.", role: "Zero-Latency Screen Perception", color: "#06b6d4", hex: 0x06b6d4, orbitRadius: 2.55, orbitSpeed: 0.42, orbitTilt: 0.54, phaseOffset: (Math.PI * 2 * 1) / 8 },
  { id: "vega", name: "Vega", shortName: "VEGA", role: "Gmail Autonomous Inbox Triage", color: "#3b82f6", hex: 0x3b82f6, orbitRadius: 2.45, orbitSpeed: 0.48, orbitTilt: -0.42, phaseOffset: (Math.PI * 2 * 2) / 8 },
  { id: "odin", name: "Odin", shortName: "ODIN", role: "Full-Stack Code & Terminal Runtime", color: "#10b981", hex: 0x10b981, orbitRadius: 2.65, orbitSpeed: 0.38, orbitTilt: 0.72, phaseOffset: (Math.PI * 2 * 3) / 8 },
  { id: "pulse", name: "Pulse", shortName: "PULSE", role: "Social Viral Engine & Trend Radar", color: "#f43f5e", hex: 0xf43f5e, orbitRadius: 2.5, orbitSpeed: 0.45, orbitTilt: -0.65, phaseOffset: (Math.PI * 2 * 4) / 8 },
  { id: "chronos", name: "Chronos", shortName: "CHRONOS", role: "Autonomous Calendar & Time Control", color: "#eab308", hex: 0xeab308, orbitRadius: 2.6, orbitSpeed: 0.40, orbitTilt: 0.32, phaseOffset: (Math.PI * 2 * 5) / 8 },
  { id: "osiris", name: "Osiris", shortName: "OSIRIS", role: "3D Neural Memory & Deep Intel", color: "#8b5cf6", hex: 0x8b5cf6, orbitRadius: 2.7, orbitSpeed: 0.34, orbitTilt: -0.38, phaseOffset: (Math.PI * 2 * 6) / 8 },
  { id: "lyra", name: "Lyra", shortName: "LYRA", role: "Google Veo 3.1 8K Video Studio", color: "#ec4899", hex: 0xec4899, orbitRadius: 2.48, orbitSpeed: 0.50, orbitTilt: 0.62, phaseOffset: (Math.PI * 2 * 7) / 8 },
];

interface ParticleBallCanvasProps {
  className?: string;
  size?: number;
  interactive?: boolean;
  palette?: SpherePalette;
  badgeText?: string;
  hideBadge?: boolean;
  speedMultiplier?: number;
  intensity?: number;
  onSelectNode?: (name: string) => void;
}

// Create crisp radial glowing particle texture
function createParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.18, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.38, "rgba(255, 240, 220, 0.7)");
    grad.addColorStop(0.68, "rgba(255, 140, 70, 0.25)");
    grad.addColorStop(0.92, "rgba(255, 80, 40, 0.06)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Inner glowing energy core sprite texture
function createCoreGlowTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    grad.addColorStop(0.2, colorHex);
    grad.addColorStop(0.55, "rgba(255, 107, 53, 0.22)");
    grad.addColorStop(0.85, "rgba(255, 42, 141, 0.05)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Create beacon dot texture for the satellite cores
function createSatelliteBeaconTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.3, colorHex);
    grad.addColorStop(0.7, colorHex + "44");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Crisp holographic 3D label badge for each system core
function createSatelliteLabelTexture(name: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 48;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 160, 48);
    // Background pill badge
    ctx.fillStyle = "rgba(10, 10, 12, 0.75)";
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(4, 4, 152, 40, 8);
    } else {
      ctx.rect(4, 4, 152, 40);
    }
    ctx.fill();
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Node indicator dot
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(22, 24, 5, 0, Math.PI * 2);
    ctx.fill();

    // Core name text
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, 36, 24);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const ParticleBallCanvas: React.FC<ParticleBallCanvasProps> = ({
  className = "",
  size = 500,
  palette = "sunset",
  speedMultiplier = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || size;
    const height = container.clientHeight || size;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent blend on deep black background
    renderer.domElement.style.touchAction = "pan-y";
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // 1. CENTRAL SOVEREIGN KERNEL (PAPAYA NEURAL NEXUS)
    // -------------------------------------------------------------
    const primaryGlowColor = palette === "cyan-neon" ? "#00f5d4" : palette === "amber-gold" ? "#f59e0b" : "#ff6b35";
    const coreTexture = createCoreGlowTexture(primaryGlowColor);
    const coreMaterial = new THREE.SpriteMaterial({
      map: coreTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreSprite = new THREE.Sprite(coreMaterial);
    coreSprite.scale.set(3.2, 3.2, 1);
    scene.add(coreSprite);

    // -------------------------------------------------------------
    // 2. MAIN NEURAL KERNEL LATTICE (CALM, NON-SPINNABLE CORE MESH)
    // -------------------------------------------------------------
    const isMobile = width < 360;
    const NUM_RINGS = isMobile ? 22 : 28;
    const BASE_SPHERE_RADIUS = 1.75;

    const ringData: {
      phi: number;
      cosPhi: number;
      sinPhi: number;
      ptsInRing: number;
      normY: number;
    }[] = [];

    let totalPoints = 0;
    for (let r = 0; r < NUM_RINGS; r++) {
      const normY = -1 + (2 * (r + 0.5)) / NUM_RINGS;
      const phi = Math.asin(normY);
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      const maxPts = isMobile ? 20 : 26;
      const ptsInRing = Math.max(8, Math.round(maxPts * Math.max(0.2, cosPhi)));
      ringData.push({ phi, cosPhi, sinPhi, ptsInRing, normY });
      totalPoints += ptsInRing;
    }

    const positions = new Float32Array(totalPoints * 3);
    const basePositions = new Float32Array(totalPoints * 3);
    const unitDirs = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);

    const colorTop = new THREE.Color("#ffa14a"); // Warm Sunburst
    const colorMid = new THREE.Color("#ff6b35"); // Papaya Orange
    const colorBot = new THREE.Color("#d91b72"); // Electric Magenta

    let pIdx = 0;
    for (let r = 0; r < NUM_RINGS; r++) {
      const { cosPhi, sinPhi, ptsInRing, normY } = ringData[r];
      const ringOffset = r % 2 === 0 ? 0 : Math.PI / ptsInRing;

      for (let i = 0; i < ptsInRing; i++) {
        const theta = (i / ptsInRing) * Math.PI * 2 + ringOffset;
        const ux = cosPhi * Math.cos(theta);
        const uy = sinPhi;
        const uz = cosPhi * Math.sin(theta);

        const x = ux * BASE_SPHERE_RADIUS;
        const y = uy * BASE_SPHERE_RADIUS;
        const z = uz * BASE_SPHERE_RADIUS;

        const p = pIdx * 3;
        positions[p] = x;
        positions[p + 1] = y;
        positions[p + 2] = z;

        basePositions[p] = x;
        basePositions[p + 1] = y;
        basePositions[p + 2] = z;

        unitDirs[p] = ux;
        unitDirs[p + 1] = uy;
        unitDirs[p + 2] = uz;

        const t = (normY + 1) / 2;
        const c = new THREE.Color();
        if (t < 0.5) {
          c.lerpColors(colorBot, colorMid, t / 0.5);
        } else {
          c.lerpColors(colorMid, colorTop, (t - 0.5) / 0.5);
        }

        colors[p] = c.r;
        colors[p + 1] = c.g;
        colors[p + 2] = c.b;

        pIdx++;
      }
    }

    const sphereGeometry = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    sphereGeometry.setAttribute("position", posAttr);
    sphereGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleTexture = createParticleTexture();
    const sphereMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.075 : 0.088,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95,
    });

    const spherePoints = new THREE.Points(sphereGeometry, sphereMaterial);
    scene.add(spherePoints);

    // -------------------------------------------------------------
    // 3. THE 8 SPECIALIZED AGENT CORE SATELLITE BEACONS
    // -------------------------------------------------------------
    const coreSprites: THREE.Sprite[] = [];
    const coreLabelSprites: THREE.Sprite[] = [];
    const coreClusterPoints: THREE.Points[] = [];
    const corePositionsArr: THREE.Vector3[] = SYSTEM_CORES.map(() => new THREE.Vector3());

    SYSTEM_CORES.forEach((core) => {
      // Beacon Sprite
      const beaconTex = createSatelliteBeaconTexture(core.color);
      const beaconMat = new THREE.SpriteMaterial({
        map: beaconTex,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beaconSprite = new THREE.Sprite(beaconMat);
      beaconSprite.scale.set(0.65, 0.65, 1);
      scene.add(beaconSprite);
      coreSprites.push(beaconSprite);

      // Core System Label Sprite (represents the active agent node)
      const labelTex = createSatelliteLabelTexture(core.shortName, core.color);
      const labelMat = new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.scale.set(0.9, 0.27, 1);
      scene.add(labelSprite);
      coreLabelSprites.push(labelSprite);

      // Micro satellite particle cluster (3 tiny points surrounding the beacon)
      const clusterGeo = new THREE.BufferGeometry();
      const clusterPos = new Float32Array(9);
      const clusterColors = new Float32Array(9);
      const col = new THREE.Color(core.hex);

      for (let c = 0; c < 3; c++) {
        clusterColors[c * 3] = col.r;
        clusterColors[c * 3 + 1] = col.g;
        clusterColors[c * 3 + 2] = col.b;
      }
      clusterGeo.setAttribute("position", new THREE.BufferAttribute(clusterPos, 3));
      clusterGeo.setAttribute("color", new THREE.BufferAttribute(clusterColors, 3));

      const clusterMat = new THREE.PointsMaterial({
        size: 0.05,
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.9,
      });
      const clusterMesh = new THREE.Points(clusterGeo, clusterMat);
      scene.add(clusterMesh);
      coreClusterPoints.push(clusterMesh);
    });

    // -------------------------------------------------------------
    // 4. SYNAPTIC MESH DATA BEAMS (INTER-CORE LASER PATHWAYS)
    // -------------------------------------------------------------
    // 8 beams to center + 8 peer connections = 16 line segments = 32 vertices
    const NUM_BEAMS = 16;
    const beamPositions = new Float32Array(NUM_BEAMS * 2 * 3);
    const beamColors = new Float32Array(NUM_BEAMS * 2 * 3);

    const beamGeometry = new THREE.BufferGeometry();
    const beamPosAttr = new THREE.BufferAttribute(beamPositions, 3);
    beamGeometry.setAttribute("position", beamPosAttr);
    beamGeometry.setAttribute("color", new THREE.BufferAttribute(beamColors, 3));

    const beamMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamLines = new THREE.LineSegments(beamGeometry, beamMaterial);
    scene.add(beamLines);

    // -------------------------------------------------------------
    // 5. HIGH-SPEED SYNAPTIC DATA PACKETS (PHOTON SPARKS)
    // -------------------------------------------------------------
    const PACKET_COUNT = 24;
    const packetPositions = new Float32Array(PACKET_COUNT * 3);
    const packetColors = new Float32Array(PACKET_COUNT * 3);
    const packetProgress = new Float32Array(PACKET_COUNT);
    const packetSpeeds = new Float32Array(PACKET_COUNT);
    const packetCores = new Int32Array(PACKET_COUNT);

    for (let p = 0; p < PACKET_COUNT; p++) {
      packetProgress[p] = Math.random();
      packetSpeeds[p] = 0.4 + Math.random() * 0.7;
      packetCores[p] = p % SYSTEM_CORES.length;

      const c = new THREE.Color(SYSTEM_CORES[packetCores[p]].hex);
      packetColors[p * 3] = c.r;
      packetColors[p * 3 + 1] = c.g;
      packetColors[p * 3 + 2] = c.b;
    }

    const packetGeometry = new THREE.BufferGeometry();
    const packetPosAttr = new THREE.BufferAttribute(packetPositions, 3);
    packetGeometry.setAttribute("position", packetPosAttr);
    packetGeometry.setAttribute("color", new THREE.BufferAttribute(packetColors, 3));

    const packetMaterial = new THREE.PointsMaterial({
      size: 0.09,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95,
    });
    const packetPoints = new THREE.Points(packetGeometry, packetMaterial);
    scene.add(packetPoints);

    // -------------------------------------------------------------
    // 6. CYBERNETIC ORBITAL GUIDE RINGS (SYSTEM TRAJECTORIES)
    // -------------------------------------------------------------
    const createOrbitRing = (radius: number, tiltX: number, tiltY: number, colorHex: number, opacity: number) => {
      const ringPts = 64;
      const ringPos = new Float32Array((ringPts + 1) * 3);
      for (let i = 0; i <= ringPts; i++) {
        const theta = (i / ringPts) * Math.PI * 2;
        ringPos[i * 3] = Math.cos(theta) * radius;
        ringPos[i * 3 + 1] = Math.sin(theta) * radius;
        ringPos[i * 3 + 2] = 0;
      }
      const ringGeo = new THREE.BufferGeometry();
      ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
      const ringMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.LineLoop(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      return ring;
    };

    const ringEquator = createOrbitRing(2.45, Math.PI / 2.2, 0.15, 0xff6b35, 0.22);
    const ringInclined = createOrbitRing(2.65, Math.PI / 3.2, 0.45, 0x06b6d4, 0.18);
    const ringPolar = createOrbitRing(2.75, -Math.PI / 3.0, -0.35, 0x8b5cf6, 0.16);

    scene.add(ringEquator);
    scene.add(ringInclined);
    scene.add(ringPolar);

    // -------------------------------------------------------------
    // 7. GENTLE SPATIAL PARALLAX ONLY (NO DRAGGING, NO SPARK TOSS)
    // -------------------------------------------------------------
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || size;
      const h = container.clientHeight || size;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // -------------------------------------------------------------
    // 8. SERENE AUTONOMOUS SYSTEM CLOCK & ANIMATION LOOP
    // -------------------------------------------------------------
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) * 0.001 * speedMultiplier;

      // 1. Biological Neural Breathing Pulse of the Master Nexus
      const breathingPhase = Math.sin(t * 1.5) * 0.5 + 0.5;
      const breathingScale = 1.0 + Math.sin(t * 1.5) * 0.035;
      coreSprite.scale.set(3.0 + breathingPhase * 0.45, 3.0 + breathingPhase * 0.45, 1);
      coreMaterial.opacity = 0.65 + breathingPhase * 0.25;

      // 2. Animate Core Particle Lattice Waves
      const posArr = posAttr.array as Float32Array;
      for (let i = 0; i < totalPoints; i++) {
        const p = i * 3;
        const bx = basePositions[p];
        const by = basePositions[p + 1];
        const bz = basePositions[p + 2];
        const ux = unitDirs[p];
        const uy = unitDirs[p + 1];
        const uz = unitDirs[p + 2];

        // Smooth multi-harmonic surface current
        const wave = Math.sin(uy * 4.8 + t * 2.0) * 0.045 + Math.cos(ux * 4.2 + uz * 4.2 + t * 1.6) * 0.035;
        const scale = breathingScale + wave;

        posArr[p] = bx * scale;
        posArr[p + 1] = by * scale;
        posArr[p + 2] = bz * scale;
      }
      posAttr.needsUpdate = true;

      // 3. Autonomous celestial rotation around the axis (CALM & DIGNIFIED)
      spherePoints.rotation.y = t * 0.1;
      spherePoints.rotation.x = 0.18 + Math.sin(t * 0.15) * 0.04;

      ringEquator.rotation.z = t * 0.05;
      ringInclined.rotation.z = -t * 0.04;
      ringPolar.rotation.z = t * 0.03;

      // 4. Update the 8 Satellite Agent Cores along their orbital trajectories
      SYSTEM_CORES.forEach((core, idx) => {
        const ang = t * core.orbitSpeed + core.phaseOffset;
        const r = core.orbitRadius + Math.sin(t * 1.2 + idx) * 0.06;
        const tilt = core.orbitTilt;

        // Position in 3D tilted orbit
        const ox = Math.cos(ang) * r;
        const oy = Math.sin(ang) * Math.sin(tilt) * r;
        const oz = Math.sin(ang) * Math.cos(tilt) * r;

        // Apply system Y-rotation drift
        const cosY = Math.cos(t * 0.06);
        const sinY = Math.sin(t * 0.06);
        const rx = ox * cosY - oz * sinY;
        const rz = ox * sinY + oz * cosY;

        corePositionsArr[idx].set(rx, oy, rz);

        // Update Beacon Sprite position & pulsation
        const sprite = coreSprites[idx];
        sprite.position.copy(corePositionsArr[idx]);
        const pulse = 0.55 + Math.sin(t * 3.0 + idx * 1.2) * 0.15;
        sprite.scale.set(pulse, pulse, 1);

        // Update Core Label Sprite position & depth opacity
        const label = coreLabelSprites[idx];
        if (label) {
          label.position.set(rx, oy + 0.35, rz);
          // When behind the sphere, dim slightly for natural 3D occlusion
          const isBehind = rz < -0.2;
          label.material.opacity = isBehind ? 0.35 : 0.95;
        }

        // Update micro cluster points
        const cluster = coreClusterPoints[idx];
        const cAttr = cluster.geometry.attributes.position as THREE.BufferAttribute;
        const cArr = cAttr.array as Float32Array;
        for (let cp = 0; cp < 3; cp++) {
          const cAng = t * 1.8 + (cp * Math.PI * 2) / 3;
          cArr[cp * 3] = rx + Math.cos(cAng) * 0.12;
          cArr[cp * 3 + 1] = oy + Math.sin(cAng) * 0.08;
          cArr[cp * 3 + 2] = rz + Math.sin(cAng) * 0.12;
        }
        cAttr.needsUpdate = true;
      });

      // 5. Update Synaptic Mesh Data Beams (Hub & Peer Links)
      const bPos = beamPosAttr.array as Float32Array;
      const bCol = (beamGeometry.attributes.color as THREE.BufferAttribute).array as Float32Array;

      // 8 Beams from central core to each satellite core
      for (let i = 0; i < 8; i++) {
        const corePos = corePositionsArr[i];
        const col = new THREE.Color(SYSTEM_CORES[i].hex);

        // Point A: Central Core
        const idxA = i * 2 * 3;
        bPos[idxA] = 0;
        bPos[idxA + 1] = 0;
        bPos[idxA + 2] = 0;

        bCol[idxA] = 1.0;
        bCol[idxA + 1] = 0.6;
        bCol[idxA + 2] = 0.3;

        // Point B: Satellite Agent Core
        const idxB = (i * 2 + 1) * 3;
        bPos[idxB] = corePos.x;
        bPos[idxB + 1] = corePos.y;
        bPos[idxB + 2] = corePos.z;

        bCol[idxB] = col.r;
        bCol[idxB + 1] = col.g;
        bCol[idxB + 2] = col.b;
      }

      // 8 Peer Beams connecting satellites sequentially (forming the outer neural mesh)
      for (let i = 0; i < 8; i++) {
        const nextI = (i + 1) % 8;
        const p1 = corePositionsArr[i];
        const p2 = corePositionsArr[nextI];
        const col1 = new THREE.Color(SYSTEM_CORES[i].hex);
        const col2 = new THREE.Color(SYSTEM_CORES[nextI].hex);

        const bIdx = (8 + i) * 2 * 3;
        bPos[bIdx] = p1.x;
        bPos[bIdx + 1] = p1.y;
        bPos[bIdx + 2] = p1.z;

        bCol[bIdx] = col1.r;
        bCol[bIdx + 1] = col1.g;
        bCol[bIdx + 2] = col1.b;

        const bIdxNext = (8 + i) * 2 * 3 + 3;
        bPos[bIdxNext] = p2.x;
        bPos[bIdxNext + 1] = p2.y;
        bPos[bIdxNext + 2] = p2.z;

        bCol[bIdxNext] = col2.r;
        bCol[bIdxNext + 1] = col2.g;
        bCol[bIdxNext + 2] = col2.b;
      }
      beamPosAttr.needsUpdate = true;
      (beamGeometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

      // 6. Update High-Speed Synaptic Data Packets along beams
      const pPos = packetPosAttr.array as Float32Array;
      for (let p = 0; p < PACKET_COUNT; p++) {
        packetProgress[p] = (packetProgress[p] + packetSpeeds[p] * 0.016 * speedMultiplier) % 1.0;
        const prg = packetProgress[p];
        const targetCoreIdx = packetCores[p];
        const targetCorePos = corePositionsArr[targetCoreIdx];

        // Interpolate from Central Nexus (0,0,0) to Target Satellite Core
        pPos[p * 3] = targetCorePos.x * prg;
        pPos[p * 3 + 1] = targetCorePos.y * prg;
        pPos[p * 3 + 2] = targetCorePos.z * prg;
      }
      packetPosAttr.needsUpdate = true;

      // 7. Gentle, Non-Disruptive Camera Parallax (Zero User Spinning)
      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;
      camera.position.x = pointer.x * 0.38;
      camera.position.y = -pointer.y * 0.28;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
      resizeObserver.disconnect();

      sphereGeometry.dispose();
      sphereMaterial.dispose();
      coreTexture.dispose();
      coreMaterial.dispose();
      particleTexture.dispose();
      beamGeometry.dispose();
      beamMaterial.dispose();
      packetGeometry.dispose();
      packetMaterial.dispose();

      coreSprites.forEach((s) => {
        s.material.map?.dispose();
        s.material.dispose();
      });
      coreLabelSprites.forEach((ls) => {
        ls.material.map?.dispose();
        ls.material.dispose();
      });
      coreClusterPoints.forEach((cp) => {
        cp.geometry.dispose();
        (cp.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, palette, speedMultiplier]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none overflow-visible group ${className}`}
      style={{ touchAction: "pan-y" }}
    />
  );
};
