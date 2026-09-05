import { Suspense } from "react";
import type { Metadata } from "next";
import type { ConsolidatedHero } from "@repo/database";
import { makeUrl } from "@/lib/utils.api";
import { tidyLabel } from "@/lib/utils";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { HeroGraph } from "../_components/graph.hero";
import { HeroHeader } from "../_components/header.hero";
import { HeroMatchup } from "../_components/matchup.hero";
import { HeroRelationship } from "../_components/relationship.hero";
import { HeroSkills } from "../_components/skills.hero";
import { HeroTale } from "../_components/tale.hero";
import { HeroRankSelector } from "../_components/rank-selector.hero";

interface HeroPageProps {
	params: Promise<{
		hero: string;
	}>;
	searchParams?: Promise<{ rank?: string }>;
}

export async function generateMetadata({ params }: HeroPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const heroName = resolvedParams.hero.trim().toLowerCase();

	try {
		const response = await fetch(makeUrl(`/v1/heroes/${heroName}/overall`), {
			next: { revalidate: 3600 },
		});

		if (!response.ok) {
			return {
				title: "Hero Not Found",
			};
		}

		const { profile, meta } = (await response.json()) as ConsolidatedHero;
		const displayName = tidyLabel(profile.name);
		const roles = profile.roles.map((r) => tidyLabel(r.title)).join(", ");
		const winRate = meta?.win_rate ? `${(meta.win_rate * 100).toFixed(1)}% WR` : "";
		const heroImage = profile.images.painting || profile.images.head_big;

		const description = `${displayName} is a ${roles} hero in Mobile Legends. ${winRate ? `Current win rate: ${winRate}.` : ""} View stats, abilities, matchups, and lore.`;

		return {
			title: `${displayName} - Stats, Abilities & Matchups`,
			description,
			keywords: [displayName, "MLBB", "Mobile Legends", roles, "hero guide", "stats", "matchups"],
			openGraph: {
				title: `${displayName} | Lore of Dawn`,
				description,
				images: heroImage ? [{ url: heroImage, width: 800, height: 800, alt: displayName }] : [],
			},
			twitter: {
				card: "summary_large_image",
				title: `${displayName} | Lore of Dawn`,
				description,
				images: heroImage ? [heroImage] : [],
			},
		};
	} catch {
		return {
			title: "Hero",
		};
	}
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
	const displayName = tidyLabel(profile.name);

	return (
		<>
			<BreadcrumbJsonLd
				items={[
					{ name: "Home", url: "https://loreofdawn.com" },
					{ name: "Heroes", url: "https://loreofdawn.com/heroes" },
					{ name: displayName, url: `https://loreofdawn.com/heroes/${hero_name}` },
				]}
			/>
			<div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
				<Suspense fallback={null}>
					<HeroRankSelector heroName={hero_name} />
				</Suspense>
				<HeroHeader data={profile} metadata={meta} />
				<HeroTale data={profile} />
				<HeroSkills data={profile} />
				<HeroRelationship data={profile} />
				<HeroMatchup data={matchups} />
				<HeroGraph data={graph} />
			</div>
		</>
	);
}
