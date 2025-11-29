import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { WikiPageClient } from "./_components/wiki-page-client";

export const dynamic = "force-dynamic";

export default async function WikiPage() {
	const response = await fetch(makeUrl("/v1/heroes?limit=500&include=meta&rank=overall"));

	if (!response.ok) {
		throw new Error("Failed to load wiki profiles");
	}

	const heroes = (await response.json()) as ConsolidatedHeroOptional[];

	return <WikiPageClient heroes={heroes} />;
}
