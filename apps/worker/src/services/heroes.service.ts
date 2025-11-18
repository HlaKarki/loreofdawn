import {
	heroProfileTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroGraphDataTable,
	heroesListTable,
	HeroAssets,
	heroRolesEnum,
	StatsByRolesResponse,
	StatsByRolesType,
} from "@repo/database";
import { and, eq, ilike, sql, desc, asc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Bindings } from "@/types";

export class HeroService {
	private db: PostgresJsDatabase;
	private KV: Bindings["KV"];

	constructor(db: PostgresJsDatabase, KV: Bindings["KV"]) {
		this.db = db;
		this.KV = KV;
	}

	/**
	 * Get all heroes for seeding purposes
	 */
	async getHeroList() {
		const heroes = await this.db.select().from(heroesListTable);

		if (!heroes) {
			throw new Error("Could not fetch data list from the database");
		}

		return heroes;
	}

	/**
	 * Query heroes with filters, sorting, and pagination
	 */
	async queryHeroes(params: {
		name?: string;
		roles?: heroRolesEnum[];
		limit?: number;
		sort?: string;
		rank?: string;
		include?: string[]; // ["meta", "matchups", "graph", "full"]
		minBanRate?: number;
		minWinRate?: number;
		minPickRate?: number;
		maxBanRate?: number;
		maxWinRate?: number;
		maxPickRate?: number;
	}) {
		const {
			name,
			roles,
			limit = 10,
			sort,
			rank = "overall",
			include = [],
			minBanRate,
			minWinRate,
			minPickRate,
			maxBanRate,
			maxWinRate,
			maxPickRate,
		} = params;

		// Auto-include meta if sorting by meta fields
		const needsMetaForSort =
			sort &&
			(sort.includes("win_rate") || sort.includes("pick_rate") || sort.includes("ban_rate"));
		const includeMeta = include.includes("meta") || needsMetaForSort;
		const includeMatchups = include.includes("matchups");
		const includeGraph = include.includes("graph");

		// Build the query
		let query = this.db
			.select()
			.from(heroProfileTable)
			.leftJoin(
				heroMetaDataTable,
				and(ilike(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank)),
			)
			.leftJoin(
				heroMatchupTable,
				and(ilike(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank)),
			)
			.leftJoin(
				heroGraphDataTable,
				and(
					ilike(heroProfileTable.name, heroGraphDataTable.name),
					eq(heroGraphDataTable.rank, rank),
				),
			)
			.$dynamic();

		// Apply filters
		const conditions = [];

		if (name) {
			conditions.push(ilike(heroProfileTable.name, `%${name}%`));
		}

		if (roles && roles.length > 0) {
			const roleConditions = roles.map(
				(role) =>
					sql`EXISTS (
						SELECT 1 FROM jsonb_array_elements(${heroProfileTable.roles}) AS r
						WHERE LOWER(r->>'title') = ${role.toLowerCase()}
					)`,
			);
			conditions.push(sql`(${sql.join(roleConditions, sql` OR `)})`);
		}

		if (minBanRate !== undefined) {
			conditions.push(sql`${heroMetaDataTable.ban_rate} >= ${minBanRate}`);
		}

		if (minWinRate !== undefined) {
			conditions.push(sql`${heroMetaDataTable.win_rate} >= ${minWinRate}`);
		}

		if (minPickRate !== undefined) {
			conditions.push(sql`${heroMetaDataTable.pick_rate} >= ${minPickRate}`);
		}

		if (maxBanRate !== undefined) {
			conditions.push(sql`${heroMetaDataTable.ban_rate} <= ${maxBanRate}`);
		}

		if (maxWinRate !== undefined) {
			conditions.push(sql`${heroMetaDataTable.win_rate} <= ${maxWinRate}`);
		}

		if (maxPickRate !== undefined) {
			conditions.push(sql`${heroMetaDataTable.pick_rate} <= ${maxPickRate}`);
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		// Apply sorting
		if (sort) {
			const orderClauses = sort.split(",").map((field) => {
				const isDesc = field.startsWith("-");
				const fieldName = isDesc ? field.slice(1) : field;

				const sortMap: Record<string, any> = {
					win_rate: heroMetaDataTable.win_rate,
					pick_rate: heroMetaDataTable.pick_rate,
					ban_rate: heroMetaDataTable.ban_rate,
					name: heroProfileTable.name,
				};

				const column = sortMap[fieldName] ?? heroProfileTable.name;
				return isDesc ? desc(column) : asc(column);
			});

			query = query.orderBy(...orderClauses);
		} else {
			query = query.orderBy(asc(heroProfileTable.name));
		}

		// Execute query
		const results = await query.limit(Math.min(limit, 100));

		// Transform results based on what was requested
		return results.map((row) => {
			const profile = row.hero_profiles;

			return {
				profile,
				// Conditionally include meta, matchups, graph
				...(includeMeta && row.hero_metas && { meta: row.hero_metas }),
				...(includeMatchups && row.hero_matchups && { matchups: row.hero_matchups }),
				...(includeGraph && row.hero_graphs && { graph: row.hero_graphs }),
			};
		});
	}

	/**
	 * Get comprehensive list of heroes with their roles, lanes, and specialities
	 * Returns a formatted string that helps AI understand hero classifications
	 * e.g. "Miya (marksman, gold lane, damage/push), Fanny (assassin, jungle, burst/mobility)"
	 */
	async getHeroListForAi(): Promise<string> {
		const heroes = await this.db
			.select({
				name: heroProfileTable.name,
				roles: heroProfileTable.roles,
				lanes: heroProfileTable.lanes,
				speciality: heroProfileTable.speciality,
			})
			.from(heroProfileTable);

		// Format: "HeroName (role1/role2, lane1/lane2, speciality1/speciality2)"
		const formatted = heroes.map((hero) => {
			const roles = (hero.roles as any[])?.map((r) => r.title?.toLowerCase()).filter(Boolean) || [];
			const lanes = (hero.lanes as any[])?.map((l) => l.title?.toLowerCase()).filter(Boolean) || [];
			const specs = (hero.speciality as string[])?.filter(Boolean) || [];

			const parts = [
				roles.length > 0 ? roles.join("/") : null,
				lanes.length > 0 ? lanes.join("/") : null,
				specs.length > 0 ? specs.join("/") : null,
			].filter(Boolean);

			return `${hero.name} (${parts.join(", ")})`;
		});

		return formatted.join(", ");
	}

	/**
	 * Get consolidated data profile with matchups, meta, and graph data (LEFT JOIN version)
	 */
	async getHeroProfile(name: string, rank: string) {
		const normalizedName = name.trim().toLowerCase().replaceAll("_", " ");

		const result = await this.db
			.select()
			.from(heroProfileTable)
			.leftJoin(
				heroMatchupTable,
				and(ilike(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank)),
			)
			.leftJoin(
				heroMetaDataTable,
				and(ilike(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank)),
			)
			.leftJoin(
				heroGraphDataTable,
				and(
					ilike(heroProfileTable.name, heroGraphDataTable.name),
					ilike(heroGraphDataTable.rank, rank),
				),
			)
			.where(ilike(heroProfileTable.name, normalizedName))
			.limit(1);

		if (!result[0]) {
			throw new Error("Hero not found");
		}

		return {
			profile: result[0].hero_profiles,
			matchups: result[0].hero_matchups,
			meta: result[0].hero_metas,
			graph: result[0].hero_graphs,
		};
	}

	async getStatsByRoles(rank: string = "overall"): Promise<StatsByRolesResponse> {
		const resolvedRank = rank ?? "overall";

		const stats: StatsByRolesType[] = await this.db
			.select({
				rank: sql<string>`${resolvedRank}`,
				role: sql<string>`jsonb_array_elements(roles)->>'title'`,
				averageWinRate: sql<number>`AVG(win_rate)`,
				averageBanRate: sql<number>`AVG(ban_rate)`,
				averagePickRate: sql<number>`AVG(pick_rate)`,
				heroCount: sql<number>`COUNT(*)`,
			})
			.from(heroProfileTable)
			.leftJoin(
				heroMetaDataTable,
				and(
					ilike(heroProfileTable.name, heroMetaDataTable.name),
					eq(heroMetaDataTable.rank, resolvedRank),
				),
			)
			.groupBy(sql`jsonb_array_elements(roles)->>'title'`);

		const [{ lastUpdated } = { lastUpdated: null }] = await this.db
			.select({
				lastUpdated: sql<number | null>`MAX(${heroMetaDataTable.updatedAt})`,
			})
			.from(heroMetaDataTable)
			.where(eq(heroMetaDataTable.rank, resolvedRank));

		return {
			rank: resolvedRank,
			data: stats,
			lastUpdated: lastUpdated ?? null,
		};
	}

	/**
	 * Seed KV cache with data data for a specific data and rank
	 */
	async seedHeroCache(heroName: string, rank: string): Promise<void> {
		const normalizedName = heroName.trim().toLowerCase().replaceAll("_", " ");

		const result = await this.db
			.select()
			.from(heroProfileTable)
			.leftJoin(
				heroMatchupTable,
				and(ilike(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank)),
			)
			.leftJoin(
				heroMetaDataTable,
				and(ilike(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank)),
			)
			.leftJoin(
				heroGraphDataTable,
				and(
					ilike(heroProfileTable.name, heroGraphDataTable.name),
					ilike(heroGraphDataTable.rank, rank),
				),
			)
			.where(ilike(heroProfileTable.name, normalizedName))
			.limit(1);

		if (result[0]) {
			const data = {
				...result[0].hero_profiles,
				...result[0].hero_matchups,
				...result[0].hero_metas,
				...result[0].hero_graphs,
			};

			const cacheKey = `hero:${heroName}:${rank}`;
			await this.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 3600 });
		}
	}

	/**
	 * Get all assets related to a data
	 */
	async getHeroAssets(name: string): Promise<{ images: HeroAssets }> {
		const [assets] = await this.db
			.select({
				images: heroProfileTable.images,
			})
			.from(heroProfileTable)
			.where(ilike(heroProfileTable.name, name))
			.limit(1);
		return assets;
	}
}
