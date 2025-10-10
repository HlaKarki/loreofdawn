import type { HeroNameKey, RankNameKey } from "@/data/ml/hero_ids";

export class KvService {
	private readonly TTL_SECONDS = 60 * 60; // 60 minutes

	constructor(private kv: KVNamespace) {}

	/**
	 * Generate a consistent cache key for hero data
	 */
	private getKey(hero: HeroNameKey, rank: RankNameKey): string {
		return `hero:consolidated:${hero}:${rank}`;
	}

	/**
	 * Get consolidated hero data from KV
	 */
	async getHeroData(opts: { hero: HeroNameKey; rank: RankNameKey }) {
		try {
			const key = this.getKey(opts.hero, opts.rank);
			const data = await this.kv.get(key, "json");
			return data;
		} catch (error) {
			console.error("KV get error:", error);
			return null;
		}
	}

	/**
	 * Store consolidated hero data in KV with 60-minute TTL
	 */
	async setHeroData(
		opts: { hero: HeroNameKey; rank: RankNameKey },
		data: any,
	) {
		try {
			const key = this.getKey(opts.hero, opts.rank);
			await this.kv.put(key, JSON.stringify(data), {
				expirationTtl: this.TTL_SECONDS,
			});
		} catch (error) {
			console.error("KV put error:", error);
			// Don't throw - cache failures shouldn't break the app
		}
	}
}