import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { tidyLabel } from "@/lib/utils";
import { BookOpen, BarChart3 } from "lucide-react";
import { resolveImageSrc } from "../../hero/_components/header.hero";

type HeroOfTheDayProps = {
	heroes: ConsolidatedHeroOptional[];
};

export const HeroOfTheDay = ({ heroes }: HeroOfTheDayProps) => {
	// Deterministic daily rotation based on days since epoch
	const heroOfTheDay = (() => {
		if (heroes.length === 0) return null;
		const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
		return heroes[daysSinceEpoch % heroes.length];
	})();

	if (!heroOfTheDay) return null;

	const image = resolveImageSrc(
		heroOfTheDay.profile.images.painting,
		heroOfTheDay.profile.images.squarehead_big,
		heroOfTheDay.profile.images.head_big,
	);

	return (
		<section className="mb-12">
			<div className="mb-4 flex items-center gap-2">
				<Badge variant="secondary" className="bg-amber-500/15 text-amber-800 dark:text-amber-400">
					Hero of the Day
				</Badge>
			</div>

			<Card className="overflow-hidden border-border/70 bg-card/70">
				<div className="relative h-64 sm:h-80">
					<img
						src={image}
						alt={heroOfTheDay.profile.name}
						className="h-full w-full object-cover object-top"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
					<div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
						<h2 className="mb-2 text-3xl font-bold sm:text-4xl">{heroOfTheDay.profile.name}</h2>
						<div className="flex flex-wrap gap-2">
							{heroOfTheDay.profile.roles.map((role) => (
								<Badge key={role.title} variant="secondary">
									{tidyLabel(role.title)}
								</Badge>
							))}
						</div>
					</div>
				</div>

				<CardContent className="p-4 sm:p-6">
					{/* Stats Preview */}
					{heroOfTheDay.meta && (
						<div className="mb-4 grid grid-cols-3 gap-3 text-sm">
							<div className="rounded-lg border border-border/70 bg-background/50 p-3">
								<div className="text-xs text-muted-foreground">Win Rate</div>
								<div className="text-lg font-semibold">
									{(heroOfTheDay.meta.win_rate * 100).toFixed(1)}%
								</div>
							</div>
							<div className="rounded-lg border border-border/70 bg-background/50 p-3">
								<div className="text-xs text-muted-foreground">Pick Rate</div>
								<div className="text-lg font-semibold">
									{(heroOfTheDay.meta.pick_rate * 100).toFixed(1)}%
								</div>
							</div>
							<div className="rounded-lg border border-border/70 bg-background/50 p-3">
								<div className="text-xs text-muted-foreground">Ban Rate</div>
								<div className="text-lg font-semibold">
									{(heroOfTheDay.meta.ban_rate * 100).toFixed(1)}%
								</div>
							</div>
						</div>
					)}

					{/* CTAs */}
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button asChild className="flex-1 bg-amber-500 hover:bg-amber-600">
							<Link href={`/lores/${heroOfTheDay.profile.name.toLowerCase().replace(/\s+/g, "-")}`}>
								<BookOpen className="mr-2 h-4 w-4" />
								Read Lore
							</Link>
						</Button>
						<Button asChild variant="outline" className="flex-1 border-amber-500/30">
							<Link href={`/hero/${heroOfTheDay.profile.name.toLowerCase().replace(/\s+/g, "-")}`}>
								<BarChart3 className="mr-2 h-4 w-4" />
								View Hero
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</section>
	);
};
