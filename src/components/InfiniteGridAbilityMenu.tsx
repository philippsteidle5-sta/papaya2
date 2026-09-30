import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { mat4, quat, vec2, vec3 } from "gl-matrix";
import {
  ShoppingBag,
  MessageSquare,
  GitBranch,
  Mail,
  Calendar,
  Video,
  Radio,
  Users,
  Share2,
  Mic,
  Globe,
  TrendingUp,
  Send,
  Database,
  Terminal,
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink,
  RotateCw,
  Compass,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { useTheme } from "../utils/themeStore";

export interface CoreAbilityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tag: string;
  color: string;
  gradient: [string, string];
  iconName: string;
  coreAgent: string;
  features: string[];
}

export const ALL_8_CORE_ABILITIES: CoreAbilityItem[] = [
  {
    id: "shopify",
    title: "Shopify E-Commerce Core",
    category: "COMMERCE & SALES",
    description: "Automatisierte Produktbeschreibungen, Bestands-Tracking, AI-Sales Pitcher & 24/7 Kunden-Concierge für deinen Online-Shop.",
    tag: "SHOPIFY / WOO",
    color: "#96bf48",
    gradient: ["#14250e", "#96bf48"],
    iconName: "shopify",
    coreAgent: "VEGA (Creative / E-Com)",
    features: ["Auto-Listing", "Flash Sale Engine", "Conversion Optimizer", "Inventory Sync"],
  },
  {
    id: "discord",
    title: "Discord Community AI",
    category: "COMMUNITY & BOT",
    description: "24/7 Community Moderator, Live Event Bot, Ticket System & intelligenter Rollen-Verwalter direkt auf deinem Discord Server.",
    tag: "DISCORD BOT",
    color: "#5865F2",
    gradient: ["#0f143d", "#5865F2"],
    iconName: "discord",
    coreAgent: "NEO (Executive)",
    features: ["Auto-Mod", "FAQ Answering", "Role Automation", "Voice Channel AI"],
  },
  {
    id: "github",
    title: "GitHub Fullstack Copilot",
    category: "DEV & CI/CD",
    description: "Automatische Pull Request Reviews, Code Synthesis, Bugfixes, Test-Generierung & nahtlose CI/CD Pipeline Automation.",
    tag: "GITHUB ACTIONS",
    color: "#a855f7",
    gradient: ["#1e0b38", "#a855f7"],
    iconName: "github",
    coreAgent: "NEO (Code Architect)",
    features: ["PR Reviewer", "Syntax Lint", "Auto-Commit", "Test Generator"],
  },
  {
    id: "gmail",
    title: "Real Gmail & Workspace Matrix",
    category: "WORKSPACE & EMAIL",
    description: "Echtes Google Workspace OAuth2: Liest, analysiert und verfasst E-Mails, priorisiert deinen Posteingang & synchronisiert Docs.",
    tag: "GMAIL / OAUTH2",
    color: "#ea4335",
    gradient: ["#2d0e0b", "#ea4335"],
    iconName: "gmail",
    coreAgent: "SYNTAX (Master Core)",
    features: ["Inbox Triage", "Draft Generator", "Smart Reply", "Contact Sync"],
  },
  {
    id: "calendar",
    title: "Chronos AI Calendar & Time Pilot",
    category: "PRODUCTIVITY",
    description: "Autonomer Terminkoordinator: Löst Terminkonflikte, bereitet Meeting-Briefings vor & synchronisiert Zeitzonen.",
    tag: "CHRONOS TIME",
    color: "#c084fc",
    gradient: ["#230b42", "#c084fc"],
    iconName: "calendar",
    coreAgent: "CHRONOS (Time Master)",
    features: ["Meeting Prep", "Conflict Resolver", "Auto-Schedule", "Daily Agenda"],
  },
  {
    id: "veo",
    title: "Veo 3.1 8K Video Synthesizer",
    category: "CREATIVE & VIDEO",
    description: "Kinoreife Video-Animationen aus Text & Prompts in 16:9 und 9:16 für virale TikToks, Reels und YouTube Kampagnen.",
    tag: "VEO 3.1 VIDEO",
    color: "#e879f9",
    gradient: ["#320a40", "#e879f9"],
    iconName: "video",
    coreAgent: "VEGA (Visual Engine)",
    features: ["8K Generation", "16:9 & 9:16", "Audio Sync", "Storyboarding"],
  },
  {
    id: "radar",
    title: "Live Satellite Radar & Telemetrie",
    category: "SYSTEM & RECON",
    description: "Echtzeit-Überwachung deiner Systeme, Weltkarten-Visualisierung, Server-Latenzen und globale Geo-Ortung.",
    tag: "LIVE RADAR",
    color: "#8b5cf6",
    gradient: ["#180838", "#8b5cf6"],
    iconName: "radar",
    coreAgent: "ODIN (Data Intel)",
    features: ["System Vitals", "Geo-Coordinates", "Satellite Scan", "Fleet Tracking"],
  },
  {
    id: "fleet",
    title: "Autonomous 8-Agent Swarm Fleet",
    category: "MULTI-AGENT MESH",
    description: "Alle 8 Cores arbeiten parallel und tauschen Zwischenergebnisse in Millisekunden aus, um komplexe Workflows zu lösen.",
    tag: "SWARM FLEET",
    color: "#a855f7",
    gradient: ["#1e0a3d", "#a855f7"],
    iconName: "users",
    coreAgent: "ALL 8 CORES",
    features: ["Parallel Tasks", "Cross-Agent RAG", "Consensus Engine", "Auto-Delegation"],
  },
  {
    id: "social",
    title: "TikTok & Instagram Studio",
    category: "SOCIAL MEDIA",
    description: "Virality Score Berechnung, KI-Captions, Trending Hashtags, Content Planner und direkter Multi-Platform Upload.",
    tag: "TIKTOK / IG",
    color: "#ec4899",
    gradient: ["#2e0a1c", "#ec4899"],
    iconName: "share",
    coreAgent: "VEGA (Creative / Social)",
    features: ["Virality Score", "Auto-Captions", "Hashtag AI", "Multi-Upload"],
  },
  {
    id: "voice",
    title: "Quantum Voice AI Engine",
    category: "SPEECH & AUDIO",
    description: "Sprachsteuerung mit unter 85ms Latenz, 8 unverwechselbare Stimmprofile und fließende multilinguale Dialoge.",
    tag: "VOICE <85MS",
    color: "#f59e0b",
    gradient: ["#2d1d05", "#f59e0b"],
    iconName: "mic",
    coreAgent: "PULSE (Audio Core)",
    features: ["8 Voice Profiles", "<85ms Response", "Live Subtitles", "Tone Adaptation"],
  },
  {
    id: "browser",
    title: "Autonomous Web & Screen Perception",
    category: "AUTOMATION",
    description: "Der Agent sieht deinen Bildschirm, navigiert durch beliebige Webseiten, füllt Formulare aus und extrahiert Tabellen.",
    tag: "SCREEN VISION",
    color: "#6366f1",
    gradient: ["#11133d", "#6366f1"],
    iconName: "globe",
    coreAgent: "NEO (Executive)",
    features: ["Screen OCR", "Web Scraper", "Form Autofill", "Browser Pilot"],
  },
  {
    id: "memory-particles",
    title: "Neural Memory & Synapse Particles",
    category: "MEMORY & RECALL",
    description: "Erinnerungen als dynamische Farb-Partikel: Speichert Fakten, Vorlieben & Kontexte als vernetzte bunte Partikel-Synapsen für sofortigen Abruf.",
    tag: "MEMORY PARTICLES",
    color: "#ec4899",
    gradient: ["#2d0e2e", "#ec4899"],
    iconName: "memory_particles",
    coreAgent: "SYNTAX (Neural Core)",
    features: ["Color Particle Recall", "Cross-Agent Context", "Zero-Loss Vectors", "Synapse Clustering"],
  },
  {
    id: "telegram",
    title: "Telegram & WhatsApp AI Pilot",
    category: "MESSAGING",
    description: "Broadcast-Kanäle, interaktive Chatbots, 24/7 Lead-Qualifizierung und automatisierter Kundensupport per Messenger.",
    tag: "TELEGRAM BOT",
    color: "#229ED9",
    gradient: ["#081d28", "#229ED9"],
    iconName: "send",
    coreAgent: "NEO (Executive)",
    features: ["Auto Broadcast", "Lead Capture", "Group Admin", "Payment Links"],
  },
  {
    id: "vault",
    title: "Knowledge Vault & Neural RAG",
    category: "MEMORY & STORAGE",
    description: "256-bit verschlüsselte Vektordatenbank: Speichert alle deine Dokumente, PDFs und Notizen für sekundenschnelle KI-Suche.",
    tag: "QUANTUM VAULT",
    color: "#8b5cf6",
    gradient: ["#180f33", "#8b5cf6"],
    iconName: "database",
    coreAgent: "ORACLE (Intel Core)",
    features: ["PDF Extraction", "Vector Search", "Long-term Memory", "Zero-Knowledge"],
  },
  {
    id: "terminal",
    title: "Interactive Code & API Runtime",
    category: "DEVELOPER TOOL",
    description: "Echtzeit TypeScript & Python Sandbox, Multi-File Editor und direkte REST API Ausführung im Browser.",
    tag: "CODE RUNTIME",
    color: "#10b981",
    gradient: ["#051f15", "#10b981"],
    iconName: "terminal",
    coreAgent: "SYNTAX (Code Core)",
    features: ["Sandboxed Exec", "TypeScript / Python", "Package Manager", "Live Preview"],
  },
  {
    id: "security",
    title: "Sovereign 4096-Bit Security Core",
    category: "SECURITY & PRIVACY",
    description: "Custom Gemini API Keys, vollständige DSGVO-Konformität, End-to-End Verschlüsselung und lokale Session-Sicherheit.",
    tag: "ROOT PRIVACY",
    color: "#f43f5e",
    gradient: ["#2d0a13", "#f43f5e"],
    iconName: "shield",
    coreAgent: "SYNTAX (Root Guardian)",
    features: ["Custom API Keys", "E2E Encryption", "GDPR Compliant", "Role Gates"],
  },
];

// --- SHADER SOURCES ---
const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

#define PI 3.141593

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);

    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    vAlpha = smoothstep(0.4, 1.0, normalize(worldPosition.xyz).z) * .92 + .08;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;

    float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;

    // Soft circular edge anti-aliasing so each 3D node feels like a glowing particle orb
    vec2 centerDist = vUvs - vec2(0.5);
    float dist = length(centerDist);
    float edgeMask = smoothstep(0.50, 0.44, dist);

    vec4 texColor = texture(uTex, st);
    outColor = texColor;
    outColor.a *= vAlpha * edgeMask;
}
`;

// --- GEOMETRY CLASSES ---
class Face {
  a: number;
  b: number;
  c: number;
  constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

class Vertex {
  position: vec3;
  normal: vec3;
  uv: vec2;
  constructor(x: number, y: number, z: number) {
    this.position = vec3.fromValues(x, y, z);
    this.normal = vec3.create();
    this.uv = vec2.create();
  }
}

class Geometry {
  vertices: Vertex[] = [];
  faces: Face[] = [];

  addVertex(...args: number[]) {
    for (let i = 0; i < args.length; i += 3) {
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  addFace(...args: number[]) {
    for (let i = 0; i < args.length; i += 3) {
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  get lastVertex() {
    return this.vertices[this.vertices.length - 1];
  }

  subdivide(divisions = 1) {
    const midPointCache: Record<string, number> = {};
    let f = this.faces;

    for (let div = 0; div < divisions; ++div) {
      const newFaces = new Array(f.length * 4);

      f.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, midPointCache);
        const mBC = this.getMidPoint(face.b, face.c, midPointCache);
        const mCA = this.getMidPoint(face.c, face.a, midPointCache);

        const i = ndx * 4;
        newFaces[i + 0] = new Face(face.a, mAB, mCA);
        newFaces[i + 1] = new Face(face.b, mBC, mAB);
        newFaces[i + 2] = new Face(face.c, mCA, mBC);
        newFaces[i + 3] = new Face(mAB, mBC, mCA);
      });

      f = newFaces;
    }

    this.faces = f;
    return this;
  }

  spherize(radius = 1) {
    this.vertices.forEach((vertex) => {
      vec3.normalize(vertex.normal, vertex.position);
      vec3.scale(vertex.position, vertex.normal, radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: this.vertexData,
      indices: this.indexData,
      normals: this.normalData,
      uvs: this.uvData,
    };
  }

  get vertexData() {
    return new Float32Array(this.vertices.flatMap((v) => Array.from(v.position)));
  }

  get normalData() {
    return new Float32Array(this.vertices.flatMap((v) => Array.from(v.normal)));
  }

  get uvData() {
    return new Float32Array(this.vertices.flatMap((v) => Array.from(v.uv)));
  }

  get indexData() {
    return new Uint16Array(this.faces.flatMap((f) => [f.a, f.b, f.c]));
  }

  getMidPoint(ndxA: number, ndxB: number, cache: Record<string, number>) {
    const cacheKey = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
      return cache[cacheKey];
    }
    const a = this.vertices[ndxA].position;
    const b = this.vertices[ndxB].position;
    const ndx = this.vertices.length;
    cache[cacheKey] = ndx;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return ndx;
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * 0.5 + 0.5;
    this.addVertex(
      -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
      0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
      t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
    ).addFace(
      0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
      1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
      3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
      4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
    );
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 48, radius = 1) {
    super();
    steps = Math.max(4, steps);
    const alpha = (2 * Math.PI) / steps;

    this.addVertex(0, 0, 0);
    this.lastVertex.uv[0] = 0.5;
    this.lastVertex.uv[1] = 0.5;

    for (let i = 0; i < steps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv[0] = x * 0.5 + 0.5;
      this.lastVertex.uv[1] = y * 0.5 + 0.5;

      if (i > 0) {
        this.addFace(0, i, i + 1);
      }
    }
    this.addFace(0, steps, 1);
  }
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;
  console.error("Shader error:", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(
  gl: WebGL2RenderingContext,
  shaderSources: [string, string],
  transformFeedbackVaryings: string[] | null,
  attribLocations: Record<string, number>
) {
  const program = gl.createProgram();
  if (!program) return null;

  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx]);
    if (shader) gl.attachShader(program, shader);
  });

  if (attribLocations) {
    for (const attrib in attribLocations) {
      gl.bindAttribLocation(program, attribLocations[attrib], attrib);
    }
  }

  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  console.error("Program error:", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function makeBuffer(gl: WebGL2RenderingContext, sizeOrData: BufferSource, usage: number) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buf;
}

function makeVertexArray(
  gl: WebGL2RenderingContext,
  bufLocNumElmPairs: [WebGLBuffer | null, number, number][],
  indices?: Uint16Array
) {
  const va = gl.createVertexArray();
  gl.bindVertexArray(va);

  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1 || !buffer) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0);
  }

  if (indices) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  gl.bindVertexArray(null);
  return va;
}

// Draw dedicated Second Brain Neural Particle Nodes & Synapse Constellations onto a 512x512 tile
function drawSecondBrainNeuralParticleNode(ctx: CanvasRenderingContext2D, cx: number, cy: number, iconName: string, color: string) {
  ctx.save();
  ctx.translate(cx, cy);

  // 1. Radiant Multi-layered Central Synaptic Nucleus Glow
  const nucleusGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 52);
  nucleusGlow.addColorStop(0, "#ffffff");
  nucleusGlow.addColorStop(0.2, color + "ff");
  nucleusGlow.addColorStop(0.55, color + "55");
  nucleusGlow.addColorStop(1, color + "00");

  ctx.fillStyle = nucleusGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();

  // 2. Orbital Synapse Dashed Rings
  ctx.strokeStyle = color + "66";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color + "33";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // 3. Archetype-Specific Second Brain Particle Constellations
  if (iconName === "send") {
    // TELEGRAM & MESSAGING SYNAPSE: Radiant communication wave arcs & 4 orbital data packets
    ctx.strokeStyle = color + "cc";
    ctx.lineWidth = 2.5;
    [-18, 0, 18].forEach((offsetAngle, idx) => {
      ctx.beginPath();
      ctx.arc(0, 0, 16 + idx * 10, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    });

    // Orbital thought packet particles
    const packets = [
      { x: 22, y: -16, r: 4, c: "#ffffff" },
      { x: 30, y: 12, r: 3.5, c: color },
      { x: -24, y: 14, r: 4.5, c: "#67e8f9" },
      { x: -16, y: -22, r: 3, c: "#ffffff" },
    ];
    packets.forEach((p) => {
      ctx.strokeStyle = color + "44";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central White Synapse Core
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "shopify") {
    // COMMERCE & SALES SYNAPSE: Gold/Emerald trade flow matrix with 5 interconnected nodes
    const commerceNodes = [
      { x: 0, y: -20, r: 5, c: "#a3e635" },
      { x: 20, y: -4, r: 4.5, c: "#facc15" },
      { x: 12, y: 18, r: 5.5, c: "#4ade80" },
      { x: -12, y: 18, r: 5.5, c: "#22c55e" },
      { x: -20, y: -4, r: 4.5, c: "#facc15" },
    ];

    // Synaptic connecting filaments
    ctx.strokeStyle = "rgba(163, 230, 53, 0.5)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    commerceNodes.forEach((n, idx) => {
      const next = commerceNodes[(idx + 1) % commerceNodes.length];
      ctx.moveTo(0, 0);
      ctx.lineTo(n.x, n.y);
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(next.x, next.y);
    });
    ctx.stroke();

    commerceNodes.forEach((n) => {
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(n.x - 1, n.y - 1, n.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });

    // Center Node
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "discord") {
    // COMMUNITY SYNAPSE: 6-node multi-agent conversational constellation
    const angles = [0, 60, 120, 180, 240, 300];
    ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    angles.forEach((deg, idx) => {
      const rad = (deg * Math.PI) / 180;
      const px = Math.cos(rad) * 22;
      const py = Math.sin(rad) * 22;
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
      const nextRad = (angles[(idx + 1) % angles.length] * Math.PI) / 180;
      ctx.lineTo(Math.cos(nextRad) * 22, Math.sin(nextRad) * 22);
    });
    ctx.stroke();

    angles.forEach((deg, idx) => {
      const rad = (deg * Math.PI) / 180;
      const px = Math.cos(rad) * 22;
      const py = Math.sin(rad) * 22;
      ctx.fillStyle = idx % 2 === 0 ? "#818cf8" : "#c084fc";
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "github") {
    // DEV & CODE SYNAPSE: Branching fractal neural code tree
    const branchNodes = [
      { x: -16, y: -18, r: 4.5, c: "#c084fc" },
      { x: 16, y: -18, r: 4.5, c: "#e879f9" },
      { x: 0, y: -24, r: 5, c: "#ffffff" },
      { x: -22, y: 8, r: 4, c: "#a855f7" },
      { x: 22, y: 8, r: 4, c: "#a855f7" },
      { x: 0, y: 22, r: 5.5, c: "#9333ea" },
    ];

    ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    branchNodes.forEach((n) => {
      ctx.moveTo(0, 0);
      ctx.lineTo(n.x, n.y);
    });
    ctx.stroke();

    branchNodes.forEach((n) => {
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "gmail") {
    // WORKSPACE & EMAIL SYNAPSE: Ruby-rose radiant knowledge packet with 4 diagonal thought nodes
    const mailNodes = [
      { x: -18, y: -14, r: 4.5, c: "#f87171" },
      { x: 18, y: -14, r: 4.5, c: "#f87171" },
      { x: -20, y: 16, r: 4, c: "#ef4444" },
      { x: 20, y: 16, r: 4, c: "#ef4444" },
      { x: 0, y: 22, r: 5, c: "#ffffff" },
    ];

    ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    mailNodes.forEach((n) => {
      ctx.moveTo(0, 0);
      ctx.lineTo(n.x, n.y);
    });
    ctx.stroke();

    mailNodes.forEach((n) => {
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "calendar") {
    // CHRONOS TIME SYNAPSE: Chronos vortex ring with 8 orbiting time particles
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const px = Math.cos(angle) * 22;
      const py = Math.sin(angle) * 22;
      ctx.strokeStyle = "rgba(192, 132, 252, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#c084fc";
      ctx.beginPath();
      ctx.arc(px, py, i % 2 === 0 ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "video") {
    // VEO 8K VIDEO SYNAPSE: Cosmic magenta particle lens flare with 3 concentric frame nodes
    [-20, 0, 20].forEach((xOff, idx) => {
      const py = idx === 1 ? -18 : 12;
      ctx.strokeStyle = "rgba(232, 121, 249, 0.5)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(xOff, py);
      ctx.stroke();

      ctx.fillStyle = idx === 1 ? "#ffffff" : "#e879f9";
      ctx.beginPath();
      ctx.arc(xOff, py, 5.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "radar") {
    // LIVE RADAR & TELEMETRY SYNAPSE: Radar pulse rings & sweep blip particles
    ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();

    // Radar blip particles
    [
      { x: 12, y: -14, r: 4.5, c: "#ffffff" },
      { x: -14, y: 16, r: 3.5, c: "#c084fc" },
      { x: 18, y: 10, r: 4, c: "#e879f9" },
    ].forEach((p) => {
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "users") {
    // 8-AGENT SWARM FLEET: Interconnected 8-particle brain swarm ring
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const px = Math.cos(angle) * 22;
      const py = Math.sin(angle) * 22;
      const nextAngle = ((i + 1) * Math.PI * 2) / 8;

      ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
      ctx.lineTo(Math.cos(nextAngle) * 22, Math.sin(nextAngle) * 22);
      ctx.stroke();

      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#c084fc";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "mic") {
    // QUANTUM VOICE SYNAPSE: Acoustic particle frequency bars & sonic pulse core
    const voiceBars = [
      { x: -18, h: 14, c: "#f59e0b" },
      { x: -9, h: 22, c: "#fbbf24" },
      { x: 0, h: 28, c: "#ffffff" },
      { x: 9, h: 22, c: "#fbbf24" },
      { x: 18, h: 14, c: "#f59e0b" },
    ];
    voiceBars.forEach((bar) => {
      ctx.fillStyle = bar.c;
      ctx.beginPath();
      ctx.arc(bar.x, -bar.h * 0.5, 3.5, 0, Math.PI * 2);
      ctx.arc(bar.x, bar.h * 0.5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = bar.c + "99";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bar.x, -bar.h * 0.5);
      ctx.lineTo(bar.x, bar.h * 0.5);
      ctx.stroke();
    });
  } else if (iconName === "database") {
    // KNOWLEDGE VAULT SYNAPSE: Crystalline vector prism with orbiting memory point cloud
    const prismNodes = [
      { x: 0, y: -22, r: 5, c: "#ffffff" },
      { x: 20, y: -8, r: 4.5, c: "#c084fc" },
      { x: 20, y: 14, r: 4.5, c: "#a855f7" },
      { x: 0, y: 22, r: 5, c: "#8b5cf6" },
      { x: -20, y: 14, r: 4.5, c: "#a855f7" },
      { x: -20, y: -8, r: 4.5, c: "#c084fc" },
    ];

    ctx.strokeStyle = "rgba(139, 92, 246, 0.55)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    prismNodes.forEach((n, idx) => {
      const next = prismNodes[(idx + 1) % prismNodes.length];
      ctx.moveTo(0, 0);
      ctx.lineTo(n.x, n.y);
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(next.x, next.y);
    });
    ctx.stroke();

    prismNodes.forEach((n) => {
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconName === "terminal") {
    // CODE RUNTIME SYNAPSE: Emerald matrix binary particles
    const matrixNodes = [
      { x: -16, y: -16, r: 4, c: "#34d399" },
      { x: 16, y: -16, r: 4, c: "#6ee7b7" },
      { x: -12, y: 16, r: 4.5, c: "#10b981" },
      { x: 16, y: 14, r: 4, c: "#059669" },
      { x: 0, y: 0, r: 7.5, c: "#ffffff" },
    ];
    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    matrixNodes.forEach((n) => {
      ctx.moveTo(0, 0);
      ctx.lineTo(n.x, n.y);
    });
    ctx.stroke();

    matrixNodes.forEach((n) => {
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // GENERAL SECOND BRAIN MULTI-COLOR NEURAL PARTICLE CLUSTER
    const defaultNodes = [
      { x: 0, y: 0, r: 8, color: "#ffffff" },
      { x: -16, y: -14, r: 5, color: "#ec4899" },
      { x: 16, y: -12, r: 5.5, color: "#06b6d4" },
      { x: -14, y: 15, r: 5, color: "#10b981" },
      { x: 15, y: 14, r: 5, color: "#f59e0b" },
      { x: 0, y: -22, r: 4.5, color: "#a855f7" },
    ];

    ctx.strokeStyle = color + "66";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    defaultNodes.forEach((p, idx) => {
      if (idx === 0) return;
      ctx.moveTo(0, 0);
      ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    defaultNodes.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x - 1, p.y - 1, p.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

// Draw Second Brain Neural Particle Canvas Tile onto a 512x512 tile
function renderAbilityCanvasTile(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, item: CoreAbilityItem, isModern: boolean) {
  ctx.save();
  ctx.translate(x, y);

  // 1. Deep Space Cosmic Background
  ctx.fillStyle = isModern ? "#060913" : "#02040a";
  ctx.fillRect(0, 0, size, size);

  const cx = size * 0.5;
  const cy = size * 0.5;
  const radius = size * 0.45;

  // 2. Second Brain Nebula Radial Glow
  const nebulaGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
  nebulaGrad.addColorStop(0, item.color + "33");
  nebulaGrad.addColorStop(0.45, item.gradient[0] + "88");
  nebulaGrad.addColorStop(0.85, item.gradient[0] + "22");
  nebulaGrad.addColorStop(1, "#00000000");

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = nebulaGrad;
  ctx.fill();

  // 3. Faint Background Starfield / Micro Memory Dots
  const starSeeds = [
    { dx: -130, dy: -110, r: 1.5, a: 0.4 },
    { dx: 120, dy: -90, r: 1.8, a: 0.5 },
    { dx: -110, dy: 100, r: 1.4, a: 0.35 },
    { dx: 135, dy: 95, r: 2.0, a: 0.6 },
    { dx: -50, dy: -145, r: 1.2, a: 0.3 },
    { dx: 60, dy: 140, r: 1.6, a: 0.45 },
  ];
  starSeeds.forEach((s) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${s.a})`;
    ctx.beginPath();
    ctx.arc(cx + s.dx, cy + s.dy, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Delicate Synapse Orbit Wave Rings (Replaces rigid thick borders)
  ctx.strokeStyle = item.color + "55";
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = item.color + "25";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([2, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // 5. Orbiting Memory Satellites along the Outer Ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
    const px = cx + Math.cos(angle) * (radius - 10);
    const py = cy + Math.sin(angle) * (radius - 10);

    ctx.fillStyle = i % 2 === 0 ? item.color : "#ffffff";
    ctx.beginPath();
    ctx.arc(px, py, i % 2 === 0 ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Top Second Brain Synapse Pill Tag
  const tagW = size * 0.72;
  const tagH = 34;
  const tagX = (size - tagW) / 2;
  const tagY = size * 0.16;

  ctx.fillStyle = isModern ? "rgba(15, 23, 42, 0.75)" : "rgba(3, 7, 18, 0.85)";
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 17);
  ctx.fill();

  ctx.strokeStyle = item.color + "66";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glowing Brain Icon / Dot in Tag
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.arc(tagX + 20, tagY + tagH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`SYNAPSE // ${item.tag}`, size * 0.5 + 8, tagY + tagH * 0.5);

  // 7. Central Second Brain Neural Particle Node Core
  const iconY = size * 0.44;
  drawSecondBrainNeuralParticleNode(ctx, cx, iconY, item.iconName, item.color);

  // 8. Title Heading (High Contrast & Clean Typography)
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const displayTitle = item.title.length > 20 ? item.title.slice(0, 20) + "…" : item.title;
  ctx.fillText(displayTitle, cx, size * 0.65);

  // 9. Second Brain Cluster Assignment Pill
  const clusterW = size * 0.76;
  const clusterH = 30;
  const clusterX = (size - clusterW) / 2;
  const clusterY = size * 0.74;

  ctx.fillStyle = isModern ? "rgba(255, 255, 255, 0.08)" : "rgba(168, 85, 247, 0.16)";
  ctx.beginPath();
  ctx.roundRect(clusterX, clusterY, clusterW, clusterH, 15);
  ctx.fill();

  ctx.strokeStyle = item.color + "44";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = isModern ? "#e2e8f0" : "#f3e8ff";
  ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, monospace";
  ctx.fillText(`BRAIN CLUSTER • ${item.coreAgent}`, cx, clusterY + clusterH * 0.5);

  // 10. Bottom Live Synapse Status Indicator
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.arc(cx - 55, size * 0.86, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isModern ? "#94a3b8" : "#c084fc";
  ctx.font = "bold 10.5px monospace";
  ctx.textAlign = "left";
  ctx.fillText("99.8% SYNAPSE LINK", cx - 45, size * 0.86);

  ctx.restore();
}

interface InfiniteGridAbilityMenuProps {
  onSelectAbility?: (ability: CoreAbilityItem) => void;
  lang?: "de" | "en";
}

export const InfiniteGridAbilityMenu: React.FC<InfiniteGridAbilityMenuProps> = ({
  onSelectAbility,
  lang = "de",
}) => {
  const { isModern } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedAbilityModal, setSelectedAbilityModal] = useState<CoreAbilityItem | null>(null);

  // Auto-Rotation controls
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState<number>(1); // 0.5, 1, 2
  const [showMemoryParticles, setShowMemoryParticles] = useState<boolean>(true);
  const [hoveredMemory, setHoveredMemory] = useState<any | null>(null);
  const autoRotateRef = useRef<boolean>(true);
  const autoRotateSpeedRef = useRef<number>(1);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    autoRotateSpeedRef.current = autoRotateSpeed;
  }, [autoRotateSpeed]);

  const activeAbility = ALL_8_CORE_ABILITIES[activeItemIndex % ALL_8_CORE_ABILITIES.length];

  // Filter categories
  const categories = useMemo(() => {
    return ["ALL", "COMMERCE & SALES", "DEV & CI/CD", "CREATIVE & VIDEO", "SYSTEM & RECON", "MESSAGING"];
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "ALL") return ALL_8_CORE_ABILITIES;
    return ALL_8_CORE_ABILITIES.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isPointerDown = false;
    let orientation = quat.create();
    let pointerRotation = quat.create();
    let rotationVelocity = 0;
    const rotationAxis = vec3.fromValues(1, 0, 0);
    const snapDirection = vec3.fromValues(0, 0, -1);
    let snapTargetDirection: vec3 | null = null;
    const EPSILON = 0.1;
    const IDENTITY_QUAT = quat.create();

    const pointerPos = vec2.create();
    const previousPointerPos = vec2.create();
    let _rotationVelocity = 0;
    const _combinedQuat = quat.create();

    const onPointerDown = (e: PointerEvent) => {
      vec2.set(pointerPos, e.clientX, e.clientY);
      vec2.copy(previousPointerPos, pointerPos);
      isPointerDown = true;
    };

    const onPointerUp = () => {
      isPointerDown = false;
    };

    const onPointerLeave = () => {
      isPointerDown = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isPointerDown) {
        vec2.set(pointerPos, e.clientX, e.clientY);
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.style.touchAction = "none";

    const project = (pos: vec2) => {
      const r = 2;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const s = Math.max(w, h) - 1;

      const x = (2 * pos[0] - w - 1) / s;
      const y = (2 * pos[1] - h - 1) / s;
      let z = 0;
      const xySq = x * x + y * y;
      const rSq = r * r;

      if (xySq <= rSq / 2.0) {
        z = Math.sqrt(rSq - xySq);
      } else {
        z = rSq / Math.sqrt(xySq);
      }
      return vec3.fromValues(-x, y, z);
    };

    const quatFromVectors = (a: vec3, b: vec3, out: quat, angleFactor = 1) => {
      const axis = vec3.cross(vec3.create(), a, b);
      vec3.normalize(axis, axis);
      const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
      const angle = Math.acos(d) * angleFactor;
      quat.setAxisAngle(out, axis, angle);
      return { q: out, axis, angle };
    };

    // WebGL Initialization
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    const discProgram = createProgram(gl, [discVertShaderSource, discFragShaderSource], null, {
      aModelPosition: 0,
      aModelNormal: 1,
      aModelUvs: 2,
      aInstanceMatrix: 3,
    });

    if (!discProgram) return;

    const discLocations = {
      aModelPosition: gl.getAttribLocation(discProgram, "aModelPosition"),
      aModelUvs: gl.getAttribLocation(discProgram, "aModelUvs"),
      aInstanceMatrix: gl.getAttribLocation(discProgram, "aInstanceMatrix"),
      uWorldMatrix: gl.getUniformLocation(discProgram, "uWorldMatrix"),
      uViewMatrix: gl.getUniformLocation(discProgram, "uViewMatrix"),
      uProjectionMatrix: gl.getUniformLocation(discProgram, "uProjectionMatrix"),
      uCameraPosition: gl.getUniformLocation(discProgram, "uCameraPosition"),
      uScaleFactor: gl.getUniformLocation(discProgram, "uScaleFactor"),
      uRotationAxisVelocity: gl.getUniformLocation(discProgram, "uRotationAxisVelocity"),
      uTex: gl.getUniformLocation(discProgram, "uTex"),
      uFrames: gl.getUniformLocation(discProgram, "uFrames"),
      uItemCount: gl.getUniformLocation(discProgram, "uItemCount"),
      uAtlasSize: gl.getUniformLocation(discProgram, "uAtlasSize"),
    };

    const discGeo = new DiscGeometry(48, 1);
    const discBuffers = discGeo.data;
    const discVAO = makeVertexArray(
      gl,
      [
        [makeBuffer(gl, discBuffers.vertices, gl.STATIC_DRAW), discLocations.aModelPosition, 3],
        [makeBuffer(gl, discBuffers.uvs, gl.STATIC_DRAW), discLocations.aModelUvs, 2],
      ],
      discBuffers.indices
    );

    const SPHERE_RADIUS = 2.0;
    const icoGeo = new IcosahedronGeometry();
    icoGeo.subdivide(1).spherize(SPHERE_RADIUS);
    const instancePositions = icoGeo.vertices.map((v) => v.position);
    const DISC_INSTANCE_COUNT = icoGeo.vertices.length;

    // Disc instances matrices
    const discInstances = {
      matricesArray: new Float32Array(DISC_INSTANCE_COUNT * 16),
      matrices: [] as Float32Array[],
      buffer: gl.createBuffer(),
    };

    for (let i = 0; i < DISC_INSTANCE_COUNT; ++i) {
      const instanceMatrixArray = new Float32Array(discInstances.matricesArray.buffer, i * 16 * 4, 16);
      instanceMatrixArray.set(mat4.create());
      discInstances.matrices.push(instanceMatrixArray);
    }

    gl.bindVertexArray(discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);
    const mat4AttribSlotCount = 4;
    const bytesPerMatrix = 16 * 4;
    for (let j = 0; j < mat4AttribSlotCount; ++j) {
      const loc = discLocations.aInstanceMatrix + j;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, j * 4 * 4);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // Texture Atlas initialization
    const itemCount = ALL_8_CORE_ABILITIES.length;
    const atlasSize = Math.ceil(Math.sqrt(itemCount));
    const atlasCanvas = document.createElement("canvas");
    const cellSize = 512;
    atlasCanvas.width = atlasSize * cellSize;
    atlasCanvas.height = atlasSize * cellSize;
    const ctx = atlasCanvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
      ALL_8_CORE_ABILITIES.forEach((item, i) => {
        const x = (i % atlasSize) * cellSize;
        const y = Math.floor(i / atlasSize) * cellSize;
        renderAbilityCanvasTile(ctx, x, y, cellSize, item, isModern);
      });
    }

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
    gl.generateMipmap(gl.TEXTURE_2D);

    const worldMatrix = mat4.create();
    const camera = {
      matrix: mat4.create(),
      near: 0.1,
      far: 40,
      fov: Math.PI / 4,
      aspect: 1,
      position: vec3.fromValues(0, 0, 3.2),
      up: vec3.fromValues(0, 1, 0),
      matrices: {
        view: mat4.create(),
        projection: mat4.create(),
      },
    };

    const updateCameraMatrix = () => {
      mat4.targetTo(camera.matrix, camera.position, [0, 0, 0], camera.up);
      mat4.invert(camera.matrices.view, camera.matrix);
    };

    const updateProjectionMatrix = () => {
      camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      const height = SPHERE_RADIUS * 0.38;
      const distance = camera.position[2];
      if (camera.aspect > 1) {
        camera.fov = 2 * Math.atan(height / distance);
      } else {
        camera.fov = 2 * Math.atan(height / camera.aspect / distance);
      }
      mat4.perspective(camera.matrices.projection, camera.fov, camera.aspect, camera.near, camera.far);
    };

    const resizeCanvas = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const displayWidth = Math.round(canvas.clientWidth * dpr);
      const displayHeight = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      updateProjectionMatrix();
    };

    updateCameraMatrix();
    resizeCanvas();

    const findNearestVertexIndex = () => {
      const n = snapDirection;
      const inversOrientation = quat.conjugate(quat.create(), orientation);
      const nt = vec3.transformQuat(vec3.create(), n, inversOrientation);

      let maxD = -1;
      let nearestIndex = 0;
      for (let i = 0; i < instancePositions.length; ++i) {
        const d = vec3.dot(nt, instancePositions[i]);
        if (d > maxD) {
          maxD = d;
          nearestIndex = i;
        }
      }
      return nearestIndex;
    };

    const getVertexWorldPosition = (index: number) => {
      const nearestVertexPos = instancePositions[index];
      return vec3.transformQuat(vec3.create(), nearestVertexPos, orientation);
    };

    let animationFrameId: number;
    let lastTime = 0;
    let frames = 0;
    const TARGET_FRAME_DURATION = 1000 / 60;

    const renderLoop = (time: number) => {
      const deltaTime = Math.min(32, time - lastTime);
      lastTime = time;
      const deltaFrames = deltaTime / TARGET_FRAME_DURATION;
      frames += deltaFrames;

      const timeScale = deltaTime / TARGET_FRAME_DURATION + 0.00001;
      let angleFactor = timeScale;
      let snapRotation = quat.create();

      if (isPointerDown) {
        const INTENSITY = 0.3 * timeScale;
        const ANGLE_AMPLIFICATION = 5 / timeScale;

        const midPointerPos = vec2.sub(vec2.create(), pointerPos, previousPointerPos);
        vec2.scale(midPointerPos, midPointerPos, INTENSITY);

        if (vec2.sqrLen(midPointerPos) > EPSILON) {
          vec2.add(midPointerPos, previousPointerPos, midPointerPos);
          const p = project(midPointerPos);
          const q = project(previousPointerPos);
          const a = vec3.normalize(vec3.create(), p);
          const b = vec3.normalize(vec3.create(), q);
          vec2.copy(previousPointerPos, midPointerPos);
          angleFactor *= ANGLE_AMPLIFICATION;
          quatFromVectors(a, b, pointerRotation, angleFactor);
        } else {
          quat.slerp(pointerRotation, pointerRotation, IDENTITY_QUAT, INTENSITY);
        }
      } else {
        const INTENSITY = 0.1 * timeScale;
        quat.slerp(pointerRotation, pointerRotation, IDENTITY_QUAT, INTENSITY);

        if (autoRotateRef.current) {
          // Continuous smooth auto-rotation
          const speedFactor = autoRotateSpeedRef.current;
          const autoAngle = 0.004 * speedFactor * timeScale;
          const axisX = 0.2;
          const axisY = 1.0;
          const axisZ = 0.15;
          const invLen = 1.0 / Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ);
          const autoRotQuat = quat.setAxisAngle(quat.create(), [axisX * invLen, axisY * invLen, axisZ * invLen], autoAngle);
          orientation = quat.multiply(quat.create(), autoRotQuat, orientation);
          quat.normalize(orientation, orientation);
        } else if (snapTargetDirection) {
          const SNAPPING_INTENSITY = 0.22;
          const a = snapTargetDirection;
          const b = snapDirection;
          const sqrDist = vec3.squaredDistance(a, b);
          const distanceFactor = Math.max(0.1, 1 - sqrDist * 10);
          angleFactor *= SNAPPING_INTENSITY * distanceFactor;
          quatFromVectors(a, b, snapRotation, angleFactor);
        }
      }

      const combinedQuat = quat.multiply(quat.create(), snapRotation, pointerRotation);
      orientation = quat.multiply(quat.create(), combinedQuat, orientation);
      quat.normalize(orientation, orientation);

      const RA_INTENSITY = 0.8 * timeScale;
      quat.slerp(_combinedQuat, _combinedQuat, combinedQuat, RA_INTENSITY);
      quat.normalize(_combinedQuat, _combinedQuat);

      const rad = Math.acos(_combinedQuat[3]) * 2.0;
      const s = Math.sin(rad / 2.0);
      let rv = 0;
      if (s > 0.000001) {
        rv = rad / (2 * Math.PI);
        rotationAxis[0] = _combinedQuat[0] / s;
        rotationAxis[1] = _combinedQuat[1] / s;
        rotationAxis[2] = _combinedQuat[2] / s;
      }

      const RV_INTENSITY = 0.5 * timeScale;
      _rotationVelocity += (rv - _rotationVelocity) * RV_INTENSITY;
      rotationVelocity = _rotationVelocity / timeScale;

      const movingState = isPointerDown || Math.abs(rotationVelocity) > 0.01;
      setIsMoving(movingState);

      if (!isPointerDown) {
        const nearestVertex = findNearestVertexIndex();
        setActiveItemIndex(nearestVertex % itemCount);
        if (!autoRotateRef.current) {
          const targetSnap = vec3.normalize(vec3.create(), getVertexWorldPosition(nearestVertex));
          snapTargetDirection = targetSnap;
        }
      }

      // Animate instances
      const positions = instancePositions.map((p) => vec3.transformQuat(vec3.create(), p, orientation));
      const discScale = 0.24;
      const SCALE_INTENSITY = 0.55;
      positions.forEach((p, ndx) => {
        const sVal = (Math.abs(p[2]) / SPHERE_RADIUS) * SCALE_INTENSITY + (1 - SCALE_INTENSITY);
        const finalScale = sVal * discScale;
        const matrix = mat4.create();
        mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), p)));
        mat4.multiply(matrix, matrix, mat4.targetTo(mat4.create(), [0, 0, 0], p, [0, 1, 0]));
        mat4.multiply(matrix, matrix, mat4.fromScaling(mat4.create(), [finalScale, finalScale, finalScale]));
        mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), [0, 0, -SPHERE_RADIUS]));
        mat4.copy(discInstances.matrices[ndx], matrix);
      });

      gl.bindBuffer(gl.ARRAY_BUFFER, discInstances.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, discInstances.matricesArray);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      // Render WebGL frame
      gl.useProgram(discProgram);
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.uniformMatrix4fv(discLocations.uWorldMatrix, false, worldMatrix);
      gl.uniformMatrix4fv(discLocations.uViewMatrix, false, camera.matrices.view);
      gl.uniformMatrix4fv(discLocations.uProjectionMatrix, false, camera.matrices.projection);
      gl.uniform3f(discLocations.uCameraPosition, camera.position[0], camera.position[1], camera.position[2]);
      gl.uniform4f(
        discLocations.uRotationAxisVelocity,
        rotationAxis[0],
        rotationAxis[1],
        rotationAxis[2],
        rotationVelocity * 1.1
      );
      gl.uniform1i(discLocations.uItemCount, itemCount);
      gl.uniform1i(discLocations.uAtlasSize, atlasSize);
      gl.uniform1f(discLocations.uFrames, frames);
      gl.uniform1f(discLocations.uScaleFactor, 1.0);
      gl.uniform1i(discLocations.uTex, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);

      gl.bindVertexArray(discVAO);
      gl.drawElementsInstanced(gl.TRIANGLES, discBuffers.indices.length, gl.UNSIGNED_SHORT, 0, DISC_INSTANCE_COUNT);

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [isModern]);

  return (
    <div className="w-full max-w-6xl mx-auto my-8 relative flex flex-col items-center">
      {/* Section Header */}
      <div className="text-center mb-6 max-w-3xl px-4">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold mb-3 ${
          isModern 
            ? "bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
            : "bg-purple-600/20 text-purple-200 border border-purple-500/50"
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>{lang === "de" ? "🧠 SECOND BRAIN // NEURALER PARTIKEL-GRAPH" : "🧠 SECOND BRAIN // NEURAL PARTICLE GRAPH"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          {lang === "de" ? "SECOND BRAIN WISSENS-GRAPH & SYNAPSEN-ORBIT" : "SECOND BRAIN KNOWLEDGE GRAPH & SYNAPSE ORBIT"}
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
          {lang === "de"
            ? "Autonom rotierende Second-Brain Kugel mit vernetzten Gedächtnis-Partikeln, pulsierenden Synapsen-Verknüpfungen und lebendiger Wissens-Architektur für all deine 8 Cores."
            : "Autonomously rotating Second-Brain sphere with interconnected memory particles, pulsing synapse connections, and living knowledge architecture across all 8 cores."}
        </p>

        {/* Quick Filter Categories */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/40 border border-purple-400"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Sphere Container with HUD */}
      <div className={`w-full h-[540px] sm:h-[620px] relative rounded-3xl overflow-hidden border ${
        isModern 
          ? "bg-[#090e1a]/95 backdrop-blur-2xl border-purple-500/30 shadow-2xl shadow-purple-950/30" 
          : "bg-[#040614]/95 backdrop-blur-2xl border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.25)]"
      }`}>
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-purple-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing block outline-none select-none relative z-10"
        />

        {/* Dynamic Memory Circular Particles Overlay (Erinnerungs-Partikel als bunte Kreise) */}
        {showMemoryParticles && (
          <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
            {[
              { id: "mem-p1", title: "Sovereign Master Brain", category: "CORE", color: "#a855f7", size: 12, top: "24%", left: "12%", pulse: "3.2s" },
              { id: "mem-p2", title: "Shopify E-Com Orders", category: "COMMERCE", color: "#10b981", size: 10, top: "66%", left: "14%", pulse: "2.4s" },
              { id: "mem-p3", title: "Gmail & Drive OAuth", category: "WORKSPACE", color: "#06b6d4", size: 13, top: "20%", left: "84%", pulse: "3.5s" },
              { id: "mem-p4", title: "Chronos Deep-Work Blöcke", category: "TIME", color: "#f59e0b", size: 10, top: "74%", left: "82%", pulse: "2.8s" },
              { id: "mem-p5", title: "Cyberpunk UI & Minimal Dark", category: "PREFERENCES", color: "#ec4899", size: 11, top: "42%", left: "7%", pulse: "2.1s" },
              { id: "mem-p6", title: "Veo 3.1 8K Video Pipeline", category: "CREATIVE", color: "#d946ef", size: 11, top: "48%", left: "91%", pulse: "3.6s" },
              { id: "mem-p7", title: "Discord Bot & Tickets", category: "COMMUNITY", color: "#6366f1", size: 9, top: "82%", left: "34%", pulse: "2.6s" },
              { id: "mem-p8", title: "GitHub Auto-CI/CD", category: "DEVELOPER", color: "#38bdf8", size: 10, top: "16%", left: "44%", pulse: "2.9s" },
              { id: "mem-p9", title: "Lead Ingestion Pipeline", category: "CRM", color: "#fb923c", size: 9.5, top: "84%", left: "64%", pulse: "3.1s" },
              { id: "mem-p10", title: "Voice Studio <85ms", category: "AUDIO", color: "#eab308", size: 9, top: "14%", left: "68%", pulse: "2.2s" },
            ].map((p) => (
              <div
                key={p.id}
                style={{
                  top: p.top,
                  left: p.left,
                  animation: `pulse ${p.pulse} infinite ease-in-out`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group flex items-center justify-center"
                onClick={() => setHoveredMemory(p)}
                onMouseEnter={() => setHoveredMemory(p)}
                onMouseLeave={() => setHoveredMemory(null)}
              >
                {/* Simple Circular Particle in distinctive vibrant color */}
                <div
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    boxShadow: `0 0 16px ${p.color}, 0 0 6px #ffffff`,
                  }}
                  className="rounded-full transition-transform duration-300 group-hover:scale-150 relative"
                >
                  {/* Subtle bright center dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/90" />
                </div>

                {/* Hover Memory Badge */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                  <div className="px-2.5 py-1 rounded-xl bg-slate-950/95 border border-purple-500/40 text-[10px] font-mono text-white shadow-xl shadow-purple-950/50 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                    <span className="font-bold">{p.title}</span>
                    <span className="text-[8.5px] px-1 rounded bg-slate-800 text-purple-300 uppercase">{p.category}</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-950 border-r border-b border-purple-500/40 rotate-45 -mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Top Capability Pill */}
        <div
          className={`absolute top-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 max-w-[90%] sm:max-w-md ${
            isMoving ? "opacity-40 scale-95 pointer-events-none" : "opacity-100 scale-100"
          }`}
        >
          <div className="p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl text-center shadow-2xl bg-slate-900/90 border-purple-500/30 text-white">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: activeAbility.color }}
              />
              <span
                className="text-[10.5px] font-mono font-bold uppercase tracking-widest"
                style={{ color: activeAbility.color }}
              >
                {activeAbility.category}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">{activeAbility.title}</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed line-clamp-2 font-sans">
              {activeAbility.description}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <span className="px-2.5 py-0.5 rounded bg-slate-800 text-[10.5px] font-mono text-purple-300 font-semibold border border-purple-500/30">
                Core: {activeAbility.coreAgent}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAbilityModal(activeAbility)}
                className="px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold transition flex items-center gap-1 cursor-pointer bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
              >
                <span>Details & Workflows</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Bottom Left Controls: Auto-Rotation Toggle & Speed Selector */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          {/* Auto-Rotate Toggle Button */}
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition cursor-pointer font-bold ${
              autoRotate
                ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                : "bg-slate-900/90 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 text-purple-400 ${autoRotate ? "animate-spin" : ""}`} />
            <span>{autoRotate ? (lang === "de" ? "AUTO-DREHUNG: AN" : "AUTO-SPIN: ON") : (lang === "de" ? "AUTO-DREHUNG: PAUSIERT" : "AUTO-SPIN: PAUSED")}</span>
          </button>

          {/* Speed Selector (0.5x, 1x, 2x) */}
          {autoRotate && (
            <div className="flex items-center gap-1 bg-slate-950/80 border border-purple-500/30 rounded-xl p-0.5">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setAutoRotateSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    autoRotateSpeed === spd
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}

          {/* Memory Particles Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMemoryParticles((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-bold ${
              showMemoryParticles
                ? "bg-fuchsia-600/25 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.3)]"
                : "bg-slate-900/90 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title={lang === "de" ? "Erinnerungs-Partikel ein-/ausblenden" : "Toggle memory particles"}
          >
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <span>{showMemoryParticles ? (lang === "de" ? "ERINNERUNGEN: PARTIKEL" : "MEMORY PARTICLES: ON") : (lang === "de" ? "PARTIKEL: AUS" : "PARTICLES: OFF")}</span>
          </button>
        </div>

        {/* Floating Bottom Right Action Button */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedAbilityModal(activeAbility)}
            className="px-4 py-2.5 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg active:scale-95 bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-600/30 border border-purple-400/40"
          >
            <span>{lang === "de" ? "ALLE 16 ABILITIES ANSEHEN" : "VIEW ALL 16 ABILITIES"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detail Modal for Selected Ability */}
      {selectedAbilityModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative font-mono text-left animate-in fade-in zoom-in duration-200 bg-slate-900 border-purple-500/40 text-white shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <button
              onClick={() => setSelectedAbilityModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                style={{ backgroundColor: selectedAbilityModal.color + "22", color: selectedAbilityModal.color }}
              >
                {selectedAbilityModal.category}
              </span>
              <span className="text-xs text-purple-300">• Core: {selectedAbilityModal.coreAgent}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">{selectedAbilityModal.title}</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed font-sans">{selectedAbilityModal.description}</p>

            <div className="mt-5 space-y-2">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                {lang === "de" ? "HIGHLIGHTS & WORKFLOWS:" : "KEY CAPABILITIES:"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedAbilityModal.features.map((feat) => (
                  <div
                    key={feat}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-purple-500/20 flex items-center gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-200 font-semibold">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                {lang === "de" ? "In allen Plänen (Pro & Enterprise) aktiv" : "Active in Pro & Enterprise Plans"}
              </div>
              <div className="flex items-center gap-2">
                {selectedAbilityModal.id === "discord" && (
                  <a
                    href="https://discord.gg/4D6mb4xbVr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md shadow-[#5865F2]/40 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>SYNTAX Discord Server</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAbilityModal(null);
                    if (onSelectAbility) onSelectAbility(selectedAbilityModal);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                >
                  {lang === "de" ? "Schließen" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
