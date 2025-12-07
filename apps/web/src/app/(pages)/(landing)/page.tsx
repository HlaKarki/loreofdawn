import Link from "next/link";
import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { HeroSearch } from "./_components/heroSearch";
import { HeroOfTheDay } from "./_components/hero-of-the-day";
import { QuickAccessCards } from "./_components/quick-access-cards";
import { MetaTeaser } from "./_components/meta-teaser";
import { Button } from "@/components/ui/button";
import { UpdatedAtLabel } from "./_utils";
import { tidyLabel } from "@/lib/utils";
import { resolveImageSrc } from "../heroes/_components/header.hero";
import { ArrowRight, Sparkles, Target, Crown, TrendingUp } from "lucide-react";

const heroOfTheDayQuery = `/v1/heroes?limit=100&include=meta`;
const metaTeaserQuery = `/v1/heroes?limit=3&sort=-ban_rate&include=meta&rank=overall`;

export const dynamic = "force-dynamic";

const formatPercent = (value?: number, digits = 1) =>
	value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;

const pickHeroOfTheDay = (heroes: ConsolidatedHeroOptional[]) => {
	if (!heroes.length) return null;
	const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
	return heroes[daysSinceEpoch % heroes.length];
};

export default async function Home() {
	const [allHeroes, metaKings] = await Promise.all([
		fetch(makeUrl(heroOfTheDayQuery)).then((r) => r.json() as Promise<ConsolidatedHeroOptional[]>),
		fetch(makeUrl(metaTeaserQuery)).then((r) => r.json() as Promise<ConsolidatedHeroOptional[]>),
	]);

	const heroCount = allHeroes.length;
	const heroOfTheDay = pickHeroOfTheDay(allHeroes);
	const updatedAt = metaKings[0]?.meta?.updatedAt ?? allHeroes[0]?.meta?.updatedAt;

	const topWinHero =
		allHeroes
			.slice()
			.sort((a, b) => (b.meta?.win_rate ?? 0) - (a.meta?.win_rate ?? 0))
			.at(0) ?? null;

	const topBanHero =
		(metaKings.length ? metaKings[0] : null) ||
		allHeroes
			.slice()
			.sort((a, b) => (b.meta?.ban_rate ?? 0) - (a.meta?.ban_rate ?? 0))
			.at(0) ||
		null;

	const topBanImage = topBanHero
		? resolveImageSrc(
				topBanHero.profile.images.squarehead_big,
				topBanHero.profile.images.head_big,
				topBanHero.profile.images.painting,
		  )
		: null;


	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
				{/* Hero section - simplified and focused */}
				<section className="relative mb-12">
					<div className="text-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
							<Sparkles className="h-4 w-4" />
							Your Mobile Legends companion
						</div>

						<h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							Master the{" "}
							<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
								Land of Dawn
							</span>
						</h1>

						<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
							Explore {heroCount}+ heroes with live meta stats, deep lore, and matchup insights. Make
							every draft count.
						</p>

						{/* Search */}
						<div className="mx-auto mb-8 max-w-xl">
							<HeroSearch />
						</div>

						{/* Quick actions */}
						<div className="flex flex-wrap items-center justify-center gap-3">
							<Button asChild size="lg" className="gap-2 bg-amber-500 text-foreground hover:bg-amber-600">
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

				{/* Meta snapshot - clean horizontal strip */}
				{(topBanHero || topWinHero) && (
					<section className="mb-12 rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
									<Crown className="h-5 w-5 text-amber-600" />
								</div>
								<div>
									<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Today&apos;s meta pulse
									</p>
									<div className="flex items-center gap-2">
										{updatedAt && <UpdatedAtLabel date={updatedAt} />}
									</div>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-6">
								{topBanHero && (
									<Link
										href={`/heroes/${topBanHero.profile.name.toLowerCase().replace(/\s+/g, "-")}`}
										className="group flex items-center gap-3"
									>
										<div className="h-10 w-10 overflow-hidden rounded-lg border border-border/60">
											{topBanImage && (
												<img
													src={topBanImage}
													alt={topBanHero.profile.name}
													className="h-full w-full object-cover"
												/>
											)}
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Most banned</p>
											<p className="font-semibold group-hover:text-amber-600">
												{tidyLabel(topBanHero.profile.name)}{" "}
												<span className="text-sm font-normal text-amber-600">
													{formatPercent(topBanHero.meta?.ban_rate)}
												</span>
											</p>
										</div>
									</Link>
								)}

								{topWinHero && (
									<Link
										href={`/heroes/${topWinHero.profile.name.toLowerCase().replace(/\s+/g, "-")}`}
										className="group flex items-center gap-3"
									>
										<div className="h-10 w-10 overflow-hidden rounded-lg border border-border/60">
											{resolveImageSrc(
												topWinHero.profile.images.squarehead_big,
												topWinHero.profile.images.head_big,
												topWinHero.profile.images.painting,
											) && (
												<img
													src={resolveImageSrc(
														topWinHero.profile.images.squarehead_big,
														topWinHero.profile.images.head_big,
														topWinHero.profile.images.painting,
													)}
													alt={topWinHero.profile.name}
													className="h-full w-full object-cover"
												/>
											)}
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Highest win rate</p>
											<p className="font-semibold group-hover:text-emerald-600">
												{tidyLabel(topWinHero.profile.name)}{" "}
												<span className="text-sm font-normal text-emerald-600">
													{formatPercent(topWinHero.meta?.win_rate)}
												</span>
											</p>
										</div>
									</Link>
								)}

								<Button asChild variant="ghost" size="sm" className="gap-1">
									<Link href="/meta">
										View all
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
							</div>
						</div>
					</section>
				)}

				{/* Hero of the Day + Meta Teaser */}
				<section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
					<HeroOfTheDay hero={heroOfTheDay} />
					<MetaTeaser metaKings={metaKings} />
				</section>

				{/* Quick access */}
				<QuickAccessCards heroCount={heroCount} />
			</div>
		</div>
	);
}
