import type { ConsolidatedHero } from "@repo/database";
import { makeUrl } from "@/lib/utils.api";
import { HeroGraph } from "../_components/graph.hero";
import { HeroHeader } from "../_components/header.hero";
import { HeroMatchup } from "../_components/matchup.hero";
import { HeroRelationship } from "../_components/relationship.hero";
import { HeroSkills } from "../_components/skills.hero";
import { HeroTale } from "../_components/tale.hero";

interface HeroPageProps {
	params: Promise<{
		hero: string;
	}>;
	searchParams?: Promise<{ rank?: string }>;
}

export default async function HeroPage({ params, searchParams }: HeroPageProps) {
	const resolvedParams = await params;
	const resolvedRank = await searchParams;
	const hero_name = resolvedParams.hero.trim().toLowerCase();
	const rank = (resolvedRank && resolvedRank.rank?.trim().toLowerCase()) ?? "overall";

	const response = await fetch(makeUrl(`/v1/heroes/${hero_name}/${rank}`));

	if (response.status === 404) {
		return (
			<div className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4">
				<p className="text-muted-foreground">Hero not found</p>
			</div>
		);
	}

	if (!response.ok) {
		throw new Error("Failed to load data data");
	}

	const { profile, matchups, meta, graph } = (await response.json()) satisfies ConsolidatedHero;

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
			<HeroHeader data={profile} metadata={meta} />
			<HeroTale data={profile} />
			<HeroSkills data={profile} />
			<HeroRelationship data={profile} />
			<HeroMatchup data={matchups} />
			<HeroGraph data={graph} />
		</div>
	);
}
