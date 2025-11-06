import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb(hyperdriveConnectionString: string) {
	// Hyperdrive handles connection pooling globally
	// Workers must create fresh connections per request
	// Reference: https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-drivers-and-libraries/postgres-js/
	const client = postgres(hyperdriveConnectionString, {
		max: 5, // Workers limit: 6 concurrent connections max
		fetch_types: false, // Skip type fetching to reduce latency
		prepare: true, // Use prepared statements (better with Hyperdrive caching)
	});

	return drizzle(client);
}
