import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { tidyLabel } from "@/lib/utils";
import { BookOpen, BarChart3, Star } from "lucide-react";
import { resolveImageSrc } from "../../heroes/_components/header.hero";

type HeroOfTheDayProps = {
	hero: ConsolidatedHeroOptional | null;
};

const formatPercent = (value?: number, digits = 1) =>
	value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;

export const HeroOfTheDay = ({ hero }: HeroOfTheDayProps) => {
	if (!hero) return null;

	const image = resolveImageSrc(
		hero.profile.images.painting,
		hero.profile.images.squarehead_big,
		hero.profile.images.head_big,
	);

	return (
		<section className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card">
			{/* Background image with gradient overlay */}
			<div className="absolute inset-0">
				<img src={image} alt="" className="h-full w-full object-cover object-top" />
				<div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-card/40" />
			</div>

			{/* Content */}
			<div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
				{/* Badge */}
				<div className="mb-auto flex items-center gap-2">
					<Badge className="gap-1.5 bg-amber-500 text-amber-950 hover:bg-amber-500">
						<Star className="h-3 w-3" />
						Hero of the Day
					</Badge>
				</div>

				{/* Hero info */}
				<div className="mt-32 space-y-4 sm:mt-40">
					<div>
						<div className="mb-2 flex flex-wrap gap-1.5">
							{hero.profile.roles.map((role) => (
								<Badge key={role.title} variant="outline" className="border-border/40 bg-background/60 backdrop-blur-sm text-xs">
									{tidyLabel(role.title)}
								</Badge>
							))}
						</div>
						<h2 className="text-2xl font-bold sm:text-3xl">{hero.profile.name}</h2>
						<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
							{hero.profile.tagline || "Spotlighted for their performance and lore today."}
						</p>
					</div>

					{/* Stats row */}
					<div className="flex flex-wrap items-center gap-4 text-sm">
						<div className="flex items-center gap-1.5">
							<span className="font-semibold text-emerald-500">{formatPercent(hero.meta?.win_rate)}</span>
							<span className="text-muted-foreground">WR</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="font-semibold text-sky-500">{formatPercent(hero.meta?.pick_rate, 2)}</span>
							<span className="text-muted-foreground">PR</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="font-semibold text-amber-500">{formatPercent(hero.meta?.ban_rate)}</span>
							<span className="text-muted-foreground">BR</span>
						</div>
					</div>

					{/* Actions */}
					<div className="flex flex-wrap gap-2">
						<Button asChild size="sm" className="gap-1.5 bg-amber-500 text-amber-950 hover:bg-amber-600">
							<Link href={`/lores/${hero.profile.name.toLowerCase().replace(/\s+/g, "-")}`}>
								<BookOpen className="h-3.5 w-3.5" />
								Read lore
							</Link>
						</Button>
						<Button asChild variant="secondary" size="sm" className="gap-1.5 bg-background/60 backdrop-blur-sm">
							<Link href={`/heroes/${hero.profile.name.toLowerCase().replace(/\s+/g, "-")}`}>
								<BarChart3 className="h-3.5 w-3.5" />
								View profile
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};
