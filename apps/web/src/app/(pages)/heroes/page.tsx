"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { makeUrl } from "@/lib/utils.api";
import { tidyLabel } from "@/lib/utils";
import { resolveImageSrc } from "./_components/header.hero";
import { Search, SlidersHorizontal, ArrowUpDown, Loader2 } from "lucide-react";

const ROLES = ["All", "Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support"] as const;
type Role = (typeof ROLES)[number];

const SORT_OPTIONS = [
	{ value: "name", label: "Name" },
	{ value: "win_rate", label: "Win Rate" },
	{ value: "pick_rate", label: "Pick Rate" },
	{ value: "ban_rate", label: "Ban Rate" },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const formatPercent = (value?: number, digits = 1) =>
	value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;

export default function HeroesPage() {
	const [heroes, setHeroes] = useState<ConsolidatedHeroOptional[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [selectedRole, setSelectedRole] = useState<Role>("All");
	const [sortBy, setSortBy] = useState<SortOption>("name");
	const [sortDesc, setSortDesc] = useState(false);

	useEffect(() => {
		async function fetchHeroes() {
			try {
				const response = await fetch(makeUrl("/v1/heroes?limit=200&include=meta"));
				if (response.ok) {
					const data: ConsolidatedHeroOptional[] = await response.json();
					setHeroes(data);
				}
			} catch (error) {
				console.error("Failed to fetch heroes:", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchHeroes();
	}, []);

	const filteredHeroes = useMemo(() => {
		let result = [...heroes];

		// Filter by search
		if (search.trim()) {
			const searchLower = search.toLowerCase();
			result = result.filter((hero) =>
				hero.profile.name.toLowerCase().includes(searchLower)
			);
		}

		// Filter by role
		if (selectedRole !== "All") {
			result = result.filter((hero) =>
				hero.profile.roles.some(
					(role) => role.title.toLowerCase() === selectedRole.toLowerCase()
				)
			);
		}

		// Sort
		result.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "name":
					comparison = a.profile.name.localeCompare(b.profile.name);
					break;
				case "win_rate":
					comparison = (a.meta?.win_rate ?? 0) - (b.meta?.win_rate ?? 0);
					break;
				case "pick_rate":
					comparison = (a.meta?.pick_rate ?? 0) - (b.meta?.pick_rate ?? 0);
					break;
				case "ban_rate":
					comparison = (a.meta?.ban_rate ?? 0) - (b.meta?.ban_rate ?? 0);
					break;
			}
			return sortDesc ? -comparison : comparison;
		});

		return result;
	}, [heroes, search, selectedRole, sortBy, sortDesc]);

	const toggleSort = (option: SortOption) => {
		if (sortBy === option) {
			setSortDesc(!sortDesc);
		} else {
			setSortBy(option);
			setSortDesc(option !== "name"); // Default descending for stats, ascending for name
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 pb-16 pt-8">
			{/* Header */}
			<header className="mb-8">
				<h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Heroes</h1>
				<p className="text-muted-foreground">
					Browse all {heroes.length} heroes with stats, counters, and builds
				</p>
			</header>

			{/* Filters */}
			<div className="mb-6 space-y-4">
				{/* Search */}
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search heroes..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="h-11 pl-10"
					/>
				</div>

				{/* Role filters */}
				<div className="flex flex-wrap gap-2">
					{ROLES.map((role) => (
						<Button
							key={role}
							variant={selectedRole === role ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedRole(role)}
							className={
								selectedRole === role
									? "bg-amber-500 text-foreground hover:bg-amber-600"
									: ""
							}
						>
							{role}
						</Button>
					))}
				</div>

				{/* Sort options */}
				<div className="flex items-center gap-2 text-sm">
					<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
					<span className="text-muted-foreground">Sort by:</span>
					<div className="flex flex-wrap gap-1">
						{SORT_OPTIONS.map((option) => (
							<Button
								key={option.value}
								variant="ghost"
								size="sm"
								onClick={() => toggleSort(option.value)}
								className={`gap-1 ${sortBy === option.value ? "bg-accent" : ""}`}
							>
								{option.label}
								{sortBy === option.value && (
									<ArrowUpDown
										className={`h-3 w-3 ${sortDesc ? "rotate-180" : ""} transition-transform`}
									/>
								)}
							</Button>
						))}
					</div>
				</div>
			</div>

			{/* Results count */}
			<p className="mb-4 text-sm text-muted-foreground">
				Showing {filteredHeroes.length} of {heroes.length} heroes
			</p>

			{/* Hero grid */}
			{filteredHeroes.length > 0 ? (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{filteredHeroes.map((hero) => {
						const image = resolveImageSrc(
							hero.profile.images.squarehead_big,
							hero.profile.images.head_big,
							hero.profile.images.painting
						);
						const winRate = hero.meta?.win_rate ?? 0;
						const pickRate = hero.meta?.pick_rate ?? 0;
						const banRate = hero.meta?.ban_rate ?? 0;
						const isHighWinRate = winRate >= 0.52;
						const isHighBanRate = banRate >= 0.15;

						return (
							<Link
								key={hero.profile.id}
								href={`/heroes/${hero.profile.name.toLowerCase().replace(/\s+/g, "-")}?rank=overall`}
								className="group flex gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border hover:bg-accent/30"
							>
								{/* Hero image */}
								<div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60">
									{image ? (
										<img
											src={image}
											alt={hero.profile.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-muted text-lg font-bold text-muted-foreground">
											{hero.profile.name.charAt(0)}
										</div>
									)}
								</div>

								{/* Hero info */}
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-start justify-between gap-2">
										<h3 className="truncate font-semibold group-hover:text-amber-600">
											{hero.profile.name}
										</h3>
										{hero.profile.difficulty && (
											<span className="shrink-0 text-xs text-muted-foreground">
												{hero.profile.difficulty}
											</span>
										)}
									</div>

									{/* Role badges */}
									<div className="mb-2 flex flex-wrap gap-1">
										{hero.profile.roles.slice(0, 2).map((role) => (
											<Badge
												key={role.title}
												variant="secondary"
												className="bg-background/60 text-xs"
											>
												{tidyLabel(role.title)}
											</Badge>
										))}
									</div>

									{/* Stats */}
									<div className="flex items-center gap-3 text-xs">
										<span
											className={
												isHighWinRate
													? "font-medium text-emerald-600 dark:text-emerald-400"
													: "text-muted-foreground"
											}
										>
											{formatPercent(winRate)} WR
										</span>
										<span className="text-muted-foreground">
											{formatPercent(pickRate, 2)} PR
										</span>
										<span
											className={
												isHighBanRate
													? "font-medium text-amber-600 dark:text-amber-400"
													: "text-muted-foreground"
											}
										>
											{formatPercent(banRate)} BR
										</span>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			) : (
				<div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60">
					<p className="text-muted-foreground">No heroes found matching your filters</p>
				</div>
			)}
		</div>
	);
}
