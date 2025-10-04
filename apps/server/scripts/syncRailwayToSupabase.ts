import { Pool } from "pg";

type Table = {
	name: string;
	conflictColumns: string[];
};

const tables: Table[] = [
	{ name: "user", conflictColumns: ["id"] },
	{ name: "account", conflictColumns: ["id"] },
	{ name: "session", conflictColumns: ["id"] },
	{ name: "verification", conflictColumns: ["id"] },
	{ name: "wikis", conflictColumns: ["id"] },
	{ name: "hero_profiles", conflictColumns: ["id"] },
	{ name: "hero_matchups", conflictColumns: ["id", "rank"] },
	{ name: "hero_metas", conflictColumns: ["id", "rank"] },
	{ name: "hero_graphs", conflictColumns: ["id", "rank"] },
];

const quoteIdent = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

async function main() {
	const sourceUrl = process.env.SUPABASE_DATABASE_URL;
	const targetUrl = process.env.RAILWAY_DATABASE_URL;

	if (!sourceUrl) {
		throw new Error("RAILWAY_DATABASE_URL must be set (copy the Railway connection string).");
	}

	if (!targetUrl) {
		throw new Error(
			"SUPABASE_DATABASE_URL or DATABASE_URL must be set (Supabase connection string).",
		);
	}

	if (sourceUrl === targetUrl) {
		throw new Error(
			"Source and target database URLs are identical; aborting to avoid accidental overwrite.",
		);
	}

	const sourcePool = createPool(sourceUrl);
	const targetPool = createPool(targetUrl);

	try {
		for (const table of tables) {
			await copyTable({ table, sourcePool, targetPool });
		}
	} finally {
		await sourcePool.end();
		await targetPool.end();
	}
}

const createPool = (connectionString: string) => {
	const needsSSL = !/localhost|127\.0\.0\.1/.test(connectionString);
	return new Pool({
		connectionString,
		ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
	});
};

type CopyParams = {
	table: Table;
	sourcePool: Pool;
	targetPool: Pool;
};

async function getJsonbColumns(pool: Pool, tableName: string): Promise<Set<string>> {
	const client = await pool.connect();
	try {
		const result = await client.query(
			`SELECT column_name
			 FROM information_schema.columns
			 WHERE table_name = $1
			 AND (data_type = 'json' OR data_type = 'jsonb')`,
			[tableName],
		);
		return new Set(result.rows.map((row) => row.column_name));
	} finally {
		client.release();
	}
}

async function copyTable({ table, sourcePool, targetPool }: CopyParams) {
	const sourceClient = await sourcePool.connect();
	try {
		const orderBy = table.conflictColumns.map(quoteIdent).join(", ");
		const selectSql = `SELECT * FROM ${quoteIdent(table.name)} ORDER BY ${orderBy}`;
		const { rows } = await sourceClient.query(selectSql);

		if (rows.length === 0) {
			console.info(`[${table.name}] source has no rows; skipping.`);
			return;
		}

		console.info(`[${table.name}] copying ${rows.length} row(s)...`);

		const columns = Object.keys(rows[0]);
		const quotedColumns = columns.map(quoteIdent).join(", ");

		// Get JSONB columns for this table
		const jsonbColumns = await getJsonbColumns(sourcePool, table.name);
		console.log(`[${table.name}] JSONB columns:`, Array.from(jsonbColumns));

		// Debug: check first row's json column
		if (table.name === "wikis" && rows[0]) {
			console.log(`[${table.name}] Sample json value type:`, typeof rows[0].json);
			console.log(`[${table.name}] Sample json value:`, JSON.stringify(rows[0].json).substring(0, 100));
		}

		const targetClient = await targetPool.connect();
		try {
			await targetClient.query("BEGIN");

			const updateAssignments = columns
				.filter((column) => !table.conflictColumns.includes(column))
				.map((column) => `${quoteIdent(column)} = EXCLUDED.${quoteIdent(column)}`)
				.join(", ");

			const conflictColumns = table.conflictColumns.map(quoteIdent).join(", ");
			const conflictSql =
				updateAssignments.length > 0
					? `ON CONFLICT (${conflictColumns}) DO UPDATE SET ${updateAssignments}`
					: "ON CONFLICT DO NOTHING";

			for (const row of rows) {
				const values = columns.map((column) => {
					const value = row[column];
					// Handle JSONB columns: convert to JSON string for pg
					if (jsonbColumns.has(column)) {
						if (value === null || value === undefined) {
							return null;
						}
						// Always stringify JSONB values as pg expects JSON strings
						return JSON.stringify(value);
					}
					return value;
				});
				const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");

				const insertSql = `INSERT INTO ${quoteIdent(table.name)} (${quotedColumns}) VALUES (${placeholders}) ${conflictSql}`;
				await targetClient.query(insertSql, values);
			}

			await targetClient.query("COMMIT");
			console.info(`[${table.name}] done.`);
		} catch (error) {
			await targetClient.query("ROLLBACK");
			throw error;
		} finally {
			targetClient.release();
		}
	} finally {
		sourceClient.release();
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
