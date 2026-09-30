import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import {
  Sparkles,
  Brain,
  Search,
  Zap,
  RotateCcw,
  Eye,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Activity,
  Layers,
  CheckCircle2,
  Share2,
  Compass,
  Volume2,
  VolumeX,
} from "lucide-react";

export interface RainbowMemoryNode {
  id: string;
  cluster: string;
  title: string;
  fact: string;
  color: string;
  agent: string;
  lobe: "frontal" | "temporal" | "parietal" | "occipital" | "cerebellum" | "stem";
  hemisphere: "left" | "right" | "central";
  latency: string;
  vectorDimensions: string;
  confidence: number;
}

export type BrainColorTheme = "cyber" | "rainbow" | "platinum" | "solar";

export const MEMORY_NODES_DATA: RainbowMemoryNode[] = [
  {
    id: "mem-1",
    cluster: "Security & Zero-Trust",
    title: "Sovereign Vault & Multi-Passkey Mesh",
    fact: "Hardware-gesicherte Passkey-Kopplung mit Zero-Knowledge Architektur. 256-Bit Elliptic Curve Verschlüsselung schützt biometrische Token vor Exfiltration.",
    color: "#00f0ff",
    agent: "ODIN",
    lobe: "frontal",
    hemisphere: "left",
    latency: "0.2ms",
    vectorDimensions: "1536-D",
    confidence: 0.994,
  },
  {
    id: "mem-2",
    cluster: "Architecture & Code AST",
    title: "120 FPS React & WebGL Engine AST",
    fact: "AST-Indexierung aller 128 UI-Komponenten abgeschlossen. Zero Garbage-Collection Spikes durch recycelte Three.js Float32Arrays und typed buffers.",
    color: "#10b981",
    agent: "VEGA",
    lobe: "temporal",
    hemisphere: "left",
    latency: "0.4ms",
    vectorDimensions: "1536-D",
    confidence: 0.988,
  },
  {
    id: "mem-3",
    cluster: "Autonomous Orchestration",
    title: "Multi-Core Task Dispatches & Pipelines",
    fact: "8 Cores synchronisiert. Parallele Synthese-Pipelines erledigen komplexe Research- und Coding-Aufträge in unter 90 Sekunden ohne menschliche Reibung.",
    color: "#ff6b35",
    agent: "PAPAYA",
    lobe: "parietal",
    hemisphere: "right",
    latency: "0.3ms",
    vectorDimensions: "3072-D",
    confidence: 0.997,
  },
  {
    id: "mem-4",
    cluster: "Computer Vision & HUD",
    title: "Realtime Screen Perception Cache",
    fact: "Kontinuierlicher 0ms UI-Audit. Erkennung von Konversions-Barrieren, Formular-Funnels und visuellen Kontrasten mit sub-pixelgenauer Heuristik.",
    color: "#a855f7",
    agent: "NEO",
    lobe: "occipital",
    hemisphere: "right",
    latency: "0.5ms",
    vectorDimensions: "2048-D",
    confidence: 0.991,
  },
  {
    id: "mem-5",
    cluster: "Temporal Chronos Matrix",
    title: "Autonomous Deep Work Scheduling",
    fact: "Autonome Abwehr von Kalender-Konflikten. Tägliche 4-Stunden-Blöcke für ungestörten Flow, automatische Zeitzonen-Harmonisierung via Cloud SQL.",
    color: "#8b5cf6",
    agent: "CHRONOS",
    lobe: "frontal",
    hemisphere: "right",
    latency: "0.3ms",
    vectorDimensions: "1536-D",
    confidence: 0.985,
  },
  {
    id: "mem-6",
    cluster: "Competitive Intelligence",
    title: "Market Vector Memory & Signal Radar",
    fact: "Vektor-Abgleich über 14 validierte Tech-Quellen. Globale Markttrends und Konkurrenz-Updates werden vor dem öffentlichen Diskurs synthetisiert.",
    color: "#f59e0b",
    agent: "OSIRIS",
    lobe: "temporal",
    hemisphere: "right",
    latency: "0.6ms",
    vectorDimensions: "4096-D",
    confidence: 0.979,
  },
  {
    id: "mem-7",
    cluster: "Generative Media & Veo",
    title: "Google Veo 3.1 8K Render Buffer",
    fact: "Modell-Gewichte für 8K-Video-Synthese vorkalibriert. Multimodale Prompts transformieren 3D-Szenen und Audio-Spuren in photorealistische Clips.",
    color: "#ec4899",
    agent: "PULSE",
    lobe: "occipital",
    hemisphere: "left",
    latency: "0.8ms",
    vectorDimensions: "2048-D",
    confidence: 0.982,
  },
  {
    id: "mem-8",
    cluster: "Neural Voice Synthesis",
    title: "Sub-180ms Latency Audio Cadence",
    fact: "Flüssige Sprachausgabe mit emotionaler Phrasierung. Multi-Agenten-Gespräche ohne Echo, Raumhall-Simulation und natürliche Atempausen.",
    color: "#38bdf8",
    agent: "LYRA",
    lobe: "cerebellum",
    hemisphere: "central",
    latency: "0.15ms",
    vectorDimensions: "1536-D",
    confidence: 0.996,
  },
];

interface RainbowParticleMemoryCanvasProps {
  className?: string;
  lang?: "de" | "en";
  activeAgentId?: string;
  onSelectMemoryFact?: (fact: string) => void;
  interactive?: boolean;
}

// Generate smooth, radial glow particle sprite (clean, soft, crisp luminous orb)
function createSoftParticleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 64, 64);
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.9)");
    gradient.addColorStop(0.45, "rgba(255, 255, 255, 0.35)");
    gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.08)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface BrainPoint {
  x: number;
  y: number;
  z: number;
  baseColor: THREE.Color;
  lobe: "frontal" | "temporal" | "parietal" | "occipital" | "cerebellum" | "stem";
  side: number; // -1 = left, +1 = right, 0 = center
  isCorpusCallosum: boolean;
}

// Anatomical Human Brain Morphology with longitudinal fissure, gyri & sulci
function computeAnatomicalBrainPoint(
  index: number,
  total: number,
  theme: BrainColorTheme
): BrainPoint {
  const ratio = index / total;

  // 1. Brainstem (Hirnstamm: Medulla & Pons) ~ 5%
  if (ratio < 0.05) {
    const t = ratio / 0.05;
    const y = -4.5 - t * 3.4;
    const radius = 0.85 * (1 - t * 0.32) + (Math.random() - 0.5) * 0.2;
    const angle = Math.random() * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = -1.2 + radius * Math.sin(angle);

    const baseColor = getThemeColor(theme, -0.8, 0, y, "stem");
    return { x, y, z, baseColor, lobe: "stem", side: 0, isCorpusCallosum: false };
  }

  // 2. Cerebellum (Kleinhirn mit feiner horizontaler Furchung) ~ 13%
  if (ratio < 0.18) {
    const t = (ratio - 0.05) / 0.13;
    const side = t < 0.5 ? -1 : 1;
    const u = Math.random() * Math.PI;
    const v = Math.random() * Math.PI;

    // Dual cerebellum lobes behind and under cerebrum
    const cx = side * (1.7 + Math.sin(u) * 1.55);
    const cy = -2.6 + Math.cos(u) * 1.35;
    const cz = -3.2 + Math.cos(v) * 1.55;

    // Foliated ripple ridges of cerebellum
    const folia = Math.sin(cy * 12.0) * 0.18;
    const baseColor = getThemeColor(theme, cz, side, cy, "cerebellum");
    return {
      x: cx + folia,
      y: cy,
      z: cz,
      baseColor,
      lobe: "cerebellum",
      side,
      isCorpusCallosum: false,
    };
  }

  // 3. Corpus Callosum (Transversale Brücke zwischen den Hemisphären) ~ 4%
  if (ratio < 0.22) {
    const t = (ratio - 0.18) / 0.04;
    const angle = t * Math.PI;
    const x = (Math.random() - 0.5) * 1.2; // Bridge right down center
    const y = 0.5 + Math.sin(angle) * 1.6;
    const z = -0.5 - Math.cos(angle) * 2.8;

    const baseColor = getThemeColor(theme, z, 0, y, "frontal");
    return {
      x,
      y,
      z,
      baseColor,
      lobe: "frontal",
      side: 0,
      isCorpusCallosum: true,
    };
  }

  // 4. Cerebral Cortex: Left & Right Hemispheres with distinct longitudinal fissure
  const cortexIdx = index - Math.floor(total * 0.22);
  const cortexTotal = total * 0.78;
  const side = cortexIdx % 2 === 0 ? -1 : 1;
  const p = cortexIdx / cortexTotal;

  // Spherical phyllotaxis with cranial proportion
  const phi = Math.acos(1 - 2 * Math.max(0.015, Math.min(0.985, p)));
  const theta = (cortexIdx * 137.508 * Math.PI) / 180;

  // Human cranial axes
  const cranialLengthZ = 6.8;
  const cranialHeightY = 5.2;
  const cranialWidthX = 4.3;

  // Distinct longitudinal cerebral fissure: gap between left and right hemispheres
  const fissureGap = 0.62;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  let baseX = side * (fissureGap + Math.abs(sinPhi * sinTheta) * cranialWidthX);
  let baseY = cosPhi * cranialHeightY + 0.8;
  let baseZ = sinPhi * cosTheta * cranialLengthZ;

  // Anatomical lobe shaping:
  // Temporal lobe hook
  if (baseY < 0.4 && baseZ > -1.2 && baseZ < 2.8) {
    baseY -= 0.8 * Math.sin(phi);
    baseX += side * 0.65;
  }
  // Frontal lobe frontal pole curve
  if (baseZ > 3.0) {
    baseY -= (baseZ - 3.0) * 0.28;
    baseX *= 0.88;
  }
  // Occipital lobe taper
  if (baseZ < -3.2) {
    baseY += (Math.abs(baseZ) - 3.2) * 0.2;
    baseX *= 0.82;
  }

  // Multi-frequency cortical gyri & sulci (natural brain wrinkling equations)
  const g1 = Math.sin(baseX * 2.4) * Math.cos(baseY * 2.6) * Math.sin(baseZ * 2.2);
  const g2 = Math.cos(baseY * 4.2 + baseX * 1.8) * 0.3;
  const g3 = Math.sin(baseZ * 4.8 + baseY * 1.5) * 0.22;
  const wrinkleOffset = (g1 + g2 + g3) * 0.65;

  const nx = baseX / (cranialWidthX + fissureGap);
  const ny = baseY / cranialHeightY;
  const nz = baseZ / cranialLengthZ;

  const x = baseX + nx * wrinkleOffset;
  const y = baseY + ny * wrinkleOffset;
  const z = baseZ + nz * wrinkleOffset;

  // Classify Lobe based on 3D cranial location
  let lobe: "frontal" | "temporal" | "parietal" | "occipital" = "frontal";
  if (z > 1.2) {
    lobe = "frontal";
  } else if (y < 0.8 && z >= -2.0) {
    lobe = "temporal";
  } else if (z < -2.2) {
    lobe = "occipital";
  } else {
    lobe = "parietal";
  }

  const baseColor = getThemeColor(theme, z, side, y, lobe);
  return { x, y, z, baseColor, lobe, side, isCorpusCallosum: false };
}

// Master Color Generator for clean luxury palettes
function getThemeColor(
  theme: BrainColorTheme,
  z: number,
  side: number,
  y: number,
  lobe: "frontal" | "temporal" | "parietal" | "occipital" | "cerebellum" | "stem"
): THREE.Color {
  const color = new THREE.Color();

  if (theme === "cyber") {
    // Sovereign Cyber: Deep cyan, azure electric blue, violet and neon magenta
    if (lobe === "frontal") {
      color.setHSL(0.53 + (y > 2 ? -0.04 : 0.02), 1.0, 0.62); // Electric Cyan
    } else if (lobe === "temporal") {
      color.setHSL(0.58 + side * 0.03, 0.95, 0.58); // Ocean Azure
    } else if (lobe === "parietal") {
      color.setHSL(0.74, 0.95, 0.64); // Royal Violet
    } else if (lobe === "occipital") {
      color.setHSL(0.85, 1.0, 0.65); // Neon Magenta
    } else if (lobe === "cerebellum") {
      color.setHSL(0.68, 0.85, 0.52); // Indigo Deep
    } else {
      color.setHSL(0.52, 0.9, 0.45); // Core Cyan Stem
    }
  } else if (theme === "rainbow") {
    // Spectral Rainbow 380nm-750nm smooth gradient
    if (lobe === "frontal") {
      color.setHSL(0.12, 1.0, 0.6); // Amber Gold
    } else if (lobe === "parietal") {
      color.setHSL(0.35, 0.95, 0.55); // Emerald Green
    } else if (lobe === "temporal") {
      color.setHSL(0.55, 1.0, 0.6); // Cyan / Sky
    } else if (lobe === "occipital") {
      color.setHSL(0.82, 0.95, 0.65); // Vivid Magenta
    } else if (lobe === "cerebellum") {
      color.setHSL(0.04, 1.0, 0.6); // Warm Coral Red
    } else {
      color.setHSL(0.15, 0.9, 0.5); // Gold Stem
    }
  } else if (theme === "platinum") {
    // Monochrome Platinum & Ice Blue (Ultra-clean luxury)
    const brightness = 0.55 + ((y + 4) / 10) * 0.4;
    if (side === 0) {
      color.setHSL(0.58, 0.6, brightness);
    } else {
      color.setHSL(0.56, 0.45, brightness);
    }
  } else {
    // Solar Gold & Amber
    if (lobe === "frontal") {
      color.setHSL(0.11, 1.0, 0.65); // Solar Flare Gold
    } else if (lobe === "parietal") {
      color.setHSL(0.08, 0.95, 0.58); // Amber
    } else if (lobe === "temporal") {
      color.setHSL(0.14, 0.9, 0.62); // Warm Topaz
    } else if (lobe === "occipital") {
      color.setHSL(0.02, 0.95, 0.55); // Crimson Fire
    } else {
      color.setHSL(0.1, 0.85, 0.5); // Deep Gold
    }
  }

  return color;
}

export const RainbowParticleMemoryCanvas: React.FC<RainbowParticleMemoryCanvasProps> = ({
  className = "",
  lang = "de",
  activeAgentId,
  onSelectMemoryFact,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<RainbowMemoryNode>(MEMORY_NODES_DATA[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [colorTheme, setColorTheme] = useState<BrainColorTheme>("cyber");
  const [activeLobeFilter, setActiveLobeFilter] = useState<string>("all");
  const [activeHemisphere, setActiveHemisphere] = useState<"all" | "left" | "right">("all");
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [neuralSpeed, setNeuralSpeed] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [synapticPulseTrigger, setSynapticPulseTrigger] = useState(0);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [hoveredLobeInfo, setHoveredLobeInfo] = useState<string | null>(null);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return MEMORY_NODES_DATA.filter((node) => {
      const matchLobe = activeLobeFilter === "all" || node.lobe === activeLobeFilter;
      const matchHemi = activeHemisphere === "all" || node.hemisphere === activeHemisphere || node.hemisphere === "central";
      const matchSearch =
        searchQuery === "" ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.fact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.agent.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLobe && matchHemi && matchSearch;
    });
  }, [activeLobeFilter, activeHemisphere, searchQuery]);

  // Synchronize activeAgentId with selectedNode if provided
  useEffect(() => {
    if (activeAgentId) {
      const found = MEMORY_NODES_DATA.find(
        (n) => n.agent.toLowerCase() === activeAgentId.toLowerCase()
      );
      if (found) {
        setSelectedNode(found);
      }
    }
  }, [activeAgentId]);

  // Fire Synapse Impulse
  const triggerSynapticWave = useCallback(() => {
    setSynapticPulseTrigger((prev) => prev + 1);
  }, []);

  const handleSelectNode = useCallback(
    (node: RainbowMemoryNode) => {
      setSelectedNode(node);
      triggerSynapticWave();
      onSelectMemoryFact?.(node.fact);
    },
    [onSelectMemoryFact, triggerSynapticWave]
  );

  // Three.js Brain Scene Controller
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animationFrameId: number;

    const width = Math.max(container.clientWidth || 800, 64);
    const height = Math.max(container.clientHeight || 560, 64);

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 20.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Initial slight angle for 3D depth
    brainGroup.rotation.y = 0.5;
    brainGroup.rotation.x = 0.12;

    // 2. High-Density Brain Particles (4,200 points)
    const PARTICLE_COUNT = 4200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const originalColors = new Float32Array(PARTICLE_COUNT * 3);
    const particleLobes: string[] = [];
    const particleSides: number[] = [];

    const softTexture = createSoftParticleTexture();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const pt = computeAnatomicalBrainPoint(i, PARTICLE_COUNT, colorTheme);

      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;

      originalPositions[i * 3] = pt.x;
      originalPositions[i * 3 + 1] = pt.y;
      originalPositions[i * 3 + 2] = pt.z;

      colors[i * 3] = pt.baseColor.r;
      colors[i * 3 + 1] = pt.baseColor.g;
      colors[i * 3 + 2] = pt.baseColor.b;

      originalColors[i * 3] = pt.baseColor.r;
      originalColors[i * 3 + 1] = pt.baseColor.g;
      originalColors[i * 3 + 2] = pt.baseColor.b;

      particleLobes.push(pt.lobe);
      particleSides.push(pt.side);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.44,
      map: softTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const brainParticles = new THREE.Points(geometry, particleMaterial);
    brainGroup.add(brainParticles);

    // 3. Neural Synaptic Axons (Connecting neighboring nodes)
    const axonGeo = new THREE.BufferGeometry();
    const axonPositions: number[] = [];
    const axonColors: number[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i += 6) {
      const x1 = originalPositions[i * 3];
      const y1 = originalPositions[i * 3 + 1];
      const z1 = originalPositions[i * 3 + 2];

      // Connect to strategic near-neighbors
      const stepCandidates = [11, 19, 29];
      for (const step of stepCandidates) {
        const neighborIdx = (i + step) % PARTICLE_COUNT;
        const x2 = originalPositions[neighborIdx * 3];
        const y2 = originalPositions[neighborIdx * 3 + 1];
        const z2 = originalPositions[neighborIdx * 3 + 2];

        const dist = Math.hypot(x1 - x2, y1 - y2, z1 - z2);
        // Clean axon threshold
        if (dist > 0.4 && dist < 1.75) {
          axonPositions.push(x1, y1, z1, x2, y2, z2);
          const r = originalColors[i * 3] * 0.75;
          const g = originalColors[i * 3 + 1] * 0.75;
          const b = originalColors[i * 3 + 2] * 0.75;
          axonColors.push(r, g, b, r, g, b);
          break;
        }
      }
    }

    axonGeo.setAttribute("position", new THREE.Float32BufferAttribute(axonPositions, 3));
    axonGeo.setAttribute("color", new THREE.Float32BufferAttribute(axonColors, 3));

    const axonMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const axonMesh = new THREE.LineSegments(axonGeo, axonMaterial);
    brainGroup.add(axonMesh);

    // 4. Subtle Outer Synaptic Constellation Dust
    const DUST_COUNT = 140;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustColors = new Float32Array(DUST_COUNT * 3);

    for (let i = 0; i < DUST_COUNT; i++) {
      const rad = 11.0 + Math.random() * 9.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      dustPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      dustPositions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      dustPositions[i * 3 + 2] = rad * Math.cos(phi);

      const dc = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.8, 0.7);
      dustColors[i * 3] = dc.r;
      dustColors[i * 3 + 1] = dc.g;
      dustColors[i * 3 + 2] = dc.b;
    }

    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.32,
      map: softTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustPoints = new THREE.Points(dustGeo, dustMaterial);
    scene.add(dustPoints);

    // 5. Mouse Drag Orbit & Zoom
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velX = 0;
    let velY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      velY = dx * 0.005;
      velX = dy * 0.005;

      brainGroup.rotation.y += velY;
      brainGroup.rotation.x += velX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(11, Math.min(32, camera.position.z + e.deltaY * 0.015));
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // Touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        brainGroup.rotation.y += dx * 0.006;
        brainGroup.rotation.x += dy * 0.006;
      }
    };
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });

    // 6. Animation Loop
    const startTime = performance.now();
    let lastTime = startTime;
    let shockwaveT = 999; // trigger variable

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) * 0.001;
      lastTime = now;
      const elapsed = (now - startTime) * 0.001 * neuralSpeed;

      // Friction & Auto-Rotation
      if (!isDragging) {
        velX *= 0.94;
        velY *= 0.94;
        brainGroup.rotation.x += velX;
        brainGroup.rotation.y += (isAutoRotating ? 0.0035 : 0) + velY;
      }

      // Constellation dust idle drift
      dustPoints.rotation.y = -elapsed * 0.02;

      // Pulsating Synaptic Action Potentials
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;

      // Check shockwave advancement
      shockwaveT += delta * 4.5;
      const shockwaveRadius = shockwaveT * 4.0;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const pLobe = particleLobes[i];
        const pSide = particleSides[i];

        // Highlight active lobe filter & hemisphere filter
        const isLobeMatch = activeLobeFilter === "all" || pLobe === activeLobeFilter;
        const isHemiMatch =
          activeHemisphere === "all" ||
          pSide === 0 ||
          (activeHemisphere === "left" && pSide < 0) ||
          (activeHemisphere === "right" && pSide > 0);

        const isVisible = isLobeMatch && isHemiMatch;

        // Neural travel wave along longitudinal axis
        const wave = Math.sin(elapsed * 4.2 - oz * 0.8 + oy * 0.5) * 0.12;

        // Distance to shockwave origin (Frontal center)
        const distToOrigin = Math.hypot(ox, oy, oz - 2.5);
        let shockwaveFactor = 0;
        if (shockwaveT < 3.5 && Math.abs(distToOrigin - shockwaveRadius) < 1.4) {
          shockwaveFactor = 1.0 - Math.abs(distToOrigin - shockwaveRadius) / 1.4;
        }

        const currentScale = isVisible ? 1.0 + wave * 0.2 + shockwaveFactor * 0.45 : 0.2;
        posAttr.setXYZ(i, ox * currentScale, oy * currentScale, oz * currentScale);

        // Flash colors on shockwave / impulse
        const baseR = originalColors[i * 3];
        const baseG = originalColors[i * 3 + 1];
        const baseB = originalColors[i * 3 + 2];

        if (!isVisible) {
          // Dim filtered-out regions smoothly
          colAttr.setXYZ(i, baseR * 0.12, baseG * 0.12, baseB * 0.12);
        } else if (shockwaveFactor > 0.05) {
          // Intense synaptic flash
          colAttr.setXYZ(
            i,
            THREE.MathUtils.lerp(baseR, 1.0, shockwaveFactor),
            THREE.MathUtils.lerp(baseG, 1.0, shockwaveFactor),
            THREE.MathUtils.lerp(baseB, 1.0, shockwaveFactor)
          );
        } else {
          // Normal organic breathing
          const pulse = 0.88 + Math.sin(elapsed * 3.0 + ox * 0.5) * 0.14;
          colAttr.setXYZ(i, baseR * pulse, baseG * pulse, baseB * pulse);
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Trigger impulse callback listener
    const onImpulse = () => {
      shockwaveT = 0;
    };
    window.addEventListener("brain_synapse_pulse", onImpulse);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container || !renderer.domElement) return;
      const w = Math.max(container.clientWidth || 800, 64);
      const h = Math.max(container.clientHeight || 560, 64);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("brain_synapse_pulse", onImpulse);

      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousedown", onMouseDown);
        renderer.domElement.removeEventListener("wheel", onWheel);
        renderer.domElement.removeEventListener("touchstart", onTouchStart);
        renderer.domElement.removeEventListener("touchmove", onTouchMove);
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
      }

      geometry.dispose();
      particleMaterial.dispose();
      axonGeo.dispose();
      axonMaterial.dispose();
      dustGeo.dispose();
      dustMaterial.dispose();
      softTexture.dispose();
      renderer.dispose();
    };
  }, [colorTheme, activeLobeFilter, activeHemisphere, isAutoRotating, neuralSpeed]);

  // Dispatch visual impulse on trigger change
  useEffect(() => {
    if (synapticPulseTrigger > 0) {
      window.dispatchEvent(new CustomEvent("brain_synapse_pulse"));
    }
  }, [synapticPulseTrigger]);

  return (
    <div
      className={`relative w-full rounded-3xl bg-[#030306] border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[740px] sm:h-[820px]"
      } ${className}`}
    >
      {/* 1. Deep Space Atmospheric Vignette & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,24,45,0.45)_0%,rgba(3,3,6,0.95)_75%)] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. Top Sleek Glass Navigation Bar */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-none">
        {/* Left: Branding & Core Stats Pill */}
        <div className="flex items-center gap-2.5 pointer-events-auto flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-xl flex items-center gap-2.5 shadow-lg shadow-black/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
              NEURAL BRAIN ARCHITECTURE
            </span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-[11px] text-zinc-400">
              4.200 SYNAPSE VECTORS
            </span>
          </div>

          {/* Color Palette Switcher */}
          <div className="px-2 py-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-xl flex items-center gap-1.5 shadow-md">
            <button
              type="button"
              onClick={() => setColorTheme("cyber")}
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] transition cursor-pointer ${
                colorTheme === "cyber"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Cyber Azure & Violet"
            >
              CYBER
            </button>
            <button
              type="button"
              onClick={() => setColorTheme("rainbow")}
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] transition cursor-pointer ${
                colorTheme === "rainbow"
                  ? "bg-pink-500/20 text-pink-300 font-bold border border-pink-400/40"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Spectral Rainbow"
            >
              RAINBOW
            </button>
            <button
              type="button"
              onClick={() => setColorTheme("platinum")}
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] transition cursor-pointer ${
                colorTheme === "platinum"
                  ? "bg-zinc-700/40 text-white font-bold border border-white/30"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Platinum Monochrome"
            >
              PLATINUM
            </button>
            <button
              type="button"
              onClick={() => setColorTheme("solar")}
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] transition cursor-pointer ${
                colorTheme === "solar"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Solar Gold"
            >
              SOLAR
            </button>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto self-end md:self-auto">
          {/* Synapse Pulse Trigger */}
          <button
            type="button"
            onClick={triggerSynapticWave}
            className="px-3 py-1.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
            title="Aktiven Gedankenblitz feuern"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SYNAPSE IMPULS</span>
          </button>

          {/* Auto-Rotation Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3 py-1.5 rounded-full border text-xs font-mono transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xl ${
              isAutoRotating
                ? "bg-black/70 border-white/20 text-zinc-200"
                : "bg-white/10 border-white/30 text-white font-bold"
            }`}
            title={isAutoRotating ? "Rotation pausieren" : "Auto-Rotation starten"}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotating ? "animate-spin" : ""}`} />
            <span>{isAutoRotating ? "ORBIT AKTIV" : "MANUELL"}</span>
          </button>

          {/* Toggle Inspector Drawer */}
          <button
            type="button"
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`p-2 rounded-full border transition cursor-pointer backdrop-blur-xl ${
              isInspectorOpen
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                : "bg-black/70 border-white/15 text-zinc-400 hover:text-white"
            }`}
            title="Synapsen-Inspektor anzeigen / verbergen"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen Expand */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-full bg-black/70 border border-white/15 text-zinc-400 hover:text-white transition cursor-pointer backdrop-blur-xl"
            title={isFullscreen ? "Vollbild beenden" : "Vollbild"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Main Three.js Brain Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* 4. Floating Lobe & Hemisphere Selector Dock (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 max-w-[94vw] pointer-events-none">
        {/* Lobe Navigation Pills */}
        <div className="pointer-events-auto p-1.5 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: "all", label: "ALLE LOBEN", count: "4.2k" },
            { id: "frontal", label: "FRONTAL (LOGIK)", count: "1.4k" },
            { id: "temporal", label: "TEMPORAL (MEMORY)", count: "980" },
            { id: "parietal", label: "PARIETAL (FOKUS)", count: "820" },
            { id: "occipital", label: "OKZIPITAL (VISION)", count: "640" },
            { id: "cerebellum", label: "CEREBELLUM", count: "360" },
          ].map((tab) => {
            const isActive = activeLobeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveLobeFilter(tab.id);
                  triggerSynapticWave();
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[9px] ${isActive ? "text-zinc-600" : "text-zinc-500"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hemisphere Split Mode Pills */}
        <div className="pointer-events-auto px-3 py-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-xl flex items-center gap-2 text-[10px] font-mono text-zinc-400 shadow-md">
          <span className="text-zinc-500">HEMISPHÄRE:</span>
          {(["all", "left", "right"] as const).map((hemi) => (
            <button
              key={hemi}
              type="button"
              onClick={() => setActiveHemisphere(hemi)}
              className={`px-2 py-0.5 rounded transition cursor-pointer uppercase ${
                activeHemisphere === hemi
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40"
                  : "hover:text-white"
              }`}
            >
              {hemi === "all" ? "BEIDE" : hemi === "left" ? "LINKS (CODE)" : "RECHTS (VISION)"}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Floating Interactive Memory Node Inspector (Top Right Drawer) */}
      {isInspectorOpen && (
        <div className="absolute top-20 right-4 sm:right-6 bottom-24 w-80 sm:w-96 z-20 flex flex-col pointer-events-none">
          <div className="pointer-events-auto w-full h-full rounded-2xl bg-black/85 border border-white/15 backdrop-blur-2xl p-5 shadow-2xl flex flex-col gap-4 overflow-hidden">
            {/* Header with Search */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                  SYNAPSEN INSPEKTOR
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {filteredNodes.length} NODES
              </span>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Gedanken & Synapsen durchsuchen..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-cyan-400/60 transition"
              />
            </div>

            {/* Selected Node Detailed Spotlight */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <span className="font-mono text-[11px] font-bold text-white">
                    {selectedNode.agent} CORE
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 uppercase">
                  {selectedNode.lobe} LOBE
                </span>
              </div>

              <h4 className="text-sm font-bold text-white leading-tight">
                {selectedNode.title}
              </h4>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-3">
                {selectedNode.fact}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px] font-mono">
                <div className="flex flex-col">
                  <span className="text-zinc-500">LATENZ</span>
                  <span className="text-cyan-400 font-bold">{selectedNode.latency}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-500">VEKTOR EMBEDDING</span>
                  <span className="text-purple-400 font-bold">{selectedNode.vectorDimensions}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectNode(selectedNode)}
                className="mt-1 w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>SYNAPSE STIMULIEREN</span>
              </button>
            </div>

            {/* Scrollable Node Selection List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {filteredNodes.map((node) => {
                const isSelected = node.id === selectedNode.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => handleSelectNode(node)}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-white/15 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-white flex items-center gap-1.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: node.color }}
                        />
                        <span className="truncate">{node.title}</span>
                      </span>
                      <span className="font-mono text-[9px] text-zinc-400 shrink-0 uppercase px-1.5 py-0.5 rounded bg-white/5">
                        {node.agent}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {node.fact}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Interaction Hint Overlay (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 hidden lg:flex items-center gap-3 pointer-events-none text-zinc-400 font-mono text-[11px]">
        <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Maus ziehen: 3D Orbit</span>
          <span className="text-zinc-600">•</span>
          <span>Scrollen: Zoom</span>
        </div>
      </div>
    </div>
  );
};
