"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";
import type { ConsolidatedHeroOptional } from "@repo/database";

type PerfectPairingsProps = {
	pairings: Array<{
		heroA: ConsolidatedHeroOptional;
		heroB: ConsolidatedHeroOptional;
		description: string;
	}>;
	onDiscoverPair: (heroA: ConsolidatedHeroOptional, heroB: ConsolidatedHeroOptional) => void;
};

function resolveImageSrc(images: ConsolidatedHeroOptional["profile"]["images"]): string {
	return images.squarehead_big || images.head_big || images.painting;
}

export function PerfectPairings({ pairings, onDiscoverPair }: PerfectPairingsProps) {
	if (pairings.length === 0) return null;

	return (
		<div className="mb-12">
			<div className="mb-6">
				<h2 className="flex items-center gap-2 text-2xl font-bold">
					<HeartIcon className="h-6 w-6 text-green-500" />
					Perfect Pairings
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					High synergy duos - these heroes work best together
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
				{pairings.map((pairing, index) => (
					<Card
						key={index}
						className="group overflow-hidden hover:border-green-500 hover:shadow-lg"
					>
						<CardContent className="p-6">
							{/* Overlapping Portraits */}
							<div className="mb-4 flex items-center justify-center">
								<div className="relative flex h-20">
									{/* Hero A */}
									<div className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-4 border-background">
										<img
											src={resolveImageSrc(pairing.heroA.profile.images)}
											alt={pairing.heroA.profile.name}
											className="h-full w-full object-cover object-top"
										/>
									</div>

									{/* Hero B (overlapping) */}
									<div className="relative -ml-6 h-20 w-20 overflow-hidden rounded-full border-4 border-background">
										<img
											src={resolveImageSrc(pairing.heroB.profile.images)}
											alt={pairing.heroB.profile.name}
											className="h-full w-full object-cover object-top"
										/>
									</div>
								</div>
							</div>

							{/* Hero Names */}
							<h3 className="mb-2 text-center text-sm font-semibold">
								{pairing.heroA.profile.name} + {pairing.heroB.profile.name}
							</h3>

							{/* Description */}
							<p className="mb-4 text-center text-xs text-muted-foreground line-clamp-2">
								{pairing.description}
							</p>

							{/* Action */}
							<Button
								size="sm"
								variant="outline"
								className="w-full border-green-500/30 hover:border-green-500 hover:bg-green-500/10"
								onClick={() => onDiscoverPair(pairing.heroA, pairing.heroB)}
							>
								<HeartIcon className="mr-1 h-3 w-3" />
								Discover Duo
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
