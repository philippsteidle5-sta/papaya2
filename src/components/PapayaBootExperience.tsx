import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface PapayaBootExperienceProps {
  onComplete: () => void;
}

export const PapayaBootExperience: React.FC<PapayaBootExperienceProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const stages = [
    { threshold: 15, label: "Initialisiere Papaya Core Engine..." },
    { threshold: 40, label: "Lade neuronale Gewebe & Bio-Kernel..." },
    { threshold: 70, label: "Kalibriere Tri-Core Nexus (Papaya • Neo • Vega)..." },
    { threshold: 90, label: "Optimiere Minimal Focus Canvas..." },
    { threshold: 100, label: "PapayaOS bereit zur Entfaltung." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsDone(true);
          return 100;
        }
        // Organic progress curve
        const step = prev < 30 ? 2.5 : prev < 75 ? 1.8 : prev < 95 ? 1.2 : 0.8;
        const next = Math.min(100, prev + step);
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const current = stages.findIndex((s) => progress <= s.threshold);
    if (current !== -1) {
      setStageIndex(current);
    } else {
      setStageIndex(stages.length - 1);
    }
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#090a0f] text-white select-none overflow-hidden"
    >
      {/* Subtle organic ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-orange-600/20 via-amber-500/15 to-emerald-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Papaya Visual Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Animated Papaya 3D Style Illustration */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-8 flex items-center justify-center">
          {/* Subtle Outer Halo Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-orange-500/15 border-dashed"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-gradient-to-tr from-orange-500/10 via-amber-400/10 to-transparent blur-xl"
          />

          {/* Stylized 3D Papaya SVG (Fruit Body, Inner Pulp & Organic Seeds) */}
          <motion.div
            animate={{
              y: [-4, 6, -4],
              rotate: [-1.5, 1.5, -1.5]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-44 h-52 filter drop-shadow-[0_20px_35px_rgba(255,107,53,0.35)]"
          >
            <svg
              viewBox="0 0 200 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                {/* Outer Skin: Fresh Soft Green */}
                <linearGradient id="papayaSkin" x1="20" y1="20" x2="180" y2="230" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#70a34b" />
                  <stop offset="60%" stopColor="#437a34" />
                  <stop offset="100%" stopColor="#2c5322" />
                </linearGradient>

                {/* Inner Ring: Cream/Yellow Rind */}
                <linearGradient id="papayaRind" x1="40" y1="40" x2="160" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffe49e" />
                  <stop offset="100%" stopColor="#ffd166" />
                </linearGradient>

                {/* Ripe Flesh: Warm Luminous Papaya Orange */}
                <linearGradient id="papayaFlesh" x1="40" y1="30" x2="160" y2="210" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ff8c42" />
                  <stop offset="45%" stopColor="#ff6b35" />
                  <stop offset="100%" stopColor="#f35022" />
                </linearGradient>

                {/* Core Cavity */}
                <radialGradient id="papayaCavity" cx="50%" cy="52%" r="50%">
                  <stop offset="0%" stopColor="#e24a1b" />
                  <stop offset="100%" stopColor="#b22e08" />
                </radialGradient>

                {/* Seed Gloss */}
                <linearGradient id="seedGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#402e2c" />
                  <stop offset="60%" stopColor="#1e1413" />
                  <stop offset="100%" stopColor="#0a0505" />
                </linearGradient>
              </defs>

              {/* 1. Outer Green Skin Silhouette */}
              <path
                d="M100 12 C135 12 165 45 160 85 C155 120 185 155 180 195 C175 228 140 238 100 238 C60 238 25 228 20 195 C15 155 45 120 40 85 C35 45 65 12 100 12 Z"
                fill="url(#papayaSkin)"
              />

              {/* 2. Rind Border Line */}
              <path
                d="M100 20 C130 20 156 48 152 84 C148 116 174 148 170 186 C165 218 135 228 100 228 C65 228 35 218 30 186 C26 148 52 116 48 84 C44 48 70 20 100 20 Z"
                fill="url(#papayaRind)"
              />

              {/* 3. Deep Rich Orange Flesh */}
              <path
                d="M100 28 C126 28 148 53 144 86 C140 115 164 145 160 180 C155 210 128 220 100 220 C72 220 45 210 40 180 C36 145 60 115 56 86 C52 53 74 28 100 28 Z"
                fill="url(#papayaFlesh)"
              />

              {/* 4. Center Cavity */}
              <path
                d="M100 65 C118 65 128 92 126 125 C124 150 118 175 100 175 C82 175 76 150 74 125 C72 92 82 65 100 65 Z"
                fill="url(#papayaCavity)"
                opacity="0.9"
              />

              {/* 5. Papaya Seeds with Organic Stagger & Glow */}
              {[
                { cx: 100, cy: 82, r: 4.8 },
                { cx: 93, cy: 94, r: 5.2 },
                { cx: 107, cy: 95, r: 5.1 },
                { cx: 88, cy: 108, r: 5.5 },
                { cx: 101, cy: 109, r: 5.4 },
                { cx: 113, cy: 111, r: 5.2 },
                { cx: 92, cy: 124, r: 5.6 },
                { cx: 106, cy: 125, r: 5.5 },
                { cx: 100, cy: 139, r: 5.4 },
                { cx: 92, cy: 149, r: 4.9 },
                { cx: 108, cy: 151, r: 4.8 },
                { cx: 100, cy: 161, r: 4.2 }
              ].map((seed, i) => {
                // Seed reveals progressively as progress rises!
                const isRevealed = progress >= (i + 1) * 7;
                return (
                  <g key={i}>
                    <circle
                      cx={seed.cx}
                      cy={seed.cy}
                      r={seed.r}
                      fill="url(#seedGrad)"
                      opacity={isRevealed ? 1 : 0.2}
                      className="transition-opacity duration-300"
                    />
                    {isRevealed && (
                      <circle
                        cx={seed.cx - 1.2}
                        cy={seed.cy - 1.2}
                        r={seed.r * 0.3}
                        fill="#ffffff"
                        opacity="0.5"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </div>

        {/* Brand Heading */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            PapayaOS Core 4.8
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
            PAPAYA<span className="text-orange-500 font-mono text-2xl font-light ml-1">OS.ai</span>
          </h1>
          <p className="text-zinc-400 text-sm font-normal">
            Sovereign Intelligence Workspace
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full max-w-xs space-y-2 mb-8">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400 truncate max-w-[200px] text-left">
              {stages[stageIndex]?.label}
            </span>
            <span className="text-orange-400 font-bold ml-2">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800/80 overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 shadow-[0_0_12px_rgba(255,107,53,0.7)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.1 }}
            />
          </div>
        </div>

        {/* Action Button once at 100% or Quick Skip */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence>
            {isDone ? (
              <motion.button
                id="enter-papaya-os-btn"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-zinc-950 font-bold text-sm tracking-wide flex items-center gap-2 shadow-[0_0_24px_rgba(255,107,53,0.4)] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                Workspace Betreten
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </motion.button>
            ) : (
              <button
                onClick={onComplete}
                className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors underline cursor-pointer"
              >
                Intro überspringen →
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
