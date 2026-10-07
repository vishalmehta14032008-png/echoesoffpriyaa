import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Butterfly from "../components/Butterfly";
import ChatRoom from "../components/chat/ChatRoom";
import { content } from "../content";
import { fx } from "../fx/fx";
import { ChatError, chatApi, clearSession, loadSession, saveSession, type Role, type Session } from "../lib/chatApi";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Corner() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [pendingRole, setPendingRole] = useState<{ code: string; role: Role } | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<ChatError["kind"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    document.title = `${content.corner.title} · ${content.site.title}`;
    return () => void (document.title = content.site.title);
  }, []);

  // Magic link support: /corner#k=SECRET logs in without typing (and strips the code from the URL).
  useEffect(() => {
    const m = window.location.hash.match(/k=([^&]+)/);
    if (!m) return;
    history.replaceState(null, "", window.location.pathname);
    void verify(decodeURIComponent(m[1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(raw: string) {
    const c = raw.trim();
    if (!c) return;
    setBusy(true);
    setError(null);
    try {
      const { role } = await chatApi.verify(c);
      setPendingRole({ code: c, role });
      setName(role === "priya" ? content.her : content.me);
    } catch (e) {
      setError(e instanceof ChatError ? e.kind : "network");
      setShake((s) => s + 1);
    } finally {
      setBusy(false);
    }
  }

  const finish = (e: FormEvent) => {
    e.preventDefault();
    if (!pendingRole) return;
    const s = { ...pendingRole, name: name.trim().slice(0, 40) || (pendingRole.role === "priya" ? content.her : content.me) };
    saveSession(s);
    setSession(s);
    fx.burst({ x: window.innerWidth / 2, y: window.innerHeight / 2, count: 30, kinds: ["heart", "flower", "spark"] });
  };

  const leave = () => {
    clearSession();
    setSession(null);
    setPendingRole(null);
    setCode("");
  };

  if (session) return <ChatRoom session={session} onLeave={leave} onRename={(n) => { const s = { ...session, name: n }; saveSession(s); setSession(s); }} />;

  return (
    <main className="gate">
      <Link to="/" className="back-link">
        ← back to the story
      </Link>
      <motion.div
        key={shake}
        className="gate-card glass"
        initial={shake ? { x: 0 } : { opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
        animate={shake ? { x: [0, -10, 9, -6, 4, 0] } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={shake ? { duration: 0.45 } : { duration: 1, ease }}
      >
        <div className="gate-art" aria-hidden="true">
          <span className="envelope">💌</span>
          <Butterfly size={30} tone="lilac" className="gate-bfly" />
        </div>
        <h1 className="display gate-title">{content.corner.title}</h1>
        <p className="gate-sub">{content.corner.subtitle}</p>

        <AnimatePresence mode="wait">
          {error === "not_configured" ? (
            <motion.div key="setup" className="gate-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>
                This corner is still being decorated. 🌷
                <br />
                <small>
                  (Site owner: add <code>PRIYA_ACCESS_CODE</code> and <code>OWNER_ACCESS_CODE</code> in your Netlify environment variables, then redeploy — see the README.)
                </small>
              </p>
            </motion.div>
          ) : !pendingRole ? (
            <motion.form
              key="code"
              className="gate-form"
              onSubmit={(e) => {
                e.preventDefault();
                void verify(code);
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            >
              <label className="field">
                <span className="field-label">{content.corner.codeLabel}</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={error === "invalid_code"}
                  aria-describedby="code-hint"
                />
              </label>
              <p id="code-hint" className={`field-hint ${error ? "is-error" : ""}`} role={error ? "alert" : undefined}>
                {error === "invalid_code"
                  ? "Hmm, that's not quite it. Try again? 🌸"
                  : error === "network"
                    ? "The butterflies couldn't reach the server. Check your connection and try again."
                    : content.corner.codeHint}
              </p>
              <motion.button className="btn btn-primary btn-block" disabled={busy || !code.trim()} whileTap={{ scale: 0.97 }}>
                {busy ? "Opening…" : "Open our corner"}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="name"
              className="gate-form"
              onSubmit={finish}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="gate-welcome">{pendingRole.role === "priya" ? "Welcome, Priya. ♡" : "Welcome back. 🦋"}</p>
              <label className="field">
                <span className="field-label">{content.corner.nameLabel}</span>
                <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoFocus />
              </label>
              <motion.button className="btn btn-primary btn-block" whileTap={{ scale: 0.97 }}>
                Step inside ✨
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
        <p className="gate-privacy">🔒 Private to the two of you · no phone numbers · no WhatsApp</p>
      </motion.div>
    </main>
  );
}
