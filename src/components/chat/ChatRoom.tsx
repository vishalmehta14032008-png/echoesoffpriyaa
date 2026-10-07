import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import Butterfly from "../Butterfly";
import { content } from "../../content";
import { fx } from "../../fx/fx";
import { ChatError, chatApi, type ChatMessage, type Session } from "../../lib/chatApi";
import { dayLabel, lastSeenLabel, timeOf } from "./format";

const POLL_VISIBLE = 2500;
const POLL_HIDDEN = 12000;
const MAX_LEN = 2000;

interface Props {
  session: Session;
  onLeave: () => void;
  onRename: (name: string) => void;
}

export default function ChatRoom({ session, onLeave, onRename }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherSeen, setOtherSeen] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [draft, setDraft] = useState("");
  const [menu, setMenu] = useState(false);
  const lastId = useRef(0);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const stick = useRef(true);
  const lastTyping = useRef(0);
  const leaveRef = useRef(onLeave);
  leaveRef.current = onLeave;

  const other = session.role === "priya" ? "owner" : "priya";
  const otherName =
    [...messages].reverse().find((m) => m.authorRole === other)?.authorName ?? (other === "priya" ? content.her : content.me);

  const merge = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    lastId.current = Math.max(lastId.current, ...incoming.map((m) => m.id));
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !ids.has(m.id));
      // drop optimistic copies that the server already has
      const pendingLeft = prev.filter(
        (m) => !(m.pending === "sending" && fresh.some((f) => f.authorRole === m.authorRole && f.body === m.body)),
      );
      return [...pendingLeft, ...fresh].sort(
        (a, b) => (a.pending ? 1 : 0) - (b.pending ? 1 : 0) || (a.pending ? a.createdAt.localeCompare(b.createdAt) : a.id - b.id),
      );
    });
  }, []);

  // Polling loop — gentle on battery: slows down when the tab is hidden.
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const tick = async () => {
      try {
        const snap = await chatApi.poll(session, lastId.current);
        if (!alive) return;
        merge(snap.messages);
        setOtherTyping(snap.otherTyping);
        setOtherSeen(snap.otherLastSeen);
        setOffline(false);
        setLoaded(true);
      } catch (e) {
        if (!alive) return;
        if (e instanceof ChatError && (e.kind === "unauthorized" || e.kind === "invalid_code")) return leaveRef.current();
        setOffline(true);
        setLoaded(true);
      }
      timer = window.setTimeout(tick, document.hidden ? POLL_HIDDEN : POLL_VISIBLE);
    };
    void tick();
    const onVis = () => {
      if (!document.hidden) {
        window.clearTimeout(timer);
        void tick();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [session, merge]);

  // Keep pinned to the newest message unless she has scrolled up to reread.
  useLayoutEffect(() => {
    const el = list.current;
    if (el && stick.current) el.scrollTo({ top: el.scrollHeight, behavior: loaded ? "smooth" : "auto" });
  }, [messages, otherTyping, loaded]);

  const onScroll = () => {
    const el = list.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const autosize = () => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const onDraft = (v: string) => {
    setDraft(v.slice(0, MAX_LEN));
    const now = Date.now();
    if (v.trim() && now - lastTyping.current > 2500) {
      lastTyping.current = now;
      chatApi.typing(session).catch(() => undefined);
    }
  };

  const deliver = async (temp: ChatMessage) => {
    try {
      const saved = await chatApi.send(session, temp.body);
      lastId.current = Math.max(lastId.current, saved.id);
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== temp.id);
        return without.some((m) => m.id === saved.id) ? without : [...without.filter((m) => !m.pending), saved, ...without.filter((m) => m.pending)];
      });
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? { ...m, pending: "failed" } : m)));
    }
  };

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    const temp: ChatMessage = {
      id: -Date.now(),
      authorRole: session.role,
      authorName: session.name,
      body,
      createdAt: new Date().toISOString(),
      pending: "sending",
    };
    stick.current = true;
    setMessages((m) => [...m, temp]);
    setDraft("");
    requestAnimationFrame(autosize);
    lastTyping.current = 0;
    if (/(❤|♥|💗|💖|💕|love|🥰|😘)/i.test(body)) {
      const r = input.current?.getBoundingClientRect();
      if (r) fx.burst({ x: r.right - 30, y: r.top, count: 14, power: 0.6, kinds: ["heart"] });
    }
    void deliver(temp);
    input.current?.focus();
  };

  const retry = (m: ChatMessage) => {
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, pending: "sending" } : x)));
    void deliver({ ...m, pending: "sending" });
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const rename = () => {
    const n = window.prompt("What should the chat call you?", session.name);
    if (n && n.trim()) onRename(n.trim().slice(0, 40));
    setMenu(false);
  };

  const status = otherTyping ? "typing…" : lastSeenLabel(otherSeen);

  return (
    <main className="chat">
      <header className="chat-head glass">
        <Link to="/" className="icon-btn" aria-label="Back to the story">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <div className={`avatar avatar-${other}`} aria-hidden="true">
          {other === "priya" ? "🌸" : "🦋"}
          <span className={`presence ${status === "here now" || otherTyping ? "on" : ""}`} />
        </div>
        <div className="chat-who">
          <strong>{otherName}</strong>
          <span className={`chat-status ${otherTyping ? "is-typing" : ""}`}>{status}</span>
        </div>
        <div className="chat-menu">
          <button className="icon-btn" onClick={() => setMenu((m) => !m)} aria-label="Chat options" aria-expanded={menu}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div className="menu glass" initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }}>
                <p className="menu-note">You're here as <strong>{session.name}</strong></p>
                <button onClick={rename}>Change my name</button>
                <button onClick={onLeave}>Leave this device</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="chat-title">
        <h1 className="display">{content.corner.title} <span aria-hidden="true">💌</span></h1>
        {offline && <span className="offline-pill">reconnecting…</span>}
      </div>

      <div className="chat-list" ref={list} onScroll={onScroll} role="log" aria-live="polite" aria-label="Messages">
        {!loaded ? (
          <div className="skeletons" aria-label="Loading messages">
            {[62, 40, 75, 50].map((w, i) => (
              <span key={i} className={`skeleton ${i % 2 ? "mine" : ""}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <motion.div className="chat-empty" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="empty-art">
              <Butterfly size={64} tone="rose" flap={0.5} className="empty-bfly" />
              <span className="empty-ring" />
            </div>
            <p className="display">{content.corner.empty}</p>
            <small>Everything written here stays between the two of you.</small>
          </motion.div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const newDay = !prev || dayLabel(prev.createdAt) !== dayLabel(m.createdAt);
            const mine = m.authorRole === session.role;
            const groupedTop = prev && !newDay && prev.authorRole === m.authorRole;
            const groupedBottom = next && next.authorRole === m.authorRole && dayLabel(next.createdAt) === dayLabel(m.createdAt);
            return (
              <div key={m.id} className="msg-row-wrap">
                {newDay && <div className="day-sep"><span>{dayLabel(m.createdAt)}</span></div>}
                <motion.div
                  className={`msg-row ${mine ? "mine" : "theirs"} role-${m.authorRole} ${groupedTop ? "g-top" : ""} ${groupedBottom ? "g-bottom" : ""}`}
                  initial={{ opacity: 0, y: 14, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <div className={`bubble ${m.pending ? `is-${m.pending}` : ""}`}>
                    {!mine && !groupedTop && <span className="bubble-name">{m.authorName}</span>}
                    <p>{m.body}</p>
                    <span className="bubble-meta">
                      {timeOf(m.createdAt)}
                      {mine && <span className="tick" aria-label={m.pending === "sending" ? "sending" : m.pending === "failed" ? "not sent" : "sent"}>{m.pending === "sending" ? "◌" : m.pending === "failed" ? "!" : "♡"}</span>}
                    </span>
                  </div>
                  {m.pending === "failed" && (
                    <button className="retry" onClick={() => retry(m)}>
                      Couldn't send · tap to retry
                    </button>
                  )}
                </motion.div>
              </div>
            );
          })
        )}

        <AnimatePresence>
          {otherTyping && (
            <motion.div
              className="msg-row theirs typing-row"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bubble typing" aria-label={`${otherName} is typing`}>
                <i /><i /><i />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        className="composer glass"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="sr-only" htmlFor="chat-input">Message</label>
        <textarea
          id="chat-input"
          ref={input}
          rows={1}
          value={draft}
          placeholder={content.corner.placeholder}
          onChange={(e) => {
            onDraft(e.target.value);
            autosize();
          }}
          onKeyDown={onKey}
          enterKeyHint="send"
          maxLength={MAX_LEN}
        />
        <motion.button
          type="submit"
          className="send"
          disabled={!draft.trim()}
          whileTap={{ scale: 0.86, rotate: -12 }}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12l15-7-5 15-2.5-6.2L4 12z" strokeLinejoin="round" /></svg>
        </motion.button>
      </form>
    </main>
  );
}
