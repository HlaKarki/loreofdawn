import { Suspense } from "react";
import { DataTable } from "./_components/data-table";
import { TABLE_CONFIG } from "./_config/table-styles";
import { TableSkeleton } from "./_components/table-skeleton";
import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { UpdatedAtLabel } from "../(landing)/_utils";
import { RankSelector } from "./_components/rank-selector";
import { BarChart3, Crown, Scale, Ghost } from "lucide-react";

export const dynamic = "force-dynamic";

async function StatsContent({ rank }: { rank: string }) {
	// fetch real data
	const tableDataResponse = await fetch(makeUrl(`/v1/heroes/table?rank=${rank}`));
	const tableData = (await tableDataResponse.json()) as ConsolidatedHeroOptional[];

	// Calculate overview stats using centralized config
	const totalHeroes = tableData.length;
	const balancedHeroes = tableData.filter(
		(h) =>
			h.meta.win_rate >= TABLE_CONFIG.overview.balancedHeroes.min &&
			h.meta.win_rate <= TABLE_CONFIG.overview.balancedHeroes.max,
	).length;
	const metaKings = tableData.filter(
		(h) => h.meta.ban_rate > TABLE_CONFIG.overview.metaKings.min,
	).length;
	const forgottenHeroes = tableData.filter(
		(h) => h.meta.pick_rate < TABLE_CONFIG.overview.forgottenHeroes.max,
	).length;

	const overviewCards = [
		{
			label: "Total Heroes",
			value: totalHeroes,
			description: "In the roster",
			icon: BarChart3,
			accent: "text-foreground",
			iconBg: "bg-amber-500/10",
			iconColor: "text-amber-600",
		},
		{
			label: "Balanced",
			value: balancedHeroes,
			description: `${TABLE_CONFIG.overview.balancedHeroes.min * 100}-${TABLE_CONFIG.overview.balancedHeroes.max * 100}% WR`,
			icon: Scale,
			accent: "text-amber-600 dark:text-amber-400",
			iconBg: "bg-amber-500/10",
			iconColor: "text-amber-600",
		},
		{
			label: "Meta Kings",
			value: metaKings,
			description: `>${TABLE_CONFIG.overview.metaKings.min * 100}% Ban Rate`,
			icon: Crown,
			accent: "text-emerald-600 dark:text-emerald-400",
			iconBg: "bg-emerald-500/10",
			iconColor: "text-emerald-600",
		},
		{
			label: "Forgotten",
			value: forgottenHeroes,
			description: `<${TABLE_CONFIG.overview.forgottenHeroes.max * 100}% Pick Rate`,
			icon: Ghost,
			accent: "text-rose-600 dark:text-rose-400",
			iconBg: "bg-rose-500/10",
			iconColor: "text-rose-600",
		},
	];

	return (
		<>
			{/* Header */}
			<header className="flex flex-col gap-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Hero{" "}
							<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
								Statistics
							</span>
						</h1>
						<p className="mt-1 text-muted-foreground">
							Compare win rates, pick rates, and ban rates across all heroes
						</p>
					</div>
					<div className="flex items-center gap-3">
						<UpdatedAtLabel date={tableData[0].meta.updatedAt} />
						<RankSelector />
					</div>
				</div>
			</header>

			{/* Overview Cards */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				{overviewCards.map((card) => (
					<div
						key={card.label}
						className="rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-accent/5"
					>
						<div className="mb-3 flex items-center justify-between">
							<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{card.label}
							</span>
							<div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
								<card.icon className={`h-4 w-4 ${card.iconColor}`} />
							</div>
						</div>
						<div className={`text-2xl font-bold sm:text-3xl ${card.accent}`}>{card.value}</div>
						<p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
					</div>
				))}
			</div>

			{/* Full Hero Table */}
			<DataTable data={tableData} rank={rank} />
		</>
	);
}

export default async function StatsPage({
	searchParams,
}: {
	searchParams: Promise<{ rank?: string }>;
}) {
	const params = await searchParams;
	const rank = params.rank || "glory";

	return (
		<div className="mx-auto flex w-full max-w-screen sm:max-w-7xl flex-col gap-6 overflow-x-hidden px-4 pb-16 pt-8 sm:gap-8 sm:px-6 lg:px-8">
			<Suspense fallback={<TableSkeleton />}>
				<StatsContent rank={rank} />
			</Suspense>
		</div>
	);
}
