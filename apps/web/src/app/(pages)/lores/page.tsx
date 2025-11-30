import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { LoreSearch } from "./_components/search.lores";

export const dynamic = "force-dynamic";

export default async function LorePage() {
	try {
		const response = await fetch(makeUrl("/v1/heroes?limit=500&include=meta&rank=overall"), {
			next: { revalidate: 300 }, // Cache for 5 minutes
		});

		if (!response.ok) {
			console.error("Failed to fetch heroes:", response.status, response.statusText);
			throw new Error(`Failed to load hero lores: ${response.status} ${response.statusText}`);
		}

		const heroes = (await response.json()) as ConsolidatedHeroOptional[];

		if (!Array.isArray(heroes)) {
			console.error("Invalid response format:", heroes);
			throw new Error("Invalid response format from API");
		}

		console.log(`✓ Loaded ${heroes.length} heroes for lore page`);

		return (
			<div>
				<LoreSearch heroes={heroes} />
			</div>
		);
	} catch (error) {
		console.error("Error in LorePage:", error);
		throw error; // Re-throw to trigger Next.js error boundary
	}
}
