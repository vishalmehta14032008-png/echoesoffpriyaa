import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

// Every message in "Our Little Corner". `author_role` is decided by the server
// from the access code — never trusted from the client.
export const messages = pgTable(
  "messages",
  {
    id: serial().primaryKey(),
    authorRole: text("author_role").notNull(), // "priya" | "owner"
    authorName: text("author_name").notNull(),
    body: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("messages_created_at_idx").on(t.createdAt)],
);

// One row per person: powers the typing indicator and "last seen".
export const presence = pgTable("presence", {
  role: text().primaryKey(),
  typingAt: timestamp("typing_at", { withTimezone: true }),
  lastSeen: timestamp("last_seen", { withTimezone: true }),
});
