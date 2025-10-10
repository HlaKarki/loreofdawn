import type { HeroNameKey, RankNameKey } from "@/data/ml/hero_ids";
import {
	heroGraphDataTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroProfileTable,
} from "@/db/schema/ml.schema";
import { and, eq, ilike } from "drizzle-orm";
import type { createDb } from "@/db";
import type { KvService } from "./kv.service";

export class MlDbService {
	constructor(
		private db: ReturnType<typeof createDb>,
		private kvService?: KvService,
	) {}

	async getConsolidatedData(opts: { hero: HeroNameKey; rank: RankNameKey }) {
		try {
			// 1. Check KV cache first
			if (this.kvService) {
				const cachedData = await this.kvService.getHeroData(opts);
				if (cachedData) {
					console.log(`✓ KV cache hit: ${opts.hero}:${opts.rank}`);
					return cachedData;
				}
				console.log(`✗ KV cache miss: ${opts.hero}:${opts.rank}`);
			}

			// 2. KV miss - query database
			const result = await this.db
				.select()
				.from(heroProfileTable)
				.leftJoin(
					heroMatchupTable,
					and(
						eq(heroProfileTable.name, heroMatchupTable.name),
						eq(heroMatchupTable.rank, opts.rank),
					),
				)
				.leftJoin(
					heroMetaDataTable,
					and(
						eq(heroProfileTable.name, heroMetaDataTable.name),
						eq(heroMetaDataTable.rank, opts.rank),
					),
				)
				.leftJoin(
					heroGraphDataTable,
					and(
						eq(heroProfileTable.name, heroGraphDataTable.name),
						eq(heroGraphDataTable.rank, opts.rank),
					),
				)
				.where(ilike(heroProfileTable.name, opts.hero))
				.limit(1);

			if (!result[0]) return null;

			const { hero_profiles, hero_matchups, hero_metas, hero_graphs } =
				result[0];

			const consolidatedData = {
				...hero_profiles,
				...hero_matchups,
				...hero_metas,
				...hero_graphs,
			};

			// 3. Backfill KV cache with DB result
			if (this.kvService) {
				await this.kvService.setHeroData(opts, consolidatedData);
				console.log(`✓ KV cache backfilled: ${opts.hero}:${opts.rank}`);
			}

			return consolidatedData;
		} catch (error) {
			console.error("MlDbService JOIN Error: ", error);
			throw error;
		}
	}
}