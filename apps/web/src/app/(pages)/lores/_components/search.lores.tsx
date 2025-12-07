"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { cn, tidyLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	BookOpenIcon,
	CompassIcon,
	FlameIcon,
	SearchIcon,
	SparklesIcon,
	Wand2Icon,
} from "lucide-react";
import { resolveImageSrc } from "../../heroes/_components/header.hero";

type LoreSearchProps = {
	heroes: ConsolidatedHeroOptional[];
};

const ROLE_ORDER = ["fighter", "mage", "assassin", "marksman", "tank", "support"];

const ROLE_ICONS: Record<string, string> = {
	assassin: "/images/assassin-role.png",
	fighter: "/images/fighter-role.png",
	mage: "/images/mage-role.png",
	marksman: "/images/marksman-role.png",
	tank: "/images/tank-role.png",
	support: "/images/support-role.png",
};

const hasLore = (hero: ConsolidatedHeroOptional) => hero.profile.tale?.trim().length > 50;

const getHeroRoles = (hero: ConsolidatedHeroOptional) =>
	hero.profile.roles?.map((role) => role.title?.toLowerCase()).filter(Boolean) ?? [];

const excerpt = (text: string, max = 190) => {
	const clean = text?.replace(/\s+/g, " ").trim();
	if (!clean) return "";
	return clean.length > max ? `${clean.slice(0, max).trimEnd()}...` : clean;
};

const formatDate = (date: Date | null) =>
	date
		? date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: null;

export const LoreSearch = ({ heroes }: LoreSearchProps) => {
	const [search, setSearch] = useState("");
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [visibleCount, setVisibleCount] = useState(12);

	useEffect(() => {
		setVisibleCount(12);
	}, [search, selectedRoles]);

	const heroesWithLore = useMemo(() => {
		const filtered = heroes.filter(hasLore);
		console.log(`Heroes received: ${heroes.length}, With lore (>50 chars): ${filtered.length}`);
		if (filtered.length === 0 && heroes.length > 0) {
			console.log("Sample hero tale:", heroes[0]?.profile?.tale?.substring(0, 100));
		}
		return filtered;
	}, [heroes]);

	const availableRoles = useMemo(() => {
		const found = new Set<string>();
		heroesWithLore.forEach((hero) => {
			hero.profile.roles?.forEach((role) => {
				const normalized = role.title?.toLowerCase();
				if (normalized) found.add(normalized);
			});
		});

		const ordered = ROLE_ORDER.filter((role) => found.has(role));
		const extras = Array.from(found)
			.filter((role) => !ROLE_ORDER.includes(role))
			.sort();

		return [...ordered, ...extras];
	}, [heroesWithLore]);

	const fuse = useMemo(() => {
		if (heroesWithLore.length === 0) return null;
		return new Fuse(heroesWithLore, {
			keys: [
				{ name: "profile.name", weight: 0.5 },
				{ name: "profile.url_name", weight: 0.2 },
				{ name: "profile.tagline", weight: 0.15 },
				{ name: "profile.tale", weight: 0.15 },
			],
			threshold: 0.3,
			distance: 100,
			minMatchCharLength: 2,
		});
	}, [heroesWithLore]);

	const baseResults = useMemo(() => {
		if (search.trim() && fuse) {
			return fuse.search(search.trim()).map((result) => result.item);
		}

		return [...heroesWithLore].sort(
			(a, b) =>
				(b.meta?.win_rate ?? 0) - (a.meta?.win_rate ?? 0) ||
				(b.profile.tale?.length ?? 0) - (a.profile.tale?.length ?? 0),
		);
	}, [fuse, heroesWithLore, search]);

	const filteredHeroes = useMemo(() => {
		if (selectedRoles.length === 0) return baseResults;

		return baseResults.filter((hero) =>
			selectedRoles.every((role) => getHeroRoles(hero).includes(role)),
		);
	}, [baseResults, selectedRoles]);

	const displayedHeroes = useMemo(
		() => filteredHeroes.slice(0, visibleCount),
		[filteredHeroes, visibleCount],
	);

	const heroOfTheDay = useMemo(() => {
		if (heroesWithLore.length === 0) return null;
		const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
		return heroesWithLore[daysSinceEpoch % heroesWithLore.length];
	}, [heroesWithLore]);

	const curatedHeroes = useMemo(() => {
		if (heroesWithLore.length === 0) return [];
		const picked: ConsolidatedHeroOptional[] = [];
		const seen = new Set<string>(heroOfTheDay ? [heroOfTheDay.profile.url_name] : []);
		const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

		for (const [idx, role] of availableRoles.entries()) {
			const candidates = heroesWithLore.filter(
				(hero) => getHeroRoles(hero).includes(role) && !seen.has(hero.profile.url_name),
			);

			if (candidates.length === 0) continue;

			const pick = candidates[(daysSinceEpoch + idx) % candidates.length];
			if (!seen.has(pick.profile.url_name)) {
				picked.push(pick);
				seen.add(pick.profile.url_name);
			}

			if (picked.length >= 5) break;
		}

		for (const hero of [...heroesWithLore].sort(
			(a, b) => (b.profile.tale?.length ?? 0) - (a.profile.tale?.length ?? 0),
		)) {
			if (picked.length >= 5) break;
			if (!seen.has(hero.profile.url_name)) {
				picked.push(hero);
				seen.add(hero.profile.url_name);
			}
		}

		return picked;
	}, [availableRoles, heroOfTheDay, heroesWithLore]);

	const lastUpdated = useMemo(() => {
		const stamps = heroesWithLore
			.map((hero) => hero.meta?.updatedAt ?? 0)
			.filter((stamp) => stamp > 0);
		if (!stamps.length) return null;
		return new Date(Math.max(...stamps));
	}, [heroesWithLore]);

	const averageWordCount = useMemo(() => {
		if (!heroesWithLore.length) return null;
		const totalWords = heroesWithLore.reduce(
			(sum, hero) => sum + (hero.profile.tale?.split(/\s+/).length ?? 0),
			0,
		);
		return Math.round(totalWords / heroesWithLore.length);
	}, [heroesWithLore]);

	const sampleQueries = useMemo(() => {
		const nameSeeds = heroesWithLore.slice(0, 3).map((hero) => hero.profile.name);
		const specialitySeeds = heroesWithLore
			.flatMap((hero) => hero.profile.speciality ?? [])
			.slice(0, 4);

		return Array.from(new Set([...nameSeeds, ...specialitySeeds])).slice(0, 5);
	}, [heroesWithLore]);

	const filtersActive = Boolean(search.trim()) || selectedRoles.length > 0;

	const handleRoleToggle = (role: string) => {
		setSelectedRoles((prev) =>
			prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
		);
	};

	const handleReset = () => {
		setSearch("");
		setSelectedRoles([]);
		setVisibleCount(12);
	};

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
			<section className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-background via-background to-muted/30 shadow-sm">
				<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
					<div className="space-y-6 p-6 sm:p-8">
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="bg-amber-500/10 text-amber-700">
								<SparklesIcon className="mr-1 h-3.5 w-3.5" />
								Lore explorer
							</Badge>
							{filtersActive && (
								<span className="text-xs uppercase tracking-wide text-muted-foreground">
									{selectedRoles.length > 0 && `${selectedRoles.length} role filter(s)`}{" "}
									{search.trim() && " + search active"}
								</span>
							)}
						</div>

						<div className="space-y-2">
							<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
								Discover hero stories &amp; legends
							</h1>
							<p className="max-w-2xl text-muted-foreground">
								Search, filter, and skim lore excerpts without leaving the page. Every result links
								to the full wiki entry.
							</p>
						</div>

						<div className="space-y-4">
							<div className="relative">
								<SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search hero lores, moods, or titles..."
									className="h-14 rounded-xl border-amber-500/30 bg-background/60 pl-12 pr-36 text-lg shadow-xs focus-visible:border-amber-500 focus-visible:ring-amber-500/40"
									aria-label="Search hero lores"
								/>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={() => heroOfTheDay && setSearch(heroOfTheDay.profile.name)}
									className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-amber-500/15 text-amber-700 hover:bg-amber-500/25"
								>
									<SparklesIcon className="h-4 w-4" />
									Surprise me
								</Button>
							</div>

							{availableRoles.length > 0 && (
								<div className="flex flex-wrap items-center gap-2">
									{availableRoles.map((role) => (
										<Button
											key={role}
											type="button"
											variant={selectedRoles.includes(role) ? "default" : "outline"}
											size="sm"
											onClick={() => handleRoleToggle(role)}
											className={cn(
												"h-9 rounded-full border-border/70 px-3",
												selectedRoles.includes(role)
													? "border-amber-500 bg-amber-500/20 text-amber-900"
													: "bg-background/60",
											)}
										>
											{ROLE_ICONS[role] && (
												<img
													src={ROLE_ICONS[role]}
													alt=""
													className="h-5 w-5 rounded-full bg-background"
												/>
											)}
											<span>{tidyLabel(role)}</span>
										</Button>
									))}
								</div>
							)}

							{sampleQueries.length > 0 && (
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-xs uppercase tracking-wide text-muted-foreground">
										Mood picks
									</span>
									{sampleQueries.map((query) => (
										<Button
											key={query}
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => setSearch(query)}
											className="h-8 rounded-full px-3 text-xs"
										>
											<Wand2Icon className="h-3.5 w-3.5" />
											{query}
										</Button>
									))}
								</div>
							)}
						</div>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div className="rounded-2xl border border-border/80 bg-background/70 p-3">
								<div className="flex items-center gap-2 text-sm font-semibold">
									<CompassIcon className="h-4 w-4 text-amber-600" />
									Lores ready
								</div>
								<div className="mt-2 text-2xl font-bold">{heroesWithLore.length}</div>
								<p className="text-xs text-muted-foreground">Tales with substance (50+ words)</p>
							</div>
							<div className="rounded-2xl border border-border/80 bg-background/70 p-3">
								<div className="flex items-center gap-2 text-sm font-semibold">
									<FlameIcon className="h-4 w-4 text-amber-600" />
									Avg length
								</div>
								<div className="mt-2 text-2xl font-bold">
									{averageWordCount ? `${averageWordCount} words` : "-"}
								</div>
								<p className="text-xs text-muted-foreground">Across featured hero lores</p>
							</div>
							<div className="rounded-2xl border border-border/80 bg-background/70 p-3">
								<div className="flex items-center gap-2 text-sm font-semibold">
									<SearchIcon className="h-4 w-4 text-amber-600" />
									Roles covered
								</div>
								<div className="mt-2 text-2xl font-bold">{availableRoles.length}</div>
								<p className="text-xs text-muted-foreground">Toggle multiple roles together</p>
							</div>
							<div className="rounded-2xl border border-border/80 bg-background/70 p-3">
								<div className="flex items-center gap-2 text-sm font-semibold">
									<BookOpenIcon className="h-4 w-4 text-amber-600" />
									Updated
								</div>
								<div className="mt-2 text-2xl font-bold">{formatDate(lastUpdated) ?? "-"}</div>
								<p className="text-xs text-muted-foreground">Meta freshness for stats badges</p>
							</div>
						</div>
					</div>

					<div className="border-t border-border/60 bg-muted/40 p-6 sm:p-8 lg:border-l lg:border-t-0">
						{heroOfTheDay ? (
							<FeaturedLoreCard hero={heroOfTheDay} />
						) : (
							<div className="space-y-4">
								<Skeleton className="h-10 w-32 rounded-lg" />
								<Skeleton className="h-48 w-full rounded-2xl" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-2/3" />
									<Skeleton className="h-8 w-28" />
								</div>
							</div>
						)}
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-2xl font-semibold tracking-tight">Lore library</h2>
						<p className="text-sm text-muted-foreground">
							Showing {displayedHeroes.length} of {filteredHeroes.length} lores
							{filtersActive ? " (filtered)" : ""}. Tap a card to read the full story.
						</p>
						{filtersActive && (
							<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
								{search.trim() && (
									<Badge variant="secondary" className="bg-amber-500/15 text-amber-800">
										<SearchIcon className="mr-1 h-3 w-3" />
										{search}
									</Badge>
								)}
								{selectedRoles.map((role) => (
									<Badge key={role} variant="secondary">
										{tidyLabel(role)}
									</Badge>
								))}
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						{filtersActive && (
							<Button variant="ghost" size="sm" onClick={handleReset}>
								Clear filters
							</Button>
						)}
					</div>
				</div>

				{!filtersActive && curatedHeroes.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="bg-amber-500/15 text-amber-800">
								<FlameIcon className="mr-1 h-3.5 w-3.5" />
								Featured rotation
							</Badge>
							<p className="text-sm text-muted-foreground">
								Quick picks pulled from different roles and longer tales.
							</p>
						</div>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{curatedHeroes.slice(0, 3).map((hero) => (
								<LoreCard key={hero.profile.url_name} hero={hero} dense />
							))}
						</div>
					</div>
				)}

				{filteredHeroes.length === 0 ? (
					<div className="rounded-2xl border border-border/70 bg-muted/40 p-6 text-center">
						<p className="text-lg font-semibold">No lores found</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Try different search terms or clear your role filters.
						</p>
						<Button onClick={handleReset} className="mt-4" variant="secondary">
							Reset search
						</Button>
					</div>
				) : (
					<>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{displayedHeroes.map((hero) => (
								<LoreCard key={hero.profile.url_name} hero={hero} />
							))}
						</div>

						{filteredHeroes.length > displayedHeroes.length && (
							<div className="flex justify-center">
								<Button onClick={() => setVisibleCount((count) => count + 9)} variant="outline">
									Show more lores
								</Button>
							</div>
						)}
					</>
				)}
			</section>
		</div>
	);
};

type LoreCardProps = {
	hero: ConsolidatedHeroOptional;
	dense?: boolean;
};

const LoreCard = ({ hero, dense = false }: LoreCardProps) => {
	const images = Object.values(hero.profile.images).map((h) => h);
	const imageSrc = resolveImageSrc(...images);
	const roles = getHeroRoles(hero);
	const loreExcerpt = excerpt(hero.profile.tale, dense ? 120 : 180);
	const winRate = hero.meta?.win_rate ? `${(hero.meta.win_rate * 100).toFixed(1)}%` : null;
	const pickRate = hero.meta?.pick_rate ? `${(hero.meta.pick_rate * 100).toFixed(1)}%` : null;

	return (
		<Card className="group h-full overflow-hidden border-border/70 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:border-amber-400/70">
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl border border-border/70 bg-muted/50",
					dense ? "h-32" : "h-40",
				)}
			>
				{imageSrc ? (
					<img
						src={imageSrc}
						alt={hero.profile.name}
						className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
						loading="lazy"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
						No art available
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
				<div className="absolute left-3 top-3 flex gap-2 text-[11px]">
					{winRate && (
						<Badge variant="secondary" className="bg-amber-500/20 text-amber-900">
							WR {winRate}
						</Badge>
					)}
					{pickRate && (
						<Badge variant="secondary" className="bg-background/80 text-foreground/80">
							PR {pickRate}
						</Badge>
					)}
				</div>
			</div>
			<CardContent className="space-y-3">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-1">
						<h3 className={cn("font-semibold", dense ? "text-lg" : "text-xl")}>
							{hero.profile.name}
						</h3>
						{hero.profile.tagline && (
							<p className="text-xs italic text-muted-foreground line-clamp-2">
								{hero.profile.tagline}
							</p>
						)}
					</div>
					<Link
						href={`/wiki/${hero.profile.url_name}`}
						className="shrink-0 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-500/25"
					>
						Read
					</Link>
				</div>
				{loreExcerpt && (
					<p className="text-sm leading-relaxed text-foreground/90 line-clamp-3">{loreExcerpt}</p>
				)}
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap gap-2">
						{roles.map((role) => (
							<Badge key={role} variant="secondary" className="bg-background/70">
								{tidyLabel(role)}
							</Badge>
						))}
					</div>
					<Link
						href={`/wiki/${hero.profile.url_name}`}
						className="text-sm text-amber-700 hover:underline"
					>
						Read full lore
					</Link>
				</div>
			</CardContent>
		</Card>
	);
};

const FeaturedLoreCard = ({ hero }: { hero: ConsolidatedHeroOptional }) => {
	const images = Object.values(hero.profile.images).map((h) => h);
	const imageSrc = resolveImageSrc(...images);
	const roles = getHeroRoles(hero);
	const loreExcerpt = excerpt(hero.profile.tale, 180);

	return (
		<div className="flex h-full flex-col gap-4 rounded-2xl border-2 border-amber-500/70 bg-gradient-to-br from-amber-500/10 via-background to-background p-5 shadow-md">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-amber-900">Lore of the day</h3>
					<p className="text-xs text-muted-foreground">Rotates daily for fresh inspiration</p>
				</div>
				<Badge variant="secondary" className="bg-amber-500 text-amber-950">
					<SparklesIcon className="mr-1 h-3.5 w-3.5" />
					Featured
				</Badge>
			</div>
			<div className="relative overflow-hidden rounded-xl border border-amber-500/60 bg-muted/70">
				{imageSrc ? (
					<img
						src={imageSrc}
						alt={hero.profile.name}
						className="h-48 w-full object-cover object-top"
						loading="lazy"
					/>
				) : (
					<div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
						No art available
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
				<div className="absolute bottom-3 left-3 space-y-1">
					<h4 className="text-2xl font-bold text-foreground">{hero.profile.name}</h4>
					{hero.profile.tagline && (
						<p className="text-sm italic text-muted-foreground">{hero.profile.tagline}</p>
					)}
					<div className="flex flex-wrap gap-2">
						{roles.map((role) => (
							<Badge key={role} variant="secondary" className="bg-background/80">
								{tidyLabel(role)}
							</Badge>
						))}
					</div>
				</div>
			</div>
			{loreExcerpt && <p className="text-sm leading-relaxed text-foreground/90">{loreExcerpt}</p>}
			<div className="flex flex-wrap gap-2">
				<Link href={`/wiki/${hero.profile.url_name}`} className="flex-1">
					<Button className="w-full bg-amber-600 text-white hover:bg-amber-600/90">
						<BookOpenIcon className="mr-2 h-4 w-4" />
						Read full lore
					</Button>
				</Link>
				<Button
					variant="outline"
					className="flex-1 border-amber-500/60 text-amber-800 hover:border-amber-500 hover:bg-amber-500/15"
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				>
					<SearchIcon className="mr-2 h-4 w-4" />
					Search again
				</Button>
			</div>
		</div>
	);
};
