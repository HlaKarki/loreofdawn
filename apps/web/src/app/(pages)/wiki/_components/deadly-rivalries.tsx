"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwordsIcon } from "lucide-react";
import type { ConsolidatedHeroOptional } from "@repo/database";

type DeadlyRivalriesProps = {
	rivalries: Array<{
		heroA: ConsolidatedHeroOptional;
		heroB: ConsolidatedHeroOptional;
		description: string;
	}>;
	onDiscoverPair: (heroA: ConsolidatedHeroOptional, heroB: ConsolidatedHeroOptional) => void;
};

function resolveImageSrc(images: ConsolidatedHeroOptional["profile"]["images"]): string {
	return images.squarehead_big || images.head_big || images.painting;
}

export function DeadlyRivalries({ rivalries, onDiscoverPair }: DeadlyRivalriesProps) {
	if (rivalries.length === 0) return null;

	return (
		<div className="mb-12">
			<div className="mb-6">
				<h2 className="flex items-center gap-2 text-2xl font-bold">
					<SwordsIcon className="h-6 w-6 text-red-500" />
					Deadly Rivalries
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Extreme counter matchups - these heroes dominate each other
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
				{rivalries.map((rivalry, index) => (
					<Card key={index} className="group overflow-hidden hover:border-red-500 hover:shadow-lg">
						<CardContent className="p-6">
							{/* VS Layout */}
							<div className="mb-4 flex items-center justify-center gap-4">
								{/* Hero A */}
								<div className="flex flex-col items-center">
									<div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full border-2 border-red-500">
										<img
											src={resolveImageSrc(rivalry.heroA.profile.images)}
											alt={rivalry.heroA.profile.name}
											className="h-full w-full object-cover object-top"
										/>
									</div>
									<span className="text-xs font-medium text-center">
										{rivalry.heroA.profile.name}
									</span>
								</div>

								{/* VS Badge */}
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500">
									<span className="text-sm font-bold">VS</span>
								</div>

								{/* Hero B */}
								<div className="flex flex-col items-center">
									<div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full border-2 border-red-500">
										<img
											src={resolveImageSrc(rivalry.heroB.profile.images)}
											alt={rivalry.heroB.profile.name}
											className="h-full w-full object-cover object-top"
										/>
									</div>
									<span className="text-xs font-medium text-center">
										{rivalry.heroB.profile.name}
									</span>
								</div>
							</div>

							{/* Description */}
							<p className="mb-4 text-center text-xs text-muted-foreground line-clamp-2">
								{rivalry.description}
							</p>

							{/* Action */}
							<Button
								size="sm"
								variant="outline"
								className="w-full border-red-500/30 hover:border-red-500 hover:bg-red-500/10"
								onClick={() => onDiscoverPair(rivalry.heroA, rivalry.heroB)}
							>
								Discover Both Heroes
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
