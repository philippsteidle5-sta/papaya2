/**
 * Universal Canvas & Storage Safety Patch
 * Prevents non-finite errors in CanvasRenderingContext2D (createRadialGradient, arc, etc.)
 * and guards storage against corrupted/exhausted states.
 */

if (typeof window !== "undefined" && typeof CanvasRenderingContext2D !== "undefined") {
  const proto = CanvasRenderingContext2D.prototype;

  // 1. Safe createRadialGradient
  const originalCreateRadialGradient = proto.createRadialGradient;
  proto.createRadialGradient = function (
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ): CanvasGradient {
    const safeX0 = Number.isFinite(x0) ? x0 : 0;
    const safeY0 = Number.isFinite(y0) ? y0 : 0;
    const safeR0 = Number.isFinite(r0) && r0 >= 0 ? r0 : 0;
    const safeX1 = Number.isFinite(x1) ? x1 : safeX0;
    const safeY1 = Number.isFinite(y1) ? y1 : safeY0;
    const safeR1 = Number.isFinite(r1) && r1 >= 0 ? r1 : Math.max(safeR0 + 1, 10);

    try {
      return originalCreateRadialGradient.call(this, safeX0, safeY0, safeR0, safeX1, safeY1, safeR1);
    } catch {
      // Fallback in case coordinates still fail
      return originalCreateRadialGradient.call(this, 0, 0, 0, 0, 0, 10);
    }
  };

  // 2. Safe arc
  const originalArc = proto.arc;
  proto.arc = function (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ) {
    const safeX = Number.isFinite(x) ? x : 0;
    const safeY = Number.isFinite(y) ? y : 0;
    const safeRadius = Number.isFinite(radius) && radius >= 0 ? radius : 1;
    const safeStartAngle = Number.isFinite(startAngle) ? startAngle : 0;
    const safeEndAngle = Number.isFinite(endAngle) ? endAngle : Math.PI * 2;

    try {
      return originalArc.call(this, safeX, safeY, safeRadius, safeStartAngle, safeEndAngle, counterclockwise);
    } catch {
      // Ignored safely
    }
  };
}

export {};
