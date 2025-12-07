import type { LucideIcon } from "lucide-react";
import { Ban, Crosshair, Minus, Target, TrendingDown, TrendingUp, Users } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StatsByRolesType } from "@repo/database";
import { UpdatedAtLabel } from "../_utils";
import { tidyLabel } from "@/lib/utils";

const rolePalette = {
	win: "var(--color-chart-1)",
	pick: "var(--color-chart-3)",
	ban: "var(--color-chart-5)",
	meta: "var(--color-chart-1)",
	weak: "var(--color-chart-5)",
	balanced: "var(--color-chart-3)",
	overlayStrength: 22, // percentage used in the gradient blend
	barBlend: 70, // percentage used in bar gradients
} as const;

const makeOverlay = (color: string) =>
	`linear-gradient(135deg, color-mix(in oklch, ${color} ${rolePalette.overlayStrength}%, transparent) 0%, transparent 70%)`;

const makeBar = (color: string) =>
	`linear-gradient(90deg, ${color} 0%, color-mix(in oklch, ${color} ${rolePalette.barBlend}%, transparent) 100%)`;

type StatsByRolesProps = {
	data: StatsByRolesType[];
	lastUpdated?: number;
	rank?: string;
};

export const StatsByRoles = ({ data, lastUpdated, rank }: StatsByRolesProps) => {
	if (!data?.length) return null;

	const sortedByWinRate = [...data].sort((a, b) => b.averageWinRate - a.averageWinRate);
	const sortedByBanRate = [...data].sort((a, b) => b.averageBanRate - a.averageBanRate);

	const avgWinRate = data.reduce((sum, d) => sum + d.averageWinRate, 0) / data.length;
	const avgPickRate = data.reduce((sum, d) => sum + d.averagePickRate, 0) / data.length;
	const avgBanRate = data.reduce((sum, d) => sum + d.averageBanRate, 0) / data.length;
	const totalHeroes = data.reduce((sum, d) => sum + Number(d.heroCount), 0);

	const topRole = sortedByWinRate[0];
	const bottomRole = sortedByWinRate[sortedByWinRate.length - 1];
	const mostBannedRole = sortedByBanRate[0];

	const winDelta = (topRole.averageWinRate - avgWinRate) * 100;
	const formattedWinDelta = `${winDelta >= 0 ? "+" : ""}${winDelta.toFixed(1)}%`;

	const summaryMetrics: {
		label: string;
		value: string;
		helper: string;
		accent: string;
		icon: LucideIcon;
	}[] = [
		{
			label: "Avg Win Rate",
			value: `${(avgWinRate * 100).toFixed(1)}%`,
			helper: `${totalHeroes} heroes across ${data.length} roles`,
			accent: rolePalette.win,
			icon: Target,
		},
		{
			label: "Avg Pick Rate",
			value: `${(avgPickRate * 100).toFixed(2)}%`,
			helper: "Share of overall drafts",
			accent: rolePalette.pick,
			icon: Crosshair,
		},
		{
			label: "Avg Ban Rate",
			value: `${(avgBanRate * 100).toFixed(1)}%`,
			helper: `${mostBannedRole.role}s draw the most bans`,
			accent: rolePalette.ban,
			icon: Ban,
		},
	];

	return (
		<div className="mb-12 flex flex-col space-y-6">
			<div className="mb-6">
				<div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-center gap-3">
						<h2 className="text-2xl font-bold">Role Performance</h2>
						{rank && (
							<Badge variant="outline" className="text-xs">
								{tidyLabel(rank)}
							</Badge>
						)}
					</div>
					{lastUpdated && <UpdatedAtLabel date={lastUpdated} />}
				</div>
				<p className="text-sm text-muted-foreground sm:text-base">
					Track win, pick, and ban rates by role to pair with Meta Picks and Hidden Gems. Updated in
					real-time for your current rank filter.
				</p>
			</div>

			<div className="space-y-6">
				<div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
					<Card className="border-border/80 bg-card/70">
						<CardHeader className="space-y-4">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<div className="flex items-start gap-3">
									<div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
										<CardTitle className="text-base font-semibold text-foreground">
											Meta Insights
										</CardTitle>
										<CardDescription className="space-y-1 text-sm leading-relaxed text-muted-foreground">
											<p>
												<span className="font-semibold capitalize text-foreground">
													{tidyLabel(topRole.role)}s
												</span>{" "}
												are holding the ladder at {(topRole.averageWinRate * 100).toFixed(1)}% win
												rate, while{" "}
												<span className="font-semibold capitalize text-foreground">
													{tidyLabel(bottomRole.role)}s
												</span>{" "}
												lag behind at {(bottomRole.averageWinRate * 100).toFixed(1)}%.
											</p>
											<p>
												Ban pressure still targets{" "}
												<span className="font-semibold capitalize text-foreground">
													{tidyLabel(mostBannedRole.role)}s
												</span>
												, signalling the role most feared in competitive matches.
											</p>
										</CardDescription>
									</div>
								</div>
								<Badge variant="outline" className="divide-x divide-border/40 bg-muted/30 text-xs">
									<div className="px-3 py-1.5">
										<span className="font-semibold text-foreground">{data.length}</span>
										<span className="ml-1 text-muted-foreground">roles</span>
									</div>
									<div className="px-3 py-1.5">
										<span className="font-semibold text-foreground">{totalHeroes}</span>
										<span className="ml-1 text-muted-foreground">heroes</span>
									</div>
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								{summaryMetrics.map(({ label, value, helper, accent, icon: Icon }) => (
									<Card key={label} className="border-border/70 bg-background/80 py-4">
										<CardHeader className="flex flex-row items-center gap-3 px-4">
											<div className="rounded-lg border border-border/60 bg-muted/40 p-2 text-muted-foreground">
												<Icon className="h-4 w-4" />
											</div>
											<div>
												<CardDescription className="text-[11px] uppercase tracking-wide">
													{label}
												</CardDescription>
												<CardTitle className="text-xl font-semibold" style={{ color: accent }}>
													{value}
												</CardTitle>
											</div>
										</CardHeader>
										<CardContent className="px-4 pt-0">
											<p className="text-xs text-muted-foreground">{helper}</p>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					<Card className="border-border/80 bg-card/70">
						<CardHeader className="space-y-4">
							<div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
								<CardDescription className="text-[11px] uppercase tracking-wide text-muted-foreground">
									Meta Leader
								</CardDescription>
								<div className="flex items-center gap-1" style={{ color: rolePalette.meta }}>
									<TrendingUp className="h-4 w-4" />
									<span>{formattedWinDelta} vs avg</span>
								</div>
							</div>
							<div>
								<CardTitle className="text-3xl capitalize leading-tight">{topRole.role}s</CardTitle>
								<CardDescription className="text-sm">
									{topRole.heroCount} heroes • {(topRole.averagePickRate * 100).toFixed(2)}% pick
									share
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-3 gap-3 text-sm">
								{[
									{
										label: "Win",
										value: `${(topRole.averageWinRate * 100).toFixed(1)}%`,
										accent: rolePalette.win,
									},
									{
										label: "Pick",
										value: `${(topRole.averagePickRate * 100).toFixed(2)}%`,
										accent: rolePalette.pick,
									},
									{
										label: "Ban",
										value: `${(topRole.averageBanRate * 100).toFixed(1)}%`,
										accent: rolePalette.ban,
									},
								].map(({ label, value, accent }) => (
									<Card key={label} className="border-border/70 bg-background/70 py-3">
										<CardHeader className="px-4 py-0">
											<CardDescription className="text-[11px] uppercase tracking-wide">
												{label}
											</CardDescription>
											<CardTitle className="text-lg font-semibold" style={{ color: accent }}>
												{value}
											</CardTitle>
										</CardHeader>
									</Card>
								))}
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Consistent performance keeps {topRole.role.toLowerCase()} picks{" "}
								<span className="font-semibold text-foreground">{formattedWinDelta}</span> above the
								field, making them priority selections or prime ban targets.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{sortedByWinRate.map((stat, index) => {
					const winRate = stat.averageWinRate * 100;
					const pickRate = stat.averagePickRate * 100;
					const banRate = stat.averageBanRate * 100;

					const isDominating = winRate >= 51;
					const isStruggling = winRate < 49;

					const status = isDominating ? "Meta" : isStruggling ? "Weak" : "Balanced";
					const StatusIcon = isDominating ? TrendingUp : isStruggling ? TrendingDown : Minus;
					const statusColor = isDominating
						? rolePalette.meta
						: isStruggling
							? rolePalette.weak
							: rolePalette.balanced;
					const overlayGradient = makeOverlay(statusColor);

					return (
						<Card key={stat.role} className="relative overflow-hidden border-border/80 bg-card/80">
							<div
								className="pointer-events-none absolute inset-0 opacity-50"
								style={{ backgroundImage: overlayGradient }}
								aria-hidden
							/>
							<CardHeader className="relative z-10 space-y-2">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="flex items-center gap-3">
											<CardTitle className="text-2xl font-bold capitalize">{stat.role}s</CardTitle>
											{index === 0 && (
												<Badge
													variant="outline"
													className="text-xs"
													style={{
														color: rolePalette.meta,
														borderColor: `color-mix(in oklch, ${rolePalette.meta} 40%, transparent)`,
													}}
												>
													#1
												</Badge>
											)}
										</div>
										<CardDescription className="mt-1 flex items-center gap-2 text-sm">
											<Users className="h-4 w-4" />
											<span>{stat.heroCount} heroes in pool</span>
										</CardDescription>
									</div>
									<Badge
										variant="outline"
										className="bg-background/80 text-xs"
										style={{
											color: statusColor,
											borderColor: `color-mix(in oklch, ${statusColor} 40%, transparent)`,
										}}
									>
										<StatusIcon className="mr-1 h-3.5 w-3.5" />
										{status}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="relative z-10 space-y-4">
								<div className="space-y-2">
									<div className="flex items-baseline justify-between">
										<span className="text-sm font-medium text-foreground/80">Win Rate</span>
										<span className="font-mono text-lg font-bold" style={{ color: statusColor }}>
											{winRate.toFixed(1)}%
										</span>
									</div>
									<div className="relative h-3 rounded-full bg-muted">
										<div
											className="absolute inset-y-0 left-0 rounded-full transition-all"
											style={{
												width: `${winRate}%`,
												background: makeBar(rolePalette.win),
											}}
										/>
										<div className="absolute inset-y-0 left-1/2 w-px bg-foreground/20" />
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-baseline justify-between">
										<span className="text-sm font-medium text-foreground/80">Pick Rate</span>
										<span
											className="font-mono text-base font-semibold"
											style={{ color: rolePalette.pick }}
										>
											{pickRate.toFixed(2)}%
										</span>
									</div>
									<div className="h-2.5 rounded-full bg-muted">
										<div
											className="h-full rounded-full"
											style={{
												width: `${Math.min(pickRate * 10, 100)}%`,
												background: makeBar(rolePalette.pick),
											}}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-baseline justify-between">
										<span className="text-sm font-medium text-foreground/80">Ban Rate</span>
										<span
											className="font-mono text-base font-semibold"
											style={{ color: rolePalette.ban }}
										>
											{banRate.toFixed(1)}%
										</span>
									</div>
									<div className="h-2.5 rounded-full bg-muted">
										<div
											className="h-full rounded-full"
											style={{ width: `${banRate}%`, background: makeBar(rolePalette.ban) }}
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter className="relative z-10 border-t border-border/70 pt-4">
								<p className="text-xs text-muted-foreground leading-relaxed">
									{isDominating &&
										"Strong competitive presence with above-average win rate. Consider prioritizing these heroes in draft."}
									{isStruggling &&
										"Below optimal performance. May require team coordination or specific matchup knowledge to succeed."}
									{!isDominating &&
										!isStruggling &&
										"Well-balanced role with stable win rate. Reliable picks for consistent performance."}
								</p>
							</CardFooter>
						</Card>
					);
				})}
			</div>
		</div>
	);
};
