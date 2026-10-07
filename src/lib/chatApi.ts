export type Role = "priya" | "owner";

export interface ChatMessage {
  id: number;
  authorRole: Role;
  authorName: string;
  body: string;
  createdAt: string;
  /** client-only: optimistic message state */
  pending?: "sending" | "failed";
}

export interface Session {
  code: string;
  role: Role;
  name: string;
}

export interface Snapshot {
  role: Role;
  messages: ChatMessage[];
  otherTyping: boolean;
  otherLastSeen: string | null;
}

export class ChatError extends Error {
  constructor(public kind: "invalid_code" | "unauthorized" | "not_configured" | "network" | "rejected") {
    super(kind);
  }
}

const STORE = "echoes:corner";

export const loadSession = (): Session | null => {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? "null");
  } catch {
    return null;
  }
};
export const saveSession = (s: Session) => localStorage.setItem(STORE, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(STORE);

async function call<T>(path: string, init: RequestInit = {}, code?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/chat/${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(code ? { Authorization: `Bearer ${code}` } : {}),
      },
    });
  } catch {
    throw new ChatError("network");
  }
  if (res.status === 503) throw new ChatError("not_configured");
  if (res.status === 401) {
    const data = await res.json().catch(() => ({}));
    throw new ChatError(data.error === "invalid_code" ? "invalid_code" : "unauthorized");
  }
  if (!res.ok) throw new ChatError(res.status >= 500 ? "network" : "rejected");
  return res.json() as Promise<T>;
}

export const chatApi = {
  verify: (code: string) => call<{ role: Role }>("session", { method: "POST", body: JSON.stringify({ code }) }),
  poll: (s: Session, after: number) => call<Snapshot>(`messages?after=${after}`, {}, s.code),
  send: (s: Session, body: string) =>
    call<ChatMessage>("messages", { method: "POST", body: JSON.stringify({ body, name: s.name }) }, s.code),
  typing: (s: Session) => call<{ ok: true }>("typing", { method: "POST" }, s.code),
};
