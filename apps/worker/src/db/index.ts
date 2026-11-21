import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb(hyperdriveConnectionString: string) {
	// Hyperdrive pools connections, so create a fresh client per request.
	const client = postgres(hyperdriveConnectionString, {
		max: 5, // Workers allow at most 6 open connections
		fetch_types: false,
		prepare: true,
	});

	return drizzle(client);
}
