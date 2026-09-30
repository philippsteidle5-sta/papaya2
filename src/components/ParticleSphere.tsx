import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { AllowedShape } from "./MazeCoreCustomizer";
import { useTheme } from "../utils/themeStore";

export interface ParticleSphereProps {
  state: "idle" | "listening" | "thinking" | "speaking" | "";
  micLevel: number;
  speakingLevel: number;
  agentColor: string; // e.g., '#4ee8ff' or '#39ff8a'
  shape: "sphere" | "torus-knot" | "gyroscope" | "fusion" | "network" | "hourglass" | "chart";
  currentAgentId: string;
  isActive?: boolean;
  // M.A.Z.E. CORE STYLING OVERRIDES
  customShape?: AllowedShape;
  customColor?: string;
  particleDensity?: number;
  particleSpeed?: number;
  audioSensitivity?: number;
}

export const ParticleSphere = React.memo<ParticleSphereProps>(({
  state,
  micLevel,
  speakingLevel,
  agentColor,
  shape,
  currentAgentId,
  isActive = true,
  customShape,
  customColor,
  particleDensity,
  particleSpeed,
  audioSensitivity,
}) => {
  const { isModern } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep latest props in refs for the animation loop to avoid re-initializing
  const isModernRef = useRef(isModern);
  const stateRef = useRef(state);
  const micLevelRef = useRef(micLevel);
  const speakingLevelRef = useRef(speakingLevel);
  const agentColorRef = useRef(agentColor);
  const shapeRef = useRef(shape);
  const currentAgentIdRef = useRef(currentAgentId);
  const prevAgentIdRef = useRef(currentAgentId);
  const isActiveRef = useRef(isActive);
  const customShapeRef = useRef(customShape);
  const customColorRef = useRef(customColor);
  const particleSpeedRef = useRef(particleSpeed);
  const audioSensitivityRef = useRef(audioSensitivity);
  const switchEventRef = useRef<{ timestamp: number; from: string; to: string } | null>(null);

  useEffect(() => {
    isModernRef.current = isModern;
  }, [isModern]);

  useEffect(() => {
    customShapeRef.current = customShape;
  }, [customShape]);

  useEffect(() => {
    customColorRef.current = customColor;
  }, [customColor]);

  useEffect(() => {
    particleSpeedRef.current = particleSpeed;
  }, [particleSpeed]);

  useEffect(() => {
    audioSensitivityRef.current = audioSensitivity;
  }, [audioSensitivity]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

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
    agentColorRef.current = agentColor;
  }, [agentColor]);

  useEffect(() => {
    shapeRef.current = shape;
  }, [shape]);

  useEffect(() => {
    if (prevAgentIdRef.current !== currentAgentId) {
      switchEventRef.current = {
        timestamp: Date.now(),
        from: prevAgentIdRef.current,
        to: currentAgentId,
      };
      prevAgentIdRef.current = currentAgentId;
    }
    currentAgentIdRef.current = currentAgentId;
  }, [currentAgentId]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // --- Three.js Setup ---
    const initW = Math.max(1, container.clientWidth || 300);
    const initH = Math.max(1, container.clientHeight || 300);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      initW / initH,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.4);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(initW, initH);
    } catch (err) {
      console.warn("WebGL creation failed, fallback to 2D representation", err);
    }


    // --- Generators ---
    function fibonacciDirs(count: number): THREE.Vector3[] {
      const dirs: THREE.Vector3[] = [];
      const offset = 2 / count;
      const increment = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = i * offset - 1 + offset / 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const phi = (i % count) * increment;
        dirs.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r));
      }
      return dirs;
    }

    // --- Main Core Sphere ---
    const isSmall = window.innerWidth < 640;
    const MAIN_COUNT = isSmall ? 1500 : 2600;
    const mainDirs = fibonacciDirs(MAIN_COUNT);
    const mainRadius = 1.35;

    // --- Shape generators ---
    function getTorusKnotPos(i: number, count: number): THREE.Vector3 {
      const p = 2;
      const q = 3;
      const phi = (i / count) * Math.PI * 2 * q;
      const r = 0.95 + 0.3 * Math.cos(p * phi);
      const x = r * Math.cos(phi);
      const y = r * Math.sin(phi);
      const z = 0.4 * Math.sin(p * phi);
      
      const tubeAngle = i * 2.399963;
      const rTube = 0.16 + 0.04 * Math.sin(i * 0.1);
      const dx = Math.cos(tubeAngle) * rTube;
      const dy = Math.sin(tubeAngle) * rTube;
      
      return new THREE.Vector3(x + dx, y + dy, z);
    }

    function getGyroscopePos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const group = i % 5;
      
      if (group === 0) {
        // Group 1: Central Nucleus (Dense core of particles)
        const idx = Math.floor(i / 5);
        const subCount = Math.floor(count / 5);
        const offset = 2 / subCount;
        const increment = Math.PI * (3 - Math.sqrt(5));
        const y = idx * offset - 1 + offset / 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const phi = idx * increment + t * 1.5;
        const coreR = (0.24 + Math.sin(t * 2.2 + i * 0.1) * 0.02) * scale;
        return new THREE.Vector3(
          Math.cos(phi) * r * coreR,
          y * coreR,
          Math.sin(phi) * r * coreR
        );
      }
      
      if (group === 1) {
        // Group 2: Concentric Equatorial Rings (Multiple rings spinning around Z-axis)
        const phi = (i / (count / 5)) * Math.PI * 2 + t * 0.95;
        const rRing = (1.22 + (i % 3) * 0.08) * scale; // Three distinct equatorial concentric tracks!
        const dx = Math.sin(i * 3.5) * 0.012 * scale;
        const dy = Math.cos(i * 3.5) * 0.012 * scale;
        const dz = Math.cos(phi * 4.0) * 0.02 * scale; // slight wavy ripple
        return new THREE.Vector3(
          Math.cos(phi) * rRing + dx,
          Math.sin(phi) * rRing + dy,
          dz
        );
      }
      
      if (group === 2) {
        // Group 3: Polar Longitudinal Ring (XZ plane, rotating around Y-axis)
        const phi = (i / (count / 5)) * Math.PI * 2 - t * 0.85;
        const rRing = 1.15 * scale;
        const dx = Math.cos(i * 4.0) * 0.01 * scale;
        const dy = Math.sin(phi * 3.0) * 0.03 * scale; // elegant wavy oscillation
        const dz = Math.sin(i * 4.0) * 0.01 * scale;
        return new THREE.Vector3(
          Math.cos(phi) * rRing + dx,
          dy,
          Math.sin(phi) * rRing + dz
        );
      }
      
      if (group === 3) {
        // Group 4: Tilted Orbital Ring A (45 degree inclination, fast forward spin)
        const phi = (i / (count / 5)) * Math.PI * 2 + t * 1.4;
        const rRing = 1.3 * scale;
        const rx = Math.cos(phi) * rRing;
        const ry = Math.sin(phi) * rRing;
        // Rotate around X-axis by 45 degrees
        const angle = Math.PI / 4;
        const yNew = ry * Math.cos(angle);
        const zNew = ry * Math.sin(angle);
        return new THREE.Vector3(rx, yNew, zNew);
      }
      
      // Group 5: Tilted Orbital Ring B (-45 degree inclination, reverse spin)
      const phi = (i / (count / 5)) * Math.PI * 2 - t * 1.2;
      const rRing = 0.95 * scale;
      const rx = Math.cos(phi) * rRing;
      const ry = Math.sin(phi) * rRing;
      // Rotate around X-axis by -45 degrees
      const angle = -Math.PI / 4;
      const yNew = ry * Math.cos(angle);
      const zNew = ry * Math.sin(angle);
      return new THREE.Vector3(rx, yNew, zNew);
    }

    function getNetworkPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      // 3D Double-Helix Viral Network with cross-rungs and outer orbital trend nodes
      const sub = i % 4;
      if (sub === 0 || sub === 1) {
        // Intertwined helical strands
        const strandIdx = sub;
        const normIdx = i / count;
        const height = (normIdx - 0.5) * 2.4 * scale;
        const turns = 3.5;
        const phase = (normIdx * Math.PI * 2 * turns) + (strandIdx === 1 ? Math.PI : 0) + t * 1.6;
        const radius = (0.65 + Math.sin(t * 2.5 + height * 3) * 0.04) * scale;
        return new THREE.Vector3(
          Math.cos(phase) * radius,
          height,
          Math.sin(phase) * radius
        );
      } else if (sub === 2) {
        // Cross-connecting bridge rungs
        const normIdx = i / count;
        const height = (normIdx - 0.5) * 2.4 * scale;
        const turns = 3.5;
        const phase0 = (normIdx * Math.PI * 2 * turns) + t * 1.6;
        const radius = 0.65 * scale;
        const p0 = new THREE.Vector3(Math.cos(phase0) * radius, height, Math.sin(phase0) * radius);
        const p1 = new THREE.Vector3(Math.cos(phase0 + Math.PI) * radius, height, Math.sin(phase0 + Math.PI) * radius);
        const lerpFactor = ((i % 8) / 7.0);
        return new THREE.Vector3().lerpVectors(p0, p1, lerpFactor);
      } else {
        // Outer Orbiting Trend Nodes
        const phi = (i / (count / 4)) * Math.PI * 2 + t * 2.2;
        const ringR = (1.22 + Math.sin(t * 3.2 + i * 0.1) * 0.08) * scale;
        const tilt = Math.PI / 3.5;
        const rx = Math.cos(phi) * ringR;
        const ry = Math.sin(phi) * ringR;
        return new THREE.Vector3(
          rx,
          ry * Math.cos(tilt),
          ry * Math.sin(tilt) + Math.cos(i * 0.3 + t * 1.5) * 0.1
        );
      }
    }

    function getHourglassPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      // 3D Double Conical Hourglass (C.H.R.O.N.O.S. Time Engine)
      const group = i % 10;
      if (group < 4) {
        // Top Bulb
        const normY = ((i % 250) / 250);
        const y = (0.05 + normY * 1.05) * scale;
        const radius = (Math.sin(normY * Math.PI * 0.85) * 0.72 + 0.08) * scale;
        const phi = i * 2.39996 + t * 0.8;
        return new THREE.Vector3(Math.cos(phi) * radius, y, Math.sin(phi) * radius);
      } else if (group < 8) {
        // Bottom Bulb
        const normY = ((i % 250) / 250);
        const y = (-0.05 - normY * 1.05) * scale;
        const radius = (Math.sin(normY * Math.PI * 0.85) * 0.72 + 0.08) * scale;
        const phi = i * 2.39996 - t * 0.8;
        return new THREE.Vector3(Math.cos(phi) * radius, y, Math.sin(phi) * radius);
      } else if (group === 8) {
        // Chrono Dial Equatorial Ring
        const phi = (i / (count * 0.1)) * Math.PI * 2 + t * 2.4;
        const ringR = 0.95 * scale;
        return new THREE.Vector3(Math.cos(phi) * ringR, Math.sin(phi * 3 + t * 2) * 0.05 * scale, Math.sin(phi) * ringR);
      } else {
        // Falling Particles Stream through center neck
        const sandY = (((i * 0.11 + t * 2.5) % 2.2) - 1.1) * scale;
        const neckRadius = (Math.abs(sandY) * 0.28 + 0.04) * scale;
        const phi = i * 1.5 + t * 4.0;
        return new THREE.Vector3(Math.cos(phi) * neckRadius, sandY, Math.sin(phi) * neckRadius);
      }
    }

    function getChartPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      // 3D Candlestick & Fibonacci Market Wave Lattice (O.R.A.C.L.E.)
      const group = i % 4;
      if (group === 0) {
        // Candlestick Columns
        const columnIdx = Math.floor((i % 120) / 24); // 5 Candlestick columns
        const colX = (-1.1 + columnIdx * 0.55) * scale;
        const colHeights = [0.4, 0.85, 0.5, 1.1, 1.45]; // Bullish progression
        const baseH = colHeights[columnIdx] * scale;
        const normY = ((i % 24) / 24) - 0.5;
        const y = normY * baseH + Math.sin(t * 2.0 + columnIdx) * 0.04 * scale;
        const rCandle = 0.12 * scale;
        const phi = i * 1.8;
        return new THREE.Vector3(colX + Math.cos(phi) * rCandle, y, Math.sin(phi) * rCandle);
      } else if (group === 1) {
        // Exponential Fibonacci Trend Wave
        const normX = ((i / count) * 2.0 - 1.0) * 1.25;
        const x = normX * scale;
        const y = (0.28 * Math.exp(normX * 0.85) * Math.sin(normX * 2.5 + t * 2.2) - 0.25) * scale;
        const z = (Math.sin(normX * 3.0 + t * 1.8) * 0.35) * scale;
        return new THREE.Vector3(x, y, z);
      } else if (group === 2) {
        // Golden Ratio Fibonacci Spiral Orbit
        const idx = i / count;
        const phi = idx * Math.PI * 10 + t * 1.8;
        const spiralR = (0.15 + idx * 1.1) * scale;
        return new THREE.Vector3(
          Math.cos(phi) * spiralR,
          Math.sin(phi) * spiralR * 0.6 + (idx - 0.5) * 0.8 * scale,
          Math.sin(phi) * 0.3 * scale
        );
      } else {
        // Floating Support / Resistance Grid Lines
        const levelIdx = i % 3;
        const levelY = (-0.6 + levelIdx * 0.65) * scale;
        const gridX = (((i % 100) / 100) * 2.4 - 1.2) * scale;
        const z = (Math.sin(gridX * 4 + t * 2.0) * 0.15) * scale;
        return new THREE.Vector3(gridX, levelY, z);
      }
    }

    function getFusionPos(i: number, count: number, t: number, scale: number, smoothedSpeakVal: number = 0): THREE.Vector3 {
      const group = i % 5;
      
      if (group === 0) {
        // 1. Central Core Nucleus (Inner Energy Ball)
        const idx = Math.floor(i / 5);
        const subCount = Math.floor(count / 5);
        const offset = 2 / subCount;
        const increment = Math.PI * (3 - Math.sqrt(5));
        const y = idx * offset - 1 + offset / 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const phi = idx * increment + t * 0.8;
        const coreR = (0.45 + Math.sin(t * 2.0 + i * 0.1) * 0.03 + smoothedSpeakVal * 0.15) * scale;
        return new THREE.Vector3(
          Math.cos(phi) * r * coreR,
          y * coreR,
          Math.sin(phi) * r * coreR
        );
      } else if (group === 1 || group === 2) {
        // 2. Latitude & Longitude Holographic Globe Surface Shell
        const idx = Math.floor(i / 2.5);
        const subCount = Math.floor(count / 2.5);
        const offset = 2 / subCount;
        const increment = Math.PI * (3 - Math.sqrt(5));
        const y = idx * offset - 1 + offset / 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        
        // Smooth rotation & subtle spherical wave pulse
        const phi = idx * increment + t * 0.5;
        const globeRadius = (1.18 + Math.sin(y * 6.0 + t * 2.5) * 0.04 + smoothedSpeakVal * 0.12) * scale;
        
        return new THREE.Vector3(
          Math.cos(phi) * r * globeRadius,
          y * globeRadius,
          Math.sin(phi) * r * globeRadius
        );
      } else if (group === 3) {
        // 3. Equatorial Orbital Search Ring (Smooth horizontal spin)
        const phi = (i / (count / 5)) * Math.PI * 2 + t * 1.2;
        const ringR = (1.35 + Math.sin(phi * 4.0 + t * 2.0) * 0.03 + smoothedSpeakVal * 0.18) * scale;
        const rx = Math.cos(phi) * ringR;
        const ry = Math.sin(phi * 2.0) * 0.04 * scale;
        const rz = Math.sin(phi) * ringR;
        return new THREE.Vector3(rx, ry, rz);
      } else {
        // 4. Inclined Orbital Search Ring (Tilted 45deg, smooth counter spin)
        const phi = (i / (count / 5)) * Math.PI * 2 - t * 1.0;
        const ringR = (1.28 + Math.cos(phi * 3.0 + t * 1.5) * 0.03 + smoothedSpeakVal * 0.15) * scale;
        const rx = Math.cos(phi) * ringR;
        const ry = Math.sin(phi) * ringR;
        const angle = Math.PI / 3.5;
        return new THREE.Vector3(
          rx,
          ry * Math.cos(angle),
          ry * Math.sin(angle)
        );
      }
    }

    function getVortexPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const norm = i / count;
      const radius = (Math.pow(norm, 0.6) * 1.6 + 0.1) * scale;
      const turns = 10.0;
      const phi = norm * Math.PI * 2 * turns + t * (2.2 / (radius + 0.1));
      const height = ((Math.pow(1 - norm, 2) * -1.2) + Math.sin(phi * 2.0 + t) * 0.08) * scale;
      return new THREE.Vector3(
        Math.cos(phi) * radius,
        height,
        Math.sin(phi) * radius
      );
    }

    function getCyberTorusPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const R = 1.05 * scale; // Major radius
      const r = 0.42 * scale; // Minor radius
      const u = (i / count) * Math.PI * 2 * 6;
      const v = (i / count) * Math.PI * 2;
      const phi = u + t * 1.1;
      const theta = v + Math.sin(u * 2 + t * 1.8) * 0.25;
      const x = (R + r * Math.cos(theta)) * Math.cos(phi);
      const y = (R + r * Math.cos(theta)) * Math.sin(phi);
      const z = r * Math.sin(theta) + Math.cos(phi * 3 + t) * 0.05 * scale;
      return new THREE.Vector3(x, y, z);
    }

    function getQuantumCrystalPos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const phiRatio = (1 + Math.sqrt(5)) / 2;
      const vertices: THREE.Vector3[] = [
        new THREE.Vector3(-1, phiRatio, 0), new THREE.Vector3(1, phiRatio, 0), new THREE.Vector3(-1, -phiRatio, 0), new THREE.Vector3(1, -phiRatio, 0),
        new THREE.Vector3(0, -1, phiRatio), new THREE.Vector3(0, 1, phiRatio), new THREE.Vector3(0, -1, -phiRatio), new THREE.Vector3(0, 1, -phiRatio),
        new THREE.Vector3(phiRatio, 0, -1), new THREE.Vector3(phiRatio, 0, 1), new THREE.Vector3(-phiRatio, 0, -1), new THREE.Vector3(-phiRatio, 0, 1)
      ].map(v => v.normalize().multiplyScalar(1.2 * scale));

      const sub = i % 10;
      if (sub < 6) {
        const vA = vertices[i % 12];
        const vB = vertices[(i * 5 + 3) % 12];
        const vC = vertices[(i * 7 + 1) % 12];
        const u = ((i * 17) % 100) / 100;
        const v = ((i * 31) % 100) / 100;
        const w = Math.max(0, 1 - u - v);
        const p = new THREE.Vector3()
          .addScaledVector(vA, u)
          .addScaledVector(vB, v)
          .addScaledVector(vC, w);
        const facetPulse = 1 + Math.sin(t * 2.5 + i * 0.05) * (0.04 + amp * 0.15);
        return p.multiplyScalar(facetPulse);
      } else if (sub < 9) {
        const vA = vertices[i % 12];
        const vB = vertices[(i + 1) % 12];
        const alpha = ((i * 13) % 100) / 100;
        const p = new THREE.Vector3().lerpVectors(vA, vB, alpha);
        const edgePulse = 1 + Math.sin(t * 3.5 + i * 0.1) * (0.08 + amp * 0.2);
        return p.multiplyScalar(edgePulse);
      } else {
        const idx = i;
        const phi = idx * 2.39996 + t * 1.5;
        const coreR = (0.35 + Math.sin(t * 3.0 + i * 0.2) * 0.05) * scale;
        const y = (((i % 100) / 100) - 0.5) * 0.8 * scale;
        return new THREE.Vector3(Math.cos(phi) * coreR, y, Math.sin(phi) * coreR);
      }
    }

    function getDoubleHelixPos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const sub = i % 4;
      if (sub === 0 || sub === 1) {
        const strand = sub;
        const norm = i / count;
        const height = (norm - 0.5) * 2.5 * scale;
        const turns = 4.0;
        const phase = (norm * Math.PI * 2 * turns) + (strand === 1 ? Math.PI : 0) + t * 1.8;
        const radius = (0.75 + Math.sin(t * 3.0 + height * 4.0) * (0.05 + amp * 0.15)) * scale;
        return new THREE.Vector3(Math.cos(phase) * radius, height, Math.sin(phase) * radius);
      } else if (sub === 2) {
        const norm = i / count;
        const height = (norm - 0.5) * 2.5 * scale;
        const turns = 4.0;
        const phaseA = (norm * Math.PI * 2 * turns) + t * 1.8;
        const radius = 0.75 * scale;
        const pA = new THREE.Vector3(Math.cos(phaseA) * radius, height, Math.sin(phaseA) * radius);
        const pB = new THREE.Vector3(Math.cos(phaseA + Math.PI) * radius, height, Math.sin(phaseA + Math.PI) * radius);
        const frac = ((i % 10) / 9.0);
        return new THREE.Vector3().lerpVectors(pA, pB, frac);
      } else {
        const phi = (i / (count / 4)) * Math.PI * 2 + t * 2.5;
        const ringR = (1.28 + Math.sin(t * 3.5 + i * 0.1) * 0.08) * scale;
        const tilt = Math.PI / 4;
        const rx = Math.cos(phi) * ringR;
        const ry = Math.sin(phi) * ringR;
        return new THREE.Vector3(rx, ry * Math.cos(tilt), ry * Math.sin(tilt));
      }
    }

    function getNebulaWavePos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const side = Math.floor(Math.sqrt(count));
      const gx = (i % side) / side - 0.5;
      const gz = Math.floor(i / side) / side - 0.5;
      
      const x = gx * 3.4 * scale;
      const z = gz * 3.4 * scale;
      
      const waveA = Math.sin(gx * 7.0 + t * 2.2) * Math.cos(gz * 7.0 + t * 1.8) * 0.45 * scale;
      const waveB = Math.sin(t * 3.0 + (gx + gz) * 5.0) * 0.15 * scale;
      const speechWave = Math.sin(t * 4.0 + (gx * gx + gz * gz) * 10.0) * amp * 0.35 * scale;
      const y = waveA + waveB + speechWave;
      
      return new THREE.Vector3(x, y, z);
    }

    // 1. VEGA // ACTIVE Orbit Ring (Tilted ellipse orbit with dashed rings & orbiting dots matching user screenshot)
    function getVegaOrbitalPos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const group = i % 6;
      const tiltX = Math.PI / 3.2; // Tilted angle matching image
      const tiltZ = -Math.PI / 12;

      if (group === 0 || group === 1) {
        // Main Tilted Elliptical Orbit Ring
        const norm = (i / (count * 0.33)) * Math.PI * 2 + t * 1.4;
        const a = 1.45 * scale;
        const b = 0.65 * scale;
        const x = Math.cos(norm) * a;
        const y = Math.sin(norm) * b;
        const z = Math.sin(norm * 3 + t * 2) * 0.04 * scale;

        const rx = x;
        const ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        const rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        return new THREE.Vector3(rx * Math.cos(tiltZ) - ry * Math.sin(tiltZ), rx * Math.sin(tiltZ) + ry * Math.cos(tiltZ), rz);
      } else if (group === 2) {
        // Concentric Inner Spiral Core Disk (Red particle swirl)
        const norm = (i / count);
        const radius = (0.2 + norm * 0.95) * scale;
        const phi = norm * Math.PI * 18 + t * 2.2;
        const x = Math.cos(phi) * radius;
        const y = Math.sin(phi) * radius * 0.45;
        const z = (Math.sin(phi * 2 + t) * 0.08) * scale;

        const rx = x;
        const ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        const rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        return new THREE.Vector3(rx, ry, rz);
      } else if (group === 3) {
        // Dashed Outer Orbital Ring (Outer perimeter dashed track)
        const dashIdx = Math.floor(i / 12);
        const isDashGap = dashIdx % 2 === 0;
        const phi = (i / (count * 0.16)) * Math.PI * 2 - t * 0.8;
        const ringR = (1.75 + (isDashGap ? 0.05 : 0)) * scale;
        const x = Math.cos(phi) * ringR;
        const y = Math.sin(phi) * ringR * 0.42;
        const z = 0;

        const rx = x;
        const ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        const rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        return new THREE.Vector3(rx, ry, rz);
      } else if (group === 4) {
        // Orbiting Satellite Nodes (Large red dots orbiting along perimeter)
        const nodeIdx = i % 4;
        const orbSpeed = t * 1.8 + nodeIdx * (Math.PI / 2);
        const ringR = 1.45 * scale;
        const x = Math.cos(orbSpeed) * ringR + Math.sin(i * 3) * 0.03 * scale;
        const y = Math.sin(orbSpeed) * ringR * 0.45 + Math.cos(i * 3) * 0.03 * scale;
        const z = Math.sin(t * 3 + nodeIdx) * 0.05 * scale;

        const rx = x;
        const ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        const rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        return new THREE.Vector3(rx, ry, rz);
      } else {
        // Ambient Orbital Dust & Audio Reaction
        const norm = i / count;
        const phi = norm * Math.PI * 2 + t * 0.5;
        const r = (1.1 + Math.sin(i * 0.5 + t * 2) * 0.2 + amp * 0.3) * scale;
        const x = Math.cos(phi) * r;
        const y = Math.sin(phi) * r * 0.5;
        const z = Math.cos(i * 0.2 + t) * 0.2 * scale;

        const rx = x;
        const ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        const rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        return new THREE.Vector3(rx, ry, rz);
      }
    }

    // 2. Black Hole Accretion Disk & Relativistic Polar Jets
    function getBlackHoleAccretionPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const sub = i % 5;
      if (sub < 4) {
        const norm = (i / count);
        const r = (0.25 + Math.pow(norm, 0.7) * 1.35) * scale;
        const phi = norm * Math.PI * 14 + t * (3.0 / (r + 0.2));
        const x = Math.cos(phi) * r;
        const z = Math.sin(phi) * r;
        const y = (Math.sin(phi * 4 + t * 2) * 0.03 * (r / scale)) * scale;
        return new THREE.Vector3(x, y, z);
      } else {
        const norm = ((i % 100) / 100);
        const direction = (i % 2 === 0) ? 1 : -1;
        const y = (0.3 + norm * 1.4) * direction * scale;
        const jetR = (0.04 + norm * 0.18) * scale;
        const phi = i * 2.5 + t * 6.0;
        return new THREE.Vector3(Math.cos(phi) * jetR, y, Math.sin(phi) * jetR);
      }
    }

    // 3. ORACLE // ACTIVE Flat Horizontal Particle Cloud Disk
    function getSupernovaPulsePos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const norm = i / count;
      const r = Math.sqrt(norm) * 1.35 * scale;
      const phi = norm * Math.PI * 2 * 43 + t * 0.7;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      const wave = Math.sin(r * 9.0 - t * 2.5) * 0.025 * scale;
      const y = (Math.sin(i * 1.3 + t * 1.5) * 0.035 + wave + (amp * 0.02)) * scale;
      return new THREE.Vector3(x, y, z);
    }

    // 4. Quantum Field Grid
    function getQuantumFieldPos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const side = Math.floor(Math.sqrt(count));
      const gx = (i % side) / side - 0.5;
      const gz = Math.floor(i / side) / side - 0.5;
      const x = gx * 3.2 * scale;
      const z = gz * 3.2 * scale;
      const wave = Math.sin(gx * 8.0 + t * 2.5) * Math.cos(gz * 8.0 + t * 2.0) * (0.5 + amp * 0.5) * scale;
      const y = wave;
      return new THREE.Vector3(x, y, z);
    }

    // 5. 4D Tesseract Matrix Projection
    function getHyperCubePos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const sub = i % 8;
      const phi = (i / count) * Math.PI * 2 + t * 0.8;
      const theta = t * 1.2;
      const rInner = 0.65 * scale;
      const rOuter = 1.35 * scale;
      const r = sub < 4 ? rInner : rOuter;
      const x = Math.cos(phi + sub * Math.PI / 4) * r;
      const y = Math.sin(phi + sub * Math.PI / 4) * r;
      const z = (Math.sin(theta + sub * Math.PI / 2) * (sub < 4 ? 0.4 : 0.8)) * scale;
      return new THREE.Vector3(x, y, z);
    }

    // 6. Möbius Strip Particle Ribbon
    function getMobiusStripPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const u = (i / count) * Math.PI * 2 * 2 + t * 0.8;
      const v = (((i % 20) / 20) - 0.5) * 0.7 * scale;
      const x = (1.1 * scale + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (1.1 * scale + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);
      return new THREE.Vector3(x, y, z);
    }

    // 7. Quad Helix Strand
    function getCyberDnaQuadPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const strand = i % 4;
      const norm = i / count;
      const height = (norm - 0.5) * 2.6 * scale;
      const turns = 4.5;
      const phase = (norm * Math.PI * 2 * turns) + (strand * Math.PI / 2) + t * 1.8;
      const radius = 0.72 * scale;
      return new THREE.Vector3(Math.cos(phase) * radius, height, Math.sin(phase) * radius);
    }

    // 8. Plasma Arc Discharge
    function getPlasmaSpherePos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const sub = i % 6;
      if (sub === 0) {
        const d = fibonacciDirs(count / 6)[Math.floor(i / 6) || 0];
        return d.clone().multiplyScalar((0.35 + amp * 0.1) * scale);
      } else {
        const arcIdx = sub;
        const norm = ((i % 100) / 100);
        const phi = arcIdx * (Math.PI / 3) + t * 1.5;
        const radius = (0.35 + norm * 1.05) * scale;
        const jitter = Math.sin(norm * 20.0 + t * 10.0 + i) * 0.08 * scale;
        const x = Math.cos(phi) * radius + jitter;
        const y = (norm - 0.5) * 2.0 * scale + jitter;
        const z = Math.sin(phi) * radius + jitter;
        return new THREE.Vector3(x, y, z);
      }
    }

    // 9. Solar Corona Loop
    function getSolarFlarePos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const sub = i % 4;
      if (sub < 2) {
        const d = fibonacciDirs(count)[i];
        return d.clone().multiplyScalar(0.9 * scale);
      } else {
        const loopIdx = i % 8;
        const norm = ((i % 50) / 50);
        const phi = (loopIdx / 8) * Math.PI * 2;
        const loopRadius = (0.9 + Math.sin(norm * Math.PI) * 0.65) * scale;
        const x = Math.cos(phi) * loopRadius;
        const y = Math.sin(norm * Math.PI) * 0.8 * scale * (loopIdx % 2 === 0 ? 1 : -1);
        const z = Math.sin(phi) * loopRadius;
        return new THREE.Vector3(x, y, z);
      }
    }

    // 10. Logarithmic Galaxy Spiral
    function getGalaxySpiralPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const arm = i % 4;
      const norm = i / count;
      const radius = (0.15 + Math.pow(norm, 0.6) * 1.5) * scale;
      const phi = norm * Math.PI * 8 + (arm * Math.PI / 2) + t * (1.8 / (radius + 0.1));
      const x = Math.cos(phi) * radius;
      const z = Math.sin(phi) * radius;
      const y = (Math.sin(phi * 3 + t) * 0.06 * (1 - norm)) * scale;
      return new THREE.Vector3(x, y, z);
    }

    // 11. Hologram Pyramid
    function getPrismPyramidPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const normY = (i / count);
      const y = (normY - 0.5) * 2.2 * scale;
      const sideLength = (1.2 * (1 - normY)) * scale;
      const edge = i % 4;
      const phi = (edge * Math.PI / 2) + t * 0.8;
      const x = Math.cos(phi) * sideLength;
      const z = Math.sin(phi) * sideLength;
      return new THREE.Vector3(x, y, z);
    }

    // 12. 3D Matrix Rain Cylinder
    function getMatrixRainPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const colIdx = i % 32;
      const phi = (colIdx / 32) * Math.PI * 2;
      const r = 1.25 * scale;
      const fallSpeed = 1.5 + (colIdx % 5) * 0.3;
      const y = ((((i * 0.07 + t * fallSpeed) % 2.6)) - 1.3) * scale;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      return new THREE.Vector3(x, y, z);
    }

    // 13. PULSE // ACTIVE Vertical Cylindrical Spring Helix Coil
    function getPulsarStarPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const norm = i / count;
      const height = (norm - 0.5) * 2.6 * scale;
      const turns = 8.0;
      const phase = norm * Math.PI * 2 * turns + t * 2.2;
      const strand = i % 2;
      const radius = 0.75 * scale;
      const x = Math.cos(phase + strand * Math.PI) * radius;
      const z = Math.sin(phase + strand * Math.PI) * radius;
      return new THREE.Vector3(x, height, z);
    }

    // 14. Holographic Cyber Wireframe Box Matrix
    function getHologramCubePos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const side = 1.1 * scale;
      const edge = i % 12;
      const fraction = ((i * 13) % 100) / 100 - 0.5;
      let x = 0, y = 0, z = 0;
      if (edge === 0) { x = fraction * side * 2; y = side; z = side; }
      else if (edge === 1) { x = fraction * side * 2; y = -side; z = side; }
      else if (edge === 2) { x = fraction * side * 2; y = side; z = -side; }
      else if (edge === 3) { x = fraction * side * 2; y = -side; z = -side; }
      else if (edge === 4) { y = fraction * side * 2; x = side; z = side; }
      else if (edge === 5) { y = fraction * side * 2; x = -side; z = side; }
      else if (edge === 6) { y = fraction * side * 2; x = side; z = -side; }
      else if (edge === 7) { y = fraction * side * 2; x = -side; z = -side; }
      else if (edge === 8) { z = fraction * side * 2; x = side; y = side; }
      else if (edge === 9) { z = fraction * side * 2; x = -side; y = side; }
      else if (edge === 10) { z = fraction * side * 2; x = side; y = -side; }
      else { z = fraction * side * 2; x = -side; y = -side; }

      const ry = t * 0.8;
      const rx = t * 0.4;
      const v = new THREE.Vector3(x, y, z);
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), rx);
      return v;
    }

    // 15. Cosmic String Loop
    function getCosmicStringPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const phi = (i / count) * Math.PI * 2 * 3 + t * 1.2;
      const r = (1.1 + Math.sin(phi * 4.0 + t * 3.0) * 0.25) * scale;
      const x = Math.cos(phi) * r;
      const y = Math.sin(phi) * r;
      const z = (Math.cos(phi * 6.0 + t * 2.0) * 0.35) * scale;
      return new THREE.Vector3(x, y, z);
    }

    // 16. Acoustic Chladni Frequency Resonance Plate
    function getChladniPlatePos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const side = Math.floor(Math.sqrt(count));
      const gx = (i % side) / side - 0.5;
      const gz = Math.floor(i / side) / side - 0.5;
      const x = gx * 3.0 * scale;
      const z = gz * 3.0 * scale;
      const n = 3, m = 5;
      const pattern = Math.sin(n * Math.PI * gx) * Math.sin(m * Math.PI * gz) - Math.sin(m * Math.PI * gx) * Math.sin(n * Math.PI * gz);
      const y = Math.abs(pattern) * 0.4 * scale * Math.sin(t * 3.0);
      return new THREE.Vector3(x, y, z);
    }

    // 17. Hexagonal Energy Shield Dome
    function getCyberShieldPos(i: number, count: number, t: number = 0, scale: number = 1.0, amp: number = 0.08): THREE.Vector3 {
      const normY = Math.max(0, (i / count));
      const y = normY * 1.4 * scale;
      const r = Math.sqrt(Math.max(0, 1 - normY * normY)) * 1.35 * scale;
      const phi = (i * 2.39996) + t * 0.6;
      const hexRipple = Math.sin(phi * 6.0 + y * 5.0 + t * 2.0) * (0.02 + amp * 0.05);
      const x = Math.cos(phi) * (r + hexRipple);
      const z = Math.sin(phi) * (r + hexRipple);
      return new THREE.Vector3(x, y - 0.4 * scale, z);
    }

    // 18. Wormhole Hyper-Spatial Warp Tunnel
    function getWormholeTunnelPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const z = (((i * 0.008 + t * 1.2) % 3.0) - 1.5) * scale;
      const r = (0.2 + Math.cosh(z / scale) * 0.4) * scale;
      const phi = (i * 2.39996) + t * 2.0;
      const x = Math.cos(phi) * r;
      const y = Math.sin(phi) * r;
      return new THREE.Vector3(x, y, z);
    }

    // 19. Triple Interlocking Fusion Rings
    function getRingOfFirePos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const ring = i % 3;
      const phi = (i / (count / 3)) * Math.PI * 2 + t * (1.2 + ring * 0.3);
      const r = 1.25 * scale;
      let x = 0, y = 0, z = 0;
      if (ring === 0) {
        x = Math.cos(phi) * r;
        y = Math.sin(phi) * r;
        z = Math.sin(phi * 4 + t * 2) * 0.05 * scale;
      } else if (ring === 1) {
        x = Math.cos(phi) * r;
        z = Math.sin(phi) * r;
        y = Math.cos(phi * 4 + t * 2) * 0.05 * scale;
      } else {
        y = Math.cos(phi) * r;
        z = Math.sin(phi) * r;
        x = Math.sin(phi * 4 + t * 2) * 0.05 * scale;
      }
      return new THREE.Vector3(x, y, z);
    }

    // 20. Bohr Atomic Orbital Clouds & Core
    function getAtomCorePos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const group = i % 5;
      if (group === 0) {
        const d = fibonacciDirs(count / 5)[Math.floor(i / 5) || 0];
        return d.clone().multiplyScalar(0.32 * scale);
      } else {
        const orbitIdx = group - 1;
        const phi = (i / (count / 5)) * Math.PI * 2 + t * (2.0 + orbitIdx * 0.5);
        const r = (1.1 + orbitIdx * 0.15) * scale;
        const x = Math.cos(phi) * r;
        const y = Math.sin(phi) * r;
        const tilt = (orbitIdx * Math.PI) / 4;
        const rx = x;
        const ry = y * Math.cos(tilt);
        const rz = y * Math.sin(tilt);
        return new THREE.Vector3(rx, ry, rz);
      }
    }

    // 21. 3D Lissajous Parametric Loop
    function getLissajousKnotPos(i: number, count: number, t: number = 0, scale: number = 1.0): THREE.Vector3 {
      const phi = (i / count) * Math.PI * 2 * 4 + t * 1.2;
      const x = Math.sin(3 * phi + t) * 1.35 * scale;
      const y = Math.sin(4 * phi) * 1.15 * scale;
      const z = Math.sin(5 * phi + t * 0.5) * 0.65 * scale;
      return new THREE.Vector3(x, y, z);
    }

    // --- Circular Glowing Particle Sprite Texture ---
    function createCrispPointTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      gradient.addColorStop(0.32, "rgba(255, 255, 255, 0.98)");
      gradient.addColorStop(0.62, "rgba(255, 255, 255, 0.65)");
      gradient.addColorStop(0.85, "rgba(255, 255, 255, 0.18)");
      gradient.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(64, 64, 64, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    const crispPointTex = createCrispPointTexture();

    const mainGeo = new THREE.BufferGeometry();
    const mainPos = new Float32Array(MAIN_COUNT * 3);
    const mainCol = new Float32Array(MAIN_COUNT * 3);

    mainGeo.setAttribute("position", new THREE.BufferAttribute(mainPos, 3));
    mainGeo.setAttribute("color", new THREE.BufferAttribute(mainCol, 3));

    const mainMat = new THREE.PointsMaterial({
      size: isSmall ? 0.028 : 0.024,
      map: crispPointTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const mainPoints = new THREE.Points(mainGeo, mainMat);
    const sphereGroup = new THREE.Group();
    sphereGroup.add(mainPoints);
    scene.add(sphereGroup);

    // Color helpers
    const defaultColor = new THREE.Color(0x14343d); // Dim blue
    const activeColor = new THREE.Color(); // Will be set to agentColor
    const listenColor = new THREE.Color(0xffb238); // Amber

    function createGlowParticleTexture(tintColor = "rgba(0, 240, 255, 0.6)") {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.95)");
      gradient.addColorStop(0.5, tintColor);
      gradient.addColorStop(0.8, "rgba(0, 160, 255, 0.15)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    // --- Expanding Ring Pulses (Speaking) ---
    const pulseRings: { mesh: THREE.Mesh; start: number }[] = [];
    let lastRingSpawn = -10;

    function spawnPulseRing(time: number, colorStr: string) {
      const geo = new THREE.RingGeometry(mainRadius * 1.02, mainRadius * 1.05, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorStr),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      pulseRings.push({ mesh, start: time });
    }

    // --- Parallax setup ---
    let targetParX = 0;
    let targetParY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetParX = (e.clientX / window.innerWidth - 0.5) * 0.35;
      targetParY = (e.clientY / window.innerHeight - 0.5) * -0.22;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- Resize handler ---
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // --- Animation Loop ---
    const startTime = performance.now();
    const tmpColor = new THREE.Color();
    let animationId: number;
    let morphVal = shapeRef.current === "sphere" ? 0.0 : shapeRef.current === "torus-knot" ? 1.0 : shapeRef.current === "gyroscope" ? 2.0 : shapeRef.current === "fusion" ? 3.0 : shapeRef.current === "network" ? 4.0 : shapeRef.current === "hourglass" ? 5.0 : 6.0;

    // Smooth movement variables for speech animation
    let smoothedMic = 0;
    let smoothedSpeak = 0;
    let speakFactor = 0;
    let vegaSpeakFactor = 0;
    let lastProcessedSwitchTime = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const t = (performance.now() - startTime) * 0.001;
      const curState = stateRef.current;
      const curMic = micLevelRef.current;
      const curSpeak = speakingLevelRef.current;
      const curColorStr = agentColorRef.current;

      // Handle Agent Switch Energy Burst & Fly-In/Out Transitions
      let switchPulseScale = 0;
      let switchP = 1.0;
      let switchFrom = "";
      let switchTo = currentAgentIdRef.current;

      if (switchEventRef.current) {
        if (switchEventRef.current.timestamp > lastProcessedSwitchTime) {
          lastProcessedSwitchTime = switchEventRef.current.timestamp;
          spawnPulseRing(t, curColorStr);
          setTimeout(() => {
            spawnPulseRing((performance.now() - startTime) * 0.001, curColorStr);
          }, 180);
        }

        const ageSec = (Date.now() - switchEventRef.current.timestamp) / 1000;
        if (ageSec <= 1.2) {
          switchP = Math.min(1.0, ageSec / 1.0);
          switchFrom = switchEventRef.current.from;
          switchTo = switchEventRef.current.to;
          const smoothP = switchP * switchP * (3 - 2 * switchP);
          switchPulseScale = Math.sin(smoothP * Math.PI) * 0.32;
        }
      }

      // Track speech state with smooth interpolation (gentle damping, no sudden flash)
      const isSpeakingState = curState === "speaking" || curSpeak > 0.005;
      const targetSpeak = isSpeakingState ? 1.0 : 0.0;
      speakFactor += (targetSpeak - speakFactor) * 0.09; // Smooth silky damping

      const targetVegaSpeak = (currentAgentIdRef.current === "vega" && curState === "speaking") ? 1.0 : 0.0;
      vegaSpeakFactor += (targetVegaSpeak - vegaSpeakFactor) * 0.08; // Smooth transition

      const speedFactor = particleSpeedRef.current || 1.0;
      const audioSens = audioSensitivityRef.current || 1.0;
      const effectiveT = t * speedFactor;

      const isModernMode = isModernRef.current;
      const isSyntaxCore = currentAgentIdRef.current === "maze" || currentAgentIdRef.current === "syntax" || !currentAgentIdRef.current;

      if (customColorRef.current && customColorRef.current !== "auto") {
        try {
          activeColor.set(customColorRef.current);
        } catch (e) {
          activeColor.set(curColorStr);
        }
      } else if (isModernMode && isSyntaxCore) {
        // Modern Design: S.Y.N.T.A.X. particle ball shines in refined modern Purple/Violet
        activeColor.set("#a855f7");
      } else if (currentAgentIdRef.current === "vega") {
        const redColor = new THREE.Color("#ff2233"); // Deep premium neon red
        const brightRed = new THREE.Color("#ff7582"); // Glowing bright coral-red on speech
        activeColor.copy(redColor).lerp(brightRed, vegaSpeakFactor);
      } else {
        activeColor.set(curColorStr);
      }

      // Smooth out mic and speech input levels to make the animation cleaner and responsive
      smoothedMic += (curMic - smoothedMic) * 0.10;
      smoothedSpeak += (curSpeak - smoothedSpeak) * 0.10;

      // Determine deformation amplitudes (Harmonic & fluid, no rapid flashing)
      let amp = 0.08;
      let tint = 0;

      if (curState === "listening") {
        amp = 0.08 + smoothedMic * 0.35 * audioSens; // Subtly and gracefully responds
        tint = Math.min(1, smoothedMic * 2.2 * audioSens);
      } else if (curState === "speaking" || speakFactor > 0.01) {
        amp = 0.10 + (smoothedSpeak * 0.35 + speakFactor * 0.05) * audioSens; // Smooth organic swells
        tint = Math.min(1, 0.35 + (smoothedSpeak * 0.8 + speakFactor * 0.25) * audioSens);
      } else if (curState === "thinking") {
        amp = 0.12 + (Math.sin(effectiveT * 4.0) * 0.5 + 0.5) * 0.06; // Smooth cognitive oscillations
      }

      // Sphere rotation and graceful speech breathing (remains calm and steady, no fast spinning)
      sphereGroup.rotation.y += (curState === "thinking" ? 0.012 : 0.0035) * speedFactor;
      sphereGroup.rotation.x += (curState === "thinking" ? 0.005 : 0.0012) * speedFactor; // Soft, natural drift
      
      let baseScale = 1 + Math.sin(t * 1.2) * 0.02; // Soft pumping breath
      if (curState === "speaking" || smoothedSpeak > 0.01 || speakFactor > 0.01) {
        // Smooth scale breathing proportional to speak volume & state
        baseScale += (smoothedSpeak * 0.06 + speakFactor * 0.02) + Math.sin(t * 2.0) * 0.01 * (smoothedSpeak + 0.12 * speakFactor);
      } else if (curState === "listening") {
        baseScale += smoothedMic * 0.04;
      }

      // Combine with agent switch energy pulse
      baseScale += switchPulseScale;
      sphereGroup.rotation.y += switchPulseScale * 0.08;
      sphereGroup.scale.set(baseScale, baseScale, baseScale);

      // Camera parallax interpolation
      camera.position.x += (targetParX - camera.position.x) * 0.04;
      camera.position.y += (targetParY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);



      // Update Pulse Rings
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const p = pulseRings[i];
        const age = t - p.start;
        if (age > 1.2) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          if (Array.isArray(p.mesh.material)) {
            p.mesh.material.forEach((m) => m.dispose());
          } else {
            p.mesh.material.dispose();
          }
          pulseRings.splice(i, 1);
          continue;
        }
        const s = 1 + age * 3.4; // Elegant outward expansion
        p.mesh.scale.set(s, s, s);
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.6 * (1 - age / 1.2));
        p.mesh.quaternion.copy(camera.quaternion);
      }

      // Update morph interpolation (smooth switching transition)
      const targetMorph = shapeRef.current === "sphere" ? 0.0 : shapeRef.current === "torus-knot" ? 1.0 : shapeRef.current === "gyroscope" ? 2.0 : shapeRef.current === "fusion" ? 3.0 : shapeRef.current === "network" ? 4.0 : shapeRef.current === "hourglass" ? 5.0 : 6.0;
      morphVal += (targetMorph - morphVal) * 0.08;

      // Deform sphere geometry and animate vertex colors
      const positionAttr = mainGeo.attributes.position as THREE.BufferAttribute;
      const colorAttr = mainGeo.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < MAIN_COUNT; i++) {
        const d = mainDirs[i];
        const angle = Math.acos(THREE.MathUtils.clamp(d.y, -1, 1));

        // 1. Sphere position with deformation (elegant, lower frequency and non-jittery amplitude)
        const wave1 = Math.sin(angle * 4.0 - t * 2.2) * 0.5 + 0.5;
        const wave2 = Math.sin(angle * 8.0 + t * 3.5) * 0.5 + 0.5;
        const disp = (wave1 * 0.75 + wave2 * 0.25) * amp;
        const rSphere = mainRadius * (1 + disp * 0.18); // Elegant organic displacement (controlled limits prevent "exploding")
        const sphereP = new THREE.Vector3(d.x * rSphere, d.y * rSphere, d.z * rSphere);

        // 2. Torus knot position with deformation
        const torusP = getTorusKnotPos(i, MAIN_COUNT);
        const phiTorus = (i / MAIN_COUNT) * Math.PI * 2 * 3;
        const rippleTorus = Math.sin(phiTorus * 6 - t * 2.8) * amp * 0.25; // Smooth fluid wave ripples
        const normTorus = torusP.clone().normalize();
        torusP.addScaledVector(normTorus, rippleTorus);

        // 3. Gyroscope position with deformation
        const gyroP = getGyroscopePos(i, MAIN_COUNT, t);
        const isRingA = i < MAIN_COUNT / 2;
        const phiGyro = ((isRingA ? i : (i - MAIN_COUNT / 2)) / (MAIN_COUNT / 2)) * Math.PI * 2;
        const rippleGyro = Math.sin(phiGyro * 6 - t * 3.2) * amp * 0.22; // Smooth fluid gyro wave motion
        const normGyro = gyroP.clone().normalize();
        gyroP.addScaledVector(normGyro, rippleGyro);

        // 4. Fusion position: Jarvis's high-density central nucleus + Vega's/Jarvis's widely expanding orbital rings
        const fusionP = getFusionPos(i, MAIN_COUNT, t, mainRadius, smoothedSpeak);

        // 5. Network position: Viral double-helix strand matrix with outer trend nodes
        const networkP = getNetworkPos(i, MAIN_COUNT, t, 1.05);
        const rippleNet = Math.sin(i * 0.15 - t * 3.5) * amp * 0.25;
        const normNet = networkP.clone().normalize();
        networkP.addScaledVector(normNet, rippleNet);

        // 6. Hourglass position: 3D double conical chrono sand engine (CHRONOS)
        const hourglassP = getHourglassPos(i, MAIN_COUNT, t, 1.05);
        const rippleHG = Math.sin(i * 0.12 - t * 3.0) * amp * 0.22;
        const normHG = hourglassP.clone().normalize();
        hourglassP.addScaledVector(normHG, rippleHG);

        // 7. Chart position: 3D candlestick & fibonacci market wave lattice (ORACLE)
        const chartP = getChartPos(i, MAIN_COUNT, t, 1.05);
        const rippleChart = Math.sin(i * 0.18 - t * 3.8) * amp * 0.22;
        const normChart = chartP.clone().normalize();
        chartP.addScaledVector(normChart, rippleChart);

        // Blend positions using morphVal or customShape override
        let finalPos: THREE.Vector3;
        if (customShapeRef.current && customShapeRef.current !== "auto") {
          const cs = customShapeRef.current;
          if (cs === "vega-orbital") {
            finalPos = getVegaOrbitalPos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "black-hole-accretion") {
            finalPos = getBlackHoleAccretionPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "supernova-pulse") {
            finalPos = getSupernovaPulsePos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "quantum-field") {
            finalPos = getQuantumFieldPos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "hyper-cube") {
            finalPos = getHyperCubePos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "mobius-strip") {
            finalPos = getMobiusStripPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "cyber-dna-quad") {
            finalPos = getCyberDnaQuadPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "plasma-sphere") {
            finalPos = getPlasmaSpherePos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "solar-flare") {
            finalPos = getSolarFlarePos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "galaxy-spiral") {
            finalPos = getGalaxySpiralPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "prism-pyramid") {
            finalPos = getPrismPyramidPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "matrix-rain") {
            finalPos = getMatrixRainPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "pulsar-star") {
            finalPos = getPulsarStarPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "hologram-cube") {
            finalPos = getHologramCubePos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "cosmic-string") {
            finalPos = getCosmicStringPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "chladni-plate") {
            finalPos = getChladniPlatePos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "cyber-shield") {
            finalPos = getCyberShieldPos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "wormhole-tunnel") {
            finalPos = getWormholeTunnelPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "ring-of-fire") {
            finalPos = getRingOfFirePos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "atom-core") {
            finalPos = getAtomCorePos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "lissajous-knot") {
            finalPos = getLissajousKnotPos(i, MAIN_COUNT, effectiveT, 1.15);
          } else if (cs === "crystal") {
            finalPos = getQuantumCrystalPos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "helix") {
            finalPos = getDoubleHelixPos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "nebula") {
            finalPos = getNebulaWavePos(i, MAIN_COUNT, effectiveT, 1.15, amp);
          } else if (cs === "vortex") {
            finalPos = getVortexPos(i, MAIN_COUNT, effectiveT, 1.15);
            const rippleV = Math.sin(i * 0.1 - effectiveT * 3.0) * amp * 0.2;
            finalPos.addScaledVector(finalPos.clone().normalize(), rippleV);
          } else if (cs === "torus") {
            finalPos = getCyberTorusPos(i, MAIN_COUNT, effectiveT, 1.15);
            const rippleT = Math.sin(i * 0.15 - effectiveT * 3.0) * amp * 0.2;
            finalPos.addScaledVector(finalPos.clone().normalize(), rippleT);
          } else if (cs === "torus-knot") {
            finalPos = torusP;
          } else if (cs === "gyroscope") {
            finalPos = gyroP;
          } else if (cs === "network") {
            finalPos = networkP;
          } else if (cs === "hourglass") {
            finalPos = hourglassP;
          } else if (cs === "chart") {
            finalPos = chartP;
          } else if (cs === "fusion") {
            finalPos = fusionP;
          } else if (cs === "sphere") {
            finalPos = sphereP;
          } else {
            finalPos = sphereP;
          }
        } else {
          // Dynamic agent auto-morphing (NEO, VEGA, ORACLE, PULSE, CHRONOS, ODIN, GLOBE, JARVIS)
          if (morphVal <= 1.0) {
            finalPos = new THREE.Vector3().lerpVectors(sphereP, torusP, morphVal);
          } else if (morphVal <= 2.0) {
            finalPos = new THREE.Vector3().lerpVectors(torusP, gyroP, morphVal - 1.0);
          } else if (morphVal <= 3.0) {
            finalPos = new THREE.Vector3().lerpVectors(gyroP, fusionP, morphVal - 2.0);
          } else if (morphVal <= 4.0) {
            finalPos = new THREE.Vector3().lerpVectors(fusionP, networkP, morphVal - 3.0);
          } else if (morphVal <= 5.0) {
            finalPos = new THREE.Vector3().lerpVectors(networkP, hourglassP, morphVal - 4.0);
          } else {
            finalPos = new THREE.Vector3().lerpVectors(hourglassP, chartP, Math.min(1.0, morphVal - 5.0));
          }
        }

        // Apply distinct, energetic vocal soundwave displacement on sphere surface
        if (curState === "speaking" || smoothedSpeak > 0.002 || speakFactor > 0.02) {
          const normVec = finalPos.clone().normalize();
          
          // Smooth harmonic acoustic soundwave ripples traveling across the sphere surface
          const waveLat = Math.sin(d.y * 3.2 - t * 2.8) * 0.025;
          const waveLon = Math.cos(d.x * 2.8 + t * 2.2) * 0.022;
          const vocalPulse = Math.sin(t * 3.0 + i * 0.008) * 0.018;
          
          // Displacement amplitude reacts dynamically to voice volume and speech activity
          const speechDisplacement = (waveLat + waveLon + vocalPulse) * (0.2 + smoothedSpeak * 1.0 + speakFactor * 0.25) * audioSens;
          
          finalPos.addScaledVector(normVec, speechDisplacement);
        }

        if (isModernMode && (!customShapeRef.current || customShapeRef.current === "auto" || customShapeRef.current === "sphere")) {
          // Modern Organic Fluid Morphing Deformed Sphere (matching the user's reference images)
          const theta = Math.acos(THREE.MathUtils.clamp(d.y, -1, 1));
          const phi = Math.atan2(d.z, d.x);

          const w1 = Math.sin(phi * 2.8 + effectiveT * 1.1) * Math.cos(theta * 2.2 + effectiveT * 0.85) * 0.14;
          const w2 = Math.cos(phi * 3.6 - effectiveT * 1.3) * Math.sin(theta * 2.8 + effectiveT * 0.95) * 0.08;
          const w3 = Math.sin((d.x * 2.5 + d.z * 2.5) + effectiveT * 1.5) * 0.05;
          const wVoice = Math.sin(theta * 6.0 - effectiveT * 2.6) * (amp * 0.28 + smoothedSpeak * 0.22);

          const rOrganic = mainRadius * (1.0 + w1 + w2 + w3 + wVoice);
          finalPos = new THREE.Vector3(d.x * rOrganic, d.y * rOrganic, d.z * rOrganic);
        }

        positionAttr.setXYZ(i, finalPos.x, finalPos.y, finalPos.z);

        if (isModernMode) {
          // 3D Depth & Volumetric Shading for Modern Particle Ball (matching reference photos):
          // Front-facing points (d.z > 0) are bright, vibrant, with luminous specular highlight
          // Back-facing points (d.z < 0) are darker and subtler to establish 3D spherical depth
          const zDepth = THREE.MathUtils.clamp(d.z * 0.65 + 0.45, 0.20, 1.0);
          const specularFactor = Math.pow(Math.max(0, d.z), 3.2) * 0.42;

          const primaryTint = activeColor.clone();
          if (curState === "speaking" || speakFactor > 0.01) {
            primaryTint.lerp(new THREE.Color("#ffffff"), Math.min(0.4, smoothedSpeak * 0.8 + speakFactor * 0.25));
          } else if (curState === "listening") {
            primaryTint.lerp(listenColor, 0.45);
          }

          tmpColor.copy(primaryTint).multiplyScalar(zDepth);
          if (specularFactor > 0.01) {
            tmpColor.lerp(new THREE.Color("#ffffff"), specularFactor);
          }

          colorAttr.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b);
          continue;
        }

        // Mix vertex colors based on state activity
        let mixAmt = Math.min(1, disp * 1.8 + tint * 0.65);
        if (curState === "speaking" || speakFactor > 0.05) {
          mixAmt = Math.max(mixAmt, smoothedSpeak * 0.95 + 0.45 * speakFactor);
        } else if (shapeRef.current === "fusion") {
          mixAmt = Math.max(mixAmt, smoothedSpeak * 0.85, smoothedMic * 0.85);
        }
        
        let particleBaseColor = (isModernMode && isSyntaxCore) ? new THREE.Color("#180d28") : defaultColor;
        let particleActiveColor = activeColor;

        // Bright energized vocal acoustic highlight (mix of signature agent color and luminous white accent)
        const vocalHighlightColor = activeColor.clone().lerp(new THREE.Color("#ffffff"), 0.35);

        if (shapeRef.current === "fusion") {
          // Sleek futuristic cyan/blue/white search matrix palette for GLOBE
          const primaryCyan = new THREE.Color("#00f0ff");
          const secondaryCyan = new THREE.Color("#00a8ff");
          const dimBaseCyan = new THREE.Color("#031826");

          const isPrimary = i % 2 === 0;
          particleBaseColor = dimBaseCyan;

          if (curState === "speaking" || speakFactor > 0.01) {
            particleActiveColor = primaryCyan.clone().lerp(vocalHighlightColor, Math.min(1, smoothedSpeak * 0.8 + speakFactor * 0.2));
          } else if (curState === "listening") {
            particleActiveColor = listenColor;
          } else {
            particleActiveColor = isPrimary ? primaryCyan : secondaryCyan;
          }
        } else {
          if (curState === "speaking" || speakFactor > 0.01) {
            particleActiveColor = activeColor.clone().lerp(vocalHighlightColor, Math.min(1, smoothedSpeak * 0.8 + speakFactor * 0.2));
          } else {
            particleActiveColor = activeColor;
          }
        }

        tmpColor.copy(particleBaseColor).lerp(
          particleActiveColor,
          Math.min(1, 0.33 + mixAmt * 0.88)
        );

        colorAttr.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b);
      }

      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();

      // Dispose ThreeJS resources properly
      scene.clear();
      mainGeo.dispose();
      mainMat.dispose();

      pulseRings.forEach((p) => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach((m) => m.dispose());
        } else {
          p.mesh.material.dispose();
        }
      });

      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden={!isActive}
      className={`absolute inset-0 w-full h-full z-0 overflow-hidden transition-opacity duration-300 ease-in-out ${
        isActive
          ? "is-active opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
});
