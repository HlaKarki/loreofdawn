"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tidyLabel } from "@/lib/utils";
import type { ConsolidatedHeroOptional } from "@repo/database";

type RoleSpotlightProps = {
	role: string;
	heroes: ConsolidatedHeroOptional[];
	isDiscovered: (urlName: string) => boolean;
	onDiscover: (urlName: string, discoveredVia: string | null) => void;
};

function resolveImageSrc(images: ConsolidatedHeroOptional["profile"]["images"]): string {
	return images.squarehead_big || images.head_big || images.painting;
}

function getRoleIcon(role: string): string {
	const icons: Record<string, string> = {
		mage: "\u2728", // ✨
		fighter: "\u2694\uFE0F", // ⚔️
		assassin: "\uD83D\uDDE1\uFE0F", // 🗡️
		marksman: "\uD83C\uDFF9", // 🏹
		tank: "\uD83D\uDEE1\uFE0F", // 🛡️
	};
	return icons[role.toLowerCase()] || "⭐";
}

function getRoleDescription(role: string): string {
	const descriptions: Record<string, string> = {
		mage: "Masters of magical damage and area control",
		fighter: "Durable warriors excelling in sustained combat",
		assassin: "Stealth experts delivering burst damage",
		marksman: "Ranged damage dealers with high DPS",
		tank: "Defensive juggernauts protecting their team",
	};
	return descriptions[role.toLowerCase()] || "Versatile heroes with unique playstyles";
}

export function RoleSpotlight({ role, heroes, isDiscovered, onDiscover }: RoleSpotlightProps) {
	if (heroes.length === 0) return null;

	return (
		<div className="mb-12">
			<div className="mb-6">
				<h2 className="flex items-center gap-2 text-2xl font-bold">
					<span className="text-3xl">{getRoleIcon(role)}</span>
					{tidyLabel(role)} Spotlight
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">{getRoleDescription(role)}</p>
			</div>

			{/* Horizontal Scroll */}
			<ScrollArea className="w-full whitespace-nowrap rounded-lg border">
				<div className="flex gap-4 p-4">
					{heroes.map((hero) => {
						const discovered = isDiscovered(hero.profile.url_name);

						return (
							<Card
								key={hero.profile.id}
								className={`inline-block w-48 flex-shrink-0 cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
									discovered
										? "hover:border-amber-400"
										: "opacity-60 hover:border-amber-400 hover:opacity-80"
								}`}
								onClick={() => {
									if (!discovered) {
										onDiscover(hero.profile.url_name, null);
									}
								}}
							>
								{/* Hero Image */}
								<div className="relative h-32">
									<img
										src={resolveImageSrc(hero.profile.images)}
										alt={discovered ? hero.profile.name : "???"}
										className={`h-full w-full object-cover object-top ${
											discovered ? "" : "grayscale opacity-40 blur-sm"
										}`}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
									<h4 className="absolute bottom-2 left-2 text-sm font-bold">
										{discovered ? hero.profile.name : "???"}
									</h4>
								</div>

								<CardContent className="p-3">
									{discovered ? (
										<>
											{/* Tagline */}
											{hero.profile.tagline && (
												<p className="text-xs italic text-muted-foreground line-clamp-2">
													{hero.profile.tagline}
												</p>
											)}
										</>
									) : (
										<Badge variant="secondary" className="text-xs">
											Click to Discover
										</Badge>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}
