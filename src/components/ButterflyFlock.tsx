import { motion } from "framer-motion";
import { useMemo } from "react";
import Butterfly, { type ButterflyTone } from "./Butterfly";

const TONES: ButterflyTone[] = ["rose", "lilac", "pearl", "peach"];

/** A flock that sweeps across the screen once — used for the big moments. */
export default function ButterflyFlock({ count = 12, onDone }: { count?: number; onDone?: () => void }) {
  const birds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        tone: TONES[i % TONES.length],
        size: 22 + Math.random() * 30,
        startY: 55 + Math.random() * 50,
        endY: -20 - Math.random() * 30,
        midX: 20 + Math.random() * 60,
        wiggle: (Math.random() - 0.5) * 30,
        delay: Math.random() * 0.9,
        dur: 2.6 + Math.random() * 1.6,
      })),
    [count],
  );
  const lastIdx = birds.reduce((m, b, i) => (b.delay + b.dur > birds[m].delay + birds[m].dur ? i : m), 0);

  return (
    <div className="flock" aria-hidden="true">
      {birds.map((b, i) => (
        <motion.div
          key={i}
          className="flock-bird"
          initial={{ x: "-12vw", y: `${b.startY}vh`, rotate: 18, opacity: 0 }}
          animate={{
            x: ["-12vw", `${b.midX}vw`, "112vw"],
            y: [`${b.startY}vh`, `${b.startY / 2 + b.wiggle}vh`, `${b.endY}vh`],
            rotate: [18, -6, 12],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: b.dur, delay: b.delay, ease: "easeInOut" }}
          onAnimationComplete={i === lastIdx ? onDone : undefined}
        >
          <Butterfly size={b.size} tone={b.tone} flap={0.18} />
        </motion.div>
      ))}
    </div>
  );
}
