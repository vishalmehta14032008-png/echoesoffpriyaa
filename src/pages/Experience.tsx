import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import ChapterNav, { CHAPTERS } from "../components/ChapterNav";
import ButterflyFlock from "../components/ButterflyFlock";
import { useMusic } from "../music/MusicContext";
import { useWorld } from "../lib/world";
import Intro from "../slides/Intro";
import Echoes from "../slides/Echoes";
import Proposal from "../slides/Proposal";

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 70, scale: 0.97, filter: "blur(14px)" }),
  center: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ opacity: 0, x: dir * -70, scale: 1.02, filter: "blur(14px)" }),
};

export default function Experience() {
  const { entered, setEntered } = useWorld();
  const music = useMusic();
  const [slide, setSlide] = useState(() => (entered ? Number(sessionStorage.getItem("echoes:slide") ?? 1) || 0 : 0));
  const [dir, setDir] = useState(1);
  const [flocks, setFlocks] = useState<number[]>([]);
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);

  const go = useCallback(
    (n: number) => {
      if (n < 0 || n >= CHAPTERS.length || n === slide) return;
      if (n > 0 && !entered) return;
      setDir(n > slide ? 1 : -1);
      setSlide(n);
      sessionStorage.setItem("echoes:slide", String(n));
    },
    [slide, entered],
  );

  const flutter = useCallback(() => setFlocks((f) => [...f, Date.now()]), []);

  const enter = () => {
    music.start();
    flutter();
    setEntered(true);
    window.setTimeout(() => {
      setDir(1);
      setSlide(1);
      sessionStorage.setItem("echoes:slide", "1");
    }, 1100);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [role=dialog]")) return;
      if (e.key === "ArrowRight") go(slide + 1);
      if (e.key === "ArrowLeft") go(slide - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slide]);

  // Horizontal swipe between chapters; vertical scrolling inside a chapter is untouched.
  const onTouchStart = (e: TouchEvent) => {
    if ((e.target as HTMLElement).closest("input, textarea, [data-noswipe]")) return;
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - start.t < 800) {
      go(slide + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <div className={`experience ${slide === 2 ? "is-dusk" : ""}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <motion.div
        className="dusk"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: slide === 2 ? 1 : 0 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <ChapterNav current={slide} unlocked={entered} onGo={go} />

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.main
          key={slide}
          className={`slide slide-${slide}`}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {slide === 0 && <Intro onEnter={enter} entered={entered} onContinue={() => go(1)} />}
          {slide === 1 && <Echoes onNext={() => go(2)} />}
          {slide === 2 && <Proposal onCelebrate={flutter} />}
        </motion.main>
      </AnimatePresence>

      {flocks.map((k) => (
        <ButterflyFlock key={k} count={14} onDone={() => setFlocks((f) => f.filter((x) => x !== k))} />
      ))}
    </div>
  );
}
