import { sql } from "drizzle-orm";
import { pgPolicy, pgRole } from "drizzle-orm/pg-core";

export const readonlyUser = pgRole("readonly_user").existing();

// /ask runs model-generated SQL as readonly_user, so only tables it may read get this policy.
// Drizzle can't express GRANT, so the matching grants live in sql/readonly-user-ask-access.sql.
export const readonlySelectPolicy = () =>
	pgPolicy("readonly_user_select", {
		as: "permissive",
		for: "select",
		to: readonlyUser,
		using: sql`true`,
	});
