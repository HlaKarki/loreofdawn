import Link from "next/link";
import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { HeroSearch } from "./_components/heroSearch";
import { HeroOfTheDay } from "./_components/hero-of-the-day";
import { QuickAccessCards } from "./_components/quick-access-cards";
import { QuickStats } from "./_components/quick-stats";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingUp } from "lucide-react";

const heroOfTheDayQuery = `/v1/heroes?limit=100&include=meta`;

export const dynamic = "force-dynamic";

const pickHeroOfTheDay = (heroes: ConsolidatedHeroOptional[]) => {
	if (!heroes.length) return null;
	const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
	return heroes[daysSinceEpoch % heroes.length];
};

export default async function Home() {
	const allHeroes = await fetch(makeUrl(heroOfTheDayQuery)).then(
		(r) => r.json() as Promise<ConsolidatedHeroOptional[]>,
	);

	const heroCount = allHeroes.length;
	const heroOfTheDay = pickHeroOfTheDay(allHeroes);

	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
				{/* Hero section - simplified and focused */}
				<section className="relative mb-12">
					<div className="text-center">
						<h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							Master the{" "}
							<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
								Land of Dawn
							</span>
						</h1>

						<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
							Explore {heroCount}+ heroes with live meta stats, deep lore, and matchup insights.
							Make every draft count.
						</p>

						{/* Search */}
						<div className="mx-auto mb-8 max-w-xl">
							<HeroSearch />
						</div>

						{/* Quick actions */}
						<div className="flex flex-wrap items-center justify-center gap-3">
							<Button
								asChild
								size="lg"
								className="gap-2 bg-amber-500 text-amber-950 hover:bg-amber-600"
							>
								<Link href="/meta">
									<TrendingUp className="h-4 w-4" />
									View meta
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="gap-2">
								<Link href="/heroes">
									<Target className="h-4 w-4" />
									Browse heroes
								</Link>
							</Button>
							<Button asChild variant="ghost" size="lg" className="gap-2">
								<Link href="/lores">
									Read lores
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</section>

				{/* Hero of the Day + Quick Stats */}
				<section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
					<HeroOfTheDay hero={heroOfTheDay} />
					<QuickStats />
				</section>

				{/* Quick access */}
				<QuickAccessCards heroCount={heroCount} />
			</div>
		</div>
	);
}
