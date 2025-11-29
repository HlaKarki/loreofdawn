"use client";

import { useState, useEffect, useMemo } from "react";
import { makeUrl } from "@/lib/utils.api";
import type { FilterState } from "./_components/filter-toolbar";
import { useDiscovery } from "./_hooks/useDiscovery";
import { HeroCard } from "./_components/hero-card";
import { HeroOfTheDay } from "./_components/hero-of-the-day";
import { DeadlyRivalries } from "./_components/deadly-rivalries";
import { PerfectPairings } from "./_components/perfect-pairings";
import { RoleSpotlight } from "./_components/role-spotlight";
import { ConstellationModal } from "./_components/constellation-modal";
import { FilterToolbar } from "./_components/filter-toolbar";
import { getRelatedHeroIds } from "./_lib/relationship-utils";
import {
	getHeroOfTheDay,
	findDeadlyRivalries,
	findPerfectPairings,
	getRoleSpotlight,
} from "./_lib/featured";
import Fuse from "fuse.js";
import type { ConsolidatedHeroOptional } from "@repo/database";

export default function WikiPage() {
	const [data, setData] = useState<ConsolidatedHeroOptional[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedHero, setSelectedHero] = useState<ConsolidatedHeroOptional | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [filters, setFilters] = useState<FilterState>({
		search: "",
		roles: [],
		discoveryStatus: "all",
		sortBy: "alphabetical",
	});
	const [displayCount, setDisplayCount] = useState(30);

	// Fetch wiki profiles
	useEffect(() => {
		async function fetchProfiles() {
			try {
				setLoading(true);
				const response = await fetch(makeUrl("/v1/heroes?limit=500&include=meta&rank=overall"));
				if (response.ok) {
					const json = (await response.json()) as ConsolidatedHeroOptional[];
					setData(json);
				}
			} catch (error) {
				console.error("Failed to fetch wiki profiles:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchProfiles();
	}, []);

	const heroes = data ?? [];
	const {
		discovered,
		discoverHero,
		discoverMultipleHeroes,
		isDiscovered,
		getDiscoverySource,
		progress,
	} = useDiscovery(heroes.length);

	// Auto-discover Hero of the Day
	const heroOfTheDay = useMemo(() => getHeroOfTheDay(heroes), [heroes]);
	useEffect(() => {
		if (heroOfTheDay && !isDiscovered(heroOfTheDay.profile.url_name)) {
			discoverHero(heroOfTheDay.profile.url_name, null);
		}
	}, [heroOfTheDay, isDiscovered, discoverHero]);

	// Featured sections
	const deadlyRivalries = useMemo(() => findDeadlyRivalries(heroes, 3), [heroes]);
	const perfectPairings = useMemo(() => findPerfectPairings(heroes, 4), [heroes]);
	const roleSpotlight = useMemo(() => getRoleSpotlight(heroes), [heroes]);

	// Fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(heroes, {
			keys: ["name", "url_name"],
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

	// Handle view connections
	const handleViewConnections = (hero: ConsolidatedHeroOptional) => {
		setSelectedHero(hero);
		setModalOpen(true);
	};

	// Handle discover pair (from featured sections)
	const handleDiscoverPair = (heroA: ConsolidatedHeroOptional, heroB: ConsolidatedHeroOptional) => {
		discoverMultipleHeroes([heroA.profile.url_name, heroB.profile.url_name], null);
	};

	// Get highlighted hero IDs (when modal is open)
	const highlightedHeroIds = useMemo(() => {
		if (!selectedHero) return new Set<number>();
		return getRelatedHeroIds(selectedHero);
	}, [selectedHero]);

	if (loading) {
		return (
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-16 sm:px-6 lg:px-8">
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
						<p className="text-muted-foreground">Loading heroes...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 sm:px-6 lg:px-8">
			{/* Header */}
			<header className="flex flex-col gap-2 pt-6">
				<h1 className="text-4xl font-bold tracking-tight">Hero Encyclopedia</h1>
				<p className="text-muted-foreground">
					Discover {heroes.length} unique heroes through relationships and exploration
				</p>
				<div className="mt-2 text-sm text-muted-foreground">
					<span className="font-semibold text-foreground">{progress.discovered}</span> heroes
					discovered ({progress.percentage.toFixed(1)}%)
				</div>
			</header>

			{/* Hero of the Day */}
			{heroOfTheDay && (
				<HeroOfTheDay hero={heroOfTheDay} onViewConnections={handleViewConnections} />
			)}

			{/* Deadly Rivalries */}
			{deadlyRivalries.length > 0 && (
				<DeadlyRivalries rivalries={deadlyRivalries} onDiscoverPair={handleDiscoverPair} />
			)}

			{/* Perfect Pairings */}
			{perfectPairings.length > 0 && (
				<PerfectPairings pairings={perfectPairings} onDiscoverPair={handleDiscoverPair} />
			)}

			{/* Role Spotlight */}
			{roleSpotlight && (
				<RoleSpotlight
					role={roleSpotlight.role}
					heroes={roleSpotlight.heroes}
					isDiscovered={isDiscovered}
					onDiscover={discoverHero}
				/>
			)}

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
						onDiscover={discoverHero}
						onViewConnections={handleViewConnections}
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

			{/* Constellation Modal */}
			<ConstellationModal
				hero={selectedHero}
				allHeroes={heroes}
				isDiscovered={isDiscovered}
				onDiscoverHero={discoverHero}
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				highlightedHeroIds={highlightedHeroIds}
			/>
		</div>
	);
}
