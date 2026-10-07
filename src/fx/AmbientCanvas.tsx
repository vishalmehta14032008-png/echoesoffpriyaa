import { useEffect, useRef } from "react";
import { isCoarsePointer, pixelRatio, prefersReducedMotion } from "./fx";
import { GLOW_COLORS, glow, petal } from "./sprites";

interface Fly { x: number; y: number; r: number; ph: number; sp: number; depth: number; c: number }
interface Petal { x: number; y: number; vy: number; sway: number; ph: number; rot: number; vr: number; size: number; color: string }

const PETAL_COLORS = ["#f6c3d6", "#e7d7fb", "#fbd9e4"];

/**
 * Background atmosphere: drifting fireflies and falling petals with a touch of
 * pointer/tilt parallax. `level` (0–1) lets the world "wake up" after entering.
 */
export default function AmbientCanvas({ level }: { level: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  levelRef.current = level;

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduced = prefersReducedMotion();
    const mobile = isCoarsePointer();
    let w = 0, h = 0;
    let raf = 0;
    let shown = 0;
    const par = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = pixelRatio();
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const flyCount = reduced ? 14 : mobile ? 26 : 48;
    const flies: Fly[] = Array.from({ length: flyCount }, () => ({
      x: Math.random(), y: Math.random(), r: 8 + Math.random() * 16,
      ph: Math.random() * 10, sp: 0.2 + Math.random() * 0.5, depth: 0.3 + Math.random() * 0.9,
      c: (Math.random() * GLOW_COLORS.length) | 0,
    }));
    const petalCount = reduced ? 0 : mobile ? 7 : 14;
    const petals: Petal[] = Array.from({ length: petalCount }, () => newPetal(true));
    function newPetal(anywhere = false): Petal {
      return {
        x: Math.random() * window.innerWidth, y: anywhere ? Math.random() * window.innerHeight : -30,
        vy: 18 + Math.random() * 26, sway: 20 + Math.random() * 40, ph: Math.random() * 6,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 1.2, size: 10 + Math.random() * 10,
        color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      };
    }
    const glows = GLOW_COLORS.map((c) => glow(c));

    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      shown += (levelRef.current - shown) * Math.min(1, dt * 1.2);
      par.x += (par.tx - par.x) * dt * 2;
      par.y += (par.ty - par.y) * dt * 2;
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;

      const visibleFlies = Math.round(flyCount * (0.35 + 0.65 * shown));
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < visibleFlies; i++) {
        const f = flies[i];
        if (!reduced) {
          f.x += Math.cos(time * f.sp + f.ph) * 0.00025 * f.depth;
          f.y += Math.sin(time * f.sp * 0.8 + f.ph) * 0.00022 * f.depth - 0.00006;
          if (f.y < -0.05) f.y = 1.05;
          if (f.x < -0.05) f.x = 1.05;
          if (f.x > 1.05) f.x = -0.05;
        }
        const tw = 0.45 + 0.55 * Math.sin(time * 1.6 * f.sp + f.ph * 3) ** 2;
        ctx.globalAlpha = tw * (0.5 + 0.5 * shown) * (i / visibleFlies > 0.35 ? shown : 1);
        const x = f.x * w + par.x * 24 * f.depth;
        const y = f.y * h + par.y * 24 * f.depth;
        ctx.drawImage(glows[f.c], x - f.r / 2, y - f.r / 2, f.r, f.r);
      }
      ctx.globalCompositeOperation = "source-over";

      ctx.globalAlpha = 0.75 * shown;
      if (shown > 0.02) {
        for (const p of petals) {
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          const x = p.x + Math.sin(time * 0.8 + p.ph) * p.sway + par.x * 40;
          if (p.y > h + 30) Object.assign(p, newPetal());
          ctx.save();
          ctx.translate(x, p.y + par.y * 30);
          ctx.rotate(p.rot);
          ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.sin(time + p.ph)));
          ctx.drawImage(petal(p.color), -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };

    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVis = () => (document.hidden ? stop() : start());
    const onMove = (e: PointerEvent) => {
      par.tx = e.clientX / w - 0.5;
      par.ty = e.clientY / h - 0.5;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      par.tx = Math.max(-0.5, Math.min(0.5, e.gamma / 60));
      par.ty = Math.max(-0.5, Math.min(0.5, (e.beta - 40) / 60));
    };

    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("deviceorientation", onTilt, { passive: true });
    }
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return <canvas ref={ref} className="ambient-canvas" aria-hidden="true" />;
}
