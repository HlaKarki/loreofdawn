"use client";

import { useState, useMemo } from "react";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { HeroCard } from "./hero-card";
import { FilterToolbar, type FilterState } from "./filter-toolbar";
import Fuse from "fuse.js";

type HeroGridWithFiltersProps = {
	heroes: ConsolidatedHeroOptional[];
	isDiscovered: (urlName: string) => boolean;
	getDiscoverySource: (urlName: string) => string | null;
	onDiscover: (urlName: string, discoveredVia: string | null) => void;
	onViewConnections: (hero: ConsolidatedHeroOptional) => void;
	modalOpen: boolean;
	highlightedHeroIds: Set<number>;
};

export function HeroGridWithFilters({
	heroes,
	isDiscovered,
	getDiscoverySource,
	onDiscover,
	onViewConnections,
	modalOpen,
	highlightedHeroIds,
}: HeroGridWithFiltersProps) {
	// Component-specific state
	const [filters, setFilters] = useState<FilterState>({
		search: "",
		roles: [],
		discoveryStatus: "all",
		sortBy: "alphabetical",
	});
	const [displayCount, setDisplayCount] = useState(30);

	// Fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(heroes, {
			keys: ["profile.name", "profile.url_name"],
			threshold: 0.3,
			distance: 100,
			minMatchCharLength: 1,
		});
	}, [heroes]);

	// Filter and sort heroes
	const filteredHeroes = useMemo(() => {
		let result = heroes;

		// Search filter
		if (filters.search.trim()) {
			const searchResults = fuse.search(filters.search);
			result = searchResults.map((r) => r.item);
		}

		// Role filter
		if (filters.roles.length > 0) {
			result = result.filter((hero) =>
				hero.profile.roles?.some((role) => filters.roles.includes(role.title.toLowerCase())),
			);
		}

		// Discovery status filter
		if (filters.discoveryStatus === "discovered") {
			result = result.filter((hero) => isDiscovered(hero.profile.url_name));
		} else if (filters.discoveryStatus === "undiscovered") {
			result = result.filter((hero) => !isDiscovered(hero.profile.url_name));
		}

		// Sort
		switch (filters.sortBy) {
			case "alphabetical":
				result = [...result].sort((a, b) => a.profile.name.localeCompare(b.profile.name));
				break;
			case "role":
				result = [...result].sort((a, b) => {
					const roleA = a.profile.roles?.[0]?.title ?? "";
					const roleB = b.profile.roles?.[0]?.title ?? "";
					return roleA.localeCompare(roleB);
				});
				break;
			case "discovery":
				result = [...result].sort((a, b) => {
					const aDiscovered = isDiscovered(a.profile.url_name);
					const bDiscovered = isDiscovered(b.profile.url_name);
					if (aDiscovered && !bDiscovered) return -1;
					if (!aDiscovered && bDiscovered) return 1;
					return 0;
				});
				break;
		}

		return result;
	}, [heroes, filters, fuse, isDiscovered]);

	// Paginated display
	const displayedHeroes = filteredHeroes.slice(0, displayCount);
	const hasMore = displayCount < filteredHeroes.length;

	return (
		<>
			{/* Filter Toolbar */}
			<FilterToolbar
				heroes={heroes}
				filters={filters}
				onFilterChange={setFilters}
				isDiscovered={isDiscovered}
			/>

			{/* Hero Grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
				{displayedHeroes.map((hero) => (
					<HeroCard
						key={hero.profile.id}
						hero={hero}
						isDiscovered={isDiscovered(hero.profile.url_name)}
						discoveredVia={getDiscoverySource(hero.profile.url_name)}
						onDiscover={onDiscover}
						onViewConnections={onViewConnections}
						isHighlighted={modalOpen && highlightedHeroIds.has(hero.profile.id)}
					/>
				))}
			</div>

			{/* Load More */}
			{hasMore && (
				<div className="flex justify-center pt-4">
					<button
						onClick={() => setDisplayCount((prev) => prev + 30)}
						className="rounded-lg border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
					>
						Load More Heroes ({filteredHeroes.length - displayCount} remaining)
					</button>
				</div>
			)}

			{/* Empty State */}
			{filteredHeroes.length === 0 && (
				<div className="py-20 text-center">
					<p className="text-muted-foreground">No heroes found matching your filters</p>
				</div>
			)}
		</>
	);
}
