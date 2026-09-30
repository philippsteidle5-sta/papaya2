import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { QueryLogEntry } from "../utils/queryHistoryStore";
import { get2514SovereignMemories } from "../utils/sovereignMemoryBank";
import {
  Search,
  RotateCcw,
  X,
  Copy,
  Check,
  Send,
  Shuffle,
  ZoomIn,
  ZoomOut,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Flame,
  Brain,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";

export interface MemoryParticleUniverseProps {
  memories?: QueryLogEntry[];
  selectedMemoryId?: string | null;
  onSelectMemory?: (memory: QueryLogEntry) => void;
  activeAgentFilter?: string;
  searchQuery?: string;
  height?: number | string;
  themeStyle?: "modern" | "cyberpunk";
  className?: string;
  showControls?: boolean;
  isFocusMode?: boolean;
  onToggleFocusMode?: (focus: boolean) => void;
  onCloseModal?: () => void;
}

// 8 Real Sovereign Agent Cores & Neural Clusters
export const CLU = [
  { k: "SYNTAX", c: "#4ee8ff", n: "Multi-Agent Orchestration & Core Router", agentId: "syntax" },
  { k: "NEO", c: "#ff2a8d", n: "Cognitive Matrix & High-Ticket Funnels", agentId: "neo" },
  { k: "VEGA", c: "#10b981", n: "Full-Stack Code AST & 120 FPS WebGL Engine", agentId: "vega" },
  { k: "ODIN", c: "#38bdf8", n: "Zero-Trust Security, Defense Audits & RBAC", agentId: "odin" },
  { k: "PULSE", c: "#ff4d5e", n: "Veo 3.1 8K Cinema Prompts & Viral Synthese", agentId: "pulse" },
  { k: "CHRONOS", c: "#f59e0b", n: "Temporal Workflows, Deep Work & Midnight Cron", agentId: "chronos" },
  { k: "ORACLE", c: "#a855f7", n: "Market Vectors, MRR Projection & Signal Radar", agentId: "oracle" },
  { k: "GLOBE", c: "#3b82f6", n: "Quad-Core Deep Search & Realtime Web Grounding", agentId: "globe" },
];

function pad(n: number) {
  return "PRM-" + String(n).padStart(5, "0");
}

function rr(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function dirv(): [number, number, number] {
  const z = 2 * Math.random() - 1;
  const th = Math.random() * 6.28318;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return [r * Math.cos(th), r * Math.sin(th), z];
}

function sm(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function cerebrum(): [number, number, number] {
  let dx = 0;
  let dy = 0;
  let dz = 0;
  let ridge = 0;
  do {
    [dx, dy, dz] = dirv();
    const q = 7.0 * dy + 3.0 * dz + 4.0 * Math.abs(dx);
    const q2 = 11.0 * Math.abs(dx) + 5.0 * dy;
    ridge = Math.abs(Math.sin(q + Math.sin(q2) * 1.7));
  } while (Math.random() > 0.2 + 0.8 * ridge * ridge);

  const side = Math.abs(dx);
  let r = 1 + 0.06 * (ridge - 0.5);
  r *= 1 + 0.16 * Math.exp(-((dz - 0.15) * (dz - 0.15)) / 0.1) * sm(0.35, 0.85, side) * (dy < 0.2 ? 1 : 0);
  r -= 0.1 * Math.exp(-Math.pow((dy + 0.1 + 0.3 * dz) / 0.07, 2)) * sm(0.4, 0.8, side);
  r -= 0.2 * Math.exp(-(dx * dx) / 0.012) * Math.max(0, dy + 0.2);

  let x = dx * r;
  let y = dy * r;
  let z = dz * r;
  if (y < 0) y *= 1 - 0.5 * sm(0, -0.6, y);
  x = Math.sign(dx) * (0.05 + Math.abs(x) * 0.95);
  x *= 1 + 0.1 * z;

  let p: [number, number, number] = [x * 1, y * 0.85, z * 1.35];
  if (Math.random() < 0.08) {
    const k = 0.35 + 0.5 * Math.random();
    p = [p[0] * k, p[1] * k, p[2] * k];
  }
  return p;
}

function cerebellum(): [number, number, number] {
  let dx = 0;
  let dy = 0;
  let dz = 0;
  do {
    [dx, dy, dz] = dirv();
  } while (Math.random() > 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(dy * 34 + dx * 2)));
  return [dx * 0.5, dy * 0.26 - 0.5, dz * 0.36 - 0.78];
}

function stem(): [number, number, number] {
  const t = Math.random();
  const a = Math.random() * 6.2832;
  const rad = 0.1 * (1 - 0.3 * t);
  return [Math.cos(a) * rad, -0.38 - 0.45 * t, -0.3 - 0.22 * t + Math.sin(a) * rad];
}

// Clean subtle highlight for matched search terms
function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return text;
  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-[#ffb547] font-semibold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

function targetCurve(s: number) {
  if (s < 0.3) return 0;
  if (s < 0.55) return (s - 0.3) / 0.25;
  if (s < 0.7) return 1;
  if (s < 0.95) return 1 - (s - 0.7) / 0.25;
  return 0;
}

export const MemoryParticleUniverse: React.FC<MemoryParticleUniverseProps> = ({
  memories = [],
  selectedMemoryId,
  onSelectMemory,
  activeAgentFilter,
  searchQuery: initialSearchQuery = "",
  height = 360,
  themeStyle = "cyberpunk",
  className = "",
  showControls = true,
  isFocusMode = true,
  onToggleFocusMode,
  onCloseModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const [searchVal, setSearchVal] = useState(initialSearchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearchQuery);
  const [activeCluster, setActiveCluster] = useState<number>(-1);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(-1);
  const selectedNodeIndexRef = useRef<number>(-1);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchMs, setSearchMs] = useState<number>(38);
  const [clusterCounts, setClusterCounts] = useState<number[]>([]);
  const [zoomLevelDisplay, setZoomLevelDisplay] = useState<number>(100);

  const N = 22000;

  const zoomFactorRef = useRef<number>(1.0);
  const scrollProgRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchVal);
    }, 240);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchVal]);

  // Sync external filter
  useEffect(() => {
    if (activeAgentFilter && activeAgentFilter !== "all") {
      const idx = CLU.findIndex((c) => c.k.toLowerCase() === activeAgentFilter.toLowerCase());
      if (idx >= 0) setActiveCluster(idx);
    } else {
      setActiveCluster(-1);
    }
  }, [activeAgentFilter]);

  const [backendMemories, setBackendMemories] = useState<QueryLogEntry[]>([]);

  // Fetch authentic memories directly from the backend endpoint
  useEffect(() => {
    let isCancelled = false;
    const loadBackend = async () => {
      try {
        const res = await fetch("/api/memories?limit=3000");
        if (res.ok) {
          const json = await res.json();
          if (json.memories && Array.isArray(json.memories) && !isCancelled) {
            setBackendMemories(json.memories);
          }
        }
      } catch (err) {
        console.warn("[MemoryUniverse] Backend fetch note:", err);
      }
    };
    loadBackend();

    const handleUpdate = () => loadBackend();
    window.addEventListener("syntax_query_logs_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      isCancelled = true;
      window.removeEventListener("syntax_query_logs_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Construct 22,000 Nodes with unique real backend memories and distinct sovereign background nodes
  const { nodeData, CL, counts } = useMemo(() => {
    const sovereignBase = get2514SovereignMemories();
    const userList: Array<{
      id: string;
      agentId: string;
      agentName?: string;
      title: string;
      prompt: string;
      thought?: string;
      response?: string;
      latencyMs?: number;
      tokens?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
      timestamp?: string;
      tags?: string[];
      uses?: number;
    }> = [];

    const seenUserKeys = new Set<string>();

    const addMemoryIfUnique = (m: any) => {
      const prompt = m.prompt || m.query || "";
      const normPrompt = prompt.trim().toLowerCase();
      const code = m.id || m.code || "";
      const key = `${code}::${normPrompt}`;
      if (!normPrompt || seenUserKeys.has(key) || seenUserKeys.has(normPrompt)) return;
      seenUserKeys.add(key);
      seenUserKeys.add(normPrompt);
      userList.push({
        id: code,
        agentId: m.agentId || "syntax",
        agentName: m.agentName,
        title: m.title || prompt,
        prompt: prompt,
        thought: m.thought,
        response: m.response,
        latencyMs: m.latencyMs,
        tokens: m.tokens,
        timestamp: m.timestamp,
        tags: m.tags,
        uses: m.uses || 1,
      });
    };

    // 1. Backend Memories (live from server /api/memories)
    if (backendMemories.length > 0) {
      backendMemories.forEach(addMemoryIfUnique);
    }

    // 2. Merged Live Chat Memories (from props)
    if (memories && memories.length > 0) {
      memories.forEach(addMemoryIfUnique);
    }

    const totalUser = userList.length;
    const totalSov = sovereignBase.length > 0 ? sovereignBase.length : 1;

    const data: Array<{
      id: number;
      code: string;
      cluster: number;
      title: string;
      prompt: string;
      response: string;
      thought?: string;
      uses: number;
      tokens: number;
      latencyMs: number;
      tags: string[];
      createdAt: string;
    }> = [];

    const tempCL = new Uint8Array(N);
    const tempCounts = new Array(CLU.length).fill(0);

    for (let i = 0; i < N; i++) {
      let src: any = undefined;
      let isUserMemory = false;

      if (i < totalUser) {
        // Authentic user chat memory placed uniquely ONCE (no tiling/repetition!)
        src = userList[i];
        isUserMemory = true;
      } else {
        // Distinct sovereign base memory
        const sovIdx = (i - totalUser) % totalSov;
        src = sovereignBase[sovIdx];
      }

      const agentId = (src?.agentId || "syntax").toLowerCase();
      let clIdx = CLU.findIndex((c) => c.agentId === agentId);
      if (clIdx === -1) clIdx = i % CLU.length;

      tempCL[i] = clIdx;
      tempCounts[clIdx]++;

      const rawTitle = src?.title || `Sovereign Matrix Core [${CLU[clIdx].k}]`;
      const title = rawTitle.length > 65 ? rawTitle.slice(0, 62) + "..." : rawTitle;
      const prompt = src?.prompt || rawTitle;
      const response = src?.response || "Direktive im Sovereign Memory verankert.";
      const thought = src?.thought;
      const latencyMs = src?.latencyMs || (180 + ((i * 17) % 220));
      const tokensCount = src?.tokens?.totalTokens || Math.max(15, Math.round(prompt.length / 3.6));
      const uses = src?.uses || (1 + ((i * 19) % 280));
      const code = isUserMemory ? src?.id || `MEM-${i + 1}` : `SOV-${CLU[clIdx].k}-${String(i + 1).padStart(5, "0")}`;

      data.push({
        id: i,
        code,
        cluster: clIdx,
        title,
        prompt,
        response,
        thought,
        uses,
        tokens: tokensCount,
        latencyMs,
        tags: src?.tags || [CLU[clIdx].k.toLowerCase(), isUserMemory ? "live-memory" : "sovereign-core"],
        createdAt: src?.timestamp || "2026-09-28",
      });
    }

    return { nodeData: data, CL: tempCL, counts: tempCounts };
  }, [N, memories, backendMemories]);

  useEffect(() => {
    setClusterCounts(counts);
  }, [counts]);

  // Search Results Calculation with strict deduplication
  const searchResults = useMemo(() => {
    const t0 = performance.now();
    const q = debouncedQuery.trim().toLowerCase();
    if (!q && activeCluster < 0) {
      return { total: N, ids: null, items: [] };
    }

    const tokens = q.split(/\s+/).filter(Boolean);
    const matchedIds: number[] = [];
    const seenMatchKeys = new Set<string>();
    const uniqueMatchedIds: number[] = [];

    for (let i = 0; i < N; i++) {
      if (activeCluster >= 0 && CL[i] !== activeCluster) continue;

      if (tokens.length === 0) {
        matchedIds.push(i);
        uniqueMatchedIds.push(i);
        continue;
      }

      const itemText = (
        nodeData[i].title +
        " " +
        nodeData[i].prompt +
        " " +
        nodeData[i].tags.join(" ") +
        " " +
        CLU[CL[i]].k +
        " " +
        CLU[CL[i]].n
      ).toLowerCase();

      let match = true;
      for (const t of tokens) {
        if (!itemText.includes(t)) {
          match = false;
          break;
        }
      }
      if (match) {
        matchedIds.push(i);
        const dedupeKey = `${nodeData[i].prompt.trim().toLowerCase()}::${nodeData[i].code}`;
        if (!seenMatchKeys.has(dedupeKey)) {
          seenMatchKeys.add(dedupeKey);
          uniqueMatchedIds.push(i);
        }
      }
    }

    // Rank results
    const sc = new Float32Array(uniqueMatchedIds.length);
    for (let k = 0; k < uniqueMatchedIds.length; k++) {
      const i = uniqueMatchedIds[k];
      const T = nodeData[i].title.toLowerCase();
      let score = nodeData[i].uses / 300;
      for (const t of tokens) {
        const idx = T.indexOf(t);
        if (idx >= 0) score += 2 + (idx === 0 ? 1 : 0);
      }
      sc[k] = score;
    }

    const sortedIds = uniqueMatchedIds.slice().sort((a, b) => {
      const idxA = uniqueMatchedIds.indexOf(a);
      const idxB = uniqueMatchedIds.indexOf(b);
      return sc[idxB] - sc[idxA];
    });

    const items = sortedIds.slice(0, 45).map((id) => nodeData[id]);
    const ms = Math.max(8, Math.round(performance.now() - t0));
    setSearchMs(ms);

    return { total: uniqueMatchedIds.length, ids: matchedIds, items };
  }, [debouncedQuery, activeCluster, N, nodeData, CL]);

  // Three.js State Refs
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
    mat: THREE.ShaderMaterial;
    markerGroup: THREE.Group;
    markerAuraMat: THREE.MeshBasicMaterial;
    brain: Float32Array;
    scat: Float32Array;
    seed: Float32Array;
    hit: Float32Array;
    hitAttr: THREE.BufferAttribute;
    selected: Float32Array;
    selectedAttr: THREE.BufferAttribute;
    prevSelectedNodeIndex: number;
    camGoal: THREE.Vector3;
    camLook: THREE.Vector3;
    lkGoal: THREE.Vector3;
    focusA: number | null;
    holdUntil: number;
    p: number;
    baseZ: number;
    SEARCH: boolean;
    fT: number;
    selectedNodeIndex: number;
  } | null>(null);

  // Initialize Three.js Brain Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch (e) {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x06070a);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
    const wide = window.innerWidth / window.innerHeight > 1.1;
    const baseZ = wide ? 4.8 : 6.6;
    camera.position.z = baseZ;

    const group = new THREE.Group();
    scene.add(group);
    group.rotation.y = 1.15;
    group.position.set(0, wide ? 0 : 0.5, 0);

    const brain = new Float32Array(N * 3);
    const scat = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const seed = new Float32Array(N);

    const orange = [1, 0.6, 0.22];
    const blue = [0.35, 0.62, 1];

    for (let i = 0; i < N; i++) {
      const u = Math.random();
      const kind = u < 0.12 ? 1 : u < 0.16 ? 2 : 0;
      const p = kind === 1 ? cerebellum() : kind === 2 ? stem() : cerebrum();

      brain.set(p, i * 3);

      const R = 5.5 * Math.cbrt(Math.random());
      const a = Math.random() * 6.283;
      const b = Math.acos(2 * Math.random() - 1);
      scat.set([R * Math.sin(b) * Math.cos(a) * 1.5, R * Math.cos(b), R * Math.sin(b) * Math.sin(a)], i * 3);

      const m = kind === 1 ? 0.8 + 0.2 * Math.random() : kind === 2 ? 0.1 : 0.5 + 0.5 * Math.sin(p[0] * 2.3 + p[2] * 1.7 + Math.random() * 1.5);
      const w = Math.random() < 0.04 ? 1 : 0;

      for (let k = 0; k < 3; k++) {
        col[i * 3 + k] = w ? 1 : orange[k] * (1 - m) + blue[k] * m;
      }
      seed[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(brain, 3));
    geo.setAttribute("aScatter", new THREE.BufferAttribute(scat, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const hit = new Float32Array(N).fill(1);
    const hitAttr = new THREE.BufferAttribute(hit, 1);
    geo.setAttribute("aHit", hitAttr);

    // Selected particle attribute: 1.0 for the selected node, 0.0 otherwise
    const selected = new Float32Array(N).fill(0);
    const selectedAttr = new THREE.BufferAttribute(selected, 1);
    geo.setAttribute("aSelected", selectedAttr);

    // Exact shader matching the user's specification with gentle, natural glow on selected particle
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uP: { value: 0 },
        uTime: { value: 0 },
        uMotion: { value: 1 },
        uSize: { value: 34 },
        uPx: { value: renderer.getPixelRatio() },
        uFilter: { value: 0 },
      },
      vertexShader: `
        attribute vec3 aScatter;
        attribute vec3 aColor;
        attribute float aSeed;
        attribute float aHit;
        attribute float aSelected;
        uniform float uP, uTime, uMotion, uSize, uPx, uFilter;
        varying vec3 vC;
        varying float vA;
        varying float vSel;

        void main(){
          float e = uP * uP * (3.0 - 2.0 * uP);
          vec3 p = mix(position, aScatter, e);
          p += 0.035 * uMotion * vec3(
            sin(uTime * 0.6 + aSeed * 40.0),
            cos(uTime * 0.5 + aSeed * 23.0),
            sin(uTime * 0.4 + aSeed * 57.0)
          ) * (0.4 + e * 1.8);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float baseSize = (uSize * uPx * (0.5 + aSeed * 0.9) / -mv.z * mix(1.0, mix(0.55, 1.5, aHit), uFilter));
          if (aSelected > 0.5) {
            gl_PointSize = max(24.0 * uPx, baseSize * 3.0);
          } else {
            gl_PointSize = baseSize;
          }
          gl_Position = projectionMatrix * mv;
          vC = aColor;
          vA = mix(1.0, 0.6, e) * mix(1.0, mix(0.1, 1.5, aHit), uFilter);
          vSel = aSelected;
        }
      `,
      fragmentShader: `
        varying vec3 vC;
        varying float vA;
        varying float vSel;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          if (vSel > 0.5) {
            float core = smoothstep(0.2, 0.0, d);
            float halo = smoothstep(0.5, 0.04, d);
            vec3 col = mix(vC * 1.8, vec3(1.0, 1.0, 1.0), core * 0.85);
            float alpha = max(0.98, halo);
            gl_FragColor = vec4(col * halo, alpha);
          } else {
            float a = smoothstep(0.5, 0.0, d);
            vec3 col = vC;
            float alpha = vA * 0.92;
            gl_FragColor = vec4(col * a, a * alpha);
          }
        }
      `,
    });

    const pointsMesh = new THREE.Points(geo, mat);
    group.add(pointsMesh);

    // Clean, dedicated luminous point at the selected particle position (depthTest: false)
    const markerGroup = new THREE.Group();
    markerGroup.visible = false;
    group.add(markerGroup);

    const markerCoreGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const markerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthTest: false,
      transparent: true,
      opacity: 0.95,
    });
    const markerCore = new THREE.Mesh(markerCoreGeo, markerCoreMat);
    markerCore.renderOrder = 999;
    markerGroup.add(markerCore);

    const markerAuraGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const markerAuraMat = new THREE.MeshBasicMaterial({
      color: 0xff7a59,
      depthTest: false,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const markerAura = new THREE.Mesh(markerAuraGeo, markerAuraMat);
    markerAura.renderOrder = 998;
    markerGroup.add(markerAura);

    const resize = () => {
      if (!canvas || !renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const isW = w / h > 1.1;
      const bZ = isW ? 4.8 : 6.6;
      threeState.baseZ = bZ;
      if (!threeState.SEARCH) camera.position.z = bZ * zoomFactorRef.current;
      group.position.set(0, isW ? 0 : 0.5, 0);
      camera.updateProjectionMatrix();
    };

    const threeState = {
      renderer,
      scene,
      camera,
      group,
      mat,
      markerGroup,
      markerAuraMat,
      brain,
      scat,
      seed,
      hit,
      hitAttr,
      selected,
      selectedAttr,
      prevSelectedNodeIndex: -1,
      camGoal: new THREE.Vector3(0, 0, baseZ),
      camLook: new THREE.Vector3(0, 0, 0),
      lkGoal: new THREE.Vector3(0, 0, 0),
      focusA: null as number | null,
      holdUntil: 0,
      p: 0,
      baseZ,
      SEARCH: false,
      fT: 0,
      selectedNodeIndex: -1,
    };
    threeRef.current = threeState;

    resize();
    window.addEventListener("resize", resize);

    // Pointer Drag & Tilt Controls
    let drag: { x: number; y: number; m: number } | null = null;
    let mx = 0;
    let my = 0;

    const onPointerDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, m: 0 };
      canvas.setPointerCapture(e.pointerId);
      threeState.focusA = null;
      if (tipRef.current) tipRef.current.style.display = "none";
    };

    const _v = new THREE.Vector3();
    const proj = (i: number, e: number, t: number, raw?: boolean) => {
      const w = 0.035 * mat.uniforms.uMotion.value * (0.4 + e * 1.8);
      const s0 = seed[i];
      const k = 3 * i;
      _v.set(
        brain[k] + (scat[k] - brain[k]) * e + w * Math.sin(t * 0.6 + s0 * 40),
        brain[k + 1] + (scat[k + 1] - brain[k + 1]) * e + w * Math.cos(t * 0.5 + s0 * 23),
        brain[k + 2] + (scat[k + 2] - brain[k + 2]) * e + w * Math.sin(t * 0.4 + s0 * 57)
      );
      _v.applyMatrix4(group.matrixWorld);
      return raw ? _v : _v.project(camera);
    };

    const pick = (cx: number, cy: number) => {
      group.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      const e = threeState.p * threeState.p * (3 - 2 * threeState.p);
      const t = mat.uniforms.uTime.value;
      const W = window.innerWidth;
      const H = window.innerHeight;
      let best = -1;
      let bz = 99;

      for (let i = 0; i < N; i++) {
        if (threeState.fT > 0 && !threeState.hit[i]) continue;
        const v = proj(i, e, t);
        const dx = (v.x * 0.5 + 0.5) * W - cx;
        const dy = (-v.y * 0.5 + 0.5) * H - cy;
        if (dx * dx + dy * dy < 280 && v.z < bz) {
          bz = v.z;
          best = i;
        }
      }
      return best;
    };

    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;

      if (drag) {
        group.rotation.y += (e.clientX - drag.x) * 0.008;
        drag.m += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
        drag.x = e.clientX;
        drag.y = e.clientY;
        return;
      }

      // Hover tooltip
      const hitIdx = pick(e.clientX, e.clientY);
      if (hitIdx < 0) {
        if (tipRef.current) tipRef.current.style.display = "none";
      } else if (tipRef.current) {
        const c = CLU[CL[hitIdx]];
        tipRef.current.innerHTML = `<i class="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_${c.c}]" style="background:${c.c};margin-top:3px"></i><div class="flex flex-col"><span class="font-bold text-white leading-tight">${nodeData[hitIdx].title}</span><span class="text-[10px] text-zinc-400 font-mono mt-0.5">${c.k} · ${nodeData[hitIdx].code}</span></div>`;
        tipRef.current.style.display = "flex";
        tipRef.current.style.transform = `translate(${Math.min(e.clientX + 16, window.innerWidth - 340)}px, ${e.clientY + 14}px)`;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const was = drag;
      drag = null;
      if (was && was.m < 6) {
        const i = pick(e.clientX, e.clientY);
        if (i >= 0) selectNode(i);
      }
    };

    // Wheel: Free Zoom in/out or smooth scroll morphing
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (threeState.SEARCH && threeState.selectedNodeIndex >= 0) {
        const delta = e.deltaY * 0.0035;
        const nextZoom = Math.min(6.0, Math.max(0.35, zoomFactorRef.current + delta));
        zoomFactorRef.current = nextZoom;
        setZoomLevelDisplay(Math.round((1 / nextZoom) * 100));
      } else {
        const delta = e.deltaY * 0.0012;
        scrollProgRef.current = Math.min(1, Math.max(0, scrollProgRef.current + delta));
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // Frame Hook for smooth morph and rotation
    function frameHook(dt: number) {
      const u = mat.uniforms.uFilter;
      u.value += (threeState.fT - u.value) * Math.min(1, dt * 4.5);

      if (threeState.focusA !== null) {
        let d = threeState.focusA - group.rotation.y;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        group.rotation.y += d * Math.min(1, dt * 3.5);
        if (Math.abs(d) < 0.02) {
          threeState.focusA = null;
          threeState.holdUntil = performance.now() + 6000;
        }
      } else if (!drag && performance.now() > threeState.holdUntil) {
        group.rotation.y += dt * 0.14;
      }
    }

    // Camera Hook: Smoothly glides to frame selected particle or resets to brain view
    const camLook = new THREE.Vector3();
    const camGoal = new THREE.Vector3();
    const lkGoal = new THREE.Vector3();

    function camHook(dt: number) {
      group.updateMatrixWorld(true);
      const selIdx = threeState.selectedNodeIndex;
      // Fly to node when selected; when searching, wait until brain has started expanding
      const fly = selIdx >= 0 && (threeState.SEARCH ? threeState.p > 0.65 : true);
      const k = Math.min(1, dt * (fly ? 2.8 : 3.2));

      if (fly) {
        const e = threeState.p * threeState.p * (3 - 2 * threeState.p);
        const w = proj(selIdx, e, mat.uniforms.uTime.value, true);
        lkGoal.copy(w);
        const wide = window.innerWidth / window.innerHeight > 1.1;
        const targetDist = (wide ? 2.2 : 3.0) * zoomFactorRef.current;
        camGoal.set(w.x, w.y, w.z + targetDist);
      } else {
        lkGoal.set(0, 0, 0);
        camGoal.set(0, 0, threeState.baseZ * zoomFactorRef.current);
      }

      camera.position.lerp(camGoal, k);
      camLook.lerp(lkGoal, k);
      camera.lookAt(camLook);
    }

    let lastTime = performance.now();
    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const now = performance.now();
      const rawDt = (now - lastTime) * 0.001;
      lastTime = now;
      const dt = Math.min(rawDt, 0.033);

      // Morphing progress: When searching, p smoothly transitions to 1 (scattered universe). Otherwise follows targetCurve(scroll)
      const targetVal = threeState.SEARCH ? 1 : targetCurve(scrollProgRef.current);
      const morphRate = threeState.SEARCH ? 3.4 : 4.0;
      threeState.p += (targetVal - threeState.p) * Math.min(1, dt * morphRate);
      mat.uniforms.uP.value = threeState.p;
      mat.uniforms.uTime.value += dt;

      frameHook(dt);

      group.rotation.x += (my * 0.35 - group.rotation.x) * 0.05;
      group.rotation.z += (-mx * 0.15 - group.rotation.z) * 0.05;

      camHook(dt);

      // 2D Pulse Ring Target Beacon sync (tracks particle screen coordinates)
      if (ringRef.current) {
        if (threeState.selectedNodeIndex >= 0) {
          const isRingVisible = !(threeState.SEARCH && threeState.p < 0.70);
          ringRef.current.style.visibility = isRingVisible ? "visible" : "hidden";
          const e = threeState.p * threeState.p * (3 - 2 * threeState.p);
          const v = proj(threeState.selectedNodeIndex, e, mat.uniforms.uTime.value);
          const rx = Math.round((v.x * 0.5 + 0.5) * window.innerWidth);
          const ry = Math.round((-v.y * 0.5 + 0.5) * window.innerHeight);
          ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
        } else {
          ringRef.current.style.visibility = "hidden";
        }
      }

      // Sync marker point in 3D directly with the selected particle's motion
      if (threeState.selectedNodeIndex >= 0) {
        const selIdx = threeState.selectedNodeIndex;
        const e = threeState.p * threeState.p * (3 - 2 * threeState.p);
        const t = mat.uniforms.uTime.value;
        const s0 = seed[selIdx];
        const k = 3 * selIdx;
        const w = 0.035 * mat.uniforms.uMotion.value * (0.4 + e * 1.8);
        const px = brain[k] + (scat[k] - brain[k]) * e + w * Math.sin(t * 0.6 + s0 * 40);
        const py = brain[k + 1] + (scat[k + 1] - brain[k + 1]) * e + w * Math.cos(t * 0.5 + s0 * 23);
        const pz = brain[k + 2] + (scat[k + 2] - brain[k + 2]) * e + w * Math.sin(t * 0.4 + s0 * 57);
        markerGroup.position.set(px, py, pz);

        const pulse = 1.0 + 0.18 * Math.sin(t * 4.5);
        markerAura.scale.set(pulse, pulse, pulse);
        markerGroup.visible = true;
      } else {
        markerGroup.visible = false;
      }

      renderer.render(scene, camera);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      markerCoreGeo.dispose();
      markerCoreMat.dispose();
      markerAuraGeo.dispose();
      markerAuraMat.dispose();
    };
  }, [N, CL, nodeData]);

  // Select Node, update ThreeJS state synchronously, adjust camera and beacon color
  const selectNode = useCallback(
    (index: number, peek = false) => {
      setSelectedNodeIndex(index);
      selectedNodeIndexRef.current = index;
      if (!peek) setIsDetailOpen(true);

      const s = threeRef.current;
      if (!s) return;

      s.selectedNodeIndex = index;

      // Update selected particle glow in shader attribute
      if (s.prevSelectedNodeIndex >= 0 && s.prevSelectedNodeIndex < N) {
        s.selected[s.prevSelectedNodeIndex] = 0;
      }
      if (index >= 0 && index < N) {
        s.selected[index] = 1.0;
        s.prevSelectedNodeIndex = index;
      } else {
        s.prevSelectedNodeIndex = -1;
      }
      s.selectedAttr.needsUpdate = true;

      if (index >= 0) {
        const clIdx = CL[index];
        s.markerAuraMat.color.set(CLU[clIdx].c);
        s.markerGroup.visible = true;

        const P = s.SEARCH ? 1 : s.p;
        const e = P * P * (3 - 2 * P);
        const k = 3 * index;
        const x = s.brain[k] + (s.scat[k] - s.brain[k]) * e;
        const z = s.brain[k + 2] + (s.scat[k + 2] - s.brain[k + 2]) * e;

        s.focusA = -Math.atan2(x, z);

        if (onSelectMemory) {
          onSelectMemory({
            id: String(nodeData[index].code),
            agentId: CLU[CL[index]].agentId,
            agentName: CLU[CL[index]].k,
            query: nodeData[index].prompt,
            resultPreview: nodeData[index].response || nodeData[index].prompt,
            timestamp: Date.now(),
            status: "success",
            latencyMs: nodeData[index].latencyMs || 210,
          });
        }
      } else {
        s.markerGroup.visible = false;
        s.focusA = null;
      }
    },
    [nodeData, CL, onSelectMemory, N]
  );

  // Update Hits when search or cluster changes
  useEffect(() => {
    const s = threeRef.current;
    if (!s) return;

    if (searchResults.ids) {
      s.hit.fill(0);
      for (const id of searchResults.ids) {
        s.hit[id] = 1;
      }
      s.fT = 1;
      s.SEARCH = debouncedQuery.trim().length > 0 && searchResults.total > 0;
      s.hitAttr.needsUpdate = true;

      // Auto-select best hit on text search
      if (s.SEARCH && searchResults.items.length > 0) {
        const topId = searchResults.items[0].id;
        if (topId !== selectedNodeIndexRef.current) {
          selectNode(topId, true);
        }
      }
    } else {
      s.hit.fill(1);
      s.fT = 0;
      s.SEARCH = false;
      s.hitAttr.needsUpdate = true;
    }
  }, [searchResults, debouncedQuery, selectNode]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDetailOpen) setIsDetailOpen(false);
        else handleReset();
      } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && searchResults.items.length > 0) {
        e.preventDefault();
        const at = searchResults.items.findIndex((n) => n.id === selectedNodeIndexRef.current);
        const nx = Math.min(
          searchResults.items.length - 1,
          Math.max(0, at + (e.key === "ArrowDown" ? 1 : -1))
        );
        selectNode(searchResults.items[nx].id, true);
      } else if (e.key === "Enter" && selectedNodeIndexRef.current >= 0) {
        setIsDetailOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchResults, isDetailOpen, selectNode]);

  // Zoom helpers
  const handleZoomIn = () => {
    const next = Math.max(0.35, zoomFactorRef.current - 0.25);
    zoomFactorRef.current = next;
    setZoomLevelDisplay(Math.round((1 / next) * 100));
  };

  const handleZoomOut = () => {
    const next = Math.min(6.0, zoomFactorRef.current + 0.35);
    zoomFactorRef.current = next;
    setZoomLevelDisplay(Math.round((1 / next) * 100));
  };

  const handleRandomPrompt = () => {
    let randIdx: number;
    if (searchResults.ids && searchResults.ids.length > 0) {
      randIdx = searchResults.ids[Math.floor(Math.random() * searchResults.ids.length)];
    } else {
      randIdx = Math.floor(Math.random() * N);
    }
    selectNode(randIdx);
  };

  const handleReset = () => {
    setSearchVal("");
    setDebouncedQuery("");
    setActiveCluster(-1);
    setSelectedNodeIndex(-1);
    selectedNodeIndexRef.current = -1;
    setIsDetailOpen(false);
    zoomFactorRef.current = 1.0;
    scrollProgRef.current = 0;
    setZoomLevelDisplay(100);

    const s = threeRef.current;
    if (s) {
      s.SEARCH = false;
      s.fT = 0;
      s.focusA = null;
      s.selectedNodeIndex = -1;
      s.hit.fill(1);
      s.hitAttr.needsUpdate = true;
      if (s.prevSelectedNodeIndex >= 0 && s.prevSelectedNodeIndex < N) {
        s.selected[s.prevSelectedNodeIndex] = 0;
        s.selectedAttr.needsUpdate = true;
      }
      s.prevSelectedNodeIndex = -1;
      s.markerGroup.visible = false;
    }
    if (ringRef.current) {
      ringRef.current.style.visibility = "hidden";
    }
  };

  // Next and Previous navigation for detail drawer
  const handleStepPrompt = (direction: 1 | -1) => {
    if (searchResults.items.length === 0) return;
    const curIdx = searchResults.items.findIndex((item) => item.id === selectedNodeIndex);
    if (curIdx === -1) {
      selectNode(searchResults.items[0].id);
      return;
    }
    const nextIdx = (curIdx + direction + searchResults.items.length) % searchResults.items.length;
    selectNode(searchResults.items[nextIdx].id);
  };

  const selectedNode = selectedNodeIndex >= 0 ? nodeData[selectedNodeIndex] : null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[999999] w-screen h-screen bg-[#06070a] overflow-hidden select-none flex flex-col font-sans ${className}`}
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* 1. Main Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block cursor-grab active:cursor-grabbing z-0"
      />

      {/* 2. Hover Tooltip #tip */}
      <div
        ref={tipRef}
        id="tip"
        className="fixed z-30 pointer-events-none max-w-[340px] bg-[#070911]/95 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-[#eee] flex items-start gap-2 shadow-2xl backdrop-blur-2xl"
        style={{ display: "none" }}
      />

      {/* 3. High-Fidelity 2D Pulse Ring Target Beacon #ring (from user HTML prototype) */}
      <div
        ref={ringRef}
        id="ring"
        className="fixed z-20 pointer-events-none"
        style={{ left: 0, top: 0, width: 0, height: 0, visibility: "hidden" }}
      >
        <span
          className="absolute -left-[16px] -top-[16px] w-[32px] h-[32px] rounded-full border-2 border-[#ff7a59] shadow-[0_0_20px_#ff7a59] animate-ping"
          style={{ animationDuration: "1.4s" }}
        />
        <span
          className="absolute -left-[12px] -top-[12px] w-[24px] h-[24px] rounded-full border border-[#ffb547] shadow-[0_0_12px_#ffb547]"
        />
      </div>

      {/* 5. Top HUD Navigation */}
      <div className="fixed top-3 left-3 right-3 z-30 flex flex-col gap-2.5 pointer-events-none">
        {/* ROW 1: System Title, Search Bar, Quick Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap pointer-events-auto">
          {/* Main Title Badge */}
          <div className="flex items-center gap-2.5 bg-[#090b14]/90 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl font-mono text-xs text-[#e9e6e1] shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a59] shadow-[0_0_14px_#ff7a59]" />
            <b className="text-white tracking-wide">PapayaOS Memory</b>
            <span className="text-[#8b8f9c] text-xs font-normal">
              {N.toLocaleString("de-DE")} Prompts
            </span>
            <span className="flex items-center gap-1.5 text-[#8b8f9c] text-[11px]">
              <i className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
              <span>API {searchMs} ms</span>
            </span>
          </div>

          {/* Search Input Bar */}
          <label className="flex-1 min-w-[240px] max-w-[500px] flex items-center gap-2.5 bg-[#090b14]/90 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl text-xs font-mono text-white focus-within:border-[#ffb547] transition shadow-xl">
            <Search className="w-4 h-4 text-zinc-400 shrink-0 opacity-80" />
            <input
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                  setDebouncedQuery(searchVal);
                }
              }}
              placeholder="Prompt suchen … z. B. E-Mail, Termin, Route"
              className="bg-transparent border-none outline-none w-full text-xs text-white placeholder:text-zinc-500 font-mono"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal("")}
                className="text-zinc-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/15 text-zinc-400 font-mono">
              /
            </kbd>
          </label>

          {/* Random Prompt Button */}
          <button
            type="button"
            onClick={handleRandomPrompt}
            className="flex items-center gap-2 bg-[#090b14]/90 hover:bg-white/10 border border-white/15 hover:border-[#ff7a59] rounded-full px-4 py-2 backdrop-blur-xl text-xs font-mono text-[#e9e6e1] transition cursor-pointer shadow-xl"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#ffb547]" />
            <span>Zufälliger Prompt</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 bg-[#090b14]/90 hover:bg-white/10 border border-white/15 hover:border-[#ff7a59] rounded-full px-4 py-2 backdrop-blur-xl text-xs font-mono text-[#e9e6e1] transition cursor-pointer shadow-xl"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Zurücksetzen</span>
          </button>

          {/* Zoom In & Out Quick Controls */}
          <div className="flex items-center gap-1 bg-[#090b14]/90 border border-white/15 rounded-full p-1 backdrop-blur-xl shadow-xl">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Rauszoomen (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-zinc-300 px-1 select-none font-bold">
              {zoomLevelDisplay}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Reinzoomen (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close Modal Button */}
          {onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="p-2 rounded-full bg-[#090b14]/90 hover:bg-red-500/20 border border-white/15 hover:border-red-500/40 text-zinc-400 hover:text-white transition cursor-pointer ml-auto shadow-xl"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ROW 2: Cluster Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveCluster(-1)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-wider transition cursor-pointer whitespace-nowrap shadow-md ${
              activeCluster === -1
                ? "bg-[#ff7a59]/25 border-[#ff7a59] text-white font-bold"
                : "bg-[#090b14]/85 border-white/10 text-zinc-300 hover:text-white hover:border-white/20"
            }`}
          >
            <span>ALLE</span>
            <small className="text-[10px] text-zinc-400">({N.toLocaleString("de-DE")})</small>
          </button>

          {CLU.map((c, idx) => {
            const isSelected = activeCluster === idx;
            const count = clusterCounts[idx] || 0;
            return (
              <button
                key={c.k}
                type="button"
                onClick={() => setActiveCluster(isSelected ? -1 : idx)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-wider transition cursor-pointer whitespace-nowrap shadow-md ${
                  isSelected
                    ? "border-[#ff7a59] text-white font-bold"
                    : "bg-[#090b14]/85 border-white/10 text-zinc-300 hover:text-white hover:border-white/20"
                }`}
                style={{
                  backgroundColor: isSelected ? "rgba(255,122,89,0.25)" : undefined,
                }}
              >
                <i
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.c, boxShadow: `0 0 6px ${c.c}` }}
                />
                <span>{c.k.toUpperCase()}</span>
                <small className="text-[10px] text-zinc-400">({count.toLocaleString("de-DE")})</small>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. CLEAN LEFT SEARCH RESULTS SIDEBAR */}
      {(debouncedQuery.trim().length > 0 || activeCluster >= 0) && (
        <aside
          id="res"
          className="fixed top-24 left-4 bottom-10 w-[320px] sm:w-[380px] z-30 flex flex-col bg-[#080a12]/92 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in duration-150"
          aria-label="Suchergebnisse"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff7a59]" />
              <span className="text-white text-xs font-mono font-medium">
                {searchResults.total.toLocaleString("de-DE")} {searchResults.total === 1 ? "Treffer" : "Treffer"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer"
              title="Zurücksetzen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-white/20">
            {searchResults.items.length > 0 ? (
              searchResults.items.map((node) => {
                const isSelected = node.id === selectedNodeIndex;
                const clusterObj = CLU[CL[node.id]];

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => selectNode(node.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg transition cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-white/[0.08] border-l-2 border-[#ff7a59] text-white"
                        : "bg-transparent hover:bg-white/[0.04] text-zinc-300"
                    }`}
                  >
                    {/* Title */}
                    <div className="text-[13px] leading-snug font-medium text-zinc-100">
                      {highlightText(node.title, debouncedQuery)}
                    </div>

                    {/* Meta line */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                      <i
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: clusterObj.c }}
                      />
                      <span className="uppercase">{clusterObj.k}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{node.code}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-500">{node.uses}×</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-zinc-500 text-xs text-center font-mono">
                Keine Prompts gefunden.
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 7. CLEAN RIGHT DETAILS INSPECTOR DRAWER */}
      {isDetailOpen && selectedNode && (
        <aside
          id="det"
          className="fixed top-24 right-4 bottom-10 w-[320px] sm:w-[400px] z-30 flex flex-col bg-[#080a12]/95 border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in duration-150"
          aria-label="Prompt-Details"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CLU[CL[selectedNode.id]].c }}
              />
              <span className="font-mono text-xs font-medium text-white uppercase">
                {CLU[CL[selectedNode.id]].k} // {CLU[CL[selectedNode.id]].n}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {searchResults.items.length > 1 && (
                <div className="flex items-center mr-1 bg-white/5 rounded border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleStepPrompt(-1)}
                    className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Vorheriger Treffer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepPrompt(1)}
                    className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Nächster Treffer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer"
                title="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-medium">
                {selectedNode.code}
              </span>
              <h2 className="text-base font-semibold text-white leading-snug mt-1">
                {selectedNode.title}
              </h2>
            </div>

            {/* Real Prompt Code Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span className="uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                  <Terminal className="w-3 h-3" />
                  Echter Prompt / Direktive
                </span>
                <span className="text-[10px] text-zinc-500">{selectedNode.createdAt}</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#04050a] p-3">
                <pre className="font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {selectedNode.prompt}
                </pre>
              </div>
            </div>

            {/* Real Agent Response Block */}
            {selectedNode.response && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                    <MessageSquare className="w-3 h-3" />
                    Agent-Antwort ({CLU[CL[selectedNode.id]].k})
                  </span>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
                  <pre className="font-sans text-xs text-emerald-200 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {selectedNode.response}
                  </pre>
                </div>
              </div>
            )}

            {/* Real Thought (CoT) Block if present */}
            {selectedNode.thought && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    Gedankengang (CoT)
                  </span>
                </div>
                <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-2.5">
                  <p className="font-mono text-[11px] text-purple-200/90 leading-relaxed italic max-h-28 overflow-y-auto">
                    {selectedNode.thought}
                  </p>
                </div>
              </div>
            )}

            {/* Real Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="block text-zinc-500 text-[10px] uppercase">Core</span>
                <span className="text-zinc-200 font-medium">{CLU[CL[selectedNode.id]].k}</span>
              </div>
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="block text-zinc-500 text-[10px] uppercase">Latenz</span>
                <span className="text-emerald-400 font-medium">{selectedNode.latencyMs} ms</span>
              </div>
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="block text-zinc-500 text-[10px] uppercase">Nutzungen</span>
                <span className="text-zinc-200 font-medium">{selectedNode.uses}×</span>
              </div>
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="block text-zinc-500 text-[10px] uppercase">Tokens</span>
                <span className="text-[#ffb547] font-medium">≈ {selectedNode.tokens}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(selectedNode.prompt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#ff7a59] hover:bg-[#ff6b4a] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Kopiert" : "Prompt kopieren"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSelectMemory) {
                    onSelectMemory({
                      id: String(selectedNode.code),
                      agentId: CLU[CL[selectedNode.id]].agentId,
                      agentName: CLU[CL[selectedNode.id]].k,
                      query: selectedNode.prompt,
                      resultPreview: selectedNode.response || selectedNode.prompt,
                      timestamp: Date.now(),
                      status: "success",
                      latencyMs: selectedNode.latencyMs,
                    });
                  }
                }}
                className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>In Chat</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 8. Subtle Footer Note */}
      <div className="fixed bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-mono text-zinc-500 pointer-events-none">
        <span>Mausrad: Zoom · Ziehen: Drehen</span>
      </div>
    </div>
  );
};
