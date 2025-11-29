"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LockIcon, SparklesIcon } from "lucide-react";
import type { ConsolidatedHeroOptional } from "@repo/database";

type ConstellationModalProps = {
	hero: ConsolidatedHeroOptional | null;
	allHeroes: ConsolidatedHeroOptional[];
	isDiscovered: (urlName: string) => boolean;
	onDiscoverHero: (urlName: string, discoveredVia: string) => void;
	open: boolean;
	onClose: () => void;
	highlightedHeroIds: Set<number>;
};

function resolveImageSrc(images: ConsolidatedHeroOptional["profile"]["images"]): string {
	return images.squarehead_big || images.head_big || images.painting;
}

export function ConstellationModal({
	hero,
	allHeroes,
	isDiscovered,
	onDiscoverHero,
	open,
	onClose,
	highlightedHeroIds,
}: ConstellationModalProps) {
	if (!hero) return null;

	// Create hero map for quick lookups
	const heroMap = new Map(allHeroes.map((h) => [h.profile.id, h]));

	// Get relationship groups
	const strongAgainst = hero.profile.relation?.strong_against || [];
	const weakAgainst = hero.profile.relation?.weak_against || [];
	const compatibleWith = hero.profile.relation?.compatible_with || [];

	// Count totals
	const strongAgainstCount = strongAgainst.reduce(
		(acc, group) => acc + (group.heroes?.length || 0),
		0,
	);
	const weakAgainstCount = weakAgainst.reduce((acc, group) => acc + (group.heroes?.length || 0), 0);
	const compatibleWithCount = compatibleWith.reduce(
		(acc, group) => acc + (group.heroes?.length || 0),
		0,
	);

	const totalDiscovered = allHeroes.filter((h) => isDiscovered(h.profile.url_name)).length;

	// Render hero portrait in relationship group
	const renderHeroPortrait = (
		relatedHero: ConsolidatedHeroOptional["profile"]["relation"]["compatible_with"][number]["heroes"][number],
	) => {
		const fullHero = heroMap.get(relatedHero.id);
		if (!fullHero) return null;

		const discovered = isDiscovered(fullHero.profile.url_name);

		return (
			<div
				key={fullHero.profile.id}
				className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
					discovered
						? "border-border hover:border-amber-400 hover:shadow-lg"
						: "border-muted hover:border-amber-400"
				}`}
				onClick={() => {
					if (!discovered) {
						onDiscoverHero(fullHero.profile.url_name, hero.profile.name);
					}
				}}
			>
				<div className="aspect-square">
					<img
						src={resolveImageSrc(fullHero.profile.images)}
						alt={discovered ? fullHero.profile.name : "???"}
						className={`h-full w-full object-cover object-top ${
							discovered ? "" : "grayscale opacity-30 blur-sm"
						}`}
					/>

					{/* Lock overlay for undiscovered */}
					{!discovered && (
						<div className="absolute inset-0 flex items-center justify-center bg-background/50">
							<LockIcon className="h-6 w-6 text-muted-foreground" />
						</div>
					)}

					{/* Celebration icon for discovered via relationship */}
					{discovered && (
						<div className="absolute right-1 top-1">
							<SparklesIcon className="h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100" />
						</div>
					)}
				</div>

				{/* Hero Name */}
				<div className="bg-background/90 p-2">
					<p className="text-center text-xs font-medium truncate">
						{discovered ? fullHero.profile.name : "???"}
					</p>
				</div>
			</div>
		);
	};

	// Render relationship column
	const renderColumn = (
		title: string,
		count: number,
		groups: ConsolidatedHeroOptional["profile"]["relation"]["compatible_with"],
		accentColor: string,
	) => {
		if (count === 0) {
			return (
				<div>
					<div
						className={`mb-4 flex items-center justify-between rounded-lg bg-${accentColor}-500/10 p-3`}
					>
						<h3 className={`font-semibold text-${accentColor}-600`}>{title}</h3>
						<Badge variant="secondary" className="text-xs">
							0
						</Badge>
					</div>
					<p className="text-center text-sm text-muted-foreground">No relationships found</p>
				</div>
			);
		}

		return (
			<div>
				<div
					className={`mb-4 flex items-center justify-between rounded-lg bg-${accentColor}-500/10 p-3`}
				>
					<h3 className={`font-semibold text-${accentColor}-600`}>{title}</h3>
					<Badge variant="secondary" className="text-xs">
						{count}
					</Badge>
				</div>

				<ScrollArea className="h-[400px]">
					<div className="space-y-4">
						{groups.map((group, groupIndex) => (
							<div key={groupIndex}>
								{group.description && (
									<p className="mb-2 text-xs text-muted-foreground">{group.description}</p>
								)}
								<div className="grid grid-cols-2 gap-2">
									{group.heroes?.map((relatedHero) => renderHeroPortrait(relatedHero))}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-w-6xl max-h-[90vh]">
				<DialogHeader>
					<DialogTitle className="text-2xl">{hero.profile.name}'s Connections</DialogTitle>
					<p className="text-sm text-muted-foreground">
						Discover heroes through their relationships
					</p>
				</DialogHeader>

				{/* Three-column layout */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{/* Strong Against (Red) */}
					{renderColumn("Strong Against", strongAgainstCount, strongAgainst, "red")}

					{/* Compatible With (Green) */}
					{renderColumn("Compatible With", compatibleWithCount, compatibleWith, "green")}

					{/* Weak Against (Orange) */}
					{renderColumn("Weak Against", weakAgainstCount, weakAgainst, "orange")}
				</div>

				{/* Footer Progress */}
				<div className="mt-4 rounded-lg border bg-muted/50 p-4">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Discovery Progress</span>
						<span className="font-semibold">
							{totalDiscovered} / {allHeroes.length} heroes discovered
						</span>
					</div>
					<div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
						<div
							className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
							style={{ width: `${(totalDiscovered / allHeroes.length) * 100}%` }}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
