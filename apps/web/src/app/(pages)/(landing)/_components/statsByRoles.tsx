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
import { cn } from "@/lib/utils";
import type { StatsByRolesResponse } from "../page";
import { UpdatedAtLabel } from "../_utils";

export const StatsByRoles = ({ data, lastUpdated, rank }: StatsByRolesResponse) => {
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
			helper: `Across ${data.length} tracked roles`,
			accent: "text-chart-1",
			icon: Target,
		},
		{
			label: "Avg Pick Rate",
			value: `${(avgPickRate * 100).toFixed(2)}%`,
			helper: "Normalized share of drafts per role",
			accent: "text-chart-3",
			icon: Crosshair,
		},
		{
			label: "Avg Ban Rate",
			value: `${(avgBanRate * 100).toFixed(1)}%`,
			helper: `${mostBannedRole.role}s draw the most bans`,
			accent: "text-chart-5",
			icon: Ban,
		},
	];

	const displayRank = rank ? `${rank.charAt(0).toUpperCase()}${rank.slice(1)} Rank` : "Live Meta";

	return (
		<div className="space-y-8">
			<div className="space-y-4">
				<Badge
					variant="secondary"
					className="gap-2 border border-accent-foreground/10 bg-accent/40 px-3 py-1 text-xs font-semibold text-accent-foreground"
				>
					<span className="h-2 w-2 rounded-full bg-chart-1/90 shadow-[0_0_8px] shadow-chart-1/40 animate-pulse" />
					{displayRank} • Live Meta
				</Badge>

				<div>
					<h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
						Role Performance Analytics
					</h1>
					<p className="text-pretty text-lg text-muted-foreground">
						Real-time competitive statistics across {data.length} hero roles. Discover which classes
						dominate the meta and optimize your champion pool accordingly.
					</p>
					{lastUpdated && <UpdatedAtLabel date={lastUpdated} />}
				</div>

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
													{topRole.role}s
												</span>{" "}
												are holding the ladder at {(topRole.averageWinRate * 100).toFixed(1)}% win
												rate, while{" "}
												<span className="font-semibold capitalize text-foreground">
													{bottomRole.role}s
												</span>{" "}
												lag behind at {(bottomRole.averageWinRate * 100).toFixed(1)}%.
											</p>
											<p>
												Ban pressure still targets{" "}
												<span className="font-semibold capitalize text-foreground">
													{mostBannedRole.role}s
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
												<CardTitle className={cn("text-xl font-semibold", accent)}>
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
								<div className="flex items-center gap-1 text-chart-1">
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
										accent: "text-chart-1",
									},
									{
										label: "Pick",
										value: `${(topRole.averagePickRate * 100).toFixed(2)}%`,
										accent: "text-chart-3",
									},
									{
										label: "Ban",
										value: `${(topRole.averageBanRate * 100).toFixed(1)}%`,
										accent: "text-chart-5",
									},
								].map(({ label, value, accent }) => (
									<Card key={label} className="border-border/70 bg-background/70 py-3">
										<CardHeader className="px-4 py-0">
											<CardDescription className="text-[11px] uppercase tracking-wide">
												{label}
											</CardDescription>
											<CardTitle className={cn("text-lg font-semibold", accent)}>{value}</CardTitle>
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
						? "text-chart-1"
						: isStruggling
							? "text-chart-5"
							: "text-chart-3";

					const gradient = isDominating
						? "from-chart-1/20 to-transparent"
						: isStruggling
							? "from-chart-5/20 to-transparent"
							: "from-chart-3/20 to-transparent";

					return (
						<Card key={stat.role} className="relative overflow-hidden border-border/80 bg-card/80">
							<div
								className={cn(
									"pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50",
									gradient,
								)}
								aria-hidden
							/>
							<CardHeader className="relative z-10 space-y-2">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="flex items-center gap-3">
											<CardTitle className="text-2xl font-bold capitalize">{stat.role}s</CardTitle>
											{index === 0 && (
												<Badge variant="outline" className="border-chart-1/40 text-chart-1">
													#1
												</Badge>
											)}
										</div>
										<CardDescription className="mt-1 flex items-center gap-2 text-sm">
											<Users className="h-4 w-4" />
											<span>{stat.heroCount} heroes in pool</span>
										</CardDescription>
									</div>
									<Badge variant="outline" className={cn("bg-background/80 text-xs", statusColor)}>
										<StatusIcon className="mr-1 h-3.5 w-3.5" />
										{status}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="relative z-10 space-y-4">
								<div className="space-y-2">
									<div className="flex items-baseline justify-between">
										<span className="text-sm font-medium text-foreground/80">Win Rate</span>
										<span className={cn("font-mono text-lg font-bold", statusColor)}>
											{winRate.toFixed(1)}%
										</span>
									</div>
									<div className="relative h-3 rounded-full bg-muted">
										<div
											className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-chart-1 to-chart-1/80 transition-all"
											style={{ width: `${winRate}%` }}
										/>
										<div className="absolute inset-y-0 left-1/2 w-px bg-foreground/20" />
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-baseline justify-between">
										<span className="text-sm font-medium text-foreground/80">Pick Rate</span>
										<span className="font-mono text-base font-semibold text-chart-3">
											{pickRate.toFixed(2)}%
										</span>
									</div>
									<div className="h-2.5 rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-gradient-to-r from-chart-3 to-chart-3/80"
											style={{ width: `${Math.min(pickRate * 10, 100)}%` }}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-baseline justify-between">
										<span className="text-sm font-medium text-foreground/80">Ban Rate</span>
										<span className="font-mono text-base font-semibold text-chart-5">
											{banRate.toFixed(1)}%
										</span>
									</div>
									<div className="h-2.5 rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-gradient-to-r from-chart-5 to-chart-5/80"
											style={{ width: `${banRate}%` }}
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
