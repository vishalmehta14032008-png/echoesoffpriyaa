import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { content } from "../content";
import { MusicBox } from "./musicBox";

type Status = "idle" | "loading" | "playing" | "paused";
type Source = "song" | "musicbox" | null;

interface MusicState {
  status: Status;
  source: Source;
  volume: number;
  start: () => void;
  toggle: () => void;
  setVolume: (v: number) => void;
}

const MusicCtx = createContext<MusicState | null>(null);

/**
 * Lives above the router, so the song keeps playing (and never restarts)
 * while Priya moves between chapters or into the chat.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const box = useRef<MusicBox | null>(null);
  const fade = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [source, setSource] = useState<Source>(null);
  const [volume, setVol] = useState(0.6);
  const volRef = useRef(volume);
  volRef.current = volume;

  const fadeAudioTo = useCallback((target: number, ms: number, done?: () => void) => {
    const el = audio.current;
    if (!el) return;
    if (fade.current) cancelAnimationFrame(fade.current);
    const from = el.volume;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      el.volume = from + (target - from) * p;
      if (p < 1) fade.current = requestAnimationFrame(tick);
      else done?.();
    };
    fade.current = requestAnimationFrame(tick);
  }, []);

  const playMusicBox = useCallback(() => {
    if (!box.current) box.current = new MusicBox();
    box.current.play(volRef.current);
    setSource("musicbox");
    setStatus("playing");
  }, []);

  const start = useCallback(() => {
    if (status === "playing" || status === "loading") return;

    if (source === "musicbox") return playMusicBox();
    if (source === "song" && audio.current) {
      void audio.current.play().then(() => fadeAudioTo(volRef.current, 900)).catch(() => undefined);
      setStatus("playing");
      return;
    }

    // First interaction: try the real song, fall back to the music box.
    setStatus("loading");
    const el = new Audio();
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    el.src = content.music.src;
    audio.current = el;
    el.play()
      .then(() => {
        setSource("song");
        setStatus("playing");
        fadeAudioTo(volRef.current, 2600);
      })
      .catch(() => {
        audio.current = null;
        playMusicBox();
      });
  }, [status, source, playMusicBox, fadeAudioTo]);

  const toggle = useCallback(() => {
    if (status !== "playing") return start();
    setStatus("paused");
    if (source === "song" && audio.current) {
      const el = audio.current;
      fadeAudioTo(0, 450, () => el.pause());
    } else box.current?.pause();
  }, [status, source, start, fadeAudioTo]);

  const setVolume = useCallback(
    (v: number) => {
      setVol(v);
      if (status !== "playing") return;
      if (audio.current) {
        if (fade.current) cancelAnimationFrame(fade.current);
        audio.current.volume = v;
      }
      box.current?.setVolume(v);
    },
    [status],
  );

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: source === "musicbox" ? content.music.fallbackTitle : content.music.title,
      artist: source === "musicbox" ? content.site.title : content.music.artist,
    });
  }, [source]);

  const value = useMemo(
    () => ({ status, source, volume, start, toggle, setVolume }),
    [status, source, volume, start, toggle, setVolume],
  );
  return <MusicCtx.Provider value={value}>{children}</MusicCtx.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicCtx);
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>");
  return ctx;
}
