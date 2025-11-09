import type { ConsolidatedHero, MlMatchupSummary } from "@repo/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tidyLabel } from "@/lib/utils";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { resolveImageSrc } from "./header.hero";

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

export const HeroMatchup = ({ data }: { data: MlMatchupSummary }) => {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Best Teammates */}
			{data.most_compatible && data.most_compatible.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Best Teammates</CardTitle>
						<CardDescription>Heroes with highest win rate together</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{data.most_compatible.slice(0, 5).map((teammate) => (
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

			{/* Worst Matchups */}
			{data.worst_counter && data.worst_counter.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Best Against</CardTitle>
						<CardDescription>Heroes this hero performs well against</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{data.worst_counter.slice(0, 5).map((counter) => (
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
			{data.least_compatible && data.least_compatible.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Worst Teammates</CardTitle>
						<CardDescription>Heroes with lowest win rate together</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{data.least_compatible.slice(0, 5).map((teammate) => (
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

			{/* Best Counters */}
			{data.best_counter && data.best_counter.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Countered By</CardTitle>
						<CardDescription>Heroes that counter this hero effectively</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{data.best_counter.slice(0, 5).map((counter) => (
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
		</div>
	);
};
