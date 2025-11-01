import { createDb } from "@/db";
import { usersTable } from "@repo/database";
import { eq, or } from "drizzle-orm";

class CreditService {
	async checkUserCredit(userId: number, connectionString: string): Promise<boolean> {
		const db = createDb(connectionString);
		const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

		if (user) {
			return user.credits_remaining > 0;
		}
		return false;
	}
}

export const creditService = new CreditService();
