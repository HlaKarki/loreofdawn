import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { ArrowRight, Flame } from "lucide-react";
import { resolveImageSrc } from "../../heroes/_components/header.hero";

const formatPercent = (value?: number, digits = 1) =>
	value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;

type MetaTeaserProps = {
	metaKings: ConsolidatedHeroOptional[];
};

export const MetaTeaser = ({ metaKings }: MetaTeaserProps) => {
	if (metaKings.length === 0) return null;

	return (
		<section className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
			{/* Header */}
			<div className="mb-5 flex items-start justify-between gap-3">
				<div>
					<div className="mb-1 flex items-center gap-2">
						<Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300">
							<Flame className="h-3 w-3" />
							Most Banned
						</Badge>
					</div>
					<h2 className="text-xl font-bold sm:text-2xl">Top contested picks</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Heroes dominating the ban phase right now
					</p>
				</div>
			</div>

			{/* Hero list */}
			<div className="flex-1 space-y-2">
				{metaKings.slice(0, 3).map((hero, index) => {
					const banRate = hero.meta?.ban_rate ?? 0;
					const winRate = hero.meta?.win_rate ?? 0;
					const image = resolveImageSrc(
						hero.profile.images.squarehead_big,
						hero.profile.images.head_big,
						hero.profile.images.painting,
					);

					return (
						<Link
							key={hero.profile.id}
							href={`/heroes/${hero.profile.url_name}`}
							className="group flex items-center gap-3 rounded-xl border border-border/40 bg-background/50 p-3 transition-colors hover:border-border hover:bg-background"
						>
							{/* Rank */}
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-bold text-amber-600 dark:text-amber-400">
								{index + 1}
							</div>

							{/* Avatar */}
							<div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/60">
								<img src={image} alt={hero.profile.name} className="h-full w-full object-cover" />
							</div>

							{/* Info */}
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium">{hero.profile.name}</p>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span className="text-amber-600 dark:text-amber-400">{formatPercent(banRate)} ban</span>
									<span>•</span>
									<span>{formatPercent(winRate)} win</span>
								</div>
							</div>

							{/* Bar */}
							<div className="hidden w-20 sm:block">
								<div className="h-1.5 overflow-hidden rounded-full bg-border/50">
									<div
										className="h-full rounded-full bg-amber-500"
										style={{ width: `${Math.min(100, banRate * 100)}%` }}
									/>
								</div>
							</div>

							<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
						</Link>
					);
				})}
			</div>

			{/* Footer CTA */}
			<div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
				<p className="text-sm text-muted-foreground">Prepare your bans before queue</p>
				<Button asChild variant="ghost" size="sm" className="gap-1">
					<Link href="/meta">
						View all
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</section>
	);
};
