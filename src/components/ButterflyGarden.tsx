import Butterfly, { type ButterflyTone } from "./Butterfly";

const DRIFTERS: { tone: ButterflyTone; size: number; top: string; left: string; dur: number; delay: number }[] = [
  { tone: "rose", size: 34, top: "18%", left: "8%", dur: 22, delay: 0 },
  { tone: "lilac", size: 26, top: "62%", left: "84%", dur: 26, delay: -6 },
  { tone: "pearl", size: 22, top: "78%", left: "14%", dur: 30, delay: -12 },
  { tone: "peach", size: 28, top: "30%", left: "78%", dur: 24, delay: -3 },
  { tone: "lilac", size: 18, top: "48%", left: "42%", dur: 34, delay: -18 },
];

/** A few butterflies lazily wandering around the background. */
export default function ButterflyGarden({ count = 5 }: { count?: number }) {
  return (
    <div className="garden" aria-hidden="true">
      {DRIFTERS.slice(0, count).map((d, i) => (
        <div
          key={i}
          className={`drifter drifter-${i % 3}`}
          style={{ top: d.top, left: d.left, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }}
        >
          <Butterfly size={d.size} tone={d.tone} flap={0.28 + (i % 3) * 0.06} />
        </div>
      ))}
    </div>
  );
}
