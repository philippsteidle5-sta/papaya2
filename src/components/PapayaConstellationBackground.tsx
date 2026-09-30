import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface PapayaConstellationBackgroundProps {
  className?: string;
  accentColor?: string;
}

export const PapayaConstellationBackground: React.FC<PapayaConstellationBackgroundProps> = ({
  className = "",
  accentColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2500
    );
    camera.position.z = 520;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 1.0); // Pure deep black background
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn("WebGL unsupported for background", e);
      return;
    }

    // Soft round particle texture (pure smooth circle with luminous core)
    const cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 64;
    const ctx = cv.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.25, "rgba(255, 255, 255, 0.85)");
      grad.addColorStop(0.55, "rgba(255, 255, 255, 0.25)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(cv);

    // Strict separation: Keep all background particles OUT of the foreground particle circle
    const isMobile = window.innerWidth < 640;
    const CORE_RADIUS = isMobile ? 175 : 230;
    // Balanced, calm stardust (not exaggerated, perfectly ambient)
    const COUNT = isMobile ? 180 : 320;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const orig = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const phases = new Float32Array(COUNT);

    // Exact user Papaya palette:
    // [0xff6b00 (Papaya Orange), 0xff9e00 (Amber), 0xff3d00 (Deep Coral), 0xffd166 (Sunlight Yellow), 0xffffff (White Star)]
    const paletteHex = [0xff6b00, 0xff9e00, 0xff3d00, 0xffd166, 0xffffff];
    if (accentColor && accentColor.startsWith("#")) {
      try {
        const hex = parseInt(accentColor.replace("#", "0x"), 16);
        if (!isNaN(hex)) paletteHex.push(hex);
      } catch {}
    }
    const colors = paletteHex.map((c) => new THREE.Color(c));

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      let x = (Math.random() - 0.5) * 980;
      let y = (Math.random() - 0.5) * 660;
      const z = (Math.random() - 0.5) * 480;

      // Absolute exclusion from foreground circle:
      const dCenter = Math.hypot(x, y);
      if (dCenter < CORE_RADIUS + 15) {
        const angle = Math.atan2(y, x) || (Math.random() * Math.PI * 2);
        const pushOut = CORE_RADIUS + 25 + Math.random() * 260;
        x = Math.cos(angle) * pushOut;
        y = Math.sin(angle) * pushOut;
      }

      pos[idx] = orig[idx] = x;
      pos[idx + 1] = orig[idx + 1] = y;
      pos[idx + 2] = orig[idx + 2] = z;
      phases[i] = Math.random() * Math.PI * 2;

      const c = colors[Math.floor(Math.random() * colors.length)];
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }

    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 1.4 : 1.9,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(geom, mat);
    scene.add(points);

    // Geometric Constellation Connecting Lines (Delicate & sparse)
    const MAX_LINES = 22;
    const lineGeom = new THREE.BufferGeometry();
    const linePos = new Float32Array(MAX_LINES * 2 * 3);
    const lineCol = new Float32Array(MAX_LINES * 2 * 3);
    lineGeom.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeom.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const constellationLines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(constellationLines);

    // Pre-select anchor stars for constellation line formations
    const ANCHOR_COUNT = Math.min(COUNT, 90);
    const anchorIndices: number[] = [];
    for (let i = 0; i < ANCHOR_COUNT; i++) {
      anchorIndices.push(Math.floor((i / ANCHOR_COUNT) * COUNT));
    }

    // Mouse & Click Interaction
    const mouse = { x: 0, y: 0, active: false, ripple: 0, rx: 0, ry: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = ((e.clientX / window.innerWidth) * 2 - 1) * 450;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1) * 300;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      mouse.rx = ((e.clientX / window.innerWidth) * 2 - 1) * 450;
      mouse.ry = -((e.clientY / window.innerHeight) * 2 - 1) * 300;
      mouse.ripple = 1.0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick, { passive: true });

    let t = 0;
    let animId: number;
    let frameCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.009; // Calm, slow celestial drift
      frameCount++;

      points.rotation.y = t * 0.018;
      points.rotation.x = Math.sin(t * 0.014) * 0.035;
      constellationLines.rotation.y = points.rotation.y;
      constellationLines.rotation.x = points.rotation.x;

      if (mouse.ripple > 0.001) mouse.ripple *= 0.95;

      const pArr = geom.attributes.position.array as Float32Array;
      const cArr = geom.attributes.color.array as Float32Array;

      for (let i = 0; i < COUNT; i++) {
        const idx = i * 3;
        const ox = orig[idx];
        const oy = orig[idx + 1];
        const oz = orig[idx + 2];
        const ph = phases[i];

        // Soft, serene drifting waves
        let tx = ox + Math.sin(t * 0.5 + ph) * 6;
        let ty = oy + Math.cos(t * 0.4 + ph + ox * 0.003) * 8;
        let tz = oz + Math.sin(t * 0.3 + oy * 0.003) * 6;

        if (mouse.active) {
          const dx = tx - mouse.x;
          const dy = ty - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140 && d2 > 1) {
            const dist = Math.sqrt(d2);
            const f = (1 - dist / 140) * 16;
            tx += (dx / dist) * f;
            ty += (dy / dist) * f;
          }
        }

        if (mouse.ripple > 0.01) {
          const rdx = tx - mouse.rx;
          const rdy = ty - mouse.ry;
          const rd = Math.sqrt(rdx * rdx + rdy * rdy);
          const rRad = (1 - mouse.ripple) * 280;
          const diff = Math.abs(rd - rRad);
          if (diff < 35) {
            const f = (1 - diff / 35) * mouse.ripple * 20;
            tx += (rdx / (rd || 1)) * f;
            ty += (rdy / (rd || 1)) * f;
            tz += f * 1.0;
          }
        }

        // ABSOLUTE FORCE FIELD: Keep all background particles OUT of the foreground particle circle!
        const curDist = Math.hypot(tx, ty);
        if (curDist < CORE_RADIUS) {
          const angle = Math.atan2(ty, tx) || ph;
          tx = Math.cos(angle) * CORE_RADIUS;
          ty = Math.sin(angle) * CORE_RADIUS;
        }

        pArr[idx] += (tx - pArr[idx]) * 0.08;
        pArr[idx + 1] += (ty - pArr[idx + 1]) * 0.08;
        pArr[idx + 2] += (tz - pArr[idx + 2]) * 0.08;
      }
      geom.attributes.position.needsUpdate = true;

      // Update Constellation Lines dynamically between nearby anchor stars
      if (frameCount % 2 === 0) {
        let lineIdx = 0;
        const maxDist = 100;
        const maxDistSq = maxDist * maxDist;

        for (let a = 0; a < anchorIndices.length && lineIdx < MAX_LINES; a++) {
          const idxA = anchorIndices[a] * 3;
          const ax = pArr[idxA];
          const ay = pArr[idxA + 1];
          const az = pArr[idxA + 2];

          // Never connect stars inside or bordering the foreground circle
          if (Math.hypot(ax, ay) < CORE_RADIUS + 5) continue;

          for (let b = a + 1; b < anchorIndices.length && lineIdx < MAX_LINES; b++) {
            const idxB = anchorIndices[b] * 3;
            const bx = pArr[idxB];
            const by = pArr[idxB + 1];
            const bz = pArr[idxB + 2];

            if (Math.hypot(bx, by) < CORE_RADIUS + 5) continue;

            const dx = ax - bx;
            const dy = ay - by;
            const dz = az - bz;
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < maxDistSq) {
              // Ensure segment does not cut across the central circle
              const segLenSq = dx * dx + dy * dy;
              if (segLenSq > 0) {
                const proj = Math.max(0, Math.min(1, -(ax * -dx + ay * -dy) / segLenSq));
                const closeX = ax + proj * -dx;
                const closeY = ay + proj * -dy;
                if (Math.hypot(closeX, closeY) < CORE_RADIUS) continue;
              }
              const base = lineIdx * 6;
              linePos[base] = ax;
              linePos[base + 1] = ay;
              linePos[base + 2] = az;
              lineCol[base] = cArr[idxA];
              lineCol[base + 1] = cArr[idxA + 1];
              lineCol[base + 2] = cArr[idxA + 2];

              linePos[base + 3] = bx;
              linePos[base + 4] = by;
              linePos[base + 5] = bz;
              lineCol[base + 3] = cArr[idxB];
              lineCol[base + 4] = cArr[idxB + 1];
              lineCol[base + 5] = cArr[idxB + 2];

              lineIdx++;
            }
          }
        }

        for (let l = lineIdx * 6; l < MAX_LINES * 6; l++) {
          linePos[l] = 0;
          lineCol[l] = 0;
        }

        lineGeom.attributes.position.needsUpdate = true;
        lineGeom.attributes.color.needsUpdate = true;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);

      scene.clear();
      geom.dispose();
      mat.dispose();
      lineGeom.dispose();
      lineMat.dispose();
      texture.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [accentColor]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black ${className}`}
      style={{ zIndex: 0, backgroundColor: "#000000" }}
      aria-hidden="true"
    />
  );
};
