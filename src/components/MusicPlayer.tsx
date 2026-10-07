import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { content } from "../content";
import { useMusic } from "../music/MusicContext";

const STATUS = { idle: "Tap to play", loading: "Tuning in…", playing: "Now playing", paused: "Paused" };

/** Small corner player: play/pause, volume, live status. */
export default function MusicPlayer({ placement = "bottom" }: { placement?: "bottom" | "top" }) {
  const { status, source, volume, toggle, setVolume } = useMusic();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const playing = status === "playing";

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  const title = source === "musicbox" ? content.music.fallbackTitle : content.music.title;

  return (
    <div ref={wrap} className={`player player-${placement} ${open ? "is-open" : ""}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            className="player-panel glass"
            initial={{ opacity: 0, y: placement === "bottom" ? 10 : -10, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: placement === "bottom" ? 8 : -8, scale: 0.97, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="player-meta">
              <span className="player-status">
                <span className={`dot ${playing ? "on" : ""}`} /> {STATUS[status]}
              </span>
              <strong className="player-title">{title}</strong>
              {source !== "musicbox" ? (
                <span className="player-artist">{content.music.artist}</span>
              ) : (
                <span className="player-artist">placeholder melody</span>
              )}
            </div>
            <div className="player-controls">
              <button className="player-btn" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
                {playing ? (
                  <svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
                )}
              </button>
              <label className="player-volume">
                <span className="sr-only">Volume</span>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9.5h3l4.5-4v13L7 14.5H4z" /><path d="M15 9a4 4 0 0 1 0 6" fill="none" strokeWidth="1.8" strokeLinecap="round" /></svg>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{ ["--v" as string]: `${volume * 100}%` }}
                  aria-label="Volume"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className={`player-fab glass ${playing ? "is-playing" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Music: ${STATUS[status]}. Open music controls`}
      >
        <span className="bars" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      </button>
    </div>
  );
}
