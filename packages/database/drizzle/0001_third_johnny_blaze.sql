CREATE TABLE "credit_transactions" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"balance_after" integer NOT NULL,
	"metadata" jsonb NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "heroes_list" (
	"id" integer PRIMARY KEY NOT NULL,
	"url_name" text NOT NULL,
	"display_name" text NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "heroes_list" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text,
	"name" text NOT NULL,
	"imageUrl" text NOT NULL,
	"email" text NOT NULL,
	"tier" text NOT NULL,
	"credits_remaining" integer NOT NULL,
	"credits_total" integer NOT NULL,
	"credits_reset_at" bigint NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "creditTransactionsTable:user_id" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ml_heroes_list_table_idx" ON "heroes_list" USING btree ("id");--> statement-breakpoint
CREATE INDEX "usersTable:id" ON "users" USING btree ("id");