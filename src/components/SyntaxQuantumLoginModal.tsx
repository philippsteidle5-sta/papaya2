import React, { useState, useEffect, useRef } from "react";
import { X, Key, Lock, AlertCircle, BarChart3, ShieldCheck } from "lucide-react";
import {
  validateAndRedeemAccessKey,
  verifyAdminSecretKey,
  registerNewLead,
  setCurrentUserEmail,
  SUPERADMIN_EMAIL,
  setStoredAdminAuthenticated,
  getLeadsDatabase,
  loginUserAccount,
  registerUserAccount,
} from "../utils/leadDatabase";
import {
  playValidationBeep,
  playKeypressSound,
  playSuccessFanfare,
  playErrorTone,
  playClickSound,
} from "../utils/audioSynth";

interface SyntaxQuantumLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (email: string, role?: string) => void;
  onOpenDailyUsage?: () => void;
  onOpenUserTerminal?: (tab?: string) => void;
  lang?: "de" | "en";
}

const MIX_COLORS = ["#2dd4ee", "#ff9d3d", "#34e7b0", "#ff3d81", "#a361f7"];

export const SyntaxQuantumLoginModal: React.FC<SyntaxQuantumLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenDailyUsage,
  onOpenUserTerminal,
  lang = "de",
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phase, setPhase] = useState<"idle" | "busy" | "success">("idle");
  const [bootVisible, setBootVisible] = useState<boolean>(true);

  // Form Inputs
  const [loginKey, setLoginKey] = useState<string>("");
  const [loginPass, setLoginPass] = useState<string>("");
  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPass, setRegPass] = useState<string>("");
  const [regPass2, setRegPass2] = useState<string>("");
  const [passStrength, setPassStrength] = useState<number>(0);

  // Console typing & UI state
  const [consoleLines, setConsoleLines] = useState<Array<{ text: string; ok?: boolean }>>([]);
  const [consoleVisible, setConsoleVisible] = useState<boolean>(false);
  const [ringProgress, setRingProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Success data
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    sub: string;
    slot: string;
    depth: string;
    email: string;
    role: string;
  }>({
    title: "Access <span>Granted</span>",
    sub: "Core synchronized • direct access ready",
    slot: "#493",
    depth: "100%",
    email: "",
    role: "SOVEREIGN",
  });

  // Canvas and Spark Refs
  const brandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const coreCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbit1Ref = useRef<HTMLCanvasElement | null>(null);
  const orbit2Ref = useRef<HTMLCanvasElement | null>(null);
  const orbit3Ref = useRef<HTMLCanvasElement | null>(null);
  const orbit4Ref = useRef<HTMLCanvasElement | null>(null);
  const orbit5Ref = useRef<HTMLCanvasElement | null>(null);
  const orbit6Ref = useRef<HTMLCanvasElement | null>(null);
  const orbit7Ref = useRef<HTMLCanvasElement | null>(null);
  const sparksLoginRef = useRef<HTMLDivElement | null>(null);
  const sparksRegisterRef = useRef<HTMLDivElement | null>(null);

  // Spark emitter helper
  const makeSparkEmitter = (maxDist: number, rate: number) => {
    const sparks: Array<{
      ang: number;
      dist: number;
      speed: number;
      life: number;
      color: string;
      r: number;
    }> = [];
    let acc = 0;
    return {
      update(dt: number, cx: number, cy: number, innerR: number) {
        acc += dt;
        if (acc > rate) {
          acc = 0;
          const ang = Math.random() * Math.PI * 2;
          sparks.push({
            ang,
            dist: innerR,
            speed: 14 + Math.random() * 18,
            life: 1,
            color: MIX_COLORS[Math.floor(Math.random() * MIX_COLORS.length)],
            r: 1 + Math.random() * 1.2,
          });
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.dist += s.speed * dt * 0.06;
          s.life -= dt * 0.0014;
          if (s.life <= 0 || s.dist > maxDist) sparks.splice(i, 1);
        }
      },
      draw(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        sparks.forEach((s) => {
          const x = cx + Math.cos(s.ang) * s.dist;
          const y = cy + Math.sin(s.ang) * s.dist;
          ctx.beginPath();
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.arc(x, y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      },
    };
  };

  // Spark burst for buttons
  const burstSparks = (container: HTMLDivElement | null, color: string) => {
    if (!container) return;
    const N = 14;
    for (let i = 0; i < N; i++) {
      const s = document.createElement("i");
      const ang = Math.random() * Math.PI * 2;
      const dist = 26 + Math.random() * 34;
      s.style.setProperty("--sx", (Math.cos(ang) * dist).toFixed(1) + "px");
      s.style.setProperty("--sy", (Math.sin(ang) * dist).toFixed(1) + "px");
      s.style.left = 30 + Math.random() * 40 + "%";
      s.style.background = color;
      s.style.boxShadow = "0 0 6px " + color;
      s.style.animationDelay = Math.random() * 0.08 + "s";
      container.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  };

  // Boot sequence
  useEffect(() => {
    if (!isOpen) return;
    setBootVisible(true);
    const t = setTimeout(() => setBootVisible(false), 2000);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Brand Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = brandCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const w = canvas.width,
      h = canvas.height;
    const cx = w / 2,
      cy = h / 2;
    const emitter = makeSparkEmitter(30, 55);
    let last = performance.now();
    const ringDefs = [
      { rx: 15, ry: 6, rot: -0.35, color: MIX_COLORS[0] },
      { rx: 13, ry: 13, rot: 0.6, color: MIX_COLORS[4] },
      { rx: 10, ry: 4, rot: 1.4, color: MIX_COLORS[3] },
    ];

    function frame(t: number) {
      const dt = t - last;
      last = t;
      ctx.clearRect(0, 0, w, h);
      ringDefs.forEach((rd, i) => {
        const rot = rd.rot + t * 0.0007 * (i % 2 ? 1 : -1);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, rd.rx, rd.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rd.color;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 1.1;
        ctx.shadowColor = rd.color;
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
      });

      const hueIdx = Math.floor(t / 900) % MIX_COLORS.length;
      const coreColor = MIX_COLORS[hueIdx];
      ctx.beginPath();
      ctx.arc(cx, cy, 2.6 + Math.sin(t * 0.006) * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 9;
      ctx.fill();

      emitter.update(dt, cx, cy, 9);
      emitter.draw(ctx, cx, cy);

      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  // Orbit Decorators
  useEffect(() => {
    if (!isOpen) return;
    const drawOrbit = (
      canvas: HTMLCanvasElement | null,
      colors: string[],
      speed: number,
      opacity: number = 0.55
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.width,
        h = canvas.height;
      const cx = w / 2,
        cy = h / 2;
      const particles: Array<{ ring: number; a: number; speed: number; pulse: number }> = [];
      const N = 22;
      for (let i = 0; i < N; i++) {
        particles.push({
          ring: i % 3,
          a: Math.random() * Math.PI * 2,
          speed: (0.15 + Math.random() * 0.3) * speed,
          pulse: Math.random() * Math.PI * 2,
        });
      }
      const baseAngle = Math.random() * Math.PI;
      const ringDefs = [
        { rx: 58, ry: 22, rot: -0.35 + baseAngle, color: colors[0] },
        { rx: 48, ry: 16, rot: 0.5 + baseAngle, color: colors[1] },
        { rx: 38, ry: 11, rot: 1.3 + baseAngle, color: colors[2] },
      ];

      let animId: number;
      function frame(t: number) {
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = opacity;
        ringDefs.forEach((rd) => {
          const rot = rd.rot + t * 0.00016 * speed;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, rd.rx, rd.ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = rd.color + "55";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        });
        particles.forEach((p) => {
          const rd = ringDefs[p.ring];
          const rot = rd.rot + t * 0.00016 * speed;
          const ang = p.a + t * 0.0011 * p.speed;
          const x = Math.cos(ang) * rd.rx;
          const y = Math.sin(ang) * rd.ry;
          const rx = cx + x * Math.cos(rot) - y * Math.sin(rot);
          const ry = cy + x * Math.sin(rot) + y * Math.cos(rot);
          const pr = 1.3 + Math.sin(t * 0.002 + p.pulse) * 0.6;
          ctx.beginPath();
          ctx.arc(rx, ry, pr, 0, Math.PI * 2);
          ctx.fillStyle = rd.color;
          ctx.shadowColor = rd.color;
          ctx.shadowBlur = 7;
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        animId = requestAnimationFrame(frame);
      }
      animId = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(animId);
    };

    const c1 = drawOrbit(orbit1Ref.current, ["#2dd4ee", "#7fe8ff", "#1aa7c2"], 1, 0.5);
    const c2 = drawOrbit(orbit2Ref.current, ["#ff9d3d", "#ffc98a", "#c9701c"], -0.8, 0.45);
    const c3 = drawOrbit(orbit3Ref.current, ["#34e7b0", "#8ff7d8", "#1fa87c"], 1.3, 0.4);
    const c4 = drawOrbit(orbit4Ref.current, ["#ff3d81", "#ff8bb8", "#c21f5e"], -1.1, 0.5);
    const c5 = drawOrbit(orbit5Ref.current, ["#a361f7", "#d3a7ff", "#7c3fe0"], 0.9, 0.45);
    const c6 = drawOrbit(orbit6Ref.current, ["#2dd4ee", "#a361f7", "#ff3d81"], -1.4, 0.35);
    const c7 = drawOrbit(orbit7Ref.current, ["#ff3d81", "#ff9d3d", "#a361f7"], 1.1, 0.4);

    return () => {
      c1 && c1();
      c2 && c2();
      c3 && c3();
      c4 && c4();
      c5 && c5();
      c6 && c6();
      c7 && c7();
    };
  }, [isOpen]);

  // Main Quantum Core Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = coreCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CW = canvas.width,
      CH = canvas.height;
    const CX = CW / 2,
      CY = CH / 2;

    const coreParticles: Array<{ ring: number; a: number; speed: number; wobble: number }> = [];
    for (let i = 0; i < 46; i++) {
      coreParticles.push({
        ring: i % 3,
        a: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    const coreEmitter = makeSparkEmitter(56, 90);
    let coreLast = performance.now();
    let animId: number;

    function getColors() {
      if (phase === "success") return ["#34e7b0", "#34e7b0", "#34e7b0"];
      if (mode === "register") return ["#a361f7", "#c98bff", "#7c3fe0"];
      return ["#2dd4ee", "#7fe8ff", "#1aa7c2"];
    }

    function frame(t: number) {
      ctx.clearRect(0, 0, CW, CH);
      const colors = getColors();
      const busy = phase === "busy";
      const success = phase === "success";
      const spin = busy ? 4.2 : success ? 0.4 : 1;

      const rings = [
        { rx: 40, ry: 15, tilt: 0.2 + Math.sin(t * 0.0004) * 0.08, dir: 1, color: colors[0] },
        { rx: 33, ry: 33, tilt: 0.65, dir: -1, color: colors[1] },
        { rx: 24, ry: 9, tilt: -0.5 + Math.cos(t * 0.0005) * 0.08, dir: 1, color: colors[2] },
      ];

      rings.forEach((rd) => {
        const rot = t * 0.0006 * rd.dir * spin + rd.tilt;
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, rd.rx, rd.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rd.color;
        ctx.globalAlpha = success ? 0.85 : 0.6;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = rd.color;
        ctx.shadowBlur = busy ? 10 : 5;
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = 1;
      });

      const pulse = success ? 1 : 0.7 + Math.sin(t * 0.006) * 0.3;
      const glowR = (busy ? 7 : 5.5) * pulse + (success ? 2 : 0);
      const grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, 18);
      grad.addColorStop(0, colors[0] + "ee");
      grad.addColorStop(1, colors[0] + "00");
      ctx.beginPath();
      ctx.arc(CX, CY, glowR * 2.6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(CX, CY, glowR * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      coreParticles.forEach((p) => {
        const rd = rings[p.ring];
        const rot = t * 0.0006 * rd.dir * spin + rd.tilt;
        const ang = p.a + t * 0.0012 * p.speed * spin;
        const x = Math.cos(ang) * rd.rx;
        const y = Math.sin(ang) * rd.ry;
        const px = CX + x * Math.cos(rot) - y * Math.sin(rot);
        const py = CY + x * Math.sin(rot) + y * Math.cos(rot);
        ctx.beginPath();
        ctx.arc(px, py, busy ? 2.1 : 1.2, 0, Math.PI * 2);
        ctx.fillStyle = rd.color;
        ctx.shadowColor = rd.color;
        ctx.shadowBlur = busy ? 11 : 4;
        ctx.fill();
      });

      const coreT = performance.now();
      const cdt = coreT - coreLast;
      coreLast = coreT;
      if (!busy && !success) {
        coreEmitter.update(cdt, CX, CY, 20);
        coreEmitter.draw(ctx, CX, CY);
      }

      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, mode, phase]);

  // Console Typer
  const typeConsole = (lines: Array<{ text: string; ok?: boolean }>, gap = 430): Promise<void> => {
    setConsoleVisible(true);
    setConsoleLines([]);
    return lines.reduce((p, line, i) => {
      return p.then(
        () =>
          new Promise((res) => {
            setTimeout(() => {
              setConsoleLines((prev) => [...prev, line]);
              res();
            }, i === 0 ? 0 : gap);
          })
      );
    }, Promise.resolve());
  };

  // Ring animation
  const animateRing = (duration: number): Promise<void> => {
    return new Promise((res) => {
      const start = performance.now();
      function step(now: number) {
        const p = Math.min(1, (now - start) / duration);
        setRingProgress(p * 100);
        if (p < 1) requestAnimationFrame(step);
        else res();
      }
      requestAnimationFrame(step);
    });
  };

  // Registration password meter
  const handleRegPassChange = (val: string) => {
    setRegPass(val);
    let score = 0;
    if (val.length >= 6) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (val.length >= 10 && /[^A-Za-z0-9]/.test(val)) score++;
    setPassStrength(score);
  };

  // Login Submit (Queries backend user registry; supports Full Core Admin root & 1-day keys)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "busy") return;
    const cleanKey = loginKey.trim();
    if (!cleanKey) {
      playErrorTone();
      setErrorMsg(lang === "de" ? "Bitte E-Mail, Benutzername oder Access Key eingeben." : "Please enter email, username or access key.");
      return;
    }

    setErrorMsg("");
    setPhase("busy");
    playClickSound();
    setRingProgress(0);
    burstSparks(sparksLoginRef.current, "#2dd4ee");

    try {
      const authRes = await loginUserAccount(cleanKey, loginPass);

      if (!authRes.ok) {
        playErrorTone();
        setErrorMsg(authRes.message || (lang === "de" ? "Anmeldung fehlgeschlagen. Bitte erstelle zuerst einen Account." : "Login failed. Please register an account first."));
        setPhase("idle");
        return;
      }

      const user = authRes.user;
      const isSuperAdmin = user?.isFullCoreAdmin || user?.role === "FULL_CORE_ADMIN" || verifyAdminSecretKey(cleanKey) || cleanKey.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

      await Promise.all([
        animateRing(1600),
        typeConsole([
          { text: "Querying quantum user database…" },
          { text: `Verifying identity for ${user?.email || cleanKey}…` },
          { text: isSuperAdmin ? "ROOT SUPERADMIN PERMISSIONS GRANTED (8/8 CORES)" : "Synchronizing sovereign AI agents (8/8)…" },
          { text: "Access authenticated.", ok: true },
        ], 380),
      ]);

      if (isSuperAdmin) {
        setSuccessInfo({
          title: "👑 Full Core Admin <span>Granted</span>",
          sub: "Superadmin root privileges verified (philippsteidle5@gmail.com) • All 8 Cores Active",
          slot: "👑 #FULL-CORE-ADMIN-ROOT",
          depth: "8/8 Cores (100%)",
          email: user?.email || SUPERADMIN_EMAIL,
          role: "FULL_CORE_ADMIN",
        });
      } else {
        setSuccessInfo({
          title: "Account <span>Verified</span>",
          sub: `${user?.name || "Sovereign Pioneer"} • ${user?.planName || "Sovereign Core"} aktiv`,
          slot: `#${user?.slot || 488}`,
          depth: "8/8 Cores (100%)",
          email: user?.email || cleanKey,
          role: user?.role || "SOVEREIGN",
        });
      }
      playSuccessFanfare();
      setPhase("success");
    } catch (err: any) {
      playErrorTone();
      setErrorMsg(err?.message || "Netzwerkfehler beim Anmelden.");
      setPhase("idle");
    }
  };

  // Register Submit (Creates new account in backend user registry)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "busy") return;

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanName = regName.trim() || cleanEmail.split("@")[0] || "Pioneer";

    if (!cleanEmail || !cleanEmail.includes("@")) {
      playErrorTone();
      setErrorMsg(lang === "de" ? "Bitte eine gültige E-Mail-Adresse angeben." : "Please provide a valid email.");
      return;
    }

    if (regPass.length < 6) {
      playErrorTone();
      setErrorMsg(lang === "de" ? "Das Passwort muss mindestens 6 Zeichen lang sein." : "Password must be at least 6 characters.");
      return;
    }

    if (regPass !== regPass2) {
      playErrorTone();
      setErrorMsg(lang === "de" ? "Die Passwörter stimmen nicht überein." : "Passwords do not match.");
      return;
    }

    setErrorMsg("");
    setPhase("busy");
    playClickSound();
    setRingProgress(0);
    burstSparks(sparksRegisterRef.current, "#a361f7");

    try {
      const regRes = await registerUserAccount({
        name: cleanName,
        email: cleanEmail,
        password: regPass,
        confirmPassword: regPass2,
        plan: "ENTERPRISE_99",
        goal: "Sovereign Multi-Agent OS Access",
      });

      if (!regRes.ok) {
        playErrorTone();
        setErrorMsg(regRes.message || (lang === "de" ? "Registrierung fehlgeschlagen." : "Registration failed."));
        setPhase("idle");
        return;
      }

      const user = regRes.user;

      await Promise.all([
        animateRing(2000),
        typeConsole([
          { text: "Creating new quantum user profile…" },
          { text: "Allocating 256-bit cryptographic token…" },
          { text: "Provisioning all 8 sovereign AI agent cores…" },
          { text: "Account created and online.", ok: true },
        ], 400),
      ]);

      setSuccessInfo({
        title: "Account <span>Erstellt & Initialisiert</span>",
        sub: "Dein Account wurde erfolgreich im Backend registriert • Alle 8 KI-Cores synchronisiert",
        slot: `#${user?.slot || 488}`,
        depth: "8/8 Cores",
        email: user?.email || cleanEmail,
        role: "SOVEREIGN",
      });
      playSuccessFanfare();
      setPhase("success");
    } catch (err: any) {
      playErrorTone();
      setErrorMsg(err?.message || "Fehler bei der Registrierung.");
      setPhase("idle");
    }
  };

  const handleContinueToDashboard = () => {
    if (typeof onSuccess === "function") {
      onSuccess(successInfo.email || loginKey || regEmail || "user@syntax.local", successInfo.role);
    }
    onClose();
  };

  if (!isOpen) return null;

  const CIRC = 2 * Math.PI * 51.9;
  const strokeOffset = CIRC - (CIRC * ringProgress) / 100;

  return (
    <div className="sq-modal-wrapper fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 bg-[#05060a]/95 backdrop-blur-2xl overflow-x-hidden overflow-y-auto">
      
      {/* SCOPED TEMPLATE CSS */}
      <style>{`
        :root {
          --void: #05060a;
          --panel: #0a0e18;
          --panel-2: #0d1220;
          --line: #16233a;
          --line-soft: #101a2c;
          --cyan: #2dd4ee;
          --cyan-dim: #2dd4ee66;
          --violet: #a361f7;
          --violet-dim: #a361f766;
          --magenta: #ff3d81;
          --mint: #34e7b0;
          --ink: #cbd6e8;
          --ink-dim: #66738c;
          --ink-faint: #3b4560;
        }

        .sq-bg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(45,212,238,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,212,238,0.045) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%);
                  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 75%);
          pointer-events: none;
          z-index: 0;
        }
        .sq-bg-vignette {
          position: fixed; inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 30%, rgba(45,212,238,0.06), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .sq-float-orbit {
          position: fixed;
          width: 150px; height: 150px;
          pointer-events: none;
          z-index: 0;
          will-change: transform;
          animation: sq-drift-a 8s ease-in-out infinite;
        }
        .sq-float-orbit canvas { width: 100%; height: 100%; display: block; }
        .sq-float-orbit.v2 { animation-name: sq-drift-b; animation-duration: 7s; }
        .sq-float-orbit.v3 { animation-name: sq-drift-c; animation-duration: 9s; }

        @keyframes sq-drift-a {
          0%   { transform: translate(0,0) scale(1); }
          25%  { transform: translate(18px,-24px) scale(1.04); }
          50%  { transform: translate(-10px,-40px) scale(0.97); }
          75%  { transform: translate(-26px,-8px) scale(1.02); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes sq-drift-b {
          0%   { transform: translate(0,0) scale(1); }
          30%  { transform: translate(-22px,20px) scale(0.95); }
          60%  { transform: translate(14px,34px) scale(1.05); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes sq-drift-c {
          0%   { transform: translate(0,0) scale(1); }
          20%  { transform: translate(20px,16px) scale(1.03); }
          55%  { transform: translate(30px,-22px) scale(0.96); }
          80%  { transform: translate(-16px,-10px) scale(1); }
          100% { transform: translate(0,0) scale(1); }
        }

        .sq-stage {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 460px;
          opacity: 0;
          animation: sq-stage-in 0.7s cubic-bezier(.2,.8,.2,1) forwards;
          animation-delay: 0.15s;
        }
        @keyframes sq-stage-in {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sq-brand-row {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 22px;
        }
        .sq-brand-mark {
          width: 34px; height: 34px;
          flex-shrink: 0;
          position: relative;
        }
        .sq-brand-mark canvas {
          width: 100%; height: 100%;
          display: block;
        }
        .sq-brand-text {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 0.14em;
          color: #eaf3fb;
        }
        .sq-brand-text span { color: var(--cyan); }
        .sq-brand-sub {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.24em;
          color: var(--ink-faint);
          text-transform: uppercase;
          margin-top: -16px;
          margin-bottom: 26px;
        }

        .sq-card {
          position: relative;
          background: linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 30px 28px 26px;
          box-shadow:
            0 0 0 1px rgba(45,212,238,0.03),
            0 30px 60px -20px rgba(0,0,0,0.7),
            0 0 60px -25px rgba(45,212,238,0.25);
          transition: box-shadow 0.6s ease, border-color 0.6s ease;
        }
        .sq-card::before {
          content: "";
          position: absolute; inset: -1px;
          border-radius: 15px;
          padding: 1.4px;
          background: linear-gradient(135deg, rgba(45,212,238,0.4), rgba(163,97,247,0.12) 45%, transparent 65%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          pointer-events: none;
          opacity: 0.7;
        }
        .sq-card.state-success::before {
          background: linear-gradient(135deg, rgba(52,231,176,0.55), rgba(52,231,176,0.1) 60%, transparent 80%);
          opacity: 0.9;
        }
        .sq-card-glow {
          position: absolute; inset: -30px;
          border-radius: 26px;
          background: radial-gradient(ellipse at 50% 0%, rgba(45,212,238,0.16), transparent 60%);
          filter: blur(10px);
          pointer-events: none;
          z-index: -1;
          animation: sq-glow-breathe 4.5s ease-in-out infinite;
        }
        @keyframes sq-glow-breathe {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .sq-corner-tag {
          position: absolute; width: 14px; height: 14px;
          border-color: var(--cyan-dim);
          opacity: 0.7;
        }
        .sq-corner-tag.tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; border-top-left-radius: 6px; }
        .sq-corner-tag.br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; border-bottom-right-radius: 6px; }

        .sq-card.state-success {
          border-color: rgba(52,231,176,0.5);
          box-shadow:
            0 0 0 1px rgba(52,231,176,0.06),
            0 30px 60px -20px rgba(0,0,0,0.7),
            0 0 70px -20px rgba(52,231,176,0.35);
        }

        .sq-keylogin-row {
          display: flex; justify-content: center; margin-bottom: 16px;
        }
        .sq-keylogin-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px; letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #eaf3fb;
          background: linear-gradient(135deg, rgba(45,212,238,0.16), rgba(45,212,238,0.04));
          border: 1px solid rgba(45,212,238,0.45);
          padding: 9px 16px;
          border-radius: 100px;
          cursor: pointer;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.15s ease, box-shadow 0.25s ease;
        }
        .sq-keylogin-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
        .sq-keylogin-btn:hover {
          background: linear-gradient(135deg, rgba(45,212,238,0.26), rgba(45,212,238,0.08));
          border-color: rgba(45,212,238,0.7);
          box-shadow: 0 0 18px -4px rgba(45,212,238,0.5);
        }
        .sq-keylogin-btn:active { transform: scale(0.97); }

        .sq-badge-row {
          display: flex; justify-content: center; margin-bottom: 18px;
        }
        .sq-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px; letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--violet);
          background: rgba(163,97,247,0.08);
          border: 1px solid rgba(163,97,247,0.35);
          padding: 5px 12px 5px 9px;
          border-radius: 100px;
        }
        .sq-badge .sq-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--violet);
          box-shadow: 0 0 8px var(--violet);
          animation: sq-pulse-dot 1.8s ease-in-out infinite;
        }

        .sq-core-wrap {
          position: relative;
          width: 118px; height: 118px;
          margin: 0 auto 18px;
        }
        .sq-core-wrap canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
        }
        .sq-core-ring-svg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          transform: rotate(-90deg);
        }
        .sq-core-ring-track {
          fill: none; stroke: var(--line); stroke-width: 2;
        }
        .sq-core-ring-bar {
          fill: none; stroke: var(--cyan); stroke-width: 2;
          stroke-linecap: round;
          stroke-dasharray: 326;
          transition: stroke-dashoffset 0.35s ease, stroke 0.4s ease;
          filter: drop-shadow(0 0 5px var(--cyan));
        }
        .sq-card[data-mode="register"] .sq-core-ring-bar { stroke: var(--violet); filter: drop-shadow(0 0 5px var(--violet)); }
        .sq-card.state-success .sq-core-ring-bar { stroke: var(--mint) !important; filter: drop-shadow(0 0 6px var(--mint)); }

        .sq-core-glyph {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .sq-core-glyph svg { width: 30px; height: 30px; }
        .sq-core-check path {
          fill: none; stroke: var(--mint); stroke-width: 2.6;
          stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 40; stroke-dashoffset: 40;
          filter: drop-shadow(0 0 6px var(--mint));
        }
        .sq-card.state-success .sq-core-check path {
          animation: sq-draw-check 0.5s ease forwards 0.15s;
        }
        .sq-core-glyph .key-glyph, .sq-core-glyph .spark-glyph {
          stroke: var(--ink); opacity: 0.85;
          transition: opacity 0.3s ease;
        }
        .sq-card.state-success .key-glyph,
        .sq-card.state-success .spark-glyph { opacity: 0; }

        .sq-tabs {
          position: relative;
          display: flex;
          background: var(--void);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 22px;
        }
        .sq-tab-btn {
          flex: 1;
          position: relative;
          z-index: 2;
          background: none; border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-dim);
          padding: 9px 0;
          cursor: pointer;
          transition: color 0.35s ease;
        }
        .sq-tab-btn.active { color: #eaf3fb; }
        .sq-tab-indicator {
          position: absolute;
          top: 4px; bottom: 4px; left: 4px;
          width: calc(50% - 4px);
          border-radius: 7px;
          background: linear-gradient(135deg, rgba(45,212,238,0.16), rgba(45,212,238,0.04));
          border: 1px solid rgba(45,212,238,0.4);
          transition: transform 0.4s cubic-bezier(.65,0,.35,1), background 0.4s ease, border-color 0.4s ease;
        }
        .sq-card[data-mode="register"] .sq-tab-indicator {
          transform: translateX(100%);
          background: linear-gradient(135deg, rgba(163,97,247,0.16), rgba(163,97,247,0.04));
          border-color: rgba(163,97,247,0.4);
        }

        .sq-field { display: flex; flex-direction: column; gap: 6px; }
        .sq-field label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }
        .sq-input-shell {
          position: relative;
          display: flex; align-items: center;
          background: var(--void);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 0 12px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .sq-input-shell svg {
          width: 15px; height: 15px;
          color: var(--ink-faint);
          flex-shrink: 0;
          transition: color 0.25s ease;
        }
        .sq-input-shell input {
          flex: 1;
          background: none; border: none; outline: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--ink);
          padding: 11px 10px;
          letter-spacing: 0.02em;
        }
        .sq-input-shell input::placeholder { color: var(--ink-faint); }
        .sq-input-shell:focus-within {
          border-color: var(--cyan-dim);
          box-shadow: 0 0 0 3px rgba(45,212,238,0.08);
        }
        .sq-card[data-mode="register"] .sq-input-shell:focus-within {
          border-color: var(--violet-dim);
          box-shadow: 0 0 0 3px rgba(163,97,247,0.08);
        }
        .sq-input-shell:focus-within svg { color: var(--cyan); }
        .sq-card[data-mode="register"] .sq-input-shell:focus-within svg { color: var(--violet); }

        .sq-strength {
          display: flex; gap: 4px; height: 3px; margin-top: 2px;
        }
        .sq-strength i {
          flex: 1; background: var(--line); border-radius: 2px;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .sq-strength.s1 i:nth-child(1) { background: var(--magenta); box-shadow: 0 0 6px var(--magenta); }
        .sq-strength.s2 i:nth-child(-n+2) { background: #ffb347; box-shadow: 0 0 6px #ffb347; }
        .sq-strength.s3 i:nth-child(-n+3) { background: var(--mint); box-shadow: 0 0 6px var(--mint); }

        .sq-submit-btn {
          position: relative;
          overflow: hidden;
          margin-top: 6px;
          border: none; border-radius: 9px;
          padding: 13px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 12.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #04121a;
          background: linear-gradient(100deg, var(--cyan), #bdf4ff, var(--cyan));
          background-size: 240% 100%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: filter 0.25s ease;
          box-shadow: 0 0 24px -6px rgba(45,212,238,0.7);
          animation: sq-btn-pulse 2s ease-in-out infinite, sq-btn-shift 2.4s linear infinite;
          z-index: 1;
        }
        @keyframes sq-btn-pulse {
          0%,100% { box-shadow: 0 0 20px -6px rgba(45,212,238,0.55); transform: translateY(0) scale(1); }
          50% { box-shadow: 0 0 38px -3px rgba(45,212,238,1); transform: translateY(-3px) scale(1.02); }
        }
        @keyframes sq-btn-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .sq-card[data-mode="register"] .sq-submit-btn {
          background: linear-gradient(100deg, var(--violet), #e3c9ff, var(--violet));
          background-size: 240% 100%;
          box-shadow: 0 0 24px -6px rgba(163,97,247,0.7);
          animation-name: sq-btn-pulse-violet, sq-btn-shift;
        }
        @keyframes sq-btn-pulse-violet {
          0%,100% { box-shadow: 0 0 20px -6px rgba(163,97,247,0.55); transform: translateY(0) scale(1); }
          50% { box-shadow: 0 0 38px -3px rgba(163,97,247,1); transform: translateY(-3px) scale(1.02); }
        }
        .sq-submit-btn:hover { filter: brightness(1.1); }
        .sq-submit-btn:disabled { cursor: default; filter: saturate(0.7) brightness(0.85); animation-play-state: paused; }
        .sq-submit-btn.loading {
          animation-duration: 0.6s, 0.8s !important;
          animation-play-state: running !important;
        }
        .sq-submit-btn::after {
          content: "";
          position: absolute; top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
          transform: skewX(-20deg);
          animation: sq-shimmer 3.2s ease-in-out infinite;
        }
        @keyframes sq-shimmer {
          0% { left: -60%; }
          45% { left: 130%; }
          100% { left: 130%; }
        }
        .sq-submit-btn .sq-spinner {
          width: 13px; height: 13px;
          border-radius: 50%;
          border: 2px solid rgba(4,18,26,0.35);
          border-top-color: #04121a;
          display: none;
          animation: sq-spin 0.7s linear infinite;
        }
        .sq-submit-btn.loading .sq-spinner { display: inline-block; }

        .sq-btn-wrap { position: relative; }
        .sq-btn-sparks {
          position: absolute; inset: 0;
          pointer-events: none;
          overflow: visible;
        }
        .sq-btn-sparks i {
          position: absolute;
          top: 50%; left: 50%;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 6px var(--cyan);
          opacity: 0;
          animation: sq-spark-fly 0.65s ease-out forwards;
        }
        @keyframes sq-spark-fly {
          0% { opacity: 1; transform: translate(-50%,-50%) translate(0,0) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) translate(var(--sx), var(--sy)) scale(0.3); }
        }

        .sq-console {
          margin-top: 14px;
          min-height: 66px;
          background: var(--void);
          border: 1px solid var(--line-soft);
          border-radius: 8px;
          padding: 10px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          line-height: 1.65;
          color: var(--ink-dim);
          display: none;
        }
        .sq-console.visible { display: block; }
        .sq-console .line {
          opacity: 0;
          animation: sq-line-in 0.35s ease forwards;
          display: flex; gap: 7px;
        }
        .sq-console .line .tag { color: var(--cyan); flex-shrink: 0; }
        .sq-card[data-mode="register"] .sq-console .line .tag { color: var(--violet); }
        .sq-console .line.ok .tag { color: var(--mint); }
        @keyframes sq-line-in {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .sq-success-panel {
          display: none;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
          padding-top: 4px;
          animation: sq-panel-in 0.5s cubic-bezier(.2,.8,.2,1);
        }
        .sq-success-panel.visible { display: flex; }
        .sq-success-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 21px;
          letter-spacing: 0.05em;
          color: #eaf3fb;
          margin-top: 6px;
        }
        .sq-success-title span { color: var(--mint); }
        .sq-success-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--ink-dim);
          margin-bottom: 14px;
        }
        .sq-cred-box {
          width: 100%;
          background: var(--void);
          border: 1px dashed rgba(52,231,176,0.4);
          border-radius: 8px;
          padding: 12px 14px;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 14px;
        }
        .sq-cred-box .k { font-size: 10px; letter-spacing: 0.12em; color: var(--ink-faint); text-transform: uppercase; }
        .sq-cred-box .v { font-size: 13px; color: var(--mint); letter-spacing: 0.04em; }

        .sq-foot-note {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          letter-spacing: 0.1em;
          color: var(--ink-faint);
          margin-top: 18px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        #sq-boot-overlay {
          position: fixed; inset: 0;
          background: var(--void);
          z-index: 300;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 18px;
          animation: sq-boot-fade 0.6s ease forwards;
          animation-delay: 1.5s;
        }
        #sq-boot-overlay.hidden { display: none; }
        @keyframes sq-boot-fade { to { opacity: 0; visibility: hidden; } }
        .sq-boot-ring { position: relative; width: 64px; height: 64px; }
        .sq-boot-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .sq-boot-ring circle { fill: none; stroke-width: 2; }
        .sq-boot-ring .trk { stroke: var(--line); }
        .sq-boot-ring .bar {
          stroke: var(--cyan);
          stroke-linecap: round;
          stroke-dasharray: 157;
          stroke-dashoffset: 157;
          filter: drop-shadow(0 0 6px var(--cyan));
          animation: sq-boot-ring-fill 1.2s ease forwards 0.1s;
        }
        @keyframes sq-boot-ring-fill { to { stroke-dashoffset: 20; } }
        .sq-boot-dot {
          position: absolute; top: 50%; left: 50%;
          width: 6px; height: 6px; margin: -3px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 10px var(--cyan);
          animation: sq-boot-pulse 1s ease-in-out infinite;
        }
        @keyframes sq-boot-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
        }
        .sq-boot-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink-dim);
          display: flex; gap: 8px; align-items: center;
        }
        .sq-boot-text .cursor {
          display: inline-block; width: 6px; height: 12px;
          background: var(--cyan);
          animation: sq-boot-blink 0.8s step-end infinite;
        }
        @keyframes sq-boot-blink { 50% { opacity: 0; } }
        .sq-boot-bar-track {
          width: 180px; height: 2px;
          background: var(--line);
          border-radius: 2px;
          overflow: hidden;
        }
        .sq-boot-bar-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, var(--cyan), var(--violet));
          box-shadow: 0 0 8px var(--cyan);
          animation: sq-boot-bar-grow 1.3s cubic-bezier(.3,.7,.2,1) forwards 0.05s;
        }
        @keyframes sq-boot-bar-grow { to { width: 100%; } }

        @keyframes sq-pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes sq-draw-check { to { stroke-dashoffset: 0; } }
        @keyframes sq-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* BOOT OVERLAY */}
      {bootVisible && (
        <div id="sq-boot-overlay">
          <div className="sq-boot-ring">
            <svg viewBox="0 0 64 64">
              <circle className="trk" cx="32" cy="32" r="25" />
              <circle className="bar" cx="32" cy="32" r="25" />
            </svg>
            <div className="sq-boot-dot" />
          </div>
          <div className="sq-boot-text">
            SYNCING SOVEREIGN CORE<span className="cursor" />
          </div>
          <div className="sq-boot-bar-track">
            <div className="sq-boot-bar-fill" />
          </div>
        </div>
      )}

      {/* AMBIENT BACKGROUND */}
      <div className="sq-bg-grid" />
      <div className="sq-bg-vignette" />

      {/* 7 FLOATING ORBITS */}
      <div className="sq-float-orbit" style={{ top: "-30px", left: "-40px" }}>
        <canvas ref={orbit1Ref} width="150" height="150" />
      </div>
      <div className="sq-float-orbit v2" style={{ top: "8%", right: "-50px" }}>
        <canvas ref={orbit2Ref} width="150" height="150" />
      </div>
      <div className="sq-float-orbit v3" style={{ top: "38%", left: "-60px" }}>
        <canvas ref={orbit3Ref} width="150" height="150" />
      </div>
      <div className="sq-float-orbit" style={{ bottom: "6%", right: "-30px" }}>
        <canvas ref={orbit4Ref} width="150" height="150" />
      </div>
      <div className="sq-float-orbit v2" style={{ bottom: "-40px", left: "6%" }}>
        <canvas ref={orbit5Ref} width="150" height="150" />
      </div>
      <div className="sq-float-orbit v3" style={{ top: "2%", left: "42%" }}>
        <canvas ref={orbit6Ref} width="150" height="150" />
      </div>
      <div className="sq-float-orbit" style={{ bottom: "-30px", right: "30%" }}>
        <canvas ref={orbit7Ref} width="150" height="150" />
      </div>

      {/* STAGE */}
      <div className="sq-stage">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-[#0a0e18] border border-[#16233a] hover:border-[#2dd4ee] text-[#66738c] hover:text-white flex items-center justify-center transition cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* BRAND ROW */}
        <div className="sq-brand-row">
          <div className="sq-brand-mark">
            <canvas ref={brandCanvasRef} width="68" height="68" />
          </div>
          <div className="sq-brand-text">
            S.Y.N.T.A.X<span>.</span>
          </div>
        </div>
        <div className="sq-brand-sub">Multi-Agent Quantum OS &nbsp;/&nbsp; Sovereign Access Terminal</div>

        {/* MAIN CARD */}
        <div
          className={`sq-card ${phase === "success" ? "state-success" : ""}`}
          data-mode={mode}
        >
          <div className="sq-card-glow" />
          <span className="sq-corner-tag tl" />
          <span className="sq-corner-tag br" />

          {/* KEY LOGIN CTA */}
          <div className="sq-keylogin-row">
            <button
              type="button"
              className="sq-keylogin-btn"
              onClick={() => {
                setPhase("idle");
                setMode("login");
                setErrorMsg("");
                setTimeout(() => {
                  const inputEl = document.getElementById("login-key-input") as HTMLInputElement | null;
                  if (inputEl) {
                    inputEl.focus();
                    inputEl.select();
                  }
                }, 50);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.7 6.3a4 4 0 1 0 0 5.66L21 18.3V21h-2.7l-.7-.7-1.6 1.6h-2.4v-2.4l-1.6-1.6-1.9 1.9H7v-3.1l1.55-1.55a4 4 0 0 0 6.15-6.85Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              {lang === "de" ? "Mit Key anmelden" : "Sign in with Key"}
            </button>
          </div>

          {/* BADGE */}
          <div className="sq-badge-row">
            <span className="sq-badge">
              <span className="sq-dot" />
              Pro Sovereign Core
            </span>
          </div>

          {/* QUANTUM CORE */}
          <div className="sq-core-wrap">
            <canvas ref={coreCanvasRef} width="118" height="118" />
            <svg className="sq-core-ring-svg" viewBox="0 0 118 118">
              <circle className="sq-core-ring-track" cx="59" cy="59" r="51.9" />
              <circle
                className="sq-core-ring-bar"
                cx="59"
                cy="59"
                r="51.9"
                style={{ strokeDashoffset: strokeOffset }}
              />
            </svg>
            <div className="sq-core-glyph">
              {phase === "success" ? (
                <svg viewBox="0 0 24 24" className="sq-core-check">
                  <path d="M5 12.5 10 17l9-10" />
                </svg>
              ) : mode === "login" ? (
                <svg viewBox="0 0 24 24" className="key-glyph">
                  <path
                    d="M14.7 6.3a4 4 0 1 0 0 5.66L21 18.3V21h-2.7l-.7-.7-1.6 1.6h-2.4v-2.4l-1.6-1.6-1.9 1.9H7v-3.1l1.55-1.55a4 4 0 0 0 6.15-6.85Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="spark-glyph">
                  <path
                    d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M17.5 17.5 15 15M18 6l-2.5 2.5M8.5 15.5 6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              )}
            </div>
          </div>

          {/* SUCCESS VIEW */}
          {phase === "success" ? (
            <div className="sq-success-panel visible">
              <div
                className="sq-success-title"
                dangerouslySetInnerHTML={{ __html: successInfo.title }}
              />
              <div className="sq-success-sub">{successInfo.sub}</div>
              <div className="sq-cred-box">
                <span className="k">Slot</span>
                <span className="v">{successInfo.slot}</span>
                <span className="k">Depth</span>
                <span className="v">{successInfo.depth}</span>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  type="button"
                  className="sq-submit-btn w-full cursor-pointer"
                  onClick={handleContinueToDashboard}
                  style={{
                    background: "linear-gradient(100deg, #34e7b0, #8ff7d8)",
                    color: "#03211a",
                    boxShadow: "0 0 24px -6px rgba(52,231,176,0.7)",
                  }}
                >
                  <span>Enter Dashboard &rarr;</span>
                </button>

                {onOpenUserTerminal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUserTerminal("overview");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 hover:from-emerald-900/80 hover:to-cyan-900/80 border border-emerald-400/60 text-emerald-300 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  >
                    <span>👤 User Terminal (Zahlungen & Abo) &rarr;</span>
                  </button>
                )}
              </div>

              {onOpenDailyUsage && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDailyUsage();
                  }}
                  className="mt-2 text-xs text-[#2dd4ee] hover:underline font-mono flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Ø Daily Usage Dashboard</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* TABS */}
              <div className="sq-tabs">
                <div className="sq-tab-indicator" />
                <button
                  type="button"
                  className={`sq-tab-btn ${mode === "login" ? "active" : ""}`}
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`sq-tab-btn ${mode === "register" ? "active" : ""}`}
                  onClick={() => {
                    setMode("register");
                    setErrorMsg("");
                  }}
                >
                  Register
                </button>
              </div>

              {/* LOGIN FORM */}
              {mode === "login" && (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5" noValidate>
                  <div className="sq-field">
                    <label htmlFor="login-key-input">Access Key</label>
                    <div className="sq-input-shell">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.4" />
                        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      <input
                        type="text"
                        id="login-key-input"
                        value={loginKey}
                        onChange={(e) => setLoginKey(e.target.value)}
                        onKeyDown={() => playKeypressSound()}
                        placeholder="key_user@syntax.local"
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="sq-field">
                    <label htmlFor="login-pass-input">Passphrase</label>
                    <div className="sq-input-shell">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="10.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      <input
                        type="password"
                        id="login-pass-input"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        onKeyDown={() => playKeypressSound()}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] text-[#66738c] pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#cbd6e8]/80 hover:text-white transition">
                      <input type="checkbox" defaultChecked className="accent-[#2dd4ee] rounded" />
                      <span>Keep core synced</span>
                    </label>
                    <span className="text-[#3b4560] text-[10px] tracking-wider">256-BIT QUANTUM</span>
                  </div>

                  {errorMsg && (
                    <div className="p-2 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-mono font-bold flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="sq-btn-wrap">
                    <button
                      type="submit"
                      disabled={phase === "busy"}
                      className={`sq-submit-btn w-full ${phase === "busy" ? "loading" : ""}`}
                    >
                      <span className="sq-spinner" />
                      <span>{phase === "busy" ? "Authenticating…" : "Authenticate"}</span>
                    </button>
                    <div ref={sparksLoginRef} className="sq-btn-sparks" />
                  </div>
                </form>
              )}

              {/* REGISTER FORM */}
              {mode === "register" && (
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5" noValidate>
                  <div className="sq-field">
                    <label htmlFor="reg-name-input">Callsign</label>
                    <div className="sq-input-shell">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M5 20c1-4 4-6 7-6s6 2 7 6" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      <input
                        type="text"
                        id="reg-name-input"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        onKeyDown={() => playKeypressSound()}
                        placeholder="e.g. otto_vector"
                        autoComplete="nickname"
                      />
                    </div>
                  </div>

                  <div className="sq-field">
                    <label htmlFor="reg-email-input">Gmail / Workspace</label>
                    <div className="sq-input-shell">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.4" />
                        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      <input
                        type="email"
                        id="reg-email-input"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        onKeyDown={() => playKeypressSound()}
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="sq-field">
                      <label htmlFor="reg-pass-input">Passphrase</label>
                      <div className="sq-input-shell">
                        <svg viewBox="0 0 24 24" fill="none">
                          <rect x="5" y="10.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                        <input
                          type="password"
                          id="reg-pass-input"
                          value={regPass}
                          onChange={(e) => handleRegPassChange(e.target.value)}
                          onKeyDown={() => playKeypressSound()}
                          placeholder="min. 8 chars"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="sq-field">
                      <label htmlFor="reg-pass2-input">Confirm</label>
                      <div className="sq-input-shell">
                        <svg viewBox="0 0 24 24" fill="none">
                          <rect x="5" y="10.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                        <input
                          type="password"
                          id="reg-pass2-input"
                          value={regPass2}
                          onChange={(e) => setRegPass2(e.target.value)}
                          onKeyDown={() => playKeypressSound()}
                          placeholder="repeat"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`sq-strength ${passStrength > 0 ? "s" + passStrength : ""}`}>
                    <i />
                    <i />
                    <i />
                  </div>

                  {errorMsg && (
                    <div className="p-2 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-mono font-bold flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="sq-btn-wrap">
                    <button
                      type="submit"
                      disabled={phase === "busy"}
                      className={`sq-submit-btn w-full ${phase === "busy" ? "loading" : ""}`}
                    >
                      <span className="sq-spinner" />
                      <span>{phase === "busy" ? "Initializing…" : "Initialize Core"}</span>
                    </button>
                    <div ref={sparksRegisterRef} className="sq-btn-sparks" />
                  </div>
                </form>
              )}

              {/* TERMINAL CONSOLE */}
              {consoleVisible && (
                <div className="sq-console visible">
                  {consoleLines.map((l, i) => (
                    <div key={i} className={`line ${l.ok ? "ok" : ""}`}>
                      <span className="tag">{l.ok ? "[OK]" : "[..]"}</span>
                      <span>{l.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTNOTE */}
        <div className="sq-foot-note">
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="10.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          256-bit encrypted &bull; Sovereign key never leaves this device
        </div>
      </div>
    </div>
  );
};
