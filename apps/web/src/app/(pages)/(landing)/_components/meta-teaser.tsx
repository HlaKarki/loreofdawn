import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { ArrowRight, TrendingUp } from "lucide-react";
import { resolveImageSrc } from "../../hero/_components/header.hero";

type MetaTeaserProps = {
	metaKings: ConsolidatedHeroOptional[];
};

export const MetaTeaser = ({ metaKings }: MetaTeaserProps) => {
	if (metaKings.length === 0) return null;

	return (
		<section className="mb-12">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="mb-1 text-2xl font-bold">Current Meta Kings</h2>
					<p className="text-sm text-muted-foreground">Top banned heroes in competitive play</p>
				</div>
				<Button asChild variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700">
					<Link href="/meta">
						View All
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>

			<Card className="border-border/70 bg-gradient-to-br from-card/70 to-card/40">
				<CardContent className="p-4 sm:p-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						{metaKings.slice(0, 3).map((hero, index) => {
							const image = resolveImageSrc(
								hero.profile.images.squarehead_big,
								hero.profile.images.head_big,
								hero.profile.images.painting,
							);

							return (
								<div
									key={hero.profile.id}
									className="group relative overflow-hidden rounded-lg border border-border/70 bg-background/50 transition-all hover:scale-[1.02] hover:shadow-md"
								>
									<Link
										href={`/hero/${hero.profile.name.toLowerCase().replace(/\s+/g, "-")}`}
										className="block"
									>
										<div className="relative h-24 sm:h-28">
											<img src={image} alt={hero.profile.name} className="h-full w-full object-cover" />
											<div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
											{index === 0 && (
												<Badge className="absolute right-2 top-2 bg-amber-500/90 text-xs">
													<TrendingUp className="mr-1 h-3 w-3" />
													#1
												</Badge>
											)}
										</div>
										<div className="p-3">
											<h3 className="mb-1 font-semibold">{hero.profile.name}</h3>
											{hero.meta && (
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<span>Ban: {(hero.meta.ban_rate * 100).toFixed(1)}%</span>
													<span className="text-muted-foreground/50">•</span>
													<span>Win: {(hero.meta.win_rate * 100).toFixed(1)}%</span>
												</div>
											)}
										</div>
									</Link>
								</div>
							);
						})}
					</div>

					<div className="mt-4 text-center">
						<Button asChild variant="outline" className="border-amber-500/30 hover:bg-amber-500/10">
							<Link href="/meta">
								<TrendingUp className="mr-2 h-4 w-4" />
								View Full Meta Analysis
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</section>
	);
};
