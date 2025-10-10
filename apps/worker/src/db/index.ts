import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb(hyperdriveConnectionString: string) {
	const client = postgres(hyperdriveConnectionString);
	return drizzle(client);
}