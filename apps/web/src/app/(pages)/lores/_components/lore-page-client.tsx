"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { WikiListing } from "../page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	BookOpenIcon,
	BookMarkedIcon,
	ClockIcon,
	HeartIcon,
	LightbulbIcon,
	SearchIcon,
	StarIcon,
	UsersIcon,
} from "lucide-react";
import { cn, tidyLabel } from "@/lib/utils";

type LorePageClientProps = {
	wikis: WikiListing[];
};

export const LorePageClient = ({ wikis }: LorePageClientProps) => {
	const [search, setSearch] = useState("");
	const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
	const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
	const [visibleCount, setVisibleCount] = useState(12);

	const availableMoods = useMemo(() => {
		const moodSet = new Set<string>();
		wikis.forEach((wiki) => {
			wiki.metadata.moods?.forEach((mood) => moodSet.add(mood));
		});
		return Array.from(moodSet).sort();
	}, [wikis]);

	const availableThemes = useMemo(() => {
		const themeSet = new Set<string>();
		wikis.forEach((wiki) => {
			wiki.metadata.themes?.forEach((theme) => themeSet.add(theme));
		});
		return Array.from(themeSet).sort();
	}, [wikis]);

	const fuse = useMemo(() => {
		return new Fuse(wikis, {
			keys: [
				{ name: "hero", weight: 0.3 },
				{ name: "metadata.teaser", weight: 0.2 },
				{ name: "metadata.hook", weight: 0.15 },
				{ name: "metadata.themes", weight: 0.15 },
				{ name: "metadata.moods", weight: 0.1 },
				{ name: "metadata.characterTraits", weight: 0.1 },
			],
			threshold: 0.3,
			distance: 100,
			minMatchCharLength: 2,
		});
	}, [wikis]);

	const baseResults = useMemo(() => {
		if (search.trim()) {
			return fuse.search(search.trim()).map((result) => result.item);
		}
		return [...wikis].sort((a, b) => b.metadata.wordCount - a.metadata.wordCount);
	}, [fuse, wikis, search]);

	const filteredWikis = useMemo(() => {
		let filtered = baseResults;

		if (selectedMoods.length > 0) {
			filtered = filtered.filter((wiki) =>
				selectedMoods.some((mood) => wiki.metadata.moods?.includes(mood)),
			);
		}

		if (selectedThemes.length > 0) {
			filtered = filtered.filter((wiki) =>
				selectedThemes.some((theme) => wiki.metadata.themes?.includes(theme)),
			);
		}

		return filtered;
	}, [baseResults, selectedMoods, selectedThemes]);

	const displayedWikis = useMemo(
		() => filteredWikis.slice(0, visibleCount),
		[filteredWikis, visibleCount],
	);

	const loreOfTheDay = useMemo(() => {
		if (wikis.length === 0) return null;
		const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
		return wikis[daysSinceEpoch % wikis.length];
	}, [wikis]);

	const featuredLores = useMemo(() => {
		if (wikis.length === 0) return [];
		const featured: WikiListing[] = [];
		const seen = new Set<string>(loreOfTheDay ? [loreOfTheDay.urlName] : []);
		const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

		const epicLores = [...wikis]
			.filter((wiki) => !seen.has(wiki.urlName))
			.sort((a, b) => b.metadata.epicnessScore - a.metadata.epicnessScore)
			.slice(0, 3);

		epicLores.forEach((lore) => {
			if (!seen.has(lore.urlName)) {
				featured.push(lore);
				seen.add(lore.urlName);
			}
		});

		while (featured.length < 5 && seen.size < wikis.length) {
			const candidate = wikis[(daysSinceEpoch + featured.length) % wikis.length];
			if (!seen.has(candidate.urlName)) {
				featured.push(candidate);
				seen.add(candidate.urlName);
			}
		}

		return featured.slice(0, 5);
	}, [wikis, loreOfTheDay]);

	const stats = useMemo(() => {
		const totalChapters = wikis.reduce((sum, wiki) => sum + (wiki.metadata.chapterCount || 0), 0);
		return {
			total: wikis.length,
			withChapters: wikis.filter((wiki) => wiki.metadata.hasChapters).length,
			totalChapters,
		};
	}, [wikis]);

	const filtersActive = search.trim() || selectedMoods.length > 0 || selectedThemes.length > 0;

	const handleMoodToggle = (mood: string) => {
		setSelectedMoods((prev) =>
			prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood],
		);
	};

	const handleThemeToggle = (theme: string) => {
		setSelectedThemes((prev) =>
			prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
		);
	};

	const handleReset = () => {
		setSearch("");
		setSelectedMoods([]);
		setSelectedThemes([]);
		setVisibleCount(12);
	};

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
			{/* Search Hero Section */}
			<section className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-background via-background to-muted/30 shadow-sm">
				<div className="space-y-6 p-6 sm:p-8">
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="bg-amber-500/10 text-amber-700">
							<StarIcon className="mr-1 h-3.5 w-3.5" />
							Enhanced lore discovery
						</Badge>
					</div>

					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							Explore epic{" "}
							<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
								tales &amp; legends
							</span>
						</h1>
						<p className="max-w-3xl text-lg text-muted-foreground">
							Discover {stats.total} hero stories enriched with themes, moods, relationships, and
							narrative depth. Filter by emotion and find your next favorite lore.
						</p>
					</div>

					<div className="space-y-4">
						<div className="relative">
							<SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search lore by hero, themes, moods, or story elements..."
								className="h-14 rounded-xl border-amber-500/30 bg-background/60 pl-12 text-base shadow-xs focus-visible:border-amber-500 focus-visible:ring-amber-500/40"
								aria-label="Search lore"
							/>
						</div>

						{availableMoods.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<HeartIcon className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">Filter by mood:</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{availableMoods.slice(0, 8).map((mood) => (
										<Button
											key={mood}
											type="button"
											variant={selectedMoods.includes(mood) ? "default" : "outline"}
											size="sm"
											onClick={() => handleMoodToggle(mood)}
											className={cn(
												"h-9 rounded-full px-4",
												selectedMoods.includes(mood)
													? "border-amber-500 bg-amber-500/20 text-amber-900"
													: "bg-background/60",
											)}
										>
											{tidyLabel(mood)}
										</Button>
									))}
								</div>
							</div>
						)}

						{availableThemes.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<BookOpenIcon className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">Filter by theme:</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{availableThemes.slice(0, 10).map((theme) => (
										<Button
											key={theme}
											type="button"
											variant={selectedThemes.includes(theme) ? "default" : "outline"}
											size="sm"
											onClick={() => handleThemeToggle(theme)}
											className={cn(
												"h-9 rounded-full px-4",
												selectedThemes.includes(theme)
													? "border-amber-500 bg-amber-500/20 text-amber-900"
													: "bg-background/60",
											)}
										>
											{tidyLabel(theme)}
										</Button>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<StatCard
							icon={BookOpenIcon}
							label="Total lores"
							value={stats.total}
							subtitle="Rich narratives"
						/>
						<StatCard
							icon={BookMarkedIcon}
							label="Story chapters"
							value={stats.totalChapters}
							subtitle="Total side chapters"
						/>
						<StatCard
							icon={HeartIcon}
							label="Moods available"
							value={availableMoods.length}
							subtitle="Emotional tones"
						/>
					</div>
				</div>
			</section>

			{/* Featured Section */}
			{!filtersActive && loreOfTheDay && (
				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="bg-amber-500/15 text-amber-800">
							<StarIcon className="mr-1 h-3.5 w-3.5" />
							Featured lore
						</Badge>
						<p className="text-sm text-muted-foreground">Lore of the day - rotates daily</p>
					</div>
					<FeaturedLoreCard wiki={loreOfTheDay} />
				</section>
			)}

			{!filtersActive && featuredLores.length > 0 && (
				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="bg-amber-500/15 text-amber-800">
							<StarIcon className="mr-1 h-3.5 w-3.5" />
							Curated picks
						</Badge>
						<p className="text-sm text-muted-foreground">Epic stories and deep lore</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{featuredLores.map((wiki) => (
							<LoreCard key={wiki.urlName} wiki={wiki} />
						))}
					</div>
				</section>
			)}

			{/* All Lores Grid */}
			<section className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-2xl font-semibold tracking-tight">
							{filtersActive ? "Search results" : "All lores"}
						</h2>
						<p className="text-sm text-muted-foreground">
							Showing {displayedWikis.length} of {filteredWikis.length} lores
							{filtersActive ? " (filtered)" : ""}
						</p>
					</div>
					{filtersActive && (
						<Button variant="ghost" size="sm" onClick={handleReset}>
							Clear filters
						</Button>
					)}
				</div>

				{filteredWikis.length === 0 ? (
					<div className="rounded-2xl border border-border/70 bg-muted/40 p-8 text-center">
						<p className="text-lg font-semibold">No lores found</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Try different search terms or clear your filters.
						</p>
						<Button onClick={handleReset} className="mt-4" variant="secondary">
							Reset search
						</Button>
					</div>
				) : (
					<>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{displayedWikis.map((wiki) => (
								<LoreCard key={wiki.urlName} wiki={wiki} />
							))}
						</div>

						{filteredWikis.length > displayedWikis.length && (
							<div className="flex justify-center">
								<Button onClick={() => setVisibleCount((count) => count + 9)} variant="outline">
									Show more lores ({filteredWikis.length - displayedWikis.length} remaining)
								</Button>
							</div>
						)}
					</>
				)}
			</section>
		</div>
	);
};

const StatCard = ({
	icon: Icon,
	label,
	value,
	subtitle,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string | number;
	subtitle: string;
}) => (
	<div className="rounded-2xl border border-border/60 bg-background/70 p-4">
		<div className="flex items-center gap-2 text-sm font-semibold">
			<Icon className="h-4 w-4 text-amber-600" />
			{label}
		</div>
		<div className="mt-2 text-2xl font-bold">{value}</div>
		<p className="text-xs text-muted-foreground">{subtitle}</p>
	</div>
);

const LoreCard = ({ wiki }: { wiki: WikiListing }) => {
	const readingTime = wiki.metadata.readingTimeMinutes;
	const hasChapters = wiki.metadata.hasChapters;
	const chapterCount = wiki.metadata.chapterCount;

	return (
		<Link href={`/lores/${wiki.urlName}`}>
			<Card className="group h-full overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:border-amber-400/70">
				<CardContent className="space-y-3 p-5">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1 flex-1">
							<h3 className="text-xl font-semibold">{tidyLabel(wiki.hero)}</h3>
							{wiki.metadata.teaser && (
								<p className="text-sm text-muted-foreground line-clamp-2">{wiki.metadata.teaser}</p>
							)}
						</div>
					</div>

					{wiki.metadata.hook && (
						<blockquote className="border-l-3 border-amber-500/50 pl-3 text-sm italic text-foreground/80 line-clamp-2">
							{wiki.metadata.hook}
						</blockquote>
					)}

					<div className="flex flex-wrap gap-2">
						{wiki.metadata.moods?.slice(0, 2).map((mood) => (
							<Badge
								key={mood}
								variant="secondary"
								className="bg-amber-500/15 text-amber-800 text-xs"
							>
								{tidyLabel(mood)}
							</Badge>
						))}
						{wiki.metadata.themes?.slice(0, 2).map((theme) => (
							<Badge key={theme} variant="outline" className="text-xs">
								{tidyLabel(theme)}
							</Badge>
						))}
					</div>

					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>{readingTime} min read</span>
						{hasChapters && (
							<span className="flex items-center gap-1">
								<BookMarkedIcon className="h-3 w-3" />
								{chapterCount} chapters
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};

const FeaturedLoreCard = ({ wiki }: { wiki: WikiListing }) => {
	return (
		<Link href={`/lores/${wiki.urlName}`}>
			<Card className="group overflow-hidden border-2 border-amber-500/70 bg-gradient-to-br from-amber-500/10 via-background to-background shadow-lg transition hover:border-amber-500">
				<CardContent className="space-y-4 p-6 sm:p-8">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-2 flex-1">
							<div className="flex items-center gap-2">
								<Badge variant="secondary" className="bg-amber-500 text-amber-950">
									<StarIcon className="mr-1 h-3.5 w-3.5" />
									Featured
								</Badge>
								<Badge variant="outline" className="text-xs">
									{tidyLabel(wiki.metadata.storyType)}
								</Badge>
							</div>
							<h2 className="text-3xl font-bold">{tidyLabel(wiki.hero)}</h2>
							{wiki.metadata.teaser && (
								<p className="text-base text-muted-foreground">{wiki.metadata.teaser}</p>
							)}
						</div>
					</div>

					{wiki.metadata.hook && (
						<blockquote className="border-l-4 border-amber-500 pl-4 text-base italic">
							{wiki.metadata.hook}
						</blockquote>
					)}

					<div className="flex flex-wrap gap-2">
						{wiki.metadata.moods?.map((mood) => (
							<Badge key={mood} variant="secondary" className="bg-amber-500/20 text-amber-900">
								{tidyLabel(mood)}
							</Badge>
						))}
						{wiki.metadata.themes?.slice(0, 3).map((theme) => (
							<Badge key={theme} variant="outline">
								{tidyLabel(theme)}
							</Badge>
						))}
					</div>

					<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-1">
							<ClockIcon className="h-4 w-4" />
							{wiki.metadata.readingTimeMinutes} min read
						</span>
						{wiki.metadata.hasChapters && (
							<span className="flex items-center gap-1">
								<BookMarkedIcon className="h-4 w-4" />
								{wiki.metadata.chapterCount} chapters
							</span>
						)}
						<span className="flex items-center gap-1">
							<UsersIcon className="h-4 w-4" />
							{wiki.metadata.connectionsCount} connections
						</span>
					</div>

					<Button className="w-full bg-amber-600 text-white hover:bg-amber-600/90">
						<BookOpenIcon className="mr-2 h-4 w-4" />
						Read epic story
					</Button>
				</CardContent>
			</Card>
		</Link>
	);
};
