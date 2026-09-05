import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import type { ConsolidatedHero } from "@repo/database";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { HeroGraph } from "@/features/heroes/graph.hero";
import { HeroHeader } from "@/features/heroes/header.hero";
import Loading from "@/features/heroes/loading";
import { HeroMatchup } from "@/features/heroes/matchup.hero";
import { HeroRankSelector } from "@/features/heroes/rank-selector.hero";
import { HeroRelationship } from "@/features/heroes/relationship.hero";
import { HeroSkills } from "@/features/heroes/skills.hero";
import { HeroTale } from "@/features/heroes/tale.hero";
import { tidyLabel } from "@/lib/utils";
import { makeUrl } from "@/lib/utils.api";

const rankSchema = z.enum(["overall", "glory"]).catch("overall");

// validateSearch output is what the server canonicalises the URL to, so an
// unknown rank is normalised in loaderDeps instead of here — otherwise
// /heroes/x and /heroes/x?rank=bogus both 307 to /heroes/x?rank=overall.
export const Route = createFileRoute("/heroes/$hero")({
	validateSearch: z.object({
		rank: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({ rank: rankSchema.parse(search.rank) }),
	loader: async ({ params, deps }) => {
		const hero_name = params.hero.trim().toLowerCase();
		const response = await fetch(makeUrl(`/v1/heroes/${hero_name}/${deps.rank}`));

		if (!response.ok) throw notFound();

		const data = (await response.json()) as ConsolidatedHero;
		return { hero_name, ...data };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "Hero" }] };

		const { profile, meta } = loaderData;
		const displayName = tidyLabel(profile.name);
		const roles = profile.roles.map((r) => tidyLabel(r.title)).join(", ");
		const winRate = meta?.win_rate ? `${(meta.win_rate * 100).toFixed(1)}% WR` : "";
		const heroImage = profile.images.painting || profile.images.head_big;

		const description = `${displayName} is a ${roles} hero in Mobile Legends. ${winRate ? `Current win rate: ${winRate}.` : ""} View stats, abilities, matchups, and lore.`;

		return {
			meta: [
				{ title: `${displayName} - Stats, Abilities & Matchups` },
				{ name: "description", content: description },
				{
					name: "keywords",
					content: [
						displayName,
						"MLBB",
						"Mobile Legends",
						roles,
						"hero guide",
						"stats",
						"matchups",
					].join(","),
				},
				{ property: "og:title", content: `${displayName} | Lore of Dawn` },
				{ property: "og:description", content: description },
				{
					property: "og:url",
					content: `https://loreofdawn.com/heroes/${profile.url_name}`,
				},
				...(heroImage
					? [
							{ property: "og:image", content: heroImage },
							{ property: "og:image:width", content: "800" },
							{ property: "og:image:height", content: "800" },
							{ property: "og:image:alt", content: displayName },
						]
					: []),
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: `${displayName} | Lore of Dawn` },
				{ name: "twitter:description", content: description },
				...(heroImage ? [{ name: "twitter:image", content: heroImage }] : []),
			],
			links: [
				{ rel: "canonical", href: `https://loreofdawn.com/heroes/${profile.url_name}` },
			],
		};
	},
	pendingComponent: Loading,
	component: HeroPage,
});

function HeroPage() {
	const { hero_name, profile, matchups, meta, graph } = Route.useLoaderData();
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
				<HeroRankSelector />
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
