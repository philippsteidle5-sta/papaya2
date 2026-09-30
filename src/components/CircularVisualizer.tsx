import React, { useEffect, useRef } from "react";

interface CircularVisualizerProps {
  agentColor: string;
  state: "idle" | "listening" | "thinking" | "speaking" | "";
  micLevel: number;
  speakingLevel: number;
}

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({
  agentColor,
  state,
  micLevel,
  speakingLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const micLevelRef = useRef(micLevel);
  const speakingLevelRef = useRef(speakingLevel);
  const agentColorRef = useRef(agentColor);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let angleOffset = 0;
    let smoothedActiveVal = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rInner = 145; // Radius matches central core sphere bounds
      const numBars = 56; // High-density cybernetic bar count

      const curState = stateRef.current;
      const curMic = micLevelRef.current;
      const curSpeak = speakingLevelRef.current;
      const curColor = agentColorRef.current || "#00f0ff";

      const targetVal = curState === "listening" ? curMic : curState === "speaking" ? curSpeak : 0;
      smoothedActiveVal += (targetVal - smoothedActiveVal) * 0.12;

      angleOffset += curState === "thinking" ? 0.008 : curState === "speaking" ? 0.004 : 0.002;

      ctx.shadowBlur = 0;
      ctx.strokeStyle = curColor;
      ctx.lineWidth = smoothedActiveVal > 0.05 ? 1.6 : 1.0;
      ctx.lineCap = "round";

      for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2 + angleOffset;

        // Calculate smooth, organic wave height with harmonic physics
        let barHeight = 0;
        if (smoothedActiveVal > 0.01) {
          // Acoustic harmonic soundwave simulation
          const freq1 = Math.sin(i * 0.35 + angleOffset * 4) * 8 * smoothedActiveVal;
          const freq2 = Math.cos(i * 0.7 - angleOffset * 2.5) * 5 * smoothedActiveVal;
          const freq3 = Math.sin(i * 0.15 + angleOffset * 6) * 4 * smoothedActiveVal;
          barHeight = smoothedActiveVal * 26 + freq1 + freq2 + freq3;
        } else if (curState === "thinking") {
          // Futuristic cognitive oscillations when processing
          barHeight = 4 + Math.sin(i * 0.4 + angleOffset * 6) * 3.5;
        } else {
          // Calm ambient respiratory wave when idle
          barHeight = 3 + Math.sin(i * 0.25 + angleOffset * 1.5) * 2;
        }

        // Clip bar height to safe visual bounds
        barHeight = Math.max(1.5, Math.min(48, barHeight));

        const x1 = cx + Math.cos(angle) * rInner;
        const y1 = cy + Math.sin(angle) * rInner;
        const x2 = cx + Math.cos(angle) * (rInner + barHeight);
        const y2 = cy + Math.sin(angle) * (rInner + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.globalAlpha = smoothedActiveVal > 0.05 ? 0.85 : curState === "thinking" ? 0.5 : 0.22;
        ctx.stroke();
      }

      // Draw an inner faint orbit ring
      ctx.beginPath();
      ctx.arc(cx, cy, rInner - 2, 0, Math.PI * 2);
      ctx.strokeStyle = curColor;
      ctx.globalAlpha = smoothedActiveVal > 0.05 ? 0.4 : 0.15;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={450}
      height={450}
      className="absolute pointer-events-none z-0"
    />
  );
};

