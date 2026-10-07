import { useEffect, useRef } from "react";
import { fx, isCoarsePointer, pixelRatio, prefersReducedMotion, type BurstOptions, type FxKind } from "./fx";
import { FLOWER_COLORS, GLOW_COLORS, HEART_COLORS, flower, glow, heart } from "./sprites";

interface P {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; size: number;
  life: number; max: number; g: number; drag: number;
  img: HTMLCanvasElement; additive: boolean;
}

const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

function sprite(kind: FxKind) {
  if (kind === "heart") return heart(pick(HEART_COLORS));
  if (kind === "flower") return flower(pick(FLOWER_COLORS));
  return glow(pick(GLOW_COLORS));
}

/** Foreground effects: click bursts, heart/flower confetti and the desktop cursor trail. */
export default function FxCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduced = prefersReducedMotion();
    let w = 0, h = 0, dpr = 1;
    const ps: P[] = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      dpr = pixelRatio();
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        if (p.life >= p.max || p.y > h + 60) { ps.splice(i, 1); continue; }
        p.vx *= 1 - p.drag * dt;
        p.vy = p.vy * (1 - p.drag * dt) + p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        const k = p.life / p.max;
        ctx.globalAlpha = k < 0.1 ? k * 10 : k > 0.7 ? (1 - k) / 0.3 : 1;
        ctx.globalCompositeOperation = p.additive ? "lighter" : "source-over";
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = ps.length ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    };

    const burst = ({ x, y, count = 24, power = 1, kinds = ["heart", "flower", "spark"], rain }: BurstOptions) => {
      const n = Math.round(reduced ? Math.min(count, 10) : isCoarsePointer() ? count * 0.7 : count);
      for (let i = 0; i < n; i++) {
        const kind = pick(kinds);
        const a = Math.random() * Math.PI * 2;
        const s = (120 + Math.random() * 320) * power;
        ps.push(
          rain
            ? {
                x: Math.random() * w, y: -40 - Math.random() * h * 0.6,
                vx: (Math.random() - 0.5) * 40, vy: 60 + Math.random() * 90,
                rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3,
                size: 12 + Math.random() * 16, life: 0, max: 4 + Math.random() * 3,
                g: 20, drag: 0.2, img: sprite(kind), additive: kind === "spark",
              }
            : {
                x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 140 * power,
                rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8,
                size: kind === "spark" ? 14 + Math.random() * 18 : 10 + Math.random() * 16,
                life: 0, max: 1.3 + Math.random() * 1.2,
                g: 380, drag: 2.2, img: sprite(kind), additive: kind === "spark",
              },
        );
      }
      kick();
    };
    const off = fx.on(burst);

    // Desktop-only cursor trail: soft glows with the occasional tiny flower.
    let lastTrail = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduced) return;
      const now = performance.now();
      if (now - lastTrail < 38) return;
      lastTrail = now;
      const isFlower = Math.random() < 0.14;
      ps.push({
        x: e.clientX + (Math.random() - 0.5) * 6, y: e.clientY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 18, vy: -14 - Math.random() * 18,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 2,
        size: isFlower ? 9 : 10 + Math.random() * 10, life: 0, max: 0.9 + Math.random() * 0.5,
        g: isFlower ? 30 : -6, drag: 0.6, img: isFlower ? flower(pick(FLOWER_COLORS)) : glow(pick(GLOW_COLORS)),
        additive: !isFlower,
      });
      kick();
    };
    if (!isCoarsePointer()) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}
