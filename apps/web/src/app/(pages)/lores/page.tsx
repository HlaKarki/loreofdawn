import { makeUrl } from "@/lib/utils.api";
import type { WikiMetadata } from "@repo/database";
import { LorePageClient } from "./_components/lore-page-client";

export const dynamic = "force-dynamic";

export type WikiListing = {
	hero: string;
	urlName: string;
	metadata: WikiMetadata;
	lastUpdated: number | null;
};

export default async function LorePage() {
	try {
		const response = await fetch(makeUrl("/v1/wikis"), {
			next: { revalidate: 300 }, // Cache for 5 minutes
		});

		if (!response.ok) {
			console.error("Failed to fetch wikis:", response.status, response.statusText);
			throw new Error(`Failed to load lore data: ${response.status} ${response.statusText}`);
		}

		const wikis = (await response.json()) as WikiListing[];

		if (!Array.isArray(wikis)) {
			console.error("Invalid response format:", wikis);
			throw new Error("Invalid response format from API");
		}

		console.log(`✓ Loaded ${wikis.length} lore entries`);

		return <LorePageClient wikis={wikis} />;
	} catch (error) {
		console.error("Error in LorePage:", error);
		throw error; // Re-throw to trigger Next.js error boundary
	}
}
