import { bigint, index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { creditTransactionsMetadata, creditTransactionsReason } from "../types/credit.types";
import { usersTable } from "./users.schema";

export const creditTransactionsTable = pgTable(
	"credit_transactions",
	{
		id: integer("id").notNull().primaryKey(),
		user_id: integer("user_id")
			.notNull()
			.references(() => usersTable.id),
		amount: integer("amount").notNull(),
		reason: text("reason").$type<creditTransactionsReason>().notNull(),
		balance_after: integer("balance_after").notNull(),
		metadata: jsonb("metadata").$type<creditTransactionsMetadata>().notNull(),
		createdAt: bigint("createdAt", { mode: "number" }).notNull(),
		updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
	},
	(t) => [index("creditTransactionsTable:user_id").on(t.user_id)],
).enableRLS();
