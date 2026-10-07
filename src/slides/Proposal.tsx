import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Butterfly from "../components/Butterfly";
import { content } from "../content";
import { fx } from "../fx/fx";

const ease = [0.22, 1, 0.36, 1] as const;
type Answer = "yes" | "think" | null;

export default function Proposal({ onCelebrate }: { onCelebrate: () => void }) {
  const p = content.proposal;
  const reduced = useReducedMotion();
  // stage: 0 name, 1..n message lines, n+1 lead, n+2 question revealed
  const total = p.message.length;
  const [stage, setStage] = useState(reduced ? total + 1 : 0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState<Answer>(() => (localStorage.getItem("echoes:answer") as Answer) || null);
  const [glow, setGlow] = useState(0);
  const yesRef = useRef<HTMLButtonElement>(null);
  const thinkRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (stage > total) return;
    const t = window.setTimeout(() => setStage((s) => s + 1), stage === 0 ? 1600 : 2300);
    return () => window.clearTimeout(t);
  }, [stage, total]);

  useEffect(() => {
    if (answer) setRevealed(true);
  }, [answer]);

  const sayYes = () => {
    fx.burstFrom(yesRef.current, { count: 60, power: 1.4 });
    window.setTimeout(() => fx.rain(90), 250);
    onCelebrate();
    setGlow((g) => g + 1);
    setAnswer("yes");
    localStorage.setItem("echoes:answer", "yes");
  };

  const think = () => {
    fx.burstFrom(thinkRef.current, { count: 12, power: 0.6, kinds: ["flower"] });
    setAnswer("think");
    localStorage.setItem("echoes:answer", "think");
  };

  const skipAhead = () => stage <= total && setStage(total + 1);

  return (
    <section className="proposal" aria-labelledby="proposal-title" onClick={skipAhead}>
      <span className="proposal-moon" aria-hidden="true" />

      {createPortal(
      <AnimatePresence>
        {glow > 0 && (
          <motion.span
            key={glow}
            className="screen-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.35] }}
            transition={{ duration: 2.2, times: [0, 0.25, 1] }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>,
      document.body,
      )}

      <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {p.eyebrow}
      </motion.p>

      <motion.h2
        id="proposal-title"
        className="display proposal-name"
        initial={{ opacity: 0, scale: 0.9, filter: "blur(16px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease }}
      >
        {p.name}
      </motion.h2>

      <div className="proposal-message" aria-live="polite">
        {p.message.map((line, i) =>
          stage > i ? (
            <motion.p
              key={i}
              className={i === total - 1 ? "confession" : "proposal-line"}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.4, ease }}
            >
              {line}
            </motion.p>
          ) : null,
        )}
      </div>

      <AnimatePresence>
        {stage > total && (
          <motion.div
            className="proposal-ask"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease }}
          >
            <p className="lead-in">{p.lead}</p>

            {!revealed ? (
              <motion.button
                className="btn btn-ghost reveal-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(true);
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
              >
                <Butterfly size={22} tone="rose" /> {p.reveal}
              </motion.button>
            ) : (
              <motion.div className="question-card glass" initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.1, ease }}>
                <span className="question-bfly" aria-hidden="true">
                  <Butterfly size={34} tone="lilac" flap={0.4} />
                </span>
                <h3 className="display question">
                  {p.question.split(" ").map((w, i) => (
                    <motion.span
                      key={i}
                      className="word"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.12, duration: 0.8, ease }}
                    >
                      {w}&nbsp;
                    </motion.span>
                  ))}
                </h3>

                <AnimatePresence mode="wait">
                  {answer !== "yes" && (
                    <motion.div
                      key="choices"
                      className="choices"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
                      transition={{ delay: answer ? 0 : 1.3, duration: 0.7 }}
                    >
                      <motion.button
                        ref={yesRef}
                        className="btn btn-primary choice"
                        onClick={(e) => {
                          e.stopPropagation();
                          sayYes();
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.94 }}
                      >
                        <span aria-hidden="true">💗</span> {answer === "think" ? p.changeMind.replace(" 💗", "") : p.yes}
                      </motion.button>
                      {answer !== "think" && (
                        <motion.button
                          ref={thinkRef}
                          className="btn btn-soft choice"
                          onClick={(e) => {
                            e.stopPropagation();
                            think();
                          }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.94 }}
                        >
                          <span aria-hidden="true">🌸</span> {p.think}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {answer && (
                    <motion.div
                      key={answer}
                      className={`answer answer-${answer}`}
                      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.9, ease, delay: answer === "yes" ? 0.4 : 0.1 }}
                    >
                      {answer === "yes" && (
                        <div className="answer-hearts" aria-hidden="true">
                          {[0, 1, 2].map((i) => (
                            <motion.span key={i} animate={{ y: [0, -8, 0], scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}>
                              ♡
                            </motion.span>
                          ))}
                        </div>
                      )}
                      <h4 className="display answer-title">{answer === "yes" ? p.yesTitle : p.thinkTitle}</h4>
                      <p className="answer-text">{answer === "yes" ? p.yesMessage : p.thinkMessage}</p>
                      <Link className="btn btn-ghost" to="/corner" onClick={(e) => e.stopPropagation()}>
                        {p.toCorner}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {stage <= total && (
        <motion.p className="hint tap-hint" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 3 }}>
          tap anywhere to read faster
        </motion.p>
      )}
    </section>
  );
}
