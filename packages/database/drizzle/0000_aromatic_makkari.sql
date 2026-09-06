CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hero_graphs" (
	"id" integer NOT NULL,
	"name" text NOT NULL,
	"rank" text NOT NULL,
	"trend_start" text,
	"trend_end" text,
	"points" jsonb,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "hero_graphs_id_rank_pk" PRIMARY KEY("id","rank")
);
--> statement-breakpoint
ALTER TABLE "hero_graphs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hero_matchups" (
	"id" integer NOT NULL,
	"name" text NOT NULL,
	"rank" text NOT NULL,
	"most_compatible" jsonb,
	"least_compatible" jsonb,
	"best_counter" jsonb,
	"worst_counter" jsonb,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "hero_matchups_id_rank_pk" PRIMARY KEY("id","rank")
);
--> statement-breakpoint
ALTER TABLE "hero_matchups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hero_metas" (
	"id" integer NOT NULL,
	"name" text NOT NULL,
	"rank" text NOT NULL,
	"pick_rate" real NOT NULL,
	"ban_rate" real NOT NULL,
	"win_rate" real NOT NULL,
	"updatedAt" bigint NOT NULL,
	CONSTRAINT "hero_metas_id_rank_pk" PRIMARY KEY("id","rank")
);
--> statement-breakpoint
ALTER TABLE "hero_metas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hero_profiles" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL,
	"images" jsonb NOT NULL,
	"difficulty" text,
	"skills" jsonb NOT NULL,
	"lanes" jsonb NOT NULL,
	"roles" jsonb NOT NULL,
	"speciality" jsonb NOT NULL,
	"tagline" text,
	"tale" text,
	"relation" jsonb NOT NULL,
	"source_link" text
);
--> statement-breakpoint
ALTER TABLE "hero_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wikis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero" text NOT NULL,
	"markdown" text NOT NULL,
	"json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wikis_hero_unique" UNIQUE("hero")
);
--> statement-breakpoint
ALTER TABLE "wikis" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hero_graph_name_idx" ON "hero_graphs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "hero_graph_rank_idx" ON "hero_graphs" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "hero_matchup_name_idx" ON "hero_matchups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "hero_matchup_rank_idx" ON "hero_matchups" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "hero_meta_name_idx" ON "hero_metas" USING btree ("name");--> statement-breakpoint
CREATE INDEX "hero_meta_rank_idx" ON "hero_metas" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "hero_profile_name_idx" ON "hero_profiles" USING btree ("name");