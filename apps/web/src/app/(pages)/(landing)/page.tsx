import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { HeroSearch } from "./_components/heroSearch";
import { HeroOfTheDay } from "./_components/hero-of-the-day";
import { QuickAccessCards } from "./_components/quick-access-cards";
import { MetaTeaser } from "./_components/meta-teaser";
import { Scroll } from "lucide-react";

const heroOfTheDayQuery = `/v1/heroes?limit=100&include=meta`;
const metaTeaserQuery = `/v1/heroes?limit=3&sort=-ban_rate&include=meta&rank=overall`;

export const dynamic = "force-dynamic";

export default async function Home() {
	const [allHeroes, metaKings] = await Promise.all([
		fetch(makeUrl(heroOfTheDayQuery)).then((r) => r.json() as Promise<ConsolidatedHeroOptional[]>),
		fetch(makeUrl(metaTeaserQuery)).then((r) => r.json() as Promise<ConsolidatedHeroOptional[]>),
	]);

	const heroCount = allHeroes.length;

	return (
		<div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
			{/* Welcome Section */}
			<section className="mb-12 text-center">
				<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-1.5 text-sm text-amber-800 dark:text-amber-400">
					<Scroll className="h-4 w-4" />
					<span className="font-medium">Welcome to Lore of Dawn</span>
				</div>
				<h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					Master the Meta, Explore the Lore
				</h1>
				<p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
					Your complete Mobile Legends companion with {heroCount}+ heroes, competitive insights, and
					epic stories
				</p>
			</section>

			{/* Search Bar */}
			<HeroSearch />

			{/* Hero of the Day */}
			<HeroOfTheDay heroes={allHeroes} />

			{/* Quick Access Cards */}
			<QuickAccessCards heroCount={heroCount} />

			{/* Meta Snapshot Teaser */}
			<MetaTeaser metaKings={metaKings} />
		</div>
	);
}
