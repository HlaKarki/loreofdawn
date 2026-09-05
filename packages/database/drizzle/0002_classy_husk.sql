DROP INDEX "usersTable:id";--> statement-breakpoint
CREATE INDEX "usersTable:clerkUserId" ON "users" USING btree ("clerk_user_id");