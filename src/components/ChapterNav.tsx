import { motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { content } from "../content";
import { triggerEgg } from "../lib/world";

export const CHAPTERS = ["Hello", "The Echoes", "A Question"];

interface Props {
  current: number;
  unlocked: boolean;
  onGo: (i: number) => void;
}

/** Top bar: wordmark (with the secret moon), chapter progress and the chat link. */
export default function ChapterNav({ current, unlocked, onGo }: Props) {
  const taps = useRef<number[]>([]);

  const tapMoon = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2500), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      triggerEgg();
    }
  };

  return (
    <header className="topbar">
      <div className="brand">
        <motion.button
          className="moon"
          onClick={tapMoon}
          whileTap={{ scale: 0.8, rotate: -20 }}
          aria-label="A little moon"
        />
        <span className="brand-name">{content.site.title}</span>
      </div>

      <nav className="chapters" aria-label="Chapters">
        <ol>
          {CHAPTERS.map((label, i) => (
            <li key={label}>
              <button
                className={`chapter ${i === current ? "is-current" : ""} ${i < current ? "is-done" : ""}`}
                onClick={() => onGo(i)}
                disabled={!unlocked && i > 0}
                aria-current={i === current ? "step" : undefined}
                aria-label={`Chapter ${i + 1}: ${label}`}
              >
                <span className="chapter-dot" />
                <span className="chapter-label">{label}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="chapter-track" aria-hidden="true">
          <motion.span
            className="chapter-fill"
            animate={{ scaleX: current / (CHAPTERS.length - 1) }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </nav>

      <Link className={`corner-link ${unlocked ? "" : "is-hidden"}`} to="/corner" tabIndex={unlocked ? 0 : -1} aria-label="Open Our Little Corner chat">
        <span aria-hidden="true">💌</span>
        <span className="corner-link-text">Our Little Corner</span>
      </Link>
    </header>
  );
}
