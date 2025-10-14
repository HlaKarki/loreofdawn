import type { ConsolidatedHero, MlHeroList } from "@repo/database";
import { HeroHeader } from "@/app/hero/_components/header.hero";
import { HeroSkills } from "@/app/hero/_components/skills.hero";
import { HeroRelationship } from "@/app/hero/_components/relationship.hero";
import { HeroMatchup } from "@/app/hero/_components/matchup.hero";
import { HeroTale } from "@/app/hero/_components/tale.hero";
import { makeUrl } from "@/lib/utils.api";

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
		throw new Error("Failed to load hero data");
	}

	const consolidated = (await response.json()) as ConsolidatedHero;

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
			<HeroHeader hero={consolidated} />
			<HeroTale hero={consolidated} />
			<HeroSkills hero={consolidated} />
			<HeroRelationship hero={consolidated} />
			<HeroMatchup hero={consolidated} />
		</div>
	);
}
