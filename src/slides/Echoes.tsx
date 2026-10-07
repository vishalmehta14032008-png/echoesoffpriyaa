import { motion } from "framer-motion";
import { useState, type MouseEvent } from "react";
import Butterfly, { type ButterflyTone } from "../components/Butterfly";
import { content } from "../content";
import { fx } from "../fx/fx";

const ease = [0.22, 1, 0.36, 1] as const;
const TONES: ButterflyTone[] = ["rose", "lilac", "peach", "pearl"];

function NoteCard({ i, icon, label, note, onOpen }: { i: number; icon: string; label: string; note: string; onOpen: () => void }) {
  const [open, setOpen] = useState(false);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      fx.burst({ x: e.clientX || e.currentTarget.getBoundingClientRect().left + 80, y: e.clientY || e.currentTarget.getBoundingClientRect().top + 40, count: 16, power: 0.7, kinds: ["heart", "spark"] });
      onOpen();
    }
    setOpen((o) => !o);
  };

  return (
    <motion.li
      className="note-wrap"
      initial={{ opacity: 0, y: 40, scale: 0.92, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: 0.15 + i * 0.32, duration: 0.9, ease }}
      style={{ ["--tilt" as string]: `${[-1.6, 1.2, -0.8, 1.8][i % 4]}deg` }}
    >
      <button className={`note ${open ? "is-open" : ""}`} onClick={toggle} aria-expanded={open} aria-label={open ? `${label} ${note}` : `Open note: ${label}`}>
        <span className="note-perch" aria-hidden="true">
          <Butterfly size={26} tone={TONES[i % TONES.length]} flap={0.5 + i * 0.07} />
        </span>
        <motion.span
          className="note-inner"
          animate={{ rotateY: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
        >
          <span className="note-face note-front">
            <span className="note-icon" aria-hidden="true">{icon}</span>
            <span className="note-label">{label}</span>
            <span className="note-tap">tap to open</span>
          </span>
          <span className="note-face note-back">
            <span className="note-text">{note}</span>
            <span className="note-heart" aria-hidden="true">♡</span>
          </span>
        </motion.span>
      </button>
    </motion.li>
  );
}

export default function Echoes({ onNext }: { onNext: () => void }) {
  const { eyebrow, title, story, cards, cardsHint, outro, next } = content.echoes;
  const [opened, setOpened] = useState<Set<number>>(new Set());

  return (
    <section className="echoes" aria-labelledby="echoes-title">
      <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {eyebrow}
      </motion.p>
      <motion.h2
        id="echoes-title"
        className="display section-title"
        initial={{ opacity: 0, y: 20, letterSpacing: "0.2em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
        transition={{ delay: 0.4, duration: 1.4, ease }}
      >
        {title}
      </motion.h2>

      <div className="story">
        {story.map((line, i) => (
          <motion.p
            key={i}
            className={i < 2 ? "story-line story-soft" : "story-line"}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 + i * 0.55, duration: 1.2, ease }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <div className="notes-head">
        <span className="rule" />
        <span className="handwritten">{cardsHint}</span>
        <span className="rule" />
      </div>

      <ul className="notes">
        {cards.map((c, i) => (
          <NoteCard key={c.label} i={i} {...c} onOpen={() => setOpened((s) => new Set(s).add(i))} />
        ))}
      </ul>

      <p className="notes-count" aria-live="polite">
        {opened.size === 0 ? " " : opened.size === cards.length ? "all of them — you read every little note ♡" : `${opened.size} of ${cards.length} opened`}
      </p>

      <motion.div
        className="echoes-outro"
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 1.2, ease, delay: 0.3 }}
      >
        <p className="display outro-line">{outro}</p>
          <motion.button
            className="btn btn-primary"
            onClick={onNext}
            whileHover={{ scale: 1.04, x: 3 }}
            whileTap={{ scale: 0.96 }}
          >
            {next} <span className="arrow" aria-hidden="true">→</span>
          </motion.button>
        <p className="hint swipe-hint">or swipe ←</p>
      </motion.div>
    </section>
  );
}
