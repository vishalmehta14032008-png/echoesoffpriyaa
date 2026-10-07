CREATE TABLE "messages" (
	"id" serial PRIMARY KEY,
	"author_role" text NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presence" (
	"role" text PRIMARY KEY,
	"typing_at" timestamp with time zone,
	"last_seen" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" ("created_at");