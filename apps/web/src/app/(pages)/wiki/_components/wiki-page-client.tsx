"use client";

import { useState, useMemo } from "react";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { useDiscovery } from "../_hooks/useDiscovery";
import { HeroOfTheDay } from "./hero-of-the-day";
import { DeadlyRivalries } from "./deadly-rivalries";
import { PerfectPairings } from "./perfect-pairings";
import { RoleSpotlight } from "./role-spotlight";
import { HeroGridWithFilters } from "./hero-grid-with-filters";
import { ConstellationModal } from "./constellation-modal";
import {
	getHeroOfTheDay,
	findDeadlyRivalries,
	findPerfectPairings,
	getRoleSpotlight,
} from "../_lib/featured";
import { getRelatedHeroIds } from "../_lib/relationship-utils";

type WikiPageClientProps = {
	heroes: ConsolidatedHeroOptional[];
};

export function WikiPageClient({ heroes }: WikiPageClientProps) {
	// Shared discovery state (used by multiple components)
	const { discoverHero, discoverMultipleHeroes, isDiscovered, getDiscoverySource, progress } =
		useDiscovery(heroes.length);

	// Modal state (shared - can be opened from multiple places)
	const [selectedHero, setSelectedHero] = useState<ConsolidatedHeroOptional | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	// Featured sections (computed once)
	const heroOfTheDay = useMemo(() => getHeroOfTheDay(heroes), [heroes]);
	const deadlyRivalries = useMemo(() => findDeadlyRivalries(heroes, 3), [heroes]);
	const perfectPairings = useMemo(() => findPerfectPairings(heroes, 4), [heroes]);
	const roleSpotlight = useMemo(() => getRoleSpotlight(heroes), [heroes]);

	// Get highlighted hero IDs (when modal is open)
	const highlightedHeroIds = useMemo(() => {
		if (!selectedHero) return new Set<number>();
		return getRelatedHeroIds(selectedHero);
	}, [selectedHero]);

	// Handle view connections
	const handleViewConnections = (hero: ConsolidatedHeroOptional) => {
		setSelectedHero(hero);
		setModalOpen(true);
	};

	// Handle discover pair (from featured sections)
	const handleDiscoverPair = (heroA: ConsolidatedHeroOptional, heroB: ConsolidatedHeroOptional) => {
		discoverMultipleHeroes([heroA.profile.url_name, heroB.profile.url_name], null);
	};

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

			{/* Hero of the Day - manages its own auto-discover */}
			{heroOfTheDay && (
				<HeroOfTheDay
					hero={heroOfTheDay}
					isDiscovered={isDiscovered}
					onDiscover={discoverHero}
					onViewConnections={handleViewConnections}
				/>
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

			{/* Hero Grid with Filters */}
			<HeroGridWithFilters
				heroes={heroes}
				isDiscovered={isDiscovered}
				getDiscoverySource={getDiscoverySource}
				onDiscover={discoverHero}
				onViewConnections={handleViewConnections}
				modalOpen={modalOpen}
				highlightedHeroIds={highlightedHeroIds}
			/>

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
