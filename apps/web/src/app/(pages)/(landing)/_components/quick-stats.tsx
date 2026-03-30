"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { makeUrl } from "@/lib/utils.api";
import { tidyLabel } from "@/lib/utils";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Users, ChevronRight, Flame, Target } from "lucide-react";

const RANKS = [
	{ value: "overall", label: "Overall" },
	{ value: "glory", label: "Glory" },
] as const;

type StatKey = "ban_rate" | "pick_rate" | "win_rate";

type StatCardData = {
	key: StatKey;
	label: string;
	shortLabel: string;
	hero: ConsolidatedHeroOptional | null;
	others: string;
	value: number;
	average: number;
	fillGradient: string;
	badgeClass: string;
};

const formatPercent = (value?: number, digits = 1) =>
	value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;

const resolveImageSrc = (...sources: (string | undefined | null)[]) =>
	sources.find((s) => s && s.trim() !== "") || null;


export function QuickStats() {
	const [rank, setRank] = useState("glory");
	const [heroes, setHeroes] = useState<ConsolidatedHeroOptional[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchHeroes() {
			setIsLoading(true);
			try {
				const response = await fetch(makeUrl(`/v1/heroes?limit=200&include=meta&rank=${rank}`));
				if (response.ok) {
					const data = (await response.json()) as ConsolidatedHeroOptional[];
					setHeroes(data);
				}
			} catch (error) {
				console.error("Failed to fetch heroes:", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchHeroes();
	}, [rank]);

	const latestUpdatedAt = useMemo(
		() => heroes.reduce((latest, hero) => Math.max(latest, hero.meta?.updatedAt ?? 0), 0),
		[heroes],
	);

	const averageRates = useMemo(() => {
		const base = { ban_rate: 0, pick_rate: 0, win_rate: 0 };
		if (!heroes.length) return base;

		return heroes.reduce(
			(acc, hero) => ({
				ban_rate: acc.ban_rate + (hero.meta?.ban_rate ?? 0),
				pick_rate: acc.pick_rate + (hero.meta?.pick_rate ?? 0),
				win_rate: acc.win_rate + (hero.meta?.win_rate ?? 0),
			}),
			base,
		);
	}, [heroes]);

	const getTopList = (key: StatKey) =>
		heroes
			.slice()
			.sort((a, b) => (b.meta?.[key] ?? 0) - (a.meta?.[key] ?? 0))
			.slice(0, 3);

	const topBanned = getTopList("ban_rate");
	const topPicked = getTopList("pick_rate");
	const topWinners = getTopList("win_rate");

	const baseStats = [
		{
			key: "ban_rate",
			label: "Most Banned",
			shortLabel: "Ban rate",
			hero: topBanned[0] ?? null,
			others:
				topBanned
					.slice(1)
					.map((h) => tidyLabel(h.profile.name))
					.join(" · ") || "—",
			value: topBanned[0]?.meta?.ban_rate ?? 0,
			average: heroes.length ? averageRates.ban_rate / heroes.length : 0,
			fillGradient: "from-amber-500 via-amber-500/90 to-amber-400",
			badgeClass:
				"border border-amber-200/60 bg-amber-500/15 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
		},
		{
			key: "pick_rate",
			label: "Most Picked",
			shortLabel: "Pick rate",
			hero: topPicked[0] ?? null,
			others:
				topPicked
					.slice(1)
					.map((h) => tidyLabel(h.profile.name))
					.join(" · ") || "—",
			value: topPicked[0]?.meta?.pick_rate ?? 0,
			average: heroes.length ? averageRates.pick_rate / heroes.length : 0,
			fillGradient: "from-amber-500 via-amber-500/90 to-amber-400",
			badgeClass:
				"border border-amber-200/60 bg-amber-500/15 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
		},
		{
			key: "win_rate",
			label: "Highest Win Rate",
			shortLabel: "Win rate",
			hero: topWinners[0] ?? null,
			others:
				topWinners
					.slice(1)
					.map((h) => tidyLabel(h.profile.name))
					.join(" · ") || "—",
			value: topWinners[0]?.meta?.win_rate ?? 0,
			average: heroes.length ? averageRates.win_rate / heroes.length : 0,
			fillGradient: "from-amber-500 via-amber-500/90 to-amber-400",
			badgeClass:
				"border border-amber-200/60 bg-amber-500/15 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
		},
	] satisfies StatCardData[];

	const stats = baseStats.filter(
		(entry): entry is StatCardData & { hero: ConsolidatedHeroOptional } => Boolean(entry.hero),
	);

	const maxRate = Math.max(...stats.map((stat) => stat.value || 0), 0.0001);

	return (
		<section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
			<div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
						<Flame className="h-5 w-5" />
					</div>
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-500">
							Meta pulse
						</p>
						{latestUpdatedAt ? (
							<p className="text-xs text-muted-foreground">
								Updated {formatDistanceToNow(new Date(latestUpdatedAt), { addSuffix: true })}
							</p>
						) : null}
					</div>
				</div>

				<Select value={rank} onValueChange={setRank}>
					<SelectTrigger className="h-9 w-[112px] border-border/60 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{RANKS.map((r) => (
							<SelectItem key={r.value} value={r.value} className="text-xs">
								{r.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-1 flex-col">
				{isLoading ? (
					<div className="flex flex-1 flex-col gap-4 px-5 py-6">
						{[1, 2, 3].map((item) => (
							<div
								key={item}
								className="space-y-3 rounded-xl border border-border/50 bg-muted/10 p-4"
							>
								<div className="flex items-center justify-between">
									<div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
									<div className="h-3 w-14 animate-pulse rounded-full bg-muted" />
								</div>
								<div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
								<div className="h-2 w-full animate-pulse rounded-full bg-muted" />
							</div>
						))}
					</div>
				) : stats.length ? (
					<div className="flex flex-1 flex-col divide-y divide-border/40">
						{stats.map((stat) => {
							if (!stat.hero) return null;

							const heroImage = resolveImageSrc(
								stat.hero.profile.images.painting,
								stat.hero.profile.images.squarehead_big,
								stat.hero.profile.images.head_big,
							);
							const heroSlug = stat.hero.profile.url_name;
							const delta = stat.value - stat.average;
							const progress = Math.min(100, Math.max(8, (stat.value / maxRate) * 100));

							return (
								<Link
									key={stat.label}
									href={`/heroes/${heroSlug}?rank=${rank}`}
									className="group relative flex flex-col gap-3 overflow-hidden px-5 py-4 transition-colors hover:bg-accent/30"
								>
									<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

									<div className="flex items-start gap-4">
										<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted">
											{heroImage ? (
												<img
													src={heroImage}
													alt={stat.hero.profile.name}
													className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-muted">
													<Users className="h-5 w-5 text-muted-foreground" />
												</div>
											)}
										</div>

										<div className="min-w-0 flex-1 space-y-1">
											<div className="flex items-center justify-between gap-2">
												<Badge className={`text-[10px] ${stat.badgeClass}`}>{stat.label}</Badge>
												<span className="text-lg font-semibold">{formatPercent(stat.value)}</span>
											</div>
											<div className="flex items-center justify-between gap-2">
												<p className="truncate text-base font-semibold">
													{tidyLabel(stat.hero.profile.name)}
												</p>
												<span
													className={`text-sm font-medium ${
														delta >= 0 ? "text-emerald-500" : "text-rose-500"
													}`}
												>
													{delta >= 0 ? "+" : ""}
													{(delta * 100).toFixed(1)} pp vs avg
												</span>
											</div>

											<div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
												<div
													className={`h-full rounded-full bg-gradient-to-r ${stat.fillGradient}`}
													style={{ width: `${progress}%` }}
												/>
											</div>

											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Users className="h-3.5 w-3.5" />
												<span className="truncate">Next up: {stat.others}</span>
											</div>
										</div>

										<ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
									</div>
								</Link>
							);
						})}
					</div>
				) : (
					<div className="flex flex-1 items-center justify-center px-5 py-8 text-sm text-muted-foreground">
						No meta data available right now.
					</div>
				)}
			</div>

			<div className="border-t border-border/40 px-5 py-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span className="h-2 w-2 rounded-full bg-amber-500" />
						<span>See lane, role, and matchup breakdowns in the full report.</span>
					</div>
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="gap-1.5 text-muted-foreground hover:text-foreground"
					>
						<Link href="/meta">
							<Target className="h-3.5 w-3.5" />
							View meta report
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
