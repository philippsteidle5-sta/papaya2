import React, { useState, useRef, useEffect, ReactNode } from "react";
import { Maximize2, Minimize2, X, GripVertical } from "lucide-react";
import { useTheme } from "../utils/themeStore";

interface DraggableResizableWidgetProps {
  id: string;
  title: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number | string;
  initialHeight?: number | string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  isEditMode?: boolean;
  onClose?: () => void;
  children: ReactNode;
  headerControls?: ReactNode;
  className?: string;
  zIndex?: number;
  onFocus?: () => void;
}

export const DraggableResizableWidget: React.FC<DraggableResizableWidgetProps> = ({
  id,
  title,
  initialX = 80,
  initialY = 130,
  initialWidth = 480,
  initialHeight = 520,
  minWidth = 300,
  minHeight = 200,
  maxWidth = 1400,
  maxHeight = 900,
  isEditMode = false,
  onClose,
  children,
  headerControls,
  className = "",
  zIndex = 30,
  onFocus,
}) => {
  // Top boundary limit so widgets never overlap or get stuck under the top HUD navigation bar
  const minY = 115;

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: typeof window !== "undefined" ? Math.max(20, Math.min(initialX, window.innerWidth - 350)) : Math.max(20, initialX),
    y: Math.max(minY, initialY),
  });

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: typeof initialWidth === "number" ? initialWidth : 480,
    height: typeof initialHeight === "number" ? initialHeight : 520,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const prevSizeAndPos = useRef<{ x: number; y: number; width: number; height: number }>({
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  });

  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: position.x,
    posY: position.y,
  });

  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    posX: position.x,
    posY: position.y,
  });

  // Handle Dragging - Clean, instant, and frictionless
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMaximized) return;
    if (onFocus) onFocus();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };

    setIsDragging(true);
  };

  // Handle Resizing - Smooth and precise
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, direction: string) => {
    e.stopPropagation();
    if (isMaximized) return;
    if (onFocus) onFocus();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    resizeStartRef.current = {
      x: clientX,
      y: clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    };

    setResizeDirection(direction);
    setIsResizing(true);
  };

  // Toggle Maximize
  const toggleMaximize = () => {
    if (!isMaximized) {
      prevSizeAndPos.current = { x: position.x, y: position.y, width: size.width, height: size.height };
      setPosition({ x: 20, y: minY });
      setSize({
        width: Math.max(320, window.innerWidth - 40),
        height: Math.max(240, window.innerHeight - 120),
      });
      setIsMaximized(true);
    } else {
      setPosition({ x: prevSizeAndPos.current.x, y: Math.max(minY, prevSizeAndPos.current.y) });
      setSize({ width: prevSizeAndPos.current.width, height: prevSizeAndPos.current.height });
      setIsMaximized(false);
    }
  };

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (isDragging) {
          const dx = clientX - dragStartRef.current.x;
          const dy = clientY - dragStartRef.current.y;

          const newX = Math.max(76, Math.min(window.innerWidth - 100, dragStartRef.current.posX + dx));
          const newY = Math.max(minY, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));

          setPosition({ x: newX, y: newY });
        } else if (isResizing && resizeDirection) {
          const dx = clientX - resizeStartRef.current.x;
          const dy = clientY - resizeStartRef.current.y;

          let newW = resizeStartRef.current.width;
          let newH = resizeStartRef.current.height;
          let newX = resizeStartRef.current.posX;
          let newY = resizeStartRef.current.posY;

          if (resizeDirection.includes("r")) {
            newW = Math.max(minWidth, Math.min(maxWidth, resizeStartRef.current.width + dx));
          }
          if (resizeDirection.includes("b")) {
            newH = Math.max(minHeight, Math.min(maxHeight, resizeStartRef.current.height + dy));
          }
          if (resizeDirection.includes("l")) {
            const possibleW = resizeStartRef.current.width - dx;
            if (possibleW >= minWidth && possibleW <= maxWidth) {
              newW = possibleW;
              newX = resizeStartRef.current.posX + dx;
            }
          }
          if (resizeDirection.includes("t")) {
            const possibleH = resizeStartRef.current.height - dy;
            if (possibleH >= minHeight && possibleH <= maxHeight) {
              newH = possibleH;
              newY = Math.max(minY, resizeStartRef.current.posY + dy);
            }
          }

          setSize({ width: newW, height: newH });
          setPosition({ x: newX, y: newY });
        }
      });
    };

    const handleMouseUp = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove, { passive: true });
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDirection, minWidth, minHeight, maxWidth, maxHeight]);

  const { isModern } = useTheme();

  return (
    <div
      onMouseDown={onFocus}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: isDragging || isResizing ? zIndex + 20 : zIndex,
        willChange: isDragging || isResizing ? "left, top, width, height" : "auto",
      }}
      className={`group border rounded-3xl backdrop-blur-2xl flex flex-col overflow-hidden ${
        isDragging || isResizing
          ? "transition-none select-none shadow-[0_24px_70px_rgba(0,0,0,0.9)]"
          : "transition-[border-color,box-shadow,background-color] duration-150"
      } ${
        isModern
          ? `bg-[#121216]/95 ${
              isEditMode
                ? "border-purple-500/70 ring-2 ring-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.25)]"
                : "border-zinc-800 hover:border-zinc-700/90 shadow-[0_16px_50px_rgba(0,0,0,0.85)]"
            } text-zinc-100`
          : `bg-[#05080d]/95 ${
              isEditMode
                ? "border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.5)]"
                : "border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            } text-slate-100`
      } ${className}`}
    >
      {/* Invisible overlay during drag/resize to prevent iframe mouse stealing */}
      {(isDragging || isResizing) && <div className="fixed inset-0 z-[9999] bg-transparent cursor-grabbing" />}

      {/* Spatial Drag Header */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`select-none px-3.5 py-2.5 border-b flex items-center justify-between gap-2 text-xs font-mono transition-colors cursor-grab active:cursor-grabbing ${
          isModern
            ? isEditMode
              ? "bg-purple-950/40 border-purple-500/30 text-purple-200"
              : "bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:bg-zinc-800/80"
            : isEditMode
            ? "bg-cyan-950/70 border-cyan-500/30 text-cyan-200"
            : "bg-slate-950/80 border-cyan-500/30 text-cyan-200 hover:bg-slate-900/80"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {isEditMode && (
            <GripVertical className={`w-4 h-4 opacity-80 flex-shrink-0 animate-pulse ${isModern ? "text-purple-400" : "text-cyan-400"}`} />
          )}
          <span className={`font-bold tracking-wider uppercase truncate text-[11px] ${isModern ? "text-zinc-200" : "text-cyan-300"}`}>
            {title}
          </span>
          {isEditMode && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse flex-shrink-0 border ${
              isModern
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-cyan-400/20 text-cyan-300 border-cyan-400/50"
            }`}>
              [VERSCHIEBBAR]
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          {headerControls}

          <button
            onClick={toggleMaximize}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isModern
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            }`}
            title={isMaximized ? "Wiederherstellen" : "Maximieren"}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition cursor-pointer border ${
                isModern
                  ? "bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border-red-500/40"
                  : "bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white border-red-500/30"
              }`}
              title="Schließen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Content Area */}
      <div className={`relative flex-1 w-full h-full overflow-auto flex flex-col ${isModern ? "text-zinc-100" : "text-slate-100"}`}>
        {children}
      </div>

      {/* Resize Handles - ONLY RENDERED AND ACTIVE IN EDIT MODE! */}
      {isEditMode && !isMaximized && (
        <>
          {/* Bottom-Right Corner Handle */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "rb")}
            onTouchStart={(e) => handleResizeStart(e, "rb")}
            className={`absolute right-0 bottom-0 w-6 h-6 z-40 cursor-se-resize flex items-center justify-center hover:scale-125 transition ${
              isModern ? "text-purple-400" : "text-cyan-400"
            }`}
            title="Größe anpassen (Edit-Modus aktiv)"
          >
            <svg className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-cyan-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15L15 21M21 8L8 21" />
            </svg>
          </div>

          {/* Right Edge */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "r")}
            onTouchStart={(e) => handleResizeStart(e, "r")}
            className={`absolute right-0 top-6 bottom-6 w-2.5 z-30 cursor-e-resize transition ${
              isModern ? "hover:bg-purple-500/40" : "hover:bg-cyan-400/40"
            }`}
          />

          {/* Bottom Edge */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "b")}
            onTouchStart={(e) => handleResizeStart(e, "b")}
            className={`absolute bottom-0 left-6 right-6 h-2.5 z-30 cursor-s-resize transition ${
              isModern ? "hover:bg-purple-500/40" : "hover:bg-cyan-400/40"
            }`}
          />

          {/* Bottom-Left Corner */}
          <div
            onMouseDown={(e) => handleResizeStart(e, "lb")}
            onTouchStart={(e) => handleResizeStart(e, "lb")}
            className={`absolute left-0 bottom-0 w-5 h-5 z-40 cursor-sw-resize transition rounded-bl-3xl ${
              isModern ? "hover:bg-purple-500/50" : "hover:bg-cyan-400/50"
            }`}
          />
        </>
      )}
    </div>
  );
};
