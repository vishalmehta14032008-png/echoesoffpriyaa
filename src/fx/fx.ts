/** Tiny event bus so any component can trigger hearts/flowers/sparkles. */
export type FxKind = "heart" | "flower" | "spark";

export interface BurstOptions {
  x: number;
  y: number;
  count?: number;
  power?: number;
  kinds?: FxKind[];
  /** fall from above instead of exploding outward */
  rain?: boolean;
}

type Listener = (o: BurstOptions) => void;
const listeners = new Set<Listener>();

export const fx = {
  burst(o: BurstOptions) {
    listeners.forEach((l) => l(o));
  },
  /** Burst from the centre of an element (handy for button clicks). */
  burstFrom(el: Element | null, o: Omit<BurstOptions, "x" | "y"> = {}) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    fx.burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...o });
  },
  rain(count = 60, kinds: FxKind[] = ["heart", "flower"]) {
    fx.burst({ x: 0, y: 0, count, kinds, rain: true });
  },
  on(l: Listener) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export const pixelRatio = () => Math.min(window.devicePixelRatio || 1, isCoarsePointer() ? 1.5 : 2);
