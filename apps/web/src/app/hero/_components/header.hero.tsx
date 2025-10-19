import Image from "next/image";
import { tidyLabel } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";
import type { ConsolidatedHero } from "@repo/database";

export const resolveImageSrc = (...values: Array<string | null | undefined>) => {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return "/placeholder.svg";
};

export const HeroHeader = ({ hero }: { hero: ConsolidatedHero }) => {
	const primaryPortrait = resolveImageSrc(
		hero.images.painting,
		hero.images.head_big,
		hero.images.head,
	);
	const bannerImage = resolveImageSrc(
		hero.images.squarehead_big,
		hero.images.head_big,
		hero.images.squarehead,
	);

	const wikiHref =
		`/wiki/${encodeURIComponent(hero.name.trim().toLowerCase().replaceAll(" ", "_"))}` as const;

	return (
		<div className="relative mb-8 overflow-hidden rounded-xl">
			<div className="absolute inset-0 opacity-20">
				<Image
					src={bannerImage}
					alt=""
					fill
					sizes="100vw"
					className="object-cover object-top"
					priority
				/>
			</div>
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
			<div className="relative flex flex-col gap-6 px-0 py-6 md:p-8">
				<div className="flex flex-1 flex-col gap-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="flex items-end gap-4">
							<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-purple-500/10 sm:h-42 sm:w-42">
								<Image
									src={primaryPortrait}
									alt={tidyLabel(hero.name)}
									fill
									sizes={"256px"}
									className="object-cover"
									priority
								/>
							</div>
							<div>
								<h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
									{tidyLabel(hero.name)}
								</h1>
								<p className="text-base text-muted-foreground sm:text-lg">{hero.tagline}</p>
							</div>
						</div>
					</div>

					{/* Roles and Lanes */}
					<div className="flex flex-wrap gap-3">
						{hero.roles.filter((role) => tidyLabel(role.title).trim()).length > 0 && (
							<div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5">
								<span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
									Role
								</span>
								<div className="h-3 w-px bg-primary/20" />
								<div className="flex gap-1.5">
									{hero.roles
										.filter((role) => tidyLabel(role.title).trim())
										.map((role, idx) => (
											<div
												key={idx}
												className="flex items-center gap-1 text-xs font-medium text-primary"
											>
												<Image
													src={role.icon || "/placeholder.svg"}
													alt={tidyLabel(role.title)}
													width={14}
													height={14}
												/>
												<span>{tidyLabel(role.title)}</span>
											</div>
										))}
								</div>
							</div>
						)}
						{hero.lanes.filter((lane) => tidyLabel(lane.title).trim()).length > 0 && (
							<div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5">
								<span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
									Lane
								</span>
								<div className="h-3 w-px bg-amber-500/20" />
								<div className="flex gap-1.5">
									{hero.lanes
										.filter((lane) => tidyLabel(lane.title).trim())
										.map((lane, idx) => (
											<div key={idx} className="flex items-center gap-1 text-xs font-medium">
												<Image
													src={lane.icon || "/placeholder.svg"}
													alt={tidyLabel(lane.title)}
													width={14}
													height={14}
												/>
												<span>{tidyLabel(lane.title)}</span>
											</div>
										))}
								</div>
							</div>
						)}
						{hero.difficulty && (
							<div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5  px-2.5 py-1.5">
								<span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
									Difficulty
								</span>
								<div className="h-3 w-px bg-purple-500/20" />
								<span className="text-xs font-semibold ">{hero.difficulty}/100</span>
							</div>
						)}
					</div>

					{/* Key Stats */}
					<div className="grid grid-cols-3 gap-2 sm:gap-3">
						<div className="rounded-lg border bg-card p-2 sm:p-4">
							<div className="text-xs text-muted-foreground sm:text-sm">Win Rate</div>
							<div className="mt-1 text-lg font-bold text-green-500 sm:text-2xl">
								{((hero.win_rate ?? 0) * 100).toFixed(1)}%
							</div>
						</div>
						<div className="rounded-lg border bg-card p-2 sm:p-4">
							<div className="text-xs text-muted-foreground sm:text-sm">Pick Rate</div>
							<div className="mt-1 text-lg font-bold text-blue-500 sm:text-2xl">
								{((hero.pick_rate ?? 0) * 100).toFixed(1)}%
							</div>
						</div>
						<div className="rounded-lg border bg-card p-2 sm:p-4">
							<div className="text-xs text-muted-foreground sm:text-sm">Ban Rate</div>
							<div className="mt-1 text-lg font-bold text-red-500 sm:text-2xl">
								{((hero.ban_rate ?? 0) * 100).toFixed(1)}%
							</div>
						</div>
					</div>

					{/* Lore */}
					<Link
						href={wikiHref}
						className="group inline-block "
						aria-label={`Explore the complete wiki entry for ${tidyLabel(hero.name)}`}
					>
						<Card className="border border-border/70 bg-muted/40 transition-colors hover:border-primary/40 hover:bg-primary/5">
							<CardContent className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
									<BookOpen className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
								</div>
								<div className="flex-1">
									<h3 className="text-sm font-semibold sm:text-base">Explore the complete wiki</h3>
									<p className="text-xs text-muted-foreground sm:text-sm">
										Dive deeper into {tidyLabel(hero.name)}'s lore, strategies, builds, and
										community notes.
									</p>
								</div>
								<ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
							</CardContent>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	);
};
