"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LockIcon, SparklesIcon, Link2Icon } from "lucide-react";
import { tidyLabel } from "@/lib/utils";
import { countRelationships } from "../_lib/relationship-utils";
import Link from "next/link";
import type { ConsolidatedHeroOptional } from "@repo/database";

type HeroCardProps = {
	hero: ConsolidatedHeroOptional;
	isDiscovered: boolean;
	discoveredVia?: string | null;
	onDiscover: (urlName: string, discoveredVia: string | null) => void;
	onViewConnections: (hero: ConsolidatedHeroOptional) => void;
	isHighlighted?: boolean;
};

function resolveImageSrc(painting: string, squarehead: string, head: string): string {
	return painting || squarehead || head;
}

export function HeroCard({
	hero,
	isDiscovered,
	discoveredVia,
	onDiscover,
	onViewConnections,
	isHighlighted = false,
}: HeroCardProps) {
	const relationships = countRelationships(hero);
	const imageSrc = resolveImageSrc(
		hero.profile.images.painting,
		hero.profile.images.squarehead_big,
		hero.profile.images.head_big,
	);

	const handleClick = () => {
		if (!isDiscovered) {
			onDiscover(hero.profile.url_name, null);
		}
	};

	// Undiscovered State
	if (!isDiscovered) {
		return (
			<Card
				className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-border/60 pt-0 transition-all hover:border-amber-400 hover:shadow-lg"
				onClick={handleClick}
			>
				{/* Blurred Hero Image */}
				<div className="relative h-48">
					<img
						src={imageSrc}
						alt="???"
						className="h-full w-full object-cover object-top grayscale opacity-20 blur-sm transition-all group-hover:opacity-30"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />

					{/* Lock Icon */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="rounded-full bg-background/80 p-4">
							<LockIcon className="h-8 w-8 text-muted-foreground" />
						</div>
					</div>

					{/* Mystery Name */}
					<h3 className="absolute bottom-4 left-4 text-2xl font-bold text-muted-foreground">???</h3>
				</div>

				<CardContent className="p-4">
					<Badge variant="secondary" className="mb-2">
						<LockIcon className="mr-1 h-3 w-3" />
						Click to Discover
					</Badge>
				</CardContent>
			</Card>
		);
	}

	// Discovered State (with optional relationship-linked styling)
	return (
		<Card
			className={`group overflow-hidden rounded-2xl pt-0 transition-all ${
				isHighlighted
					? "animate-glow border-2 border-purple-500 shadow-lg shadow-purple-500/50"
					: "border border-border/60 hover:border-amber-400 hover:shadow-lg"
			}`}
		>
			{/* Hero Image */}
			<div className="relative h-48">
				<img
					src={imageSrc}
					alt={hero.profile.name}
					className="h-full w-full object-cover object-top"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
				<h3 className="absolute bottom-4 left-4 text-2xl font-bold">{hero.profile.name}</h3>

				{/* Discovery Badge (if discovered via relationship) */}
				{discoveredVia && (
					<Badge variant="secondary" className="absolute right-2 top-2 bg-purple-500/90 text-white">
						<Link2Icon className="mr-1 h-3 w-3" />
						Via {discoveredVia}
					</Badge>
				)}
			</div>

			<CardContent className="p-4">
				{/* Roles */}
				<div className="mb-3 flex flex-wrap gap-2">
					{hero.profile.roles?.map((role) => (
						<Badge key={role.title} variant="secondary">
							{tidyLabel(role.title)}
						</Badge>
					))}
				</div>

				{/* Tagline */}
				{hero.profile.tagline && (
					<p className="mb-3 text-sm italic text-muted-foreground line-clamp-2">
						{hero.profile.tagline}
					</p>
				)}

				{/* Specialty */}
				{hero.profile.speciality && hero.profile.speciality.length > 0 && (
					<div className="mb-3 flex flex-wrap gap-1">
						{hero.profile.speciality.map((spec) => (
							<Badge key={spec} variant="outline" className="text-xs">
								{spec}
							</Badge>
						))}
					</div>
				)}

				{/* Relationship Summary */}
				<div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
					{relationships.strongAgainst > 0 && (
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-red-500" />
							Strong against {relationships.strongAgainst}
						</span>
					)}
					{relationships.compatibleWith > 0 && (
						<span className="flex items-center gap-1">
							<span className="h-2 w-2 rounded-full bg-green-500" />
							Synergizes with {relationships.compatibleWith}
						</span>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="outline"
						className="flex-1"
						onClick={() => onViewConnections(hero)}
					>
						<SparklesIcon className="mr-1 h-4 w-4" />
						View Connections
					</Button>
					<Link href={`/lores/${hero.profile.url_name}`} className="flex-1">
						<Button size="sm" variant="default" className="w-full">
							Read Lore
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
