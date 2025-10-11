import type { MlGraphData, MlHeroProfile, MlMatchupSummary, MlMetaSummary } from "@repo/database";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { tidyLabel } from "@/lib/utils";
import { getServerBaseUrl } from "@/lib/server/base-url";

export const dynamic = "force-dynamic";

function StatLabel({ abbr, full, value }: { abbr: string; full: string; value: string }) {
	return (
		<>
			{/* Mobile: Show abbreviated with popover */}
			<Popover>
				<PopoverTrigger asChild>
					<span className="cursor-help sm:hidden">
						<span className="text-muted-foreground">{abbr}</span>{" "}
						<span className="font-medium text-foreground">{value}</span>
					</span>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-2">
					<p className="text-xs">{full}</p>
				</PopoverContent>
			</Popover>
			{/* Desktop: Show full text */}
			<span className="hidden sm:inline">
				<span className="text-muted-foreground">{full}</span>{" "}
				<span className="font-medium text-foreground">{value}</span>
			</span>
		</>
	);
}

type ConsolidatedHero = MlHeroProfile &
	Partial<MlMatchupSummary> &
	Partial<MlMetaSummary> &
	Partial<MlGraphData>;

interface HeroPageProps {
	params: Promise<{
		hero: string;
	}>;
}

const resolveImageSrc = (...values: Array<string | null | undefined>) => {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return "/placeholder.svg";
};

export default async function HeroPage({ params }: HeroPageProps) {
	const resolvedParams = await params;
	const hero = resolvedParams.hero.trim().toLowerCase();

	const baseUrl = await getServerBaseUrl();
	const endpoint = new URL("/api/heroes/consolidated", baseUrl);
	endpoint.searchParams.set("hero", hero);
	endpoint.searchParams.set("rank", "glory");

	const response = await fetch(endpoint.toString(), { cache: "no-store" });

	if (response.status === 404) {
		return (
			<div className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4">
				<p className="text-muted-foreground">Hero not found</p>
			</div>
		);
	}

	if (!response.ok) {
		throw new Error("Failed to load hero data");
	}

	const consolidated = (await response.json()) as ConsolidatedHero;

	const primaryPortrait = resolveImageSrc(
		consolidated.images.painting,
		consolidated.images.head_big,
		consolidated.images.head,
	);
	const bannerImage = resolveImageSrc(
		consolidated.images.squarehead_big,
		consolidated.images.head_big,
		consolidated.images.squarehead,
	);

	const wikiHref = `/wiki/${encodeURIComponent(hero)}` as const;

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
			{/* Hero Header */}
			<div className="relative mb-8 overflow-hidden rounded-xl">
				<div
					style={{
						backgroundImage: `url(${bannerImage})`,
						backgroundSize: "cover",
						backgroundPosition: "center top",
						backgroundRepeat: "no-repeat",
					}}
					className="absolute inset-0 opacity-20"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
				<div className="relative flex flex-col gap-6 px-0 py-6 md:p-8">
					<div className="flex flex-1 flex-col gap-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div className="flex items-end gap-4">
								<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-purple-500/10 sm:h-42 sm:w-42">
									<Image
										src={primaryPortrait}
										alt={tidyLabel(consolidated.name)}
										fill
										sizes={"256px"}
										className="object-cover"
										priority
									/>
								</div>
								<div>
									<h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
										{tidyLabel(consolidated.name)}
									</h1>
									<p className="text-base text-muted-foreground sm:text-lg">
										{consolidated.tagline}
									</p>
								</div>
							</div>
						</div>

						{/* Roles and Lanes */}
						<div className="flex flex-wrap gap-3">
							{consolidated.roles.filter((role) => tidyLabel(role.title).trim()).length > 0 && (
								<div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5">
									<span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
										Role
									</span>
									<div className="h-3 w-px bg-primary/20" />
									<div className="flex gap-1.5">
										{consolidated.roles
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
							{consolidated.lanes.filter((lane) => tidyLabel(lane.title).trim()).length > 0 && (
								<div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5">
									<span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
										Lane
									</span>
									<div className="h-3 w-px bg-amber-500/20" />
									<div className="flex gap-1.5">
										{consolidated.lanes
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
							{consolidated.difficulty && (
								<div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5  px-2.5 py-1.5">
									<span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
										Difficulty
									</span>
									<div className="h-3 w-px bg-purple-500/20" />
									<span className="text-xs font-semibold ">{consolidated.difficulty}/100</span>
								</div>
							)}
						</div>

						{/* Key Stats */}
						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							<div className="rounded-lg border bg-card p-2 sm:p-4">
								<div className="text-xs text-muted-foreground sm:text-sm">Win Rate</div>
								<div className="mt-1 text-lg font-bold text-green-500 sm:text-2xl">
									{((consolidated.win_rate ?? 0) * 100).toFixed(1)}%
								</div>
							</div>
							<div className="rounded-lg border bg-card p-2 sm:p-4">
								<div className="text-xs text-muted-foreground sm:text-sm">Pick Rate</div>
								<div className="mt-1 text-lg font-bold text-blue-500 sm:text-2xl">
									{((consolidated.pick_rate ?? 0) * 100).toFixed(1)}%
								</div>
							</div>
							<div className="rounded-lg border bg-card p-2 sm:p-4">
								<div className="text-xs text-muted-foreground sm:text-sm">Ban Rate</div>
								<div className="mt-1 text-lg font-bold text-red-500 sm:text-2xl">
									{((consolidated.ban_rate ?? 0) * 100).toFixed(1)}%
								</div>
							</div>
						</div>

						{/* Lore */}
						<Link
							href={wikiHref}
							className="group inline-block "
							aria-label={`Explore the complete wiki entry for ${tidyLabel(consolidated.name)}`}
						>
							<Card className="border border-border/70 bg-muted/40 transition-colors hover:border-primary/40 hover:bg-primary/5">
								<CardContent className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
										<BookOpen className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
									</div>
									<div className="flex-1">
										<h3 className="text-sm font-semibold sm:text-base">
											Explore the complete wiki
										</h3>
										<p className="text-xs text-muted-foreground sm:text-sm">
											Dive deeper into {tidyLabel(consolidated.name)}'s lore, strategies, builds,
											and community notes.
										</p>
									</div>
									<ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
								</CardContent>
							</Card>
						</Link>
					</div>
				</div>
			</div>

			{/* Story */}
			{consolidated.tale && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Story</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="leading-relaxed text-muted-foreground">{consolidated.tale}</p>
					</CardContent>
				</Card>
			)}

			{/* Skills */}
			{consolidated.skills && consolidated.skills.length > 0 && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Skills</CardTitle>
						<CardDescription>Hero abilities and their effects</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 sm:space-y-4">
						{consolidated.skills.map((skill, idx) => (
							<div
								key={idx}
								className="flex gap-3 rounded-lg border bg-card/50 p-3 sm:gap-4 sm:p-4"
							>
								<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-gradient-to-br from-amber-500/20 to-purple-500/20 sm:h-14 sm:w-14">
									<Image
										src={resolveImageSrc(skill.icon)}
										alt={tidyLabel(skill.name)}
										fill
										sizes={"256px"}
										className="object-cover"
									/>
								</div>
								<div className="flex-1 min-w-0">
									<div className="mb-1 flex flex-wrap items-center gap-2">
										<h4 className="font-semibold">{tidyLabel(skill.name)}</h4>
										{skill.tags && skill.tags.length > 0 && (
											<div className="flex flex-wrap gap-1">
												{skill.tags.map((tag, tagIdx) => (
													<span
														key={tagIdx}
														className="rounded bg-primary/10 px-1.5 py-0.5 text-xs uppercase tracking-wide"
													>
														{tag}
													</span>
												))}
											</div>
										)}
									</div>
									<p className="mb-2 text-sm text-muted-foreground">{skill.description}</p>
									<div className="flex flex-wrap gap-3 text-xs text-muted-foreground sm:gap-4">
										{skill.cd > 0 && <span>CD: {skill.cd}s</span>}
										{skill.mana > 0 && <span>Mana: {skill.mana}</span>}
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Relationships Grid */}
			<div className="mb-6 grid gap-6 lg:grid-cols-3">
				{/* Strong Against */}
				{consolidated.relation.strong_against &&
					consolidated.relation.strong_against.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Strong Against</CardTitle>
								<CardDescription>Heroes this hero counters</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{consolidated.relation.strong_against.map((relation, idx) => (
									<div key={idx}>
										<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
										<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
											{relation.heroes.map((h) => (
												<div
													key={h.id}
													className="group relative aspect-square overflow-hidden rounded"
												>
													<Image
														src={resolveImageSrc(h.image)}
														alt={tidyLabel(h.name)}
														fill
														sizes={"256px"}
														className="object-cover"
													/>
													<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
														<span className="block break-words text-[11px] font-medium leading-snug text-white">
															{tidyLabel(h.name)}
														</span>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}

				{/* Weak Against */}
				{consolidated.relation.weak_against && consolidated.relation.weak_against.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Weak Against</CardTitle>
							<CardDescription>Heroes that counter this hero</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{consolidated.relation.weak_against.map((relation, idx) => (
								<div key={idx}>
									<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
									<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
										{relation.heroes.map((h) => (
											<div
												key={h.id}
												className="group relative aspect-square overflow-hidden rounded"
											>
												<Image
													src={resolveImageSrc(h.image)}
													alt={tidyLabel(h.name)}
													fill
													sizes={"256px"}
													className="object-cover"
												/>
												<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
													<span className="block break-words text-[11px] font-medium leading-snug text-white">
														{tidyLabel(h.name)}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Compatible With */}
				{consolidated.relation.compatible_with &&
					consolidated.relation.compatible_with.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Compatible With</CardTitle>
								<CardDescription>Heroes that synergize well</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{consolidated.relation.compatible_with.map((relation, idx) => (
									<div key={idx}>
										<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
										<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
											{relation.heroes.map((h) => (
												<div
													key={h.id}
													className="group relative aspect-square overflow-hidden rounded"
												>
													<Image
														src={resolveImageSrc(h.image)}
														alt={tidyLabel(h.name)}
														fill
														sizes={"256px"}
														className="object-cover"
													/>
													<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
														<span className="block break-words text-[11px] font-medium leading-snug text-white">
															{tidyLabel(h.name)}
														</span>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}
			</div>

			{/* Matchup Statistics */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Best Teammates */}
				{consolidated.most_compatible && consolidated.most_compatible.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Best Teammates</CardTitle>
							<CardDescription>Heroes with highest win rate together</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.most_compatible.slice(0, 5).map((teammate) => (
									<div
										key={teammate.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image
												src={resolveImageSrc(teammate.image)}
												alt={tidyLabel(teammate.name)}
												fill
												sizes="256px"
												className="object-cover"
											/>
										</div>
										<div className="flex-1">
											<div className="font-medium">{tidyLabel(teammate.name)}</div>
											<div className="flex gap-2 text-xs">
												<StatLabel
													abbr="WR"
													full="Win Rate"
													value={`${(teammate.win_rate * 100).toFixed(1)}%`}
												/>
												<StatLabel
													abbr="PR"
													full="Pick Rate"
													value={`${(teammate.pick_rate * 100).toFixed(1)}%`}
												/>
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-green-500">
												+{(teammate.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Best Counters */}
				{consolidated.best_counter && consolidated.best_counter.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Countered By</CardTitle>
							<CardDescription>Heroes that counter this hero effectively</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.best_counter.slice(0, 5).map((counter) => (
									<div
										key={counter.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image
												src={resolveImageSrc(counter.image)}
												alt={tidyLabel(counter.name)}
												fill
												sizes="256px"
												className="object-cover"
											/>
										</div>
										<div className="flex-1">
											<div className="font-medium">{tidyLabel(counter.name)}</div>
											<div className="flex gap-2 text-xs">
												<StatLabel
													abbr="WR"
													full="Win Rate"
													value={`${(counter.win_rate * 100).toFixed(1)}%`}
												/>
												<StatLabel
													abbr="PR"
													full="Pick Rate"
													value={`${(counter.pick_rate * 100).toFixed(1)}%`}
												/>
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-red-500">
												{(counter.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Worst Matchups */}
				{consolidated.worst_counter && consolidated.worst_counter.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Best Against</CardTitle>
							<CardDescription>Heroes this hero performs well against</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.worst_counter.slice(0, 5).map((counter) => (
									<div
										key={counter.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image
												src={resolveImageSrc(counter.image)}
												alt={tidyLabel(counter.name)}
												fill
												sizes="256px"
												className="object-cover"
											/>
										</div>
										<div className="flex-1">
											<div className="font-medium">{tidyLabel(counter.name)}</div>
											<div className="flex gap-2 text-xs">
												<StatLabel
													abbr="WR"
													full="Win Rate"
													value={`${(counter.win_rate * 100).toFixed(1)}%`}
												/>
												<StatLabel
													abbr="PR"
													full="Pick Rate"
													value={`${(counter.pick_rate * 100).toFixed(1)}%`}
												/>
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-green-500">
												+{(counter.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Least Compatible */}
				{consolidated.least_compatible && consolidated.least_compatible.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Worst Teammates</CardTitle>
							<CardDescription>Heroes with lowest win rate together</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.least_compatible.slice(0, 5).map((teammate) => (
									<div
										key={teammate.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image
												src={resolveImageSrc(teammate.image)}
												alt={tidyLabel(teammate.name)}
												fill
												sizes="256px"
												className="object-cover"
											/>
										</div>
										<div className="flex-1">
											<div className="font-medium">{tidyLabel(teammate.name)}</div>
											<div className="flex gap-2 text-xs">
												<StatLabel
													abbr="WR"
													full="Win Rate"
													value={`${(teammate.win_rate * 100).toFixed(1)}%`}
												/>
												<StatLabel
													abbr="PR"
													full="Pick Rate"
													value={`${(teammate.pick_rate * 100).toFixed(1)}%`}
												/>
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-red-500">
												{(teammate.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
