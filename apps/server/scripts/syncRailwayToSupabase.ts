import { Pool } from "pg";

type Table = {
	name: string;
	conflictColumn: string;
};

const tables: Table[] = [
	{ name: "user", conflictColumn: "id" },
	{ name: "account", conflictColumn: "id" },
	{ name: "session", conflictColumn: "id" },
	{ name: "verification", conflictColumn: "id" },
	{ name: "wikis", conflictColumn: "id" },
	{ name: "test", conflictColumn: "id" },
];

const quoteIdent = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

async function main() {
	const sourceUrl = process.env.RAILWAY_DATABASE_URL;
	const targetUrl = process.env.SUPABASE_DATABASE_URL;

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

async function copyTable({ table, sourcePool, targetPool }: CopyParams) {
	const sourceClient = await sourcePool.connect();
	try {
		const selectSql = `SELECT * FROM ${quoteIdent(table.name)} ORDER BY ${quoteIdent(table.conflictColumn)}`;
		const { rows } = await sourceClient.query(selectSql);

		if (rows.length === 0) {
			console.info(`[${table.name}] source has no rows; skipping.`);
			return;
		}

		console.info(`[${table.name}] copying ${rows.length} row(s)...`);

		const columns = Object.keys(rows[0]);
		const quotedColumns = columns.map(quoteIdent).join(", ");

		const targetClient = await targetPool.connect();
		try {
			await targetClient.query("BEGIN");

			const updateAssignments = columns
				.filter((column) => column !== table.conflictColumn)
				.map((column) => `${quoteIdent(column)} = EXCLUDED.${quoteIdent(column)}`)
				.join(", ");

			const conflictSql =
				updateAssignments.length > 0
					? `ON CONFLICT (${quoteIdent(table.conflictColumn)}) DO UPDATE SET ${updateAssignments}`
					: "ON CONFLICT DO NOTHING";

			for (const row of rows) {
				const values = columns.map((column) => row[column]);
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
