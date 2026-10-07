import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Butterfly from "../components/Butterfly";
import Modal from "../components/Modal";
import { content } from "../content";
import { fx } from "../fx/fx";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Intro({ onEnter, entered, onContinue }: { onEnter: () => void; entered: boolean; onContinue: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  const secretRef = useRef<HTMLButtonElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [secret, setSecret] = useState(false);
  const { greeting, lines, cta, soundHint } = content.intro;
  const words = greeting.split(" ");

  const handleEnter = () => {
    if (entered) return onContinue();
    setLeaving(true);
    fx.burstFrom(btn.current, { count: 34, power: 1.1 });
    onEnter();
  };

  const findSecret = () => {
    fx.burstFrom(secretRef.current, { count: 22, kinds: ["spark", "flower"] });
    setSecret(true);
  };

  return (
    <section className="intro" aria-labelledby="intro-title">
      <motion.div
        className="hero-butterfly"
        initial={{ opacity: 0, y: 30, scale: 0.7 }}
        animate={leaving ? { opacity: 0, y: -260, x: 140, scale: 0.6, rotate: 18 } : { opacity: 1, y: 0, scale: 1 }}
        transition={leaving ? { duration: 1.4, ease: "easeIn" } : { duration: 1.6, ease }}
      >
        <span className="halo" />
        <Butterfly size={96} tone="rose" flap={0.45} className="hero-bfly" />
      </motion.div>

      <h1 id="intro-title" className="display intro-title">
        {words.map((w, i) => (
          <motion.span
            key={i}
            className="word"
            initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.5 + i * 0.28, duration: 1.1, ease }}
          >
            {w}&nbsp;
          </motion.span>
        ))}
        <motion.span
          className="word bloom"
          initial={{ opacity: 0, scale: 0.2, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 160, damping: 12 }}
          aria-hidden="true"
        >
          🌸
        </motion.span>
      </h1>

      <div className="intro-lines">
        {lines.map((l, i) => (
          <motion.p
            key={l}
            className="lede"
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.9 + i * 1.3, duration: 1.4, ease }}
          >
            {l}
          </motion.p>
        ))}
      </div>

      <motion.div
        className="intro-cta"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4.4, duration: 1, ease }}
      >
        <motion.button
          ref={btn}
          className="btn btn-primary btn-lg shimmer"
          onClick={handleEnter}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          disabled={leaving}
        >
          {entered ? "Step back in" : cta} <span aria-hidden="true">✨</span>
        </motion.button>
        <p className="hint">{soundHint}</p>
      </motion.div>

      {/* A tiny secret: a faint butterfly resting in the corner. */}
      <motion.button
        ref={secretRef}
        className="secret-bfly"
        onClick={findSecret}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.5, duration: 2 }}
        whileHover={{ scale: 1.25, rotate: -8 }}
        aria-label="A tiny butterfly"
      >
        <Butterfly size={22} tone="lilac" flap={0.9} />
      </motion.button>

      <Modal open={secret} onClose={() => setSecret(false)} label="A secret">
        <div className="modal-art">
          <Butterfly size={60} tone="lilac" className="modal-bfly" />
        </div>
        <h3 className="modal-title">{content.secret.title}</h3>
        <p className="modal-text">{content.secret.message}</p>
      </Modal>
    </section>
  );
}
