"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { WikiListing } from "../page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	BookOpenIcon,
	BookMarkedIcon,
	ClockIcon,
	HeartIcon,
	SearchIcon,
	StarIcon,
	UsersIcon,
	ArrowRight,
	Sparkles,
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
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
			{/* Hero Section - Clean like home page */}
			<section className="text-center">
				<h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
					Explore epic{" "}
					<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
						tales & legends
					</span>
				</h1>

				<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
					Discover rich hero stories with themes, moods, and deep narrative connections. Filter by
					emotion and find your next favorite lore.
				</p>

				{/* Search */}
				<div className="mx-auto mb-6 max-w-xl">
					<div className="relative">
						<SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by hero, theme, or mood..."
							className="h-12 rounded-xl border-border bg-background pl-12 text-base"
							aria-label="Search lore"
						/>
					</div>
				</div>

				{/* Filters */}
				<div className="mx-auto max-w-3xl space-y-4">
					{availableMoods.length > 0 && (
						<div className="flex flex-wrap items-center justify-center gap-2">
							<span className="text-sm text-muted-foreground">Mood:</span>
							{availableMoods.slice(0, 6).map((mood) => (
								<Button
									key={mood}
									type="button"
									variant={selectedMoods.includes(mood) ? "default" : "outline"}
									size="sm"
									onClick={() => handleMoodToggle(mood)}
									className={cn(
										"h-8 rounded-full px-3 text-xs",
										selectedMoods.includes(mood) && "bg-amber-500 text-amber-950 hover:bg-amber-600",
									)}
								>
									{tidyLabel(mood)}
								</Button>
							))}
						</div>
					)}

					{availableThemes.length > 0 && (
						<div className="flex flex-wrap items-center justify-center gap-2">
							<span className="text-sm text-muted-foreground">Theme:</span>
							{availableThemes.slice(0, 6).map((theme) => (
								<Button
									key={theme}
									type="button"
									variant={selectedThemes.includes(theme) ? "default" : "outline"}
									size="sm"
									onClick={() => handleThemeToggle(theme)}
									className={cn(
										"h-8 rounded-full px-3 text-xs",
										selectedThemes.includes(theme) && "bg-amber-500 text-amber-950 hover:bg-amber-600",
									)}
								>
									{tidyLabel(theme)}
								</Button>
							))}
						</div>
					)}

					{filtersActive && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleReset}
							className="text-muted-foreground"
						>
							Clear filters
						</Button>
					)}
				</div>
			</section>

			{/* Featured Lore of the Day */}
			{!filtersActive && loreOfTheDay && (
				<section>
					<div className="mb-4 flex items-center gap-2">
						<StarIcon className="h-5 w-5 text-amber-500" />
						<h2 className="text-lg font-semibold">Lore of the Day</h2>
						<span className="text-sm text-muted-foreground">— rotates daily</span>
					</div>
					<FeaturedLoreCard wiki={loreOfTheDay} />
				</section>
			)}

			{/* Curated Picks */}
			{!filtersActive && featuredLores.length > 0 && (
				<section>
					<div className="mb-4 flex items-center gap-2">
						<BookOpenIcon className="h-5 w-5 text-amber-500" />
						<h2 className="text-lg font-semibold">Epic Stories</h2>
					</div>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{featuredLores.map((wiki) => (
							<LoreCard key={wiki.urlName} wiki={wiki} />
						))}
					</div>
				</section>
			)}

			{/* All Lores Grid */}
			<section>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold">
							{filtersActive ? "Search Results" : "All Lores"}
						</h2>
						<p className="text-sm text-muted-foreground">
							Showing {displayedWikis.length} of {filteredWikis.length} lores
						</p>
					</div>
				</div>

				{filteredWikis.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
						<p className="text-lg font-medium">No lores found</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Try different search terms or clear your filters.
						</p>
						<Button onClick={handleReset} className="mt-4" variant="outline">
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
							<div className="mt-8 flex justify-center">
								<Button onClick={() => setVisibleCount((count) => count + 9)} variant="outline">
									Show more ({filteredWikis.length - displayedWikis.length} remaining)
								</Button>
							</div>
						)}
					</>
				)}
			</section>
		</div>
	);
};

const LoreCard = ({ wiki }: { wiki: WikiListing }) => {
	const readingTime = wiki.metadata.readingTimeMinutes;
	const hasChapters = wiki.metadata.hasChapters;
	const chapterCount = wiki.metadata.chapterCount;

	return (
		<Link
			href={`/lores/${wiki.urlName}`}
			className="group flex flex-col rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-lg"
		>
			<div className="mb-2 flex items-start justify-between gap-3">
				<h3 className="text-lg font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400">
					{tidyLabel(wiki.hero)}
				</h3>
				{wiki.metadata.epicnessScore > 70 && (
					<Badge className="shrink-0 bg-amber-500 text-amber-950 text-xs">Epic</Badge>
				)}
			</div>

			{wiki.metadata.teaser && (
				<p className="mb-3 text-sm text-muted-foreground line-clamp-2">{wiki.metadata.teaser}</p>
			)}

			{wiki.metadata.hook && (
				<blockquote className="mb-3 border-l-2 border-amber-500/50 pl-3 text-sm italic text-muted-foreground line-clamp-2">
					{wiki.metadata.hook}
				</blockquote>
			)}

			<div className="mb-3 flex flex-wrap gap-1.5">
				{wiki.metadata.moods?.slice(0, 2).map((mood) => (
					<Badge key={mood} variant="secondary" className="text-xs">
						{tidyLabel(mood)}
					</Badge>
				))}
				{wiki.metadata.themes?.slice(0, 1).map((theme) => (
					<Badge key={theme} variant="outline" className="text-xs">
						{tidyLabel(theme)}
					</Badge>
				))}
			</div>

			<div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
				<span className="flex items-center gap-1">
					<ClockIcon className="h-3 w-3" />
					{readingTime} min
				</span>
				{hasChapters && (
					<span className="flex items-center gap-1">
						<BookMarkedIcon className="h-3 w-3" />
						{chapterCount} chapters
					</span>
				)}
				<span className="flex items-center gap-1">
					<UsersIcon className="h-3 w-3" />
					{wiki.metadata.connectionsCount}
				</span>
			</div>
		</Link>
	);
};

const FeaturedLoreCard = ({ wiki }: { wiki: WikiListing }) => {
	return (
		<Link
			href={`/lores/${wiki.urlName}`}
			className="group block rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/5 via-background to-background p-6 transition-all hover:border-amber-500 hover:shadow-lg sm:p-8"
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex-1 space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<Badge className="bg-amber-500 text-amber-950">
							<StarIcon className="mr-1 h-3 w-3" />
							Featured
						</Badge>
						<Badge variant="outline" className="text-xs">
							{tidyLabel(wiki.metadata.storyType)}
						</Badge>
					</div>

					<h2 className="text-2xl font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 sm:text-3xl">
						{tidyLabel(wiki.hero)}
					</h2>

					{wiki.metadata.teaser && <p className="text-muted-foreground">{wiki.metadata.teaser}</p>}

					{wiki.metadata.hook && (
						<blockquote className="border-l-4 border-amber-500 pl-4 italic text-foreground/80">
							"{wiki.metadata.hook}"
						</blockquote>
					)}
				</div>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				{wiki.metadata.moods?.slice(0, 3).map((mood) => (
					<Badge key={mood} variant="secondary" className="text-xs">
						{tidyLabel(mood)}
					</Badge>
				))}
				{wiki.metadata.themes?.slice(0, 2).map((theme) => (
					<Badge key={theme} variant="outline" className="text-xs">
						{tidyLabel(theme)}
					</Badge>
				))}
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

			<div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
				Read story
				<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
			</div>
		</Link>
	);
};
