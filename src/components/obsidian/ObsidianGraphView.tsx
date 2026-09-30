import React, { useRef, useEffect, useState } from "react";
import { ObsidianNote } from "../../utils/obsidianStore";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Filter, Eye, Sparkles } from "lucide-react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  linksCount: number;
  isBase?: boolean;
}

interface Link {
  source: string;
  target: string;
}

interface ObsidianGraphViewProps {
  notes: ObsidianNote[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
}

export const ObsidianGraphView: React.FC<ObsidianGraphViewProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const draggingNodeRef = useRef<Node | null>(null);
  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize nodes and links
  useEffect(() => {
    const width = 800;
    const height = 600;

    const newNodes: Node[] = notes.map((note, index) => {
      const angle = (index / Math.max(1, notes.length)) * Math.PI * 2;
      const radiusDist = 140 + Math.random() * 80;
      const linksCount = (note.links?.length || 0) + (note.backlinks?.length || 0);
      const isBase = note.type === "base";

      let color = "#8b5cf6"; // Purple default for Obsidian
      if (isBase) color = "#06b6d4"; // Cyan for bases/databases
      else if (note.name.toLowerCase().includes("gmail")) color = "#ef4444";
      else if (note.name.toLowerCase().includes("social")) color = "#ec4899";
      else if (note.name.toLowerCase().includes("kalender") || note.name.toLowerCase().includes("wochen")) color = "#f59e0b";

      return {
        id: note.id,
        label: note.title,
        x: width / 2 + Math.cos(angle) * radiusDist,
        y: height / 2 + Math.sin(angle) * radiusDist,
        vx: 0,
        vy: 0,
        radius: Math.max(7, Math.min(18, 8 + linksCount * 2.5)),
        color,
        linksCount,
        isBase,
      };
    });

    const newLinks: Link[] = [];
    notes.forEach((note) => {
      note.links.forEach((targetTitle) => {
        const target = notes.find(
          (n) => n.title.toLowerCase() === targetTitle.toLowerCase() || n.name.toLowerCase().startsWith(targetTitle.toLowerCase())
        );
        if (target && target.id !== note.id) {
          newLinks.push({ source: note.id, target: target.id });
        }
      });
    });

    nodesRef.current = newNodes;
    linksRef.current = newLinks;
  }, [notes]);

  // Simulation loop
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 260) {
            const force = (260 - dist) / dist * 0.04;
            nodes[i].vx -= dx * force;
            nodes[i].vy -= dy * force;
            nodes[j].vx += dx * force;
            nodes[j].vy += dy * force;
          }
        }
      }

      // Spring attraction along links
      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 110;
          const force = (dist - targetDist) * 0.008;
          sourceNode.vx += dx * force;
          sourceNode.vy += dy * force;
          targetNode.vx -= dx * force;
          targetNode.vy -= dy * force;
        }
      });

      // Center gravity & velocity dampening
      const canvas = canvasRef.current;
      const centerX = canvas ? canvas.width / 2 : 400;
      const centerY = canvas ? canvas.height / 2 : 300;

      nodes.forEach((node) => {
        if (node !== draggingNodeRef.current) {
          node.vx += (centerX - node.x) * 0.001;
          node.vy += (centerY - node.y) * 0.001;
          node.vx *= 0.88;
          node.vy *= 0.88;
          node.x += node.vx;
          node.y += node.vy;
        }
      });

      // Render
      draw();
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [zoom, pan, activeNoteId, searchQuery]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    const nodes = nodesRef.current;
    const links = linksRef.current;

    // Draw Links
    ctx.lineWidth = 1;
    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source);
      const target = nodes.find((n) => n.id === link.target);
      if (source && target) {
        const isHighlighted =
          source.id === activeNoteId ||
          target.id === activeNoteId ||
          (hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id));

        ctx.strokeStyle = isHighlighted ? "rgba(168, 85, 247, 0.7)" : "rgba(100, 116, 139, 0.25)";
        ctx.lineWidth = isHighlighted ? 2 : 1;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // Draw Nodes
    nodes.forEach((node) => {
      const isActive = node.id === activeNoteId;
      const isHovered = hoveredNode?.id === node.id;
      const matchesSearch = searchQuery
        ? node.label.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Glow halo for active / hovered
      if (isActive || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "rgba(168, 85, 247, 0.35)" : "rgba(255, 255, 255, 0.15)";
        ctx.fill();
      }

      // Main node body
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = matchesSearch ? node.color : "rgba(100, 116, 139, 0.3)";
      ctx.fill();

      // Border ring
      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.strokeStyle = isActive ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
      ctx.stroke();

      // Node Label
      ctx.font = `${isActive || isHovered ? "bold 12px" : "11px"} Inter, sans-serif`;
      ctx.fillStyle = isActive ? "#f8fafc" : matchesSearch ? "#cbd5e1" : "#64748b";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + node.radius + 14);
    });

    ctx.restore();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Inverse transform
    const originX = canvas.width / 2 + pan.x;
    const originY = canvas.height / 2 + pan.y;
    const x = (mouseX - originX) / zoom + canvas.width / 2;
    const y = (mouseY - originY) / zoom + canvas.height / 2;

    return { x, y, rawX: mouseX, rawY: mouseY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const clickedNode = nodesRef.current.find((node) => {
      const dist = Math.hypot(node.x - coords.x, node.y - coords.y);
      return dist <= node.radius + 5;
    });

    if (clickedNode) {
      draggingNodeRef.current = clickedNode;
      onSelectNote(clickedNode.id);
    } else {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (draggingNodeRef.current) {
      draggingNodeRef.current.x = coords.x;
      draggingNodeRef.current.y = coords.y;
      draggingNodeRef.current.vx = 0;
      draggingNodeRef.current.vy = 0;
      return;
    }

    if (isPanningRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover detection
    const hovered = nodesRef.current.find((node) => {
      const dist = Math.hypot(node.x - coords.x, node.y - coords.y);
      return dist <= node.radius + 5;
    });
    setHoveredNode(hovered || null);
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
    isPanningRef.current = false;
  };

  return (
    <div className="relative w-full h-full bg-[#111113] overflow-hidden flex flex-col select-none">
      {/* Top Graph Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#18181b]/90 backdrop-blur border border-[#27272a] px-3 py-1.5 rounded-lg shadow-lg">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium text-slate-200">Obsidian Graph View</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
            {notes.length} Notizen • {linksRef.current.length} Links
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#18181b]/90 backdrop-blur border border-[#27272a] p-1 rounded-lg shadow-lg">
          <input
            type="text"
            placeholder="Knoten filtern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#27272a] text-xs text-slate-200 placeholder-slate-500 px-2 py-1 rounded outline-none w-32 focus:w-44 transition-all"
          />
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#27272a] rounded transition"
            title="Vergrößern"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#27272a] rounded transition"
            title="Verkleinern"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#27272a] rounded transition"
            title="Zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-3 bg-[#18181b]/80 backdrop-blur border border-[#27272a] px-3 py-1.5 rounded-lg text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Notizen
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Datensätze (.base)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Gmail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" /> Social
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Kalender
        </span>
      </div>
    </div>
  );
};
