"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SparklesIcon, BookOpenIcon } from "lucide-react";
import { tidyLabel } from "@/lib/utils";
import Link from "next/link";
import type { ConsolidatedHeroOptional } from "@repo/database";

type HeroOfTheDayProps = {
	hero: ConsolidatedHeroOptional;
	isDiscovered: (urlName: string) => boolean;
	onDiscover: (urlName: string, discoveredVia: string | null) => void;
	onViewConnections: (hero: ConsolidatedHeroOptional) => void;
};

function resolveImageSrc(painting: string, squarehead: string, head: string): string {
	return painting || squarehead || head;
}

export function HeroOfTheDay({
	hero,
	isDiscovered,
	onDiscover,
	onViewConnections,
}: HeroOfTheDayProps) {
	const imageSrc = resolveImageSrc(
		hero.profile.images.painting,
		hero.profile.images.squarehead_big,
		hero.profile.images.head_big,
	);

	const lorePreview = hero.profile.tale ? hero.profile.tale.slice(0, 150) + "..." : "";

	// Auto-discover Hero of the Day on mount
	useEffect(() => {
		if (!isDiscovered(hero.profile.url_name)) {
			onDiscover(hero.profile.url_name, null);
		}
	}, [hero.profile.url_name, isDiscovered, onDiscover]);

	return (
		<div className="mb-12">
			<div className="mb-6">
				<h2 className="text-2xl font-bold">Hero of the Day</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Featured hero rotates daily - discover and explore their connections
				</p>
			</div>

			<Card className="overflow-hidden border-2 border-amber-500 shadow-lg">
				<div className="grid grid-cols-1 gap-0 md:grid-cols-2">
					{/* Hero Image */}
					<div className="relative h-64 md:h-auto">
						<img
							src={imageSrc}
							alt={hero.profile.name}
							className="h-full w-full object-cover object-top"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent md:bg-gradient-to-r" />
					</div>

					{/* Hero Details */}
					<CardContent className="flex flex-col justify-center p-6 md:p-8">
						<Badge variant="secondary" className="mb-3 w-fit bg-amber-500/20 text-amber-600">
							<SparklesIcon className="mr-1 h-3 w-3" />
							Featured Today
						</Badge>

						<h3 className="mb-2 text-3xl font-bold">{hero.profile.name}</h3>

						{/* Roles */}
						<div className="mb-4 flex flex-wrap gap-2">
							{hero.profile.roles?.map((role) => (
								<Badge key={role.title} variant="secondary">
									{tidyLabel(role.title)}
								</Badge>
							))}
						</div>

						{/* Tagline */}
						{hero.profile.tagline && (
							<p className="mb-3 text-sm italic text-muted-foreground">{hero.profile.tagline}</p>
						)}

						{/* Lore Preview */}
						{lorePreview && <p className="mb-4 text-sm text-muted-foreground">{lorePreview}</p>}

						{/* Quick Stats */}
						{hero.profile.difficulty && (
							<div className="mb-4 text-sm">
								<span className="text-muted-foreground">Difficulty: </span>
								<Badge variant="outline">{tidyLabel(hero.profile.difficulty)}</Badge>
							</div>
						)}

						{/* Actions */}
						<div className="flex flex-col gap-2 sm:flex-row">
							<Button variant="default" onClick={() => onViewConnections(hero)} className="flex-1">
								<SparklesIcon className="mr-2 h-4 w-4" />
								Discover Related Heroes
							</Button>
							<Link href={`/wiki/${hero.profile.url_name}`} className="flex-1">
								<Button variant="outline" className="w-full">
									<BookOpenIcon className="mr-2 h-4 w-4" />
									Read Full Lore
								</Button>
							</Link>
						</div>
					</CardContent>
				</div>
			</Card>
		</div>
	);
}
