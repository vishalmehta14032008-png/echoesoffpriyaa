import type { Config } from "@netlify/functions";
import { timingSafeEqual } from "node:crypto";
import { asc, desc, gt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { messages, presence } from "../../db/schema.js";

type Role = "priya" | "owner";

const MAX_BODY = 2000;
const MAX_NAME = 40;
const TYPING_WINDOW_MS = 6000;

// Access codes live only in Netlify environment variables — never in frontend code.
function codesConfigured() {
  return Boolean(process.env.PRIYA_ACCESS_CODE && process.env.OWNER_ACCESS_CODE);
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function roleFromCode(code: string | null | undefined): Role | null {
  if (!code) return null;
  const priya = process.env.PRIYA_ACCESS_CODE ?? "";
  const owner = process.env.OWNER_ACCESS_CODE ?? "";
  if (priya && safeEqual(code, priya)) return "priya";
  if (owner && safeEqual(code, owner)) return "owner";
  return null;
}

function roleFromRequest(req: Request): Role | null {
  const header = req.headers.get("authorization") ?? "";
  const code = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  return roleFromCode(code);
}

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function touch(role: Role, typing = false) {
  const now = new Date();
  const set = typing ? { lastSeen: now, typingAt: now } : { lastSeen: now };
  await db
    .insert(presence)
    .values({ role, ...set })
    .onConflictDoUpdate({ target: presence.role, set });
}

export default async (req: Request) => {
  if (!codesConfigured()) {
    return json({ error: "not_configured" }, 503);
  }

  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/chat\/?/, "").replace(/\/$/, "");

  // Exchange an access code for a role. The code itself is the session token.
  if (route === "session" && req.method === "POST") {
    const { code } = (await req.json().catch(() => ({}))) as { code?: string };
    const role = roleFromCode(typeof code === "string" ? code.trim() : null);
    if (!role) return json({ error: "invalid_code" }, 401);
    return json({ role });
  }

  const role = roleFromRequest(req);
  if (!role) return json({ error: "unauthorized" }, 401);

  if (route === "messages" && req.method === "GET") {
    const after = Number(url.searchParams.get("after") ?? 0) || 0;
    const rows = after
      ? await db.select().from(messages).where(gt(messages.id, after)).orderBy(asc(messages.id)).limit(200)
      : (await db.select().from(messages).orderBy(desc(messages.id)).limit(200)).reverse();

    await touch(role);
    const people = await db.select().from(presence);
    const now = Date.now();
    const other: Role = role === "priya" ? "owner" : "priya";
    const them = people.find((p) => p.role === other);

    return json({
      role,
      messages: rows,
      otherTyping: Boolean(them?.typingAt && now - them.typingAt.getTime() < TYPING_WINDOW_MS),
      otherLastSeen: them?.lastSeen ?? null,
    });
  }

  if (route === "messages" && req.method === "POST") {
    const input = (await req.json().catch(() => ({}))) as { body?: unknown; name?: unknown };
    const body = typeof input.body === "string" ? input.body.trim() : "";
    const name = typeof input.name === "string" ? input.name.trim().slice(0, MAX_NAME) : "";
    if (!body) return json({ error: "empty" }, 400);
    if (body.length > MAX_BODY) return json({ error: "too_long" }, 400);

    const [row] = await db
      .insert(messages)
      .values({ authorRole: role, authorName: name || (role === "priya" ? "Priya" : "Me"), body })
      .returning();

    await db
      .insert(presence)
      .values({ role, lastSeen: new Date(), typingAt: null })
      .onConflictDoUpdate({ target: presence.role, set: { lastSeen: new Date(), typingAt: null } });

    return json(row, 201);
  }

  if (route === "typing" && req.method === "POST") {
    await touch(role, true);
    return json({ ok: true });
  }

  return json({ error: "not_found" }, 404);
};

export const config: Config = {
  path: "/api/chat/*",
};
